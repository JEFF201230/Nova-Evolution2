Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (
    Join-Path $PSScriptRoot 'Cerebrau.DomainOrchestration.psm1'
) -Force
Import-Module (
    Join-Path $PSScriptRoot 'Cerebrau.Certification.psm1'
) -Force
Import-Module (
    Join-Path $PSScriptRoot 'NovaCore.Governance.psm1'
) -Force

$results = [Collections.Generic.List[object]]::new()
$temporaryRoots = [Collections.Generic.List[string]]::new()
$utf8 = [Text.UTF8Encoding]::new($false)

function Add-TestResult {
    param([string]$Name,[bool]$Passed,[string]$Detail)
    $results.Add([PSCustomObject]@{
        Name = $Name
        Passed = $Passed
        Detail = $Detail
    })
}

function Invoke-TestCase {
    param([string]$Name,[scriptblock]$Action)
    try {
        & $Action
        Add-TestResult $Name $true $null
    }
    catch {
        Add-TestResult $Name $false $_.Exception.Message
    }
}

function Assert-True {
    param([bool]$Condition,[string]$Message='ASSERT_TRUE_FAILED')
    if (-not $Condition) { throw $Message }
}

function Assert-False {
    param([bool]$Condition,[string]$Message='ASSERT_FALSE_FAILED')
    if ($Condition) { throw $Message }
}

function Assert-Equal {
    param($Expected,$Actual,[string]$Message='ASSERT_EQUAL_FAILED')
    if ([string]$Expected -cne [string]$Actual) {
        throw "$Message`:EXPECTED=$Expected;ACTUAL=$Actual"
    }
}

function Assert-Throws {
    param([scriptblock]$Action,[string]$Pattern)
    $message = $null
    try { & $Action } catch { $message = $_.Exception.Message }
    if ($null -eq $message) {
        throw "EXPECTED_EXCEPTION_NOT_THROWN:$Pattern"
    }
    if ($message -notlike $Pattern) {
        throw "EXPECTED_EXCEPTION_MISMATCH:$Pattern`:ACTUAL=$message"
    }
}

function Write-TestText {
    param([string]$Path,[string]$Content)
    $parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    [IO.File]::WriteAllText($Path, $Content, $utf8)
}

function Write-TestJson {
    param([string]$Path,$Value)
    Write-TestText $Path (($Value | ConvertTo-Json -Depth 30) + "`n")
}

function New-TestCertification {
    param(
        [string]$LotId,
        [string]$Status,
        [AllowNull()][object]$PreviousLot,
        [AllowNull()][object]$NextLot,
        [object[]]$Evidence = @(),
        [object[]]$Tests = @()
    )
    $evidenceValues = [object[]]@($Evidence)
    $testValues = [object[]]@($Tests)
    if ($Status -eq 'CERTIFIED' -and $evidenceValues.Count -eq 0) {
        $evidenceValues = [object[]]@('evidence:verified')
    }
    if ($Status -eq 'CERTIFIED' -and $testValues.Count -eq 0) {
        $testValues = [object[]]@('tests:pass')
    }
    return [PSCustomObject][ordered]@{
        MissionId = "TEST-$LotId"
        DomainId = 'TEST'
        LotId = $LotId
        Status = $Status
        CertifiedAt = $(if ($Status -eq 'CERTIFIED') {
            '2026-07-30T22:00:00.000Z'
        } else { $null })
        Evidence = $evidenceValues
        Tests = $testValues
        Regressions = $(if ($Status -eq 'CERTIFIED') {
            'NONE'
        } else { 'NOT_EVALUATED' })
        PreviousLot = $PreviousLot
        NextAuthorizedLot = $NextLot
    }
}

function New-TestRepository {
    param([switch]$IncompleteContract)
    $root = Join-Path ([IO.Path]::GetTempPath()) (
        'cerebrau-domain-v2-' + [guid]::NewGuid().ToString('N')
    )
    $temporaryRoots.Add($root)
    New-Item -ItemType Directory -Path (
        Join-Path $root 'Docs/12_CERTIFICATION'
    ) -Force | Out-Null
    $blueprintPath = Join-Path $root 'Docs/contracts/TEST_DOMAIN_BLUEPRINT.md'
    Write-TestText $blueprintPath @'
# TEST DOMAIN BLUEPRINT

Canonical test blueprint.
'@
    $gateB = if ($IncompleteContract) {
        ''
    } else {
        '| TEST-B | TEST-A GO | only TEST producer and tests | TestAuthority unique; tests PASS; report GO |'
    }
    $contract = @"
# TEST IMPLEMENTATION CONTRACT

| Attribute | Value |
|---|---|
| Lot | TEST-A |
| Authority | ``TEST_DOMAIN_BLUEPRINT.md`` |

**VERDICT : GO**

NEXT AUTHORIZED LOT : TEST-B

### 1.3 Out of scope

- APIs
- other domains

### 2.2 Allowed dependencies

- TEST foundation

### 2.3 Forbidden dependencies

- technical agents

### 14.7 Non-negotiable invariants

1. TEST state is authoritative.

## 15. TEST CONTRACT

| Category | Required coverage |
|---|---|
| Tests unit | invariants and boundaries |
| Typecheck | affected scope |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Accepted order

| Order | Sub-lot | Objective | Authorized deliverable |
|---|---|---|---|
| 1 | TEST-B - Authoritative Producer | establish the producer | TestAuthority |
| 2 | TEST-C - Persistence | establish persistence | TestPersistence |

### 16.2 Rationale

Sequential only.

## 17. ENTRY AND EXIT GATES

### 17.2 Lot gates

| Sub-lot | Entry | Authorized files | Exit |
|---|---|---|---|
$gateB
| TEST-C | TEST-B GO | only TEST persistence and tests | TestPersistence unique; tests PASS; report GO |
"@
    $contractPath = Join-Path $root 'Docs/contracts/TEST_IMPLEMENTATION_CONTRACT.md'
    Write-TestText $contractPath $contract
    $registry = [PSCustomObject][ordered]@{
        SchemaVersion = 1
        Entries = [object[]]@(
            [PSCustomObject][ordered]@{
                DomainId = 'TEST'
                LotId = 'TEST-A'
                CertificationPath = 'Docs/contracts/TEST_IMPLEMENTATION_CONTRACT.md'
                Status = 'CERTIFIED'
                PreviousLot = $null
                NextAuthorizedLot = 'TEST-B'
            }
        )
    }
    Write-TestJson (
        Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
    ) $registry
    return $root
}

function Add-TestLot {
    param(
        [string]$Repository,
        [string]$LotId,
        [string]$Status,
        [string]$PreviousLot,
        [AllowNull()][object]$NextLot,
        [object[]]$Evidence = @()
    )
    [void](Write-LotCertification `
        -Repository $Repository `
        -Certification (
            New-TestCertification `
                -LotId $LotId `
                -Status $Status `
                -PreviousLot $PreviousLot `
                -NextLot $NextLot `
                -Evidence $Evidence
        ))
}

function Add-TestProducerCode {
    param([string]$Repository)
    $relative = 'server/domain/test/test-producer.ts'
    Write-TestText (Join-Path $Repository $relative) @'
export class TestAuthority {
  readonly authority = "TEST";
}
'@
    return $relative
}

function Get-TestFileSnapshot {
    param([string]$Root)
    $value = @{}
    if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
        return $value
    }
    foreach ($file in @(Get-ChildItem -LiteralPath $Root -Recurse -File)) {
        $value[$file.FullName] = (
            Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256
        ).Hash
    }
    return $value
}

function Assert-SnapshotEqual {
    param($Expected,$Actual,[string]$Message='SNAPSHOT_CHANGED')
    Assert-Equal $Expected.Count $Actual.Count $Message
    foreach ($key in $Expected.Keys) {
        Assert-True $Actual.ContainsKey($key) $Message
        Assert-Equal $Expected[$key] $Actual[$key] $Message
    }
}

function New-TestMissionOutcome {
    param(
        [string]$OfficialStatus = 'SUCCESS',
        [AllowEmptyString()][string]$AuthorityDecision = 'ACCEPTED',
        [string]$FinalMissionState = 'COMPLETED',
        [int]$ExitCode = 0,
        [ValidateSet('VALID','INVALID','ABSENT')]
        [string]$EvidenceState = 'VALID',
        [ValidateSet('PASS','FAIL','ABSENT')]
        [string]$TestsState = 'PASS',
        [AllowNull()][object]$Regressions = 'NONE',
        [AllowNull()][object]$ContractCriteriaSatisfied = $true,
        [switch]$ReportAbsent
    )
    $tests = switch ($TestsState) {
        'PASS' {
            [object[]]@([PSCustomObject]@{
                Name = 'required-validation'
                Required = $true
                Passed = $true
            })
        }
        'FAIL' {
            [object[]]@([PSCustomObject]@{
                Name = 'required-validation'
                Required = $true
                Passed = $false
            })
        }
        default { [object[]]@() }
    }
    $evidence = switch ($EvidenceState) {
        'VALID' {
            [PSCustomObject]@{
                status = 'VALID'
                capturedAfterExecution = $true
                entries = [object[]]@([PSCustomObject]@{
                    evidenceId = 'VALIDATION:required-validation'
                    status = 'VALID'
                })
                registryFingerprint = 'evidence-fingerprint'
            }
        }
        'INVALID' {
            [PSCustomObject]@{
                status = 'INVALID'
                capturedAfterExecution = $true
                entries = [object[]]@([PSCustomObject]@{
                    evidenceId = 'VALIDATION:required-validation'
                    status = 'INVALID'
                })
                registryFingerprint = 'invalid-evidence-fingerprint'
            }
        }
        default { $null }
    }
    $report = if ($ReportAbsent) {
        $null
    }
    else {
        $value = [PSCustomObject]@{
            Status = $OfficialStatus
            AuthorityDecision = $AuthorityDecision
            FinalMissionState = $FinalMissionState
            Codex = [PSCustomObject]@{ ExitCode = $ExitCode }
            OutputEvidence = $evidence
            Validations = [object[]]@($tests)
            ReportFingerprint = $null
        }
        $value.ReportFingerprint = Get-NovaCoreOfficialReportFingerprint `
            -Report $value
        $value
    }
    return [PSCustomObject]@{
        OfficialStatus = $OfficialStatus
        AuthorityDecision = $AuthorityDecision
        FinalMissionState = $FinalMissionState
        ExitCode = $ExitCode
        OfficialReport = $report
        Evidence = $evidence
        Tests = [object[]]@($tests)
        Regressions = $Regressions
        ContractCriteriaSatisfied = $ContractCriteriaSatisfied
    }
}

function Resolve-TestMissionOutcome {
    param(
        [Parameter(Mandatory)]$Outcome,
        [string]$ExecutionMode = 'IMPLEMENTATION'
    )
    return Resolve-MissionOutcomeToLotCertificationDecision `
        -ExecutionMode $ExecutionMode `
        -OfficialStatus $Outcome.OfficialStatus `
        -AuthorityDecision $Outcome.AuthorityDecision `
        -FinalMissionState $Outcome.FinalMissionState `
        -ExitCode $Outcome.ExitCode `
        -OfficialReport $Outcome.OfficialReport `
        -Evidence $Outcome.Evidence `
        -Tests $Outcome.Tests `
        -Regressions $Outcome.Regressions `
        -ContractCriteriaSatisfied $Outcome.ContractCriteriaSatisfied
}

try {
    Invoke-TestCase 'policy-success-accepted-completed-certifies' {
        $decision = Resolve-TestMissionOutcome (New-TestMissionOutcome)
        Assert-Equal 'CERTIFIED' $decision.Decision
        Assert-True $decision.InvokeCompleteDomainLot
        Assert-False $decision.RetryAllowed
    }

    Invoke-TestCase 'policy-ready-accepted-completed-certifies' {
        $outcome = New-TestMissionOutcome `
            -OfficialStatus READY_FOR_REVIEW `
            -Regressions 'NON_BLOCKING:documented'
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'CERTIFIED' $decision.Decision
    }

    Invoke-TestCase 'policy-success-pending-review-remains-pending' {
        $outcome = New-TestMissionOutcome `
            -AuthorityDecision PENDING_REVIEW `
            -FinalMissionState READY_FOR_REVIEW
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'PENDING_REVIEW' $decision.Decision
        Assert-Equal 'KEEP_PENDING_EVIDENCE' $decision.RegistryTransition
    }

    Invoke-TestCase 'policy-ready-without-final-authority-remains-pending' {
        $outcome = New-TestMissionOutcome `
            -OfficialStatus READY_FOR_REVIEW `
            -AuthorityDecision '' `
            -FinalMissionState READY_FOR_REVIEW
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'PENDING_REVIEW' $decision.Decision
    }

    Invoke-TestCase 'policy-authority-rejection-rejects' {
        $outcome = New-TestMissionOutcome `
            -AuthorityDecision REJECTED `
            -FinalMissionState REJECTED
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'REJECTED' $decision.Decision
        Assert-True $decision.InvokeCompleteDomainLot
    }

    Invoke-TestCase 'policy-absent-evidence-rejects' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -EvidenceState ABSENT
        )
        Assert-Equal 'REJECTED' $decision.Decision
        Assert-Equal 'CERTIFICATION_EVIDENCE_ABSENT' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-invalid-evidence-rejects' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -EvidenceState INVALID
        )
        Assert-Equal 'REJECTED' $decision.Decision
        Assert-Equal 'CERTIFICATION_EVIDENCE_INVALID' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-absent-required-tests-rejects' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -TestsState ABSENT
        )
        Assert-Equal 'REJECTED' $decision.Decision
        Assert-Equal 'REQUIRED_TESTS_ABSENT_OR_INVALID' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-failed-required-test-rejects' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -TestsState FAIL
        )
        Assert-Equal 'REJECTED' $decision.Decision
        Assert-Equal 'REQUIRED_TEST_FAILED' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-blocking-regression-rejects' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -Regressions 'BLOCKING:regression'
        )
        Assert-Equal 'REJECTED' $decision.Decision
        Assert-Equal 'BLOCKING_REGRESSION_DETECTED' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-unsatisfied-contract-rejects' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -ContractCriteriaSatisfied $false
        )
        Assert-Equal 'REJECTED' $decision.Decision
        Assert-Equal 'LOT_CONTRACT_CRITERIA_NOT_SATISFIED' $decision.ReasonCode
    }

    foreach ($technicalStatus in @('FAILED','PARTIAL','BLOCKED')) {
        Invoke-TestCase "policy-$technicalStatus-is-execution-failed" {
            $authority = if ($technicalStatus -eq 'FAILED') {
                'NOT_APPLICABLE'
            } else {
                'REJECTED'
            }
            $final = if ($technicalStatus -eq 'FAILED') {
                'FAILED'
            } else {
                'REJECTED'
            }
            $outcome = New-TestMissionOutcome `
                -OfficialStatus $technicalStatus `
                -AuthorityDecision $authority `
                -FinalMissionState $final
            $decision = Resolve-TestMissionOutcome $outcome
            Assert-Equal 'EXECUTION_FAILED' $decision.Decision
            Assert-False $decision.InvokeCompleteDomainLot
        }
    }

    Invoke-TestCase 'policy-non-zero-exit-is-execution-failed' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -ExitCode 1
        )
        Assert-Equal 'EXECUTION_FAILED' $decision.Decision
        Assert-Equal 'MISSION_EXIT_CODE_NON_ZERO' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-absent-report-is-execution-failed' {
        $decision = Resolve-TestMissionOutcome (
            New-TestMissionOutcome -ReportAbsent
        )
        Assert-Equal 'EXECUTION_FAILED' $decision.Decision
        Assert-Equal 'OFFICIAL_REPORT_INVALID_OR_ABSENT' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-altered-report-is-execution-failed' {
        $outcome = New-TestMissionOutcome
        $outcome.OfficialReport.ReportFingerprint = 'altered'
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'EXECUTION_FAILED' $decision.Decision
        Assert-Equal 'OFFICIAL_REPORT_INVALID_OR_ABSENT' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-incoherent-tuple-is-execution-failed' {
        $outcome = New-TestMissionOutcome `
            -AuthorityDecision ACCEPTED `
            -FinalMissionState REJECTED
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'EXECUTION_FAILED' $decision.Decision
        Assert-Equal 'OUTCOME_CONTRACT_INVALID' $decision.ReasonCode
    }

    Invoke-TestCase 'policy-coherent-cancellation-is-cancelled' {
        $outcome = New-TestMissionOutcome `
            -OfficialStatus CANCELLED `
            -AuthorityDecision NOT_APPLICABLE `
            -FinalMissionState CANCELLED `
            -ExitCode 130
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'CANCELLED' $decision.Decision
        Assert-False $decision.InvokeCompleteDomainLot
    }

    Invoke-TestCase 'policy-incoherent-cancellation-is-execution-failed' {
        $outcome = New-TestMissionOutcome `
            -OfficialStatus CANCELLED `
            -AuthorityDecision ACCEPTED `
            -FinalMissionState COMPLETED
        $decision = Resolve-TestMissionOutcome $outcome
        Assert-Equal 'EXECUTION_FAILED' $decision.Decision
        Assert-Equal 'OUTCOME_CONTRACT_INVALID' $decision.ReasonCode
    }

    foreach ($executionMode in @(
        'BACKFILL',
        'IMPLEMENTATION',
        'CORRECTION',
        'DOMAIN_CERTIFICATION'
    )) {
        Invoke-TestCase "policy-no-change-$executionMode-is-execution-failed" {
            $outcome = New-TestMissionOutcome `
                -OfficialStatus NO_CHANGE `
                -AuthorityDecision REJECTED `
                -FinalMissionState REJECTED
            $decision = Resolve-TestMissionOutcome `
                $outcome `
                $executionMode
            Assert-Equal 'EXECUTION_FAILED' $decision.Decision
            Assert-Equal `
                'NO_CHANGE_NOT_CANONICAL_FOR_DOMAIN_LOT' `
                $decision.ReasonCode
        }
    }

    Invoke-TestCase 'domain-required' {
        $root = New-TestRepository
        Assert-Throws {
            Resolve-DomainContext -Repository $root -DomainId ''
        } 'DOMAIN_REQUIRED'
    }

    Invoke-TestCase 'domain-unknown' {
        $root = New-TestRepository
        Assert-Throws {
            Resolve-DomainContext -Repository $root -DomainId 'UNKNOWN'
        } 'DOMAIN_UNKNOWN:*'
    }

    Invoke-TestCase 'domain-ambiguous' {
        $root = New-TestRepository
        $path = Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
        $registry = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
        $registry.Entries = @($registry.Entries) + @($registry.Entries)
        Write-TestJson $path $registry
        Assert-Throws {
            Resolve-DomainContext -Repository $root -DomainId 'TEST'
        } 'DOMAIN_AMBIGUOUS:*'
    }

    Invoke-TestCase 'valid-registry-resolves-canonical-domain' {
        $root = New-TestRepository
        $context = Resolve-DomainContext $root TEST
        Assert-Equal 'TEST' $context.DomainId
        Assert-Equal 'Docs/contracts/TEST_DOMAIN_BLUEPRINT.md' $context.BlueprintPath
    }

    Invoke-TestCase 'contradictory-registry-is-rejected' {
        $root = New-TestRepository
        $path = Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
        $registry = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
        $duplicate = $registry.Entries[0].PSObject.Copy()
        $duplicate.Status = 'REJECTED'
        $registry.Entries = @($registry.Entries) + @($duplicate)
        Write-TestJson $path $registry
        Assert-Throws {
            Resolve-DomainContext -Repository $root -DomainId 'TEST'
        } 'DOMAIN_AMBIGUOUS:*'
    }

    Invoke-TestCase 'complete-chain-is-ordered-by-contract' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B CERTIFIED TEST-A TEST-C
        Add-TestLot $root TEST-C PENDING_EVIDENCE TEST-B $null
        $current = Resolve-CurrentLot $root TEST
        Assert-Equal 'TEST-B' $current.LastCertifiedLot
        Assert-Equal 'TEST-C' $current.CurrentLot
    }

    Invoke-TestCase 'pending-with-real-code-resolves-backfill' {
        $root = New-TestRepository
        $code = Add-TestProducerCode $root
        Add-TestLot `
            $root `
            TEST-B `
            PENDING_EVIDENCE `
            TEST-A `
            TEST-C `
            @("FILES_VERIFIED: $code")
        $mode = Resolve-LotExecutionMode $root TEST
        Assert-Equal 'BACKFILL' $mode.Mode
        Assert-True $mode.CodeExists
    }

    Invoke-TestCase 'pending-without-code-resolves-implementation' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $mode = Resolve-LotExecutionMode $root TEST
        Assert-Equal 'IMPLEMENTATION' $mode.Mode
        Assert-False $mode.CodeExists
    }

    Invoke-TestCase 'rejected-resolves-correction' {
        $root = New-TestRepository
        Add-TestLot `
            $root `
            TEST-B `
            REJECTED `
            TEST-A `
            TEST-C `
            @('DEFECT: producer boundary')
        $mode = Resolve-LotExecutionMode $root TEST
        Assert-Equal 'CORRECTION' $mode.Mode
    }

    Invoke-TestCase 'absent-after-certified-resolves-implementation' {
        $root = New-TestRepository
        $current = Resolve-CurrentLot $root TEST
        $mode = Resolve-LotExecutionMode $root TEST $null $current
        Assert-Equal 'TEST-B' $current.CurrentLot
        Assert-Equal 'ABSENT' $current.CurrentStatus
        Assert-Equal 'IMPLEMENTATION' $mode.Mode
    }

    Invoke-TestCase 'absent-after-non-certified-is-rejected' {
        $root = New-TestRepository
        $path = Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
        $registry = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
        $registry.Entries[0].Status = 'REJECTED'
        Write-TestJson $path $registry
        Assert-Throws {
            Open-NextDomainLot $root TEST TEST-A TEST-MISSION
        } 'PREVIOUS_LOT_NOT_CERTIFIED'
    }

    Invoke-TestCase 'all-lots-certified-resolves-domain-certification' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B CERTIFIED TEST-A TEST-C
        Add-TestLot $root TEST-C CERTIFIED TEST-B $null
        $mode = Resolve-LotExecutionMode $root TEST
        Assert-Equal 'DOMAIN_CERTIFICATION' $mode.Mode
    }

    Invoke-TestCase 'incomplete-lot-contract-is-rejected' {
        $root = New-TestRepository -IncompleteContract
        Assert-Throws {
            Resolve-CurrentLot $root TEST
        } 'LOT_CONTRACT_INCOMPLETE:GATE:TEST-B'
    }

    Invoke-TestCase 'next-lot-opens-only-after-certification' {
        $root = New-TestRepository
        $opened = Open-NextDomainLot $root TEST TEST-A TEST-MISSION
        Assert-Equal 'TEST-B' $opened.LotId
        Assert-Equal 'PENDING_EVIDENCE' $opened.Status
    }

    Invoke-TestCase 'multiple-lot-precreation-is-forbidden' {
        $root = New-TestRepository
        [void](Open-NextDomainLot $root TEST TEST-A TEST-MISSION)
        Assert-Throws {
            Open-NextDomainLot $root TEST TEST-B TEST-MISSION
        } 'PREVIOUS_LOT_NOT_CERTIFIED'
    }

    Invoke-TestCase 'one-invocation-executes-one-lot' {
        $root = New-TestRepository
        $code = Add-TestProducerCode $root
        Add-TestLot `
            $root `
            TEST-B `
            PENDING_EVIDENCE `
            TEST-A `
            TEST-C `
            @("FILES_VERIFIED: $code")
        $script:executionCount = 0
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            $script:executionCount += 1
            return New-TestMissionOutcome
        }
        Assert-Equal 1 $script:executionCount
        Assert-Equal 1 $outcome.ExecutedLots
        Assert-Equal 'TEST-C' $outcome.NextLotOpened
        $next = Read-LotCertification $root TEST TEST-C
        Assert-Equal 'PENDING_EVIDENCE' $next.Status
    }

    Invoke-TestCase 'dry-run-performs-no-write' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $registry = Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
        $before = (Get-FileHash -LiteralPath $registry -Algorithm SHA256).Hash
        $result = Invoke-DomainLot $root TEST -DryRun
        $after = (Get-FileHash -LiteralPath $registry -Algorithm SHA256).Hash
        Assert-Equal $before $after
        Assert-False $result.WritesPerformed
    }

    Invoke-TestCase 'backfill-does-not-reimplement-code' {
        $root = New-TestRepository
        $code = Add-TestProducerCode $root
        Add-TestLot `
            $root `
            TEST-B `
            PENDING_EVIDENCE `
            TEST-A `
            TEST-C `
            @("FILES_VERIFIED: $code")
        $codeRoot = Join-Path $root 'server/domain/test'
        $before = Get-TestFileSnapshot $codeRoot
        [void](Invoke-DomainLot $root TEST -Executor {
            param($Context)
            Assert-Equal 'BACKFILL' $Context.Mode.Mode
            return New-TestMissionOutcome
        })
        Assert-SnapshotEqual $before (Get-TestFileSnapshot $codeRoot)
    }

    Invoke-TestCase 'correction-remains-on-rejected-lot' {
        $root = New-TestRepository
        $code = Add-TestProducerCode $root
        Add-TestLot `
            $root `
            TEST-B `
            REJECTED `
            TEST-A `
            TEST-C `
            @("FILES_VERIFIED: $code")
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            Assert-Equal 'CORRECTION' $Context.Mode.Mode
            Assert-Equal 'TEST-B' $Context.Lot.CurrentLot
            return New-TestMissionOutcome
        }
        Assert-Equal 'TEST-B' $outcome.CurrentLot
        Assert-Equal 1 $outcome.ExecutedLots
    }

    Invoke-TestCase 'stop-on-first-no-go' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            return New-TestMissionOutcome `
                -ContractCriteriaSatisfied $false
        }
        Assert-Equal 'REJECTED' $outcome.Status
        Assert-Equal $null $outcome.NextLotOpened
        $registry = Get-Content -LiteralPath (
            Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
        ) -Raw | ConvertFrom-Json
        Assert-Equal 2 @($registry.Entries).Count
    }

    Invoke-TestCase 'pending-review-does-not-call-complete-domain-lot' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            return New-TestMissionOutcome `
                -AuthorityDecision PENDING_REVIEW `
                -FinalMissionState READY_FOR_REVIEW
        }
        Assert-Equal 'PENDING_REVIEW' $outcome.Status
        Assert-Equal 0 $outcome.CompleteDomainLotInvocations
        Assert-False $outcome.WritesPerformed
        Assert-Equal $null $outcome.NextLotOpened
        Assert-Equal 'PENDING_EVIDENCE' (
            Read-LotCertification $root TEST TEST-B
        ).Status
    }

    Invoke-TestCase 'execution-failed-does-not-call-complete-domain-lot' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            return New-TestMissionOutcome `
                -OfficialStatus FAILED `
                -AuthorityDecision NOT_APPLICABLE `
                -FinalMissionState FAILED
        }
        Assert-Equal 'EXECUTION_FAILED' $outcome.Status
        Assert-Equal 0 $outcome.CompleteDomainLotInvocations
        Assert-False $outcome.WritesPerformed
        Assert-Equal $null $outcome.NextLotOpened
    }

    Invoke-TestCase 'cancelled-does-not-call-complete-domain-lot' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            return New-TestMissionOutcome `
                -OfficialStatus CANCELLED `
                -AuthorityDecision NOT_APPLICABLE `
                -FinalMissionState CANCELLED `
                -ExitCode 130
        }
        Assert-Equal 'CANCELLED' $outcome.Status
        Assert-Equal 0 $outcome.CompleteDomainLotInvocations
        Assert-False $outcome.WritesPerformed
        Assert-Equal $null $outcome.NextLotOpened
    }

    Invoke-TestCase 'certified-calls-complete-once-and-opens-next' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            return New-TestMissionOutcome
        }
        Assert-Equal 'CERTIFIED' $outcome.Status
        Assert-Equal 1 $outcome.CompleteDomainLotInvocations
        Assert-Equal 'TEST-C' $outcome.NextLotOpened
    }

    Invoke-TestCase 'rejected-calls-complete-once-without-next' {
        $root = New-TestRepository
        Add-TestLot $root TEST-B PENDING_EVIDENCE TEST-A TEST-C
        $outcome = Invoke-DomainLot $root TEST -Executor {
            param($Context)
            return New-TestMissionOutcome `
                -AuthorityDecision REJECTED `
                -FinalMissionState REJECTED
        }
        Assert-Equal 'REJECTED' $outcome.Status
        Assert-Equal 1 $outcome.CompleteDomainLotInvocations
        Assert-Equal $null $outcome.NextLotOpened
        $registry = Get-Content -LiteralPath (
            Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
        ) -Raw | ConvertFrom-Json
        Assert-Equal 2 @($registry.Entries).Count
    }

    Invoke-TestCase 'people-pilot-resolves-current-lot' {
        $repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
        $result = Invoke-DomainLot $repository PEOPLE -DryRun
        Assert-Equal 'P3-PEOPLE-001C' $result.LastCertifiedLot
        Assert-Equal 'P3-PEOPLE-001D' $result.CurrentLot
        Assert-Equal 'PENDING_EVIDENCE' $result.CurrentStatus
        Assert-Equal 'IMPLEMENTATION' $result.ExecutionMode
    }

    Invoke-TestCase 'people-pilot-modifies-no-business-file' {
        $repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
        $peopleRoot = Join-Path $repository 'server/domain/people'
        $registry = Join-Path $repository (
            'Docs/12_CERTIFICATION/certification-registry.json'
        )
        $beforePeople = Get-TestFileSnapshot $peopleRoot
        $beforeRegistry = (Get-FileHash -LiteralPath $registry -Algorithm SHA256).Hash
        $result = Invoke-DomainLot $repository PEOPLE -DryRun
        $afterRegistry = (Get-FileHash -LiteralPath $registry -Algorithm SHA256).Hash
        Assert-SnapshotEqual $beforePeople (Get-TestFileSnapshot $peopleRoot)
        Assert-Equal $beforeRegistry $afterRegistry
        Assert-False $result.WritesPerformed
    }
}
finally {
    foreach ($root in $temporaryRoots) {
        $resolved = [IO.Path]::GetFullPath($root)
        $temp = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
        if ($resolved.StartsWith(
            $temp,
            [StringComparison]::OrdinalIgnoreCase
        ) -and (Test-Path -LiteralPath $resolved)) {
            Remove-Item -LiteralPath $resolved -Recurse -Force
        }
    }
}

$results | Format-Table -AutoSize
$failed = @($results | Where-Object { -not $_.Passed })
Write-Output "CEREBRAU_DOMAIN_V2_TESTS=$($results.Count)"
Write-Output "CEREBRAU_DOMAIN_V2_PASSED=$($results.Count-$failed.Count)"
Write-Output "CEREBRAU_DOMAIN_V2_FAILED=$($failed.Count)"
if ($failed.Count -gt 0) { exit 1 }

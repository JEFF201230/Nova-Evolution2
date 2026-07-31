Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (Join-Path $PSScriptRoot 'Cerebrau.Certification.psm1') -Force

$results = [Collections.Generic.List[object]]::new()
$utf8 = [Text.UTF8Encoding]::new($false)
$temporaryRoots = [Collections.Generic.List[string]]::new()

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

function New-TestRepository {
    $root = Join-Path ([IO.Path]::GetTempPath()) (
        'cerebrau-certification-' + [guid]::NewGuid().ToString('N')
    )
    New-Item -ItemType Directory -Path (
        Join-Path $root 'Docs/12_CERTIFICATION'
    ) -Force | Out-Null
    $temporaryRoots.Add($root)
    return $root
}

function New-Certification {
    param(
        [string]$LotId,
        [string]$Status,
        [AllowNull()][object]$PreviousLot = $null,
        [AllowNull()][object]$NextAuthorizedLot = $null,
        [string]$DomainId = 'PEOPLE',
        [object[]]$Evidence = @('evidence:file'),
        [object[]]$Tests = @('test:pass')
    )
    return [PSCustomObject][ordered]@{
        MissionId = "TEST-$LotId"
        DomainId = $DomainId
        LotId = $LotId
        Status = $Status
        CertifiedAt = $(if ($Status -eq 'CERTIFIED') {
            '2026-07-30T16:00:00.000Z'
        } else {
            $null
        })
        Evidence = [object[]]$Evidence
        Tests = [object[]]$Tests
        Regressions = $(if ($Status -eq 'CERTIFIED') {
            'NONE'
        } else {
            'NOT_EVALUATED'
        })
        PreviousLot = $PreviousLot
        NextAuthorizedLot = $NextAuthorizedLot
    }
}

function Write-TestRegistry {
    param([string]$Repository,[object[]]$Entries)
    $path = Join-Path $Repository (
        'Docs/12_CERTIFICATION/certification-registry.json'
    )
    $value = [PSCustomObject][ordered]@{
        SchemaVersion = 1
        Entries = [object[]]$Entries
    }
    [IO.File]::WriteAllText(
        $path,
        ($value | ConvertTo-Json -Depth 20),
        $utf8
    )
}

function New-RegistryEntry {
    param(
        [string]$LotId,
        [string]$Status,
        [AllowNull()][object]$PreviousLot,
        [AllowNull()][object]$NextAuthorizedLot,
        [string]$DomainId = 'PEOPLE'
    )
    return [PSCustomObject][ordered]@{
        DomainId = $DomainId
        LotId = $LotId
        CertificationPath = "Docs/12_CERTIFICATION/$DomainId/$LotId.certification.json"
        Status = $Status
        PreviousLot = $PreviousLot
        NextAuthorizedLot = $NextAuthorizedLot
    }
}

try {
    Invoke-TestCase 'existing-valid-certification' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        $read = Read-LotCertification $root PEOPLE LOT-A
        Assert-Equal 'CERTIFIED' $read.Status
        Assert-True $read.Materialized
    }

    Invoke-TestCase 'absent-certification-is-pending' {
        $root = New-TestRepository
        $read = Read-LotCertification $root PEOPLE LOT-ABSENT
        Assert-Equal 'PENDING_EVIDENCE' $read.Status
        Assert-True $read.BackfillAuthorized
        Assert-False $read.Materialized
    }

    Invoke-TestCase 'pending-evidence-is-readable' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-PENDING' 'PENDING_EVIDENCE'
        ))
        $read = Read-LotCertification $root PEOPLE LOT-PENDING
        Assert-Equal 'PENDING_EVIDENCE' $read.Status
        Assert-True $read.BackfillAuthorized
    }

    Invoke-TestCase 'rejected-is-readable-and-does-not-advance' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-REJECTED' 'REJECTED' $null 'LOT-NEXT'
        ))
        $read = Read-LotCertification $root PEOPLE LOT-REJECTED
        Assert-Equal 'REJECTED' $read.Status
        Assert-Equal $null (Get-LastCertifiedLot $root PEOPLE)
    }

    Invoke-TestCase 'certified-advances-contiguous-chain' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-CERTIFIED' 'CERTIFIED'
        ))
        $last = Get-LastCertifiedLot $root PEOPLE
        Assert-Equal 'LOT-CERTIFIED' $last.LotId
        $temporaryFiles = @(Get-ChildItem -LiteralPath $root -Recurse -File |
            Where-Object { $_.Name -match '\.(tmp|rollback)$' })
        Assert-Equal 0 $temporaryFiles.Count
    }

    Invoke-TestCase 'absent-registry-is-non-blocking' {
        $root = New-TestRepository
        $context = Resolve-CertificationContext $root PEOPLE
        Assert-Equal $null $context.LastCertifiedLot
        Assert-True $context.BackfillAuthorized
    }

    Invoke-TestCase 'absent-registry-entry-is-pending' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'OTHER-A' 'PENDING_EVIDENCE' $null $null 'OTHER'
        ))
        $read = Read-LotCertification $root PEOPLE PEOPLE-A
        Assert-Equal 'PENDING_EVIDENCE' $read.Status
        Assert-True $read.BackfillAuthorized
    }

    Invoke-TestCase 'contradictory-entries-are-ambiguous' {
        $root = New-TestRepository
        $entry = New-RegistryEntry 'LOT-A' 'PENDING_EVIDENCE' $null $null
        Write-TestRegistry $root @($entry,$entry)
        Assert-Throws {
            Resolve-CertificationContext $root PEOPLE
        } 'CONTEXT_AMBIGUOUS:DUPLICATE_LOT*'
    }

    Invoke-TestCase 'continuity-break-is-rejected' {
        $root = New-TestRepository
        Write-TestRegistry $root @(
            (New-RegistryEntry 'LOT-A' 'CERTIFIED' $null 'LOT-B'),
            (New-RegistryEntry 'LOT-B' 'PENDING_EVIDENCE' 'LOT-X' $null)
        )
        Assert-Throws {
            Test-LotContinuity $root PEOPLE
        } 'LOT_CONTINUITY_BROKEN:*'
    }

    Invoke-TestCase 'certified-requires-evidence' {
        $root = New-TestRepository
        $certification = New-Certification `
            'LOT-NO-EVIDENCE' `
            'CERTIFIED' `
            $null `
            $null `
            'PEOPLE' `
            @() `
            @('test:pass')
        Assert-Throws {
            Write-LotCertification $root $certification
        } 'CEREBRAU_CERTIFICATION_EVIDENCE_REQUIRED*'
    }

    Invoke-TestCase 'legacy-lot-can-be-regularized' {
        $root = New-TestRepository
        $before = Read-LotCertification $root PEOPLE LEGACY-A
        Assert-Equal 'PENDING_EVIDENCE' $before.Status
        [void](Write-LotCertification $root (
            New-Certification 'LEGACY-A' 'CERTIFIED'
        ))
        $after = Read-LotCertification $root PEOPLE LEGACY-A
        Assert-Equal 'CERTIFIED' $after.Status
        Assert-False $after.BackfillAuthorized
    }

    Invoke-TestCase 'next-authorized-lot-is-deterministic' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        [void](Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        ))
        $next = Get-NextAuthorizedLot $root PEOPLE
        Assert-Equal 'LOT-B' $next.LotId
        Assert-Equal 'PENDING_EVIDENCE' $next.Status
    }

    Invoke-TestCase 'resolution-stops-at-first-non-certified-lot' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        [void](Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        ))
        $last = Get-LastCertifiedLot $root PEOPLE
        Assert-Equal 'LOT-A' $last.LotId
    }

    Invoke-TestCase 'non-certified-lot-can-produce-evidence' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        [void](Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        ))
        $context = Resolve-CertificationContext $root PEOPLE
        Assert-Equal 'LOT-B' $context.NextLotRequiringEvidence
        Assert-True $context.BackfillAuthorized
    }

    Invoke-TestCase 'following-lot-cannot-start-before-certification' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        [void](Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        ))
        Assert-True (Test-LotExecutionAuthorization $root PEOPLE LOT-B)
        Assert-False (Test-LotExecutionAuthorization $root PEOPLE LOT-C)
    }

    Invoke-TestCase 'creation-first-domain-lot-is-allowed' {
        $root = New-TestRepository
        $created = Write-LotCertification $root (
            New-Certification 'LOT-A' 'PENDING_EVIDENCE' $null 'LOT-B'
        )
        Assert-Equal 'LOT-A' $created.LotId
        Assert-Equal 'PENDING_EVIDENCE' $created.Status
        Assert-True $created.BackfillAuthorized
    }

    Invoke-TestCase 'creation-after-certified-is-allowed' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        $created = Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        )
        Assert-Equal 'LOT-B' $created.LotId
        Assert-True $created.BackfillAuthorized
    }

    Invoke-TestCase 'creation-after-pending-is-rejected' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'PENDING_EVIDENCE' $null 'LOT-B'
        ))
        Assert-Throws {
            Write-LotCertification $root (
                New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
            )
        } 'LOT_CONTINUITY_BROKEN:PREVIOUS_NOT_CERTIFIED:LOT-B'
    }

    Invoke-TestCase 'creation-after-rejected-is-rejected' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'REJECTED' $null 'LOT-B'
        ))
        Assert-Throws {
            Write-LotCertification $root (
                New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
            )
        } 'LOT_CONTINUITY_BROKEN:PREVIOUS_NOT_CERTIFIED:LOT-B'
    }

    Invoke-TestCase 'creation-without-previous-is-rejected' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        Assert-Throws {
            Write-LotCertification $root (
                New-Certification 'LOT-B' 'PENDING_EVIDENCE' $null 'LOT-C'
            )
        } 'LOT_CONTINUITY_BROKEN:PREVIOUS_REQUIRED:LOT-B'
    }

    Invoke-TestCase 'creation-with-incoherent-previous-is-rejected' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-C'
        ))
        Assert-Throws {
            Write-LotCertification $root (
                New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
            )
        } 'LOT_CONTINUITY_BROKEN:PREVIOUS_NEXT_MISMATCH:LOT-A:LOT-B'
    }

    Invoke-TestCase 'precreation-of-third-lot-is-rejected' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        [void](Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        ))
        Assert-Throws {
            Write-LotCertification $root (
                New-Certification 'LOT-C' 'PENDING_EVIDENCE' 'LOT-B' 'LOT-D'
            )
        } 'LOT_CONTINUITY_BROKEN:PREVIOUS_NOT_CERTIFIED:LOT-C'
    }

    Invoke-TestCase 'precreation-of-fourth-lot-is-rejected' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        [void](Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        ))
        Assert-Throws {
            Write-LotCertification $root (
                New-Certification 'LOT-D' 'PENDING_EVIDENCE' 'LOT-C' $null
            )
        } 'LOT_CONTINUITY_BROKEN:PREVIOUS_MISSING:LOT-D'
    }

    Invoke-TestCase 'first-lot-requiring-evidence-is-deterministic' {
        $root = New-TestRepository
        [void](Write-LotCertification $root (
            New-Certification 'LOT-A' 'CERTIFIED' $null 'LOT-B'
        ))
        [void](Write-LotCertification $root (
            New-Certification 'LOT-B' 'PENDING_EVIDENCE' 'LOT-A' 'LOT-C'
        ))
        $context = Resolve-CertificationContext $root PEOPLE
        Assert-Equal 'LOT-A' $context.LastCertifiedLot
        Assert-Equal 'LOT-B' $context.NextLotRequiringEvidence
        Assert-True $context.BackfillAuthorized
        $registry = Get-Content -LiteralPath (
            Join-Path $root 'Docs/12_CERTIFICATION/certification-registry.json'
        ) -Raw | ConvertFrom-Json
        Assert-Equal 2 @($registry.Entries).Count
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
Write-Output "CEREBRAU_CERTIFICATION_TESTS=$($results.Count)"
Write-Output "CEREBRAU_CERTIFICATION_PASSED=$($results.Count-$failed.Count)"
Write-Output "CEREBRAU_CERTIFICATION_FAILED=$($failed.Count)"
if ($failed.Count -gt 0) { exit 1 }

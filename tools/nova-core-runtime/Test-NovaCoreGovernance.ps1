Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (Join-Path $PSScriptRoot 'NovaCore.Governance.psm1') -Force

$results = [Collections.Generic.List[object]]::new()

function Add-TestResult {
    param([string]$Name,[bool]$Passed,[string]$Detail)
    $results.Add([PSCustomObject]@{Name=$Name;Passed=$Passed;Detail=$Detail})
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

function Assert-Equal {
    param($Expected,$Actual,[string]$Message='ASSERT_EQUAL_FAILED')
    if ([string]$Expected -ne [string]$Actual) { throw "$Message`:EXPECTED=$Expected;ACTUAL=$Actual" }
}

function Assert-Throws {
    param([scriptblock]$Action,[string]$Pattern)
    $message=$null
    try { & $Action } catch { $message=$_.Exception.Message }
    if ($null -eq $message) { throw "EXPECTED_EXCEPTION_NOT_THROWN:$Pattern" }
    if ($message -notlike $Pattern) { throw "EXPECTED_EXCEPTION_MISMATCH:$Pattern`:ACTUAL=$message" }
}

function New-TestMission {
    param([string]$Class,[string]$Repository,[string]$Branch='test-branch')
    $isReadOnly=$Class -eq 'READ_ONLY'
    $output=if($isReadOnly){@()}else{@('Docs/recovery/report.md')}
    $mission=[PSCustomObject][ordered]@{
        schemaVersion='1.0.0'
        missionId="TEST-$Class"
        program='NOVA-CORE'
        lot='NOVA_CORE-RUNTIME'
        title="Recovery $Class"
        profile=$(if($isReadOnly){'READ_ONLY'}else{'ARCHITECTURE'})
        repository=$Repository
        expectedBranch=$Branch
        promptFile=(Join-Path $Repository 'prompt.md')
        workingDirectory=$Repository
        enabled=$true
        changesExpected=(-not $isReadOnly)
        humanReviewRequired=$true
        allowedPaths=[object[]]@('Docs/recovery/**')
        forbiddenPaths=[object[]]@('client/**','server/**','supabase/**')
        recoveryLane=[PSCustomObject][ordered]@{
            recoveryLaneClass=$Class
            recoveryReason="Produce controlled recovery evidence for $Class"
            blockedRule='NSB-RULE-TEST'
            requiredEvidence=[object[]]@()
            authorizedScope=[object[]]@('Docs/recovery/**')
            authorizedFiles=[object[]]$output
            forbiddenFiles=[object[]]@('client/**','server/**','supabase/**')
            authority='PROGRAM_DIRECTOR'
            expirationOrAttemptLimit=[PSCustomObject]@{attemptLimit=1}
            inputFingerprint=('0'*64)
        }
    }
    if($Class -eq 'CERTIFICATION_REMEDIATION'){
        $mission | Add-Member -NotePropertyName certification -NotePropertyValue ([PSCustomObject]@{
            baselinePath='Docs/recovery/baseline.md'
            outputReportPath='Docs/recovery/report.md'
        })
    }
    $mission.recoveryLane.requiredEvidence=[object[]]::new(0)
    if($isReadOnly){$mission.recoveryLane.authorizedFiles=[object[]]::new(0)}
    $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint -Mission $mission -Repository $Repository -Branch $Branch
    return $mission
}

$testRoot=Join-Path ([IO.Path]::GetTempPath()) ('nova-core-governance-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $testRoot -Force|Out-Null
New-Item -ItemType Directory -Path (Join-Path $testRoot 'Docs/recovery') -Force|Out-Null
[IO.File]::WriteAllText((Join-Path $testRoot 'prompt.md'),'test',[Text.UTF8Encoding]::new($false))

try {
    foreach($class in @('READ_ONLY','EVIDENCE_PRODUCTION','AUDIT','CERTIFICATION_REMEDIATION')){
        Invoke-TestCase "recovery-$class-admitted" {
            $mission=New-TestMission $class $testRoot
            $admission=Test-NovaCoreGovernedAdmission -Mission $mission -Repository $testRoot -Branch 'test-branch'
            Assert-Equal 'RECOVERY' $admission.mode
            Assert-Equal $class $admission.recoveryLaneClass
            Assert-Equal $false $admission.directProductionReleaseAuthorized
        }
    }

    Invoke-TestCase 'recovery-invalid-class-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission.recoveryLane.recoveryLaneClass='FUNCTIONAL_CHANGE'
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_RECOVERY_CLASS_INVALID*'
    }
    Invoke-TestCase 'recovery-missing-parameter-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission.recoveryLane.PSObject.Properties.Remove('authority')
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_RECOVERY_PROPERTY_MISSING:authority'
    }
    Invoke-TestCase 'recovery-fingerprint-drift-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission.title='drift'
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_RECOVERY_INPUT_FINGERPRINT_MISMATCH*'
    }
    Invoke-TestCase 'recovery-scope-exceeded-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission.recoveryLane.authorizedFiles=[object[]]@('Docs/outside/report.md')
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_RECOVERY_SCOPE_EXCEEDED*'
    }
    Invoke-TestCase 'recovery-forbidden-file-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission.allowedPaths=[object[]]@('Docs/recovery/**','server/**')
        $mission.recoveryLane.authorizedScope=[object[]]@('Docs/recovery/**','server/**')
        $mission.recoveryLane.authorizedFiles=[object[]]@('server/nova-core/change.ts')
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_RECOVERY_FILE_FORBIDDEN*'
    }
    Invoke-TestCase 'certification-reflexive-baseline-rejected' {
        $mission=New-TestMission 'CERTIFICATION_REMEDIATION' $testRoot
        $mission.certification.outputReportPath=$mission.certification.baselinePath
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_RECOVERY_CERTIFICATION_REFLEXIVE_BASELINE'
    }

    Invoke-TestCase 'full-freeze-normal-mission-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission.PSObject.Properties.Remove('recoveryLane')
        $mission | Add-Member -NotePropertyName freeze -NotePropertyValue ([PSCustomObject]@{active=$true;mode='FULL_FREEZE';authority='PROGRAM_DIRECTOR';source='Docs/freeze.md'})
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_FREEZE_BLOCKED:FULL_FREEZE'
    }
    Invoke-TestCase 'write-freeze-normal-write-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission.PSObject.Properties.Remove('recoveryLane')
        $mission | Add-Member -NotePropertyName freeze -NotePropertyValue ([PSCustomObject]@{active=$true;mode='WRITE_FREEZE';authority='PROGRAM_DIRECTOR';source='Docs/freeze.md'})
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_FREEZE_BLOCKED:WRITE_FREEZE'
    }
    Invoke-TestCase 'freeze-explicit-nsb-exception-admitted' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission | Add-Member -NotePropertyName freeze -NotePropertyValue ([PSCustomObject]@{
            active=$true;mode='FULL_FREEZE';authority='PROGRAM_DIRECTOR';source='Docs/freeze.md'
            exception=[PSCustomObject]@{recoveryLaneClass='AUDIT';authority='PROGRAM_DIRECTOR';reason='Audit required to lift freeze'}
        })
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        $admission=Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'
        Assert-Equal $true $admission.freeze.exceptionApplied
        Assert-Equal $false $admission.freeze.productionReleaseAuthorized
    }
    Invoke-TestCase 'freeze-implicit-exception-rejected' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $mission | Add-Member -NotePropertyName freeze -NotePropertyValue ([PSCustomObject]@{active=$true;mode='FULL_FREEZE';authority='PROGRAM_DIRECTOR';source='Docs/freeze.md'})
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        Assert-Throws {Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'} 'NOVA_CORE_FREEZE_EXCEPTION_REQUIRED'
    }

    $evidencePath=Join-Path $testRoot 'authority.md'
    [IO.File]::WriteAllText($evidencePath,'authority',[Text.UTF8Encoding]::new($false))
    $evidenceHash=Get-NovaCoreGovernanceFileHash $evidencePath
    Invoke-TestCase 'input-evidence-valid' {
        $mission=New-TestMission 'READ_ONLY' $testRoot
        $mission | Add-Member -NotePropertyName inputEvidence -NotePropertyValue @([PSCustomObject]@{evidenceId='AUTH';path='authority.md';kind='AUTHORITY';sha256=$evidenceHash})
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        $admission=Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'
        $registry=New-NovaCoreInputEvidenceRegistry $mission $testRoot ([PSCustomObject]@{Branch='test-branch';Head='abc';Files=@{}}) $admission $false
        Assert-Equal 'VALID' $registry.status
        Assert-True (@($registry.entries|Where-Object evidenceId -eq 'AUTH').Count -eq 1)
    }
    Invoke-TestCase 'input-evidence-invalid-hash-rejected' {
        $mission=New-TestMission 'READ_ONLY' $testRoot
        $mission | Add-Member -NotePropertyName inputEvidence -NotePropertyValue @([PSCustomObject]@{evidenceId='AUTH';path='authority.md';kind='AUTHORITY';sha256=('A'*64)})
        $mission.recoveryLane.inputFingerprint=Get-NovaCoreGovernedMissionInputFingerprint $mission $testRoot 'test-branch'
        $admission=Test-NovaCoreGovernedAdmission $mission $testRoot 'test-branch'
        Assert-Throws {New-NovaCoreInputEvidenceRegistry $mission $testRoot ([PSCustomObject]@{Branch='test-branch';Head='abc';Files=@{}}) $admission $false} 'NOVA_CORE_INPUT_EVIDENCE_INVALID*'
    }
    Invoke-TestCase 'output-evidence-missing-validation-invalid' {
        $mission=New-TestMission 'AUDIT' $testRoot
        $delta=[PSCustomObject]@{Created=@();Modified=@();Deleted=@();Renamed=@()}
        $validations=@([PSCustomObject]@{Name='required-output';Passed=$false;Required=$true})
        $registry=New-NovaCoreOutputEvidenceRegistry $mission $testRoot $delta $validations 'BLOCKED'
        Assert-Equal 'INVALID' $registry.status
    }

    $passedValidations=@([PSCustomObject]@{Name='syntax';Passed=$true;Required=$true})
    Invoke-TestCase 'final-decision-ready-for-review' {
        $decision=Resolve-NovaCoreFinalAuthorityDecision 'READY_FOR_REVIEW' $passedValidations 'VALID' $true
        Assert-Equal 'PENDING_REVIEW' $decision.authorityDecision
        Assert-Equal 'READY_FOR_REVIEW' $decision.finalMissionState
    }
    Invoke-TestCase 'final-decision-accepted' {
        $decision=Resolve-NovaCoreFinalAuthorityDecision 'SUCCESS' $passedValidations 'VALID' $false
        Assert-Equal 'ACCEPTED' $decision.authorityDecision
        Assert-Equal 'ACCEPTED' $decision.finalMissionState
        Assert-Equal $false $decision.transcriptUsed
    }
    Invoke-TestCase 'final-decision-rejected' {
        $failed=@([PSCustomObject]@{Name='syntax';Passed=$false;Required=$true})
        $decision=Resolve-NovaCoreFinalAuthorityDecision 'PARTIAL' $failed 'INVALID' $false
        Assert-Equal 'REJECTED' $decision.authorityDecision
        Assert-Equal 'REJECTED' $decision.finalMissionState
    }
    Invoke-TestCase 'final-decision-structured-review-fingerprint-bound' {
        $review=[PSCustomObject]@{decision='ACCEPTED';authority='PROGRAM_DIRECTOR';reportFingerprint='ABC';decidedAt=[DateTimeOffset]::UtcNow.ToString('o')}
        $decision=Resolve-NovaCoreFinalAuthorityDecision 'READY_FOR_REVIEW' $passedValidations 'VALID' $true $review 'ABC'
        Assert-Equal 'ACCEPTED' $decision.finalMissionState
        Assert-Throws {Resolve-NovaCoreFinalAuthorityDecision 'READY_FOR_REVIEW' $passedValidations 'VALID' $true $review 'DEF'} 'NOVA_CORE_AUTHORITY_REVIEW_FINGERPRINT_MISMATCH'
    }

    $normal=New-TestMission 'AUDIT' $testRoot
    $normal.PSObject.Properties.Remove('recoveryLane')
    $normalInput=Get-NovaCoreGovernedMissionInputFingerprint $normal $testRoot 'test-branch'
    $normalAdmission=Test-NovaCoreGovernedAdmission $normal $testRoot 'test-branch'
    $scopeFingerprint=Get-NovaCoreMissionScopeFingerprint $normal $normalAdmission
    $lockDirectory=Join-Path $testRoot 'locks'
    Invoke-TestCase 'mission-lock-active-rejected' {
        $lock=Enter-NovaCoreMissionLock $normal $testRoot 'test-branch' $normalInput $scopeFingerprint $lockDirectory
        try { Assert-Throws {Enter-NovaCoreMissionLock $normal $testRoot 'test-branch' $normalInput $scopeFingerprint $lockDirectory} 'NOVA_CORE_MISSION_LOCKED*' }
        finally { Exit-NovaCoreMissionLock $lock }
    }
    Invoke-TestCase 'mission-lock-incompatible-scope-rejected' {
        $lock=Enter-NovaCoreMissionLock $normal $testRoot 'test-branch' $normalInput $scopeFingerprint $lockDirectory
        try {
            $other=$normal|ConvertTo-Json -Depth 20|ConvertFrom-Json
            $other.missionId='TEST-OTHER-WRITER'
            $otherInput=Get-NovaCoreGovernedMissionInputFingerprint $other $testRoot 'test-branch'
            $otherAdmission=Test-NovaCoreGovernedAdmission $other $testRoot 'test-branch'
            $otherScope=Get-NovaCoreMissionScopeFingerprint $other $otherAdmission
            Assert-Throws {Enter-NovaCoreMissionLock $other $testRoot 'test-branch' $otherInput $otherScope $lockDirectory} 'NOVA_CORE_MISSION_LOCK_SCOPE_CONFLICT*'
        }
        finally { Exit-NovaCoreMissionLock $lock }
    }
    Invoke-TestCase 'mission-lock-orphan-proved-and-recovered' {
        if(-not(Test-Path $lockDirectory)){New-Item -ItemType Directory -Path $lockDirectory|Out-Null}
        $lockPath=Join-Path $lockDirectory "$($normal.missionId).lock.json"
        $dead=[PSCustomObject]@{schemaVersion='1.0.0';missionId=$normal.missionId;programId=$normal.program;processId=2147483000;host=[Environment]::MachineName;startedAt=[DateTimeOffset]::UtcNow.ToString('o');repository=$testRoot;branch='test-branch';inputFingerprint=$normalInput;scopeFingerprint=$scopeFingerprint}
        [IO.File]::WriteAllText($lockPath,($dead|ConvertTo-Json),[Text.UTF8Encoding]::new($false))
        $lock=Enter-NovaCoreMissionLock $normal $testRoot 'test-branch' $normalInput $scopeFingerprint $lockDirectory
        try { Assert-True (@(Get-ChildItem $lockDirectory -Filter '*.orphaned.*.json').Count -ge 1) }
        finally { Exit-NovaCoreMissionLock $lock }
    }
    Invoke-TestCase 'mission-lock-fingerprint-drift-rejected' {
        $lockPath=Join-Path $lockDirectory "$($normal.missionId).lock.json"
        $dead=[PSCustomObject]@{schemaVersion='1.0.0';missionId=$normal.missionId;programId=$normal.program;processId=2147483000;host=[Environment]::MachineName;startedAt=[DateTimeOffset]::UtcNow.ToString('o');repository=$testRoot;branch='test-branch';inputFingerprint=('F'*64);scopeFingerprint=$scopeFingerprint}
        [IO.File]::WriteAllText($lockPath,($dead|ConvertTo-Json),[Text.UTF8Encoding]::new($false))
        try { Assert-Throws {Enter-NovaCoreMissionLock $normal $testRoot 'test-branch' $normalInput $scopeFingerprint $lockDirectory} 'NOVA_CORE_MISSION_LOCK_FINGERPRINT_MISMATCH' }
        finally { if(Test-Path $lockPath){Remove-Item -LiteralPath $lockPath -Force} }
    }

}
finally {
    $resolved=[IO.Path]::GetFullPath($testRoot)
    $tempRoot=[IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if($resolved.StartsWith($tempRoot,[StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolved)){
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}

$failed=@($results|Where-Object{-not $_.Passed})
$summary=[PSCustomObject]@{Status=$(if($failed.Count -eq 0){'SUCCESS'}else{'FAILED'});Total=$results.Count;Passed=$results.Count-$failed.Count;Failed=$failed.Count;Results=@($results)}
$summary|Format-List
if($failed.Count -gt 0){$failed|Format-Table -AutoSize;exit 1}
exit 0

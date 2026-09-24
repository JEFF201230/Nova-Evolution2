Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (Join-Path $PSScriptRoot 'NovaCore.Governance.psm1') -Force
Import-Module (Join-Path $PSScriptRoot 'NovaCore.Reporting.psm1') -Force
Import-Module (Join-Path $PSScriptRoot 'NovaCore.AuthorityApproval.psm1') -Force
Import-Module (Join-Path $PSScriptRoot 'NovaCore.Governance.psm1') -Force

$results = [Collections.Generic.List[object]]::new()
function Invoke-TestCase {
    param([string]$Name,[scriptblock]$Action)
    try { & $Action; $results.Add([PSCustomObject]@{Name=$Name;Passed=$true;Detail=$null}) }
    catch { $results.Add([PSCustomObject]@{Name=$Name;Passed=$false;Detail=$_.Exception.Message}) }
}
function Assert-True { param([bool]$Value,[string]$Message='ASSERT_TRUE_FAILED'); if(-not $Value){throw $Message} }
function Assert-Equal { param($Expected,$Actual,[string]$Message='ASSERT_EQUAL_FAILED'); if([string]$Expected -cne [string]$Actual){throw "$Message`:EXPECTED=$Expected;ACTUAL=$Actual"} }
function Assert-Throws {
    param([scriptblock]$Action,[string]$Pattern)
    $message=$null; try { & $Action } catch { $message=$_.Exception.Message }
    if($null -eq $message){throw "EXPECTED_EXCEPTION_NOT_THROWN:$Pattern"}
    if($message -notlike $Pattern){throw "EXPECTED_EXCEPTION_MISMATCH:$Pattern`:ACTUAL=$message"}
}
function New-DeepValue {
    param([int]$Depth)
    $value=[PSCustomObject]@{Leaf='BOUND'}
    for($index=0;$index -lt $Depth;$index++){$value=[PSCustomObject]@{Child=$value}}
    return $value
}
$script:runIndex=10
function New-TestOfficialReport {
    param([string]$RunId,[string]$Nonce='A')
    if($RunId -cnotmatch '^bootstrap-[0-9]{8}T[0-9]{9}$'){
        $RunId=('bootstrap-20260919T000000{0:D3}' -f $script:runIndex)
        $script:runIndex++
    }
    $directory=Join-Path $testRoot ".nova-data\execution\reports\PROGRAM-003\WCF-001-CURRENT-AUTHORITY-RATIFICATION-001\$RunId"
    New-Item -ItemType Directory -Path $directory -Force|Out-Null
    $report=[PSCustomObject][ordered]@{
        SchemaVersion='1.0.0'
        Mission=[PSCustomObject]@{MissionId='WCF-001-CURRENT-AUTHORITY-RATIFICATION-001';Program='PROGRAM-003';Lot='WCF-001';Title='test'}
        Validations=@([PSCustomObject]@{Name='required';Required=$true;Passed=$true;Message=''})
        InputEvidence=[PSCustomObject]@{status='VALID'}
        OutputEvidence=[PSCustomObject]@{status='VALID'}
        TechnicalClassification='READY_FOR_REVIEW'
        FinalAuthority=[PSCustomObject]@{evidenceStatus='VALID';reviewRequirement='HUMAN_REVIEW_REQUIRED';authorityDecision='PENDING_REVIEW';finalMissionState='READY_FOR_REVIEW'}
        Nonce=$Nonce
        Deep=New-DeepValue 30
        ReportFingerprint=$null
    }
    $report.ReportFingerprint=Get-NovaCoreOfficialReportFingerprint $report
    $path=Join-Path $directory 'official-report.json'
    Write-NovaCoreUtf8Json $report $path
    return $path
}

$testRoot=Join-Path ([IO.Path]::GetTempPath()) ('nova-authority-test-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $testRoot|Out-Null
try {
    $evidenceRelative='Docs/authority.md'
    $evidencePath=Join-Path $testRoot $evidenceRelative
    New-Item -ItemType Directory -Path (Split-Path -Parent $evidencePath) -Force|Out-Null
    $evidence=@'
Decision ID:
PO-WCF001-HISTORICAL-PROVENANCE-RATIFICATION-001
Status:
APPROVED
Authority:
PROGRAM OWNER / SUPREME PROGRAM AUTHORITY
Current canonical authority ratification:
AUTHORIZED.
'@
    [IO.File]::WriteAllText($evidencePath,$evidence,[Text.UTF8Encoding]::new($false))
    $evidenceHash=(Get-FileHash $evidencePath -Algorithm SHA256).Hash
    $certificateDirectory=Join-Path $testRoot 'Docs/12_CERTIFICATION/WORK'
    New-Item -ItemType Directory -Path $certificateDirectory -Force|Out-Null
    $certificate=[PSCustomObject][ordered]@{
        MissionId='WCF-001-CURRENT-AUTHORITY-RATIFICATION-001';DomainId='WORK';LotId='WCF-001';Status='CERTIFIED'
        Evidence=@("AUTHORITY:$evidenceRelative#SHA256=$evidenceHash")
        CertificationOrigin='CURRENT_AUTHORITY_RATIFICATION';HistoricalCertificationProvenance='UNAVAILABLE'
        CapabilityValidation='RATIFIED';AuthorityDecisionId='PO-WCF001-HISTORICAL-PROVENANCE-RATIFICATION-001'
        HistoricalMissionId=$null;HistoricalCertifiedAt=$null
    }
    Write-NovaCoreUtf8Json $certificate (Join-Path $certificateDirectory 'WCF-001.certification.json')

    $acceptedPath=New-TestOfficialReport 'accepted' 'ACCEPTED'
    Invoke-TestCase 'official-report-fingerprint-survives-serialization-and-reload' {
        $loaded=[IO.File]::ReadAllText($acceptedPath,[Text.Encoding]::UTF8)|ConvertFrom-Json
        Assert-Equal $loaded.ReportFingerprint (Get-NovaCoreOfficialReportFingerprint $loaded)
        Assert-Equal 'BOUND' $loaded.Deep.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Child.Leaf
    }
    Invoke-TestCase 'accepted-decision-is-exactly-fingerprint-bound' {
        $result=Invoke-NovaCoreCurrentAuthorityRatificationReview $testRoot $acceptedPath WORK WCF-001 ACCEPTED PROGRAM_OWNER
        $loaded=[IO.File]::ReadAllText($acceptedPath,[Text.Encoding]::UTF8)|ConvertFrom-Json
        Assert-Equal 'ACCEPTED' $result.Decision
        Assert-Equal $loaded.ReportFingerprint $result.ReportFingerprint
        Assert-Equal $false $result.InvokeDomainLot
        Assert-True ([DateTimeOffset]::Parse($result.DecidedAt) -le [DateTimeOffset]::UtcNow)
    }
    Invoke-TestCase 'accepted-replay-is-idempotent-and-non-conflicting' {
        $result=Invoke-NovaCoreCurrentAuthorityRatificationReview $testRoot $acceptedPath WORK WCF-001 ACCEPTED PROGRAM_OWNER
        Assert-Equal 'ALREADY_RECORDED' $result.Status
        Assert-Equal 1 @([IO.File]::ReadAllLines($result.HistoryPath)|Where-Object{$_}).Count
    }
    Invoke-TestCase 'conflicting-replay-is-rejected' {
        Assert-Throws {
            Invoke-NovaCoreCurrentAuthorityRatificationReview $testRoot $acceptedPath WORK WCF-001 REJECTED PROGRAM_OWNER
        } 'NOVA_CORE_AUTHORITY_IDEMPOTENCY_CONFLICT'
    }
    Invoke-TestCase 'altered-report-content-is-rejected' {
        $path=New-TestOfficialReport 'altered' 'ALTERED'
        $report=[IO.File]::ReadAllText($path,[Text.Encoding]::UTF8)|ConvertFrom-Json
        $report.Nonce='MUTATED'
        Write-NovaCoreUtf8Json $report $path
        Assert-Throws {Read-NovaCoreVerifiedOfficialReport $testRoot $path} 'NOVA_CORE_AUTHORITY_REPORT_FINGERPRINT_MISMATCH'
    }
    Invoke-TestCase 'substituted-report-fingerprint-is-rejected' {
        $path=New-TestOfficialReport 'substituted' 'SUBSTITUTED'
        $report=[IO.File]::ReadAllText($path,[Text.Encoding]::UTF8)|ConvertFrom-Json
        $report.ReportFingerprint='A'*64
        Write-NovaCoreUtf8Json $report $path
        Assert-Throws {Read-NovaCoreVerifiedOfficialReport $testRoot $path} 'NOVA_CORE_AUTHORITY_REPORT_FINGERPRINT_MISMATCH'
    }
    Invoke-TestCase 'rejected-decision-remains-rejected' {
        $path=New-TestOfficialReport 'rejected' 'REJECTED'
        $first=Invoke-NovaCoreCurrentAuthorityRatificationReview $testRoot $path WORK WCF-001 REJECTED PROGRAM_OWNER
        $second=Invoke-NovaCoreCurrentAuthorityRatificationReview $testRoot $path WORK WCF-001 REJECTED PROGRAM_OWNER
        Assert-Equal 'REJECTED' $first.Decision
        Assert-Equal 'REJECTED' $second.Decision
        Assert-Equal 'ALREADY_RECORDED' $second.Status
    }
    Invoke-TestCase 'unauthorized-authority-is-rejected' {
        $path=New-TestOfficialReport 'unauthorized' 'UNAUTHORIZED'
        Assert-Throws {
            Invoke-NovaCoreCurrentAuthorityRatificationReview $testRoot $path WORK WCF-001 ACCEPTED PROGRAM_DIRECTOR
        } 'NOVA_CORE_AUTHORITY_UNAUTHORIZED'
    }
    Invoke-TestCase 'arbitrary-historical-lot-cannot-use-exception' {
        $path=New-TestOfficialReport 'arbitrary' 'ARBITRARY'
        $report=[IO.File]::ReadAllText($path,[Text.Encoding]::UTF8)|ConvertFrom-Json
        $report.Mission.Lot='WCF-999'
        $report.ReportFingerprint=Get-NovaCoreOfficialReportFingerprint $report
        Write-NovaCoreUtf8Json $report $path
        Assert-Throws {
            Invoke-NovaCoreCurrentAuthorityRatificationReview $testRoot $path WORK WCF-999 ACCEPTED PROGRAM_OWNER
        } 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_CERTIFICATE_REQUIRED'
    }
    Invoke-TestCase 'stale-official-report-is-rejected' {
        $stale=New-TestOfficialReport 'bootstrap-20260919T000000000' 'STALE'
        [void](New-TestOfficialReport 'bootstrap-20260919T000000001' 'CURRENT')
        Assert-Throws {Read-NovaCoreVerifiedOfficialReport $testRoot $stale} 'NOVA_CORE_AUTHORITY_REPORT_STALE'
    }
}
finally {
    $resolved=[IO.Path]::GetFullPath($testRoot)
    $temp=[IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if($resolved.StartsWith($temp,[StringComparison]::OrdinalIgnoreCase) -and (Test-Path $resolved)){
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}

$failed=@($results|Where-Object{-not $_.Passed})
$summary=[PSCustomObject]@{Status=$(if($failed.Count -eq 0){'SUCCESS'}else{'FAILED'});Total=$results.Count;Passed=$results.Count-$failed.Count;Failed=$failed.Count;Results=@($results)}
$summary|Format-List
if($failed.Count -gt 0){$failed|Format-Table -AutoSize;exit 1}
exit 0

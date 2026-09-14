[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$ReportPath,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$DomainId,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$LotId,

    [Parameter(Mandatory)]
    [ValidateSet('ACCEPTED','REJECTED')]
    [string]$Decision
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (
    Join-Path $PSScriptRoot 'Cerebrau.DomainOrchestration.psm1'
) -Force

Import-Module (
    Join-Path $PSScriptRoot 'NovaCore.Governance.psm1'
) -Force

$resolvedReportPath = (
    Resolve-Path -LiteralPath $ReportPath -ErrorAction Stop
).Path

$report = Get-Content `
    -LiteralPath $resolvedReportPath `
    -Raw `
    -Encoding UTF8 |
    ConvertFrom-Json

if (-not $report.ReportFingerprint) {
    throw 'CEREBRAU_APPROVAL_REPORT_FINGERPRINT_MISSING'
}

$expectedFingerprint = Get-NovaCoreOfficialReportFingerprint `
    -Report $report

if ([string]$report.ReportFingerprint -cne [string]$expectedFingerprint) {
    throw 'CEREBRAU_APPROVAL_REPORT_FINGERPRINT_INVALID'
}

$review = [PSCustomObject][ordered]@{
    decision = $Decision
    authority = 'PROGRAM_DIRECTOR'
    reportFingerprint = [string]$report.ReportFingerprint
    decidedAt = [DateTimeOffset]::UtcNow.ToString('o')
}

$validationResults = @()

if ($report.PSObject.Properties.Name -contains 'Validations') {
    $validationResults = @($report.Validations)
}
elseif ($report.PSObject.Properties.Name -contains 'ValidationResults') {
    $validationResults = @($report.ValidationResults)
}

$finalAuthority = Resolve-NovaCoreFinalAuthorityDecision `
    -TechnicalClassification ([string]$report.TechnicalClassification) `
    -ValidationResults $validationResults `
    -EvidenceStatus 'VALID' `
    -ReviewRequired $true `
    -AuthorityReview $review `
    -ReportFingerprint ([string]$report.ReportFingerprint)

if ([string]$finalAuthority.authorityDecision -cne $Decision) {
    throw 'CEREBRAU_APPROVAL_AUTHORITY_DECISION_MISMATCH'
}

if ($Decision -eq 'REJECTED') {
    Write-Host 'REJECTED - human authority decision recorded.'
    $finalAuthority
    exit 0
}

Write-Host 'ACCEPTED - authority review validated.'

$tests = @($report.Validations)

$evidence = $report.OutputEvidence

$regressions = if (@($validationResults | Where-Object { $_.Required -and -not $_.Passed }).Count -eq 0) { 'NONE' } else { 'BLOCKING' }

$executor = {
    param($Context)
    [PSCustomObject][ordered]@{
        OfficialStatus = [string]$report.Status
        AuthorityDecision = [string]$finalAuthority.authorityDecision
        FinalMissionState = [string]$finalAuthority.finalMissionState
        ExitCode = [int]$report.Codex.ExitCode
        OfficialReport = $report
        Evidence = [object[]]$evidence
        Tests = [object[]]$tests
        Regressions = $regressions
        ContractCriteriaSatisfied = $true
    }
}.GetNewClosure()

$repository = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$domainContext = Resolve-DomainContext -Repository $repository -DomainId $DomainId
$currentLot = Resolve-CurrentLot -Repository $repository -DomainId $DomainId -DomainContext $domainContext
if ($currentLot.DomainCertification -or [string]$currentLot.CurrentLot -cne $LotId) {
    throw "LOT_APPROVAL_TARGET_MISMATCH:REQUESTED=$LotId;CURRENT=$($currentLot.CurrentLot)"
}

$result = Invoke-DomainLot `
    -Repository (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) `
    -DomainId $DomainId `
    -Executor $executor `
    -MissionId ([string]$report.Mission.MissionId)

$result


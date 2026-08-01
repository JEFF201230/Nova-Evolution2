[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$InputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$resolvedInput = (Resolve-Path -LiteralPath $InputPath -ErrorAction Stop).Path
$inputValue = Get-Content -LiteralPath $resolvedInput -Raw -Encoding UTF8 |
    ConvertFrom-Json

$requiredProperties = @(
    'ExecutionMode',
    'OfficialStatus',
    'AuthorityDecision',
    'FinalMissionState',
    'ExitCode',
    'OfficialReport',
    'Evidence',
    'Tests',
    'Regressions',
    'ContractCriteriaSatisfied'
)
foreach ($property in $requiredProperties) {
    if ($inputValue.PSObject.Properties.Name -cnotcontains $property) {
        throw "CEREBRAU_POLICY_INPUT_MISSING:$property"
    }
}

Import-Module (
    Join-Path $PSScriptRoot 'Cerebrau.DomainOrchestration.psm1'
) -Force

$decision = Resolve-MissionOutcomeToLotCertificationDecision `
    -ExecutionMode $inputValue.ExecutionMode `
    -OfficialStatus $inputValue.OfficialStatus `
    -AuthorityDecision $inputValue.AuthorityDecision `
    -FinalMissionState $inputValue.FinalMissionState `
    -ExitCode $inputValue.ExitCode `
    -OfficialReport $inputValue.OfficialReport `
    -Evidence $inputValue.Evidence `
    -Tests $inputValue.Tests `
    -Regressions $inputValue.Regressions `
    -ContractCriteriaSatisfied $inputValue.ContractCriteriaSatisfied

$decision | ConvertTo-Json -Depth 20 -Compress

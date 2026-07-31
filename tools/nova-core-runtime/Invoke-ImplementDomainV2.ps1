[CmdletBinding()]
param(
    [AllowNull()][AllowEmptyString()][string]$Domain,
    [switch]$DryRun,
    [string]$Repository,
    [string]$LotExecutorPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (
    Join-Path $PSScriptRoot 'Cerebrau.DomainOrchestration.psm1'
) -Force

if ([string]::IsNullOrWhiteSpace($Repository)) {
    $Repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
}

$executor = $null
if (-not [string]::IsNullOrWhiteSpace($LotExecutorPath)) {
    $executorPath = [IO.Path]::GetFullPath($LotExecutorPath)
    if (-not (Test-Path -LiteralPath $executorPath -PathType Leaf)) {
        throw 'LOT_EXECUTOR_NOT_FOUND'
    }
    $executor = {
        param($Context)
        & $executorPath -Context $Context
    }.GetNewClosure()
}

$parameters = @{
    Repository = $Repository
    DomainId = $Domain
    DryRun = $DryRun
    MissionId = 'IMPLEMENT-DOMAIN-V2'
}
if ($null -ne $executor) { $parameters.Executor = $executor }

Invoke-DomainLot @parameters

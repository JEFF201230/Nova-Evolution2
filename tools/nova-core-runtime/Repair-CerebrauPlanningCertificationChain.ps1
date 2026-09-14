[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Repository
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = [IO.Path]::GetFullPath($Repository)
$registryPath = Join-Path $root 'Docs\12_CERTIFICATION\certification-registry.json'
$domainPath = Join-Path $root 'Docs\12_CERTIFICATION\PLANNING'

$dId = 'P3-PLANNING-001D'
$eId = 'P3-PLANNING-001E'
$fId = 'P3-PLANNING-001F'

$dPath = Join-Path $domainPath "$dId.certification.json"
$ePath = Join-Path $domainPath "$eId.certification.json"
$fPath = Join-Path $domainPath "$fId.certification.json"

foreach ($path in @($registryPath,$dPath,$ePath,$fPath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "CHAIN_REPAIR_REQUIRED_FILE_MISSING:$path"
    }
}

$d = Get-Content -Raw -LiteralPath $dPath -Encoding UTF8 | ConvertFrom-Json
$e = Get-Content -Raw -LiteralPath $ePath -Encoding UTF8 | ConvertFrom-Json
$f = Get-Content -Raw -LiteralPath $fPath -Encoding UTF8 | ConvertFrom-Json
$registry = Get-Content -Raw -LiteralPath $registryPath -Encoding UTF8 | ConvertFrom-Json

if ([string]$d.Status -cne 'CERTIFIED') {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:D_NOT_CERTIFIED'
}
if ([string]$e.Status -cne 'CERTIFIED') {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:E_NOT_CERTIFIED'
}
if ([string]$f.Status -cne 'PENDING_EVIDENCE') {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:F_NOT_PENDING_EVIDENCE'
}
if ([string]$e.MissionId -cne [string]$d.MissionId) {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:E_DOES_NOT_REUSE_D_MISSION'
}
if ([string]$f.MissionId -cne [string]$d.MissionId) {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:F_DOES_NOT_REUSE_D_MISSION'
}
if ([string]$e.PreviousLot -cne $dId -or [string]$e.NextAuthorizedLot -cne $fId) {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:E_LINKS_INVALID'
}
if ([string]$f.PreviousLot -cne $eId) {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:F_LINK_INVALID'
}

$eRegistry = @($registry.Entries | Where-Object {
    [string]$_.DomainId -ceq 'PLANNING' -and [string]$_.LotId -ceq $eId
})
$fRegistry = @($registry.Entries | Where-Object {
    [string]$_.DomainId -ceq 'PLANNING' -and [string]$_.LotId -ceq $fId
})

if ($eRegistry.Count -ne 1 -or [string]$eRegistry[0].Status -cne 'CERTIFIED') {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:E_REGISTRY_INVALID'
}
if ($fRegistry.Count -ne 1 -or [string]$fRegistry[0].Status -cne 'PENDING_EVIDENCE') {
    throw 'CHAIN_REPAIR_PRECONDITION_FAILED:F_REGISTRY_INVALID'
}

Write-Output 'CHAIN_REPAIR_PREFLIGHT_VALID'
Import-Module (Join-Path $PSScriptRoot 'Cerebrau.Certification.psm1') -Force
Repair-CerebrauCertificationChain `
    -Repository $root `
    -DomainId 'PLANNING' `
    -InvalidCertifiedLotId $eId `
    -PrematurePendingLotId $fId `
    -ExpectedMissionId ([string]$d.MissionId)


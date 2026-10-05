[CmdletBinding()]
param(
    [string]$Repository = '',
    [string]$OutputPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Repository)) {
    $Repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
}
else {
    $Repository = [IO.Path]::GetFullPath($Repository)
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $Repository '.nova-data\project-tracking\NOVA_WORK_REFERENTIAL_CURRENT_STATE.json'
}
else {
    $OutputPath = [IO.Path]::GetFullPath($OutputPath)
}

$RegistryPath = Join-Path $Repository 'Docs\12_CERTIFICATION\certification-registry.json'
if (-not (Test-Path -LiteralPath $RegistryPath -PathType Leaf)) {
    throw "CERTIFICATION_REGISTRY_NOT_FOUND:$RegistryPath"
}

function Test-AnyFile {
    param([Parameter(Mandatory)][string[]]$Patterns)
    foreach ($pattern in $Patterns) {
        $matches = @(Get-ChildItem -LiteralPath $Repository -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object {
                $relative = $_.FullName.Substring($Repository.Length + 1).Replace('\','/')
                $relative -like $pattern
            })
        if ($matches.Count -gt 0) { return $true }
    }
    return $false
}

function Get-CertificationState {
    param([Parameter(Mandatory)][string]$LotId)

    $registry = Get-Content -LiteralPath $RegistryPath -Raw | ConvertFrom-Json
    $entry = @($registry.Entries | Where-Object { [string]$_.DomainId -eq 'WORK' -and [string]$_.LotId -eq $LotId }) |
        Select-Object -First 1

    if ($null -eq $entry) {
        return [PSCustomObject][ordered]@{
            lotId = $LotId
            registryStatus = 'ABSENT'
            certificationStatus = 'ABSENT'
            missionId = $null
            certificationPath = $null
        }
    }

    $certPath = [string]$entry.CertificationPath
    $status = [string]$entry.Status
    $missionId = $null
    if (-not [string]::IsNullOrWhiteSpace($certPath)) {
        $absolute = Join-Path $Repository ($certPath -replace '/', '\')
        if ((Test-Path -LiteralPath $absolute -PathType Leaf) -and $certPath.EndsWith('.json', [StringComparison]::OrdinalIgnoreCase)) {
            $cert = Get-Content -LiteralPath $absolute -Raw | ConvertFrom-Json
            $status = [string]$cert.Status
            $missionId = [string]$cert.MissionId
        }
    }

    return [PSCustomObject][ordered]@{
        lotId = $LotId
        registryStatus = [string]$entry.Status
        certificationStatus = $status
        missionId = $missionId
        certificationPath = $certPath
    }
}

$LegacyLots = @(
    'WCF-001','WCF-002','WCF-003','WCF-004A','WCF-004',
    'WCF-005','WCF-006','WCF-007','WORK-AUTHORIZED-STATE-001','WCF-008-CLOSURE'
)
$Legacy = @($LegacyLots | ForEach-Object { Get-CertificationState -LotId $_ })

$Capabilities = @(
    [PSCustomObject][ordered]@{
        capability = 'WORK_PLAN'; roadmapLot = 'NOVA-R07'
        runtime = @('server/runtime/work/work-planning.*','server/domain/work/work-planning.*')
        core = @('server/nova-core/*work-plan*')
        bff = @('server/nova-bff/*work-plan*')
        frontend = @('apps/nova-web/src/**/*work*plan*','apps/nova-web/src/**/*Work*Plan*')
    },
    [PSCustomObject][ordered]@{
        capability = 'WORK_PEOPLE'; roadmapLot = 'NOVA-R08'
        runtime = @('server/runtime/work/work-people.*')
        core = @('server/nova-core/*work-people*')
        bff = @('server/nova-bff/*work-people*')
        frontend = @('apps/nova-web/src/**/*work*people*','apps/nova-web/src/**/*Work*People*')
    },
    [PSCustomObject][ordered]@{
        capability = 'WORK_DECISIONS'; roadmapLot = 'NOVA-R09'
        runtime = @('server/runtime/work/work-decisions.*')
        core = @('server/nova-core/*work-decision*')
        bff = @('server/nova-bff/*work-decision*')
        frontend = @('apps/nova-web/src/**/*work*decision*','apps/nova-web/src/**/*Work*Decision*')
    },
    [PSCustomObject][ordered]@{
        capability = 'WORK_DELIVERABLES'; roadmapLot = 'NOVA-R10'
        runtime = @('server/runtime/work/work-deliverables.*')
        core = @('server/nova-core/*work-deliverable*')
        bff = @('server/nova-bff/*work-deliverable*')
        frontend = @('apps/nova-web/src/**/*work*deliverable*','apps/nova-web/src/**/*Work*Deliverable*')
    },
    [PSCustomObject][ordered]@{
        capability = 'WORK_SOURCES'; roadmapLot = 'NOVA-R11'
        runtime = @('server/domain/work/work-evidence.*','server/runtime/work/*evidence*','server/runtime/work/*source*')
        core = @('server/nova-core/*work-source*','server/nova-core/*work-evidence*')
        bff = @('server/nova-bff/*work-source*','server/nova-bff/*work-evidence*')
        frontend = @('apps/nova-web/src/**/*work*source*','apps/nova-web/src/**/*Work*Source*')
    }
)

$CapabilityStates = foreach ($cap in $Capabilities) {
    $runtime = Test-AnyFile -Patterns $cap.runtime
    $core = Test-AnyFile -Patterns $cap.core
    $bff = Test-AnyFile -Patterns $cap.bff
    $frontend = Test-AnyFile -Patterns $cap.frontend

    $decision = if ($runtime -and $core -and $bff -and $frontend) {
        'VERIFY_REAL_PATH'
    }
    elseif ($runtime) {
        'CONNECT_EXISTING'
    }
    else {
        'HUMAN_REVIEW_REQUIRED'
    }

    [PSCustomObject][ordered]@{
        capability = $cap.capability
        roadmapLot = $cap.roadmapLot
        runtimeImplemented = $runtime
        coreImplemented = $core
        bffImplemented = $bff
        frontendImplemented = $frontend
        decision = $decision
    }
}

$FixtureFiles = @(Get-ChildItem -LiteralPath (Join-Path $Repository 'apps\nova-web\src') -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Name -match 'fixture|mock' -and
        $_.FullName -match '[\\/]work[\\/]'
    } |
    ForEach-Object { $_.FullName.Substring($Repository.Length + 1).Replace('\','/') } |
    Sort-Object -Unique)

$CertifiedLegacy = @($Legacy | Where-Object { $_.certificationStatus -eq 'CERTIFIED' }).Count
$UnresolvedLegacy = @($Legacy | Where-Object { $_.certificationStatus -notin @('CERTIFIED','ACCEPTED') })

$Overall = if ($UnresolvedLegacy.Count -gt 0) {
    'HUMAN_REVIEW_REQUIRED'
}
elseif (@($CapabilityStates | Where-Object { $_.decision -eq 'HUMAN_REVIEW_REQUIRED' }).Count -gt 0) {
    'PARTIAL_PRODUCT_RECONCILIATION'
}
else {
    'RECONCILED_FOUNDATION_PRODUCT_PATHS_PENDING'
}

$Result = [PSCustomObject][ordered]@{
    schemaVersion = 1
    domain = 'WORK'
    generatedAt = [DateTime]::UtcNow.ToString('o')
    repository = $Repository
    authorityPolicy = [PSCustomObject][ordered]@{
        legacyIsReadOnly = $true
        certificationsAreReadOnly = $true
        currentStateIsProjection = $true
        automaticCertificationForbidden = $true
        fuzzyMissionMatchingForbidden = $true
    }
    legacy = $Legacy
    capabilities = @($CapabilityStates)
    fixtures = $FixtureFiles
    summary = [PSCustomObject][ordered]@{
        legacyLots = $Legacy.Count
        certifiedLegacyLots = $CertifiedLegacy
        unresolvedLegacyLots = $UnresolvedLegacy.Count
        fixtureFiles = $FixtureFiles.Count
        overall = $Overall
    }
}

$parent = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
}

$Result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host 'WORK_REFERENTIAL_RECONCILED'
Write-Host "OVERALL=$Overall"
Write-Host "OUTPUT=$OutputPath"

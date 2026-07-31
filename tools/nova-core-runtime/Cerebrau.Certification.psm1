Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$script:CertificationStatuses = @(
    'CERTIFIED',
    'REJECTED',
    'PENDING_EVIDENCE'
)
$script:CertificationRoot = 'Docs/12_CERTIFICATION'
$script:RegistryRelativePath = 'Docs/12_CERTIFICATION/certification-registry.json'

function Test-CerebrauProperty {
    param($Value, [Parameter(Mandatory)][string]$Name)
    return $null -ne $Value -and $Value.PSObject.Properties.Name -contains $Name
}

function Assert-CerebrauText {
    param(
        [AllowNull()][object]$Value,
        [Parameter(Mandatory)][string]$Name
    )
    if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string]$Value)) {
        throw "CEREBRAU_CERTIFICATION_REQUIRED:$Name"
    }
}

function Assert-CerebrauIdentifier {
    param(
        [AllowNull()][object]$Value,
        [Parameter(Mandatory)][string]$Name,
        [switch]$AllowNull
    )
    if ($null -eq $Value -and $AllowNull) { return }
    Assert-CerebrauText -Value $Value -Name $Name
    if ([string]$Value -notmatch '^[A-Z0-9][A-Z0-9._-]*$') {
        throw "CEREBRAU_CERTIFICATION_IDENTIFIER_INVALID:$Name"
    }
}

function Get-CerebrauRepositoryRoot {
    param([Parameter(Mandatory)][string]$Repository)
    Assert-CerebrauText -Value $Repository -Name 'Repository'
    $root = [IO.Path]::GetFullPath($Repository)
    if (-not (Test-Path -LiteralPath $root -PathType Container)) {
        throw 'CEREBRAU_CERTIFICATION_REPOSITORY_NOT_FOUND'
    }
    return $root.TrimEnd('\','/')
}

function Resolve-CerebrauRepositoryPath {
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$RelativePath
    )
    if ([IO.Path]::IsPathRooted($RelativePath) -or
        $RelativePath -match '(^|[\\/])\.\.([\\/]|$)') {
        throw 'CEREBRAU_CERTIFICATION_PATH_INVALID'
    }
    $root = Get-CerebrauRepositoryRoot -Repository $Repository
    $path = [IO.Path]::GetFullPath((Join-Path $root $RelativePath))
    if (-not ($path.StartsWith(
        $root + [IO.Path]::DirectorySeparatorChar,
        [StringComparison]::OrdinalIgnoreCase
    ))) {
        throw 'CEREBRAU_CERTIFICATION_PATH_OUTSIDE_REPOSITORY'
    }
    return $path
}

function New-CerebrauEmptyRegistry {
    return [PSCustomObject][ordered]@{
        SchemaVersion = 1
        Entries = [object[]]@()
    }
}

function Assert-CerebrauRegistry {
    param([Parameter(Mandatory)]$Registry)
    if (-not (Test-CerebrauProperty $Registry 'SchemaVersion') -or
        [int]$Registry.SchemaVersion -ne 1 -or
        -not (Test-CerebrauProperty $Registry 'Entries')) {
        throw 'CEREBRAU_CERTIFICATION_REGISTRY_INVALID'
    }
    $seenLots = @{}
    foreach ($entry in @($Registry.Entries)) {
        foreach ($property in @(
            'DomainId',
            'LotId',
            'CertificationPath',
            'Status',
            'PreviousLot',
            'NextAuthorizedLot'
        )) {
            if (-not (Test-CerebrauProperty $entry $property)) {
                throw "CEREBRAU_CERTIFICATION_REGISTRY_PROPERTY_MISSING:$property"
            }
        }
        Assert-CerebrauIdentifier $entry.DomainId 'DomainId'
        Assert-CerebrauIdentifier $entry.LotId 'LotId'
        Assert-CerebrauText $entry.CertificationPath 'CertificationPath'
        Assert-CerebrauIdentifier $entry.PreviousLot 'PreviousLot' -AllowNull
        Assert-CerebrauIdentifier $entry.NextAuthorizedLot 'NextAuthorizedLot' -AllowNull
        if ($script:CertificationStatuses -notcontains [string]$entry.Status) {
            throw 'CEREBRAU_CERTIFICATION_STATUS_INVALID'
        }
        $lotKey = [string]$entry.LotId
        if ($seenLots.ContainsKey($lotKey)) {
            throw "CONTEXT_AMBIGUOUS:DUPLICATE_LOT:$($entry.DomainId):$($entry.LotId)"
        }
        $seenLots[$lotKey] = $true
    }
}

function Read-CerebrauRegistry {
    param([Parameter(Mandatory)][string]$Repository)
    $path = Resolve-CerebrauRepositoryPath `
        -Repository $Repository `
        -RelativePath $script:RegistryRelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        return New-CerebrauEmptyRegistry
    }
    try {
        $registry = Get-Content -LiteralPath $path -Raw -Encoding UTF8 |
            ConvertFrom-Json
    }
    catch {
        throw "CEREBRAU_CERTIFICATION_REGISTRY_INVALID:$($_.Exception.Message)"
    }
    Assert-CerebrauRegistry -Registry $registry
    return $registry
}

function Assert-LotCertification {
    param([Parameter(Mandatory)]$Certification)
    $required = @(
        'MissionId',
        'DomainId',
        'LotId',
        'Status',
        'CertifiedAt',
        'Evidence',
        'Tests',
        'Regressions',
        'PreviousLot',
        'NextAuthorizedLot'
    )
    foreach ($property in $required) {
        if (-not (Test-CerebrauProperty $Certification $property)) {
            throw "CEREBRAU_CERTIFICATION_PROPERTY_MISSING:$property"
        }
    }
    Assert-CerebrauText $Certification.MissionId 'MissionId'
    Assert-CerebrauIdentifier $Certification.DomainId 'DomainId'
    Assert-CerebrauIdentifier $Certification.LotId 'LotId'
    Assert-CerebrauIdentifier $Certification.PreviousLot 'PreviousLot' -AllowNull
    Assert-CerebrauIdentifier $Certification.NextAuthorizedLot 'NextAuthorizedLot' -AllowNull
    Assert-CerebrauText $Certification.Regressions 'Regressions'
    if ($script:CertificationStatuses -notcontains [string]$Certification.Status) {
        throw 'CEREBRAU_CERTIFICATION_STATUS_INVALID'
    }
    if ($null -eq $Certification.Evidence -or
        $Certification.Evidence -is [string] -or
        $null -eq $Certification.Tests -or
        $Certification.Tests -is [string]) {
        throw 'CEREBRAU_CERTIFICATION_COLLECTION_INVALID'
    }
    foreach ($evidence in @($Certification.Evidence)) {
        Assert-CerebrauText $evidence 'Evidence'
    }
    foreach ($test in @($Certification.Tests)) {
        Assert-CerebrauText $test 'Tests'
    }
    if ([string]$Certification.Status -eq 'CERTIFIED') {
        if (@($Certification.Evidence).Count -eq 0) {
            throw 'CEREBRAU_CERTIFICATION_EVIDENCE_REQUIRED'
        }
        if (@($Certification.Tests).Count -eq 0) {
            throw 'CEREBRAU_CERTIFICATION_TESTS_REQUIRED'
        }
        Assert-CerebrauText $Certification.CertifiedAt 'CertifiedAt'
        $parsed = [DateTimeOffset]::MinValue
        if (-not [DateTimeOffset]::TryParse(
            [string]$Certification.CertifiedAt,
            [Globalization.CultureInfo]::InvariantCulture,
            [Globalization.DateTimeStyles]::RoundtripKind,
            [ref]$parsed
        )) {
            throw 'CEREBRAU_CERTIFICATION_DATE_INVALID'
        }
    }
    elseif ($null -ne $Certification.CertifiedAt) {
        throw 'CEREBRAU_CERTIFICATION_DATE_FOR_NON_CERTIFIED'
    }
}

function ConvertTo-CerebrauJson {
    param([Parameter(Mandatory)]$Value)
    return ($Value | ConvertTo-Json -Depth 30) + [Environment]::NewLine
}

function Write-CerebrauAtomicText {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Content
    )
    $parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    $temporaryPath = "$Path.$([guid]::NewGuid().ToString('N')).tmp"
    try {
        [IO.File]::WriteAllText($temporaryPath, $Content, $script:Utf8NoBom)
        if (Test-Path -LiteralPath $Path -PathType Leaf) {
            $backupPath = "$Path.$([guid]::NewGuid().ToString('N')).rollback"
            try {
                [IO.File]::Replace($temporaryPath, $Path, $backupPath, $true)
            }
            finally {
                if (Test-Path -LiteralPath $backupPath -PathType Leaf) {
                    Remove-Item -LiteralPath $backupPath -Force
                }
            }
        }
        else {
            Move-Item -LiteralPath $temporaryPath -Destination $Path
        }
    }
    finally {
        if (Test-Path -LiteralPath $temporaryPath -PathType Leaf) {
            Remove-Item -LiteralPath $temporaryPath -Force
        }
    }
}

function Get-CerebrauDomainEntries {
    param(
        [Parameter(Mandatory)]$Registry,
        [Parameter(Mandatory)][string]$DomainId
    )
    Assert-CerebrauIdentifier $DomainId 'DomainId'
    return @($Registry.Entries | Where-Object {
        [string]$_.DomainId -ceq $DomainId
    })
}

function Test-LotContinuity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        $Registry
    )
    if ($null -eq $Registry) {
        $Registry = Read-CerebrauRegistry -Repository $Repository
    }
    Assert-CerebrauRegistry -Registry $Registry
    $entries = @(Get-CerebrauDomainEntries -Registry $Registry -DomainId $DomainId)
    if ($entries.Count -eq 0) {
        return [PSCustomObject][ordered]@{
            IsContinuous = $true
            OrderedLots = [object[]]@()
        }
    }
    $byLot = @{}
    foreach ($entry in $entries) { $byLot[[string]$entry.LotId] = $entry }
    $roots = @($entries | Where-Object { $null -eq $_.PreviousLot })
    if ($roots.Count -ne 1) {
        throw "LOT_CONTINUITY_BROKEN:ROOT_COUNT:$($roots.Count)"
    }
    foreach ($entry in $entries) {
        if ($null -ne $entry.PreviousLot) {
            if (-not $byLot.ContainsKey([string]$entry.PreviousLot)) {
                throw "LOT_CONTINUITY_BROKEN:PREVIOUS_MISSING:$($entry.LotId)"
            }
            $previous = $byLot[[string]$entry.PreviousLot]
            if ([string]$previous.Status -ne 'CERTIFIED') {
                throw "LOT_CONTINUITY_BROKEN:PREVIOUS_NOT_CERTIFIED:$($entry.LotId)"
            }
            if ([string]$previous.NextAuthorizedLot -cne [string]$entry.LotId) {
                throw "LOT_CONTINUITY_BROKEN:PREVIOUS_NEXT_MISMATCH:$($previous.LotId):$($entry.LotId)"
            }
        }
        if ($null -ne $entry.NextAuthorizedLot -and
            $byLot.ContainsKey([string]$entry.NextAuthorizedLot)) {
            $next = $byLot[[string]$entry.NextAuthorizedLot]
            if ([string]$next.PreviousLot -cne [string]$entry.LotId) {
                throw "LOT_CONTINUITY_BROKEN:NEXT_PREVIOUS_MISMATCH:$($entry.LotId):$($next.LotId)"
            }
        }
    }
    $ordered = [Collections.Generic.List[object]]::new()
    $visited = @{}
    $current = $roots[0]
    $nonCertifiedSeen = $false
    while ($null -ne $current) {
        if ($visited.ContainsKey([string]$current.LotId)) {
            throw "CONTEXT_AMBIGUOUS:LOT_CYCLE:$($current.LotId)"
        }
        $visited[[string]$current.LotId] = $true
        $ordered.Add($current)
        if ([string]$current.Status -ne 'CERTIFIED') {
            $nonCertifiedSeen = $true
        }
        elseif ($nonCertifiedSeen) {
            throw "LOT_CONTINUITY_BROKEN:STATUS_GAP:$($current.LotId)"
        }
        if ($null -eq $current.NextAuthorizedLot -or
            -not $byLot.ContainsKey([string]$current.NextAuthorizedLot)) {
            $current = $null
        }
        else {
            $current = $byLot[[string]$current.NextAuthorizedLot]
        }
    }
    if ($visited.Count -ne $entries.Count) {
        throw 'LOT_CONTINUITY_BROKEN:DISCONNECTED_CHAIN'
    }
    return [PSCustomObject][ordered]@{
        IsContinuous = $true
        OrderedLots = [object[]]$ordered.ToArray()
    }
}

function Test-CerebrauBackfillAuthorization {
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)]$Registry,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId
    )
    $continuity = Test-LotContinuity `
        -Repository $Repository `
        -DomainId $DomainId `
        -Registry $Registry
    $ordered = @($continuity.OrderedLots)
    if ($ordered.Count -eq 0) { return $true }
    $lastCertified = $null
    foreach ($entry in $ordered) {
        if ([string]$entry.Status -ne 'CERTIFIED') { break }
        $lastCertified = $entry
    }
    if ($null -eq $lastCertified) {
        return [string]$ordered[0].LotId -ceq $LotId
    }
    return $null -ne $lastCertified.NextAuthorizedLot -and
        [string]$lastCertified.NextAuthorizedLot -ceq $LotId
}

function Read-LotCertification {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId
    )
    Assert-CerebrauIdentifier $DomainId 'DomainId'
    Assert-CerebrauIdentifier $LotId 'LotId'
    $registry = Read-CerebrauRegistry -Repository $Repository
    [void](Test-LotContinuity `
        -Repository $Repository `
        -DomainId $DomainId `
        -Registry $registry)
    $entries = @(Get-CerebrauDomainEntries -Registry $registry -DomainId $DomainId |
        Where-Object { [string]$_.LotId -ceq $LotId })
    if ($entries.Count -eq 0) {
        return [PSCustomObject][ordered]@{
            MissionId = "BACKFILL-$LotId"
            DomainId = $DomainId
            LotId = $LotId
            Status = 'PENDING_EVIDENCE'
            CertifiedAt = $null
            Evidence = [object[]]@()
            Tests = [object[]]@()
            Regressions = 'NOT_EVALUATED'
            PreviousLot = $null
            NextAuthorizedLot = $null
            Materialized = $false
            BackfillAuthorized = (Test-CerebrauBackfillAuthorization `
                -Repository $Repository `
                -Registry $registry `
                -DomainId $DomainId `
                -LotId $LotId)
            Legacy = $false
        }
    }
    if ($entries.Count -ne 1) {
        throw "CONTEXT_AMBIGUOUS:DUPLICATE_LOT:${DomainId}:${LotId}"
    }
    $entry = $entries[0]
    $path = Resolve-CerebrauRepositoryPath `
        -Repository $Repository `
        -RelativePath ([string]$entry.CertificationPath)
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        if ([string]$entry.Status -eq 'PENDING_EVIDENCE') {
            return [PSCustomObject][ordered]@{
                MissionId = "BACKFILL-$LotId"
                DomainId = $DomainId
                LotId = $LotId
                Status = 'PENDING_EVIDENCE'
                CertifiedAt = $null
                Evidence = [object[]]@()
                Tests = [object[]]@()
                Regressions = 'NOT_EVALUATED'
                PreviousLot = $entry.PreviousLot
                NextAuthorizedLot = $entry.NextAuthorizedLot
                Materialized = $false
                BackfillAuthorized = (Test-CerebrauBackfillAuthorization `
                    -Repository $Repository `
                    -Registry $registry `
                    -DomainId $DomainId `
                    -LotId $LotId)
                Legacy = $false
            }
        }
        throw "CEREBRAU_CERTIFICATION_FILE_MISSING:$($entry.CertificationPath)"
    }
    if ([IO.Path]::GetExtension($path) -ieq '.md') {
        $text = Get-Content -LiteralPath $path -Raw -Encoding UTF8
        if ([string]$entry.Status -ne 'CERTIFIED' -or
            $text -notmatch '(?im)\*\*VERDICT\s*:\s*GO\*\*') {
            throw "CEREBRAU_LEGACY_CERTIFICATION_INVALID:$LotId"
        }
        if ($null -ne $entry.NextAuthorizedLot -and
            $text -notmatch [regex]::Escape([string]$entry.NextAuthorizedLot)) {
            throw "CEREBRAU_LEGACY_NEXT_LOT_MISMATCH:$LotId"
        }
        return [PSCustomObject][ordered]@{
            MissionId = "LEGACY-$LotId"
            DomainId = $DomainId
            LotId = $LotId
            Status = 'CERTIFIED'
            CertifiedAt = $null
            Evidence = [object[]]@([string]$entry.CertificationPath)
            Tests = [object[]]@()
            Regressions = 'LEGACY_NOT_STRUCTURED'
            PreviousLot = $entry.PreviousLot
            NextAuthorizedLot = $entry.NextAuthorizedLot
            Materialized = $true
            BackfillAuthorized = $false
            Legacy = $true
        }
    }
    try {
        $certification = Get-Content -LiteralPath $path -Raw -Encoding UTF8 |
            ConvertFrom-Json
    }
    catch {
        throw "CEREBRAU_CERTIFICATION_FILE_INVALID:$LotId"
    }
    Assert-LotCertification -Certification $certification
    if ([string]$certification.DomainId -cne $DomainId -or
        [string]$certification.LotId -cne $LotId -or
        [string]$certification.Status -cne [string]$entry.Status -or
        [string]$certification.PreviousLot -cne [string]$entry.PreviousLot -or
        [string]$certification.NextAuthorizedLot -cne [string]$entry.NextAuthorizedLot) {
        throw "CONTEXT_AMBIGUOUS:CERTIFICATION_REGISTRY_MISMATCH:$LotId"
    }
    $certification | Add-Member -NotePropertyName Materialized -NotePropertyValue $true
    $certification | Add-Member -NotePropertyName BackfillAuthorized `
        -NotePropertyValue (
            [string]$certification.Status -ne 'CERTIFIED' -and
            (Test-CerebrauBackfillAuthorization `
                -Repository $Repository `
                -Registry $registry `
                -DomainId $DomainId `
                -LotId $LotId)
        )
    $certification | Add-Member -NotePropertyName Legacy -NotePropertyValue $false
    return $certification
}

function Get-LastCertifiedLot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId
    )
    $registry = Read-CerebrauRegistry -Repository $Repository
    $continuity = Test-LotContinuity `
        -Repository $Repository `
        -DomainId $DomainId `
        -Registry $registry
    $last = $null
    foreach ($entry in @($continuity.OrderedLots)) {
        if ([string]$entry.Status -ne 'CERTIFIED') { break }
        $last = $entry
    }
    return $last
}

function Get-NextAuthorizedLot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId
    )
    $last = Get-LastCertifiedLot -Repository $Repository -DomainId $DomainId
    if ($null -eq $last -or $null -eq $last.NextAuthorizedLot) {
        return $null
    }
    $certification = Read-LotCertification `
        -Repository $Repository `
        -DomainId $DomainId `
        -LotId ([string]$last.NextAuthorizedLot)
    return [PSCustomObject][ordered]@{
        LotId = [string]$last.NextAuthorizedLot
        Status = [string]$certification.Status
        BackfillAuthorized = ([string]$certification.Status -ne 'CERTIFIED')
        FollowingLotAuthorized = ([string]$certification.Status -eq 'CERTIFIED')
    }
}

function Test-LotExecutionAuthorization {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId
    )
    $next = Get-NextAuthorizedLot -Repository $Repository -DomainId $DomainId
    return $null -ne $next -and [string]$next.LotId -ceq $LotId
}

function Resolve-CertificationContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        [string]$ImplementationContractPath
    )
    Assert-CerebrauIdentifier $DomainId 'DomainId'
    $registry = Read-CerebrauRegistry -Repository $Repository
    $continuity = Test-LotContinuity `
        -Repository $Repository `
        -DomainId $DomainId `
        -Registry $registry
    $last = Get-LastCertifiedLot -Repository $Repository -DomainId $DomainId
    $next = Get-NextAuthorizedLot -Repository $Repository -DomainId $DomainId
    if (-not [string]::IsNullOrWhiteSpace($ImplementationContractPath) -and
        $null -ne $next) {
        $contractPath = Resolve-CerebrauRepositoryPath `
            -Repository $Repository `
            -RelativePath $ImplementationContractPath
        if (-not (Test-Path -LiteralPath $contractPath -PathType Leaf)) {
            throw 'CEREBRAU_IMPLEMENTATION_CONTRACT_MISSING'
        }
        $contract = Get-Content -LiteralPath $contractPath -Raw -Encoding UTF8
        if ($contract -notmatch [regex]::Escape([string]$next.LotId)) {
            throw "CONTEXT_AMBIGUOUS:NEXT_LOT_NOT_IN_CONTRACT:$($next.LotId)"
        }
    }
    $firstPending = @($continuity.OrderedLots |
        Where-Object { [string]$_.Status -ne 'CERTIFIED' } |
        Select-Object -First 1)
    return [PSCustomObject][ordered]@{
        DomainId = $DomainId
        RegistryPath = $script:RegistryRelativePath
        LastCertifiedLot = $(if ($null -eq $last) { $null } else { [string]$last.LotId })
        NextAuthorizedLot = $(if ($null -eq $next) { $null } else { [string]$next.LotId })
        NextLotRequiringEvidence = $(if ($firstPending.Count -eq 0) { $null } else { [string]$firstPending[0].LotId })
        BackfillAuthorized = ($firstPending.Count -gt 0 -or @($continuity.OrderedLots).Count -eq 0)
        FollowingLotAuthorized = ($null -ne $next -and $next.FollowingLotAuthorized)
        Entries = [object[]]@($continuity.OrderedLots)
    }
}

function Write-LotCertification {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)]$Certification
    )
    Assert-LotCertification -Certification $Certification
    $root = Get-CerebrauRepositoryRoot -Repository $Repository
    $registry = Read-CerebrauRegistry -Repository $root
    $domainId = [string]$Certification.DomainId
    $lotId = [string]$Certification.LotId
    $domainEntries = @(Get-CerebrauDomainEntries -Registry $registry -DomainId $domainId)
    $existing = @($domainEntries | Where-Object { [string]$_.LotId -ceq $lotId })
    if ($existing.Count -gt 1) {
        throw "CONTEXT_AMBIGUOUS:DUPLICATE_LOT:${domainId}:${lotId}"
    }
    if ($existing.Count -eq 1 -and
        [string]$existing[0].Status -eq 'CERTIFIED') {
        throw "CEREBRAU_CERTIFICATION_ALREADY_CERTIFIED:${domainId}:${lotId}"
    }
    if ($existing.Count -eq 0) {
        if ($domainEntries.Count -eq 0) {
            if ($null -ne $Certification.PreviousLot) {
                throw "LOT_CONTINUITY_BROKEN:FIRST_LOT_HAS_PREVIOUS:$lotId"
            }
        }
        else {
            if ($null -eq $Certification.PreviousLot) {
                throw "LOT_CONTINUITY_BROKEN:PREVIOUS_REQUIRED:$lotId"
            }
            $previous = @($domainEntries | Where-Object {
                [string]$_.LotId -ceq [string]$Certification.PreviousLot
            })
            if ($previous.Count -eq 0) {
                throw "LOT_CONTINUITY_BROKEN:PREVIOUS_MISSING:$lotId"
            }
            if ($previous.Count -ne 1) {
                throw "CONTEXT_AMBIGUOUS:DUPLICATE_LOT:${domainId}:$($Certification.PreviousLot)"
            }
            if ([string]$previous[0].Status -ne 'CERTIFIED') {
                throw "LOT_CONTINUITY_BROKEN:PREVIOUS_NOT_CERTIFIED:$lotId"
            }
            if ([string]$previous[0].NextAuthorizedLot -cne $lotId) {
                throw "LOT_CONTINUITY_BROKEN:PREVIOUS_NEXT_MISMATCH:$($previous[0].LotId):$lotId"
            }
        }
    }
    elseif (
        [string]$existing[0].PreviousLot -cne [string]$Certification.PreviousLot -or
        [string]$existing[0].NextAuthorizedLot -cne [string]$Certification.NextAuthorizedLot
    ) {
        throw "LOT_CONTINUITY_BROKEN:ENTRY_LINK_CHANGE:$lotId"
    }
    $relativePath = "$($script:CertificationRoot)/$domainId/$lotId.certification.json"
    if ($existing.Count -eq 1 -and
        [string]$existing[0].CertificationPath -cne $relativePath) {
        throw "CONTEXT_AMBIGUOUS:CERTIFICATION_PATH_CONFLICT:${domainId}:${lotId}"
    }
    $entry = [PSCustomObject][ordered]@{
        DomainId = $domainId
        LotId = $lotId
        CertificationPath = $relativePath
        Status = [string]$Certification.Status
        PreviousLot = $Certification.PreviousLot
        NextAuthorizedLot = $Certification.NextAuthorizedLot
    }
    $entries = [Collections.Generic.List[object]]::new()
    foreach ($candidate in @($registry.Entries)) {
        if ([string]$candidate.DomainId -ceq $domainId -and
            [string]$candidate.LotId -ceq $lotId) {
            continue
        }
        $entries.Add($candidate)
    }
    $entries.Add($entry)
    $nextRegistry = [PSCustomObject][ordered]@{
        SchemaVersion = 1
        Entries = [object[]]@($entries.ToArray() | Sort-Object DomainId,LotId)
    }
    Assert-CerebrauRegistry -Registry $nextRegistry
    [void](Test-LotContinuity `
        -Repository $root `
        -DomainId $domainId `
        -Registry $nextRegistry)

    $certificationPath = Resolve-CerebrauRepositoryPath `
        -Repository $root `
        -RelativePath $relativePath
    $registryPath = Resolve-CerebrauRepositoryPath `
        -Repository $root `
        -RelativePath $script:RegistryRelativePath
    $previousCertification = $null
    $certificationExisted = Test-Path -LiteralPath $certificationPath -PathType Leaf
    if ($certificationExisted) {
        $previousCertification = [IO.File]::ReadAllText(
            $certificationPath,
            $script:Utf8NoBom
        )
    }
    try {
        Write-CerebrauAtomicText `
            -Path $certificationPath `
            -Content (ConvertTo-CerebrauJson $Certification)
        Write-CerebrauAtomicText `
            -Path $registryPath `
            -Content (ConvertTo-CerebrauJson $nextRegistry)
    }
    catch {
        if ($certificationExisted) {
            Write-CerebrauAtomicText `
                -Path $certificationPath `
                -Content $previousCertification
        }
        elseif (Test-Path -LiteralPath $certificationPath -PathType Leaf) {
            Remove-Item -LiteralPath $certificationPath -Force
        }
        throw
    }
    return Read-LotCertification `
        -Repository $root `
        -DomainId $domainId `
        -LotId $lotId
}

Export-ModuleMember -Function `
    Resolve-CertificationContext,`
    Read-LotCertification,`
    Write-LotCertification,`
    Get-LastCertifiedLot,`
    Get-NextAuthorizedLot,`
    Test-LotContinuity,`
    Test-LotExecutionAuthorization

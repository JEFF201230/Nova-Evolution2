Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Import-Module (Join-Path $PSScriptRoot 'Cerebrau.Certification.psm1') -Force
Import-Module (Join-Path $PSScriptRoot 'NovaCore.Governance.psm1') -Force

$script:Utf8NoBom = [Text.UTF8Encoding]::new($false)
$script:CertificationRegistry = 'Docs/12_CERTIFICATION/certification-registry.json'
$script:CodeSearchRoots = @('server', 'packages', 'modules', 'apps', 'runtime', 'core')

function Test-OrchestrationProperty {
    param($Value, [Parameter(Mandatory)][string]$Name)
    return $null -ne $Value -and $Value.PSObject.Properties.Name -contains $Name
}

function Assert-OrchestrationText {
    param(
        [AllowNull()][object]$Value,
        [Parameter(Mandatory)][string]$ErrorCode
    )
    if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string]$Value)) {
        throw $ErrorCode
    }
}

function Assert-ExplicitDomain {
    param([AllowNull()][object]$DomainId)
    Assert-OrchestrationText $DomainId 'DOMAIN_REQUIRED'
    if ([string]$DomainId -cnotmatch '^[A-Z0-9][A-Z0-9._-]*$') {
        throw 'DOMAIN_UNKNOWN'
    }
}

function Get-OrchestrationRepositoryRoot {
    param([Parameter(Mandatory)][string]$Repository)
    Assert-OrchestrationText $Repository 'REPOSITORY_REQUIRED'
    $root = [IO.Path]::GetFullPath($Repository).TrimEnd('\', '/')
    if (-not (Test-Path -LiteralPath $root -PathType Container)) {
        throw 'REPOSITORY_NOT_FOUND'
    }
    return $root
}

function Resolve-OrchestrationPath {
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$RelativePath
    )
    if ([IO.Path]::IsPathRooted($RelativePath) -or
        $RelativePath -match '(^|[\\/])\.\.([\\/]|$)') {
        throw 'ORCHESTRATION_PATH_INVALID'
    }
    $root = Get-OrchestrationRepositoryRoot $Repository
    $path = [IO.Path]::GetFullPath((Join-Path $root $RelativePath))
    if (-not $path.StartsWith(
        $root + [IO.Path]::DirectorySeparatorChar,
        [StringComparison]::OrdinalIgnoreCase
    )) {
        throw 'ORCHESTRATION_PATH_OUTSIDE_REPOSITORY'
    }
    return $path
}

function ConvertTo-OrchestrationRelativePath {
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$Path
    )
    $root = Get-OrchestrationRepositoryRoot $Repository
    $fullPath = [IO.Path]::GetFullPath($Path)
    $prefix = $root + [IO.Path]::DirectorySeparatorChar
    if (-not $fullPath.StartsWith(
        $prefix,
        [StringComparison]::OrdinalIgnoreCase
    )) {
        throw 'ORCHESTRATION_PATH_OUTSIDE_REPOSITORY'
    }
    return $fullPath.Substring($prefix.Length).Replace('\', '/')
}

function Get-OrchestrationLines {
    param([Parameter(Mandatory)][string]$Text)
    return [regex]::Split($Text, '\r?\n')
}

function Get-MarkdownSubsection {
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory)][string]$HeadingPattern
    )
    $start = -1
    for ($index = 0; $index -lt $Lines.Count; $index += 1) {
        if ($Lines[$index] -match $HeadingPattern) {
            $start = $index + 1
            break
        }
    }
    if ($start -lt 0) { return [string[]]@() }
    $values = [Collections.Generic.List[string]]::new()
    for ($index = $start; $index -lt $Lines.Count; $index += 1) {
        if ($Lines[$index] -match '^#{2,3}\s+') { break }
        $values.Add($Lines[$index])
    }
    return [string[]]$values.ToArray()
}

function Get-MarkdownBulletValues {
    param([Parameter(Mandatory)][AllowEmptyString()][string[]]$Lines)
    return [string[]]@(
        $Lines |
            Where-Object { $_ -match '^\s*-\s+\S' } |
            ForEach-Object { ($_ -replace '^\s*-\s+', '').Trim() }
    )
}

function Get-MarkdownNumberedValues {
    param([Parameter(Mandatory)][AllowEmptyString()][string[]]$Lines)
    return [string[]]@(
        $Lines |
            Where-Object { $_ -match '^\s*\d+\.\s+\S' } |
            ForEach-Object { ($_ -replace '^\s*\d+\.\s+', '').Trim() }
    )
}

function Split-MarkdownRow {
    param([Parameter(Mandatory)][AllowEmptyString()][string]$Line)
    if ($Line -notmatch '^\s*\|.*\|\s*$') { return [string[]]@() }
    return [string[]]@(
        $Line.Trim().Trim('|').Split('|') |
            ForEach-Object { $_.Trim() }
    )
}

function Resolve-ContractReference {
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$ContractPath,
        [Parameter(Mandatory)][string]$Reference
    )
    $candidate = if ($Reference -match '^[^\\/]+$') {
        Join-Path (Split-Path -Parent $ContractPath) $Reference
    }
    else {
        Resolve-OrchestrationPath $Repository $Reference
    }
    return [IO.Path]::GetFullPath($candidate)
}

function Resolve-DomainContext {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [AllowNull()][AllowEmptyString()][string]$DomainId
    )
    Assert-ExplicitDomain $DomainId
    $root = Get-OrchestrationRepositoryRoot $Repository
    try {
        $certificationContext = Resolve-CertificationContext `
            -Repository $root `
            -DomainId $DomainId
    }
    catch {
        if ($_.Exception.Message -like 'CONTEXT_AMBIGUOUS:*') {
            throw "DOMAIN_AMBIGUOUS:$DomainId"
        }
        throw
    }
    $entries = @($certificationContext.Entries)
    if ($entries.Count -eq 0) {
        throw "DOMAIN_UNKNOWN:$DomainId"
    }

    $contractCandidates = [Collections.Generic.List[object]]::new()
    foreach ($entry in $entries) {
        $relativePath = [string]$entry.CertificationPath
        if ([IO.Path]::GetExtension($relativePath) -ine '.md') { continue }
        $path = Resolve-OrchestrationPath $root $relativePath
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
        $text = [IO.File]::ReadAllText($path, $script:Utf8NoBom)
        if ($text -match "(?im)^#\s+$([regex]::Escape($DomainId))\s+IMPLEMENTATION CONTRACT\s*$") {
            $contractCandidates.Add([PSCustomObject]@{
                RelativePath = $relativePath.Replace('\', '/')
                Path = $path
                Text = $text
            })
        }
    }
    if ($contractCandidates.Count -gt 1) {
        throw "DOMAIN_AMBIGUOUS:$DomainId"
    }
    if ($contractCandidates.Count -eq 0) {
        throw "DOMAIN_IMPLEMENTATION_CONTRACT_MISSING:$DomainId"
    }
    $contract = $contractCandidates[0]

    $referenceMatches = [regex]::Matches(
        $contract.Text,
        '`(?<path>[^`\r\n]+\.md)`'
    )
    $blueprintCandidates = [Collections.Generic.List[object]]::new()
    $seenBlueprints = @{}
    foreach ($match in $referenceMatches) {
        $reference = [string]$match.Groups['path'].Value
        try {
            $candidate = Resolve-ContractReference `
                -Repository $root `
                -ContractPath $contract.Path `
                -Reference $reference
        }
        catch {
            continue
        }
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
        $candidateText = [IO.File]::ReadAllText($candidate, $script:Utf8NoBom)
        if ($candidateText -notmatch "(?im)^#\s+$([regex]::Escape($DomainId))\s+DOMAIN BLUEPRINT\s*$") {
            continue
        }
        $key = $candidate.ToUpperInvariant()
        if ($seenBlueprints.ContainsKey($key)) { continue }
        $seenBlueprints[$key] = $true
        $blueprintCandidates.Add([PSCustomObject]@{
            Path = $candidate
            RelativePath = ConvertTo-OrchestrationRelativePath $root $candidate
        })
    }
    if ($blueprintCandidates.Count -gt 1) {
        throw "DOMAIN_AMBIGUOUS:$DomainId"
    }
    if ($blueprintCandidates.Count -eq 0) {
        throw "DOMAIN_BLUEPRINT_MISSING:$DomainId"
    }

    return [PSCustomObject][ordered]@{
        DomainId = $DomainId
        Repository = $root
        RegistryPath = $script:CertificationRegistry
        BlueprintPath = [string]$blueprintCandidates[0].RelativePath
        ImplementationContractPath = [string]$contract.RelativePath
        CertificationContext = $certificationContext
        Entries = [object[]]$entries
    }
}

function Get-ImplementationSequence {
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory)][string]$ContractText
    )
    $sequenceLines = Get-MarkdownSubsection `
        -Lines $Lines `
        -HeadingPattern '^###\s+16\.1\s+'
    $sequence = [Collections.Generic.List[object]]::new()
    foreach ($line in $sequenceLines) {
        $cells = @(Split-MarkdownRow $line)
        if ($cells.Count -lt 4 -or $cells[0] -notmatch '^\d+$') { continue }
        $lotMatch = [regex]::Match(
            $cells[1],
            '^(?<lot>[A-Z0-9][A-Z0-9._-]*)\s+(?:\u2014|-)\s+(?<name>.+)$'
        )
        if (-not $lotMatch.Success) {
            continue
        }
        $sequence.Add([PSCustomObject][ordered]@{
            Order = [int]$cells[0]
            LotId = [string]$lotMatch.Groups['lot'].Value
            Name = [string]$lotMatch.Groups['name'].Value.Trim()
            Objective = [string]$cells[2]
            Deliverable = [string]$cells[3]
        })
    }
    if ($sequence.Count -eq 0) {
        throw 'LOT_CONTRACT_INCOMPLETE:IMPLEMENTATION_SEQUENCE'
    }
    $baselineMatch = [regex]::Match(
        $ContractText,
        '(?im)^\|\s*Lot\s*\|\s*(?<lot>[A-Z0-9][A-Z0-9._-]*)\s*\|'
    )
    $values = [Collections.Generic.List[object]]::new()
    if ($baselineMatch.Success) {
        $baselineLot = [string]$baselineMatch.Groups['lot'].Value
        if (@($sequence | Where-Object { $_.LotId -ceq $baselineLot }).Count -eq 0) {
            $values.Add([PSCustomObject][ordered]@{
                Order = 0
                LotId = $baselineLot
                Name = 'Implementation Contract'
                Objective = 'Canonical implementation contract'
                Deliverable = 'Certified contract'
            })
        }
    }
    foreach ($item in @($sequence | Sort-Object Order)) { $values.Add($item) }
    $seen = @{}
    foreach ($item in $values) {
        if ($seen.ContainsKey([string]$item.LotId)) {
            throw "LOT_CONTRACT_INCOMPLETE:DUPLICATE_LOT:$($item.LotId)"
        }
        $seen[[string]$item.LotId] = $true
    }
    return [object[]]$values.ToArray()
}

function Get-LotGate {
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory)][string]$LotId
    )
    $gateLines = Get-MarkdownSubsection `
        -Lines $Lines `
        -HeadingPattern '^###\s+17\.2\s+'
    foreach ($line in $gateLines) {
        $cells = @(Split-MarkdownRow $line)
        if ($cells.Count -ge 4 -and $cells[0] -ceq $LotId) {
            return [PSCustomObject][ordered]@{
                EntryCriteria = [string]$cells[1]
                AuthorizedFiles = [string]$cells[2]
                CertificationCriteria = [string]$cells[3]
            }
        }
    }
    return $null
}

function Get-ContractTestRequirements {
    param([Parameter(Mandatory)][AllowEmptyString()][string[]]$Lines)
    $testLines = Get-MarkdownSubsection `
        -Lines $Lines `
        -HeadingPattern '^##\s+15\.\s+TEST CONTRACT\s*$'
    $requirements = [Collections.Generic.List[string]]::new()
    foreach ($line in $testLines) {
        $cells = @(Split-MarkdownRow $line)
        if ($cells.Count -eq 2 -and
            $cells[0] -match '^(Tests|Typecheck)\b') {
            $requirements.Add("$($cells[0]): $($cells[1])")
        }
    }
    return [string[]]$requirements.ToArray()
}

function Get-ExpectedContractSymbols {
    param(
        [Parameter(Mandatory)]$SequenceEntry,
        [Parameter(Mandatory)]$Gate
    )
    $source = "$($SequenceEntry.Deliverable); $($Gate.CertificationCriteria)"
    $matches = [regex]::Matches(
        $source,
        '\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+|[A-Z][A-Za-z0-9]{2,})\b'
    )
    return [string[]]@(
        $matches |
            ForEach-Object { $_.Value.Trim() } |
            Where-Object {
                $_ -notin @('PASS', 'Runtime', 'Core', 'Frontend', 'BFF', 'API')
            } |
            Select-Object -Unique
    )
}

function Read-LotImplementationContract {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId,
        $DomainContext
    )
    if ($null -eq $DomainContext) {
        $DomainContext = Resolve-DomainContext $Repository $DomainId
    }
    if ([string]$DomainContext.DomainId -cne $DomainId) {
        throw 'DOMAIN_AMBIGUOUS'
    }
    $contractPath = Resolve-OrchestrationPath `
        $DomainContext.Repository `
        $DomainContext.ImplementationContractPath
    $text = [IO.File]::ReadAllText($contractPath, $script:Utf8NoBom)
    $lines = Get-OrchestrationLines $text
    $sequence = @(Get-ImplementationSequence $lines $text)
    $index = -1
    for ($position = 0; $position -lt $sequence.Count; $position += 1) {
        if ([string]$sequence[$position].LotId -ceq $LotId) {
            $index = $position
            break
        }
    }
    if ($index -lt 0) {
        throw "LOT_NOT_IN_IMPLEMENTATION_CONTRACT:$LotId"
    }
    $entry = $sequence[$index]
    $gate = Get-LotGate $lines $LotId
    if ($index -gt 0 -and $null -eq $gate) {
        throw "LOT_CONTRACT_INCOMPLETE:GATE:$LotId"
    }
    if ($null -eq $gate) {
        $gate = [PSCustomObject]@{
            EntryCriteria = 'Canonical contract entry'
            AuthorizedFiles = 'Canonical contract only'
            CertificationCriteria = 'Contract verdict GO'
        }
    }
    $allowedDependencies = Get-MarkdownBulletValues (
        Get-MarkdownSubsection $lines '^###\s+2\.2\s+'
    )
    $forbiddenDependencies = Get-MarkdownBulletValues (
        Get-MarkdownSubsection $lines '^###\s+2\.3\s+'
    )
    $forbiddenFiles = Get-MarkdownBulletValues (
        Get-MarkdownSubsection $lines '^###\s+1\.3\s+'
    )
    $invariants = Get-MarkdownNumberedValues (
        Get-MarkdownSubsection $lines '^###\s+14\.7\s+'
    )
    $tests = Get-ContractTestRequirements $lines
    $symbols = Get-ExpectedContractSymbols $entry $gate
    $missing = [Collections.Generic.List[string]]::new()
    foreach ($check in @(
        @{ Name='OBJECTIVE'; Values=@($entry.Objective) },
        @{ Name='AUTHORIZED_FILES'; Values=@($gate.AuthorizedFiles) },
        @{ Name='FORBIDDEN_FILES'; Values=@($forbiddenFiles) },
        @{ Name='EXPECTED_SYMBOLS'; Values=@($symbols) },
        @{ Name='INVARIANTS'; Values=@($invariants) },
        @{ Name='ALLOWED_DEPENDENCIES'; Values=@($allowedDependencies) },
        @{ Name='FORBIDDEN_DEPENDENCIES'; Values=@($forbiddenDependencies) },
        @{ Name='TESTS'; Values=@($tests) },
        @{ Name='CERTIFICATION_CRITERIA'; Values=@($gate.CertificationCriteria) }
    )) {
        $present = @($check.Values | Where-Object {
            $null -ne $_ -and -not [string]::IsNullOrWhiteSpace([string]$_)
        })
        if ($present.Count -eq 0) { $missing.Add([string]$check.Name) }
    }
    if ($missing.Count -gt 0) {
        throw "LOT_CONTRACT_INCOMPLETE:${LotId}:$($missing -join ',')"
    }
    return [PSCustomObject][ordered]@{
        DomainId = $DomainId
        LotId = $LotId
        Name = [string]$entry.Name
        Objective = [string]$entry.Objective
        Deliverable = [string]$entry.Deliverable
        AuthorizedFiles = [string]$gate.AuthorizedFiles
        ForbiddenFiles = [string[]]$forbiddenFiles
        ExpectedSymbols = [string[]]$symbols
        Invariants = [string[]]$invariants
        AllowedDependencies = [string[]]$allowedDependencies
        ForbiddenDependencies = [string[]]$forbiddenDependencies
        Tests = [string[]]$tests
        EntryCriteria = [string]$gate.EntryCriteria
        CertificationCriteria = [string]$gate.CertificationCriteria
        PreviousLot = $(if ($index -eq 0) { $null } else {
            [string]$sequence[$index - 1].LotId
        })
        NextLot = $(if ($index -eq $sequence.Count - 1) { $null } else {
            [string]$sequence[$index + 1].LotId
        })
        Sequence = [object[]]$sequence
        Complete = $true
        SourcePath = [string]$DomainContext.ImplementationContractPath
    }
}

function Resolve-CurrentLot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        $DomainContext
    )
    if ($null -eq $DomainContext) {
        $DomainContext = Resolve-DomainContext $Repository $DomainId
    }
    $contractPath = Resolve-OrchestrationPath `
        $DomainContext.Repository `
        $DomainContext.ImplementationContractPath
    $text = [IO.File]::ReadAllText($contractPath, $script:Utf8NoBom)
    $lines = @(Get-OrchestrationLines $text)
    $sequence = @(Get-ImplementationSequence `
        -Lines $lines `
        -ContractText $text)
    $order = @{}
    for ($index = 0; $index -lt $sequence.Count; $index += 1) {
        $order[[string]$sequence[$index].LotId] = $index
    }
    foreach ($entry in @($DomainContext.Entries)) {
        if (-not $order.ContainsKey([string]$entry.LotId)) {
            throw "LOT_NOT_IN_IMPLEMENTATION_CONTRACT:$($entry.LotId)"
        }
        $position = [int]$order[[string]$entry.LotId]
        $expectedPrevious = if ($position -eq 0) {
            $null
        } else {
            [string]$sequence[$position - 1].LotId
        }
        $expectedNext = if ($position -eq $sequence.Count - 1) {
            $null
        } else {
            [string]$sequence[$position + 1].LotId
        }
        if ([string]$entry.PreviousLot -cne [string]$expectedPrevious -or
            [string]$entry.NextAuthorizedLot -cne [string]$expectedNext) {
            throw "LOT_CONTINUITY_BROKEN:CONTRACT_LINK:$($entry.LotId)"
        }
    }

    $entriesByLot = @{}
    foreach ($entry in @($DomainContext.Entries)) {
        $entriesByLot[[string]$entry.LotId] = $entry
    }
    $lastCertified = $null
    $current = $null
    foreach ($lot in $sequence) {
        if (-not $entriesByLot.ContainsKey([string]$lot.LotId)) {
            $current = [PSCustomObject]@{
                LotId = [string]$lot.LotId
                Status = 'ABSENT'
                Materialized = $false
            }
            break
        }
        $entry = $entriesByLot[[string]$lot.LotId]
        if ([string]$entry.Status -eq 'CERTIFIED') {
            $lastCertified = [string]$entry.LotId
            continue
        }
        $current = [PSCustomObject]@{
            LotId = [string]$entry.LotId
            Status = [string]$entry.Status
            Materialized = $true
        }
        break
    }
    if ($null -eq $current) {
        return [PSCustomObject][ordered]@{
            DomainId = $DomainId
            LastCertifiedLot = $lastCertified
            CurrentLot = $null
            CurrentStatus = 'CERTIFIED'
            DomainCertification = $true
            Sequence = [object[]]$sequence
        }
    }
    $contract = Read-LotImplementationContract `
        -Repository $DomainContext.Repository `
        -DomainId $DomainId `
        -LotId $current.LotId `
        -DomainContext $DomainContext
    if ([string]$contract.PreviousLot -cne [string]$lastCertified) {
        throw "LOT_CONTINUITY_BROKEN:CURRENT_NOT_CONSECUTIVE:$($current.LotId)"
    }
    return [PSCustomObject][ordered]@{
        DomainId = $DomainId
        LastCertifiedLot = $lastCertified
        CurrentLot = [string]$current.LotId
        CurrentStatus = [string]$current.Status
        Materialized = [bool]$current.Materialized
        DomainCertification = $false
        Contract = $contract
        Sequence = [object[]]$sequence
    }
}

function Get-CertificationEvidenceFileTokens {
    param([Parameter(Mandatory)]$Certification)
    $tokens = [Collections.Generic.List[string]]::new()
    foreach ($evidence in @($Certification.Evidence)) {
        $value = [string]$evidence
        if ($value -notmatch '(?i)^FILES_(?:VERIFIED|CREATED|MODIFIED)\s*:\s*(?<files>.+)$') {
            continue
        }
        foreach ($file in $Matches['files'].Split(';')) {
            $candidate = $file.Trim()
            if (-not [string]::IsNullOrWhiteSpace($candidate)) {
                $tokens.Add($candidate)
            }
        }
    }
    return [string[]]$tokens.ToArray()
}

function Resolve-DomainCodeRoots {
    param(
        [Parameter(Mandatory)]$DomainContext,
        [Parameter(Mandatory)][string]$CurrentLot
    )
    $repository = [string]$DomainContext.Repository
    $explicitPaths = [Collections.Generic.List[string]]::new()
    foreach ($entry in @($DomainContext.Entries)) {
        if ([string]$entry.LotId -ceq $CurrentLot -or
            [string]$entry.Status -eq 'CERTIFIED') {
            try {
                $certification = Read-LotCertification `
                    -Repository $repository `
                    -DomainId $DomainContext.DomainId `
                    -LotId $entry.LotId
            }
            catch {
                continue
            }
            foreach ($token in @(Get-CertificationEvidenceFileTokens $certification)) {
                if ($token -match '[/\\]') {
                    try {
                        $path = Resolve-OrchestrationPath $repository $token
                        if (Test-Path -LiteralPath $path -PathType Leaf) {
                            $explicitPaths.Add($path)
                        }
                    }
                    catch {
                        continue
                    }
                    continue
                }
                $matches = [Collections.Generic.List[string]]::new()
                foreach ($rootName in $script:CodeSearchRoots) {
                    $searchRoot = Join-Path $repository $rootName
                    if (-not (Test-Path -LiteralPath $searchRoot -PathType Container)) {
                        continue
                    }
                    foreach ($match in @(Get-ChildItem `
                        -LiteralPath $searchRoot `
                        -Recurse `
                        -File `
                        -Filter $token `
                        -ErrorAction SilentlyContinue)) {
                        $matches.Add($match.FullName)
                    }
                }
                if ($matches.Count -eq 1) { $explicitPaths.Add($matches[0]) }
            }
        }
    }
    $parents = @(
        $explicitPaths |
            ForEach-Object { Split-Path -Parent $_ } |
            Select-Object -Unique
    )
    if ($parents.Count -eq 0) { return [string[]]@() }
    $counts = @{}
    foreach ($path in $explicitPaths) {
        $parent = Split-Path -Parent $path
        if (-not $counts.ContainsKey($parent)) { $counts[$parent] = 0 }
        $counts[$parent] += 1
    }
    $maximum = ($counts.Values | Measure-Object -Maximum).Maximum
    return [string[]]@(
        $counts.Keys |
            Where-Object { $counts[$_] -eq $maximum } |
            Sort-Object
    )
}

function Get-LotStage {
    param([Parameter(Mandatory)][string]$Name)
    foreach ($stage in @(
        'Foundation',
        'Authoritative Producer',
        'Persistence',
        'Commands',
        'Queries',
        'Integration',
        'Certification'
    )) {
        if ($Name -match [regex]::Escape($stage)) { return $stage }
    }
    return 'Unknown'
}

function Get-StageDeclarationPattern {
    param([Parameter(Mandatory)][string]$Stage)
    switch ($Stage) {
        'Foundation' { return '(?i)(Aggregate|Entity|ValueObject|Foundation|Model)' }
        'Authoritative Producer' { return '(?i)(Authority|Producer)' }
        'Persistence' { return '(?i)(Persistence|Repository|Store|Journal|Storage|Snapshot)' }
        'Commands' { return '(?i)(Command|Handler)' }
        'Queries' { return '(?i)(Query|ReadModel|Projection)' }
        'Integration' { return '(?i)(Integration|Adapter|Gateway)' }
        'Certification' { return '(?i)(Certification|Certifier)' }
        default { return $null }
    }
}

function Test-LotCodePresence {
    param(
        [Parameter(Mandatory)]$DomainContext,
        [Parameter(Mandatory)]$CurrentLot,
        [Parameter(Mandatory)]$Contract
    )
    $certification = Read-LotCertification `
        -Repository $DomainContext.Repository `
        -DomainId $DomainContext.DomainId `
        -LotId $CurrentLot.CurrentLot
    $evidenceFiles = [Collections.Generic.List[string]]::new()
    foreach ($token in @(Get-CertificationEvidenceFileTokens $certification)) {
        if ($token -notmatch '[/\\]') { continue }
        try {
            $path = Resolve-OrchestrationPath $DomainContext.Repository $token
            if (Test-Path -LiteralPath $path -PathType Leaf) {
                $evidenceFiles.Add(
                    (ConvertTo-OrchestrationRelativePath $DomainContext.Repository $path)
                )
            }
        }
        catch {
            continue
        }
    }
    if ($evidenceFiles.Count -gt 0) {
        return [PSCustomObject]@{
            Exists = $true
            Evidence = [string[]]$evidenceFiles.ToArray()
            CodeRoots = [string[]]@(
                $evidenceFiles |
                    ForEach-Object {
                        Split-Path -Parent (
                            Resolve-OrchestrationPath $DomainContext.Repository $_
                        )
                    } |
                    Select-Object -Unique
            )
        }
    }

    $roots = @(Resolve-DomainCodeRoots $DomainContext $CurrentLot.CurrentLot)
    $stage = Get-LotStage $Contract.Name
    $pattern = Get-StageDeclarationPattern $stage
    if ($roots.Count -eq 0 -or $null -eq $pattern) {
        return [PSCustomObject]@{
            Exists = $false
            Evidence = [string[]]@()
            CodeRoots = [string[]]$roots
        }
    }
    $declarationPattern =
        '(?m)^\s*(?:export\s+)?(?:declare\s+)?(?:abstract\s+)?' +
        '(?:class|interface|type|function|const)\s+' +
        '(?<name>[A-Za-z_][A-Za-z0-9_]*)'
    $found = [Collections.Generic.List[string]]::new()
    foreach ($root in $roots) {
        foreach ($file in @(Get-ChildItem `
            -LiteralPath $root `
            -Recurse `
            -File `
            -Include '*.ts','*.tsx','*.js','*.mjs','*.cjs','*.ps1','*.psm1' `
            -ErrorAction SilentlyContinue)) {
            $source = [IO.File]::ReadAllText($file.FullName, $script:Utf8NoBom)
            $source = [regex]::Replace($source, '(?s)/\*.*?\*/', '')
            $source = [regex]::Replace($source, '(?m)//.*$', '')
            foreach ($match in [regex]::Matches($source, $declarationPattern)) {
                $name = [string]$match.Groups['name'].Value
                if ($name -match $pattern) {
                    $found.Add(
                        "$(ConvertTo-OrchestrationRelativePath $DomainContext.Repository $file.FullName)#$name"
                    )
                }
            }
        }
    }
    return [PSCustomObject]@{
        Exists = ($found.Count -gt 0)
        Evidence = [string[]]$found.ToArray()
        CodeRoots = [string[]]$roots
    }
}

function Resolve-LotExecutionMode {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        $DomainContext,
        $CurrentLot
    )
    if ($null -eq $DomainContext) {
        $DomainContext = Resolve-DomainContext $Repository $DomainId
    }
    if ($null -eq $CurrentLot) {
        $CurrentLot = Resolve-CurrentLot $Repository $DomainId $DomainContext
    }
    if ($CurrentLot.DomainCertification) {
        return [PSCustomObject][ordered]@{
            Mode = 'DOMAIN_CERTIFICATION'
            CodeExists = $false
            CodeEvidence = [string[]]@()
            CodeRoots = [string[]]@()
        }
    }
    switch ([string]$CurrentLot.CurrentStatus) {
        'REJECTED' {
            return [PSCustomObject][ordered]@{
                Mode = 'CORRECTION'
                CodeExists = $true
                CodeEvidence = [string[]]@('REJECTED_CERTIFICATION')
                CodeRoots = [string[]]@(Resolve-DomainCodeRoots `
                    $DomainContext `
                    $CurrentLot.CurrentLot)
            }
        }
        'ABSENT' {
            if ([string]$CurrentLot.Contract.PreviousLot -cne
                [string]$CurrentLot.LastCertifiedLot) {
                throw 'PREVIOUS_LOT_NOT_CERTIFIED'
            }
            return [PSCustomObject][ordered]@{
                Mode = 'IMPLEMENTATION'
                CodeExists = $false
                CodeEvidence = [string[]]@()
                CodeRoots = [string[]]@(Resolve-DomainCodeRoots `
                    $DomainContext `
                    $CurrentLot.CurrentLot)
            }
        }
        'PENDING_EVIDENCE' {
            $presence = Test-LotCodePresence `
                $DomainContext `
                $CurrentLot `
                $CurrentLot.Contract
            return [PSCustomObject][ordered]@{
                Mode = $(if ($presence.Exists) { 'BACKFILL' } else {
                    'IMPLEMENTATION'
                })
                CodeExists = [bool]$presence.Exists
                CodeEvidence = [string[]]$presence.Evidence
                CodeRoots = [string[]]$presence.CodeRoots
            }
        }
        default {
            throw "LOT_STATUS_INVALID:$($CurrentLot.CurrentStatus)"
        }
    }
}

function Test-LotAuthorization {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId,
        $DomainContext,
        $CurrentLot
    )
    if ($null -eq $DomainContext) {
        $DomainContext = Resolve-DomainContext $Repository $DomainId
    }
    if ($null -eq $CurrentLot) {
        $CurrentLot = Resolve-CurrentLot $Repository $DomainId $DomainContext
    }
    if ($CurrentLot.DomainCertification) {
        return $false
    }
    if ([string]$CurrentLot.CurrentLot -cne $LotId) {
        return $false
    }
    if ([string]$CurrentLot.Contract.PreviousLot -cne
        [string]$CurrentLot.LastCertifiedLot) {
        throw 'PREVIOUS_LOT_NOT_CERTIFIED'
    }
    if ($CurrentLot.CurrentStatus -eq 'ABSENT') { return $true }
    return Test-LotExecutionAuthorization `
        -Repository $DomainContext.Repository `
        -DomainId $DomainId `
        -LotId $LotId
}

function New-PendingLotCertification {
    param(
        [Parameter(Mandatory)][string]$MissionId,
        [Parameter(Mandatory)]$Contract
    )
    return [PSCustomObject][ordered]@{
        MissionId = $MissionId
        DomainId = [string]$Contract.DomainId
        LotId = [string]$Contract.LotId
        Status = 'PENDING_EVIDENCE'
        CertifiedAt = $null
        Evidence = [object[]]@()
        Tests = [object[]]@()
        Regressions = 'NOT_EVALUATED'
        PreviousLot = $Contract.PreviousLot
        NextAuthorizedLot = $Contract.NextLot
    }
}

function Open-NextDomainLot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$CertifiedLotId,
        [Parameter(Mandatory)][string]$MissionId
    )
    $context = Resolve-DomainContext $Repository $DomainId
    $currentContract = Read-LotImplementationContract `
        $context.Repository `
        $DomainId `
        $CertifiedLotId `
        $context
    $currentEntry = @($context.Entries | Where-Object {
        [string]$_.LotId -ceq $CertifiedLotId
    })
    if ($currentEntry.Count -ne 1 -or
        [string]$currentEntry[0].Status -ne 'CERTIFIED') {
        throw 'PREVIOUS_LOT_NOT_CERTIFIED'
    }
    $certified = Read-LotCertification `
        $context.Repository `
        $DomainId `
        $CertifiedLotId
    if ([string]$certified.Status -ne 'CERTIFIED') {
        throw "CURRENT_LOT_NOT_CERTIFIED:$CertifiedLotId"
    }
    if ($null -eq $currentContract.NextLot) { return $null }
    $nextContract = Read-LotImplementationContract `
        $context.Repository `
        $DomainId `
        $currentContract.NextLot `
        $context
    if ([string]$nextContract.PreviousLot -cne $CertifiedLotId) {
        throw "LOT_CONTINUITY_BROKEN:NEXT_CONTRACT:$CertifiedLotId"
    }
    $existing = @($context.Entries | Where-Object {
        [string]$_.LotId -ceq [string]$nextContract.LotId
    })
    if ($existing.Count -gt 0) {
        throw "NEXT_LOT_ALREADY_OPEN:$($nextContract.LotId)"
    }
    return Write-LotCertification `
        -Repository $context.Repository `
        -Certification (
            New-PendingLotCertification $MissionId $nextContract
        )
}

function New-MissionOutcomeLotDecision {
    param(
        [Parameter(Mandatory)][string]$Decision,
        [Parameter(Mandatory)][string]$ReasonCode,
        [Parameter(Mandatory)][bool]$RetryAllowed,
        [Parameter(Mandatory)][string]$RegistryTransition,
        [Parameter(Mandatory)][bool]$InvokeCompleteDomainLot
    )
    if ($Decision -notin @(
        'CERTIFIED',
        'PENDING_REVIEW',
        'REJECTED',
        'EXECUTION_FAILED',
        'CANCELLED'
    )) {
        throw "LOT_POLICY_DECISION_INVALID:$Decision"
    }
    if ($InvokeCompleteDomainLot -ne (
        $Decision -in @('CERTIFIED','REJECTED')
    )) {
        throw "LOT_POLICY_COMPLETE_CONTROL_INVALID:$Decision"
    }
    return [PSCustomObject][ordered]@{
        Decision = $Decision
        ReasonCode = $ReasonCode
        RetryAllowed = $RetryAllowed
        RegistryTransition = $RegistryTransition
        InvokeCompleteDomainLot = $InvokeCompleteDomainLot
        PreserveEvidence = $true
    }
}

function Get-MissionOutcomeRegressionState {
    param([AllowNull()][object]$Regressions)
    if ($null -eq $Regressions) { return 'UNKNOWN' }
    $value = [string]$Regressions
    if ($value -ceq 'NONE') { return 'CLEAR' }
    if ($value -cmatch '^NON_BLOCKING:\S.*$') { return 'NON_BLOCKING' }
    if ($value -cmatch '^BLOCKING:\S.*$') { return 'BLOCKING' }
    return 'UNKNOWN'
}

function Get-MissionOutcomeTestsState {
    param([AllowNull()][object]$Tests)
    if ($null -eq $Tests) { return 'ABSENT' }
    $values = @($Tests)
    if ($values.Count -eq 0) { return 'ABSENT' }
    $requiredCount = 0
    foreach ($test in $values) {
        if (-not (Test-OrchestrationProperty $test 'Required') -or
            -not (Test-OrchestrationProperty $test 'Passed') -or
            $test.Required -isnot [bool] -or
            $test.Passed -isnot [bool]) {
            return 'INVALID'
        }
        if ([bool]$test.Required) {
            $requiredCount += 1
            if (-not [bool]$test.Passed) { return 'REQUIRED_FAILED' }
        }
    }
    if ($requiredCount -eq 0) { return 'ABSENT' }
    return 'ALL_REQUIRED_PASS'
}

function Get-MissionOutcomeEvidenceState {
    param(
        [AllowNull()][object]$Evidence,
        [AllowNull()][object]$OfficialReport
    )
    if ($null -eq $Evidence) { return 'ABSENT' }
    foreach ($property in @(
        'status',
        'capturedAfterExecution',
        'entries',
        'registryFingerprint'
    )) {
        if (-not (Test-OrchestrationProperty $Evidence $property)) {
            return 'INCOMPLETE_OR_INVALID'
        }
    }
    if ([string]$Evidence.status -cne 'VALID' -or
        $Evidence.capturedAfterExecution -isnot [bool] -or
        -not [bool]$Evidence.capturedAfterExecution -or
        [string]::IsNullOrWhiteSpace(
            [string]$Evidence.registryFingerprint
        )) {
        return 'INCOMPLETE_OR_INVALID'
    }
    $entries = @($Evidence.entries)
    if ($entries.Count -eq 0) { return 'INCOMPLETE_OR_INVALID' }
    foreach ($entry in $entries) {
        if (-not (Test-OrchestrationProperty $entry 'status') -or
            [string]$entry.status -cne 'VALID') {
            return 'INCOMPLETE_OR_INVALID'
        }
    }
    if ($null -ne $OfficialReport -and
        (Test-OrchestrationProperty $OfficialReport 'OutputEvidence')) {
        $reportEvidence = $OfficialReport.OutputEvidence
        if ($null -eq $reportEvidence -or
            -not (Test-OrchestrationProperty `
                $reportEvidence `
                'registryFingerprint') -or
            [string]$reportEvidence.registryFingerprint -cne
                [string]$Evidence.registryFingerprint) {
            return 'INCOMPLETE_OR_INVALID'
        }
    }
    return 'COMPLETE_VALID'
}

function Test-MissionOutcomeReportIntegrity {
    param(
        [AllowNull()][object]$OfficialReport,
        [AllowNull()][object]$OfficialStatus,
        [AllowNull()][object]$AuthorityDecision,
        [AllowNull()][object]$FinalMissionState,
        [AllowNull()][object]$ExitCode,
        [AllowNull()][object]$Tests
    )
    if ($null -eq $OfficialReport) { return $false }
    foreach ($property in @(
        'Status',
        'AuthorityDecision',
        'FinalMissionState',
        'Codex',
        'OutputEvidence',
        'Validations',
        'ReportFingerprint'
    )) {
        if (-not (Test-OrchestrationProperty $OfficialReport $property)) {
            return $false
        }
    }
    if ($null -eq $OfficialReport.Codex -or
        -not (Test-OrchestrationProperty `
            $OfficialReport.Codex `
            'ExitCode') -or
        [string]::IsNullOrWhiteSpace(
            [string]$OfficialReport.ReportFingerprint
        )) {
        return $false
    }
    if ([string]$OfficialReport.Status -cne [string]$OfficialStatus -or
        [string]$OfficialReport.AuthorityDecision -cne
            [string]$AuthorityDecision -or
        [string]$OfficialReport.FinalMissionState -cne
            [string]$FinalMissionState) {
        return $false
    }
    $reportExitCode = 0
    $inputExitCode = 0
    if (-not [int]::TryParse(
        [string]$OfficialReport.Codex.ExitCode,
        [ref]$reportExitCode
    ) -or
        -not [int]::TryParse([string]$ExitCode, [ref]$inputExitCode) -or
        $reportExitCode -ne $inputExitCode) {
        return $false
    }
    $reportTestsJson = @($OfficialReport.Validations) |
        ConvertTo-Json -Depth 30 -Compress
    $inputTestsJson = @($Tests) | ConvertTo-Json -Depth 30 -Compress
    if ([string]$reportTestsJson -cne [string]$inputTestsJson) {
        return $false
    }
    try {
        $expectedFingerprint = Get-NovaCoreOfficialReportFingerprint `
            -Report $OfficialReport
    }
    catch {
        return $false
    }
    if ([string]$OfficialReport.ReportFingerprint -cne
        [string]$expectedFingerprint) {
        return $false
    }
    return $true
}

function Resolve-MissionOutcomeToLotCertificationDecision {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][AllowNull()][object]$ExecutionMode,
        [Parameter(Mandatory)][AllowNull()][object]$OfficialStatus,
        [Parameter(Mandatory)][AllowNull()][object]$AuthorityDecision,
        [Parameter(Mandatory)][AllowNull()][object]$FinalMissionState,
        [Parameter(Mandatory)][AllowNull()][object]$ExitCode,
        [Parameter(Mandatory)][AllowNull()][object]$OfficialReport,
        [Parameter(Mandatory)][AllowNull()][object]$Evidence,
        [Parameter(Mandatory)][AllowNull()][object]$Tests,
        [Parameter(Mandatory)][AllowNull()][object]$Regressions,
        [Parameter(Mandatory)][AllowNull()][object]$ContractCriteriaSatisfied
    )
    $mode = [string]$ExecutionMode
    $status = [string]$OfficialStatus
    $authority = [string]$AuthorityDecision
    $finalState = [string]$FinalMissionState
    $allowedModes = @(
        'BACKFILL',
        'IMPLEMENTATION',
        'CORRECTION',
        'DOMAIN_CERTIFICATION'
    )
    $allowedStatuses = @(
        'SUCCESS',
        'READY_FOR_REVIEW',
        'NO_CHANGE',
        'PARTIAL',
        'BLOCKED',
        'FAILED',
        'CANCELLED'
    )
    $allowedAuthorities = @(
        '',
        'ACCEPTED',
        'REJECTED',
        'PENDING_REVIEW',
        'NOT_APPLICABLE'
    )
    $allowedFinalStates = @(
        'COMPLETED',
        'ACCEPTED',
        'READY_FOR_REVIEW',
        'REJECTED',
        'FAILED',
        'CANCELLED'
    )
    $exitCodeValue = 0
    $inputContractInvalid = (
        $mode -notin $allowedModes -or
        $status -notin $allowedStatuses -or
        $authority -notin $allowedAuthorities -or
        $finalState -notin $allowedFinalStates -or
        -not [int]::TryParse([string]$ExitCode, [ref]$exitCodeValue) -or
        $ContractCriteriaSatisfied -isnot [bool]
    )
    if ($inputContractInvalid) {
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            'OUTCOME_CONTRACT_INVALID' `
            $true `
            'KEEP_CURRENT' `
            $false
    }

    if (-not (Test-MissionOutcomeReportIntegrity `
        $OfficialReport `
        $status `
        $authority `
        $finalState `
        $exitCodeValue `
        $Tests)) {
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            'OFFICIAL_REPORT_INVALID_OR_ABSENT' `
            $true `
            'KEEP_CURRENT' `
            $false
    }

    $cancellationSignal = (
        $status -ceq 'CANCELLED' -or
        $finalState -ceq 'CANCELLED'
    )
    if ($cancellationSignal) {
        if ($status -ceq 'CANCELLED' -and
            $finalState -ceq 'CANCELLED' -and
            $authority -ceq 'NOT_APPLICABLE') {
            return New-MissionOutcomeLotDecision `
                'CANCELLED' `
                'MISSION_CANCELLED' `
                $true `
                'KEEP_CURRENT' `
                $false
        }
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            'OUTCOME_CONTRACT_INVALID' `
            $true `
            'KEEP_CURRENT' `
            $false
    }

    if ($status -ceq 'NO_CHANGE') {
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            'NO_CHANGE_NOT_CANONICAL_FOR_DOMAIN_LOT' `
            $true `
            'KEEP_CURRENT' `
            $false
    }

    if ($exitCodeValue -ne 0) {
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            'MISSION_EXIT_CODE_NON_ZERO' `
            $true `
            'KEEP_CURRENT' `
            $false
    }

    if ($status -in @('FAILED','PARTIAL','BLOCKED') -or
        $finalState -ceq 'FAILED') {
        $technicalTupleValid = (
            ($status -ceq 'FAILED' -and
                $authority -ceq 'NOT_APPLICABLE' -and
                $finalState -ceq 'FAILED') -or
            ($status -in @('PARTIAL','BLOCKED') -and
                $authority -ceq 'REJECTED' -and
                $finalState -ceq 'REJECTED')
        )
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            $(if ($technicalTupleValid) {
                "MISSION_$status"
            } else {
                'OUTCOME_CONTRACT_INVALID'
            }) `
            $true `
            'KEEP_CURRENT' `
            $false
    }

    if (($authority -ceq 'REJECTED') -xor
        ($finalState -ceq 'REJECTED')) {
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            'OUTCOME_CONTRACT_INVALID' `
            $true `
            'KEEP_CURRENT' `
            $false
    }
    if ($authority -ceq 'REJECTED' -and
        $finalState -ceq 'REJECTED') {
        return New-MissionOutcomeLotDecision `
            'REJECTED' `
            'AUTHORITY_REJECTED' `
            $true `
            'REJECTED' `
            $true
    }

    $evidenceState = Get-MissionOutcomeEvidenceState `
        $Evidence `
        $OfficialReport
    $testsState = Get-MissionOutcomeTestsState $Tests
    $regressionsState = Get-MissionOutcomeRegressionState $Regressions

    $pendingSignal = (
        $authority -ceq 'PENDING_REVIEW' -or
        $finalState -ceq 'READY_FOR_REVIEW' -or
        ($status -ceq 'READY_FOR_REVIEW' -and
            [string]::IsNullOrWhiteSpace($authority))
    )
    if ($pendingSignal) {
        $pendingTupleValid = (
            $finalState -ceq 'READY_FOR_REVIEW' -and
            $authority -in @('','PENDING_REVIEW') -and
            $status -in @('SUCCESS','READY_FOR_REVIEW')
        )
        if (-not $pendingTupleValid) {
            return New-MissionOutcomeLotDecision `
                'EXECUTION_FAILED' `
                'OUTCOME_CONTRACT_INVALID' `
                $true `
                'KEEP_CURRENT' `
                $false
        }
        if ($testsState -ne 'ALL_REQUIRED_PASS') {
            return New-MissionOutcomeLotDecision `
                'REJECTED' `
                $(if ($testsState -eq 'REQUIRED_FAILED') {
                    'REQUIRED_TEST_FAILED'
                } else {
                    'REQUIRED_TESTS_ABSENT_OR_INVALID'
                }) `
                $true `
                'REJECTED' `
                $true
        }
        if ($regressionsState -eq 'BLOCKING') {
            return New-MissionOutcomeLotDecision `
                'REJECTED' `
                'BLOCKING_REGRESSION_DETECTED' `
                $true `
                'REJECTED' `
                $true
        }
        if ($regressionsState -eq 'UNKNOWN' -or
            $evidenceState -ne 'COMPLETE_VALID') {
            return New-MissionOutcomeLotDecision `
                'REJECTED' `
                'CERTIFICATION_EVIDENCE_INVALID' `
                $true `
                'REJECTED' `
                $true
        }
        return New-MissionOutcomeLotDecision `
            'PENDING_REVIEW' `
            'AUTHORITY_REVIEW_REQUIRED' `
            $true `
            'KEEP_PENDING_EVIDENCE' `
            $false
    }

    $completedTupleValid = (
        $status -in @('SUCCESS','READY_FOR_REVIEW') -and
        $authority -ceq 'ACCEPTED' -and
        $finalState -in @('ACCEPTED','COMPLETED')
    )
    if (-not $completedTupleValid) {
        return New-MissionOutcomeLotDecision `
            'EXECUTION_FAILED' `
            'OUTCOME_CONTRACT_INVALID' `
            $true `
            'KEEP_CURRENT' `
            $false
    }

    if ($evidenceState -ne 'COMPLETE_VALID') {
        return New-MissionOutcomeLotDecision `
            'REJECTED' `
            $(if ($evidenceState -eq 'ABSENT') {
                'CERTIFICATION_EVIDENCE_ABSENT'
            } else {
                'CERTIFICATION_EVIDENCE_INVALID'
            }) `
            $true `
            'REJECTED' `
            $true
    }
    if ($testsState -ne 'ALL_REQUIRED_PASS') {
        return New-MissionOutcomeLotDecision `
            'REJECTED' `
            $(if ($testsState -eq 'REQUIRED_FAILED') {
                'REQUIRED_TEST_FAILED'
            } else {
                'REQUIRED_TESTS_ABSENT_OR_INVALID'
            }) `
            $true `
            'REJECTED' `
            $true
    }
    if ($regressionsState -eq 'BLOCKING') {
        return New-MissionOutcomeLotDecision `
            'REJECTED' `
            'BLOCKING_REGRESSION_DETECTED' `
            $true `
            'REJECTED' `
            $true
    }
    if ($regressionsState -eq 'UNKNOWN') {
        return New-MissionOutcomeLotDecision `
            'REJECTED' `
            'REGRESSION_QUALIFICATION_REQUIRED' `
            $true `
            'REJECTED' `
            $true
    }
    if (-not [bool]$ContractCriteriaSatisfied) {
        return New-MissionOutcomeLotDecision `
            'REJECTED' `
            'LOT_CONTRACT_CRITERIA_NOT_SATISFIED' `
            $true `
            'REJECTED' `
            $true
    }
    return New-MissionOutcomeLotDecision `
        'CERTIFIED' `
        'MISSION_OUTCOME_CERTIFIED' `
        $false `
        'CERTIFIED' `
        $true
}

function Complete-DomainLot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId,
        [Parameter(Mandatory)]$Result,
        [Parameter(Mandatory)][string]$MissionId
    )
    foreach ($property in @('Status','Evidence','Tests','Regressions')) {
        if (-not (Test-OrchestrationProperty $Result $property)) {
            throw "LOT_RESULT_INCOMPLETE:$property"
        }
    }
    if ([string]$Result.Status -notin @('CERTIFIED','REJECTED')) {
        throw "LOT_RESULT_STATUS_INVALID:$($Result.Status)"
    }
    $context = Resolve-DomainContext $Repository $DomainId
    $current = Resolve-CurrentLot $context.Repository $DomainId $context
    if ($current.DomainCertification -or
        [string]$current.CurrentLot -cne $LotId) {
        throw "LOT_NOT_CURRENT:$LotId"
    }
    $certification = [PSCustomObject][ordered]@{
        MissionId = $MissionId
        DomainId = $DomainId
        LotId = $LotId
        Status = [string]$Result.Status
        CertifiedAt = $(if ([string]$Result.Status -eq 'CERTIFIED') {
            [DateTimeOffset]::UtcNow.ToString('o')
        } else { $null })
        Evidence = [object[]]@($Result.Evidence)
        Tests = [object[]]@($Result.Tests)
        Regressions = [string]$Result.Regressions
        PreviousLot = $current.Contract.PreviousLot
        NextAuthorizedLot = $current.Contract.NextLot
    }
    $written = Write-LotCertification `
        -Repository $context.Repository `
        -Certification $certification
    $next = $null
    if ([string]$written.Status -eq 'CERTIFIED' -and
        $null -ne $current.Contract.NextLot) {
        $next = Open-NextDomainLot `
            -Repository $context.Repository `
            -DomainId $DomainId `
            -CertifiedLotId $LotId `
            -MissionId $MissionId
    }
    return [PSCustomObject][ordered]@{
        Certification = $written
        NextLot = $next
    }
}

function Get-CodeSnapshot {
    param([string[]]$Roots)
    $snapshot = @{}
    foreach ($root in @($Roots | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $root -PathType Container)) { continue }
        foreach ($file in @(Get-ChildItem -LiteralPath $root -Recurse -File)) {
            $snapshot[$file.FullName] = (
                Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256
            ).Hash
        }
    }
    return $snapshot
}

function Test-CodeSnapshotEqual {
    param(
        [Parameter(Mandatory)]$Before,
        [Parameter(Mandatory)]$After
    )
    if ($Before.Count -ne $After.Count) { return $false }
    foreach ($key in $Before.Keys) {
        if (-not $After.ContainsKey($key) -or
            [string]$Before[$key] -cne [string]$After[$key]) {
            return $false
        }
    }
    return $true
}

function Invoke-DomainLot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [AllowNull()][AllowEmptyString()][string]$DomainId,
        [switch]$DryRun,
        [scriptblock]$Executor,
        [string]$MissionId = 'IMPLEMENT-DOMAIN-V2'
    )
    $domain = Resolve-DomainContext $Repository $DomainId
    $current = Resolve-CurrentLot $domain.Repository $DomainId $domain
    $mode = Resolve-LotExecutionMode `
        $domain.Repository `
        $DomainId `
        $domain `
        $current
    $authorized = if ($current.DomainCertification) {
        $true
    } else {
        Test-LotAuthorization `
            $domain.Repository `
            $DomainId `
            $current.CurrentLot `
            $domain `
            $current
    }
    if (-not $authorized) { throw 'LOT_NOT_AUTHORIZED' }
    $dryRunResult = [PSCustomObject][ordered]@{
        DomainId = $DomainId
        CanonicalSources = [string[]]@(
            $domain.RegistryPath,
            $domain.BlueprintPath,
            $domain.ImplementationContractPath
        )
        LastCertifiedLot = $current.LastCertifiedLot
        CurrentLot = $current.CurrentLot
        CurrentStatus = $current.CurrentStatus
        ExecutionMode = $mode.Mode
        PotentialFiles = $(if ($current.DomainCertification) {
            [string[]]@()
        } else {
            [string[]]@($current.Contract.AuthorizedFiles)
        })
        RequiredTests = $(if ($current.DomainCertification) {
            [string[]]@()
        } else {
            [string[]]$current.Contract.Tests
        })
        NextLot = $(if ($current.DomainCertification) {
            $null
        } else {
            $current.Contract.NextLot
        })
        CodeEvidence = [string[]]$mode.CodeEvidence
        DryRun = [bool]$DryRun
        WritesPerformed = $false
    }
    if ($DryRun) { return $dryRunResult }
    if ($null -eq $Executor) { throw 'LOT_EXECUTOR_REQUIRED' }

    $currentLotOpened = $false
    if ($current.CurrentStatus -eq 'ABSENT') {
        [void](Write-LotCertification `
            -Repository $domain.Repository `
            -Certification (
                New-PendingLotCertification $MissionId $current.Contract
            ))
        $currentLotOpened = $true
        $domain = Resolve-DomainContext $domain.Repository $DomainId
        $current = Resolve-CurrentLot $domain.Repository $DomainId $domain
    }
    $before = if ($mode.Mode -eq 'BACKFILL') {
        Get-CodeSnapshot ([string[]]$mode.CodeRoots)
    } else { $null }
    $executionContext = [PSCustomObject][ordered]@{
        Domain = $domain
        Lot = $current
        Mode = $mode
        Contract = $current.Contract
        NonSelfBlocking = $true
        SingleLot = $true
    }
    $result = & $Executor $executionContext
    if ($null -eq $result) { throw 'LOT_RESULT_REQUIRED' }
    if ($mode.Mode -eq 'BACKFILL') {
        $after = Get-CodeSnapshot ([string[]]$mode.CodeRoots)
        if (-not (Test-CodeSnapshotEqual $before $after)) {
            throw 'BACKFILL_CODE_MODIFIED'
        }
    }
    $rawValues = @{}
    foreach ($property in @(
        'OfficialStatus',
        'AuthorityDecision',
        'FinalMissionState',
        'ExitCode',
        'OfficialReport',
        'Evidence',
        'Tests',
        'Regressions',
        'ContractCriteriaSatisfied'
    )) {
        $rawValues[$property] = if (
            Test-OrchestrationProperty $result $property
        ) {
            $result.$property
        } else {
            $null
        }
    }
    $policy = Resolve-MissionOutcomeToLotCertificationDecision `
        -ExecutionMode $mode.Mode `
        -OfficialStatus $rawValues.OfficialStatus `
        -AuthorityDecision $rawValues.AuthorityDecision `
        -FinalMissionState $rawValues.FinalMissionState `
        -ExitCode $rawValues.ExitCode `
        -OfficialReport $rawValues.OfficialReport `
        -Evidence $rawValues.Evidence `
        -Tests $rawValues.Tests `
        -Regressions $rawValues.Regressions `
        -ContractCriteriaSatisfied $rawValues.ContractCriteriaSatisfied
    $completion = $null
    $completeDomainLotInvocations = 0
    if ([bool]$policy.InvokeCompleteDomainLot) {
        $completeDomainLotInvocations += 1
        $completion = Complete-DomainLot `
            -Repository $domain.Repository `
            -DomainId $DomainId `
            -LotId $current.CurrentLot `
            -Result ([PSCustomObject][ordered]@{
                Status = [string]$policy.Decision
                Evidence = [object[]]@($rawValues.Evidence)
                Tests = [object[]]@($rawValues.Tests)
                Regressions = [string]$rawValues.Regressions
            }) `
            -MissionId $MissionId
    }
    return [PSCustomObject][ordered]@{
        DomainId = $DomainId
        CurrentLot = $current.CurrentLot
        ExecutionMode = $mode.Mode
        Status = [string]$policy.Decision
        Decision = [string]$policy.Decision
        ReasonCode = [string]$policy.ReasonCode
        RetryAllowed = [bool]$policy.RetryAllowed
        RegistryTransition = [string]$policy.RegistryTransition
        InvokeCompleteDomainLot = [bool]$policy.InvokeCompleteDomainLot
        PreserveEvidence = [bool]$policy.PreserveEvidence
        Evidence = $rawValues.Evidence
        Tests = $rawValues.Tests
        Regressions = $rawValues.Regressions
        NextLotOpened = $(if ($null -eq $completion -or
            $null -eq $completion.NextLot) {
            $null
        } else {
            [string]$completion.NextLot.LotId
        })
        CompleteDomainLotInvocations = $completeDomainLotInvocations
        ExecutedLots = 1
        DryRun = $false
        WritesPerformed = (
            $currentLotOpened -or [bool]$policy.InvokeCompleteDomainLot
        )
    }
}

Export-ModuleMember -Function `
    Resolve-DomainContext,`
    Resolve-CurrentLot,`
    Resolve-LotExecutionMode,`
    Read-LotImplementationContract,`
    Test-LotAuthorization,`
    Resolve-MissionOutcomeToLotCertificationDecision,`
    Invoke-DomainLot,`
    Complete-DomainLot,`
    Open-NextDomainLot

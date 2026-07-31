Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$script:RecoveryLaneClasses = @('READ_ONLY','EVIDENCE_PRODUCTION','AUDIT','CERTIFICATION_REMEDIATION')
$script:FreezeModes = @('FULL_FREEZE','WRITE_FREEZE','SCOPE_FREEZE','RELEASE_FREEZE')
$script:FunctionalDomainPatterns = @(
    'apps/nova-web/src/**',
    'server/nova-core/**',
    'server/runtime/**',
    'Docs/24_MODULES/**'
)

function Test-NovaCoreProperty {
    param($Value, [Parameter(Mandatory)][string]$Name)
    return $null -ne $Value -and $Value.PSObject.Properties.Name -contains $Name
}

function ConvertTo-NovaCoreGovernanceJsonString {
    param([AllowEmptyString()][string]$Value)
    $builder = [Text.StringBuilder]::new()
    [void]$builder.Append('"')
    for ($index = 0; $index -lt $Value.Length; $index++) {
        $character = $Value[$index]
        $code = [int]$character
        $escape = $null
        switch ($code) {
            8 { $escape = '\b'; break }
            9 { $escape = '\t'; break }
            10 { $escape = '\n'; break }
            12 { $escape = '\f'; break }
            13 { $escape = '\r'; break }
            34 { $escape = '\"'; break }
            92 { $escape = '\\'; break }
        }
        if ($null -ne $escape) {
            [void]$builder.Append($escape)
            continue
        }
        if ($code -lt 32 -or
            ([char]::IsSurrogate($character) -and
                -not ($code -ge 0xD800 -and $code -le 0xDBFF -and
                    $index + 1 -lt $Value.Length -and [char]::IsLowSurrogate($Value[$index + 1])))) {
            [void]$builder.Append('\u')
            [void]$builder.Append($code.ToString('x4', [Globalization.CultureInfo]::InvariantCulture))
            continue
        }
        [void]$builder.Append($character)
        if ($code -ge 0xD800 -and $code -le 0xDBFF) {
            $index++
            [void]$builder.Append($Value[$index])
        }
    }
    [void]$builder.Append('"')
    return $builder.ToString()
}

function ConvertTo-NovaCoreGovernanceCanonicalJson {
    param($Value)
    if ($null -eq $Value) { return 'null' }
    if ($Value -is [bool]) { return $(if ($Value) { 'true' } else { 'false' }) }
    if ($Value -is [string] -or $Value -is [char] -or $Value -is [DateTime] -or $Value -is [DateTimeOffset] -or $Value -is [Guid]) {
        return ConvertTo-NovaCoreGovernanceJsonString ([string]$Value)
    }
    if ($Value -is [byte] -or $Value -is [sbyte] -or $Value -is [int16] -or $Value -is [uint16] -or
        $Value -is [int32] -or $Value -is [uint32] -or $Value -is [int64] -or $Value -is [uint64]) {
        return [Convert]::ToString($Value, [Globalization.CultureInfo]::InvariantCulture)
    }
    if ($Value -is [single] -or $Value -is [double] -or $Value -is [decimal]) {
        return $Value.ToString('G17', [Globalization.CultureInfo]::InvariantCulture)
    }
    if ($Value -is [Collections.IDictionary]) {
        $parts = foreach ($key in @($Value.Keys | Sort-Object)) {
            '{0}:{1}' -f (ConvertTo-NovaCoreGovernanceCanonicalJson ([string]$key)), (ConvertTo-NovaCoreGovernanceCanonicalJson $Value[$key])
        }
        return '{' + ($parts -join ',') + '}'
    }
    if ($Value -is [Collections.IEnumerable] -and $Value -isnot [string] -and $Value -isnot [Management.Automation.PSCustomObject]) {
        $parts = foreach ($item in @($Value)) { ConvertTo-NovaCoreGovernanceCanonicalJson $item }
        return '[' + ($parts -join ',') + ']'
    }
    $propertyParts = foreach ($property in @($Value.PSObject.Properties | Sort-Object Name)) {
        '{0}:{1}' -f (ConvertTo-NovaCoreGovernanceCanonicalJson $property.Name), (ConvertTo-NovaCoreGovernanceCanonicalJson $property.Value)
    }
    return '{' + ($propertyParts -join ',') + '}'
}

function Get-NovaCoreGovernanceStringHash {
    param([AllowEmptyString()][string]$Value)
    $algorithm = [Security.Cryptography.SHA256]::Create()
    try {
        return ([BitConverter]::ToString($algorithm.ComputeHash($script:Utf8NoBom.GetBytes($Value))).Replace('-',''))
    }
    finally { $algorithm.Dispose() }
}

function Get-NovaCoreGovernanceFileHash {
    param([Parameter(Mandatory)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    $stream = [IO.File]::OpenRead($Path)
    $algorithm = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace('-','') }
    finally { $algorithm.Dispose(); $stream.Dispose() }
}

function ConvertTo-NovaCorePortableJsonValue {
    param([Parameter(Mandatory)]$Value)
    $json = $Value | ConvertTo-Json -Depth 100
    $portableJson = [regex]::Replace(
        $json,
        '\\/Date\((-?\d+)(?:[+-]\d+)?\)\\/',
        {
            param($match)
            return [DateTimeOffset]::FromUnixTimeMilliseconds(
                [long]$match.Groups[1].Value
            ).UtcDateTime.ToString('o', [Globalization.CultureInfo]::InvariantCulture)
        }
    )
    return $portableJson | ConvertFrom-Json
}

function Test-NovaCoreGovernanceRelativePath {
    param([string]$Path)
    return -not [string]::IsNullOrWhiteSpace($Path) -and
        -not [IO.Path]::IsPathRooted($Path) -and
        $Path -notmatch '(^|[\\/])\.\.([\\/]|$)'
}

function Test-NovaCoreGovernancePathMatch {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Pattern)
    return $Path.Replace('\','/').TrimStart('/') -like $Pattern.Replace('\','/').TrimStart('/')
}

function Get-NovaCoreGovernedMissionInputFingerprint {
    param(
        [Parameter(Mandatory)]$Mission,
        [string]$Repository,
        [string]$Branch,
        [string]$ContextFingerprint
    )
    $missionCopy = $Mission | ConvertTo-Json -Depth 100 | ConvertFrom-Json
    if (Test-NovaCoreProperty $missionCopy 'recoveryLane') {
        if (Test-NovaCoreProperty $missionCopy.recoveryLane 'inputFingerprint') {
            $missionCopy.recoveryLane.inputFingerprint = $null
        }
    }
    $inputs = [Collections.Generic.List[object]]::new()
    if (Test-NovaCoreProperty $Mission 'inputEvidence') {
        foreach ($entry in @($Mission.inputEvidence)) {
            $path = if (Test-NovaCoreProperty $entry 'path') { [string]$entry.path } else { '' }
            $absolute = if ($Repository -and (Test-NovaCoreGovernanceRelativePath $path)) { Join-Path $Repository $path } else { $null }
            $inputs.Add([PSCustomObject][ordered]@{
                evidenceId = if (Test-NovaCoreProperty $entry 'evidenceId') { [string]$entry.evidenceId } else { $null }
                path = $path
                declaredSha256 = if (Test-NovaCoreProperty $entry 'sha256') { [string]$entry.sha256 } else { $null }
                observedSha256 = if ($absolute) { Get-NovaCoreGovernanceFileHash $absolute } else { $null }
            })
        }
    }
    $payload = [PSCustomObject][ordered]@{
        mission = $missionCopy
        repository = $Repository
        branch = $Branch
        contextFingerprint = $ContextFingerprint
        inputEvidence = @($inputs)
    }
    return Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson $payload)
}

function Assert-NovaCoreRecoveryLane {
    param(
        [Parameter(Mandatory)]$Mission,
        [Parameter(Mandatory)]$RecoveryLane,
        [string]$Repository,
        [string]$Branch
    )
    $required = @(
        'recoveryLaneClass','recoveryReason','blockedRule','requiredEvidence',
        'authorizedScope','authorizedFiles','forbiddenFiles','authority',
        'expirationOrAttemptLimit','inputFingerprint'
    )
    foreach ($name in $required) {
        if (-not (Test-NovaCoreProperty $RecoveryLane $name)) { throw "NOVA_CORE_RECOVERY_PROPERTY_MISSING:$name" }
    }
    $class = [string]$RecoveryLane.recoveryLaneClass
    if ($class -notin $script:RecoveryLaneClasses) { throw "NOVA_CORE_RECOVERY_CLASS_INVALID:$class" }
    foreach ($name in @('recoveryReason','blockedRule','authority')) {
        if ([string]::IsNullOrWhiteSpace([string]$RecoveryLane.$name)) { throw "NOVA_CORE_RECOVERY_PROPERTY_INVALID:$name" }
    }
    if ([string]$RecoveryLane.recoveryReason -notmatch '[A-Za-z0-9].{7,}') { throw 'NOVA_CORE_RECOVERY_REASON_INVALID' }
    foreach ($name in @('requiredEvidence','authorizedScope','authorizedFiles','forbiddenFiles')) {
        if ($RecoveryLane.$name -isnot [Array]) { throw "NOVA_CORE_RECOVERY_PROPERTY_INVALID:$name" }
    }
    if (@($RecoveryLane.authorizedScope).Count -eq 0) { throw 'NOVA_CORE_RECOVERY_SCOPE_EMPTY' }
    foreach ($path in @($RecoveryLane.authorizedScope) + @($RecoveryLane.authorizedFiles) + @($RecoveryLane.forbiddenFiles)) {
        if (-not (Test-NovaCoreGovernanceRelativePath ([string]$path))) { throw "NOVA_CORE_RECOVERY_PATH_INVALID:$path" }
    }
    if ($class -eq 'READ_ONLY' -and @($RecoveryLane.authorizedFiles).Count -ne 0) {
        throw 'NOVA_CORE_RECOVERY_READ_ONLY_WRITE_FORBIDDEN'
    }
    if ($class -ne 'READ_ONLY' -and @($RecoveryLane.authorizedFiles).Count -eq 0) {
        throw 'NOVA_CORE_RECOVERY_AUTHORIZED_FILES_EMPTY'
    }
    if ($class -eq 'CERTIFICATION_REMEDIATION') {
        if (-not (Test-NovaCoreProperty $Mission 'certification') -or $null -eq $Mission.certification) {
            throw 'NOVA_CORE_RECOVERY_CERTIFICATION_CONTRACT_MISSING'
        }
        foreach ($name in @('baselinePath','outputReportPath')) {
            if (-not (Test-NovaCoreProperty $Mission.certification $name) -or
                -not (Test-NovaCoreGovernanceRelativePath ([string]$Mission.certification.$name))) {
                throw "NOVA_CORE_RECOVERY_CERTIFICATION_CONTRACT_INVALID:$name"
            }
        }
        $baseline = ([string]$Mission.certification.baselinePath).Replace('\','/').TrimStart('/')
        $output = ([string]$Mission.certification.outputReportPath).Replace('\','/').TrimStart('/')
        if ($baseline -eq $output) { throw 'NOVA_CORE_RECOVERY_CERTIFICATION_REFLEXIVE_BASELINE' }
    }
    foreach ($path in @($RecoveryLane.authorizedFiles)) {
        $covered = @($RecoveryLane.authorizedScope | Where-Object { Test-NovaCoreGovernancePathMatch ([string]$path) ([string]$_) }).Count -gt 0
        $forbidden = @($RecoveryLane.forbiddenFiles | Where-Object { Test-NovaCoreGovernancePathMatch ([string]$path) ([string]$_) }).Count -gt 0
        $functional = @($script:FunctionalDomainPatterns | Where-Object { Test-NovaCoreGovernancePathMatch ([string]$path) ([string]$_) }).Count -gt 0
        $missionAllowed = if (Test-NovaCoreProperty $Mission 'allowedPaths') {
            @($Mission.allowedPaths | Where-Object { Test-NovaCoreGovernancePathMatch ([string]$path) ([string]$_) }).Count -gt 0
        } else { $false }
        $missionForbidden = if (Test-NovaCoreProperty $Mission 'forbiddenPaths') {
            @($Mission.forbiddenPaths | Where-Object { Test-NovaCoreGovernancePathMatch ([string]$path) ([string]$_) }).Count -gt 0
        } else { $false }
        if (-not $covered) { throw "NOVA_CORE_RECOVERY_SCOPE_EXCEEDED:$path" }
        if (-not $missionAllowed) { throw "NOVA_CORE_RECOVERY_MISSION_SCOPE_EXCEEDED:$path" }
        if ($forbidden -or $functional -or $missionForbidden) { throw "NOVA_CORE_RECOVERY_FILE_FORBIDDEN:$path" }
    }
    $limit = $RecoveryLane.expirationOrAttemptLimit
    $hasAttemptLimit = Test-NovaCoreProperty $limit 'attemptLimit'
    $hasExpiration = Test-NovaCoreProperty $limit 'expiresAt'
    if (-not $hasAttemptLimit -and -not $hasExpiration) { throw 'NOVA_CORE_RECOVERY_LIMIT_INVALID' }
    if ($hasAttemptLimit -and (([int]$limit.attemptLimit) -lt 1 -or ([int]$limit.attemptLimit) -gt 10)) {
        throw 'NOVA_CORE_RECOVERY_ATTEMPT_LIMIT_INVALID'
    }
    if ($hasExpiration) {
        $parsedExpiration = [DateTimeOffset]::MinValue
        if (-not [DateTimeOffset]::TryParse([string]$limit.expiresAt, [ref]$parsedExpiration) -or $parsedExpiration -le [DateTimeOffset]::UtcNow) {
            throw 'NOVA_CORE_RECOVERY_EXPIRED'
        }
    }
    if ([string]$RecoveryLane.inputFingerprint -notmatch '^[A-Fa-f0-9]{64}$') { throw 'NOVA_CORE_RECOVERY_INPUT_FINGERPRINT_INVALID' }
    $actualFingerprint = Get-NovaCoreGovernedMissionInputFingerprint -Mission $Mission -Repository $Repository -Branch $Branch
    if ($actualFingerprint -ne ([string]$RecoveryLane.inputFingerprint).ToUpperInvariant()) {
        throw "NOVA_CORE_RECOVERY_INPUT_FINGERPRINT_MISMATCH:EXPECTED=$($RecoveryLane.inputFingerprint);ACTUAL=$actualFingerprint"
    }
    return [PSCustomObject][ordered]@{
        mode = 'RECOVERY'
        recoveryLaneClass = $class
        authority = [string]$RecoveryLane.authority
        blockedRule = [string]$RecoveryLane.blockedRule
        reason = [string]$RecoveryLane.recoveryReason
        authorizedScope = @($RecoveryLane.authorizedScope)
        authorizedFiles = @($RecoveryLane.authorizedFiles)
        forbiddenFiles = @($RecoveryLane.forbiddenFiles)
        inputFingerprint = $actualFingerprint
        nonSelfBlockingException = $true
        directProductionReleaseAuthorized = $false
    }
}

function Test-NovaCoreFreezeAdmission {
    param([Parameter(Mandatory)]$Mission, [Parameter(Mandatory)]$Admission)
    if (-not (Test-NovaCoreProperty $Mission 'freeze') -or $null -eq $Mission.freeze) {
        return [PSCustomObject]@{ active=$false; mode=$null; exceptionApplied=$false; source=$null; authority=$null }
    }
    $freeze = $Mission.freeze
    foreach ($name in @('active','mode','authority','source')) {
        if (-not (Test-NovaCoreProperty $freeze $name)) { throw "NOVA_CORE_FREEZE_PROPERTY_MISSING:$name" }
    }
    $mode = [string]$freeze.mode
    if ($mode -notin $script:FreezeModes) { throw "NOVA_CORE_FREEZE_MODE_INVALID:$mode" }
    if (-not [bool]$freeze.active) {
        return [PSCustomObject]@{ active=$false; mode=$mode; exceptionApplied=$false; source=[string]$freeze.source; authority=[string]$freeze.authority }
    }
    $isRecovery = [string]$Admission.mode -eq 'RECOVERY'
    $changesExpected = if (Test-NovaCoreProperty $Mission 'changesExpected') { [bool]$Mission.changesExpected } else { $true }
    $normalBlocked = $mode -in @('FULL_FREEZE','RELEASE_FREEZE') -or ($mode -eq 'WRITE_FREEZE' -and $changesExpected)
    if ($mode -eq 'SCOPE_FREEZE') {
        if (-not (Test-NovaCoreProperty $freeze 'frozenScopes') -or $freeze.frozenScopes -isnot [Array]) {
            throw 'NOVA_CORE_FREEZE_SCOPE_INVALID'
        }
        $missionPaths = if (Test-NovaCoreProperty $Mission 'allowedPaths') { @($Mission.allowedPaths) } else { @() }
        $normalBlocked = @($missionPaths | Where-Object {
            $candidate = [string]$_
            @($freeze.frozenScopes | Where-Object {
                (Test-NovaCoreGovernancePathMatch $candidate ([string]$_)) -or
                (Test-NovaCoreGovernancePathMatch ([string]$_) $candidate)
            }).Count -gt 0
        }).Count -gt 0
    }
    if (-not $normalBlocked) {
        return [PSCustomObject]@{ active=$true; mode=$mode; exceptionApplied=$false; source=[string]$freeze.source; authority=[string]$freeze.authority }
    }
    if (-not $isRecovery) { throw "NOVA_CORE_FREEZE_BLOCKED:$mode" }
    if (-not (Test-NovaCoreProperty $freeze 'exception') -or $null -eq $freeze.exception) {
        throw 'NOVA_CORE_FREEZE_EXCEPTION_REQUIRED'
    }
    foreach ($name in @('recoveryLaneClass','authority','reason')) {
        if (-not (Test-NovaCoreProperty $freeze.exception $name) -or [string]::IsNullOrWhiteSpace([string]$freeze.exception.$name)) {
            throw "NOVA_CORE_FREEZE_EXCEPTION_INVALID:$name"
        }
    }
    if ([string]$freeze.exception.recoveryLaneClass -ne [string]$Admission.recoveryLaneClass) {
        throw 'NOVA_CORE_FREEZE_EXCEPTION_CLASS_MISMATCH'
    }
    if ([string]$freeze.exception.authority -ne [string]$freeze.authority) {
        throw 'NOVA_CORE_FREEZE_EXCEPTION_AUTHORITY_MISMATCH'
    }
    return [PSCustomObject]@{
        active=$true
        mode=$mode
        exceptionApplied=$true
        exceptionClass=[string]$Admission.recoveryLaneClass
        source=[string]$freeze.source
        authority=[string]$freeze.authority
        productionReleaseAuthorized=$false
    }
}

function Test-NovaCoreGovernedAdmission {
    param(
        [Parameter(Mandatory)]$Mission,
        [string]$Repository,
        [string]$Branch
    )
    $admission = if ((Test-NovaCoreProperty $Mission 'recoveryLane') -and $null -ne $Mission.recoveryLane) {
        Assert-NovaCoreRecoveryLane -Mission $Mission -RecoveryLane $Mission.recoveryLane -Repository $Repository -Branch $Branch
    }
    else {
        [PSCustomObject][ordered]@{
            mode='NORMAL'
            recoveryLaneClass=$null
            authority=$null
            blockedRule=$null
            reason=$null
            authorizedScope=@()
            authorizedFiles=@()
            forbiddenFiles=@()
            inputFingerprint=(Get-NovaCoreGovernedMissionInputFingerprint -Mission $Mission -Repository $Repository -Branch $Branch)
            nonSelfBlockingException=$false
            directProductionReleaseAuthorized=$false
        }
    }
    $freeze = Test-NovaCoreFreezeAdmission -Mission $Mission -Admission $admission
    $admission | Add-Member -NotePropertyName freeze -NotePropertyValue $freeze
    $admission | Add-Member -NotePropertyName admittedAt -NotePropertyValue ([DateTimeOffset]::UtcNow.ToString('o'))
    return $admission
}

function Get-NovaCoreMissionScopeFingerprint {
    param([Parameter(Mandatory)]$Mission, $Admission)
    $payload = [PSCustomObject][ordered]@{
        allowedPaths = if (Test-NovaCoreProperty $Mission 'allowedPaths') { @($Mission.allowedPaths | Sort-Object) } else { @() }
        forbiddenPaths = if (Test-NovaCoreProperty $Mission 'forbiddenPaths') { @($Mission.forbiddenPaths | Sort-Object) } else { @() }
        recoveryAuthorizedScope = if ($Admission) { @($Admission.authorizedScope | Sort-Object) } else { @() }
        recoveryAuthorizedFiles = if ($Admission) { @($Admission.authorizedFiles | Sort-Object) } else { @() }
    }
    return Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson $payload)
}

function Enter-NovaCoreMissionLock {
    param(
        [Parameter(Mandatory)]$Mission,
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$Branch,
        [Parameter(Mandatory)][string]$InputFingerprint,
        [Parameter(Mandatory)][string]$ScopeFingerprint,
        [Parameter(Mandatory)][string]$LockDirectory,
        $RebindAuthorization
    )
    if (-not (Test-Path -LiteralPath $LockDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $LockDirectory -Force | Out-Null
    }
    $safeMission = ([string]$Mission.missionId -replace '[^A-Za-z0-9._-]','_')
    $path = Join-Path $LockDirectory "$safeMission.lock.json"
    $hostName = [Environment]::MachineName
    $authorizedScopes = if (Test-NovaCoreProperty $Mission 'allowedPaths') { @($Mission.allowedPaths) } else { @('*') }
    $writeIntent = if (Test-NovaCoreProperty $Mission 'changesExpected') { [bool]$Mission.changesExpected } else { $true }
    $payload = [PSCustomObject][ordered]@{
        schemaVersion='1.0.0'
        missionId=[string]$Mission.missionId
        programId=[string]$Mission.program
        processId=$PID
        host=$hostName
        startedAt=[DateTimeOffset]::UtcNow.ToString('o')
        repository=[IO.Path]::GetFullPath($Repository)
        branch=$Branch
        inputFingerprint=$InputFingerprint
        scopeFingerprint=$ScopeFingerprint
        authorizedScopes=@($authorizedScopes)
        writeIntent=$writeIntent
    }
    foreach ($otherLockPath in @(Get-ChildItem -LiteralPath $LockDirectory -Filter '*.lock.json' -File -ErrorAction SilentlyContinue | Where-Object FullName -ne $path)) {
        try { $other = [IO.File]::ReadAllText($otherLockPath.FullName,$script:Utf8NoBom) | ConvertFrom-Json }
        catch { throw "NOVA_CORE_MISSION_LOCK_INVALID:$($otherLockPath.FullName)" }
        foreach ($name in @('missionId','programId','processId','host','startedAt','repository','branch','inputFingerprint','scopeFingerprint')) {
            if (-not (Test-NovaCoreProperty $other $name)) { throw "NOVA_CORE_MISSION_LOCK_INVALID:$name" }
        }
        $otherActive = [string]$other.host -ne $hostName -or $null -ne (Get-Process -Id ([int]$other.processId) -ErrorAction SilentlyContinue)
        if (-not $otherActive -or [string]$other.repository -ne [string]$payload.repository -or [string]$other.branch -ne $Branch) { continue }
        $otherWriteIntent = if (Test-NovaCoreProperty $other 'writeIntent') { [bool]$other.writeIntent } else { $true }
        if (-not $writeIntent -and -not $otherWriteIntent) { continue }
        $otherScopes = if (Test-NovaCoreProperty $other 'authorizedScopes') { @($other.authorizedScopes) } else { @('*') }
        $scopeConflict = @($authorizedScopes | Where-Object {
            $currentScope=[string]$_
            @($otherScopes | Where-Object {
                (Test-NovaCoreGovernancePathMatch $currentScope ([string]$_)) -or
                (Test-NovaCoreGovernancePathMatch ([string]$_) $currentScope)
            }).Count -gt 0
        }).Count -gt 0
        if ($scopeConflict) { throw "NOVA_CORE_MISSION_LOCK_SCOPE_CONFLICT:$($other.missionId)" }
    }
    for ($attempt = 0; $attempt -lt 2; $attempt++) {
        try {
            $stream = [IO.FileStream]::new($path,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::Read)
            $bytes = $script:Utf8NoBom.GetBytes(($payload | ConvertTo-Json -Depth 20))
            try { $stream.Write($bytes,0,$bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
            return [PSCustomObject]@{ Acquired=$true; Path=$path; Payload=$payload; OrphanRecovery=$false }
        }
        catch {
            if ($attempt -ne 0 -or -not (Test-Path -LiteralPath $path -PathType Leaf)) {
                throw "NOVA_CORE_MISSION_LOCKED:$($Mission.missionId)"
            }
            try { $existing = [IO.File]::ReadAllText($path,$script:Utf8NoBom) | ConvertFrom-Json }
            catch { throw "NOVA_CORE_MISSION_LOCK_INVALID:$path" }
            foreach ($name in @('missionId','programId','processId','host','startedAt','repository','branch','inputFingerprint','scopeFingerprint')) {
                if (-not (Test-NovaCoreProperty $existing $name)) { throw "NOVA_CORE_MISSION_LOCK_INVALID:$name" }
            }
            if ([string]$existing.missionId -ne [string]$Mission.missionId -or [string]$existing.programId -ne [string]$Mission.program) {
                throw 'NOVA_CORE_MISSION_LOCK_OWNER_MISMATCH'
            }
            if ([string]$existing.host -ne $hostName) { throw "NOVA_CORE_MISSION_LOCKED_REMOTE:$($existing.host)" }
            if ($null -ne (Get-Process -Id ([int]$existing.processId) -ErrorAction SilentlyContinue)) {
                throw "NOVA_CORE_MISSION_LOCKED:$($Mission.missionId)"
            }
            if ([string]$existing.inputFingerprint -ne $InputFingerprint -or [string]$existing.scopeFingerprint -ne $ScopeFingerprint) {
                $authorized = $null -ne $RebindAuthorization -and
                    (Test-NovaCoreProperty $RebindAuthorization 'authority') -and
                    (Test-NovaCoreProperty $RebindAuthorization 'reason') -and
                    -not [string]::IsNullOrWhiteSpace([string]$RebindAuthorization.authority) -and
                    -not [string]::IsNullOrWhiteSpace([string]$RebindAuthorization.reason)
                if (-not $authorized) { throw 'NOVA_CORE_MISSION_LOCK_FINGERPRINT_MISMATCH' }
            }
            $archive = "$path.orphaned.$([DateTimeOffset]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')).json"
            Move-Item -LiteralPath $path -Destination $archive
            $payload | Add-Member -NotePropertyName orphanRecovery -NotePropertyValue ([PSCustomObject]@{
                previousLock=$archive
                provedBy='LOCAL_HOST_PROCESS_ABSENT'
                rebindAuthorized=($null -ne $RebindAuthorization)
            })
        }
    }
}

function Exit-NovaCoreMissionLock {
    param([Parameter(Mandatory)]$Lock)
    if ($null -eq $Lock -or -not $Lock.Acquired -or -not (Test-Path -LiteralPath $Lock.Path -PathType Leaf)) { return }
    try { $existing = [IO.File]::ReadAllText($Lock.Path,$script:Utf8NoBom) | ConvertFrom-Json }
    catch { throw "NOVA_CORE_MISSION_LOCK_RELEASE_REFUSED:INVALID_LOCK" }
    if ([string]$existing.missionId -ne [string]$Lock.Payload.missionId -or
        [int]$existing.processId -ne [int]$Lock.Payload.processId -or
        [string]$existing.inputFingerprint -ne [string]$Lock.Payload.inputFingerprint) {
        throw 'NOVA_CORE_MISSION_LOCK_RELEASE_REFUSED:OWNER_MISMATCH'
    }
    Remove-Item -LiteralPath $Lock.Path -Force
}

function New-NovaCoreInputEvidenceRegistry {
    param(
        [Parameter(Mandatory)]$Mission,
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)]$BeforeSnapshot,
        [Parameter(Mandatory)]$Admission,
        [bool]$ContextAssemblyEnabled
    )
    $entries = [Collections.Generic.List[object]]::new()
    if (Test-NovaCoreProperty $Mission 'inputEvidence') {
        foreach ($definition in @($Mission.inputEvidence)) {
            foreach ($name in @('evidenceId','path','kind','sha256')) {
                if (-not (Test-NovaCoreProperty $definition $name)) { throw "NOVA_CORE_INPUT_EVIDENCE_PROPERTY_MISSING:$name" }
            }
            if (-not (Test-NovaCoreGovernanceRelativePath ([string]$definition.path)) -or [string]$definition.sha256 -notmatch '^[A-Fa-f0-9]{64}$') {
                throw "NOVA_CORE_INPUT_EVIDENCE_INVALID:$($definition.evidenceId)"
            }
            $absolute = Join-Path $Repository ([string]$definition.path)
            $observed = Get-NovaCoreGovernanceFileHash $absolute
            $status = if ($null -eq $observed) { 'MISSING' } elseif ($observed -ne ([string]$definition.sha256).ToUpperInvariant()) { 'STALE' } else { 'VALID' }
            if ($status -ne 'VALID') { throw "NOVA_CORE_INPUT_EVIDENCE_INVALID:$($definition.evidenceId):$status" }
            $entries.Add([PSCustomObject][ordered]@{
                evidenceClass='INPUT_EVIDENCE'
                evidenceId=[string]$definition.evidenceId
                kind=[string]$definition.kind
                path=[string]$definition.path
                sha256=$observed
                status=$status
                observedAt=[DateTimeOffset]::UtcNow.ToString('o')
            })
        }
    }
    $entries.Add([PSCustomObject][ordered]@{
        evidenceClass='INPUT_EVIDENCE'; evidenceId='MISSION_MANIFEST'; kind='MANIFEST'
        path=$null; sha256=(Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson $Mission))
        status='VALID'; observedAt=[DateTimeOffset]::UtcNow.ToString('o')
    })
    $entries.Add([PSCustomObject][ordered]@{
        evidenceClass='INPUT_EVIDENCE'; evidenceId='GIT_BASELINE'; kind='GIT_STATE'
        path=$null; sha256=(Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson $BeforeSnapshot))
        status='VALID'; observedAt=[DateTimeOffset]::UtcNow.ToString('o')
    })
    return [PSCustomObject][ordered]@{
        evidenceClass='INPUT_EVIDENCE'
        capturedBeforeExecution=$true
        contextAssemblyRequested=$ContextAssemblyEnabled
        admission=$Admission
        entries=@($entries)
        status='VALID'
        registryFingerprint=(Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson @($entries)))
    }
}

function New-NovaCoreOutputEvidenceRegistry {
    param(
        [Parameter(Mandatory)]$Mission,
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)]$Delta,
        [Parameter(Mandatory)][AllowEmptyCollection()][array]$Validations,
        [Parameter(Mandatory)][string]$TechnicalClassification
    )
    $entries = [Collections.Generic.List[object]]::new()
    foreach ($kind in @('Created','Modified','Deleted')) {
        foreach ($path in @($Delta.$kind)) {
            $absolute = Join-Path $Repository ([string]$path)
            $entries.Add([PSCustomObject][ordered]@{
                evidenceClass='OUTPUT_EVIDENCE'
                evidenceId="$($kind.ToUpperInvariant()):$path"
                kind=$kind.ToUpperInvariant()
                path=[string]$path
                sha256=if ($kind -eq 'Deleted') { $null } else { Get-NovaCoreGovernanceFileHash $absolute }
                status='VALID'
            })
        }
    }
    foreach ($validation in @($Validations)) {
        $entries.Add([PSCustomObject][ordered]@{
            evidenceClass='OUTPUT_EVIDENCE'
            evidenceId="VALIDATION:$($validation.Name)"
            kind='VALIDATION_RESULT'
            path=$null
            sha256=(Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson $validation))
            status=$(if ($validation.Passed) { 'VALID' } else { 'INVALID' })
        })
    }
    $failedRequired = @($Validations | Where-Object { $_.Required -and -not $_.Passed })
    $status = if ($failedRequired.Count -eq 0 -and $TechnicalClassification -in @('SUCCESS','READY_FOR_REVIEW')) { 'VALID' } else { 'INVALID' }
    return [PSCustomObject][ordered]@{
        evidenceClass='OUTPUT_EVIDENCE'
        capturedAfterExecution=$true
        entries=@($entries)
        status=$status
        registryFingerprint=(Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson @($entries)))
    }
}

function Resolve-NovaCoreFinalAuthorityDecision {
    param(
        [Parameter(Mandatory)][string]$TechnicalClassification,
        [Parameter(Mandatory)][AllowEmptyCollection()][array]$ValidationResults,
        [Parameter(Mandatory)][string]$EvidenceStatus,
        [Parameter(Mandatory)][bool]$ReviewRequired,
        $AuthorityReview,
        [string]$ReportFingerprint
    )
    $base = [ordered]@{
        technicalClassification=$TechnicalClassification
        validationResults=@($ValidationResults)
        evidenceStatus=$EvidenceStatus
        reviewRequirement=$(if ($ReviewRequired) { 'HUMAN_REVIEW_REQUIRED' } else { 'AUTOMATED_POLICY_ALLOWED' })
        authorityDecision=$null
        finalMissionState=$null
        decidedBy=$null
        decidedAt=[DateTimeOffset]::UtcNow.ToString('o')
        reasonCode=$null
        transcriptUsed=$false
    }
    if ($TechnicalClassification -eq 'CANCELLED') {
        $base.authorityDecision='NOT_APPLICABLE';$base.finalMissionState='CANCELLED';$base.decidedBy='RUNTIME';$base.reasonCode='EXECUTION_CANCELLED'
        return [PSCustomObject]$base
    }
    if ($TechnicalClassification -eq 'FAILED') {
        $base.authorityDecision='NOT_APPLICABLE';$base.finalMissionState='FAILED';$base.decidedBy='RUNTIME';$base.reasonCode='TECHNICAL_FAILURE'
        return [PSCustomObject]$base
    }
    $failedRequired = @($ValidationResults | Where-Object { $_.Required -and -not $_.Passed })
    if ($failedRequired.Count -gt 0 -or $EvidenceStatus -ne 'VALID' -or $TechnicalClassification -in @('PARTIAL','BLOCKED','NO_CHANGE')) {
        $base.authorityDecision='REJECTED';$base.finalMissionState='REJECTED';$base.decidedBy='RUNTIME_VALIDATION_AUTHORITY';$base.reasonCode='VALIDATION_OR_EVIDENCE_REJECTED'
        return [PSCustomObject]$base
    }
    if ($ReviewRequired) {
        if ($null -eq $AuthorityReview) {
            $base.authorityDecision='PENDING_REVIEW';$base.finalMissionState='READY_FOR_REVIEW';$base.decidedBy='RUNTIME';$base.reasonCode='HUMAN_REVIEW_REQUIRED'
            return [PSCustomObject]$base
        }
        foreach ($name in @('decision','authority','reportFingerprint','decidedAt')) {
            if (-not (Test-NovaCoreProperty $AuthorityReview $name)) { throw "NOVA_CORE_AUTHORITY_REVIEW_INVALID:$name" }
        }
        if ([string]$AuthorityReview.reportFingerprint -ne $ReportFingerprint) { throw 'NOVA_CORE_AUTHORITY_REVIEW_FINGERPRINT_MISMATCH' }
        if ([string]$AuthorityReview.decision -notin @('ACCEPTED','REJECTED')) { throw 'NOVA_CORE_AUTHORITY_REVIEW_DECISION_INVALID' }
        $base.authorityDecision=[string]$AuthorityReview.decision
        $base.finalMissionState=[string]$AuthorityReview.decision
        $base.decidedBy=[string]$AuthorityReview.authority
        $base.decidedAt=[string]$AuthorityReview.decidedAt
        $base.reasonCode='STRUCTURED_HUMAN_AUTHORITY_DECISION'
        return [PSCustomObject]$base
    }
    $base.authorityDecision='ACCEPTED';$base.finalMissionState='ACCEPTED';$base.decidedBy='NOVA_CORE_RUNTIME_POLICY';$base.reasonCode='ALL_REQUIRED_VALIDATIONS_AND_EVIDENCE_VALID'
    return [PSCustomObject]$base
}

function Get-NovaCoreOfficialReportFingerprint {
    param([Parameter(Mandatory)]$Report)
    $copy = $Report | ConvertTo-Json -Depth 100 | ConvertFrom-Json
    if (Test-NovaCoreProperty $copy 'ReportFingerprint') { $copy.ReportFingerprint = $null }
    return Get-NovaCoreGovernanceStringHash (ConvertTo-NovaCoreGovernanceCanonicalJson $copy)
}

Export-ModuleMember -Function `
    ConvertTo-NovaCoreGovernanceCanonicalJson,Get-NovaCoreGovernanceStringHash,Get-NovaCoreGovernanceFileHash,`
    ConvertTo-NovaCorePortableJsonValue,`
    Get-NovaCoreGovernedMissionInputFingerprint,Get-NovaCoreMissionScopeFingerprint,Test-NovaCoreGovernedAdmission,`
    Test-NovaCoreFreezeAdmission,Enter-NovaCoreMissionLock,Exit-NovaCoreMissionLock,`
    New-NovaCoreInputEvidenceRegistry,New-NovaCoreOutputEvidenceRegistry,`
    Resolve-NovaCoreFinalAuthorityDecision,Get-NovaCoreOfficialReportFingerprint

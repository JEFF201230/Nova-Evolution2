Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:ContextSchemaVersion = '1.0.0'
$script:Utf8NoBom = [Text.UTF8Encoding]::new($false)

function Test-NovaCoreContextProperty {
    param($Object, [Parameter(Mandatory)][string]$Name)
    return $null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name
}

function Test-NovaCoreContextPathWithinRoot {
    param([Parameter(Mandatory)][string]$Candidate, [Parameter(Mandatory)][string]$Root)
    $candidatePath = [IO.Path]::GetFullPath($Candidate).TrimEnd('\','/')
    $rootPath = [IO.Path]::GetFullPath($Root).TrimEnd('\','/')
    return $candidatePath.Equals($rootPath, [StringComparison]::OrdinalIgnoreCase) -or
        $candidatePath.StartsWith($rootPath + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)
}

function Resolve-NovaCoreContextSourcePath {
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Role
    )
    if ([string]::IsNullOrWhiteSpace($Path)) { throw "NOVA_CORE_CONTEXT_SOURCE_PATH_INVALID:$Role" }
    $absolutePath = if ([IO.Path]::IsPathRooted($Path)) { [IO.Path]::GetFullPath($Path) } else { [IO.Path]::GetFullPath((Join-Path $Repository $Path)) }
    if (-not (Test-NovaCoreContextPathWithinRoot -Candidate $absolutePath -Root $Repository)) {
        throw "NOVA_CORE_CONTEXT_SOURCE_OUT_OF_SCOPE:$Role`:$Path"
    }
    return $absolutePath
}

function ConvertTo-NovaCoreContextRelativePath {
    param([Parameter(Mandatory)][string]$Repository, [Parameter(Mandatory)][string]$Path)
    $root = [IO.Path]::GetFullPath($Repository).TrimEnd('\','/')
    $absolutePath = [IO.Path]::GetFullPath($Path)
    return $absolutePath.Substring($root.Length).TrimStart('\','/').Replace('\','/')
}

function Assert-NovaCoreContextScopeDeclaration {
    param([string]$Path, [string]$Role)
    if ([string]::IsNullOrWhiteSpace($Path) -or [IO.Path]::IsPathRooted($Path) -or $Path -match '(^|[\\/])\.\.([\\/]|$)') {
        throw "NOVA_CORE_CONTEXT_SOURCE_OUT_OF_SCOPE:$Role`:$Path"
    }
}

function Get-NovaCoreContextFileHash {
    param([Parameter(Mandatory)][string]$Path)
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToUpperInvariant()
}

function Get-NovaCoreContextStringHash {
    param([Parameter(Mandatory)][string]$Value)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($script:Utf8NoBom.GetBytes($Value)))).Replace('-','') }
    finally { $sha.Dispose() }
}

function Write-NovaCoreContextJson {
    param([Parameter(Mandatory)]$Value, [Parameter(Mandatory)][string]$Path)
    $parent = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    [IO.File]::WriteAllText($Path, ($Value | ConvertTo-Json -Depth 50), $script:Utf8NoBom)
}

function New-NovaCoreMissionContextAssembly {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$MissionFile,
        [Parameter(Mandatory)]$ResolvedProfile,
        [Parameter(Mandatory)]$WorkspaceSnapshot,
        [Parameter(Mandatory)][string]$OutputDirectory,
        [string]$CampaignFile,
        [string]$EvidenceIndexPath,
        [switch]$GovernedResume,
        [string]$ResumeReportPath
    )

    $assemblyStopwatch = [Diagnostics.Stopwatch]::StartNew()
    $missionPath = (Resolve-Path -LiteralPath $MissionFile).Path
    $mission = [IO.File]::ReadAllText($missionPath, $script:Utf8NoBom) | ConvertFrom-Json
    $repository = (Resolve-Path -LiteralPath ([string]$mission.repository)).Path
    $missionPath = Resolve-NovaCoreContextSourcePath -Repository $repository -Path $missionPath -Role 'MISSION_ORDER'

    $state = [PSCustomObject]@{ DuplicateCount=0; RejectedCount=0; TotalBytes=[int64]0 }
    $sources = [Collections.Generic.List[object]]::new()
    $diagnostics = [Collections.Generic.List[object]]::new()
    $seen = @{}

    function Add-ContextDiagnostic {
        param([string]$Code, [string]$Role, [string]$Path, [string]$Detail)
        $diagnostics.Add([PSCustomObject][ordered]@{ code=$Code; role=$Role; path=$Path; detail=$Detail })
    }

    function Add-ContextSource {
        param(
            [string]$Path,
            [string]$Role,
            [int]$Priority,
            [string]$Reason,
            [string]$ExpectedHash,
            [string]$EvidenceId
        )
        $absolutePath = Resolve-NovaCoreContextSourcePath -Repository $repository -Path $Path -Role $Role
        $relativePath = ConvertTo-NovaCoreContextRelativePath -Repository $repository -Path $absolutePath
        if (-not (Test-Path -LiteralPath $absolutePath -PathType Leaf)) { throw "NOVA_CORE_CONTEXT_SOURCE_MISSING:$Role`:$relativePath" }
        $hash = Get-NovaCoreContextFileHash -Path $absolutePath
        if (-not [string]::IsNullOrWhiteSpace($ExpectedHash) -and $hash -ne $ExpectedHash.ToUpperInvariant()) {
            throw "NOVA_CORE_CONTEXT_SOURCE_HASH_MISMATCH:$Role`:$relativePath`:$hash"
        }
        $key = $relativePath.ToUpperInvariant() + '|' + $hash
        if ($seen.ContainsKey($key)) {
            $state.DuplicateCount++
            Add-ContextDiagnostic -Code 'DUPLICATE_SOURCE_REMOVED' -Role $Role -Path $relativePath -Detail ("canonicalRole={0}" -f $seen[$key].role)
            return [PSCustomObject][ordered]@{ path=$relativePath; sha256=$hash; role=$Role; priority=$Priority; reason=$Reason; sizeBytes=[int64](Get-Item -LiteralPath $absolutePath).Length; deduplicated=$true; canonicalRole=$seen[$key].role; evidenceId=$EvidenceId }
        }
        $descriptor = [PSCustomObject][ordered]@{
            path=$relativePath
            sha256=$hash
            role=$Role
            priority=$Priority
            reason=$Reason
            sizeBytes=[int64](Get-Item -LiteralPath $absolutePath).Length
        }
        if (-not [string]::IsNullOrWhiteSpace($EvidenceId)) { $descriptor | Add-Member -NotePropertyName evidenceId -NotePropertyValue $EvidenceId }
        $seen[$key] = $descriptor
        $sources.Add($descriptor)
        $state.TotalBytes += [int64]$descriptor.sizeBytes
        return $descriptor
    }

    function Get-ContextArray {
        param($Object, [string]$Name)
        if (Test-NovaCoreContextProperty $Object $Name) { return @($Object.$Name) }
        return @()
    }

    $campaign = $null
    $campaignMission = $null
    $manifestReference = $null
    $authority = $null
    $applicableEvidence = [Collections.Generic.List[object]]::new()
    $externalPrerequisites = [Collections.Generic.List[object]]::new()
    $evidenceIndex = $null
    $evidenceIndexReference = $null

    if (-not [string]::IsNullOrWhiteSpace($EvidenceIndexPath)) {
        $resolvedIndex = Resolve-NovaCoreContextSourcePath -Repository $repository -Path $EvidenceIndexPath -Role 'CAMPAIGN_EVIDENCE_INDEX'
        if (-not (Test-Path -LiteralPath $resolvedIndex -PathType Leaf)) { throw 'NOVA_CORE_CONTEXT_EVIDENCE_INDEX_MISSING' }
        $evidenceIndex = [IO.File]::ReadAllText($resolvedIndex, $script:Utf8NoBom) | ConvertFrom-Json
        $evidenceIndexReference = [PSCustomObject][ordered]@{ path=(ConvertTo-NovaCoreContextRelativePath $repository $resolvedIndex); role='VERIFICATION_ONLY' }
    }

    if (-not [string]::IsNullOrWhiteSpace($CampaignFile)) {
        $campaignPath = Resolve-NovaCoreContextSourcePath -Repository $repository -Path $CampaignFile -Role 'CAMPAIGN_MANIFEST'
        if (-not (Test-Path -LiteralPath $campaignPath -PathType Leaf)) { throw 'NOVA_CORE_CONTEXT_CAMPAIGN_MANIFEST_MISSING' }
        $campaign = [IO.File]::ReadAllText($campaignPath, $script:Utf8NoBom) | ConvertFrom-Json
        $campaignRepository = [IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $campaignPath) ([string]$campaign.repository))).TrimEnd('\','/')
        if ($campaignRepository -ne $repository.TrimEnd('\','/')) { throw 'NOVA_CORE_CONTEXT_CAMPAIGN_REPOSITORY_MISMATCH' }
        if ([string]$campaign.programId -ne [string]$mission.program) { throw 'NOVA_CORE_CONTEXT_CAMPAIGN_PROGRAM_MISMATCH' }
        if ([string]$campaign.expectedBranch -ne [string]$WorkspaceSnapshot.Branch) { throw 'NOVA_CORE_CONTEXT_CAMPAIGN_BRANCH_MISMATCH' }
        $campaignMission = @(Get-ContextArray $campaign 'missions' | Where-Object { [string]$_.missionId -eq [string]$mission.missionId }) | Select-Object -First 1
        if ($null -eq $campaignMission) { throw "NOVA_CORE_CONTEXT_MISSION_NOT_IN_CAMPAIGN:$($mission.missionId)" }
        $campaignMissionPath = Resolve-NovaCoreContextSourcePath -Repository $repository -Path ([string]$campaignMission.missionFile) -Role 'CAMPAIGN_MISSION_ORDER'
        if ($campaignMissionPath -ne $missionPath) { throw "NOVA_CORE_CONTEXT_CAMPAIGN_MISSION_ORDER_MISMATCH:$($mission.missionId)" }
        $manifestReference = Add-ContextSource -Path $campaignPath -Role 'CAMPAIGN_MANIFEST' -Priority 10 -Reason 'Manifest applicable to the executed Mission' -ExpectedHash $null -EvidenceId $null

        $authoritySource = Add-ContextSource -Path ([string]$campaign.authority.sourcePath) -Role 'AUTHORITY_SOURCE' -Priority 20 -Reason 'Campaign authority source' -ExpectedHash ([string]$campaign.authority.sourceSha256) -EvidenceId $null
        $authorityCertification = Add-ContextSource -Path ([string]$campaign.authority.certificationReportPath) -Role 'AUTHORITY_CERTIFICATION_REPORT' -Priority 30 -Reason 'Certification report declared by Campaign authority' -ExpectedHash $null -EvidenceId $null
        $authority = [PSCustomObject][ordered]@{ sourceType=[string]$campaign.authority.sourceType; programDecision=[string]$campaign.authority.programDecision; source=$authoritySource; certificationReport=$authorityCertification }

        $requiredPrerequisites = @(Get-ContextArray $campaignMission 'requiresPrerequisites')
        foreach ($prerequisite in @(Get-ContextArray $campaign 'externalPrerequisites')) {
            if ($requiredPrerequisites -contains [string]$prerequisite.prerequisiteId) {
                $externalPrerequisites.Add([PSCustomObject][ordered]@{ prerequisiteId=[string]$prerequisite.prerequisiteId; status=[string]$prerequisite.status; evidenceId=[string]$prerequisite.evidenceId; assertedBy=[string]$prerequisite.assertedBy; assertedAt=[string]$prerequisite.assertedAt; detail=[string]$prerequisite.detail })
            }
            else {
                $state.RejectedCount++
                Add-ContextDiagnostic -Code 'SOURCE_NOT_APPLICABLE' -Role 'EXTERNAL_PREREQUISITE' -Path ([string]$prerequisite.prerequisiteId) -Detail 'Mission does not require this prerequisite'
            }
        }

        foreach ($evidence in @(Get-ContextArray $campaign 'sharedEvidence')) {
            if (@($evidence.consumers) -notcontains [string]$mission.missionId) {
                $state.RejectedCount++
                Add-ContextDiagnostic -Code 'SOURCE_NOT_APPLICABLE' -Role 'SHARED_EVIDENCE' -Path ([string]$evidence.sourcePath) -Detail 'Mission is not listed in consumers[]'
                continue
            }
            $evidenceDescriptor = Add-ContextSource -Path ([string]$evidence.sourcePath) -Role 'SHARED_EVIDENCE' -Priority 50 -Reason 'Campaign sharedEvidence consumers[] contains Mission' -ExpectedHash ([string]$evidence.sourceSha256) -EvidenceId ([string]$evidence.evidenceId)
            if ($null -ne $evidenceIndex) {
                $indexed = @($evidenceIndex.entries | Where-Object { [string]$_.evidenceId -eq [string]$evidence.evidenceId }) | Select-Object -First 1
                if ($null -eq $indexed -or [string]$indexed.status -ne 'VALID' -or [string]$indexed.sha256 -ne [string]$evidenceDescriptor.sha256) {
                    throw "NOVA_CORE_CONTEXT_EVIDENCE_INDEX_MISMATCH:$($evidence.evidenceId)"
                }
            }
            $applicableEvidence.Add([PSCustomObject][ordered]@{ evidenceId=[string]$evidence.evidenceId; provenance=[string]$evidence.provenance; kind=[string]$evidence.kind; source=$evidenceDescriptor })
        }
    }
    else {
        Add-ContextDiagnostic -Code 'CAMPAIGN_MANIFEST_NOT_PROVIDED' -Role 'CAMPAIGN_MANIFEST' -Path $null -Detail 'Mission is executed directly outside a Campaign'
    }

    $missionReference = Add-ContextSource -Path $missionPath -Role 'MISSION_ORDER' -Priority 60 -Reason 'Executed Mission Order' -ExpectedHash $null -EvidenceId $null
    $profilesPath = Join-Path $PSScriptRoot 'profiles.json'
    $profileReference = Add-ContextSource -Path $profilesPath -Role 'RESOLVED_PROFILE_REGISTRY' -Priority 70 -Reason ("Resolved profile {0}" -f [string]$ResolvedProfile.Name) -ExpectedHash $null -EvidenceId $null
    $resolvedProfileProjection = [PSCustomObject][ordered]@{ name=[string]$ResolvedProfile.Name; model=[string]$ResolvedProfile.Model; reasoningEffort=[string]$ResolvedProfile.ReasoningEffort; sandbox=[string]$ResolvedProfile.Sandbox; approvalPolicy=[string]$ResolvedProfile.ApprovalPolicy; registry=$profileReference }
    $promptReference = Add-ContextSource -Path ([string]$mission.promptFile) -Role 'MISSION_PROMPT' -Priority 80 -Reason 'Unchanged Mission prompt source' -ExpectedHash $null -EvidenceId $null

    $certifiedFactsPath = Join-Path $PSScriptRoot 'certified-facts.json'
    $certifiedFactsReference = $null
    if (Test-Path -LiteralPath $certifiedFactsPath -PathType Leaf) {
        $certifiedFactsReference = Add-ContextSource -Path $certifiedFactsPath -Role 'CERTIFIED_FACTS' -Priority 90 -Reason 'Existing Certified Facts Bootstrap source, unchanged' -ExpectedHash $null -EvidenceId $null
    }

    $baselineEvidence = [Collections.Generic.List[object]]::new()
    foreach ($baseline in @(Get-ContextArray $mission 'baselineEvidence')) {
        $baselinePath = if (Test-NovaCoreContextProperty $baseline 'path') { [string]$baseline.path } else { [string]$baseline.sourcePath }
        $baselineHash = if (Test-NovaCoreContextProperty $baseline 'sha256') { [string]$baseline.sha256 } else { [string]$baseline.sourceSha256 }
        $descriptor = Add-ContextSource -Path $baselinePath -Role 'BASELINE_EVIDENCE' -Priority 100 -Reason 'Mission baselineEvidence in declared order' -ExpectedHash $baselineHash -EvidenceId ([string]$baseline.evidenceId)
        $baselineEvidence.Add([PSCustomObject][ordered]@{ evidenceId=[string]$baseline.evidenceId; source=$descriptor })
    }

    $readOnlySources = [Collections.Generic.List[object]]::new()
    $readOnlyDeclarations = @()
    if ((Test-NovaCoreContextProperty $mission 'scopes') -and (Test-NovaCoreContextProperty $mission.scopes 'readOnly')) { $readOnlyDeclarations = @($mission.scopes.readOnly) }
    foreach ($readOnlyPath in $readOnlyDeclarations) {
        Assert-NovaCoreContextScopeDeclaration -Path ([string]$readOnlyPath) -Role 'READ_ONLY_SOURCE'
        if ([string]$readOnlyPath -match '[*?]') {
            $readOnlySources.Add([PSCustomObject][ordered]@{ path=([string]$readOnlyPath).Replace('\','/'); role='READ_ONLY_SCOPE'; priority=110; reason='Declared read-only scope pattern'; status='DECLARATION_ONLY' })
            continue
        }
        $resolvedReadOnlyPath = Resolve-NovaCoreContextSourcePath -Repository $repository -Path ([string]$readOnlyPath) -Role 'READ_ONLY_SOURCE'
        if (Test-Path -LiteralPath $resolvedReadOnlyPath -PathType Container) {
            $readOnlySources.Add([PSCustomObject][ordered]@{ path=(ConvertTo-NovaCoreContextRelativePath -Repository $repository -Path $resolvedReadOnlyPath); role='READ_ONLY_SCOPE'; priority=110; reason='Declared read-only directory; contents are not expanded'; status='DECLARATION_ONLY' })
            continue
        }
        $readOnlySources.Add((Add-ContextSource -Path ([string]$readOnlyPath) -Role 'READ_ONLY_SOURCE' -Priority 110 -Reason 'Mission scopes.readOnly source' -ExpectedHash $null -EvidenceId $null))
    }

    $missionDependencies = @(Get-ContextArray $mission 'dependsOn')
    $campaignDependencies = if ($null -ne $campaignMission) { @(Get-ContextArray $campaignMission 'dependsOn') } else { @() }
    $dependencies = [PSCustomObject][ordered]@{ mission=@($missionDependencies); campaign=@($campaignDependencies); externalPrerequisites=@($externalPrerequisites) }

    foreach ($declarationName in @('resourceScopes','allowedPaths','forbiddenPaths','expectedFiles','deliverables')) {
        foreach ($declaration in @(Get-ContextArray $mission $declarationName)) { Assert-NovaCoreContextScopeDeclaration -Path ([string]$declaration) -Role $declarationName.ToUpperInvariant() }
    }

    $predecessorReports = [Collections.Generic.List[object]]::new()
    foreach ($predecessor in @(Get-ContextArray $mission 'requiredPredecessorReports')) {
        if ($missionDependencies -notcontains [string]$predecessor.missionId) { throw "NOVA_CORE_CONTEXT_PREDECESSOR_NOT_REQUIRED:$($predecessor.missionId)" }
        $expected = if (Test-NovaCoreContextProperty $predecessor 'sha256') { [string]$predecessor.sha256 } else { $null }
        $predecessorReports.Add((Add-ContextSource -Path ([string]$predecessor.path) -Role 'REQUIRED_PREDECESSOR_REPORT' -Priority 170 -Reason 'Terminal predecessor report explicitly required by Mission Order' -ExpectedHash $expected -EvidenceId $null))
    }

    $resumeReport = $null
    if ($GovernedResume -and -not [string]::IsNullOrWhiteSpace($ResumeReportPath)) {
        $resumeReport = Add-ContextSource -Path $ResumeReportPath -Role 'GOVERNED_RESUME_REPORT' -Priority 180 -Reason 'Prior report selected only for governed Campaign resume' -ExpectedHash $null -EvidenceId $null
    }
    elseif (-not [string]::IsNullOrWhiteSpace($ResumeReportPath)) {
        $state.RejectedCount++
        Add-ContextDiagnostic -Code 'RESUME_REPORT_REJECTED' -Role 'GOVERNED_RESUME_REPORT' -Path $ResumeReportPath -Detail 'GovernedResume was not established by the Campaign Runner'
    }

    $dirtyEntries = @($WorkspaceSnapshot.Porcelain | ForEach-Object { [string]$_ })
    $dirtyState = [PSCustomObject][ordered]@{ status=$(if ($dirtyEntries.Count -gt 0) { 'DIRTY' } else { 'CLEAN' }); entries=$dirtyEntries }
    $sourceHashes = @($sources | ForEach-Object { [PSCustomObject][ordered]@{ path=$_.path; sha256=$_.sha256; role=$_.role; priority=$_.priority } })

    $payload = [ordered]@{
        schemaVersion=$script:ContextSchemaVersion
        programId=[string]$mission.program
        campaignId=$(if ($null -ne $campaign) { [string]$campaign.campaignId } else { $null })
        missionId=[string]$mission.missionId
        branch=[string]$WorkspaceSnapshot.Branch
        head=[string]$WorkspaceSnapshot.Head
        dirtyState=$dirtyState
        campaignManifest=$manifestReference
        authority=$authority
        dependencies=$dependencies
        applicableEvidence=@($applicableEvidence)
        missionOrder=$missionReference
        resolvedProfile=$resolvedProfileProjection
        missionPrompt=$promptReference
        baselineEvidence=@($baselineEvidence)
        readOnlySources=@($readOnlySources)
        resourceScopes=@(Get-ContextArray $mission 'resourceScopes')
        allowedPaths=@(Get-ContextArray $mission 'allowedPaths')
        forbiddenPaths=@(Get-ContextArray $mission 'forbiddenPaths')
        expectedFiles=@(Get-ContextArray $mission 'expectedFiles')
        deliverables=@(Get-ContextArray $mission 'deliverables')
        predecessorReports=@($predecessorReports)
        governedResumeReport=$resumeReport
        certifiedFactsReference=$certifiedFactsReference
        evidenceIndexReference=$evidenceIndexReference
        sourceHashes=$sourceHashes
        selectionDiagnostics=@($diagnostics)
    }
    $payloadJson = $payload | ConvertTo-Json -Depth 50 -Compress
    $payloadHash = Get-NovaCoreContextStringHash -Value $payloadJson
    $payloadBytes = $script:Utf8NoBom.GetByteCount($payloadJson)
    $assemblyStopwatch.Stop()

    $metrics = [PSCustomObject][ordered]@{
        ContextAssemblyEnabled=$true
        ContextAssemblyDurationMs=$assemblyStopwatch.ElapsedMilliseconds
        ContextSourceCount=$sources.Count
        ContextSourceBytes=$state.TotalBytes
        ContextPayloadBytes=$payloadBytes
        ContextSourcePaths=@($sources.path)
        ContextSourceHashes=@($sources.sha256)
        ContextDuplicateCount=$state.DuplicateCount
        ContextRejectedSourceCount=$state.RejectedCount
        ContextSelectionDiagnostics=@($diagnostics)
        CodexDurationMs='UNAVAILABLE'
        TotalDurationMs='UNAVAILABLE'
        TokensInput='UNAVAILABLE'
        TokensOutput='UNAVAILABLE'
        TokensTotal='UNAVAILABLE'
        Verdict='UNAVAILABLE'
        Deliverables='UNAVAILABLE'
        Diagnostics='UNAVAILABLE'
        GitDelta='UNAVAILABLE'
        RegressionsDetected='UNAVAILABLE'
    }
    $artifact = [ordered]@{ schemaVersion=$payload.schemaVersion; generatedAt=[DateTimeOffset]::UtcNow.ToString('o') }
    foreach ($key in $payload.Keys) { if ($key -ne 'schemaVersion') { $artifact[$key] = $payload[$key] } }
    $artifact['functionalPayloadSha256'] = $payloadHash
    $artifact['metrics'] = $metrics
    $artifactPath = Join-Path $OutputDirectory 'mission-context-assembly.json'
    Write-NovaCoreContextJson -Value $artifact -Path $artifactPath

    return [PSCustomObject]@{
        ArtifactPath=$artifactPath
        FunctionalPayload=$payload
        FunctionalPayloadJson=$payloadJson
        FunctionalPayloadSha256=$payloadHash
        Metrics=$metrics
        SourceCount=$sources.Count
    }
}

function Complete-NovaCoreMissionContextMetrics {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]$Assembly,
        [Parameter(Mandatory)][string]$OutputDirectory,
        [Parameter(Mandatory)]$CodexDurationMs,
        [Parameter(Mandatory)][long]$TotalDurationMs,
        [Parameter(Mandatory)][string]$Verdict,
        [object[]]$Deliverables=@(),
        [object[]]$Diagnostics=@(),
        $GitDelta,
        [object[]]$Validations=@()
    )
    $regressions = [Collections.Generic.List[string]]::new()
    foreach ($validation in @($Validations | Where-Object { $_.Required -and -not $_.Passed })) { $regressions.Add("VALIDATION_FAILED:$($validation.Name)") }
    if ($null -ne $GitDelta -and $GitDelta.BranchChanged) { $regressions.Add('BRANCH_CHANGED_DURING_MISSION') }
    if ($null -ne $GitDelta -and $GitDelta.HeadChanged) { $regressions.Add('HEAD_CHANGED_DURING_MISSION') }
    $metrics = [PSCustomObject][ordered]@{
        ContextAssemblyEnabled=$true
        ContextAssemblyDurationMs=$Assembly.Metrics.ContextAssemblyDurationMs
        ContextSourceCount=$Assembly.Metrics.ContextSourceCount
        ContextSourceBytes=$Assembly.Metrics.ContextSourceBytes
        ContextPayloadBytes=$Assembly.Metrics.ContextPayloadBytes
        ContextSourcePaths=@($Assembly.Metrics.ContextSourcePaths)
        ContextSourceHashes=@($Assembly.Metrics.ContextSourceHashes)
        ContextDuplicateCount=$Assembly.Metrics.ContextDuplicateCount
        ContextRejectedSourceCount=$Assembly.Metrics.ContextRejectedSourceCount
        ContextSelectionDiagnostics=@($Assembly.Metrics.ContextSelectionDiagnostics)
        CodexDurationMs=$CodexDurationMs
        TotalDurationMs=$TotalDurationMs
        TokensInput='UNAVAILABLE'
        TokensOutput='UNAVAILABLE'
        TokensTotal='UNAVAILABLE'
        Verdict=$Verdict
        Deliverables=@($Deliverables)
        Diagnostics=@($Diagnostics)
        GitDelta=$GitDelta
        RegressionsDetected=@($regressions)
    }
    $metricsPath = Join-Path $OutputDirectory 'context-assembly-metrics.json'
    Write-NovaCoreContextJson -Value $metrics -Path $metricsPath
    return [PSCustomObject]@{ Path=$metricsPath; Metrics=$metrics }
}

Export-ModuleMember -Function New-NovaCoreMissionContextAssembly,Complete-NovaCoreMissionContextMetrics

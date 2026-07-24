Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$modulePath = Join-Path $PSScriptRoot 'NovaCore.ContextAssembly.psm1'
$profileResolver = Join-Path $PSScriptRoot 'Resolve-NovaCoreProfile.ps1'
$repository = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$fixtureRelative = 'tools/nova-core-runtime/tests/.context-assembly-' + [guid]::NewGuid().ToString('N')
$fixtureRoot = Join-Path $repository $fixtureRelative
$outputOne = Join-Path ([IO.Path]::GetTempPath()) ('nova-core-context-one-' + [guid]::NewGuid().ToString('N'))
$outputTwo = Join-Path ([IO.Path]::GetTempPath()) ('nova-core-context-two-' + [guid]::NewGuid().ToString('N'))
$results = [Collections.Generic.List[object]]::new()
$utf8 = [Text.UTF8Encoding]::new($false)

function Add-Result([string]$Name,[bool]$Passed,[string]$Detail='') { $results.Add([PSCustomObject]@{Name=$Name;Passed=$Passed;Detail=$Detail}) }
function Write-TestFile([string]$Relative,[string]$Content) {
    $path=Join-Path $repository $Relative;$parent=Split-Path -Parent $path
    if(-not(Test-Path -LiteralPath $parent)){New-Item -ItemType Directory -Path $parent -Force|Out-Null}
    [IO.File]::WriteAllText($path,$Content,$utf8);return $path
}
function Get-TestHash([string]$Relative) { return (Get-FileHash -LiteralPath (Join-Path $repository $Relative) -Algorithm SHA256).Hash }
function Write-TestJson([string]$Relative,$Value) { return Write-TestFile $Relative ($Value|ConvertTo-Json -Depth 40) }
function Assert-Error([string]$Name,[string]$Code,[scriptblock]$Action) {
    try { & $Action|Out-Null;Add-Result $Name $false 'No error' } catch { Add-Result $Name ($_.Exception.Message -like "$Code*") $_.Exception.Message }
}

try {
    New-Item -ItemType Directory -Path $fixtureRoot -Force|Out-Null
    $authority="$fixtureRelative/authority.md";$certification="$fixtureRelative/certification.md";$applicable="$fixtureRelative/applicable.txt";$other="$fixtureRelative/other.txt"
    $baseline="$fixtureRelative/baseline.txt";$readOnly="$fixtureRelative/read-only.md";$readOnlyDirectory="$fixtureRelative/read-only-dir";$prompt="$fixtureRelative/mission.prompt.md";$resume="$fixtureRelative/resume-report.json"
    Write-TestFile $authority '# authority'|Out-Null;Write-TestFile $certification '# certification'|Out-Null;Write-TestFile $applicable 'applicable'|Out-Null
    Write-TestFile $other 'other mission'|Out-Null;Write-TestFile $baseline 'baseline'|Out-Null;Write-TestFile $readOnly '# read only'|Out-Null
    Write-TestFile "$readOnlyDirectory/not-selected.txt" 'must not be expanded'|Out-Null
    Write-TestFile $prompt 'Do the bounded test mission.'|Out-Null;Write-TestFile $resume '{"Status":"FAILED"}'|Out-Null

    $missionRelative="$fixtureRelative/mission.json"
    $mission=[ordered]@{
        schemaVersion='1.0.0';missionId='CTX-M1';program='PROGRAM-TEST';lot='LOT-001';title='Context test';profile='FAST';repository=$repository;expectedBranch='test';promptFile=(Join-Path $repository $prompt);workingDirectory=$repository;enabled=$true
        dependsOn=@('CTX-P0');scopes=[ordered]@{readOnly=@($certification,$baseline,$readOnly,$readOnlyDirectory)};resourceScopes=@('Docs/output/**');allowedPaths=@('Docs/output/**');forbiddenPaths=@('.git/**');expectedFiles=@('Docs/output/result.md');deliverables=@('Docs/output/result.md')
        baselineEvidence=@([ordered]@{evidenceId='BASE-APP';path=$applicable;sha256=(Get-TestHash $applicable)},[ordered]@{evidenceId='BASE-ONE';path=$baseline;sha256=(Get-TestHash $baseline)})
    }
    Write-TestJson $missionRelative $mission|Out-Null
    $campaignRelative="$fixtureRelative/campaign.json"
    $campaign=[ordered]@{
        schemaVersion='1.0.0';campaignId='CAMPAIGN-CONTEXT-TEST';programId='PROGRAM-TEST';repository='../../../..';expectedBranch='test'
        authority=[ordered]@{sourceType='EXPLICIT_PLAN';sourcePath=$authority;sourceSha256=(Get-TestHash $authority);certificationReportPath=$certification;programDecision='NO_GO'}
        externalPrerequisites=@([ordered]@{prerequisiteId='PRE-YES';status='SATISFIED';evidenceId='EV-APP';assertedBy='test';assertedAt='2026-01-01T00:00:00Z';detail='yes'},[ordered]@{prerequisiteId='PRE-NO';status='SATISFIED';evidenceId='EV-OTHER';assertedBy='test';assertedAt='2026-01-01T00:00:00Z';detail='no'})
        sharedEvidence=@([ordered]@{evidenceId='EV-APP';sourcePath=$applicable;sourceSha256=(Get-TestHash $applicable);provenance='test';kind='DOCUMENT';consumers=@('CTX-M1')},[ordered]@{evidenceId='EV-OTHER';sourcePath=$other;sourceSha256=(Get-TestHash $other);provenance='test';kind='DOCUMENT';consumers=@('CTX-M2')})
        missions=@([ordered]@{missionId='CTX-M1';missionFile=$missionRelative;dependsOn=@('CTX-P0');requiresPrerequisites=@('PRE-YES');requiresEvidence=@('EV-APP');resourceScopes=@('Docs/output/**')})
    }
    Write-TestJson $campaignRelative $campaign|Out-Null
    $indexRelative="$fixtureRelative/evidence-index.json"
    $index=[ordered]@{entries=@([ordered]@{evidenceId='EV-APP';sha256=(Get-TestHash $applicable);status='VALID'})}
    Write-TestJson $indexRelative $index|Out-Null

    Import-Module $modulePath -Force
    $profile=& $profileResolver -ProfileName FAST
    $snapshot=[PSCustomObject]@{Branch='test';Head=('A'*40);Porcelain=@(' M tracked.txt')}
    $assemblyOne=New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory $outputOne -CampaignFile (Join-Path $repository $campaignRelative) -EvidenceIndexPath (Join-Path $repository $indexRelative)
    $assemblyTwo=New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory $outputTwo -CampaignFile (Join-Path $repository $campaignRelative) -EvidenceIndexPath (Join-Path $repository $indexRelative)
    $artifact=Get-Content $assemblyOne.ArtifactPath -Raw|ConvertFrom-Json

    Add-Result 'artifact-created' (Test-Path -LiteralPath $assemblyOne.ArtifactPath -PathType Leaf)
    Add-Result 'functional-payload-deterministic' ($assemblyOne.FunctionalPayloadSha256 -eq $assemblyTwo.FunctionalPayloadSha256)
    Add-Result 'functional-json-deterministic' ($assemblyOne.FunctionalPayloadJson -ceq $assemblyTwo.FunctionalPayloadJson)
    Add-Result 'dirty-worktree-recorded' ($artifact.dirtyState.status -eq 'DIRTY' -and @($artifact.dirtyState.entries).Count -eq 1)
    Add-Result 'other-mission-evidence-excluded' (@($artifact.sourceHashes.path) -notcontains $other)
    Add-Result 'applicable-evidence-selected' (@($artifact.applicableEvidence.evidenceId) -contains 'EV-APP')
    Add-Result 'applicable-prerequisite-only' (@($artifact.dependencies.externalPrerequisites.prerequisiteId) -join ',' -eq 'PRE-YES')
    $payloadPropertyOrder=@($artifact.PSObject.Properties.Name)
    Add-Result 'prerequisites-precede-shared-evidence' ([array]::IndexOf($payloadPropertyOrder,'dependencies') -lt [array]::IndexOf($payloadPropertyOrder,'applicableEvidence'))
    $expectedRoleOrder=@('CAMPAIGN_MANIFEST','AUTHORITY_SOURCE','AUTHORITY_CERTIFICATION_REPORT','SHARED_EVIDENCE','MISSION_ORDER','RESOLVED_PROFILE_REGISTRY','MISSION_PROMPT','CERTIFIED_FACTS','BASELINE_EVIDENCE','READ_ONLY_SOURCE')
    Add-Result 'sources-in-canonical-order' ((@($artifact.sourceHashes.role) -join '|') -ceq ($expectedRoleOrder -join '|')) ((@($artifact.sourceHashes.role) -join ','))
    Add-Result 'duplicates-removed' ($artifact.metrics.ContextDuplicateCount -ge 3 -and @($artifact.sourceHashes.path|Group-Object|Where-Object Count -gt 1).Count -eq 0)
    Add-Result 'readonly-directory-not-expanded' (@($artifact.readOnlySources|Where-Object{$_.path -eq $readOnlyDirectory -and $_.status -eq 'DECLARATION_ONLY'}).Count -eq 1 -and @($artifact.sourceHashes.path) -notcontains "$readOnlyDirectory/not-selected.txt")
    Add-Result 'rejections-instrumented' ($artifact.metrics.ContextRejectedSourceCount -eq 2)
    Add-Result 'tokens-unavailable-not-invented' ($artifact.metrics.TokensInput -eq 'UNAVAILABLE' -and $artifact.metrics.TokensOutput -eq 'UNAVAILABLE' -and $artifact.metrics.TokensTotal -eq 'UNAVAILABLE')
    Add-Result 'required-fields-present' (@('schemaVersion','generatedAt','programId','campaignId','missionId','branch','head','dirtyState','authority','applicableEvidence','dependencies','baselineEvidence','readOnlySources','allowedPaths','forbiddenPaths','expectedFiles','deliverables','certifiedFactsReference','sourceHashes','selectionDiagnostics','metrics'|Where-Object{$artifact.PSObject.Properties.Name -notcontains $_}).Count -eq 0)
    Add-Result 'bounded-source-set' ($artifact.metrics.ContextSourceCount -lt 20)

    $directOutput=Join-Path $outputOne 'direct'
    $direct=New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory $directOutput
    Add-Result 'manifest-absent-direct-mission-supported' ($null -eq $direct.FunctionalPayload.campaignId -and @($direct.FunctionalPayload.selectionDiagnostics.code) -contains 'CAMPAIGN_MANIFEST_NOT_PROVIDED')

    $resumeOutput=Join-Path $outputOne 'resume'
    $resumed=New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory $resumeOutput -CampaignFile (Join-Path $repository $campaignRelative) -GovernedResume -ResumeReportPath (Join-Path $repository $resume)
    Add-Result 'governed-resume-report-selected' ($resumed.FunctionalPayload.governedResumeReport.role -eq 'GOVERNED_RESUME_REPORT')
    $rejectedResume=New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory (Join-Path $outputOne 'resume-rejected') -ResumeReportPath (Join-Path $repository $resume)
    Add-Result 'ungoverned-resume-report-rejected' ($null -eq $rejectedResume.FunctionalPayload.governedResumeReport -and @($rejectedResume.FunctionalPayload.selectionDiagnostics.code) -contains 'RESUME_REPORT_REJECTED')

    $badHash=($campaign|ConvertTo-Json -Depth 40|ConvertFrom-Json);$badHash.authority.sourceSha256='0'*64
    $badHashPath="$fixtureRelative/bad-hash-campaign.json";Write-TestJson $badHashPath $badHash|Out-Null
    Assert-Error 'invalid-hash-rejected' 'NOVA_CORE_CONTEXT_SOURCE_HASH_MISMATCH' {New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory (Join-Path $outputOne 'bad-hash') -CampaignFile (Join-Path $repository $badHashPath)}

    $missing=($mission|ConvertTo-Json -Depth 40|ConvertFrom-Json);$missing.baselineEvidence[0].path="$fixtureRelative/missing.txt"
    $missingPath="$fixtureRelative/missing-mission.json";Write-TestJson $missingPath $missing|Out-Null
    Assert-Error 'missing-file-rejected' 'NOVA_CORE_CONTEXT_SOURCE_MISSING' {New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missingPath) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory (Join-Path $outputOne 'missing')}

    $outside=($mission|ConvertTo-Json -Depth 40|ConvertFrom-Json);$outside.baselineEvidence[0].path=Join-Path ([IO.Path]::GetTempPath()) 'outside-context.txt'
    $outsidePath="$fixtureRelative/outside-mission.json";Write-TestJson $outsidePath $outside|Out-Null
    Assert-Error 'outside-scope-rejected' 'NOVA_CORE_CONTEXT_SOURCE_OUT_OF_SCOPE' {New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $outsidePath) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory (Join-Path $outputOne 'outside')}

    $indexBad=[ordered]@{entries=@([ordered]@{evidenceId='EV-APP';sha256=('F'*64);status='VALID'})};$badIndex="$fixtureRelative/bad-index.json";Write-TestJson $badIndex $indexBad|Out-Null
    Assert-Error 'evidence-index-mismatch-rejected' 'NOVA_CORE_CONTEXT_EVIDENCE_INDEX_MISMATCH' {New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory (Join-Path $outputOne 'bad-index') -CampaignFile (Join-Path $repository $campaignRelative) -EvidenceIndexPath (Join-Path $repository $badIndex)}

    $wrongProgram=($campaign|ConvertTo-Json -Depth 40|ConvertFrom-Json);$wrongProgram.programId='PROGRAM-OTHER'
    $wrongProgramPath="$fixtureRelative/wrong-program-campaign.json";Write-TestJson $wrongProgramPath $wrongProgram|Out-Null
    Assert-Error 'non-applicable-campaign-rejected' 'NOVA_CORE_CONTEXT_CAMPAIGN_PROGRAM_MISMATCH' {New-NovaCoreMissionContextAssembly -MissionFile (Join-Path $repository $missionRelative) -ResolvedProfile $profile -WorkspaceSnapshot $snapshot -OutputDirectory (Join-Path $outputOne 'wrong-program') -CampaignFile (Join-Path $repository $wrongProgramPath)}
}
catch { Add-Result 'suite-unhandled' $false $_.Exception.ToString() }
finally {
    Remove-Item -LiteralPath $fixtureRoot -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $outputOne -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $outputTwo -Recurse -Force -ErrorAction SilentlyContinue
}

$failed=@($results|Where-Object{-not $_.Passed})
$failed|ForEach-Object{Write-Host("FAILED:{0}:{1}" -f $_.Name,$_.Detail)}
$summary=[PSCustomObject]@{Status=$(if($failed.Count){'FAILURE'}else{'SUCCESS'});Total=$results.Count;Passed=$results.Count-$failed.Count;Failed=$failed.Count;Results=$results}
$summary
if($failed.Count){exit 1}else{exit 0}

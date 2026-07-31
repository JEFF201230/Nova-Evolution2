param(
    [string]$MissionFile = "$PSScriptRoot\mission.json",
    [switch]$ContextAssemblyEnabled,
    [string]$CampaignFile,
    [string]$CampaignEvidenceIndexPath,
    [switch]$GovernedCampaignResume,
    [string]$ResumeReportPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$env:GIT_OPTIONAL_LOCKS = "0"

$missionValidator = Join-Path $PSScriptRoot "Test-NovaCoreMission.ps1"
$profileResolver = Join-Path $PSScriptRoot "Resolve-NovaCoreProfile.ps1"
$reportingModule = Join-Path $PSScriptRoot "NovaCore.Reporting.psm1"
$governanceModule = Join-Path $PSScriptRoot "NovaCore.Governance.psm1"
$contextAssemblyModule = Join-Path $PSScriptRoot "NovaCore.ContextAssembly.psm1"
$contextTotalStopwatch = if ($ContextAssemblyEnabled) { [System.Diagnostics.Stopwatch]::StartNew() } else { $null }
$contextAssembly = $null
$contextExecutionMetrics = $null
$contextAssemblyFailure = $null
$governedAdmission = $null
$missionLock = $null
$inputEvidenceRegistry = $null
$outputEvidenceRegistry = $null
$finalAuthority = $null

$script:NovaCoreMissionContext = [PSCustomObject]@{
    MissionId = $null
    Program = $null
    Lot = $null
    Repository = $null
    WorkingDirectory = (Get-Location).Path
}
$runId = 'bootstrap-{0}' -f ([DateTimeOffset]::Now.ToString('yyyyMMddTHHmmssfff'))
$missionBootstrap = $null
try {
    $missionBootstrap = Get-Content $MissionFile -Raw | ConvertFrom-Json
}
catch {
}
$reportsRoot = if ($missionBootstrap -and $missionBootstrap.PSObject.Properties.Name -contains 'reportDirectory') {
    [string]$missionBootstrap.reportDirectory
} else {
    Join-Path $PSScriptRoot 'reports'
}
$runDirectory = if ((Split-Path -Leaf $reportsRoot) -eq $runId) { $reportsRoot } else { Join-Path $reportsRoot $runId }
$beforeBackupDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("nova-core-before-$runId")
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null
$journalPath = Join-Path $runDirectory 'execution-journal.jsonl'
$transcriptPath = Join-Path $runDirectory 'codex-transcript.txt'
$reportJsonPath = Join-Path $runDirectory 'official-report.json'
$reportMarkdownPath = Join-Path $runDirectory 'official-report.md'

function Write-ExecutionJournalEntry {
    param([string]$Step, [string]$Status, [string]$ErrorMessage = $null)
    $missionContext = $script:NovaCoreMissionContext
    $entry = [PSCustomObject]@{
        timestamp = [DateTimeOffset]::Now
        missionId = $missionContext.MissionId
        program = $missionContext.Program
        lot = $missionContext.Lot
        step = $Step
        status = $Status
        error = $ErrorMessage
    }
    Write-NovaCoreJournalLine -Line (($entry | ConvertTo-Json -Compress) + [Environment]::NewLine)
}

function Write-NovaCoreJournalLine {
    param([Parameter(Mandatory)][string]$Line)

    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($Line)
    $stream = [System.IO.FileStream]::new(
        $journalPath,
        [System.IO.FileMode]::OpenOrCreate,
        [System.IO.FileAccess]::Write,
        [System.IO.FileShare]::Read,
        4096,
        [System.IO.FileOptions]::WriteThrough
    )
    try {
        [void]$stream.Seek(0, [System.IO.SeekOrigin]::End)
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush($true)
    }
    finally {
        $stream.Dispose()
    }
}

function Write-NovaCoreExceptionJournalEntry {
    param(
        [Parameter(Mandatory)][string]$Step,
        [Parameter(Mandatory)][System.Management.Automation.ErrorRecord]$ErrorRecord,
        [string]$Repository = $null
    )
    $exception = $ErrorRecord.Exception
    $missionContext = $script:NovaCoreMissionContext
    $entry = [PSCustomObject]@{
        Timestamp = [DateTimeOffset]::Now
        MissionId = $missionContext.MissionId
        Program = $missionContext.Program
        Lot = $missionContext.Lot
        Step = $Step
        Status = 'FAILURE'
        ExceptionType = $exception.GetType().FullName
        Message = $exception.Message
        StackTrace = if ($exception.StackTrace) { $exception.StackTrace } elseif ($ErrorRecord.ScriptStackTrace) { $ErrorRecord.ScriptStackTrace } else { $null }
        WorkingDirectory = $missionContext.WorkingDirectory
        Repository = $Repository
    }
    $line = ($entry | ConvertTo-Json -Compress -Depth 10) + [Environment]::NewLine
    Write-NovaCoreJournalLine -Line $line
    try {
        $exception.Data['NovaCore.ExceptionJournaled'] = $true
    }
    catch {
        # The durable journal entry already exists; a read-only exception Data bag must not mask the original failure.
    }
}

function Test-NovaCoreExceptionJournaled {
    param([Parameter(Mandatory)][System.Management.Automation.ErrorRecord]$ErrorRecord)

    return $ErrorRecord.Exception.Data.Contains('NovaCore.ExceptionJournaled')
}

function Invoke-NovaCoreInstrumentedStage {
    param(
        [Parameter(Mandatory)][string]$StageName,
        [Parameter(Mandatory)][scriptblock]$Action,
        [string]$Repository = $null
    )

    try {
        Write-ExecutionJournalEntry -Step ($StageName + '_STARTED') -Status 'STARTED'
        $result = & $Action
        Write-ExecutionJournalEntry -Step ($StageName + '_FINISHED') -Status 'SUCCESS'
        return $result
    }
    catch {
        $stageError = $_
        if (-not (Test-NovaCoreExceptionJournaled -ErrorRecord $stageError)) {
            Write-NovaCoreExceptionJournalEntry -Step $StageName -ErrorRecord $stageError -Repository $Repository
        }
        throw $stageError
    }
}

$validatedMission = $null
try {
    Invoke-NovaCoreInstrumentedStage -StageName 'BACKUP_DIRECTORY_CREATED' -Action {
        New-Item -ItemType Directory -Path $beforeBackupDirectory -Force | Out-Null
    }

    Invoke-NovaCoreInstrumentedStage -StageName 'REPORTING_MODULE_IMPORTED' -Action {
        Import-Module $reportingModule -Force
    }

    Invoke-NovaCoreInstrumentedStage -StageName 'GOVERNANCE_MODULE_IMPORTED' -Action {
        Import-Module $governanceModule -Force
    }

    $governedAdmission = Invoke-NovaCoreInstrumentedStage -StageName 'GOVERNED_ADMISSION' -Action {
        if ($null -eq $missionBootstrap) { throw 'NOVA_CORE_MISSION_BOOTSTRAP_INVALID' }
        foreach ($property in @('repository','missionId','program')) {
            if ($missionBootstrap.PSObject.Properties.Name -notcontains $property) { throw "NOVA_CORE_MISSION_PROPERTY_MISSING:$property" }
        }
        $bootstrapRepository = [IO.Path]::GetFullPath([string]$missionBootstrap.repository)
        if (-not (Test-Path -LiteralPath $bootstrapRepository -PathType Container)) { throw 'NOVA_CORE_REPOSITORY_NOT_FOUND' }
        $bootstrapBranch = (& git -C $bootstrapRepository branch --show-current).Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($bootstrapBranch)) { throw 'NOVA_CORE_GIT_BRANCH_UNRESOLVED' }
        Test-NovaCoreGovernedAdmission -Mission $missionBootstrap -Repository $bootstrapRepository -Branch $bootstrapBranch
    }

    $validatedMission = Invoke-NovaCoreInstrumentedStage -StageName 'MISSION_VALIDATED' -Action {
        $validation = & $missionValidator -MissionFile $MissionFile
        if ($validation.Status -ne "VALID") {
            throw "NOVA_CORE_MISSION_NOT_VALID"
        }
        return $validation
    }

    $mission = Invoke-NovaCoreInstrumentedStage -StageName 'MISSION_READ' -Action {
        Get-Content $MissionFile -Raw | ConvertFrom-Json
    } -Repository $validatedMission.Repository
    $script:NovaCoreMissionContext.MissionId = $mission.missionId
    $script:NovaCoreMissionContext.Program = $mission.program
    $script:NovaCoreMissionContext.Lot = $mission.lot
    $script:NovaCoreMissionContext.Repository = $validatedMission.Repository
    $script:NovaCoreMissionContext.WorkingDirectory = (Get-Location).Path

    $missionInputFingerprint = $governedAdmission.inputFingerprint
    $missionScopeFingerprint = Get-NovaCoreMissionScopeFingerprint -Mission $mission -Admission $governedAdmission
    $lockDirectory = Join-Path $reportsRoot '_locks'
    $rebindAuthorization = if ($mission.PSObject.Properties.Name -contains 'lockRebindAuthorization') { $mission.lockRebindAuthorization } else { $null }
    $missionLock = Invoke-NovaCoreInstrumentedStage -StageName 'MISSION_LOCK_ACQUIRED' -Action {
        Enter-NovaCoreMissionLock `
            -Mission $mission `
            -Repository $validatedMission.Repository `
            -Branch $validatedMission.Branch `
            -InputFingerprint $missionInputFingerprint `
            -ScopeFingerprint $missionScopeFingerprint `
            -LockDirectory $lockDirectory `
            -RebindAuthorization $rebindAuthorization
    } -Repository $validatedMission.Repository

    $profile = Invoke-NovaCoreInstrumentedStage -StageName 'PROFILE_RESOLVED' -Action {
        & $profileResolver -ProfileName $mission.profile
    } -Repository $validatedMission.Repository

    $prompt = Invoke-NovaCoreInstrumentedStage -StageName 'PROMPT_READ' -Action {
        [System.IO.File]::ReadAllText(
            $mission.promptFile,
            [System.Text.UTF8Encoding]::new($false)
        )
    } -Repository $validatedMission.Repository

    $certifiedFactsPath = Join-Path $PSScriptRoot 'certified-facts.json'
    if (Test-Path -LiteralPath $certifiedFactsPath -PathType Leaf) {
        $certifiedFacts = [System.IO.File]::ReadAllText(
            $certifiedFactsPath,
            [System.Text.UTF8Encoding]::new($false)
        )
        $prompt = "<CERTIFIED_FACTS>`n$certifiedFacts`n</CERTIFIED_FACTS>`n`n$prompt"
    }

    $codexCommand = Invoke-NovaCoreInstrumentedStage -StageName 'CODEX_COMMAND_RESOLVED' -Action {
        $command = Get-Command "codex.cmd" -ErrorAction SilentlyContinue
        if ($null -eq $command) {
            $command = Get-Command "codex" -ErrorAction SilentlyContinue
        }
        if ($null -eq $command) {
            throw "NOVA_CORE_CODEX_NOT_FOUND"
        }
        return $command
    } -Repository $validatedMission.Repository

    $minimumCodexVersion = [System.Version]"0.144.1"

    $codexVersion = Invoke-NovaCoreInstrumentedStage -StageName 'CODEX_VERSION_CHECKED' -Action {
        $versionOutput = & $codexCommand.Source --version
        $versionMatch = [System.Text.RegularExpressions.Regex]::Match(
            [string]$versionOutput,
            '(?<!\d)(\d+\.\d+\.\d+)(?!\d)'
        )
        if (-not $versionMatch.Success) {
            throw "NOVA_CORE_CODEX_VERSION_NOT_SUPPORTED"
        }
        try {
            $parsedVersion = [System.Version]$versionMatch.Groups[1].Value
        }
        catch {
            throw "NOVA_CORE_CODEX_VERSION_NOT_SUPPORTED"
        }
        if ($parsedVersion -lt $minimumCodexVersion) {
            throw "NOVA_CORE_CODEX_VERSION_NOT_SUPPORTED"
        }
        return $parsedVersion.ToString()
    } -Repository $validatedMission.Repository
    $codexPath = [System.IO.Path]::GetFullPath([string]$codexCommand.Source)
    $codexBinaryHash = (Get-FileHash -LiteralPath $codexPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($mission.PSObject.Properties.Name -notcontains 'binding') {
        throw 'NOVA_CORE_CODEX_BINDING_MISSING'
    }
    if (
        [string]$mission.binding.codexVersion -ne $codexVersion -or
        -not $codexPath.Equals([System.IO.Path]::GetFullPath([string]$mission.binding.codexPath), [System.StringComparison]::OrdinalIgnoreCase) -or
        [string]$mission.binding.codexBinaryHash -ne $codexBinaryHash -or
        [string]$mission.binding.codexConfigPolicy -ne 'EXPLICIT_RUNTIME_PROFILE'
    ) {
        throw 'NOVA_CORE_CODEX_BINDING_MISMATCH'
    }

    $startedAt = [DateTimeOffset]::Now
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $outputLastMessageFile = [System.IO.Path]::GetTempFileName()
    $exitCode = -1
    $transcript = ""
    $status = "FAILURE"
    $afterSnapshot = $null
    $beforeSnapshot = $null
    $missionDelta = $null
    $validationResults = @()
    $officialStatus = $null
    $officialReport = $null
    $executionResult = $null

    try {
        $beforeSnapshot = Invoke-NovaCoreInstrumentedStage -StageName 'CAPTURE_GIT_BEFORE' -Action {
            $snapshot = New-NovaCoreWorkspaceSnapshot -Repository $validatedMission.Repository -BackupDirectory $beforeBackupDirectory -ExcludedDirectories @($reportsRoot)
            Write-NovaCoreUtf8Json -Value $snapshot -Path (Join-Path $runDirectory 'workspace-before.json')
            return $snapshot
        } -Repository $validatedMission.Repository

        $inputEvidenceRegistry = Invoke-NovaCoreInstrumentedStage -StageName 'INPUT_EVIDENCE_CAPTURED' -Action {
            $registry = New-NovaCoreInputEvidenceRegistry `
                -Mission $mission `
                -Repository $validatedMission.Repository `
                -BeforeSnapshot $beforeSnapshot `
                -Admission $governedAdmission `
                -ContextAssemblyEnabled ([bool]$ContextAssemblyEnabled)
            Write-NovaCoreUtf8Json -Value $registry -Path (Join-Path $runDirectory 'input-evidence.json')
            return $registry
        } -Repository $validatedMission.Repository

        if ($ContextAssemblyEnabled) {
            $contextAssembly = Invoke-NovaCoreInstrumentedStage -StageName 'CONTEXT_ASSEMBLY' -Action {
                Import-Module $contextAssemblyModule -Force
                New-NovaCoreMissionContextAssembly `
                    -MissionFile $MissionFile `
                    -ResolvedProfile $profile `
                    -WorkspaceSnapshot $beforeSnapshot `
                    -OutputDirectory $runDirectory `
                    -CampaignFile $CampaignFile `
                    -EvidenceIndexPath $CampaignEvidenceIndexPath `
                    -GovernedResume:$GovernedCampaignResume `
                    -ResumeReportPath $ResumeReportPath
            } -Repository $validatedMission.Repository
            $prompt = "<NOVA_CORE_MISSION_CONTEXT>`n$($contextAssembly.FunctionalPayloadJson)`n</NOVA_CORE_MISSION_CONTEXT>`n`n$prompt"
        }

        $codexArguments = @(
            "exec"
            "--ignore-user-config"
            "--strict-config"
            "--model"
            $profile.Model
            "--config"
            ('model_reasoning_effort="{0}"' -f $profile.ReasoningEffort)
            "--config"
            ('approval_policy="{0}"' -f $profile.ApprovalPolicy)
            "--sandbox"
            $profile.Sandbox
            "--cd"
            $validatedMission.Repository
            "--color"
            "never"
            "-"
        )

        $promptArgument = $codexArguments[-1]
        $codexArguments = @(
            $codexArguments[0..($codexArguments.Count - 2)]
            "--output-last-message"
            $outputLastMessageFile
            $promptArgument
        )

        $executionResult = Invoke-NovaCoreInstrumentedStage -StageName 'CODEX_EXECUTION' -Action {
            $previousOutputEncoding = $OutputEncoding
            $codexStageStopwatch = if ($ContextAssemblyEnabled) { [System.Diagnostics.Stopwatch]::StartNew() } else { $null }
            try {
                $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
                $prompt | & $codexCommand.Source @codexArguments | Out-Host
            }
            finally {
                if ($null -ne $codexStageStopwatch -and $codexStageStopwatch.IsRunning) {
                    $codexStageStopwatch.Stop()
                }
                $OutputEncoding = $previousOutputEncoding
            }
            $commandExitCode = $LASTEXITCODE
            $commandTranscript = if (Test-Path $outputLastMessageFile) { Get-Content $outputLastMessageFile -Raw } else { '' }
            $commandStatus = if ($commandExitCode -eq 0) { 'SUCCESS' } elseif ($commandExitCode -in @(130, -1073741510)) { 'CANCELLED' } else { 'FAILURE' }
            return [PSCustomObject]@{
                ExitCode=$commandExitCode
                Transcript=$commandTranscript
                Status=$commandStatus
                ContextCodexDurationMs=$(if ($null -ne $codexStageStopwatch) { $codexStageStopwatch.ElapsedMilliseconds } else { $null })
            }
        } -Repository $validatedMission.Repository
        $exitCode = $executionResult.ExitCode
        $transcript = $executionResult.Transcript
        $status = $executionResult.Status
    }
    catch [System.Management.Automation.PipelineStoppedException] {
        $status = "CANCELLED"
        if ($ContextAssemblyEnabled -and $null -eq $contextAssembly) {
            $contextAssemblyFailure = $_.Exception.Message
        }
        if (-not (Test-NovaCoreExceptionJournaled -ErrorRecord $_)) {
            Write-NovaCoreExceptionJournalEntry -Step 'CODEX_EXECUTION' -ErrorRecord $_ -Repository $validatedMission.Repository
        }
        Write-ExecutionJournalEntry -Step 'CODEX_EXECUTION_FINISHED' -Status $status -ErrorMessage 'PIPELINE_STOPPED'
    }
    catch {
        $status = "FAILURE"
        if ($ContextAssemblyEnabled -and $null -eq $contextAssembly) {
            $contextAssemblyFailure = $_.Exception.Message
        }
        if (-not (Test-NovaCoreExceptionJournaled -ErrorRecord $_)) {
            Write-NovaCoreExceptionJournalEntry -Step 'CODEX_EXECUTION' -ErrorRecord $_ -Repository $validatedMission.Repository
        }
        Write-ExecutionJournalEntry -Step 'CODEX_EXECUTION_FINISHED' -Status $status -ErrorMessage $_.Exception.Message
    }
    finally {
        $stopwatch.Stop()
        Invoke-NovaCoreInstrumentedStage -StageName 'TRANSCRIPT_PERSISTED' -Action {
            [System.IO.File]::WriteAllText($transcriptPath, $transcript, [System.Text.UTF8Encoding]::new($false))
        } -Repository $validatedMission.Repository
        Remove-Item $outputLastMessageFile -ErrorAction SilentlyContinue
    }

    $finishedAt = [DateTimeOffset]::Now

    $afterSnapshot = Invoke-NovaCoreInstrumentedStage -StageName 'CAPTURE_GIT_AFTER' -Action {
        $snapshot = New-NovaCoreWorkspaceSnapshot -Repository $validatedMission.Repository -ExcludedDirectories @($reportsRoot)
        Write-NovaCoreUtf8Json -Value $snapshot -Path (Join-Path $runDirectory 'workspace-after.json')
        return $snapshot
    } -Repository $validatedMission.Repository
    $missionDelta = Invoke-NovaCoreInstrumentedStage -StageName 'GIT_DELTA_COMPUTED' -Action {
        $delta = Compare-NovaCoreWorkspaceSnapshot -Before $beforeSnapshot -After $afterSnapshot -Repository $validatedMission.Repository -BeforeBackupDirectory $beforeBackupDirectory
        Write-NovaCoreUtf8Json -Value $delta -Path (Join-Path $runDirectory 'mission-delta.json')
        return $delta
    } -Repository $validatedMission.Repository

    $validationResults = @(Invoke-NovaCoreInstrumentedStage -StageName 'VALIDATION' -Action {
        Invoke-NovaCoreValidation -Mission $mission -Repository $validatedMission.Repository -Delta $missionDelta
    } -Repository $validatedMission.Repository)

    $reviewRequired = if ($mission.PSObject.Properties.Name -contains 'humanReviewRequired') { [bool]$mission.humanReviewRequired } else { $true }
    $changesExpected = if ($mission.PSObject.Properties.Name -contains 'changesExpected') { [bool]$mission.changesExpected } else { $true }
    $officialStatus = Invoke-NovaCoreInstrumentedStage -StageName 'CLASSIFICATION' -Action {
        Get-NovaCoreClassification -ExitCode $exitCode -TechnicalStatus $status -Delta $missionDelta -Validations $validationResults -ReviewRequired $reviewRequired -ChangesExpected $changesExpected
    } -Repository $validatedMission.Repository
    $outputEvidenceRegistry = Invoke-NovaCoreInstrumentedStage -StageName 'OUTPUT_EVIDENCE_CAPTURED' -Action {
        $registry = New-NovaCoreOutputEvidenceRegistry `
            -Mission $mission `
            -Repository $validatedMission.Repository `
            -Delta $missionDelta `
            -Validations $validationResults `
            -TechnicalClassification $officialStatus
        Write-NovaCoreUtf8Json -Value $registry -Path (Join-Path $runDirectory 'output-evidence.json')
        return $registry
    } -Repository $validatedMission.Repository
    $finalAuthority = Invoke-NovaCoreInstrumentedStage -StageName 'FINAL_AUTHORITY_DECISION' -Action {
        Resolve-NovaCoreFinalAuthorityDecision `
            -TechnicalClassification $officialStatus `
            -ValidationResults $validationResults `
            -EvidenceStatus ([string]$outputEvidenceRegistry.status) `
            -ReviewRequired $reviewRequired
    } -Repository $validatedMission.Repository
    $executionFacts = [PSCustomObject]@{ Status=$status; ExitCode=$exitCode; StartedAt=$startedAt; FinishedAt=$finishedAt; DurationMs=$stopwatch.ElapsedMilliseconds; CodexVersion=$codexVersion; CodexPath=$codexPath; CodexBinaryHash=$codexBinaryHash; CodexConfigPolicy='EXPLICIT_RUNTIME_PROFILE'; Model=$profile.Model; Sandbox=$profile.Sandbox; Approval=$profile.ApprovalPolicy }
    $officialReport = Invoke-NovaCoreInstrumentedStage -StageName 'REPORT_GENERATED' -Action {
        $lockEvidence = if ($null -ne $missionLock) {
            [PSCustomObject]@{
                schemaVersion=$missionLock.Payload.schemaVersion
                missionId=$missionLock.Payload.missionId
                programId=$missionLock.Payload.programId
                processId=$missionLock.Payload.processId
                host=$missionLock.Payload.host
                startedAt=$missionLock.Payload.startedAt
                repository=$missionLock.Payload.repository
                branch=$missionLock.Payload.branch
                inputFingerprint=$missionLock.Payload.inputFingerprint
                scopeFingerprint=$missionLock.Payload.scopeFingerprint
                acquired=$missionLock.Acquired
            }
        } else { $null }
        $report = New-NovaCoreOfficialReport `
            -Mission $mission `
            -Execution $executionFacts `
            -Before $beforeSnapshot `
            -After $afterSnapshot `
            -Delta $missionDelta `
            -Validations $validationResults `
            -Status $officialStatus `
            -TranscriptPath $transcriptPath `
            -InputEvidence $inputEvidenceRegistry `
            -OutputEvidence $outputEvidenceRegistry `
            -FinalAuthority $finalAuthority `
            -Admission $governedAdmission `
            -MissionLock $lockEvidence
        if ($ContextAssemblyEnabled) {
            $contextTotalStopwatch.Stop()
            $contextDeliverables = if ($mission.PSObject.Properties.Name -contains 'deliverables') { @($mission.deliverables) } elseif ($mission.PSObject.Properties.Name -contains 'expectedFiles') { @($mission.expectedFiles) } else { @() }
            if ($null -ne $contextAssembly) {
                $contextCodexDurationMs = if ($null -ne $executionResult) { $executionResult.ContextCodexDurationMs } else { 'UNAVAILABLE' }
                $contextExecutionMetrics = Complete-NovaCoreMissionContextMetrics `
                    -Assembly $contextAssembly `
                    -OutputDirectory $runDirectory `
                    -CodexDurationMs $contextCodexDurationMs `
                    -TotalDurationMs $contextTotalStopwatch.ElapsedMilliseconds `
                    -Verdict $officialStatus `
                    -Deliverables $contextDeliverables `
                    -Diagnostics @($report.Diagnostics) `
                    -GitDelta $missionDelta `
                    -Validations $validationResults
            }
            else {
                $failureDiagnostic = [PSCustomObject][ordered]@{ code='CONTEXT_ASSEMBLY_FAILED'; detail=$contextAssemblyFailure }
                $failureMetrics = [PSCustomObject][ordered]@{
                    ContextAssemblyEnabled=$true
                    ContextAssemblyDurationMs='UNAVAILABLE'
                    ContextSourceCount='UNAVAILABLE'
                    ContextSourceBytes='UNAVAILABLE'
                    ContextPayloadBytes='UNAVAILABLE'
                    ContextSourcePaths='UNAVAILABLE'
                    ContextSourceHashes='UNAVAILABLE'
                    ContextDuplicateCount='UNAVAILABLE'
                    ContextRejectedSourceCount='UNAVAILABLE'
                    ContextSelectionDiagnostics=@($failureDiagnostic)
                    CodexDurationMs='UNAVAILABLE'
                    TotalDurationMs=$contextTotalStopwatch.ElapsedMilliseconds
                    TokensInput='UNAVAILABLE'
                    TokensOutput='UNAVAILABLE'
                    TokensTotal='UNAVAILABLE'
                    Verdict=$officialStatus
                    Deliverables=@($contextDeliverables)
                    Diagnostics=@($report.Diagnostics)
                    GitDelta=$missionDelta
                    RegressionsDetected=@('CONTEXT_ASSEMBLY_FAILED')
                }
                $failureMetricsPath = Join-Path $runDirectory 'context-assembly-metrics.json'
                Write-NovaCoreUtf8Json -Value $failureMetrics -Path $failureMetricsPath
                $contextExecutionMetrics = [PSCustomObject]@{ Path=$failureMetricsPath; Metrics=$failureMetrics }
            }
            $report | Add-Member -NotePropertyName ContextAssembly -NotePropertyValue ([PSCustomObject]@{
                Enabled=$true
                Status=$(if ($null -ne $contextAssembly) { 'SUCCESS' } else { 'FAILED' })
                ArtifactPath=$(if ($null -ne $contextAssembly) { $contextAssembly.ArtifactPath } else { $null })
                FunctionalPayloadSha256=$(if ($null -ne $contextAssembly) { $contextAssembly.FunctionalPayloadSha256 } else { $null })
                MetricsPath=$contextExecutionMetrics.Path
                Metrics=$contextExecutionMetrics.Metrics
            })
        }
        $report.OutputEvidence.entries = @($report.OutputEvidence.entries) + @([PSCustomObject][ordered]@{
            evidenceClass='OUTPUT_EVIDENCE'
            evidenceId='OFFICIAL_REPORT'
            kind='OFFICIAL_REPORT'
            path=$reportJsonPath
            sha256=$null
            fingerprintReference='ReportFingerprint'
            status='VALID'
        })
        $report.OutputEvidence.registryFingerprint = Get-NovaCoreGovernanceStringHash (
            ConvertTo-NovaCoreGovernanceCanonicalJson @($report.OutputEvidence.entries)
        )
        $report = ConvertTo-NovaCorePortableJsonValue -Value $report
        $report.ReportFingerprint = Get-NovaCoreOfficialReportFingerprint -Report $report
        Write-NovaCoreUtf8Json -Value $report.OutputEvidence -Path (Join-Path $runDirectory 'output-evidence.json')
        Write-NovaCoreUtf8Json -Value $report -Path $reportJsonPath
        [System.IO.File]::WriteAllText($reportMarkdownPath, (ConvertTo-NovaCoreMarkdown -Report $report), [System.Text.UTF8Encoding]::new($false))
        return $report
    } -Repository $validatedMission.Repository
    Remove-Item -LiteralPath $beforeBackupDirectory -Recurse -Force -ErrorAction SilentlyContinue

    $runtimeResult = [PSCustomObject]@{
        MissionId  = $validatedMission.MissionId
        Status     = $status
        ExitCode   = $exitCode
        StartedAt  = $startedAt
        FinishedAt = $finishedAt
        DurationMs = $stopwatch.ElapsedMilliseconds
        Model      = $profile.Model
        Sandbox    = $profile.Sandbox
        Approval   = $profile.ApprovalPolicy
        Transcript = $transcript
        OfficialStatus = $officialStatus
        TechnicalClassification = $officialStatus
        AuthorityDecision = $finalAuthority.authorityDecision
        FinalMissionState = $finalAuthority.finalMissionState
        ReportFingerprint = $officialReport.ReportFingerprint
        ReportJson = $reportJsonPath
        ReportMarkdown = $reportMarkdownPath
        ExecutionJournal = $journalPath
        OfficialReport = $officialReport
    }
    if ($ContextAssemblyEnabled) {
        $runtimeResult | Add-Member -NotePropertyName ContextAssembly -NotePropertyValue $officialReport.ContextAssembly
    }
    return $runtimeResult
}
catch {
    if ($journalPath -and -not (Test-NovaCoreExceptionJournaled -ErrorRecord $_)) {
        $repositoryForFailure = if ($validatedMission) { $validatedMission.Repository } else { $null }
        Write-NovaCoreExceptionJournalEntry -Step 'RUNTIME_UNHANDLED_EXCEPTION' -ErrorRecord $_ -Repository $repositoryForFailure
    }
    $failure = $_
    try {
        $fact = "Exception $($failure.Exception.GetType().FullName): $($failure.Exception.Message)"
        $fallback = [PSCustomObject]@{
            SchemaVersion='1.0.0'; Mission=[PSCustomObject]@{ MissionId=$script:NovaCoreMissionContext.MissionId; Program=$script:NovaCoreMissionContext.Program; Lot=$script:NovaCoreMissionContext.Lot }
            Status='FAILED'; TranscriptAuthoritative=$false
            Diagnostics=@([PSCustomObject]@{ Step='RUNTIME_UNHANDLED_EXCEPTION'; Severity='ERROR'; Fact=$fact; Consequence='Le rapport nominal n a pas pu etre genere.'; Hypothesis='Une etape instrumentee a leve une exception.'; CorrectiveAction='Consulter le journal persistant, corriger la cause et relancer.' })
        }
        [IO.File]::WriteAllText($reportJsonPath, ($fallback | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))
        [IO.File]::WriteAllText($reportMarkdownPath, "# Rapport de secours NOVA_CORE`n`n- Statut : FAILED`n- Fait : $fact`n- Conséquence : le rapport nominal n'a pas pu être généré.`n- Hypothèse : une étape instrumentée a levé une exception.`n- Action corrective : consulter le journal persistant, corriger la cause et relancer.`n", [Text.UTF8Encoding]::new($false))
    }
    catch { }
    throw $failure
}
finally {
    if ($null -ne $missionLock) {
        try {
            Invoke-NovaCoreInstrumentedStage -StageName 'MISSION_LOCK_RELEASED' -Action {
                Exit-NovaCoreMissionLock -Lock $missionLock
            } -Repository $script:NovaCoreMissionContext.Repository
        }
        catch {
            if (-not (Test-NovaCoreExceptionJournaled -ErrorRecord $_)) {
                Write-NovaCoreExceptionJournalEntry -Step 'MISSION_LOCK_RELEASED' -ErrorRecord $_ -Repository $script:NovaCoreMissionContext.Repository
            }
            throw
        }
    }
}

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:NovaCoreSensitiveFilePatterns = @(
    '.env',
    '.env.*',
    '*.pem',
    '*.key',
    '*.pfx',
    '*.p12',
    '*credentials*',
    '*secret*',
    '.git/**',
    'node_modules/**',
    '.nova-data/**',
    'tools/nova-core-runtime/reports/**'
)

function ConvertTo-NovaCoreSafeName {
    param([Parameter(Mandatory)][string]$Value)
    return ($Value -replace '[^A-Za-z0-9._-]', '_')
}

function Write-NovaCoreUtf8Json {
    param([Parameter(Mandatory)]$Value, [Parameter(Mandatory)][string]$Path)
    $json = $Value | ConvertTo-Json -Depth 20
    [System.IO.File]::WriteAllText($Path, $json, [System.Text.UTF8Encoding]::new($false))
}

function Get-NovaCoreFileHash {
    param([Parameter(Mandatory)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

function Test-NovaCoreSensitiveFile {
    param([Parameter(Mandatory)][string]$Path)
    $normalizedPath = $Path.Replace('\','/').TrimStart('/')
    return @($script:NovaCoreSensitiveFilePatterns | Where-Object {
        $normalizedPath -like $_
    }).Count -gt 0
}

function New-NovaCoreWorkspaceSnapshot {
    param(
        [Parameter(Mandatory)][string]$Repository,
        [string]$BackupDirectory,
        [string[]]$ExcludedDirectories = @()
    )
    $root = (Resolve-Path -LiteralPath $Repository).Path
    $previousConsoleOutputEncoding = [Console]::OutputEncoding
    [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
    Push-Location $root
    try {
        $branch = (& git branch --show-current).Trim()
        $head = 'UNBORN'
        try {
            $headOutput = & git rev-parse --verify HEAD 2>$null
            if ($LASTEXITCODE -eq 0) { $head = ([string]$headOutput).Trim() }
        }
        catch { $head = 'UNBORN' }
        $tracked = @(& git -c core.quotepath=false ls-files)
        $untracked = @(& git -c core.quotepath=false ls-files --others --exclude-standard)
        $excludedPrefixes = @($ExcludedDirectories | ForEach-Object {
            $resolved = [IO.Path]::GetFullPath($_).TrimEnd('\','/')
            if ($resolved.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
                $resolved.Substring($root.Length).TrimStart('\','/').Replace('\','/') + '/'
            }
        })
        $paths = @($tracked + $untracked | Sort-Object -Unique | Where-Object {
            $candidate = $_.Replace('\','/')
            -not @($excludedPrefixes | Where-Object { $candidate.StartsWith($_, [StringComparison]::OrdinalIgnoreCase) }).Count
        })
        $files = [ordered]@{}
        foreach ($relativePath in $paths) {
            if ([string]::IsNullOrWhiteSpace($relativePath)) { continue }
            $absolutePath = Join-Path $root $relativePath
            if (-not (Test-Path -LiteralPath $absolutePath -PathType Leaf)) { continue }
            $files[$relativePath] = [ordered]@{
                hash = Get-NovaCoreFileHash -Path $absolutePath
                tracked = $tracked -contains $relativePath
                contentBackedUp = -not (Test-NovaCoreSensitiveFile -Path $relativePath)
            }
            if ($BackupDirectory -and $files[$relativePath].contentBackedUp) {
                $backupPath = Join-Path $BackupDirectory $relativePath
                $backupParent = Split-Path -Parent $backupPath
                if (-not (Test-Path -LiteralPath $backupParent)) {
                    New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
                }
                Copy-Item -LiteralPath $absolutePath -Destination $backupPath
            }
        }
        return [PSCustomObject]@{
            CapturedAt = [DateTimeOffset]::Now
            Branch = $branch
            Head = $head
            Porcelain = @(& git status --porcelain=v1)
            Files = $files
        }
    }
    finally {
        Pop-Location
        [Console]::OutputEncoding = $previousConsoleOutputEncoding
    }
}

function Get-NovaCoreLineDelta {
    param([string]$BeforePath, [string]$AfterPath)
    $empty = [System.IO.Path]::GetTempFileName()
    try {
        $left = if ($BeforePath -and (Test-Path -LiteralPath $BeforePath)) { $BeforePath } else { $empty }
        $right = if ($AfterPath -and (Test-Path -LiteralPath $AfterPath)) { $AfterPath } else { $empty }
        $previousErrorActionPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = 'Continue'
            $line = @(& git -c core.autocrlf=false diff --no-index --numstat -- $left $right 2>$null | Select-Object -First 1)
        }
        finally { $ErrorActionPreference = $previousErrorActionPreference }
        if ($line.Count -eq 0) { return [PSCustomObject]@{ Insertions = 0; Deletions = 0 } }
        $parts = ([string]$line[0]) -split "`t"
        return [PSCustomObject]@{
            Insertions = if ($parts[0] -match '^\d+$') { [int]$parts[0] } else { 0 }
            Deletions = if ($parts[1] -match '^\d+$') { [int]$parts[1] } else { 0 }
        }
    }
    finally { Remove-Item -LiteralPath $empty -Force -ErrorAction SilentlyContinue }
}

function Compare-NovaCoreWorkspaceSnapshot {
    param(
        [Parameter(Mandatory)]$Before,
        [Parameter(Mandatory)]$After,
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$BeforeBackupDirectory
    )
    $beforePaths = @($Before.Files.Keys)
    $afterPaths = @($After.Files.Keys)
    $created = @($afterPaths | Where-Object { -not $Before.Files.Contains($_) })
    $deleted = @($beforePaths | Where-Object { -not $After.Files.Contains($_) })
    $modified = @($beforePaths | Where-Object {
        $After.Files.Contains($_) -and $Before.Files[$_].hash -ne $After.Files[$_].hash
    })
    $renamed = @()
    foreach ($oldPath in @($deleted)) {
        $match = $created | Where-Object { $After.Files[$_].hash -eq $Before.Files[$oldPath].hash } | Select-Object -First 1
        if ($match) {
            $renamed += [PSCustomObject]@{ From = $oldPath; To = $match }
            $deleted = @($deleted | Where-Object { $_ -ne $oldPath })
            $created = @($created | Where-Object { $_ -ne $match })
        }
    }
    $insertions = 0
    $deletions = 0
    foreach ($path in @($created + $modified + $deleted)) {
        if ($Before.Files.Contains($path) -and
            $Before.Files[$path].Contains('contentBackedUp') -and
            -not [bool]$Before.Files[$path].contentBackedUp) {
            continue
        }
        $delta = Get-NovaCoreLineDelta -BeforePath (Join-Path $BeforeBackupDirectory $path) -AfterPath (Join-Path $Repository $path)
        $insertions += $delta.Insertions
        $deletions += $delta.Deletions
    }
    return [PSCustomObject]@{
        Created = @($created)
        Modified = @($modified)
        Deleted = @($deleted)
        Renamed = @($renamed)
        Insertions = $insertions
        Deletions = $deletions
        BranchChanged = $Before.Branch -ne $After.Branch
        HeadChanged = $Before.Head -ne $After.Head
    }
}

function ConvertTo-NovaCoreCanonicalPath {
    param([Parameter(Mandatory)][string]$Path)
    $normalized = $Path.Trim().Replace('\','/') -replace '/+','/'
    $prefix = if ($normalized -match '^[A-Za-z]:/') { $normalized.Substring(0,3) } elseif ($normalized.StartsWith('/')) { '/' } else { '' }
    $tail = if ($prefix) { $normalized.Substring($prefix.Length) } else { $normalized }
    $segments = [System.Collections.Generic.List[string]]::new()
    foreach ($segment in @($tail.Split('/'))) {
        if (-not $segment -or $segment -eq '.') { continue }
        if ($segment -eq '..') {
            if ($segments.Count -eq 0) { throw "NOVA_CORE_SCOPE_ESCAPES_ROOT:$Path" }
            $segments.RemoveAt($segments.Count - 1)
            continue
        }
        $segments.Add($segment)
    }
    return ($prefix + (($segments.ToArray()) -join '/')).TrimEnd('/')
}

function Test-NovaCoreRelativePathMatch {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Pattern)
    $normalizedPath = (ConvertTo-NovaCoreCanonicalPath $Path).TrimStart('/')
    $normalizedPattern = (ConvertTo-NovaCoreCanonicalPath $Pattern).TrimStart('/')
    $recursive = $normalizedPattern.EndsWith('/**')
    $basePattern = if ($recursive) { $normalizedPattern.Substring(0,$normalizedPattern.Length-3).TrimEnd('/') } else { $normalizedPattern }
    $escaped = [Regex]::Escape($basePattern)
    $escaped = $escaped.Replace('\*\*','__NOVA_DOUBLE_STAR__').Replace('\*','[^/]*').Replace('\?','[^/]').Replace('__NOVA_DOUBLE_STAR__','.*')
    $expression = if ($recursive) { '^' + $escaped + '(?:/.*)?$' } else { '^' + $escaped + '$' }
    return [Regex]::IsMatch($normalizedPath, $expression, [Text.RegularExpressions.RegexOptions]::IgnoreCase)
}

function Invoke-NovaCoreNamedCommand {
    param([Parameter(Mandatory)][string]$Name, [Parameter(Mandatory)][string]$Repository)
    $powershell = Join-Path $PSHOME 'powershell.exe'
    $commands = @{
        'powershellSyntax' = [PSCustomObject]@{ FileName=$powershell; Arguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $Repository 'tools/nova-core-runtime/Test-NovaCoreSyntax.ps1')); WorkingDirectory=$Repository }
        'reportingUnitTests' = [PSCustomObject]@{ FileName=$powershell; Arguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $Repository 'tools/nova-core-runtime/Test-NovaCoreReporting.ps1')); WorkingDirectory=$Repository }
        'exceptionCaptureTests' = [PSCustomObject]@{ FileName=$powershell; Arguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $Repository 'tools/nova-core-runtime/Test-NovaCoreExceptionCapture.ps1')); WorkingDirectory=$Repository }
        'runtimeE2ETests' = [PSCustomObject]@{ FileName=$powershell; Arguments=@('-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $Repository 'tools/nova-core-runtime/Test-NovaCoreRuntimeE2E.ps1')); WorkingDirectory=$Repository }
        'novaCoreTests' = [PSCustomObject]@{ FileName='npm.cmd'; Arguments=@('test'); WorkingDirectory=$Repository }
        'novaCoreTypecheck' = [PSCustomObject]@{ FileName='npm.cmd'; Arguments=@('run','typecheck:nova-core'); WorkingDirectory=$Repository }
        'novaWebTests' = [PSCustomObject]@{ FileName='npm.cmd'; Arguments=@('test'); WorkingDirectory=(Join-Path $Repository 'apps/nova-web') }
        'novaWebTypecheck' = [PSCustomObject]@{ FileName='npm.cmd'; Arguments=@('run','typecheck'); WorkingDirectory=(Join-Path $Repository 'apps/nova-web') }
        'novaWebBuild' = [PSCustomObject]@{ FileName='npm.cmd'; Arguments=@('run','build'); WorkingDirectory=(Join-Path $Repository 'apps/nova-web') }
    }
    if (-not $commands.ContainsKey($Name)) { throw "NOVA_CORE_NAMED_COMMAND_NOT_ALLOWED:$Name" }
    $command = $commands[$Name]
    $startInfo = [Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = $command.FileName
    $startInfo.Arguments = (@($command.Arguments) | ForEach-Object { '"' + ([string]$_).Replace('"','\"') + '"' }) -join ' '
    $startInfo.WorkingDirectory = $command.WorkingDirectory
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $process = [Diagnostics.Process]::Start($startInfo)
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $timeoutMs = if ($env:NOVA_CORE_VALIDATION_TIMEOUT_MS) { [int]$env:NOVA_CORE_VALIDATION_TIMEOUT_MS } else { 600000 }
    $completed = $process.WaitForExit($timeoutMs)
    if (-not $completed) {
        try { & taskkill.exe /PID $process.Id /T /F 2>$null | Out-Null } catch { try { $process.Kill() } catch {} }
        [void]$process.WaitForExit(5000)
    }
    $standardOutput = $stdoutTask.GetAwaiter().GetResult()
    $standardError = $stderrTask.GetAwaiter().GetResult()
    $maxOutput = 1000000
    if ($standardOutput.Length -gt $maxOutput) { $standardOutput = $standardOutput.Substring(0,$maxOutput) + "`n[TRUNCATED]" }
    if ($standardError.Length -gt $maxOutput) { $standardError = $standardError.Substring(0,$maxOutput) + "`n[TRUNCATED]" }
    $message = (($standardOutput,$standardError | Where-Object { $_ }) -join [Environment]::NewLine).Trim()
    if (-not $completed) { $message = "NOVA_CORE_VALIDATION_TIMEOUT:$Name`n$message".Trim() }
    return [PSCustomObject]@{ Passed=($completed -and $process.ExitCode -eq 0); Message=$message; TimedOut=(-not $completed) }
}

function Get-NovaCoreDynamicValidations {
    param($Delta)
    if ($null -eq $Delta) { return @() }
    $paths = @($Delta.Created) + @($Delta.Modified) + @($Delta.Deleted) + @($Delta.Renamed | ForEach-Object { $_.From; $_.To })
    $normalized = @($paths | ForEach-Object { ([string]$_).Replace('\','/').TrimStart('./') } | Sort-Object -Unique)
    $selected = [ordered]@{}
    if (@($normalized | Where-Object { $_ -like 'apps/nova-web/*' }).Count -gt 0) {
        $selected['nova-web-tests'] = [PSCustomObject]@{ name='nova-web-tests'; type='namedCommand'; command='novaWebTests'; required=$true }
        $selected['nova-web-typecheck'] = [PSCustomObject]@{ name='nova-web-typecheck'; type='namedCommand'; command='novaWebTypecheck'; required=$true }
        $selected['nova-web-build'] = [PSCustomObject]@{ name='nova-web-build'; type='namedCommand'; command='novaWebBuild'; required=$true }
    }
    if (@($normalized | Where-Object { $_ -like 'server/*' -or $_ -in @('package.json','package-lock.json','tsconfig.nova-core.json') }).Count -gt 0) {
        $selected['nova-core-tests'] = [PSCustomObject]@{ name='nova-core-tests'; type='namedCommand'; command='novaCoreTests'; required=$true }
        $selected['nova-core-typecheck'] = [PSCustomObject]@{ name='nova-core-typecheck'; type='namedCommand'; command='novaCoreTypecheck'; required=$true }
    }
    if (@($normalized | Where-Object { $_ -like 'tools/nova-core-runtime/*' }).Count -gt 0) {
        $selected['nova-runtime-syntax'] = [PSCustomObject]@{ name='nova-runtime-syntax'; type='namedCommand'; command='powershellSyntax'; required=$true }
        $selected['nova-runtime-e2e'] = [PSCustomObject]@{ name='nova-runtime-e2e'; type='namedCommand'; command='runtimeE2ETests'; required=$true }
    }
    return @($selected.Values)
}

function Invoke-NovaCoreValidation {
    param([Parameter(Mandatory)]$Mission, [Parameter(Mandatory)][string]$Repository, $Delta = $null)
    $results = @()
    $validations = if ($Mission.PSObject.Properties.Name -contains 'validations') { @($Mission.validations) } else { @() }
    $usesDynamicPolicy = $Mission.PSObject.Properties.Name -contains 'validationPolicy' -and
        $Mission.validationPolicy.source -eq 'actual-git-delta'
    if ($usesDynamicPolicy) {
        foreach ($dynamicValidation in @(Get-NovaCoreDynamicValidations -Delta $Delta)) {
            if (@($validations | Where-Object { $_.name -eq $dynamicValidation.name }).Count -eq 0) {
                $validations += $dynamicValidation
            }
        }
    }
    foreach ($validation in $validations) {
        $started = [DateTimeOffset]::Now
        $passed = $false
        $message = $null
        try {
            switch ($validation.type) {
                'fileExists' { $passed = Test-Path -LiteralPath (Join-Path $Repository $validation.path) -PathType Leaf }
                'fileAbsent' { $passed = -not (Test-Path -LiteralPath (Join-Path $Repository $validation.path)) }
                'json' { $null = Get-Content -Raw -LiteralPath (Join-Path $Repository $validation.path) | ConvertFrom-Json; $passed = $true }
                'utf8' {
                    $text = [Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes((Join-Path $Repository $validation.path)))
                    $passed = -not $text.Contains([char]0xFFFD)
                }
                'powershell' {
                    $tokens = $null; $errors = $null
                    [void][System.Management.Automation.Language.Parser]::ParseFile((Join-Path $Repository $validation.path), [ref]$tokens, [ref]$errors)
                    $passed = $errors.Count -eq 0
                    if (-not $passed) { $message = ($errors.Message -join '; ') }
                }
                'gitDiffCheck' {
                    $startInfo = [Diagnostics.ProcessStartInfo]::new()
                    $startInfo.FileName = 'git'
                    $startInfo.Arguments = 'diff --check'
                    $startInfo.WorkingDirectory = $Repository
                    $startInfo.UseShellExecute = $false
                    $startInfo.CreateNoWindow = $true
                    $startInfo.RedirectStandardOutput = $true
                    $startInfo.RedirectStandardError = $true
                    $process = [Diagnostics.Process]::Start($startInfo)
                    $standardOutput = $process.StandardOutput.ReadToEnd()
                    $standardError = $process.StandardError.ReadToEnd()
                    $process.WaitForExit()
                    $passed = $process.ExitCode -eq 0
                    $message = (($standardOutput,$standardError | Where-Object { $_ }) -join [Environment]::NewLine).Trim()
                }
                'namedCommand' {
                    $commandResult = Invoke-NovaCoreNamedCommand -Name ([string]$validation.command) -Repository $Repository
                    $passed = $commandResult.Passed
                    $message = $commandResult.Message
                }
                default { $message = "VALIDATION_TYPE_NOT_ALLOWED:$($validation.type)" }
            }
        }
        catch { $message = $_.Exception.Message }
        $results += [PSCustomObject]@{ Type=$validation.type; Name=$validation.name; Passed=$passed; Required=($validation.required -ne $false); Message=$message; DurationMs=([DateTimeOffset]::Now-$started).TotalMilliseconds }
    }
    foreach ($expectedFile in @($(if ($Mission.PSObject.Properties.Name -contains 'expectedFiles') { $Mission.expectedFiles }))) {
        $exists = Test-Path -LiteralPath (Join-Path $Repository $expectedFile) -PathType Leaf
        $results += [PSCustomObject]@{ Type='expectedFile'; Name="expected:$expectedFile"; Passed=$exists; Required=$true; Message=$(if ($exists) { $null } else { "EXPECTED_FILE_MISSING:$expectedFile" }); DurationMs=0 }
    }
    if ($null -ne $Delta) {
        $changedPaths = @($Delta.Created) + @($Delta.Modified) + @($Delta.Deleted) + @($Delta.Renamed | ForEach-Object { $_.From; $_.To })
        $allowed = @($(if ($Mission.PSObject.Properties.Name -contains 'allowedPaths') { $Mission.allowedPaths }))
        $forbidden = @($(if ($Mission.PSObject.Properties.Name -contains 'forbiddenPaths') { $Mission.forbiddenPaths })) + $script:NovaCoreSensitiveFilePatterns
        foreach ($changedPath in @($changedPaths | Sort-Object -Unique)) {
            $isForbidden = @($forbidden | Where-Object { Test-NovaCoreRelativePathMatch -Path $changedPath -Pattern $_ }).Count -gt 0
            $isAllowed = $allowed.Count -eq 0 -or @($allowed | Where-Object { Test-NovaCoreRelativePathMatch -Path $changedPath -Pattern $_ }).Count -gt 0
            $passed = $isAllowed -and -not $isForbidden
            $results += [PSCustomObject]@{ Type='pathScope'; Name="scope:$changedPath"; Passed=$passed; Required=$true; Message=$(if ($passed) { $null } else { "PATH_SCOPE_VIOLATION:$changedPath" }); DurationMs=0 }
        }
    }
    return $results
}

function New-NovaCoreDiagnostic {
    param(
        [Parameter(Mandatory)][string]$Step,
        [Parameter(Mandatory)][string]$Fact,
        [Parameter(Mandatory)][string]$Consequence,
        [string]$Hypothesis,
        [Parameter(Mandatory)][string]$CorrectiveAction,
        [ValidateSet('INFO','WARNING','ERROR')][string]$Severity = 'INFO'
    )
    return [PSCustomObject]@{
        Step=$Step; Severity=$Severity; Fact=$Fact; Consequence=$Consequence
        Hypothesis=$Hypothesis; CorrectiveAction=$CorrectiveAction
    }
}

function New-NovaCoreDiagnostics {
    param($Execution, $Delta, [array]$Validations, [string]$Status)
    $diagnostics = @()
    if ($Execution.Status -eq 'CANCELLED') {
        $diagnostics += New-NovaCoreDiagnostic -Step 'CODEX_EXECUTION' -Severity ERROR -Fact "Execution interrompue avec ExitCode $($Execution.ExitCode)." -Consequence 'La mission n a pas produit une execution complete.' -Hypothesis 'Interruption utilisateur ou arret du processus.' -CorrectiveAction 'Verifier le journal et relancer la mission depuis le point de reprise.'
    } elseif ($Execution.ExitCode -ne 0) {
        $diagnostics += New-NovaCoreDiagnostic -Step 'CODEX_EXECUTION' -Severity ERROR -Fact "Codex a retourne ExitCode $($Execution.ExitCode)." -Consequence 'Le resultat ne peut pas etre certifie.' -Hypothesis 'Erreur du processus Codex; le transcript peut apporter un contexte non autoritatif.' -CorrectiveAction 'Corriger la cause indiquee par le journal puis relancer.'
    } else {
        $diagnostics += New-NovaCoreDiagnostic -Step 'CODEX_EXECUTION' -Fact 'Codex a retourne ExitCode 0.' -Consequence 'L execution technique est terminee.' -CorrectiveAction 'Poursuivre les validations autoritatives.'
    }
    $changeCount = @($Delta.Created).Count + @($Delta.Modified).Count + @($Delta.Deleted).Count + @($Delta.Renamed).Count
    $diagnostics += New-NovaCoreDiagnostic -Step 'WORKSPACE_DELTA' -Fact "$changeCount changement(s) attribue(s) a la mission." -Consequence 'Le perimetre mesure est disponible pour validation.' -CorrectiveAction 'Verifier les controles de perimetre avant certification.'
    foreach ($validation in @($Validations)) {
        if ($validation.Passed) {
            $diagnostics += New-NovaCoreDiagnostic -Step 'VALIDATION' -Fact "Validation $($validation.Name) reussie." -Consequence 'Cette exigence est satisfaite.' -CorrectiveAction 'Aucune action corrective.'
        } else {
            $diagnostics += New-NovaCoreDiagnostic -Step 'VALIDATION' -Severity ERROR -Fact "Validation $($validation.Name) echouee: $($validation.Message)" -Consequence 'La certification est bloquee ou partielle.' -Hypothesis 'Le livrable ne respecte pas encore le contrat de validation.' -CorrectiveAction 'Corriger le fait signale puis reexecuter la validation nommee.'
        }
    }
    $diagnostics += New-NovaCoreDiagnostic -Step 'CLASSIFICATION' -Fact "Statut officiel calcule: $Status." -Consequence 'Ce statut gouverne le rapport officiel.' -CorrectiveAction $(if ($Status -in @('SUCCESS','READY_FOR_REVIEW','NO_CHANGE')) { 'Appliquer la revue requise.' } else { 'Reprendre au premier diagnostic en erreur.' })
    return $diagnostics
}

function Get-NovaCoreClassification {
    param([int]$ExitCode, [string]$TechnicalStatus, $Delta, [array]$Validations, [bool]$ReviewRequired, [bool]$ChangesExpected)
    if ($TechnicalStatus -eq 'CANCELLED') { return 'CANCELLED' }
    if ($ExitCode -ne 0) { return 'FAILED' }
    $failedRequired = @($Validations | Where-Object { $_.Required -and -not $_.Passed })
    if ($failedRequired.Count -gt 0) {
        $hasChanges = @($Delta.Created).Count + @($Delta.Modified).Count + @($Delta.Deleted).Count + @($Delta.Renamed).Count -gt 0
        return $(if ($hasChanges) { 'PARTIAL' } else { 'BLOCKED' })
    }
    $changeCount = @($Delta.Created).Count + @($Delta.Modified).Count + @($Delta.Deleted).Count + @($Delta.Renamed).Count
    if ($ChangesExpected -and $changeCount -eq 0) { return 'NO_CHANGE' }
    return $(if ($ReviewRequired) { 'READY_FOR_REVIEW' } else { 'SUCCESS' })
}

function New-NovaCoreOfficialReport {
    param(
        $Mission,
        $Execution,
        $Before,
        $After,
        $Delta,
        [array]$Validations,
        [string]$Status,
        [string]$TranscriptPath,
        $InputEvidence,
        $OutputEvidence,
        $FinalAuthority,
        $Admission,
        $MissionLock
    )
    $diagnostics = @(New-NovaCoreDiagnostics -Execution $Execution -Delta $Delta -Validations $Validations -Status $Status)
    $profileResolver = Join-Path $PSScriptRoot 'Resolve-NovaCoreProfile.ps1'
    $resolvedProfile = & $profileResolver -ProfileName ([string]$Mission.profile)
    if ($null -eq $FinalAuthority) {
        $FinalAuthority = [PSCustomObject]@{
            technicalClassification=$Status
            validationResults=@($Validations)
            evidenceStatus='UNAVAILABLE'
            reviewRequirement='LEGACY_CALLER'
            authorityDecision='UNRESOLVED'
            finalMissionState=$Status
            decidedBy='LEGACY_CALLER'
            decidedAt=[DateTimeOffset]::Now
            reasonCode='GOVERNANCE_CONTRACT_NOT_SUPPLIED'
            transcriptUsed=$false
        }
    }
    return [PSCustomObject]@{
        SchemaVersion = '1.0.0'
        Mission = [PSCustomObject]@{ MissionId=$Mission.missionId; Program=$Mission.program; Lot=$Mission.lot; Title=$Mission.title }
        Binding = $(if ($Mission.PSObject.Properties.Name -contains 'binding') { $Mission.binding } else { $null })
        AgenticProfileRequested = [string]$Mission.profile
        AgenticProfileResolved = $resolvedProfile.Name
        ModelResolved = $Execution.Model
        ReasoningLevelResolved = $resolvedProfile.ReasoningEffort
        SandboxResolved = $Execution.Sandbox
        ApprovalPolicyResolved = $Execution.Approval
        CodexVersion = $Execution.CodexVersion
        ProfileResolutionSource = 'Resolve-NovaCoreProfile.ps1'
        RoutingDecision = 'RESOLVED'
        RoutingJustification = "Profil $($Mission.profile) resolu par le registre NOVA_CORE vers $($resolvedProfile.Name)."
        RuntimeStartedAt = $Execution.StartedAt
        Environment = [PSCustomObject]@{ Branch=$After.Branch; Head=$After.Head; CodexVersion=$Execution.CodexVersion; Model=$Execution.Model; Sandbox=$Execution.Sandbox; Approval=$Execution.Approval }
        Codex = [PSCustomObject]@{ Status=$Execution.Status; ExitCode=$Execution.ExitCode; Version=$Execution.CodexVersion; Path=$Execution.CodexPath; BinaryHash=$Execution.CodexBinaryHash; ConfigPolicy=$Execution.CodexConfigPolicy; StartedAt=$Execution.StartedAt; FinishedAt=$Execution.FinishedAt; DurationMs=$Execution.DurationMs; TranscriptPath=$TranscriptPath; TranscriptAuthoritative=$false }
        Git = $Delta
        Validations = $Validations
        InputEvidence = $InputEvidence
        OutputEvidence = $OutputEvidence
        Admission = $Admission
        MissionLock = $MissionLock
        Warnings = @($(if ($Delta.BranchChanged) { 'BRANCH_CHANGED_DURING_MISSION' }; if ($Delta.HeadChanged) { 'HEAD_CHANGED_DURING_MISSION' }))
        Errors = @($Validations | Where-Object { $_.Required -and -not $_.Passed } | ForEach-Object { $_.Message })
        Diagnostics = $diagnostics
        TechnicalClassification = $Status
        FinalAuthority = $FinalAuthority
        AuthorityDecision = $FinalAuthority.authorityDecision
        FinalMissionState = $FinalAuthority.finalMissionState
        ReportFingerprint = $null
        Status = $Status
        ResumePoint = [PSCustomObject]@{ MissionId=$Mission.missionId; Status=$Status; ReportGeneratedAt=[DateTimeOffset]::Now }
    }
}

function ConvertTo-NovaCoreMarkdown {
    param([Parameter(Mandatory)]$Report)
    $created = if (@($Report.Git.Created).Count) { ($Report.Git.Created | ForEach-Object { "- ``$_``" }) -join "`n" } else { '- Aucun' }
    $modified = if (@($Report.Git.Modified).Count) { ($Report.Git.Modified | ForEach-Object { "- ``$_``" }) -join "`n" } else { '- Aucun' }
    $deleted = if (@($Report.Git.Deleted).Count) { ($Report.Git.Deleted | ForEach-Object { "- ``$_``" }) -join "`n" } else { '- Aucun' }
    $diagnosticMarkdown = @($Report.Diagnostics | ForEach-Object {
        '- [{0}] {1} - Fait: {2} Consequence: {3} Hypothese: {4} Action corrective: {5}' -f $_.Severity,$_.Step,$_.Fact,$_.Consequence,$_.Hypothesis,$_.CorrectiveAction
    }) -join "`n"
    return @"
# Rapport officiel NOVA_CORE

- MissionId : $($Report.Mission.MissionId)
- Statut : $($Report.Status)
- Classification technique : $($Report.TechnicalClassification)
- Decision autoritative : $($Report.AuthorityDecision)
- Etat final : $($Report.FinalMissionState)
- ExitCode Codex : $($Report.Codex.ExitCode)
- Transcript autoritatif : NON
- AgenticProfileRequested : $($Report.AgenticProfileRequested)
- AgenticProfileResolved : $($Report.AgenticProfileResolved)
- ModelResolved : $($Report.ModelResolved)
- ReasoningLevelResolved : $($Report.ReasoningLevelResolved)
- SandboxResolved : $($Report.SandboxResolved)
- ApprovalPolicyResolved : $($Report.ApprovalPolicyResolved)
- CodexVersion : $($Report.CodexVersion)
- ProfileResolutionSource : $($Report.ProfileResolutionSource)
- RoutingDecision : $($Report.RoutingDecision)
- RoutingJustification : $($Report.RoutingJustification)
- RuntimeStartedAt : $($Report.RuntimeStartedAt)
- Empreinte du rapport : $($Report.ReportFingerprint)

## Admission gouvernee

- Mode : $($Report.Admission.mode)
- Recovery Lane : $($Report.Admission.recoveryLaneClass)
- Exception Non Self-Blocking : $($Report.Admission.nonSelfBlockingException)
- Freeze actif : $($Report.Admission.freeze.active)
- Exception Freeze appliquee : $($Report.Admission.freeze.exceptionApplied)

## Registres de preuves

- Input Evidence : $($Report.InputEvidence.status)
- Output Evidence : $($Report.OutputEvidence.status)
- Empreinte Input Evidence : $($Report.InputEvidence.registryFingerprint)
- Empreinte Output Evidence : $($Report.OutputEvidence.registryFingerprint)

## Fichiers créés
$created

## Fichiers modifiés
$modified

## Fichiers supprimés
$deleted

## Diff

- Insertions : $($Report.Git.Insertions)
- Suppressions : $($Report.Git.Deletions)

## Validations

$(@($Report.Validations | ForEach-Object { "- $($_.Name) : $(if ($_.Passed) { 'SUCCESS' } else { 'FAILURE' })" }) -join "`n")

## Diagnostics

$diagnosticMarkdown
"@
}

Export-ModuleMember -Function *-NovaCore*

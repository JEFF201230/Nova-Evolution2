param([switch]$KeepTemporaryFiles)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$results = [Collections.Generic.List[object]]::new()
function Add-Scenario([string]$Name, [bool]$Passed, [string]$Evidence) {
    $results.Add([PSCustomObject]@{ Name=$Name; Passed=$Passed; Evidence=$Evidence })
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ('nova-core runtime e2e ' + [guid]::NewGuid())
$repo = Join-Path $tempRoot 'repository with spaces'
$tools = Join-Path $repo 'tools/nova-core-runtime'
$fakeBin = Join-Path $tempRoot 'fake-bin'
$reports = Join-Path $repo 'runtime-reports'
$originalPath = $env:PATH
$utf8 = [Text.UTF8Encoding]::new($false)

function Write-Utf8([string]$Path, [string]$Value) {
    $parent = Split-Path -Parent $Path
    if ($parent -and -not (Test-Path -LiteralPath $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    [IO.File]::WriteAllText($Path, $Value, $utf8)
}

function New-TestMission([string]$Id, [array]$Validations=@(), [array]$ExpectedFiles=@(), [bool]$ChangesExpected=$true, [bool]$ReviewRequired=$true, [string]$PromptPath=$null) {
    if (-not $PromptPath) { $PromptPath = Join-Path $tools 'prompt.md' }
    $mission = [ordered]@{
        schemaVersion='1.0.0'; missionId=$Id; program='PROGRAM-NOVA-CORE-REPORTING-E2E'; lot='LOT-009'; title=$Id
        profile='ARCHITECTURE'; repository=$repo; expectedBranch='master'; promptFile=$PromptPath; workingDirectory=$repo
        reportDirectory=$reports; allowedPaths=@('allowed/**','tools/nova-core-runtime/**'); forbiddenPaths=@('forbidden/**')
        expectedFiles=$ExpectedFiles; validations=$Validations; changesExpected=$ChangesExpected; humanReviewRequired=$ReviewRequired; enabled=$true
    }
    $path = Join-Path $tools "$Id.json"
    Write-Utf8 $path ($mission | ConvertTo-Json -Depth 10)
    return $path
}

function Invoke-TestMission([string]$MissionPath, [int]$ExitCode=0, [string]$CreatePath='', [string]$Content='content', [string]$Transcript='fake transcript') {
    $env:NOVA_CORE_FAKE_EXIT_CODE = [string]$ExitCode
    $env:NOVA_CORE_FAKE_CREATE_PATH = $CreatePath
    $env:NOVA_CORE_FAKE_CONTENT = $Content
    $env:NOVA_CORE_FAKE_TRANSCRIPT = $Transcript
    $output = @(& (Join-Path $tools 'Invoke-NovaCoreMission.ps1') -MissionFile $MissionPath)
    return @($output | Where-Object { $_.PSObject.Properties.Name -contains 'OfficialStatus' })[-1]
}

try {
    New-Item -ItemType Directory -Path $tools,$fakeBin,$reports -Force | Out-Null
    foreach ($name in @('Invoke-NovaCoreMission.ps1','NovaCore.Reporting.psm1','NovaCore.Governance.psm1','Test-NovaCoreMission.ps1','Resolve-NovaCoreProfile.ps1','profiles.json','Test-NovaCoreReporting.ps1','Test-NovaCoreExceptionCapture.ps1')) {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot $name) -Destination (Join-Path $tools $name)
    }
    Write-Utf8 (Join-Path $tools 'prompt.md') 'controlled prompt'
    Write-Utf8 (Join-Path $fakeBin 'codex.cmd') @'
@echo off
set "NOVA_CORE_FAKE_SCRIPT=%~dp0fake-codex.ps1"
if "%~1"=="--version" (
  echo codex-cli 0.144.1
  exit /b 0
)
:parse
if "%~1"=="" goto run
if "%~1"=="--cd" (
  set "NOVA_CORE_FAKE_REPOSITORY=%~2"
  shift
)
if "%~1"=="--output-last-message" (
  set "NOVA_CORE_FAKE_OUTPUT_FILE=%~2"
  shift
)
shift
goto parse
:run
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%NOVA_CORE_FAKE_SCRIPT%"
exit /b %errorlevel%
'@
    Write-Utf8 (Join-Path $fakeBin 'fake-codex.ps1') @'
$input | Out-Null
if ($env:NOVA_CORE_FAKE_CREATE_PATH) {
    $target = Join-Path $env:NOVA_CORE_FAKE_REPOSITORY $env:NOVA_CORE_FAKE_CREATE_PATH
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    [IO.File]::WriteAllText($target, $env:NOVA_CORE_FAKE_CONTENT, [Text.UTF8Encoding]::new($false))
}
if ($env:NOVA_CORE_FAKE_OUTPUT_FILE) { [IO.File]::WriteAllText($env:NOVA_CORE_FAKE_OUTPUT_FILE, $env:NOVA_CORE_FAKE_TRANSCRIPT, [Text.UTF8Encoding]::new($false)) }
exit [int]$env:NOVA_CORE_FAKE_EXIT_CODE
'@
    Push-Location $repo
    try { & git init --quiet; & git config user.email 'nova-core@example.invalid'; & git config user.name 'NOVA_CORE Test' }
    finally { Pop-Location }
    $env:PATH = "$fakeBin;$originalPath"

    $result = Invoke-TestMission (New-TestMission 'S01-success-change') 0 'allowed/success.txt'
    Add-Scenario 'S01-successful-process-with-change' ($result.OfficialStatus -eq 'READY_FOR_REVIEW') "Status=$($result.OfficialStatus)"

    $result = Invoke-TestMission (New-TestMission 'S02-no-change') 0
    Add-Scenario 'S02-no-change-classification' ($result.OfficialStatus -eq 'NO_CHANGE') "Status=$($result.OfficialStatus)"

    $result = Invoke-TestMission (New-TestMission 'S03-exit-nonzero') 7
    Add-Scenario 'S03-nonzero-exit-code' ($result.OfficialStatus -eq 'FAILED') "Status=$($result.OfficialStatus);ExitCode=$($result.ExitCode)"

    $result = Invoke-TestMission (New-TestMission 'S04-interruption') 130
    Add-Scenario 'S04-controlled-interruption' ($result.OfficialStatus -eq 'CANCELLED') "Status=$($result.OfficialStatus);ExitCode=$($result.ExitCode)"

    $compileValidation = @([PSCustomObject]@{name='compile';type='powershell';path='allowed/invalid.ps1';required=$true})
    $result = Invoke-TestMission (New-TestMission 'S05-compile-failure' $compileValidation) 0 'allowed/invalid.ps1' 'function broken {'
    Add-Scenario 'S05-compilation-failure' ($result.OfficialStatus -eq 'PARTIAL') "Status=$($result.OfficialStatus)"

    $testPath = Join-Path $tools 'Test-NovaCoreReporting.ps1'; $testBackup = [IO.File]::ReadAllText($testPath)
    try {
        $testValidation = @([PSCustomObject]@{name='tests';type='namedCommand';command='reportingUnitTests';required=$true})
        $result = Invoke-TestMission (New-TestMission 'S06-test-failure' $testValidation) 0 'tools/nova-core-runtime/Test-NovaCoreReporting.ps1' 'exit 1'
        Add-Scenario 'S06-named-test-command-failure' ($result.OfficialStatus -eq 'PARTIAL') "Status=$($result.OfficialStatus)"
    } finally { Write-Utf8 $testPath $testBackup }

    $result = Invoke-TestMission (New-TestMission 'S07-forbidden') 0 'forbidden/change.txt'
    Add-Scenario 'S07-forbidden-path-rejected' ($result.OfficialStatus -eq 'PARTIAL') "Status=$($result.OfficialStatus)"

    $result = Invoke-TestMission (New-TestMission 'S08-outside-allowlist') 0 'outside/change.txt'
    Add-Scenario 'S08-outside-allowed-path-rejected' ($result.OfficialStatus -eq 'PARTIAL') "Status=$($result.OfficialStatus)"

    $result = Invoke-TestMission (New-TestMission 'S09-missing-expected' @() @('allowed/missing.txt')) 0
    Add-Scenario 'S09-missing-expected-file-blocks' ($result.OfficialStatus -eq 'BLOCKED') "Status=$($result.OfficialStatus)"

    Write-Utf8 (Join-Path $repo 'allowed/present.txt') 'present'
    $result = Invoke-TestMission (New-TestMission 'S10-present-expected' @() @('allowed/present.txt') $false $false) 0
    Add-Scenario 'S10-present-expected-file-passes' ($result.OfficialStatus -eq 'SUCCESS') "Status=$($result.OfficialStatus)"

    $result = Invoke-TestMission (New-TestMission 'S11-transcript-contradiction') 0 'allowed/real-change.txt' 'zero files changed'
    Add-Scenario 'S11-transcript-cannot-override-git' ($result.OfficialStatus -eq 'READY_FOR_REVIEW' -and @($result.OfficialReport.Git.Created) -contains 'allowed/real-change.txt') "Status=$($result.OfficialStatus)"

    $json = Get-Content -LiteralPath $result.ReportJson -Raw | ConvertFrom-Json
    Add-Scenario 'S12-json-report-parseable' ($json.SchemaVersion -eq '1.0.0') "Schema=$($json.SchemaVersion)"

    $markdown = Get-Content -LiteralPath $result.ReportMarkdown -Raw
    Add-Scenario 'S13-markdown-has-structured-diagnostics' ($markdown -match 'Fait:' -and $markdown -match 'Action corrective:') 'Structured diagnostic fields present'

    $journalEntries = @(Get-Content -LiteralPath $result.ExecutionJournal | ForEach-Object { $_ | ConvertFrom-Json })
    Add-Scenario 'S14-journal-is-jsonl' ($journalEntries.Count -gt 0 -and @($journalEntries | Where-Object step -eq 'CODEX_EXECUTION_FINISHED').Count -eq 1) "Entries=$($journalEntries.Count)"

    $badPrompt = Join-Path $repo 'missing-prompt.md'; $failedAsExpected = $false
    try { & (Join-Path $tools 'Invoke-NovaCoreMission.ps1') -MissionFile (New-TestMission 'S15-fallback-report' @() @() $true $true $badPrompt) | Out-Null }
    catch { $failedAsExpected = $true }
    $fallbackPath = Get-ChildItem -LiteralPath $reports -Filter official-report.json -Recurse | Sort-Object LastWriteTimeUtc | Select-Object -Last 1
    $fallback = if ($fallbackPath) { Get-Content -LiteralPath $fallbackPath.FullName -Raw | ConvertFrom-Json } else { $null }
    $fallbackDiagnostic = @($fallback.Diagnostics)[0]
    Add-Scenario 'S15-pre-codex-fallback-report' ($failedAsExpected -and $fallback.Status -eq 'FAILED' -and $fallbackDiagnostic.Fact -and $fallbackDiagnostic.Consequence -and $fallbackDiagnostic.Hypothesis -and $fallbackDiagnostic.CorrectiveAction) "Report=$($fallbackPath.FullName)"
}
catch {
    Add-Scenario 'SUITE-EXECUTION' $false $_.Exception.ToString()
}
finally {
    $env:PATH = $originalPath
    Remove-Item Env:NOVA_CORE_FAKE_EXIT_CODE,Env:NOVA_CORE_FAKE_CREATE_PATH,Env:NOVA_CORE_FAKE_CONTENT,Env:NOVA_CORE_FAKE_TRANSCRIPT -ErrorAction SilentlyContinue
    if (-not $KeepTemporaryFiles) { Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue }
}

$failed = @($results | Where-Object { -not $_.Passed })
[PSCustomObject]@{ Status=$(if ($failed.Count -eq 0 -and $results.Count -eq 15) { 'SUCCESS' } else { 'FAILURE' }); Total=$results.Count; Passed=$results.Count-$failed.Count; Failed=$failed.Count; Results=$results }
if ($failed.Count -gt 0 -or $results.Count -ne 15) { exit 1 }
exit 0

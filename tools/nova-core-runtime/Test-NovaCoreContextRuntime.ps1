Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$sourceTools=$PSScriptRoot
$testRoot=Join-Path ([IO.Path]::GetTempPath()) ('nova-core-context-runtime-'+[guid]::NewGuid().ToString('N'))
$tools=Join-Path $testRoot 'tools/nova-core-runtime'
$bin=Join-Path $testRoot 'fake-bin'
$capture=Join-Path ([IO.Path]::GetTempPath()) ('nova-core-context-capture-'+[guid]::NewGuid().ToString('N')+'.txt')
$originalPath=$env:PATH
$results=[Collections.Generic.List[object]]::new()
$utf8=[Text.UTF8Encoding]::new($false)

function Add-Result([string]$Name,[bool]$Passed,[string]$Detail=''){$results.Add([PSCustomObject]@{Name=$Name;Passed=$Passed;Detail=$Detail})}
function Write-TestFile([string]$Path,[string]$Content){$parent=Split-Path -Parent $Path;if(-not(Test-Path -LiteralPath $parent)){New-Item -ItemType Directory -Path $parent -Force|Out-Null};[IO.File]::WriteAllText($Path,$Content,$utf8)}
function Write-TestJson([string]$Path,$Value){Write-TestFile $Path ($Value|ConvertTo-Json -Depth 40)}
function Get-TestHash([string]$Path){return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash}

try{
    New-Item -ItemType Directory -Path $tools,$bin -Force|Out-Null
    foreach($name in @('Invoke-NovaCoreMission.ps1','NovaCore.Reporting.psm1','NovaCore.Governance.psm1','NovaCore.ContextAssembly.psm1','Resolve-NovaCoreProfile.ps1','Test-NovaCoreMission.ps1','profiles.json','certified-facts.json')){Copy-Item -LiteralPath (Join-Path $sourceTools $name) -Destination (Join-Path $tools $name)}
    Write-TestFile (Join-Path $bin 'codex.cmd') @'
@echo off
set "NOVA_CORE_FAKE_SCRIPT=%~dp0fake-codex.ps1"
if "%~1"=="--version" (
  echo codex-cli 0.144.1
  exit /b 0
)
set "NOVA_CORE_FAKE_OUTPUT_FILE="
:parse
if "%~1"=="" goto run
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
    Write-TestFile (Join-Path $bin 'fake-codex.ps1') @'
$prompt=($input|Out-String)
[IO.File]::WriteAllText($env:NOVA_CORE_CAPTURE_PATH,$prompt,[Text.UTF8Encoding]::new($false))
if($env:NOVA_CORE_FAKE_OUTPUT_FILE){[IO.File]::WriteAllText($env:NOVA_CORE_FAKE_OUTPUT_FILE,'controlled-success',[Text.UTF8Encoding]::new($false))}
exit 0
'@
    Write-TestFile (Join-Path $tools 'mission.prompt.md') 'RUNTIME_CONTEXT_PROMPT'
    Write-TestFile (Join-Path $testRoot 'authority.md') '# authority'
    Write-TestFile (Join-Path $testRoot 'certification.md') '# certification'
    Write-TestFile (Join-Path $testRoot 'evidence.txt') 'evidence'
    New-Item -ItemType Directory -Path (Join-Path $testRoot 'Docs/output') -Force|Out-Null
    $mission=[ordered]@{
        schemaVersion='1.0.0';missionId='CTX-RUNTIME';program='PROGRAM-TEST';lot='LOT-001';title='Runtime context test';profile='FAST';repository=$testRoot;expectedBranch='master';promptFile=(Join-Path $tools 'mission.prompt.md');workingDirectory=$testRoot;reportDirectory=(Join-Path $testRoot 'reports/unit');changesExpected=$false;humanReviewRequired=$false;enabled=$true
        resourceScopes=@('Docs/output/**');allowedPaths=@('Docs/output/**');forbiddenPaths=@('.git/**','server/**');expectedFiles=@();deliverables=@()
    }
    $missionPath=Join-Path $tools 'mission.json';Write-TestJson $missionPath $mission
    & git -C $testRoot init --quiet
    & git -C $testRoot config user.email 'context@example.invalid'
    & git -C $testRoot config user.name 'Context Test'
    & git -C $testRoot add .
    & git -C $testRoot commit --quiet -m baseline
    $env:PATH="$bin;$originalPath";$env:NOVA_CORE_CAPTURE_PATH=$capture

    $historical=@(& (Join-Path $tools 'Invoke-NovaCoreMission.ps1') -MissionFile $missionPath)|Where-Object{$_.PSObject.Properties.Name -contains 'OfficialStatus'}|Select-Object -Last 1
    $historicalPrompt=[IO.File]::ReadAllText($capture,$utf8).TrimEnd("`r","`n")
    $facts=[IO.File]::ReadAllText((Join-Path $tools 'certified-facts.json'),$utf8)
    $expectedPrompt="<CERTIFIED_FACTS>`n$facts`n</CERTIFIED_FACTS>`n`nRUNTIME_CONTEXT_PROMPT"
    $historicalReport=Get-Content $historical.ReportJson -Raw|ConvertFrom-Json
    Add-Result 'historical-final-prompt-identical' ($historicalPrompt.Replace("`r`n","`n") -ceq $expectedPrompt.Replace("`r`n","`n"))
    Add-Result 'historical-profile-preserved' ($historical.Model -eq 'gpt-5.6-sol' -and $historical.Sandbox -eq 'workspace-write')
    Add-Result 'historical-report-unchanged-by-default' ($historicalReport.PSObject.Properties.Name -notcontains 'ContextAssembly')
    Add-Result 'historical-no-context-artifact' (@(Get-ChildItem (Join-Path $testRoot 'reports') -Filter 'mission-context-assembly.json' -Recurse -File).Count -eq 0)

    $enabled=@(& (Join-Path $tools 'Invoke-NovaCoreMission.ps1') -MissionFile $missionPath -ContextAssemblyEnabled)|Where-Object{$_.PSObject.Properties.Name -contains 'OfficialStatus'}|Select-Object -Last 1
    $enabledPrompt=[IO.File]::ReadAllText($capture,$utf8).TrimEnd("`r","`n").Replace("`r`n","`n")
    $enabledReport=Get-Content $enabled.ReportJson -Raw|ConvertFrom-Json
    Add-Result 'activation-context-transmitted' ($enabledPrompt.StartsWith('<NOVA_CORE_MISSION_CONTEXT>') -and $enabledPrompt.Contains('</NOVA_CORE_MISSION_CONTEXT>'))
    Add-Result 'activation-historical-prompt-preserved-as-suffix' ($enabledPrompt.EndsWith($expectedPrompt.Replace("`r`n","`n")))
    Add-Result 'activation-artifacts-produced' ((Test-Path -LiteralPath $enabledReport.ContextAssembly.ArtifactPath) -and (Test-Path -LiteralPath $enabledReport.ContextAssembly.MetricsPath))
    Add-Result 'activation-metrics-complete' ($enabledReport.ContextAssembly.Metrics.ContextAssemblyEnabled -eq $true -and $enabledReport.ContextAssembly.Metrics.CodexDurationMs -isnot [string] -and $enabledReport.ContextAssembly.Metrics.TokensTotal -eq 'UNAVAILABLE')
    Add-Result 'codex-duration-isolated' ($enabledReport.ContextAssembly.Metrics.CodexDurationMs -le $enabled.DurationMs)
    Add-Result 'functional-status-equivalent' ($historical.OfficialStatus -eq $enabled.OfficialStatus -and $historical.ExitCode -eq $enabled.ExitCode)

}
catch{Add-Result 'suite-unhandled' $false $_.Exception.ToString()}
finally{
    $env:PATH=$originalPath;Remove-Item Env:NOVA_CORE_CAPTURE_PATH -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $capture -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue
}

$failed=@($results|Where-Object{-not $_.Passed})
$failed|ForEach-Object{Write-Host("FAILED:{0}:{1}" -f $_.Name,$_.Detail)}
$summary=[PSCustomObject]@{Status=$(if($failed.Count){'FAILURE'}else{'SUCCESS'});Total=$results.Count;Passed=$results.Count-$failed.Count;Failed=$failed.Count;Results=$results}
$summary
if($failed.Count){exit 1}else{exit 0}

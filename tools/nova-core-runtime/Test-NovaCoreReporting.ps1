param([switch]$KeepTemporaryFiles)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Import-Module (Join-Path $PSScriptRoot "NovaCore.Reporting.psm1") -Force

$results = [System.Collections.Generic.List[object]]::new()
function Add-Result([string]$Name, [bool]$Passed, [string]$Message = $null) {
    $results.Add([PSCustomObject]@{ Name=$Name; Passed=$Passed; Message=$Message })
}
function Assert-Equal([string]$Name, $Actual, $Expected) {
    Add-Result -Name $Name -Passed ($Actual -eq $Expected) -Message "Expected=$Expected;Actual=$Actual"
}

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("nova-core-reporting-test-" + [guid]::NewGuid())
$backup = Join-Path ([IO.Path]::GetTempPath()) ("nova-core-reporting-backup-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tempRoot,$backup -Force | Out-Null

try {
    Push-Location $tempRoot
    try {
        & git init --quiet
        [IO.File]::WriteAllText((Join-Path $tempRoot 'existing.txt'), "before`n", [Text.UTF8Encoding]::new($false))
        & git add existing.txt
        $before = New-NovaCoreWorkspaceSnapshot -Repository $tempRoot -BackupDirectory $backup

        [IO.File]::WriteAllText((Join-Path $tempRoot 'existing.txt'), "before`nafter`n", [Text.UTF8Encoding]::new($false))
        [IO.File]::WriteAllText((Join-Path $tempRoot 'created-é.txt'), "créé`n", [Text.UTF8Encoding]::new($false))
        $after = New-NovaCoreWorkspaceSnapshot -Repository $tempRoot
        $delta = Compare-NovaCoreWorkspaceSnapshot -Before $before -After $after -Repository $tempRoot -BeforeBackupDirectory $backup

        Assert-Equal 'modified-file-detected' (@($delta.Modified) -contains 'existing.txt') $true
        Assert-Equal 'created-file-detected' (@($delta.Created) -contains 'created-é.txt') $true
        Assert-Equal 'preexisting-index-state-not-attributed' (@($delta.Created) -contains 'existing.txt') $false
        Assert-Equal 'utf8-multiline-path-supported' ($after.Files.Contains('created-é.txt')) $true
        Assert-Equal 'insertions-measured' ($delta.Insertions -ge 2) $true

        $noValidation = @()
        Assert-Equal 'classification-failed' (Get-NovaCoreClassification -ExitCode 1 -TechnicalStatus FAILURE -Delta $delta -Validations $noValidation -ReviewRequired $true -ChangesExpected $true) 'FAILED'
        Assert-Equal 'classification-cancelled' (Get-NovaCoreClassification -ExitCode 130 -TechnicalStatus CANCELLED -Delta $delta -Validations $noValidation -ReviewRequired $true -ChangesExpected $true) 'CANCELLED'
        Assert-Equal 'classification-ready-review' (Get-NovaCoreClassification -ExitCode 0 -TechnicalStatus SUCCESS -Delta $delta -Validations $noValidation -ReviewRequired $true -ChangesExpected $true) 'READY_FOR_REVIEW'

        $emptyDelta = [PSCustomObject]@{ Created=@(); Modified=@(); Deleted=@(); Renamed=@() }
        Assert-Equal 'classification-no-change' (Get-NovaCoreClassification -ExitCode 0 -TechnicalStatus SUCCESS -Delta $emptyDelta -Validations $noValidation -ReviewRequired $true -ChangesExpected $true) 'NO_CHANGE'

        $failedValidation = @([PSCustomObject]@{ Required=$true; Passed=$false; Message='EXPECTED_FAILURE' })
        Assert-Equal 'classification-partial' (Get-NovaCoreClassification -ExitCode 0 -TechnicalStatus SUCCESS -Delta $delta -Validations $failedValidation -ReviewRequired $true -ChangesExpected $true) 'PARTIAL'
        Assert-Equal 'classification-blocked' (Get-NovaCoreClassification -ExitCode 0 -TechnicalStatus SUCCESS -Delta $emptyDelta -Validations $failedValidation -ReviewRequired $true -ChangesExpected $true) 'BLOCKED'

        $fakeTranscript = 'zero files created'
        Assert-Equal 'transcript-does-not-override-git' (@($delta.Created).Count -eq 1 -and $fakeTranscript -match 'zero') $true
        $dynamicDelta = [PSCustomObject]@{
            Created=@('server/nova-core/new.ts')
            Modified=@('apps/nova-web/src/App.tsx','tools/nova-core-runtime/NovaCore.Reporting.psm1')
            Deleted=@()
            Renamed=@()
        }
        $dynamicNames = @(Get-NovaCoreDynamicValidations -Delta $dynamicDelta | ForEach-Object { $_.name })
        Assert-Equal 'dynamic-validation-server-tests' ($dynamicNames -contains 'nova-core-tests') $true
        Assert-Equal 'dynamic-validation-web-build' ($dynamicNames -contains 'nova-web-build') $true
        Assert-Equal 'dynamic-validation-runtime-e2e' ($dynamicNames -contains 'nova-runtime-e2e') $true
        Add-Result 'scope-grammar-parity' (
            (Test-NovaCoreRelativePathMatch -Path 'server\nova-core\http\route.ts' -Pattern 'server/nova-core/**') -and
            (Test-NovaCoreRelativePathMatch -Path 'SERVER\NOVA-CORE\HTTP\route.ts' -Pattern 'server/nova-core/**') -and
            -not (Test-NovaCoreRelativePathMatch -Path 'server/nova-core-sibling/route.ts' -Pattern 'server/nova-core/**') -and
            (Test-NovaCoreRelativePathMatch -Path 'apps/nova-web/src/App.tsx' -Pattern 'apps/*/src/*.tsx')
        )
        Add-Result 'scope-windows-file-case-parity' (
            (Test-NovaCoreRelativePathMatch -Path 'C:\DEV\NOVA\File.ts' -Pattern 'c:/dev/nova/file.ts') -and
            -not (Test-NovaCoreRelativePathMatch -Path 'C:\DEV\NOVA-OLD\File.ts' -Pattern 'c:/dev/nova/**')
        )

        $syntaxTest = Join-Path $tempRoot 'tools/nova-core-runtime/Test-NovaCoreSyntax.ps1'
        New-Item -ItemType Directory -Path (Split-Path -Parent $syntaxTest) -Force | Out-Null
        [IO.File]::WriteAllText(
            $syntaxTest,
            "[Console]::Out.Write('o' * 1000101); [Console]::Error.Write('e' * 1000101); exit 0",
            [Text.UTF8Encoding]::new($false)
        )
        $largeOutput = Invoke-NovaCoreNamedCommand -Name 'powershellSyntax' -Repository $tempRoot
        Add-Result 'named-command-concurrent-bounded-streams' (
            $largeOutput.Passed -and ([regex]::Matches($largeOutput.Message, '\[TRUNCATED\]')).Count -eq 2
        )

        [IO.File]::WriteAllText($syntaxTest, "Start-Sleep -Seconds 5; exit 0", [Text.UTF8Encoding]::new($false))
        $previousTimeout = $env:NOVA_CORE_VALIDATION_TIMEOUT_MS
        try {
            $env:NOVA_CORE_VALIDATION_TIMEOUT_MS = '100'
            $timedOut = Invoke-NovaCoreNamedCommand -Name 'powershellSyntax' -Repository $tempRoot
            Add-Result 'named-command-timeout-kills-process-tree' (
                -not $timedOut.Passed -and $timedOut.TimedOut -and $timedOut.Message -match 'NOVA_CORE_VALIDATION_TIMEOUT'
            )
        }
        finally {
            if ($null -eq $previousTimeout) { Remove-Item Env:NOVA_CORE_VALIDATION_TIMEOUT_MS -ErrorAction SilentlyContinue }
            else { $env:NOVA_CORE_VALIDATION_TIMEOUT_MS = $previousTimeout }
        }
    }
    finally { Pop-Location }
}
catch {
    Add-Result -Name 'suite-execution' -Passed $false -Message $_.Exception.Message
}
finally {
    if (-not $KeepTemporaryFiles) { Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue }
    if (-not $KeepTemporaryFiles) { Remove-Item -LiteralPath $backup -Recurse -Force -ErrorAction SilentlyContinue }
}

$failed = @($results | Where-Object { -not $_.Passed })
[PSCustomObject]@{
    Status = if ($failed.Count -eq 0) { 'SUCCESS' } else { 'FAILURE' }
    Total = $results.Count
    Passed = $results.Count - $failed.Count
    Failed = $failed.Count
    Results = $results
}

if ($failed.Count -gt 0) { exit 1 }
exit 0

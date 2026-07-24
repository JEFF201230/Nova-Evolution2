param([switch]$KeepTemporaryFiles)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$runtimePath = Join-Path $PSScriptRoot 'Invoke-NovaCoreMission.ps1'
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('nova-core-exception-test-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

$results = [System.Collections.Generic.List[object]]::new()
function Add-Result([string]$Name, [bool]$Passed, [string]$Message = $null) {
    $results.Add([PSCustomObject]@{ Name=$Name; Passed=$Passed; Message=$Message })
}

try {
    $tokens = $null
    $parseErrors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($runtimePath, [ref]$tokens, [ref]$parseErrors)
    if ($parseErrors.Count -gt 0) {
        throw ($parseErrors | ForEach-Object Message) -join '; '
    }

    $functionNames = @(
        'Write-NovaCoreJournalLine',
        'Write-ExecutionJournalEntry',
        'Write-NovaCoreExceptionJournalEntry',
        'Test-NovaCoreExceptionJournaled',
        'Invoke-NovaCoreInstrumentedStage'
    )
    foreach ($functionName in $functionNames) {
        $definition = $ast.Find({
            param($node)
            $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $functionName
        }, $true)
        if ($null -eq $definition) { throw "FUNCTION_NOT_FOUND:$functionName" }
        Invoke-Expression $definition.Extent.Text
    }

    $script:journalPath = Join-Path $tempRoot 'execution-journal.jsonl'
    $script:NovaCoreMissionContext = [PSCustomObject]@{
        MissionId='TEST-MISSION'; Program='TEST-PROGRAM'; Lot='TEST-LOT'; Repository=$tempRoot; WorkingDirectory=$tempRoot
    }

    foreach ($case in @(
        [PSCustomObject]@{ Step='CAPTURE_GIT_BEFORE'; Exception=[System.InvalidOperationException]::new('before failed') },
        [PSCustomObject]@{ Step='CAPTURE_GIT_AFTER'; Exception=[System.UnauthorizedAccessException]::new('after failed') },
        [PSCustomObject]@{ Step='VALIDATION'; Exception=[System.OperationCanceledException]::new('execution interrupted') }
    )) {
        try {
            Invoke-NovaCoreInstrumentedStage -StageName $case.Step -Repository $tempRoot -Action { throw $case.Exception }
        }
        catch {
            $entries = @(Get-Content $script:journalPath | ForEach-Object { $_ | ConvertFrom-Json })
            $failure = @($entries | Where-Object { $_.Status -eq 'FAILURE' -and $_.Step -eq $case.Step })[-1]
            Add-Result "$($case.Step)-persisted-before-rethrow" ($null -ne $failure)
            Add-Result "$($case.Step)-exception-type" ($failure.ExceptionType -eq $case.Exception.GetType().FullName) "Actual=$($failure.ExceptionType)"
            Add-Result "$($case.Step)-message" ($failure.Message -eq $case.Exception.Message) "Actual=$($failure.Message)"
            Add-Result "$($case.Step)-stack-when-available" (-not [string]::IsNullOrWhiteSpace([string]$failure.StackTrace))
        }
    }

    $failureEntries = @(Get-Content $script:journalPath | ForEach-Object { $_ | ConvertFrom-Json } | Where-Object Status -eq 'FAILURE')
    Add-Result 'all-independent-failures-persisted' ($failureEntries.Count -eq 3) "Count=$($failureEntries.Count)"
}
catch {
    Add-Result 'suite-execution' $false $_.Exception.Message
}
finally {
    if (-not $KeepTemporaryFiles) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
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

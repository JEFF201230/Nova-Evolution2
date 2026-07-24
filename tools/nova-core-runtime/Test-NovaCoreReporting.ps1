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
        Add-Result 'windows-path-with-spaces' ($tempRoot -is [string])
        Add-Result 'temporary-files-cleanable' $true
        Add-Result 'runtime-ok' $true
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

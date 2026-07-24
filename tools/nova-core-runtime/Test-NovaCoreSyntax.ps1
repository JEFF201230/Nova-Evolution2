Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$errors = [Collections.Generic.List[object]]::new()
foreach ($file in @(Get-ChildItem -LiteralPath $PSScriptRoot -File | Where-Object Extension -in @('.ps1','.psm1'))) {
    $tokens = $null
    $parseErrors = $null
    [void][Management.Automation.Language.Parser]::ParseFile($file.FullName, [ref]$tokens, [ref]$parseErrors)
    foreach ($parseError in @($parseErrors)) {
        $errors.Add([PSCustomObject]@{ File=$file.Name; Line=$parseError.Extent.StartLineNumber; Message=$parseError.Message })
    }
}

[PSCustomObject]@{ Status=$(if ($errors.Count -eq 0) { 'SUCCESS' } else { 'FAILURE' }); Files=@(Get-ChildItem -LiteralPath $PSScriptRoot -File | Where-Object Extension -in @('.ps1','.psm1')).Count; Errors=$errors }
if ($errors.Count -gt 0) { exit 1 }
exit 0

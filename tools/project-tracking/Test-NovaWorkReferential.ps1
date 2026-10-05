$ErrorActionPreference = 'Stop'

$Repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$Script = Join-Path $Repository 'tools\project-tracking\Resolve-NovaWorkReferential.ps1'
if (-not (Test-Path -LiteralPath $Script -PathType Leaf)) { throw 'RECONCILER_NOT_FOUND' }

$tokens = $null
$errors = $null
[void][System.Management.Automation.Language.Parser]::ParseFile($Script, [ref]$tokens, [ref]$errors)
if (@($errors).Count -gt 0) {
    throw ('RECONCILER_SYNTAX_INVALID:' + (($errors | ForEach-Object Message) -join '; '))
}

$content = Get-Content -LiteralPath $Script -Raw
$required = @(
    'legacyIsReadOnly = $true',
    'certificationsAreReadOnly = $true',
    'automaticCertificationForbidden = $true',
    "'WORK_DECISIONS'",
    "'WORK_DELIVERABLES'",
    "'WORK_SOURCES'",
    "'CONNECT_EXISTING'",
    "'HUMAN_REVIEW_REQUIRED'"
)
foreach ($marker in $required) {
    if (-not $content.Contains($marker)) { throw "RECONCILER_CONTRACT_MISSING:$marker" }
}

Write-Host 'WORK_REFERENTIAL_RECONCILER_STATIC_TEST_PASS'

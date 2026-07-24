param(
    [Parameter(Mandatory = $true)]
    [string]$ProfileName,

    [string]$ProfilesFile
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $PSBoundParameters.ContainsKey("ProfilesFile")) {
    $ProfilesFile = "$PSScriptRoot\profiles.json"
}

if (-not (Test-Path $ProfilesFile)) {
    throw "NOVA_CORE_PROFILE_REGISTRY_NOT_FOUND"
}

$profileAliases = @{
    "PROGRAM_ORCHESTRATION_HIGH_COMPLEXITY" = "ARCHITECTURE"
}

if ($profileAliases.ContainsKey($ProfileName)) {
    $ProfileName = $profileAliases[$ProfileName]
}

$registry = Get-Content $ProfilesFile -Raw | ConvertFrom-Json

if (-not $registry.profiles.PSObject.Properties.Name.Contains($ProfileName)) {
    throw "NOVA_CORE_PROFILE_UNKNOWN"
}

$profile = $registry.profiles.$ProfileName

return [PSCustomObject]@{
    Name             = $ProfileName
    Model            = $profile.model
    ReasoningEffort  = $profile.reasoningEffort
    Sandbox          = $profile.sandbox
    ApprovalPolicy   = $profile.approvalPolicy
}

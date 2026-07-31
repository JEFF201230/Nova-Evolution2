param(
    [string]$MissionFile = "$PSScriptRoot\mission.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $MissionFile)) {
    throw "NOVA_CORE_MISSION_FILE_NOT_FOUND"
}

$mission = Get-Content $MissionFile -Raw | ConvertFrom-Json

$requiredProperties = @(
    "schemaVersion",
    "missionId",
    "program",
    "lot",
    "title",
    "profile",
    "repository",
    "expectedBranch",
    "promptFile",
    "workingDirectory",
    "enabled"
)

foreach ($property in $requiredProperties) {
    if (-not $mission.PSObject.Properties.Name.Contains($property)) {
        throw "NOVA_CORE_MISSION_PROPERTY_MISSING:$property"
    }
}

if (-not $mission.enabled) {
    throw "NOVA_CORE_MISSION_DISABLED"
}

if (-not (Test-Path $mission.repository)) {
    throw "NOVA_CORE_REPOSITORY_NOT_FOUND"
}

if (-not (Test-Path $mission.workingDirectory)) {
    throw "NOVA_CORE_WORKING_DIRECTORY_NOT_FOUND"
}

if (-not (Test-Path $mission.promptFile)) {
    throw "NOVA_CORE_PROMPT_FILE_NOT_FOUND"
}

$resolvedRepository = (Resolve-Path $mission.repository).Path
$resolvedWorkingDirectory = (Resolve-Path $mission.workingDirectory).Path

if ($resolvedRepository -ne $resolvedWorkingDirectory) {
    throw "NOVA_CORE_WORKING_DIRECTORY_OUTSIDE_REPOSITORY"
}

$profileResolver = Join-Path $PSScriptRoot "Resolve-NovaCoreProfile.ps1"

if (-not (Test-Path $profileResolver)) {
    throw "NOVA_CORE_PROFILE_RESOLVER_NOT_FOUND"
}

$profile = & $profileResolver -ProfileName $mission.profile

$allowedValidationTypes = @(
    "fileExists",
    "fileAbsent",
    "json",
    "utf8",
    "powershell",
    "gitDiffCheck",
    "namedCommand"
)
$allowedNamedCommands = @(
    'powershellSyntax',
    'reportingUnitTests',
    'exceptionCaptureTests',
    'runtimeE2ETests',
    'novaCoreTests',
    'novaCoreTypecheck',
    'novaWebTests',
    'novaWebTypecheck',
    'novaWebBuild',
    'veeddaRootTests',
    'veeddaClientCheck',
    'veeddaClientBuild',
    'veeddaServerBuild'
)

if ($mission.PSObject.Properties.Name.Contains("validations")) {
    foreach ($validation in @($mission.validations)) {
        if (-not $validation.PSObject.Properties.Name.Contains("name") -or
            -not $validation.PSObject.Properties.Name.Contains("type")) {
            throw "NOVA_CORE_VALIDATION_CONTRACT_INVALID"
        }
        if ($validation.type -notin $allowedValidationTypes) {
            throw "NOVA_CORE_VALIDATION_TYPE_NOT_ALLOWED:$($validation.type)"
        }
        if ($validation.type -eq 'namedCommand') {
            if (-not $validation.PSObject.Properties.Name.Contains('command') -or $validation.command -notin $allowedNamedCommands) {
                throw "NOVA_CORE_NAMED_COMMAND_NOT_ALLOWED:$($validation.command)"
            }
        }
        elseif ($validation.type -ne "gitDiffCheck") {
            if (-not $validation.PSObject.Properties.Name.Contains("path")) {
                throw "NOVA_CORE_VALIDATION_PATH_MISSING:$($validation.name)"
            }
            $candidatePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedRepository $validation.path))
            if (-not $candidatePath.StartsWith($resolvedRepository, [System.StringComparison]::OrdinalIgnoreCase)) {
                throw "NOVA_CORE_VALIDATION_PATH_OUTSIDE_REPOSITORY:$($validation.name)"
            }
        }
    }
}

foreach ($scopeProperty in @('allowedPaths','forbiddenPaths','expectedFiles')) {
    if ($mission.PSObject.Properties.Name.Contains($scopeProperty)) {
        foreach ($path in @($mission.$scopeProperty)) {
            if ([string]::IsNullOrWhiteSpace([string]$path) -or [IO.Path]::IsPathRooted([string]$path) -or ([string]$path -match '(^|[\\/])\.\.([\\/]|$)')) {
                throw "NOVA_CORE_MANIFEST_PATH_INVALID:${scopeProperty}:$path"
            }
        }
    }
}

if ($mission.PSObject.Properties.Name.Contains('inputEvidence')) {
    if ($mission.inputEvidence -isnot [Array]) {
        throw 'NOVA_CORE_INPUT_EVIDENCE_CONTRACT_INVALID'
    }
    $inputEvidenceIds = @{}
    foreach ($evidence in @($mission.inputEvidence)) {
        foreach ($property in @('evidenceId','path','kind','sha256')) {
            if (-not $evidence.PSObject.Properties.Name.Contains($property) -or [string]::IsNullOrWhiteSpace([string]$evidence.$property)) {
                throw "NOVA_CORE_INPUT_EVIDENCE_PROPERTY_MISSING:$property"
            }
        }
        if ($inputEvidenceIds.ContainsKey([string]$evidence.evidenceId)) {
            throw "NOVA_CORE_INPUT_EVIDENCE_DUPLICATE:$($evidence.evidenceId)"
        }
        $inputEvidenceIds[[string]$evidence.evidenceId] = $true
        if ([IO.Path]::IsPathRooted([string]$evidence.path) -or [string]$evidence.path -match '(^|[\\/])\.\.([\\/]|$)') {
            throw "NOVA_CORE_INPUT_EVIDENCE_PATH_INVALID:$($evidence.path)"
        }
        if ([string]$evidence.sha256 -notmatch '^[A-Fa-f0-9]{64}$') {
            throw "NOVA_CORE_INPUT_EVIDENCE_SHA256_INVALID:$($evidence.evidenceId)"
        }
    }
}

if ($mission.PSObject.Properties.Name.Contains("reportDirectory")) {
    $reportDirectory = [System.IO.Path]::GetFullPath([string]$mission.reportDirectory)
    $repositoryBoundary = $resolvedRepository.TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar
    $reportInsideRepository = $reportDirectory.Equals(
        $resolvedRepository,
        [System.StringComparison]::OrdinalIgnoreCase
    ) -or $reportDirectory.StartsWith(
        $repositoryBoundary,
        [System.StringComparison]::OrdinalIgnoreCase
    )
    if (-not $reportInsideRepository) {
        if ($mission.PSObject.Properties.Name -notcontains 'artifactRoot') {
            throw "NOVA_CORE_ARTIFACT_ROOT_REQUIRED"
        }
        $artifactRoot = [System.IO.Path]::GetFullPath([string]$mission.artifactRoot).TrimEnd('\','/')
        $artifactBoundary = $artifactRoot + [IO.Path]::DirectorySeparatorChar
        $reportInsideArtifactRoot = $reportDirectory.Equals(
            $artifactRoot,
            [System.StringComparison]::OrdinalIgnoreCase
        ) -or $reportDirectory.StartsWith(
            $artifactBoundary,
            [System.StringComparison]::OrdinalIgnoreCase
        )
        if (-not $reportInsideArtifactRoot) {
            throw "NOVA_CORE_REPORT_DIRECTORY_OUTSIDE_ARTIFACT_ROOT"
        }
    }
}

Push-Location $mission.workingDirectory

try {
    $currentBranch = (git branch --show-current).Trim()

    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        throw "NOVA_CORE_GIT_BRANCH_UNRESOLVED"
    }

    if ($currentBranch -ne $mission.expectedBranch) {
        throw "NOVA_CORE_GIT_BRANCH_MISMATCH:EXPECTED=$($mission.expectedBranch);ACTUAL=$currentBranch"
    }
}
finally {
    Pop-Location
}

return [PSCustomObject]@{
    MissionId       = $mission.missionId
    Program         = $mission.program
    Lot             = $mission.lot
    Title           = $mission.title
    Profile         = $profile.Name
    Model           = $profile.Model
    ReasoningEffort = $profile.ReasoningEffort
    Sandbox         = $profile.Sandbox
    ApprovalPolicy  = $profile.ApprovalPolicy
    Repository      = $resolvedRepository
    Branch          = $currentBranch
    PromptFile      = (Resolve-Path $mission.promptFile).Path
    Status          = "VALID"
}

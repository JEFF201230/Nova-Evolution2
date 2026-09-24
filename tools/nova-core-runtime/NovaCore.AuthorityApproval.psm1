Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:Utf8NoBom = [Text.UTF8Encoding]::new($false)

Import-Module (Join-Path $PSScriptRoot 'NovaCore.Governance.psm1')

function Test-NovaCoreApprovalProperty {
    param($Value, [Parameter(Mandatory)][string]$Name)
    return $null -ne $Value -and $Value.PSObject.Properties.Name -contains $Name
}

function Resolve-NovaCoreApprovalContainedPath {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$ErrorCode
    )
    $resolvedRoot = [IO.Path]::GetFullPath($Root).TrimEnd('\','/')
    $resolvedPath = [IO.Path]::GetFullPath($Path)
    $prefix = $resolvedRoot + [IO.Path]::DirectorySeparatorChar
    if (-not $resolvedPath.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
        throw $ErrorCode
    }
    return $resolvedPath
}

function Read-NovaCoreVerifiedOfficialReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$ReportPath
    )
    $repositoryRoot = [IO.Path]::GetFullPath($Repository)
    $reportsRoot = Join-Path $repositoryRoot '.nova-data\execution\reports'
    $resolvedReportPath = Resolve-NovaCoreApprovalContainedPath `
        -Root $reportsRoot -Path $ReportPath `
        -ErrorCode 'NOVA_CORE_AUTHORITY_REPORT_OUTSIDE_RUNTIME_REPORTS'
    if ([IO.Path]::GetFileName($resolvedReportPath) -cne 'official-report.json' -or
        -not (Test-Path -LiteralPath $resolvedReportPath -PathType Leaf)) {
        throw 'NOVA_CORE_AUTHORITY_OFFICIAL_REPORT_REQUIRED'
    }
    try {
        $report = [IO.File]::ReadAllText($resolvedReportPath, $script:Utf8NoBom) |
            ConvertFrom-Json
    }
    catch { throw 'NOVA_CORE_AUTHORITY_OFFICIAL_REPORT_INVALID' }
    foreach ($name in @(
        'Mission','ReportFingerprint','InputEvidence','OutputEvidence',
        'Validations','TechnicalClassification','FinalAuthority'
    )) {
        if (-not (Test-NovaCoreApprovalProperty $report $name)) {
            throw "NOVA_CORE_AUTHORITY_REPORT_PROPERTY_MISSING:$name"
        }
    }
    foreach ($name in @('MissionId','Program','Lot')) {
        if (-not (Test-NovaCoreApprovalProperty $report.Mission $name) -or
            [string]$report.Mission.$name -cnotmatch '^[A-Z0-9][A-Z0-9._-]*$') {
            throw "NOVA_CORE_AUTHORITY_REPORT_IDENTITY_INVALID:$name"
        }
    }
    $missionReportsRoot = Join-Path (Join-Path $reportsRoot ([string]$report.Mission.Program)) `
        ([string]$report.Mission.MissionId)
    $expectedRunRoot = Split-Path -Parent $resolvedReportPath
    if ([IO.Path]::GetFullPath((Split-Path -Parent $expectedRunRoot)).TrimEnd('\','/') -cne
        [IO.Path]::GetFullPath($missionReportsRoot).TrimEnd('\','/')) {
        throw 'NOVA_CORE_AUTHORITY_REPORT_IDENTITY_PATH_MISMATCH'
    }
    $latestReport = @(Get-ChildItem -LiteralPath $missionReportsRoot -Directory |
        Where-Object { $_.Name -cmatch '^bootstrap-[0-9]{8}T[0-9]{9}$' } |
        Sort-Object Name -Descending |
        ForEach-Object { Join-Path $_.FullName 'official-report.json' } |
        Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
        Select-Object -First 1)
    if ($latestReport.Count -ne 1 -or
        [IO.Path]::GetFullPath([string]$latestReport[0]) -cne $resolvedReportPath) {
        throw 'NOVA_CORE_AUTHORITY_REPORT_STALE'
    }
    if ([string]$report.ReportFingerprint -cnotmatch '^[A-F0-9]{64}$') {
        throw 'NOVA_CORE_AUTHORITY_REPORT_FINGERPRINT_INVALID'
    }
    $recomputed = Get-NovaCoreOfficialReportFingerprint -Report $report
    if ([string]$report.ReportFingerprint -cne [string]$recomputed) {
        throw 'NOVA_CORE_AUTHORITY_REPORT_FINGERPRINT_MISMATCH'
    }
    if ([string]$report.InputEvidence.status -cne 'VALID' -or
        [string]$report.OutputEvidence.status -cne 'VALID' -or
        [string]$report.FinalAuthority.evidenceStatus -cne 'VALID') {
        throw 'NOVA_CORE_AUTHORITY_EVIDENCE_INVALID'
    }
    $failed = @($report.Validations | Where-Object {
        $_.Required -and -not $_.Passed
    })
    if ($failed.Count -ne 0) {
        throw 'NOVA_CORE_AUTHORITY_REQUIRED_VALIDATION_FAILED'
    }
    if ([string]$report.TechnicalClassification -cne 'READY_FOR_REVIEW' -or
        [string]$report.FinalAuthority.reviewRequirement -cne 'HUMAN_REVIEW_REQUIRED' -or
        [string]$report.FinalAuthority.authorityDecision -cne 'PENDING_REVIEW' -or
        [string]$report.FinalAuthority.finalMissionState -cne 'READY_FOR_REVIEW') {
        throw 'NOVA_CORE_AUTHORITY_REPORT_NOT_REVIEWABLE'
    }
    return [PSCustomObject][ordered]@{
        Path = $resolvedReportPath
        Report = $report
        Fingerprint = [string]$recomputed
    }
}

function Assert-NovaCoreCurrentAuthorityRatificationAuthorization {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)]$Report,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId,
        [Parameter(Mandatory)][string]$Authority
    )
    if ($DomainId -cnotmatch '^[A-Z][A-Z0-9_-]*$' -or
        $LotId -cnotmatch '^[A-Z0-9][A-Z0-9_-]*$') {
        throw 'NOVA_CORE_AUTHORITY_TARGET_INVALID'
    }
    if ($Authority -cne 'PROGRAM_OWNER') {
        throw 'NOVA_CORE_AUTHORITY_UNAUTHORIZED'
    }
    if ([string]$Report.Mission.Lot -cne $LotId) {
        throw 'NOVA_CORE_AUTHORITY_REPORT_TARGET_MISMATCH'
    }
    $certificatePath = Join-Path ([IO.Path]::GetFullPath($Repository)) `
        "Docs\12_CERTIFICATION\$DomainId\$LotId.certification.json"
    if (-not (Test-Path -LiteralPath $certificatePath -PathType Leaf)) {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_CERTIFICATE_REQUIRED'
    }
    try {
        $certificate = [IO.File]::ReadAllText($certificatePath, $script:Utf8NoBom) |
            ConvertFrom-Json
    }
    catch { throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_CERTIFICATE_INVALID' }
    foreach ($name in @(
        'MissionId','DomainId','LotId','Status','Evidence','CertificationOrigin',
        'HistoricalCertificationProvenance','CapabilityValidation',
        'AuthorityDecisionId','HistoricalMissionId','HistoricalCertifiedAt'
    )) {
        if (-not (Test-NovaCoreApprovalProperty $certificate $name)) {
            throw "NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_PROPERTY_MISSING:$name"
        }
    }
    if ([string]$certificate.DomainId -cne $DomainId -or
        [string]$certificate.LotId -cne $LotId -or
        [string]$certificate.MissionId -cne [string]$Report.Mission.MissionId -or
        [string]$certificate.Status -cne 'CERTIFIED' -or
        [string]$certificate.CertificationOrigin -cne 'CURRENT_AUTHORITY_RATIFICATION' -or
        [string]$certificate.HistoricalCertificationProvenance -cne 'UNAVAILABLE' -or
        [string]$certificate.CapabilityValidation -cne 'RATIFIED' -or
        $null -ne $certificate.HistoricalMissionId -or
        $null -ne $certificate.HistoricalCertifiedAt) {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_NOT_AUTHORIZED'
    }
    $authorityEvidence = @($certificate.Evidence | Where-Object {
        [string]$_ -cmatch '^AUTHORITY:'
    })
    if ($authorityEvidence.Count -ne 1) {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_AUTHORITY_EVIDENCE_REQUIRED'
    }
    $match = [regex]::Match(
        [string]$authorityEvidence[0],
        '^AUTHORITY:(?<path>.+)#SHA256=(?<hash>[A-F0-9]{64})$',
        [Text.RegularExpressions.RegexOptions]::CultureInvariant
    )
    if (-not $match.Success) {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_AUTHORITY_EVIDENCE_INVALID'
    }
    $relativeEvidencePath = $match.Groups['path'].Value.Replace('/','\')
    if ([IO.Path]::IsPathRooted($relativeEvidencePath) -or
        $relativeEvidencePath -match '(^|[\\])\.\.([\\]|$)') {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_AUTHORITY_EVIDENCE_INVALID'
    }
    $evidencePath = Resolve-NovaCoreApprovalContainedPath `
        -Root $Repository -Path (Join-Path $Repository $relativeEvidencePath) `
        -ErrorCode 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_AUTHORITY_EVIDENCE_INVALID'
    if (-not (Test-Path -LiteralPath $evidencePath -PathType Leaf)) {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_AUTHORITY_EVIDENCE_MISSING'
    }
    $actualHash = (Get-FileHash -LiteralPath $evidencePath -Algorithm SHA256).Hash
    if ($actualHash -cne $match.Groups['hash'].Value) {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_AUTHORITY_EVIDENCE_HASH_MISMATCH'
    }
    $authorityText = [IO.File]::ReadAllText($evidencePath, $script:Utf8NoBom)
    if ($authorityText -notmatch [regex]::Escape([string]$certificate.AuthorityDecisionId) -or
        $authorityText -notmatch '(?im)^\s*(?:Status|Decision status|DECISION_STATUS)\s*:\s*(?:\r?\n\s*)?APPROVED\s*[.]?\s*$' -or
        $authorityText -notmatch '(?im)^\s*Authority\s*:\s*(?:\r?\n\s*)?PROGRAM[ _]OWNER\b' -or
        $authorityText -notmatch '(?im)^\s*(?:Current canonical authority ratification|CURRENT_AUTHORITY_RATIFICATION)\s*:\s*(?:\r?\n\s*)?AUTHORIZED[.]?\s*$') {
        throw 'NOVA_CORE_CURRENT_AUTHORITY_RATIFICATION_AUTHORITY_NOT_PROVEN'
    }
    return [PSCustomObject][ordered]@{
        Certificate = $certificate
        CertificatePath = $certificatePath
        AuthorityEvidencePath = $evidencePath
        AuthorityEvidenceSha256 = $actualHash
    }
}

function Write-NovaCoreAuthorityReviewRecord {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$HistoryPath,
        [Parameter(Mandatory)]$Record
    )
    $directory = Split-Path -Parent $HistoryPath
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        throw 'NOVA_CORE_AUTHORITY_HISTORY_DIRECTORY_MISSING'
    }
    $lockPath = $HistoryPath + '.lock'
    $lock = $null
    try {
        try {
            $lock = [IO.FileStream]::new(
                $lockPath,[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,
                [IO.FileShare]::None,4096,[IO.FileOptions]::WriteThrough
            )
        }
        catch { throw 'NOVA_CORE_AUTHORITY_HISTORY_LOCKED' }
        $existing = @()
        if (Test-Path -LiteralPath $HistoryPath -PathType Leaf) {
            $existing = @([IO.File]::ReadAllLines($HistoryPath, $script:Utf8NoBom) |
                Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
                ForEach-Object { $_ | ConvertFrom-Json })
        }
        $matches = @($existing | Where-Object {
            [string]$_.reportFingerprint -ceq [string]$Record.reportFingerprint -and
            [string]$_.authority -ceq [string]$Record.authority
        })
        if ($matches.Count -gt 1) {
            throw 'NOVA_CORE_AUTHORITY_IDEMPOTENCY_CONFLICT'
        }
        if ($matches.Count -eq 1) {
            if ([string]$matches[0].decision -cne [string]$Record.decision -or
                [string]$matches[0].missionId -cne [string]$Record.missionId -or
                [string]$matches[0].domainId -cne [string]$Record.domainId -or
                [string]$matches[0].lotId -cne [string]$Record.lotId) {
                throw 'NOVA_CORE_AUTHORITY_IDEMPOTENCY_CONFLICT'
            }
            return [PSCustomObject][ordered]@{ Status='ALREADY_RECORDED'; Record=$matches[0] }
        }
        $line = ($Record | ConvertTo-Json -Depth 20 -Compress) + [Environment]::NewLine
        $bytes = $script:Utf8NoBom.GetBytes($line)
        $stream = [IO.FileStream]::new(
            $HistoryPath,[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::Write,
            [IO.FileShare]::Read,4096,[IO.FileOptions]::WriteThrough
        )
        try {
            [void]$stream.Seek(0,[IO.SeekOrigin]::End)
            $stream.Write($bytes,0,$bytes.Length)
            $stream.Flush($true)
        }
        finally { $stream.Dispose() }
        return [PSCustomObject][ordered]@{ Status='RECORDED'; Record=$Record }
    }
    finally {
        if ($null -ne $lock) { $lock.Dispose() }
        if (Test-Path -LiteralPath $lockPath -PathType Leaf) {
            Remove-Item -LiteralPath $lockPath -Force
        }
    }
}

function Invoke-NovaCoreCurrentAuthorityRatificationReview {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Repository,
        [Parameter(Mandatory)][string]$ReportPath,
        [Parameter(Mandatory)][string]$DomainId,
        [Parameter(Mandatory)][string]$LotId,
        [Parameter(Mandatory)][ValidateSet('ACCEPTED','REJECTED')][string]$Decision,
        [Parameter(Mandatory)][string]$Authority
    )
    $verified = Read-NovaCoreVerifiedOfficialReport $Repository $ReportPath
    $authorization = Assert-NovaCoreCurrentAuthorityRatificationAuthorization `
        $Repository $verified.Report $DomainId $LotId $Authority
    $review = [PSCustomObject][ordered]@{
        decision = $Decision
        authority = $Authority
        reportFingerprint = $verified.Fingerprint
        decidedAt = [DateTimeOffset]::UtcNow.ToString('o')
    }
    $finalAuthority = Resolve-NovaCoreFinalAuthorityDecision `
        -TechnicalClassification ([string]$verified.Report.TechnicalClassification) `
        -ValidationResults @($verified.Report.Validations) `
        -EvidenceStatus ([string]$verified.Report.OutputEvidence.status) `
        -ReviewRequired $true `
        -AuthorityReview $review `
        -ReportFingerprint $verified.Fingerprint
    if ([string]$finalAuthority.authorityDecision -cne $Decision) {
        throw 'NOVA_CORE_AUTHORITY_DECISION_MISMATCH'
    }
    $record = [PSCustomObject][ordered]@{
        schemaVersion = '1.0.0'
        eventType = 'STRUCTURED_HUMAN_AUTHORITY_DECISION'
        missionId = [string]$verified.Report.Mission.MissionId
        programId = [string]$verified.Report.Mission.Program
        domainId = $DomainId
        lotId = $LotId
        certificationOrigin = 'CURRENT_AUTHORITY_RATIFICATION'
        authorityDecisionId = [string]$authorization.Certificate.AuthorityDecisionId
        reportFingerprint = $verified.Fingerprint
        decision = $Decision
        authority = $Authority
        decidedAt = [string]$finalAuthority.decidedAt
        reasonCode = [string]$finalAuthority.reasonCode
    }
    $historyPath = Join-Path (Split-Path -Parent $verified.Path) 'authority-review-history.jsonl'
    $write = Write-NovaCoreAuthorityReviewRecord $historyPath $record
    return [PSCustomObject][ordered]@{
        Status = $write.Status
        Decision = [string]$write.Record.decision
        Authority = [string]$write.Record.authority
        DecidedAt = [string]$write.Record.decidedAt
        ReportFingerprint = [string]$write.Record.reportFingerprint
        HistoryPath = $historyPath
        FinalAuthority = $finalAuthority
        InvokeDomainLot = $false
    }
}

Export-ModuleMember -Function `
    Read-NovaCoreVerifiedOfficialReport,`
    Assert-NovaCoreCurrentAuthorityRatificationAuthorization,`
    Write-NovaCoreAuthorityReviewRecord,`
    Invoke-NovaCoreCurrentAuthorityRatificationReview

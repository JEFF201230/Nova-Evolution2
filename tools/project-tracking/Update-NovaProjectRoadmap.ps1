[CmdletBinding()]
param(
    [string]$ExcelPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$ReportsRoot = Join-Path $Repository '.nova-data\execution\reports'
$CertificationRegistryPath = Join-Path $Repository 'Docs\12_CERTIFICATION\certification-registry.json'
$TrackerPath = Join-Path $Repository 'Docs\00_GOVERNANCE\PROJECT_TRACKING\NOVA_MISSION_PROGRESS_REPORT.md'

if ([string]::IsNullOrWhiteSpace($ExcelPath)) {
    $ExcelPath = Join-Path $Repository 'Docs\00_GOVERNANCE\PROJECT_TRACKING\NOVA_ROADMAP_GANTT_2026-09-29.xlsx'
}
else {
    $ExcelPath = [IO.Path]::GetFullPath($ExcelPath)
}

if (-not (Test-Path -LiteralPath $ReportsRoot -PathType Container)) {
    throw "REPORTS_ROOT_NOT_FOUND:$ReportsRoot"
}

if (-not (Test-Path -LiteralPath $TrackerPath -PathType Leaf)) {
    throw "TRACKER_NOT_FOUND:$TrackerPath"
}
if (-not (Test-Path -LiteralPath $CertificationRegistryPath -PathType Leaf)) {
    throw "CERTIFICATION_REGISTRY_NOT_FOUND:$CertificationRegistryPath"
}

$CertificationRegistry = Get-Content -LiteralPath $CertificationRegistryPath -Raw | ConvertFrom-Json

$LatestReports = Get-ChildItem -LiteralPath $ReportsRoot -Recurse -File -Filter 'official-report.json' |
    Group-Object { $_.Directory.Parent.Name } |
    ForEach-Object {
        $_.Group |
            Sort-Object LastWriteTimeUtc -Descending |
            Select-Object -First 1
    } |
    Sort-Object { $_.Directory.Parent.Name }

$CertifiedMissions = @{}
foreach ($Entry in $CertificationRegistry.Entries) {
    if ([string]$Entry.Status -ne 'CERTIFIED') { continue }

    $relativeCertificationPath = [string]$Entry.CertificationPath
    if ($relativeCertificationPath -notlike '*.certification.json') { continue }

    $certificationPath = Join-Path $Repository ($relativeCertificationPath -replace '/', '\')
    if (-not (Test-Path -LiteralPath $certificationPath -PathType Leaf)) { continue }

    $Certification = Get-Content -LiteralPath $certificationPath -Raw | ConvertFrom-Json
    $certificationMissionId = [string]$Certification.MissionId
    if ([string]::IsNullOrWhiteSpace($certificationMissionId)) { continue }

    $CertifiedMissions[$certificationMissionId] = [PSCustomObject]@{
        DomainId          = [string]$Entry.DomainId
        LotId             = [string]$Entry.LotId
        Status            = [string]$Entry.Status
        CertificationPath = $relativeCertificationPath
    }
}
$Rows = foreach ($Report in $LatestReports) {
    $Json = Get-Content -LiteralPath $Report.FullName -Raw | ConvertFrom-Json

    $missionId = $Report.Directory.Parent.Name
    $certification = $CertifiedMissions[$missionId]

    [PSCustomObject]@{
        MissionId         = $missionId
        RuntimeStatus     = [string]$Json.Status
        AuthorityDecision = [string]$Json.AuthorityDecision
        FinalMissionState = if ($null -ne $certification) { [string]$certification.Status } else { [string]$Json.FinalMissionState }
        ReportFingerprint = [string]$Json.ReportFingerprint
        ReportPath        = $Report.FullName.Substring($Repository.Length + 1)
    }
}

# Existing governed Markdown update: preserved.
$MissionLines = @(
    '## Missions'
    ''
    '| Mission | Etat Runtime | Decision autorite | Etat final | Preuve |'
    '|---|---|---|---|---|'
)

foreach ($Row in $Rows) {
    $MissionLines += "| $($Row.MissionId) | $($Row.RuntimeStatus) | $($Row.AuthorityDecision) | $($Row.FinalMissionState) | ``$($Row.ReportPath)`` |"
}

$MissionLines += ''
$MissionLines += '## Point de reprise'

$Tracker = Get-Content -LiteralPath $TrackerPath -Raw
$Pattern = '(?s)## Missions.*?## Point de reprise'

if ($Tracker -notmatch $Pattern) {
    throw 'TRACKER_MISSIONS_SECTION_NOT_FOUND'
}

$UpdatedTracker = [regex]::Replace(
    $Tracker,
    $Pattern,
    ($MissionLines -join [Environment]::NewLine),
    1
)

Set-Content -LiteralPath $TrackerPath -Value $UpdatedTracker -Encoding UTF8

Write-Host 'TRACKER_UPDATED'
Write-Host "MISSIONS=$($Rows.Count)"
Write-Host "FILE=$TrackerPath"

# Excel is a projection only. Official reports remain authoritative.
# ONLYOFFICE-compatible implementation: edits the XLSX package directly.
# No Microsoft Excel COM automation and no external PowerShell module are required.
if (-not (Test-Path -LiteralPath $ExcelPath -PathType Leaf)) {
    Write-Host "EXCEL_SKIPPED_NOT_FOUND=$ExcelPath"
    return
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-ExcelColumnNumber {
    param([Parameter(Mandatory)][string]$Letters)
    $n = 0
    foreach ($ch in $Letters.ToUpperInvariant().ToCharArray()) {
        $n = ($n * 26) + ([int]$ch - [int][char]'A' + 1)
    }
    return $n
}

function Get-CellColumnLetters {
    param([Parameter(Mandatory)][string]$Reference)
    return ([regex]::Match($Reference, '^[A-Z]+')).Value
}

function Get-XlsxCellText {
    param(
        [Parameter(Mandatory)][System.Xml.XmlElement]$Cell,
        [Parameter(Mandatory)][System.Xml.XmlNamespaceManager]$Ns,
        [string[]]$SharedStrings
    )
    $type = $Cell.GetAttribute('t')
    if ($type -eq 'inlineStr') {
        $nodes = $Cell.SelectNodes('x:is//x:t', $Ns)
        return (($nodes | ForEach-Object { $_.InnerText }) -join '')
    }
    $v = $Cell.SelectSingleNode('x:v', $Ns)
    if ($null -eq $v) { return '' }
    if ($type -eq 's') {
        $idx = 0
        if ([int]::TryParse($v.InnerText, [ref]$idx) -and $idx -ge 0 -and $idx -lt $SharedStrings.Count) {
            return [string]$SharedStrings[$idx]
        }
        return ''
    }
    return [string]$v.InnerText
}

function Set-XlsxInlineStringCell {
    param(
        [Parameter(Mandatory)][System.Xml.XmlDocument]$Xml,
        [Parameter(Mandatory)][System.Xml.XmlElement]$Row,
        [Parameter(Mandatory)][string]$Reference,
        [AllowEmptyString()][string]$Value,
        [Parameter(Mandatory)][System.Xml.XmlNamespaceManager]$Ns
    )
    $mainNs = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
    $cell = $Row.SelectSingleNode("x:c[@r='$Reference']", $Ns)
    if ($null -eq $cell) {
        $cell = $Xml.CreateElement('c', $mainNs)
        $cell.SetAttribute('r', $Reference)
        $targetCol = Get-ExcelColumnNumber (Get-CellColumnLetters $Reference)
        $inserted = $false
        foreach ($existing in @($Row.SelectNodes('x:c', $Ns))) {
            $existingCol = Get-ExcelColumnNumber (Get-CellColumnLetters $existing.GetAttribute('r'))
            if ($existingCol -gt $targetCol) {
                [void]$Row.InsertBefore($cell, $existing)
                $inserted = $true
                break
            }
        }
        if (-not $inserted) { [void]$Row.AppendChild($cell) }
    }
    while ($cell.HasChildNodes) { [void]$cell.RemoveChild($cell.FirstChild) }
    $cell.SetAttribute('t', 'inlineStr')
    $is = $Xml.CreateElement('is', $mainNs)
    $t = $Xml.CreateElement('t', $mainNs)
    if ($Value -match '^\s|\s$') {
        $xmlNs = 'http://www.w3.org/XML/1998/namespace'
        $t.SetAttribute('space', $xmlNs, 'preserve')
    }
    $t.InnerText = [string]$Value
    [void]$is.AppendChild($t)
    [void]$cell.AppendChild($is)
}

function Get-OrCreateXlsxRow {
    param(
        [Parameter(Mandatory)][System.Xml.XmlDocument]$Xml,
        [Parameter(Mandatory)][System.Xml.XmlElement]$SheetData,
        [Parameter(Mandatory)][int]$RowNumber,
        [Parameter(Mandatory)][System.Xml.XmlNamespaceManager]$Ns
    )
    $row = $SheetData.SelectSingleNode("x:row[@r='$RowNumber']", $Ns)
    if ($null -ne $row) { return $row }
    $mainNs = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
    $row = $Xml.CreateElement('row', $mainNs)
    $row.SetAttribute('r', [string]$RowNumber)
    $inserted = $false
    foreach ($existing in @($SheetData.SelectNodes('x:row', $Ns))) {
        if ([int]$existing.GetAttribute('r') -gt $RowNumber) {
            [void]$SheetData.InsertBefore($row, $existing)
            $inserted = $true
            break
        }
    }
    if (-not $inserted) { [void]$SheetData.AppendChild($row) }
    return $row
}

function Remove-XlsxCellsInColumns {
    param(
        [Parameter(Mandatory)][System.Xml.XmlElement]$Row,
        [Parameter(Mandatory)][int]$FromColumn,
        [Parameter(Mandatory)][int]$ToColumn,
        [Parameter(Mandatory)][System.Xml.XmlNamespaceManager]$Ns
    )
    foreach ($cell in @($Row.SelectNodes('x:c', $Ns))) {
        $col = Get-ExcelColumnNumber (Get-CellColumnLetters $cell.GetAttribute('r'))
        if ($col -ge $FromColumn -and $col -le $ToColumn) {
            [void]$Row.RemoveChild($cell)
        }
    }
}

$TempXlsx = Join-Path ([IO.Path]::GetDirectoryName($ExcelPath)) ('.nova-roadmap-sync-' + [Guid]::NewGuid().ToString('N') + '.xlsx')
Copy-Item -LiteralPath $ExcelPath -Destination $TempXlsx -Force

$Zip = $null
try {
    $Zip = [IO.Compression.ZipFile]::Open($TempXlsx, [IO.Compression.ZipArchiveMode]::Update)

    function Read-ZipXml {
        param([Parameter(Mandatory)][string]$EntryName)
        $entry = $Zip.GetEntry($EntryName)
        if ($null -eq $entry) { throw "XLSX_ENTRY_NOT_FOUND:$EntryName" }
        $reader = [IO.StreamReader]::new($entry.Open())
        try { $content = $reader.ReadToEnd() } finally { $reader.Dispose() }
        $xml = [xml]$content
        return $xml
    }

    function Write-ZipXml {
        param(
            [Parameter(Mandatory)][string]$EntryName,
            [Parameter(Mandatory)][xml]$Xml
        )
        $old = $Zip.GetEntry($EntryName)
        if ($null -eq $old) { throw "XLSX_ENTRY_NOT_FOUND:$EntryName" }
        $old.Delete()
        $entry = $Zip.CreateEntry($EntryName, [IO.Compression.CompressionLevel]::Optimal)
        $settings = [Xml.XmlWriterSettings]::new()
        $settings.Encoding = [Text.UTF8Encoding]::new($false)
        $settings.Indent = $false
        $settings.OmitXmlDeclaration = $false
        $writer = [Xml.XmlWriter]::Create($entry.Open(), $settings)
        try { $Xml.Save($writer) } finally { $writer.Dispose() }
    }

    $WorkbookXml = Read-ZipXml 'xl/workbook.xml'
    $WorkbookNs = [Xml.XmlNamespaceManager]::new($WorkbookXml.NameTable)
    $WorkbookNs.AddNamespace('x','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    $WorkbookNs.AddNamespace('r','http://schemas.openxmlformats.org/officeDocument/2006/relationships')

    $RelsXml = Read-ZipXml 'xl/_rels/workbook.xml.rels'
    $RelsNs = [Xml.XmlNamespaceManager]::new($RelsXml.NameTable)
    $RelsNs.AddNamespace('p','http://schemas.openxmlformats.org/package/2006/relationships')

    function Resolve-SheetEntry {
        param([Parameter(Mandatory)][string]$SheetName)
        $sheet = $WorkbookXml.SelectSingleNode("//x:sheet[@name='$SheetName']", $WorkbookNs)
        if ($null -eq $sheet) { throw "EXCEL_${SheetName}_SHEET_NOT_FOUND" }
        $rid = $sheet.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
        $rel = $RelsXml.SelectSingleNode("//p:Relationship[@Id='$rid']", $RelsNs)
        if ($null -eq $rel) { throw "EXCEL_SHEET_RELATIONSHIP_NOT_FOUND:$SheetName" }
        $target = $rel.GetAttribute('Target').Replace('\\','/')
        if ($target.StartsWith('/')) { return $target.TrimStart('/') }
        if ($target.StartsWith('xl/')) { return $target }
        return ('xl/' + $target.TrimStart('/'))
    }

    $SharedStrings = @()
    $sharedEntry = $Zip.GetEntry('xl/sharedStrings.xml')
    if ($null -ne $sharedEntry) {
        $SharedXml = Read-ZipXml 'xl/sharedStrings.xml'
        $SharedNs = [Xml.XmlNamespaceManager]::new($SharedXml.NameTable)
        $SharedNs.AddNamespace('x','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
        foreach ($si in $SharedXml.SelectNodes('//x:si', $SharedNs)) {
            $SharedStrings += (($si.SelectNodes('.//x:t', $SharedNs) | ForEach-Object { $_.InnerText }) -join '')
        }
    }

    $MissionEntry = Resolve-SheetEntry 'Mission_Sync'
    $RoadmapEntry = Resolve-SheetEntry 'Roadmap'
    $MissionXml = Read-ZipXml $MissionEntry
    $RoadmapXml = Read-ZipXml $RoadmapEntry

    $MissionNs = [Xml.XmlNamespaceManager]::new($MissionXml.NameTable)
    $MissionNs.AddNamespace('x','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    $RoadmapNs = [Xml.XmlNamespaceManager]::new($RoadmapXml.NameTable)
    $RoadmapNs.AddNamespace('x','http://schemas.openxmlformats.org/spreadsheetml/2006/main')

    $MissionData = $MissionXml.SelectSingleNode('//x:sheetData', $MissionNs)
    $RoadmapData = $RoadmapXml.SelectSingleNode('//x:sheetData', $RoadmapNs)
    if ($null -eq $MissionData -or $null -eq $RoadmapData) { throw 'EXCEL_SHEETDATA_NOT_FOUND' }

    # Clear previous Mission_Sync data rows A:G while preserving row 1/header and formatting elsewhere.
    foreach ($rowNode in @($MissionData.SelectNodes('x:row', $MissionNs))) {
        if ([int]$rowNode.GetAttribute('r') -ge 2) {
            Remove-XlsxCellsInColumns -Row $rowNode -FromColumn 1 -ToColumn 7 -Ns $MissionNs
        }
    }

    $r = 2
    $SyncStamp = [DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss')
    foreach ($Row in $Rows) {
        $rowNode = Get-OrCreateXlsxRow -Xml $MissionXml -SheetData $MissionData -RowNumber $r -Ns $MissionNs
        Set-XlsxInlineStringCell -Xml $MissionXml -Row $rowNode -Reference "A$r" -Value $Row.MissionId -Ns $MissionNs
        Set-XlsxInlineStringCell -Xml $MissionXml -Row $rowNode -Reference "B$r" -Value $Row.RuntimeStatus -Ns $MissionNs
        Set-XlsxInlineStringCell -Xml $MissionXml -Row $rowNode -Reference "C$r" -Value $Row.AuthorityDecision -Ns $MissionNs
        Set-XlsxInlineStringCell -Xml $MissionXml -Row $rowNode -Reference "D$r" -Value $Row.FinalMissionState -Ns $MissionNs
        Set-XlsxInlineStringCell -Xml $MissionXml -Row $rowNode -Reference "E$r" -Value $Row.ReportFingerprint -Ns $MissionNs
        Set-XlsxInlineStringCell -Xml $MissionXml -Row $rowNode -Reference "F$r" -Value $Row.ReportPath -Ns $MissionNs
        Set-XlsxInlineStringCell -Xml $MissionXml -Row $rowNode -Reference "G$r" -Value $SyncStamp -Ns $MissionNs
        $r++
    }

    $ByMission = @{}
    foreach ($Row in $Rows) { $ByMission[$Row.MissionId] = $Row }

    # Exact mission-id matching only. No fuzzy matching.
    foreach ($roadRow in @($RoadmapData.SelectNodes('x:row', $RoadmapNs))) {
        $rrText = $roadRow.GetAttribute('r')
        if ([string]::IsNullOrWhiteSpace($rrText)) { continue }
        $rr = [int]$rrText
        if ($rr -lt 5) { continue }

        $missionCell = $roadRow.SelectSingleNode("x:c[@r='O$rr']", $RoadmapNs)
        $MissionId = ''
        if ($null -ne $missionCell) {
            $MissionId = (Get-XlsxCellText -Cell $missionCell -Ns $RoadmapNs -SharedStrings $SharedStrings).Trim()
        }

        # Only projection columns P:S are reset. Column O is the explicit user/governance mapping.
        Remove-XlsxCellsInColumns -Row $roadRow -FromColumn 16 -ToColumn 19 -Ns $RoadmapNs

        if ([string]::IsNullOrWhiteSpace($MissionId)) {
            Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "S$rr" -Value 'NON RATTACHE' -Ns $RoadmapNs
            continue
        }

        if (-not $ByMission.ContainsKey($MissionId)) {
            Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "S$rr" -Value 'MISSION INTROUVABLE' -Ns $RoadmapNs
            continue
        }

        $Match = $ByMission[$MissionId]
        Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "P$rr" -Value $Match.RuntimeStatus -Ns $RoadmapNs
        Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "Q$rr" -Value $Match.AuthorityDecision -Ns $RoadmapNs
        Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "R$rr" -Value $Match.FinalMissionState -Ns $RoadmapNs

        $Final = ([string]$Match.FinalMissionState).Trim().ToUpperInvariant()
        $Decision = ([string]$Match.AuthorityDecision).Trim().ToUpperInvariant()
        if ($Final -in @('CERTIFIED','ACCEPTED') -or $Decision -in @('CERTIFIED','ACCEPTED')) {
            Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "G$rr" -Value 'Terminé' -Ns $RoadmapNs
            Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "S$rr" -Value 'CLOS PAR PREUVE OFFICIELLE' -Ns $RoadmapNs
        }
        else {
            Set-XlsxInlineStringCell -Xml $RoadmapXml -Row $roadRow -Reference "S$rr" -Value 'SYNCHRONISE - NON CLOS' -Ns $RoadmapNs
        }
    }

    # Force recalculation when ONLYOFFICE opens the workbook.
    $calcPr = $WorkbookXml.SelectSingleNode('//x:calcPr', $WorkbookNs)
    if ($null -eq $calcPr) {
        $calcPr = $WorkbookXml.CreateElement('calcPr','http://schemas.openxmlformats.org/spreadsheetml/2006/main')
        [void]$WorkbookXml.DocumentElement.AppendChild($calcPr)
    }
    $calcPr.SetAttribute('fullCalcOnLoad','1')
    $calcPr.SetAttribute('forceFullCalc','1')
    $calcPr.SetAttribute('calcMode','auto')

    Write-ZipXml -EntryName $MissionEntry -Xml $MissionXml
    Write-ZipXml -EntryName $RoadmapEntry -Xml $RoadmapXml
    Write-ZipXml -EntryName 'xl/workbook.xml' -Xml $WorkbookXml
}
finally {
    if ($null -ne $Zip) { $Zip.Dispose() }
}

# Atomic replacement after successful XLSX package update.
$BackupXlsx = "$ExcelPath.sync-backup"
Copy-Item -LiteralPath $ExcelPath -Destination $BackupXlsx -Force
try {
    Move-Item -LiteralPath $TempXlsx -Destination $ExcelPath -Force
}
catch {
    Copy-Item -LiteralPath $BackupXlsx -Destination $ExcelPath -Force
    throw
}
finally {
    if (Test-Path -LiteralPath $TempXlsx) { Remove-Item -LiteralPath $TempXlsx -Force }
}

Write-Host 'EXCEL_UPDATED_ONLYOFFICE_COMPATIBLE'
Write-Host "EXCEL_FILE=$ExcelPath"

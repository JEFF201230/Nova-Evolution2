# NOVA-WORK-WCF008-C20-OFFICIAL-REPORT-SEAL-AUDIT-001

## Mode
READ_ONLY. C-20 only. No repository write. No certification writer call. No WCF-008 certification. No C-21 approval.

## Objective
Determine, from current local authoritative evidence, why the six WCF-008 predecessor official-report seals do not recompute under the current canonical `Get-NovaCoreOfficialReportFingerprint`, and determine whether an EXISTING canonical reconciliation/repair primitive can resolve C-20 without rewriting history or fabricating fingerprints.

## Canonical C-20 criterion
Official report/output evidence are complete, after-captured and fingerprint-bound.

## Six mandatory targets
1. EVIDENCE / P3-EVIDENCE-001B
2. WORK / WCF-004
3. WORK / WORK-AUTHORIZED-STATE-001
4. INTELLIGENCE / P3-INTELLIGENCE-001B
5. SYNTHESIS / P3-SYNTHESIS-001B
6. CONFIDENCE / P3-CONFIDENCE-001B

Resolve each target's exact OFFICIAL_REPORT path from its current canonical certification evidence. Do not guess paths.

## Required investigation
For every target:
- verify the referenced official-report.json exists locally;
- record stored ReportFingerprint;
- recompute with the CURRENT exported Get-NovaCoreOfficialReportFingerprint;
- verify OutputEvidence registryFingerprint independently;
- verify the OFFICIAL_REPORT entry uses fingerprintReference=ReportFingerprint;
- verify capturedAfterExecution and evidence status;
- identify the mission/run binding and timestamps;
- compare the report shape and serialization with the current canonical report contract;
- inspect Git history of NovaCore.Governance.psm1, NovaCore.Reporting.psm1 and Invoke-NovaCoreMission.ps1 around the mission date to determine whether the report was created under an older fingerprint/serialization algorithm;
- where possible, recompute using the historically applicable algorithm from Git history, without modifying files;
- distinguish FORMAT/ALGORITHM EVOLUTION from REPORT ALTERATION. Do not infer either without proof.

## Existing primitive search
Search the repository and CEREBRAU integration for an existing official-report seal verification, migration, reconciliation, repair, backfill, or reseal primitive. EXISTING > REUSE > MINIMAL REPAIR > NEW DEVELOPMENT.
Do not create a primitive.

## Fail-closed rules
- Missing source report => C-20 FAIL.
- Current fingerprint mismatch without proven historical explanation => C-20 FAIL.
- OutputEvidence mismatch => C-20 FAIL.
- Any evidence of post-seal report alteration => C-20 FAIL.
- Never replace a stored fingerprint merely to make the check pass.
- Never rewrite an historical official report.
- Never mutate certification-registry.json or any *.certification.json.

## Required output
Return a six-row matrix with:
Domain/Lot | report path | stored fingerprint | current recomputation | historical recomputation if provable | OutputEvidence binding | diagnosis | C-20 status.

Then state:
1. C-20 = PASS or FAIL.
2. Exact blockers.
3. Existing canonical repair/reconciliation primitive, if one exists, with exact file/function.
4. If no primitive exists, the minimum safe repair scope, but DO NOT implement it.
5. Exact next action.
6. Confirm repository worktree unchanged and no certification writer invoked.

# Rapport officiel CEREBRAU

- MissionId : NOVA-R06-WORK-PLAN-REAL-PATH-REMEDIATION-001
- Statut : NO_CHANGE
- Classification technique : NO_CHANGE
- Decision autoritative : REJECTED
- Etat final : REJECTED
- ExitCode Codex : 0
- Transcript autoritatif : NON
- AgenticProfileRequested : ARCHITECTURE
- AgenticProfileResolved : ARCHITECTURE
- ModelResolved : gpt-5.6-sol
- ReasoningLevelResolved : high
- SandboxResolved : workspace-write
- ApprovalPolicyResolved : on-request
- CodexVersion : 0.153.4
- ProfileResolutionSource : Resolve-CerebrauProfile.ps1
- RoutingDecision : RESOLVED
- RoutingJustification : Profil ARCHITECTURE resolu par le registre CEREBRAU vers ARCHITECTURE.
- RuntimeStartedAt : 10/02/2026 09:36:35 +02:00
- Empreinte du rapport : 09A9515E971E9B1225B937A3A31457A6A32638792BD9237B4AB1623512E2B01D

## Admission gouvernee

- Mode : NORMAL
- Recovery Lane : 
- Exception Non Self-Blocking : False
- Freeze actif : False
- Exception Freeze appliquee : False

## Registres de preuves

- Input Evidence : VALID
- Output Evidence : INVALID
- Empreinte Input Evidence : 74DD7A92125F050DDECDE1B83452DDBCC8D185CECD4BD5C4951A8AC3C7C3092F
- Empreinte Output Evidence : D7CBD579088943FE64EBE14C408AB500D8A8C443AC6D043A5FD4AA906CF2B28A

## Fichiers crÃ©Ã©s
- Aucun

## Fichiers modifiÃ©s
- Aucun

## Fichiers supprimÃ©s
- Aucun

## Diff

- Insertions : 0
- Suppressions : 0

## Validations

- repository-diff-check : SUCCESS
- expected:contracts/work-plan.contract.ts : SUCCESS
- expected:server/nova-core/work-plan.http.test.ts : SUCCESS
- expected:server/nova-bff/work-plan.gateway.port.ts : SUCCESS
- expected:server/nova-bff/work-plan.gateway.ts : SUCCESS
- expected:server/nova-bff/work-plan.route.ts : SUCCESS
- expected:server/nova-bff/work-plan.route.test.ts : SUCCESS
- expected:apps/nova-web/src/features/work/workPlan.service.ts : SUCCESS
- expected:apps/nova-web/src/features/work/useWorkPlan.ts : SUCCESS
- expected:apps/nova-web/src/features/work/WorkPlanPage.test.tsx : SUCCESS

## Diagnostics

- [INFO] CODEX_EXECUTION - Fait: Codex a retourne ExitCode 0. Consequence: L execution technique est terminee. Hypothese:  Action corrective: Poursuivre les validations autoritatives.
- [INFO] WORKSPACE_DELTA - Fait: 0 changement(s) attribue(s) a la mission. Consequence: Le perimetre mesure est disponible pour validation. Hypothese:  Action corrective: Verifier les controles de perimetre avant certification.
- [INFO] VALIDATION - Fait: Validation repository-diff-check reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:contracts/work-plan.contract.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-core/work-plan.http.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.gateway.port.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.gateway.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.route.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.route.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/workPlan.service.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/useWorkPlan.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/WorkPlanPage.test.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] CLASSIFICATION - Fait: Statut officiel calcule: NO_CHANGE. Consequence: Ce statut gouverne le rapport officiel. Hypothese:  Action corrective: Appliquer la revue requise.
- [INFO] CODEX_DIAGNOSTIC_CAPTURE - Fait: Codex execution streams persisted; ExitCode 0; output-last-message empty: False. Consequence: Complete non-authoritative execution diagnostics are available at the recorded paths. Hypothese:  Action corrective: No corrective action.
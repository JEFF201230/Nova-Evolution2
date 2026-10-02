# Rapport officiel CEREBRAU

- MissionId : NOVA-R06-WORK-PLAN-REAL-PATH-001
- Statut : PARTIAL
- Classification technique : PARTIAL
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
- RuntimeStartedAt : 10/01/2026 21:24:10 +02:00
- Empreinte du rapport : 0860B8F6AB0364832DB2F4D4C30F274881DD14710653DADC49D6D39A4651EE3E

## Admission gouvernee

- Mode : NORMAL
- Recovery Lane : 
- Exception Non Self-Blocking : False
- Freeze actif : False
- Exception Freeze appliquee : False

## Registres de preuves

- Input Evidence : VALID
- Output Evidence : INVALID
- Empreinte Input Evidence : 454421804149E2509E36ABE16F7A05443F1AF7957702DE57C6C6C21A93C1C04C
- Empreinte Output Evidence : 349EC3FC14359420ABDB6BBFE89CED64A667F7C487B8C54C37E6C1845896CC78

## Fichiers crÃ©Ã©s
- `apps/nova-web/src/features/work/useWorkPlan.ts`
- `apps/nova-web/src/features/work/workPlan.service.ts`
- `contracts/work-plan.contract.ts`
- `server/nova-bff/work-plan.gateway.port.ts`
- `server/nova-bff/work-plan.gateway.ts`
- `server/nova-bff/work-plan.route.test.ts`
- `server/nova-bff/work-plan.route.ts`
- `server/nova-core/work-plan.http.test.ts`

## Fichiers modifiÃ©s
- `apps/nova-web/dist/assets/index-Czqz2fVL.css`
- `apps/nova-web/dist/assets/index-lmoOEJD5.js`
- `apps/nova-web/dist/index.html`
- `apps/nova-web/src/components/routes/WorkSurface.tsx`
- `apps/nova-web/src/features/work/WorkActivityPage.test.tsx`
- `apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx`
- `apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx`
- `apps/nova-web/src/features/work/WorkPageHeader.tsx`
- `apps/nova-web/src/features/work/WorkPlanPage.module.css`
- `apps/nova-web/src/features/work/WorkPlanPage.test.tsx`
- `apps/nova-web/src/features/work/WorkPlanPage.tsx`
- `server/nova-bff/nova-bff.app.ts`
- `server/nova-bff/nova-bff.boundary.test.ts`
- `server/nova-bff/nova-bff.server.ts`
- `server/nova-core/nova-core.http.ts`

## Fichiers supprimÃ©s
- Aucun

## Diff

- Insertions : 943
- Suppressions : 131

## Validations

- repository-diff-check : SUCCESS
- expected:contracts/work-plan.contract.ts : SUCCESS
- expected:server/nova-core/nova-core.http.ts : SUCCESS
- expected:server/nova-bff/work-plan.gateway.port.ts : SUCCESS
- expected:server/nova-bff/work-plan.gateway.ts : SUCCESS
- expected:server/nova-bff/work-plan.route.ts : SUCCESS
- expected:server/nova-bff/work-plan.route.test.ts : SUCCESS
- expected:server/nova-bff/nova-bff.app.ts : SUCCESS
- expected:server/nova-bff/nova-bff.server.ts : SUCCESS
- expected:apps/nova-web/src/components/routes/WorkSurface.tsx : SUCCESS
- expected:apps/nova-web/src/features/work/WorkPlanPage.tsx : SUCCESS
- expected:apps/nova-web/src/features/work/WorkPlanPage.test.tsx : SUCCESS
- expected:apps/nova-web/src/features/work/workPlan.service.ts : SUCCESS
- expected:apps/nova-web/src/features/work/useWorkPlan.ts : SUCCESS
- expected:apps/nova-web/src/features/work/WorkPlanRealPath.test.tsx : FAILURE
- scope:apps/nova-web/dist/assets/index-Czqz2fVL.css : FAILURE
- scope:apps/nova-web/dist/assets/index-lmoOEJD5.js : FAILURE
- scope:apps/nova-web/dist/index.html : FAILURE
- scope:apps/nova-web/src/components/routes/WorkSurface.tsx : SUCCESS
- scope:apps/nova-web/src/features/work/useWorkPlan.ts : SUCCESS
- scope:apps/nova-web/src/features/work/WorkActivityPage.test.tsx : FAILURE
- scope:apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx : FAILURE
- scope:apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx : FAILURE
- scope:apps/nova-web/src/features/work/WorkPageHeader.tsx : FAILURE
- scope:apps/nova-web/src/features/work/workPlan.service.ts : SUCCESS
- scope:apps/nova-web/src/features/work/WorkPlanPage.module.css : SUCCESS
- scope:apps/nova-web/src/features/work/WorkPlanPage.test.tsx : SUCCESS
- scope:apps/nova-web/src/features/work/WorkPlanPage.tsx : SUCCESS
- scope:contracts/work-plan.contract.ts : SUCCESS
- scope:server/nova-bff/nova-bff.app.ts : SUCCESS
- scope:server/nova-bff/nova-bff.boundary.test.ts : SUCCESS
- scope:server/nova-bff/nova-bff.server.ts : SUCCESS
- scope:server/nova-bff/work-plan.gateway.port.ts : SUCCESS
- scope:server/nova-bff/work-plan.gateway.ts : SUCCESS
- scope:server/nova-bff/work-plan.route.test.ts : SUCCESS
- scope:server/nova-bff/work-plan.route.ts : SUCCESS
- scope:server/nova-core/nova-core.http.ts : SUCCESS
- scope:server/nova-core/work-plan.http.test.ts : FAILURE

## Diagnostics

- [INFO] CODEX_EXECUTION - Fait: Codex a retourne ExitCode 0. Consequence: L execution technique est terminee. Hypothese:  Action corrective: Poursuivre les validations autoritatives.
- [INFO] WORKSPACE_DELTA - Fait: 23 changement(s) attribue(s) a la mission. Consequence: Le perimetre mesure est disponible pour validation. Hypothese:  Action corrective: Verifier les controles de perimetre avant certification.
- [INFO] VALIDATION - Fait: Validation repository-diff-check reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:contracts/work-plan.contract.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-core/nova-core.http.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.gateway.port.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.gateway.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.route.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-plan.route.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/nova-bff.app.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/nova-bff.server.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/components/routes/WorkSurface.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/WorkPlanPage.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/WorkPlanPage.test.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/workPlan.service.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/useWorkPlan.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [ERROR] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/WorkPlanRealPath.test.tsx echouee: EXPECTED_FILE_MISSING:apps/nova-web/src/features/work/WorkPlanRealPath.test.tsx Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/assets/index-Czqz2fVL.css echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-Czqz2fVL.css Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/assets/index-lmoOEJD5.js echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-lmoOEJD5.js Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/index.html echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/index.html Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/components/routes/WorkSurface.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/useWorkPlan.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkActivityPage.test.tsx echouee: PATH_SCOPE_VIOLATION:apps/nova-web/src/features/work/WorkActivityPage.test.tsx Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx echouee: PATH_SCOPE_VIOLATION:apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx echouee: PATH_SCOPE_VIOLATION:apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkPageHeader.tsx echouee: PATH_SCOPE_VIOLATION:apps/nova-web/src/features/work/WorkPageHeader.tsx Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/workPlan.service.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkPlanPage.module.css reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkPlanPage.test.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkPlanPage.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:contracts/work-plan.contract.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/nova-bff.app.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/nova-bff.boundary.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/nova-bff.server.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-plan.gateway.port.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-plan.gateway.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-plan.route.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-plan.route.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-core/nova-core.http.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [ERROR] VALIDATION - Fait: Validation scope:server/nova-core/work-plan.http.test.ts echouee: PATH_SCOPE_VIOLATION:server/nova-core/work-plan.http.test.ts Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [INFO] CLASSIFICATION - Fait: Statut officiel calcule: PARTIAL. Consequence: Ce statut gouverne le rapport officiel. Hypothese:  Action corrective: Reprendre au premier diagnostic en erreur.
- [INFO] CODEX_DIAGNOSTIC_CAPTURE - Fait: Codex execution streams persisted; ExitCode 0; output-last-message empty: False. Consequence: Complete non-authoritative execution diagnostics are available at the recorded paths. Hypothese:  Action corrective: No corrective action.
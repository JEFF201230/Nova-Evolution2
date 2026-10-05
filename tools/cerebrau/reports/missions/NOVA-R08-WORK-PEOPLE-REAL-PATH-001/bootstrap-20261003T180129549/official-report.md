# Rapport officiel CEREBRAU

- MissionId : NOVA-R08-WORK-PEOPLE-REAL-PATH-001
- Statut : PARTIAL
- Classification technique : PARTIAL
- Decision autoritative : REJECTED
- Etat final : REJECTED
- ExitCode Codex : 0
- Transcript autoritatif : NON
- AgenticProfileRequested : BUILD
- AgenticProfileResolved : BUILD
- ModelResolved : gpt-5.6-sol
- ReasoningLevelResolved : medium
- SandboxResolved : workspace-write
- ApprovalPolicyResolved : on-request
- CodexVersion : 0.153.4
- ProfileResolutionSource : Resolve-CerebrauProfile.ps1
- RoutingDecision : RESOLVED
- RoutingJustification : Profil BUILD resolu par le registre CEREBRAU vers BUILD.
- RuntimeStartedAt : 10/03/2026 18:01:30 +02:00
- Empreinte du rapport : 0C7038A014071A526F3C4C9B63EAC6125D77C1A6A0DCFD7D98BFB27397BCC7BD

## Admission gouvernee

- Mode : NORMAL
- Recovery Lane : 
- Exception Non Self-Blocking : False
- Freeze actif : False
- Exception Freeze appliquee : False

## Registres de preuves

- Input Evidence : VALID
- Output Evidence : INVALID
- Empreinte Input Evidence : 0CB78DDB6173187BEE1916BB8A1B82D484D3347A3B87AE2FBF6E9E8950B75677
- Empreinte Output Evidence : 10731C076F9AA20DE70909CC6FB99759ACCB625F32FD80CDBAB3BA48D1E0BB7D

## Fichiers crÃ©Ã©s
- `apps/nova-web/dist/assets/index-aMAn_aXH.js`
- `apps/nova-web/dist/assets/index-MU3gD0pQ.css`
- `apps/nova-web/src/features/work/useWorkPeople.ts`
- `apps/nova-web/src/features/work/workPeople.service.ts`
- `contracts/work-people.contract.ts`
- `server/nova-bff/work-people.gateway.port.ts`
- `server/nova-bff/work-people.gateway.ts`
- `server/nova-bff/work-people.route.test.ts`
- `server/nova-bff/work-people.route.ts`
- `server/nova-core/work-people.http.test.ts`
- `server/nova-core/work-people.integration.test.ts`

## Fichiers modifiÃ©s
- `apps/nova-web/dist/index.html`
- `apps/nova-web/src/components/routes/WorkSurface.tsx`
- `apps/nova-web/src/features/work/WorkPeoplePage.test.tsx`
- `apps/nova-web/src/features/work/WorkPeoplePage.tsx`
- `server/nova-bff/nova-bff.app.ts`
- `server/nova-bff/nova-bff.boundary.test.ts`
- `server/nova-bff/nova-bff.server.ts`
- `server/nova-core/nova-core.http.ts`
- `server/nova-core/nova-core.service.ts`

## Fichiers supprimÃ©s
- `apps/nova-web/dist/assets/index-Czqz2fVL.css`
- `apps/nova-web/dist/assets/index-lmoOEJD5.js`

## Diff

- Insertions : 745
- Suppressions : 285

## Validations

- repository-diff-check : SUCCESS
- expected:contracts/work-people.contract.ts : SUCCESS
- expected:server/nova-core/nova-core.service.ts : SUCCESS
- expected:server/nova-core/nova-core.http.ts : SUCCESS
- expected:server/nova-core/work-people.http.test.ts : SUCCESS
- expected:server/nova-bff/nova-bff.app.ts : SUCCESS
- expected:server/nova-bff/nova-bff.server.ts : SUCCESS
- expected:server/nova-bff/work-people.gateway.port.ts : SUCCESS
- expected:server/nova-bff/work-people.gateway.ts : SUCCESS
- expected:server/nova-bff/work-people.route.ts : SUCCESS
- expected:server/nova-bff/work-people.route.test.ts : SUCCESS
- expected:apps/nova-web/src/components/routes/WorkSurface.tsx : SUCCESS
- expected:apps/nova-web/src/features/work/WorkPeoplePage.tsx : SUCCESS
- expected:apps/nova-web/src/features/work/WorkPeoplePage.test.tsx : SUCCESS
- expected:apps/nova-web/src/features/work/workPeople.service.ts : SUCCESS
- expected:apps/nova-web/src/features/work/useWorkPeople.ts : SUCCESS
- scope:apps/nova-web/dist/assets/index-aMAn_aXH.js : FAILURE
- scope:apps/nova-web/dist/assets/index-Czqz2fVL.css : FAILURE
- scope:apps/nova-web/dist/assets/index-lmoOEJD5.js : FAILURE
- scope:apps/nova-web/dist/assets/index-MU3gD0pQ.css : FAILURE
- scope:apps/nova-web/dist/index.html : FAILURE
- scope:apps/nova-web/src/components/routes/WorkSurface.tsx : SUCCESS
- scope:apps/nova-web/src/features/work/useWorkPeople.ts : SUCCESS
- scope:apps/nova-web/src/features/work/workPeople.service.ts : SUCCESS
- scope:apps/nova-web/src/features/work/WorkPeoplePage.test.tsx : SUCCESS
- scope:apps/nova-web/src/features/work/WorkPeoplePage.tsx : SUCCESS
- scope:contracts/work-people.contract.ts : SUCCESS
- scope:server/nova-bff/nova-bff.app.ts : SUCCESS
- scope:server/nova-bff/nova-bff.boundary.test.ts : SUCCESS
- scope:server/nova-bff/nova-bff.server.ts : SUCCESS
- scope:server/nova-bff/work-people.gateway.port.ts : SUCCESS
- scope:server/nova-bff/work-people.gateway.ts : SUCCESS
- scope:server/nova-bff/work-people.route.test.ts : SUCCESS
- scope:server/nova-bff/work-people.route.ts : SUCCESS
- scope:server/nova-core/nova-core.http.ts : SUCCESS
- scope:server/nova-core/nova-core.service.ts : SUCCESS
- scope:server/nova-core/work-people.http.test.ts : SUCCESS
- scope:server/nova-core/work-people.integration.test.ts : FAILURE

## Diagnostics

- [INFO] CODEX_EXECUTION - Fait: Codex a retourne ExitCode 0. Consequence: L execution technique est terminee. Hypothese:  Action corrective: Poursuivre les validations autoritatives.
- [INFO] WORKSPACE_DELTA - Fait: 22 changement(s) attribue(s) a la mission. Consequence: Le perimetre mesure est disponible pour validation. Hypothese:  Action corrective: Verifier les controles de perimetre avant certification.
- [INFO] VALIDATION - Fait: Validation repository-diff-check reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:contracts/work-people.contract.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-core/nova-core.service.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-core/nova-core.http.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-core/work-people.http.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/nova-bff.app.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/nova-bff.server.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-people.gateway.port.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-people.gateway.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-people.route.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:server/nova-bff/work-people.route.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/components/routes/WorkSurface.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/WorkPeoplePage.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/WorkPeoplePage.test.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/workPeople.service.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation expected:apps/nova-web/src/features/work/useWorkPeople.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/assets/index-aMAn_aXH.js echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-aMAn_aXH.js Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/assets/index-Czqz2fVL.css echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-Czqz2fVL.css Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/assets/index-lmoOEJD5.js echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-lmoOEJD5.js Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/assets/index-MU3gD0pQ.css echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-MU3gD0pQ.css Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [ERROR] VALIDATION - Fait: Validation scope:apps/nova-web/dist/index.html echouee: PATH_SCOPE_VIOLATION:apps/nova-web/dist/index.html Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/components/routes/WorkSurface.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/useWorkPeople.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/workPeople.service.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkPeoplePage.test.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:apps/nova-web/src/features/work/WorkPeoplePage.tsx reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:contracts/work-people.contract.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/nova-bff.app.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/nova-bff.boundary.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/nova-bff.server.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-people.gateway.port.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-people.gateway.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-people.route.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-bff/work-people.route.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-core/nova-core.http.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-core/nova-core.service.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [INFO] VALIDATION - Fait: Validation scope:server/nova-core/work-people.http.test.ts reussie. Consequence: Cette exigence est satisfaite. Hypothese:  Action corrective: Aucune action corrective.
- [ERROR] VALIDATION - Fait: Validation scope:server/nova-core/work-people.integration.test.ts echouee: PATH_SCOPE_VIOLATION:server/nova-core/work-people.integration.test.ts Consequence: La certification est bloquee ou partielle. Hypothese: Le livrable ne respecte pas encore le contrat de validation. Action corrective: Corriger le fait signale puis reexecuter la validation nommee.
- [INFO] CLASSIFICATION - Fait: Statut officiel calcule: PARTIAL. Consequence: Ce statut gouverne le rapport officiel. Hypothese:  Action corrective: Reprendre au premier diagnostic en erreur.
- [INFO] CODEX_DIAGNOSTIC_CAPTURE - Fait: Codex execution streams persisted; ExitCode 0; output-last-message empty: False. Consequence: Complete non-authoritative execution diagnostics are available at the recorded paths. Hypothese:  Action corrective: No corrective action.
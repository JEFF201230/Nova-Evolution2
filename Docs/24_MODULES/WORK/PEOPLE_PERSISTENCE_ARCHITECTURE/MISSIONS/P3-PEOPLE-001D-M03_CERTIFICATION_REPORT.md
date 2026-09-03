# P3-PEOPLE-001D-M03 — Rapport de certification finale

## 1. Préconditions M01/M02

| Précondition | Résultat | Preuve vérifiée |
|---|---:|---|
| M01 existe et se termine par GO | PASS | `P3-PEOPLE-001D-M01_REPORT.md` existe et se termine par `GO — P3-PEOPLE-001D-M01`. |
| M02 existe et se termine par GO | PASS | `P3-PEOPLE-001D-M02_REPORT.md` existe et se termine par `GO — P3-PEOPLE-001D-M02`. |
| Fichiers de persistance requis présents | PASS | Les 14 fichiers de code et de tests annoncés par M01/M02 ont été contrôlés par `Test-Path` : 14/14 présents. |
| Aucun élément M01/M02 requis disparu | PASS | Présence 14/14, tests PEOPLE 25/25 et typecheck strict PEOPLE PASS. |
| Aucun conflit ou incohérence évidente sur les fichiers concernés | PASS | Aucun marqueur de fusion détecté. Le JSON courant porte bien `MissionId = P3-PEOPLE-001D-CERTIFICATION`, `DomainId = PEOPLE` et `LotId = P3-PEOPLE-001D`. Les changements PEOPLE déjà présents correspondent aux livrables M01/M02 et toutes leurs validations passent. |

Les cinq préconditions sont satisfaites. Le worktree n'est pas propre, mais les changements fonctionnels PEOPLE et les documents d'architecture étaient préexistants à M03 et sont explicitement distingués des deux changements de certification réalisés ci-dessous.

## 2. Matrice de certification A à K

| Exigence | Résultat | Preuves exécutées et vérifiées |
|---|---:|---|
| A — Source canonique | PASS | Schéma SQLite dédié PEOPLE et repositories `BusinessPerson`/`WorkPeople`. `creates the canonical V1 schema exactly once` PASS. Les imports de production PEOPLE sont uniquement `node:*` ou locaux à `server/domain/people/`. |
| B — Agrégats | PASS | `creates and fully loads distinct BusinessPerson and WorkPeople aggregates` et `rehydrates complete durable state after a database restart` PASS. |
| C — Atomicité | PASS | Transaction `BEGIN IMMEDIATE` unique couvrant état, événements, causalité, reçu et révision. `an injected failure rolls back state, events, causality and receipt` PASS, sans état partiel. |
| D — Concurrence | PASS | `expectedRevision`, CAS et rejet de révision obsolète vérifiés. `two SQLite connections serialize writers and reject a stale revision without partial state` PASS. Aucun last-write-wins implicite. |
| E — Unicité | PASS | Index Owner actif unique par Work, FK/CHECK/index/triggers sur assignments, rôles et périodes. `direct SQL constraints reject duplicate Owner, overlaps, invalid periods and physical deletion` PASS. |
| F — Histoire | PASS | Histoire append-only, lecture bornée, replay, rehydration et redémarrage vérifiés par les tests d'histoire et de restart. |
| G — Idempotence et causalité | PASS | Replay exact avant CAS, replay divergent rejeté, causalité et reçus durables, événements multiples d'une commande cohérents. Tests d'idempotence et d'agrégat PASS. |
| H — Migration | PASS | Version 1, checksum SHA-256, migration idempotente, version inconnue et checksum divergent rejetés, rollback à chaque point d'interruption. Six tests migration/recovery PASS. |
| I — Intégrité et recovery | PASS | `quick_check`, `integrity_check`, `foreign_key_check`, corruptions head/event/receipt, backup, restore et reconstruction déterministe vérifiés par les tests dédiés. |
| J — Suppression | PASS | Aucun `DELETE` métier opérationnel trouvé ; les occurrences de `DELETE` en production sont les triggers `BEFORE DELETE` qui interdisent la suppression. Le test SQL direct PASS. |
| K — Frontières | PASS | Aucun import Runtime, CEREBRAU, Work externe, BFF, frontend ou projection dans le code PEOPLE de production. `Foundation index excludes Authority artifacts` PASS. Le bridge NOVA est couvert par la suite Core PASS. |

## 3. Commandes exécutées

Toutes les commandes ont été exécutées depuis la racine du dépôt.

1. `node --import tsx --test server/domain/people/*.test.ts`
2. `$peopleTs = (Get-ChildItem -LiteralPath 'server/domain/people' -Filter '*.ts' -File).FullName; node node_modules/typescript/bin/tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --types node $peopleTs`
3. `node --import tsx --test server/runtime/work/*.test.ts`
4. `npm.cmd run test:runtime`
5. `npm.cmd run test:core`
6. `npm.cmd run typecheck:nova-core`
7. `npm.cmd run test:nova-runtime:syntax`
8. `npm.cmd run test:nova-runtime:e2e`
9. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-CerebrauCertification.ps1`
10. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/nova-core-runtime/Test-CerebrauDomainOrchestration.ps1`
11. `rg -n '^(<<<<<<<|=======|>>>>>>>)' server/domain/people Docs/24_MODULES/WORK/PEOPLE_PERSISTENCE_ARCHITECTURE Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json server/nova-core/people-lot-machine-contract.ts server/nova-core/people-lot-runtime-execution-contract.adapter.ts`
12. Contrôle `Test-Path` des 14 fichiers M01/M02 requis.
13. `rg -n -g '*.ts' -g '!*.test.ts' '^import .* from ' server/domain/people`
14. `rg -n -g '*.ts' -g '!*.test.ts' '\bDELETE\b|\.delete\(' server/domain/people`
15. `git diff --check`
16. `git status --short`
17. `Import-Module ./tools/nova-core-runtime/Cerebrau.Certification.psm1 -Force; Read-LotCertification -Repository (Get-Location).Path -DomainId PEOPLE -LotId P3-PEOPLE-001D | ConvertTo-Json -Depth 10`

## 4. Résultats réels

| Gate | Résultat réel |
|---|---|
| Tests PEOPLE | PASS — 25 tests, 0 échec. |
| Typecheck strict PEOPLE | PASS — code sortie 0, aucun diagnostic. |
| Non-régression Work | PASS — 43 tests, 0 échec. |
| Runtime applicable | PASS — 24 tests, 0 échec. |
| Core/NOVA | PASS — 541 tests, 0 échec. Le gate complet a également été rejoué après la transition de certification avec 541/541 PASS. Les tests du machine contract et de l'adapter PEOPLE sont inclus. |
| Typecheck NOVA Core | PASS — code sortie 0. |
| NOVA Runtime syntax | PASS — code sortie 0. |
| NOVA Runtime E2E | PASS — 15 scénarios, 0 échec. |
| CEREBRAU certification | PASS — 24 contrôles, 0 échec. |
| CEREBRAU Domain V2 | PASS — 51 contrôles, 0 échec. |
| Lecture CEREBRAU du dépôt réel | PASS — statut `CERTIFIED`, certification matérialisée, aucune incohérence registre/JSON. |
| Marqueurs de conflit | Aucun marqueur détecté. |
| Présence M01/M02 | PASS — 14/14 fichiers requis présents. |
| Frontières de dépendances | PASS — seulement imports Node et PEOPLE locaux. |
| Suppression métier | PASS — seulement triggers SQL d'interdiction de suppression. |
| `git diff --check` avant et après transition | PASS — code sortie 0 ; avertissements LF/CRLF non bloquants. |

## 5. Synthèse PASS/FAIL

- Préconditions : PASS 5/5.
- Matrice A–K : PASS 11/11.
- PEOPLE : PASS 25/25.
- Typecheck PEOPLE : PASS.
- Work : PASS 43/43.
- Runtime : PASS 24/24.
- Core/NOVA : PASS 541/541 ; typecheck PASS ; syntax PASS ; E2E PASS 15/15.
- CEREBRAU : PASS 24/24 et 51/51.
- Git diff check : PASS.
- Régression critique : aucune observée.

## 6. Contrôles impossibles ou non applicables

Aucun contrôle obligatoire du gate n'est resté impossible.

Aucun chemin de base PEOPLE opérationnelle externe au dépôt n'est configuré. Une instance de production non désignée n'a donc pas été auditée ni inventée comme preuve. Les preuves locales dédiées couvrent réellement redémarrage, backup, restore, reconstruction et détection de corruption.

Sous Windows/PowerShell, les scripts npm ont été exécutés via le shim `npm.cmd`, qui lance exactement les scripts déclarés dans `package.json` sans dépendre de la politique d'exécution de `npm.ps1`.

## 7. Changements effectués par M03

- Remplacement du rapport M03 préexistant et obsolète par le présent rapport fondé sur cette exécution.
- Passage de `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json` de `PENDING_EVIDENCE` à `CERTIFIED`, ajout des preuves/tests réels, `Regressions = NONE` et horodatage de certification.
- Alignement du seul statut de l'entrée P3-PEOPLE-001D dans `Docs/12_CERTIFICATION/certification-registry.json`, requis pour éviter `CONTEXT_AMBIGUOUS:CERTIFICATION_REGISTRY_MISMATCH` dans le lecteur CEREBRAU.
- Aucun code PEOPLE, Work, Runtime, NOVA Core, BFF, frontend, outil ou CEREBRAU modifié.
- Aucun travail P3-PEOPLE-001E commencé.

Le changement de `MissionId` du JSON depuis la baseline Git (`P3-PEOPLE-001C-CERTIFICATION` vers `P3-PEOPLE-001D-CERTIFICATION`) était déjà présent avant cette exécution M03 ; il n'est pas attribué à la présente mission.

## 8. Risques résiduels

- Les livrables M01/M02, leurs documents d'architecture et plusieurs artefacts hors mission restent non commités ou non suivis. Les tests les valident dans l'état courant, mais leur packaging reste nécessaire pour éviter une perte de preuve.
- Les avertissements de normalisation LF/CRLF restent présents mais ne font pas échouer `git diff --check`.
- L'absence de chemin d'exploitation PEOPLE externe signifie que les preuves certifient l'implémentation et ses scénarios durables locaux, pas une instance de production non fournie.

## 9. État du fichier de certification

`Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json` porte désormais :

- `MissionId`: `P3-PEOPLE-001D-CERTIFICATION` ;
- `DomainId`: `PEOPLE` ;
- `LotId`: `P3-PEOPLE-001D` ;
- `Status`: `CERTIFIED` ;
- `CertifiedAt`: `2026-08-07T21:54:56.980Z` ;
- `Evidence`: rapports M01/M02/M03 et tests de persistance réels ;
- `Tests`: commandes réellement exécutées et résultats réels ;
- `Regressions`: `NONE`.

Le schéma existant est conservé. L'entrée de registre correspondante porte le même statut. Le champ préexistant `NextAuthorizedLot` reste inchangé ; aucune mission ni aucun artefact P3-PEOPLE-001E n'a été ouvert.

## 10. Décision finale

Toutes les préconditions, toutes les exigences A–K et tous les gates applicables sont prouvés PASS sur l'état courant du dépôt. Aucune preuve obligatoire ne manque et aucune régression critique n'est observée.

GO — P3-PEOPLE-001D-M03 — P3-PEOPLE-001D CERTIFIED

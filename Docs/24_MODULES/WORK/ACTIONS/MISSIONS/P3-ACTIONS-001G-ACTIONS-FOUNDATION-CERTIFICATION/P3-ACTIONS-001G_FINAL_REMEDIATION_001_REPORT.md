# P3-ACTIONS-001G — FINAL REMEDIATION 001 — RAPPORT

## 1. Mission identifier

`P3-ACTIONS-001G-FINAL-REMEDIATION-001`

Ce rapport constitue une preuve technique de remédiation. Il ne certifie pas P3-ACTIONS-001G, ne modifie aucun registre et ne remplace pas l'approbation humaine finale obligatoire.

## 2. Starting state

Le rapport de certification avait démontré les trois blockers suivants :

- `ACTIONS-G-FINAL-001` : `NovaCoreService.open` construisait une politique `workExists` fondée sur `runtime.getMission`, mais ne la transmettait à aucune composition ACTIONS. La variable était morte et aucun accès ACTIONS de production n'existait.
- `ACTIONS-G-FINAL-002` : `ActionsAuthority.#restore` rejouait chaque `ProposeAction` historique via le chemin d'admission courant. Un journal valide devenait illisible si la source Work rejetait ensuite le Work ou devenait indisponible.
- `ACTIONS-G-FINAL-003` : `ACTION_EVENT_TYPES` contenait 18 valeurs, dont `ActionRetried`, alors que le blueprint et le contrat ferment le vocabulaire à 17 Events exacts.

Au début de la validation finale consignée ici, le worktree contenait déjà les corrections candidates et leurs tests. Elles n'ont pas été tenues pour acquises : les causes ont été reconfirmées contre le rapport de certification, le contrat et le diff courant, puis chaque fermeture a été exécutée dans l'ordre imposé. Le worktree était déjà fortement sale ; `server/domain/actions/` et le répertoire de mission ACTIONS étaient non suivis. Aucun delta étranger n'a été nettoyé, restauré ou réinitialisé.

## 3. Files read

Autorités et preuves lues :

- `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md`
- `Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md`
- `Docs/24_MODULES/WORK/ACTIONS_IMPLEMENTATION_CONTRACT.md`, incluant son TEST CONTRACT
- `Docs/24_MODULES/WORK/WORK_PHASE1_CERTIFICATION.md`
- rapports P3-ACTIONS-001B, 001C, 001D, 001E et 001F
- `P3-ACTIONS-001G_ACTIONS_FOUNDATION_CERTIFICATION_REPORT.md`
- `P3-ACTIONS-001G_CORRECTION_001_REPORT.md`
- `P3-ACTIONS-001G_CORRECTION_002_REPORT.md`
- `P3-ACTIONS-001G_CORRECTION_003_REPORT.md`

Code et configuration inspectés :

- tous les fichiers sous `server/domain/actions/`
- `server/domain/work/work-actions.query.ts`, `work-actions.types.ts`, `work-actions.test.ts` et les configurations Work
- `server/runtime/work/work-core-foundation.ts`, `work-core.types.ts`, tests WCF-001 et exports Work Core
- `server/runtime/orchestrator/orchestrator-runtime.ts` et ses types/consommateurs pertinents
- `server/nova-core/nova-core.service.ts`, `nova-core.service.test.ts`, `nova-core.server.ts`, `nova-core.bootstrap.ts`, `home-active-work.query.ts`
- `package.json`, `tsconfig.nova-core.json` et les tsconfig des domaines concernés

## 4. Files modified

Fichiers fonctionnels :

- `server/domain/actions/actions-authority.ts`
- `server/domain/actions/action-authority.events.ts`
- `server/nova-core/nova-core.service.ts`

Tests :

- `server/domain/actions/actions-authority.test.ts`
- `server/domain/actions/actions-persistence.test.ts`
- `server/domain/actions/actions-retry.test.ts`
- `server/nova-core/nova-core.service.test.ts`

Rapport créé :

- `Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001G-ACTIONS-FOUNDATION-CERTIFICATION/P3-ACTIONS-001G_FINAL_REMEDIATION_001_REPORT.md`

## 5. FINAL-001 root cause

La politique manuelle était sémantiquement correcte : `projectIdentity -> projectId`, `workIdentity -> missionId`, puis `runtime.getMission(projectId, missionId) !== null`. Elle utilisait la même instance `OrchestratorRuntimeService` que WCF-001 et `HomeActiveWorkQuery`. Cependant, elle n'était pas consommée : aucune `ActionsAuthority`, aucun `ActionsInternalAccess` et aucun `ActionsJournal` de production ne la recevaient.

## 6. FINAL-001 correction

`NovaCoreService.open` compose désormais :

1. l'unique `ActionsAdmissionPolicy` sur l'instance Runtime propriétaire ;
2. l'unique `ActionsJournal` durable, par défaut à `${filePath}.actions.json`, avec override technique optionnel `actionsJournalPath` ;
3. `ActionsInternalAccess.durable(policy, journal)` ;
4. cette capacité interne comme propriété read-only `actionsInternalAccess` du service NOVA Core.

La composition utilise le journal ACTIONS existant, sans Work store, miroir, cache ou nouvelle identité. Le port reste possédé par ACTIONS et la production fournit seulement son implémentation read-only. Aucune liaison morte ne subsiste.

## 7. FINAL-001 evidence

- Test `NOVA Core composes durable ACTIONS admission from the canonical Mission-backed Work` : une Mission canonique admet la proposition, un Work absent produit `WORK_REFERENCE_NOT_FOUND`, puis l'Action est relue après réouverture depuis le journal durable.
- Scan production : `actionsAdmissionPolicy` est transmis à `ActionsInternalAccess.durable` et appelle `runtime.getMission`.
- Scan fixture ciblé ACTIONS/NOVA Core hors tests : aucune occurrence de `ADMIT_ALL` ou `workExists: () => true`.
- `HomeActiveWorkQuery` et ACTIONS consomment la même instance Runtime créée par `NovaCoreService.open`.

`ACTIONS-G-FINAL-001 = CLOSED`

## 8. FINAL-002 root cause

`#restore` appelait `#acceptInMemory` sans distinguer une nouvelle intention d'un fait canonique déjà accepté. L'admission Work était donc évaluée avant même la résolution d'une causalité déjà connue, pendant la construction, les lectures durables et les retries idempotents.

## 9. FINAL-002 correction

Le chemin interne distingue maintenant explicitement `NEW_COMMAND` et `HISTORICAL_REPLAY`.

- Une nouvelle `ProposeAction`, sans receipt causal antérieur, appelle toujours `workExists` et reste fail-closed.
- Le replay d'une entrée canonique n'appelle pas la source Work externe ; il reconstruit puis compare toujours intégralement le receipt durable.
- Une répétition causale exacte retourne le receipt historique avant admission externe.
- Une causalité divergente reste rejetée.
- Hashes, séquences, décodage, receipt integrity, CAS, graphe et corruption detection sont inchangés.

Aucun fait historique, journal, receipt ou Work n'est modifié ou compensé.

## 10. FINAL-002 evidence

Le test `historical replay and exact idempotence do not re-evaluate current Work admission` écrit une proposition avec Work admis, reconstruit et relit le journal avec une politique qui lève `CURRENT_WORK_SOURCE_UNAVAILABLE`, puis rejoue la causalité exacte. Le compteur d'admission reste à zéro. Une nouvelle proposition appelle bien la politique et échoue.

La suite persistence complète confirme également replay, corruption fail-closed, atomicité, Action CAS, graph CAS, causalité et concurrence.

`ACTIONS-G-FINAL-002 = CLOSED`

## 11. FINAL-003 root cause

La correction 003 antérieure avait résolu le détournement de `ActionResumed` en inventant `ActionRetried`. Cette solution contredisait toutefois l'autorité supérieure : le blueprint et le contrat définissent exactement 17 Events et ne contiennent aucun Event de retry.

## 12. FINAL-003 correction

`ActionRetried` est supprimé de `ACTION_EVENT_TYPES` et de la table des payloads. `RetryAction` conserve strictement la sémantique autorisée `FAILED -> READY`, le contrôle de statut, la révision, la causalité, le receipt et l'entrée durable, mais ne fabrique aucun Event métier non autorisé. `ResumeAction` et `ActionResumed` restent inchangés et réservés à une origine `BLOCKED`.

Cette correction ne choisit aucun Event existant au sens incompatible et n'étend pas le contrat fermé.

## 13. FINAL-003 evidence

- Test ciblé : `RetryAction preserves FAILED to READY without inventing an eighteenth Event`.
- Test durable : transition `READY`, receipt sans Event inventé, replay identique et aucun append idempotent.
- Test Resume inchangé : `ActionResumed` conserve `{ from: "BLOCKED", to: "IN_PROGRESS" }`.
- Exécution du module : 17 Events uniques, dans l'ordre exact du contrat.
- Scan fonctionnel : aucune occurrence de `ActionRetried`.

`ACTIONS-G-FINAL-003 = CLOSED`

## 14. Complete test matrix

| Périmètre | Commande | Résultat |
|---|---|---|
| ACTIONS | `node --import tsx --test server/domain/actions/*.test.ts` | PASS — 44/44 |
| WORK + Runtime/Work | `node --import tsx --test server/domain/work/*.test.ts server/runtime/work/*.test.ts` | PASS — 67/67 |
| PLANNING | `node --import tsx --test server/domain/planning/*.test.ts` | PASS — 50/50 |
| PEOPLE | `node --import tsx --test server/domain/people/*.test.ts` | PASS — 39/39 |
| Runtime complet | liste récursive de tous les `server/runtime/**/*.test.ts`, puis `node --import tsx --test` | PASS — 324/324 |
| NOVA Core | `npm.cmd run test:core` | PASS — 542/542 |

Les runs finaux indiquent 0 fail, 0 cancelled, 0 skipped et 0 todo.

Cette matrice a été réexécutée séquentiellement le 2026-09-13. Les six suites ont toutes terminé avec le code 0 et les totaux ci-dessus.

Une première exécution de NOVA Core, lancée en parallèle de la suite Runtime,
a échoué sur le seul test temporel `runner aborts a process tree and reports
TIMEOUT` (`Missing expected rejection`). Le fichier ciblé a immédiatement été
rejoué seul avec succès (3/3), puis la suite NOVA Core complète a été rejouée
seule avec succès (542/542). Cette première exécution sous contention n'est pas
masquée et reste enregistrée comme avertissement de stabilité du test.

## 15. TypeScript validation results

| Périmètre | Commande | Résultat |
|---|---|---|
| ACTIONS | `.\node_modules\.bin\tsc.cmd -p server/domain/actions/tsconfig.json` | PASS — 0 erreur |
| WORK | `.\node_modules\.bin\tsc.cmd -p server/domain/work/tsconfig.json` | PASS — 0 erreur |
| PLANNING | `.\node_modules\.bin\tsc.cmd -p server/domain/planning/tsconfig.json` | PASS — 0 erreur |
| PEOPLE | `tsc --noEmit --strict ... server/domain/people/*.ts` | PASS — 0 erreur |
| NOVA Core | `npm.cmd run typecheck:nova-core` | PASS — 0 erreur |

## 16. Structural scan results

- Agrégat : une seule déclaration `export class Action`.
- Authority : une seule déclaration `export class ActionsAuthority` et une seule frontière `accept(command)`.
- Durable : une seule classe `ActionsJournal`; la composition NOVA Core instancie ce mécanisme, aucun second type de source durable ACTIONS.
- Work admission : policy concrète consommée par `ActionsInternalAccess.durable`; aucune fixture permissive en production ACTIONS/NOVA Core.
- Replay : `#restore` utilise explicitement `HISTORICAL_REPLAY`; seule une nouvelle proposition utilise `#assertWorkExists`.
- Event vocabulary : 17 valeurs exactes ; aucune occurrence fonctionnelle de `ActionRetried`.
- Work mirror/mutation : aucune référence à Authority, Commands, Journal, Repository, Store, Cache, `execute` ou `accept` dans les fichiers fonctionnels `work-actions.*`.
- Cross-domain ACTIONS : aucun import fonctionnel depuis PLANNING, PEOPLE, Runtime, BFF ou frontend.
- Objective, Lifecycle et Progress : aucune mutation ou copie ajoutée.

## 17. `git diff --check`

PASS — exit code 0, aucune erreur whitespace. Git affiche uniquement 11 avertissements LF/CRLF sur des fichiers suivis déjà présents dans le worktree. Un scan explicite des huit fichiers de remédiation ne trouve aucun espace final.

## 18. Remaining warnings

- Le premier run NOVA Core exécuté en parallèle de Runtime a exposé une
  sensibilité de timing du test de timeout `process-runner.test.ts`. Le test
  ciblé (3/3) et le rerun Core complet isolé (542/542) passent ; aucune
  régression ACTIONS n'a été reproduite.
- Un scan global trouve `workExists: () => true` dans
  `server/domain/planning/planning-persistence-sqlite-adapter.ts`. Cette
  occurrence PLANNING préexistante n'est ni importée ni consommée par ACTIONS ;
  le scan ciblé des chemins fonctionnels ACTIONS/NOVA Core ne trouve aucune
  admission fixture.
- `server/domain/actions/` et le répertoire de mission sont non suivis dans l'état Git entrant ; `git diff --check` ne contrôle pas seul ces fichiers, d'où le scan whitespace complémentaire.
- Un journal externe produit par l'ancienne sémantique non autorisée `ActionRetried` échouera désormais fermé par incohérence de receipt. Aucune migration de faits non contractuels n'a été inventée.
- Le chemin journal de production possède un défaut déterministe adjacent au fichier Runtime et peut être explicitement fourni via `actionsJournalPath`. La politique de déploiement/backup reste hors de cette mission.

## 19. Remaining unknowns

Aucun inconnu bloquant ne subsiste pour les trois corrections demandées. Restent volontairement hors périmètre : transport public, API/BFF/frontend, scheduler/queue, Dependencies inter-Work et relations futures PLANNING/PEOPLE/Decisions/Deliverables/Runtime.

## 20. Exact Git delta

Delta de cette remédiation : 3 fichiers fonctionnels modifiés, 4 fichiers de tests modifiés et 1 rapport créé, listés en section 4.

Pour les deux fichiers suivis, le diff mesuré est :

- `server/nova-core/nova-core.service.ts` : 25 insertions, 1 suppression ;
- `server/nova-core/nova-core.service.test.ts` : 57 insertions.

Les fichiers ACTIONS et ce rapport étaient dans des arbres non suivis dès l'entrée ; Git ne peut donc pas fournir un numstat différentiel fiable contre leur état pré-mission. Aucun autre changement du worktree n'est attribué à cette remédiation.

## 21. Recommendation

Les trois blockers sont démontrés fermés et toutes les régressions obligatoires passent.

`READY_FOR_RECERTIFICATION`

Cette recommandation n'est pas une certification. L'approbation humaine finale reste obligatoire.

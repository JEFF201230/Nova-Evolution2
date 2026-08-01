# PROGRAM-CERTIFICATION-PEOPLE-001

## Périmètre et méthode

Audit en lecture seule du contrat, du blueprint, du registre de certification, du détecteur CEREBRAU, des rapports et de l’historique Git. Aucun code, test, contrat ou état de certification n’a été modifié.

## État officiel de certification

`Docs/12_CERTIFICATION/certification-registry.json` contient :

| Lot | Statut | Lot précédent | Lot suivant |
|---|---|---|---|
| P3-PEOPLE-001C | CERTIFIED | P3-PEOPLE-001B | P3-PEOPLE-001D |
| P3-PEOPLE-001D | PENDING_EVIDENCE | P3-PEOPLE-001C | P3-PEOPLE-001E |

`Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001D.certification.json` est également `PENDING_EVIDENCE`, avec `Evidence=[]`, `Tests=[]` et `Regressions=NOT_EVALUATED`.

La certification officielle n’a donc jamais été clôturée.

## Contrat et blueprint

`Docs/24_MODULES/WORK/PEOPLE_IMPLEMENTATION_CONTRACT.md` définit explicitement :

- P3-PEOPLE-001D = **People Persistence** ;
- création bloquée jusqu’à P3-PEOPLE-001D ;
- persistance canonique Business Person et Work People ;
- histoire, atomicité, unicité, concurrence, idempotence et migration ;
- sortie du lot uniquement après validations PASS et rapport GO.

`Docs/24_MODULES/WORK/PEOPLE_DOMAIN_BLUEPRINT.md` précise que le blueprint est métier, ne décrit ni implémentation ni persistance, et impose l’autonomie PEOPLE vis-à-vis du Runtime. Il ne contredit donc pas l’existence d’une implémentation P3-D; il ne fournit simplement pas la clôture de certification.

## Code détecté

Les fichiers présents sous `server/domain/people` sont de vrais fichiers TypeScript exécutables et correspondent au périmètre P3-D :

- `people-persistence-schema.ts` — schéma/migrations SQLite ;
- `people-persistence-ports.ts` — ports de persistance ;
- `people-persistence-sqlite-adapter.ts` — adaptateur SQLite ;
- `people-persistence-aggregate-store.ts` — persistance Business Person/Work People ;
- `people-persistence-history.ts` — historique, snapshots et replay ;
- tests associés D1 à D5.

Les tests PEOPLE ont été exécutés avec succès (24/24), ainsi que le typecheck NOVA Core, les tests Core (541/541) et Runtime (24/24).

## Détecteur Runtime

Dans `tools/nova-core-runtime/Cerebrau.DomainOrchestration.psm1` :

- `Test-LotCodePresence` commence par les fichiers d’évidence; ceux-ci sont vides pour P3-D, puis inspecte les racines de code ;
- pour le stage `Persistence`, le pattern est `Persistence|Repository|Store|Journal|Storage|Snapshot` ;
- il parcourt les fichiers `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`, `.ps1`, `.psm1` et les déclarations de classes/interfaces/types/fonctions/constantes ;
- `Resolve-LotExecutionMode` retourne `BACKFILL` si `CurrentStatus=PENDING_EVIDENCE` et si `Test-LotCodePresence.Exists=$true`; sinon il retourne `IMPLEMENTATION`.

Les symboles `PeoplePersistenceSchema`, `PeoplePersistenceTransactionManager`, `PeopleSQLiteAggregateRepository`, `PeopleEventHistoryStore` et `PeopleAggregatePersistenceStore` satisfont directement ce détecteur. Le classement `BACKFILL` est donc cohérent avec le code présent; aucun faux positif n’a été identifié.

## Historique Git et origine des fichiers

`git log --all -- server/domain/people/people-persistence-*.ts` ne retourne aucun commit. `git log --diff-filter=A` ne retourne aucune introduction commitée de ces fichiers.

Les fichiers sont actuellement non suivis dans le worktree (`git status --short` les marque `??`). Ils ont été écrits pendant l’exécution de la mission `P3-PEOPLE-001D-SUPER-WAVE-001`, via les étapes D1 à D5 de cette Super Wave. Il n’existe donc pas d’auteur Git, de SHA de commit ou de mission certifiée associée à leur introduction.

Les rapports de cette Super Wave indiquent :

- D1 : GO ;
- D2 : GO ;
- D3 : GO ;
- D4 : GO ;
- D5 : GO ;
- D6 : NO GO, car le scénario historique `people-pilot-resolves-current-lot` attend `IMPLEMENTATION` alors que la présence réelle du code entraîne `BACKFILL`.

La Super Wave n’a donc jamais produit de certification finale GO.

## Comparaison des hypothèses

### Cas A — confirmé

Le code de persistance PEOPLE a été effectivement introduit pour le lot P3-PEOPLE-001D, conformément au périmètre du contrat et de la Super Wave. La certification officielle est restée `PENDING_EVIDENCE`; le test `people-pilot-resolves-current-lot` conserve l’attente historique `IMPLEMENTATION`, devenue incompatible avec la présence du code et la règle `PENDING_EVIDENCE + code présent = BACKFILL`.

### Cas B — non retenu

L’introduction n’est pas une dérive vers un autre lot : les noms, racines et responsabilités correspondent exactement à People Persistence. Le contrat prévoit précisément une phase de preuve après implémentation; `PENDING_EVIDENCE` est l’état attendu tant que cette phase n’est pas clôturée.

### Cas C — rejeté

Le détecteur ne signale pas un fichier documentaire ou une simple mention. Il trouve des déclarations TypeScript exécutables dans `server/domain/people` correspondant au pattern Persistence. Le `BACKFILL` est donc fondé sur une présence de code réelle.

## Décision

**A**


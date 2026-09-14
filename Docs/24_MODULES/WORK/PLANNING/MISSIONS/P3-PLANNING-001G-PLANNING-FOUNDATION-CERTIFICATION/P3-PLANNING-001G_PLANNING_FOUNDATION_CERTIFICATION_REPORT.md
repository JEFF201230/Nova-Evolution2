# P3-PLANNING-001G — PLANNING FOUNDATION CERTIFICATION — RAPPORT

## Identification

| Attribut | Valeur |
|---|---|
| ProgramId | `PROGRAM-003` |
| MissionId | `P3-PLANNING-001G-IMPLEMENTATION-001` |
| LotId | `P3-PLANNING-001G` |
| Domaine | `PLANNING` |
| Branche examinée | `feature/nova-runtime-foundation` |
| HEAD d'entrée | `bc29b12ba7adaf34ef9ffc7bddc5376d5d26e88d` |
| Nature | Audit final de `P3-PLANNING-001` |
| État de sortie | `READY_FOR_REVIEW` |

Ce rapport est une décision technique soumise à revue humaine. Il ne constitue pas la
certification canonique de `P3-PLANNING-001G`, ne clôt pas définitivement le domaine PLANNING et
n'ouvre pas Actions.

## Entry Gate

| Condition | Résultat | Preuve |
|---|---|---|
| `P3-PLANNING-001F` est certifié | PASS | `P3-PLANNING-001F.certification.json`: `LotId=P3-PLANNING-001F`, `MissionId=P3-PLANNING-001F-IMPLEMENTATION-001`, `Status=CERTIFIED`, `NextAuthorizedLot=P3-PLANNING-001G`. |
| Rapports B à F disponibles | PASS | B: rapport officiel Runtime et transcript désignés par sa certification; C: rapport officiel lié à la certification et rapport final de revue 004B; D, E et F: rapports de mission dédiés présents. |
| Lot courant canonique | PASS | L'ordre de mission exécuté porte `lot=P3-PLANNING-001G` et `missionId=P3-PLANNING-001G-IMPLEMENTATION-001`; le prompt porte le même lot. |
| Aucun lot antérieur requis incomplet ou contradictoire | PASS | B, C, D, E et F sont tous `CERTIFIED`; les couples Previous/Next forment la chaîne B → C → D → E → F → G; les preuves officielles contrôlées portent chacune le LotId et le MissionId de leur certification. |

**Résultat de l'Entry Gate : PASS.**

Le fichier `P3-PLANNING-001G.certification.json` déjà présent est seulement un placeholder
`PENDING_EVIDENCE`, sans preuve, et porte encore le MissionId de F. Il n'est ni une certification,
ni une autorité sur l'identité de la mission courante, ni une preuve utilisée dans cet audit.

## Sources examinées

- `Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md`, SHA-256
  `8DFB95E60A1816045D59818C7B1E9AD8819CE1D285CC1A34376C2AA4AA764FE1`;
- `Docs/24_MODULES/WORK/PLANNING_DOMAIN_BLUEPRINT.md`, SHA-256
  `E87C1513AFB22CF5A1164D8057D7F819643E138735966A0045271B540097F17F`;
- certifications B à F sous `Docs/12_CERTIFICATION/PLANNING/`;
- rapports et preuves officielles B à F détaillés ci-dessous;
- implémentation et tests sous `server/domain/planning/`;
- intégration et tests sous `server/domain/work/`;
- suites applicables sous `server/runtime/work/`, `server/domain/people/`,
  `server/runtime/`, `server/nova-core/`;
- ordre de mission `tools/nova-core-runtime/mission.P3-PLANNING-001G-IMPLEMENTATION-001.json`;
- état et delta Git du workspace.

## Audit consolidé B à F

| Lot | Certification | Rapport/preuve contrôlé | Liaison LotId/MissionId | Continuité |
|---|---|---|---|---|
| B — Foundation Model | `CERTIFIED`; Mission `P3-PLANNING-001B-IMPLEMENTATION-001` | `tools/nova-core-runtime/reports/bootstrap-20260809T182515166/official-report.json`, SHA-256 `F3568535B09B46CC1D5050AE25D53E2352A7D0E6331C37374DCF2A83D988FB94`, et transcript associé | PASS: le rapport officiel porte exactement le LotId B et le MissionId certifié | `A → B → C` |
| C — Authoritative Producer | `CERTIFIED`; Mission `P3-PLANNING-001C-FINAL-EVIDENCE-002` | rapport officiel `.nova-data/.../P3-PLANNING-001C-FINAL-EVIDENCE-002/.../official-report.json`, SHA-256 `DF8711EBD81EB4FACF4C9E13632561C395EFE33F218D4B56C5E3398D8DE183B4`; revue 004B disponible, SHA-256 `5213049E8B1F842544E4FEEF53AB760584668F7B34BF7F67290EC620A8AE1868` | PASS: la preuve de certification porte exactement le LotId C et le MissionId certifié; la revue 004B reste une preuve de revue du même lot et n'est pas substituée au rapport officiel lié | `B → C → D` |
| D — Persistence | `CERTIFIED`; Mission `P3-PLANNING-001D-IMPLEMENTATION-001` | rapport de mission SHA-256 `3317E7A7FB468C6AE0B6C2536DAD4BFD1ECCDFE5D50A023089EB9372A0B1ED5D`; rapport officiel lié SHA-256 `D474878E0B4EBE78D1D382AA689A7E843E9E99A1AF0833A54BEA87DE5003B53E` | PASS: LotId D et MissionId D exacts | `C → D → E` |
| E — Internal Access | `CERTIFIED`; Mission `P3-PLANNING-001E-IMPLEMENTATION-001` | rapport de mission SHA-256 `C45A78B4980146FED1F530EAEA32C227BD83E54749320CF1F2B59DCE5E902C5E`; rapport officiel lié SHA-256 `356CECA417317DCC8E2029E7FD9294E5E3903DCE79506A37589F3737CA87E7C2` | PASS: LotId E et MissionId E exacts; l'addendum final du rapport remplace explicitement le verdict initial | `D → E → F` |
| F — Work Integration | `CERTIFIED`; Mission `P3-PLANNING-001F-IMPLEMENTATION-001` | rapport de mission SHA-256 `4D98C54B79213CA4973865F7F8FC2CC5E6B15965562061FC112AFA3E2E1E6F7B`; rapport officiel lié SHA-256 `544D29EC72F54D295DA3CE4A0C0FA9B6004229B17D225FCD9D3DE4421C48BC2C` | PASS: LotId F et MissionId F exacts | `E → F → G` |

Aucune preuve d'un autre lot n'a été employée comme preuve de certification. La chaîne des
certifications et le registre convergent sur B → C → D → E → F → G.

## Conformité au blueprint et au contrat

### Planning Foundation Model

La racine est le Planning d'un Work, identifié uniquement par `WorkReference`. Le modèle contient
les versions immuables, Phase, Milestone, Dependency, Schedule, Priority, Constraint,
BusinessInstant/BusinessPeriod et PlanningProvenance. Les validations globales imposent notamment
l'unicité des identités, la cohérence des références, l'acyclicité, le temps métier qualifié,
l'absence de priorité implicite et l'histoire contiguë non destructive.

### Ownership et producteur autoritatif

`PlanningAuthority` est l'unique chemin de production de l'agrégat. Le constructeur de `Planning`
est privé et `Planning.of` exige le jeton interne de l'Authority. Les seules mutations métier sont
`EstablishPlanning`, `RevisePlanning` et `WithdrawPlanning`; elles revalident l'admission, la
version attendue, l'autorité, la causalité et la proposition complète. `MilestoneReached` n'est pas
émissible. Aucun second producteur n'a été trouvé.

### Persistence

`PlanningSQLiteRepository` implémente l'unique port `PlanningRepository`. Le stockage conserve tête
courante, versions, faits et receipts; il impose CAS, idempotence, atomicité et replay par les faits
acceptés de PlanningAuthority. Les migrations sont versionnées et vérifiées. Backup, restore et
rebuild reconstruisent la vérité depuis l'histoire sans promouvoir une tête mutable corrompue.
Timeline n'est pas persistée comme autorité.

### Internal Access

`PlanningCommands` route les trois commandes vers PlanningAuthority puis le repository canonique.
`PlanningQueries` expose les cinq lectures prévues: courant, version, histoire, Timeline et
Schedule. Les lectures distinguent indisponibilité, absence, retrait, version absente et valeur
explicitement vide; elles n'écrivent rien et n'inventent aucune donnée. Aucun transport public,
route, BFF, API, frontend ou IAM n'est introduit par cette frontière.

### Work Integration et absence de miroir

`WorkPlanningQuery` dépend d'un port de lecture `getCurrentPlanning` et reconstruit la seule
`WorkReference` canonique. Il expose exactement quatre états qualifiés:
`PLANNING_UNAVAILABLE`, `PLANNING_ABSENT`, `PLANNING_WITHDRAWN` et `PLANNING_AVAILABLE`.
La provenance, l'applicabilité et la version proviennent de la lecture Planning. Le module Work ne
contient aucun agrégat, historique, graphe, commande, repository, cache, store ou persistence
Planning et ne peut pas écrire dans Planning.

### Séparation Planning / Work / Progress

Work conserve l'identité, Objective, Lifecycle et Progress. Planning conserve exclusivement
l'intention temporelle, séquentielle et contraignante. L'intégration ne renvoie ni Objective, ni
Lifecycle, ni progression et ne fabrique aucun état à partir de Monitoring, Runtime, timestamp,
queue, scheduler ou timer. Aucune Action, Decision, Deliverable ou Business Person n'est produite.

### Provenance et causalité

Les commandes, révisions, événements, receipts et résultats persistés conservent WorkReference,
PlanningVersion, CausalityId, corrélation et PlanningProvenance. Une causalité identique avec un
contenu identique rejoue le reçu durable; une causalité réutilisée avec un contenu différent est
rejetée. Le replay vérifie que les faits stockés correspondent aux faits déterministes réémis par
l'Authority.

## Validations exécutées

Toutes les commandes ci-dessous ont été exécutées dans la mission courante. Aucun résultat
historique n'est déclaré comme résultat d'exécution 001G.

| Catégorie | Commande | Résultat exact |
|---|---|---|
| Tests Planning complets | `node --import tsx --test server/domain/planning/*.test.ts` | PASS — 50 tests, 50 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo; exit code 0 |
| Intégration Work/Planning | `node --import tsx --test server/domain/work/work-planning.test.ts` | PASS — 8 tests, 8 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo; exit code 0 |
| Non-régression Work | `node --import tsx --test server/runtime/work/*.test.ts` | PASS — 51 tests, 51 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo; exit code 0 |
| Non-régression PEOPLE | `node --import tsx --test server/domain/people/*.test.ts` | PASS — 39 tests, 39 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo; exit code 0 |
| Runtime/Core applicable | `npm.cmd test` | PASS — Runtime 24/24 puis NOVA Core 541/541; 0 échec; exit code 0 |
| Typecheck Planning | `npx.cmd tsc -p server/domain/planning/tsconfig.json` | PASS — exit code 0, aucune erreur |
| Typecheck Work | `npx.cmd tsc -p server/domain/work/tsconfig.json` | PASS — exit code 0, aucune erreur |
| Typecheck NOVA Core | `npm.cmd run typecheck:nova-core` | PASS — exit code 0, aucune erreur |
| Contrôle whitespace/diff | `git diff --check` | PASS — exit code 0; aucun défaut whitespace; avertissements LF→CRLF seulement |

Ces suites couvrent les invariants, l'agrégat, les commandes, les événements, les queries, la
persistence, les dépendances, le temps métier, l'intégration Work, la séparation Progress, les
frontières interdomaines et les non-régressions demandées par la section 15 du contrat.

## Régressions et état Git

- aucune régression Planning, Work, PEOPLE, Runtime ou Core observée;
- aucune erreur de typecheck observée;
- aucun défaut `git diff --check` observé;
- aucun code métier n'a été corrigé pendant 001G;
- le workspace était déjà `DIRTY` à l'entrée, avec de nombreux fichiers suivis modifiés/supprimés
  et des fichiers non suivis, y compris hors périmètre 001G. Ces changements préexistants ont été
  conservés et ne sont pas attribués à cette mission;
- le seul livrable créé par 001G est le présent rapport dans le chemin autorisé.

## Anomalies et réserves

1. Le lot B ne possède pas de rapport Markdown nommé dans son dossier de mission. Sa certification
   désigne toutefois explicitement un rapport officiel Runtime et son transcript; ils existent et
   portent le bon LotId et le bon MissionId. La preuve de certification B est donc disponible, mais
   cette différence de topologie documentaire doit rester connue de la revue humaine.
2. Le placeholder `Docs/12_CERTIFICATION/PLANNING/P3-PLANNING-001G.certification.json` est
   `PENDING_EVIDENCE`, vide, et porte `MissionId=P3-PLANNING-001F-IMPLEMENTATION-001`. Il n'a pas
   été modifié et n'a pas été utilisé. Toute future décision humaine sur 001G devra produire ou
   corriger l'identité canonique par le workflow d'approbation autorisé, jamais par auto-certification.
3. Les avertissements Git LF→CRLF concernent des fichiers déjà modifiés dans le workspace et ne
   constituent pas un échec de `git diff --check`.
4. Le blueprint courant diffère de `HEAD` par l'ajout documentaire de l'événement
   `MilestoneRemoved`. Cette source courante a été auditée telle quelle : l'événement est déjà
   défini par le contrat d'implémentation et émis par `PlanningAuthority`, sans nouvelle règle ni
   contradiction avec les certifications B à F. Le blueprint, hors périmètre d'écriture 001G,
   n'a pas été modifié par cette mission.

Ces réserves ne contredisent ni une certification antérieure B à F, ni l'identité de l'ordre de
mission G, ni les preuves techniques exécutées dans ce lot.

## Décision technique

**GO**

La Planning Foundation satisfait le blueprint, le contrat d'implémentation, la continuité des
certifications B à F, l'ownership unique, la persistence canonique, l'accès interne, l'intégration
Work read-only, la séparation Progress et les validations obligatoires exécutées.

## Conclusion de readiness

`P3-PLANNING-001G` est **READY_FOR_REVIEW**.

La revue humaine explicite reste obligatoire. Ce rapport n'écrit aucune certification canonique,
ne déclare pas PLANNING définitivement certifié et n'autorise ni n'ouvre Actions.

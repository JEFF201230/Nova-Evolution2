# NOVA — FRONTEND ↔ RUNTIME INTEGRATION PLAN

## 1. Décision de planification

**GO POUR LE PLAN — INTÉGRATION NON EXÉCUTÉE**

Les 31 unités visuelles sont rattachées à un point Frontend réel ou à un blocage explicite dans
[`NOVA_FRONT_RUNTIME_CONNECTION_MATRIX.md`](NOVA_FRONT_RUNTIME_CONNECTION_MATRIX.md).

Le premier lot à traiter est :

> **LOT F02 — WORK**, limité en première étape à **F02-A — Work Activity en lecture seule**.

Cette étape exploite uniquement les contrats existants `GET /api/v1/missions`,
`GET .../:missionId/events`, puis `GET .../monitor` et `GET .../monitor/stream`. Elle n'utilise
aucune mutation, aucun secret de certification, aucun endpoint nouveau et aucun Runtime nouveau.

Le lot F02 complet n'est pas déclaré immédiatement activable : Overview, Plan, People, Sources,
Decisions et Deliverables restent partiels ou bloqués par l'absence de projections de vue. La
désignation porte donc sur le plus petit raccordement fonctionnel inclus dans F02.

## 2. Base factuelle

| Élément | État vérifié |
|---|---|
| Patrimoine UX | 46/46 PNG ; 31/31 unités couvertes |
| Frontend | 24 `UI_READY`, 7 `UI_ONLY`, 0 appel réseau |
| Routes Frontend | 20 routes déclarées ; routes Decision spécialisées rabattues sur `DecisionsSurface` |
| Données Frontend | dix familles de fixtures et état React local |
| BFF | sessions/probes actives ; `POST /api/runtime/execute` `PARTIAL`, gateway non injecté |
| Core API | lectures missions, détail, monitoring, SSE, événements et certificat disponibles |
| Runtime SW-006 | 12/12 composants techniques activés ; 572/572 tests certifiés PASS |
| Contrat Program Engine | `ProgramProductionEntrypoint` interne, désactivé par défaut, non exposé par HTTP |
| Mutations navigateur | non certifiables avec les contrats actuels |
| Décision | Human Approval non exposé ; `/approve` retourne HTTP 410 |
| Tests Frontend SW-008 | typecheck PASS ; 143/143 tests PASS, sans E2E réseau |

PROGRAM-036 qualifie sa cible comme frontend-only, laisse les contrats backend en dépendance
ouverte et indique que les contrats API finaux des mutations manquent. Le présent plan ne ferme
pas implicitement cette dépendance.

## 3. Sources et autorité

Sources obligatoires exploitées :

- [`NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md`](NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md) ;
- [`NOVA_UI_RUNTIME_COVERAGE_REPORT.md`](NOVA_UI_RUNTIME_COVERAGE_REPORT.md) ;
- [`NOVA_DESIGN_V7_TRACEABILITY_MATRIX.md`](NOVA_DESIGN_V7_TRACEABILITY_MATRIX.md) ;
- [`NOVA_CAPABILITY_REGISTRY.md`](../../00_GOVERNANCE/NOVA_CAPABILITY_REGISTRY.md) ;
- [`NOVA_PLATFORM_ACTIVATION_MATRIX.md`](../../00_GOVERNANCE/NOVA_PLATFORM_ACTIVATION_MATRIX.md) ;
- [`NOVA_RUNTIME_REGISTRY.md`](../../00_GOVERNANCE/NOVA_RUNTIME_REGISTRY.md) ;
- [`NOVA_RUNTIME_TRACEABILITY_MATRIX.md`](../../00_GOVERNANCE/NOVA_RUNTIME_TRACEABILITY_MATRIX.md) ;
- [`NOVA_SW006_RUNTIME_ACTIVATION_REPORT.md`](../../00_GOVERNANCE/NOVA_SW006_RUNTIME_ACTIVATION_REPORT.md) ;
- [`PROGRAM_036_PROGRAM_ARCHITECTURE.md`](../../19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md) ;
- code et tests existants de `apps/nova-web`, `server/nova-bff`, `server/nova-core` et `server/runtime`.

Sources de contrôle complémentaires présentes à la racine :

- `PROGRAM_NOVA_UX_API_MAPPING.md` ;
- `PROGRAM_NOVA_UX_RUNTIME_INTEGRATION_REPORT.md` ;
- `PROGRAM_NOVA_UX_INTEGRATION_ROADMAP.md`.

Aucun contrat proposé par une roadmap n'est traité comme un contrat existant.

## 4. Ordre des lots

| Ordre | Lot | Première portée possible | Motif | État |
|---:|---|---|---|---|
| 1 | `F02 — WORK` | `F02-A Work Activity`, lecture ponctuelle des événements ; monitoring/SSE après preuve de lecture | UI, route, API, Service, Event Bus et Runtime existent ; lecture seule | **ACTIVABLE MINIMAL** |
| 2 | `F01 — FLOW PRINCIPAL` | Home minimal fondé sur la liste/détail des missions | lecture possible, mais projection Home incomplète ; Setup/Confirm bloqués | **PARTIEL** |
| 3 | `F04 — GLOBAL` | lecture Deliverables partielle à partir des rapports | aucune liste globale Decision/Deliverable, Search absent | **PARTIEL/BLOQUÉ** |
| 4 | `F03 — DECISION FLOW` | aucune mutation actuellement raccordable | composants spécialisés absents, Human Approval non exposé, `/approve` retiré | **BLOQUÉ** |

Cet ordre minimise le risque en commençant par une lecture append-only d'événements déjà activée
et testée, puis reporte les mutations et décisions irréversibles.

## 5. LOT F02 — WORK

### 5.1 Périmètre

- Work Shell ;
- Work Overview ;
- Work Plan ;
- Work Activity ;
- Work People ;
- Work Sources ;
- Work Decisions ;
- Work Deliverables ;
- Full Analysis, Person, Source et Deliverable drawers.

### 5.2 Prérequis

Pour `F02-A` :

1. utiliser uniquement le schéma existant `RuntimeMission`, `RuntimeEvent` et
   `RuntimeObservabilityEvent` ;
2. résoudre les identifiants exclusivement depuis `GET /api/v1/missions` :
   `workId` doit être relié à un `missionId` réel et le `projectId` doit provenir de la mission ;
3. ne pas appeler `POST /api/runtime/execute` ;
4. ne pas activer de mutation Core ;
5. conserver les états existants loading/empty/error ;
6. ne supprimer la fixture Activity qu'après preuve que la lecture réelle couvre le chemin activé.

Le point 2 est une condition de raccordement, pas un nouveau contrat : les deux identifiants sont
déjà présents dans `RuntimeMission`.

Pour le reste de F02, les projections Overview, Plan, People, Sources, Decisions et Deliverables
doivent déjà exister et être approuvées avant raccordement. Elles ne sont pas présentes dans le
dépôt audité ; les écrans concernés restent bloqués.

### 5.3 Fichiers Frontend concernés

Première étape F02-A :

- `apps/nova-web/src/components/routes/WorkSurface.tsx` — point d'injection actuel des fixtures ;
- `apps/nova-web/src/features/work/WorkActivityPage.tsx` — consommation des props et présentation ;
- `apps/nova-web/src/features/work/workActivityFixture.ts` — type de vue actuel et fixture à
  conserver tant que le chemin réel n'est pas prouvé ;
- `apps/nova-web/src/features/work/WorkActivityPage.test.tsx` — tests locaux existants ;
- `apps/nova-web/src/routes/RouteRegistry.ts` et `routeResolver.ts` — à vérifier, sans changement
  requis si `workId` reste le `missionId`.

Fichiers F02 ultérieurs, uniquement après levée de leurs blocages :

- `WorkOverviewPage.tsx`, `WorkPlanPage.tsx`, `WorkPeoplePage.tsx`,
  `WorkSourcesPage.tsx`, `WorkDecisionsPage.tsx`, `WorkDeliverablesPage.tsx` ;
- leurs sept fichiers `*Fixture.ts` et sept fichiers `*.test.tsx` ;
- `WorkPageHeader.tsx`, `NavigationShell.tsx` et `WorkSurface.tsx`.

### 5.4 BFF, Service et Runtime concernés

| Couche | Fichier / contrat | Rôle |
|---|---|---|
| BFF | aucun fichier BFF utilisable pour F02-A | le BFF n'expose pas les lectures missions/events |
| API Core | `server/nova-core/nova-core.http.ts` | `GET /api/v1/missions`, `GET .../events`, `GET .../monitor`, `GET .../monitor/stream` |
| Service | `server/nova-core/nova-core.service.ts` | `listMissions`, `getEvents`, `getObservabilityEvents`, `getIncompleteRuns`, `subscribeObservability` |
| Runtime | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | liste missions, Event Bus, événements, observabilité |
| Contrats | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | `RuntimeMission`, `RuntimeEvent`, `RuntimeObservabilityEvent` |

Ces fichiers serveur sont des dépendances consommées, pas des fichiers à modifier dans F02-A.

### 5.5 Ordre d'implémentation interne

1. `F02-A1` — charger la liste des missions et résoudre le couple réel
   `projectId/missionId` du Work ;
2. `F02-A2` — remplacer, sur le seul chemin Activity activé, la lecture
   `getWorkActivityFixture` par la réponse `GET .../events` ;
3. `F02-A3` — conserver uniquement les champs traçables :
   `eventName`, `producer`, `occurredAt`, `sequence`, états, payload et métadonnées ;
4. `F02-A4` — après certification de la lecture ponctuelle, raccorder le snapshot `monitor` ;
5. `F02-A5` — raccorder le SSE en conservant séquence, rejeu initial et absence de doublon ;
6. `F02-B` — n'ouvrir Overview et les autres tabs qu'après disponibilité objective de leurs
   projections existantes.

Les étapes décrivent un raccordement futur. Elles ne sont pas exécutées par SW-009.

### 5.6 Tests à exécuter

Tests existants :

- `npm.cmd run typecheck` dans `apps/nova-web` ;
- `npm.cmd test -- --run` dans `apps/nova-web` ;
- `WorkActivityPage.test.tsx` ;
- `NavigationShell.test.tsx` ;
- `RouteSurface.test.tsx` ;
- `server/nova-core/nova-core.http.test.ts` ;
- `server/nova-core/nova-core.service.test.ts` ;
- `server/nova-core/mission-event-publisher.test.ts` ;
- `server/runtime/orchestrator/orchestrator-runtime.test.ts`.

Il n'existe aucun test E2E Frontend → API dans le dépôt observé. L'absence de cette preuve interdit
de déclarer `FULLY_IMPLEMENTED`, même si les suites existantes passent.

### 5.7 Risques

| Risque | Preuve | Effet |
|---|---|---|
| identité incomplète dans la route | `/work/:workId` contre `projectId + missionId` | mauvaise mission ou requête impossible |
| divergence de modèle | `WorkActivityEventFixture` ≠ `RuntimeEvent` | perte ou invention de sémantique |
| accès direct Core | aucun BFF de lecture ; CORS Core `*` | non qualifiable comme façade de production |
| SSE | aucun `EventSource` ni test E2E existant | duplication, reconnexion ou fuite de connexion |
| confusion de certification | API v1 ≠ `ProgramProductionEntrypoint` | faux verdict d'intégration certifiée |

### 5.8 Critères de GO

`F02-A` est GO uniquement si :

- le `projectId/missionId` provient d'une `RuntimeMission` réelle ;
- aucune valeur métier absente de `RuntimeEvent` n'est inventée ;
- loading, empty, error et reprise sont démontrés ;
- ordre `sequence`, corrélation et non-duplication sont préservés ;
- la fixture n'alimente plus le seul chemin déclaré connecté ;
- toutes les suites existantes ci-dessus passent ;
- aucune mutation, aucun BFF Runtime Execute et aucun secret ne sont utilisés ;
- la qualification reste « API Core v1 en lecture seule », pas « Program Engine certifié ».

### 5.9 Critères de rollback

- revenir au point d'injection de fixture borné dans `WorkSurface.tsx` ;
- fermer toute connexion SSE et revenir à la lecture ponctuelle, puis à la fixture si nécessaire ;
- ne modifier aucune mission, aucun événement, aucune evidence et aucun certificat ;
- revalider les tests Work et Navigation existants ;
- ne pas modifier le Core, le BFF ou le Runtime pour effectuer le rollback.

## 6. LOT F01 — FLOW PRINCIPAL

### 6.1 Périmètre

Home collapsed/expanded, Home Situation Drawer, Clarify 1–3, Canvas read/editing, Plan
collapsed/expanded et Confirm.

### 6.2 État des contrats

- Home minimal : `GET /api/v1/missions` et détail mission sont disponibles, mais ne fournissent pas
  résumé, confiance, échéance, next best action ou analyse de situation ;
- Clarify/Canvas/Plan Setup : aucune API de brouillon, clarification, canvas ou preview de plan ;
- Confirm : `POST /api/v1/missions` existe, mais `WorkSetupProvider` ne contient pas tous les champs
  obligatoires de `MissionDefinition` ;
- exécution certifiée : le BFF attend un `PromptPackage` complet, mais son gateway n'est pas injecté
  et le Frontend ne produit aucun de ses objets.

### 6.3 Fichiers concernés

Frontend :

- `NavigationShell.tsx`, `HomePage.tsx`, `ObjectiveComposer.tsx`,
  `SituationDetailsDrawer.tsx`, `homeFixture.ts` ;
- `ClarifyPage.tsx`, `CanvasPage.tsx`, `PlanPage.tsx`, `ConfirmPage.tsx` ;
- `WorkSetupProvider.tsx`, `workSetupTypes.ts`, `workSetupFixtures.ts` ;
- `HomePage.test.tsx`, `SituationDetailsDrawer.test.tsx`,
  `WorkSetupFlow.test.tsx`, `WorkSetupProvider.test.tsx`.

Contrats serveur existants mais insuffisants :

- `server/nova-core/nova-core.http.ts` ;
- `server/nova-core/nova-core.service.ts` ;
- `server/runtime/orchestrator/orchestrator-runtime.types.ts` ;
- `server/nova-bff/runtime-execute.contract.ts`,
  `runtime-request.mapper.ts`, `runtime-gateway.port.ts`,
  `nova-bff.server.ts`.

### 6.4 Ordre, tests, risques et gates

Ordre :

1. Home lecture seule, après F02-A et en réutilisant exclusivement les IDs missions réels ;
2. aucune étape Clarify/Canvas/Plan/Confirm ne passe en mode connecté tant que les contrats de
   brouillon et la construction complète de `MissionDefinition` n'existent pas ;
3. aucune exécution depuis Confirm tant que le BFF ne compose pas son gateway réel.

Tests à exécuter :

- suites Frontend complètes, particulièrement Home et Work Setup ;
- `nova-core.http.test.ts`, `nova-core.service.test.ts` ;
- suites BFF `runtime-execute.route.test.ts`, `runtime-gateway.test.ts` uniquement lorsque leur
  chaîne de production est réellement injectée.

Risques : faux résumé Home, mutation non authentifiée, mission incomplète, double chemin
Core/Program Engine, perte de l'état Setup au refresh.

GO Home minimal : IDs réels, lecture seule, champs absents affichés comme absents et non inventés.

NO GO Setup/Confirm : état actuel du dépôt.

Rollback : rétablir la fixture Home sur le point d'injection existant ; aucune mission n'ayant été
créée dans la tranche lecture seule, aucune donnée Runtime n'est à restaurer.

## 7. LOT F04 — GLOBAL

### 7.1 Périmètre

Global Decisions, Global Deliverables et Search Overlay.

### 7.2 État et dépendances

| Unité | Endpoint / Service / Runtime | État |
|---|---|---|
| Global Decisions | aucun index Decision ; Human Approval interne non exposé | bloqué |
| Global Deliverables | rapports mission disponibles, pas d'index global ni téléchargement | partiel |
| Search Overlay | aucun composant, route, Capability ou contrat Search | bloqué |

### 7.3 Fichiers concernés

- `components/routes/DecisionsSurface.tsx` ;
- `components/routes/DeliverablesSurface.tsx` ;
- `components/routes/globalRouteFixtures.ts` ;
- `components/routes/RouteSurface.tsx` ;
- `components/shell/NavigationShell.tsx` ;
- `components/routes/RouteSurface.test.tsx`,
  `components/shell/NavigationShell.test.tsx`.

Aucun fichier BFF, Service ou Runtime existant ne fournit Global Decisions ou Search. Pour Global
Deliverables, `nova-core.http.ts`, `nova-core.service.ts` et
`orchestrator-runtime.service.ts` fournissent seulement les rapports par mission.

### 7.4 Ordre, tests, risques et gates

1. ne considérer Global Deliverables qu'après la lecture Work/mission certifiée ;
2. ne pas raccorder Decisions par inférence depuis des événements ;
3. ne pas ouvrir Search tant qu'un composant et un contrat existants ne sont pas présents.

Tests existants : `RouteSurface.test.tsx`, `NavigationShell.test.tsx` et suites Core de lecture
mission/rapport.

Risques : agrégation incomplète, faux objets Decision/Deliverable, recherche uniquement décorative.

GO : aucun des trois parcours complets n'est GO dans l'état actuel. Une lecture Deliverables
partielle peut être auditée ultérieurement, sans CTA Create/View/Download actif.

Rollback : conserver `globalRouteFixtures.ts`, sans effet Runtime.

## 8. LOT F03 — DECISION FLOW

### 8.1 Périmètre

Global/Work Decision entry, Decision Package, Pause Review, Pause Decide, Receipt et Full Package
Drawer.

### 8.2 Blocages

- D01, D02.1, D02.2, D03 et Full Package n'ont pas de composants React distincts ;
- les routes spécialisées rendent toutes `DecisionsSurface` ;
- aucun package, approval request, décision ou receipt n'est exposé par HTTP ;
- le `HumanApprovalWorkflow` interne est `SERVICE_NON_EXPOSE` ;
- `POST .../approve` retourne 410 ;
- `GET .../certificate` retourne un certificat Runtime et ne doit pas être substitué à un Decision
  Receipt ;
- certification et recovery nécessitent des secrets serveur.

### 8.3 Fichiers concernés

Frontend existant :

- `routes/RouteRegistry.ts` ;
- `components/routes/RouteSurface.tsx` ;
- `components/routes/DecisionsSurface.tsx` ;
- `features/work/WorkDecisionsPage.tsx` ;
- `components/drawer/Drawer.tsx` ;
- tests de route/navigation existants.

Serveur constaté, non raccordable :

- `server/nova-core/human-approval-workflow.ts` ;
- `server/nova-core/nova-core.http.ts` ;
- `server/nova-core/mission-certification.ts` ;
- `server/nova-core/nova-core.service.ts`.

### 8.4 Ordre, tests, risques et gates

F03 reste dernier. Aucun ordre d'implémentation interne n'est exécutable sans élargir le patrimoine
par de nouveaux composants et contrats, ce qui est interdit par la mission.

Tests existants :

- tests Frontend de route/navigation ;
- `server/nova-core/human-approval-workflow.test.ts` pour le service interne ;
- `nova-core.http.test.ts` pour le retrait de `/approve` ;
- `mission-certification.test.ts` pour le certificat Runtime.

Risques : décision factice, double soumission, absence de persistance, confusion receipt/certificat,
secret navigateur et auto-approbation.

Critère GO : **non satisfait**. F03 ne peut commencer avec les seuls contrats actuellement exposés.

Rollback futur : aucune décision append-only ne doit être supprimée ou inversée ; désactivation des
mutations UI et maintien de la consultation. Ce critère est documentaire tant qu'aucun contrat
Decision HTTP n'existe.

## 9. Les 7 unités `UI_ONLY`

| Unité | Route | Capability | Réutilisation possible | Blocage |
|---|---|---|---|---|
| D01 Decision Package | présente | `CAP-UI-DECISION-FLOW` | routeur, shell et primitives | surface et contrat package absents |
| D02.1 Review | présente | `CAP-UI-DECISION-FLOW` | routeur existant | surface et demande d'approbation absentes |
| D02.2 Decide | présente | `CAP-UI-DECISION-FLOW` | routeur existant | formulaire absent ; `/approve` 410 |
| D03 Receipt | présente | `CAP-UI-DECISION-FLOW` | routeur existant | receipt absent ; certificat Runtime non équivalent |
| O01 Search Overlay | lien `#search` seulement | aucune autonome | shell/navigation | composant, état et endpoint absents |
| Work Full Analysis Drawer | état Overview | hérite Overview | `Drawer` générique | composant et projection Full Analysis absents |
| Full Package Drawer | état D01 | hérite Decision Flow | `Drawer` générique | D01 et package absents |

## 10. Réponses obligatoires

### 10.1 Quel lot doit être implémenté en premier ?

`F02 — WORK`, sous-tranche `F02-A — W01.3 Work Activity en lecture seule`.

### 10.2 Pourquoi ce lot est-il le moins risqué ?

Il réutilise une UI, une route, des contrats de lecture, un Service, un Event Bus, un Runtime et des
tests existants. Il n'écrit aucune donnée, ne mobilise aucun secret, n'appelle pas le gateway BFF
incomplet et peut être annulé sans rollback de données.

### 10.3 Quels fichiers exacts seront concernés ?

Au premier raccordement :

- `apps/nova-web/src/components/routes/WorkSurface.tsx` ;
- `apps/nova-web/src/features/work/WorkActivityPage.tsx` ;
- `apps/nova-web/src/features/work/workActivityFixture.ts` ;
- `apps/nova-web/src/features/work/WorkActivityPage.test.tsx` ;
- en vérification de route : `apps/nova-web/src/routes/RouteRegistry.ts`,
  `routeResolver.ts` et leurs tests.

Les fichiers serveur `server/nova-core/nova-core.http.ts`,
`server/nova-core/nova-core.service.ts`,
`server/runtime/orchestrator/orchestrator-runtime.service.ts` et
`orchestrator-runtime.types.ts` sont consommés tels quels et ne doivent pas être modifiés pour
F02-A.

### 10.4 Quels endpoints et services existants seront utilisés ?

- `GET /api/v1/missions?projectId=` → `NovaCoreService.listMissions` ;
- `GET /api/v1/missions/:projectId/:missionId/events` →
  `NovaCoreService.getEvents` ;
- ensuite seulement `GET .../monitor` →
  `getObservabilityEvents/getIncompleteRuns` ;
- ensuite seulement `GET .../monitor/stream` →
  `subscribeObservability` et Event Bus Runtime.

Aucun endpoint BFF existant ne couvre ces lectures.

### 10.5 Quels tests devront passer ?

- typecheck et 143 tests Frontend de la baseline SW-008 ;
- tests Work Activity, Navigation, routes et Work Shell ;
- tests Core HTTP/Service, Mission Event Publisher et Orchestrator Runtime ;
- preuve d'intégration navigateur → Core à ajouter dans une mission d'implémentation : elle
  n'existe pas actuellement et n'est donc pas revendiquée par SW-009.

### 10.6 Quelles parties ne doivent pas être touchées ?

- `server/nova-bff` pour la première lecture F02-A ;
- `ProgramProductionEntrypoint`, Integration Pipeline et transport Codex ;
- toutes les mutations Core : create, assign, evidence, execute, cancel, technical-accept, certify,
  recovery et la route retirée approve ;
- Rules, Doctrines, Programs, Modules et Capabilities ;
- PNG, matrices patrimoniales et documents existants ;
- écrans F01, F03 et F04 pendant F02-A ;
- fixtures hors du chemin Activity ;
- certificats, evidence, journaux et données Runtime.

## 11. Critères SW-009

| Critère | Résultat |
|---|---|
| 31/31 unités rattachées ou bloquées | PASS |
| Raccordements fondés sur des fichiers réels | PASS |
| 7 unités `UI_ONLY` nommées et expliquées | PASS |
| Points exacts de raccordement | PASS |
| Lots F01 à F04 ordonnés | PASS |
| Premier lot minimal désigné | PASS — F02-A |
| Contrat inventé | 0 |
| Code modifié | 0 |
| Document existant modifié | 0 |

**VERDICT : SW-009 GO — PLAN FACTUEL COMPLET, AUCUNE IMPLÉMENTATION RÉALISÉE**

# NOVA Frontend Existing Version — Audit

## 0. Décision

**VERDICT : GO POUR UNE CONVERGENCE CONTRÔLÉE — PAS DE REPRISE AVEUGLE, PAS DE RÉÉCRITURE COMPLÈTE**

Le nouveau Frontend est localisé dans `apps/nova-web`. Il s'agit d'une application React 18 / TypeScript / Vite distincte du cockpit legacy servi par NOVA Core.

Le patrimoine est substantiel et vérifié :

- 20 définitions de route ;
- 14 implémentations distinctes de page ou surface ;
- 24/31 unités UX possèdent une UI React correspondante ;
- typecheck PASS ;
- 146/146 tests Frontend PASS.

Sa limite est architecturale et non visuelle :

- les 14 pages/surfaces utilisent encore au moins une fixture ou un état métier local ;
- Work Activity est la seule unité qui lit des données Runtime ;
- aucun écran ne passe par le BFF ;
- quatre routes Decision rendent la mauvaise surface ;
- sept unités UX n'ont pas de composant correspondant ;
- le build `dist` est antérieur au raccordement Work Activity.

## 1. Périmètre et méthode

Audit en lecture seule du dépôt :

`C:\DEV\NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)\nova-core-mvp`

Contrôles réalisés :

1. inventaire des manifestes et configurations Frontend ;
2. lecture du routeur, des pages, composants, hooks, contextes et tests ;
3. recherche de fixtures, données codées en dur et état métier local ;
4. recherche des appels HTTP, SSE, WebSocket et configurations d'origine ;
5. comparaison avec les 31 unités UX certifiées ;
6. comparaison avec NOVA Core, le BFF, SW-010 et l'architecture Work SW-014 ;
7. exécution du typecheck et des tests Frontend existants ;
8. inspection des trois PNG HOME de référence.

Aucun build n'a été lancé, car il aurait modifié le répertoire généré `dist`.

## 2. Localisation et coexistence des Frontends

| Interface | Racine | Technologie | Démarrage | Port / route | Statut |
|---|---|---|---|---|---|
| Nouvelle version NOVA | `apps/nova-web` | React 18.3, TypeScript 5.9, Vite 7.1, CSS Modules | `cd apps/nova-web` puis `npm.cmd run dev` | `http://127.0.0.1:5173/home` | Patrimoine cible de convergence |
| Cockpit NOVA Core legacy | `server/nova-core/public/index.html` | HTML/CSS/JavaScript sans framework | à la racine : `npm.cmd run start:nova-core` ou `DEMARRER_NOVA.bat` | `http://127.0.0.1:4100/` | Cockpit opérationnel à isoler et conserver jusqu'au remplacement |
| Laboratoire de composants | `apps/nova-web/src/components/lab` | React | même serveur Vite | `/lab` | Démonstration interne |
| Laboratoire de shell | `apps/nova-web/src/components/shell/ShellPlayground.tsx` | React | même serveur Vite | `/shell` | Démonstration interne |

Le script racine `DEMARRER_NOVA.bat` ne démarre pas le nouveau Frontend. Il démarre NOVA Core et ouvre le cockpit legacy sur le port 4100.

Le scan global des fichiers `tsx`, `jsx`, `vue`, `svelte`, HTML et configurations Vite/Next n'a trouvé aucune troisième application : 85 fichiers UI sous `apps/nova-web/src` et l'unique HTML legacy sous `server/nova-core/public`.

Pour utiliser la lecture Runtime de Work Activity avec la nouvelle version, deux processus sont actuellement nécessaires :

```text
racine du dépôt : npm.cmd run start:nova-core
apps/nova-web   : npm.cmd run dev
```

Le BFF démarre séparément avec `npm.cmd run start:bff` sur le port 4200, mais il n'est consommé par aucun composant React.

## 3. Architecture Frontend observée

| Axe | Constat |
|---|---|
| Entrée | `apps/nova-web/src/main.tsx` → `App.tsx` |
| Shell | `NavigationShell` → `AppShell` → `ContentViewport` → `ContentArea` |
| Routage | Routeur interne fondé sur History API ; aucun React Router |
| Définition des routes | `routes/RouteDefinition.ts`, `RouteRegistry.ts` |
| Résolution | `routeResolver.ts`, `NavigationController.ts`, `NavigationProvider.tsx` |
| État global | Aucun store ; un contexte local `WorkSetupProvider` |
| Données distantes | Aucun service API partagé ; `fetch` est localisé dans `WorkActivityPage.tsx` |
| Query client | Aucun |
| Axios | Absent |
| SSE / WebSocket | Absents du Frontend |
| Configuration d'URL | Aucune variable `VITE_*` ; origine Core codée en dur |
| Contrats | Types de fixtures ; import direct de types Runtime serveur dans Work Activity |
| Styles | 40 CSS Modules, tokens CSS centralisés, responsive partiel |
| Tests | Vitest, Testing Library, Playwright configuré mais aucun scénario E2E trouvé |

### 3.1 Dépendances internes

- shell et primitives partagées ;
- routeur propriétaire ;
- `WorkSetupProvider` pour le parcours Home → Confirm ;
- pages Work couplées à `WorkOverviewFixture` ;
- surfaces Global dérivées des fixtures Work ;
- Work Activity importe directement `RuntimeMission` et `RuntimeEvent` depuis `server/runtime`.

### 3.2 Dépendances externes

En production : uniquement `react` et `react-dom`.

L'outillage comprend Vite, TypeScript, Vitest, Testing Library, ESLint et Playwright.

## 4. Résultats de compilation et de tests

| Contrôle | Commande | Résultat |
|---|---|---|
| Typecheck Frontend | `npm.cmd run typecheck` dans `apps/nova-web` | **PASS — 0 erreur** |
| Tests Frontend | `npm.cmd test -- --run` | **PASS — 25 fichiers, 146/146 tests** |
| Build | Non exécuté | Hors audit car il modifierait `dist` |
| E2E navigateur | Non exécuté | Aucun scénario Playwright présent |

Le rendu des 14 pages/surfaces est couvert par des tests de composants ou de flux. Les quatre routes Decision manquantes ne possèdent que des tests de résolution/navigation, pas de rendu conforme à leur unité UX.

### 4.1 Artefact généré

`apps/nova-web/dist` date du 24 juillet 2026. Le source Work Activity date du 30 juillet 2026. Le bundle généré ne contient ni `/api/v1/missions`, ni l'origine Core, ni le message d'erreur du client Work Activity.

Conclusion : les sources passent les contrôles, mais le `dist` présent n'est pas représentatif du source courant.

## 5. Inventaire des 20 routes

Statuts autorisés appliqués : `IMPLEMENTED_STATIC`, `IMPLEMENTED_WITH_MOCKS`, `IMPLEMENTED_PARTIAL`, `CONNECTED_TO_BFF`, `CONNECTED_TO_RUNTIME`, `BROKEN`, `DEAD_CODE`, `UNKNOWN`.

| # | Route | Fichier / composant racine | Layout | Compilation | Rendu / test | Données | Statut |
|---:|---|---|---|---|---|---|---|
| 1 | `/home` | `features/home/HomePage.tsx` — `HomePage` | `NavigationShell` | PASS | PASS — `HomePage.test.tsx` | `homeFixture`, état local | `IMPLEMENTED_WITH_MOCKS` |
| 2 | `/work` | `components/routes/WorkSurface.tsx` → `WorkOverviewPage` vide | Work Shell | PASS | PARTIAL — état vide seulement | aucun `workId`, état vide | `IMPLEMENTED_PARTIAL` |
| 3 | `/decisions` | `components/routes/DecisionsSurface.tsx` | Shell principal | PASS | PASS — `RouteSurface.test.tsx` | `globalDecisionsFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 4 | `/deliverables` | `components/routes/DeliverablesSurface.tsx` | Shell principal | PASS | PASS — `RouteSurface.test.tsx` | `globalDeliverablesFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 5 | `/clarify` | `features/work-setup/ClarifyPage.tsx` | Shell principal | PASS | PASS — `WorkSetupFlow.test.tsx` | `workSetupFixtures`, contexte local | `IMPLEMENTED_WITH_MOCKS` |
| 6 | `/canvas` | `features/work-setup/CanvasPage.tsx` | Shell principal | PASS | PASS — `WorkSetupFlow.test.tsx` | contexte local initialisé par fixture | `IMPLEMENTED_WITH_MOCKS` |
| 7 | `/plan` | `features/work-setup/PlanPage.tsx` | Shell principal | PASS | PASS — `WorkSetupFlow.test.tsx` | `workSetupPlanPhases` | `IMPLEMENTED_WITH_MOCKS` |
| 8 | `/confirm` | `features/work-setup/ConfirmPage.tsx` | Shell principal | PASS | PASS — `WorkSetupFlow.test.tsx` | autonomie locale ; aucune création | `IMPLEMENTED_WITH_MOCKS` |
| 9 | `/work/:workId` | `WorkSurface` → `WorkOverviewPage` | Work Shell | PASS | PASS — `WorkOverviewPage.test.tsx` | `workOverviewFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 10 | `/work/:workId/overview` | `features/work/WorkOverviewPage.tsx` | Work Shell | PASS | PASS — `WorkOverviewPage.test.tsx` | `workOverviewFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 11 | `/work/:workId/plan` | `features/work/WorkPlanPage.tsx` | Work Shell | PASS | PASS — `WorkPlanPage.test.tsx` | `workPlanFixture` et header Overview | `IMPLEMENTED_WITH_MOCKS` |
| 12 | `/work/:workId/activity` | `features/work/WorkActivityPage.tsx` | Work Shell | PASS | PASS — 10 tests ciblés | événements Core réels ; header fixture | `CONNECTED_TO_RUNTIME` |
| 13 | `/work/:workId/people` | `features/work/WorkPeoplePage.tsx` | Work Shell + drawer | PASS | PASS — `WorkPeoplePage.test.tsx` | `workPeopleFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 14 | `/work/:workId/sources` | `features/work/WorkSourcesPage.tsx` | Work Shell + drawer | PASS | PASS — `WorkSourcesPage.test.tsx` | `workSourcesFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 15 | `/work/:workId/decisions` | `features/work/WorkDecisionsPage.tsx` | Work Shell | PASS | PASS — `WorkDecisionsPage.test.tsx` | `workDecisionsFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 16 | `/work/:workId/deliverables` | `features/work/WorkDeliverablesPage.tsx` | Work Shell + drawer | PASS | PASS — `WorkDeliverablesPage.test.tsx` | `workDeliverablesFixture` | `IMPLEMENTED_WITH_MOCKS` |
| 17 | `/decisions/:decisionId` | `RouteSurface` → `DecisionsSurface` globale | Shell principal | PASS | FAIL — mauvaise surface ; route-only | mauvaise surface, fixture globale | `BROKEN` |
| 18 | `/decisions/:decisionId/package` | `RouteSurface` → `DecisionsSurface` globale | Shell principal | PASS | FAIL — composant Package absent | composant Package absent | `BROKEN` |
| 19 | `/decisions/:decisionId/pause` | `RouteSurface` → `DecisionsSurface` globale | Shell au lieu du fullscreen | PASS | FAIL — Review/Decide absents | étapes Review/Decide absentes | `BROKEN` |
| 20 | `/decisions/:decisionId/receipt` | `RouteSurface` → `DecisionsSurface` globale | Shell principal | PASS | FAIL — Receipt absente | Receipt absente | `BROKEN` |

### 5.1 Bilan des routes

| Statut | Nombre |
|---|---:|
| `IMPLEMENTED_WITH_MOCKS` | 14 |
| `IMPLEMENTED_PARTIAL` | 1 |
| `CONNECTED_TO_RUNTIME` | 1 |
| `BROKEN` | 4 |
| `CONNECTED_TO_BFF` | 0 |
| Total | 20 |

Les 20 routes affichent au moins une donnée simulée ou locale : Work Activity lit de vrais événements, mais son header reste alimenté par `workOverviewFixture`.

## 6. Inventaire physique

| Élément | Nombre |
|---|---:|
| Routes déclarées | 20 |
| Implémentations distinctes de page/surface | 14 |
| Fichiers TSX de production | 64 |
| Fichiers de test Frontend | 25 |
| Tests | 146 |
| Fichiers nommés Fixture | 10 |
| CSS Modules | 40 |
| Appels HTTP de production dans le nouveau Frontend | 2 |
| Clients HTTP partagés | 0 |
| Contextes métier | 1 (`WorkSetupProvider`) |
| Stores / query clients | 0 |

Les 14 implémentations distinctes sont : Home, quatre pages Work Setup, sept pages Work et deux surfaces Global.

## 7. Audit des données fictives

| Fichier / bloc | Écran | Donnée fictive | Risque | Capability attendue | Remplacement immédiat | Statut |
|---|---|---|---|---|---|---|
| `features/home/homeFixture.ts:2-6` | Home | utilisateur, résumé, compteurs | identité et charge fictives présentées comme réelles | Session Identity, Work, Decisions | profil partiel via BFF ; compteurs non disponibles | `UNAUTHORIZED_SOURCE` |
| `homeFixture.ts:7-16` | Home composer | exemples et texte d'aide | faible si explicitement éditorial | Mission Preparation | contenu visuel réutilisable | `SAFE_VISUAL_PLACEHOLDER` |
| `homeFixture.ts:17-32` | Home insight | blocage, gain, confiance, recommandation | décision utilisateur fondée sur un calcul inexistant | Work Intelligence | non | `BUSINESS_LOGIC_IN_FRONTEND` |
| `homeFixture.ts:33-42` | Home decision | décision, échéance, confiance, conséquence | donnée décisionnelle fictive | Decisions | non | `UNAUTHORIZED_SOURCE` |
| `homeFixture.ts:43-69` | Home active work | travaux, confiance, échéances | liste fictive ; identifiants utilisés pour naviguer | WCF-001 puis Work projections | liste Mission seulement, sans confiance/échéance | `TEMPORARY_MOCK` |
| `homeFixture.ts:70-85` | Home background | économies, conflits, travaux de fond | synthèse et gains inventés | Work Intelligence / Monitoring | non | `BUSINESS_LOGIC_IN_FRONTEND` |
| `homeFixture.ts:86-92` | Home states | libellés loading/empty/error/blocked | éditorial uniquement | aucune | oui | `SAFE_VISUAL_PLACEHOLDER` |
| `NavigationShell.tsx:27-38` | Navigation | `work-001` choisi depuis Home fixture | navigation couplée à une donnée fictive | WCF-001 | mission réelle disponible, ancrage Work partiel | `UNAUTHORIZED_SOURCE` |
| `NavigationShell.tsx:186-194` | Profil | Sarah Chen / Standard / SC | identité fictive globale | Session Identity | BFF session partiel | `UNAUTHORIZED_SOURCE` |
| `SituationDetailsDrawer.tsx:17-35` et contenu JSX | Home drawer | blocages, actions, scores, temps économisé | logique métier codée directement dans le composant | Work Intelligence, Evidence, Actions | non | `BUSINESS_LOGIC_IN_FRONTEND` |
| `workOverviewFixture.ts:57-187` | Work shell/Overview | état, phase, confiance, insight, action, décision, People, livrables | modèle Work entier non autoritatif | Capability Work SW-014 | non avant producteurs WCF | `UNAUTHORIZED_SOURCE` |
| `workPlanFixture.ts:25-85` | Work Plan | phases, tâches, progression | Planning fictif | Planning / WCF-003 | non | `UNAUTHORIZED_SOURCE` |
| `workPeopleFixture.ts:32-144` | Work People | personnes, disponibilités, confiance, preuves | personnes et contributions fictives | People / WCF-006 | non | `UNAUTHORIZED_SOURCE` |
| `workSourcesFixture.ts:37-111` | Work Sources | sources, fraîcheur, preuves, couverture | preuves fictives | Evidence / WCF-004 | non | `UNAUTHORIZED_SOURCE` |
| `workDecisionsFixture.ts:16-35` | Work Decisions | décisions et confiance | décision fictive | Decisions / WCF-005 | non | `UNAUTHORIZED_SOURCE` |
| `workDeliverablesFixture.ts:39-95` | Work Deliverables | livrables, confiance, historique | livrables enrichis fictifs | Deliverables / WCF-002 | références Runtime partielles seulement | `UNAUTHORIZED_SOURCE` |
| `workActivityFixture.ts:27-142` | Work Activity | anciens événements de démonstration | payload non utilisé en production depuis SW-010 | Monitoring | oui, déjà remplacé pour les événements | `DEAD_DATA` |
| `globalRouteFixtures.ts:16-59` | Global | décisions et livrables dérivés des fixtures Work | duplication de données fictives | Decisions, Deliverables | non | `UNAUTHORIZED_SOURCE` |
| `workSetupFixtures.ts:7-42` | Setup | questions, Canvas, plan, autonomie | vocabulaire non relié à un producteur | Mission Preparation, Planning | non | `TEMPORARY_MOCK` |
| `WorkSetupProvider.tsx:6-58` | Setup | état de mission conservé en mémoire React | perdu au rechargement, aucune autorité serveur | Mission Preparation | non | `BUSINESS_LOGIC_IN_FRONTEND` |

## 8. Audit des connexions API

### 8.1 Nouvelle version React

| Fichier | Méthode / URL | Payload | Réponse attendue | Source atteinte | Test | Écran | Statut |
|---|---|---|---|---|---|---|---|
| `features/work/WorkActivityPage.tsx:131-137` | `GET http://127.0.0.1:4100/api/v1/missions` | aucun | `{ missions: RuntimeMission[] }` | `NovaCoreService.listMissions` → Runtime | `WorkActivityPage.test.tsx` | Work Activity | `REAL_RUNTIME` |
| `WorkActivityPage.tsx:143-151` | `GET http://127.0.0.1:4100/api/v1/missions/:projectId/:missionId/events` | aucun | `{ events: RuntimeEvent[] }` | `NovaCoreService.getEvents` → journal Runtime | `WorkActivityPage.test.tsx` | Work Activity | `REAL_RUNTIME` |

Constats :

- origine `http://127.0.0.1:4100` codée en dur ;
- aucun BFF ;
- aucun cookie/session ;
- import de types depuis le serveur Runtime ;
- validation limitée à la présence d'un tableau ;
- recherche par `missionId` seul avant résolution du `projectId` ;
- mapping Runtime → UI dans le composant de page ;
- aucun SSE, WebSocket, Axios ou query client.

### 8.2 BFF

| Méthode / endpoint | Consommateur React | Source | État réel | Statut |
|---|---|---|---|---|
| `GET /health`, `/readiness`, `/version` | aucun | BFF opérationnel | testé, non consommé | `UNUSED_API` |
| `GET /session` | aucun | `SessionManager` | testé, non consommé | `UNUSED_API` |
| `POST /session/login` | aucun | `LocalIdentityProvider` / `SessionManager` | testé, non consommé | `UNUSED_API` |
| `POST /session/logout` | aucun | `SessionManager` | testé, non consommé | `UNUSED_API` |
| `POST /api/runtime/execute` | aucun | `RuntimeGateway` | route testée avec injection ; gateway absent au démarrage réel | `BROKEN_API` |

Il n'expose pas les lectures Mission utilisées par Work Activity. Son démarrage de production n'injecte toujours pas `runtimeGateway` et journalise `configured_not_connected`.

### 8.3 Cockpit legacy

| Fichier / bloc | Méthode / endpoint | Payload | Réponse utilisée | Source Runtime | Test associé | Écran consommateur | Statut |
|---|---|---|---|---|---|---|---|
| `public/index.html:209-223` | `GET /api/v1/projects` | aucun | projets | `NovaCoreService.listProjectTargets` | `nova-core.http.test.ts` | formulaire Mission legacy | `LEGACY_API` |
| `public/index.html:231-253` | `GET /api/v1/missions` | aucun | liste de Missions | `NovaCoreService.listMissions` | `nova-core.http.test.ts` | liste Mission legacy | `LEGACY_API` |
| `public/index.html:256-294` | `GET /api/v1/missions/:projectId/:missionId` | aucun | mission, report, events | services Core / Runtime | `nova-core.http.test.ts` | détail Mission legacy | `LEGACY_API` |
| `public/index.html:181-204` | `POST /api/v1/missions` | `MissionDefinition` construit par le formulaire | mission créée | `NovaCoreService.createMission` | `nova-core.http.test.ts` | création Mission legacy | `LEGACY_API` |
| `public/index.html:318-337` | `POST .../execute` | `{}` | report / mission mis à jour | moteur NOVA Core | tests HTTP/Execution | action Execute legacy | `LEGACY_API` |
| `public/index.html:354-373` | `POST .../evidence` | deliverables, fichiers, checks, flags | report / mission | Evidence Core | `nova-core.http.test.ts` | dépôt de preuves legacy | `LEGACY_API` |
| `public/index.html:340-351` | `POST .../technical-accept` | `{}` | mission | validation technique Core | `nova-core.http.test.ts` | validation legacy | `LEGACY_API` |
| `public/index.html:340-351` | `POST .../approve` | `{}` | erreur 410 | route dépréciée | test de dépréciation / rapports SW-006 | approbation legacy | `BROKEN_API` |

Cette dernière route est dépréciée et retourne 410 dans le serveur actuel. Le bouton d'approbation du cockpit legacy est donc un raccordement cassé.

## 9. Couverture actuelle des 31 unités UX

| Mesure | Valeur | Méthode |
|---|---:|---|
| UI React correspondante | 24/31 — **77,4 %** | composant réellement intégré |
| UI absente | 7/31 — 22,6 % | composant ou état attendu absent |
| UI alimentée uniquement par mocks/local | 23/31 — 74,2 % | aucune donnée distante autoritative |
| UI lisant le Runtime | 1/31 — **3,2 %** | Work Activity |
| UI passant par le BFF | 0/31 — **0 %** | aucun appel BFF |
| Chaîne canonique UI → BFF → Runtime | 0/31 — **0 %** | BFF contourné par Work Activity |
| UI totalement implémentée métier | 0/31 — **0 %** | aucune Capability complète derrière l'écran |

Le taux UX de 77,4 % mesure la présence d'une UI React, pas la fidélité pixel-perfect ni la complétude fonctionnelle.

## 10. Risques

| Niveau | Risque | Preuve |
|---|---|---|
| `HIGH` | Données de confiance, décisions et recommandations fictives non signalées | `homeFixture`, `workOverviewFixture`, `SituationDetailsDrawer` |
| `HIGH` | Absence de Capability Work complète | SW-013A et SW-014 |
| `HIGH` | Contournement du BFF et origine Core codée en dur | `WorkActivityPage.tsx` |
| `HIGH` | Couplage Frontend → types internes Runtime | import depuis `server/runtime` |
| `HIGH` | Quatre routes Decision affichent la liste globale au lieu de leur écran | `surfaceRouteId=decisions` et `RouteSurface` |
| `HIGH` | Build distribué antérieur au raccordement Runtime | `dist` du 24/07, sources du 30/07 |
| `HIGH` | Bouton Approve legacy raccordé à une route 410 | cockpit legacy et `nova-core.http.ts` |
| `MEDIUM` | Aucun client API, adapter ou query layer partagé | seul `fetch` se trouve dans la page Activity |
| `MEDIUM` | Types de présentation nommés `Fixture` utilisés comme contrats de page | toutes les pages Work |
| `MEDIUM` | État Work Setup perdu au rechargement | contexte React sans persistance |
| `MEDIUM` | Routeur auxiliaire `app/routeState.ts` non utilisé en production | utilisé uniquement par son test |
| `MEDIUM` | Search, Decision Flow et Full Analysis absents | 7 unités `UI_ONLY` |
| `MEDIUM` | Responsive incomplet sur certaines pages Work | shell adaptatif, Overview sans breakpoint dédié |
| `MEDIUM` | Aucun E2E Playwright malgré la configuration | aucun fichier de scénario trouvé |
| `LOW` | Deux feuilles CSS sans import | `App.module.css`, `CoreComponentsLab.module.css` |

Aucune dépendance circulaire Runtime n'a été trouvée. Le principal cycle conceptuel évité par SW-014 est la tentation de faire des fixtures UI la source d'un modèle métier Work.

## 11. Réponses obligatoires

1. **Nouvelle version** : `apps/nova-web`.
2. **Démarrage** : `cd apps/nova-web` puis `npm.cmd run dev`; NOVA Core doit être démarré séparément pour Work Activity.
3. **HOME** : `/home`.
4. **Pages réellement implémentées** : 14 implémentations distinctes servant 16 routes utiles ; quatre routes supplémentaires sont cassées.
5. **Pages avec mocks/fixtures** : 14/14 contiennent encore au moins une donnée simulée ou locale.
6. **Pages connectées au Runtime** : 1/14, Work Activity, partiellement puisque son header reste simulé.
7. **Avancement UX** : 24/31 unités, 77,4 %.
8. **Avancement métier autoritatif** : 1/31 unités lit le Runtime, 3,2 % ; aucune Capability d'écran n'est complète.
9. **Avancement end-to-end canonique** : 0/31, 0 %, car aucun écran ne passe par le BFF.
10. **Réutilisables sans modification** : tokens, primitives, shell atomique, Drawer, surfaces, loaders et états vides.
11. **Nécessitant un adapter** : pages HOME, Work, Global et leurs composants de présentation.
12. **À refactorer** : `NavigationShell`, `RouteSurface`, `WorkSurface`, `WorkActivityPage`, `WorkSetupProvider`, `SituationDetailsDrawer`.
13. **À supprimer après preuve de remplacement** : routeur auxiliaire inutilisé, chaîne `HomeSurface` placeholder, CSS sans import et payload Activity devenu mort.
14. **HOME existe** : oui, `features/home/HomePage.tsx`, réellement rendu sur `/home`.
15. **HOME premier vertical slice** : pas dans sa totalité ; une tranche HOME read-only limitée à Active Work peut suivre WCF-001 et précéder Work Overview.
16. **WCF-001 prioritaire** : oui.
17. **Continuer ou repartir** : continuer le patrimoine existant ; ne pas repartir from scratch.
18. **Stratégie** : `B — REUSE_WITH_CONTROLLED_REFACTOR`.
19. **Prochain lot exact** : `WCF-001 — Work Core Foundation`; ensuite HOME minimal read-only.
20. **Verdict final** : GO pour la convergence contrôlée.

## 12. Non-régression

Fichiers source modifiés par cet audit : **0**.

Les seules créations autorisées sont les cinq rapports FRONT-REUSE-001. Aucun code, Runtime, BFF, Frontend, test, mock, endpoint, contrat, PNG ou document existant n'a été modifié.

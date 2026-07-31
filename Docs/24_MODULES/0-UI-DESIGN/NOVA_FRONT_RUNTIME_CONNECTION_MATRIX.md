# NOVA — FRONTEND ↔ RUNTIME CONNECTION MATRIX

## 1. Contrôle du document

| Champ | Valeur |
|---|---|
| Mission | `SW-009 — FRONTEND ↔ RUNTIME INTEGRATION PLAN` |
| Date | 2026-07-30 |
| Mode | Audit et planification uniquement |
| Unités auditées | 31/31 |
| Code modifié | Aucun |
| Objet | Points de raccordement factuels entre le Frontend V7 et les contrats Runtime existants |

Cette matrice complète, sans la modifier, la matrice de certification SW-008
[`NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md`](NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md).

## 2. Qualification des raccordements

| Code | Qualification factuelle |
|---|---|
| `ENDPOINT_EXPLOITABLE` | Route, contrat de sortie, Service et Runtime existent pour une lecture correspondant directement à une partie de l'unité. |
| `ENDPOINT_INCOMPLET` | La route existe, mais sa sortie ne couvre pas le modèle de vue existant ou ses identifiants d'appel ne sont pas disponibles dans la route Frontend. |
| `ENDPOINT_ABSENT` | Aucune route correspondant à la fonction de l'unité n'a été trouvée. |
| `SERVICE_NON_EXPOSE` | Un composant interne proche existe, mais aucun contrat HTTP utilisable par React ne l'expose. |
| `RUNTIME_NON_ACCESSIBLE_FRONT` | Le Runtime existe, mais aucune chaîne navigateur → API/BFF exploitable n'existe pour cette fonction. |
| `COMPOSANT_FONCTIONNEL_ABSENT` | Le chemin ou le PNG existe, mais aucun composant React distinct ne porte la fonction. |
| `VISUEL_UNIQUEMENT` | Le composant présent est alimenté par fixture ou état local et n'a aucun appel réseau. |

Les routes Core en lecture seule sont exploitables comme API v1. Elles ne sont pas assimilées au
`ProgramProductionEntrypoint` certifié. Le BFF ne fournit aucune lecture mission, Work, Decision,
Deliverable ou Search ; son unique contrat Runtime est `POST /api/runtime/execute`, qualifié
`PARTIAL` et non injecté au démarrage.

## 3. Chaînes existantes réutilisables

| Référence | Contrat existant | Service existant | Runtime existant | Tests existants | Limite |
|---|---|---|---|---|---|
| `R-MISSIONS` | `GET /api/v1/missions?projectId=` | `NovaCoreService.listMissions` | `OrchestratorRuntimeService.listMissions` | `server/nova-core/nova-core.http.test.ts`, `nova-core.service.test.ts`, `server/runtime/orchestrator/orchestrator-runtime.test.ts` | `RuntimeMissionView` n'est pas une projection Home/Work. |
| `R-MISSION` | `GET /api/v1/missions/:projectId/:missionId` | `getMission`, `getReport`, `getEvents`, `getObservabilityEvents`, `getIncompleteRuns` | `OrchestratorRuntimeService` | mêmes suites Core/Runtime | Sortie riche mais incompatible telle quelle avec les types de fixtures Frontend. |
| `R-ACTIVITY` | `GET .../:missionId/events` | `NovaCoreService.getEvents` | `OrchestratorRuntimeService.getEvents` | `nova-core.http.test.ts`, `mission-event-publisher.test.ts`, `orchestrator-runtime.test.ts` | Lecture exploitable ; projection de présentation locale nécessaire. |
| `R-MONITOR` | `GET .../monitor`, `GET .../monitor/stream` | `getObservabilityEvents`, `getIncompleteRuns`, `subscribeObservability` | Event Bus et `OrchestratorRuntimeService` | `nova-core.http.test.ts`, `mission-event-publisher.test.ts` | SSE exploitable ; aucun client `EventSource` Frontend n'existe. |
| `R-CERTIFICATE` | `GET .../:missionId/certificate` | `NovaCoreService.getCertificate` | rapport/certificat de `OrchestratorRuntimeService` | `nova-core.http.test.ts`, `mission-certification.test.ts` | Certificat Runtime ; ce n'est pas un Decision Receipt. |
| `R-PREFLIGHT` | `GET /api/v1/projects/:projectId/preflight` | `NovaCoreService.inspectProjectTarget` | moteur de préflight Git | `nova-core.http.test.ts`, `git-preflight.test.ts` | État Git uniquement ; aucun catalogue de Sources. |
| `M-CREATE` | `POST /api/v1/missions` | `NovaCoreService.createMission` | `createMission` puis `acceptMission` | `nova-core.http.test.ts`, `nova-core.service.test.ts` | Mutation non authentifiée ; le Work Setup ne produit pas le `MissionDefinition` complet. |
| `M-EXECUTE-BFF` | `POST /api/runtime/execute` | `RuntimeGateway` / `RuntimeGatewayAdapter` | `ProgramProductionEntrypoint` cible | `runtime-execute.route.test.ts`, `runtime-gateway.test.ts` | Gateway non injecté par `startNovaBff`; `PromptPackage` absent du Frontend. |
| `M-APPROVE` | `POST .../:missionId/approve` | aucun chemin actif | Human Approval interne non exposé | garde HTTP dans `nova-core.http.test.ts` | HTTP 410 `APPROVAL_ROUTE_REMOVED`. |

## 4. Matrice exhaustive des 31 unités

Les chemins sont relatifs à la racine du dépôt. `NONE` signifie qu'aucun élément correspondant n'a
été trouvé. Les tests indiqués sont les preuves déjà présentes, pas une preuve d'intégration réseau.

| # | Lot | PNG / unité / domaine | Route et composant React actuel | Enfants, état ou fixture | Capability | Endpoint → Service → Runtime vérifiés | Tests existants | Point exact de raccordement | Qualification / blocage |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | F01 | `HOME-REPLIE.png` — `H01/H01.1 Home collapsed` — Home | `/home` → `features/home/HomePage.tsx` | `HomeHeader`, `ObjectiveComposer`, `PriorityInsight`, `PendingDecisionCard`, `ActiveWorkSection`, `BackgroundWorkSection`; `homeFixture.ts` | `CAP-UI-HOME` (`STUB`) | `R-MISSIONS`, puis `R-MISSION`/`R-MONITOR` pour le détail | `HomePage.test.tsx`, `NavigationShell.test.tsx`; tests Core de `R-MISSIONS` | `components/shell/NavigationShell.tsx` importe `homeFixture` et rend `HomePage`; `HomePage.tsx` importe aussi la fixture | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT` : résumé, confiance et next action absents du contrat v1. |
| 2 | F01 | `Home-DEPLIE.png` — `H01.2 Home expanded` — Home | `/home`, état local → `HomePage` / `ObjectiveComposer` | saisie locale dans `ObjectiveComposer`; `homeFixture.ts` | `CAP-UI-HOME` (`STUB`) | Lecture `R-MISSIONS`; aucune API de préparation d'objectif | `HomePage.test.tsx` | `features/home/HomePage.tsx` et `ObjectiveComposer.tsx`; navigation vers Clarify dans `NavigationShell.tsx` | `ENDPOINT_ABSENT` pour la préparation ; `VISUEL_UNIQUEMENT`. |
| 3 | F01 | `clarify.png` — `S01.1 Clarify step 1` — Work Setup | `/clarify` → `features/work-setup/ClarifyPage.tsx` | `WorkSetupProvider`, `workSetupClarifySteps`, `useState` | `CAP-UI-WORK-SETUP-CLARIFY` (`STUB`) | NONE ; `M-CREATE` n'accepte pas un brouillon Clarify | `WorkSetupFlow.test.tsx`, `WorkSetupProvider.test.tsx` | `ClarifyPage.tsx` et `WorkSetupProvider.tsx` | `ENDPOINT_ABSENT`, `RUNTIME_NON_ACCESSIBLE_FRONT`, `VISUEL_UNIQUEMENT`. |
| 4 | F01 | `clarify.png` — `S01.2 Clarify step 2` — Work Setup | `/clarify`, étape locale → `ClarifyPage` | mêmes contexte et fixture | `CAP-UI-WORK-SETUP-CLARIFY` (`STUB`) | NONE | mêmes tests Setup | `ClarifyPage.tsx` / `WorkSetupProvider.tsx` | `ENDPOINT_ABSENT`, `VISUEL_UNIQUEMENT`. |
| 5 | F01 | `clarify.png` — `S01.3 Clarify step 3` — Work Setup | `/clarify`, étape locale → `ClarifyPage` | mêmes contexte et fixture | `CAP-UI-WORK-SETUP-CLARIFY` (`STUB`) | NONE | mêmes tests Setup | `ClarifyPage.tsx` / `WorkSetupProvider.tsx` | `ENDPOINT_ABSENT`, `VISUEL_UNIQUEMENT`. |
| 6 | F01 | `canvas.png` — `S02 Canvas read` — Work Setup | `/canvas` → `features/work-setup/CanvasPage.tsx` | `WorkSetupProvider`; canvas local | `CAP-UI-WORK-SETUP-CANVAS` (`STUB`) | NONE ; aucune projection/persistance Canvas | `WorkSetupFlow.test.tsx`, `WorkSetupProvider.test.tsx` | `CanvasPage.tsx` / `WorkSetupProvider.tsx` | `ENDPOINT_ABSENT`, `RUNTIME_NON_ACCESSIBLE_FRONT`, `VISUEL_UNIQUEMENT`. |
| 7 | F01 | `canvas.png` — `S02.x Canvas editing` — Work Setup | `/canvas`, état local → `CanvasPage` | même contexte ; état read/editing | `CAP-UI-WORK-SETUP-CANVAS` (`STUB`) | NONE | `WorkSetupProvider.test.tsx` | `CanvasPage.tsx` / `WorkSetupProvider.tsx` | `ENDPOINT_ABSENT`, `VISUEL_UNIQUEMENT`. |
| 8 | F01 | `plan.png` — `S03 Plan Setup` — Work Setup | `/plan` → `features/work-setup/PlanPage.tsx` | `workSetupPlanPhases` | `CAP-UI-WORK-SETUP-PLAN` (`STUB`) | NONE ; aucune API Planning/plan preview | `WorkSetupFlow.test.tsx` | `PlanPage.tsx` | `ENDPOINT_ABSENT`, `SERVICE_NON_EXPOSE`, `VISUEL_UNIQUEMENT`. |
| 9 | F01 | `plan.png` — `S03.x phase opened` — Work Setup | `/plan`, état accordion → `PlanPage` | `workSetupPlanPhases`; état local | `CAP-UI-WORK-SETUP-PLAN` (`STUB`) | NONE | `WorkSetupFlow.test.tsx` | `PlanPage.tsx` | `ENDPOINT_ABSENT`, `VISUEL_UNIQUEMENT`. |
| 10 | F01 | `confirm.png` — `S04 Confirm` — Work Setup | `/confirm` → `features/work-setup/ConfirmPage.tsx` | `WorkSetupProvider`, `workSetupAutonomyLevels`; `Create work` navigue vers `/work` | `CAP-UI-WORK-SETUP-CONFIRM` (`STUB`) | `M-CREATE` existe mais le contexte ne fournit pas `projectId`, `missionId`, `missionType`, `authority`, scope, livrables, critères d'arrêt et références ; `M-EXECUTE-BFF` non connecté | `WorkSetupFlow.test.tsx`, `WorkSetupProvider.test.tsx`; tests Core/BFF des contrats isolés | `ConfirmPage.tsx` bouton `Create work`; état dans `WorkSetupProvider.tsx` | `ENDPOINT_INCOMPLET`, `RUNTIME_NON_ACCESSIBLE_FRONT` : aucune requête valide ne peut être construite sans décision de contrat. |
| 11 | F02 | `work-overview.png` — `W01 Work Shell` — Work | `/work/:workId` → `components/routes/WorkSurface.tsx`; shell dans `NavigationShell.tsx` | `WorkPageHeader`; sept getters de fixtures | agrège `CAP-UI-WORK-*` | `R-MISSIONS`/`R-MISSION`; la route UI ne porte que `workId`, l'API exige aussi `projectId` | `NavigationShell.test.tsx`, tests de routes et pages Work | `WorkSurface.tsx`, précisément la lecture `usePathParams()` et les appels `getWork*Fixture(workId)` | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT` : identité `workId ↔ projectId/missionId` non établie. |
| 12 | F02 | `work-overview.png` — `W01.1 Work Overview` — Work | `/work/:workId/overview` → `features/work/WorkOverviewPage.tsx` | `WorkPageHeader`, tabs, summary/actions; `workOverviewFixture.ts` | `CAP-UI-WORK-OVERVIEW` (`STUB`) | `R-MISSION` et `R-MONITOR` fournissent état, progression, rapport et événements, mais pas confiance, échéance, NBA, personnes ni objets décision/livrable de la vue | `WorkOverviewPage.test.tsx`; tests Core de mission/monitor | injection dans `WorkSurface.tsx`; rendu et CTA dans `WorkOverviewPage.tsx` | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT`. |
| 13 | F02 | `work-plan.png` — `W01.2 Work Plan` — Work | `/work/:workId/plan` → `features/work/WorkPlanPage.tsx` | phases/tasks de `workPlanFixture.ts` | `CAP-UI-WORK-PLAN` (`STUB`) | `R-MISSION` contient scope/livrables/état, mais aucun contrat de phases, tâches, probabilités ou chemin critique | `WorkPlanPage.test.tsx` | getter dans `WorkSurface.tsx`; props de `WorkPlanPage.tsx` | `ENDPOINT_INCOMPLET`, `SERVICE_NON_EXPOSE`, `VISUEL_UNIQUEMENT`. |
| 14 | F02 | `work-activity.png` — `W01.3 Work Activity` — Work | `/work/:workId/activity` → `features/work/WorkActivityPage.tsx` | `ActivityEvent`, filtres locaux; `workActivityFixture.ts` | `CAP-UI-WORK-ACTIVITY` (`STUB`) | `R-ACTIVITY` et `R-MONITOR` → `NovaCoreService.getEvents/getObservabilityEvents/subscribeObservability` → Event Bus/Runtime | `WorkActivityPage.test.tsx`; `nova-core.http.test.ts`, `mission-event-publisher.test.ts`, `orchestrator-runtime.test.ts` | `WorkSurface.tsx` branche `activity` et props `activity/work`; présentation dans `WorkActivityPage.tsx` | `ENDPOINT_EXPLOITABLE` en lecture seule. Premier point raccordable ; la projection reste limitée aux champs réellement présents dans `RuntimeEvent`/`RuntimeObservabilityEvent`. |
| 15 | F02 | `work-people.png` — `W01.4 Work People` — Work | `/work/:workId/people` → `features/work/WorkPeoplePage.tsx` | `PersonCard`, `PersonDrawer`; `workPeopleFixture.ts` | `CAP-UI-WORK-PEOPLE` (`STUB`) | NONE ; agent assigné dans `RuntimeMission` ne constitue pas un catalogue People | `WorkPeoplePage.test.tsx` | getter dans `WorkSurface.tsx`; props et `PersonDrawer` privés dans `WorkPeoplePage.tsx` | `ENDPOINT_ABSENT`, `VISUEL_UNIQUEMENT`. |
| 16 | F02 | `work-sources.png` — `W01.5 Work Sources` — Work | `/work/:workId/sources` → `features/work/WorkSourcesPage.tsx` | `SourceCard`, `SourceDrawer`; `workSourcesFixture.ts` | `CAP-UI-WORK-SOURCES` (`STUB`) | `R-PREFLIGHT` et données de rapport de `R-MISSION` sont partielles ; aucun catalogue Source/add/refresh/detail | `WorkSourcesPage.test.tsx`; `git-preflight.test.ts`, tests Core | getter dans `WorkSurface.tsx`; props/actions/drawer dans `WorkSourcesPage.tsx` | `ENDPOINT_INCOMPLET`, `SERVICE_NON_EXPOSE`, `VISUEL_UNIQUEMENT`. |
| 17 | F02 | `work-decisions.png` — `W01.6 Work Decisions` — Work | `/work/:workId/decisions` → `features/work/WorkDecisionsPage.tsx` | `DecisionCard`; `workDecisionsFixture.ts`; CTA vers `decision.detail` | `CAP-UI-WORK-DECISIONS` (`STUB`) | NONE ; événements de validation et certificat ne sont pas des objets Decision ; `M-APPROVE` retiré | `WorkDecisionsPage.test.tsx`; test de route seulement au-delà | getter dans `WorkSurface.tsx`; navigation dans `WorkDecisionsPage.tsx` | `ENDPOINT_ABSENT`, `SERVICE_NON_EXPOSE`, `VISUEL_UNIQUEMENT`. |
| 18 | F02 | `work-deliverables.png` — `W01.7 Work Deliverables` — Work | `/work/:workId/deliverables` → `features/work/WorkDeliverablesPage.tsx` | cards, `DeliverableDrawer`; `workDeliverablesFixture.ts` | `CAP-UI-WORK-DELIVERABLES` (`STUB`) | `R-MISSION` fournit `MissionReport.deliverables` et `deliverableEvidence`, sans catalogue, création, détail ni téléchargement | `WorkDeliverablesPage.test.tsx`; tests Core de rapport/evidence | getter dans `WorkSurface.tsx`; props/actions dans `WorkDeliverablesPage.tsx` | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT`. |
| 19 | F04 | `global-decisions.png` — `G01 Global Decisions` — Global | `/decisions` → `components/routes/DecisionsSurface.tsx` | filtres locaux; `globalDecisionsFixture` dérivée des fixtures Work | `CAP-UI-DECISION-FLOW` (`STUB`) | NONE ; aucune liste globale de Decisions | `RouteSurface.test.tsx` | branche `decisions` dans `RouteSurface.tsx`; source dans `DecisionsSurface.tsx` | `ENDPOINT_ABSENT`, `SERVICE_NON_EXPOSE`, `VISUEL_UNIQUEMENT`. |
| 20 | F04 | `global-deliverables.png` — `G02 Global Deliverables` — Global | `/deliverables` → `components/routes/DeliverablesSurface.tsx` | filtres/actions; `globalDeliverablesFixture` dérivée des fixtures Work | `CAP-UI-DELIVERABLES` (`STUB`) | `R-MISSIONS`/`R-MISSION` donnent des rapports par mission, mais aucun index global ou contrat de téléchargement | `RouteSurface.test.tsx` | branche `deliverables` dans `RouteSurface.tsx`; source dans `DeliverablesSurface.tsx` | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT`. |
| 21 | F03 | `decision-package.png` — `D01 Decision Package` — Decision | `/decisions/:decisionId/package`; rendu réel `DecisionsSurface` | composant Package NONE | `CAP-UI-DECISION-FLOW` (`STUB`) | NONE ; Human Approval interne `SERVICE_NON_EXPOSE`; `M-APPROVE` retiré | resolver/navigation seulement | `RouteRegistry.ts` (`surfaceRouteId: decisions`) et branche `decisions` de `RouteSurface.tsx` | `COMPOSANT_FONCTIONNEL_ABSENT`, `ENDPOINT_ABSENT`, `RUNTIME_NON_ACCESSIBLE_FRONT`. |
| 22 | F03 | `decision-pause-step1.png` — `D02.1 Decision Pause Review` — Decision | `/decisions/:decisionId/pause`; rendu réel `DecisionsSurface` | composant Review NONE | `CAP-UI-DECISION-FLOW` (`STUB`) | NONE ; package et demande d'approbation non exposés | resolver/navigation seulement | `RouteRegistry.ts` et `RouteSurface.tsx` | `COMPOSANT_FONCTIONNEL_ABSENT`, `SERVICE_NON_EXPOSE`, `ENDPOINT_ABSENT`. |
| 23 | F03 | `decision-pause-step2.png` — `D02.2 Decision Pause Decide` — Decision | même route/état ; rendu réel `DecisionsSurface` | formulaire Decide NONE | `CAP-UI-DECISION-FLOW` (`STUB`) | `M-APPROVE` = HTTP 410 ; Human Approval interne non exposé | garde HTTP Core ; resolver/navigation Frontend | `RouteRegistry.ts` et `RouteSurface.tsx` | `COMPOSANT_FONCTIONNEL_ABSENT`, `ENDPOINT_ABSENT`; aucun raccordement licite actuel. |
| 24 | F03 | `decision-receipt.png` — `D03 Decision Receipt` — Decision | `/decisions/:decisionId/receipt`; rendu réel `DecisionsSurface` | composant Receipt NONE | `CAP-UI-DECISION-FLOW` (`STUB`) | `R-CERTIFICATE` existe mais produit un certificat Runtime, pas un reçu de décision | `mission-certification.test.ts`; resolver/navigation seulement | `RouteRegistry.ts` et `RouteSurface.tsx` | `COMPOSANT_FONCTIONNEL_ABSENT`, `ENDPOINT_ABSENT` pour le receipt ; ne pas substituer le certificat Runtime. |
| 25 | F04 | `search-overlay.png` — `O01 Search Overlay` — Global | état global attendu ; lien `href="#search"` dans `NavigationShell.tsx` | composant/état/raccourci Search NONE | aucune Capability UI autonome | NONE ; aucun contrat Search | NONE | `NavigationShell.tsx`, entrée Search de la navigation utilitaire | `COMPOSANT_FONCTIONNEL_ABSENT`, `ENDPOINT_ABSENT`, `RUNTIME_NON_ACCESSIBLE_FRONT`. |
| 26 | F01 | `home.png` — `Home Situation Drawer` — Home | état de `/home` → `SituationDetailsDrawer.tsx` intégré à `HomePage` | `Drawer`; contenu `homeFixture`/état local | hérite `CAP-UI-HOME` | `R-MISSION`/`R-MONITOR` contiennent état et événements, mais pas l'analyse/NBA affichée | `HomePage.test.tsx`, `SituationDetailsDrawer.test.tsx` | `HomePage.tsx`, props `SituationDetailsDrawer` | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT`. |
| 27 | F02 | `work-overview.png` — `Work Full Analysis Drawer` — Work | état attendu de Overview ; bouton sans handler | composant Full Analysis NONE ; `Drawer` générique disponible | hérite `CAP-UI-WORK-OVERVIEW` | NONE pour une Full Analysis ; `R-MISSION` ne contient pas cette projection | NONE pour ce drawer | bouton `Full analysis` dans `WorkOverviewPage.tsx` | `COMPOSANT_FONCTIONNEL_ABSENT`, `ENDPOINT_ABSENT`; réutilisation technique possible du `Drawer` générique, contenu contractuel absent. |
| 28 | F02 | `DRAWER_MARIE_DUPONT_PEOPLE.png` — `Person Detail Drawer` — Work | état de People → `PersonDrawer` privé dans `WorkPeoplePage.tsx` | `Drawer`; détail `workPeopleFixture` | hérite `CAP-UI-WORK-PEOPLE` | NONE | `WorkPeoplePage.test.tsx` | `PersonDrawer` et `selectedPersonId` dans `WorkPeoplePage.tsx` | `ENDPOINT_ABSENT`, `VISUEL_UNIQUEMENT`. |
| 29 | F02 | `NOVA-SOURCE-DETAIL-V7.png` — `Source Detail Drawer` — Work | état de Sources → `SourceDrawer` privé dans `WorkSourcesPage.tsx` | `Drawer`; détail `workSourcesFixture` | hérite `CAP-UI-WORK-SOURCES` | `R-PREFLIGHT`/`R-MISSION` partiels ; aucune ressource Source identifiable par ID | `WorkSourcesPage.test.tsx` | `SourceDrawer` et `selectedSourceId` dans `WorkSourcesPage.tsx` | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT`. |
| 30 | F02 | `NOVA-DELIVERABLES-DETAIL-V7.png` — `Deliverable Detail Drawer` — Work | état de Deliverables → `DeliverableDrawer` privé dans `WorkDeliverablesPage.tsx` | `Drawer`; détail/history fixture | hérite `CAP-UI-WORK-DELIVERABLES` | `R-MISSION` contient rapport et evidence, sans ressource Deliverable détaillée | `WorkDeliverablesPage.test.tsx` | `DeliverableDrawer` et `selectedDeliverableId` dans `WorkDeliverablesPage.tsx` | `ENDPOINT_INCOMPLET`, `VISUEL_UNIQUEMENT`. |
| 31 | F03 | `DRAWER_DECISION_PACKAGE_WORK_REVIEW-V7.png` — `Full Package Drawer` — Decision | état attendu de D01 ; composant spécifique NONE | seul `components/drawer/Drawer.tsx` existe | hérite `CAP-UI-DECISION-FLOW` | NONE ; package Human Approval non exposé | `Drawer.test.tsx` uniquement | futur point d'appel borné par `RouteSurface.tsx`; primitive réutilisable `Drawer.tsx` | `COMPOSANT_FONCTIONNEL_ABSENT`, `SERVICE_NON_EXPOSE`, `ENDPOINT_ABSENT`. |

## 5. Contrôle des 7 unités `UI_ONLY`

| Unité | Composant manquant | Route | Capability | Réutilisation objectivement disponible | Blocage exact |
|---|---|---|---|---|---|
| `D01 Decision Package` | surface Package | présente | `CAP-UI-DECISION-FLOW` | routeur, shell, primitives UI | aucun contrat package et aucun Human Approval HTTP |
| `D02.1 Review` | surface Review | présente | `CAP-UI-DECISION-FLOW` | même infrastructure de route | demande/revue d'approbation non exposée |
| `D02.2 Decide` | formulaire Decide | présente | `CAP-UI-DECISION-FLOW` | même infrastructure de route | `/approve` retourne 410 ; aucun contrat de décision |
| `D03 Receipt` | surface Receipt | présente | `CAP-UI-DECISION-FLOW` | même infrastructure de route | aucun Decision Receipt ; certificat Runtime non équivalent |
| `O01 Search Overlay` | overlay Search et état d'ouverture | lien `#search`, pas de route | aucune autonome | shell/navigation uniquement | aucun composant ni endpoint Search |
| `Work Full Analysis Drawer` | drawer Full Analysis | état Overview | hérite `CAP-UI-WORK-OVERVIEW` | primitive `Drawer` | aucun contenu/projection Full Analysis |
| `Full Package Drawer` | drawer Package | état D01 | hérite `CAP-UI-DECISION-FLOW` | primitive `Drawer` | D01 absent et package non exposé |

## 6. Bilan

| Contrôle | Résultat |
|---|---:|
| Unités auditées | 31/31 |
| Unités avec point Frontend exact | 31/31 |
| Unités avec une lecture directement exploitable | 1 (`W01.3`) |
| Unités avec endpoint existant mais incomplet | 11 |
| Unités sans endpoint fonctionnel correspondant | 19 |
| Unités `UI_ONLY` expliquées | 7/7 |
| Appels Frontend existants vers API/BFF | 0 |
| Code modifié par SW-009 | 0 |

La seule activation immédiate et bornée par les contrats présents est la lecture de l'activité
Runtime pour `W01.3`, dans le lot F02. Elle ne nécessite ni mutation, ni secret, ni
`ProgramProductionEntrypoint`. Elle ne doit pas être présentée comme une activation du parcours
d'exécution certifié.

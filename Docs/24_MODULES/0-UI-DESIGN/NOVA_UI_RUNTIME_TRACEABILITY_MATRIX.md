# NOVA — UI → FRONTEND → RUNTIME TRACEABILITY MATRIX

## 1. Document Control

| Champ | Valeur |
|---|---|
| Mission | `SW-008 — UI → FRONTEND → RUNTIME CERTIFICATION` |
| Date | 2026-07-30 |
| Mode | Audit en lecture seule |
| Unités visuelles | 31/31 |
| Patrimoine PNG | 46/46 |
| Sources principales | Matrice PNG SW-007F, code `apps/nova-web`, BFF, NOVA Core, registres SW-005/SW-006 |

## 2. Légende des statuts

| Statut | Critère cumulatif |
|---|---|
| `UI_ONLY` | Référence PNG présente, mais composant React correspondant absent ou non intégré. |
| `UI_READY` | Route ou état attendu et composant React intégrés, avec UI locale/fixtures ; aucune connexion BFF. |
| `FRONT_CONNECTED` | UI connectée à un BFF/API, sans preuve d'atteinte du Runtime. |
| `RUNTIME_CONNECTED` | Chaîne UI → BFF/API → Service → Runtime démontrée, mais complétude ou certification finale absente. |
| `FULLY_IMPLEMENTED` | Chaîne complète démontrée, tests applicables passants et certification disponible. |

Un statut est attribué à chaque unité. La présence d'une route sans composant correspondant ne dépasse pas `UI_ONLY`. Un Runtime existant ailleurs dans le dépôt n'est pas considéré connecté sans appel depuis l'UI.

## 3. Socle commun observé

| Couche | Preuve |
|---|---|
| Navigation | [`RouteRegistry.ts`](../../../apps/nova-web/src/routes/RouteRegistry.ts), [`routeResolver.ts`](../../../apps/nova-web/src/routes/routeResolver.ts), History API |
| Layout principal | [`NavigationShell.tsx`](../../../apps/nova-web/src/components/shell/NavigationShell.tsx) → `AppShell` → `ContentViewport` → `ContentArea` |
| Routage de surfaces | [`RouteSurface.tsx`](../../../apps/nova-web/src/components/routes/RouteSurface.tsx) |
| Données Frontend | Fixtures locales et état/contexte React ; aucun client HTTP |
| BFF disponible | Sessions, probes et `runtime/execute`; aucune consommation par `apps/nova-web` |
| Runtime disponible | NOVA Core et Runtime présents, mais aucune chaîne issue des 31 unités |
| Certification transversale | [`PROGRAM_NOVA_UX_CERTIFICATION_REPORT.md`](../../../PROGRAM_NOVA_UX_CERTIFICATION_REPORT.md) : `UX_PRESENT_BUT_NOT_CONNECTED` |
| Certification Runtime UX | [`PROGRAM_NOVA_UX_RUNTIME_INTEGRATION_REPORT.md`](../../../PROGRAM_NOVA_UX_RUNTIME_INTEGRATION_REPORT.md) : `UX_RUNTIME_INTEGRATION_BLOCKED` |

## 4. Matrice exhaustive

Abréviations : `NONE` = absence constatée ; `N/A` = non applicable ; `route-only` = tests du chemin sans composant fonctionnel correspondant.

| # | PNG de référence | Unité visuelle | Navigation | Route Frontend | Composant / Interface React | Layout ; drawer/modal | Capability | BFF/API | Service | Runtime | Tests | Certification | Statut | Preuve / écart principal |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | [`HOME-REPLIE.png`](<NOVA-DESIGN-V7/HOME/HOME-REPLIE.png>) | `H01/H01.1` Home, composer replié | `T001–T003`, `T012–T021` | `/home` — EXISTS | `HomePage`, `ObjectiveComposer` — EXISTS | Shell principal ; Situation drawer disponible | `CAP-UI-HOME` | NONE | NONE | NONE | `HomePage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Rendu depuis fixture `homeFixture`; aucune requête réseau. |
| 2 | [`Home-DEPLIE.png`](<NOVA-DESIGN-V7/HOME/Home-DEPLIE.png>) | `H01.2` Home, composer développé | `T012–T015` | `/home`, état local — EXISTS | `HomePage`, `ObjectiveComposer` — EXISTS | Shell principal ; état expanded | `CAP-UI-HOME` | NONE | NONE | NONE | `HomePage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Saisie et Continue sont locaux ; aucun contrat mission envoyé. |
| 3 | [`clarify.png`](<NOVA-DESIGN-V7/v7/screens/clarify.png>) | `S01.1` Clarify, étape 1 | `T015`, `T022`, `T025`, `T027` | `/clarify` — EXISTS | `ClarifyPage` — EXISTS | Shell principal ; wizard local | `CAP-UI-WORK-SETUP-CLARIFY` | NONE | NONE | NONE | `WorkSetupFlow.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | État porté par `WorkSetupProvider`; fixtures locales. |
| 4 | [`clarify.png`](<NOVA-DESIGN-V7/v7/screens/clarify.png>) | `S01.2` Clarify, étape 2 | `T022`, `T023`, `T026`, `T027` | `/clarify`, étape locale — EXISTS | `ClarifyPage` — EXISTS | Même wizard | `CAP-UI-WORK-SETUP-CLARIFY` | NONE | NONE | NONE | `WorkSetupFlow.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Étape locale, sans persistance serveur. |
| 5 | [`clarify.png`](<NOVA-DESIGN-V7/v7/screens/clarify.png>) | `S01.3` Clarify, étape 3 | `T023`, `T024`, `T026`, `T027` | `/clarify`, étape locale — EXISTS | `ClarifyPage` — EXISTS | Même wizard | `CAP-UI-WORK-SETUP-CLARIFY` | NONE | NONE | NONE | `WorkSetupFlow.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | La sortie vers Canvas est testée, sans backend. |
| 6 | [`canvas.png`](<NOVA-DESIGN-V7/v7/screens/canvas.png>) | `S02` Canvas, lecture | `T024`, `T028–T031` | `/canvas` — EXISTS | `CanvasPage` — EXISTS | Shell principal ; cartes locales | `CAP-UI-WORK-SETUP-CANVAS` | NONE | NONE | NONE | `WorkSetupFlow.test.tsx`, `WorkSetupProvider.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Modèle Canvas conservé uniquement dans le contexte React. |
| 7 | [`canvas.png`](<NOVA-DESIGN-V7/v7/screens/canvas.png>) | `S02.x` Canvas, édition | `T028`, `T029` | `/canvas`, état local — EXISTS | `CanvasPage` — EXISTS | Même page ; read/editing | `CAP-UI-WORK-SETUP-CANVAS` | NONE | NONE | NONE | `WorkSetupProvider.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Édition locale, aucune sauvegarde service. |
| 8 | [`plan.png`](<NOVA-DESIGN-V7/v7/screens/plan.png>) | `S03` Plan Setup | `T031–T034` | `/plan` — EXISTS | `PlanPage` — EXISTS | Shell principal ; accordion | `CAP-UI-WORK-SETUP-PLAN` | NONE | NONE | NONE | `WorkSetupFlow.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Phases issues de `workSetupFixtures`. |
| 9 | [`plan.png`](<NOVA-DESIGN-V7/v7/screens/plan.png>) | `S03.x` Plan, phase ouverte | `T032` | `/plan`, état local — EXISTS | `PlanPage` — EXISTS | Même page ; expanded/collapsed | `CAP-UI-WORK-SETUP-PLAN` | NONE | NONE | NONE | `WorkSetupFlow.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Interaction locale uniquement. |
| 10 | [`confirm.png`](<NOVA-DESIGN-V7/v7/screens/confirm.png>) | `S04` Confirm | `T034–T037` | `/confirm` — EXISTS | `ConfirmPage` — EXISTS | Shell principal | `CAP-UI-WORK-SETUP-CONFIRM` | NONE | NONE | NONE | `WorkSetupFlow.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `Create work` navigue vers `/work`; aucune création de mission. |
| 11 | [`work-overview.png`](<NOVA-DESIGN-V7/v7/screens/work-overview.png>) | `W01` Work Shell | `T003`, `T038–T045` | `/work/:workId` — EXISTS | `NavigationShell`, `WorkSurface`, `WorkPageHeader` — EXISTS | Shell Work et sept onglets | Agrège `CAP-UI-WORK-*` | NONE | NONE | NONE | `NavigationShell.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `workId` sélectionne une fixture, pas une ressource distante. |
| 12 | [`work-overview.png`](<NOVA-DESIGN-V7/v7/screens/work-overview.png>) | `W01.1` Work Overview | `T039`, `T049–T053` | `/work/:workId/overview` — EXISTS | `WorkOverviewPage` — EXISTS | Work Shell ; Full Analysis absent | `CAP-UI-WORK-OVERVIEW` | NONE | NONE | NONE | `WorkOverviewPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `workOverviewFixture`; plusieurs CTA sans handler. |
| 13 | [`work-plan.png`](<NOVA-DESIGN-V7/v7/screens/work-plan.png>) | `W01.2` Work Plan | `T040`, `T054` | `/work/:workId/plan` — EXISTS | `WorkPlanPage` — EXISTS | Work Shell ; phases | `CAP-UI-WORK-PLAN` | NONE | NONE | NONE | `WorkPlanPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `workPlanFixture`; aucun service Planning. |
| 14 | [`work-activity.png`](<NOVA-DESIGN-V7/v7/screens/work-activity.png>) | `W01.3` Work Activity | `T041`, `T055`, `T056` | `/work/:workId/activity` — EXISTS | `WorkActivityPage` — EXISTS | Work Shell ; filtres locaux | `CAP-UI-WORK-ACTIVITY` | NONE | NONE | NONE | `WorkActivityPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `workActivityFixture`; Post ne persiste aucun événement. |
| 15 | [`work-people.png`](<NOVA-DESIGN-V7/v7/screens/work-people.png>) | `W01.4` Work People | `T042`, `T057`, `T058` | `/work/:workId/people` — EXISTS | `WorkPeoplePage` — EXISTS | Work Shell ; `PersonDrawer` | `CAP-UI-WORK-PEOPLE` | NONE | NONE | NONE | `WorkPeoplePage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `workPeopleFixture`; Invite sans connexion. |
| 16 | [`work-sources.png`](<NOVA-DESIGN-V7/v7/screens/work-sources.png>) | `W01.5` Work Sources | `T043`, `T059–T061` | `/work/:workId/sources` — EXISTS | `WorkSourcesPage` — EXISTS | Work Shell ; `SourceDrawer` | `CAP-UI-WORK-SOURCES` | NONE | NONE | NONE | `WorkSourcesPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `workSourcesFixture`; Add/Refresh sans service. |
| 17 | [`work-decisions.png`](<NOVA-DESIGN-V7/v7/screens/work-decisions.png>) | `W01.6` Work Decisions | `T044`, `T062`, `T063` | `/work/:workId/decisions` — EXISTS | `WorkDecisionsPage` — EXISTS | Work Shell ; aucun drawer requis | `CAP-UI-WORK-DECISIONS` | NONE | NONE | NONE | `WorkDecisionsPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Liste fixture ; CTA ouvre une route Decision sans surface dédiée. |
| 18 | [`work-deliverables.png`](<NOVA-DESIGN-V7/v7/screens/work-deliverables.png>) | `W01.7` Work Deliverables | `T045`, `T064–T066` | `/work/:workId/deliverables` — EXISTS | `WorkDeliverablesPage` — EXISTS | Work Shell ; `DeliverableDrawer` | `CAP-UI-WORK-DELIVERABLES` | NONE | NONE | NONE | `WorkDeliverablesPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `workDeliverablesFixture`; Create sans service. |
| 19 | [`global-decisions.png`](<NOVA-DESIGN-V7/v7/screens/global-decisions.png>) | `G01` Global Decisions | `T004`, `T067–T069` | `/decisions` — EXISTS | `DecisionsSurface` — EXISTS | Shell principal ; filtres | `CAP-UI-DECISION-FLOW` | NONE | NONE | NONE | `RouteSurface.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `globalDecisionsFixture`; navigation package non suivie d'une surface package. |
| 20 | [`global-deliverables.png`](<NOVA-DESIGN-V7/v7/screens/global-deliverables.png>) | `G02` Global Deliverables | `T005`, `T070`, `T071` | `/deliverables` — EXISTS | `DeliverablesSurface` — EXISTS | Shell principal ; filtres | `CAP-UI-DELIVERABLES` | NONE | NONE | NONE | `RouteSurface.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | `globalDeliverablesFixture`; Create/View/Download sans backend. |
| 21 | [`decision-package.png`](<NOVA-DESIGN-V7/v7/screens/decision-package.png>) | `D01` Decision Package | `T068`, `T072–T077`, `T090` | `/decisions/:decisionId/package` — EXISTS | **MISSING** ; rendu réel `DecisionsSurface` | Shell principal au lieu de surface Package | `CAP-UI-DECISION-FLOW` | NONE | NONE | NONE | Route-only : resolver/navigation PASS | Intégration UX bloquée `B-08` | `UI_ONLY` | `surfaceRouteId=decisions`; aucun composant Package. |
| 22 | [`decision-pause-step1.png`](<NOVA-DESIGN-V7/v7/screens/decision-pause-step1.png>) | `D02.1` Decision Pause — Review | `T077–T079` | `/decisions/:decisionId/pause`, état Review — EXISTS | **MISSING** ; rendu réel `DecisionsSurface` | Fullscreen attendu ; shell/liste globale réels | `CAP-UI-DECISION-FLOW` | NONE | NONE | NONE | Route-only : resolver/navigation PASS | Intégration UX bloquée `B-08` | `UI_ONLY` | Aucun composant Review. |
| 23 | [`decision-pause-step2.png`](<NOVA-DESIGN-V7/v7/screens/decision-pause-step2.png>) | `D02.2` Decision Pause — Decide | `T079–T083` | Même route, état Decide — EXISTS | **MISSING** ; rendu réel `DecisionsSurface` | Fullscreen attendu ; aucun formulaire Decide | `CAP-UI-DECISION-FLOW` | NONE | NONE | NONE | Route-only : resolver/navigation PASS | Intégration UX bloquée `B-03/B-08` | `UI_ONLY` | Aucun choix/rationale connecté ; `/approve` Core retourne 410. |
| 24 | [`decision-receipt.png`](<NOVA-DESIGN-V7/v7/screens/decision-receipt.png>) | `D03` Decision Receipt | `T083–T086` | `/decisions/:decisionId/receipt` — EXISTS | **MISSING** ; rendu réel `DecisionsSurface` | Fullscreen attendu ; aucune Receipt UI | `CAP-UI-DECISION-FLOW` | NONE | NONE | NONE | Route-only : resolver/navigation PASS | Intégration UX bloquée `B-08` | `UI_ONLY` | Aucun composant Receipt ni lecture de certificat. |
| 25 | [`search-overlay.png`](<NOVA-DESIGN-V7/SEARCH-OVERLAY/search-overlay.png>) | `O01` Search Overlay | `T006`, `T007`, `T087–T092` | N/A — état global | **MISSING** ; lien réel `href="#search"` seulement | Modal global attendu ; absent | Aucune Capability UI autonome | NONE | NONE | NONE | NONE | Aucun objet d'intégration à certifier | `UI_ONLY` | Aucun `SearchOverlay`, état `searchOpen` ou raccourci Cmd/Ctrl+K. |
| 26 | [`home.png`](<NOVA-DESIGN-V7/v7/screens/home.png>) | Home Situation Drawer | `T020`, `T021`, `T093`, `T094` | N/A — état de `/home` | `SituationDetailsDrawer` — EXISTS | `Drawer` modal, intégré à `HomePage` | `CAP-UI-HOME` | NONE | NONE | NONE | `HomePage.test.tsx`, `SituationDetailsDrawer.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Contenu fixture/local ; fermeture bouton/backdrop/Escape testée. |
| 27 | [`work-overview.png`](<NOVA-DESIGN-V7/v7/screens/work-overview.png>) | Work Full Analysis Drawer | `T053`, `T093`, `T094` | N/A — état Overview | **MISSING** ; bouton `Full analysis` sans handler | Drawer attendu ; absent | `CAP-UI-WORK-OVERVIEW` | NONE | NONE | NONE | NONE pour le drawer | Aucun composant à certifier | `UI_ONLY` | Le libellé est rendu, sans état, composant ni test d'ouverture. |
| 28 | [`DRAWER_MARIE_DUPONT_PEOPLE.png`](<NOVA-DESIGN-V7/People/DRAWER_MARIE_DUPONT_PEOPLE.png>) | Person Detail Drawer | `T058`, `T093`, `T094` | N/A — état People | `PersonDrawer` privé dans `WorkPeoplePage` — EXISTS | `Drawer` modal | `CAP-UI-WORK-PEOPLE` | NONE | NONE | NONE | `WorkPeoplePage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Quatre variantes de personnes reposent sur fixture. |
| 29 | [`NOVA-SOURCE-DETAIL-V7.png`](<NOVA-DESIGN-V7/SOURCES/NOVA-SOURCE-DETAIL-V7.png>) | Source Detail Drawer | `T061`, `T093`, `T094` | N/A — état Sources | `SourceDrawer` privé dans `WorkSourcesPage` — EXISTS | `Drawer` modal | `CAP-UI-WORK-SOURCES` | NONE | NONE | NONE | `WorkSourcesPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Drawer relié à fixture, pas à Evidence/Source Service. |
| 30 | [`NOVA-DELIVERABLES-DETAIL-V7.png`](<NOVA-DESIGN-V7/DELIVBERABLES/NOVA-DELIVERABLES-DETAIL-V7.png>) | Deliverable Detail Drawer | `T066`, `T093`, `T094` | N/A — état Deliverables | `DeliverableDrawer` privé dans `WorkDeliverablesPage` — EXISTS | `Drawer` modal | `CAP-UI-WORK-DELIVERABLES` | NONE | NONE | NONE | `WorkDeliverablesPage.test.tsx` — PASS | Présence UX certifiée ; intégration bloquée | `UI_READY` | Détails/history issus de fixture. |
| 31 | [`DRAWER_DECISION_PACKAGE_WORK_REVIEW-V7.png`](<NOVA-DESIGN-V7/WORK/DRAWER_DECISION_PACKAGE_WORK_REVIEW-V7.png>) | Full Package Drawer | `T076`, `T093`, `T094` | N/A — état D01 | **MISSING** ; seul `Drawer` générique existe | Drawer attendu ; non intégré | `CAP-UI-DECISION-FLOW` | NONE | NONE | NONE | NONE | Aucun composant à certifier | `UI_ONLY` | D01 lui-même est absent ; aucun Full Package spécifique. |

## 5. Contrôles de cohérence

| Contrôle | Résultat |
|---|---:|
| Unités attendues | 31 |
| Lignes de matrice | 31 |
| PNG de référence rattachés | 31 |
| Statuts uniques attribués | 31 |
| `UI_ONLY` | 7 |
| `UI_READY` | 24 |
| `FRONT_CONNECTED` | 0 |
| `RUNTIME_CONNECTED` | 0 |
| `FULLY_IMPLEMENTED` | 0 |
| Unités avec UI React correspondante | 24/31 |
| Unités atteignant un BFF/API | 0/31 |
| Unités atteignant un Runtime | 0/31 |

**Résultat : PASS — cartographie exhaustive 31/31 ; aucune chaîne UI → Runtime complète.**

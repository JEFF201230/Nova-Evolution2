# NOVA Frontend ↔ Runtime — Mapping Matrix

## 0. Lecture de la matrice

La matrice couvre les 31 unités UX certifiées et l'état courant du code après SW-010.

`EXISTING` signifie qu'un endpoint existe dans le dépôt. Cela ne signifie pas qu'il est consommé par le Frontend.

## 1. Chaînes techniques disponibles

| ID | Chaîne | Statut |
|---|---|---|
| C-CORE-MISSIONS | `GET /api/v1/missions` → `NovaCoreService.listMissions` → `OrchestratorRuntimeService.listMissions` | EXISTING, consommée par Work Activity |
| C-CORE-EVENTS | `GET /api/v1/missions/:projectId/:missionId/events` → `NovaCoreService.getEvents` → journal Runtime | EXISTING, consommée par Work Activity |
| C-CORE-DETAIL | `GET /api/v1/missions/:projectId/:missionId` → mission/report/events/observability | EXISTING, non consommée |
| C-CORE-MONITOR | `GET .../monitor` et `/monitor/stream` | EXISTING, non consommée |
| C-BFF-SESSION | `GET /session`, login, logout | EXISTING, non consommée |
| C-BFF-EXECUTE | `POST /api/runtime/execute` | route présente, gateway non injecté au démarrage |
| C-WORK-OVERVIEW | `GET /api/v1/missions/:projectId/:missionId/overview` | FUTUR, spécifié par SW-012 mais bloqué par les producteurs |

## 2. Matrice exhaustive des 31 unités

| # | Unité UX / PNG | Route / composant actuel | Source actuelle | Source cible autoritative | Adapter nécessaire | Capability / Read Model | Endpoint | Blocage | Statut actuel | Réutilisabilité |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | H01/H01.1 HOME replié — `HOME-REPLIE.png` | `/home` → `HomePage` | `homeFixture` | Session + Work + Decisions + Intelligence | projection HOME → props de page | `CAP-UI-HOME`; projection HOME absente | lectures BFF/Core partielles seulement | plusieurs producteurs absents | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 2 | H01.2 HOME développé — `Home-DEPLIE.png` | `/home`, état local → `ObjectiveComposer` | useState + fixture | Mission Preparation | adapter de commande Setup | Capability Preparation absente | aucun endpoint compatible complet | contrat et producteur absents | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 3 | S01.1 Clarify étape 1 — `clarify.png` | `/clarify` → `ClarifyPage` | `workSetupFixtures` | Mission Preparation / Clarification | contexte → service de préparation | Capability/Read Model absents | aucun | doctrine de clarification non exposée | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 4 | S01.2 Clarify étape 2 — `clarify.png` | même route/composant | contexte React | Mission Preparation / Clarification | même adapter | absent | aucun | aucune persistance | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 5 | S01.3 Clarify étape 3 — `clarify.png` | même route/composant | contexte React | Mission Preparation / Clarification | même adapter | absent | aucun | aucune persistance | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 6 | S02 Canvas lecture — `canvas.png` | `/canvas` → `CanvasPage` | `WorkSetupProvider` | Mission Preparation | adapter Canvas | Read Model Canvas absent | aucun | agrégat absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 7 | S02.x Canvas édition — `canvas.png` | `/canvas`, état local | useState contexte | Mission Preparation | adapter mutation futur | contrat absent | aucun | aucune autorité serveur | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 8 | S03 Plan Setup — `plan.png` | `/plan` → `PlanPage` | `workSetupPlanPhases` | Planning | adapter Planning → vue Setup | Planning absent | aucun | producteur absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 9 | S03.x Phase ouverte — `plan.png` | même route, état UI | état local | Planning | même adapter | Planning absent | aucun | données de plan fictives | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 10 | S04 Confirm — `confirm.png` | `/confirm` → `ConfirmPage` | contexte local | Mission Preparation puis Missions | mapping Setup → MissionDefinition | contrat Setup absent | `POST /api/v1/missions` existe mais payload incompatible avec l'état UI courant | source métier incomplète, BFF absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 11 | W01 Work Shell — `work-overview.png` | `/work/:workId` → `WorkSurface` / `WorkPageHeader` | `workOverviewFixture` | identité et cycle Work | Work identity → header | WCF-001 | mission list/detail existants, projection Work future | ancrage Work PARTIAL | `IMPLEMENTED_WITH_MOCKS` | élevée après refactor du dispatch |
| 12 | W01.1 Work Overview — `work-overview.png` | `/work/:workId/overview` → `WorkOverviewPage` | `workOverviewFixture` | producteurs WCF-001 à WCF-008 | Read Model Overview → props | Read Model SW-012 | futur `GET .../overview` | Capability Work incomplète | `IMPLEMENTED_WITH_MOCKS` | UI élevée, métier bloqué |
| 13 | W01.2 Work Plan — `work-plan.png` | `/work/:workId/plan` → `WorkPlanPage` | `workPlanFixture` | WCF-003 Planning | projection Work Plan | futur Work Plan | aucun endpoint compatible | producteur Planning absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 14 | W01.3 Work Activity — `work-activity.png` | `/work/:workId/activity` → `WorkActivityPage` | événements Core réels ; header fixture | Missions/Monitoring, puis identité WCF-001 | adapter RuntimeEvent → activité, actuellement dans la page | Capability Activity partielle | `GET /api/v1/missions`, `GET .../events` | BFF contourné, header fictif | `CONNECTED_TO_RUNTIME` | élevée après extraction adapter |
| 15 | W01.4 Work People — `work-people.png` | `/work/:workId/people` → `WorkPeoplePage` | `workPeopleFixture` | WCF-006 People | projection Work People | futur Work People | aucun | producteur People absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 16 | W01.5 Work Sources — `work-sources.png` | `/work/:workId/sources` → `WorkSourcesPage` | `workSourcesFixture` | WCF-004 Evidence | projection Work Sources | futur Work Sources | aucun catalogue de sources | associations Evidence partielles | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 17 | W01.6 Work Decisions — `work-decisions.png` | `/work/:workId/decisions` → `WorkDecisionsPage` | `workDecisionsFixture` | WCF-005 Decisions | projection Work Decisions | futur Work Decisions | aucun | producteur Decisions absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 18 | W01.7 Work Deliverables — `work-deliverables.png` | `/work/:workId/deliverables` → `WorkDeliverablesPage` | `workDeliverablesFixture` | WCF-002 Deliverables | projection Work Deliverables | futur Work Deliverables | mission detail fournit seulement des chaînes partielles | producteur enrichi PARTIAL | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 19 | G01 Global Decisions — `global-decisions.png` | `/decisions` → `DecisionsSurface` | `globalDecisionsFixture` | Decisions | projection globale Decisions | `CAP-UI-DECISION-FLOW` | aucun | Capability/endpoint absents | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 20 | G02 Global Deliverables — `global-deliverables.png` | `/deliverables` → `DeliverablesSurface` | fixture dérivée Work | Deliverables | projection globale Deliverables | `CAP-UI-DELIVERABLES` | aucun endpoint global | livrables Runtime partiels | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 21 | D01 Decision Package — `decision-package.png` | route présente, composant absent ; `DecisionsSurface` rendu | fixture globale non pertinente | Decisions | package → vue | Read Model Decision Package absent | aucun | UI et Capability absentes | `BROKEN` | route réutilisable, UI à produire |
| 22 | D02.1 Pause Review — `decision-pause-step1.png` | route présente, composant absent | fixture globale non pertinente | Decisions / Human Approval | review package → vue | absent | aucun | UI et contrat absents | `BROKEN` | route réutilisable, UI à produire |
| 23 | D02.2 Pause Decide — `decision-pause-step2.png` | même route, état absent | aucune donnée compatible | Decisions / Human Approval | décision → vue/commande | absent | `/approve` Core est déprécié 410 | capability de décision non équivalente | `BROKEN` | route réutilisable, UI à produire |
| 24 | D03 Receipt — `decision-receipt.png` | route présente, composant absent | fixture globale non pertinente | Decisions / Certification | receipt → vue | absent | certificat Mission existant mais non équivalent | UI et modèle Receipt absents | `BROKEN` | route réutilisable, UI à produire |
| 25 | O01 Search Overlay — `search-overlay.png` | lien `#search`, aucun composant | aucune | catalogue Search futur | résultat Search → overlay | aucune Capability UI autonome | aucun | composant et source absents | `BROKEN` | Drawer/modal générique réutilisable |
| 26 | HOME Situation Drawer — `home.png` | `SituationDetailsDrawer` | texte codé en dur | WCF-004/WCF-007/WCF-008 | détails HOME → sections Drawer | projection HOME absente | aucun | producteurs absents | `IMPLEMENTED_WITH_MOCKS` | Drawer élevé, contenu à refactorer |
| 27 | Work Full Analysis Drawer — `work-overview.png` | bouton sans handler, composant absent | aucune | WCF-008 Intelligence | analyse → Drawer | futur Work Overview/Analysis | aucun | UI et Intelligence absentes | `BROKEN` | Drawer générique réutilisable |
| 28 | Person Detail Drawer — `DRAWER_MARIE_DUPONT_PEOPLE.png` | privé dans `WorkPeoplePage` | `workPeopleFixture` | WCF-006 People | Person view → Drawer | Work People futur | aucun | People absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 29 | Source Detail Drawer — `NOVA-SOURCE-DETAIL-V7.png` | privé dans `WorkSourcesPage` | `workSourcesFixture` | WCF-004 Evidence | Source view → Drawer | Work Sources futur | aucun | Evidence Work absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 30 | Deliverable Detail Drawer — `NOVA-DELIVERABLES-DETAIL-V7.png` | privé dans `WorkDeliverablesPage` | `workDeliverablesFixture` | WCF-002 Deliverables | Deliverable view → Drawer | Work Deliverables futur | aucun | enrichissement absent | `IMPLEMENTED_WITH_MOCKS` | élevée avec adapter |
| 31 | Full Package Drawer — `DRAWER_DECISION_PACKAGE_WORK_REVIEW-V7.png` | composant absent | aucune | Decisions | package complet → Drawer | Decision Package absent | aucun | D01 lui-même absent | `BROKEN` | Drawer générique réutilisable |

## 3. Bilan des 31 unités

| État | Nombre | Taux |
|---|---:|---:|
| UI React intégrée | 24 | 77,4 % |
| UI absente ou mauvaise surface | 7 | 22,6 % |
| UI mockée/statique | 23 | 74,2 % |
| UI avec lecture Runtime | 1 | 3,2 % |
| UI connectée au BFF | 0 | 0 % |
| Chaîne canonique complète UI → BFF → Runtime | 0 | 0 % |
| UI totalement fonctionnelle métier | 0 | 0 % |

Les sept unités sans UI conforme sont D01, D02.1, D02.2, D03, O01, Work Full Analysis Drawer et Full Package Drawer.

## 4. Mapping des domaines vers l'infrastructure canonique

| Domaine UI | Source actuelle | Infrastructure disponible | Lacune exacte |
|---|---|---|---|
| HOME | fixture monolithique | session BFF, Mission list/Monitoring Core | projection HOME et producteurs Work/Decision/Intelligence |
| Work Setup | contexte React | création Mission Core | préparation, clarification, Canvas et mapping contractuel |
| Work Activity | Core direct | Missions, événements, Monitoring | BFF, identité Work canonique, adapter séparé |
| Work Overview | fixture | spécification SW-012 | producteurs WCF-001 à WCF-008 |
| Work Plan | fixture | aucune exposition Planning compatible | WCF-003 |
| Work People | fixture | aucun producteur People compatible | WCF-006 |
| Work Sources | fixture | Evidence Runtime partielle | WCF-004 et catalogue de lecture |
| Work Decisions | fixture | workflow d'approbation technique/legacy non équivalent | WCF-005 / Decisions |
| Work Deliverables | fixture | chaînes de livrables Mission | WCF-002 enrichi |
| Global Decisions | fixture dérivée | aucune projection | Decisions |
| Global Deliverables | fixture dérivée | livrables Mission partiels | projection globale |
| Decision Flow | routes seulement | certificat Mission et approval legacy non équivalents | Capability, UI et contrats Decision |
| Search | lien d'ancre | aucune | composant et source Search |

## 5. Conclusion

La convergence ne demande pas de remplacer le shell ou les pages. Elle demande :

1. de construire les producteurs canoniques dans l'ordre SW-014 ;
2. de placer des adapters entre ces producteurs et les props existantes ;
3. de retirer progressivement les fixtures du chemin de production ;
4. de faire passer les accès Runtime par une frontière déployable et configurée ;
5. de produire uniquement les sept unités React réellement absentes.

Le mapping est suffisamment précis pour exclure une réécriture globale et pour maintenir WCF-001 comme prochain lot.

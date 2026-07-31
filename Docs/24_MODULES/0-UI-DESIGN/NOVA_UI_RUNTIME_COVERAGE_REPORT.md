# NOVA — UI → FRONTEND → RUNTIME COVERAGE REPORT

## 1. Décision

**AUDIT COMPLET — TRAÇABILITÉ ÉTABLIE, INTÉGRATION RUNTIME NON CERTIFIABLE**

Les 31 unités visuelles certifiées ont toutes été auditées et rattachées à leur état réel d'implémentation.

Résultat :

- 24 unités sont `UI_READY` ;
- 7 unités sont `UI_ONLY` ;
- 0 unité est `FRONT_CONNECTED` ;
- 0 unité est `RUNTIME_CONNECTED` ;
- 0 unité est `FULLY_IMPLEMENTED`.

Le patrimoine PNG est complet, mais aucune chaîne `PNG → React → BFF → Service → Runtime` n'est complète. L'application React/Vite fonctionne sur des fixtures et de l'état local ; elle ne contient aucun appel réseau.

La matrice exhaustive est disponible dans [NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md](NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md).

## 2. Périmètre et méthode

### 2.1 Périmètre

| Élément | Couverture |
|---|---:|
| PNG patrimoniaux | 46/46 |
| Unités visuelles | 31/31 |
| Routes Frontend déclarées | 20 |
| Sources `apps/nova-web/src` | examinées |
| Routes BFF | examinées |
| Routes NOVA Core | examinées |
| Registres Capability/Activation | examinés |
| Rapports de certification UX/Runtime | examinés |

### 2.2 Contrôles

Pour chaque unité :

1. rattachement au PNG officiel ;
2. route ou état de navigation ;
3. composant React réellement rendu ;
4. layout, drawer ou modal ;
5. imports de fixtures et état local ;
6. appels HTTP, SSE ou WebSocket ;
7. route BFF/API effectivement consommée ;
8. Service et Runtime effectivement atteints ;
9. tests disponibles ;
10. certification applicable.

Un service ou Runtime présent dans le dépôt n'est pas compté comme connecté sans chaîne d'appel issue du Frontend.

## 3. Définitions de statut

| Statut | Interprétation |
|---|---|
| `UI_ONLY` | Référence visuelle officielle sans composant React correspondant intégré. |
| `UI_READY` | UI React et navigation présentes, testées localement, alimentées par fixtures/état React. |
| `FRONT_CONNECTED` | UI consommant réellement un BFF/API. |
| `RUNTIME_CONNECTED` | Appel Frontend démontré jusqu'au Runtime. |
| `FULLY_IMPLEMENTED` | Chaîne complète, comportements requis, tests et certification. |

Les statuts sont cumulatifs et mutuellement exclusifs dans le résultat final.

## 4. Résultats consolidés

### 4.1 Couverture des unités

| Indicateur | Résultat |
|---|---:|
| Unités auditées | **31/31 — 100 %** |
| Unités avec composant React correspondant | **24/31 — 77,4 %** |
| Unités `UI_ONLY` | **7/31 — 22,6 %** |
| Unités `UI_READY` | **24/31 — 77,4 %** |
| Unités `FRONT_CONNECTED` | **0/31 — 0 %** |
| Unités `RUNTIME_CONNECTED` | **0/31 — 0 %** |
| Unités `FULLY_IMPLEMENTED` | **0/31 — 0 %** |

### 4.2 Routes

Les 24 unités nécessitant une route ou partageant une route parent disposent toutes d'une définition de chemin :

- Home ;
- Clarify, Canvas, Plan et Confirm ;
- Work et ses sept onglets ;
- Global Decisions et Global Deliverables ;
- Decision Package, Pause et Receipt.

| Contrôle route | Résultat |
|---|---:|
| Associations de route requises | 24 |
| Associations déclarées | 24 |
| Routes requises totalement absentes | **0** |
| Unités sans route par conception | 7 — Search Overlay et six drawers |
| Unités dont la route rend le mauvais composant | **4** |

Les quatre unités affectées sont :

- `D01` Decision Package ;
- `D02.1` Decision Pause — Review ;
- `D02.2` Decision Pause — Decide ;
- `D03` Decision Receipt.

Le registre déclare `/decisions/:decisionId/package`, `/pause` et `/receipt`, mais leur `surfaceRouteId` vaut `decisions`. [`routeResolver.ts`](../../../apps/nova-web/src/routes/routeResolver.ts) retourne donc la surface globale et [`RouteSurface.tsx`](../../../apps/nova-web/src/components/routes/RouteSurface.tsx) rend `DecisionsSurface`.

### 4.3 Composants React

#### Présents et intégrés

- `HomePage` et `ObjectiveComposer` ;
- `ClarifyPage`, `CanvasPage`, `PlanPage`, `ConfirmPage` ;
- `NavigationShell`, `WorkSurface`, `WorkPageHeader` ;
- les sept pages Work ;
- `DecisionsSurface` ;
- `DeliverablesSurface` ;
- `SituationDetailsDrawer` ;
- `PersonDrawer`, `SourceDrawer`, `DeliverableDrawer`.

#### Manquants ou non intégrés

| Unité | Composant attendu non trouvé | Preuve |
|---|---|---|
| `D01` | Decision Package | Aucun composant distinct ; fallback `DecisionsSurface` |
| `D02.1` | Decision Review | Aucun composant Review |
| `D02.2` | Decision Decide | Aucun composant Decide/formulaire |
| `D03` | Decision Receipt | Aucun composant Receipt |
| `O01` | Search Overlay | Aucun `SearchOverlay`; lien réel `href="#search"` |
| Work Full Analysis Drawer | Drawer Full Analysis | Bouton rendu sans handler |
| Full Package Drawer | Drawer spécifique Decision Package | Seul le composant `Drawer` générique existe |

**Composants fonctionnels manquants : 7 unités sur 31.**

## 5. Frontend et données

### 5.1 Données réellement utilisées

Les surfaces importent :

- `homeFixture` ;
- `workSetupFixtures` ;
- `workOverviewFixture` ;
- `workPlanFixture` ;
- `workActivityFixture` ;
- `workPeopleFixture` ;
- `workSourcesFixture` ;
- `workDecisionsFixture` ;
- `workDeliverablesFixture` ;
- `globalRouteFixtures`.

Le Work Setup utilise également `WorkSetupProvider` et son état React local.

### 5.2 Recherche réseau

La recherche exhaustive dans `apps/nova-web/src` ne trouve aucun :

- `fetch(` ;
- Axios ;
- `XMLHttpRequest` ;
- `EventSource` ;
- `WebSocket` ;
- chemin `/api/` ;
- `VITE_*` ou `import.meta.env` servant une API.

Conséquence :

```text
31 unités visuelles
↓
24 UI React locales + 7 UI absentes
↓
0 appel BFF/API
↓
0 Service
↓
0 Runtime
```

## 6. BFF, API, Services et Runtime

### 6.1 BFF existant mais non consommé

Le BFF expose :

- `GET /health` ;
- `GET /readiness` ;
- `GET /version` ;
- `GET /session` ;
- `POST /session/login` ;
- `POST /session/logout` ;
- la route Runtime Execute.

Le serveur BFF déclare cependant son proxy Runtime `configured_not_connected`, et aucun de ces endpoints n'est appelé par le Frontend V7.

### 6.2 NOVA Core existant mais non consommé

NOVA Core expose notamment :

- projets et preflight ;
- création/lecture de missions ;
- assignation ;
- evidence ;
- execute/cancel ;
- technical accept ;
- certification ;
- recovery ;
- monitor, SSE, événements et certificat.

Ces routes ne constituent pas une connexion d'écran tant qu'elles ne sont pas appelées depuis `apps/nova-web`. La route historique `approve` renvoie HTTP 410, ce qui bloque en outre le parcours Decide.

### 6.3 Couverture effective

| Couche | Unités reliées | Écarts |
|---|---:|---:|
| Frontend React correspondant | 24 | 7 |
| Interface React → BFF/API | 0 | 31 |
| BFF/API → Service pour une unité UI | 0 | 31 |
| Service → Runtime pour une unité UI | 0 | 31 |
| Chaîne complète certifiée | 0 | 31 |

Les douze composants techniques activés par SW-006 restent valides dans leur propre périmètre. Ils ne possèdent pas d'Interface React et ne créent donc aucune chaîne supplémentaire parmi les 31 unités.

## 7. Capabilities

Les 31 unités se rattachent aux 14 Capabilities UI du registre :

- Home ;
- quatre Work Setup ;
- sept Work ;
- Decision Flow ;
- Deliverables.

Les 14 sont qualifiées `STUB` dans `NOVA_CAPABILITY_REGISTRY.md` :

> Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé.

Cas transverses :

- Work Shell agrège les Capabilities Work et ne possède pas de Capability autonome ;
- Search Overlay ne possède pas de Capability UI autonome ;
- les drawers héritent de la Capability de leur écran parent.

## 8. Tests

### 8.1 Exécution SW-008

| Contrôle | Résultat |
|---|---|
| `npm.cmd run typecheck` dans `apps/nova-web` | **PASS** |
| `npm.cmd test -- --run` | **PASS — 25 fichiers, 143/143 tests** |

### 8.2 Portée

| Niveau de preuve | Unités | Détail |
|---|---:|---|
| Tests composant/navigation fonctionnels | 24 | Home, Setup, Shell, Work, vues globales et drawers intégrés |
| Tests de route uniquement | 4 | Package, Review, Decide, Receipt |
| Aucun test correspondant | 3 | Search Overlay, Full Analysis Drawer, Full Package Drawer |

La configuration Playwright existe, mais aucun répertoire de tests E2E n'est présent. Les 143 tests passants valident donc l'UI locale et les fixtures, pas une intégration BFF/Runtime.

## 9. Certification

| Source | Décision applicable |
|---|---|
| `PROGRAM_NOVA_UX_CERTIFICATION_REPORT.md` | `UX_PRESENT_BUT_NOT_CONNECTED` |
| `PROGRAM_NOVA_UX_RUNTIME_INTEGRATION_REPORT.md` | `UX_RUNTIME_INTEGRATION_BLOCKED` |
| `NOVA_CAPABILITY_REGISTRY.md` | 14 Capabilities UI `STUB` |
| `NOVA_SW006_RUNTIME_ACTIVATION_REPORT.md` | 12 composants techniques activés, aucune Interface React |

Aucune des 31 unités ne possède une certification end-to-end.

## 10. Écarts priorisés

Cette priorité mesure l'effet bloquant sur la chaîne certifiable ; elle ne constitue pas une proposition d'implémentation.

| Priorité | ID | Écart factuel | Unités affectées |
|---|---|---|---:|
| P0 | `SW008-GAP-001` | Aucun appel réseau dans le Frontend ; aucune Interface UI → BFF/API | 31 |
| P0 | `SW008-GAP-002` | Aucun écran n'atteint un Service ou Runtime | 31 |
| P0 | `SW008-GAP-003` | Decision Package/Review/Decide/Receipt ont des routes mais aucune surface distincte | 4 |
| P0 | `SW008-GAP-004` | Human Approval HTTP indisponible ; `/approve` retourne 410 | 1 parcours, D02.2 |
| P0 | `SW008-GAP-005` | Work Setup Confirm ne produit ni ne transmet le contrat mission requis | 10 unités du parcours Home/Setup |
| P1 | `SW008-GAP-006` | Search Overlay React absent ; lien NavRail non fonctionnel `#search` | 1 |
| P1 | `SW008-GAP-007` | Full Analysis Drawer et Full Package Drawer absents | 2 |
| P1 | `SW008-GAP-008` | BFF Runtime Execute déclaré mais Runtime Gateway non connecté au démarrage | Chaînes d'exécution potentielles |
| P1 | `SW008-GAP-009` | Application React/Vite non servie par l'entrypoint NOVA Core ; le Core sert un tableau HTML distinct | 31 |
| P2 | `SW008-GAP-010` | Aucun test E2E Frontend | 31 |
| P2 | `SW008-GAP-011` | Plusieurs CTA visibles restent sans handler ou persistance | Overview, Activity, People, Sources, Deliverables, Global Deliverables |

## 11. Backlog factuel par tranche

| Tranche | Contenu objectivement non couvert | Statut actuel |
|---|---|---|
| T0 — Contrats transverses | Client Frontend, contrats de vue, authentification/session et façade BFF | ABSENT de la chaîne UI |
| T1 — Création de Work | Home/Clarify/Canvas/Plan/Confirm vers MissionDefinition/mission réelle | UI locale uniquement |
| T2 — Lecture Work | Overview, Plan, Activity, People, Sources, Decisions, Deliverables | Fixtures uniquement |
| T3 — Décision | Package, Review, Decide, Receipt, Human Approval | Composants absents et API Approval retirée |
| T4 — Vues globales | Decisions et Deliverables | UI locale uniquement |
| T5 — Overlays/drawers | Search, Full Analysis, Full Package | Composants absents |
| T6 — Certification | E2E, preuve BFF/Service/Runtime et certification par écran | ABSENT |

## 12. Contrôle de non-modification

La mission a créé uniquement :

- `Docs/24_MODULES/0-UI-DESIGN/NOVA_UI_RUNTIME_TRACEABILITY_MATRIX.md` ;
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_UI_RUNTIME_COVERAGE_REPORT.md`.

Les contrôles TypeScript ont été exécutés avec `--noEmit`. Aucun code, composant React, PNG, Runtime, API, BFF, Capability, règle métier ou document existant n'a été modifié.

## 13. Conclusion finale

La cartographie est exhaustive : **31/31 unités visuelles sont tracées**.

Le niveau réel de la plateforme est :

```text
PNG certifiés : 31/31
Frontend React correspondant : 24/31
BFF/API connecté : 0/31
Runtime connecté : 0/31
Fully implemented : 0/31
```

**Verdict SW-008 : TRACEABILITY COMPLETE — UX PRESENT BUT NOT CONNECTED — RUNTIME INTEGRATION BLOCKED.**

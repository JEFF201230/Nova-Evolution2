# NOVA SW-011 — W01.1 WORK OVERVIEW READ-ONLY

## VERDICT

**NO GO**

Le raccordement W01.1 n'est pas réalisable avec les seuls contrats Core v1 existants tout en
respectant simultanément les contraintes de la mission :

- conserver le rendu visuel de référence ;
- supprimer toute alimentation active par fixture ;
- n'inventer aucun contrat, aucune valeur et aucune règle de projection ;
- ne modifier ni le Core, ni le Runtime, ni le BFF.

La matrice SW-009 qualifie explicitement W01.1 `ENDPOINT_INCOMPLET` et
`VISUEL_UNIQUEMENT`. Le plan SW-009 précise que les projections Overview doivent exister et être
approuvées avant raccordement et qu'elles sont absentes du dépôt audité.

La vérification du code confirme ce blocage :

| Donnée requise par le rendu Work Overview | Donnée Core v1 objectivement disponible | Conclusion |
|---|---|---|
| identifiant et titre | `missionId`, `objective` dans `RuntimeMission` | couverture partielle |
| état de mission | `state`, `canonicalState` dans la vue HTTP | disponible, mais n'alimente pas directement un champ de la vue existante |
| confiance | aucune | absente |
| phase numérique et nombre total de phases | `RuntimeObservabilityEvent.phase` est une phase technique textuelle | contrat non équivalent |
| échéance | aucune | absente |
| insight et recommandation | aucune | absents |
| next best action, durée, impact et variation de confiance | aucune | absents |
| décision en attente | aucune projection de décision | absente |
| progression | `RuntimeObservabilityEvent.progression` | disponible partiellement |
| propriétaire fonctionnel | `assignedAgentId` est un identifiant d'agent Runtime | contrat non équivalent |
| deadline et libellés de phase/mise à jour | `updatedAt` et `timestamp` seulement | couverture insuffisante |
| livrables avec identifiant et confiance | `deliverables: string[]` seulement | contrat non équivalent |
| personnes, disponibilité et présence | aucune | absentes |
| mise à jour NOVA de la vue | messages techniques d'observabilité seulement | contrat non équivalent |

Projeter les champs manquants à partir de valeurs par défaut, de conventions implicites ou de
payloads libres constituerait une invention de contrat. L'étape 1 impose donc un NO GO avant toute
modification de code.

## Fichiers examinés

Documentation et patrimoine visuel :

- `Docs/24_MODULES/0-UI-DESIGN/NOVA_FRONT_RUNTIME_INTEGRATION_PLAN.md` ;
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_FRONT_RUNTIME_CONNECTION_MATRIX.md` ;
- `Docs/24_MODULES/0-UI-DESIGN/NOVA_SW010_W01_3_WORK_ACTIVITY_REPORT.md` ;
- `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/v7/screens/work-overview.png`.

Frontend :

- `apps/nova-web/src/routes/RouteRegistry.ts` ;
- `apps/nova-web/src/routes/routeResolver.ts` ;
- `apps/nova-web/src/routes/routeResolver.test.ts` ;
- `apps/nova-web/src/hooks/useRouteParams.ts` ;
- `apps/nova-web/src/components/routes/WorkSurface.tsx` ;
- `apps/nova-web/src/features/work/WorkOverviewPage.tsx` ;
- `apps/nova-web/src/features/work/WorkOverviewPage.module.css` ;
- `apps/nova-web/src/features/work/workOverviewFixture.ts` ;
- `apps/nova-web/src/features/work/WorkPageHeader.tsx` ;
- `apps/nova-web/src/features/work/WorkOverviewPage.test.tsx` ;
- suite de tests `apps/nova-web/src`.

Core et Runtime :

- `server/nova-core/nova-core.http.ts` ;
- `server/nova-core/nova-core.service.ts` ;
- `server/nova-core/nova-core.http.test.ts` ;
- `server/nova-core/nova-core.service.test.ts` ;
- `server/nova-core/mission-event-publisher.test.ts` ;
- `server/runtime/orchestrator/orchestrator-runtime.types.ts` ;
- `server/runtime/orchestrator/orchestrator-runtime.test.ts`.

## Fichiers modifiés

- `Docs/24_MODULES/0-UI-DESIGN/NOVA_SW011_W01_1_WORK_OVERVIEW_REPORT.md` — création du
  présent rapport uniquement.

Aucun fichier Frontend, BFF, Core, Runtime, route, fixture, test ou PNG n'a été modifié par SW-011.

## Route exacte

- route canonique : `/work/:workId/overview` (`work.overview`) ;
- route de détail existante : `/work/:workId` (`work.detail`), affichée avec l'onglet Overview par
  défaut dans `WorkSurface`.

La navigation et la résolution de route sont confirmées par `RouteRegistry.ts`,
`routeResolver.test.ts` et `WorkOverviewPage.test.tsx`.

## Composant React principal

Le composant principal est :

`apps/nova-web/src/features/work/WorkOverviewPage.tsx` — `WorkOverviewPage`.

La composition actuelle est la suivante :

- `WorkSurface` résout `workId` avec `usePathParams`, l'onglet avec `useWorkTab`, puis injecte
  synchroniquement `getWorkOverviewFixture(workId)` ;
- aucun hook de données Runtime n'existe pour Work Overview ;
- `WorkOverviewPage` consomme la prop `work` de type `WorkOverviewFixture` ;
- `WorkTabs` est le sous-composant interne de navigation et utilise `useNavigation` ;
- le rendu réutilise `PageContainer`, `Surface`, `Badge`, `Button`, `Progress`, `Spinner`,
  `Skeleton` et `EmptyState`.

Le PNG canonique confirme que confiance, phase, échéance, insight, next best action, décision,
progression, propriétaire, livrables et personnes font partie de la structure visuelle à conserver.

## Endpoint(s) réellement utilisés

**Aucun endpoint n'est utilisé par W01.1.**

La validation a examiné les lectures existantes suivantes sans les raccorder :

- `GET /api/v1/missions` ;
- `GET /api/v1/missions/:projectId/:missionId` ;
- `GET /api/v1/missions/:projectId/:missionId/monitor`.

Le premier permet de retrouver une mission. Le détail et le monitoring exposent l'état, le rapport,
les événements, l'observabilité et les runs incomplets, mais pas la projection complète exigée par
Work Overview. SSE est strictement hors périmètre et n'a pas été utilisé.

## Contrat(s) utilisés

Aucun contrat Runtime n'a été consommé par une nouvelle implémentation, puisque le gate de
validation a échoué.

Contrat visuel actuellement actif :

- `WorkOverviewFixture`, défini dans `workOverviewFixture.ts`.

Contrats Core v1 comparés :

- `RuntimeMission` ;
- `MissionReport` ;
- `RuntimeEvent` ;
- `RuntimeObservabilityEvent` ;
- `RuntimeRunRecord`.

`RuntimeMission` fournit notamment `missionId`, `objective`, `state`, `assignedAgentId`,
`deliverables` et `updatedAt`. `MissionReport` fournit des livrables textuels et des informations
techniques. `RuntimeObservabilityEvent` fournit `phase`, `progression`, `timestamp` et `message`.
Aucun de ces contrats ne définit une projection `WorkOverview` ni l'ensemble des champs visuels
requis.

## Service(s) Core atteints

**Aucun service Core n'est atteint par W01.1**, car aucun raccordement n'a été réalisé.

Services existants examinés dans `NovaCoreService` :

- `listMissions` ;
- `getMission` ;
- `getReport` ;
- `getEvents` ;
- `getObservabilityEvents` ;
- `getIncompleteRuns`.

Ils délèguent aux données Runtime existantes, mais ne construisent pas la projection Work Overview.

## Fixtures remplacées

**Aucune.**

`getWorkOverviewFixture(workId)` reste l'unique source active de `work` dans `WorkSurface` pour
Overview. Le fichier `workOverviewFixture.ts` reste inchangé.

La fixture ne pouvait pas être désactivée sans rendre incomplets ou inventer les champs affichés.
Les références de production à `WorkOverviewFixture` sont également partagées par le Work Shell et
les autres écrans Work ; leur modification aurait élargi le périmètre interdit.

## Résultats typecheck

| Contrôle | Commande | Résultat |
|---|---|---|
| Typecheck Frontend | `npm.cmd run typecheck` depuis `apps/nova-web` | **PASS** |

Ce résultat certifie l'état de base inchangé ; il ne constitue pas une preuve de raccordement W01.1.

## Résultats des tests

| Contrôle | Commande | Résultat |
|---|---|---|
| Tests ciblés Work Overview | `npm.cmd test -- --run src/features/work/WorkOverviewPage.test.tsx` | **PASS — 7/7** |
| Suite Frontend complète | `npm.cmd test -- --run` | **PASS — 25 fichiers, 146/146 tests** |
| Core/Runtime lié aux lectures examinées | `node --import tsx --test server/nova-core/nova-core.http.test.ts server/nova-core/nova-core.service.test.ts server/nova-core/mission-event-publisher.test.ts server/runtime/orchestrator/orchestrator-runtime.test.ts` | **PASS — 30/30** |

Aucun smoke live et aucun serveur local n'ont été utilisés.

Les tests Work Overview existants vérifient explicitement l'affichage des fixtures ; leur succès
confirme la stabilité du comportement actuel, pas une alimentation Runtime.

## Preuve d'absence de mutation

- aucune modification de code n'a été appliquée ;
- aucun appel réseau n'a été ajouté au chemin Work Overview ;
- aucune méthode HTTP de mutation n'a été introduite ;
- aucun endpoint Core/BFF n'a été créé ou modifié ;
- aucun service, contrat, schéma ou Runtime n'a été créé ou modifié ;
- SSE n'a pas été utilisé.

## Preuve de non-régression

- typecheck Frontend : PASS ;
- tests ciblés Work Overview : 7/7 PASS ;
- suite Frontend : 146/146 PASS ;
- tests Core/Runtime ciblés : 30/30 PASS ;
- régression imputable à SW-011 : aucune ;
- diff fonctionnel SW-011 : aucun.

Le dépôt était déjà modifié avant SW-011. Ces changements préexistants ont été préservés sans
altération.

## Périmètre explicitement non modifié

- `WorkSurface`, `WorkOverviewPage`, `workOverviewFixture` et tous les autres fichiers Frontend ;
- Work Activity et son raccordement SW-010 ;
- Work Plan, People, Sources, Decisions et Deliverables ;
- Home, Clarify, Canvas, Plan Setup et Confirm ;
- Decision Flow et écrans globaux ;
- routes, navigation, layouts, composants partagés et PNG ;
- BFF, API Core, services Core, Runtime, Rules, Programs, Modules et schémas ;
- contrats et fixtures existants.

La prochaine sous-tranche ne doit pas commencer automatiquement. W01.1 reste bloquée jusqu'à
l'existence vérifiable d'une projection read-only approuvée couvrant le contrat visuel existant,
sans création implicite dans cette mission.

# WORK OVERVIEW GAP CLOSURE 001 — Rapport final

Date d'exécution : 2026-09-21  
Runtime owner : `NOVA_CORE`  
Mode : `LOCAL_SINGLE_MISSION`  
Verdict technique : **SUCCESS**  
Gouvernance : **approbation finale humaine requise** ; ce rapport ne constitue ni une certification ni une approbation du Program Director.

## 1. État initial vérifié

Le parcours HOME lisait déjà les Work autoritatifs du Runtime NOVA Core et transmettait le `workId` réel à `/work/:workId`. En revanche, l'onglet Overview chargeait encore `workOverviewFixture` comme source métier.

Les producteurs Work identity, lifecycle, progress, deliverables, decisions, people, actions, evidence, intelligence, next action et synthesis existaient. Ils ont été réutilisés et non reconstruits. Leur contrat actuel ne permet pas toujours de représenter tous les champs du contrat Overview ; dans ces cas la composition échoue explicitement avec `NOT_READY`, sans inventer de donnée.

Planning disposait de son agrégat, de son autorité, de sa persistance SQLite et de ses queries, mais la projection Work n'exposait pas `phase.current`, `phase.total` et `dueAt`. Confidence et le producteur Intelligence existaient, mais aucune query de production n'établissait l'association déterministe d'un `WORK_RESULT` à `projectId/workId`.

## 2. Causes et fermeture des GAP

### GAP-001 — Work Planning : CLOSED

Cause : `WorkPlanningQuery` transmettait l'état et la provenance Planning, sans projeter les valeurs nécessaires à Overview.

Fermeture : la projection lit exclusivement la révision Planning courante et son `Schedule` qualifié. La phase courante est déterminée depuis les périodes/instants métier du Schedule ; le total provient de la liste des phases Planning ; `dueAt` provient uniquement de la dernière borne de fin explicite d'une période du Schedule ; les dépendances proviennent des dépendances Planning. Un instant isolé qualifié comme début, checkpoint ou cible n'est jamais requalifié en échéance. Si aucune borne de fin métier n'existe, Overview retourne `NOT_READY / WORK_SCHEDULE`. Aucun timestamp Runtime, statut, Progress ou fixture n'est utilisé.

Source autoritative : `PlanningAuthority` → `PlanningSQLiteRepository` → `PlanningQueries` → `WorkPlanningQuery`.

### GAP-002 — Work Confidence : CLOSED

Cause : absence d'une query Work déterministe sur les Confidence courantes de sujet `WORK_RESULT`, et validation historique trop restrictive pour la référence canonique `projectId/workId`.

Fermeture : `WorkConfidenceQuery` recherche l'unique Confidence courante dont le sujet est `WORK_RESULT` et la référence exactement `${projectId}/${workId}`. Elle copie la mesure produite par `INTELLIGENCE_CONFIDENCE_PRODUCER` et échoue fermé en cas d'absence, ambiguïté, provenance invalide ou indisponibilité. L'autorité Confidence accepte ce format uniquement pour `WORK_RESULT` avec exactement deux segments canoniques. Work ne calcule jamais Confidence.

Source autoritative : `IntelligenceConfidenceProducer` → `ConfidenceAuthority` / `FileConfidenceJournal` → `ConfidenceQueries` → `WorkConfidenceQuery`.

### GAP-003 — Work Overview : CLOSED

Cause : aucun Read Model backend complet ne composait les producteurs Work requis.

Fermeture : ajout d'un `WorkOverviewQuery` en lecture seule et d'un contrat partagé strict. La query compose les producteurs existants, renvoie `READY` uniquement lorsque toutes les données présentes sont représentables sans transformation métier inventée, et renvoie `NOT_READY` avec les groupes manquants sinon. Planning, son échéance métier et Confidence sont obligatoires. Les producteurs optionnels absents de manière autoritative donnent les valeurs nulles/listes vides prévues par le contrat ; un producteur indisponible, ambigu ou possédant des données que son contrat actuel ne permet pas de représenter ajoute explicitement le groupe correspondant à `missingGroups`. Une Intelligence qui fournit un Insight sans Recommendation associée retourne notamment `NOT_READY / WORK_INSIGHT` : le texte de l'Insight n'est jamais réutilisé comme Recommendation de remplacement. Le parseur de frontière refuse les champs supplémentaires, exige des pourcentages entiers de 0 à 100 et valide récursivement chaque objet et élément de liste.

Sources utilisées : Work Core, Planning, Confidence, Intelligence, Synthesis, Actions, Deliverables, Decisions et People.

### GAP-004 — Transport BFF : CLOSED

Cause : aucune route BFF dédiée n'exposait le Read Model.

Fermeture : ajout de `GET /api/work/:workId/overview`, authentifiée. Le gateway résout d'abord l'unique Work actif et son `projectId`, puis appelle uniquement `GET /api/v1/missions/:projectId/:workId/overview`. Les réponses Runtime sont validées ; `NOT_READY` reste un `409`. Aucun proxy générique n'a été ajouté.

### GAP-005 — Frontend : CLOSED

Cause : `WorkSurface` alimentait Overview depuis `workOverviewFixture`.

Fermeture : Overview utilise désormais un loader et un hook asynchrones vers la route BFF dédiée, avec cookie de session, validation du contrat et contrôle du `workId`. Les fixtures restent présentes pour les autres écrans historiques et pour les tests, mais ne sont plus une source métier de Work Overview en production.

## 3. Fichiers réellement modifiés pour cette mission

### Contrat et domaines

- `contracts/work-overview.contract.ts`
- `server/domain/confidence/confidence.authority.ts`
- `server/domain/confidence/confidence.queries.ts`
- `server/domain/work/index.ts`
- `server/domain/work/work-confidence.query.ts`
- `server/domain/work/work-confidence.types.ts`
- `server/domain/work/work-planning.query.ts`
- `server/domain/work/work-planning.types.ts`

### NOVA Core et BFF

- `server/nova-core/nova-core.http.ts`
- `server/nova-core/nova-core.server.ts`
- `server/nova-core/nova-core.service.ts`
- `server/nova-core/work-overview.query.ts`
- `server/nova-bff/nova-bff.app.ts`
- `server/nova-bff/nova-bff.server.ts`
- `server/nova-bff/work-overview.gateway.port.ts`
- `server/nova-bff/work-overview.gateway.ts`
- `server/nova-bff/work-overview.route.ts`

### Frontend

- `apps/nova-web/src/components/routes/WorkSurface.tsx`
- `apps/nova-web/src/features/work/WorkOverviewPage.tsx`
- `apps/nova-web/src/features/work/useWorkOverview.ts`
- `apps/nova-web/src/features/work/workOverview.service.ts`

### Tests

- `server/domain/work/work-planning.test.ts`
- `server/domain/work/work-confidence.test.ts`
- `server/nova-core/work-overview.integration.test.ts`
- `server/nova-core/work-overview.test-support.ts`
- `server/nova-bff/nova-bff.boundary.test.ts`
- `server/nova-bff/work-overview.route.test.ts`
- `apps/nova-web/src/features/work/WorkOverviewPage.test.tsx`
- `apps/nova-web/src/features/work/WorkOverviewRealPath.test.tsx`
- `apps/nova-web/src/features/work/workOverview.test-support.ts`
- `apps/nova-web/src/components/shell/NavigationShell.test.tsx`
- `apps/nova-web/src/features/work/WorkActivityPage.test.tsx`
- `apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx`
- `apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx`
- `apps/nova-web/src/features/work/WorkPeoplePage.test.tsx`
- `apps/nova-web/src/features/work/WorkPlanPage.test.tsx`
- `apps/nova-web/src/features/work/WorkSourcesPage.test.tsx`

Le worktree contenait avant cette mission d'autres modifications et fichiers non suivis, notamment le registre de certification, des artefacts `dist`, des scripts Runtime et des rapports. Ils n'ont été ni restaurés, ni supprimés, ni intégrés à cette mission.

## 4. Tests exécutés

| Validation | Résultat |
|---|---:|
| Planning + Confidence ciblés | PASS — 11/11 |
| Work Overview intégration READY + NOT_READY | PASS — 4/4 |
| NOVA Core complet | PASS — 546/546 |
| BFF complet | PASS — 81/81 |
| Frontend complet | PASS — 150/150 |
| TypeScript NOVA Core | PASS |
| Build TypeScript BFF | PASS |
| TypeScript Frontend | PASS |
| Build Frontend | PASS |

Les avertissements React `act(...)` déjà émis par certains tests Frontend ne sont pas des échecs et ne concernent pas Work Overview.

## 5. Preuve fonctionnelle HOME → Active Work → Work Overview

Le test fonctionnel `apps/nova-web/src/features/work/WorkOverviewRealPath.test.tsx` construit un environnement isolé sans réponse métier simulée :

1. il enregistre un vrai Work `NOVA/WORK-OVERVIEW-E2E` dans le Runtime ;
2. il établit son Planning via `PlanningAuthority`, `PlanningCommands` et SQLite, avec une phase et une échéance métier explicites ;
3. il produit une Confidence de 75 via `IntelligenceConfidenceProducer` à partir d'Evidence autoritative, puis l'enregistre via `ConfidenceAuthority` ;
4. il démarre réellement NOVA Core HTTP et le BFF authentifié ;
5. il rend le Frontend sur `/home` et charge HOME par la route BFF réelle ;
6. il clique dans le DOM sur le Work réellement renvoyé ;
7. il vérifie la navigation vers `/work/WORK-OVERVIEW-E2E` ;
8. le Frontend appelle `/api/work/WORK-OVERVIEW-E2E/overview` avec la session authentifiée ;
9. il vérifie dans le DOM le titre Runtime, `confidence = 75`, `phase = 1/1` et `dueAt = 2099-01-01T00:00:00.000Z`.

Le test backend `server/nova-core/work-overview.integration.test.ts` couvre en plus la même chaîne HTTP HOME → BFF → NOVA Core et vérifie le contrat complet, dont `progress = 0`. Il n'existe aucun fallback fixture dans le service ou le hook de production.

Un second scénario intégré, sans Planning ni Confidence, vérifie HTTP 409, `WORK_OVERVIEW_NOT_READY` et la présence de `WORK_PHASE`, `WORK_SCHEDULE` et `WORK_CONFIDENCE` dans `missingGroups`. Un troisième scénario prouve qu'un Planning sans borne de fin métier ne reçoit aucune échéance de remplacement et retourne exactement `NOT_READY / WORK_SCHEDULE`. Un quatrième scénario prouve qu'un Insight sans Recommendation ne reçoit aucune copie de remplacement et retourne exactement `NOT_READY / WORK_INSIGHT`.

Les tests BFF couvrent aussi le rejet d'une réponse Runtime imbriquée mal formée et d'un champ contractuel supplémentaire, empêchant l'acceptation silencieuse d'une donnée non autoritative ou d'un fallback.

## 6. État final

| GAP | État | Preuve principale |
|---|---|---|
| GAP-001 Planning | CLOSED | projection Schedule testée, provenance Planning préservée |
| GAP-002 Confidence | CLOSED | association `WORK_RESULT` déterministe et production Intelligence → Confidence testées |
| GAP-003 Overview | CLOSED | Read Model READY et NOT_READY testés via NOVA Core HTTP |
| GAP-004 BFF | CLOSED | route authentifiée, gateway spécifique et garde-fous de frontière PASS |
| GAP-005 Frontend | CLOSED | chargement BFF et rendu asynchrone PASS, aucune fixture métier Overview en production |

Écarts fonctionnels restant ouverts pour cette mission : **aucun**.

## 7. Verdict

**RESULT = SUCCESS**

Le critère fonctionnel final est démontré avec des données créées par les producteurs autoritatifs et transportées par la chaîne `HOME → BFF → NOVA Core → domaines autoritatifs → Work Overview`. Aucun commit ni push n'a été effectué. L'approbation finale reste une décision humaine conformément aux faits certifiés de la mission.

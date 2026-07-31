# PROGRAM NOVA — UX / RUNTIME INTEGRATION CERTIFICATION

Mission : `PROGRAM-NOVA-UX-RUNTIME-INTEGRATION-001`  
Date d'observation : `2026-07-28`  
Mode : `READ ONLY STRICT`  
Repository : `C:\DEV\NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)\nova-core-mvp`

## 1. Objet et limites

Ce rapport certifie uniquement l'état d'intégration observable entre l'application React/Vite `apps/nova-web` et les interfaces exposées par NOVA Core.

Actions réalisées :

- lecture du code, des modèles, des routes et des documents d'architecture ;
- inventaire des écrans et des contrats ;
- recherche des appels réseau React, des routes HTTP, SSE et WebSocket ;
- comparaison des workflows UX, Runtime, Human Approval, Evidence et Certification ;
- conception documentaire d'une trajectoire d'intégration réversible.

Actions non réalisées :

- aucun build ;
- aucun test ;
- aucune installation ;
- aucune modification de code ou de configuration ;
- aucun commit, push ou déploiement.

## 2. Périmètre observé et empreinte

| Élément | Valeur observée |
|---|---|
| Branche | `feature/nova-core-manager` |
| HEAD | `7db9658902adf0496a8f681afbfbd3f19d21d7cc` |
| Arbre Git du HEAD | `0bd05d858497e84880a28b92bfaf6ed7e0a1560b` |
| État du worktree avant création des présents livrables | 134 entrées `git status --porcelain` |
| État de `apps/nova-web` | propre, 170 fichiers suivis |
| Périmètre de contenu audité | `apps/nova-web`, `server/nova-core`, `server/runtime`, architecture Program 036 et Bible Frontend |
| Fichiers audités dans ce périmètre | 406, dont 315 suivis et 91 non suivis |
| Empreinte du périmètre audité | SHA-256 `0467505579b17869f0b7a79f8373c756db668acec0e5f547291ad049a93576b5` |

L'empreinte de périmètre est le SHA-256 d'un manifeste en mémoire, trié par chemin, composé pour chaque fichier de `chemin relatif normalisé + tabulation + SHA-256 du contenu + LF`. Aucun manifeste n'a été écrit.

Le HEAD seul ne décrit pas tout le code Runtime observé : de nombreux fichiers Program Engine sont non suivis et plusieurs fichiers de `server/nova-core` sont modifiés. La présente décision porte donc sur l'empreinte de contenu ci-dessus, pas uniquement sur le commit.

## 3. Résultat synthétique

L'application React/Vite existe et ses surfaces principales sont implémentées, mais elle n'est raccordée à aucun service :

- aucun `fetch(`, `axios`, `EventSource`, `WebSocket`, chemin `/api/` ou référence à `localhost:4100` n'est présent dans `apps/nova-web/src` ;
- Home, Work, Clarify, Canvas, Plan, Confirm, Decisions, Deliverables et Navigation utilisent des fixtures, du contexte React ou de l'état local ;
- Cockpit, Monitoring, Missions et Certification n'ont pas de surface dédiée ;
- Settings n'apparaît que comme lien `#settings`, sans route ni surface ;
- Evidence apparaît comme notion de données, sans écran dédié.

NOVA Core expose une API HTTP exploitable pour une première intégration en lecture seule :

- santé, projets et preflight Git ;
- liste et détail des missions ;
- événements Runtime ;
- monitoring ponctuel et SSE ;
- consultation des certificats.

Cette API ne constitue cependant pas une façade du point d'entrée Program Engine certifié :

- le serveur compose `NovaCoreService.open(...)` puis `createNovaCoreHttpServer(...)` ;
- hors tests, aucune composition `new ProgramProductionEntrypoint(...)` n'est présente ;
- `ProgramProductionEntrypoint` est désactivé par défaut et n'expose en TypeScript que `execute(...)` et `reconstruct(...)` ;
- aucun contrat HTTP ne transporte `PromptPackage`, `ExecutionSessionId`, les checkpoints durables ou le résultat `CertifiedIntegrationResult`.

## 4. Preuves UX

### 4.1 Routes réellement rendues

`RouteDefinition.ts` déclare :

- routes principales : Home, Work, Decisions, Deliverables ;
- setup : Clarify, Canvas, Plan, Confirm ;
- routes dynamiques Work : detail, overview, plan, activity, people, sources, decisions, deliverables ;
- routes dynamiques Decision : detail, package, pause, receipt.

`RouteSurface.tsx` ne rend que huit surfaces : Home, Work, Decisions, Deliverables, Clarify, Canvas, Plan et Confirm.

Les routes dynamiques Decision ont toutes `surfaceRouteId: "decisions"`. Le routeur résout cette valeur, puis `RouteSurface` rend `DecisionsSurface`. Aucun composant Decision Detail, Package, Pause ou Receipt n'a été trouvé. Ces chemins existent donc dans le routeur, mais ne disposent pas de surface fonctionnelle distincte.

### 4.2 Comportement des écrans

- Home : données de synthèse, suggestions, décision en attente et travaux actifs issus de `homeFixture`.
- Clarify : questions, suggestions et réponses conservées dans l'état React.
- Canvas : objectif, réponses et éléments de canvas issus du même contexte local.
- Plan : phases statiques issues de fixtures.
- Confirm : choix local d'autonomie ; « Create work » navigue vers Work sans créer de mission.
- Work : overview, plan, activity, people, sources, decisions et deliverables proviennent de fixtures.
- Decisions : filtres locaux ; l'ouverture navigue vers `decision.package`, qui réaffiche la surface globale.
- Deliverables : filtres locaux ; aucune action serveur observée pour créer, voir ou télécharger.
- Navigation : liens de shell et profil statique ; utilitaires Search, Notifications, Help et Preferences sous forme de liens locaux.

### 4.3 Contrats UX attendus

Les modèles React attendent notamment :

- Home : résumé, objectif, suggestions, travaux prioritaires, confiance et prochaine action ;
- Work : phase, progression, confiance, échéance, plan, activité, personnes, sources, décisions et livrables ;
- Decisions : recommandation, impact approuvé/rejeté, échéance et confiance ;
- Deliverables : état de préparation, score de publication, blocages, preuves, historique et détails techniques ;
- Work Setup : objectif, réponses de clarification, canvas, plan et niveau d'autonomie.

Ces objets ne correspondent pas directement aux modèles JSON de l'API v1. Une couche de projection ou des contrats de vue versionnés sont nécessaires.

## 5. Preuves Runtime et API

### 5.1 API disponible

Les routes sont détaillées dans `PROGRAM_NOVA_UX_API_MAPPING.md`. Les capacités réutilisables sont :

- lecture des projets et du preflight Git ;
- création, lecture et orchestration d'une mission v1 ;
- lecture des rapports, événements, événements d'observabilité et exécutions incomplètes ;
- streaming SSE `mission` avec reprise des événements déjà stockés et heartbeat ;
- soumission de preuves ;
- exécution, annulation, validation technique, certification et recovery.

Aucun WebSocket n'est présent.

### 5.2 Workflow v1 observé

Le modèle HTTP `RuntimeMission` utilise notamment les états :

`DRAFT`, `READY`, `ASSIGNED`, `LOCKED`, `RUNNING`, `WAITING_INPUT`, `WAITING_DEPENDENCY`, `ESCALATED`, `SUBMITTED`, `TECHNICAL_VALIDATION`, `DOCUMENTARY_VALIDATION`, `HUMAN_VALIDATION`, `NEEDS_REVISION`, `ACCEPTED`, `REJECTED`, `FAILED`, `TIMEOUT`, `CANCELLED`, `CERTIFIED`.

Le chemin observé dans le service est :

1. création : `DRAFT`, puis acceptation en `READY` ;
2. assignation et verrouillage : `ASSIGNED`, puis `LOCKED` ;
3. exécution : `RUNNING`, puis rapport `SUBMITTED` ;
4. validation technique : `TECHNICAL_VALIDATION`, puis `HUMAN_VALIDATION` ;
5. certification : `ACCEPTED`, puis `CERTIFIED`.

Le détail mission fournit mission, rapport, événements, observabilité et runs incomplets. Il constitue le meilleur socle existant pour Work et Monitoring, mais pas un contrat de vue compatible tel quel.

### 5.3 Événements

Les événements Runtime contiennent les identifiants projet, mission et run, la corrélation, la causalité, une séquence, les états source/cible, le producteur, les timestamps, le payload, les métadonnées et les empreintes.

Les événements d'observabilité contiennent notamment :

- `projectId`, `missionId`, `runId`, `correlationId` ;
- phase, progression, durée, message, niveau et diagnostics.

Le SSE diffuse ces événements sous le nom `mission`. Ce contrat couvre une partie importante de Monitoring, Home et Work Activity.

### 5.4 Program Engine certifié non exposé

Le point d'entrée de production observé :

- est une classe interne ;
- est désactivé par défaut ;
- exige repository durable, transport, authentification de production, sécurité workspace, provenance Git et Runtime ;
- compose l'adaptateur Codex, la persistance de session et le service d'intégration certifié ;
- expose `execute(PromptPackage, IntegrationPipelineExecutionOptions)` et `reconstruct(missionId, executionSessionId)`.

L'API v1 n'expose ni ces entrées ni leurs sorties. Elle utilise par ailleurs un autre modèle `RuntimeMission` que le mapper Program Engine. L'intégration directe de React à l'API v1 ne prouve donc pas l'intégration au chemin Program Engine certifié.

## 6. Authentification, autorisation et Human Approval

### 6.1 Contrôles HTTP observés

- `POST .../certify` authentifie et autorise une autorité de certification.
- `POST .../recovery/:action` appelle `requireAuthority`.
- création, assignation, evidence, execute, cancel et technical-accept n'appellent pas ce contrôle dans le routeur HTTP.
- CORS autorise l'origine `*`.

Ces faits interdisent de qualifier les mutations v1 de contrat navigateur prêt pour la production.

### 6.2 Secrets de certification

La certification exige une autorité Bearer et une attestation cryptographique HMAC. Ces secrets ne peuvent pas être placés dans l'application Vite livrée au navigateur. Une médiation serveur authentifiée est donc obligatoire pour déclencher la certification depuis l'UX.

### 6.3 Human Approval

Le dépôt contient un `HumanApprovalWorkflow` interne avec les décisions :

- `APPROVED` ;
- `REJECTED` ;
- `CHANGES_REQUESTED` ;
- `BLOCKED`.

Ce workflow est utilisé par le service d'intégration interne, mais aucune route HTTP correspondante n'est exposée. La route historique `POST .../approve` renvoie systématiquement HTTP 410 avec `APPROVAL_ROUTE_REMOVED`.

L'écran Decisions ne peut donc pas être raccordé à un Human Approval réel avec les contrats actuels.

## 7. Écarts bloquants

| ID | Preuve observée | Impact |
|---|---|---|
| B-01 | Aucune composition du `ProgramProductionEntrypoint` dans le serveur HTTP | impossibilité de raccorder l'UX au chemin Program Engine certifié |
| B-02 | Aucun contrat HTTP pour `PromptPackage`, session durable, checkpoints ou reconstruction | création/exécution/replay certifiés non accessibles à React |
| B-03 | Human Approval interne sans API ; `/approve` renvoie 410 | Decisions, demandes de changement et approbations non intégrables |
| B-04 | Secrets Bearer/HMAC requis pour certifier | certification directe depuis le navigateur interdite |
| B-05 | Mutations v1 majoritairement sans authentification HTTP | exposition navigateur de production non certifiable |
| B-06 | Modèles UX de vue différents du modèle mission/report v1 | adaptation contractuelle obligatoire |
| B-07 | Cockpit, Monitoring, Missions et Certification sans surface ; Settings non routé ; Evidence sans écran | périmètre écran demandé incomplet |
| B-08 | Routes Decision detail/package/pause/receipt sans surfaces distinctes | workflow de décision incomplet |
| B-09 | Aucun appel réseau dans React | aucune intégration actuelle à certifier |
| B-10 | Work Setup local ne produit pas tous les champs obligatoires de `MissionDefinition` | Confirm ne peut pas appeler correctement `POST /missions` |

## 8. Capacités immédiatement réutilisables

Sans conclure à une intégration de production, les contrats suivants peuvent servir de première tranche en lecture seule :

- `GET /health` ;
- `GET /api/v1/projects` ;
- `GET /api/v1/projects/:projectId/preflight` ;
- `GET /api/v1/missions` ;
- `GET /api/v1/missions/:projectId/:missionId` ;
- `GET .../monitor` ;
- `GET .../monitor/stream` ;
- `GET .../events` ;
- `GET .../certificate`.

Leur utilisation doit conserver l'ancienne interface et ne doit pas être présentée comme un raccordement au point d'entrée Program Engine certifié.

## 9. Conclusion

Le dépôt contient les deux côtés nécessaires à une future intégration : une UX React/Vite structurée et des capacités Runtime/Program Engine riches. Il ne contient pas la façade contractuelle, sécurisée et composée qui les relie.

La stratégie et les gates nécessaires sont définis dans `PROGRAM_NOVA_UX_INTEGRATION_ROADMAP.md`. La levée des blocages exige une future mission d'implémentation explicitement autorisée, suivie de certifications par tranche.

## 10. Index des preuves source

| Preuve | Emplacement observé |
|---|---|
| scripts et dépendances React/Vite | `apps/nova-web/package.json:5-37` |
| routes UX et routes dynamiques | `apps/nova-web/src/routes/RouteDefinition.ts:1-38` |
| décisions ramenées à la surface globale | `apps/nova-web/src/routes/RouteRegistry.ts:87-100` |
| huit surfaces réellement rendues | `apps/nova-web/src/components/routes/RouteSurface.tsx:15-31` |
| résolution vers `surfaceRouteId` | `apps/nova-web/src/routes/routeResolver.ts:94-113` |
| routes HTTP | `server/nova-core/nova-core.http.ts:40-278` |
| authentification certify/recovery | `server/nova-core/nova-core.http.ts:224-270` et `392-406` |
| `/approve` retiré | `server/nova-core/nova-core.http.ts:274-275` |
| composition serveur actuelle | `server/nova-core/nova-core.server.ts:68-73` |
| feature flag du point d'entrée, OFF par défaut | `server/nova-core/program-production-entrypoint.ts:54-75` |
| méthodes `execute` et `reconstruct` | `server/nova-core/program-production-entrypoint.ts:133-155` |
| décisions Human Approval internes | `server/nova-core/human-approval-workflow.ts:15-18` et `216-242` |
| second modèle `RuntimeMission` | `server/nova-core/mission-package-runtime-mapper.ts:11` |
| contrats backend déclarés ouverts par l'architecture frontend | `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md:1288-1302` |
| backend/API/auth/persistance déclarés hors couverture frontend | `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md:610` et `654` |

Les absences d'appel réseau, de WebSocket et d'instanciation de `ProgramProductionEntrypoint` résultent de recherches exhaustives dans les périmètres indiqués ; une absence n'a par nature pas de numéro de ligne positif.

UX_RUNTIME_INTEGRATION_BLOCKED

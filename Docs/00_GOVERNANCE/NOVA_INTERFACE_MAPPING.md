# NOVA Interface Mapping

**Statut :** GENERATED_CURRENT  
**Date :** 2026-07-29

## 1. Interfaces

| Surface | Type | Capability | Source | Résolution |
|---|---|---|---|---|
| `/home` | React route | CAP-UI-HOME | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work` | React route | CAP-UI-WORK-OVERVIEW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/decisions` | React route | CAP-UI-DECISION-FLOW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/deliverables` | React route | CAP-UI-DELIVERABLES | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/clarify` | React route | CAP-UI-WORK-SETUP-CLARIFY | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/canvas` | React route | CAP-UI-WORK-SETUP-CANVAS | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/plan` | React route | CAP-UI-WORK-SETUP-PLAN | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/confirm` | React route | CAP-UI-WORK-SETUP-CONFIRM | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId` | React route | CAP-UI-WORK-OVERVIEW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId/overview` | React route | CAP-UI-WORK-OVERVIEW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId/plan` | React route | CAP-UI-WORK-PLAN | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId/activity` | React route | CAP-UI-WORK-ACTIVITY | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId/people` | React route | CAP-UI-WORK-PEOPLE | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId/sources` | React route | CAP-UI-WORK-SOURCES | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId/decisions` | React route | CAP-UI-WORK-DECISIONS | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/work/:workId/deliverables` | React route | CAP-UI-WORK-DELIVERABLES | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/decisions/:decisionId` | React route | CAP-UI-DECISION-FLOW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/decisions/:decisionId/package` | React route | CAP-UI-DECISION-FLOW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/decisions/:decisionId/pause` | React route | CAP-UI-DECISION-FLOW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/decisions/:decisionId/receipt` | React route | CAP-UI-DECISION-FLOW | [apps/nova-web/src/routes/RouteRegistry.ts](../../apps/nova-web/src/routes/RouteRegistry.ts) | MAPPED |
| `/` | NOVA Core dashboard | CAP-CORE-PROJECT-DISCOVERY, CAP-CORE-MISSION-MANAGEMENT, CAP-CORE-MISSION-EXECUTION, CAP-CORE-EVIDENCE-SUBMISSION, CAP-CORE-TECHNICAL-ACCEPTANCE, CAP-CORE-LEGACY-APPROVAL | [server/nova-core/public/index.html](../../server/nova-core/public/index.html) | MAPPED |
| `/lab` | React validation surface | NONE | [apps/nova-web/src/App.tsx](../../apps/nova-web/src/App.tsx) | JUSTIFIED_INTERNAL: playground hors RouteRegistry |
| `/shell` | React validation surface | NONE | [apps/nova-web/src/App.tsx](../../apps/nova-web/src/App.tsx) | JUSTIFIED_INTERNAL: playground hors RouteRegistry |

## 2. APIs et Interfaces consommatrices

| API | Hôte | Capability | Interface consommatrice | Source |
|---|---|---|---|---|
| `GET /health` | BFF | CAP-BFF-OPERATIONAL-PROBES | NONE | [server/nova-bff/nova-bff.app.ts](../../server/nova-bff/nova-bff.app.ts) |
| `GET /readiness` | BFF | CAP-BFF-OPERATIONAL-PROBES | NONE | [server/nova-bff/nova-bff.app.ts](../../server/nova-bff/nova-bff.app.ts) |
| `GET /version` | BFF | CAP-BFF-OPERATIONAL-PROBES | NONE | [server/nova-bff/nova-bff.app.ts](../../server/nova-bff/nova-bff.app.ts) |
| `GET /session` | BFF | CAP-BFF-SESSION-READ | NONE | [server/nova-bff/nova-bff.app.ts](../../server/nova-bff/nova-bff.app.ts) |
| `POST /session/login` | BFF | CAP-BFF-SESSION-LOGIN | NONE | [server/nova-bff/nova-bff.app.ts](../../server/nova-bff/nova-bff.app.ts) |
| `POST /session/logout` | BFF | CAP-BFF-SESSION-LOGOUT | NONE | [server/nova-bff/nova-bff.app.ts](../../server/nova-bff/nova-bff.app.ts) |
| `POST /api/runtime/execute` | BFF | CAP-BFF-RUNTIME-EXECUTE | NONE | [server/nova-bff/nova-bff.app.ts](../../server/nova-bff/nova-bff.app.ts) |
| `GET /health` | NOVA Core | CAP-CORE-HEALTH | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET /api/v1/projects` | NOVA Core | CAP-CORE-PROJECT-DISCOVERY | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET /api/v1/projects/:projectId/preflight` | NOVA Core | CAP-CORE-GIT-PREFLIGHT | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET /api/v1/missions` | NOVA Core | CAP-CORE-MISSION-MANAGEMENT | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST /api/v1/missions` | NOVA Core | CAP-CORE-MISSION-MANAGEMENT | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET /api/v1/missions/:projectId/:missionId` | NOVA Core | CAP-CORE-MISSION-MANAGEMENT | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET …/monitor` | NOVA Core | CAP-CORE-MISSION-MONITORING | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET …/monitor/stream` | NOVA Core | CAP-CORE-MISSION-MONITORING | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET …/events` | NOVA Core | CAP-CORE-MISSION-MONITORING | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `GET …/certificate` | NOVA Core | CAP-CORE-CERTIFICATE-READ | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/assign` | NOVA Core | CAP-CORE-MISSION-ASSIGNMENT | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/evidence` | NOVA Core | CAP-CORE-EVIDENCE-SUBMISSION | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/execute` | NOVA Core | CAP-CORE-MISSION-EXECUTION | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/cancel` | NOVA Core | CAP-CORE-EXECUTION-CANCEL | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/technical-accept` | NOVA Core | CAP-CORE-TECHNICAL-ACCEPTANCE | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/certify` | NOVA Core | CAP-CORE-MISSION-CERTIFICATION | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/recovery/:action` | NOVA Core | CAP-CORE-MISSION-RECOVERY | NONE | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |
| `POST …/approve` | NOVA Core | CAP-CORE-LEGACY-APPROVAL | NOVA Core dashboard | [server/nova-core/nova-core.http.ts](../../server/nova-core/nova-core.http.ts) |

## 3. Résultats

| Mesure | Valeur |
|---|---:|
| Surfaces Interface inventoriées | 23 |
| Interfaces avec Capability | 21 |
| Interfaces sans Capability | 2 |
| Interfaces sans Capability mais justifiées | 2 |
| Interfaces sans Capability ni justification | 0 |
| Opérations API | 25 |
| APIs sans Interface humaine | 17 |

## 4. Ruptures prouvées

1. Les 20 routes React sont alimentées par des fixtures ; aucun `fetch`, `XMLHttpRequest`, `WebSocket` ou `EventSource` n'existe sous `apps/nova-web/src/`.
2. Le BFF expose sept opérations, mais aucune Interface React ne les consomme.
3. `POST /api/runtime/execute` dispose d'un contrat complet ; le démarrage BFF ne fournit pas `NovaBffDependencies.runtimeGateway`.
4. Le dashboard NOVA Core appelle encore `approve` alors que l'API répond 410 et exige `certify`.

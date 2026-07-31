# NOVA Platform Coverage Report

**Mission :** SW-005 Platform Activation  
**Date :** 2026-07-29  
**Verdict :** GO

## 1. Couverture

| Dimension | Couverts | Total | Couverture |
|---|---:|---:|---:|
| Contrat identifié | 49 | 49 | 100,0 % |
| Runtime relié ou absence qualifiée | 49 | 49 | 100,0 % |
| Evidence | 49 | 49 | 100,0 % |
| Tests disponibles | 49 | 49 | 100,0 % |
| Certification disponible | 49 | 49 | 100,0 % |

## 2. Mesures demandées

| Mesure | Valeur |
|---|---:|
| Capabilities totales | 49 |
| Capabilities ACTIVE | 6 |
| Capabilities PARTIAL | 1 |
| Capabilities STUB | 14 |
| Capabilities sans Interface | 29 |
| Interfaces sans Capability | 2 |
| APIs sans Interface | 17 |
| Services sans Runtime | 15 |
| Composants activables immédiatement | 12 |

## 3. Capabilities sans Interface

- CAP-BFF-SECURITY-FOUNDATION — BFF Security Foundation — ACTIVE
- CAP-BFF-SESSION-READ — Session Read Self — IMPLEMENTED
- CAP-BFF-SESSION-LOGIN — Session Login — IMPLEMENTED
- CAP-BFF-SESSION-LOGOUT — Session Logout — IMPLEMENTED
- CAP-BFF-OPERATIONAL-PROBES — BFF Operational Probes — IMPLEMENTED
- CAP-BFF-RUNTIME-EXECUTE — BFF Runtime Execute — PARTIAL
- CAP-CORE-HEALTH — NOVA Core Health — IMPLEMENTED
- CAP-CORE-GIT-PREFLIGHT — Project Git Preflight — IMPLEMENTED
- CAP-CORE-MISSION-ASSIGNMENT — Mission Assignment and Lock — IMPLEMENTED
- CAP-CORE-EXECUTION-CANCEL — Execution Cancellation — IMPLEMENTED
- CAP-CORE-MISSION-CERTIFICATION — Mission Certification — IMPLEMENTED
- CAP-CORE-MISSION-RECOVERY — Mission Recovery — IMPLEMENTED
- CAP-CORE-MISSION-MONITORING — Mission Monitoring — IMPLEMENTED
- CAP-CORE-CERTIFICATE-READ — Certificate Retrieval — IMPLEMENTED
- CAP-INT-MISSION-CONTROL — Mission Control Capability Readiness — INTERNAL
- CAP-INT-GOVERNANCE-CORE — Governance Core — INTERNAL
- CAP-INT-APPROVAL-WORKFLOW — Approval Workflow — INTERNAL
- CAP-INT-CAMPAIGN-GOVERNANCE — Campaign Governance — INTERNAL
- CAP-INT-DECISION-WORKFLOW — Decision Workflow — INTERNAL
- CAP-INT-MISSION-ORDER-GOVERNANCE — Mission Order Governance — INTERNAL
- CAP-INT-PROGRAM-LIFECYCLE — Program Lifecycle — INTERNAL
- CAP-INT-PORTFOLIO — Portfolio Management — INTERNAL
- CAP-INT-SCHEDULING — Scheduling — INTERNAL
- CAP-INT-RESOURCE-MANAGEMENT — Resource Management — INTERNAL
- CAP-INT-RISK-MANAGEMENT — Risk Management — INTERNAL
- CAP-INT-KPI — KPI Measurement — INTERNAL
- CAP-INT-DASHBOARD — Dashboard Aggregation — INTERNAL
- CAP-INT-FINAL-CERTIFICATION — Final Certification Validation — INTERNAL
- CAP-INT-PARALLEL-ORCHESTRATION — Parallel Orchestration Validation — INTERNAL

## 4. Interfaces sans Capability

- `/lab` — JUSTIFIED_INTERNAL: playground hors RouteRegistry — [apps/nova-web/src/App.tsx](../../apps/nova-web/src/App.tsx)
- `/shell` — JUSTIFIED_INTERNAL: playground hors RouteRegistry — [apps/nova-web/src/App.tsx](../../apps/nova-web/src/App.tsx)

## 5. APIs sans Interface

- `GET /health` (BFF) → CAP-BFF-OPERATIONAL-PROBES
- `GET /readiness` (BFF) → CAP-BFF-OPERATIONAL-PROBES
- `GET /version` (BFF) → CAP-BFF-OPERATIONAL-PROBES
- `GET /session` (BFF) → CAP-BFF-SESSION-READ
- `POST /session/login` (BFF) → CAP-BFF-SESSION-LOGIN
- `POST /session/logout` (BFF) → CAP-BFF-SESSION-LOGOUT
- `POST /api/runtime/execute` (BFF) → CAP-BFF-RUNTIME-EXECUTE
- `GET /health` (NOVA Core) → CAP-CORE-HEALTH
- `GET /api/v1/projects/:projectId/preflight` (NOVA Core) → CAP-CORE-GIT-PREFLIGHT
- `GET …/monitor` (NOVA Core) → CAP-CORE-MISSION-MONITORING
- `GET …/monitor/stream` (NOVA Core) → CAP-CORE-MISSION-MONITORING
- `GET …/events` (NOVA Core) → CAP-CORE-MISSION-MONITORING
- `GET …/certificate` (NOVA Core) → CAP-CORE-CERTIFICATE-READ
- `POST …/assign` (NOVA Core) → CAP-CORE-MISSION-ASSIGNMENT
- `POST …/cancel` (NOVA Core) → CAP-CORE-EXECUTION-CANCEL
- `POST …/certify` (NOVA Core) → CAP-CORE-MISSION-CERTIFICATION
- `POST …/recovery/:action` (NOVA Core) → CAP-CORE-MISSION-RECOVERY

## 6. Services sans Runtime

- CAP-INT-MISSION-CONTROL — Mission Control Capability Readiness — qualification INTERNAL
- CAP-INT-GOVERNANCE-CORE — Governance Core — qualification INTERNAL
- CAP-INT-APPROVAL-WORKFLOW — Approval Workflow — qualification INTERNAL
- CAP-INT-CAMPAIGN-GOVERNANCE — Campaign Governance — qualification INTERNAL
- CAP-INT-DECISION-WORKFLOW — Decision Workflow — qualification INTERNAL
- CAP-INT-MISSION-ORDER-GOVERNANCE — Mission Order Governance — qualification INTERNAL
- CAP-INT-PROGRAM-LIFECYCLE — Program Lifecycle — qualification INTERNAL
- CAP-INT-PORTFOLIO — Portfolio Management — qualification INTERNAL
- CAP-INT-SCHEDULING — Scheduling — qualification INTERNAL
- CAP-INT-RESOURCE-MANAGEMENT — Resource Management — qualification INTERNAL
- CAP-INT-RISK-MANAGEMENT — Risk Management — qualification INTERNAL
- CAP-INT-KPI — KPI Measurement — qualification INTERNAL
- CAP-INT-DASHBOARD — Dashboard Aggregation — qualification INTERNAL
- CAP-INT-FINAL-CERTIFICATION — Final Certification Validation — qualification INTERNAL
- CAP-INT-PARALLEL-ORCHESTRATION — Parallel Orchestration Validation — qualification INTERNAL

## 7. Activables immédiatement

Les entrées suivantes possèdent déjà une API, un Service et un Runtime raccordés. « Activable » signifie consommable par son point d'entrée existant ; aucune Interface nouvelle n'est supposée.

- CAP-BFF-SESSION-READ — Session Read Self — `GET /session`
- CAP-BFF-SESSION-LOGIN — Session Login — `POST /session/login`
- CAP-BFF-SESSION-LOGOUT — Session Logout — `POST /session/logout`
- CAP-BFF-OPERATIONAL-PROBES — BFF Operational Probes — `GET /health`, `GET /readiness`, `GET /version`
- CAP-CORE-HEALTH — NOVA Core Health — `GET /health`
- CAP-CORE-GIT-PREFLIGHT — Project Git Preflight — `GET /api/v1/projects/:projectId/preflight`
- CAP-CORE-MISSION-ASSIGNMENT — Mission Assignment and Lock — `POST /api/v1/missions/:projectId/:missionId/assign`
- CAP-CORE-EXECUTION-CANCEL — Execution Cancellation — `POST /api/v1/missions/:projectId/:missionId/cancel`
- CAP-CORE-MISSION-CERTIFICATION — Mission Certification — `POST /api/v1/missions/:projectId/:missionId/certify`
- CAP-CORE-MISSION-RECOVERY — Mission Recovery — `POST /api/v1/missions/:projectId/:missionId/recovery/:action`
- CAP-CORE-MISSION-MONITORING — Mission Monitoring — `GET /api/v1/missions/:projectId/:missionId/monitor`, `GET /api/v1/missions/:projectId/:missionId/monitor/stream`, `GET /api/v1/missions/:projectId/:missionId/events`
- CAP-CORE-CERTIFICATE-READ — Certificate Retrieval — `GET /api/v1/missions/:projectId/:missionId/certificate`

## 8. Composants bloquants

| Blocage | Capabilities | Preuve |
|---|---|---|
| React sans client réseau | 14 capabilities `CAP-UI-*` | aucun appel réseau sous `apps/nova-web/src/`; fixtures présentes |
| BFF Runtime non injecté | CAP-BFF-RUNTIME-EXECUTE | `startNovaBff` appelle `createNovaBffServer` sans `runtimeGateway` |
| Entrypoint production désactivé par défaut | CAP-BFF-RUNTIME-EXECUTE | `ProgramProductionEntrypointFeatureFlag.enabled` vaut `false` par défaut |
| Approval UI obsolète | CAP-CORE-LEGACY-APPROVAL | dashboard → `approve`; API → 410 |
| Programs sans hôte Runtime | 15 capabilities `CAP-INT-*` | contrats/tests présents, aucun import depuis NOVA Core/BFF et aucune API |

## 9. Limites

- Les tests sont inventoriés, pas exécutés.
- `ACTIVE` décrit un raccordement statique existant, pas un processus observé en fonctionnement.
- Les certifications existantes sont conservées à leur niveau Program/Lot ; elles ne certifient pas les raccordements absents.

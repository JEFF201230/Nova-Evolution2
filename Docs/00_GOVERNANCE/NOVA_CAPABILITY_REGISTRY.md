# NOVA Capability Registry

**Statut :** GENERATED_CURRENT  
**Date :** 2026-07-29  
**Périmètre :** capabilities objectivement identifiées par les contrats, routes, APIs et composants exécutables actuels  
**Verdict SW-005 :** GO

## 1. Règle d'inventaire

Une entrée est créée uniquement lorsqu'une preuve exécutable existe :

1. type ou clé explicitement nommé `Capability` ;
2. route HTTP/BFF exposant une opération fonctionnelle ;
3. route Interface enregistrée dans `RouteRegistry` ;
4. contrat exporté et testé d'un Program exécutable.

Les helpers techniques restent dans le registre Runtime SW-004 et ne sont pas promus artificiellement en capabilities. Le champ `ProgramKnowledgeResolver.capability` est une métadonnée résolue ; il ne crée pas une capability métier.

Le fichier existant [CAPABILITY_REGISTRY.md](../00_PROJECT_KNOWLEDGE_LIBRARY/00_REGISTRY/CAPABILITY_REGISTRY.md) a été contrôlé : il est vide (0 octet) et ne fournit aucune entrée réutilisable. Il reste intact.

## 2. Statuts

| Statut | Sens |
|---|---|
| ACTIVE | chaîne utilisée par une Interface existante, ou capability transverse active dans le démarrage BFF |
| IMPLEMENTED | API/Service/Runtime raccordés, sans Interface humaine consommatrice |
| PARTIAL | éléments présents mais raccordement d'exécution incomplet |
| STUB | Interface/contrat présent, alimenté par fixture ou sans backend |
| MISSING | capability documentée sans implémentation retrouvée |
| INTERNAL | contrat exécutable et testé sans Interface/API/Runtime public |
| DEPRECATED | point d'entrée explicitement retiré ou remplacé |

## 3. Synthèse

| Mesure | Valeur |
|---|---:|
| Capabilities | 49 |
| ACTIVE | 6 |
| IMPLEMENTED | 12 |
| PARTIAL | 1 |
| STUB | 14 |
| MISSING | 0 |
| INTERNAL | 15 |
| DEPRECATED | 1 |

## 4. Registre

| ID | Capability | Domaine | Source d'identification | Contrat | Statut | Qualification factuelle |
|---|---|---|---|---|---|---|
| CAP-UI-HOME | Home | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-SETUP-CLARIFY | Work Setup — Clarify | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-SETUP-CANVAS | Work Setup — Canvas | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-SETUP-PLAN | Work Setup — Plan | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-SETUP-CONFIRM | Work Setup — Confirm | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-OVERVIEW | Work — Overview | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-PLAN | Work — Plan | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-ACTIVITY | Work — Activity | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-PEOPLE | Work — People | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-SOURCES | Work — Sources | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-DECISIONS | Work — Decisions | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-WORK-DELIVERABLES | Work — Deliverables | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-DECISION-FLOW | Decision Flow | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-UI-DELIVERABLES | Deliverables | FRONTEND | RouteDefinition existante | CMP-896C72A1D005:[RouteDefinition](../../apps/nova-web/src/routes/RouteDefinition.ts)<br>CMP-492E2B5328BB:[RouteRegistry](../../apps/nova-web/src/routes/RouteRegistry.ts) | STUB | Surface React et données de fixture présentes ; aucun appel réseau, BFF, Service ou Runtime n'est raccordé. |
| CAP-BFF-SECURITY-FOUNDATION | BFF Security Foundation | BFF | Capability annoncée par GET /version | CMP-D3E1C6F4CC6B:[security-foundation](../../server/nova-bff/nova-bff.app.ts) | ACTIVE | La chaîne middleware est construite par createNovaBffApplication et le script start:bff fournit un point d'entrée. |
| CAP-BFF-SESSION-READ | Session Read Self | IDENTITY | BFF_CAPABILITY_MATRIX.SESSION_READ_SELF | CMP-28C53C29FDFC:[BffCapability](../../server/nova-bff/middleware/rbac.ts) | IMPLEMENTED | API et service raccordés ; aucune Interface React ne consomme la session. |
| CAP-BFF-SESSION-LOGIN | Session Login | IDENTITY | BFF_CAPABILITY_MATRIX.SESSION_LOGIN | CMP-28C53C29FDFC:[BffCapability](../../server/nova-bff/middleware/rbac.ts) | IMPLEMENTED | API, identity provider et session store raccordés ; aucune Interface React de connexion n'existe. |
| CAP-BFF-SESSION-LOGOUT | Session Logout | IDENTITY | BFF_CAPABILITY_MATRIX.SESSION_LOGOUT | CMP-28C53C29FDFC:[BffCapability](../../server/nova-bff/middleware/rbac.ts) | IMPLEMENTED | API et destruction de session raccordées ; aucune Interface React ne consomme la route. |
| CAP-BFF-OPERATIONAL-PROBES | BFF Operational Probes | BFF | Routes explicites BFF | CMP-D3E1C6F4CC6B:[BFF Router](../../server/nova-bff/nova-bff.app.ts) | IMPLEMENTED | Routes opérationnelles raccordées au serveur BFF ; aucune Interface humaine n'est attendue dans le dépôt. |
| CAP-BFF-RUNTIME-EXECUTE | BFF Runtime Execute | EXECUTION | RUNTIME_EXECUTE_PATH et RuntimeGatewayPort | CMP-701706722CC7:[RuntimeExecuteCommand](../../server/nova-bff/runtime-execute.contract.ts)<br>[RuntimeGatewayPort](../../server/nova-bff/runtime-gateway.port.ts) | PARTIAL | Le contrat, la route, les mappers, le gateway et l'entrypoint existent, mais startNovaBff n'injecte aucun runtimeGateway et annonce configured_not_connected ; ProgramProductionEntrypoint est désactivé par défaut. |
| CAP-CORE-HEALTH | NOVA Core Health | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | API et serveur raccordés ; aucune Interface humaine dédiée. |
| CAP-CORE-PROJECT-DISCOVERY | Project Target Discovery | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | ACTIVE | Le dashboard appelle l'API, qui délègue à NovaCoreService. |
| CAP-CORE-GIT-PREFLIGHT | Project Git Preflight | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | API, service et contrôle Git raccordés ; aucune Interface React ou dashboard dédiée. |
| CAP-CORE-MISSION-MANAGEMENT | Mission Management | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | ACTIVE | Le dashboard couvre création, liste et lecture via l'API et l'orchestrateur. |
| CAP-CORE-MISSION-ASSIGNMENT | Mission Assignment and Lock | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | API et Runtime raccordés ; aucune action d'assignation dans les Interfaces actuelles. |
| CAP-CORE-MISSION-EXECUTION | Mission Execution | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | ACTIVE | Le dashboard déclenche l'API, le service, le moteur et le Runtime PowerShell. |
| CAP-CORE-EXECUTION-CANCEL | Execution Cancellation | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | API et moteur raccordés ; aucune Interface actuelle n'expose l'annulation. |
| CAP-CORE-EVIDENCE-SUBMISSION | Evidence Submission | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | ACTIVE | Le dashboard envoie les preuves au service et au Runtime. |
| CAP-CORE-TECHNICAL-ACCEPTANCE | Technical Acceptance | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | ACTIVE | L'action dashboard est raccordée à l'API et au Runtime de validation. |
| CAP-CORE-MISSION-CERTIFICATION | Mission Certification | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | Endpoint authentifié, service et certificat Runtime présents ; aucune Interface compatible avec le contrat d'attestation. |
| CAP-CORE-MISSION-RECOVERY | Mission Recovery | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | API gouvernée, service et journal de recovery raccordés ; aucune Interface actuelle. |
| CAP-CORE-MISSION-MONITORING | Mission Monitoring | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | Snapshot, événements et SSE sont exposés ; aucune Interface actuelle ne les consomme. |
| CAP-CORE-CERTIFICATE-READ | Certificate Retrieval | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | IMPLEMENTED | API et persistance de certificat raccordées ; aucune Interface actuelle. |
| CAP-CORE-LEGACY-APPROVAL | Legacy Mission Approval | NOVA_CORE | Route HTTP NOVA Core explicite | CMP-8FBA926BE5ED:[HTTP contract](../../server/nova-core/nova-core.http.ts) | DEPRECATED | Le dashboard appelle encore approve, mais l'API retourne explicitement 410 APPROVAL_ROUTE_REMOVED et impose l'endpoint certify authentifié. |
| CAP-INT-MISSION-CONTROL | Mission Control Capability Readiness | PROGRAM-005 | Contrat exporté et testé du Program | CMP-357DDADEC8BC:[MissionControlCapability](../../server/os-integration/mission-control-capability.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-GOVERNANCE-CORE | Governance Core | PROGRAM-006 | Contrat exporté et testé du Program | CMP-9DD5524BBD6C:[GovernanceCore](../../server/governance/governance-core.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-APPROVAL-WORKFLOW | Approval Workflow | PROGRAM-006 | Contrat exporté et testé du Program | CMP-70D050082F31:[ApprovalWorkflow](../../server/governance/approval-workflow.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-CAMPAIGN-GOVERNANCE | Campaign Governance | PROGRAM-006 | Contrat exporté et testé du Program | CMP-3F53E51F7AB0:[CampaignGovernance](../../server/governance/campaign-governance.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-DECISION-WORKFLOW | Decision Workflow | PROGRAM-006 | Contrat exporté et testé du Program | CMP-2E6C8D958894:[DecisionWorkflow](../../server/governance/decision-workflow.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-MISSION-ORDER-GOVERNANCE | Mission Order Governance | PROGRAM-006 | Contrat exporté et testé du Program | CMP-510CF050FC7C:[MissionOrderGovernance](../../server/governance/mission-order-governance.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-PROGRAM-LIFECYCLE | Program Lifecycle | PROGRAM-006 | Contrat exporté et testé du Program | CMP-DF56FE7CBA70:[ProgramLifecycle](../../server/governance/program-lifecycle.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-PORTFOLIO | Portfolio Management | PROGRAM-007 | Contrat exporté et testé du Program | CMP-E199D75B5FFD:[verifyPortfolioManagement](../../server/portfolio/portfolio-management.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-SCHEDULING | Scheduling | PROGRAM-008 | Contrat exporté et testé du Program | CMP-FFF957585765:[verifyScheduler](../../server/scheduler/scheduler.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-RESOURCE-MANAGEMENT | Resource Management | PROGRAM-009 | Contrat exporté et testé du Program | CMP-FD003DC5DA8E:[verifyResourceManager](../../server/resource-manager/resource-manager.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-RISK-MANAGEMENT | Risk Management | PROGRAM-010 | Contrat exporté et testé du Program | CMP-CCDEC4BF29DA:[verifyRiskEngine](../../server/risk-engine/risk-engine.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-KPI | KPI Measurement | PROGRAM-011 | Contrat exporté et testé du Program | CMP-43DF8E42A57D:[verifyKpiEngine](../../server/kpi-engine/kpi-engine.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-DASHBOARD | Dashboard Aggregation | PROGRAM-012 | Contrat exporté et testé du Program | CMP-C5DF0F3BCF5E:[verifyDashboard](../../server/dashboard/dashboard.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-FINAL-CERTIFICATION | Final Certification Validation | PROGRAM-013 | Contrat exporté et testé du Program | CMP-6F3FE45ED52F:[verifyFinalCertification](../../server/final-certification/final-certification.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |
| CAP-INT-PARALLEL-ORCHESTRATION | Parallel Orchestration Validation | PROGRAM-014 | Contrat exporté et testé du Program | CMP-61F2DD3F04CA:[runValidationCampaigns / simulateParallelPdsExecution](../../server/parallel-orchestration/parallel-orchestration.ts) | INTERNAL | Contrat exécutable et testé, mais aucun point d'entrée Interface/API ni hôte Runtime n'est présent. |

## 5. Autorité

Ce registre est une vue de raccordement. Il ne remplace aucun contrat, Program, Module, Runtime, Rule, Doctrine, test, preuve ou certification.

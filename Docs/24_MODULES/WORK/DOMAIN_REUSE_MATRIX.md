# DOMAIN-AUDIT-002 — Domain Reuse Matrix

## 1. Légende

Les statuts utilisés appartiennent exclusivement à la classification autorisée.

Réutilisabilité :

- **AS_IS** : réutilisation sans modification du producteur ;
- **ADAPTER** : producteur conservé, mapping ou association nécessaire ;
- **MECHANICS_ONLY** : seule la mécanique technique est réutilisable ;
- **NO_DOMAIN_DATA** : aucune donnée du domaine canonique n'est produite.

## 2. Matrice de réconciliation

| Domaine canonique | Implémentation trouvée | Chemin exact | Module | Responsabilité | Producteur | Consommateur | Statut | Réutilisable | Travail restant | Priorité |
|---|---|---|---|---|---|---|---|---|---|---|
| Work | Work Core Foundation | `server/runtime/work/work-core-foundation.ts`; `work-core.types.ts`; `work-lifecycle.ts` | Runtime Work | Constituer l'agrégat Work depuis Mission et Monitoring | `WorkCoreFoundation`, `WorkLifecycleProducer` | Home Active Work, Work Objective | `ACTIVE_RUNTIME` | AS_IS | Conserver la frontière et les invariants | KEEP |
| Objective | Work Objective | `server/runtime/work/work-objective.model.ts`; `work-objective.service.ts`; `work-objective.query.ts`; `work-objective.types.ts` | Runtime Work | Produire l'objectif Work autoritatif depuis Work Core/Mission | `WorkObjectiveService` | `WorkObjectiveQuery`, futurs consommateurs internes | `ACTIVE_RUNTIME` | AS_IS | Aucun enrichissement sans source | KEEP |
| Planning | Queue et schedulers techniques | `server/runtime/orchestrator/orchestrator-runtime.service.ts`; `server/runtime/os-runtime/runtime-scheduler.ts`; `server/scheduler/scheduler.ts`; `server/parallel-orchestration/parallel-orchestration.ts` | Orchestrator / OS Runtime / Program governance | Ordonner Missions, composants ou simulations PDS | Orchestrator et moteurs de scheduling | Runtime, Dashboard, Resource Manager | `ORCHESTRATOR_ONLY` | MECHANICS_ONLY | Producteur Planning métier et rattachement Work à créer | P3 |
| Actions | Recovery, audit et actions de migration | `server/runtime/orchestrator/orchestrator-runtime.types.ts`; `orchestrator-runtime.service.ts`; `server/nova-core/runtime-migration.ts` | Orchestrator / Core persistence | Exécuter et tracer des actions techniques | Orchestrator, migration | Runtime, audit, recovery | `ORCHESTRATOR_ONLY` | MECHANICS_ONLY | Producteur Work Actions distinct requis | P3 |
| Deliverables | Deliverables de Mission, report et preuves | `server/runtime/orchestrator/orchestrator-runtime.types.ts`; `orchestrator-runtime.service.ts`; `server/nova-core/nova-core.execution.ts`; `nova-core.service.ts` | Runtime / Nova Core | Déclarer, produire, vérifier et persister les sorties de Mission | Mission caller, execution engine, report mapper | Runtime, certification, preuves | `PARTIAL_RUNTIME` | ADAPTER | Identité Deliverable, état autoritatif et association Work | P0 |
| Decisions | Human Approval et règles Governance | `server/nova-core/human-approval-workflow.ts`; `nova-integration-service.ts`; `server/governance/decision-workflow.ts`; `approval-workflow.ts` | Nova Core / Governance | Produire une approbation persistée ; vérifier des décisions Program | `HumanApprovalWorkflow`; Governance Core | ProgramRuntimeOrchestrator, intégration, certification | `PARTIAL_RUNTIME` | ADAPTER | Distinguer décision Work, association et décision principale | P1 |
| People | Identités BFF, identité d'approbation et agents | `server/nova-bff/bff.identity.ts`; `bff.session.ts`; `server/nova-core/human-approval-workflow.ts`; `server/runtime/orchestrator/orchestrator-runtime.types.ts` | BFF / Nova Core / Orchestrator | Authentifier, porter des rôles et sélectionner un agent technique | `LocalIdentityProvider`, `SessionManager`, Agent Registry | BFF, approval, Orchestrator | `READ_ONLY` | ADAPTER | Modèle People, rôles métier, disponibilité et association Work | P2 |
| Confidence | Risk Engine et KPI Engine | `server/risk-engine/risk-engine.ts`; `server/kpi-engine/kpi-engine.ts` | Governance engines | Vérifier la readiness de composants Risk/KPI | `verifyRiskEngine`, `verifyKpiEngine` | Dashboard, Final Certification | `ENGINE_ONLY` | NO_DOMAIN_DATA | Producteur de confiance métier sourcé requis | P4 |
| Intelligence | Résolution de connaissance et autorité | `server/nova-core/program-knowledge-resolver.ts`; `authority-resolver.ts`; `mission-context-builder.ts`; `mission-pipeline.ts`; `nova-orchestration-bridge.ts` | Nova Core knowledge pipeline | Résoudre sources, dépendances, contexte et readiness Mission | Resolvers et `MissionPipeline` | MissionBriefBuilder, préparation Mission | `ENGINE_ONLY` | ADAPTER | Séparer connaissance de résultats Intelligence Work | P2 |
| Synthesis | Mission Brief et Mission Report | `server/nova-core/mission-brief-builder.ts`; `server/runtime/orchestrator/orchestrator-runtime.types.ts`; `server/nova-core/nova-core.execution.ts` | Nova Core / Runtime | Synthétiser la préparation et le résultat d'une Mission | `MissionBriefBuilder`, execution report mapper | Prompt, validation, metrics, certification | `PARTIAL_RUNTIME` | ADAPTER | Définir une synthèse Work courante et sa provenance | P2 |

## 3. Connexions factuelles

| Domaine | Relié à Mission | Relié au Runtime actif | Relié à un moteur distinct | Persistance |
|---|---|---|---|---|
| Work | oui | oui | non | via snapshot des sources Mission |
| Objective | oui via Work | oui, interne | non | dérivé read-only |
| Planning | queue Mission uniquement | technique | oui | queue/snapshot pour l'orchestration |
| Actions | technique | oui | non | événements, audit et snapshot |
| Deliverables | oui | oui | execution engine | report et snapshot |
| Decisions | oui | partiellement | Governance / integration | IntegrationRuntimeRepository |
| People | partiellement | agents techniques | BFF/session | mémoire BFF et snapshot agents |
| Confidence | non | non | Risk/KPI engines | aucune donnée Confidence |
| Intelligence | oui | chemin distinct | knowledge pipeline | résultats en mémoire |
| Synthesis | oui | report actif ; brief distinct | preparation pipeline | report persistant, brief en mémoire |

## 4. Décision de réutilisation

- Réutilisation immédiate : Work, Objective.
- Réutilisation prioritaire avec adaptation : Deliverables.
- Réutilisation secondaire avec adaptation : Decisions, People, Intelligence,
  Synthesis.
- Mécaniques uniquement : Planning, Actions.
- Aucun producteur métier réutilisable : Confidence.

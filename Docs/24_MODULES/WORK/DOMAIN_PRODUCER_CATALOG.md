# DOMAIN-AUDIT-002 — Domain Producer Catalog

## 1. Objet

Ce catalogue distingue les producteurs métier existants des mécanismes
techniques portant un vocabulaire voisin. Il ne crée aucune nouvelle
Capability et ne transforme aucun moteur en source autoritative.

## 2. Catalogue

| ID | Domaine | Producteur exact | Chemin | Données produites | Source consommée | Consommateurs actuels | Autorité réelle | Statut | Réutilisation |
|---|---|---|---|---|---|---|---|---|---|
| DPR-001 | Work | `WorkCoreFoundation` | `server/runtime/work/work-core-foundation.ts` | identité, Mission, lifecycle, progression, timestamps, provenance | `RuntimeMission`, observabilité | Home Active Work, Work Objective | autoritatif pour Work Core | `ACTIVE_RUNTIME` | AS_IS |
| DPR-002 | Work | `WorkLifecycleProducer` | `server/runtime/work/work-lifecycle.ts` | état Work et provenance Work | état Mission explicitement qualifié | Work Core | autoritatif pour le lifecycle Work | `ACTIVE_RUNTIME` | AS_IS |
| DPR-003 | Objective | `WorkObjectiveService` | `server/runtime/work/work-objective.service.ts` | Work Objective minimal | Work Core / Mission objective | `WorkObjectiveQuery` | autoritatif dans les limites WCF-002 | `ACTIVE_RUNTIME` | AS_IS |
| DPR-004 | Planning | `OrchestratorQueue` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | priorité de dispatch, date d'enqueue | Mission READY | `scheduleNext`, snapshot Runtime | autoritatif pour la queue, pas pour Planning | `ORCHESTRATOR_ONLY` | MECHANICS_ONLY |
| DPR-005 | Planning | Runtime Scheduler | `server/runtime/os-runtime/runtime-scheduler.ts` | ordre/readiness de composants | constantes Runtime OS | Runtime Orchestrator | technique uniquement | `ORCHESTRATOR_ONLY` | MECHANICS_ONLY |
| DPR-006 | Planning | Program Scheduler / Parallel Orchestration | `server/scheduler/scheduler.ts`; `server/parallel-orchestration/parallel-orchestration.ts` | readiness Program et simulation PDS | références documentaires / simulations | Resource Manager, Dashboard, certification | domaine Programs, pas Work | `ENGINE_ONLY` | MECHANICS_ONLY |
| DPR-007 | Actions | Orchestrator Recovery/Audit | `server/runtime/orchestrator/orchestrator-runtime.service.ts`; `orchestrator-runtime.types.ts` | commandes recovery et traces d'action | état Run/Mission | Runtime, audit, journal | technique uniquement | `ORCHESTRATOR_ONLY` | MECHANICS_ONLY |
| DPR-008 | Deliverables | Mission definition caller | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | deliverables attendus | entrée Mission | RuntimeContext, execution engine | autoritatif pour la demande Mission | `PARTIAL_RUNTIME` | ADAPTER |
| DPR-009 | Deliverables | Nova Core execution report mapper | `server/nova-core/nova-core.execution.ts` | deliverables produits et `deliverableEvidence` | rapport officiel, fichiers, Git, run | `MissionReport`, certification | autoritatif pour le résultat de Run | `PARTIAL_RUNTIME` | ADAPTER |
| DPR-010 | Deliverables | `OrchestratorRuntimeService.submitReport` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | report accepté et rattachement Mission | `MissionReport` | Runtime, NovaCoreService | autoritatif pour l'acceptation Runtime | `PARTIAL_RUNTIME` | ADAPTER |
| DPR-011 | Decisions | `HumanApprovalWorkflow` | `server/nova-core/human-approval-workflow.ts` | requête, décision, justification, identité, timestamp | evidence bundle, identité locale | ProgramRuntimeOrchestrator, NovaIntegrationService | autoritatif pour l'approbation humaine locale | `PARTIAL_RUNTIME` | ADAPTER |
| DPR-012 | Decisions | Governance Core decision/approval workflows | `server/governance/decision-workflow.ts`; `approval-workflow.ts`; `governance-core.ts` | records GO/STOP/approval de Programs | constantes et références documentaires | Risk, Portfolio, Final Certification | autoritatif pour la vérification Governance uniquement | `RULE_ENGINE` | ADAPTER_LIMITED |
| DPR-013 | People | `LocalIdentityProvider` | `server/nova-bff/bff.identity.ts` | identité utilisateur, display name, rôles, statut | configuration locale | SessionManager, BFF | autoritatif pour l'identité BFF locale | `READ_ONLY` | ADAPTER |
| DPR-014 | People | `SessionManager` | `server/nova-bff/bff.session.ts` | principal de session et activité de session | UserIdentity | BFF middleware/routes | autoritatif pour la session, pas pour People | `READ_ONLY` | ADAPTER |
| DPR-015 | People | Agent Registry interne | `server/runtime/orchestrator/orchestrator-runtime.service.ts`; `orchestrator-runtime.types.ts` | agentId, types de Mission, scopes | configuration agents | assignation Mission | autoritatif pour les agents techniques | `ORCHESTRATOR_ONLY` | ADAPTER_LIMITED |
| DPR-016 | Confidence | Risk/KPI engines | `server/risk-engine/risk-engine.ts`; `server/kpi-engine/kpi-engine.ts` | preuves de readiness booléennes | Governance/Portfolio | Dashboard, certification | aucune autorité Confidence | `ENGINE_ONLY` | NO_DOMAIN_DATA |
| DPR-017 | Intelligence | `ProgramKnowledgeResolver` | `server/nova-core/program-knowledge-resolver.ts` | Program, Capability, Wave, gates, dépendances, statut de résolution | index, CEREBRAU, UX, autorité | MissionContextBuilder, MissionPipeline | autoritatif pour la résolution de métadonnées | `ENGINE_ONLY` | ADAPTER |
| DPR-018 | Intelligence | `MissionPipeline` | `server/nova-core/mission-pipeline.ts` | contexte et brief préparé | résolveurs de connaissance/autorité | NovaOrchestrationBridge | moteur de préparation Mission | `ENGINE_ONLY` | ADAPTER |
| DPR-019 | Synthesis | `MissionBriefBuilder` | `server/nova-core/mission-brief-builder.ts` | MissionPackageBrief immuable | MissionContext | prompt, validation, orchestration | autoritatif pour le brief préparatoire | `ENGINE_ONLY` | ADAPTER |
| DPR-020 | Synthesis | Mission report mapper | `server/nova-core/nova-core.execution.ts` | MissionReport et preuves d'exécution | rapport officiel et Runtime | Runtime, certification | autoritatif pour le résultat de Mission | `PARTIAL_RUNTIME` | ADAPTER |

## 3. Producteurs disponibles par domaine

| Domaine | Producteur métier complet | Producteur partiel | Mécanisme voisin seulement |
|---|---|---|---|
| Work | oui | — | — |
| Objective | oui dans le périmètre WCF-002 | — | — |
| Planning | non | non | queue/schedulers |
| Actions | non | non | recovery/audit |
| Deliverables | non | oui | — |
| Decisions | non pour Work | oui, approbation | règles Governance |
| People | non pour Work | oui, identités | agents/resources |
| Confidence | non | non | Risk/KPI readiness |
| Intelligence | non pour Work | oui, connaissance Mission | pipeline moteur |
| Synthesis | non pour Work | oui, brief/report Mission | prompt |

## 4. Producteurs manquants démontrés

1. Producteur Planning métier lié à Work.
2. Producteur Work Actions.
3. Producteur d'affectations People métier lié à Work.
4. Producteur Confidence avec mesure, faits sources et provenance.
5. Producteur de résultats Intelligence Work.
6. Producteur de synthèse Work courante.

Les producteurs Deliverables et Decisions ne sont pas entièrement manquants :
ils nécessitent une adaptation et une association Work.

## 5. Source à intégrer en premier

Le couple `MissionReport.deliverables` / `deliverableEvidence`, accepté par
`OrchestratorRuntimeService.submitReport`, est le producteur partiel le plus
proche d'un domaine Work réutilisable. Il possède :

- une Mission ;
- un Run ;
- des références de sortie ;
- des preuves ;
- une persistance Runtime ;
- des consommateurs de certification.

Il doit être intégré avant toute recréation d'un domaine Deliverables.


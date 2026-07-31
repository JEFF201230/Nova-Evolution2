# DDEC-000 — Decisions Reconciliation Matrix

## 1. Légende

Chaque implémentation reçoit exactement un statut parmi ceux autorisés par
DDEC-000. La décision indique son traitement futur ; aucun traitement n'est
appliqué par cet audit.

## 2. Matrice

| ID | Implémentation | Chemin | Module | Responsabilité | Produit | Consomme | Statut | Décision | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|---|
| DEC-001 | `HumanApprovalDecision` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | acte d'approbation humain immuable | décision, identité, justification, Mission, Run, empreinte | requête et bundle technique GO | `AUTHORITATIVE` | KEEP | source Work Decisions candidate | P0 |
| DEC-002 | `HumanApprovalWorkflow.decide` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | vérifie autorité, non-auto-approbation et persiste | record `HUMAN_APPROVAL` | identité, request, evidence bundle | `PRODUCER` | KEEP | producteur canonique | P0 |
| DEC-003 | `HumanApprovalWorkflow.history` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | relit l'historique Mission/Run | collection ordonnée de décisions | repository | `READMODEL` | KEEP | base de DDEC-001 | P0 |
| DEC-004 | `IntegrationRuntimeRepository` | `server/nova-core/integration-runtime-repository.ts` | Nova Core Persistence | journal durable append-only et recovery | records persistés | snapshot Runtime | `SERVICE` | KEEP | persistance canonique | P0 |
| DEC-005 | `NovaIntegrationService` | `server/nova-core/nova-integration-service.ts` | Nova Integration | orchestre demande, décision et application | résultat d'intégration avec décision | certifier, workflow, orchestrateur | `ORCHESTRATOR` | KEEP | composition conditionnelle | P1 |
| DEC-006 | `HumanApprovalWorkflow.applyDecision` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | traduit la décision vers une transition | cible Runtime | décision persistée, session | `WORKFLOW` | KEEP | consommateur métier | P1 |
| DEC-007 | `ProgramRuntimeOrchestrator` | `server/nova-core/program-runtime-orchestrator.ts` | Program Runtime | vérifie décision/transition et journalise | état et événements | `approvalDecision` | `ORCHESTRATOR` | KEEP | effet Runtime dérivé | P1 |
| DEC-008 | `ProgramRuntimeSession.events.approvalDecision` | `server/nova-core/program-runtime-orchestrator.ts` | Program Runtime | copie événementielle de l'issue humaine | trace de transition | décision humaine | `PROJECTION` | KEEP | preuve secondaire, non source | P2 |
| DEC-009 | `MissionEvidenceCertifier` | `server/nova-core/mission-evidence-certifier.ts` | Nova Core Certification | calcule un gate technique GO/NO_GO/BLOCKED | certification technique | preuves et validation | `RULE_ENGINE` | KEEP | prérequis distinct | P1 |
| DEC-010 | `CertifiedIntegrationService` | `server/nova-core/certified-integration-service.ts` | Production Integration | exécute et certifie un run technique | bundle et certification GO | Runtime, preuves, repository | `SERVICE` | KEEP | pas une décision Work | P2 |
| DEC-011 | `RuntimeMissionCertificate` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Orchestrator Runtime | atteste un report de Mission | certificat signé `CERTIFIED` | binding report/run et autorité | `AGGREGATE` | KEEP | certification distincte | P1 |
| DEC-012 | `NovaCoreService.certifyMission` | `server/nova-core/nova-core.service.ts` | Nova Core | vérifie et émet le certificat | certificat Mission | report, artefacts, autorité | `SERVICE` | KEEP | acte de certification, non Work Decision | P1 |
| DEC-013 | `OrchestratorRuntimeService.certifyMission` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Orchestrator Runtime | attache certificat et transitionne | état CERTIFIED et événements | certificat | `CONSUMER` | KEEP | effet Runtime certifié | P1 |
| DEC-014 | `GovernanceDecisionRecord` | `server/governance/decision-workflow.ts` | Program Governance | modèle GO/REWORK/STOP/ESCALATE par sujet | record Governance | références documentaires | `SECONDARY` | KEEP | autre frontière métier | P2 |
| DEC-015 | `verifyGovernanceDecisionWorkflow` | `server/governance/decision-workflow.ts` | Program Governance | valide couverture et calcule readiness | evidence et booléen ready | records Governance | `RULE_ENGINE` | KEEP | ne pas intégrer à Work | P2 |
| DEC-016 | `GovernanceApprovalRecord` | `server/governance/approval-workflow.ts` | Program Governance | modèle d'approbation Program | record d'approbation | autorité et référence de preuve | `SECONDARY` | KEEP | autre frontière métier | P2 |
| DEC-017 | `verifyGovernanceApprovalWorkflow` | `server/governance/approval-workflow.ts` | Program Governance | vérifie autorité et couverture | evidence et booléen ready | records d'approbation | `RULE_ENGINE` | KEEP | ne pas intégrer à Work | P2 |
| DEC-018 | composition Governance | `server/governance/governance-core.ts` | Program Governance | construit les records de vérification Program | décisions/approbations déterministes | références Program | `WORKFLOW` | KEEP | gouvernance uniquement | P3 |
| DEC-019 | `AuthorityResolutionDecision` | `server/nova-core/authority-resolver.ts` | Nova Core Knowledge | résout automatiquement l'autorité | décision de résolution | sources de connaissance | `RULE_ENGINE` | KEEP | calcul technique | P3 |
| DEC-020 | `RuntimeExecutionGateDecision` | `server/nova-core/runtime-execution-gate.ts` | Nova Core Runtime Gate | autorise ou bloque l'exécution | résultat de gate et blockers | validation, autorité, contexte | `RULE_ENGINE` | KEEP | calcul technique | P2 |
| DEC-021 | kernel decision flow | `server/runtime/kernel/kernel-decision-flow.ts` | Runtime Kernel | valide un flux accepté interne | evidence de flow | mission intake | `WORKFLOW` | KEEP | primitive technique isolée | P3 |
| DEC-022 | kernel decision/reporting composition | `server/runtime/kernel/kernel-decision-reporting-composition.ts`; `kernel-decision-reporting-integration.ts` | Runtime Kernel | compose et vérifie décision/reporting | evidence de composition | kernel decision et report | `SECONDARY` | KEEP | pas de source Work | P3 |
| DEC-023 | `workDecisionsFixtures` | `apps/nova-web/src/features/work/workDecisionsFixture.ts` | Frontend Work | fournit une décision fictive enrichie | données UX | constantes locales | `DUPLICATE` | REMOVE | fausse source métier | P0 après raccordement |
| DEC-024 | `WorkDecisionsPage` | `apps/nova-web/src/features/work/WorkDecisionsPage.tsx` | Frontend Work | affiche les décisions Work | projection UX | fixture Work | `PROJECTION` | REFACTOR | futur consommateur | P1 |
| DEC-025 | `globalDecisionsFixture` | `apps/nova-web/src/components/routes/globalRouteFixtures.ts` | Frontend Global | duplique et enrichit des décisions fictives | liste globale | fixture Work et constantes | `DUPLICATE` | REMOVE | fausse agrégation | P1 après raccordement |
| DEC-026 | `DecisionsSurface` | `apps/nova-web/src/components/routes/DecisionsSurface.tsx` | Frontend Global | filtre et affiche la liste globale | projection UX | fixture globale | `PROJECTION` | REFACTOR | futur consommateur | P2 |
| DEC-027 | `homeFixture.pendingDecision` | `apps/nova-web/src/features/home/homeFixture.ts` | Frontend Home | alimente la carte décision HOME | décision fictive | constantes locales | `DUPLICATE` | REMOVE | fausse source métier | P1 après raccordement |
| DEC-028 | `PendingDecisionCard` | `apps/nova-web/src/features/home/PendingDecisionCard.tsx` | Frontend Home | affiche une décision en attente | projection UX | fixture HOME | `PROJECTION` | REFACTOR | futur consommateur | P2 |
| DEC-029 | décision de `workOverviewFixture` | `apps/nova-web/src/features/work/workOverviewFixture.ts` | Frontend Work | fournit une décision à Overview | donnée composite fictive | constantes locales | `DUPLICATE` | REMOVE | duplication de donnée | P2 après raccordement |
| DEC-030 | `WorkOverviewPage` | `apps/nova-web/src/features/work/WorkOverviewPage.tsx` | Frontend Work | affiche la décision dans Overview | projection UX | fixture Overview | `PROJECTION` | REFACTOR | futur consommateur | P2 |
| DEC-031 | routes décisionnelles | `apps/nova-web/src/routes/RouteRegistry.ts` | Frontend Navigation | déclare accès Work/Global/package | navigation | identifiants de route | `CONSUMER` | KEEP | point d'entrée sans donnée | P2 |

## 3. Totaux par statut

| Statut | Nombre |
|---|---:|
| `AUTHORITATIVE` | 1 |
| `PRODUCER` | 1 |
| `CONSUMER` | 2 |
| `WORKFLOW` | 3 |
| `RULE_ENGINE` | 5 |
| `ORCHESTRATOR` | 2 |
| `AGGREGATE` | 1 |
| `SERVICE` | 3 |
| `PROJECTION` | 5 |
| `READMODEL` | 1 |
| `SECONDARY` | 3 |
| `OBSOLETE` | 0 |
| `DUPLICATE` | 4 |
| `UNKNOWN` | 0 |
| **Total** | **31** |

## 4. Totaux par décision

| Décision | Nombre |
|---|---:|
| KEEP | 23 |
| REFACTOR | 4 |
| REMOVE | 4 |
| MERGE | 0 |
| **Total** | **31** |

MERGE est nul : les mécanismes Governance, certification et Human Approval
ont des sémantiques différentes et ne doivent pas être fusionnés.

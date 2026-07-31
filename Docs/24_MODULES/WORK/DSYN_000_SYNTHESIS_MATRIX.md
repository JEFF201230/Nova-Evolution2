# DSYN-000 — Synthesis Reconciliation Matrix

Verdict : **NO GO**  
Règle : chaque ligne reçoit exactement une classification autorisée.

| ID | Implémentation | Chemin exact | Module | Produit | Consomme | Statut | Décision | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| SYN-001 | `MissionBriefBuilder` | `server/nova-core/mission-brief-builder.ts` | Mission Preparation | `MissionPackageBrief` | `MissionContext` | SERVICE | KEEP | préparation uniquement | P1 |
| SYN-002 | `MissionBrief` / `MissionPackageBrief` | `server/nova-core/mission-brief-builder.ts` | Mission Preparation | paquet immuable de préparation | builder de brief | AGGREGATE | KEEP | pas d'état Work courant | P1 |
| SYN-003 | `MissionBriefAuthoritySummary` | `server/nova-core/mission-brief-builder.ts` | Mission Preparation | résumé des sources d'autorité | `MissionContext.authorityDecision` | PROJECTION | KEEP | résumé documentaire | P2 |
| SYN-004 | `MissionBriefUxSummary` | `server/nova-core/mission-brief-builder.ts` | Mission Preparation | résumé des sources UX | connaissances requises | PROJECTION | KEEP | résumé UX | P2 |
| SYN-005 | `MissionPipeline` | `server/nova-core/mission-pipeline.ts` | Mission Preparation | brief préparé | adapters, resolvers, builders | WORKFLOW | KEEP | workflow pré-exécution | P1 |
| SYN-006 | `NovaOrchestrationBridge` | `server/nova-core/nova-orchestration-bridge.ts` | Nova Orchestration | préparation validée | `MissionPipeline` | WORKFLOW | KEEP | pont vers exécution | P1 |
| SYN-007 | `PromptAssembler` | `server/nova-core/prompt-assembler.ts` | Prompt | prompt structuré | `MissionBrief` | CONSUMER | KEEP | consommateur du brief | P2 |
| SYN-008 | `RuntimeExecutionRequestBuilder` | `server/nova-core/runtime-execution-request.ts` | Runtime Request | requête d'exécution | préparation et brief | CONSUMER | KEEP | consommateur du brief | P2 |
| SYN-009 | `RuntimeExecutionGate` | `server/nova-core/runtime-execution-gate.ts` | Runtime Gate | décision d'exécution | préparation et brief | CONSUMER | KEEP | gate, pas synthèse | P2 |
| SYN-010 | `CodexRequestBuilder` | `server/nova-core/codex-request-builder.ts` | Codex Adapter | requête Codex | contrat et brief | CONSUMER | KEEP | consommateur du brief | P2 |
| SYN-011 | `NovaCoreOfficialReport` | `server/nova-core/nova-core.execution.ts` | Nova Core Execution | rapport brut Codex/Git/validations | exécution Codex | SECONDARY | KEEP | entrée technique | P1 |
| SYN-012 | `mapOfficialReportToMissionReport` | `server/nova-core/nova-core.execution.ts` | Nova Core Execution | `MissionReport` | rapport officiel et Mission | PRODUCER | KEEP | producteur de résultat technique | P1 |
| SYN-013 | `MissionReport` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Runtime Orchestrator | résultat accepté d'une Mission | mapper/handler d'exécution | AGGREGATE | KEEP | source de rapport, pas Synthesis | P1 |
| SYN-014 | `OrchestratorRuntimeService.submitReport` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Runtime Orchestrator | rapport accepté et rattaché | `MissionReport` | SERVICE | KEEP | acceptation autoritative du rapport | P1 |
| SYN-015 | `RuntimeSnapshot.reports` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Runtime Persistence | collection persistée de rapports | stores Runtime | READMODEL | KEEP | persistance de rapports | P1 |
| SYN-016 | `OrchestratorRuntimeService.getReport` / `NovaCoreService.getReport` | `server/runtime/orchestrator/orchestrator-runtime.service.ts`; `server/nova-core/nova-core.service.ts` | Runtime/Core | rapport courant de Mission | `mission.reportId` | SERVICE | KEEP | lecture déterministe de rapport | P1 |
| SYN-017 | route GET détail Mission | `server/nova-core/nova-core.http.ts` | Nova Core HTTP | mission, report, events, observabilité | `NovaCoreService` | PROJECTION | KEEP | projection brute | P2 |
| SYN-018 | cockpit `renderReport` | `server/nova-core/public/index.html` | Cockpit legacy | listes report/checks/blockers/errors | réponse HTTP Mission | PROJECTION | KEEP | vue legacy, pas source | P3 |
| SYN-019 | `RuntimeResultNormalizer` | `server/nova-core/runtime-result-normalizer.ts` | Runtime Integration | résultat Runtime normalisé | réponse adaptée | SERVICE | KEEP | normalisation de transport | P2 |
| SYN-020 | `NormalizedRuntimeResult` | `server/nova-core/runtime-result-normalizer.ts` | Runtime Integration | statut, result unknown, erreur, metadata | normalizer | READMODEL | KEEP | pas de sémantique Synthesis | P2 |
| SYN-021 | `NovaIntegrationResult` | `server/nova-core/nova-integration-service.ts` | Nova Integration | agrégat session/résultat/log/métriques/evidence | services d'intégration | AGGREGATE | KEEP | résultat composite en mémoire | P2 |
| SYN-022 | `MissionTimelineModel` | `server/nova-core/mission-timeline.ts` | Observability | événements ordonnés | événements Mission | READMODEL | KEEP | timeline, pas synthèse | P2 |
| SYN-023 | `MissionLogModel` | `server/nova-core/mission-log.ts` | Observability | journal de Mission | timeline | READMODEL | KEEP | log, pas synthèse | P2 |
| SYN-024 | `IntegrationPersistedRecord(kind="LOG")` | `server/nova-core/integration-runtime-repository.ts`; `server/nova-core/nova-integration-service.ts` | Integration Persistence | log persisté | `MissionLogModel` | READMODEL | KEEP | persistance d'observabilité | P2 |
| SYN-025 | `MissionMetricsModel` | `server/nova-core/mission-metrics.ts` | Observability | comptages, durée, progression | timeline et progression | PROJECTION | KEEP | métriques calculées | P2 |
| SYN-026 | `MissionEvidenceBundle` | `server/nova-core/mission-evidence-certifier.ts` | Evidence/Certification | preuves et décision technique | résultats d'exécution | AGGREGATE | KEEP | preuve, pas conclusion Work | P2 |
| SYN-027 | `KernelReportingFlowReport` | `server/runtime/kernel/kernel-reporting-flow.ts` | Runtime Kernel | readiness interne du reporting | résultat Decision Flow | SECONDARY | KEEP | aucun consommateur Work | P3 |
| SYN-028 | `PersistedExecutionOutcome` | `server/nova-core/execution-session-persistence.ts` | Execution Persistence | statut SUCCESS/FAILURE d'une session | session d'exécution | SECONDARY | KEEP | outcome technique seulement | P3 |
| SYN-029 | `workOverviewFixtures` | `apps/nova-web/src/features/work/workOverviewFixture.ts` | Frontend Work | insight et références de synthèse | constantes locales | DUPLICATE | REMOVE | non autoritatif | P1 |
| SYN-030 | `WorkOverviewPage` | `apps/nova-web/src/features/work/WorkOverviewPage.tsx` | Frontend Work | vue insight/synthèse | `WorkOverviewFixture` | PROJECTION | REFACTOR | futur consommateur | P2 |
| SYN-031 | `workDeliverablesFixtures.detail.summary` | `apps/nova-web/src/features/work/workDeliverablesFixture.ts` | Frontend Work | résumé de livrable | constantes locales | SECONDARY | REMOVE | enrichissement fictif | P1 |
| SYN-032 | `WorkDeliverablesPage` | `apps/nova-web/src/features/work/WorkDeliverablesPage.tsx` | Frontend Work | vue résumé de livrable | fixture Deliverables | PROJECTION | REFACTOR | futur consommateur | P2 |
| SYN-033 | `workPeopleFixtures.details.summary` | `apps/nova-web/src/features/work/workPeopleFixture.ts` | Frontend Work | résumé People | constantes locales | SECONDARY | REMOVE | enrichissement fictif | P1 |
| SYN-034 | `WorkPeoplePage` | `apps/nova-web/src/features/work/WorkPeoplePage.tsx` | Frontend Work | vue résumé People | fixture People | PROJECTION | REFACTOR | futur consommateur | P2 |
| SYN-035 | `workSourcesFixtures` | `apps/nova-web/src/features/work/workSourcesFixture.ts` | Frontend Work | compteurs, insight et résumé | constantes locales | DUPLICATE | REMOVE | texte répété localement | P1 |
| SYN-036 | `WorkSourcesPage` | `apps/nova-web/src/features/work/WorkSourcesPage.tsx` | Frontend Work | vue résumé Sources | fixture Sources | PROJECTION | REFACTOR | futur consommateur | P2 |
| SYN-037 | `homeFixture` summaries | `apps/nova-web/src/features/home/homeFixture.ts` | Frontend Home | header, priorité et activité résumés | constantes locales | DUPLICATE | REMOVE | recoupe Overview | P1 |
| SYN-038 | `HomeHeader` | `apps/nova-web/src/features/home/HomeHeader.tsx` | Frontend Home | résumé de session/home | `homeFixture` | PROJECTION | REFACTOR | vue uniquement | P3 |
| SYN-039 | `PriorityInsight` / `NextBestAction` | `apps/nova-web/src/features/home/PriorityInsight.tsx`; `apps/nova-web/src/features/home/NextBestAction.tsx` | Frontend Home | résumé prioritaire | `homeFixture` | PROJECTION | REFACTOR | futur consommateur | P2 |
| SYN-040 | `BackgroundWorkSection` | `apps/nova-web/src/features/home/BackgroundWorkSection.tsx` | Frontend Home | résumé de fond | `homeFixture` | PROJECTION | REFACTOR | futur consommateur | P3 |
| SYN-041 | projection Runtime de `WorkActivityPage` | `apps/nova-web/src/features/work/WorkActivityPage.tsx` | Frontend Work | `summary = event.eventName` | événements Runtime | PROJECTION | KEEP | libellé technique explicitement qualifié | P2 |
| SYN-042 | `workActivityFixtures` | `apps/nova-web/src/features/work/workActivityFixture.ts` | Frontend Work | résumés d'activité simulés | constantes locales | SECONDARY | REMOVE | source parallèle non autoritative | P2 |

## Synthèse

| Indicateur | Valeur |
|---|---:|
| Implémentations qualifiées | 42 |
| `AUTHORITATIVE` pour Work Synthesis | 0 |
| Producteurs de rapport | 1 |
| Producteurs Work Synthesis | 0 |
| Consommateurs directs de brief | 4 |
| Services | 4 |
| Workflows | 2 |
| Projections | 13 |
| Read Models | 5 |
| Agrégats voisins | 4 |
| Décisions KEEP | 29 |
| Décisions REFACTOR | 7 |
| Décisions REMOVE | 6 |
| Décisions MERGE | 0 |

`MissionReport` reste autoritatif dans le domaine Reporting/Execution. Il n'est
pas classé `AUTHORITATIVE` ici, car la matrice arbitre la source **Work
Synthesis**, qui est absente.

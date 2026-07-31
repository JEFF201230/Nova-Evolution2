# DINTEL-000 — Intelligence Reconciliation Matrix

Verdict : **NO GO**  
Règle : chaque ligne reçoit exactement une classification autorisée.

| ID | Implémentation | Chemin exact | Module | Produit | Consomme | Statut | Décision | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|
| INT-001 | `CerebrauKnowledgeAdapter` | `server/nova-core/cerebrau-knowledge-adapter.ts` | Nova Core Knowledge | sources, autorités, références Program | index CEREBRAU | SERVICE | KEEP | entrée de connaissance, pas Intelligence | P1 |
| INT-002 | `CerebrauKnowledgeResult` | `server/nova-core/cerebrau-knowledge-adapter.ts` | Nova Core Knowledge | vue normalisée de métadonnées | adapter CEREBRAU | READMODEL | KEEP | contexte Mission | P1 |
| INT-003 | `NovaUxKnowledgeAdapter` | `server/nova-core/nova-ux-knowledge-adapter.ts` | Nova Core Knowledge | domaines, routes, composants, dépendances UX | index NOVA UX | SERVICE | KEEP | entrée UX, pas Intelligence | P1 |
| INT-004 | `NovaUxKnowledgeResult` | `server/nova-core/nova-ux-knowledge-adapter.ts` | Nova Core Knowledge | vue normalisée UX | adapter NOVA UX | READMODEL | KEEP | contexte Mission | P1 |
| INT-005 | `AuthorityResolver` | `server/nova-core/authority-resolver.ts` | Nova Core Authority | classement des sources | résultats CEREBRAU et UX, déclarations | SERVICE | KEEP | autorité documentaire | P1 |
| INT-006 | `AuthorityResolutionDecision` | `server/nova-core/authority-resolver.ts` | Nova Core Authority | sources acceptées/rejetées, conflits | resolver d'autorité | READMODEL | KEEP | décision de source, pas insight | P1 |
| INT-007 | `ProgramKnowledgeResolver` | `server/nova-core/program-knowledge-resolver.ts` | Nova Core Knowledge | résolution Program/lot/wave/gates/dépendances | index et décisions d'autorité | PRODUCER | KEEP | producteur de métadonnées uniquement | P1 |
| INT-008 | `ProgramKnowledgeResolution` | `server/nova-core/program-knowledge-resolver.ts` | Nova Core Knowledge | état de résolution Program | `ProgramKnowledgeResolver` | READMODEL | KEEP | entrée potentielle future | P1 |
| INT-009 | `UxKnowledgeResolver` | `server/nova-core/ux-knowledge-resolver.ts` | Nova Core Knowledge | résolution de sources UX | adapter UX et autorité | PRODUCER | KEEP | connaissance UX uniquement | P1 |
| INT-010 | `UxKnowledgeResolution` | `server/nova-core/ux-knowledge-resolver.ts` | Nova Core Knowledge | écrans, pages, routes, layouts, sources | `UxKnowledgeResolver` | READMODEL | KEEP | entrée de préparation | P1 |
| INT-011 | `MissionContextBuilder` | `server/nova-core/mission-context-builder.ts` | Mission Preparation | contexte Mission | résolutions Program et UX | SERVICE | KEEP | composition sans persistance | P1 |
| INT-012 | `MissionContext` | `server/nova-core/mission-context-builder.ts` | Mission Preparation | contexte immuable | résolutions Knowledge | AGGREGATE | KEEP | agrégat de préparation, pas Work | P1 |
| INT-013 | `MissionBriefBuilder` | `server/nova-core/mission-brief-builder.ts` | Mission Preparation | brief d'exécution | `MissionContext` | SERVICE | KEEP | synthèse préparatoire | P1 |
| INT-014 | `MissionBrief` | `server/nova-core/mission-brief-builder.ts` | Mission Preparation | paquet Mission | builder de brief | AGGREGATE | KEEP | entrée d'exécution, pas Intelligence | P1 |
| INT-015 | `MissionPipeline` | `server/nova-core/mission-pipeline.ts` | Mission Preparation | chaîne adapters → brief | composants Knowledge | WORKFLOW | KEEP | pipeline en mémoire | P1 |
| INT-016 | `NovaOrchestrationBridge` | `server/nova-core/nova-orchestration-bridge.ts` | Nova Orchestration | préparation validée | `MissionPipeline` | WORKFLOW | KEEP | pont d'exécution | P1 |
| INT-017 | `NovaOrchestrationPreparation` / trace | `server/nova-core/nova-orchestration-bridge.ts` | Nova Orchestration | readiness et traçabilité de préparation | `MissionBrief` | PROJECTION | KEEP | projection technique | P1 |
| INT-018 | `PromptAssembler` | `server/nova-core/prompt-assembler.ts` | Prompt | prompt structuré | `MissionBrief.requiredKnowledge` | CONSUMER | KEEP | consomme la connaissance | P2 |
| INT-019 | `RuntimeExecutionRequestBuilder` | `server/nova-core/runtime-execution-request.ts` | Runtime Request | requête d'exécution | `MissionBrief` | CONSUMER | KEEP | consommateur de préparation | P2 |
| INT-020 | `RuntimeExecutionGate` | `server/nova-core/runtime-execution-gate.ts` | Runtime Gate | autorisation/blocage | préparation et brief | CONSUMER | KEEP | gate, pas Intelligence | P2 |
| INT-021 | diagnostic de `NovaCoreExecutionEngine` | `server/nova-core/nova-core.execution.ts` | Nova Core Execution | diagnostics de processus | exécution Codex | PRODUCER | KEEP | autoritatif technique seulement | P1 |
| INT-022 | `RuntimeDiagnostic` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Runtime Orchestrator | phase, sortie, erreur, commande | producteur d'exécution | SECONDARY | KEEP | donnée technique | P1 |
| INT-023 | `MissionReport.diagnostics` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Runtime Orchestrator | diagnostics rattachés à Mission | `RuntimeDiagnostic[]` | PROJECTION | KEEP | persisté avec le rapport | P1 |
| INT-024 | diagnostics d'événement/observabilité | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Runtime Orchestrator | payloads techniques | `MissionReport.diagnostics` et erreurs | PROJECTION | KEEP | observabilité, pas insight | P2 |
| INT-025 | `ProductionReadinessEvaluator` | `server/nova-core/production-readiness-evaluator.ts` | Production Readiness | verdict et raisons | gates techniques | SERVICE | KEEP | évaluation d'intégration | P2 |
| INT-026 | `MissionEvidenceCertifier` | `server/nova-core/mission-evidence-certifier.ts` | Evidence/Certification | bundle et certification | preuves Mission | SERVICE | KEEP | preuve, pas Intelligence | P2 |
| INT-027 | `RiskEngine` | `server/risk-engine/risk-engine.ts` | Risk Engine | readiness de composants | gouvernance et portefeuille | SERVICE | KEEP | contrôle documentaire | P3 |
| INT-028 | `KpiEngine` | `server/kpi-engine/kpi-engine.ts` | KPI Engine | readiness KPI | portefeuille et risque | SERVICE | KEEP | contrôle documentaire | P3 |
| INT-029 | `workOverviewFixtures` | `apps/nova-web/src/features/work/workOverviewFixture.ts` | Frontend Work | insight, recommandation, confiance | constantes locales | SECONDARY | REMOVE | non autoritatif ; retirer après remplacement | P1 |
| INT-030 | `WorkOverviewPage` | `apps/nova-web/src/features/work/WorkOverviewPage.tsx` | Frontend Work | vue insight/action | `WorkOverviewFixture` | PROJECTION | REFACTOR | futur consommateur seulement | P2 |
| INT-031 | `workSourcesFixtures` | `apps/nova-web/src/features/work/workSourcesFixture.ts` | Frontend Work | insight de source | constantes locales | SECONDARY | REMOVE | non autoritatif | P1 |
| INT-032 | `WorkSourcesPage` | `apps/nova-web/src/features/work/WorkSourcesPage.tsx` | Frontend Work | vue des insights de source | `WorkSourcesFixture` | PROJECTION | REFACTOR | futur consommateur seulement | P2 |
| INT-033 | `workPeopleFixtures` | `apps/nova-web/src/features/work/workPeopleFixture.ts` | Frontend Work | reasoning et justification | constantes locales | SECONDARY | REMOVE | non autoritatif | P1 |
| INT-034 | `WorkPeoplePage` | `apps/nova-web/src/features/work/WorkPeoplePage.tsx` | Frontend Work | vue de reasoning | `WorkPeopleFixture` | PROJECTION | REFACTOR | futur consommateur seulement | P2 |
| INT-035 | `workDecisionsFixtures` | `apps/nova-web/src/features/work/workDecisionsFixture.ts` | Frontend Work | recommandation et impacts | constantes locales | DUPLICATE | REMOVE | recoupe décision Overview/Home | P1 |
| INT-036 | `WorkDecisionsPage` | `apps/nova-web/src/features/work/WorkDecisionsPage.tsx` | Frontend Work | vue de recommandation | `WorkDecisionsFixture` | PROJECTION | REFACTOR | futur consommateur seulement | P2 |
| INT-037 | `homeFixture.priorityInsight` | `apps/nova-web/src/features/home/homeFixture.ts` | Frontend Home | suggestion prioritaire | constantes locales | DUPLICATE | REMOVE | duplique Overview, non autoritatif | P1 |
| INT-038 | `PriorityInsight` | `apps/nova-web/src/features/home/PriorityInsight.tsx` | Frontend Home | vue de priorité | `homeFixture` | PROJECTION | REFACTOR | futur consommateur seulement | P2 |
| INT-039 | `BackgroundWorkSection` | `apps/nova-web/src/features/home/BackgroundWorkSection.tsx` | Frontend Home | suggestion de fond | `homeFixture` | PROJECTION | REFACTOR | futur consommateur seulement | P3 |

## Synthèse

| Indicateur | Valeur |
|---|---:|
| Implémentations qualifiées | 39 |
| `AUTHORITATIVE` pour Work Intelligence | 0 |
| Producteurs de connaissance/diagnostic | 3 |
| Workflows de préparation | 2 |
| Read Models voisins | 5 |
| Projections | 9 |
| Sources Frontend non autoritatives | 5 |
| Décisions KEEP | 28 |
| Décisions REFACTOR | 6 |
| Décisions REMOVE | 5 |
| Décisions MERGE | 0 |

La matrice ne désigne aucun `AUTHORITATIVE`, car aucune implémentation ne
répond au périmètre métier Work Intelligence. Les sources autoritatives dans
leurs domaines propres restent classées selon leur rôle concret dans cette
réconciliation.

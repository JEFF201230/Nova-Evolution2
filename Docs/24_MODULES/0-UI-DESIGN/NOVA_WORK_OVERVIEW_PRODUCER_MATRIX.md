# NOVA WORK OVERVIEW — MATRICE DES PRODUCTEURS MÉTIER

## 1. Objet

Cette matrice qualifie chaque producteur nécessaire au
`WorkOverviewReadModel` canonique.

Elle ne définit aucun contrat, endpoint, service ou mécanisme d'implémentation.

## 2. Statuts

Seuls les statuts imposés par SW-013A sont utilisés :

| Statut | Sens appliqué dans cette matrice |
|---|---|
| `EXISTS_EXPOSED` | le producteur sémantiquement compatible existe et sa donnée est lisible par l'API Core actuelle |
| `EXISTS_INTERNAL` | le producteur compatible existe, mais sans exposition Core/BFF |
| `EXISTS_DIFFERENT_DOMAIN` | un composant produit une donnée ressemblante, mais dans un autre domaine et sans équivalence métier |
| `PARTIALLY_AVAILABLE` | une partie seulement du groupe contractuel existe |
| `ABSENT` | aucun producteur sémantiquement compatible n'existe dans le code audité |
| `UNKNOWN` | les preuves ne permettent pas de conclure |

Une donnée `EXISTS_DIFFERENT_DOMAIN` ne peut pas alimenter le Read Model.

## 3. Matrice champ par champ

| # | Donnée Work Overview | Producteur autoritatif attendu | Statut | Fichier et composant exacts trouvés | Domaine réel | Capability existante | Dépendances constatées | Conclusion |
|---:|---|---|---|---|---|---|---|---|
| 1 | `projectId`, `workId`, `title` | Mission / Work Identity | `EXISTS_EXPOSED` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` — `RuntimeMission` ; `server/runtime/orchestrator/orchestrator-runtime.service.ts` — `getMission`, `listMissions` ; `server/nova-core/nova-core.service.ts` — `getMission`, `listMissions` ; `server/nova-core/nova-core.http.ts` — GET liste et détail mission | ORCHESTRATOR / NOVA_CORE | `CAP-CORE-MISSION-MANAGEMENT` | snapshot Runtime, `OrchestratorRuntimeService`, `NovaCoreService` | identité et objectif sont réellement lisibles ; SW-012 autorise `objective` comme titre |
| 2 | `confidence` | Work Intelligence — score Work autoritatif | `ABSENT` | aucun champ ou producteur serveur ; `server/nova-core/mission-progress.ts` produit un pourcentage d'avancement, pas une confiance | WORK_INTELLIGENCE attendu | aucune capability Runtime Work ; `CAP-UI-WORK-OVERVIEW` est `STUB` | producteur de confiance et règle métier non trouvés | aucun `200` conforme ne peut fournir la confiance |
| 3 | `phase.current`, `phase.total` | Work Plan / Work Phase | `EXISTS_DIFFERENT_DOMAIN` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` — `RuntimeObservabilityEvent.phase` ; `server/nova-core/mission-progress.ts` — `MissionProgressModel.completed/total` ; `server/scheduler/scheduler.ts` — vérification de séquence de Programs | OBSERVABILITY / NOVA_CORE_RUNTIME / SCHEDULING | `CAP-CORE-MISSION-MONITORING`, `CAP-INT-SCHEDULING` | événements techniques, timeline interne, portfolio Program | aucune de ces phases ne représente `WorkItem.phaseNum/phaseTotal` |
| 4 | `dueAt` | Work Schedule | `ABSENT` | `server/scheduler/scheduler.ts` et `server/runtime/os-runtime/runtime-scheduler.ts` ordonnent des éléments sans échéance métier ; aucun champ date Work | WORK_SCHEDULE attendu | aucune capability Runtime Work Schedule | aucun agrégat Work daté trouvé | l'échéance ne peut être construite ni composée |
| 5 | `insight.summary`, `insight.recommendation` | Work Intelligence | `ABSENT` | aucun `heroSentence`, `heroGain`, insight ou recommandation dans les 157 fichiers TypeScript serveur de production | WORK_INTELLIGENCE attendu | aucune capability Runtime Work Intelligence | aucune source autoritative trouvée | les messages techniques et Mission Brief ne sont pas une recommandation Work |
| 6 | `nextAction.*` | Work Intelligence / Work Action | `ABSENT` | aucun producteur Next Best Action ; `scheduleNext` choisit une mission Runtime et `next-program-dispatch` vérifie un composant Program, sans action Work | WORK_ACTION attendu | aucune capability Runtime Work Action | aucune source NBA trouvée | durée, impact, confiance avant/après et justification sont tous absents |
| 7 | `deferredActionCount` | Work Action — `laterActions` et `backgroundActions` | `ABSENT` | `RuntimeQueueSnapshot` et les schedulers gèrent l'exécution technique ; aucun `laterActions` ou `backgroundActions` serveur | WORK_ACTION attendu | aucune capability Runtime Work Action | collections sources inexistantes | même le comptage mécanique est impossible sans collections autoritatives |
| 8 | `pendingDecision` | Work Decision — décision métier principale désignée | `EXISTS_DIFFERENT_DOMAIN` | `server/nova-core/human-approval-workflow.ts` — `HumanApprovalWorkflow` ; `server/governance/decision-workflow.ts` — `GovernanceDecisionRecord` ; `server/runtime/kernel/kernel-decision-flow.ts` — décision d'intake ; `RuntimeMissionCertificate` — certification | HUMAN_VALIDATION / EXECUTION_GOVERNANCE / KERNEL / CERTIFICATION | `CAP-INT-APPROVAL-WORKFLOW`, `CAP-INT-DECISION-WORKFLOW`, `CAP-CORE-MISSION-CERTIFICATION` | evidence bundle, repository d'intégration, gouvernance Program, intake Kernel | ces décisions ne possèdent pas la sémantique Work, la confiance, l'échéance, le titre et la conséquence attendus |
| 9 | `progress.percentage` | Mission Progress autoritatif permis par SW-012 | `EXISTS_EXPOSED` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` — `RuntimeObservabilityEvent.progression` ; `server/runtime/orchestrator/orchestrator-runtime.service.ts` — `getObservabilityEvents` ; `server/nova-core/nova-core.http.ts` — GET détail/monitor | OBSERVABILITY / NOVA_CORE | `CAP-CORE-MISSION-MONITORING` | événements Runtime ordonnés par `sequence` | SW-012 autorise la copie du dernier événement, sans extrapolation |
| 10 | `progress.owner` | Work Assignment / People | `EXISTS_DIFFERENT_DOMAIN` | `RuntimeMission.assignedAgentId` via Orchestrator/Core ; `server/resource-manager/resource-manager.ts` vérifie la readiness d'un composant `mission-squad-assignment` sans produire d'affectation | ORCHESTRATOR / RESOURCE_MANAGEMENT | `CAP-CORE-MISSION-ASSIGNMENT`, `CAP-INT-RESOURCE-MANAGEMENT` | agent Runtime technique, preuves Program | l'agent d'exécution n'est pas le propriétaire fonctionnel du Work |
| 11 | `progress.updatedAt` | Mission / Observability clock | `EXISTS_EXPOSED` | `RuntimeMission.updatedAt` et `RuntimeObservabilityEvent.timestamp` ; lectures `getMission` et `getObservabilityEvents` | ORCHESTRATOR / OBSERVABILITY | `CAP-CORE-MISSION-MANAGEMENT`, `CAP-CORE-MISSION-MONITORING` | snapshot mission et événements | le maximum temporel déterministe peut être composé |
| 12 | `deliverables[]` avec `id`, `title`, `confidence` | Work Deliverable | `PARTIALLY_AVAILABLE` | `RuntimeMission.deliverables: string[]`, `MissionReport.deliverables: string[]`, `MissionReport.deliverableEvidence` dans `orchestrator-runtime.types.ts` ; lectures Core mission/rapport | ORCHESTRATOR / EVIDENCE | `CAP-CORE-MISSION-MANAGEMENT`, `CAP-CORE-EVIDENCE-SUBMISSION` | mission, rapport, preuves de fichiers | les titres existent ; les identifiants métier et la confiance Deliverable n'existent pas |
| 13 | `people[]` avec identité, disponibilité, type et statut | Work People | `EXISTS_DIFFERENT_DOMAIN` | `RuntimeAgent` et `RuntimeMission.assignedAgentId` dans l'Orchestrator ; `server/resource-manager/resource-manager.ts` ne contient qu'un catalogue de readiness Program | ORCHESTRATOR / RESOURCE_MANAGEMENT | `CAP-CORE-MISSION-ASSIGNMENT`, `CAP-INT-RESOURCE-MANAGEMENT` | registre d'agents techniques, preuves Program | aucun catalogue People, aucune disponibilité et aucun statut humain/NOVA compatible |
| 14 | `novaUpdate` | Work Intelligence — synthèse NOVA qualifiée | `EXISTS_DIFFERENT_DOMAIN` | `RuntimeObservabilityEvent.message`, `RuntimeEvent.payload`, `server/nova-core/mission-event-publisher.ts` — messages d'événements | OBSERVABILITY / NOVA_CORE_RUNTIME | `CAP-CORE-MISSION-MONITORING` | événements et logs techniques | SW-012 interdit d'interpréter un log libre comme synthèse Work |

## 4. Synthèse des statuts

| Statut | Nombre de groupes | Groupes |
|---|---:|---|
| `EXISTS_EXPOSED` | 3 | identité/titre, progression, dernière mise à jour |
| `EXISTS_INTERNAL` | 0 | aucun producteur Work compatible uniquement interne |
| `EXISTS_DIFFERENT_DOMAIN` | 5 | phase, décision, propriétaire, personnes, mise à jour NOVA |
| `PARTIALLY_AVAILABLE` | 1 | livrables |
| `ABSENT` | 5 | confiance, échéance, insight/recommandation, Next Best Action, actions différées |
| `UNKNOWN` | 0 | aucun |

## 5. Composants internes écartés comme producteurs Work

| Composant | Fichier | Statut réel | Motif d'exclusion |
|---|---|---|---|
| `MissionProgress` | `server/nova-core/mission-progress.ts` | interne, feature flag désactivé par défaut | progression d'une timeline d'exécution, pas phase ou confiance Work |
| `MissionMetrics` | `server/nova-core/mission-metrics.ts` | interne, feature flag désactivé par défaut | métriques d'événements et d'exécution |
| `MissionEventPublisher` | `server/nova-core/mission-event-publisher.ts` | interne | publie les événements fournis ; ne produit pas insight, NBA ou données Work |
| `HumanApprovalWorkflow` | `server/nova-core/human-approval-workflow.ts` | interne | approbation technique après certification, pas décision métier Work |
| `IntegrationRuntimeRepository` | `server/nova-core/integration-runtime-repository.ts` | interne, feature flag désactivé par défaut | kinds limités à `SESSION`, `EVIDENCE`, `CERTIFICATION`, `HUMAN_APPROVAL`, `LOG` |
| `DecisionWorkflow` | `server/governance/decision-workflow.ts` | interne | décisions de gouvernance Program uniquement |
| `Scheduler` | `server/scheduler/scheduler.ts` | interne | vérifie la readiness d'une séquence de Programs |
| `RuntimeScheduler` | `server/runtime/os-runtime/runtime-scheduler.ts` | interne | ordonne des identifiants techniques sans dates Work |
| `ResourceManager` | `server/resource-manager/resource-manager.ts` | interne | vérifie des composants Program ; ne maintient aucun roster People |
| `Dashboard` | `server/dashboard/dashboard.ts` | interne | agrège des résultats de readiness Program, pas un Work |
| `MissionControlCapability` | `server/os-integration/mission-control-capability.ts` | interne | modèle de readiness à six statuts, pas une capability Work métier |

## 6. Conclusion matricielle

Les lectures mission et observabilité couvrent trois groupes et les livrables sont partiels.
Tous les autres groupes sont soit absents, soit produits dans un domaine non équivalent.

La matrice ne révèle aucun producteur Work compatible qui serait seulement caché derrière une
absence d'endpoint. Le blocage n'est donc pas une simple non-exposition.

# WCF-003 — Work Planning Foundation

## VERDICT

**NO GO**

Le dépôt ne contient aucune primitive de planification métier autoritative
rattachée explicitement à un Work. Les candidats trouvés relèvent soit de
l'ordonnancement technique du Runtime et des Missions, soit de la gouvernance
des Programs, soit de l'observabilité, soit de données Frontend fictives.

Conformément à la règle bloquante de WCF-003, aucune fondation Planning n'a été
implémentée.

## AUDITED SOURCES

L'audit a couvert les domaines et mécanismes suivants :

- Work : `server/runtime/work/`
- Missions et orchestration :
  `server/runtime/orchestrator/`,
  `server/runtime/mission-runtime/`,
  `server/nova-core/mission-*.ts` et
  `server/nova-core/program-runtime-orchestrator.ts`
- Monitoring et activité :
  `server/runtime/orchestrator/orchestrator-runtime.types.ts`,
  `server/runtime/orchestrator/orchestrator-runtime.service.ts`,
  `server/nova-core/mission-event-publisher.ts`,
  `server/nova-core/mission-timeline.ts`,
  `server/nova-core/mission-progress.ts` et
  `server/nova-core/mission-metrics.ts`
- Scheduling et orchestration :
  `server/runtime/os-runtime/runtime-scheduler.ts`,
  `server/runtime/os-runtime/runtime-orchestrator.ts`,
  `server/scheduler/scheduler.ts` et
  `server/parallel-orchestration/parallel-orchestration.ts`
- Persistance :
  `server/runtime/journal/append-only-journal.ts`,
  `server/runtime/orchestrator/orchestrator-runtime.service.ts`,
  `server/nova-core/nova-core.store.ts` et
  `server/nova-core/runtime-migration.ts`
- Gouvernance, Decisions, Deliverables et dépendances :
  `server/governance/`, `server/portfolio/`, `server/dashboard/` et les
  définitions Mission/Report du Runtime
- Patrimoine Frontend portant des données de plan :
  `apps/nova-web/src/features/work/workPlanFixture.ts`,
  `apps/nova-web/src/features/work/workOverviewFixture.ts` et
  `apps/nova-web/src/features/work-setup/workSetupFixtures.ts`
- Architecture canonique Work :
  `NOVA_WORK_CAPABILITY_ARCHITECTURE.md`,
  `NOVA_WORK_CAPABILITY_ROADMAP.md` et
  `NOVA_WORK_CAPABILITY_DEPENDENCY_MATRIX.md`

Les recherches ont inclus les noms de fichiers, types, champs et usages des
termes `plan`, `planning`, `schedule`, `scheduled`, `milestone`, `deadline`,
`dueAt`, `dueDate`, `targetAt`, `targetDate`, `startAt`, `startedAt`, `endAt`,
`endedAt`, `sequence`, `dependency`, `prerequisite`, `nextStep`, `phase`,
`timeline` et `calendar`.

## AUTHORITATIVE PLANNING PRODUCERS

**AUCUN**

Aucun producteur ne fournit une échéance métier, un jalon métier, une date
métier de début ou de cible, une étape planifiée, une phase de plan, un
séquencement métier, une dépendance métier ou une prochaine étape autoritative
avec un rattachement démontré à `projectId` et `workId`.

La matrice canonique confirme le même état : `WDEP-005` qualifie le producteur
`Plan Work`, propriété du domaine Planning, comme `MISSING`.

## REJECTED CANDIDATES

| Candidat | Fichier et type exacts | Producteur et moment de production | Source de vérité / persistance | Lien Mission / Work | Classification | Motif du rejet |
|---|---|---|---|---|---|---|
| Queue de Missions | `server/runtime/orchestrator/orchestrator-runtime.types.ts` — `RuntimeQueueItem`; `server/runtime/orchestrator/orchestrator-runtime.service.ts` — `OrchestratorQueue` | `OrchestratorQueue.enqueue` lors de l'acceptation d'une Mission | État Orchestrator ; inclus dans `RuntimeSnapshot.queues` | Mission : oui ; Work : aucun | `AUTHORITATIVE_OTHER_DOMAIN` | `priority` et `enqueuedAt` gouvernent le dispatch technique d'une Mission ; ils ne décrivent ni plan ni étape Work. |
| Sélection de la prochaine Mission | `server/runtime/orchestrator/orchestrator-runtime.service.ts` — `scheduleNext` | `OrchestratorRuntimeService`, au retrait d'une Mission de la queue | Queue Runtime persistable par snapshot | Mission : oui ; Work : aucun | `AUTHORITATIVE_OTHER_DOMAIN` | Ordonnancement d'exécution, sans primitive Planning métier. |
| Scheduler du Runtime OS | `server/runtime/os-runtime/runtime-scheduler.ts` — `RuntimeScheduleItem`, `verifyRuntimeScheduler`; `server/runtime/os-runtime/runtime-orchestrator.ts` — `RUNTIME_CORE_SCHEDULE_ITEMS` | Constante de composition et vérification du démarrage Runtime | Définition statique de readiness ; aucune persistance métier | Mission : non ; Work : non | `AUTHORITATIVE_OTHER_DOMAIN` | L'« order » porte l'ordre de composants internes du Runtime, pas une planification Work. Le scheduler est consommé pour la preuve de composition Runtime. |
| Scheduler de Programs | `server/scheduler/scheduler.ts` — `SchedulerComponent`, `verifyScheduler` | Vérificateur de gouvernance à partir de composants documentaires constants | Références documentaires de Programs ; aucune persistance Work | Mission : non ; Work : non | `AUTHORITATIVE_OTHER_DOMAIN` | Séquence de Programs et readiness documentaire, domaine Portfolio/Programs. |
| Simulation d'orchestration parallèle | `server/parallel-orchestration/parallel-orchestration.ts` — `ProgramDeliverySquadSimulation`, `PdsExecutionRecord` | Simulation de campagnes ; calcul de `wave`, `startTick`, `endTick` et dépendances PDS | Résultat de simulation en mémoire | Mission orders agrégés : oui ; Work : non | `AUTHORITATIVE_OTHER_DOMAIN` | Planification simulée de Programs/PDS ; aucun fait Work réutilisable sans changement de domaine et interprétation. |
| Séquence des événements Mission | `server/runtime/orchestrator/orchestrator-runtime.types.ts` — `RuntimeEvent.sequence`; `server/nova-core/mission-event-publisher.ts` — `MissionEvent.sequence` | Event bus / publisher lors de la publication | Journal et snapshot Runtime | Mission : oui ; Work : seulement comme activité technique consommable | `AUTHORITATIVE_OTHER_DOMAIN` | Ordre chronologique d'événements, explicitement exclu comme séquencement métier. |
| Timeline Mission | `server/nova-core/mission-timeline.ts` — `MissionTimelineModel` | `MissionTimeline.build` depuis les événements déjà produits | Projection en mémoire des événements | Mission : oui ; Work : aucun rattachement Planning | `DERIVED_NON_AUTHORITATIVE` | Chronologie dérivée ; ne produit ni étape planifiée, ni échéance, ni dépendance métier. |
| Phases d'observabilité | `server/runtime/orchestrator/orchestrator-runtime.types.ts` — `MissionObservabilityPhase`; `server/runtime/orchestrator/orchestrator-runtime.service.ts` — `observabilityPhases` | Orchestrator lors de la traduction d'événements techniques | `RuntimeSnapshot.observabilityEvents` | Mission : oui ; Work : progression WCF-001 uniquement | `AUTHORITATIVE_OTHER_DOMAIN` | Phases techniques d'exécution et de validation ; la doctrine Work interdit de les promouvoir en phases Planning. |
| Progression Mission | `server/nova-core/mission-progress.ts` — `MissionProgress`; `server/runtime/work/work-core-foundation.ts` — progression WCF-001 | Calcul depuis le dernier snapshot de progression d'événement | Timeline/Monitoring ; WCF-001 conserve la provenance | Mission : oui ; Work : oui, comme progression | `AUTHORITATIVE_OTHER_DOMAIN` | Progression autoritative, mais pas planification ; elle ne prouve aucune phase, étape, échéance ou prochaine action. |
| Timestamps Mission, Run, Work et événements | `RuntimeMission.createdAt/updatedAt`, `RuntimeRunRecord.startedAt/finishedAt`, `RuntimeEvent.occurredAt/publishedAt`, `WorkTimestamps` | Runtime, journal, monitoring et WCF-001 au fil de l'exécution | Snapshots et journal Runtime | Mission : oui ; Work : partiel pour les timestamps WCF-001 | `TECHNICAL_TIMESTAMP_ONLY` | Dates de création, observation, exécution ou persistance ; aucune n'est déclarée date métier de début, cible ou échéance. |
| Dépendances techniques | événements `DependencyRequired/Available/Unavailable`, locks, dépendances de documents et de composants Kernel | Orchestrator, résolveurs documentaires et composition technique | Événements/snapshots ou métadonnées documentaires | Mission : parfois ; Work : non | `AUTHORITATIVE_OTHER_DOMAIN` | Dépendances d'exécution, de contexte ou de composition ; aucune dépendance Planning Work. |
| Phases et tâches Work Plan | `apps/nova-web/src/features/work/workPlanFixture.ts` — `WorkPlanFixture`, `WorkPlanPhaseFixture`, `WorkPlanTaskFixture` | Constantes Frontend chargées par `getWorkPlanFixture` | Fichier TypeScript local, sans producteur Runtime ni persistance métier | `workId` fictif : oui ; Mission : non | `MOCK_OR_FIXTURE` | Source explicitement nommée fixture ; probabilités, durées, statuts, phases et tâches ne sont pas autoritatives. |
| Phases Work Setup | `apps/nova-web/src/features/work-setup/workSetupFixtures.ts` — `workSetupPlanPhases` | Constante Frontend | Fichier TypeScript local | Mission : non ; Work : non | `MOCK_OR_FIXTURE` | Phases génériques d'interface sans source Runtime. |
| Deadlines et phases Work Overview | `apps/nova-web/src/features/work/workOverviewFixture.ts` | Constantes Frontend | Fichier TypeScript local | `workId` fictif : oui ; Mission : non | `MOCK_OR_FIXTURE` | Échéances, phase labels et propriétaires sont simulés. |
| Deadlines de transport | `server/nova-bff/home-active-work.gateway.ts`, `server/nova-bff/runtime-gateway.adapter.ts`, `server/nova-core/nova-core.execution.ts` | Timers des gateways et processus | État éphémère du transport | Mission/Work : non | `TECHNICAL_TIMESTAMP_ONLY` | Délais techniques d'attente, sans sémantique Planning. |

## IMPLEMENTATION DECISION

**CAS B — PRODUCTEURS AUTORITATIFS ABSENTS**

La création d'un modèle Planning obligerait à promouvoir une donnée d'un autre
domaine, à déduire un plan depuis l'exécution ou à recopier une fixture. Ces
trois voies sont interdites.

Décision appliquée :

- aucun fichier Runtime Planning créé ;
- aucun service Planning créé ;
- aucune Query Planning créée ;
- aucun export ajouté à `server/runtime/work/work-core.ts` ;
- aucun test WCF-003 artificiel créé ;
- aucune API, aucun BFF et aucun Frontend modifié.

## PLANNING MODEL

**NON CRÉÉ**

Les types potentiels `WorkPlanning`, `WorkPlanningMilestone`,
`WorkPlanningStep`, `WorkPlanningDependency` et `WorkPlanningProvenance` ne
sont pas justifiés par une source autoritative disponible.

## PLANNING QUERY

**NON CRÉÉE**

`WorkPlanningQuery.get(projectId, workId)` n'est pas implémentable sans
producteur Planning. Une Query qui ne ferait que convertir les timestamps, la
queue, la progression ou les fixtures violerait le contrat de WCF-003.

## AUTHORITATIVE FIELDS

**AUCUN CHAMP PLANNING**

Les champs Work déjà autoritatifs — identité, Mission rattachée, lifecycle,
progression, timestamps, provenance et Objective — restent disponibles dans
leurs domaines actuels, mais aucun n'est requalifié comme primitive Planning.

## ABSENT FIELDS

Toutes les primitives Planning restent absentes :

- identifiant de plan ;
- identifiant de milestone ou d'étape ;
- titre et description de plan ;
- statut Planning ;
- priorité Planning ;
- échéance métier ;
- date métier de début, de fin ou de cible ;
- durée métier ;
- propriétaire Planning ;
- dépendance métier ;
- séquence métier ;
- complétion de plan ;
- risque ou confiance Planning ;
- recommandation ou prochaine action autoritative ;
- phase ou étape planifiée.

## PROVENANCE

Aucune provenance Planning ne peut être établie.

Les provenances observées restent qualifiées dans leur domaine d'origine :

- `ORCHESTRATOR_RUNTIME` pour les Missions, leur queue et leurs événements ;
- Monitoring/Missions pour la progression ;
- Runtime/Journal pour les timestamps et séquences techniques ;
- Portfolio/Programs pour le scheduling de Programs ;
- Frontend local pour les fixtures, qui ne constitue pas une autorité métier.

## FILES CREATED

- `Docs/24_MODULES/WORK/WCF_003_WORK_PLANNING_FOUNDATION_REPORT.md`

## FILES MODIFIED

**AUCUN**

Le rapport est le seul nouveau fichier de WCF-003. Aucun fichier Runtime,
Core, Frontend, BFF, contrat, test ou document existant n'a été modifié.

## TESTS

| Validation | Résultat |
|---|---|
| `npm.cmd run test:runtime` | **24/24 PASS** |
| `npm.cmd run test:core` | **506/506 PASS** |
| Tests WCF-003 | Non créés, conformément au CAS B |

## TYPECHECK

| Validation | Résultat |
|---|---|
| Runtime | **PASS** |
| Core | **PASS** |
| Commande | `npm.cmd run typecheck:nova-core` |

Le projet TypeScript `tsconfig.nova-core.json` couvre conjointement le Runtime
et Core.

## REGRESSIONS

**AUCUNE RÉGRESSION DÉTECTÉE**

- aucune modification de code ;
- aucune modification de WCF-001 ou Work Objective ;
- aucun export interne ajouté ;
- aucune API publique créée ;
- aucun Frontend ou BFF modifié ;
- suites Runtime et Core intégralement passantes ;
- typecheck Runtime/Core passant.

## NEXT REQUIRED PRODUCER

Le prochain prérequis est un **producteur métier Planning autoritatif**,
propriétaire d'au moins une primitive admissible et rattaché explicitement à
un Work par `projectId` et `workId` — ainsi qu'à la Mission si cette dernière
est sa source.

Ce producteur devra fournir la valeur métier et sa provenance sans utiliser
les timestamps techniques, la progression Monitoring, l'ordre d'une queue,
une convention implicite ou une fixture. Tant qu'il n'existe pas, WCF-003 doit
rester sans modèle et sans Query.

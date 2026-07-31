# MWA-000 — Mission Assignment Matrix

## 1. Légende

Chaque mécanisme reçoit exactement une classification autorisée par MWA-000.
`Réutilisable` précise sa portée ; aucune modification n'est appliquée.

## 2. Matrice

| ID | Mécanisme | Chemin | Rôle | Clé ou donnée | Persistance | Stable | Déterministe | Lien personne | Classification | Réutilisable |
|---|---|---|---|---|---|---|---|---|---|---|
| MWA-001 | `POST /api/v1/missions` | `server/nova-core/nova-core.http.ts` | reçoit la définition de Mission | payload sans creatorId | indirecte via service | n/a | oui pour le payload | aucun | `SERVICE` | non pour l'identité du créateur |
| MWA-002 | `NovaCoreService.createMission` / `OrchestratorRuntimeService.createMission` | `server/nova-core/nova-core.service.ts`; `server/runtime/orchestrator/orchestrator-runtime.service.ts` | crée, accepte et persiste la Mission | projectId + missionId | RuntimeSnapshot | oui | oui | aucun | `WORKFLOW` | oui pour le cycle Mission |
| MWA-003 | événement `MissionCreated` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | trace la création | producer = `Mission Intake` | journal Runtime | oui | oui | aucun | `TECHNICAL` | provenance technique seulement |
| MWA-004 | `MissionDefinition.authority` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | porte une autorité déclarée | chaîne libre non vide | RuntimeMission / snapshot | oui | valeur fournie | non démontré | `UNKNOWN` | non comme owner |
| MWA-005 | `MissionDefinition.requestedAgentId` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | demande un agent technique | agentId optionnel | RuntimeMission / snapshot | oui | oui si fourni | aucun | `TECHNICAL` | comme préférence technique |
| MWA-006 | `RuntimeAgent` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | décrit l'exécuteur admissible | agentId | registre / snapshot | oui | oui | aucun | `RUNTIME` | oui comme agent technique |
| MWA-007 | `registerAgent` / Agent Registry | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | enregistre les agents disponibles | agentId | snapshot | oui | oui par clé | aucun | `SERVICE` | oui pour la résolution technique |
| MWA-008 | `selectAgent` / `assignMission` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | sélectionne et affecte l'agent | agentId explicite, demandé ou compatible | résultat persisté | oui après affectation | conditionnel à l'ordre du registre si implicite | aucun | `WORKFLOW` | oui techniquement |
| MWA-009 | `RuntimeMission.assignedAgentId` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | affectation courante effective | (projectId, missionId) -> agentId | RuntimeSnapshot | oui après transition | oui après sélection | aucun | `AUTHORITATIVE` | oui pour l'exécuteur technique |
| MWA-010 | événement `AgentAssigned` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | trace l'affectation | payload.agentId | journal Runtime | oui | oui | aucun | `RUNTIME` | provenance technique |
| MWA-011 | `RuntimeLock.agentId` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | réserve le scope pour l'agent affecté | projectId + missionId + agentId | RuntimeSnapshot | durée du lock | oui depuis assignedAgentId | aucun | `TECHNICAL` | preuve d'exécution |
| MWA-012 | `MissionReport.agentId` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | atteste l'agent ayant produit le report | projectId + missionId + agentId | RuntimeSnapshot | oui pour le report | oui depuis la Mission active | aucun | `TECHNICAL` | preuve d'exécution, pas source d'affectation |
| MWA-013 | `RuntimeSnapshot` | `server/runtime/orchestrator/orchestrator-runtime.types.ts`; `orchestrator-runtime.service.ts` | conserve Missions, agents, locks, reports et événements | clés Runtime | JSON durable | oui | oui | aucun | `RUNTIME` | oui |
| MWA-014 | `JsonRuntimeSnapshotStore` | `server/nova-core/nova-core.store.ts` | charge et sauvegarde le snapshot | filePath + enveloppe attestée | fichier JSON | oui | oui | aucun | `SERVICE` | oui pour la durabilité |
| MWA-015 | `DurableExecutionSecurityIdentity.operatorId` | `server/nova-core/production-authentication.ts`; `durable-execution-session.ts` | authentifie l'opérateur de transport d'exécution | operatorId + runtimeId + environmentId | checkpoint d'exécution | oui pour la session | oui depuis l'assertion | aucune personne démontrée | `IDENTITY` | non comme affectation Work |
| MWA-016 | `LocalIdentityRecord` | `server/nova-bff/bff.identity.ts` | compte local BFF | userId | configuration BFF | oui dans la configuration | oui | utilisateur seulement | `IDENTITY` | non sans mapping Mission |
| MWA-017 | `ServerSession` | `server/nova-bff/bff.session.ts` | session utilisateur | sessionId + userId | SessionStore | durée de session | oui | utilisateur seulement | `SESSION` | non sans mapping Mission |
| MWA-018 | `LocalIdentityContext` | `server/nova-core/human-approval-workflow.ts` | identité d'un décideur | subjectId | record d'approbation | oui pour la décision | oui | identité locale seulement | `IDENTITY` | non comme affectation |
| MWA-019 | `HumanApprovalWorkflow.decide` | `server/nova-core/human-approval-workflow.ts` | produit une décision humaine | missionId + runId + subjectId | IntegrationRuntimeRepository | oui | oui pour l'acte | approbateur ponctuel | `BUSINESS` | comme provenance Decisions uniquement |
| MWA-020 | autorité de certification | `server/nova-core/mission-certification.ts`; `nova-core.http.ts` | authentifie et autorise le certificateur | authorityId + authenticatedSubjectId | certificat Mission | oui pour le certificat | oui | autorité, pas owner | `IDENTITY` | non comme affectation |
| MWA-021 | relation Work/Mission WCF-001 | `server/runtime/work/work-core-foundation.ts`; `work-core.types.ts` | lie Work à la Mission | projectId + workId = projectId + missionId | dérivée du snapshot | oui | oui | aucun lien personne | `RUNTIME` | oui pour atteindre l'agent technique |
| MWA-022 | Mission Runtime / Agent Runtime foundations | `server/runtime/mission-runtime/`; `server/runtime/agent-runtime/` | vérifie readiness, état et composition | références et états internes | evidence en mémoire | oui | oui | aucun | `TECHNICAL` | non comme affectation opérationnelle |

## 3. Totaux

| Classification | Nombre |
|---|---:|
| `AUTHORITATIVE` | 1 |
| `RUNTIME` | 4 |
| `TECHNICAL` | 5 |
| `BUSINESS` | 1 |
| `SESSION` | 1 |
| `IDENTITY` | 4 |
| `WORKFLOW` | 2 |
| `SERVICE` | 3 |
| `LEGACY` | 0 |
| `OBSOLETE` | 0 |
| `UNKNOWN` | 1 |
| **Total** | **22** |

## 4. Relations démontrées

| Relation | Existe | Clé | Nature |
|---|---|---|---|
| Mission -> agent demandé | oui, optionnelle | requestedAgentId | technique |
| Mission -> agent affecté | oui | assignedAgentId | technique, autoritative |
| Mission -> agent ayant le lock | oui | RuntimeLock.agentId | technique |
| Mission -> agent du report | oui | MissionReport.agentId | technique |
| Mission -> opérateur d'exécution | oui dans la session durable | operatorId | sécurité technique |
| Mission -> approbateur | oui par décision Mission/Run | subjectId | acte métier ponctuel |
| Mission -> certificateur | oui par certificat | authorityId | autorité de certification |
| Mission -> utilisateur BFF | non | aucune | absente |
| Mission -> personne/employé | non | aucune | absente |
| Mission -> propriétaire | non | aucune | absente |
| Mission -> participants | non | aucune | absente |

## 5. Qualification de la clé canonique

```text
Mission key:
  projectId + missionId

Assignment value:
  RuntimeMission.assignedAgentId

Registry join:
  RuntimeMission.assignedAgentId = RuntimeAgent.agentId
```

| Critère | Résultat |
|---|---|
| persistée | oui |
| stable après affectation | oui |
| déterministe avec agent explicite | oui |
| déterministe avec requestedAgentId | oui |
| déterministe sans agent explicite | dépend de l'ordre du registre compatible |
| identité humaine | non |
| fondation agent technique Work | oui |
| fondation Work People métier | non |


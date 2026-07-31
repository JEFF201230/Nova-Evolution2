# DPEO-000 — People Reconciliation Matrix

## 1. Légende

Chaque candidat reçoit exactement un statut autorisé par DPEO-000. La colonne
Décision décrit un traitement futur ; l'audit n'applique aucune modification.

## 2. Matrice

| ID | Implémentation | Chemin | Module | Responsabilité | Produit | Consomme | Statut | Décision | Impact | Priorité |
|---|---|---|---|---|---|---|---|---|---|---|
| PEO-001 | `UserIdentity` | `server/nova-bff/bff.identity.ts` | BFF Security | identité publique du compte local | userId, username, displayName, rôles, statut | configuration d'identité | `SECONDARY` | KEEP | identité utilisateur, pas personne Work | P0 frontière |
| PEO-002 | `LocalIdentityRecord` | `server/nova-bff/bff.identity.ts` | BFF Security | état local du compte et secrets dérivés | identité et credentials | configuration BFF | `AGGREGATE` | KEEP | agrégat sécurité uniquement | P0 frontière |
| PEO-003 | `LocalIdentityProvider` | `server/nova-bff/bff.identity.ts`; `bff.config.ts` | BFF Security | authentifie et change le statut du compte | `UserIdentity` | `BFF_LOCAL_IDENTITIES_JSON` | `SERVICE` | KEEP | producteur de compte, pas People | P0 frontière |
| PEO-004 | `BffPrincipal` / `publicSessionView` | `server/nova-bff/bff.session.ts` | BFF Session | vue publique de l'utilisateur connecté | principal de session | `ServerSession` | `READMODEL` | KEEP | projection sécurité | P1 |
| PEO-005 | `ServerSession` | `server/nova-bff/bff.session.ts` | BFF Session | état de session, expiration et révocation | session authentifiée ou anonyme | `UserIdentity` | `AGGREGATE` | KEEP | cycle technique, pas People | P1 |
| PEO-006 | `SessionManager` | `server/nova-bff/bff.session.ts` | BFF Session | crée, renouvelle, tourne et détruit les sessions | `ServerSession` | IdentityProvider, SessionStore | `SERVICE` | KEEP | service de session | P1 |
| PEO-007 | RBAC / `BFF_CAPABILITY_MATRIX` | `server/nova-bff/middleware/rbac.ts` | BFF Security | contrôle les capacités de session | autorisation ou refus | rôles BFF | `WORKFLOW` | KEEP | rôle de sécurité, pas rôle Work | P0 frontière |
| PEO-008 | `LocalIdentityContext` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | identifie localement le décideur | subjectId et rôles | contexte fourni à l'approbation | `SECONDARY` | KEEP | identité décisionnelle non mappée | P0 frontière |
| PEO-009 | identité de `HumanApprovalDecision` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | conserve le décideur avec l'acte | décision et identité persistables | request, identity, evidence | `AGGREGATE` | KEEP | approbateur ponctuel, pas participant | P1 |
| PEO-010 | `HumanApprovalWorkflow.decide` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | vérifie rôle et non-auto-approbation puis persiste | record `HUMAN_APPROVAL` | identity, request, bundle | `PRODUCER` | KEEP | producteur d'approbateur uniquement | P1 |
| PEO-011 | `HumanApprovalWorkflow.history` | `server/nova-core/human-approval-workflow.ts` | Nova Core Integration | relit les décisions Mission/Run | historique et identités de décideurs | repository d'intégration | `READMODEL` | KEEP | lecture Decisions, pas People | P2 |
| PEO-012 | `RuntimeAgent` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Orchestrator Runtime | décrit un exécuteur technique | agentId, missionTypes, scopes | configuration agents | `AGGREGATE` | KEEP | agent technique, pas personne | P0 frontière |
| PEO-013 | Agent Registry / `registerAgent` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Orchestrator Runtime | enregistre les agents techniques | registre agents | `RuntimeAgent` | `PRODUCER` | KEEP | producteur technique | P1 |
| PEO-014 | `OrchestratorRuntimeService.assignMission` | `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Orchestrator Runtime | sélectionne un agent compatible | `assignedAgentId`, événement AgentAssigned | Mission et Agent Registry | `WORKFLOW` | KEEP | affectation technique uniquement | P1 |
| PEO-015 | `RuntimeMission.assignedAgentId` | `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Orchestrator Runtime | conserve l'agent assigné à la Mission | identifiant agent | workflow d'affectation | `SECONDARY` | KEEP | ne démontre aucune affectation humaine | P0 frontière |
| PEO-016 | `RuntimeSnapshot.agents` | `server/runtime/orchestrator/orchestrator-runtime.types.ts`; `orchestrator-runtime.service.ts` | Orchestrator Persistence | projette et restaure le registre agents | agents et affectations techniques | stores Runtime | `PROJECTION` | KEEP | persistance technique | P2 |
| PEO-017 | `mission-squad-assignment` Resource Manager | `server/resource-manager/resource-manager.ts` | Program Resource Manager | prouve la readiness d'un composant documentaire | evidence booléenne | références Program | `SECONDARY` | KEEP | faux candidat People | P3 |
| PEO-018 | `CerebrauKnowledgeAuthorityReference.owner` | `server/nova-core/cerebrau-knowledge-adapter.ts` | Knowledge Adapter | porte un owner de métadonnée d'autorité | texte owner nullable | index CEREBRAU | `SECONDARY` | KEEP | owner documentaire, pas Work | P3 |
| PEO-019 | `workPeopleFixtures` | `apps/nova-web/src/features/work/workPeopleFixture.ts` | Frontend Work | simule personnes, NOVA, rôles et disponibilités | profils People enrichis | constantes locales | `DUPLICATE` | REMOVE | fausse source métier | P0 après remplacement |
| PEO-020 | branche People de `WorkSurface` | `apps/nova-web/src/components/routes/WorkSurface.tsx` | Frontend Routing | charge la fixture par workId | props Work People | `getWorkPeopleFixture` | `CONSUMER` | REFACTOR | futur point de consommation | P1 après source |
| PEO-021 | `WorkPeoplePage` | `apps/nova-web/src/features/work/WorkPeoplePage.tsx` | Frontend Work | affiche cartes et drawer People | projection UX | `WorkPeopleFixture` | `PROJECTION` | REFACTOR | projection sans source réelle | P1 après source |
| PEO-022 | owner et people de `workOverviewFixture` | `apps/nova-web/src/features/work/workOverviewFixture.ts` | Frontend Work | simule propriétaire et participants | owner, personnes, disponibilité | constantes locales | `DUPLICATE` | REMOVE | duplication de Work People | P1 après remplacement |
| PEO-023 | section People de `WorkOverviewPage` | `apps/nova-web/src/features/work/WorkOverviewPage.tsx` | Frontend Work | affiche owner et personnes | projection UX | fixture Overview | `PROJECTION` | REFACTOR | futur consommateur composite | P2 après source |
| PEO-024 | acteur Runtime de `WorkActivityPage` | `apps/nova-web/src/features/work/WorkActivityPage.tsx` | Frontend Work | projette `RuntimeEvent.producer` en acteur | libellé d'acteur d'événement | événements Mission | `PROJECTION` | KEEP | trace technique, pas registre People | P2 frontière |
| PEO-025 | acteurs de `workActivityFixture` | `apps/nova-web/src/features/work/workActivityFixture.ts` | Frontend Work | simule acteurs humains et NOVA | libellés d'acteurs | constantes locales | `DUPLICATE` | REMOVE | donnée inactive/fictive | P2 après vérification |
| PEO-026 | personnes de `workPlanFixture` | `apps/nova-web/src/features/work/workPlanFixture.ts` | Frontend Work | nomme un reviewer dans une étape fictive | libellé de personne | constantes locales | `DUPLICATE` | REMOVE | duplication sans identité | P3 après remplacement |
| PEO-027 | personnes de `workDeliverablesFixture` | `apps/nova-web/src/features/work/workDeliverablesFixture.ts` | Frontend Work | simule reviewer et demande de validation | libellés de personnes | constantes locales | `DUPLICATE` | REMOVE | duplication sans identité | P3 après remplacement |

## 3. Totaux par statut

| Statut | Nombre |
|---|---:|
| `AUTHORITATIVE` | 0 |
| `PRODUCER` | 2 |
| `CONSUMER` | 1 |
| `AGGREGATE` | 4 |
| `SERVICE` | 2 |
| `WORKFLOW` | 2 |
| `PROJECTION` | 4 |
| `READMODEL` | 2 |
| `SECONDARY` | 5 |
| `OBSOLETE` | 0 |
| `DUPLICATE` | 5 |
| `UNKNOWN` | 0 |
| **Total** | **27** |

`AUTHORITATIVE = 0` signifie qu'aucune implémentation n'est autoritative pour
le domaine Work People. Les producteurs identifiés restent autoritatifs
uniquement dans leurs domaines sécurité, approbation ou exécution.

## 4. Totaux par décision

| Décision | Nombre |
|---|---:|
| KEEP | 19 |
| REFACTOR | 3 |
| REMOVE | 5 |
| MERGE | 0 |
| **Total** | **27** |

Les décisions `REMOVE` sont conditionnelles à un remplacement vérifié. Aucun
fichier n'est supprimé par DPEO-000.

## 5. Couverture fonctionnelle People

| Capacité People | Source autoritative | Résultat |
|---|---|---|
| identité de compte | `UserIdentity` | couverte hors domaine People |
| session utilisateur | `ServerSession` / `BffPrincipal` | couverte hors domaine People |
| identité d'approbateur | `LocalIdentityContext` | couverte pour une décision |
| agent d'exécution | `RuntimeAgent` | couverte techniquement |
| personne métier | aucune | absente |
| employé | aucune | absent |
| organisation membre | aucune | absente |
| propriétaire Work | aucune | absent |
| participant Work | aucune | absent |
| rôle métier Work | aucune | absent |
| affectation humaine | aucune | absente |
| disponibilité | aucune | absente ; fixture seulement |


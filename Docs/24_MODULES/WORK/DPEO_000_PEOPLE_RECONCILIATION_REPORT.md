# DPEO-000 — People Reconciliation Report

## 1. Verdict

**NO GO**

Le dépôt contient plusieurs identités réelles et persistables, mais aucune
source métier autoritative ne représente aujourd'hui les personnes rattachées à
un Work.

Les sources existantes ont des frontières distinctes :

- `UserIdentity` représente un compte local du BFF ;
- `BffPrincipal` représente l'utilisateur d'une session BFF ;
- `LocalIdentityContext` représente le sujet local ayant pris une décision
  d'approbation ;
- `RuntimeAgent` représente un agent technique capable d'exécuter une Mission.

Aucune de ces sources ne porte une affectation, une participation ou une
propriété métier reliée de manière autoritative à `projectId` et `workId`.
`DPEO-001` ne peut donc pas être ouvert comme simple intégration read-only sans
créer ou désigner préalablement un producteur People métier.

## 2. Méthode économique

L'audit a procédé en trois étapes :

1. index ciblé de `server/`, `contracts/` et `apps/nova-web/src/` ;
2. recherche des symboles People et des relations d'identité uniquement dans
   les fichiers candidats ;
3. lecture des modèles, services, workflows, persistances et projections
   confirmés.

Les répertoires `node_modules`, `dist`, `build`, `coverage`, `.git`, snapshots
et artefacts générés ont été exclus.

Les documents de réconciliation antérieurs ont été utilisés comme index :

- `DOMAIN_RECONCILIATION_AUDIT.md` ;
- `DOMAIN_REUSE_MATRIX.md` ;
- `DOMAIN_PRODUCER_CATALOG.md` ;
- `DOMAIN_INTEGRATION_BACKLOG.md`.

Le code n'a pas été parcouru fichier par fichier. Les lectures ont été limitées
aux candidats identifiés par l'index et par les symboles recherchés.

## 3. Inventaire factuel

### 3.1 Identité utilisateur et sécurité BFF

#### `UserIdentity`

Chemin : `server/nova-bff/bff.identity.ts`

Champs observés :

- `userId` ;
- `username` ;
- `displayName` ;
- rôles `ADMIN`, `OPERATOR`, `APPROVER`, `VIEWER` ;
- statut `ACTIVE`, `DISABLED` ou `LOCKED` ;
- timestamps de création et de mise à jour.

`LocalIdentityProvider` produit cette identité après authentification à partir
de `BFF_LOCAL_IDENTITIES_JSON`. Il peut modifier le statut local du compte. Sa
responsabilité est l'authentification et non la gestion d'une personne métier.

#### `BffPrincipal` et `ServerSession`

Chemin : `server/nova-bff/bff.session.ts`

`SessionManager` copie les champs publics de `UserIdentity` dans une
`ServerSession`. `publicSessionView` produit ensuite un `BffPrincipal` pour la
route BFF `GET /session`.

La session ajoute des données de sécurité et de cycle de vie technique :

- session et CSRF ;
- authentification et activité ;
- expiration, rotation et révocation.

Le store par défaut est `InMemorySessionStore`, déclaré `non_durable`. Une
abstraction `SessionStore` existe, mais aucune sémantique People n'y est
définie.

#### Rôles BFF

Chemin : `server/nova-bff/middleware/rbac.ts`

`BFF_CAPABILITY_MATRIX` et `requireCapability` appliquent une autorisation de
session. Ces rôles sont des rôles de sécurité BFF. Ils ne constituent ni une
fonction métier, ni une affectation Work, ni une participation.

### 3.2 Identité d'approbation

Chemin : `server/nova-core/human-approval-workflow.ts`

`LocalIdentityContext` contient :

- `subjectId` ;
- `roles` ;
- `IDENTITY_CONTEXT_VALIDATED` ;
- `NOT_AUTHENTICATED_BY_PRODUCTION_AUTH`.

`HumanApprovalWorkflow.decide` vérifie le rôle requis, interdit
l'auto-approbation et persiste cette identité dans
`HumanApprovalDecision`. `HumanApprovalWorkflow.history` relit ensuite les
décisions.

Cette identité est autoritative pour l'acte d'approbation enregistré. Elle ne
contient ni nom de personne, ni profil employé, ni relation Work People. Aucun
mapping vers `UserIdentity` n'existe.

### 3.3 Agent technique Runtime

Chemins :

- `server/runtime/orchestrator/orchestrator-runtime.types.ts` ;
- `server/runtime/orchestrator/orchestrator-runtime.service.ts` ;
- `server/nova-core/nova-core.service.ts`.

`RuntimeAgent` contient :

- `agentId` ;
- `missionTypes` ;
- `authorizedScopes`.

`OrchestratorRuntimeService.registerAgent` alimente le registre technique.
`assignMission` sélectionne un agent compatible et renseigne
`RuntimeMission.assignedAgentId`. Les agents et affectations sont inclus dans
`RuntimeSnapshot`. Le Runtime par défaut enregistre notamment
`NOVA-DEVELOPER`.

Il s'agit d'une capacité d'exécution technique. Elle ne fournit aucune personne,
organisation, disponibilité humaine ou affectation métier. La proximité du mot
« agent » avec la carte UX « NOVA » ne constitue pas une équivalence People.

### 3.4 Faux candidats

#### Resource Manager

Chemin : `server/resource-manager/resource-manager.ts`

`mission-squad-assignment` est l'identifiant d'un composant de readiness
documentaire. Le module ne stocke aucune squad, personne ou affectation. Il
n'est pas un producteur People.

#### Autorité documentaire CEREBRAU

Chemin : `server/nova-core/cerebrau-knowledge-adapter.ts`

`CerebrauKnowledgeAuthorityReference.owner` est une métadonnée d'autorité
documentaire. Elle n'est reliée ni à une personne canonique, ni à un Work.

#### Owners d'intégrité

Chemin : `server/nova-core/execution-integrity-registry.ts`

La variable locale `owners` désigne les réservations d'identifiants techniques.
Elle ne représente aucune personne.

### 3.5 Projections Frontend

Chemins principaux :

- `apps/nova-web/src/features/work/workPeopleFixture.ts` ;
- `apps/nova-web/src/features/work/WorkPeoplePage.tsx` ;
- `apps/nova-web/src/components/routes/WorkSurface.tsx` ;
- `apps/nova-web/src/features/work/workOverviewFixture.ts` ;
- `apps/nova-web/src/features/work/WorkOverviewPage.tsx`.

`WorkSurface` appelle directement `getWorkPeopleFixture(workId)`.
`WorkPeoplePage` affiche des profils enrichis locaux : nom, rôle,
disponibilité, responsabilité, compétences, charge, temps de réponse,
validations et score de confiance.

Ces données sont des fixtures. Elles ne sont reliées à aucun service, endpoint,
repository ou modèle Runtime. `workOverviewFixture` duplique un propriétaire et
une liste de personnes. Des noms similaires apparaissent encore dans les
fixtures Activity, Plan et Deliverables.

`WorkActivityPage` raccordé au Runtime projette `RuntimeEvent.producer` comme
acteur d'activité. Ce libellé de producteur d'événement n'est pas une identité
People.

## 4. Recherche des modèles métier attendus

Les symboles suivants n'ont aucune définition dans les zones indexées :

- `EmployeeProfile` ;
- `EmployeeState` ;
- `EmployeeBusinessState` ;
- `OrganizationMember` ;
- `MissionActor` ;
- `MissionParticipant` ;
- `MissionOwner` ;
- `MissionAssignment` ;
- `RoleAssignment` ;
- `AssignmentEngine` ;
- `AssignmentWorkflow` ;
- `PeopleService` ;
- `PeopleRepository` ;
- `PeopleAggregate` ;
- `PeopleReadModel` ;
- `PersonRepository` ;
- `PersonAggregate`.

Les recherches de relations suivantes ne trouvent aucun mapping métier :

- `workId` vers `userId` ;
- `workId` vers `subjectId` ;
- `workId` vers un agent humain ;
- `UserIdentity` vers `LocalIdentityContext` ;
- `UserIdentity` vers `RuntimeAgent` ;
- `LocalIdentityContext` vers `RuntimeAgent`.

Le seul rattachement d'agent à une Mission est
`RuntimeMission.assignedAgentId`, et cet agent est explicitement technique.

## 5. Analyse métier

### 5.1 Ce qu'est une personne dans NOVA

Le code actuel ne définit pas d'entité métier canonique « Person ». Il expose
des identités de frontières différentes, mais aucun modèle unifié ne peut être
qualifié de personne métier sans inventer une correspondance.

### 5.2 Distinctions obligatoires

| Notion | Implémentation constatée | Périmètre réel | Work People |
|---|---|---|---|
| Identité technique | `RuntimeAgent.agentId`, producteurs d'événements | exécution Runtime | non |
| Identité utilisateur | `UserIdentity` | compte local BFF | non |
| Identité employé | aucune | aucune | absente |
| Identité métier | `LocalIdentityContext.subjectId` pour une approbation seulement | acte décisionnel local | partielle, non mappée |
| Rôle | `BffRole`; rôle requis d'approbation | autorisation et décision | pas un rôle Work |
| Affectation | `RuntimeMission.assignedAgentId` | affectation d'agent technique | non |
| Participation | aucune source | aucune | absente |

### 5.3 Responsabilités humaines

| Question | Réponse factuelle |
|---|---|
| Qui est propriétaire d'un Work ? | Aucun producteur Runtime. Seules les fixtures Overview fournissent un nom. |
| Qui participe à un Work ? | Aucun producteur ou mapping persistant. |
| Qui approuve ? | `LocalIdentityContext.subjectId` dans une décision persistée, sans mapping vers une personne Work. |
| Qui exécute ? | `RuntimeAgent`, agent technique et non personne métier. |
| Qui observe ? | Aucun rôle d'observateur Work n'est persisté. |

### 5.4 Données persistées et dérivées

Persistées ou persistables dans leur frontière :

- comptes locaux configurés pour `LocalIdentityProvider` ;
- sessions via `SessionStore` ; le store par défaut reste non durable ;
- identité d'approbation incluse dans le record `HUMAN_APPROVAL` ;
- agents techniques et `assignedAgentId` dans `RuntimeSnapshot`.

Dérivées :

- `BffPrincipal` depuis `ServerSession` ;
- événements `AgentAssigned` depuis l'affectation technique ;
- acteurs d'activité depuis `RuntimeEvent.producer` ;
- toutes les personnes, rôles, disponibilités et propriétaires affichés dans
  les fixtures UX.

## 6. Producteurs

Producteurs réels :

1. `LocalIdentityProvider` — identité de compte BFF ;
2. `SessionManager` — principal et cycle de session ;
3. `HumanApprovalWorkflow.decide` — identité rattachée à une décision humaine ;
4. Agent Registry / `registerAgent` — agent technique ;
5. `OrchestratorRuntimeService.assignMission` — affectation technique Mission.

Producteur Work People :

**aucun**.

## 7. Consommateurs

- middleware BFF et routes session ;
- `HumanApprovalWorkflow.applyDecision` ;
- `NovaIntegrationService` ;
- `ProgramRuntimeOrchestrator` ;
- Orchestrator Runtime et mécanismes de lock/exécution ;
- projections `WorkPeoplePage`, `WorkOverviewPage` et `WorkActivityPage`.

Les projections People Frontend ne consomment actuellement aucun producteur
canonique.

## 8. Agrégats, services et workflows

### Agrégats ou états persistables

- `LocalIdentityRecord` ;
- `ServerSession` ;
- `HumanApprovalDecision` portant `LocalIdentityContext` ;
- `RuntimeAgent` et son affectation dans `RuntimeMission`.

### Services

- `LocalIdentityProvider` ;
- `SessionManager` ;
- `OrchestratorRuntimeService`.

### Workflows

- authentification et session BFF ;
- RBAC BFF ;
- décision d'approbation humaine ;
- sélection et affectation d'agent Runtime.

Ces workflows ne forment pas un workflow People métier.

## 9. Projections et Read Models

Read Models réels :

- `publicSessionView` / `BffPrincipal` pour la session ;
- `HumanApprovalWorkflow.history` pour les décisions humaines.

Projections :

- `RuntimeSnapshot.agents` pour l'état technique ;
- `WorkPeoplePage` depuis une fixture ;
- section People de `WorkOverviewPage` depuis une fixture ;
- acteur de `WorkActivityPage` depuis le producteur d'événement Runtime.

Aucun `PeopleReadModel` ou projection Work People autoritative n'existe.

## 10. Règles métier et techniques

Règles constatées :

- statut et rôles du compte BFF ;
- capacité de session et contrôles RBAC ;
- rôle requis et interdiction d'auto-approbation ;
- compatibilité `missionTypes` / `authorizedScopes` pour l'agent Runtime.

Règles absentes :

- identité métier d'une personne ;
- propriété d'un Work ;
- participation et affectation humaine ;
- rôle métier dans un Work ;
- disponibilité ;
- cycle de vie d'une participation.

## 11. Source of Truth

### Nom exact

**NON IDENTIFIÉE — aucune source Work People n'existe dans le patrimoine
audité.**

### Chemin exact

**Aucun.**

### Justification technique

Aucun modèle ne relie une personne métier à `projectId` et `workId`. Les
relations disponibles sont soit de sécurité, soit décisionnelles, soit
techniques. Aucun repository, aggregate, service, workflow ou record People ne
porte ce lien.

### Justification métier

Un compte, un approbateur ponctuel et un agent d'exécution ne sont pas
interchangeables. Les promouvoir en personnes Work créerait implicitement des
rôles et des affectations qui ne sont pas produits par le métier.

### Décision de réutilisation

- conserver les identités et agents dans leurs frontières actuelles ;
- ne fusionner aucun de ces modèles ;
- ne pas utiliser les fixtures comme source ;
- ne pas autoriser DPEO-001 tant qu'une source People et son lien Work ne sont
  pas autoritativement établis.

## 12. Dette et risques

| Risque | Niveau | Preuve | Conséquence |
|---|---|---|---|
| Fusion compte/personne | critique | aucun mapping `UserIdentity` vers Work | attribution métier inventée |
| Fusion agent/personne | critique | `RuntimeAgent` ne porte que scopes et types | NOVA technique présenté comme collaborateur métier |
| Promotion de l'approbateur | élevé | `LocalIdentityContext` est local et non authentifié par production auth | une décision ponctuelle devient une participation |
| Fixtures silencieuses | élevé | `WorkSurface` charge `workPeopleFixture` | données fictives affichées comme faits |
| Rôles homonymes | élevé | rôles BFF et approval | confusion sécurité / métier |
| Multiples identifiants non mappés | moyen | `userId`, `subjectId`, `agentId` | jointures non déterministes |

## 13. Décisions KEEP / MERGE / REFACTOR / REMOVE

### KEEP

Conserver sans changement :

- identité et session BFF ;
- identité incluse dans les décisions humaines ;
- agent registry, agent assignment et snapshot Runtime ;
- Resource Manager et métadonnées CEREBRAU dans leurs frontières ;
- projection d'acteur Runtime de Work Activity.

### MERGE

Aucun élément.

Une fusion entre `UserIdentity`, `LocalIdentityContext` et `RuntimeAgent`
détruirait leurs frontières sémantiques.

### REFACTOR

Dans un lot ultérieur seulement, après existence d'une source autoritative :

- `WorkSurface` pour consommer une query People ;
- `WorkPeoplePage` comme projection ;
- section People de `WorkOverviewPage`.

### REMOVE

Après remplacement vérifié seulement :

- `workPeopleFixture` ;
- propriétaire et personnes de `workOverviewFixture` ;
- acteurs humains de `workActivityFixture` devenus inactifs ;
- références humaines des fixtures Plan et Deliverables.

Aucune suppression n'est réalisée par DPEO-000.

## 14. Décision pour DPEO-001

`DPEO-001 — Work People Internal Read Integration` est **NON AUTORISÉ**.

Une lecture interne ne peut pas être construite sans source People et sans clé
de rattachement Work. Le prochain travail requis est l'établissement
autoritatif de ce producteur et de cette relation ; il ne peut pas être remplacé
par un adapter entre identifiants non mappés.

## 15. Régressions

- code modifié : aucun ;
- contrat modifié : aucun ;
- Runtime modifié : aucun ;
- BFF modifié : aucun ;
- Frontend modifié : aucun ;
- test modifié ou exécuté : aucun, audit documentaire uniquement ;
- régression détectée : aucune.


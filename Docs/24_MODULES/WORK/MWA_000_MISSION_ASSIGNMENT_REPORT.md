# MWA-000 — Mission Work Assignment Reconciliation Report

## 1. Verdict

**GO**

L'audit démontre le mécanisme canonique d'affectation actuel :

```text
RuntimeMission(projectId, missionId)
  -> assignedAgentId
  -> RuntimeAgent(agentId)
```

Cette affectation est réelle, stable après la transition d'affectation et
persistée dans le snapshot Runtime. Elle est cependant exclusivement
**technique** : `RuntimeAgent` représente un exécuteur de Mission, pas une
personne, un employé ou un utilisateur.

Le mécanisme peut alimenter la composante « agent technique » d'un futur Work
People, mais il ne peut pas servir seul de fondation au domaine métier People.

## 2. Méthode économique

L'audit a d'abord indexé les fichiers candidats dans :

- `server/runtime/orchestrator/` ;
- `server/runtime/mission-runtime/` ;
- `server/runtime/agent-runtime/` ;
- `server/runtime/work/` ;
- `server/nova-core/` ;
- `server/nova-bff/` ;
- `contracts/`.

Les lectures ont ensuite été limitées aux chaînes suivantes :

1. création HTTP et service de Mission ;
2. définition et projection `RuntimeMission` ;
3. registre et sélection des `RuntimeAgent` ;
4. lock, report et snapshot ;
5. identité d'exécution ;
6. approbation humaine et certification ;
7. relation Work/Mission de WCF-001.

`node_modules`, `dist`, `build`, `coverage`, `.git`, snapshots de données et
artefacts générés ont été exclus.

## 3. Réponse aux questions obligatoires

### 3.1 Qui crée une Mission ?

Le chemin opérationnel est :

```text
POST /api/v1/missions
  -> validateMissionDefinition
  -> NovaCoreService.createMission
  -> OrchestratorRuntimeService.createMission
  -> MissionCreated
```

Fichiers :

- `server/nova-core/nova-core.http.ts` ;
- `server/nova-core/nova-core.service.ts` ;
- `server/runtime/orchestrator/orchestrator-runtime.service.ts`.

Le créateur humain ou utilisateur n'est pas conservé :

- le payload ne contient ni `createdBy`, ni `userId`, ni `subjectId` ;
- la route ne transmet pas de `BffPrincipal` ;
- l'événement `MissionCreated` porte le producteur constant
  `Mission Intake`.

`Mission Intake` désigne le composant technique créateur, pas la personne ayant
initié la demande.

### 3.2 Qui exécute une Mission ?

L'exécuteur canonique est un `RuntimeAgent`.

`OrchestratorRuntimeService.assignMission` :

1. charge la Mission en état `READY` ;
2. sélectionne un agent du registre ;
3. vérifie `missionTypes` et `authorizedScopes` ;
4. écrit `mission.assignedAgentId = agent.agentId` ;
5. publie `AgentAssigned` ;
6. fait évoluer la Mission vers `ASSIGNED`.

Le même `agentId` est ensuite porté par :

- `RuntimeLock.agentId` ;
- `MissionReport.agentId`.

Le service Nova Core enregistre par défaut l'agent technique
`NOVA-DEVELOPER`.

### 3.3 Qui possède une Mission ?

**Aucun propriétaire n'est modélisé.**

`MissionDefinition` ne contient ni `ownerId`, ni `assigneeId` humain, ni
participant.

Le champ `authority` ne constitue pas une propriété :

- il est validé uniquement comme chaîne non vide ;
- il n'est relié à aucun `UserIdentity`, `subjectId` ou repository de
  personnes ;
- il est comparé pour l'idempotence de la définition ;
- il peut représenter une autorité ou un domaine, sans identité de personne
  démontrée.

Il est donc interdit de requalifier `authority` en owner.

### 3.4 Qui approuve une Mission ?

Deux mécanismes distincts existent.

#### Approbation humaine

`HumanApprovalWorkflow.decide` persiste
`HumanApprovalDecision.identity.subjectId` avec :

- `missionId` ;
- `runId` ;
- rôle requis ;
- décision et justification.

Ce sujet est l'approbateur de cet acte précis. Il n'est pas affecté à la
Mission et n'est pas automatiquement participant au Work.

#### Certification opérationnelle

La route historique `POST .../approve` retourne `410
APPROVAL_ROUTE_REMOVED`. La voie HTTP actuelle utilise la certification
authentifiée, qui porte `authorityId` et `authenticatedSubjectId`.

La certification est une autorité finale distincte de l'affectation de Mission.

### 3.5 Qui est responsable d'une Mission ?

Aucun responsable métier n'est persisté.

Le seul responsable opérationnel démontrable est l'agent technique ayant acquis
le lock et produit le report. Cette responsabilité est d'exécution, pas de
propriété métier.

### 3.6 Existe-t-il une affectation persistée ?

**Oui.**

`RuntimeSnapshot` contient :

- `missions`, incluant `assignedAgentId` ;
- `agents` ;
- `locks` ;
- `reports` ;
- événements, incluant `AgentAssigned`.

`NovaCoreService.mutate` appelle
`JsonRuntimeSnapshotStore.save(runtime.exportSnapshot())`. Au redémarrage,
`restoreSnapshot` restaure Missions, agents et locks.

### 3.7 Existe-t-il une affectation Runtime ?

**Oui.**

La transition canonique est :

```text
READY
  -> assignMission(projectId, missionId, agentId?)
  -> assignedAgentId
  -> AgentAssigned
  -> ASSIGNED
```

### 3.8 Existe-t-il une affectation uniquement technique ?

**Oui.**

`RuntimeAgent` ne contient que :

- `agentId` ;
- `missionTypes` ;
- `authorizedScopes`.

Ces données qualifient un exécuteur technique.

### 3.9 Existe-t-il une affectation métier ?

**Non.**

Aucun lien Mission vers personne, employé, utilisateur, organisation, owner,
participant, contributor ou assignee humain n'a été trouvé.

### 3.10 Existe-t-il une relation Work → Mission → Personne ?

La relation Work/Mission existe :

```text
WorkIdentity.projectId = RuntimeMission.projectId
WorkIdentity.workId = RuntimeMission.missionId
```

La suite vers une personne n'existe pas :

```text
Work
  -> Mission
  -> RuntimeAgent       [oui, technique]
  -> Personne métier    [non]
```

### 3.11 Quelle clé relie Mission à un affecté ?

La clé canonique d'affectation technique est :

```text
(projectId, missionId) -> RuntimeMission.assignedAgentId
RuntimeMission.assignedAgentId = RuntimeAgent.agentId
```

`projectId` et `missionId` identifient la Mission ; `agentId` identifie
l'exécuteur dans le registre Runtime.

### 3.12 Cette clé est-elle persistée ?

**Oui.**

`assignedAgentId` et le registre `agents` sont sauvegardés dans
`RuntimeSnapshot`. Le lock et le report recopient l'agent effectivement utilisé.

### 3.13 Cette clé est-elle stable ?

**Oui dans le cycle de vie actuel, après affectation.**

Le code ne contient pas de commande de réaffectation. `assignedAgentId` est
écrit lors de la transition `READY -> ASSIGNED`, puis réutilisé par le lock et
le report.

`requestedAgentId` est une préférence d'entrée persistée dans la définition ;
ce n'est pas l'affectation effective.

### 3.14 Cette clé est-elle déterministe ?

La sélection est déterministe dans les cas suivants :

- `agentId` fourni à la commande d'affectation ;
- `requestedAgentId` défini ;
- `NovaCoreService.assignAndLock` utilisant son défaut
  `NOVA-DEVELOPER`.

Si aucun identifiant n'est fourni au niveau Orchestrator, `selectAgent` prend le
premier agent compatible dans l'ordre du registre. Le résultat est alors
déterministe relativement au contenu et à l'ordre du registre, mais ne
constitue pas une règle d'affectation métier.

### 3.15 Peut-elle devenir la base de Work People ?

**Partiellement seulement.**

Elle peut fournir sans invention :

- l'identifiant de l'agent technique affecté ;
- ses types de Mission ;
- ses scopes autorisés ;
- la provenance Mission, événement, lock et report.

Elle ne peut pas fournir :

- une personne ou un employé ;
- un display name humain ;
- un propriétaire Work ;
- des participants ;
- un rôle métier ;
- une disponibilité ;
- une organisation ;
- un lien avec `UserIdentity` ou `LocalIdentityContext`.

## 4. Analyse des identités voisines

### 4.1 `MissionDefinition.authority`

Persisté et stable dans la définition, mais sémantique d'autorité non reliée à
une personne. Classification : `UNKNOWN` pour l'affectation.

### 4.2 `requestedAgentId`

Demande technique d'agent. Elle peut guider `selectAgent`, mais la valeur
effective reste `assignedAgentId`.

### 4.3 `ProductionAuthenticationDecision.operatorId`

L'identité de production autorise l'exécution et est copiée dans
`DurableExecutionSession.operatorIdentity`. Elle est reliée à une session
d'exécution et à une Mission, mais représente l'opérateur de transport Runtime,
pas l'affecté métier.

### 4.4 `LocalIdentityRecord` et `ServerSession`

Ils identifient le compte et la session BFF. Aucun de leurs identifiants n'est
copié dans `RuntimeMission`.

### 4.5 `HumanApprovalDecision.identity`

Elle identifie l'auteur d'une décision liée à Mission/Run. Elle ne constitue
pas une affectation.

### 4.6 Mission Runtime et Agent Runtime foundations

Les modules `server/runtime/mission-runtime/` et
`server/runtime/agent-runtime/` produisent des preuves de readiness et des
cycles internes. Ils ne stockent aucune relation Mission/personne ou
Mission/agent opérationnel.

## 5. Chaîne canonique démontrée

```text
Caller non identifié
  -> POST /api/v1/missions
  -> Mission Intake
  -> RuntimeMission(projectId, missionId, requestedAgentId?)
  -> Agent Registry
  -> RuntimeAgent(agentId)
  -> assignMission
  -> RuntimeMission.assignedAgentId
  -> AgentAssigned
  -> RuntimeLock.agentId
  -> MissionReport.agentId
  -> RuntimeSnapshot
```

Chaîne d'approbation distincte :

```text
Mission + Run
  -> HumanApprovalDecision
  -> LocalIdentityContext.subjectId
```

Les deux chaînes ne sont pas fusionnées et aucun mapping entre `agentId`,
`subjectId` et `userId` n'existe.

## 6. Source autoritative d'affectation

### Source courante

`RuntimeMission.assignedAgentId`

### Producteur

`OrchestratorRuntimeService.assignMission`

### Registre cible

`RuntimeAgent`, indexé par `agentId`.

### Persistance

`RuntimeSnapshot`, sauvegardé par `JsonRuntimeSnapshotStore`.

### Qualification

`AUTHORITATIVE` pour l'affectation technique courante de Mission.

`NON AUTHORITATIVE` pour toute affectation humaine ou métier.

## 7. Impact sur DPEO-000

MWA-000 affine le NO GO de DPEO-000 :

- une source d'affectation existe bien ;
- elle est limitée aux agents techniques ;
- elle peut alimenter une sous-vue technique de Work ;
- elle ne résout ni l'identité d'une personne, ni la propriété, ni la
  participation Work.

DPEO-001 reste donc bloqué comme intégration **People métier**. Il ne doit pas
être débloqué en requalifiant `RuntimeAgent` en personne.

## 8. Régressions

- code modifié : aucun ;
- Runtime modifié : aucun ;
- BFF modifié : aucun ;
- Frontend modifié : aucun ;
- contrat ou test modifié : aucun ;
- régression détectée : aucune.


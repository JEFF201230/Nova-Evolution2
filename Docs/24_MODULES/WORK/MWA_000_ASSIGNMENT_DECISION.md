# MWA-000 — Mission Assignment Decision

## 1. Décision

**GO POUR LA RÉCONCILIATION**

Le mécanisme d'affectation Mission est identifié, sa clé est démontrée et sa
persistance est confirmée.

Cette décision ne donne pas GO à DPEO-001 : l'affectation trouvée est technique,
pas métier.

## 2. Source autoritative

### Modèle

`RuntimeMission.assignedAgentId`

### Producteur

`OrchestratorRuntimeService.assignMission`

### Registre

`RuntimeAgent`, indexé par `agentId`.

### Persistance

`RuntimeSnapshot`, sauvegardé par `JsonRuntimeSnapshotStore`.

## 3. Clé canonique

```text
(projectId, missionId)
  -> RuntimeMission.assignedAgentId
  -> RuntimeAgent.agentId
```

La relation Work préalable est :

```text
WorkIdentity.projectId = RuntimeMission.projectId
WorkIdentity.workId = RuntimeMission.missionId
```

La chaîne complète démontrable est donc :

```text
Work
  -> Mission
  -> RuntimeAgent
```

La chaîne suivante n'est pas démontrée :

```text
Work
  -> Mission
  -> Personne
```

## 4. Nature de l'affectation

**TECHNIQUE**

`RuntimeAgent` décrit :

- un identifiant d'agent ;
- des types de Mission ;
- des scopes autorisés.

Il ne décrit pas :

- un utilisateur ;
- un employé ;
- une organisation ;
- un owner ;
- un participant ;
- une disponibilité ou un rôle métier.

## 5. Créateur

Le créateur fonctionnel ou humain est **inconnu**.

`POST /api/v1/missions` appelle le service de création, mais aucun identifiant
d'appelant n'est persisté. `Mission Intake` est le producteur technique de
l'événement `MissionCreated`.

`MissionDefinition.authority` ne peut pas être utilisé comme creator ou owner :
aucune sémantique de personne ni jointure d'identité n'est imposée.

## 6. Propriétaire

**Aucun propriétaire de Mission n'est modélisé.**

Ni `RuntimeMission`, ni Work Core, ni le snapshot ne portent un owner humain.

## 7. Exécuteur

L'exécuteur est le `RuntimeAgent` référencé par `assignedAgentId`.

Le Runtime par défaut utilise `NOVA-DEVELOPER`. Le lock et le report confirment
l'agent ayant effectivement exécuté la Mission.

## 8. Approbateur

Lorsqu'un record d'approbation humaine existe, l'approbateur est :

`HumanApprovalDecision.identity.subjectId`.

Cette relation est limitée à l'acte Mission/Run. Elle ne prouve ni propriété ni
participation durable.

La certification authentifiée constitue une autre frontière et ne doit pas
être transformée en affectation.

## 9. Stabilité et déterminisme

- `assignedAgentId` est écrit à la transition `READY -> ASSIGNED` ;
- aucune commande de réaffectation n'est présente ;
- la valeur est sauvegardée et restaurée ;
- un agent explicite ou demandé donne une sélection déterministe ;
- sans agent explicite, le premier agent compatible du registre est choisi.

La clé est donc stable pour la Mission après affectation, mais la sélection
implicite reste une règle technique dépendante du registre.

## 10. Réutilisabilité

### Réutilisable

Oui pour représenter l'agent technique affecté à un Work :

- agentId ;
- missionTypes ;
- authorizedScopes ;
- événement d'affectation ;
- lock et report ;
- provenance Runtime.

### Non réutilisable

Non pour représenter :

- une personne métier ;
- un propriétaire ;
- un participant ;
- un membre d'organisation ;
- un rôle ou une disponibilité People.

## 11. Impact sur Work People

La clé peut devenir la fondation d'une **facette d'exécution technique** de Work
People.

Elle ne peut pas devenir la source unique de Work People, car elle exclut les
personnes humaines et ne mappe ni `userId` ni `subjectId`.

Le NO GO de DPEO-000 reste valide pour le domaine People métier.

## 12. Next Decision

La prochaine décision doit séparer explicitement :

1. la représentation de l'agent technique, déjà disponible ;
2. la propriété et la participation humaines, toujours sans producteur.

`DPEO-001` ne doit pas être ouvert comme intégration People complète sur la
seule base de `assignedAgentId`.

## 13. Régressions

Aucun code, Runtime, BFF, Frontend, contrat, test ou fichier existant n'a été
modifié.


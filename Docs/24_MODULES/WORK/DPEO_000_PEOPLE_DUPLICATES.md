# DPEO-000 — People Duplicates Analysis

## 1. Principe

Une identité voisine n'est pas automatiquement une personne métier. L'audit
distingue :

- les projections légitimes d'une identité ;
- les identités appartenant à des frontières différentes ;
- les affectations techniques ;
- les duplications de données fictives dans le Frontend.

Aucun fichier n'est modifié ou supprimé.

## 2. Doublons avérés

### DUP-PEO-001 — personnes de Work fictives

**Origine**

- `apps/nova-web/src/features/work/workPeopleFixture.ts`
- `apps/nova-web/src/features/work/workOverviewFixture.ts`
- `apps/nova-web/src/features/work/workActivityFixture.ts`
- `apps/nova-web/src/features/work/workPlanFixture.ts`
- `apps/nova-web/src/features/work/workDeliverablesFixture.ts`

**Responsabilité**

Alimenter plusieurs surfaces Work avec les noms Sarah Chen, Thomas Vidal,
Marie Dupont ou NOVA.

**Différence métier**

Chaque fixture attribue localement des rôles différents : owner, reviewer,
participant, acteur, valideur ou collaborateur. Aucun identifiant partagé ni
producteur ne garantit qu'il s'agit de la même identité.

**Différence technique**

Structures TypeScript indépendantes, sans contrat commun, repository, query ou
mapping Runtime.

**Risque**

Présenter des rôles, disponibilités, charges, validations, compétences et
scores fictifs comme des faits métier cohérents.

**Recommandation**

`REMOVE` après raccordement vérifié à une source People. Ne pas fusionner les
champs de fixtures dans le Runtime : ils ne disposent d'aucune provenance
autoritative.

### DUP-PEO-002 — propriétaire et liste People d'Overview

**Origine**

- `workOverviewFixture.progress.owner`
- `workOverviewFixture.people`
- `workPeopleFixture.people`

**Responsabilité**

Afficher un propriétaire dans la progression et une liste de personnes dans
Overview et People.

**Différence métier**

Le propriétaire est un texte libre ; la liste People possède des identifiants
locaux. Aucune contrainte ne garantit que le texte owner désigne une entrée de
la liste.

**Différence technique**

La relation est reproduite par égalité visuelle de noms, jamais par identifiant.

**Risque**

Créer une propriété Work implicite et impossible à vérifier.

**Recommandation**

`REMOVE` après remplacement. Une future relation owner/participant doit venir
du producteur autoritatif, pas d'un rapprochement de chaînes.

## 3. Chevauchements non fusionnables

### BOUNDARY-PEO-001 — `UserIdentity` et `BffPrincipal`

`BffPrincipal` est une projection volontaire de la session depuis
`UserIdentity`. Les champs de statut et timestamps ne sont pas copiés.

Décision : `KEEP`. Il s'agit d'une projection de sécurité, pas d'un doublon
People.

### BOUNDARY-PEO-002 — `UserIdentity` et `LocalIdentityContext`

Les deux modèles possèdent un identifiant et des rôles, mais :

- `UserIdentity` est produit par l'authentification BFF ;
- `LocalIdentityContext` est fourni au workflow d'approbation ;
- le second déclare explicitement
  `NOT_AUTHENTICATED_BY_PRODUCTION_AUTH` ;
- aucun mapping `userId` / `subjectId` n'existe.

Décision : `KEEP` séparément. Une fusion inventerait l'identité du décideur.

### BOUNDARY-PEO-003 — `RuntimeAgent` et identité humaine

`RuntimeAgent` porte uniquement un identifiant technique, des types de Mission
et des scopes. `RuntimeMission.assignedAgentId` représente l'exécuteur
technique.

Décision : `KEEP`. Ne pas transformer l'agent en personne, employé ou
participant.

### BOUNDARY-PEO-004 — NOVA UX et `NOVA-DEVELOPER`

La fixture People décrit NOVA comme « AI collaborator » avec disponibilité,
charge, temps de réponse, validations, confiance et compétences. Le Runtime
déclare `NOVA-DEVELOPER` comme agent technique générique.

Le nom voisin ne prouve aucune identité commune et les champs UX n'existent pas
dans `RuntimeAgent`.

Décision : `KEEP` pour l'agent technique et `REMOVE` conditionnel pour la
fixture. Aucun adapter ne doit inventer les champs UX.

### BOUNDARY-PEO-005 — approbateur et participant

`HumanApprovalDecision.identity` prouve qu'un sujet a pris une décision sur une
Mission/Run. Il ne prouve pas :

- que ce sujet participe au Work ;
- qu'il en est propriétaire ;
- qu'il est disponible ;
- qu'il possède un rôle Work permanent.

Décision : `KEEP` comme provenance Decisions. Ne pas projeter automatiquement
l'approbateur dans Work People.

## 4. Faux positifs lexicaux

### `CerebrauKnowledgeAuthorityReference.owner`

Owner de métadonnée documentaire, sans identité People ni Work.

Décision : `KEEP` dans Knowledge.

### `mission-squad-assignment`

Identifiant de composant de readiness dans Resource Manager, sans squad
persistée.

Décision : `KEEP` dans Program Resource Manager.

### `owners` d'Execution Integrity

Nom local désignant la réservation d'identifiants techniques.

Décision : hors matrice People.

## 5. Synthèse

| Grappe | Nature | Décision |
|---|---|---|
| fixtures People multi-surfaces | doublon avéré | REMOVE après remplacement |
| owner et liste Overview | doublon avéré | REMOVE après remplacement |
| UserIdentity / BffPrincipal | projection | KEEP |
| UserIdentity / LocalIdentityContext | frontières distinctes | KEEP séparément |
| RuntimeAgent / personne | homonymie technique | KEEP séparément |
| NOVA UX / NOVA-DEVELOPER | homonymie non démontrée | KEEP agent, REMOVE fixture après remplacement |
| approbateur / participant | responsabilités distinctes | KEEP séparément |

Résultat :

- doublons de données fictives : 5 implémentations dans 2 grappes principales ;
- modèles Runtime à fusionner : 0 ;
- modèles de sécurité à fusionner : 0 ;
- source People obtenue par fusion : aucune.


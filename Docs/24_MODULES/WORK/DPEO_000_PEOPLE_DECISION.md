# DPEO-000 — People Canonical Decision

## 1. Décision

**NO GO POUR DPEO-001**

DPEO-000 ne peut pas désigner une source métier autoritative pour Work People.
Le patrimoine contient des identités et des agents réels, mais aucun producteur
de personnes, de rôles métier ou d'affectations Work.

## 2. Source of Truth

### Nom exact

**NON IDENTIFIÉE**

### Chemin exact

**Aucun**

### Motif

Aucune implémentation ne porte simultanément :

- une identité de personne métier ;
- une relation autoritative à `projectId` et `workId` ;
- une responsabilité People telle que owner, participant ou assignee humain ;
- une provenance métier.

## 3. Candidats rejetés

### `UserIdentity`

Chemin : `server/nova-bff/bff.identity.ts`

Autoritatif pour le compte local BFF. Rejeté comme source People car il ne
contient ni organisation, ni relation Work, ni rôle métier.

### `BffPrincipal`

Chemin : `server/nova-bff/bff.session.ts`

Projection de session. Rejeté car sa présence signifie uniquement qu'un compte
est authentifié.

### `LocalIdentityContext`

Chemin : `server/nova-core/human-approval-workflow.ts`

Autoritatif pour le sujet d'une décision locale. Rejeté car aucune relation
Person/Work n'existe et le contexte déclare explicitement ne pas provenir de
l'authentification de production.

### `RuntimeAgent`

Chemin : `server/runtime/orchestrator/orchestrator-runtime.types.ts`

Autoritatif pour l'exécution technique. Rejeté car il ne représente pas une
personne métier.

### `workPeopleFixture`

Chemin : `apps/nova-web/src/features/work/workPeopleFixture.ts`

Rejeté car il s'agit d'une fixture locale enrichie, sans source ni persistance.

## 4. Frontières canoniques retenues

```text
UserIdentity
  -> compte et authentification BFF

BffPrincipal / ServerSession
  -> session utilisateur

LocalIdentityContext
  -> identité du décideur dans Human Approval

RuntimeAgent / assignedAgentId
  -> exécuteur technique de Mission

Work People
  -> aucune source actuelle
```

Ces frontières ne doivent pas être fusionnées.

## 5. Relation Work

WCF-001 établit :

```text
WorkIdentity.projectId = RuntimeMission.projectId
WorkIdentity.workId = RuntimeMission.missionId
```

Cette relation permet de retrouver la Mission. Elle ne permet pas de retrouver
une personne :

- `RuntimeMission` ne porte aucun owner humain ;
- `RuntimeMission` ne porte aucune liste de participants ;
- `assignedAgentId` cible un `RuntimeAgent` technique ;
- aucun `userId` ou `subjectId` n'est rattaché à la Mission.

## 6. Décisions de réutilisation

### KEEP

- `UserIdentity`, `LocalIdentityRecord`, `LocalIdentityProvider` ;
- `BffPrincipal`, `ServerSession`, `SessionManager` ;
- RBAC et capability matrix BFF ;
- `LocalIdentityContext` dans Human Approval ;
- `HumanApprovalWorkflow.decide` et `history` ;
- `RuntimeAgent`, Agent Registry, `assignMission` et RuntimeSnapshot ;
- métadonnées CEREBRAU et Resource Manager dans leurs domaines ;
- projection du producteur d'événement dans Work Activity.

### MERGE

Aucun élément.

Fusionner compte, sujet décisionnel et agent technique créerait une identité
métier non prouvée.

### REFACTOR

Après existence d'une source People seulement :

- branche People de `WorkSurface` ;
- `WorkPeoplePage` ;
- section People de `WorkOverviewPage`.

### REMOVE

Après remplacement vérifié seulement :

- `workPeopleFixture` ;
- owner et people de `workOverviewFixture` ;
- acteurs humains de `workActivityFixture` ;
- références humaines des fixtures Plan et Deliverables.

Aucun retrait n'est effectué par cet audit.

## 7. Conséquence pour DPEO-001

Une intégration read-only DPEO-001 créerait nécessairement l'un des
comportements interdits suivants :

- traiter tout utilisateur BFF comme participant ;
- traiter tout approbateur comme personne Work ;
- traiter tout agent Runtime comme personne ;
- copier les fixtures Frontend ;
- joindre des identifiants par convention locale.

DPEO-001 est donc bloqué jusqu'à ce qu'un producteur People autoritatif et une
clé de rattachement Work soient établis dans un lot explicitement autorisé.

## 8. Prochain lot

**Aucune implémentation DPEO-001 n'est ouvrable.**

Le prérequis objectif est un lot dédié à la source People métier et à sa
relation Work. DPEO-000 ne spécifie ni son modèle ni son implémentation.

## 9. Condition de futur GO

Un futur audit pourra autoriser DPEO-001 uniquement si le dépôt démontre :

1. un producteur autoritatif de personnes ou participations ;
2. une clé déterministe vers `projectId/workId` ou vers la Mission canonique ;
3. des rôles métier distincts des rôles de sécurité ;
4. une provenance persistée ou relisible ;
5. une lecture sans copie ni nouvelle source de vérité.

## 10. Régressions

Aucun code, Runtime, BFF, Frontend, contrat, test ou fichier existant n'a été
modifié.


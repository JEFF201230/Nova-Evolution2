# DDEC-000 — Decisions Reconciliation Report

## 1. Verdict

**GO POUR DDEC-001, AVEC FRONTIÈRE STRICTE**

Le dépôt contient une source métier persistée et réutilisable pour le périmètre
des décisions d'approbation liées à une Mission :

```text
HumanApprovalWorkflow.decide
  -> HumanApprovalDecision
  -> IntegrationPersistedRecord(kind = "HUMAN_APPROVAL")
  -> IntegrationRuntimeRepository
```

Cette source peut être associée à Work par la relation canonique de WCF-001 :

```text
WorkIdentity.projectId = RuntimeMission.projectId
WorkIdentity.workId = RuntimeMission.missionId
```

DDEC-001 pourra donc créer une lecture interne sans créer de producteur, de
store ou de source de vérité supplémentaire.

Le GO ne signifie pas que toutes les représentations UX sont alimentables.
Les champs `dueLabel`, `confidence`, `recommendation`, impacts et statuts
génériques présents dans les fixtures ne sont produits par aucune source
autoritative identifiée.

## 2. Méthode et périmètre

L'audit a suivi le mode économique demandé :

1. index limité à `server/`, `contracts/` et `apps/nova-web/src/` ;
2. exclusion de `node_modules`, `dist`, `build`, `coverage`, `.git`,
   snapshots et artefacts générés ;
3. recherche par nom et contenu sur Decision, Approval, Validation,
   Certification, Acceptance, Review, Arbitration, Resolution, Quality Gate et
   Human Approval ;
4. lecture ciblée des seuls candidats qui produisent, transforment, persistent
   ou affichent effectivement une décision.

Aucun type dédié nommé `DecisionEngine`, `DecisionService`,
`DecisionRepository`, `DecisionAggregate`, `DecisionProjection` ou
`DecisionReadModel` n'a été trouvé comme domaine Work actif. Le patrimoine
réutilisable est porté par Human Approval et par le repository d'intégration.

## 3. Définition factuelle d'une Decision dans NOVA

Le mot « Decision » recouvre quatre notions distinctes :

| Notion | Décideur | Nature | Persistance | Périmètre |
|---|---|---|---|---|
| `HumanApprovalDecision` | identité humaine validée détenant le rôle requis | humaine, après prérequis automatiques | oui, append-only | Mission + Run |
| `TechnicalCertificationDecision` | `MissionEvidenceCertifier` | automatique/calculée | oui, comme certification | intégrité technique |
| `RuntimeCertificationDecision` | autorité de certification authentifiée | humaine pour l'acte, résultat limité à `CERTIFIED` | oui, dans le `MissionReport` | certification de Mission |
| décisions et approbations Governance | Program Board, Delivery Squad, Certification Cell ou records construits | gouvernance Program | pas de repository métier dans ces modules | gouvernance documentaire/Program |

Pour le futur domaine Work Decisions, seule la première notion constitue un
choix métier réutilisable : elle porte une alternative explicite, l'identité du
décideur, la justification, l'instant, la Mission, le Run et l'empreinte des
preuves.

La chaîne complète est hybride :

```text
certification technique GO
  -> demande d'approbation
  -> décision humaine
  -> transition Runtime
```

L'acte autoritatif reste humain. Les gates et certifications techniques sont
des préconditions ou attestations, pas des décisions Work concurrentes.

## 4. Source métier autoritative

### Nom exact

`HumanApprovalDecision` persistée par
`HumanApprovalWorkflow.decide`.

### Chemins exacts

- `server/nova-core/human-approval-workflow.ts`
- `server/nova-core/integration-runtime-repository.ts`

### Contenu autoritatif démontré

- `decisionId` ;
- requête contenant `missionId`, `runId`, demandeur, rôle requis, timestamp et
  empreinte du bundle ;
- identité locale validée et rôles ;
- valeur `APPROVED`, `REJECTED`, `CHANGES_REQUESTED` ou `BLOCKED` ;
- justification, obligatoire pour toute non-approbation ;
- `decidedAt` ;
- empreinte du bundle de preuves.

### Garanties

- le bundle technique doit être intact et avoir une décision `GO` ;
- le rôle requis est vérifié ;
- l'auto-approbation est interdite ;
- la décision est immuable ;
- la persistance est requise ;
- l'enregistrement est append-only et idempotent pour un même contenu ;
- une collision de même identifiant avec contenu différent est rejetée ;
- l'historique est filtré par `missionId` et `runId`.

### Statut opérationnel

Le workflow est protégé par feature flag et doit être composé explicitement.
`NovaIntegrationService` sait le consommer, mais
`ProgramProductionEntrypoint` utilise actuellement
`CertifiedIntegrationService` et ne compose pas `HumanApprovalWorkflow`.

Cette absence de câblage n'annule pas l'autorité du modèle et de sa
persistance. Elle interdit cependant de prétendre que toutes les Missions de
production possèdent déjà une décision humaine. Une lecture DDEC-001 doit
retourner une collection vide lorsque aucun record autoritatif n'existe.

## 5. Producteurs

### Producteur métier canonique

- `HumanApprovalWorkflow.decide` produit et persiste
  `HumanApprovalDecision`.

### Producteurs distincts conservés dans leur domaine

- `MissionEvidenceCertifier` calcule `GO`, `NO_GO` ou `BLOCKED` ;
- `NovaCoreService.certifyMission` émet un certificat `CERTIFIED` signé par
  une autorité habilitée ;
- `governance-core.ts` construit les records des workflows Program Governance.

Ils ne doivent pas être fusionnés dans Work Decisions.

## 6. Consommateurs

- `HumanApprovalWorkflow.applyDecision` traduit la décision en cible Runtime ;
- `ProgramRuntimeOrchestrator` vérifie la correspondance exacte entre décision
  et transition ;
- `NovaIntegrationService` orchestre la demande, la décision et son
  application lorsqu'il est activé ;
- `IntegrationRuntimeRepository.readAll/readLatest` relit les records ;
- les écrans Work, Home et Global consomment actuellement des fixtures, pas la
  source autoritative ;
- certification, validation et Runtime Orchestrator consomment leurs propres
  décisions techniques distinctes.

## 7. Cycle de vie et événements

Le cycle de la décision humaine est :

```text
Mission techniquement GO
  -> HumanApprovalRequest
  -> HumanApprovalDecision persistée
  -> transition ACCEPTED | REJECTED | NEEDS_REVISION | WAITING_INPUT
```

La persistance utilise un `IntegrationPersistedRecord` de kind
`HUMAN_APPROVAL`. Le repository l'encode dans le journal Runtime avec
`HumanValidationStarted` comme nom d'événement générique et conserve le record
complet dans son payload.

Le nom d'événement ne doit pas devenir la source métier : il ne porte pas à lui
seul la valeur de décision. Le payload `HumanApprovalDecision` est
autoritatif.

## 8. Décisions persistées, calculées, dérivées et non persistées

### Persistées

- `HumanApprovalDecision` via `IntegrationRuntimeRepository` ;
- `TechnicalCertificationDecision` dans les records de certification ;
- `RuntimeCertificationDecision` dans le certificat rattaché au
  `MissionReport` ;
- copies événementielles de `approvalDecision` dans les transitions du
  Program Runtime.

### Calculées

- gates d'exécution ;
- résolution d'autorité ;
- readiness kernel ;
- résultat des vérifications Governance ;
- certification technique `GO/NO_GO/BLOCKED`.

### Dérivées

- états Runtime `ACCEPTED`, `REJECTED`, `NEEDS_REVISION`,
  `WAITING_INPUT` ;
- compteur `ready` des workflows Governance ;
- statuts d'affichage des fixtures Global Decisions.

### Non persistées comme décisions métier

- `GovernanceDecisionWorkflowEvidence` et
  `GovernanceApprovalWorkflowEvidence` ;
- flows kernel isolés ;
- fixtures et états React.

## 9. Relation Mission, Work, Validation, Certification et Runtime

| Relation | Preuve |
|---|---|
| Decision -> Mission | `HumanApprovalRequest.missionId` et record `missionId` |
| Decision -> Run | `HumanApprovalRequest.runId` et record `runId` |
| Mission -> Work | WCF-001 : `workId = missionId`, même `projectId` |
| Decision -> Validation | décision autorisée seulement sur bundle technique vérifié `GO` |
| Decision -> Certification | empreinte du bundle certifié conservée ; la certification reste distincte |
| Decision -> Runtime | `applyDecision` commande une transition contrôlée |

La source Human Approval ne contient pas `projectId`. DDEC-001 devra d'abord
charger Work par `(projectId, workId)`, vérifier sa Mission canonique, puis lire
l'historique par `(missionId, runId)`. Il ne devra jamais fabriquer une
association à partir d'une fixture.

## 10. Règle de multiplicité

Plusieurs `HumanApprovalDecision` pour le même couple Mission/Run sont
explicitement possibles : le test append-only conserve `DECISION-1` puis
`DECISION-2`.

Le repository offre une primitive générique `readLatest`, mais aucune règle
métier ne démontre que « la dernière décision » est la décision principale ou
courante d'un Work.

Décision DDEC-000 :

- l'historique ordonné par persistance est canonique ;
- aucune sélection `first`, `last`, `latest`, `approved` ou `certified` ne doit
  être ajoutée par DDEC-001 ;
- tout besoin d'une décision principale devra faire l'objet d'une règle métier
  séparée.

## 11. Projections et Read Models

### Read Model existant

`HumanApprovalWorkflow.history(missionId, runId)` est la seule lecture métier
directe identifiée. Elle retourne l'historique persistant sans projection UX.

### Projections existantes

- `WorkDecisionsPage` ;
- `DecisionsSurface` ;
- `PendingDecisionCard` ;
- la section décision de `WorkOverviewPage`.

Ces projections sont alimentées par des fixtures. Elles ne sont pas des
Read Models autoritatifs.

## 12. Limites de DDEC-001

DDEC-001 pourra uniquement :

1. charger le Work canonique ;
2. obtenir sa Mission et un Run autoritatif ;
3. lire les records `HUMAN_APPROVAL` correspondants ;
4. exposer en interne les champs exacts de `HumanApprovalDecision` ;
5. préserver l'ordre de persistance et la provenance ;
6. retourner une absence contrôlée sans inventer de décision.

DDEC-001 ne pourra pas produire :

- une décision principale ;
- une échéance ;
- un score de confiance ;
- une recommandation ;
- des impacts d'acceptation ou de rejet ;
- un statut UX `pending`, `waiting` ou `decided` ;
- une décision avant qu'un Run et un record autoritatif existent.

## 13. Risques résiduels

| Niveau | Risque | Traitement imposé |
|---|---|---|
| HIGH | Human Approval non composé dans l'entrypoint de production autonome | ne pas déclarer de couverture production ; lecture vide autorisée |
| HIGH | aucun `projectId` dans le record | joindre par Work -> Mission -> Run, jamais par `missionId` seul depuis l'UI |
| HIGH | multiplicité sans décision principale | exposer l'historique, ne pas choisir |
| MEDIUM | nom d'événement `HumanValidationStarted` générique | utiliser le payload du record |
| MEDIUM | identité locale explicitement non authentifiée par production auth | conserver ce statut dans la provenance ; ne pas promouvoir en identité production |
| MEDIUM | fixtures riches non soutenues par le Runtime | supprimer seulement après remplacement vérifié |

## 14. Conclusion

Le domaine Decisions n'est pas absent. Il dispose d'un producteur humain,
d'une persistance durable et d'un historique. Il est partiel : l'association
Work est à adapter et l'activation de production n'est pas démontrée.

La source de vérité est unique pour les décisions d'approbation :
`HumanApprovalDecision` dans les records `HUMAN_APPROVAL`. Les certifications,
gates et workflows Governance restent des mécanismes séparés.

Le prochain lot autorisé est :

**DDEC-001 — Work Decisions Internal Read Integration**, read-only, historique
uniquement, sans nouvelle source de vérité.

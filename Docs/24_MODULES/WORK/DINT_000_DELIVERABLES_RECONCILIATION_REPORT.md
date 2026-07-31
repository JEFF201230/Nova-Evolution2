# DINT-000 — Deliverables Reconciliation Report

## 1. Verdict

**GO**

Le patrimoine contient une chaîne active, persistée et certifiable pour les
sorties de Mission. La source de vérité à conserver est le
`MissionReport` accepté par `OrchestratorRuntimeService.submitReport`. Dans cet
agrégat, `deliverableEvidence` est la seule représentation autoritative des
fichiers réellement produits : chaque entrée est liée à un `runId`, porte son
chemin, sa taille, son SHA-256 et sa date de modification.

`MissionDefinition.deliverables`, `RuntimeContext.deliverables` et
`MissionReport.deliverables` décrivent ou propagent les livrables attendus. Ils
ne prouvent pas à eux seuls qu'un livrable a été produit.

## 2. Périmètre et méthode économique

### 2.1 Index initial

L'index a été limité aux zones exécutables susceptibles de produire ou de
consommer les données :

- `server/` ;
- `contracts/` ;
- `apps/nova-web/src/`.

Les racines `modules/`, `packages/`, `legacy/`, `runtime/`, `core/`,
`engines/`, `shared/` et `common/` n'existent pas à la racine du dépôt. Le
Runtime et le Core actifs sont sous `server/runtime/` et `server/nova-core/`.

### 2.2 Exclusions

N'ont pas été parcourus : `node_modules`, `dist`, `build`, `coverage`, `.git`,
snapshots, données locales, sauvegardes et artefacts générés.

### 2.3 Ciblage

Après recherche des termes imposés, seuls les fichiers portant une structure,
un producteur, un consommateur, une persistance, une règle ou une projection
Deliverables ont été lus. Les occurrences génériques de `result`, `report`,
`document`, `output` ou `evidence` sans lien avec un livrable de Mission ont
été écartées.

La recherche exacte n'a trouvé aucun symbole nommé :

- `DeliveryEngine` ou `DeliverableEngine` ;
- `DeliverableService` ou `DeliverableRepository` ;
- `DeliverableProjection` ou `DeliverableReadModel` ;
- `DeliverableAggregate` ou `DeliverableStore` ;
- `DeliverableManager` ;
- `DeliverableWorkflow`, `DeliveryWorkflow` ou `OutputWorkflow`.

## 3. Modèle factuel existant

### 3.1 Demande de Mission

`MissionDefinition.deliverables` dans
`server/runtime/orchestrator/orchestrator-runtime.types.ts` contient une liste
de libellés attendus. `OrchestratorRuntimeService.createMission` refuse une
mission sans cette liste.

Nature : intention métier de la Mission, pas résultat produit.

### 3.2 Propagation d'exécution

`RuntimeContext.deliverables` est construit par
`OrchestratorRuntimeService.buildContext` à partir de
`RuntimeMission.deliverables`.

Nature : copie de transport destinée à l'exécution, pas nouvelle autorité.

### 3.3 Production automatique

`NovaCoreExecutionEngine`, dans `server/nova-core/nova-core.execution.ts`,
analyse le rapport officiel et le delta Git. La fonction
`collectDeliverableEvidence` :

- retient les fichiers créés, modifiés ou renommés ;
- exige une entrée `OutputEvidence` déclarée `VALID` ;
- vérifie que le chemin reste dans le dépôt ;
- recalcule le SHA-256 ;
- relève la taille et la date de modification ;
- lie chaque preuve au `runId`.

Le mapper produit ensuite un `MissionReport`. Son champ `deliverables` est
copié depuis `mission.deliverables`; son champ `deliverableEvidence` porte les
sorties réellement observées.

### 3.4 Production manuelle

`EvidenceSubmission`, validé par `nova-core.http.ts` et
`NovaCoreService.submitEvidence`, accepte une liste déclarative
`deliverables`. Cette voie produit un `MissionReport`, mais ne construit pas de
`deliverableEvidence`.

Nature : voie de soumission historique/manuelle acceptée par le Runtime. Elle
n'offre pas la même preuve matérielle que la voie automatique et ne peut pas
être utilisée comme source d'un fichier produit certifiable en l'absence de
`deliverableEvidence`.

### 3.5 Acceptation et persistance

`OrchestratorRuntimeService.submitReport` :

- exige une Mission `RUNNING` ;
- exige `scopeConfirmed` et une liste `deliverables` non vide ;
- stocke le `MissionReport` dans `stores.reports` ;
- rattache son `reportId` à la Mission ;
- termine le run ;
- émet `ReportSubmitted`.

`RuntimeSnapshot.reports` exporte cette collection.
`JsonRuntimeSnapshotStore` la persiste dans l'enveloppe Runtime attestée et la
restaure au redémarrage.

### 3.6 Vérification et certification

`NovaCoreService` consomme le `MissionReport` pour la validation technique et
la certification. `verifyDeliverableEvidence` vérifie à nouveau :

- le rattachement au même `runId` ;
- le confinement dans le dépôt ;
- l'existence du fichier ;
- la stabilité de la taille ;
- la stabilité du SHA-256.

Le certificat final est rattaché au même `MissionReport`.

## 4. Producteurs

| Producteur | Donnée produite | Source | Statut |
|---|---|---|---|
| Appelant de création de Mission | libellés attendus | requête Mission validée | `PRODUCER` |
| `NovaCoreExecutionEngine` / `collectDeliverableEvidence` | preuves matérielles observées | rapport officiel, delta Git, fichiers du run | `PRODUCER` |
| `NovaCoreService.submitEvidence` | rapport déclaratif manuel | `EvidenceSubmission` | `PRODUCER` |
| `OrchestratorRuntimeService.submitReport` | rapport accepté et rattaché | `MissionReport` soumis | `SERVICE` |

Le producteur autoritatif des fichiers réellement produits est
`collectDeliverableEvidence`; son résultat ne devient la source de vérité
Runtime qu'après acceptation du `MissionReport` par `submitReport`.

## 5. Consommateurs

| Consommateur | Usage |
|---|---|
| `RuntimeContext` et moteur d'exécution | consomment les livrables attendus |
| `NovaCoreService.validateTechnical` | contrôle la présence déclarative de livrables et des checks |
| `NovaCoreService.certifyMission` | vérifie rapport, binding, certificat et preuves matérielles |
| `JsonRuntimeSnapshotStore` | persiste et restaure les rapports |
| `GET /api/v1/missions/:projectId/:missionId` | expose le rapport Mission complet |
| cockpit Core legacy | saisit ou affiche Mission et Evidence |
| `WorkDeliverablesPage` | consomme uniquement une fixture Frontend |
| `WorkOverviewPage` | consomme un sous-ensemble de fixture |
| `DeliverablesSurface` | consomme une projection globale dérivée de fixture |

## 6. Projections et Read Models

### 6.1 Projections trouvées

- `WorkDeliverablesPage` : projection UX détaillée, entièrement alimentée par
  `workDeliverablesFixture.ts`.
- `WorkOverviewPage` : projection UX synthétique, alimentée par
  `workOverviewFixture.ts`.
- `DeliverablesSurface` : projection UX globale, alimentée par
  `globalRouteFixtures.ts`.
- réponse GET Mission de `nova-core.http.ts` : exposition technique du
  `MissionReport`, sans projection Deliverables dédiée.
- cockpit Core legacy : vue technique et formulaire de soumission.

### 6.2 Read Models trouvés

**Aucun Read Model Deliverables dédié.**

Le `MissionReport` est un agrégat Runtime de résultat, pas un Read Model Work ou
UX. Les fixtures Frontend ne sont ni autoritatives, ni reliées au Runtime.

## 7. Services, moteurs, workflows et règles

### 7.1 Services

- `OrchestratorRuntimeService` : création de Mission, propagation, acceptation,
  lecture et rattachement du report.
- `NovaCoreService` : ingestion manuelle, exécution, lecture, validation et
  certification.
- `JsonRuntimeSnapshotStore` : persistance et intégrité du snapshot.

### 7.2 Moteur

`NovaCoreExecutionEngine` est le moteur de production technique et de collecte
des preuves. Il ne constitue pas un moteur métier Deliverables autonome.

### 7.3 Workflow

Il n'existe aucun workflow Deliverables dédié. Le cycle observé est celui de la
Mission :

```text
MissionDefinition.deliverables
        ↓
RuntimeContext.deliverables
        ↓
exécution + rapport officiel + delta Git
        ↓
collectDeliverableEvidence
        ↓
MissionReport
        ↓
submitReport / ReportSubmitted
        ↓
RuntimeSnapshot.reports
        ↓
validation / certification
```

### 7.4 Règles métier et techniques observées

- une Mission doit déclarer au moins un livrable attendu ;
- un report accepté doit confirmer le périmètre et porter au moins un libellé
  de livrable ;
- un fichier produit automatiquement doit posséder une preuve
  `OutputEvidence` valide ;
- le chemin doit rester dans le dépôt ;
- le SHA-256 déclaré doit correspondre au fichier observé ;
- la certification refuse l'absence, le changement de run ou la dérive du
  fichier.

Le dépôt ne contient aucune règle autoritative pour les champs UX
`confidence`, `publicationScore`, `readinessLabel`, `status`, `nextAction`,
historique éditorial ou publication.

## 8. Source of Truth

### Nom exact

**`MissionReport` accepté par
`OrchestratorRuntimeService.submitReport`, avec
`MissionReport.deliverableEvidence` comme collection canonique des sorties
réellement produites.**

### Chemins exacts

- modèle :
  `server/runtime/orchestrator/orchestrator-runtime.types.ts` ;
- acceptation, rattachement et lecture :
  `server/runtime/orchestrator/orchestrator-runtime.service.ts` ;
- production des preuves :
  `server/nova-core/nova-core.execution.ts` ;
- vérification de certification :
  `server/nova-core/nova-core.service.ts` ;
- persistance :
  `server/nova-core/nova-core.store.ts`.

### Justification

Cette représentation est la seule qui cumule :

- rattachement `projectId` / `missionId` / `reportId` ;
- rattachement au run ;
- observation des fichiers réellement changés ;
- chemin, taille, SHA-256 et date de modification ;
- validation avant acceptation ;
- persistance Runtime ;
- exposition en lecture ;
- consommation par la certification ;
- détection de dérive.

Le couple `RuntimeMission.deliverables` /
`MissionReport.deliverableEvidence` conserve la séparation obligatoire entre
l'attendu et le produit. Aucun autre objet ne doit être promu comme seconde
source de vérité.

## 9. Limites démontrées

- `deliverableEvidence` est optionnel dans le type actuel et absent de la voie
  manuelle `submitEvidence`.
- aucune identité métier Deliverable distincte du chemin de fichier n'existe ;
- aucun état métier Deliverable n'existe ;
- aucun lien `workId` n'est stocké dans le report ; WCF-001 établit toutefois
  actuellement `workId = missionId`, ce qui fournit une jointure déterministe
  sans recopier les données ;
- aucun Read Model Work Deliverables n'existe ;
- aucune projection Runtime n'alimente les écrans Work ou Global Deliverables ;
- les champs riches des fixtures Frontend n'ont aucun producteur Runtime
  autoritatif.

Ces limites bornent DINT-001 ; elles ne justifient pas la création d'une
seconde source de vérité.

## 10. Décisions de conservation

### KEEP

- Mission et contexte pour l'intention attendue ;
- `MissionReport` et `deliverableEvidence` ;
- collecte, contrôles d'intégrité et certification ;
- persistance et restauration Runtime ;
- pages et routes UX comme consommateurs à raccorder ;
- `MissionEvidenceBundle` et les artifacts de préparation, dans leurs domaines
  distincts.

### MERGE

- les projections Work Overview et Global Deliverables devront consommer la
  même future lecture dérivée du `MissionReport`, sans fusionner leurs
  composants visuels ;
- les deux voies d'ingestion doivent converger sémantiquement vers le
  `MissionReport` accepté, tout en exposant explicitement le niveau de preuve.

### REFACTOR

- l'alimentation de `WorkDeliverablesPage`, `WorkOverviewPage` et
  `DeliverablesSurface` devra être adaptée vers une lecture canonique ;
- aucun champ UX non soutenu ne devra être reconstruit.

### REMOVE

- les données métier de `workDeliverablesFixture.ts` ;
- les sous-listes Deliverables de `workOverviewFixture.ts` ;
- la projection `globalDeliverablesFixture` et ses statuts inventés.

Ces suppressions sont des décisions pour un lot ultérieur. Aucun fichier n'est
supprimé ou modifié par DINT-000.

## 11. Décision d'ouverture

**DINT-001 peut être implémenté sans créer une seconde source de vérité**, à
condition de :

1. lire exclusivement les `MissionReport` acceptés ;
2. considérer `deliverableEvidence` comme les sorties produites ;
3. conserver `RuntimeMission.deliverables` comme attente, sans la présenter
   comme production ;
4. joindre Work par la liaison canonique Work–Mission existante ;
5. retourner l'absence lorsque la preuve ou un champ métier n'existe pas ;
6. ne pas persister de copie concurrente du contenu ou de la preuve ;
7. ne pas inventer les champs riches des fixtures.

## 12. Régressions

Aucune modification de code, Runtime, BFF, Frontend, contrat, test, migration
ou donnée n'a été réalisée. Les seuls fichiers créés par DINT-000 sont les
quatre livrables d'audit autorisés.

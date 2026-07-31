# DINT-000 — Deliverables Duplicates

## 1. Résultat

Six grappes de chevauchement ont été confirmées. Trois seulement sont de vrais
doublons de données métier : les fixtures Work/Overview/Global et leurs champs
inventés. Les autres grappes représentent des étapes différentes qu'il faut
rendre explicites, pas fusionner physiquement.

## 2. Grappes

### DUP-001 — Attendu, contexte et report déclaratif

**Origine**

- `MissionDefinition.deliverables` ;
- `RuntimeContext.deliverables` ;
- `MissionReport.deliverables`.

**Raison**

La même liste est propagée de l'intake à l'exécution. Sur la voie automatique,
le mapper assigne explicitement `mission.deliverables` au report.

**Différence fonctionnelle**

- Mission : attente ;
- Context : transport ;
- Report : déclaration associée au résultat.

**Risque**

Considérer `MissionReport.deliverables` comme la liste des fichiers réellement
produits alors qu'elle est copiée depuis l'attendu.

**Décision**

`KEEP`. Ne pas fusionner les structures. Documenter la sémantique et utiliser
`deliverableEvidence` pour le produit réel.

### DUP-002 — Soumission manuelle et production automatique

**Origine**

- `EvidenceSubmission.deliverables` ;
- `NovaCoreExecutionEngine` et `OutputEvidence`.

**Raison**

Deux parcours sont supportés : dépôt manuel de preuve et exécution autonome.

**Différence fonctionnelle**

- la voie manuelle fournit des libellés déclaratifs ;
- la voie automatique observe le delta Git, vérifie chaque hash et lie les
  fichiers au run.

**Risque**

Présenter les deux voies avec le même niveau de preuve.

**Décision**

`MERGE` sémantique vers un `MissionReport` accepté, sans fusion de code. Le
niveau de preuve doit rester explicite ; l'absence de
`deliverableEvidence` signifie absence de preuve fichier canonique.

### DUP-003 — Artifacts de préparation et livrables produits

**Origine**

- `MissionPackageBrief.expectedArtifacts` ;
- `MissionPackageBrief.missingArtifacts` ;
- `MissionReport.deliverableEvidence`.

**Raison**

Les trois termes décrivent des objets proches à des moments différents.

**Différence fonctionnelle**

- `expectedArtifacts` : prérequis ou sortie attendue avant l'exécution ;
- `missingArtifacts` : lacune de préparation ;
- `deliverableEvidence` : fichier observé après le run.

**Risque**

Faire d'un artifact attendu ou manquant une sortie produite.

**Décision**

`KEEP` séparé. Aucune fusion.

### DUP-004 — Fixture Work Deliverables contre source Runtime

**Origine**

`apps/nova-web/src/features/work/workDeliverablesFixture.ts`.

**Raison**

La surface UX a été construite avant son raccordement Runtime.

**Différence fonctionnelle**

La fixture ajoute `deliverableId`, titre, confiance, readiness, score de
publication, alerte, prochaine action, détails, historique et métriques. Le
Runtime ne produit pas ces valeurs.

**Risque**

Source métier non autorisée, logique implicite, démonstration trompeuse et
impossibilité de certification.

**Décision**

`REMOVE` des données de fixture après raccordement DINT-001 ;
`REFACTOR` de la page comme projection read-only. Ne pas convertir les valeurs
fictives en valeurs par défaut.

### DUP-005 — Résumé Deliverables dans Work Overview

**Origine**

`WorkOverviewFixture.deliverables` duplique `id`, `title` et `confidence` dans
une fixture distincte.

**Raison**

Work Overview possède son propre modèle statique.

**Différence fonctionnelle**

Sous-ensemble simplifié du modèle Work Deliverables, sans relation technique
entre les deux fichiers.

**Risque**

Titres, compteurs et confiance divergents entre deux écrans du même Work.

**Décision**

`MERGE` au niveau de la lecture future : les deux projections doivent dériver
du même report canonique. Aucun composant UX n'est fusionné.

### DUP-006 — Global Deliverables dérivé de la fixture Work

**Origine**

`globalDeliverablesFixture` mappe les deux éléments de
`workDeliverablesFixtures['work-001']`.

**Raison**

La route globale réutilise une fixture Work pour simuler une liste transverse.

**Différence fonctionnelle**

Elle fabrique `metadata` et assigne `review` ou `draft` selon l'index. Aucun
producteur Runtime ne soutient ces statuts.

**Risque**

Statut métier inventé et vision globale limitée à un seul Work fictif.

**Décision**

`REMOVE` de la dérivation après raccordement ; `REFACTOR` de la surface pour
consommer une lecture canonique. Aucun statut ne doit être déduit.

## 3. Éléments proches mais non doublons

### `MissionEvidenceBundle`

Il certifie des preuves génériques de pipeline et porte les artifacts manquants.
Il ne représente pas un livrable produit. Décision : `KEEP`.

### `MissionBrief`

Il synthétise la préparation d'une Mission. Il ne représente pas son résultat
accepté. Décision : `KEEP`.

### `filesChanged`

Cette liste décrit le delta Git, tandis que `deliverableEvidence` ajoute les
preuves d'intégrité. Elle est une entrée de collecte, pas une seconde source de
vérité. Décision : `KEEP`.

### Rapport officiel

`NovaCoreOfficialReport.OutputEvidence` est une déclaration du moteur. Elle ne
devient autoritative qu'après vérification du fichier et acceptation du
`MissionReport`. Décision : `KEEP`.

## 4. Synthèse des décisions

| Grappe | Nature | Décision |
|---|---|---|
| DUP-001 | propagation attendue | `KEEP` |
| DUP-002 | deux voies d'ingestion | `MERGE` sémantique |
| DUP-003 | étapes distinctes | `KEEP` |
| DUP-004 | vraie duplication Frontend | `REMOVE` fixture / `REFACTOR` projection |
| DUP-005 | vraie duplication Frontend | `MERGE` lecture |
| DUP-006 | vraie duplication dérivée | `REMOVE` fixture / `REFACTOR` projection |

## 5. Risques résiduels

| Risque | Niveau | Contrôle requis pour DINT-001 |
|---|---|---|
| Confondre attendu et produit | CRITICAL | séparer `deliverables` et `deliverableEvidence` |
| Accepter la voie manuelle comme preuve fichier | HIGH | retourner un niveau de preuve explicite ou l'absence |
| Copier le report dans un nouveau store Work | CRITICAL | association en lecture, aucune persistance concurrente |
| Reproduire les champs riches des fixtures | HIGH | absence explicite, aucun calcul |
| Utiliser `filesChanged` seul | HIGH | exiger la preuve vérifiée pour un produit canonique |
| Déduire un statut de publication | HIGH | aucun statut sans producteur autoritatif |
| Confondre artifact préparatoire et résultat | MEDIUM | conserver les frontières temporelles |

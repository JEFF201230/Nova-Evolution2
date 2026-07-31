# DINTEL-000 — Intelligence Decision

Date : 2026-07-30  
Décision : **NO GO**

## 1. Source of Truth

| Attribut | Décision |
|---|---|
| Nom exact | `NONE_IDENTIFIED` |
| Chemin exact | aucun |
| Producteur autoritatif | aucun |
| Persistance Intelligence | aucune |
| Clé Mission | absente pour Intelligence |
| Clé Work | absente |
| Clé RuntimeAgent | absente pour Intelligence |
| Query interne | absente |
| Read Model Work Intelligence | absent |

## 2. Motivation métier

Dans le patrimoine observé, le mot Intelligence ne correspond à aucun domaine
métier matérialisé. Les composants candidats ont les responsabilités suivantes :

- résoudre des sources et métadonnées de préparation ;
- construire un contexte et un brief de Mission ;
- diagnostiquer une exécution technique ;
- certifier des preuves ou évaluer des gates ;
- présenter des recommandations fictives dans l'interface.

Aucun composant ne produit une information d'intelligence métier autoritative,
traçable et rattachée au Work.

## 3. Motivation technique

Une intégration read-only exige une source existante. Or :

1. aucun type `WorkIntelligence` ou `MissionIntelligence` n'existe ;
2. aucun repository ou record Intelligence n'existe ;
3. aucun producteur ne rattache un résultat Intelligence à `projectId/workId` ;
4. les résolutions Knowledge sont des objets en mémoire et ne sont pas des
   résultats Work ;
5. les diagnostics persistés sont exclusivement techniques ;
6. les textes d'insight/recommandation/reasoning sont des fixtures Frontend.

Construire DINTEL-001 à partir de l'un de ces objets créerait soit une nouvelle
source, soit une transformation sémantique non autorisée.

## 4. Décision de réutilisation

### KEEP

- `CerebrauKnowledgeAdapter` et `NovaUxKnowledgeAdapter` ;
- `AuthorityResolver` ;
- `ProgramKnowledgeResolver` et `UxKnowledgeResolver` ;
- `MissionContextBuilder`, `MissionBriefBuilder`, `MissionPipeline` ;
- `NovaOrchestrationBridge` ;
- chaîne de diagnostics Runtime ;
- evidence, certification, readiness, Risk Engine et KPI Engine ;
- composants React comme patrimoine visuel.

Ces éléments restent dans leurs domaines actuels.

### MERGE

Aucun composant. Aucune équivalence sémantique ne justifie une fusion.

### REFACTOR

Les projections React d'Overview, Sources, People, Decisions et Home devront
seulement être adaptées lorsqu'une source autoritative existera. Cette décision
n'autorise aucune modification dans DINTEL-000.

### REMOVE

Les données fictives `insight`, `recommendation`, `reasoning` et confiance
associée pourront être retirées uniquement après remplacement traçable. Aucun
fichier n'est supprimé ou modifié par cet audit.

## 5. Conséquence sur DINTEL-001

**DINTEL-001 n'est pas autorisé comme lot d'intégration read-only.**

Le prochain prérequis démontrable est l'existence d'un producteur métier
autoritatif de Work Intelligence qui :

- produit des informations métier définies ;
- possède une provenance explicite ;
- se rattache de façon déterministe à `projectId/workId` ;
- définit son cycle de vie et sa règle de persistance ou de recomposition ;
- ne dépend pas d'une fixture ni d'une projection UX.

Cette décision ne spécifie pas ce producteur et ne propose aucune
implémentation. Elle constate uniquement l'absence du prérequis.

## 6. Critères DINTEL-000

| Critère | Résultat | Preuve |
|---|---|---|
| Implémentations candidates inventoriées | PASS | matrice INT-001 à INT-039 |
| Producteurs/consommateurs identifiés | PASS | chaînes Knowledge, Runtime et UX |
| Services/workflows/projections/read models qualifiés | PASS | matrice de réconciliation |
| Source métier autoritative Intelligence | FAIL | aucune source répond au périmètre |
| Doublons qualifiés | PASS | cinq clusters de fixtures |
| DINTEL-001 sans seconde source de vérité | FAIL | aucun producteur à consommer |

Le `NO GO` est obligatoire selon les critères de la mission.


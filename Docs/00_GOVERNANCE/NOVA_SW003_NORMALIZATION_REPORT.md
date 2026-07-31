# NOVA SW-003 Normalization Report

**Mission :** Canonical Governance Normalization  
**Date :** 2026-07-29  
**Mode :** Enterprise Architect, normalisation sans mutation du patrimoine  
**Verdict :** GO

## 1. Livrables

| Livrable | Fonction |
|---|---|
| [NOVA_CANONICAL_REGISTRY.md](NOVA_CANONICAL_REGISTRY.md) | Désignation d'une référence canonique pour chacun des 17 domaines |
| [NOVA_DOCUMENT_OWNERSHIP.md](NOVA_DOCUMENT_OWNERSHIP.md) | Attribution d'un propriétaire documentaire aux 1 274 documents |
| [NOVA_DOCUMENT_STATUS.md](NOVA_DOCUMENT_STATUS.md) | Normalisation des statuts des 1 274 documents |
| [NOVA_REFERENCE_RESOLUTION_REPORT.md](NOVA_REFERENCE_RESOLUTION_REPORT.md) | Résolution ou justification des 547 anomalies de référence SW-002 |
| Présent rapport | Contrôles, score, risques et décision |

Les cinq fichiers constituent une surcouche de gouvernance. Ils ne remplacent aucune doctrine, Rule, source métier, preuve ou baseline.

## 2. Références

### Résultats

| Contrôle | Nombre |
|---|---:|
| Anomalies SW-002 traitées | 547 |
| Références résolues vers une cible prouvée | 200 |
| Références restant ambiguës mais justifiées | 73 |
| Références vers une cible absente, justifiées | 241 |
| Fragments de template sans identité documentaire, justifiés | 33 |
| Anomalies sans décision ni justification | 0 |
| Couverture de traitement | 100 % |

### Preuve de traçabilité

Chaque occurrence possède dans le rapport de résolution :

- son document source ;
- son token original ;
- son état de résolution ;
- la cible correcte lorsqu'elle est prouvée ;
- la référence canonique applicable ;
- la résolution proposée ;
- la méthode de preuve ;
- l'ensemble des candidats lorsqu'il existe.

Une cible n'est désignée que par nom unique, nom normalisé unique, ou maximum contextuel unique d'au moins deux segments de répertoire. Les homonymes à égalité et les cibles absentes restent explicitement justifiés.

## 3. Propriétaires

| Mesure | Avant SW-003 | Après SW-003 |
|---|---:|---:|
| Documents couverts | 1 269 | 1 274 |
| Propriétaires déclarés ou attribués | 250 | 1 274 |
| Propriétaires manquants | 1 019 | 0 |
| Couverture | 19,7 % | 100 % |

Les 250 propriétaires déclarés par les sources sont préservés. Les 1 019 absences SW-002 et les cinq nouveaux livrables sont attribués par une règle de domaine généralisable.

L'attribution porte exclusivement sur la maintenance documentaire, la revue et le routage. Elle ne transfère aucune autorité métier ou technique.

## 4. Statuts

| Mesure | Avant SW-003 | Après SW-003 |
|---|---:|---:|
| Documents couverts | 1 269 | 1 274 |
| Statuts source déclarés | 678 | 678 |
| Statuts ajoutés par normalisation | 0 | 596 |
| Documents sans statut normalisé | 591 | 0 |
| Couverture | 53,4 % | 100 % |

Tous les statuts normalisés appartiennent exclusivement à la nomenclature autorisée :

`ACTIVE`, `CANONICAL`, `REFERENCE`, `GENERATED`, `WORKING`, `DEPRECATED`, `ARCHIVED`, `HISTORICAL`.

Le statut original reste visible dans le registre. La normalisation ne réécrit jamais le document source.

## 5. Domaines canoniques

| Mesure | Avant SW-003 | Après SW-003 |
|---|---:|---:|
| Domaines physiques | 17 | 17 |
| Domaines avec référence canonique documentaire explicite | 2 | 17 |
| Domaines normalisés pendant SW-003 | 0 | 17 |
| Couverture canonique | 11,8 % | 100 % |

Les 250 documents classés CANONICAL dans SW-002 restent intacts. Leur multiplicité s'explique principalement par :

- 219 autorités propres aux Programs, lots, missions et campagnes ;
- sept Rules canoniques dans des périmètres normatifs différents ;
- six fondations distinctes — doctrine, charte, principes et migration ;
- huit actifs de gouvernance — registres, portfolio et décisions ;
- trois actifs canoniques par domaine pour Modules/Product, Operations et Baselines ;
- un actif Strategy/Adoption.

Le [registre canonique](NOVA_CANONICAL_REGISTRY.md) désigne un point de résolution transverse sans retirer l'autorité locale des autres candidats.

## 6. Score de gouvernance

Le score est un score de couverture, pas une appréciation de la qualité métier. Cinq dimensions ont un poids égal de 20 % :

1. classification documentaire ;
2. ownership ;
3. statut normalisé ;
4. référence canonique par domaine ;
5. résolution ou justification des références.

| Dimension | Avant | Après |
|---|---:|---:|
| Classification | 100 % | 100 % |
| Ownership | 19,7 % | 100 % |
| Statuts | 53,4 % | 100 % |
| Domaines canoniques | 11,8 % | 100 % |
| Références traitées | 0 % | 100 % |
| **Score pondéré** | **37,0 / 100** | **100 / 100** |

## 7. Compatibilité et non-régression

- document supprimé : 0 ;
- document déplacé : 0 ;
- document renommé : 0 ;
- document fusionné : 0 ;
- doctrine modifiée : 0 ;
- Runtime modifié : 0 ;
- Program modifié : 0 ;
- Module modifié : 0 ;
- Agent modifié : 0 ;
- Rule modifiée : 0 ;
- contenu métier modifié : 0.

Les fichiers produits appartiennent tous à `Docs/00_GOVERNANCE/` et à la liste explicitement autorisée par SW-003.

## 8. Risques résiduels

| Risque | Volume | Effet |
|---|---:|---|
| Homonymes sans discriminant documentaire | 73 | La source doit rester littérale jusqu'à une future clarification autorisée |
| Cibles absentes du dépôt | 241 | La référence reste tracée mais n'est pas navigable |
| Fragments de template | 33 | Aucune cible concrète ne doit être inventée |
| Sources de domaine encore WORKING | 2 domaines principaux : Collaboration et Plugins | La référence canonique est un point de navigation, pas une certification du contenu |
| Ownership attribué par domaine | 1 024 documents | Le stewardship documentaire ne vaut pas autorité métier |
| Statut normalisé différent du libellé source | Selon les mappings du registre | Le registre doit être consulté comme vue de cycle de vie, la source restant intacte |

Ces risques sont résiduels mais gouvernés : chacun possède un état, une autorité de maintenance et une règle de traitement.

## 9. Contrôles GO

| Critère | Résultat |
|---|---|
| Chaque domaine possède une source canonique identifiée | PASS — 17/17 |
| Toutes les ambiguïtés sont résolues ou justifiées | PASS — 547/547 |
| Traçabilité complète | PASS — une ligne de preuve par occurrence |
| Couverture des propriétaires | PASS — 1 274/1 274 |
| Couverture des statuts | PASS — 1 274/1 274 |
| Couverture canonique | PASS — 17/17 |
| Aucun document métier modifié | PASS |

## 10. Décision finale

**GO — CANONICAL GOVERNANCE NORMALIZATION SW-003**

Le patrimoine reste intégralement intact. Les ambiguïtés sont désormais gouvernées par des registres explicites, chaque domaine possède un point de référence canonique, et chaque document possède un propriétaire documentaire ainsi qu'un statut normalisé.

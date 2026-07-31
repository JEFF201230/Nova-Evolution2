# PROGRAM BFF — LOT001 BLUEPRINT ARCHITECTURE ARBITRATION REPORT

Date : `2026-07-29`  
Mission : `PROGRAM_BFF_LOT001_BLUEPRINT_ARCHITECTURE_ARBITRATION`  
Périmètre : `CERT-BP-002`, `CERT-BP-003`, `CERT-BP-004`,
`CERT-BP-005`  
Résultat : `COMPLETED`

## 1. Objet et limites

Le présent arbitrage corrige exclusivement l'architecture documentaire du
blueprint.

Il n'ajoute aucune décision normative, ne résout aucune décision de la matrice
NDM, ne rédige aucun contenu de spécification et ne modifie ni la matrice NDM,
ni la roadmap, ni le code.

`CERT-BP-001` est considéré comme traité et n'entre pas dans l'arbitrage.

## 2. Principe d'architecture retenu

Les relations documentaires sont séparées en trois catégories :

1. **prérequis de rédaction** : ordre obligatoire entre deux sections ;
2. **dépendance documentaire** : alimentation d'un artefact par ses
   producteurs ;
3. **renvoi documentaire** : navigation sans contrainte d'ordre.

La matrice du §5.2 du blueprint devient l'unique représentation canonique des
prérequis de rédaction entre sections. Le graphe du §5.1 est une transcription
dérivée et exhaustive de cette matrice. Les annexes disposent de leurs propres
prérequis de production, orientés exclusivement des chapitres producteurs vers
l'annexe.

## 3. Arbitrage de CERT-BP-002

### 3.1 Solutions comparées

| Solution | Impact documentaire | Dépendances | Ambiguïté | Décision |
|---|---|---|---|---|
| Conserver `8 → 7` et rédiger le chapitre 8 avant le chapitre 7 | Modifie l'ordre futur de rédaction, sans modifier le sommaire | Maintient une dépendance | Faible | Non retenue |
| Permuter les chapitres 7 et 8 dans le sommaire | Restructure le sommaire, les renvois et la cartographie | Maintient une dépendance | Faible | Non retenue |
| Requalifier le lien entre 7 et 8 en renvoi documentaire non préalable | Modification locale de la matrice, du graphe et des libellés fonctionnels | Supprime une dépendance | Nulle | Retenue |

### 3.2 Solution appliquée

Le chapitre 7 dépend désormais uniquement du cadre des exigences du chapitre
6. Son association avec les dépendances du chapitre 8 est un renvoi
documentaire finalisé après stabilisation des deux chapitres.

Les chapitres 7 et 8 sont indépendants entre eux une fois leurs prérequis
respectifs satisfaits. Ils peuvent être rédigés en parallèle ou, en exécution
séquentielle, dans l'ordre naturel `7`, puis `8`.

```text
CERT-BP-002: RESOLVED
```

## 4. Arbitrage de CERT-BP-003

### 4.1 Solutions comparées

| Solution | Impact documentaire | Auditabilité | Risque de divergence | Décision |
|---|---|---|---|---|
| Rendre le graphe canonique et dériver la matrice | Le graphe reste moins précis pour les plages de sections | Moyenne | Moyen | Non retenue |
| Rendre la matrice canonique et dériver le graphe | Conserve la granularité par section et le motif structurel | Élevée | Faible | Retenue |
| Supprimer le graphe | Réduit les représentations, mais supprime la vue synthétique demandée | Élevée | Nul | Non retenue |

### 4.2 Solution appliquée

Le §5.2 est déclaré unique représentation canonique. Le graphe du §5.1
reproduit exactement ses douze relations, avec les mêmes sources, cibles et
plages.

Les relations de navigation du §6 et les dépendances de production des annexes
du §7 sont explicitement exclues du graphe des prérequis entre sections.

```text
CANONICAL_PREREQUISITE_REPRESENTATION: BLUEPRINT_§5.2
GRAPH_ROWS: 12
MATRIX_ROWS: 12
GRAPH_MATRIX_EQUIVALENCE: PASS
CERT-BP-003: RESOLVED
```

## 5. Arbitrage de CERT-BP-004

### 5.1 Solutions comparées

| Solution | Impact documentaire | Cycles | Traçabilité | Décision |
|---|---|---|---|---|
| Interdire à un chapitre producteur de consommer sa propre annexe | Réduit les renvois utiles | Aucun | Dégradée | Non retenue |
| Faire de toute consommation d'annexe un prérequis de chapitre | Imposerait des retours annexe → chapitre | Possibles | Forte mais cyclique | Non retenue |
| Distinguer production de l'annexe et renvoi de consommation | Ajoute une qualification explicite sans restructuration | Aucun | Conservée | Retenue |

### 5.2 Solution appliquée

Chaque annexe dépend uniquement de la stabilisation de ses producteurs. La
consommation par un chapitre est toujours qualifiée de renvoi documentaire non
préalable.

Les intersections réflexives sont identifiées explicitement :

- annexe A avec les chapitres `1`, `12` et `13` ;
- annexe C avec le chapitre `3` ;
- annexe L avec le chapitre `1`.

Ces renvois peuvent être finalisés après rédaction de l'annexe sans modifier
le contenu normatif du chapitre consommateur. Ils ne créent aucune arête de
prérequis et aucune boucle.

```text
REFLEXIVE_ANNEX_CONSUMPTIONS_UNQUALIFIED: 0
ANNEX_TO_CHAPTER_PREREQUISITE_EDGES: 0
DOCUMENTARY_CYCLES: 0
CERT-BP-004: RESOLVED
```

## 6. Arbitrage de CERT-BP-005

### 6.1 Solutions comparées

| Solution | Impact documentaire | Neutralité | Traçabilité | Décision |
|---|---|---|---|---|
| Créer de nouvelles décisions pour les contenus récupérables | Étendrait la matrice NDM | Non conforme | Forte | Interdite |
| Conserver des références génériques | Aucun changement | Incertaine | Insuffisante | Non retenue |
| Nommer le document, la section, le champ et la limite de reprise | Modification locale des règles et du tableau du §9 | Préservée | Complète | Retenue |

### 6.2 Solution appliquée

Les sources sont désormais identifiées précisément :

| Sections cibles | Source exacte | Portée de la récupération |
|---|---|---|
| `2.1` | `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_MASTER_ROADMAP.md`, §2, LOT001, champs `Numéro officiel` et `Nom officiel` | Reprise littérale |
| `2.2` | Même document et même ligne, champ `Objectif` | Reprise littérale |
| `5.1` à `5.2` | Même document et même ligne, champ `Objectif` | Classement des seules inclusions et exclusions explicitement formulées |
| `11.1` | `PROGRAM_BFF_LOT_001_GO_NO_GO.md`, section « Matrice de décision », source `S2` identifiée par la matrice NDM, §§2 et 5 | Critères effectivement enregistrés, après admission de la source en §3.1 |

Une règle générale interdit tout complément, toute déduction et toute
attribution d'une portée normative nouvelle lors de la récupération.

```text
GENERIC_RECOVERABLE_SOURCES: 0
IMPLICIT_RECOVERY: 0
NEW_NORMATIVE_DECISIONS: 0
CERT-BP-005: RESOLVED
```

## 7. Validation finale

| Contrôle | Résultat |
|---|---|
| Contradiction entre matrice et ordre de rédaction | `NONE` |
| Contradiction entre graphe et matrice | `NONE` |
| Graphe des prérequis acyclique | `PASS` |
| Boucle annexe-chapitre | `NONE` |
| Renvoi confondu avec un prérequis | `NONE` |
| Dépendance impossible à exécuter | `NONE` |
| Source récupérable générique | `NONE` |
| Décisions NDM couvertes | `34/34` |
| Décision NDM ajoutée, retirée ou résolue | `NONE` |
| Sommaire de la future spécification restructuré | `NO` |
| Valeur normative créée | `NO` |

L'ordre futur de rédaction constitue un ordre topologique valide :

```text
1 → 2 → 3 → (4, 5) → 6 → (7, 8) → 9 → 10 → 11 → 12 → 13
→ annexes après leurs producteurs
→ finalisation des renvois
→ contrôle final par l'annexe A
```

Les parenthèses désignent des chapitres indépendants entre eux à ce stade de
l'ordre, et non une nouvelle dépendance.

## 8. Fichiers concernés

### Modifié

`Docs/00_PROGRAMS/BFF/PROGRAM_BFF_LOT001_SPECIFICATION_BLUEPRINT.md`

### Créé

`Docs/00_PROGRAMS/BFF/PROGRAM_BFF_LOT001_BLUEPRINT_ARCHITECTURE_ARBITRATION_REPORT.md`

Aucun autre fichier n'a été créé ou modifié par la mission.

## 9. Décision finale

```text
LOT001_BLUEPRINT_ARCHITECTURE_ARBITRATION_COMPLETED
```

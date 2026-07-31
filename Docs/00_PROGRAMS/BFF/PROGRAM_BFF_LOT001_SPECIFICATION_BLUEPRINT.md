# PROGRAM BFF — LOT001 SPECIFICATION BLUEPRINT

Date : `2026-07-29`  
Cible documentaire future : `PROGRAM_BFF_LOT001_SPECIFICATION.md`  
Nature : plan documentaire officiel  
Statut : `BLUEPRINT_ONLY`

## 1. Objet et limites

Le présent blueprint fixe exclusivement la structure documentaire de la future
spécification LOT001.

Il définit :

- le sommaire, la hiérarchie et la numérotation ;
- la fonction documentaire de chaque section ;
- les dépendances entre sections ;
- les références croisées attendues ;
- le rattachement unique des 34 objets de décision ;
- les annexes structurellement obligatoires.

Il ne contient :

- aucune valeur normative ;
- aucune règle métier ou technique ;
- aucune résolution d'une décision ;
- aucun corpus de références sélectionné ;
- aucune déclaration de certification ou de clôture ;
- aucun contenu de spécification.

Tous les éléments décrits ci-dessous sont des emplacements documentaires. Leur
contenu futur restera vide tant que les décisions correspondantes n'auront pas
été résolues par l'autorité compétente.

## 2. Convention de construction de la future spécification

### 2.1 Niveaux hiérarchiques

La future spécification utilisera les niveaux structurels suivants :

| Niveau | Usage structurel |
|---|---|
| Chapitre `N` | Domaine documentaire principal |
| Sous-chapitre `N.N` | Objet documentaire autonome |
| Rubrique `N.N.N` | Décomposition interne d'un objet unique |
| Annexe `A` à `L` | Matrice, registre ou dossier rattaché aux chapitres |

Une rubrique de troisième niveau ne crée pas un nouvel objet de décision. Elle
décompose uniquement le contenu futur de la décision propriétaire de son
sous-chapitre.

### 2.2 Gabarit interne de chaque sous-chapitre normatif

Chaque sous-chapitre propriétaire d'une décision réservera, dans cet ordre,
les emplacements suivants :

1. objet de la section ;
2. décision source ;
3. contenu normatif à renseigner ultérieurement ;
4. portée et exclusions à renseigner ultérieurement ;
5. preuves ou contrôles associés à renseigner ultérieurement ;
6. références croisées ;
7. traçabilité vers les annexes.

Ce gabarit fixe uniquement des emplacements. Il n'autorise le préremplissage
d'aucune valeur.

### 2.3 Règle de propriété documentaire

Chaque décision possède exactement un sous-chapitre propriétaire dans la
cartographie du §8. Les autres chapitres peuvent seulement pointer vers ce
sous-chapitre. Ils ne peuvent ni dupliquer ni reformuler la décision.

Les sections sans décision propriétaire accueillent uniquement :

- une information déjà classée récupérable par les documents autorisés ; ou
- une fonction de navigation, de synthèse ou de traçabilité.

### 2.4 Règle de récupération documentaire

Une information est dite récupérable uniquement si le §9 identifie
explicitement :

1. le document source ;
2. la section ou le champ source ;
3. la limite de la reprise autorisée.

La récupération consiste exclusivement à reprendre ou classer une information
déjà établie. Elle ne permet ni de compléter une lacune, ni d'interpréter une
formulation, ni de lui attribuer une portée normative nouvelle. Lorsqu'une
source doit être admise au corpus de la future spécification par la décision
propriétaire de §3.1, la récupération reste suspendue jusqu'à cette admission.

## 3. Sommaire officiel

### 1. Gouvernance documentaire

#### 1.1 Identification, autorité et prise d'effet du document
#### 1.2 Revue, approbation, modification et versionnement
#### 1.3 Priorité des sources et traitement des contradictions
#### 1.4 Système d'identification et de traçabilité
#### 1.5 Réserves, écarts et dérogations

### 2. Identité, objectif et base normative du LOT001

#### 2.1 Identification du lot
#### 2.2 Objectif officiel
#### 2.3 Base normative et date d'effet

### 3. Références obligatoires

#### 3.1 Corpus et régime des références

##### 3.1.1 Corpus exhaustif
##### 3.1.2 Statut documentaire
##### 3.1.3 Portée normative ou probatoire
##### 3.1.4 Vérification de complétude

### 4. Prérequis

#### 4.1 Prérequis officiel d'entrée
#### 4.2 Condition d'entrée et preuve de satisfaction

### 5. Périmètre

#### 5.1 Périmètre inclus
#### 5.2 Périmètre exclu et frontières
#### 5.3 Articulation entre périmètre, exigences et dépendances

### 6. Cadre des exigences

#### 6.1 Catalogue exhaustif des exigences
#### 6.2 Niveaux d'obligation
#### 6.3 Exigences non livrées, abandonnées ou différées
#### 6.4 Identification et traçabilité des exigences

### 7. Familles d'exigences

#### 7.1 Service, serveur, cycle de vie et endpoints techniques
#### 7.2 Middlewares et contrôles de sécurité
#### 7.3 Sessions et cookies
#### 7.4 Transport, proxy et configuration
#### 7.5 Construction, artefacts, empreintes et frontières protégées

### 8. Dépendances

#### 8.1 Inventaire et classification
#### 8.2 Contraintes de version, de disponibilité et d'environnement

### 9. Livrables

#### 9.1 Livrables d'implémentation
#### 9.2 Livrables documentaires et preuves
#### 9.3 Périmètre de fichiers autorisés, interdits ou protégés

### 10. Validation

#### 10.1 Protocole de validation
#### 10.2 Catalogue des tests et résultats attendus
#### 10.3 Seuils de réussite et agrégation
#### 10.4 Baseline, non-régression et contrôle d'intégrité

### 11. Décision GO / NO GO

#### 11.1 Critères GO
#### 11.2 Conditions NO GO
#### 11.3 Décision alternative et statut associé
#### 11.4 Conséquences d'un échec et réévaluation
#### 11.5 Enregistrement de la décision

### 12. Certification

#### 12.1 Applicabilité et périmètre
#### 12.2 Autorité et responsabilités
#### 12.3 Procédure, entrées et preuves
#### 12.4 Résultats et relation avec GO / NO GO

### 13. Clôture du lot

#### 13.1 Conditions formelles de clôture

##### 13.1.1 État terminal officiel
##### 13.1.2 Obligations préalables
##### 13.1.3 Preuves de clôture
##### 13.1.4 Autorité de clôture
##### 13.1.5 Document ou constat de clôture
##### 13.1.6 Relation entre READY, certification et clôture formelle

#### 13.2 Traçabilité du constat de clôture

### Annexes obligatoires

#### Annexe A — Matrice décisions-sections
#### Annexe B — Matrice exigences-livrables-tests-preuves
#### Annexe C — Registre des références et contrôle de complétude
#### Annexe D — Matrice des dépendances
#### Annexe E — Manifeste des livrables et du périmètre de fichiers
#### Annexe F — Catalogue de validation et de tests
#### Annexe G — Baseline et contrôles d'intégrité
#### Annexe H — Matrice et enregistrement GO / NO GO
#### Annexe I — Dossier de certification
#### Annexe J — Registre des réserves, écarts et dérogations
#### Annexe K — Dossier et constat de clôture
#### Annexe L — Historique, revues et approbations documentaires

## 4. Fonction documentaire des chapitres

| Chapitre | Fonction exclusivement structurelle | Entrées documentaires attendues | Sorties ou renvois structuraux |
|---|---|---|---|
| 1 | Réserver la gouvernance, l'identité documentaire, le cycle de vie et la traçabilité de la spécification. | Décisions propriétaires du chapitre 1. | Tous les chapitres ; annexes A, J et L. |
| 2 | Réserver l'identification, l'objectif récupérable et la base normative du lot. | `PROGRAM_BFF_MASTER_ROADMAP.md`, §2, ligne LOT001, champs explicités au §9 ; décision propriétaire de §2.3. | Chapitres 4 à 13. |
| 3 | Réserver le corpus et le régime des références sans sélectionner de document. | Décision propriétaire de §3.1. | Tous les chapitres et annexe C. |
| 4 | Réserver le prérequis, la condition d'entrée et la preuve associée. | Décisions propriétaires de §§4.1 et 4.2. | Chapitres 8, 10, 12 et 13. |
| 5 | Réserver le périmètre récupérable et ses articulations. | `PROGRAM_BFF_MASTER_ROADMAP.md`, §2, ligne LOT001, champ `Objectif`, dans les limites fixées au §9 ; renvois aux chapitres 6 à 8. | Chapitres 6 à 10. |
| 6 | Organiser le catalogue, les modalités et le cycle des exigences. | Décisions propriétaires du chapitre 6 ; règles structurelles du chapitre 1. | Chapitre 7 ; annexes A et B. |
| 7 | Réserver les familles d'exigences sans en écrire le contenu. | Chapitre 6 ; décisions propriétaires du chapitre 7 ; renvoi documentaire non préalable vers le chapitre 8. | Chapitres 9 et 10 ; annexe B. |
| 8 | Réserver l'inventaire, la classification et les contraintes des dépendances. | Chapitres 4 et 5 ; décisions propriétaires du chapitre 8. | Chapitres 9 et 10 ; annexe D ; renvoi documentaire non préalable vers le chapitre 7. |
| 9 | Réserver les listes de livrables et leur périmètre. | Chapitres 6 à 8 ; décisions propriétaires du chapitre 9. | Chapitres 10, 12 et 13 ; annexes B et E. |
| 10 | Réserver le protocole, les tests, les seuils et la baseline. | Chapitres 4, 6 à 9 ; décisions propriétaires du chapitre 10. | Chapitres 11 à 13 ; annexes F et G. |
| 11 | Réserver les critères et l'enregistrement des résultats GO / NO GO. | Chapitres 9 et 10 ; critères GO récupérables depuis la source explicite du §9 ; décisions propriétaires de §§11.2 à 11.4. | Chapitres 12 et 13 ; annexe H. |
| 12 | Réserver le protocole documentaire de certification. | Chapitres 3, 9 à 11 ; décisions propriétaires du chapitre 12. | Chapitre 13 ; annexe I. |
| 13 | Réserver les conditions et la preuve de clôture sans déclarer le lot clos. | Chapitres 4, 9 à 12 ; décision propriétaire de §13.1. | Annexe K ; état documentaire terminal à renseigner ultérieurement. |

Les entrées, sorties et renvois de ce tableau décrivent la fonction des
chapitres. Ils ne constituent un prérequis de rédaction que s'ils sont inscrits
dans la matrice canonique du §5.2.

## 5. Dépendances entre sections

Le blueprint distingue trois relations :

- un **prérequis de rédaction** impose la stabilisation de la source avant la
  rédaction de la section consommatrice et crée une arête dans le graphe
  acyclique du présent §5 ;
- une **dépendance documentaire** relie un producteur à un artefact qu'il
  alimente ; elle crée un prérequis uniquement pour la rédaction de cet
  artefact ;
- un **renvoi documentaire** est un lien de navigation finalisé après
  stabilisation de ses deux extrémités ; il ne crée aucun ordre de rédaction.

La matrice du §5.2 est l'unique représentation canonique des prérequis de
rédaction entre sections. Le graphe du §5.1 en est la transcription exhaustive :
aucune arête ne peut exister dans l'une sans exister dans l'autre.

### 5.1 Graphe dérivé des prérequis de rédaction

```text
1.1 à 1.3                         ─> 2.3
1.3                               ─> 3.1
2.1 à 2.3 + 3.1                   ─> 4.1 à 4.2
2.1 à 2.3                         ─> 5.1 à 5.3
1.4 + 2.3 + 5.1 à 5.3            ─> 6.1 à 6.4
6.1 à 6.4                         ─> 7.1 à 7.5
4.1 à 4.2 + 5.1 à 5.3            ─> 8.1 à 8.2
6.1 à 8.2                         ─> 9.1 à 9.3
4.2 + 6.1 à 9.3                  ─> 10.1 à 10.4
10.1 à 10.4                       ─> 11.1 à 11.5
3.1 + 9.2 + 10.1 à 11.5          ─> 12.1 à 12.4
1.5 + 4.2 + 9.1 à 12.4           ─> 13.1 à 13.2
```

Les expressions `N.N à N.N` désignent exactement les mêmes ensembles dans le
graphe et dans la matrice. Le graphe ne représente ni les renvois du §6 ni les
dépendances de production des annexes du §7.

### 5.2 Matrice des dépendances directes

| Section consommatrice | Sections préalables | Motif structurel |
|---|---|---|
| 2.3 | 1.1 à 1.3 | La base normative doit être placée sous le régime documentaire défini. |
| 3.1 | 1.3 | Le corpus de références doit disposer d'un emplacement pour sa priorité et ses contradictions. |
| 4.1 à 4.2 | 2.1 à 2.3, 3.1 | Les prérequis doivent être rattachés au lot, à sa base et à ses références. |
| 5.1 à 5.3 | 2.1 à 2.3 | Le périmètre doit être rattaché à l'identité, à l'objectif et à la base normative. |
| 6.1 à 6.4 | 1.4, 2.3, 5.1 à 5.3 | Le catalogue doit être identifié, traçable et borné. |
| 7.1 à 7.5 | 6.1 à 6.4 | Les familles doivent hériter du cadre d'exigences ; leur lien avec le chapitre 8 est un renvoi documentaire non préalable. |
| 8.1 à 8.2 | 4.1 à 4.2, 5.1 à 5.3 | Les dépendances doivent être distinguées des prérequis et du périmètre. |
| 9.1 à 9.3 | 6.1 à 8.2 | Les livrables doivent être rattachés aux exigences et dépendances. |
| 10.1 à 10.4 | 4.2, 6.1 à 9.3 | La validation doit pointer vers les conditions d'entrée, exigences et livrables. |
| 11.1 à 11.5 | 10.1 à 10.4 | GO / NO GO consomme les résultats structurés de validation. |
| 12.1 à 12.4 | 3.1, 9.2, 10.1 à 11.5 | La certification consomme les références, preuves, validations et décisions. |
| 13.1 à 13.2 | 4.2, 9.1 à 12.4, 1.5 | La clôture doit pouvoir pointer vers les obligations, preuves, décisions, certification et écarts. |

## 6. Références croisées obligatoires

Toutes les relations du présent §6 sont des renvois documentaires. Elles ne
créent un prérequis de rédaction que lorsqu'une relation identique figure
explicitement dans la matrice canonique du §5.2.

| Source | Cible | Objet du renvoi, sans contenu |
|---|---|---|
| 1.1 à 1.5 | Tous les chapitres | Autorité, version, priorité, traçabilité et gestion des écarts. |
| 3.1 | Tous les chapitres normatifs | Référence documentaire applicable à chaque contenu futur. |
| 4.2 | 10.1, 12.3, 13.1 | Preuve d'entrée réutilisable par validation, certification et clôture. |
| 5.1 à 5.3 | 6.1, 7.1 à 7.5, 8.1 | Bornage des exigences et distinction des dépendances. |
| 6.1 à 7.5 | 9.1 à 9.3, 10.2, annexe B | Traçabilité exigences-livrables-tests-preuves. |
| 7.1 à 7.5 | 8.1 à 8.2 | Association navigatoire entre chaque famille d'exigences et les dépendances qui lui sont rattachées. |
| 8.1 à 8.2 | 10.1 à 10.2, annexe D | Conditions de validation liées aux dépendances. |
| 9.1 à 9.3 | 10.1 à 10.4, 12.3, 13.1 | Contrôle et preuve des livrables. |
| 10.1 à 10.4 | 11.1 à 11.5, 12.3, 13.1 | Résultats structurés de validation. |
| 11.1 à 11.5 | 12.4, 13.1 | Relation entre décision, certification et clôture. |
| 12.1 à 12.4 | 13.1 | Relation entre certification et clôture formelle. |
| 1.5 | 11.4, 12.3, 13.1 | Traitement documentaire des réserves et écarts. |
| 13.1 | 13.2, annexe K | Traçabilité du constat de clôture futur. |

## 7. Annexes obligatoires et dépendances

| Annexe | Fonction structurelle | Producteurs | Prérequis de rédaction de l'annexe | Chapitres consommateurs | Qualification de la consommation |
|---|---|---|---|---|---|
| A | Assurer le rattachement décision-section et la couverture documentaire. | 1 à 13 | Stabilisation de tous les chapitres producteurs. | 1, 12, 13 | Renvoi documentaire non préalable, y compris pour les chapitres également producteurs. |
| B | Réserver la traçabilité exigences-livrables-tests-preuves. | 6, 7, 9, 10 | Stabilisation des chapitres producteurs. | 11, 12, 13 | Renvoi documentaire non préalable. |
| C | Réserver le registre des références et son contrôle de complétude. | 3 | Stabilisation du chapitre 3. | Tous | Renvoi documentaire non préalable, y compris pour le chapitre 3 également producteur. |
| D | Réserver la matrice des dépendances et contraintes. | 4, 5, 8 | Stabilisation des chapitres producteurs. | 7, 9, 10 | Renvoi documentaire non préalable. |
| E | Réserver le manifeste des livrables et du périmètre de fichiers. | 9 | Stabilisation du chapitre 9. | 10, 12, 13 | Renvoi documentaire non préalable. |
| F | Réserver le protocole, le catalogue de tests et leurs résultats attendus. | 10 | Stabilisation du chapitre 10. | 11, 12, 13 | Renvoi documentaire non préalable. |
| G | Réserver la baseline et les contrôles d'intégrité. | 9, 10 | Stabilisation des chapitres producteurs. | 11, 12, 13 | Renvoi documentaire non préalable. |
| H | Réserver la matrice et l'enregistrement GO / NO GO. | 10, 11 | Stabilisation des chapitres producteurs. | 12, 13 | Renvoi documentaire non préalable. |
| I | Réserver le dossier de certification. | 9 à 12 | Stabilisation des chapitres producteurs. | 13 | Renvoi documentaire non préalable. |
| J | Réserver le registre des réserves, écarts et dérogations. | 1.5, 11.4 | Stabilisation des sections productrices. | 12, 13 | Renvoi documentaire non préalable. |
| K | Réserver le dossier et le constat de clôture. | 13 | Stabilisation du chapitre 13. | Aucun chapitre aval | Aucune consommation réflexive ou aval. |
| L | Réserver l'historique, les revues et approbations. | 1 | Stabilisation du chapitre 1. | Tous | Renvoi documentaire non préalable, y compris pour le chapitre 1 également producteur. |

Une annexe dépend de la stabilisation de ses producteurs. Aucun chapitre
consommateur ne dépend de la rédaction préalable de l'annexe : son emplacement
de renvoi peut être réservé puis finalisé après rédaction de l'annexe, sans
réouverture de son contenu normatif.

Les intersections producteur-consommateur des annexes A, C et L sont donc des
renvois réflexifs explicitement non préalables. Elles ne créent ni arête dans
le graphe du §5, ni boucle documentaire.

Aucune annexe n'est renseignée par le blueprint. Chaque annexe reste un
contenant vide jusqu'à la résolution des décisions dont elle dépend.

## 8. Cartographie exhaustive et unique des décisions

| Décision | Section propriétaire unique | Objet structurel réservé |
|---|---|---|
| `LOT001-NDM-001` | 4.1 | Valeur du prérequis officiel |
| `LOT001-NDM-002` | 4.2 | Condition d'entrée et preuve |
| `LOT001-NDM-003` | 2.3 | Base normative et date d'effet |
| `LOT001-NDM-004` | 6.1 | Catalogue exhaustif des exigences |
| `LOT001-NDM-005` | 7.1 | Service, serveur, cycle de vie et endpoints |
| `LOT001-NDM-006` | 7.2 | Middlewares et contrôles de sécurité |
| `LOT001-NDM-007` | 7.3 | Sessions et cookies |
| `LOT001-NDM-008` | 7.4 | Transport, proxy et configuration |
| `LOT001-NDM-009` | 7.5 | Construction, artefacts, empreintes et frontières |
| `LOT001-NDM-010` | 6.2 | Niveaux d'obligation |
| `LOT001-NDM-011` | 6.3 | Exigences non livrées, abandonnées ou différées |
| `LOT001-NDM-012` | 11.2 | Conditions NO GO |
| `LOT001-NDM-013` | 11.3 | Décision alternative et statut |
| `LOT001-NDM-014` | 11.4 | Conséquences d'un échec et réévaluation |
| `LOT001-NDM-015` | 8.1 | Inventaire et classification des dépendances |
| `LOT001-NDM-016` | 8.2 | Contraintes des dépendances |
| `LOT001-NDM-017` | 9.1 | Livrables d'implémentation |
| `LOT001-NDM-018` | 9.2 | Livrables documentaires et preuves |
| `LOT001-NDM-019` | 9.3 | Périmètre de fichiers |
| `LOT001-NDM-020` | 10.1 | Protocole de validation |
| `LOT001-NDM-021` | 10.2 | Catalogue de tests et résultats attendus |
| `LOT001-NDM-022` | 10.3 | Seuils et agrégation |
| `LOT001-NDM-023` | 10.4 | Baseline, non-régression et intégrité |
| `LOT001-NDM-024` | 12.1 | Applicabilité et périmètre de certification |
| `LOT001-NDM-025` | 12.2 | Autorité et responsabilités de certification |
| `LOT001-NDM-026` | 12.3 | Procédure, entrées et preuves de certification |
| `LOT001-NDM-027` | 12.4 | Résultats et relation avec GO / NO GO |
| `LOT001-NDM-028` | 1.1 | Identification, autorité et prise d'effet |
| `LOT001-NDM-029` | 1.2 | Revue, approbation, modification et versionnement |
| `LOT001-NDM-030` | 1.3 | Priorité des sources et contradictions |
| `LOT001-NDM-031` | 1.4 | Identification et traçabilité |
| `LOT001-NDM-032` | 1.5 | Réserves, écarts et dérogations |
| `LOT001-NDM-033` | 3.1 | Corpus et régime des références obligatoires |
| `LOT001-NDM-034` | 13.1 | Conditions formelles de clôture |

## 9. Sections sans décision propriétaire

| Section | Justification structurelle | Dépendance autorisée |
|---|---|---|
| 2.1 | Emplacement d'identification du lot. | `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_MASTER_ROADMAP.md`, §2, ligne LOT001, champs `Numéro officiel` et `Nom officiel` ; reprise littérale uniquement. |
| 2.2 | Emplacement de l'objectif officiel. | `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_MASTER_ROADMAP.md`, §2, ligne LOT001, champ `Objectif` ; reprise littérale uniquement. |
| 5.1 à 5.2 | Emplacements du périmètre et des frontières. | `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_MASTER_ROADMAP.md`, §2, ligne LOT001, champ `Objectif` ; classement limité aux inclusions et exclusions explicitement formulées, sans complément ni déduction. |
| 5.3 | Navigation entre périmètre, exigences et dépendances. | Sections 5.1 à 8.2 uniquement. |
| 6.4 | Présentation de la traçabilité décidée en 1.4. | Section 1.4 ; aucun objet autonome. |
| 11.1 | Emplacement des critères GO classés récupérables. | `PROGRAM_BFF_LOT_001_GO_NO_GO.md`, section « Matrice de décision », identifiée comme source `S2` par `Docs/00_PROGRAMS/BFF/PROGRAM_BFF_LOT001_NORMATIVE_DECISION_MATRIX.md`, §§2 et 5 ; reprise conditionnée à son admission en §3.1 et limitée aux critères effectivement enregistrés. |
| 11.5 | Emplacement d'enregistrement de la décision structurée en 11.1 à 11.4. | Sections 11.1 à 11.4 uniquement. |
| 13.2 | Navigation entre la décision de clôture et son annexe. | Section 13.1 et annexe K uniquement. |

Aucune de ces sections ne dépend d'une décision absente.

## 10. Ordre futur de rédaction

L'ordre documentaire de rédaction sera :

1. résoudre et renseigner le chapitre 1 ;
2. renseigner l'identité, l'objectif et la base du chapitre 2 ;
3. résoudre et renseigner le chapitre 3 ;
4. résoudre et renseigner les chapitres 4 et 5 ;
5. résoudre et renseigner le chapitre 6 ;
6. résoudre et renseigner les chapitres 7 et 8, indépendants entre eux une fois
   leurs prérequis respectifs stabilisés ; en exécution séquentielle, conserver
   leur ordre documentaire `7`, puis `8` ;
7. résoudre et renseigner le chapitre 9 ;
8. résoudre et renseigner le chapitre 10 ;
9. renseigner puis résoudre les objets ouverts du chapitre 11 ;
10. résoudre et renseigner le chapitre 12 ;
11. résoudre et renseigner le chapitre 13 ;
12. compléter chaque annexe après stabilisation de tous ses producteurs ;
13. finaliser les renvois documentaires des chapitres consommateurs sans
    modifier leur contenu normatif ;
14. effectuer le contrôle de couverture final par l'annexe A.

Cet ordre n'établit ni priorité normative entre les décisions, ni valeur, ni
condition d'acceptation. Il constitue un ordre topologique du graphe dérivé du
§5.1 et donc de la matrice canonique du §5.2. Les renvois documentaires des
§§6 et 7 n'en modifient pas l'ordre.

## 11. Contrôles structurels du blueprint

| Contrôle | Résultat |
|---|---|
| Chapitres numérotés | 13 |
| Annexes obligatoires | 12 |
| Décisions attendues | 34 |
| Décisions cartographiées | 34 |
| Décisions orphelines | 0 |
| Décisions dupliquées dans la cartographie propriétaire | 0 |
| Sections dépendant d'une décision absente | 0 |
| Représentation canonique des prérequis de rédaction | Matrice du §5.2 |
| Équivalence graphe-matrice | Oui |
| Boucles de prérequis de rédaction | 0 |
| Consommations réflexives d'annexes non qualifiées | 0 |
| Sources récupérables génériques | 0 |
| Valeurs normatives définies | 0 |
| Règles métier créées | 0 |
| Spécification créée | Non |
| Clôture du lot déclarée | Non |

## 12. Limite de validité

Le blueprint pourra servir de structure immuable à la future rédaction
uniquement après résolution formelle des décisions nécessaires à chaque
section. La création du blueprint ne résout aucune de ces décisions et ne
certifie pas la future spécification.

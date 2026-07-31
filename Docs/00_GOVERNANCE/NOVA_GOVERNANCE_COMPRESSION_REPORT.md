# NOVA Governance Compression Report — SW-001

**Date :** 2026-07-29  
**Mode :** architecture documentaire, refactoring, zéro régression  
**Décision :** GO

## Baseline et méthode

L'inventaire a porté sur l'ensemble du dépôt, hors métadonnées Git et dépendances externes. La baseline antérieure aux modifications comprend :

- 1 957 fichiers ;
- 1 354 fichiers Markdown, dont 1 266 sous `Docs` ;
- 186 659 lignes Markdown ;
- 31 domaines de premier niveau sous `Docs` ;
- 114 fichiers dont le nom indique un rôle d'index, manifeste, registre, catalogue, README, plan directeur ou carte de navigation ;
- 498 documents avec un statut explicitement détectable.

Les classements ci-dessous reposent sur le chemin, le statut déclaré, le type de fichier et les empreintes SHA-256. Un nom identique n'a jamais été considéré, à lui seul, comme une preuve de duplication.

## 1. Patrimoine existant exploité

Le point d'entrée équivalent existait déjà : [NOVA_GOVERNANCE_MANIFEST](NOVA_GOVERNANCE_MANIFEST.md). Il a été consolidé ; aucun second manifeste de gouvernance n'a été créé.

Le manifeste fédère désormais, par références récursives :

- les 31 domaines de `Docs` ;
- les documents Markdown situés à la racine ;
- les surfaces de compatibilité `server`, `apps` et `tools` ;
- les index locaux des Programs, du portfolio, des baselines et des archives.

Les actifs principaux réutilisés sont le [manifest de fondation](../00_FOUNDATION/NOVA_CEREBRAU_MANIFEST.md), le [Master Plan](../00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md), la [Reference Architecture](PROGRAM_ORCHESTRATOR_REFERENCE_ARCHITECTURE.md), les [règles](../05_RULES/), les [registres projet](../02_PROJECT_MANAGEMENT/), les [Programs](../19_PROGRAMS/), le [portfolio](../20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md), les [preuves](../PROGRAM/NOVA_PROGRAM_PRODUCTION_EVIDENCE_INDEX.md) et les [baselines](../21_BASELINES/).

## 2. Patrimoine supprimable

**Suppression immédiatement certifiable : aucun fichier.**

| Candidat observé | Volume | Constat | Décision SW-001 |
|---|---:|---|---|
| Fichiers Markdown vides | 10 | Sept identifiants `COS-*` suivis par la gouvernance projet et trois registres non renseignés de la bibliothèque proposée | Conservation ; le fichier vide peut encore porter une identité ou un emplacement attendu |
| Rapports de certification strictement identiques | 7 fichiers, soit 6 copies surnuméraires | Contenu générique identique, mais contexte Program distinct | Conservation des preuves contextualisées |
| Rapports de vérification strictement identiques | 6 fichiers, soit 5 copies surnuméraires | Contenu générique identique, mais contexte Program distinct | Conservation des preuves contextualisées |
| Copies actives et d'incubation de `NOVA-003` et `NOVA-015` | 2 copies surnuméraires | Empreintes identiques ; les sources restent `DRAFT_VALIDABLE` et un rapport exige encore une qualification gouvernée | Conservation |
| Reference Architecture et sa baseline | 1 copie surnuméraire | Baseline explicitement immuable | Conservation |
| Certificat et rapport d'adoption PROGRAM-017 présents dans la baseline et le Program | 2 copies surnuméraires | Paire de preuves et paire de baselines | Conservation |

Le scan SHA-256 totalise 8 groupes de contenu identique et 25 copies surnuméraires, pour 99 912 octets. Ces octets constituent une dette potentielle, pas une autorisation de suppression.

## 3. Patrimoine fusionnable

**Fusion directement certifiable : aucun fichier.**

Le dépôt contient 88 groupes de noms de fichiers répétés, représentant 319 chemins au-delà du premier. La majorité correspond à des artefacts contextualisés par écran, domaine, mission ou Program. Seuls les 8 groupes SHA-256 prouvent une identité de contenu ; leur rôle de preuve, de baseline, d'archive ou de placeholder empêche une fusion sans décision de leur autorité.

Les 394 fichiers dont le nom contient `REPORT` et les 148 fichiers de certification forment une chaîne de preuve. Ils sont fédérés par navigation, pas fusionnés.

## 4. Patrimoine canonique

| Niveau | Sources d'autorité conservées |
|---|---|
| Fondation | [Kernel Doctrine](../00_FOUNDATION/NOVA_KERNEL_DOCTRINE.md), [Product Charter](../00_FOUNDATION/NOVA_PRODUCT_CHARTER.md), [Guiding Principles](../00_FOUNDATION/NOVA_GUIDING_PRINCIPLES.md), [Master Plan](../00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md) |
| Gouvernance | [Program Orchestrator Reference Architecture](PROGRAM_ORCHESTRATOR_REFERENCE_ARCHITECTURE.md), standards de squad existants |
| Architecture et règles | Sources de [01_CORE](../01_CORE/), [02_PRODUCT_ARCHITECTURE](../02_PRODUCT_ARCHITECTURE/), [03_DOMAIN_MODEL](../03_DOMAIN_MODEL/) et [05_RULES](../05_RULES/) selon leur statut propre |
| Décisions et structure de livraison | [Decision Register](../02_PROJECT_MANAGEMENT/DECISION_REGISTER.md), [Program Register](../02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md), [Lot Register](../02_PROJECT_MANAGEMENT/LOT_REGISTER.md), [Epic Register](../02_PROJECT_MANAGEMENT/EPIC_REGISTER.md) |
| Programs et portfolio | Charters, index et décisions présents dans [19_PROGRAMS](../19_PROGRAMS/) et [20_NOVA_PORTFOLIO](../20_NOVA_PORTFOLIO/) |
| Baselines et certification | Manifestes sous [21_BASELINES](../21_BASELINES/), preuves et décisions de certification à leur emplacement existant |

Le statut de chaque source reste décisif. Le manifeste ne promeut notamment pas la bibliothèque marquée `PROPOSITION_CANONIQUE`, les archives ou l'incubation.

## 5. Nouveaux Manifest proposés

Aucun.

La création d'un manifeste supplémentaire aurait instauré une architecture parallèle. Le seul point d'entrée existant a été rendu exploitable avec une hiérarchie, une cartographie, un graphe et 85 liens vers les sources.

## 6. Dette documentaire supprimée

- remplacement de références textuelles non résolubles par 85 liens vérifiés ;
- couverture récursive explicite des 31 domaines documentaires ;
- regroupement de 114 candidats de navigation derrière un unique point d'entrée transverse, sans supprimer leurs index locaux ;
- suppression de 316 lignes de mise en forme répétitive ou vide dans le manifeste ;
- centralisation de l'information de routage, sans copie de doctrine, règle, Program, Module ou contenu Runtime ;
- identification explicite des domaines sans propriétaire transversal déclaré, sans propriétaire inventé.

Aucune connaissance métier, technique ou historique n'a été supprimée.

## 7. Pourcentage de réduction obtenu

| Mesure | Avant | Après | Réduction |
|---|---:|---:|---:|
| Taille du manifeste central | 382 lignes | 66 lignes | **82,7 %** |
| Points d'entrée transverses nécessaires | 114 candidats dispersés | 1 manifeste central, les index locaux restant en place | **99,1 % de surface de découverte transverse** |
| Fichiers physiques du patrimoine | 1 354 Markdown | 1 354 Markdown avant ajout du présent rapport | **0 %** |
| Copies SHA-256 supprimées | 25 | 25 | **0 %**, par contrainte zéro régression |

La réduction obtenue porte sur la maintenance et la découverte transverses. Le nombre physique de sources n'est pas présenté artificiellement comme réduit.

## 8. Risques

| Risque constaté | Niveau | Traitement |
|---|---|---|
| Index de connaissance contenant des chemins historiques non résolus | Élevé | Le manifeste pointe aussi vers les domaines sources et ne confère pas à l'index une autorité supérieure |
| Propriété documentaire non consolidée dans plusieurs domaines | Moyen | Lacune rendue visible ; aucune attribution hypothétique |
| 25 copies exactes susceptibles de diverger | Moyen | Conservation et signalement ; fusion interdite sans validation de traçabilité |
| 10 fichiers vides pouvant être des placeholders | Moyen | Aucune suppression |
| 164 entrées de travail préexistantes dans le worktree lors de l'audit | Élevé | Aucune modification hors des deux livrables SW-001 |
| Encodage ou mise en forme historique hétérogène | Faible à moyen | Aucun refactoring massif ; le nouveau point d'entrée utilise un Markdown valide |

## 9. Régressions

- Runtime : aucune modification.
- Programs : aucune modification.
- Modules : aucune modification.
- Agents : aucune modification.
- Rules : aucune modification.
- Documents canoniques : aucun déplacement et aucune réécriture.
- Baselines, archives et incubation : aucune modification.
- Liens du manifeste : 85 vérifiés, 0 cassé.
- Nouveaux fichiers de fédération : aucun manifeste, registre, index ou catalogue parallèle.

Le seul fichier créé est le présent rapport. Le seul fichier consolidé est le manifeste existant.

## 10. Décision GO / NO GO

**GO — NOVA GOVERNANCE COMPRESSION SW-001**

Le système documentaire dispose d'un point d'entrée unique, léger et exhaustif par couverture récursive. La réduction destructive reste volontairement **NO GO** tant que l'autorité et les références des candidats ne permettent pas de garantir l'absence de régression.

# DSYN-000 — Synthesis Decision

Date : 2026-07-30  
Décision : **NO GO**

## 1. Source of Truth

| Attribut | Décision |
|---|---|
| Nom exact | `NONE_IDENTIFIED` |
| Chemin exact | aucun |
| Producteur autoritatif | aucun |
| Persistance Synthesis | aucune |
| Clé Mission | absente pour Synthesis |
| Clé Work | absente |
| Query interne | absente |
| Read Model Work Synthesis | absent |

## 2. Sources autoritatives voisines

| Source | Autoritative pour | Pourquoi elle n'est pas Synthesis |
|---|---|---|
| `MissionBrief` | préparation Mission | pré-exécution, mémoire, pas d'état Work courant |
| `MissionReport` | résultat technique accepté | aucun champ de synthèse ou conclusion métier |
| `MissionLog` | journal d'événements | observabilité chronologique |
| `MissionMetrics` | métriques Mission | calcul quantitatif, pas conclusion |
| `MissionEvidenceBundle` | preuves/certification | attestation technique |

Ces sources peuvent fournir des faits à un futur producteur. Elles ne doivent
pas être renommées ou fusionnées.

## 3. Justification métier

La doctrine Work définit Synthesis comme une synthèse métier courante, datée et
sourcée, produite par Intelligence à partir d'un état Work consolidé.

Le dépôt ne contient aucun producteur satisfaisant cette définition.
DINTEL-000 a confirmé l'absence de producteur Intelligence. Une lecture brute de
`MissionReport` ne deviendrait pas une synthèse du seul fait de porter ce nom.

## 4. Justification technique

1. Aucun type `WorkSynthesis` ou `MissionSynthesis` n'existe.
2. Aucun record ou repository Synthesis n'existe.
3. Aucun service ne consomme un état Work consolidé pour conclure.
4. `MissionBrief` n'est pas persisté par sa chaîne de préparation.
5. `MissionReport` est persistant et sélectionné de façon déterministe, mais son
   schéma est un résultat d'exécution structuré.
6. Timeline, log, métriques et evidence restent des Read Models techniques.
7. Les textes de résumé Work/Home sont des fixtures.

## 5. Décision de réutilisation

### KEEP

- Mission Brief et sa chaîne de préparation ;
- Mission Report, acceptation, snapshot et lecture ;
- résultat normalisé et résultat d'intégration ;
- timeline, log, métriques et evidence ;
- projection Runtime de Work Activity ;
- composants visuels des vues Work/Home.

### MERGE

Aucun. Préparation, exécution, observabilité et Synthesis ne partagent pas la
même sémantique.

### REFACTOR

Les sept projections UX qualifiées dans la matrice pourront devenir
consommatrices d'une source future. Cette décision n'autorise aucune
modification.

### REMOVE

Les six sources de fixtures de résumé pourront être retirées seulement après un
remplacement autoritatif et traçable.

## 6. Conséquence sur DSYN-001

**DSYN-001 n'est pas autorisé comme intégration read-only.**

Le prérequis manquant est un producteur métier autoritatif qui fournisse :

- une synthèse métier courante ;
- une date métier ou d'observation explicitement définie ;
- une provenance ;
- un rattachement déterministe à `projectId/workId` ;
- une distinction explicite entre indisponibilité, absence et synthèse vide.

Ce document ne spécifie ni n'implémente ce producteur.

## 7. Contrôle des critères

| Critère | Résultat | Preuve |
|---|---|---|
| Implémentations candidates inventoriées | PASS | matrice SYN-001 à SYN-042 |
| Producteurs et consommateurs identifiés | PASS | chaînes brief/report/integration/UX |
| Services, workflows, projections et Read Models qualifiés | PASS | matrice |
| Source métier autoritative Work Synthesis | FAIL | aucune |
| Doublons identifiés | PASS | deux clusters UX démontrés |
| KEEP/MERGE/REMOVE arbitrés | PASS | matrice et rapport |
| DSYN-001 sans seconde source | FAIL | aucun producteur Synthesis à consommer |

Le verdict **NO GO** est obligatoire.


# VALIDATOR REPORTING ENGINE

Version : 1.0

Statut : DRAFT

References :

- COS-201
- VALIDATOR_ARCHITECTURE_V2.md
- VALIDATOR_SCHEMA_V2.md
- VALIDATOR_CORE_PIPELINE.md
- VALIDATOR_CLASSIFICATION_ENGINE.md
- VALIDATOR_METRICS_ENGINE.md

---

## Objectif

Decrire le role du Reporting Engine du VALIDATOR V2.

Le Reporting Engine transforme les resultats classes et les metriques en restitutions exploitables par les agents, les humains, les workflows d'audit et les integrations automatisees.

Il ne recalcule pas les classifications et ne modifie pas les metriques. Il formate, structure, filtre et expose les resultats.

---

## Architecture

### Responsabilites

Le Reporting Engine :

- reçoit les ClassificationResult ;
- reçoit le MetricsResult ;
- reçoit la readiness ;
- applique les options de format ;
- applique les filtres de restitution ;
- produit les rapports JSON, Markdown, Console et Summary ;
- garantit une structure stable ;
- conserve la traçabilite entre rapport et sources.

### Entrees

- ClassificationResult[] ;
- MetricsResult ;
- readiness ;
- summary d'execution ;
- options de format ;
- niveau de detail ;
- filtres.

### Sorties

- ReportResult ;
- rapport JSON ;
- rapport Markdown ;
- rapport Console ;
- Summary.

### Dependances

Le Reporting Engine depend :

- du Core Pipeline pour les observations initiales ;
- du Classification Engine pour les categories ;
- du Metrics Engine pour les scores et compteurs ;
- du VALIDATOR_SCHEMA_V2 pour le contrat de sortie.

---

## Formats de sortie

### JSON

Objectif :

Fournir la sortie contractuelle principale, stable et exploitable par agents ou outils.

Structure :

- summary ;
- errors ;
- warnings ;
- documentationStates ;
- metrics ;
- readiness ;
- recommendations.

Cas d'utilisation :

- integration automatisee ;
- comparaison historique ;
- pipeline CI ;
- ingestion par agents.

### Markdown

Objectif :

Fournir une restitution lisible pour revue documentaire.

Structure :

- titre ;
- summary ;
- tableaux Errors, Warnings et Documentation States ;
- metrics ;
- readiness ;
- recommendations.

Cas d'utilisation :

- audit humain ;
- documentation de mission ;
- rapport de certification ;
- revue avant correction.

### Console

Objectif :

Fournir une sortie courte, lisible en terminal.

Structure :

- readiness ;
- compteurs principaux ;
- erreurs bloquantes ;
- warnings principaux ;
- chemin du rapport complet si disponible.

Cas d'utilisation :

- execution locale ;
- verification rapide ;
- feedback CI court.

### Summary

Objectif :

Fournir une synthese minimale de l'etat du perimetre.

Structure :

- mission_id ;
- scope ;
- readiness ;
- errors ;
- warnings ;
- documentation_states ;
- semantic_score ;
- quality_score ;
- coverage.

Cas d'utilisation :

- tableau de bord ;
- resume agent ;
- comparaison rapide.

---

## Structure du rapport

### Summary

Contient les informations d'execution et l'etat global du rapport.

### Errors

Liste uniquement les erreurs reelles.

Chaque entree doit indiquer :

- identifiant ;
- type d'erreur ;
- severite ;
- fichier ;
- ligne ou section ;
- cause ;
- impact.

### Warnings

Liste les risques non bloquants.

Chaque entree doit indiquer :

- identifiant ;
- type de warning ;
- severite ;
- fichier ;
- ligne ou section ;
- cause ;
- impact potentiel.

### Documentation States

Liste les etats documentaires qualifies.

Chaque entree doit indiquer :

- identifiant ;
- state ;
- fichier ;
- ligne ou section ;
- justification ;
- impact score.

### Metrics

Expose les compteurs et scores produits par le Metrics Engine.

### Readiness

Expose le statut final :

- READY ;
- READY_WITH_WARNINGS ;
- NOT_READY.

La section doit inclure les raisons du statut.

### Recommendations

Liste optionnelle de recommandations de lecture ou de correction.

Les recommendations ne doivent pas modifier le statut du rapport et ne remplacent pas les erreurs.

---

## Contrat

### ReportResult

Objet racine produit par le Reporting Engine.

Champs :

| Champ | Description |
|---|---|
| summary | ReportSummary. |
| sections | Liste de ReportSection. |
| formats | Formats produits. |
| metrics | MetricsResult. |
| readiness | Statut et raisons. |
| generated_at | Date de generation. |
| schema_version | Version du contrat de rapport. |

### ReportSummary

Resume d'execution.

Champs :

| Champ | Description |
|---|---|
| mission_id | Identifiant de mission si fourni. |
| scope | Perimetre audite. |
| files_scanned | Nombre de fichiers lus. |
| files_validated | Nombre de fichiers valides. |
| errors | Nombre d'erreurs. |
| warnings | Nombre de warnings. |
| documentation_states | Nombre d'etats documentaires. |
| readiness | Statut final. |

### ReportSection

Section de rapport.

Champs :

| Champ | Description |
|---|---|
| title | Titre de section. |
| type | summary, errors, warnings, documentation_states, metrics, readiness ou recommendations. |
| items | Elements de section. |
| count | Nombre d'elements. |
| visible | Indique si la section est restituee dans le format demande. |

---

## Niveaux de detail

### Compact

Restitution minimale :

- readiness ;
- compteurs principaux ;
- erreurs bloquantes.

### Standard

Restitution par defaut :

- summary ;
- errors ;
- warnings ;
- documentation states ;
- metrics principales ;
- readiness.

### Detailed

Restitution complete :

- toutes les sections Standard ;
- metadonnees ;
- preuves ;
- chemins normalises ;
- impacts score.

### Audit

Restitution maximale :

- toutes les donnees Detailed ;
- journal de generation ;
- filtres appliques ;
- configuration ;
- elements historisables ;
- traces de comparaison.

---

## Filtrage

### Par type

Filtrer les entrees :

- ERROR ;
- WARNING ;
- DOCUMENTATION_STATE ;
- INFO.

### Par severite

Filtrer par severite :

- CRITICAL ;
- HIGH ;
- MEDIUM ;
- LOW ;
- NONE.

### Par module

Filtrer par module, dossier, fichier ou domaine documentaire.

### Par etat documentaire

Filtrer par Documentation State :

- Existing ;
- Placeholder ;
- Reserved ;
- Pattern ;
- Gap ;
- Legacy ;
- Archive ;
- Incubation ;
- Deprecated ;
- Generated.

Regle :

Le filtrage ne doit pas changer les metriques globales, sauf si le rapport indique explicitement qu'il s'agit d'une vue filtree.

---

## Historique

Le Reporting Engine doit pouvoir comparer deux rapports.

Comparaison minimale :

- evolution des errors ;
- evolution des warnings ;
- evolution des documentation states ;
- evolution du semantic_score ;
- evolution du quality_score ;
- evolution de la coverage ;
- evolution de la readiness.

Sorties attendues :

- added ;
- removed ;
- unchanged ;
- changed ;
- score_delta ;
- readiness_delta.

Regle :

Deux rapports ne sont comparables que si leur perimetre et leur schema_version sont compatibles ou si une strategie de migration est documentee.

---

## Diagramme

```mermaid
flowchart TD
    A[ClassificationResult[]] --> D[Reporting Engine]
    B[MetricsResult] --> D
    C[Readiness] --> D
    E[Report Options] --> D
    F[Filters] --> D
    G[Detail Level] --> D

    D --> H[Build Summary]
    D --> I[Build Sections]
    D --> J[Apply Formatters]

    I --> K[Errors Section]
    I --> L[Warnings Section]
    I --> M[Documentation States Section]
    I --> N[Metrics Section]
    I --> O[Readiness Section]
    I --> P[Recommendations Section]

    J --> Q[JSON Report]
    J --> R[Markdown Report]
    J --> S[Console Report]
    J --> T[Summary]

    Q --> U[ReportResult]
    R --> U
    S --> U
    T --> U
```

---

## Extensibilite

Pour ajouter un nouveau format sans casser le moteur :

- definir un nom de format stable ;
- definir son objectif ;
- definir sa structure ;
- definir ses cas d'utilisation ;
- conserver ReportResult comme contrat racine ;
- ne pas modifier les sections obligatoires ;
- documenter les champs non supportes par le format ;
- garantir que les metriques globales restent identiques entre formats.

Un nouveau format peut masquer des sections pour lisibilite, mais il ne doit pas changer leur signification.

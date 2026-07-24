# VALIDATOR METRICS ENGINE

Version : 1.0

Statut : DRAFT

References :

- COS-201
- VALIDATOR_ARCHITECTURE_V2.md
- VALIDATOR_SCHEMA_V2.md
- VALIDATOR_CORE_PIPELINE.md
- VALIDATOR_CLASSIFICATION_ENGINE.md

---

## Objectif

Decrire le role du moteur de metriques du VALIDATOR V2.

Le Metrics Engine transforme les objets classes par le Classification Engine en compteurs, scores, couverture et readiness.

Il garantit que seuls les objets classes `ERROR` degradent le `semantic_score`.

---

## Architecture

### Responsabilites

Le Metrics Engine :

- consolide les resultats de classification ;
- calcule les compteurs officiels ;
- calcule les scores ;
- calcule la couverture ;
- calcule la readiness ;
- prepare les donnees pour le Report Engine ;
- conserve la traçabilite des formules appliquees.

### Entrees

- ClassificationResult[] ;
- liste des documents attendus ;
- liste des documents scannes ;
- liste des documents valides ;
- configuration de scoring ;
- seuils de readiness ;
- perimetre d'audit.

### Sorties

- MetricsResult ;
- scores ;
- readiness ;
- raisons de readiness ;
- details par document, dossier, projet et Operating System.

---

## Metriques calculees

### files_scanned

Definition : nombre de fichiers lus par le pipeline Collect.

Formule de calcul :

```text
files_scanned = count(files where collect_status = scanned)
```

Unite : nombre entier.

Seuils :

- conforme si files_scanned = files_expected dans le perimetre obligatoire ;
- warning si files_scanned < files_expected mais exclusions documentees ;
- error si un fichier obligatoire n'est pas scanne.

### files_validated

Definition : nombre de fichiers ayant termine le pipeline complet.

Formule de calcul :

```text
files_validated = count(files where pipeline_status = validated)
```

Unite : nombre entier.

Seuils :

- conforme si files_validated = files_scanned ;
- warning si un fichier scanne n'est pas valide pour cause non bloquante ;
- error si un fichier obligatoire ne peut pas etre valide.

### documentation_states

Definition : nombre total d'objets classes DOCUMENTATION_STATE.

Formule de calcul :

```text
documentation_states = count(classifications where type = DOCUMENTATION_STATE)
```

Unite : nombre entier.

Seuils :

- aucun seuil bloquant ;
- suivi qualitatif si volume eleve ;
- warning possible si state sans justification.

### errors

Definition : nombre total d'objets classes ERROR.

Formule de calcul :

```text
errors = count(classifications where type = ERROR)
```

Unite : nombre entier.

Seuils :

- READY si errors = 0 ;
- NOT_READY si errors > 0.

### warnings

Definition : nombre total d'objets classes WARNING.

Formule de calcul :

```text
warnings = count(classifications where type = WARNING)
```

Unite : nombre entier.

Seuils :

- READY possible si warnings = 0 ;
- READY_WITH_WARNINGS possible si warnings > 0 et errors = 0 ;
- NOT_READY uniquement si la configuration rend certains warnings bloquants.

### duplicates

Definition : nombre de duplications classees par le moteur.

Formule de calcul :

```text
duplicates = count(classifications where error_type = DuplicateIdentifier or warning_type contains Duplicate)
```

Unite : nombre entier.

Seuils :

- error si duplication d'identifiant obligatoire ;
- warning si duplication informative ou reference repetee non bloquante.

### orphan_references

Definition : nombre de references sans rattachement requis.

Formule de calcul :

```text
orphan_references = count(classifications where metadata.orphan = true)
```

Unite : nombre entier.

Seuils :

- error si le rattachement est obligatoire ;
- warning si le rattachement est recommande ;
- documentation state si l'orphelin est qualifie comme gap, incubation ou archive.

### broken_links

Definition : nombre de liens Markdown dont la cible est absente.

Formule de calcul :

```text
broken_links = count(classifications where error_type = BrokenLink)
```

Unite : nombre entier.

Seuils :

- conforme si broken_links = 0 ;
- NOT_READY si broken_links > 0 dans le perimetre obligatoire.

### semantic_score

Definition : score de conformite semantique base uniquement sur les ERROR.

Formule de calcul :

```text
semantic_score = max(0, 100 - sum(error_penalties))
```

Unite : pourcentage.

Seuils :

- READY si semantic_score = 100 ;
- READY_WITH_WARNINGS si semantic_score = 100 et warnings > 0 ;
- NOT_READY si semantic_score < 100.

### quality_score

Definition : score qualitatif complementaire tenant compte des warnings, de la couverture et de la maturite documentaire.

Formule de calcul :

```text
quality_score = max(0, semantic_score - warning_penalty - coverage_penalty - documentation_state_penalty)
```

Unite : pourcentage.

Seuils :

- eleve : >= 90 ;
- moyen : >= 70 et < 90 ;
- faible : < 70.

### coverage

Definition : taux de couverture du perimetre attendu.

Formule de calcul :

```text
coverage = files_validated / files_expected * 100
```

Unite : pourcentage.

Seuils :

- complet : 100 ;
- exploitable : >= seuil configure ;
- insuffisant : < seuil configure.

### readiness_score

Definition : score final utilise pour determiner la readiness.

Formule de calcul :

```text
readiness_score = min(semantic_score, quality_score, coverage)
```

Unite : pourcentage.

Seuils :

- READY : 100 ;
- READY_WITH_WARNINGS : >= seuil configure et errors = 0 ;
- NOT_READY : errors > 0 ou readiness_score < seuil configure.

---

## Ponderation

### Ce qui augmente le score

Le score augmente indirectement lorsque :

- les ERROR sont resolues ;
- la couverture augmente ;
- les warnings diminuent ;
- les Documentation States sont justifies ;
- les sources primaires sont identifiees.

### Ce qui diminue le score

Diminuent le semantic_score :

- MissingFile ;
- BrokenLink ;
- InvalidAnchor ;
- DuplicateIdentifier ;
- CircularReference ;
- InvalidPath.

Diminuent le quality_score :

- warnings ;
- documentation incomplete ;
- states sans justification suffisante ;
- couverture partielle ;
- dependances legacy actives.

### Ce qui n'a aucun impact

N'ont aucun impact negatif sur le semantic_score lorsqu'ils sont explicites :

- Placeholder ;
- Pattern ;
- Gap ;
- Archive ;
- Legacy ;
- Incubation ;
- Reserved ;
- Generated ;
- Deprecated.

---

## Calcul de readiness

### READY

Criteres :

- errors = 0 ;
- semantic_score = 100 ;
- coverage = 100 pour le perimetre obligatoire ;
- readiness_score = 100 ;
- aucune ambiguite bloquante.

### READY_WITH_WARNINGS

Criteres :

- errors = 0 ;
- semantic_score = 100 ;
- warnings > 0 ;
- coverage >= seuil configure ;
- readiness_score >= seuil configure ;
- aucun warning bloque par configuration.

### NOT_READY

Criteres :

- errors > 0 ;
- ou semantic_score < 100 ;
- ou coverage < seuil configure ;
- ou readiness_score < seuil configure ;
- ou impossibilite de calculer les metriques obligatoires.

---

## Agregation

### Niveau document

Les metriques sont calculees pour chaque fichier audite.

Exemples :

- errors par fichier ;
- warnings par fichier ;
- states par fichier ;
- score documentaire.

### Niveau dossier

Les metriques sont consolidees par dossier.

Exemples :

- couverture du dossier ;
- erreurs cumulees ;
- readiness du dossier.

### Niveau projet

Les metriques projet consolident tous les dossiers du perimetre audite.

Exemples :

- readiness projet ;
- quality_score global ;
- couverture globale.

### Niveau Operating System

Les metriques Operating System consolident uniquement les documents CEREBRAU Operating System inclus dans le perimetre.

Exemples :

- readiness OS ;
- couverture OS ;
- dette documentaire OS.

---

## Historisation

Les metriques suivantes doivent pouvoir etre comparees dans le temps :

- files_scanned ;
- files_validated ;
- documentation_states ;
- errors ;
- warnings ;
- duplicates ;
- orphan_references ;
- broken_links ;
- semantic_score ;
- quality_score ;
- coverage ;
- readiness_score ;
- readiness.

Chaque historique doit conserver :

- date de calcul ;
- perimetre ;
- version du VALIDATOR ;
- configuration ;
- hash ou identifiant de session si disponible.

---

## Contrat

Objet produit : MetricsResult.

Champs obligatoires :

| Champ | Description |
|---|---|
| scope | Perimetre audite. |
| level | document, folder, project ou operating_system. |
| files_scanned | Nombre de fichiers lus. |
| files_validated | Nombre de fichiers valides. |
| documentation_states | Nombre de states. |
| errors | Nombre d'erreurs. |
| warnings | Nombre de warnings. |
| duplicates | Nombre de duplications. |
| orphan_references | Nombre de references orphelines. |
| broken_links | Nombre de liens casses. |
| semantic_score | Score semantique. |
| quality_score | Score qualite. |
| coverage | Couverture. |
| readiness_score | Score readiness. |
| readiness | READY, READY_WITH_WARNINGS ou NOT_READY. |
| reasons | Raisons de la readiness. |

Exemple logique :

```json
{
  "scope": "Docs/09_CEREBRAU OPERATING SYSTEM",
  "level": "operating_system",
  "files_scanned": 0,
  "files_validated": 0,
  "documentation_states": 0,
  "errors": 0,
  "warnings": 0,
  "duplicates": 0,
  "orphan_references": 0,
  "broken_links": 0,
  "semantic_score": 100,
  "quality_score": 100,
  "coverage": 100,
  "readiness_score": 100,
  "readiness": "READY",
  "reasons": []
}
```

---

## Diagramme

```mermaid
flowchart TD
    A[ClassificationResult[]] --> B[Count Classifications]
    B --> C[Compute Base Metrics]
    C --> D[Compute Coverage]
    C --> E[Compute Error Penalties]
    C --> F[Compute Warning Penalties]
    E --> G[semantic_score]
    F --> H[quality_score]
    D --> H
    G --> I[readiness_score]
    H --> I
    D --> I
    I --> J{Readiness}
    J -->|errors = 0 and scores = 100| K[READY]
    J -->|errors = 0 and warnings > 0| L[READY_WITH_WARNINGS]
    J -->|errors > 0 or score below threshold| M[NOT_READY]
    K --> N[MetricsResult]
    L --> N
    M --> N
```

---

## Extensibilite

Pour ajouter une nouvelle metrique sans casser le moteur :

- definir son nom stable ;
- definir sa formule ;
- definir son unite ;
- definir ses seuils ;
- definir son niveau d'agregation ;
- definir son impact score si applicable ;
- fournir une valeur par defaut ;
- conserver les metriques existantes ;
- documenter son historisation si elle doit etre comparee dans le temps.

Une nouvelle metrique ne doit jamais changer la signification des metriques existantes.

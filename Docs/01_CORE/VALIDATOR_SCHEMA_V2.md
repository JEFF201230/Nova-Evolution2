# VALIDATOR_SCHEMA_V2

Version : 1.0

Statut : DRAFT

Reference : COS-201 - Validator Semantics

Reference architecture : VALIDATOR_ARCHITECTURE_V2.md

---

## 1. Objectif

Definir le contrat officiel du VALIDATOR V2.

Ce document complete COS-201 et VALIDATOR_ARCHITECTURE_V2.md en decrivant exclusivement le contrat fonctionnel attendu : entrees, sorties, types, metriques, readiness et compatibilite.

---

## 2. Entrees

### Workspace

Racine locale analysee par le VALIDATOR.

Contrat :

- chemin absolu ou relatif vers le workspace ;
- lecture seule ;
- resolution des chemins depuis cette racine ;
- aucune modification autorisee.

### Documents

Liste explicite des documents ou dossiers a auditer.

Contrat :

- chemins relatifs au workspace ;
- ordre stable de lecture ;
- fichiers Markdown prioritaires pour les audits documentaires ;
- dossiers autorises uniquement s'ils appartiennent au perimetre declare.

### Options

Parametres d'execution du VALIDATOR.

Contrat minimal :

- mode de sortie ;
- niveau de severite minimal ;
- activation ou non du controle des ancres ;
- activation ou non du controle des references explicites ;
- activation ou non du controle des etats documentaires.

### Exclusions

Liste des chemins, motifs ou categories a exclure de l'analyse.

Contrat :

- exclusion explicite ;
- exclusion traçable dans le rapport ;
- aucune exclusion implicite ;
- les exclusions ne doivent pas masquer une erreur dans le perimetre obligatoire.

### Configuration

Regles de validation appliquees a l'audit.

Contrat minimal :

- categories d'erreurs actives ;
- Documentation States autorises ;
- seuils de readiness ;
- regles de scoring ;
- conventions de chemin ;
- conventions d'identifiants.

---

## 3. Pipeline

Le VALIDATOR V2 utilise le pipeline officiel suivant, defini par VALIDATOR_ARCHITECTURE_V2.md :

```text
Collect
Resolve
Normalize
Semantic Analysis
Error Classification
Score
Report
```

Ce document ne redefinit pas le pipeline. Il fixe uniquement le contrat des donnees manipulees et restituees par ce pipeline.

---

## 4. Documentation States

Chaque Documentation State doit etre restitue avec :

- identifiant ;
- fichier ;
- ligne ou section ;
- state ;
- justification ;
- impact sur le score.

### Existing

Contrat : objet present, resolu et exploitable.

Impact score : aucun malus.

### Placeholder

Contrat : objet reserve ou cree sans contenu complet.

Impact score : aucun malus si le statut est explicite.

### Reserved

Contrat : objet conserve pour un usage futur documente.

Impact score : aucun malus.

### Pattern

Contrat : motif de chemin, convention de nommage ou reference generique volontaire.

Impact score : aucun malus.

### Gap

Contrat : ecart documentaire connu et declare.

Impact score : aucun malus si le gap est explicite.

### Legacy

Contrat : objet historique conserve pour migration, comparaison ou tracabilite.

Impact score : aucun malus hors flux actif.

### Archive

Contrat : objet conserve hors flux actif.

Impact score : aucun malus hors flux actif.

### Incubation

Contrat : objet exploratoire non integre au socle officiel.

Impact score : aucun malus si le statut incubation est explicite.

### Deprecated

Contrat : objet encore present mais remplace, deconseille ou retire du flux de reference.

Impact score : aucun malus si une source de remplacement ou une raison est indiquee.

### Generated

Contrat : objet produit automatiquement ou derive d'une source primaire.

Impact score : aucun malus si la source primaire est identifiable.

---

## 5. Error Types

Chaque Error Type doit etre restitue avec :

- identifiant ;
- fichier ;
- ligne ou section ;
- error_type ;
- cause ;
- preuve ;
- impact.

### MissingFile

Fichier attendu comme source reelle mais absent.

### BrokenLink

Lien Markdown dont la cible n'existe pas.

### InvalidAnchor

Lien Markdown pointant vers une ancre absente ou invalide.

### DuplicateIdentifier

Identifiant repete lorsque l'unicite est obligatoire.

### CircularReference

Cycle de references non documente empechant de determiner l'autorite documentaire.

### InvalidPath

Chemin invalide, non resoluble ou incompatible avec les conventions du perimetre.

---

## 6. Warning Types

Un Warning signale un risque non bloquant.

Contrat minimal :

- identifiant ;
- fichier ;
- ligne ou section ;
- warning_type ;
- cause ;
- impact potentiel.

Warning Types officiels :

| Type | Signification |
|---|---|
| AmbiguousReference | Reference resolue mais ambigue. |
| WeakCoverage | Couverture partielle mais exploitable. |
| DeprecatedUsage | Usage d'un objet deprecated sans blocage. |
| MissingOptionalMetadata | Metadonnee optionnelle absente. |
| NonCanonicalPath | Chemin resolu mais non canonique. |
| GeneratedWithoutTimestamp | Objet generated sans horodatage explicite. |
| StateWithoutJustification | Etat documentaire declare avec justification faible. |

---

## 7. Schema JSON officiel

Le rapport JSON officiel contient les proprietes suivantes :

```json
{
  "summary": {},
  "errors": [],
  "warnings": [],
  "documentationStates": [],
  "metrics": {},
  "readiness": {}
}
```

### summary

Resume d'execution.

Proprietes attendues :

- mission_id ;
- validator_version ;
- workspace ;
- scope ;
- generated_at ;
- files_expected ;
- files_present ;
- files_scanned.

### errors

Liste des erreurs reelles.

Chaque entree contient :

- id ;
- error_type ;
- severity ;
- file ;
- line ;
- section ;
- cause ;
- evidence ;
- impact.

### warnings

Liste des avertissements non bloquants.

Chaque entree contient :

- id ;
- warning_type ;
- severity ;
- file ;
- line ;
- section ;
- cause ;
- impact.

### documentationStates

Liste des etats documentaires qualifies.

Chaque entree contient :

- id ;
- state ;
- file ;
- line ;
- section ;
- justification ;
- score_impact.

### metrics

Mesures quantitatives du rapport.

Chaque propriete doit etre numerique, sauf indication contraire.

### readiness

Decision finale du VALIDATOR.

Proprietes attendues :

- status ;
- reason ;
- blocking_errors ;
- warnings ;
- semantic_score ;
- quality_score ;
- readiness_score.

---

## 8. Metrics

### files_scanned

Nombre de fichiers effectivement lus.

### files_validated

Nombre de fichiers ayant termine le pipeline de validation.

### documentation_states

Nombre total d'etats documentaires qualifies.

### errors

Nombre total d'erreurs reelles.

### warnings

Nombre total d'avertissements.

### duplicates

Nombre de duplications classees comme erreurs ou warnings.

### broken_links

Nombre de liens Markdown cibles absents.

### orphan_references

Nombre de references sans rattachement requis.

### semantic_score

Score de conformite semantique calcule uniquement a partir des erreurs.

### quality_score

Score qualitatif tenant compte des warnings, de la couverture et de la maturite documentaire.

### readiness_score

Score final utilise pour determiner le statut readiness.

---

## 9. Readiness

### READY

Critere exact :

- errors = 0 ;
- blocking_errors = 0 ;
- coverage complete pour le perimetre obligatoire ;
- readiness_score = 100 ;
- aucun warning bloquant par configuration.

### READY_WITH_WARNINGS

Critere exact :

- errors = 0 ;
- blocking_errors = 0 ;
- warnings > 0 ;
- coverage exploitable ;
- readiness_score inferieur a 100 mais superieur ou egal au seuil configure.

### NOT_READY

Critere exact :

- errors > 0 ;
- ou blocking_errors > 0 ;
- ou coverage obligatoire incomplete ;
- ou readiness_score inferieur au seuil configure ;
- ou impossibilite de produire les sections obligatoires du rapport.

---

## 10. Compatibilite

### VALIDATOR V1

VALIDATOR V1 peut continuer a produire des listes plates d'anomalies.

Compatibilite attendue :

- les erreurs V1 doivent pouvoir etre mappees vers `errors` ;
- les anomalies non bloquantes V1 doivent pouvoir etre mappees vers `warnings` ou `documentationStates` ;
- les anciens compteurs peuvent etre conserves dans `metrics` si leur sens est documente.

### VALIDATOR V2

VALIDATOR V2 applique le present contrat.

Compatibilite attendue :

- separation obligatoire entre `errors`, `warnings` et `documentationStates` ;
- scoring base uniquement sur les erreurs ;
- readiness explicite ;
- JSON stable et exploitable par agents.

---

## 11. Evolutivite

### Ajouter un Documentation State

Conditions :

- definir le nom stable ;
- definir le contrat ;
- definir l'impact score ;
- documenter la compatibilite avec les states existants ;
- ne pas changer la signification des states existants.

### Ajouter un Error Type

Conditions :

- definir le nom stable ;
- definir la cause ;
- definir la preuve attendue ;
- definir l'impact ;
- garantir que les anciens Error Types restent valides.

### Ajouter une metrique

Conditions :

- ajouter une propriete dans `metrics` ;
- conserver les metriques existantes ;
- definir l'unite ;
- definir le mode de calcul ;
- garantir une valeur par defaut lorsque la metrique n'est pas applicable.

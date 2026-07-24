# VALIDATOR ARCHITECTURE V2

Version : 1.0

Statut : DRAFT

Reference : COS-201 - Validator Semantics

---

## 1. Objet

Ce document definit l'architecture V2 du VALIDATOR CEREBRAU conformement a la doctrine COS-201.

Le VALIDATOR V2 doit separer les erreurs reelles des etats documentaires afin que la validation documentaire ne penalise plus les placeholders, patterns, gaps, archives, elements legacy ou contenus en incubation lorsque leur statut est explicite.

---

## 2. Pipeline du VALIDATOR

Le VALIDATOR V2 execute le traitement dans l'ordre suivant :

```text
Collect
  ↓
Resolve
  ↓
Normalize
  ↓
Semantic Analysis
  ↓
Error Classification
  ↓
Score
  ↓
Report
```

### Collect

Collecte les fichiers, tables, titres, liens Markdown, chemins explicites, identifiants et metadonnees necessaires au controle.

### Resolve

Resout les chemins, liens, ancres, references croisees et relations entre documents.

### Normalize

Normalise les identifiants, chemins, ancres, libelles de statuts, categories documentaires et formats de references.

### Semantic Analysis

Determine si chaque objet observe releve d'une erreur, d'un avertissement, d'une information ou d'un etat documentaire.

### Error Classification

Classe uniquement les anomalies reelles dans les categories d'erreurs officielles.

### Score

Calcule les scores a partir des erreurs reelles, sans penaliser les etats documentaires explicites.

### Report

Produit un rapport structure lisible par les agents et exportable en JSON.

---

## 3. Categories de sortie

### ERROR

Anomalie reelle qui rend la validation non conforme ou empeche la resolution documentaire.

### WARNING

Signal non bloquant qui indique un risque, une ambiguite ou une faiblesse documentaire sans invalider directement le document.

### INFO

Information de contexte, de couverture, de presence ou de qualite qui n'appelle pas correction obligatoire.

### DOCUMENTATION STATE

Etat documentaire explicite qui decrit la nature d'un objet sans le classer comme erreur.

---

## 4. Documentation States

### Existing

Objet present, resolu et exploitable comme source active.

### Placeholder

Objet reserve ou cree sans contenu exploitable complet.

### Reserved

Objet conserve pour usage futur explicite.

### Pattern

Reference generique volontaire, convention de nommage ou motif de chemin.

### Gap

Ecart documentaire connu, declare et suivi.

### Legacy

Objet historique conserve pour migration, comparaison ou tracabilite.

### Archive

Objet conserve hors flux actif.

### Incubation

Objet exploratoire non encore integre au socle officiel.

### Deprecated

Objet encore present mais remplace, deconseille ou sorti du flux de reference.

### Generated

Objet produit automatiquement ou derive d'une source primaire.

---

## 5. Erreurs officielles

### Missing File

Fichier attendu comme source reelle, mais absent.

### Broken Link

Lien Markdown pointant vers une cible absente.

### Invalid Anchor

Lien pointant vers une ancre inexistante ou invalide.

### Duplicate Identifier

Identifiant repete dans un contexte ou l'unicite est obligatoire.

### Circular Reference

Cycle de references non documente qui empeche de determiner l'autorite ou la source primaire.

### Invalid Path

Chemin invalide, non resoluble ou incompatible avec les conventions documentaires.

---

## 6. Nouveau calcul du score

Le score du VALIDATOR V2 ne penalise que les objets classes `ERROR`.

Les etats suivants ne doivent jamais reduire le score lorsqu'ils sont explicitement qualifies :

- Placeholder ;
- Pattern ;
- Gap ;
- Archive ;
- Legacy ;
- Incubation.

Les categories `WARNING`, `INFO` et `DOCUMENTATION STATE` peuvent influencer les commentaires de qualite, mais elles ne diminuent pas le score de conformite.

Formule de principe :

```text
semantic_score = 100 - penalty(ERROR)
quality_score = semantic_score ajusté par couverture et lisibilite
readiness = classification finale selon errors, warnings et coverage
```

Regles :

- chaque `ERROR` reduit le `semantic_score` ;
- un `Duplicate Identifier` reduit le score uniquement si l'unicite est requise ;
- un `Pattern` ne doit pas etre traite comme `Missing File` ;
- un `Placeholder` ne doit pas etre traite comme contenu manquant ;
- un `Gap` documente doit etre reporte comme etat documentaire ;
- une `Archive` ou un element `Legacy` ne doit pas etre exige comme source active.

---

## 7. Format JSON cible

Le VALIDATOR V2 doit produire une sortie JSON structurée selon le modele suivant :

```json
{
  "errors": [],
  "warnings": [],
  "info": [],
  "documentationStates": [],
  "metrics": {
    "errors": 0,
    "warnings": 0,
    "documentation_states": 0,
    "broken_links": 0,
    "duplicates": 0,
    "orphans": 0,
    "coverage": 0,
    "semantic_score": 0,
    "quality_score": 0,
    "readiness": "NOT READY"
  }
}
```

Chaque entree de `errors`, `warnings`, `info` ou `documentationStates` doit contenir :

- identifiant ;
- fichier ;
- ligne ou section ;
- categorie ;
- cause ;
- statut de resolution.

---

## 8. Metriques

### errors

Nombre total d'erreurs reelles.

### warnings

Nombre total d'avertissements non bloquants.

### documentation_states

Nombre total d'etats documentaires qualifies.

### broken_links

Nombre de liens Markdown cibles absents.

### duplicates

Nombre de duplications d'identifiants ou de references non autorisees.

### orphans

Nombre d'objets sans rattachement explicite lorsque ce rattachement est requis.

### coverage

Pourcentage des fichiers, categories ou axes attendus couverts par les sources analysees.

### semantic_score

Score calcule uniquement a partir des erreurs reelles.

### quality_score

Score qualitatif complementaire tenant compte de la couverture, des warnings et de la maturite documentaire.

### readiness

Etat final de preparation du perimetre audite.

---

## 9. Criteres READY

### READY

Conditions :

- aucune entree `ERROR` ;
- couverture attendue complete ;
- aucune ambiguite bloquante ;
- les etats documentaires sont qualifies.

### READY WITH WARNINGS

Conditions :

- aucune entree `ERROR` ;
- au moins un `WARNING` non bloquant ;
- les etats documentaires sont qualifies ;
- la couverture reste exploitable.

### NOT READY

Conditions :

- au moins une entree `ERROR` ;
- ou couverture insuffisante ;
- ou ambiguite bloquante ;
- ou impossibilite de distinguer erreur et etat documentaire.

---

## 10. Principe d'architecture

Le VALIDATOR V2 ne modifie aucune source.

Il lit, qualifie, classe, score et rapporte.

Il ne corrige pas les documents, ne cree pas de registres et ne remplace pas le Knowledge Context Engine.

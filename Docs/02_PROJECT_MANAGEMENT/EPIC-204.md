# EPIC-204

## Titre

Validator V2 Implementation

## Objectif

Implementer integralement le VALIDATOR V2 conformement :

- a COS-201 ;
- a VALIDATOR_ARCHITECTURE_V2 ;
- a VALIDATOR_SCHEMA_V2.

## Perimetre

L'EPIC-204 couvre uniquement l'implementation du VALIDATOR V2.

Il ne modifie pas la doctrine COS-201, ne modifie pas l'architecture VALIDATOR_ARCHITECTURE_V2 et ne modifie pas le contrat VALIDATOR_SCHEMA_V2.

Il transforme ces documents d'autorite en composants executables, testables et certifiables.

## Decoupage

### EPIC-204A

Core Pipeline

Implementer :

- Collect ;
- Resolve ;
- Normalize ;
- Semantic Analysis.

### EPIC-204B

Classification Engine

Implementer :

- Documentation States ;
- Error Classification ;
- Warning Classification.

### EPIC-204C

Metrics Engine

Implementer :

- semantic_score ;
- quality_score ;
- readiness ;
- coverage ;
- metrics.

### EPIC-204D

Reporting Engine

Implementer :

- JSON Report ;
- Markdown Report ;
- Console Report ;
- Summary.

### EPIC-204E

Validation & Tests

Implementer :

- Unit Tests ;
- Integration Tests ;
- Regression Tests ;
- Certification.

## Dependances

Ordre documentaire officiel :

```text
COS-201
  ↓
VALIDATOR_ARCHITECTURE_V2
  ↓
VALIDATOR_SCHEMA_V2
  ↓
EPIC-204
```

L'implementation du VALIDATOR V2 ne peut pas contredire cet ordre.

## Criteres d'acceptation

Le VALIDATOR V2 doit :

- respecter le contrat ;
- respecter l'architecture ;
- respecter la doctrine ;
- produire un rapport conforme ;
- etre entierement teste ;
- etre certifie READY.

## Livrables

Livrables attendus :

- pipeline VALIDATOR V2 implemente ;
- moteur de resolution des chemins, liens, ancres et references ;
- normalisation des chemins, identifiants, ancres et statuts ;
- moteur d'analyse semantique ;
- moteur de classification des Documentation States ;
- moteur de classification des erreurs ;
- moteur de classification des warnings ;
- calcul du semantic_score ;
- calcul du quality_score ;
- calcul du readiness ;
- calcul de la coverage ;
- calcul des metrics ;
- rapport JSON conforme a VALIDATOR_SCHEMA_V2 ;
- rapport Markdown ;
- rapport console ;
- summary d'execution ;
- tests unitaires ;
- tests d'integration ;
- tests de regression ;
- rapport de certification READY.

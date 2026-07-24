# CEREBRAU ORCHESTRATOR

## Objectif

Les agents ne communiquent jamais entre eux.

Ils communiquent uniquement via :

- missions/
- reports/
- state/

## Règles

- un agent = une mission
- un agent = un rapport
- aucun agent ne lit le dépôt complet
- aucun agent ne modifie un périmètre hors de sa mission
- toute mission possède un identifiant unique
- tout rapport respecte un schéma commun

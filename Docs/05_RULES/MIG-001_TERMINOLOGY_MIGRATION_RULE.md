# MIG-001 — Terminology Migration Rule

## Statut

**ACTIVE**

## Objectif

Garantir une migration progressive, stable et traçable des actifs documentaires entre VEEDDA et NOVA ORCHESTRATOR sans introduire de modifications spéculatives.

## Règle

Pendant la migration documentaire, seules les références dont le remplacement est officiellement validé dans NOVA peuvent être adaptées.

Toute terminologie dépendant d'une architecture non encore formalisée doit être conservée jusqu'à la publication de la doctrine correspondante.

## Autorisé

* Remplacer **CEREBRAU OS** par **NOVA ORCHESTRATOR** lorsqu'il s'agit uniquement du nom du système.
* Remplacer les références documentaires explicitement migrées vers NOVA.
* Adapter les prompts système pour refléter NOVA ORCHESTRATOR.

## Interdit

Ne pas renommer de manière anticipée les concepts suivants tant qu'une doctrine officielle NOVA ne les définit pas :

* PROGRAM
* EPIC
* LOT
* Knowledge Runtime
* Runtime
* Mission Engine
* Workflow Engine
* Context Engine
* Event Engine
* Plugin Platform
* SDK
* API

## Principe

La migration documentaire applique le principe :

**COPY FIRST — NEVER DELETE**

puis

**ADAPT ONLY WHAT IS FORMALLY DEFINED**

Aucune adaptation terminologique ne doit être réalisée sur la base d'une hypothèse.

## Justification

Cette règle évite les modifications successives sur l'ensemble du corpus documentaire et garantit que chaque changement de terminologie est fondé sur une décision d'architecture officiellement validée.

## Références

* NOVA Product Charter
* NOVA Guiding Principles
* NOVA Kernel Doctrine
* NOVA Migration Governance

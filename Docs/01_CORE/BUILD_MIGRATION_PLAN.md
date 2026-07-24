# BUILD MIGRATION PLAN

## Objectif

Séparer le build monolithique actuel en plusieurs builds indépendants.

## Etat actuel

Le dépôt utilise actuellement un build unique pour le serveur.

Le build serveur inclut le motif `./**/*.ts`.

Ce périmètre entraîne la compilation de modules autonomes qui ne sont pas montés par le runtime principal.

Ce périmètre entraîne également la compilation du legacy.

## Architecture cible

Build Principal : compile uniquement le runtime officiel réellement monté.

Build CEREBRAU Context : compile le sous-système autonome de reconstruction de contexte.

Build CEREBRAU Runtime : compile le sous-système autonome d'exécution, de validation, de classification, de publication et de génération des registres de connaissance.

Build Robot : compile le sous-système autonome Robot, hors fichiers de développement.

Build Vigile : compile le périmètre API Vigile et les adapters associés.

Build Legacy : isole les anciens modules historiques sans les inclure dans le build principal.

Build Dev : compile uniquement les scripts, runners et fichiers réservés au développement.

## Plan de migration

Phase 1
Documentation

Phase 2
Création des tsconfig dédiés

Phase 3
Adaptation des scripts de build

Phase 4
Validation

## Critères d'acceptation

- Build principal compile uniquement le runtime officiel.
- Aucun module autonome compilé par défaut.
- Aucun legacy compilé.
- Aucun test compilé.
- Chaque sous-système possède son propre build.

## Risques

- noyau Vigile partagé ;
- dépendances Supabase communes ;
- imports croisés ;
- glob trop large ;
- tests.

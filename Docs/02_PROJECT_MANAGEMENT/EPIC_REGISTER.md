# EPIC REGISTER

Registre officiel des EPIC de CEREBRAU Operating System.

## EPIC-200 — CEREBRAU Context Engine V1

EPIC_ID: EPIC-200

TITLE: CEREBRAU Context Engine V1

STATUS: COMPLETED

PROGRAM: PROGRAM-001

DESCRIPTION: Formaliser, implémenter et valider la couche de reconstruction automatique du contexte projet VEEDDA pour ChatGPT, en s'appuyant exclusivement sur les Context Providers officiels, les registres CEREBRAU et le Knowledge Index.

RELATED_LOTS: COS-100 ; COS-101 ; COS-102 ; COS-103 ; COS-200

OWNER: CEREBRAU Runtime Agent

LAST_UPDATED: 2026-06-28

## EPIC-201 — Legacy Stabilization

EPIC_ID: EPIC-201

TITLE: Legacy Stabilization

STATUS: ACTIVE

PROGRAM: PROGRAM-001

DESCRIPTION: Qualifier puis stabiliser le module Legacy indépendamment de Build V2.

CAUSE_RACINE: Le module Legacy dépend de bcryptjs, dépendance absente du projet.

ORIGINE: Anomalie révélée lors de la validation de Build V2.

PARENT: Build V2

RELATED_LOTS: BUILD-039

OWNER: CEREBRAU Runtime Agent

LAST_UPDATED: 2026-06-29

## EPIC-202 — Robot Stabilization

EPIC_ID: EPIC-202

TITLE: Robot Stabilization

STATUS: PLANNED

PROGRAM: PROGRAM-001

DESCRIPTION: Supprimer les incohérences internes du module Robot.

CAUSE_RACINE: Import dupliqué de ATAction dans atActionRunner.ts.

ORIGINE: Anomalie révélée lors de la validation de Build V2.

PARENT: Build V2

RELATED_LOTS: BUILD-039

OWNER: CEREBRAU Runtime Agent

LAST_UPDATED: 2026-06-29

## EPIC-203 — Vigile Stabilization

EPIC_ID: EPIC-203

TITLE: Vigile Stabilization

STATUS: PLANNED

PROGRAM: PROGRAM-001

DESCRIPTION: Réaligner les contrats TypeScript du module Vigile.

CAUSE_RACINE: Incompatibilité entre VigileRawData et Supabase Adapter.

ORIGINE: Anomalie révélée lors de la validation de Build V2.

PARENT: Build V2

RELATED_LOTS: BUILD-039

OWNER: CEREBRAU Runtime Agent

LAST_UPDATED: 2026-06-29

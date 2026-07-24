# PROGRAM-016 - API STRATEGY

## Status

FOUNDATION DOCUMENT.

## Purpose

Define the public API strategy for NOVA Mission Ops and the future platform surface without implementing any runtime behavior.

## Strategy

- One internal platform API boundary.
- Versioned public contracts only.
- Mission, decision, agent, evidence, and admin endpoints separated by domain.
- Read and write operations must be explicit.
- No implicit coupling to internal runtime classes.

## Rules

- API contracts are consumer-first.
- API contracts are versioned before implementation.
- API surfaces must preserve baseline traceability.
- API exposure must be gated by Program Board-approved scope.

## Decision

API strategy ready.


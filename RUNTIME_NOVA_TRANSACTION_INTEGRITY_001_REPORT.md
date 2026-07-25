# RUNTIME-NOVA-TRANSACTION-INTEGRITY-001

## Périmètre

Correction exclusive de NRA-003 et NRA-004. Les changements d’observabilité, de certification, de prompts, profils Codex, validations métier, CEREBRAU et moteur PowerShell sont inchangés.

## Résultats

| Anomalie | Correction | Preuve |
|---|---|---|
| NRA-003 — verrou ACTIVE après échec | Une exécution qui atteint `FAILED` libère immédiatement son verrou et publie `LockReleased`. | `orchestrator-runtime.service.ts`, test « Failed execution releases… » |
| NRA-004 — mutation partielle persistée | `NovaCoreService.mutate` capture un snapshot avant mutation. Toute erreur qui n’atteint pas `FAILED` restaure intégralement missions, verrous, files, événements, rapports, contextes et runs avant sauvegarde. | `NovaCoreService.mutate`, `OrchestratorRuntimeService.restoreSnapshot` |

Une transition d’exécution vers `FAILED` est le résultat métier terminal de l’exécution et est donc conservée; les mutations préparatoires échouées (assignation/lock) sont rollbackées. Les sauvegardes JSON restent atomiques via fichier temporaire puis renommage.

## Garanties

- assignation puis échec de lock : aucune mission `ASSIGNED` orpheline, aucun verrou créé;
- échec pendant exécution : mission `FAILED`, verrou `RELEASED`;
- double exécution concurrente : la seconde est rejetée par la machine d’état;
- succès : parcours et état final inchangés.

## Validation

- `npm.cmd run typecheck:nova-core` — PASS
- `npm.cmd test` — PASS (14 tests : 8 runtime, 6 NOVA Core)

Aucun commit, push ou changement CEREBRAU n’a été effectué.

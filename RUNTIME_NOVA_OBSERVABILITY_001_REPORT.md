# RUNTIME-NOVA-OBSERVABILITY-001 — Rapport

## Résultat

Correction limitée aux anomalies NRA-005, NRA-006 et NRA-007. Le comportement métier, les transitions canoniques, la certification, l’approbation, les empreintes, transactions, verrous, règles Codex et CEREBRAU n’ont pas été modifiés.

## Corrections vérifiables

| Anomalie | Correction | Preuve |
|---|---|---|
| NRA-005 — diagnostics perdus | `RuntimeDiagnostic` est propagé depuis la commande (code, stdout, stderr, commande, arguments, cwd, runId, correlationId, phase), dans les rapports, erreurs runtime, réponses HTTP et événements observabilité. | `server/nova-core/nova-core.execution.ts`, `server/nova-core/nova-core.service.ts`, `server/nova-core/nova-core.http.ts` |
| NRA-006 — absence de flux monitor | Événements structurés CREATED, ASSIGNED, STARTED, RUNNING, VALIDATING, COMPLETED, FAILED, persistés dans le snapshot et exposés par JSON et SSE. | `orchestrator-runtime.service.ts`, routes `/monitor` et `/monitor/stream` |
| NRA-007 — reprise non préparée | Chaque exécution possède un `RuntimeRunRecord`; les runs restés RUNNING sont listés par `getIncompleteRuns` et conservés après redémarrage. Aucune reprise automatique n’est déclenchée. | `RuntimeSnapshot.runs`, `NovaCoreService.getIncompleteRuns` |

## Contrat de diagnostic

Les erreurs d’exécution conservent désormais `details` et `diagnostics`. Une erreur de lancement de processus ou de précontrôle Git expose les sorties réelles; elle n’est plus remplacée par le seul message générique HTTP.

## Contrat temps réel

Chaque événement contient `timestamp`, `runId` (null avant attribution), `missionId`, `phase`, `progression`, `durationMs`, `message`, `level` et diagnostics facultatifs. La publication est additive et protégée : une erreur d’observabilité ne peut pas faire échouer la transition métier.

## Vérifications

- `npm.cmd run typecheck:nova-core` — PASS
- `npm.cmd test` — PASS (10 tests)
- `npm.cmd run test:nova-runtime:syntax` — PASS

Les tests couvrent le parcours runtime et API existants; aucune modification n’a été apportée à CEREBRAU ni commit/push exécuté.

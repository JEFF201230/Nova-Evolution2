# Mission Execution Monitor — flux de données

```text
commande NOVA/Codex
  └─ RuntimeDiagnostic (exitCode, stdout, stderr, command, cwd, runId, correlationId, phase)
       ├─ MissionReport.diagnostics
       ├─ RuntimeFailure/NovaCoreError → réponse HTTP error.diagnostics
       └─ RuntimeObservabilityEvent → snapshot JSON + SSE
```

## Lecture initiale

`GET /api/v1/missions/{projectId}/{missionId}/monitor` retourne `mission`, `events` (événements structurés) et `incompleteRuns`.

## Temps réel

`GET /api/v1/missions/{projectId}/{missionId}/monitor/stream` ouvre un flux Server-Sent Events. Les événements déjà persistés sont envoyés immédiatement, puis chaque nouvel événement est publié avec `event: mission`. Un heartbeat maintient la connexion; la fermeture du client désabonne le listener.

## Affichage possible

- barre de progression : `progression`;
- étape courante : dernier `phase`;
- temps écoulé : `durationMs`;
- journal : `timestamp`, `level`, `message`;
- diagnostic détaillé : objet `diagnostics`;
- reprise future : `incompleteRuns` dont `status` vaut `RUNNING`.

La persistance des événements et des runs est sérialisée avec les sauvegardes existantes. La détection d’un run incomplet est préparée, sans reprise automatique ni changement de transition métier.

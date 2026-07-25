# Mission event schema

Les événements de monitor sont des objets `RuntimeObservabilityEvent` sérialisables en JSON.

```json
{
  "observabilityEventId": "EVT-project-mission-3-RUNNING-4",
  "runtimeEventId": "EVT-project-mission-3",
  "sequence": 4,
  "timestamp": "2026-07-24T10:00:00.000Z",
  "projectId": "project",
  "missionId": "mission",
  "runId": "RUN-project-mission-...",
  "correlationId": "CORR-project-mission",
  "phase": "RUNNING",
  "progression": 50,
  "durationMs": 1200,
  "message": "Exécution en cours.",
  "level": "INFO",
  "diagnostics": [{
    "phase": "POWERSHELL_EXECUTION",
    "exitCode": 0,
    "processExitCode": 0,
    "stdout": "...",
    "stderr": "",
    "command": "powershell.exe",
    "args": ["..."],
    "cwd": "C:/repo",
    "runId": "RUN-project-mission-...",
    "correlationId": "CORR-project-mission"
  }]
}
```

`phase` est l’une des valeurs `CREATED`, `ASSIGNED`, `STARTED`, `RUNNING`, `VALIDATING`, `COMPLETED`, `FAILED`. Les événements `CREATED` et `ASSIGNED` peuvent avoir `runId: null`, car l’identifiant de run est attribué au démarrage. `progression` est un pourcentage indicatif (0, 20, 35, 50, 75, 90, 100); il ne remplace pas la machine d’état canonique.

Les champs de diagnostic sont optionnels et ne doivent jamais être interprétés comme une preuve de certification.

# Lock lifecycle specification

## États

```text
absence -> ACTIVE (LockGranted)
ACTIVE  -> RELEASED (LockReleased)
```

Un verrou est créé uniquement après une mission `ASSIGNED` et reste associé à la mission via `mission.lockId`.

## Libération

Le verrou est libéré lorsque la mission atteint `ACCEPTED`, `REJECTED`, `CANCELLED` ou `FAILED`. Pour `FAILED`, la libération est exécutée immédiatement après `ExecutionFailed`; elle ne modifie pas l’état de certification et n’autorise aucune approbation implicite.

## Échec de préparation

Si l’assignation ou l’acquisition du verrou échoue, le snapshot transactionnel initial est restauré. Il ne peut donc rester ni mission `ASSIGNED` sans verrou, ni verrou fantôme.

## Reprise future

Une mission `FAILED` conserve son état et son historique; son verrou est `RELEASED`. Une mission ultérieure pourra appliquer ses propres règles de requalification sans dépendre d’un verrou `ACTIVE` résiduel.

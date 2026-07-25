# Canonical state machine

Schema version `1.0.0` is defined in `server/runtime/orchestrator/canonical-state.ts`.

Canonical states: `CREATED → ASSIGNED → STARTED → RUNNING → VALIDATING → COMPLETED → CERTIFIED`, with terminal `FAILED`, `CANCELLED`, and `REJECTED` branches. Certification is only reachable from `COMPLETED`; the legacy orchestrator states remain compatible projections until a versioned migration is scheduled.

PowerShell status mapping is deterministic: SUCCESS/READY_FOR_REVIEW/COMPLETED→COMPLETED, FAILURE/FAILED/BLOCKED/PARTIAL→FAILED, CANCELLED→CANCELLED, REJECTED→REJECTED.

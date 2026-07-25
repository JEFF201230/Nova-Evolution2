# Event journal specification

`server/runtime/journal/append-only-journal.ts` defines schema version 1 events with eventId, sequence, timestamp, projectId, missionId, runId, correlationId, eventType, payload, previousHash and eventHash.

Events are SHA-256 chained over canonical JSON. `verifyIntegrity` detects sequence gaps, duplicate/out-of-order events, previous-hash breaks, schema mismatch and payload tampering. `replay` refuses an invalid chain. The current runtime still stores `runtime.json` as projection; durable append-only persistence and migration are explicitly pending.

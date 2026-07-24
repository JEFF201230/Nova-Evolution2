# PROGRAM-014 - GOVERNANCE

## Authority

PROGRAM-014 was authorized by the NOVA Program Board on 2026-07-09.

## Governance Rules Applied

- No Program Delivery Squad may execute without an approved Program Board decision.
- Mission Orders and Campaigns remain scoped to their owning Program.
- Artifact reservations must be unique inside a concurrent scheduler wave.
- Artifact conflicts trigger automatic STOP before repository mutation.
- Failed squads must be isolated from unrelated squads.
- Certification may be granted only when all required campaigns pass.

## Stop Conditions

| Stop Condition | Expected Control | Result |
| --- | --- | --- |
| Artifact conflict | Automatic STOP | PASS |
| Missing dependency | Scheduling block | PASS |
| Failed PDS | Isolation and escalation | PASS |
| Degraded final certification input | STOP | PASS |

## Traceability Rule

Each executed PDS emits trace references for:

- Program.
- Each Mission Order.
- Each Campaign.
- Certification state.

## Decision

Governance controls passed.

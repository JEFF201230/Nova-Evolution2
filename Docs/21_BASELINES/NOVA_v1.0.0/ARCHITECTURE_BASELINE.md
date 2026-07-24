# ARCHITECTURE BASELINE

## Baseline

NOVA v1.0.0

## Status

CERTIFIED

## Architecture Flow

```text
Migration Foundation
-> Operating System Foundation
-> Kernel Foundation
-> Operating System Runtime
-> Operating System Capability Integration
-> Governance
-> Portfolio Management
-> Scheduler
-> Resource Manager
-> Risk Engine
-> KPI Engine
-> Dashboard
-> Final Certification
```

## Frozen Architecture Layers

| Layer | Program Authority | Baseline State | Boundary |
| --- | --- | --- | --- |
| Migration Foundation | PROGRAM-001 | CLOSED | Archived migration governance; no active execution scope. |
| Foundation | PROGRAM-002 | COMPLETE | Certified OS architecture and Kernel Baseline v1.0 foundations. |
| Kernel | PROGRAM-003 | COMPLETE | Certified primitive support and boundary discipline. |
| Runtime | PROGRAM-004 | COMPLETE | Certified Runtime Core, Mission Runtime, Workflow Runtime, Agent Runtime, Execution Engine, and Runtime Traceability. |
| OS Capability Integration | PROGRAM-005 | COMPLETE | Certified consumption of Runtime evidence into OS capability readiness. |
| Governance | PROGRAM-006 | COMPLETE | Program lifecycle, Mission Order governance, Campaign governance, approval workflow, and decision workflow. |
| Portfolio | PROGRAM-007 | COMPLETE | Portfolio state, roadmap, sequencing, board decision, and index synchronization. |
| Scheduler | PROGRAM-008 | COMPLETE | Authorized work sequencing; does not replace Runtime scheduling. |
| Resource Manager | PROGRAM-009 | COMPLETE | Capacity, assignment, certified reuse, scope reservation, and allocation closure evidence. |
| Risk Engine | PROGRAM-010 | COMPLETE | STOP condition and risk control evidence. |
| KPI Engine | PROGRAM-011 | COMPLETE | Program, Mission Order, Campaign, test, certification, and residual-risk KPI evidence. |
| Dashboard | PROGRAM-012 | COMPLETE | Internal status evidence model; no UI baseline is authorized. |
| Final Certification | PROGRAM-013 | COMPLETE | Integrated NOVA v1.0 certification evidence. |

## Certified Runtime Boundary

The Runtime baseline is limited to internal TypeScript modules under:

- `server/runtime/os-runtime/`
- `server/runtime/mission-runtime/`
- `server/runtime/workflow-runtime/`
- `server/runtime/agent-runtime/`
- `server/runtime/execution-engine/`
- `server/runtime/runtime-traceability/`
- `server/runtime/orchestrator/`

The baseline does not authorize Runtime changes.

## Certified Kernel Boundary

The Kernel baseline is limited to internal TypeScript modules under:

- `server/runtime/kernel/`

The baseline does not authorize Kernel changes.

## Governance Service Boundary

The governance and OS management service baseline is limited to internal TypeScript modules under:

- `server/os-integration/`
- `server/governance/`
- `server/portfolio/`
- `server/scheduler/`
- `server/resource-manager/`
- `server/risk-engine/`
- `server/kpi-engine/`
- `server/dashboard/`
- `server/final-certification/`

## Public Interface Boundary

NOVA v1.0.0 does not certify an external public HTTP API, SDK, database interface, UI, marketplace, or product integration surface.

## Architecture Verification

| Check | Result |
| --- | --- |
| Master Plan architecture complete | PASS |
| Portfolio state aligned | PASS |
| Program Board authority present | PASS |
| PROGRAM-001 archive present | PASS |
| PROGRAM-002 through PROGRAM-013 complete | PASS |
| Runtime boundary unchanged by baseline | PASS |
| Kernel boundary unchanged by baseline | PASS |
| No new functional scope introduced | PASS |

## Decision

Architecture baseline CERTIFIED.

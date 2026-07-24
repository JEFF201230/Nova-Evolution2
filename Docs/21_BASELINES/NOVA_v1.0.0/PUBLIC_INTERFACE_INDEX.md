# PUBLIC INTERFACE INDEX

## Baseline

NOVA v1.0.0

## Status

CERTIFIED

## Public Interface Decision

NOVA v1.0.0 certifies no external public HTTP API, SDK, database interface, UI, marketplace, or product integration interface.

The certified repository state is an internal TypeScript Operating System baseline.

## Package Surface

| Surface | Baseline Result |
| --- | --- |
| `package.json` `type` | `module` |
| `package.json` `exports` | Not present |
| `package.json` `bin` | Not present |
| `package.json` runtime dependencies | None |
| `package.json` scripts | `test:kernel:bootstrap` |
| External HTTP listener | Not detected |
| Express/Fastify route surface | Not detected |
| Database interface | Not certified |
| Browser UI | Not certified |

## Internal Module Surface

The repository exposes TypeScript module symbols inside the source tree for internal tests and certified service composition.

| Area | Path | Interface Classification |
| --- | --- | --- |
| Kernel internals | `server/runtime/kernel/` | Internal certified module interfaces |
| OS Runtime | `server/runtime/os-runtime/` | Internal certified module interfaces |
| Mission Runtime | `server/runtime/mission-runtime/` | Internal certified module interfaces |
| Workflow Runtime | `server/runtime/workflow-runtime/` | Internal certified module interfaces |
| Agent Runtime | `server/runtime/agent-runtime/` | Internal certified module interfaces |
| Execution Engine | `server/runtime/execution-engine/` | Internal certified module interfaces |
| Runtime Traceability | `server/runtime/runtime-traceability/` | Internal certified module interfaces |
| Runtime Orchestrator | `server/runtime/orchestrator/` | Internal certified module interfaces; `orchestrator-runtime.ts` re-export present |
| OS Integration | `server/os-integration/` | Internal certified module interfaces |
| Governance | `server/governance/` | Internal certified module interfaces |
| Portfolio | `server/portfolio/` | Internal certified module interfaces |
| Scheduler | `server/scheduler/` | Internal certified module interfaces |
| Resource Manager | `server/resource-manager/` | Internal certified module interfaces |
| Risk Engine | `server/risk-engine/` | Internal certified module interfaces |
| KPI Engine | `server/kpi-engine/` | Internal certified module interfaces |
| Dashboard | `server/dashboard/` | Internal certified module interfaces |
| Final Certification | `server/final-certification/` | Internal certified module interfaces |

## Public Interface Verification

Searches against `server` and `package.json` found:

- no `listen(` based server entrypoint;
- no Express or Fastify route surface;
- no package `exports` map;
- no package binary entrypoint;
- no certified public API documentation in the v1.0.0 baseline scope.

## Future Interface Rule

Any public API, SDK, database surface, UI, external integration, or product-facing interface requires a future Program Board decision and must not be inferred from the internal TypeScript module surface.

## Decision

Public interface index CERTIFIED.

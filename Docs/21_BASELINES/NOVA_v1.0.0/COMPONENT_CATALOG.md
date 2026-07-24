# COMPONENT CATALOG

## Baseline

NOVA v1.0.0

## Status

CERTIFIED

## Repository Component Summary

| Component Group | Path | Files |
| --- | --- | ---: |
| Dashboard | `server/dashboard/` | 2 |
| Final Certification | `server/final-certification/` | 2 |
| Governance | `server/governance/` | 12 |
| KPI Engine | `server/kpi-engine/` | 2 |
| OS Integration | `server/os-integration/` | 10 |
| Portfolio | `server/portfolio/` | 2 |
| Resource Manager | `server/resource-manager/` | 2 |
| Risk Engine | `server/risk-engine/` | 2 |
| Agent Runtime | `server/runtime/agent-runtime/` | 10 |
| Execution Engine | `server/runtime/execution-engine/` | 10 |
| Kernel | `server/runtime/kernel/` | 45 |
| Mission Runtime | `server/runtime/mission-runtime/` | 10 |
| Runtime Orchestrator | `server/runtime/orchestrator/` | 4 |
| OS Runtime | `server/runtime/os-runtime/` | 12 |
| Runtime Traceability | `server/runtime/runtime-traceability/` | 2 |
| Workflow Runtime | `server/runtime/workflow-runtime/` | 10 |
| Scheduler | `server/scheduler/` | 2 |

## Program Component Catalog

| Program | Certified Component | Code Path | Evidence Path |
| --- | --- | --- | --- |
| PROGRAM-001 | Migration Foundation archive | Documentation archive | `Docs/18_PROGRAM_ARCHIVES/PROGRAM-001_MIGRATION_FOUNDATION/` |
| PROGRAM-002 | Operating System Foundation | Documentation foundation | `Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/` |
| PROGRAM-003 | Kernel Foundation | `server/runtime/kernel/` | `Docs/19_PROGRAMS/PROGRAM-003_CONSTRUCTION/` |
| PROGRAM-004 | Operating System Runtime | `server/runtime/` | `Docs/19_PROGRAMS/PROGRAM-004_OPERATING_SYSTEM_RUNTIME_CONSTRUCTION/` |
| PROGRAM-005 | OS Capability Integration | `server/os-integration/` | `Docs/19_PROGRAMS/PROGRAM-005_OPERATING_SYSTEM_CAPABILITY_INTEGRATION/` |
| PROGRAM-006 | Governance | `server/governance/` | `Docs/19_PROGRAMS/PROGRAM-006_GOVERNANCE/` |
| PROGRAM-007 | Portfolio Management | `server/portfolio/` | `Docs/19_PROGRAMS/PROGRAM-007_PORTFOLIO/` |
| PROGRAM-008 | Scheduler | `server/scheduler/` | `Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/` |
| PROGRAM-009 | Resource Manager | `server/resource-manager/` | `Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/` |
| PROGRAM-010 | Risk Engine | `server/risk-engine/` | `Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/` |
| PROGRAM-011 | KPI Engine | `server/kpi-engine/` | `Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/` |
| PROGRAM-012 | Dashboard Evidence | `server/dashboard/` | `Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/` |
| PROGRAM-013 | Final Certification | `server/final-certification/` | `Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/` |

## Certified Service Chain

```text
Kernel
-> Runtime
-> OS Integration
-> Governance
-> Portfolio
-> Scheduler
-> Resource Manager
-> Risk Engine
-> KPI Engine
-> Dashboard
-> Final Certification
```

## Test Catalog

| Test Area | Result |
| --- | --- |
| Server test files | 68 |
| Full server regression | 348 pass, 0 fail |
| Coverage run | 348 pass, 0 fail |

## Documentation Catalog

| Documentation Area | Result |
| --- | --- |
| PROGRAM-001 archive package | Present |
| PROGRAM-002 through PROGRAM-013 program folders | Present |
| Portfolio documents | Present and COMPLETE |
| Program Board | Present and ACTIVE |
| Verification, certification, or closure reports under `Docs/19_PROGRAMS` | 585 files detected |

## Catalog Decision

Component catalog CERTIFIED.

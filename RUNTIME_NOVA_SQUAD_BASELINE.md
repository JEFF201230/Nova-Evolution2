# RUNTIME-NOVA-SQUAD-REMEDIATION-001 — Baseline

Date: 2026-07-24

## Repository

- Branch: `main`
- HEAD: `d54cf2adaacfc68aa5ad2c30ae4db5d83b7ecdd7`
- Working tree: modifications and untracked deliverables from the completed observability and transaction-integrity missions; no commit or push performed.

## Toolchain

| Tool | Version |
|---|---|
| Node | v24.16.0 |
| npm | 11.13.0 |
| Git | 2.54.0.windows.1 |
| PowerShell | 5.1.26100.8894 |
| Codex CLI | 0.145.0 |

## Baseline validation

- `npm.cmd run typecheck:nova-core`: PASS
- `npm.cmd test`: PASS (8 runtime, 6 NOVA Core)
- `npm.cmd run test:nova-runtime:syntax`: PASS

## Previous mission inventory

Observability and transaction-integrity changes are present in the following runtime/API files and are reserved from destructive rewrites:

- `server/runtime/orchestrator/orchestrator-runtime.types.ts`
- `server/runtime/orchestrator/orchestrator-runtime.service.ts`
- `server/runtime/orchestrator/orchestrator-runtime.ts`
- `server/nova-core/nova-core.execution.ts`
- `server/nova-core/nova-core.service.ts`
- `server/nova-core/nova-core.http.ts`
- `server/nova-core/nova-core.types.ts`
- `server/nova-core/nova-core.store.ts`

Existing safeguards to preserve: structured diagnostics, observability events/SSE, incomplete-run records, snapshot rollback, atomic JSON save, failed-run lock release, and mutation serialization.

## Squad ownership

| File / area | Owner | Readers | Modification order |
|---|---|---|---|
| `server/nova-core/nova-core.execution.ts` | Squad Lead (after Agent A proposal) | A, B, D, E | A proposal → lead integration → tests |
| `server/nova-core/nova-core.service.ts` | Squad Lead | B, C, D, E | lead only, serialized |
| `server/nova-core/nova-core.http.ts` | Squad Lead | D, E | lead only, serialized |
| `server/runtime/orchestrator/orchestrator-runtime.service.ts` | Squad Lead | B, C | lead only, serialized |
| `server/runtime/orchestrator/orchestrator-runtime.types.ts` | Squad Lead | A, B, C | lead only, serialized |
| `server/nova-core/nova-core.store.ts` | Squad Lead | C, E | lead only, serialized |
| `package.json` | Squad Lead | E | lead only, serialized |
| New report-binding/journal/scope specs | Assigned agent | Squad Lead | parallel, disjoint files |

## Initial anomaly status

The 17 requested anomalies are not assumed closed from passing baseline tests. They require code-level evidence and will be classified `CLOSED`, `PARTIAL`, or `OPEN` in the final matrix.

# PROGRAM-006 Architecture

Program: PROGRAM-006 - Governance

Document Type: PROGRAM ARCHITECTURE

Date: 2026-07-08

Status: COMPLETE ARCHITECTURE BASELINE

Decision: GO

---

## 1. Purpose

PROGRAM-006 defines and implements the internal NOVA Governance layer.

The Governance layer manages authority and gate evidence for:

- Program lifecycle management;
- Mission Order governance;
- Campaign governance;
- approval workflow;
- decision workflow.

---

## 2. Source Authority

PROGRAM-006 is constrained by:

- `Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md`;
- `Docs/20_NOVA_PORTFOLIO/PROGRAM_BOARD.md`;
- `Docs/00_GOVERNANCE/PROGRAM_DELIVERY_SQUAD_STANDARD.md`;
- `Docs/00_GOVERNANCE/NOVA_DELIVERY_SQUAD_STANDARD.md`;
- PROGRAM-003 complete Kernel boundary discipline;
- PROGRAM-004 complete Runtime Foundation;
- PROGRAM-005 complete Operating System Capability Integration;
- `PROGRAM_006_CHARTER.md`;
- `PROGRAM_006_PROGRAM_INDEX.md`.

---

## 3. Architecture Scope

PROGRAM-006 owns internal governance services above PROGRAM-005:

```text
PROGRAM-006 Governance
-> PROGRAM-005 OS Integration evidence
-> PROGRAM-004 Runtime evidence
-> PROGRAM-003 Kernel boundary discipline
```

The implemented path is:

```text
server/governance/
```

---

## 4. Components

| Component | Implementation | Responsibility |
| --- | --- | --- |
| Approval Workflow | `approval-workflow.ts` | Verifies approval subjects and authorities. |
| Decision Workflow | `decision-workflow.ts` | Verifies GO, REWORK, STOP, and ESCALATE decision evidence. |
| Program Lifecycle | `program-lifecycle.ts` | Verifies Program transition gates. |
| Mission Order Governance | `mission-order-governance.ts` | Verifies Mission Order issue and completion gates. |
| Campaign Governance | `campaign-governance.ts` | Verifies Campaign open and closure gates. |
| Governance Core | `governance-core.ts` | Composes PROGRAM-006 governance evidence and consumes PROGRAM-005 evidence. |

---

## 5. Dependency Direction

Allowed dependency direction:

```text
server/governance/
-> server/os-integration/
```

Forbidden dependency direction:

```text
server/runtime/
-> server/governance/
server/runtime/kernel/
-> server/governance/
```

PROGRAM-006 does not directly import Runtime or Kernel implementation paths.

---

## 6. Explicit Non-Scope

PROGRAM-006 does not create:

- Kernel changes;
- Runtime Foundation changes;
- Scheduler;
- Resource Manager;
- Risk Engine;
- KPI Engine;
- Dashboard;
- public API;
- SDK;
- database or storage schema;
- external integration;
- UI;
- observability product;
- product behavior.

---

## 7. Architecture Invariants

1. Governance controls authority; it does not execute Runtime work.
2. Governance consumes PROGRAM-005 certified evidence through OS Integration.
3. Kernel and Runtime foundations remain certified and closed.
4. Mission Order and Campaign gates are evidence-based.
5. Program closure requires tests, verification, certification, and result evidence.
6. All governance evidence is immutable and deterministic.
7. No public surface is introduced by PROGRAM-006.

---

## 8. Architecture Decision

Architecture: GO.

PROGRAM-006 Governance is implemented as an internal Operating System governance layer.

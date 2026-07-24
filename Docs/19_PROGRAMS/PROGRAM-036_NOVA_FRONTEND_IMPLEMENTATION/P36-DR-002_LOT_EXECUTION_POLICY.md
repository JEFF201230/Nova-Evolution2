# 1. Document Control

| Field | Value |
|---|---|
| Decision Record ID | `P36-DR-002_LOT_EXECUTION_POLICY` |
| Program | `PROGRAM-036 — NOVA Frontend Implementation` |
| Decision type | Architecture Decision Record |
| Scope | Lot execution governance for PROGRAM-036 |
| Repository | `C:\DEV\nova-orchestrator` |
| Status | Final |

# 2. Context

PROGRAM-036 is executed through an explicit lot-and-mission-order model.

The Master Execution Plan and the Mission Orchestrator already define:

- 22 lots;
- 22 Mission Orders;
- explicit entry and exit gates;
- dependency ordering;
- incremental execution;
- certification steps.

A governance gap was identified in execution behavior: a future lot could be considered for selection while the current lot was still in progress.

This decision closes that gap.

Sources reviewed:

- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MASTER_EXECUTION_PLAN.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MISSION_ORCHESTRATOR.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md`
- `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`
- `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md`

# 3. Problem Statement

The execution policy must prevent a Mission Order from belonging to a future lot while the current lot is not yet certified.

Without an explicit rule, orchestration could drift from the certified incremental model and select future work prematurely.

# 4. Decision

The official lot execution policy for PROGRAM-036 is:

1. A lot may be opened only if the immediately preceding lot is CERTIFIED.
2. A Mission Order may not be assigned to a future lot while the current lot remains anything other than CERTIFIED.
3. The Mission Orchestrator must verify lot certification status before any automatic or assisted Mission Order selection.
4. The Master Execution Plan must be interpreted under this sequential certification rule.
5. Any exception requires a Decision Record.

# 5. Rationale

This policy is required to preserve:

- incremental delivery;
- evidence-driven certification;
- non-regression across lots;
- shared-component stability before downstream screen work;
- deterministic orchestration behavior;
- traceable governance decisions.

It prevents a future lot from being selected merely because its dependencies appear partially available.

The policy also aligns with the existing architecture principle that one functional lot is executed at a time unless the architecture explicitly authorizes parallelization.

# 6. Scope

This decision applies to:

- `PROGRAM_036_MASTER_EXECUTION_PLAN.md`
- `PROGRAM_036_MISSION_ORCHESTRATOR.md`
- all future Mission Orders for PROGRAM-036
- all lot selection and lot transition logic under PROGRAM-036 governance

This decision does not:

- change lot perimeter;
- change lot content;
- change UX rules;
- change Figma baseline;
- change frontend implementation rules;
- authorize code changes by itself.

# 7. Allowed Exceptions

Exceptions are allowed only when formally documented and explicitly approved for a specific lot transition.

Allowed exception categories:

- critical urgency;
- security;
- external blocker;
- documentary error;
- explicit Program Director decision.

Exception requirements:

- the exception must be traceable;
- the exception must identify the affected lot transition;
- the exception must state the duration or scope of the waiver;
- the exception must not silently become a new default;
- the exception must be recorded in a Decision Record before use.

# 8. Impact Analysis

## Master Execution Plan

Impact:

- lot sequencing becomes strictly certification-gated;
- future lots cannot be operationally considered before the current lot is CERTIFIED;
- the plan remains valid, but its execution interpretation becomes stricter;
- any ambiguity in parallelization must defer to certification status and documented exceptions.

## Mission Orchestrator

Impact:

- the orchestrator must add a mandatory pre-selection check for current lot certification;
- automatic next-order selection must stop if the current lot is not CERTIFIED;
- assisted selection must surface the blocking condition instead of advancing to a future lot;
- any deviation must be routed through a Decision Record.

## Gates

Impact:

- gate satisfaction is now the prerequisite for opening the next lot;
- gate checks alone are not sufficient if the current lot is not certified;
- exit gates become the explicit handoff condition for the next lot.

## Mission Orders

Impact:

- Mission Orders remain bound to their lot and increment;
- no Mission Order for a future lot may be launched while the current lot is in progress, waiting review, waiting gate, failed, blocked, rolled back, or cancelled;
- future Mission Orders remain pending until certification is complete or a formal exception exists.

## Incremental Strategy

Impact:

- incremental execution stays intact;
- the increment boundary is now also certification-bound;
- overlapping readiness does not permit forward lot opening.

## Certification

Impact:

- certification becomes the required control point for lot advancement;
- certification evidence is now the explicit signal that unlocks the next lot;
- any uncertified state blocks forward lot selection unless an approved exception exists.

# 9. Governance Update

Normative governance rule added to PROGRAM-036:

- `The next lot may not be opened until the current lot is CERTIFIED, unless a formal Decision Record grants a limited exception.`

Orchestrator obligation:

- verify the current lot state before selecting the next Mission Order;
- refuse future-lot selection when the current lot is not CERTIFIED;
- record the blocking condition as traceable evidence.

Master Execution Plan interpretation update:

- the planned sequence is now enforced as a certification-gated sequence, not merely as a dependency graph.

# 10. Effective Date

Effective date: `2026-07-12`

This policy is effective immediately for PROGRAM-036 governance.

# 11. Final Decision

Decision: APPROVED

Operational result:

- the lot execution order is now strictly certification-gated;
- future lots cannot be selected while the current lot remains uncertified;
- exceptions exist only through explicit Decision Record.

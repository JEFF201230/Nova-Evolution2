# 1. Document Control

| Field | Value |
|---|---|
| Decision Record ID | `P36-DR-003_LOT002_EXECUTION_RESTRUCTURING` |
| Program | `PROGRAM-036 — NOVA Frontend Implementation` |
| Decision type | Architecture Decision Record |
| Scope | Execution restructuring for LOT 002 |
| Repository | `C:\DEV\nova-orchestrator` |
| Status | Final |

# 2. Context

LOT 002 is the shared UI foundations lot within PROGRAM-036.

The lot objective remains unchanged. Only the execution granularity is being formalized so the lot can be delivered and certified in smaller, functionally coherent steps.

This decision is compatible with:

- `P36-DR-002_LOT_EXECUTION_POLICY.md`
- `PROGRAM_036_MASTER_EXECUTION_PLAN.md`
- `PROGRAM_036_MISSION_ORCHESTRATOR.md`

# 3. Problem Statement

LOT 002 needs an execution structure that is more operational than a single undifferentiated component batch.

The work must remain certifiable while allowing real implementation progress in a sequence that is easier to verify and less likely to create cross-component drift.

# 4. Decision

LOT 002 is restructured into five sequential Mini-Projets:

1. Foundation Tokens
   - Typography
   - Icons
   - Design Tokens

2. Core Components
   - Button
   - Badge
   - Status
   - Progress
   - Spinner
   - Skeleton

3. Surface Components
   - Card
   - Panel
   - Section
   - Empty State

4. Form Components
   - Input
   - TextArea
   - Select
   - Checkbox
   - Radio
   - Switch

5. Overlay Components
   - Drawer
   - Dialog
   - Tooltip
   - Popover

Each Mini-Projet must be certified before the next one may start.

# 5. Rationale

This structure is adopted because it:

- preserves the original goal of LOT 002;
- groups related work into functionally coherent units;
- reduces implementation entropy;
- improves traceability and certification clarity;
- lets the program accelerate implementation without losing governance control;
- prevents out-of-order component development.

# 6. Scope

This decision affects only execution granularity.

It does not:

- alter LOT 002 objectives;
- alter PROGRAM-036 architecture;
- alter the Master Execution Plan;
- alter the Mission Orchestrator;
- alter the normative source documents;
- authorize code outside LOT 002.

# 7. Allowed Exceptions

No Mini-Projet may be bypassed unless a formal Decision Record is issued for an exceptional governance reason.

Allowed exception categories are the same governance categories already accepted by PROGRAM-036, including:

- critical urgency;
- security;
- external blocker;
- documentary error;
- explicit Program Director decision.

Any exception must be recorded before it is applied.

# 8. Impact Analysis

## Master Execution Plan

Impact:

- LOT 002 now has an internal execution sequence;
- the lot remains a single governed lot, but its work is subdivided into certifiable execution slices;
- the order of implementation within LOT 002 becomes explicit.

## Mission Orchestrator

Impact:

- the orchestrator must recognize the five Mini-Projets as the internal execution order for LOT 002;
- it must not allow Mini-Projet 003, 004, or 005 to start before the preceding Mini-Projet is certified;
- traceability must record the Mini-Projet boundary for each Mission Order under LOT 002.

## Sequence of Execution

Impact:

- FOUNDATION TOKENS must complete before CORE COMPONENTS;
- CORE COMPONENTS must complete before SURFACE COMPONENTS;
- SURFACE COMPONENTS must complete before FORM COMPONENTS;
- FORM COMPONENTS must complete before OVERLAY COMPONENTS.

## Certification

Impact:

- each Mini-Projet is certifiable independently;
- LOT 002 final certification requires completion of all five Mini-Projets and their certifications;
- a Mini-Projet certification becomes the entry signal for the next Mini-Projet.

## Traceability

Impact:

- each Mission Order under LOT 002 must reference its Mini-Projet;
- certification evidence must identify the Mini-Projet boundary;
- a future audit can reconstruct the exact order of implementation from the record.

# 9. Governance Update

Normative execution order for LOT 002:

Foundation Tokens -> Core Components -> Surface Components -> Form Components -> Overlay Components

Governance rules:

- no Mini-Projet may open without the previous one being certified;
- no component may be developed outside its assigned Mini-Projet;
- the lot remains bounded by LOT 002 and does not expand its scope;
- certification remains mandatory at each boundary.

# 10. Effective Date

Effective date: `2026-07-12`

This restructuring is effective immediately for the execution of LOT 002.

# 11. Final Decision

Decision: APPROVED

Operational result:

- LOT 002 is now executed as five certifiable Mini-Projets;
- execution order is strict;
- traceability is improved;
- the lot objective remains unchanged.

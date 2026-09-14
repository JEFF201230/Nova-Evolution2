# P3-ACTIONS-001G-FINAL-REMEDIATION-001

## ROLE

You are the implementation and remediation agent for NOVA PROGRAM-003 / ACTIONS.

Your task is strictly bounded to closing the three blockers identified by:

`P3-ACTIONS-001G_ACTIONS_FOUNDATION_CERTIFICATION_REPORT.md`

Do not redesign ACTIONS.
Do not invent missing business semantics.
Do not broaden scope.
Do not certify the mission yourself.

---

## MISSION

Close, in this exact order:

1. `ACTIONS-G-FINAL-001`
2. `ACTIONS-G-FINAL-002`
3. `ACTIONS-G-FINAL-003`

Then execute complete non-regression validation and produce a remediation report.

---

# AUTHORITATIVE INPUTS

Read these before modifying code:

1. `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md`
2. ACTIONS domain Blueprint
3. ACTIONS Implementation Contract
4. ACTIONS test contract
5. P3-ACTIONS-001B report
6. P3-ACTIONS-001C report
7. P3-ACTIONS-001D report
8. P3-ACTIONS-001E report
9. P3-ACTIONS-001F report
10. `P3-ACTIONS-001G_ACTIONS_FOUNDATION_CERTIFICATION_REPORT.md`
11. `P3-ACTIONS-001G_CORRECTION_001_REPORT.md`
12. `P3-ACTIONS-001G_CORRECTION_002_REPORT.md`
13. `P3-ACTIONS-001G_CORRECTION_003_REPORT.md`
14. current repository code
15. certified WORK Phase 1 / WCF-001 evidence

If a required semantic decision is not demonstrable from these sources, STOP that correction and report the unresolved authority gap.

---

# CURRENT VERIFIED FACTS

The following facts have already been established and must be revalidated against current code before use.

## WORK canonical source

WCF-001 is the certified internal Work Core foundation.

Current Work identity is canonically bound to Mission identity:

- `projectIdentity` maps to `projectId`
- `workIdentity` maps to the WCF-001 Work identifier
- under current WCF-001 this identifier is the canonical Mission identity

The production Runtime exposes:

`OrchestratorRuntimeService.getMission(projectId, missionId): RuntimeMission | null`

`NovaCoreService` owns the production `OrchestratorRuntimeService`.

`HomeActiveWorkQuery` already receives the same Runtime instance as its `WorkCoreSource`.

Do not create another Work registry, Work database, Work mirror or Work identity system.

---

# IMPORTANT CURRENT WORKSPACE DELTA

The repository may already contain an incoming manual partial change in:

`server/nova-core/nova-core.service.ts`

It may include:

- an import of `ActionsAdmissionPolicy`
- a local `actionsAdmissionPolicy`
- `workExists` mapped to `runtime.getMission(...)`

Do NOT blindly delete or preserve it.

Inspect it.

If it is correct, integrate it into the final production composition.

If it is dead code, incomplete, architecturally misplaced or unnecessary, repair or replace it.

The final implementation must contain no unused/dead binding.

---

# BLOCKER 1 — ACTIONS-G-FINAL-001

## Problem

The required authoritative Work-existence link currently exists only as the abstract:

`ActionsAdmissionPolicy.workExists(workReference)`

The previous certification found no non-test adapter or production composition binding that policy to the certified canonical Work source.

Fixture policies such as `ADMIT_ALL_WORKS` do not satisfy production conformity.

## Required result

Production ACTIONS admission must prove that a proposed Action references an existing canonical Work.

The binding must use the existing certified Work truth.

It must not introduce:

- a second Work store
- a Work mirror
- a cache of Work existence
- a fixture admission policy
- `workExists: () => true`
- a new Work identity
- a dependency from the ACTIONS domain model directly to HTTP/BFF/frontend
- mutation of WORK from ACTIONS

Preserve the domain dependency inversion:

ACTIONS owns the admission contract.

Production composition supplies the implementation.

## Important

Do not consider FINAL-001 closed merely because an `ActionsAdmissionPolicy` object exists.

It must be consumed by the real non-test ACTIONS production composition.

No dead binding is acceptable.

---

# BLOCKER 2 — ACTIONS-G-FINAL-002

## Problem

Durable ACTIONS replay is currently dependent on the current external Work admission policy.

Historical `ProposeAction` commands are replayed through the normal acceptance path and `workExists` is evaluated again.

Therefore a canonical journal accepted yesterday can become unrecoverable today if the Work source changes, disappears or becomes unavailable.

This violates deterministic recovery from the unique canonical ACTIONS journal.

## Required invariant

External Work admission must be evaluated for NEW authoritative proposals.

It must NOT invalidate already accepted historical facts during deterministic journal replay.

The existing canonical journal remains the sole durable ACTIONS source.

Do not:

- weaken admission for new proposals
- silently accept invalid new Work references
- add another durable store
- modify accepted historical facts
- create compensating fake Work records
- bypass receipt integrity verification
- bypass causality verification
- weaken corruption detection

Recovery must remain fail-closed for actual ACTIONS journal corruption.

Distinguish clearly:

`new command admission`

from:

`historical canonical replay`.

Implement the smallest correction supported by the certified authority/journal architecture.

---

# BLOCKER 3 — ACTIONS-G-FINAL-003

## Problem

The certification found that `ActionRetried` creates an eighteenth business Event while the authoritative ACTIONS contract defines an exact vocabulary of seventeen events.

## Required result

Reconcile RetryAction with the authoritative contract.

Do not invent an eighteenth event unless an authoritative source explicitly authorizes changing the contract.

Preserve the valid RetryAction business semantics only to the extent authorized by the contract.

Do not alter unrelated transitions.

Do not modify ResumeAction unless the authoritative contract explicitly requires it.

The exact Event vocabulary after remediation must match the authoritative contract.

---

# PRESERVATION RULES

Preserve:

- one `Action` aggregate
- one `ActionsAuthority`
- `ActionsAuthority.accept(command)` as the sole authoritative mutation boundary
- one canonical durable `ActionsJournal`
- append-only histories
- Action revision CAS
- graph revision CAS
- causality protection
- provenance
- command idempotence
- atomic state/Event/receipt commit behavior
- deterministic recovery
- fail-closed journal corruption handling
- read-only query behavior
- zero ACTIONS mirror in WORK
- zero WORK mutation from ACTIONS
- WORK Objective independence
- WORK Lifecycle independence
- WORK Progress independence
- PLANNING ownership separation
- PEOPLE ownership separation

---

# FORBIDDEN SCOPE

Do not modify unless technically mandatory and explicitly justified:

- frontend
- BFF
- HTTP API
- external API
- scheduler
- queue
- PLANNING semantics
- PEOPLE semantics
- Work Objective
- Work Lifecycle
- Work Progress
- certification registry
- canonical certification JSON
- unrelated Runtime behavior
- unrelated NOVA Core functionality

Do not clean/reset/revert unrelated dirty files.

Do not use destructive Git commands.

---

# IMPLEMENTATION METHOD

For each blocker:

1. reproduce/confirm current failure;
2. identify root cause;
3. identify authoritative contract;
4. implement the minimum compliant correction;
5. add or update targeted tests;
6. execute targeted tests;
7. execute TypeScript validation;
8. inspect Git diff;
9. verify no architectural duplication was introduced;
10. record exact evidence.

Complete FINAL-001 before FINAL-002.

Complete FINAL-002 before FINAL-003.

Do not bundle unrelated refactors.

---

# REQUIRED VALIDATION

At minimum execute the existing applicable suites for:

- ACTIONS
- WORK
- PLANNING
- PEOPLE
- Runtime
- NOVA Core

Also execute all TypeScript validation commands required by the 001G certification mission.

Execute:

`git diff --check`

Perform structural scans proving:

- one ACTIONS Authority
- one durable ACTIONS source
- no Work mirror
- no fixture Work admission in non-test production code
- production Work admission is actually consumed
- deterministic replay does not depend on current Work existence
- Event vocabulary matches the authoritative exact list
- no forbidden cross-domain mutation capability was introduced

Use PowerShell-compatible commands if `rg` is unavailable.

---

# REQUIRED REPORT

Create:

`P3-ACTIONS-001G_FINAL_REMEDIATION_001_REPORT.md`

in:

`Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001G-ACTIONS-FOUNDATION-CERTIFICATION/`

The report must contain:

1. mission identifier
2. starting state
3. files read
4. files modified
5. FINAL-001 root cause
6. FINAL-001 correction
7. FINAL-001 evidence
8. FINAL-002 root cause
9. FINAL-002 correction
10. FINAL-002 evidence
11. FINAL-003 root cause
12. FINAL-003 correction
13. FINAL-003 evidence
14. complete test matrix
15. TypeScript validation results
16. structural scan results
17. `git diff --check`
18. remaining warnings
19. remaining unknowns
20. exact Git delta
21. recommendation:

`READY_FOR_RECERTIFICATION`

or

`NOT_READY_FOR_RECERTIFICATION`

Do not certify P3-ACTIONS-001G.

Do not modify the certification registry.

Do not modify the canonical certification JSON unless a separate human-authorized certification mission explicitly requires it.

---

# SUCCESS CONDITION

Success requires all three blockers to be demonstrated closed:

- `ACTIONS-G-FINAL-001 = CLOSED`
- `ACTIONS-G-FINAL-002 = CLOSED`
- `ACTIONS-G-FINAL-003 = CLOSED`

and all mandatory regressions remain PASS.

If any blocker cannot be closed without inventing semantics:

return:

`NOT_READY_FOR_RECERTIFICATION`

with the exact unresolved authority decision.

No false PASS.
No optimistic interpretation.
Evidence before conclusion.

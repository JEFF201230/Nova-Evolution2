# P3-PLANNING-001C CORRECTION 001 REPORT

## Mission

- MissionId: `P3-PLANNING-001C-CORRECTION-001`
- Program: NOVA
- Domain: PLANNING
- Lot: `P3-PLANNING-001C`
- Mode: strict, evidence-driven, minimal change
- Purpose: correct only the three implementation blockers recorded by the final evidence review.

This corrective mission does not certify `P3-PLANNING-001C`, change its `PENDING_EVIDENCE` state, or authorize `P3-PLANNING-001D`.

## Scope

The implementation changes are confined to the Planning domain aggregate, authority, and targeted tests. The only file created outside `server/domain/planning/` is this required corrective report. No persistence, Work integration, Runtime/Core mutation, API, BFF, frontend, or later-lot functionality was required.

## Files inspected

Authoritative documents read before implementation:

- `Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md`
- `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C_AUTHORITATIVE_PRODUCER_PROMPT.md`
- `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C_FINAL_EVIDENCE_REPORT.md`

Current Planning implementation inspected in full before editing:

- `server/domain/planning/index.ts`
- `server/domain/planning/planning.aggregate.ts`
- `server/domain/planning/planning.entities.ts`
- `server/domain/planning/planning.errors.ts`
- `server/domain/planning/planning.value-objects.ts`
- `server/domain/planning/planning-authority.commands.ts`
- `server/domain/planning/planning-authority.events.ts`
- `server/domain/planning/planning-authority.guard.ts`
- `server/domain/planning/planning-authority.test.ts`
- `server/domain/planning/planning-authority.ts`
- `server/domain/planning/planning-foundation.test.ts`
- `server/domain/planning/planning-foundation-access.ts`

Repository status and production-source boundary searches were also inspected. The worktree was already substantially dirty and the complete Planning tree was already untracked; unrelated changes were not repaired, staged, restored, cleaned, or otherwise modified.

## Files modified

- `server/domain/planning/planning.aggregate.ts`
- `server/domain/planning/planning-authority.ts`
- `server/domain/planning/planning-authority.test.ts`
- `server/domain/planning/planning-foundation.test.ts`

Files removed because they exposed the production capability chain:

- `server/domain/planning/planning-authority.guard.ts`
- `server/domain/planning/planning-foundation-access.ts`

File created:

- `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C_CORRECTION_001_REPORT.md`

No other file was modified by this corrective mission.

## Blocker 1 — Unique Authority

Original defect: `planningFoundationAccess()` publicly returned the genuine aggregate-construction capability. A direct module import could therefore call public `Planning.of(...)` without `PlanningAuthority`, admission checks, a canonical command, or accepted events.

Corrective mechanism:

- the genuine frozen capability is now a module-private constant in `planning-authority.ts`;
- `PlanningAuthority` alone can reference that capability when it creates an aggregate;
- `Planning.of(...)` retains the runtime identity assertion and still rejects structurally equivalent forged objects;
- `planningFoundationAccess()` and `planningAuthorityAccess()` were removed rather than renamed or replaced with another public token factory;
- Foundation tests now construct accepted aggregates through `PlanningAuthority`, so no test-only production producer exists.

Exact files changed: `planning-authority.ts`, `planning.aggregate.ts`, `planning-authority.test.ts`, `planning-foundation.test.ts`; `planning-authority.guard.ts` and `planning-foundation-access.ts` removed.

Exact regression proof: `PlanningAuthority is the only exported aggregate producer and 001C adds no forbidden boundary` proves that a forged capability is rejected, the former capability files/factories are absent, and the runtime authority module does not export the genuine capability. `PlanningAuthority invokes admission for accepted Establish and Revise paths` proves Work and Objective admission remains active on accepted Establish/Revise operations. Normal Establish, Revise, and Withdraw tests prove the authority still produces valid aggregates and events.

Result: **PASS**.

## Blocker 2 — Duplicate Business Entries

Original defect: complete revisions accepted repeated directed Dependency identities and repeated Priority identities for the same Planning element and comparison scope. Establishment then emitted duplicate granular facts.

Corrective mechanism:

- complete revision validation now rejects duplicate Dependency keys defined by `prerequisite -> dependent`;
- complete revision validation now rejects duplicate Priority keys defined by `element + scope`;
- rejection uses the existing `PLANNING_ELEMENT_DUPLICATE` error model;
- input is rejected, never silently deduplicated;
- validation occurs before aggregate acceptance or event construction.

Exact files changed: `planning.aggregate.ts`, `planning-authority.test.ts`, and `planning-foundation.test.ts`.

Exact regression proof: `complete revisions reject duplicate Dependency business identities` and `complete revisions reject duplicate Priority business identities` prove Foundation rejection. `EstablishPlanning rejects duplicate Dependency and Priority identities with zero accepted result` passes forged complete proposals through authority revalidation and proves neither invalid case returns an accepted aggregate or event result. The unchanged valid establishment test still proves non-duplicate Dependencies and Priorities work in the original event order.

Result: **PASS**.

## Blocker 3 — Withdrawal Causality and Idempotence

Original defect: after withdrawal, `isWithdrawReplay` compared only withdrawn state and expected version. It silently accepted commands with different causality, provenance, or canonical reason as zero-event replays.

Corrective mechanism:

- the unverifiable replay heuristic was removed;
- causality already represented by immutable Planning revisions is checked before current-state rejection, so reuse with different command content returns `PLANNING_CAUSALITY_CONFLICT` deterministically;
- once the aggregate is withdrawn, a repeated or altered withdrawal returns `PLANNING_NOT_CURRENT` because 001C contains no withdrawal receipt capable of proving exact command equality;
- the first valid withdrawal remains atomic, preserves all revisions, and emits exactly one `PlanningWithdrawn` event;
- provenance authority and `businessCause`/command causality consistency checks remain in the common admission path.

Exact files changed: `planning-authority.ts` and `planning-authority.test.ts`.

Exact regression proof: `WithdrawPlanning emits once, preserves history and fails closed when replay cannot be proven` proves one initial event, rejection of exact-but-unverifiable replay, changed causality, changed provenance, changed reason, and revision-causality reuse. `EstablishPlanning enforces Work, Objective, authority, version and current-plan preconditions` explicitly proves inconsistent command causality and provenance business cause are rejected.

Result: **PASS**.

## Regression Tests Added or Modified

- Added authority-level duplicate Dependency/Priority rejection with no accepted result.
- Added Foundation-level duplicate Dependency identity rejection.
- Added Foundation-level duplicate Priority identity rejection.
- Added accepted-path admission-policy invocation counters.
- Added explicit command causality/provenance consistency rejection.
- Replaced unverifiable withdrawal replay acceptance with exact, altered-causality, altered-provenance, altered-reason, and reused-causality rejection proofs.
- Strengthened source/runtime export checks for the removed capability chain.
- Routed Foundation aggregate setup through `PlanningAuthority` instead of a production capability factory.

## Validation Results

Final validation results:

| Validation | Result |
|---|---|
| `node --import tsx --test server/domain/planning/planning-authority.test.ts` | PASS — 12 tests, 12 passed, 0 failed |
| `node --import tsx --test server/domain/planning/planning-foundation.test.ts` | PASS — 15 tests, 15 passed, 0 failed |
| `node --import tsx --test server/domain/planning/*.test.ts` | PASS — 27 tests, 27 passed, 0 failed |
| `npm run typecheck:nova-core` | PASS — `tsc -p tsconfig.nova-core.json`, no diagnostics |
| `git diff --check` | PASS — no whitespace errors; warnings concern pre-existing LF/CRLF status in unrelated dirty files |
| Planning production forbidden-boundary scan | PASS — no Runtime, BFF, People, persistence/database, HTTP, or forbidden Milestone command/event match |
| Planning production capability-factory scan | PASS — no `planningFoundationAccess()` or `planningAuthorityAccess()` remains |

## Forbidden Boundary Verification

- No file under `server/runtime/`, `server/nova-bff/`, `apps/`, PEOPLE, WORK, Progress, Monitoring, Decision, persistence, repository, database, migration, API, BFF, or frontend was modified.
- `server/nova-core/nova-core.bootstrap.ts` was already modified at mission start and remained untouched by this correction.
- `Docs/12_CERTIFICATION/certification-registry.json` was already modified at mission start and remained untouched by this correction.
- No certification JSON, certification state, receipt, registry entry, or historical evidence was changed.
- No Planning store, repository, second aggregate, second authority, Runtime integration, Work integration, transport, Timeline authority, or `P3-PLANNING-001D+` artifact was created.
- `MilestoneReached` remains absent from Planning production commands and events.

Result: **PASS**.

## Remaining Risks

- The 001C aggregate does not retain a withdrawal command receipt. Exact withdrawal replay therefore cannot be truthfully proven and intentionally fails closed with `PLANNING_NOT_CURRENT`. Durable replay receipts remain a persistence concern for a separately authorized later lot.
- The complete Planning tree was untracked before this mission, so Git HEAD cannot provide a per-line historical baseline for these files. The mission used the observed initial files, path-restricted edits, test evidence, status checks, and source scans; unrelated dirty changes remain unattributed and untouched.
- Aggregate assertion imports the authority assertion while the authority imports the aggregate. This narrow ES module cycle is intentional to keep the genuine token private to the unique producer and was exercised successfully by targeted tests, the full suite, and Nova Core typecheck.

No remaining technical blocker was found within the authorized corrective scope.

## Final Technical Verdict

Implementation technical verdict: all three implementation blockers are closed and all required validations pass.

Certification state: `P3-PLANNING-001C` is not certified by this report and remains awaiting human final evidence review. `P3-PLANNING-001D` is not authorized or started.

TECHNICAL GO — P3-PLANNING-001C CORRECTION 001 COMPLETE — AWAITING FINAL EVIDENCE REVIEW

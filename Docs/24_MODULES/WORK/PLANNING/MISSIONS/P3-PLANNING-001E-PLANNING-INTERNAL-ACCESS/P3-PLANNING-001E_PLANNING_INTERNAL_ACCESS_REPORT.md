# P3-PLANNING-001E — Planning Internal Access — Implementation Report

## Identification

- MissionId: `P3-PLANNING-001E-IMPLEMENTATION-001`
- LotId: `P3-PLANNING-001E`
- Domain: `PLANNING`
- Branch: `feature/nova-runtime-foundation`
- Initial technical verdict (superseded by the final-validation addendum): **NO GO**

## Entry gate

The canonical entry state was verified before implementation:

- `P3-PLANNING-001D` is `CERTIFIED` in `P3-PLANNING-001D.certification.json`;
- `P3-PLANNING-001E` is `PENDING_EVIDENCE` in `certification-registry.json`;
- the certified 001D record names `P3-PLANNING-001E` as `NextAuthorizedLot`.

## Scope implemented

One internal Planning application boundary was added. It exposes:

- the three certified Planning mutations through `PlanningCommands`;
- the five canonical read-only Planning queries through `PlanningQueries`;
- qualified absence and canonical-source unavailability results;
- a deterministic Timeline projection reconstructed from a canonical Planning version's Schedule;
- only the exports required to consume this internal boundary.

No Work integration, public transport, HTTP/API/BFF route, frontend/UI, Progress behavior,
or consumer-domain business rule was implemented.

## Exact files created

- `server/domain/planning/planning-internal-access.ts`
- `server/domain/planning/planning-internal-access.test.ts`
- `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001E-PLANNING-INTERNAL-ACCESS/P3-PLANNING-001E_PLANNING_INTERNAL_ACCESS_REPORT.md`

## Exact files modified

- `server/domain/planning/index.ts`

No other file was modified by this mission. Pre-existing dirty worktree entries were preserved.

## Commands path implemented

The internal mutation path is:

```text
PlanningCommands
→ reconstruct state at the caller's expected canonical stream revision
→ PlanningAuthority.establishPlanning / revisePlanning / withdrawPlanning
→ PlanningRepository.commit
→ certified canonical Planning persistence
```

The application layer does not construct an aggregate, repeat business validation, or write
directly to storage. `PlanningAuthority` remains the only acceptance and aggregate-production
boundary. A command rejected by Authority produces no persistence effect. The request fingerprint
is deterministically derived from the complete command, while the certified durable receipt and
CAS behavior preserve idempotence and reject changed intent.

## Five Queries implemented

Exactly these five queries from the canonical contract were implemented; no sixth query exists:

1. `GetCurrentPlanning` (`getCurrentPlanning`) — returns `CURRENT`, `WITHDRAWN`, `ABSENT`, or
   `UNAVAILABLE`, with the canonical stream revision and provenance when state exists.
2. `GetPlanningVersion` (`getPlanningVersion`) — returns the requested immutable complete version,
   `VERSION_ABSENT`, `ABSENT`, or `UNAVAILABLE`.
3. `GetPlanningHistory` (`getPlanningHistory`) — returns ordered canonical events with stream and
   aggregate revisions, causalities, correlations, provenance, applicability and pagination state.
4. `GetPlanningTimeline` (`getPlanningTimeline`) — returns a derived temporal ordering for one
   canonical version, or qualified absence/unavailability.
5. `GetPlanningSchedule` (`getPlanningSchedule`) — returns the exact Schedule entries and source
   version/provenance, including an explicit present-but-empty Schedule.

All five read through `PlanningRepository`, perform no commit, and propagate corruption rather
than reclassifying it as absence.

## Qualified absence behavior

- `ABSENT`: no Planning history has ever been established for the WorkReference.
- `WITHDRAWN`: Planning history exists but no version is currently applicable.
- `VERSION_ABSENT`: Planning exists, but the explicitly requested version does not.
- `UNAVAILABLE`: the canonical persistence producer explicitly reports
  `PLANNING_PERSISTENCE_UNAVAILABLE`.
- `PRESENT` with an empty Schedule: the requested Planning version exists and explicitly contains
  no Schedule entry; this is not converted to Planning absence.

No empty aggregate, placeholder Planning truth, or default business value is fabricated.

## Timeline derivation behavior

Timeline is reconstructed on demand exclusively from the selected immutable Planning version's
canonical Schedule entries. Entries retain their element identity, qualified business time and
time provenance. Ordering uses the explicit instant, or the explicit period start/end when
available, followed only by stable identity tie-breakers. Timeline has no store, command, state
ownership, Work copy, Progress value, or persistence authority.

## Canonical persistence access

The boundary depends on the certified `PlanningRepository` port and was exercised with the
certified `PlanningSQLiteRepository`. Commands use `rehydrate` plus `commit`; queries use `load`
and `readHistory`. No table, migration, current-state source, history/event authority, receipt
authority, cache, mirror, or alternate Planning store was added.

## Domain-boundary verification

- all implementation and tests are inside `server/domain/planning/**`;
- the only documentation output is this mission report inside the authorized 001E mission folder;
- no `server/domain/people/**` file was modified;
- no Work, Progress, Decisions, Deliverables, Runtime, API, BFF, HTTP, frontend, or UI integration
  was added;
- P3-PLANNING-001F was not opened or implemented;
- no certification file or certification registry was edited by this mission.

## Initial validation run (superseded by final-validation addendum)

Final validations were executed on the final implementation state:

| Validation | Command | Result |
|---|---|---|
| Planning typecheck | `npx.cmd tsc -p server/domain/planning/tsconfig.json` | PASS — 0 errors |
| Complete Planning suite | `node.exe --import tsx --test server/domain/planning/*.test.ts` | PASS — 50 tests, 50 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo |
| Runtime non-regression | `npm.cmd run test:runtime` (executed by `npm.cmd test`) | PASS — 24 tests, 24 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo |
| NOVA Core non-regression | `npm.cmd run test:core` (executed by `npm.cmd test`) | PASS — 541 tests, 541 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo |
| Combined required non-regression | `npm.cmd test` | PASS — 565 tests, 565 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo |
| NOVA Core typecheck | `npm.cmd run typecheck:nova-core` | PASS — 0 errors |
| Required Git diff check | `git diff --check` | **FAIL** — exit 1: `tools/nova-core-runtime/Cerebrau.Certification.psm1:824: new blank line at EOF.` |

The complete Planning suite includes the 10 new 001E tests. Those tests cover the internal
Establish/Revise/Withdraw path, Authority rejection with zero effect, durable idempotent replay,
changed-intent rejection, all five Queries, root-event persistence, qualified absence,
withdrawal, provenance, deterministic Timeline derivation, canonical SQLite access,
unavailability, corruption propagation and read-only behavior.

## Initially recorded limitations (superseded where corrected by final-validation addendum)

- This is an internal TypeScript application boundary only; it intentionally has no transport or
  consumer integration.
- History reads are explicitly paginated (`afterSequence`, default limit 100, canonical repository
  maximum 1000); callers must follow `hasMore` for longer histories.
- Timeline represents only explicit canonical Schedule entries. It intentionally does not infer
  missing dates, dependencies, execution status, Work Lifecycle, or Progress.
- Work consumption remains prohibited until a distinct, authorized and certified
  P3-PLANNING-001F mission.
- Human final approval and subsequent canonical certification remain required.
- The required global `git-diff-check` is blocked by a whitespace defect in
  `tools/nova-core-runtime/Cerebrau.Certification.psm1`. That file was already listed as dirty in
  the mission-entry state, is outside the authorized paths, is explicitly outside this Planning
  lot, and was not modified by this mission. The defect cannot be corrected without new authority.

## Initial technical verdict (superseded)

**NO GO** — the P3-PLANNING-001E implementation and its functional/typecheck validations are
complete, with one internal boundary over the certified canonical Planning source and no observed
test regression. The mission cannot receive a technical GO because the mandatory global
`git-diff-check` failed on an out-of-scope, pre-existing dirty file. No failed required validation
has been hidden or reclassified.

No certification was performed. This report is implementation evidence for subsequent human
review and canonical certification only; it does not mark P3-PLANNING-001E as `CERTIFIED` and
does not claim CEREBRAU certification.

## Final-validation addendum — 2026-09-06

This addendum preserves the earlier failed validation above as historical evidence. A final-state
rerun after that observation produced the following actual results:

| Final validation | Exact command | Final result |
|---|---|---|
| Complete Planning suite | `node.exe --import tsx --test server/domain/planning/*.test.ts` | PASS — 50 tests, 50 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo |
| Planning typecheck | `node_modules\\.bin\\tsc.cmd -p server/domain/planning/tsconfig.json` | PASS — 0 errors |
| NOVA Core typecheck | `node_modules\\.bin\\tsc.cmd -p tsconfig.nova-core.json` | PASS — 0 errors |
| NOVA Core non-regression | `node.exe --import tsx --test server/runtime/orchestrator/orchestrator-runtime.test.ts server/runtime/work/work-core-foundation.test.ts server/nova-core/*.test.ts` | PASS — 565 tests, 565 passed, 0 failed, 0 skipped, 0 cancelled, 0 todo |
| Git diff check | `git diff --check` | PASS — exit 0; line-ending conversion warnings only, no whitespace error |

Final remaining limitations are intentional scope boundaries: this is an internal TypeScript
boundary with no transport or consumer integration; history is paginated; Timeline contains only
explicit Schedule business times and infers no Progress or execution state; Work consumption
remains reserved for a separately authorized P3-PLANNING-001F lot; and human approval plus
canonical certification remain required.

The earlier whitespace failure is therefore not present in the final worktree state. The final
technical verdict for the implementation evidence is **GO**: every required final validation
passes. Human review and canonical certification remain required, and no certification was
performed by this mission.

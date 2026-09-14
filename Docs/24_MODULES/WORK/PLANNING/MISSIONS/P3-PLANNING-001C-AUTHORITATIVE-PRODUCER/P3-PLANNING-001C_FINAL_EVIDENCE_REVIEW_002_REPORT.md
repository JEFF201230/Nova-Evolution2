# P3-PLANNING-001C FINAL EVIDENCE REVIEW 002

## Mission

| Field | Value |
|---|---|
| MissionId | `P3-PLANNING-001C-FINAL-EVIDENCE-REVIEW-002` |
| Program | NOVA |
| Domain | PLANNING |
| Lot | `P3-PLANNING-001C` |
| Mission type | Final evidence review |
| Mode | Strict, read-only implementation audit, evidence-driven |
| Review date | 2026-09-04 |
| Implementation changes | None |
| Decision | **NO GO** |

This review independently evaluated the current implementation. It did not trust the corrective report's `TECHNICAL GO`, did not repair any finding, did not change certification state, and did not start or authorize `P3-PLANNING-001D`. The only repository write made by this review is this mandatory report.

## Evidence Sources

The following four authoritative and historical documents were read in full before verdict:

1. `Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md` (583 lines).
2. `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C_AUTHORITATIVE_PRODUCER_PROMPT.md` (640 lines).
3. `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C_FINAL_EVIDENCE_REPORT.md` (269 lines).
4. `Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C_CORRECTION_001_REPORT.md` (165 lines).

Additional evidence inspected:

- `Docs/12_CERTIFICATION/certification-registry.json` and the 001B/001C certification JSON files;
- every current file under `server/domain/planning/`;
- repository-wide production-source symbol, import, producer, persistence, API, Runtime, and later-lot searches;
- current `git status`, `git diff -- server/nova-core/nova-core.bootstrap.ts`, and `git diff --check`;
- `tools/nova-core-runtime/reports/bootstrap-20260810T012420770/mission-delta.json` in full and the relevant contradictory transcript scope statement;
- fresh authored tests, typecheck, repository tests, and read-only behavioral probes executed through stdin.

The worktree was already substantially dirty and the complete Planning tree was untracked. This review did not attribute unrelated dirty files to itself or alter, stage, restore, clean, commit, or push them.

## Current Implementation Inspected

All required current files were read in full:

- `server/domain/planning/index.ts` (70 lines)
- `server/domain/planning/planning.aggregate.ts` (232 lines)
- `server/domain/planning/planning.entities.ts` (154 lines)
- `server/domain/planning/planning.errors.ts` (32 lines)
- `server/domain/planning/planning.value-objects.ts` (316 lines)
- `server/domain/planning/planning-authority.commands.ts` (36 lines)
- `server/domain/planning/planning-authority.events.ts` (132 lines)
- `server/domain/planning/planning-authority.ts` (607 lines)
- `server/domain/planning/planning-authority.test.ts` (467 lines)
- `server/domain/planning/planning-foundation.test.ts` (420 lines)

`planning-foundation-access.ts` and `planning-authority.guard.ts` are absent. The directory contains exactly the ten files listed above. No renamed capability-factory file was found. Nevertheless, the exported runtime classes themselves still provide an equivalent direct construction route, as proven below.

## Entry Gate

| Requirement | Result | Concrete evidence |
|---|---|---|
| 001B is certified | PASS | Registry lines 76-82 and `P3-PLANNING-001B.certification.json` state `CERTIFIED`. |
| 001B authorizes 001C | PASS | Both sources state `NextAuthorizedLot: P3-PLANNING-001C`. |
| 001C is the current admitted review lot | PASS | Registry lines 84-90 identify 001C after 001B and leave it `PENDING_EVIDENCE`. |
| Blueprint, contract, and Foundation exist | PASS | Authoritative documents exist; all aggregate/entity/value-object/error files and tests are present. |
| No second named PlanningAuthority | PASS | Exact production search found one definition only: `planning-authority.ts:58`. |
| No second store/source | PASS | Repository and file-name searches found no Planning repository, persistence, database, migration, query service, Timeline authority, or application integration. |

**Entry gate: PASS.** The 001C placeholder certificate still has the incorrect 001B MissionId and remains `PENDING_EVIDENCE`; it is not certification evidence and was not modified.

## Blocker 1 ??? Unique Authority

**Result: FAIL — the former token-factory bypass is closed, but PlanningAuthority is still not the unique runtime aggregate producer.**

Evidence that the correction works in part:

- `planning-authority.ts:30-45` keeps the genuine `AUTHORITY_ACCESS` object module-private and rejects non-identical objects.
- The authority module's runtime exports are only `PlanningAuthority` and `assertPlanningAuthorityAccess`; `AUTHORITY_ACCESS`, `planningFoundationAccess`, and `planningAuthorityAccess` are absent.
- `index.ts:66-70` exports the authority but no access factory.
- A forged `{ scope: "PLANNING_AUTHORITY" }` passed to `Planning.of(...)` failed with `PLANNING_VERSION_CONFLICT`.
- Only `planning-authority.ts:58` defines `PlanningAuthority`; no Planning production import exists outside `server/domain/planning/`.
- Normal authority Establish, Revise, and Withdraw operations succeeded. Admission counters proved Work checks on all three operations and Objective checks on Establish/Revise. The authored authority test also passed its exact 3 Work / 2 Objective assertion.

Decisive contrary runtime evidence:

- `index.ts:34-38` publicly exports both `Planning` and `PlanningRevision`.
- Their constructors are declared TypeScript `private` at `planning.aggregate.ts:46` and `planning.aggregate.ts:69`, but are ordinary callable JavaScript constructors at runtime; there is no ECMAScript `#private` constructor mechanism or constructor token check.
- A direct `tsx` module-import probe called `new PlanningRevision(...)` and then `new Planning(...)`. It produced `{"directConstructorBypass":true,"currentVersion":1,"authorityAdmissionInvoked":false,"eventsEmitted":0,"aggregateFrozen":true,"revisionFrozen":true}`.
- A second direct-constructor probe accepted versions `[1,3]` while version `1` was marked current and version `3` was latest: `{"nonContiguousAccepted":[1,3],"currentNotLatestAccepted":1,"latest":3}`.

The exported classes therefore constitute an equivalent genuine aggregate-construction capability. Direct module imports reproduce the business bypass without a forged access object, without `PlanningAuthority`, without Work/Objective admission, and without events. Source naming and the protected `Planning.of` factory do not cure the unguarded runtime constructors.

## Blocker 2 ??? Duplicate Business Entries

**Result: PASS through the required Authority/factory path.**

- `planning.aggregate.ts:151-161` computes each Dependency identity as `prerequisite->dependent` and rejects duplicates through `assertUnique`.
- `planning.aggregate.ts:167-174` computes each Priority identity as `element::scope` and rejects duplicates.
- `planning-authority.ts:85` and `:119` call `validateCompleteProposal`; that function reconstructs the proposal with `PlanningRevision.of` at `:227-249` before accepted aggregate/event construction.
- Independent forged-proposal probes returned `PLANNING_ELEMENT_DUPLICATE` for both duplicate Dependencies and duplicate Priorities. No result object was returned, and the original two-entry invalid arrays remained two entries, proving rejection rather than silent deduplication.
- A valid proposal retained one Dependency and one Priority and emitted deterministic root-first events: `PlanningEstablished`, two `PhaseAdded`, `DependencyDeclared`, `ScheduleChanged`, `PriorityChanged`.
- The authority suite passed its zero-accepted-result duplicate test, and the Foundation suite passed distinct duplicate Dependency and Priority tests.

This closure does not neutralize Blocker 1: callers using the exported runtime constructors can bypass all complete-revision validation.

## Blocker 3 ??? Withdrawal Causality and Idempotence

**Result: PASS for the exact previously reported post-withdrawal scenarios; FAIL for the complete 001C causality/idempotence contract.**

Exact previous scenarios now close correctly:

- First valid withdrawal emitted exactly `PlanningWithdrawn`, set current version to null, retained versions `[1,2]`, and retained the same immutable revision objects.
- Exact replay, altered withdrawal causality, altered provenance, and altered reason all failed closed with `PLANNING_NOT_CURRENT`.
- Reusing revision causality for withdrawal failed with `PLANNING_CAUSALITY_CONFLICT`.
- Inconsistent command causality versus `provenance.businessCause` failed with `PLANNING_CAUSALITY_CONFLICT`; authority/provenance matching is enforced at `planning-authority.ts:173-203`.
- Source evidence at `planning-authority.ts:143-170` confirms there is no unverifiable zero-event withdrawal replay heuristic.

However, fresh full-contract probes exposed incomplete causality history and replay comparison:

- Establish replay with the same proposal/provenance/causality but altered `expectedVersion: 99` was accepted with zero events. The replay branch at `planning-authority.ts:87-90` runs before expected-version validation and does not compare expected version.
- Revise replay with an altered `reason` was accepted with zero events.
- Revise replay with altered `expectedVersion: 99` was accepted with zero events. The replay comparison at `planning-authority.ts:121-125` compares only the stored revision and provenance, not reason or expected version.
- After withdrawal, a new Establish using the already accepted withdrawal causality was accepted as version 3 and emitted `PlanningEstablished`, `PhaseAdded`. `findCausality` at `planning-authority.ts:496-499` searches revision provenance only; withdrawal causality is not retained by the aggregate.

The authoritative contract at sections 3.3 and 14.5 requires same causality plus same content for replay, rejects same causality with different content, and defines CausalityId as non-reusable with different content. The current implementation invents idempotence for changed Establish/Revise command content and permits reuse of a prior withdrawal causality. Therefore the broader 001C contract fails despite closure of the originally demonstrated immediate withdrawal cases.

## Full 001C Contract Review

| Criterion | Result | Concrete evidence |
|---|---|---|
| PlanningAuthority unique producer | **FAIL** | Direct runtime constructors create genuine current aggregates without authority/admission/events. |
| EstablishPlanning | **FAIL overall** | Normal operation and events pass, but altered expected-version replay is accepted and direct construction bypasses the command. |
| RevisePlanning | **FAIL overall** | Normal contiguous revision/history/events pass, but altered reason and expected-version replays are accepted. |
| WithdrawPlanning | PASS for first operation and fail-closed immediate retries | One event, retained history, no current version; listed altered retries reject. Prior withdrawal causality is nevertheless reusable by a later Establish. |
| Global proposal validation | PASS on Authority/factory path; bypassable | References, uniqueness, acyclicity, schedule, priorities, constraints, and provenance are revalidated; runtime constructors bypass it. |
| Explicit WorkReference | PASS on Authority path | Command and event types carry WorkReference; authority checks aggregate identity and admission. |
| Explicit provenance | PASS on normal path | Commands/events carry provenance; command/proposal/authority consistency checks execute. |
| Explicit causality | **FAIL overall** | Events carry causality, but replay comparison is incomplete and withdrawal causality is not retained. |
| Expected-version control | **FAIL** | Fresh probes accepted Establish and Revise replays with expected version 99. |
| Contiguous version progression | PASS on Authority path; bypassable | `assertNextVersion` and guarded `Planning.of` enforce it; direct constructor accepted `[1,3]`. |
| Immutable historical revisions | PASS on Authority path | Objects and arrays are frozen; revision and withdrawal preserve prior object identities. |
| At most one current applicable version and latest-current rule | PASS on guarded path; bypassable | `Planning.of` checks latest; direct constructor marked version 1 current with version 3 latest. |
| Deterministic event ordering | PASS for valid operations | Fresh and authored results are root-first; dependency removals precede affected element removals; iteration order is stable from validated proposal order. |
| Zero accepted effect on failure | PASS for actual rejections | Immutable input aggregates remained unchanged and no result/events were returned. Changed replay content is incorrectly accepted, so those cases are not failures. |
| No duplicate business events | PASS on validated path | Duplicate identities reject before event construction; valid event list has one fact per business identity. |
| MilestoneReached forbidden/unemitted | PASS | No production command/event match; event union at `planning-authority.events.ts:112-127` omits it. |
| No persistence/repository/database/migration | PASS | No files, imports, symbols, or application coupling found. |
| No Work integration or Work ownership transfer | PASS | No Planning imports outside the domain; only admission-policy booleans and WorkReference are used. |
| No Progress/Monitoring mutation | PASS | No production symbols/imports found. |
| No Runtime authority | PASS in current Planning source | No Runtime import/call or Planning coupling outside the domain. Historical scope discrepancy is separately reserved below. |
| No API/BFF/frontend | PASS | Production searches found no transport or UI integration. |
| No second Planning source of truth | PASS | No store, repository, persistence, application access, or Timeline authority exists. |

The complete authorized 001C boundary therefore **FAILS** because unique production, causality/idempotence, and expected-version control are mandatory.

## Foundation 001B Non-Regression

| Foundation invariant | Result | Evidence |
|---|---|---|
| WorkReference is aggregate identity | PASS on guarded path | Root contains WorkReference and no PlanningId; Foundation test passed. |
| Revisions immutable | PASS | Aggregate, revision, and revision arrays are frozen; mutation test passed. |
| Version sequence contiguous | PASS on guarded path; **FAIL at exported runtime boundary** | Factory/Authority reject gaps; direct constructor accepted `[1,3]`. |
| Phase/Milestone identities unique | PASS through `PlanningRevision.of` | Shared element-key set rejects duplicates; Foundation test passed Phase duplicate coverage. Runtime `new PlanningRevision` can bypass validation. |
| Dependency graph valid and acyclic | PASS through `PlanningRevision.of` | Element resolution, self-reference, and DFS cycle checks exist and tests pass. Runtime constructor can bypass validation. |
| Schedule references valid elements | PASS through `PlanningRevision.of` | `planning.aggregate.ts:164-166`; missing-reference test passed. |
| Priority references valid elements | PASS through `PlanningRevision.of` | `planning.aggregate.ts:167-169`; missing references reject. |
| Constraint identity unique | PASS through `PlanningRevision.of` | `planning.aggregate.ts:144-149`. |
| Current version must be latest | PASS through `Planning.of`; **FAIL at exported runtime boundary** | Direct constructor accepted current 1/latest 3. |
| Withdrawn Planning retains history | PASS | Fresh probe retained versions `[1,2]` and identical revision objects. |
| Foundation tests | PASS | 15 tests, 15 passed, 0 failed, exit 0. |

**Foundation non-regression result: FAIL under the required runtime/direct-import audit.** The authored Foundation suite passes and the factory path retains certified behavior, but the publicly exported runtime constructors permit bypass of the contiguous-version, latest-current, and complete-revision gates. Because the Planning tree is untracked, this review cannot establish when constructor runtime reachability first arose; it evaluates the current implementation as required.

## Historical Scope Discrepancy

**Classification: B — historical evidence reservation that must remain recorded.**

Concrete evidence:

- Current `git diff -- server/nova-core/nova-core.bootstrap.ts` shows one line changed: Windows Codex probing uses `codex.exe` instead of `codex.cmd`.
- Historical `mission-delta.json` lists that bootstrap file under `Modified` during the captured original 001C interval.
- The historical transcript states `Changements hors périmètre : aucun`, contradicting the delta.
- Current Planning production source has no import of or coupling to Nova Core/Runtime, and the corrective report records that the bootstrap diff pre-existed correction and was untouched.
- The repository was already dirty, so current status alone cannot establish author or causal ownership of this unrelated line.

This remains a material evidence-integrity reservation. It is not classified A because the line does not affect current Planning semantics. It is not classified C on the available evidence because this review cannot objectively attribute the still-dirty line to the corrected implementation, and no current Planning-to-Runtime boundary exists. The reservation is not erased and would still require human reconciliation of the contradictory historical artifacts.

## Independent Behavioral Probes

All probes imported current source and ran through stdin; they wrote no files.

1. Token/export probe: former factories and `AUTHORITY_ACCESS` were absent from exports; forged access returned `PLANNING_VERSION_CONFLICT`.
2. Direct constructor probe: `new PlanningRevision` plus `new Planning` produced a current version 1 with no Authority, admission, command, or event.
3. Direct invariant probe: `new Planning` accepted non-contiguous versions `[1,3]` and current version 1 although latest was 3.
4. Duplicate proposal probe: duplicate Dependency and Priority cases each returned `PLANNING_ELEMENT_DUPLICATE`; arrays remained length 2, so no silent deduplication occurred.
5. Valid Establish/Revise probe: versions progressed `[1,2]`; root event came first; one event was emitted for each changed business identity; history was frozen.
6. Withdrawal probe: first withdrawal emitted one `PlanningWithdrawn`; exact and altered immediate retries returned `PLANNING_NOT_CURRENT`; reused revision causality returned `PLANNING_CAUSALITY_CONFLICT`; history remained `[1,2]` with identical revision objects.
7. Replay-content probe: altered Establish expected version, altered Revise reason, and altered Revise expected version were each accepted with zero events.
8. Lost-withdrawal-causality probe: a post-withdrawal Establish reused the accepted withdrawal causality and was accepted as version 3 with normal establishment events.

These probes independently reproduce the required former failure cases and test adversarial routes not asserted by the authored suite.

## Validation Results

| Validation | Exit/result |
|---|---|
| `node --import tsx --test server/domain/planning/planning-authority.test.ts` | Exit 0; 12 tests, 12 passed, 0 failed; 283.4005 ms. |
| `node --import tsx --test server/domain/planning/planning-foundation.test.ts` | Exit 0; 15 tests, 15 passed, 0 failed; 284.6236 ms. |
| `node --import tsx --test server/domain/planning/*.test.ts` | Exit 0; 27 tests, 27 passed, 0 failed; 302.3216 ms. |
| `npm run typecheck:nova-core` | Exit 0; `tsc -p tsconfig.nova-core.json`; no diagnostics. |
| `git diff --check` | Exit 0; no whitespace errors. It printed LF-to-CRLF warnings for four pre-existing dirty tracked files. |
| `npm test` (additional non-regression) | Exit 0; 541 tests, 541 passed, 0 failed. |
| Planning production trailing-whitespace scan | No match. |

All mandated commands pass, but passing authored tests and typecheck do not override the independent runtime failures.

## Forbidden Boundary Verification

| Boundary | Result | Evidence |
|---|---|---|
| Persistence/repository/database/migration/recovery | NOT INTRODUCED | No matching Planning file, implementation, import, or store symbol. |
| Work integration / 001F | NOT INTRODUCED | No Planning import outside the Planning domain. |
| Application access / queries / Timeline authority / 001E | NOT INTRODUCED | No query/access/timeline file or symbol. |
| Progress/Monitoring mutation | NOT INTRODUCED | No production import or symbol. |
| Runtime authority/orchestration | NOT INTRODUCED BY PLANNING SOURCE | No production coupling; bootstrap discrepancy classified separately as B. |
| API/HTTP/BFF/frontend/UI | NOT INTRODUCED | Repository production searches found no Planning exposure. |
| P3-PLANNING-001D+ artifacts | NOT INTRODUCED | Planning inventory is limited to Foundation and Authority files/tests. |
| MilestoneReached | NOT INTRODUCED | No production Planning command or event match. |
| Second named authority or durable source | NOT INTRODUCED | One class definition; no store/source. |

No current forbidden-boundary implementation was found in Planning. The exported-constructor route is instead a current forbidden alternate mutation/production boundary inside the Planning domain and is a blocking 001C defect.

## Blockers

1. **Unique-authority runtime bypass:** direct imports can invoke the exported `PlanningRevision` and `Planning` constructors and create genuine aggregates without PlanningAuthority, admission, commands, validation, or events. They can also create non-contiguous history and a non-latest current version.
2. **Incomplete replay-content validation:** Establish ignores changed expected version during replay; Revise ignores changed reason and expected version during replay. Changed command content is accepted as idempotent zero-event success.
3. **Incomplete causality history:** withdrawal causality is not retained by the aggregate and can be reused by a later Establish with different content.

Any one blocker is sufficient for NO GO. No fix was attempted.

## Reservations

- The bootstrap mission-delta/transcript contradiction is classified B and remains unresolved historical evidence.
- The complete Planning tree remains untracked, so Git HEAD cannot establish a per-line Planning baseline or date the constructor reachability defect.
- The 001C placeholder certificate contains the 001B MissionId while remaining `PENDING_EVIDENCE`.
- Exact withdrawal replay cannot be proven without retained receipt/history and correctly fails closed immediately after withdrawal; durable receipt design remains outside this review and must not be inferred as implemented.

## Certification State

`P3-PLANNING-001C` remains `PENDING_EVIDENCE`. This report does not state or create certification, does not modify `certification-registry.json` or any certification JSON, creates no certification receipt, and does not authorize or start `P3-PLANNING-001D`. The registry's placeholder `NextAuthorizedLot` field is not treated as human authorization while 001C is pending and this review is NO GO.

## Final Evidence Verdict

The entry gate, authored tests, Foundation tests, full repository tests, Nova Core typecheck, diff check, duplicate rejection, valid event ordering, and forbidden-boundary scans pass. The decision rule nevertheless fails because PlanningAuthority is not the unique runtime producer, Foundation invariants are bypassable through direct exported constructors, changed Establish/Revise replay content is accepted, and withdrawal causality can be reused after withdrawal.

**NO GO — P3-PLANNING-001C FINAL EVIDENCE REVIEW 002 — NOT ELIGIBLE FOR CERTIFICATION**

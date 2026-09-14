# P3-ACTIONS-001D — ACTIONS PERSISTENCE — TECHNICAL REPORT

## Mission and scope

| Field | Value |
|---|---|
| DomainId | `ACTIONS` |
| LotId | `P3-ACTIONS-001D` |
| Mission type | Implementation, delta-only |
| Previous lot | `P3-ACTIONS-001C` — certified |
| Human final approval | Required |
| Runtime owner | `NOVA_CORE` |
| Execution mode | `LOCAL_SINGLE_MISSION` |

The implementation is confined to ACTIONS durability and its targeted tests. It adds no API, BFF, frontend, transport, scheduler, queue, internal application Commands/Queries service, interdomain integration, Runtime integration or external infrastructure. P3-ACTIONS-001E was not started.

## Exact delta

Files created:

1. `server/domain/actions/actions-journal.ts`
2. `server/domain/actions/actions-persistence.test.ts`
3. `Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001D-ACTIONS-PERSISTENCE/P3-ACTIONS-001D_ACTIONS_PERSISTENCE_REPORT.md`

Files modified:

1. `server/domain/actions/actions-authority.ts`
2. `server/domain/actions/index.ts`

No functional file outside `server/domain/actions/` was modified by this mission. `Docs/12_CERTIFICATION/certification-registry.json` was already modified in the incoming dirty workspace and was not touched by this mission. No certification file or infrastructure was modified.

## Selected persistence mechanism

The selected mechanism is one repository-local JSON journal file at the path explicitly supplied to `ActionsJournal`. This is the minimum compliant mechanism because Node's local filesystem and cryptography primitives are already available and no database, service, queue, network or new dependency is required.

Each committed entry has:

- a monotonic sequence;
- the preceding entry hash;
- the accepted typed Actions command;
- the complete `ActionsAuthorityReceipt`;
- a SHA-256 hash over the canonical entry content.

The lock file, candidate lock link and replacement file are transient technical coordination artifacts. They contain no ACTIONS business truth and are not stores, mirrors or projections. The single journal file is the only durable canonical source.

## Unique acceptance boundary

`ActionsAuthority.accept(command)` remains the sole operational acceptance method and the sole producer of authoritative ACTIONS mutations. `ActionsJournal` cannot create an Action, Event, Result or Dependency. It only locks, loads, validates and atomically appends the command and receipt produced by `ActionsAuthority`.

For every durable acceptance, `ActionsAuthority` performs this sequence while the journal lock is held:

1. reread the canonical journal;
2. rebuild in-memory canonical state by replay through the certified Authority semantics;
3. compare every rebuilt receipt with its durable receipt document;
4. evaluate the new command through the same certified mutation path;
5. append the accepted command and complete receipt as one journal transaction.

There is no direct business mutation path around `ActionsAuthority` and no second producer.

## Durable state and append-only history model

The receipt in every journal entry durably captures the accepted mutation's complete Action state, Action revision, coherent graph revision, authoritative ordered events and causality identity. The Action snapshot includes its purpose, status, Tasks, recorded Commands, Activities, Executions, Result history, Dependencies and provenance.

Current state is reconstructed from the ordered accepted entries; it is not held in a concurrent snapshot store. Activities, Executions and Results retain their certified insertion order. Execution-end facts remain ordered authoritative events and rebuild the certified ended-execution state. The current Result remains the certified derived value `resultHistory.at(-1)` and is never separately persisted.

Normal persistence behavior can only append a new entry. Tests prove the prior entry prefix is byte-for-data unchanged by a subsequent mutation. There is no update/delete history operation. SHA-256 predecessor linkage, monotonic sequences and semantic receipt replay detect malformed or incoherent canonical data.

## Atomic commit model

The transaction boundary is the complete journal document replacement under one exclusive inter-process lock:

1. build the next document by appending exactly one complete entry;
2. write it to a same-directory unique replacement file;
3. flush that file with `fsync`;
4. atomically rename it over the canonical journal;
5. release the lock.

Thus Action state, Action revision, all events from the mutation, Result/Dependency changes, graph revision, causality receipt and provenance cross the durable boundary together. A failure before rename leaves the preceding canonical file unchanged; an orphan replacement candidate is non-authoritative and ignored. No business compensation is created. The injected replacement-failure test proves no partial Result, event or receipt becomes visible and that the next intention first rereads canonical state.

## CAS and durable concurrency model

The lock is acquired through an atomic hard-link creation from a fully written PID candidate. A live owner causes bounded waiting; an abandoned PID lock is recoverable. All writers serialize through that lock.

After acquisition, the Authority always rereads and rebuilds the canonical state before checking `expectedRevision`. Therefore every mutation compares against the durable Action revision, not an earlier process-local view. Dependency commands additionally compare `expectedGraphRevision` with the rebuilt canonical graph revision. Stale writers receive deterministic `ACTION_REVISION_CONFLICT`; no last-write-wins path exists.

Tests use two separately constructed authorities and two genuinely concurrent Node processes. Of two conflicting process mutations with the same expected Action revision, exactly one commits and the other receives the stale revision failure. Competing graph changes cannot both commit or close a cycle.

## Durable Result model

Result history exists only inside the Action history certified by 001B/001C. The journal stores that Action state and the matching `ResultRecorded` event in the same receipt entry. Completion continues to emit `ResultRecorded` before `ActionCompleted` at one Action revision. The current Result is derived after restart from the sole ordered Result history. No Result projection or second truth field exists.

Tests prove two ordered Results survive restart, the latest remains current with provenance and external reference intact, an idempotent retry adds nothing, and an injected Result commit failure exposes neither Result, event nor receipt.

## Durable Dependency graph model

Dependencies remain stored only on their certified source Action. Rehydration uses `ActionDependency.from`, preserving source ownership, same-Work restriction and explicit provenance. Replay through `ActionsAuthority` rebuilds the global graph and invokes the certified acyclicity check for every dependency command. Graph revision is part of every durable receipt and increments atomically with a Dependency mutation.

Tests prove restart survival, source/target identity, graph revision, atomic co-location of Dependency state/event/receipt, stale graph-revision rejection and rejection of a concurrently attempted cycle.

## Causality receipt and provenance model

Every durable entry stores the full causality-bearing command and the full receipt. Receipt events preserve causality ID, source Command ID, `ACTIONS_AUTHORITY` boundary and command provenance. All embedded aggregate elements preserve their certified provenance values; external aggregate content is never copied—only admitted references remain.

On restart, the Authority rebuilds its causality map. Exact reuse returns the original rebuilt receipt without appending a journal entry. Reuse with divergent command content fails with `ACTION_CAUSALITY_CONFLICT` and leaves the journal unchanged. Duplicate durable causality entries are treated as corruption and fail closed.

## Replay and recovery model

Construction of a durable `ActionsAuthority` performs deterministic replay in sequence order. Each durable command is decoded into certified value objects and processed by the existing Authority mutation semantics. Its newly rebuilt receipt must exactly equal the persisted receipt document. Replay performs no write, invokes no external aggregate and creates no new durable fact.

Recovery behavior is:

- missing canonical file: coherent empty source;
- valid journal: deterministic rebuild of Actions, histories, receipts, revisions and graph;
- abandoned PID lock: reclaimed after proving its owner is not live;
- interrupted pre-rename replacement file: ignored as non-authoritative;
- unknown format, invalid JSON, invalid value objects, broken sequence/hash link, hash mismatch, duplicate causality or semantic receipt mismatch: `ACTIONS_JOURNAL_CORRUPT`, fail closed;
- write/flush/replace failure: `ACTIONS_JOURNAL_WRITE_FAILED`, preceding canonical journal retained;
- live writer beyond the bounded lock interval: `ACTIONS_JOURNAL_BUSY`, no mutation.

Recovery never edits accepted history, discards a conflicting authoritative entry, calls another domain or invents a business compensation.

## Validation evidence

Commands executed from the repository root on 2026-09-10:

1. `node --import tsx --test server/domain/actions/actions-persistence.test.ts`
   - PASS: 7
   - FAIL: 0
   - Coverage: durable creation/state; ordered Activities, Executions, Results and events; append-only prefix; receipts; provenance; restart; Action and graph CAS; real inter-process conflict; Result atomic failure; Dependency state/event/receipt atomicity; cycle prevention; idempotent and divergent causality; deterministic replay; interrupted candidate; cryptographically valid but semantically incoherent corruption.
2. `node --import tsx --test server/domain/actions/action-foundation.test.ts server/domain/actions/actions-authority.test.ts`
   - PASS: 20
   - FAIL: 0
   - Applicable certified 001B/001C non-regression: PASS.
3. `npx.cmd tsc -p server/domain/actions/tsconfig.json --noEmit`
   - Exit code: 0
   - Strict TypeScript typecheck: PASS.
4. `git diff --check`
   - Exit code: 0
   - Result: PASS. Git emitted only pre-existing line-ending notices for unrelated dirty files; no whitespace error.

An additional combined run executed all three ACTIONS files together:

- PASS: 27
- FAIL: 0
- cancelled/skipped/todo: 0/0/0.

## Non-regression and separation

The 001B aggregate invariants and 001C Authority tests all pass unchanged. The implementation imports only Node standard-library primitives and files inside `server/domain/actions/`. It acquires no Work Objective/Lifecycle/Progress, Planning, PEOPLE identity/role/Assignment, Decisions authorization, Deliverables content or Runtime ownership. Runtime technical state never becomes ACTIONS truth.

No public API, internal Commands/Queries application service, projection, cache, database, scheduler, queue or transport was added. In-memory no-argument `new ActionsAuthority()` behavior remains supported and all certified in-memory tests pass.

## Remaining unknowns explicitly deferred

- Cross-Work Dependency semantics remain unknown and therefore disallowed by the certified foundation.
- Operational selection of the production journal path, backup retention and deployment filesystem policy are outside this domain lot; the mechanism accepts an explicit local path and creates no infrastructure policy.
- Journal compaction, archival and scale thresholds are not introduced because they would require new certified rules for preserving append-only authority.
- Internal Commands/Queries access belongs to P3-ACTIONS-001E and was not started.
- Work, Planning, PEOPLE, Decisions, Deliverables and Runtime integrations remain deferred to their authorized lots.

## Technical verdict

TECHNICAL GO — P3-ACTIONS-001D — READY FOR HUMAN APPROVAL

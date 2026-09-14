# P3-ACTIONS-001F — ACTIONS WORK INTEGRATION — TECHNICAL REPORT

## Mission identity

| Attribute | Value |
|---|---|
| DomainId | `ACTIONS` |
| LotId | `P3-ACTIONS-001F` |
| MissionId | `P3-ACTIONS-001F-IMPLEMENTATION-001` |
| MissionType | `IMPLEMENTATION` |
| Mode | `DELTA-ONLY` |
| Runtime owner | `NOVA_CORE` |
| Execution mode | `LOCAL_SINGLE_MISSION` |
| PreviousLot | `P3-ACTIONS-001E — CERTIFIED` |
| NextAuthorizedLot after canonical certification only | `P3-ACTIONS-001G` |
| Human final approval | Mandatory |

This mission implemented only the internal Work/ACTIONS integration. It did not certify itself and did not modify `Docs/12_CERTIFICATION/certification-registry.json`.

## Exact mission delta

### Files created

- `server/domain/work/work-actions.types.ts`
- `server/domain/work/work-actions.query.ts`
- `server/domain/work/work-actions.test.ts`
- `Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001F-ACTIONS-WORK-INTEGRATION/P3-ACTIONS-001F_ACTIONS_WORK_INTEGRATION_REPORT.md`

### Files modified

- `server/domain/work/index.ts`

No other file was created or modified by this mission. In particular, no ACTIONS implementation file, public transport, PLANNING, PEOPLE, Runtime/Core, CEREBRAU infrastructure or certification-registry file was changed. The pre-existing dirty workspace was left untouched.

## Tests defined before implementation

`server/domain/work/work-actions.test.ts` was created before the functional implementation. Its initial execution was:

```text
node --import tsx --test server/domain/work/work-actions.test.ts
```

Initial result: **expected RED — 0 PASS, 1 FAIL file**. The module failed because `WorkActionsQuery` was not yet exported. The tests specified, before implementation, the three states, zero/one/multiple cardinality, canonical `WorkReference`, durable canonical reads, read-only behavior, zero mirror, separation from Work Lifecycle/Objective/Progress, and PLANNING/PEOPLE/Runtime ownership.

## Architecture implemented

The implemented direction is:

```text
Work consumer
  -> WorkActionsQuery
  -> WorkActionsReadSource.listActionsByWork(WorkReference)
  -> ActionsInternalQueries.listActionsByWork
  -> ACTIONS canonical or canonically rebuilt state
```

`WorkActionsReadSource` contains one read method only. It is structurally satisfied by the certified `ActionsInternalQueries` capability from P3-ACTIONS-001E. `WorkActionsQuery` receives neither `ActionsInternalCommands`, `ActionsAuthority`, `ActionsJournal`, repository nor persistence capability.

The returned `WorkActionReadItem` is an immutable, transient, non-authoritative DTO containing only `actionId`, Action-owned `status`, `revision`, and `graphRevision`. It is rebuilt on every call from the ACTIONS read result. It is not an Action aggregate and contains no purpose, Task, Command, Activity, Execution, Result, Dependency, event, history, provenance, repository or store.

## WorkReference and cardinality behavior

The Work-facing `{ projectId, workId }` is converted once to the canonical ACTIONS `WorkReference`. That exact value is passed to `listActionsByWork`. Every returned Action is checked against the requested `WorkReference`; a mismatched, malformed or duplicate result fails closed as `ACTIONS_UNAVAILABLE` with reason `ACTIONS_READ_INCONSISTENT`.

Successful canonical reads support:

- zero Actions: `ACTIONS_AVAILABLE_EMPTY` with a frozen empty collection;
- one Action: `ACTIONS_AVAILABLE` with one transient item;
- multiple Actions: `ACTIONS_AVAILABLE` with all items, deterministically ordered by local `ActionId`.

Every Action continues to carry exactly one canonical `WorkReference` inside ACTIONS. Work introduces no alternative association identity.

## Exact three-state vocabulary and semantics

The vocabulary comes directly from `ACTIONS_IMPLEMENTATION_CONTRACT.md`, section 11.1, which names the three states and defines them as producer unavailable, empty collection, and non-empty collection.

| State | Exact semantics |
|---|---|
| `ACTIONS_UNAVAILABLE` | The ACTIONS internal read threw, returned a malformed value, returned an Action for another `WorkReference`, exposed invalid revisions, or duplicated an Action identity. No synthetic Action collection is returned. |
| `ACTIONS_AVAILABLE_EMPTY` | The ACTIONS canonical/internal read succeeded and returned zero Actions for the requested `WorkReference`. |
| `ACTIONS_AVAILABLE` | The ACTIONS canonical/internal read succeeded and returned one or more Actions for the requested `WorkReference`. |

These are availability/relationship states only. They do not replace any of the seven Action lifecycle statuses and do not define Work Lifecycle, Work Progress, Planning status, PEOPLE assignment or Runtime state.

## Proof of zero mirror

- Work stores only the injected read port reference inside `WorkActionsQuery`.
- Each result is derived synchronously from `listActionsByWork`; there is no retained Action list.
- The Work DTO omits the Action aggregate and all subordinate authoritative state.
- No cache, projection store, repository, journal, database or persistence mechanism was added.
- The durable test reconstructs ACTIONS from the canonical journal, reads twice through Work, and proves the journal bytes remain unchanged.
- The test checks that `WorkActionsQuery` owns only its read dependency and that returned items contain exactly four transient fields.

## Proof that WORK cannot mutate ACTIONS

The only Work/ACTIONS port method is:

```text
listActionsByWork(workReference: WorkReference): readonly CurrentAction[]
```

No command method or mutation capability is exposed. Work cannot create, modify, transition, complete or cancel an Action; record a Result; mutate Tasks or Dependencies; append to `ActionsJournal`; call `ActionsAuthority`; or reproduce authority rules. Durable journal content is byte-identical before and after repeated Work reads.

The targeted structural scan found no reference from the new functional files to `ActionsAuthority`, `ActionsInternalCommands`, `ActionsJournal`, HTTP/BFF/controller/router/endpoint, scheduler, queue, Work Lifecycle or Work Progress.

## Work Lifecycle, Objective and Progress separation

The result types contain no Objective, Lifecycle, Progress, progression, completion or Work business-state field. The separation test snapshots independent Work truths, performs a non-empty ACTIONS lookup, and proves those truths are byte-identical afterward. Neither Action count, status nor Result is used in a Work calculation.

Existing Work implementation was not changed except for exporting the new read-only integration symbols.

## PLANNING, PEOPLE and Runtime ownership separation

- PLANNING: no Phase, Milestone, deadline, Schedule, planned Priority or Constraint is read, copied, inferred or mutated.
- PEOPLE: no Business Identity, person, role, assignee or Assignment is read, copied, inferred or mutated.
- Runtime: no Mission, agent, run or technical execution status is read, promoted, projected or mutated.

The integration test asserts those concepts are absent from both the association result and each transient Action item. The targeted import/primitive scan returned no match. No file in those domains was modified.

## Validation evidence

### P3-ACTIONS-001F focused tests

```text
node --import tsx --test server/domain/work/work-actions.test.ts
```

Result: **PASS — 8 tests, 8 PASS, 0 FAIL, 0 skipped, 0 cancelled, 0 todo**.

### ACTIONS and all applicable Work/domain tests

```text
node --import tsx --test server/domain/actions/*.test.ts server/domain/work/*.test.ts server/runtime/work/*.test.ts
```

Result: **PASS — 100 tests, 100 PASS, 0 FAIL, 0 skipped, 0 cancelled, 0 todo**.

Breakdown:

- certified ACTIONS P3-ACTIONS-001B/001C/001D/001E behavior: **33/33 PASS**;
- P3-ACTIONS-001F Work/ACTIONS integration: **8/8 PASS**;
- certified Work/PLANNING internal integration: **8/8 PASS**;
- applicable Work Core, Objective, Decisions, Deliverables, PEOPLE and technical-agent suites: **51/51 PASS**.

### Strict TypeScript validation

```text
npx tsc -p server/domain/actions/tsconfig.json
npx tsc -p server/domain/work/tsconfig.json
npm run typecheck:nova-core
```

Result: **PASS — 0 TypeScript errors for ACTIONS, Work and NOVA Core**. The domain configurations use `strict: true` and `noEmit: true`.

### Core non-regression

```text
npm run test:core
```

Result: **PASS — 541 tests, 541 PASS, 0 FAIL, 0 skipped, 0 cancelled, 0 todo**.

### Separation scan

```text
rg -n "from .*?(planning|people|runtime|nova-bff)|\b(Http|Controller|Router|Endpoint|Bff|Frontend|Scheduler|Queue|ActionsAuthority|ActionsInternalCommands|ActionsJournal|WorkProgress|WorkLifecycle)\b" server/domain/work/work-actions.query.ts server/domain/work/work-actions.types.ts
```

Result: **PASS — no match** (`rg` exit 1 means zero match).

### Git whitespace check

```text
git diff --check
```

Result: **PASS — exit code 0**. Git emitted only LF/CRLF warnings for pre-existing incoming files outside this mission; no whitespace error was reported.

## Preservation of certified ACTIONS invariants

The 33/33 unchanged ACTIONS tests prove no regression of the P3-ACTIONS-001B through 001E implementation: one canonical durable source, append-only histories, atomic state/events/receipt commits, Action revision CAS, graph revision CAS, deterministic replay and recovery, fail-closed corruption handling, durable causality/provenance, command idempotence and read-only Queries.

No ACTIONS source file was modified. The new durable integration test additionally proves that the Work boundary reads canonically rebuilt state without writing to the journal.

## Remaining unknowns

- Public transport, API/BFF/frontend presentation, scheduling, queues and external integrations remain undecided and unimplemented.
- Future optional ACTIONS relations with PLANNING, PEOPLE, Decisions, Deliverables and Runtime remain outside this lot.
- Canonical certification remains pending mandatory human approval.

No blocking technical unknown remains within P3-ACTIONS-001F.

## Stop-condition confirmation

P3-ACTIONS-001G was not started. No canonical certification was performed and the certification registry was not modified by this mission.

TECHNICAL GO — P3-ACTIONS-001F — READY FOR HUMAN APPROVAL

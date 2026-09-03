# P3-PEOPLE-001C — AUTHORITY RECERTIFICATION REPORT

> **This report is a present-time authority-directed recertification report. It is not represented as the missing original historical execution report.**

## 1. Authority basis and review identity

The project owner and supreme project authority explicitly authorized a fresh, non-backdated review of `P3-PEOPLE-001C`. The authority decision permits a new GO only if current technical conformity is proven. It does not permit implementation repair, weakened requirements, historical reconstruction, or automatic acceptance.

Review date: `2026-08-08` (Europe/Paris). Current evidence collected through `2026-08-08T12:48:53.8305405+02:00`.

## 2. Historical certification identity

Source: `Docs/12_CERTIFICATION/PEOPLE/P3-PEOPLE-001C.certification.json`.

| Field | Exact recorded value | Classification |
|---|---|---|
| `MissionId` | `P3-PEOPLE-001C-CERTIFICATION` | HISTORICALLY_RECORDED |
| `DomainId` | `PEOPLE` | BOTH |
| `LotId` | `P3-PEOPLE-001C` | BOTH |
| `Status` | `CERTIFIED` | HISTORICALLY_RECORDED |
| `CertifiedAt` | `2026-07-30T21:51:55.8462856+00:00` | HISTORICALLY_RECORDED |
| `PreviousLot` | `P3-PEOPLE-001B` | BOTH |
| `NextAuthorizedLot` | `P3-PEOPLE-001D` | BOTH |

The JSON existed before this mission, was read without modification, and had SHA-256 `FD11140C74870F50B04BB7BE628B498ED4602EB0D196706AFD43AB835215F898` during review.

## 3. Original-report search

The complete worktree, all commits reachable through `git rev-list --all --reflog`, reachable/reflog object paths, Git log paths, and Markdown content were searched. The only C-specific report found was `Docs/24_MODULES/WORK/PEOPLE_CERTIFICATION/P3-PEOPLE-001C_EVIDENCE_RECOVERY_REPORT.md`, which explicitly is not the original execution report.

**ORIGINAL B/C FINAL REPORTS NOT FOUND**

The absence is an acknowledged documentary omission and is not, by itself, the reason for the decision below.

## 4. Canonical C requirements

The canonical contract and Blueprint were reviewed in full. C must establish `PeopleAuthority` as the unique authoritative PEOPLE write boundary; expose the ten canonical internal command entry points; emit thirteen canonical immutable event types; protect aggregate construction; preserve the dependency direction Foundation → Authority consumer; enforce business provenance and stable causality; provide exact idempotent replay and conflict behavior; preserve explicit role/assignment lifecycle and immutable history; and contain no persistence, query/read-model, public API/BFF, Work mutation, RuntimeAgent, or TechnicalAgent concern in the historical C boundary.

The contract specifically requires:

- `PeopleAuthority` as the sole acceptance point (`PEOPLE_IMPLEMENTATION_CONTRACT.md:153`);
- on resume, valid roles become effective **according to their periods** (`:353`);
- domain events are immutable after acceptance (`:381`);
- stable-causality replay semantics (`:743-744`);
- history and role changes remain explicit and non-retroactive (`PEOPLE_DOMAIN_BLUEPRINT.md:305`, `:342`, `:390`).

## 5. Current authority audit

| Requirement | Result | Current evidence |
|---|---|---|
| Single authoritative producer | PASS | One `PeopleAuthority` class exists; the later `PeopleCommandService` loads/routes/commits and delegates every business transition to it. |
| Ten canonical command entry points | PASS | Create, assign, remove, grant, revoke, change Owner, assign Approver, replace, suspend, and resume methods/types are present. |
| Thirteen canonical event types | PASS for inventory | `PeopleDomainEvent` is the union of the thirteen contract event names. |
| Runtime-immutable accepted events | **FAIL** | Events are shallow-frozen, but stored `Date` objects remain mutable; a focused current check changed an accepted event timestamp from 2026 to 2030. |
| Protected aggregate construction | PASS with later-layer qualification | Constructors are private and require the Foundation identity token. Later D history rehydration legitimately reconstructs accepted state through this boundary; it does not accept a new business intention. |
| Foundation → Authority dependency direction | PASS | Authority imports Foundation; the eight Foundation artifacts do not import Authority. |
| No persistence/query/API inside C artifacts | PASS | The five C artifacts remain pure. Persistence, command service, query service, and Work integration are separate later-layer files. |
| No RuntimeAgent/TechnicalAgent authority | PASS | No such dependency or source appears in the five C artifacts; foreign authority provenance is rejected. |
| Provenance validation | PASS | Each public transition checks the `PeopleProvenance.authority` against the established People Authority. |
| Causality and replay checks | PASS for covered cases | Same-causality exact replay and divergent reuse logic exist and covered current scenarios pass. |
| Explicit role lifecycle and historical coherence | **FAIL** | Current resume logic reopens every historical role, including a role revoked before suspension. This silently grants a role without `AssignBusinessRole` and rewrites the effective meaning of the role history. |
| No competing authoritative producer | PASS | Repository scan found no second class accepting PEOPLE business transitions. Durable rehydration and read/query adapters do not produce new facts. |

## 6. Mandatory current contradictions

### 6.1 Revoked role is silently re-granted on resume

The pre-existing worktree modification in `server/domain/people/people-authority.ts:596-603` maps every `assignment.roleAssignments` entry through `upsertRolePeriod` during resume. It does not remember or select only the roles effective immediately before suspension.

A focused current counterexample executed this sequence using public domain entry points:

1. assign a person with `CONTRIBUTOR` and `REVIEWER`;
2. explicitly revoke `REVIEWER` at `10:02`;
3. suspend at `10:03`;
4. resume at `10:04`;
5. inspect `REVIEWER` at `10:04`.

Observed output:

```json
{
  "status": "ACTIVE",
  "reviewerWasRevokedAt": "2026-08-08T10:02:00.000Z",
  "reviewerEffectiveAfterResume": true,
  "reviewerPeriods": [
    { "from": "2026-08-08T10:01:00.000Z", "until": "2026-08-08T10:02:00.000Z" },
    { "from": "2026-08-08T10:04:00.000Z", "until": null }
  ]
}
```

The focused check deliberately returned nonzero when the revoked role became effective. This is a mandatory contradiction: resume is not an authorization to grant a previously revoked role, the contract requires roles to resume according to their valid periods, and role evolution must be explicit.

### 6.2 Accepted event timestamp remains mutable

`event()` shallow-freezes the event object (`people-authority.ts:1076-1084`), but event payloads store mutable `Date` instances such as `effectiveAt`. A focused current check obtained an accepted `BUSINESS_IDENTITY_RECOGNIZED` event and called `setUTCFullYear` on its `effectiveAt` value.

Observed output:

```json
{
  "eventFrozen": true,
  "before": "2026-08-08T11:00:00.000Z",
  "after": "2030-08-08T11:00:00.000Z",
  "runtimeTimestampMutated": true
}
```

The check deliberately returned nonzero on mutation. TypeScript `Readonly` and outer `Object.freeze` do not make a JavaScript `Date` immutable. This contradicts the mandatory event immutability requirement and materially contradicts the C JSON assertion when evaluated against the current runtime implementation.

## 7. Historical evidence classification

| Recorded assertion | Classification | Present-time finding |
|---|---|---|
| Five named Authority files verified | BOTH | All five exist and were inspected; `people-authority.ts` has pre-existing uncommitted edits. |
| `PeopleAuthority` is the single write boundary | BOTH | No competing business producer was found. |
| Ten of ten canonical command entry points | BOTH | All ten types and public methods exist. |
| Thirteen of thirteen canonical event types | BOTH for inventory | All thirteen event names/types exist. |
| Canonical immutable domain events | **CONTRADICTED** | A stored event `Date` can be mutated after acceptance. |
| Private constructors and Foundation access required | BOTH | Current construction checks remain present. |
| No external direct aggregate construction references | HISTORICALLY_RECORDED | Later D rehydration now reconstructs through the Foundation boundary; this is legitimate later-layer reconstruction, not proof of the former repository-wide absence. |
| Authority depends on Foundation; Foundation does not depend on Authority; pure index | BOTH | Current import/export scan confirms the direction. |
| Persistence/query/read model/projection/API absent | BOTH when scoped to historical C artifacts | Later D/F implementations legitimately exist elsewhere. |
| RuntimeAgent/TechnicalAgent dependency absent | BOTH | Current C artifacts remain independent of both. |
| Authoritative provenance enforcement | BOTH | Current source and covered tests verify authority matching. |
| Idempotence and ordered immutable facts | **CONTRADICTED in part** | Covered replay behavior passes, but role-resume causality silently grants revoked state and accepted event dates are mutable. |
| Historical strict PEOPLE typecheck PASS | BOTH | Fresh strict PEOPLE typecheck passed. |
| Historical targeted compilation emitted 13 files | HISTORICALLY_RECORDED | Exact historical command/output was not retained or replayed. |
| Historical People tests `10/10` | HISTORICALLY_RECORDED | Exact historical execution was not retained; current full suite is separately `37/37`. |
| Historical NOVA Core typecheck PASS | BOTH | Fresh typecheck passed. |
| Historical Runtime tests `24/24` | HISTORICALLY_RECORDED | Not rerun in this mission. |
| Historical Core tests `506/506` | HISTORICALLY_RECORDED | Not rerun; current repository inventory differs. |
| Historical CEREBRAU certification tests `24/24` | HISTORICALLY_RECORDED | Not rerun in this mission. |
| Historical `git diff --check` PASS | BOTH | Fresh command exited 0 with pre-existing line-ending warnings only. |
| Historical `Regressions: NONE` | HISTORICALLY_RECORDED | Exact historical context is unavailable; current uncommitted Authority behavior contains the contradictions above. |

## 8. CURRENT RECERTIFICATION VERIFICATION

| Command/check executed during this mission | Result |
|---|---|
| `node --import tsx --test server/domain/people/*.test.ts` | PASS — 37 tests, 37 pass, 0 fail, exit 0. |
| strict PEOPLE typecheck over all current `server/domain/people/*.ts` | PASS — no diagnostic, exit 0. |
| `npm.cmd run typecheck:nova-core` | PASS — exit 0. |
| `git diff --check` before report writing | PASS — exit 0; pre-existing line-ending warnings only. |
| focused revoked-role → suspend → resume counterexample | **FAIL AS REQUIRED COUNTERTEST** — revoked role became effective; nonzero. |
| focused accepted-event Date mutation counterexample | **FAIL AS REQUIRED COUNTERTEST** — timestamp changed after acceptance; nonzero. |

All executions above are current recertification evidence, not historical C executions. Passing broad suites do not override focused reproducible violations of mandatory requirements.

## 9. B → C coherence and later layers

The structural dependency direction remains correct: Foundation owns and protects domain structures; Authority consumes Foundation and accepts intentions. Foundation does not depend on Authority. Persistence D, command service E, queries F, and Work integration G are legitimate later-layer implementations outside historical C scope; their presence is not itself a failure.

However, full behavioral coherence cannot be certified because the current Authority transition can re-authorize a revoked role and its accepted event representation is mutable. Later adapters delegating to Authority inherit rather than cure these defects. The current broad D–G tests do not exercise the failing role-history combination or event Date mutation.

## 10. Regression and write-scope analysis

The Authority change implicated by the counterexample was present in the initial worktree and is not attributed to this mission. This mission did not modify source, tests, architecture, contract, Blueprint, JSON certifications, or registry. Repair would require implementation and test changes outside the authorized three-report write scope; the mission expressly forbids such repair.

## 11. Residual risks and required disposition

- The missing original C report, raw outputs, executor, and original Git context remain unknown.
- The two current contradictions are reproducible and affect mandatory C requirements.
- An implementation correction and dedicated regression tests would be necessary before a future C recertification attempt, but no such work is authorized here.

## 12. Certification decision

The historical JSON remains intact and is not declared fabricated. Nevertheless, present-time technical conformity is not proven: mandatory role-lifecycle and event-immutability requirements are contradicted by current executable behavior, and implementation modification would be required.

NO GO — P3-PEOPLE-001C — AUTHORITY RECERTIFICATION FAILED

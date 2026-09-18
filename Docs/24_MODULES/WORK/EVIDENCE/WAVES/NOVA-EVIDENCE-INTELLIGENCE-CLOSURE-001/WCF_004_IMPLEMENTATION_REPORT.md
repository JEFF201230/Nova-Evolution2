# WCF-004 — Work Sources and Evidence — Implementation Report

Mission: `WCF-004-IMPLEMENTATION-001`
Program: `PROGRAM-003`
Lot: `WCF-004`
Date: `2026-09-16`
Nature: technical implementation evidence; not a certification and not a human approval.

## Entry state

The mission-provided certified entry facts were applied: runtime owner `NOVA_CORE`, execution mode `LOCAL_SINGLE_MISSION`, human final approval required, no CEREBRAU or VEEDDA runtime dependency, `P3-EVIDENCE-001B = CERTIFIED`, `WCF-004A = CERTIFIED`, `NextAuthorizedLot = WCF-004`, and `WCF-004 = AUTHORIZED` in implementation mode. The registry was read, not modified; it confirms `P3-EVIDENCE-001B` and `WCF-004A` as `CERTIFIED` and `WCF-004` as the next authorized Work lot.

`MISSION_ORDER_WCF_004.md` retains its prepared-time `BLOCKED_BY_PHASE_1` wording. That historic wording is superseded for this execution by the certified entry facts and by the current registry dependency state; no document or registry status was rewritten by this mission.

## Authoritative sources consulted

1. `MISSION_ORDER_WCF_004.md`
2. `WORK_IMPLEMENTATION_CONTRACT.md` in the WCF closure wave
3. `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md`
4. `EVIDENCE_DOMAIN_BLUEPRINT.md` in the WCF closure wave
5. `server/domain/evidence/index.ts`
6. `server/domain/evidence/evidence-model.ts`
7. `server/domain/evidence/evidence-internal-queries.ts`
8. `server/domain/evidence/evidence-authority.ts`
9. `server/domain/evidence/evidence-journal.ts`
10. `server/domain/evidence/evidence-foundation.test.ts` (targeted query/certification conventions)
11. `server/domain/work/work-actions.query.ts`, `work-actions.types.ts`, `work-actions.test.ts`
12. `server/domain/work/work-planning.query.ts`, `work-planning.types.ts`, `work-planning.test.ts`
13. `server/domain/work/index.ts` and `server/domain/work/tsconfig.json`
14. `Docs/12_CERTIFICATION/certification-registry.json` (read-only)

No recursive repository audit was performed.

## Exact delta

Created:

- `server/domain/work/work-evidence.types.ts`
- `server/domain/work/work-evidence.links.ts`
- `server/domain/work/work-evidence.query.ts`
- `server/domain/work/work-evidence.test.ts`
- this report

Modified:

- `server/domain/work/index.ts` — exports for the WCF-004 internal capability only

Not modified:

- `server/domain/work/tsconfig.json`
- `server/domain/evidence/**`
- `Docs/12_CERTIFICATION/certification-registry.json`
- every forbidden product/runtime/application path

Pre-existing workspace changes, including the already modified certification registry and CEREBRAU orchestration module and the pre-existing untracked Evidence/wave material, were neither changed nor attributed to WCF-004.

## Association and persistence model

The sole association identity is `(projectId, workId, evidenceId)`. The active link contains exactly:

- `projectId`
- `workId`
- `evidenceId`
- immutable link provenance (`source`, `actor`, `causalityId`)
- `linkedAt`

The Work-owned durable journal records only `WORK_EVIDENCE_LINKED` and `WORK_EVIDENCE_UNLINKED` association facts, an idempotency identity needed for replay, ordering, and an integrity hash chain. It never stores `BusinessEvidenceRecord`, Evidence source payload, Evidence lifecycle, Evidence history, Certification status, or Certification reference.

Recovery rebuilds only currently active link tuples from the journal. Duplicate active tuples and divergent reuse of an idempotency identity fail closed. Identical tuple creation is idempotent. Unlink changes only Work's association journal and makes no call to Evidence.

Many-to-many is supported: one Work can link several Evidence identities and one Evidence identity can be linked to several Work identities, while each exact tuple remains unique.

## Internal query and authority boundaries

`WorkEvidenceQuery` composes:

- `WorkEvidenceLinks.listByWork` for Work-owned link facts;
- the already certified `EvidenceInternalQueries.byEvidenceId` / `byOrderedEvidenceIds` shape for authoritative Evidence resolution;
- the already certified `EvidenceCertificationResolver` shape when Certification is requested.

No second Evidence store, Evidence aggregate, Evidence command port, Certification store, or product dependency was introduced.

Top-level query states are:

- `AVAILABLE_EMPTY`: no links and the Evidence authority answered the certified availability probe;
- `AVAILABLE`: one or more links were resolved, including explicit per-link `EVIDENCE_FOUND` or `EVIDENCE_UNKNOWN` states;
- `UNAVAILABLE`: link persistence unavailable/inconsistent, Evidence authority unavailable, or Evidence read structurally inconsistent.

An unavailable Evidence producer is never mapped to empty. An unknown Evidence identifier is an `EVIDENCE_UNKNOWN` item inside an otherwise available authoritative read, distinct from authority unavailability.

For found Evidence, the query returns the exact transient `BusinessEvidenceRecord` supplied by Evidence and the current owner-supplied lifecycle (`ACTIVE`, `WITHDRAWN`, `INVALIDATED`, or `SUPERSEDED`). Work persists none of it. Withdrawn and invalidated records therefore remain owner-interpreted live values.

When Certification is requested, absence of a reference is `REFERENCE_ABSENT`, a successful owner resolution is `RESOLVED`, and an absent/failing Certification owner is `AUTHORITY_UNAVAILABLE`. No Certification state is mirrored in Work.

The query exposes no Work link command, Evidence command, Evidence authority, or Certification command. Repeated reads leave both persistence boundaries byte/event-identical.

## Invariant evidence

The WCF-004 test suite demonstrates:

1. unique tuple identity and duplicate/idempotent creation;
2. unlink without Evidence deletion or mutation;
3. zero/one/many cardinality;
4. many-to-many associations;
5. `AVAILABLE_EMPTY` only with an available Evidence authority;
6. producer `UNAVAILABLE` distinct from empty;
7. unknown Evidence distinct from producer unavailability;
8. withdrawn and invalidated lifecycle read live from Evidence;
9. Certification owner resolution and explicit Certification unavailability;
10. durable link identity/provenance recovery;
11. absence of Evidence payload/lifecycle/history/Certification data from Work persistence;
12. exact transient use of canonical Evidence query records without a Work copy;
13. read-only repeatability over both Work-link and Evidence persistence;
14. no Evidence creation, mutation, withdrawal, invalidation, certification, or deletion capability from Work;
15. no CEREBRAU import or runtime dependency.

## Validations

| Validation | Result | Exact count |
|---|---|---:|
| `node --import tsx --test server/domain/work/work-evidence.test.ts` | PASS | 10 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo |
| `node --import tsx --test server/domain/work/*.test.ts` | PASS | 26 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo |
| `node --import tsx --test server/domain/evidence/*.test.ts` | PASS | 9 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo |
| `npm.cmd test` — Runtime | PASS | 24 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo |
| `npm.cmd test` — NOVA Core | PASS | 542 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo |
| `npx.cmd tsc -p server/domain/work/tsconfig.json` | PASS | 0 TypeScript errors |
| `npx.cmd tsc -p server/domain/evidence/tsconfig.json` | PASS | 0 TypeScript errors |
| `npm.cmd run typecheck:nova-core` | PASS | 0 TypeScript errors |
| `git diff --check` (global tracked delta) | PASS | 0 whitespace errors |
| no-index whitespace checks for all four new `work-evidence*.ts` files | PASS | 0 whitespace diagnostics |
| CEREBRAU reference scan in WCF-004 code | PASS | 0 matches |

The first targeted test run reported 8 pass and 2 fail because two test assertions incorrectly required object-reference identity across journal rebuilds and assumed registration order instead of the contract's deterministic EvidenceId sort. Product behavior and typecheck were already correct. The assertions were corrected to check business identity, deterministic ordering, and the exact object returned by the Evidence query during the same read. The required final run is the passing run recorded above.

## Forbidden-file control and blockers

The implementation delta contains no change under `server/domain/evidence/**`, `server/domain/actions/**`, `server/domain/people/**`, `server/domain/planning/**`, `apps/**`, frontend, BFF, public HTTP/API, Runtime Evidence, Mission Technical Evidence, or CEREBRAU orchestration. It does not modify the certification registry and does not open `WORK-AUTHORIZED-STATE-001`.

No technical blocker remains. Human QA/certification acceptance remains required, and this report makes no certification claim.

## Technical decision

All WCF-004 implementation, targeted test, persistence/recovery, boundary, regression, typecheck, diff, and forbidden-path controls pass. The lot is technically ready for the separately authorized QA/certification mechanism.

TECHNICAL GO — WCF-004 — READY FOR QA/CERTIFICATION ACCEPTANCE

# P3-ACTIONS-001F — ACTIONS WORK INTEGRATION — IMPLEMENTATION PROMPT

## 1. MISSION IDENTITY

DomainId: ACTIONS
LotId: P3-ACTIONS-001F
MissionId: P3-ACTIONS-001F-IMPLEMENTATION-001
MissionType: IMPLEMENTATION
Mode: DELTA-ONLY

PreviousLot: P3-ACTIONS-001E — CERTIFIED
NextAuthorizedLot on successful canonical certification only: P3-ACTIONS-001G

Human approval is mandatory before canonical certification.
This mission MUST NOT certify itself or modify the certification registry.

## 2. AUTHORITATIVE SOURCES

Use as authoritative inputs:

- Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md
- Docs/24_MODULES/WORK/ACTIONS_IMPLEMENTATION_CONTRACT.md
- the certified ACTIONS implementation produced by P3-ACTIONS-001B through P3-ACTIONS-001E
- the existing certified WORK domain contracts and implementation only where required to establish the internal Work/Actions integration

Do not reinterpret or weaken the ownership boundaries already established by ACTIONS, WORK, PLANNING or PEOPLE.

## 3. OBJECTIVE

Implement only P3-ACTIONS-001F — Actions Work Integration.

Materialize the mandatory association between Work and Actions while preserving ACTIONS as the authoritative owner of Action data.

The integration must provide:

- an internal Work/Actions integration boundary;
- Actions lookup by WorkReference;
- zero-to-many Actions associated with one Work;
- the three integration states required by the ACTIONS contract;
- zero authoritative mirror of Actions inside WORK;
- strict separation from Work Lifecycle and Work Progress.

P3-ACTIONS-001G MUST NOT be started.

## 4. REQUIRED ARCHITECTURAL BOUNDARY

The intended direction is:

Work consumer
    -> internal Work/Actions integration boundary
    -> ACTIONS internal read access
    -> ACTIONS canonical/rebuilt state

The integration MUST consume the stable read capability established in P3-ACTIONS-001E.

A Work-facing integration MUST NOT become an alternative ACTIONS producer, repository, store or authority.

## 5. WORKREFERENCE AND CARDINALITY

Every Action remains associated with exactly one Work through its existing canonical WorkReference.

A Work may expose:

- zero Actions;
- one Action;
- multiple Actions.

Lookup by Work MUST derive from ACTIONS canonical state through the certified internal read boundary.

Do not duplicate Action aggregate state into WORK.

Do not create a persistent Work-owned Action list as an authoritative source.

## 6. THREE INTEGRATION STATES

Implement the three Work/Actions integration states defined or derivable from the authoritative ACTIONS contract.

The states MUST describe only the availability/relationship required by Work/Actions integration.

They MUST NOT:

- redefine Action lifecycle;
- redefine Work lifecycle;
- calculate Work Progress;
- infer Planning status;
- infer PEOPLE assignment;
- become a second business status source.

If the authoritative sources do not deterministically define the exact three-state vocabulary or semantics, STOP and report BLOCKED rather than inventing them.

## 7. MUTATION BOUNDARY

WORK MUST NOT mutate ACTIONS.

No Work integration service may:

- create an Action directly;
- modify an Action directly;
- transition an Action directly;
- write an Action Result;
- mutate Action Dependencies;
- write to ActionsJournal;
- bypass ActionsAuthority;
- reproduce ActionsAuthority business rules.

All ACTIONS mutations remain governed by the certified ACTIONS command/authority path.

## 8. ZERO MIRROR

No second authoritative representation of Actions may be introduced.

Forbidden:

- Work-owned Action store;
- mirrored Action aggregate;
- duplicated durable Action list;
- authoritative cache;
- authoritative projection containing copied Action state;
- second Result source;
- second Dependency source.

A read model returned transiently by the integration boundary is permitted only when derived from ACTIONS canonical read access and clearly non-authoritative.

## 9. WORK PROGRESS AND LIFECYCLE SEPARATION

P3-ACTIONS-001F MUST NOT calculate, modify or redefine:

- Work Lifecycle;
- Work Progress;
- Work Objective;
- Work completion;
- Work business state.

The existence, number, status or Result of Actions MUST NOT automatically become a Work Progress or Lifecycle calculation in this lot.

Existing WORK semantics must remain unchanged.

## 10. PLANNING SEPARATION

PLANNING retains ownership of planned temporal structure, including Phase, Milestone, deadline and planned priority where applicable.

This mission MUST NOT:

- move Planning concepts into ACTIONS;
- infer Planning state from Actions;
- make ACTIONS authoritative for planned time;
- mutate PLANNING.

## 11. PEOPLE SEPARATION

PEOPLE retains ownership of human identities and assignments.

This mission MUST NOT:

- copy PEOPLE aggregates into ACTIONS;
- create Action ownership from PEOPLE data;
- mutate PEOPLE;
- redefine Assignment;
- infer human assignment from Action state.

## 12. RUNTIME SEPARATION

Runtime execution mechanics remain separate from business Action ownership.

This mission MUST NOT:

- make Runtime the Action authority;
- promote technical execution state into Action or Work business state;
- mutate Runtime;
- introduce Runtime-owned Action projections.

## 13. PUBLIC TRANSPORT FORBIDDEN

This mission is internal integration only.

Do NOT add or modify:

- public API;
- HTTP route;
- BFF endpoint;
- controller;
- frontend;
- UI;
- public transport;
- scheduler;
- queue;
- external integration.

## 14. AUTHORIZED FUNCTIONAL SCOPE

Functional implementation is restricted to the minimum files required for the internal Work/Actions integration and its tests.

Before functional modification:

1. inspect the existing certified ACTIONS and WORK boundaries;
2. determine the exact minimum file list;
3. record that exact file list in the mission report;
4. define the required tests before implementation.

Do not modify unrelated files.

Do not refactor certified code unless strictly required by 001F.

## 15. FORBIDDEN DOMAIN CHANGES

Do not modify business ownership or behavior in:

- PLANNING;
- PEOPLE;
- Decisions;
- Deliverables;
- Runtime/Core.

Do not modify the certification registry.

Do not modify CEREBRAU orchestration infrastructure.

Do not begin P3-ACTIONS-001G.

## 16. REQUIRED TESTS

The P3-ACTIONS-001F TEST CONTRACT requires:

1. Work integration tests;
2. Queries-by-Work tests;
3. separation tests for Work/Progress;
4. separation tests for PLANNING;
5. separation tests for PEOPLE;
6. separation tests for Runtime;
7. applicable non-regression tests;
8. strict TypeScript typecheck.

Tests must prove at minimum:

- zero Actions for a Work is represented correctly;
- one Action for a Work is represented correctly;
- multiple Actions for a Work are represented correctly;
- lookup uses WorkReference;
- the required three integration states are correct and deterministic;
- reads originate from ACTIONS canonical/internal access;
- no Action mutation occurs through WORK;
- no authoritative mirror exists;
- Work Lifecycle is unchanged;
- Work Progress is unchanged;
- PLANNING ownership is unchanged;
- PEOPLE ownership is unchanged;
- Runtime ownership is unchanged;
- certified ACTIONS 001B/001C/001D/001E behavior does not regress.

Run all applicable ACTIONS and WORK tests plus applicable Core/domain suites.

Run strict TypeScript validation.

Run git diff --check.

## 17. PERSISTENCE AND SOURCE INVARIANTS

Preserve all certified P3-ACTIONS-001D and P3-ACTIONS-001E properties:

- one canonical durable ACTIONS source;
- append-only history;
- atomic state/events/receipt semantics;
- Action revision CAS;
- coherent graph revision CAS;
- deterministic replay;
- recovery from canonical source;
- fail-closed corruption behavior;
- durable causality and provenance;
- command idempotence;
- read-only Queries.

No second persistence mechanism may be introduced.

## 18. DIRTY WORKSPACE SAFETY

The repository already contains incoming changes unrelated to this mission.

Do NOT:

- restore them;
- clean them;
- stage them;
- revert them;
- normalize them;
- rewrite them;
- include them in the mission delta.

Treat the incoming dirty workspace as immutable baseline context.

Report only files actually changed by this mission.

## 19. REPORT

Produce exactly:

Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001F-ACTIONS-WORK-INTEGRATION/P3-ACTIONS-001F_ACTIONS_WORK_INTEGRATION_REPORT.md

The report must contain:

- mission identity;
- exact files created;
- exact files modified;
- architecture implemented;
- WorkReference/cardinality behavior;
- exact three-state vocabulary and semantics with source justification;
- proof of zero mirror;
- proof that WORK cannot mutate ACTIONS;
- proof Work Lifecycle/Progress remain unchanged;
- proof PLANNING/PEOPLE/Runtime ownership remains unchanged;
- exact test commands;
- exact PASS/FAIL counts;
- typecheck result;
- git diff check result;
- non-regression evidence;
- remaining unknowns;
- explicit confirmation that P3-ACTIONS-001G was not started.

## 20. DECISION RULE

Do not self-certify.

Do not modify Docs/12_CERTIFICATION/certification-registry.json.

If every 001F criterion is proven, end the report exactly with:

TECHNICAL GO — P3-ACTIONS-001F — READY FOR HUMAN APPROVAL

Otherwise end with:

TECHNICAL NO-GO — P3-ACTIONS-001F

and identify the blocking evidence.

## 21. STOP CONDITION

Stop immediately after:

- implementation of P3-ACTIONS-001F;
- mandatory validations;
- production of the technical report.

Do not implement P3-ACTIONS-001G.
Do not perform canonical certification.
Wait for human review.

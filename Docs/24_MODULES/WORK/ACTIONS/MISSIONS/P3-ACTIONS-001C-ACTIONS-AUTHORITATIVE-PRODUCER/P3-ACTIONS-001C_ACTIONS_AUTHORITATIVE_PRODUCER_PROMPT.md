# P3-ACTIONS-001C — ACTIONS AUTHORITATIVE PRODUCER

## MISSION

Implement P3-ACTIONS-001C — Actions Authoritative Producer.

This mission is DELTA-ONLY.

Canonical previous lot:
P3-ACTIONS-001B — CERTIFIED.

Canonical next lot after successful human certification:
P3-ACTIONS-001D.

Do NOT start P3-ACTIONS-001D.

## CANONICAL SOURCES

Read and obey:

- Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md
- Docs/24_MODULES/WORK/ACTIONS_IMPLEMENTATION_CONTRACT.md
- Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md
- Docs/12_CERTIFICATION/certification-registry.json
- the certified P3-ACTIONS-001B implementation under server/domain/actions/

Do not reinterpret or broaden these sources.

## OBJECTIVE

Establish the single authoritative acceptance boundary for ACTIONS.

P3-ACTIONS-001C must introduce the in-memory authoritative producer responsible for accepting valid Actions domain commands and producing the corresponding authoritative domain evolution.

The implementation must cover, only where required by the canonical contract:

- Actions Authority;
- Actions Commands;
- Actions Events;
- authoritative transitions;
- Result production semantics;
- Dependency graph evolution;
- provenance;
- causality;
- applicable in-memory concurrency control.

The implementation must preserve every certified P3-ACTIONS-001B distinction and invariant.

## REQUIRED AUTHORITY RULE

There MUST be exactly one authoritative producer for Actions domain mutations.

No caller, helper, service, adapter, repository, Work component or Runtime component may become a second Actions producer.

All accepted domain mutations introduced by this lot must cross the Actions Authority boundary.

## REQUIRED SEMANTIC SEPARATION

Preserve strict distinctions between:

- Action;
- Task;
- Command;
- Event;
- Activity;
- Execution;
- Result;
- Dependency.

A Command expresses requested business intent.

An Event records an accepted business-domain fact.

An Activity is not an Event.

An Execution is not an Action and is not an Event.

A technical Runtime event must never be promoted into an authoritative Actions business event.

## REQUIRED INVARIANTS

At minimum, prove and preserve:

1. Every Action belongs to exactly one Work.
2. Action identity remains unambiguous inside its Work.
3. Action purpose does not become a second Work Objective.
4. Actions owns its own status vocabulary and does not reproduce Work Lifecycle or Planning state.
5. Only the Actions Authority introduced by this lot may accept authoritative Actions mutations.
6. Invalid transitions are rejected before authoritative state evolution.
7. Accepted Commands produce deterministic authoritative domain Events where required.
8. Event provenance identifies the accepted source command and authoritative boundary without inventing PEOPLE ownership.
9. Causality between Command, Event, Action evolution, Result and Dependency changes is explicit and deterministic.
10. Result remains zero-or-one current Result per Action according to the certified model.
11. Result history must not become a second source of truth.
12. Dependency remains owned by its source Action.
13. Dependency graph mutations preserve all certified graph invariants, including applicable cycle prevention.
14. No Planning primitive is owned or reproduced by Actions.
15. No PEOPLE identity, role or Assignment ownership is introduced.
16. No Decisions authorization semantics are reimplemented.
17. No Runtime primitive becomes Actions business truth.
18. Actions must not become a parallel source for Work Objective, Lifecycle or Progress.
19. Applicable concurrent in-memory mutations must fail deterministically rather than silently applying last-write-wins.
20. P3-ACTIONS-001B invariants must not be weakened.

## AUTHORIZED IMPLEMENTATION SCOPE

Modify or create only the minimum files required under:

server/domain/actions/

for:

- Actions Authority;
- Commands;
- Events;
- provenance;
- causality;
- in-memory concurrency semantics;
- Result/Dependency authoritative evolution;
- targeted Actions tests.

Also create/update only this mission report:

Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001C-ACTIONS-AUTHORITATIVE-PRODUCER/P3-ACTIONS-001C_ACTIONS_AUTHORITATIVE_PRODUCER_REPORT.md

Do not perform opportunistic refactoring.

## STRICTLY FORBIDDEN IN THIS LOT

Do NOT introduce:

- persistence;
- repository implementation;
- durable storage;
- database;
- filesystem store;
- migration;
- replay;
- recovery;
- durable CAS;
- public API;
- BFF;
- frontend;
- transport;
- scheduler;
- queue;
- Work integration;
- Work mutation;
- Planning integration;
- PEOPLE integration;
- Decisions integration;
- Runtime integration;
- Work Lifecycle calculation;
- Work Progress calculation;
- a second authoritative Actions producer;
- direct mutation bypassing Actions Authority;
- a second Result source of truth.

P3-ACTIONS-001D owns persistence.

P3-ACTIONS-001E owns internal application access.

P3-ACTIONS-001F owns Work integration.

Do not implement those lots early.

## FORBIDDEN DOMAIN MODIFICATIONS

Unless a direct compile blocker is proven and explicitly reported, do not modify:

- server/domain/work/**
- server/domain/people/**
- server/domain/planning/**
- Runtime implementation
- CEREBRAU infrastructure
- governance infrastructure
- certification infrastructure
- apps/**
- API/BFF/frontend code

If the mission cannot be completed without such a modification, STOP and report BLOCKED instead of broadening scope.

## REQUIRED TESTS

Tests must prove at minimum:

- valid Commands are accepted through the unique Actions Authority;
- invalid Commands are rejected;
- valid Action transitions are accepted;
- invalid Action transitions are rejected;
- accepted Commands produce the expected authoritative Events;
- event provenance is preserved;
- event causality is deterministic;
- Result semantics remain compliant;
- Dependency mutations remain compliant;
- applicable graph invariants are preserved;
- applicable concurrent in-memory mutations are controlled deterministically;
- direct mutation outside the authoritative boundary is not introduced;
- no second producer exists in the implementation;
- certified P3-ACTIONS-001B invariants remain valid.

Run the applicable strict Actions typecheck.

Run applicable non-regression checks required by the canonical contract.

Run git diff --check for the mission delta.

## REQUIRED VALIDATION CATEGORIES

The P3-ACTIONS-001C evidence must cover:

- Commands tests;
- Events tests;
- provenance and causality tests;
- Result tests;
- Dependency tests;
- applicable concurrency tests;
- Typecheck.

No required validation may be silently omitted.

## REPORT

Create:

Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001C-ACTIONS-AUTHORITATIVE-PRODUCER/P3-ACTIONS-001C_ACTIONS_AUTHORITATIVE_PRODUCER_REPORT.md

The report must state:

- exact files created;
- exact files modified;
- exact authoritative producer introduced;
- Commands implemented;
- Events implemented;
- provenance model;
- causality model;
- Result behavior;
- Dependency behavior;
- concurrency behavior;
- tests executed;
- exact PASS/FAIL counts;
- typecheck result;
- git diff check result;
- regressions;
- forbidden-scope verification;
- remaining unknowns;
- technical verdict.

## CERTIFICATION BOUNDARY

Do NOT modify the canonical certification registry.

Do NOT self-certify P3-ACTIONS-001C.

Do NOT start P3-ACTIONS-001D.

Human approval is mandatory after technical review.

If every required criterion passes, the final verdict must be exactly:

TECHNICAL GO — P3-ACTIONS-001C — READY FOR HUMAN APPROVAL

Otherwise report the exact blocking condition and do not claim readiness.

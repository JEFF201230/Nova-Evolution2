# P3-ACTIONS-001E — ACTIONS INTERNAL ACCESS — IMPLEMENTATION PROMPT

## 1. MISSION IDENTITY

- DomainId: ACTIONS
- LotId: P3-ACTIONS-001E
- Mission: P3-ACTIONS-001E-IMPLEMENTATION-001
- PreviousLot: P3-ACTIONS-001D
- PreviousLotStatusRequired: CERTIFIED
- NextAuthorizedLotOnCertification: P3-ACTIONS-001F
- Execution mode: IMPLEMENTATION
- Scope mode: DELTA-ONLY

## 2. AUTHORITATIVE SOURCES

Read and obey before any modification:

1. `Docs/24_MODULES/WORK/ACTIONS_DOMAIN_BLUEPRINT.md`
2. `Docs/24_MODULES/WORK/ACTIONS_IMPLEMENTATION_CONTRACT.md`
3. Existing certified implementation under `server/domain/actions/`
4. Certified behavior from P3-ACTIONS-001B, 001C and 001D.

Do not reinterpret or broaden the certified ACTIONS model.

## 3. OBJECTIVE

Implement P3-ACTIONS-001E — Actions Internal Access.

Establish the internal application access boundary for ACTIONS by providing:

- internal Commands access;
- internal read-only Queries;
- qualified reads over the canonical ACTIONS source;
- preservation of certified idempotence;
- preservation of certified durable persistence semantics.

This lot must NOT introduce any public transport.

## 4. REQUIRED ARCHITECTURAL RULE

The certified chain must remain:

Internal Command
    -> internal ACTIONS access boundary
    -> ActionsAuthority
    -> canonical durable ACTIONS source

Internal Query
    -> internal ACTIONS read boundary
    -> canonical/rebuilt ACTIONS state
    -> read-only result

`ActionsAuthority` remains the unique authoritative business mutation boundary.

No internal service may directly mutate persisted ACTIONS state.

No Query may mutate ACTIONS state.

## 5. COMMAND REQUIREMENTS

Implement only the minimum internal Commands access required by the certified contract.

Every internal mutation request MUST:

- delegate to the existing `ActionsAuthority`;
- preserve the certified Actions command semantics;
- preserve command identity;
- preserve causality identity;
- preserve provenance;
- preserve expected Action revision;
- preserve expected graph revision where applicable;
- preserve certified idempotence behavior;
- preserve persistence and concurrency behavior established by 001D;
- return authoritative outcomes without creating a second business truth.

Forbidden:

- direct journal mutation;
- direct aggregate mutation outside `ActionsAuthority`;
- alternative producer;
- duplicated transition rules;
- duplicated Result semantics;
- duplicated Dependency semantics;
- bypass of certified CAS/concurrency rules.

## 6. QUERY REQUIREMENTS

Implement only internal read-only Queries.

Queries MUST:

- read from the canonical/rebuilt ACTIONS state;
- never create or mutate an Action;
- never append an event;
- never append a journal entry;
- never create a Result;
- never modify a Dependency;
- never modify causality receipts;
- never change Action revision;
- never change graph revision.

Provide only reads justified by the existing ACTIONS model and this lot.

Do not anticipate P3-ACTIONS-001F Work integration.

A query may expose existing `WorkReference` as an admitted Action attribute, but MUST NOT implement the future Work/Actions integration port or Work-owned projection.

## 7. PERSISTENCE AND IDEMPOTENCE

001D is certified and MUST NOT be replaced.

The internal access layer MUST use the existing durable mechanism when durable access is configured.

It MUST preserve:

- single durable canonical source;
- atomic commit semantics;
- append-only accepted history;
- Action revision CAS;
- graph revision CAS;
- causality receipts;
- exact idempotent replay behavior;
- divergent causality rejection;
- deterministic replay/recovery;
- fail-closed corruption behavior.

No second store, cache or authoritative projection is authorized.

## 8. STRICT SEPARATION

This lot MUST NOT acquire ownership of:

- Work Objective;
- Work Lifecycle;
- Work Progress;
- Planning Phase;
- Planning Milestone;
- Planning deadline;
- Planning planned priority;
- PEOPLE identity;
- PEOPLE role;
- PEOPLE Assignment;
- Decisions authorization;
- Deliverables content/certification;
- Runtime technical execution ownership.

No external aggregate may become ACTIONS truth.

Do not copy external aggregate content into ACTIONS.

## 9. PUBLIC TRANSPORT — STRICTLY FORBIDDEN

Do NOT create or modify:

- public API;
- HTTP endpoint;
- BFF endpoint;
- frontend;
- NOVA Web UI;
- controller;
- public transport adapter;
- scheduler;
- queue;
- external service integration.

P3-ACTIONS-001E is internal application access only.

## 10. P3-ACTIONS-001F — STRICTLY FORBIDDEN

Do NOT implement:

- Work/Actions integration port;
- Actions list integration owned by Work;
- Work three-state integration semantics;
- Work projection;
- Work Progress computation;
- any 001F deliverable.

P3-ACTIONS-001F must remain untouched until 001E is canonically certified.

## 11. AUTHORIZED FUNCTIONAL SCOPE

Functional implementation is restricted to:

`server/domain/actions/`

Mission report is restricted to:

`Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001E-ACTIONS-INTERNAL-ACCESS/`

Do not modify certification registry.

Do not modify CEREBRAU infrastructure.

Do not modify NOVA Runtime infrastructure.

Do not modify Work, Planning, PEOPLE, Decisions or Deliverables implementation.

Before implementation, determine and report the exact files that will be created or modified inside the authorized scope.

## 12. REQUIRED TEST CONTRACT

Tests MUST be defined before functional modification.

Mandatory validations:

### A. Internal Commands tests

Prove:

- internal Commands reach `ActionsAuthority`;
- no direct mutation path exists around Authority;
- authoritative receipt/outcome is preserved;
- revision semantics are preserved.

### B. Internal Queries tests

Prove:

- Queries return qualified ACTIONS data;
- Queries are read-only;
- repeated Queries do not alter state;
- Queries do not append journal entries/events/receipts;
- Queries do not change Action or graph revision.

### C. Idempotence tests

Prove:

- exact command replay preserves certified idempotence;
- exact causality reuse does not create an additional durable mutation;
- divergent causality remains rejected.

### D. Applicable persistence tests

Prove:

- internal Commands use the certified durable source when configured;
- state remains readable after restart;
- Query access after restart reflects canonical replayed state;
- no second durable source is introduced.

### E. Separation tests

Prove:

- no API/BFF/frontend/transport is introduced;
- no Work/Planning/PEOPLE/Decisions/Deliverables/Runtime ownership transfer occurs;
- no authoritative projection or mirror is introduced;
- Authority remains the mutation boundary.

### F. Non-regression

Run applicable certified ACTIONS 001B/001C/001D tests unchanged.

### G. Typecheck

Run strict TypeScript typecheck for ACTIONS and every directly affected authorized perimeter.

### H. Git delta

Run `git diff --check`.

Verify that mission-created functional modifications remain inside the authorized functional scope.

Incoming dirty workspace files unrelated to this mission MUST NOT be modified, reverted, staged, cleaned or normalized.

## 13. REQUIRED EVIDENCE

The final report MUST identify:

- exact files created;
- exact files modified;
- internal Command boundary;
- internal Query boundary;
- proof Commands delegate to Authority;
- proof Queries are read-only;
- proof of idempotence preservation;
- proof of persistence preservation;
- proof no second authoritative source exists;
- proof no public transport was introduced;
- proof 001F was not started;
- exact test commands;
- PASS/FAIL counts;
- TypeScript result;
- `git diff --check` result;
- remaining unknowns/deferred work.

## 14. REPORT

Create exactly one technical mission report:

`Docs/24_MODULES/WORK/ACTIONS/MISSIONS/P3-ACTIONS-001E-ACTIONS-INTERNAL-ACCESS/P3-ACTIONS-001E_ACTIONS_INTERNAL_ACCESS_REPORT.md`

The report is technical evidence only.

Do NOT self-certify the lot.

Do NOT modify:

`Docs/12_CERTIFICATION/certification-registry.json`

Human approval remains mandatory after technical execution.

## 15. SUCCESS VERDICT

Only if every required validation is proven PASS, conclude exactly:

`TECHNICAL GO — P3-ACTIONS-001E — READY FOR HUMAN APPROVAL`

Otherwise conclude:

`TECHNICAL NO-GO — P3-ACTIONS-001E`

and enumerate the blocking facts.

## 16. STOP CONDITION

Stop after:

1. authorized 001E implementation;
2. mandatory validations;
3. technical report.

Do not start P3-ACTIONS-001F.
Do not certify P3-ACTIONS-001E.
Do not perform unrelated cleanup or refactoring.

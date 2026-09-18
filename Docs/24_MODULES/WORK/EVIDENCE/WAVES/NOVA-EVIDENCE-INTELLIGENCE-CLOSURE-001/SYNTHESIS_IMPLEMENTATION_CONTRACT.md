# SYNTHESIS IMPLEMENTATION CONTRACT

Status: `PROPOSED — LEGACY GO MARKER INTENTIONALLY ABSENT UNTIL PROGRAM-PREAUTHORIZED DEPENDENCY GATE`  
Blueprint: `Docs/24_MODULES/WORK/SYNTHESIS_DOMAIN_BLUEPRINT.md`

| Attribute | Value |
|---|---|
| DomainId | SYNTHESIS |
| Lot | P3-SYNTHESIS-001A |
| Next authorized lot | P3-SYNTHESIS-001B |

## Required implementation

After Intelligence certification, implement one Work Synthesis authority under `server/domain/synthesis/**`. It consumes certified authorized Work state and Intelligence results, maintains at most one current version per Work with history, observation date, provenance, source references, conflicts, revision and withdrawal.

Synthesis selects and presents; it never creates/corrects a fact, Action, priority, Recommendation, Confidence or Outcome. Mission reports, UI text, logs and fixtures are prohibited substitutes. Work integration contains only references/query composition.

## Sequence and acceptance

Contract lot P3-SYNTHESIS-001A precedes implementation/certification lot P3-SYNTHESIS-001B. Tests cover source ownership, conflicts, version/current uniqueness, withdrawal, absence/unavailability, no Confidence default and no copied aggregates.

The A contract becomes contract-only `CERTIFIED` and receives its legacy GO marker only in the program-preauthorized, dependency-gated two-file admission changeset defined by `PROGRAM_CERTIFICATION_IDENTITY_MAP.md`. It intentionally lacks that marker while proposed. No new routine human approval is requested.

### 1.3 Out of scope

- source fact, Action, priority, Recommendation, Confidence or Outcome creation
- Mission report, log, fixture or UI substitution

### 2.2 Allowed dependencies

- certified authorized Work state read port
- certified Intelligence and Evidence read ports

### 2.3 Forbidden dependencies

- CEREBRAU product/runtime modules
- source-domain commands and repositories
- Confidence producer and public transport

### 14.7 Non-negotiable invariants

1. WorkSynthesis owns restitution and no source fact.
2. Exactly zero or one current Synthesis exists per Work.
3. Every meaningful element preserves source and observation provenance.
4. Conflicts, revisions, withdrawals and unavailable producers remain explicit.
5. No Confidence value is invented.

## 15. TEST CONTRACT

### 15.1 TEST CONTRACT PAR SOUS-LOT

| Sous-lot | Validations obligatoires |
|---|---|
| P3-SYNTHESIS-001B | Tests current uniqueness; Tests source provenance; Tests conflicts; Tests lifecycle/recovery; Tests forbidden substitutes; Tests non-regression; Typecheck |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Accepted order

| Order | Sub-lot | Objective | Authorized deliverable |
|---|---|---|---|
| 1 | P3-SYNTHESIS-001B - Synthesis Foundation | establish the source-preserving restitution authority | WorkSynthesis and SynthesisAuthority |

## 17. ENTRY AND EXIT GATES

### 17.2 Lot gates

| Sub-lot | Entry | Authorized files | Exit |
|---|---|---|---|
| P3-SYNTHESIS-001B | contract row and Intelligence certified | server/domain/synthesis/** plus narrow work-synthesis reference/query tests | SynthesisAuthority unique; current/history and source boundaries proven; tests PASS; report accepted by designated QA/Certification authority |

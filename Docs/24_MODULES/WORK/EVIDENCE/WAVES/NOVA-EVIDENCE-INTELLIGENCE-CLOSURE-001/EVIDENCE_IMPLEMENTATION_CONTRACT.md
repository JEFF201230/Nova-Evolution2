# EVIDENCE IMPLEMENTATION CONTRACT

Status: `CERTIFIED`

**VERDICT : GO**
Blueprint: `Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/EVIDENCE_DOMAIN_BLUEPRINT.md`

| Attribute | Value |
|---|---|
| DomainId | EVIDENCE |
| Lot | P3-EVIDENCE-001A |
| Next authorized lot | P3-EVIDENCE-001B |
| Nature | contract admission; no product implementation |

## Required implementation

Implement one internal Evidence module under `server/domain/evidence/**` with:

- value objects for EvidenceId, immutable source reference, provenance and lifecycle;
- one aggregate enforcing idempotent registration and terminal transitions;
- one authoritative repository/journal port and one production implementation;
- one production source resolver and one-entry allow-list for `ACTIONS_ACTION_RESULT_RECORDED`, using only `ActionsInternalQueries.getActionHistory(ActionReference)` and matching `(WorkReference, ActionId, actionsRevision, ResultId)`;
- internal query ports by EvidenceId and ordered ID set;
- optional Certification resolver returning reference-absent/unavailable/resolved;
- one strict `server/domain/evidence/tsconfig.json` covering every Evidence source and its imported certified read ports;
- no public transport, UI, provider framework or CEREBRAU dependency.

## Mandatory sequence

1. contract lot P3-EVIDENCE-001A;
2. foundation and invariants;
3. authoritative producer;
4. persistence/recovery/idempotence;
5. internal queries and Certification resolution;
6. negative boundary and regression tests;
7. P3-EVIDENCE-001B certification.

## Acceptance

All Blueprint invariants pass; a real certified ACTIONS `ResultRecorded` occurrence registers and resolves after restart without copying its outcome/payload; source payload cannot be persisted by the public domain contract; duplicate registration returns the same ID; conflicting registration fails; missing/ambiguous/history-unavailable ACTIONS occurrences and every non-allowlisted source fail closed; withdrawal/invalidation/supersession survive recovery; unavailable authority is explicit; repository uniqueness and absence of legacy Runtime-store reuse are proven.

## Forbidden

Changes to certified PEOPLE, PLANNING or ACTIONS; Work integration; Intelligence/Synthesis/Confidence; BFF/UI/API; unapproved certification-registry edits; Runtime/Governance evidence promotion.

## Certification

The A contract requires the explicit Phase 0 final program approval and two-file admission protocol described by `PROGRAM_CERTIFICATION_IDENTITY_MAP.md`; the current writer cannot create a Markdown contract row. Approval changes this document to contract-only `CERTIFIED` and adds the legacy GO marker in the same reviewed changeset as the registry row. Until then the marker is deliberately absent and admission must fail closed. The A lot certifies only the contract; the B lot requires execution/output evidence, all validations and an `ACCEPTED` decision from the designated QA/Certification authority, not a new human transition gate.

### 1.3 Out of scope

- Work, Intelligence, Synthesis and Confidence implementation
- public API, BFF, frontend and provider framework
- Runtime, Governance or CEREBRAU sources
- certified PEOPLE, PLANNING and ACTIONS files

### 2.2 Allowed dependencies

- admitted NOVA business-source resolver ports
- Certification read resolver
- NOVA persistence primitives without Runtime evidence semantics

### 2.3 Forbidden dependencies

- CEREBRAU product/runtime modules
- IntegrationRuntimeRepository and MissionEvidenceCertifier
- Work, Intelligence, UI and fixture authorities

### 14.7 Non-negotiable invariants

1. EvidenceAuthority is the sole Business Evidence producer.
2. BusinessEvidenceRecord stores no source payload.
3. Source occurrence identity and registration are idempotent.
4. Lifecycle history is durable, append-only and never silently deleted.
5. Certification status is resolved from its owner and never copied.
6. Absence, invalidity and authority unavailability remain distinct.

## 15. TEST CONTRACT

### 15.1 TEST CONTRACT PAR SOUS-LOT

| Sous-lot | Validations obligatoires |
|---|---|
| P3-EVIDENCE-001B | Tests Evidence invariants; Tests idempotence; Tests lifecycle/recovery; Tests source allow/deny; Tests Certification resolution; Tests non-regression; Typecheck |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Accepted order

| Order | Sub-lot | Objective | Authorized deliverable |
|---|---|---|---|
| 1 | P3-EVIDENCE-001B - Evidence Foundation | establish the unique reference authority and durable history | BusinessEvidenceRecord and EvidenceAuthority |

## 17. ENTRY AND EXIT GATES

### 17.2 Lot gates

| Sub-lot | Entry | Authorized files | Exit |
|---|---|---|---|
| P3-EVIDENCE-001B | P3-EVIDENCE-001A CERTIFIED and human architecture approval | server/domain/evidence/** and scoped tests only | EvidenceAuthority unique; BusinessEvidenceRecord durable; all required tests PASS; report accepted by designated QA/Certification authority |


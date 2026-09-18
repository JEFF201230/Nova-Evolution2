# BUSINESS_CERTIFICATION IMPLEMENTATION CONTRACT

Status: `CERTIFIED`

**VERDICT : GO**

Blueprint: `Docs/24_MODULES/WORK/BUSINESS_CERTIFICATION/BUSINESS_CERTIFICATION_DOMAIN_BLUEPRINT.md`

| Attribute | Value |
|---|---|
| DomainId | BUSINESS_CERTIFICATION |
| Lot | P3-BUSINESS-CERTIFICATION-001A |
| Next authorized lot | P3-BUSINESS-CERTIFICATION-001B |
| Nature | contract admission; no product implementation |

## Required implementation

Implement the minimum internal Business Certification product authority under `server/domain/business-certification/**`:

- the exact authority constant `BUSINESS_CERTIFICATION_AUTHORITY` and opaque `CertificationId`;
- the canonical two-field `CertificationReference` defined by the Blueprint;
- one `BusinessCertificationRecord` aggregate restricted to subject kind `BUSINESS_EVIDENCE`;
- one `BusinessCertificationAuthority` as sole identity, decision and lifecycle producer;
- a read-only Evidence identity-existence port used when recording a decision, with explicit absent/unavailable outcomes and no Evidence mutation;
- one authoritative durable append-only journal/repository with deterministic recovery and idempotency enforcement;
- one `BusinessCertificationQueries.resolveReference` boundary returning exactly `UNRECOGNIZED_AUTHORITY`, `NOT_FOUND`, `FOUND` or `AUTHORITY_UNAVAILABLE`;
- strict scoped tests and typecheck;
- no public transport, UI, generic subject registry or CEREBRAU dependency.

The implementation lot must create no default or seed certification. Tests may create identities only through `BusinessCertificationAuthority` using an available Evidence identity test boundary.

## Admission semantics required by RT-12

Evidence may admit a `CertificationReference` only after the owner returns `FOUND` for the exact authority and identifier and the returned subject is the same `EvidenceId`. Evidence must reject `UNRECOGNIZED_AUTHORITY`, `NOT_FOUND`, `AUTHORITY_UNAVAILABLE`, subject mismatch and structurally inconsistent responses without appending a registration or attachment event.

The current `CERTIFIED`, `REJECTED`, `WITHDRAWN` or `INVALIDATED` state is owner data returned at read time. It is not encoded in the reference and is not persisted by Evidence.

## Mandatory sequence

1. contract lot `P3-BUSINESS-CERTIFICATION-001A`;
2. foundation types, aggregate and authority;
3. authoritative persistence, recovery and idempotency;
4. read-only Evidence identity check for decision recording;
5. `resolveReference` internal query;
6. negative boundary, recovery and no-dependency tests;
7. independent QA/Certification acceptance for `P3-BUSINESS-CERTIFICATION-001B`.

## Acceptance

The B lot is acceptable only when one identity created through the authority resolves after restart; an exact replay is idempotent; a divergent replay fails without mutation; unknown authority and unknown ID remain distinct; subject mismatch is observable to the caller; all four states resolve from the owner; terminal transitions and supersession preserve history; unavailable persistence never becomes not-found; reads append nothing; and prohibited product dependencies are absent.

## Forbidden

Evidence implementation or RT-12 changes; Work, Intelligence, Synthesis or Confidence changes; changes to certified PEOPLE, PLANNING or ACTIONS; public API/BFF/UI; database migration; generic policy/compliance platform; development certificate ingestion; CEREBRAU, Mission or Runtime certification reuse.

### 1.3 Out of scope

- Evidence implementation and RT-12 repair
- Work, Intelligence, Synthesis and Confidence
- public API, BFF, frontend, notifications, payments and accounting
- generic certification subjects, policy engines and compliance workflows
- CEREBRAU, Mission/runtime and development certification artifacts

### 2.2 Allowed dependencies

- read-only Business Evidence identity-existence port
- NOVA persistence and cryptographic primitives without Runtime evidence semantics
- clock and opaque identifier generator ports

### 2.3 Forbidden dependencies

- `tools/cerebrau/**` and `tools/nova-core-runtime/Cerebrau*`
- Mission/runtime certification, `OfficialStatus`, Git and CI status
- Evidence commands, Work commands and downstream domain commands
- `Docs/12_CERTIFICATION` as product data or recovery input

### 14.7 Non-negotiable invariants

1. `BusinessCertificationAuthority` is the sole Business Certification identity and lifecycle producer.
2. `BUSINESS_CERTIFICATION_AUTHORITY` is the only authority identity admitted by this contract.
3. `CertificationId` ownership is proven by exact owner resolution, never by non-empty text or parsing.
4. Every MVP record qualifies exactly one existing `EvidenceId` under explicit criteria.
5. Certification decision and state are resolved from the owner and never copied into Evidence.
6. Durable append-only history, recovery and idempotency fail closed.
7. The internal query is read-only and distinguishes unrecognized authority, missing identity and unavailable owner.
8. No product/runtime dependency on CEREBRAU or development certification artifacts exists.

## 15. TEST CONTRACT

### 15.1 TEST CONTRACT PAR SOUS-LOT

| Sous-lot | Validations obligatoires |
|---|---|
| P3-BUSINESS-CERTIFICATION-001A | Contract completeness; DomainId and Lot identity; Next authorized lot; Blueprint consistency; CEREBRAU separation; No product implementation |
| P3-BUSINESS-CERTIFICATION-001B | Authority and identity tests; Reference resolution tests; Evidence subject tests; Lifecycle and recovery tests; Idempotency tests; Read-only tests; Prohibited dependency scan; Typecheck |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Accepted order

| Order | Sub-lot | Objective | Authorized deliverable |
|---|---|---|---|
| 1 | P3-BUSINESS-CERTIFICATION-001B - Business Certification Foundation | establish the unique product authority and read-only identity resolver | BusinessCertificationRecord, BusinessCertificationAuthority and BusinessCertificationQueries |

## 17. ENTRY AND EXIT GATES

### 17.2 Lot gates

| Sub-lot | Entry | Authorized files | Exit |
|---|---|---|---|
| P3-BUSINESS-CERTIFICATION-001B | P3-BUSINESS-CERTIFICATION-001A CERTIFIED and resolver postconditions pass | server/domain/business-certification/**, scoped tests and the B-lot mission report only | unique authority, durable owner-issued identity, exact resolver states, no CEREBRAU dependency and all required tests PASS; report accepted by designated QA/Certification authority |


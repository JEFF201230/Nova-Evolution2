# BUSINESS_CERTIFICATION DOMAIN BLUEPRINT

Status: `ADMITTED CONTRACT — PRODUCT AUTHORITY NOT YET IMPLEMENTED`

## 1. Intention

Business Certification records a formal NOVA business qualification of one identified Business Evidence record against explicit business criteria. It owns the certification identity, decision, current state and append-only history. It does not own Business Evidence or the subject payload.

This bounded context is the product-domain owner required by an Evidence `CertificationReference`. It is not CEREBRAU certification, Mission/runtime certification, a test result, an `OfficialStatus`, CI state or Git state.

## 2. Scope

The MVP admits exactly one subject kind: `BUSINESS_EVIDENCE`. Its subject reference is one canonical `EvidenceId` resolved read-only from the Evidence owner before a certification decision is recorded.

The MVP does not certify Work, Deliverables, releases, plugins, Programs or implementation lots. Those meanings require separately governed subject-kind admissions and are not implied by this Blueprint.

## 3. Canonical identity

- DomainId: `BUSINESS_CERTIFICATION`.
- Product authority identity: exact case-sensitive literal `BUSINESS_CERTIFICATION_AUTHORITY`.
- Aggregate root: `BusinessCertificationRecord`.
- Aggregate identity: `CertificationId`, an opaque immutable identifier allocated by `BusinessCertificationAuthority`.
- Equality is exact ordinal equality. Consumers do not trim, normalize, prefix-match or parse an identifier to establish ownership.
- A prefix or non-empty string never proves ownership. Existence is proven only by the authority's read-only resolver against its authoritative repository.

## 4. CertificationReference

The canonical reference contract is:

```text
CertificationReference
  authority: "BUSINESS_CERTIFICATION_AUTHORITY"
  reference: CertificationId
```

The reference contains identity only. It contains no decision, state, date, criteria, subject payload or copied certification data.

An Evidence admission is valid only when all of the following hold:

1. `authority` is exactly `BUSINESS_CERTIFICATION_AUTHORITY`;
2. the owner resolves the exact `reference` as an existing `CertificationId`;
3. the resolved record has subject kind `BUSINESS_EVIDENCE` and its `evidenceId` equals the Evidence record receiving the reference;
4. the owner is available and returns a structurally consistent record.

Current certification state is not an admission shortcut and is never copied into Evidence. A reference to an existing rejected, withdrawn or invalidated record remains an identity reference whose current state is resolved from this owner. Unknown authority, absent identity, subject mismatch, unavailable owner and malformed owner response all fail closed.

## 5. Aggregate

```text
BusinessCertificationRecord
  certificationId: CertificationId
  authority: "BUSINESS_CERTIFICATION_AUTHORITY"
  subject:
    kind: "BUSINESS_EVIDENCE"
    evidenceId: EvidenceId
  criteriaReference: opaque immutable business-criteria identity
  decision: CERTIFIED | REJECTED
  currentState: CERTIFIED | REJECTED | WITHDRAWN | INVALIDATED
  decidedAt: timestamp
  provenance: actor, authority, causation identity
  supersedesCertificationId: optional CertificationId
  history: append-only certification events
```

The criteria payload and Evidence payload stay at their owners. The Certification record retains only stable references and its own decision/provenance.

## 6. Lifecycle

- Recording a decision creates one record in `CERTIFIED` or `REJECTED` state.
- A `CERTIFIED` record may become `WITHDRAWN` or `INVALIDATED`.
- A `REJECTED` record may become `INVALIDATED`.
- `WITHDRAWN` and `INVALIDATED` are terminal.
- A correction or renewed assessment creates a new `CertificationId` and may name `supersedesCertificationId`; history is never rewritten.
- Command idempotency identities are unique. Exact replay returns the existing result; divergent reuse fails closed.

## 7. Source of truth and persistence

`BusinessCertificationAuthority` is the sole producer of `BusinessCertificationRecord` and certification lifecycle events. One Business-Certification-owned durable append-only journal/repository is the source of truth and must recover identities, decisions, current states, provenance, supersession and idempotency deterministically after restart.

Evidence, Work and query consumers persist no certification snapshot or mutable state. CEREBRAU, `tools/cerebrau/**`, `tools/nova-core-runtime/Cerebrau*`, development reports and `Docs/12_CERTIFICATION` are not product persistence or recovery inputs.

## 8. Read-only boundary

The owner exposes one internal product-domain query:

```text
BusinessCertificationQueries.resolveReference(CertificationReference)
  -> UNRECOGNIZED_AUTHORITY
   | NOT_FOUND
   | FOUND(BusinessCertificationSnapshot)
   | AUTHORITY_UNAVAILABLE
```

For `FOUND`, the snapshot includes the exact `CertificationId`, authority, subject reference, decision, current state, criteria reference, decision time and provenance needed by an authorized consumer. It exposes no command or repository.

The query performs no mutation. An arbitrary pair such as `UNRECOGNIZED_AUTHORITY` / `ARBITRARY_REFERENCE` resolves `UNRECOGNIZED_AUTHORITY`, never `FOUND`.

## 9. Relations

| Domain | Relation | Boundary |
|---|---|---|
| EVIDENCE | one Certification record qualifies exactly one Evidence identity in the MVP; one Evidence may be referenced by zero or many Certification records | Certification checks Evidence identity read-only when recording a decision; Evidence resolves an optional reference read-only and owns no certification lifecycle |
| WORK | optional read consumer through Evidence | Work stores no certification record or state and sends no Certification command |
| INTELLIGENCE | possible read consumer after its own admission | Intelligence evaluation is not Certification |
| CEREBRAU / Mission / Runtime | no product relation | development and technical certification artifacts are prohibited substitutes |

## 10. Invariants

1. `BUSINESS_CERTIFICATION` has one product authority: `BUSINESS_CERTIFICATION_AUTHORITY`.
2. Only that authority allocates `CertificationId` and records certification decisions.
3. Authority ownership is never inferred from arbitrary text or an identifier prefix.
4. Every record refers to exactly one existing Business Evidence identity in the MVP.
5. Decision, current state and history remain owned by Business Certification and are never mirrored in Evidence.
6. Identity, subject and original decision are immutable; lifecycle history is append-only.
7. Unknown authority, absent identity, subject mismatch, unavailable persistence and inconsistent recovery fail closed.
8. Reads are side-effect free and expose no mutation capability.
9. No CEREBRAU, Mission, Runtime, test, Git or CI artifact can create a Business Certification identity.
10. No public API, BFF, frontend, notification, payment, accounting, generic policy engine or compliance platform is part of this boundary.

## 11. Admission state

The contract-only lot `P3-BUSINESS-CERTIFICATION-001A` admits this bounded context and its identities. It does not create a running authority or any `CertificationId`. Product behavior requires the separately authorized foundation lot `P3-BUSINESS-CERTIFICATION-001B`.

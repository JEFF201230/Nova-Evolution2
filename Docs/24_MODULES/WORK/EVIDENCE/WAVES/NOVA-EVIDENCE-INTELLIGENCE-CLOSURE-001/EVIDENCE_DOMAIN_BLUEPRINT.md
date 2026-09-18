# EVIDENCE DOMAIN BLUEPRINT

Status: `PROPOSED — FINAL HUMAN APPROVAL REQUIRED`

## 1. Intention

Evidence records the identity, provenance and lifecycle of an admissible Business Evidence reference without taking ownership of the referenced business payload. It exists so NOVA domains can support or contradict factual assertions with a stable, auditable reference.

## 2. Scope

Evidence owns `EvidenceId`, the admitted immutable source-occurrence reference, registration provenance, lifecycle history and an optional external `CertificationReference`.

Evidence does not own the source payload, Certification decision, Work association, Intelligence result, Synthesis, Confidence, Mission technical evidence, Runtime evidence or Governance evidence.

## 3. Responsibilities

Evidence must:

1. admit only the initial `ACTIONS_ACTION_RESULT_RECORDED` source through the certified read-only Actions history port; future source kinds require separate governed admission;
2. allocate a stable EvidenceId idempotently;
3. preserve occurrence and registration timestamps;
4. maintain append-only withdrawal, invalidation and supersession history;
5. expose internal resolution with explicit absence/unavailability;
6. resolve Certification through its owner when a reference exists.

## 4. Aggregate

The aggregate root is `BusinessEvidenceRecord`. It contains reference metadata only, as specified by `ARCH_EVIDENCE_001_DECISION.md`. One canonical immutable source occurrence has exactly one EvidenceId for all time, including after withdrawal, invalidation or supersession. An identical replay returns that identity; a divergent reuse of its idempotency tuple fails closed. Only a new source occurrence/version creates a new linked record; history is not rewritten.

## 5. Concepts

- `EvidenceId`: opaque immutable identity.
- `AdmissibleSourceReference`: for the MVP, `ACTIONS_AUTHORITY`, kind `ACTIONS_ACTION_RESULT_RECORDED`, and `(WorkReference, ActionId, actionsRevision, ResultId)`.
- `EvidenceProvenance`: producer, source, actor, dates and optional owner-provided fingerprint.
- `CertificationReference`: optional opaque pointer; it is not a status copy or source.
- `EvidenceLifecycle`: `ACTIVE`, `WITHDRAWN`, `INVALIDATED`, `SUPERSEDED`.
- `OriginatingMissionReference`: optional correlation, never a qualification mechanism.

## 6. Relations and cardinality

| Domain | Relation | Cardinality | Boundary |
|---|---|---|---|
| ACTIONS | referenced `ResultRecorded` occurrence | exactly one per Evidence in the MVP | ACTIONS retains Result/event payload and truth; Evidence resolves history read-only |
| Certification | optional reference | zero or one per Evidence | a separately admitted product authority owns current status; none is proven today, and technical Mission/Governance certification is prohibited as an implicit substitute |
| Mission | optional origin correlation | zero or one per Evidence | technical artefact is not Business Evidence |
| Work | external association | many-to-many | Work owns link, never Evidence content |
| Intelligence/Confidence/Synthesis | read consumers | zero to many | no reverse mutation |

## 7. Invariants

1. There is exactly one Evidence authority.
2. Every Evidence has one stable EvidenceId and one immutable/versioned source occurrence.
3. No source payload is copied.
4. `occurredAt` and `registeredAt` are distinct and required.
5. Identical source-occurrence registration is permanently idempotent; divergent reuse of the tuple fails closed without mutation.
6. Only a changed source occurrence/version creates a new EvidenceId.
7. Lifecycle history is append-only and auditable.
8. A terminal record is not reactivated or deleted.
9. Certification status is resolved, never mirrored.
10. Runtime, Governance, CEREBRAU, fixtures and projections are prohibited sources.
11. Missing, empty, unavailable, withdrawn and invalidated are not interchangeable.
12. Evidence cannot create or mutate Work, Intelligence, Actions, Planning or Decisions.

## 8. Events

- `BusinessEvidenceRegistered`
- `BusinessEvidenceWithdrawn`
- `BusinessEvidenceInvalidated`
- `BusinessEvidenceSuperseded`
- `CertificationReferenceAttached`
- `CertificationReferenceDetached`

Every event carries EvidenceId, actor/producer, timestamp, reason where applicable and idempotency identity.

## 9. Dictionary

`Business Evidence` is a registered reference to an authoritative business occurrence that may support or contradict a business assertion. It is not a report, log, readiness signal, certificate, UI value or payload copy.

## 10. Architecture decisions

- Evidence is an autonomous NOVA bounded context.
- Durable append-only history is required because current sources cannot deterministically recompose Evidence lifecycle.
- Work owns association facts; Evidence owns records.
- Certification is an external resolver.
- Internal ports precede any transport surface.

## 11. Phase 3 admission

Implementation is authorized only after final human approval, canonical registry bootstrap, passing Domain V2 context resolution and activation of `MISSION_ORDER_P3_EVIDENCE_001.md`. This Blueprint itself remains `PROPOSED` until approved and does not certify a producer.

## Structured conclusion

**FACT**  
The Blueprint implements the architecture content required by ARCH-EVIDENCE-001 without altering a certified domain.

**EVIDENCE**  
`ARCH_EVIDENCE_001_DECISION.md` and the hash-pinned Work/Intelligence inputs.

**ANALYSIS**  
Its bounded aggregate is the minimum needed for stable identity, provenance and lifecycle.

**LIMIT**  
Physical types and storage technology remain implementation choices.

**DECISION**  
Blueprint state: `PROPOSED`, ready for final human approval.

**NEXT ACTION**  
On approval, certify the contract lot before implementation.

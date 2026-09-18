# ARCH-EVIDENCE-001 — BUSINESS EVIDENCE ARCHITECTURE DECISION

Status: `APPROVED — PROGRAM OWNER — 2026-09-17`  
Decision owner: Human Program Owner  
Architecture steward: CEREBRAU  
Runtime owner: `NOVA_CORE`

## Approval provenance and history

- Historical state: `PROPOSED — DECIDED WITHIN AUTHORIZED WAVE — FINAL HUMAN APPROVAL REQUIRED` on 2026-09-14.
- Subsequent authoritative decision: `PROGRAM_DECISION_LOG.md`, record headed `PROGRAM OWNER DECISION — 2026-09-17`, item `1. ARCH-EVIDENCE-001`.
- Decision: `APPROVED`; this projection records that later decision and does not replace or backdate the original proposal.
- Canonical decision-record SHA-256: `d9290b5e26d63163ddfa9472c383cfea27adfb524f9bab7423ea795d194cf2d0`.
- Source file raw-byte SHA-256 at reconciliation: `d840f17c32ecae9d66b04991229d070a6580137df1bb2e5e242f94c69daa76a6`.
- Hash procedure: decode `PROGRAM_DECISION_LOG.md` as UTF-8; normalize CRLF and CR to LF; select from the exact heading `PROGRAM OWNER DECISION — 2026-09-17` through end of file; remove trailing LF characters; append exactly one LF; hash those UTF-8 bytes with SHA-256.

Approval is an architecture governance decision, not an implementation certification and not a WCF-008 closure.

## 1. Decision scope

This decision establishes the Business Evidence target architecture. It does not implement it, certify it, modify a certified Blueprint, or make CEREBRAU part of NOVA.

## 2. Authority and ownership

- Unique domain owner: NOVA bounded context `Evidence`.
- Aggregate root: `BusinessEvidenceRecord`.
- Authoritative producer: the NOVA Evidence application service accepting registrations only from explicitly admitted NOVA business-source ports.
- Authoritative persistence: one Evidence-owned durable repository with append-only lifecycle history.
- Evidence owns identity, registration metadata, source reference, provenance and lifecycle.
- The source domain owns the referenced payload and its business truth.
- Certification owns certification status; Evidence stores only an optional `CertificationReference`.
- Work owns only Work/Evidence association facts.

No existing Runtime, Mission, Governance, deliverable-integrity or CEREBRAU store is reused or renamed as this authority.

## 3. Minimal aggregate contract

```text
BusinessEvidenceRecord
  evidenceId: EvidenceId
  source: AdmissibleSourceReference
  provenance: EvidenceProvenance
  occurredAt: timestamp
  registeredAt: timestamp
  lifecycle: ACTIVE | WITHDRAWN | INVALIDATED | SUPERSEDED
  lifecycleReason: required when not ACTIVE
  supersedesEvidenceId: optional EvidenceId
  certificationReference: optional CertificationReference
  originatingMissionReference: optional MissionReference (correlation only)
```

The record contains no source payload, copied certification status, Work snapshot, Intelligence result, UI text or computed Confidence.

## 4. Identity, idempotence and duplicate policy

- `EvidenceId` is an opaque, immutable product identifier allocated once by the Evidence authority.
- Registration requires a canonical immutable source occurrence: source authority, source type, stable source reference and source version/occurrence token.
- The tuple `(sourceAuthority, sourceType, sourceReference, sourceVersionOrOccurrence)` is the registration idempotency key.
- Repeating the same tuple returns the existing `EvidenceId` and creates no second record.
- Repeating the same tuple with identical immutable registration fields is an idempotent replay. Reusing that tuple with a divergent source reference, occurrence timestamp or immutable provenance fails closed as `EVIDENCE_IDEMPOTENCY_CONFLICT`; it never mutates the record.
- A new source revision/occurrence creates a new `EvidenceId` and may declare `supersedesEvidenceId`.
- The same Evidence may support multiple Works; that reuse creates associations, not duplicate Evidence.
- If immutability/version of a source occurrence cannot be established, registration fails closed.
- Lifecycle transitions and Certification-reference changes use separate, independently idempotent commands and never alter the registration identity.

## 5. Provenance and timestamps

Required provenance is:

- producer domain and producer instance/type;
- source authority, kind, stable locator and version/occurrence;
- source fingerprint when the source authority exposes one, never fabricated;
- `occurredAt`, supplied by the authoritative source;
- `registeredAt`, assigned by the Evidence authority;
- registration actor/system identity inside NOVA;
- withdrawal/invalidation/supersession actor, time and reason.

`occurredAt` and `registeredAt` are distinct. A missing occurrence time cannot be replaced by registration time.

## 6. Admissible and prohibited sources

Admissible in the MVP:

- exactly one initial source kind: `ACTIONS_ACTION_RESULT_RECORDED`;
- source authority: certified `ACTIONS_AUTHORITY`;
- canonical reference: `(WorkReference, ActionId, actionsRevision, ResultId)` identifying one `ResultRecorded` occurrence in the append-only Actions history;
- resolver: the certified read-only `ActionsInternalQueries.getActionHistory(ActionReference)`, which must find exactly one matching revision/ResultId event; zero or multiple matches fail closed;
- `occurredAt`: the owner-provided `ActionResult.provenance.effectiveAt`; registration never substitutes its own clock;
- source fingerprint: absent unless ACTIONS later exposes one authoritatively; Evidence never fabricates it;
- no certification result is admitted as a Business Evidence source in the MVP; Certification remains an external qualification referenced separately.

The resolver exposes only the identity, occurrence/version and owner provenance required for admission. Evidence stores no Action Result outcome or event payload. This source is sufficient to prove one production registration path without changing ACTIONS. Every other business source kind is prohibited until a separately governed admission proves its owner, immutable occurrence identity and resolver.

Prohibited as Business Evidence sources:

- Runtime logs, diagnostics, traces, uptime and readiness;
- governance reports, Mission Orders, execution journals and CEREBRAU artefacts;
- `MissionEvidenceBundle`, `MissionEvidenceCertifier`, generic integration records and Runtime evidence consumption;
- UI/BFF projections, fixtures, generated copy and test counts;
- an unresolved locator, mutable payload without a version/occurrence, or any source without an authoritative owner.

Future source kinds require a separately governed admission rule; generic plugin/provider abstraction is out of MVP scope.

## 7. Lifecycle

- Registration creates an `ACTIVE` record.
- `WITHDRAWN`: the owning producer withdraws applicability; history remains.
- `INVALIDATED`: provenance, source authority or integrity is proven invalid; history remains and consumers must not treat it as active support.
- `SUPERSEDED`: a newer admitted occurrence replaces it for current use; historical references remain resolvable.
- Terminal records are never deleted or reactivated. A corrected source is a new Evidence record linked by supersession.
- Lifecycle transitions are append-only, timestamped, reasoned and idempotent.

## 8. Certification relationship

- `CertificationReference` is optional and opaque to Evidence.
- No authoritative NOVA Business Certification producer is proven in the current audited state. Until one is separately admitted, new records carry no CertificationReference and resolution remains `REFERENCE_ABSENT`; a previously resolvable reference whose admitted owner is unavailable returns `AUTHORITY_UNAVAILABLE`.
- Current status is resolved through the Certification owner at query time.
- Evidence never stores or republishes a mutable certification status as its own fact.
- Resolution states are `REFERENCE_ABSENT`, `AUTHORITY_UNAVAILABLE`, or `RESOLVED(ownerStatus)`.
- `AUTHORITY_UNAVAILABLE` never becomes uncertified, certified or empty by fallback.
- Withdrawal/invalidation of Evidence and withdrawal/rejection of Certification remain distinct lifecycle facts.
- Mission technical certification, governance certificates and `MissionEvidenceCertifier` are never implicit Certification owners for Business Evidence.

## 9. Persistence and recovery

Durable Evidence-owned persistence is required. Deterministic recomposition from current stores is rejected because no existing authoritative source contains Evidence identity, registration idempotence, withdrawal/invalidation and supersession history. The repository must persist current state plus an auditable append-only transition history, or an append-only journal from which current state is deterministic. It must not be `IntegrationRuntimeRepository` or a Work store.

## 10. Internal query model

Initial internal ports only:

- resolve one Evidence by `EvidenceId`;
- resolve a set of Evidence IDs without changing input order;
- resolve the current lifecycle and provenance;
- resolve optional Certification through its owner;
- return explicit `FOUND`, `NOT_FOUND`, and `AUTHORITY_UNAVAILABLE` outcomes;
- preserve invalidated/withdrawn records as found historical records with lifecycle state.

No public BFF, API or frontend is authorized by this decision.

## 11. Mission and Work relationships

- Mission: one Evidence record has zero or one `originatingMissionReference` for correlation only; one Mission may correlate to zero or many Evidence records. A technical Mission artefact does not become Business Evidence through this field.
- Work: Evidence does not own Work links. WCF-004 owns a many-to-many association `(WorkReference, EvidenceId)` with association provenance and timestamp.
- A Work may have zero to many Evidence references; one Evidence may support zero to many Works.
- Work resolves content, provenance, lifecycle and certification from their owners and never mirrors them.

## 12. Absence and unavailability

`NOT_FOUND`, `AVAILABLE_EMPTY`, `AUTHORITY_UNAVAILABLE`, `WITHDRAWN` and `INVALIDATED` are semantically distinct. Consumers must propagate them without invented fallback values. A Work query with no associations is `AVAILABLE_EMPTY`; failure to reach Evidence is `AUTHORITY_UNAVAILABLE`.

## 13. Prioritized Action terminology — HUMAN_GATE RESOLVED 2026-09-17

The canonical documents determine one compatible interpretation:

- Planning owns plan priorities (`WORK_PHASE2_CERTIFICATION.md:73` and `INTELLIGENCE_DOMAIN_BLUEPRINT.md:157`).
- Actions owns Actions (`WORK_PHASE2_CERTIFICATION.md:74` and `INTELLIGENCE_DOMAIN_BLUEPRINT.md:158`).
- Intelligence owns Recommendations and may select the next best action (`WORK_DOMAIN_BLUEPRINT.md:427-435`; roadmap lines 117-126).
- A Recommendation is not an Action, Decision or Command and has no effect by itself (`INTELLIGENCE_DOMAIN_BLUEPRINT.md:179-180,240-242`).

At proposal time, these sources determined ownership and effect, but not the Recommendation-to-Action cardinality. The Intelligence Blueprint explicitly left Recommendation/Decision/Action relations to future work. The proposal therefore recorded two materially compatible MVP interpretations:

1. `EXISTING_ACTION`: the read label selects the highest-ranked current Recommendation referencing an existing authoritative `ActionId`;
2. `PROPOSED_FUTURE_ACTION`: the read label selects the highest-ranked current Recommendation proposing a future Action, with no `ActionId` or effect until Actions admits it.

Neither option is a Planning priority, neither mutates Actions, and neither is executable without the required domain admission. No new `PrioritizedAction` aggregate is authorized.

The Program Owner decision dated 2026-09-17 selected `EXISTING_ACTION`. For the NOVA MVP, Next Best Action is the highest-ranked current non-imperative Intelligence Recommendation referencing an existing authoritative `ActionId`. Intelligence may analyze, rank and recommend that existing Action; it does not create, execute, mutate, admit, approve or command an Action. A Recommendation without an existing authoritative `ActionId` remains a general Recommendation and is not a Next Best Action. Future not-yet-admitted Action proposals are deferred beyond this MVP and require their own governed contract.

## 14. Alternatives rejected

| Alternative | Rejection reason |
|---|---|
| Reuse Mission/Runtime evidence store | wrong authority, keys, lifecycle and semantics |
| Store source payload in Evidence | creates a competing truth |
| Let Work own Evidence | violates certified Work boundary |
| Recompose from existing technical stores | cannot recover Business Evidence lifecycle/history |
| Make prioritized action a Planning priority | conflicts with Intelligence-owned selection and directly mutates Planning semantics |
| Make Recommendation an executable Action | violates Intelligence invariants |
| Silently choose existing versus proposed Action | rejected at proposal time; the section 13 gate was subsequently resolved by the Program Owner as `EXISTING_ACTION` |

## Structured conclusion

**FACT**  
The architecture was initially proposed on 2026-09-14 and subsequently approved by the Human Program Owner on 2026-09-17. Evidence is the sole Business Evidence authority and owns reference identity and append-only lifecycle history only; source payload remains owned by its authoritative producer, and Work owns only `(WorkReference, EvidenceId)` plus association provenance.

**EVIDENCE**  
`PROGRAM_DECISION_LOG.md`, decision record headed `PROGRAM OWNER DECISION — 2026-09-17`; canonical decision-record SHA-256 `d9290b5e26d63163ddfa9472c383cfea27adfb524f9bab7423ea795d194cf2d0`. Supporting architecture basis: primary audit sections 3, 6 and 8; Work Blueprint lines 135, 427-438 and 479; Intelligence Blueprint lines 131-133, 155-167, 169-190 and 232-242.

**ANALYSIS**  
The later authoritative decision adopts the proposed reference-only Evidence authority without changing its ownership boundaries and resolves the previously open Recommendation cardinality as `EXISTING_ACTION`.

**LIMIT**  
Physical database technology, exact language types and certification vocabulary remain implementation decisions constrained by this contract.

**DECISION**  
`ARCH-EVIDENCE-001` is `APPROVED` by the Human Program Owner decision dated 2026-09-17. Existing downstream certification claims are subject to `RATIFY_WITH_INDEPENDENT_PROVENANCE_REVALIDATION`; this approval does not itself certify any implementation.

**NEXT ACTION**  
Use the recorded decision provenance for the scoped C-01 reconciliation only. C-22 and WCF-008 closure remain outside this decision projection.

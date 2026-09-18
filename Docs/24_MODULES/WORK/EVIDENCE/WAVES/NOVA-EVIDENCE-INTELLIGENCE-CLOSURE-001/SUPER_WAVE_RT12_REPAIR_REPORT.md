# RT-12 Business Evidence CertificationReference Repair

Mission: `NOVA-SUPER-WAVE-RT12-PROVENANCE-CLOSURE-001`

Result: `PASS`
Date: `2026-09-17`

## Repair

`EvidenceAuthority.register()` and `EvidenceAuthority.attachCertification()` now admit a `CertificationReference` only through the read-only `BusinessCertificationQueries.resolveReference` contract. Validation occurs before the Evidence journal append.

The admitted reference contains only:

- `authority = BUSINESS_CERTIFICATION_AUTHORITY`;
- `reference = CertificationId`.

Evidence does not persist the Business Certification decision, state, criteria, time, provenance or subject snapshot.

## Fail-closed checks

| Condition | Result |
|---|---|
| arbitrary non-empty authority | rejected before owner lookup |
| wrong case | rejected before owner lookup |
| leading/trailing space | rejected before owner lookup |
| authority prefix/suffix | rejected before owner lookup |
| arbitrary or absent CertificationId | `EVIDENCE_CERTIFICATION_NOT_FOUND` |
| CertificationId for another Evidence | `EVIDENCE_CERTIFICATION_SUBJECT_MISMATCH` |
| subject kind other than `BUSINESS_EVIDENCE` | rejected |
| `WITHDRAWN` certification | `EVIDENCE_CERTIFICATION_STATE_NOT_ADMISSIBLE` |
| `INVALIDATED` certification | `EVIDENCE_CERTIFICATION_STATE_NOT_ADMISSIBLE` |
| absent, throwing or explicitly unavailable owner | `EVIDENCE_CERTIFICATION_AUTHORITY_UNAVAILABLE` |
| malformed or incoherent `FOUND` response | `EVIDENCE_CERTIFICATION_RESOLUTION_INCONSISTENT` |
| owner-issued `FOUND`, exact subject, `CERTIFIED` state | accepted |

## Proof properties

- A valid-path test uses a `CertificationId` issued by the real `BusinessCertificationAuthority` and resolved by the real `BusinessCertificationQueries` after durable journal persistence.
- Owner query bytes remain unchanged during Evidence admission.
- Failed resolution appends no Evidence event.
- Exact idempotent replay appends nothing and is deterministic.
- Evidence journal serialization contains no Business Certification status or content copy.
- Production Evidence/Business Certification code has no CEREBRAU, mission-certificate, `OfficialStatus`, CI or Git dependency.

## Delta

- `server/domain/evidence/evidence-authority.ts`
- `server/domain/evidence/errors.ts`
- `server/domain/evidence/evidence-foundation.test.ts`
- `server/domain/evidence/evidence-certification-reference.test.ts`
- `server/domain/evidence/tsconfig.json`
- `server/domain/work/work-evidence.test.ts` — fixture-only adaptation to the canonical authority; no Work product behavior changed.

No file under Business Certification product implementation was changed.

## Validation

- RT-12 tests: `8/8 PASS`.
- Combined Evidence, Business Certification and pertinent Work tests: `59/59 PASS`.
- Evidence typecheck: `PASS`.
- Business Certification typecheck: `PASS`.
- Extended protected-domain and Runtime regressions: `PASS`; see final status report.

Decision: `RT12 = PASS`.

## Independent revalidation — bootstrap-20260917T160907003

The current governed run repeated the RT-12 adversarial and integration suite from the persisted workspace state: `59/59 PASS`, including the `8/8` RT-12 cases. Evidence and Business Certification TypeScript project checks also passed. No product file was changed by this revalidation.

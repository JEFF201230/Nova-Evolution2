# MISSION ORDER — P3-BUSINESS-CERTIFICATION-001B

MissionId: `P3-BUSINESS-CERTIFICATION-001B-BUSINESS-CERTIFICATION-FOUNDATION-001`

Mode: `IMPLEMENTATION`

## Objective

Implement and validate the minimum product-domain owner admitted by `P3-BUSINESS-CERTIFICATION-001A`, including durable owner-issued identities and the read-only `resolveReference` boundary required before RT-12 can resume.

## Entry gate

All conditions are mandatory:

1. canonical registry resolution for `DomainId=BUSINESS_CERTIFICATION` returns `P3-BUSINESS-CERTIFICATION-001A` as the last certified lot and `P3-BUSINESS-CERTIFICATION-001B` as current/next;
2. `Resolve-DomainContext` selects exactly the Business Certification Blueprint and implementation contract;
3. `Read-LotImplementationContract` for `P3-BUSINESS-CERTIFICATION-001B` returns `Complete=true`, `PreviousLot=P3-BUSINESS-CERTIFICATION-001A`, and no next lot;
4. no competing Business Certification owner or implementation exists;
5. the workspace's unrelated modified and untracked files are preserved.

## Authorized delta

- `server/domain/business-certification/**`;
- scoped Business Certification tests and `tsconfig.json` inside that directory;
- this mission's implementation report;
- the B-lot certification artifact and registry transition only through the existing canonical certification writer after independent acceptance.

No Evidence, Work, Intelligence, Synthesis, Confidence, CEREBRAU, public API, BFF, UI or database-migration change is authorized.

## Required behavior

Implement the Blueprint and implementation contract exactly. In particular:

- only `BusinessCertificationAuthority` allocates `CertificationId` and records decisions;
- decision recording verifies one existing `EvidenceId` through a read-only port;
- persistence and recovery are durable, append-only and fail closed;
- `resolveReference` distinguishes `UNRECOGNIZED_AUTHORITY`, `NOT_FOUND`, `FOUND` and `AUTHORITY_UNAVAILABLE`;
- a `FOUND` snapshot exposes the exact subject and current owner state;
- reads perform zero writes;
- no default/seed certification or development-artifact import is permitted.

## Exit gate

All B-lot tests, scoped typecheck, resolver checks, recovery tests, forbidden-dependency scans and relevant non-regressions pass. Independent QA/Certification acceptance is required before the canonical writer may certify the B lot.

The mission must not implement RT-12. After B-lot certification, the next authorized mission is `RT-12-EVIDENCE-CERTIFICATION-REFERENCE-REPAIR-001`; it is not opened automatically.

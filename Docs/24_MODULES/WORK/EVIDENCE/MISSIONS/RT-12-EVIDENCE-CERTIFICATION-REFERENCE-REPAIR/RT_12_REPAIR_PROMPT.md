MISSION_ID: RT-12-EVIDENCE-CERTIFICATION-REFERENCE-REPAIR-001

MODE: IMPLEMENTATION / REPAIR / CERTIFICATION-RECOVERY
PRIORITY: BLOCKING
TARGET: NOVA Business Evidence
BLOCKER: RT-12

OBJECTIVE

Repair the RT-12 Business Evidence CertificationReference weakness identified by the Red Team.

Current implementation accepts arbitrary non-empty:

  CertificationReference {
    authority: string;
    reference: string;
  }

through freezeCertification(), which currently validates only textual presence.

This is insufficient because Business Evidence must not treat an arbitrary caller-provided non-empty certification reference as belonging to a recognized/admitted certification authority.

ARCHITECTURAL CONSTRAINT

Do NOT redesign Evidence.

Preserve the certified architecture:

- Evidence remains the sole Business Evidence authority.
- Evidence stores certification references, not certification payloads.
- Certification ownership remains external to Evidence.
- Evidence must not become a Certification authority.
- Evidence must not duplicate certification state.
- Evidence must not create a second source of truth.
- Evidence must not infer certification validity from arbitrary strings.

The repair must preserve reference-only semantics.

PROGRAM OWNER DECISION ALREADY RECORDED

The Program Owner approved:

- ARCH-EVIDENCE-001;
- reference-only Business Evidence;
- Work owning only (WorkReference, EvidenceId);
- EXISTING_ACTION semantics for Next Best Action;
- RATIFY_WITH_INDEPENDENT_PROVENANCE_REVALIDATION for existing downstream certification claims.

Do NOT request these decisions again.

SOURCE OF TRUTH DISCOVERY

Inspect the repository and identify the existing canonical certification authority identity/reference contract.

Use existing certification registry, certification artifacts, contracts, resolver/writer behavior and certified governance mechanisms.

Do NOT invent:

- a new Certification owner;
- a new registry;
- a new authority identifier;
- a new certification format;
- a hard-coded authority list unsupported by canonical repository sources.

If no authoritative validation mechanism exists, STOP with an explicit blocker rather than fabricating one.

REQUIRED BEHAVIOR

CertificationReference admission must fail closed.

A CertificationReference may be attached/accepted only when its authority/reference identity satisfies the canonical existing certification authority contract determined from repository evidence.

An arbitrary pair of non-empty strings MUST NOT be sufficient.

Preserve:

- append-only Evidence lifecycle;
- idempotency;
- journal recovery;
- deterministic behavior;
- reference-only storage;
- detach semantics;
- historical traceability.

Do not copy certification payload/status/certificate content into Business Evidence.

REQUIRED NEGATIVE TEST

At minimum prove that an arbitrary non-empty reference such as:

  authority = "UNRECOGNIZED_AUTHORITY"
  reference = "ARBITRARY_REFERENCE"

cannot be admitted as a valid CertificationReference.

Also test the canonical valid path discovered from repository authority.

REGRESSION REQUIREMENTS

Run and preserve:

- Evidence scoped tests;
- WORK tests affected by Evidence;
- ACTIONS regression;
- PLANNING regression;
- PEOPLE regression where applicable;
- NOVA Core/runtime tests;
- strict TypeScript checks;
- git diff --check.

Existing certified domain behavior must not regress.

PROVENANCE RECONCILIATION

After the RT-12 repair is technically validated, inspect the existing canonical artifacts for:

- P3-EVIDENCE-001B;
- WCF-004;
- WORK-AUTHORIZED-STATE-001.

Do NOT recreate or silently replace existing certifications.

Reconcile each existing certification against its existing:

- canonical report;
- evidence;
- test results;
- registry entry;
- certification provenance.

Program Owner decision:

  RATIFY_WITH_INDEPENDENT_PROVENANCE_REVALIDATION

If provenance validates, preserve and report the existing certification as reconciled.

If one certification fails reconciliation, place ONLY that certification on a governed correction path.

No global rollback.
No reimplementation of already valid certified domains.

INTELLIGENCE TRANSITION

After RT-12 and provenance reconciliation:

Evaluate the existing preauthorized dependency gate for:

  P3-INTELLIGENCE-001A

Use the existing:

  INTELLIGENCE_IMPLEMENTATION_CONTRACT.md
  MISSION_ORDER_P3_INTELLIGENCE_001.md
  PROGRAM_CERTIFICATION_IDENTITY_MAP.md

The Program Owner human semantic gate has been recorded in PROGRAM_DECISION_LOG.md.

Do NOT fabricate an approval.

If all machine-verifiable entry criteria now pass, perform only the already program-preauthorized P3-INTELLIGENCE-001A contract admission according to the canonical CEREBRAU governance mechanism.

Do NOT implement P3-INTELLIGENCE-001B in this mission.

Do NOT implement Synthesis.
Do NOT implement Confidence.
Do NOT close WCF-008.

BOUNDARIES

Allowed product scope:

  server/domain/evidence/**
  exact narrow tests required for RT-12

Allowed governance/document scope:

  existing NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001 Wave files required for:
  - RT-12 reconciliation;
  - provenance reconciliation;
  - P3-INTELLIGENCE-001A preauthorized admission;
  - mission report/evidence.

Forbidden:

  server/domain/intelligence/** product implementation
  server/domain/actions/** mutation
  server/domain/planning/** mutation
  server/domain/people/** mutation
  unrelated WORK product changes
  apps/**
  public API
  BFF
  database/migrations
  VEEDDA
  CEREBRAU as NOVA runtime dependency
  global Codex/npm/PATH configuration

CEREBRAU remains development governance/orchestration tooling and must not become a NOVA product/runtime dependency.

WORKSPACE SAFETY

The repository contains legitimate pre-existing modified and untracked files.

Do NOT:

  git reset --hard
  git clean
  git checkout .
  git restore .
  git add .
  delete unrelated untracked files
  revert unrelated existing work

Attribute only changes produced by this mission.

STOP CONDITIONS

STOP and report precisely if:

- canonical CertificationReference authority cannot be established;
- repair requires redesigning Evidence;
- protected certified domains would need mutation;
- provenance cannot be independently reconciled;
- P3-INTELLIGENCE-001A entry criteria remain unsatisfied;
- an unapproved semantic decision is required.

SUCCESS OUTPUT

Produce a precise mission report containing:

1. exact RT-12 root cause;
2. exact canonical authority contract used;
3. exact files changed;
4. tests and results;
5. negative arbitrary-reference proof;
6. valid-reference proof;
7. provenance result for Evidence;
8. provenance result for WCF-004;
9. provenance result for WORK-AUTHORIZED-STATE-001;
10. P3-INTELLIGENCE-001A admission result;
11. remaining blockers;
12. exact next authorized lot.

Do not claim certification or admission unless canonical governance actually records it.

# P3-CONFIDENCE-001B — IMPLEMENTATION PROMPT

MISSION_ID: P3-CONFIDENCE-001B-IMPLEMENTATION-001
DOMAIN: CONFIDENCE
LOT: P3-CONFIDENCE-001B
EXECUTION_MODE: IMPLEMENTATION

## OBJECTIVE

Implement the authoritative NOVA Confidence model after certified Intelligence and Synthesis.

Establish one Confidence authority producing contextual, bounded, evidence-based Confidence Assessments with deterministic lifecycle and provenance.

## AUTHORITATIVE INPUTS

- Docs/24_MODULES/WORK/CONFIDENCE_DOMAIN_BLUEPRINT.md
- Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/CONFIDENCE_IMPLEMENTATION_CONTRACT.md
- Certified P3-INTELLIGENCE-001B authority/results
- Certified P3-SYNTHESIS-001B authority/results
- Certified Evidence read authority
- Explicit subject/context supplied by authoritative producers

Inspect authoritative existing domain patterns before writing.

## REQUIRED IMPLEMENTATION

Primary scope:

- server/domain/confidence/**
- server/domain/confidence/tsconfig.json where required
- narrowly scoped Intelligence producer adapter only where strictly required
- scoped tests

Each ConfidenceAssessment MUST provide:

1. explicit subject
2. explicit context
3. bounded measure
4. declared deterministic method
5. supporting Evidence references
6. contradicting Evidence references
7. inconclusive Evidence references
8. provenance
9. observation date
10. limitations
11. revision history
12. withdrawal/recovery semantics

The implementation MUST maintain authoritative history and deterministic reconstruction.

## NON-NEGOTIABLE INVARIANTS

Confidence is contextual and evidence-based.

There is NO default Confidence score.

MUST NOT derive Confidence from:

- Progress
- readiness
- Risk score
- KPI score
- status
- test/pass counts
- certification alone
- absence of failure

MUST NOT:

- create Recommendation
- create or mutate Evidence
- mutate Intelligence
- mutate Synthesis
- mutate Planning
- mutate Action
- mutate Decision
- create operational effects
- introduce a general/person score
- introduce speculative scoring
- introduce UI/BFF/public API
- use Mission reports/logs/fixtures/UI/runtime diagnostics as business truth
- introduce CEREBRAU product/runtime dependency
- close WCF-008

Contradictory and inconclusive Evidence MUST remain explicit.

Revision and withdrawal MUST preserve history.

## INTELLIGENCE ADAPTER BOUNDARY

A narrowly scoped Intelligence producer adapter is permitted only where required by the certified contract.

If implementing that adapter requires substantial modification to certified Intelligence or any Blueprint:

STOP.

Report the blocker for human decision.

Do not broaden the Intelligence domain.

## REQUIRED TESTS

Prove:

- measure bounds
- explicit subject/context
- supporting Evidence roles
- contradicting Evidence roles
- inconclusive Evidence roles
- deterministic method application
- provenance and observation date
- limitations
- revision lifecycle
- withdrawal/recovery
- missing inputs
- unavailable inputs
- forbidden Progress derivation
- forbidden readiness derivation
- forbidden Risk/KPI derivation
- forbidden status derivation
- forbidden test/pass-count derivation
- forbidden certification-only derivation
- forbidden absence-of-failure derivation
- no Recommendation creation
- no operational domain effect
- no default score
- no Mission report/log/UI/fixture fallback
- non-regression Intelligence
- non-regression Synthesis
- non-regression Evidence
- non-regression Work
- non-regression Actions
- non-regression Planning
- non-regression People
- NOVA Runtime/Core regressions
- strict TypeScript
- git diff check
- path-scope compliance
- forbidden dependency scan

## PROTECTED ASSETS

Do not modify:

- Evidence authority/repositories
- Synthesis authority/history
- Planning
- Actions
- Decisions
- operational Work state
- BFF/UI/public API
- CEREBRAU modules
- VEEDDA

Certified Intelligence may only receive the narrowly required producer adapter permitted by the contract.

## EXIT REPORT

Report exactly:

MISSION_STATUS
CONFIDENCE_001B
SUBJECT_CONTEXT
BOUNDED_MEASURE
METHOD
EVIDENCE_ROLES
PROVENANCE
CONTRADICTIONS_INCONCLUSIVE
LIMITATIONS
REVISION_WITHDRAWAL
MISSING_UNAVAILABLE
FORBIDDEN_DERIVATIONS
OPERATIONAL_EFFECTS
REGRESSIONS
CEREBRAU_PRODUCT_DEPENDENCIES
WCF_008
FILES_CHANGED
TESTS_EXECUTED
BLOCKERS

Expected successful terminal state:

CONFIDENCE_001B READY_FOR_REVIEW
OPERATIONAL_EFFECTS NONE
CEREBRAU_PRODUCT_DEPENDENCIES NONE
WCF_008 OPEN

Do not claim CERTIFIED.
Do not implement or close WCF-008.

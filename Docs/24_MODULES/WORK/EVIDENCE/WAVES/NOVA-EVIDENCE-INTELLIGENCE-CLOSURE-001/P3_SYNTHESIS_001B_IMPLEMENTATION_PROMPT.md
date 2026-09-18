# P3-SYNTHESIS-001B — IMPLEMENTATION PROMPT

MISSION_ID: P3-SYNTHESIS-001B-IMPLEMENTATION-001
DOMAIN: SYNTHESIS
LOT: P3-SYNTHESIS-001B
EXECUTION_MODE: IMPLEMENTATION

## OBJECTIVE

Implement the authoritative NOVA Work Synthesis domain after certified Intelligence.

Implement one Work Synthesis authority that consumes certified Authorized Work State and certified Intelligence results and provides deterministic current and historical Work Synthesis with complete provenance.

## AUTHORITATIVE INPUTS

- Docs/24_MODULES/WORK/SYNTHESIS_DOMAIN_BLUEPRINT.md
- Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/SYNTHESIS_IMPLEMENTATION_CONTRACT.md
- Docs/24_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/MISSION_ORDER_P3_SYNTHESIS_001.md
- Certified Authorized Work State
- Certified P3-INTELLIGENCE-001B results
- Certified Evidence read authority where required

Inspect the authoritative implementation patterns already present in the repository before writing code.

## REQUIRED IMPLEMENTATION

Implement under:

- server/domain/synthesis/**
- server/domain/synthesis/tsconfig.json where required

Work integration is strictly limited to the narrow reference/read association required by the contract:

- server/domain/work/work-synthesis*.ts
- server/domain/work/index.ts
- server/domain/work/tsconfig.json
- scoped tests required by this implementation

Synthesis must provide:

1. one authoritative Synthesis authority;
2. zero or one current Synthesis per Work;
3. auditable historical versions;
4. deterministic source selection and ordering;
5. observation date;
6. source references and provenance;
7. explicit conflicts and contradictions;
8. explicit limits;
9. revision;
10. withdrawal and recovery;
11. explicit absent / empty / unavailable producer semantics;
12. read-only Work association.

## NON-NEGOTIABLE INVARIANTS

Synthesis selects and presents source-owned information.

Synthesis MUST NOT:

- create or correct a fact;
- create or mutate Evidence;
- create, mutate, rank or execute an Action;
- create Planning priority;
- create or mutate an Intelligence Recommendation;
- create an Outcome;
- create Confidence;
- invent a Confidence default;
- mutate Intelligence;
- mutate Authorized Work State;
- convert Mission reports, logs, fixtures, UI data or runtime diagnostics into business truth;
- introduce CEREBRAU as a NOVA product/runtime dependency;
- implement Confidence;
- close WCF-008.

Every meaningful synthesized element must preserve its authoritative source and observation provenance.

Contradictions must remain visible and must never be silently discarded.

## REQUIRED TESTS

Prove at minimum:

- current uniqueness;
- deterministic source selection;
- deterministic ordering;
- source reference preservation;
- factual Evidence traceability where applicable;
- contradiction visibility;
- limits visibility;
- revision lifecycle;
- withdrawal lifecycle;
- recovery;
- absent producer;
- empty producer;
- unavailable producer;
- no Mission report/log/UI/fixture fallback;
- no Confidence default;
- read-only Work association;
- Intelligence non-regression;
- Evidence non-regression;
- Work non-regression;
- Actions non-regression;
- Planning non-regression;
- People non-regression;
- NOVA Runtime non-regression;
- NOVA Core non-regression;
- strict TypeScript/typecheck;
- path-scope compliance;
- git diff compliance.

## PROTECTED ASSETS

Do not modify source producer aggregates or repositories.

Do not modify:

- Intelligence result/history authority;
- Evidence authority;
- Confidence Blueprint or implementation;
- Mission reports/projections as business sources;
- BFF;
- UI;
- public API;
- CEREBRAU modules;
- VEEDDA.

## EXIT CONTRACT

Return a factual implementation report containing:

- MISSION_STATUS
- SYNTHESIS_001B status
- CURRENT_UNIQUENESS
- SOURCE_PROVENANCE
- CONTRADICTIONS_LIMITS
- REVISION_WITHDRAWAL
- ABSENT_EMPTY_UNAVAILABLE
- WORK_ASSOCIATION
- REGRESSIONS
- CEREBRAU_PRODUCT_DEPENDENCIES
- CONFIDENCE
- WCF_008
- exact files modified
- exact tests executed and results
- blockers

Expected successful technical state:

SYNTHESIS_001B: READY_FOR_REVIEW
CONFIDENCE: NOT_STARTED
WCF_008: OPEN

Do not claim CERTIFIED. Certification belongs to the designated CEREBRAU authority mechanism after successful governed execution and review.

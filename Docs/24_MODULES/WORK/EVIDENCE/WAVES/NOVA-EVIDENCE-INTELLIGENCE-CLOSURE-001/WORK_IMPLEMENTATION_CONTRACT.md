# WORK IMPLEMENTATION CONTRACT

Status: `CERTIFIED`

**VERDICT : GO**  
Blueprint: `Docs/24_MODULES/WORK/WORK_DOMAIN_BLUEPRINT.md`

Execution route: existing Domain V2 resolver, approval policy and canonical certification writer after the program-approved compatibility repair teaches `Resolve-DomainContext` to accept the unique protected canonical WORK H1 `# WD-001 — Work Domain Blueprint` for `DomainId=WORK` only. This Wave will not rename that Blueprint or create a competing `# WORK DOMAIN BLUEPRINT`.

| Attribute | Value |
|---|---|
| DomainId | WORK |
| Lot | WCF-004A |
| Next authorized lot | WCF-004 |
| Nature | closure-chain contract admission; no product implementation |

## Scope

This contract governs only WCF-004, WORK-AUTHORIZED-STATE-001 and WCF-008-CLOSURE. It does not replace, backfill or reinterpret WCF-001/2/3/5/6/7.

## Required implementation

- WCF-004 persists only unique `(projectId, workId, EvidenceId)` links plus association provenance/time.
- Authorized Work State composes certified read queries without a new aggregate or persistent mirror.
- WCF-008 exposes certified Intelligence, Synthesis and Confidence associations/references without owning their content.
- All queries distinguish available-empty, not-found and producer-unavailable states.
- Read/projection paths have no mutation effect.

## Sequence and certification

Use the exact WORK chain in `PROGRAM_CERTIFICATION_IDENTITY_MAP.md`. A lot may become eligible only when its program dependencies also pass. The registry's next lot never bypasses EVIDENCE, INTELLIGENCE, SYNTHESIS or CONFIDENCE certification gates.

## Forbidden

Substantial Work Core rewrite; copied domain aggregates/status; changes to certified PEOPLE/PLANNING/ACTIONS; public transport/UI; technical evidence promotion; CEREBRAU product dependency.

### 1.3 Out of scope

- Work Core, Objective, Deliverables, Decisions, People, Planning or Actions rewrites
- Evidence, Intelligence, Synthesis or Confidence ownership
- public API, BFF, frontend and Runtime evidence components

### 2.2 Allowed dependencies

- certified WorkReference and Work read contracts
- Evidence, Intelligence, Synthesis and Confidence internal read ports after their program gates
- NOVA domain persistence primitives for Work-owned association facts

### 2.3 Forbidden dependencies

- CEREBRAU product/runtime modules
- technical Mission/Runtime/Governance evidence stores
- direct command ports of Evidence, Intelligence, Planning, Actions or Decisions

### 14.7 Non-negotiable invariants

1. Work stores only association identity and association provenance.
2. Work never copies mutable authoritative domain content or status.
3. Every producer-unavailable state remains distinct from available-empty.
4. WCF-008 cannot open from the intra-WORK chain until every cross-domain program certificate resolves.
5. The protected canonical Work Blueprint remains the sole Blueprint.

## 15. TEST CONTRACT

### 15.1 TEST CONTRACT PAR SOUS-LOT

| Sous-lot | Validations obligatoires |
|---|---|
| WCF-004 | Work Evidence association tests; Evidence unavailable/invalid tests; persistence/idempotence tests; protected regressions; Work typecheck |
| WORK-AUTHORIZED-STATE-001 | deterministic composition tests; no-mirror/no-mutation tests; contradiction/unavailable tests; protected regressions; Work typecheck |
| WCF-008-CLOSURE | full-chain and cross-domain gate tests; zero-writer-call negative matrix; protected regressions; closure criteria |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Accepted order

| Order | Sub-lot | Objective | Authorized deliverable |
|---|---|---|---|
| 1 | WCF-004 - Work Evidence Association | associate WorkReference and EvidenceId without content ownership | reference-only Work Evidence query |
| 2 | WORK-AUTHORIZED-STATE-001 - Authorized Work State | compose certified reads without persistence | WorkAuthorizedStateComposer |
| 3 | WCF-008-CLOSURE - Work Intelligence Closure | certify the full cross-domain chain | closure evidence and certification only |

## 17. ENTRY AND EXIT GATES

### 17.2 Lot gates

| Sub-lot | Entry | Authorized files | Exit |
|---|---|---|---|
| WCF-004 | WCF-004A CERTIFIED; P3-EVIDENCE-001B and WCF-001 certified | server/domain/work/work-evidence*.ts; server/domain/work/index.ts; server/domain/work/tsconfig.json; scoped tests | WCF-004 association/query certified with no copied truth |
| WORK-AUTHORIZED-STATE-001 | WCF-004 CERTIFIED and all contributing read ports certified | server/domain/work/work-authorized-state*.ts; server/domain/work/index.ts; server/domain/work/tsconfig.json; scoped tests | composer deterministic, read-only and non-persistent |
| WCF-008-CLOSURE | WORK-AUTHORIZED-STATE-001 plus Evidence, Intelligence, Synthesis, Confidence and all required WCF certificates resolve | closure mission/report files only; no product code | all WCF-008 criteria PASS and terminal human approval recorded |

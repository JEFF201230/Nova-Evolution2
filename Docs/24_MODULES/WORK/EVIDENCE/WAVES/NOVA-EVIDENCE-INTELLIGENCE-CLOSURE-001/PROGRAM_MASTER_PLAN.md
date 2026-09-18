# PROGRAM MASTER PLAN — NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001

Status: `PROPOSED — FINAL HUMAN APPROVAL REQUIRED`  
Classification: CEREBRAU governance artefact; not a NOVA Runtime dependency  
Prepared: 2026-09-14  
Runtime owner: `NOVA_CORE`  
Execution mode: `LOCAL_SINGLE_MISSION`

## 1. Objective

Close the governed architectural chain without collapsing domain ownership:

```text
Business Evidence
  -> Work/Evidence association
  -> authorized Work state
  -> Intelligence
  -> Synthesis
  -> Confidence
  -> WCF-008 closure
```

This first Wave prepares architecture, Mission Orders, gates, tests and Red Team controls. It does not authorize downstream product implementation or create a certificate.

## 2. Authoritative baseline

| Capability | Baseline classification |
|---|---|
| WCF-001, WCF-002, WCF-003 | `CERTIFIED` |
| WCF-004 | `ABSENT` |
| WCF-005, WCF-006, WCF-007 | `CERTIFIED` |
| WCF-008 | `ABSENT` |
| PEOPLE, PLANNING, ACTIONS | `CERTIFIED` |
| Business Evidence authority | `ABSENT` |
| Intelligence producer | `ABSENT` |

The primary evidence is the architecture audit indexed in `PROGRAM_EVIDENCE_INDEX.md`. Technical Mission Evidence, Runtime Evidence, Governance Evidence and deliverable-integrity evidence retain their bounded meanings and are not Business Evidence.

## 3. Program phases and gates

| Phase | Mission | Entry gate | Exit gate | Current state |
|---|---|---|---|---|
| 0 | ARCH-EVIDENCE-001 | Wave mandate granted | architecture decision approved by human owner | `PROPOSED`, awaiting final approval |
| 1 | P3-EVIDENCE-001 | Phase 0 approved | authoritative Evidence foundation certified | `BLOCKED_BY_DEPENDENCY` |
| 2 | WCF-004 | Phase 1 certified | WorkReference/EvidenceId association certified | `BLOCKED_BY_DEPENDENCY` |
| 3 | WORK-AUTHORIZED-STATE-001 | Phase 2 certified | read-only composer certified | `BLOCKED_BY_DEPENDENCY` |
| 4 | P3-INTELLIGENCE-001 | Phase 3 certified | Intelligence producer and Work read association certified | `BLOCKED_BY_DEPENDENCY` |
| 5 | P3-SYNTHESIS-001 | Phase 4 certified | Synthesis producer certified | `BLOCKED_BY_DEPENDENCY` |
| 6 | P3-CONFIDENCE-001 | Phase 5 certified | Confidence model/producer integration certified | `BLOCKED_BY_DEPENDENCY` |
| 7 | WCF-008-CLOSURE | Phases 0–6 certified | all WCF-008 closure criteria pass | `BLOCKED_BY_DEPENDENCY` |

No phase may infer satisfaction from documentation alone. Certification evidence must be resolved from the governing certification authority.

## 4. Commando responsibilities

| Responsibility | Accountability |
|---|---|
| Architecture Lead | ownership, authority boundaries, lifecycle, provenance, relations |
| Evidence Lead | Phase 1 foundation and unique producer |
| Work Integration Lead | Phases 2–3, reference-only association and read composition |
| Intelligence Lead | Phase 4 assessment, results, provenance, revisions and withdrawal |
| Synthesis/Confidence Lead | Phases 5–6 only after their gates |
| Red Team / Architecture Guardian | source duplication, leakage, contamination and regressions |
| QA / Certification | baselines, tests, deterministic evidence, gate and closure verification |

Parallelism is limited to analysis, contracts, test design, risk analysis, Mission Order preparation and Red Team review. Product implementation remains sequential.

## 5. Architecture outcome

`ARCH_EVIDENCE_001_DECISION.md` defines the smallest production-grade target:

- one NOVA Business Evidence bounded context;
- one persistent authority for Evidence identity and lifecycle;
- source references, never copied source payloads;
- certification resolved through a reference to its owner;
- Work-owned associations containing only `WorkReference`, `EvidenceId` and association provenance;
- explicit absence and authority-unavailable states;
- no CEREBRAU dependency.

The « Prioritized Action / Next Best Action » term is bounded as a ranked, non-imperative Intelligence Recommendation. It is neither a Planning priority nor an Actions Action and produces no effect without explicit domain admission. Whether it must reference an existing Action or may propose a future Action remains the single semantic HUMAN_GATE.

## 6. Transition policy

- `PASS`: record evidence and continue to the next authorized phase.
- Local technical failure inside the approved architecture: diagnose, repair, retest; maximum two attempts for one proven root cause.
- Structural drift or a STOP condition: fail closed and do not open a downstream phase.
- Final human approval is required before Phase 1 because it activates the new authoritative Evidence source described by Phase 0.

## 7. Program completion

Package preparation is complete when every required artifact exists and references resolve. Program transition additionally requires Red Team to have no open critical finding and the single explicit human gate to be recorded. Execution completes only after Phase 7 is certified; preparation must never be reported as product completion.

## Structured conclusion

**FACT**  
The upstream Business Evidence authority and downstream Intelligence chain do not exist in the audited product state.

**EVIDENCE**  
Primary audit, certified domain records and canonical Blueprints are indexed with hashes in `PROGRAM_EVIDENCE_INDEX.md`.

**ANALYSIS**  
The dependency chain is deterministic and can be delivered without changing certified PEOPLE, PLANNING or ACTIONS and without making CEREBRAU a product dependency.

**LIMIT**  
This package is architecture and execution governance, not implementation or certification.

**DECISION**  
Classification: `PROPOSED`; the program is executable only after the Phase-0 approval/provenance reconciliation and the Prioritized Action choice recorded in the single Program Owner gate.

**NEXT ACTION**  
Human Program Owner answers the gate in `PROGRAM_DECISION_LOG.md`; CEREBRAU reconciles certification provenance and activates only the immediate phase whose dependency evidence is authoritative.

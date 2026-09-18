# MISSION ORDER — P3-INTELLIGENCE-001

Status: `PREPARED — BLOCKED_BY_PHASE_3`  
Owner: Intelligence Lead  
Phase: 4

## Objective

Implement and certify the Intelligence Assessment authority and its reference-only Work association.

## Exact scope

P3-INTELLIGENCE-001A contract admission followed by P3-INTELLIGENCE-001B aggregate, producer, durable result history, internal queries, ranked Recommendation semantics and WorkReference association. Synthesis and Confidence are excluded.

## Authoritative inputs

Certified authorized Work-state query; certified Evidence query; certified Intelligence Blueprint and approved implementation contract; optional certified Knowledge/domain read ports.

## Protected assets

Evidence; Work contributors; PEOPLE, PLANNING, ACTIONS; Decisions; Synthesis/Confidence Blueprints; technical diagnostics.

## Allowed paths

`server/domain/intelligence/**`, including its strict domain `tsconfig.json`; exact Work files `server/domain/work/work-intelligence*.ts`, `server/domain/work/index.ts` and `server/domain/work/tsconfig.json`; scoped tests and phase Mission directory; the exact program-preauthorized/dependency-gated status/marker transition of this Wave's `INTELLIGENCE_IMPLEMENTATION_CONTRACT.md` and matching P3-INTELLIGENCE-001A canonical-registry row; and later canonical writer outputs.

## Forbidden paths

Evidence/Actions/Planning/Decisions producers or repositories, Synthesis/Confidence implementation, `apps/**`, BFF/public API, Runtime/Governance facts as implicit inputs and CEREBRAU modules.

## Dependencies

WORK-AUTHORIZED-STATE-001 certified; P3-EVIDENCE-001B and WCF-004 remain certified; the program-preauthorized P3-INTELLIGENCE-001A contract row resolves after dependency and drift checks; no change to certified Blueprint required.

## Implementation contract

Intelligence owns reasoned results only. Every factual assertion references active/admissible Evidence; hypotheses and interpretations are labelled; contradictions/limits remain; revisions and withdrawals are append-only. A Next Best Action is a ranked non-imperative Recommendation with no direct effect; its existing-Action versus proposed-future-Action shape must match the recorded D-005 human decision.

## Tests

Assessment identity/WorkReference; source/date/method; factual Evidence enforcement; contradiction and missing data; Analysis→Insight trace; Evaluation criteria; Recommendation non-imperative; deterministic ranking/ties; exact D-005 Next Best Action semantics; no cross-domain commands; revision/withdrawal recovery; absent/unavailable outputs; Work association; regressions/typecheck.

## Evidence

Contracts/schema, dependency scan, journal/recovery proof, negative command tests, deterministic outputs, scoped diff, Red Team report, execution report and P3-INTELLIGENCE-001B certificate.

## Exit criteria

Both Intelligence lots certified; authoritative producer/query and lifecycle operate after restart; Work reads without copying; no downstream implementation or protected regression.

## Auto-continue conditions

On `CERTIFIED`, passing entry gates and successful program-preauthorized SYNTHESIS A-contract admission, CEREBRAU automatically records the explicit assignment and activates P3-SYNTHESIS-001 through the existing mechanism, without a new human transition gate.

## STOP conditions

Unproved factual claim, Evidence mutation, direct Action/Decision/Planning effect, technical diagnostic promotion, semantic drift of prioritized action, Synthesis/Confidence code, second result store or Blueprint change.

## Structured conclusion

**FACT** The Blueprint exists but no producer exists.  
**EVIDENCE** Primary audit section 6.  
**ANALYSIS** Upstream Evidence and authorized Work state make the bounded producer executable.  
**LIMIT** Phase waits for Phase 3.  
**DECISION** `BLOCKED_BY_DEPENDENCY`.  
**NEXT ACTION** Assign P3-INTELLIGENCE-001A after Phase 3 certification.

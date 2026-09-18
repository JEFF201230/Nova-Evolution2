# MISSION ORDER — P3-SYNTHESIS-001

Status: `PREPARED — BLOCKED_BY_PHASE_4`  
Owner: Synthesis / Confidence Lead  
Phase: 5

## Objective

Implement and certify the Work Synthesis authority after Intelligence certification.

## Exact scope

P3-SYNTHESIS-001A contract admission and P3-SYNTHESIS-001B current/historical Work Synthesis, source/conflict provenance, internal query and reference-only Work association. No Confidence implementation.

## Authoritative inputs

Certified authorized Work state, certified Intelligence results, Synthesis Blueprint/contract and optional certified domain reads.

## Protected assets

All input aggregates; Intelligence results/history; Evidence; Confidence Blueprint; Mission reports and projections.

## Allowed paths

`server/domain/synthesis/**`, including its strict domain `tsconfig.json`; exact Work files `server/domain/work/work-synthesis*.ts`, `server/domain/work/index.ts` and `server/domain/work/tsconfig.json`; scoped tests and phase Mission directory; the exact program-preauthorized/dependency-gated status/marker transition of this Wave's `SYNTHESIS_IMPLEMENTATION_CONTRACT.md` and matching P3-SYNTHESIS-001A canonical-registry row; and later canonical writer outputs.

## Forbidden paths

Input producer repositories, Intelligence mutation, Confidence implementation, Mission report/fixture conversion, BFF/UI/public API, CEREBRAU modules.

## Dependencies

P3-INTELLIGENCE-001B certified; authorized Work state remains certified; P3-SYNTHESIS-001A resolved.

## Implementation contract

Synthesis selects and presents only source-owned facts/results; maintains at most one current version per Work plus history; exposes observation date, provenance, sources, conflicts, limits and withdrawal. It never creates an Action, priority, Recommendation, fact, Outcome or Confidence.

## Tests

Exactly one current version; deterministic source selection/ordering; source references and factual Evidence; contradiction visibility; revision/withdrawal recovery; absent/empty/unavailable; no fallback from Mission report/log/UI; no Confidence default; read-only Work association; regressions/typecheck.

## Evidence

Source matrix, journal/recovery proof, forbidden-substitute tests, dependency/diff checks, Red Team report, execution report and P3-SYNTHESIS-001B certificate.

## Exit criteria

Both Synthesis lots certified; one authoritative current synthesis with auditable history; no copied facts or downstream Confidence implementation.

## Auto-continue conditions

On `CERTIFIED`, passing entry gates and successful program-preauthorized CONFIDENCE A-contract admission, CEREBRAU automatically records the explicit assignment and activates P3-CONFIDENCE-001 through the existing mechanism, without a new human transition gate.

## STOP conditions

Intelligence not certified, implicit/fabricated fact, Mission report/UI as source, Confidence preimplementation, input mutation, competing current synthesis or Blueprint change.

## Structured conclusion

**FACT** Synthesis is designed but not implemented.  
**EVIDENCE** Synthesis Blueprint and audit section 8.6.  
**ANALYSIS** The phase remains distinct and strictly downstream of Intelligence.  
**LIMIT** Phase waits for Phase 4.  
**DECISION** `BLOCKED_BY_DEPENDENCY`.  
**NEXT ACTION** Assign P3-SYNTHESIS-001A after Intelligence certification.

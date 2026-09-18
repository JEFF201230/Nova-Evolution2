# MISSION ORDER — WORK-AUTHORIZED-STATE-001

Status: `PREPARED — BLOCKED_BY_PHASE_2`  
Owner: Work Integration Lead  
Phase: 3

## Objective

Provide Intelligence a deterministic, dated, read-only composition of authorized Work contributions.

## Exact scope

One internal composer/query combining Work Core, Deliverables, Decisions, People, Planning, Actions and resolved Evidence by WorkReference. No persisted snapshot or new aggregate.

## Authoritative inputs

Certified WCF-004 and certified read queries of each contributor; Work contract and Blueprint.

## Protected assets

All contributing aggregates and repositories; Work Core; all producer semantics.

## Allowed paths

Narrow `server/domain/work/work-authorized-state*`, necessary scoped composition wiring, tests, phase Mission directory and canonical certification output.

## Forbidden paths

Contributor domain code/repositories, new state store/cache presented as authority, BFF/UI/public API, CEREBRAU modules and source-value normalization that changes meaning.

## Dependencies

WCF-004 certified; all required read ports available; optional domains may be absent only as explicitly modelled by their certified contracts.

## Implementation contract

Preserve each contribution’s owner, source reference, observation time and availability state. Same authoritative inputs produce same composition. Contradictions and invalid/withdrawn Evidence remain visible. Reads have no side effect.

## Tests

Determinism; stable ordering; missing Work; optional absent versus empty; each producer unavailable; conflicting contributions; withdrawn/invalid Evidence; read-only/no repository writes; timestamp/provenance; all contributor regressions and typecheck.

## Evidence

Input/output contract, dependency diagram, write-spy results, fixtures used only as tests, command output, diff scope, Red Team report, execution report and WORK-AUTHORIZED-STATE-001 certificate.

## Exit criteria

WORK chain resolves through this lot as certified; composer is deterministic, non-persistent and fail-closed; no contributor regression.

## Auto-continue conditions

On `CERTIFIED`, passing entry gates and successful program-preauthorized INTELLIGENCE A-contract admission, CEREBRAU automatically records the explicit assignment and activates P3-INTELLIGENCE-001 through the existing mechanism, without a new human transition gate.

## STOP conditions

Mirrored store, invented fallback, contributor mutation, hidden contradiction, Evidence lifecycle loss, CEREBRAU dependency or protected Blueprint change.

## Structured conclusion

**FACT** No authorized Work-state composer including Evidence exists.  
**EVIDENCE** Primary audit sections 6 and 8.3.  
**ANALYSIS** Read composition is sufficient; persistence would create a second truth.  
**LIMIT** Phase waits for WCF-004 certification.  
**DECISION** `BLOCKED_BY_DEPENDENCY`.  
**NEXT ACTION** Assign after WCF-004 certification.

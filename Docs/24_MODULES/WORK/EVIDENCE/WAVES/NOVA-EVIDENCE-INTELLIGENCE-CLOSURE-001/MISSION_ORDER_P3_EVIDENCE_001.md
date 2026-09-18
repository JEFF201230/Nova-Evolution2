# MISSION ORDER — P3-EVIDENCE-001

Status: `PREPARED — BLOCKED_BY_PHASE_0`  
Owner: Evidence Lead  
Phase: 1

## Objective

Implement and certify the unique NOVA Business Evidence foundation described by the approved Evidence Blueprint and contract.

## Exact scope

P3-EVIDENCE-001A contract admission followed by P3-EVIDENCE-001B aggregate, producer, persistence/history, source resolver, internal queries and tests. No Work integration.

## Authoritative inputs

Approved `EVIDENCE_DOMAIN_BLUEPRINT.md`, `EVIDENCE_IMPLEMENTATION_CONTRACT.md`, architecture decision, canonical certification contract/registry, certified ACTIONS Blueprint/certificate, and `ActionsInternalQueries.getActionHistory` read contract.

## Protected assets

Work; PEOPLE; PLANNING; ACTIONS; Mission/Runtime/Governance evidence components; Certification owner.

## Allowed paths

`server/domain/evidence/**`, including its strict domain `tsconfig.json` and scoped tests; `Docs/24_MODULES/WORK/EVIDENCE/MISSIONS/P3-EVIDENCE-001/**`; the exact program-approved status/marker transition of this Wave's `EVIDENCE_IMPLEMENTATION_CONTRACT.md`; the matching EVIDENCE/P3-EVIDENCE-001A addition to `Docs/12_CERTIFICATION/certification-registry.json`; and later canonical JSON certification outputs written only by the approved writer.

## Forbidden paths

`server/domain/people/**`, `planning/**`, `actions/**`, Work integration, Intelligence/Synthesis/Confidence, `apps/**`, public transports, CEREBRAU modules and any registry edit not exactly covered by the final human contract-admission decision.

## Dependencies

Phase 0 human-approved; protected-input hashes revalidated; the exact EVIDENCE/P3-EVIDENCE-001A Markdown contract row admitted by the approved atomic canonical-registry amendment and resolved by Domain V2; no conflicting Evidence authority.

## Implementation contract

Persist references and append-only lifecycle only; admit the real `ACTIONS_ACTION_RESULT_RECORDED` occurrence by `(WorkReference, ActionId, actionsRevision, ResultId)` through read-only Actions history; enforce the one-kind allow-list, occurrence/version, idempotency, terminal transitions and explicit query states; resolve Certification externally; never copy source payload/status.

## Tests

Identity stability; same registration idempotence; conflicting duplicate rejection; lifecycle transition matrix; recovery/history; real ACTIONS ResultRecorded registration/resolution; missing/ambiguous/unavailable Actions history; non-ACTIONS source denial; no Action Result outcome/payload persistence; timestamp distinction; Certification absent/unavailable/resolved; ordered queries; no Runtime repository reuse; dependency and type checks.

## Evidence

Before/after snapshots, command outputs, persistence schema, source allow-list, repository uniqueness scan, test/typecheck reports, Red Team findings, execution report and canonical P3-EVIDENCE-001B certificate.

## Exit criteria

P3-EVIDENCE-001A and B form one connected certified EVIDENCE chain; producer/query work after restart; all invariants and regressions pass; designated QA/Certification authority accepts the report through the existing policy.

## Auto-continue conditions

On `CERTIFIED` and passing entry gates, CEREBRAU automatically records the explicit assignment and activates WCF-004 through the existing mechanism, without human transition approval.

## STOP conditions

Any second store/producer, prohibited-source admission, payload/status copy, Work ownership, CEREBRAU dependency, protected-domain change or unresolved structural change.

## Structured conclusion

**FACT** Evidence implementation is absent.  
**EVIDENCE** Primary audit sections 3 and 8.  
**ANALYSIS** The approved reference-only foundation is sufficient and minimal.  
**LIMIT** Mission is inactive until Phase 0 approval.  
**DECISION** `BLOCKED_BY_DEPENDENCY`.  
**NEXT ACTION** After approval, assign only P3-EVIDENCE-001A.

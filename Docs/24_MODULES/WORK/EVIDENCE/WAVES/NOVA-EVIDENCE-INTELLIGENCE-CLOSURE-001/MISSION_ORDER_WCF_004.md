# MISSION ORDER — WCF-004

Status: `PREPARED — BLOCKED_BY_PHASE_1`  
Owner: Work Integration Lead  
Phase: 2

## Objective

Implement and certify the Work/Evidence association without transferring Evidence ownership to Work.

## Exact scope

The WCF-004 unique association `(projectId, workId, EvidenceId)`, association provenance/time and read query resolving Evidence/Certification from owners, executed through the explicit mission runner.

## Authoritative inputs

Certified P3-EVIDENCE-001B query; canonical WorkReference/Work Core; approved `WORK_IMPLEMENTATION_CONTRACT.md`; Certification read port.

## Protected assets

Evidence content/history; Work Core, Deliverables and Decisions; PEOPLE, PLANNING and ACTIONS; technical Evidence mechanisms.

## Allowed paths

Exact Work paths `server/domain/work/work-evidence*.ts`, `server/domain/work/index.ts` and `server/domain/work/tsconfig.json`; scoped tests; phase Mission directory; the program-preauthorized/dependency-gated WORK/WCF-004A contract admission; and later canonical writer outputs.

## Forbidden paths

Evidence producer/repository, certified domain implementations, Work aggregate rewrites, `apps/**`, public transports, CEREBRAU modules and generic Runtime stores.

## Dependencies

P3-EVIDENCE-001B and WCF-001 semantic capability certified; WorkReference canonical; explicit mission manifest assigned; Certification access available or explicitly representable as unavailable.

## Implementation contract

Work stores only link identity, link provenance and link timestamp. Resolution is read-only; duplicate link is idempotent; link removal does not delete Evidence; no mutable Evidence/certification field is mirrored.

## Tests

Zero/one/many and many-to-many cardinality; duplicate link; unlink; unknown Work/Evidence; withdrawn/invalid Evidence; producer unavailable versus empty; Certification unavailable; no copy schema; restart/recovery if links persist; Work/Runtime/Core and protected-domain regressions.

## Evidence

Schema whitelist, dependency graph, queries, negative tests, scoped diff, regression/typecheck output, Red Team report, execution report and WCF-004 certificate.

## Exit criteria

WCF-004 certified; deterministic association/query passes; no competing truth or protected regression.

## Auto-continue conditions

On `CERTIFIED` and passing entry gates, CEREBRAU automatically records the explicit assignment and activates WORK-AUTHORIZED-STATE-001 through the existing mechanism, without human transition approval.

## STOP conditions

Evidence payload/status stored in Work, Work creates/certifies Evidence, source authority unavailable hidden as empty, protected-domain rewrite or dependency bypass.

## Structured conclusion

**FACT** WCF-004 is absent.  
**EVIDENCE** Primary audit Q5/Q6.  
**ANALYSIS** A reference-only Work association closes the gap without a mirrored store.  
**LIMIT** Phase waits for Evidence certification.  
**DECISION** `BLOCKED_BY_DEPENDENCY`.  
**NEXT ACTION** Assign WCF-004 only after Phase 1 certification.

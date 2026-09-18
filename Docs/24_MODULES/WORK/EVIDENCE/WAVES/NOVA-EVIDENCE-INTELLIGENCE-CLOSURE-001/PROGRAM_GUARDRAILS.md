# PROGRAM GUARDRAILS

Status: `PROPOSED`  
Applies to: all phases of NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001

## Enforceable invariants

| ID | Invariant | Mechanical/architectural control | Failure result |
|---|---|---|---|
| G-01 | Exactly one Business Evidence authority | dependency and repository scan; producer contract review | `STOP_SECOND_SOURCE` |
| G-02 | CEREBRAU is governance only | no new CEREBRAU import/call/config in Evidence, Intelligence, Synthesis, Confidence, Work integration or their new ports; protected legacy components remain untouched | `STOP_CONTAMINATION` |
| G-03 | Technical evidence is not Business Evidence | reject Runtime/log/readiness/governance/mission-bundle source kinds | `STOP_SOURCE_CLASSIFICATION` |
| G-04 | Work never owns Evidence content | Work association schema contains references and association provenance only | `STOP_DOMAIN_LEAKAGE` |
| G-05 | No mutable authoritative data is mirrored | schema and persistence diff review | `STOP_DUPLICATED_PERSISTENCE` |
| G-06 | Intelligence never creates or modifies Evidence | command/API dependency tests | `STOP_ILLEGAL_MUTATION` |
| G-07 | Recommendation has no direct effect | no direct command path into Actions, Planning or Decisions | `STOP_IMPERATIVE_RECOMMENDATION` |
| G-08 | Certified domains remain protected | scoped diff check and their full regression suites | `STOP_CERTIFIED_REGRESSION` |
| G-09 | Synthesis waits for Intelligence certification | certification gate resolver | `STOP_DEPENDENCY_BYPASS` |
| G-10 | Confidence is evidence-based, never derived from readiness/progress/counts | forbidden-input and boundary tests | `STOP_FABRICATED_CONFIDENCE` |
| G-11 | UI, fixtures and reports are consumers | dependency-direction checks | `STOP_PROJECTION_AUTHORITY` |
| G-12 | Blueprint changes require human decision | preflight diff against protected documents | `HUMAN_GATE` |

## Protected assets

The following are `KEEP` and may only be consumed through certified boundaries: Work Core, Work Deliverables, Work Decisions, PEOPLE, PLANNING, ACTIONS, `MissionEvidenceCertifier`, `CertifiedIntegrationService`, `IntegrationRuntimeRepository`, `runtime-evidence-consumption`, and the current Mission Evidence route.

They must not be renamed, reclassified or used as Business Evidence/Intelligence authorities.

## Allowed product direction

```text
authoritative business source --reference--> Evidence authority
Evidence authority --read--> Work association/composer
certified Work queries --read--> authorized Work state
authorized Work state + Evidence --read--> Intelligence
Intelligence --read result--> Synthesis / Confidence / Work projection
```

All reverse mutation arrows are forbidden unless a later, separately approved domain command explicitly owns them.

## Fail-closed semantics

- Authority unavailable is not empty and is never replaced by a default.
- Missing Evidence is not invalid Evidence.
- Withdrawn/invalidated Evidence remains auditable and is not presented as active.
- A missing CertificationReference is not a failed certification.
- An unavailable Certification authority is not `CERTIFIED` or `NOT_CERTIFIED`; it is unavailable.
- A missing Intelligence result creates no Recommendation, Synthesis or Confidence.

## Automatic repair boundary

Two attempts are permitted only for the same proven local technical root cause and only when the repair stays within an approved Mission Order. Architecture changes, new authorities, protected Blueprint edits, destructive changes and certified-domain regressions are never auto-repaired.

## Structured conclusion

**FACT**  
The main risks are authority duplication, semantic promotion of technical artefacts, and cross-domain mutation.

**EVIDENCE**  
The primary audit sections 2, 6, 10 and 11 document the current collisions and protected components.

**ANALYSIS**  
The listed controls turn every non-negotiable guardrail into a preflight, schema, dependency, test or certification check.

**LIMIT**  
Exact commands depend on the implementation stack selected within each Mission Order.

**DECISION**  
Any critical violation fails closed; no downstream phase opens.

**NEXT ACTION**  
Bind these controls to each lot’s execution report and certification checklist.

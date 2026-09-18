# PROGRAM RISK REGISTER

Status: `PROPOSED`

| ID | Risk | Severity | Trigger/evidence | Preventive control | Owner | State |
|---|---|---|---|---|---|---|
| R-01 | second Evidence source | CRITICAL | another repository contains Evidence identity/lifecycle | one Evidence repository; dependency/schema scan | Architecture Lead | CONTROL_DEFINED_PHASE_1 |
| R-02 | Runtime evidence promoted to business | CRITICAL | logs/readiness accepted by registration | source-kind deny-list and negative tests | Evidence Lead | CONTROL_DEFINED_PHASE_1 |
| R-03 | CEREBRAU contamination | CRITICAL | new product import/call/config references CEREBRAU | dependency graph and path scans | Architecture Guardian | CONTROL_DEFINED_ALL_PHASES |
| R-04 | Work mirrors Evidence | CRITICAL | association table contains source payload/status | schema whitelist | Work Lead | CONTROL_DEFINED_PHASE_2 |
| R-05 | certification status copied | HIGH | mutable status persisted by Work/Evidence | resolve owner status at read time | Evidence Lead | CONTROL_DEFINED_PHASE_1 |
| R-06 | certified domain regression | CRITICAL | changes/tests in PEOPLE/PLANNING/ACTIONS | protected path diff + full regression | QA | CONTROL_DEFINED_ALL_PHASES |
| R-07 | imperative Recommendation | HIGH | direct Action/Decision/Planning command | dependency tests; explicit admission | Intelligence Lead | CONTROL_DEFINED_PHASE_4 |
| R-08 | semantic drift of prioritized action | HIGH | existing/proposed Action semantics selected without authority, new aggregate, or plan priority created | HUMAN_GATE plus contract tests/review | Architecture Lead | OPEN_HUMAN_GATE |
| R-09 | Synthesis premature/substitute | HIGH | report/UX text used before Intelligence certificate | phase gate + source tests | Synthesis Lead | CONTROL_DEFINED_PHASE_5 |
| R-10 | fabricated Confidence | CRITICAL | progress/readiness/counts mapped to confidence | input allow-list and property tests | Confidence Lead | CONTROL_DEFINED_PHASE_6 |
| R-11 | lost lifecycle history | HIGH | mutable row without auditable transitions | append-only journal/history tests | Domain leads | CONTROL_DEFINED_PHASES_1_4_5_6 |
| R-12 | authority unavailable collapsed to empty | HIGH | fallback collection/default | explicit result union tests | QA | CONTROL_DEFINED_ALL_PHASES |
| R-13 | dirty-worktree collateral changes | HIGH | unrelated pre-existing untracked files included | path-scoped diff/status evidence | Program Director | CONTROL_ACTIVE_WAVE |
| R-14 | label collision WCF | MEDIUM | historic and current numbering confused | semantic capability names in reports | QA | CONTROL_ACTIVE |
| R-15 | excessive MVP scope | MEDIUM | BFF/UI/provider framework added | Mission Order forbidden paths | Program Director | CONTROL_DEFINED_ALL_PHASES |
| R-16 | non-atomic first contract admission or broken certification identity chain | CRITICAL | contract status/legacy marker and canonical registry row diverge, duplicate, or resolve another Blueprint/lot | one reviewed two-file changeset; rollback both files on failure; require `Read-LotCertification(A)=CERTIFIED/Legacy=true`, exact `Resolve-DomainContext`, complete B contract, and `Resolve-CurrentLot.CurrentLot=B` before Phase 1 | QA / Certification | HUMAN_GATED_PHASE_0 |
| R-17 | intra-domain WORK chain bypasses cross-domain program gates | CRITICAL | WORK resolver exposes WCF-008-CLOSURE after WORK-AUTHORIZED-STATE while Intelligence, Synthesis or Confidence is absent/rejected/unavailable | program gate wrapper must resolve every cross-domain predecessor before any WCF-008 writer call; negative matrix asserts zero writer calls for each missing state | Program Director / QA | CONTROL_DEFINED_PHASE_7 |
| R-18 | unsupported certification provenance | CRITICAL | dirty registry/certificates claim certification without a recorded Phase-0 approval | preserve artifacts; human provenance disposition; independent revalidation before reliance | Program Owner / QA | STRUCTURAL_STOP |
| R-19 | unadmitted CertificationReference owner | HIGH | Evidence accepts an arbitrary authority/reference before a Business Certification owner is admitted | reject all references until explicit owner admission; owning-phase repair and recertification | Evidence Lead / QA | STRUCTURAL_STOP |

## Acceptance rule

No CRITICAL or HIGH risk may be accepted implicitly. `CONTROL_DEFINED_*` denotes a future risk with a mandatory phase control, not an open Red Team finding. A failed control becomes `BLOCKING_FINDING`. Risk counts are not Confidence.

## Structured conclusion

**FACT**  
All identified risks have a named owner and testable control.

**EVIDENCE**  
Primary audit section 11 and Wave guardrails.

**ANALYSIS**  
R-08 remains a bounded semantic choice. R-18 and R-19 are observed current-worktree drift; other risks activate with their phases.

**LIMIT**  
Residual severity can only be reassessed from implementation evidence.

**DECISION**  
No risk prevents completing the preparation package. R-08 is human-gated; R-18 and R-19 stop program transition; R-16 remains fail-closed behind final approval; and R-17 requires executable Phase 7 gate evidence.

**NEXT ACTION**  
Program Owner resolves the single gate and provenance disposition; retained candidate code repairs R-19 in the Evidence owning phase before any downstream reliance.

# 1 Program Identity

| Field | Value |
|---|---|
| Program | `PROGRAM-037 — NOVA Visual Certification System` |
| Lot | `LOT-000 — Program Readiness` |
| Mission ID | `P37-MO-000-PROGRAM-READINESS` |
| Mission type | Program Readiness |
| Priority | CRITICAL |
| Execution date | 2026-07-13 |
| Repository | `C:\DEV\nova-orchestrator` |
| Authorized output | `P37-LOT-000_PROGRAM_READINESS.md` only |
| Governance authority | `P37-DR-001 — Visual Certification Governance` |
| Entry authorization | Explicitly granted by `P37-DR-001`, Section 19 |
| Exit Gate | `GATE-P37-PROGRAM-READINESS` |
| Final verdict | `READY WITH CONDITIONS` |

This report executes only the readiness assessment of LOT-000. It does not install a tool, run Playwright, take a capture, compare images, certify a screen, modify PROGRAM-036, modify PROGRAM-037 governance, or modify frontend code.

# 2 Sources

All mandatory sources were present, readable in full, and integrity-identified during this assessment.

| Source | Readability | SHA-256 | Readiness role |
|---|---|---|---|
| `Docs/19_PROGRAMS/PROGRAM-037_NOVA_VISUAL_CERTIFICATION_SYSTEM/PROGRAM_037_PROGRAM_ARCHITECTURE.md` | PASS | `419C742AB1978867FB6921C493A4853820122367320425A9699FD4BDB4EF2ED2` | Program structure, 12 Lots, 13 Gates, responsibilities, risks, readiness criteria |
| `Docs/19_PROGRAMS/PROGRAM-037_NOVA_VISUAL_CERTIFICATION_SYSTEM/P37-DR-001_VISUAL_CERTIFICATION_GOVERNANCE.md` | PASS | `51EF3C07F2EAB2540662382893B05DDCB7894B8BB66C37098C692028285528B5` | Frozen authority, handoff, baselines, defects, contract ownership |
| `Docs/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md` | PASS | `6D6880946D62271EBAA6F6DD52AA6AC1CB91886BF58F7DEB7E8C4E9CB7BD5CD2` | Central Program registry; incomplete in this repository state |
| `Docs/05_RULES/ORCHESTRATION_GOVERNANCE.md` | PASS | `93CB31B5C4DD1E5F93A79935DFC94C09CB5EC83C1CE9EE6596DC343436CA6E85` | Separation of execution/validation, conflict, lock, escalation, closure |
| `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md` | PASS | `4329410AC1ECF135353978542CD56F392B2BB0CF939AB74FFCF2471DE2CA4CC2` | Upstream implementation scope and former internal Pixel Perfect authority |
| `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MASTER_EXECUTION_PLAN.md` | PASS | `9D98FA72E8FB62E4AB27C94F8EA5FBE4514DFE8658C236DAB3D29B5D52DAF8B3` | Upstream LOT 019/MO-020 scope and sequence |

Source authority interpretation:

1. `P37-DR-001` is the controlling decision for NOVA visual-certification governance.
2. PROGRAM-036 remains authoritative for implementation and technical delivery.
3. Conflicting PROGRAM-036 visual-certification wording is governed by the normative interpretation in `P37-DR-001`.
4. The incomplete central Program Register is a documented administrative inconsistency, not an authority to erase the approved PROGRAM-037 corpus.

# 3 Readiness Checklist

Thirty-two readiness controls were executed.

| ID | Control | Evidence | Result |
|---|---|---|---|
| `RC-001` | PROGRAM-037 architecture exists | Canonical architecture file read and hashed | PASS |
| `RC-002` | Architecture has the mandatory structure | 36 numbered architecture sections detected | PASS |
| `RC-003` | Lot architecture is complete | Exactly 12 detailed Lots, LOT 000 through LOT 011 | PASS |
| `RC-004` | Lots are coherent and sequential | Readiness precedes capture, reference, normalization, measurement, diff, defects, Gates, pilot, baseline, regression, program certification | PASS |
| `RC-005` | Each Lot is bounded | Objective, sources, prerequisites, scope, exclusions, deliverables, tools, entry/exit, Gates, evidence, risk, blockers, rollback, decision are defined | PASS |
| `RC-006` | Gate architecture is complete | Exactly 13 mandatory Gate definition rows | PASS |
| `RC-007` | Gates cover source and runtime integrity | Dedicated reference and runtime-capture Gates exist | PASS |
| `RC-008` | Gates cover processing integrity | Normalization, measurement, overlay/diff, and defect traceability Gates exist | PASS |
| `RC-009` | Gates cover independent review | Human, UX, accessibility, screen, baseline, and program Gates exist | PASS |
| `RC-010` | Responsibilities are separated | PROGRAM-036 implements; PROGRAM-037 certifies | PASS |
| `RC-011` | PROGRAM-036 self-certification is forbidden | Frozen by `P37-DR-001` | PASS |
| `RC-012` | PROGRAM-037 code modification is forbidden | Frozen by `P37-DR-001` | PASS |
| `RC-013` | Certification authority is defined | PROGRAM-037 Visual Certification Authority signs the independent verdict | PASS |
| `RC-014` | Validation authorities are defined | Design, Evidence, UX, and Accessibility validators have bounded mandates | PASS |
| `RC-015` | Approval authority is defined | Program Director approves screen certification and baseline freeze; Program Board governs cross-program decisions | PASS |
| `RC-016` | Cycle-opening authority is defined | Program Director or explicit delegate; unique Mission Order required | PASS |
| `RC-017` | Program Director is identified | Normative role identified; named individual/delegation not present in the consulted sources | CONDITION |
| `RC-018` | Defect lifecycle is complete | `OPEN → IMPLEMENTATION COMPLETE → VISUAL VALIDATION PENDING → CERTIFIED → BASELINE`, plus exceptional states | PASS |
| `RC-019` | Baseline lifecycle is complete | Creation, immutability, replacement, archival, invalidation are frozen | PASS |
| `RC-020` | Capture-contract owner is defined | PROGRAM-037 exclusively owns the contract; change requires Decision Record | PASS |
| `RC-021` | Native-reference policy is defined | Native image is never resized; runtime maps to common sourced area | PASS |
| `RC-022` | Tolerance governance avoids invention | No value fixed; dedicated approved Decision Record required | PASS |
| `RC-023` | Pixel Diff governance avoids unapproved tooling | No engine imposed; dedicated approved Decision Record required | PASS |
| `RC-024` | Conflict model is complete | Reference, capture, baseline, tool, and certification conflicts defined | PASS |
| `RC-025` | Mandatory sources are present and readable | Six of six sources read successfully | PASS |
| `RC-026` | Source conflict with PROGRAM-036 is controlled | `P37-DR-001` reclassifies LOT 019/MO-020 as upstream preparation | PASS |
| `RC-027` | Program Register is coherent with active corpus | Register lists only PROGRAM-001 and omits PROGRAM-036/037 | CONDITION |
| `RC-028` | Required environment capabilities are detectable | Node.js, npm, Playwright package, PowerShell, Git, and SHA-256 detected | PASS |
| `RC-029` | Official Figma Home V7 is present | Native `1920 × 995` PNG found and hashed | PASS |
| `RC-030` | Existing Home images are distinguishable | Historical V2–V6 and unrelated Home control image identified; none promoted to official runtime | PASS |
| `RC-031` | Official runtime capture is available | No official NOVA Home runtime capture identified in the repository | CONDITION |
| `RC-032` | LOT-000 stayed inside scope | No code, installation, Playwright run, capture, diff, certification, or governance-source modification | PASS |

Checklist result:

- PASS: 29;
- CONDITION: 3;
- FAIL: 0.

Explicit control answers:

| Question | Answer |
|---|---|
| Can PROGRAM-037 begin? | YES — readiness is sufficient to start LOT-001 under a distinct Mission Order |
| Are responsibilities frozen? | YES — by `P37-DR-001` |
| Is the Program Director identified? | YES as the controlling authority role; the named individual or delegation remains to be recorded before an approval requiring a signature |
| Are the Gates sufficient? | YES architecturally; operational profiles and evidence remain required before their execution |
| Are the Lots coherent? | YES — 12 bounded Lots follow the dependency chain |
| Does the Decision Record cover all responsibilities? | YES — implementation, comparison, validation, certification, approval, cycle opening, defects, contract, and baselines are allocated |
| Is there a blocking conflict with PROGRAM-036? | NO — the authority collision is resolved normatively by `P37-DR-001` |
| Are references sufficient? | YES for program readiness and LOT-001; NO for screen certification until an official runtime candidate exists |
| Is the Program Register coherent? | NO — it is readable but incomplete; separate registry regularization remains required |

# 4 Environment Assessment

Only the six authorized environment capabilities were detected. No installation and no Playwright execution occurred.

| Capability | Detected evidence | Assessment |
|---|---|---|
| Node.js | `v24.16.0`, executable at `C:\Program Files\nodejs\node.exe` | DETECTED |
| npm | `11.13.0`, executable at `C:\Program Files\nodejs\npm.cmd` | DETECTED |
| Playwright | `playwright` and `@playwright/test` declared at `^1.55.0`; installed package paths present; `test:e2e` script declared | DETECTED, NOT RUN |
| PowerShell | Windows PowerShell `5.1.26100.8737` | DETECTED |
| Git | `git version 2.54.0.windows.1` | DETECTED |
| SHA-256 | PowerShell `Get-FileHash` available and used for read-only source integrity | DETECTED |

Environment conclusion:

- the capabilities required to begin capture-contract design and readiness work are present;
- installed package presence does not prove browser-runtime availability, deterministic capture, or approved visual-comparison behavior;
- no Pixel Diff capability is inferred from Playwright;
- no environment capability is approved as an official comparison tool by this Lot.

# 5 Governance Assessment

## Architecture coherence

The architecture is internally coherent:

- 12 Lots form a complete dependency path from readiness through program certification;
- 13 Gates cover program, reference, runtime, normalization, measurement, diff, defects, human review, UX, accessibility, screen certification, baseline, and program certification;
- PROGRAM-036/037 handoffs are explicit;
- tool, threshold, human-review, defect, baseline, rollback, and evidence governance are defined;
- unequal reference/runtime dimensions are handled without arbitrary resize.

## Decision Record coherence

`P37-DR-001` has status `DECIDED` and verdict `GOVERNANCE FROZEN`. It freezes:

- PROGRAM-036 as implementation/correction/candidate producer;
- PROGRAM-037 as comparison/measurement/audit/certification/baseline authority;
- prohibition of self-certification and code modification by PROGRAM-037;
- validation, certification, approval, and cycle-opening authority chain;
- defect and baseline lifecycles;
- capture-contract ownership;
- native-reference policy;
- human-validation limits;
- tolerance and Pixel Diff approval mechanisms;
- conflict and change-control procedures.

It covers all responsibilities required for readiness. Values, tools, profiles, and named appointments intentionally remain separate operational decisions.

## PROGRAM-036 conflict assessment

PROGRAM-036 architecture and execution plan assign Pixel Perfect work to LOT 019/MO-020. This is a real documentary overlap. It is not currently blocking because the higher controlling Decision Record fixes the interpretation:

- PROGRAM-036 LOT 019/MO-020 are internal QA, preparation, and candidate-submission activities;
- PROGRAM-037 alone issues final NOVA visual certification and freezes baselines;
- PROGRAM-036 technical, UX, accessibility, and implementation Gates remain valid within their non-final-visual scope.

Operational reports must cite `P37-DR-001` to prevent the older wording from being misread.

# 6 Reference Assessment

## Official reference

| Reference | Presence | Native dimensions | SHA-256 | Status |
|---|---|---:|---|---|
| `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/NOVA-HOME-V7.png` | PRESENT | `1920 × 995` | `D6ADEA2EF7887315C6CC023280AB0307F9494BB6928091314030B53213678A08` | Official Home V7 reference |

## Existing images

Existing Home-labelled images were found:

- Home V2 and copy: `1920 × 994`;
- Home V3: `1919 × 995`;
- Home V4: `1920 × 995`;
- Home V5: `1920 × 995`;
- Home V6: `1920 × 994`;
- Home V7: `1920 × 995`;
- `INTERFACE_HOME_CONTROL_ORCHESTRATOR.png`: `1599 × 814`, a different interface.

These prove that visual source material exists. Only V7 is the official Home reference. Historical or unrelated images cannot replace an official runtime capture or missing reference region.

## Runtime capture

No official NOVA Home runtime capture was identified in the repository by the readiness inventory. This does not block PROGRAM-037 or LOT-001. It blocks Home pilot intake and any Home screen certification until a capture conforming to the future approved contract is delivered.

## Native `1920 × 995` policy

The policy is present, coherent, and frozen:

- preserve V7 at `1920 × 995`;
- never stretch it to `1920 × 1080`;
- preserve runtime independently;
- compare only a documented common sourced area after origin and scale are proven;
- label runtime-only pixels `OUTSIDE_REFERENCE` or `NO_SOURCE_DATA`;
- exclude unsourced pixels from similarity denominators and certification claims;
- require another official reference when an unsourced region must itself be certified.

The 85-pixel height difference is not, by itself, a blocking risk.

# 7 Risk Assessment

Only risks evidenced by the sources or repository assessment are recorded.

| Risk | Evidence | Current impact | Classification | Control / owner |
|---|---|---|---|---|
| `R-P37-000-01` Central Program Register is incomplete | It contains only PROGRAM-001 | Discoverability and portfolio traceability | NON-BLOCKING for LOT-001; must be regularized | Separate registry-authorized mission / Program Board |
| `R-P37-000-02` Named Program Director/delegates are not recorded in consulted sources | Roles are defined, personal appointments absent | A final approval cannot be signed until appointment evidence exists | NON-BLOCKING for LOT-001; BLOCKING for affected certification approval | Program Director / Program Board appointment record |
| `R-P37-000-03` No official NOVA Home runtime capture is available | Repository inventory found none | Home pilot and screen certification cannot start | NON-BLOCKING for LOT-001; BLOCKING for LOT-008/Home | PROGRAM-036 candidate delivery under approved contract |
| `R-P37-000-04` Capture profiles are not yet operationally fixed | Architecture and DR define mechanism, not exact profiles | Runtime integrity cannot yet be decided | EXPECTED LOT-001 work, not a start blocker | LOT-001 and later approval Decision Record |
| `R-P37-000-05` Numeric tolerances are intentionally unapproved | Required by architecture and DR | Final metric verdicts cannot use numeric tolerance | NON-BLOCKING for LOT-001; BLOCKING for dependent certification | Dedicated Program Board-approved Decision Record |
| `R-P37-000-06` No official Pixel Diff engine is approved | Frozen as open decision | Authoritative Pixel Diff cannot run | NON-BLOCKING for LOT-001; BLOCKING for LOT-005/final Diff-dependent certification | Dedicated tool Decision Record |
| `R-P37-000-07` PROGRAM-036 documents retain older final-certification wording | LOT 019/MO-020 call their activity Pixel Perfect certification | Operational misinterpretation risk | NON-BLOCKING because `P37-DR-001` controls | Cite DR in every handoff and Mission Order |
| `R-P37-000-08` Historical Home images coexist with V7 | V2–V6 files are present | Wrong primary source could be selected | NON-BLOCKING; source policy forbids substitution | Reference Integrity Gate / Design Authority |
| `R-P37-000-09` Package presence does not prove reproducible browser capture | Playwright package detected but not launched | Environment could later fail capture contract | NON-BLOCKING for LOT-001; assessed before runtime Gate | LOT-001 contract and authorized later environment validation |

No risk was invented from an unobserved failure. No current risk prevents capture-contract governance from beginning.

# 8 Blocking Conditions

## Current LOT-000 exit blockers

None.

The following blocking criteria from the architecture are satisfied:

- PROGRAM-037 identifier and architecture exist;
- the governance authority and PROGRAM-036/037 boundary are unambiguous under `P37-DR-001`;
- all mandatory sources are readable;
- the Program Director authority role is defined;
- no unresolved conflict prevents readiness or LOT-001 contract work;
- all required environment capabilities for readiness were detected.

## Downstream blocking conditions

These conditions do not block LOT-001, but will block their dependent operations:

- no screen approval without recorded named authority/delegation;
- no runtime integrity PASS without an approved capture profile and compliant official candidate;
- no tolerance-based verdict without approved tolerance Decision Record;
- no authoritative Pixel Diff without approved tool Decision Record;
- no Home pilot without official runtime capture;
- no baseline without full independent screen certification and freeze approval.

# 9 Non Blocking Conditions

The following conditions are accepted at LOT-000 exit:

1. Regularize the central Program Register through a separate authorized mission.
2. Record named Program Director and delegated authorities before the first approval requiring their signature.
3. Produce the exact capture profiles in LOT-001 without installing or selecting an unapproved tool.
4. Deliver the official Home runtime candidate only after the capture contract is approved.
5. Approve tolerance profiles through dedicated Decision Records before dependent final verdicts.
6. Approve the Pixel Diff engine through a dedicated Decision Record before LOT-005 authoritative execution.
7. Keep historical Home images classified as non-official for Home V7 certification.
8. Cite `P37-DR-001` in PROGRAM-036/037 handoffs to prevent self-certification ambiguity.

Each condition has a defined future owner or governance mechanism. None authorizes bypass of a Gate.

# 10 Entry Gate Validation

The architecture defines no named formal Gate before LOT-000; entry requires Program Board authorization. `P37-DR-001`, Section 19, explicitly authorizes `P37-LOT-000 — Program Readiness` under a distinct Mission Order. The present Mission Order supplies that execution authority.

| Entry control | Result |
|---|---|
| Approved PROGRAM-037 architecture exists | PASS |
| Frozen governance Decision Record exists | PASS |
| LOT-000 is explicitly authorized | PASS |
| Mission Order is unique and scoped to LOT-000 | PASS |
| Sources, scope, deliverable, prohibitions, and verdicts are defined | PASS |
| No conflicting execution or extra deliverable is required | PASS |

**Entry Gate decision: PASS — LOT-000 AUTHORIZED AND EXECUTED.**

# 11 Exit Gate Validation

Exit Gate: `GATE-P37-PROGRAM-READINESS`.

| Gate requirement | Evidence | Result |
|---|---|---|
| Program identity is unambiguous | Architecture and frozen DR identify PROGRAM-037 | PASS |
| Scope and responsibilities are unambiguous | PROGRAM-036 implements; PROGRAM-037 certifies | PASS |
| Mandatory sources are inventoried and readable | Six of six read and hashed | PASS |
| Lots and Gates are coherent | 12 Lots and 13 sufficient architectural Gates | PASS |
| Authorities are defined | Certification, validation, approval, and cycle-opening roles fixed | PASS |
| Tools are inventoried without installation | Six authorized capabilities detected; Playwright not run | PASS |
| References are inventoried | Official V7 present; historical images classified; runtime absence explicit | PASS |
| Conflicts are explicit and controlled | PROGRAM-036 authority overlap resolved; register inconsistency retained | PASS |
| Open decisions have owners and blocking scope | Profiles, tolerances, tool, appointments, register, and runtime are assigned to future governance | PASS |
| No hidden readiness blocker remains | Downstream conditions do not prevent LOT-001 | PASS |

**Exit Gate decision: `GATE-P37-PROGRAM-READINESS — PASS WITH DOCUMENTED NON-BLOCKING CONDITIONS`.**

This PASS authorizes LOT-001 only through a new, explicit Mission Order. It does not authorize tool installation, capture, comparison, Home pilot, or screen certification.

# 12 Final Readiness Verdict

**Decision: READY WITH CONDITIONS**

PROGRAM-037 can begin. Its architecture is coherent, responsibilities are frozen, the Program Director authority role is identified, the 13 Gates are sufficient, the 12 Lots are coherent, and the Decision Record covers implementation separation, validation, certification, approval, cycles, defects, contract, references, baselines, tolerances, tools, and conflicts.

There is no blocking conflict with PROGRAM-036 because `P37-DR-001` is the controlling normative decision. The official Home V7 reference is sufficient for program preparation and future common-area comparison, but the missing official runtime capture prevents screen certification, not LOT-001. The central Program Register is incomplete and must be regularized separately, but it does not invalidate the approved PROGRAM-037 architecture and Decision Record.

Final authorization:

- `LOT-001 — Capture Contract`: **AUTHORIZED**, subject to a distinct Mission Order;
- screen certification: **NOT AUTHORIZED**;
- capture execution: **NOT AUTHORIZED**;
- Pixel Diff execution: **NOT AUTHORIZED**;
- tool installation: **NOT AUTHORIZED**.

No code, frontend modification, capture, Pixel Diff, tool installation, or screen certification was performed.

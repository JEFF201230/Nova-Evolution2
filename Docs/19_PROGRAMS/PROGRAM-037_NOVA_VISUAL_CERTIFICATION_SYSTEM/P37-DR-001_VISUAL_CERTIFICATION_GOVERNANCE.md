# P37-DR-001 — VISUAL CERTIFICATION GOVERNANCE

## 1. Decision Record Control

| Field | Value |
|---|---|
| Decision ID | `P37-DR-001` |
| Mission ID | `P37-DR-001-VISUAL-CERTIFICATION-GOVERNANCE` |
| Program | `PROGRAM-037 — NOVA Visual Certification System` |
| Decision title | Visual Certification Governance |
| Decision type | Normative governance decision |
| Status | `DECIDED` |
| Governance verdict | `GOVERNANCE FROZEN` |
| Effective date | 2026-07-13 |
| Issuing authority | Program Director |
| Approval authority | Program Director / Program Board |
| Scope | All NOVA visual certification cycles, screens, references, candidates, defects, evidence, and baselines |
| Supersession mode | Only by a later approved Decision Record explicitly naming `P37-DR-001` |
| Deliverable mode | Documentation only; no code, tool, capture, or implementation |

This Decision Record is the normative governance reference for every NOVA visual certification. It is effective immediately for governance and authorizes preparation of `P37-LOT-000`. It does not execute that Lot, open a screen cycle, or certify a screen.

## 2. Sources and Authority

The following sources were read for this decision:

- `Docs/19_PROGRAMS/PROGRAM-037_NOVA_VISUAL_CERTIFICATION_SYSTEM/PROGRAM_037_PROGRAM_ARCHITECTURE.md`;
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md`;
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MASTER_EXECUTION_PLAN.md`;
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MISSION_ORCHESTRATOR.md`;
- `Docs/05_RULES/ORCHESTRATION_GOVERNANCE.md`;
- `Docs/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md`.

Authority rules:

1. A formally approved Decision Record has precedence over conflicting operational wording in a Program architecture, execution plan, orchestrator, Mission Order, report, or implementation statement.
2. This record does not alter source documents. It controls how their visual-certification provisions are interpreted from its effective date.
3. The separation between execution and final validation required by `ORG-VAL-002` is mandatory.
4. A lower-authority document cannot restore self-certification, modify a frozen baseline, introduce a tolerance, or select a Pixel Diff engine.
5. Any conflict with this record freezes the affected certification action and follows Section 14.

## 3. Decision Summary

The following decisions are frozen:

| Decision | Frozen rule |
|---|---|
| `DEC-P37-001` | PROGRAM-036 implements; PROGRAM-037 independently certifies |
| `DEC-P37-002` | PROGRAM-036 can never issue final visual certification |
| `DEC-P37-003` | PROGRAM-037 can never modify frontend code or implementation assets |
| `DEC-P37-004` | Certification, validation, approval, and cycle-opening authorities are distinct and explicit |
| `DEC-P37-005` | Baselines are immutable, versioned certification packages governed by PROGRAM-037 |
| `DEC-P37-006` | PROGRAM-037 owns the capture contract; every change requires a Decision Record |
| `DEC-P37-007` | A native official reference is preserved at native dimensions and never stretched |
| `DEC-P37-008` | Human validation is bounded, independent, justified, and unable to replace missing evidence |
| `DEC-P37-009` | Visual defects follow the lifecycle fixed in Section 11 |
| `DEC-P37-010` | No tolerance value exists until approved by a dedicated Decision Record |
| `DEC-P37-011` | No Pixel Diff engine is mandatory or authoritative until approved by a dedicated Decision Record |
| `DEC-P37-012` | Conflicts freeze only the affected action and require named authority resolution |
| `DEC-P37-013` | No certification cycle or subsequent scope opens automatically |
| `DEC-P37-014` | Evidence and prior failed/rejected cycles are preserved; no result is overwritten silently |

## 4. Separation of PROGRAM-036 and PROGRAM-037

### 4.1 PROGRAM-036 mandate

PROGRAM-036 exclusively owns:

- frontend development;
- implementation;
- code and visual corrections;
- technical integration;
- technical tests and their evidence;
- preparation of stable screen states and controlled data;
- production or delivery of candidate runtime captures under the current PROGRAM-037 capture contract;
- response to visual defects assigned to implementation;
- declaration that implementation work is complete.

PROGRAM-036 may state:

- `IMPLEMENTATION COMPLETE` for a defined correction scope;
- technical tests `PASS` or `FAIL`;
- candidate capture `SUBMITTED`;
- defect correction `READY FOR VISUAL VALIDATION`.

PROGRAM-036 must never state or imply final visual `CERTIFIED`, `BASELINE`, or `BASELINE_FROZEN` on its own authority.

### 4.2 PROGRAM-037 mandate

PROGRAM-037 exclusively owns:

- official reference intake and integrity status;
- capture-contract governance;
- candidate capture acceptance or rejection;
- normalization governance;
- visual comparison and audit;
- structural, geometric, typographic, colorimetric, overlay, and difference measurements;
- visual evidence integrity;
- visual Defect Register governance;
- independent visual verdicts;
- baseline creation, freeze, replacement, archival, and invalidation;
- later visual-regression cycles.

PROGRAM-037 must never:

- modify CSS, JSX, TS, TSX, HTML, images, assets, tokens, dependencies, routes, data, tests, or implementation components;
- correct a defect;
- generate missing reference content;
- change a runtime candidate after intake;
- ask its certifier to act as the PROGRAM-036 implementer for the same scope.

### 4.3 Normative boundary

The handoff is one-way per cycle:

`PROGRAM-036 candidate → PROGRAM-037 evidence and verdict → PROGRAM-036 correction when required → new PROGRAM-036 candidate`.

PROGRAM-037 never sends corrected code back. PROGRAM-036 never sends a self-issued visual certificate forward.

## 5. Impact on Existing PROGRAM-036 Governance

This record resolves the authority overlap identified between PROGRAM-036 and PROGRAM-037.

From the effective date:

1. PROGRAM-036 `LOT 019 — Pixel-Perfect Certification` remains an upstream preparation, internal QA, capture, discrepancy-identification, and candidate-submission activity.
2. PROGRAM-036 `MO-020` may produce comparison preparation and evidence, but its result is not the final NOVA visual certificate.
3. `GATE-PIXEL-PERFECT-CERTIFIED` inside PROGRAM-036 is interpreted as `READY FOR INDEPENDENT VISUAL CERTIFICATION` unless PROGRAM-037 has issued the referenced final certificate.
4. Any PROGRAM-036 `GATE-SCREEN-CERTIFIED` remains valid for its documented technical, functional, UX, accessibility, or implementation scope, but not as independent final visual certification.
5. LOT 004A `MC-010 — Final Visual Overlay and Certification` may prepare overlay evidence and submit a candidate. Its final visual verdict belongs to PROGRAM-037.
6. A PROGRAM-036 release dependency requiring Pixel Perfect PASS is satisfied only by a valid PROGRAM-037 certification reference, not by a PROGRAM-036 assertion.
7. Existing PROGRAM-036 implementation and technical evidence remain usable; this decision does not invalidate code, tests, or completed corrections.

No source file is rewritten by this decision. Conflicting language is subordinated to this normative interpretation.

## 6. Certification Authority Model

### 6.1 Roles

| Role | Exclusive responsibility |
|---|---|
| Program Director | Issues governance authority, approves final screen certification and baseline freeze, authorizes new cycles or delegates that authority explicitly |
| Program Board | Resolves cross-program conflicts, approves governance exceptions, tool/tolerance Decision Records, and program-level certification |
| PROGRAM-037 Visual Certification Authority | Examines complete evidence, applies Gates, signs the independent visual certification recommendation and verdict |
| Design Authority | Validates official reference identity, intended state, visual interpretation, regions, and any permitted design exception |
| Evidence Validator | Validates provenance, capture integrity, transformations, measurements, hashes, traceability, and reproducibility |
| UX Authority | Validates UX non-regression where applicable |
| Accessibility Authority | Validates accessibility non-regression where applicable |
| PROGRAM-037 Orchestrator | Enforces sequence, locks, states, Mission Orders, evidence linkage, and authorized transitions; it does not certify |
| PROGRAM-036 Delivery Owner | Produces implementation and candidate evidence; it does not validate or certify that same visual scope |

An individual may hold more than one role only when no executor/validator conflict exists. The PROGRAM-036 implementer for a scope cannot be its Visual Certification Authority, Evidence Validator, or final approver.

### 6.2 Who certifies

The `PROGRAM-037 Visual Certification Authority` certifies visual conformity after every applicable Gate has passed and after all required validators have signed their domain decisions.

It may issue only:

- `CERTIFICATION RECOMMENDED`;
- `CERTIFICATION WITH CONDITIONS RECOMMENDED`, when conditions are formally permitted;
- `CERTIFICATION REJECTED`.

The authoritative state `CERTIFIED` is recorded only after the approval described in Section 6.4.

### 6.3 Who validates

- The Design Authority validates the official reference and visual interpretation.
- The Evidence Validator validates capture, normalization, measurement, overlay/diff, masks, hashes, and reproducibility.
- The UX Authority validates UX non-regression.
- The Accessibility Authority validates accessibility non-regression.
- Each validator decides only within its mandate and records `PASS`, `FAIL`, or `REQUEST NEW EVIDENCE`.
- Validation cannot be delegated silently to the implementer or inferred from missing objections.

### 6.4 Who approves

The Program Director approves a screen certification and its baseline freeze. A Program Board delegate may approve only when the delegation is explicit, current, scoped to the screen/cycle, and recorded in evidence.

The Program Board approves:

- tolerance-governance Decision Records;
- official Pixel Diff tool Decision Records;
- exceptions to this governance;
- conflicts between PROGRAM-036 and PROGRAM-037;
- PROGRAM-037 program-level certification.

No approval by silence, elapsed time, tool output, automated score, implementer, or orchestrator is valid.

### 6.5 Who opens a new cycle

Only the Program Director, or an explicitly delegated Program Board authority, may authorize a new visual-certification or regression cycle.

Opening requires:

- a unique Mission Order;
- screen and state scope;
- reason for opening;
- applicable reference and baseline identity;
- candidate-delivery authority;
- capture-contract version;
- expected Gates and evidence;
- lock and closure conditions.

The PROGRAM-037 Orchestrator records and sequences the cycle after authorization. A new commit, candidate image, defect correction, failed Gate, expired condition, or changed reference does not open a cycle automatically.

## 7. Certification Decision Chain

The mandatory chain is:

1. PROGRAM-036 produces a candidate and declares the implementation scope complete.
2. PROGRAM-037 accepts or rejects the reference and candidate as inputs.
3. Evidence Validator validates capture and evidence integrity.
4. PROGRAM-037 performs or receives authorized measurements and comparison evidence.
5. Domain validators issue their required decisions.
6. Visual Certification Authority signs the recommendation or rejection.
7. Program Director approves or refuses the certification.
8. PROGRAM-037 Orchestrator records the state and preserves the evidence.
9. If approved and eligible, the baseline follows the separate freeze decision in Section 8.

Every step requires explicit evidence. A downstream signature cannot cure a missing upstream validation.

## 8. Baseline Governance

### 8.1 Definition

A NOVA visual baseline is the complete, approved, immutable certification package for one defined screen, state, reference version, capture profile, data profile, and environment profile. A PNG alone is not a baseline.

### 8.2 Creation

A baseline may be created only when:

- the screen state is `CERTIFIED`;
- the final certification report is approved;
- reference, runtime, normalized views, measurements, permitted overlay/diff evidence, Defect Register, manifest, and hashes are complete;
- applicable tolerance, mask, capture, and tool decisions are identified;
- no blocking defect or expired condition remains;
- Program Director approves the freeze;
- PROGRAM-037 records `BASELINE` and the architecture-level state `BASELINE_FROZEN`.

PROGRAM-037 is the only Program authorized to materialize and register the baseline package.

### 8.3 Modification

Modification in place is forbidden.

No actor may edit, replace bytes, change metadata, change hashes, add an exception, alter a mask, or reinterpret an existing frozen baseline under the same version.

Correction of a clerical or integrity error requires invalidation and a new versioned baseline cycle. The original record remains preserved.

### 8.4 Replacement

A baseline is replaced only by a new certified and frozen version after a complete authorized cycle. Replacement requires:

- a reason and change authority;
- predecessor and successor identifiers;
- impact assessment for open defects and regression profiles;
- full certification and freeze Gates;
- activation date;
- archival of the predecessor.

The predecessor remains active until the successor is approved. Two active baselines for the same screen/state/profile are forbidden.

### 8.5 Archival

Archival preserves:

- original bytes and hashes;
- manifest and certification report;
- authority decisions;
- predecessor/successor links;
- conditions, invalidation reason, and effective dates;
- accessibility and recovery of evidence.

Archived means inactive, not deleted or editable.

### 8.6 Invalidation

Invalidation is mandatory when the baseline’s integrity, source authority, applicability, or governing profile is no longer valid. Triggers include:

- hash mismatch or missing evidence;
- official reference withdrawal or supersession;
- capture-contract, browser/environment, font, data, locale, theme, or viewport change outside declared applicability;
- tolerance, mask, normalization, measurement, or official tool decision that requires reevaluation;
- material screen or component change;
- discovered certification conflict or invalid authority;
- expired certification condition.

Only the Program Director or Program Board may approve invalidation. PROGRAM-037 records the reason, scope, evidence, effective time, downstream impact, and required new cycle. Invalidation never deletes the baseline.

## 9. Capture Contract Ownership

PROGRAM-037 is the exclusive owner of the NOVA visual capture contract.

PROGRAM-036 must produce candidates that conform to the active contract. PROGRAM-036 may report a capture constraint or propose a change, but cannot change the contract.

Every contract version defines, at minimum, the governed parameters identified by the PROGRAM-037 architecture: screen/route, query parameters, viewport, output dimensions, DPR, zoom, browser/engine, operating system, fonts, navigation state, application/data state, locale, time, motion, cursor, scroll/scrollbar, capture extent, lossless PNG encoding, color interpretation, stabilization, metadata, and operator traceability.

Any addition, removal, relaxation, default change, profile change, or reinterpretation of a comparison-critical parameter requires a dedicated approved Decision Record that states:

- prior and proposed rule;
- reason and evidence;
- affected screens, baselines, cycles, and defects;
- compatibility and invalidation impact;
- validators and approval authority;
- effective version and date;
- rollback rule.

A Mission Order, implementation choice, tool default, or capture convenience cannot amend the contract.

## 10. Official Figma Reference Governance

### 10.1 Native preservation

An official Figma reference is preserved byte-for-byte and at native dimensions. It is never stretched, warped, interpolated, regenerated, or silently cropped to match runtime.

If an official reference is `1920 × 995`, it remains `1920 × 995`.

### 10.2 Runtime adaptation to a common area

When runtime dimensions differ:

1. preserve both originals;
2. prove coordinate systems, scale, origins, and common anchors;
3. define the traceable common comparison area from pixels present in both sources;
4. adapt only the runtime working view or comparison canvas to that common area without changing the reference pixels;
5. label every runtime-only area `OUTSIDE_REFERENCE` or `NO_SOURCE_DATA` as applicable;
6. exclude unsourced areas from similarity denominators and conformance claims;
7. record all rectangles, offsets, anchors, and transformations;
8. require an additional official reference for any product area that must be certified but is not present in the source.

Different native height alone is not a failure. Untraceable alignment, arbitrary resizing, or a required region without official source is a failure.

### 10.3 Reference change

Only the Design Authority can designate, supersede, or withdraw an official visual reference. PROGRAM-037 validates intake and impact. A new reference does not silently replace an active baseline; it triggers an authorized impact assessment and, where required, a new certification cycle.

## 11. Defect Register Governance

### 11.1 Canonical lifecycle

The visual defect lifecycle is:

`OPEN → IMPLEMENTATION COMPLETE → VISUAL VALIDATION PENDING → CERTIFIED → BASELINE`

Meanings:

| State | Meaning | State authority |
|---|---|---|
| `OPEN` | Measured or confirmed visual defect requires action or disposition | PROGRAM-037 opens; PROGRAM-036 accepts implementation ownership |
| `IMPLEMENTATION COMPLETE` | PROGRAM-036 reports correction complete; no external visual conclusion yet | PROGRAM-036 declares for its implementation scope |
| `VISUAL VALIDATION PENDING` | PROGRAM-037 has accepted a new candidate for external validation | PROGRAM-037 Orchestrator |
| `CERTIFIED` | Independent evidence, Gates, certification signature, and approval prove the validation criterion | PROGRAM-037 after authorized approval |
| `BASELINE` | The certified result is included in an approved frozen baseline package | PROGRAM-037 after baseline freeze approval |

`IMPLEMENTATION COMPLETE` and `VISUAL VALIDATION PENDING` are non-terminal and never mean blocked or certified.

### 11.2 Additional states

| State | Meaning | Permitted transition |
|---|---|---|
| `REOPENED` | A previously certified/baselined defect is again applicable because evidence, candidate, source, baseline, profile, or region changed or regression occurred | `CERTIFIED` or `BASELINE` → `REOPENED` → `OPEN` |
| `REJECTED` | The submitted correction or candidate fails the defect validation criterion or an applicable Gate | `VISUAL VALIDATION PENDING` → `REJECTED` → `OPEN` |
| `DUPLICATE` | The observation is fully represented by another canonical defect ID | `OPEN` → `DUPLICATE`; link to canonical ID mandatory |
| `OBSOLETE` | The defect is no longer applicable because its governed screen/state/reference was formally retired, not because it was corrected | Any non-baselined active state → `OBSOLETE` after authority decision |

`DUPLICATE` and `OBSOLETE` do not prove correction and cannot be counted as certified defects.

### 11.3 Transition controls

- Every transition records actor, authority, date, candidate/reference/baseline IDs, evidence, reason, and prior state.
- PROGRAM-036 cannot move a defect to `CERTIFIED` or `BASELINE`.
- PROGRAM-037 cannot move a defect to `IMPLEMENTATION COMPLETE` on behalf of PROGRAM-036.
- A correction statement without a new candidate remains `IMPLEMENTATION COMPLETE`.
- A rejected candidate preserves all evidence and returns through `OPEN`; it is never overwritten.
- `REOPENED` preserves the prior certificate and baseline relationship while marking them no longer sufficient for the new scope.
- Duplicate and obsolete decisions require independent register review.
- One discrepancy has one canonical defect ID. Cross-program references link to it rather than cloning its state.

The Defect Register is evidence, not a code backlog. Implementation planning remains in PROGRAM-036.

## 12. Human Validation Governance

### 12.1 Authorized

Human validation is authorized only when:

- automated evidence exists and its limitation is explicit;
- the question concerns a bounded region and named criterion;
- the reviewer has the required independent authority;
- the review environment and artefact hashes are recorded;
- the outcome is `PASS`, `FAIL`, or `REQUEST NEW EVIDENCE` with justification;
- the decision does not contradict a higher-authority source or Gate.

Typical authorized cases include semantic visual equivalence, controlled antialiasing ambiguity, font-rendering ambiguity, shadow perception, minimal mask legitimacy, and interpretation of an official visual state.

### 12.2 Mandatory

Human validation is mandatory when:

- approved automation cannot reliably distinguish defect from renderer noise;
- a mask, exclusion, exception, or conditional certification is proposed;
- reference intent or common-anchor interpretation is disputed;
- global and component results conflict;
- a visual decision may affect UX or accessibility;
- evidence supports more than one defensible interpretation;
- the applicable Gate explicitly requires Design, UX, Accessibility, Evidence, or Program approval.

### 12.3 Forbidden

Human validation is forbidden as a means to:

- replace a missing official reference or runtime capture;
- approve arbitrary resizing, hidden cropping, pixel generation, or untraceable transformation;
- invent or apply an unapproved tolerance;
- select an unapproved Pixel Diff engine;
- waive a failed integrity, UX, accessibility, or blocking certification Gate;
- convert aesthetic preference into a normative rule without a Decision Record;
- let the PROGRAM-036 implementer validate or approve its own visual correction;
- declare an unsourced runtime area conformant;
- approve by silence or undocumented conversation.

## 13. Tolerance and Pixel Diff Governance

### 13.1 Tolerances

This record fixes no numeric tolerance.

A tolerance becomes official only through a dedicated approved Decision Record containing:

- unique decision and profile IDs;
- category: geometric, typographic, colorimetric, shadow, global pixel difference, component/region, dynamic exclusion, or instrumentation;
- source and empirical evidence;
- metric definition, units, rounding, aggregation, and boundary behavior;
- applicable screens, states, components, environments, and versions;
- prohibited use and critical-region overrides;
- validators: Design Authority, Evidence Validator, and any affected UX/Accessibility Authority;
- approval by Program Board;
- effective version/date, expiry or review date;
- impact assessment for existing defects, certificates, and baselines;
- rollback and invalidation rules.

Until approved, the category is `UNAPPROVED`. Measurement may report raw values, but the unresolved category cannot support final certification or rejection based on an invented threshold.

Tolerance approval is not retroactive unless the Decision Record explicitly orders an evidence-backed reevaluation. A profile change never silently changes an existing verdict.

### 13.2 Pixel Diff

No Pixel Diff engine, library, service, algorithm, or default is imposed by this Decision Record.

A Pixel Diff tool becomes official only through a dedicated approved Decision Record containing:

- tool/engine identity and exact versioning policy;
- repository, licensing, security, privacy, and offline constraints;
- deterministic PNG, color, alpha, antialiasing, mask, and regional-metric behavior;
- reproducibility evidence across the approved environment;
- parameter and output schema;
- false-positive/false-negative evaluation;
- baseline and backward-compatibility impact;
- validator approvals, Program Board approval, effective date, and rollback.

Until that decision:

- no tool output is authoritative Pixel Diff evidence;
- no dependency may be installed for certification purposes;
- manual or existing image inspection may inform readiness but cannot impersonate an approved engine;
- reference intake, capture governance, normalization design, raw geometry, and other non-Diff readiness work may continue when independently valid;
- final certification requiring Pixel Diff remains pending.

## 14. Conflict Governance

### 14.1 Common rule

Every conflict records:

- conflict ID and type;
- affected screen, cycle, defect, reference, capture, baseline, tool, or certificate;
- conflicting artefacts and hashes;
- factual discrepancy;
- affected action and frozen state;
- evidence and severity;
- responsible resolution authority;
- decision required;
- resolution, effective date, and reopening rule.

The affected action is frozen. Unaffected read-only analysis may continue only when it cannot bias or bypass resolution.

### 14.2 Reference conflict

A reference conflict exists when authority, version, screen/state, dimensions, crop, provenance, or intended visual interpretation is inconsistent.

- Action: freeze intake, normalization, and certification for the affected scope.
- Authority: Design Authority validates; Program Director resolves competing official design authorities.
- Resolution: designate one official reference/version or request a new source; preserve rejected candidates as evidence.
- Forbidden: averaging, selecting the visually convenient source, or using an historical image to fill missing pixels.

### 14.3 Capture conflict

A capture conflict exists when candidate metadata, viewport, DPR, zoom, browser, fonts, state, data, time, extent, color, or hash conflicts with the active capture contract.

- Action: reject the capture for comparison and retain it as non-conforming evidence.
- Authority: Evidence Validator decides conformance; Program Director arbitrates authority disputes.
- Resolution: recapture under the active contract or approve a contract change through a separate Decision Record.
- Forbidden: editing metadata, cropping to hide divergence, or waiving the contract locally.

### 14.4 Baseline conflict

A baseline conflict exists when two baselines claim active authority for the same profile, hashes differ, applicability overlaps ambiguously, or replacement/invalidation status diverges.

- Action: freeze regression verdict and baseline activation for the affected scope.
- Authority: PROGRAM-037 investigates; Program Director or Program Board selects or invalidates the active baseline.
- Resolution: establish one active baseline, archive or invalidate others, and preserve the full chain.
- Forbidden: choosing the newest file by timestamp or overwriting a manifest.

### 14.5 Tool conflict

A tool conflict exists when approved versions, parameters, algorithms, environments, or outputs disagree, or when an unapproved tool is presented as authoritative.

- Action: freeze the affected automated metric and any verdict depending on it.
- Authority: Evidence Validator validates facts; Technical Authority assesses reproducibility; Program Board approves the official tool decision.
- Resolution: apply the active tool Decision Record, repeat evidence, or issue a superseding Decision Record.
- Forbidden: selecting the most favorable score.

### 14.6 Certification conflict

A certification conflict exists when verdicts, Gate results, authorities, conditions, scopes, defects, or baseline status disagree.

- Action: freeze approval, release dependency, and baseline freeze for the affected scope.
- Authority: Program Director resolves screen-level conflicts; Program Board resolves cross-program, authority, or governance conflicts.
- Resolution: audit the evidence chain, invalidate unsupported verdicts, and issue one explicit controlling decision.
- Forbidden: treating PROGRAM-036 self-certification, tool output, or a majority of informal opinions as final authority.

## 15. Resolved Conflicts

| Conflict | Resolution fixed by this record |
|---|---|
| PROGRAM-036 vs PROGRAM-037 visual authority | PROGRAM-036 prepares and corrects; PROGRAM-037 independently certifies |
| PROGRAM-036 LOT 019 / MO-020 finality | Reclassified as upstream internal QA and candidate-submission evidence; not final visual authority |
| LOT 004A MC-010 finality | May prepare evidence; final visual verdict belongs to PROGRAM-037 |
| Native `1920 × 995` reference vs `1920 × 1080` runtime | Preserve native reference; compare only a documented common area; no arbitrary resize |
| `IMPLEMENTATION COMPLETE` interpreted as blocked or certified | It is a non-terminal implementation handoff awaiting external validation |
| Baseline as image vs certification package | Baseline is an immutable, approved, hashed package, never a standalone screenshot |
| Automatic next cycle after failure/change | Forbidden; a new cycle requires explicit Mission Order authorization |
| Human judgment as waiver | Forbidden; human validation is bounded by evidence, authority, and Gates |

## 16. Open Decisions

The following remain deliberately open and are not solved by assumption:

| Open decision | Required instrument | Blocking scope |
|---|---|---|
| Numeric geometric tolerances | Dedicated tolerance Decision Record | Geometric final verdict |
| Numeric typographic tolerances | Dedicated tolerance Decision Record | Typographic final verdict |
| Numeric colorimetric tolerances | Dedicated tolerance Decision Record | Color final verdict |
| Numeric shadow tolerances | Dedicated tolerance Decision Record | Shadow final verdict |
| Global and component Pixel Diff tolerances | Dedicated tolerance Decision Record | Pixel Diff final verdict |
| Dynamic exclusions and mask limits | Dedicated tolerance/mask Decision Record | Masked comparison |
| Official Pixel Diff engine | Dedicated tool Decision Record | Authoritative Pixel Diff |
| Exact canonical capture profiles | LOT 001 output plus Decision Record approval | Runtime capture certification |
| Named individuals/delegations for authority roles | Program Director appointment record | Affected validation/approval |
| Defect Register import/update mechanics between programs | LOT 006 governance decision | Register mutation and synchronization |
| Central `PROGRAM_REGISTER.md` regularization | Separate registry-authorized mission | Portfolio discoverability; not LOT 000 preparation |

Open decisions do not weaken frozen governance. They prevent the affected operation until decided.

## 17. Prohibitions

It is prohibited to:

- let PROGRAM-036 self-certify visually;
- let PROGRAM-037 modify implementation;
- certify without independent validation and approval;
- open a cycle without a Mission Order;
- modify or overwrite a baseline;
- stretch or regenerate a native reference;
- certify outside the documented common sourced area;
- alter the capture contract without a Decision Record;
- invent a tolerance;
- impose or install a Pixel Diff engine without approval;
- use human review to bypass missing or failed evidence;
- hide, delete, or overwrite a failed, rejected, reopened, duplicate, obsolete, or invalidated record;
- continue an affected certification action through an unresolved conflict;
- treat a dashboard, automated score, implementation status, or silence as certification authority.

## 18. Change Control

This governance is frozen.

Any change requires a new Decision Record that:

1. identifies `P37-DR-001` and the exact clause affected;
2. states the current and proposed rule;
3. gives reason, evidence, scope, risks, and authority;
4. assesses all active cycles, defects, certificates, and baselines;
5. defines migration, invalidation, rollback, and effective date;
6. receives required domain validation and Program Board approval;
7. preserves this record and the complete decision chain.

Mission Orders and operational reports apply this governance; they cannot amend it.

## 19. LOT-000 Authorization

Decision: `P37-LOT-000 — Program Readiness` is authorized for preparation and execution under a distinct Mission Order.

Authorization means:

- PROGRAM-037 identity and governance are sufficient to start readiness assessment;
- LOT 000 may inventory sources, authorities, tools, conflicts, references, runtime candidates, and open decisions;
- LOT 000 may issue `READY` or `BLOCKED` according to evidence.

Authorization does not mean:

- an automatic Lot start;
- authorization to install a tool, take a capture, run Home pilot, set thresholds, modify code, or certify a screen;
- automatic authorization of LOT 001 or later Lots.

## 20. Final Decision

**Verdict: GOVERNANCE FROZEN**

The governance separation, authority chain, baseline lifecycle, capture-contract ownership, native-reference policy, human-validation limits, Defect Register lifecycle, tolerance mechanism, Pixel Diff approval mechanism, and conflict procedures are decided and normative.

PROGRAM-036 remains the implementation and correction program. PROGRAM-037 becomes the sole independent NOVA visual-certification and baseline authority. Open numeric, tool, profile, assignment, and registry decisions remain explicit and block only their dependent operations.

No screen is certified by this record. No code, tool, capture, baseline, or implementation artefact is produced.

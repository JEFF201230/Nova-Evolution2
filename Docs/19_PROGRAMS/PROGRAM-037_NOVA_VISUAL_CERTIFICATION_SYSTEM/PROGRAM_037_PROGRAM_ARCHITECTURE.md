# PROGRAM-037 — NOVA VISUAL CERTIFICATION SYSTEM

# 1. Document Control

| Field | Value |
|---|---|
| Program ID | `PROGRAM-037` |
| Program name | NOVA Visual Certification System |
| Mission ID | `P37-ARCH-001-NOVA-VISUAL-CERTIFICATION-SYSTEM` |
| Document | `PROGRAM_037_PROGRAM_ARCHITECTURE.md` |
| Canonical folder | `Docs/19_PROGRAMS/PROGRAM-037_NOVA_VISUAL_CERTIFICATION_SYSTEM/` |
| Document type | Program architecture / visual QA governance |
| Status | `READY WITH CONDITIONS` |
| Creation date | 2026-07-13 |
| Creation mode | Documentation only; no code, capture, pilot, installation, commit, or push |
| Authority required for approval | Program Board / Program Director |

This document designs PROGRAM-037. It does not start any Lot and does not certify any screen.

# 2. Program Identity

`PROGRAM-037` is the canonical, independent visual certification authority for NOVA interfaces delivered by `PROGRAM-036`.

Identifier control:

| Control | Finding | Decision |
|---|---|---|
| Official Program Register | Present, but currently lists only `PROGRAM-001` | Incomplete source; conflict recorded as `CR-P37-001` |
| Highest active Program architecture found | `PROGRAM-036` | Confirmed |
| Existing `PROGRAM-037` folder or document | None found | Confirmed absent |
| Existing corpus numbering basis | PROGRAM-036 records itself as first unused ID after the range through PROGRAM-035 | Supports sequential allocation |
| Next unused ID in the active repository corpus | `PROGRAM-037` | Confirmed, subject to central register regularization |

The identifier is not inferred from title alone: it is supported by the active corpus, the canonical PROGRAM-036 architecture, the absence of any PROGRAM-037 occurrence, and the established `PROGRAM-NNN_NAME/PROGRAM_NNN_PROGRAM_ARCHITECTURE.md` convention. The central register must be regularized by a separate authorized mission; this mission does not modify it.

# 3. Purpose

PROGRAM-037 provides a reproducible system to:

- receive an official visual reference and an official runtime candidate;
- prove source integrity and capture conditions;
- normalize comparable views without altering source pixels;
- measure structure, geometry, typography, color, borders, radii, and shadows;
- produce overlays and pixel-difference evidence;
- register, trace, close, and reopen elementary visual defects;
- issue an independent visual verdict;
- freeze a certified baseline and use it for later visual regression.

The program measures and decides. It does not implement or repair interfaces.

# 4. Context

PROGRAM-036 implements NOVA. Its current architecture also contains a Pixel-Perfect Certification Lot, and LOT 004A contains an MC-010 certification step. That creates an authority overlap with the separation now required by the Program Director. PROGRAM-037 resolves the target operating model by making visual certification independent, while preserving PROGRAM-036 as implementation authority. The documentary collision must be arbitrated before operational execution.

Home is the first pilot. The official Home V7 reference exists natively at `1920 × 995`. No official NOVA Home runtime capture at `1920 × 1080` was found in the inspected repository. A different height is not, by itself, a certification blocker; lack of a trustworthy runtime candidate is.

# 5. Sources

## 5.1 Mandatory sources read

| Source | Authority in PROGRAM-037 |
|---|---|
| `Docs/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md` | Program identifier register; currently incomplete |
| `Docs/05_RULES/ORCHESTRATION_GOVERNANCE.md` | Assignment, authority separation, conflict, escalation, validation, and closure doctrine |
| `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md` | Upstream implementation architecture, Gate and Evidence conventions, numbering basis |
| `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MASTER_EXECUTION_PLAN.md` | Upstream sequence, Lot plan, and Gate references |
| `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36_LOT_004A_HOME_PIXEL_PERFECT_PROGRAM.md` | Home comparison protocol, native V7 geometry, mini-project governance |
| `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36_LOT_004A_HOME_PIXEL_PERFECT_DEFECT_REGISTER.md` | Existing elementary visual defects, including DEF-008 |
| `Docs/10_NOVA/00_UX_AUDIT/NOVA_UX_AUDIT_REPORT.md` | UX hierarchy, cognitive-load rules, accessibility and visual QA expectations |
| `Docs/24_MODULES/0-UI-DESIGN/SOURCE/FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` | Official technical Figma interpretation, available values, conflicts, and missing data |
| `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md` | Frontend contracts, layout, tokens, typography, accessibility, and Pixel Perfect rules |
| `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md` | Development, test, Pixel Perfect, review, and certification practices |

## 5.2 Conventions and templates inspected

- `Docs/LOT_TEMPLATE.md`;
- `Docs/16_MISSION_ORDERS/MISSION_ORDER_TEMPLATE.md`;
- `Docs/17_EXECUTION_REPORTS/EXECUTION_REPORT_TEMPLATE.md`;
- Gate and Evidence models in `PROGRAM_036_PROGRAM_ARCHITECTURE.md`;
- certification structure in `P36-LOT-001_CERTIFICATION.md`.

No standalone official Program, Gate, Evidence Record, or Visual Certification template was found. PROGRAM-037 therefore follows the closest canonical structures without creating a new template in this mission.

## 5.3 Visual sources inspected

| Artefact | Dimensions | Status |
|---|---:|---|
| `Docs/24_MODULES/0-UI-DESIGN/NOVA-DESIGN-V7/NOVA-HOME-V7.png` | `1920 × 995` | Official Home V7 reference |
| Home V2, V3, V4, V5, and V6 images under `Docs/24_MODULES/0-UI-DESIGN/` | Various, approximately `1920 × 994/995` | Historical; forbidden as primary reference |
| `Docs/24_MODULES/0-UI-DESIGN/INTERFACE_HOME_CONTROL_ORCHESTRATOR.png` | `1599 × 814` | Different interface; not NOVA Home runtime evidence |
| Official NOVA Home runtime capture | Not found | Required for Home pilot execution |

# 6. Responsibilities

| Actor | Owns | Must not do |
|---|---|---|
| PROGRAM-036 | Frontend implementation, corrections, technical tests, runtime candidate delivery, implementation status | Issue its own final visual certification |
| PROGRAM-037 | Intake, integrity controls, normalization, measurement, overlay, diff, defects, evidence, visual verdict, baseline | Modify CSS, JSX, tokens, routes, data, or frontend behavior |
| Program Director / Program Board | Approve thresholds, resolve scope conflicts, authorize Lots, accept program verdict | Delegate final authority implicitly |
| Design Authority | Confirm official reference, regions, masks, and justified visual exceptions | Replace a missing source with an approximation |
| Visual QA Authority | Operate or supervise comparison and sign screen verdict | Certify evidence it produced alone without the required independent review |
| UX Authority | Decide cognitive-load and UX non-regression | Redesign during certification |
| Accessibility Authority | Decide accessibility non-regression | Treat pixel similarity as accessibility proof |
| PROGRAM-036 implementation owner | Receive defect findings and return a new candidate | Alter PROGRAM-037 evidence or baseline |

The executor may submit evidence but cannot be the sole final authority, in accordance with `ORG-VAL-002`.

# 7. Scope

PROGRAM-037 includes:

- visual source intake and provenance;
- runtime capture contract and metadata;
- deterministic normalization;
- structural, geometric, typographic, colorimetric, overlay, and pixel-diff comparison;
- region and component measurements;
- elementary visual defect governance;
- independent human review for unreliable automated findings;
- visual certification Gates and evidence records;
- baseline manifests, hashes, versioning, invalidation, and regression;
- Home pilot design and subsequent screen onboarding.

# 8. Out of Scope

PROGRAM-037 excludes:

- frontend or backend code changes;
- CSS, JSX, TS, TSX, HTML, asset, image, token, dependency, route, or data corrections;
- product redesign or new UX rules;
- creation of reference images by interpolation or generation;
- technical build ownership, except consumption of PROGRAM-036 results as evidence;
- automated installation or selection of a new library without a distinct Mission Order;
- execution of the Home pilot in this architecture mission;
- certification of Home or closure of DEF-008 in this architecture mission;
- modification of PROGRAM-036 or its Defect Register;
- commit, push, or release operations.

# 9. Visual Certification Principles

1. **Source fidelity.** Original sources are immutable and hashed before processing.
2. **No arbitrary scaling.** A reference is never stretched to match a runtime viewport.
3. **Comparable evidence.** Only pixels and anchors with a documented correspondence may be compared.
4. **Reproducibility.** Every decision is reproducible from artefacts, metadata, tool versions, configuration, and hashes.
5. **Measured, not guessed.** Geometry is obtained from pixels or trusted runtime bounds; estimates cannot close defects.
6. **Region awareness.** Global results never hide a failing component or region.
7. **Explicit uncertainty.** Missing sources, dynamic regions, antialiasing, and masks remain visible in the record.
8. **Independent verdict.** PROGRAM-036 cannot self-certify the frontend it implemented.
9. **No threshold invention.** Unapproved tolerances remain open decisions and block final certification, not measurement.
10. **Non-regression beyond pixels.** Visual acceptance cannot override UX or accessibility failures.
11. **Least exclusion.** Masks are minimal, named, justified, reviewed, and measurable.
12. **Evidence permanence.** A verdict without preserved evidence is invalid.

# 10. Artefact Model

Each screen uses the following future structure, which this mission defines but does not create:

`Docs/10_NOVA/04_VISUAL_CERTIFICATION/<SCREEN_ID>/`

| Artefact | Purpose |
|---|---|
| `<SCREEN_ID>_REFERENCE.png` | Immutable official source in native resolution |
| `<SCREEN_ID>_RUNTIME.png` | Immutable official runtime candidate |
| `<SCREEN_ID>_NORMALIZED_REFERENCE.png` | Deterministic comparison view derived from the source |
| `<SCREEN_ID>_NORMALIZED_RUNTIME.png` | Deterministic comparison view derived from runtime |
| `<SCREEN_ID>_OVERLAY.png` | Human-readable aligned overlay |
| `<SCREEN_ID>_DIFF.png` | Difference visualization |
| `<SCREEN_ID>_MEASUREMENTS.json` | Machine-readable capture, region, anchor, geometry, metric, and tool metadata |
| `<SCREEN_ID>_DEFECT_REGISTER.md` | Elementary visual defect lifecycle |
| `<SCREEN_ID>_CERTIFICATION_REPORT.md` | Gate results and signed verdict |
| `<SCREEN_ID>_BASELINE_MANIFEST.md` | Baseline identity, provenance, version, applicability, and invalidation rules |
| `SHA256.txt` | Hashes for every preserved artefact in the screen package |

Rules:

- `<SCREEN_ID>` is stable, uppercase snake case, route-independent, and approved at intake;
- source and runtime files are write-once within a certification run;
- a new candidate creates a new versioned run, never an in-place evidence rewrite;
- derived artefacts identify their exact parents and procedure;
- `SHA256.txt` is generated only after all artefacts are finalized;
- no artefact is created before an authorized execution Mission Order.

# 11. Capture Contract

Every runtime capture must carry a signed capture record containing:

| Parameter | Contract |
|---|---|
| Screen ID and route | Exact canonical route; redirects recorded |
| Query parameters | Exact ordered set; absence stated explicitly |
| Viewport | CSS-pixel width and height declared and verified |
| Output image | Pixel width and height declared and verified independently |
| Device pixel ratio | Fixed and recorded; source and runtime interpretation documented |
| Browser and engine | Product, full version, engine, headless/headed mode recorded |
| Operating system | Name, version, display scaling, rendering environment recorded |
| Zoom | 100% unless a separately approved profile states otherwise; verified, not assumed |
| Fonts | Files, versions, weight availability, load success, and fallback absence proven |
| Navigation state | Active item, expanded/collapsed state, focus, hover, and drawer state fixed |
| Application state | Route-ready marker and stable DOM state recorded |
| Data | Fixture or snapshot identifier, locale, account, permissions, and ordering fixed |
| Time | Clock, timezone, date, and relative-time values frozen when visible |
| Motion | Animations, transitions, blinking carets, video, and skeletons disabled or settled |
| Pointer | Cursor hidden and hover state explicitly controlled |
| Scroll | X/Y position recorded; scrollbar policy and gutter controlled |
| Capture extent | `VIEWPORT` or `FULL_PAGE`; never ambiguous |
| Encoding | Lossless PNG; no lossy recompression |
| Color | Color space/profile recorded and consistently interpreted |
| Stabilization | Fonts loaded, network idle or application-ready, and consecutive stable frames proven |
| Operator | Mission, timestamp, authority, command/tool, and tool version recorded |

If any comparison-critical parameter diverges and no approved transformation maps it, `GATE-P37-RUNTIME-CAPTURE-INTEGRITY` fails.

# 12. Reference Intake Model

Reference intake proceeds without modifying the source:

1. receive the file from the named Design Authority;
2. assign screen ID, reference version, source system, export identity, and receipt timestamp;
3. calculate SHA-256 and record byte length, format, native width/height, color metadata, and transparency;
4. confirm that the intended screen, state, locale, theme, and breakpoint are explicit;
5. classify authority as `OFFICIAL`, `CANDIDATE`, `HISTORICAL`, or `REJECTED`;
6. preserve the original bytes;
7. record known missing viewport metadata, cropping, and export limitations;
8. reject historical images as substitutes for a missing official state.

A reference may be official even when its native dimensions differ from the runtime target. Integrity concerns provenance and faithful handling, not forced dimensions.

# 13. Normalization Model

Normalization creates traceable working views; it never rewrites the originals.

Required procedure:

1. verify both input hashes and metadata;
2. establish coordinate systems in CSS pixels and image pixels;
3. identify common anchors and the reference useful-content bounds;
4. determine a deterministic origin transform from documented anchors;
5. define the common comparison rectangle as the intersection of mapped, sourced pixels;
6. preserve 1:1 pixels whenever source and runtime share scale;
7. if cropping is required, retain the originals and record exact source rectangles and offsets;
8. if a canvas is used, place source pixels without resampling and label unsourced areas `NO_SOURCE_DATA`;
9. normalize color interpretation only through an approved, recorded profile conversion;
10. produce a manifest entry for every transformation and verify output dimensions and hashes.

Forbidden transformations:

- arbitrary stretching, warping, interpolation, generative extension, or content-aware fill;
- silent crop, silent padding, silent color conversion, or removal of unmatched content;
- use of an older Figma export to fill missing official pixels;
- comparison of non-corresponding coordinates as if they shared an origin.

## Native-height policy for Home V7

- Keep Home V7 at its native `1920 × 995` resolution.
- Do not stretch it to `1920 × 1080`.
- Distinguish the runtime viewport (`1920 × 1080` when contractually captured) from V7 useful source bounds (`1920 × 995`).
- When origins and scale are proven compatible, compare the common sourced rectangle, at most `x=0..1919`, `y=0..994`.
- Classify runtime pixels below the mapped V7 boundary as `OUTSIDE_REFERENCE`; they are excluded from similarity scores and cannot be declared matching or failing from V7 alone.
- Any crop or offset must record both rectangles, anchor evidence, and the transform in measurements and certification report.
- The 85-pixel height difference alone does not fail certification. Unmapped content inside a required product region does require an additional official reference or an explicit Design Authority decision.

# 14. Measurement Model

Measurements are recorded at screen, region, component, and anchor levels.

Required measurement record fields:

- run ID, screen ID, reference ID, runtime ID, hashes, timestamp, operator, and tool versions;
- coordinate system, origin, scale, DPR interpretation, comparison rectangle, and excluded rectangles;
- region ID, component ID, semantic role, parent region, and source authority;
- reference and runtime `x`, `y`, `width`, and `height`;
- signed deltas for `x`, `y`, width, and height;
- margins, paddings, gaps, baselines, alignment axes, line boxes, and wrapping where observable;
- measurement method: pixel boundary, anchor, runtime DOM bounds, font metadata, sampled color, or human-reviewed estimate;
- uncertainty and repeatability result;
- applicable threshold profile ID or `UNAPPROVED`;
- evidence links and resulting defect ID.

Measurement rules:

- pixel-derived and DOM-derived geometry are kept distinct;
- DOM bounds may diagnose runtime but cannot claim Figma geometry not present in exported evidence;
- repeated measurements must yield the same result within an approved instrumentation allowance;
- coordinates never omit their origin and unit;
- each delta retains sign; absolute magnitude may be added but not substituted;
- a metric without source pixels or approved anchor mapping is `NOT_MEASURABLE`, not zero.

# 15. Overlay Model

An overlay is a review aid, not a standalone verdict.

The overlay record defines:

- exact normalized parents and hashes;
- common comparison rectangle;
- reference and runtime layer order;
- fixed opacity or channel-composite mode;
- visible origin, axes, anchors, component bounds, and excluded-region hatching;
- no-source and masked areas distinct from matching areas;
- export size, lossless encoding, color profile, and tool version.

At least one neutral alternating or alpha composite must allow the reviewer to identify double edges and offsets. Opacity is governed by an approved comparison profile; no value is made canonical by this architecture document.

# 16. Pixel Difference Model

Pixel difference operates only after normalization integrity passes.

The model supports:

- exact per-channel difference as raw evidence;
- approved perceptual or antialias-aware classification when a threshold profile exists;
- global different-pixel metrics over the common valid area;
- region and component metrics that cannot be hidden by the global score;
- heatmap or binary visualization with a legend;
- named masks and `NO_SOURCE_DATA` excluded from both numerator and denominator;
- separate reporting of antialiasing candidates, dynamic exclusions, and hard differences.

Every run records algorithm identity, version, parameters, channel/color interpretation, mask hashes, valid-pixel count, different-pixel count, and per-region results. No pixel-diff result can certify structure, UX, or accessibility by itself.

# 17. Defect Model

PROGRAM-037 maintains one canonical visual defect register per screen. It imports or references upstream defects; it does not duplicate them silently.

Each elementary defect contains:

- immutable defect ID and source-program ID when imported;
- one title and one atomic discrepancy;
- screen, state, region, component, and affected artefact hashes;
- reference observation, runtime observation, exact measurement, and method;
- nature, priority (`CRITICAL`, `MAJOR`, or `MINOR`), and owner program;
- overlay/diff/measurement evidence;
- validation criterion and applicable approved threshold profile;
- state, transitions, reviewer, decision timestamp, and justification;
- reopening trigger and links to superseding candidates.

Rules:

- one defect belongs to one implementation work package at a time;
- PROGRAM-037 owns evidence and verdict; PROGRAM-036 owns correction;
- `CLOSED` requires fresh candidate evidence and all applicable Gates;
- a closed defect reopens when its baseline, source, mask, threshold, candidate, or relevant region changes;
- imported DEF identifiers, including `DEF-008`, remain stable;
- duplicate observations link to the canonical defect rather than creating a second register entry.

# 18. Human Review Model

Human review is limited to findings not reliably decidable by approved automation, including semantic equivalence, font-rendering ambiguity, controlled antialiasing, shadow perception, mask legitimacy, and UX impact.

The review record requires:

- reviewer identity and authority role;
- artefact hashes and exact regions reviewed;
- automated result and reason it is insufficient;
- calibrated display/environment declaration when relevant;
- decision: `ACCEPT`, `REJECT`, or `REQUEST_NEW_EVIDENCE`;
- factual justification and any condition or expiry;
- conflict-of-interest statement;
- date, signature/approval reference, and reopening rule.

Human review cannot waive a missing official source, invent a threshold, approve an untraceable crop, or replace accessibility testing.

# 19. Tolerance Governance

No definitive numeric tolerance is established by the consulted sources for PROGRAM-037. The following are mandatory open decisions:

| Decision | Category | Required content | Blocking Gate |
|---|---|---|---|
| `OD-P37-001` | Geometric tolerance | Units, per-anchor/per-component rules, rounding, instrumentation allowance | `GATE-P37-MEASUREMENT-INTEGRITY`, `GATE-P37-SCREEN-CERTIFIED` |
| `OD-P37-002` | Typographic tolerance | Family, weight, size, line-height, wrapping, baseline and rasterization policy | `GATE-P37-SCREEN-CERTIFIED` |
| `OD-P37-003` | Colorimetric tolerance | Color space, channel/delta model, opacity, contrast handling | `GATE-P37-OVERLAY-DIFF-INTEGRITY` |
| `OD-P37-004` | Shadow tolerance | Blur/spread/offset/color method and antialiasing treatment | `GATE-P37-SCREEN-CERTIFIED` |
| `OD-P37-005` | Global pixel-difference tolerance | Algorithm, valid-pixel denominator, threshold and reporting | `GATE-P37-OVERLAY-DIFF-INTEGRITY`, `GATE-P37-SCREEN-CERTIFIED` |
| `OD-P37-006` | Component tolerance | Critical-region overrides and aggregation rules | `GATE-P37-SCREEN-CERTIFIED` |
| `OD-P37-007` | Dynamic exclusions | Eligible regions, maximum scope, evidence, expiry, approver | `GATE-P37-HUMAN-REVIEW`, `GATE-P37-SCREEN-CERTIFIED` |

Tolerance profiles are versioned, signed by Design Authority and Visual QA Authority, linked to a screen class, and frozen before a certification run. A threshold change invalidates affected verdicts or forces documented reevaluation. Measurement may proceed with `UNAPPROVED`; final screen certification may not.

# 20. State Machine

## 20.1 Authorized transitions

| From | To | Trigger / condition |
|---|---|---|
| `REFERENCE_MISSING` | `REFERENCE_RECEIVED` | Official reference passes intake identity check |
| `REFERENCE_RECEIVED` | `RUNTIME_CAPTURE_MISSING` | No valid runtime candidate is attached |
| `REFERENCE_RECEIVED` | `RUNTIME_CAPTURE_RECEIVED` | Valid runtime candidate is attached |
| `RUNTIME_CAPTURE_MISSING` | `RUNTIME_CAPTURE_RECEIVED` | Capture contract evidence is received |
| `RUNTIME_CAPTURE_RECEIVED` | `NORMALIZATION_PENDING` | Both original inputs are hashed and accepted |
| `NORMALIZATION_PENDING` | `MEASUREMENT_PENDING` | Normalization Gate passes |
| `MEASUREMENT_PENDING` | `DIFF_PENDING` | Required measures are complete and traceable |
| `DIFF_PENDING` | `DEFECTS_OPEN` | One or more actionable discrepancies exist |
| `DIFF_PENDING` | `CERTIFICATION_REVIEW` | No actionable discrepancy exists and all thresholds/Gates are available |
| `DEFECTS_OPEN` | `IMPLEMENTATION_COMPLETE` | PROGRAM-036 reports all scoped corrections complete; not yet visually validated |
| `IMPLEMENTATION_COMPLETE` | `VISUAL_VALIDATION_PENDING` | New official runtime candidate accepted |
| `VISUAL_VALIDATION_PENDING` | `NORMALIZATION_PENDING` | Candidate enters a new comparison cycle |
| `VISUAL_VALIDATION_PENDING` | `CERTIFICATION_REVIEW` | Existing complete evidence is eligible for review |
| `CERTIFICATION_REVIEW` | `CERTIFIED` | All mandatory Gates pass without conditions |
| `CERTIFICATION_REVIEW` | `CERTIFIED_WITH_CONDITIONS` | Only formally approved, non-blocking, expiring conditions remain |
| `CERTIFICATION_REVIEW` | `REJECTED` | Any blocking Gate fails |
| `REJECTED` | `DEFECTS_OPEN` | Rejection findings are accepted into implementation scope |
| `CERTIFIED` | `BASELINE_FROZEN` | Baseline manifest and hashes pass freeze Gate |
| `CERTIFIED_WITH_CONDITIONS` | `BASELINE_FROZEN` | Conditions explicitly permit freeze and are recorded with expiry |
| `BASELINE_FROZEN` | `RUNTIME_CAPTURE_RECEIVED` | A later regression run is opened against the frozen baseline |

## 20.2 Invalidation transitions

An integrity failure may return a run to `REFERENCE_MISSING`, `RUNTIME_CAPTURE_MISSING`, `NORMALIZATION_PENDING`, `MEASUREMENT_PENDING`, or `DIFF_PENDING`, but only through a recorded invalidation decision identifying affected evidence. No terminal label is overwritten silently.

`IMPLEMENTATION_COMPLETE` means code work is reported complete and external visual control remains. It is not `CERTIFIED`. `VISUAL_VALIDATION_PENDING` is not a blocker state and does not authorize the next gated implementation scope unless its governing program explicitly permits it.

# 21. Lot Architecture

PROGRAM-037 contains exactly twelve sequential Lots:

| Order | Lot | Purpose | Primary exit Gate |
|---:|---|---|---|
| 1 | LOT 000 — Program Readiness | Validate authority, sources, tools, references, captures, and conflicts | `GATE-P37-PROGRAM-READINESS` |
| 2 | LOT 001 — Capture Contract | Freeze reproducible runtime capture requirements | `GATE-P37-RUNTIME-CAPTURE-INTEGRITY` |
| 3 | LOT 002 — Reference Intake | Govern official source receipt and integrity | `GATE-P37-REFERENCE-INTEGRITY` |
| 4 | LOT 003 — Normalization Model | Govern common regions, origins, crops, and no-source data | `GATE-P37-NORMALIZATION-INTEGRITY` |
| 5 | LOT 004 — Measurement Model | Define traceable screen/region/component metrics | `GATE-P37-MEASUREMENT-INTEGRITY` |
| 6 | LOT 005 — Overlay and Diff Model | Produce reviewable overlays and differences | `GATE-P37-OVERLAY-DIFF-INTEGRITY` |
| 7 | LOT 006 — Defect Model | Govern atomic defects and evidence lifecycle | `GATE-P37-DEFECT-TRACEABILITY` |
| 8 | LOT 007 — Certification Gates | Operationalize visual, UX, accessibility, and human review | `GATE-P37-SCREEN-CERTIFIED` |
| 9 | LOT 008 — Home Pilot Certification | Apply the system to Home and decide DEF-008 | `GATE-P37-SCREEN-CERTIFIED` |
| 10 | LOT 009 — Baseline Management | Freeze and govern official visual baselines | `GATE-P37-BASELINE-FROZEN` |
| 11 | LOT 010 — Regression Visual Testing | Compare later candidates against frozen baselines | `GATE-P37-SCREEN-CERTIFIED` |
| 12 | LOT 011 — PROGRAM-037 Certification | Prove completeness, reproducibility, and governance | `GATE-P37-PROGRAM-CERTIFIED` |

Default execution is sequential. Any parallel evidence operation requires an explicit orchestration decision and may not allow two authorities to mutate the same run or register.

# 22. Detailed Lot Specifications

## LOT 000 — Program Readiness

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-000` |
| Objective | Decide `READY` or `BLOCKED` from program identity, authority, source, tool, reference, runtime, conflict, and threshold status |
| Sources | Program Register, orchestration governance, PROGRAM-036 architecture/plan, this architecture, repository/tool inventory |
| Prerequisites | Architecture approved for readiness review |
| Scope | Source availability, identifier, roles, tool capability, conflicts, open decisions, initial screen inventory |
| Out of scope | Installation, capture, comparison, implementation, screen verdict |
| Deliverables | Readiness report, source matrix, tool matrix, conflict/open-decision status |
| Tools needed | Read-only filesystem, metadata/hash capability, environment inventory |
| Entry criteria | Mission Order names authority and exact sources |
| Exit criteria | Every blocker has owner and decision; required capabilities classified available/missing |
| Entry Gate | None; Program Board authorization |
| Exit Gate | `GATE-P37-PROGRAM-READINESS` |
| Evidence | Source hashes, inventory outputs, authority assignments, conflict decisions |
| Risks | Incomplete Program Register, scope collision, assumed tool availability |
| Blocking conditions | Unconfirmed identifier, unresolved final authority, unreadable mandatory source |
| Rollback | Withdraw readiness verdict; preserve report and return to architecture review |
| Expected decision | `READY` or `BLOCKED` |

## LOT 001 — Capture Contract

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-001` |
| Objective | Establish a reproducible, screen-neutral runtime capture contract |
| Sources | This architecture, UX Audit, Implementation Bible, Playbook, runtime environment inventory |
| Prerequisites | LOT 000 PASS; capture authority and candidate environment named |
| Scope | Viewport, DPR, zoom, browser, OS, fonts, route, data, time, motion, cursor, scrollbar, extent, PNG, color, metadata |
| Out of scope | Taking Home capture, installing browser/tool, correcting rendering |
| Deliverables | Capture contract, metadata record model, conformance checklist |
| Tools needed | Browser/capture capability analysis, image metadata and hashing |
| Entry criteria | Target screen classes and environment constraints known |
| Exit criteria | Every capture parameter is mandatory, measurable, and failure-classified |
| Entry Gate | `GATE-P37-PROGRAM-READINESS` |
| Exit Gate | `GATE-P37-RUNTIME-CAPTURE-INTEGRITY` applied to a contract fixture, not Home certification |
| Evidence | Reviewed contract, sample metadata validation, authority approval |
| Risks | Browser unavailable, font drift, dynamic data, wrong zoom, scrollbar variance |
| Blocking conditions | Capture parameters cannot be controlled or recorded |
| Rollback | Revoke contract version; retain prior version and decision history |
| Expected decision | Capture contract `APPROVED` or `REJECTED` |

## LOT 002 — Reference Intake

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-002` |
| Objective | Prove that a reference is official, intact, native, identifiable, and usable within declared bounds |
| Sources | Figma Master Reference, Design Authority delivery, image metadata |
| Prerequisites | LOT 001 PASS; Design Authority assigned |
| Scope | Provenance, dimensions, format, color metadata, native bounds, hash, state and version |
| Out of scope | Resizing, repair, inferred missing pixels, runtime capture |
| Deliverables | Reference intake record and integrity verdict |
| Tools needed | Metadata reader, SHA-256, lossless image inspection |
| Entry criteria | Source file and authority statement received |
| Exit criteria | Original bytes preserved; source status and limitations explicit |
| Entry Gate | `GATE-P37-PROGRAM-READINESS` |
| Exit Gate | `GATE-P37-REFERENCE-INTEGRITY` |
| Evidence | File hash, dimensions, byte size, authority approval, visual identity check |
| Risks | Historical file mistaken as current; cropped export; missing viewport metadata |
| Blocking conditions | Authority or identity ambiguous; corrupted or mutable source |
| Rollback | Revoke reference intake and return to `REFERENCE_MISSING` |
| Expected decision | `REFERENCE_RECEIVED` or `REJECTED` |

## LOT 003 — Normalization Model

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-003` |
| Objective | Define deterministic, non-destructive mapping into a common comparison region |
| Sources | Approved capture contract, reference intake, native images, anchor definitions |
| Prerequisites | Reference and runtime integrity Gates PASS |
| Scope | Coordinate systems, origins, scale, common rectangle, traceable crop/pad, no-source areas, color interpretation |
| Out of scope | Stretching, interpolation, generative fill, visual correction |
| Deliverables | Normalization procedure, transform record, normalized artefact specifications |
| Tools needed | Lossless crop/canvas capability, metadata, hash, coordinate inspection |
| Entry criteria | Both inputs and anchor candidates available |
| Exit criteria | Every output pixel maps to a source pixel or explicit exclusion; transform reproducible |
| Entry Gate | `GATE-P37-REFERENCE-INTEGRITY` and `GATE-P37-RUNTIME-CAPTURE-INTEGRITY` |
| Exit Gate | `GATE-P37-NORMALIZATION-INTEGRITY` |
| Evidence | Input/output hashes, rectangles, offsets, scale proof, exclusion map |
| Risks | Silent resampling, wrong origin, non-corresponding crop, hidden 85-pixel mismatch |
| Blocking conditions | No reliable common anchor or coordinate mapping |
| Rollback | Discard derived outputs only; preserve immutable originals |
| Expected decision | `NORMALIZED` or `REJECTED` |

## LOT 004 — Measurement Model

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-004` |
| Objective | Standardize traceable measurements for screen, region, component, and anchor geometry |
| Sources | Normalized artefacts, component maps, Figma/UX references, runtime bounds where authorized |
| Prerequisites | LOT 003 PASS; region taxonomy approved |
| Scope | X/Y, width/height, margins, gaps, paddings, lines, wrapping, deltas, uncertainty, JSON field model |
| Out of scope | Invented Figma values, threshold approval, frontend correction |
| Deliverables | Measurement procedure, conceptual JSON schema, repeatability protocol |
| Tools needed | Pixel-coordinate and region measurement; optional runtime DOM bounds for diagnosis |
| Entry criteria | Coordinate system and comparison region frozen |
| Exit criteria | Required metrics reproducible and linked to evidence; unavailable metrics explicit |
| Entry Gate | `GATE-P37-NORMALIZATION-INTEGRITY` |
| Exit Gate | `GATE-P37-MEASUREMENT-INTEGRITY` |
| Evidence | Repeated measurements, schema review, sample region records |
| Risks | Manual error, unit confusion, rounding, DOM/pixel conflation |
| Blocking conditions | Measurement method non-repeatable or tolerance profile required but unapproved for verdict |
| Rollback | Invalidate affected measurement set and rerun from normalized parents |
| Expected decision | `MEASUREMENT_VALID` or `MEASUREMENT_INVALID` |

## LOT 005 — Overlay and Diff Model

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-005` |
| Objective | Define auditable overlay and pixel-difference production and reporting |
| Sources | Normalized images, measurement regions, approved masks and tolerance profiles |
| Prerequisites | LOT 004 PASS; algorithm/tool decision approved |
| Scope | Composite, diff image, valid area, masks, noise/antialiasing classification, global and regional metrics |
| Out of scope | Image repair, hidden exclusion, algorithm installation without Mission Order |
| Deliverables | Overlay/diff procedure, legends, metric record, mask governance |
| Tools needed | Approved image composite and pixel-diff capability |
| Entry criteria | Parent hashes and region map frozen |
| Exit criteria | Outputs reproduce from recorded parameters; denominators and exclusions exact |
| Entry Gate | `GATE-P37-MEASUREMENT-INTEGRITY` |
| Exit Gate | `GATE-P37-OVERLAY-DIFF-INTEGRITY` |
| Evidence | Commands/configuration, versions, hashes, overlays, diffs, per-region results |
| Risks | False positives, broad masks, color-profile drift, global score hiding local failure |
| Blocking conditions | Tool/algorithm unapproved; parameters or masks untraceable |
| Rollback | Invalidate derived overlay/diff and revert to normalized evidence |
| Expected decision | `DIFF_VALID` or `DIFF_INVALID` |

## LOT 006 — Defect Model

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-006` |
| Objective | Establish one atomic, evidence-backed defect lifecycle per screen |
| Sources | Existing LOT 004A register, measurements, overlay/diff results, governance rules |
| Prerequisites | LOT 005 PASS; owner-program boundary approved |
| Scope | IDs, severity, component/region, evidence, states, closure, reopening, import/deduplication |
| Out of scope | Correcting defects, renumbering imported DEFs, duplicating upstream registers |
| Deliverables | Defect contract, migration/link policy, closure/reopening protocol |
| Tools needed | Markdown/evidence validation and stable linking |
| Entry criteria | Canonical register ownership and ID namespace decided |
| Exit criteria | Every discrepancy maps to one atomic record and one owner |
| Entry Gate | `GATE-P37-OVERLAY-DIFF-INTEGRITY` |
| Exit Gate | `GATE-P37-DEFECT-TRACEABILITY` |
| Evidence | Traceability sample, duplicate check, transition audit |
| Risks | Duplicate registers, orphan defects, closure without new capture |
| Blocking conditions | Register authority unresolved or evidence links mutable |
| Rollback | Revert import mapping; preserve original register and audit trail |
| Expected decision | Defect model `APPROVED` or `REJECTED` |

## LOT 007 — Certification Gates

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-007` |
| Objective | Operationalize independent technical, visual, human, UX, accessibility, and final Gates |
| Sources | Lots 000–006 outputs, UX Audit, accessibility rules, orchestration governance |
| Prerequisites | Evidence and defect models PASS; authorities assigned; thresholds approved |
| Scope | Gate sequence, authority, PASS/FAIL, evidence, resubmission, conditional verdict limits |
| Out of scope | Screen execution, implementation correction, waiver by executor |
| Deliverables | Gate operating procedure and certification report contract |
| Tools needed | Evidence validation, report generation, authority/signature mechanism |
| Entry criteria | Thirteen Gate definitions accepted |
| Exit criteria | Dry-run proves no actor can self-certify or bypass a failed Gate |
| Entry Gate | `GATE-P37-DEFECT-TRACEABILITY` |
| Exit Gate | Gate-chain readiness review; `GATE-P37-SCREEN-CERTIFIED` remains screen-specific |
| Evidence | Dry-run records, authority matrix, failure/reprise tests |
| Risks | Self-certification, ambiguous conditional verdict, UX/accessibility conflation |
| Blocking conditions | Final authority or threshold profile missing |
| Rollback | Withdraw Gate procedure version and reopen authority review |
| Expected decision | Certification system `OPERATIONAL` or `REJECTED` |

## LOT 008 — Home Pilot Certification

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-008` |
| Objective | Apply the approved system to Home, handle `1920 × 995` versus runtime, measure the first Home anchor, and decide DEF-008 |
| Sources | Official Home V7, official NOVA Home runtime, LOT 004A program/register, DEF-008, approved Lots 001–007 outputs |
| Prerequisites | Home V7 intake PASS; official runtime received; thresholds/authorities approved; MC-001 reported `IMPLEMENTATION_COMPLETE` |
| Scope | Home normalization, common region, first useful Home Y anchor, DEF-008 evidence and verdict, pilot certification report |
| Out of scope | CSS/JSX/token correction, other DEF correction, Home redesign, use of historical Figma |
| Deliverables | Canonical Home artefact package and DEF-008/screen verdict |
| Tools needed | Approved capture metadata, lossless normalization, measurement, overlay, diff, report/hash capabilities |
| Entry criteria | All input hashes, route/data state, browser profile, common anchors, and threshold profile frozen |
| Exit criteria | DEF-008 is `CLOSED` or remains `OPEN` with objective evidence; Home verdict issued without treating native-height mismatch as failure |
| Entry Gate | All integrity Gates through `GATE-P37-DEFECT-TRACEABILITY` |
| Exit Gate | `GATE-P37-SCREEN-CERTIFIED` |
| Evidence | Both originals, normalized views, first-anchor measures, overlay, diff, register, signed report, hashes |
| Risks | Missing runtime, incorrect origin, stale DEF state, threshold ambiguity, 85-pixel no-source area mishandled |
| Blocking conditions | No official runtime; threshold profile unapproved; source authority or common anchor invalid |
| Rollback | Revoke pilot verdict and derived outputs; preserve originals and audit record; return defect to prior state |
| Expected decision | DEF-008 `CLOSED` or `OPEN`; Home `CERTIFIED`, `CERTIFIED_WITH_CONDITIONS`, or `REJECTED` |

## LOT 009 — Baseline Management

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-009` |
| Objective | Freeze a certified screen package as an immutable, versioned visual baseline |
| Sources | Certified screen package, certification report, approved exceptions and thresholds |
| Prerequisites | Screen certification PASS; no expired condition |
| Scope | Manifest, hashes, version, applicability, storage, change control, invalidation, supersession |
| Out of scope | Silent replacement, baseline editing, source generation |
| Deliverables | Baseline manifest, SHA-256 inventory, freeze decision |
| Tools needed | Hashing, immutable/versioned storage procedure, report validation |
| Entry criteria | Complete artefact package and authority signatures |
| Exit criteria | Every baseline byte and governing profile identified and recoverable |
| Entry Gate | `GATE-P37-SCREEN-CERTIFIED` |
| Exit Gate | `GATE-P37-BASELINE-FROZEN` |
| Evidence | Manifest, hashes, signatures, storage/version record |
| Risks | Divergent baselines, stale exceptions, mutable storage |
| Blocking conditions | Missing artefact/hash, unresolved condition, ambiguous active version |
| Rollback | Revoke active status, restore prior frozen version, preserve revocation record |
| Expected decision | `BASELINE_FROZEN` or `FREEZE_REJECTED` |

## LOT 010 — Regression Visual Testing

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-010` |
| Objective | Compare later runtime candidates against the applicable frozen baseline |
| Sources | Active baseline manifest, new official runtime, capture contract, approved thresholds/masks |
| Prerequisites | LOT 009 PASS; change trigger and target environment identified |
| Scope | Recapture, integrity, normalization, measure, diff, defect creation/reopening, verdict |
| Out of scope | Automatic baseline acceptance, implementation correction, threshold drift |
| Deliverables | Regression artefacts, changed-region report, defects, verdict |
| Tools needed | Approved end-to-end visual comparison toolchain |
| Entry criteria | Baseline applicability and new runtime integrity PASS |
| Exit criteria | Every difference classified and Gate verdict signed |
| Entry Gate | `GATE-P37-BASELINE-FROZEN` and runtime integrity Gate |
| Exit Gate | `GATE-P37-SCREEN-CERTIFIED` |
| Evidence | Baseline/new hashes, comparison outputs, defect links, signed report |
| Risks | Environment drift, stale baseline, false positives, hidden product change |
| Blocking conditions | Baseline invalid, capture contract mismatch, unapproved threshold/mask |
| Rollback | Reject candidate comparison; baseline remains immutable and active |
| Expected decision | Regression `PASS`, `PASS_WITH_CONDITIONS`, or `FAIL` |

## LOT 011 — PROGRAM-037 Certification

| Field | Specification |
|---|---|
| LOT_ID | `P37-LOT-011` |
| Objective | Certify PROGRAM-037 governance, reproducibility, evidence security, and operating readiness |
| Sources | All Lot outputs, Home pilot evidence, audit trail, risk/conflict/open-decision registers |
| Prerequisites | Lots 000–010 complete; required pilot and regression rehearsal complete |
| Scope | Completeness, independent authority, reproducibility, artefact integrity, rollback, security, acceptance criteria |
| Out of scope | Certifying a new frontend feature or changing upstream code |
| Deliverables | PROGRAM-037 certification report and final decision |
| Tools needed | Evidence audit, hash verification, repeatability run, report/signature capability |
| Entry criteria | All mandatory evidence present; no hidden blocker |
| Exit criteria | Independent rerun reproduces decisions; all program Gates pass |
| Entry Gate | `GATE-P37-BASELINE-FROZEN` plus accepted regression rehearsal |
| Exit Gate | `GATE-P37-PROGRAM-CERTIFIED` |
| Evidence | Full package inventory, repeatability evidence, Gate decisions, residual-risk acceptance |
| Risks | Evidence loss, operator dependency, unresolved authority conflict, tool obsolescence |
| Blocking conditions | Any mandatory Gate FAIL; unreproducible evidence; unresolved critical conflict |
| Rollback | Revoke program certification and return affected Lot(s) to review |
| Expected decision | PROGRAM `CERTIFIED` or `REJECTED` |

# 23. Gate Architecture

PROGRAM-037 defines exactly thirteen mandatory Gates.

| Gate | Object | Preconditions | Controls | Evidence | PASS | FAIL | Authority | Reprise procedure |
|---|---|---|---|---|---|---|---|---|
| `GATE-P37-PROGRAM-READINESS` | Program can begin governed work | Architecture submitted; sources inventoried | ID, scope, authorities, tools, conflicts, decisions, locks | Readiness report, source/tool/conflict matrices | Identity and authority unambiguous; blockers owned | Unconfirmed ID/authority or unreadable mandatory source | Program Board | Resolve conflict/missing source; issue new readiness review |
| `GATE-P37-REFERENCE-INTEGRITY` | Reference is official and immutable | Source delivered by named authority | Hash, bytes, dimensions, format, state, version, provenance | Intake record, original hash, authority approval | Native source preserved and identified | Ambiguous/historical/corrupt/mutable source | Design Authority + Visual QA | Obtain corrected official source; repeat intake |
| `GATE-P37-RUNTIME-CAPTURE-INTEGRITY` | Runtime obeys capture contract | Approved capture contract and candidate | Viewport, output, DPR, zoom, browser/OS, fonts, route, data, time, motion, scroll, PNG/color | Runtime image, metadata, logs, hash | Every comparison-critical parameter matches approved profile | Any critical parameter missing/divergent | Visual QA Authority | Recapture under controlled profile |
| `GATE-P37-NORMALIZATION-INTEGRITY` | Mapping is faithful and traceable | Both input integrity Gates PASS | Origin, scale, common region, crop/pad, no-source, color, resampling absence | Transform record, parent/output hashes, exclusion map | Every output pixel maps or is explicit no-source | Silent resample/crop/offset or unmapped compared pixels | Visual QA + Design Authority | Discard derived outputs; redefine mapping; rerun |
| `GATE-P37-MEASUREMENT-INTEGRITY` | Measures are objective and reproducible | Normalization PASS; region map frozen | Units, coordinates, signed deltas, method, repetition, uncertainty, threshold profile | Measurements file, repeat run, region definitions | Required measures reproduce and retain provenance | Estimate, missing origin/unit, non-repeatability, invented threshold | Visual QA Authority | Correct method/schema and repeat measurements |
| `GATE-P37-OVERLAY-DIFF-INTEGRITY` | Overlay/diff are reproducible | Measurement PASS; algorithm/profile approved | Parent hashes, parameters, valid pixels, masks, legends, global/region results | Overlay, diff, configuration, mask hashes, metrics | Outputs reproduce and exclusions are minimal/explicit | Untraceable parameters, false denominator, broad/unapproved mask | Visual QA + Design Authority | Revoke outputs/masks; rerun with approved configuration |
| `GATE-P37-DEFECT-TRACEABILITY` | Every discrepancy has one auditable lifecycle | Valid measurement/diff evidence | Atomicity, ID, owner, evidence, priority, validation, state, duplicates | Defect register, link/transition audit | Every actionable discrepancy maps to one canonical defect | Duplicate/orphan/unmeasured/ownerless defect | Visual QA + Program Orchestrator | Correct mapping, preserve audit, resubmit register |
| `GATE-P37-HUMAN-REVIEW` | Ambiguous findings receive controlled review | Automation insufficiency documented | Authority, region, environment, evidence, rationale, mask/exception scope | Signed human review record | Decision justified, bounded, conflict-free, reproducible evidence retained | Executor-only waiver, missing identity, unsourced judgment | Independent Design/Visual QA reviewer | Assign independent reviewer or obtain new evidence |
| `GATE-P37-UX-NON-REGRESSION` | Visual candidate preserves approved UX | Visual findings available; UX baseline identified | Hierarchy, cognitive load, labels, affordances, states, interaction visibility | UX review and linked findings | No blocking UX regression | Added overload, lost affordance, hierarchy/state regression | UX Authority | PROGRAM-036 remediates; new candidate and review |
| `GATE-P37-ACCESSIBILITY-NON-REGRESSION` | Candidate preserves accessibility | PROGRAM-036 technical evidence supplied; visual candidate fixed | Contrast evidence, zoom/wrap, focus visibility, target/label evidence where applicable | Accessibility report and test references | No blocking accessibility regression | Contrast/focus/wrap/semantics evidence fails or missing | Accessibility Authority | Upstream remediation and full affected checks |
| `GATE-P37-SCREEN-CERTIFIED` | Screen receives final independent visual verdict | All prior applicable Gates PASS; thresholds approved; defects resolved/accepted | Completeness, critical regions, conditions, authority independence | Certification report and full artefact hashes | No blocking Gate or open blocking defect | Any blocking Gate/defect, missing evidence, self-certification | Visual QA Authority + Design Authority; Program Board for conditions | Return defects to PROGRAM-036; receive new candidate; rerun affected chain |
| `GATE-P37-BASELINE-FROZEN` | Certified screen becomes immutable baseline | Screen Gate PASS; manifest complete | Version, applicability, hashes, profiles, conditions, storage, invalidation | Baseline manifest, SHA-256, freeze approval | Baseline complete, unique, recoverable, immutable | Missing hash/version/authority or ambiguous active baseline | Program Board delegate + Visual QA | Correct package or retain prior baseline; repeat freeze review |
| `GATE-P37-PROGRAM-CERTIFIED` | Entire system is trustworthy and reproducible | Lots 000–010 complete; pilot and regression rehearsal accepted | Governance, separation, evidence security, independent reproduction, rollback, risks | Program certification report and full audit package | All program acceptance criteria and Gates PASS | Any critical conflict, missing evidence, irreproducibility | Program Board | Reopen affected Lots; remediate; repeat full audit |

A Gate FAIL stops only the dependent sequence and never authorizes a workaround. A PASS does not open the next Lot without an explicit Mission Order.

# 24. Evidence Model

Every Evidence Record contains:

| Field group | Mandatory content |
|---|---|
| Identity | Evidence ID, run ID, Program/Lot/Mission/Gate, screen ID, version, status |
| Provenance | Producer, operator, authority, timestamp, source location, parent evidence |
| Inputs | Exact filenames, hashes, byte sizes, dimensions, reference/runtime IDs |
| Environment | OS, browser/engine, DPR, viewport, zoom, fonts, locale, time, data state, tool versions |
| Procedure | Approved procedure/profile IDs, commands or reproducible operations, parameters |
| Regions | Common region, component/region IDs, masks, no-source rectangles |
| Results | Raw measures, deltas, counts, classifications, uncertainty, PASS/FAIL |
| Review | Reviewer, authority, decision, rationale, conditions, signature reference |
| Integrity | Output filenames, SHA-256, immutable storage/version reference |
| Lifecycle | Supersedes/superseded-by, invalidation, expiry, rollback, reopening triggers |

Evidence classes are `SOURCE`, `CAPTURE`, `NORMALIZATION`, `MEASUREMENT`, `OVERLAY`, `DIFF`, `DEFECT`, `HUMAN_REVIEW`, `UX`, `ACCESSIBILITY`, `CERTIFICATION`, `BASELINE`, and `REGRESSION`.

Claims without linked evidence remain assertions and cannot satisfy a Gate. Screenshots alone do not prove viewport, DPR, zoom, fonts, route, data, or time; their metadata record is inseparable from the image.

# 25. Baseline Model

A visual baseline is a frozen certification package, not merely a PNG.

The baseline manifest records:

- screen, route, state, locale, theme, breakpoint, and data fixture;
- reference/runtime/normalized/overlay/diff/measurement/register/report hashes;
- capture, normalization, measurement, diff, tolerance, and mask profile versions;
- certification verdict, authorities, date, conditions, and expiry;
- active version, predecessor, reason for change, compatibility scope;
- storage and recovery location;
- invalidation triggers and revocation history.

Change control:

1. a baseline never changes in place;
2. a product or source change opens a candidate baseline version;
3. the old baseline stays active until the candidate passes all Gates;
4. a threshold, mask, font, engine, viewport, data, or reference change forces applicability review;
5. divergent active baselines for the same screen/state/profile are forbidden;
6. revocation preserves the revoked bytes, reason, authority, and replacement link.

# 26. Regression Model

Regression begins from a frozen baseline manifest and a new official runtime candidate.

Sequence:

1. verify baseline applicability and integrity;
2. capture or receive runtime under the same approved contract;
3. classify environment differences before image comparison;
4. normalize from immutable originals;
5. repeat required geometry and region measures;
6. produce overlay/diff with the baseline’s frozen profiles;
7. classify differences as expected approved change, defect, dynamic exclusion, environment drift, or no-source;
8. reopen affected defects or create atomic new defects;
9. run UX and accessibility non-regression Gates;
10. issue independent verdict;
11. retain the old baseline unless a new candidate is separately certified and frozen.

No regression run automatically updates a baseline. A changed screenshot is not an approved design change.

# 27. Home Pilot Model

Home is the first pilot screen.

## 27.1 Required inputs

- official `NOVA-HOME-V7.png`, native `1920 × 995`;
- official NOVA Home runtime capture and complete capture metadata;
- LOT 004A Home Pixel Perfect Program;
- existing LOT 004A Defect Register;
- DEF-008, titled “Décalage vertical induit par la top bar”;
- PROGRAM-036 declaration that MC-001 is `IMPLEMENTATION COMPLETE`;
- approved tolerance profile and assigned independent authorities.

The runtime image is currently absent from the repository inventory. The pilot therefore remains unexecuted.

## 27.2 Pilot procedure

1. intake and hash Home V7 at native dimensions;
2. intake the runtime candidate without assuming its viewport from pixel dimensions alone;
3. verify scale, origin, route, data, fonts, zoom, DPR, and viewport;
4. map the native V7 useful region to the runtime without stretching;
5. mark the unmatched runtime tail as `OUTSIDE_REFERENCE` when applicable;
6. identify the first useful Home-content anchor through a documented pixel rule;
7. measure `Y(reference)`, `Y(runtime)`, and signed/absolute delta in the shared coordinate system;
8. evaluate DEF-008 against its exact registered validation criterion and the approved geometric profile;
9. if exact correspondence is proven, DEF-008 may close; if not, it remains open unless an approved tolerance profile explicitly permits closure;
10. run overlay/diff and all screen Gates;
11. issue a signed pilot report without modifying PROGRAM-036 code or register silently.

The pilot proves that a native `1920 × 995` reference can support certification of its sourced common region. It does not claim evidence for the runtime-only lower area.

## 27.3 Pilot outcomes

- DEF-008: `CLOSED` or `OPEN`, with measurements and evidence;
- Home: `CERTIFIED`, `CERTIFIED_WITH_CONDITIONS`, or `REJECTED`;
- MC-001 certification status communicated to PROGRAM-036;
- system findings returned to Lots 001–007 if the process itself fails.

# 28. PROGRAM-036 Integration

The canonical handoff is:

| Direction | Contract |
|---|---|
| PROGRAM-036 → PROGRAM-037 | Candidate build identity, technical test results, exact route/state/data fixture, runtime capture or capture-ready environment, implementation status |
| PROGRAM-037 → PROGRAM-036 | Atomic defects, evidence links, priority, region/component, validation criterion, verdict, required recapture scope |
| PROGRAM-036 → PROGRAM-037 after repair | New candidate identity and complete technical/capture evidence; never overwritten prior evidence |
| PROGRAM-037 → Program Board | Independent screen verdict, conditions, residual risks, baseline recommendation |

Boundary rules:

- PROGRAM-036 may declare `IMPLEMENTATION COMPLETE`, not final visual `CERTIFIED`;
- PROGRAM-037 never commits a frontend correction;
- build, typecheck, unit, integration, UX, and accessibility evidence remain required but visual diff does not replace them;
- defects retain one canonical ID across handoffs;
- LOT 004A MC-010 and PROGRAM-036 LOT 019 cannot remain competing final visual authorities; `CR-P37-002` requires Board arbitration before PROGRAM-037 execution;
- no downstream Lot is opened automatically by a PROGRAM-037 verdict.

# 29. Tools and Environment

## 29.1 Detected capabilities

| Capability | Detected state | Architectural use |
|---|---|---|
| Node.js and npm | Present | Execution host for repository-approved tooling |
| Playwright / `@playwright/test` | Declared and installed in `apps/nova-web`; `test:e2e` script exists | Candidate browser capture/metadata automation, subject to browser availability and a separate Mission Order |
| PowerShell and .NET image metadata | Present; native dimensions were read successfully | Read-only metadata and SHA-256 support; not selected as full diff engine |
| `Get-FileHash` SHA-256 | Present | Artefact integrity |
| Markdown repository reporting | Present | Registers, manifests, and certification reports |
| Local image visual inspection | Available in the current review environment | Architecture-time inspection only; not sufficient as canonical automation |

## 29.2 Missing or unconfirmed capabilities

| Capability | Finding | Consequence |
|---|---|---|
| Official NOVA Home runtime capture | Not found | Home pilot cannot start |
| Active controllable browser session | Not demonstrated in this mission | Capture execution must be proven in LOT 000/001 |
| ImageMagick | Not detected | Cannot be assumed |
| `pixelmatch`, `sharp`, `pngjs` | Not declared/installed in `nova-web` | Cannot be selected or installed here |
| Usable Python/Pillow/OpenCV runtime | Not available from detected Python command | Cannot be assumed |
| Approved overlay/diff algorithm | Not selected | Open tool decision blocks operational diff |

Tool-selection criteria for a future Mission Order are: lossless PNG handling, deterministic crop/composite/diff, explicit color behavior, regional metrics, masks, stable versioning, Windows/repository compatibility, offline reproducibility, auditable parameters, and no hidden upload. No tool is installed or chosen arbitrarily by this architecture mission.

# 30. Risk Register

| Risk | Impact | Control | Owner | Blocking condition |
|---|---|---|---|---|
| Reference and runtime have different sizes | False alignment or arbitrary scaling | Native preservation, common region, explicit no-source area | Visual QA | Mapping cannot be proven |
| Browser unavailable | No official runtime capture | Readiness inventory; separate authorized capture environment | Technical Authority | Runtime missing |
| Font file/version/fallback differs | Geometry and raster diff noise | Font manifest and load proof | PROGRAM-036 + Visual QA | Font state unknown |
| Zoom/DPR/display scaling incorrect | Global geometry drift | Capture contract and metadata verification | Capture operator | Parameter unverified |
| Dynamic data/time/order | False defects | Frozen fixture, clock, locale, ordering | PROGRAM-036 | State not reproducible |
| Antialiasing or OS renderer differs | Pixel false positives | Environment lock; raw and approved perceptual classification | Visual QA | No approved policy |
| Scrollbar/gutter differs | Horizontal shift | Fixed scroll and scrollbar contract | Capture operator | Layout-affecting difference unexplained |
| Animation/caret/skeleton visible | Unstable pixels | Disable/settle and stable-frame proof | Capture operator | Frames unstable |
| Partial capture mislabeled | Missing regions | Explicit extent and output/viewport dimensions | Visual QA | Extent ambiguous |
| Lossy compression/color conversion | Invalid color/pixel evidence | Lossless PNG and profile metadata | Visual QA | Source bytes altered unknowingly |
| Manual measurement non-repeatable | Unreliable closure | Method, repetition, units, uncertainty | Measurement reviewer | Repeatability fails |
| Pixel-diff false positives | Defect inflation | Region metrics, environment control, human review | Visual QA | Algorithm unapproved |
| Thresholds not validated | Arbitrary verdict | Open decisions and blocking Gate | Program Board | Screen certification requested |
| Mask too broad | Hidden defects | Minimal named masks, area report, Design approval | Design Authority | Unapproved mask |
| PROGRAM-036 self-certifies | Conflict of interest | Independent screen Gate | Program Board | Authority overlap unresolved |
| Duplicate Defect Registers | Divergent status | Import/link policy and canonical owner | Program Orchestrator | Canonical register undefined |
| Divergent baselines | Conflicting regression results | One active version per profile, manifest and hashes | Program Board | Active version ambiguous |
| Evidence or hash loss | Verdict unreproducible | Complete artefact package and integrity Gate | Visual QA | Required evidence unavailable |
| Native reference omits runtime area | False completeness claim | `OUTSIDE_REFERENCE` classification | Design Authority | Required region lacks source |
| Tool version drift | Non-reproducible metrics | Frozen versions and configuration | Technical Authority | Version unavailable |

# 31. Conflict Register

| Conflict | Sources | Description | Impact | Authority | Status / required decision |
|---|---|---|---|---|---|
| `CR-P37-001` | Program Register vs active repository corpus | Central register lists only PROGRAM-001, while canonical Program folders/architectures extend through PROGRAM-036 | Identifier governance and discoverability | Program Board | OPEN; confirm PROGRAM-037 and authorize separate register update |
| `CR-P37-002` | PROGRAM-036 LOT 019 / LOT 004A MC-010 vs PROGRAM-037 | Existing upstream documents assign Pixel Perfect certification inside implementation program, contrary to required independent authority | Self-certification risk | Program Board | OPEN and execution-blocking; designate PROGRAM-037 as final visual authority and redefine upstream steps as submission/pre-certification evidence |
| `CR-P37-003` | Prior 1920 × 1080 policy vs native Home V7 `1920 × 995` | A strict equal-height rule would reject an official source format that does not exist at 1080 | Home pilot normalization | Design Authority + Visual QA | RESOLVED architecturally: preserve native source and compare documented common region |
| `CR-P37-004` | Pixel similarity vs UX/accessibility obligations | A visually close screen can still regress cognition, semantics, focus, or contrast | False certification | UX + Accessibility Authorities | RESOLVED architecturally through separate non-regression Gates |
| `CR-P37-005` | Existing DEF register ownership vs per-screen canonical register | Copying LOT 004A defects would create divergent status | Defect traceability | Program Orchestrator | OPEN; approve import/link and ownership policy in LOT 006 |

# 32. Open Decisions

| Decision | Required authority | Needed before |
|---|---|---|
| `OD-P37-001` geometric tolerance profile | Design + Visual QA | Measurement verdict / Home pilot |
| `OD-P37-002` typographic tolerance profile | Design + Visual QA | Screen certification |
| `OD-P37-003` colorimetric tolerance profile and color space | Design + Visual QA | Diff operations |
| `OD-P37-004` shadow tolerance profile | Design + Visual QA | Screen certification |
| `OD-P37-005` global pixel-diff algorithm and tolerance | Program Board + Visual QA | LOT 005 execution |
| `OD-P37-006` component/critical-region tolerance policy | Design + UX + Visual QA | Screen certification |
| `OD-P37-007` dynamic exclusion/mask policy | Design + Visual QA | Any masked comparison |
| `OD-P37-008` canonical browser/OS/DPR capture profile | Technical Authority + Visual QA | LOT 001 exit |
| `OD-P37-009` overlay/diff tool selection or authorization to add one | Technical Authority + Program Board | LOT 005 |
| `OD-P37-010` Home runtime authority, route/data fixture, and official capture delivery | Program Director + PROGRAM-036 | Home pilot |
| `OD-P37-011` PROGRAM-036/037 certification authority handoff | Program Board | Any operational PROGRAM-037 Lot beyond readiness |
| `OD-P37-012` central Program Register regularization | Program Board / registry owner | Formal program activation |
| `OD-P37-013` imported Defect Register ownership and update protocol | Program Orchestrator + Visual QA | LOT 006 |
| `OD-P37-014` human reviewer/signature mechanism and conditional-verdict expiry | Program Board | LOT 007 |

# 33. Definition of Ready

PROGRAM-037 is ready to execute LOT 000 only when:

- Program Board confirms `PROGRAM-037` and assigns final visual authority;
- the central register discrepancy is accepted for separate correction;
- PROGRAM-036/037 scope collision is resolved or explicitly bounded for readiness work;
- mandatory source documents remain readable and version-identifiable;
- Design, Visual QA, UX, Accessibility, and Technical authorities are named;
- no concurrent lock conflicts with the PROGRAM-037 evidence scope;
- tool availability can be inventoried without installation;
- open decisions have owners and deadlines;
- a distinct Mission Order authorizes LOT 000.

Screen-specific execution additionally requires an official reference, official runtime capture, approved capture/normalization/measurement/diff profiles, approved thresholds, and exact state metadata.

# 34. Definition of Done

PROGRAM-037 is done only when:

- all twelve Lots have passed their exit Gates;
- all thirteen Gates have operational procedures and retained evidence;
- Home pilot has issued an independent, evidence-backed verdict, including DEF-008;
- native-height mismatch handling is reproduced without stretching or hidden pixels;
- a certified screen baseline has been frozen with complete hashes;
- a later regression rehearsal has reproduced the expected decision path;
- tolerance, mask, tool, authority, and state policies are approved and versioned;
- PROGRAM-036 cannot self-certify or mutate PROGRAM-037 evidence;
- one canonical defect lifecycle and one active baseline per screen/profile are enforced;
- rollback, invalidation, and reopening procedures have been exercised;
- no critical conflict or blocking open decision remains;
- `GATE-P37-PROGRAM-CERTIFIED` passes.

# 35. Program Acceptance Criteria

The Program architecture is acceptable if:

- PROGRAM-037 is identifiable and its register discrepancy is explicit;
- responsibilities between implementation and certification are non-overlapping in the target model;
- all required artefacts, capture parameters, comparison methods, states, Lots, Gates, evidence, baselines, and risks are defined;
- the architecture preserves native reference pixels and supports unequal source/runtime heights;
- no numeric tolerance is invented;
- certification is impossible while official thresholds, evidence, or authority are missing;
- human review is bounded, independent, and traceable;
- UX and accessibility remain distinct mandatory controls;
- Home is the first pilot but is not declared certified here;
- no tool, code, capture artefact, correction, commit, or push is produced by this mission;
- the only created file is this architecture document.

Operational Program acceptance additionally requires closure of all blocking conditions in Section 32 and successful LOT 000 review.

# 36. Final Readiness Verdict

**Verdict: READY WITH CONDITIONS**

Rationale:

- `PROGRAM-037` is the next unused identifier in the active repository corpus after the canonical PROGRAM-036 architecture, and no PROGRAM-037 artefact exists;
- the central Program Register is incomplete and must be regularized separately;
- the architecture defines twelve Lots, thirteen Gates, full evidence and state governance, independent authority, and a non-destructive native-reference policy;
- Home V7 is available at `1920 × 995`, and this height does not block a traceable common-region comparison;
- the official NOVA Home runtime capture, approved numeric thresholds, canonical diff tooling/profile, and authority handoff are not yet available;
- the existing PROGRAM-036 self-certification scope must be reassigned before operational certification.

Conditions blocking screen certification, but not this architecture:

1. Program Board confirms PROGRAM-037, the authority handoff, and register regularization path.
2. Design and Visual QA Authorities approve all tolerance and mask profiles without arbitrary values.
3. Technical and Visual QA Authorities approve the capture environment and overlay/diff toolchain through separate Mission Orders.
4. PROGRAM-036 supplies an official, contract-compliant Home runtime candidate and technical evidence.
5. LOTs 000–007 pass before the Home pilot is launched.

No screen is certified by this decision. No Lot is automatically opened.

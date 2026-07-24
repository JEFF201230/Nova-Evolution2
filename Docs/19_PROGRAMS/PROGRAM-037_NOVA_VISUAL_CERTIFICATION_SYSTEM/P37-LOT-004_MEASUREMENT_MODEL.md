# 1 Document Control

| Field | Value |
|---|---|
| Program | `PROGRAM-037 — NOVA Visual Certification System` |
| Lot | `LOT-004 — Measurement Model` |
| Mission Order | `P37-MO-004-MEASUREMENT-MODEL` |
| Document | `P37-LOT-004_MEASUREMENT_MODEL.md` |
| Type | Canonical measurement architecture and governance model |
| Status | `APPROVED` |
| Owner | PROGRAM-037 |
| Approval authority | Program Director under `P37-DR-001` |
| Upstream dependency | Approved reference intake and approved normalization manifest |
| Downstream consumers | LOT-005 Overlay and Diff Model, LOT-006 Defect Model, LOT-007 Certification Gates |
| Verdict | `MEASUREMENT MODEL APPROVED` |
| Mission exclusions | No code, script, capture, Home/DEF-008 measurement, comparison, overlay, Pixel Diff, tolerance, or certification |

## 1.1 Table of contents

1. Document Control
2. Purpose
3. Scope
4. Definitions
5. Measurement Principles
6. Measurement Chain
7. Measurement Taxonomy
8. Geometric and Spacing Measurements
9. Typographic and Structural Measurements
10. Colorimetric and Surface Measurements
11. Icon, Component, and Zone Measurements
12. Units and Precision
13. Measurement Method
14. Result and Evidence Model
15. Difference Classification
16. Quality Gates and Traceability
17. Risk and Open Decision Registers
18. Final Verdict

## 1.2 Normative sources

| Source | Role in this model |
|---|---|
| `PROGRAM_037_PROGRAM_ARCHITECTURE.md` | Program scope, LOT-004 purpose, evidence chain, Gates, and downstream boundaries |
| `P37-DR-001_VISUAL_CERTIFICATION_GOVERNANCE.md` | Independent authority, evidence integrity, tolerance governance, and prohibition of implicit thresholds |
| `P37-LOT-000_PROGRAM_READINESS.md` | Readiness conditions and unresolved operational dependencies |
| `P37-LOT-001_CAPTURE_CONTRACT.md` | Runtime identity, capture profile, determinism, rendering context, and evidence requirements |
| `P37-LOT-002_REFERENCE_INTAKE.md` | Official reference identity, manifest, native resolution, hash, authority, and lifecycle |
| `P37-LOT-003_NORMALIZATION_MODEL.md` | Common Comparison Area, Safe Area, coordinate systems, offsets, exclusions, and normalization manifest |
| `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md` | NOVA component vocabulary and design properties requiring measurable representation |
| `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` | Official design-source categories, dimensions, typography, spacing, colors, borders, radii, and shadows |
| `NOVA_UX_AUDIT_REPORT.md` | UX hierarchy, visibility, cognitive-load, navigation, and accessibility interpretation constraints |

All nine sources were read as controlling context. If they conflict, `P37-DR-001` governs certification authority, the approved reference manifest governs visual intent, and the approved normalization manifest governs coordinate eligibility. This Lot does not resolve a source conflict by measurement.

# 2 Purpose

This document defines the only canonical measurement model for PROGRAM-037. It specifies what may be measured, where it is measured, how values and differences are represented, which evidence makes a result reproducible, and how a result becomes eligible for downstream overlay, defect, and certification processes.

Every conforming measurement is:

- deterministic: the same governed inputs and method yield the same recorded result;
- traceable: the result links to immutable reference, runtime, capture, and normalization identities;
- reproducible: an independent Evidence Validator can repeat the method from recorded evidence;
- tool-independent: the semantic result does not depend on a proprietary coordinate convention or output format;
- atomic: one Measurement Result expresses one target, one property, one comparison, and one unit;
- non-certifying: a raw measurement is evidence, not a visual verdict.

# 3 Scope

## 3.1 In scope

- define measurement entities, targets, regions, points, sessions, results, evidence, and statuses;
- define eleven measurement categories and eighty-five property definitions;
- define geometric, typographic, spacing, structural, colorimetric, border, radius, shadow, icon, component, and zone measurements;
- define five permitted unit types;
- define origin, axes, anchors, sequence, precision, validation, evidence, and repeatability rules;
- define three logical result formats and their mandatory fields;
- define difference classifications without numeric thresholds;
- define eight Quality Gates;
- define the full traceability chain from reference to certification.

## 3.2 Out of scope

- selecting or implementing a measurement tool;
- writing code or a script;
- producing a capture, overlay, Pixel Diff, or baseline;
- measuring Home, DEF-008, or any other screen/component;
- modifying PROGRAM-036, frontend code, PROGRAM-037 source documents, images, or references;
- inventing numeric tolerances, rounding limits, color thresholds, or severity cut-offs;
- certifying, rejecting, or correcting an interface.

## 3.3 Fail-closed boundary

A result is not approved when its target, source identity, Measurement Space, unit, method, evidence, precision policy, or authority is missing or ambiguous. The model reports the condition; it never guesses a value or severity.

# 4 Definitions

## 4.1 Glossary

| Term | Canonical definition |
|---|---|
| Measurement | Governed determination of one property of one target in an approved Measurement Space, with unit, provenance, method, and evidence |
| Measurement Point | Addressable coordinate used as an origin, anchor, endpoint, baseline point, or sampled location; it has a space ID and coordinates |
| Measurement Region | Named bounded or semantically described area in which a target/property is eligible for measurement |
| Measurement Target | Unambiguous object being measured: point, text run, icon, component, region, zone, or structural relationship |
| Measurement Space | Approved coordinate and eligibility model exposed by an approved normalization manifest; normally the Measurement Coordinate System (`MCS`) |
| Measurement Unit | Governed expression of a value: `PIXEL`, `RATIO`, `PERCENTAGE`, `COORDINATE`, or `INDEX` |
| Reference Measurement | Property value derived from the immutable official reference within the eligible Measurement Space |
| Runtime Measurement | Corresponding property value derived from the immutable candidate runtime within the same eligible Measurement Space |
| Measurement Evidence | Immutable material sufficient to locate the target, understand the method, verify values, and repeat the measurement |
| Measurement Session | Governed collection of atomic measurements sharing exact inputs, normalization manifest, method profile, environment, authority, and time window |
| Measurement Result | Atomic record containing paired values, difference, unit, classification, evidence, provenance, and status |
| Measurement Status | Lifecycle state of a result: `DRAFT`, `MEASURED`, `VALIDATED`, `APPROVED`, `REJECTED`, `SUPERSEDED`, or `UNMEASURABLE` |
| Property | Precisely named observable assigned to one category and one permitted unit |
| Anchor | Approved identifiable point or feature used to locate a target without changing either source |
| Raw Difference | Tool-independent comparison output derived from Reference Value and Runtime Value before tolerance interpretation |
| Comparison Eligibility | Manifest-backed statement that both values represent corresponding content in the Safe Area |
| Local Component Frame | Optional target-relative coordinates whose origin and mapping to MCS are explicitly recorded |

## 4.2 Result status lifecycle

`DRAFT → MEASURED → VALIDATED → APPROVED`

Alternative governed transitions are:

- `DRAFT | MEASURED | VALIDATED → REJECTED` when evidence or method fails;
- `DRAFT | MEASURED → UNMEASURABLE` when a valid value cannot be obtained;
- `APPROVED → SUPERSEDED` when an authorized replacement result is approved;
- `REJECTED | UNMEASURABLE → DRAFT` only in a new or explicitly reopened session with preserved history.

No record is overwritten. Every transition records actor, authority, timestamp, reason, and predecessor.

# 5 Measurement Principles

| ID | Principle | Normative rule |
|---|---|---|
| `MP-001` | Immutable sources | Measurement never alters the reference, runtime, or normalized evidence |
| `MP-002` | Approved inputs | Only official reference, conforming runtime, and approved normalization identities may feed an approved result |
| `MP-003` | Common semantics | Reference and runtime values must describe the same target/property in corresponding spaces |
| `MP-004` | Atomicity | One result contains exactly one property comparison for exactly one target |
| `MP-005` | Raw-value preservation | Original observed values and the unrounded raw difference are preserved |
| `MP-006` | No implicit tolerance | No numeric or qualitative threshold is inferred from tools, common practice, or operator preference |
| `MP-007` | Tool independence | Tool-native output is mapped to this model and retained as supporting evidence, never substituted for the canonical record |
| `MP-008` | Explicit uncertainty | Ambiguity becomes `UNMEASURABLE` or `OPEN_DECISION`; it is never hidden by approximation |
| `MP-009` | Eligibility before value | Area eligibility and target identity are validated before a value is accepted |
| `MP-010` | Independent validation | The executor cannot be the sole Evidence Validator for the same session |
| `MP-011` | Provenance continuity | Every result resolves upstream to hashes and downstream to evidence consumers |
| `MP-012` | Semantic restraint | Measurements describe observable visual facts; they do not infer implementation values or business logic |

# 6 Measurement Chain

## 6.1 Textual chain diagram

```text
OFFICIAL REFERENCE + CONFORMING RUNTIME
                    |
                    v
         APPROVED NORMALIZATION MANIFEST
                    |
                    v
       RESOLVE MEASUREMENT SPACE AND SAFE AREA
                    |
                    v
       IDENTIFY TARGET, PROPERTY, UNIT, ANCHORS
                    |
                    v
        ACQUIRE REFERENCE AND RUNTIME VALUES
                    |
                    v
       COMPUTE AND PRESERVE RAW DIFFERENCE
                    |
                    v
         ATTACH EVIDENCE AND PROVENANCE
                    |
                    v
         INDEPENDENT REPRODUCIBILITY CHECK
                    |
                    v
          APPROVED MEASUREMENT EXPORT
                    |
                    v
      OVERLAY -> DEFECT -> CERTIFICATION
```

The arrows express traceability and sequence, not automatic approval. LOT-005 or later consumers may use only `APPROVED` results.

## 6.2 Identity chain

`Reference ID → Runtime/Capture ID → Normalization Manifest ID + Hash → Measurement Session ID → Measurement Result ID → Evidence ID → Overlay/Diff ID → Defect ID → Certification Cycle ID`

Each link is mandatory when its downstream artefact exists. A missing predecessor invalidates the dependent evidence.

# 7 Measurement Taxonomy

## 7.1 Category matrix

| Category ID | Category | Observable purpose | Property range | Count |
|---|---|---|---|---:|
| `CAT-01` | Geometric | Position, extent, centers, and bounds | `MPR-001..011` | 11 |
| `CAT-02` | Spacing | Empty-space and relative-offset relationships | `MPR-012..018` | 7 |
| `CAT-03` | Typographic | Font and rendered text geometry | `MPR-019..025` | 7 |
| `CAT-04` | Structural | Order, containment, hierarchy, and visibility | `MPR-026..033` | 8 |
| `CAT-05` | Colorimetric | Visual color and opacity facts | `MPR-034..040` | 7 |
| `CAT-06` | Borders | Edge presence and border geometry/style | `MPR-041..046` | 6 |
| `CAT-07` | Radii | Corner curvature and resulting shape | `MPR-047..051` | 5 |
| `CAT-08` | Shadows | Layered shadow geometry and appearance | `MPR-052..059` | 8 |
| `CAT-09` | Icons | Icon bounds, construction, and optical placement | `MPR-060..067` | 8 |
| `CAT-10` | Components | Canonical measurement profiles by component type | `MPR-068..077` | 10 |
| `CAT-11` | Zones | Area eligibility, coverage, and exclusions | `MPR-078..085` | 8 |
|  | **Total** |  |  | **85** |

Categories organize atomic properties; they are not defect groupings or certification severities.

# 8 Geometric and Spacing Measurements

## 8.1 Geometric properties

| ID | Property | Definition | Default unit |
|---|---|---|---|
| `MPR-001` | X | Horizontal coordinate of the declared target anchor from the active Measurement Space origin | `COORDINATE` |
| `MPR-002` | Y | Vertical coordinate of the declared target anchor from the active Measurement Space origin | `COORDINATE` |
| `MPR-003` | Width | Horizontal extent between declared left and right bounds | `PIXEL` |
| `MPR-004` | Height | Vertical extent between declared top and bottom bounds | `PIXEL` |
| `MPR-005` | Top | Minimum eligible Y bound under the declared edge convention | `COORDINATE` |
| `MPR-006` | Left | Minimum eligible X bound under the declared edge convention | `COORDINATE` |
| `MPR-007` | Right | Maximum eligible X bound under the declared edge convention | `COORDINATE` |
| `MPR-008` | Bottom | Maximum eligible Y bound under the declared edge convention | `COORDINATE` |
| `MPR-009` | CenterX | Horizontal midpoint derived from declared left/right bounds, with derivation retained | `COORDINATE` |
| `MPR-010` | CenterY | Vertical midpoint derived from declared top/bottom bounds, with derivation retained | `COORDINATE` |
| `MPR-011` | Bounding Box | Ordered tuple of top, left, right, and bottom edges in one declared space | `COORDINATE` |

Right/bottom inclusivity, pixel-edge versus pixel-center convention, and subpixel representation must come from an approved Measurement Profile. Until approved, affected exact measurements remain `OPEN_DECISION`.

## 8.2 Spacing properties

| ID | Property | Definition | Default unit |
|---|---|---|---|
| `MPR-012` | Margin | Empty distance outside a target border to a declared neighboring or containing bound | `PIXEL` |
| `MPR-013` | Padding | Internal distance from a container border/content edge to its declared child/content bound | `PIXEL` |
| `MPR-014` | Gap | Distance between corresponding nearest bounds of two declared sibling targets | `PIXEL` |
| `MPR-015` | Offset | Signed displacement between corresponding declared anchors | `PIXEL` |
| `MPR-016` | Distance | Euclidean or axis-constrained separation between two declared points; method must be named | `PIXEL` |
| `MPR-017` | Alignment Offset | Signed perpendicular displacement from a declared common alignment axis | `PIXEL` |
| `MPR-018` | Baseline Offset | Signed vertical displacement between declared text baselines or baseline and target anchor | `PIXEL` |

Every spacing result names its two boundaries/anchors and direction. CSS box-model inference is forbidden unless the value is separately sourced as implementation evidence; visual measurement concerns rendered bounds.

# 9 Typographic and Structural Measurements

## 9.1 Typographic properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-019` | Font Family | Resolved rendered font family identity supported by loading/render evidence | `INDEX` referencing an approved family registry |
| `MPR-020` | Font Size | Governed rendered/em-box size where determinable; method distinguishes source declaration from visual inference | `PIXEL` |
| `MPR-021` | Weight | Resolved font weight identity/value without substituting visual darkness | `INDEX` referencing an approved weight registry |
| `MPR-022` | Line Height | Baseline-to-baseline distance or declared line box height under the named method | `PIXEL` |
| `MPR-023` | Letter Spacing | Additional inter-character advance under the named text/run method | `PIXEL` |
| `MPR-024` | Word Wrapping | Ordered line count and break-position signature for an exact text string and width | `INDEX` |
| `MPR-025` | Text Bounds | Visible-ink or line-box bounding rectangle; the chosen convention is mandatory | `COORDINATE` |

Font identity, size, weight, and letter spacing are not reliably inferred from raster appearance alone. If authoritative metadata and reproducible visual evidence cannot determine them, the result is `UNMEASURABLE`, not estimated.

## 9.2 Structural properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-026` | Order | Stable ordinal position among explicitly named peers | `INDEX` |
| `MPR-027` | Hierarchy | Directed level/path from governed screen root to target | `INDEX` |
| `MPR-028` | Parent | Identifier of the immediate containing structural target | `INDEX` |
| `MPR-029` | Child | Ordered identifier set of immediate contained targets | `INDEX` |
| `MPR-030` | Region | Governed semantic region identifier containing the target | `INDEX` |
| `MPR-031` | Container | Geometric/structural container identifier and containment relationship | `INDEX` |
| `MPR-032` | Visible Area | Target area visibly present inside eligible bounds, excluding approved occlusion | `PIXEL` or `RATIO` |
| `MPR-033` | Hidden Area | Target area clipped, occluded, or not visible, with cause and eligibility recorded | `PIXEL` or `RATIO` |

Structural presence is not inferred from a similar visual appearance. Target identity and correspondence require approved semantic labels or independently validated anchors.

# 10 Colorimetric and Surface Measurements

## 10.1 Colorimetric properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-034` | Background | Color sample/description of the declared background region under the approved color profile | `INDEX` referencing canonical color representation |
| `MPR-035` | Foreground | Color of visible foreground content for a declared sample/region | `INDEX` |
| `MPR-036` | Border Color | Color of a declared border edge/layer | `INDEX` |
| `MPR-037` | Shadow Color | Color of a declared shadow layer before or after compositing as explicitly stated | `INDEX` |
| `MPR-038` | Opacity | Declared or reproducibly derived alpha/opacity ratio for a named layer | `RATIO` or `PERCENTAGE` |
| `MPR-039` | Gradient | Ordered type, stops, positions, colors, orientation, and bounds signature | `INDEX` plus governed sub-results |
| `MPR-040` | State Color | Color associated with an exact governed UI state such as active, hover, focus, disabled, or alert | `INDEX` |

No color difference formula, profile conversion, sampling kernel, or acceptance threshold is approved by this Lot. Raw source representation and environment/profile evidence are mandatory.

## 10.2 Border properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-041` | Border Presence | Presence/absence by declared side or path | `INDEX` |
| `MPR-042` | Border Width | Perpendicular thickness of the declared border edge/layer | `PIXEL` |
| `MPR-043` | Border Style | Governed style identity (for example continuous or patterned) without implementation inference | `INDEX` |
| `MPR-044` | Border Side | Ordered set of affected sides/paths | `INDEX` |
| `MPR-045` | Border Bounds | Outer and inner border bounds in Measurement Space | `COORDINATE` |
| `MPR-046` | Border Continuity | Ordered visible/absent segment signature along the declared path | `INDEX` |

## 10.3 Radius properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-047` | Top-Left Radius | Horizontal/vertical curvature extents at the top-left corner | `PIXEL` or `RATIO` |
| `MPR-048` | Top-Right Radius | Horizontal/vertical curvature extents at the top-right corner | `PIXEL` or `RATIO` |
| `MPR-049` | Bottom-Right Radius | Horizontal/vertical curvature extents at the bottom-right corner | `PIXEL` or `RATIO` |
| `MPR-050` | Bottom-Left Radius | Horizontal/vertical curvature extents at the bottom-left corner | `PIXEL` or `RATIO` |
| `MPR-051` | Resulting Corner Shape | Governed shape signature used when raster evidence cannot uniquely recover implementation radius values | `INDEX` |

## 10.4 Shadow properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-052` | Shadow Offset X | Signed horizontal displacement of one declared shadow layer | `PIXEL` |
| `MPR-053` | Shadow Offset Y | Signed vertical displacement of one declared shadow layer | `PIXEL` |
| `MPR-054` | Shadow Blur Extent | Recorded blur descriptor/extent under an approved measurement method | `PIXEL` |
| `MPR-055` | Shadow Spread | Signed expansion/contraction descriptor of one layer where reproducibly determinable | `PIXEL` |
| `MPR-056` | Shadow Opacity | Alpha/opacity of one declared layer where determinable | `RATIO` or `PERCENTAGE` |
| `MPR-057` | Shadow Inset | External/internal classification of one layer | `INDEX` |
| `MPR-058` | Shadow Layer Count | Number of independently identifiable ordered shadow layers | `INDEX` |
| `MPR-059` | Shadow Bounds | Visible shadow envelope for a declared component and sampling rule | `COORDINATE` |

Raster antialiasing and compositing can make implementation-level shadow parameters unrecoverable. The visible envelope may be measured while unavailable implementation parameters remain `UNMEASURABLE`.

# 11 Icon, Component, and Zone Measurements

## 11.1 Icon properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-060` | Icon Bounds | Visible-ink or declared icon-box rectangle under a named convention | `COORDINATE` |
| `MPR-061` | Icon Width | Horizontal extent of declared icon bounds | `PIXEL` |
| `MPR-062` | Icon Height | Vertical extent of declared icon bounds | `PIXEL` |
| `MPR-063` | Icon Aspect Ratio | Width-to-height ratio of declared icon bounds | `RATIO` |
| `MPR-064` | Icon Stroke Width | Reproducibly determinable visual stroke thickness or `UNMEASURABLE` | `PIXEL` |
| `MPR-065` | Icon Paint Signature | Ordered fill/stroke color and presence identity | `INDEX` |
| `MPR-066` | Icon Alignment | Offset of icon anchor/center/baseline from its declared container anchor | `PIXEL` |
| `MPR-067` | Icon Optical Offset | Explicitly approved perceptual displacement distinct from geometric centering | `PIXEL` |

## 11.2 Component measurement profiles

Each profile is a governed bundle selector, not a grouped result. It identifies the atomic properties normally required for the component; every emitted result remains one target/property pair.

| ID | Component | Mandatory measurement approach |
|---|---|---|
| `MPR-068` | Card | Bounds, position, padding/gaps, border, radii, shadow, internal order, and declared state |
| `MPR-069` | Button | Bounds, label/icon text bounds, internal gap/padding, border/radius, state color, and alignment |
| `MPR-070` | Badge | Bounds, text/icon bounds, padding, radius, border/background/foreground, and peer alignment |
| `MPR-071` | Sidebar | Viewport-relative bounds, width/height, anchors, navigation row geometry, separators, footer/profile bounds, order, and state |
| `MPR-072` | Header | Region-relative bounds, title/subtitle text bounds, baselines, spacing, controls, and alignment |
| `MPR-073` | Navigation | Ordered targets, row bounds, icon/text alignment, spacing, active/hover/focus state, and containment |
| `MPR-074` | Section | Region bounds, heading/content relationship, section gaps, order, and visibility |
| `MPR-075` | Surface | Bounds, fill, opacity, border, radii, shadow, clipping, and stacking relation |
| `MPR-076` | Grid | Container bounds, track/column/row bounds, gaps, item placement, alignment, and overflow |
| `MPR-077` | Layout | Viewport/content bounds, major regions, axes, margins, offsets, hierarchy, and global rhythm |

## 11.3 Zone properties

| ID | Property | Definition | Unit/value form |
|---|---|---|---|
| `MPR-078` | Zone Bounds | Rectangle/polygon and coordinate-space identity of a governed zone | `COORDINATE` |
| `MPR-079` | Zone Area | Geometric area under an approved area method | `PIXEL` |
| `MPR-080` | Common Coverage | Portion of target zone inside the Common Comparison Area | `RATIO` or `PERCENTAGE` |
| `MPR-081` | Safe Coverage | Portion of target zone eligible after approved exclusions | `RATIO` or `PERCENTAGE` |
| `MPR-082` | Excluded Area | Area excluded by approved exclusion ID, reason, and authority | `PIXEL` or `RATIO` |
| `MPR-083` | Outside Reference Area | Runtime area with no corresponding official-reference coverage | `PIXEL` or `RATIO` |
| `MPR-084` | Outside Runtime Area | Reference area with no corresponding runtime coverage | `PIXEL` or `RATIO` |
| `MPR-085` | Zone Identity | Stable semantic region/zone ID and parent path | `INDEX` |

`OUTSIDE_REFERENCE` and `OUTSIDE_RUNTIME` are eligibility facts, not visual defects by themselves. They remain documented and excluded from paired property comparison unless later governance explicitly defines a separate structural evaluation.

# 12 Units and Precision

## 12.1 Unit matrix

| Unit | Meaning | Permitted use | Prohibition |
|---|---|---|---|
| `PIXEL` | Geometric length or area expressed in governed image/measurement pixels | lengths, offsets, extents; area only with dimensional metadata | Must not silently mean CSS px, device px, or rescaled pixels |
| `RATIO` | Dimensionless relation of two declared values | aspect, opacity, coverage | Denominator must be named and non-zero |
| `PERCENTAGE` | Ratio expressed against a declared denominator | coverage or opacity presentation | Raw ratio and denominator must remain available |
| `COORDINATE` | Ordered position in a named coordinate space | X/Y, bounds, points | Space, origin, axes, and edge convention are mandatory |
| `INDEX` | Stable ordinal, categorical registry ID, ordered signature, or relationship identity | structure, font/color/state identities, layer/order data | Must not masquerade as a numeric distance or severity |

No other unit may be introduced without a justified, approved Measurement Model Decision Record that defines semantics, conversion, precision, evidence, compatibility, and migration.

## 12.2 Precision and rounding

- Raw observed and derived values are preserved at the precision supplied by the approved method.
- Display formatting never changes the stored raw value.
- Difference is computed from raw values, not formatted values.
- Coordinate conversion, fractional-pixel policy, edge inclusion, rounding mode, and significant precision remain `OPEN_DECISION` until approved.
- A tool default is not an approved precision policy.
- When precision policy prevents reproducibility, the result cannot pass `MEASUREMENT_RESULT`.

# 13 Measurement Method

## 13.1 Canonical sequence

1. Identify the authorized Measurement Session and exact source/capture IDs and hashes.
2. Validate the approved normalization manifest, its hash, state, coordinate mapping, Common Comparison Area, Safe Area, offsets, and exclusions.
3. Resolve one Measurement Target with stable ID, semantic path, region, expected correspondence, and bounds/anchors.
4. Select one category, one property ID, one permitted unit, and one approved method profile.
5. Declare Measurement Space, origin, axes, coordinate convention, anchor set, direction, and any Local Component Frame mapping.
6. Confirm that corresponding reference and runtime target areas are eligible and not silently excluded.
7. Acquire the Reference Value and Runtime Value independently without modifying either source.
8. Compute the Raw Difference using the property-specific operation and preserve operands and operation identity.
9. Assign only a classification supported by approved tolerance/severity governance; otherwise use raw reporting plus `OPEN_DECISION` where classification depends on an unresolved threshold.
10. Attach locator, method, provenance, environment, and reproducibility evidence.
11. Repeat or independently validate the result under the same governed inputs.
12. Apply Quality Gates in order and export only approved records.

## 13.2 Origin, axes, and frames

- Default space is the `MCS` published by the approved normalization manifest.
- Default axes follow that manifest; this document does not redefine them.
- A Local Component Frame is allowed only when its origin, axes, scale identity, and reversible translation to MCS are recorded.
- Reference and runtime values use corresponding anchors, not independently convenient anchors.
- Translation records an offset; it does not erase the offset being measured.
- Margins, padding, and useful-content boundaries are declared measurement targets, not assumed from implementation semantics.

## 13.3 Validation and repeatability

A result is reproducible only when an independent validator can determine:

- exact immutable inputs and their hashes;
- exact normalization manifest and eligible area;
- exact target and property;
- exact points, bounds, anchors, and coordinate conventions;
- exact acquisition and difference method;
- raw operands, derivation, unit, and precision representation;
- exclusions or absence of exclusions;
- executor, validator, timestamp, environment, and tool identity/version where a tool was used.

Disagreement is preserved as evidence. The result returns to `DRAFT` or becomes `REJECTED`; values are not averaged unless a future approved method explicitly requires and justifies it.

# 14 Result and Evidence Model

## 14.1 Three logical result formats

| Format ID | Format | Purpose | Minimum content |
|---|---|---|---|
| `MRF-01` | Atomic Measurement Result | Canonical one-target/one-property comparison | Fifteen-field minimum schema plus provenance/method fields required by Gates |
| `MRF-02` | Measurement Session Manifest | Binds a coherent result set to immutable inputs, profile, normalization, authority, and lifecycle | Session ID, source/runtime/normalization IDs and hashes, method profile, environment, participants, result index, status, timestamps |
| `MRF-03` | Measurement Export and Evidence Index | Tool-neutral downstream package/index | Export ID/version, session/result IDs, evidence IDs/hashes, schema version, integrity hash, supersession/invalidation data |

These are logical formats, not mandated file encodings. LOT-004 does not choose JSON serialization, tooling, or storage implementation.

## 14.2 Atomic result minimum schema

| Field | Requirement |
|---|---|
| Measurement ID | Unique, immutable atomic result ID |
| Reference ID | Exact official reference manifest ID/version/hash linkage |
| Runtime ID | Exact candidate capture/runtime ID/version/hash linkage |
| Target | Stable target ID, semantic path, region, and locator |
| Category | Exactly one `CAT-01..CAT-11` |
| Property | Exactly one `MPR-001..MPR-085` compatible with the category |
| Reference Value | Raw reference value or explicit absence status |
| Runtime Value | Raw runtime value or explicit absence status |
| Difference | Property-specific raw difference/relationship or explicit non-computable reason |
| Unit | Exactly one permitted unit with denominator/space where applicable |
| Status | Result lifecycle status plus difference classification |
| Evidence | Evidence IDs, locators, hashes, method, and reproducibility linkage |
| Timestamp | Governed acquisition/validation timestamps and time-zone representation |
| Authority | Executor, Evidence Validator, and approval authority identities/scopes |
| Traceability | Session, normalization manifest, profile, predecessor/supersession, and downstream linkages |

The first fourteen names required by the Mission Order are present; `Traceability` is added because an isolated result cannot satisfy PROGRAM-037 evidence integrity without it.

## 14.3 Result matrix

| Condition | Reference Value | Runtime Value | Difference | Classification eligibility |
|---|---|---|---|---|
| Both targets eligible and measurable | Required | Required | Required | `MATCH` or governed difference class |
| Runtime-only area | Not applicable | Locatable | Not paired | `OUTSIDE_REFERENCE` |
| Reference-only area | Locatable | Not applicable | Not paired | `OUTSIDE_RUNTIME` |
| Target/property cannot be reliably determined | Available if known | Available if known | Not asserted | `UNMEASURABLE` |
| Threshold-dependent classification unresolved | Required | Required | Raw difference required | `OPEN_DECISION` for severity; raw result remains usable evidence |
| Evidence or provenance invalid | Preserved | Preserved | Preserved if computed | Result `REJECTED`; not downstream eligible |

## 14.4 Minimum Measurement Evidence

- immutable input identifiers, versions, hashes, and native dimensions;
- approved capture and reference manifests;
- approved normalization manifest and hash;
- target locator showing relevant reference/runtime areas without changing originals;
- Measurement Space, region, anchors, points, bounds, directions, and exclusions;
- method profile identity/version and tool identity/version if applicable;
- raw values, difference operation, precision representation, and unit metadata;
- executor and independent validation record;
- timestamps, environment identity, Gate outcomes, and result/export hashes;
- rejection, supersession, or invalidation history where applicable.

# 15 Difference Classification

## 15.1 Classification matrix

| Classification | Meaning | Rule without numeric thresholds |
|---|---|---|
| `MATCH` | Reference and runtime values are equivalent under an approved property-specific equality and precision rule | Cannot be assigned until that rule is approved and evidence passes |
| `MINOR DIFFERENCE` | Proven difference whose approved severity governance classifies it as limited/non-blocking | No numeric or qualitative shortcut is defined here |
| `MAJOR DIFFERENCE` | Proven difference whose approved severity governance classifies it as materially non-conforming | Requires approved severity criteria and traceable evidence |
| `CRITICAL DIFFERENCE` | Proven difference whose approved severity governance classifies it as certification-critical | Requires approved criticality criteria and authority |
| `UNMEASURABLE` | Target/property cannot be determined reproducibly from governed inputs | Must include reason and required recovery evidence |
| `OUTSIDE_REFERENCE` | Runtime location lacks corresponding official-reference coverage | Documented, excluded from paired comparison, not automatically a defect |
| `OUTSIDE_RUNTIME` | Reference location lacks corresponding runtime coverage | Documented, excluded from paired comparison, not automatically a defect |
| `OPEN_DECISION` | A raw measurement exists or is planned, but an unresolved governed method/tolerance decision prevents the required interpretation | Blocks only dependent interpretation/certification action |

## 15.2 Classification governance

- This Lot fixes no threshold or acceptance value.
- Raw values and raw differences may be reported before tolerance approval.
- `MINOR`, `MAJOR`, `CRITICAL`, and threshold-dependent `MATCH` require an approved dedicated tolerance/severity Decision Record under `P37-DR-001`.
- A component name, visual impression, implementation priority, or tool color does not determine severity.
- Human review cannot invent a missing threshold or convert `UNMEASURABLE` into a measured result.
- Classification and Measurement Status are separate fields: for example, a validated raw result may carry classification `OPEN_DECISION`.

# 16 Quality Gates and Traceability

## 16.1 Gate matrix

| Gate | Objective | Entry | Controls | PASS output | FAIL output |
|---|---|---|---|---|---|
| `MEASUREMENT_INPUT` | Prove authorized immutable inputs | Reference/runtime/capture manifests and Mission Order | identity, status, hashes, dimensions, authority, capture conformance | Input set locked to session | Session rejected or pending; no measurement |
| `MEASUREMENT_TARGET` | Prove one unambiguous corresponding target/property | Input Gate PASS; target proposal | target ID/path, region, correspondence, category/property compatibility, anchors | Target specification locked | `UNMEASURABLE`, rejected, or clarification required |
| `MEASUREMENT_SPACE` | Prove eligible common coordinates | Target Gate PASS; approved normalization manifest | manifest hash/state, MCS, origins, axes, Safe Area, offsets, exclusions, local-frame mapping | Measurement-space record locked | No value acquisition; normalization recovery required |
| `MEASUREMENT_RESULT` | Prove raw values/difference semantics | Space Gate PASS; acquired values | atomicity, unit, raw operands, operation, precision, missing-value handling, classification separation | Result state `MEASURED` | Result `REJECTED`, `UNMEASURABLE`, or returned to `DRAFT` |
| `MEASUREMENT_EVIDENCE` | Prove method and locators | Measured result | evidence completeness, hashes, method/tool identity, anchors/bounds, environment, exclusions | Evidence package sealed | Result not validation-eligible |
| `MEASUREMENT_TRACEABILITY` | Prove end-to-end lineage and reproducibility | Evidence Gate PASS | upstream/downstream IDs, session, profiles, authorities, repeat result, history | Result state `VALIDATED` | Traceability/repeatability failure; result rejected or reopened |
| `MEASUREMENT_APPROVED` | Independently approve canonical results | All prior Gates PASS | validator independence, conflicts, decisions, allowed classification, signatures | Result/session state `APPROVED` | No downstream use; request new evidence or decision |
| `MEASUREMENT_EXPORT` | Seal tool-neutral downstream package | Approved results/session | schema version, result index, evidence references, hashes, completeness, supersession/invalidation rules | Approved immutable export eligible for LOT-005 | Export rejected; approved source records remain preserved |

## 16.2 Gate order

`MEASUREMENT_INPUT → MEASUREMENT_TARGET → MEASUREMENT_SPACE → MEASUREMENT_RESULT → MEASUREMENT_EVIDENCE → MEASUREMENT_TRACEABILITY → MEASUREMENT_APPROVED → MEASUREMENT_EXPORT`

No downstream Gate cures an upstream failure. A Gate may remain pending only with an explicit condition, authority, and recovery action.

## 16.3 Traceability matrix

| Stage | Required inbound identity | Measurement responsibility | Required outbound linkage |
|---|---|---|---|
| Reference | Official reference manifest/hash | Preserve source identity and authority | Normalization manifest |
| Normalization | Approved manifest/hash and Safe Area | Use exact MCS, mapping, offsets, and exclusions | Measurement Session/Result IDs |
| Measurement | Session/results/evidence/export hashes | Preserve raw facts, methods, units, status, and decisions | Overlay/Diff evidence IDs |
| Overlay | Approved measurement export where consumed | Display only; cannot rewrite measurement facts | Defect evidence links |
| Defect | Atomic evidence references | Cite exact results and classification authority | Certification Gate evidence |
| Certification | Complete evidence chain | Apply authorized Gates and tolerances independently | Verdict/baseline manifest links |

Invalidation of any source hash, capture profile, normalization manifest, measurement method, tolerance decision, or evidence authority triggers an impact review of every dependent result and export. History is preserved.

# 17 Risk and Open Decision Registers

## 17.1 Risk register

| Risk ID | Real risk | Impact | Required control/recovery |
|---|---|---|---|
| `R-MEAS-01` | Wrong origin or coordinate space | Systematic false offsets | Space Gate, manifest hash, anchor evidence, independent repeat |
| `R-MEAS-02` | Duplicate measurement recorded as distinct fact | Inflated or conflicting evidence | Stable target/property/session keys and duplicate detection |
| `R-MEAS-03` | Ambiguous target correspondence | Invalid paired values | Semantic path, region, anchors, validator decision or `UNMEASURABLE` |
| `R-MEAS-04` | Wrong or implicit unit | Invalid differences/conversions | Unit matrix enforcement and explicit denominator/space |
| `R-MEAS-05` | Unapproved rounding | False match or severity | Preserve raw values; approve precision policy before dependent verdict |
| `R-MEAS-06` | Precision loss during export | Non-reproducible result | Lossless logical export, schema/version/hash validation |
| `R-MEAS-07` | Partial measurement presented as complete | Missing defects or false approval | Coverage/eligibility records and session completeness Gate |
| `R-MEAS-08` | Non-reproducible manual measurement | Unreliable evidence | Exact locators/method plus independent repeat; otherwise reject |
| `R-MEAS-09` | Missing, altered, or detached evidence | Broken audit chain | Evidence hashes, sealed index, fail-closed Gate |
| `R-MEAS-10` | Result attached to wrong reference/runtime/normalization | Cross-cycle contamination | Immutable ID/hash chain and session lock |
| `R-MEAS-11` | Raster antialiasing mistaken for source property | False typography/color/shadow values | Environment evidence, method limitation, `UNMEASURABLE` where needed |
| `R-MEAS-12` | Tool-native coordinate convention leaks into canonical data | Non-portable results | Explicit mapping to MCS and tool-independent export |
| `R-MEAS-13` | Excluded or outside area silently measured | Invalid denominator/comparison | Safe Area eligibility check and exclusion IDs in every affected result |
| `R-MEAS-14` | Numeric severity inferred without approved tolerance | Unauthorized certification logic | Separate raw difference/classification; `OPEN_DECISION` and Gate failure |
| `R-MEAS-15` | Local component frame loses mapping to MCS | Untraceable component geometry | Record reversible frame mapping or prohibit local result approval |

No risk is converted into a tolerance, exclusion, or tool choice by this model.

## 17.2 Open decision register

| Decision ID | Open decision | Required authority/vehicle | Dependent operation blocked |
|---|---|---|---|
| `OD-MEAS-001` | Pixel-edge versus pixel-center convention and right/bottom inclusivity | Measurement Method Decision Record | Exact bounds/size approval |
| `OD-MEAS-002` | Fractional-coordinate representation, rounding mode, stored precision, and display precision | Measurement Method Decision Record | Exact equality and reproducibility Gate |
| `OD-MEAS-003` | Property-specific raw-difference operations, including signed/absolute/vector/structural forms | Measurement Method Decision Record | Canonical difference for affected properties |
| `OD-MEAS-004` | Official target/region/component identifier registry and naming authority | Program Director/Design Authority record | Cross-session target identity |
| `OD-MEAS-005` | Approved acquisition method profiles and tool qualification | Program Board tool/method Decision Record | Operational measurement execution |
| `OD-MEAS-006` | Canonical color representation, profile handling, sampling, and difference method | Color Measurement Decision Record | Colorimetric result interpretation |
| `OD-MEAS-007` | Typographic visual-versus-metadata methods and text-bound convention | Typography Measurement Decision Record | Exact typography approval |
| `OD-MEAS-008` | Border, radius, shadow, and icon sampling/edge-detection conventions | Surface Measurement Decision Record | Exact surface/icon approval |
| `OD-MEAS-009` | Numeric tolerances and severity mapping for every applicable category/component | Dedicated tolerance Decision Record under `P37-DR-001` | `MATCH`/severity-based certification |
| `OD-MEAS-010` | Logical schema serialization, storage location, retention, and migration policy | Evidence Model Decision Record | Canonical persisted export |
| `OD-MEAS-011` | Independent repeat count and disagreement-resolution protocol | Evidence Validation Decision Record | Final reproducibility approval |
| `OD-MEAS-012` | Rules for structural evaluation of `OUTSIDE_REFERENCE` and `OUTSIDE_RUNTIME` | Design/Certification Decision Record | Defect or certification interpretation of outside areas |

These decisions are intentionally unresolved. None may be filled from an implementation, library default, prior ad hoc measurement, or operator preference.

# 18 Final Verdict

**Decision: MEASUREMENT MODEL APPROVED**

The model is approved because it:

- defines eleven categories and eighty-five atomic measurement property definitions;
- defines five permitted units and three tool-neutral logical result formats;
- preserves immutable values, raw differences, method, evidence, and full provenance;
- consumes only an approved normalization manifest and distinguishes Safe Area from outside/excluded areas;
- separates raw measurement, governed classification, defect creation, and certification;
- defines eight sequential Quality Gates;
- exposes real risks and open decisions without inventing thresholds or selecting tools;
- provides the canonical upstream contract for LOT-005.

Open operational method, precision, tool, serialization, and tolerance decisions block only their dependent measurement execution or interpretation. They do not invalidate the architecture of the model.

Authorization outcome:

- Home and DEF-008 measurement: `NOT AUTHORIZED`;
- capture, overlay, Pixel Diff, defect correction, certification, and baseline: `NOT AUTHORIZED`;
- code, scripts, tools, dependency installation, and source modification: `NOT AUTHORIZED`;
- `LOT-005 — Overlay and Diff Model`: `AUTHORIZED` under a distinct Mission Order.

No code, script, capture, measurement, overlay, Pixel Diff, certification, baseline, PROGRAM-036 file, existing PROGRAM-037 source, reference, or frontend file was created, modified, or executed outside this single document.

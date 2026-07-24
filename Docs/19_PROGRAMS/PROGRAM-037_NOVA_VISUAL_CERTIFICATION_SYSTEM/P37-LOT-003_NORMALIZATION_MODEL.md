# 1 Document Control

| Field | Value |
|---|---|
| Document ID | `P37-LOT-003_NORMALIZATION_MODEL` |
| Mission ID | `P37-MO-003-NORMALIZATION-MODEL` |
| Program | `PROGRAM-037 — NOVA Visual Certification System` |
| Lot | `LOT-003 — Normalization Model` |
| Document type | Normative geometric-normalization architecture |
| Status | `APPROVED` |
| Effective date | 2026-07-14 |
| Owner | PROGRAM-037 |
| Governance authority | `P37-DR-001 — Visual Certification Governance` |
| Entry dependency | LOT-002 Reference Intake approved |
| Exit Gate | `GATE-P37-NORMALIZATION-INTEGRITY` |
| Verdict | `NORMALIZATION MODEL APPROVED` |
| Mission exclusions | No code, script, capture, image transformation, measurement, overlay, Pixel Diff, certification, baseline, or DEF-008 action |

This document normalizes coordinate spaces and eligibility zones only. It does not alter, generate, measure, or compare source pixels.

## 1.1 Table of contents

1. Document Control
2. Purpose
3. Scope
4. Definitions
5. Fundamental Principle
6. Normalization Pipeline
7. Coordinate Spaces
8. Common Comparison Area
9. Outside and Excluded Areas
10. Alignment and Coordinate Mapping
11. Non-Destructive Cropping
12. Figma 1920 × 995 Case
13. Transformation Governance
14. Normalization Manifest
15. Quality Gates
16. Risk Register
17. Open Decisions
18. Final Verdict

## 1.2 Normative sources

The following sources were read in full:

- `PROGRAM_037_PROGRAM_ARCHITECTURE.md`;
- `P37-DR-001_VISUAL_CERTIFICATION_GOVERNANCE.md`;
- `P37-LOT-000_PROGRAM_READINESS.md`;
- `P37-LOT-001_CAPTURE_CONTRACT.md`;
- `P37-LOT-002_REFERENCE_INTAKE.md`;
- `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`;
- `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`;
- `NOVA_UX_AUDIT_REPORT.md`.

The current Home visual inventory was analyzed read-only. Home V7 exists natively at `1920 × 995`. Historical V2–V6 images and a different Home control interface also exist. No official NOVA Home runtime capture and no image with dimensions `1920 × 1080` were found in the repository. Consequently, this Lot defines but does not execute the Home normalization.

# 2 Purpose

The Normalization Model defines a common geometric language for an immutable official reference and an immutable official runtime capture when their dimensions, viewport bounds, content bounds, or visible zones differ.

It enables later PROGRAM-037 Lots to:

- place reference and runtime coordinate systems into one logical normalized system;
- prove which pixels correspond;
- distinguish common, reference-only, runtime-only, excluded, visible, content, and safe areas;
- express offsets without moving source pixels;
- create reproducible measurement, overlay, and difference inputs later;
- refuse comparison when origins, scale, viewport, or correspondence cannot be proven.

Normalization is not visual correction. It cannot make an invalid reference or capture valid.

# 3 Scope

This model governs:

- definitions of spaces, coordinate systems, origins, axes, units, bounds, anchors, mappings, offsets, and areas;
- computation and documentation of the Common Comparison Area;
- treatment of `OUTSIDE_REFERENCE`, `OUTSIDE_RUNTIME`, exclusions, and safe areas;
- alignment of full viewport, content, partial, scrolled, and multi-capture evidence;
- logical translations and 1:1 coordinate mapping;
- non-destructive view/crop eligibility;
- the native Home V7 `1920 × 995` versus runtime `1920 × 1080` case;
- normalization manifests, Gates, risks, and open decisions.

This model does not:

- modify reference or runtime bytes;
- approve a reference or capture that failed its upstream contract;
- create normalized raster artefacts in this mission;
- measure component geometry or DEF-008;
- produce overlays or Pixel Diffs;
- define numeric visual tolerances;
- select or install tools;
- correct Home or any frontend file;
- create or freeze a baseline;
- modify PROGRAM-036 or existing PROGRAM-037 documents.

# 4 Definitions

## 4.1 Glossary

| Term | Precise definition |
|---|---|
| Reference Space | Native two-dimensional image-pixel space of the immutable official reference, including its known valid and missing bounds |
| Runtime Space | Native two-dimensional image-pixel space of the immutable contract-compliant runtime capture |
| Common Comparison Area | Intersection of valid, mapped, in-scope reference and runtime areas after origin and 1:1 scale correspondence are proven |
| Outside Reference Area | Mapped runtime area with no corresponding valid reference pixels; canonical label `OUTSIDE_REFERENCE` |
| Outside Runtime Area | Mapped reference area with no corresponding valid runtime pixels; canonical label `OUTSIDE_RUNTIME` |
| Reference Origin | Native reference coordinate `(0,0)`, normally the top-left pixel boundary of the original image |
| Runtime Origin | Native runtime coordinate `(0,0)`, normally the top-left pixel boundary of the original capture image |
| Normalization Origin | Logical `(0,0)` chosen for the normalized coordinate system from an approved origin rule and anchor mapping; it does not move image bytes |
| Viewport | Browser content viewport in CSS pixels, distinct from output image resolution, window size, page size, and reference export size |
| Content Area | Declared rectangle(s) containing the governed application content inside an image; it may be smaller than visible image bounds but cannot be inferred silently |
| Visible Area | Native image bounds actually present in the file, after recorded orientation interpretation and before any logical selection |
| Safe Area | Common Comparison Area minus approved excluded areas; only this area is eligible for later pixel-level comparison |
| Measurement Space | Normalized coordinate system and safe-area labels exposed to LOT-004 for measurements; no measurement is made by this Lot |
| Valid Area | Pixels whose provenance, bounds, source state, and capture/reference integrity are approved for the declared scope |
| Excluded Area | Named area inside or related to the common space that an approved policy removes from a later comparison denominator; exclusion never deletes evidence |
| Anchor | Approved, reproducible point or line identifiable in both sources and used to prove correspondence or validate origin mapping |
| Offset | Signed logical translation between an input coordinate system and the Normalized Coordinate System |
| Logical Crop | Non-destructive rectangle selection over an immutable parent; it changes eligibility/view bounds, not parent pixels |
| Destructive Crop | Removal or rewriting of source pixels or replacement of the original with a smaller raster; forbidden |
| Mapping | Recorded reversible relationship from input coordinates to normalized coordinates, limited by this model to identity scale plus logical translation |
| Scale Compatibility | Proof that one image pixel represents the same comparison sampling interval in both mapped inputs; equal image width alone is not proof |
| `NO_SOURCE_DATA` | Area for which no authoritative source pixels exist; it is documented and never imputed |

## 4.2 Set notation

For a reference with native width `wR` and height `hR`, its visible native bounds are:

`BR = [0, wR) × [0, hR)`.

For a runtime with native width `wU` and height `hU`, its visible native bounds are:

`BU = [0, wU) × [0, hU)`.

`VR` and `VU` are the approved valid subsets of `BR` and `BU`. They exclude only areas proven missing, corrupt, outside declared capture/reference scope, or otherwise invalid by upstream evidence.

Logical mappings `TR` and `TU` place `VR` and `VU` in the Normalized Coordinate System. This model permits identity scale plus translation only:

- `TR(x,y) = (x + dxR, y + dyR)`;
- `TU(x,y) = (x + dxU, y + dyU)`.

No values are calculated in this architecture mission. The notation defines the future manifest contract.

# 5 Fundamental Principle

## 5.1 Immutable originals

The official reference must never be:

- resized;
- stretched;
- compressed or recompressed;
- distorted or warped;
- resampled or interpolated;
- rotated or skewed;
- destructively cropped;
- padded with invented pixels;
- edited, enhanced, recolored, or regenerated.

The runtime capture is also immutable. It is never resized, cropped in place, corrected, retouched, or altered to resemble the reference.

PROGRAM-037 normalizes only:

- coordinate-system declarations;
- logical origin placement;
- reversible mapping metadata;
- valid/common/outside/excluded-area classification;
- logical views derived from immutable parent bounds.

If a later normalized raster representation is authorized, it must copy eligible parent pixels 1:1 into a separately identified derived artefact, preserve both parents, identify every non-source canvas area, and record parent hashes and mapping. It must not resample or substitute pixels.

## 5.2 Fail-closed rule

When scale, origin, anchor, viewport, crop, or source correspondence is uncertain, normalization does not guess. The affected Gate fails or remains pending, and overlay, Pixel Diff, measurement, and certification cannot consume the ambiguous area.

## 5.3 Upstream integrity rule

Normalization begins only after:

- the reference passed Reference Intake and is `OFFICIAL` for the declared scope;
- the runtime passed the Capture Contract and is `RUNTIME_CAPTURE_RECEIVED`;
- hashes and immutable identities are available;
- screen, state, theme, locale, route, data, viewport, and modality are compatible or their differences are explicitly governed.

Normalization cannot repair a failed upstream Gate.

# 6 Normalization Pipeline

## 6.1 Pipeline diagram

```text
OFFICIAL REFERENCE + OFFICIAL RUNTIME CANDIDATE
  ↓
REFERENCE / CAPTURE VALIDATION STATUS CHECK
  ↓
BYTE, HASH, DIMENSION, VIEWPORT, STATE, AND SCOPE INTEGRITY CHECK
  ↓
DECLARE REFERENCE SPACE AND RUNTIME SPACE
  ↓
PROVE SCALE COMPATIBILITY AND SELECT APPROVED COMMON ANCHORS
  ↓
DEFINE LOGICAL ORIGINS, AXES, OFFSETS, AND COORDINATE MAPPINGS
  ↓
MAP VALID AREAS INTO NORMALIZED COORDINATE SYSTEM
  ↓
CALCULATE COMMON COMPARISON AREA
  ↓
CLASSIFY OUTSIDE_REFERENCE, OUTSIDE_RUNTIME, AND EXCLUDED AREAS
  ↓
FREEZE SAFE AREA AND NORMALIZATION MANIFEST
  ↓
EXPOSE MEASUREMENT SPACE TO LOT-004
  ↓
OVERLAY MODEL (LOT-005)
  ↓
PIXEL DIFFERENCE MODEL (LOT-005)
  ↓
CERTIFICATION GATES (LATER LOTS)
```

This pipeline is sequential. References to measurement, overlay, Diff, and certification are downstream interfaces, not actions executed here.

## 6.2 Pipeline decisions

| Stage | Decision |
|---|---|
| Inputs | Accept only immutable, hashed, scope-compatible upstream PASS artefacts |
| Validation | Recheck status and manifest linkage without modifying inputs |
| Integrity | Confirm dimensions, hashes, viewport/output interpretation, orientation, modality, state, and scale evidence |
| Coordinate mapping | Apply only approved translation/identity mapping; record anchors and offsets |
| Normalization | Build logical common coordinate description, not corrected images |
| Common Area | Intersect mapped valid areas and declared certification scope |
| Measurement Space | Publish coordinate/zone model for later measurement |
| Overlay/Diff | Allowed later only over Safe Area and with separate Gates/tools |
| Certification | Possible later only when every prior integrity and evidence Gate passes |

# 7 Coordinate Spaces

Exactly five canonical coordinate systems are defined.

## 7.1 Coordinate-space matrix

| ID | Coordinate system | Native unit | Origin and axes | Purpose | Prohibitions |
|---|---|---|---|---|---|
| `CS-001` | Reference Coordinate System (`RCS`) | Reference image pixels | `(0,0)` top-left boundary; `+X` right, `+Y` down | Address immutable native reference pixels and declared valid/content bounds | No runtime coordinates, resize, assumed viewport, or changed origin in the original |
| `CS-002` | Runtime Coordinate System (`UCS`) | Runtime output image pixels | `(0,0)` top-left boundary; `+X` right, `+Y` down | Address immutable runtime pixels, viewport mapping, scroll/region extent, and valid area | No reference coordinates, post-capture resize, or browser-CSS assumption without DPR proof |
| `CS-003` | Normalized Coordinate System (`NCS`) | Logical comparison pixels at proven 1:1 scale | Approved Normalization Origin; `+X` right, `+Y` down | Express logical placements, offsets, common/outside/excluded areas | No scaling, warping, invented pixels, or ambiguous fractional raster placement |
| `CS-004` | Measurement Coordinate System (`MCS`) | NCS units plus semantic region/anchor labels | Same geometric origin/axes as NCS unless a separately recorded local component frame is used | Feed LOT-004 with stable coordinates, area eligibility, and provenance | No measurements or tolerances are assigned by this Lot |
| `CS-005` | Overlay Coordinate System (`OCS`) | Output visualization pixels mapped 1:1 to Safe Area/NCS | Same approved origin/axes as the overlay manifest | Feed LOT-005 visualization while retaining no-source/exclusion labels | No overlay is produced here; no opacity, canvas, or tool assumed |

## 7.2 Spaces diagram

```text
REFERENCE SPACE (RCS)                 RUNTIME SPACE (UCS)
┌────────────────────┐                ┌────────────────────────┐
│ VR: valid pixels   │                │ VU: valid pixels       │
│ missing/invalid    │                │ missing/invalid        │
└─────────┬──────────┘                └───────────┬────────────┘
          │ TR: identity + translation           │ TU: identity + translation
          └──────────────────┬───────────────────┘
                             ↓
                  NORMALIZED SPACE (NCS)
              ┌───────────────────────────────┐
              │ TR(VR) ∩ TU(VU) = Common     │
              │ TU(VU) \ TR(VR) = Outside Ref│
              │ TR(VR) \ TU(VU) = Outside Run│
              └──────────────┬────────────────┘
                             ↓ subtract approved exclusions
                        SAFE AREA
                             ↓
             MCS (LOT-004) and OCS (LOT-005)
```

## 7.3 Coordinates diagram

```text
RCS origin R0 (0,0)          UCS origin U0 (0,0)
       +X →                        +X →
   +Y  reference pixels       +Y  runtime pixels
   ↓                          ↓

Approved anchors establish logical translations:
R anchor + (dxR,dyR) ─┐
                      ├─→ same NCS anchor coordinate
U anchor + (dxU,dyU) ─┘

NCS origin N0 (0,0)
       +X →
   +Y  mapped logical space
   ↓
```

Equal axes do not prove equal origins. Equal width does not prove equal scale. Both require evidence.

## 7.4 Viewport, visible, content, and safe-area distinction

| Concept | Source | May differ from image bounds? | Certification role |
|---|---|---:|---|
| Viewport | Capture metadata, CSS pixels | Yes, because DPR/output mapping or capture modality can differ | Must be proven before mapping runtime pixels |
| Visible Area | Native image bounds | No by definition | Establishes pixels physically present |
| Content Area | Approved manifest rectangle(s) | Yes | Limits governed application content; cannot hide required UI |
| Common Comparison Area | Intersection in NCS | Yes | Establishes corresponding sourced area |
| Safe Area | Common Area minus approved exclusions | Yes | Only area eligible for later pixel-level comparison |
| Measurement Space | NCS/MCS description | Not a raster bound by itself | Carries coordinates and eligibility to LOT-004 |

# 8 Common Comparison Area

## 8.1 Definition

The Common Comparison Area (`CCA`) is the largest or explicitly scoped set of mapped pixels for which PROGRAM-037 can prove all of the following:

- a valid official reference pixel exists;
- a valid official runtime pixel exists;
- both represent the same declared screen/state/region;
- scale and orientation are compatible without resampling;
- coordinate origins and offsets are proven;
- the area belongs to the authorized certification scope;
- no upstream integrity rule invalidates it.

It is not automatically the smaller image, the intersection of raw image dimensions, the central crop, or the content that “looks similar.”

## 8.2 Calculation model

Let `SR` be the approved reference scope and `SU` the approved runtime scope mapped into NCS. Let `SA` be the authorized certification scope. Then:

`CCA = TR(VR ∩ SR) ∩ TU(VU ∩ SU) ∩ SA`.

Let `E` be the union of separately approved excluded areas inside `CCA`. Then:

`SAFE = CCA \ E`.

The model does not calculate actual coordinates in this Lot. A future normalization run must record exact integer rectangles or polygons, parent spaces, mappings, and reasons.

## 8.3 Calculation procedure

1. verify immutable input hashes and upstream PASS states;
2. declare native RCS/UCS bounds and units;
3. establish viewport/output/DPR interpretation for runtime;
4. declare valid, visible, content, missing, partial, and requested-scope areas;
5. prove orientation and 1:1 scale compatibility;
6. select approved common anchors and establish translations;
7. map valid areas into NCS;
8. intersect mapped valid areas with authorized scope;
9. classify reference-only and runtime-only differences outside the intersection;
10. apply only approved exclusions to derive Safe Area;
11. record all rectangles/polygons, offsets, anchors, hashes, and decisions;
12. require independent validation and Gate approval.

## 8.4 Documentation and use

Every CCA record includes:

- coordinate system and normalization version;
- exact area geometry and units;
- parent Reference ID/Runtime ID and hashes;
- input valid/content/visible bounds;
- origins, anchors, mappings, signed offsets, and scale proof;
- authorized scope and modality;
- `OUTSIDE_REFERENCE`, `OUTSIDE_RUNTIME`, exclusions, and Safe Area;
- validator, Gate results, reason, timestamp, and manifest hash.

Only the Safe Area may feed later pixel-level comparison. CCA does not by itself prove visual conformity.

# 9 Outside and Excluded Areas

## 9.1 Zone matrix

| Zone | Set definition in NCS | Meaning | Pixel Diff participation | Required treatment |
|---|---|---|---|---|
| `COMMON_COMPARISON_AREA` | `TR(VR) ∩ TU(VU) ∩ scope` | Corresponding valid source/runtime area | Eligible before exclusions | Record exact bounds and provenance |
| `SAFE_AREA` | `CCA \ E` | Common area after approved exclusions | Yes, when later tool/tolerance Gates permit | Freeze denominator and manifest |
| `OUTSIDE_REFERENCE` | `TU(VU) \ TR(VR)` within mapped scope/union | Runtime pixels have no reference counterpart | No | Document; never label PASS/FAIL from absent source |
| `OUTSIDE_RUNTIME` | `TR(VR) \ TU(VU)` within mapped scope/union | Reference pixels have no runtime counterpart | No | Document; investigate incomplete/short capture or missing runtime content |
| `EXCLUDED_AREA` | Approved `E ⊆ CCA` or separately governed non-common area | Known area omitted by a formal exclusion policy | No | Minimal, named, justified, versioned, authority-approved |
| `NO_SOURCE_DATA` | Area with no authoritative source pixels | Absence of source evidence | No | Preserve as unknown; obtain source if certification is required |
| `INVALID_INPUT_AREA` | Corrupt, ambiguous, hidden-crop, or contract-failing input subset | Cannot participate in normalization | No | Fail affected Gate; cannot be converted into exclusion to bypass failure |
| `CONTENT_OUTSIDE_SCOPE` | Valid pixels outside Mission Order scope | Present but not certified in this run | No for current run | Document scope boundary; does not imply conformance |

## 9.2 `OUTSIDE_REFERENCE`

`OUTSIDE_REFERENCE` is present in runtime but absent from the official reference after valid mapping. It:

- is preserved and documented with runtime coordinates and mapped NCS bounds;
- does not enter CCA, Safe Area, Pixel Diff numerator, or Pixel Diff denominator;
- cannot be considered visually correct or defective from the absent reference;
- cannot be hidden by stretching, padding, extrapolating, or repeating reference pixels;
- may trigger a request for an additional official reference if product scope requires certification;
- may remain an accepted no-source zone only with explicit scope and Design Authority acknowledgement.

## 9.3 `OUTSIDE_RUNTIME`

`OUTSIDE_RUNTIME` exists when official reference pixels have no runtime counterpart. It:

- is preserved in the manifest with reference and NCS bounds;
- does not enter Pixel Diff because no runtime pixel exists;
- never counts as a match;
- requires investigation of viewport, scroll, partial capture, hidden content, state, or incomplete runtime;
- blocks complete screen certification when it intersects required scope;
- may be accepted outside the current run only if the Mission Order explicitly excludes that content and the exclusion does not conceal required UI.

## 9.4 Exclusions and masks

An excluded area is not equivalent to an outside area. It lies inside otherwise comparable scope and needs separate authority.

Rules:

- exclusions are minimal and atomic;
- each has ID, geometry, reason, owner, source evidence, approval, version, expiry/review, and affected metrics;
- a mask cannot repair an invalid reference/capture, wrong route, active animation, missing font, wrong origin, or bad offset;
- exclusion area is reported separately and never counted as matching;
- broad or overlapping exclusions trigger Gate failure;
- no exclusion is approved by this Lot; the operational mask policy remains open.

# 10 Alignment and Coordinate Mapping

## 10.1 Alignment objects

Alignment defines:

- input origins and axes;
- unit and pixel-boundary convention;
- viewport-to-output mapping;
- valid/content/visible bounds;
- common anchors;
- signed logical offsets;
- margins, padding, shell, and content boundaries as observed properties rather than removable whitespace;
- normalization origin and authorized scope.

Alignment never changes CSS, content, margins, padding, or pixels. A margin difference remains a measurable difference inside Safe Area; it is not removed merely to make inner content coincide.

## 10.2 Origin rules

1. RCS and UCS native origins remain `(0,0)` at their original top-left pixel boundaries.
2. NCS origin is selected by an approved rule and recorded; it cannot be changed after results are seen.
3. Full-viewport top-left alignment may be used only when both artefacts represent the same viewport origin and scale.
4. A cropped/partial reference or runtime requires its parent rectangle and offset; its local `(0,0)` is not treated as global `(0,0)`.
5. Scrolled captures require document scroll offsets and treatment of fixed/sticky regions; viewport coordinates alone are insufficient.
6. Component-local origins may be used in MCS later, but must remain linked to NCS and cannot replace screen-level provenance.

## 10.3 Anchor hierarchy

Candidate anchors are approved per screen/profile, not invented during comparison. The hierarchy is:

1. explicit common viewport origin when provenance proves it;
2. explicit common content-frame boundary documented by both source manifests;
3. stable shell/region axes or corners with unique identity;
4. stable component anchors with exact state correspondence.

At least one anchor establishes a translation; additional independent anchors must validate that no scale, rotation, skew, crop, or wrong region is being concealed. If validation anchors disagree, mapping fails. Text baselines, antialiased edges, shadows, and transient content are unsuitable unless a later approved profile explicitly validates them.

## 10.4 Offset rules

- offsets are signed and recorded separately for X and Y;
- offset units and source/target coordinate systems are explicit;
- offsets are derived before visual verdict and cannot be tuned to minimize Diff;
- integer image-pixel offsets are required for raster alignment under this model;
- any fractional CSS/image mapping remains an open decision and blocks raster overlay/Diff until governed;
- an offset does not erase the fact that origins differ; both native and mapped coordinates remain available;
- changing an offset creates a new normalization-manifest version and invalidates downstream evidence.

## 10.5 Margins, padding, viewport, and useful content

- viewport bounds establish capture extent, not content equivalence;
- content/useful bounds require manifest evidence and Design Authority where reference-derived;
- margins and padding inside common sourced content remain eligible comparison facts;
- blank pixels are source pixels when present; they are not automatically removable whitespace;
- browser chrome or invalid capture areas cannot be cropped away to make a failed runtime acceptable;
- safe-area selection cannot bypass required shell or content regions.

# 11 Non-Destructive Cropping

## 11.1 Authorized logical crop

A logical crop is authorized only when all conditions pass:

- both immutable parents already passed upstream integrity;
- the Mission Order scopes a specific viewport, content rectangle, partial region, scroll segment, or common area;
- exact source rectangle, coordinate system, origin, width, height, and parent hash are known;
- crop purpose is normalization/scope selection, not correction;
- all omitted areas are classified as outside scope, outside source, or separately approved exclusions;
- reference and runtime selections are mapped independently from original parents;
- Design Authority validates reference useful-content bounds where required;
- Evidence Validator approves traceability;
- derived views, if later materialized, carry new hashes and never replace originals.

## 11.2 Forbidden crop

Cropping is forbidden when it:

- modifies or replaces the original reference/runtime;
- hides a wrong viewport, route, state, font, overlay, animation, browser chrome, missing content, or capture failure;
- removes a visible mismatch merely to improve a score;
- is based on guessed margins or visual convenience;
- is performed twice through a derived-parent chain without returning to original coordinates;
- makes a partial capture appear complete;
- discards `OUTSIDE_REFERENCE` or `OUTSIDE_RUNTIME` without recording them;
- lacks exact bounds, parent hash, authority, reason, or manifest version.

## 11.3 Double-crop prevention

Every logical selection is defined directly in the immutable parent coordinate system. A derived view cannot become the unrecorded parent of another crop. Composed selections must be reduced to one parent-relative rectangle/polygon, with every intermediate mapping retained as evidence.

# 12 Figma 1920 × 995 Case

## 12.1 Known inputs and absent execution evidence

Known reference facts:

- Home V7 file: `NOVA-HOME-V7.png`;
- Reference Resolution: `1920 × 995`;
- Reference Height: `995` image pixels;
- immutable reference SHA-256: `D6ADEA2EF7887315C6CC023280AB0307F9494BB6928091314030B53213678A08`.

Program capture target for the Home pilot:

- Runtime Resolution/Viewport target: `1920 × 1080` under the approved Capture Profile;
- Runtime Height: `1080` only when an official capture proves this output/viewport mapping.

No official runtime file currently exists. Therefore no mapping, common rectangle, offset, overlay, measurement, DEF-008 result, or Diff is produced here.

## 12.2 Conditional canonical mapping

Only if later evidence proves:

- reference and runtime orientations match;
- one image pixel maps 1:1 across the intended comparison axes;
- both top-left origins correspond to the same viewport origin;
- reference valid area is the full `1920 × 995` native rectangle;
- runtime valid area includes the full `1920 × 1080` rectangle;
- screen/state/scope are compatible;

then the normalization manifest may declare:

| Field | Conditional value |
|---|---:|
| Reference Width | `1920` |
| Reference Height | `995` |
| Runtime Width | `1920` |
| Runtime Height | `1080` |
| Reference Origin | `(0,0)` in RCS |
| Runtime Origin | `(0,0)` in UCS |
| Normalization offsets | Reference `(0,0)`, runtime `(0,0)` |
| Common Width | `1920` |
| Common Height | `995` |
| Common Area | NCS rectangle `[0,1920) × [0,995)` |
| `OUTSIDE_REFERENCE` | Runtime/NCS rectangle `[0,1920) × [995,1080)`, size `1920 × 85` |
| `OUTSIDE_RUNTIME` | Empty for the declared full reference bounds |

These values are a conditional model derived from the stated dimensions, not an executed normalization result. Equal width and target dimensions alone do not authorize them.

## 12.3 Different-origin case

If runtime or reference content begins at a different logical origin, the normalization process must:

1. retain both native origins;
2. prove common anchors;
3. calculate signed translations under LOT-004/authorized execution evidence;
4. map valid bounds into NCS;
5. recompute CCA as their mapped intersection;
6. document both outside areas;
7. fail if validation anchors imply scale, skew, rotation, or ambiguous crop.

The model never vertically stretches 995 pixels to 1080, never invents the missing 85 rows, and never assumes that extra runtime height belongs below the reference without origin proof.

## 12.4 Runtime-smaller and reference-smaller cases

- When reference is smaller, unmatched valid runtime area becomes `OUTSIDE_REFERENCE`.
- When runtime is smaller, unmatched valid reference area becomes `OUTSIDE_RUNTIME` and blocks certification if required scope is missing.
- When both differ on multiple edges, outside areas may exist on left, right, top, and bottom; they are calculated after mapping, not assumed to be bottom-only.
- When input is partial/scrolled, bounds are mapped using parent/scroll offsets; a partial image is never treated as a full viewport.

# 13 Transformation Governance

## 13.1 Transformations diagram

```text
ALLOWED (metadata / logical space only)
RCS ── identity mapping + signed translation ──→ NCS
UCS ── identity mapping + signed translation ──→ NCS
NCS ── area intersection/classification ───────→ CCA / SAFE / OUTSIDE

FORBIDDEN (pixel-changing or geometry-changing)
source pixels ─X→ scale / resize / stretch / warp / destructive crop
source pixels ─X→ rotation / skew / compression / resampling / pixel synthesis
```

## 13.2 Authorized transformations

Exactly three transformation classes are authorized.

| ID | Transformation | Definition | Conditions | Pixel effect |
|---|---|---|---|---|
| `TX-A-001` | Logical translation | Add a recorded signed X/Y offset to coordinates when placing a source space in NCS | Common anchors, identity scale, units, origins, and validator approval | None |
| `TX-A-002` | Alignment | Select and validate a common origin/axis/anchor relationship before mapping | Predeclared anchor policy; validation anchors agree; no score-driven tuning | None |
| `TX-A-003` | Identity coordinate mapping | Re-express approved source coordinates/areas in NCS/MCS/OCS at 1:1 scale and classify intersections/differences | Reversible mapping, parent hashes, exact bounds, scale proof | None |

Logical crop is an area selection, not a geometric transformation. It is governed separately by Section 11.

## 13.3 Forbidden transformations

Exactly ten transformation classes are forbidden.

| ID | Forbidden transformation | Prohibition |
|---|---|---|
| `TX-F-001` | Scale | No scale factor other than proven identity may be applied to reference or runtime pixels |
| `TX-F-002` | Resize | No width/height change of either source image |
| `TX-F-003` | Stretch | No independent horizontal or vertical extension/compression |
| `TX-F-004` | Warp/distortion | No nonlinear displacement, perspective correction, mesh, or content-aware alignment |
| `TX-F-005` | Destructive crop | No deletion/replacement of original pixels or original file by a smaller raster |
| `TX-F-006` | Rotation | No pixel rotation to force orientation or alignment |
| `TX-F-007` | Skew/shear | No axis shear or slant correction |
| `TX-F-008` | Compression/recompression | No lossy or pixel-changing recompression, optimization, or encoding substitution |
| `TX-F-009` | Resampling/interpolation | No nearest, bilinear, bicubic, Lanczos, antialiasing resample, or pixel-density conversion |
| `TX-F-010` | Pixel synthesis/editing | No padding with invented content, generative extension, cloning, repetition, recoloring, enhancement, or retouching |

## 13.4 Transformation matrix

| Operation request | Status | Required response |
|---|---|---|
| Move logical coordinate origin | Allowed as `TX-A-001` with manifest |
| Align common verified anchors | Allowed as `TX-A-002` |
| Map coordinates and areas 1:1 | Allowed as `TX-A-003` |
| Select a non-destructive parent-relative rectangle | Conditionally allowed under Section 11, not a transform |
| Change image dimensions or pixel sampling | Forbidden |
| Change pixels, color, compression, or geometry | Forbidden |
| Hide invalid/missing area through a mask | Forbidden; Gate failure |
| Produce overlay/Diff/measurement now | Outside scope and forbidden in this mission |

# 14 Normalization Manifest

## 14.1 Minimum manifest content

| Field group | Mandatory fields |
|---|---|
| Identity | Normalization Run ID, Mission Order, Screen ID, state/profile, Normalization Version, status |
| Reference | Reference ID/version, native filename, SHA-256, byte length, resolution, visible/valid/content bounds, viewport if known |
| Runtime | Runtime ID/run/version, native filename, SHA-256, byte length, output resolution, CSS viewport, DPR, zoom, modality, scroll/region bounds |
| Coordinate systems | RCS/UCS/NCS/MCS/OCS versions, units, origin definitions, axes, pixel-boundary convention |
| Compatibility | orientation proof, scale/DPR/output mapping, screen/state/theme/locale/data compatibility, capture/reference Gate links |
| Anchors | Anchor IDs/types, reference/runtime coordinates, evidence, selection authority, validation-anchor result |
| Mappings | `TR`/`TU` definitions, signed offsets, identity-scale declaration, reversibility, mapping status |
| Common Area | CCA geometry, authorized scope, width/height/area, parent bounds, computation rule |
| Outside areas | Every `OUTSIDE_REFERENCE`, `OUTSIDE_RUNTIME`, `NO_SOURCE_DATA`, invalid, and out-of-scope geometry with reason |
| Exclusions | Exclusion/mask IDs, geometry, reason, authority, version, expiry/review, denominator impact |
| Safe Area | Exact geometry or region set, valid-pixel eligibility, relationship to CCA/exclusions |
| Logical selections | Parent-relative crop/view rectangles, parent hashes, purposes, omitted-area classifications |
| Integrity | Manifest SHA-256, input hashes, any future derived artefact hashes, immutable storage/version identity |
| Authority | Producer/model executor, Evidence Validator, Design reviewer where applicable, Gate results, timestamps, signatures |
| Conflicts | Open/resolved mapping, crop, viewport, origin, source, capture, exclusion, or authority conflicts |
| Downstream | Measurement/overlay/diff eligibility, invalidation triggers, superseded manifest links |

The user-required minimum is always present: Reference ID, Runtime ID, Viewport, Reference Resolution, Runtime Resolution, Common Area, Offsets, Excluded Areas, Hash, and Normalization Version.

## 14.2 Manifest states

| State | Meaning |
|---|---|
| `DRAFT` | Inputs/coordinate declarations are being assembled; no downstream use |
| `VALIDATION_PENDING` | Complete manifest awaits independent Gate review |
| `APPROVED` | All normalization Gates pass; Safe Area may feed LOT-004 |
| `REJECTED` | Mapping/integrity failed; no downstream use |
| `SUPERSEDED` | A newer approved normalization manifest replaces it; retained for audit |
| `INVALIDATED` | Input, profile, mapping, exclusion, or authority change makes it inapplicable |

No manifest file is created by this mission. This section defines future content only.

## 14.3 Versioning and hashes

- input hashes are reverified, never recalculated from modified images;
- any changed input, origin, anchor, offset, area, exclusion, coordinate convention, or normalization rule creates a new manifest version;
- downstream measurement/overlay/Diff evidence links the exact approved manifest hash;
- manifest replacement never overwrites prior evidence;
- no future normalized output can share a parent image hash unless its bytes are actually identical;
- invalidation propagates to all dependent evidence and certification decisions.

# 15 Quality Gates

Exactly seven normalization Quality Gates operationalize `GATE-P37-NORMALIZATION-INTEGRITY`.

## 15.1 Gate matrix

| Gate | Objective | Entry | Controls | PASS output | FAIL output |
|---|---|---|---|---|---|
| `NORMALIZATION_INPUT` | Prove both inputs are eligible and scope-compatible | Official Reference ID, accepted Runtime ID, Mission Order, hashes, manifests | upstream states/Gates, screen/state/profile, hashes, modality, authority | Immutable eligible input pair and normalization run opened | `REJECTED`; no mapping or derived work |
| `NORMALIZATION_REFERENCE` | Prove RCS, native bounds, valid/content areas, origin, orientation, and native policy | Input Gate PASS | reference hash/resolution/viewport/bounds/crop/completeness/source authority | Frozen RCS and valid reference scope | FAIL if altered, incomplete, ambiguous, stretched, or unauthorized |
| `NORMALIZATION_RUNTIME` | Prove UCS, output/viewport/DPR mapping, valid/content areas, origin, modality, and stability | Input Gate PASS | runtime hash, Capture Contract Gates, resolution, viewport, scroll/region/state | Frozen UCS and valid runtime scope | FAIL if capture invalid, partial/scroll mapping unknown, or altered |
| `COMMON_AREA` | Establish corresponding sourced intersection without resizing | Reference/Runtime Gates PASS; candidate anchors available | orientation, scale proof, mapped valid areas, authorized scope, conditional intersections | Exact CCA geometry and provenance | FAIL/PENDING when correspondence or required area is absent |
| `COORDINATE_MAPPING` | Prove origins, axes, anchors, translations, and 1:1 reversible mapping | Common-area candidate exists | anchor policy, signed offsets, validation anchors, no scale/rotation/skew/fractional ambiguity | Approved `TR`/`TU`, NCS origin, mapping record | FAIL if anchors disagree, scale differs, offsets are tuned/ambiguous |
| `EXCLUDED_AREAS` | Prove every outside, no-source, invalid, out-of-scope, and excluded area is minimal and explicit | Mapping and CCA available | zone taxonomy, geometries, reasons, authority, mask policy, denominator impact | Frozen Safe Area plus separately reported outside/excluded sets | FAIL if hidden, broad, unapproved, overlapping ambiguously, or used to cure invalid input |
| `NORMALIZATION_APPROVED` | Authorize manifest for LOT-004 and later consumption | All prior Gates PASS; manifest complete and hashed | full traceability, conflicts, validator independence, version/invalidation rules | Manifest state `APPROVED`; MCS/eligibility exposed to LOT-004 | `REJECTED` or `VALIDATION_PENDING`; no measurement/overlay/Diff/certification |

## 15.2 Gate order

```text
NORMALIZATION_INPUT
  ↓
NORMALIZATION_REFERENCE + NORMALIZATION_RUNTIME
  ↓
COMMON_AREA
  ↓
COORDINATE_MAPPING
  ↓
EXCLUDED_AREAS
  ↓
NORMALIZATION_APPROVED
```

Reference and Runtime Gates may be assessed in parallel only as read-only checks after the input pair is frozen. All other Gates are sequential. This Lot approves their design but applies none to an actual runtime.

# 16 Risk Register

Exactly twelve real normalization risks are registered.

| ID | Risk | Evidence/context | Impact | Control | Current status |
|---|---|---|---|---|---|
| `R-NRM-001` | Reference is smaller than runtime | Home V7 is 995 px high; target runtime is 1080 px | Runtime-only area may be compared falsely | `OUTSIDE_REFERENCE`, common intersection, no stretching | CONFIRMED and governed |
| `R-NRM-002` | Runtime is smaller than reference | Valid inverse case required by mission | Required reference content may be absent | `OUTSIDE_RUNTIME`; block complete certification when in scope | MODELLED |
| `R-NRM-003` | Double crop loses parent coordinates | Partial/scrolled/derived views can be cropped repeatedly | Wrong origins and hidden omitted areas | Parent-relative logical selection and composition rule | MODELLED |
| `R-NRM-004` | Wrong origin | Equal dimensions can mask different viewport/content origins | Global false offset or false match | Origin provenance and multiple-anchor validation | REAL |
| `R-NRM-005` | Incorrect offset | Offset can be tuned to minimize visual differences | Evidence manipulation | Predeclared anchors, signed offsets, mapping version/Gate | REAL |
| `R-NRM-006` | Incomplete reference | Figma source metadata/frames and some exports are incomplete | Missing source treated as mismatch or match | Reference Intake completeness and `NO_SOURCE_DATA` | CONFIRMED |
| `R-NRM-007` | Incomplete runtime capture | No official runtime exists; future partial/scrolled capture may omit content | False common area and incomplete certification | Capture Contract modality/bounds and Runtime Gate | REAL downstream |
| `R-NRM-008` | Hidden or overbroad excluded zones | Masks can conceal defects | Artificially improved score | Minimal exclusion registry, separate area reporting, Gate | REAL |
| `R-NRM-009` | DPR/output scale confusion | Capture profile values remain open; CSS viewport differs conceptually from pixels | Accidental scaling/resampling | Explicit DPR/output mapping; fail closed | CONFIRMED open dependency |
| `R-NRM-010` | Same width mistaken for scale/origin proof | Home reference and target runtime both use width 1920 | Invalid 1920 × 995/1080 mapping | Scale/origin/anchor proof independent of dimensions | CONFIRMED |
| `R-NRM-011` | Scrolled sequence duplicates fixed/sticky UI | Capture Contract supports scrolled sequences; policy open | Overlap and wrong document mapping | Scroll offsets, modality manifest, sticky-region policy | REAL downstream |
| `R-NRM-012` | Blank margins/padding removed as “irrelevant” | Home contains large spatial structure; visual geometry is in scope | Hides layout drift | Treat blank sourced pixels as pixels; Design-approved scope only | CONFIRMED design risk |

No risk is converted into a tolerance or exclusion by this model.

# 17 Open Decisions

Only unresolved normalization decisions are listed. None is resolved here.

| Decision ID | Open decision | Required authority | Blocking scope |
|---|---|---|---|
| `OD-NRM-001` | Canonical anchor hierarchy and approved anchor set for each screen/state, beginning with Home | Design Authority + Evidence Validator | Executed coordinate mapping |
| `OD-NRM-002` | Authority and exact useful-content/content-area bounds for each official reference | Design Authority | Content-scoped common areas/crops |
| `OD-NRM-003` | Canonical NCS canvas extent, origin-selection profile, and visual representation of no-source areas | Evidence Validator + Design Authority | Materialized normalized/overlay artefacts |
| `OD-NRM-004` | Fractional CSS-to-image coordinate, rounding, and pixel-boundary convention when DPR mapping is non-integral | Technical Authority + Evidence Validator | Fractional mapping, raster overlay/Diff |
| `OD-NRM-005` | Approved DPR/output-scale profile for Home and other screen classes | Technical Authority + Evidence Validator + Program Board profile decision | Scale compatibility proof |
| `OD-NRM-006` | Formal logical-crop/useful-bounds approval profiles and allowed certification scopes | Design Authority + Evidence Validator | Cropped/partial common area |
| `OD-NRM-007` | FULL_PAGE/SCROLLED_SEQUENCE document-coordinate and fixed/sticky-element normalization policy | Evidence Validator + Technical/Design Authorities | Scrolled normalization |
| `OD-NRM-008` | PARTIAL_REGION/MULTI_CAPTURE_SET union, overlap, and completeness rules | Evidence Validator + Visual Certification Authority | Multi-image normalization |
| `OD-NRM-009` | Exclusion/mask taxonomy, maximum scope, approval, expiry, and denominator policy | Design Authority + Evidence Validator + Program Board Decision Record | Safe Area with exclusions |
| `OD-NRM-010` | Canonical normalization-manifest serialization, schema, signature, storage, and version registry | Evidence Validator + Technical Authority + Program Board | Operational manifest exchange |

The absence of these decisions does not invalidate the model. It prevents only the dependent normalization operation or Gate from passing.

# 18 Final Verdict

**Decision: NORMALIZATION MODEL APPROVED**

The official PROGRAM-037 geometric-normalization model is complete:

- five coordinate systems are defined;
- reference, runtime, normalized, measurement, and overlay spaces are separated;
- immutable source pixels are never resized, stretched, compressed, distorted, resampled, or edited;
- three logical transformation classes are authorized and ten pixel/geometry-changing classes are forbidden;
- Common Comparison Area, Safe Area, `OUTSIDE_REFERENCE`, `OUTSIDE_RUNTIME`, excluded, invalid, and no-source areas are distinct;
- origin, axes, anchors, offsets, margins, padding, viewport, content, partial, and scrolled evidence are governed;
- logical cropping is non-destructive, parent-relative, traceable, and unable to repair an invalid input;
- the `1920 × 995` versus `1920 × 1080` Home case is defined conditionally without executing a mapping or measuring DEF-008;
- seven Quality Gates operationalize normalization integrity;
- twelve risks and ten open decisions are registered;
- no runtime capture currently exists, so no normalization result is claimed.

Lot decision:

- Normalization Model design: `PASS`;
- actual Home normalization: `NOT EXECUTED`;
- overlay, Pixel Diff, measurement, DEF-008, certification, and baseline: `NOT AUTHORIZED`;
- `LOT-004 — Measurement Model`: `AUTHORIZED` under a distinct Mission Order.

No code, script, image, capture, normalized artefact, overlay, Pixel Diff, measurement, correction, baseline, PROGRAM-036 file, or existing PROGRAM-037 source was created, modified, installed, or executed outside this single document.

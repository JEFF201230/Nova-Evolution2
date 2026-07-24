# 1 Document Control

| Field | Value |
|---|---|
| Program | `PROGRAM-037 — NOVA Visual Certification System` |
| Lot | `LOT-005 — Overlay & Diff Model` |
| Mission Order | `P37-MO-005-OVERLAY-DIFF-MODEL` |
| Document | `P37-LOT-005_OVERLAY_AND_DIFF_MODEL.md` |
| Type | Canonical visual evidence architecture and governance model |
| Owner | PROGRAM-037 |
| Status | `APPROVED` |
| Approval authority | Program Director under `P37-DR-001` |
| Upstream dependencies | Approved reference intake, normalization manifest, and measurement export |
| Downstream consumers | LOT-006 Defect Model, LOT-007 Certification Gates, certification evidence packages |
| Verdict | `OVERLAY AND DIFF MODEL APPROVED` |
| Mission exclusions | No code, script, capture, generated visual artifact, executed Pixel Diff, selected engine, installed tool, or certification |

## 1.1 Normative sources

| Source | Controlling contribution |
|---|---|
| `PROGRAM_037_PROGRAM_ARCHITECTURE.md` | LOT sequence, evidence architecture, overlay/diff scope, program Gates, risks, and downstream contract |
| `P37-DR-001_VISUAL_CERTIFICATION_GOVERNANCE.md` | Independent authority, Pixel Diff approval mechanism, tolerance/mask governance, evidence preservation, and conflict rules |
| `P37-LOT-000_PROGRAM_READINESS.md` | Readiness conditions, actual environment findings, and unresolved dependencies |
| `P37-LOT-001_CAPTURE_CONTRACT.md` | Runtime capture identity, rendering context, output integrity, and automatic rejection conditions |
| `P37-LOT-002_REFERENCE_INTAKE.md` | Official reference identity, native preservation, authority, manifests, and hashes |
| `P37-LOT-003_NORMALIZATION_MODEL.md` | Common Comparison Area, Safe Area, coordinate mapping, offsets, exclusions, and immutable normalized-space contract |
| `P37-LOT-004_MEASUREMENT_MODEL.md` | Approved raw measurements, regions, targets, result exports, evidence, units, and classification boundaries |
| `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md` | NOVA component, layout, typography, color, shadow, radius, icon, and state vocabulary |
| `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` | Official design-source inventory and visual properties requiring reviewable evidence |
| `NOVA_UX_AUDIT_REPORT.md` | UX hierarchy, visibility, cognition, navigation, and accessibility constraints not reducible to pixel similarity |

All ten sources were consulted as normative context. A formally approved Decision Record prevails over conflicting operational wording. This model does not resolve an unresolved source, tool, tolerance, mask, or authority conflict by assumption.

## 1.2 Table of contents

1. Document Control
2. Purpose
3. Scope
4. Definitions
5. Overlay Model
6. Difference Model
7. Region Comparison Model
8. Component Comparison Model
9. Evidence Generation Model
10. Visualization Model
11. Artifact Model
12. Overlay Manifest
13. Evidence Traceability
14. Quality Gates
15. Risk Register
16. Open Decisions
17. Definition of Done
18. Final Verdict

# 2 Purpose

This document defines the official engine-independent model by which PROGRAM-037 turns approved visual inputs and approved measurements into reviewable, reproducible, immutable, and traceable visual evidence.

The model conceptually supports:

- Overlay;
- Difference Map;
- Heatmap;
- Region Diff;
- Component Diff;
- Measurement Overlay;
- Defect Overlay;
- Certification Evidence.

It defines what each artifact means, which parents it consumes, which parameters and legends must be disclosed, how regions and components remain identifiable, and which Gates prevent an image or score from becoming untraceable evidence.

This document authorizes architecture only. It does not authorize generation or use of an authoritative Pixel Diff.

# 3 Scope

## 3.1 In scope

- define eleven canonical artifact types;
- define eight visualization modes;
- define conceptual overlay, difference, region, component, measurement, and defect evidence;
- define parent-input, alignment, masking, denominator, palette, legend, and provenance requirements;
- define visual evidence generation states and immutable artifact relationships;
- define the Overlay Manifest and artifact identity model;
- define eight Quality Gates;
- define traceability from official sources to defects and certification;
- identify real risks and unresolved decisions without selecting tools or thresholds.

## 3.2 Out of scope

- choosing, approving, installing, or implementing a Pixel Diff engine;
- choosing a library, image service, command, or file-processing implementation;
- producing any Overlay, Diff, Heatmap, measurement, capture, or certification artifact;
- setting numeric pixel, color, antialiasing, component, region, or mask tolerances;
- repairing, resizing, stretching, resampling, or otherwise changing source images;
- measuring Home or DEF-008;
- modifying PROGRAM-036, frontend code, existing PROGRAM-037 documents, references, captures, or baselines;
- creating a defect or issuing a certification verdict.

## 3.3 Fail-closed rule

If parent identity, alignment, coordinate space, region map, mask authority, denominator, algorithm, parameter, legend, hash, or evidence authority is absent or ambiguous, the affected derived artifact is not approved. The model records the unresolved condition; it does not infer a default.

# 4 Definitions

| Term | Canonical definition |
|---|---|
| Visual Evidence | Immutable, provenance-linked artifact or record that makes a bounded visual comparison fact independently reviewable |
| Overlay | Co-registered presentation of reference and runtime content in the approved Overlay Coordinate System without altering either parent |
| Difference Map | Spatial representation of a declared difference operation over eligible corresponding pixels or measurement targets |
| Heatmap | Legend-bound visualization that maps declared difference magnitude/classes to display values; it is explanatory, not a raw source |
| Region Diff | Difference evidence restricted and reported against one approved semantic/geometric region |
| Component Diff | Difference evidence bound to one approved component instance and its component measurement profile |
| Measurement Overlay | Annotation layer that displays approved measurement points, bounds, axes, values, and result IDs over a parent view |
| Defect Overlay | Annotation layer that locates canonical defect IDs, states, severities, and evidence links without changing the underlying comparison |
| Certification Evidence | Governed evidence index/package referencing approved artifacts, manifests, measurements, Gates, hashes, authorities, and limitations |
| Parent Artifact | Immutable source or approved derived artifact directly consumed to create another artifact |
| Derived Artifact | Artifact reproducibly generated from identified parents and a complete approved manifest/profile |
| Co-registration | Proven coordinate correspondence of reference and runtime inside the approved Safe Area |
| Valid Pixel | A position eligible for the declared comparison under approved common-area, exclusion, alpha, and algorithm rules |
| Invalid Pixel | Position outside eligibility or lacking approved correspondence; it never enters a valid-pixel denominator |
| Denominator | Explicit governed population against which an aggregate difference metric is expressed |
| Mask | Explicit governed spatial selector included in evidence; it never silently changes source pixels or eligibility |
| Exclusion | Approved reasoned area removed from a declared operation and preserved in the manifest |
| Legend | Complete mapping between rendered evidence colors/symbols and their declared meaning |
| Visualization Mode | Review presentation that exposes evidence without redefining the underlying result |
| Evidence Set | Versioned collection of related artifacts and manifests for one comparison session/scope |
| Artifact Status | `PROPOSED`, `INPUT_VALIDATED`, `GENERATED`, `VALIDATED`, `APPROVED`, `REJECTED`, `SUPERSEDED`, or `INVALIDATED` |
| Algorithm Profile | Approved identity/version/parameters for a difference operation; no official profile is selected by this Lot |
| Visualization Profile | Approved display-mode parameters, palette, opacity, timing, labels, and legend rules |

Artifact presence does not imply validity. A visually persuasive image without complete provenance and Gate PASS evidence is not official visual evidence.

# 5 Overlay Model

## 5.1 Concept

An Overlay is a non-destructive co-registered view of immutable reference and runtime parents. It exists to expose displacement, extent, wrapping, alignment, structure, color, and surface differences to a reviewer. It does not compute conformity by itself.

## 5.2 Required inputs

- official `REFERENCE` identity and hash;
- conforming `RUNTIME` identity and hash;
- approved normalization manifest and its `NORMALIZED_REFERENCE` / `NORMALIZED_RUNTIME` identities when materialized;
- approved Overlay Coordinate System, Common Comparison Area, Safe Area, offsets, and excluded/outside zones;
- comparison session and screen/state/profile identities;
- approved Visualization Profile for the requested mode;
- approved measurement export when measurement annotations are shown.

## 5.3 Overlay layers

| Layer | Purpose | Mandatory rule |
|---|---|---|
| Reference layer | Display immutable official visual source in mapped coordinates | Native-source pixels are never stretched, resampled, repaired, or overwritten |
| Runtime layer | Display immutable runtime candidate in mapped coordinates | Runtime pixels remain unchanged |
| Eligibility layer | Show Common Comparison Area, Safe Area, exclusions, `OUTSIDE_REFERENCE`, and `OUTSIDE_RUNTIME` | Must not be silently hidden when it affects interpretation |
| Registration layer | Show origins, anchors, axes, offsets, and region/component boundaries when requested | Uses approved normalization records only |
| Annotation layer | Show measurements, defects, IDs, labels, or reviewer notes | Must be separable from source layers and linked to canonical records |
| Legend layer | Explain opacity, colors, symbols, states, masks, and region/component IDs | Mandatory for every exported visualization |

## 5.4 Overlay invariants

1. Reference and runtime parents retain their hashes and native meaning.
2. The overlay uses logical co-registration only; it never rescales one source to force a match.
3. Every translation or offset is declared and traceable to the normalization manifest.
4. Opacity, layer order, blend behavior, background, palette, and color profile are explicit parameters.
5. Annotation pixels are not comparison pixels.
6. Areas outside the Safe Area are visually distinguishable and excluded from any comparison denominator.
7. An overlay cannot hide a failed alignment or replace a difference result.
8. The same manifest and profile reproduce the same logical composition under an approved tool/environment.

## 5.5 Overlay states

`PROPOSED → INPUT_VALIDATED → GENERATED → VALIDATED → APPROVED`

Any pre-approval state may transition to `REJECTED`. An approved artifact may become `SUPERSEDED` or `INVALIDATED`; it is never overwritten.

# 6 Difference Model

## 6.1 Conceptual separation

The Difference Model distinguishes:

- raw source pixels and approved measurements;
- a declared difference operation;
- a raw difference field/result set;
- a visual rendering such as Difference Map or Heatmap;
- aggregate metrics by global, region, or component denominator;
- tolerance/severity interpretation;
- certification authority.

None of these stages may silently substitute for another.

## 6.2 Difference operation contract

An authoritative difference operation requires, before execution:

- approved engine/tool Decision Record;
- exact engine/version policy and deterministic environment;
- approved Algorithm Profile and parameter schema;
- approved color/profile/alpha behavior;
- approved antialiasing and renderer-noise policy;
- approved valid-pixel and denominator rules;
- approved mask/exclusion policy;
- approved global, regional, and component tolerance/severity governance where verdict interpretation is required;
- false-positive/false-negative evidence and rollback rules.

Until these exist, `PIXEL_DIFF`, Difference Map, Heatmap, and derivative metrics remain conceptual and cannot be authoritative evidence.

## 6.3 Logical difference outputs

| Output | Meaning | Required disclosure |
|---|---|---|
| Raw difference field | Per-position or per-target result produced by the approved operation | operation ID, parameters, source values/references, eligibility, precision |
| Difference Map | Spatial visualization of raw difference presence/value | palette, legend, invalid/no-source colors, scale behavior |
| Heatmap | Magnitude/class visualization over declared range | mapping function, range source, palette, clipping, legend |
| Aggregate metric | Summary over an exact denominator | numerator, denominator, aggregation, excluded/invalid counts, unit |
| Difference record | Tool-neutral metadata and result linkage | parents, region/component, method, hashes, status, authority |

## 6.4 Difference eligibility classes

| Class | Treatment |
|---|---|
| `VALID_COMPARISON` | Eligible under approved Safe Area and operation rules |
| `EXCLUDED_APPROVED` | Omitted only under an approved exclusion/mask record; separately counted and displayed |
| `OUTSIDE_REFERENCE` | No official reference coverage; never included in paired pixel difference |
| `OUTSIDE_RUNTIME` | No runtime coverage; never included in paired pixel difference |
| `INVALID_INPUT` | Corrupt, missing, misaligned, or profile-nonconforming input; operation fails |
| `ANNOTATION_ONLY` | Overlay legend/measurement/defect annotation; never enters comparison |
| `OPEN_DECISION` | Eligibility depends on unresolved governance; affected operation cannot be approved |

## 6.5 No hidden aggregation

A global metric must never hide a failed critical region or component. Every aggregate publishes its exact denominator, constituent region/component IDs, exclusion counts, and aggregation rule. A global score has no certification meaning until its tolerance profile and critical-region overrides are approved.

# 7 Region Comparison Model

## 7.1 Region identity

A region comparison consumes an approved Region ID from the normalization/measurement records. Each region definition includes:

- screen/state/profile scope;
- semantic name and parent path;
- bounds or polygon in Measurement/Overlay Coordinate Space;
- Safe Area intersection;
- component memberships where relevant;
- exclusion and outside-area intersections;
- reference/runtime evidence locators;
- definition version, authority, and hash.

## 7.2 Region comparison record

| Field group | Required content |
|---|---|
| Identity | Region Diff ID, Region ID/version/hash, comparison session |
| Parents | Reference/runtime/normalized/measurement IDs and hashes |
| Geometry | coordinate space, bounds, valid area, excluded/outside areas |
| Operation | algorithm/profile/version/parameters when approved |
| Results | raw result references, numerator/denominator, units, status |
| Visualization | mode/profile, palette, legend, annotations |
| Evidence | artifacts, hashes, reproducibility record, validator |
| Downstream | defect links, review links, supersession/invalidation links |

## 7.3 Region rules

- Regions may overlap only when overlap purpose and double-counting behavior are explicit.
- Parent/child region aggregation never assumes independent pixels or equal importance.
- A region cannot be moved or resized to improve its result.
- Region boundaries remain visible or recoverable in Region Diff evidence.
- Missing reference/runtime coverage is reported, not filled.
- A critical-region designation requires separate approved authority; this model does not designate critical regions.

# 8 Component Comparison Model

## 8.1 Component identity

A Component Diff binds one canonical component instance to its approved component measurement profile from LOT-004. Identity includes component type, instance ID, semantic path, state, region, parent, bounds, reference/runtime correspondence, and applicable design/source record.

## 8.2 Component evidence bundle

| Evidence dimension | Examples of governed inputs/results |
|---|---|
| Structure | presence, order, parent/child, state, visibility |
| Geometry | bounds, X/Y, width/height, center, alignment |
| Spacing | margin, padding, gap, offset, baseline offset |
| Typography | family, size, weight, line height, wrapping, text bounds |
| Surface | background, foreground, border, radii, opacity, shadow |
| Iconography | icon bounds, aspect, stroke/paint, alignment, optical offset |
| Difference | eligible component pixel field/metric when an engine is approved |
| Defects | exact canonical Defect IDs linked to component evidence |

## 8.3 Component rules

1. One Component Diff covers one component instance and one exact UI state.
2. Every displayed measurement links to an approved atomic Measurement Result ID.
3. Component cropping is a logical view window only; parents and coordinate mapping remain intact.
4. A component result cannot replace a region or full-screen result.
5. A shared component implementation does not prove that all rendered instances match.
6. Component aggregation publishes weighting and denominator rules; none are approved here.
7. Component Diff severity is not inferred from component type or visual salience.

# 9 Evidence Generation Model

## 9.1 Conceptual pipeline

`Official Reference + Conforming Runtime → Approved Normalization → Approved Measurement Export → Evidence Request → Input Lock → Alignment Validation → Authorized Operation Profile → Logical Artifact Generation → Manifest + Hash → Independent Validation → Approved Export → Defect/Certification Consumer`

This is a future execution contract, not an execution performed by this Lot.

## 9.2 Evidence request

Every request states:

- Mission Order and comparison cycle;
- screen, route, UI state, capture profile, data profile, and environment profile;
- exact reference/runtime/normalization/measurement identities and hashes;
- requested artifact types and visualization modes;
- regions/components/measurements/defects in scope;
- approved operation, visualization, mask, tolerance, and tool profiles where required;
- requested validator and approval authority;
- storage/version/retention destination;
- known limitations and open decisions.

## 9.3 Generation controls

| Stage | Mandatory control | Failure behavior |
|---|---|---|
| Intake lock | Parent IDs, hashes, statuses, dimensions, profiles | Reject request; preserve record |
| Coordinate lock | Normalization manifest, origins, offsets, Safe Area | Stop; return to normalization |
| Scope lock | Region/component/measurement/defect IDs | Stop ambiguous scope |
| Operation lock | Approved engine/profile/parameters where computation is requested | Mark `OPEN_DECISION`; do not generate authoritative Diff |
| Mask lock | Approved mask/exclusion IDs and hashes | Reject masked generation |
| Visualization lock | Mode/profile, opacity/timing/palette/legend | No official visualization export |
| Derivation | Parents remain immutable; annotations isolated | Reject altered or untraceable output |
| Integrity seal | Manifest, output hash, evidence index | Artifact remains `GENERATED`, not approved |
| Independent validation | Reproduction and visual/metadata review | Reject or request new evidence |

## 9.4 Reproduction

An Evidence Validator must be able to regenerate the same logical result from the same parents and manifest using the approved environment/tool profile. Byte-for-byte requirements, renderer allowances, and reproduction comparison remain open until formally approved. Any difference is recorded and investigated; it is never silently accepted.

# 10 Visualization Model

## 10.1 Eight visualization modes

| Mode ID | Mode | Purpose | Required parameters/evidence |
|---|---|---|---|
| `VM-01` | Superposition | View co-registered reference/runtime layers together | layer order, opacity, blend behavior, background, Safe Area, legend |
| `VM-02` | Alternation | Alternate reference and runtime without moving the viewport | cadence or manual state, synchronized coordinates, labels, capture of both states |
| `VM-03` | Mask | Display included, excluded, outside, or selected areas | mask IDs/hashes, semantic class, reason, authority, palette, denominator effect |
| `VM-04` | Transparency | Adjust visibility of a declared layer to reveal displacement/detail | exact opacity values/profile, layer identity, color behavior, legend |
| `VM-05` | Region Comparison | Isolate or annotate approved regions while preserving global coordinates | Region IDs/bounds, parent context, valid/excluded area, results |
| `VM-06` | Component Comparison | Isolate or annotate one component instance/state | Component ID/path/profile/bounds, measurements, parent context |
| `VM-07` | Measurement Visualization | Display approved points, axes, bounds, deltas, and values | Measurement Result IDs, units, labels, locator convention |
| `VM-08` | Defect Visualization | Locate canonical defects and their evidence/status | Defect IDs, state/severity authority, component/region, evidence links |

## 10.2 Visualization principles

- A mode changes presentation, never raw evidence or classification.
- Every export names the active mode and profile.
- Reference, runtime, difference, invalid, excluded, outside, annotation, and background colors remain distinguishable.
- Legends are mandatory, readable, and bound to exact parameters.
- Cropped review views preserve parent coordinates and show that they are partial.
- Labels must not cover the finding they describe; displaced callouts retain connector/anchor identity.
- Accessibility of palettes, contrast, and non-color encoding requires approved rules; color alone cannot be the only status carrier.
- Alternation timing, opacity, palettes, and symbol vocabulary remain open decisions, not operator defaults.

# 11 Artifact Model

## 11.1 Eleven canonical artifact types

| Artifact type | Role | Parent requirements | Certification use |
|---|---|---|---|
| `REFERENCE` | Immutable official native visual source | Approved reference manifest/hash | Foundational evidence; never modified |
| `RUNTIME` | Immutable conforming candidate capture | Approved capture record/hash | Candidate evidence; never modified |
| `NORMALIZED_REFERENCE` | Logical/materialized reference view under approved normalization | `REFERENCE` + normalization manifest | Comparison parent, not a replacement reference |
| `NORMALIZED_RUNTIME` | Logical/materialized runtime view under approved normalization | `RUNTIME` + normalization manifest | Comparison parent, not a replacement runtime |
| `OVERLAY` | Co-registered presentation of approved parents | normalized parents + Visualization Profile | Review evidence after Overlay Gates PASS |
| `PIXEL_DIFF` | Engine-produced difference field/map/metrics | normalized parents + approved engine/algorithm/mask/tolerance context | Authoritative only after dedicated approvals and Gates PASS |
| `REGION_DIFF` | Region-bounded comparison evidence | approved region + relevant parents/results | Supports region findings and defects |
| `COMPONENT_DIFF` | Component-instance comparison evidence | component identity/profile + relevant parents/results | Supports component findings and defects |
| `MEASUREMENT_OVERLAY` | Visual annotation of approved measurements | approved Measurement Result IDs + view parent | Explanatory evidence; cannot rewrite results |
| `DEFECT_OVERLAY` | Visual annotation of canonical defects | canonical Defect IDs + approved evidence/view parent | Downstream after LOT-006 governs defects |
| `CERTIFICATION_EVIDENCE` | Signed/indexed evidence package for Gate review | approved artifacts/manifests/Gates/hashes | Supports but does not itself issue certification |

## 11.2 Artifact relationship model

`REFERENCE + RUNTIME → NORMALIZED_REFERENCE + NORMALIZED_RUNTIME → OVERLAY / PIXEL_DIFF → REGION_DIFF / COMPONENT_DIFF → MEASUREMENT_OVERLAY / DEFECT_OVERLAY → CERTIFICATION_EVIDENCE`

The diagram expresses possible dependency, not mandatory materialization of every artifact. Each derived artifact lists its actual direct parents.

## 11.3 Artifact identity and lifecycle

Every artifact has a unique immutable ID, artifact type, screen/state/profile scope, version, status, parent IDs/hashes, manifest ID/hash, creation authority/time, validation record, content hash, storage reference, and supersession/invalidation linkage.

Authorized lifecycle:

`PROPOSED → INPUT_VALIDATED → GENERATED → VALIDATED → APPROVED`

- Any non-final state may become `REJECTED`.
- `APPROVED → SUPERSEDED` after an approved replacement.
- Any state may become `INVALIDATED` when parent/profile/authority integrity fails.
- Re-generation creates a new ID/version; it never overwrites prior bytes or evidence.

# 12 Overlay Manifest

## 12.1 Minimum fields

| Field group | Required content |
|---|---|
| Identity | Manifest ID, version, status, schema version, comparison/evidence-set ID |
| Scope | Program/Lot/Mission Order, screen, route, UI state, data/capture/environment profiles |
| Parents | Reference, runtime, normalized parents, measurement export IDs/versions/hashes |
| Coordinates | Reference/runtime/normalized/measurement/overlay spaces, origins, axes, offsets, anchors |
| Areas | Common Comparison Area, Safe Area, regions, components, excluded/outside/invalid areas |
| Artifact request | Requested/generated artifact types, visualization modes, intended reviewer/use |
| Overlay parameters | layer order, opacity, transparency, blend/background behavior, partial-view bounds |
| Difference parameters | engine/algorithm profile IDs, parameters, color/alpha/antialiasing behavior when approved |
| Masks and exclusions | IDs, versions, hashes, geometry, reason, authority, expiry, denominator impact |
| Metrics | result IDs, numerator, denominator, units, aggregation, region/component breakdowns |
| Visualization | profile ID/version, palette, scale/mapping, labels, symbols, legends, accessibility encoding |
| Outputs | Artifact IDs/types/versions/statuses, dimensions, format metadata, hashes, storage references |
| Authorities | requester, producer, Evidence Validator, Design/UX/Accessibility reviewers where applicable |
| Validation | Gate outcomes, reproduction record, conflicts, limitations, open decisions |
| Lifecycle | timestamps, predecessor, supersession, invalidation, retention, downstream links |
| Integrity | manifest hash, evidence-index hash, signature/approval references |

## 12.2 Manifest rules

- The manifest is immutable after approval.
- Missing optional artifacts are explicit; missing mandatory fields are never inferred.
- A manifest cannot designate an unapproved tool, tolerance, mask, palette, or profile as official.
- Parent/output hashes are recorded before approval.
- Logical crops, partial views, and annotations preserve full parent mapping.
- A changed parent, profile, parameter, mask, legend, or output creates a new manifest version and impact review.
- The manifest hash is referenced by every derived artifact and downstream defect/certification record.

# 13 Evidence Traceability

## 13.1 End-to-end chain

`Official Reference Manifest → Capture Record → Normalization Manifest → Measurement Session/Export → Overlay Manifest → Visual Artifact → Region/Component Evidence → Defect Record → Certification Gate → Certification Report → Baseline Manifest`

Every arrow is represented by stable IDs, versions, hashes, states, and authorities. A downstream artifact cannot detach from or rewrite an upstream fact.

## 13.2 Traceability matrix

| Stage | Required inbound evidence | Required outbound evidence |
|---|---|---|
| Overlay input | source/capture/normalization/measurement IDs and hashes | locked evidence request and parent index |
| Alignment | coordinate spaces, origins, offsets, Safe Area, anchor evidence | alignment validation record |
| Generation | approved profiles/parameters/masks/legends | artifact bytes or logical record, output hash, manifest |
| Validation | manifest, artifacts, reproduction environment/results | Evidence Validator decision and Gate outcomes |
| Region/component review | approved artifacts and exact target IDs | bounded findings and evidence links |
| Defect intake | approved finding/evidence IDs | one canonical defect lifecycle link under LOT-006 |
| Certification | complete applicable evidence chain | independent verdict/conditions/rejection with authority |

## 13.3 Invalidation propagation

Invalidation of a parent hash, official reference, runtime capture, normalization mapping, measurement result, operation profile, mask, visualization profile, authority, or manifest triggers a recorded impact assessment. Every dependent artifact becomes pending review or invalidated according to that assessment. No invalid artifact may support certification or baseline freeze.

## 13.4 Human review

Human review may interpret bounded ambiguity only under `P37-DR-001`. It records reviewer identity/authority, exact artifact hashes, region/component, question, limitations, evidence, and decision. It cannot replace missing parents, approve an unapproved engine/tolerance/mask, hide a Gate failure, or certify PROGRAM-036's own work.

# 14 Quality Gates

## 14.1 Gate matrix

| Gate | Objective | Entry | Controls | PASS output | FAIL output |
|---|---|---|---|---|---|
| `OVERLAY_INPUT` | Prove all requested parents and profiles are authorized and immutable | Evidence request plus source/capture/normalization/measurement records | IDs, versions, hashes, status, scope, dimensions, profile compatibility, authority | Input set locked as `INPUT_VALIDATED` | Request rejected/pending; no generation |
| `OVERLAY_ALIGNMENT` | Prove faithful co-registration and eligible areas | Input Gate PASS; approved normalization manifest | origins, axes, offsets, scale identity, anchors, Common/Safe Areas, outside/excluded areas | Alignment record approved | Return to normalization; no overlay/diff |
| `OVERLAY_EVIDENCE` | Prove overlay presentation is complete and non-deceptive | Alignment PASS; overlay/visualization manifest | layers, opacity, order, background, legends, annotations, partial-view disclosure, parent integrity | Overlay eligible for validation | Overlay rejected; parents preserved |
| `DIFF_GENERATION` | Prove difference operation is authorized and reproducible | Alignment PASS; approved engine/algorithm/mask/tolerance context as applicable | tool/version, parameters, color/alpha/AA behavior, valid pixels, denominators, global/region/component results | Difference artifacts/results eligible for evidence validation | `OPEN_DECISION` or rejection; no authoritative Diff |
| `EVIDENCE_TRACEABILITY` | Prove complete lineage and bounded meaning | Relevant generation Gates PASS | parent/output IDs/hashes, regions/components/measurements, profiles, authorities, limitations, downstream links | Traceability record PASS | Artifact not downstream eligible |
| `ARTIFACT_INTEGRITY` | Prove immutable outputs and manifests | Traceability PASS; all outputs available | bytes/metadata/hash, format/dimensions, manifest consistency, annotation separation, storage/retrieval | Artifact set sealed and `VALIDATED` | Artifact set rejected/invalidated |
| `VISUAL_EVIDENCE_APPROVED` | Independently approve evidence set | All applicable prior Gates PASS | validator independence, reproduction, conflicts, open decisions, UX/accessibility review triggers, signatures | Evidence/artifacts state `APPROVED` | Request new evidence or reject; no defect/certification reliance |
| `OVERLAY_EXPORT` | Seal tool-neutral downstream index/package | Visual Evidence Gate PASS | schema/version, artifact/manifest/evidence index, hashes, legends, status, supersession/invalidation rules | Immutable export authorized for LOT-006 | Export rejected; approved parents remain preserved |

## 14.2 Gate order

`OVERLAY_INPUT → OVERLAY_ALIGNMENT → OVERLAY_EVIDENCE + DIFF_GENERATION (as applicable) → EVIDENCE_TRACEABILITY → ARTIFACT_INTEGRITY → VISUAL_EVIDENCE_APPROVED → OVERLAY_EXPORT`

`OVERLAY_EVIDENCE` may pass for a governed non-Diff overlay while `DIFF_GENERATION` remains pending. Any downstream scope requiring authoritative Pixel Diff remains pending. No Gate PASS automatically opens LOT-006 without a distinct Mission Order.

## 14.3 Program Gate mapping

The eight Lot Gates collectively supply evidence to `GATE-P37-OVERLAY-DIFF-INTEGRITY`. The Program Gate passes only when every applicable Lot Gate passes and all required engine, algorithm, mask, tolerance, authority, and reproducibility decisions are approved for the claimed scope.

# 15 Risk Register

| Risk ID | Real risk | Impact | Control/recovery |
|---|---|---|---|
| `R-OD-01` | Reference/runtime misalignment | False differences across the image | Alignment Gate, anchors, offsets, independent validation |
| `R-OD-02` | Native reference is stretched or resampled | Invalid comparison evidence | Hash/dimension checks; native preservation; reject derived artifact |
| `R-OD-03` | Unapproved Pixel Diff engine or default parameters | Non-authoritative/irreproducible result | Dedicated Decision Record and fail-closed Diff Gate |
| `R-OD-04` | Color-profile or alpha drift | False color/difference signals | Profile evidence and approved algorithm behavior |
| `R-OD-05` | Antialiasing or renderer noise treated as defect | False positives | Approved noise policy plus bounded independent review |
| `R-OD-06` | Broad, hidden, or expired mask | Real defects concealed | Mask IDs/hashes/authority/expiry, visible mask mode, Gate review |
| `R-OD-07` | Wrong valid-pixel denominator | Misleading aggregate metric | Publish counts, eligibility classes, and exact denominator |
| `R-OD-08` | Global score hides critical local failure | False acceptance | Mandatory region/component breakdown and approved overrides |
| `R-OD-09` | Heatmap palette exaggerates or suppresses differences | Misleading human interpretation | Approved mapping, legend, raw result linkage, accessible encoding |
| `R-OD-10` | Annotation pixels contaminate Diff | Self-generated differences | Separate annotation layer/artifact and exclude from operation inputs |
| `R-OD-11` | Region/component identity or bounds are wrong | Findings attached to wrong scope | Approved IDs/hashes, coordinate mapping, target validation |
| `R-OD-12` | Cropped evidence loses context or coordinates | Misinterpretation and irreproducibility | Declare partial view and preserve parent mapping/context locator |
| `R-OD-13` | Artifact or manifest overwritten | Broken audit history | Immutable IDs/versions/hashes and supersession/invalidation lifecycle |
| `R-OD-14` | Tool-native score is treated as certification | Unauthorized verdict | Separate result, classification, Gate, and authority layers |
| `R-OD-15` | Missing or inconsistent legend | Evidence cannot be interpreted reliably | Legend required by Overlay Evidence and Export Gates |
| `R-OD-16` | Reproduction differs across environment/tool version | Evidence instability | Exact profile/version, independent reproduction, invalidate on failure |
| `R-OD-17` | `OUTSIDE_REFERENCE` or `OUTSIDE_RUNTIME` silently compared | Unsourced or false difference | Eligibility classes and Safe Area enforcement |
| `R-OD-18` | Evidence duplicates or diverges across defect registers | Conflicting visual truth | Stable artifact IDs; LOT-006 canonical ownership/import policy |

Risks are not converted into masks, thresholds, or exceptions by this model.

# 16 Open Decisions

| Decision ID | Open decision | Required authority/instrument | Blocking scope |
|---|---|---|---|
| `OD-OVERLAY-001` | Official Pixel Diff engine, licensing, security, installation, and version policy | Program Board tool Decision Record | Authoritative `PIXEL_DIFF` generation |
| `OD-OVERLAY-002` | Difference algorithm, parameters, raw output schema, and deterministic reproduction rule | Tool/algorithm Decision Record | Difference Map, Heatmap, and metrics |
| `OD-OVERLAY-003` | Color space/profile, alpha compositing, channel comparison, and conversion policy | Colorimetric Decision Record | Color/difference evidence |
| `OD-OVERLAY-004` | Antialiasing, renderer-noise, edge, and false-positive/negative policy | Algorithm/tolerance Decision Record | Difference validity |
| `OD-OVERLAY-005` | Global, region, component, critical-area, and pixel-difference tolerances | Tolerance Decision Record under `P37-DR-001` | Severity/conformity interpretation |
| `OD-OVERLAY-006` | Dynamic mask/exclusion eligibility, limits, approval, expiry, and denominator effect | Mask Decision Record | Any masked authoritative comparison |
| `OD-OVERLAY-007` | Overlay blend behavior, layer order, background, and canonical opacity profiles | Visualization Decision Record | Official overlay generation |
| `OD-OVERLAY-008` | Difference Map/Heatmap palette, scale, clipping, legend, and accessible non-color encoding | Visualization/Accessibility Decision Record | Official map/heatmap export |
| `OD-OVERLAY-009` | Alternation cadence/manual control and evidence capture convention | Visualization Decision Record | Official alternation evidence |
| `OD-OVERLAY-010` | Canonical region/component registries, critical-region authority, overlaps, and aggregation | Design/Measurement Decision Record | Comparable region/component reporting |
| `OD-OVERLAY-011` | Byte reproducibility versus logical reproducibility criteria across approved environments | Evidence Validation Decision Record | Artifact Integrity approval |
| `OD-OVERLAY-012` | Artifact formats, compression/color metadata, schema serialization, storage, and retention | Evidence Model Decision Record | Persisted official export |
| `OD-OVERLAY-013` | Signature mechanism and named validator/delegation assignments | Program Director appointment/evidence record | Final evidence approval |
| `OD-OVERLAY-014` | Canonical Defect Register ownership/import linkage | LOT-006 governance decision | `DEFECT_OVERLAY` mutation and defect handoff |

These decisions remain open. They are not resolved by this architecture, existing tool availability, implementation convention, manual inspection, or operator preference.

# 17 Definition of Done

LOT-005 architecture is done when all of the following are true:

- the eleven artifact types have distinct meanings, parents, lifecycle, and certification limitations;
- the eight visualization modes have declared purpose and evidence parameters;
- Overlay and Difference operations are separated from visualization, classification, defect, and certification authority;
- region and component comparisons retain canonical identity, coordinate mapping, denominators, and parent context;
- measurement and defect annotations remain separate from comparison pixels;
- the Overlay Manifest captures every parent, parameter, area, mask, output, legend, authority, hash, and lifecycle link;
- the end-to-end evidence chain is explicit and invalidation propagates;
- the eight Quality Gates define fail-closed entry, validation, integrity, approval, and export behavior;
- risks and open decisions are explicit;
- no engine, algorithm, tolerance, mask, visualization profile, format, or storage implementation is invented;
- no visual artifact, code, script, tool installation, comparison, or certification has been produced;
- LOT-006 may be opened only by a distinct authorized Mission Order.

Operational evidence generation is not part of this Definition of Done. It remains dependent on the open decisions applicable to the requested artifact.

# 18 Final Verdict

**Decision: OVERLAY AND DIFF MODEL APPROVED**

The model is approved because it defines a complete, tool-independent and fail-closed architecture for turning governed inputs into reviewable visual evidence while preserving native sources, coordinate truth, denominators, exclusions, legends, hashes, authority separation, and audit history.

Approval of the model does not approve a Pixel Diff engine or authorize artifact generation. Authoritative Difference Map, Heatmap, Pixel Diff, masked comparison, and tolerance-based interpretation remain pending until their dedicated Decision Records pass.

Authorization outcome:

- code, scripts, tools, dependencies, capture, Overlay, Diff, Pixel Diff, Heatmap, and certification execution: `NOT AUTHORIZED`;
- PROGRAM-036, frontend, references, captures, existing PROGRAM-037 documents, and baselines modification: `NOT AUTHORIZED`;
- `LOT-006 — Defect Model`: `AUTHORIZED` under a distinct Mission Order.

No code, script, capture, generated visual artifact, executed comparison, installed tool, modified source, commit, or push was produced by this Lot document.

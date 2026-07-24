# 1 Document Control

| Field | Value |
|---|---|
| Document ID | `P37-LOT-002_REFERENCE_INTAKE` |
| Mission ID | `P37-MO-002-REFERENCE-INTAKE` |
| Program | `PROGRAM-037 — NOVA Visual Certification System` |
| Lot | `LOT-002 — Reference Intake` |
| Document type | Normative reference governance model |
| Status | `APPROVED` |
| Effective date | 2026-07-13 |
| Owner | PROGRAM-037 |
| Governance authority | `P37-DR-001 — Visual Certification Governance` |
| Exit Gate | `GATE-P37-REFERENCE-INTEGRITY` |
| Verdict | `REFERENCE INTAKE APPROVED` |
| Mission exclusions | No code, tool installation, image modification, capture, comparison, baseline, or certification |

This document defines how a visual source becomes a governed PROGRAM-037 reference. It does not intake, copy, rename, modify, approve, reject, supersede, archive, or baseline any existing image during this mission.

## 1.1 Table of contents

1. Document Control
2. Purpose
3. Scope
4. Definitions
5. Reference Principles
6. Reference Lifecycle
7. Reference Source Categories
8. Intake Process
9. Technical Control Matrix
10. Figma Native Reference Policy
11. Multiple Reference Resolution
12. Reference Authority
13. Reference Manifest
14. Quality Gates
15. Rejection Rules
16. Risk Register
17. Open Decisions
18. Final Verdict

## 1.2 Normative sources

The following sources were read in full:

- `PROGRAM_037_PROGRAM_ARCHITECTURE.md`;
- `P37-DR-001_VISUAL_CERTIFICATION_GOVERNANCE.md`;
- `P37-LOT-000_PROGRAM_READINESS.md`;
- `P37-LOT-001_CAPTURE_CONTRACT.md`;
- `ORCHESTRATION_GOVERNANCE.md`;
- `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`;
- `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`;
- `NOVA_UX_AUDIT_REPORT.md`.

Home-labelled visual files currently present under `Docs/24_MODULES/0-UI-DESIGN/` were also inventoried by native dimensions, file size, format, pixel format, timestamp, and SHA-256 without modification.

# 2 Purpose

The Reference Intake system exists to:

- receive a proposed visual reference without altering it;
- prove file and authority integrity;
- classify its source and domain authority;
- identify exact duplicates and version conflicts;
- record missing provenance and viewport information;
- approve exactly one controlling official reference per screen/state/domain scope;
- preserve historical, legacy, superseded, rejected, and archived material without confusing it with current authority;
- protect later normalization, comparison, certification, and baseline operations from ambiguous inputs.

A filename, folder, timestamp, visual similarity, or high version number does not by itself confer authority. Authority requires a complete manifest, successful Gates, and explicit approval.

# 3 Scope

This Lot governs:

- reference definitions and source categories;
- reference authority by domain;
- lifecycle states and transitions;
- immutable receipt and provenance;
- format, dimensions, ratio, color, compression, alpha, rotation, metadata, naming, integrity, and SHA-256 controls;
- viewport and useful-content declarations;
- duplicate, obsolete, incomplete, contradictory, legacy, and manipulated reference handling;
- native Figma treatment;
- multiple-reference conflict resolution;
- reference manifests, Gates, rejections, risks, and open decisions.

This Lot does not:

- modify, crop, resize, normalize, recompress, recolor, rename, move, or delete an image;
- create a runtime capture or Approved Screenshot;
- compare a runtime to a reference;
- choose a Pixel Diff or perceptual-duplicate engine;
- certify a screen;
- create or freeze a baseline;
- modify PROGRAM-036, PROGRAM-037 architecture, the governance Decision Record, the Capture Contract, or existing reference files;
- resolve decisions listed as open.

# 4 Definitions

## 4.1 Glossary

| Term | Precise definition |
|---|---|
| Reference | A governed source artefact used to establish an expected visual, semantic, structural, or implementation fact for a declared screen/state/domain scope |
| Baseline | A complete, certified, approved, immutable, hashed PROGRAM-037 package used for future regression; it is not synonymous with a reference image |
| Master Reference | The designated controlling source index or specification for a defined domain; it may point to native artefacts and must state its limits and version |
| Candidate Reference | A proposed or received artefact not yet `OFFICIAL`; it cannot control certification |
| Deprecated Reference | A reference no longer permitted for new certification but preserved until formally superseded/archived; documentary label mapped to lifecycle state `SUPERSEDED` or `ARCHIVED` |
| Rejected Reference | A submitted artefact in terminal state `REJECTED`; retained as evidence and forbidden as certification input |
| Official Reference | An approved, published, integrity-validated source that controls its declared scope and has not been superseded, archived, withdrawn, or rejected |
| Native Reference | Original source bytes at original dimensions, encoding, color/alpha state, and metadata as received |
| Proposed Reference | Artefact identity and authority claim submitted for intake but not yet received into governed storage |
| Historical Baseline | A prior certified baseline package retained for audit/regression history; not current design authority unless reactivated by explicit decision |
| Approved Screenshot | A screenshot explicitly designated as a reference by authorized Design and Program authorities after full intake; not a runtime candidate promoted by convenience |
| Exception Reference | Formally approved, narrowly scoped source that resolves or overrides a specific fact through a Decision Record; it has no authority beyond that scope |
| Legacy Reference | Pre-governance or obsolete material retained for context; never controls a current certification without a new full intake and approval |
| Runtime Candidate | PROGRAM-036 output captured under the Capture Contract; evidence to be compared, never automatically a reference |
| Source Domain | The facts a source can govern: visual pixels/geometry, UX intent, implementation contract, exception, or regression history |
| Reference Set | All source artefacts relevant to one screen/state, including controlling, supporting, historical, rejected, and conflicting items |
| Duplicate | Two files with the same SHA-256 and byte content; they represent one binary artefact even if filenames/paths differ |
| Contradictory Reference | Sources that claim authority over the same fact and cannot both be true for the same scope/version |
| `OUTSIDE_REFERENCE` | Runtime/common-canvas area with no official source pixels; never treated as matching or failing from that reference alone |

## 4.2 Baseline distinction

An `OFFICIAL` reference can be incorporated into a certified baseline package and then acquire lifecycle state `BASELINE` for that relationship. The reference image itself does not become a complete baseline. Baseline creation remains prohibited until LOT-009 and its approval Gate.

# 5 Reference Principles

1. **Native bytes are immutable.** Intake preserves the exact received file.
2. **Authority is explicit.** Names and folder placement are evidence, not approval.
3. **Authority is domain-scoped.** Figma, UX, NFIB, runtime, and baseline evidence do not compete outside their domains.
4. **No majority rule.** Two or three references do not outvote a higher-authority source.
5. **No runtime promotion.** A runtime candidate cannot become design authority without a separate approved reference decision and full intake.
6. **No silent replacement.** A new version opens a new record and preserves predecessors.
7. **Exact duplicates share binary identity.** Duplicate paths never create two official references.
8. **Missing evidence stays missing.** Unknown viewport, provenance, or export scope is recorded, not inferred.
9. **Conflicts freeze affected facts.** Unaffected domains may continue only when isolation is proven.
10. **Historical is not current.** Legacy and historical sources remain visible but cannot control new certification.
11. **One controlling reference per scope.** A screen/state/domain/profile cannot have two active `OFFICIAL` references.
12. **No deletion by convenience.** Rejected, superseded, and archived evidence remains traceable.

# 6 Reference Lifecycle

## 6.1 Lifecycle diagram

```text
PROPOSED
  ↓ receive exact bytes and provenance claim
RECEIVED
  ↓ technical/source/authority controls
VALIDATED
  ↓ authorized approval
APPROVED
  ↓ publication in the active reference registry
OFFICIAL
  ↓ incorporated into a certified frozen package
BASELINE
  ↓ approved successor or applicability withdrawal
SUPERSEDED
  ↓ retention and inactive storage confirmed
ARCHIVED
  ↓ forensic invalidity discovered, when applicable
REJECTED

Rejection branches:
PROPOSED / RECEIVED / VALIDATED / APPROVED / OFFICIAL / BASELINE / ARCHIVED
  └─→ REJECTED only under the transition controls below
```

`REJECTED` is not a normal successor to a valid archive. `ARCHIVED → REJECTED` is reserved for later proof that the archived artefact or its authority was invalid and must never be reused.

## 6.2 State definitions

| State | Meaning | Permitted use |
|---|---|---|
| `PROPOSED` | Submission claim exists; governed bytes may not yet be received | Intake preparation only |
| `RECEIVED` | Exact bytes are preserved, provisionally identified, and hashed | Technical validation only |
| `VALIDATED` | Required intake controls pass; authority approval still pending | Approval review only |
| `APPROVED` | Authorities approve intended scope/version; registry publication pending | Publication preparation only |
| `OFFICIAL` | Published controlling reference for declared scope | Certification input |
| `BASELINE` | Official reference is linked into an approved frozen baseline package | Certification/regression according to baseline applicability |
| `SUPERSEDED` | A successor or withdrawal makes it inactive for new cycles | Historical audit only |
| `ARCHIVED` | Inactive, immutable, retained with manifest and chain | Audit/recovery only |
| `REJECTED` | Integrity, provenance, completeness, authority, duplication, or conflict prevents use | Retained rejection evidence only |

## 6.3 Authorized transitions

| From | To | Trigger | Authority | Evidence |
|---|---|---|---|---|
| None | `PROPOSED` | Authorized intake request identifies proposed source/scope | Program Director or delegate | Mission Order and proposal record |
| `PROPOSED` | `RECEIVED` | Exact bytes and minimum origin claim are received and immediately hashed | P37 Orchestrator records; Evidence Validator witnesses | Receipt timestamp, location, size, provisional hash |
| `PROPOSED` | `REJECTED` | Source is unavailable, unauthorized, out of scope, or known duplicate proposal | Evidence Validator | Rejection reason and canonical-reference link if duplicate |
| `RECEIVED` | `VALIDATED` | All technical, source, viewport, completeness, and authority controls pass | Evidence Validator + Design Authority where visual | Gate matrix and manifest |
| `RECEIVED` | `REJECTED` | Any non-correctable rejection rule applies | Evidence Validator | Failed Gate and retained bytes/hash |
| `VALIDATED` | `RECEIVED` | Missing/correctable manifest evidence requires resubmission without changing bytes | Evidence Validator | Review request and unchanged hash |
| `VALIDATED` | `APPROVED` | Domain authorities approve scope, version, and precedence | Design Authority plus Program Director for official visual sources | Signed approval record |
| `VALIDATED` | `REJECTED` | Approval is refused or a conflict cannot be resolved | Program Director / applicable authority | Decision and conflict record |
| `APPROVED` | `OFFICIAL` | Registry publication confirms unique active scope and effective date | P37 Orchestrator after Program Director approval | Official manifest version and registry record |
| `APPROVED` | `REJECTED` | Approval is withdrawn before publication or final conflict emerges | Approval authority | Withdrawal/rejection record |
| `OFFICIAL` | `BASELINE` | A separately certified screen package is frozen using this reference | Program Director under LOT-009 | Baseline manifest and reference link |
| `OFFICIAL` | `SUPERSEDED` | Approved successor takes effect or reference applicability ends | Design Authority requests; Program Director approves | Successor/withdrawal decision and impact analysis |
| `OFFICIAL` | `REJECTED` | Later audit proves original integrity, authority, or provenance invalid | Program Board | Forensic decision, invalidation impact, preserved record |
| `BASELINE` | `SUPERSEDED` | New certified baseline/reference version replaces its applicability | Program Director / Program Board | Replacement/freeze decision and links |
| `BASELINE` | `REJECTED` | Baseline/reference integrity or authority is proven invalid | Program Board | Invalidation decision and downstream audit |
| `SUPERSEDED` | `ARCHIVED` | Inactive package and all links/hashes are complete and retained | P37 Orchestrator; Evidence Validator verifies | Archive record |
| `ARCHIVED` | `REJECTED` | Forensic audit proves the archived source was never valid for its claimed scope | Program Board | Signed forensic decision and tombstone |

No other transition is permitted. `REJECTED` is terminal; resubmission creates a new Reference ID/version and links to the rejected record. Reverting `SUPERSEDED` or `ARCHIVED` to `OFFICIAL` requires a new Decision Record and new intake cycle, not a state reversal.

# 7 Reference Source Categories

## 7.1 Authority levels

| Level | Meaning |
|---|---|
| `A0` | Formally approved Decision Record or Exception Reference, controlling only its explicit scope |
| `A1` | Official native visual reference or Approved Screenshot explicitly designated for a screen/state |
| `A2` | Canonical UX authority for intent, hierarchy, cognitive load, behavior, and state meaning |
| `A3` | Canonical NFIB/technical authority for implementation contracts and documented technical facts |
| `A4` | Historical certified baseline evidence, authoritative only for its historical regression scope |
| `A5` | Legacy/contextual material with no current controlling authority |
| `NA` | Runtime candidate or unapproved artefact; not a reference authority |

Authority is evaluated per fact. A lower level cannot override a higher level within the same fact/domain. Sources in different domains are combined, not ranked against each other, unless they contradict the same observable requirement.

## 7.2 Source matrix

| Category | Default authority | Governs | Cannot govern | Intake requirements |
|---|---:|---|---|---|
| Figma | `A1` when officially designated; otherwise candidate | Native pixels, geometry, visible content/state represented by the export | Runtime behavior absent from export, missing metadata, business logic | Original export, version/state, native dimensions/hash, Design Authority |
| UX | `A2` | Intent, hierarchy, journeys, cognitive load, meaning, interaction and accessibility expectations | Exact pixels not explicitly observed, runtime implementation | Canonical document/version, applicable sections, UX Authority |
| NFIB | `A3` | Frontend contracts, routes/states, tokens and technical constraints it documents | Missing native pixels or unresolved source conflicts | Canonical document/version, applicable rules, Technical Authority |
| Approved Screenshot | `A1` only when explicitly approved | Exact visible state and pixels within declared bounds | Unshown states/areas, hidden behavior, unsourced viewport | Full capture/reference provenance, contract or source method, Design + Program approval |
| Historical Baseline | `A4` | Prior certified package and regression history | Current design intent after supersession | Baseline manifest, hashes, certification and applicability |
| Exception Reference | `A0` within exact scope | Fact explicitly decided in its Decision Record | Any fact outside scope | Decision ID, reason, affected region/fact, expiry/review, authorities |
| Legacy Reference | `A5` | Context and traceability | Current certification or conflict resolution | Origin if known, legacy label, prohibited-use statement |

## 7.3 Master Reference rules

`FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` is the canonical technical source derived from its documented source corpus for facts it actually contains. It explicitly reports unavailable Figma IDs, nodes, frames, dates, native variables, and other missing data, and it documents a V6.1 basis. It cannot manufacture those facts or silently override pixels in the separately designated native Home V7 visual reference.

For Home visual certification:

- native Home V7 pixels are the designated `A1` visual authority;
- UX Audit is `A2` for intent and hierarchy;
- NFIB/Master Reference are `A3` for applicable implementation facts;
- any same-fact contradiction is frozen and escalated rather than averaged.

# 8 Intake Process

## 8.1 Process flow

```text
Authorized proposal
  ↓
Create provisional Reference ID and declared scope
  ↓
Receive original bytes into controlled intake location
  ↓
Immediately record byte length, format signature, dimensions, and SHA-256
  ↓
Freeze original; prohibit image edits and in-place metadata changes
  ↓
Check exact-hash duplicate registry
  ├─ duplicate → link canonical binary identity; reject duplicate authority record
  └─ unique → continue
  ↓
Validate origin, author/exporter, date, version, screen/state, viewport, completeness
  ↓
Run technical control matrix and conflict scan
  ├─ FAIL → REJECTED with evidence
  └─ PASS → VALIDATED
  ↓
Domain authority review and approval
  ↓
Verify unique active scope and publish manifest
  ↓
OFFICIAL
```

## 8.2 Receipt

Receipt records:

- Mission Order and intake timestamp;
- submitting authority and transfer method;
- original path/name and proposed canonical identity;
- exact file bytes and byte length;
- immediately calculated SHA-256;
- provisional format, dimensions, and status `RECEIVED`;
- screen/state/domain claim;
- chain of custody from origin to intake;
- any missing information without inference.

The original is read-only after receipt. A corrected export is a new candidate, never a repair of the received bytes.

## 8.3 Source and provenance control

Provenance must distinguish:

- origin system/category;
- source file/project identifier when available;
- export method and exporter/author;
- creation/export date and receipt date;
- declared version and relationship to predecessors;
- approval authority;
- native viewport or explicit `UNKNOWN`;
- known crop, missing region, alpha, rotation, compression, and color behavior;
- supporting UX/NFIB/Decision references.

Unknown values remain `UNKNOWN` and may trigger rejection depending on Gate applicability. They are never copied from a filename or neighboring file.

## 8.4 Versioning

- Each logical reference has a stable Reference ID and immutable version records.
- Byte change always creates a new version/hash.
- Metadata or authority change after receipt creates a new manifest version; original evidence remains.
- A successor identifies its predecessor and the exact superseded scope.
- Version strings must be unambiguous and approved; timestamps do not determine precedence.
- Two paths with the same SHA-256 are one binary identity and cannot be counted as two versions.
- An official version remains active until a successor’s effective publication or explicit withdrawal.

# 9 Technical Control Matrix

Exactly twenty-four controls apply to every proposed file, with `NOT_APPLICABLE` allowed only when the Gate defines and justifies it.

| Control | Object | Required result/evidence | Failure effect |
|---|---|---|---|
| `REF-CTL-001` | File existence/readability | Original file exists, is readable in full, and byte length is non-zero | Reject |
| `REF-CTL-002` | Immutable receipt | Exact received bytes preserved; read-only intake identity and chain recorded | Reject |
| `REF-CTL-003` | Format signature | File signature and decoder-recognized format agree with allowed reference format | Reject |
| `REF-CTL-004` | Width | Native pixel width measured and recorded, not inferred from name | Reject if unknown |
| `REF-CTL-005` | Height | Native pixel height measured and recorded, not inferred from name | Reject if unknown |
| `REF-CTL-006` | Aspect ratio | Exact width/height ratio derived and recorded | Reject if inconsistent/unknown |
| `REF-CTL-007` | Color profile/space | Embedded/declared color profile and interpretation recorded, or explicit unknown disposition | Hold/reject according to profile decision |
| `REF-CTL-008` | Compression | Encoding/compression identified; destructive or altered export prohibited | Reject destructive/unknown critical compression |
| `REF-CTL-009` | Alpha/transparency | Alpha presence, pixel format, and intended treatment recorded | Hold/reject if ambiguous and visually material |
| `REF-CTL-010` | Rotation/orientation | Pixel orientation and metadata rotation identified; no silent auto-rotation | Reject mismatch/unknown material rotation |
| `REF-CTL-011` | Metadata | Available metadata inventoried and raw metadata integrity preserved | Hold/reject if required provenance is absent |
| `REF-CTL-012` | Naming | Filename maps to approved Screen ID/state/version convention without being treated as authority | Reject ambiguous identity |
| `REF-CTL-013` | Byte length | Exact byte length recorded and consistent across transfer/storage | Reject mismatch |
| `REF-CTL-014` | SHA-256 | Uppercase SHA-256 calculated from original bytes and stored in manifest | Reject absent/mismatch |
| `REF-CTL-015` | Exact duplicate | Hash registry searched across active, historical, rejected, and archived artefacts | Reject duplicate record; link canonical binary |
| `REF-CTL-016` | Origin | Source category/system/project/file claim recorded and evidenced | Reject unknown origin for official use |
| `REF-CTL-017` | Author/exporter | Human/system author or exporting authority recorded | Hold/reject if required authority unknown |
| `REF-CTL-018` | Dates | Creation/export date, receipt date, and approval dates separated; unknowns explicit | Reject ambiguous precedence claim |
| `REF-CTL-019` | Version | Unique logical version and predecessor/successor relation established | Reject ambiguous/duplicate version |
| `REF-CTL-020` | Viewport | Native source viewport distinguished from image resolution; exact value or `UNKNOWN` recorded | Reject certification use when required mapping is impossible |
| `REF-CTL-021` | Screen/state/domain | Screen ID, state, theme, locale, breakpoint, and governed domain explicitly scoped | Reject ambiguous scope |
| `REF-CTL-022` | Completeness/crop | Full export vs crop, useful-content bounds, missing regions, and export completeness declared | Reject hidden/incomplete required scope |
| `REF-CTL-023` | Authority/status | Submitter, validators, approver, lifecycle state, and effective scope recorded | Reject absent/invalid authority |
| `REF-CTL-024` | Conflicts/relationships | Supporting, contradictory, duplicate, historical, legacy, exception, predecessor, runtime, and baseline links recorded | Freeze/reject unresolved controlling conflict |

No visual-similarity or perceptual-duplicate result is required until an official method is approved. Exact SHA-256 duplicate detection remains mandatory now.

# 10 Figma Native Reference Policy

## 10.1 Native preservation

An official Figma export is preserved byte-for-byte at native resolution. No intake operation may stretch, resize, resample, rotate, crop, recolor, recompress, optimize, annotate, clean, sharpen, blur, or regenerate it.

Home V7 is native `1920 × 995` and remains `1920 × 995`.

## 10.2 Resizing and stretching

- Stretching to `1920 × 1080` is forbidden.
- Resizing to any runtime viewport is forbidden.
- Changing canvas height to imply sourced pixels is forbidden.
- DPI metadata does not authorize pixel resizing.
- A normalized derivative may later be created only by LOT-003 under a traceable, non-destructive transform; the intake original remains unchanged.

## 10.3 Crop policy

At intake:

- the original is never cropped;
- existing crop status and native bounds are recorded;
- a hidden, unknown, or incomplete crop rejects any claim covering the missing area;
- useful-content bounds may be declared only with Design Authority evidence;
- any later comparison crop must use a derived copy, exact integer rectangle, origin/offset, parent hash, reason, and approval;
- cropped derivatives cannot replace the native reference or inherit its hash.

## 10.4 Common-area policy

When a runtime is `1920 × 1080` and the official reference is `1920 × 995`:

1. preserve both originals;
2. prove scale, origins, viewport interpretation, and common anchors;
3. define the common comparison area from corresponding sourced pixels only;
4. do not assume that equal width proves equal coordinate origin;
5. compare at most the mapped native reference bounds when alignment is proven;
6. record the reference rectangle, runtime rectangle, offsets, and excluded areas;
7. leave comparison and normalized derivative creation to LOT-003 and later Lots.

## 10.5 `OUTSIDE_REFERENCE` policy

- Runtime pixels without source correspondence are labeled `OUTSIDE_REFERENCE` or `NO_SOURCE_DATA`.
- They are excluded from similarity denominators and cannot be declared PASS or FAIL from that reference.
- They cannot justify runtime correction or acceptance.
- If product scope requires their certification, a separate official reference must be received and approved.
- The 85-pixel Home height difference is not itself a rejection when the native reference is authentic and its sourced bounds are sufficient for the declared scope.

## 10.6 Current Home reference inventory

| Observed file | Native dimensions | SHA-256 | Intake classification in this mission |
|---|---:|---|---|
| `NOVA_HOME_DESIGN.png` | `1920 × 994` | `49E1CD07C406DCD64BFEF926E18FD4F23E5F4F0B2D5B4ED0C4BD799363C623E3` | Historical V2 candidate; not current authority |
| `NOVA_HOME_DESIGN - Copie.png` | `1920 × 994` | `49E1CD07C406DCD64BFEF926E18FD4F23E5F4F0B2D5B4ED0C4BD799363C623E3` | Exact binary duplicate of V2; cannot become a second reference |
| `NOVA_HOME_V3.png` | `1919 × 995` | `91ED9DDD0ED7E32D8A403A1A0067E048FDE55F4ACF9A029DC1AD6091A1E3C46C` | Historical candidate; not current authority |
| `NOVA-HOME-V4.png` | `1920 × 995` | `AF02B2C48023C3D44BB0184810B821A1A0C8BF4099B48FEA2FD80308775184B4` | Historical candidate; not current authority |
| `NOVA-HOME-V5.png` | `1920 × 995` | `401CB12CF456EF64DC13CE9005D720B9D661DC37BB811AB356BDD056C81A5742` | Historical candidate; not current authority |
| `NOVA-HOME-V6.png` | `1920 × 994` | `63943DBCFD327C27CC075889F1C7AAEAF6411D27F79AE9D616B3A54DEA035DE1` | Historical candidate; not current authority |
| `NOVA-HOME-V7.png` | `1920 × 995` | `D6ADEA2EF7887315C6CC023280AB0307F9494BB6928091314030B53213678A08` | Official-designated Home V7 visual source; no new state transition executed here |
| `INTERFACE_HOME_CONTROL_ORCHESTRATOR.png` | `1599 × 814` | `BCC8D5FAAB49D1E1DA5FB7B7E9D8EA7A9EEDB15D1EFB5951D453420E51AFA7AC` | Different interface; rejected for NOVA Home reference scope |

All files were observed as PNG with 32-bit ARGB decoding and 96 × 96 DPI metadata in the available metadata reader. DPI is recorded evidence only and is not treated as viewport, DPR, or authority.

# 11 Multiple Reference Resolution

## 11.1 General decision rule

Multiple references are resolved by domain, formal authority, exact scope, version, and lifecycle state. They are never resolved by:

- file count or majority;
- newest filesystem timestamp;
- largest dimensions or file size;
- most convenient geometry;
- closeness to current runtime;
- filename alone;
- blending, averaging, or compositing conflicting sources.

If sources govern different facts, both may apply. If they govern the same fact and conflict, the affected fact freezes until the competent authority decides.

## 11.2 Case matrix

| Case | Controlling rule | Rejected or historical treatment |
|---|---|---|
| Two references | Highest applicable formal authority and current `OFFICIAL` version controls the exact shared fact; otherwise conflict | Exact duplicate links to canonical binary; lower/older source becomes supporting, superseded, archived, or rejected according to evidence |
| Three references | Same rule; no two-out-of-three vote | Non-controlling sources retain their truthful status; contradiction remains registered |
| Figma + UX | Figma controls native visual pixels/geometry shown; UX controls intent, hierarchy, behavior, and cognitive constraints | Neither is rejected merely for different domain; same-fact conflict freezes and escalates |
| UX + Runtime | UX controls normative intent; runtime is candidate evidence only | Runtime never wins or becomes reference; nonconforming runtime returns to PROGRAM-036 |
| Figma + Runtime | Official Figma controls referenced visual expectation; runtime is candidate to measure | Runtime cannot override Figma; unsourced runtime area is `OUTSIDE_REFERENCE` |
| Figma + UX + Runtime | Figma and UX jointly govern their domains; runtime is compared later | Runtime has `NA` reference authority; conflict between Figma/UX is escalated, not solved by runtime |
| Approved Screenshot + Figma | Formal scope decides; native Figma remains default A1 unless a Decision Record designates screenshot exception/successor | Unapproved screenshot rejected; superseded official screenshot becomes historical |
| Historical Baseline + current Official Reference | Current Official Reference governs new design conformance; historical baseline governs prior regression history | Historical baseline remains A4 and cannot overrule current A1 |
| Legacy + any current official source | Current official source wins | Legacy remains A5/archived context or is rejected for current certification use |
| Exception Reference + conflicting source | Exception wins only within the exact Decision Record scope and validity period | Outside that scope, normal source authority remains |

## 11.3 Duplicate handling

- Exact SHA-256 match means one binary artefact.
- The first governed canonical record retains binary identity; other paths are aliases/evidence locations, not additional references.
- A duplicate submission is `REJECTED` as a new reference record and links to the canonical Reference ID.
- Duplicate rejection does not delete either existing file in this mission.
- Different hashes with identical dimensions are not declared unique designs or duplicates without further approved evidence.

# 12 Reference Authority

## 12.1 Authority matrix

| Action | Requester | Validator | Approver | Executor/record owner | Rule |
|---|---|---|---|---|---|
| Create/propose | Design Authority, Program Director, or authorized domain authority | P37 Orchestrator checks scope | Program Director authorizes intake Mission Order | Submitter proposes; P37 creates provisional record | Proposal has no official authority |
| Receive | Authorized submitter transfers original | Evidence Validator witnesses integrity | Not applicable | P37 Orchestrator records `RECEIVED` | Immediate hash and immutable receipt required |
| Validate | Not applicable | Evidence Validator; Design/UX/Technical Authority by domain | Not applicable | P37 Orchestrator records Gate results | Producer/submitter cannot be sole validator |
| Approve | Domain authority recommends | Evidence Validator confirms complete evidence | Program Director; Program Board for exception/cross-program conflict | P37 Orchestrator records `APPROVED` | Approval is explicit and scoped |
| Publish as Official | P37 Orchestrator proposes registry publication | Evidence Validator checks unique active scope | Program Director | P37 Orchestrator records `OFFICIAL` | No competing active reference |
| Replace/supersede | Design/domain authority requests successor | Evidence Validator performs impact check | Program Director / Program Board if conflict | P37 Orchestrator links versions and effective dates | Old version remains until successor effective |
| Withdraw/retire | Design/domain authority requests | Evidence Validator assesses impact | Program Director | P37 Orchestrator records supersession/archive path | Withdrawal never deletes evidence |
| Archive | P37 Orchestrator prepares package | Evidence Validator verifies completeness/hashes | Program Director or delegated archive authority | Evidence Owner records `ARCHIVED` | Immutable, recoverable, inactive |
| Delete | No default requester is authorized | Evidence Validator and governance/legal review required | Program Board through explicit destruction Decision Record only | Designated Evidence Owner, if ever authorized | Governed bytes are non-deletable by default; tombstone and decision retained |

## 12.2 Separation and prohibitions

- The image author/exporter cannot alone validate and approve the same reference.
- PROGRAM-036 cannot make a runtime candidate official by labeling it a reference.
- PROGRAM-037 cannot alter a reference to make it pass.
- The P37 Orchestrator records decisions but does not replace Design, Evidence, or Program approval.
- Human approval cannot waive hash, origin, completeness, or manipulation failures.
- Physical file presence cannot bypass the registry and manifest.

# 13 Reference Manifest

## 13.1 Minimum manifest fields

| Field group | Mandatory fields |
|---|---|
| Identity | `Reference ID`, `Screen ID`, state ID, domain, logical reference family, manifest version |
| Source | Origin category, source system/project/file, original filename/path, author/exporter, submitter, transfer method |
| Native geometry | Native width, height, ratio, pixel orientation, resolution, declared source viewport, useful-content bounds, crop/completeness status |
| Image properties | Format/signature, compression, color profile/space, pixel format, alpha/transparency, rotation metadata, DPI metadata |
| Integrity | Byte length, SHA-256, receipt timestamp, storage identity, immutability status, chain of custody |
| Version | Reference version, predecessor, successor, duplicate/canonical binary ID, compatibility and effective scope |
| Scope | Screen, route/state represented, theme, locale, breakpoint, components/regions, excluded and missing areas |
| Lifecycle | Status, proposal/receipt/validation/approval/publication/supersession/archive/rejection dates |
| Authority | Creator/submitter, Evidence Validator, Design/domain validator, approver, publication authority, delegations |
| Relationships | UX/NFIB/Decision sources, supporting/conflicting references, runtime candidates, defects, baselines, exceptions |
| Governance | Applicable intake profile, Gate results, rejection rules checked, conflicts, open decisions, conditions, comments |
| Native policy | Resizing/crop prohibition, `OUTSIDE_REFERENCE` policy, normalization eligibility, no-source declarations |

The specifically required fields are always present: Reference ID, Screen ID, Origin, Viewport, Resolution, Hash, Version, Status, Creation Date, Approval Date, Authority, and Comments. If a value is unknown, the manifest stores `UNKNOWN` plus impact; it never omits the field.

## 13.2 Identifier and immutability rules

- Reference ID is stable and unique across active, superseded, archived, and rejected records.
- Screen ID is stable and independent of filenames and routes.
- Manifest versions are immutable once signed; an update creates a new manifest version.
- Original image hash never changes within a reference version.
- Comments cannot override structured fields, Gate results, or authority decisions.
- A manifest without its original hash and storage identity cannot confer `OFFICIAL` status.

## 13.3 Status registry

The active Reference Registry must support one current controlling record per exact screen/state/domain/profile and retain all non-current records. This Lot defines the registry content but creates no registry file or implementation.

# 14 Quality Gates

Exactly eight Gates operationalize `GATE-P37-REFERENCE-INTEGRITY`.

## 14.1 Gate matrix

| Gate | Objective | Entry | Required controls | PASS output | FAIL output |
|---|---|---|---|---|---|
| `REFERENCE_EXISTS` | Prove the proposed source exists and exact bytes are receivable | Authorized proposal and source location | `REF-CTL-001`, scope identity | Provisional Reference ID and receipt authorized | `REJECTED`; source missing/unreadable/empty |
| `REFERENCE_INTEGRITY` | Prove native bytes, format, geometry, and image properties are intact | `RECEIVED`, original frozen | `REF-CTL-002` through `REF-CTL-013` | Integrity record with native properties | `REJECTED` or held for missing noncritical evidence; no approval |
| `REFERENCE_HASH` | Prove stable unique binary identity | Integrity controls available | `REF-CTL-014`, `REF-CTL-015` | SHA-256 registered; canonical binary identity established | `REJECTED` for absent/mismatch or duplicate new record |
| `REFERENCE_VIEWPORT` | Prove resolution, viewport, bounds, crop, screen/state, and no-source scope are explicit | Hash PASS and source geometry available | `REF-CTL-020` through `REF-CTL-022` | Comparison eligibility bounds documented | `REJECTED` when required scope cannot be mapped; otherwise unresolved condition blocks official use |
| `REFERENCE_SOURCE` | Prove origin, author, date, version, category, and relationships | Hash PASS | `REF-CTL-016` through `REF-CTL-019`, `REF-CTL-024` | Source/provenance and version lineage validated | `REJECTED` for unknown/untrusted origin, ambiguous version, or controlling conflict |
| `REFERENCE_AUTHORITY` | Prove validators/approver and domain precedence are legitimate and independent | Source and viewport Gates PASS | `REF-CTL-023`, authority matrix, conflict scan | Signed authority recommendation and unique scope | `REJECTED`/frozen for missing authority or self-validation |
| `REFERENCE_APPROVED` | Approve and publish one controlling official reference | All prior Gates PASS, complete manifest, no controlling conflict | approval, active-scope uniqueness, effective version/date | State `APPROVED` then `OFFICIAL`; registry record | Remains `VALIDATED` or becomes `REJECTED`; not usable for certification |
| `REFERENCE_BASELINE` | Verify whether an Official Reference is eligible to be linked into a separately certified baseline | `OFFICIAL`, screen certificate and baseline package available under later Lots | manifest/hash consistency, applicability, certificate, no supersession | Reference relationship may enter `BASELINE` after LOT-009 approval | No baseline link; reference may remain `OFFICIAL`, or be invalidated if integrity fails |

## 14.2 Gate sequence

`REFERENCE_EXISTS → REFERENCE_INTEGRITY → REFERENCE_HASH → REFERENCE_VIEWPORT + REFERENCE_SOURCE → REFERENCE_AUTHORITY → REFERENCE_APPROVED → REFERENCE_BASELINE`

`REFERENCE_VIEWPORT` and `REFERENCE_SOURCE` may be reviewed concurrently only as read-only assessments after hash identity is frozen. Their results must both PASS before authority approval. No Gate may be bypassed by filename, prior use, visual similarity, or human preference.

This mission validates the Gate design; it does not run the Gates on Home V7 or create a baseline.

# 15 Rejection Rules

Exactly twenty-four rejection rules apply. Any one applicable rule prevents `OFFICIAL` use.

| Rule | Rejection cause |
|---|---|
| `REF-REJ-001` | File is missing, empty, unreadable, corrupted, or cannot be preserved as exact bytes. |
| `REF-REJ-002` | Format extension, file signature, decoder format, or allowed reference format is inconsistent. |
| `REF-REJ-003` | Native width or height is unknown, zero, impossible, inconsistent, or derived only from filename. |
| `REF-REJ-004` | Aspect ratio, orientation, rotation, or pixel geometry is ambiguous or materially inconsistent. |
| `REF-REJ-005` | Color profile/space, alpha, transparency, or rendering interpretation is materially unknown and prevents trustworthy use. |
| `REF-REJ-006` | Destructive compression, lossy recompression, manual enhancement, annotation, recoloring, cleanup, or other pixel alteration is detected or admitted. |
| `REF-REJ-007` | Image has been stretched, resized, resampled, silently cropped, padded with invented pixels, or generatively extended. |
| `REF-REJ-008` | Required native viewport, source bounds, useful-content bounds, or crop/completeness information is absent and mapping cannot be proven. |
| `REF-REJ-009` | Origin system/category/project/file is unknown, untrusted, or inconsistent. |
| `REF-REJ-010` | Author/exporter, submitter, chain of custody, or transfer source is unknown where required for authority. |
| `REF-REJ-011` | SHA-256 is absent, malformed, calculated from different bytes, or mismatches stored/received content. |
| `REF-REJ-012` | Byte length or file bytes change after receipt without a new Reference ID/version. |
| `REF-REJ-013` | Exact SHA-256 duplicate is submitted as a separate new reference rather than linked to canonical binary identity. |
| `REF-REJ-014` | Version is missing, ambiguous, duplicated, inconsistent with lineage, or chosen only by filesystem timestamp. |
| `REF-REJ-015` | Screen, state, theme, locale, breakpoint, domain, or intended certification scope is absent or contradictory. |
| `REF-REJ-016` | Export is incomplete for the claimed scope, required regions/states are missing, or incompleteness is hidden. |
| `REF-REJ-017` | Candidate is a runtime capture, unofficial screenshot, mock, derivative, or manually modified image without explicit Approved Screenshot/Exception authority. |
| `REF-REJ-018` | Historical, deprecated, superseded, archived, rejected, or legacy material is presented as current official authority. |
| `REF-REJ-019` | Two active references claim the same screen/state/domain/profile without a controlling decision. |
| `REF-REJ-020` | Reference contradicts a higher applicable authority and no Decision Record resolves the exact fact. |
| `REF-REJ-021` | Validator, approver, or delegation is absent, expired, out of scope, conflicted, or not independent. |
| `REF-REJ-022` | Manifest required fields, Gate evidence, approval date, status, comments/conditions, or relationships are absent or inconsistent. |
| `REF-REJ-023` | Storage identity, immutability, access, retention, predecessor/successor, archive, or recovery evidence is insufficient to preserve traceability. |
| `REF-REJ-024` | An unresolved reference, source, authority, baseline, certification, lock, or documentary conflict affects the claimed use. |

Rejection never deletes or edits evidence. It records `REJECTED`, reason, failed controls/Gates, authority, timestamp, original hash, and any canonical duplicate or conflict link.

# 16 Risk Register

Only risks evidenced by current sources and reference inventory are recorded.

| ID | Risk | Evidence | Impact | Control | Status |
|---|---|---|---|---|---|
| `R-REF-001` | Multiple Home versions can be mistaken for concurrent authorities | V2, V3, V4, V5, V6, and V7 images coexist | Wrong visual source selected | Lifecycle/status registry; V7 designation; one active scope | CONTROLLED by model; records not yet operationalized |
| `R-REF-002` | Exact duplicate can inflate reference count | V2 and “V2 - Copie” share SHA-256 | Duplicate/false version | `REFERENCE_HASH`, canonical binary identity | CONFIRMED |
| `R-REF-003` | Historical source can appear current from filename/timestamp | Versioned directories and close timestamps exist | Obsolete reference used | Authority/state/version Gates; timestamps non-authoritative | CONFIRMED |
| `R-REF-004` | Native image may lack complete export provenance/viewport metadata | Master Reference reports missing Figma file/URL, frames, nodes, dates, and IDs | Incomplete intake mapping | Explicit `UNKNOWN`, Design approval, viewport/completeness Gate | CONFIRMED |
| `R-REF-005` | Technical Master Reference documents V6.1 while Home visual authority is V7 | Master Reference metadata vs designated V7 PNG | Same-fact source/version conflict | Domain scoping and open reconciliation decision | CONFIRMED |
| `R-REF-006` | Native `1920 × 995` can be stretched to runtime `1920 × 1080` | Known 85-pixel height difference | False geometry and invented pixels | Immutable native policy and common-area model | CONFIRMED, CONTROLLED |
| `R-REF-007` | Manual modification may be undetectable without origin chain | Existing files alone do not prove export chain | Altered image accepted | Immutable receipt, provenance, checksum, approval | REAL downstream risk |
| `R-REF-008` | Incomplete export can hide required states/regions | Figma Master Reference lists unavailable frames/variants/assets and known limitations | False completeness claim | Screen/state/completeness manifest and rejection rule | CONFIRMED |
| `R-REF-009` | Runtime or unrelated screenshot can be misclassified as design reference | `INTERFACE_HOME_CONTROL_ORCHESTRATOR.png` coexists with NOVA Home files; runtime category requested in conflict cases | Self-referential certification | Runtime has `NA` authority; source/category Gate | CONFIRMED |
| `R-REF-010` | Future baseline or archive corruption can invalidate history | Architecture/DR require immutable hashes and recovery | Regression authority loss | SHA-256, versioned storage, baseline/archive Gates | REAL governance risk |

No baseline is created or tested by this mission. Risk controls are documentary until their authorized operational Lots execute.

# 17 Open Decisions

Only unresolved decisions are listed; none is resolved here.

| Decision ID | Open decision | Required authority | Blocking scope |
|---|---|---|---|
| `OD-REF-001` | Canonical Reference ID, screen/state suffix, and logical-version naming convention | P37 Orchestrator + Evidence Validator + Program Director | Operational registry/manifests |
| `OD-REF-002` | Canonical manifest serialization, signature, registry location, and schema versioning | Evidence Validator + Technical Authority + Program Board | Automated/operational manifest exchange |
| `OD-REF-003` | Governed reference storage, access control, retention, archive, recovery, and destruction policy | Evidence Owner + Program Board | Official storage/archival |
| `OD-REF-004` | Named Design Authority, Evidence Validator, Program Director, and delegation records for first intake | Program Director / Program Board | First authority signatures |
| `OD-REF-005` | Complete provenance of Home V7 export: source Figma file/project/frame/node, exporter, export date, and viewport semantics | Design Authority | Full new intake evidence; existing official designation remains recorded |
| `OD-REF-006` | Reconciliation of V6.1 technical Master Reference with native V7 visual reference for any overlapping contradictory fact | Design Authority + UX/Technical Authorities + Program Board if needed | Conflicting same-fact use |
| `OD-REF-007` | Canonical color profile/space and treatment of images with absent/ambiguous embedded profiles | Design Authority + Evidence Validator | Color-sensitive official intake/comparison |
| `OD-REF-008` | Canonical alpha/transparency and rotation/orientation policy per reference class | Design Authority + Evidence Validator | Material alpha/orientation cases |
| `OD-REF-009` | Authority and evidence standard for declaring useful-content bounds and later approved crop rectangles | Design Authority + Evidence Validator | Cropped/common-area derivatives |
| `OD-REF-010` | Approved method for detecting perceptual/near duplicates when SHA-256 differs | Technical Authority + Evidence Validator + Program Board tool decision | Near-duplicate automation; exact-hash control remains active |

These open decisions do not prevent approval of the intake governance model. They prevent only their dependent operational transition or Gate from passing.

# 18 Final Verdict

**Decision: REFERENCE INTAKE APPROVED**

The official PROGRAM-037 Reference Intake system is defined:

- nine lifecycle states and all authorized transitions are explicit;
- seven source categories and domain authority levels are defined;
- twenty-four mandatory technical controls cover native geometry, image properties, provenance, version, viewport, completeness, authority, conflicts, and SHA-256;
- eight Quality Gates operationalize `GATE-P37-REFERENCE-INTEGRITY`;
- twenty-four rejection rules prevent duplicates, obsolete/unofficial/incomplete/modified/contradictory sources from becoming official;
- reference creation, validation, approval, replacement, withdrawal, archive, and default non-deletion authorities are allocated;
- the manifest model contains all mandatory fields and immutable lineage;
- Home V7 remains native `1920 × 995`; no stretch, resize, crop, or baseline was performed;
- multiple-source cases are resolved by domain and formal authority, never by vote or runtime convenience;
- ten real risks and ten open decisions are registered.

Lot decision:

- Reference Intake governance: `PASS`;
- existing Home V7 state transition: `NOT EXECUTED`;
- baseline creation: `NOT AUTHORIZED`;
- image modification/capture/comparison: `NOT AUTHORIZED`;
- `LOT-003 — Normalization Model`: `AUTHORIZED` under a distinct Mission Order.

No code, image, capture, tool, baseline, PROGRAM-036 file, PROGRAM-037 source, or existing reference was created, modified, installed, executed, or resolved outside this single document.

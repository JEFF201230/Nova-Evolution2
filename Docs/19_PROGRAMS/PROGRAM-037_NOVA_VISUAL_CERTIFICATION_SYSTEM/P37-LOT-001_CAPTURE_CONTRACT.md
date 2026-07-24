# 1 Document Control

| Field | Value |
|---|---|
| Document ID | `P37-LOT-001_CAPTURE_CONTRACT` |
| Mission ID | `P37-MO-001-CAPTURE-CONTRACT` |
| Program | `PROGRAM-037 — NOVA Visual Certification System` |
| Lot | `LOT-001 — Capture Contract` |
| Document type | Normative visual capture contract |
| Status | `APPROVED WITH OPEN DECISIONS` |
| Effective date | 2026-07-13 |
| Contract owner | PROGRAM-037 |
| Governance authority | `P37-DR-001 — Visual Certification Governance` |
| Change authority | Dedicated Decision Record approved under `P37-DR-001` |
| Applies to | Every NOVA candidate capture submitted for visual certification |
| Exclusions of this mission | No code, script, installation, browser run, capture, comparison, or certification |

This contract defines whether a candidate capture is eligible for PROGRAM-037 intake. It does not approve a browser, produce a capture, or certify an interface.

## 1.1 Table of contents

1. Document Control
2. Purpose
3. Scope
4. Roles and Responsibilities
5. Capture Authority
6. Runtime Preconditions
7. Browser Contract
8. Viewport Contract
9. Rendering Contract
10. UI State Contract
11. Data Contract
12. Capture Output Contract
13. Quality Gates
14. Rejection Rules
15. Acceptance Rules
16. Evidence Model
17. Open Decisions
18. Final Verdict

## 1.2 Glossary

| Term | Definition |
|---|---|
| Candidate capture | Runtime image submitted by PROGRAM-036; not yet accepted as official evidence |
| Official capture | Candidate that passed every applicable capture Quality Gate |
| Capture Contract | This immutable set of universal governance and evidence requirements |
| Capture Profile | Approved, versioned values that instantiate all required contract parameters for one screen/state class |
| Capture Run | One authorized and immutable production session identified by a unique run ID |
| Runtime viewport | Browser content viewport expressed in CSS pixels |
| Output resolution | PNG dimensions expressed in image pixels |
| DPR | Device pixel ratio mapping CSS pixels to device/image pixels |
| Native reference | Official Figma export preserved at its original pixel dimensions |
| Common comparison area | Traceable rectangle containing corresponding sourced pixels in reference and runtime |
| `OUTSIDE_REFERENCE` | Runtime pixels for which the official reference contains no corresponding source pixels |
| `OPEN_DECISION` | Mandatory parameter whose official value has not yet been approved; it cannot be guessed |
| `VIEWPORT` | Capture of the browser content viewport at one fixed scroll position |
| `FULL_PAGE` | Capture covering the document’s scrollable page extent, without browser or operating-system chrome |
| `FULL_SCREEN` | Operating-system or full browser-window screenshot; not equivalent to a clean viewport capture |
| `SCROLLED_SEQUENCE` | Ordered set of captures from declared scroll offsets |
| `PARTIAL_REGION` | Capture of a declared sub-rectangle; supporting evidence only unless a profile explicitly scopes certification to that region |
| `MULTI_CAPTURE_SET` | Manifested set of states, regions, viewports, or scroll positions belonging to one run |
| Browser chrome | Address bar, tabs, bookmarks, menus, window frame, devtools, extensions, and browser overlays |
| External overlay | Any layer not belonging to the certified NOVA state, including rulers, grids, inspectors, cursors, notifications, or capture-tool UI |

# 2 Purpose

The purpose of this contract is to make official NOVA runtime captures deterministic, comparable, traceable, rejectable, and reproducible.

The contract has two levels:

1. **Universal contract rules.** The numbered `CAP` rules in this document apply to every capture.
2. **Approved Capture Profile.** A profile supplies the exact browser, version, mode, viewport, DPR, state, data, locale, time, and other values for a defined certification scope.

A value marked `OPEN_DECISION` is not optional. It means no official capture may rely on that parameter until an approved Decision Record and Capture Profile supply the value.

## 2.1 Normative sources

| Source | Role |
|---|---|
| `PROGRAM_037_PROGRAM_ARCHITECTURE.md` | Capture, normalization, evidence, Gate, and native-reference model |
| `P37-DR-001_VISUAL_CERTIFICATION_GOVERNANCE.md` | Exclusive contract ownership and authority separation |
| `P37-LOT-000_PROGRAM_READINESS.md` | Readiness verdict, detected environment, and open downstream conditions |
| `ORCHESTRATION_GOVERNANCE.md` | Assignment, execution/validation separation, conflict, lock, and closure rules |
| `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md` | Routes, UI states, fonts/assets, interactions, and Pixel Perfect constraints |
| `NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md` | Determinism, test, route, state, review, and source-traceability rules |

## 2.2 Current repository observations

The current `apps/nova-web/` structure contains React/Vite source, routes, Home fixtures, shell/surface components, tests, a built `dist/`, Playwright configuration, and Vite configuration.

Read-only configuration findings:

| Item | Current finding | Contract status |
|---|---|---|
| Vite server | `127.0.0.1:5173` | Observed, not automatically an approved certification endpoint |
| Playwright base URL | `http://127.0.0.1:5173` | Observed, not automatically an approved route/profile |
| Playwright web server | `npm run dev`, port `5173`, reuse enabled | Development workflow observed; certification authorization remains profile-specific |
| Playwright project | Named `chromium`, spreads `Desktop Chrome` device defaults | Observed candidate only; official engine/profile remains `OPEN_DECISION` |
| Declared Playwright range | `^1.55.0` | Not an exact reproducibility pin |
| Installed Playwright packages | `1.61.1` | Detected, not executed or approved by this Lot |
| Explicit viewport/DPR/locale/timezone/reduced-motion | Not present in current Playwright config | Must be supplied by an approved Capture Profile |
| Vite mode | Development server configured; build/preview scripts also exist | Runtime mode must be declared and authorized per capture |

No current configuration file is modified or promoted to normative capture authority by this document.

# 3 Scope

This contract governs:

- request, production, validation, and certification roles;
- runtime readiness;
- browser environment;
- viewport and output resolution;
- rendering resources and interaction state;
- deterministic data and time;
- capture modalities;
- file format, naming, metadata, hashes, storage, and versioning;
- automatic rejection and acceptance;
- minimum evidence;
- open decisions required before operational capture.

This contract does not govern:

- frontend correction;
- screenshot or browser automation implementation;
- Pixel Diff tool choice;
- visual tolerance values;
- normalization implementation;
- screen certification verdicts;
- baseline creation;
- installation of browsers, packages, libraries, or services.

## 3.1 Contract rules

| Rule | Requirement |
|---|---|
| `CAP-001` | Every capture belongs to exactly one authorized PROGRAM-037 capture cycle and one unique Mission Order. |
| `CAP-002` | Every capture uses one approved, versioned Capture Profile applicable to the exact screen and state. |
| `CAP-003` | No `OPEN_DECISION` parameter may be filled by operator preference, tool default, inference, or convenience. |
| `CAP-004` | Original candidate pixels and metadata are immutable after submission; a change creates a new run. |
| `CAP-005` | A capture is evidence only for its declared screen, route, state, data, environment, viewport, and time scope. |
| `CAP-006` | Capture production and independent capture validation must be performed by distinct authorities for the same run. |
| `CAP-007` | A capture contract conflict freezes intake of the affected candidate and follows `P37-DR-001`. |
| `CAP-008` | Passing this capture contract makes a runtime image eligible for later comparison; it never certifies visual conformity. |

# 4 Roles and Responsibilities

## 4.1 Responsibility matrix

| Activity | Program Director | P37 Orchestrator | P36 Capture Producer | Evidence Validator | Visual Certification Authority | Design/UX/A11y Authorities |
|---|---|---|---|---|---|---|
| Authorize capture cycle | A | R for recording | I | I | C | I |
| Define universal contract | A through Decision Record | R for governance | C | C | C | C when domain affected |
| Approve Capture Profile | A | R for version/registry | C | V | C | V when domain affected |
| Prepare runtime state | I | C | R | I | I | I |
| Produce candidate capture | I | I | R | I | I | I |
| Preserve production evidence | I | A | R | V | I | I |
| Validate contract conformance | I | C | I | R/V | C | C when needed |
| Accept/reject capture intake | I | R for state | I | V | A | I |
| Certify screen visually | A for final approval | R for state | I | V | R/V | V in their Gates |
| Freeze baseline | A | R | I | V | C | C |

Legend: `R` responsible, `A` accountable/approver, `V` validator, `C` consulted, `I` informed.

## 4.2 Separation rules

- PROGRAM-036 may produce the candidate but cannot validate or certify its visual conformity.
- PROGRAM-037 owns the contract, intake decision, evidence, certification chain, and baseline.
- The P37 Orchestrator enforces sequence and records state; it cannot replace the Evidence Validator or certifier.
- A tool result cannot exercise an authority role.
- Role delegation must be explicit, current, scoped, and recorded.

# 5 Capture Authority

## 5.1 Who requests the capture

Only the Program Director, or a formally delegated Program Board authority, requests a capture by authorizing a unique capture Mission Order. The P37 Orchestrator records the request and verifies prerequisites.

The request must identify screen, state, purpose, reference, route, data profile, Capture Profile, required modalities, producer, evidence validator, and closure conditions.

## 5.2 Who produces the capture

PROGRAM-036, through the explicitly assigned Capture Producer, produces the runtime candidate. Production may be manual or automated only when the method and tool are approved for that run. The producer records facts; it does not assert certification.

## 5.3 Who validates the capture

The PROGRAM-037 Evidence Validator independently validates conformance with this contract and the Capture Profile. Design, UX, or Accessibility Authorities validate only their affected domain when the profile or state requires them.

## 5.4 Who certifies

The PROGRAM-037 Visual Certification Authority may later certify the screen after capture intake and all applicable comparison Gates. The Program Director approves the final screen certificate. Capture acceptance alone is never certification.

## 5.5 Authority flow

```text
Program Director authorizes a capture Mission Order
  ↓
P37 Orchestrator validates scope, lock, profile, and assignments
  ↓
P36 Capture Producer prepares the authorized runtime state
  ↓
P36 Capture Producer produces candidate image + production evidence
  ↓
P37 Evidence Validator applies capture Quality Gates
  ├─ FAIL → candidate REJECTED; new capture requires authorization
  └─ PASS → RUNTIME_CAPTURE_RECEIVED; eligible for later normalization
        ↓
P37 visual certification chain operates under separate Lots/Gates
```

# 6 Runtime Preconditions

| Rule | Requirement |
|---|---|
| `CAP-009` | The application must be started from the repository/build identity declared in the capture request, and that identity must be recorded. |
| `CAP-010` | The runtime mode must be `VALID_BUILD` or `DEVELOPMENT_AUTHORIZED`; development mode is allowed only when the Mission Order and Capture Profile explicitly allow it. |
| `CAP-011` | Required technical checks and their results must be identified by the request; an absent or failed required check rejects runtime readiness. |
| `CAP-012` | The exact requested route must resolve stably without unintended redirect, fallback route, lab shell, placeholder surface, or route ambiguity. |
| `CAP-013` | All required data must be loaded and the application-ready condition defined by the profile must be satisfied before capture. |
| `CAP-014` | Uncaught JavaScript errors, unapproved console errors, visible error overlays, and critical resource/network failures are prohibited. |
| `CAP-015` | Animations, transitions, caret blinking, video, progress motion, skeleton motion, and asynchronous layout changes must be disabled, completed, or frozen as defined by the profile. |
| `CAP-016` | Fonts, icons, images, and other layout-affecting resources must be fully loaded and remain stable for the required stabilization observation. |
| `CAP-017` | The producer must prove that the declared route, state, data, scroll position, and rendered geometry remained unchanged during the stabilization interval and capture. |

## 6.1 Build and development mode

- `VALID_BUILD` requires the exact build identity and evidence required by the Mission Order.
- `DEVELOPMENT_AUTHORIZED` requires explicit justification, stable dev-server identity, absence of development overlays, and proof that development rendering is acceptable for the intended evidence.
- The currently observed Vite command and local endpoint do not themselves authorize development capture.
- Reuse of an existing server is acceptable only if its repository/build identity and state are freshly verified; otherwise it is rejected.

# 7 Browser Contract

| Rule | Requirement |
|---|---|
| `CAP-018` | Browser engine identity must be explicitly approved in the Capture Profile; current value is `OPEN_DECISION`. |
| `CAP-019` | Exact browser and automation package versions must be recorded and match the approved profile; version ranges alone are insufficient. |
| `CAP-020` | Browser mode (`HEADLESS` or `HEADED`) must be approved and recorded; current value is `OPEN_DECISION`. |
| `CAP-021` | Window outer dimensions, content viewport dimensions, position, maximized/full-screen state, and display assignment must be controlled separately. |
| `CAP-022` | Browser chrome, including address bar and tabs, must not appear in the official runtime image; if a full-screen environment record includes it, that image is supporting evidence only. |
| `CAP-023` | Browser extensions, injected toolbars, translators, password managers, accessibility overlays, ad blockers, and other content modifiers are forbidden unless explicitly required by the reference state. |
| `CAP-024` | Cache, storage, cookies, service workers, permissions, and network state must match an approved profile; unresolved values are `OPEN_DECISION`. |
| `CAP-025` | The browser user profile must be dedicated or proven clean, identified, and free of uncontrolled personalization; exact policy is `OPEN_DECISION`. |
| `CAP-026` | Developer tools, inspectors, responsive emulation UI, rulers, grids, FPS meters, automation banners, and capture-tool overlays must not be visible or alter layout. |
| `CAP-027` | Browser launch flags, environment variables, user agent, color settings, and rendering-affecting preferences must be recorded and must not diverge from the approved profile. |

## 7.1 Current Playwright configuration assessment

The existing Playwright configuration is an implementation input, not an approved Capture Profile.

| Parameter | Observed | Contract decision |
|---|---|---|
| Project/engine candidate | `chromium` / `Desktop Chrome` defaults | `OPEN_DECISION`; observation does not approve it |
| Exact installed version | `1.61.1` | Must be pinned/approved before official use |
| Declared dependency | `^1.55.0` | Range is insufficient as certification evidence |
| Mode | Not explicit | `OPEN_DECISION` |
| Viewport and DPR | Inherited, not explicit in repository config | Must be explicit in profile and evidence |
| Locale/timezone/color/reduced motion | Not explicit | Must be explicit in profile |
| Base URL | `http://127.0.0.1:5173` | May be proposed for a profile; not approved here |
| Server | Vite development, reuse allowed | Requires explicit `DEVELOPMENT_AUTHORIZED` decision per run/profile |

No Playwright or browser command was executed for this contract.

# 8 Viewport Contract

| Rule | Requirement |
|---|---|
| `CAP-028` | Capture Profile must state viewport width and height in CSS pixels and output width and height in image pixels as distinct fields. |
| `CAP-029` | Orientation must be explicitly `LANDSCAPE` or `PORTRAIT` and must match the approved profile. |
| `CAP-030` | DPR must be explicitly fixed and recorded; the official value for each profile is `OPEN_DECISION` until approved. |
| `CAP-031` | Browser zoom is 100% unless a later approved Decision Record and Capture Profile explicitly authorize another value. |
| `CAP-032` | No manual, browser, operating-system, editor, or post-capture resizing is allowed after the approved viewport is established. |
| `CAP-033` | Operating-system display scaling, emulation scale, screenshot scale, and any CSS-to-image pixel mapping must be recorded and internally consistent. |
| `CAP-034` | Every capture declares exactly one modality: `VIEWPORT`, `FULL_PAGE`, `FULL_SCREEN`, `SCROLLED_SEQUENCE`, `PARTIAL_REGION`, or `MULTI_CAPTURE_SET`. |
| `CAP-035` | A capture modality may be used for certification only when the Mission Order and Capture Profile authorize it and define its extent, origin, scroll, region, and completeness rules. |
| `CAP-036` | Reference/runtime dimension differences are handled through later traceable common-area normalization, never by stretching, arbitrary resizing, or changing native reference pixels. |

## 8.1 Home V7 native-reference case

The official Home V7 reference is native `1920 × 995`. It remains exactly `1920 × 995`.

The Home pilot runtime target established by program governance is `1920 × 1080` for the runtime viewport/candidate profile, subject to explicit approval of the remaining DPR, browser, mode, environment, and state fields. The different height is governed as follows:

- preserve the reference original at `1920 × 995`;
- preserve the runtime original at its approved `1920 × 1080` output/viewport mapping;
- never stretch the reference to 1080 pixels;
- never shrink the runtime to 995 pixels as an undocumented substitute for normalization;
- prove scale and origins before comparison;
- define the later common sourced rectangle, at most the mapped `1920 × 995` area when origins and scale correspond;
- classify the runtime-only lower area as `OUTSIDE_REFERENCE` or `NO_SOURCE_DATA`;
- exclude that area from similarity denominators and conformity claims;
- require a separate official reference if that lower area must be certified.

## 8.2 Capture modalities

| Modality | Contract treatment |
|---|---|
| `VIEWPORT` | Default candidate modality for a fixed screen state; exact viewport and scroll position required |
| `FULL_PAGE` | Captures the full scrollable document without browser chrome; page height, scroll extent, sticky behavior, and tool method required; not interchangeable with viewport evidence |
| `FULL_SCREEN` | May document the environment/window only; cannot be the comparison image when it includes browser/OS chrome or scales the content |
| `SCROLLED_SEQUENCE` | Ordered captures at declared offsets; overlap and sticky/fixed elements recorded; no silent stitching |
| `PARTIAL_REGION` | Exact source rectangle, coordinate system, and purpose required; cannot alone certify the full screen |
| `MULTI_CAPTURE_SET` | Each member has a unique ID and state/extent; one immutable manifest proves order, completeness, and shared environment |

Multiple captures are mandatory when one image cannot represent all required scroll positions, states, drawers, modals, or responsive profiles. Members from different runs cannot be combined silently.

# 9 Rendering Contract

| Rule | Requirement |
|---|---|
| `CAP-037` | Every required font family, file/version, style, and weight must load successfully before stabilization; fallback rendering is prohibited unless the approved reference/profile requires it. |
| `CAP-038` | Icons, including SVG, sprite, font, or component icons, must be loaded, visible, and identical in source identity to the declared runtime candidate. |
| `CAP-039` | Images and background images must be decoded and complete; broken, pending, substituted, or externally blocked images reject the capture. |
| `CAP-040` | Theme, color scheme, contrast mode, forced-colors state, and reduced-motion preference must be explicit and match the profile. |
| `CAP-041` | Operating system, display renderer, graphics mode, color profile, and anti-aliasing context must be recorded; official values remain `OPEN_DECISION` until profile approval. |
| `CAP-042` | Scrollbar presence, width, gutter, overlay/classic mode, and visibility must be controlled; unresolved platform behavior is `OPEN_DECISION`. |
| `CAP-043` | Focus must be on the element declared by the UI State Profile, or explicitly absent from visible content; focus rings cannot be accidental. |
| `CAP-044` | Hover must be on the declared target or explicitly neutral; the pointer must be hidden from the official runtime image unless it is the subject of the state. |
| `CAP-045` | Text selection, caret, drag state, autofill, spellcheck marks, context menus, native tooltips, and transient browser UI are forbidden unless explicitly required by the certified state. |

Rendering resources must be verified by evidence, not assumed because the page appears visually complete.

# 10 UI State Contract

| Rule | Requirement |
|---|---|
| `CAP-046` | Exact application route and route-state identity must match the request; `/home`, `/work`, `/decisions`, `/deliverables`, lab, shell, or fallback states are never interchangeable. |
| `CAP-047` | Navigation selection, menu expansion, tab, accordion, panel, and secondary navigation states must be explicitly declared. |
| `CAP-048` | Drawer, modal, dialog, popover, tooltip, search, and composer states must each be declared `OPEN`, `CLOSED`, or `NOT_APPLICABLE`; implicit state is forbidden. |
| `CAP-049` | Notifications, badges, toasts, banners, system messages, and in-app overlays must match the approved state; unrelated transient items must be absent. |
| `CAP-050` | Loaders, skeletons, empty states, blocked states, error states, success states, and pending states must match the exact requested scenario and must not be mixed accidentally. |
| `CAP-051` | Any visible JavaScript error overlay, development error panel, stack trace, unapproved fallback, or broken component rejects the candidate. |
| `CAP-052` | Scroll position, focused element, hovered element, active element, selection, open overlays, and state identifiers must remain unchanged from stabilization through image creation. |

## 10.1 Required UI State Profile fields

- screen ID and route/path;
- query and route parameters;
- primary navigation item;
- menu and submenu state;
- active tab/section;
- panel and drawer state;
- modal/dialog/popover/tooltip state;
- notification/toast/banner state;
- loading/skeleton/empty/error/blocked/success state;
- focus, hover, selection, pointer, and scroll state;
- expected visible headings and state markers;
- expected absence assertions for external or transient overlays.

# 11 Data Contract

| Rule | Requirement |
|---|---|
| `CAP-053` | Every capture uses a named, versioned, immutable fixture or data snapshot; live uncontrolled data is prohibited. |
| `CAP-054` | Fixture content, ordering, identifiers, counts, formatting inputs, and expected visible labels must be deterministic and hashable or otherwise integrity-identifiable. |
| `CAP-055` | Clock, date, relative-time source, and capture instant must be frozen when visible or layout-affecting; exact policy belongs to the Capture Profile. |
| `CAP-056` | User identity, role, permissions, avatar source, account state, and personalization must be declared and deterministic. |
| `CAP-057` | Language, locale, number/date/currency formatting, text direction, and translation source must be declared; unresolved canonical values are `OPEN_DECISION`. |
| `CAP-058` | Time zone and daylight-saving interpretation must be declared; unresolved canonical values are `OPEN_DECISION`. |
| `CAP-059` | Dynamic content, random values, counters, network responses, notification arrival, relative dates, and asynchronous ordering must be frozen, masked only by approved policy, or cause rejection. |

The current `homeFixture.ts` demonstrates a static candidate dataset, but its existence does not make it an approved certification Data Profile. Approval requires an ID, version/hash, scope, user/locale/time context, and expected visible values.

# 12 Capture Output Contract

| Rule | Requirement |
|---|---|
| `CAP-060` | Official runtime images use lossless PNG; lossy encoding, post-capture enhancement, optimization that changes pixels, color conversion without approval, or metadata-driven rescaling is forbidden. |
| `CAP-061` | The accepted canonical runtime filename is `<SCREEN_ID>_RUNTIME.png` inside a uniquely versioned capture-run package; multi-capture members use approved state/member IDs in the manifest without overwriting the canonical mapping. |
| `CAP-062` | Capture metadata must include all contract/profile fields, authorities, repository/build ID, tool versions, timestamps, dimensions, modality, state/data IDs, errors, stabilization evidence, and parent Mission Order. |
| `CAP-063` | SHA-256 and byte length are calculated for the immutable output and every associated evidence file after production; any later mismatch rejects the package. |
| `CAP-064` | Storage location, run ID, version, access, retention, predecessor/successor relation, and acceptance/rejection state must be recorded; an accepted file is never overwritten. |

## 12.1 Naming and versioning

- Canonical screen IDs follow the PROGRAM-037 artefact model.
- `<SCREEN_ID>_RUNTIME.png` is unique within one versioned run directory.
- A recapture creates a new run/version, even when the visible result appears unchanged.
- A `MULTI_CAPTURE_SET` has a manifest mapping each member to screen, state, viewport, scroll/region, and canonical role.
- A filename never carries authority by itself; the manifest, metadata, Gate results, and hash make it official.

## 12.2 Metadata location

Capture metadata is preserved as a PROGRAM-037 Evidence Record and later represented in the capture section of `<SCREEN_ID>_MEASUREMENTS.json` and the certification report. This contract does not create a new canonical artefact file or schema implementation.

# 13 Quality Gates

Exactly ten capture Quality Gates apply in sequence.

## 13.1 Control matrix

| Gate | Object | Mandatory controls | Minimum evidence | PASS | FAIL authority / consequence |
|---|---|---|---|---|---|
| `QG-CAP-01-AUTHORITY-PROFILE` | Authorized request and complete profile | Mission Order, roles, screen/state, profile version, no open required field | Authorization and profile record | Scope, roles, and all values explicit | Evidence Validator rejects before production/intake |
| `QG-CAP-02-RUNTIME-READINESS` | Stable valid runtime | repository/build, mode, checks, endpoint, route readiness | build/runtime identity, check results, readiness record | Runtime is authorized and ready | Candidate rejected; PROGRAM-036 must prepare a new valid runtime |
| `QG-CAP-03-BROWSER-INTEGRITY` | Controlled browser environment | engine/version/mode/window/chrome/extensions/cache/profile/flags | browser/environment manifest | Exact approved browser profile proven | Candidate rejected; recapture required |
| `QG-CAP-04-VIEWPORT-RESOLUTION` | Correct geometry | CSS viewport, output pixels, orientation, DPR, zoom, display scale, no resize | independent dimensions and profile comparison | Every geometry field matches | Automatic rejection |
| `QG-CAP-05-RENDERING-RESOURCES` | Complete deterministic rendering | fonts, icons, images, theme, antialias context, scrollbar | resource load and environment evidence | All required resources/profile values match | Automatic rejection |
| `QG-CAP-06-UI-STATE` | Correct route and UI state | route, navigation, overlays, modal/drawer, notifications, loader/error, focus/hover/scroll | state record and expected markers | Exact requested state proven | Automatic rejection |
| `QG-CAP-07-DATA-INTEGRITY` | Deterministic data | fixture, user, locale, timezone, time, dynamic content | data profile ID/hash and visible-value checks | Exact approved data profile proven | Automatic rejection |
| `QG-CAP-08-STABILITY-ERRORS` | Stable error-free frame | animation, layout/resource stability, JS/console/network errors, external overlays | stabilization observations and error inventory | Stable frames and zero prohibited errors/overlays | Automatic rejection |
| `QG-CAP-09-OUTPUT-EVIDENCE` | Valid immutable package | PNG, name, dimensions, modality, metadata, SHA-256, storage/version | output and complete evidence record | Package is complete, immutable, and reproducible | Package rejected |
| `QG-CAP-10-CAPTURE-ACCEPTANCE` | Final capture intake | Results of QG-CAP-01 through 09, conflict scan, validator independence | signed Gate matrix and intake decision | All prior Gates PASS and no conflict | `RUNTIME_CAPTURE_MISSING`/rejected; no comparison allowed |

## 13.2 Relationship to PROGRAM-037 Gate

`QG-CAP-01` through `QG-CAP-10` operationalize `GATE-P37-RUNTIME-CAPTURE-INTEGRITY`. A future candidate passes that Program Gate only when all ten controls pass for the same immutable run.

This document validates the contract design only. It does not apply these Gates to a real capture.

# 14 Rejection Rules

Any one rejection rule is sufficient to reject the candidate automatically. Human review cannot waive an integrity failure.

| Rule | Automatic rejection cause |
|---|---|
| `REJ-001` | Capture has no authorized Mission Order, Capture Profile, run ID, or assigned producer/validator. |
| `REJ-002` | A required Capture Profile field remains `OPEN_DECISION`, missing, implicit, or filled from an unapproved default. |
| `REJ-003` | Output resolution differs from the approved profile or is not independently verifiable. |
| `REJ-004` | CSS viewport width/height, orientation, DPR, display scale, or CSS-to-image mapping differs from the approved profile. |
| `REJ-005` | Browser zoom is not the approved value, including any unapproved value other than the contract default of 100%. |
| `REJ-006` | Image or content was stretched, resized, resampled, enhanced, recompressed lossily, or silently color-converted. |
| `REJ-007` | Required font family, file, version, style, or weight is absent, late, substituted, or rendered through unapproved fallback. |
| `REJ-008` | Required icon or image is absent, broken, pending, substituted, blocked, or not decoded. |
| `REJ-009` | Fixture, user, role, permissions, data ordering, language, locale, timezone, clock, or dynamic content differs from the approved Data Profile. |
| `REJ-010` | Route, query parameters, redirect result, navigation selection, screen, or application state is incorrect or ambiguous. |
| `REJ-011` | Required panel, menu, drawer, modal, dialog, popover, notification, toast, loader, skeleton, empty/error/blocked/success state is incorrect. |
| `REJ-012` | Animation, transition, caret, video, skeleton motion, asynchronous layout shift, or other prohibited motion is active or stability is unproven. |
| `REJ-013` | Visible JavaScript error, development error overlay, stack trace, broken component, unapproved console error, or critical network/resource error exists. |
| `REJ-014` | External overlay, ruler, grid, inspector, browser extension UI, automation banner, operating-system notification, capture-tool UI, or unrelated cursor is visible or changes layout. |
| `REJ-015` | Developer tools or responsive-emulation controls are visible, open in a layout-affecting way, or their impact is unrecorded. |
| `REJ-016` | Browser engine, exact version, mode, window, profile, cache/storage, extensions, launch flags, or renderer differs from the approved Browser Profile. |
| `REJ-017` | Browser address bar, tabs, bookmarks, menus, window frame, or other chrome appears in an image submitted as the official runtime comparison image. |
| `REJ-018` | Theme, color scheme, contrast/forced-colors state, reduced-motion state, anti-aliasing context, or scrollbar differs or is unproven. |
| `REJ-019` | Focus, hover, active element, selection, caret, pointer, native tooltip, autofill, context menu, or scroll position differs from the requested state. |
| `REJ-020` | Capture modality, extent, origin, scroll offsets, partial rectangle, full-page height, or multi-capture completeness is missing, incorrect, or ambiguous. |
| `REJ-021` | Full-screen, full-page, scrolled, partial, or multiple captures are substituted for the authorized modality or silently stitched/combined across runs. |
| `REJ-022` | PNG, filename, metadata, byte length, SHA-256, storage, version, or predecessor relationship is absent, invalid, inconsistent, or altered. |
| `REJ-023` | Producer validates its own capture, authority/delegation is missing, or a Gate decision lacks an independent Evidence Validator. |
| `REJ-024` | Any unresolved reference, capture, baseline, tool, certification, source, or lock conflict affects the candidate’s integrity or authority. |

Rejection effect:

- the candidate is preserved as rejected evidence;
- it does not enter normalization, measurement, overlay, Pixel Diff, certification, or baseline processes;
- its state is not `RUNTIME_CAPTURE_RECEIVED`;
- any replacement is a new authorized run with a new hash and evidence record;
- rejection never authorizes PROGRAM-037 to correct the runtime or image.

# 15 Acceptance Rules

A candidate is accepted only when all conditions below are true.

| Criterion | Acceptance condition |
|---|---|
| `ACC-001` | One authorized Mission Order and one applicable approved Capture Profile identify the run. |
| `ACC-002` | Producer, Evidence Validator, P37 Orchestrator, and approval authority are explicitly assigned without conflict. |
| `ACC-003` | Application identity, runtime mode, route, required checks, and ready state are proven. |
| `ACC-004` | Browser engine/version/mode/window/profile/cache/flags exactly match the approved profile. |
| `ACC-005` | Viewport, output resolution, orientation, DPR, zoom, display scale, and modality exactly match. |
| `ACC-006` | Fonts, icons, images, theme, renderer context, scrollbar, and other rendering resources pass. |
| `ACC-007` | Route and every required UI state field match; prohibited transient or external UI is absent. |
| `ACC-008` | Fixture/data, user, locale, timezone, clock, dynamic values, and ordering match. |
| `ACC-009` | Stabilization and error evidence prove no prohibited motion, JavaScript error, resource failure, or layout change. |
| `ACC-010` | Output is lossless PNG, unmodified, correctly named, dimensioned, versioned, stored, and hashed. |
| `ACC-011` | Modality-specific evidence proves completeness of viewport/full-page/full-screen/scrolled/partial/multiple capture treatment. |
| `ACC-012` | Native-reference mismatch is not hidden by resize; later common-area treatment is declared where applicable. |
| `ACC-013` | Every rejection rule has been checked and none applies. |
| `ACC-014` | `QG-CAP-01` through `QG-CAP-10` all PASS for the same immutable run. |
| `ACC-015` | Evidence Validator signs capture acceptance and the P37 Orchestrator records `RUNTIME_CAPTURE_RECEIVED`. |

Acceptance effect:

- the capture becomes official input evidence for its declared scope;
- it is eligible for reference intake/normalization sequencing as governed by PROGRAM-037;
- it is not visually certified and does not create a baseline;
- later discovery of an integrity conflict invalidates acceptance and reopens intake.

# 16 Evidence Model

## 16.1 Minimum evidence package

| Evidence group | Mandatory evidence |
|---|---|
| Authority | Mission Order, cycle/run ID, scope, producer, Evidence Validator, delegations, lock |
| Source identity | repository path, revision/build identifier, working-tree policy, runtime mode, technical check references |
| Browser | product, engine, exact versions, mode, window, viewport, DPR, zoom, user profile, cache/storage, flags, extensions, user agent |
| Host/rendering | OS/version, display assignment/scaling, renderer/graphics mode, color profile, font manifest/load result, theme, scrollbar, antialiasing context |
| Route/UI | URL/route, query parameters, redirects, navigation, panel/menu/drawer/modal/notification/loading/error, focus, hover, selection, scroll |
| Data | fixture/snapshot ID and integrity, user/role, language/locale, timezone, frozen date/time, dynamic-content policy, expected visible values |
| Stability | application-ready marker, resource completion, stabilization observations, animation/motion state, JS/console/network error inventory |
| Output | modality, extent/rectangles/offsets, original PNG, dimensions, byte length, SHA-256, filename, run/version/storage identity |
| Multiple captures | set manifest, member IDs/hashes, shared session evidence, state/scroll/region mapping, completeness |
| Gate decision | QG-CAP-01 through 10 results, validator signature, rejection/acceptance decision, conflicts and conditions |

## 16.2 Evidence rules

- Evidence describes observed facts, not assumptions.
- Screenshot pixels alone do not prove viewport, DPR, zoom, route, data, fonts, browser, or time.
- Metadata without the exact image hash is not evidence for that image.
- Logs or manifests produced after the fact must prove their source and cannot rewrite production facts.
- Every evidence item records producer, timestamp, method, version, parent run, and SHA-256 when file-based.
- Rejected evidence remains retained and linked to any replacement run.
- Sensitive profile or user information must follow repository security governance; redaction cannot remove a comparison-critical fact.
- The capture package is complete only when an independent validator can reproduce the conformance decision without oral context.

## 16.3 Capture record minimum fields

- program, Lot, Mission Order, cycle, run, screen, state, reference and profile IDs;
- route, query, data, user, locale, timezone, time and dynamic-state IDs;
- repository/build/runtime mode and technical checks;
- browser/engine/automation exact versions and launch environment;
- window, viewport, output, DPR, zoom, scaling and orientation;
- font/icon/image/theme/renderer/scrollbar evidence;
- modality, region, scroll, full-page or multi-set details;
- stabilization, page/console/network errors, and external-overlay checks;
- file name, format, byte length, SHA-256, storage and version;
- producer/validator identities, Gate results, decision, reason, timestamp and signature reference.

# 17 Open Decisions

Only decisions not fixed by the consulted sources and governance are listed.

| Decision ID | Open decision | Required authority | Blocks |
|---|---|---|---|
| `OD-CAP-001` | Official browser engine/product for each certification profile | Technical Authority + Evidence Validator + Program Board Decision Record | Official browser profile |
| `OD-CAP-002` | Exact browser, Playwright/automation, and related package version-pinning policy | Technical Authority + Evidence Validator + Program Board Decision Record | Reproducible automated capture |
| `OD-CAP-003` | Headless or headed browser mode and any allowed differences | Evidence Validator + Program Board Decision Record | Official browser profile |
| `OD-CAP-004` | Canonical outer-window/display placement and full-screen environment-evidence policy | Technical Authority + Evidence Validator | Official window profile |
| `OD-CAP-005` | Cache, cookies, storage, service worker, permission, network, and clean-user-profile policy | Technical Authority + Evidence Validator | Browser integrity PASS |
| `OD-CAP-006` | DPR and operating-system display scaling for each capture profile, including Home pilot | Technical Authority + Design Authority + Evidence Validator | Viewport integrity PASS |
| `OD-CAP-007` | Canonical OS, renderer/graphics mode, color profile, and antialiasing environment | Technical Authority + Design Authority + Evidence Validator | Rendering profile and color/typography comparison |
| `OD-CAP-008` | Scrollbar mode, width/gutter, visibility, and platform policy | Design Authority + Evidence Validator | Layout-sensitive capture |
| `OD-CAP-009` | Canonical language, locale, timezone, clock, user, and versioned fixture for each screen/state | Program Director + PROGRAM-036 + Design/UX Authorities | Data Profile acceptance |
| `OD-CAP-010` | Stabilization observation method and duration; no numeric duration is invented here | Evidence Validator + Technical Authority | Stability Gate operation |
| `OD-CAP-011` | FULL_PAGE and SCROLLED_SEQUENCE capture/stitching policy, including sticky-element handling | Evidence Validator + Design Authority | Those modalities |
| `OD-CAP-012` | PARTIAL_REGION and MULTI_CAPTURE_SET manifest/coverage policy | Evidence Validator + Visual Certification Authority | Region/set acceptance |
| `OD-CAP-013` | Canonical storage, access-control, retention, archival, and run-version registry | Program Board + Evidence Owner | Final official capture package storage |
| `OD-CAP-014` | Whether Vite development mode or only built/preview mode is accepted for each certification class | Technical Authority + Evidence Validator + Program Board Decision Record | Runtime mode acceptance |

These decisions must be approved through the mechanism fixed by `P37-DR-001`. Their absence does not invalidate this contract, but it rejects or prevents any capture whose applicable profile needs the unresolved value.

The Pixel Diff engine and visual tolerances remain open under separate PROGRAM-037 governance. They are not capture-contract choices and are not selected here.

# 18 Final Verdict

**Verdict: CAPTURE CONTRACT APPROVED — READY WITH CONDITIONS**

The contract is complete and normative at the rule level:

- 64 universal capture rules are fixed;
- 24 automatic rejection rules are fixed;
- 10 capture Quality Gates are defined;
- authority, runtime, browser, viewport, rendering, UI state, data, output, evidence, acceptance, and rejection are governed;
- native `1920 × 995` Figma references and `1920 × 1080` runtime candidates are handled through a traceable common area without stretch or arbitrary resize;
- viewport, full-page, full-screen, scrolled, partial, and multiple captures have explicit treatment;
- all unsourced operational values remain `OPEN_DECISION` and cannot be guessed.

Contract readiness decision:

- contract design: `PASS`;
- operational capture without approved profile: `REJECTED`;
- actual capture execution: `NOT AUTHORIZED` by this document;
- screen comparison/certification: `NOT AUTHORIZED` by this document;
- `GATE-P37-RUNTIME-CAPTURE-INTEGRITY`: defined operationally but not applied to a real capture;
- `LOT-002 — Reference Intake`: `AUTHORIZED` under a distinct Mission Order.

No code, script, frontend file, PROGRAM-036 document, governance source, browser, capture, comparison, Pixel Diff, certification, library, or tool was created, modified, installed, or executed.

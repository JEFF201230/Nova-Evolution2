# PROGRAM-018

# Product Studio V1 Figma Handoff

## Status

COMPLETE — READY FOR PROFESSIONAL FIGMA PRODUCTION

## Authority and Boundary

This handoff executes P18-M-007 and supports P18-M-011 under P18-MO-001. The certified V0 package remains the product authority. This document specifies production setup and acceptance; it does not create a Figma file, high-fidelity artwork or React implementation.

---

# 1. Required Figma File

File name:

`PROGRAM-018_PRODUCT_STUDIO_V1`

Pages, in order:

1. `00 Cover & Read Me`
2. `01 Foundations`
3. `02 Components`
4. `03 Patterns`
5. `04 Desktop Screens`
6. `05 Tablet Screens`
7. `06 Mobile Screens`
8. `07 Prototype Flows`
9. `08 Accessibility Annotations`
10. `09 Content & Localization`
11. `10 Developer Handoff`
12. `11 Decisions & Changelog`

Cover SHALL show version, status, owner, source package, last update, supported viewports and a warning that V1 does not authorize React implementation.

---

# 2. Naming and Organization

## Frames

`[SCREEN_ID] / [Viewport] / [State] / [Mode]`

Examples:

- `S09 / Desktop / Blocked / Executive`
- `S20 / Mobile / Decide / Executive`
- `S31 / 320 Reflow / Offline / Standard`

## Components

`NOVA/[Category]/[Component]`

Example: `NOVA/Decision/Option`.

## Variables and styles

Use semantic names, not raw appearance:

- `color/background/default`
- `color/text/primary`
- `color/status/critical`
- `space/300`
- `radius/medium`
- `motion/standard`

## Prototype entry points

`PF-[NN] / [Flow Name] / [Viewport]`.

Layers SHALL be named by meaning (`Outcome heading`, `Primary action`, `Source status`) and not `Frame 42` or `Rectangle 8`.

---

# 3. Reference Frames and Layout

| Viewport | Frame | Grid | Margins / gutters | Behavior |
| --- | --- | --- | --- | --- |
| Desktop | 1440×1024 | 12 columns | 64 / 24 | persistent rail, optional contextual panel |
| Compact desktop | 1200×900 | 12 columns | 40 / 20 | reduced auxiliary detail |
| Tablet | 834×1194 | 8 columns | 32 / 20 | collapsed global navigation |
| Mobile | 390×844 | 4 columns | 16 / 16 | bottom navigation, single column |
| Minimum reflow | 320×800 | 4 columns | 16 / 12 | no loss or overlap |

All screens and components SHALL use Auto Layout, constraints, variables, component properties and text styles. Absolute positioning is reserved for intentional overlays. Prose measure SHALL not exceed approximately 72 characters.

---

# 4. Screen Production Contract

Produce all 32 certified screens from S01 Welcome / Start through S32 Help & Support. Each screen section SHALL contain:

1. purpose annotation;
2. context and page title;
3. outcome/status summary;
4. one primary next action;
5. exceptions and attention items;
6. main content;
7. supporting detail/history;
8. responsive note;
9. interaction note;
10. accessibility callouts.

Desktop default is mandatory for S01–S32. Desktop required variants follow the certified V0 inventory. S01, S04, S07, S09, S19, S20, S24 and S31 SHALL additionally be fully produced at Tablet, Mobile and 320 Reflow. Other screens SHALL use validated responsive pattern instances with at least one spot-check frame per structural pattern.

The connected frame IDs, flow destinations and content dataset are defined in `PROGRAM_018_PRODUCT_STUDIO_V1_PROTOTYPE.md` and SHALL be used without renaming screen IDs.

---

# 5. Component and Variant Contract

| Component set | Properties / variants | Mandatory states |
| --- | --- | --- |
| Button | kind: primary/secondary/quiet/destructive; size | default, hover, focus, pressed, disabled, loading |
| Icon Button | icon, tooltip, label, badge | all interaction states |
| Input | text/multiline/search; validation | empty, focus, filled, error, disabled, read-only |
| Objective Composer | attachment, voice, submission | empty, typing, attachment, voice, submitting, error |
| Choice | checkbox/radio/switch | unchecked, checked, indeterminate, focus, disabled, error |
| Select / Combobox | result status | closed, open, selected, no result, error, disabled |
| Navigation | global/local/mobile; badge | default, active, collapsed, focus |
| Tabs | horizontal/selector | active, inactive, focus, overflow |
| Card | work/decision/deliverable/expert/source/example | default, focus, selected, attention, critical |
| Status | neutral/active/attention/blocked/complete | icon plus visible text |
| Progress | phase/narrative/determinate | determinate only with real data |
| Alert / Toast | info/success/warning/critical | inline, banner; dismiss where allowed |
| Dialog | standard/destructive/critical | focus trap, cancel, confirmation |
| Drawer / Sheet | detail/contribution/filter | desktop drawer, mobile full-screen sheet |
| Table / Record list | sort/select/density | empty, loading, stacked mobile |
| Person / Agent | human/AI/service | text identity always visible |
| Confidence | low/moderate/high | basis, assumptions, open questions |
| Source | available/stale/missing/contradictory | provenance and usage link |
| Decision Option | neutral/recommended/selected/rejected | recommendation never preselected |
| File | upload lifecycle | uploading, ready, failed, restricted, removed |
| Empty / Error | context type | first use, filtered, permission, offline, partial |
| Timeline / Phase | state and owner | planned, active, blocked, complete |
| Notification | action/update/critical | unread, read, focused |

Each component description SHALL state accessible name, semantic role, value/state exposure, focus behavior, keyboard activation and responsive transformation.

---

# 6. Shared Pattern Assemblies

Build reusable assemblies for App Shell, Mobile Bottom Navigation, Work Header, Local Navigation, Objective Composer, Mission Canvas, Next Action, Attention Summary, Plan Phase, Activity Event, Expert Contribution, Source–Claim Linkage, Confidence Lens, Decision Package, Decision Pause, Deliverable Lineage, Error Summary, Unsaved Change Protection and Permission Preview.

Decision Pause SHALL be a two-frame pattern: Review then Decide. It SHALL have no preselected outcome, preserve Cancel/Return, expose consequence and authority, and route success to a Decision Receipt.

---

# 7. Interaction and Transition Specification

| Interaction | Figma action | Transition | Duration | Reduced motion |
| --- | --- | --- | --- | --- |
| Page navigation | Navigate to | Instant or Dissolve | 120–180 ms | Instant |
| Local view change | Change to / Navigate to | Smart Animate when spatially stable | 200 ms | Dissolve |
| Drawer | Open overlay | Move in from edge | 200 ms | Instant |
| Mobile sheet | Open overlay | Move in from bottom | 200 ms | Instant |
| Dialog | Open overlay | Dissolve | 150 ms | Instant |
| Expand details | Change to | Smart Animate | 180 ms | Instant |
| Success confirmation | Change to / Navigate | Dissolve | 180 ms | Instant |
| Loading to result | After delay for demonstration only | Dissolve | 150 ms | Instant |

Primary actions SHALL have one unambiguous destination. Escape closes noncritical overlays. Close/cancel returns focus conceptually to its trigger. Destructive actions require consequence-proportional confirmation. Deep-link and Back paths SHALL be wired. No hover-only route is accepted.

Prototype delays simulate presentation only and SHALL be annotated `SIMULATED — NOT A PERFORMANCE PROMISE`.

---

# 8. Responsive Handoff Rules

- Desktop: persistent rail, visible local navigation, maximum two meaningful content columns plus optional contextual panel.
- Tablet: collapse rail; one primary content column; details move to drawer/overlay; no hover dependency.
- Mobile: single column; Home, Work, Decisions and Deliverables in labeled bottom navigation; one sticky primary action maximum.
- Tabs become a labeled selector when labels do not fit.
- Tables transform into labeled records; essential horizontal scrolling requires visible instructions and preserved row headers.
- Dialogs become full-screen sheets where space or zoom requires it.
- Comparison tables stack by criterion, repeating option identity.
- Long labels wrap; truncation SHALL not hide required meaning or action.
- At 200% text zoom and 400% browser zoom, controls and text reflow without overlap; sticky elements do not consume most of the viewport.

---

# 9. Accessibility Annotation Contract

Use annotation IDs `A11Y-[SCREEN_ID]-[NN]` and link each callout to a component or frame. Every prototype screen SHALL document:

- landmarks and logical headings;
- initial focus and sequential focus order;
- keyboard commands and overlay focus return;
- visible label, accessible name, role, value and state;
- live-region text and politeness for asynchronous changes;
- error summary, field association and correction;
- semantic contrast token and measured ratio;
- pointer target size/spacing;
- 320 px reflow transformation;
- screen-reader-only context where needed;
- reduced-motion equivalent;
- alternative to drag, gesture, voice and hover;
- critical confirmation and authority requirements.

Acceptance thresholds: 4.5:1 normal text, 3:1 large text, 3:1 UI/non-text; complete keyboard operation; visible unobscured focus; no color-only meaning; input preserved after errors; status announced without focus theft; text equivalents for charts and audiovisual material.

---

# 10. Content Handoff

The Figma file SHALL use realistic, editable content components. Required content modes:

- Guided: short sentences, one question, examples and reassurance.
- Standard: concise context, recommendation basis and next action.
- Executive: outcomes, exceptions, tradeoffs, authority and decision deadline first.
- Expert: structured identifiers, provenance and detailed assumptions disclosed on demand.

NOVA voice is calm, direct, specific and nonjudgmental. It distinguishes fact, hypothesis, interpretation, recommendation and innovation. It never claims certainty without basis and never describes a recommendation as a decision.

Content review SHALL test English plus long French and German strings, localized dates/numbers/currencies, names with diacritics, pluralization, missing values and confidential content. Public screens SHALL not expose unexplained internal vocabulary. No lorem ipsum is permitted.

---

# 11. Prototype Flow Setup

Create entry points for PF-01 through PF-11 as specified in the Prototype Specification. Each flow section SHALL include:

- title and scenario;
- population/role;
- starting frame;
- connected happy path;
- alternate or error branch;
- success frame;
- test question;
- accessibility walkthrough note.

Connections SHALL use the exact S01–S32 identifiers. Each overlay, error branch and permission branch SHALL have a return path. Flow covers SHALL state whether the path is Guided, Standard, Executive or Expert.

---

# 12. Developer Handoff Metadata

Even without React implementation, every component SHALL expose:

- canonical component name;
- purpose and permitted uses;
- properties and variant matrix;
- content slots and character stress examples;
- state transitions;
- responsive behavior;
- keyboard/focus contract;
- accessibility semantics;
- token references;
- empty/loading/error/permission behavior;
- analytics event intent where product measurement is required;
- source screen usage.

Screen annotations SHALL identify layout regions, component instances, content ownership, conditional visibility, data dependencies and policy-controlled actions. They SHALL avoid prescribing framework-specific code.

---

# 13. Review and Acceptance Checklist

## Structure

- All 12 pages exist and use the required order.
- S01–S32 Desktop frames and certified variants exist.
- Responsive proof frames exist for all eight priority screens.
- Auto Layout, grids, variables, semantic text styles and components are used consistently.

## Product and content

- One product narrative and one public language are maintained.
- Every screen has a clear purpose and one primary next action.
- Fact, uncertainty, recommendation, decision and AI identity remain distinguishable.
- VEEDDA scenario preserves beneficiary, CSE and administrator role boundaries.

## Interaction

- PF-01 through PF-11 have no dead ends.
- Back, Cancel, Retry and Help preserve context.
- Decision Pause is two-step and unselected by default.
- AI work can be stopped and partial output remains labeled incomplete.

## Responsive and accessibility

- 320 px reflow, 200% text and simulated 400% zoom reviews pass.
- Keyboard-only completion passes for create, decision, deliverable and error recovery flows.
- Focus, live region, error and overlay annotations are complete.
- Color, motion, drag, hover and voice always have alternatives.

## Handoff

- Every component has variants, states, tokens and behavior documented.
- Every screen identifies component usage and conditional behavior.
- No prototype timing is presented as a production performance guarantee.
- No React work or high-fidelity Figma artifact is represented as completed by this document.

---

# 14. Handoff Decision

FIGMA V1 PRODUCTION READY

The professional design team MAY assemble the Product Studio V1 Figma file from this specification and the certified V0 sources. Completion remains subject to the full Product Studio V1 validation and certification decision.

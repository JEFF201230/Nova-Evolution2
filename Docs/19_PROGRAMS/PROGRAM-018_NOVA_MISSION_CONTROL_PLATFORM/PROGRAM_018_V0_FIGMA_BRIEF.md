# PROGRAM-018

# NOVA V0 Figma-Ready Brief

## Status

READY FOR PROFESSIONAL HIGH-FIDELITY DESIGN

## 1. Figma File Structure

The professional Figma file SHALL use these pages:

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
11. `10 Decisions & Changelog`

Frame naming format:

`[SCREEN_ID] / [Viewport] / [State] / [Mode]`

Example: `S08 / Desktop / Default / Executive`.

## 2. Reference Viewports

- Desktop: 1440×1024.
- Compact desktop: 1200×900.
- Tablet: 834×1194.
- Mobile: 390×844.
- Minimum reflow review: 320×800.

All frames SHALL use auto layout, layout grids, reusable components, variables and text styles. Fixed coordinates SHALL be avoided except for intentional overlays.

## 3. Exact Screen Inventory

| ID | Screen | Required variants |
| --- | --- | --- |
| S01 | Welcome / Start | first use, returning, voice available, no voice |
| S02 | Objective Composer | empty, typing, attachment, validation error |
| S03 | Clarification | Guided, Standard, skipped optional question |
| S04 | Mission Canvas Review | default, edited, unresolved assumptions |
| S05 | Plan Preview | create, recover, analyze, decide, produce |
| S06 | Start Confirmation | autonomy A0–A3, permission conflict |
| S07 | Home | new, active, attention, all-clear |
| S08 | Work List | cards, table expert view, empty, filtered |
| S09 | Work Overview | active, blocked, at risk, completed |
| S10 | Plan | phases, list, dependency, empty |
| S11 | Activity | feed, filtered, empty, loading |
| S12 | People & Experts | directory, contribution request, access warning |
| S13 | Sources | list, source detail, contradiction, missing source |
| S14 | Work Decisions | pending, decided, no decisions |
| S15 | Work Deliverables | drafts, review, published, empty |
| S16 | Recovery Intake | files added, missing context, sensitive-data warning |
| S17 | Recovery Diagnosis | low confidence, contradictions, recovery ready |
| S18 | Research Workspace | question map, findings, gaps, synthesis ready |
| S19 | Decision Package | default, dissent, insufficient basis, updated version |
| S20 | Decision Pause | approve, reject, request changes, defer, critical |
| S21 | Decision Receipt | approved, rejected, changes requested, deferred |
| S22 | Deliverable Setup | document, presentation, dashboard, summary |
| S23 | Deliverable Outline | default, source gaps, edited |
| S24 | Deliverable Review | comments, unresolved issue, ready |
| S25 | Export & Share | permission, confidentiality, export progress, success |
| S26 | Global Decisions | needs me, waiting, history, empty |
| S27 | Global Deliverables | drafts, review, published, empty |
| S28 | Search / Command | initial, results, no result, recent |
| S29 | Notifications | grouped, empty, critical alert |
| S30 | Preferences | mode, language, accessibility, AI controls |
| S31 | Error & Recovery | recoverable, partial, offline, permission denied |
| S32 | Help & Support | contextual help, human support, report problem |

## 4. Screen Specifications and Textual Wireframes

### S01 — Welcome / Start

Content order:

1. Global header: NOVA, organization, utilities.
2. Greeting.
3. H1: “What would you like to achieve?”
4. Objective Composer compact instance.
5. Outcome examples: Create something; Fix work; Understand a situation; Make a decision.
6. Returning only: Continue and Needs attention.
7. Privacy/context note.

Primary interaction: focus composer on load unless returning user has a critical attention item; never steal focus after load.

Mobile: examples become two-column buttons; returning sections follow composer.

Accessibility: H1 is page heading; examples are buttons with full names; voice control includes text alternative; privacy note linked from composer help.

### S02 — Objective Composer

Sections:

- label: “Describe the outcome you want”;
- helper: “Use your own words. You can change this later.”;
- multiline field;
- attachments with status/removal;
- voice input when supported;
- primary: Continue;
- secondary: Use an example.

Validation: blank submission yields “Describe what you want to achieve, even approximately.” Input is preserved.

### S03 — Clarification

Sections:

- progress text: “A few questions to prepare the right path”;
- current objective summary, editable;
- one question per visual block;
- rationale link: “Why NOVA asks this”;
- suggested answers plus free text;
- Back, Skip when optional, Continue.

Maximum three questions before showing the first Mission Canvas. Additional gaps appear as assumptions, not an endless interview.

### S04 — Mission Canvas Review

Sections:

- H1: “Here is what NOVA understood”;
- outcome;
- why it matters / audience;
- success looks like;
- constraints;
- assumptions;
- people and decision authority;
- edit controls per section;
- primary: Prepare a plan;
- secondary: Ask another question.

Unresolved assumptions use label + icon + text, never amber alone.

### S05 — Plan Preview

Sections:

- outcome summary;
- phase timeline;
- first three actions;
- people/experts proposed;
- expected deliverables;
- decisions likely to require the user;
- assumptions and risks;
- estimated range where available, labeled as estimate;
- primary: Review how NOVA will work;
- secondary: Edit plan.

### S06 — Start Confirmation

Sections:

- scope summary;
- autonomy selector A0–A3 with plain labels;
- “NOVA will” and “NOVA will ask before” lists;
- data/access summary;
- notification preference;
- primary: Start work;
- secondary: Back to plan.

A3 unavailable states explain policy reason and present nearest allowed option.

### S07 — Home

Sections in order:

- H1: “Good [time], [name]” or neutral “Welcome back”;
- primary start composer/button;
- Needs attention: decisions, blockers, expiring items;
- Continue: maximum three items;
- Recent outcomes/deliverables;
- optional portfolio summary for authorized managers.

All-clear copy: “Nothing needs your attention right now.” Follow with Continue or Start new work.

### S08 — Work List

Sections:

- H1 Work;
- start new work;
- search/filter/sort;
- filter chips: Active, Needs attention, Mine, Team, Completed;
- results;
- saved view in Expert mode only.

Card fields: outcome title, plain type, health label, owner, next action, last meaningful update. Table expert view adds identifiers, dates and structured status.

### S09 — Work Overview

Sections:

- work header: title, health, owner, actions;
- local navigation;
- outcome and success;
- “What needs attention”;
- current phase and next action;
- progress narrative;
- upcoming decisions;
- recent contributions;
- deliverables;
- collapsible confidence/assumptions.

Blocked variant places blocker summary immediately after header and makes “Review blocker” primary.

### S10 — Plan

Sections:

- view switch: phases / list;
- phase groups with outcome, state and owner;
- action rows with status, due date and dependency;
- add/request change action subject to role;
- change-impact preview before material edits.

Drag is optional enhancement only; keyboard/menu alternatives required.

### S11 — Activity

Sections:

- filters: All, People, NOVA, Decisions, Files;
- chronological grouped feed;
- contribution composer;
- load older activity.

Each event names actor, action, object and time. AI events are explicitly labeled.

### S12 — People & Experts

Sections:

- current people and roles;
- invite human;
- recommended expertise;
- expert directory;
- contribution request drawer;
- access preview.

Expert card: human/AI label, specialty, availability, expected contribution, source/data access, estimated effort/cost if available.

### S13 — Sources

Sections:

- source coverage summary;
- add source;
- filters: Used, Needs review, Contradictory, Missing;
- source list;
- selected source detail;
- claims/sections using source.

No “verified” label without a defined validation basis.

### S14 — Work Decisions

Sections:

- pending decision callout;
- upcoming decisions;
- completed decision history;
- filters and owner;
- start decision package.

### S15 — Work Deliverables

Sections:

- create deliverable;
- drafts;
- in review;
- published;
- audience, owner, version and last update.

### S16 — Recovery Intake

Sections:

- current situation in user words;
- upload/link existing work;
- known symptoms;
- constraints and deadlines;
- people and authority;
- “What is fact / What is reported / What is missing” summary;
- primary: Diagnose the situation.

### S17 — Recovery Diagnosis

Sections:

- health summary with confidence explanation;
- immediate threats;
- likely causes;
- contradictory information;
- missing information;
- stabilization actions for next 72 hours;
- proposed recovery phases;
- primary: Review recovery plan.

### S18 — Research Workspace

Sections:

- research question and audience;
- question map;
- source coverage;
- findings grouped as Fact, Hypothesis, Interpretation, Recommendation, Innovation;
- contradictions;
- unanswered questions;
- synthesis preview;
- primary: Prepare synthesis.

### S19 — Decision Package

Sections:

- decision statement and authority;
- deadline and consequence of no decision;
- executive summary;
- options comparison;
- NOVA recommendation labeled as recommendation;
- criteria and tradeoffs;
- risks and affected parties;
- assumptions and uncertainty;
- dissent/alternative view;
- sources;
- change since previous version;
- primary: Review decision;
- secondary: Request another option.

### S20 — Decision Pause

Step 1 Review:

- exact decision;
- selected option;
- consequences;
- affected money/people/data/obligations;
- reversibility;
- unresolved uncertainty;
- authority identity;
- checkbox only for a meaningful acknowledgement;
- Continue to decision.

Step 2 Decide:

- Approve, Request changes, Reject, Defer;
- rationale field with requirement indicated;
- no preselected choice;
- Cancel and return.

Critical variant requires re-authentication only when policy demands it.

### S21 — Decision Receipt

Sections:

- decision outcome;
- who, when and scope;
- rationale;
- resulting actions;
- immutable reference in Expert detail;
- return to work;
- share/download record if authorized.

### S22 — Deliverable Setup

Sections:

- format cards: Document, Presentation, Dashboard, Executive summary;
- audience;
- purpose;
- language/locale;
- confidentiality;
- deadline;
- source scope;
- primary: Prepare outline.

### S23 — Deliverable Outline

Sections:

- audience/purpose header;
- reorderable outline with keyboard controls;
- source coverage per section;
- missing/uncertain content;
- add/remove/edit section;
- primary: Create draft.

### S24 — Deliverable Review

Sections:

- document preview / slide navigator / dashboard preview;
- issue summary;
- comments;
- source and assumption toggles;
- version history;
- primary: Approve for export;
- secondary: Request changes.

### S25 — Export & Share

Sections:

- version and approval state;
- format/settings;
- audience and recipients;
- confidentiality warning;
- include lineage appendix toggle;
- accessibility options (tagged PDF intent, alt text status, reading order review);
- final preview;
- Export or Share.

### S26 — Global Decisions

Sections:

- H1 Decisions;
- Needs my decision;
- Waiting on others;
- Upcoming;
- History;
- filters by work, risk and deadline.

### S27 — Global Deliverables

Sections:

- H1 Deliverables;
- create;
- Drafts, In review, Published;
- search/filter;
- cards/list with format, audience, owner, version and status.

### S28 — Search / Command

Sections:

- search input;
- recent actions;
- grouped results: Work, Decisions, Deliverables, People, Sources;
- command actions available only with permission;
- result context and highlighted matching term.

### S29 — Notifications

Sections:

- Needs action;
- Updates;
- Earlier;
- mark read and preference link.

Notifications SHALL deep-link to the exact object and state why the user received them.

### S30 — Preferences

Sections:

- experience mode;
- explanation depth;
- language and formats;
- text/contrast/motion preferences;
- notification controls;
- AI autonomy defaults with organization limits;
- memory/context controls where supported;
- save confirmation.

### S31 — Error & Recovery

Reusable full-page examples:

- connection lost with preserved draft;
- partial result;
- permission denied;
- source unavailable;
- action failed after confirmation;
- service unavailable.

Each specifies impact, retained work, next action and support route.

### S32 — Help & Support

Sections:

- contextual answer;
- common tasks;
- contact human support;
- accessibility support;
- report unsafe/incorrect AI result;
- diagnostic reference available to copy.

## 5. Design System Foundations and Component Library

### 5.1 Foundations

- Color variables: background, surface, text, border, accent, info, positive, warning, critical, focus.
- Typography: Display, H1–H4, Body, Body strong, Small, Label, Code/ID.
- Spacing: 4–64 scale.
- Radius: 4, 8, 12, pill.
- Elevation: none, raised, overlay; avoid excessive shadows.
- Motion: instant, fast 120–180 ms, standard 200–300 ms; reduced-motion equivalents.

### 5.2 Core components and variants

| Component | Required variants/states |
| --- | --- |
| Button | primary, secondary, quiet, destructive; default, hover, focus, pressed, disabled, loading |
| Icon button | tooltip, label, badge; all interaction states |
| Text input | default, focus, filled, error, disabled, read-only |
| Text area / Composer | empty, typing, attachment, voice, submitting, error |
| Select / Combobox | closed, open, selected, no result, error, disabled |
| Checkbox / Radio / Switch | unchecked/checked/indeterminate; focus, disabled, error |
| Tabs | active, inactive, focus, overflow; horizontal and selector fallback |
| Navigation item | default, active, badge, collapsed, focus |
| Card | work, decision, deliverable, expert, source, example; default/focus/selected/critical |
| Status badge | neutral, active, attention, blocked, complete; icon+text required |
| Progress | phase stepper, narrative status, determinate only with real data |
| Alert | info, success, warning, critical; inline/banner |
| Toast | success/info only for noncritical confirmation; keyboard dismissible |
| Dialog | standard, destructive, critical; focus trap and return focus |
| Drawer | detail, contribution request, filters; desktop/mobile behavior |
| Table | sortable, selectable, empty, loading; stacked responsive variant |
| Accordion | closed/open/focus; heading semantics |
| Tooltip | hover and focus; never sole carrier of required information |
| Person/Agent identity | human, AI, service; avatar optional, text label mandatory |
| Confidence panel | low/medium/high plus basis, assumptions, open questions |
| Source reference | available, stale, missing, contradictory |
| Decision option | neutral, recommended, selected, rejected; recommendation not preselection |
| File item | uploading, ready, failed, restricted, removed |
| Skeleton | text, card, list; hidden from accessibility tree or appropriately labeled |
| Empty state | first use, filtered empty, permission-limited |

## 6. Shared Patterns

Required pattern components:

- App shell.
- Mobile bottom navigation.
- Work header and local navigation.
- Objective Composer.
- Mission Canvas.
- Next Action block.
- Attention summary.
- Plan phase.
- Activity event.
- Expert contribution.
- Source and claim linkage.
- Confidence Lens.
- Decision Package.
- Decision Pause.
- Deliverable lineage.
- Error summary.
- Unsaved-change protection.
- Permission/access preview.

## 7. Interaction Rules

- Primary action appears once per viewport region.
- Enter submits only in single-line fields; Composer uses explicit send and supports line breaks.
- Escape closes noncritical overlays and returns focus.
- Destructive actions require confirmation proportional to harm.
- Optimistic UI is allowed only for reversible low-risk actions.
- Every asynchronous action exposes status and preserves user input.
- Deep links and browser back must work conceptually in prototypes.
- AI-generated content is editable and labeled until human-approved where approval applies.
- Changing objective, authority, scope or autonomy triggers impact preview.
- Hover reveals enhancement only; all functionality exists on focus/tap.

## 8. Content Hierarchy Rules

Every screen frame SHALL identify:

1. page purpose;
2. current object/context;
3. status and exceptions;
4. primary next action;
5. core content;
6. supporting detail;
7. provenance/history if required.

Titles describe user objects or outcomes, not system modules. Button labels describe results (“Prepare outline”), not generic continuation when specificity is possible.

## 9. Accessibility Annotation Template

Every screen SHALL include annotation callouts for:

- landmark and heading structure;
- focus entry and order;
- keyboard behavior;
- accessible name/description;
- live-region behavior;
- error association;
- contrast token;
- target size;
- reflow transformation;
- screen-reader-only context if required;
- reduced-motion alternative;
- alternative to drag/gesture;
- critical confirmation behavior.

Components SHALL include a description of name, role, value and states. Annotation IDs use `A11Y-[SCREEN_ID]-NN`.

## 10. Prototype Flows

### PF-01 Create from scratch

`S01 → S02 → S03 → S04 → S05(Create) → S06 → S09`

Success: user starts work and can state outcome, next action and NOVA autonomy.

### PF-02 Recover work

`S01 → S02 → S16 → S17 → S05(Recover) → S06 → S09(Blocked/Recovery)`

Success: user distinguishes facts, reports, missing information and stabilization actions.

### PF-03 Research and analysis

`S01 → S02 → S03 → S18 → S23 → S24`

Success: user finds sources, contradictions and limitations before synthesis.

### PF-04 Strategic decision

`S26 → S19 → S20(Review) → S20(Decide) → S21 → S09`

Success: authority recognizes recommendation as nonbinding and records an explicit decision.

### PF-05 Deliverable

`S15 → S22 → S23 → S24 → S25`

Success: user produces audience-appropriate output and identifies unresolved source gaps.

### PF-06 Monitor and unblock

`S07(Attention) → S09(Blocked) → S10 → S19 → S20 → S21`

Success: manager understands blocker impact and resolves it through the correct authority.

### PF-07 Expert collaboration

`S09 → S12 → Contribution Drawer → S11 → S13`

Success: user requests bounded expertise and inspects resulting contribution provenance.

### PF-08 Error recovery and accessibility

`S02(Error) → S03 → S31(Offline) → S09`

Success: keyboard/screen-reader user recovers without losing input or context.

## 11. Figma Review Checklist

- All 32 screens exist at desktop reference size.
- S01, S04, S07, S09, S19, S20, S24 and S31 exist at tablet and mobile sizes.
- All eight prototype flows are connected.
- All component states are represented.
- No internal vocabulary appears in public mode without explanation.
- Every critical decision is two-step and unselected by default.
- Accessibility annotations exist for every prototype frame.
- Text styles and variables are used consistently.
- Long French, German and localized numeric/date samples are tested for expansion.
- Content works without color and with reduced motion.
- Expert detail does not change canonical object meaning.

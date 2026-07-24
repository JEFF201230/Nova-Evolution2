# PROGRAM-036 - PROGRAM ARCHITECTURE

## 1. Document Control

| Field | Value |
|---|---|
| Program ID | PROGRAM-036 |
| Program Name | NOVA Frontend Implementation |
| Canonical Folder | `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/` |
| Document Name | `PROGRAM_036_PROGRAM_ARCHITECTURE.md` |
| Document Type | Program architecture / implementation governance |
| Status | READY WITH CONDITIONS |
| Creation Mode | Documentation only, no code |
| Source Snapshot | UX Audit, Figma Implementation Master Reference, NFIB, Frontend Development Playbook, NOVA governance and roadmap docs |

## 2. Program Identity

Program-036 defines the canonical frontend implementation program for NOVA.

Identity fields:

- Program ID: `PROGRAM-036`
- Program title: `NOVA Frontend Implementation`
- Program class: implementation governance
- Delivery mode: incremental, gated, certifiable
- Execution target: frontend only
- Governance target: one lot at a time, with explicit gates
- Product relationship: consumes validated UX, Figma technical reference, NFIB, and Frontend Development Playbook

Program-018 is the closest existing product/UI program and is treated as a dependency and contextual overlap, not as a substitute for this program architecture.

## 3. Purpose

The purpose of PROGRAM-036 is to define the execution architecture that will let NOVA frontend be implemented progressively without redrawing the product, inventing new product rules, or bypassing certification.

The program exists to:

- convert validated product references into executable frontend delivery;
- preserve low cognitive load;
- enforce traceability from sources to work packages;
- certify each lot independently;
- prevent placeholder behavior from reaching release;
- keep implementation aligned with the accepted UX, Figma, NFIB, and Playbook baseline.

## 4. Program Context

PROGRAM-036 sits downstream of the validated NOVA UX and technical references and upstream of code, QA evidence, and release certification.

Context constraints:

- UX Audit defines the product intent, hierarchy, journeys, and cognitive rules.
- Figma Implementation Master Reference defines the technical UI baseline and known conflicts.
- NFIB defines the engineering contract and the canonical implementation order.
- Frontend Development Playbook defines day-to-day development and certification rules.

Operational context:

- the program must not redefine UX;
- the program must not arbitrate source conflicts silently;
- the program must not create a second design system;
- the program must not begin execution without source consistency validation.

## 5. Official Sources

| Source | Role in PROGRAM-036 |
|---|---|
| `Docs/10_NOVA/00_UX_AUDIT/NOVA_UX_AUDIT_REPORT.md` | UX authority, cognitive rules, page hierarchy, journeys, accessibility target |
| `Docs/24_MODULES/0-UI-DESIGN/SOURCE/FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md` | technical UI baseline, components, tokens, dimensions, conflicts, limitations |
| `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md` | implementation architecture, contracts, gates, non-regression, certification model |
| `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md` | execution rules, coding conventions, PR checks, certification workflow |
| `Docs/22_NOVA_V2_STRATEGY/07_EVOLUTION_ROADMAP.md` | official numbered future program sequence and reserved numbering context |
| `Docs/22_NOVA_V2_STRATEGY/15_NOVA_EXECUTION_MASTER_PLAN.md` | execution ordering and program sequencing context |
| `Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md` | portfolio status and program coverage context |
| `Docs/20_NOVA_PORTFOLIO/PROGRAM_BOARD.md` | approval authority and program lifecycle authority |
| `Docs/02_PROJECT_MANAGEMENT/PROGRAM_REGISTER.md` | official register reference, albeit incomplete for NOVA program numbering in this repository snapshot |

## 6. Source Authority Order

Authority order for this program:

1. Decisions formally certified.
2. `NOVA_UX_AUDIT_REPORT.md`.
3. `FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`.
4. `NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`.
5. `NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md`.
6. Later Decision Records.
7. Certified code.

Rules:

- a lower authority cannot silently override a higher one;
- a conflict must be preserved, not hidden;
- a missing source means no invented rule;
- certified decisions can override if they are formally recorded and still applicable.

## 7. Preconditions

| Precondition | Status | Rule |
|---|---|---|
| Program ID available | SATISFIED | `PROGRAM-036` is the first unused numeric identifier after the highest officially listed ID found in sources (`PROGRAM-035`) |
| Program Board authority | REQUIRED | No active implementation without explicit approval |
| UX Audit available | SATISFIED | Source present |
| Figma technical reference available | SATISFIED | Source present |
| NFIB available | SATISFIED | Source present |
| Frontend Development Playbook available | SATISFIED | Source present |
| Playbook certification | OPEN | No separate certification artifact was provided |
| Source conflicts mapped | REQUIRED | Must be registered before execution |
| No placeholder delivery | REQUIRED | Placeholder actions cannot be treated as functional |
| No code modification in this mission | SATISFIED | This architecture mission creates no code |

## 8. Scope

Authorized scope for PROGRAM-036:

- frontend foundations;
- shell and layout system;
- routing and navigation;
- shared components;
- feature components;
- drawers and dialogs;
- UI states;
- accessibility;
- responsive behavior;
- pixel-perfect validation;
- frontend tests;
- release and certification evidence;
- frontend observability where documented.

## 9. Out of Scope

PROGRAM-036 does not define:

- product vision;
- UX principles;
- business rules;
- backend APIs beyond frontend contracts;
- persistence internals;
- AI reasoning models;
- score algorithms;
- identity policy beyond documented frontend contracts;
- a new design system;
- a new component library;
- a new source of truth outside the approved documents;
- any code in this mission.

## 10. Program Principles

Mandatory principles:

- incremental delivery only;
- one functional lot at a time;
- each lot has an entry gate and an exit gate;
- no development without normative sources;
- no fictitious component;
- no placeholder button shipped as real;
- no cognitively overloaded screen;
- no silent UX divergence;
- every divergence requires a Decision Record;
- every validation requires a verifiable proof;
- every lot must be independently testable;
- every lot must preserve prior lot non-regression;
- shared components precede feature components;
- foundations precede screens;
- critical screens precede secondary screens;
- accessibility cannot be deferred to the end;
- responsive cannot be deferred as a final patch;
- pixel-perfect certification must be reproducible.

## 11. Target Frontend Capability

Target capability of the program:

- a coherent NOVA frontend that matches the validated UX and Figma baseline;
- a shell that keeps navigation and context stable;
- accessible shared UI primitives;
- feature surfaces for Home, Work, Decisions, Deliverables, drawers, review and decide flows;
- consistent state behavior and reversible interactions where appropriate;
- measurable quality gates for accessibility, responsive behavior, performance, tests, and pixel-perfect verification;
- certifiable delivery slices that can be released incrementally.

The target capability is frontend-only and does not expand product scope.

## 12. Program Organization

Recommended operating structure:

- Program Sponsor: Program Board
- Governance Owner: assigned by Board decision
- Technical Authority: frontend architecture owner
- Delivery Owner: frontend implementation lead
- QA Authority: certification or validation agent
- Evidence Owner: documentation and traceability owner

Program artifacts:

- program architecture;
- lot architecture;
- gate definitions;
- evidence records;
- decision records;
- test records;
- certification records;
- release candidate records;
- rollback records.

## 13. Roles and Authorities

| Role | Authority | Cannot do |
|---|---|---|
| Program Board | approve, prioritize, activate, certify, close | cannot be bypassed |
| Architect | define structure, dependencies, gates | cannot arbitrate certified conflicts alone |
| Frontend Lead | organize implementation and sequencing | cannot invent product rules |
| UX Authority | validate cognitive and journey alignment | cannot rewrite code scope |
| Figma Authority | validate technical UI baseline | cannot invent unavailable native data |
| QA / Certification | verify readiness and evidence | cannot approve without evidence |
| Developer | implement assigned lot | cannot redefine the program |
| Reviewer | challenge scope, quality, and traceability | cannot approve hidden divergence |

## 14. Lot Architecture

| Lot ID | Title | Primary outcome | Gate in | Gate out | Parallelizable |
|---|---|---|---|---|---|
| LOT 000 | Program Readiness | sources, conflicts, baseline, environment | GATE-SOURCE-CONSISTENCY | GATE-PROGRAM-READINESS | No |
| LOT 001 | Frontend Foundation | shell, routing, tokens, styles, error baseline | GATE-PROGRAM-READINESS | GATE-FOUNDATION-CERTIFIED | No |
| LOT 002 | Shared UI Foundations | buttons, inputs, badges, tabs, cards, overlays, drawers | GATE-FOUNDATION-CERTIFIED | GATE-SHARED-COMPONENTS-CERTIFIED | Conditional |
| LOT 003 | NOVA Navigation and Global Shell | nav, header, sidebar, breadcrumb, global search | GATE-SHARED-COMPONENTS-CERTIFIED | GATE-SCREEN-CERTIFIED | Conditional |
| LOT 004 | Home | focal point, NBA, active work, priority decision | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | No |
| LOT 005 | Work Overview | summary, progress, pending decision, deliverables | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | No |
| LOT 006 | Work Plan | phases, critical path, dependencies, blockers | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | No |
| LOT 007 | Work Activity | timeline, human/NOVA/source events, confidence variation | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | Conditional |
| LOT 008 | People and Experts | list, availability, pending asks, People drawer | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | Conditional |
| LOT 009 | Sources and Evidence | available/missing/stale/conflicts, Source drawer | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | Conditional |
| LOT 010 | Decisions | list, recommendation, consequences, options, confidence | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | No |
| LOT 011 | Review and Decide | package, review, decide, confirmation, receipt | GATE-SCREEN-CERTIFIED | GATE-INTEGRATION-CERTIFIED | No |
| LOT 012 | Deliverables | readiness, blockers, next action, detail, history | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | Conditional |
| LOT 013 | Cross-Module Navigation | route/tab/scroll restoration and cross-object navigation | GATE-SCREEN-CERTIFIED | GATE-INTEGRATION-CERTIFIED | Conditional |
| LOT 014 | Responsive and Adaptive Layout | documented breakpoints only | GATE-FOUNDATION-CERTIFIED | GATE-RESPONSIVE-CERTIFIED | Conditional |
| LOT 015 | Accessibility Certification | keyboard, focus, ARIA, screen reader, zoom | GATE-SHARED-COMPONENTS-CERTIFIED | GATE-ACCESSIBILITY-CERTIFIED | No |
| LOT 016 | Frontend Security and Integrity | safe rendering, input handling, decision integrity | GATE-FOUNDATION-CERTIFIED | GATE-SECURITY-CERTIFIED | Conditional |
| LOT 017 | Performance and Reliability | loading, split points, lazy loading, stability | GATE-FOUNDATION-CERTIFIED | GATE-PERFORMANCE-CERTIFIED | Conditional |
| LOT 018 | Integrated QA | unit, component, integration, navigation, visual tests | GATE-FOUNDATION-CERTIFIED | GATE-INTEGRATION-CERTIFIED | Conditional |
| LOT 019 | Pixel-Perfect Certification | capture method, tolerance, anomalies, proof | GATE-SCREEN-CERTIFIED | GATE-PIXEL-PERFECT-CERTIFIED | No |
| LOT 020 | Release Candidate | build, compliance, security, accessibility, GO/NO GO | GATE-INTEGRATION-CERTIFIED | GATE-RELEASE-CANDIDATE | No |
| LOT 021 | MVP Certification | global conformity, non-regression, final baseline | GATE-RELEASE-CANDIDATE | GATE-MVP-CERTIFIED | No |

## 15. Detailed Lot Specifications

### LOT 000 - Program Readiness

- Objective: verify all official sources, map conflicts, identify missing information, and establish the entry baseline.
- Justification: the program cannot start without a source-controlled readiness baseline.
- Entry dependencies: official source corpus, Program Board authority, known program numbering context.
- Normative sources: UX Audit, Figma reference, NFIB, Playbook, board and roadmap docs.
- Authorized scope: source inventory, conflict inventory, readiness evidence, environment confirmation.
- Out of scope: code, UI changes, product changes, backend changes.
- Components concerned: none.
- Screens concerned: none.
- States concerned: source presence, conflict open, readiness pass/fail.
- Deliverables: readiness report, source matrix, conflict register, open dependency list.
- Tests mandatory: source completeness check, identifier availability check, path validation, diff check readiness.
- Evidence expected: citation list, registry snapshot, conflict list, blocker list.
- Entry criteria: sources available and readable.
- Exit criteria: readiness verdict, blocking conditions explicit.
- Gate in: `GATE-SOURCE-CONSISTENCY`.
- Gate out: `GATE-PROGRAM-READINESS`.
- Risks: incomplete register, ambiguous numbering, missing certification artifacts.
- Prohibitions: no execution start, no code, no silent assumption.
- Blocking conditions: unresolved source ambiguity, missing authority, unverified playbook status.
- Rollback strategy: no implementation rollback; preserve the readiness snapshot.
- Non-regression: source matrix becomes the baseline for later lots.
- Decision GO/NO GO expected: GO only if sources and numbering are stable; otherwise NO GO.

### LOT 001 - Frontend Foundation

- Objective: establish the app shell, routing model, TypeScript foundation, theme, tokens, styles, and base error handling.
- Justification: all later frontend surfaces depend on a stable foundation.
- Entry dependencies: LOT 000 pass, source consistency, approved architecture.
- Normative sources: NFIB architecture sections, Figma technical reference, Playbook conventions.
- Authorized scope: shell, router or state navigation as documented, base layout, token wiring, global error baseline.
- Out of scope: feature screens, content logic, business rules, backend behavior.
- Components concerned: App shell, NavRail, main content shell, global overlay shell.
- Screens concerned: none or skeletal shells only.
- States concerned: app boot, unknown view, loading, fatal error.
- Deliverables: foundation implementation, foundation test suite, baseline captures.
- Tests mandatory: shell mount, route/state resolution, typecheck, token application, global error handling.
- Evidence expected: foundation proof, screenshots, test report, lint/typecheck report.
- Entry criteria: foundation contracts approved.
- Exit criteria: stable shell and baseline states demonstrated.
- Gate in: `GATE-PROGRAM-READINESS`.
- Gate out: `GATE-FOUNDATION-CERTIFIED`.
- Risks: overbuilding, hidden routing drift, early feature leakage.
- Prohibitions: no screen feature code, no placeholder features, no extra dashboards.
- Blocking conditions: unresolved source conflicts, missing shell contract, uncertified playbook.
- Rollback strategy: revert foundation changes as a single bounded lot if shell stability fails.
- Non-regression: later lots inherit token and shell behavior unchanged.
- Decision GO/NO GO expected: GO only after foundation certification.

### LOT 002 - Shared UI Foundations

- Objective: deliver the shared UI primitives used by all surfaces.
- Justification: shared components must stabilize before screen delivery.
- Entry dependencies: LOT 001 certified, shared contracts approved.
- Normative sources: Figma component library, NFIB component contracts, Playbook conventions.
- Authorized scope: buttons, inputs, badges, tabs, cards, progress, status, overlays, drawers, dialogs, tooltips, focus primitives.
- Out of scope: screen-specific copy, business logic, flows, routing decisions.
- Components concerned: `Btn`, `Card`, `NOVALabel`, `ConfChip`, `DeadlineBadge`, `StatusDot`, `Drawer`, `DrawerSection`, `DrawerRow`, `WhyInline`, `SearchOverlay`, base field primitives.
- Screens concerned: shared usage only, no dedicated screen scope.
- States concerned: default, hover, active, disabled, loading, open, closed, focus, error, empty where documented.
- Deliverables: component package, story coverage if adopted, interaction proof, accessible primitives.
- Tests mandatory: component contract tests, keyboard tests, focus tests, visual states.
- Evidence expected: component inventory, screenshots, a11y proof, test logs.
- Entry criteria: shared contracts frozen enough for implementation.
- Exit criteria: primitives certified for reuse.
- Gate in: `GATE-FOUNDATION-CERTIFIED`.
- Gate out: `GATE-SHARED-COMPONENTS-CERTIFIED`.
- Risks: component drift, over-varianting, hidden design system expansion.
- Prohibitions: no feature coupling, no redundant component copies.
- Blocking conditions: source conflicts in component geometry or semantics, missing accessibility behavior.
- Rollback strategy: revert the primitive package and keep screen work blocked.
- Non-regression: all later lots must consume these shared contracts unchanged unless a new certified decision exists.
- Decision GO/NO GO expected: GO only when primitives are stable and accessible.

### LOT 003 - NOVA Navigation and Global Shell

- Objective: stabilize the global navigation model, breadcrumb behavior, and global shell.
- Justification: context preservation is critical to cognitive load and return paths.
- Entry dependencies: LOT 002 certified, shell contracts ready.
- Normative sources: UX navigation sections, Figma shell sections, NFIB routing and layout sections.
- Authorized scope: nav rail, header, sidebar/breadcrumb, global search if validated, notifications if validated, preferences if validated.
- Out of scope: feature content, decision logic, data model changes.
- Components concerned: `NavRail`, nav items, breadcrumb, search trigger, global overlays if present.
- Screens concerned: Home, Work, Decisions, Deliverables, global search overlay.
- States concerned: active route, current tab, search open/closed.
- Deliverables: navigation implementation, context restoration proof, shell test report.
- Tests mandatory: tab switching, back navigation, focus return, rail activation, search open/close if included.
- Evidence expected: route/state mapping, screenshots, keyboard proof.
- Entry criteria: shared shell primitives certified.
- Exit criteria: navigation respects source authority.
- Gate in: `GATE-SHARED-COMPONENTS-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: context loss, breadcrumb mismatch, duplicate global actions.
- Prohibitions: no route drift, no hidden navigation, no extra shell.
- Blocking conditions: shell does not preserve context, search behaves as fake action.
- Rollback strategy: revert global shell changes without altering feature code.
- Non-regression: later screens must not break navigation order or context return.
- Decision GO/NO GO expected: GO when navigation is stable and reversible.

### LOT 004 - Home

- Objective: implement the Home focal point, active work entry, priority decision, and background work summary.
- Justification: Home is the first orientation surface.
- Entry dependencies: LOT 003 certified, Home contracts and copy approved.
- Normative sources: UX Home audit, Figma Home reference, NFIB Home contract.
- Authorized scope: priority card, NBA, Active Work, decision priority, background work, empty/loading/error/blocked states.
- Out of scope: deep analytics dashboards, secondary metrics overload, product redesign.
- Components concerned: Home view composition, cards, `ConfChip`, `DeadlineBadge`, `Drawer`.
- Screens concerned: Home.
- States concerned: empty, loading, error, blocked, active.
- Deliverables: Home implementation, Home proof set, Home accessibility check.
- Tests mandatory: primary action, card ordering, drawer disclosure, blocked state text, keyboard reachability.
- Evidence expected: screenshot set, test results, a11y notes.
- Entry criteria: navigation and shared components certified.
- Exit criteria: Home presents one primary action and one clear orientation path.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: overload by competing priorities, metrics crowding, secondary content leakage.
- Prohibitions: no dashboard creep, no multiple dominant CTAs.
- Blocking conditions: no valid data for priority or blocked state.
- Rollback strategy: revert Home surface independently.
- Non-regression: no change to work navigation or global shell.
- Decision GO/NO GO expected: GO if orientation remains simple and stable.

### LOT 005 - Work Overview

- Objective: implement the Work overview summary and next action surface.
- Justification: Overview is the main work orientation page.
- Entry dependencies: LOT 003 and 004 certified, overview contract approved.
- Normative sources: UX Work overview audit, Figma Work overview reference, NFIB Work contracts.
- Authorized scope: summary, progress, pending decision, deliverables, people references, NOVA state.
- Out of scope: deep analysis bars at first level, extra dashboard metrics.
- Components concerned: overview cards, `WhyInline`, `ConfChip`, `DeadlineBadge`, `Drawer`.
- Screens concerned: Work Overview.
- States concerned: loading, blocked, no decision, has decision, terminal.
- Deliverables: overview implementation, analysis drawer, baseline snapshots.
- Tests mandatory: priority action visibility, blocked explanation, drawer access, tab stability.
- Evidence expected: screenshots, interaction trace, test report.
- Entry criteria: Work shell stable, shared components certified.
- Exit criteria: clear next action and minimal cognitive load.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: duplicate scores, competing summary signals, unnecessary detail on the page.
- Prohibitions: no overloading with secondary analysis.
- Blocking conditions: missing next action or missing evidence.
- Rollback strategy: revert overview only.
- Non-regression: Home and navigation remain unchanged.
- Decision GO/NO GO expected: GO if overview stays concise.

### LOT 006 - Work Plan

- Objective: implement phases, dependencies, critical path, blockers, and remaining work.
- Justification: plan clarity is a core work management surface.
- Entry dependencies: LOT 005 certified.
- Normative sources: UX Plan audit, Figma phase details, NFIB plan contract.
- Authorized scope: phases, expanded/collapsed states, blockers, remaining work, documented probability semantics only if validated.
- Out of scope: arbitrary progress metrics, hidden logic, new planning model.
- Components concerned: plan rows, accordions, progress indicators where validated.
- Screens concerned: Work Plan.
- States concerned: active, future, blocker, collapsed, expanded.
- Deliverables: plan implementation, phase proof, plan states proof.
- Tests mandatory: single-phase open behavior, dependency display, blocker wording, keyboard access.
- Evidence expected: screenshots, contract check, interaction proof.
- Entry criteria: overview and shared components stable.
- Exit criteria: plan is readable and not overloaded.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: false certainty around probability, over-expansion, dependency confusion.
- Prohibitions: no invented probability semantics.
- Blocking conditions: unavailable or contradictory phase data.
- Rollback strategy: revert plan surface.
- Non-regression: overview and shell unaffected.
- Decision GO/NO GO expected: GO when phases and blockers are legible.

### LOT 007 - Work Activity

- Objective: implement the activity timeline with human, NOVA, source, and critical events.
- Justification: activity is the traceability surface for work changes.
- Entry dependencies: LOT 005 certified, events model approved.
- Normative sources: UX Activity audit, Figma activity spec, NFIB activity contract.
- Authorized scope: timeline, filters, comments, event details, confidence variation explanation.
- Out of scope: uncontrolled feeds, noise-only events, unstructured logs.
- Components concerned: activity rows, filters, comment controls, proof links.
- Screens concerned: Work Activity.
- States concerned: filtered, unfiltered, empty, loading, error.
- Deliverables: activity implementation, filter behavior, variation explanation proof.
- Tests mandatory: filter behavior, comment persistence where supported, event opening, proof access.
- Evidence expected: screenshots, event trace, test report.
- Entry criteria: event model stable.
- Exit criteria: changes are explainable and traceable.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: timeline fatigue, provenance gaps, false confidence precision.
- Prohibitions: no untraceable event or no-op comment action disguised as real.
- Blocking conditions: missing event provenance or broken comment flow.
- Rollback strategy: revert activity view.
- Non-regression: plan and overview remain intact.
- Decision GO/NO GO expected: GO if activity is explainable and readable.

### LOT 008 - People and Experts

- Objective: implement the people surface, availability, contribution, pending asks, and People drawer.
- Justification: human coordination is a first-class work concern.
- Entry dependencies: LOT 005 certified, people model approved.
- Normative sources: UX People audit, Figma people cards and drawer, NFIB people contract.
- Authorized scope: list, availability, contribution, pending requests, drawer, states.
- Out of scope: HR system behavior, hidden social graph, unsupported trust computation.
- Components concerned: person cards, status dots, drawers, action buttons.
- Screens concerned: Work People.
- States concerned: available, busy, away, pending, blocked.
- Deliverables: people implementation, drawer evidence, accessibility proof.
- Tests mandatory: list readability, drawer open/close, status semantics, keyboard navigation.
- Evidence expected: screenshot set, interaction proof, test report.
- Entry criteria: people semantics and statuses stable.
- Exit criteria: coordination is clear and accessible.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: fake trust score, color-only communication, drawer complexity.
- Prohibitions: no opaque trust metric, no hidden call-to-action.
- Blocking conditions: unavailable source data or undefined trust semantics.
- Rollback strategy: revert people surface.
- Non-regression: work shell and activity unaffected.
- Decision GO/NO GO expected: GO when the list can be scanned quickly.

### LOT 009 - Sources and Evidence

- Objective: implement source inventory, freshness, missing items, conflicts, and Source drawer.
- Justification: evidence and source quality drive decision confidence.
- Entry dependencies: LOT 005 certified, source model approved.
- Normative sources: UX Sources audit, Figma source cards and drawer, NFIB source contract.
- Authorized scope: available/missing/stale/conflict states, coverage, drawer, evidence links.
- Out of scope: source ingestion backend, arbitrary evidence management, unsupported export behavior.
- Components concerned: source cards, source drawer, badges, links, conflict markers.
- Screens concerned: Work Sources.
- States concerned: missing, stale, available, conflict, loading.
- Deliverables: sources implementation, conflict surfacing, evidence access proof.
- Tests mandatory: state display, drawer access, conflict text, keyboard navigation.
- Evidence expected: screenshots, source-state matrix, test report.
- Entry criteria: source semantics stable.
- Exit criteria: sources are legible and actionable.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: stale data hidden, conflict minimization, source-action mismatch.
- Prohibitions: no fake refresh or no-op add action shipped as real.
- Blocking conditions: missing source data or unresolved source conflict.
- Rollback strategy: revert source surface.
- Non-regression: work overview and people surfaces remain stable.
- Decision GO/NO GO expected: GO if sources remain source-driven and not decorative.

### LOT 010 - Decisions

- Objective: implement the decision list, recommendation, consequences, options, and confidence presentation.
- Justification: decisions are a core control surface for NOVA.
- Entry dependencies: LOT 005 and 009 certified, decision contracts approved.
- Normative sources: UX Decisions audit, Figma decision cards, NFIB decision contract.
- Authorized scope: decision list, recommendation presentation, consequences, options, confidence where useful.
- Out of scope: human decision capture workflow, receipt rendering, backend decision engines.
- Components concerned: decision cards, `ConfChip`, `DeadlineBadge`, `WhyInline`, CTAs.
- Screens concerned: Work Decisions, Global Decisions if shared patterns are reused.
- States concerned: pending, waiting, decided, loading.
- Deliverables: decision list implementation, recommendation trace, confidence proof.
- Tests mandatory: recommendation visibility, confidence semantics, open package link, keyboard access.
- Evidence expected: screenshots, interaction proof, test report.
- Entry criteria: source and work contexts stable.
- Exit criteria: decision list is actionable and explainable.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: too many competing signals, recommendation without evidence, score confusion.
- Prohibitions: no autonomous decision commit in this lot.
- Blocking conditions: missing decision contract or missing evidence trace.
- Rollback strategy: revert decision list.
- Non-regression: source and overview unaffected.
- Decision GO/NO GO expected: GO if decision list remains decision-oriented.

### LOT 011 - Review and Decide

- Objective: implement the Decision Package, Review, Decide, confirmation, double-submit prevention, and receipt proof.
- Justification: irreversible decisions must be controlled and auditable.
- Entry dependencies: LOT 010 certified, persistence/confirmation contract available, Playbook validated.
- Normative sources: UX review/decide audit, Figma decision workflow, NFIB decision workflow, Playbook.
- Authorized scope: package, review step, decide step, rationale, confirmation, receipt.
- Out of scope: preselected decision, fake success, hidden persistence, unbounded decision execution.
- Components concerned: package view, decision forms, confirmation UI, receipt view.
- Screens concerned: Decision Package, Review, Decide, Receipt.
- States concerned: review, decide, loading, success, error, blocked.
- Deliverables: workflow implementation, receipt proof, idempotence proof, decision trace.
- Tests mandatory: no preselection, rationale required, double-submit prevention, persistence confirmation, receipt generation.
- Evidence expected: execution report, test report, receipt snapshot, gate proof.
- Entry criteria: decision options and rationale rules approved.
- Exit criteria: decision is recorded, traceable, and confirmed.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-INTEGRATION-CERTIFIED`.
- Risks: irreversible action without persistence, false confirmation, duplicate submission.
- Prohibitions: no final action inside a drawer, no fake receipt.
- Blocking conditions: missing persistence contract, unresolved irreversible action semantics.
- Rollback strategy: revert workflow and keep decision immutable only after valid record.
- Non-regression: decision list and work navigation remain consistent.
- Decision GO/NO GO expected: GO only if final commit is verifiably persisted.

### LOT 012 - Deliverables

- Objective: implement deliverable list, readiness, blockers, next action, detail, history, and Deliverable drawer.
- Justification: deliverables are the output control surface of the work.
- Entry dependencies: LOT 005 certified, deliverable model approved.
- Normative sources: UX Deliverables audit, Figma deliverable surfaces, NFIB deliverable contract.
- Authorized scope: list, readiness, confidence where decisionally useful, history, drawer.
- Out of scope: publication workflow not documented, fake preview, hidden export behavior.
- Components concerned: deliverable cards, badges, drawer, action buttons.
- Screens concerned: Work Deliverables and global deliverable surfaces if shared.
- States concerned: ready, not ready, blocked, loading, error.
- Deliverables: deliverables implementation, detail trace, proof of readiness semantics.
- Tests mandatory: readiness display, blocker explanation, drawer behavior, keyboard access.
- Evidence expected: screenshots, interaction trace, test report.
- Entry criteria: deliverable semantics stable.
- Exit criteria: deliverable status is clear and actionable.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-SCREEN-CERTIFIED`.
- Risks: readiness confusion, redundant score display, no-op preview.
- Prohibitions: no fake publish or unsupported export promise.
- Blocking conditions: missing readiness model or missing blocker data.
- Rollback strategy: revert deliverables surface.
- Non-regression: work overview and decision flow remain stable.
- Decision GO/NO GO expected: GO if readiness remains central.

### LOT 013 - Cross-Module Navigation

- Objective: implement preserved cross-surface navigation and context restoration.
- Justification: users must move between related objects without losing their place.
- Entry dependencies: LOT 003, 005, 009, 010, 012 certified.
- Normative sources: UX navigation rules, NFIB routing model, Playbook.
- Authorized scope: Work <-> Sources, Sources <-> Decisions, Decisions <-> Deliverables, People <-> Work, Activity <-> objects, route/tab/scroll restoration.
- Out of scope: new routing semantics, new deep-link model, arbitrary browser history behavior.
- Components concerned: navigation triggers, route/state links, back actions, focus restoration.
- Screens concerned: cross-surface transitions only.
- States concerned: route active, tab active, scroll restored, focus restored.
- Deliverables: cross-module navigation proof, restoration proof, route matrix.
- Tests mandatory: return to source tab, focus restoration, back path integrity, deep-link consistency if supported.
- Evidence expected: navigation trace, screenshots, test report.
- Entry criteria: each participating surface certified.
- Exit criteria: context survives transitions.
- Gate in: `GATE-SCREEN-CERTIFIED`.
- Gate out: `GATE-INTEGRATION-CERTIFIED`.
- Risks: lost context, wrong return target, route drift.
- Prohibitions: no implicit jump to Home from a detail transition.
- Blocking conditions: route mapping or restoration impossible.
- Rollback strategy: revert cross-linking while preserving source surfaces.
- Non-regression: participating surfaces keep their local state.
- Decision GO/NO GO expected: GO if return paths are deterministic.

### LOT 014 - Responsive and Adaptive Layout

- Objective: implement only the documented responsive behavior.
- Justification: the program cannot assume mobile behavior beyond the official sources.
- Entry dependencies: LOT 001 certified, responsive scope confirmed.
- Normative sources: Figma responsive sections, UX responsive expectations, NFIB responsive model.
- Authorized scope: documented breakpoints only, compression handling, overflow control, zoom handling where validated.
- Out of scope: invented breakpoints, unsupported mobile redesign, density switch.
- Components concerned: shell, drawers, tables/lists where applicable.
- Screens concerned: all visible surfaces.
- States concerned: narrow viewport, wide viewport, zoomed viewport, overflow states.
- Deliverables: responsive proof set, documented breakpoints, layout behavior report.
- Tests mandatory: width constraints, overflow, text wrap, drawer behavior, focus under zoom.
- Evidence expected: capture matrix, viewport matrix, test report.
- Entry criteria: layout foundations stable.
- Exit criteria: responsive behavior matches official source limits.
- Gate in: `GATE-FOUNDATION-CERTIFIED`.
- Gate out: `GATE-RESPONSIVE-CERTIFIED`.
- Risks: unsupported mobile claims, clipped labels, unstable drawers.
- Prohibitions: no invented breakpoint, no silent layout fallback.
- Blocking conditions: no documented responsive rule or contradiction between sources.
- Rollback strategy: revert responsive-only changes if they break baseline layout.
- Non-regression: desktop behavior remains stable.
- Decision GO/NO GO expected: GO if responsive behavior is source-bound.

### LOT 015 - Accessibility Certification

- Objective: certify keyboard, focus, ARIA, screen reader, zoom, and interaction accessibility.
- Justification: accessibility cannot be deferred.
- Entry dependencies: LOT 002, 003, 004, 011, 014 partially certified.
- Normative sources: UX accessibility section, Figma accessibility limitation notes, NFIB accessibility model, Playbook.
- Authorized scope: keyboard navigation, focus management, labels, dialogs, drawers, forms, zoom, contrast, error association.
- Out of scope: accessibility redesign unrelated to current product baseline.
- Components concerned: all interactive shared and feature components.
- Screens concerned: Home, Work, Decisions, Deliverables, drawers, overlays, forms.
- States concerned: focus, hover, pressed, disabled, loading, error, modal open/close.
- Deliverables: accessibility report, keyboard matrix, focus proof, screen reader notes.
- Tests mandatory: tab order, escape behavior, focus trap, label reading, zoom 200 percent, contrast checks.
- Evidence expected: test logs, capture set, a11y report.
- Entry criteria: target contracts stable.
- Exit criteria: documented accessibility PASS or conditionally blocked with reasons.
- Gate in: `GATE-SHARED-COMPONENTS-CERTIFIED`.
- Gate out: `GATE-ACCESSIBILITY-CERTIFIED`.
- Risks: hidden traps, color-only meaning, inaccessible overlays, input loss.
- Prohibitions: no faux accessibility, no postponed focus correction.
- Blocking conditions: missing labels, broken focus, unhandled drawers or dialogs.
- Rollback strategy: revert interactive changes that broke accessibility.
- Non-regression: every later lot must preserve this certification.
- Decision GO/NO GO expected: GO only when keyboard and screen reader proof are present.

### LOT 016 - Frontend Security and Integrity

- Objective: protect frontend rendering and user actions from unsafe behavior.
- Justification: decisions and traces must not be compromised by the UI layer.
- Entry dependencies: LOT 001, 011, 015 certified; frontend integrity rules available.
- Normative sources: NFIB security and state sections, Playbook security section, UX decision integrity rules.
- Authorized scope: safe rendering, safe URL handling, input validation, no sensitive logs, irreversible action safety.
- Out of scope: backend security architecture, cryptographic design, identity policy beyond frontend contract.
- Components concerned: forms, action buttons, navigation, receipts, overlays.
- Screens concerned: all surfaces with user input or critical decisions.
- States concerned: invalid input, blocked, loading, confirmed, failed.
- Deliverables: security checklist, integrity proof, input validation proof.
- Tests mandatory: validation handling, no sensitive data leakage, safe path handling, irreversible action guard.
- Evidence expected: report, logs, negative test results.
- Entry criteria: security contract approved.
- Exit criteria: no unsafe frontend action path remains.
- Gate in: `GATE-FOUNDATION-CERTIFIED`.
- Gate out: `GATE-SECURITY-CERTIFIED`.
- Risks: injection via UI payload, unsafe links, leaked trace data.
- Prohibitions: no secret in UI logs, no fake permission state.
- Blocking conditions: unsafe user input path or irreversible action without guard.
- Rollback strategy: disable unsafe path and revert the lot.
- Non-regression: security controls remain compatible with existing behavior.
- Decision GO/NO GO expected: GO only when safety is demonstrable.

### LOT 017 - Performance and Reliability

- Objective: keep the frontend stable, responsive, and efficient.
- Justification: the UI must remain usable during daily work and certification.
- Entry dependencies: LOT 001 certified.
- Normative sources: NFIB performance sections, Figma implementation notes, Playbook.
- Authorized scope: loading behavior, lazy loading where documented, stability, error recovery, observability hooks if validated.
- Out of scope: fake performance budgets, speculative optimization, hidden caching.
- Components concerned: large lists, drawers, overlays, decision workflow.
- Screens concerned: all surfaces.
- States concerned: loading, retry, error, fallback.
- Deliverables: performance review, reliability proof, loading/recovery proof.
- Tests mandatory: basic rendering stability, repeated open/close, error recovery, no visual jank on critical paths.
- Evidence expected: test logs, capture evidence, recovery proof.
- Entry criteria: baseline shell and main surfaces exist.
- Exit criteria: no critical reliability regression.
- Gate in: `GATE-FOUNDATION-CERTIFIED`.
- Gate out: `GATE-PERFORMANCE-CERTIFIED`.
- Risks: slow overlays, excessive re-rendering, unrecoverable error states.
- Prohibitions: no hidden latency, no unbounded resource growth.
- Blocking conditions: repeated instability on core paths.
- Rollback strategy: revert performance-sensitive changes.
- Non-regression: existing stable loads remain stable.
- Decision GO/NO GO expected: GO if stability is proven.

### LOT 018 - Integrated QA

- Objective: produce a coherent test system spanning units, components, integration, navigation, accessibility, visual states, and irreversible actions.
- Justification: certification requires reproducible tests, not subjective review only.
- Entry dependencies: LOT 001 through LOT 017 as applicable.
- Normative sources: NFIB testing section, Playbook checks, UX validation rules.
- Authorized scope: test architecture, fixtures, scenarios, reports, automation hooks.
- Out of scope: product redesign, code logic unrelated to QA.
- Components concerned: test helpers, fixtures, assertions, render utilities.
- Screens concerned: all certified surfaces.
- States concerned: all nominal and non-nominal states that affect certification.
- Deliverables: test plan, automated test suite, test report, non-regression record.
- Tests mandatory: unit, component, integration, navigation, accessibility, visual, irreversible flow tests.
- Evidence expected: pass/fail matrices, coverage snapshot, screenshots.
- Entry criteria: target contracts are available.
- Exit criteria: all required test classes implemented or justified as unavailable.
- Gate in: `GATE-FOUNDATION-CERTIFIED`.
- Gate out: `GATE-INTEGRATION-CERTIFIED`.
- Risks: test flakiness, false positives, missing state coverage.
- Prohibitions: no manual-only certification for critical flows.
- Blocking conditions: missing tests for irreversible or accessibility-critical behavior.
- Rollback strategy: revert untested changes or hold lot open.
- Non-regression: test suite must protect previous lots.
- Decision GO/NO GO expected: GO only when tests are reproducible.

### LOT 019 - Pixel-Perfect Certification

- Objective: certify the implemented UI against the baseline in a reproducible way.
- Justification: pixel-perfect conformance is an explicit requirement of the program.
- Entry dependencies: LOT 001 through LOT 018 as applicable.
- Normative sources: Figma reference, UX reference, NFIB pixel-perfect rules, Playbook validation rules.
- Authorized scope: capture method, resolution, tolerance rules, anomaly list, correction proof.
- Out of scope: redesign, approximation, invented "good enough" visual corrections.
- Components concerned: all visible components and critical states.
- Screens concerned: all certified screens and drawers.
- States concerned: nominal, hover, focus, loading, error, empty, blocked, done.
- Deliverables: capture matrix, diff report, anomaly log, correction evidence.
- Tests mandatory: visual comparison, viewport control, state capture, reference alignment.
- Evidence expected: screenshots, diff images if used, proof of capture method.
- Entry criteria: visual baseline available.
- Exit criteria: visual deviations documented and accepted or corrected.
- Gate in: `GATE-INTEGRATION-CERTIFIED`.
- Gate out: `GATE-PIXEL-PERFECT-CERTIFIED`.
- Risks: drift by approximation, false equivalence, inconsistent capture settings.
- Prohibitions: no average of conflicting values without an external decision.
- Blocking conditions: no reproducible capture method or unresolved visual conflict.
- Rollback strategy: revert visual changes until the baseline matches.
- Non-regression: prior captures remain reproducible.
- Decision GO/NO GO expected: GO only when the capture proof is repeatable.

### LOT 020 - Release Candidate

- Objective: prepare the frontend for release candidate review.
- Justification: release readiness must be explicit and evidence-based.
- Entry dependencies: LOT 019 certified, security/performance/accessibility acceptable.
- Normative sources: NFIB release criteria, Playbook checklist, Program Board governance.
- Authorized scope: build verification, compliance aggregation, accepted deviations list, GO/NO GO package.
- Out of scope: new product scope, unresolved conflicts, uncertified shortcuts.
- Components concerned: release packaging artifacts, version labels, report outputs.
- Screens concerned: all certified screens.
- States concerned: release candidate, blocked, accepted deviations.
- Deliverables: release candidate report, accepted deviations list, release proof set.
- Tests mandatory: build, smoke, critical path regression, checks for accessibility, security, performance.
- Evidence expected: signed report, test output, diff check, proof bundle.
- Entry criteria: all required certification gates passed or conditionally passed with explicit controls.
- Exit criteria: the program is ready for final MVP certification review.
- Gate in: `GATE-PIXEL-PERFECT-CERTIFIED`.
- Gate out: `GATE-RELEASE-CANDIDATE`.
- Risks: shipping unresolved divergence, hidden regression, incomplete evidence.
- Prohibitions: no implicit release, no untracked exceptions.
- Blocking conditions: missing one of the required certification results.
- Rollback strategy: return to the previous certified lot set.
- Non-regression: release candidate cannot weaken prior gates.
- Decision GO/NO GO expected: GO only when the candidate is evidence-complete.

### LOT 021 - MVP Certification

- Objective: certify the program as MVP-ready for frontend NOVA.
- Justification: the program must end with a clear certification decision.
- Entry dependencies: LOT 020 certified, open dependencies resolved or formally accepted.
- Normative sources: Program Board authority, NFIB certification model, Playbook final checks.
- Authorized scope: final conformity review, evidence bundle, residual conditions, baseline release decision.
- Out of scope: new implementation scope, new product rules, silent exceptions.
- Components concerned: certification reports and evidence references only.
- Screens concerned: all certified screens in aggregate.
- States concerned: final pass, pass with conditions, fail.
- Deliverables: MVP certification report, baseline release statement, residual conditions list.
- Tests mandatory: final non-regression, final traceability, final gate review.
- Evidence expected: complete evidence chain, program report, approval record.
- Entry criteria: release candidate accepted.
- Exit criteria: Board decision and certification artifact.
- Gate in: `GATE-RELEASE-CANDIDATE`.
- Gate out: `GATE-MVP-CERTIFIED`.
- Risks: certifying with unresolved open dependencies, false completeness, hidden non-regression drift.
- Prohibitions: no silent closure, no approval without evidence.
- Blocking conditions: unresolved critical conflict, missing evidence chain, missing Board decision.
- Rollback strategy: revert certification status to candidate if evidence fails.
- Non-regression: certified baseline becomes the release reference.
- Decision GO/NO GO expected: GO only when the full evidence chain is accepted.

## 16. Increment Architecture

| Increment | Scope | Value demonstrable | Dependent lots |
|---|---|---|---|
| Increment 1 | Shell executable | app shell and navigation work | LOT 000, 001, 003 |
| Increment 2 | Shared components | reusable UI primitives behave correctly | LOT 002 |
| Increment 3 | Home + Work Overview | core orientation and next action path | LOT 004, 005 |
| Increment 4 | Plan + Activity | work decomposition and traceability | LOT 006, 007 |
| Increment 5 | People + Sources | human and evidence coordination | LOT 008, 009 |
| Increment 6 | Decisions + Review/Decide | decision workflow and receipt trace | LOT 010, 011 |
| Increment 7 | Deliverables | output readiness and history | LOT 012 |
| Increment 8 | Cross-module integration | return paths and object linking | LOT 013 |
| Increment 9 | Accessibility + Responsive | keyboard, focus, zoom, documented breakpoints | LOT 014, 015 |
| Increment 10 | Certification complete | integrated QA, pixel-perfect, release, MVP | LOT 016, 017, 018, 019, 020, 021 |

## 17. Dependency Graph

```text
PROGRAM-036
-> LOT 000 Program Readiness
-> LOT 001 Frontend Foundation
-> LOT 002 Shared UI Foundations
-> LOT 003 Navigation and Global Shell
-> LOT 004 Home
-> LOT 005 Work Overview
-> LOT 006 Work Plan
-> LOT 007 Work Activity
-> LOT 008 People and Experts
-> LOT 009 Sources and Evidence
-> LOT 010 Decisions
-> LOT 011 Review and Decide
-> LOT 012 Deliverables
-> LOT 013 Cross-Module Navigation
-> LOT 014 Responsive and Adaptive Layout
-> LOT 015 Accessibility Certification
-> LOT 016 Frontend Security and Integrity
-> LOT 017 Performance and Reliability
-> LOT 018 Integrated QA
-> LOT 019 Pixel-Perfect Certification
-> LOT 020 Release Candidate
-> LOT 021 MVP Certification
```

Mandatory dependencies:

- LOT 000 -> LOT 001
- LOT 001 -> LOT 002
- LOT 002 -> LOT 003, LOT 015
- LOT 003 -> LOT 004 to LOT 013
- LOT 004 -> LOT 005 and LOT 010 partially through shared work context
- LOT 005 -> LOT 006, LOT 007, LOT 008, LOT 009, LOT 010, LOT 012
- LOT 010 -> LOT 011
- LOT 011 -> LOT 020
- LOT 018 -> LOT 019 -> LOT 020 -> LOT 021

Parallelizable dependencies:

- LOT 006 and LOT 007 can proceed in parallel after Work Overview if they do not modify shared foundations.
- LOT 008 and LOT 009 can proceed in parallel after Work Overview if component contracts are isolated.
- LOT 016 and LOT 017 can proceed in parallel after foundation if they do not change the same shared primitives.
- LOT 018 can run alongside feature completion once the target surfaces exist.

Conditionally parallel:

- LOT 014 can run with feature lots if the layout baseline is not being changed.
- LOT 015 can run with features only when accessibility contracts remain stable.

Blocking dependencies:

- LOT 011 blocks release certification if persistence and confirmation are not proven.
- LOT 019 blocks release if capture or tolerance is not reproducible.
- LOT 021 blocks closure if unresolved critical conflicts remain.

## 18. Critical Path

Critical path:

1. Source consistency and readiness.
2. Foundation shell and navigation.
3. Shared UI primitives.
4. Core screens and decision flow.
5. Accessibility and responsive certification.
6. Integrated QA and pixel-perfect certification.
7. Release candidate.
8. MVP certification.

Critical blockers:

- unresolved source conflict;
- missing playbook validation;
- missing irreversible decision persistence;
- inaccessible drawer or dialog;
- unsupported visual drift;
- unverified responsiveness;
- placeholder behavior shipped as real.

Risk of rework:

- high if shared components change after screens begin;
- high if routing changes after screen completion;
- high if decision workflow is built before persistence semantics are fixed;
- high if accessibility is postponed;
- high if Figma conflicts are “averaged” instead of preserved.

## 19. Parallelization Rules

Rules:

- lots that modify the same foundation are not parallelizable without isolation;
- shared component work precedes screen work;
- a lot may run in parallel only if it does not mutate the same shared contracts as another lot;
- a conditional parallel lot must carry an explicit isolation boundary and a regression guard;
- parallel execution does not bypass gate order;
- a parallel lot cannot certify a dependency it does not own.

Approved parallel groups:

- LOT 006 + LOT 007
- LOT 008 + LOT 009
- LOT 016 + LOT 017
- LOT 018 + LOT 019 after target surfaces exist

Not parallel:

- LOT 000 with any implementation lot;
- LOT 001 with LOT 002;
- LOT 002 with screen lots that mutate shared primitives;
- LOT 010 with LOT 011 if the workflow contracts are still changing;
- LOT 020 with unresolved certification lots.

## 20. Gate Architecture

| Gate | Object | Preconditions | Controls | Evidence | PASS criteria | FAIL criteria | Authority | Failure consequence | Reprise procedure |
|---|---|---|---|---|---|---|---|---|---|
| GATE-SOURCE-CONSISTENCY | source baseline and numbering | official sources available | source inventory, numbering check, conflict scan | source matrix, conflict register | sources readable, conflicts enumerated, ID unambiguous | missing source, ambiguous ID, hidden conflict | Architect + Board delegate | block LOT 000 | update source inventory and reopen |
| GATE-PROGRAM-READINESS | readiness to start program work | source consistency pass | readiness review, environment check | readiness report | baseline approved and open dependencies explicit | unresolved blocker remains | Program Board | program stays blocked | resolve blocker or defer |
| GATE-FOUNDATION-CERTIFIED | foundation | LOT 001 complete | shell, routing, token, baseline checks | foundation proof | shell stable and testable | foundation unstable or incomplete | QA / Certification | screen work blocked | revert foundation or fix |
| GATE-SHARED-COMPONENTS-CERTIFIED | shared UI | LOT 002 complete | contract, accessibility, state checks | component proof | primitives reusable and accessible | component drift or hidden variant | QA / Certification | screen lots blocked | correct primitives and recertify |
| GATE-SCREEN-CERTIFIED | screen lot | screen lot complete | screen-specific contract checks | screen evidence | screen meets sources and states | screen overload or source mismatch | Technical Authority + QA | next dependent lot blocked | fix screen and retest |
| GATE-ACCESSIBILITY-CERTIFIED | accessibility | target surfaces available | keyboard, focus, aria, zoom checks | accessibility report | accessible paths verified | focus trap, label, or contrast failure | QA / Accessibility | release blocked | correct accessibility defects |
| GATE-RESPONSIVE-CERTIFIED | responsive | layout surfaces available | viewport, overflow, text wrap checks | responsive proof | documented behavior matches source | invented breakpoint or layout break | Technical Authority | release blocked | restore documented layout |
| GATE-SECURITY-CERTIFIED | frontend safety | input and decision surfaces present | safe render, input, URL, log checks | security report | no unsafe UI path | unsafe data path or fake permission | Security / QA | release blocked | fix security path and retest |
| GATE-PERFORMANCE-CERTIFIED | performance | core surfaces ready | loading, retry, stability checks | performance report | stable and efficient enough for daily use | jank, instability, runaway re-render | Technical Authority | candidate blocked | fix and retest |
| GATE-INTEGRATION-CERTIFIED | integration | lots tested together | cross-lot regression checks | integrated QA report | lots work together without regression | route/state/integration break | QA / Program Board delegate | release candidate blocked | repair integration |
| GATE-PIXEL-PERFECT-CERTIFIED | visual conformance | captures and reference available | capture comparison, tolerance review | visual diff proof | baseline matched or accepted deviations listed | visual drift unresolved | QA / Design Authority | release blocked | correct or accept deviation formally |
| GATE-RELEASE-CANDIDATE | release readiness | integration and pixel-perfect pass | build, compliance, residual risk review | candidate report | GO or explicit condition set | missing evidence or unresolved blocker | Program Board | MVP cert blocked | close gaps and reissue |
| GATE-MVP-CERTIFIED | final certification | release candidate accepted | final board review, non-regression check | certification record | final approval granted | any critical unresolved issue | Program Board | program remains open | remediate and resubmit |

## 21. Evidence Model

Evidence rules:

- every lot produces evidence;
- evidence must be verifiable;
- evidence must be linked to the lot and gate;
- evidence must show what was checked, not just what was claimed;
- evidence must preserve source references;
- evidence must include pass/fail or pass-with-conditions state.

Evidence types:

- source snapshot;
- traceability matrix;
- lot execution report;
- test report;
- accessibility report;
- responsive report;
- security report;
- performance report;
- pixel-perfect report;
- release candidate report;
- MVP certification report;
- decision record;
- rollback record.

## 22. Testing Model

Testing layers:

- unit tests for logic and transforms;
- component tests for shared primitives;
- integration tests for view contracts and navigation;
- accessibility tests for keyboard and aria behavior;
- visual tests for pixel-perfect conformance;
- workflow tests for irreversible decision flows;
- regression tests for previously certified lots.

Testing rules:

- a test must verify a contract, not an impression;
- a test must fail on fake success;
- a test must fail on hidden state loss;
- a test must fail if a placeholder is exposed as real;
- each lot must have the minimal tests needed to certify its scope.

## 23. Accessibility Model

Accessibility baseline:

- keyboard first on all interactive surfaces;
- focus visible and restored;
- dialogs and drawers accessible;
- labels persisted on forms;
- error text attached to the field;
- text contrast not dependent on color alone;
- zoom and text wrapping checked;
- screen reader semantics verified on critical paths.

Certification focus:

- Home;
- Work Overview;
- Decision Package / Review / Decide;
- drawers and global shell;
- forms and irreversible actions.

## 24. Responsive Model

Responsive rules:

- only documented breakpoints may be used;
- if no breakpoint is documented, no breakpoint is invented;
- layout compression must not destroy readability;
- drawers and overlays must remain usable under the documented viewport range;
- responsive testing is mandatory even if desktop-first;
- mobile behavior that is not documented remains open dependency, not invented product behavior.

## 25. Security Model

Security model rules:

- frontend must not leak sensitive data in logs;
- URLs and inputs must be handled safely;
- permission-dependent actions must not pretend to be available;
- irreversible actions require explicit confirmation and proof;
- frontend must not create unsafe assumptions about backend protection;
- any integrity-sensitive path must have a rejection state and a safe retry path.

## 26. Performance Model

Performance rules:

- avoid unnecessary re-render churn;
- keep shared primitives light;
- use lazy loading only when supported by source or implementation contract;
- avoid speculative optimization that changes the contract;
- maintain visual stability during loading and transitions;
- performance claims require measured evidence.

## 27. Pixel-Perfect Certification Model

Certification rules:

- capture method must be reproducible;
- viewport and resolution must be fixed for the capture set;
- comparison must use the source baseline;
- tolerance must be explicit;
- any visual conflict remains a conflict until formally accepted;
- no "average" visual value may replace a conflict without external decision.

Evidence required:

- capture matrix;
- baseline reference;
- diff or review log;
- anomaly list;
- correction record;
- final acceptance record.

## 28. Non-Regression Model

Non-regression rules:

- every certified lot becomes a baseline for later lots;
- later lots must not weaken earlier certified behavior;
- route, tab, focus, and scroll restoration must not regress;
- shared component updates must not silently change screen meaning;
- if a regression is found, the lot must be reopened or rolled back.

Protected areas:

- source authority order;
- shell and navigation;
- shared components;
- decision workflow;
- accessibility behavior;
- pixel-perfect baseline;
- irreversible decision trace.

## 29. Conflict Registry Model

| Conflict ID | Sources in conflict | Description | Lots concerned | Impact | Severity | Decision required | Authority | Status | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| CR-036-01 | Roadmap / numbering corpus | `PROGRAM-036` is the first unused number after the officially listed range through `PROGRAM-035`; no 036 exists in the corpus | LOT 000 | program numbering choice | High | accept PROGRAM-036 as next available ID | Program Board | Open until approved | Yes |
| CR-036-02 | PROGRAM-018 vs PROGRAM-036 scope | PROGRAM-018 is the closest existing UI/product program and overlaps the frontend implementation space, but it is not the same governance container | All lots | scope overlap | High | acknowledge overlap and keep PROGRAM-036 separate | Program Board | Open | Yes |
| CR-036-03 | Playbook vs readiness | Frontend Development Playbook exists, but no separate certification artifact was provided in the sources | LOT 000, LOT 001 | execution dependency | Medium | validate playbook before implementation start | Technical Authority | Open | Yes |
| CR-036-04 | UX / Figma / NFIB / Playbook | documented responsive and accessibility expectations differ in strictness across sources | LOT 014, LOT 015 | certification scope | Medium | preserve stricter rule per gate and document conflict | Program Board | Open | Conditional |

## 30. Decision Record Model

Decision Record fields:

- Decision Record ID;
- date;
- author;
- authority;
- subject;
- source references;
- conflict reference if any;
- decision;
- rationale;
- consequences;
- rollback condition;
- effective date.

Decision Record rules:

- every divergence must generate a Decision Record;
- a decision record must not be implicit;
- a decision record must not hide the source conflict it resolves;
- a decision record must be readable without guessing.

## 31. Change Control

Change control rules:

- changes are grouped by lot;
- changes cannot silently cross lot boundaries;
- a source change requires traceability update;
- a gate change requires re-validation of affected lots;
- a conflict change requires decision record or explicit open status;
- a change that affects shared components requires regression protection.

Change workflow:

1. identify change request;
2. map source impact;
3. map lot impact;
4. assess risk and regression;
5. decide GO/NO GO;
6. implement only inside the approved scope;
7. record evidence;
8. certify or rollback.

## 32. Risk Register

| Risk | Description | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-001 | Documentation incomplete | missing source or missing artifact | Medium | lot 000 readiness scan | Program Board / Architect |
| R-002 | Source conflict hidden | conflict resolved locally without trace | High | conflict registry and decision records | Architect |
| R-003 | Figma native data absent | no native file data, ids, or layer tree | High | use only available reference artifacts | Technical Authority |
| R-004 | Missing dimensions | exact values not fully available for some areas | Medium | preserve documented conflicts and do not invent | Technical Authority |
| R-005 | Placeholder behavior | fake button/action shipped as real | High | lot 002 and 011 gates | Frontend Lead |
| R-006 | Cognitive overload | screens become dashboards | High | UX source rules and shared review | UX Authority |
| R-007 | Accessibility debt | keyboard or dialog failure | High | lot 015 gate | QA / Accessibility |
| R-008 | Responsive delay | responsive treated as final patch | Medium | lot 014 gate | Technical Authority |
| R-009 | Irreversible decision not persisted | false receipt or duplicate submission | High | lot 011 gate | QA / Certification |
| R-010 | Pixel drift | visual approximation replaces baseline | Medium | lot 019 gate | Design Authority |
| R-011 | Excessive parallelism | shared foundations modified in parallel | Medium | parallelization rules | Architect |
| R-012 | Inter-module regression | navigation or state leaks across lots | Medium | lot 013 and 018 gates | QA / Certification |

## 33. Rollback Strategy

Rollback rules:

- rollback is lot-scoped by default;
- rollback must preserve evidence of what was changed;
- rollback must not erase the fact that the lot existed;
- rollback must restore the prior certified baseline;
- if the rollback is due to a source conflict, the conflict remains registered;
- if the rollback is due to a gate failure, the gate remains failed until retest.

Rollback targets:

- shared components revert first if they cause broad regression;
- screen-specific changes revert if they are isolated;
- workflow changes revert if irreversible behavior is not proven;
- release candidate reverts to the last certified lot set when needed.

## 34. Release Strategy

Release sequence:

1. complete the ready lot chain;
2. certify shared foundations;
3. certify screens incrementally;
4. certify accessibility and responsive behavior;
5. certify integration and pixel-perfect evidence;
6. produce release candidate evidence;
7. obtain Program Board decision;
8. publish MVP baseline only after approval.

Release policy:

- no release without evidence;
- no release with hidden conflict;
- no release with fake functionality;
- no release if a critical accessibility or decision trace is broken.

## 35. MVP Certification Strategy

MVP certification requires:

- all critical frontend flows working;
- source authority order respected;
- no open critical conflict on delivery scope;
- accessibility and pixel-perfect certification available;
- release candidate evidence accepted;
- non-regression evidence for prior lots;
- final Program Board approval.

MVP does not require:

- a redesign;
- a new design system;
- a new product vision;
- unresolved source gaps;
- unsupported mobile promises;
- backend changes not specified by source.

## 36. Program Deliverables

Mandatory deliverables:

- program architecture document;
- lot architecture table;
- dependency graph;
- gate architecture;
- evidence model;
- test model;
- accessibility model;
- responsive model;
- security model;
- performance model;
- pixel-perfect certification model;
- non-regression model;
- conflict registry;
- change control model;
- risk register;
- rollback strategy;
- release strategy;
- MVP certification strategy;
- open dependency list;
- missing information list;
- final readiness verdict.

## 37. Definition of Ready

PROGRAM-036 is ready when:

- the program ID is canonical and uncontested;
- the source order is known;
- the four mandatory source documents exist;
- source conflicts are registered;
- the program architecture is complete;
- the Playbook dependency is validated or explicitly blocked;
- the Board can decide on execution without further architecture work.

## 38. Definition of Done

PROGRAM-036 is done when:

- the frontend implementation is certified against the approved sources;
- critical flows are accessible and tested;
- pixel-perfect certification is complete;
- release candidate and MVP certification are approved;
- non-regression is demonstrated;
- the final evidence chain is complete;
- no open critical conflict remains.

## 39. Program Acceptance Criteria

Acceptance criteria:

- architecture is traceable to official sources;
- lots are ordered and bounded;
- gates exist and are actionable;
- dependencies are explicit;
- conflicts are preserved;
- incremental delivery is possible;
- certification is reproducible;
- no code is produced in this architecture mission.

## 40. Open Dependencies

| Dependency | Status | Why open |
|---|---|---|
| Frontend Development Playbook certification | OPEN | playbook file exists, but no separate certification artifact was provided |
| Source conflict resolution | OPEN | numbering and UI scope conflicts must remain explicitly registered |
| Figma native data | OPEN | native file data, IDs, layer tree, and dev mode data are unavailable in sources |
| Backend contract availability | OPEN | frontend architecture depends on contracts where the source provides them only partially |
| Responsive final scope | OPEN | official sources preserve responsive ambiguity |

## 41. Missing Information

Missing information in the source corpus:

- native Figma file identifier and metadata;
- frame and layer IDs;
- exact native layer tree;
- native Auto Layout and constraint details;
- native variable collections, aliases, and styles;
- Dev Mode export data;
- exact asset inventories not surfaced in the reference docs;
- final backend API contracts for every frontend mutation;
- final responsive behavior for un-documented breakpoints;
- official certification of the Playbook.

## 42. Final Readiness Verdict

Verdict: `READY WITH CONDITIONS`

Reasoning:

- the architecture is complete enough to govern a frontend implementation program;
- the program ID is determinable as `PROGRAM-036`;
- the official source stack is identified;
- the lot, gate, dependency, and certification model are defined;
- the program can be approved for later execution planning;
- execution remains blocked until readiness gates are satisfied in the actual implementation phase.

Conditions:

- confirm Program Board approval for PROGRAM-036;
- validate the Frontend Development Playbook as an execution dependency;
- preserve all source conflicts in the conflict registry;
- do not begin implementation before a distinct GO decision;
- keep PROGRAM-018 as contextual overlap, not as a silent substitute;
- do not produce code or modify any frontend asset in this mission.


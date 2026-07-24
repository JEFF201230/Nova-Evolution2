# 1. Document Control

| Field | Value |
|---|---|
| Document ID | `PROGRAM_036_MASTER_EXECUTION_PLAN` |
| Program | `PROGRAM-036 — NOVA Frontend Implementation` |
| Document type | Program execution planning |
| Status | Final |
| Scope | Execution plan for the 22 lots of PROGRAM-036 |
| Repository | `C:\DEV\nova-orchestrator` |

# 2. Program Identity

PROGRAM-036 is the canonical frontend implementation program for NOVA. This plan converts the approved program architecture into an operational execution sequence without changing lot scope, source authority, or governance rules.

# 3. Planning Basis

Sources read for this plan:

- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-MO-000_PROGRAM_READINESS.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-DR-001_FRONTEND_FOUNDATION_BASELINE.md`
- `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`
- `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md`
- `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK_CERTIFICATION.md`
- `Docs/10_NOVA/00_UX_AUDIT/NOVA_UX_AUDIT_REPORT.md`
- `Docs/24_MODULES/0-UI-DESIGN/SOURCE/FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`

Planning constraints:

- no lot perimeter is modified;
- no architecture is rewritten;
- no UX rule is re-authored;
- no code is produced;
- no new source document is introduced.

# 4. Execution Principles

- incremental delivery only;
- one functional lot at a time unless a pair is explicitly parallelized by the architecture;
- each lot has entry and exit gates;
- all implementation must remain source-traceable;
- all conflicts remain registered and unarbitrated unless a later decision record states otherwise;
- readiness, foundation, quality, and certification are distinct stages.

# 5. Pilotage Matrix

| LOT | Mission Order planned | Gates | Deliverables | Tests | Certification | Initial state |
|---|---|---|---|---|---|---|
| LOT 000 | MO-001 | GATE-SOURCE-CONSISTENCY, GATE-PROGRAM-READINESS | readiness pack, conflict inventory, baseline evidence | source completeness, repo baseline, diff check | readiness decision | NOT STARTED |
| LOT 001 | MO-002 | GATE-PROGRAM-READINESS, GATE-FOUNDATION-CERTIFIED | frontend shell, routing baseline, config set | typecheck, shell mount, route baseline, token smoke | foundation certification | NOT STARTED |
| LOT 002 | MO-003 | GATE-FOUNDATION-CERTIFIED, GATE-SHARED-COMPONENTS-CERTIFIED | shared UI primitives | component, keyboard, focus, visual states | shared component certification | NOT STARTED |
| LOT 003 | MO-004 | GATE-SHARED-COMPONENTS-CERTIFIED, GATE-SCREEN-CERTIFIED | global nav and shell | navigation, back/forward, context return | shell certification | NOT STARTED |
| LOT 004 | MO-005 | GATE-SCREEN-CERTIFIED | Home | Home path tests, empty/loading/error, pixel check | screen certification | NOT STARTED |
| LOT 005 | MO-006 | GATE-SCREEN-CERTIFIED | Work Overview | overview path tests, state coverage, pixel check | screen certification | NOT STARTED |
| LOT 006 | MO-007 | GATE-SCREEN-CERTIFIED | Work Plan | plan path tests, dependency states, pixel check | screen certification | NOT STARTED |
| LOT 007 | MO-008 | GATE-SCREEN-CERTIFIED | Work Activity | timeline/filter tests, event states, pixel check | screen certification | NOT STARTED |
| LOT 008 | MO-009 | GATE-SCREEN-CERTIFIED | People and Experts | list/drawer tests, availability states | screen certification | NOT STARTED |
| LOT 009 | MO-010 | GATE-SCREEN-CERTIFIED | Sources and Evidence | source coverage tests, drawer states | screen certification | NOT STARTED |
| LOT 010 | MO-011 | GATE-SCREEN-CERTIFIED | Decisions | decision list and recommendation tests | screen certification | NOT STARTED |
| LOT 011 | MO-012 | GATE-SCREEN-CERTIFIED, GATE-INTEGRATION-CERTIFIED | Review / Decide | workflow tests, double-submit prevention, receipt proof | integration certification | NOT STARTED |
| LOT 012 | MO-013 | GATE-SCREEN-CERTIFIED | Deliverables | readiness, history, drawer tests | screen certification | NOT STARTED |
| LOT 013 | MO-014 | GATE-SCREEN-CERTIFIED, GATE-INTEGRATION-CERTIFIED | cross-module navigation | cross-route tests, restoration tests | integration certification | NOT STARTED |
| LOT 014 | MO-015 | GATE-FOUNDATION-CERTIFIED, GATE-RESPONSIVE-CERTIFIED | responsive layout baseline | viewport tests, overflow checks | responsive certification | NOT STARTED |
| LOT 015 | MO-016 | GATE-SHARED-COMPONENTS-CERTIFIED, GATE-ACCESSIBILITY-CERTIFIED | accessibility certification evidence | keyboard, focus, aria, contrast, zoom | accessibility certification | NOT STARTED |
| LOT 016 | MO-017 | GATE-FOUNDATION-CERTIFIED, GATE-SECURITY-CERTIFIED | frontend security baseline | safe render, input, URL, log checks | security certification | NOT STARTED |
| LOT 017 | MO-018 | GATE-FOUNDATION-CERTIFIED, GATE-PERFORMANCE-CERTIFIED | performance baseline | load, split, stability tests | performance certification | NOT STARTED |
| LOT 018 | MO-019 | GATE-FOUNDATION-CERTIFIED, GATE-INTEGRATION-CERTIFIED | integrated QA pack | unit, component, integration, a11y, visual | integration certification | NOT STARTED |
| LOT 019 | MO-020 | GATE-SCREEN-CERTIFIED, GATE-PIXEL-PERFECT-CERTIFIED | pixel-perfect certification pack | capture comparison, tolerance, diff | pixel-perfect certification | NOT STARTED |
| LOT 020 | MO-021 | GATE-INTEGRATION-CERTIFIED, GATE-RELEASE-CANDIDATE | release candidate pack | build, compliance, residual risk checks | release candidate certification | NOT STARTED |
| LOT 021 | MO-022 | GATE-RELEASE-CANDIDATE, GATE-MVP-CERTIFIED | MVP certification pack | final non-regression, board evidence | MVP certification | NOT STARTED |

# 6. Detailed Lot Plan

## LOT 000 — Program Readiness

- Objective: verify sources, conflicts, repository baseline, and entry readiness.
- Prerequisites: official source set present; program ID recorded; repository readable.
- Documents sources: architecture, UX, Figma reference, NFIB, Playbook, certification, governance, register.
- Dependencies: program numbering, source completeness, repository inspection.
- Mission Order: MO-001 — establish readiness evidence and open dependency register.
- Components concerned: none.
- Screens concerned: none.
- Deliverables: readiness report, source matrix, conflict register, baseline capture.
- Entry criteria: sources readable and paths valid.
- Exit criteria: readiness verdict and blockers explicit.
- Gates: GATE-SOURCE-CONSISTENCY, GATE-PROGRAM-READINESS.
- Tests strategy: source inventory, diff check, path validation, presence checks.
- Pixel-perfect strategy: not applicable.
- Accessibility strategy: not applicable.
- Risks: ambiguous numbering, missing source, dirty tree.
- Rollback: none; preserve the snapshot.
- Estimate: S.
- Parallelization authorized: NON.
- Justification: it is a gate lot.

## LOT 001 — Frontend Foundation

- Objective: establish the app shell, routing baseline, CSS baseline, and test baseline.
- Prerequisites: LOT 000 readiness evidence; approved foundation decision.
- Documents sources: architecture, readiness, ADR, NFIB, Playbook, certification.
- Dependencies: stack, directory, routing, CSS, testing, and initial config decisions.
- Mission Order: MO-002 — create the foundation package boundary and executable shell.
- Components concerned: app shell, route controller, global token entry, root layout.
- Screens concerned: shell only; no feature screens.
- Deliverables: executable frontend baseline, configuration set, shell smoke proof.
- Entry criteria: stack and directory fixed; config plan fixed.
- Exit criteria: shell mounts, routing resolves, styles load, tests run.
- Gates: GATE-PROGRAM-READINESS, GATE-FOUNDATION-CERTIFIED.
- Tests strategy: typecheck, shell mount, route baseline, token smoke, config sanity.
- Pixel-perfect strategy: shell geometry only.
- Accessibility strategy: keyboard focus and landmarks for the shell baseline.
- Risks: overreach into feature scope, root package pollution.
- Rollback: revert the package boundary and shell files as one lot.
- Estimate: L.
- Parallelization authorized: NON.
- Justification: foundation must be stable before shared components.

## LOT 002 — Shared UI Foundations

- Objective: deliver the shared primitives reused by the program.
- Prerequisites: LOT 001 certified shell and config.
- Documents sources: Figma reference, NFIB component contracts, Playbook conventions, UX rules.
- Dependencies: tokens, typography, color system, drawer contract, interaction rules.
- Mission Order: MO-003 — build shared UI primitives and interaction states.
- Components concerned: buttons, cards, badges, tabs, overlays, drawers, tooltips, focus primitives.
- Screens concerned: shared usage only.
- Deliverables: certified shared component set, a11y proof, visual states proof.
- Entry criteria: token and contract baseline available.
- Exit criteria: shared components reusable, accessible, and source-bound.
- Gates: GATE-FOUNDATION-CERTIFIED, GATE-SHARED-COMPONENTS-CERTIFIED.
- Tests strategy: component contracts, keyboard, focus, hover, disabled, visual states.
- Pixel-perfect strategy: shared component dimensions and states.
- Accessibility strategy: focus visible, labels, Escape/close, role semantics.
- Risks: variant explosion, hidden design-system drift.
- Rollback: revert shared component package only.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: shared primitives must stabilize before screens.

## LOT 003 — NOVA Navigation and Global Shell

- Objective: stabilize global navigation, breadcrumb, and context retention.
- Prerequisites: LOT 002 certified shared primitives.
- Documents sources: UX navigation sections, Figma shell sections, NFIB routing/layout sections.
- Dependencies: shell, route controller, active view model, nav items.
- Mission Order: MO-004 — implement navigation shell and context return behavior.
- Components concerned: NavRail, header, breadcrumb, global search trigger if present.
- Screens concerned: Home, Work, Decisions, Deliverables.
- Deliverables: navigation shell, context restoration proof.
- Entry criteria: shared shell primitives certified.
- Exit criteria: routes and context restore without drift.
- Gates: GATE-SHARED-COMPONENTS-CERTIFIED, GATE-SCREEN-CERTIFIED.
- Tests strategy: route switching, back/forward, focus return, active item.
- Pixel-perfect strategy: nav rail, header, breadcrumb spacing.
- Accessibility strategy: keyboard navigation and focus order.
- Risks: breadcrumb mismatch, duplicate global action, context loss.
- Rollback: revert shell navigation changes.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: navigation is a shared dependency for all screens.

## LOT 004 — Home

- Objective: deliver the Home focal point and priority entry behavior.
- Prerequisites: LOT 003 shell/navigation certified.
- Documents sources: UX Home rules, Figma Home surfaces, NFIB screen contracts.
- Dependencies: active work state, next best action, priority decision state.
- Mission Order: MO-005 — implement Home with loading, empty, error, blocked states.
- Components concerned: Home view, callout cards, primary CTA, drawer triggers.
- Screens concerned: Home.
- Deliverables: Home screen, state coverage, drawer entry.
- Entry criteria: shell and nav stable.
- Exit criteria: one primary action, no overload, states covered.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: rendering, CTA dominance, empty/loading/error, focus.
- Pixel-perfect strategy: hero and Home card geometry.
- Accessibility strategy: heading order, CTA labels, state announcement.
- Risks: dashboard creep, multiple competing actions.
- Rollback: revert Home screen only.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: Home is a primary user entry but still depends on shell stability.

## LOT 005 — Work Overview

- Objective: implement the Work overview entry point and summary action.
- Prerequisites: LOT 004 Home and shell path behavior.
- Documents sources: UX Work overview rules, Figma overview sections, NFIB screen contracts.
- Dependencies: Work shell, object summary data, decision priority data.
- Mission Order: MO-006 — implement Work Overview with summary and priority states.
- Components concerned: WorkOverviewTab, summary cards, priority badges, drawer entry.
- Screens concerned: Work overview.
- Deliverables: overview screen, summary states, priority action proof.
- Entry criteria: Work shell available.
- Exit criteria: overview reflects source hierarchy and one main action.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: summary rendering, priority action, blocked state, empty state.
- Pixel-perfect strategy: overview grid and summary card spacing.
- Accessibility strategy: tab semantics, focus order, label clarity.
- Risks: duplicate information, extra dashboard behavior.
- Rollback: revert overview implementation only.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: overview depends on the Work shell and source hierarchy.

## LOT 006 — Work Plan

- Objective: implement the plan view with phase structure and blockers.
- Prerequisites: Work overview and shell path behavior.
- Documents sources: UX Plan rules, Figma plan sections, NFIB contracts.
- Dependencies: phase data, dependency data, blocker states.
- Mission Order: MO-007 — implement plan phases and dependency visualization.
- Components concerned: WorkPlanTab, phase rows, blockers, accordions.
- Screens concerned: Work plan.
- Deliverables: plan screen, phase states, blocker proof.
- Entry criteria: plan data contract available.
- Exit criteria: phase order, blocker display, and state coverage.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: expansion/collapse, blocker rendering, empty/error.
- Pixel-perfect strategy: phase spacing, line-up, indentation.
- Accessibility strategy: accordion semantics and keyboard support.
- Risks: over-dense plan layout, hidden dependencies.
- Rollback: revert plan screen only.
- Estimate: S.
- Parallelization authorized: OUI.
- Justification: can run with LOT 007 once phase contracts are stable.

## LOT 007 — Work Activity

- Objective: implement the activity timeline and source/human/AI events.
- Prerequisites: Work overview and shared event states.
- Documents sources: UX Activity rules, Figma activity sections, NFIB contracts.
- Dependencies: event model, filters, confidence variation semantics.
- Mission Order: MO-008 — implement activity timeline, filters, and event states.
- Components concerned: WorkActivityTab, timeline items, filters, comments.
- Screens concerned: Work activity.
- Deliverables: activity screen, filter proof, confidence variation proof.
- Entry criteria: event taxonomy available.
- Exit criteria: timeline and filters work without overload.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: filter toggles, event rendering, confidence labels, error state.
- Pixel-perfect strategy: timeline density, spacing, badges.
- Accessibility strategy: filter semantics and readable chronology.
- Risks: false confidence interpretation, long-item overload.
- Rollback: revert activity screen only.
- Estimate: M.
- Parallelization authorized: OUI.
- Justification: can run in parallel with LOT 006 after shared event contracts are stable.

## LOT 008 — People and Experts

- Objective: implement the people list and drawer details.
- Prerequisites: Work shell and shared drawer contract.
- Documents sources: UX People rules, Figma people sections, NFIB contracts.
- Dependencies: people model, availability states, drawer content.
- Mission Order: MO-009 — implement people list, contribution state, and drawer.
- Components concerned: WorkPeopleTab, person cards, People drawer.
- Screens concerned: People.
- Deliverables: people screen, drawer proof, availability states.
- Entry criteria: people data contract available.
- Exit criteria: list, detail, and blocked/available states work.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: list rendering, drawer open/close, focus return.
- Pixel-perfect strategy: card density and drawer geometry.
- Accessibility strategy: list semantics and drawer focus management.
- Risks: duplicate contributor info, drawer overload.
- Rollback: revert people screen only.
- Estimate: S.
- Parallelization authorized: OUI.
- Justification: can run with LOT 009 after shared drawer contract is stable.

## LOT 009 — Sources and Evidence

- Objective: implement source coverage, missing source, stale source, and conflicts.
- Prerequisites: Work shell and shared drawer contract.
- Documents sources: UX Sources rules, Figma source sections, NFIB contracts.
- Dependencies: source model, conflict states, evidence links.
- Mission Order: MO-010 — implement source coverage view and Source drawer.
- Components concerned: WorkSourcesTab, source cards, Source drawer.
- Screens concerned: Sources.
- Deliverables: source screen, coverage states, conflict proof.
- Entry criteria: source taxonomy available.
- Exit criteria: source states and evidence links are visible on demand.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: coverage states, drawer open/close, evidence links.
- Pixel-perfect strategy: source card and coverage badge spacing.
- Accessibility strategy: readable source status and drawer semantics.
- Risks: overexposing secondary data, conflict ambiguity.
- Rollback: revert sources screen only.
- Estimate: S.
- Parallelization authorized: OUI.
- Justification: can run with LOT 008 after shared drawer contract is stable.

## LOT 010 — Decisions

- Objective: implement the decision list and recommendation surfaces.
- Prerequisites: Work shell and decision data contract.
- Documents sources: UX Decisions rules, Figma decision sections, NFIB contracts.
- Dependencies: decision model, confidence, consequences, options.
- Mission Order: MO-011 — implement decision list, recommendation, and decision state.
- Components concerned: WorkDecisionsTab, decision cards, recommendation markers.
- Screens concerned: Decisions.
- Deliverables: decision list, confidence display, action states.
- Entry criteria: decision taxonomy available.
- Exit criteria: decisions are explicit and source-bound.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: list states, action labels, confidence checks.
- Pixel-perfect strategy: decision card hierarchy and badges.
- Accessibility strategy: list semantics and clear actionable labels.
- Risks: score overuse, hidden rationale.
- Rollback: revert decision list only.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: decision list is the parent of the workflow lot.

## LOT 011 — Review and Decide

- Objective: implement the Decision Package, Review, Decide, and Receipt flow.
- Prerequisites: LOT 010 decision list certified.
- Documents sources: UX workflow rules, Figma package sections, NFIB contracts.
- Dependencies: rationale, confirmation, persistence, receipt proof.
- Mission Order: MO-012 — implement the decision workflow and confirmation flow.
- Components concerned: DecisionPackageView, DecisionPauseView, DecisionReceiptView.
- Screens concerned: Review, Decide, Receipt.
- Deliverables: decision workflow, receipt proof, anti-double-submit checks.
- Entry criteria: decision contract and persistence model available.
- Exit criteria: irreversible decision is explicit and confirmable.
- Gates: GATE-SCREEN-CERTIFIED, GATE-INTEGRATION-CERTIFIED.
- Tests strategy: review/decide path, double submit prevention, persistence confirmation.
- Pixel-perfect strategy: package layout and receipt states.
- Accessibility strategy: dialog-like focus behavior and confirmation clarity.
- Risks: fake success, duplicate submission, missing receipt.
- Rollback: revert workflow and receipt implementation as one bounded lot.
- Estimate: L.
- Parallelization authorized: NON.
- Justification: the workflow is sequential and integrity-sensitive.

## LOT 012 — Deliverables

- Objective: implement the deliverables list, readiness, and detail drawer.
- Prerequisites: Work shell and deliverable contract.
- Documents sources: UX Deliverables rules, Figma deliverable sections, NFIB contracts.
- Dependencies: deliverable model, readiness states, history.
- Mission Order: MO-013 — implement deliverables list and deliverable drawer.
- Components concerned: WorkDeliverablesTab, deliverable cards, Deliverable drawer.
- Screens concerned: Deliverables.
- Deliverables: deliverables screen, readiness states, drawer proof.
- Entry criteria: deliverable taxonomy available.
- Exit criteria: readiness and history are visible on demand.
- Gates: GATE-SCREEN-CERTIFIED.
- Tests strategy: list states, drawer open/close, readiness labels.
- Pixel-perfect strategy: card hierarchy and drawer geometry.
- Accessibility strategy: list semantics and drawer focus restoration.
- Risks: cluttered metadata, overstated readiness.
- Rollback: revert deliverables screen only.
- Estimate: S.
- Parallelization authorized: NON.
- Justification: deliverables depend on the completed decision model.

## LOT 013 — Cross-Module Navigation

- Objective: stabilize navigation between Work, Sources, Decisions, Deliverables, and restoration behavior.
- Prerequisites: core screens certified and routes available.
- Documents sources: UX cross-navigation rules, Figma navigation references, NFIB routing model.
- Dependencies: routes, tabs, history state, scroll behavior if supported.
- Mission Order: MO-014 — implement route restoration and cross-object transitions.
- Components concerned: route controller, nav shell, restoration helpers.
- Screens concerned: cross-module transitions.
- Deliverables: route restoration proof, tab restoration proof, navigation regression pack.
- Entry criteria: target screens and route model exist.
- Exit criteria: context is preserved across navigation.
- Gates: GATE-SCREEN-CERTIFIED, GATE-INTEGRATION-CERTIFIED.
- Tests strategy: back/forward, deep links, tab restoration, drawer restoration.
- Pixel-perfect strategy: none beyond navigation surfaces.
- Accessibility strategy: focus restoration and predictable navigation order.
- Risks: route drift, context loss, scroll misbehavior.
- Rollback: revert navigation helpers only.
- Estimate: M.
- Parallelization authorized: OUI.
- Justification: can run with other hardening lots after routes are stable.

## LOT 014 — Responsive and Adaptive Layout

- Objective: implement only the documented responsive behavior.
- Prerequisites: foundation and target surfaces available.
- Documents sources: UX responsive rules, Figma responsive sections, NFIB responsive model.
- Dependencies: documented breakpoints, layout constraints, drawer behavior.
- Mission Order: MO-015 — implement responsive layout controls and verification.
- Components concerned: layout shell, drawers, tabs, grids.
- Screens concerned: all documented surfaces.
- Deliverables: responsive proof pack, viewport checks, overflow checks.
- Entry criteria: documented viewport rules available.
- Exit criteria: no invented breakpoint or layout branch.
- Gates: GATE-FOUNDATION-CERTIFIED, GATE-RESPONSIVE-CERTIFIED.
- Tests strategy: viewport checks, wrap checks, overflow and compression.
- Pixel-perfect strategy: responsive tolerances only on documented views.
- Accessibility strategy: zoom and text wrap stability.
- Risks: invented breakpoint, overflow regressions.
- Rollback: revert layout adjustments.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: must follow the foundation and source rules exactly.

## LOT 015 — Accessibility Certification

- Objective: certify keyboard, focus, semantics, and contrast on critical surfaces.
- Prerequisites: shared components and target screens available.
- Documents sources: UX accessibility rules, Figma limitations, NFIB accessibility model.
- Dependencies: focus management, drawer/dialog semantics, labels, contrast tokens.
- Mission Order: MO-016 — execute accessibility certification for the frontend surfaces.
- Components concerned: all interactive primitives, drawers, tabs, forms.
- Screens concerned: Home, Work, Decisions, Deliverables, drawers.
- Deliverables: accessibility report, keyboard trace, focus trace, contrast evidence.
- Entry criteria: interactive surfaces are implemented.
- Exit criteria: critical paths pass accessibility checks.
- Gates: GATE-SHARED-COMPONENTS-CERTIFIED, GATE-ACCESSIBILITY-CERTIFIED.
- Tests strategy: keyboard traversal, focus order, ARIA, labels, zoom.
- Pixel-perfect strategy: accessibility does not change the visual contract.
- Accessibility strategy: this lot is the accessibility certification gate.
- Risks: inaccessible overlays, poor focus restoration, contrast failures.
- Rollback: revert a11y-sensitive UI changes if required.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: certification must not be parallelized with unrelated visual changes.

## LOT 016 — Frontend Security and Integrity

- Objective: secure frontend rendering and integrity-sensitive interactions.
- Prerequisites: foundation and relevant mutation surfaces available.
- Documents sources: UX integrity rules, Figma workflow sections, NFIB security model.
- Dependencies: safe rendering, URL handling, mutation confirmation, log hygiene.
- Mission Order: MO-017 — implement security and integrity controls.
- Components concerned: mutation surfaces, confirm actions, logging paths.
- Screens concerned: decision and mutation paths.
- Deliverables: frontend security evidence pack.
- Entry criteria: mutation surfaces exist.
- Exit criteria: no unsafe render or fake permission path remains.
- Gates: GATE-FOUNDATION-CERTIFIED, GATE-SECURITY-CERTIFIED.
- Tests strategy: unsafe input handling, URL handling, log exposure checks.
- Pixel-perfect strategy: none beyond existing surfaces.
- Accessibility strategy: security controls must remain keyboard accessible.
- Risks: unsafe rendering, inconsistent permission state.
- Rollback: revert sensitive handling changes.
- Estimate: S.
- Parallelization authorized: OUI.
- Justification: can run with performance once the foundation is stable.

## LOT 017 — Performance and Reliability

- Objective: validate performance, loading, and recovery behavior.
- Prerequisites: foundation and stable primary surfaces.
- Documents sources: NFIB performance model, Figma motion/load sections, UX reliability rules.
- Dependencies: loading states, split points, recovery paths.
- Mission Order: MO-018 — implement performance and reliability controls.
- Components concerned: app shell, list-heavy screens, drawers, loading states.
- Screens concerned: all primary surfaces.
- Deliverables: performance evidence pack, recovery proof.
- Entry criteria: stable shell and screen rendering available.
- Exit criteria: no avoidable jank or unstable load path.
- Gates: GATE-FOUNDATION-CERTIFIED, GATE-PERFORMANCE-CERTIFIED.
- Tests strategy: load timing, retry, split, state recovery.
- Pixel-perfect strategy: stability during load and transition.
- Accessibility strategy: loading and retry remain perceivable and actionable.
- Risks: re-render churn, visual instability, slow recovery.
- Rollback: revert perf-sensitive adjustments.
- Estimate: S.
- Parallelization authorized: OUI.
- Justification: can run with security as a hardening pair.

## LOT 018 — Integrated QA

- Objective: certify the implemented lots together as a coherent frontend.
- Prerequisites: foundation, screens, and hardening lots available.
- Documents sources: NFIB test model, Playbook QA rules, architecture gate model.
- Dependencies: unit, component, integration, accessibility, and visual coverage.
- Mission Order: MO-019 — execute integrated quality assurance across the implemented surface.
- Components concerned: implemented shell, components, screens, workflow.
- Screens concerned: all implemented screens.
- Deliverables: integrated QA report, regression list, test evidence pack.
- Entry criteria: component and screen lots present.
- Exit criteria: cross-lot regressions are resolved or documented.
- Gates: GATE-FOUNDATION-CERTIFIED, GATE-INTEGRATION-CERTIFIED.
- Tests strategy: unit, component, integration, a11y, visual, navigation.
- Pixel-perfect strategy: compare all certified surfaces against baseline.
- Accessibility strategy: verify critical paths end to end.
- Risks: inter-lot drift, hidden regression, test gaps.
- Rollback: roll back the last conflicting lot set.
- Estimate: M.
- Parallelization authorized: OUI.
- Justification: can run with pixel-perfect once the surfaces exist.

## LOT 019 — Pixel-Perfect Certification

- Objective: compare implemented surfaces to the approved baseline.
- Prerequisites: target surfaces and capture method available.
- Documents sources: Figma reference, UX, NFIB pixel-perfect model.
- Dependencies: stable geometry, reproducible capture, tolerance policy.
- Mission Order: MO-020 — execute pixel-perfect certification and diff review.
- Components concerned: certified surfaces, drawers, overlays, tabs, cards.
- Screens concerned: implemented certification surfaces.
- Deliverables: pixel-perfect report, diffs, accepted deviations if any.
- Entry criteria: reference baseline and capture method established.
- Exit criteria: deviations are accepted or corrected.
- Gates: GATE-SCREEN-CERTIFIED, GATE-PIXEL-PERFECT-CERTIFIED.
- Tests strategy: screenshot diff, viewport lock, anomaly review.
- Pixel-perfect strategy: this lot is the pixel-perfect gate.
- Accessibility strategy: visual fixes must not break a11y.
- Risks: drift, tolerance abuse, geometry mismatch.
- Rollback: revert visual changes that cannot be certified.
- Estimate: M.
- Parallelization authorized: NON.
- Justification: certification is sequential and evidence-driven.

## LOT 020 — Release Candidate

- Objective: assemble the release candidate with compliance evidence.
- Prerequisites: integration and pixel-perfect certification complete.
- Documents sources: architecture, NFIB, Playbook, QA evidence, certification docs.
- Dependencies: build, compliance checks, residual risk review.
- Mission Order: MO-021 — assemble release candidate and GO / NO GO evidence.
- Components concerned: built frontend package and evidence outputs.
- Screens concerned: release candidate surface set.
- Deliverables: release candidate pack, residual deviations, GO / NO GO proposal.
- Entry criteria: certification evidence available.
- Exit criteria: release candidate is complete or explicitly rejected.
- Gates: GATE-INTEGRATION-CERTIFIED, GATE-RELEASE-CANDIDATE.
- Tests strategy: build, compliance, regression, release smoke.
- Pixel-perfect strategy: release candidate must inherit certified visual state.
- Accessibility strategy: release candidate keeps certified a11y evidence intact.
- Risks: missing evidence, residual critical issue, build failure.
- Rollback: revert to last certified lot set.
- Estimate: S.
- Parallelization authorized: NON.
- Justification: candidate assembly is a controlled terminal step.

## LOT 021 — MVP Certification

- Objective: certify the MVP baseline for PROGRAM-036.
- Prerequisites: release candidate accepted.
- Documents sources: all official program sources and final certification evidence.
- Dependencies: final non-regression proof, board validation, residual issue closure.
- Mission Order: MO-022 — execute MVP certification and final evidence closure.
- Components concerned: full implemented frontend set.
- Screens concerned: all MVP surfaces.
- Deliverables: MVP certification record, final baseline, residual conditions list if any.
- Entry criteria: release candidate approved.
- Exit criteria: MVP certificate issued or rejected.
- Gates: GATE-RELEASE-CANDIDATE, GATE-MVP-CERTIFIED.
- Tests strategy: final regression, certification sampling, evidence completeness.
- Pixel-perfect strategy: final certified baseline comparison.
- Accessibility strategy: final accessibility confirmation on critical paths.
- Risks: unresolved blocker, non-regression failure, missing evidence.
- Rollback: revert to the last certified release candidate.
- Estimate: S.
- Parallelization authorized: NON.
- Justification: final certification is sequential by governance.

# 7. Increment Plan

## Increment 1 — Foundation readiness and executable shell

- Value: creates the first executable frontend boundary.
- Lots included: LOT 000, LOT 001
- Demonstration expected: shell boots, routes resolve, baseline configs exist.
- GO / NO GO criteria: source baseline stable, shell mount successful, config plan traceable.

## Increment 2 — Shared UI foundations

- Value: stabilizes reusable primitives.
- Lots included: LOT 002, LOT 003
- Demonstration expected: shared components and global shell/navigation work together.
- GO / NO GO criteria: primitives accessible, shell navigation stable.

## Increment 3 — Home and Work Overview

- Value: unlocks the main entry and first work summary.
- Lots included: LOT 004, LOT 005
- Demonstration expected: Home opens Work overview with stable summary behavior.
- GO / NO GO criteria: one main action per screen, no overload, states covered.

## Increment 4 — Work planning and activity

- Value: gives structure and traceability inside Work.
- Lots included: LOT 006, LOT 007
- Demonstration expected: plan and activity surfaces show phase and event logic.
- GO / NO GO criteria: dependencies and filters are readable and testable.

## Increment 5 — People and Sources

- Value: exposes operational context and evidence.
- Lots included: LOT 008, LOT 009
- Demonstration expected: people and source drawers open correctly and preserve context.
- GO / NO GO criteria: drawers work, detail is on demand only.

## Increment 6 — Decisions and workflow

- Value: activates decision-making and confirmation flow.
- Lots included: LOT 010, LOT 011
- Demonstration expected: decision list drives review/decide/receipt with proof.
- GO / NO GO criteria: irreversible action is explicit and protected.

## Increment 7 — Deliverables and cross-module navigation

- Value: enables output tracking and object-to-object movement.
- Lots included: LOT 012, LOT 013
- Demonstration expected: deliverables open with history and route/context restoration works.
- GO / NO GO criteria: transitions preserve context, no route drift.

## Increment 8 — Responsive and accessibility hardening

- Value: makes the frontend resilient under documented viewport and a11y constraints.
- Lots included: LOT 014, LOT 015
- Demonstration expected: documented responsive behavior and accessibility certification evidence.
- GO / NO GO criteria: no invented breakpoints, keyboard and focus pass.

## Increment 9 — Security, performance, and integrated QA

- Value: hardens integrity, loading, and cross-lot quality.
- Lots included: LOT 016, LOT 017, LOT 018
- Demonstration expected: secure rendering, stable performance, and integrated QA reports.
- GO / NO GO criteria: no unsafe path, no perf instability, no regression gap.

## Increment 10 — Pixel-perfect, release, and MVP certification

- Value: closes the program with visual, release, and final certification evidence.
- Lots included: LOT 019, LOT 020, LOT 021
- Demonstration expected: certified diff set, release candidate, MVP record.
- GO / NO GO criteria: pixel-perfect accepted, release candidate complete, MVP approved.

# 8. Critical Path

Confirmed critical path:

LOT 000 -> LOT 001 -> LOT 002 -> LOT 003 -> LOT 004 -> LOT 005 -> LOT 006 + LOT 007 -> LOT 008 + LOT 009 -> LOT 010 -> LOT 011 -> LOT 012 -> LOT 013 -> LOT 014 -> LOT 015 -> LOT 016 + LOT 017 -> LOT 018 -> LOT 019 -> LOT 020 -> LOT 021

Synchronization points:

- after LOT 002: shared primitives must stabilize before screens;
- after LOT 003: navigation and shell must be stable before feature screens;
- after LOT 011: the decision workflow must be proven before downstream release logic;
- after LOT 019: visual certification must be complete before release candidate assembly;
- after LOT 020: release candidate evidence must be closed before MVP certification.

Parallel lots authorized by the architecture:

- LOT 006 + LOT 007
- LOT 008 + LOT 009
- LOT 016 + LOT 017
- LOT 018 + LOT 019 after target surfaces exist

Blocking lots:

- LOT 000
- LOT 001
- LOT 002
- LOT 003
- LOT 011
- LOT 019
- LOT 020
- LOT 021

# 9. Gate Reference

Gates referenced in this plan:

- GATE-SOURCE-CONSISTENCY
- GATE-PROGRAM-READINESS
- GATE-FOUNDATION-CERTIFIED
- GATE-SHARED-COMPONENTS-CERTIFIED
- GATE-SCREEN-CERTIFIED
- GATE-ACCESSIBILITY-CERTIFIED
- GATE-RESPONSIVE-CERTIFIED
- GATE-SECURITY-CERTIFIED
- GATE-PERFORMANCE-CERTIFIED
- GATE-INTEGRATION-CERTIFIED
- GATE-PIXEL-PERFECT-CERTIFIED
- GATE-RELEASE-CANDIDATE
- GATE-MVP-CERTIFIED

Total gates referenced: 13

# 10. Final Decision

Decision: READY FOR EXECUTION

Reason:

- the program architecture is already defined;
- the readiness blocker has been converted into a canonical foundation baseline;
- the execution baseline is now explicit enough to launch LOT 001 under governance;
- no new architecture, UX, or conception document is required before development starts.

First LOT executable: LOT 001

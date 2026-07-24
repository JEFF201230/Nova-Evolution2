# PROGRAM-018

# Product Studio V1 Prototype Specification

## Status

COMPLETE — READY FOR FIGMA ASSEMBLY

## Authority

This specification executes P18-M-007 under P18-MO-001. It translates the certified V0 screens and journeys into one connected V1 prototype. It does not redefine the certified product vision.

---

# 1. Prototype Objective

The prototype SHALL demonstrate that a person can describe an objective, understand NOVA's interpretation, retain control over execution, follow progress, collaborate, resolve difficulty, make a consequential decision and receive a professional outcome.

The prototype SHALL use public language. Internal terms such as Program, Mission Order, PDS, Gate, Evidence, Capability and Baseline SHALL remain absent except in explicitly labeled Expert detail.

Prototype fidelity is structural and interaction-complete. It SHALL validate hierarchy, behavior, content, responsive transformation, keyboard operation and state recovery. It SHALL NOT imply production code or final visual polish.

---

# 2. Prototype Frame Matrix

Every screen ID S01–S32 SHALL have a Desktop default frame at 1440×1024. The following frames are the minimum connected set.

| Frame ID | Frame name | State / mode | Required connection |
| --- | --- | --- | --- |
| F-S01-01 | S01 / Desktop / First Use / Guided | welcome | S02 |
| F-S01-02 | S01 / Desktop / Returning Attention / Standard | attention | S09, S02 |
| F-S02-01 | S02 / Desktop / Empty / Guided | empty composer | S02 validation |
| F-S02-02 | S02 / Desktop / Ready / Guided | objective entered | S03 or S16 |
| F-S02-03 | S02 / Desktop / Error / Guided | preserved input | S03 after correction |
| F-S03-01 | S03 / Desktop / Question 1 / Guided | clarification | next question |
| F-S03-02 | S03 / Desktop / Question 3 / Guided | final clarification | S04 |
| F-S04-01 | S04 / Desktop / Default / Standard | understood objective | S05 |
| F-S04-02 | S04 / Desktop / Assumptions / Standard | unresolved assumptions | edit, S05 |
| F-S05-01 | S05 / Desktop / Create / Standard | plan preview | S06 |
| F-S05-02 | S05 / Desktop / Recover / Standard | recovery plan | S06 |
| F-S06-01 | S06 / Desktop / A1 / Standard | confirmation | S09 |
| F-S06-02 | S06 / Desktop / Permission Conflict / Standard | A3 unavailable | nearest allowed option |
| F-S07-01 | S07 / Desktop / Attention / Standard | home | S09, S26, S02 |
| F-S07-02 | S07 / Desktop / All Clear / Standard | no attention | S08, S02 |
| F-S08-01 | S08 / Desktop / Cards / Standard | work list | S09 |
| F-S08-02 | S08 / Desktop / Table / Expert | expert work list | S09 |
| F-S09-01 | S09 / Desktop / Active / Standard | work overview | S10–S15 |
| F-S09-02 | S09 / Desktop / Blocked / Executive | blocker primary | S10, S19 |
| F-S10-01 | S10 / Desktop / Phases / Standard | plan | S19 |
| F-S11-01 | S11 / Desktop / Feed / Standard | activity | S13 |
| F-S12-01 | S12 / Desktop / Directory / Standard | experts | contribution drawer |
| F-S12-02 | S12 / Desktop / Contribution Drawer / Standard | bounded request | S11 |
| F-S13-01 | S13 / Desktop / Contradiction / Expert | source provenance | S18 |
| F-S14-01 | S14 / Desktop / Pending / Standard | decisions | S19 |
| F-S15-01 | S15 / Desktop / Drafts / Standard | deliverables | S22 |
| F-S16-01 | S16 / Desktop / Files Added / Guided | recovery intake | S17 |
| F-S16-02 | S16 / Desktop / Sensitive Warning / Guided | warning | confirm then S17 |
| F-S17-01 | S17 / Desktop / Recovery Ready / Standard | diagnosis | S05 Recover |
| F-S18-01 | S18 / Desktop / Findings / Expert | research workspace | S23 |
| F-S19-01 | S19 / Desktop / Default / Executive | decision package | S20 review |
| F-S19-02 | S19 / Desktop / Insufficient Basis / Executive | blocked decision | S13 or request work |
| F-S20-01 | S20 / Desktop / Review / Executive | decision pause step 1 | S20 decide |
| F-S20-02 | S20 / Desktop / Decide / Executive | no preselection | S21 |
| F-S21-01 | S21 / Desktop / Approved / Executive | receipt | S09 |
| F-S22-01 | S22 / Desktop / Document / Standard | setup | S23 |
| F-S23-01 | S23 / Desktop / Source Gaps / Standard | outline | S24 |
| F-S24-01 | S24 / Desktop / Unresolved / Standard | review | request changes or S25 |
| F-S24-02 | S24 / Desktop / Ready / Standard | approved | S25 |
| F-S25-01 | S25 / Desktop / Permission / Standard | share validation | success |
| F-S25-02 | S25 / Desktop / Success / Standard | exported | S15 |
| F-S26-01 | S26 / Desktop / Needs Me / Executive | global decisions | S19 |
| F-S27-01 | S27 / Desktop / In Review / Standard | global deliverables | S24 |
| F-S28-01 | S28 / Desktop / Results / Standard | global search | exact object |
| F-S29-01 | S29 / Desktop / Critical Alert / Standard | notifications | exact state |
| F-S30-01 | S30 / Desktop / Accessibility / Standard | preferences | save confirmation |
| F-S31-01 | S31 / Desktop / Offline / Standard | preserved draft | retry then prior frame |
| F-S31-02 | S31 / Desktop / Permission Denied / Standard | restricted | request access / return |
| F-S32-01 | S32 / Desktop / Contextual Help / Standard | help | return to context |

Responsive proof frames SHALL exist for S01, S04, S07, S09, S19, S20, S24 and S31 at Tablet 834×1194, Mobile 390×844 and Minimum Reflow 320×800. These proof frames SHALL preserve all actions and meaning.

---

# 3. Canonical Prototype Flows

## PF-01 — Create Work from Scratch

Entry: F-S01-01.

`S01 → S02 → S03 → S04 → S05(Create) → S06(A1) → S09(Active)`

Interactions:

- Select “Create something” or enter “Launch a local service for students.”
- Continue with explicit button; Enter does not submit the multiline composer.
- Answer up to three clarification questions; optional answers can be skipped.
- Edit one Mission Canvas section inline, preserve the rest, then prepare plan.
- Open one plan phase and return without losing scroll position.
- Select “NOVA prepares; I approve important choices” and start.

Success: user can identify the outcome, next action, autonomy boundary and first expected deliverable.

## PF-02 — Recover Work in Difficulty

Entry: F-S01-01.

`S01 → S02 → S16 → S17 → S05(Recover) → S06 → S09(Blocked/Recovery)`

Interactions:

- Select “Fix work” and attach a sample status report.
- Classify user statements as reported information; never silently convert them to facts.
- Acknowledge sensitive-data warning without losing files.
- Inspect threats, likely causes, contradictions and missing information.
- Review 72-hour stabilization actions and start recovery.

Success: user distinguishes fact, report and gap and knows the immediate stabilization action.

## PF-03 — Conduct Research and Analysis

Entry: F-S01-01.

`S01 → S02 → S03 → S18 → S13(Contradiction) → S18 → S23 → S24`

Interactions:

- Enter a research question and intended audience.
- Expand a Fact and its source; inspect a contradictory source.
- Return to the finding with context preserved.
- Prepare synthesis; unresolved gaps remain visible in outline and review.

Success: user can distinguish Fact, Hypothesis, Interpretation, Recommendation and Innovation and identify limitations.

## PF-04 — Prepare and Record a Strategic Decision

Entry: F-S26-01.

`S26 → S19 → S20(Review) → S20(Decide) → S21 → S09`

Interactions:

- Open the most urgent decision.
- Compare options, tradeoffs, dissent, affected parties and source basis.
- Enter Decision Pause; review consequence, reversibility and authority.
- Continue to an unselected decision set; approve and enter rationale.
- Receive immutable decision receipt and return to work.

Success: recommendation is understood as nonbinding; the authorized human makes an explicit, attributable decision.

## PF-05 — Produce a Professional Deliverable

Entry: F-S15-01 or F-S27-01.

`S15 → S22 → S23 → S24(Unresolved) → S24(Ready) → S25 → S15`

Interactions:

- Choose Document, audience, purpose, locale and confidentiality.
- Reorder one outline section using keyboard buttons, not drag only.
- Resolve a source gap and approve the new version.
- Review recipients, accessibility options and confidentiality before export.

Success: user understands audience, version, approval state, provenance gaps and export consequence.

## PF-06 — Monitor Execution and Unblock Work

Entry: F-S07-01.

`S07(Attention) → S09(Blocked) → S10 → S19 → S20 → S21 → S09(Active)`

Interactions:

- Open blocker from Needs attention.
- Inspect impact, owner, age and affected dependency.
- Open decision package and resolve through Decision Pause.
- Verify updated next action on Work Overview.

Success: manager resolves the blocker through the correct authority and sees the resulting plan change.

## PF-07 — Collaborate with Human and AI Experts

Entry: F-S09-01.

`S09 → S12 → Contribution Drawer → S11 → S13`

Interactions:

- Compare human and AI experts using explicit identity labels.
- Define bounded question, expected output, source access, effort and deadline.
- Submit contribution request and inspect resulting activity.
- Open cited sources and provenance.

Success: user knows who or what contributed, with which access, within which scope and on what basis.

## PF-08 — Error Recovery and Accessible Completion

Entry: F-S02-03.

`S02(Error) → S03 → S31(Offline) → retry → prior context → S09`

Interactions:

- Submit blank objective; focus moves to error summary then invalid field.
- Correct without re-entering preserved content.
- Simulate disconnection after clarification; show saved state and safe actions.
- Retry using keyboard and return focus to the originating control.

Success: keyboard and screen-reader users recover without lost data, lost context or focus trap.

## PF-09 — Returning Daily Use

`S07 → S08 → S09 → S11 → S29 → exact object`

Success: an employee sees only relevant attention, continues work and understands why a notification was received.

## PF-10 — Administration and Preferences

`S07 → S30 → save → S28 → S32 → return`

Success: administrator or end user adjusts authorized mode, language, accessibility, notification and AI controls without changing organization-enforced limits.

## PF-11 — VEEDDA Beneficiary and CSE Review

`S07 → S08 → S09 → S15 → S24 → S25`

Use a VEEDDA social-benefit scenario with plain public language, limited personal-data exposure and role-specific actions. Beneficiary sees status and required action; CSE representative sees governed review; administrator sees no extra personal data without authorization.

Success: role boundaries, confidentiality, explanation and export remain intact.

---

# 4. Interaction Contract

- Click/tap activation uses `On click → Navigate to`; keyboard activation is annotated for Enter/Space according to semantic role.
- Overlays use `Open overlay`, focus trap, Escape close for noncritical cases and return focus to trigger.
- Back actions preserve entered values, selection, scroll and active local tab.
- Smart Animate MAY be used for spatial continuity at 200–300 ms; state changes use Instant or Dissolve 120–180 ms. Reduced Motion uses Instant/Dissolve only.
- AI working state appears immediately, shows plain current activity after two seconds, offers Stop and never invents percentage progress.
- Critical, financial, legal, destructive and data-sensitive actions never use optimistic completion.
- Decision choices are never preselected. Approval always records item, version, authority, consequence and rationale policy.
- Deep links land on the exact object and state. Browser Back is represented by explicit backward prototype links.
- All loading, empty, partial, blocked, permission, offline, error and success states identify impact, retained work and next action.
- Hover is enhancement only; identical information/action is available on focus and tap.

---

# 5. Responsive Prototype Behavior

Desktop uses persistent global rail, visible work-local navigation and optional contextual conversation panel. Tablet collapses global navigation, uses one main column and overlays detail. Mobile uses bottom navigation for Home, Work, Decisions and Deliverables; content is one column and critical flows remain multi-step.

At 320 CSS px:

- no two-dimensional scroll except an explicitly labeled essential data view;
- tables become labeled records;
- tabs become a labeled selector when they do not fit;
- sticky action does not cover content or focus;
- dialogs become full-screen sheets;
- comparison content stacks by criterion while retaining option labels;
- all controls remain operable at 200% text zoom and simulated 400% browser zoom.

---

# 6. Accessibility Prototype Annotations

Every connected frame SHALL carry `A11Y-[SCREEN_ID]-NN` callouts covering landmark/heading hierarchy, focus entry/order, keyboard behavior, accessible name, role, value/state, live regions, field errors, contrast token, target size, reflow, reduced motion, gesture alternative and critical confirmation.

Minimum acceptance:

- WCAG 2.2 AA contrast: 4.5:1 normal text, 3:1 large text and UI/non-text;
- preferred targets 44×44 CSS px; never below WCAG target requirement without allowed spacing exception;
- visible, unobscured focus and no keyboard trap;
- status changes announced without moving focus;
- labels remain visible; icons and color never carry meaning alone;
- error summary links to invalid fields and input is retained;
- chart/visual information has text summary and accessible data equivalent;
- every drag, swipe, voice or hover interaction has a simple alternative.

---

# 7. Prototype Content Dataset

The connected prototype SHALL use one coherent fictional case: “Open a community learning service before September.” Supporting records include one project-recovery case, one strategic funding decision, three sources including one contradiction, one human legal expert, one AI research expert, one draft presentation and one approved executive summary.

Content SHALL include long French and German labels, localized dates, currencies, names with diacritics, an empty state, missing data, low confidence, one permission restriction and one offline recovery. No lorem ipsum SHALL appear in reviewed frames.

---

# 8. Prototype Completion Criteria

The prototype package is COMPLETE when:

- all S01–S32 Desktop default frames exist;
- the required state frames and responsive proof frames exist;
- PF-01 through PF-11 are connected and named;
- every flow has an entry point, success endpoint and recovery route;
- overlays close and return focus correctly;
- no irreversible or critical action is preselected or simulated as automatic;
- public-mode content contains no unexplained internal vocabulary;
- accessibility annotations cover every connected frame;
- keyboard-only walkthrough completes PF-01, PF-04, PF-05 and PF-08;
- VEEDDA role and confidentiality checks pass PF-11;
- no dead-end connection, placeholder destination or lost-input path remains.

## Decision

READY FOR FIGMA PROTOTYPE ASSEMBLY

# PROGRAM-018

# V0 Experience Specification

## Status

APPROVED FOR FIGMA

## 1. Experience Model

NOVA combines three synchronized layers:

1. Conversation for expression, clarification and explanation.
2. Mission Canvas for stable structured understanding.
3. Workspace for execution, decisions, collaboration and deliverables.

Conversation SHALL never be the only place where a commitment, task, source, decision or output exists.

## 2. Canonical End-to-End Lifecycle

```text
Express outcome
→ Clarify only material gaps
→ Review shared understanding
→ Preview plan, assumptions and autonomy
→ Human starts work
→ Execute and collaborate
→ Resolve exceptions and decisions
→ Review deliverables
→ Complete and retain traceability
```

At every stage the user can correct the outcome, inspect why NOVA made a proposal, reduce autonomy, pause work or request human help.

## 3. Onboarding

### 3.1 First entry

The first authenticated screen SHALL show:

- greeting using the user’s preferred name when available;
- primary question: “What would you like to achieve?”;
- multiline input;
- optional voice input;
- attach button;
- outcome examples: Create something, Fix work, Understand a situation, Make a decision;
- privacy/context note: “NOVA uses the information you share to prepare this work. You control what happens next.”;
- accessibility and language utilities available before task start.

No role form, product tour or configuration wizard SHALL precede the objective.

### 3.2 Progressive onboarding

NOVA teaches features in context:

- first clarification: explain that answers can be approximate;
- first plan: explain that nothing starts until the user confirms;
- first AI contribution: label author, confidence and sources;
- first decision: explain human authority and consequences;
- first export: explain audience, confidentiality and traceability options.

### 3.3 Returning entry

Returning users see:

- continue the most relevant work;
- items needing attention;
- recent deliverables;
- start new work.

## 4. Canonical User Journeys

### J-01 Create a project from scratch

1. User enters “I want to launch a service for small associations.”
2. NOVA restates the outcome and asks at most three material questions.
3. Mission Canvas shows outcome, audience, constraints, success and assumptions.
4. User edits or confirms the shared understanding.
5. NOVA proposes phases, contributors, decisions and first deliverables.
6. User chooses autonomy level and starts work.
7. Workspace opens on Overview with one next action.
8. NOVA and collaborators execute; progress and decisions remain visible.
9. User reviews deliverables and completes the work.

### J-02 Recover a project in difficulty

1. User chooses Fix or recover work and describes symptoms.
2. NOVA requests existing files, status and responsible people.
3. A Recovery Intake separates facts, claims and missing information.
4. NOVA produces a health diagnosis with confidence and contradictions.
5. User reviews proposed stabilize / diagnose / recover phases.
6. Critical changes to scope, budget or accountability require Decision Pause.
7. Recovery workspace emphasizes blockers, owners and next 72-hour actions.
8. Health transitions are explained; no green status appears without criteria.

### J-03 Conduct analysis or research

1. User states a question and intended audience.
2. NOVA confirms scope, deadline, depth and acceptable source types.
3. Research workspace shows questions, sources, claims, assumptions and gaps.
4. AI experts propose findings; human/domain experts can challenge them.
5. Contradictions remain visible until resolved or declared.
6. User receives synthesis with confidence, limitations and citations.
7. Deliverable can become a report, presentation or decision input.

### J-04 Prepare a strategic decision

1. User describes the decision, authority and deadline.
2. NOVA separates the decision from the preferred solution.
3. Decision package includes context, options, criteria, consequences, risks, dissent and sources.
4. User may request another option or challenge assumptions.
5. Decision authority enters Decision Pause.
6. Authority chooses Approve, Reject, Request changes or Defer and records rationale.
7. The immutable decision summary returns to the related work.

### J-05 Produce professional deliverables

1. User selects Produce a deliverable or requests an output inside work.
2. NOVA asks audience, purpose, format, language, confidentiality and deadline.
3. Outline preview shows content hierarchy and source coverage.
4. User edits structure or generates draft.
5. Review mode highlights assumptions, missing sources and unresolved decisions.
6. User approves content and exports PDF, presentation, dashboard view or executive summary.
7. Export retains version, owner and optional lineage appendix.

### J-06 Monitor execution

1. User opens Home or Work.
2. NOVA summarizes what changed, what needs attention and what comes next.
3. User filters by mine, team, risk or deadline.
4. Opening an item preserves return context.
5. A blocker view states impact, owner, age and proposed resolution.
6. User resolves, delegates or requests a decision.

### J-07 Collaborate with human and AI experts

1. User opens People and experts inside work.
2. Directory distinguishes human, AI and unavailable expertise.
3. User sees role, expected contribution, access and cost/effort where applicable.
4. User requests a bounded contribution.
5. Expert output appears as a contribution with author, time, confidence and sources.
6. User accepts, challenges, edits or rejects it; acceptance never equals critical approval.

## 5. Adaptive Experience Model

### 5.1 Modes

| Mode | Best for | Behavior |
| --- | --- | --- |
| Guided | novice, unfamiliar, high uncertainty | short steps, examples, definitions, confirmation, fewer visible controls |
| Standard | most operational work | concise overview, contextual detail, routine shortcuts |
| Executive | decision authority | outcomes, changes, exposure, options, decisions, concise source access |
| Expert detail | specialist inspection | identifiers, provenance, structured metadata, contradictions, architecture and audit fields |

### 5.2 Adaptation inputs

- explicit user preference;
- task risk and reversibility;
- demonstrated familiarity;
- role and permission;
- accessibility preferences;
- device and viewport;
- current uncertainty and error state.

NOVA SHALL ask before permanently changing mode. Risk cannot be hidden by mode. Object names and destinations remain stable across modes.

### 5.3 Density rules

- Guided: one primary action, up to three visible secondary choices.
- Standard: one primary action and context-relevant secondary actions.
- Executive: summary first, exceptions second, supporting detail on demand.
- Expert: greater density permitted, but keyboard order and grouping remain clear.

## 6. Navigation

### 6.1 Global destinations

- Home: orientation, resume, attention, start.
- Work: all active and completed work.
- Decisions: decisions requiring or recording human authority.
- Deliverables: drafts, reviews and published outputs.

### 6.2 Utilities

- Search / command palette.
- Notifications and attention queue.
- Help and support.
- Organization switcher.
- Profile, language and accessibility preferences.
- Admin entry when authorized.

### 6.3 Work-local navigation

- Overview
- Plan
- Activity
- People & experts
- Sources
- Decisions
- Deliverables

On narrow screens, these become a labeled selector. Current location SHALL be visible and programmatically determinable.

### 6.4 Navigation rules

- Back returns to the previous context, not an arbitrary root.
- Deep links preserve selected work and tab.
- Conversation can open any canonical object but cannot create a hidden parallel location.
- Breadcrumbs appear in Expert detail and deep admin contexts, not routine mobile flows.

## 7. Information Architecture

```text
NOVA
├── Home
│   ├── Continue
│   ├── Needs attention
│   ├── Recent outcomes
│   └── Start new work
├── Work
│   ├── Work list
│   └── Work detail
│       ├── Overview
│       ├── Plan
│       ├── Activity
│       ├── People & experts
│       ├── Sources
│       ├── Decisions
│       └── Deliverables
├── Decisions
│   ├── Needs my decision
│   ├── Waiting on others
│   └── Decision history
├── Deliverables
│   ├── Drafts
│   ├── In review
│   └── Published
└── Utilities
    ├── Search
    ├── Notifications
    ├── Help
    ├── Preferences
    └── Administration
```

## 8. Conversational Interaction Model

### 8.1 Message anatomy

Every NOVA response may contain:

- direct answer or recommendation;
- short rationale;
- uncertainty/assumption notice when material;
- source link when a factual claim affects the outcome;
- one primary next action;
- optional “Why this?” and “Show detail.”

### 8.2 Supported user actions

- correct a fact;
- edit the objective;
- request alternatives;
- ask for sources;
- reduce or increase explanation depth;
- pause or stop work;
- undo reversible action;
- request human review;
- report an unsafe or irrelevant response.

### 8.3 Initiative rules

NOVA may proactively:

- surface a blocker or deadline;
- ask for missing information that changes the path;
- propose a safer alternative;
- summarize meaningful changes;
- prepare a decision package.

NOVA SHALL NOT silently:

- change the agreed outcome;
- expand scope materially;
- invite people or disclose data;
- commit funds or contractual terms;
- approve legal, financial, HR or strategic decisions;
- publish a deliverable;
- delete or irreversibly alter work.

## 9. Trust and Human-Control Model

### 9.1 Trust layers

1. Identity: who or what produced the contribution.
2. Basis: sources, assumptions and methods.
3. Confidence: calibrated level with explanation.
4. Boundaries: what NOVA cannot establish or do.
5. Control: edit, challenge, undo, pause and approve.
6. Record: what changed, who decided and when.

### 9.2 Confidence presentation

Do not show a standalone percentage. Show:

- confidence label: Low, Medium or High;
- why: source coverage, agreement and freshness;
- assumptions count;
- unresolved questions;
- what would increase confidence.

Color SHALL not be the only carrier. “High confidence” SHALL never mean “approved.”

### 9.3 Autonomy levels

| Level | Public label | Permitted behavior |
| --- | --- | --- |
| A0 | Suggest only | NOVA proposes; user performs actions. |
| A1 | Prepare for me | NOVA drafts and stages; user confirms execution. |
| A2 | Do reversible work | NOVA executes bounded reversible actions and reports them. |
| A3 | Run within limits | NOVA executes within explicit policy; consequential decisions still pause. |

### 9.4 Decision Pause

For critical decisions, the interface SHALL:

- remove unrelated navigation distractions without trapping the user;
- identify the decision authority;
- state exactly what will happen and what will not happen;
- show affected people, money, data, obligations and reversibility;
- show options, recommendation, dissent and unresolved uncertainty;
- require an explicit choice and rationale where governance requires;
- use a review step before irreversible confirmation;
- provide Cancel/Return without loss;
- record identity, scope, timestamp and decision.

## 10. Visual Hierarchy

### 10.1 Page order

1. Context and page title.
2. Outcome/status summary.
3. Primary next action.
4. Exceptions: blockers, decisions, missing information.
5. Main content.
6. Supporting detail and history.

### 10.2 Layout

- Maximum reading width: 72 characters for prose.
- Primary workspace: 12-column desktop grid, 8-column tablet, 4-column mobile.
- Spacing base: 4 px; standard rhythm: 8/12/16/24/32/48/64.
- Cards group actions only when the relationship is meaningful.
- Avoid nested cards beyond two visual levels.
- Use tables only when row/column comparison matters; provide stacked mobile alternative.

### 10.3 Color and status

- Neutral surfaces dominate.
- Accent identifies interaction and current location.
- Green: achieved/available, never mere absence of known failure.
- Amber: attention or uncertainty.
- Red: blocking, destructive or critical exposure.
- Blue/purple SHALL not be reserved as “AI color”; AI identity requires text/icon labels.

## 11. Accessibility Rules

V0 SHALL be annotated for WCAG 2.2 AA and include:

- semantic landmarks and logical heading order;
- complete keyboard operation and visible, unobscured focus;
- minimum 24×24 CSS px pointer targets or sufficient spacing; preferred product target 44×44;
- text contrast at least 4.5:1; large text at least 3:1; UI/non-text contrast at least 3:1;
- reflow at 320 CSS px without two-dimensional scrolling except essential data views;
- no color-only, position-only or sensory-only instruction;
- text alternatives and accessible names matching visible labels;
- reduced-motion behavior and no essential motion-only meaning;
- captions/transcripts for audiovisual content;
- accessible authentication and support for password managers/paste;
- redundant-entry avoidance and preservation of entered data after errors;
- errors identified in text, connected to fields and paired with correction guidance;
- confirmation for legal, financial, destructive and data-sensitive actions;
- alternatives to drag and complex pointer gestures;
- timeouts disclosed, extendable and recoverable;
- chart text summary and accessible data table;
- language, locale, date, number and currency declared and localized;
- screen-reader announcement for asynchronous status without stealing focus.

## 12. Responsive Rules

### Desktop ≥ 1200 px

- persistent global rail (expanded or icon+label according to space);
- work-local navigation visible;
- optional contextual conversation panel;
- two-column summary/detail patterns permitted.

### Tablet 768–1199 px

- collapsible global navigation;
- one primary content column plus optional overlay detail;
- work-local tabs scroll or become selector based on fit;
- no hover-dependent control.

### Mobile 320–767 px

- bottom navigation for Home, Work, Decisions and Deliverables;
- single content column;
- sticky primary action may appear above bottom navigation without obscuring focus/content;
- conversation and structured view switch using labeled tabs;
- tables become labeled records or allow essential horizontal scroll with instructions;
- critical decisions remain multi-step, never compressed into a swipe.

### Large/zoomed text

At 200% text zoom and 400% browser zoom, content reflows; controls wrap; labels remain visible; sticky regions SHALL not consume most of the viewport.

## 13. System States

### Empty

- state what belongs here;
- explain value;
- provide one primary start action and optional example;
- never imply user failure.

### Loading

- show immediate acknowledgement;
- use skeleton only when structure is known;
- after 2 seconds show a plain status;
- after 10 seconds offer background continuation or retry when feasible;
- preserve input and allow safe navigation.

### AI working

- state current activity in plain language;
- show elapsed/progress only when meaningful;
- allow Stop;
- preserve partial results with clear incomplete status;
- never fabricate precise completion percentages.

### Error

- say what failed, impact, retained data and next action;
- provide Retry, Save draft or Get help as relevant;
- expose technical code only in copyable Expert detail;
- keep focus on the error summary then first invalid field.

### Partial result

- distinguish completed, missing and uncertain sections;
- permit use of valid partial work;
- never present partial output as complete.

### Approval

- identify item, version, owner, consequences and authority;
- choices: Approve, Request changes, Reject, Defer where valid;
- record rationale and announce result.

### Critical decision

- invoke Decision Pause;
- default is no decision;
- destructive choice visually distinct but not preselected;
- typed confirmation only when it reduces genuine ambiguity, not as ritual.

### Blocked

- state blocker, impact, owner, age and needed resolution;
- suggest options without auto-committing;
- allow escalation to an authorized person.

### Offline / disconnected

- state connection status;
- identify read-only or locally preserved content;
- queue only safe reversible edits;
- require renewed confirmation for expired critical actions.

### Permission denied

- state that access is restricted without exposing sensitive existence/details;
- identify request-access path or accountable administrator;
- preserve return context.

### Success

- state exactly what completed and what happens next;
- provide view/share/export action;
- avoid blocking celebratory animation.

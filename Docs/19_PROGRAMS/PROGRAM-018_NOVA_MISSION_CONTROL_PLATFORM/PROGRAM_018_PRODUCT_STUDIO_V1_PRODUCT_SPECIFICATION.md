# PROGRAM-018

# Product Studio V1 — Product Specification

## Status

PRODUCT STUDIO V1 — INTEGRATED SPECIFICATION

## 1. Product Narrative

NOVA turns an objective expressed in ordinary language into controlled, traceable work and a usable result. It unifies clarification, planning, execution, human and AI collaboration, decisions and professional deliverables without requiring users to learn an internal operating model.

Public promise:

> Tell NOVA what you want to achieve. NOVA helps you turn it into a clear, controlled path to a usable result.

NOVA is mission-first, but public screens SHALL use plain terms such as **work**, **result**, **decision**, **source**, **person** and **deliverable**. Internal terms remain available only in authorized Expert detail.

## 2. Product Outcomes

V1 SHALL enable users to:

- create new work from an unstructured objective;
- recover work in difficulty;
- research or analyze a situation;
- prepare and record a strategic decision;
- produce a professional deliverable;
- monitor execution and resolve blockers;
- collaborate with bounded human and AI expertise.

The experience succeeds when the user can always answer: what are we trying to achieve, what changed, what needs attention, what happens next, and what remains under human control?

## 3. Experience Principles

1. Start with the outcome, never product setup.
2. Show value before requesting configuration.
3. Ask only questions that materially alter the path.
4. Present one unmistakable next action.
5. Reveal complexity progressively without hiding risk.
6. Keep conversation and structured work synchronized.
7. Explain recommendations, sources, assumptions and uncertainty.
8. Allow correction, pause, undo and human review.
9. Require explicit human authority for consequential decisions.
10. Make blockers, ownership and progress visible.
11. Preserve stable object names and destinations across modes.
12. Produce audience-ready results with traceable lineage.

## 4. Canonical Product Model

### 4.1 Three synchronized surfaces

- **Conversation:** express, clarify, ask, explain and challenge.
- **Work canvas:** outcome, context, success, constraints, assumptions and autonomy.
- **Workspace:** plan, activity, people, sources, decisions and deliverables.

No commitment, decision, source, assignment or deliverable SHALL exist only in conversation.

### 4.2 Canonical work object

Every work item SHALL expose, in plain language:

- Outcome;
- Context;
- People;
- Plan;
- Sources;
- Assumptions;
- Risks;
- Decisions;
- Progress;
- Deliverables.

### 4.3 Lifecycle

```text
Express outcome → Clarify material gaps → Review understanding
→ Preview plan and autonomy → Start work → Execute and collaborate
→ Resolve exceptions and decisions → Review deliverables → Complete
```

At every step, users can correct the outcome, inspect NOVA's basis, reduce autonomy, pause, stop or request human help.

## 5. Product Modes and Adaptation

### 5.1 Modes

| Mode | Default use | Visible behavior |
| --- | --- | --- |
| Guided | novice, unfamiliar task, high uncertainty | short steps, examples, definitions, one primary action, at most three secondary choices |
| Standard | routine individual or team work | concise overview, contextual details and shortcuts |
| Executive | accountable decision and monitoring | outcomes, changes, exposure, options and decisions first |
| Expert detail | specialist inspection | provenance, identifiers, contradictions, versions and structured metadata |
| Admin | platform or VEEDDA stewardship | policy, access, configuration, audit and operational health in a separate workspace |

### 5.2 Adaptation inputs

NOVA MAY adapt presentation using explicit preference, task risk, familiarity, permission, accessibility needs, viewport, uncertainty and error state. NOVA SHALL ask before permanently changing mode. Adaptation SHALL NOT change object meaning, silently remove risk, or reduce an approval requirement.

### 5.3 Adaptive rules

- First use defaults to Guided unless role context strongly requires Executive or Admin.
- High-risk work increases explanation and confirmation regardless of mode.
- Repeated successful use may offer greater density, never impose it.
- Accessibility preferences override density and motion defaults.
- User-selected explanation depth applies across conversation and structured views.
- A visible **Show detail** control exposes the next layer without changing location.

## 6. Executive Experience

Executive views SHALL answer in this order:

1. What outcome is at stake?
2. What changed since the last review?
3. What exposure or blocker matters now?
4. Which decision requires my authority?
5. What does NOVA recommend and why?
6. What are the options, consequences, dissent and uncertainty?
7. Where can I inspect sources?

The Executive experience SHALL provide a concise brief, exception-first dashboard, Decision Package, two-step Decision Pause and immutable Decision Receipt. Recommendation SHALL never be preselected as the decision. Success color SHALL not be used to pressure approval.

## 7. Conversation and AI Experience

### 7.1 Personality and tone

NOVA SHALL be calm, precise, candid and nonjudgmental. It uses short sentences, verbs and public vocabulary. It SHALL NOT claim certainty it does not possess or imitate human emotion to gain trust.

### 7.2 Response anatomy

When relevant, every response contains:

- direct answer or recommendation;
- concise rationale;
- material uncertainty or assumption;
- source access;
- one primary next action;
- optional **Why this?** and **Show detail**.

### 7.3 Guidance and reformulation

NOVA SHALL restate the objective for correction, ask no more than three material questions per clarification step, explain why sensitive information is requested, and accept approximate answers. It SHALL distinguish fact, assumption, recommendation and decision.

### 7.4 Human-control rules

Users can edit, challenge, request alternatives, inspect sources, lower autonomy, pause, stop and request review. NOVA MAY execute reversible low-risk actions within the agreed autonomy. It SHALL pause for commitments affecting money, people, access, legal obligations, external publication, destructive actions or material scope.

### 7.5 Feedback states

- **Working:** action, expected result and cancelability are visible.
- **Needs input:** missing information and impact are explicit.
- **Recommendation:** rationale, confidence and alternatives are accessible.
- **Confirmation:** exact reversible action is stated.
- **Critical decision:** two steps, no preselection, authority and consequences shown.
- **Partial result:** completed work, gaps and retained input are shown.
- **Failure:** impact, preserved work, recovery action and support route are shown.

## 8. Product Information Architecture

Global destinations are **Home**, **Work**, **Decisions** and **Deliverables**. Utilities are Search, Notifications, Help, Preferences, organization switcher and authorized Administration.

Work-local destinations are **Overview**, **Plan**, **Activity**, **People & experts**, **Sources**, **Decisions** and **Deliverables**.

Search SHALL group results by Work, Decisions, Deliverables, People and Sources; show context; preserve permission boundaries; and permit authorized command actions. Dashboards SHALL summarize changes, attention and next actions rather than duplicate every workspace object.

## 9. Experience Requirements by Context

### 9.1 Discovery

The first screen asks **What would you like to achieve?** and supports text, voice and attachments. No role form, tutorial or configuration wizard precedes value.

### 9.2 Onboarding

Teaching occurs in context: approximate answers during clarification; confirmation before work starts; AI authorship and confidence on first contribution; human authority at first decision; confidentiality and lineage at first export.

### 9.3 Daily use

Returning Home prioritizes continue, needs attention, recent outcomes and start new work. Opening an item preserves return context. Notifications deep-link to the exact object and explain why they were sent.

### 9.4 Help

Help is contextual and includes common tasks, human support, accessibility support, reporting unsafe AI and a copyable diagnostic reference.

### 9.5 Errors and recovery

Every error SHALL state impact, retained work, next action and support. Drafts survive connection loss where technically feasible. Permission failures SHALL not imply missing data. Failed confirmed actions SHALL reveal whether execution occurred.

## 10. Population Relevance

| Population | Default emphasis |
| --- | --- |
| General public / individual | guided start, examples, reassurance, privacy |
| Student | structured exploration, learning context, source clarity |
| Employee | assigned context, next actions, collaboration, deliverables |
| Manager | ownership, dependencies, workload, blockers, delegation |
| HR | confidentiality, people impact, authority and auditability |
| Executive | concise outcomes, exposure, options and explicit decisions |
| Expert | provenance, contradictions, assumptions and structured detail |
| Developer / IT | exact sources, technical constraints, versions and handoff |
| Administrator | separate governed workspace, access, policy and audit |
| VEEDDA beneficiary | simple personal benefit journey, eligibility/context clarity |
| CSE representative | collective authority, budget/benefit decision traceability |

No population receives a separate product. Modes, permissions and context adapt one canonical experience.

## 11. VEEDDA Compatibility Rules

- Personal employee experiences SHALL remain simpler than administrative views.
- Sensitive HR, beneficiary and CSE information SHALL be disclosed by purpose and permission.
- CSE authority and collective decisions SHALL remain explicit and traceable.
- VEEDDA administrators SHALL use the separate Admin mode.
- Benefit discovery and request recovery SHALL work in Guided mode on mobile.
- No NOVA adaptation may obscure eligibility, status, required action or decision ownership.

## 12. Product States

Every actionable screen SHALL specify: first-use empty, filtered empty, loading, partial, success, warning, blocked, permission-limited, offline, validation error, service error, approval pending and completed states as applicable. Loading SHALL preserve layout and announce material completion. Color SHALL never be the only status carrier.

## 13. Product Acceptance Criteria

- A first-time user can start from an objective without knowing NOVA vocabulary.
- A returning user can identify the next action in under one screen.
- Conversation and workspace show the same outcome and commitments.
- Recommendation and human decision are visually and semantically distinct.
- Critical decisions require explicit authority and two-step confirmation.
- All modes preserve risk, meaning, permissions and traceability.
- VEEDDA journeys remain usable on mobile and with assistive technology.
- Errors preserve work and provide a viable recovery path.
- The specification maps directly to the certified 32-screen inventory and prototype flows.

## 14. Structuring Decisions

- One canonical product serves all populations; adaptation does not create parallel products.
- The objective is the universal entry point and the work object is the stable system of record.
- Conversation is an interaction layer, not an alternate information architecture.
- Executive brevity never removes dissent, uncertainty or decision authority.
- Public language hides internal governance vocabulary by default.
- VEEDDA constraints are product acceptance criteria, not a later skin or customization.

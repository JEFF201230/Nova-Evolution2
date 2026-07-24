# PROGRAM-018

# Product Studio V1 — User Journeys

## Status

PRODUCT STUDIO V1 — INTEGRATED JOURNEY SPECIFICATION

## 1. Journey System

All journeys use the same loop:

```text
Discover → Express objective → Clarify → Review understanding
→ Start controlled work → Act or collaborate → Decide → Produce result
→ Monitor → Recover or complete
```

Required cross-journey controls are: edit objective, ask why, show sources, request alternative, change explanation depth, pause, stop, undo reversible actions and request human help.

## 2. Population Journey Matrix

| Population | Discovery | Onboarding | Daily use | AI | Help | Error | Recovery |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Individual | outcome examples | guided, no setup | next personal action | plain explanations | contextual + human | calm, no jargon | preserved draft and resume |
| Student | question or project examples | source and scope coaching | milestones and synthesis | learning-oriented, cited | examples and accessibility | explain correction | revise question or source |
| Employee | invitation or own objective | role and expected contribution | assignments and team context | bounded assistance | work-specific | show owner/impact | retry, delegate or escalate |
| Manager | work health or creation | team, authority and success | blockers, workload, decisions | exception summaries | resolution patterns | affected dependencies | stabilization plan |
| HR | people objective | privacy and authority | confidential work and approvals | no hidden people inference | policy/human support | access-safe language | authorized correction path |
| Executive | outcome or attention brief | concise authority explanation | changes, exposure and decisions | recommendation with dissent | executive support | consequence first | defer, delegate or request analysis |
| Expert | specialist request | contribution scope and provenance | sources, claims and challenges | inspectable assumptions | technical detail | exact failure context | replace source/re-run/challenge |
| Developer | technical objective | constraints and repository context | implementation readiness | exact proposed change | technical diagnostic | preserve commands/input | retry or alternative approach |
| Administrator | explicit Admin entry | policy and audit boundaries | access/configuration/health | guarded admin assistance | operational support | no data leakage | rollback or governed repair |
| VEEDDA user | benefit or personal objective | mobile guided context | request/status/action | reassuring, not overreaching | benefit support | eligibility/status clarity | resume request or contact support |
| CSE representative | collective objective | mandate, budget and authority | proposals, decisions, beneficiaries | compare options transparently | governance support | show collective impact | revise, defer or record decision |

Accessibility needs overlay every row and never define a separate persona.

## 3. J-01 — Create Work from Scratch

**Populations:** individual, student, entrepreneur, employee, manager.

**Trigger:** an idea or desired result exists without a plan.

**Flow:**

1. Home asks **What would you like to achieve?**
2. User describes the outcome and may attach context.
3. NOVA reformulates and asks up to three material questions.
4. User reviews outcome, audience, constraints, success and assumptions.
5. NOVA previews phases, people, decisions, deliverables and autonomy.
6. User edits or starts work.
7. Workspace opens with one next action.
8. User monitors, collaborates and reviews deliverables.

**Decision points:** shared understanding; autonomy; work start; consequential commitments.

**Recovery:** save incomplete objective; return to last answered question; allow correction without restarting.

**Success:** user can state the outcome, next action and NOVA's permitted autonomy.

## 4. J-02 — Recover Work in Difficulty

**Populations:** employee, manager, executive, expert, CSE representative.

1. User chooses **Fix or recover work** and describes symptoms.
2. NOVA requests available files, current status and responsible people.
3. Intake separates facts, reports and missing information.
4. Diagnosis shows health, confidence, contradictions and immediate exposure.
5. NOVA proposes Stabilize, Diagnose and Recover phases.
6. Scope, budget or authority changes enter Decision Pause.
7. Recovery workspace prioritizes blockers, owners and next 72-hour actions.

**Error:** unavailable sources remain visible as gaps, never inferred as fact.

**Recovery:** user can replace a source, correct a claim, assign an owner or request another diagnosis.

**Success:** accountable user understands causes, immediate actions and decision needs.

## 5. J-03 — Analyze or Research

**Populations:** student, expert, HR, executive, CSE representative, developer.

1. User states the question, audience and intended use.
2. NOVA confirms scope, depth, deadline and acceptable sources.
3. Workspace lists questions, sources, claims, assumptions and gaps.
4. Human and AI experts contribute with identity, confidence and sources.
5. Contradictions remain visible until resolved or declared.
6. User reviews synthesis, limitations and citations.
7. Result becomes a report, presentation or decision input.

**Decision points:** scope; source eligibility; interpretation acceptance; publication.

**Recovery:** narrow or broaden scope, remove a weak source, request dissent, rerun synthesis.

**Success:** user distinguishes supported findings, assumptions and unresolved contradictions.

## 6. J-04 — Prepare a Strategic Decision

**Populations:** manager, HR, executive, CSE representative, administrator.

1. User defines the decision, authority and deadline.
2. NOVA separates the decision from any preferred solution.
3. Package shows context, options, criteria, consequences, risks, dissent and sources.
4. User requests alternatives or challenges assumptions.
5. Authorized person enters two-step Decision Pause.
6. They Approve, Request changes, Reject or Defer; no option is preselected.
7. Decision Receipt records authority, rationale, scope and resulting actions.

**Critical error:** loss of session before confirmation returns to Review, never records approval.

**Recovery:** defer, delegate where policy permits, request analysis or amend the package.

**Success:** recommendation and human decision remain unmistakably different.

## 7. J-05 — Produce a Professional Deliverable

**Populations:** all content-producing populations.

1. User chooses Document, Presentation, Dashboard or Executive summary.
2. User defines audience, purpose, language, confidentiality and deadline.
3. Outline shows hierarchy and source coverage.
4. User edits structure and generates a draft.
5. Review identifies assumptions, missing sources and unresolved decisions.
6. Authorized user approves and exports or shares.
7. Output retains version, owner and optional lineage appendix.

**Recovery:** failed export retains settings and approved content; user retries or chooses another format.

**Success:** recipient-ready output matches audience and exposes material limitations.

## 8. J-06 — Monitor and Unblock Execution

**Populations:** employee, manager, executive, administrator.

1. Home summarizes changes, attention and next actions.
2. User filters Mine, Team, Risk or Deadline.
3. Work detail explains blocker impact, owner, age and proposed resolution.
4. User resolves, delegates or requests a decision.
5. Progress updates show criteria, not decorative percentages.

**Recovery:** stale or partial data is labeled with last update time and refresh path.

**Success:** user intervenes on the correct exception without reading the full history.

## 9. J-07 — Collaborate with Human and AI Experts

**Populations:** employee, manager, expert, developer, executive.

1. User opens **People & experts**.
2. Human, AI and unavailable expertise are explicitly distinguished.
3. User sees role, access, expected contribution and effort/cost where relevant.
4. User requests a bounded contribution with due date and source scope.
5. Contribution records author, time, confidence and sources.
6. User accepts, edits, challenges or rejects it.

Acceptance SHALL NOT equal critical approval.

**Recovery:** unavailable expert suggests alternative expertise; failed AI work preserves prompt and inputs.

## 10. J-08 — VEEDDA Benefit Journey

**Population:** VEEDDA user / beneficiary.

1. Mobile-first entry asks what benefit or result the person seeks.
2. NOVA explains required context and privacy purpose in plain language.
3. User views relevant option, conditions, expected steps and documents.
4. User begins or resumes a request.
5. Status shows completed, needed, waiting and contact route.
6. A decision or missing document explains who acts next and why.
7. Completion presents result and retained record.

**Veto conditions:** hidden eligibility rule, ambiguous status, forced expert vocabulary, inaccessible mobile action, or exposure of another beneficiary's data.

**Recovery:** resume saved request, replace document, correct information or contact human support.

## 11. J-09 — CSE Collective Decision

**Population:** CSE representative; supporting manager, finance or HR expert.

1. Representative states collective objective and mandate.
2. NOVA captures beneficiaries, budget, constraints and decision authority.
3. Options show population impact, cost, risk, dissent and sources.
4. Authorized contributors review within permission boundaries.
5. Collective authority performs Decision Pause.
6. Receipt records rationale, mandate and actions without exposing restricted personal data.

**Recovery:** request clarification, defer vote, revise option, record abstention/dissent where applicable.

## 12. J-10 — Administration and Operational Recovery

**Populations:** VEEDDA administrator, NOVA administrator, IT/developer.

1. Authorized user deliberately enters Administration.
2. Overview shows access, configuration, audit and operational health.
3. User selects a bounded object and sees impact preview.
4. Low-risk reversible changes may be confirmed once; consequential changes require critical confirmation.
5. Receipt records who, what, when, scope and outcome.

**Error:** partial bulk action lists succeeded, failed and untouched items.

**Recovery:** retry failed items, rollback where supported, export audit reference or request operational support.

## 13. Shared Task Flows

### 13.1 First-use onboarding

```text
Welcome → Objective input → Material clarification → Shared understanding
→ Plan preview → Autonomy choice → Start → Contextual tip → Workspace
```

### 13.2 Returning daily use

```text
Home → Needs attention or Continue → Exact object → Next action
→ Confirmation/result → Return context preserved
```

### 13.3 AI challenge

```text
AI contribution → Why this? → Sources/assumptions → Request alternative
→ Compare → Accept/Edit/Reject → Structured object updated
```

### 13.4 Help

```text
Help → Contextual answer → Suggested action
→ Human/accessibility support if unresolved → Return to preserved context
```

### 13.5 Error recovery

```text
Failure → Impact + retained work → Retry/alternative/support
→ Validate actual action state → Resume at prior context
```

## 14. Decision Flow Rules

- Routine reversible action: clear action label, undo where possible.
- Material but reversible action: impact preview and explicit confirmation.
- Critical action: Review then Decide; identity, scope, consequences, reversibility and uncertainty visible; no preselection.
- Insufficient authority: explain required authority and permit request/delegation where policy allows.
- Interrupted critical flow: return to Review and require a fresh decision.

## 15. Journey State Requirements

Every journey SHALL define empty, loading, partial, validation error, permission denied, offline, service failure, waiting, approval and completion behavior. User input and return context SHALL be preserved whenever technically feasible. Screen-reader announcements SHALL communicate asynchronous completion and errors without moving focus unexpectedly.

## 16. Journey Acceptance Tests

- Representative first-time users begin without a glossary or product tour.
- Each population can identify its immediate action and authority.
- At least one accessible keyboard path exists through every certified flow.
- Users can recover from a seeded connection or validation error without re-entry.
- AI outputs expose authorship, confidence and sources when material.
- VEEDDA beneficiary and CSE journeys preserve privacy, authority and mobile usability.
- Executive users can reach a defensible decision without losing dissent or source access.
- Expert detail adds depth without changing the canonical meaning of work.

## 17. Structuring Decisions

- Population differences are handled through context, permission, density and guidance, not separate navigation models.
- Discovery, onboarding, daily use, AI, help, error and recovery are mandatory phases of every population experience.
- VEEDDA includes two distinct journeys: personal benefit and collective CSE decision.
- Administration is deliberately separated from personal and operational work.
- Recovery is a first-class continuation path, not an error-page afterthought.

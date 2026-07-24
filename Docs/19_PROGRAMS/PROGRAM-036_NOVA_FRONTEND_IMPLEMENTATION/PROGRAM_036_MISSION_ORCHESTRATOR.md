# 1. Document Control

| Field | Value |
|---|---|
| Document ID | `PROGRAM_036_MISSION_ORCHESTRATOR` |
| Program | `PROGRAM-036 — NOVA Frontend Implementation` |
| Document type | Program orchestration |
| Scope | Official execution orchestrator for PROGRAM-036 |
| Status | Final |
| Repository | `C:\DEV\nova-orchestrator` |

# 2. Orchestrator Identity

The Mission Orchestrator is the official control document for the execution of PROGRAM-036. It does not develop frontend code. It does not change architecture. It coordinates lot execution, gate checks, dependencies, rollback, and traceability.

It is the single orchestration entry point for PROGRAM-036 execution.

# 3. Sources Used

- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MASTER_EXECUTION_PLAN.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-MO-000_PROGRAM_READINESS.md`
- `Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-DR-001_FRONTEND_FOUNDATION_BASELINE.md`
- `Docs/10_NOVA/01_IMPLEMENTATION/NOVA_FRONTEND_IMPLEMENTATION_BIBLE.md`
- `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK.md`
- `Docs/10_NOVA/02_DEVELOPMENT/NOVA_FRONTEND_DEVELOPMENT_PLAYBOOK_CERTIFICATION.md`
- `Docs/10_NOVA/00_UX_AUDIT/NOVA_UX_AUDIT_REPORT.md`
- `Docs/24_MODULES/0-UI-DESIGN/SOURCE/FIGMA_IMPLEMENTATION_MASTER_REFERENCE.md`

# 4. Orchestration Scope

The orchestrator knows and governs:

- 22 lots;
- 22 planned Mission Orders;
- 13 referenced gates;
- 10 increments;
- dependency order;
- rollback order;
- resume rules;
- traceability requirements;
- lot state transitions;
- dashboard reporting.

The orchestrator does not:

- write code;
- modify the frontend;
- change lot perimeter;
- invent missing sources;
- bypass a gate;
- create a Mission Order outside the approved master plan;
- modify the reference documents.

# 5. Program and Lot Map

| LOT | Title | Initial state | Mission Orders | Entry gate | Exit gate | Notes |
|---|---|---|---|---|---|---|
| LOT 000 | Program Readiness | NOT_STARTED | MO-001 | GATE-SOURCE-CONSISTENCY | GATE-PROGRAM-READINESS | readiness baseline |
| LOT 001 | Frontend Foundation | NOT_STARTED | MO-002 | GATE-PROGRAM-READINESS | GATE-FOUNDATION-CERTIFIED | shell / routing / CSS / tests baseline |
| LOT 002 | Shared UI Foundations | NOT_STARTED | MO-003 | GATE-FOUNDATION-CERTIFIED | GATE-SHARED-COMPONENTS-CERTIFIED | shared primitives |
| LOT 003 | NOVA Navigation and Global Shell | NOT_STARTED | MO-004 | GATE-SHARED-COMPONENTS-CERTIFIED | GATE-SCREEN-CERTIFIED | global shell |
| LOT 004 | Home | NOT_STARTED | MO-005 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | primary entry |
| LOT 005 | Work Overview | NOT_STARTED | MO-006 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | summary action |
| LOT 006 | Work Plan | NOT_STARTED | MO-007 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | phase structure |
| LOT 007 | Work Activity | NOT_STARTED | MO-008 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | timeline and filters |
| LOT 008 | People and Experts | NOT_STARTED | MO-009 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | people list and drawer |
| LOT 009 | Sources and Evidence | NOT_STARTED | MO-010 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | sources and drawer |
| LOT 010 | Decisions | NOT_STARTED | MO-011 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | decision list |
| LOT 011 | Review and Decide | NOT_STARTED | MO-012 | GATE-SCREEN-CERTIFIED | GATE-INTEGRATION-CERTIFIED | workflow and receipt |
| LOT 012 | Deliverables | NOT_STARTED | MO-013 | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | deliverables screen |
| LOT 013 | Cross-Module Navigation | NOT_STARTED | MO-014 | GATE-SCREEN-CERTIFIED | GATE-INTEGRATION-CERTIFIED | route/context restore |
| LOT 014 | Responsive and Adaptive Layout | NOT_STARTED | MO-015 | GATE-FOUNDATION-CERTIFIED | GATE-RESPONSIVE-CERTIFIED | documented responsive behavior |
| LOT 015 | Accessibility Certification | NOT_STARTED | MO-016 | GATE-SHARED-COMPONENTS-CERTIFIED | GATE-ACCESSIBILITY-CERTIFIED | keyboard/focus/ARIA |
| LOT 016 | Frontend Security and Integrity | NOT_STARTED | MO-017 | GATE-FOUNDATION-CERTIFIED | GATE-SECURITY-CERTIFIED | safe rendering and integrity |
| LOT 017 | Performance and Reliability | NOT_STARTED | MO-018 | GATE-FOUNDATION-CERTIFIED | GATE-PERFORMANCE-CERTIFIED | loading and recovery |
| LOT 018 | Integrated QA | NOT_STARTED | MO-019 | GATE-FOUNDATION-CERTIFIED | GATE-INTEGRATION-CERTIFIED | combined quality |
| LOT 019 | Pixel-Perfect Certification | NOT_STARTED | MO-020 | GATE-SCREEN-CERTIFIED | GATE-PIXEL-PERFECT-CERTIFIED | visual certification |
| LOT 020 | Release Candidate | NOT_STARTED | MO-021 | GATE-INTEGRATION-CERTIFIED | GATE-RELEASE-CANDIDATE | release evidence |
| LOT 021 | MVP Certification | NOT_STARTED | MO-022 | GATE-RELEASE-CANDIDATE | GATE-MVP-CERTIFIED | final certification |

# 6. Mission Order Registry

Mission Orders are fixed by the Master Execution Plan and cannot be invented locally.

| MO | LOT | Increment | Objective | Sources | Dependencies | Success criteria |
|---|---|---|---|---|---|---|
| MO-001 | LOT 000 | Increment 1 | establish readiness evidence and open dependencies | architecture, readiness, UX, Figma, NFIB, Playbook | source consistency and repository baseline | readiness report accepted |
| MO-002 | LOT 001 | Increment 1 | create foundation package boundary and executable shell | architecture, readiness, ADR, NFIB, Playbook, certification | LOT 000 pass, foundation decision | shell mounts and baseline config exists |
| MO-003 | LOT 002 | Increment 2 | build shared UI primitives and interaction states | Figma, NFIB, Playbook, UX | LOT 001 certified | shared primitives certified |
| MO-004 | LOT 003 | Increment 2 | implement navigation shell and context return | UX, Figma, NFIB | LOT 002 certified | shell navigation stable |
| MO-005 | LOT 004 | Increment 3 | implement Home with states | UX, Figma, NFIB | LOT 003 certified | Home certified |
| MO-006 | LOT 005 | Increment 3 | implement Work Overview | UX, Figma, NFIB | LOT 004 / shell behavior | Work Overview certified |
| MO-007 | LOT 006 | Increment 4 | implement Work Plan | UX, Figma, NFIB | Work overview available | Work Plan certified |
| MO-008 | LOT 007 | Increment 4 | implement Work Activity | UX, Figma, NFIB | Work overview available | Work Activity certified |
| MO-009 | LOT 008 | Increment 5 | implement People list and drawer | UX, Figma, NFIB | drawer contract stable | People certified |
| MO-010 | LOT 009 | Increment 5 | implement Sources and Evidence | UX, Figma, NFIB | drawer contract stable | Sources certified |
| MO-011 | LOT 010 | Increment 6 | implement Decisions list | UX, Figma, NFIB | Work shell and decision data | Decisions certified |
| MO-012 | LOT 011 | Increment 6 | implement Review / Decide / Receipt | UX, Figma, NFIB | decision list certified | workflow certified |
| MO-013 | LOT 012 | Increment 7 | implement Deliverables | UX, Figma, NFIB | decision model completed | Deliverables certified |
| MO-014 | LOT 013 | Increment 7 | implement cross-module navigation | UX, Figma, NFIB | target routes exist | context restoration proven |
| MO-015 | LOT 014 | Increment 8 | implement responsive behavior | UX, Figma, NFIB | foundation and surfaces exist | responsive evidence accepted |
| MO-016 | LOT 015 | Increment 8 | execute accessibility certification | UX, Figma, NFIB | interactive surfaces exist | accessibility pass |
| MO-017 | LOT 016 | Increment 9 | implement security and integrity controls | UX, Figma, NFIB | mutation surfaces exist | security pass |
| MO-018 | LOT 017 | Increment 9 | implement performance and reliability controls | NFIB, Figma, UX | stable shell and surfaces | performance pass |
| MO-019 | LOT 018 | Increment 9 | execute integrated QA | NFIB, Playbook, architecture | implementation lots present | integrated QA pass |
| MO-020 | LOT 019 | Increment 10 | execute pixel-perfect certification | Figma, UX, NFIB | target surfaces and capture method | pixel-perfect pass |
| MO-021 | LOT 020 | Increment 10 | assemble release candidate | architecture, NFIB, Playbook, QA evidence | integration and pixel-perfect pass | release candidate approved |
| MO-022 | LOT 021 | Increment 10 | execute MVP certification | all official sources and final evidence | release candidate approved | MVP certificate issued |

# 7. Execution Rules

The orchestrator executes in this order:

1. verify dependencies;
2. verify gates;
3. identify the next executable Mission Order;
4. prepare the Mission Order;
5. wait for human GO where required;
6. record the result;
7. update the lot state;
8. calculate the next Mission Order.

Execution rules:

- no lot starts before its entry gate is satisfied;
- no Mission Order starts if a blocking dependency is unresolved;
- no gate is bypassed by local preference;
- no rollback is hidden;
- no result is recorded without evidence;
- no Mission Order exists outside the master execution plan.

# 8. Lot Control Rules

Each lot is controlled through the following lifecycle facts:

- initial state;
- Mission Orders associated;
- prerequisites;
- gate in;
- gate out;
- PASS criteria;
- FAIL criteria;
- conditions of reprise;
- conditions of stop.

## LOT lifecycle details

| LOT | Prerequisites | Gate in | Gate out | PASS | FAIL | Reprise | Stop |
|---|---|---|---|---|---|---|---|
| LOT 000 | sources available and readable | GATE-SOURCE-CONSISTENCY | GATE-PROGRAM-READINESS | sources, conflicts, baseline explicit | missing source / ambiguous ID / hidden conflict | reopen after source inventory correction | blocked until baseline exists |
| LOT 001 | LOT 000 pass, foundation decision | GATE-PROGRAM-READINESS | GATE-FOUNDATION-CERTIFIED | shell mounts, route baseline works, configs exist | stack/directory/config absent or unstable | rerun after fixing baseline | stop on unresolved stack or directory gap |
| LOT 002 | LOT 001 certified | GATE-FOUNDATION-CERTIFIED | GATE-SHARED-COMPONENTS-CERTIFIED | primitives accessible and reusable | component drift, inaccessible behavior | correct shared primitives and retest | stop until primitives are certified |
| LOT 003 | LOT 002 certified | GATE-SHARED-COMPONENTS-CERTIFIED | GATE-SCREEN-CERTIFIED | navigation stable and reversible | context loss, breadcrumb mismatch | correct shell and retest | stop if navigation breaks |
| LOT 004 | LOT 003 certified | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | Home clear, one primary action, states covered | dashboard creep, placeholder action | fix Home and retest | stop if priority cannot be shown |
| LOT 005 | LOT 004 certified | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | Work Overview reflects hierarchy | duplicate information / overload | simplify Overview and retest | stop if summary cannot be made clear |
| LOT 006 | Work Overview available | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | phase order and blockers readable | hidden dependency / block ambiguity | correct plan states and retest | stop if phase model undefined |
| LOT 007 | Work Overview available | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | timeline and filters usable | confidence misread / overload | refine activity presentation | stop if event taxonomy inconsistent |
| LOT 008 | drawer contract stable | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | list and drawer preserve context | drawer overload / duplicate info | correct drawer behavior and retest | stop if person detail cannot be shown on demand |
| LOT 009 | drawer contract stable | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | source states and evidence links visible | stale/missing state unclear | correct source statuses | stop if evidence cannot be linked |
| LOT 010 | Work shell and decision data | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | decision list explicit | score overload / hidden rationale | correct decision list | stop if decision taxonomy missing |
| LOT 011 | decision list certified | GATE-SCREEN-CERTIFIED | GATE-INTEGRATION-CERTIFIED | review/decide/receipt works and prevents double submit | fake success, missing receipt, no confirmation | correct workflow and retest | stop if irreversible action cannot be proven |
| LOT 012 | decision model completed | GATE-SCREEN-CERTIFIED | GATE-SCREEN-CERTIFIED | deliverables readiness and history visible | cluttered metadata / overstated readiness | refine deliverable layout | stop if readiness cannot be assessed |
| LOT 013 | target routes exist | GATE-SCREEN-CERTIFIED | GATE-INTEGRATION-CERTIFIED | cross-navigation restores context | route drift / lost state | fix route restoration | stop if context cannot be restored |
| LOT 014 | foundation and surfaces exist | GATE-FOUNDATION-CERTIFIED | GATE-RESPONSIVE-CERTIFIED | documented viewport behavior stable | invented breakpoint / overflow | correct layout rules | stop if responsive baseline not documentable |
| LOT 015 | interactive surfaces exist | GATE-SHARED-COMPONENTS-CERTIFIED | GATE-ACCESSIBILITY-CERTIFIED | keyboard/focus/ARIA/contrast pass | focus trap failure / contrast failure | correct a11y defects and retest | stop if critical paths are inaccessible |
| LOT 016 | mutation surfaces exist | GATE-FOUNDATION-CERTIFIED | GATE-SECURITY-CERTIFIED | safe render, input, URL, log hygiene | unsafe render / fake permission | correct security control and retest | stop if integrity is compromised |
| LOT 017 | stable shell and surfaces | GATE-FOUNDATION-CERTIFIED | GATE-PERFORMANCE-CERTIFIED | stable load and recovery | jank / load instability | correct perf issue and retest | stop if reliability is insufficient |
| LOT 018 | implementation lots present | GATE-FOUNDATION-CERTIFIED | GATE-INTEGRATION-CERTIFIED | integrated QA passes | cross-lot regression | repair impacted lot and retest | stop if cross-lot behavior fails |
| LOT 019 | target surfaces and capture method | GATE-SCREEN-CERTIFIED | GATE-PIXEL-PERFECT-CERTIFIED | diffs accepted or corrected | unresolved visual drift | correct surface and recapture | stop if baseline cannot be matched |
| LOT 020 | integration and visual certification complete | GATE-INTEGRATION-CERTIFIED | GATE-RELEASE-CANDIDATE | release candidate approved | missing evidence or unresolved blocker | close gaps and reissue | stop if release evidence incomplete |
| LOT 021 | release candidate accepted | GATE-RELEASE-CANDIDATE | GATE-MVP-CERTIFIED | final MVP approved | critical unresolved issue | remediate and resubmit | stop until board approval |

# 9. State Machine

## States allowed

- NOT_STARTED
- READY
- IN_PROGRESS
- WAITING_REVIEW
- WAITING_GATE
- PASSED
- FAILED
- BLOCKED
- ROLLED_BACK
- CANCELLED
- COMPLETED

## Transition rules

| From | To | Allowed when |
|---|---|---|
| NOT_STARTED | READY | prerequisites are available and the next Mission Order is prepared |
| READY | IN_PROGRESS | human GO is granted when required and work begins |
| IN_PROGRESS | WAITING_REVIEW | execution ends and a review is required |
| IN_PROGRESS | WAITING_GATE | execution is complete and gate verification is pending |
| WAITING_REVIEW | PASSED | review evidence is accepted |
| WAITING_REVIEW | FAILED | review rejects the lot evidence |
| WAITING_GATE | PASSED | gate criteria are satisfied |
| WAITING_GATE | FAILED | gate criteria fail |
| PASSED | COMPLETED | exit gate passed and no blocking remainder exists |
| FAILED | READY | corrective action is approved and the lot is re-prepared |
| FAILED | BLOCKED | unresolved dependency prevents continuation |
| BLOCKED | READY | dependency or source issue is resolved |
| IN_PROGRESS | ROLLED_BACK | rollback is required to preserve prior certified baseline |
| WAITING_GATE | ROLLED_BACK | gate failure requires rollback before reprising |
| ROLLED_BACK | READY | rollback evidence is recorded and a reprise is allowed |
| ANY NON-CANCELLED | CANCELLED | Program Board or authority explicitly cancels the lot |

Rules:

- only a human authority can move a lot from READY to IN_PROGRESS when a GO is required;
- PASSED is evidence that the lot succeeded at the current checkpoint, not that the whole program is complete;
- COMPLETED is reserved for a lot whose exit gate has been accepted and whose evidence is stored;
- CANCELLED is terminal unless reissued by a new decision record;
- BLOCKED is not failure; it is a dependency stop.

# 10. Dashboard

The orchestrator dashboard is the status summary used by governance and execution review.

## Indicators

- PROGRAM progress
- LOT progress
- MO progress
- Gates open
- Gates closed
- Risks
- Blockers
- Rollbacks
- Pending decisions
- Certification status

## Dashboard model

| Indicator | Meaning |
|---|---|
| PROGRAM progress | percentage of completed lots across PROGRAM-036 |
| LOT progress | current state of the active lot |
| MO progress | current Mission Order state within the active lot |
| Gates open | gates not yet satisfied |
| Gates closed | gates passed for the active milestone |
| Risks | unresolved delivery risks requiring attention |
| Blockers | conditions that stop the next action |
| Rollbacks | executed reversions recorded for traceability |
| Pending decisions | human GO / NO GO or authority decision still required |
| Certification status | current certification outcome for the active scope |

The dashboard is read-only. It reports. It does not decide.

# 11. Traceability Model

Each Mission Order must record:

- Mission ID;
- LOT;
- Increment;
- Documents sources;
- Date;
- Author;
- Result;
- Files modified;
- Tests executed;
- Evidence;
- Gate.

## Traceability record template

| Field | Value |
|---|---|
| Mission ID | unique Mission Order identifier |
| LOT | target lot |
| Increment | increment number |
| Documents sources | explicit list of source documents used |
| Date | execution date |
| Author | executor or authority |
| Result | PASS / FAIL / BLOCKED / ROLLED BACK / CANCELLED |
| Files modified | exact files touched |
| Tests executed | tests actually run |
| Evidence | links or references to proof |
| Gate | gate associated with the result |

# 12. Dependency, Reprise, and Rollback Rules

## Dependency rules

- dependencies are verified before any lot starts;
- if a dependency is missing, the lot remains NOT_STARTED, READY, or BLOCKED;
- a dependency unresolved by source cannot be guessed;
- dependent lots do not bypass prerequisite lots.

## Reprise rules

- after FAILED, the lot returns to READY only when the corrective action is approved;
- after BLOCKED, the lot returns to READY only when the dependency or source issue is resolved;
- after ROLLED_BACK, the lot may re-enter READY only with explicit evidence that the rollback restored the previous baseline;
- reprise requires a fresh execution record.

## Rollback rules

- rollback is lot-scoped by default;
- rollback must preserve evidence and the reason for reversion;
- rollback must restore the last certified baseline;
- rollback must not erase the existence of the failed run;
- a rolled-back lot may be reprised only after validation of the restored baseline.

# 13. Orchestration Decision Rules

The orchestrator decision logic is:

1. confirm source availability;
2. confirm current lot state;
3. confirm dependencies;
4. confirm gate status;
5. choose the next MO;
6. request GO when human approval is required;
7. record outcome and evidence;
8. move to the next lot only when the exit gate has passed.

Decision policy:

- the next executable Mission Order is always the lowest-numbered uncompleted MO whose prerequisites are satisfied;
- parallel lots may be prepared only when the master plan authorizes them;
- conflicting lots are never run in parallel if they mutate the same foundation or shared contract;
- gate failure blocks downstream dependent lots.

# 14. Final Decision

Decision: READY FOR ORCHESTRATION

Reason:

- the 22 lots are enumerated and bounded;
- the 22 Mission Orders are enumerated and traceable;
- the 13 gates are known and mapped;
- the state machine is explicit;
- the dashboard and rollback/reprise rules are explicit;
- the orchestrator does not introduce new architecture or code.


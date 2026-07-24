# Mission And Workflow State Model Specification

Program ID: PROGRAM-002

Workstream ID: WS-002

Mission ID: WS-002-SPECIFICATION-BATCH-001

Document Type: ENGINEERING SPECIFICATION

Specification Status: CERTIFICATION CANDIDATE

Date: 2026-07-03

---

## 1. Purpose And Authority

This specification defines the Operating System mission and workflow state model for NOVA.

It provides development-ready state semantics, transition constraints, evidence expectations, and certification checks without defining implementation, APIs, storage, code, classes, or technology.

This state model binds to NOVA_EXECUTION_MODEL.md and the WS-001 conceptual foundation without modifying either.

---

## 2. Scope

This specification covers:

- mission state definitions;
- workflow state definitions;
- valid mission state transitions;
- valid workflow state transitions;
- required evidence per state;
- stop states;
- terminal states;
- state ownership and boundary rules;
- relationship between mission states and workflow states.

This specification does not define:

- implementation state machines;
- API endpoints;
- database schemas;
- UI state;
- event bus technology;
- storage persistence;
- Kernel lifecycle primitives;
- Product workflow states.

---

## 3. State Model Principles

The mission and workflow state model follows these principles:

1. A Mission Order authorizes mission execution.
2. A mission cannot be active without explicit authority.
3. State changes must be traceable.
4. State changes must have evidence.
5. Stop states must preserve the reason for stopping.
6. Decision states must not hide unresolved authority matters.
7. Mission state and workflow state are related but not identical.
8. Workflow completion does not automatically certify mission completion.
9. Certification requires evidence.
10. Terminal states must not be reversed without a new Mission Order or explicit authority.

---

## 4. Mission State Set

The official WS-002 mission state set is:

| State | Type | Meaning |
| --- | --- | --- |
| ORDERED | Active-preparation | A Mission Order exists and authorizes bounded work. |
| READY | Active-preparation | References, scope, deliverables, constraints, and stop conditions are verified. |
| IN_EXECUTION | Active | The Squad is executing authorized work. |
| WAITING_ON_DECISION | Suspended | Execution requires an architecture or Executive decision. |
| BLOCKED | Suspended | Execution cannot continue because a stop condition is met. |
| CONSOLIDATING | Active | Authorized deliverables are being assembled from contributions. |
| IN_REVIEW | Active-validation | Deliverables are under internal review. |
| IN_CERTIFICATION | Active-validation | Deliverables are under certification review. |
| COMPLETED | Terminal-success | Mission deliverables and required reports are complete and accepted under the Mission Order. |
| COMPLETED_WITH_RECOMMENDATIONS | Terminal-success | Mission deliverables are accepted with non-blocking recommendations. |
| STOPPED | Terminal-stop | Mission stopped under stop conditions and produced the required blocking or decision evidence. |
| CANCELLED | Terminal-authority | Mission was cancelled by competent authority before completion. |

Notes:

- ORDERED is the first valid mission state after a Mission Order exists.
- COMPLETED, COMPLETED_WITH_RECOMMENDATIONS, STOPPED, and CANCELLED are terminal states.
- WAITING_ON_DECISION and BLOCKED are non-terminal unless the Mission Order requires terminal stop.

---

## 5. Mission State Definitions

### ORDERED

Entry condition:

- A valid Mission Order exists.

Required evidence:

- Mission ID;
- Mission Type;
- Mission Owner;
- references;
- expected deliverables;
- constraints;
- stop conditions.

Exit condition:

- Reference and scope verification is complete, or a stop condition is detected.

### READY

Entry condition:

- The Mission Order has been verified against required references and target paths.

Required evidence:

- dependency presence check;
- deliverable path check;
- scope and forbidden action check.

Exit condition:

- Squad execution starts, or blocking condition is identified.

### IN_EXECUTION

Entry condition:

- Squad execution begins under Mission Order authority.

Required evidence:

- assignment of responsibilities;
- workflow plan;
- active scope confirmation.

Exit condition:

- execution requires decision;
- execution is blocked;
- deliverables are ready for consolidation.

### WAITING_ON_DECISION

Entry condition:

- execution identifies a matter beyond delegated authority.

Required evidence:

- decision issue;
- affected scope;
- options or impact;
- authority required;
- Decision Report requirement.

Exit condition:

- decision is received;
- mission is stopped;
- mission is cancelled.

### BLOCKED

Entry condition:

- a stop condition prevents continuation.

Required evidence:

- stop condition;
- affected deliverables;
- references checked;
- reason no safe continuation exists.

Exit condition:

- blocker is resolved by authority;
- blocking report is produced and mission becomes STOPPED.

### CONSOLIDATING

Entry condition:

- authorized contributions or deliverables are ready for assembly.

Required evidence:

- contribution list;
- source references;
- conflict checks;
- consolidation owner.

Exit condition:

- deliverables move to review, or consolidation issue requires decision.

### IN_REVIEW

Entry condition:

- consolidated deliverables are ready for internal review.

Required evidence:

- review checklist;
- findings;
- corrections or decisions needed.

Exit condition:

- deliverables pass review;
- deliverables require rework;
- review detects blocking contradiction.

### IN_CERTIFICATION

Entry condition:

- reviewed deliverables are ready for certification.

Required evidence:

- certification checklist;
- hashes;
- scope verification;
- boundary verification;
- traceability verification.

Exit condition:

- mission becomes COMPLETED, COMPLETED_WITH_RECOMMENDATIONS, or STOPPED.

---

## 6. Valid Mission State Transitions

| From | To | Required Condition |
| --- | --- | --- |
| ORDERED | READY | References, target paths, scope, and stop conditions are verified. |
| ORDERED | BLOCKED | A canonical dependency is missing or a target conflict prevents safe continuation. |
| READY | IN_EXECUTION | The Squad starts authorized work. |
| READY | BLOCKED | A stop condition is detected before execution. |
| IN_EXECUTION | WAITING_ON_DECISION | Architecture, Executive, doctrine, boundary, or authority issue is detected. |
| IN_EXECUTION | BLOCKED | Stop condition prevents continuation. |
| IN_EXECUTION | CONSOLIDATING | Authorized deliverables are ready for assembly. |
| WAITING_ON_DECISION | IN_EXECUTION | Required decision resolves the issue and authorizes continuation. |
| WAITING_ON_DECISION | STOPPED | Decision cannot be obtained or Mission Order requires stop. |
| WAITING_ON_DECISION | CANCELLED | Competent authority cancels the mission. |
| BLOCKED | READY | Blocker is resolved before execution and authority permits continuation. |
| BLOCKED | STOPPED | Blocking report or required stop evidence is complete. |
| CONSOLIDATING | IN_REVIEW | Deliverables are assembled and ready for review. |
| CONSOLIDATING | WAITING_ON_DECISION | Contributions conflict beyond delegated authority. |
| IN_REVIEW | CONSOLIDATING | Review requires consolidation corrections. |
| IN_REVIEW | IN_CERTIFICATION | Review passes. |
| IN_REVIEW | WAITING_ON_DECISION | Review identifies authority issue. |
| IN_CERTIFICATION | COMPLETED | Certification passes without blocking recommendation. |
| IN_CERTIFICATION | COMPLETED_WITH_RECOMMENDATIONS | Certification passes with non-blocking recommendations. |
| IN_CERTIFICATION | STOPPED | Certification detects blocking non-conformity under the Mission Order. |

Forbidden transitions:

- ORDERED directly to COMPLETED.
- READY directly to COMPLETED.
- IN_EXECUTION directly to COMPLETED without consolidation, review, and certification when deliverables are produced.
- Any terminal state to active state without new authority.
- Any state to implementation outside the Mission Order.

---

## 7. Workflow State Set

The official WS-002 workflow state set is:

| State | Meaning |
| --- | --- |
| PLANNED | Workflow steps are identified and ordered. |
| ACTIVE | A workflow step is being executed. |
| WAITING | The workflow is paused for dependency, evidence, or decision. |
| CONSOLIDATING | Workflow outputs are being assembled. |
| REVIEWING | Workflow outputs are under review. |
| CERTIFYING | Workflow outputs are under certification review. |
| COMPLETE | Workflow objective is satisfied. |
| STOPPED | Workflow cannot continue under stop criteria. |

Workflow states are subordinate to mission states.

A mission may contain multiple workflow steps, but only authorized workflow steps may be active.

---

## 8. Workflow Step Requirements

Each workflow step must define:

- step name;
- purpose;
- responsible role;
- input references;
- expected output;
- evidence to capture;
- dependencies;
- stop conditions;
- review requirement;
- certification relevance.

Each workflow step must avoid:

- code;
- APIs;
- technology selection;
- Kernel changes;
- Platform contract definition;
- Product business logic;
- agent mutation.

---

## 9. Valid Workflow Transitions

| From | To | Required Condition |
| --- | --- | --- |
| PLANNED | ACTIVE | Step is authorized and dependencies are available. |
| PLANNED | STOPPED | Required dependency is missing and cannot be resolved in scope. |
| ACTIVE | WAITING | Step needs dependency, evidence, or decision. |
| ACTIVE | CONSOLIDATING | Step output is ready to merge. |
| ACTIVE | STOPPED | Stop condition is met. |
| WAITING | ACTIVE | Dependency, evidence, or decision is available. |
| WAITING | STOPPED | Waiting condition cannot be resolved under authority. |
| CONSOLIDATING | REVIEWING | Step output is assembled. |
| CONSOLIDATING | WAITING | Conflict requires decision or additional evidence. |
| REVIEWING | CONSOLIDATING | Review requires correction. |
| REVIEWING | CERTIFYING | Review passes. |
| CERTIFYING | COMPLETE | Certification passes for the workflow step. |
| CERTIFYING | STOPPED | Certification identifies blocking issue. |

---

## 10. Mission And Workflow Relationship

Mission state controls the whole authorized mission.

Workflow state controls the status of ordered activity inside the mission.

Rules:

1. A workflow cannot be ACTIVE unless the mission is IN_EXECUTION.
2. A workflow cannot be CERTIFYING unless the mission is IN_CERTIFICATION or preparing that state through review.
3. A mission cannot be COMPLETED unless all required workflows are COMPLETE or formally deferred by authority.
4. A STOPPED workflow may cause the mission to become BLOCKED or STOPPED.
5. A WAITING workflow may cause the mission to become WAITING_ON_DECISION if the waiting reason is authority-based.
6. Workflow evidence must roll up to mission evidence.

---

## 11. Evidence Requirements By State

| State Category | Evidence Required |
| --- | --- |
| Authorization | Mission Order, references, deliverable list, constraints. |
| Preparation | dependency checks, target path checks, scope verification. |
| Execution | assigned roles, workflow steps, produced deliverables, work evidence. |
| Decision Waiting | issue, impact, authority required, Decision Report need. |
| Blocking | missing dependency, contradiction, target conflict, or scope issue. |
| Consolidation | contribution list, conflict checks, merged deliverables. |
| Review | review checklist, findings, actions. |
| Certification | certification checklist, hashes, GO or NO GO result. |
| Completion | final deliverable list, reports, hashes, dependency release. |

---

## 12. Stop State Requirements

STOPPED is valid when:

- a dependency is absent;
- canonical references contradict in a way that cannot be resolved under mission authority;
- target files already exist and the Mission Order does not authorize idempotency handling or repair;
- requested work requires doctrine modification;
- requested work requires rule modification;
- requested work requires agent modification;
- requested work requires Kernel responsibility change;
- requested work would create unauthorized implementation;
- requested work would duplicate certified existing artefacts.

STOPPED requires:

- stop reason;
- references checked;
- artefacts affected;
- authority needed or reason continuation is impossible;
- required blocking report when specified by the Mission Order.

---

## 13. Terminal State Requirements

Terminal mission states are:

- COMPLETED;
- COMPLETED_WITH_RECOMMENDATIONS;
- STOPPED;
- CANCELLED.

Terminal state requirements:

| Terminal State | Required Evidence |
| --- | --- |
| COMPLETED | deliverables, reports, hashes, review result, certification result. |
| COMPLETED_WITH_RECOMMENDATIONS | same as COMPLETED plus non-blocking recommendation list. |
| STOPPED | blocking evidence, stop report or Decision Report requirement. |
| CANCELLED | cancellation authority and scope impact. |

Terminal states must not be changed without explicit authority.

---

## 14. Boundary Requirements

Mission and workflow states must not:

- redefine NOVA Execution Model;
- redefine Kernel lifecycle;
- define implementation runtime states;
- define Platform API states;
- define Product workflow states;
- become UI states;
- mutate agent state definitions;
- create hidden doctrine.

The state model is Operating System governance specification only.

---

## 15. Developer Readiness

Future developers may use this specification to:

- create implementation-level state handling later;
- verify that mission and workflow status changes remain traceable;
- identify required evidence per transition;
- distinguish mission status from workflow step status;
- detect when execution must stop or escalate.

Future developers must not use this specification as:

- a code state machine;
- a database enum definition;
- an API state contract;
- a UI workflow;
- a Kernel lifecycle primitive.

---

## 16. Certification Criteria

This specification is certifiable when:

- every state has a defined meaning;
- every transition has a required condition;
- terminal states are explicit;
- stop states are explicit;
- evidence requirements are defined;
- state semantics preserve NOVA Execution Model;
- Kernel, Platform, Product, agent, Workspace, and VEEDDA boundaries are preserved;
- no implementation artefact is introduced.

---

## 17. References

- Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/WS-002_EXECUTION_MODEL_SPECIFICATION/WS_002_CHARTER.md
- Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/WS-002_EXECUTION_MODEL_SPECIFICATION/WS_002_ENGINEERING_DESIGN_SQUAD_PLAN.md
- Docs/15_OPERATIONS/NOVA_EXECUTION_MODEL.md
- Docs/00_FOUNDATION/NOVA_KERNEL_DOCTRINE.md
- Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/WS-001_OPERATING_SYSTEM_ARCHITECTURE/OS_FOUNDATION_ARCHITECTURE.md
- Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/WS-001_OPERATING_SYSTEM_ARCHITECTURE/OS_FOUNDATION_COMPONENT_MODEL.md
- Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/WS-001_OPERATING_SYSTEM_ARCHITECTURE/OS_FOUNDATION_BOUNDARIES.md
- Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/WS-001_OPERATING_SYSTEM_ARCHITECTURE/OS_FOUNDATION_PRINCIPLES.md
- Docs/19_PROGRAMS/PROGRAM-002_OPERATING_SYSTEM_FOUNDATION/WS-001_OPERATING_SYSTEM_ARCHITECTURE/OS_FOUNDATION_GLOSSARY.md

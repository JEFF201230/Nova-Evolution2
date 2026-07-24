# Authority And Permission Matrix

Program ID: PROGRAM-002

Workstream ID: WS-005

Mission ID: PROGRAM-002-WS-005-AGENT-RUNTIME-SPECIFICATION-BATCH-001

Document Type: ENGINEERING SPECIFICATION

Specification Status: CERTIFICATION CANDIDATE

Date: 2026-07-04

---

## 1. Purpose

This matrix defines authority and permission boundaries for Operating System Agent Runtime coordination.

It translates WS-002 decision authority classes and WS-004 lifecycle gates into mission-scoped agent participation controls.

It is documentary only.

It does not define authorization implementation, access control technology, security policy, APIs, schemas, code, or UI.

---

## 2. Authority Principles

1. Mission Order authority bounds all Agent Runtime coordination.
2. Agents execute assigned responsibilities; they do not gain architecture, doctrine, rule, baseline, or Executive authority.
3. Agent Runtime may coordinate existing agents but may not create, modify, merge, rename, or redefine agents.
4. Architecture issues require Decision Report or blocking evidence.
5. Certification authority issues GO, GO WITH RECOMMENDATIONS, NO GO, or BLOCKED based on evidence.
6. Platform authorization implementation remains out of scope.

---

## 3. Authority Classes

| Authority Class | Applies To | Required Artefact |
| --- | --- | --- |
| Mission authority | Mission-scoped coordination, deliverables, references, stop conditions. | Mission Order and Execution Report. |
| Documentation authority | Document completeness, consolidation, reference mapping, structure. | Consolidation Report or Review Report. |
| Architecture authority | Kernel/OS/Platform/Product boundaries, agent responsibility conflicts, unresolved architecture questions. | Decision Report. |
| Certification authority | Review-to-certification readiness and certification result. | Certification Report. |
| Executive authority | Program transition, major scope, final validation where required. | Decision Report or Executive validation evidence. |

---

## 4. Permission Envelope Matrix

| Actor Or Role | May Do Inside WS-005 | Must Not Do |
| --- | --- | --- |
| ORCHESTRATOR_AGENT | Coordinate execution, verify dependencies, create authorized WS-005 deliverables, record evidence. | Modify canonical roadmap, doctrine, rules, baselines, closed Workstreams, or agents. |
| Operating System Squad | Produce Agent Runtime specification deliverables and reports. | Produce code, implementation APIs, schemas, UI, product workflow, or Mission Runtime specification. |
| Architecture Review Squad | Review boundary questions and receive escalations. | Silently resolve architecture contradictions without Decision Report evidence. |
| Certification Agent | Verify deliverables, hashes, traceability, boundary compliance, and certification criteria. | Certify by assumption or certify unreviewed deliverables. |
| Participating Agent Reference | Be used as read-only source evidence for mission-scoped participation. | Be modified, merged, renamed, created, deleted, or redefined. |
| Kernel | Provide generic primitive support through frozen baseline services. | Own agent identity, responsibility, capability, permission, or orchestration semantics. |
| Platform | Remain outside WS-005 except as boundary reference. | Receive API, SDK, auth, admin, observability, marketplace, or implementation definitions. |
| Product | Remain outside WS-005 except as boundary reference. | Receive task execution, business workflow, UX, or product data semantics. |

---

## 5. Mission-Scoped Permission Envelope

Every mission-scoped agent binding must state:

- Mission ID;
- Workstream ID;
- authorized workflow step;
- existing agent reference;
- mission role;
- capability need;
- permitted documentary actions;
- forbidden actions;
- supervision owner;
- escalation path;
- release condition.

Permitted documentary actions may include:

- contributing to an authorized deliverable;
- reviewing an authorized deliverable;
- producing evidence;
- raising a Decision Report need;
- recording a blocker.

Permitted documentary actions do not include:

- modifying agent records;
- changing doctrine or rules;
- changing baselines;
- changing closed Workstreams;
- implementing code or APIs;
- defining Mission Runtime;
- resolving collisions.

---

## 6. Escalation Matrix

| Trigger | Required Response | Authority |
| --- | --- | --- |
| Agent identity evidence missing | Stop affected binding and record blocker. | Mission authority unless broader issue appears. |
| Agent responsibility conflict | Produce Decision Report or blocking evidence. | Architecture authority. |
| Agent collision | Apply MIG-002 and do not resolve in WS-005. | Architecture authority. |
| Need to modify doctrine or rule | Stop affected scope. | Executive or architecture authority. |
| Need to modify Kernel Baseline | Stop affected scope and produce decision evidence. | Architecture authority. |
| Need for Platform auth/API/admin implementation | Stop affected scope. | Platform authority outside WS-005. |
| Need for Product task execution or UX | Stop affected scope. | Product authority outside WS-005. |
| Certification evidence missing | Return to evidence gathering or issue NO GO/BLOCKED. | Certification authority. |

---

## 7. Boundary Verification Matrix

| Boundary | Verification Requirement | Certification Status Target |
| --- | --- | --- |
| Kernel | No agent semantics move into Kernel. | PASS |
| Operating System | Coordination remains mission-scoped governance. | PASS |
| Platform | No Platform implementation or security policy is defined. | PASS |
| Product | No product workflow or task execution is defined. | PASS |
| Agent | Agent references remain unchanged. | PASS |
| Mission Runtime | Mission Runtime responsibility specification is not defined. | PASS |
| Doctrine and rules | No modification. | PASS |
| Closed Workstreams | No modification. | PASS |

---

## 8. Certification Criteria

This matrix is certifiable when:

- authority classes are explicit;
- permission envelopes are mission-scoped;
- escalation triggers are explicit;
- boundary verification is explicit;
- no implementation permission system is defined;
- no agent identity, responsibility, capability, or permission is modified.


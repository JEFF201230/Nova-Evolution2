# WS-004 / WS-005 Gap Analysis

Program ID: PROGRAM-002

Program Name: Operating System Foundation

Mission ID: WS-004-WS-005-PREOPENING-AUDIT

Document Type: GAP ANALYSIS

Status: FINAL

Date: 2026-07-03

---

## 1. Purpose

This document identifies only the true documentary gaps found during the WS-004 / WS-005 preopening audit.

It does not propose duplicates.

It does not create architecture.

It does not open WS-004, WS-005, or any later Workstream.

---

## 2. Gap Classification

| Classification | Meaning |
| --- | --- |
| TRUE GAP | The corpus does not yet contain the required authorized Workstream deliverable or model. |
| COMPLEMENT GAP | The corpus contains strong input material, but a Workstream-specific specification, matrix, or evidence model is still required. |
| GOVERNANCE GAP | The issue is a naming, sequencing, authority, or roadmap alignment gap, not a content gap. |
| NOT A GAP | Existing corpus already covers the need and should not be duplicated. |

---

## 3. WS-004 Lifecycle True Gaps

| Gap ID | Gap | Classification | Existing Coverage | Required Future Action | Duplicate To Avoid |
| --- | --- | --- | --- | --- | --- |
| WS4-G01 | Operating System lifecycle specification does not exist as a WS-004 deliverable. | TRUE GAP | NOVA_EXECUTION_MODEL.md; OPERATING_SYSTEM_EXECUTION_SPECIFICATION.md; PROGRAM_002_WORKSTREAMS.md | Create the authorized WS-004 lifecycle specification after WS-004 is opened. | Do not rewrite NOVA_EXECUTION_MODEL.md. |
| WS4-G02 | Lifecycle transition matrix is not yet defined for Program, Workstream, Mission, Squad, Agent interface, Workspace interface, artefact, certification, capitalization, archive, and closure. | TRUE GAP | MISSION_AND_WORKFLOW_STATE_MODEL_SPECIFICATION.md defines mission/workflow states only. | Create a lifecycle transition matrix that references WS-002 states and adds lifecycle gates. | Do not create implementation state machines or code enums. |
| WS4-G03 | Lifecycle evidence model is not yet unified. | COMPLEMENT GAP | TRACEABILITY_MODEL_SPECIFICATION.md; DECISION_AND_REPORTING_FLOW_SPECIFICATION.md; WS-002 certification evidence | Define evidence required per lifecycle transition and per artefact class. | Do not duplicate the full traceability model. |
| WS4-G04 | Workstream lifecycle gates are not yet specified beyond roadmap status values. | COMPLEMENT GAP | PROGRAM_002_WORKSTREAMS.md lists Workstream statuses and governance rules. | Define entry, active, validation, certification, closure, archive, and dependency release gates. | Do not modify PROGRAM_002_WORKSTREAMS.md. |
| WS4-G05 | Squad lifecycle is not yet specified as a lifecycle object. | COMPLEMENT GAP | NOVA_EXECUTION_MODEL.md; ORCHESTRATION_GOVERNANCE.md; WS_002_ENGINEERING_DESIGN_SQUAD_PLAN.md | Define squad activation, responsibility distribution, consolidation, review support, certification support, and release evidence where needed. | Do not redefine agent responsibilities. |
| WS4-G06 | Agent lifecycle is only indirectly covered. | COMPLEMENT GAP | Agent library; PRODUCT-RULE-003_AGENT_RULES.md; ORCHESTRATION_GOVERNANCE.md | Keep WS-004 scope to agent lifecycle interfaces and lifecycle evidence. Defer runtime agent details. | Do not change agent identity, capability, permission, or role definitions. |
| WS4-G07 | Workspace lifecycle is only conceptually covered. | COMPLEMENT GAP | OS_FOUNDATION_COMPONENT_MODEL.md; TRACEABILITY_MODEL_SPECIFICATION.md; PROGRAM_002_WORKSTREAMS.md | Define workspace lifecycle expectations only where required by lifecycle management. | Do not create Workspace Runtime or UI model. |
| WS4-G08 | Certification lifecycle gates are distributed across reporting and certification reports. | COMPLEMENT GAP | DECISION_AND_REPORTING_FLOW_SPECIFICATION.md; TRACEABILITY_MODEL_SPECIFICATION.md; WS_002_CERTIFICATION_REPORT.md | Define certification lifecycle gates and evidence handoff for later WS-008 certification. | Do not replace WS-008 final certification scope. |

### WS-004 Non-Gaps

The following are not gaps and must not be recreated:

- mission state set;
- workflow state set;
- mission/workflow transition constraints;
- decision report flow;
- execution report flow;
- traceability object set;
- traceability quality gates;
- WS-001 conceptual architecture;
- NOVA Execution Model doctrine.

---

## 4. WS-005 Agent Runtime True Gaps

The mission requests Agent Runtime under WS-005.

The canonical roadmap assigns Agent Runtime to WS-006.

This gap analysis therefore identifies the Agent Runtime gaps without authorizing a Workstream rename, scope transfer, or opening.

| Gap ID | Gap | Classification | Existing Coverage | Required Future Action | Duplicate To Avoid |
| --- | --- | --- | --- | --- | --- |
| WS5-G01 | Agent Runtime responsibility specification does not exist. | TRUE GAP | PROGRAM_002_WORKSTREAMS.md defines canonical WS-006 Agent Runtime deliverable; WS-002 execution spec mentions agent coordination. | Create the Agent Runtime responsibility specification under the canonical authorized Workstream. | Do not implement runtime code or redefine WS-005 Mission Runtime. |
| WS5-G02 | Agent coordination model is not yet a complete runtime model. | TRUE GAP | ORCHESTRATOR_AGENT.md; ORCHESTRATION_GOVERNANCE.md; TRACEABILITY_MODEL_SPECIFICATION.md | Define coordination responsibilities, assignment expectations, handoff, traceability, and escalation. | Do not change Orchestrator authority. |
| WS5-G03 | Agent authority and escalation matrix is not yet complete. | TRUE GAP | PRODUCT-RULE-003_AGENT_RULES.md; DECISION_AND_REPORTING_FLOW_SPECIFICATION.md; ORCHESTRATION_GOVERNANCE.md | Define runtime authority boundaries, permission classes, blocked conditions, and escalation paths. | Do not create new permanent agent authority. |
| WS5-G04 | Agent Registry exists only as a documentary library and product/architecture concept. | COMPLEMENT GAP | Docs/07_AGENTS/library/README.md; Docs/07_AGENTS/NOVA-007_AGENT_PLATFORM/README.md; ARCH-RULE-001_ARCHITECTURAL_BOUNDARY.md | Define registry responsibility, registry source rules, unknown agent handling, and registry traceability. | Do not duplicate agent files or create a new registry without authority. |
| WS5-G05 | Agent Identity is distributed across individual agent files. | COMPLEMENT GAP | Docs/07_AGENTS/library/*.md; Docs/07_AGENTS/NOVA-007_AGENT_PLATFORM/*.md; MIG-002_AGENT_COLLISION_RESOLUTION_RULE.md | Define identity usage and collision handling requirements without changing identities. | Do not rewrite agent sheets. |
| WS5-G06 | Agent Capability model is not unified. | COMPLEMENT GAP | Individual agent files; NOVA-007_AGENT_PLATFORM/README.md | Define capability taxonomy as metadata for runtime assignment only. | Do not expand agent scopes. |
| WS5-G07 | Agent Permission model is not unified. | COMPLEMENT GAP | PRODUCT-RULE-003_AGENT_RULES.md; ORCHESTRATION_GOVERNANCE.md; NOVA_EXECUTION_MODEL.md | Define permission and forbidden-action matrix for runtime assignment and supervision. | Do not replace Product Owner, Architect, Executive, or certification authority. |
| WS5-G08 | Agent Activation lifecycle is not specified. | TRUE GAP | ORCHESTRATION_GOVERNANCE.md covers attribution, lock, escalation, closure; WS-002 states cover missions and workflows. | Define activation, assignment, active execution, waiting, escalation, suspension, release, and closure evidence. | Do not mutate mission state semantics. |
| WS5-G09 | Agent Supervision is distributed across QA, review, certification, traceability, and orchestration. | COMPLEMENT GAP | QA_AGENT.md; REVIEW_AGENT.md; CERTIFICATION_AGENT.md; ORCHESTRATION_GOVERNANCE.md; TRACEABILITY_MODEL_SPECIFICATION.md | Define supervision triggers, evidence, anomaly handling, and certification handoff. | Do not create control center implementation or observability technology. |
| WS5-G10 | Agent Lifecycle is not complete as a runtime lifecycle. | TRUE GAP | Agent rules and orchestration governance provide bounded behavior only. | Define runtime lifecycle interaction after Mission Runtime and lifecycle management dependencies are complete. | Do not modify permanent agent definitions. |

### WS-005 / WS-006 Governance Gap

| Gap ID | Gap | Classification | Existing Coverage | Required Future Action | Duplicate To Avoid |
| --- | --- | --- | --- | --- | --- |
| GOV-G01 | Mission request labels WS-005 as Agent Runtime, while PROGRAM_002_WORKSTREAMS.md defines WS-005 as Mission Runtime and WS-006 as Agent Runtime. | GOVERNANCE GAP | PROGRAM_002_WORKSTREAMS.md official roadmap | Before any Agent Runtime opening, use canonical WS-006 or obtain explicit authority to alter the roadmap. | Do not silently replace Mission Runtime with Agent Runtime. |

### Agent Runtime Non-Gaps

The following are not gaps and must not be recreated:

- existing agent library;
- NOVA-007 Agent Platform agent sheets;
- ORCHESTRATOR_AGENT responsibilities;
- Product agent rules;
- agent collision resolution rule;
- WS-002 traceability responsibilities;
- WS-002 agent boundary controls;
- existing authority escalation doctrine.

---

## 5. Final Roadmap From Audit Facts

### 5.1 Completed

The following are complete enough to reuse:

1. NOVA execution doctrine.
2. PROGRAM-002 Workstream roadmap.
3. WS-001 conceptual Operating System architecture.
4. WS-002 execution responsibilities.
5. WS-002 mission and workflow state model.
6. WS-002 decision and reporting flow.
7. WS-002 traceability model.
8. Agent library and agent platform role sheets as documentary sources.
9. Agent mandate, scope, and escalation rules.

### 5.2 Requires Complement Only

The following require controlled complements:

1. Workstream lifecycle gates.
2. Squad lifecycle evidence.
3. Artefact lifecycle evidence.
4. Certification lifecycle gates.
5. Agent registry responsibility model.
6. Agent identity usage model.
7. Agent capability taxonomy.
8. Agent permissions and authority matrix.
9. Agent supervision evidence model.

### 5.3 Must Really Be Created Later

The following must really be created by future authorized Workstream missions:

1. Operating System lifecycle specification.
2. Lifecycle transition matrix.
3. Lifecycle evidence model.
4. WS-004 validation and closure criteria.
5. Mission Runtime responsibility specification under canonical WS-005.
6. Agent Runtime responsibility specification under canonical WS-006, unless governance explicitly changes the roadmap.
7. Agent coordination model.
8. Agent activation and lifecycle model.
9. Agent authority and escalation matrix.

---

## 6. Workstream Decisions

### WS-004 Lifecycle Management

Decision:

OPEN WITH COMPLETION

Reason:

WS-004 has sufficient upstream certified material to open later, but its mandatory lifecycle deliverables do not yet exist.

### Requested WS-005 Agent Runtime Scope

Decision:

OPEN WITH COMPLETION

Reason:

Agent Runtime is partially covered but not complete. It requires a future authorized specification mission. The audit records that the canonical roadmap places Agent Runtime in WS-006 and WS-005 in Mission Runtime, so opening this scope as WS-005 would require explicit governance alignment.

---

## 7. Final Gap Analysis Conclusion

The real gaps are detailed lifecycle and Agent Runtime specifications, not foundational architecture.

No duplicate document should be created for existing doctrine, WS-001 architecture, WS-002 execution specifications, or existing agent files.

No Workstream has been opened.

No existing document has been modified.

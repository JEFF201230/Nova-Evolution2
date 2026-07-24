# EXEC-001 - Mission Idempotency Rule

Status: ACTIVE

Classification: EXECUTION RULE

Program: NOVA ORCHESTRATOR

Mission ID: EXEC-001-MISSION-IDEMPOTENCY-RULE

---

## 1. Purpose

This rule defines the official NOVA behavior when a mission is relaunched and one or more expected deliverables already exist.

It prevents dangerous re-execution, duplicate deliverables, silent changes, unauthorized replacement, and loss of documentary traceability.

The rule allows a relaunched mission to be classified as complete without modifying existing deliverables when those deliverables are verified as conforming to the active Mission Order.

---

## 2. Scope

This rule applies to all NOVA missions that create, update, validate, repair, or certify documentary or operational deliverables.

It applies when:

- a mission is relaunched;
- one or more expected deliverables already exist;
- an agent detects a target path that is already occupied;
- a previous partial execution created outputs;
- a mission needs to determine whether to continue, stop, repair, or escalate.

This rule does not authorize modification of existing documents. It defines the checks and outcomes required before any action.

This rule does not replace MIG-002. When the situation is a migration collision, MIG-002 remains applicable.

---

## 3. Definition of Idempotency

Mission idempotency is the ability to relaunch a mission without producing duplicate deliverables, replacing existing deliverables, silently changing validated artefacts, or corrupting traceability.

A mission is idempotent when repeated execution produces one of the authorized outcomes defined by this rule and does not alter existing deliverables unless explicit authority exists.

Idempotency does not mean automatic overwrite.

Idempotency means controlled detection, verification, classification, and reporting.

---

## 4. Existing Deliverable Policy

When an expected deliverable already exists, the agent must treat the existing file as protected evidence until its status is verified.

The agent must not assume that the existing deliverable is correct, obsolete, replaceable, or invalid.

The agent must verify the deliverable against:

- the active Mission Order;
- the required deliverable path;
- the required contents and sections;
- the expected status;
- the applicable doctrines and rules;
- available SHA-256 evidence;
- documentary coherence with canonical references.

If the existing deliverable is conforming, the mission may be classified as ALREADY COMPLETED.

If the existing deliverable is non-conforming or incomplete, the mission must not repair it automatically unless the Mission Order explicitly authorizes repair of existing deliverables.

---

## 5. Authorized Outcomes

### ALREADY COMPLETED

Use this outcome when all expected deliverables already exist and are verified as conforming to the active Mission Order.

Required result:

- no deliverable is modified;
- SHA-256 values are recorded;
- an idempotency report records the verification;
- the mission is closed as already completed.

### NEEDS REVIEW

Use this outcome when deliverables exist but conformity cannot be fully confirmed from available evidence.

Required result:

- no deliverable is modified;
- uncertainty is documented;
- the mission is referred for human, Architect, or Executive review according to authority.

### NEEDS REPAIR

Use this outcome when deliverables exist and are clearly incomplete, inconsistent, or non-conforming, but repair may be possible.

Required result:

- no repair is performed unless the Mission Order explicitly authorizes modification of existing deliverables;
- required corrections are listed;
- authority required for repair is identified;
- the mission remains blocked or deferred until repair authority exists.

### EXECUTIVE DECISION REQUIRED

Use this outcome when an existing deliverable conflict affects program status, doctrine, architecture, archive integrity, validation authority, or program transition.

Required result:

- no deliverable is modified;
- a Decision Report is produced when required by the NOVA Execution Model;
- the matter is escalated to the Executive or Architect according to governance.

---

## 6. Mandatory Checks

Before continuing a relaunched mission, the agent must perform and record the following checks:

1. Verify existence of every expected deliverable.
2. Calculate SHA-256 for every existing deliverable.
3. Verify documentary coherence against canonical references.
4. Verify conformity to the active Mission Order.
5. Verify status, scope, sections, and mandatory metadata.
6. Verify that no unauthorized modification has been made during the relaunch.
7. Verify that no duplicate output path is being introduced.
8. Verify that no existing deliverable would be overwritten by continuing execution.
9. Verify whether the Mission Order authorizes repair of existing deliverables.
10. Record the authorized outcome.

---

## 7. Forbidden Actions

The following actions are forbidden unless explicit authority is granted by the active Mission Order and applicable governance:

- automatic replacement of existing deliverables;
- duplicate creation under alternate names to bypass an occupied target path;
- silent modification of existing deliverables;
- deletion of existing deliverables;
- overwriting existing deliverables;
- automatic merge of existing and new content;
- changing doctrine, rules, agents, archives, or program status to force mission completion;
- treating a non-conforming deliverable as conforming without evidence;
- treating a conforming existing deliverable as a failure merely because it was created by a previous run.

---

## 8. Procedure

The official procedure for relaunched missions is:

1. Detect existing deliverables.
2. Verify their conformity.
3. Compare each existing deliverable with the active mission requirements.
4. Produce an idempotency report.
5. Classify the mission using one authorized outcome.

The idempotency report must include:

- mission ID;
- expected deliverables;
- existing deliverables detected;
- SHA-256 values;
- conformity checks;
- documentary coherence checks;
- unauthorized modification checks;
- selected outcome;
- required follow-up when the outcome is not ALREADY COMPLETED.

---

## 9. Acceptance Criteria

A relaunched mission is acceptable under this rule when:

- all expected deliverables are detected or all missing deliverables are documented;
- SHA-256 values are recorded for existing deliverables;
- conformity is assessed against the Mission Order;
- documentary coherence is assessed against canonical references;
- no existing deliverable is modified without explicit authority;
- no duplicate deliverable is created;
- no existing deliverable is overwritten;
- an authorized outcome is assigned;
- the outcome is recorded in a report.

---

## 10. Stop Criteria

The mission must stop when:

- a required canonical dependency is absent;
- an existing deliverable is non-conforming and repair is not explicitly authorized;
- a deliverable conflict affects doctrine, architecture, archive integrity, program status, or validation authority;
- continuing would overwrite, delete, duplicate, or silently modify an existing deliverable;
- SHA-256 cannot be calculated for an existing deliverable that must be verified;
- the agent cannot determine conformity without making an unauthorized assumption.

When a stop criterion is met, the agent must produce the required report and preserve existing deliverables unchanged.

---

## 11. References

- Docs/15_OPERATIONS/NOVA_EXECUTION_MODEL.md
- Docs/15_OPERATIONS/NOVA_PROGRAM_GOVERNANCE.md
- Docs/05_RULES/MIG-002_AGENT_COLLISION_RESOLUTION_RULE.md
- COPY FIRST - NEVER DELETE

---

End of document.

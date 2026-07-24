# Lifecycle Transition Matrix

Program ID: PROGRAM-002

Workstream ID: WS-004

Mission ID: PROGRAM-002-WS-004-LIFECYCLE-SPECIFICATION-BATCH-001

Document Type: ENGINEERING SPECIFICATION

Specification Status: CERTIFICATION CANDIDATE

Date: 2026-07-04

---

## 1. Purpose

This matrix defines allowed Operating System lifecycle transitions for WS-004.

It refines WS-002 mission and workflow transitions without redefining NOVA Execution Model or Kernel Lifecycle.

---

## 2. Global Transition Rules

1. No lifecycle transition is valid without evidence.
2. No active state is valid without Mission Order authority.
3. Terminal states require closure, stop, or cancellation evidence.
4. Certification states require review evidence.
5. Archive states require final deliverable references.
6. Closed Workstreams must not be modified by later lifecycle transitions.
7. Kernel Lifecycle remains primitive support only.

---

## 3. Workstream Transition Matrix

| From | To | Required Evidence | Forbidden Shortcut |
| --- | --- | --- | --- |
| Planned | Ordered | Mission Order authorizes the Workstream. | Planned directly to Active. |
| Ordered | Ready | Dependency, scope, and target path checks. | Ordered directly to Certified. |
| Ordered | Blocked | Missing dependency or contradiction evidence. | Ordered directly to Closed. |
| Ready | Active | Charter exists and execution starts. | Ready directly to Closed. |
| Ready | Blocked | Stop condition evidence. | Silent repair. |
| Active | Paused | Waiting reason that does not require authority decision. | Hidden waiting state. |
| Paused | Active | Waiting reason resolved. | Resume without evidence. |
| Active | Waiting On Decision | Authority issue evidence. | Resolve by assumption. |
| Waiting On Decision | Active | Authority decision recorded. | Silent continuation. |
| Waiting On Decision | Stopped | Decision unavailable or mission requires stop. | Ignore decision gap. |
| Active | Consolidating | Authorized deliverables created. | Active directly to Certified. |
| Consolidating | Reviewing | Consolidation report exists. | Consolidating directly to Closed. |
| Reviewing | Consolidating | Review requires non-authority correction. | Modify canonical references. |
| Reviewing | Certifying | Review report has no blocking finding. | Certifying unreviewed deliverables. |
| Reviewing | Waiting On Decision | Review finds authority issue. | Certify unresolved issue. |
| Certifying | Certified | Certification report decision GO. | Certify without evidence. |
| Certifying | Blocked | Certification evidence missing or contradiction detected. | Force GO. |
| Certified | Capitalized | Capitalization report exists. | Archive before certification. |
| Capitalized | Archived | Archive index, certificate, and report exist. | Close without archive evidence. |
| Archived | Closed | Archive certificate states closure evidence supports CLOSED. | Open next Workstream automatically. |
| Blocked | Stopped | Blocking report exists. | Continue without authority. |

---

## 4. Mission Transition Matrix

WS-004 preserves the WS-002 mission transitions.

| From | To | Lifecycle Gate |
| --- | --- | --- |
| ORDERED | READY | Dependency Gate |
| ORDERED | BLOCKED | Stop Gate |
| READY | IN_EXECUTION | Scope Gate |
| READY | BLOCKED | Stop Gate |
| IN_EXECUTION | WAITING_ON_DECISION | Decision Gate |
| IN_EXECUTION | BLOCKED | Stop Gate |
| IN_EXECUTION | CONSOLIDATING | Deliverable Gate |
| WAITING_ON_DECISION | IN_EXECUTION | Authority Resolution Gate |
| WAITING_ON_DECISION | STOPPED | Stop Gate |
| WAITING_ON_DECISION | CANCELLED | Authority Cancellation Gate |
| BLOCKED | READY | Recovery Gate With Authority |
| BLOCKED | STOPPED | Blocking Evidence Gate |
| CONSOLIDATING | IN_REVIEW | Consolidation Gate |
| CONSOLIDATING | WAITING_ON_DECISION | Decision Gate |
| IN_REVIEW | CONSOLIDATING | Review Correction Gate |
| IN_REVIEW | IN_CERTIFICATION | Review Gate |
| IN_REVIEW | WAITING_ON_DECISION | Decision Gate |
| IN_CERTIFICATION | COMPLETED | Certification GO Gate |
| IN_CERTIFICATION | COMPLETED_WITH_RECOMMENDATIONS | Certification Non-Blocking Gate |
| IN_CERTIFICATION | STOPPED | Certification Stop Gate |

---

## 5. Workflow Transition Matrix

WS-004 preserves the WS-002 workflow transitions.

| From | To | Lifecycle Requirement |
| --- | --- | --- |
| PLANNED | ACTIVE | Mission is IN_EXECUTION and dependencies are available. |
| PLANNED | STOPPED | Required dependency is missing. |
| ACTIVE | WAITING | Evidence, dependency, or decision is pending. |
| ACTIVE | CONSOLIDATING | Workflow output exists. |
| ACTIVE | STOPPED | Stop condition is met. |
| WAITING | ACTIVE | Waiting reason resolved. |
| WAITING | STOPPED | Waiting reason cannot be resolved under authority. |
| CONSOLIDATING | REVIEWING | Output assembled. |
| CONSOLIDATING | WAITING | Conflict requires decision or evidence. |
| REVIEWING | CONSOLIDATING | Review correction needed. |
| REVIEWING | CERTIFYING | Review passes. |
| CERTIFYING | COMPLETE | Certification passes for workflow output. |
| CERTIFYING | STOPPED | Certification identifies blocking issue. |

---

## 6. Decision Transition Matrix

| From | To | Required Evidence |
| --- | --- | --- |
| Identified | Isolated | Decision trigger and affected scope recorded. |
| Isolated | Escalated | Required authority identified. |
| Escalated | Pending | Decision Report or blocking evidence exists. |
| Pending | Resolved | Authority response recorded. |
| Pending | Blocking | Absence of decision blocks execution. |
| Pending | Carried Forward | Formal deferral is recorded and does not block certified scope. |
| Resolved | Active Execution | Mission authority allows continuation. |
| Blocking | Stopped | Stop evidence complete. |

---

## 7. Report Transition Matrix

| From | To | Required Evidence |
| --- | --- | --- |
| Required | Drafted | Report purpose and source references identified. |
| Drafted | Verified | Checks, deliverables, and evidence are recorded. |
| Verified | Final | Report contains final status and no unresolved required section. |
| Final | Archived | Archive evidence references the report. |

---

## 8. Certification Transition Matrix

| From | To | Required Evidence |
| --- | --- | --- |
| Candidate | Evidence Checked | Deliverables, review report, references, and hashes exist. |
| Evidence Checked | GO | All blocking criteria pass. |
| Evidence Checked | GO WITH RECOMMENDATIONS | Criteria pass with non-blocking recommendations. |
| Evidence Checked | NO GO | One or more certification criteria fail. |
| Evidence Checked | BLOCKED | Required evidence, authority, or reference is missing. |

---

## 9. Archive Transition Matrix

| From | To | Required Evidence |
| --- | --- | --- |
| Archive Ready | Indexed | Archive index lists deliverables and reports. |
| Indexed | Certified | Archive certificate verifies closure evidence. |
| Certified | Reported | Archive report records controls. |
| Reported | Closed | Final status is WS-004 CLOSED. |

---

## 10. Certification Criteria

This matrix is certifiable when:

- all authorized lifecycle areas have transition rules;
- forbidden shortcuts are explicit;
- WS-002 mission and workflow transitions are preserved;
- Kernel Lifecycle is not redefined;
- no implementation model is introduced.


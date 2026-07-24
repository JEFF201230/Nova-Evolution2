# AUDIT EVENT CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-009-AUDIT-EVENT-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION CATALOG

CLASSIFICATION : AUDIT EVENT CATALOG

---

## Catalog Rules

1. Each event must be canonical.
2. Each event must declare category, criticality, and data requirements.
3. Each event must declare retention expectations.
4. Each event must remain compatible with the Audit Event Contract.
5. The catalog must remain engine-neutral and implementation-neutral.

---

## Event Entries

### authentication

- Canonical ID: `audit_evt_authentication`
- Description: records a successful or failed authentication attempt.
- Category: authentication
- Criticality: Medium
- Mandatory data: principal ID, actor type, method, outcome, timestamp, correlation ID.
- Optional data: tenant ID, source context, reason, session reference.
- Retention rules: retain according to identity and security audit retention class.

### authorization

- Canonical ID: `audit_evt_authorization`
- Description: records an authorization evaluation outcome.
- Category: authorization
- Criticality: High
- Mandatory data: principal ID, resource, action, scope, policy outcome, timestamp, correlation ID.
- Optional data: role reference, permission reference, denial reason.
- Retention rules: retain according to security and governance audit class.

### access

- Canonical ID: `audit_evt_access`
- Description: records access to a governed resource or protected area.
- Category: access
- Criticality: Medium
- Mandatory data: principal ID, resource, action, scope, outcome, timestamp.
- Optional data: tenant ID, session ID, request ID.
- Retention rules: retain when associated with sensitive or governed resources.

### decision

- Canonical ID: `audit_evt_decision`
- Description: records a governed decision issued by a human or authority.
- Category: decision
- Criticality: High
- Mandatory data: decision ID, actor ID, target, rationale, outcome, timestamp, correlation ID.
- Optional data: conditions, reservations, expiry.
- Retention rules: retain for certification and traceability obligations.

### approval

- Canonical ID: `audit_evt_approval`
- Description: records a human approval of a governed action or change.
- Category: approval
- Criticality: High
- Mandatory data: approver ID, target, scope, decision reference, timestamp.
- Optional data: conditions, expiry, justification.
- Retention rules: retain with linked decision and change evidence.

### rejection

- Canonical ID: `audit_evt_rejection`
- Description: records a human rejection of a governed action or change.
- Category: rejection
- Criticality: High
- Mandatory data: rejector ID, target, scope, decision reference, reason, timestamp.
- Optional data: remediation notes, escalation target.
- Retention rules: retain with linked decision and change evidence.

### execution

- Canonical ID: `audit_evt_execution`
- Description: records authorized execution of a mission, change, or administrative action.
- Category: execution
- Criticality: High
- Mandatory data: executor ID, target, scope, outcome, timestamp, correlation ID.
- Optional data: branch, commit, runtime reference.
- Retention rules: retain according to change, mission, and operational audit classes.

### certification

- Canonical ID: `audit_evt_certification`
- Description: records a certification outcome.
- Category: certification
- Criticality: High
- Mandatory data: certifier ID, target, evidence set, result, timestamp, correlation ID.
- Optional data: reservations, revalidation date.
- Retention rules: retain for certification lifecycle and compliance.

### rollback

- Canonical ID: `audit_evt_rollback`
- Description: records rollback initiation or completion.
- Category: rollback
- Criticality: High
- Mandatory data: actor ID, source state, target state, reason, timestamp, correlation ID.
- Optional data: snapshot ID, recovery notes.
- Retention rules: retain with change and recovery evidence.

### deployment

- Canonical ID: `audit_evt_deployment`
- Description: records governed deployment activity.
- Category: deployment
- Criticality: High
- Mandatory data: actor ID, target, environment or scope, outcome, timestamp.
- Optional data: version, commit, branch.
- Retention rules: retain according to release and change audit class.

### configuration_change

- Canonical ID: `audit_evt_configuration_change`
- Description: records a change to governed configuration.
- Category: configuration_change
- Criticality: High
- Mandatory data: actor ID, configuration target, before or after reference, outcome, timestamp.
- Optional data: environment, scope, reason.
- Retention rules: retain when configuration affects governance or security.

### policy_change

- Canonical ID: `audit_evt_policy_change`
- Description: records a governed policy modification.
- Category: policy_change
- Criticality: High
- Mandatory data: actor ID, policy ID, change summary, outcome, timestamp.
- Optional data: approval reference, effective date.
- Retention rules: retain for policy lifecycle and certification review.

### secret_rotation

- Canonical ID: `audit_evt_secret_rotation`
- Description: records secret rotation or replacement.
- Category: secret_rotation
- Criticality: High
- Mandatory data: actor ID, secret identifier, scope, timestamp, outcome.
- Optional data: rotation reason, version reference.
- Retention rules: retain without exposing secret material.

### incident

- Canonical ID: `audit_evt_incident`
- Description: records a security or operational incident relevant to governance.
- Category: incident
- Criticality: High
- Mandatory data: incident ID, reporter or detector, severity, scope, timestamp.
- Optional data: impact summary, escalation path, containment notes.
- Retention rules: retain according to incident and compliance obligations.

### recovery

- Canonical ID: `audit_evt_recovery`
- Description: records restoration or recovery action following incident, rollback, or failure.
- Category: recovery
- Criticality: High
- Mandatory data: actor ID, recovery target, timestamp, outcome, correlation ID.
- Optional data: snapshot reference, verification notes.
- Retention rules: retain with linked incident or rollback evidence.

---

## Compatibility Rules

1. The catalog must remain compatible with the Audit Event Contract.
2. The catalog must remain compatible with the Persistence Contract.
3. The catalog must remain compatible with Security, RBAC, Identity, API, and Change Knowledge Graph contracts.
4. The catalog must remain compatible with future PROGRAM-017 to PROGRAM-032 contracts.

---

## Decision

GO.


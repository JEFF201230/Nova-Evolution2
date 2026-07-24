# SECURITY EVENT CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-007-SECURITY-RBAC-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION CATALOG

CLASSIFICATION : SECURITY EVENT CATALOG

---

## Catalog Rules

1. Each event must be canonical.
2. Each event must have a clear trigger and actor.
3. Each event must declare minimum data and criticality.
4. Each event must be auditable and traceable.
5. The catalog must remain independent of vendor, framework, and language.

---

## Event Entries

### login

- Trigger: a principal successfully authenticates.
- Actor: human, service, agent, or machine principal.
- Minimum data: principal ID, authentication method, tenant or scope, timestamp, outcome.
- Criticality: Medium.
- Audit requirements: must preserve correlation ID and source context.

### logout

- Trigger: a principal ends an authenticated session or token context.
- Actor: authenticated principal or session authority.
- Minimum data: principal ID, session or token reference, timestamp, outcome.
- Criticality: Low.
- Audit requirements: must preserve session linkage and termination reason when available.

### access denied

- Trigger: an authorization request is rejected.
- Actor: requesting principal.
- Minimum data: principal ID, resource, action, scope, policy reason, timestamp.
- Criticality: High.
- Audit requirements: must preserve denial rule and correlation with the request.

### privilege granted

- Trigger: an elevation or permission grant is approved.
- Actor: granting human authority or governing system.
- Minimum data: grantee ID, privilege, scope, approver, expiry if temporary, timestamp.
- Criticality: High.
- Audit requirements: must preserve approval context and expiry boundary.

### privilege revoked

- Trigger: an elevated privilege or permission is removed.
- Actor: revoking authority or governing system.
- Minimum data: grantee ID, privilege, scope, revoker, timestamp, reason.
- Criticality: High.
- Audit requirements: must preserve the original grant reference where available.

### role changed

- Trigger: a role assignment changes.
- Actor: assigning authority.
- Minimum data: principal ID, old role, new role, scope, actor, timestamp.
- Criticality: High.
- Audit requirements: must preserve before and after values and decision rationale.

### secret rotated

- Trigger: governed secret material is replaced.
- Actor: secret owner or security authority.
- Minimum data: secret identifier, owner, scope, timestamp, rotation reason.
- Criticality: High.
- Audit requirements: must not expose secret material or derivable values.

### suspicious activity

- Trigger: behavior matches a security anomaly or policy threshold.
- Actor: detected principal or system observer.
- Minimum data: principal ID if known, detection rule, scope, timestamp, indicator summary.
- Criticality: High.
- Audit requirements: must preserve detection evidence and escalation path.

### policy violation

- Trigger: a policy rule is broken or bypassed.
- Actor: violating principal or system context.
- Minimum data: policy ID, principal ID, scope, rule, timestamp, outcome.
- Criticality: High.
- Audit requirements: must preserve violated rule and remediation record.

### audit export

- Trigger: audit records are exported under governed access.
- Actor: authorized human or service principal.
- Minimum data: exporter ID, audit scope, export target, timestamp, approval reference.
- Criticality: High.
- Audit requirements: must preserve export authorization and destination.

---

## Compatibility Rules

1. The catalog must remain compatible with the Security Contract.
2. The catalog must remain compatible with the RBAC Contract.
3. The catalog must remain compatible with the Identity Contract.
4. The catalog must remain compatible with the Change Knowledge Graph.
5. The catalog must remain compatible with future PROGRAM-017 to PROGRAM-032 contract families.

---

## Decision

GO.


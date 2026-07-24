# RBAC CONTRACT

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-007-SECURITY-RBAC-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION CONTRACT

CLASSIFICATION : RBAC CONTRACT

---

## 1. Purpose

This contract defines the official Role-Based Access Control standard for NOVA.

Its purpose is to specify the canonical roles, permissions, scopes, inheritance, delegation, conflict resolution, separation of responsibilities, temporary privileges, and revocation behavior governing access decisions.

This contract is normative. It does not define implementation, code, framework behavior, or identity provider internals.

---

## 2. Scope

This contract applies to all NOVA principals and governed actions, including:

- human users;
- service accounts;
- agent identities;
- machine identities;
- administrative operations;
- mission operations;
- security-sensitive actions;
- contract-sensitive actions.

It is independent of IAM vendor, framework, language, and transport.

It is compatible with the Identity Contract, the Security Contract, and future PROGRAM-017 to PROGRAM-032 contracts.

---

## 3. Canonical Definitions

| Term | Definition |
| --- | --- |
| Role | A named bundle of permissions assigned to a principal under governed scope. |
| Permission | A canonical action right on a resource, operation, or scope. |
| Scope | The boundary within which a role or permission is valid. |
| Delegation | The governed transfer or extension of authority from one principal to another. |
| Temporary Privilege | A time-bounded elevation of access rights. |
| Separation of Responsibilities | A control rule that prevents a single principal from holding conflicting authorities where governance requires separation. |
| Revocation | The controlled removal or invalidation of access rights. |
| Conflict Resolution | The deterministic rule set used when roles, scopes, or permissions collide. |

---

## 4. RBAC Principles

1. Access must be explicit.
2. Roles must be canonical.
3. Permissions must be canonical.
4. Scope must be explicit.
5. Least privilege is mandatory.
6. Separation of responsibilities is mandatory where risk demands it.
7. Delegation must be governed.
8. Temporary privilege must be time-bounded.
9. Revocation must be immediate when authority is withdrawn.
10. RBAC must remain compatible with identity, audit, and change governance contracts.

---

## 5. Canonical Roles

The canonical role set must be stable and governed.

Minimum canonical roles:

- `platform_admin`
- `security_admin`
- `program_board_member`
- `program_manager`
- `mission_owner`
- `delivery_squad_member`
- `reviewer`
- `approver`
- `certifier`
- `observer`
- `service_operator`
- `automation_agent`

Rules:

1. Roles must be named explicitly.
2. Roles must be versioned or traceable to a versioned contract.
3. Roles must not silently overlap without documented purpose.
4. Roles must remain compatible with the Identity Contract.

---

## 6. Permissions

Permissions are the atomic rights used in access control.

Rules:

1. A permission must represent one governed action on one resource class.
2. Permissions must be resource-aware and action-aware.
3. Permissions must be reusable across roles.
4. Permissions must be auditable.
5. Permissions must be compatible with the Permission Catalog.

---

## 7. Scopes

Scopes bound the validity of roles and permissions.

Scope dimensions may include:

- program;
- mission order;
- campaign;
- tenant;
- environment;
- resource class;
- administrative domain.

Rules:

1. Scope must be explicit.
2. Scope must not be inferred.
3. Scope must not cross tenant boundaries unless explicitly authorized.
4. Scope must be revocable.

---

## 8. Inheritance

Role inheritance may be used only when it remains governable.

Rules:

1. Inherited privileges must be explicit.
2. Inheritance must not obscure the effective permission set.
3. Inheritance must not violate least privilege.
4. Inheritance must preserve auditability.
5. Inheritance conflicts must resolve deterministically.

---

## 9. Delegation

Delegation transfers or extends authority under governance.

Rules:

1. Delegation must be explicit.
2. Delegation must be time-bounded when it grants elevated power.
3. Delegation must preserve originator identity.
4. Delegation must be revocable.
5. Delegation must be auditable.

---

## 10. Separation of Responsibilities

Separation of responsibilities is mandatory for high-risk actions.

Rules:

1. A principal should not both approve and execute a high-risk sensitive change when governance requires separation.
2. A principal should not self-certify actions that require independent review.
3. Privilege assignment and privilege approval should be separable where risk requires it.
4. Conflicting authorities must be blocked or escalated.

---

## 11. Temporary Privileges

Temporary privileges are time-bounded elevations.

Rules:

1. Temporary privilege must have a start and end boundary.
2. Temporary privilege must have a rationale and an approver.
3. Temporary privilege must be auditable.
4. Temporary privilege must expire automatically when the time boundary is reached.
5. Temporary privilege must be revocable before expiry.

---

## 12. Revocation

Revocation removes authority.

Rules:

1. Revocation must take effect deterministically.
2. Revocation must be traceable to a decision or policy event.
3. Revocation must invalidate temporary privilege where applicable.
4. Revocation must preserve historical audit records.
5. Revocation must be compatible with Identity Contract lifecycle rules.

---

## 13. Conflict Resolution

Conflict resolution must be deterministic.

Resolution precedence:

1. Explicit deny or block rule.
2. Higher-authority governance decision.
3. Narrower scope.
4. Time-bounded elevation expiry.
5. Default least privilege.

Rules:

1. Conflicts must not be resolved by hidden implementation precedence.
2. Conflicts must be explainable.
3. Conflicts must be auditable.

---

## 14. Compatibility with Identity Contract

The RBAC Contract must remain compatible with the Identity Contract.

Rules:

1. Roles must attach to canonical identities.
2. Identity type must constrain eligible roles where required.
3. Human, service, agent, and machine identities must be distinguishable.
4. Identity lifecycle changes must update role validity.
5. Delegation and revocation must preserve identity traceability.

---

## 15. Audit Requirements

Every role change, permission grant, delegation, revocation, temporary privilege, and conflict resolution must be auditable.

Audit records must include:

- actor;
- target principal;
- role or permission affected;
- scope;
- reason;
- timestamp;
- decision outcome.

---

## 16. Compatibility Rules

1. The RBAC Contract must be provider-neutral.
2. The RBAC Contract must be framework-neutral.
3. The RBAC Contract must be language-neutral.
4. The RBAC Contract must remain baseline-compatible.
5. The RBAC Contract must remain compatible with the Security Contract, Identity Contract, and Change Knowledge Graph.
6. The RBAC Contract must remain compatible with future PROGRAM-017 to PROGRAM-032 work.

---

## 17. Extension Rules

1. Extension must not weaken least privilege.
2. Extension must not weaken separation of responsibilities.
3. Extension must not weaken auditability.
4. Extension must be versioned.
5. Extension must preserve canonical role and permission semantics.

---

## 18. Certification Criteria

The RBAC Contract is certifiable only if:

- it follows the CDD standard and template;
- it declares canonical roles, permissions, and scopes;
- it defines inheritance, delegation, separation of responsibilities, temporary privilege, revocation, and conflict resolution;
- it is compatible with the Identity Contract;
- it is compatible with the Security Contract;
- it does not contradict certified baseline documents.

---

## 19. Decision

GO.


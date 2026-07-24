# IDENTITY EVENT CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-006-IDENTITY-CONTRACT

DATE : 2026-07-09

STATUS : OFFICIAL EVENT CATALOG

---

## 1. Purpose

Define the canonical identity events used by NOVA.

This catalog is normative and audit-oriented.

---

## 2. Canonical Event Rules

1. Identity events must be explicit.
2. Identity events must be auditable.
3. Identity events must preserve actor and cause.
4. Identity events must not expose secrets.
5. Identity events must be compatible with replay and traceability requirements.

---

## 3. Events

### 3.1 Creation

| Field | Value |
| --- | --- |
| Trigger | A new identity entity is created or registered. |
| Minimal data | Entity identifier, principal type, owner, tenant, timestamp, actor. |
| Actor | Identity authority or delegated provisioning authority. |
| Consequences | Identity becomes traceable and may enter provisioning or activation flow. |
| Audit requirement | Must record creation reason, scope, and provenance. |

### 3.2 Activation

| Field | Value |
| --- | --- |
| Trigger | Identity becomes eligible for active use. |
| Minimal data | Entity identifier, activation scope, timestamp, actor, policy reference. |
| Actor | Identity authority or delegated administrator. |
| Consequences | Identity may participate in authorized operations. |
| Audit requirement | Must record the policy basis for activation. |

### 3.3 Authentication

| Field | Value |
| --- | --- |
| Trigger | A principal successfully proves identity. |
| Minimal data | Principal identifier, credential type, session reference, timestamp, actor or source. |
| Actor | Authenticator, identity provider, or trusted system. |
| Consequences | Session or token may be issued or refreshed. |
| Audit requirement | Must record proof type and trust source without exposing secrets. |

### 3.4 Authentication Failure

| Field | Value |
| --- | --- |
| Trigger | A principal fails to prove identity. |
| Minimal data | Principal identifier if known, failure reason category, timestamp, source. |
| Actor | Authenticator, identity provider, or trusted system. |
| Consequences | Access denied or challenge repeated according to policy. |
| Audit requirement | Must record failure category and rate-limiting relevance if applicable. |

### 3.5 Expiration

| Field | Value |
| --- | --- |
| Trigger | A credential, token, or session reaches end of validity. |
| Minimal data | Entity reference, expiration timestamp, actor or clock source, scope. |
| Actor | System clock, identity authority, or credential authority. |
| Consequences | Access becomes invalid or renewal becomes necessary. |
| Audit requirement | Must record expiration source and effect. |

### 3.6 Revocation

| Field | Value |
| --- | --- |
| Trigger | Identity, credential, token, or trust relationship is withdrawn. |
| Minimal data | Entity reference, revocation reason, timestamp, actor, scope. |
| Actor | Identity authority, security authority, or delegated authority. |
| Consequences | Access must be denied according to policy. |
| Audit requirement | Must record reason and authority for revocation. |

### 3.7 Provisioning

| Field | Value |
| --- | --- |
| Trigger | A new identity is provisioned for governed use. |
| Minimal data | Entity reference, owner, tenant, role, timestamp, actor. |
| Actor | Provisioning authority or identity authority. |
| Consequences | Identity is created or activated according to policy. |
| Audit requirement | Must record provisioning request, approval basis, and scope. |

### 3.8 Deprovisioning

| Field | Value |
| --- | --- |
| Trigger | Identity access is intentionally removed. |
| Minimal data | Entity reference, deprovisioning reason, timestamp, actor. |
| Actor | Identity authority or delegated administrator. |
| Consequences | Identity is removed from active use and may be archived. |
| Audit requirement | Must record deprovisioning reason and final state. |

### 3.9 Delegation

| Field | Value |
| --- | --- |
| Trigger | Authority is delegated from one principal or domain to another. |
| Minimal data | Delegator, delegatee, scope, validity window, timestamp, actor. |
| Actor | Identity authority or delegated governance authority. |
| Consequences | Delegate may act within the declared boundary. |
| Audit requirement | Must record scope, duration, and approval basis. |

### 3.10 Change of Role

| Field | Value |
| --- | --- |
| Trigger | A principal role changes. |
| Minimal data | Principal identifier, old role, new role, timestamp, actor. |
| Actor | Identity authority or role governance authority. |
| Consequences | Authorization decisions may change. |
| Audit requirement | Must record old and new roles and the approval basis. |

### 3.11 Secret Rotation

| Field | Value |
| --- | --- |
| Trigger | A credential secret or key material is rotated. |
| Minimal data | Credential identifier, rotation reason, timestamp, actor, affected scope. |
| Actor | Security authority or secret management authority. |
| Consequences | Old secret is retired according to policy; new secret becomes active. |
| Audit requirement | Must record rotation cause without exposing secret material. |

### 3.12 Federation

| Field | Value |
| --- | --- |
| Trigger | An identity provider or trust relationship is established, updated, or used. |
| Minimal data | Provider reference, trust reference, tenant, protocol family, timestamp, actor. |
| Actor | Identity authority or federation authority. |
| Consequences | External identity assertions may be accepted within policy. |
| Audit requirement | Must record trust boundary and compatibility basis. |

### 3.13 Suppression

| Field | Value |
| --- | --- |
| Trigger | Identity entity is suppressed or retired from active governance. |
| Minimal data | Entity reference, suppression reason, timestamp, actor. |
| Actor | Identity authority or governance authority. |
| Consequences | Entity no longer participates in active identity decisions. |
| Audit requirement | Must preserve history and suppression rationale. |

---

## 4. Event Rules

1. Every identity event must identify its actor.
2. Every identity event must identify its consequence category.
3. Every identity event must be auditable.
4. Every identity event must preserve the canonical entity reference.
5. Identity events must remain compatible with replay and historical traceability.

---

## 5. Decision

GO.


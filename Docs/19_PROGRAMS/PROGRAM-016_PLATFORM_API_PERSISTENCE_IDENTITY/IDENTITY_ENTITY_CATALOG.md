# IDENTITY ENTITY CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-006-IDENTITY-CONTRACT

DATE : 2026-07-09

STATUS : OFFICIAL ENTITY CATALOG

---

## 1. Purpose

List the canonical identity entities used by NOVA.

This catalog is normative and transport-neutral.

---

## 2. Canonical Entities

### 2.1 User

| Field | Value |
| --- | --- |
| Role | Human principal interacting with NOVA. |
| Description | A person-based identity with governed access and auditable activity. |
| Canonical identifier | `user` |
| Lifecycle | Provisioned -> Active -> Suspended -> Revoked -> Deprovisioned -> Archived |
| Relations | May belong to an organization or tenant; may hold roles and credentials; may open sessions; may own or consume tokens. |
| Owner | Identity authority |

### 2.2 Agent

| Field | Value |
| --- | --- |
| Role | Agent principal interacting with NOVA under governed identity. |
| Description | An explicit principal representation for an agent acting in a mission or system context. |
| Canonical identifier | `agent` |
| Lifecycle | Registered -> Active -> Suspended -> Revoked -> Archived |
| Relations | May be tied to service accounts, trust relationships, sessions, credentials, and audit records. |
| Owner | Identity authority |

### 2.3 Service Account

| Field | Value |
| --- | --- |
| Role | Non-human principal for automation and integration. |
| Description | A controlled account used by services or automation actors. |
| Canonical identifier | `service-account` |
| Lifecycle | Provisioned -> Active -> Suspended -> Revoked -> Deprovisioned -> Archived |
| Relations | May be bound to tokens, credentials, tenants, permissions, and trust relationships. |
| Owner | Security and identity authority |

### 2.4 Organization

| Field | Value |
| --- | --- |
| Role | Governance or administrative grouping of principals. |
| Description | A canonical organizational boundary used for ownership, policy, and reporting. |
| Canonical identifier | `organization` |
| Lifecycle | Created -> Active -> Suspended -> Retired -> Archived |
| Relations | May contain users, agents, service accounts, tenants, and identity providers. |
| Owner | Governance authority |

### 2.5 Tenant

| Field | Value |
| --- | --- |
| Role | Isolation boundary for identity and access. |
| Description | A hard boundary used to segregate identity, authorization, and audit scope. |
| Canonical identifier | `tenant` |
| Lifecycle | Provisioned -> Active -> Suspended -> Retired -> Archived |
| Relations | May contain organizations, users, agents, service accounts, and identity providers; constrains tokens, sessions, and trust. |
| Owner | Platform governance authority |

### 2.6 Identity Provider

| Field | Value |
| --- | --- |
| Role | External or internal source of identity assertions. |
| Description | A governed provider that authenticates principals or issues identity assertions. |
| Canonical identifier | `identity-provider` |
| Lifecycle | Registered -> Active -> Suspended -> Revoked -> Retired |
| Relations | May federate with tenants, trust relationships, credentials, and tokens. |
| Owner | Identity authority |

### 2.7 Credential

| Field | Value |
| --- | --- |
| Role | Proof material used to authenticate a principal. |
| Description | A secret, key, certificate, assertion, or similar bound proof artifact. |
| Canonical identifier | `credential` |
| Lifecycle | Issued -> Active -> Rotating -> Expired -> Revoked -> Retired |
| Relations | May be bound to users, agents, service accounts, sessions, tokens, and identity providers. |
| Owner | Identity and security authority |

### 2.8 Session

| Field | Value |
| --- | --- |
| Role | Bounded authenticated interaction context. |
| Description | A time-bounded state linking a principal to a current trust and authorization context. |
| Canonical identifier | `session` |
| Lifecycle | Created -> Active -> Idle -> Expired -> Revoked -> Archived |
| Relations | May bind to a user, agent, or service account; may issue or consume tokens; may produce audit records. |
| Owner | Identity authority |

### 2.9 Token

| Field | Value |
| --- | --- |
| Role | Portable representation of authenticated claims. |
| Description | A bounded claim-bearing artifact used for access or delegation. |
| Canonical identifier | `token` |
| Lifecycle | Issued -> Active -> Expiring -> Expired -> Revoked -> Archived |
| Relations | May be bound to credentials, sessions, identity providers, tenants, and trust relationships. |
| Owner | Identity authority |

### 2.10 Trust Relationship

| Field | Value |
| --- | --- |
| Role | Declared confidence relationship between identity domains or principals. |
| Description | A governed link that allows identity assertions or delegated trust to be accepted. |
| Canonical identifier | `trust-relationship` |
| Lifecycle | Proposed -> Active -> Suspended -> Revoked -> Retired -> Archived |
| Relations | May connect identity providers, tenants, organizations, service accounts, agents, or users. |
| Owner | Identity and security authority |

---

## 3. Entity Rules

1. Each entity must have one canonical identifier.
2. Each entity must have a declared owner.
3. Each entity must have a declared lifecycle.
4. Each entity must preserve auditable traceability.
5. A canonical entity may have aliases only if the contract explicitly defines the mapping.
6. Entity identifiers must remain stable across certified versions unless a breaking change is approved.

---

## 4. Decision

GO.


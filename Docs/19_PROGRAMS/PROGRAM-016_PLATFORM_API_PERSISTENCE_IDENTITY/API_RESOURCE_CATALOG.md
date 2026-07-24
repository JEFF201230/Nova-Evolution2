# API RESOURCE CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-005-API-CONTRACT

DATE : 2026-07-09

STATUS : OFFICIAL RESOURCE CATALOG

---

## 1. Purpose

List the canonical resources recognized by the NOVA API contract.

This catalog is normative. It does not define endpoints.

---

## 2. Canonical Resources

### 2.1 Platform API Contract

| Field | Value |
| --- | --- |
| Name | Platform API Contract |
| Identifier | `api-contract` |
| Description | The governing API specification that defines platform-level interface rules. |
| Owner | Platform API authority |
| Relations | Depends on Identity Contract, Security Contract, Event Contract, Persistence Contract. |
| Cycle of life | Draft -> Review -> Validated -> Certified -> Deprecated -> Removed |

### 2.2 API Resource Catalog

| Field | Value |
| --- | --- |
| Name | API Resource Catalog |
| Identifier | `api-resource-catalog` |
| Description | The canonical registry of addressable API resources. |
| Owner | Platform API authority |
| Relations | Linked to all resource-based contracts. |
| Cycle of life | Draft -> Review -> Validated -> Certified -> Deprecated -> Removed |

### 2.3 API Error Catalog

| Field | Value |
| --- | --- |
| Name | API Error Catalog |
| Identifier | `api-error-catalog` |
| Description | Canonical error taxonomy for API contracts. |
| Owner | Platform API authority |
| Relations | Used by API Contract, Security Contract, Identity Contract. |
| Cycle of life | Draft -> Review -> Validated -> Certified -> Deprecated -> Removed |

### 2.4 API Versioning Policy

| Field | Value |
| --- | --- |
| Name | API Versioning Policy |
| Identifier | `api-versioning-policy` |
| Description | Contract-level policy governing major, minor, patch, compatibility, deprecation, and removal. |
| Owner | Platform API authority |
| Relations | Used by all API contracts. |
| Cycle of life | Draft -> Review -> Validated -> Certified -> Deprecated -> Removed |

### 2.5 API Consumer

| Field | Value |
| --- | --- |
| Name | API Consumer |
| Identifier | `api-consumer` |
| Description | Any human, service, or agent principal that reads from or writes to the API. |
| Owner | Identity authority |
| Relations | Depends on Identity Contract and Authorization rules. |
| Cycle of life | Registered -> Active -> Suspended -> Revoked |

### 2.6 API Producer

| Field | Value |
| --- | --- |
| Name | API Producer |
| Identifier | `api-producer` |
| Description | Any governed system or authority that exposes API behavior. |
| Owner | Platform API authority |
| Relations | Depends on Runtime, Security, and Governance contracts. |
| Cycle of life | Registered -> Active -> Suspended -> Revoked |

### 2.7 Canonical Principal

| Field | Value |
| --- | --- |
| Name | Canonical Principal |
| Identifier | `principal` |
| Description | The authenticated entity interacting with the API. |
| Owner | Identity authority |
| Relations | May map to human user, service account, or agent identity. |
| Cycle of life | Created -> Active -> Suspended -> Revoked |

### 2.8 Human User

| Field | Value |
| --- | --- |
| Name | Human User |
| Identifier | `human-user` |
| Description | A person interacting with the API under a governed identity. |
| Owner | Identity authority |
| Relations | May hold roles, scopes, and delegated permissions. |
| Cycle of life | Provisioned -> Active -> Suspended -> Deprovisioned |

### 2.9 Service Account

| Field | Value |
| --- | --- |
| Name | Service Account |
| Identifier | `service-account` |
| Description | A non-human principal used by integrations or automated services. |
| Owner | Identity and security authority |
| Relations | Must be isolated from human identity semantics. |
| Cycle of life | Provisioned -> Active -> Suspended -> Revoked |

### 2.10 Agent Identity

| Field | Value |
| --- | --- |
| Name | Agent Identity |
| Identifier | `agent-identity` |
| Description | A governed identity for an agent principal interacting with platform APIs. |
| Owner | Identity authority |
| Relations | May be linked to mission execution and audit records. |
| Cycle of life | Registered -> Active -> Suspended -> Revoked |

### 2.11 Tenant

| Field | Value |
| --- | --- |
| Name | Tenant |
| Identifier | `tenant` |
| Description | A hard isolation boundary for API access and data segregation. |
| Owner | Platform governance authority |
| Relations | Constrains identity, authorization, and persistence. |
| Cycle of life | Provisioned -> Active -> Suspended -> Retired |

### 2.12 Role

| Field | Value |
| --- | --- |
| Name | Role |
| Identifier | `role` |
| Description | A named authorization capability set. |
| Owner | Security authority |
| Relations | Attached to principals and policy decisions. |
| Cycle of life | Defined -> Active -> Deprecated -> Retired |

### 2.13 Permission

| Field | Value |
| --- | --- |
| Name | Permission |
| Identifier | `permission` |
| Description | A specific allowed action on a resource. |
| Owner | Security authority |
| Relations | Aggregated through roles or delegated policies. |
| Cycle of life | Defined -> Active -> Deprecated -> Retired |

### 2.14 Resource

| Field | Value |
| --- | --- |
| Name | Resource |
| Identifier | `resource` |
| Description | Any canonical API-addressable or API-governed platform object. |
| Owner | Platform API authority |
| Relations | May be nested, versioned, filtered, or audited. |
| Cycle of life | Defined -> Active -> Deprecated -> Removed |

### 2.15 Request

| Field | Value |
| --- | --- |
| Name | Request |
| Identifier | `request` |
| Description | An API invocation record representing one client intent. |
| Owner | Platform API authority |
| Relations | Bound to identity, authorization, and audit hooks. |
| Cycle of life | Created -> Processed -> Archived |

### 2.16 Response

| Field | Value |
| --- | --- |
| Name | Response |
| Identifier | `response` |
| Description | The canonical result of an API request. |
| Owner | Platform API authority |
| Relations | Must preserve correlation and status semantics. |
| Cycle of life | Created -> Delivered -> Archived |

### 2.17 Error

| Field | Value |
| --- | --- |
| Name | Error |
| Identifier | `error` |
| Description | A canonical failure, rejection, or conflict outcome. |
| Owner | Platform API authority |
| Relations | Tied to error catalog and response model. |
| Cycle of life | Raised -> Recorded -> Resolved or Retired |

### 2.18 Event

| Field | Value |
| --- | --- |
| Name | Event |
| Identifier | `event` |
| Description | A canonical audit or domain event associated with API activity. |
| Owner | Event authority |
| Relations | Linked to audit hooks, runtime, and resource changes. |
| Cycle of life | Emitted -> Persisted -> Replayed or Archived |

### 2.19 Webhook Subscription

| Field | Value |
| --- | --- |
| Name | Webhook Subscription |
| Identifier | `webhook-subscription` |
| Description | A governed callback registration for async notifications. |
| Owner | Platform API authority |
| Relations | Depends on event and security contracts. |
| Cycle of life | Created -> Active -> Suspended -> Deleted |

### 2.20 Long Running Operation

| Field | Value |
| --- | --- |
| Name | Long Running Operation |
| Identifier | `long-running-operation` |
| Description | A deferred operation that completes after initial API acceptance. |
| Owner | Platform API authority |
| Relations | Uses async status, correlation, and cancellation behavior. |
| Cycle of life | Started -> Pending -> Completed or Failed or Cancelled |

### 2.21 Batch Operation

| Field | Value |
| --- | --- |
| Name | Batch Operation |
| Identifier | `batch-operation` |
| Description | A grouped operation that applies to multiple resources or items. |
| Owner | Platform API authority |
| Relations | Must preserve per-item traceability and partial results. |
| Cycle of life | Created -> Processing -> Completed or Failed or Partially Completed |

### 2.22 Pagination Cursor

| Field | Value |
| --- | --- |
| Name | Pagination Cursor |
| Identifier | `pagination-cursor` |
| Description | A continuation token for deterministic traversal of collections. |
| Owner | Platform API authority |
| Relations | Used by collection resources and search results. |
| Cycle of life | Issued -> Valid -> Expired or Consumed |

### 2.23 API Scope

| Field | Value |
| --- | --- |
| Name | API Scope |
| Identifier | `api-scope` |
| Description | An authorization boundary applied to API access. |
| Owner | Security authority |
| Relations | Links principals, roles, tenants, and resources. |
| Cycle of life | Defined -> Active -> Deprecated -> Retired |

---

## 3. Resource Modeling Rules

1. Canonical resources must be stable across versions unless a major version break is approved.
2. Resource identifiers must not be reused for a different meaning.
3. A resource may be deprecated, but its historical identity must remain traceable.
4. A resource catalog item must not imply an endpoint implementation.
5. A resource lifecycle may differ from implementation lifecycle, but the contract must declare that difference.

---

## 4. Decision

GO.


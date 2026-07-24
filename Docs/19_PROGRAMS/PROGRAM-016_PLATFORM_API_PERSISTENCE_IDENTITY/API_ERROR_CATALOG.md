# API ERROR CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-005-API-CONTRACT

DATE : 2026-07-09

STATUS : OFFICIAL ERROR CATALOG

---

## 1. Purpose

Define the canonical API error model for NOVA.

This catalog is normative. It does not define transport-specific status code mappings beyond the contract boundary.

---

## 2. Error Structure

Every API error must expose the following logical fields:

- code
- category
- message
- cause
- recommended action
- correlation identifier where applicable
- resource reference where applicable
- version information where applicable

Rules:

1. Error codes must be canonical.
2. Error messages must be human-readable.
3. Error causes must be explicit.
4. Recommended actions must be provided when recovery is possible.
5. Errors must be machine-readable and auditable.

---

## 3. Categories

| Category | Meaning |
| --- | --- |
| Authentication | Identity could not be validated. |
| Authorization | Identity is valid but not permitted. |
| Validation | Request content or shape is invalid. |
| Conflict | Resource state or concurrency conflict exists. |
| Dependency | Required upstream dependency is missing or unavailable. |
| Concurrency | Parallel activity conflicts with resource integrity rules. |
| Rate Limit | Request volume exceeds the allowed policy. |
| Availability | Target service or resource is unavailable. |
| Lifecycle | Operation is not allowed in the current lifecycle state. |
| Deprecated | Requested behavior or resource is deprecated. |
| Internal | Unclassified internal failure. |

---

## 4. Canonical Errors

| Code | Category | Message | Cause | Recommended action |
| --- | --- | --- | --- | --- |
| `API-ERR-001` | Authentication | Authentication failed. | Missing, invalid, expired, or malformed identity proof. | Re-authenticate or renew credentials. |
| `API-ERR-002` | Authorization | Access denied. | Principal lacks required role, scope, tenant, or ownership rights. | Request the required permission or retry with an authorized principal. |
| `API-ERR-003` | Validation | Request validation failed. | Payload, shape, type, or required field constraint violation. | Correct the request and retry. |
| `API-ERR-004` | Conflict | Resource conflict detected. | A resource state prevents the requested operation. | Refresh state and retry only after the conflict is resolved. |
| `API-ERR-005` | Concurrency | Concurrent modification conflict. | Another operation holds or changed the protected resource. | Retry with the latest version or acquire the required lock. |
| `API-ERR-006` | Dependency | Required dependency missing. | Upstream dependency or prerequisite is absent. | Resolve the dependency and retry. |
| `API-ERR-007` | Dependency | Required dependency unavailable. | Upstream dependency is unreachable, delayed, or invalidated. | Wait, re-evaluate dependency status, or escalate. |
| `API-ERR-008` | Rate Limit | Rate limit exceeded. | Client has exceeded allowed request volume. | Back off and retry after the indicated window. |
| `API-ERR-009` | Availability | Service unavailable. | Target service or resource cannot currently serve the request. | Retry later or escalate if the condition persists. |
| `API-ERR-010` | Lifecycle | Operation not allowed in current state. | The resource lifecycle does not permit the requested action. | Transition the resource to an allowed state first. |
| `API-ERR-011` | Lifecycle | Resource deprecated. | Requested resource or behavior is deprecated. | Migrate to the replacement contract or version. |
| `API-ERR-012` | Conflict | Idempotency conflict. | The same idempotency key is associated with a different logical request. | Use a new idempotency key and verify request intent. |
| `API-ERR-013` | Internal | Internal error. | Unclassified server-side failure. | Retry if appropriate; escalate if persistent. |
| `API-ERR-014` | Validation | Pagination cursor invalid. | Cursor is malformed, expired, or incompatible. | Restart pagination from a fresh query. |
| `API-ERR-015` | Validation | Filter not supported. | Filter dimension or operator is not declared by the contract. | Remove unsupported filters or use supported query dimensions. |
| `API-ERR-016` | Validation | Sort not supported. | Sort key or order is not declared by the contract. | Use a declared sort key or remove sorting. |
| `API-ERR-017` | Dependency | Webhook delivery failed. | Subscriber endpoint cannot be reached or rejected the callback. | Retry delivery or re-register the subscription. |
| `API-ERR-018` | Concurrency | Conditional request failed. | ETag, version, or precondition did not match current state. | Refresh the resource and retry. |
| `API-ERR-019` | Authentication | Principal not recognized. | The identity source did not resolve to a canonical principal. | Re-authenticate or correct the identity provider mapping. |
| `API-ERR-020` | Authorization | Scope violation. | The requested scope exceeds what the principal is allowed to access. | Reduce scope or request delegated access. |

---

## 5. Error Messages

Rules:

1. Messages must be concise and deterministic.
2. Messages must not expose secrets.
3. Messages must not leak unrelated internal details.
4. Messages must not replace the code or category.
5. Messages may be localized, but the canonical code must remain stable.

---

## 6. Cause Rules

Each error cause must state the reason for failure in a way that supports recovery, audit, or escalation.

Cause rules:

1. Causes must be factual.
2. Causes must be specific enough to guide remediation.
3. Causes must not be speculative.
4. Causes must not hide lifecycle or authorization issues behind generic failure wording.

---

## 7. Recommended Action Rules

Recommended actions are required when the error is recoverable.

Rules:

1. Recommended actions must be realistic.
2. Recommended actions must not imply unauthorized behavior.
3. Recommended actions must respect the contract lifecycle.
4. Recommended actions must not replace governance decisions where governance is required.

---

## 8. Structural Rules

1. Error codes must be stable across versions unless a breaking change is approved.
2. Error categories may expand, but existing categories must remain understandable.
3. A deprecated error must remain traceable until all certified dependents are migrated.
4. The error catalog must remain compatible with API contracts, identity contracts, and security contracts.

---

## 9. Compatibility

1. Error codes must remain transport-neutral.
2. HTTP, gRPC, GraphQL, and other transports may map to the canonical errors, but they must not redefine them.
3. The same logical error must not have conflicting canonical meanings across transport bindings.

---

## 10. Decision

GO.


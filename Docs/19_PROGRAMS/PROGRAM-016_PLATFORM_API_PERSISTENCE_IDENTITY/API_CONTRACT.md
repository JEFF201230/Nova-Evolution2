# API CONTRACT

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-005-API-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION CONTRACT

CLASSIFICATION : API CONTRACT

---

## 1. Purpose

This contract defines the official API standard for NOVA platform surfaces.

Its purpose is to specify the rules governing resources, interfaces, requests, responses, errors, versioning, security hooks, lifecycle rules, compatibility, and certification for all future NOVA API contracts.

This contract is normative. It does not define implementation, code, transport internals, or business-specific endpoints.

---

## 2. Scope

This contract applies to all NOVA API surfaces that expose or consume platform resources, including:

- public API surfaces
- internal API surfaces
- versioned API contracts
- synchronous operations
- asynchronous operations
- long-running operations
- batch operations
- event-aware API interactions

It is transport-independent and language-independent.

It is compatible with REST and extensible toward gRPC and GraphQL.

It does not define domain business logic or endpoint catalogs for specific product features.

---

## 3. Canonical Definitions

| Term | Definition |
| --- | --- |
| API Contract | A normative specification of API behavior, interfaces, constraints, and certification rules. |
| Resource | A canonical addressable or addressable-by-rule platform object. |
| Request Model | The canonical structure used to submit a read or write operation. |
| Response Model | The canonical structure used to return data, status, and metadata. |
| Error Model | The canonical structure used to represent failure, rejection, or partial completion. |
| Idempotency | The property that repeating the same logical request produces the same intended effect. |
| Concurrency | The behavior of competing operations against the same resource or scope. |
| Audit Hook | A required trace point for sensitive or state-changing operations. |
| Event Hook | A required integration point where API actions produce or consume canonical events. |
| Webhook | A contract-driven callback mechanism for asynchronous notifications. |

---

## 4. API Philosophy

1. Contract before implementation.
2. Resource before endpoint detail.
3. Explicitness before convenience.
4. Stable names before optimization.
5. Read and write operations must remain distinct.
6. API behavior must be deterministic where possible.
7. Sensitive operations must be auditable.
8. Identity and authorization must be explicit, not inferred.
9. API design must preserve baseline traceability.
10. API contracts must remain compatible across programs unless a version break is declared.

---

## 5. Versioning Strategy

The API contract versioning strategy is:

- Major version for breaking semantic change.
- Minor version for backward-compatible expansion.
- Patch version for clarification or non-breaking correction.

Rules:

1. Version identifiers must be explicit.
2. A version change must be recorded in the contract change log.
3. Certified versions must remain referenceable.
4. Deprecation must be versioned.
5. Removal must only occur after deprecation and migration closure.

---

## 6. Resource Model

The API is resource-oriented.

Rules:

1. Resources must have canonical names.
2. Resources must have stable identifiers.
3. Resources must declare their owner and lifecycle.
4. Resources may be nested only when the relationship is canonical.
5. Resource naming must remain transport-neutral.
6. Resource semantics must not depend on URI shape alone.

---

## 7. URI Standards

URI standards are normative patterns, not endpoint catalogs.

Rules:

1. Resource URIs must be stable.
2. Versioned API surfaces must expose version in the URI or in an equivalent explicit contract boundary.
3. Collection and singular resource forms must be deterministic.
4. Hierarchical URIs may express ownership or containment only when canonical.
5. Query parameters must be used for filters, sort, search, pagination, and projections, not for hidden behavior.
6. URI patterns must not encode business logic that belongs in the resource model.

---

## 8. HTTP Method Rules

Where REST is used:

- `GET` for safe retrieval.
- `POST` for creation, action, or non-idempotent command semantics.
- `PUT` for full replacement when explicitly allowed.
- `PATCH` for partial update when explicitly allowed.
- `DELETE` for removal or deprecation action when explicitly allowed.

Rules:

1. Unsafe operations must be explicit.
2. Safe operations must not mutate state.
3. Method semantics must not be overloaded silently.
4. A method must not bypass authorization, auditing, or validation.

---

## 9. Request Model

The request model must support:

- identity context
- authorization context
- resource target
- operation intent
- payload
- correlation identifier
- idempotency identifier where required
- tenant or scope identifier where required
- conditional concurrency fields where required

Rules:

1. Requests must be explicit about target and intent.
2. Requests must validate structure before business evaluation.
3. Requests must carry correlation data for sensitive or tracked operations.
4. Requests must not depend on hidden server state.

---

## 10. Response Model

The response model must support:

- data
- metadata
- correlation identifier
- version information
- status information
- warnings where applicable
- errors where applicable
- pagination metadata where applicable

Rules:

1. Responses must be deterministic and structured.
2. Responses must distinguish successful completion from acceptance for later processing.
3. Responses must preserve correlation and traceability.
4. Responses must not conceal partial completion or deferred work.

---

## 11. Error Model

The API error model must:

- be canonical
- be structured
- be machine-readable
- be stable across versions where possible
- distinguish validation, authorization, conflict, dependency, availability, and internal failure

Rules:

1. Every error must have a code.
2. Every error code must have a category.
3. Every error must have a human-readable message.
4. Every error must declare a cause.
5. Every error must recommend an action when recovery is possible.
6. Error handling must not depend on free-form text alone.

---

## 12. Pagination

Pagination is required for collection resources that may grow unbounded.

Rules:

1. Pagination must be explicit.
2. Pagination must be stable enough for deterministic iteration.
3. Cursor-based pagination is preferred for mutable collections.
4. Offset-based pagination may be used only when its limitations are declared.
5. Pagination metadata must expose enough information to continue traversal safely.

---

## 13. Filtering

Filtering must be explicit and safe.

Rules:

1. Filters must only apply to declared resource fields or declared query dimensions.
2. Filter semantics must be documented.
3. Filter results must be deterministic for a given dataset state.
4. Filter parameters must not mutate resource state.

---

## 14. Sorting

Sorting must be explicit and deterministic when possible.

Rules:

1. Sort keys must be declared.
2. Sort order must be explicit.
3. Stable sort behavior should be preferred for pageable results.
4. Default sort behavior must be documented.

---

## 15. Searching

Searching is distinct from filtering.

Rules:

1. Search semantics must be declared.
2. Search scope must be explicit.
3. Search indexes are implementation concerns and must not be required for contract validity.
4. Search results must preserve traceability to source resources.

---

## 16. Idempotency

Idempotency is required for any operation that could be retried safely.

Rules:

1. Idempotency keys must be supported where retry risk exists.
2. A repeated idempotent request must not create duplicate side effects.
3. Idempotency windows must be documented.
4. Idempotent behavior must be stable across versions unless explicitly broken.

---

## 17. Concurrency

Concurrency rules must protect resource integrity.

Rules:

1. Concurrent writes to the same protected resource must be controlled.
2. Optimistic or pessimistic concurrency semantics must be declared.
3. Conflict detection must be explicit.
4. Lost updates must be preventable or detectable.
5. Concurrency behavior must preserve auditability.

---

## 18. Rate Limiting

Rate limiting is required where abuse, overload, or fairness risk exists.

Rules:

1. Rate limit policy must be declared.
2. Rate limit exceedance must be predictable and machine-readable.
3. Retry guidance must be explicit when available.
4. Rate limiting must not silently corrupt responses or state.

---

## 19. Authentication Hooks

The API must expose authentication hooks, not hidden authentication assumptions.

Hooks may include:

- bearer token validation
- session validation
- service principal validation
- identity provider delegation

Rules:

1. Authentication must be explicit.
2. Authentication mechanism choice must be contract-visible.
3. Authentication failures must be distinguishable from authorization failures.
4. Authentication must preserve audit traceability.

---

## 20. Authorization Hooks

The API must expose authorization hooks.

Hooks may include:

- role checks
- scope checks
- tenant checks
- resource ownership checks
- delegated authority checks

Rules:

1. Authorization must be explicit.
2. Authorization must be resource- and action-aware.
3. Authorization failures must be machine-readable.
4. Authorization must not be inferred from implementation context alone.

---

## 21. Audit Hooks

Audit hooks are mandatory for sensitive operations.

Rules:

1. Mutations that affect state, security, identity, or durable records must be auditable.
2. Audit records must preserve correlation identifiers.
3. Audit hooks must not expose secrets.
4. Audit hooks must not be optional where governance requires traceability.

---

## 22. Event Hooks

Event hooks define how API operations integrate with canonical events.

Rules:

1. State-changing API actions must expose event linkage.
2. Event publication must be traceable to the triggering request.
3. Event hooks must not create hidden side effects.
4. Event semantics must be compatible with the event contract standard.

---

## 23. Webhooks

Webhooks are allowed as an asynchronous notification mechanism.

Rules:

1. Webhooks must be versioned and signed where security requires it.
2. Webhooks must declare payload schema, retry behavior, and delivery expectations.
3. Webhook delivery failures must be observable.
4. Webhooks must not be the only source of truth for critical state.

---

## 24. Long Running Operations

Long running operations must be modeled explicitly.

Rules:

1. Deferred completion must be visible to the caller.
2. Operation status must be retrievable.
3. Correlation identifiers must link initiation and completion.
4. Timeouts, retries, and cancellation rules must be declared.

---

## 25. Async Operations

Asynchronous operations may be used when immediate completion is not appropriate.

Rules:

1. Async acceptance must be explicit.
2. Async completion must be observable.
3. Async failure must be traceable.
4. Async operations must not hide final semantics.

---

## 26. Batch Operations

Batch operations are allowed when the contract declares their semantics.

Rules:

1. Batch boundaries must be explicit.
2. Partial success must be representable.
3. Failure isolation must be declared.
4. Batch operations must preserve traceability per item.

---

## 27. Compatibility Rules

1. The API contract must remain baseline-compatible with certified NOVA documents.
2. The API contract must remain compatible with the Contract-Driven Development standard.
3. Backward compatibility must be explicit.
4. Breaking changes require major versioning.
5. Related contracts must use the same canonical definitions where possible.
6. Compatibility with future programs must be achieved through stable resource semantics, not hidden assumptions.
7. PROGRAM-017 to PROGRAM-032 compatibility must be preserved by keeping the contract transport-neutral, resource-oriented, and versioned.

---

## 28. Deprecation Rules

1. A resource, method, or behavior may be deprecated only with a versioned notice.
2. Deprecation must identify the replacement or retirement path.
3. Deprecated elements must remain functional during the declared transition window unless a breaking security issue requires immediate removal.
4. Deprecation notices must be discoverable in the contract.

---

## 29. Extension Rules

1. Extension must preserve canonical semantics.
2. Extension must not silently change existing meaning.
3. Extension must be versioned.
4. Extension must not break certified consumers without a major version.
5. Extension points must remain transport-neutral and framework-neutral.

---

## 30. Security Requirements

The API must provide:

- authenticated access
- explicit authorization
- tenant and scope isolation
- traceable sensitive operations
- protection against unauthorized mutation
- protection against replay where applicable
- controlled disclosure of resource data
- secure handling of secrets and credentials

The API must not:

- infer identity silently
- expose secrets in responses or error messages
- bypass governance controls
- leak cross-tenant data
- allow undocumented privilege escalation

---

## 31. Certification Criteria

The API contract is certifiable only if:

- it follows the CDD standard and template;
- it declares canonical definitions;
- it defines resource and URI standards;
- it defines request and response models;
- it defines the error model;
- it defines pagination, filtering, sorting, and search rules;
- it defines idempotency and concurrency rules;
- it defines rate limiting;
- it defines authentication and authorization hooks;
- it defines audit and event hooks;
- it defines webhook and async behaviors;
- it defines compatibility, deprecation, and extension rules;
- it defines security requirements;
- it does not contradict certified baseline documents.

---

## 32. Decision

CERTIFIED.

---

## 33. Normative OpenAPI Specification Requirements

Each resource defined in `API_RESOURCE_CATALOG.md` must be accompanied by a normative OpenAPI 3.1 specification that fully describes its canonical API surface.

Requirements:

1. Each resource must have one canonical endpoint or endpoint set.
2. Each resource must declare the HTTP methods that are authorized for that resource.
3. Each resource must declare request schemas and response schemas.
4. Each resource must declare canonical error codes and error response shapes.
5. Each resource must declare authentication requirements and authentication schemes.
6. Each resource specification must be expressed as valid OpenAPI 3.1 normative documentation.
7. The OpenAPI specification must remain consistent with the API Contract, the API Resource Catalog, the API Error Catalog, the Identity Contract, the Security Contract, the RBAC Contract, and the certified NOVA baseline.
8. The OpenAPI specification must not introduce behavior outside the authorized contract scope.
9. The OpenAPI specification must preserve versioning, compatibility, and governance rules from this contract.
10. The OpenAPI specification must be sufficient for a future PDS to produce implementation-grade OpenAPI artifacts without ambiguity.

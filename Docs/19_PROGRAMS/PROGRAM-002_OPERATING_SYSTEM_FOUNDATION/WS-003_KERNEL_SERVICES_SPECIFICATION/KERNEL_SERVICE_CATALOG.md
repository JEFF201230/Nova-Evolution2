# Kernel Service Catalog

Program ID: PROGRAM-002

Workstream ID: WS-003

Mission ID: WS-003-KERNEL-SPECIFICATION-BATCH-001

Document Type: ENGINEERING SPECIFICATION

Status: FINAL

Date: 2026-07-03

---

## 1. Purpose

This document defines the official WS-003 catalog of NOVA Kernel services.

The catalog is constrained by NOVA_KERNEL_DOCTRINE.md and by the WS-001 / WS-002 boundary corpus.

It does not create Kernel primitives.

It does not modify Kernel Doctrine.

It does not define code, implementation APIs, classes, technologies, database schemas, deployment, or runtime implementation.

---

## 2. Catalog Authority

The Kernel service catalog is closed by doctrine.

The Kernel is responsible only for:

1. Runtime
2. Scheduler
3. Configuration
4. Dependency Injection
5. Messaging
6. Persistence
7. Storage
8. Logging
9. Resource Management
10. Clock
11. Lifecycle

No other service is added by WS-003.

Any future addition to this list requires separate Kernel governance and architecture validation.

---

## 3. Service Definition Rule

A Kernel service is a generic primitive support domain that:

- is product-independent;
- is business-agnostic;
- supports the Operating System without knowing Operating System semantics;
- does not depend on Platform, Product, Application, VEEDDA, mission, workflow, agent, decision, workspace, or simulation concepts;
- can be specified without implementation, technology, APIs, classes, or storage design.

If a capability requires mission meaning, agent responsibility, Platform exposure, product business logic, security policy, observability behavior, administration, marketplace, SDK, API, or VEEDDA context, it is not a Kernel service.

---

## 4. Official Kernel Service Catalog

| Service | Kernel Responsibility | Operating System Use | Non-Ownership Boundary |
| --- | --- | --- | --- |
| Runtime | Generic execution substrate for Kernel-supported operation. | OS may rely on generic execution support. | Does not own Mission Runtime, Agent Runtime, Workspace Runtime, product runtime, or runtime implementation technology. |
| Scheduler | Generic scheduling primitive support. | OS may rely on scheduling support for governed execution needs. | Does not own workflow meaning, mission priorities, product scheduling, or UI scheduling. |
| Configuration | Generic configuration primitive support. | OS may rely on configuration values needed for controlled execution. | Does not own product configuration, Platform administration, secrets policy, or business rules. |
| Dependency Injection | Generic dependency composition support. | OS may rely on composition support without exposing implementation. | Does not define classes, constructors, containers, APIs, modules, or technology. |
| Messaging | Generic message exchange primitive support. | OS may rely on communication support between governed concepts. | Does not own Event Engine semantics, workflow events, product events, transport technology, or API contracts. |
| Persistence | Generic durable state primitive support. | OS may rely on durability support for evidence and state needs. | Does not define database schema, product data, memory source of truth, or storage implementation. |
| Storage | Generic storage primitive support. | OS may rely on storage support for documents, evidence, and state artefacts when later authorized. | Does not define file layout, database design, product storage, or workspace UI. |
| Logging | Generic execution record support. | OS may rely on logging support for traceability evidence. | Does not own observability, analytics, report semantics, certification decisions, or Platform monitoring. |
| Resource Management | Generic resource constraint support. | OS may rely on bounded resource use during execution. | Does not own product capacity planning, Platform administration, or infrastructure technology. |
| Clock | Generic time reference support. | OS may rely on time support for transitions, evidence, and ordering. | Does not own product calendar semantics, timezone policy, or scheduling business rules. |
| Lifecycle | Generic lifecycle primitive support. | OS may rely on lifecycle support for state handling. | Does not own mission lifecycle semantics, workflow state model, certification state, or Workstream closure. |

---

## 5. Non-Service Boundary Catalog

The following are explicitly not Kernel services under WS-003:

| Capability | Owning Layer Or Scope | Boundary Statement |
| --- | --- | --- |
| Mission Engine | Operating System | Kernel must not know mission semantics. |
| Workflow Engine | Operating System | Kernel must not know workflow meaning. |
| Agent Engine | Operating System | Kernel must not own agent governance or identity. |
| Executive Engine | Operating System | Kernel must not make or prepare authority decisions. |
| Memory Engine | Operating System | Kernel does not define memory meaning or source-of-truth rules. |
| Context Engine | Operating System | Kernel does not own execution context semantics. |
| Rule Engine | Operating System | Kernel does not interpret doctrine or rules. |
| Event Engine | Operating System | Kernel Messaging, Clock, Logging, and Lifecycle may support event evidence, but Kernel does not interpret events. |
| Simulation Engine | Operating System | Kernel does not define simulation behavior. |
| Security | Platform | Kernel does not own security policy, authentication, authorization, administration, or exposure security. |
| Observability | Platform | Kernel Logging is primitive support only; Platform owns observability capability. |
| API | Platform | Kernel defines no API contracts. |
| SDK | Platform | Kernel defines no SDK. |
| Marketplace | Platform | Kernel does not host marketplace concerns. |
| Product business logic | Products | Kernel never contains business behavior. |

---

## 6. Service Readiness Criteria

A Kernel service is considered specification-ready when:

- its purpose is generic;
- its OS-facing expectation is documented;
- its boundary exclusions are explicit;
- it does not redefine Kernel Doctrine;
- it does not introduce implementation artefacts;
- it is traceable to authorized WS-003 references;
- it has no unresolved boundary contradiction.

---

## 7. References

- PROGRAM_002_WORKSTREAMS.md
- WS_001_ARCHIVE_INDEX.md
- OS_FOUNDATION_ARCHITECTURE.md
- OS_FOUNDATION_COMPONENT_MODEL.md
- OS_FOUNDATION_BOUNDARIES.md
- OS_FOUNDATION_PRINCIPLES.md
- OPERATING_SYSTEM_EXECUTION_SPECIFICATION.md
- MISSION_AND_WORKFLOW_STATE_MODEL_SPECIFICATION.md
- DECISION_AND_REPORTING_FLOW_SPECIFICATION.md
- TRACEABILITY_MODEL_SPECIFICATION.md
- NOVA_KERNEL_DOCTRINE.md


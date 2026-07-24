# NOVA Kernel Baseline v1.0

Program ID: PROGRAM-002

Program Name: Operating System Foundation

Mission ID: KERNEL-FREEZE-001

Document Type: ARCHITECTURE BASELINE

Baseline ID: NOVA_KERNEL_BASELINE_v1.0

Baseline Status: APPROVED

Date: 2026-07-04

---

## 1. Purpose

This document establishes NOVA Kernel Baseline v1.0.

It freezes the certified WS-003 Kernel Services Specification corpus as the canonical Kernel architecture baseline for downstream PROGRAM-002 Workstreams.

This document does not create new architecture.

This document does not create new specifications.

This document does not modify doctrine, rules, agents, WS-001, WS-002, WS-003, PROGRAM-002 source documents, or archives.

---

## 2. Baseline Decision

Decision:

KERNEL BASELINE APPROVED

Decision authority:

- Architecture Review Board
- Kernel Engineering Design Squad
- Certification Board

Decision basis:

- WS-003 Review decision: GO
- WS-003 Certification decision: GO
- WS-003 Capitalization status: FINAL
- Kernel service catalog restricted to the eleven NOVA_KERNEL_DOCTRINE.md services
- no contradiction detected against WS-001
- no contradiction detected against WS-002
- no contradiction detected against NOVA_KERNEL_DOCTRINE.md

---

## 3. Baseline Scope

NOVA Kernel Baseline v1.0 freezes:

- the official Kernel service catalog;
- Kernel service responsibilities;
- Kernel service dependency model;
- Kernel boundaries;
- Kernel bootstrap readiness boundary;
- Kernel security boundary foundation;
- Kernel configuration model;
- Kernel event support boundary;
- downstream conformance obligations for WS-004 through WS-007.

It does not freeze:

- implementation;
- code;
- implementation APIs;
- classes;
- modules;
- schemas;
- protocols;
- deployment topology;
- technologies;
- Platform security implementation;
- Operating System Event Engine semantics;
- Mission Runtime implementation;
- Agent Runtime implementation;
- Workspace Runtime implementation;
- Product behavior.

---

## 4. Baseline Corpus

The following WS-003 deliverables form NOVA Kernel Baseline v1.0:

| Baseline Component | SHA-256 |
| --- | --- |
| KERNEL_SERVICE_CATALOG.md | BC13B56363B4A27EA4853B07CD66CAA6BF6334A07CF193514EB4E58BC6692D39 |
| KERNEL_SERVICE_SPECIFICATIONS.md | DF719D78468E33E47E3B6D2FBA6A19406265D0E3E43185F1DEAB5B3F4980CD81 |
| KERNEL_SERVICE_DEPENDENCY_MODEL.md | 2E3A6BFAD406B0A5948EE7A38E66DE3BE808EE1F946396B72BE6D5F01988BAE0 |
| KERNEL_BOUNDARY_SPECIFICATION.md | 0BD9862C60D312513B34F46791CF7348DE5B6E35F98D878910ACDF03E14F5574 |
| KERNEL_BOOTSTRAP_SPECIFICATION.md | D2AE70DB315076B70C8B54FF531218D37D28756C01FAB9A8C9ADD7179F5F7A41 |
| KERNEL_SECURITY_FOUNDATION.md | 27CE3FB338A59974B71D2D64D49118F227534D7C61D20CBD7EF1381FD6D94839 |
| KERNEL_CONFIGURATION_MODEL.md | 55733BF627F90F98F1D368B9146763BEE14701252CF878A094D6FFA8BF2F2B9F |
| KERNEL_EVENT_MODEL.md | A9A0FFAD305CF1B4E89FD07559B0BE6460890D77967B740D5CA8CB608D475177 |

Baseline evidence:

| Evidence Document | SHA-256 |
| --- | --- |
| WS_003_REVIEW_REPORT.md | 25AEE956FCC21E072D411A62579B6B38934BFA3ED155DBF2C5765B367A0A3895 |
| WS_003_CERTIFICATION_REPORT.md | 1B0AB98F430AE0E5283788F54E6721C2124BA05D4F16843D019A859EC45FE0CC |
| WS_003_CAPITALIZATION_REPORT.md | DECF8B8B4E575331F95A744D82766D0BB7DB8AE49D5272DB59E8A3981A005B1B |

---

## 5. Kernel Service Baseline

The baseline Kernel service catalog is closed.

The official Kernel services are:

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

No twelfth Kernel service is included in v1.0.

Any addition, removal, rename, or responsibility change requires a formal architecture decision.

---

## 6. Certified Boundary Statements

The following boundary statements are frozen as baseline controls:

| Boundary | Baseline Statement |
| --- | --- |
| Kernel | Owns only minimal, stable, generic primitives listed in the service catalog. |
| Operating System | Owns missions, workflows, agent coordination, decisions, rules, events, lifecycle semantics, workspace, traceability, and certification readiness. |
| Platform | Owns Security, Observability, Administration, API, SDK, Marketplace, and exposure concerns. |
| Products | Own business logic, product workflows, product data semantics, product UX, and product-specific rules. |
| Event | Event Engine is Operating System scope; Kernel may only provide generic support through existing primitives. |
| Security | Security is Platform scope; Kernel Security Foundation is a boundary compatibility document, not a Kernel service. |
| Bootstrap | Bootstrap is readiness ordering over existing Kernel primitives, not a Kernel service. |
| Configuration | Kernel Configuration is generic primitive support, not secrets policy, product settings, or administration. |
| Lifecycle | Kernel Lifecycle is primitive support and does not redefine mission states, workflow states, Workstream closure, or certification states. |

---

## 7. Downstream Conformance

WS-004 through WS-007 must conform to NOVA Kernel Baseline v1.0.

### WS-004 - Lifecycle Specification

WS-004 must use Kernel Lifecycle only as primitive support.

WS-004 must not redefine Kernel Lifecycle or add Kernel primitives.

### WS-005 - Agent Runtime Specification

WS-005 must use Kernel services only as generic support for Operating System Agent Runtime responsibilities.

WS-005 must not move agent identity, responsibility, capability, permission, or orchestration semantics into Kernel.

### WS-006 - Mission Runtime Specification

WS-006 must use Kernel Runtime, Scheduler, Clock, Logging, Messaging, Persistence, Storage, Resource Management, Configuration, Dependency Injection, and Lifecycle only as primitive support.

WS-006 must not treat Kernel Runtime as Mission Runtime.

### WS-007 - Workspace Runtime

WS-007 must use Kernel Storage, Persistence, Logging, Clock, Configuration, Resource Management, and Lifecycle only as primitive support.

WS-007 must not turn Kernel Storage or Persistence into workspace UI, database schema, product document model, or Platform administration.

---

## 8. Evolution Control

NOVA Kernel Baseline v1.0 may evolve only through a formal architecture decision.

A formal decision is required for:

- adding a Kernel primitive;
- removing a Kernel primitive;
- renaming a Kernel primitive;
- changing Kernel service responsibility;
- moving Security into Kernel;
- moving Event Engine into Kernel;
- making Bootstrap a Kernel service;
- making Kernel aware of missions, workflows, agents, decisions, workspaces, products, Platform exposure, or VEEDDA;
- modifying NOVA_KERNEL_DOCTRINE.md;
- contradicting certified WS-003 boundaries.

Any such change must produce Decision Report evidence before execution continues.

---

## 9. Certification Statement

NOVA Kernel Baseline v1.0 is approved.

The certified WS-003 corpus becomes the canonical Kernel baseline for PROGRAM-002.

Downstream Workstreams WS-004 through WS-007 must treat this baseline as mandatory architecture reference.

The baseline is stable until modified by formal architecture decision.

---

## 10. References

Reference evidence used for certification:

| Reference | SHA-256 |
| --- | --- |
| OS_FOUNDATION_ARCHITECTURE.md | D4026FB9F48961DF42470ADEB66A87C637A0FC41BF5E2910D1B439FABAF70C84 |
| OS_FOUNDATION_COMPONENT_MODEL.md | 6113DE9B63F36D6D0D5C56CB5F88D6BADC56CCEA25E6E06BFA2867C7B222E343 |
| OS_FOUNDATION_BOUNDARIES.md | 98FDE878BBE48A21A2819AB428EEFCC3242C7C4EB17EE2B0F86824F97B73B32A |
| OS_FOUNDATION_PRINCIPLES.md | 5319E1316748E2E898FEF7F4EADC3EE48900BA2141021DBD794716F38DC649DA |
| OPERATING_SYSTEM_EXECUTION_SPECIFICATION.md | 1C0167194D4937115EDEC6442B1B1002DC605EFA04C59EFCF95FF7C637FD6468 |
| MISSION_AND_WORKFLOW_STATE_MODEL_SPECIFICATION.md | 53ABCF6D92F4DA109DBFF5EA9CB4B11669A59A9AFE6BC2DD5BF2CFD695C08237 |
| DECISION_AND_REPORTING_FLOW_SPECIFICATION.md | D864DF0509E8D26C9EF5050D6FE5915712DCA8CECE9556967D56C5632B2D60C1 |
| TRACEABILITY_MODEL_SPECIFICATION.md | E44F16FD4DAF31559F36173D339DD7376A9DB89BE07A153625222EEA4D6A6BB6 |
| NOVA_KERNEL_DOCTRINE.md | D99336DFB0C823AC237499836F2C29382F90E4D4E3852D7A3F5CE2F4791AF565 |


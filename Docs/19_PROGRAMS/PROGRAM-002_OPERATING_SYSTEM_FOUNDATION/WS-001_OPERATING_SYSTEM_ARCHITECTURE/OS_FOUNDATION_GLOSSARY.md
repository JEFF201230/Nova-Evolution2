# OS Foundation Glossary

Program ID: PROGRAM-002

Workstream ID: WS-001

Mission ID: WS-001-DESIGN-001

Document Type: CONCEPTUAL GLOSSARY

Status: DRAFT FOR WS-001 CERTIFICATION

Date: 2026-07-03

---

## 1. Purpose

This glossary defines terms used by the conceptual architecture corpus of the NOVA Operating System Foundation.

It does not create implementation terminology.

It does not define APIs, classes, technologies, or runtime internals.

---

## 2. Terms

### Agent Coordination

The Operating System responsibility for assigning, sequencing, and tracing agent participation in missions without changing agent identity or responsibility.

### Application

A business-facing layer above Platform. Applications contain product or domain capabilities and must not be placed in Kernel or Operating System Foundation.

### Architecture Boundary

A conceptual limit that prevents responsibility from moving to the wrong NOVA layer.

### Certification Evidence

Traceable facts used to support a GO or NO GO recommendation.

### Context

The explicit mission, document, decision, rule, and evidence situation required before action.

### Decision

A governance or architecture matter requiring explicit authority. Decisions must be traceable and escalated when beyond delegated authority.

### Decision Report

The official artefact used to isolate and escalate matters requiring architecture or Executive decision.

### Event

A meaningful execution fact or transition that supports traceability. This glossary does not define event technology.

### Host

The underlying environment below Kernel. This corpus does not define Host implementation.

### Kernel

The minimal, stable, generic primitive layer used by the Operating System. Kernel has no product knowledge and no business logic.

### Kernel Primitive

A generic Kernel responsibility such as Runtime, Scheduler, Configuration, Dependency Injection, Messaging, Persistence, Storage, Logging, Resource Management, Clock, or Lifecycle.

### Lifecycle

The governed status progression of missions, workflows, decisions, evidence, reports, and archives.

### Memory

Reusable knowledge used to enrich reasoning. Memory does not replace reasoning, decision authority, or evidence.

### Mission

A bounded execution unit authorized by a Mission Order and reported through an Execution Report.

### Mission Order

The official instruction that authorizes bounded execution.

### Operating System

The NOVA layer responsible for missions, agents, workflows, decisions, context, memory, rules, events, simulations, lifecycle, workspace state, traceability, and certification readiness.

### Operating System Foundation

The conceptual foundation of the Operating System layer created by PROGRAM-002. It defines responsibilities, boundaries, principles, and conceptual ownership before implementation.

### Platform

The NOVA layer responsible for plugin management, API exposure, SDK exposure, security, observability, administration, and marketplace responsibilities.

### Product

A business-facing system connected to NOVA through Platform boundaries. Products own business logic and product-specific behavior.

### Rule

A formally active constraint applied during execution. Rules must not be invented silently inside execution documents.

### Simulation

A decision-support activity that explores possible outcomes. A simulation is not a decision.

### Traceability

The ability to connect missions, actions, decisions, events, documents, evidence, reports, certifications, and archives.

### Workstream

A controlled subdivision of a Program. A Workstream opens through its own charter and executes through Mission Orders.

### Workspace

The conceptual context container for mission evidence, document relations, decisions, and execution state. This glossary does not define user interface or storage implementation.

---

## 3. Reserved Non-Definitions

The following are intentionally not defined here:

- API contracts;
- classes;
- technical services;
- implementation modules;
- database schemas;
- deployment topology;
- UI layouts;
- product workflows;
- VEEDDA business rules.

---

## 4. References

- OS_FOUNDATION_ARCHITECTURE.md
- OS_FOUNDATION_COMPONENT_MODEL.md
- OS_FOUNDATION_BOUNDARIES.md
- OS_FOUNDATION_PRINCIPLES.md
- Docs/00_FOUNDATION/NOVA_KERNEL_DOCTRINE.md
- Docs/00_FOUNDATION/NOVA_PRODUCT_CHARTER.md
- Docs/00_FOUNDATION/NOVA_GUIDING_PRINCIPLES.md

---

End of document.

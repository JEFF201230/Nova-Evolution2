# PROGRAM-002 Architecture Gap Analysis

Program ID: PROGRAM-002

Mission Program Label: NOVA Enterprise Architecture

Canonical Program Folder: PROGRAM-002_OPERATING_SYSTEM_FOUNDATION

Authority: Architecture Review Board

Document Type: ARCHITECTURE GAP ANALYSIS

Status: FINAL

Date: 2026-07-03

---

## 1. Purpose

This document identifies the true architecture gaps that remain before development can start.

It is based on the existing corpus and on PROGRAM_002_ARCHITECTURE_COVERAGE_AUDIT.md.

This document does not create architecture.

It does not modify any existing document.

It does not propose duplicating existing WS-001 or foundation artefacts.

---

## 2. Gap Classification Rules

A true gap exists only when:

- the existing corpus does not already cover the need sufficiently;
- the missing element is required before development or implementation work;
- the missing element is not merely a different title for an existing document;
- the missing element can be produced without rewriting doctrine or duplicating WS-001.

A non-gap exists when:

- the existing corpus already covers the need;
- a later Workstream is already designated to produce the missing detail;
- the requested artefact would duplicate an existing document;
- the need belongs outside PROGRAM-002 authority.

---

## 3. Non-Gaps

The following must not be recreated:

| Non-Gap | Existing Coverage | Reason |
| --- | --- | --- |
| NOVA product intent | NOVA_PRODUCT_CHARTER.md | Product mission and high-level positioning already exist. |
| Guiding principles | NOVA_GUIDING_PRINCIPLES.md; OS_FOUNDATION_PRINCIPLES.md | Permanent principles and OS-specific principles already exist. |
| Kernel doctrine | NOVA_KERNEL_DOCTRINE.md | Kernel doctrine is active and must not be rewritten. |
| Operating System conceptual architecture | OS_FOUNDATION_ARCHITECTURE.md | WS-001 created and certified it. |
| Operating System component model | OS_FOUNDATION_COMPONENT_MODEL.md | WS-001 created and certified the conceptual component domains. |
| Operating System boundaries | OS_FOUNDATION_BOUNDARIES.md | WS-001 created and certified the boundary model. |
| Operating System glossary | OS_FOUNDATION_GLOSSARY.md | WS-001 created glossary coverage. |
| Architecture review of WS-001 output | DESIGN_REVIEW_REPORT.md; CERTIFICATION_REPORT.md | The WS-001 corpus is reviewed and certified GO. |
| Workstream roadmap | PROGRAM_002_WORKSTREAMS.md | The eight-Workstream roadmap already exists. |
| Architecture roadmap decision after WS-001 | PROGRAM_002_ARCHITECTURE_REVIEW_001.md | Review Board already issued GO WITH RECOMMENDATIONS. |
| Mission execution doctrine | NOVA_EXECUTION_MODEL.md | Official NOVA execution lifecycle already exists. |
| Architecture boundary and compliance rules | ARCH-RULE-001; ARCH-RULE-002; ARCH-RULE-003 | Boundary, vocabulary, and compliance controls already exist. |

---

## 4. True Gaps

| Gap ID | Related Artefact | Missing Item | Coverage Today | Required Future Action | Preferred Workstream |
| --- | --- | --- | --- | --- | --- |
| GAP-001 | Operating System Specification | Operating System execution specification | PARTIEL | Create a detailed OS execution specification for missions, workflows, decisions, reporting, traceability, and stop criteria. | WS-002 |
| GAP-002 | Mission Model | Mission and workflow state model | PARTIEL | Define mission states, workflow states, allowed transitions, state evidence, stop states, and terminal states. | WS-002 |
| GAP-003 | Mission Model | Decision, reporting, and traceability flow specification | PARTIEL | Define how decisions, reports, evidence, events, and traceability flow through OS execution. | WS-002 |
| GAP-004 | Kernel Specification | OS-facing Kernel service expectations | PARTIEL | Define what the Operating System expects from Kernel primitives without changing Kernel doctrine or primitives. | WS-003 |
| GAP-005 | Runtime Specification | Operating System lifecycle specification | PARTIEL | Define lifecycle states for OS entities, missions, workflows, decisions, evidence, and execution artefacts. | WS-004 |
| GAP-006 | Runtime Specification | Lifecycle transition matrix | PARTIEL | Define valid lifecycle transitions, guards, validation gates, and forbidden transitions. | WS-004 |
| GAP-007 | Runtime Specification | Lifecycle evidence model | PARTIEL | Define evidence required for lifecycle changes and certification. | WS-004 |
| GAP-008 | Runtime Specification | Mission Runtime responsibility specification | PARTIEL | Define Mission Runtime responsibilities, boundaries, state responsibility, and non-responsibilities. | WS-005 |
| GAP-009 | Agent Platform | Agent Runtime responsibility specification | PARTIEL | Define Agent Runtime coordination responsibilities without modifying agent identities or agent rules. | WS-006 |
| GAP-010 | Workspace Model | Workspace Runtime responsibility specification | PARTIEL | Define workspace context, evidence organization, lifecycle expectations, and traceability boundaries. | WS-007 |
| GAP-011 | Component Specifications | Development-facing OS component specifications | PARTIEL | Convert certified conceptual domains into controlled specifications per Workstream, without redefining the conceptual component model. | WS-002 through WS-007 |
| GAP-012 | Engineering Blueprint | PROGRAM-002 aligned engineering blueprint | PARTIEL | Revalidate or create an engineering blueprint aligned with the final PROGRAM-002 architecture specifications before implementation starts. | After WS-002 through WS-007, before development |
| GAP-013 | Enterprise Blueprint | Enterprise architecture traceability or integration blueprint | PARTIEL | Create a non-duplicative traceability view only if required for development readiness. It must reference existing sources instead of restating them. | After WS-002 and WS-003, or before development gate |

---

## 5. Gap Details

### GAP-001 - Operating System Execution Specification

Current coverage:

PARTIEL

Existing sources:

- NOVA_EXECUTION_MODEL.md
- OS_FOUNDATION_ARCHITECTURE.md
- OS_FOUNDATION_COMPONENT_MODEL.md
- PROGRAM_002_WORKSTREAMS.md
- PROGRAM_002_ARCHITECTURE_REVIEW_001.md

True missing element:

A PROGRAM-002 Operating System execution specification binding the permanent NOVA Execution Model to OS-level mission, workflow, decision, reporting, traceability, and stop-criteria behavior.

Not allowed:

- modifying NOVA_EXECUTION_MODEL.md;
- rewriting permanent doctrine;
- creating runtime implementation;
- defining APIs or code.

### GAP-002 - Mission And Workflow State Model

Current coverage:

PARTIEL

Existing sources:

- NOVA_EXECUTION_MODEL.md
- ORCHESTRATION_GOVERNANCE.md
- OS_FOUNDATION_COMPONENT_MODEL.md
- NOVA-015_DEVELOPMENT_BLUEPRINT.md

True missing element:

A canonical OS-level model for mission and workflow states, transitions, evidence, stop states, terminal states, and validation gates.

Not allowed:

- treating historical sprint notes as the canonical PROGRAM-002 state model;
- starting implementation before the model is certified.

### GAP-003 - Decision, Reporting, And Traceability Flow

Current coverage:

PARTIEL

Existing sources:

- NOVA_EXECUTION_MODEL.md
- OS_FOUNDATION_PRINCIPLES.md
- OS_FOUNDATION_COMPONENT_MODEL.md
- ARCH-RULE-003_ARCHITECTURE_COMPLIANCE.md

True missing element:

A detailed OS flow connecting Mission Orders, Execution Reports, Decision Reports, traceability evidence, certification evidence, events, and unresolved authority escalations.

Not allowed:

- embedding hidden doctrine in reports;
- allowing execution evidence to replace architecture decisions.

### GAP-004 - OS-Facing Kernel Service Expectations

Current coverage:

PARTIEL

Existing sources:

- NOVA_KERNEL_DOCTRINE.md
- OS_FOUNDATION_BOUNDARIES.md
- OS_FOUNDATION_COMPONENT_MODEL.md
- PROGRAM_002_WORKSTREAMS.md

True missing element:

A controlled description of what OS Workstreams expect from Kernel primitives such as Runtime, Scheduler, Configuration, Dependency Injection, Messaging, Persistence, Storage, Logging, Resource Management, Clock, and Lifecycle.

Not allowed:

- adding Kernel primitives;
- changing Kernel doctrine;
- creating a full Kernel implementation specification inside PROGRAM-002.

### GAP-005 - Operating System Lifecycle Specification

Current coverage:

PARTIEL

Existing sources:

- OS_FOUNDATION_COMPONENT_MODEL.md
- OS_FOUNDATION_PRINCIPLES.md
- PROGRAM_002_WORKSTREAMS.md
- NOVA_EXECUTION_MODEL.md

True missing element:

A lifecycle specification for OS entities, missions, workflows, decisions, execution artefacts, evidence, and certification readiness.

Not allowed:

- implementing lifecycle services;
- modifying Kernel lifecycle primitives;
- defining product lifecycle management.

### GAP-006 - Lifecycle Transition Matrix

Current coverage:

PARTIEL

Existing sources:

- NOVA_EXECUTION_MODEL.md
- ORCHESTRATION_GOVERNANCE.md
- PROGRAM_002_WORKSTREAMS.md

True missing element:

A transition matrix defining valid and invalid transitions, required evidence, validation gates, stop conditions, and authority requirements.

Not allowed:

- relying on informal transition wording as implementation input.

### GAP-007 - Lifecycle Evidence Model

Current coverage:

PARTIEL

Existing sources:

- NOVA_EXECUTION_MODEL.md
- ARCH-RULE-003_ARCHITECTURE_COMPLIANCE.md
- WS_001_RETROSPECTIVE_AND_LESSONS_LEARNED.md

True missing element:

A precise evidence model for lifecycle transitions, reports, decisions, certification, and archive readiness.

Not allowed:

- certifying by assertion without evidence.

### GAP-008 - Mission Runtime Responsibility Specification

Current coverage:

PARTIEL

Existing sources:

- OS_FOUNDATION_COMPONENT_MODEL.md
- PROGRAM_002_WORKSTREAMS.md
- PRODUCT-RULE-001_RUNTIME_RULES.md
- NOVA-015_DEVELOPMENT_BLUEPRINT.md

True missing element:

A Mission Runtime responsibility specification defining what Mission Runtime owns, what it never owns, its relationship with mission state, lifecycle, evidence, reporting, and Kernel primitives.

Not allowed:

- implementing Mission Runtime code;
- exposing Platform APIs;
- moving product workflow logic into Operating System.

### GAP-009 - Agent Runtime Responsibility Specification

Current coverage:

PARTIEL

Existing sources:

- OS_FOUNDATION_COMPONENT_MODEL.md
- OS_FOUNDATION_BOUNDARIES.md
- MIG-002_AGENT_COLLISION_RESOLUTION_RULE.md
- PRODUCT-RULE-003_AGENT_RULES.md
- ORCHESTRATION_GOVERNANCE.md

True missing element:

An Agent Runtime responsibility specification defining coordination, assignment, availability, conflict escalation, evidence, and boundaries without modifying agents.

Not allowed:

- creating agents;
- deleting agents;
- changing agent identities;
- redefining agent responsibilities.

### GAP-010 - Workspace Runtime Responsibility Specification

Current coverage:

PARTIEL

Existing sources:

- OS_FOUNDATION_COMPONENT_MODEL.md
- OS_FOUNDATION_BOUNDARIES.md
- DESIGN_REVIEW_REPORT.md
- NOVA-015_DEVELOPMENT_BLUEPRINT.md

True missing element:

A Workspace Runtime responsibility specification defining workspace context, evidence organization, mission working state, traceability, and lifecycle expectations.

Not allowed:

- creating product UI design;
- defining storage implementation;
- making Workspace the source of truth for runtime decisions.

### GAP-011 - Development-Facing OS Component Specifications

Current coverage:

PARTIEL

Existing sources:

- OS_FOUNDATION_COMPONENT_MODEL.md
- OS_FOUNDATION_BOUNDARIES.md
- OS_FOUNDATION_PRINCIPLES.md

True missing element:

Controlled specifications for OS responsibility domains when required by later Workstreams. These should define responsibilities, inputs, outputs, state responsibilities, evidence expectations, dependencies, exclusions, and certification criteria.

Not allowed:

- redefining conceptual domains;
- turning conceptual components into implementation classes without authorization.

### GAP-012 - PROGRAM-002 Aligned Engineering Blueprint

Current coverage:

PARTIEL

Existing sources:

- NOVA-015_DEVELOPMENT_BLUEPRINT.md
- PROGRAM_002_WORKSTREAMS.md
- PROGRAM_002_ARCHITECTURE_REVIEW_001.md

True missing element:

A development-entry blueprint aligned with the final PROGRAM-002 architecture specifications and Workstream closure evidence.

Not allowed:

- using the existing NOVA-015 blueprint as final authority without revalidation;
- starting development before architecture specifications are certified.

### GAP-013 - Enterprise Architecture Traceability Blueprint

Current coverage:

PARTIEL

Existing sources:

- NOVA_PRODUCT_CHARTER.md
- NOVA_GUIDING_PRINCIPLES.md
- NOVA_KERNEL_DOCTRINE.md
- OS_FOUNDATION_ARCHITECTURE.md
- OS_FOUNDATION_COMPONENT_MODEL.md
- OS_FOUNDATION_BOUNDARIES.md
- PROGRAM_002_WORKSTREAMS.md

True missing element:

A non-duplicative enterprise traceability or integration blueprint may be required to connect Product, Platform, Operating System, Kernel, governance, and engineering-readiness evidence before development.

Not allowed:

- rewriting the Product Charter;
- rewriting Kernel Doctrine;
- restating WS-001 architecture as a new architecture source of truth.

---

## 6. Roadmap By Completion Category

### 6.1 Completed

The following items are complete and should be reused directly:

1. Product and foundation intent.
2. Guiding principles.
3. Kernel doctrine and Kernel boundary.
4. Operating System conceptual architecture.
5. Operating System conceptual component model.
6. Operating System boundary model.
7. Operating System principles and invariants.
8. Operating System glossary.
9. WS-001 design review.
10. WS-001 certification.
11. WS-001 capitalization.
12. PROGRAM-002 Workstream roadmap.
13. Architecture review authorizing separate WS-002 charter creation.

### 6.2 Requires Complement Only

The following items require controlled complements:

1. Enterprise Blueprint.
2. Component Specifications.
3. Engineering Blueprint.
4. Kernel Specification, limited to OS-facing expectations inside PROGRAM-002.

### 6.3 Must Really Be Created

The following should be created by future authorized missions:

1. Operating System execution specification.
2. Mission and workflow state model.
3. Decision, reporting, and traceability flow specification.
4. OS-facing Kernel service expectations.
5. Operating System lifecycle specification.
6. Lifecycle transition matrix.
7. Lifecycle evidence model.
8. Mission Runtime responsibility specification.
9. Agent Runtime responsibility specification.
10. Workspace Runtime responsibility specification.
11. PROGRAM-002 aligned engineering blueprint.
12. Enterprise architecture traceability blueprint, only if required as a development gate.

---

## 7. Recommended Order

The Review Board recommends preserving the official Workstream order:

1. WS-002 - Execution Model: close GAP-001, GAP-002, and GAP-003.
2. WS-003 - Kernel Services: close GAP-004.
3. WS-004 - Lifecycle Management: close GAP-005, GAP-006, and GAP-007.
4. WS-005 - Mission Runtime: close GAP-008 and part of GAP-011.
5. WS-006 - Agent Runtime: close GAP-009 and part of GAP-011.
6. WS-007 - Workspace Runtime: close GAP-010 and part of GAP-011.
7. Engineering readiness mission: close GAP-012 after required architecture specifications are certified.
8. Enterprise traceability mission, only if required: close GAP-013 without duplicating existing sources.
9. WS-008 - Operating System Certification: certify the final PROGRAM-002 corpus.

---

## 8. Final Gap Conclusion

The architecture foundation is not missing.

The development-ready specification layer is missing.

The next authorized work should start with WS-002 and produce the Operating System execution specification, mission and workflow state model, and decision/reporting/traceability flows.

No duplicate architecture document should be created before WS-002.

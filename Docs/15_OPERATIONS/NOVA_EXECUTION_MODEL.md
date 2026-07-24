# NOVA Execution Model

Status: ACTIVE  
Classification: PERMANENT OPERATIONS DOCTRINE  
Program Context: NOVA ORCHESTRATOR  
Creation Mission: NOVA-BOOTSTRAP-010

---

## 1. Purpose

This document defines the official execution model of NOVA ORCHESTRATOR.

Its purpose is to govern how programs, missions, squads, execution reports, decision reports, capitalization documents, and archives are created, executed, validated, and closed inside the CEREBRAU NOVA.

This document is a permanent reference. Future missions must rely on the execution model and on the official templates instead of embedding full execution governance inside long prompts.

---

## 2. Execution Philosophy

NOVA execution is governed by documentation first, architecture first, traceability, and explicit decision authority.

The execution model applies the following principles:

- one active Program at a time;
- one active mission per Squad at a time;
- no execution outside the active Program;
- no development without an approved Mission Order;
- doctrines define permanent rules;
- Mission Orders define bounded execution intent;
- Execution Reports record what was actually done;
- Decision Reports isolate matters requiring architecture or Executive authority;
- Capitalization converts experience into reusable governance knowledge;
- Archives preserve closed programs as immutable historical references.

Execution must never mix doctrine, mission instruction, and execution evidence in the same artefact.

---

## 3. Execution Lifecycle

The official NOVA execution lifecycle is:

```text
Program Charter
↓
Mission Order
↓
Squad Execution
↓
Execution Report
↓
Decision Report (if required)
↓
Capitalization
↓
Archive
↓
Program Closed
```

### Program Charter

The Program Charter opens a Program, defines its governance, scope, expected value, deliverables, workstreams, dependencies, risks, entry criteria, exit criteria, and Definition of Done.

No Program execution may begin before the Program Charter exists and is validated.

### Mission Order

The Mission Order authorizes a bounded mission inside the active Program.

It defines objective, scope, constraints, references, deliverables, execution doctrine, stop conditions, decision policy, and expected reporting.

### Squad Execution

Squad Execution is the operational execution of a Mission Order by the designated Squad and agents.

Each Squad applies its permanent doctrine and the active Mission Order. Agents execute within their documented responsibilities.

### Execution Report

The Execution Report records the factual result of a mission.

It contains operations performed, artefacts created or updated, verification evidence, SHA-256 when relevant, issues, blockers, decisions raised, and certification status.

### Decision Report

A Decision Report is produced when execution identifies a matter that cannot be resolved under existing doctrine or delegated authority.

It isolates the matter, preserves traceability, states the decision required, and prevents speculative action.

### Capitalization

Capitalization transforms program experience into reusable governance knowledge.

It records lessons learned, best practices, risks, success factors, and recommendations for future Programs without creating new doctrine by itself.

### Archive

The Archive preserves the complete historical reference of a closed Program.

It references final reports, decision reports, doctrines, agents, deliverables, statistics, certifications, and closure evidence without moving or deleting source documents.

### Program Closed

Program Closed is the final state of a Program after exit criteria, final report, capitalization, and archive are complete.

Once closed, the Program is immutable unless an explicit governance process authorizes an amendment.

---

## 4. Official Artefacts

### Doctrine

A Doctrine is a permanent governance document.

It defines stable rules, principles, responsibilities, execution constraints, or operating models. A doctrine is not a mission report and must not be hidden inside an execution record.

### Program Charter

A Program Charter is the official opening document of a Program.

It defines the authorized program scope, governance, deliverables, workstreams, dependencies, risks, entry criteria, exit criteria, success metrics, and Definition of Done.

### Mission Order

A Mission Order is the official execution instruction for a bounded mission.

It activates a specific scope, designates execution authority, lists references, defines constraints and deliverables, and states stop conditions.

### Execution Report

An Execution Report is the official factual record of a mission.

It reports what happened, what was created or modified, what was verified, what failed, what was blocked, and whether the result is GO or NO GO.

### Decision Report

A Decision Report is the official escalation artefact for matters requiring Architect or Executive decision.

It must be produced when a mission reaches a decision beyond existing doctrine, program scope, or delegated authority.

### Capitalization Report

A Capitalization Report is the official lessons learned document of a Program.

It records reusable knowledge, practices, risks, recommendations, and success factors. It may recommend new doctrine but does not create doctrine by itself.

### Archive

An Archive is the official immutable historical package of a closed Program.

It contains index, manifest, certificate, archive report, and references to all relevant program artefacts.

---

## 5. Responsibilities

### ORCHESTRATOR

The ORCHESTRATOR coordinates execution inside the active Program.

It selects the appropriate Squad, distributes work through Mission Orders, ensures doctrine application, preserves scope, and escalates decisions that exceed delegated authority.

### Squads

Squads execute missions using their permanent doctrine.

A Squad may process operational work, produce reports, isolate blockers, raise Decision Reports, and certify results within its documented scope.

### Agents

Agents perform bounded responsibilities inside a Squad.

Agents execute. They do not create architecture decisions, redefine doctrine, extend program scope, or change responsibilities without explicit authorization.

### Architect

The Architect is responsible for architecture decisions.

The Architect receives Decision Reports when a mission identifies an unresolved architecture question, undocumented doctrine need, collision requiring arbitration, or scope conflict.

### Executive

The Executive holds final authority for program activation, program transition, major scope decisions, and final validation where required by NOVA governance.

---

## 6. Execution Rules

1. NOVA has only one active Program at a time.
2. A Squad may execute only one active mission at a time.
3. No execution may occur outside the active Program.
4. No mission may begin without a Mission Order.
5. All missions must apply applicable doctrines by default.
6. Doctrine, Mission Order, Execution Report, Decision Report, Capitalization, and Archive must remain separate artefacts.
7. Execution Reports must record facts and evidence, not create permanent doctrine.
8. Mission Orders must define scope and constraints, not rewrite existing doctrine.
9. Decision Reports must be produced when execution requires an architecture or Executive decision.
10. Agents must not invent undocumented terminology, architecture, rules, or responsibilities.
11. Existing documents must not be modified unless the Mission Order explicitly authorizes it.
12. Program transition requires verification of exit criteria, closure evidence, and validation under NOVA Program Governance.

---

## 7. Document Flow

The official document flow is:

```text
Foundation and Doctrine
  -> Program Charter
  -> Mission Orders
  -> Squad Execution
  -> Execution Reports
  -> Decision Reports when required
  -> Program Final Report
  -> Capitalization Report
  -> Program Archive
  -> Program Closure
```

Foundational documents and doctrines define stable governance.

Program Charters bind that governance to a specific Program.

Mission Orders activate bounded execution within the active Program.

Squads and agents execute under doctrine and mission constraints.

Execution Reports preserve factual evidence.

Decision Reports isolate unresolved decisions without stopping unrelated execution.

Capitalization Reports convert experience into reusable knowledge.

Archives preserve the closed Program as the permanent historical reference.

---

## 8. References

- Docs/15_OPERATIONS/NOVA_PROGRAM_GOVERNANCE.md
- Docs/15_OPERATIONS/NOVA_MIGRATION_SQUAD.md
- Docs/00_FOUNDATION/NOVA_PRODUCT_CHARTER.md
- Docs/00_FOUNDATION/NOVA_GUIDING_PRINCIPLES.md
- Docs/00_FOUNDATION/NOVA_KERNEL_DOCTRINE.md
- Docs/05_RULES/MIG-001_TERMINOLOGY_MIGRATION_RULE.md
- Docs/05_RULES/MIG-002_AGENT_COLLISION_RESOLUTION_RULE.md
- Docs/18_PROGRAM_ARCHIVES/PROGRAM-001_MIGRATION_FOUNDATION/PROGRAM_001_ARCHIVE_INDEX.md
- Docs/15_OPERATIONS/PROGRAM_001_RETROSPECTIVE_AND_LESSONS_LEARNED.md


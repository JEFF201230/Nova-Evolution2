# PERSISTENCE CONTRACT

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-008-PERSISTENCE-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION CONTRACT

CLASSIFICATION : PERSISTENCE CONTRACT

---

## 1. Purpose

This contract defines the official persistence standard for NOVA.

Its purpose is to specify the normative rules governing durable state, ownership, aggregates, repositories, transactions, consistency, concurrency, lifecycle, retention, backup, restore, migration, and certification for all persisted NOVA data.

This contract is normative. It does not define implementation, code, database engine behavior, ORM behavior, or storage vendor choices.

---

## 2. Scope

This contract applies to all NOVA persisted data and persistence-relevant behavior, including:

- program records;
- mission order records;
- PDS records;
- campaign records;
- capability records;
- contract records;
- decision records;
- evidence records;
- certification records;
- user records;
- agent records;
- tenant records;
- audit event records;
- rollback or recovery-supporting records;
- reference data required for governed operation.

It is independent of database engine, ORM framework, storage topology, and programming language.

It is compatible with relational storage, document storage, key-value storage, graph storage, and event store patterns when those patterns satisfy the contract.

It is compatible with the Security Contract, RBAC Contract, Identity Contract, API Contract, and the Change Knowledge Graph.

---

## 3. Canonical Definitions

| Term | Definition |
| --- | --- |
| Persistence Contract | The normative specification of durable state management for NOVA. |
| Aggregate | A consistency boundary that groups related persisted state under one governing root. |
| Repository | The canonical interface or governed model used to access persisted aggregates or records. |
| Storage Abstraction | The contract-level persistence boundary that hides engine-specific details. |
| Transaction | A governed unit of work that preserves agreed persistence rules. |
| Consistency | The contractual guarantee that related state remains valid under defined rules. |
| Concurrency | The contractual handling of simultaneous access or mutation to the same state. |
| Soft Delete | Logical removal of data while preserving historical traceability. |
| Archival | Transfer of data from active use to governed long-term storage. |
| Retention | The period and rule set that governs how long data must remain available. |

---

## 4. Persistence Philosophy

1. Persistence must be modelled before implementation.
2. Durable state must be owned.
3. State boundaries must be explicit.
4. Audit and evidence state must remain traceable.
5. Storage technology must not define semantics.
6. Data must remain recoverable according to its lifecycle and retention rules.
7. Persistence must preserve baseline compatibility.
8. Persistence must support future program evolution without contract drift.

---

## 5. Data Ownership

Each persisted entity or aggregate must have a declared owner.

Rules:

1. Ownership must be explicit.
2. Ownership must identify the governing program, contract, or authority.
3. Shared state must still have a single accountable owner.
4. Ownership must be auditable.
5. Ownership changes must be governed and traceable.

---

## 6. Aggregate Rules

Aggregates define the persistence boundary for consistency and write control.

Rules:

1. An aggregate must have one root.
2. A write must not silently cross aggregate boundaries.
3. Aggregate boundaries must reflect governance and consistency needs.
4. Aggregate mutation must be validated before commit.
5. Aggregate design must preserve traceability and recovery.

---

## 7. Repository Model

The repository model is the governed access model for persistence.

Rules:

1. Repository interfaces must be explicit.
2. Repositories must not leak engine-specific behavior into contracts.
3. Repositories may represent SQL tables, document collections, event streams, or other storage structures if the contract remains satisfied.
4. Repositories must preserve ownership, lifecycle, and audit requirements.
5. Repositories must not bypass governance validation.

---

## 8. Storage Abstraction

Storage abstraction hides the concrete storage engine while preserving contract semantics.

Rules:

1. The contract must remain engine-neutral.
2. Storage abstraction must support SQL, NoSQL, and Event Store compatibility.
3. Storage abstraction must not depend on ORM behavior.
4. Storage abstraction must preserve transaction and concurrency rules.
5. Storage abstraction must preserve evidence and audit traceability.

---

## 9. Transaction Model

The transaction model defines governed units of persistence work.

Rules:

1. Transactions must be explicit where state mutation occurs.
2. Transactions must preserve atomicity within their declared boundary.
3. Transactions must support rollback or compensating behavior where required.
4. Transactions must preserve auditability.
5. Transactions must not hide partial completion.

---

## 10. Consistency Model

The persistence consistency model may be strong, eventual, or mixed depending on the governed data class.

Rules:

1. The required consistency level must be explicit.
2. Critical governance records should prefer strong consistency where feasible.
3. Non-critical derived data may use eventual consistency if declared.
4. Consistency trade-offs must be documented.
5. Consistency behavior must preserve certification evidence.

---

## 11. Concurrency Model

The concurrency model must prevent silent corruption and lost updates.

Rules:

1. Concurrent writes must be controlled.
2. Concurrency semantics must be explicit.
3. Conflict detection must be possible.
4. Concurrency behavior must preserve auditability.
5. Concurrent access must not violate ownership or scope.

---

## 12. Versioning

Persisted records and persistence contracts must support versioning.

Rules:

1. Structural or semantic changes must be versioned.
2. Version identity must be traceable.
3. Version changes must not silently break certified dependents.
4. Historical versions must remain referenceable where audit requires it.

---

## 13. Optimistic Locking

Optimistic locking is required where conflict detection is preferred over exclusive locks.

Rules:

1. Concurrency tokens or equivalent version markers must be explicit.
2. Conflicting updates must be detectable.
3. Retry behavior must be governed.
4. Optimistic locking must preserve audit evidence.

---

## 14. Pessimistic Locking

Pessimistic locking may be used where exclusivity is required.

Rules:

1. Lock scope must be explicit.
2. Lock duration must be bounded.
3. Lock contention must be observable.
4. Pessimistic locking must not create hidden deadlock risk without governance.

---

## 15. Soft Delete Policy

Soft delete is the logical removal of a record while preserving traceability.

Rules:

1. Soft delete must preserve historical referenceability when audit requires it.
2. Soft delete must not erase certification or evidence links.
3. Soft delete must be explicit.
4. Soft delete must not masquerade as physical deletion in governance records.

---

## 16. Archival Policy

Archival is the transfer of data from active operational storage to governed long-term storage.

Rules:

1. Archival must preserve integrity and traceability.
2. Archival must preserve retrieval rights required by governance.
3. Archival must not break certification or audit obligations.
4. Archival must be version-aware when records are versioned.

---

## 17. Retention Policy

Retention defines how long each data class must remain available.

Rules:

1. Retention must be explicit by data class.
2. Retention must satisfy audit and compliance requirements.
3. Retention must be compatible with archival and purge rules.
4. Retention expiration must be auditable.

---

## 18. Referential Integrity

Referential integrity must preserve valid links across persisted state.

Rules:

1. Parent-child relationships must be explicit where required.
2. Broken references must be prevented or detected.
3. Referential rules must preserve certification evidence.
4. Referential integrity must apply across active and archived data where applicable.

---

## 19. Data Lifecycle

The data lifecycle may include:

- created;
- active;
- updated;
- soft_deleted;
- archived;
- restored;
- purged;
- retired.

Rules:

1. Lifecycle transitions must be explicit.
2. Lifecycle transitions must be auditable where governance requires it.
3. Lifecycle transitions must not erase required evidence.
4. Lifecycle transitions must preserve owner accountability.

---

## 20. Backup Strategy

Backup strategy must preserve recoverability and traceability.

Rules:

1. Backups must cover governed data classes according to criticality.
2. Backups must preserve integrity.
3. Backup scope and frequency must be explicit by data class.
4. Backup access must be controlled and auditable.

---

## 21. Restore Strategy

Restore strategy must permit controlled recovery of governed state.

Rules:

1. Restore must be testable in principle.
2. Restore must preserve the traceability chain where possible.
3. Restore must respect retention and archival boundaries.
4. Restore operations must be auditable.

---

## 22. Migration Strategy

Migration strategy must support versioned evolution of persisted state.

Rules:

1. Migration must be explicit and governed.
2. Migration must preserve certified data semantics.
3. Migration must be compatible with rollback where required.
4. Migration must not silently discard evidence or audit history.
5. Migration must support SQL, NoSQL, and Event Store compatible patterns.

---

## 23. Compatibility Rules

1. The Persistence Contract must remain independent of database engine, ORM, and framework.
2. The Persistence Contract must remain compatible with SQL, NoSQL, and Event Store patterns.
3. The Persistence Contract must remain compatible with API, Identity, Security, and RBAC contracts.
4. The Persistence Contract must remain compatible with the Change Knowledge Graph.
5. The Persistence Contract must remain compatible with future PROGRAM-017 to PROGRAM-032 work.

---

## 24. Extension Rules

1. Extension must not break owned data semantics.
2. Extension must not break aggregate boundaries.
3. Extension must not weaken integrity or auditability.
4. Extension must be versioned.
5. Extension must preserve baseline compatibility.

---

## 25. Certification Criteria

The Persistence Contract is certifiable only if:

- it follows the CDD standard and template;
- it declares canonical definitions;
- it defines persistence philosophy, ownership, aggregates, repository model, storage abstraction, transactions, consistency, concurrency, versioning, locking, lifecycle, archival, retention, backup, restore, and migration;
- it defines compatibility and extension rules;
- it does not contradict certified baseline documents.

---

## 26. Decision

GO.


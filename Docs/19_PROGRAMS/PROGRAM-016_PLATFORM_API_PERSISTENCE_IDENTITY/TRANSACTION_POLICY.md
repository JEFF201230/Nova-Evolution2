# TRANSACTION POLICY

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-008-PERSISTENCE-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION POLICY

CLASSIFICATION : TRANSACTION POLICY

---

## 1. ACID

Transactions must preserve ACID behavior where the selected storage pattern supports it and where the contract requires it.

Rules:

1. Atomicity must be preserved within the declared transaction boundary.
2. Consistency must be preserved according to the declared consistency model.
3. Isolation must be explicit.
4. Durability must be preserved for committed governed records.

---

## 2. Distributed Transactions

Distributed transactions are permitted only when explicitly required by the governed use case.

Rules:

1. Distributed transactions are not assumed by default.
2. Distributed coordination must be explicit.
3. If global atomicity is not available, compensating behavior must be declared.
4. Distributed transaction use must be auditable.

---

## 3. Rollback

Rollback is the governed reversal of a transaction or of its contractual effect.

Rules:

1. Rollback must be explicit.
2. Rollback must preserve traceability.
3. Rollback must not erase evidence required by governance.
4. Rollback must be possible for critical state changes unless the contract states otherwise.

---

## 4. Retry

Retry is permitted only when it preserves correctness.

Rules:

1. Retry must be idempotence-aware.
2. Retry must not create duplicate side effects.
3. Retry policy must be explicit by operation type.
4. Retry failures must be observable.

---

## 5. Compensation

Compensation is the governed alternative to rollback when rollback is not available.

Rules:

1. Compensation must be explicit.
2. Compensation must be auditable.
3. Compensation must approximate the intended reversal or correction.
4. Compensation must preserve evidence of the original event.

---

## 6. Isolation

Isolation defines how concurrent transactions observe each other.

Rules:

1. Isolation level must be explicit when state correctness depends on it.
2. Critical governance writes should use the strongest feasible isolation.
3. Isolation trade-offs must be documented.
4. Isolation behavior must preserve integrity and traceability.

---

## 7. Timeout

Transactions must have governed timeout behavior.

Rules:

1. Timeouts must be explicit.
2. Timeout behavior must be observable.
3. Timeout must not create silent partial state.
4. Timeout handling must support retry or compensation when appropriate.

---

## 8. Idempotence

Transactional idempotence is required where a request or operation may be retried.

Rules:

1. Idempotence keys or equivalent transactional identifiers must be supported where needed.
2. Repeating the same logical transaction must not duplicate governed effects.
3. Idempotence behavior must be documented by operation class.
4. Idempotence must remain compatible with audit and certification.

---

## 9. Compatibility Rules

1. The Transaction Policy must remain engine-neutral.
2. The Transaction Policy must remain compatible with SQL, NoSQL, and Event Store patterns.
3. The Transaction Policy must remain compatible with the Persistence Contract.
4. The Transaction Policy must remain compatible with the Security, RBAC, Identity, and Change Knowledge Graph contracts.
5. The Transaction Policy must remain compatible with future PROGRAM-017 to PROGRAM-032 work.

---

## 10. Certification Criteria

The Transaction Policy is certifiable only if:

- it defines ACID, distributed transactions, rollback, retry, compensation, isolation, timeout, and transactional idempotence;
- it is independent of implementation and engine choices;
- it does not contradict certified baseline documents.


# PROGRAM EXECUTION CONTRACT

Status: `PROPOSED`

## Per-lot preflight

Before any implementation lot, its execution report must record:

1. predecessor certificate and resolver output;
2. domain owner and authoritative producer;
3. unique source of truth and persistence owner;
4. allowed and forbidden paths from the Mission Order;
5. Git branch, commit, complete dirty-state summary and scoped diff baseline;
6. targeted and protected-domain baseline test results;
7. explicit confirmation that no certified Blueprint change is required.

A missing or unavailable authority is a failed preflight, not an empty input.

## During execution

- Modify only allowed paths.
- Depend only on product-owned internal ports/queries.
- Persist only data owned by the active domain.
- Preserve source identity, version/occurrence, producer and observation timestamps.
- Use explicit result unions for `AVAILABLE`, `AVAILABLE_EMPTY`, `NOT_FOUND` and `AUTHORITY_UNAVAILABLE` where applicable.
- Do not add public BFF/API/frontend surfaces in the initial lots.
- Do not add CEREBRAU imports, calls, schemas or artefacts to NOVA product code.
- Do not invent fallbacks, scores, facts, priorities, Actions or Decisions.

## Post-execution proof

Each lot must produce deterministic evidence for:

- targeted unit and integration tests;
- negative boundary and unavailable-authority tests;
- relevant Work/Runtime/Core regression tests;
- PEOPLE/PLANNING/ACTIONS regression tests when consumed;
- typecheck/build where applicable;
- repository and dependency direction checks;
- Git diff path-scope check;
- architecture invariant checklist;
- Red Team review with finding dispositions;
- execution report and certification decision.

## Repair protocol

1. Identify and record a proven root cause.
2. Apply one bounded repair within the same architecture.
3. Rerun the failed check and regression set.
4. If it fails for the same cause, apply at most one second bounded repair.
5. After the second failure, stop and report the exact blocker and evidence.

The attempt counter is per root cause and cannot be reset by renaming the symptom.

## Human gates

Only structural architecture/source changes, protected Blueprint/invariant changes, substantial certified-domain regression, destructive operations, incompatible unresolved business semantics, or an out-of-mandate blocker create a human gate. Phase 0 final approval is explicitly required by the certified facts.

## Automatic governed transition

After an implementation lot is certified and every entry condition of its single immediate successor passes, CEREBRAU must automatically perform the successor's explicit assignment/activation through the existing mission mechanism. This activation is mechanical and requires no human approval. The first-Wave exception is Phase 1: it cannot activate until the open Phase 0 final program approval is recorded and the preauthorized EVIDENCE contract admission passes. The terminal WCF-008 human approval remains required after, not before, complete closure evidence exists.

## Structured conclusion

**FACT**  
Implementation correctness requires both domain tests and proof that authority boundaries did not move.

**EVIDENCE**  
Wave mandate section 8 and `WORK_PHASE2_CERTIFICATION.md:187-222,315-334`.

**ANALYSIS**  
This contract provides repeatable before/during/after controls without adding an orchestration engine.

**LIMIT**  
It does not prescribe a test runner or physical repository implementation.

**DECISION**  
Every lot inherits this contract; a Mission Order may strengthen but not weaken it.

**NEXT ACTION**  
Copy actual command outputs and hashes into each future execution report.

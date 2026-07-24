# API VERSIONING POLICY

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-005-API-CONTRACT

DATE : 2026-07-09

STATUS : OFFICIAL VERSIONING POLICY

---

## 1. Purpose

Define the official versioning policy for NOVA API contracts.

This policy applies to all future API contracts and their resource, error, and compatibility rules.

---

## 2. Version Format

The canonical version format is:

`MAJOR.MINOR.PATCH`

Rules:

1. Version identifiers must be explicit.
2. Version identifiers must be stable and human-readable.
3. Each version must be traceable to a certified contract state.
4. Version semantics must not depend on implementation details.

---

## 3. Major Version

A major version indicates a breaking change.

Breaking changes include:

- removal or renaming of canonical resources
- incompatible response shape changes
- incompatible error model changes
- incompatible authentication or authorization semantics
- incompatible pagination or idempotency semantics
- incompatible compatibility rules

Rules:

1. Major changes require explicit governance approval.
2. Major changes require a migration plan.
3. Major changes may coexist with prior major versions for a transition period.
4. Major version support boundaries must be declared.

---

## 4. Minor Version

A minor version indicates a backward-compatible expansion.

Allowed changes include:

- additive resources
- additive fields
- additive error codes
- additive optional behaviors
- additive hooks or metadata

Rules:

1. Minor changes must not break certified consumers.
2. Minor changes must preserve existing canonical meanings.
3. Minor changes must be documented in the change log.

---

## 5. Patch Version

A patch version indicates clarification, correction, or non-breaking refinement.

Allowed changes include:

- wording clarification
- non-breaking constraint refinement
- metadata correction
- documentation repair

Rules:

1. Patch changes must not alter canonical semantics.
2. Patch changes must not change certified compatibility.
3. Patch changes may be applied to certified versions when governance allows.

---

## 6. Backward Compatibility

Backward compatibility rules:

1. Certified consumers should continue to function unless a major version change is declared.
2. Existing canonical resource meanings must remain stable.
3. Existing error semantics must remain stable unless explicitly versioned.
4. Existing pagination, idempotency, and authorization semantics must not break silently.
5. Deprecated elements must remain traceable during the migration window.

---

## 7. Deprecation

Deprecation rules:

1. Deprecation must be explicit and versioned.
2. Deprecation must name the replacement or retirement path.
3. Deprecation must name the support window.
4. Deprecation must preserve historical traceability.
5. Deprecation must not silently alter certified behavior.

---

## 8. Retrait

Retrait rules:

1. Retrait may occur only after deprecation and migration closure.
2. Retrait requires governance approval.
3. Retrait must not destroy certification evidence.
4. Retrait must preserve referenceability of the retired version for audit purposes.
5. Retrait must not invalidate already certified downstream artifacts unless explicitly ordered.

---

## 9. Compatibility Windows

Compatibility windows must be declared for breaking or deprecating releases.

Rules:

1. A compatibility window must identify supported versions.
2. A compatibility window must identify end-of-support timing.
3. A compatibility window must identify migration expectations.
4. A compatibility window must be visible to dependent programs.

---

## 10. Multi-Program Compatibility

This policy is compatible with PROGRAM-017 to PROGRAM-032 because:

- it is transport-neutral;
- it is resource-oriented;
- it is versioned;
- it requires explicit compatibility declarations;
- it does not bind the API to a single implementation framework.

---

## 11. Decision

GO.


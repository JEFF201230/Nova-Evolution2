# CHANGE TRACEABILITY MODEL

## Traceability Chain 1

Program -> Mission Order -> PDS -> Change -> File -> Evidence -> Certification

### Rule

Each element must have a resolvable parent and a verifiable child relationship.

### Auditability

- Program identity must be explicit.
- Mission Order scope must be explicit.
- PDS output must reference its mission.
- Change must reference modified files.
- Evidence must reference the change.
- Certification must reference the evidence set.

## Traceability Chain 2

Branch -> Commit -> Decision -> Approval

### Rule

Each commit must belong to one branch and each approval must reference one decision context.

### Auditability

- Branch lineage must be preserved.
- Commit hashes must be immutable.
- Decision rationale must be recorded.
- Approval identity and timestamp must be recorded.

## Traceability Chain 3

Rollback Snapshot -> Recovery -> Evidence

### Rule

Every rollback snapshot must point to a recoverable state and every recovery must produce evidence.

### Auditability

- snapshot identity;
- restoration target;
- verification result;
- recovery timestamp.

## Contract to File Links

Every impacted contract must be linked to all modified files that rely on it.

### Rule

- a modified file without contract impact analysis is incomplete;
- a contract impact without linked files is incomplete.

## Auditability Rules

- Trace paths must be reproducible from stored records.
- Trace paths must not rely on unstated inference.
- Trace links must preserve lineage even after supersession.
- Trace records must survive certification and rollback review.
- Trace records must identify the responsible human or agent actor.


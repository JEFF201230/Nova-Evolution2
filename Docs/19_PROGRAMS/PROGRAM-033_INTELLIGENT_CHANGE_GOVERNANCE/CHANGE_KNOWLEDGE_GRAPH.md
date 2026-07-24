# CHANGE KNOWLEDGE GRAPH

## Role

The Change Knowledge Graph is the canonical knowledge model used by NOVA to reason about change.

It connects programs, missions, squads, campaigns, contracts, files, decisions, evidence, risks, approvals, certifications, rollback states, branches, and commits into one auditable structure.

## Principles

- AI prepares reasoning context.
- Humans own decisions.
- NOVA executes only authorized outcomes.
- Every material change must be traceable.
- Every certification must be evidence-backed.
- No inferred legitimacy without source links.

## Scope

The graph covers:

- program governance;
- mission-order scope;
- delivery-squad activity;
- change intent and impact;
- file-level modification context;
- evidence and certification;
- rollback and recovery context;
- human approval records.

The graph does not define implementation code, runtime behavior, or storage technology.

## Sources of Truth

- Program Board decisions.
- Mission Order records.
- PDS execution records.
- Certified baseline documents.
- Change evidence artifacts.
- Human approval and certification records.
- File inventory and dependency metadata.

## Uses

- determine whether a file change is legitimate;
- map a file to its mission and program context;
- detect out-of-scope modifications;
- identify conflicts and supersession paths;
- estimate risk and confidence;
- prepare decision packages for humans;
- support certification and rollback analysis.

## Integrity Rules

- A change must belong to exactly one authorized mission context unless explicitly superseded.
- A file change without evidence is incomplete.
- A decision without a human actor is invalid.
- A certification without traceable evidence is invalid.
- A rollback snapshot must point to a recoverable prior state.
- Conflicting facts must be resolved by an authorized decision record.

## Certification Criteria

- canonical entities are defined;
- canonical relations are defined;
- traceability paths are complete;
- decision context can be assembled from the graph;
- blocking conditions can be detected deterministically;
- audit evidence can be reconstructed from linked records.


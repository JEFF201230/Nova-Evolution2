# CHANGE RELATION MODEL

## contains

- Source: Program, Campaign, Mission Order, Branch
- Target: Mission Order, PDS, Change, Commit, File
- Cardinality: 1-to-many
- Integrity Rule: parent context must be authorized and active.
- Example: `Program contains Mission Order`

## produces

- Source: PDS, Change, Human Actor, Agent Actor
- Target: Evidence, Decision, Commit, Certification
- Cardinality: 1-to-many
- Integrity Rule: producer must be authorized for the target type.
- Example: `PDS produces Evidence`

## modifies

- Source: Change, Commit
- Target: File, Contract
- Cardinality: 1-to-many
- Integrity Rule: modified targets must be listed in evidence and scope.
- Example: `Commit modifies File`

## depends_on

- Source: Change, Mission Order, PDS, Capability
- Target: File, Contract, Evidence, Risk
- Cardinality: many-to-many
- Integrity Rule: dependency must be traceable and not circular without explicit exception.
- Example: `Change depends_on Contract`

## validates

- Source: Human Actor, Agent Actor, Certification
- Target: Mission Order, Change, Evidence, Commit, Rollback Snapshot
- Cardinality: many-to-many
- Integrity Rule: validation must reference an explicit rule set.
- Example: `Human Actor validates Change`

## approves

- Source: Human Actor, Approval
- Target: Change, Commit, Certification
- Cardinality: 1-to-many
- Integrity Rule: approval requires identity, scope, and timestamp.
- Example: `Human Actor approves Change`

## rejects

- Source: Human Actor, Approval
- Target: Change, Commit, Certification
- Cardinality: 1-to-many
- Integrity Rule: rejection must include reason and scope.
- Example: `Human Actor rejects Change`

## blocks

- Source: Risk, Validation Result, Policy Rule
- Target: Change, Commit, Mission Order
- Cardinality: many-to-many
- Integrity Rule: block must be linked to a concrete criterion.
- Example: `Risk blocks Commit`

## certifies

- Source: Certification
- Target: Change, Commit, Evidence, Rollback Snapshot
- Cardinality: 1-to-many
- Integrity Rule: certification must reference a completed evidence set.
- Example: `Certification certifies Change`

## supports

- Source: Evidence, Contract, Capability
- Target: Decision, Change, Certification
- Cardinality: many-to-many
- Integrity Rule: support must strengthen a specific claim.
- Example: `Evidence supports Decision`

## traces_to

- Source: File, Commit, Decision, Evidence
- Target: Mission Order, Program, Certification
- Cardinality: many-to-many
- Integrity Rule: trace must be reversible and uniquely identifiable.
- Example: `File traces_to Mission Order`

## rolls_back_to

- Source: Change, Commit, Rollback Snapshot
- Target: Prior Change, Prior Commit, Prior State
- Cardinality: many-to-one
- Integrity Rule: rollback target must exist and be restorable.
- Example: `Commit rolls_back_to Rollback Snapshot`

## conflicts_with

- Source: Change, Contract, Risk, Branch
- Target: Change, Contract, Branch
- Cardinality: many-to-many
- Integrity Rule: conflict must describe the conflicting rule or target.
- Example: `Change conflicts_with Contract`

## supersedes

- Source: Decision, Certification, Contract, File
- Target: Decision, Certification, Contract, File
- Cardinality: one-to-one or one-to-many
- Integrity Rule: supersession must preserve lineage.
- Example: `Contract supersedes Contract`

## belongs_to

- Source: PDS, Change, File, Evidence, Approval
- Target: Program, Mission Order, Branch, Campaign
- Cardinality: many-to-one
- Integrity Rule: owner context must be active or archived with lineage.
- Example: `File belongs_to Branch`

## impacts

- Source: Change, Risk, Commit
- Target: Capability, Contract, Program, Mission Order
- Cardinality: many-to-many
- Integrity Rule: impact statement must be evidenced and scoped.
- Example: `Change impacts Contract`


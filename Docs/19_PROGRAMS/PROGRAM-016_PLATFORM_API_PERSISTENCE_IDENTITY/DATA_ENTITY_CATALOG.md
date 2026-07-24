# DATA ENTITY CATALOG

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-008-PERSISTENCE-CONTRACT

DATE : 2026-07-09

STATUS : FOUNDATION CATALOG

CLASSIFICATION : DATA ENTITY CATALOG

---

## Catalog Rules

1. Each entity must have a canonical identifier.
2. Each entity must declare ownership and lifecycle.
3. Each entity must declare persistence rules.
4. Each entity must remain compatible with the Persistence Contract.
5. The catalog must remain engine-neutral and implementation-neutral.

---

## Program

- Canonical ID: `program_id`
- Description: persisted record of an authorized NOVA program.
- Owner: Program Board.
- Relations: contains Mission Order, contains Campaign, produces Capability references, owns Contract records.
- Lifecycle: proposed, approved, active, paused, completed, closed, archived.
- Persistence rules: immutable history for approved status changes; active record may be updated only through governed changes.

## Mission Order

- Canonical ID: `mission_order_id`
- Description: persisted mission instruction and execution boundary.
- Owner: program governance authority.
- Relations: belongs_to Program, contains PDS, contains Change, depends_on Contract.
- Lifecycle: drafted, approved, in_execution, verified, certified, closed, archived.
- Persistence rules: scope changes must be versioned; execution records must remain traceable.

## PDS

- Canonical ID: `pds_id`
- Description: persisted delivery squad identity and assignment record.
- Owner: orchestration authority.
- Relations: belongs_to Mission Order, produces Decision or Evidence, contains execution reports.
- Lifecycle: ready, active, blocked, completed, certified, closed, archived.
- Persistence rules: squad membership and status changes must be auditable.

## Campaign

- Canonical ID: `campaign_id`
- Description: persisted coordination envelope for multiple related missions.
- Owner: program governance authority.
- Relations: contains Mission Order, supports Program.
- Lifecycle: proposed, active, paused, completed, closed, archived.
- Persistence rules: campaign boundaries must be explicit and preserved.

## Capability

- Canonical ID: `capability_id`
- Description: persisted functional or architectural capability reference.
- Owner: architecture authority.
- Relations: belongs_to Program, supports Contract, supports Change.
- Lifecycle: defined, validated, certified, deprecated, archived.
- Persistence rules: capability identity must be stable across versions.

## Contract

- Canonical ID: `contract_id`
- Description: persisted normative contract artifact.
- Owner: contract authority.
- Relations: belongs_to Program, supports Mission Order, traces_to Change.
- Lifecycle: draft, reviewed, approved, certified, deprecated, removed, archived.
- Persistence rules: versioned contract history must remain referenceable.

## Decision

- Canonical ID: `decision_id`
- Description: persisted authoritative decision record.
- Owner: human decision authority.
- Relations: belongs_to Mission Order, approves Change, rejects Change, certifies Change.
- Lifecycle: proposed, issued, superseded, archived.
- Persistence rules: decision rationale and actor identity must be preserved.

## Evidence

- Canonical ID: `evidence_id`
- Description: persisted proof or support artifact for a governed claim.
- Owner: evidence authority.
- Relations: supports Decision, supports Certification, traces_to Change.
- Lifecycle: collected, validated, referenced, archived.
- Persistence rules: evidence must be immutable once referenced.

## Certification

- Canonical ID: `certification_id`
- Description: persisted certification outcome for a change, contract, or mission boundary.
- Owner: certification authority.
- Relations: certifies Change, certifies Contract, belongs_to Mission Order.
- Lifecycle: pending, certified, certified_with_reservations, rejected, archived.
- Persistence rules: certification must preserve evidence set references.

## User

- Canonical ID: `user_id`
- Description: persisted human principal record.
- Owner: identity authority.
- Relations: belongs_to Tenant, supports Decision, supports Approval.
- Lifecycle: provisioned, active, suspended, revoked, deprovisioned, archived.
- Persistence rules: identity changes must preserve historical traceability.

## Agent

- Canonical ID: `agent_id`
- Description: persisted automated principal record.
- Owner: automation authority.
- Relations: belongs_to Tenant, supports Evidence, supports Decision.
- Lifecycle: registered, active, restricted, retired, archived.
- Persistence rules: agent identity must remain explicit and auditable.

## Tenant

- Canonical ID: `tenant_id`
- Description: persisted tenant boundary record.
- Owner: tenancy authority.
- Relations: contains User, contains Agent, contains Program-scoped data, supports Audit Event.
- Lifecycle: proposed, active, suspended, closed, archived.
- Persistence rules: tenant isolation must be preserved by all dependent records.

## Audit Event

- Canonical ID: `audit_event_id`
- Description: persisted audit and traceability event record.
- Owner: audit authority.
- Relations: traces_to Decision, traces_to Change, traces_to Evidence, belongs_to Tenant.
- Lifecycle: emitted, validated, archived.
- Persistence rules: audit events must be append-oriented and immutable once emitted.


# CHANGE ENTITY MODEL

## Program

- Canonical ID: `program_id`
- Definition: an authorized NOVA program boundary and governance container.
- Required attributes: name, status, authority, owner, baseline reference.
- Optional attributes: version, priority, dependencies, program board decision.
- Owner: Program Board.
- Lifecycle: proposed, approved, active, paused, completed, closed.

## Mission Order

- Canonical ID: `mission_order_id`
- Definition: an authorized instruction that bounds one mission.
- Required attributes: program_id, mission_code, objective, status, owner.
- Optional attributes: scope notes, evidence list, approval record.
- Owner: Program Board or delegated mission authority.
- Lifecycle: drafted, approved, in_execution, verified, certified, closed.

## PDS

- Canonical ID: `pds_id`
- Definition: a delivery squad assigned to execute a bounded mission scope.
- Required attributes: program_id, mission_order_id, squad_name, status, scope.
- Optional attributes: assignee roster, capacity, execution report.
- Owner: delivery orchestration authority.
- Lifecycle: ready, active, blocked, completed, certified, closed.

## Campaign

- Canonical ID: `campaign_id`
- Definition: a coordinated set of related missions or change work.
- Required attributes: program_id, name, objective, status.
- Optional attributes: theme, priority, timeline.
- Owner: program governance.
- Lifecycle: proposed, active, paused, completed, closed.

## Capability

- Canonical ID: `capability_id`
- Definition: a functional or architectural ability recognized by NOVA.
- Required attributes: name, description, domain, owner.
- Optional attributes: maturity, dependencies, certification status.
- Owner: architecture authority.
- Lifecycle: defined, validated, certified, deprecated.

## Contract

- Canonical ID: `contract_id`
- Definition: a governed interface or promise that constrains change.
- Required attributes: name, version, scope, owner.
- Optional attributes: compatibility rules, consumers, producers.
- Owner: contract authority.
- Lifecycle: proposed, published, active, superseded, retired.

## File

- Canonical ID: `file_id`
- Definition: a versioned repository artifact subject to change.
- Required attributes: path, repository, hash, owner.
- Optional attributes: language, type, contract references.
- Owner: repository governance.
- Lifecycle: created, modified, reviewed, certified, superseded, archived.

## Change

- Canonical ID: `change_id`
- Definition: a bounded modification proposal or committed alteration.
- Required attributes: program_id, mission_order_id, target scope, status, rationale.
- Optional attributes: branch, commit list, risk score.
- Owner: mission execution authority.
- Lifecycle: drafted, analyzed, approved, committed, certified, closed.

## Decision

- Canonical ID: `decision_id`
- Definition: an authoritative human or board outcome.
- Required attributes: actor, decision type, target, rationale, timestamp.
- Optional attributes: conditions, reservations, expiry.
- Owner: human decision authority.
- Lifecycle: proposed, issued, superseded, archived.

## Evidence

- Canonical ID: `evidence_id`
- Definition: a traceable artifact supporting a claim or decision.
- Required attributes: source, type, target, timestamp.
- Optional attributes: hash, excerpt, verifier.
- Owner: evidence authority.
- Lifecycle: collected, validated, referenced, archived.

## Risk

- Canonical ID: `risk_id`
- Definition: a potential adverse outcome associated with change.
- Required attributes: severity, likelihood, impact, source.
- Optional attributes: mitigation, residual risk, owner.
- Owner: risk authority.
- Lifecycle: identified, assessed, mitigated, accepted, closed.

## Approval

- Canonical ID: `approval_id`
- Definition: a human authorization of a bounded change or decision.
- Required attributes: approver, target, decision, timestamp.
- Optional attributes: conditions, expiry, escalation path.
- Owner: human authority.
- Lifecycle: pending, approved, rejected, revoked, expired.

## Certification

- Canonical ID: `certification_id`
- Definition: a formal confirmation that change evidence satisfies criteria.
- Required attributes: certifier, scope, result, evidence set.
- Optional attributes: reservations, expiry, revalidation date.
- Owner: certification authority.
- Lifecycle: pending, certified, certified_with_reservations, rejected, expired.

## Rollback Snapshot

- Canonical ID: `rollback_snapshot_id`
- Definition: a restorable state capture used for reversal or recovery.
- Required attributes: source state, timestamp, target scope, hash.
- Optional attributes: restore path, retention class.
- Owner: recovery authority.
- Lifecycle: created, validated, retained, restored, expired.

## Branch

- Canonical ID: `branch_id`
- Definition: a change line of work isolated for controlled modification.
- Required attributes: repository, name, base reference, owner.
- Optional attributes: purpose, linked mission, linked commits.
- Owner: delivery authority.
- Lifecycle: created, active, merged, closed, deleted.

## Commit

- Canonical ID: `commit_id`
- Definition: an immutable recorded change set.
- Required attributes: hash, branch, author, timestamp.
- Optional attributes: linked files, linked evidence, linked decision.
- Owner: delivery authority.
- Lifecycle: created, reviewed, certified, merged, superseded.

## Human Actor

- Canonical ID: `human_actor_id`
- Definition: a person authorized to review, approve, or certify change.
- Required attributes: identity, role, scope, status.
- Optional attributes: organization, delegation rights.
- Owner: identity authority.
- Lifecycle: active, suspended, revoked, retired.

## Agent Actor

- Canonical ID: `agent_actor_id`
- Definition: an automated or semi-automated NOVA actor that prepares analysis.
- Required attributes: identity, role, scope, status.
- Optional attributes: model version, policy version, confidence settings.
- Owner: automation authority.
- Lifecycle: registered, active, restricted, retired.


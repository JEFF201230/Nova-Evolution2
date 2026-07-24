# CHANGE REASONING MODEL

## Purpose

Define how NOVA reasons about a proposed or committed change.

## Reasoning Sequence

1. Identify the change context.
2. Resolve mission and program ownership.
3. Validate scope membership.
4. Compare modified files to authorized intent.
5. Detect conflicts and supersession.
6. Estimate risk and confidence.
7. Prepare decision context.
8. Route to human validation when required.
9. Block automatically when criteria fail.

## Legitimacy of a Modified File

A file is legitimate when:

- it belongs to the mission scope;
- it belongs to the authorized program context;
- its modification is supported by evidence;
- it does not violate protected boundaries;
- it does not conflict with a stronger certified contract or baseline.

## Mission Order Membership

A change belongs to a Mission Order only when:

- the Mission Order is active or explicitly authorized;
- the file is mapped to the mission scope;
- the change is linked to the mission evidence set.

## Out-of-Scope Detection

Out-of-scope detection occurs when a modified file:

- is absent from the approved scope;
- belongs to a different program;
- crosses into unauthorized runtime or kernel boundaries;
- affects an unapproved contract or protected baseline.

## Conflict Detection

Conflict exists when a change:

- overlaps another active change on the same target;
- supersedes a certified artifact without authority;
- violates a dependency constraint;
- contradicts a stronger rule or approval.

## Risk Estimation

Risk is estimated from:

- blast radius;
- number of impacted files;
- contract sensitivity;
- rollback complexity;
- evidence quality;
- change novelty;
- boundary proximity.

## Confidence Level

Confidence increases when:

- scope is explicit;
- evidence is complete;
- dependencies are resolved;
- traceability is strong;
- rollback is available.

Confidence decreases when:

- scope is partial;
- evidence is weak;
- conflicts exist;
- human intent is unclear.

## Commit Decoupling

Change reasoning may split one proposal into multiple commits when:

- the scope mixes unrelated concerns;
- rollback safety improves through separation;
- certification would be clearer with smaller units.

## Human Decision Required

Human decision is required when:

- risk exceeds automatic threshold;
- scope contains ambiguity;
- conflict resolution needs authority;
- certification is not deterministic;
- policy requires approval.

## Automatic Blocking

Automatic blocking occurs when:

- change is out of scope;
- required evidence is missing;
- protected boundaries are crossed;
- no valid rollback path exists;
- mandatory approval is absent;
- confidence is below minimum threshold.

## Mandatory Justification

Every non-trivial recommendation must include:

- why the change is legitimate or illegitimate;
- why the scope is valid or invalid;
- why the risk is acceptable or unacceptable;
- why human review is required or not required;
- why the block or proceed recommendation was produced.


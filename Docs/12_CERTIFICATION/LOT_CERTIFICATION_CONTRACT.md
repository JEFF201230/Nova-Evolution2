# Canonical Lot Certification Contract

## Status

Canonical, version 1.

## Purpose

This contract defines the minimal machine-readable certification used to
resolve domain and program lots without preventing a missing certification
from producing its own evidence.

`Docs/12_CERTIFICATION` is the canonical location because the certified
PROGRAM-001 migration maps the historical CEREBRAU `07_CERTIFICATION` corpus
to this directory with status `SATISFIED_IDENTICAL`.

## Canonical files

- Registry:
  `Docs/12_CERTIFICATION/certification-registry.json`
- New lot certification:
  `Docs/12_CERTIFICATION/<DOMAIN_OR_PROGRAM>/<LOT_ID>.certification.json`
- Resolver:
  `tools/nova-core-runtime/Cerebrau.Certification.psm1`

The registry is the resolution source. A certification file is the detailed
source for one lot. The registry never duplicates evidence or test results.

## Certification JSON

Every new certification contains exactly these required properties:

| Property | Rule |
|---|---|
| `MissionId` | Non-empty mission identifier. |
| `DomainId` | Exact domain or program identifier. |
| `LotId` | Exact lot identifier. |
| `Status` | `CERTIFIED`, `REJECTED`, or `PENDING_EVIDENCE`. |
| `CertifiedAt` | ISO-8601 timestamp for `CERTIFIED`; `null` otherwise. |
| `Evidence` | Array of real evidence references or observations. |
| `Tests` | Array of commands or observed test results. |
| `Regressions` | Non-empty regression result. |
| `PreviousLot` | Exact previous lot identifier or `null`. |
| `NextAuthorizedLot` | Exact next lot identifier or `null`. |

`CERTIFIED` requires at least one evidence item and one test item. The
resolver does not accept a certification file whose identity, status, or
continuity differs from its registry entry.

## Registry JSON

The registry has `SchemaVersion = 1` and an `Entries` array. Every entry
contains only:

- `DomainId`;
- `LotId`;
- `CertificationPath`;
- `Status`;
- `PreviousLot`;
- `NextAuthorizedLot`.

Duplicate entries for the same exact `DomainId` and `LotId` are
`CONTEXT_AMBIGUOUS`.

## Resolution

Resolution is exact and deterministic:

1. receive an explicit `DomainId`;
2. read the canonical registry;
3. retain entries whose `DomainId` is exactly equal;
4. validate one connected, acyclic lot chain;
5. stop at the first status other than `CERTIFIED`;
6. return the last contiguous `CERTIFIED` lot;
7. return its `NextAuthorizedLot`;
8. when an implementation contract is supplied explicitly, verify that it
   contains that exact lot identifier.

No current-directory, Git-branch, conversation, neighbouring-file, or fuzzy
fallback is permitted.

## Non-self-blocking rule

- An absent registry or absent entry resolves to `PENDING_EVIDENCE`.
- `PENDING_EVIDENCE` permits audit, tests, evidence collection, and
  certification backfill.
- `REJECTED` permits corrections confined to the rejected lot, retesting, and
  reevaluation.
- Only `CERTIFIED` advances the contiguous certified chain.
- A following lot cannot start while the current lot is not `CERTIFIED`.
- A lot never needs an existing certification in order to create that same
  certification.

## Atomicity and conflicts

`Write-LotCertification` validates all required fields before writing. It
writes the detail and registry through temporary files in their destination
directories and atomic replacement. A failed registry update restores the
previous detail. A `CERTIFIED` entry cannot be overwritten, and a second path
for the same domain and lot is rejected.

Git remains the history mechanism. No database, YAML document, or alternate
registry is introduced.

## Legacy compatibility

Existing Markdown certifications are not migrated globally. They may be
referenced by the registry only when:

- the registry status is `CERTIFIED`;
- the referenced file exists;
- the file contains an explicit `VERDICT : GO`;
- its explicit next lot matches `NextAuthorizedLot`.

Legacy documents are resolution evidence only. New and backfilled
certifications use the JSON contract above.

## Mission outcome to lot certification

Mission execution, authority decision, and lot certification are three
distinct stages:

1. the Mission runtime produces a technical outcome and an official report;
2. the authority produces an accepted, rejected, or pending decision;
3. `MissionOutcomeToLotCertificationPolicy` evaluates the complete outcome
   against the current lot contract.

No `OfficialStatus`, authority decision, or final Mission state is sufficient
by itself to certify a lot.

The policy returns exactly one of these decisions:

- `CERTIFIED`;
- `PENDING_REVIEW`;
- `REJECTED`;
- `EXECUTION_FAILED`;
- `CANCELLED`.

`Complete-DomainLot` remains a binary terminal operation. It accepts only
`CERTIFIED` and `REJECTED`. The other three decisions remain outside
`Complete-DomainLot` and cannot be silently reduced to `REJECTED`.

### Certified

`CERTIFIED` requires all of the following:

- `OfficialStatus` is `SUCCESS` or `READY_FOR_REVIEW`;
- `AuthorityDecision` is `ACCEPTED`;
- `FinalMissionState` is `COMPLETED` or the explicit canonical equivalent
  `ACCEPTED`;
- the exit code is zero;
- the official report is present, structurally valid, fingerprinted, and
  consistent with the supplied outcome;
- output evidence is present, complete, captured after execution, valid, and
  fingerprint-bound to the report;
- at least one required validation is present and all required validations
  pass;
- regressions are explicitly `NONE` or qualified
  `NON_BLOCKING:<justification>`;
- all current lot contract criteria are explicitly satisfied.

Only `CERTIFIED` advances the certified chain and permits opening exactly the
immediately following lot.

### Pending review

`PENDING_REVIEW` applies to a technically valid outcome whose authority
decision is not final. It keeps the current registry entry
`PENDING_EVIDENCE`, preserves evidence, permits human review and retry, and
does not open another lot.

### Rejected

`REJECTED` applies after a technically completed execution when:

- authority explicitly rejects the result;
- certification evidence is absent, incomplete, or invalid;
- a required test is absent or fails;
- a blocking regression exists;
- regression state is not explicitly qualified;
- a current lot contract criterion is not satisfied.

It writes the existing terminal `REJECTED` registry status, preserves
evidence, permits correction and reevaluation, and never opens the next lot.

### Execution failed

`EXECUTION_FAILED` is a technical outcome, not an authority rejection. It
applies to `FAILED`, `PARTIAL`, `BLOCKED`, a non-zero exit code outside a
coherent cancellation, an absent or invalid official report, an incoherent
outcome tuple, or raw `NO_CHANGE`.

It keeps the current registry status, preserves available evidence, permits a
new execution, and does not call `Complete-DomainLot`.

### Cancelled

`CANCELLED` requires a coherent tuple containing both
`OfficialStatus=CANCELLED`, `FinalMissionState=CANCELLED`, and
`AuthorityDecision=NOT_APPLICABLE`. It keeps the current registry status,
preserves evidence, permits retry, and does not call `Complete-DomainLot`.

A cancellation signal contradicted by another terminal state is
`EXECUTION_FAILED` with reason `OUTCOME_CONTRACT_INVALID`.

### No change

Raw `OfficialStatus=NO_CHANGE` always resolves to `EXECUTION_FAILED` with
reason `NO_CHANGE_NOT_CANONICAL_FOR_DOMAIN_LOT`, in every execution mode:

- `BACKFILL`;
- `IMPLEMENTATION`;
- `CORRECTION`;
- `DOMAIN_CERTIFICATION`.

When no source change is expected, the canonical Mission outcome is
`SUCCESS` or `READY_FOR_REVIEW` with complete evidence, never `NO_CHANGE`.

## Mission outcome registry transitions

| Policy decision | Registry transition | Retry | Next lot |
|---|---|---|---|
| `CERTIFIED` | `CERTIFIED` through the canonical writer | No | Open exactly one when continuity is valid |
| `PENDING_REVIEW` | Keep `PENDING_EVIDENCE` | Yes | Never |
| `REJECTED` | `REJECTED` through the canonical writer | Yes | Never |
| `EXECUTION_FAILED` | Keep the current status | Yes | Never |
| `CANCELLED` | Keep the current status | Yes | Never |

No Mission outcome policy branch writes directly to the registry.

## Mission outcome non-self-blocking rule

Every decision other than `CERTIFIED` blocks the following lot but continues
to permit, for the current lot:

- evidence collection;
- test execution and re-execution;
- correction within the authorized scope;
- human review;
- another Mission execution;
- another authority decision;
- another certification attempt.

An unsuccessful or non-final decision can prevent advancement. It cannot
prevent production of the facts required to revise that same decision.

# IDENTITY STATE TRANSITION MATRIX

PROGRAM : PROGRAM-016

MISSION_ID : P16-MO-010-IMPLEMENTATION-RESERVE-LIFT

PDS_ID : P16-PDS-001

STEP : 2

STATUS : PRODUCED_AND_VALIDATED

---

## Purpose

Define the exhaustive state transition matrix for governed identity lifecycle handling in PROGRAM-016.

## Canonical States

- provisioned
- registered
- active
- suspended
- revoked
- deprovisioned
- delegated
- archived

## Transition Categories

- allowed
- forbidden
- conditional

## Transition Matrix

| From State | To State | Category | Authorized Actor | Preconditions | Postconditions | Event Emitted | Enforcement Rule | Rejection Case | Rejection Justification | Traceability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| provisioned | active | allowed | Identity authority | Approved owner, tenant, scope, and principal type | Principal becomes active and usable under policy | identity activated | Must fail closed if governance approval is missing | activation denied | Missing approved scope, tenant, owner, or principal type | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| registered | active | allowed | Identity authority | Canonical identity record exists and governance approval exists | Principal becomes active and usable under policy | identity activated | Must fail closed if canonical identity record is incomplete | activation denied | No canonical identity record or approval basis | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| active | suspended | allowed | Identity authority / security authority | Auditable suspension reason and declared scope | Principal is temporarily disabled | identity suspended | Must preserve audit and preserve ownership | suspension denied | No auditable reason or scope | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| active | revoked | allowed | Identity authority / security authority | Revocation authority and scope are explicit | Principal loses trust and active access immediately | identity revoked | Must remove access immediately and preserve evidence | revocation denied | No valid revocation authority | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| active | deprovisioned | allowed | Identity authority | Access is revoked before deprovisioning and retention obligations are satisfied | Principal is removed from active use | identity deprovisioned | Must revoke access before deprovisioning | deprovisioning denied | Access not revoked or retention rules unmet | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| suspended | active | allowed | Identity authority | Explicit reactivation approval exists | Principal returns to active use | identity reactivated | Must validate reactivation scope and authority | reactivation denied | Missing reactivation approval | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| delegated | active | allowed | Identity authority | Delegation expired or was revoked | Delegation state ends and principal becomes active again | delegation ended | Must preserve delegation lineage and scope | delegation end denied | No expiry, revocation, or authority trail | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| active | delegated | allowed | Identity authority / delegated authority | Bounded delegation scope and validity window exist | Principal acts under delegated boundary | identity delegated | Must enforce time-bound delegated scope | delegation denied | Missing delegation authority, scope, or validity window | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| active | archived | conditional | Identity authority | Archival policy and retention trace exist | Identity is retained as historical reference | identity archived | Must preserve audit history and traceability | archival denied | Retention or archival policy not satisfied | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| deprovisioned | archived | allowed | Identity authority | Historical trace preservation is satisfied | Identity is archived and no longer active | identity archived | Must preserve lineage and prior states | archival denied | Historical trace preservation missing | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| revoked | active | forbidden | None | None | No activation occurs | identity activation denied | Must fail closed without explicit governance override | activation denied | Revoked identities cannot reactivate without explicit authority | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| archived | active | forbidden | None | None | No restoration occurs | identity restoration denied | Must fail closed without explicit restoration decision | restoration denied | Archived identities require explicit restoration governance | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| deprovisioned | active | forbidden | None | None | No activation occurs | identity activation denied | Must fail closed without reprovisioning authority | activation denied | Deprovisioned identities cannot activate without reprovisioning authority | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| any | active across tenant boundary | forbidden | None | None | No cross-tenant activation occurs | cross-tenant activation denied | Must fail closed unless explicit authority exists | cross-tenant activation denied | Cross-tenant activation violates isolation | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| any | active without valid trust | forbidden | None | None | No federated admission occurs | federation denied | Must fail closed unless trust and protocol compatibility are valid | federation denied | Invalid trust or protocol compatibility | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |
| self | privileged change on self | forbidden | None | None | No privileged self-change occurs | self-change denied | Must fail closed for privileged identity changes | self-change denied | Privileged self-authorization is prohibited | `IDENTITY_CONTRACT.md` -> `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md` |

## Exhaustiveness Rules

1. Every governed identity state must be represented.
2. Every allowed transition must declare an authorized actor.
3. Every forbidden transition must declare a denial outcome.
4. Every transition must declare preconditions and postconditions.
5. Every transition must map to a canonical event.
6. Every enforcement rule must be auditable.
7. Every rejection must state its justification.
8. Every row must be traceable to the Identity Contract and the Identity Enforcement Technical Design.

## Validation Criteria

The matrix is valid only if:

- all canonical identity states are represented;
- allowed transitions are explicitly authorized;
- forbidden transitions are explicitly denied;
- actor authority is explicit;
- preconditions and postconditions are explicit;
- event mapping is explicit;
- enforcement rules are explicit;
- rejection cases and justifications are explicit;
- the matrix remains compatible with the certified Identity, Security, RBAC, and Audit contracts.

## Evidence

- `P16-MO-010_IMPLEMENTATION_RESERVE_LIFT.md`
- `P16-PDS-001_IMPLEMENTATION_RESERVE_LIFT_EXECUTION.md`
- `IDENTITY_ENFORCEMENT_TECHNICAL_DESIGN.md`

## Validation Result

PASS.


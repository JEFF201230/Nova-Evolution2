# PROGRAM OWNER DECISION

## DECISION ID

PO-WCF007-CURRENT-AUTHORITY-RATIFICATION-001

## SCOPE

WCF-007 — Authoritative Actions/Work Association

## DECISION

APPROVED

The Program Owner authorizes a governed current canonical ratification of WCF-007.

This authority is limited to the WCF-007 capability independently ratified by C-22 as the authoritative Actions/Work association without implicit prioritization.

ACTIONS remains authoritative for Action identity, lifecycle, tasks, commands, activities, executions, result, dependencies, history and provenance.

Work reads only a minimal immutable association by canonical WorkReference.

## ESTABLISHED BASELINE

The following facts are accepted as the governing baseline:

- WCF-007 capability validation: RATIFIED;
- canonical capability identity: authoritative Actions/Work association;
- ACTIONS remains authoritative for Action identity, lifecycle, tasks, commands, activities, executions, result, dependencies, history and provenance;
- Work reads only a minimal immutable association by canonical WorkReference;
- no implicit prioritization may be introduced;
- P3-ACTIONS-001F and P3-ACTIONS-001G are evidence for the capability only;
- P3-ACTIONS-001F and P3-ACTIONS-001G MissionId and CertifiedAt MUST NOT become historical WORK/WCF-007 provenance;
- historical WORK/WCF-007 MissionId is unavailable;
- historical WORK/WCF-007 CertifiedAt is unavailable;
- historical values MUST NOT be fabricated or reconstructed.

## AUTHORIZED CERTIFICATION SEMANTICS

A current canonical WCF-007 representation MAY be created only with:

CertificationOrigin:

CURRENT_AUTHORITY_RATIFICATION

HistoricalCertificationProvenance:

UNAVAILABLE

CapabilityValidation:

RATIFIED

Historical MissionId:

UNAVAILABLE

Historical CertifiedAt:

UNAVAILABLE

Authority:

PROGRAM_OWNER

AuthorityDecisionId:

PO-WCF007-CURRENT-AUTHORITY-RATIFICATION-001

## CONDITIONS

The ratification operation MUST:

1. reuse the existing governed authority-ratification mechanism;
2. remain deterministic and fail-closed;
3. preserve append-only certification history;
4. preserve registry continuity;
5. preserve unavailable historical provenance explicitly;
6. use the actual current ratification MissionId and actual ratification timestamp;
7. bind the resulting representation to this decision and verified WCF-007 evidence;
8. reject unauthorized use;
9. remain idempotent.

## PROHIBITIONS

This decision DOES NOT authorize:

- fabrication of a historical MissionId;
- fabrication of a historical CertifiedAt;
- reconstruction of historical WORK/WCF-007 certification provenance from Git;
- substitution of P3-ACTIONS-001F or P3-ACTIONS-001G provenance for historical WORK/WCF-007 certification provenance;
- manual editing of certification-registry.json;
- fabrication of certification JSON;
- rewriting or deletion of certification history;
- modification of WCF-007 product behavior;
- modification of NOVA product/runtime behavior solely for certification reconciliation;
- certification or closure of WCF-008;
- modification of VEEDDA.

## WCF-008 PROTECTION

WCF-008 remains:

PENDING_EVIDENCE

This authority does not authorize WCF-008 certification.

## FINAL AUTHORITY STATEMENT

The Program Owner approves only the governed current-authority ratification path for the already RATIFIED WCF-007 authoritative Actions/Work association capability.

This authority does not authorize product behavior changes or VEEDDA changes.

DECISION_STATUS: APPROVED
WCF_007_CAPABILITY: AUTHORITATIVE_ACTIONS_WORK_ASSOCIATION
WCF_007_CAPABILITY_VALIDATION: RATIFIED
CURRENT_AUTHORITY_RATIFICATION: AUTHORIZED
HISTORICAL_CERTIFICATION_PROVENANCE: UNAVAILABLE
HISTORICAL_MISSION_ID_FABRICATION: FORBIDDEN
HISTORICAL_CERTIFIED_AT_FABRICATION: FORBIDDEN
WCF_008: PENDING_EVIDENCE
PRODUCT_CODE_CHANGE_AUTHORIZED: NO
VEEDDA_CHANGE_AUTHORIZED: NO

END OF DECISION

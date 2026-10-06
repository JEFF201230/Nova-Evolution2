# NOVA PROGRAM BOARD — AUTHORIZATION DECISION

DecisionId:
NOVA-R09-WORK-DECISIONS-REAL-PATH-AUTHORIZATION-002

SubjectMissionId:
NOVA-R09-WORK-DECISIONS-REAL-PATH-001

RoadmapLot:
NOVA-R09

AuthorityRole:
NOVA Program Board

AuthorityIdentity:
Jean-Francois Touche — human founder/designer of NOVA and CEREBRAU; GitHub identity JEFF201230

AuthorityBasis:
Direct founder authority declaration by Jean-Francois Touche as supreme human authority for NOVA and CEREBRAU, recorded on 2026-10-06. The NOVA Program Board remains the governing authority for Mission Order approval.

Decision:
APPROVED

MissionIdConfirmed:
YES

ScopeConfirmed:
YES

AllowedPathsConfirmed:
YES

ForbiddenPathsConfirmed:
YES

AcceptanceCriteriaConfirmed:
YES

DependencyDecision:
NO_CEREBRAU_MISSION_DEPENDENCY_REQUIRED

DependencyEvidence:
Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_WORK_REAL_DATA_DISCOVERY_R08_R12.md establishes RoadmapDependency NOVA-R06 and CerebrauDependsOn NONE because NOVA-R06 has no official linked MissionId. No MissionId may be invented or substituted by approximation.

Program036Relationship:
SUPPORTING_AUTHORITY_ONLY

Program036AuthorityReference:
Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md; Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MISSION_ORCHESTRATOR.md; Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-DR-002_LOT_EXECUTION_POLICY.md

CurrentStateEvidenceRequired:
YES

CurrentStateEvidenceStatus:
PENDING_EVIDENCE

CurrentStateEvidenceReference:
.nova-data/project-tracking/NOVA_WORK_REFERENTIAL_CURRENT_STATE.json

CerebrauPreparationAuthorized:
YES

AutomaticLaunchAuthorized:
NO

AutomaticCertificationAuthorized:
NO

HumanCerebrauConfirmationStillRequired:
YES

DecisionReason:
The human founder authority confirms the R09 Mission Order as the governed candidate for CEREBRAU preparation only. The mission remains strictly limited to connecting the existing read-only Work Decisions path to Core, authenticated BFF and Work Decisions frontend without creating a second Decisions truth. HumanApprovalDecision remains the Source of Truth; HumanApprovalWorkflow.decide remains the canonical producer; IntegrationPersistedRecord(kind = HUMAN_APPROVAL) remains the canonical persistence; HumanApprovalWorkflow.history remains the canonical read model; WorkDecisionsQuery remains the existing Work read path. PROGRAM-036 is supporting historical/frontend governance only and is not treated as the identity of NOVA-R09. The NOVA-R06 roadmap dependency does not create a CEREBRAU MissionId dependency because no official linked NOVA-R06 MissionId exists and invention or fuzzy substitution is forbidden. CURRENT STATE evidence remains required for CEREBRAU admission and must be verified from the generated governed projection before preparation/launch proceeds. This approval does not authorize automatic Launch, automatic certification, mission success, or bypass of CEREBRAU controls.

RequiredChanges:
NONE

EvidenceReviewed:
- Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_R09_WORK_DECISIONS_REAL_PATH_MISSION_ORDER.md
- Docs/24_MODULES/WORK/DDEC_000_DECISIONS_DECISION.md
- Docs/24_MODULES/WORK/DDEC_000_DECISIONS_MATRIX.md
- Docs/24_MODULES/WORK/DDEC_001_WORK_DECISIONS_INTERNAL_READ_REPORT.md
- Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_WORK_REAL_DATA_DISCOVERY_R08_R12.md
- .nova-data/project-tracking/NOVA_WORK_REFERENTIAL_CURRENT_STATE.json — required runtime projection; pending repository-verifiable evidence at decision time
- Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_PROGRAM_ARCHITECTURE.md
- Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/PROGRAM_036_MISSION_ORCHESTRATOR.md
- Docs/19_PROGRAMS/PROGRAM-036_NOVA_FRONTEND_IMPLEMENTATION/P36-DR-002_LOT_EXECUTION_POLICY.md
- Docs/20_NOVA_PORTFOLIO/PROGRAM_BOARD.md
- Docs/02_PROJECT_MANAGEMENT/DECISION_REGISTER.md

DecisionTimestamp:
2026-10-06T22:48:34+02:00

FinalAuthorityState:
AUTHORIZED_FOR_CEREBRAU_PREPARATION

## Non-negotiable execution boundary

Human Authority Decision
→ CEREBRAU authority verification
→ mission modeling / packaging
→ Prepare
→ blocker control
→ explicit human CEREBRAU confirmation
→ Launch TEST

No stage may be bypassed.

# NOVA R09 — WORK DECISIONS REAL PATH — TEST SCOPE AUTHORIZATION 003

DecisionId:
NOVA-R09-WORK-DECISIONS-REAL-PATH-TEST-SCOPE-AUTHORIZATION-003

SubjectMissionId:
NOVA-R09-WORK-DECISIONS-REAL-PATH-001

RoadmapLot:
NOVA-R09

AuthorityRole:
NOVA Program Board

Decision:
AUTHORIZED_MINIMAL_TEST_SCOPE

FinalAuthorityState:
AUTHORIZED_FOR_MINIMAL_TEST_SCOPE

AuthorizationType:
SUPPLEMENTAL_AUTHORIZATION

RelationshipToBaseAuthorization:
ADDITIVE

BaseAuthorizationDecisionId:
NOVA-R09-WORK-DECISIONS-REAL-PATH-AUTHORIZATION-002

BaseAuthorizationPath:
Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_R09_WORK_DECISIONS_REAL_PATH_AUTHORIZATION_002.md

SupersedesBaseAuthorization:
NO

ReplacesBaseAuthorization:
NO

MissionOrderMutationAuthorized:
NO

BaseAuthorizationMutationAuthorized:
NO

ScopeMutationType:
TEST_ONLY_ADDITIVE_OVERLAY

ScopeMergePolicy:
BASE_ALLOWED_PATHS_PLUS_ADDITIONAL_ALLOWED_PATHS_ONLY

BaseAllowedPathsPolicy:
INHERIT_UNCHANGED

AdditionalAllowedPaths:

- apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx
- apps/nova-web/src/features/work/WorkOverviewPage.test.tsx

AdditionalAllowedPathsCount:
2

ForbiddenPathsPolicy:
INHERIT_UNCHANGED

AuthorizedPurpose:
Adapt only the minimum legacy test assertions that depend on the former Deliverables (2) and Decisions (1) counters when those counters no longer represent authoritative data exposed by the real read-only Work Decisions path.

AllowedModificationClass:

- test assertion
- test expectation
- test-only navigation label expectation

ProductionLogicChangesAuthorized:
NO

ProductionFixtureChangesAuthorized:
NO

WorkPageHeaderChangesAuthorized:
NO

WorkDeliverablesProductionChangesAuthorized:
NO

WorkOverviewProductionChangesAuthorized:
NO

RuntimeDecisionsChangesAuthorized:
NO

HumanApprovalWorkflowChangesAuthorized:
NO

DecisionsPersistenceChangesAuthorized:
NO

DecisionsSourceOfTruthChangesAuthorized:
NO

NewDecisionsProducerAuthorized:
NO

FictionalDecisionsFallbackAuthorized:
NO

LegacyCounterRestorationAuthorized:
NO

OtherAllowedPathsAdded:
NO

CerebrauPreparationAuthorized:
YES

CerebrauPreparationAuthorizationBasis:
BASE_AUTHORIZATION_002_PLUS_THIS_SUPPLEMENTAL_TEST_SCOPE

AutomaticLaunchAuthorized:
NO

AutomaticCertificationAuthorized:
NO

HumanCerebrauConfirmationStillRequired:
YES

RequiredValidation:

- dedicated R09 Work Decisions tests remain PASS
- apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx PASS
- apps/nova-web/src/features/work/WorkOverviewPage.test.tsx PASS
- applicable NOVA Web validation-matrix checks PASS
- git-diff-check PASS

FailClosedRules:

- missing BaseAuthorizationPath => BLOCK
- missing BaseAuthorizationDecisionId => BLOCK
- BaseAuthorization SubjectMissionId mismatch => BLOCK
- SubjectMissionId mismatch with injected Mission Order => BLOCK
- base authorization not APPROVED => BLOCK
- base CerebrauPreparationAuthorized not YES => BLOCK
- additional path outside the two explicitly listed paths => BLOCK
- production file modification under this supplemental authority => BLOCK
- WorkPageHeader modification => BLOCK
- fixture or Decisions fallback introduction => BLOCK
- runtime Decisions modification => BLOCK
- functional expansion into Work Deliverables or Work Overview => BLOCK
- automatic launch attempt => BLOCK
- automatic certification attempt => BLOCK

AuthorityResolutionRule:
Authorization 003 is the governed supplemental authorization head for this R09 execution state. It does not replace Authorization 002. The effective governed scope is obtained by loading Authorization 002 through the exact BaseAuthorizationPath and adding only the two AdditionalAllowedPaths declared by Authorization 003.

DecisionReason:
The R09 vertical slice is functionally connected and its dedicated tests pass. Two legacy non-regression tests remain incompatible because they assert historical navigation counters that are not authoritative Work Decisions data. The minimum authorized remediation is therefore limited to those two test files. No production behavior, source of truth, persistence, runtime Decisions behavior, fixture, WorkPageHeader behavior, Work Deliverables functionality, or Work Overview functionality is authorized to change.

RequiredChanges:
NONE
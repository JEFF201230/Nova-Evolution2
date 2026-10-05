<CEREBRAU_MISSION_CONTRACT>
{
    "missionId":  "NOVA-R08-WORK-PEOPLE-REAL-PATH-EVIDENCE-RECOVERY-001",
    "missionType":  "REMEDIATION",
    "lot":  "NOVA-R08-RECOVERY",
    "changesExpected":  true,
    "readOnly":  false,
    "architecturalDecision":  "Recover documentary evidence for the already implemented R08 Work People real runtime path after the prior mission was rejected solely by PATH_SCOPE_VIOLATION. No functional implementation change is authorized."
}
</CEREBRAU_MISSION_CONTRACT>

MISSION_ID: NOVA-R08-WORK-PEOPLE-REAL-PATH-EVIDENCE-RECOVERY-001
MISSION_TYPE: REMEDIATION
LOT: NOVA-R08-RECOVERY
CHANGES_EXPECTED: true
READ_ONLY: false
ARCHITECTURAL_DECISION: Recover documentary evidence for the already implemented R08 Work People real runtime path after the prior mission was rejected solely by PATH_SCOPE_VIOLATION. No functional implementation change is authorized.

MISSION: NOVA-R08 Work People Real Path Evidence Recovery

OBJECTIVE

Recover the rejected NOVA-R08-WORK-PEOPLE-REAL-PATH-001 mission by producing documentary evidence only.

The R08 implementation already exists in the current worktree.

The prior mission execution completed technically with:
- Codex ExitCode 0;
- vertical slice implemented;
- targeted and full test suites reported PASS;
- typechecks PASS;
- builds PASS;
- git diff --check PASS.

The prior official mission result was nevertheless:

OfficialStatus = PARTIAL
TechnicalClassification = PARTIAL
AuthorityDecision = REJECTED
FinalMissionState = REJECTED

The rejection was caused by these PATH_SCOPE_VIOLATION entries:

- apps/nova-web/dist/assets/index-aMAn_aXH.js
- apps/nova-web/dist/assets/index-Czqz2fVL.css
- apps/nova-web/dist/assets/index-lmoOEJD5.js
- apps/nova-web/dist/assets/index-MU3gD0pQ.css
- apps/nova-web/dist/index.html
- server/nova-core/work-people.integration.test.ts

The recovery MUST NOT repair, rewrite, normalize, regenerate, restore or delete any R08 implementation file.

READ AND VERIFY THE EXISTING R08 IMPLEMENTATION ONLY.

AUTHORITATIVE PRIOR EVIDENCE

Read:

tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/bootstrap-20261003T180129549/official-report.json

Also inspect when needed:

tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/bootstrap-20261003T180129549/official-report.md
tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/bootstrap-20261003T180129549/codex-transcript.txt

R08 TARGET VERTICAL SLICE

PeopleQueryService.GetWorkParticipants
→ WorkPeopleQuery
→ NovaCoreService.getWorkPeople
→ Core HTTP
→ authenticated BFF
→ frontend service/hook
→ WorkSurface
→ WorkPeoplePage

VERIFY FACTUALLY

1. The R08 production implementation remains present.
2. contracts/work-people.contract.ts exists and exposes the intended transport contract.
3. NovaCoreService exposes the Work People read.
4. Core HTTP exposes the Work People endpoint.
5. BFF exposes the authenticated Work People endpoint.
6. The frontend service and hook consume the real BFF path.
7. WorkSurface no longer imports or invokes getWorkPeopleFixture.
8. WorkPeoplePage consumes the real transport projection.
9. No runtime fallback to fictional People data exists.
10. BusinessPerson remains distinct from RuntimeAgent and TechnicalAgent.
11. server/nova-core/work-people.integration.test.ts belongs to the R08 implementation and was omitted from the original allowedPaths.
12. The five apps/nova-web/dist changes are frontend build artefacts produced during the original R08 execution.
13. The six PATH_SCOPE_VIOLATION entries were the causal reason for the prior authority rejection.
14. No other authority rejection cause is present in the prior official report.
15. The existing targeted R08 tests still pass where they can be executed without modifying production/generated files.
16. git diff --check passes for the relevant R08 implementation.

IMPORTANT VALIDATION RULE

Do NOT run a command that regenerates apps/nova-web/dist/** during this recovery.

Do NOT run frontend build commands that modify generated assets.

Tests and typechecks may be executed only when they do not mutate R08 implementation or generated build outputs.

PRESERVE UNCHANGED

All existing R08 implementation and evidence, including:

contracts/work-people.contract.ts

server/nova-core/nova-core.service.ts
server/nova-core/nova-core.http.ts
server/nova-core/work-people.http.test.ts
server/nova-core/work-people.integration.test.ts

server/nova-bff/nova-bff.app.ts
server/nova-bff/nova-bff.boundary.test.ts
server/nova-bff/nova-bff.server.ts
server/nova-bff/work-people.gateway.port.ts
server/nova-bff/work-people.gateway.ts
server/nova-bff/work-people.route.ts
server/nova-bff/work-people.route.test.ts

apps/nova-web/src/components/routes/WorkSurface.tsx
apps/nova-web/src/features/work/WorkPeoplePage.tsx
apps/nova-web/src/features/work/WorkPeoplePage.test.tsx
apps/nova-web/src/features/work/workPeople.service.ts
apps/nova-web/src/features/work/useWorkPeople.ts

apps/nova-web/dist/**

tools/cerebrau/missions/generated/NOVA-R08-WORK-PEOPLE-REAL-PATH-001.json
tools/cerebrau/missions/generated/NOVA-R08-WORK-PEOPLE-REAL-PATH-001.prompt.md
tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/**

DO NOT

- modify contracts/**
- modify server/**
- modify apps/nova-web/src/**
- modify apps/nova-web/dist/**
- modify the original R08 manifest
- modify the original R08 prompt
- modify the original R08 official report
- rewrite historical evidence
- delete or restore build assets
- git reset
- git clean
- git checkout
- start R09
- claim final R08 certification
- change WCF-006
- modify PEOPLE
- invent People fields absent from the authoritative producer

OUTPUT ONLY

Docs/00_GOVERNANCE/PROJECT_TRACKING/NOVA_R08_WORK_PEOPLE_REAL_PATH_EVIDENCE_RECOVERY_REPORT.md

The report must conclude with:

R08_IMPLEMENTATION_PRESENT = YES|NO
R08_IMPLEMENTATION_CHANGED_BY_RECOVERY = YES|NO
R08_REAL_PEOPLE_RUNTIME_PATH = PASS|FAIL
R08_FIXTURE_RUNTIME_FALLBACK = PRESENT|ABSENT
R08_TARGETED_TESTS = PASS|FAIL|NOT_RUN
R08_GIT_DIFF_CHECK = PASS|FAIL
PRIOR_PATH_SCOPE_VIOLATION_CONFIRMED = YES|NO
PRIOR_REJECTION_CAUSE_EXCLUSIVE = YES|NO
INTEGRATION_TEST_SCOPE_OMISSION_CONFIRMED = YES|NO
FRONTEND_DIST_BUILD_ARTIFACTS_CONFIRMED = YES|NO
UNAUTHORIZED_PRODUCT_CHANGE_BY_RECOVERY = YES|NO
READY_FOR_R08_AUTHORITY_REVIEW = YES|NO

Do not claim final R08 closure.
Human authority remains required.

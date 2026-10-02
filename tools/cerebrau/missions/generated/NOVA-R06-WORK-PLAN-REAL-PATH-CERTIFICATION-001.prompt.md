<CEREBRAU_MISSION_CONTRACT>
{
    "missionId":  "NOVA-R06-WORK-PLAN-REAL-PATH-CERTIFICATION-001",
    "missionType":  "CERTIFICATION",
    "lot":  "NOVA-R06",
    "changesExpected":  false,
    "readOnly":  true,
    "architecturalDecision":  "WORK_PLAN_REAL_PATH_CERTIFICATION"
}
</CEREBRAU_MISSION_CONTRACT>

MISSION_ID: NOVA-R06-WORK-PLAN-REAL-PATH-CERTIFICATION-001
MISSION_TYPE: CERTIFICATION
LOT: NOVA-R06
CHANGES_EXPECTED: false
READ_ONLY: true
ARCHITECTURAL_DECISION: WORK_PLAN_REAL_PATH_CERTIFICATION

MISSION_ID: NOVA-R06-WORK-PLAN-REAL-PATH-CERTIFICATION-001

Program: NOVA-AS-BUILT-COMPLETION
Lot: NOVA-R06
MissionType: CERTIFICATION
Profile: ARCHITECTURE
ExecutionMode: READ_ONLY_EVIDENCE
Repository: C:\DEV\NOVA_CORE_MVP_RUNTIME_AUTONOME_2026-07-24(1)\nova-core-mvp
ExpectedBranch: feature/nova-runtime-foundation

TITLE
Certify R06 Work Plan real runtime path

CONTEXT

The implementation of NOVA-R06-WORK-PLAN-REAL-PATH-001 is already present in the working tree.

The original R06 implementation execution completed successfully technically, but its authority decision was rejected because the declared mission scope and expected-file evidence were incomplete.

A subsequent remediation mission:
NOVA-R06-WORK-PLAN-REAL-PATH-REMEDIATION-001

confirmed that no additional source correction was required.

That remediation execution produced:
- Core complete: 547/547 PASS
- Runtime/WCF: 24/24 PASS
- BFF complete: 96/96 PASS
- Frontend complete: 162/162 PASS
- Core typecheck: PASS
- Frontend typecheck: PASS
- BFF strict lint/typecheck: PASS
- BFF build: PASS
- Vite build: PASS
- Planning/Core targeted: 10/10 PASS
- Work Plan/Overview/Activity targeted: 17/17 PASS
- extended Plan/Overview Page/Activity: 23/23 PASS
- git diff --check: PASS

The remediation was classified NO_CHANGE because REMEDIATION requires a workspace delta and the correct R06 implementation already existed before that remediation mission started.

This mission is therefore a read-only CERTIFICATION of the existing R06 implementation.

OBJECTIVE

Certify, from repository evidence and executable validations, that the current R06 Work Plan implementation establishes the real governed runtime path:

WorkPlanningQuery
→ NovaCoreService
→ NOVA Core HTTP
→ NOVA BFF
→ frontend Work Plan service/hook
→ Work Plan UI

and that the Work Plan runtime no longer depends on getWorkPlanFixture().

MANDATORY CERTIFICATION CHECKS

Verify without modifying repository source files that:

1. WorkPlanningQuery remains the authoritative Planning read source.

2. NovaCoreService.getWorkPlanning(projectId, workId) is reused.

3. The Core HTTP endpoint for Work Plan exists and uses the existing Work Planning query path.

4. The BFF Work Plan route and gateway exist and preserve:
   - authentication boundary
   - canonical project/work identity resolution
   - correlation ID propagation
   - strict transport validation
   - normalized errors
   - timeout/unavailability behavior

5. The frontend Work Plan service and hook consume the real BFF endpoint.

6. WorkSurface routes Work Plan through the real runtime path.

7. getWorkPlanFixture() is not imported or called by the Work Plan runtime path.

8. The legacy workPlanFixture.ts may remain in the repository only as non-runtime historical material.

9. The real Planning semantics remain exactly limited to the authorized states:
   - PLANNING_AVAILABLE
   - PLANNING_ABSENT
   - PLANNING_WITHDRAWN
   - PLANNING_UNAVAILABLE

10. No fabricated runtime fields such as probability, tasks, warning, synthetic phase title, fabricated remaining time or fabricated completion state are introduced by the R06 contract/transport/UI.

11. workId remains canonically equal to missionId.

12. No R06 change modifies the certified Planning domain authority:
   - server/domain/planning/**
   - server/domain/work/work-planning.query.ts
   - server/domain/work/work-planning.types.ts
   - server/runtime/**

13. No generated Vite dist artifact remains as an attributable R06 source change.

FILES TO INSPECT

contracts/work-plan.contract.ts

server/nova-core/nova-core.http.ts
server/nova-core/work-plan.http.test.ts

server/nova-bff/nova-bff.app.ts
server/nova-bff/nova-bff.server.ts
server/nova-bff/nova-bff.boundary.test.ts
server/nova-bff/work-plan.gateway.port.ts
server/nova-bff/work-plan.gateway.ts
server/nova-bff/work-plan.route.ts
server/nova-bff/work-plan.route.test.ts

apps/nova-web/src/components/routes/WorkSurface.tsx
apps/nova-web/src/features/work/WorkPageHeader.tsx
apps/nova-web/src/features/work/WorkPlanPage.tsx
apps/nova-web/src/features/work/WorkPlanPage.module.css
apps/nova-web/src/features/work/WorkPlanPage.test.tsx
apps/nova-web/src/features/work/workPlan.service.ts
apps/nova-web/src/features/work/useWorkPlan.ts
apps/nova-web/src/features/work/WorkActivityPage.test.tsx
apps/nova-web/src/features/work/WorkDecisionsPage.test.tsx
apps/nova-web/src/features/work/WorkDeliverablesPage.test.tsx

VALIDATION REQUIREMENTS

Run and report the repository validation suites necessary to prove the R06 vertical slice and its non-regression.

At minimum verify:
- Core complete tests
- Runtime/WCF tests
- BFF complete tests
- frontend complete tests
- Core typecheck
- frontend typecheck
- BFF strict lint/typecheck
- BFF build
- Vite build
- targeted Planning/Core tests
- targeted Work Plan/Overview/Activity tests
- git diff --check

If a global validation is unusable because of demonstrably pre-existing repository issues, report that fact precisely and do not misattribute it to R06.

READ-ONLY RULE

This is a CERTIFICATION mission.

Do not:
- modify source files
- create corrective source files
- delete source files
- refactor
- change contracts
- alter tests
- commit
- push
- modify certified Planning domain files
- modify server/runtime/**
- manufacture a repository delta merely to obtain certification

If a certification requirement fails, report the failure and stop. Do not repair it in this mission.

EXPECTED DECISION

Return READY_FOR_REVIEW only if the repository evidence and required validations demonstrate that the existing R06 Work Plan real runtime path satisfies this certification contract.

Otherwise return the precise blocking evidence.

Do not claim implementation work was performed by this certification mission.

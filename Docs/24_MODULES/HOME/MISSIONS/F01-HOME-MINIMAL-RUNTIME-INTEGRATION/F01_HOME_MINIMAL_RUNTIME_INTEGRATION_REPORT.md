# F01 Home Minimal Runtime Integration Report

Mission order: `F01-HOME-MINIMAL-RUNTIME-INTEGRATION-001`

Program: `NOVA-FRONT-RUNTIME-INTEGRATION`

Lot: `F01`

Date: 2026-09-02

## 1. Verdict

**GO**

HOME retains the authenticated, capability-specific, read-only Active Work chain. The HOME header and the Situation, Decision, and Background slots no longer present fixture business assertions as live Runtime truth. Active Work navigation uses each returned `work.workIdentity.workId`. No Core or Runtime semantic change, mutation, generic proxy, mission creation, or Runtime execution call was introduced.

Human final approval remains required under the certified mission facts.

## 2. Initial audited state

- The canonical Active Work implementation already used `GET /api/home/active-work`, an authenticated NOVA BFF route, `HttpHomeActiveWorkGateway`, the Core `GET /api/v1/work/active` read endpoint, `HomeActiveWorkQuery`, and `WorkCoreFoundation`/Runtime state.
- `ActiveWorkSection` and `ActiveWorkCard` already rendered contract fields and navigated with the returned work identity.
- `HomeHeader`, `PriorityInsight`, `NextBestAction`, `PendingDecisionCard`, and `BackgroundWorkSection` rendered live-looking fixture assertions.
- `SituationDetailsDrawer` rendered static blockers, people, dates, confidence, source, document, time-saved, and conflict assertions.
- `ObjectiveComposer` continued only into the frontend Work Setup flow; it did not create or execute a Runtime mission, but its descriptive copy overstated the connected behavior.
- The shared primary Work rail target used `homeFixture.priorityInsight.workId` (`work-001`) and therefore exposed a HOME fixture identifier outside canonical Active Work navigation.
- The repository was already materially dirty before F01, including unrelated documentation, People domain/Core/Runtime work, tools, and `apps/nova-web/dist` artifacts. Those changes were preserved.

## 3. Files modified

Production:

- `apps/nova-web/src/features/home/HomePage.tsx`
- `apps/nova-web/src/features/home/HomeHeader.tsx`
- `apps/nova-web/src/features/home/ActiveWorkSection.tsx`
- `apps/nova-web/src/features/home/PriorityInsight.tsx`
- `apps/nova-web/src/features/home/NextBestAction.tsx`
- `apps/nova-web/src/features/home/PendingDecisionCard.tsx`
- `apps/nova-web/src/features/home/BackgroundWorkSection.tsx`
- `apps/nova-web/src/features/home/homeFixture.ts`
- `apps/nova-web/src/features/situation-details/SituationDetailsDrawer.tsx`
- `apps/nova-web/src/components/shell/NavigationShell.tsx`

Tests:

- `apps/nova-web/src/features/home/HomePage.test.tsx`
- `apps/nova-web/src/features/home/homeActiveWork.service.test.ts`
- `apps/nova-web/src/features/situation-details/SituationDetailsDrawer.test.tsx`
- `apps/nova-web/src/components/shell/NavigationShell.test.tsx`
- `apps/nova-web/src/features/work-setup/WorkSetupFlow.test.tsx`

Report:

- `Docs/24_MODULES/HOME/MISSIONS/F01-HOME-MINIMAL-RUNTIME-INTEGRATION/F01_HOME_MINIMAL_RUNTIME_INTEGRATION_REPORT.md`

## 4. Files intentionally not modified

- `contracts/home-active-work.contract.ts`
- `apps/nova-web/src/features/home/useHomeActiveWork.ts`
- `apps/nova-web/src/features/home/homeActiveWork.service.ts`
- `apps/nova-web/src/features/home/ActiveWorkCard.tsx`
- `apps/nova-web/src/features/home/HomePage.module.css`
- `server/nova-bff/home-active-work.gateway.port.ts`
- `server/nova-bff/home-active-work.gateway.ts`
- `server/nova-bff/home-active-work.route.ts`
- `server/nova-core/home-active-work.query.ts`
- `server/nova-core/nova-core.service.ts`
- `server/nova-core/nova-core.http.ts`
- all F02-A Work Activity production files
- all Decision Runtime, Clarify/Canvas/Plan/Confirm Runtime, IAM, certification, and execution implementation files
- all unrelated pre-existing dirty files and generated `apps/nova-web/dist` files

## 5. Final architecture

```text
NOVA Web HOME
  -> GET /api/home/active-work (same-origin, credentials included)
  -> authenticated capability-specific NOVA BFF route
  -> HttpHomeActiveWorkGateway
  -> GET /api/v1/work/active (server-to-server)
  -> Nova Core HomeActiveWorkQuery
  -> WorkCoreFoundation
  -> Runtime mission/work/monitoring truth
```

The browser does not call Core `:4100`. No generic `/api/v1/missions` proxy was added. HOME does not call `POST /api/runtime/execute`, `POST /api/v1/missions`, or any other mutation.

## 6. Canonical data retained

Active Work continues to present only fields admitted by `HomeActiveWorkItem`:

- `goal`
- `workIdentity.workId`
- `mission.missionId`
- `lifecycle`
- `progress`
- `updatedAt`

The header derives only the factual count of returned Active Work items. Active Work cards continue to navigate with `work.workIdentity.workId`. Loading, empty, and error states for the Runtime read are explicit. Contract parsing remains exact and rejects additional fields.

## 7. Fixture/static business assertions removed or neutralized

- Header: removed fixture greeting, user identity, Decision count, and deadline; replaced with `Home` plus Runtime Active Work read/count state.
- Priority/Situation: removed `work-001`, blockers, missing CRM source, probability/confidence change, recommended action, explanation, and presentation CTA; retained a neutral unavailable slot.
- Decision: removed `decision-001`, due date, confidence, financial amount, consequence, and navigation; retained a neutral unavailable slot.
- Background: removed time-saved, conflict, missing-source, reconciliation, and comment-review assertions; retained a neutral unavailable slot.
- Situation drawer: removed all static business assertions and reduced the component to an unavailable-state explanation. HOME no longer opens it from fabricated intelligence.
- Objective Composer: retained the frontend Work Setup UX and now explicitly states that continuing does not create or execute a Runtime mission.
- Primary Work rail: removed its dependency on the fixture `work-001`; it now opens the neutral `/work` route. Real HOME work cards remain the route into a specific real work.
- `homeFixture.ts`: now contains only Work Setup suggestions and generic page-state UX copy; it no longer contains supposed live HOME business state.

## 8. Authentication/security proof

- `homeActiveWork.service.ts` remains unchanged and calls the same-origin `HOME_ACTIVE_WORK_PATH` with `method: GET` and `credentials: include`.
- `server/nova-bff/home-active-work.route.ts` remains unchanged and invokes `requireAuthentication` before the gateway.
- The full BFF suite passes, including anonymous rejection, exact authenticated HOME response, boundary, session, CSRF, and dedicated gateway tests.
- No authentication, session, CSRF, IAM, credential, secret, or Runtime-origin configuration was changed.

## 9. Core/Runtime mutation proof

- No canonical HOME contract, BFF HOME implementation, Core HOME implementation, or Runtime production file was modified by F01.
- Source-boundary audit found no `:4100`, `/api/v1/missions`, `/api/runtime/execute`, or POST call in production HOME frontend files.
- The canonical read chain tests prove read-only traversal through BFF, Runtime HTTP, `HomeActiveWorkQuery`, and WCF-001 without a fixture.
- No mission creation, lifecycle, monitoring semantic, event, provenance, Decision API, generic proxy, or Core mutation was introduced.

## 10. Tests executed with exact results

Final required results:

- `npm.cmd run typecheck` in `apps/nova-web`: **PASS**, TypeScript exit 0.
- `npm.cmd test -- --run` in `apps/nova-web`: **PASS**, 26 files, 145 tests passed, 0 failed.
- `npm.cmd run test:bff` at repository root: **PASS**, 63 tests passed, 0 failed.
- `node --import tsx --test server/nova-core/home-active-work.query.test.ts server/nova-core/home-active-work.integration.test.ts server/nova-bff/home-active-work.route.test.ts`: **PASS**, 7 tests passed, 0 failed.
- `npm.cmd run build -- --outDir ../../.tmp/f01-home-web-build-001 --emptyOutDir` in `apps/nova-web`: **PASS**, Vite 149 modules transformed and production assets emitted. The isolated output was then removed; the pre-existing dirty `dist` was untouched.
- focused HOME/shell/Work Setup regression command: **PASS**, 5 files, 28 tests passed, 0 failed.
- `git diff --check`: **PASS**.

Transparent interim checks:

- The first focused Vitest invocation used repository-relative filters from the web-package directory: **NO TESTS FOUND**, exit 1. The corrected package-relative command is the 28/28 PASS above.
- The first typecheck caught an inferred navigation-options type error after removal of the fixture path parameter: **FAIL**, 2 diagnostics. The navigation call was simplified to the static primary route and the final typecheck passed.
- An attempted neutralization of the shared shell profile caused 7 unrelated Work test failures expecting the existing `Standard` shell presentation. That out-of-scope shell-profile change was reverted. The final complete frontend suite passed 145/145; `HomeHeader` remains free of fixture identity and Decision status.

The frontend suite emits one existing React `act(...)` warning during the `/home` route-operability test after asynchronous HOME state updates; it does not fail the suite.

## 11. Remaining blocked capabilities

- canonical Situation analysis and detailed Situation drawer data
- blocker analysis and source-gap analysis
- next best action, probability, confidence, and gain estimates
- Decision Runtime read/write flow and Decision navigation from HOME
- background-work intelligence, time-saved estimates, and conflict reporting
- canonical user identity integration for the HOME header
- Clarify, Canvas, Plan, and Confirm Runtime integration
- mission creation and certified execution from HOME

## 12. Git scope proof

- `git status --short` was inspected before changes and showed extensive unrelated dirty work.
- Only the files listed in section 3 were changed for F01.
- Targeted diff of canonical HOME BFF/Core/Runtime and contract files is empty.
- The required prompt already present under the untracked HOME mission directory was preserved.
- No `git add`, `git restore`, `git clean`, commit, push, or destructive repository command was used.
- The temporary isolated build output created by F01 was verified by exact absolute path and removed after a successful build.
- Final targeted status and `git diff --check` passed; unrelated dirty work remains present and untouched.

## 13. Known limitations

- HOME is deliberately smaller: unsupported intelligence is shown only as unavailable, not inferred.
- Active Work remains a snapshot read; no new polling, SSE, or mutation was added.
- Work Setup remains frontend-only and does not survive as a created Runtime mission by virtue of this lot.
- The shared application shell still contains its pre-existing static profile presentation; F01 changes only the audited HOME header identity. Canonical identity integration remains out of scope.
- Human final approval is still required before mission acceptance.

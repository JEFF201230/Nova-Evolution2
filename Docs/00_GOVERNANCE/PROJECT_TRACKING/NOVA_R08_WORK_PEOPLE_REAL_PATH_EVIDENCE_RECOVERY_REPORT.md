# NOVA R08 Work People Real Path — Evidence Recovery Report

Mission: `NOVA-R08-WORK-PEOPLE-REAL-PATH-EVIDENCE-RECOVERY-001`  
Mission type: `REMEDIATION`  
Lot: `NOVA-R08-RECOVERY`  
Evidence review performed: 2026-10-04 11:34:36 +02:00  
Governance object: `WAVE`

## Scope and decision boundary

This recovery is documentary only. It verifies the already implemented R08 Work People runtime path and the reason the original mission was rejected. It does not repair, rewrite, normalize, regenerate, restore, or delete any R08 implementation or generated frontend asset. No frontend build command was executed.

This report is evidence for human authority review. It does not claim final R08 certification or closure.

## Evidence reviewed

- `tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/bootstrap-20261003T180129549/official-report.json`
- `tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/bootstrap-20261003T180129549/official-report.md`
- `tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/bootstrap-20261003T180129549/codex-transcript.txt`
- `tools/cerebrau/reports/missions/NOVA-R08-WORK-PEOPLE-REAL-PATH-001/bootstrap-20261003T180129549/codex-stdout.log`
- `tools/cerebrau/missions/generated/NOVA-R08-WORK-PEOPLE-REAL-PATH-001.json`
- The existing R08 contract, Core, BFF, frontend, test, and `dist` files in the current worktree.

## Existing production path verification

The R08 vertical slice remains present and connected:

`PeopleQueryService.GetWorkParticipants`
→ `WorkPeopleQuery`
→ `NovaCoreService.getWorkPeople`
→ Core HTTP
→ authenticated BFF
→ frontend service/hook
→ `WorkSurface`
→ `WorkPeoplePage`

| Layer | Current factual evidence | Result |
|---|---|---|
| Authoritative producer | `server/domain/people/people-query-service.ts:130` implements `GetWorkParticipants` against certified PEOPLE persistence. | PASS |
| Work projection | `server/runtime/work/work-people.query.ts` delegates temporal qualification to `GetWorkParticipants` and projects only `businessPersonId`, `workAssignmentId`, and PEOPLE qualification/provenance. | PASS |
| Transport contract | `contracts/work-people.contract.ts` exists and defines BFF/Core path builders, participant and qualification shapes, the `AVAILABLE`, `EMPTY`, `ABSENT`, and `UNAVAILABLE` states, and strict response parsing. | PASS |
| NovaCoreService | `server/nova-core/nova-core.service.ts:152` wires `PeopleQueryService` into `WorkPeopleQuery`; `getWorkPeople` is exposed at line 504. An unconfigured PEOPLE database yields explicit aggregate absence, not invented people. | PASS |
| Core HTTP | `server/nova-core/nova-core.http.ts:169` exposes `GET /api/v1/missions/:projectId/:workId/people`, verifies Work existence, invokes `getWorkPeople`, and maps the four transport states. | PASS |
| BFF gateway and route | `server/nova-bff/work-people.gateway.ts` calls the canonical Core path and validates the returned contract/identity. `server/nova-bff/work-people.route.ts:19` exposes `GET /api/work/:workId/people` and calls `requireAuthentication` before the gateway. The route is registered by `nova-bff.app.ts` and the HTTP gateway is installed by `nova-bff.server.ts`. | PASS |
| Frontend service and hook | `workPeople.service.ts` fetches the real BFF path with credentials and parses the shared contract. `useWorkPeople.ts` maps only real transport states and errors. | PASS |
| WorkSurface | `WorkSurface.tsx` calls `useWorkPeople` and passes its real ready/state projection into `WorkPeoplePage`. It neither imports nor invokes `getWorkPeopleFixture`. | PASS |
| WorkPeoplePage | `WorkPeoplePage.tsx` consumes `WorkPeopleAvailable` and renders only authoritative identifiers and qualification fields supplied by the transport. | PASS |

## Fixture and identity separation

A scoped search of the active frontend files (`WorkSurface.tsx`, `WorkPeoplePage.tsx`, `workPeople.service.ts`, and `useWorkPeople.ts`) returned no `getWorkPeopleFixture` reference. The legacy fixture module remains preserved, but it has no import or invocation on the R08 runtime path.

No fictional name, role, availability, reasoning, or person is synthesized by the active path. Explicit absence, empty, unavailable, not-found, and error states remain data/status outcomes rather than fixture fallbacks.

`BusinessPerson`, `RuntimeAgent`, and the technical-agent projection are distinct types and authorities:

- `server/domain/people/business-person.aggregate.ts:10` defines `BusinessPerson` with `BusinessPersonId` and PEOPLE recognition provenance.
- `server/runtime/orchestrator/orchestrator-runtime.types.ts:367` defines `RuntimeAgent` with agent identity and technical execution scopes.
- `server/runtime/work/work-technical-agent.types.ts:30` defines `WorkTechnicalAgent` as a MISSIONS/orchestrator projection of a `RuntimeAgent`, explicitly owning no People semantics.
- `server/runtime/work/work-people.test.ts` includes and passes the countertest “T8 never substitutes a Technical Agent for a Business Person.”

Therefore no RuntimeAgent or technical agent is promoted into the PEOPLE business-person projection.

## Original scope rejection recovery

The original generated mission manifest allowed the R08 contract, Core HTTP/service/test, BFF, and frontend source files, but omitted:

- `server/nova-core/work-people.integration.test.ts`
- `apps/nova-web/dist/**`

The integration test is substantively part of R08. It establishes a real `BusinessPerson` and Work assignment in PEOPLE persistence, starts Core and the BFF, authenticates through the BFF session flow, reads the Work People endpoint, and asserts that the authoritative business-person and assignment identifiers arrive through the transport without a fixture. The original official report also records this file as created by the original R08 execution. Its omission from `allowedPaths` caused its scope validation failure.

The five `dist` changes are frontend build artefacts from the original execution:

- Created: `apps/nova-web/dist/assets/index-aMAn_aXH.js`
- Created: `apps/nova-web/dist/assets/index-MU3gD0pQ.css`
- Deleted/replaced: `apps/nova-web/dist/assets/index-lmoOEJD5.js`
- Deleted/replaced: `apps/nova-web/dist/assets/index-Czqz2fVL.css`
- Modified: `apps/nova-web/dist/index.html`

The current `dist/index.html` points to the two new hashed assets, replacing the two prior hashes. The three present generated files share the original build timestamp `2026-10-03T16:14:10Z`. The original transcript states that the frontend Vite build passed, that two new hashed assets were generated, and that the two old hashed assets were replaced. The original official report records the same created/deleted/modified classification. Together these facts confirm that all five `dist` entries are build outputs from the original R08 execution, not independent product edits made by this recovery.

## Prior authority decision and exclusive cause

The authoritative original report records:

- `Status = PARTIAL`
- `TechnicalClassification = PARTIAL`
- `AuthorityDecision = REJECTED`
- `FinalMissionState = REJECTED`
- `Codex.Status = SUCCESS`
- `Codex.ExitCode = 0`
- `FinalAuthority.reasonCode = VALIDATION_OR_EVIDENCE_REJECTED`

Its `Errors` array contains exactly these six entries:

1. `PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-aMAn_aXH.js`
2. `PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-Czqz2fVL.css`
3. `PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-lmoOEJD5.js`
4. `PATH_SCOPE_VIOLATION:apps/nova-web/dist/assets/index-MU3gD0pQ.css`
5. `PATH_SCOPE_VIOLATION:apps/nova-web/dist/index.html`
6. `PATH_SCOPE_VIOLATION:server/nova-core/work-people.integration.test.ts`

The report contains exactly six non-passing required validations, all of type `pathScope`, matching those errors. Every expected-file validation and `repository-diff-check` passed. `Warnings` is empty. No other failed required validation, error, warning, authority reason, or rejection cause is present. The six path-scope violations are therefore the exclusive recorded cause of the prior rejection.

## Current non-mutating validation

No production or generated file was changed by these checks. No build was run.

| Check executed on 2026-10-04 | Result |
|---|---:|
| `node --import tsx --test server/runtime/work/work-people.test.ts` | PASS — 8/8 |
| `node --import tsx --test server/nova-core/work-people.http.test.ts server/nova-core/work-people.integration.test.ts` | PASS — 2/2 |
| `node --import tsx --test server/nova-bff/work-people.route.test.ts` | PASS — 5/5 |
| Project-local Vitest on `src/features/work/WorkPeoplePage.test.tsx` | PASS — 7/7 |
| Focused R08 total | PASS — 22/22 |
| `git diff --check` | PASS — exit 0 |

`git diff --check` emitted only Git line-ending notices and no whitespace error. A post-validation timestamp audit found the newest preserved R08 implementation/generated-file timestamp remained `2026-10-03T16:14:48Z`, before this recovery. The recovery created only this report.

## Review disposition

The implementation evidence, current focused tests, original manifest, and original official authority report consistently establish that the R08 real Work People path is present and operational, while the prior rejection was caused exclusively by allowed-path omissions affecting one R08 integration test and five generated frontend build artefacts. This documentary recovery is ready to be submitted to human R08 authority review; it does not itself close or certify R08.

R08_IMPLEMENTATION_PRESENT = YES
R08_IMPLEMENTATION_CHANGED_BY_RECOVERY = NO
R08_REAL_PEOPLE_RUNTIME_PATH = PASS
R08_FIXTURE_RUNTIME_FALLBACK = ABSENT
R08_TARGETED_TESTS = PASS
R08_GIT_DIFF_CHECK = PASS
PRIOR_PATH_SCOPE_VIOLATION_CONFIRMED = YES
PRIOR_REJECTION_CAUSE_EXCLUSIVE = YES
INTEGRATION_TEST_SCOPE_OMISSION_CONFIRMED = YES
FRONTEND_DIST_BUILD_ARTIFACTS_CONFIRMED = YES
UNAUTHORIZED_PRODUCT_CHANGE_BY_RECOVERY = NO
READY_FOR_R08_AUTHORITY_REVIEW = YES

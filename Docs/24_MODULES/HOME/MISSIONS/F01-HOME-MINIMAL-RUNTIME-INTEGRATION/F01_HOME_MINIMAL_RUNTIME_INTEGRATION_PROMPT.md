\# MISSION ORDER — F01 HOME MINIMAL RUNTIME INTEGRATION



MISSION\_ORDER\_ID: F01-HOME-MINIMAL-RUNTIME-INTEGRATION-001

PROGRAM: NOVA-FRONT-RUNTIME-INTEGRATION

LOT: F01

TITLE: Home Minimal Runtime Integration

MODE: BUILD — READ WRITE — STRICT



\## 1. OBJECTIVE



Bring NOVA HOME to the minimum truthful Runtime-integrated state authorized by:



Docs/24\_MODULES/0-UI-DESIGN/NOVA\_FRONT\_RUNTIME\_INTEGRATION\_PLAN.md



The implementation MUST preserve the existing authenticated canonical Active Work chain and remove or neutralize HOME business assertions that are currently backed only by demo fixtures/static frontend data.



The target is NOT to invent or implement missing NOVA intelligence.



The target is a truthful minimal HOME.



\## 2. AUTHORITATIVE CURRENT STATE



F02-A Work Activity has already been implemented and human-authority accepted.



Commit:



28657e9

feat(work): integrate activity through authenticated BFF



Do not modify F02-A unless a regression test proves that F01 directly breaks it.



HOME Active Work has already been audited.



The following canonical chain exists:



NOVA Web

→ GET /api/home/active-work

→ authenticated NOVA BFF

→ HttpHomeActiveWorkGateway

→ GET /api/v1/work/active

→ Nova Core HomeActiveWorkQuery

→ WorkCoreFoundation

→ Runtime mission/work/monitoring state



This chain is already proven by tests.



Do NOT rebuild it.



\## 3. CANONICAL HOME ACTIVE WORK CONTRACT



Authoritative contract:



contracts/home-active-work.contract.ts



Available truthful fields are:



\- workIdentity.workId

\- workIdentity.projectId

\- mission.projectId

\- mission.missionId

\- goal

\- lifecycle

\- progress

\- updatedAt

\- provenance.identity

\- provenance.lifecycle

\- provenance.progress



Do not infer additional business information from these fields.



\## 4. EXISTING CANONICAL IMPLEMENTATION



Frontend:



apps/nova-web/src/features/home/HomePage.tsx

apps/nova-web/src/features/home/useHomeActiveWork.ts

apps/nova-web/src/features/home/homeActiveWork.service.ts

apps/nova-web/src/features/home/ActiveWorkSection.tsx

apps/nova-web/src/features/home/ActiveWorkCard.tsx



BFF:



server/nova-bff/home-active-work.gateway.port.ts

server/nova-bff/home-active-work.gateway.ts

server/nova-bff/home-active-work.route.ts



Core:



server/nova-core/home-active-work.query.ts

server/nova-core/nova-core.service.ts

server/nova-core/nova-core.http.ts



Existing integration proof:



server/nova-core/home-active-work.integration.test.ts



The Active Work implementation MUST remain read-only and authenticated.



\## 5. AUDITED PROBLEM



HOME is only partially Runtime-integrated.



\### 5.1 ACTIVE WORK — CANONICAL



ActiveWorkSection and ActiveWorkCard consume HomeActiveWorkItem.



They display factual Runtime-derived values:



\- goal

\- workId

\- missionId

\- lifecycle

\- progress

\- updatedAt



No production fixture fallback was identified in this chain.



This capability MUST be preserved.



\### 5.2 PRIORITY INSIGHT / NOVA SITUATION — NON-CANONICAL



Files:



apps/nova-web/src/features/home/PriorityInsight.tsx

apps/nova-web/src/features/home/NextBestAction.tsx



They consume:



homeFixture.priorityInsight



Current fixture assertions include:



\- work-001

\- Situation · now

\- board presentation blocked by 3 comments

\- missing CRM source

\- probability 76% → 92%

\- recommended 15-minute action

\- explanation of why

\- Open presentation



These assertions are not supplied by the audited Runtime contract.



They MUST NOT be presented as Runtime truth.



Do NOT attach this fixture intelligence to a real Runtime workId.



\### 5.3 PENDING DECISION — NON-CANONICAL



File:



apps/nova-web/src/features/home/PendingDecisionCard.tsx



It consumes:



homeFixture.pendingDecision



Current fixture assertions include:



\- decision-001

\- Due in 4 days

\- 82% confidence

\- €420k cloud infrastructure decision

\- 15 July consequence



No canonical Decision Runtime contract was established for F01.



Decision Flow remains blocked by the integration roadmap.



These values MUST NOT be presented as production Runtime truth.



Do NOT create a fake Decision API.

Do NOT create a generic BFF proxy.

Do NOT invent decision data.



\### 5.4 BACKGROUND WORK — NON-CANONICAL



File:



apps/nova-web/src/features/home/BackgroundWorkSection.tsx



It consumes:



homeFixture.background



Current assertions include:



\- approximately 6 hours saved

\- 1 conflict detected

\- CRM source reconciliation

\- missing source

\- open comment review



These are not supplied by the audited Runtime contract.



They MUST NOT be presented as Runtime truth.



\### 5.5 SITUATION DETAILS DRAWER — STATIC BUSINESS ASSERTIONS



File:



apps/nova-web/src/features/situation-details/SituationDetailsDrawer.tsx



Current static assertions include:



\- 72% complete

\- 3 open comments

\- 1 missing source

\- confidence 76% → 92%

\- CFO review

\- 18 July board meeting

\- Sarah Chen

\- CRM Pipeline Export

\- Product Roadmap deck outdated by 6 days

\- 42 documents analysed

\- 3 of 4 sources validated

\- \~6 h saved

\- 1 conflict detected

\- multiple recommended actions



No audited Runtime source supplies these assertions.



They MUST NOT be presented as canonical runtime intelligence.



Do not fabricate replacement values.



\### 5.6 HOME HEADER — NON-CANONICAL



File:



apps/nova-web/src/features/home/HomeHeader.tsx



Current values come from:



homeFixture.header



including:



\- Good afternoon, Sarah.

\- 1 decision due in 4 days · 2 active work items



The user identity "Sarah" is fixture data.



The decision count/deadline is fixture data.



The active-work count MUST NOT remain hard-coded if a truthful Runtime count is displayed.



\### 5.7 OBJECTIVE COMPOSER / WORK SETUP



File:



apps/nova-web/src/features/home/ObjectiveComposer.tsx



Current behavior:



objective

→ onStartWorkSetup(objective)

→ NavigationShell setObjective(objective)

→ navigate('clarify')



This does NOT create a Runtime mission.



Clarify / Canvas / Plan / Confirm are not Runtime-integrated by F01.



Do not claim otherwise.



Do NOT add mission creation to this lot.



Do NOT call POST /api/v1/missions from HOME.



Do NOT call /api/runtime/execute.



Preserve the existing UX only if it remains clearly a frontend Work Setup flow and does not falsely claim Runtime execution.



\## 6. TARGET F01 BEHAVIOR



Implement the smallest truthful HOME compatible with the existing design.



\### Mandatory



1\. Preserve the existing HOME visual structure as much as possible.



2\. Preserve canonical Active Work.



3\. Active Work MUST continue to use:



GET /api/home/active-work



through the authenticated BFF.



4\. Active Work MUST NOT call NOVA Core directly from the browser.



5\. Real work navigation MUST use the real:



work.workIdentity.workId



6\. Loading, empty and error behavior for the canonical Active Work read MUST remain explicit.



7\. Remove, hide, disable, or truthfully neutralize business information that exists only in fixture/static demo data.



8\. Do not replace fictitious information with invented values.



9\. Do not derive unsupported intelligence from lifecycle/progress.



For example:



progress = 72



does NOT authorize:



\- "72% confidence"

\- "3 blockers"

\- "6 hours saved"

\- "next best action"

\- "decision due"

\- "validation probability"



10\. Keep the UI coherent when unsupported sections contain no canonical data.



11\. Prefer omission/neutral state over fabricated content.



12\. Preserve authentication.



\## 7. HEADER RULE



HOME may use canonical Active Work data to derive a simple factual count such as the number of returned active works.



It MUST NOT display:



\- fixture user identity

\- fixture decision count

\- fixture deadlines



unless a canonical source is proven during this mission.



Do not create an identity integration as part of F01.



\## 8. PRIORITY / SITUATION RULE



The Runtime contract currently provides no canonical:



\- situation analysis

\- blocker analysis

\- next best action

\- probability

\- confidence

\- gain estimate



Therefore F01 MUST NOT manufacture them.



If the current visual slot must remain for layout compatibility, render only a neutral/non-assertive state supported by the available data, or omit the unsupported business content.



Any use of a real Runtime work inside this area must be limited to fields explicitly present in HomeActiveWorkItem.



\## 9. DECISION RULE



Decision integration is OUT OF SCOPE.



Do not implement:



\- Decision Runtime API

\- Decision BFF gateway

\- decision inference

\- fake decision identifier

\- fake deadline

\- fake confidence

\- fake financial amount



The existing fixture decision MUST NOT masquerade as production truth.



\## 10. BACKGROUND WORK RULE



Background intelligence is OUT OF SCOPE unless an existing canonical source is discovered and objectively proven.



Do not create such a source during F01.



No invented:



\- time saved

\- conflict count

\- missing sources

\- background tasks



\## 11. SITUATION DRAWER RULE



Do not retain static business assertions as if they described the currently selected Runtime work.



Either:



\- feed the drawer exclusively from fields already proven canonical,



or



\- remove/disable the unsupported detailed intelligence for F01.



Do not invent a Situation API.



\## 12. HOME FIXTURE RULE



Audit:



apps/nova-web/src/features/home/homeFixture.ts



Remove production dependence on fixture business data wherever that data represents a supposed live NOVA state.



Fixture/test data may remain where strictly required for tests or non-business static UX copy, but MUST NOT be used as production runtime truth.



Do not perform unrelated fixture cleanup.



\## 13. AUTHENTICATION / SECURITY



Preserve:



requireAuthentication



for HOME BFF reads.



Do not:



\- bypass authentication

\- weaken CSRF

\- expose secrets

\- expose Runtime directly to the browser

\- create a generic Core proxy

\- alter DEV credentials

\- alter IAM architecture

\- alter session security



IAM implementation remains outside this lot.



\## 14. CORE / RUNTIME RESTRICTION



Preferred Core/Runtime modification count:



ZERO.



The existing read model already supplies the minimum canonical Home Active Work information.



Do not modify Runtime semantics merely to populate the HOME mock design.



No mutation.



No new lifecycle.



No new monitoring semantics.



No synthetic event.



No fake provenance.



\## 15. DESIGN RESTRICTION



This is an integration/stabilization lot, not a HOME redesign.



Preserve the existing HOME visual hierarchy and CSS wherever compatible with truthful data.



Do not perform broad CSS refactoring.



Do not alter unrelated navigation.



Do not redesign Work pages.



Do not redesign authentication.



\## 16. TESTS TO UPDATE



Audit and update at minimum:



apps/nova-web/src/features/home/HomePage.test.tsx

apps/nova-web/src/features/home/homeActiveWork.service.test.ts



Existing tests that explicitly require fixture business assertions MUST be corrected.



Examples include expectations for:



\- Good afternoon, Sarah.

\- 76% → 92%

\- Open presentation using work-001

\- decision-001

\- €420k

\- background 6 hours / conflict data



Tests MUST instead prove truthful F01 behavior.



\## 17. REQUIRED REGRESSION PROOFS



Run the relevant existing tests including:



server/nova-bff/home-active-work.route.test.ts

server/nova-core/home-active-work.query.test.ts

server/nova-core/home-active-work.integration.test.ts



Also run:



\- NOVA BFF tests

\- HOME frontend tests

\- frontend typecheck

\- NOVA Web build

\- git diff --check



If existing repository scripts provide the canonical commands, use those scripts.



Do not weaken tests merely to obtain PASS.



\## 18. REQUIRED ARCHITECTURE PROOF



At completion prove:



NOVA Web HOME

→ authenticated capability-specific BFF

→ HOME Active Work Gateway

→ Core read-only endpoint

→ HomeActiveWorkQuery

→ WorkCoreFoundation / Runtime truth



Also prove:



\- no browser → :4100 HOME request

\- no generic `/api/v1/missions` proxy introduced

\- no POST `/api/runtime/execute`

\- no Core mutation introduced

\- no fixture fallback for canonical Active Work

\- unsupported Situation/Decision/Background intelligence is not presented as live truth



\## 19. OUT OF SCOPE



Do NOT implement:



\- F02 changes

\- F03 Decision Flow

\- F04 Global

\- Clarify Runtime integration

\- Canvas Runtime integration

\- Plan Runtime integration

\- Confirm Runtime integration

\- Mission creation

\- certified execution

\- PromptPackage generation

\- Mission Execution Monitor

\- SSE expansion

\- IAM

\- generic API proxy

\- unrelated UI redesign



\## 20. GIT SAFETY



Repository contains unrelated dirty work.



Mandatory:



\- inspect git status before changes

\- modify only files necessary for F01

\- preserve all unrelated modifications

\- never use git add .

\- never use git add -A

\- never use git restore .

\- never use git clean

\- do not commit

\- do not push



At completion run targeted git status and git diff --check.



\## 21. REQUIRED REPORT



Create:



Docs/24\_MODULES/HOME/MISSIONS/F01-HOME-MINIMAL-RUNTIME-INTEGRATION/F01\_HOME\_MINIMAL\_RUNTIME\_INTEGRATION\_REPORT.md



Report MUST contain:



1\. Verdict: GO or NO GO

2\. Initial audited state

3\. Files modified

4\. Files intentionally not modified

5\. Final architecture

6\. Canonical data retained

7\. Fixture/static business assertions removed or neutralized

8\. Authentication/security proof

9\. Core/Runtime mutation proof

10\. Tests executed with exact results

11\. Remaining blocked capabilities

12\. Git scope proof

13\. Known limitations



\## 22. VERDICT RULE



GO only if all of the following are true:



\- Active Work remains canonical.

\- Browser HOME uses the authenticated BFF.

\- Real work navigation uses real workId.

\- No production fixture fallback exists for Active Work.

\- Fixture Situation intelligence is no longer represented as live truth.

\- Fixture Decision intelligence is no longer represented as live truth.

\- Fixture Background intelligence is no longer represented as live truth.

\- HOME header no longer presents fixture identity/decision status as live truth.

\- No unsupported Runtime intelligence is invented.

\- No Core mutation is introduced.

\- No generic proxy is introduced.

\- Authentication remains enforced.

\- Required tests pass.

\- Typecheck passes.

\- Build passes.

\- git diff --check passes.



Otherwise:



NO GO



and identify the first objective blocker.



\## 23. FINAL CONSTRAINT



F01 is a TRUTHFULNESS AND INTEGRATION mission.



Do not attempt to make the HOME mock appear fully intelligent by fabricating backend capabilities that do not yet exist.



The correct result is a smaller but truthful Runtime-backed HOME.



No assumption.

No invented business state.

No hidden fallback.

No unrelated refactor.


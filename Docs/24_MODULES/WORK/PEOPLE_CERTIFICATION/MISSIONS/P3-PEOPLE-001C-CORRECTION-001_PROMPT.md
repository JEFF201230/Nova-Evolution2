\# P3-PEOPLE-001C-CORRECTION-001

\## Targeted corrective mission for People Authority recertification blockers



\### 1. MISSION NATURE



This is a narrowly-scoped corrective implementation mission for:



`P3-PEOPLE-001C — People Authoritative Producer`



It exists solely to correct the two reproducible blockers discovered during authority recertification:



1\. revoked roles are silently reactivated by `resumeWorkAssignment`;

2\. accepted PEOPLE events contain runtime-mutable `Date` payloads.



This mission does NOT reopen the full PEOPLE program.



It does NOT authorize unrelated refactoring.



It does NOT authorize Planning.



It does NOT certify `001H`.



\---



\# 2. OBJECTIVE



Correct exactly the two current mandatory violations demonstrated by the recertification evidence, add regression tests, and prove no regression across PEOPLE and downstream certified layers.



Required result:



\- revoked role remains revoked after suspend/resume unless explicitly re-granted;

\- accepted event temporal payloads cannot be mutated after acceptance;

\- existing valid suspend/resume role behavior remains correct;

\- current PEOPLE tests and required downstream checks pass.



\---



\# 3. CANONICAL SOURCES



Read before changing anything:



`Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md`



`Docs/24\_MODULES/WORK/PEOPLE\_DOMAIN\_BLUEPRINT.md`



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/P3-PEOPLE-001C\_AUTHORITY\_RECERTIFICATION\_REPORT.md`



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/MISSIONS/P3-PEOPLE-001BC-AUTHORITY-RECERTIFICATION\_REPORT.md`



Inspect the current implementation before editing.



Do not infer requirements from memory.



\---



\# 4. GIT PREFLIGHT



Before any write:



run:



`git status --short`



Record pre-existing changes.



Preserve them.



Forbidden:



\- reset;

\- restore;

\- checkout destructive operations;

\- clean;

\- stash;

\- unrelated formatting;

\- unrelated refactor;

\- rewriting existing certifications.



The current worktree contains pre-existing modifications. Do not attribute them to this mission.



\---



\# 5. DEFECT C-001 — REVOKED ROLE REACTIVATION ON RESUME



Current problematic implementation is in:



`server/domain/people/people-authority.ts`



Current `resumeWorkAssignment()` maps all historical:



`assignment.roleAssignments`



through:



`upsertRolePeriod(...)`



This reopens roles that had already been explicitly revoked before suspension.



\## Required semantic behavior



On resume:



\- only roles that were effective immediately before suspension may become effective again;

\- roles revoked before suspension must remain revoked;

\- resume must not act as an implicit `AssignBusinessRole`;

\- no new role grant may occur without the canonical explicit command;

\- historical role periods must remain intact;

\- no retroactive rewriting of role history;

\- Owner behavior must remain consistent with the canonical resume semantics.



\## Required implementation approach



Audit how suspension currently closes effective roles.



Derive the resume set from actual authoritative historical state.



Do NOT add a new parallel role-status field unless demonstrably required.



Prefer reuse of existing periods and provenance.



Do not restore a role solely because a historical `RoleAssignment` object exists.



\---



\# 6. DEFECT C-002 — MUTABLE EVENT DATE PAYLOAD



Current event helper:



`event(...)`



uses only shallow:



`Object.freeze(...)`



This does not protect mutable JavaScript `Date` values stored in event payloads.



\## Required semantic behavior



After `PeopleAuthority` accepts a transition and returns a domain event:



\- consumers must not be able to mutate its effective business timestamp;

\- mutation of a caller-owned Date before/after event creation must not change accepted event history;

\- accepted event history must remain stable;

\- existing event contracts must remain type-compatible unless a minimal canonical correction requires otherwise.



\## Implementation constraints



Do NOT introduce a generic framework or deep-freeze library.



Use the smallest local solution appropriate to MVP.



Audit all PEOPLE domain event payload types for Date-bearing fields.



Correct the canonical event creation boundary so accepted event state is defensively isolated.



If another nested mutable PEOPLE value is demonstrably exposed by the same boundary, correct only what is necessary to satisfy event immutability without broad speculative refactoring.



\---



\# 7. REQUIRED REGRESSION TEST — ROLE RESUME



Add a focused test reproducing:



1\. create/recognize person as required;

2\. assign person to Work with at least:

&#x20;  - CONTRIBUTOR

&#x20;  - REVIEWER

3\. explicitly revoke REVIEWER;

4\. suspend assignment;

5\. resume assignment;

6\. assert REVIEWER is still not effective after resume;

7\. assert CONTRIBUTOR resumes if it was active at suspension;

8\. assert no implicit REVIEWER grant event exists;

9\. verify relevant event ordering.



The test must fail before the correction and pass after it.



Do not weaken assertions to fit current behavior.



\---



\# 8. REQUIRED REGRESSION TEST — EVENT IMMUTABILITY



Add a focused test that:



1\. obtains an accepted PEOPLE domain event containing `effectiveAt`;

2\. captures its timestamp;

3\. attempts mutation through the runtime Date object;

4\. proves the accepted event's canonical timestamp cannot be changed.



Also verify that mutating the original command/provenance Date object after acceptance cannot alter the event.



The test must prove runtime behavior, not merely TypeScript readonly typing.



\---



\# 9. FILES AUTHORIZED



Primary authorized implementation file:



`server/domain/people/people-authority.ts`



Authorized test file:



`server/domain/people/people-authority.test.ts`



If and only if technically necessary for the event immutability contract, one of the following may be modified:



`server/domain/people/people-authority.events.ts`



or an already-existing PEOPLE value-object implementation directly responsible for defensive Date handling.



Do not create a new utility module unless the existing structure makes a local correction impossible.



No persistence file may be modified unless a test proves that serialization/rehydration breaks due directly to this correction. In that case STOP and report rather than widening scope automatically.



\---



\# 10. FILES FORBIDDEN



Do not modify:



`Docs/24\_MODULES/WORK/PEOPLE\_IMPLEMENTATION\_CONTRACT.md`



`Docs/24\_MODULES/WORK/PEOPLE\_DOMAIN\_BLUEPRINT.md`



`Docs/12\_CERTIFICATION/PEOPLE/\*.certification.json`



`Docs/12\_CERTIFICATION/certification-registry.json`



`server/runtime/work/\*`



`server/nova-core/\*`



`server/nova-bff/\*`



`tools/\*`



`apps/\*`



`client/\*`



No Planning artifact.



No API/BFF/UI artifact.



\---



\# 11. TEST EXECUTION



After correction, execute at minimum:



`node --import tsx --test server/domain/people/\*.test.ts`



Run strict PEOPLE TypeScript typecheck.



Run:



`npm.cmd run typecheck:nova-core`



Run downstream Work tests:



`node --import tsx --test server/runtime/work/\*.test.ts`



Run Runtime tests required by current PEOPLE certification chain.



Run Core tests required by current PEOPLE certification chain.



Run applicable CEREBRAU certification checks if already established by the repository for PEOPLE certification.



Run:



`git diff --check`



A test not executed is not PASS.



Report exact commands and actual results.



\---



\# 12. DOWNSTREAM NON-REGRESSION



Because D, E, F, and G are already implemented, verify the correction does not break:



\- persistence replay/rehydration;

\- command service delegation;

\- PEOPLE queries;

\- Work read integration;

\- role temporal semantics;

\- Owner resume behavior;

\- event serialization assumptions.



Do not modify downstream code to force PASS.



If downstream breakage requires widening scope:



STOP and return NO GO.



\---



\# 13. CURRENT CERTIFICATION STATE



Do not rewrite historical certification JSON.



Do not claim C is recertified in this mission.



This mission only produces a technical correction result.



A separate authority recertification mission must be executed after this mission returns GO.



\---



\# 14. REPORT



Create:



`Docs/24\_MODULES/WORK/PEOPLE\_CERTIFICATION/MISSIONS/P3-PEOPLE-001C-CORRECTION-001\_REPORT.md`



Include:



1\. objective;

2\. Git preflight;

3\. canonical sources;

4\. defect C-001 root cause;

5\. defect C-002 root cause;

6\. files modified;

7\. exact correction;

8\. regression tests added;

9\. PEOPLE tests;

10\. PEOPLE typecheck;

11\. NOVA Core typecheck;

12\. Work tests;

13\. Runtime tests;

14\. Core tests;

15\. CEREBRAU checks if executed;

16\. `git diff --check`;

17\. downstream D–G non-regression;

18\. residual risks;

19\. whether C is ready for authority recertification;

20\. terminal verdict.



\---



\# 15. SUCCESS CRITERIA



GO only if:



\- revoked roles do not reappear after suspend/resume;

\- roles active at suspension resume correctly;

\- no implicit role grant is introduced;

\- accepted event temporal data cannot be mutated;

\- caller-owned Date mutation cannot alter accepted events;

\- PEOPLE tests pass;

\- targeted regression tests pass;

\- applicable typechecks pass;

\- Work tests pass;

\- Runtime/Core required checks pass;

\- no downstream regression is detected;

\- only authorized implementation/test files are modified;

\- no certification or canonical contract is modified.



\---



\# 16. FAILURE RULE



Return NO GO if:



\- either defect remains reproducible;

\- a required correction needs wider architectural change;

\- downstream compatibility breaks;

\- required tests fail;

\- unauthorized files must be modified;

\- the fix would weaken historical semantics;

\- the fix would require changing the canonical contract.



\---



\# 17. TERMINAL VERDICT



If all conditions pass, terminate exactly with:



`GO — P3-PEOPLE-001C-CORRECTION-001 — C READY FOR AUTHORITY RECERTIFICATION`



Otherwise terminate exactly with:



`NO GO — P3-PEOPLE-001C-CORRECTION-001 — C NOT READY FOR AUTHORITY RECERTIFICATION`



Do not execute the recertification mission.



Do not execute P3-PEOPLE-001H.



Do not open Planning.


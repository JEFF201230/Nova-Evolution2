MISSION\_ID: P3-PLANNING-001C-CORRECTION-003

PROGRAM: NOVA

DOMAIN: PLANNING

LOT: P3-PLANNING-001C

MISSION\_TYPE: CORRECTIVE IMPLEMENTATION

MODE: STRICT / EVIDENCE-DRIVEN / MINIMAL CHANGE



ROLE



Correct ONLY the current technical blocker established by:



P3-PLANNING-001C\_FINAL\_EVIDENCE\_REVIEW\_003\_REPORT.md



Current certification state:

PENDING\_EVIDENCE



P3-PLANNING-001D is NOT authorized.



This mission is NOT certification.



Do not trust a previous TECHNICAL GO as proof.

Implement the minimum production-safe correction and prove it independently.



============================================================

AUTHORITATIVE EVIDENCE — READ FIRST

============================================================



Read in full:



Docs/24\_MODULES/WORK/PLANNING\_IMPLEMENTATION\_CONTRACT.md



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_AUTHORITATIVE\_PRODUCER\_PROMPT.md



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_FINAL\_EVIDENCE\_REPORT.md



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_CORRECTION\_001\_REPORT.md



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_FINAL\_EVIDENCE\_REVIEW\_002\_REPORT.md



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_CORRECTION\_002\_REPORT.md



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_FINAL\_EVIDENCE\_REVIEW\_003\_REPORT.md



Read the complete current:



server/domain/planning/



Do not rewrite historical evidence.



============================================================

AUTHORITATIVE DEFECT

============================================================



FINAL EVIDENCE REVIEW 003 established one new current blocker:



INCOMPLETE AUTHORITATIVE REVALIDATION OF RUNTIME /

STRUCTURAL FOUNDATION INPUT.



PlanningAuthority can currently accept malformed nested values

that bypass their normal static factories at JavaScript runtime.



Independent review proved accepted Planning version 1 and accepted

business events for malformed cases including:



1\. WorkReference with empty identities.

2\. Phase with empty purpose.

3\. Schedule with an unqualified structural time value.

4\. Schedule with BusinessInstant using TECHNICAL\_TIMESTAMP origin.

5\. Priority with empty scope / qualification.

6\. Constraint with empty condition / source / scope.

7\. reversed applicability BusinessPeriod.

8\. PlanningProvenance with empty source.



The review additionally proved that plain structural nested values,

not only Reflect.construct instances, can cross the accepted producer

boundary.



This violates the complete-proposal validation requirement and

certified Foundation invariants.



============================================================

OBJECTIVE

============================================================



Make PlanningAuthority an authoritative runtime validation boundary

for the complete Planning proposal.



Before any Planning mutation is accepted, all business invariants

required by the certified Foundation and 001C contract must be

reasserted from observable values.



A value MUST NOT be trusted merely because:



\- TypeScript typed it;

\- it is instanceof a class;

\- its constructor is private in TypeScript;

\- it has a structurally compatible object shape;

\- it was supplied inside an already-created PlanningRevision.



Invalid runtime or structural input MUST fail closed before accepted

Planning state or accepted business events are produced.



============================================================

CORRECTION REQUIREMENTS

============================================================



Implement the minimum coherent correction inside:



server/domain/planning/



The correction MUST revalidate, at the authoritative acceptance

boundary, all relevant nested Foundation semantics required by the

existing contract.



At minimum reassert:



A. WORK REFERENCE



\- workId is valid according to the existing Foundation contract;

\- objectiveId is valid according to the existing Foundation contract;

\- empty/invalid identities cannot be accepted even if the admission

&#x20; port returns true.



B. PHASE / MILESTONE



Reassert all intrinsic Phase and Milestone invariants already defined

by the Foundation contract, including required identity/text/

qualification semantics.



An object must not become valid solely because it is instanceof the

expected class or structurally resembles it.



C. DEPENDENCY



Preserve and reassert:



\- valid identity;

\- valid references;

\- unique business identity;

\- graph validity / acyclicity;

\- all other existing Foundation Dependency qualification invariants.



Do not regress Correction 001 duplicate protection.



D. SCHEDULE



Reassert:



\- valid schedule identity/reference semantics;

\- valid business time semantics;

\- permitted BusinessInstant origin;

\- all other existing Foundation Schedule invariants.



Reject unqualified plain structural time objects.



Reject technical timestamps where the contract requires business time.



E. PRIORITY



Reassert:



\- valid identity/reference;

\- non-empty / qualified scope;

\- required qualification;

\- unique business identity;

\- all other existing Foundation Priority invariants.



Do not regress duplicate Priority protection.



F. CONSTRAINT



Reassert:



\- valid identity;

\- required condition;

\- required source;

\- required scope;

\- all existing qualification semantics;

\- uniqueness requirements.



G. APPLICABILITY / BUSINESS PERIOD



Reassert all existing period semantics.



At minimum:



\- valid bounds;

\- valid business instants;

\- allowed origins;

\- correct chronological ordering.



A reversed period must fail.



H. PROVENANCE



Reassert the complete PlanningProvenance contract from observable

values.



At minimum:



\- valid provenance type;

\- non-empty valid source;

\- valid causality;

\- valid business time;

\- provenance/businessCause consistency.



Do NOT treat instanceof alone as sufficient validation.



============================================================

IMPLEMENTATION PRINCIPLE

============================================================



Prefer reuse of canonical Foundation validation semantics.



Do NOT create two competing definitions of the same business rule.



If existing validation is trapped only inside static factory methods,

refactor minimally so the authoritative producer can invoke the same

canonical validation from observable runtime values.



The resulting architecture must have ONE semantic definition for each

Foundation invariant, not a factory rule plus a divergent Authority

copy.



Do not solve this merely by adding instanceof checks.



Do not solve it merely by hiding more constructors.



The correction must protect against BOTH:



\- direct runtime constructor forgery;

\- plain structurally forged nested objects.



============================================================

FAILURE SEMANTICS

============================================================



For every malformed proposal:



\- reject before accepted mutation;

\- no PlanningAuthorityResult;

\- no accepted domain event;

\- no new Planning version;

\- no change to current version;

\- no change to historical revisions;

\- no change to retained withdrawal causality evidence.



Use the existing appropriate Planning domain error taxonomy.



Do not invent successful normalization of invalid business input.



============================================================

REGRESSION PROTECTION

============================================================



The correction MUST preserve all previously closed blockers.



Reprove:



CORRECTION 001:



\- no planningFoundationAccess() bypass;

\- no planningAuthorityAccess() equivalent;

\- duplicate Dependency identity rejected;

\- duplicate Priority identity rejected;

\- changed withdrawal replay inputs fail closed.



CORRECTION 002:



\- direct PlanningRevision runtime construction rejected;

\- direct Planning runtime construction rejected;

\- structurally forged construction sentinel rejected;

\- non-contiguous history construction rejected;

\- non-latest current construction rejected;

\- Establish replay cases fail closed;

\- Revise replay cases fail closed;

\- withdrawal causality remains retained and consumed;

\- withdrawal causality cannot later Establish/Revise;

\- valid new causality can re-establish contiguously.



Do not weaken any existing guard to implement Correction 003.



============================================================

REQUIRED NEW REGRESSION TESTS

============================================================



Add explicit tests proving rejection of malformed runtime/structural

input.



At minimum cover:



1\. WorkReference with empty workId.

2\. WorkReference with empty objectiveId.

3\. WorkReference with both identities empty.

4\. Phase with invalid/empty purpose.

5\. malformed Milestone according to existing Foundation invariants.

6\. Schedule with plain structural/unqualified time object.

7\. Schedule with disallowed TECHNICAL\_TIMESTAMP BusinessInstant.

8\. Priority with empty/invalid scope.

9\. Priority with empty/invalid qualification.

10\. Constraint with invalid/empty condition.

11\. Constraint with invalid/empty source.

12\. Constraint with invalid/empty scope.

13\. reversed applicability period.

14\. applicability containing invalid/disallowed business time.

15\. PlanningProvenance with empty/invalid source.

16\. malformed provenance business time.

17\. structurally forged nested values that do not depend on private

&#x20;   constructor access.



For every rejection assert zero accepted effect.



Also retain tests for valid factory-created input to prove legitimate

Planning remains accepted.



============================================================

INDEPENDENT BEHAVIORAL PROOF

============================================================



Authored unit tests are NOT sufficient.



After implementation execute independent runtime probes reproducing

the exact Review 003 counterexamples.



The independent probe MUST attempt at least:



\- invalid WorkReference;

\- invalid Phase;

\- malformed Schedule time structural object;

\- TECHNICAL\_TIMESTAMP schedule time;

\- invalid Priority;

\- invalid Constraint;

\- reversed applicability;

\- invalid PlanningProvenance;

\- at least two plain structurally forged nested values.



Record actual outputs.



PASS requires every malformed case to be rejected with:



\- no accepted result;

\- zero accepted events.



Also independently prove one fully valid proposal still succeeds.



Do not create production artifacts for probes.



============================================================

AUTHORIZED FILE BOUNDARY

============================================================



Production/test changes are authorized ONLY under:



server/domain/planning/



And creation of the mandatory report:



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_CORRECTION\_003\_REPORT.md



Do NOT modify:



server/runtime/

server/nova-bff/

apps/

server/domain/people/

certification-registry.json

Docs/12\_CERTIFICATION/

server/nova-core/nova-core.bootstrap.ts

tools/nova-core-runtime/

any P3-PLANNING-001D+ artifact



Do not implement persistence.

Do not implement repository/database/migration.

Do not implement Timeline.

Do not implement Runtime integration.

Do not implement API/BFF/frontend.

Do not implement later Planning lots.



============================================================

HISTORICAL BOOTSTRAP RESERVATION

============================================================



server/nova-core/nova-core.bootstrap.ts



is outside this mission.



The existing historical discrepancy remains:



B — HISTORICAL EVIDENCE RESERVATION



Do not modify it.

Do not restore it.

Do not attribute it to this correction.

Do not use it to hide a current Planning defect.



============================================================

WORKTREE SAFETY

============================================================



The repository contains unrelated dirty and untracked work.



Do NOT execute:



git add .

git add -A

git restore .

git clean



Do not commit.

Do not push.



Do not alter unrelated files.



Use path-restricted inspection and validation.



============================================================

REQUIRED VALIDATIONS

============================================================



Execute and record exact results:



node --import tsx --test server/domain/planning/planning-authority.test.ts



node --import tsx --test server/domain/planning/planning-foundation.test.ts



node --import tsx --test server/domain/planning/\*.test.ts



npm run typecheck:nova-core



git diff --check



Also run:



npm test



if feasible.



Perform source scans proving:



\- exactly one PlanningAuthority implementation;

\- no public genuine construction sentinel/capability;

\- no planningFoundationAccess equivalent;

\- no planningAuthorityAccess equivalent;

\- no forbidden persistence/runtime/BFF/frontend boundary;

\- no MilestoneReached production command/event;

\- no Planning producer outside the domain.



============================================================

DECISION RULE

============================================================



TECHNICAL GO requires ALL of the following:



\- every Review 003 malformed-input counterexample is rejected;

\- complete nested Foundation validation is authoritative at runtime;

\- plain structural forgery is rejected;

\- valid canonical Planning still succeeds;

\- Correction 001 remains closed;

\- Correction 002 remains closed;

\- Foundation 001B semantics do not regress;

\- required Planning tests pass;

\- Nova Core typecheck passes;

\- git diff --check passes;

\- independent runtime probes pass;

\- no forbidden boundary is modified;

\- no new current blocker is discovered.



Otherwise:



TECHNICAL NO GO.



Do NOT repair unrelated defects.



============================================================

CERTIFICATION PROHIBITION

============================================================



THIS MISSION DOES NOT CERTIFY P3-PLANNING-001C.



Do NOT:



\- change PENDING\_EVIDENCE;

\- write CERTIFIED;

\- modify certification-registry.json;

\- modify/create certification receipts;

\- authorize P3-PLANNING-001D;

\- start P3-PLANNING-001D.



TECHNICAL GO means only:



ELIGIBLE FOR ANOTHER INDEPENDENT FINAL EVIDENCE REVIEW.



============================================================

MANDATORY FINAL REPORT — HARD COMPLETION GATE

============================================================



The mission is INCOMPLETE until the final report is physically

created and verified.



Create exactly:



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_CORRECTION\_003\_REPORT.md



The report MUST contain:



\# P3-PLANNING-001C CORRECTION 003 REPORT



\## Mission

\## Authoritative Evidence Read

\## Initial State

\## Files Inspected

\## Files Modified

\## Review 003 Blocker

\## Authoritative Validation Architecture

\## WorkReference Validation

\## Phase and Milestone Validation

\## Dependency Validation

\## Schedule Validation

\## Priority Validation

\## Constraint Validation

\## Applicability Validation

\## Provenance Validation

\## Failure Atomicity

\## Correction 001 Non-Regression

\## Correction 002 Non-Regression

\## Regression Tests Added or Modified

\## Independent Behavioral Proof

\## Validation Results

\## Foundation 001B Non-Regression

\## Forbidden Boundary Verification

\## Historical Bootstrap Reservation

\## Remaining Risks

\## Certification State

\## Final Technical Verdict



For every material PASS/FAIL, provide concrete evidence.



Record exact files changed.



Record exact independent probe outputs.



Do not claim certification.



============================================================

MANDATORY REPORT VERIFICATION

============================================================



Before mission termination verify:



1\. report exists;

2\. report is a regular file;

3\. report is non-empty;

4\. exact required title exists;

5\. Final Technical Verdict section exists;

6\. explicit TECHNICAL GO or TECHNICAL NO GO exists.



Resolve its ABSOLUTE Windows filesystem path.



Expected absolute path:



C:\\DEV\\NOVA\_CORE\_MVP\_RUNTIME\_AUTONOME\_2026-07-24(1)\\nova-core-mvp\\Docs\\24\_MODULES\\WORK\\PLANNING\\MISSIONS\\P3-PLANNING-001C-AUTHORITATIVE-PRODUCER\\P3-PLANNING-001C\_CORRECTION\_003\_REPORT.md



============================================================

MANDATORY TERMINAL CLOSURE

============================================================



THE FINAL TERMINAL OUTPUT MUST END WITH EXACTLY FOUR LINES.



If TECHNICAL GO:



FINAL\_REPORT\_CREATED: YES

FINAL\_REPORT\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_REPORT\_DOWNLOAD\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_VERDICT: TECHNICAL\_GO



If TECHNICAL NO GO:



FINAL\_REPORT\_CREATED: YES

FINAL\_REPORT\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_REPORT\_DOWNLOAD\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_VERDICT: TECHNICAL\_NO\_GO



If report creation or verification fails:



FINAL\_REPORT\_CREATED: NO

FINAL\_REPORT\_PATH: NONE

FINAL\_REPORT\_DOWNLOAD\_PATH: NONE

FINAL\_VERDICT: INCOMPLETE



No text may appear after these four lines.



A mission MUST NOT claim GO, NO GO, COMPLETE, SUCCESS,

READY\_FOR\_REVIEW, or equivalent unless the mandatory report exists

and has been verified.



============================================================

EXPECTED SUCCESS VERDICT

============================================================



TECHNICAL GO — P3-PLANNING-001C CORRECTION 003 COMPLETE —

ELIGIBLE FOR FINAL EVIDENCE REVIEW



This is NOT certification.


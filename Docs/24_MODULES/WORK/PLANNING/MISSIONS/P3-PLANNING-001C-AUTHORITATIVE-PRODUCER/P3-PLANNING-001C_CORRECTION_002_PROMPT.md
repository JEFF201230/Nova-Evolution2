MISSION\_ID: P3-PLANNING-001C-CORRECTION-002

PROGRAM: NOVA

DOMAIN: PLANNING

LOT: P3-PLANNING-001C

MISSION\_TYPE: CORRECTIVE IMPLEMENTATION

MODE: STRICT / EVIDENCE-DRIVEN / MINIMAL CHANGE



ROLE



You are executing the second corrective implementation mission for:



P3-PLANNING-001C — Planning Authoritative Producer.



P3-PLANNING-001C remains PENDING\_EVIDENCE.



P3-PLANNING-001D is NOT authorized.



A previous correction closed three earlier defects, but the independent:



P3-PLANNING-001C FINAL EVIDENCE REVIEW 002



returned NO GO after discovering three additional current implementation blockers.



Your mission is to correct ONLY those three current blockers.



Do not expand the Planning architecture.

Do not implement later lots.

Do not certify 001C.

Do not start 001D.



============================================================

AUTHORITATIVE EVIDENCE

============================================================



Read in full before modifying code:



1\.

Docs/24\_MODULES/WORK/PLANNING\_IMPLEMENTATION\_CONTRACT.md



2\.

Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_AUTHORITATIVE\_PRODUCER\_PROMPT.md



3\.

Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_FINAL\_EVIDENCE\_REPORT.md



4\.

Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_CORRECTION\_001\_REPORT.md



5\.

Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_FINAL\_EVIDENCE\_REVIEW\_002\_REPORT.md



The FINAL EVIDENCE REVIEW 002 is the authoritative defect list for this correction.



Do not rewrite historical evidence.



============================================================

AUTHORIZED OBJECTIVE

============================================================



Correct exactly these three blockers:



BLOCKER 1

Runtime construction bypass of PlanningAuthority.



BLOCKER 2

Invalid Establish/Revise replay acceptance.



BLOCKER 3

Withdraw causality is not retained strongly enough to prevent later causality reuse.



All three must be closed with implementation evidence and regression tests.



============================================================

BLOCKER 1 — RUNTIME CONSTRUCTION BYPASS

============================================================



Observed defect:



Planning and/or PlanningRevision can still be instantiated at runtime outside PlanningAuthority despite TypeScript private constructor declarations.



JavaScript runtime semantics therefore permit direct construction that bypasses:



\- PlanningAuthority;

\- admission;

\- command validation;

\- canonical event production;

\- aggregate invariants.



The independent review demonstrated direct construction of an invalid aggregate, including non-contiguous history and an invalid current version.



REQUIRED INVARIANT



PlanningAuthority MUST be the unique business producer of accepted Planning aggregate state.



A consumer importing production Planning modules MUST NOT be able to create an accepted Planning or PlanningRevision instance by directly invoking runtime constructors.



A TypeScript `private` keyword alone is NOT sufficient evidence.



REQUIRED CORRECTION



Implement the smallest production-safe runtime mechanism that makes unauthorized direct aggregate/revision construction fail closed.



The mechanism must:



\- be enforced at runtime;

\- not expose a genuine construction capability publicly;

\- not introduce a renamed equivalent of planningFoundationAccess();

\- not introduce a second producer;

\- preserve PlanningAuthority as the unique accepted producer;

\- preserve Foundation invariants;

\- preserve legitimate Establish/Revise/Withdraw behavior;

\- reject structurally forged authorization/capability values;

\- prevent construction of invalid Planning history through direct runtime constructor invocation.



Do not rely solely on compile-time privacy.



REGRESSION PROOF REQUIRED



Add an independent regression test proving direct runtime constructor invocation cannot create accepted:



\- Planning;

\- PlanningRevision;

\- non-contiguous revision history;

\- an aggregate whose current version is not the valid latest version.



The proof must exercise runtime behavior, not only TypeScript compilation.



============================================================

BLOCKER 2 — ESTABLISH / REVISE REPLAY SEMANTICS

============================================================



Observed defect:



The independent review demonstrated replay acceptance where command identity was not equivalent.



Examples included:



\- Establish replay accepted with a different expectedVersion such as 99;

\- Revise replay accepted with a different reason;

\- Revise replay accepted with a different expectedVersion such as 99;

\- these cases could return zero events as if they were legitimate idempotent replays.



REQUIRED INVARIANT



Idempotent replay may only be accepted when exact replay equivalence is truthfully provable from retained domain state.



A command with changed semantically relevant input MUST NOT be accepted as the same replay.



At minimum replay identity must account for all command fields whose difference changes the command's business identity or preconditions, including where applicable:



\- WorkReference;

\- Objective reference/admission inputs;

\- causality;

\- provenance;

\- businessCause;

\- reason;

\- expectedVersion;

\- proposed Planning content.



If current 001C state cannot prove exact replay equivalence, fail closed.



Do NOT invent replay success.



REQUIRED CORRECTION



Correct EstablishPlanning and RevisePlanning replay handling so that:



\- exact replay is accepted only when provable;

\- changed expectedVersion is rejected;

\- changed reason is rejected;

\- changed causality is rejected;

\- changed provenance/businessCause is rejected;

\- changed proposal content is rejected;

\- rejection produces zero accepted mutation and zero accepted business events;

\- normal first-time Establish and Revise remain valid;

\- legitimate version progression remains valid.



If durable exact replay receipts are outside 001C scope, fail closed instead of weakening identity checks.



REGRESSION PROOF REQUIRED



Tests must independently cover at minimum:



ESTABLISH:

\- first valid command succeeds;

\- changed expectedVersion replay fails;

\- changed causality replay fails;

\- changed provenance/businessCause replay fails;

\- changed proposal replay fails.



REVISE:

\- first valid revision succeeds;

\- changed expectedVersion replay fails;

\- changed reason replay fails;

\- changed causality replay fails;

\- changed provenance/businessCause replay fails;

\- changed proposal replay fails.



For every rejected case prove:



\- no new accepted revision;

\- no accepted domain event;

\- no mutation of previous accepted history.



============================================================

BLOCKER 3 — WITHDRAW CAUSALITY RETENTION

============================================================



Observed defect:



After a valid WithdrawPlanning operation, the withdrawal CausalityId is not retained in authoritative Planning state strongly enough to prevent later reuse.



The independent review demonstrated that the same causality could later be reused by a new Establish command with different business content.



REQUIRED INVARIANT



A causality already consumed by an accepted Planning mutation MUST NOT later authorize a different Planning mutation.



Accepted withdrawal causality must therefore remain detectable after withdrawal.



The correction must preserve:



\- immutable Planning history;

\- withdrawn state;

\- first withdrawal emits exactly one PlanningWithdrawn;

\- unverifiable withdrawal replay fails closed;

\- altered withdrawal causality/provenance/reason remains rejected;

\- consumed withdrawal causality cannot be reused by Establish;

\- consumed withdrawal causality cannot be reused by Revise;

\- no second Planning truth/store is introduced.



REQUIRED CORRECTION



Implement the smallest domain-level representation necessary for 001C to retain enough accepted causality evidence to reject reuse.



Do not introduce:



\- database persistence;

\- repository;

\- Runtime state;

\- BFF state;

\- frontend state;

\- external idempotency store;

\- second aggregate authority.



Any retained evidence must remain within the authorized Planning domain model.



REGRESSION PROOF REQUIRED



Tests must prove:



1\. first Withdraw succeeds;

2\. exactly one PlanningWithdrawn is emitted;

3\. Planning history remains intact;

4\. withdrawal causality remains recognized as consumed;

5\. same causality cannot later Establish different Planning content;

6\. same causality cannot later Revise Planning;

7\. changed withdrawal causality does not become an accepted replay;

8\. changed provenance does not become an accepted replay;

9\. changed reason does not become an accepted replay.



============================================================

FULL NON-REGRESSION REQUIREMENTS

============================================================



After correction, preserve all previously valid 001B/001C semantics:



\- Planning identity = WorkReference;

\- PlanningAuthority remains unique business producer;

\- EstablishPlanning remains supported;

\- RevisePlanning remains supported;

\- WithdrawPlanning remains supported;

\- explicit provenance;

\- explicit causality;

\- expected-version control;

\- immutable historical revisions;

\- contiguous revision versions;

\- at most one current applicable version;

\- valid Dependency graph;

\- unique Dependency business identity;

\- unique Priority business identity;

\- unique Phase/Milestone identities;

\- unique Constraint identity;

\- valid Schedule references;

\- valid Priority references;

\- deterministic event ordering;

\- zero accepted effect on failure;

\- no duplicate business events;

\- MilestoneReached remains absent;

\- no persistence;

\- no repository/database/migration;

\- no Work integration;

\- no Progress mutation;

\- no Monitoring mutation;

\- no Runtime authority;

\- no API;

\- no BFF;

\- no frontend;

\- no second Planning source of truth.



============================================================

AUTHORIZED CODE SCOPE

============================================================



Implementation changes are authorized ONLY under:



server/domain/planning/



Modify only files strictly necessary to close the three blockers and their tests.



The mission may additionally create ONLY its required final report outside that directory.



Do NOT modify:



server/nova-core/nova-core.bootstrap.ts

server/runtime/

server/nova-bff/

apps/

Docs/12\_CERTIFICATION/

certification-registry.json

PEOPLE

WORK runtime integration

Progress

Monitoring

Decision

Deliverables

Search

P3-PLANNING-001D or later lots.



Do not repair unrelated dirty files.



============================================================

HISTORICAL BOOTSTRAP RESERVATION

============================================================



The previous review classified the historical discrepancy involving:



server/nova-core/nova-core.bootstrap.ts



as a historical reservation rather than one of the three current implementation blockers.



Do NOT modify this file.



Do NOT rewrite or erase the reservation.



The final report must preserve its classification separately from current technical blockers.



============================================================

REQUIRED VALIDATIONS

============================================================



After implementation execute at minimum:



1\.

node --import tsx --test server/domain/planning/planning-authority.test.ts



2\.

node --import tsx --test server/domain/planning/planning-foundation.test.ts



3\.

node --import tsx --test server/domain/planning/\*.test.ts



4\.

npm run typecheck:nova-core



5\.

git diff --check



Also execute targeted runtime behavioral probes or tests proving closure of all three defects.



Passing authored tests alone is insufficient if the previous exploit can still be reproduced independently.



Perform source inspection proving:



\- no public genuine construction capability;

\- no equivalent renamed capability factory;

\- no second PlanningAuthority;

\- no forbidden persistence/Runtime/API/BFF/frontend integration;

\- no MilestoneReached production event.



============================================================

WORKTREE SAFETY

============================================================



The repository contains pre-existing dirty and untracked work.



Do NOT attribute unrelated modifications to this mission.



Do NOT execute:



git add .

git add -A

git restore .

git clean



Do not commit.

Do not push.

Do not rewrite unrelated files.



Use path-restricted inspection.



============================================================

CERTIFICATION PROHIBITION

============================================================



This corrective mission does NOT certify P3-PLANNING-001C.



Do NOT:



\- change PENDING\_EVIDENCE to CERTIFIED;

\- modify certification-registry.json;

\- create certification receipts;

\- authorize P3-PLANNING-001D;

\- start P3-PLANNING-001D;

\- claim CEREBRAU certification.



A technical GO means only that this corrective implementation is eligible for another independent final evidence review.



============================================================

DECISION RULE

============================================================



Return TECHNICAL GO only if:



\- Blocker 1 is objectively closed;

\- Blocker 2 is objectively closed;

\- Blocker 3 is objectively closed;

\- all required Planning tests pass;

\- Nova Core typecheck passes;

\- git diff --check passes;

\- no new blocking regression is found;

\- no forbidden boundary was modified.



Otherwise return TECHNICAL NO GO.



============================================================

MANDATORY FINAL REPORT — HARD COMPLETION GATE

============================================================



THIS REQUIREMENT IS MANDATORY.



THE MISSION IS INCOMPLETE UNTIL THE REPORT FILE HAS BEEN PHYSICALLY WRITTEN AND VERIFIED.



Create exactly:



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_CORRECTION\_002\_REPORT.md



The report MUST contain:



\# P3-PLANNING-001C CORRECTION 002 REPORT



\## Mission

\## Authoritative Evidence Read

\## Initial State

\## Files Inspected

\## Files Modified

\## Blocker 1 — Runtime Construction Bypass

\## Blocker 2 — Establish / Revise Replay Semantics

\## Blocker 3 — Withdraw Causality Retention

\## Regression Tests Added or Modified

\## Independent Behavioral Proof

\## Validation Results

\## Foundation Non-Regression

\## Forbidden Boundary Verification

\## Historical Bootstrap Reservation

\## Remaining Risks

\## Certification State

\## Final Technical Verdict



For every blocker provide:



\- original defect;

\- exact corrective mechanism;

\- exact files changed;

\- exact regression evidence;

\- PASS or FAIL.



For every validation provide the actual command and actual result.



Do not fabricate validation results.



============================================================

MANDATORY REPORT VERIFICATION

============================================================



After writing the report, you MUST verify all of the following before ending:



1\. the report exists;

2\. the report is a regular file;

3\. the report is non-empty;

4\. the report contains:

&#x20;  `# P3-PLANNING-001C CORRECTION 002 REPORT`

5\. the report contains:

&#x20;  `## Final Technical Verdict`

6\. the report contains an explicit final verdict.



Resolve and print the ABSOLUTE filesystem path.



The absolute path is expected to resolve under the current repository, for example:



C:\\DEV\\NOVA\_CORE\_MVP\_RUNTIME\_AUTONOME\_2026-07-24(1)\\nova-core-mvp\\Docs\\24\_MODULES\\WORK\\PLANNING\\MISSIONS\\P3-PLANNING-001C-AUTHORITATIVE-PRODUCER\\P3-PLANNING-001C\_CORRECTION\_002\_REPORT.md



Do not merely mention the relative report filename.



============================================================

MANDATORY TERMINAL CLOSURE

============================================================



THE FINAL TERMINAL OUTPUT MUST END WITH THESE FOUR LINES.



If the corrective implementation passes:



FINAL\_REPORT\_CREATED: YES

FINAL\_REPORT\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_REPORT\_DOWNLOAD\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_VERDICT: TECHNICAL\_GO



If the corrective implementation fails but the report was successfully created:



FINAL\_REPORT\_CREATED: YES

FINAL\_REPORT\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_REPORT\_DOWNLOAD\_PATH: <ABSOLUTE\_FILESYSTEM\_PATH>

FINAL\_VERDICT: TECHNICAL\_NO\_GO



If the report cannot be created or verified:



FINAL\_REPORT\_CREATED: NO

FINAL\_REPORT\_PATH: NONE

FINAL\_REPORT\_DOWNLOAD\_PATH: NONE

FINAL\_VERDICT: INCOMPLETE



These four lines MUST be the final four lines emitted by the mission.



No explanatory text may appear after them.



A mission MUST NOT be reported as:



SUCCESS

GO

TECHNICAL GO

COMPLETE

READY\_FOR\_REVIEW

CERTIFIED

ACCEPTED



when FINAL\_REPORT\_CREATED is NO.



============================================================

EXPECTED SUCCESS VERDICT

============================================================



TECHNICAL GO — P3-PLANNING-001C CORRECTION 002 COMPLETE — ELIGIBLE FOR FINAL EVIDENCE REVIEW



This is NOT a certification verdict.




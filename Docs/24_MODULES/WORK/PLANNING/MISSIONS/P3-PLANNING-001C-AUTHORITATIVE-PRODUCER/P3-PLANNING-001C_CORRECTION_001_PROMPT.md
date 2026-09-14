MISSION\_ID: P3-PLANNING-001C-CORRECTION-001

PROGRAM: NOVA

DOMAIN: PLANNING

LOT: P3-PLANNING-001C

MISSION: Planning Authoritative Producer — Corrective Remediation

MODE: STRICT / EVIDENCE-DRIVEN / MINIMAL CHANGE



ROLE



You are executing a corrective implementation mission for:



P3-PLANNING-001C — Planning Authoritative Producer.



This is NOT a new Planning lot.



This mission exists solely because the final evidence review:



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_FINAL\_EVIDENCE\_REPORT.md



returned NO GO.



The authoritative implementation contract is:



Docs/24\_MODULES/WORK/PLANNING\_IMPLEMENTATION\_CONTRACT.md



The original 001C mission prompt is:



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_AUTHORITATIVE\_PRODUCER\_PROMPT.md



Read all three documents before modifying code.



Do not reinterpret the Planning domain.



Do not broaden the scope.



Do not start P3-PLANNING-001D.



Do not certify P3-PLANNING-001C.



OBJECTIVE



Correct only the implementation defects that caused the final evidence review to return NO GO.



The resulting implementation must preserve the certified Planning Foundation semantics while making PlanningAuthority the unique business mutation acceptance boundary required by the contract.



AUTHORITATIVE CONTRACT REQUIREMENTS



The implementation contract states that:



\- Planning Authority is the unique Planning business producer.

\- Planning Authority is the unique acceptance point for Planning intentions.

\- every Planning write enters through Planning Authority;

\- the current Planning version is a version accepted by Planning Authority;

\- P3-PLANNING-001C must provide a unique producer;

\- EstablishPlanning, RevisePlanning and WithdrawPlanning are the canonical commands;

\- provenance and causality must be explicit;

\- duplicate business effects/events must not be produced;

\- failed mutations must have zero effect;

\- no persistence, Work integration, API, BFF, frontend or Runtime boundary belongs to 001C.



KNOWN BLOCKERS TO REMEDIATE



BLOCKER 1 — UNIQUE AUTHORITY BYPASS



Current implementation exposes a capability chain:



planning-foundation-access.ts

→ planningFoundationAccess()

→ planning-authority.guard.ts

→ planningAuthorityAccess()

→ Planning.of(...)



A consumer can directly import planningFoundationAccess(), obtain the genuine capability and call public Planning.of(...).



The final evidence probe demonstrated:



authorityBypassed = true

authorityAdmissionPolicyInvoked = false

eventsEmitted = 0



This violates the unique PlanningAuthority requirement.



Required outcome:



\- production callers outside PlanningAuthority must not be able to obtain a valid aggregate-construction capability;

\- a forged structurally equivalent object must remain rejected;

\- PlanningAuthority must remain capable of producing valid Planning aggregates;

\- direct aggregate construction must not become a competing business write path;

\- tests may use an explicitly test-scoped mechanism only if it cannot become a production business producer;

\- do not solve this by weakening or removing the authority assertion;

\- do not expose another equivalent public token factory under a different name;

\- do not introduce persistence or another authority.



BLOCKER 2 — DUPLICATE DEPENDENCY / PRIORITY ACCEPTANCE



The final evidence probe demonstrated that a proposal containing duplicate Dependency and Priority business entries can be accepted and can emit duplicate granular events.



Observed result included:



dependencyCount = 2

priorityCount = 2

duplicateDependencyEvents = 2

duplicatePriorityEvents = 2



Required outcome:



\- a complete Planning proposal must reject duplicate Dependency business identities;

\- a complete Planning proposal must reject duplicate Priority business identities;

\- invalid duplicate proposals must have zero accepted Planning mutation;

\- invalid duplicate proposals must emit zero accepted business events;

\- valid proposals and their existing event order must remain unchanged;

\- use the existing Planning error model where semantically applicable;

\- do not silently deduplicate invalid input unless the authoritative contract explicitly permits it.



BLOCKER 3 — WITHDRAW REPLAY / CAUSALITY



Current WithdrawPlanning replay logic relies on the withdrawn aggregate state and expected version but does not prove that the repeated command is the same business command.



The final evidence probe demonstrated that after withdrawal, a command with altered causality/provenance/reason can be accepted as a replay and return zero events.



Observed result included:



alteredWithdrawalAccepted = true

events = 0

currentVersion = null



Required outcome:



\- an exact legitimate withdrawal replay may remain idempotent;

\- a withdrawal with different causality must not be treated as the same replay;

\- different provenance must not be treated as the same replay;

\- different canonical reason must not be treated as the same replay;

\- causality reuse with different command content must fail deterministically;

\- explicit provenance/businessCause consistency must remain enforced;

\- no new persistent store may be introduced in 001C;

\- do not fake replay knowledge that is not represented by the current 001C model;

\- if exact withdrawal replay cannot be truthfully proven from the aggregate information available at this lot, fail closed rather than accepting an unverifiable replay.



HISTORICAL EVIDENCE ISSUE



The final evidence report also records a historical mission-scope inconsistency involving:



server/nova-core/nova-core.bootstrap.ts



Do NOT modify that file in this corrective mission.



Do NOT rewrite historical evidence.



Do NOT alter prior mission transcripts or certification records to hide the discrepancy.



The three implementation blockers above are independently sufficient for the current NO GO and are the implementation scope of this corrective mission.



AUTHORIZED CODE SCOPE



Inspect and modify only files strictly necessary inside:



server/domain/planning/



Expected candidates include:



planning-foundation-access.ts

planning-authority.guard.ts

planning-authority.ts

planning.aggregate.ts

planning-foundation.test.ts

planning-authority.test.ts



Other files under server/domain/planning/ may be modified only when strictly required to implement or test one of the three blockers.



Do not modify files outside server/domain/planning/ except for the final corrective report specified below.



FORBIDDEN SCOPE



Do NOT modify:



server/runtime/

server/nova-bff/

apps/

PEOPLE domain

WORK domain implementation

Progress

Monitoring

Decision domain

NOVA Core bootstrap

persistence

repositories

database

migrations

API

BFF

frontend

certification registry

existing certification JSON

P3-PLANNING-001A certification

P3-PLANNING-001B certification

P3-PLANNING-001C certification state

P3-PLANNING-001D or later lots



Do not create a second Planning store.



Do not create a second Planning aggregate.



Do not create a second Planning authority.



Do not create a generic Runtime or transport integration.



Do not perform unrelated cleanup or formatting.



IMPLEMENTATION RULES



1\. Read the current implementation before editing.

2\. Preserve the certified 001B structural semantics unless a change is strictly necessary to close the authority bypass.

3\. Prefer the smallest architecture that actually closes the capability leak.

4\. Do not rely on TypeScript type privacy alone when runtime JavaScript can bypass it.

5\. Do not consider a non-export from index.ts sufficient if a direct module import still exposes the capability.

6\. Do not replace one publicly importable token factory with another publicly importable token factory.

7\. Add regression tests reproducing each evidence-review failure.

8\. A regression test must fail against the defective behavior and pass after the correction.

9\. Preserve zero-effect-on-failure semantics.

10\. Preserve existing valid event ordering.

11\. Preserve immutable Planning revisions.

12\. Preserve WorkReference identity semantics.

13\. Do not emit MilestoneReached.

14\. Do not invent business data.

15\. Do not certify the lot.



REQUIRED REGRESSION PROOFS



The corrected test suite must explicitly demonstrate:



A. UNIQUE AUTHORITY



\- a forged access object cannot construct Planning;

\- production source does not expose an importable capability allowing arbitrary callers to construct accepted Planning aggregates;

\- PlanningAuthority can establish, revise and withdraw normally;

\- admission policy remains invoked for accepted Establish/Revise paths according to existing semantics;

\- direct bypass used by the final evidence probe is closed.



B. DUPLICATES



\- duplicate Dependency proposal is rejected;

\- duplicate Priority proposal is rejected;

\- rejection does not return an accepted aggregate;

\- rejection does not produce accepted domain events;

\- valid non-duplicate Dependency/Priority proposals still work.



C. WITHDRAW IDEMPOTENCE



\- initial valid withdrawal succeeds and emits PlanningWithdrawn exactly once;

\- an unverifiable or altered withdrawal replay is not silently accepted;

\- changed causality is rejected;

\- changed provenance is rejected;

\- changed reason is rejected;

\- no duplicate withdrawal event is emitted for a legitimately provable replay, if such replay remains representable by the 001C model;

\- if exact replay cannot be proven without persistence or additional historical state outside 001C, the implementation fails closed and the tests explicitly document that behavior.



REQUIRED VALIDATIONS



After implementation run, at minimum:



1\. Planning Authority targeted tests.

2\. Full server/domain/planning test suite.

3\. Planning Foundation targeted tests.

4\. npm run typecheck:nova-core

5\. git diff --check



Also inspect the final diff to confirm no forbidden file was modified by this mission.



Do not repair unrelated pre-existing dirty working-tree changes.



Do not stage, commit, push, restore or clean unrelated files.



Do not use:



git add .

git add -A

git restore .

git clean



unless separately and explicitly authorized by the human Program Director.



FINAL REPORT



Create exactly:



Docs/24\_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001C-AUTHORITATIVE-PRODUCER/P3-PLANNING-001C\_CORRECTION\_001\_REPORT.md



The report must contain:



\# P3-PLANNING-001C CORRECTION 001 REPORT



\## Mission

\## Scope

\## Files inspected

\## Files modified

\## Blocker 1 — Unique Authority

\## Blocker 2 — Duplicate Business Entries

\## Blocker 3 — Withdrawal Causality and Idempotence

\## Regression Tests Added or Modified

\## Validation Results

\## Forbidden Boundary Verification

\## Remaining Risks

\## Final Technical Verdict



For each blocker record:



\- original defect;

\- exact corrective mechanism;

\- exact files changed;

\- exact regression proof;

\- PASS or FAIL.



The report must distinguish:



\- implementation technical verdict;

\- certification state.



A technical GO does NOT certify P3-PLANNING-001C.



CERTIFICATION PROHIBITION



Do not:



\- mark P3-PLANNING-001C CERTIFIED;

\- change its PENDING\_EVIDENCE state;

\- create a certification receipt;

\- modify certification-registry.json;

\- authorize P3-PLANNING-001D.



Only the human Program Director may decide what happens after the corrective evidence is reviewed.



STOP CONDITION



Stop immediately and report NO GO if closing any blocker would require:



\- persistence;

\- Work integration;

\- Runtime/Core mutation outside Planning;

\- API/BFF/frontend work;

\- changing certified business semantics without explicit authority;

\- starting 001D;

\- inventing missing business authority or historical facts.



Otherwise implement only the minimum corrections, execute the required validations, write the corrective report, and stop.



FINAL EXPECTED TERMINAL VERDICT



If and only if all three implementation blockers are objectively closed and all required validations pass:



TECHNICAL GO — P3-PLANNING-001C CORRECTION 001 COMPLETE — AWAITING FINAL EVIDENCE REVIEW



Otherwise:



NO GO — P3-PLANNING-001C CORRECTION 001 INCOMPLETE


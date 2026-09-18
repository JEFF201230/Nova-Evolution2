\# CEREBRAU MISSION PROMPT

\# WORK-AUTHORIZED-STATE-001-CONTRACT-REPAIR



MISSION\_ID: WORK-AUTHORIZED-STATE-001-CONTRACT-REPAIR

PROGRAM: PROGRAM-003

DOMAIN: WORK

TARGET\_LOT: WORK-AUTHORIZED-STATE-001

MISSION\_TYPE: GOVERNANCE\_CONTRACT\_REPAIR

PROFILE: ARCHITECTURE

TARGET\_PRODUCT: NOVA

GOVERNANCE: CEREBRAU



MODES:

\- PROGRAM DIRECTOR

\- ARCHITECTURE

\- MVP STRICT

\- DELTA ONLY

\- FACTUAL ONLY

\- EVIDENCE DRIVEN

\- FAIL CLOSED

\- NO GLOBAL REAUDIT

\- NO PRODUCT IMPLEMENTATION

\- NO MANUAL CERTIFICATION

\- NO SPECULATION



======================================================================

1\. MISSION OBJECTIVE

======================================================================



Repair the existing CEREBRAU Domain V2 machine implementation contract

for:



DomainId = WORK

LotId = WORK-AUTHORIZED-STATE-001



The currently demonstrated blocker is exactly:



LOT\_CONTRACT\_INCOMPLETE:WORK-AUTHORIZED-STATE-001:EXPECTED\_SYMBOLS



This mission exists ONLY to resolve that contract-level blocker and prove

that WORK-AUTHORIZED-STATE-001 can enter its authorized IMPLEMENTATION

mode.



This mission MUST NOT implement WORK-AUTHORIZED-STATE-001 product code.



This mission MUST NOT reopen WCF-004.



This mission MUST NOT perform a global audit of NOVA.



======================================================================

2\. ACQUIRED STATE — DO NOT REAUDIT

======================================================================



Treat the following as acquired program state unless a direct material

contradiction is found in an authoritative source required by this mission.



2.1 P3-EVIDENCE-001B



P3-EVIDENCE-001B is officially CERTIFIED.



Business Evidence authority therefore exists and is available to the WORK

closure chain.



Do not reopen or modify the Evidence implementation.



2.2 WCF-004A



WORK contract admission WCF-004A has already been admitted as CERTIFIED.



The WORK Domain V2 chain has already resolved:



WCF-004A

&#x20; -> WCF-004

&#x20; -> WORK-AUTHORIZED-STATE-001

&#x20; -> WCF-008-CLOSURE



Do not recreate WCF-004A.



2.3 WORK Blueprint compatibility



The canonical protected Work Blueprint is:



Docs/24\_MODULES/WORK/WORK\_DOMAIN\_BLUEPRINT.md



Its canonical H1 is:



\# WD-001 — Work Domain Blueprint



The bounded WORK-only compatibility mechanism required by the approved

program architecture already exists.



Do not rename this Blueprint.



Do not create a competing:



\# WORK DOMAIN BLUEPRINT



Do not broaden the WORK-specific compatibility rule to other domains.



2.4 WCF-004 implementation



Mission:



WCF-004-IMPLEMENTATION-001



has completed technically.



Validated capabilities include:



\- canonical association:

&#x20; (projectId, workId, EvidenceId)



\- unique Work/Evidence association



\- idempotence



\- unlink



\- many-to-many association



\- persistence and recovery of links only



\- Evidence resolution from the Evidence authority



\- Certification resolution from its authority



\- explicit:

&#x20; AVAILABLE

&#x20; AVAILABLE\_EMPTY

&#x20; UNAVAILABLE



\- no Evidence payload persisted by WORK



\- no Evidence lifecycle ownership transferred to WORK



\- no CEREBRAU production dependency



Technical validation demonstrated:



\- WCF-004 scoped tests PASS

\- WORK regressions PASS

\- Evidence regressions PASS

\- Runtime tests PASS

\- NOVA Core tests PASS

\- strict typechecks PASS

\- git diff --check PASS



2.5 WCF-004 authority review



The authoritative review command returned:



ACCEPTED - authority review validated.



Immediately after this acceptance, CEREBRAU attempted continuation of the

WORK chain and stopped on:



LOT\_CONTRACT\_INCOMPLETE:WORK-AUTHORIZED-STATE-001:EXPECTED\_SYMBOLS



Therefore:



DO NOT rerun WCF-004 implementation.



DO NOT recreate WCF-004.



DO NOT manually alter WCF-004 certification.



DO NOT attempt to force another WCF-004 authority decision.



The target of this mission is the NEXT lot contract only.



======================================================================

3\. AUTHORITATIVE SOURCES

======================================================================



Inspect ONLY what is necessary to resolve the blocker.



Primary authoritative sources:



A.



Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/MISSION\_ORDER\_WORK\_AUTHORIZED\_STATE\_001.md



B.



Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/WORK\_IMPLEMENTATION\_CONTRACT.md



C.



Docs/24\_MODULES/WORK/WORK\_DOMAIN\_BLUEPRINT.md



D.



Docs/12\_CERTIFICATION/certification-registry.json



E.



tools/nova-core-runtime/Cerebrau.DomainOrchestration.psm1



Only inspect the exact Domain V2 contract parsing/resolution logic required

to understand EXPECTED\_SYMBOLS.



F.



Existing certified implementation contracts for neighboring domains/lots,

ONLY as syntax/schema precedents where required.



Prioritize:



\- WORK

\- ACTIONS

\- PLANNING

\- PEOPLE

\- EVIDENCE



Do not use unrelated legacy documents as authority.



======================================================================

4\. AUTHORITATIVE BUSINESS CONTRACT FOR WORK-AUTHORIZED-STATE-001

======================================================================



The authoritative Mission Order defines the objective as:



Provide Intelligence a deterministic, dated, read-only composition of

authorized Work contributions.



The exact composition combines, by WorkReference:



\- Work Core

\- Deliverables

\- Decisions

\- People

\- Planning

\- Actions

\- resolved Evidence



The composition is INTERNAL.



It is READ-ONLY.



It is NON-PERSISTENT.



It MUST NOT create a new authoritative aggregate.



It MUST NOT create a new authoritative state store.



It MUST NOT create a cache presented as authority.



It MUST NOT copy contributor truth into WORK.



======================================================================

5\. REQUIRED SEMANTIC INVARIANTS

======================================================================



The future WORK-AUTHORIZED-STATE-001 implementation must preserve:



5.1 Work identity



Composition is requested by canonical WorkReference.



5.2 Ownership



Every contribution remains owned by its authoritative producer.



WORK is a composition boundary, not the owner of contributor truth.



5.3 Source reference



The composition preserves the authoritative source reference for each

contribution.



5.4 Observation time



The composition preserves the observation time/date required by the

authorized Work-state contract.



5.5 Availability



Producer availability must remain explicit.



Do not collapse:



AVAILABLE



AVAILABLE\_EMPTY



UNAVAILABLE



into one state.



Do not silently convert producer failure into empty data.



5.6 Evidence lifecycle



Withdrawn, invalid or otherwise non-current Evidence must remain visible

according to the Evidence authority contract.



WORK must not rewrite Evidence lifecycle semantics.



5.7 Contradictions



Contradictory authoritative contributions must not be silently discarded,

normalized away or replaced by an invented fallback.



5.8 Determinism



The same authoritative inputs must produce the same composition.



Ordering must be deterministic.



5.9 Read-only behavior



Composition reads MUST have no side effect.



5.10 Persistence prohibition



No authorized Work-state snapshot is persisted as a second truth.



No mirrored repository.



No authoritative cache.



No new aggregate.



======================================================================

6\. CURRENT MACHINE BLOCKER

======================================================================



The canonical Domain V2 reader currently throws:



LOT\_CONTRACT\_INCOMPLETE:WORK-AUTHORIZED-STATE-001:EXPECTED\_SYMBOLS



This has been reproduced through:



Read-LotImplementationContract



for:



DomainId = WORK

LotId = WORK-AUTHORIZED-STATE-001



Therefore the demonstrated missing contract element is:



EXPECTED\_SYMBOLS



Do NOT assume additional missing fields unless the canonical parser proves

they are missing after EXPECTED\_SYMBOLS is repaired.



======================================================================

7\. EXPECTED\_SYMBOLS RESOLUTION RULE

======================================================================



You MUST NOT invent ExpectedSymbols from natural-language intuition.



Determine the exact required syntax and semantics from:



1\. the existing Domain V2 implementation-contract parser;

2\. existing certified neighboring contracts;

3\. the canonical naming conventions already present under:

&#x20;  server/domain/work/

4\. the authoritative WORK-AUTHORIZED-STATE-001 Mission Order;

5\. the WORK implementation contract.



ExpectedSymbols must describe only the minimum machine-verifiable symbols

necessary to prove that the future lot implementation exists.



The symbols MUST correspond to the authorized implementation family:



server/domain/work/work-authorized-state\*



Do NOT introduce symbols belonging to:



\- Intelligence

\- Synthesis

\- Confidence

\- Evidence authority

\- Actions authority

\- Planning authority

\- People authority

\- CEREBRAU runtime



Do NOT invent a public API.



Do NOT invent a BFF symbol.



Do NOT invent a UI symbol.



Do NOT invent persistence infrastructure.



If exact ExpectedSymbols cannot be determined unambiguously from existing

authoritative conventions:



STOP.



Do not modify the contract.



Return:



WORK-AUTHORIZED-STATE-001 CONTRACT BLOCKED — EXPECTED\_SYMBOLS AMBIGUOUS



and identify the exact conflicting or missing authority.



======================================================================

8\. AUTHORIZED CHANGE SCOPE

======================================================================



This is a CONTRACT REPAIR mission.



Modify only the minimum existing governance/contract artifact necessary to

supply the missing WORK-AUTHORIZED-STATE-001 ExpectedSymbols definition.



No product implementation is authorized.



Do not create:



server/domain/work/work-authorized-state\*.ts



during this mission.



Those files belong to the subsequent IMPLEMENTATION mission.



Do not modify:



server/domain/evidence/\*\*



server/domain/actions/\*\*



server/domain/planning/\*\*



server/domain/people/\*\*



apps/\*\*



BFF code



UI code



public API code



NOVA Runtime product code



VEEDDA



======================================================================

9\. CERTIFICATION SAFETY

======================================================================



Do NOT manually certify WORK-AUTHORIZED-STATE-001.



Do NOT fabricate a human approval.



Do NOT append:



APPROVED



CERTIFIED



ACCEPTED



or equivalent authority decisions unless the canonical existing CEREBRAU

mechanism itself produces that state under an already authorized transition.



Do NOT manually edit certification evidence to make the lot appear

certified.



Do NOT modify WCF-004 certification merely to bypass the blocker.



The objective is CONTRACT COMPLETENESS and IMPLEMENTATION AUTHORIZATION,

not product certification.



======================================================================

10\. REGISTRY SAFETY

======================================================================



Do not rewrite the certification registry merely to normalize formatting.



Do not remove existing EVIDENCE entries.



Do not remove existing WORK entries.



Do not alter unrelated certification history.



If the already program-preauthorized WORK chain requires a strictly

mechanical registry transition for the next lot, use only the existing

canonical Domain V2 mechanism.



Never create a competing registry.



Never create a shadow certification source.



======================================================================

11\. CEREBRAU / NOVA SEPARATION

======================================================================



CEREBRAU is the generic development governance and orchestration framework.



NOVA is the product being developed.



CEREBRAU may:



\- inspect contracts;

\- resolve lot state;

\- authorize development execution;

\- validate evidence;

\- orchestrate development;

\- certify through its canonical governance mechanism.



NOVA production code MUST NOT depend on CEREBRAU.



Do not introduce any import from CEREBRAU into:



server/domain/work/\*\*



or another NOVA production domain.



======================================================================

12\. DIRTY WORKSPACE SAFETY

======================================================================



The repository may contain legitimate changes from:



\- Evidence implementation/certification;

\- WCF-004A admission;

\- WORK Blueprint compatibility repair;

\- WCF-004 implementation;

\- WCF-004 report;

\- mission manifests/prompts;

\- other concurrent authorized work.



Do NOT:



git reset --hard



git clean



git checkout .



git restore .



git add .



Do not revert changes merely because they predate this mission.



Do not attribute pre-existing changes to this mission.



Only modify the exact contract delta authorized here.



If an external concurrent modification creates a direct structural conflict

with the exact target file:



STOP FAIL-CLOSED.



Do not destroy or overwrite the external work.



======================================================================

13\. EXECUTION PROCEDURE

======================================================================



Execute this procedure without unnecessary human interruption.



STEP 1 — Resolve exact parser requirement



Inspect the minimum relevant portion of:



tools/nova-core-runtime/Cerebrau.DomainOrchestration.psm1



Identify exactly:



\- how ExpectedSymbols is represented;

\- how it is parsed;

\- what makes it complete;

\- how symbols are later verified against implementation.



Do not modify the parser unless an independently demonstrated parser defect

makes the approved contract impossible to represent.



The current presumption is:



CONTRACT DATA MISSING



not:



PARSER DEFECT.



STEP 2 — Resolve precedent



Inspect the minimum number of existing complete contracts necessary to

establish the canonical ExpectedSymbols syntax.



Do not globally audit every domain.



STEP 3 — Derive exact symbols



Map the authoritative WORK-AUTHORIZED-STATE-001 responsibilities to the

minimum machine-verifiable symbol set.



Every selected symbol must have a documented reason.



No speculative symbol.



No future-domain symbol.



STEP 4 — Apply minimum repair



Modify only the required contract artifact.



Preserve all unrelated content byte-for-byte where practical.



STEP 5 — Canonical contract read



Execute the canonical equivalent of:



Read-LotImplementationContract

&#x20; Repository = current canonical repository

&#x20; DomainId = WORK

&#x20; LotId = WORK-AUTHORIZED-STATE-001



Required result:



NO LOT\_CONTRACT\_INCOMPLETE error.



Contract must resolve with:



Complete = True



STEP 6 — Resolve current lot



Use the canonical Domain V2 resolver.



Required state must remain coherent with:



DomainId = WORK



Previous completed/certified lot = WCF-004



Current lot = WORK-AUTHORIZED-STATE-001



Do not skip directly to WCF-008-CLOSURE.



STEP 7 — Resolve execution mode



Use the canonical lot execution-mode resolver for:



WORK-AUTHORIZED-STATE-001



Required intended result:



Mode = IMPLEMENTATION



Because product implementation does not yet exist, CodeExists may be False.



That is expected and MUST NOT be treated as a blocker.



STEP 8 — Scope verification



Verify that this mission changed only the contract-repair scope authorized

above.



Do not absorb unrelated dirty-worktree changes into the mission result.



======================================================================

14\. REQUIRED REPORT

======================================================================



Create a scoped report inside this mission's authorized mission directory:



Docs/24\_MODULES/WORK/EVIDENCE/MISSIONS/WORK-AUTHORIZED-STATE-001-CONTRACT-REPAIR/WORK\_AUTHORIZED\_STATE\_001\_CONTRACT\_REPAIR\_REPORT.md



The report must state:



1\. exact initial blocker;

2\. exact authoritative contract file repaired;

3\. exact ExpectedSymbols representation required by Domain V2;

4\. exact symbols selected;

5\. evidence/source supporting each selected symbol;

6\. exact files modified by this mission;

7\. Read-LotImplementationContract result;

8\. Resolve-CurrentLot result;

9\. Resolve-LotExecutionMode result;

10\. confirmation that no product implementation occurred;

11\. confirmation that no manual certification occurred;

12\. confirmation that WCF-004 was not reopened;

13\. remaining blocker, if any.



======================================================================

15\. SUCCESS CONDITIONS

======================================================================



SUCCESS requires ALL of the following:



\- the original EXPECTED\_SYMBOLS blocker is understood;

\- ExpectedSymbols is derived from authoritative existing material;

\- no speculative symbol is introduced;

\- minimum contract repair is applied;

\- canonical contract read succeeds;

\- contract Complete=True;

\- WORK chain remains sequentially coherent;

\- current lot resolves to WORK-AUTHORIZED-STATE-001;

\- execution mode resolves to IMPLEMENTATION;

\- no product implementation was performed;

\- no protected producer domain was modified;

\- no manual certification was fabricated;

\- no CEREBRAU dependency was introduced into NOVA;

\- no unrelated workspace changes were reverted or absorbed.



======================================================================

16\. FAIL-CLOSED CONDITIONS

======================================================================



STOP without speculative repair if:



\- ExpectedSymbols is genuinely ambiguous;

\- multiple authoritative contracts conflict;

\- WCF-004 is not actually recognized by canonical governance as the

&#x20; predecessor required to open this lot;

\- the repair would require modifying the protected Work Blueprint;

\- the repair would require changing contributor domain semantics;

\- the repair would require introducing a new source of truth;

\- the repair would require manual/fabricated certification;

\- concurrent work materially conflicts with the target contract;

\- the canonical Domain V2 mechanism proves structurally incompatible with

&#x20; the approved program architecture.



======================================================================

17\. TERMINAL OUTPUT — EXACT FORMAT

======================================================================



If all success conditions are satisfied, terminate exactly with:



WORK-AUTHORIZED-STATE-001 CONTRACT READY — IMPLEMENTATION AUTHORIZED



If blocked, terminate exactly with:



WORK-AUTHORIZED-STATE-001 CONTRACT BLOCKED — <EXACT\_BLOCKER>



Do not implement WORK-AUTHORIZED-STATE-001 after reaching READY.



STOP after the contract/gate repair.


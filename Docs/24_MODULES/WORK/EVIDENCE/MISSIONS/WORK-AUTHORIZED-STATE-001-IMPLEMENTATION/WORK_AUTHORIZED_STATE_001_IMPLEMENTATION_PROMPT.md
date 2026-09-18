\# CEREBRAU MISSION PROMPT

\# WORK-AUTHORIZED-STATE-001 — IMPLEMENTATION



MISSION\_ID: WORK-AUTHORIZED-STATE-001-IMPLEMENTATION-001

PROGRAM: PROGRAM-003

DOMAIN: WORK

LOT: WORK-AUTHORIZED-STATE-001

MISSION\_TYPE: IMPLEMENTATION

PROFILE: BUILD

TARGET\_PRODUCT: NOVA

GOVERNANCE: CEREBRAU



MODES:

\- PROGRAM DIRECTOR

\- ARCHITECTURE

\- MVP STRICT

\- IMPLEMENTATION

\- DELTA ONLY

\- FACTUAL ONLY

\- EVIDENCE DRIVEN

\- AUTO-REPAIR WITHIN AUTHORIZED SCOPE

\- FAIL CLOSED ON STRUCTURAL DRIFT

\- NO GLOBAL REAUDIT

\- NO SPECULATION



======================================================================

1\. OBJECTIVE

======================================================================



Implement and technically validate the authorized NOVA WORK capability:



WORK-AUTHORIZED-STATE-001



The required machine-verifiable declaration is:



WorkAuthorizedStateComposer



Its responsibility is to provide Intelligence with a deterministic,

dated, internal, read-only composition of the authoritative contributions

associated with one canonical WorkReference.



The composition must combine:



\- Work Core

\- Deliverables

\- Decisions

\- People

\- Planning

\- Actions

\- resolved Evidence



It MUST NOT become a new source of truth.



It MUST NOT persist an authoritative Work-state snapshot.



It MUST NOT mutate any contributing domain.



======================================================================

2\. ACQUIRED ENTRY GATES — DO NOT REAUDIT

======================================================================



The following state has already been established through canonical

CEREBRAU Domain V2 resolution:



DomainId            = WORK

LastCertifiedLot    = WCF-004

CurrentLot          = WORK-AUTHORIZED-STATE-001

CurrentStatus       = ABSENT

Materialized        = False

DomainCertification = False



Read-LotImplementationContract returned:



DomainId        = WORK

LotId           = WORK-AUTHORIZED-STATE-001

Deliverable     = WorkAuthorizedStateComposer

ExpectedSymbols = \[WorkAuthorizedStateComposer]

PreviousLot     = WCF-004

NextLot         = WCF-008-CLOSURE

Complete        = True



Test-LotAuthorization returned:



True



Resolve-LotExecutionMode returned:



Mode       = IMPLEMENTATION

CodeExists = False



The scoped CEREBRAU Domain V2 regression suite passed:



52/52 PASS

0 FAIL



These are acquired entry gates.



Do not repeat architectural discovery merely to reconfirm them.



======================================================================

3\. PREDECESSOR STATE

======================================================================



WCF-004 has completed its implementation and authority review.



Authority review returned:



ACCEPTED - authority review validated.



WCF-004 provides the WORK/EVIDENCE association capability.



The WORK domain may own only the association between:



WorkReference <-> EvidenceId



and its authorized link provenance/time.



WORK does NOT own Business Evidence content.



Do not reopen WCF-004.



Do not reimplement WCF-004.



Do not recertify WCF-004.



Do not manually alter its certification.



======================================================================

4\. AUTHORITATIVE SOURCES

======================================================================



Use these sources as authority:



1\.



Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/MISSION\_ORDER\_WORK\_AUTHORIZED\_STATE\_001.md



2\.



Docs/24\_MODULES/WORK/EVIDENCE/WAVES/NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001/WORK\_IMPLEMENTATION\_CONTRACT.md



3\.



Docs/24\_MODULES/WORK/WORK\_DOMAIN\_BLUEPRINT.md



4\.



Existing certified WORK internal read/query implementations required as

composition inputs.



5\.



Certified internal query contracts of:



\- PEOPLE

\- PLANNING

\- ACTIONS

\- EVIDENCE



6\.



Existing WORK Core, Deliverables and Decisions authoritative read

capabilities.



Inspect implementation details only as necessary to integrate against their

existing contracts.



Do not redesign certified domains.



======================================================================

5\. EXACT IMPLEMENTATION BOUNDARY

======================================================================



The primary implementation family is:



server/domain/work/work-authorized-state\*



The required declaration is:



WorkAuthorizedStateComposer



Necessary scoped wiring may be performed only where required by the

existing WORK module contract, including:



server/domain/work/index.ts



server/domain/work/tsconfig.json



Scoped WORK tests may be created or modified where necessary.



Do not broaden the implementation beyond this capability.



======================================================================

6\. REQUIRED COMPOSITION

======================================================================



For one canonical WorkReference, the composer must obtain the authorized

read contribution for:



A. Work Core



B. Deliverables



C. Decisions



D. People



E. Planning



F. Actions



G. Evidence



The composer must compose references/views returned by authoritative

owners.



It must not take ownership of those source values.



======================================================================

7\. WORKREFERENCE

======================================================================



Use the existing canonical WorkReference.



Do not create a competing Work identity.



Do not introduce another project/work key format.



The composer must operate deterministically for the same canonical

WorkReference and the same authoritative producer inputs.



======================================================================

8\. READ-ONLY RULE

======================================================================



WorkAuthorizedStateComposer is a READ composition boundary.



Composition MUST NOT:



\- write to Work repositories;

\- write to Evidence repositories;

\- write to Actions repositories;

\- write to Planning repositories;

\- write to People repositories;

\- write to Decisions repositories;

\- write to Deliverables repositories;

\- mutate Work Core;

\- create Actions;

\- create Decisions;

\- create Evidence;

\- certify Evidence;

\- update lifecycle state;

\- execute business operations.



Reads must have no side effects.



Add tests capable of detecting unauthorized writes where existing

architecture permits write spies/fakes.



======================================================================

9\. NO PERSISTED AUTHORIZED-STATE SNAPSHOT

======================================================================



DO NOT create:



\- WorkAuthorizedStateRepository;

\- authoritative Work-state snapshot table;

\- persisted authorized-state aggregate;

\- mirrored state store;

\- cache presented as authority;

\- event stream whose purpose is to duplicate all contributor truth.



The authorized Work state must be recomposed from authoritative inputs.



Persistence would create a competing source of truth and is forbidden.



======================================================================

10\. AVAILABILITY SEMANTICS

======================================================================



Preserve explicit producer availability semantics.



The composition must distinguish where applicable:



AVAILABLE



AVAILABLE\_EMPTY



UNAVAILABLE



Do not treat:



UNAVAILABLE



as:



AVAILABLE\_EMPTY



Do not hide a failed/unavailable producer by returning an invented empty

collection.



If an existing certified contributor uses an equivalent canonical naming

contract, preserve that contributor's semantics rather than creating an

incompatible duplicate vocabulary.



======================================================================

11\. OPTIONAL ABSENCE

======================================================================



Optional output absence is not equivalent to producer unavailability.



The composed state must preserve the distinction between:



\- producer available with no contribution;

\- producer unavailable;

\- contribution present.



Do not fabricate fallback values.



======================================================================

12\. PROVENANCE

======================================================================



Preserve provenance supplied by authoritative contributors.



Where the contributor contract exposes them, preserve:



\- owner;

\- source reference;

\- observation time;

\- authoritative identifier;

\- revision/reference metadata;

\- availability state.



Do not rewrite producer provenance into a new invented WORK provenance.



WORK may expose composition-level observation metadata only where required

by the authorized contract.



======================================================================

13\. DATED COMPOSITION

======================================================================



The result must be dated according to the existing architecture and

contract semantics.



Do not introduce non-deterministic business semantics merely by calling

the wall clock repeatedly during composition.



If a composition observation timestamp is required, capture it through one

bounded mechanism per composition and make it testable.



Do not rewrite source observation dates.



======================================================================

14\. DETERMINISM

======================================================================



For equivalent authoritative inputs, the resulting composition must have

deterministic:



\- structure;

\- ordering;

\- identifiers/references;

\- availability interpretation.



Collections must use stable ordering.



Do not depend on incidental:



\- Map iteration created from uncontrolled input;

\- filesystem ordering;

\- object property discovery;

\- asynchronous completion order;

\- random identifiers.



No random UUID may be generated merely to identify a read composition.



======================================================================

15\. CONTRADICTIONS

======================================================================



Contradictory authoritative contributions must remain observable.



Do not:



\- silently discard one producer;

\- choose a winner without authority;

\- normalize contradictory facts into one invented value;

\- convert disagreement into a fabricated consensus.



This lot composes authoritative contributions.



It does not adjudicate them.



Interpretation belongs to later Intelligence capabilities.



======================================================================

16\. EVIDENCE SEMANTICS

======================================================================



Evidence remains owned by the certified Business Evidence authority.



WORK must consume Evidence through the existing certified Evidence

internal query/resolution boundary.



Do not import or recreate Evidence repository ownership inside WORK.



Do not persist BusinessEvidenceRecord copies inside WORK.



Do not duplicate Evidence payload.



Do not duplicate Evidence lifecycle authority.



Invalid or withdrawn Evidence must remain visible according to the

certified Evidence query contract.



Do not silently remove it merely because it is non-current.



Certification resolution remains owned by its authority.



Represent Certification unavailable/absent/resolved according to existing

certified semantics.



======================================================================

17\. ACTIONS SEMANTICS

======================================================================



Actions remain owned by ACTIONS.



Use the existing certified ACTIONS internal query boundary already exposed

to WORK.



Do not:



\- create an Action;

\- mutate an Action;

\- reprioritize an Action;

\- convert a recommendation into an Action;

\- introduce Next Best Action semantics.



Next Best Action belongs to later Intelligence and is explicitly outside

this lot.



======================================================================

18\. PLANNING SEMANTICS

======================================================================



Planning remains owned by PLANNING.



Use the existing certified planning read/query boundary.



Do not modify:



\- plan state;

\- priority;

\- scheduling;

\- dependencies;

\- planning lifecycle.



======================================================================

19\. PEOPLE SEMANTICS

======================================================================



People remains owned by PEOPLE.



Use the existing certified PEOPLE read/query boundary.



Do not duplicate participant/person authority in WORK.



Do not mutate assignments or contributor identity.



======================================================================

20\. DELIVERABLES / DECISIONS / WORK CORE

======================================================================



Use existing authoritative WORK-domain capabilities.



Do not rewrite their aggregates.



Do not create replacement repositories.



Do not migrate existing Work Core, Deliverables or Decisions semantics.



This lot only composes their authorized reads with the other contributors.



======================================================================

21\. INTELLIGENCE BOUNDARY

======================================================================



This lot prepares authoritative Work state FOR Intelligence.



It does not implement Intelligence.



DO NOT implement:



\- Analysis;

\- Insight;

\- Recommendation;

\- Evaluation;

\- Diagnostic;

\- Learning candidate;

\- Next Best Action;

\- Intelligence Assessment.



Do not create Intelligence producer logic.



======================================================================

22\. SYNTHESIS / CONFIDENCE BOUNDARY

======================================================================



DO NOT implement:



\- Synthesis;

\- Confidence;

\- confidence score;

\- confidence aggregation;

\- synthesis generation;

\- recommendation ranking.



Those capabilities remain downstream.



======================================================================

23\. WCF-008 BOUNDARY

======================================================================



Do not close or implement WCF-008-CLOSURE in this mission.



The authorized chain remains:



WCF-004

&#x20;   ->

WORK-AUTHORIZED-STATE-001

&#x20;   ->

WCF-008-CLOSURE



This mission targets only:



WORK-AUTHORIZED-STATE-001



Do not skip forward.



======================================================================

24\. CEREBRAU / NOVA SEPARATION

======================================================================



CEREBRAU is development governance/orchestration.



NOVA is the product.



NOVA production code MUST NOT depend on CEREBRAU.



No import or runtime dependency from:



server/domain/work/\*\*



to CEREBRAU governance/runtime modules is authorized.



CEREBRAU may orchestrate this implementation externally.



It must not become a production dependency of WorkAuthorizedStateComposer.



======================================================================

25\. EXPECTED SYMBOL

======================================================================



The certified machine implementation contract requires exactly:



WorkAuthorizedStateComposer



The implementation must expose this declaration in the authorized

work-authorized-state implementation family.



Do not add artificial declarations merely to satisfy symbol discovery.



The symbol must represent the real composition boundary.



======================================================================

26\. MINIMUM TEST MATRIX

======================================================================



Implement scoped tests covering at minimum:



1\. canonical WorkReference composition;



2\. deterministic composition;



3\. stable ordering;



4\. missing Work;



5\. producer AVAILABLE with contribution;



6\. producer AVAILABLE\_EMPTY;



7\. producer UNAVAILABLE;



8\. distinction between AVAILABLE\_EMPTY and UNAVAILABLE;



9\. optional absence versus unavailable producer;



10\. People contribution;



11\. Planning contribution;



12\. Actions contribution;



13\. Evidence contribution;



14\. Deliverables contribution;



15\. Decisions contribution;



16\. Work Core contribution;



17\. many Evidence associations where applicable;



18\. withdrawn Evidence remains observable;



19\. invalid Evidence remains observable;



20\. conflicting/contradictory contributions remain observable;



21\. source provenance preserved;



22\. source observation time preserved;



23\. composition observation time semantics;



24\. no contributor mutation;



25\. no repository writes during composition;



26\. no persisted WorkAuthorizedState snapshot;



27\. repeated equivalent reads remain deterministic;



28\. no CEREBRAU production dependency.



Use test fixtures only as tests.



Fixtures are not authoritative runtime data.



======================================================================

27\. REGRESSION VALIDATION

======================================================================



Run all relevant scoped regressions after implementation.



At minimum validate:



\- WORK tests;

\- EVIDENCE tests;

\- ACTIONS tests;

\- PLANNING tests;

\- PEOPLE tests;

\- NOVA Core/runtime regression suite required by the repository;

\- strict TypeScript typecheck;

\- git diff --check.



Do not weaken existing tests to obtain PASS.



Do not delete failing tests.



Do not skip a certified producer regression merely because this mission

does not own that producer.



======================================================================

28\. AUTHORIZED PATHS

======================================================================



Product implementation changes are limited to the minimum necessary under:



server/domain/work/work-authorized-state\*



server/domain/work/index.ts



server/domain/work/tsconfig.json



and scoped WORK test files belonging to this capability.



Mission documentation may be written under:



Docs/24\_MODULES/WORK/EVIDENCE/MISSIONS/WORK-AUTHORIZED-STATE-001-IMPLEMENTATION/\*\*



Canonical execution reports may be produced through the existing mission

runner.



======================================================================

29\. FORBIDDEN PATHS / CHANGES

======================================================================



Do not modify implementation under:



server/domain/evidence/\*\*



server/domain/actions/\*\*



server/domain/planning/\*\*



server/domain/people/\*\*



apps/\*\*



Do not modify:



Work Blueprint



Evidence Blueprint



People Blueprint



Planning Blueprint



Actions Blueprint



Do not introduce:



BFF changes



UI changes



public API changes



new database migration



new authoritative state store



CEREBRAU production dependency



VEEDDA changes



Do not manually rewrite certification state.



======================================================================

30\. DIRTY WORKSPACE SAFETY

======================================================================



The repository contains legitimate pre-existing work.



Possible existing changes include:



\- Evidence implementation/certification;

\- WCF-004A admission;

\- WORK resolver compatibility;

\- WCF-004 implementation;

\- WCF-004 reports;

\- WORK-AUTHORIZED-STATE-001 contract repair;

\- mission prompts/manifests/reports.



Do not destroy them.



FORBIDDEN:



git reset --hard



git clean



git checkout .



git restore .



git add .



Do not revert an existing modification merely because it is outside this

mission.



Do not claim a pre-existing modification was produced by this mission.



Track the mission delta separately.



If concurrent work modifies an exact target file incompatibly:



STOP FAIL-CLOSED.



======================================================================

31\. AUTO-REPAIR POLICY

======================================================================



Within the authorized implementation paths, automatically repair:



\- type errors;

\- deterministic ordering defects;

\- bounded adapter/type incompatibilities;

\- scoped test defects caused by this implementation;

\- missing exports;

\- strict tsconfig inclusion needed for this capability.



Do not return to the human for routine implementation corrections.



Do not broaden scope to repair unrelated repository problems.



If a failure originates outside authorized scope:



report the exact blocker and STOP.



======================================================================

32\. NO MANUAL CERTIFICATION

======================================================================



This implementation mission produces technical evidence.



It MUST NOT:



\- mark WORK-AUTHORIZED-STATE-001 CERTIFIED manually;

\- fabricate ACCEPTED;

\- fabricate human approval;

\- directly force the certification registry;

\- skip canonical QA/Certification authority.



After successful implementation, the lot must remain ready for the

canonical authority review/certification mechanism.



======================================================================

33\. REQUIRED IMPLEMENTATION REPORT

======================================================================



Create:



Docs/24\_MODULES/WORK/EVIDENCE/MISSIONS/WORK-AUTHORIZED-STATE-001-IMPLEMENTATION/WORK\_AUTHORIZED\_STATE\_001\_IMPLEMENTATION\_REPORT.md



Report at minimum:



1\. mission ID;

2\. lot;

3\. initial authorized state;

4\. exact files created;

5\. exact files modified;

6\. WorkAuthorizedStateComposer location;

7\. composition input boundaries;

8\. availability model;

9\. deterministic ordering mechanism;

10\. provenance preservation;

11\. timestamp semantics;

12\. Evidence lifecycle handling;

13\. contradiction handling;

14\. persistence prohibition evidence;

15\. no-write evidence;

16\. test matrix/results;

17\. producer regression results;

18\. NOVA regression result;

19\. typecheck result;

20\. git diff --check result;

21\. scope verification;

22\. protected assets verification;

23\. remaining blockers;

24\. certification readiness.



======================================================================

34\. SUCCESS CONDITIONS

======================================================================



Technical success requires ALL:



\- WorkAuthorizedStateComposer implemented;

\- expected symbol machine-detectable;

\- canonical WorkReference used;

\- all required authoritative contributors composed;

\- read-only behavior demonstrated;

\- no persisted authorized-state snapshot;

\- no contributor ownership transferred;

\- explicit availability semantics preserved;

\- unavailable not collapsed into empty;

\- Evidence lifecycle visibility preserved;

\- contradictions preserved;

\- provenance preserved;

\- observation dates preserved;

\- deterministic ordering demonstrated;

\- scoped tests PASS;

\- contributor regressions PASS;

\- required NOVA regressions PASS;

\- strict typecheck PASS;

\- git diff --check PASS;

\- no forbidden implementation modified;

\- no CEREBRAU production dependency;

\- no manual certification;

\- WCF-008 not implemented.



======================================================================

35\. FAIL-CLOSED CONDITIONS

======================================================================



STOP if implementation would require:



\- changing certified producer semantics;

\- changing protected Blueprints;

\- creating a mirrored authoritative state store;

\- copying Business Evidence truth into WORK;

\- mutating contributors during reads;

\- hiding producer unavailability;

\- hiding contradictions;

\- fabricating missing source values;

\- introducing CEREBRAU into NOVA production runtime;

\- manually fabricating certification;

\- skipping a required certified dependency;

\- modifying an unauthorized domain to make tests pass.



Report the exact structural blocker.



======================================================================

36\. TERMINAL VERDICT

======================================================================



If ALL technical success conditions pass, terminate exactly:



TECHNICAL GO — WORK-AUTHORIZED-STATE-001 — READY FOR QA/CERTIFICATION ACCEPTANCE



If not, terminate exactly:



TECHNICAL NO-GO — WORK-AUTHORIZED-STATE-001 — <EXACT\_BLOCKER>



Do not certify the lot yourself.



Do not continue to WCF-008-CLOSURE.



STOP after implementation, validation and technical report.


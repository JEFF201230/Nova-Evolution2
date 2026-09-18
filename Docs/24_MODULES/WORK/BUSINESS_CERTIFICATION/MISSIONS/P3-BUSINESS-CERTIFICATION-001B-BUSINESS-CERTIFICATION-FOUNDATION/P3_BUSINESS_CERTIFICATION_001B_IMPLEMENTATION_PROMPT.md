MISSION\_ID: P3-BUSINESS-CERTIFICATION-001B-BUSINESS-CERTIFICATION-FOUNDATION-001



MODE: IMPLEMENTATION

DOMAIN\_ID: BUSINESS\_CERTIFICATION

LOT\_ID: P3-BUSINESS-CERTIFICATION-001B

PRIORITY: BLOCKING

PROGRAM: NOVA-EVIDENCE-INTELLIGENCE-CLOSURE-001



============================================================

1\. OBJECTIVE

============================================================



Implement the minimum NOVA product-domain Business Certification authority already admitted and governed by:



\- P3-BUSINESS-CERTIFICATION-001A;

\- BUSINESS\_CERTIFICATION\_DOMAIN\_BLUEPRINT.md;

\- BUSINESS\_CERTIFICATION\_IMPLEMENTATION\_CONTRACT.md;

\- P3\_BUSINESS\_CERTIFICATION\_001B\_MISSION\_ORDER.md.



This mission implements the B/foundation lot.



It must create the actual product authority required before:



RT-12-EVIDENCE-CERTIFICATION-REFERENCE-REPAIR-001



may resume.



Do NOT redesign the admitted architecture.



Do NOT implement RT-12 in this mission.



Do NOT implement Intelligence.



Do NOT implement Synthesis.



Do NOT implement Confidence.



Do NOT close WCF-008.



============================================================

2\. AUTHORITATIVE INPUTS

============================================================



Before writing product code, read and obey the existing canonical sources:



Docs/24\_MODULES/WORK/BUSINESS\_CERTIFICATION/BUSINESS\_CERTIFICATION\_DOMAIN\_BLUEPRINT.md



Docs/24\_MODULES/WORK/BUSINESS\_CERTIFICATION/BUSINESS\_CERTIFICATION\_IMPLEMENTATION\_CONTRACT.md



Docs/24\_MODULES/WORK/BUSINESS\_CERTIFICATION/MISSIONS/P3-BUSINESS-CERTIFICATION-001B-BUSINESS-CERTIFICATION-FOUNDATION/P3\_BUSINESS\_CERTIFICATION\_001B\_MISSION\_ORDER.md



Docs/24\_MODULES/WORK/EVIDENCE/MISSIONS/BUSINESS-CERTIFICATION-OWNER-ADMISSION/BUSINESS\_CERTIFICATION\_OWNER\_ADMISSION\_REPORT.md



The Blueprint and certified implementation contract are authoritative.



If this prompt conflicts with a stricter invariant in those canonical sources, preserve the canonical invariant.



Do not modify those architectural sources merely to simplify implementation.



============================================================

3\. ENTRY GATE

============================================================



Verify only the mandatory entry conditions defined by the Mission Order.



Required:



1\. DomainId BUSINESS\_CERTIFICATION resolves canonically.



2\. P3-BUSINESS-CERTIFICATION-001A is the last certified lot.



3\. P3-BUSINESS-CERTIFICATION-001B is the current/next implementation lot.



4\. Resolve-DomainContext selects exactly the Business Certification Blueprint and implementation contract.



5\. Read-LotImplementationContract for P3-BUSINESS-CERTIFICATION-001B returns:



&#x20;  Complete = true

&#x20;  PreviousLot = P3-BUSINESS-CERTIFICATION-001A

&#x20;  NextLot = null



6\. No competing Business Certification product owner exists.



7\. Existing unrelated modified/untracked workspace files remain untouched.



If these entry gates pass, IMPLEMENT.



Do not enter an open-ended discovery cycle.



Do not repeatedly revalidate facts already established.



============================================================

4\. AUTHORIZED PRODUCT DELTA

============================================================



Product changes are authorized ONLY under:



server/domain/business-certification/\*\*



This includes, when required by the admitted contract:



\- domain types;

\- authority;

\- repository/journal;

\- read-only query boundary;

\- recovery;

\- scoped tests;

\- strict tsconfig.json;

\- local index/export file if required.



Mission documentation changes are authorized ONLY inside:



Docs/24\_MODULES/WORK/BUSINESS\_CERTIFICATION/MISSIONS/P3-BUSINESS-CERTIFICATION-001B-BUSINESS-CERTIFICATION-FOUNDATION/\*\*



The B-lot certification artifact and certification-registry transition are NOT implementation changes.



They may occur only through the existing canonical certification mechanism after independent QA/Certification acceptance.



============================================================

5\. FORBIDDEN DELTA

============================================================



Do NOT modify:



server/domain/evidence/\*\*



server/domain/work/\*\*



server/domain/actions/\*\*



server/domain/planning/\*\*



server/domain/people/\*\*



server/domain/intelligence/\*\*



Synthesis implementation



Confidence implementation



apps/\*\*



BFF



public API



database migrations



VEEDDA



CEREBRAU implementation



global Codex configuration



npm global configuration



PATH configuration



Do not modify certified Blueprints or contracts to make tests pass.



Do not create a NOVA runtime dependency on CEREBRAU.



============================================================

6\. DOMAIN OWNERSHIP

============================================================



BUSINESS\_CERTIFICATION is the unique NOVA product-domain owner of Business Certification.



The canonical product authority identifier is exactly:



BUSINESS\_CERTIFICATION\_AUTHORITY



It is case-sensitive.



It must not be recognized through:



\- trimming;

\- case normalization;

\- substring matching;

\- prefix matching;

\- arbitrary non-empty text;

\- heuristic parsing.



The exact authority identifier is owned by the BUSINESS\_CERTIFICATION bounded context.



============================================================

7\. CERTIFICATION IDENTITY

============================================================



Only:



BusinessCertificationAuthority



may allocate:



CertificationId



CertificationId must be:



\- opaque;

\- immutable;

\- owner-issued;

\- stable across persistence/recovery;

\- unique within the Business Certification authority.



Do not derive CertificationId from:



\- EvidenceId;

\- Git identity;

\- MissionId;

\- CEREBRAU certificate;

\- test result;

\- OfficialStatus;

\- mutable business status.



============================================================

8\. BUSINESS SUBJECT

============================================================



For this admitted MVP contract, Business Certification certifies a Business Evidence subject.



The subject must preserve the exact authoritative Evidence identity required by the Blueprint/contract.



Decision recording must verify the existence of the referenced EvidenceId through a READ-ONLY dependency port.



BUSINESS\_CERTIFICATION must not command or mutate Evidence.



BUSINESS\_CERTIFICATION must not copy the Evidence payload.



BUSINESS\_CERTIFICATION must not become an Evidence repository.



A missing/unavailable/inconsistent Evidence subject must fail closed according to the admitted contract.



============================================================

9\. DECISION AUTHORITY

============================================================



BusinessCertificationAuthority owns Business Certification decisions.



Implement only the decisions/states admitted by the canonical contract.



The admitted owner model includes the original decision:



CERTIFIED

or

REJECTED



and current owner state including:



CERTIFIED

REJECTED

WITHDRAWN

INVALIDATED



where required by the canonical Blueprint/contract.



Do not invent additional lifecycle states.



Preserve the distinction between:



\- original decision;

\- current lifecycle state.



Lifecycle evolution must not erase historical decisions.



============================================================

10\. DURABLE SOURCE OF TRUTH

============================================================



Implement one and only one Business-Certification-owned durable source of truth.



It must preserve the admitted contract for:



\- CertificationId;

\- exact Business Evidence subject reference;

\- criteria reference;

\- original decision;

\- current state;

\- decision time;

\- provenance;

\- lifecycle transitions;

\- supersession where admitted;

\- idempotency;

\- append-only history.



Persistence/recovery must be durable according to the canonical contract.



Recovery must be deterministic and fail closed.



Do not create:



\- a second Business Certification repository;

\- an alternate registry;

\- a cache acting as authority;

\- a default/seed Business Certification;

\- implicit certifications during startup.



============================================================

11\. APPEND-ONLY JOURNAL

============================================================



Lifecycle/history must be append-only.



Existing historical events must not be rewritten when:



\- certification is withdrawn;

\- certification is invalidated;

\- certification is superseded;

\- another admitted lifecycle transition occurs.



Recovery must reconstruct the same authoritative state from the persisted journal.



Corrupt or structurally inconsistent journal data must fail closed.



Do not silently repair corrupted authoritative history.



============================================================

12\. IDEMPOTENCY

============================================================



Implement deterministic idempotency according to the canonical contract.



The same idempotency identity with the same semantic command must not create duplicate certification decisions/events.



Reuse of the same idempotency identity for a divergent semantic command must fail closed.



Idempotency behavior must survive restart/recovery.



============================================================

13\. READ-ONLY RESOLUTION BOUNDARY

============================================================



Implement the canonical internal read boundary:



BusinessCertificationQueries.resolveReference(CertificationReference)



with exactly the admitted semantic outcomes:



UNRECOGNIZED\_AUTHORITY



NOT\_FOUND



FOUND(BusinessCertificationSnapshot)



AUTHORITY\_UNAVAILABLE



The read boundary must perform ZERO writes.



It must not expose command/repository mutation capabilities.



============================================================

14\. REFERENCE RECOGNITION

============================================================



The canonical reference shape is:



CertificationReference

&#x20; authority: "BUSINESS\_CERTIFICATION\_AUTHORITY"

&#x20; reference: CertificationId



An arbitrary pair such as:



authority = "UNRECOGNIZED\_AUTHORITY"

reference = "ARBITRARY\_REFERENCE"



must resolve to:



UNRECOGNIZED\_AUTHORITY



and must never be treated as a Business Certification identity.



For the exact canonical authority with an unknown CertificationId, resolve:



NOT\_FOUND



when the authority is available.



When the authoritative Business Certification source cannot be queried reliably, resolve:



AUTHORITY\_UNAVAILABLE



according to the canonical contract.



============================================================

15\. FOUND SNAPSHOT

============================================================



FOUND must expose the canonical snapshot required by the admitted contract, including as applicable:



\- exact authority identity;

\- CertificationId;

\- exact Business Evidence subject reference;

\- criteria reference;

\- original decision;

\- current state;

\- decision time;

\- provenance;

\- supersession information required by the contract.



Do not put mutable certification state into CertificationReference itself.



CertificationReference identifies.



BusinessCertificationSnapshot resolves current authoritative state.



============================================================

16\. CEREBRAU SEPARATION

============================================================



ABSOLUTE BOUNDARY:



Business Certification is a NOVA product domain.



CEREBRAU is development governance/orchestration.



Product implementation under:



server/domain/business-certification/\*\*



must NOT import, read as product data, recover from, or depend on:



tools/cerebrau/\*\*



tools/nova-core-runtime/Cerebrau\*



Docs/12\_CERTIFICATION



Mission Runner OfficialStatus



development certification reports



Git status



CI status



test status



CEREBRAU certification artifacts



Do not convert development certification into Business Certification.



============================================================

17\. REQUIRED TESTS

============================================================



Implement scoped tests proving at minimum:



A. OWNER IDENTITY



\- exact BUSINESS\_CERTIFICATION\_AUTHORITY recognized;

\- wrong authority rejected as UNRECOGNIZED\_AUTHORITY;

\- case variants are not silently normalized;

\- arbitrary non-empty authority is not accepted.



B. CERTIFICATION IDENTITY



\- only authority-issued CertificationId resolves;

\- unknown ID returns NOT\_FOUND;

\- identity survives persistence/recovery.



C. SUBJECT VALIDATION



\- existing Evidence subject can be certified through the read-only Evidence port;

\- missing subject fails closed;

\- unavailable subject authority fails closed;

\- no Evidence write occurs.



D. DECISION



\- admitted CERTIFIED decision;

\- admitted REJECTED decision;

\- immutable original decision;

\- current lifecycle state remains distinct.



E. LIFECYCLE



Test all lifecycle transitions required by the canonical contract, including:



\- withdrawal;

\- invalidation;

\- supersession if admitted.



Historical events must remain present.



F. IDEMPOTENCY



\- same command/same identity does not duplicate;

\- divergent reuse fails;

\- behavior survives restart.



G. RECOVERY



\- restart reconstructs identical authoritative state;

\- corrupt journal fails closed;

\- no seed/default certification appears.



H. QUERY



resolveReference proves:



UNRECOGNIZED\_AUTHORITY

NOT\_FOUND

FOUND

AUTHORITY\_UNAVAILABLE



Reads perform zero writes.



I. BOUNDARY



\- no CEREBRAU runtime dependency;

\- no development certificate ingestion;

\- no Evidence/Work/Actions/Planning command dependency;

\- no second Business Certification authority.



============================================================

18\. VALIDATION

============================================================



After implementation, run:



1\. all scoped Business Certification tests;



2\. strict Business Certification TypeScript compilation;



3\. applicable Business Certification persistence/recovery tests;



4\. applicable CEREBRAU resolver/contract checks without modifying CEREBRAU;



5\. relevant existing NOVA regressions necessary to prove no regression;



6\. git diff --check.



At minimum preserve the currently relevant certified-domain behavior.



Do not fix unrelated pre-existing failures.



If an unrelated pre-existing failure is encountered, classify it explicitly rather than modifying unrelated domains.



============================================================

19\. INDEPENDENT QA / CERTIFICATION BOUNDARY

============================================================



This implementation mission must NOT self-certify P3-BUSINESS-CERTIFICATION-001B.



Implementation success means:



READY\_FOR\_REVIEW



not:



CERTIFIED



The canonical certification writer may certify the B lot only after independent QA/Certification acceptance.



Do not manually fabricate:



\- registry certification;

\- certification artifact;

\- human approval;

\- AuthorityDecision;

\- OfficialStatus.



Do not modify the B registry status directly as part of implementation.



============================================================

20\. WORKSPACE SAFETY

============================================================



The repository contains legitimate pre-existing modified and untracked work.



DO NOT:



git reset --hard



git clean



git checkout .



git restore .



git add .



delete unrelated untracked files



rewrite unrelated reports



revert existing Evidence/WCF/WORK work



Attribute only changes generated by this mission.



============================================================

21\. STOP CONDITIONS

============================================================



STOP and report precisely if:



\- entry gates fail;

\- implementation requires changing the admitted Blueprint;

\- implementation requires changing the certified A contract;

\- a competing Business Certification owner exists;

\- Evidence mutation becomes necessary;

\- CEREBRAU would become a product dependency;

\- a second source of truth becomes necessary;

\- an unapproved business semantic decision is required;

\- authorized paths are insufficient for the admitted implementation;

\- independent certification would be required before implementation can continue.



Do not fabricate a workaround.



============================================================

22\. REQUIRED IMPLEMENTATION REPORT

============================================================



Create:



Docs/24\_MODULES/WORK/BUSINESS\_CERTIFICATION/MISSIONS/P3-BUSINESS-CERTIFICATION-001B-BUSINESS-CERTIFICATION-FOUNDATION/P3\_BUSINESS\_CERTIFICATION\_001B\_IMPLEMENTATION\_REPORT.md



The report must contain:



1\. MissionId.



2\. RESULT:

&#x20;  READY\_FOR\_REVIEW

&#x20;  or BLOCKED.



3\. Entry-gate results.



4\. Exact files created/modified.



5\. Implemented domain model.



6\. Persistence/journal implementation.



7\. Recovery behavior.



8\. Idempotency behavior.



9\. resolveReference behavior.



10\. Evidence read-port boundary.



11\. CEREBRAU/product separation proof.



12\. Exact tests executed.



13\. Exact pass/fail counts.



14\. Typecheck results.



15\. Regression results.



16\. git diff --check result.



17\. Workspace-scope verification.



18\. Remaining blockers.



19\. Certification status:

&#x20;   MUST remain PENDING\_REVIEW / READY\_FOR\_REVIEW until independent acceptance.



20\. Exact next action:

&#x20;   independent QA/Certification acceptance for P3-BUSINESS-CERTIFICATION-001B.



============================================================

23\. FINAL SUCCESS CONDITION

============================================================



SUCCESS for this mission requires all of:



\- BusinessCertificationAuthority implemented;

\- durable owner-issued CertificationId implemented;

\- authoritative append-only persistence implemented;

\- deterministic recovery implemented;

\- read-only resolveReference implemented;

\- exact authority semantics enforced;

\- subject consistency enforced;

\- lifecycle/history implemented;

\- idempotency implemented;

\- required tests PASS;

\- strict typecheck PASS;

\- relevant regressions PASS;

\- no protected-domain mutation;

\- no CEREBRAU product dependency;

\- implementation report produced.



Final mission state on implementation success:



READY\_FOR\_REVIEW



Do NOT certify the lot in this implementation mission.



After independent QA/Certification acceptance and canonical certification of P3-BUSINESS-CERTIFICATION-001B, the next authorized mission becomes:



RT-12-EVIDENCE-CERTIFICATION-REFERENCE-REPAIR-001



Do not execute RT-12 during this mission.


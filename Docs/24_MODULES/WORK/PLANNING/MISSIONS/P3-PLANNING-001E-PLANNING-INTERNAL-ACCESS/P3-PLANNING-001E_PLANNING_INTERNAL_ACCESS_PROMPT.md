# P3-PLANNING-001E — PLANNING INTERNAL ACCESS

## MISSION

Implement only:

P3-PLANNING-001E — Planning Internal Access

Domain: PLANNING

Objective:
Open one and only one internal application boundary over the certified canonical Planning source.

This mission is an IMPLEMENTATION mission.

Do not self-certify this lot.
Do not open or implement P3-PLANNING-001F.

---

## AUTHORITATIVE SOURCES

Read and obey:

1. Docs/24_MODULES/WORK/PLANNING_DOMAIN_BLUEPRINT.md
2. Docs/24_MODULES/WORK/PLANNING_IMPLEMENTATION_CONTRACT.md
3. Docs/12_CERTIFICATION/PLANNING/P3-PLANNING-001D.certification.json
4. Certified Planning implementation produced by:
   - P3-PLANNING-001B
   - P3-PLANNING-001C
   - P3-PLANNING-001D

P3-PLANNING-001D is the certified durable source boundary.

Do not redefine Planning business semantics.

---

## ENTRY CONDITION

Required canonical state:

- P3-PLANNING-001D = CERTIFIED
- P3-PLANNING-001E = PENDING_EVIDENCE
- P3-PLANNING-001E is the current authorized lot

If these conditions are not true, stop and report NO GO.

---

## AUTHORIZED SCOPE

Implement only the internal Planning application-access boundary required by P3-PLANNING-001E.

Authorized implementation concerns:

- internal Planning Commands services
- internal Planning Queries services
- access to the canonical Planning Authority
- access to the canonical durable Planning source established by 001D
- reconstructible/read-only Planning Timeline
- qualified absence results
- tests strictly required by 001E
- exports strictly necessary for this internal boundary

All implementation remains inside the Planning domain.

---

## COMMAND PATH

All Planning mutations exposed through this internal boundary MUST follow the certified authority chain.

Required conceptual path:

Internal Planning Command
→ Planning Authority
→ canonical Planning persistence

The internal access layer MUST NOT:

- bypass Planning Authority
- write directly to persistence as an alternative authority
- duplicate command validation
- create a second Planning truth
- silently transform rejected commands into accepted state

The certified Establish / Revise / Withdraw semantics from 001C remain authoritative.

---

## QUERY PATH

Implement the five read-only Planning Queries required by the canonical Planning contract.

Queries MUST:

- read from the canonical durable Planning source
- remain read-only
- return deterministic results
- preserve provenance where required by the Planning model
- expose qualified absence instead of inventing state
- never mutate Planning
- never infer consumer-domain business rules

Use the exact query semantics and names defined by the authoritative Planning documents and certified model.

Do not invent a sixth query.

---

## QUALIFIED ABSENCE

Absence MUST be explicit and qualified.

The application boundary must distinguish legitimate absence states required by the canonical Planning contract rather than:

- fabricating an empty Planning aggregate
- returning misleading default business values
- converting absence into failure without contractual justification
- creating placeholder Planning truth

---

## TIMELINE

Planning Timeline is DERIVED and RECONSTRUCTIBLE.

It MUST be reconstructed exclusively from canonical Planning state/history/events established by certified lots.

Timeline MUST NOT:

- become an authoritative store
- become a second source of truth
- own Planning state
- mutate Planning
- own Progress state
- copy Work state
- introduce a new persistence authority

---

## PERSISTENCE

P3-PLANNING-001D remains the unique durable Planning source.

001E MUST reuse the certified persistence ports/adapters and MUST NOT introduce:

- another Planning store
- another current-state table/source
- another history authority
- another event authority
- another receipt authority
- mirrored Planning state

---

## DOMAIN BOUNDARIES

This mission MUST NOT implement Work integration.

Specifically forbidden:

- P3-PLANNING-001F implementation
- Work consumer integration
- Progress ownership or mutation
- Timeline as Progress truth
- API routes
- BFF routes
- HTTP transport
- frontend integration
- UI
- public transport contracts
- Decision integration
- Deliverables integration
- unrelated domains

Do not modify `server/domain/people/**`.

---

## REQUIRED VALIDATIONS

The P3-PLANNING-001E contract requires:

1. Commands tests on the internal application path
2. Queries tests
3. applicable event tests
4. persistence tests applicable to canonical access
5. applicable non-regression tests
6. TypeScript typecheck

Also run the existing Planning test suite and NOVA Core non-regression suite required by the repository/runtime mission contract.

Every required validation must PASS.

No failed required validation may be hidden or reclassified.

---

## FAILURE POLICY

Fail closed.

If a certified dependency, canonical source, required contract, invariant, persistence behavior, authority path or required test cannot be established:

- do not invent an alternative
- do not weaken the invariant
- do not bypass the authority
- do not modify another domain to compensate
- report NO GO with exact evidence

---

## CERTIFICATION BOUNDARY

This implementation mission does NOT certify P3-PLANNING-001E.

Do not:

- edit Docs/12_CERTIFICATION manually
- edit certification-registry.json manually
- mark 001E CERTIFIED
- open 001F
- claim CEREBRAU certification

The final result is evidence for subsequent human review and canonical certification only.

---

## MANDATORY FINAL REPORT

Create:

Docs/24_MODULES/WORK/PLANNING/MISSIONS/P3-PLANNING-001E-PLANNING-INTERNAL-ACCESS/P3-PLANNING-001E_PLANNING_INTERNAL_ACCESS_REPORT.md

The report MUST contain at minimum:

- MissionId
- LotId
- scope implemented
- exact files created
- exact files modified
- Commands path implemented
- five Queries implemented
- qualified absence behavior
- Timeline derivation behavior
- canonical persistence access
- domain-boundary verification
- tests executed
- exact test counts/results
- typecheck result
- non-regression result
- remaining limitations
- technical verdict GO or NO GO
- explicit statement that no certification was performed

Before ending the mission:

1. verify that the report exists;
2. read the report back;
3. verify that it contains the actual final results;
4. print the absolute report path.

If the mandatory report does not exist, the mission is INCOMPLETE.

Do not report SUCCESS/GO without this report.

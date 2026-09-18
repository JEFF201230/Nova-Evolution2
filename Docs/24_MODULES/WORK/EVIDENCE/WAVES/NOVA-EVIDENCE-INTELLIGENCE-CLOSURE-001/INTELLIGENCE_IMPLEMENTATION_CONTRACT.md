# INTELLIGENCE IMPLEMENTATION CONTRACT

Status: `CERTIFIED`

**VERDICT : GO**

Blueprint: `Docs/24_MODULES/WORK/INTELLIGENCE_DOMAIN_BLUEPRINT.md`

| Attribute | Value |
|---|---|
| DomainId | INTELLIGENCE |
| Lot | P3-INTELLIGENCE-001A |
| Next authorized lot | P3-INTELLIGENCE-001B |

## Required implementation

Implement one Intelligence Assessment authority under `server/domain/intelligence/**` with durable revision/withdrawal history, deterministic WorkReference, explicit question/scope/method/date, Evidence references for factual claims, and owned Analysis, Insights, Recommendations, Evaluations and Diagnostics. Facts, hypotheses and interpretations remain distinguishable.

Work integration may contain reference/query code only. Intelligence uses certified authorized Work state and Evidence read ports. It creates no Evidence, Action, Decision, Planning value, Synthesis or Confidence.

## Prioritized Action contract — D-005 EXISTING_ACTION

The recorded Program Owner decision is `EXISTING_ACTION`. A Next Best Action is the highest-ranked current non-imperative Intelligence Recommendation referencing an existing authoritative `ActionId`. Ranking method, candidate set, ties, supporting Evidence and observation date are explicit. Withdrawal removes the projection without changing the Action. A Recommendation without an existing authoritative `ActionId` remains a general Recommendation and is not a Next Best Action.

Intelligence may analyze, rank and recommend an existing Action. It cannot create, execute, mutate, admit, approve or command an Action. Proposed not-yet-admitted Actions are outside the MVP and require a separately governed future contract.

## Sequence and acceptance

Contract lot P3-INTELLIGENCE-001A precedes implementation lot P3-INTELLIGENCE-001B. Tests cover provenance, contradictions, factual Evidence, revisions, withdrawals, absent/unavailable sources, no direct domain commands, deterministic ranking and Work read association. No Synthesis or Confidence code is admitted.

The A contract becomes contract-only `CERTIFIED` and receives its legacy GO marker only in the program-preauthorized, dependency-gated two-file admission changeset defined by `PROGRAM_CERTIFICATION_IDENTITY_MAP.md`. It intentionally lacks that marker while proposed. No new routine human approval is requested.

### 1.3 Out of scope

- Evidence, Actions, Planning, Decisions, Synthesis and Confidence mutation
- public API, BFF, frontend and technical diagnostic promotion

### 2.2 Allowed dependencies

- certified authorized Work state read port
- certified Evidence and optional Knowledge read ports
- certified Actions read references

### 2.3 Forbidden dependencies

- CEREBRAU product/runtime modules
- direct Actions, Planning, Decisions or Evidence commands
- Runtime logs, readiness, fixtures and UI authorities

### 14.7 Non-negotiable invariants

1. IntelligenceAssessment owns reasoned results and never source facts.
2. Every factual claim references admissible Evidence.
3. Recommendation is non-imperative and causes no direct domain effect.
4. Next Best Action follows the recorded D-005 option and deterministic ranking; no direct Action effect is permitted.
5. Revisions and withdrawals preserve history.

## 15. TEST CONTRACT

### 15.1 TEST CONTRACT PAR SOUS-LOT

| Sous-lot | Validations obligatoires |
|---|---|
| P3-INTELLIGENCE-001B | Tests Assessment invariants; Tests factual Evidence; Tests Recommendation boundary; Tests ranking; Tests lifecycle/recovery; Tests Work association; Tests non-regression; Typecheck |

## 16. IMPLEMENTATION SEQUENCE

### 16.1 Accepted order

| Order | Sub-lot | Objective | Authorized deliverable |
|---|---|---|---|
| 1 | P3-INTELLIGENCE-001B - Intelligence Foundation | establish the result authority and Work read association | IntelligenceAssessment and IntelligenceAuthority |

## 17. ENTRY AND EXIT GATES

### 17.2 Lot gates

| Sub-lot | Entry | Authorized files | Exit |
|---|---|---|---|
| P3-INTELLIGENCE-001B | contract row certified and authorized Work state certified | server/domain/intelligence/** plus narrow work-intelligence reference/query tests | IntelligenceAuthority unique; factual Evidence and non-imperative ranking proven; tests PASS; report accepted by designated QA/Certification authority |

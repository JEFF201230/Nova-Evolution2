# PROGRAM DECISION LOG

Status: `PROPOSED`

| ID | Date | Classification | Decision | Authority/evidence | State |
|---|---|---|---|---|---|
| D-001 | 2026-09-14 | PROVEN | Starting state: WCF-004/WCF-008, Business Evidence and Intelligence producer absent; WCF-001/2/3/5/6/7 and PEOPLE/PLANNING/ACTIONS certified | primary audit + certificates | RECORDED |
| D-002 | 2026-09-14 | PROPOSED | Evidence is a distinct NOVA bounded context and sole Business Evidence authority | ARCH-EVIDENCE-001 | AWAITING_FINAL_HUMAN_APPROVAL |
| D-003 | 2026-09-14 | PROPOSED | Evidence persists reference identity and append-only lifecycle history; source payload remains at owner | ARCH-EVIDENCE-001 | AWAITING_FINAL_HUMAN_APPROVAL |
| D-004 | 2026-09-14 | PROPOSED | Work owns only `(WorkReference, EvidenceId)` association and its provenance | certified Work invariants | AWAITING_FINAL_HUMAN_APPROVAL |
| D-005 | 2026-09-16 | UNKNOWN | Prioritized Action belongs to Intelligence and remains a non-imperative Recommendation, but certified sources do not decide whether it must reference an existing `ActionId` or may describe a future Action pending explicit Actions admission | Work/Intelligence/Actions Blueprints and roadmap | HUMAN_DECISION_REQUIRED |
| D-006 | 2026-09-14 | PROVEN | Product implementation is sequential; preparation and Red Team may be parallel | Wave mandate | RECORDED |
| D-007 | 2026-09-14 | PROVEN | One current final program approval is required before activating Evidence; that approval also preauthorizes the exact dependency-gated first-contract admissions for EVIDENCE, INTELLIGENCE, SYNTHESIS and CONFIDENCE, with no new routine transition gate | certified facts + current resolver/writer boundary | OPEN_HUMAN_GATE |
| D-008 | 2026-09-14 | PROPOSED | The only initial Business Evidence source kind is a reference to certified ACTIONS `ResultRecorded`, identified by `(WorkReference, ActionId, actionsRevision, ResultId)` and resolved from read-only Actions history; no outcome/event payload is copied | certified Actions Blueprint, certificate and internal read contract | AWAITING_FINAL_HUMAN_APPROVAL |
| D-009 | 2026-09-16 | PROVEN | Modified/untracked registry, certificates and implementations claim Evidence, WCF-004 and authorized Work state certification while the Wave still records Phase-0 approval as pending; no later approval record is present in the Wave | Git status, certification registry, Wave decision/Blueprint files | STRUCTURAL_DRIFT_STOP |

## Pending human decision — smallest possible gate

**FACT**  
The reference-only Evidence authority is a coherent minimal architecture, but its final approval is not recorded in this Wave. Canonical sources assign Next Best Action selection to Intelligence and prohibit Recommendation from acting as Action/Decision/Command, yet they defer the detailed Recommendation-to-Action relation. The dirty workspace nevertheless contains downstream certification claims.

**EVIDENCE**  
`WORK_DOMAIN_BLUEPRINT.md:427-438`; `NOVA_WORK_CAPABILITY_ROADMAP.md:109-128`; `INTELLIGENCE_DOMAIN_BLUEPRINT.md:131-180,240-242,264-275`; `ACTIONS_DOMAIN_BLUEPRINT.md:164-176`; `ARCH_EVIDENCE_001_DECISION.md`; current Git status and certification registry.

**OPTIONS**

1. `EXISTING_ACTION`: approve the proposed Evidence authority and define Next Best Action as the highest-ranked current non-imperative Recommendation referencing an existing authoritative `ActionId`.
2. `PROPOSED_FUTURE_ACTION`: approve the proposed Evidence authority and allow Next Best Action to be the highest-ranked non-imperative Recommendation proposing a future Action; it has no `ActionId` or effect until explicitly admitted by Actions.
3. `REJECT_ARCHITECTURE`: reject the Evidence architecture and identify the exact invariant to revise.

For option 1 or 2, the Program Owner must also state whether the existing downstream certification claims are ratified for independent provenance/revalidation or must enter a governed correction path. Silence is not ratification.

**IMPACT**  
Option 1 preserves the current candidate Intelligence contract. Option 2 requires a scoped update to that proposed contract and its tests before Intelligence admission; it still cannot create or execute an Action. Option 3 leaves the program blocked. In all cases, the dirty downstream claims remain non-authoritative for this Wave until provenance is reconciled.

**RECOMMENDATION**  
Choose option 1 for the strictest MVP if product intent is selection among admitted Actions; choose option 2 only if product intent is recommendation of not-yet-admitted Actions. Architecture sources do not prove which intent is correct, so CEREBRAU makes no factual recommendation between them. Approve the reference-only Evidence authority in either case.

## Decision recording rule

The human response must be appended as a new dated entry. Existing entries are not rewritten. Approval is not a certification; Phase 1 still must implement and certify the authority.

No human approval or rejection of this proposed architecture has been received in the current mission input. State: `PENDING_HUMAN_DECISION`.

PROGRAM OWNER DECISION — 2026-09-17

1. ARCH-EVIDENCE-001

APPROVED.

The reference-only Business Evidence architecture is approved.

Evidence is a distinct NOVA bounded context and the sole Business Evidence authority.

Evidence owns reference identity and append-only lifecycle history only.
Source payload remains owned by its authoritative producer.

WORK owns only the association:
(WorkReference, EvidenceId)
and its association provenance.

The initial Business Evidence source kind based on certified ACTIONS ResultRecorded references is approved under the existing authority boundaries.

2. D-005 — PRIORITIZED ACTION / NEXT BEST ACTION

DECISION: EXISTING_ACTION.

For the NOVA MVP, Next Best Action is defined as the highest-ranked current non-imperative Intelligence Recommendation referencing an existing authoritative ActionId.

Intelligence may analyze, rank and recommend an existing Action.

Intelligence does not create, execute, mutate, admit, approve or command an Action.

A Recommendation without an existing authoritative ActionId remains a general Recommendation and is not a Next Best Action.

Any future capability allowing Intelligence to propose not-yet-admitted Actions is explicitly deferred beyond this MVP and will require its own governed contract.

3. EXISTING DOWNSTREAM CERTIFICATION CLAIMS

DECISION: RATIFY_WITH_INDEPENDENT_PROVENANCE_REVALIDATION.

Existing Evidence, WCF-004 and WORK-AUTHORIZED-STATE-001 certification artifacts must not be discarded, recreated or silently accepted solely because they exist.

CEREBRAU is authorized to reconcile them against their existing canonical reports, evidence, tests, registry entries and certification provenance.

When their provenance and canonical evidence independently validate, the existing certification is ratified and preserved.

If a specific certification fails provenance reconciliation, only that certification enters the governed correction path.

No global rollback or reimplementation of already validated domains is authorized.

4. PROGRAM TRANSITION

This decision closes the pending human semantic gate for the Wave, subject to successful provenance reconciliation and repair/revalidation of RT-12 before Intelligence relies on the affected CertificationReference behavior.

No new routine human transition approval is required for the already program-preauthorized dependency-gated contract admissions after these conditions pass.

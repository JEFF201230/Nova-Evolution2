# CHANGE GRAPH CERTIFICATION

## Purpose

Define the criteria that certify the Change Knowledge Graph as fit for NOVA decision support.

## Compliance Criteria

- canonical entities are present and named consistently;
- canonical relations are present and named consistently;
- traceability chains are complete;
- decision context can be generated;
- risk and conflict reasoning are supported;
- human decision authority remains explicit.

## Completeness Criteria

- every required entity type is represented;
- every required relation type is represented;
- every major decision path is traceable;
- every certification path is traceable;
- rollback context is representable.

## Auditability Criteria

- every claim can be traced to a source of truth;
- every decision includes actor identity and rationale;
- every certification includes evidence references;
- supersession history is preserved;
- no orphaned critical record exists.

## Security Criteria

- least privilege is preserved;
- protected boundaries are enforceable;
- unauthorized changes are detectable;
- sensitive context is linked to an authenticated actor;
- audit records are immutable once produced.

## Certification Criteria

- graph ontology is normative;
- reasoning model is deterministic enough for governance;
- human decision workflow is explicit;
- rollback and conflict paths are represented;
- certification can be performed without guesswork.

## Conditions for NON CERTIFICATION

- missing canonical entity definitions;
- missing canonical relation definitions;
- broken traceability chain;
- no human decision context;
- no rollback representation;
- no auditable evidence path;
- any ambiguity that prevents deterministic governance.


import type { WorkAuthorizedState } from "../work/index.js";
import { IntelligenceDomainError } from "./intelligence.errors.js";
import type { IntelligenceJournal } from "./intelligence.journal.js";
import type {
  Analysis,
  Diagnostic,
  Evaluation,
  FactualAssertion,
  Hypothesis,
  Insight,
  IntelligenceAssessment,
  IntelligenceAssessmentContent,
  IntelligenceContradiction,
  IntelligenceLifecycleEvent,
  IntelligenceLimit,
  IntelligenceRevision,
  Interpretation,
  Recommendation,
} from "./intelligence.types.js";

type CommandIdentity = Readonly<{
  actor: string;
  causationIdentity: string;
  idempotencyIdentity: string;
  at: Date;
}>;

export type CreateIntelligenceAssessment = CommandIdentity & Readonly<{
  assessmentId: string;
  workState: WorkAuthorizedState;
  content: IntelligenceAssessmentContent;
}>;

export type ReviseIntelligenceAssessment = CommandIdentity & Readonly<{
  assessmentId: string;
  expectedRevision: number;
  reason: string;
  workState: WorkAuthorizedState;
  content: IntelligenceAssessmentContent;
}>;

export type WithdrawIntelligenceAssessment = Omit<CommandIdentity, "causationIdentity"> & Readonly<{
  assessmentId: string;
  expectedRevision: number;
  reason: string;
}>;

export class IntelligenceAuthority {
  constructor(private readonly journal: IntelligenceJournal) {}

  create(command: CreateIntelligenceAssessment): IntelligenceAssessment {
    validateIdentity(command.assessmentId, "assessmentId");
    validateCommand(command);
    const records = rebuild(this.journal.read());
    const replay = findEvent(records, command.idempotencyIdentity);
    if (replay !== null) {
      const workReference = canonicalWorkReference(command.workState);
      const revision = makeRevision(1, normalizeContent(command.content, command.workState, false), command, null);
      if (replay.type !== "ASSESSMENT_CREATED" || replay.assessmentId !== command.assessmentId
        || stable(replay.workReference) !== stable(workReference) || stable(replay.revision) !== stable(revision)) idempotencyConflict();
      return required(records, command.assessmentId);
    }
    if (records.has(command.assessmentId)) throw new IntelligenceDomainError("INTELLIGENCE_REVISION_CONFLICT", "Assessment identity already exists.");
    const workReference = validateWorkState(command.workState);
    const content = normalizeContent(command.content, command.workState);
    const revision = makeRevision(1, content, command, null);
    this.journal.append(Object.freeze([Object.freeze({
      type: "ASSESSMENT_CREATED", assessmentId: command.assessmentId,
      idempotencyIdentity: command.idempotencyIdentity, at: revision.provenance.producedAt,
      actor: command.actor, workReference, revision,
    })]));
    return required(rebuild(this.journal.read()), command.assessmentId);
  }

  revise(command: ReviseIntelligenceAssessment): IntelligenceAssessment {
    validateIdentity(command.assessmentId, "assessmentId"); validateText(command.reason, "reason"); validateCommand(command);
    const records = rebuild(this.journal.read());
    const replay = findEvent(records, command.idempotencyIdentity);
    const record = required(records, command.assessmentId);
    if (replay !== null) {
      const workReference = canonicalWorkReference(command.workState);
      if (stable(workReference) !== stable(record.workReference)) throw new IntelligenceDomainError("INTELLIGENCE_INVALID_INPUT", "WorkReference is immutable.");
      const revision = makeRevision(command.expectedRevision + 1, normalizeContent(command.content, command.workState, false), command, command.reason);
      if (replay.type !== "ASSESSMENT_REVISED" || replay.assessmentId !== command.assessmentId || stable(replay.revision) !== stable(revision)) idempotencyConflict();
      return record;
    }
    if (record.lifecycle !== "CURRENT") throw new IntelligenceDomainError("INTELLIGENCE_TERMINAL", "A withdrawn Assessment cannot be revised.");
    const workReference = validateWorkState(command.workState);
    if (stable(workReference) !== stable(record.workReference)) throw new IntelligenceDomainError("INTELLIGENCE_INVALID_INPUT", "WorkReference is immutable.");
    const revision = makeRevision(command.expectedRevision + 1, normalizeContent(command.content, command.workState), command, command.reason);
    if (record.currentRevision.revision !== command.expectedRevision) throw new IntelligenceDomainError("INTELLIGENCE_REVISION_CONFLICT", "Expected revision is not current.");
    this.journal.append(Object.freeze([Object.freeze({
      type: "ASSESSMENT_REVISED", assessmentId: command.assessmentId,
      idempotencyIdentity: command.idempotencyIdentity, at: revision.provenance.producedAt,
      actor: command.actor, revision, reason: command.reason,
    })]));
    return required(rebuild(this.journal.read()), command.assessmentId);
  }

  withdraw(command: WithdrawIntelligenceAssessment): IntelligenceAssessment {
    validateIdentity(command.assessmentId, "assessmentId"); validateText(command.reason, "reason");
    validateText(command.actor, "actor"); validateText(command.idempotencyIdentity, "idempotencyIdentity");
    const at = iso(command.at, "at");
    const records = rebuild(this.journal.read());
    const replay = findEvent(records, command.idempotencyIdentity);
    const record = required(records, command.assessmentId);
    if (replay !== null) {
      if (replay.type !== "ASSESSMENT_WITHDRAWN" || replay.assessmentId !== command.assessmentId
        || replay.reason !== command.reason || replay.actor !== command.actor || replay.at !== at) idempotencyConflict();
      return record;
    }
    if (record.lifecycle !== "CURRENT") throw new IntelligenceDomainError("INTELLIGENCE_TERMINAL", "Assessment is already withdrawn.");
    if (record.currentRevision.revision !== command.expectedRevision) throw new IntelligenceDomainError("INTELLIGENCE_REVISION_CONFLICT", "Expected revision is not current.");
    this.journal.append(Object.freeze([Object.freeze({ type: "ASSESSMENT_WITHDRAWN", assessmentId: command.assessmentId,
      idempotencyIdentity: command.idempotencyIdentity, at, actor: command.actor, reason: command.reason })]));
    return required(rebuild(this.journal.read()), command.assessmentId);
  }

  readAll(): ReadonlyMap<string, IntelligenceAssessment> { return rebuild(this.journal.read()); }
}

export function rebuild(events: readonly IntelligenceLifecycleEvent[]): ReadonlyMap<string, IntelligenceAssessment> {
  const records = new Map<string, IntelligenceAssessment>();
  const idempotencies = new Set<string>();
  for (const rawEvent of events) {
    const event = deepFreeze(JSON.parse(JSON.stringify(rawEvent)) as IntelligenceLifecycleEvent);
    if (idempotencies.has(event.idempotencyIdentity)) throw corrupt("Duplicate idempotency identity.");
    idempotencies.add(event.idempotencyIdentity);
    if (event.type === "ASSESSMENT_CREATED") {
      if (records.has(event.assessmentId) || event.revision?.revision !== 1 || event.workReference === undefined) throw corrupt("Invalid creation history.");
      records.set(event.assessmentId, Object.freeze({ assessmentId: event.assessmentId, workReference: event.workReference,
        lifecycle: "CURRENT", currentRevision: event.revision, revisions: Object.freeze([event.revision]),
        history: Object.freeze([event]), withdrawal: null }));
      continue;
    }
    const record = records.get(event.assessmentId);
    if (record === undefined || record.lifecycle !== "CURRENT") throw corrupt("History targets an absent or terminal Assessment.");
    if (event.type === "ASSESSMENT_REVISED") {
      if (event.revision === undefined || event.revision.revision !== record.currentRevision.revision + 1 || event.reason !== event.revision.reason) throw corrupt("Revision sequence is invalid.");
      records.set(event.assessmentId, Object.freeze({ ...record, currentRevision: event.revision,
        revisions: Object.freeze([...record.revisions, event.revision]), history: Object.freeze([...record.history, event]) }));
    } else {
      if (event.reason === undefined) throw corrupt("Withdrawal reason is missing.");
      records.set(event.assessmentId, Object.freeze({ ...record, lifecycle: "WITHDRAWN",
        history: Object.freeze([...record.history, event]), withdrawal: Object.freeze({ reason: event.reason, actor: event.actor, at: event.at }) }));
    }
  }
  return records;
}

function normalizeContent(content: IntelligenceAssessmentContent, state: WorkAuthorizedState, validateCurrentSources = true): IntelligenceAssessmentContent {
  validateText(content?.question, "question"); validateText(content?.scope, "scope"); validateText(content?.method, "method"); validateIso(content?.observedAt, "observedAt");
  if (content.observedAt !== state.compositionObservedAt) invalid("Assessment observation date must equal the authorized Work-state observation date.");
  const facts = unique(content.factualAssertions, "assertionId", normalizeFact);
  const hypotheses = unique(content.hypotheses, "hypothesisId", normalizeHypothesis);
  const interpretations = unique(content.interpretations, "interpretationId", normalizeInterpretation);
  const contradictions = unique(content.contradictions, "contradictionId", normalizeContradiction);
  const limits = unique(content.limits, "limitId", normalizeLimit);
  const analyses = unique(content.analyses, "analysisId", normalizeAnalysis);
  const insights = unique(content.insights, "insightId", normalizeInsight);
  const recommendations = unique(content.recommendations, "recommendationId", normalizeRecommendation);
  const evaluations = unique(content.evaluations, "evaluationId", normalizeEvaluation);
  const diagnostics = unique(content.diagnostics, "diagnosticId", normalizeDiagnostic);
  if (analyses.length === 0) invalid("At least one Analysis is required.");
  const actionRankingMethods = new Set(recommendations.filter((item) => item.actionId !== undefined).map((item) => item.rankingMethod));
  if (actionRankingMethods.size > 1) invalid("Next Best Action candidates must use one explicit ranking method.");

  const ids = {
    facts: new Set(facts.map((x) => x.assertionId)), hypotheses: new Set(hypotheses.map((x) => x.hypothesisId)),
    interpretations: new Set(interpretations.map((x) => x.interpretationId)), contradictions: new Set(contradictions.map((x) => x.contradictionId)),
    limits: new Set(limits.map((x) => x.limitId)), analyses: new Set(analyses.map((x) => x.analysisId)),
  };
  for (const value of interpretations) references(value.factualAssertionIds, ids.facts, "Interpretation factual assertion");
  for (const value of analyses) { references(value.factualAssertionIds, ids.facts, "Analysis factual assertion"); references(value.hypothesisIds, ids.hypotheses, "Analysis hypothesis"); references(value.interpretationIds, ids.interpretations, "Analysis interpretation"); references(value.contradictionIds, ids.contradictions, "Analysis contradiction"); references(value.limitIds, ids.limits, "Analysis limit"); }
  for (const value of insights) { reference(value.analysisId, ids.analyses, "Insight Analysis"); references(value.factualAssertionIds, ids.facts, "Insight factual assertion"); }
  for (const value of recommendations) { reference(value.analysisId, ids.analyses, "Recommendation Analysis"); references(value.factualAssertionIds, ids.facts, "Recommendation factual assertion"); }
  for (const value of evaluations) { reference(value.analysisId, ids.analyses, "Evaluation Analysis"); for (const criterion of value.criteria) references(criterion.factualAssertionIds, ids.facts, "Evaluation factual assertion"); }
  for (const value of diagnostics) { reference(value.analysisId, ids.analyses, "Diagnostic Analysis"); references(value.establishedFactIds, ids.facts, "Diagnostic established fact"); references(value.possibleCauseHypothesisIds, ids.hypotheses, "Diagnostic possible cause"); }

  const evidenceIds = new Set<string>();
  facts.forEach((fact) => fact.evidenceIds.forEach((id) => evidenceIds.add(id)));
  hypotheses.forEach((item) => item.supportingEvidenceIds.forEach((id) => evidenceIds.add(id)));
  contradictions.forEach((item) => item.evidenceIds.forEach((id) => evidenceIds.add(id)));
  if (validateCurrentSources) {
    validateEvidence([...evidenceIds], state);
    validateActions(recommendations, state);
  }
  return Object.freeze({ question: content.question, scope: content.scope, method: content.method, observedAt: content.observedAt,
    factualAssertions: facts, hypotheses, interpretations, contradictions, limits, analyses, insights, recommendations, evaluations, diagnostics });
}

/** Revalidates live owner state without producing or revising an Intelligence result. */
export function assertIntelligenceSourcesCurrent(content: IntelligenceAssessmentContent, state: WorkAuthorizedState): void {
  validateWorkState(state);
  const evidenceIds = new Set<string>();
  content.factualAssertions.forEach((item) => item.evidenceIds.forEach((id) => evidenceIds.add(id)));
  content.hypotheses.forEach((item) => item.supportingEvidenceIds.forEach((id) => evidenceIds.add(id)));
  content.contradictions.forEach((item) => item.evidenceIds.forEach((id) => evidenceIds.add(id)));
  validateEvidence([...evidenceIds], state);
  validateActions(content.recommendations, state);
}

function validateWorkState(state: WorkAuthorizedState): Readonly<{ projectId: string; workId: string }> {
  if (state?.workCore?.availability !== "AVAILABLE") throw new IntelligenceDomainError("INTELLIGENCE_WORK_UNAVAILABLE", "Authoritative Work core is not available.");
  const reference = canonicalWorkReference(state);
  if (state.workCore.value.identity.projectId !== state.workReference.projectId || state.workCore.value.identity.workId !== state.workReference.workId) invalid("Work state identity is inconsistent.");
  return reference;
}

function canonicalWorkReference(state: WorkAuthorizedState): Readonly<{ projectId: string; workId: string }> {
  validateIdentity(state?.workReference?.projectId, "projectId"); validateIdentity(state?.workReference?.workId, "workId");
  return Object.freeze({ ...state.workReference });
}

function validateEvidence(ids: readonly string[], state: WorkAuthorizedState): void {
  if (state.evidence.availability === "UNAVAILABLE") throw new IntelligenceDomainError("INTELLIGENCE_EVIDENCE_AUTHORITY_UNAVAILABLE", "Evidence authority is unavailable.");
  if (state.evidence.availability === "NOT_FOUND") throw new IntelligenceDomainError("INTELLIGENCE_EVIDENCE_NOT_ADMISSIBLE", "Work Evidence contribution is not found.");
  const evidenceValue = state.evidence.value;
  if (evidenceValue.status === "UNAVAILABLE") throw new IntelligenceDomainError("INTELLIGENCE_EVIDENCE_AUTHORITY_UNAVAILABLE", "Evidence authority is unavailable.");
  const items = evidenceValue.evidences;
  for (const id of ids) {
    const item = items.find((candidate) => candidate.evidenceId === id);
    if (item === undefined || item.state !== "EVIDENCE_FOUND" || item.lifecycle !== "ACTIVE") throw new IntelligenceDomainError("INTELLIGENCE_EVIDENCE_NOT_ADMISSIBLE", `Evidence ${id} is not active and linked to the Work.`);
    if (item.evidence.certificationReference !== null) {
      if (item.certification?.state === "AUTHORITY_UNAVAILABLE") throw new IntelligenceDomainError("INTELLIGENCE_EVIDENCE_AUTHORITY_UNAVAILABLE", `Certification authority for Evidence ${id} is unavailable.`);
      const value = item.certification?.state === "RESOLVED" ? item.certification.value : undefined;
      if (!isCertified(value, id)) throw new IntelligenceDomainError("INTELLIGENCE_EVIDENCE_NOT_ADMISSIBLE", `Evidence ${id} does not have a current admissible Business Certification.`);
    }
  }
}

function validateActions(recommendations: readonly Recommendation[], state: WorkAuthorizedState): void {
  const referenced = recommendations.filter((item) => item.actionId !== undefined);
  if (referenced.length === 0) return;
  if (state.actions.availability === "UNAVAILABLE") throw new IntelligenceDomainError("INTELLIGENCE_ACTION_AUTHORITY_UNAVAILABLE", "Actions authority is unavailable.");
  if (state.actions.availability === "NOT_FOUND") throw new IntelligenceDomainError("INTELLIGENCE_ACTION_NOT_FOUND", "Work Actions contribution is not found.");
  const actionsValue = state.actions.value;
  if (actionsValue.status === "ACTIONS_UNAVAILABLE") throw new IntelligenceDomainError("INTELLIGENCE_ACTION_AUTHORITY_UNAVAILABLE", "Actions authority is unavailable.");
  for (const item of referenced) if (!actionsValue.actions.some((action) => action.actionId === item.actionId)) {
    throw new IntelligenceDomainError("INTELLIGENCE_ACTION_NOT_FOUND", `Action ${item.actionId} is not authoritative for this Work.`);
  }
}

function isCertified(value: unknown, evidenceId: string): boolean {
  if (typeof value !== "object" || value === null) return false;
  const snapshot = "snapshot" in value ? (value as { snapshot?: unknown }).snapshot : value;
  if (typeof snapshot !== "object" || snapshot === null) return false;
  const candidate = snapshot as { currentState?: unknown; decision?: unknown; subject?: { kind?: unknown; evidenceId?: unknown } };
  return candidate.currentState === "CERTIFIED" && candidate.decision === "CERTIFIED"
    && candidate.subject?.kind === "BUSINESS_EVIDENCE" && candidate.subject.evidenceId === evidenceId;
}

function normalizeFact(value: FactualAssertion): FactualAssertion {
  validateIdentity(value.assertionId, "assertionId"); validateText(value.statement, "factual statement");
  const evidenceIds = nonEmptyIds(value.evidenceIds, "Factual assertion Evidence");
  return Object.freeze({ assertionId: value.assertionId, statement: value.statement, evidenceIds: evidenceIds as [string, ...string[]] });
}
function normalizeHypothesis(value: Hypothesis): Hypothesis { validateIdentity(value.hypothesisId, "hypothesisId"); validateText(value.statement, "hypothesis"); return Object.freeze({ ...value, supportingEvidenceIds: ids(value.supportingEvidenceIds, "Hypothesis Evidence") }); }
function normalizeInterpretation(value: Interpretation): Interpretation { validateIdentity(value.interpretationId, "interpretationId"); validateText(value.statement, "interpretation"); return Object.freeze({ ...value, factualAssertionIds: ids(value.factualAssertionIds, "Interpretation assertion") }); }
function normalizeContradiction(value: IntelligenceContradiction): IntelligenceContradiction { validateIdentity(value.contradictionId, "contradictionId"); validateText(value.statement, "contradiction"); const evidenceIds = nonEmptyIds(value.evidenceIds, "Contradiction Evidence"); if (evidenceIds.length < 2) invalid("A contradiction requires at least two distinct Evidence references."); return Object.freeze({ ...value, evidenceIds: evidenceIds as [string, string, ...string[]] }); }
function normalizeLimit(value: IntelligenceLimit): IntelligenceLimit { validateIdentity(value.limitId, "limitId"); validateText(value.statement, "limit"); return Object.freeze({ ...value }); }
function normalizeAnalysis(value: Analysis): Analysis { validateIdentity(value.analysisId, "analysisId"); validateText(value.statement, "analysis"); return Object.freeze({ ...value, factualAssertionIds: ids(value.factualAssertionIds, "Analysis assertion"), hypothesisIds: ids(value.hypothesisIds, "Analysis hypothesis"), interpretationIds: ids(value.interpretationIds, "Analysis interpretation"), contradictionIds: ids(value.contradictionIds, "Analysis contradiction"), limitIds: ids(value.limitIds, "Analysis limit") }); }
function normalizeInsight(value: Insight): Insight { validateIdentity(value.insightId, "insightId"); validateText(value.statement, "insight"); validateIdentity(value.analysisId, "analysisId"); return Object.freeze({ ...value, factualAssertionIds: ids(value.factualAssertionIds, "Insight assertion") }); }
function normalizeRecommendation(value: Recommendation): Recommendation { validateIdentity(value.recommendationId, "recommendationId"); validateText(value.statement, "recommendation"); validateText(value.rationale, "recommendation rationale"); validateIdentity(value.analysisId, "analysisId"); if (!Number.isSafeInteger(value.rank) || value.rank < 1) invalid("Recommendation rank must be a positive integer."); validateText(value.rankingMethod, "rankingMethod"); if (value.effect !== "NONE") invalid("Recommendation must be non-imperative and have no effect."); if (value.actionId !== undefined) validateIdentity(value.actionId, "actionId"); return Object.freeze({ ...value, factualAssertionIds: ids(value.factualAssertionIds, "Recommendation assertion") }); }
function normalizeEvaluation(value: Evaluation): Evaluation { validateIdentity(value.evaluationId, "evaluationId"); validateText(value.subjectReference, "evaluation subject"); validateIdentity(value.analysisId, "analysisId"); if (!Array.isArray(value.criteria) || value.criteria.length === 0) invalid("Evaluation criteria are required."); const criteria = unique(value.criteria, "criterionId", (criterion) => { validateIdentity(criterion.criterionId, "criterionId"); validateText(criterion.statement, "criterion"); validateText(criterion.outcome, "criterion outcome"); return Object.freeze({ ...criterion, factualAssertionIds: ids(criterion.factualAssertionIds, "Criterion assertion") }); }); return Object.freeze({ ...value, criteria: criteria as [typeof criteria[number], ...typeof criteria[number][]] }); }
function normalizeDiagnostic(value: Diagnostic): Diagnostic { validateIdentity(value.diagnosticId, "diagnosticId"); validateText(value.statement, "diagnostic"); validateIdentity(value.analysisId, "analysisId"); return Object.freeze({ ...value, establishedFactIds: ids(value.establishedFactIds, "Diagnostic fact"), possibleCauseHypothesisIds: ids(value.possibleCauseHypothesisIds, "Diagnostic hypothesis") }); }

function unique<T, K extends keyof T>(values: readonly T[], key: K, normalize: (value: T) => T): readonly T[] { if (!Array.isArray(values)) invalid(`${String(key)} collection is required.`); const normalized = values.map(normalize); const seen = new Set<unknown>(); for (const value of normalized) { if (seen.has(value[key])) invalid(`Duplicate ${String(key)}.`); seen.add(value[key]); } return Object.freeze(normalized.sort((a, b) => compare(String(a[key]), String(b[key])))); }
function ids(values: readonly string[], label: string): readonly string[] { if (!Array.isArray(values)) invalid(`${label} list is required.`); const result = [...new Set(values.map((value) => { validateIdentity(value, label); return value; }))].sort(compare); if (result.length !== values.length) invalid(`${label} list contains duplicates.`); return Object.freeze(result); }
function nonEmptyIds(values: readonly string[], label: string): readonly string[] { const result = ids(values, label); if (result.length === 0) throw new IntelligenceDomainError("INTELLIGENCE_EVIDENCE_REQUIRED", `${label} is required.`); return result; }
function reference(value: string, available: ReadonlySet<string>, label: string): void { if (!available.has(value)) invalid(`${label} ${value} is not present in the Assessment.`); }
function references(values: readonly string[], available: ReadonlySet<string>, label: string): void { values.forEach((value) => reference(value, available, label)); }
function makeRevision(revision: number, content: IntelligenceAssessmentContent, command: CommandIdentity, reason: string | null): IntelligenceRevision { return Object.freeze({ revision, content, provenance: Object.freeze({ producer: "INTELLIGENCE_AUTHORITY", actor: command.actor, causationIdentity: command.causationIdentity, producedAt: iso(command.at, "at") }), reason }); }
function validateCommand(command: CommandIdentity): void { validateText(command.actor, "actor"); validateText(command.causationIdentity, "causationIdentity"); validateText(command.idempotencyIdentity, "idempotencyIdentity"); iso(command.at, "at"); }
function validateIdentity(value: unknown, label: string): asserts value is string { validateText(value, label); if (/[/\\]/u.test(value)) invalid(`${label} must be opaque and must not be a path.`); }
function validateText(value: unknown, label: string): asserts value is string { if (typeof value !== "string" || value.length === 0 || value.trim() !== value) invalid(`${label} must be explicit and canonical.`); }
function validateIso(value: unknown, label: string): asserts value is string { if (typeof value !== "string") invalid(`${label} must be an ISO timestamp.`); try { if (new Date(value).toISOString() !== value) invalid(`${label} must be canonical ISO.`); } catch { invalid(`${label} must be canonical ISO.`); } }
function iso(value: Date, label: string): string { if (!(value instanceof Date) || !Number.isFinite(value.getTime())) invalid(`${label} must be a valid date.`); return value.toISOString(); }
function required(records: ReadonlyMap<string, IntelligenceAssessment>, id: string): IntelligenceAssessment { const record = records.get(id); if (record === undefined) throw new IntelligenceDomainError("INTELLIGENCE_NOT_FOUND", `Assessment ${id} does not exist.`); return record; }
function findEvent(records: ReadonlyMap<string, IntelligenceAssessment>, idempotency: string): IntelligenceLifecycleEvent | null { for (const record of records.values()) for (const event of record.history) if (event.idempotencyIdentity === idempotency) return event; return null; }
function stable(value: unknown): string { return JSON.stringify(value); }
function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}
function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function invalid(message: string): never { throw new IntelligenceDomainError("INTELLIGENCE_INVALID_INPUT", message); }
function corrupt(message: string): IntelligenceDomainError { return new IntelligenceDomainError("INTELLIGENCE_JOURNAL_CORRUPT", message); }
function idempotencyConflict(): never { throw new IntelligenceDomainError("INTELLIGENCE_IDEMPOTENCY_CONFLICT", "Idempotency identity was reused divergently."); }

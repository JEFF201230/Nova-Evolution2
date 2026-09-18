import { assertIntelligenceSourcesCurrent, IntelligenceDomainError, type IntelligenceAssessment } from "../intelligence/index.js";
import type { WorkAuthorizedState } from "../work/index.js";
import { SynthesisDomainError } from "./synthesis.errors.js";
import type { SynthesisJournal } from "./synthesis.journal.js";
import type {
  IntelligenceSourceReference,
  SynthesisContent,
  SynthesisElement,
  SynthesisLifecycleEvent,
  SynthesisRevision,
  SynthesisSourceReference,
  SynthesisWorkReference,
  WorkSynthesis,
} from "./synthesis.types.js";

export interface SynthesisIntelligenceReadSource {
  listByWork(workReference: SynthesisWorkReference): readonly IntelligenceAssessment[];
}

type CommandIdentity = Readonly<{
  actor: string;
  causationIdentity: string;
  idempotencyIdentity: string;
  at: Date;
}>;

export type SynthesisDraft = Readonly<{
  scope: string;
  audience: string;
  elements: readonly SynthesisElement[];
  /** Omission selects every current result; a provided list is an explicit subset. */
  selectedAssessmentIds?: readonly string[];
}>;

export type EstablishSynthesis = CommandIdentity & Readonly<{
  synthesisId: string;
  workState: WorkAuthorizedState;
  draft: SynthesisDraft;
}>;

export type ReviseSynthesis = EstablishSynthesis & Readonly<{
  expectedRevision: number;
  reason: string;
}>;

export type WithdrawSynthesis = Omit<CommandIdentity, "causationIdentity"> & Readonly<{
  synthesisId: string;
  expectedRevision: number;
  reason: string;
}>;

export class SynthesisAuthority {
  constructor(
    private readonly journal: SynthesisJournal,
    private readonly intelligence: SynthesisIntelligenceReadSource,
  ) {}

  establish(command: EstablishSynthesis): WorkSynthesis {
    validateIdentity(command.synthesisId, "synthesisId"); validateCommand(command);
    const records = rebuildSynthesis(this.journal.read());
    const workReference = canonicalWork(command.workState);
    const content = buildContent(command.workState, command.draft, this.readIntelligence(workReference));
    const revision = makeRevision(1, content, command, null);
    const replay = findEvent(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== "SYNTHESIS_ESTABLISHED" || replay.synthesisId !== command.synthesisId
        || stable(replay.workReference) !== stable(workReference) || stable(replay.revision) !== stable(revision)) idempotencyConflict();
      return required(records, command.synthesisId);
    }
    if (records.has(command.synthesisId)) throw new SynthesisDomainError("SYNTHESIS_REVISION_CONFLICT", "Synthesis identity already exists.");
    if (currentForWork(records, workReference) !== undefined) throw new SynthesisDomainError("SYNTHESIS_CURRENT_CONFLICT", "The Work already has a current Synthesis.");
    this.journal.append(Object.freeze([Object.freeze({
      type: "SYNTHESIS_ESTABLISHED", synthesisId: command.synthesisId,
      idempotencyIdentity: command.idempotencyIdentity, at: revision.provenance.producedAt,
      actor: command.actor, workReference, revision,
    })]));
    return required(rebuildSynthesis(this.journal.read()), command.synthesisId);
  }

  revise(command: ReviseSynthesis): WorkSynthesis {
    validateIdentity(command.synthesisId, "synthesisId"); validateText(command.reason, "reason"); validateCommand(command);
    const records = rebuildSynthesis(this.journal.read());
    const record = required(records, command.synthesisId);
    const workReference = canonicalWork(command.workState);
    const content = buildContent(command.workState, command.draft, this.readIntelligence(workReference));
    const revision = makeRevision(command.expectedRevision + 1, content, command, command.reason);
    const replay = findEvent(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== "SYNTHESIS_REVISED" || replay.synthesisId !== command.synthesisId || stable(replay.revision) !== stable(revision)) idempotencyConflict();
      return record;
    }
    if (record.lifecycle !== "CURRENT") throw new SynthesisDomainError("SYNTHESIS_TERMINAL", "A withdrawn Synthesis cannot be revised.");
    if (stable(record.workReference) !== stable(workReference)) invalid("WorkReference is immutable.");
    if (record.currentRevision.revision !== command.expectedRevision) throw new SynthesisDomainError("SYNTHESIS_REVISION_CONFLICT", "Expected revision is not current.");
    this.journal.append(Object.freeze([Object.freeze({
      type: "SYNTHESIS_REVISED", synthesisId: command.synthesisId,
      idempotencyIdentity: command.idempotencyIdentity, at: revision.provenance.producedAt,
      actor: command.actor, revision, reason: command.reason,
    })]));
    return required(rebuildSynthesis(this.journal.read()), command.synthesisId);
  }

  withdraw(command: WithdrawSynthesis): WorkSynthesis {
    validateIdentity(command.synthesisId, "synthesisId"); validateText(command.reason, "reason");
    validateText(command.actor, "actor"); validateText(command.idempotencyIdentity, "idempotencyIdentity");
    const at = iso(command.at, "at");
    const records = rebuildSynthesis(this.journal.read());
    const record = required(records, command.synthesisId);
    const replay = findEvent(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== "SYNTHESIS_WITHDRAWN" || replay.synthesisId !== command.synthesisId
        || replay.reason !== command.reason || replay.actor !== command.actor || replay.at !== at) idempotencyConflict();
      return record;
    }
    if (record.lifecycle !== "CURRENT") throw new SynthesisDomainError("SYNTHESIS_TERMINAL", "Synthesis is already withdrawn.");
    if (record.currentRevision.revision !== command.expectedRevision) throw new SynthesisDomainError("SYNTHESIS_REVISION_CONFLICT", "Expected revision is not current.");
    this.journal.append(Object.freeze([Object.freeze({ type: "SYNTHESIS_WITHDRAWN", synthesisId: command.synthesisId,
      idempotencyIdentity: command.idempotencyIdentity, at, actor: command.actor, reason: command.reason })]));
    return required(rebuildSynthesis(this.journal.read()), command.synthesisId);
  }

  readAll(): ReadonlyMap<string, WorkSynthesis> { return rebuildSynthesis(this.journal.read()); }

  private readIntelligence(work: SynthesisWorkReference): readonly IntelligenceAssessment[] {
    try { return this.intelligence.listByWork(work); }
    catch (cause) { throw new SynthesisDomainError("SYNTHESIS_INTELLIGENCE_UNAVAILABLE", "Intelligence producer is unavailable.", { cause }); }
  }
}

export function rebuildSynthesis(events: readonly SynthesisLifecycleEvent[]): ReadonlyMap<string, WorkSynthesis> {
  const records = new Map<string, WorkSynthesis>();
  const idempotencies = new Set<string>();
  for (const raw of events) {
    const event = deepFreeze(JSON.parse(JSON.stringify(raw)) as SynthesisLifecycleEvent);
    if (idempotencies.has(event.idempotencyIdentity)) throw corrupt("Duplicate idempotency identity.");
    idempotencies.add(event.idempotencyIdentity);
    if (event.type === "SYNTHESIS_ESTABLISHED") {
      if (records.has(event.synthesisId) || event.workReference === undefined || event.revision?.revision !== 1) throw corrupt("Invalid establishment history.");
      if (currentForWork(records, event.workReference) !== undefined) throw corrupt("Multiple current Syntheses exist for one Work.");
      records.set(event.synthesisId, Object.freeze({ synthesisId: event.synthesisId, workReference: event.workReference,
        lifecycle: "CURRENT", currentRevision: event.revision, revisions: Object.freeze([event.revision]),
        history: Object.freeze([event]), withdrawal: null }));
      continue;
    }
    const record = records.get(event.synthesisId);
    if (record === undefined || record.lifecycle !== "CURRENT") throw corrupt("History targets an absent or terminal Synthesis.");
    if (event.type === "SYNTHESIS_REVISED") {
      if (event.revision === undefined || event.revision.revision !== record.currentRevision.revision + 1 || event.reason !== event.revision.reason) throw corrupt("Revision sequence is invalid.");
      records.set(event.synthesisId, Object.freeze({ ...record, currentRevision: event.revision,
        revisions: Object.freeze([...record.revisions, event.revision]), history: Object.freeze([...record.history, event]) }));
    } else {
      if (event.reason === undefined) throw corrupt("Withdrawal reason is missing.");
      records.set(event.synthesisId, Object.freeze({ ...record, lifecycle: "WITHDRAWN",
        history: Object.freeze([...record.history, event]), withdrawal: Object.freeze({ reason: event.reason, actor: event.actor, at: event.at }) }));
    }
  }
  return records;
}

function buildContent(state: WorkAuthorizedState, draft: SynthesisDraft, available: readonly IntelligenceAssessment[]): SynthesisContent {
  validateText(draft?.scope, "scope"); validateText(draft?.audience, "audience");
  const work = canonicalWork(state);
  const orderedAvailable = [...available].sort((a, b) => compare(a.assessmentId, b.assessmentId));
  for (const assessment of orderedAvailable) {
    if (assessment.workReference.projectId !== work.projectId || assessment.workReference.workId !== work.workId) invalid("Intelligence returned a result for another Work.");
  }
  const current = orderedAvailable.filter((item) => item.lifecycle === "CURRENT");
  const requested = draft.selectedAssessmentIds === undefined
    ? current.map((item) => item.assessmentId)
    : uniqueStrings(draft.selectedAssessmentIds, "selectedAssessmentIds");
  const byId = new Map(current.map((item) => [item.assessmentId, item]));
  const selected = requested.sort(compare).map((id) => {
    const assessment = byId.get(id);
    if (assessment === undefined) throw new SynthesisDomainError("SYNTHESIS_SOURCE_NOT_FOUND", `Current Intelligence result ${id} is unavailable.`);
    return assessment;
  });
  for (const assessment of selected) {
    validateIso(assessment.currentRevision.content.observedAt, "Intelligence observedAt");
    if (Date.parse(assessment.currentRevision.content.observedAt) > Date.parse(state.compositionObservedAt)) invalid("A Synthesis cannot observe a future Intelligence result.");
    try { assertIntelligenceSourcesCurrent(assessment.currentRevision.content, state); }
    catch (cause) {
      if (cause instanceof IntelligenceDomainError && (cause.code === "INTELLIGENCE_EVIDENCE_AUTHORITY_UNAVAILABLE" || cause.code === "INTELLIGENCE_ACTION_AUTHORITY_UNAVAILABLE")) {
        throw new SynthesisDomainError("SYNTHESIS_EVIDENCE_UNAVAILABLE", "An authoritative source required by Intelligence is unavailable.", { cause });
      }
      throw new SynthesisDomainError("SYNTHESIS_EVIDENCE_NOT_ADMISSIBLE", "A selected Intelligence result no longer has admissible source support.", { cause });
    }
  }
  const sources: SynthesisSourceReference[] = [Object.freeze({ sourceReferenceId: "WORK_AUTHORIZED_STATE", owner: "WORK", kind: "AUTHORIZED_WORK_STATE", observedAt: state.compositionObservedAt })];
  for (const assessment of selected) sources.push(...assessmentSources(assessment));
  sources.sort((a, b) => compare(a.sourceReferenceId, b.sourceReferenceId));
  const sourceIds = new Set(sources.map((item) => item.sourceReferenceId));
  if (sourceIds.size !== sources.length) invalid("Source reference identities must be unique.");
  const elements = uniqueElements(draft.elements).map((element) => {
    const ids = uniqueStrings(element.sourceReferenceIds, `element ${element.elementId} sources`).sort(compare);
    if (ids.length === 0) invalid("Every meaningful element requires a source reference.");
    for (const id of ids) if (!sourceIds.has(id)) throw new SynthesisDomainError("SYNTHESIS_SOURCE_NOT_FOUND", `Source reference ${id} is unavailable.`);
    return Object.freeze({ elementId: element.elementId, form: element.form, text: element.text,
      sourceReferenceIds: Object.freeze(ids) as readonly [string, ...string[]] });
  }).sort((a, b) => compare(a.form, b.form) || compare(a.elementId, b.elementId));
  const conflicts = selected.flatMap((assessment) => assessment.currentRevision.content.contradictions.map((item) => Object.freeze({
    conflictId: `${assessment.assessmentId}:${item.contradictionId}`, statement: item.statement,
    sourceReferenceId: sourceId(assessment, "CONTRADICTION", item.contradictionId), evidenceIds: Object.freeze([...item.evidenceIds].sort(compare)) as readonly [string, string, ...string[]],
  }))).sort((a, b) => compare(a.conflictId, b.conflictId));
  const limits = selected.flatMap((assessment) => assessment.currentRevision.content.limits.map((item) => Object.freeze({
    limitId: `${assessment.assessmentId}:${item.limitId}`, statement: item.statement,
    sourceReferenceId: sourceId(assessment, "LIMIT", item.limitId),
  }))).sort((a, b) => compare(a.limitId, b.limitId));
  return deepFreeze({ scope: draft.scope, audience: draft.audience, observationDate: state.compositionObservedAt,
    elements: Object.freeze(elements), sources: Object.freeze(sources), conflicts: Object.freeze(conflicts), limits: Object.freeze(limits) });
}

function assessmentSources(assessment: IntelligenceAssessment): IntelligenceSourceReference[] {
  const revision = assessment.currentRevision;
  const content = revision.content;
  const result: IntelligenceSourceReference[] = [source(assessment, "ASSESSMENT", undefined, [])];
  const facts = new Map(content.factualAssertions.map((item) => [item.assertionId, item.evidenceIds]));
  const evidenceForFacts = (ids: readonly string[]): string[] => [...new Set(ids.flatMap((id) => facts.get(id) ?? []))].sort(compare);
  for (const item of content.factualAssertions) result.push(source(assessment, "FACTUAL_ASSERTION", item.assertionId, [...item.evidenceIds]));
  for (const item of content.hypotheses) result.push(source(assessment, "HYPOTHESIS", item.hypothesisId, [...item.supportingEvidenceIds]));
  for (const item of content.interpretations) result.push(source(assessment, "INTERPRETATION", item.interpretationId, evidenceForFacts(item.factualAssertionIds)));
  for (const item of content.contradictions) result.push(source(assessment, "CONTRADICTION", item.contradictionId, [...item.evidenceIds]));
  for (const item of content.limits) result.push(source(assessment, "LIMIT", item.limitId, []));
  for (const item of content.analyses) result.push(source(assessment, "ANALYSIS", item.analysisId, evidenceForFacts(item.factualAssertionIds)));
  for (const item of content.insights) result.push(source(assessment, "INSIGHT", item.insightId, evidenceForFacts(item.factualAssertionIds)));
  for (const item of content.recommendations) result.push(source(assessment, "RECOMMENDATION", item.recommendationId, evidenceForFacts(item.factualAssertionIds)));
  for (const item of content.evaluations) result.push(source(assessment, "EVALUATION", item.evaluationId, evidenceForFacts(item.criteria.flatMap((criterion) => criterion.factualAssertionIds))));
  for (const item of content.diagnostics) result.push(source(assessment, "DIAGNOSTIC", item.diagnosticId, evidenceForFacts(item.establishedFactIds)));
  return result.sort((a, b) => compare(a.sourceReferenceId, b.sourceReferenceId));
}

function source(assessment: IntelligenceAssessment, kind: IntelligenceSourceReference["kind"], elementId: string | undefined, evidenceIds: string[]): IntelligenceSourceReference {
  return Object.freeze({ sourceReferenceId: sourceId(assessment, kind, elementId), owner: "INTELLIGENCE", kind,
    assessmentId: assessment.assessmentId, assessmentRevision: assessment.currentRevision.revision,
    ...(elementId === undefined ? {} : { elementId }), observedAt: assessment.currentRevision.content.observedAt,
    evidenceIds: Object.freeze([...new Set(evidenceIds)].sort(compare)) });
}
function sourceId(assessment: IntelligenceAssessment, kind: IntelligenceSourceReference["kind"], elementId?: string): string {
  return `INTELLIGENCE:${assessment.assessmentId}:R${assessment.currentRevision.revision}:${kind}${elementId === undefined ? "" : `:${elementId}`}`;
}

function uniqueElements(values: readonly SynthesisElement[]): SynthesisElement[] {
  if (!Array.isArray(values)) invalid("elements must be an array.");
  const ids = new Set<string>();
  return values.map((item) => {
    validateIdentity(item?.elementId, "elementId"); validateText(item?.text, "element text");
    if (!(["SUMMARY", "EXECUTIVE_SUMMARY", "CONCLUSION", "NARRATIVE", "DIGEST", "RECAP"] as const).includes(item.form)) invalid("Unknown Synthesis form.");
    if (ids.has(item.elementId)) invalid("Duplicate Synthesis element identity."); ids.add(item.elementId);
    return item;
  });
}
function uniqueStrings(values: readonly string[], field: string): string[] {
  if (!Array.isArray(values)) invalid(`${field} must be an array.`);
  const result = values.map((value) => { validateIdentity(value, field); return value; });
  if (new Set(result).size !== result.length) invalid(`${field} must not contain duplicates.`);
  return result;
}
function canonicalWork(state: WorkAuthorizedState): SynthesisWorkReference {
  if (state?.workCore?.availability !== "AVAILABLE") throw new SynthesisDomainError("SYNTHESIS_WORK_UNAVAILABLE", "Authoritative Work core is not available.");
  const reference = state.workReference;
  validateIdentity(reference?.projectId, "projectId"); validateIdentity(reference?.workId, "workId"); validateIso(state.compositionObservedAt, "compositionObservedAt");
  if (state.workCore.value.identity.projectId !== reference.projectId || state.workCore.value.identity.workId !== reference.workId) invalid("Work state identity is inconsistent.");
  return Object.freeze({ projectId: reference.projectId, workId: reference.workId });
}
function makeRevision(revision: number, content: SynthesisContent, command: CommandIdentity, reason: string | null): SynthesisRevision {
  return deepFreeze({ revision, content, provenance: { producer: "SYNTHESIS_AUTHORITY", actor: command.actor,
    causationIdentity: command.causationIdentity, producedAt: iso(command.at, "at") }, reason });
}
function validateCommand(command: CommandIdentity): void { validateText(command.actor, "actor"); validateIdentity(command.causationIdentity, "causationIdentity"); validateIdentity(command.idempotencyIdentity, "idempotencyIdentity"); iso(command.at, "at"); }
function validateIdentity(value: unknown, field: string): asserts value is string { if (typeof value !== "string" || value.length === 0 || value.trim() !== value) invalid(`${field} must be canonical.`); }
function validateText(value: unknown, field: string): asserts value is string { if (typeof value !== "string" || value.trim().length === 0) invalid(`${field} is required.`); }
function validateIso(value: unknown, field: string): asserts value is string { if (typeof value !== "string" || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) invalid(`${field} must be canonical ISO-8601.`); }
function iso(value: Date, field: string): string { if (!(value instanceof Date) || !Number.isFinite(value.getTime())) invalid(`${field} must be a valid Date.`); return value.toISOString(); }
function currentForWork(records: ReadonlyMap<string, WorkSynthesis>, work: SynthesisWorkReference): WorkSynthesis | undefined { return [...records.values()].find((item) => item.lifecycle === "CURRENT" && item.workReference.projectId === work.projectId && item.workReference.workId === work.workId); }
function findEvent(records: ReadonlyMap<string, WorkSynthesis>, identity: string): SynthesisLifecycleEvent | null { for (const record of records.values()) for (const event of record.history) if (event.idempotencyIdentity === identity) return event; return null; }
function required(records: ReadonlyMap<string, WorkSynthesis>, id: string): WorkSynthesis { const value = records.get(id); if (value === undefined) throw new SynthesisDomainError("SYNTHESIS_NOT_FOUND", `Synthesis ${id} does not exist.`); return value; }
function stable(value: unknown): string { return JSON.stringify(value); }
function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function deepFreeze<T>(value: T): T { if (value !== null && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); for (const nested of Object.values(value)) deepFreeze(nested); } return value; }
function invalid(message: string): never { throw new SynthesisDomainError("SYNTHESIS_INVALID_INPUT", message); }
function corrupt(message: string): never { throw new SynthesisDomainError("SYNTHESIS_JOURNAL_CORRUPT", message); }
function idempotencyConflict(): never { throw new SynthesisDomainError("SYNTHESIS_IDEMPOTENCY_CONFLICT", "Idempotency identity was used by a different command."); }

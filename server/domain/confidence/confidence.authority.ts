import { EvidenceId, type BusinessEvidenceRecord } from "../evidence/evidence-model.js";
import { ConfidenceDomainError } from "./confidence.errors.js";
import type { ConfidenceJournal } from "./confidence.journal.js";
import {
  applyConfidenceMethod, CONFIDENCE_METHOD, type ConfidenceAssessment, type ConfidenceContext,
  type ConfidenceLifecycleEvent, type ConfidenceRevision, type ConfidenceSubject,
  type ProducedConfidenceAssessment, type WeightedEvidenceReference,
} from "./confidence.types.js";

export type ConfidenceEvidenceQueryResult =
  | Readonly<{ state: "FOUND"; evidence: BusinessEvidenceRecord }>
  | Readonly<{ state: "ABSENT" }>
  | Readonly<{ state: "AUTHORITY_UNAVAILABLE"; cause: unknown }>;
export interface ConfidenceEvidenceReadPort { byEvidenceId(id: EvidenceId): ConfidenceEvidenceQueryResult; }

type CommandIdentity = Readonly<{ actor: string; causationIdentity: string; idempotencyIdentity: string; at: Date }>;
export type AssessConfidence = CommandIdentity & Readonly<{ confidenceAssessmentId: string; produced: ProducedConfidenceAssessment }>;
export type ReassessConfidence = CommandIdentity & Readonly<{ confidenceAssessmentId: string; expectedRevision: number; reason: string; produced: ProducedConfidenceAssessment }>;
export type WithdrawConfidence = Omit<CommandIdentity, "causationIdentity"> & Readonly<{ confidenceAssessmentId: string; expectedRevision: number; reason: string }>;

export class ConfidenceAuthority {
  constructor(private readonly journal: ConfidenceJournal, private readonly evidence: ConfidenceEvidenceReadPort) {}

  assess(command: AssessConfidence): ConfidenceAssessment {
    validateIdentity(command.confidenceAssessmentId, "confidenceAssessmentId"); validateCommand(command);
    const records = rebuild(this.journal.read());
    const replay = findEvent(records, command.idempotencyIdentity);
    const content = normalizeProduced(command.produced);
    const revision = makeRevision(1, content, command, null);
    if (replay !== null) {
      if (replay.type !== "CONFIDENCE_ASSESSED" || replay.confidenceAssessmentId !== command.confidenceAssessmentId || stable(replay.revision) !== stable(revision)) idempotencyConflict();
      return required(records, command.confidenceAssessmentId);
    }
    if (records.has(command.confidenceAssessmentId)) throw new ConfidenceDomainError("CONFIDENCE_REVISION_CONFLICT", "Confidence Assessment identity already exists.");
    if (currentFor(records, content.subject, content.context) !== undefined) throw new ConfidenceDomainError("CONFIDENCE_CURRENT_CONFLICT", "A current Confidence Assessment already exists for this subject and context.");
    this.validateEvidence(content);
    const event: ConfidenceLifecycleEvent = deepFreeze({ type: "CONFIDENCE_ASSESSED", confidenceAssessmentId: command.confidenceAssessmentId,
      idempotencyIdentity: command.idempotencyIdentity, at: revision.provenance.recordedAt, actor: command.actor, revision });
    this.journal.append(Object.freeze([event]));
    return required(rebuild(this.journal.read()), command.confidenceAssessmentId);
  }

  reassess(command: ReassessConfidence): ConfidenceAssessment {
    validateIdentity(command.confidenceAssessmentId, "confidenceAssessmentId"); validateText(command.reason, "reason"); validateCommand(command);
    const records = rebuild(this.journal.read());
    const record = required(records, command.confidenceAssessmentId);
    const content = normalizeProduced(command.produced);
    if (stable(content.subject) !== stable(record.subject) || stable(content.context) !== stable(record.context)) invalid("Subject and context are immutable.");
    const revision = makeRevision(command.expectedRevision + 1, content, command, command.reason);
    const replay = findEvent(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== "CONFIDENCE_REASSESSED" || replay.confidenceAssessmentId !== command.confidenceAssessmentId || stable(replay.revision) !== stable(revision)) idempotencyConflict();
      return record;
    }
    if (record.lifecycle !== "CURRENT") throw new ConfidenceDomainError("CONFIDENCE_TERMINAL", "A withdrawn Confidence Assessment cannot be revised.");
    if (record.currentRevision.revision !== command.expectedRevision) throw new ConfidenceDomainError("CONFIDENCE_REVISION_CONFLICT", "Expected revision is not current.");
    this.validateEvidence(content);
    const event: ConfidenceLifecycleEvent = deepFreeze({ type: "CONFIDENCE_REASSESSED", confidenceAssessmentId: command.confidenceAssessmentId,
      idempotencyIdentity: command.idempotencyIdentity, at: revision.provenance.recordedAt, actor: command.actor, revision, reason: command.reason });
    this.journal.append(Object.freeze([event]));
    return required(rebuild(this.journal.read()), command.confidenceAssessmentId);
  }

  withdraw(command: WithdrawConfidence): ConfidenceAssessment {
    validateIdentity(command.confidenceAssessmentId, "confidenceAssessmentId"); validateText(command.reason, "reason");
    validateText(command.actor, "actor"); validateIdentity(command.idempotencyIdentity, "idempotencyIdentity"); const at = iso(command.at, "at");
    const records = rebuild(this.journal.read()); const record = required(records, command.confidenceAssessmentId);
    const replay = findEvent(records, command.idempotencyIdentity);
    if (replay !== null) {
      if (replay.type !== "CONFIDENCE_WITHDRAWN" || replay.confidenceAssessmentId !== command.confidenceAssessmentId || replay.reason !== command.reason || replay.at !== at) idempotencyConflict();
      return record;
    }
    if (record.lifecycle !== "CURRENT") throw new ConfidenceDomainError("CONFIDENCE_TERMINAL", "Confidence Assessment is already withdrawn.");
    if (record.currentRevision.revision !== command.expectedRevision) throw new ConfidenceDomainError("CONFIDENCE_REVISION_CONFLICT", "Expected revision is not current.");
    const event: ConfidenceLifecycleEvent = deepFreeze({ type: "CONFIDENCE_WITHDRAWN", confidenceAssessmentId: command.confidenceAssessmentId,
      idempotencyIdentity: command.idempotencyIdentity, at, actor: command.actor, reason: command.reason });
    this.journal.append(Object.freeze([event]));
    return required(rebuild(this.journal.read()), command.confidenceAssessmentId);
  }

  readAll(): ReadonlyMap<string, ConfidenceAssessment> { return rebuild(this.journal.read()); }

  private validateEvidence(content: ProducedConfidenceAssessment): void {
    for (const reference of allEvidence(content)) {
      let result: ConfidenceEvidenceQueryResult;
      try { result = this.evidence.byEvidenceId(EvidenceId.of(reference.evidenceId)); }
      catch (cause) { throw new ConfidenceDomainError("CONFIDENCE_EVIDENCE_UNAVAILABLE", `Evidence authority failed for ${reference.evidenceId}.`, { cause }); }
      if (result.state === "AUTHORITY_UNAVAILABLE") throw new ConfidenceDomainError("CONFIDENCE_EVIDENCE_UNAVAILABLE", `Evidence authority is unavailable for ${reference.evidenceId}.`, { cause: result.cause });
      if (result.state === "ABSENT") throw new ConfidenceDomainError("CONFIDENCE_EVIDENCE_NOT_FOUND", `Evidence ${reference.evidenceId} is absent.`);
      if (result.evidence.evidenceId.value !== reference.evidenceId) throw new ConfidenceDomainError("CONFIDENCE_EVIDENCE_NOT_ADMISSIBLE", `Evidence authority returned a different identity for ${reference.evidenceId}.`);
      if (result.evidence.lifecycle !== "ACTIVE") throw new ConfidenceDomainError("CONFIDENCE_EVIDENCE_NOT_ADMISSIBLE", `Evidence ${reference.evidenceId} is not active.`);
    }
  }
}

export function rebuild(events: readonly ConfidenceLifecycleEvent[]): ReadonlyMap<string, ConfidenceAssessment> {
  const records = new Map<string, ConfidenceAssessment>(); const idempotency = new Set<string>();
  for (const event of events) {
    validateIdentity(event.confidenceAssessmentId, "event confidenceAssessmentId"); validateIdentity(event.idempotencyIdentity, "event idempotencyIdentity"); validateText(event.actor, "event actor"); validateIso(event.at, "event at");
    if (!(event.type === "CONFIDENCE_ASSESSED" || event.type === "CONFIDENCE_REASSESSED" || event.type === "CONFIDENCE_WITHDRAWN")) corrupt("Unknown Confidence lifecycle event type.");
    if (idempotency.has(event.idempotencyIdentity)) corrupt("Duplicate idempotency identity in Confidence history."); idempotency.add(event.idempotencyIdentity);
    if (event.type === "CONFIDENCE_ASSESSED") {
      if (records.has(event.confidenceAssessmentId) || event.revision?.revision !== 1) corrupt("Invalid Confidence creation history.");
      const revision = normalizeStoredRevision(event.revision);
      if (event.at !== revision.provenance.recordedAt || event.actor !== revision.provenance.actor) corrupt("Confidence creation provenance is inconsistent.");
      if (currentFor(records, revision.content.subject, revision.content.context) !== undefined) corrupt("Multiple current Confidence Assessments exist for a subject and context.");
      records.set(event.confidenceAssessmentId, deepFreeze({ confidenceAssessmentId: event.confidenceAssessmentId, subject: revision.content.subject,
        context: revision.content.context, lifecycle: "CURRENT", currentRevision: revision, revisions: [revision], history: [event], withdrawal: null }));
    } else {
      const existing = records.get(event.confidenceAssessmentId); if (existing === undefined || existing.lifecycle !== "CURRENT") corrupt("Invalid Confidence lifecycle history.");
      if (event.type === "CONFIDENCE_REASSESSED") {
        const revision = normalizeStoredRevision(event.revision);
        if (event.at !== revision.provenance.recordedAt || event.actor !== revision.provenance.actor || event.reason !== revision.reason) corrupt("Confidence revision provenance is inconsistent.");
        if (revision.revision !== existing.currentRevision.revision + 1 || stable(revision.content.subject) !== stable(existing.subject) || stable(revision.content.context) !== stable(existing.context)) corrupt("Invalid Confidence revision history.");
        records.set(event.confidenceAssessmentId, deepFreeze({ ...existing, currentRevision: revision, revisions: [...existing.revisions, revision], history: [...existing.history, event] }));
      } else {
        validateText(event.reason, "withdrawal reason");
        records.set(event.confidenceAssessmentId, deepFreeze({ ...existing, lifecycle: "WITHDRAWN", history: [...existing.history, event], withdrawal: { reason: event.reason, actor: event.actor, at: event.at } }));
      }
    }
  }
  return records;
}

function normalizeProduced(value: ProducedConfidenceAssessment): ProducedConfidenceAssessment {
  assertExactKeys(value, ["subject", "context", "measure", "method", "supportingEvidence", "contradictingEvidence", "inconclusiveEvidence", "provenance", "observationDate", "limitations", "effect"], "produced assessment");
  assertExactKeys(value?.subject, ["kind", "reference", "statement"], "subject");
  if (!(value.subject.kind === "BUSINESS_PROPOSITION" || value.subject.kind === "WORK_RESULT" || value.subject.kind === "INTELLIGENCE_RESULT" || value.subject.kind === "SYNTHESIS_RESULT")) invalid("Subject kind is not admitted; general Person scores are forbidden.");
  validateIdentity(value.subject.reference, "subject reference"); validateText(value.subject.statement, "subject statement");
  assertExactKeys(value.context, ["scope", "applicability"], "context"); validateText(value.context.scope, "context scope"); validateText(value.context.applicability, "context applicability");
  assertExactKeys(value.method, ["methodId", "version", "derivationBasis", "declaration"], "method");
  if (stable(value.method) !== stable(CONFIDENCE_METHOD)) throw new ConfidenceDomainError("CONFIDENCE_METHOD_MISMATCH", "Confidence method must be the declared deterministic method.");
  const supporting = normalizeReferences(value.supportingEvidence, "SUPPORTING");
  const contradicting = normalizeReferences(value.contradictingEvidence, "CONTRADICTING");
  const inconclusive = normalizeReferences(value.inconclusiveEvidence, "INCONCLUSIVE");
  const references = [...supporting, ...contradicting, ...inconclusive];
  if (references.length === 0) throw new ConfidenceDomainError("CONFIDENCE_EVIDENCE_REQUIRED", "At least one authoritative Evidence reference is required.");
  if (new Set(references.map((item) => item.evidenceId)).size !== references.length) invalid("An Evidence reference cannot occupy multiple roles.");
  const expected = applyConfidenceMethod(references);
  assertExactKeys(value.measure, ["value", "unit", "lowerBound", "upperBound"], "measure");
  if (!Number.isFinite(value.measure.value) || value.measure.value < 0 || value.measure.value > 100) invalid("Confidence measure must be bounded from 0 through 100.");
  if (stable(value.measure) !== stable(expected)) throw new ConfidenceDomainError("CONFIDENCE_METHOD_MISMATCH", "Measure does not match deterministic method application.");
  assertExactKeys(value.provenance, ["producer", "intelligenceAssessmentId", "intelligenceRevision", "intelligenceObservedAt", "producedAt"], "producer provenance");
  if (value.provenance.producer !== "INTELLIGENCE_CONFIDENCE_PRODUCER") invalid("Confidence must be produced by the Intelligence adapter.");
  validateIdentity(value.provenance.intelligenceAssessmentId, "Intelligence assessment id");
  if (!Number.isSafeInteger(value.provenance.intelligenceRevision) || value.provenance.intelligenceRevision < 1) invalid("Intelligence revision must be positive.");
  validateIso(value.provenance.intelligenceObservedAt, "Intelligence observation date"); validateIso(value.provenance.producedAt, "producer date"); validateIso(value.observationDate, "observation date");
  if (value.observationDate !== value.provenance.intelligenceObservedAt) invalid("Observation date must retain Intelligence provenance.");
  if (Date.parse(value.provenance.producedAt) < Date.parse(value.observationDate)) invalid("Producer date cannot precede the observation date.");
  if (!Array.isArray(value.limitations) || value.limitations.length === 0) invalid("At least one limitation is required.");
  const limitations = value.limitations.map((item) => { validateText(item, "limitation"); return item; });
  if (new Set(limitations).size !== limitations.length) invalid("Limitations must be unique.");
  if (value.effect !== "NONE") invalid("Confidence has no operational effect.");
  return deepFreeze({ subject: { ...value.subject }, context: { ...value.context }, measure: expected, method: { ...CONFIDENCE_METHOD },
    supportingEvidence: supporting, contradictingEvidence: contradicting, inconclusiveEvidence: inconclusive,
    provenance: { ...value.provenance }, observationDate: value.observationDate, limitations: limitations as [string, ...string[]], effect: "NONE" });
}

function normalizeReferences(values: readonly WeightedEvidenceReference[], role: WeightedEvidenceReference["role"]): readonly WeightedEvidenceReference[] {
  if (!Array.isArray(values)) invalid(`${role} Evidence list is required.`);
  const result = values.map((item) => { assertExactKeys(item, ["evidenceId", "role", "weight"], `${role} Evidence`); validateIdentity(item.evidenceId, "evidenceId");
    if (item.role !== role) invalid(`Evidence role must be ${role}.`); if (!Number.isSafeInteger(item.weight) || item.weight <= 0) invalid("Evidence weight must be a positive safe integer."); return Object.freeze({ ...item }); });
  if (new Set(result.map((item) => item.evidenceId)).size !== result.length) invalid(`${role} Evidence references must be unique.`);
  return Object.freeze(result.sort((a, b) => compare(a.evidenceId, b.evidenceId)));
}
function normalizeStoredRevision(value: ConfidenceRevision | undefined): ConfidenceRevision {
  if (value === undefined) corrupt("Confidence revision is missing.");
  assertExactKeys(value, ["revision", "content", "provenance", "reason"], "stored revision");
  if (!Number.isSafeInteger(value.revision) || value.revision < 1) corrupt("Confidence revision number is invalid.");
  assertExactKeys(value.provenance, ["producer", "actor", "causationIdentity", "recordedAt"], "authority provenance");
  if (value.provenance.producer !== "CONFIDENCE_AUTHORITY") corrupt("Confidence revision producer is invalid.");
  validateText(value.provenance.actor, "revision actor"); validateIdentity(value.provenance.causationIdentity, "revision causation"); validateIso(value.provenance.recordedAt, "revision recordedAt");
  if (value.reason !== null) validateText(value.reason, "revision reason");
  const content = normalizeProduced(value.content);
  if (Date.parse(value.provenance.recordedAt) < Date.parse(content.provenance.producedAt)) corrupt("Confidence was recorded before it was produced.");
  return deepFreeze({ ...value, content });
}
function makeRevision(revision: number, content: ProducedConfidenceAssessment, command: CommandIdentity, reason: string | null): ConfidenceRevision {
  const recordedAt = iso(command.at, "at");
  if (Date.parse(recordedAt) < Date.parse(content.provenance.producedAt)) invalid("Confidence cannot be recorded before Intelligence produced it.");
  return deepFreeze({ revision, content, provenance: { producer: "CONFIDENCE_AUTHORITY", actor: command.actor, causationIdentity: command.causationIdentity, recordedAt }, reason });
}
function allEvidence(content: ProducedConfidenceAssessment): readonly WeightedEvidenceReference[] { return [...content.supportingEvidence, ...content.contradictingEvidence, ...content.inconclusiveEvidence]; }
function currentFor(records: ReadonlyMap<string, ConfidenceAssessment>, subject: ConfidenceSubject, context: ConfidenceContext): ConfidenceAssessment | undefined { return [...records.values()].find((item) => item.lifecycle === "CURRENT" && stable(item.subject) === stable(subject) && stable(item.context) === stable(context)); }
function required(records: ReadonlyMap<string, ConfidenceAssessment>, id: string): ConfidenceAssessment { const value = records.get(id); if (value === undefined) throw new ConfidenceDomainError("CONFIDENCE_NOT_FOUND", `Confidence Assessment ${id} does not exist.`); return value; }
function findEvent(records: ReadonlyMap<string, ConfidenceAssessment>, identity: string): ConfidenceLifecycleEvent | null { for (const record of records.values()) for (const event of record.history) if (event.idempotencyIdentity === identity) return event; return null; }
function validateCommand(command: CommandIdentity): void { validateText(command.actor, "actor"); validateIdentity(command.causationIdentity, "causationIdentity"); validateIdentity(command.idempotencyIdentity, "idempotencyIdentity"); iso(command.at, "at"); }
function assertExactKeys(value: unknown, keys: readonly string[], label: string): void { if (typeof value !== "object" || value === null || Array.isArray(value)) invalid(`${label} is required.`); const actual = Object.keys(value).sort(compare); const expected = [...keys].sort(compare); if (stable(actual) !== stable(expected)) invalid(`${label} contains missing or forbidden inputs.`); }
function validateIdentity(value: unknown, label: string): asserts value is string { validateText(value, label); if (/[/\\]/u.test(value)) invalid(`${label} must be opaque and not a path.`); }
function validateText(value: unknown, label: string): asserts value is string { if (typeof value !== "string" || value.length === 0 || value.trim() !== value) invalid(`${label} must be explicit and canonical.`); }
function validateIso(value: unknown, label: string): asserts value is string { if (typeof value !== "string") invalid(`${label} must be canonical ISO-8601.`); try { if (new Date(value).toISOString() !== value) invalid(`${label} must be canonical ISO-8601.`); } catch { invalid(`${label} must be canonical ISO-8601.`); } }
function iso(value: Date, label: string): string { if (!(value instanceof Date) || !Number.isFinite(value.getTime())) invalid(`${label} must be a valid Date.`); return value.toISOString(); }
function stable(value: unknown): string { return JSON.stringify(value); }
function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function deepFreeze<T>(value: T): T { if (value !== null && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); for (const nested of Object.values(value)) deepFreeze(nested); } return value; }
function invalid(message: string): never { throw new ConfidenceDomainError("CONFIDENCE_INVALID_INPUT", message); }
function corrupt(message: string): never { throw new ConfidenceDomainError("CONFIDENCE_JOURNAL_CORRUPT", message); }
function idempotencyConflict(): never { throw new ConfidenceDomainError("CONFIDENCE_IDEMPOTENCY_CONFLICT", "Idempotency identity was reused divergently."); }

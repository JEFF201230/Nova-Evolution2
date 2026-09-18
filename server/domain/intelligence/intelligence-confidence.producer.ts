import { ConfidenceDomainError } from "../confidence/confidence.errors.js";
import { applyConfidenceMethod, CONFIDENCE_METHOD, type ConfidenceContext, type ConfidenceSubject, type ProducedConfidenceAssessment, type WeightedEvidenceReference } from "../confidence/confidence.types.js";
import type { IntelligenceAssessment } from "./intelligence.types.js";

export type IntelligenceAssessmentReadResult = Readonly<{ state: "FOUND"; assessment: IntelligenceAssessment }> | Readonly<{ state: "ABSENT" }> | Readonly<{ state: "AUTHORITY_UNAVAILABLE"; cause: unknown }>;
export interface IntelligenceAssessmentReadPort { byAssessmentId(id: string): IntelligenceAssessmentReadResult; }
export type EvidenceWeight = Readonly<{ evidenceId: string; weight: number }>;
export type ProduceConfidence = Readonly<{
  intelligenceAssessmentId: string;
  subject: ConfidenceSubject;
  context: ConfidenceContext;
  supportingEvidence: readonly EvidenceWeight[];
  contradictingEvidence: readonly EvidenceWeight[];
  inconclusiveEvidence: readonly EvidenceWeight[];
  limitations: readonly [string, ...string[]];
  producedAt: Date;
}>;

/** Read-only adapter: Intelligence produces a result; it never records Confidence or mutates a source domain. */
export class IntelligenceConfidenceProducer {
  constructor(private readonly intelligence: IntelligenceAssessmentReadPort) {}
  produce(command: ProduceConfidence): ProducedConfidenceAssessment {
    assertKeys(command, ["intelligenceAssessmentId", "subject", "context", "supportingEvidence", "contradictingEvidence", "inconclusiveEvidence", "limitations", "producedAt"]);
    assertKeys(command.subject, ["kind", "reference", "statement"]); assertKeys(command.context, ["scope", "applicability"]);
    if (!(command.subject.kind === "BUSINESS_PROPOSITION" || command.subject.kind === "WORK_RESULT" || command.subject.kind === "INTELLIGENCE_RESULT" || command.subject.kind === "SYNTHESIS_RESULT")) invalid("Subject kind is not admitted; general Person scores are forbidden.");
    text(command.subject.reference, "subject reference"); text(command.subject.statement, "subject statement"); text(command.context.scope, "context scope"); text(command.context.applicability, "context applicability");
    let result: IntelligenceAssessmentReadResult;
    try { result = this.intelligence.byAssessmentId(command.intelligenceAssessmentId); }
    catch (cause) { throw new ConfidenceDomainError("CONFIDENCE_INTELLIGENCE_UNAVAILABLE", "Intelligence authority is unavailable.", { cause }); }
    if (result.state === "ABSENT") throw new ConfidenceDomainError("CONFIDENCE_INTELLIGENCE_NOT_FOUND", `Intelligence Assessment ${command.intelligenceAssessmentId} is absent.`);
    if (result.state === "AUTHORITY_UNAVAILABLE") throw new ConfidenceDomainError("CONFIDENCE_INTELLIGENCE_UNAVAILABLE", "Intelligence authority is unavailable.", { cause: result.cause });
    const assessment = result.assessment;
    if (assessment.assessmentId !== command.intelligenceAssessmentId) invalid("Intelligence authority returned a different Assessment identity.");
    if (assessment.lifecycle !== "CURRENT") throw new ConfidenceDomainError("CONFIDENCE_INTELLIGENCE_NOT_FOUND", "Withdrawn Intelligence cannot produce current Confidence.");
    const content = assessment.currentRevision.content;
    const contradictions = new Set(content.contradictions.flatMap((item) => item.evidenceIds));
    const hypotheses = new Set(content.hypotheses.flatMap((item) => item.supportingEvidenceIds).filter((id) => !contradictions.has(id)));
    const facts = new Set(content.factualAssertions.flatMap((item) => item.evidenceIds).filter((id) => !contradictions.has(id) && !hypotheses.has(id)));
    const supporting = role(command.supportingEvidence, "SUPPORTING", facts);
    const contradicting = role(command.contradictingEvidence, "CONTRADICTING", contradictions);
    const inconclusive = role(command.inconclusiveEvidence, "INCONCLUSIVE", hypotheses);
    requireComplete(supporting, facts, "SUPPORTING"); requireComplete(contradicting, contradictions, "CONTRADICTING"); requireComplete(inconclusive, hypotheses, "INCONCLUSIVE");
    const references = [...supporting, ...contradicting, ...inconclusive];
    if (references.length === 0) throw new ConfidenceDomainError("CONFIDENCE_EVIDENCE_REQUIRED", "Intelligence cannot produce Confidence without classified Evidence.");
    if (new Set(references.map((item) => item.evidenceId)).size !== references.length) invalid("Evidence cannot occupy multiple Confidence roles.");
    if (!Array.isArray(command.limitations) || command.limitations.length === 0) invalid("Limitations are required.");
    command.limitations.forEach((item) => text(item, "limitation"));
    const producedAt = iso(command.producedAt);
    return freeze({ subject: { ...command.subject }, context: { ...command.context }, measure: applyConfidenceMethod(references), method: { ...CONFIDENCE_METHOD },
      supportingEvidence: supporting, contradictingEvidence: contradicting, inconclusiveEvidence: inconclusive,
      provenance: { producer: "INTELLIGENCE_CONFIDENCE_PRODUCER", intelligenceAssessmentId: assessment.assessmentId,
        intelligenceRevision: assessment.currentRevision.revision, intelligenceObservedAt: content.observedAt, producedAt },
      observationDate: content.observedAt, limitations: [...command.limitations] as [string, ...string[]], effect: "NONE" });
  }
}

function role(values: readonly EvidenceWeight[], evidenceRole: WeightedEvidenceReference["role"], admitted: ReadonlySet<string>): readonly WeightedEvidenceReference[] {
  if (!Array.isArray(values)) invalid(`${evidenceRole} Evidence list is required.`);
  return Object.freeze(values.map((item) => { assertKeys(item, ["evidenceId", "weight"]); if (!admitted.has(item.evidenceId)) invalid(`${item.evidenceId} is not an Intelligence ${evidenceRole} source.`); if (!Number.isSafeInteger(item.weight) || item.weight <= 0) invalid("Evidence weight must be a positive safe integer."); return Object.freeze({ evidenceId: item.evidenceId, weight: item.weight, role: evidenceRole }); }).sort((a, b) => a.evidenceId < b.evidenceId ? -1 : a.evidenceId > b.evidenceId ? 1 : 0));
}
function requireComplete(values: readonly WeightedEvidenceReference[], required: ReadonlySet<string>, roleName: WeightedEvidenceReference["role"]): void {
  const actual = new Set(values.map((item) => item.evidenceId));
  if (actual.size !== required.size || [...required].some((id) => !actual.has(id))) invalid(`All Intelligence ${roleName} Evidence must remain explicit.`);
}
function assertKeys(value: unknown, allowed: readonly string[]): void { if (typeof value !== "object" || value === null || Array.isArray(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...allowed].sort())) invalid("Missing or forbidden producer input."); }
function text(value: unknown, label: string): asserts value is string { if (typeof value !== "string" || value.length === 0 || value.trim() !== value) invalid(`${label} must be explicit and canonical.`); }
function iso(value: Date): string { if (!(value instanceof Date) || !Number.isFinite(value.getTime())) invalid("producedAt must be valid."); return value.toISOString(); }
function freeze<T>(value: T): T { if (value !== null && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); for (const nested of Object.values(value)) freeze(nested); } return value; }
function invalid(message: string): never { throw new ConfidenceDomainError("CONFIDENCE_INVALID_INPUT", message); }

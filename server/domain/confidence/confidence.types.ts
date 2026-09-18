export type ConfidenceLifecycle = "CURRENT" | "WITHDRAWN";
export type EvidenceRole = "SUPPORTING" | "CONTRADICTING" | "INCONCLUSIVE";

export type ConfidenceSubject = Readonly<{
  kind: "BUSINESS_PROPOSITION" | "WORK_RESULT" | "INTELLIGENCE_RESULT" | "SYNTHESIS_RESULT";
  reference: string;
  statement: string;
}>;

export type ConfidenceContext = Readonly<{ scope: string; applicability: string }>;

export type WeightedEvidenceReference = Readonly<{
  evidenceId: string;
  role: EvidenceRole;
  weight: number;
}>;

export type ConfidenceMeasure = Readonly<{
  value: number;
  unit: "PERCENT";
  lowerBound: 0;
  upperBound: 100;
}>;

export type ConfidenceMethod = Readonly<{
  methodId: "WEIGHTED_EVIDENCE_RATIO_V1";
  version: 1;
  derivationBasis: "AUTHORITATIVE_EVIDENCE";
  declaration: "supporting weight / total classified Evidence weight; rounded to two decimals";
}>;

export type IntelligenceConfidenceProvenance = Readonly<{
  producer: "INTELLIGENCE_CONFIDENCE_PRODUCER";
  intelligenceAssessmentId: string;
  intelligenceRevision: number;
  intelligenceObservedAt: string;
  producedAt: string;
}>;

export type ProducedConfidenceAssessment = Readonly<{
  subject: ConfidenceSubject;
  context: ConfidenceContext;
  measure: ConfidenceMeasure;
  method: ConfidenceMethod;
  supportingEvidence: readonly WeightedEvidenceReference[];
  contradictingEvidence: readonly WeightedEvidenceReference[];
  inconclusiveEvidence: readonly WeightedEvidenceReference[];
  provenance: IntelligenceConfidenceProvenance;
  observationDate: string;
  limitations: readonly [string, ...string[]];
  effect: "NONE";
}>;

export type ConfidenceAuthorityProvenance = Readonly<{
  producer: "CONFIDENCE_AUTHORITY";
  actor: string;
  causationIdentity: string;
  recordedAt: string;
}>;

export type ConfidenceRevision = Readonly<{
  revision: number;
  content: ProducedConfidenceAssessment;
  provenance: ConfidenceAuthorityProvenance;
  reason: string | null;
}>;

export type ConfidenceLifecycleEvent = Readonly<{
  type: "CONFIDENCE_ASSESSED" | "CONFIDENCE_REASSESSED" | "CONFIDENCE_WITHDRAWN";
  confidenceAssessmentId: string;
  idempotencyIdentity: string;
  at: string;
  actor: string;
  revision?: ConfidenceRevision;
  reason?: string;
}>;

export type ConfidenceAssessment = Readonly<{
  confidenceAssessmentId: string;
  subject: ConfidenceSubject;
  context: ConfidenceContext;
  lifecycle: ConfidenceLifecycle;
  currentRevision: ConfidenceRevision;
  revisions: readonly ConfidenceRevision[];
  history: readonly ConfidenceLifecycleEvent[];
  withdrawal: Readonly<{ reason: string; actor: string; at: string }> | null;
}>;

export const CONFIDENCE_METHOD: ConfidenceMethod = Object.freeze({
  methodId: "WEIGHTED_EVIDENCE_RATIO_V1",
  version: 1,
  derivationBasis: "AUTHORITATIVE_EVIDENCE",
  declaration: "supporting weight / total classified Evidence weight; rounded to two decimals",
});

export function applyConfidenceMethod(references: readonly WeightedEvidenceReference[]): ConfidenceMeasure {
  if (references.length === 0) throw new Error("Evidence is required.");
  const total = references.reduce((sum, item) => sum + item.weight, 0);
  const supporting = references.filter((item) => item.role === "SUPPORTING").reduce((sum, item) => sum + item.weight, 0);
  if (!Number.isSafeInteger(total) || total <= 0) throw new Error("Evidence weights must have a positive safe-integer total.");
  const value = Math.round((supporting / total) * 10_000) / 100;
  return Object.freeze({ value, unit: "PERCENT", lowerBound: 0, upperBound: 100 });
}

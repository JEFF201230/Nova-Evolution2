export type IntelligenceWorkReference = Readonly<{ projectId: string; workId: string }>;
export type IntelligenceLifecycle = "CURRENT" | "WITHDRAWN";

export type FactualAssertion = Readonly<{
  assertionId: string;
  statement: string;
  evidenceIds: readonly [string, ...string[]];
}>;

export type Hypothesis = Readonly<{
  hypothesisId: string;
  statement: string;
  supportingEvidenceIds: readonly string[];
}>;

export type Interpretation = Readonly<{
  interpretationId: string;
  statement: string;
  factualAssertionIds: readonly string[];
}>;

export type IntelligenceContradiction = Readonly<{
  contradictionId: string;
  statement: string;
  evidenceIds: readonly [string, string, ...string[]];
}>;

export type IntelligenceLimit = Readonly<{ limitId: string; statement: string }>;

export type Analysis = Readonly<{
  analysisId: string;
  statement: string;
  factualAssertionIds: readonly string[];
  hypothesisIds: readonly string[];
  interpretationIds: readonly string[];
  contradictionIds: readonly string[];
  limitIds: readonly string[];
}>;

export type Insight = Readonly<{
  insightId: string;
  statement: string;
  analysisId: string;
  factualAssertionIds: readonly string[];
}>;

export type Recommendation = Readonly<{
  recommendationId: string;
  statement: string;
  rationale: string;
  analysisId: string;
  factualAssertionIds: readonly string[];
  actionId?: string;
  rank: number;
  rankingMethod: string;
  effect: "NONE";
}>;

export type EvaluationCriterion = Readonly<{
  criterionId: string;
  statement: string;
  outcome: string;
  factualAssertionIds: readonly string[];
}>;

export type Evaluation = Readonly<{
  evaluationId: string;
  subjectReference: string;
  analysisId: string;
  criteria: readonly [EvaluationCriterion, ...EvaluationCriterion[]];
}>;

export type Diagnostic = Readonly<{
  diagnosticId: string;
  statement: string;
  analysisId: string;
  establishedFactIds: readonly string[];
  possibleCauseHypothesisIds: readonly string[];
}>;

export type IntelligenceAssessmentContent = Readonly<{
  question: string;
  scope: string;
  method: string;
  observedAt: string;
  factualAssertions: readonly FactualAssertion[];
  hypotheses: readonly Hypothesis[];
  interpretations: readonly Interpretation[];
  contradictions: readonly IntelligenceContradiction[];
  limits: readonly IntelligenceLimit[];
  analyses: readonly Analysis[];
  insights: readonly Insight[];
  recommendations: readonly Recommendation[];
  evaluations: readonly Evaluation[];
  diagnostics: readonly Diagnostic[];
}>;

export type IntelligenceProvenance = Readonly<{
  producer: "INTELLIGENCE_AUTHORITY";
  actor: string;
  causationIdentity: string;
  producedAt: string;
}>;

export type IntelligenceRevision = Readonly<{
  revision: number;
  content: IntelligenceAssessmentContent;
  provenance: IntelligenceProvenance;
  reason: string | null;
}>;

export type IntelligenceLifecycleEvent = Readonly<{
  type: "ASSESSMENT_CREATED" | "ASSESSMENT_REVISED" | "ASSESSMENT_WITHDRAWN";
  assessmentId: string;
  idempotencyIdentity: string;
  at: string;
  actor: string;
  workReference?: IntelligenceWorkReference;
  revision?: IntelligenceRevision;
  reason?: string;
}>;

export type IntelligenceAssessment = Readonly<{
  assessmentId: string;
  workReference: IntelligenceWorkReference;
  lifecycle: IntelligenceLifecycle;
  currentRevision: IntelligenceRevision;
  revisions: readonly IntelligenceRevision[];
  history: readonly IntelligenceLifecycleEvent[];
  withdrawal: Readonly<{ reason: string; actor: string; at: string }> | null;
}>;

export type NextBestAction = Readonly<{
  assessmentId: string;
  assessmentRevision: number;
  recommendation: Recommendation;
  actionId: string;
  rankingMethod: string;
  candidateRecommendationIds: readonly string[];
  tiedRecommendationIds: readonly string[];
  supportingEvidenceIds: readonly string[];
  observedAt: string;
}>;

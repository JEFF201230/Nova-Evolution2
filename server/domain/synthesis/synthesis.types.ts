export type SynthesisWorkReference = Readonly<{ projectId: string; workId: string }>;
export type SynthesisLifecycle = "CURRENT" | "WITHDRAWN";
export type SynthesisForm = "SUMMARY" | "EXECUTIVE_SUMMARY" | "CONCLUSION" | "NARRATIVE" | "DIGEST" | "RECAP";

export type WorkStateSourceReference = Readonly<{
  sourceReferenceId: "WORK_AUTHORIZED_STATE";
  owner: "WORK";
  kind: "AUTHORIZED_WORK_STATE";
  observedAt: string;
}>;

export type IntelligenceSourceReference = Readonly<{
  sourceReferenceId: string;
  owner: "INTELLIGENCE";
  kind: "ASSESSMENT" | "FACTUAL_ASSERTION" | "HYPOTHESIS" | "INTERPRETATION" | "ANALYSIS" | "INSIGHT" | "RECOMMENDATION" | "EVALUATION" | "DIAGNOSTIC" | "CONTRADICTION" | "LIMIT";
  assessmentId: string;
  assessmentRevision: number;
  elementId?: string;
  observedAt: string;
  evidenceIds: readonly string[];
}>;

export type SynthesisSourceReference = WorkStateSourceReference | IntelligenceSourceReference;

export type SynthesisElement = Readonly<{
  elementId: string;
  form: SynthesisForm;
  text: string;
  sourceReferenceIds: readonly [string, ...string[]];
}>;

export type SynthesisConflict = Readonly<{
  conflictId: string;
  statement: string;
  sourceReferenceId: string;
  evidenceIds: readonly [string, string, ...string[]];
}>;

export type SynthesisLimit = Readonly<{
  limitId: string;
  statement: string;
  sourceReferenceId: string;
}>;

export type SynthesisContent = Readonly<{
  scope: string;
  audience: string;
  observationDate: string;
  elements: readonly SynthesisElement[];
  sources: readonly SynthesisSourceReference[];
  conflicts: readonly SynthesisConflict[];
  limits: readonly SynthesisLimit[];
}>;

export type SynthesisProvenance = Readonly<{
  producer: "SYNTHESIS_AUTHORITY";
  actor: string;
  causationIdentity: string;
  producedAt: string;
}>;

export type SynthesisRevision = Readonly<{
  revision: number;
  content: SynthesisContent;
  provenance: SynthesisProvenance;
  reason: string | null;
}>;

export type SynthesisLifecycleEvent = Readonly<{
  type: "SYNTHESIS_ESTABLISHED" | "SYNTHESIS_REVISED" | "SYNTHESIS_WITHDRAWN";
  synthesisId: string;
  idempotencyIdentity: string;
  at: string;
  actor: string;
  workReference?: SynthesisWorkReference;
  revision?: SynthesisRevision;
  reason?: string;
}>;

export type WorkSynthesis = Readonly<{
  synthesisId: string;
  workReference: SynthesisWorkReference;
  lifecycle: SynthesisLifecycle;
  currentRevision: SynthesisRevision;
  revisions: readonly SynthesisRevision[];
  history: readonly SynthesisLifecycleEvent[];
  withdrawal: Readonly<{ reason: string; actor: string; at: string }> | null;
}>;

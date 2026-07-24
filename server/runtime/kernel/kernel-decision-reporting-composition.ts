type KernelDecisionReportingCompositionStepId =
  | "DECISION_FLOW"
  | "REPORTING_FLOW"
  | "DECISION_REPORTING_INTEGRATION";

type KernelDecisionReportingCompositionValidationErrorCode =
  | "KDRC-001"
  | "KDRC-002"
  | "KDRC-003"
  | "KDRC-004";

interface KernelDecisionReportingCompositionEvidence {
  readonly expectedStepIds: readonly KernelDecisionReportingCompositionStepId[];
  readonly receivedStepIds: readonly string[];
  readonly missingStepIds: readonly KernelDecisionReportingCompositionStepId[];
  readonly duplicateStepIds: readonly string[];
  readonly decisionReady: boolean;
  readonly reportReady: boolean;
  readonly integrationReady: boolean;
  readonly decisionReportLinked: boolean;
  readonly valid: boolean;
}

interface KernelDecisionReportingComposition {
  readonly compositionId: "KERNEL_DECISION_REPORTING_COMPOSITION";
  readonly stepIds: readonly KernelDecisionReportingCompositionStepId[];
  readonly decisionFlow: unknown;
  readonly reportingFlow: unknown;
  readonly decisionReportingIntegration: unknown;
  readonly evidence: KernelDecisionReportingCompositionEvidence;
  readonly readyForKernelComposition: boolean;
}

class KernelDecisionReportingCompositionValidationError extends Error {
  readonly code: KernelDecisionReportingCompositionValidationErrorCode;
  readonly evidence: KernelDecisionReportingCompositionEvidence;

  constructor(
    code: KernelDecisionReportingCompositionValidationErrorCode,
    message: string,
    evidence: KernelDecisionReportingCompositionEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelDecisionReportingCompositionValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelDecisionReportingCompositionValidationError.prototype);
  }
}

const KERNEL_DECISION_REPORTING_COMPOSITION_STEP_IDS: readonly KernelDecisionReportingCompositionStepId[] =
  Object.freeze([
    "DECISION_FLOW",
    "REPORTING_FLOW",
    "DECISION_REPORTING_INTEGRATION",
  ]);

function createKernelDecisionReportingComposition(
  decisionFlow: unknown,
  reportingFlow: unknown,
  decisionReportingIntegration: unknown,
): KernelDecisionReportingComposition {
  const steps = Object.freeze([decisionFlow, reportingFlow, decisionReportingIntegration]);
  const evidence = createKernelDecisionReportingCompositionEvidence(steps);

  assertKernelDecisionReportingCompositionEvidenceValid(evidence);

  return Object.freeze({
    compositionId: "KERNEL_DECISION_REPORTING_COMPOSITION" as const,
    stepIds: KERNEL_DECISION_REPORTING_COMPOSITION_STEP_IDS,
    decisionFlow,
    reportingFlow,
    decisionReportingIntegration,
    evidence,
    readyForKernelComposition: true as const,
  });
}

function createKernelDecisionReportingCompositionEvidence(
  steps: readonly unknown[],
): KernelDecisionReportingCompositionEvidence {
  const receivedStepIds = Object.freeze(
    steps
      .filter(isKernelDecisionReportingCompositionRecord)
      .map(kernelDecisionReportingCompositionStepId)
      .filter((stepId): stepId is string => stepId !== null)
      .sort(),
  );
  const missingStepIds = Object.freeze(
    KERNEL_DECISION_REPORTING_COMPOSITION_STEP_IDS.filter(
      (stepId) => !receivedStepIds.includes(stepId),
    ),
  );
  const duplicateStepIds = Object.freeze(
    receivedStepIds.filter(
      (stepId, index) => receivedStepIds.indexOf(stepId) !== index,
    ),
  );
  const decisionReady =
    isKernelDecisionReportingCompositionRecord(steps[0]) &&
    steps[0].decision === "DECISION_FLOW_ACCEPTED" &&
    steps[0].readyForReportingFlow === true;
  const reportReady =
    isKernelDecisionReportingCompositionRecord(steps[1]) &&
    steps[1].decision === "REPORTING_FLOW_READY" &&
    steps[1].readyForTraceability === true;
  const integrationReady =
    isKernelDecisionReportingCompositionRecord(steps[2]) &&
    steps[2].integrationId === "KERNEL_DECISION_REPORTING_INTEGRATION" &&
    steps[2].readyForTraceabilityIntegration === true;
  const decisionReportLinked =
    isKernelDecisionReportingCompositionRecord(steps[1]) &&
    steps[1].sourceDecision === "DECISION_FLOW_ACCEPTED" &&
    isKernelDecisionReportingCompositionRecord(steps[2]) &&
    steps[2].decision === "DECISION_FLOW_ACCEPTED" &&
    steps[2].reportDecision === "REPORTING_FLOW_READY";

  return Object.freeze({
    expectedStepIds: KERNEL_DECISION_REPORTING_COMPOSITION_STEP_IDS,
    receivedStepIds,
    missingStepIds,
    duplicateStepIds,
    decisionReady,
    reportReady,
    integrationReady,
    decisionReportLinked,
    valid:
      missingStepIds.length === 0 &&
      duplicateStepIds.length === 0 &&
      decisionReady &&
      reportReady &&
      integrationReady &&
      decisionReportLinked,
  });
}

function assertKernelDecisionReportingCompositionEvidenceValid(
  evidence: KernelDecisionReportingCompositionEvidence,
): void {
  if (evidence.missingStepIds.length > 0) {
    throw new KernelDecisionReportingCompositionValidationError(
      "KDRC-001",
      "Kernel Decision Reporting Composition rejects incomplete steps.",
      evidence,
    );
  }

  if (evidence.duplicateStepIds.length > 0) {
    throw new KernelDecisionReportingCompositionValidationError(
      "KDRC-002",
      "Kernel Decision Reporting Composition rejects duplicate steps.",
      evidence,
    );
  }

  if (!evidence.decisionReady || !evidence.reportReady || !evidence.integrationReady) {
    throw new KernelDecisionReportingCompositionValidationError(
      "KDRC-003",
      "Kernel Decision Reporting Composition rejects unready steps.",
      evidence,
    );
  }

  if (!evidence.decisionReportLinked || !evidence.valid) {
    throw new KernelDecisionReportingCompositionValidationError(
      "KDRC-004",
      "Kernel Decision Reporting Composition rejects incoherent links.",
      evidence,
    );
  }
}

function kernelDecisionReportingCompositionStepId(
  component: Record<string, unknown>,
): string | null {
  if (component.decision === "DECISION_FLOW_ACCEPTED" && component.readyForReportingFlow === true) {
    return "DECISION_FLOW";
  }

  if (component.reportId === "KERNEL_REPORTING_FLOW_INTERNAL_REPORT") {
    return "REPORTING_FLOW";
  }

  if (component.integrationId === "KERNEL_DECISION_REPORTING_INTEGRATION") {
    return "DECISION_REPORTING_INTEGRATION";
  }

  return null;
}

function isKernelDecisionReportingCompositionRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelDecisionReportingComposition;

export {};

type KernelDecisionReportingIntegrationId = "KERNEL_DECISION_REPORTING_INTEGRATION";

type KernelDecisionReportingIntegrationValidationErrorCode =
  | "KDRI-001"
  | "KDRI-002"
  | "KDRI-003"
  | "KDRI-004";

interface KernelDecisionReportingIntegrationDecisionInput {
  readonly decision: "DECISION_FLOW_ACCEPTED";
  readonly aggregation: unknown;
  readonly evidence: unknown;
  readonly readyForReportingFlow: true;
}

interface KernelDecisionReportingIntegrationReportInput {
  readonly reportId: "KERNEL_REPORTING_FLOW_INTERNAL_REPORT";
  readonly decision: "REPORTING_FLOW_READY";
  readonly sourceDecision: "DECISION_FLOW_ACCEPTED";
  readonly aggregation: unknown;
  readonly evidence: unknown;
  readonly readyForTraceability: true;
}

interface KernelDecisionReportingIntegrationEvidence {
  readonly decisionFlowReceived: boolean;
  readonly reportingFlowReceived: boolean;
  readonly decisionFlowAccepted: boolean;
  readonly reportingFlowReady: boolean;
  readonly sourceDecisionLinked: boolean;
  readonly aggregationLinked: boolean;
  readonly valid: boolean;
}

interface KernelDecisionReportingIntegration {
  readonly integrationId: KernelDecisionReportingIntegrationId;
  readonly decision: "DECISION_FLOW_ACCEPTED";
  readonly reportDecision: "REPORTING_FLOW_READY";
  readonly aggregation: unknown;
  readonly decisionEvidence: unknown;
  readonly reportEvidence: unknown;
  readonly evidence: KernelDecisionReportingIntegrationEvidence;
  readonly readyForTraceabilityIntegration: boolean;
}

class KernelDecisionReportingIntegrationValidationError extends Error {
  readonly code: KernelDecisionReportingIntegrationValidationErrorCode;
  readonly evidence: KernelDecisionReportingIntegrationEvidence;

  constructor(
    code: KernelDecisionReportingIntegrationValidationErrorCode,
    message: string,
    evidence: KernelDecisionReportingIntegrationEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelDecisionReportingIntegrationValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelDecisionReportingIntegrationValidationError.prototype);
  }
}

function createKernelDecisionReportingIntegration(
  decisionFlowResult: unknown,
  reportingFlowReport: unknown,
): KernelDecisionReportingIntegration {
  const evidence = createKernelDecisionReportingIntegrationEvidence(
    decisionFlowResult,
    reportingFlowReport,
  );

  assertKernelDecisionReportingIntegrationEvidenceValid(evidence);

  const decisionInput =
    decisionFlowResult as KernelDecisionReportingIntegrationDecisionInput;
  const reportInput =
    reportingFlowReport as KernelDecisionReportingIntegrationReportInput;

  return Object.freeze({
    integrationId: "KERNEL_DECISION_REPORTING_INTEGRATION" as const,
    decision: decisionInput.decision,
    reportDecision: reportInput.decision,
    aggregation: decisionInput.aggregation,
    decisionEvidence: decisionInput.evidence,
    reportEvidence: reportInput.evidence,
    evidence,
    readyForTraceabilityIntegration: true as const,
  });
}

function createKernelDecisionReportingIntegrationEvidence(
  decisionFlowResult: unknown,
  reportingFlowReport: unknown,
): KernelDecisionReportingIntegrationEvidence {
  const decisionFlowReceived = isKernelDecisionReportingIntegrationRecord(
    decisionFlowResult,
  );
  const reportingFlowReceived = isKernelDecisionReportingIntegrationRecord(
    reportingFlowReport,
  );
  const decisionFlowAccepted =
    decisionFlowReceived &&
    decisionFlowResult.decision === "DECISION_FLOW_ACCEPTED" &&
    decisionFlowResult.readyForReportingFlow === true;
  const reportingFlowReady =
    reportingFlowReceived &&
    reportingFlowReport.reportId === "KERNEL_REPORTING_FLOW_INTERNAL_REPORT" &&
    reportingFlowReport.decision === "REPORTING_FLOW_READY" &&
    reportingFlowReport.readyForTraceability === true;
  const sourceDecisionLinked =
    decisionFlowAccepted &&
    reportingFlowReady &&
    reportingFlowReport.sourceDecision === decisionFlowResult.decision;
  const aggregationLinked =
    decisionFlowAccepted &&
    reportingFlowReady &&
    decisionFlowResult.aggregation === reportingFlowReport.aggregation;

  return Object.freeze({
    decisionFlowReceived,
    reportingFlowReceived,
    decisionFlowAccepted,
    reportingFlowReady,
    sourceDecisionLinked,
    aggregationLinked,
    valid:
      decisionFlowReceived &&
      reportingFlowReceived &&
      decisionFlowAccepted &&
      reportingFlowReady &&
      sourceDecisionLinked &&
      aggregationLinked,
  });
}

function assertKernelDecisionReportingIntegrationEvidenceValid(
  evidence: KernelDecisionReportingIntegrationEvidence,
): void {
  if (!evidence.decisionFlowReceived || !evidence.reportingFlowReceived) {
    throw new KernelDecisionReportingIntegrationValidationError(
      "KDRI-001",
      "Kernel Decision Reporting Integration requires Decision Flow and Reporting Flow inputs.",
      evidence,
    );
  }

  if (!evidence.decisionFlowAccepted) {
    throw new KernelDecisionReportingIntegrationValidationError(
      "KDRI-002",
      "Kernel Decision Reporting Integration rejects unknown Decision Flow decisions.",
      evidence,
    );
  }

  if (!evidence.reportingFlowReady) {
    throw new KernelDecisionReportingIntegrationValidationError(
      "KDRI-003",
      "Kernel Decision Reporting Integration rejects unknown Reporting Flow reports.",
      evidence,
    );
  }

  if (!evidence.sourceDecisionLinked || !evidence.aggregationLinked || !evidence.valid) {
    throw new KernelDecisionReportingIntegrationValidationError(
      "KDRI-004",
      "Kernel Decision Reporting Integration rejects incoherent Decision/Reporting links.",
      evidence,
    );
  }
}

function isKernelDecisionReportingIntegrationRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelDecisionReportingIntegration;

export {};

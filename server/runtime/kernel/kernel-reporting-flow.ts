type KernelReportingFlowDecision = "REPORTING_FLOW_READY";

type KernelReportingFlowValidationErrorCode =
  | "KRF-001"
  | "KRF-002"
  | "KRF-003"
  | "KRF-004";

interface KernelReportingFlowDecisionInput {
  readonly decision: "DECISION_FLOW_ACCEPTED";
  readonly aggregation: unknown;
  readonly evidence: unknown;
  readonly readyForReportingFlow: true;
}

interface KernelReportingFlowEvidence {
  readonly decisionFlowReceived: boolean;
  readonly decisionFlowAccepted: boolean;
  readonly aggregationPresent: boolean;
  readonly decisionEvidencePresent: boolean;
  readonly coherenceVerified: boolean;
  readonly valid: boolean;
}

interface KernelReportingFlowReport {
  readonly reportId: "KERNEL_REPORTING_FLOW_INTERNAL_REPORT";
  readonly decision: KernelReportingFlowDecision;
  readonly sourceDecision: "DECISION_FLOW_ACCEPTED";
  readonly aggregation: unknown;
  readonly evidence: KernelReportingFlowEvidence;
  readonly readyForTraceability: boolean;
}

class KernelReportingFlowValidationError extends Error {
  readonly code: KernelReportingFlowValidationErrorCode;
  readonly evidence: KernelReportingFlowEvidence;

  constructor(
    code: KernelReportingFlowValidationErrorCode,
    message: string,
    evidence: KernelReportingFlowEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelReportingFlowValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelReportingFlowValidationError.prototype);
  }
}

function createKernelReportingFlowReport(
  decisionFlowResult: unknown,
): KernelReportingFlowReport {
  const evidence = createKernelReportingFlowEvidence(decisionFlowResult);

  assertKernelReportingFlowEvidenceValid(evidence);

  const acceptedDecisionFlow = decisionFlowResult as KernelReportingFlowDecisionInput;
  const report = Object.freeze({
    reportId: "KERNEL_REPORTING_FLOW_INTERNAL_REPORT" as const,
    decision: "REPORTING_FLOW_READY" as const,
    sourceDecision: acceptedDecisionFlow.decision,
    aggregation: acceptedDecisionFlow.aggregation,
    evidence,
    readyForTraceability: true as const,
  });

  assertKernelReportingFlowReportCoherent(report);

  return report;
}

function createKernelReportingFlowEvidence(
  decisionFlowResult: unknown,
): KernelReportingFlowEvidence {
  if (!isKernelReportingFlowRecord(decisionFlowResult)) {
    return createKernelReportingFlowEvidenceRecord({
      decisionFlowReceived: false,
      decisionFlowAccepted: false,
      aggregationPresent: false,
      decisionEvidencePresent: false,
      coherenceVerified: false,
    });
  }

  const decisionFlowAccepted =
    decisionFlowResult.decision === "DECISION_FLOW_ACCEPTED" &&
    decisionFlowResult.readyForReportingFlow === true;
  const aggregationPresent =
    "aggregation" in decisionFlowResult &&
    decisionFlowResult.aggregation !== null &&
    decisionFlowResult.aggregation !== undefined;
  const decisionEvidencePresent =
    "evidence" in decisionFlowResult &&
    decisionFlowResult.evidence !== null &&
    decisionFlowResult.evidence !== undefined;

  return createKernelReportingFlowEvidenceRecord({
    decisionFlowReceived: true,
    decisionFlowAccepted,
    aggregationPresent,
    decisionEvidencePresent,
    coherenceVerified:
      decisionFlowAccepted &&
      aggregationPresent &&
      decisionEvidencePresent,
  });
}

function createKernelReportingFlowEvidenceRecord(fields: {
  readonly decisionFlowReceived: boolean;
  readonly decisionFlowAccepted: boolean;
  readonly aggregationPresent: boolean;
  readonly decisionEvidencePresent: boolean;
  readonly coherenceVerified: boolean;
}): KernelReportingFlowEvidence {
  return Object.freeze({
    decisionFlowReceived: fields.decisionFlowReceived,
    decisionFlowAccepted: fields.decisionFlowAccepted,
    aggregationPresent: fields.aggregationPresent,
    decisionEvidencePresent: fields.decisionEvidencePresent,
    coherenceVerified: fields.coherenceVerified,
    valid:
      fields.decisionFlowReceived &&
      fields.decisionFlowAccepted &&
      fields.aggregationPresent &&
      fields.decisionEvidencePresent &&
      fields.coherenceVerified,
  });
}

function assertKernelReportingFlowEvidenceValid(
  evidence: KernelReportingFlowEvidence,
): void {
  if (!evidence.decisionFlowReceived) {
    throw new KernelReportingFlowValidationError(
      "KRF-001",
      "Kernel Reporting Flow requires a Decision Flow result.",
      evidence,
    );
  }

  if (!evidence.decisionFlowAccepted) {
    throw new KernelReportingFlowValidationError(
      "KRF-002",
      "Kernel Reporting Flow rejects unknown Decision Flow decisions.",
      evidence,
    );
  }

  if (!evidence.aggregationPresent || !evidence.decisionEvidencePresent) {
    throw new KernelReportingFlowValidationError(
      "KRF-003",
      "Kernel Reporting Flow rejects incomplete Decision Flow evidence.",
      evidence,
    );
  }

  if (!evidence.valid) {
    throw new KernelReportingFlowValidationError(
      "KRF-004",
      "Kernel Reporting Flow rejects incoherent report evidence.",
      evidence,
    );
  }
}

function assertKernelReportingFlowReportCoherent(
  report: KernelReportingFlowReport,
): void {
  if (
    report.reportId !== "KERNEL_REPORTING_FLOW_INTERNAL_REPORT" ||
    report.decision !== "REPORTING_FLOW_READY" ||
    report.sourceDecision !== "DECISION_FLOW_ACCEPTED" ||
    !report.evidence.valid ||
    !report.readyForTraceability
  ) {
    throw new KernelReportingFlowValidationError(
      "KRF-004",
      "Kernel Reporting Flow rejects contradictory report output.",
      report.evidence,
    );
  }
}

function isKernelReportingFlowRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelReportingFlowReport;

export {};

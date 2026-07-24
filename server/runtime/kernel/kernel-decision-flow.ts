type KernelDecisionFlowWorkflowStateId = "MISSION_ORDER_INTAKE_ACCEPTED";

type KernelDecisionFlowDecision = "DECISION_FLOW_ACCEPTED";

type KernelDecisionFlowValidationErrorCode =
  | "KDF-001"
  | "KDF-002"
  | "KDF-003"
  | "KDF-004";

interface KernelDecisionFlowWorkflowStateInput {
  readonly stateId: KernelDecisionFlowWorkflowStateId;
  readonly previousStateId: "WORKFLOW_STATE_CREATED";
  readonly sourceDecision: "ACCEPTED";
  readonly intakeEvidence: unknown;
  readonly acceptedIntake: unknown;
  readonly evidence: unknown;
}

interface KernelDecisionFlowEvidence {
  readonly workflowStateReceived: boolean;
  readonly workflowStateAuthorized: boolean;
  readonly sourceDecisionAccepted: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly aggregationDeterministic: boolean;
  readonly valid: boolean;
}

interface KernelDecisionFlowAggregation {
  readonly stateId: KernelDecisionFlowWorkflowStateId;
  readonly sourceDecision: "ACCEPTED";
  readonly acceptedIntake: unknown;
  readonly workflowEvidence: unknown;
}

interface KernelDecisionFlowResult {
  readonly decision: KernelDecisionFlowDecision;
  readonly aggregation: KernelDecisionFlowAggregation;
  readonly evidence: KernelDecisionFlowEvidence;
  readonly readyForReportingFlow: boolean;
}

class KernelDecisionFlowValidationError extends Error {
  readonly code: KernelDecisionFlowValidationErrorCode;
  readonly evidence: KernelDecisionFlowEvidence;

  constructor(
    code: KernelDecisionFlowValidationErrorCode,
    message: string,
    evidence: KernelDecisionFlowEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelDecisionFlowValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelDecisionFlowValidationError.prototype);
  }
}

const KERNEL_DECISION_FLOW_AUTHORIZED_WORKFLOW_STATES: readonly KernelDecisionFlowWorkflowStateId[] =
  Object.freeze([
    "MISSION_ORDER_INTAKE_ACCEPTED",
  ]);

function createKernelDecisionFlow(
  workflowState: unknown,
): KernelDecisionFlowResult {
  const evidence = createKernelDecisionFlowEvidence(workflowState);

  assertKernelDecisionFlowEvidenceValid(evidence);

  const acceptedWorkflowState = workflowState as KernelDecisionFlowWorkflowStateInput;
  const aggregation = createKernelDecisionFlowAggregation(acceptedWorkflowState);

  return Object.freeze({
    decision: "DECISION_FLOW_ACCEPTED" as const,
    aggregation,
    evidence,
    readyForReportingFlow: true as const,
  });
}

function createKernelDecisionFlowEvidence(
  workflowState: unknown,
): KernelDecisionFlowEvidence {
  if (!isKernelDecisionFlowRecord(workflowState)) {
    return createKernelDecisionFlowEvidenceRecord({
      workflowStateReceived: false,
      workflowStateAuthorized: false,
      sourceDecisionAccepted: false,
      acceptedIntakePresent: false,
      aggregationDeterministic: false,
    });
  }

  const workflowStateAuthorized =
    isKernelDecisionFlowWorkflowStateId(workflowState.stateId);
  const sourceDecisionAccepted = workflowState.sourceDecision === "ACCEPTED";
  const acceptedIntakePresent =
    "acceptedIntake" in workflowState &&
    workflowState.acceptedIntake !== null &&
    workflowState.acceptedIntake !== undefined;

  return createKernelDecisionFlowEvidenceRecord({
    workflowStateReceived: true,
    workflowStateAuthorized,
    sourceDecisionAccepted,
    acceptedIntakePresent,
    aggregationDeterministic:
      workflowStateAuthorized &&
      sourceDecisionAccepted &&
      acceptedIntakePresent,
  });
}

function createKernelDecisionFlowEvidenceRecord(fields: {
  readonly workflowStateReceived: boolean;
  readonly workflowStateAuthorized: boolean;
  readonly sourceDecisionAccepted: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly aggregationDeterministic: boolean;
}): KernelDecisionFlowEvidence {
  return Object.freeze({
    workflowStateReceived: fields.workflowStateReceived,
    workflowStateAuthorized: fields.workflowStateAuthorized,
    sourceDecisionAccepted: fields.sourceDecisionAccepted,
    acceptedIntakePresent: fields.acceptedIntakePresent,
    aggregationDeterministic: fields.aggregationDeterministic,
    valid:
      fields.workflowStateReceived &&
      fields.workflowStateAuthorized &&
      fields.sourceDecisionAccepted &&
      fields.acceptedIntakePresent &&
      fields.aggregationDeterministic,
  });
}

function assertKernelDecisionFlowEvidenceValid(
  evidence: KernelDecisionFlowEvidence,
): void {
  if (!evidence.workflowStateReceived) {
    throw new KernelDecisionFlowValidationError(
      "KDF-001",
      "Kernel Decision Flow requires a Workflow State Handling state.",
      evidence,
    );
  }

  if (!evidence.workflowStateAuthorized) {
    throw new KernelDecisionFlowValidationError(
      "KDF-002",
      "Kernel Decision Flow rejects unknown workflow states.",
      evidence,
    );
  }

  if (!evidence.sourceDecisionAccepted || !evidence.acceptedIntakePresent) {
    throw new KernelDecisionFlowValidationError(
      "KDF-003",
      "Kernel Decision Flow requires a Mission Order Intake ACCEPTED workflow state.",
      evidence,
    );
  }

  if (!evidence.valid) {
    throw new KernelDecisionFlowValidationError(
      "KDF-004",
      "Kernel Decision Flow rejects incomplete deterministic aggregation evidence.",
      evidence,
    );
  }
}

function createKernelDecisionFlowAggregation(
  workflowState: KernelDecisionFlowWorkflowStateInput,
): KernelDecisionFlowAggregation {
  return Object.freeze({
    stateId: workflowState.stateId,
    sourceDecision: workflowState.sourceDecision,
    acceptedIntake: workflowState.acceptedIntake,
    workflowEvidence: workflowState.evidence,
  });
}

function isKernelDecisionFlowRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isKernelDecisionFlowWorkflowStateId(
  stateId: unknown,
): stateId is KernelDecisionFlowWorkflowStateId {
  return KERNEL_DECISION_FLOW_AUTHORIZED_WORKFLOW_STATES.some(
    (authorizedStateId) => authorizedStateId === stateId,
  );
}

void createKernelDecisionFlow;

export {};

type KernelRuntimeContextSourceStateId = "MISSION_ORDER_INTAKE_ACCEPTED";

type KernelRuntimeContextId = "KERNEL_RUNTIME_CONTEXT";

type KernelRuntimeContextValidationErrorCode =
  | "KRC-001"
  | "KRC-002"
  | "KRC-003"
  | "KRC-004";

interface KernelRuntimeContextWorkflowStateInput {
  readonly stateId: KernelRuntimeContextSourceStateId;
  readonly previousStateId: "WORKFLOW_STATE_CREATED";
  readonly sourceDecision: "ACCEPTED";
  readonly intakeEvidence: unknown;
  readonly acceptedIntake: unknown;
  readonly evidence: unknown;
}

interface KernelRuntimeContextEvidence {
  readonly workflowStateReceived: boolean;
  readonly workflowStateAuthorized: boolean;
  readonly sourceDecisionAccepted: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly contextDeterministic: boolean;
  readonly valid: boolean;
}

interface KernelRuntimeContext {
  readonly contextId: KernelRuntimeContextId;
  readonly sourceStateId: KernelRuntimeContextSourceStateId;
  readonly sourceDecision: "ACCEPTED";
  readonly acceptedIntake: unknown;
  readonly workflowEvidence: unknown;
  readonly evidence: KernelRuntimeContextEvidence;
  readonly readyForRuntimeExecution: boolean;
}

class KernelRuntimeContextValidationError extends Error {
  readonly code: KernelRuntimeContextValidationErrorCode;
  readonly evidence: KernelRuntimeContextEvidence;

  constructor(
    code: KernelRuntimeContextValidationErrorCode,
    message: string,
    evidence: KernelRuntimeContextEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelRuntimeContextValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelRuntimeContextValidationError.prototype);
  }
}

const KERNEL_RUNTIME_CONTEXT_AUTHORIZED_SOURCE_STATES: readonly KernelRuntimeContextSourceStateId[] =
  Object.freeze([
    "MISSION_ORDER_INTAKE_ACCEPTED",
  ]);

function createKernelRuntimeContext(
  workflowState: unknown,
): KernelRuntimeContext {
  const evidence = createKernelRuntimeContextEvidence(workflowState);

  assertKernelRuntimeContextEvidenceValid(evidence);

  const acceptedWorkflowState = workflowState as KernelRuntimeContextWorkflowStateInput;

  return Object.freeze({
    contextId: "KERNEL_RUNTIME_CONTEXT" as const,
    sourceStateId: acceptedWorkflowState.stateId,
    sourceDecision: acceptedWorkflowState.sourceDecision,
    acceptedIntake: acceptedWorkflowState.acceptedIntake,
    workflowEvidence: acceptedWorkflowState.evidence,
    evidence,
    readyForRuntimeExecution: true as const,
  });
}

function createKernelRuntimeContextEvidence(
  workflowState: unknown,
): KernelRuntimeContextEvidence {
  if (!isKernelRuntimeContextRecord(workflowState)) {
    return createKernelRuntimeContextEvidenceRecord({
      workflowStateReceived: false,
      workflowStateAuthorized: false,
      sourceDecisionAccepted: false,
      acceptedIntakePresent: false,
      contextDeterministic: false,
    });
  }

  const workflowStateAuthorized =
    isKernelRuntimeContextSourceStateId(workflowState.stateId);
  const sourceDecisionAccepted = workflowState.sourceDecision === "ACCEPTED";
  const acceptedIntakePresent =
    "acceptedIntake" in workflowState &&
    workflowState.acceptedIntake !== null &&
    workflowState.acceptedIntake !== undefined;

  return createKernelRuntimeContextEvidenceRecord({
    workflowStateReceived: true,
    workflowStateAuthorized,
    sourceDecisionAccepted,
    acceptedIntakePresent,
    contextDeterministic:
      workflowStateAuthorized &&
      sourceDecisionAccepted &&
      acceptedIntakePresent,
  });
}

function createKernelRuntimeContextEvidenceRecord(fields: {
  readonly workflowStateReceived: boolean;
  readonly workflowStateAuthorized: boolean;
  readonly sourceDecisionAccepted: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly contextDeterministic: boolean;
}): KernelRuntimeContextEvidence {
  return Object.freeze({
    workflowStateReceived: fields.workflowStateReceived,
    workflowStateAuthorized: fields.workflowStateAuthorized,
    sourceDecisionAccepted: fields.sourceDecisionAccepted,
    acceptedIntakePresent: fields.acceptedIntakePresent,
    contextDeterministic: fields.contextDeterministic,
    valid:
      fields.workflowStateReceived &&
      fields.workflowStateAuthorized &&
      fields.sourceDecisionAccepted &&
      fields.acceptedIntakePresent &&
      fields.contextDeterministic,
  });
}

function assertKernelRuntimeContextEvidenceValid(
  evidence: KernelRuntimeContextEvidence,
): void {
  if (!evidence.workflowStateReceived) {
    throw new KernelRuntimeContextValidationError(
      "KRC-001",
      "Kernel Runtime Context requires a Workflow State Handling state.",
      evidence,
    );
  }

  if (!evidence.workflowStateAuthorized) {
    throw new KernelRuntimeContextValidationError(
      "KRC-002",
      "Kernel Runtime Context rejects unknown workflow states.",
      evidence,
    );
  }

  if (!evidence.sourceDecisionAccepted || !evidence.acceptedIntakePresent) {
    throw new KernelRuntimeContextValidationError(
      "KRC-003",
      "Kernel Runtime Context requires Mission Order Intake ACCEPTED evidence.",
      evidence,
    );
  }

  if (!evidence.valid) {
    throw new KernelRuntimeContextValidationError(
      "KRC-004",
      "Kernel Runtime Context rejects incomplete context evidence.",
      evidence,
    );
  }
}

function isKernelRuntimeContextRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isKernelRuntimeContextSourceStateId(
  stateId: unknown,
): stateId is KernelRuntimeContextSourceStateId {
  return KERNEL_RUNTIME_CONTEXT_AUTHORIZED_SOURCE_STATES.some(
    (authorizedStateId) => authorizedStateId === stateId,
  );
}

void createKernelRuntimeContext;

export {};

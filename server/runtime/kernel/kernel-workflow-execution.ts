type KernelWorkflowExecutionRuntimeExecutionId = "KERNEL_RUNTIME_EXECUTION";

type KernelWorkflowExecutionStateId = "WORKFLOW_EXECUTION_PREPARED";

type KernelWorkflowExecutionValidationErrorCode =
  | "KWE-001"
  | "KWE-002"
  | "KWE-003"
  | "KWE-004";

interface KernelWorkflowExecutionRuntimeInput {
  readonly executionId: KernelWorkflowExecutionRuntimeExecutionId;
  readonly contextId: "KERNEL_RUNTIME_CONTEXT";
  readonly executionState: "READY_TO_EXECUTE";
  readonly acceptedIntake: unknown;
  readonly contextEvidence: unknown;
  readonly evidence: unknown;
  readonly readyForWorkflowExecution: true;
}

interface KernelWorkflowExecutionEvidence {
  readonly runtimeExecutionReceived: boolean;
  readonly runtimeExecutionAuthorized: boolean;
  readonly runtimeExecutionReady: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly workflowExecutionPrepared: boolean;
  readonly valid: boolean;
}

interface KernelWorkflowExecution {
  readonly workflowExecutionStateId: KernelWorkflowExecutionStateId;
  readonly sourceRuntimeExecutionId: KernelWorkflowExecutionRuntimeExecutionId;
  readonly acceptedIntake: unknown;
  readonly runtimeExecutionEvidence: unknown;
  readonly evidence: KernelWorkflowExecutionEvidence;
  readonly readyForDecisionReportingIntegration: boolean;
}

class KernelWorkflowExecutionValidationError extends Error {
  readonly code: KernelWorkflowExecutionValidationErrorCode;
  readonly evidence: KernelWorkflowExecutionEvidence;

  constructor(
    code: KernelWorkflowExecutionValidationErrorCode,
    message: string,
    evidence: KernelWorkflowExecutionEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelWorkflowExecutionValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelWorkflowExecutionValidationError.prototype);
  }
}

const KERNEL_WORKFLOW_EXECUTION_AUTHORIZED_RUNTIME_EXECUTIONS: readonly KernelWorkflowExecutionRuntimeExecutionId[] =
  Object.freeze([
    "KERNEL_RUNTIME_EXECUTION",
  ]);

function createKernelWorkflowExecution(
  runtimeExecution: unknown,
): KernelWorkflowExecution {
  const evidence = createKernelWorkflowExecutionEvidence(runtimeExecution);

  assertKernelWorkflowExecutionEvidenceValid(evidence);

  const acceptedRuntimeExecution = runtimeExecution as KernelWorkflowExecutionRuntimeInput;

  return Object.freeze({
    workflowExecutionStateId: "WORKFLOW_EXECUTION_PREPARED" as const,
    sourceRuntimeExecutionId: acceptedRuntimeExecution.executionId,
    acceptedIntake: acceptedRuntimeExecution.acceptedIntake,
    runtimeExecutionEvidence: acceptedRuntimeExecution.evidence,
    evidence,
    readyForDecisionReportingIntegration: true as const,
  });
}

function createKernelWorkflowExecutionEvidence(
  runtimeExecution: unknown,
): KernelWorkflowExecutionEvidence {
  if (!isKernelWorkflowExecutionRecord(runtimeExecution)) {
    return createKernelWorkflowExecutionEvidenceRecord({
      runtimeExecutionReceived: false,
      runtimeExecutionAuthorized: false,
      runtimeExecutionReady: false,
      acceptedIntakePresent: false,
      workflowExecutionPrepared: false,
    });
  }

  const runtimeExecutionAuthorized =
    isKernelWorkflowExecutionRuntimeExecutionId(runtimeExecution.executionId);
  const runtimeExecutionReady = runtimeExecution.readyForWorkflowExecution === true;
  const acceptedIntakePresent =
    "acceptedIntake" in runtimeExecution &&
    runtimeExecution.acceptedIntake !== null &&
    runtimeExecution.acceptedIntake !== undefined;

  return createKernelWorkflowExecutionEvidenceRecord({
    runtimeExecutionReceived: true,
    runtimeExecutionAuthorized,
    runtimeExecutionReady,
    acceptedIntakePresent,
    workflowExecutionPrepared:
      runtimeExecutionAuthorized &&
      runtimeExecutionReady &&
      acceptedIntakePresent,
  });
}

function createKernelWorkflowExecutionEvidenceRecord(fields: {
  readonly runtimeExecutionReceived: boolean;
  readonly runtimeExecutionAuthorized: boolean;
  readonly runtimeExecutionReady: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly workflowExecutionPrepared: boolean;
}): KernelWorkflowExecutionEvidence {
  return Object.freeze({
    runtimeExecutionReceived: fields.runtimeExecutionReceived,
    runtimeExecutionAuthorized: fields.runtimeExecutionAuthorized,
    runtimeExecutionReady: fields.runtimeExecutionReady,
    acceptedIntakePresent: fields.acceptedIntakePresent,
    workflowExecutionPrepared: fields.workflowExecutionPrepared,
    valid:
      fields.runtimeExecutionReceived &&
      fields.runtimeExecutionAuthorized &&
      fields.runtimeExecutionReady &&
      fields.acceptedIntakePresent &&
      fields.workflowExecutionPrepared,
  });
}

function assertKernelWorkflowExecutionEvidenceValid(
  evidence: KernelWorkflowExecutionEvidence,
): void {
  if (!evidence.runtimeExecutionReceived) {
    throw new KernelWorkflowExecutionValidationError(
      "KWE-001",
      "Kernel Workflow Execution requires a Runtime Execution.",
      evidence,
    );
  }

  if (!evidence.runtimeExecutionAuthorized) {
    throw new KernelWorkflowExecutionValidationError(
      "KWE-002",
      "Kernel Workflow Execution rejects unknown Runtime Execution identifiers.",
      evidence,
    );
  }

  if (!evidence.runtimeExecutionReady || !evidence.acceptedIntakePresent) {
    throw new KernelWorkflowExecutionValidationError(
      "KWE-003",
      "Kernel Workflow Execution requires a ready Runtime Execution.",
      evidence,
    );
  }

  if (!evidence.valid) {
    throw new KernelWorkflowExecutionValidationError(
      "KWE-004",
      "Kernel Workflow Execution rejects incomplete workflow execution evidence.",
      evidence,
    );
  }
}

function isKernelWorkflowExecutionRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isKernelWorkflowExecutionRuntimeExecutionId(
  executionId: unknown,
): executionId is KernelWorkflowExecutionRuntimeExecutionId {
  return KERNEL_WORKFLOW_EXECUTION_AUTHORIZED_RUNTIME_EXECUTIONS.some(
    (authorizedExecutionId) => authorizedExecutionId === executionId,
  );
}

void createKernelWorkflowExecution;

export {};

type KernelRuntimeExecutionContextId = "KERNEL_RUNTIME_CONTEXT";

type KernelRuntimeExecutionId = "KERNEL_RUNTIME_EXECUTION";

type KernelRuntimeExecutionValidationErrorCode =
  | "KRE-001"
  | "KRE-002"
  | "KRE-003"
  | "KRE-004";

interface KernelRuntimeExecutionContextInput {
  readonly contextId: KernelRuntimeExecutionContextId;
  readonly sourceStateId: "MISSION_ORDER_INTAKE_ACCEPTED";
  readonly sourceDecision: "ACCEPTED";
  readonly acceptedIntake: unknown;
  readonly workflowEvidence: unknown;
  readonly evidence: unknown;
  readonly readyForRuntimeExecution: true;
}

interface KernelRuntimeExecutionEvidence {
  readonly runtimeContextReceived: boolean;
  readonly runtimeContextAuthorized: boolean;
  readonly runtimeContextReady: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly executionPrepared: boolean;
  readonly valid: boolean;
}

interface KernelRuntimeExecution {
  readonly executionId: KernelRuntimeExecutionId;
  readonly contextId: KernelRuntimeExecutionContextId;
  readonly executionState: "READY_TO_EXECUTE";
  readonly acceptedIntake: unknown;
  readonly contextEvidence: unknown;
  readonly evidence: KernelRuntimeExecutionEvidence;
  readonly readyForWorkflowExecution: boolean;
}

class KernelRuntimeExecutionValidationError extends Error {
  readonly code: KernelRuntimeExecutionValidationErrorCode;
  readonly evidence: KernelRuntimeExecutionEvidence;

  constructor(
    code: KernelRuntimeExecutionValidationErrorCode,
    message: string,
    evidence: KernelRuntimeExecutionEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelRuntimeExecutionValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelRuntimeExecutionValidationError.prototype);
  }
}

const KERNEL_RUNTIME_EXECUTION_AUTHORIZED_CONTEXT_IDS: readonly KernelRuntimeExecutionContextId[] =
  Object.freeze([
    "KERNEL_RUNTIME_CONTEXT",
  ]);

function createKernelRuntimeExecution(
  runtimeContext: unknown,
): KernelRuntimeExecution {
  const evidence = createKernelRuntimeExecutionEvidence(runtimeContext);

  assertKernelRuntimeExecutionEvidenceValid(evidence);

  const acceptedRuntimeContext = runtimeContext as KernelRuntimeExecutionContextInput;

  return Object.freeze({
    executionId: "KERNEL_RUNTIME_EXECUTION" as const,
    contextId: acceptedRuntimeContext.contextId,
    executionState: "READY_TO_EXECUTE" as const,
    acceptedIntake: acceptedRuntimeContext.acceptedIntake,
    contextEvidence: acceptedRuntimeContext.evidence,
    evidence,
    readyForWorkflowExecution: true as const,
  });
}

function createKernelRuntimeExecutionEvidence(
  runtimeContext: unknown,
): KernelRuntimeExecutionEvidence {
  if (!isKernelRuntimeExecutionRecord(runtimeContext)) {
    return createKernelRuntimeExecutionEvidenceRecord({
      runtimeContextReceived: false,
      runtimeContextAuthorized: false,
      runtimeContextReady: false,
      acceptedIntakePresent: false,
      executionPrepared: false,
    });
  }

  const runtimeContextAuthorized =
    isKernelRuntimeExecutionContextId(runtimeContext.contextId);
  const runtimeContextReady = runtimeContext.readyForRuntimeExecution === true;
  const acceptedIntakePresent =
    "acceptedIntake" in runtimeContext &&
    runtimeContext.acceptedIntake !== null &&
    runtimeContext.acceptedIntake !== undefined;

  return createKernelRuntimeExecutionEvidenceRecord({
    runtimeContextReceived: true,
    runtimeContextAuthorized,
    runtimeContextReady,
    acceptedIntakePresent,
    executionPrepared:
      runtimeContextAuthorized &&
      runtimeContextReady &&
      acceptedIntakePresent,
  });
}

function createKernelRuntimeExecutionEvidenceRecord(fields: {
  readonly runtimeContextReceived: boolean;
  readonly runtimeContextAuthorized: boolean;
  readonly runtimeContextReady: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly executionPrepared: boolean;
}): KernelRuntimeExecutionEvidence {
  return Object.freeze({
    runtimeContextReceived: fields.runtimeContextReceived,
    runtimeContextAuthorized: fields.runtimeContextAuthorized,
    runtimeContextReady: fields.runtimeContextReady,
    acceptedIntakePresent: fields.acceptedIntakePresent,
    executionPrepared: fields.executionPrepared,
    valid:
      fields.runtimeContextReceived &&
      fields.runtimeContextAuthorized &&
      fields.runtimeContextReady &&
      fields.acceptedIntakePresent &&
      fields.executionPrepared,
  });
}

function assertKernelRuntimeExecutionEvidenceValid(
  evidence: KernelRuntimeExecutionEvidence,
): void {
  if (!evidence.runtimeContextReceived) {
    throw new KernelRuntimeExecutionValidationError(
      "KRE-001",
      "Kernel Runtime Execution requires a Runtime Context.",
      evidence,
    );
  }

  if (!evidence.runtimeContextAuthorized) {
    throw new KernelRuntimeExecutionValidationError(
      "KRE-002",
      "Kernel Runtime Execution rejects unknown Runtime Context identifiers.",
      evidence,
    );
  }

  if (!evidence.runtimeContextReady || !evidence.acceptedIntakePresent) {
    throw new KernelRuntimeExecutionValidationError(
      "KRE-003",
      "Kernel Runtime Execution requires a ready Runtime Context.",
      evidence,
    );
  }

  if (!evidence.valid) {
    throw new KernelRuntimeExecutionValidationError(
      "KRE-004",
      "Kernel Runtime Execution rejects incomplete execution evidence.",
      evidence,
    );
  }
}

function isKernelRuntimeExecutionRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isKernelRuntimeExecutionContextId(
  contextId: unknown,
): contextId is KernelRuntimeExecutionContextId {
  return KERNEL_RUNTIME_EXECUTION_AUTHORIZED_CONTEXT_IDS.some(
    (authorizedContextId) => authorizedContextId === contextId,
  );
}

void createKernelRuntimeExecution;

export {};

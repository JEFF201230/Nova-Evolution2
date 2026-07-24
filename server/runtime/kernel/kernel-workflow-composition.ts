type KernelWorkflowCompositionStepId =
  | "WORKFLOW_STATE"
  | "WORKFLOW_EXECUTION";

type KernelWorkflowCompositionValidationErrorCode =
  | "KWC-001"
  | "KWC-002"
  | "KWC-003"
  | "KWC-004";

interface KernelWorkflowCompositionEvidence {
  readonly expectedStepIds: readonly KernelWorkflowCompositionStepId[];
  readonly receivedStepIds: readonly string[];
  readonly missingStepIds: readonly KernelWorkflowCompositionStepId[];
  readonly duplicateStepIds: readonly string[];
  readonly workflowStateAccepted: boolean;
  readonly workflowExecutionPrepared: boolean;
  readonly ordered: boolean;
  readonly valid: boolean;
}

interface KernelWorkflowComposition {
  readonly compositionId: "KERNEL_WORKFLOW_COMPOSITION";
  readonly stepIds: readonly KernelWorkflowCompositionStepId[];
  readonly workflowState: unknown;
  readonly workflowExecution: unknown;
  readonly evidence: KernelWorkflowCompositionEvidence;
  readonly readyForKernelComposition: boolean;
}

class KernelWorkflowCompositionValidationError extends Error {
  readonly code: KernelWorkflowCompositionValidationErrorCode;
  readonly evidence: KernelWorkflowCompositionEvidence;

  constructor(
    code: KernelWorkflowCompositionValidationErrorCode,
    message: string,
    evidence: KernelWorkflowCompositionEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelWorkflowCompositionValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelWorkflowCompositionValidationError.prototype);
  }
}

const KERNEL_WORKFLOW_COMPOSITION_STEP_IDS: readonly KernelWorkflowCompositionStepId[] =
  Object.freeze([
    "WORKFLOW_STATE",
    "WORKFLOW_EXECUTION",
  ]);

function createKernelWorkflowComposition(
  workflowState: unknown,
  workflowExecution: unknown,
): KernelWorkflowComposition {
  const steps = Object.freeze([workflowState, workflowExecution]);
  const evidence = createKernelWorkflowCompositionEvidence(steps);

  assertKernelWorkflowCompositionEvidenceValid(evidence);

  return Object.freeze({
    compositionId: "KERNEL_WORKFLOW_COMPOSITION" as const,
    stepIds: KERNEL_WORKFLOW_COMPOSITION_STEP_IDS,
    workflowState,
    workflowExecution,
    evidence,
    readyForKernelComposition: true as const,
  });
}

function createKernelWorkflowCompositionEvidence(
  steps: readonly unknown[],
): KernelWorkflowCompositionEvidence {
  const receivedStepIds = Object.freeze(
    steps
      .filter(isKernelWorkflowCompositionRecord)
      .map(kernelWorkflowCompositionStepId)
      .filter((stepId): stepId is string => stepId !== null)
      .sort(),
  );
  const missingStepIds = Object.freeze(
    KERNEL_WORKFLOW_COMPOSITION_STEP_IDS.filter(
      (stepId) => !receivedStepIds.includes(stepId),
    ),
  );
  const duplicateStepIds = Object.freeze(
    receivedStepIds.filter(
      (stepId, index) => receivedStepIds.indexOf(stepId) !== index,
    ),
  );
  const workflowStateAccepted =
    isKernelWorkflowCompositionRecord(steps[0]) &&
    steps[0].stateId === "MISSION_ORDER_INTAKE_ACCEPTED";
  const workflowExecutionPrepared =
    isKernelWorkflowCompositionRecord(steps[1]) &&
    steps[1].workflowExecutionStateId === "WORKFLOW_EXECUTION_PREPARED" &&
    steps[1].readyForDecisionReportingIntegration === true;
  const ordered = workflowStateAccepted && workflowExecutionPrepared;

  return Object.freeze({
    expectedStepIds: KERNEL_WORKFLOW_COMPOSITION_STEP_IDS,
    receivedStepIds,
    missingStepIds,
    duplicateStepIds,
    workflowStateAccepted,
    workflowExecutionPrepared,
    ordered,
    valid:
      missingStepIds.length === 0 &&
      duplicateStepIds.length === 0 &&
      workflowStateAccepted &&
      workflowExecutionPrepared &&
      ordered,
  });
}

function assertKernelWorkflowCompositionEvidenceValid(
  evidence: KernelWorkflowCompositionEvidence,
): void {
  if (evidence.missingStepIds.length > 0) {
    throw new KernelWorkflowCompositionValidationError(
      "KWC-001",
      "Kernel Workflow Composition rejects incomplete workflow steps.",
      evidence,
    );
  }

  if (evidence.duplicateStepIds.length > 0) {
    throw new KernelWorkflowCompositionValidationError(
      "KWC-002",
      "Kernel Workflow Composition rejects duplicate workflow steps.",
      evidence,
    );
  }

  if (!evidence.workflowStateAccepted || !evidence.workflowExecutionPrepared) {
    throw new KernelWorkflowCompositionValidationError(
      "KWC-003",
      "Kernel Workflow Composition rejects invalid workflow step states.",
      evidence,
    );
  }

  if (!evidence.ordered || !evidence.valid) {
    throw new KernelWorkflowCompositionValidationError(
      "KWC-004",
      "Kernel Workflow Composition rejects incoherent workflow ordering.",
      evidence,
    );
  }
}

function kernelWorkflowCompositionStepId(component: Record<string, unknown>): string | null {
  if (component.stateId === "MISSION_ORDER_INTAKE_ACCEPTED") {
    return "WORKFLOW_STATE";
  }

  if (component.workflowExecutionStateId === "WORKFLOW_EXECUTION_PREPARED") {
    return "WORKFLOW_EXECUTION";
  }

  return null;
}

function isKernelWorkflowCompositionRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelWorkflowComposition;

export {};

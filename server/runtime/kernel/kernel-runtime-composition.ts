type KernelRuntimeCompositionStepId =
  | "RUNTIME_CONTEXT"
  | "RUNTIME_EXECUTION";

type KernelRuntimeCompositionValidationErrorCode =
  | "KRCOMP-001"
  | "KRCOMP-002"
  | "KRCOMP-003"
  | "KRCOMP-004";

interface KernelRuntimeCompositionEvidence {
  readonly expectedStepIds: readonly KernelRuntimeCompositionStepId[];
  readonly receivedStepIds: readonly string[];
  readonly missingStepIds: readonly KernelRuntimeCompositionStepId[];
  readonly duplicateStepIds: readonly string[];
  readonly runtimeContextReady: boolean;
  readonly runtimeExecutionReady: boolean;
  readonly contextLinked: boolean;
  readonly valid: boolean;
}

interface KernelRuntimeComposition {
  readonly compositionId: "KERNEL_RUNTIME_COMPOSITION";
  readonly stepIds: readonly KernelRuntimeCompositionStepId[];
  readonly runtimeContext: unknown;
  readonly runtimeExecution: unknown;
  readonly evidence: KernelRuntimeCompositionEvidence;
  readonly readyForKernelComposition: boolean;
}

class KernelRuntimeCompositionValidationError extends Error {
  readonly code: KernelRuntimeCompositionValidationErrorCode;
  readonly evidence: KernelRuntimeCompositionEvidence;

  constructor(
    code: KernelRuntimeCompositionValidationErrorCode,
    message: string,
    evidence: KernelRuntimeCompositionEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelRuntimeCompositionValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelRuntimeCompositionValidationError.prototype);
  }
}

const KERNEL_RUNTIME_COMPOSITION_STEP_IDS: readonly KernelRuntimeCompositionStepId[] =
  Object.freeze([
    "RUNTIME_CONTEXT",
    "RUNTIME_EXECUTION",
  ]);

function createKernelRuntimeComposition(
  runtimeContext: unknown,
  runtimeExecution: unknown,
): KernelRuntimeComposition {
  const steps = Object.freeze([runtimeContext, runtimeExecution]);
  const evidence = createKernelRuntimeCompositionEvidence(steps);

  assertKernelRuntimeCompositionEvidenceValid(evidence);

  return Object.freeze({
    compositionId: "KERNEL_RUNTIME_COMPOSITION" as const,
    stepIds: KERNEL_RUNTIME_COMPOSITION_STEP_IDS,
    runtimeContext,
    runtimeExecution,
    evidence,
    readyForKernelComposition: true as const,
  });
}

function createKernelRuntimeCompositionEvidence(
  steps: readonly unknown[],
): KernelRuntimeCompositionEvidence {
  const receivedStepIds = Object.freeze(
    steps
      .filter(isKernelRuntimeCompositionRecord)
      .map(kernelRuntimeCompositionStepId)
      .filter((stepId): stepId is string => stepId !== null)
      .sort(),
  );
  const missingStepIds = Object.freeze(
    KERNEL_RUNTIME_COMPOSITION_STEP_IDS.filter(
      (stepId) => !receivedStepIds.includes(stepId),
    ),
  );
  const duplicateStepIds = Object.freeze(
    receivedStepIds.filter(
      (stepId, index) => receivedStepIds.indexOf(stepId) !== index,
    ),
  );
  const runtimeContextReady =
    isKernelRuntimeCompositionRecord(steps[0]) &&
    steps[0].contextId === "KERNEL_RUNTIME_CONTEXT" &&
    steps[0].readyForRuntimeExecution === true;
  const runtimeExecutionReady =
    isKernelRuntimeCompositionRecord(steps[1]) &&
    steps[1].executionId === "KERNEL_RUNTIME_EXECUTION" &&
    steps[1].readyForWorkflowExecution === true;
  const contextLinked =
    isKernelRuntimeCompositionRecord(steps[1]) &&
    steps[1].contextId === "KERNEL_RUNTIME_CONTEXT";

  return Object.freeze({
    expectedStepIds: KERNEL_RUNTIME_COMPOSITION_STEP_IDS,
    receivedStepIds,
    missingStepIds,
    duplicateStepIds,
    runtimeContextReady,
    runtimeExecutionReady,
    contextLinked,
    valid:
      missingStepIds.length === 0 &&
      duplicateStepIds.length === 0 &&
      runtimeContextReady &&
      runtimeExecutionReady &&
      contextLinked,
  });
}

function assertKernelRuntimeCompositionEvidenceValid(
  evidence: KernelRuntimeCompositionEvidence,
): void {
  if (evidence.missingStepIds.length > 0) {
    throw new KernelRuntimeCompositionValidationError(
      "KRCOMP-001",
      "Kernel Runtime Composition rejects incomplete runtime steps.",
      evidence,
    );
  }

  if (evidence.duplicateStepIds.length > 0) {
    throw new KernelRuntimeCompositionValidationError(
      "KRCOMP-002",
      "Kernel Runtime Composition rejects duplicate runtime steps.",
      evidence,
    );
  }

  if (!evidence.runtimeContextReady || !evidence.runtimeExecutionReady) {
    throw new KernelRuntimeCompositionValidationError(
      "KRCOMP-003",
      "Kernel Runtime Composition rejects unready runtime steps.",
      evidence,
    );
  }

  if (!evidence.contextLinked || !evidence.valid) {
    throw new KernelRuntimeCompositionValidationError(
      "KRCOMP-004",
      "Kernel Runtime Composition rejects incoherent runtime links.",
      evidence,
    );
  }
}

function kernelRuntimeCompositionStepId(component: Record<string, unknown>): string | null {
  if (component.executionId === "KERNEL_RUNTIME_EXECUTION") {
    return "RUNTIME_EXECUTION";
  }

  if (component.contextId === "KERNEL_RUNTIME_CONTEXT") {
    return "RUNTIME_CONTEXT";
  }

  return null;
}

function isKernelRuntimeCompositionRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelRuntimeComposition;

export {};

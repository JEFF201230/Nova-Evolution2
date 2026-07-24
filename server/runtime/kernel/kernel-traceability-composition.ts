type KernelTraceabilityCompositionStepId =
  | "TRACEABILITY"
  | "EXECUTION_TRACEABILITY"
  | "TRACEABILITY_INTEGRATION";

type KernelTraceabilityCompositionValidationErrorCode =
  | "KTC-001"
  | "KTC-002"
  | "KTC-003"
  | "KTC-004";

interface KernelTraceabilityCompositionEvidence {
  readonly expectedStepIds: readonly KernelTraceabilityCompositionStepId[];
  readonly receivedStepIds: readonly string[];
  readonly missingStepIds: readonly KernelTraceabilityCompositionStepId[];
  readonly duplicateStepIds: readonly string[];
  readonly traceabilityReady: boolean;
  readonly executionTraceabilityReady: boolean;
  readonly integrationReady: boolean;
  readonly ordered: boolean;
  readonly valid: boolean;
}

interface KernelTraceabilityComposition {
  readonly compositionId: "KERNEL_TRACEABILITY_COMPOSITION";
  readonly stepIds: readonly KernelTraceabilityCompositionStepId[];
  readonly traceability: unknown;
  readonly executionTraceability: unknown;
  readonly traceabilityIntegration: unknown;
  readonly evidence: KernelTraceabilityCompositionEvidence;
  readonly readyForKernelComposition: boolean;
}

class KernelTraceabilityCompositionValidationError extends Error {
  readonly code: KernelTraceabilityCompositionValidationErrorCode;
  readonly evidence: KernelTraceabilityCompositionEvidence;

  constructor(
    code: KernelTraceabilityCompositionValidationErrorCode,
    message: string,
    evidence: KernelTraceabilityCompositionEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelTraceabilityCompositionValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelTraceabilityCompositionValidationError.prototype);
  }
}

const KERNEL_TRACEABILITY_COMPOSITION_STEP_IDS: readonly KernelTraceabilityCompositionStepId[] =
  Object.freeze([
    "TRACEABILITY",
    "EXECUTION_TRACEABILITY",
    "TRACEABILITY_INTEGRATION",
  ]);

function createKernelTraceabilityComposition(
  traceability: unknown,
  executionTraceability: unknown,
  traceabilityIntegration: unknown,
): KernelTraceabilityComposition {
  const steps = Object.freeze([traceability, executionTraceability, traceabilityIntegration]);
  const evidence = createKernelTraceabilityCompositionEvidence(steps);

  assertKernelTraceabilityCompositionEvidenceValid(evidence);

  return Object.freeze({
    compositionId: "KERNEL_TRACEABILITY_COMPOSITION" as const,
    stepIds: KERNEL_TRACEABILITY_COMPOSITION_STEP_IDS,
    traceability,
    executionTraceability,
    traceabilityIntegration,
    evidence,
    readyForKernelComposition: true as const,
  });
}

function createKernelTraceabilityCompositionEvidence(
  steps: readonly unknown[],
): KernelTraceabilityCompositionEvidence {
  const receivedStepIds = Object.freeze(
    steps
      .filter(isKernelTraceabilityCompositionRecord)
      .map(kernelTraceabilityCompositionStepId)
      .filter((stepId): stepId is string => stepId !== null)
      .sort(),
  );
  const missingStepIds = Object.freeze(
    KERNEL_TRACEABILITY_COMPOSITION_STEP_IDS.filter(
      (stepId) => !receivedStepIds.includes(stepId),
    ),
  );
  const duplicateStepIds = Object.freeze(
    receivedStepIds.filter(
      (stepId, index) => receivedStepIds.indexOf(stepId) !== index,
    ),
  );
  const traceabilityReady =
    isKernelTraceabilityCompositionRecord(steps[0]) &&
    "nodes" in steps[0] &&
    "links" in steps[0] &&
    steps[0].evidence !== null &&
    steps[0].evidence !== undefined;
  const executionTraceabilityReady =
    isKernelTraceabilityCompositionRecord(steps[1]) &&
    steps[1].traceabilityId === "KERNEL_EXECUTION_TRACEABILITY" &&
    steps[1].readyForRuntimeEvidence === true;
  const integrationReady =
    isKernelTraceabilityCompositionRecord(steps[2]) &&
    steps[2].integrationId === "KERNEL_TRACEABILITY_INTEGRATION" &&
    steps[2].readyForRuntimeEvidence === true;
  const ordered = traceabilityReady && executionTraceabilityReady && integrationReady;

  return Object.freeze({
    expectedStepIds: KERNEL_TRACEABILITY_COMPOSITION_STEP_IDS,
    receivedStepIds,
    missingStepIds,
    duplicateStepIds,
    traceabilityReady,
    executionTraceabilityReady,
    integrationReady,
    ordered,
    valid:
      missingStepIds.length === 0 &&
      duplicateStepIds.length === 0 &&
      traceabilityReady &&
      executionTraceabilityReady &&
      integrationReady &&
      ordered,
  });
}

function assertKernelTraceabilityCompositionEvidenceValid(
  evidence: KernelTraceabilityCompositionEvidence,
): void {
  if (evidence.missingStepIds.length > 0) {
    throw new KernelTraceabilityCompositionValidationError(
      "KTC-001",
      "Kernel Traceability Composition rejects incomplete steps.",
      evidence,
    );
  }

  if (evidence.duplicateStepIds.length > 0) {
    throw new KernelTraceabilityCompositionValidationError(
      "KTC-002",
      "Kernel Traceability Composition rejects duplicate steps.",
      evidence,
    );
  }

  if (!evidence.traceabilityReady || !evidence.executionTraceabilityReady || !evidence.integrationReady) {
    throw new KernelTraceabilityCompositionValidationError(
      "KTC-003",
      "Kernel Traceability Composition rejects unready steps.",
      evidence,
    );
  }

  if (!evidence.ordered || !evidence.valid) {
    throw new KernelTraceabilityCompositionValidationError(
      "KTC-004",
      "Kernel Traceability Composition rejects incoherent traceability ordering.",
      evidence,
    );
  }
}

function kernelTraceabilityCompositionStepId(
  component: Record<string, unknown>,
): string | null {
  if ("nodes" in component && "links" in component && component.traceabilityId !== "KERNEL_EXECUTION_TRACEABILITY") {
    return "TRACEABILITY";
  }

  if (component.traceabilityId === "KERNEL_EXECUTION_TRACEABILITY") {
    return "EXECUTION_TRACEABILITY";
  }

  if (component.integrationId === "KERNEL_TRACEABILITY_INTEGRATION") {
    return "TRACEABILITY_INTEGRATION";
  }

  return null;
}

function isKernelTraceabilityCompositionRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelTraceabilityComposition;

export {};

type KernelMissionCompositionStepId =
  | "READINESS_GATE"
  | "MISSION_ORDER_INTAKE"
  | "MISSION_ORDER_CYCLE";

type KernelMissionCompositionValidationErrorCode =
  | "KMC-001"
  | "KMC-002"
  | "KMC-003"
  | "KMC-004";

interface KernelMissionCompositionEvidence {
  readonly expectedStepIds: readonly KernelMissionCompositionStepId[];
  readonly receivedStepIds: readonly string[];
  readonly missingStepIds: readonly KernelMissionCompositionStepId[];
  readonly unknownStepIds: readonly string[];
  readonly duplicateStepIds: readonly string[];
  readonly readinessReady: boolean;
  readonly intakeAccepted: boolean;
  readonly cycleReady: boolean;
  readonly ordered: boolean;
  readonly valid: boolean;
}

interface KernelMissionComposition {
  readonly compositionId: "KERNEL_MISSION_COMPOSITION";
  readonly stepIds: readonly KernelMissionCompositionStepId[];
  readonly readinessGate: unknown;
  readonly missionOrderIntake: unknown;
  readonly missionOrderCycle: unknown;
  readonly evidence: KernelMissionCompositionEvidence;
  readonly readyForKernelComposition: boolean;
}

class KernelMissionCompositionValidationError extends Error {
  readonly code: KernelMissionCompositionValidationErrorCode;
  readonly evidence: KernelMissionCompositionEvidence;

  constructor(
    code: KernelMissionCompositionValidationErrorCode,
    message: string,
    evidence: KernelMissionCompositionEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelMissionCompositionValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelMissionCompositionValidationError.prototype);
  }
}

const KERNEL_MISSION_COMPOSITION_STEP_IDS: readonly KernelMissionCompositionStepId[] =
  Object.freeze([
    "READINESS_GATE",
    "MISSION_ORDER_INTAKE",
    "MISSION_ORDER_CYCLE",
  ]);

function createKernelMissionComposition(
  readinessGate: unknown,
  missionOrderIntake: unknown,
  missionOrderCycle: unknown,
): KernelMissionComposition {
  const steps = Object.freeze([
    readinessGate,
    missionOrderIntake,
    missionOrderCycle,
  ]);
  const evidence = createKernelMissionCompositionEvidence(steps);

  assertKernelMissionCompositionEvidenceValid(evidence);

  return Object.freeze({
    compositionId: "KERNEL_MISSION_COMPOSITION" as const,
    stepIds: KERNEL_MISSION_COMPOSITION_STEP_IDS,
    readinessGate,
    missionOrderIntake,
    missionOrderCycle,
    evidence,
    readyForKernelComposition: true as const,
  });
}

function createKernelMissionCompositionEvidence(
  steps: readonly unknown[],
): KernelMissionCompositionEvidence {
  const receivedStepIds = Object.freeze(
    steps
      .filter(isKernelMissionCompositionRecord)
      .map(kernelMissionCompositionStepId)
      .filter((stepId): stepId is string => stepId !== null)
      .sort(),
  );
  const missingStepIds = Object.freeze(
    KERNEL_MISSION_COMPOSITION_STEP_IDS.filter(
      (stepId) => !receivedStepIds.includes(stepId),
    ),
  );
  const unknownStepIds = Object.freeze(
    receivedStepIds.filter((stepId) => !isKernelMissionCompositionStepId(stepId)),
  );
  const duplicateStepIds = Object.freeze(
    receivedStepIds.filter(
      (stepId, index) => receivedStepIds.indexOf(stepId) !== index,
    ),
  );
  const readinessReady =
    isKernelMissionCompositionRecord(steps[0]) &&
    steps[0].passed === true &&
    steps[0].decision === "READY";
  const intakeAccepted =
    isKernelMissionCompositionRecord(steps[1]) &&
    steps[1].decision === "ACCEPTED" &&
    steps[1].readyForWorkflowStateHandling === true;
  const cycleReady =
    isKernelMissionCompositionRecord(steps[2]) &&
    steps[2].cycleId === "KERNEL_MISSION_ORDER_CYCLE" &&
    steps[2].readyForWorkflowExecution === true;
  const ordered =
    kernelMissionCompositionStepIdFromIndex(0, steps[0]) === "READINESS_GATE" &&
    kernelMissionCompositionStepIdFromIndex(1, steps[1]) === "MISSION_ORDER_INTAKE" &&
    kernelMissionCompositionStepIdFromIndex(2, steps[2]) === "MISSION_ORDER_CYCLE";

  return Object.freeze({
    expectedStepIds: KERNEL_MISSION_COMPOSITION_STEP_IDS,
    receivedStepIds,
    missingStepIds,
    unknownStepIds,
    duplicateStepIds,
    readinessReady,
    intakeAccepted,
    cycleReady,
    ordered,
    valid:
      missingStepIds.length === 0 &&
      unknownStepIds.length === 0 &&
      duplicateStepIds.length === 0 &&
      readinessReady &&
      intakeAccepted &&
      cycleReady &&
      ordered,
  });
}

function assertKernelMissionCompositionEvidenceValid(
  evidence: KernelMissionCompositionEvidence,
): void {
  if (evidence.missingStepIds.length > 0) {
    throw new KernelMissionCompositionValidationError(
      "KMC-001",
      "Kernel Mission Composition rejects incomplete step sets.",
      evidence,
    );
  }

  if (evidence.unknownStepIds.length > 0) {
    throw new KernelMissionCompositionValidationError(
      "KMC-002",
      "Kernel Mission Composition rejects unknown steps.",
      evidence,
    );
  }

  if (evidence.duplicateStepIds.length > 0) {
    throw new KernelMissionCompositionValidationError(
      "KMC-003",
      "Kernel Mission Composition rejects duplicate steps.",
      evidence,
    );
  }

  if (
    !evidence.readinessReady ||
    !evidence.intakeAccepted ||
    !evidence.cycleReady ||
    !evidence.ordered ||
    !evidence.valid
  ) {
    throw new KernelMissionCompositionValidationError(
      "KMC-004",
      "Kernel Mission Composition rejects incoherent mission pipeline evidence.",
      evidence,
    );
  }
}

function kernelMissionCompositionStepId(component: Record<string, unknown>): string | null {
  if (component.passed === true && component.decision === "READY") {
    return "READINESS_GATE";
  }

  if (component.decision === "ACCEPTED" && component.readyForWorkflowStateHandling === true) {
    return "MISSION_ORDER_INTAKE";
  }

  if (component.cycleId === "KERNEL_MISSION_ORDER_CYCLE") {
    return "MISSION_ORDER_CYCLE";
  }

  return null;
}

function kernelMissionCompositionStepIdFromIndex(
  index: number,
  component: unknown,
): KernelMissionCompositionStepId | null {
  if (!isKernelMissionCompositionRecord(component)) {
    return null;
  }

  const stepId = kernelMissionCompositionStepId(component);

  if (!isKernelMissionCompositionStepId(stepId)) {
    return null;
  }

  return KERNEL_MISSION_COMPOSITION_STEP_IDS[index] === stepId ? stepId : null;
}

function isKernelMissionCompositionStepId(
  stepId: unknown,
): stepId is KernelMissionCompositionStepId {
  return KERNEL_MISSION_COMPOSITION_STEP_IDS.some(
    (expectedStepId) => expectedStepId === stepId,
  );
}

function isKernelMissionCompositionRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelMissionComposition;

export {};

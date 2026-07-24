type KernelMissionOrderCycleDecision = "ACCEPTED";

type KernelMissionOrderCycleStateId =
  | "MISSION_ORDER_ACCEPTED"
  | "MISSION_ORDER_EXECUTION_READY";

type KernelMissionOrderCycleValidationErrorCode =
  | "KMOC-001"
  | "KMOC-002"
  | "KMOC-003"
  | "KMOC-004";

interface KernelMissionOrderCycleInput {
  readonly decision: KernelMissionOrderCycleDecision;
  readonly evidence: unknown;
  readonly acceptedIntake: unknown;
  readonly rejectionCauses: readonly unknown[];
  readonly readyForWorkflowStateHandling: true;
}

interface KernelMissionOrderCycleEvidence {
  readonly intakeOutputReceived: boolean;
  readonly intakeAccepted: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly noRejectionCauses: boolean;
  readonly transitionAuthorized: boolean;
  readonly valid: boolean;
}

interface KernelMissionOrderCycleState {
  readonly cycleId: "KERNEL_MISSION_ORDER_CYCLE";
  readonly initialStateId: "MISSION_ORDER_ACCEPTED";
  readonly currentStateId: "MISSION_ORDER_EXECUTION_READY";
  readonly acceptedIntake: unknown;
  readonly intakeEvidence: unknown;
  readonly evidence: KernelMissionOrderCycleEvidence;
  readonly readyForWorkflowExecution: boolean;
}

class KernelMissionOrderCycleValidationError extends Error {
  readonly code: KernelMissionOrderCycleValidationErrorCode;
  readonly evidence: KernelMissionOrderCycleEvidence;

  constructor(
    code: KernelMissionOrderCycleValidationErrorCode,
    message: string,
    evidence: KernelMissionOrderCycleEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelMissionOrderCycleValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelMissionOrderCycleValidationError.prototype);
  }
}

const KERNEL_MISSION_ORDER_CYCLE_STATES: readonly KernelMissionOrderCycleStateId[] =
  Object.freeze([
    "MISSION_ORDER_ACCEPTED",
    "MISSION_ORDER_EXECUTION_READY",
  ]);

function createKernelMissionOrderCycle(
  intakeOutput: unknown,
): KernelMissionOrderCycleState {
  const evidence = createKernelMissionOrderCycleEvidence(intakeOutput);

  assertKernelMissionOrderCycleEvidenceValid(evidence);

  const acceptedInput = intakeOutput as KernelMissionOrderCycleInput;

  return Object.freeze({
    cycleId: "KERNEL_MISSION_ORDER_CYCLE" as const,
    initialStateId: "MISSION_ORDER_ACCEPTED" as const,
    currentStateId: "MISSION_ORDER_EXECUTION_READY" as const,
    acceptedIntake: acceptedInput.acceptedIntake,
    intakeEvidence: acceptedInput.evidence,
    evidence,
    readyForWorkflowExecution: true as const,
  });
}

function createKernelMissionOrderCycleEvidence(
  intakeOutput: unknown,
): KernelMissionOrderCycleEvidence {
  if (!isKernelMissionOrderCycleRecord(intakeOutput)) {
    return createKernelMissionOrderCycleEvidenceRecord({
      intakeOutputReceived: false,
      intakeAccepted: false,
      acceptedIntakePresent: false,
      noRejectionCauses: false,
      transitionAuthorized: false,
    });
  }

  const intakeAccepted =
    intakeOutput.decision === "ACCEPTED" &&
    intakeOutput.readyForWorkflowStateHandling === true;
  const acceptedIntakePresent =
    "acceptedIntake" in intakeOutput &&
    intakeOutput.acceptedIntake !== null &&
    intakeOutput.acceptedIntake !== undefined;
  const noRejectionCauses =
    Array.isArray(intakeOutput.rejectionCauses) &&
    intakeOutput.rejectionCauses.length === 0;
  const transitionAuthorized =
    intakeAccepted &&
    acceptedIntakePresent &&
    noRejectionCauses &&
    KERNEL_MISSION_ORDER_CYCLE_STATES.length === 2;

  return createKernelMissionOrderCycleEvidenceRecord({
    intakeOutputReceived: true,
    intakeAccepted,
    acceptedIntakePresent,
    noRejectionCauses,
    transitionAuthorized,
  });
}

function createKernelMissionOrderCycleEvidenceRecord(fields: {
  readonly intakeOutputReceived: boolean;
  readonly intakeAccepted: boolean;
  readonly acceptedIntakePresent: boolean;
  readonly noRejectionCauses: boolean;
  readonly transitionAuthorized: boolean;
}): KernelMissionOrderCycleEvidence {
  return Object.freeze({
    intakeOutputReceived: fields.intakeOutputReceived,
    intakeAccepted: fields.intakeAccepted,
    acceptedIntakePresent: fields.acceptedIntakePresent,
    noRejectionCauses: fields.noRejectionCauses,
    transitionAuthorized: fields.transitionAuthorized,
    valid:
      fields.intakeOutputReceived &&
      fields.intakeAccepted &&
      fields.acceptedIntakePresent &&
      fields.noRejectionCauses &&
      fields.transitionAuthorized,
  });
}

function assertKernelMissionOrderCycleEvidenceValid(
  evidence: KernelMissionOrderCycleEvidence,
): void {
  if (!evidence.intakeOutputReceived) {
    throw new KernelMissionOrderCycleValidationError(
      "KMOC-001",
      "Kernel Mission Order Cycle requires a Mission Order Intake output.",
      evidence,
    );
  }

  if (!evidence.intakeAccepted) {
    throw new KernelMissionOrderCycleValidationError(
      "KMOC-002",
      "Kernel Mission Order Cycle requires an ACCEPTED intake output.",
      evidence,
    );
  }

  if (!evidence.acceptedIntakePresent || !evidence.noRejectionCauses) {
    throw new KernelMissionOrderCycleValidationError(
      "KMOC-003",
      "Kernel Mission Order Cycle rejects contradictory intake output.",
      evidence,
    );
  }

  if (!evidence.transitionAuthorized || !evidence.valid) {
    throw new KernelMissionOrderCycleValidationError(
      "KMOC-004",
      "Kernel Mission Order Cycle rejects unauthorized internal transitions.",
      evidence,
    );
  }
}

function isKernelMissionOrderCycleRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelMissionOrderCycle;

export {};

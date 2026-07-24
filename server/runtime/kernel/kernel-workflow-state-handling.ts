type KernelWorkflowStateHandlingDecision = "ACCEPTED" | "REJECTED";

type KernelWorkflowStateHandlingStateId =
  | "MISSION_ORDER_INTAKE_ACCEPTED";

type KernelWorkflowStateHandlingValidationErrorCode =
  | "KWSH-001"
  | "KWSH-002"
  | "KWSH-003"
  | "KWSH-004";

interface KernelWorkflowStateHandlingRejectionCause {
  readonly code: string;
  readonly fieldName: string | null;
  readonly message: string;
}

interface KernelWorkflowStateHandlingMissionOrderIntakeResult {
  readonly decision: KernelWorkflowStateHandlingDecision;
  readonly evidence: unknown;
  readonly acceptedIntake: unknown | null;
  readonly rejectionCauses: readonly KernelWorkflowStateHandlingRejectionCause[];
  readonly readyForWorkflowStateHandling: boolean;
}

interface KernelWorkflowStateHandlingEvidence {
  readonly intakeResultReceived: boolean;
  readonly decisionRecognized: boolean;
  readonly acceptedStateCoherent: boolean;
  readonly rejectedStateCoherent: boolean;
  readonly valid: boolean;
}

interface KernelWorkflowStateHandlingState {
  readonly stateId: KernelWorkflowStateHandlingStateId;
  readonly intakeDecision: KernelWorkflowStateHandlingDecision;
  readonly intakeEvidence: unknown;
  readonly acceptedIntake: unknown | null;
  readonly rejectionCauses: readonly KernelWorkflowStateHandlingRejectionCause[];
  readonly evidence: KernelWorkflowStateHandlingEvidence;
}

class KernelWorkflowStateHandlingValidationError extends Error {
  readonly code: KernelWorkflowStateHandlingValidationErrorCode;
  readonly evidence: KernelWorkflowStateHandlingEvidence;

  constructor(
    code: KernelWorkflowStateHandlingValidationErrorCode,
    message: string,
    evidence: KernelWorkflowStateHandlingEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelWorkflowStateHandlingValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelWorkflowStateHandlingValidationError.prototype);
  }
}

function createKernelWorkflowStateHandlingState(
  intakeResult: unknown,
): KernelWorkflowStateHandlingState {
  const evidence = createKernelWorkflowStateHandlingEvidence(intakeResult);

  assertKernelWorkflowStateHandlingIntakeResultValid(evidence);

  const consumedIntakeResult =
    intakeResult as KernelWorkflowStateHandlingMissionOrderIntakeResult;

  return Object.freeze({
    stateId: createKernelWorkflowStateHandlingStateId(consumedIntakeResult.decision),
    intakeDecision: consumedIntakeResult.decision,
    intakeEvidence: consumedIntakeResult.evidence,
    acceptedIntake: consumedIntakeResult.acceptedIntake,
    rejectionCauses: Object.freeze([...consumedIntakeResult.rejectionCauses]),
    evidence,
  });
}

function createKernelWorkflowStateHandlingEvidence(
  intakeResult: unknown,
): KernelWorkflowStateHandlingEvidence {
  if (!isKernelWorkflowStateHandlingIntakeResultRecord(intakeResult)) {
    return createKernelWorkflowStateHandlingEvidenceRecord({
      intakeResultReceived: false,
      decisionRecognized: false,
      acceptedStateCoherent: false,
      rejectedStateCoherent: false,
    });
  }

  const decisionRecognized = isKernelWorkflowStateHandlingDecision(
    intakeResult.decision,
  );
  const rejectionCauses = Array.isArray(intakeResult.rejectionCauses)
    ? intakeResult.rejectionCauses
    : [];
  const acceptedStateCoherent =
    intakeResult.decision === "ACCEPTED" &&
    intakeResult.readyForWorkflowStateHandling === true &&
    intakeResult.acceptedIntake !== null &&
    rejectionCauses.length === 0;
  const rejectedStateCoherent = false;

  return createKernelWorkflowStateHandlingEvidenceRecord({
    intakeResultReceived: true,
    decisionRecognized,
    acceptedStateCoherent,
    rejectedStateCoherent,
  });
}

function createKernelWorkflowStateHandlingEvidenceRecord(fields: {
  readonly intakeResultReceived: boolean;
  readonly decisionRecognized: boolean;
  readonly acceptedStateCoherent: boolean;
  readonly rejectedStateCoherent: boolean;
}): KernelWorkflowStateHandlingEvidence {
  return Object.freeze({
    intakeResultReceived: fields.intakeResultReceived,
    decisionRecognized: fields.decisionRecognized,
    acceptedStateCoherent: fields.acceptedStateCoherent,
    rejectedStateCoherent: fields.rejectedStateCoherent,
    valid:
      fields.intakeResultReceived &&
      fields.decisionRecognized &&
      (
        fields.acceptedStateCoherent
      ),
  });
}

function assertKernelWorkflowStateHandlingIntakeResultValid(
  evidence: KernelWorkflowStateHandlingEvidence,
): void {
  if (!evidence.intakeResultReceived) {
    throw new KernelWorkflowStateHandlingValidationError(
      "KWSH-001",
      "Kernel Workflow State Handling requires a Mission Order Intake result.",
      evidence,
    );
  }

  if (!evidence.decisionRecognized) {
    throw new KernelWorkflowStateHandlingValidationError(
      "KWSH-002",
      "Kernel Workflow State Handling rejects unknown intake decisions.",
      evidence,
    );
  }

  if (evidence.rejectedStateCoherent) {
    throw new KernelWorkflowStateHandlingValidationError(
      "KWSH-003",
      "Kernel Workflow State Handling rejects Mission Order Intake REJECTED.",
      evidence,
    );
  }

  if (!evidence.acceptedStateCoherent) {
    throw new KernelWorkflowStateHandlingValidationError(
      "KWSH-003",
      "Kernel Workflow State Handling requires Mission Order Intake ACCEPTED.",
      evidence,
    );
  }

  if (!evidence.valid) {
    throw new KernelWorkflowStateHandlingValidationError(
      "KWSH-004",
      "Kernel Workflow State Handling rejects incomplete state evidence.",
      evidence,
    );
  }
}

function createKernelWorkflowStateHandlingStateId(
  decision: KernelWorkflowStateHandlingDecision,
): KernelWorkflowStateHandlingStateId {
  if (decision !== "ACCEPTED") {
    throw new Error(
      "KWSH-003: Kernel Workflow State Handling rejects Mission Order Intake REJECTED.",
    );
  }

  return "MISSION_ORDER_INTAKE_ACCEPTED";
}

function isKernelWorkflowStateHandlingIntakeResultRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isKernelWorkflowStateHandlingDecision(
  decision: unknown,
): decision is KernelWorkflowStateHandlingDecision {
  return decision === "ACCEPTED" || decision === "REJECTED";
}

function isKernelWorkflowStateHandlingRejectionCause(
  cause: unknown,
): cause is KernelWorkflowStateHandlingRejectionCause {
  return (
    typeof cause === "object" &&
    cause !== null &&
    !Array.isArray(cause) &&
    "code" in cause &&
    "fieldName" in cause &&
    "message" in cause &&
    typeof cause.code === "string" &&
    cause.code.length > 0 &&
    (cause.fieldName === null || typeof cause.fieldName === "string") &&
    typeof cause.message === "string" &&
    cause.message.length > 0
  );
}

void createKernelWorkflowStateHandlingState;

export {};

type KernelWorkflowStateHandlingAuthorizedInitialStateId =
  | "WORKFLOW_STATE_CREATED"
  | "MISSION_ORDER_INTAKE_ACCEPTED";

type KernelWorkflowStateHandlingInitialValidationErrorCode =
  | "KWSH-I-001"
  | "KWSH-I-002"
  | "KWSH-I-003"
  | "KWSH-I-004";

interface KernelWorkflowStateHandlingInitialTransition {
  readonly from: "WORKFLOW_STATE_CREATED";
  readonly to: "MISSION_ORDER_INTAKE_ACCEPTED";
  readonly sourceDecision: "ACCEPTED";
}

interface KernelWorkflowStateHandlingInitialStateEvidence {
  readonly authorizedStates: readonly KernelWorkflowStateHandlingAuthorizedInitialStateId[];
  readonly initialStateId: KernelWorkflowStateHandlingAuthorizedInitialStateId;
  readonly targetStateId: KernelWorkflowStateHandlingAuthorizedInitialStateId;
  readonly intakeResultReceived: boolean;
  readonly intakeAccepted: boolean;
  readonly intakeReadyForWorkflowStateHandling: boolean;
  readonly initialStateKnown: boolean;
  readonly targetStateKnown: boolean;
  readonly initialTransitionAuthorized: boolean;
  readonly valid: boolean;
}

interface KernelWorkflowStateHandlingInitialState {
  readonly stateId: "MISSION_ORDER_INTAKE_ACCEPTED";
  readonly previousStateId: "WORKFLOW_STATE_CREATED";
  readonly sourceDecision: "ACCEPTED";
  readonly intakeEvidence: unknown;
  readonly acceptedIntake: unknown;
  readonly evidence: KernelWorkflowStateHandlingInitialStateEvidence;
}

class KernelWorkflowStateHandlingInitialValidationError extends Error {
  readonly code: KernelWorkflowStateHandlingInitialValidationErrorCode;
  readonly evidence: KernelWorkflowStateHandlingInitialStateEvidence;

  constructor(
    code: KernelWorkflowStateHandlingInitialValidationErrorCode,
    message: string,
    evidence: KernelWorkflowStateHandlingInitialStateEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelWorkflowStateHandlingInitialValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelWorkflowStateHandlingInitialValidationError.prototype);
  }
}

const KERNEL_WORKFLOW_STATE_HANDLING_AUTHORIZED_INITIAL_STATES: readonly KernelWorkflowStateHandlingAuthorizedInitialStateId[] =
  Object.freeze([
    "WORKFLOW_STATE_CREATED",
    "MISSION_ORDER_INTAKE_ACCEPTED",
  ]);

const KERNEL_WORKFLOW_STATE_HANDLING_AUTHORIZED_INITIAL_TRANSITIONS: readonly KernelWorkflowStateHandlingInitialTransition[] =
  Object.freeze([
    Object.freeze({
      from: "WORKFLOW_STATE_CREATED",
      to: "MISSION_ORDER_INTAKE_ACCEPTED",
      sourceDecision: "ACCEPTED",
    }),
  ]);

function createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake(
  intakeResult: unknown,
): KernelWorkflowStateHandlingInitialState {
  const evidence = createKernelWorkflowStateHandlingInitialStateEvidence(
    "WORKFLOW_STATE_CREATED",
    "MISSION_ORDER_INTAKE_ACCEPTED",
    intakeResult,
  );

  assertKernelWorkflowStateHandlingInitialStateEvidenceValid(evidence);

  const acceptedIntakeResult =
    intakeResult as KernelWorkflowStateHandlingMissionOrderIntakeResult;

  return Object.freeze({
    stateId: "MISSION_ORDER_INTAKE_ACCEPTED" as const,
    previousStateId: "WORKFLOW_STATE_CREATED" as const,
    sourceDecision: "ACCEPTED" as const,
    intakeEvidence: acceptedIntakeResult.evidence,
    acceptedIntake: acceptedIntakeResult.acceptedIntake,
    evidence,
  });
}

function createKernelWorkflowStateHandlingInitialStateEvidence(
  initialStateId: KernelWorkflowStateHandlingAuthorizedInitialStateId,
  targetStateId: KernelWorkflowStateHandlingAuthorizedInitialStateId,
  intakeResult: unknown,
): KernelWorkflowStateHandlingInitialStateEvidence {
  const intakeResultReceived =
    isKernelWorkflowStateHandlingIntakeResultRecord(intakeResult);
  const intakeAccepted =
    intakeResultReceived &&
    intakeResult.decision === "ACCEPTED" &&
    Array.isArray(intakeResult.rejectionCauses) &&
    intakeResult.rejectionCauses.length === 0 &&
    intakeResult.acceptedIntake !== null;
  const intakeReadyForWorkflowStateHandling =
    intakeResultReceived &&
    intakeResult.readyForWorkflowStateHandling === true;
  const initialStateKnown =
    isKernelWorkflowStateHandlingAuthorizedInitialStateId(initialStateId);
  const targetStateKnown =
    isKernelWorkflowStateHandlingAuthorizedInitialStateId(targetStateId);
  const initialTransitionAuthorized =
    intakeAccepted &&
    isKernelWorkflowStateHandlingInitialTransitionAuthorized(
      initialStateId,
      targetStateId,
      "ACCEPTED",
    );

  return Object.freeze({
    authorizedStates: KERNEL_WORKFLOW_STATE_HANDLING_AUTHORIZED_INITIAL_STATES,
    initialStateId,
    targetStateId,
    intakeResultReceived,
    intakeAccepted,
    intakeReadyForWorkflowStateHandling,
    initialStateKnown,
    targetStateKnown,
    initialTransitionAuthorized,
    valid:
      intakeResultReceived &&
      intakeAccepted &&
      intakeReadyForWorkflowStateHandling &&
      initialStateKnown &&
      targetStateKnown &&
      initialTransitionAuthorized,
  });
}

function assertKernelWorkflowStateHandlingInitialStateEvidenceValid(
  evidence: KernelWorkflowStateHandlingInitialStateEvidence,
): void {
  if (!evidence.intakeResultReceived) {
    throw new KernelWorkflowStateHandlingInitialValidationError(
      "KWSH-I-001",
      "Kernel Workflow State Handling requires a Mission Order Intake result for initial state creation.",
      evidence,
    );
  }

  if (!evidence.initialStateKnown || !evidence.targetStateKnown) {
    throw new KernelWorkflowStateHandlingInitialValidationError(
      "KWSH-I-002",
      "Kernel Workflow State Handling rejects unknown workflow states.",
      evidence,
    );
  }

  if (!evidence.intakeAccepted || !evidence.intakeReadyForWorkflowStateHandling) {
    throw new KernelWorkflowStateHandlingInitialValidationError(
      "KWSH-I-003",
      "Kernel Workflow State Handling initial state requires Mission Order Intake ACCEPTED.",
      evidence,
    );
  }

  if (!evidence.initialTransitionAuthorized || !evidence.valid) {
    throw new KernelWorkflowStateHandlingInitialValidationError(
      "KWSH-I-004",
      "Kernel Workflow State Handling rejects unauthorized initial workflow transitions.",
      evidence,
    );
  }
}

function isKernelWorkflowStateHandlingAuthorizedInitialStateId(
  stateId: string,
): stateId is KernelWorkflowStateHandlingAuthorizedInitialStateId {
  return KERNEL_WORKFLOW_STATE_HANDLING_AUTHORIZED_INITIAL_STATES.some(
    (authorizedStateId) => authorizedStateId === stateId,
  );
}

function isKernelWorkflowStateHandlingInitialTransitionAuthorized(
  from: KernelWorkflowStateHandlingAuthorizedInitialStateId,
  to: KernelWorkflowStateHandlingAuthorizedInitialStateId,
  sourceDecision: "ACCEPTED",
): boolean {
  return KERNEL_WORKFLOW_STATE_HANDLING_AUTHORIZED_INITIAL_TRANSITIONS.some(
    (transition) =>
      transition.from === from &&
      transition.to === to &&
      transition.sourceDecision === sourceDecision,
  );
}

void createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake;

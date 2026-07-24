type KernelMissionOrderIntakeFieldName =
  | "missionOrderId"
  | "targetIncrement"
  | "requestedFilePath"
  | "authorizedCodeArea";

type KernelMissionOrderIntakeValidationErrorCode =
  | "KMOI-001"
  | "KMOI-002"
  | "KMOI-003"
  | "KMOI-004";

interface KernelMissionOrderIntake {
  readonly missionOrderId: string;
  readonly targetIncrement: string;
  readonly requestedFilePath: string;
  readonly authorizedCodeArea: string;
}

interface KernelMissionOrderIntakeValidationEvidence {
  readonly structureReceived: boolean;
  readonly expectedFields: readonly KernelMissionOrderIntakeFieldName[];
  readonly receivedFields: readonly string[];
  readonly missingFields: readonly KernelMissionOrderIntakeFieldName[];
  readonly unknownFields: readonly string[];
  readonly invalidFields: readonly KernelMissionOrderIntakeFieldName[];
  readonly valid: boolean;
}

class KernelMissionOrderIntakeValidationError extends Error {
  readonly code: KernelMissionOrderIntakeValidationErrorCode;
  readonly evidence: KernelMissionOrderIntakeValidationEvidence;

  constructor(
    code: KernelMissionOrderIntakeValidationErrorCode,
    message: string,
    evidence: KernelMissionOrderIntakeValidationEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelMissionOrderIntakeValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelMissionOrderIntakeValidationError.prototype);
  }
}

const KERNEL_MISSION_ORDER_INTAKE_FIELDS: readonly KernelMissionOrderIntakeFieldName[] = Object.freeze([
  "missionOrderId",
  "targetIncrement",
  "requestedFilePath",
  "authorizedCodeArea",
]);

function createKernelMissionOrderIntake(received: unknown): KernelMissionOrderIntake {
  const evidence = createKernelMissionOrderIntakeValidationEvidence(received);

  assertKernelMissionOrderIntakeValid(evidence);

  const intakeRecord = received as Record<KernelMissionOrderIntakeFieldName, string>;

  return Object.freeze({
    missionOrderId: intakeRecord.missionOrderId,
    targetIncrement: intakeRecord.targetIncrement,
    requestedFilePath: intakeRecord.requestedFilePath,
    authorizedCodeArea: intakeRecord.authorizedCodeArea,
  });
}

function createKernelMissionOrderIntakeValidationEvidence(
  received: unknown,
): KernelMissionOrderIntakeValidationEvidence {
  if (!isKernelMissionOrderIntakeRecord(received)) {
    return createKernelMissionOrderIntakeEvidence({
      structureReceived: false,
      receivedFields: Object.freeze([]),
      missingFields: KERNEL_MISSION_ORDER_INTAKE_FIELDS,
      unknownFields: Object.freeze([]),
      invalidFields: KERNEL_MISSION_ORDER_INTAKE_FIELDS,
    });
  }

  const receivedFields = Object.freeze(Object.keys(received).sort());
  const missingFields = Object.freeze(
    KERNEL_MISSION_ORDER_INTAKE_FIELDS.filter((fieldName) => !(fieldName in received)),
  );
  const unknownFields = Object.freeze(
    receivedFields.filter((fieldName) => !isKernelMissionOrderIntakeFieldName(fieldName)),
  );
  const invalidFields = Object.freeze(
    KERNEL_MISSION_ORDER_INTAKE_FIELDS.filter(
      (fieldName) =>
        fieldName in received &&
        !isKernelMissionOrderIntakeFieldValue(received[fieldName]),
    ),
  );

  return createKernelMissionOrderIntakeEvidence({
    structureReceived: true,
    receivedFields,
    missingFields,
    unknownFields,
    invalidFields,
  });
}

function createKernelMissionOrderIntakeEvidence(fields: {
  readonly structureReceived: boolean;
  readonly receivedFields: readonly string[];
  readonly missingFields: readonly KernelMissionOrderIntakeFieldName[];
  readonly unknownFields: readonly string[];
  readonly invalidFields: readonly KernelMissionOrderIntakeFieldName[];
}): KernelMissionOrderIntakeValidationEvidence {
  return Object.freeze({
    structureReceived: fields.structureReceived,
    expectedFields: KERNEL_MISSION_ORDER_INTAKE_FIELDS,
    receivedFields: fields.receivedFields,
    missingFields: fields.missingFields,
    unknownFields: fields.unknownFields,
    invalidFields: fields.invalidFields,
    valid:
      fields.structureReceived &&
      fields.missingFields.length === 0 &&
      fields.unknownFields.length === 0 &&
      fields.invalidFields.length === 0,
  });
}

function assertKernelMissionOrderIntakeValid(
  evidence: KernelMissionOrderIntakeValidationEvidence,
): void {
  if (!evidence.structureReceived) {
    throw new KernelMissionOrderIntakeValidationError(
      "KMOI-001",
      "Kernel Mission Order Intake requires a structured record.",
      evidence,
    );
  }

  if (evidence.missingFields.length > 0) {
    throw new KernelMissionOrderIntakeValidationError(
      "KMOI-002",
      "Kernel Mission Order Intake rejects incomplete records.",
      evidence,
    );
  }

  if (evidence.unknownFields.length > 0) {
    throw new KernelMissionOrderIntakeValidationError(
      "KMOI-003",
      "Kernel Mission Order Intake rejects unknown fields.",
      evidence,
    );
  }

  if (evidence.invalidFields.length > 0 || !evidence.valid) {
    throw new KernelMissionOrderIntakeValidationError(
      "KMOI-004",
      "Kernel Mission Order Intake rejects invalid field values.",
      evidence,
    );
  }
}

function isKernelMissionOrderIntakeRecord(
  received: unknown,
): received is Record<string, unknown> {
  return (
    typeof received === "object" &&
    received !== null &&
    !Array.isArray(received)
  );
}

function isKernelMissionOrderIntakeFieldName(
  fieldName: string,
): fieldName is KernelMissionOrderIntakeFieldName {
  return KERNEL_MISSION_ORDER_INTAKE_FIELDS.some(
    (expectedFieldName) => expectedFieldName === fieldName,
  );
}

function isKernelMissionOrderIntakeFieldValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value === value.trim();
}

void createKernelMissionOrderIntake;

export {};

interface NormalizedKernelMissionOrderIntake extends KernelMissionOrderIntake {
  readonly missionOrderId: string;
  readonly targetIncrement: string;
  readonly requestedFilePath: string;
  readonly authorizedCodeArea: string;
}

function normalizeKernelMissionOrderIntake(received: unknown): NormalizedKernelMissionOrderIntake {
  const intake = createKernelMissionOrderIntake(received);

  return Object.freeze({
    missionOrderId: normalizeKernelMissionOrderIdentifier(intake.missionOrderId),
    targetIncrement: normalizeKernelMissionOrderIdentifier(intake.targetIncrement),
    requestedFilePath: normalizeKernelMissionOrderPath(
      intake.requestedFilePath,
      "requestedFilePath",
    ),
    authorizedCodeArea: normalizeKernelMissionOrderPath(
      intake.authorizedCodeArea,
      "authorizedCodeArea",
    ),
  });
}

function normalizeKernelMissionOrderIdentifier(value: string): string {
  return value.toUpperCase();
}

function normalizeKernelMissionOrderPath(
  value: string,
  fieldName: KernelMissionOrderIntakeFieldName,
): string {
  const normalizedSegments = value
    .replaceAll("\\", "/")
    .split("/")
    .filter((segment) => segment.length > 0 && segment !== ".")
    .join("/");

  if (normalizedSegments.length === 0) {
    throw new KernelMissionOrderIntakeValidationError(
      "KMOI-004",
      "Kernel Mission Order Intake rejects empty normalized paths.",
      createKernelMissionOrderIntakeEvidence({
        structureReceived: true,
        receivedFields: KERNEL_MISSION_ORDER_INTAKE_FIELDS,
        missingFields: Object.freeze([]),
        unknownFields: Object.freeze([]),
        invalidFields: Object.freeze([fieldName]),
      }),
    );
  }

  return normalizedSegments;
}

void normalizeKernelMissionOrderIntake;

type KernelMissionOrderIntakeFinalDecision = "ACCEPTED" | "REJECTED";

type KernelMissionOrderIntakeFinalCauseCode =
  | KernelMissionOrderIntakeValidationErrorCode
  | "KMOI-005"
  | "KMOI-006"
  | "KMOI-007";

interface KernelMissionOrderIntakeFinalCause {
  readonly code: KernelMissionOrderIntakeFinalCauseCode;
  readonly fieldName: string | null;
  readonly message: string;
}

interface KernelMissionOrderIntakeFinalEvidence {
  readonly validationEvidence: KernelMissionOrderIntakeValidationEvidence;
  readonly normalizedIntake: NormalizedKernelMissionOrderIntake | null;
  readonly normalizationFailure: KernelMissionOrderIntakeFinalCause | null;
  readonly evidenceComplete: boolean;
  readonly evidenceCoherent: boolean;
}

interface KernelMissionOrderIntakeFinalResult {
  readonly decision: KernelMissionOrderIntakeFinalDecision;
  readonly evidence: KernelMissionOrderIntakeFinalEvidence;
  readonly causes: readonly KernelMissionOrderIntakeFinalCause[];
  readonly readyForWorkflowStateHandling: boolean;
}

function finalizeKernelMissionOrderIntake(received: unknown): KernelMissionOrderIntakeFinalResult {
  const evidence = createKernelMissionOrderIntakeFinalEvidence(received);
  const causes = createKernelMissionOrderIntakeFinalCauses(evidence);
  const decision: KernelMissionOrderIntakeFinalDecision =
    causes.length === 0 ? "ACCEPTED" : "REJECTED";

  return validateFinalKernelMissionOrderIntakeResult(
    createKernelMissionOrderIntakeFinalResult(decision, evidence, causes),
  );
}

function createKernelMissionOrderIntakeFinalEvidence(
  received: unknown,
): KernelMissionOrderIntakeFinalEvidence {
  const validationEvidence = createKernelMissionOrderIntakeValidationEvidence(received);
  const normalizationResult =
    validationEvidence.valid
      ? tryNormalizeKernelMissionOrderIntake(received)
      : Object.freeze({
          normalizedIntake: null,
          normalizationFailure: null,
        });
  const evidenceComplete =
    validationEvidence.valid &&
    normalizationResult.normalizedIntake !== null &&
    normalizationResult.normalizationFailure === null;
  const evidenceCoherent =
    evidenceComplete &&
    kernelMissionOrderIntakeFinalEvidenceIsCoherent(
      validationEvidence,
      normalizationResult.normalizedIntake,
    );

  return Object.freeze({
    validationEvidence,
    normalizedIntake: normalizationResult.normalizedIntake,
    normalizationFailure: normalizationResult.normalizationFailure,
    evidenceComplete,
    evidenceCoherent,
  });
}

function tryNormalizeKernelMissionOrderIntake(received: unknown): Readonly<{
  readonly normalizedIntake: NormalizedKernelMissionOrderIntake | null;
  readonly normalizationFailure: KernelMissionOrderIntakeFinalCause | null;
}> {
  try {
    return Object.freeze({
      normalizedIntake: normalizeKernelMissionOrderIntake(received),
      normalizationFailure: null,
    });
  } catch (error) {
    return Object.freeze({
      normalizedIntake: null,
      normalizationFailure: createKernelMissionOrderIntakeFinalCause(
        kernelMissionOrderIntakeFinalCauseCodeFromError(error),
        null,
        kernelMissionOrderIntakeFinalErrorMessage(error),
      ),
    });
  }
}

function createKernelMissionOrderIntakeFinalResult(
  decision: KernelMissionOrderIntakeFinalDecision,
  evidence: KernelMissionOrderIntakeFinalEvidence,
  causes: readonly KernelMissionOrderIntakeFinalCause[],
): KernelMissionOrderIntakeFinalResult {
  return Object.freeze({
    decision,
    evidence,
    causes: Object.freeze([...causes]),
    readyForWorkflowStateHandling:
      decision === "ACCEPTED" &&
      evidence.evidenceComplete &&
      evidence.evidenceCoherent &&
      causes.length === 0,
  });
}

function validateFinalKernelMissionOrderIntakeResult(
  result: KernelMissionOrderIntakeFinalResult,
): KernelMissionOrderIntakeFinalResult {
  const accepted = result.decision === "ACCEPTED";
  const rejected = result.decision === "REJECTED";
  const hasTypedCauses = result.causes.every(isKernelMissionOrderIntakeFinalCause);
  const hasAcceptedEvidence =
    result.evidence.evidenceComplete &&
    result.evidence.evidenceCoherent &&
    result.evidence.normalizedIntake !== null &&
    result.evidence.normalizationFailure === null;

  if (!accepted && !rejected) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake final decision must be ACCEPTED or REJECTED.",
    );
  }

  if (!hasTypedCauses) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake final rejection causes must be typed.",
    );
  }

  if (accepted && (!hasAcceptedEvidence || result.causes.length > 0)) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake ACCEPTED decisions require complete coherent evidence and no rejection causes.",
    );
  }

  if (rejected && result.causes.length === 0) {
    throw new Error(
      "KMOI-007: Kernel Mission Order Intake REJECTED decisions require at least one typed cause.",
    );
  }

  if (
    result.readyForWorkflowStateHandling !==
    (accepted && hasAcceptedEvidence && result.causes.length === 0)
  ) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake final workflow readiness is contradictory.",
    );
  }

  return result;
}

function createKernelMissionOrderIntakeFinalCauses(
  evidence: KernelMissionOrderIntakeFinalEvidence,
): readonly KernelMissionOrderIntakeFinalCause[] {
  const causes: KernelMissionOrderIntakeFinalCause[] = [];
  const validationEvidence = evidence.validationEvidence;

  if (!validationEvidence.structureReceived) {
    causes.push(
      createKernelMissionOrderIntakeFinalCause(
        "KMOI-001",
        null,
        "Kernel Mission Order Intake final validation requires a structured record.",
      ),
    );
  }

  for (const fieldName of validationEvidence.missingFields) {
    causes.push(
      createKernelMissionOrderIntakeFinalCause(
        "KMOI-002",
        fieldName,
        "Kernel Mission Order Intake final validation rejects missing required fields.",
      ),
    );
  }

  for (const fieldName of validationEvidence.unknownFields) {
    causes.push(
      createKernelMissionOrderIntakeFinalCause(
        "KMOI-003",
        fieldName,
        "Kernel Mission Order Intake final validation rejects unknown fields.",
      ),
    );
  }

  for (const fieldName of validationEvidence.invalidFields) {
    causes.push(
      createKernelMissionOrderIntakeFinalCause(
        "KMOI-004",
        fieldName,
        "Kernel Mission Order Intake final validation rejects invalid field values.",
      ),
    );
  }

  if (evidence.normalizationFailure !== null) {
    causes.push(evidence.normalizationFailure);
  }

  if (causes.length === 0 && (!evidence.evidenceComplete || !evidence.evidenceCoherent)) {
    causes.push(
      createKernelMissionOrderIntakeFinalCause(
        "KMOI-005",
        null,
        "Kernel Mission Order Intake final validation rejects incomplete or incoherent evidence.",
      ),
    );
  }

  return Object.freeze(causes);
}

function createKernelMissionOrderIntakeFinalCause(
  code: KernelMissionOrderIntakeFinalCauseCode,
  fieldName: string | null,
  message: string,
): KernelMissionOrderIntakeFinalCause {
  return Object.freeze({
    code,
    fieldName,
    message,
  });
}

function kernelMissionOrderIntakeFinalEvidenceIsCoherent(
  validationEvidence: KernelMissionOrderIntakeValidationEvidence,
  normalizedIntake: NormalizedKernelMissionOrderIntake | null,
): normalizedIntake is NormalizedKernelMissionOrderIntake {
  return (
    validationEvidence.valid &&
    normalizedIntake !== null &&
    validationEvidence.structureReceived &&
    validationEvidence.expectedFields === KERNEL_MISSION_ORDER_INTAKE_FIELDS &&
    validationEvidence.missingFields.length === 0 &&
    validationEvidence.unknownFields.length === 0 &&
    validationEvidence.invalidFields.length === 0 &&
    validationEvidence.receivedFields.length === KERNEL_MISSION_ORDER_INTAKE_FIELDS.length &&
    KERNEL_MISSION_ORDER_INTAKE_FIELDS.every((fieldName) =>
      validationEvidence.receivedFields.includes(fieldName),
    ) &&
    isKernelMissionOrderIntakeFieldValue(normalizedIntake.missionOrderId) &&
    isKernelMissionOrderIntakeFieldValue(normalizedIntake.targetIncrement) &&
    isKernelMissionOrderIntakeNormalizedPath(normalizedIntake.requestedFilePath) &&
    isKernelMissionOrderIntakeNormalizedPath(normalizedIntake.authorizedCodeArea)
  );
}

function isKernelMissionOrderIntakeFinalCause(
  cause: KernelMissionOrderIntakeFinalCause,
): boolean {
  return (
    typeof cause === "object" &&
    cause !== null &&
    isKernelMissionOrderIntakeFinalCauseCode(cause.code) &&
    (cause.fieldName === null || typeof cause.fieldName === "string") &&
    typeof cause.message === "string" &&
    cause.message.length > 0
  );
}

function isKernelMissionOrderIntakeFinalCauseCode(
  code: string,
): code is KernelMissionOrderIntakeFinalCauseCode {
  return (
    code === "KMOI-001" ||
    code === "KMOI-002" ||
    code === "KMOI-003" ||
    code === "KMOI-004" ||
    code === "KMOI-005" ||
    code === "KMOI-006" ||
    code === "KMOI-007"
  );
}

function isKernelMissionOrderIntakeNormalizedPath(value: string): boolean {
  return (
    isKernelMissionOrderIntakeFieldValue(value) &&
    !value.includes("\\") &&
    !value.includes("//") &&
    value
      .split("/")
      .every((segment) => segment.length > 0 && segment !== ".")
  );
}

function kernelMissionOrderIntakeFinalCauseCodeFromError(
  error: unknown,
): KernelMissionOrderIntakeFinalCauseCode {
  if (
    error instanceof KernelMissionOrderIntakeValidationError &&
    isKernelMissionOrderIntakeFinalCauseCode(error.code)
  ) {
    return error.code;
  }

  return "KMOI-005";
}

function kernelMissionOrderIntakeFinalErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "KMOI-005: Kernel Mission Order Intake final validation failed deterministically.";
}

void finalizeKernelMissionOrderIntake;

type KernelMissionOrderIntakeState =
  | "CREATED"
  | "ACCEPTED"
  | "REJECTED";

interface KernelMissionOrderIntakeInitialTransitionRule {
  readonly initialState: "CREATED";
  readonly finalState: Exclude<KernelMissionOrderIntakeState, "CREATED">;
}

interface KernelMissionOrderIntakeTransitionEvidence {
  readonly initialState: KernelMissionOrderIntakeState;
  readonly finalState: KernelMissionOrderIntakeState;
  readonly decisionReason: string;
}

const KERNEL_MISSION_ORDER_INTAKE_AUTHORIZED_STATES: readonly KernelMissionOrderIntakeState[] =
  Object.freeze([
    "CREATED",
    "ACCEPTED",
    "REJECTED",
  ]);

const KERNEL_MISSION_ORDER_INTAKE_INITIAL_TRANSITIONS: readonly KernelMissionOrderIntakeInitialTransitionRule[] =
  Object.freeze([
    Object.freeze({
      initialState: "CREATED",
      finalState: "ACCEPTED",
    }),
    Object.freeze({
      initialState: "CREATED",
      finalState: "REJECTED",
    }),
  ]);

function createKernelMissionOrderIntakeTransitionEvidence(
  initialState: KernelMissionOrderIntakeState,
  finalState: KernelMissionOrderIntakeState,
  decisionReason: string,
): KernelMissionOrderIntakeTransitionEvidence {
  const evidence = Object.freeze({
    initialState,
    finalState,
    decisionReason,
  });

  assertKernelMissionOrderIntakeTransitionEvidenceValid(evidence);

  return evidence;
}

function assertKernelMissionOrderIntakeTransitionEvidenceValid(
  evidence: KernelMissionOrderIntakeTransitionEvidence,
): void {
  if (
    !isKernelMissionOrderIntakeState(evidence.initialState) ||
    !isKernelMissionOrderIntakeState(evidence.finalState) ||
    !isKernelMissionOrderIntakeDecisionReason(evidence.decisionReason) ||
    !isKernelMissionOrderIntakeInitialTransitionAuthorized(evidence)
  ) {
    throw new Error(
      "KMOI-005: Kernel Mission Order Intake rejects unauthorized initial state transitions.",
    );
  }
}

function isKernelMissionOrderIntakeInitialTransitionAuthorized(
  evidence: KernelMissionOrderIntakeTransitionEvidence,
): boolean {
  return KERNEL_MISSION_ORDER_INTAKE_INITIAL_TRANSITIONS.some(
    (transition) =>
      transition.initialState === evidence.initialState &&
      transition.finalState === evidence.finalState,
  );
}

function isKernelMissionOrderIntakeState(
  state: string,
): state is KernelMissionOrderIntakeState {
  return KERNEL_MISSION_ORDER_INTAKE_AUTHORIZED_STATES.some(
    (authorizedState) => authorizedState === state,
  );
}

function isKernelMissionOrderIntakeDecisionReason(reason: string): boolean {
  return reason.length > 0 && reason === reason.trim();
}

void createKernelMissionOrderIntakeTransitionEvidence;

interface KernelMissionOrderIntakeWorkflowStateHandlingOutput {
  readonly decision: KernelMissionOrderIntakeFinalDecision;
  readonly evidence: KernelMissionOrderIntakeFinalEvidence;
  readonly acceptedIntake: NormalizedKernelMissionOrderIntake | null;
  readonly rejectionCauses: readonly KernelMissionOrderIntakeFinalCause[];
  readonly readyForWorkflowStateHandling: boolean;
}

function createKernelMissionOrderIntakeWorkflowStateHandlingOutput(
  received: unknown,
): KernelMissionOrderIntakeWorkflowStateHandlingOutput {
  const result = assertKernelMissionOrderIntakeFinalResultContradictionFree(
    finalizeKernelMissionOrderIntake(received),
  );
  const output = Object.freeze({
    decision: result.decision,
    evidence: result.evidence,
    acceptedIntake: result.evidence.normalizedIntake,
    rejectionCauses: result.causes,
    readyForWorkflowStateHandling: result.readyForWorkflowStateHandling,
  });

  assertKernelMissionOrderIntakeWorkflowStateHandlingOutputValid(output);

  return output;
}

function assertKernelMissionOrderIntakeFinalResultContradictionFree(
  result: KernelMissionOrderIntakeFinalResult,
): KernelMissionOrderIntakeFinalResult {
  const acceptedEvidence = kernelMissionOrderIntakeFinalEvidenceSupportsAcceptance(
    result.evidence,
  );
  const allCausesTyped = result.causes.every(isKernelMissionOrderIntakeFinalCause);

  if (!allCausesTyped) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake final result rejects untyped causes.",
    );
  }

  if (result.decision === "ACCEPTED") {
    if (
      !acceptedEvidence ||
      result.causes.length !== 0 ||
      !result.readyForWorkflowStateHandling
    ) {
      throw new Error(
        "KMOI-006: Kernel Mission Order Intake ACCEPTED result is contradictory.",
      );
    }

    return result;
  }

  if (result.decision === "REJECTED") {
    if (result.causes.length === 0) {
      throw new Error(
        "KMOI-007: Kernel Mission Order Intake REJECTED result requires a typed rejection cause.",
      );
    }

    if (acceptedEvidence || result.readyForWorkflowStateHandling) {
      throw new Error(
        "KMOI-006: Kernel Mission Order Intake REJECTED result is contradictory.",
      );
    }

    return result;
  }

  throw new Error(
    "KMOI-006: Kernel Mission Order Intake final result requires ACCEPTED or REJECTED.",
  );
}

function assertKernelMissionOrderIntakeWorkflowStateHandlingOutputValid(
  output: KernelMissionOrderIntakeWorkflowStateHandlingOutput,
): void {
  const accepted = output.decision === "ACCEPTED";
  const rejected = output.decision === "REJECTED";
  const acceptedEvidence = kernelMissionOrderIntakeFinalEvidenceSupportsAcceptance(
    output.evidence,
  );

  if (
    accepted &&
    (
      !acceptedEvidence ||
      output.acceptedIntake === null ||
      output.rejectionCauses.length !== 0 ||
      !output.readyForWorkflowStateHandling
    )
  ) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake workflow output contradicts ACCEPTED.",
    );
  }

  if (
    rejected &&
    (
      acceptedEvidence ||
      output.acceptedIntake !== null ||
      output.rejectionCauses.length === 0 ||
      output.readyForWorkflowStateHandling
    )
  ) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake workflow output contradicts REJECTED.",
    );
  }

  if (!accepted && !rejected) {
    throw new Error(
      "KMOI-006: Kernel Mission Order Intake workflow output requires a final decision.",
    );
  }
}

function kernelMissionOrderIntakeFinalEvidenceSupportsAcceptance(
  evidence: KernelMissionOrderIntakeFinalEvidence,
): boolean {
  return (
    evidence.validationEvidence.valid &&
    evidence.normalizedIntake !== null &&
    evidence.normalizationFailure === null &&
    evidence.evidenceComplete &&
    evidence.evidenceCoherent
  );
}

void createKernelMissionOrderIntakeWorkflowStateHandlingOutput;

type KernelMissionOrderIntakeRejectionCode =
  | "KMOI_REJECTION_UNSTRUCTURED_RECORD"
  | "KMOI_REJECTION_MISSING_FIELD"
  | "KMOI_REJECTION_UNKNOWN_FIELD"
  | "KMOI_REJECTION_INVALID_FIELD"
  | "KMOI_REJECTION_INCOHERENT_EVIDENCE"
  | "KMOI_REJECTION_CONTRADICTORY_DECISION"
  | "KMOI_REJECTION_MISSING_CAUSE";

interface KernelMissionOrderIntakeRejectionCodeEvidence {
  readonly rejectionCodes: readonly KernelMissionOrderIntakeRejectionCode[];
  readonly immutable: true;
}

interface KernelMissionOrderIntakeRejectedDecisionEvidence {
  readonly decision: "REJECTED";
  readonly rejectionCodeEvidence: KernelMissionOrderIntakeRejectionCodeEvidence;
}

const KERNEL_MISSION_ORDER_INTAKE_REJECTION_CODES: readonly KernelMissionOrderIntakeRejectionCode[] =
  Object.freeze([
    "KMOI_REJECTION_UNSTRUCTURED_RECORD",
    "KMOI_REJECTION_MISSING_FIELD",
    "KMOI_REJECTION_UNKNOWN_FIELD",
    "KMOI_REJECTION_INVALID_FIELD",
    "KMOI_REJECTION_INCOHERENT_EVIDENCE",
    "KMOI_REJECTION_CONTRADICTORY_DECISION",
    "KMOI_REJECTION_MISSING_CAUSE",
  ]);

function createKernelMissionOrderIntakeRejectedDecisionEvidence(
  rejectionCodes: readonly string[],
): KernelMissionOrderIntakeRejectedDecisionEvidence {
  return Object.freeze({
    decision: "REJECTED" as const,
    rejectionCodeEvidence: createKernelMissionOrderIntakeRejectionCodeEvidence(
      rejectionCodes,
    ),
  });
}

function createKernelMissionOrderIntakeRejectionCodeEvidence(
  rejectionCodes: readonly string[],
): KernelMissionOrderIntakeRejectionCodeEvidence {
  return Object.freeze({
    rejectionCodes: Object.freeze(
      validateKernelMissionOrderIntakeRejectionCodes(rejectionCodes),
    ),
    immutable: true as const,
  });
}

function validateKernelMissionOrderIntakeRejectionCodes(
  rejectionCodes: readonly string[],
): readonly KernelMissionOrderIntakeRejectionCode[] {
  if (rejectionCodes.length === 0) {
    throw new Error(
      "KMOI-008: Kernel Mission Order Intake REJECTED decisions require at least one authorized REJECTION_CODE.",
    );
  }

  const seen = new Set<string>();
  const validatedRejectionCodes: KernelMissionOrderIntakeRejectionCode[] = [];

  for (const rejectionCode of rejectionCodes) {
    if (!isKernelMissionOrderIntakeRejectionCode(rejectionCode)) {
      throw new Error(
        "KMOI-009: Kernel Mission Order Intake rejects unknown REJECTION_CODE values.",
      );
    }

    if (seen.has(rejectionCode)) {
      throw new Error(
        "KMOI-010: Kernel Mission Order Intake rejects duplicated REJECTION_CODE values.",
      );
    }

    seen.add(rejectionCode);
    validatedRejectionCodes.push(rejectionCode);
  }

  return validatedRejectionCodes;
}

function isKernelMissionOrderIntakeRejectionCode(
  rejectionCode: string,
): rejectionCode is KernelMissionOrderIntakeRejectionCode {
  return KERNEL_MISSION_ORDER_INTAKE_REJECTION_CODES.some(
    (authorizedRejectionCode) => authorizedRejectionCode === rejectionCode,
  );
}

void createKernelMissionOrderIntakeRejectedDecisionEvidence;

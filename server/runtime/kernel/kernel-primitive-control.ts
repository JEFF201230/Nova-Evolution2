type KernelPrimitiveControlId =
  | "runtime"
  | "scheduler"
  | "configuration"
  | "dependency-injection"
  | "messaging"
  | "persistence"
  | "storage"
  | "logging"
  | "resource-management"
  | "clock"
  | "lifecycle";

type KernelPrimitiveControlValidationErrorCode =
  | "KPC-001"
  | "KPC-002"
  | "KPC-003"
  | "KPC-004";

interface KernelPrimitiveControlEvidence {
  readonly expectedPrimitiveIds: readonly KernelPrimitiveControlId[];
  readonly receivedPrimitiveIds: readonly string[];
  readonly missingPrimitiveIds: readonly KernelPrimitiveControlId[];
  readonly unknownPrimitiveIds: readonly string[];
  readonly duplicatePrimitiveIds: readonly string[];
  readonly closed: boolean;
  readonly immutable: boolean;
  readonly valid: boolean;
}

interface KernelPrimitiveControlState {
  readonly primitiveControlId: "KERNEL_PRIMITIVE_CONTROL";
  readonly primitiveIds: readonly KernelPrimitiveControlId[];
  readonly evidence: KernelPrimitiveControlEvidence;
  readonly readyForKernelExecutionFoundation: boolean;
}

class KernelPrimitiveControlValidationError extends Error {
  readonly code: KernelPrimitiveControlValidationErrorCode;
  readonly evidence: KernelPrimitiveControlEvidence;

  constructor(
    code: KernelPrimitiveControlValidationErrorCode,
    message: string,
    evidence: KernelPrimitiveControlEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelPrimitiveControlValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelPrimitiveControlValidationError.prototype);
  }
}

const KERNEL_PRIMITIVE_CONTROL_IDS: readonly KernelPrimitiveControlId[] =
  Object.freeze([
    "runtime",
    "scheduler",
    "configuration",
    "dependency-injection",
    "messaging",
    "persistence",
    "storage",
    "logging",
    "resource-management",
    "clock",
    "lifecycle",
  ]);

function createKernelPrimitiveControlState(
  primitiveIds: readonly string[] = KERNEL_PRIMITIVE_CONTROL_IDS,
): KernelPrimitiveControlState {
  const evidence = createKernelPrimitiveControlEvidence(primitiveIds);

  assertKernelPrimitiveControlEvidenceValid(evidence);

  return Object.freeze({
    primitiveControlId: "KERNEL_PRIMITIVE_CONTROL" as const,
    primitiveIds: KERNEL_PRIMITIVE_CONTROL_IDS,
    evidence,
    readyForKernelExecutionFoundation: true as const,
  });
}

function createKernelPrimitiveControlEvidence(
  primitiveIds: readonly string[],
): KernelPrimitiveControlEvidence {
  const receivedPrimitiveIds = Object.freeze([...primitiveIds].sort());
  const missingPrimitiveIds = Object.freeze(
    KERNEL_PRIMITIVE_CONTROL_IDS.filter(
      (primitiveId) => !receivedPrimitiveIds.includes(primitiveId),
    ),
  );
  const unknownPrimitiveIds = Object.freeze(
    receivedPrimitiveIds.filter(
      (primitiveId) => !isKernelPrimitiveControlId(primitiveId),
    ),
  );
  const duplicatePrimitiveIds = Object.freeze(
    receivedPrimitiveIds.filter(
      (primitiveId, index) => receivedPrimitiveIds.indexOf(primitiveId) !== index,
    ),
  );
  const closed =
    receivedPrimitiveIds.length === KERNEL_PRIMITIVE_CONTROL_IDS.length &&
    missingPrimitiveIds.length === 0 &&
    unknownPrimitiveIds.length === 0 &&
    duplicatePrimitiveIds.length === 0;

  return Object.freeze({
    expectedPrimitiveIds: KERNEL_PRIMITIVE_CONTROL_IDS,
    receivedPrimitiveIds,
    missingPrimitiveIds,
    unknownPrimitiveIds,
    duplicatePrimitiveIds,
    closed,
    immutable: Object.isFrozen(KERNEL_PRIMITIVE_CONTROL_IDS),
    valid: closed && Object.isFrozen(KERNEL_PRIMITIVE_CONTROL_IDS),
  });
}

function assertKernelPrimitiveControlEvidenceValid(
  evidence: KernelPrimitiveControlEvidence,
): void {
  if (evidence.missingPrimitiveIds.length > 0) {
    throw new KernelPrimitiveControlValidationError(
      "KPC-001",
      "Kernel Primitive Control rejects incomplete primitive sets.",
      evidence,
    );
  }

  if (evidence.unknownPrimitiveIds.length > 0) {
    throw new KernelPrimitiveControlValidationError(
      "KPC-002",
      "Kernel Primitive Control rejects unknown primitives.",
      evidence,
    );
  }

  if (evidence.duplicatePrimitiveIds.length > 0) {
    throw new KernelPrimitiveControlValidationError(
      "KPC-003",
      "Kernel Primitive Control rejects duplicate primitives.",
      evidence,
    );
  }

  if (!evidence.closed || !evidence.immutable || !evidence.valid) {
    throw new KernelPrimitiveControlValidationError(
      "KPC-004",
      "Kernel Primitive Control rejects incoherent primitive evidence.",
      evidence,
    );
  }
}

function isKernelPrimitiveControlId(
  primitiveId: string,
): primitiveId is KernelPrimitiveControlId {
  return KERNEL_PRIMITIVE_CONTROL_IDS.some(
    (expectedPrimitiveId) => expectedPrimitiveId === primitiveId,
  );
}

void createKernelPrimitiveControlState;

export {};

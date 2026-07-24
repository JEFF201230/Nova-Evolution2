type KernelExecutionTraceabilityLinkId =
  | "PRIMITIVES_TO_MISSION_ORDER_CYCLE"
  | "MISSION_ORDER_CYCLE_TO_RUNTIME_CONTEXT"
  | "RUNTIME_CONTEXT_TO_RUNTIME_EXECUTION"
  | "RUNTIME_EXECUTION_TO_WORKFLOW_EXECUTION"
  | "WORKFLOW_EXECUTION_TO_DECISION_REPORTING"
  | "DECISION_REPORTING_TO_TRACEABILITY_INTEGRATION";

type KernelExecutionTraceabilityValidationErrorCode =
  | "KET-001"
  | "KET-002"
  | "KET-003"
  | "KET-004";

interface KernelExecutionTraceabilityLink {
  readonly linkId: KernelExecutionTraceabilityLinkId;
  readonly from: string;
  readonly to: string;
}

interface KernelExecutionTraceabilityEvidence {
  readonly expectedLinkIds: readonly KernelExecutionTraceabilityLinkId[];
  readonly receivedLinkIds: readonly string[];
  readonly missingLinkIds: readonly KernelExecutionTraceabilityLinkId[];
  readonly unknownLinkIds: readonly string[];
  readonly duplicateLinkIds: readonly string[];
  readonly complete: boolean;
  readonly valid: boolean;
}

interface KernelExecutionTraceabilityGraph {
  readonly traceabilityId: "KERNEL_EXECUTION_TRACEABILITY";
  readonly links: readonly KernelExecutionTraceabilityLink[];
  readonly evidence: KernelExecutionTraceabilityEvidence;
  readonly readyForRuntimeEvidence: boolean;
}

class KernelExecutionTraceabilityValidationError extends Error {
  readonly code: KernelExecutionTraceabilityValidationErrorCode;
  readonly evidence: KernelExecutionTraceabilityEvidence;

  constructor(
    code: KernelExecutionTraceabilityValidationErrorCode,
    message: string,
    evidence: KernelExecutionTraceabilityEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelExecutionTraceabilityValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelExecutionTraceabilityValidationError.prototype);
  }
}

const KERNEL_EXECUTION_TRACEABILITY_LINKS: readonly KernelExecutionTraceabilityLink[] =
  Object.freeze([
    Object.freeze({
      linkId: "PRIMITIVES_TO_MISSION_ORDER_CYCLE",
      from: "KERNEL_PRIMITIVE_CONTROL",
      to: "KERNEL_MISSION_ORDER_CYCLE",
    }),
    Object.freeze({
      linkId: "MISSION_ORDER_CYCLE_TO_RUNTIME_CONTEXT",
      from: "KERNEL_MISSION_ORDER_CYCLE",
      to: "KERNEL_RUNTIME_CONTEXT",
    }),
    Object.freeze({
      linkId: "RUNTIME_CONTEXT_TO_RUNTIME_EXECUTION",
      from: "KERNEL_RUNTIME_CONTEXT",
      to: "KERNEL_RUNTIME_EXECUTION",
    }),
    Object.freeze({
      linkId: "RUNTIME_EXECUTION_TO_WORKFLOW_EXECUTION",
      from: "KERNEL_RUNTIME_EXECUTION",
      to: "WORKFLOW_EXECUTION_PREPARED",
    }),
    Object.freeze({
      linkId: "WORKFLOW_EXECUTION_TO_DECISION_REPORTING",
      from: "WORKFLOW_EXECUTION_PREPARED",
      to: "KERNEL_DECISION_REPORTING_INTEGRATION",
    }),
    Object.freeze({
      linkId: "DECISION_REPORTING_TO_TRACEABILITY_INTEGRATION",
      from: "KERNEL_DECISION_REPORTING_INTEGRATION",
      to: "KERNEL_TRACEABILITY_INTEGRATION",
    }),
  ]);

const KERNEL_EXECUTION_TRACEABILITY_LINK_IDS: readonly KernelExecutionTraceabilityLinkId[] =
  Object.freeze(KERNEL_EXECUTION_TRACEABILITY_LINKS.map((link) => link.linkId));

function createKernelExecutionTraceability(
  links: readonly KernelExecutionTraceabilityLink[] = KERNEL_EXECUTION_TRACEABILITY_LINKS,
): KernelExecutionTraceabilityGraph {
  const evidence = createKernelExecutionTraceabilityEvidence(links);

  assertKernelExecutionTraceabilityEvidenceValid(evidence);

  return Object.freeze({
    traceabilityId: "KERNEL_EXECUTION_TRACEABILITY" as const,
    links: Object.freeze([...links]),
    evidence,
    readyForRuntimeEvidence: true as const,
  });
}

function createKernelExecutionTraceabilityEvidence(
  links: readonly KernelExecutionTraceabilityLink[],
): KernelExecutionTraceabilityEvidence {
  const receivedLinkIds = Object.freeze(links.map((link) => String(link.linkId)).sort());
  const missingLinkIds = Object.freeze(
    KERNEL_EXECUTION_TRACEABILITY_LINK_IDS.filter(
      (linkId) => !receivedLinkIds.includes(linkId),
    ),
  );
  const unknownLinkIds = Object.freeze(
    receivedLinkIds.filter((linkId) => !isKernelExecutionTraceabilityLinkId(linkId)),
  );
  const duplicateLinkIds = Object.freeze(
    receivedLinkIds.filter(
      (linkId, index) => receivedLinkIds.indexOf(linkId) !== index,
    ),
  );
  const complete =
    links.length === KERNEL_EXECUTION_TRACEABILITY_LINKS.length &&
    links.every(isKernelExecutionTraceabilityLinkComplete);

  return Object.freeze({
    expectedLinkIds: KERNEL_EXECUTION_TRACEABILITY_LINK_IDS,
    receivedLinkIds,
    missingLinkIds,
    unknownLinkIds,
    duplicateLinkIds,
    complete,
    valid:
      missingLinkIds.length === 0 &&
      unknownLinkIds.length === 0 &&
      duplicateLinkIds.length === 0 &&
      complete,
  });
}

function assertKernelExecutionTraceabilityEvidenceValid(
  evidence: KernelExecutionTraceabilityEvidence,
): void {
  if (evidence.missingLinkIds.length > 0) {
    throw new KernelExecutionTraceabilityValidationError(
      "KET-001",
      "Kernel Execution Traceability rejects incomplete link sets.",
      evidence,
    );
  }

  if (evidence.unknownLinkIds.length > 0) {
    throw new KernelExecutionTraceabilityValidationError(
      "KET-002",
      "Kernel Execution Traceability rejects unknown links.",
      evidence,
    );
  }

  if (evidence.duplicateLinkIds.length > 0) {
    throw new KernelExecutionTraceabilityValidationError(
      "KET-003",
      "Kernel Execution Traceability rejects duplicate links.",
      evidence,
    );
  }

  if (!evidence.complete || !evidence.valid) {
    throw new KernelExecutionTraceabilityValidationError(
      "KET-004",
      "Kernel Execution Traceability rejects incoherent links.",
      evidence,
    );
  }
}

function isKernelExecutionTraceabilityLinkComplete(
  candidate: KernelExecutionTraceabilityLink,
): boolean {
  return KERNEL_EXECUTION_TRACEABILITY_LINKS.some(
    (link) =>
      link.linkId === candidate.linkId &&
      link.from === candidate.from &&
      link.to === candidate.to,
  );
}

function isKernelExecutionTraceabilityLinkId(
  linkId: string,
): linkId is KernelExecutionTraceabilityLinkId {
  return KERNEL_EXECUTION_TRACEABILITY_LINK_IDS.some(
    (expectedLinkId) => expectedLinkId === linkId,
  );
}

void createKernelExecutionTraceability;

export {};

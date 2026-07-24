type KernelTraceabilityNodeId =
  | "MISSION_ORDER_INTAKE"
  | "WORKFLOW_STATE_HANDLING"
  | "DECISION_FLOW"
  | "REPORTING_FLOW";

type KernelTraceabilityLinkId =
  | "MISSION_ORDER_INTAKE_TO_WORKFLOW_STATE_HANDLING"
  | "WORKFLOW_STATE_HANDLING_TO_DECISION_FLOW"
  | "DECISION_FLOW_TO_REPORTING_FLOW";

type KernelTraceabilityValidationErrorCode =
  | "KTR-001"
  | "KTR-002"
  | "KTR-003"
  | "KTR-004";

interface KernelTraceabilityLink {
  readonly linkId: KernelTraceabilityLinkId;
  readonly from: KernelTraceabilityNodeId;
  readonly to: KernelTraceabilityNodeId;
}

interface KernelTraceabilityEvidence {
  readonly linksReceived: boolean;
  readonly expectedLinkIds: readonly KernelTraceabilityLinkId[];
  readonly receivedLinkIds: readonly string[];
  readonly missingLinkIds: readonly KernelTraceabilityLinkId[];
  readonly unknownLinkIds: readonly string[];
  readonly duplicateLinkIds: readonly string[];
  readonly incompleteLinkIds: readonly string[];
  readonly valid: boolean;
}

interface KernelTraceabilityGraph {
  readonly nodes: readonly KernelTraceabilityNodeId[];
  readonly links: readonly KernelTraceabilityLink[];
  readonly evidence: KernelTraceabilityEvidence;
}

class KernelTraceabilityValidationError extends Error {
  readonly code: KernelTraceabilityValidationErrorCode;
  readonly evidence: KernelTraceabilityEvidence;

  constructor(
    code: KernelTraceabilityValidationErrorCode,
    message: string,
    evidence: KernelTraceabilityEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelTraceabilityValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelTraceabilityValidationError.prototype);
  }
}

const KERNEL_TRACEABILITY_NODES: readonly KernelTraceabilityNodeId[] =
  Object.freeze([
    "MISSION_ORDER_INTAKE",
    "WORKFLOW_STATE_HANDLING",
    "DECISION_FLOW",
    "REPORTING_FLOW",
  ]);

const KERNEL_TRACEABILITY_LINKS: readonly KernelTraceabilityLink[] =
  Object.freeze([
    Object.freeze({
      linkId: "MISSION_ORDER_INTAKE_TO_WORKFLOW_STATE_HANDLING",
      from: "MISSION_ORDER_INTAKE",
      to: "WORKFLOW_STATE_HANDLING",
    }),
    Object.freeze({
      linkId: "WORKFLOW_STATE_HANDLING_TO_DECISION_FLOW",
      from: "WORKFLOW_STATE_HANDLING",
      to: "DECISION_FLOW",
    }),
    Object.freeze({
      linkId: "DECISION_FLOW_TO_REPORTING_FLOW",
      from: "DECISION_FLOW",
      to: "REPORTING_FLOW",
    }),
  ]);

const KERNEL_TRACEABILITY_LINK_IDS: readonly KernelTraceabilityLinkId[] =
  Object.freeze(KERNEL_TRACEABILITY_LINKS.map((link) => link.linkId));

function createKernelTraceabilityGraph(
  links: unknown = KERNEL_TRACEABILITY_LINKS,
): KernelTraceabilityGraph {
  const evidence = createKernelTraceabilityEvidence(links);

  assertKernelTraceabilityEvidenceValid(evidence);

  const receivedLinks = links as readonly KernelTraceabilityLink[];
  const orderedLinks = KERNEL_TRACEABILITY_LINK_IDS.map((linkId) => {
    const link = receivedLinks.find((candidate) => candidate.linkId === linkId);

    if (link === undefined) {
      throw new KernelTraceabilityValidationError(
        "KTR-002",
        "Kernel Traceability requires complete deterministic links.",
        evidence,
      );
    }

    return Object.freeze({
      linkId: link.linkId,
      from: link.from,
      to: link.to,
    });
  });

  return Object.freeze({
    nodes: KERNEL_TRACEABILITY_NODES,
    links: Object.freeze(orderedLinks),
    evidence,
  });
}

function createKernelTraceabilityEvidence(links: unknown): KernelTraceabilityEvidence {
  if (!Array.isArray(links)) {
    return createKernelTraceabilityEvidenceRecord({
      linksReceived: false,
      receivedLinkIds: Object.freeze([]),
      missingLinkIds: KERNEL_TRACEABILITY_LINK_IDS,
      unknownLinkIds: Object.freeze([]),
      duplicateLinkIds: Object.freeze([]),
      incompleteLinkIds: Object.freeze([]),
    });
  }

  const receivedLinkIds = Object.freeze(
    links
      .filter(isKernelTraceabilityRecord)
      .map((link) => String(link.linkId))
      .sort(),
  );
  const missingLinkIds = Object.freeze(
    KERNEL_TRACEABILITY_LINK_IDS.filter(
      (linkId) => !receivedLinkIds.includes(linkId),
    ),
  );
  const unknownLinkIds = Object.freeze(
    receivedLinkIds.filter((linkId) => !isKernelTraceabilityLinkId(linkId)),
  );
  const duplicateLinkIds = Object.freeze(
    receivedLinkIds.filter(
      (linkId, index) => receivedLinkIds.indexOf(linkId) !== index,
    ),
  );
  const incompleteLinkIds = Object.freeze(
    links
      .filter(isKernelTraceabilityRecord)
      .filter((link) => !isKernelTraceabilityCompleteLink(link))
      .map((link) => String(link.linkId)),
  );

  return createKernelTraceabilityEvidenceRecord({
    linksReceived: true,
    receivedLinkIds,
    missingLinkIds,
    unknownLinkIds,
    duplicateLinkIds,
    incompleteLinkIds,
  });
}

function createKernelTraceabilityEvidenceRecord(fields: {
  readonly linksReceived: boolean;
  readonly receivedLinkIds: readonly string[];
  readonly missingLinkIds: readonly KernelTraceabilityLinkId[];
  readonly unknownLinkIds: readonly string[];
  readonly duplicateLinkIds: readonly string[];
  readonly incompleteLinkIds: readonly string[];
}): KernelTraceabilityEvidence {
  return Object.freeze({
    linksReceived: fields.linksReceived,
    expectedLinkIds: KERNEL_TRACEABILITY_LINK_IDS,
    receivedLinkIds: fields.receivedLinkIds,
    missingLinkIds: fields.missingLinkIds,
    unknownLinkIds: fields.unknownLinkIds,
    duplicateLinkIds: fields.duplicateLinkIds,
    incompleteLinkIds: fields.incompleteLinkIds,
    valid:
      fields.linksReceived &&
      fields.missingLinkIds.length === 0 &&
      fields.unknownLinkIds.length === 0 &&
      fields.duplicateLinkIds.length === 0 &&
      fields.incompleteLinkIds.length === 0,
  });
}

function assertKernelTraceabilityEvidenceValid(
  evidence: KernelTraceabilityEvidence,
): void {
  if (!evidence.linksReceived) {
    throw new KernelTraceabilityValidationError(
      "KTR-001",
      "Kernel Traceability requires deterministic links.",
      evidence,
    );
  }

  if (evidence.missingLinkIds.length > 0) {
    throw new KernelTraceabilityValidationError(
      "KTR-002",
      "Kernel Traceability rejects incomplete link sets.",
      evidence,
    );
  }

  if (evidence.unknownLinkIds.length > 0) {
    throw new KernelTraceabilityValidationError(
      "KTR-003",
      "Kernel Traceability rejects unknown links.",
      evidence,
    );
  }

  if (
    evidence.duplicateLinkIds.length > 0 ||
    evidence.incompleteLinkIds.length > 0 ||
    !evidence.valid
  ) {
    throw new KernelTraceabilityValidationError(
      "KTR-004",
      "Kernel Traceability rejects incoherent link evidence.",
      evidence,
    );
  }
}

function isKernelTraceabilityCompleteLink(
  link: Record<string, unknown>,
): link is KernelTraceabilityLink {
  return (
    isKernelTraceabilityLinkId(link.linkId) &&
    isKernelTraceabilityNodeId(link.from) &&
    isKernelTraceabilityNodeId(link.to) &&
    kernelTraceabilityLinkEndpointsMatch(link.linkId, link.from, link.to)
  );
}

function kernelTraceabilityLinkEndpointsMatch(
  linkId: KernelTraceabilityLinkId,
  from: KernelTraceabilityNodeId,
  to: KernelTraceabilityNodeId,
): boolean {
  return KERNEL_TRACEABILITY_LINKS.some(
    (link) => link.linkId === linkId && link.from === from && link.to === to,
  );
}

function isKernelTraceabilityRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isKernelTraceabilityLinkId(
  linkId: unknown,
): linkId is KernelTraceabilityLinkId {
  return KERNEL_TRACEABILITY_LINK_IDS.some(
    (expectedLinkId) => expectedLinkId === linkId,
  );
}

function isKernelTraceabilityNodeId(
  nodeId: unknown,
): nodeId is KernelTraceabilityNodeId {
  return KERNEL_TRACEABILITY_NODES.some(
    (expectedNodeId) => expectedNodeId === nodeId,
  );
}

void createKernelTraceabilityGraph;

export {};

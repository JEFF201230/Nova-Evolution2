type KernelCompositionFoundationComponentId =
  | "KERNEL_MISSION_COMPOSITION"
  | "KERNEL_WORKFLOW_COMPOSITION"
  | "KERNEL_RUNTIME_COMPOSITION"
  | "KERNEL_DECISION_REPORTING_COMPOSITION"
  | "KERNEL_TRACEABILITY_COMPOSITION"
  | "KERNEL_EXECUTION_FLOW_CONTROL";

type KernelCompositionFoundationValidationErrorCode =
  | "KCF-001"
  | "KCF-002"
  | "KCF-003"
  | "KCF-004";

interface KernelCompositionFoundationEvidence {
  readonly expectedComponentIds: readonly KernelCompositionFoundationComponentId[];
  readonly receivedComponentIds: readonly string[];
  readonly missingComponentIds: readonly KernelCompositionFoundationComponentId[];
  readonly unknownComponentIds: readonly string[];
  readonly duplicateComponentIds: readonly string[];
  readonly componentsReady: boolean;
  readonly coherent: boolean;
  readonly valid: boolean;
}

interface KernelCompositionFoundation {
  readonly foundationId: "KERNEL_COMPOSITION_FOUNDATION";
  readonly componentIds: readonly KernelCompositionFoundationComponentId[];
  readonly missionComposition: unknown;
  readonly workflowComposition: unknown;
  readonly runtimeComposition: unknown;
  readonly decisionReportingComposition: unknown;
  readonly traceabilityComposition: unknown;
  readonly executionFlowControl: unknown;
  readonly evidence: KernelCompositionFoundationEvidence;
  readonly readyForKernelExecutionFoundation: boolean;
}

class KernelCompositionFoundationValidationError extends Error {
  readonly code: KernelCompositionFoundationValidationErrorCode;
  readonly evidence: KernelCompositionFoundationEvidence;

  constructor(
    code: KernelCompositionFoundationValidationErrorCode,
    message: string,
    evidence: KernelCompositionFoundationEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelCompositionFoundationValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelCompositionFoundationValidationError.prototype);
  }
}

const KERNEL_COMPOSITION_FOUNDATION_COMPONENT_IDS: readonly KernelCompositionFoundationComponentId[] =
  Object.freeze([
    "KERNEL_MISSION_COMPOSITION",
    "KERNEL_WORKFLOW_COMPOSITION",
    "KERNEL_RUNTIME_COMPOSITION",
    "KERNEL_DECISION_REPORTING_COMPOSITION",
    "KERNEL_TRACEABILITY_COMPOSITION",
    "KERNEL_EXECUTION_FLOW_CONTROL",
  ]);

function createKernelCompositionFoundation(
  missionComposition: unknown,
  workflowComposition: unknown,
  runtimeComposition: unknown,
  decisionReportingComposition: unknown,
  traceabilityComposition: unknown,
  executionFlowControl: unknown,
): KernelCompositionFoundation {
  const components = Object.freeze([
    missionComposition,
    workflowComposition,
    runtimeComposition,
    decisionReportingComposition,
    traceabilityComposition,
    executionFlowControl,
  ]);
  const evidence = createKernelCompositionFoundationEvidence(components);

  assertKernelCompositionFoundationEvidenceValid(evidence);

  return Object.freeze({
    foundationId: "KERNEL_COMPOSITION_FOUNDATION" as const,
    componentIds: KERNEL_COMPOSITION_FOUNDATION_COMPONENT_IDS,
    missionComposition,
    workflowComposition,
    runtimeComposition,
    decisionReportingComposition,
    traceabilityComposition,
    executionFlowControl,
    evidence,
    readyForKernelExecutionFoundation: true as const,
  });
}

function createKernelCompositionFoundationEvidence(
  components: readonly unknown[],
): KernelCompositionFoundationEvidence {
  const receivedComponentIds = Object.freeze(
    components
      .filter(isKernelCompositionFoundationRecord)
      .map(kernelCompositionFoundationComponentId)
      .filter((componentId): componentId is string => componentId !== null)
      .sort(),
  );
  const missingComponentIds = Object.freeze(
    KERNEL_COMPOSITION_FOUNDATION_COMPONENT_IDS.filter(
      (componentId) => !receivedComponentIds.includes(componentId),
    ),
  );
  const unknownComponentIds = Object.freeze(
    receivedComponentIds.filter(
      (componentId) => !isKernelCompositionFoundationComponentId(componentId),
    ),
  );
  const duplicateComponentIds = Object.freeze(
    receivedComponentIds.filter(
      (componentId, index) => receivedComponentIds.indexOf(componentId) !== index,
    ),
  );
  const componentsReady =
    components.length === KERNEL_COMPOSITION_FOUNDATION_COMPONENT_IDS.length &&
    components.every(kernelCompositionFoundationComponentReady);
  const coherent =
    componentsReady &&
    isKernelCompositionFoundationRecord(components[5]) &&
    components[5].flowId === "KERNEL_EXECUTION_FLOW_CONTROL";

  return Object.freeze({
    expectedComponentIds: KERNEL_COMPOSITION_FOUNDATION_COMPONENT_IDS,
    receivedComponentIds,
    missingComponentIds,
    unknownComponentIds,
    duplicateComponentIds,
    componentsReady,
    coherent,
    valid:
      missingComponentIds.length === 0 &&
      unknownComponentIds.length === 0 &&
      duplicateComponentIds.length === 0 &&
      componentsReady &&
      coherent,
  });
}

function assertKernelCompositionFoundationEvidenceValid(
  evidence: KernelCompositionFoundationEvidence,
): void {
  if (evidence.missingComponentIds.length > 0) {
    throw new KernelCompositionFoundationValidationError(
      "KCF-001",
      "Kernel Composition Foundation rejects incomplete component sets.",
      evidence,
    );
  }

  if (evidence.unknownComponentIds.length > 0) {
    throw new KernelCompositionFoundationValidationError(
      "KCF-002",
      "Kernel Composition Foundation rejects unknown components.",
      evidence,
    );
  }

  if (evidence.duplicateComponentIds.length > 0) {
    throw new KernelCompositionFoundationValidationError(
      "KCF-003",
      "Kernel Composition Foundation rejects duplicate components.",
      evidence,
    );
  }

  if (!evidence.componentsReady || !evidence.coherent || !evidence.valid) {
    throw new KernelCompositionFoundationValidationError(
      "KCF-004",
      "Kernel Composition Foundation rejects incoherent composition evidence.",
      evidence,
    );
  }
}

function kernelCompositionFoundationComponentReady(component: unknown): boolean {
  if (!isKernelCompositionFoundationRecord(component)) {
    return false;
  }

  const componentId = kernelCompositionFoundationComponentId(component);

  return (
    isKernelCompositionFoundationComponentId(componentId) &&
    (
      component.readyForKernelComposition === true ||
      component.readyForContinuousKernelCampaign === true
    )
  );
}

function kernelCompositionFoundationComponentId(
  component: Record<string, unknown>,
): string | null {
  if (component.compositionId === "KERNEL_MISSION_COMPOSITION") {
    return "KERNEL_MISSION_COMPOSITION";
  }

  if (component.compositionId === "KERNEL_WORKFLOW_COMPOSITION") {
    return "KERNEL_WORKFLOW_COMPOSITION";
  }

  if (component.compositionId === "KERNEL_RUNTIME_COMPOSITION") {
    return "KERNEL_RUNTIME_COMPOSITION";
  }

  if (component.compositionId === "KERNEL_DECISION_REPORTING_COMPOSITION") {
    return "KERNEL_DECISION_REPORTING_COMPOSITION";
  }

  if (component.compositionId === "KERNEL_TRACEABILITY_COMPOSITION") {
    return "KERNEL_TRACEABILITY_COMPOSITION";
  }

  if (component.flowId === "KERNEL_EXECUTION_FLOW_CONTROL") {
    return "KERNEL_EXECUTION_FLOW_CONTROL";
  }

  return null;
}

function isKernelCompositionFoundationComponentId(
  componentId: unknown,
): componentId is KernelCompositionFoundationComponentId {
  return KERNEL_COMPOSITION_FOUNDATION_COMPONENT_IDS.some(
    (expectedComponentId) => expectedComponentId === componentId,
  );
}

function isKernelCompositionFoundationRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelCompositionFoundation;

export {};

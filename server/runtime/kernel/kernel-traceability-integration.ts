type KernelTraceabilityIntegrationId = "KERNEL_TRACEABILITY_INTEGRATION";

type KernelTraceabilityIntegrationComponentId =
  | "KERNEL_RUNTIME_CONTEXT"
  | "KERNEL_RUNTIME_EXECUTION"
  | "WORKFLOW_EXECUTION_PREPARED"
  | "KERNEL_DECISION_REPORTING_INTEGRATION"
  | "KERNEL_TRACEABILITY_GRAPH";

type KernelTraceabilityIntegrationValidationErrorCode =
  | "KTI-001"
  | "KTI-002"
  | "KTI-003"
  | "KTI-004";

interface KernelTraceabilityIntegrationEvidence {
  readonly receivedComponentIds: readonly string[];
  readonly expectedComponentIds: readonly KernelTraceabilityIntegrationComponentId[];
  readonly missingComponentIds: readonly KernelTraceabilityIntegrationComponentId[];
  readonly unknownComponentIds: readonly string[];
  readonly duplicateComponentIds: readonly string[];
  readonly componentsReady: boolean;
  readonly traceabilityGraphReady: boolean;
  readonly valid: boolean;
}

interface KernelTraceabilityIntegration {
  readonly integrationId: KernelTraceabilityIntegrationId;
  readonly componentIds: readonly KernelTraceabilityIntegrationComponentId[];
  readonly runtimeContext: unknown;
  readonly runtimeExecution: unknown;
  readonly workflowExecution: unknown;
  readonly decisionReportingIntegration: unknown;
  readonly traceabilityGraph: unknown;
  readonly evidence: KernelTraceabilityIntegrationEvidence;
  readonly readyForRuntimeEvidence: boolean;
}

class KernelTraceabilityIntegrationValidationError extends Error {
  readonly code: KernelTraceabilityIntegrationValidationErrorCode;
  readonly evidence: KernelTraceabilityIntegrationEvidence;

  constructor(
    code: KernelTraceabilityIntegrationValidationErrorCode,
    message: string,
    evidence: KernelTraceabilityIntegrationEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelTraceabilityIntegrationValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelTraceabilityIntegrationValidationError.prototype);
  }
}

const KERNEL_TRACEABILITY_INTEGRATION_COMPONENT_IDS: readonly KernelTraceabilityIntegrationComponentId[] =
  Object.freeze([
    "KERNEL_RUNTIME_CONTEXT",
    "KERNEL_RUNTIME_EXECUTION",
    "WORKFLOW_EXECUTION_PREPARED",
    "KERNEL_DECISION_REPORTING_INTEGRATION",
    "KERNEL_TRACEABILITY_GRAPH",
  ]);

function createKernelTraceabilityIntegration(
  runtimeContext: unknown,
  runtimeExecution: unknown,
  workflowExecution: unknown,
  decisionReportingIntegration: unknown,
  traceabilityGraph: unknown,
): KernelTraceabilityIntegration {
  const components = Object.freeze([
    runtimeContext,
    runtimeExecution,
    workflowExecution,
    decisionReportingIntegration,
    traceabilityGraph,
  ]);
  const evidence = createKernelTraceabilityIntegrationEvidence(components);

  assertKernelTraceabilityIntegrationEvidenceValid(evidence);

  return Object.freeze({
    integrationId: "KERNEL_TRACEABILITY_INTEGRATION" as const,
    componentIds: KERNEL_TRACEABILITY_INTEGRATION_COMPONENT_IDS,
    runtimeContext,
    runtimeExecution,
    workflowExecution,
    decisionReportingIntegration,
    traceabilityGraph,
    evidence,
    readyForRuntimeEvidence: true as const,
  });
}

function createKernelTraceabilityIntegrationEvidence(
  components: readonly unknown[],
): KernelTraceabilityIntegrationEvidence {
  const receivedComponentIds = Object.freeze(
    components
      .filter(isKernelTraceabilityIntegrationRecord)
      .map(kernelTraceabilityIntegrationComponentId)
      .filter((componentId): componentId is string => componentId !== null)
      .sort(),
  );
  const missingComponentIds = Object.freeze(
    KERNEL_TRACEABILITY_INTEGRATION_COMPONENT_IDS.filter(
      (componentId) => !receivedComponentIds.includes(componentId),
    ),
  );
  const unknownComponentIds = Object.freeze(
    receivedComponentIds.filter(
      (componentId) => !isKernelTraceabilityIntegrationComponentId(componentId),
    ),
  );
  const duplicateComponentIds = Object.freeze(
    receivedComponentIds.filter(
      (componentId, index) => receivedComponentIds.indexOf(componentId) !== index,
    ),
  );
  const componentsReady = components.every(kernelTraceabilityIntegrationComponentReady);
  const traceabilityGraphReady = components.some(
    (component) =>
      isKernelTraceabilityIntegrationRecord(component) &&
      kernelTraceabilityIntegrationComponentId(component) === "KERNEL_TRACEABILITY_GRAPH" &&
      component.evidence !== null &&
      component.evidence !== undefined,
  );

  return Object.freeze({
    receivedComponentIds,
    expectedComponentIds: KERNEL_TRACEABILITY_INTEGRATION_COMPONENT_IDS,
    missingComponentIds,
    unknownComponentIds,
    duplicateComponentIds,
    componentsReady,
    traceabilityGraphReady,
    valid:
      missingComponentIds.length === 0 &&
      unknownComponentIds.length === 0 &&
      duplicateComponentIds.length === 0 &&
      componentsReady &&
      traceabilityGraphReady,
  });
}

function assertKernelTraceabilityIntegrationEvidenceValid(
  evidence: KernelTraceabilityIntegrationEvidence,
): void {
  if (evidence.duplicateComponentIds.length > 0) {
    throw new KernelTraceabilityIntegrationValidationError(
      "KTI-003",
      "Kernel Traceability Integration rejects duplicate components.",
      evidence,
    );
  }

  if (evidence.missingComponentIds.length > 0) {
    throw new KernelTraceabilityIntegrationValidationError(
      "KTI-001",
      "Kernel Traceability Integration rejects incomplete component sets.",
      evidence,
    );
  }

  if (evidence.unknownComponentIds.length > 0) {
    throw new KernelTraceabilityIntegrationValidationError(
      "KTI-002",
      "Kernel Traceability Integration rejects unknown components.",
      evidence,
    );
  }

  if (!evidence.componentsReady || !evidence.traceabilityGraphReady || !evidence.valid) {
    throw new KernelTraceabilityIntegrationValidationError(
      "KTI-004",
      "Kernel Traceability Integration rejects incoherent runtime evidence.",
      evidence,
    );
  }
}

function kernelTraceabilityIntegrationComponentReady(component: unknown): boolean {
  if (!isKernelTraceabilityIntegrationRecord(component)) {
    return false;
  }

  const componentId = kernelTraceabilityIntegrationComponentId(component);

  if (!isKernelTraceabilityIntegrationComponentId(componentId)) {
    return false;
  }

  return (
    component.readyForRuntimeExecution === true ||
    component.readyForWorkflowExecution === true ||
    component.readyForDecisionReportingIntegration === true ||
    component.readyForTraceabilityIntegration === true ||
    component.readyForRuntimeEvidence === true ||
    (
      component.nodes !== null &&
      component.nodes !== undefined &&
      component.links !== null &&
      component.links !== undefined &&
      component.evidence !== null &&
      component.evidence !== undefined
    )
  );
}

function kernelTraceabilityIntegrationComponentId(
  component: Record<string, unknown>,
): string | null {
  if (component.executionId === "KERNEL_RUNTIME_EXECUTION") {
    return "KERNEL_RUNTIME_EXECUTION";
  }

  if (component.contextId === "KERNEL_RUNTIME_CONTEXT") {
    return "KERNEL_RUNTIME_CONTEXT";
  }

  if (component.workflowExecutionStateId === "WORKFLOW_EXECUTION_PREPARED") {
    return "WORKFLOW_EXECUTION_PREPARED";
  }

  if (component.integrationId === "KERNEL_DECISION_REPORTING_INTEGRATION") {
    return "KERNEL_DECISION_REPORTING_INTEGRATION";
  }

  if (
    component.nodes !== null &&
    component.nodes !== undefined &&
    component.links !== null &&
    component.links !== undefined
  ) {
    return "KERNEL_TRACEABILITY_GRAPH";
  }

  return null;
}

function isKernelTraceabilityIntegrationComponentId(
  componentId: unknown,
): componentId is KernelTraceabilityIntegrationComponentId {
  return KERNEL_TRACEABILITY_INTEGRATION_COMPONENT_IDS.some(
    (expectedComponentId) => expectedComponentId === componentId,
  );
}

function isKernelTraceabilityIntegrationRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelTraceabilityIntegration;

export {};

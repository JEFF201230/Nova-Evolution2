type KernelExecutionFlowComponentId =
  | "KERNEL_PRIMITIVE_CONTROL"
  | "KERNEL_MISSION_ORDER_CYCLE"
  | "KERNEL_RUNTIME_CONTEXT"
  | "KERNEL_RUNTIME_EXECUTION"
  | "WORKFLOW_EXECUTION_PREPARED"
  | "KERNEL_DECISION_REPORTING_INTEGRATION"
  | "KERNEL_TRACEABILITY_INTEGRATION";

type KernelExecutionFlowValidationErrorCode =
  | "KEFC-001"
  | "KEFC-002"
  | "KEFC-003"
  | "KEFC-004";

interface KernelExecutionFlowEvidence {
  readonly expectedComponentIds: readonly KernelExecutionFlowComponentId[];
  readonly receivedComponentIds: readonly string[];
  readonly missingComponentIds: readonly KernelExecutionFlowComponentId[];
  readonly duplicateComponentIds: readonly string[];
  readonly unknownComponentIds: readonly string[];
  readonly componentsReady: boolean;
  readonly valid: boolean;
}

interface KernelExecutionFlowState {
  readonly flowId: "KERNEL_EXECUTION_FLOW_CONTROL";
  readonly componentIds: readonly KernelExecutionFlowComponentId[];
  readonly evidence: KernelExecutionFlowEvidence;
  readonly readyForContinuousKernelCampaign: boolean;
}

class KernelExecutionFlowValidationError extends Error {
  readonly code: KernelExecutionFlowValidationErrorCode;
  readonly evidence: KernelExecutionFlowEvidence;

  constructor(
    code: KernelExecutionFlowValidationErrorCode,
    message: string,
    evidence: KernelExecutionFlowEvidence,
  ) {
    super(`${code}: ${message}`);
    this.name = "KernelExecutionFlowValidationError";
    this.code = code;
    this.evidence = evidence;
    Object.setPrototypeOf(this, KernelExecutionFlowValidationError.prototype);
  }
}

const KERNEL_EXECUTION_FLOW_COMPONENT_IDS: readonly KernelExecutionFlowComponentId[] =
  Object.freeze([
    "KERNEL_PRIMITIVE_CONTROL",
    "KERNEL_MISSION_ORDER_CYCLE",
    "KERNEL_RUNTIME_CONTEXT",
    "KERNEL_RUNTIME_EXECUTION",
    "WORKFLOW_EXECUTION_PREPARED",
    "KERNEL_DECISION_REPORTING_INTEGRATION",
    "KERNEL_TRACEABILITY_INTEGRATION",
  ]);

function createKernelExecutionFlowControl(
  components: readonly unknown[],
): KernelExecutionFlowState {
  const evidence = createKernelExecutionFlowEvidence(components);

  assertKernelExecutionFlowEvidenceValid(evidence);

  return Object.freeze({
    flowId: "KERNEL_EXECUTION_FLOW_CONTROL" as const,
    componentIds: KERNEL_EXECUTION_FLOW_COMPONENT_IDS,
    evidence,
    readyForContinuousKernelCampaign: true as const,
  });
}

function createKernelExecutionFlowEvidence(
  components: readonly unknown[],
): KernelExecutionFlowEvidence {
  const receivedComponentIds = Object.freeze(
    components
      .filter(isKernelExecutionFlowRecord)
      .map(kernelExecutionFlowComponentId)
      .filter((componentId): componentId is string => componentId !== null)
      .sort(),
  );
  const missingComponentIds = Object.freeze(
    KERNEL_EXECUTION_FLOW_COMPONENT_IDS.filter(
      (componentId) => !receivedComponentIds.includes(componentId),
    ),
  );
  const duplicateComponentIds = Object.freeze(
    receivedComponentIds.filter(
      (componentId, index) => receivedComponentIds.indexOf(componentId) !== index,
    ),
  );
  const unknownComponentIds = Object.freeze(
    receivedComponentIds.filter(
      (componentId) => !isKernelExecutionFlowComponentId(componentId),
    ),
  );
  const componentsReady =
    components.length === KERNEL_EXECUTION_FLOW_COMPONENT_IDS.length &&
    components.every(kernelExecutionFlowComponentReady);

  return Object.freeze({
    expectedComponentIds: KERNEL_EXECUTION_FLOW_COMPONENT_IDS,
    receivedComponentIds,
    missingComponentIds,
    duplicateComponentIds,
    unknownComponentIds,
    componentsReady,
    valid:
      missingComponentIds.length === 0 &&
      duplicateComponentIds.length === 0 &&
      unknownComponentIds.length === 0 &&
      componentsReady,
  });
}

function assertKernelExecutionFlowEvidenceValid(
  evidence: KernelExecutionFlowEvidence,
): void {
  if (evidence.missingComponentIds.length > 0) {
    throw new KernelExecutionFlowValidationError(
      "KEFC-001",
      "Kernel Execution Flow Control rejects incomplete component sets.",
      evidence,
    );
  }

  if (evidence.duplicateComponentIds.length > 0) {
    throw new KernelExecutionFlowValidationError(
      "KEFC-002",
      "Kernel Execution Flow Control rejects duplicate components.",
      evidence,
    );
  }

  if (evidence.unknownComponentIds.length > 0) {
    throw new KernelExecutionFlowValidationError(
      "KEFC-003",
      "Kernel Execution Flow Control rejects unknown components.",
      evidence,
    );
  }

  if (!evidence.componentsReady || !evidence.valid) {
    throw new KernelExecutionFlowValidationError(
      "KEFC-004",
      "Kernel Execution Flow Control rejects incoherent readiness evidence.",
      evidence,
    );
  }
}

function kernelExecutionFlowComponentReady(component: unknown): boolean {
  if (!isKernelExecutionFlowRecord(component)) {
    return false;
  }

  const componentId = kernelExecutionFlowComponentId(component);

  return (
    isKernelExecutionFlowComponentId(componentId) &&
    (
      component.readyForKernelExecutionFoundation === true ||
      component.readyForWorkflowExecution === true ||
      component.readyForRuntimeExecution === true ||
      component.readyForDecisionReportingIntegration === true ||
      component.readyForTraceabilityIntegration === true ||
      component.readyForRuntimeEvidence === true
    )
  );
}

function kernelExecutionFlowComponentId(
  component: Record<string, unknown>,
): string | null {
  if (component.primitiveControlId === "KERNEL_PRIMITIVE_CONTROL") {
    return "KERNEL_PRIMITIVE_CONTROL";
  }

  if (component.cycleId === "KERNEL_MISSION_ORDER_CYCLE") {
    return "KERNEL_MISSION_ORDER_CYCLE";
  }

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

  if (component.integrationId === "KERNEL_TRACEABILITY_INTEGRATION") {
    return "KERNEL_TRACEABILITY_INTEGRATION";
  }

  return null;
}

function isKernelExecutionFlowComponentId(
  componentId: unknown,
): componentId is KernelExecutionFlowComponentId {
  return KERNEL_EXECUTION_FLOW_COMPONENT_IDS.some(
    (expectedComponentId) => expectedComponentId === componentId,
  );
}

function isKernelExecutionFlowRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

void createKernelExecutionFlowControl;

export {};

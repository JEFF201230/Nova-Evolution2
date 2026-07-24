export type WorkflowRuntimeCompositionComponentId =
  | "workflow-runtime-context"
  | "workflow-runtime-state"
  | "workflow-runtime-lifecycle";

export interface WorkflowRuntimeCompositionComponent {
  readonly id: WorkflowRuntimeCompositionComponentId;
  readonly ready: boolean;
}

export interface WorkflowRuntimeCompositionEvidence {
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly componentIds: readonly WorkflowRuntimeCompositionComponentId[];
  readonly ready: boolean;
}

export interface WorkflowRuntimeCompositionResult {
  readonly passed: boolean;
  readonly evidence: WorkflowRuntimeCompositionEvidence;
}

const WORKFLOW_RUNTIME_COMPOSITION_COMPONENT_IDS: readonly WorkflowRuntimeCompositionComponentId[] = Object.freeze([
  "workflow-runtime-context",
  "workflow-runtime-state",
  "workflow-runtime-lifecycle",
]);

export function createWorkflowRuntimeCompositionEvidence(
  components: readonly WorkflowRuntimeCompositionComponent[],
): WorkflowRuntimeCompositionEvidence {
  assertWorkflowRuntimeCompositionComponents(components);

  const orderedComponents = WORKFLOW_RUNTIME_COMPOSITION_COMPONENT_IDS
    .filter((componentId) => components.some((component) => component.id === componentId))
    .map((componentId) => {
      const component = components.find((candidate) => candidate.id === componentId);

      if (component === undefined) {
        throw new Error(
          "WCOMP-004: Workflow Runtime Composition could not preserve deterministic component ordering.",
        );
      }

      return component;
    });
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const ready =
    orderedComponents.length === WORKFLOW_RUNTIME_COMPOSITION_COMPONENT_IDS.length &&
    readyComponentCount === WORKFLOW_RUNTIME_COMPOSITION_COMPONENT_IDS.length;

  return Object.freeze({
    componentCount: orderedComponents.length,
    readyComponentCount,
    componentIds: Object.freeze(orderedComponents.map((component) => component.id)),
    ready,
  });
}

export function verifyWorkflowRuntimeComposition(
  components: readonly WorkflowRuntimeCompositionComponent[],
): WorkflowRuntimeCompositionResult {
  const evidence = createWorkflowRuntimeCompositionEvidence(components);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertWorkflowRuntimeCompositionComponents(
  components: readonly WorkflowRuntimeCompositionComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    if (!isWorkflowRuntimeCompositionComponentId(component.id)) {
      throw new Error(
        "WCOMP-001: Workflow Runtime Composition rejects unknown internal components.",
      );
    }

    if (seen.has(component.id)) {
      throw new Error(
        "WCOMP-002: Workflow Runtime Composition rejects duplicate internal components.",
      );
    }

    seen.add(component.id);
  }
}

function isWorkflowRuntimeCompositionComponentId(
  value: string,
): value is WorkflowRuntimeCompositionComponentId {
  return WORKFLOW_RUNTIME_COMPOSITION_COMPONENT_IDS.some((componentId) => componentId === value);
}

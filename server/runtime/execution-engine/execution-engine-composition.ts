export type ExecutionEngineCompositionComponentId =
  | "runtime-core"
  | "mission-runtime"
  | "workflow-runtime"
  | "agent-runtime"
  | "execution-engine-context"
  | "execution-engine-state"
  | "execution-engine-lifecycle";

export interface ExecutionEngineCompositionComponent {
  readonly id: ExecutionEngineCompositionComponentId;
  readonly ready: boolean;
}

export interface ExecutionEngineCompositionEvidence {
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly componentIds: readonly ExecutionEngineCompositionComponentId[];
  readonly ready: boolean;
}

export interface ExecutionEngineCompositionResult {
  readonly passed: boolean;
  readonly evidence: ExecutionEngineCompositionEvidence;
}

const EXECUTION_ENGINE_COMPOSITION_COMPONENT_IDS: readonly ExecutionEngineCompositionComponentId[] = Object.freeze([
  "runtime-core",
  "mission-runtime",
  "workflow-runtime",
  "agent-runtime",
  "execution-engine-context",
  "execution-engine-state",
  "execution-engine-lifecycle",
]);

export function createExecutionEngineCompositionEvidence(
  components: readonly ExecutionEngineCompositionComponent[],
): ExecutionEngineCompositionEvidence {
  assertExecutionEngineCompositionComponents(components);

  const orderedComponents = EXECUTION_ENGINE_COMPOSITION_COMPONENT_IDS
    .filter((componentId) => components.some((component) => component.id === componentId))
    .map((componentId) => {
      const component = components.find((candidate) => candidate.id === componentId);

      if (component === undefined) {
        throw new Error(
          "ECOMP-004: Execution Engine Composition could not preserve deterministic component ordering.",
        );
      }

      return component;
    });
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const ready =
    orderedComponents.length === EXECUTION_ENGINE_COMPOSITION_COMPONENT_IDS.length &&
    readyComponentCount === EXECUTION_ENGINE_COMPOSITION_COMPONENT_IDS.length;

  return Object.freeze({
    componentCount: orderedComponents.length,
    readyComponentCount,
    componentIds: Object.freeze(orderedComponents.map((component) => component.id)),
    ready,
  });
}

export function verifyExecutionEngineComposition(
  components: readonly ExecutionEngineCompositionComponent[],
): ExecutionEngineCompositionResult {
  const evidence = createExecutionEngineCompositionEvidence(components);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertExecutionEngineCompositionComponents(
  components: readonly ExecutionEngineCompositionComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    if (!isExecutionEngineCompositionComponentId(component.id)) {
      throw new Error(
        "ECOMP-001: Execution Engine Composition rejects unknown internal components.",
      );
    }

    if (seen.has(component.id)) {
      throw new Error(
        "ECOMP-002: Execution Engine Composition rejects duplicate internal components.",
      );
    }

    seen.add(component.id);
  }
}

function isExecutionEngineCompositionComponentId(
  value: string,
): value is ExecutionEngineCompositionComponentId {
  return EXECUTION_ENGINE_COMPOSITION_COMPONENT_IDS.some((componentId) => componentId === value);
}

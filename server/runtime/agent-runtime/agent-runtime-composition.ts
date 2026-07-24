export type AgentRuntimeCompositionComponentId =
  | "agent-runtime-context"
  | "agent-runtime-state"
  | "agent-runtime-lifecycle";

export interface AgentRuntimeCompositionComponent {
  readonly id: AgentRuntimeCompositionComponentId;
  readonly ready: boolean;
}

export interface AgentRuntimeCompositionEvidence {
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly componentIds: readonly AgentRuntimeCompositionComponentId[];
  readonly ready: boolean;
}

export interface AgentRuntimeCompositionResult {
  readonly passed: boolean;
  readonly evidence: AgentRuntimeCompositionEvidence;
}

const AGENT_RUNTIME_COMPOSITION_COMPONENT_IDS: readonly AgentRuntimeCompositionComponentId[] = Object.freeze([
  "agent-runtime-context",
  "agent-runtime-state",
  "agent-runtime-lifecycle",
]);

export function createAgentRuntimeCompositionEvidence(
  components: readonly AgentRuntimeCompositionComponent[],
): AgentRuntimeCompositionEvidence {
  assertAgentRuntimeCompositionComponents(components);

  const orderedComponents = AGENT_RUNTIME_COMPOSITION_COMPONENT_IDS
    .filter((componentId) => components.some((component) => component.id === componentId))
    .map((componentId) => {
      const component = components.find((candidate) => candidate.id === componentId);

      if (component === undefined) {
        throw new Error(
          "ACOMP-004: Agent Runtime Composition could not preserve deterministic component ordering.",
        );
      }

      return component;
    });
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const ready =
    orderedComponents.length === AGENT_RUNTIME_COMPOSITION_COMPONENT_IDS.length &&
    readyComponentCount === AGENT_RUNTIME_COMPOSITION_COMPONENT_IDS.length;

  return Object.freeze({
    componentCount: orderedComponents.length,
    readyComponentCount,
    componentIds: Object.freeze(orderedComponents.map((component) => component.id)),
    ready,
  });
}

export function verifyAgentRuntimeComposition(
  components: readonly AgentRuntimeCompositionComponent[],
): AgentRuntimeCompositionResult {
  const evidence = createAgentRuntimeCompositionEvidence(components);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertAgentRuntimeCompositionComponents(
  components: readonly AgentRuntimeCompositionComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    if (!isAgentRuntimeCompositionComponentId(component.id)) {
      throw new Error(
        "ACOMP-001: Agent Runtime Composition rejects unknown internal components.",
      );
    }

    if (seen.has(component.id)) {
      throw new Error(
        "ACOMP-002: Agent Runtime Composition rejects duplicate internal components.",
      );
    }

    seen.add(component.id);
  }
}

function isAgentRuntimeCompositionComponentId(
  value: string,
): value is AgentRuntimeCompositionComponentId {
  return AGENT_RUNTIME_COMPOSITION_COMPONENT_IDS.some((componentId) => componentId === value);
}

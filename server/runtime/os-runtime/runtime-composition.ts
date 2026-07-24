export type RuntimeCompositionComponentId =
  | "runtime-context-manager"
  | "runtime-scheduler"
  | "runtime-state-manager"
  | "runtime-lifecycle";

export interface RuntimeCompositionComponent {
  readonly id: RuntimeCompositionComponentId;
  readonly ready: boolean;
}

export interface RuntimeCompositionEvidence {
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly componentIds: readonly RuntimeCompositionComponentId[];
  readonly ready: boolean;
}

export interface RuntimeCompositionResult {
  readonly passed: boolean;
  readonly evidence: RuntimeCompositionEvidence;
}

const RUNTIME_COMPOSITION_COMPONENT_IDS: readonly RuntimeCompositionComponentId[] = Object.freeze([
  "runtime-context-manager",
  "runtime-scheduler",
  "runtime-state-manager",
  "runtime-lifecycle",
]);

export function createRuntimeCompositionEvidence(
  components: readonly RuntimeCompositionComponent[],
): RuntimeCompositionEvidence {
  assertRuntimeCompositionComponents(components);

  const orderedComponents = RUNTIME_COMPOSITION_COMPONENT_IDS
    .filter((componentId) => components.some((component) => component.id === componentId))
    .map((componentId) => {
      const component = components.find((candidate) => candidate.id === componentId);

      if (component === undefined) {
        throw new Error(
          "RCOMP-004: Runtime Composition could not preserve deterministic component ordering.",
        );
      }

      return component;
    });
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const ready =
    orderedComponents.length === RUNTIME_COMPOSITION_COMPONENT_IDS.length &&
    readyComponentCount === RUNTIME_COMPOSITION_COMPONENT_IDS.length;

  return Object.freeze({
    componentCount: orderedComponents.length,
    readyComponentCount,
    componentIds: Object.freeze(orderedComponents.map((component) => component.id)),
    ready,
  });
}

export function verifyRuntimeComposition(
  components: readonly RuntimeCompositionComponent[],
): RuntimeCompositionResult {
  const evidence = createRuntimeCompositionEvidence(components);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertRuntimeCompositionComponents(
  components: readonly RuntimeCompositionComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    if (!isRuntimeCompositionComponentId(component.id)) {
      throw new Error(
        "RCOMP-001: Runtime Composition rejects unknown internal Runtime components.",
      );
    }

    if (seen.has(component.id)) {
      throw new Error(
        "RCOMP-002: Runtime Composition rejects duplicate internal Runtime components.",
      );
    }

    seen.add(component.id);
  }
}

function isRuntimeCompositionComponentId(
  value: string,
): value is RuntimeCompositionComponentId {
  return RUNTIME_COMPOSITION_COMPONENT_IDS.some((componentId) => componentId === value);
}

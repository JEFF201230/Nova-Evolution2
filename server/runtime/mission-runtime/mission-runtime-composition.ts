export type MissionRuntimeCompositionComponentId =
  | "mission-runtime-context"
  | "mission-runtime-state"
  | "mission-runtime-lifecycle";

export interface MissionRuntimeCompositionComponent {
  readonly id: MissionRuntimeCompositionComponentId;
  readonly ready: boolean;
}

export interface MissionRuntimeCompositionEvidence {
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly componentIds: readonly MissionRuntimeCompositionComponentId[];
  readonly ready: boolean;
}

export interface MissionRuntimeCompositionResult {
  readonly passed: boolean;
  readonly evidence: MissionRuntimeCompositionEvidence;
}

const MISSION_RUNTIME_COMPOSITION_COMPONENT_IDS: readonly MissionRuntimeCompositionComponentId[] = Object.freeze([
  "mission-runtime-context",
  "mission-runtime-state",
  "mission-runtime-lifecycle",
]);

export function createMissionRuntimeCompositionEvidence(
  components: readonly MissionRuntimeCompositionComponent[],
): MissionRuntimeCompositionEvidence {
  assertMissionRuntimeCompositionComponents(components);

  const orderedComponents = MISSION_RUNTIME_COMPOSITION_COMPONENT_IDS
    .filter((componentId) => components.some((component) => component.id === componentId))
    .map((componentId) => {
      const component = components.find((candidate) => candidate.id === componentId);

      if (component === undefined) {
        throw new Error(
          "MCOMP-004: Mission Runtime Composition could not preserve deterministic component ordering.",
        );
      }

      return component;
    });
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const ready =
    orderedComponents.length === MISSION_RUNTIME_COMPOSITION_COMPONENT_IDS.length &&
    readyComponentCount === MISSION_RUNTIME_COMPOSITION_COMPONENT_IDS.length;

  return Object.freeze({
    componentCount: orderedComponents.length,
    readyComponentCount,
    componentIds: Object.freeze(orderedComponents.map((component) => component.id)),
    ready,
  });
}

export function verifyMissionRuntimeComposition(
  components: readonly MissionRuntimeCompositionComponent[],
): MissionRuntimeCompositionResult {
  const evidence = createMissionRuntimeCompositionEvidence(components);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertMissionRuntimeCompositionComponents(
  components: readonly MissionRuntimeCompositionComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    if (!isMissionRuntimeCompositionComponentId(component.id)) {
      throw new Error(
        "MCOMP-001: Mission Runtime Composition rejects unknown internal components.",
      );
    }

    if (seen.has(component.id)) {
      throw new Error(
        "MCOMP-002: Mission Runtime Composition rejects duplicate internal components.",
      );
    }

    seen.add(component.id);
  }
}

function isMissionRuntimeCompositionComponentId(
  value: string,
): value is MissionRuntimeCompositionComponentId {
  return MISSION_RUNTIME_COMPOSITION_COMPONENT_IDS.some((componentId) => componentId === value);
}

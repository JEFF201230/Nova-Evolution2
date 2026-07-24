export type MissionRuntimeContextReferenceKind =
  | "mission-order"
  | "runtime-core"
  | "runtime-architecture"
  | "kernel-boundary";

export interface MissionRuntimeContextReference {
  readonly kind: MissionRuntimeContextReferenceKind;
  readonly value: string;
}

export interface MissionRuntimeContextEvidence {
  readonly referenceCount: number;
  readonly requiredReferenceCount: number;
  readonly ready: boolean;
  readonly references: readonly MissionRuntimeContextReference[];
}

export interface MissionRuntimeContextResult {
  readonly passed: boolean;
  readonly evidence: MissionRuntimeContextEvidence;
}

const MISSION_RUNTIME_CONTEXT_REFERENCE_KINDS: readonly MissionRuntimeContextReferenceKind[] = Object.freeze([
  "mission-order",
  "runtime-core",
  "runtime-architecture",
  "kernel-boundary",
]);

export function createMissionRuntimeContextEvidence(
  references: readonly MissionRuntimeContextReference[],
): MissionRuntimeContextEvidence {
  assertMissionRuntimeContextReferences(references);

  const orderedReferences = MISSION_RUNTIME_CONTEXT_REFERENCE_KINDS
    .filter((kind) => references.some((reference) => reference.kind === kind))
    .map((kind) => {
      const reference = references.find((candidate) => candidate.kind === kind);

      if (reference === undefined) {
        throw new Error(
          "MCTX-004: Mission Runtime Context could not preserve deterministic reference ordering.",
        );
      }

      return Object.freeze({
        kind: reference.kind,
        value: reference.value,
      });
    });
  const ready = orderedReferences.length === MISSION_RUNTIME_CONTEXT_REFERENCE_KINDS.length;

  return Object.freeze({
    referenceCount: orderedReferences.length,
    requiredReferenceCount: MISSION_RUNTIME_CONTEXT_REFERENCE_KINDS.length,
    ready,
    references: Object.freeze(orderedReferences),
  });
}

export function verifyMissionRuntimeContext(
  references: readonly MissionRuntimeContextReference[],
): MissionRuntimeContextResult {
  const evidence = createMissionRuntimeContextEvidence(references);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertMissionRuntimeContextReferences(
  references: readonly MissionRuntimeContextReference[],
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    if (!isMissionRuntimeContextReferenceKind(reference.kind)) {
      throw new Error(
        "MCTX-001: Mission Runtime Context rejects unknown context reference kinds.",
      );
    }

    if (seen.has(reference.kind)) {
      throw new Error(
        "MCTX-002: Mission Runtime Context rejects duplicate context reference kinds.",
      );
    }

    if (reference.value.trim().length === 0 || reference.value !== reference.value.trim()) {
      throw new Error(
        "MCTX-003: Mission Runtime Context rejects empty or non-normalized context references.",
      );
    }

    seen.add(reference.kind);
  }
}

function isMissionRuntimeContextReferenceKind(
  value: string,
): value is MissionRuntimeContextReferenceKind {
  return MISSION_RUNTIME_CONTEXT_REFERENCE_KINDS.some((kind) => kind === value);
}

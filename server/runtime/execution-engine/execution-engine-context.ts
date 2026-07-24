export type ExecutionEngineContextReferenceKind =
  | "mission-order"
  | "runtime-core"
  | "mission-runtime"
  | "workflow-runtime"
  | "agent-runtime"
  | "runtime-architecture"
  | "kernel-boundary";

export interface ExecutionEngineContextReference {
  readonly kind: ExecutionEngineContextReferenceKind;
  readonly value: string;
}

export interface ExecutionEngineContextEvidence {
  readonly referenceCount: number;
  readonly requiredReferenceCount: number;
  readonly ready: boolean;
  readonly references: readonly ExecutionEngineContextReference[];
}

export interface ExecutionEngineContextResult {
  readonly passed: boolean;
  readonly evidence: ExecutionEngineContextEvidence;
}

const EXECUTION_ENGINE_CONTEXT_REFERENCE_KINDS: readonly ExecutionEngineContextReferenceKind[] = Object.freeze([
  "mission-order",
  "runtime-core",
  "mission-runtime",
  "workflow-runtime",
  "agent-runtime",
  "runtime-architecture",
  "kernel-boundary",
]);

export function createExecutionEngineContextEvidence(
  references: readonly ExecutionEngineContextReference[],
): ExecutionEngineContextEvidence {
  assertExecutionEngineContextReferences(references);

  const orderedReferences = EXECUTION_ENGINE_CONTEXT_REFERENCE_KINDS
    .filter((kind) => references.some((reference) => reference.kind === kind))
    .map((kind) => {
      const reference = references.find((candidate) => candidate.kind === kind);

      if (reference === undefined) {
        throw new Error(
          "ECTX-004: Execution Engine Context could not preserve deterministic reference ordering.",
        );
      }

      return Object.freeze({
        kind: reference.kind,
        value: reference.value,
      });
    });
  const ready = orderedReferences.length === EXECUTION_ENGINE_CONTEXT_REFERENCE_KINDS.length;

  return Object.freeze({
    referenceCount: orderedReferences.length,
    requiredReferenceCount: EXECUTION_ENGINE_CONTEXT_REFERENCE_KINDS.length,
    ready,
    references: Object.freeze(orderedReferences),
  });
}

export function verifyExecutionEngineContext(
  references: readonly ExecutionEngineContextReference[],
): ExecutionEngineContextResult {
  const evidence = createExecutionEngineContextEvidence(references);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertExecutionEngineContextReferences(
  references: readonly ExecutionEngineContextReference[],
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    if (!isExecutionEngineContextReferenceKind(reference.kind)) {
      throw new Error(
        "ECTX-001: Execution Engine Context rejects unknown context reference kinds.",
      );
    }

    if (seen.has(reference.kind)) {
      throw new Error(
        "ECTX-002: Execution Engine Context rejects duplicate context reference kinds.",
      );
    }

    if (reference.value.trim().length === 0 || reference.value !== reference.value.trim()) {
      throw new Error(
        "ECTX-003: Execution Engine Context rejects empty or non-normalized context references.",
      );
    }

    seen.add(reference.kind);
  }
}

function isExecutionEngineContextReferenceKind(
  value: string,
): value is ExecutionEngineContextReferenceKind {
  return EXECUTION_ENGINE_CONTEXT_REFERENCE_KINDS.some((kind) => kind === value);
}

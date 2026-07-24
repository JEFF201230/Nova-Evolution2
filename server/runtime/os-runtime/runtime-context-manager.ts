export type RuntimeContextReferenceKind =
  | "campaign"
  | "mission-order"
  | "runtime-architecture"
  | "kernel-boundary";

export interface RuntimeContextReference {
  readonly kind: RuntimeContextReferenceKind;
  readonly value: string;
}

export interface RuntimeContextManagerEvidence {
  readonly referenceCount: number;
  readonly requiredReferenceCount: number;
  readonly ready: boolean;
  readonly references: readonly RuntimeContextReference[];
}

export interface RuntimeContextManagerResult {
  readonly passed: boolean;
  readonly evidence: RuntimeContextManagerEvidence;
}

const RUNTIME_CONTEXT_REQUIRED_REFERENCE_KINDS: readonly RuntimeContextReferenceKind[] = Object.freeze([
  "campaign",
  "mission-order",
  "runtime-architecture",
  "kernel-boundary",
]);

export function createRuntimeContextManagerEvidence(
  references: readonly RuntimeContextReference[],
): RuntimeContextManagerEvidence {
  assertRuntimeContextReferences(references);

  const orderedReferences = RUNTIME_CONTEXT_REQUIRED_REFERENCE_KINDS
    .filter((kind) => references.some((reference) => reference.kind === kind))
    .map((kind) => {
      const reference = references.find((candidate) => candidate.kind === kind);

      if (reference === undefined) {
        throw new Error(
          "RCTX-004: Runtime Context Manager could not preserve deterministic reference ordering.",
        );
      }

      return Object.freeze({
        kind: reference.kind,
        value: reference.value,
      });
    });
  const ready = orderedReferences.length === RUNTIME_CONTEXT_REQUIRED_REFERENCE_KINDS.length;

  return Object.freeze({
    referenceCount: orderedReferences.length,
    requiredReferenceCount: RUNTIME_CONTEXT_REQUIRED_REFERENCE_KINDS.length,
    ready,
    references: Object.freeze(orderedReferences),
  });
}

export function verifyRuntimeContextManager(
  references: readonly RuntimeContextReference[],
): RuntimeContextManagerResult {
  const evidence = createRuntimeContextManagerEvidence(references);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertRuntimeContextReferences(
  references: readonly RuntimeContextReference[],
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    if (!isRuntimeContextReferenceKind(reference.kind)) {
      throw new Error(
        "RCTX-001: Runtime Context Manager rejects unknown context reference kinds.",
      );
    }

    if (seen.has(reference.kind)) {
      throw new Error(
        "RCTX-002: Runtime Context Manager rejects duplicate context reference kinds.",
      );
    }

    if (reference.value.trim().length === 0 || reference.value !== reference.value.trim()) {
      throw new Error(
        "RCTX-003: Runtime Context Manager rejects empty or non-normalized context references.",
      );
    }

    seen.add(reference.kind);
  }
}

function isRuntimeContextReferenceKind(
  value: string,
): value is RuntimeContextReferenceKind {
  return RUNTIME_CONTEXT_REQUIRED_REFERENCE_KINDS.some((kind) => kind === value);
}

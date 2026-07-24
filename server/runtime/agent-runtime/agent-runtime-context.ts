export type AgentRuntimeContextReferenceKind =
  | "mission-order"
  | "runtime-core"
  | "mission-runtime"
  | "workflow-runtime"
  | "runtime-architecture";

export interface AgentRuntimeContextReference {
  readonly kind: AgentRuntimeContextReferenceKind;
  readonly value: string;
}

export interface AgentRuntimeContextEvidence {
  readonly referenceCount: number;
  readonly requiredReferenceCount: number;
  readonly ready: boolean;
  readonly references: readonly AgentRuntimeContextReference[];
}

export interface AgentRuntimeContextResult {
  readonly passed: boolean;
  readonly evidence: AgentRuntimeContextEvidence;
}

const AGENT_RUNTIME_CONTEXT_REFERENCE_KINDS: readonly AgentRuntimeContextReferenceKind[] = Object.freeze([
  "mission-order",
  "runtime-core",
  "mission-runtime",
  "workflow-runtime",
  "runtime-architecture",
]);

export function createAgentRuntimeContextEvidence(
  references: readonly AgentRuntimeContextReference[],
): AgentRuntimeContextEvidence {
  assertAgentRuntimeContextReferences(references);

  const orderedReferences = AGENT_RUNTIME_CONTEXT_REFERENCE_KINDS
    .filter((kind) => references.some((reference) => reference.kind === kind))
    .map((kind) => {
      const reference = references.find((candidate) => candidate.kind === kind);

      if (reference === undefined) {
        throw new Error(
          "ACTX-004: Agent Runtime Context could not preserve deterministic reference ordering.",
        );
      }

      return Object.freeze({
        kind: reference.kind,
        value: reference.value,
      });
    });
  const ready = orderedReferences.length === AGENT_RUNTIME_CONTEXT_REFERENCE_KINDS.length;

  return Object.freeze({
    referenceCount: orderedReferences.length,
    requiredReferenceCount: AGENT_RUNTIME_CONTEXT_REFERENCE_KINDS.length,
    ready,
    references: Object.freeze(orderedReferences),
  });
}

export function verifyAgentRuntimeContext(
  references: readonly AgentRuntimeContextReference[],
): AgentRuntimeContextResult {
  const evidence = createAgentRuntimeContextEvidence(references);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertAgentRuntimeContextReferences(
  references: readonly AgentRuntimeContextReference[],
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    if (!isAgentRuntimeContextReferenceKind(reference.kind)) {
      throw new Error(
        "ACTX-001: Agent Runtime Context rejects unknown context reference kinds.",
      );
    }

    if (seen.has(reference.kind)) {
      throw new Error(
        "ACTX-002: Agent Runtime Context rejects duplicate context reference kinds.",
      );
    }

    if (reference.value.trim().length === 0 || reference.value !== reference.value.trim()) {
      throw new Error(
        "ACTX-003: Agent Runtime Context rejects empty or non-normalized context references.",
      );
    }

    seen.add(reference.kind);
  }
}

function isAgentRuntimeContextReferenceKind(
  value: string,
): value is AgentRuntimeContextReferenceKind {
  return AGENT_RUNTIME_CONTEXT_REFERENCE_KINDS.some((kind) => kind === value);
}

export type WorkflowRuntimeContextReferenceKind =
  | "mission-order"
  | "runtime-core"
  | "mission-runtime"
  | "runtime-architecture";

export interface WorkflowRuntimeContextReference {
  readonly kind: WorkflowRuntimeContextReferenceKind;
  readonly value: string;
}

export interface WorkflowRuntimeContextEvidence {
  readonly referenceCount: number;
  readonly requiredReferenceCount: number;
  readonly ready: boolean;
  readonly references: readonly WorkflowRuntimeContextReference[];
}

export interface WorkflowRuntimeContextResult {
  readonly passed: boolean;
  readonly evidence: WorkflowRuntimeContextEvidence;
}

const WORKFLOW_RUNTIME_CONTEXT_REFERENCE_KINDS: readonly WorkflowRuntimeContextReferenceKind[] = Object.freeze([
  "mission-order",
  "runtime-core",
  "mission-runtime",
  "runtime-architecture",
]);

export function createWorkflowRuntimeContextEvidence(
  references: readonly WorkflowRuntimeContextReference[],
): WorkflowRuntimeContextEvidence {
  assertWorkflowRuntimeContextReferences(references);

  const orderedReferences = WORKFLOW_RUNTIME_CONTEXT_REFERENCE_KINDS
    .filter((kind) => references.some((reference) => reference.kind === kind))
    .map((kind) => {
      const reference = references.find((candidate) => candidate.kind === kind);

      if (reference === undefined) {
        throw new Error(
          "WCTX-004: Workflow Runtime Context could not preserve deterministic reference ordering.",
        );
      }

      return Object.freeze({
        kind: reference.kind,
        value: reference.value,
      });
    });
  const ready = orderedReferences.length === WORKFLOW_RUNTIME_CONTEXT_REFERENCE_KINDS.length;

  return Object.freeze({
    referenceCount: orderedReferences.length,
    requiredReferenceCount: WORKFLOW_RUNTIME_CONTEXT_REFERENCE_KINDS.length,
    ready,
    references: Object.freeze(orderedReferences),
  });
}

export function verifyWorkflowRuntimeContext(
  references: readonly WorkflowRuntimeContextReference[],
): WorkflowRuntimeContextResult {
  const evidence = createWorkflowRuntimeContextEvidence(references);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertWorkflowRuntimeContextReferences(
  references: readonly WorkflowRuntimeContextReference[],
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    if (!isWorkflowRuntimeContextReferenceKind(reference.kind)) {
      throw new Error(
        "WCTX-001: Workflow Runtime Context rejects unknown context reference kinds.",
      );
    }

    if (seen.has(reference.kind)) {
      throw new Error(
        "WCTX-002: Workflow Runtime Context rejects duplicate context reference kinds.",
      );
    }

    if (reference.value.trim().length === 0 || reference.value !== reference.value.trim()) {
      throw new Error(
        "WCTX-003: Workflow Runtime Context rejects empty or non-normalized context references.",
      );
    }

    seen.add(reference.kind);
  }
}

function isWorkflowRuntimeContextReferenceKind(
  value: string,
): value is WorkflowRuntimeContextReferenceKind {
  return WORKFLOW_RUNTIME_CONTEXT_REFERENCE_KINDS.some((kind) => kind === value);
}

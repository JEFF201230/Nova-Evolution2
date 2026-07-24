export type WorkflowRuntimeInternalState =
  | "CREATED"
  | "CONTEXT_READY"
  | "MISSION_BOUND"
  | "RUNTIME_BOUND"
  | "READY"
  | "STOPPED";

export interface WorkflowRuntimeStateTransitionEvidence {
  readonly from: WorkflowRuntimeInternalState;
  readonly to: WorkflowRuntimeInternalState;
  readonly allowed: true;
}

export interface WorkflowRuntimeStateEvidence {
  readonly currentState: WorkflowRuntimeInternalState;
  readonly transitionCount: number;
  readonly ready: boolean;
}

export interface WorkflowRuntimeStateResult {
  readonly passed: boolean;
  readonly evidence: WorkflowRuntimeStateEvidence;
}

const WORKFLOW_RUNTIME_INTERNAL_STATES: readonly WorkflowRuntimeInternalState[] = Object.freeze([
  "CREATED",
  "CONTEXT_READY",
  "MISSION_BOUND",
  "RUNTIME_BOUND",
  "READY",
  "STOPPED",
]);

const WORKFLOW_RUNTIME_STATE_TRANSITIONS: Readonly<
  Record<WorkflowRuntimeInternalState, readonly WorkflowRuntimeInternalState[]>
> = Object.freeze({
  CREATED: Object.freeze(["CONTEXT_READY"]),
  CONTEXT_READY: Object.freeze(["MISSION_BOUND", "STOPPED"]),
  MISSION_BOUND: Object.freeze(["RUNTIME_BOUND", "STOPPED"]),
  RUNTIME_BOUND: Object.freeze(["READY", "STOPPED"]),
  READY: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createWorkflowRuntimeStateTransitionEvidence(
  from: WorkflowRuntimeInternalState,
  to: WorkflowRuntimeInternalState,
): WorkflowRuntimeStateTransitionEvidence {
  assertWorkflowRuntimeInternalState(from);
  assertWorkflowRuntimeInternalState(to);

  if (!WORKFLOW_RUNTIME_STATE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "WSTATE-001: Workflow Runtime State rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createWorkflowRuntimeStateEvidence(
  transitions: readonly WorkflowRuntimeStateTransitionEvidence[],
): WorkflowRuntimeStateEvidence {
  assertWorkflowRuntimeStateTransitionSequence(transitions);

  const currentState = transitions.length === 0
    ? "CREATED"
    : transitions[transitions.length - 1].to;

  return Object.freeze({
    currentState,
    transitionCount: transitions.length,
    ready: currentState === "READY",
  });
}

export function verifyWorkflowRuntimeState(
  transitions: readonly WorkflowRuntimeStateTransitionEvidence[] = [
    createWorkflowRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createWorkflowRuntimeStateTransitionEvidence("CONTEXT_READY", "MISSION_BOUND"),
    createWorkflowRuntimeStateTransitionEvidence("MISSION_BOUND", "RUNTIME_BOUND"),
    createWorkflowRuntimeStateTransitionEvidence("RUNTIME_BOUND", "READY"),
  ],
): WorkflowRuntimeStateResult {
  const evidence = createWorkflowRuntimeStateEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertWorkflowRuntimeInternalState(
  value: string,
): asserts value is WorkflowRuntimeInternalState {
  if (!WORKFLOW_RUNTIME_INTERNAL_STATES.includes(value as WorkflowRuntimeInternalState)) {
    throw new Error(
      "WSTATE-002: Workflow Runtime State rejects unknown internal states.",
    );
  }
}

function assertWorkflowRuntimeStateTransitionSequence(
  transitions: readonly WorkflowRuntimeStateTransitionEvidence[],
): void {
  let currentState: WorkflowRuntimeInternalState = "CREATED";

  for (const transition of transitions) {
    assertWorkflowRuntimeInternalState(transition.from);
    assertWorkflowRuntimeInternalState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "WSTATE-003: Workflow Runtime State rejects non-contiguous internal transitions.",
      );
    }

    if (!WORKFLOW_RUNTIME_STATE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "WSTATE-001: Workflow Runtime State rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

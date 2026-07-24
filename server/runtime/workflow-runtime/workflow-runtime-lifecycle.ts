export type WorkflowRuntimeLifecycleState =
  | "CREATED"
  | "INITIALIZING"
  | "MISSION_BOUND"
  | "RUNTIME_BOUND"
  | "READY"
  | "STOPPING"
  | "STOPPED";

export interface WorkflowRuntimeLifecycleTransitionEvidence {
  readonly from: WorkflowRuntimeLifecycleState;
  readonly to: WorkflowRuntimeLifecycleState;
  readonly allowed: true;
}

export interface WorkflowRuntimeLifecycleEvidence {
  readonly currentState: WorkflowRuntimeLifecycleState;
  readonly transitionCount: number;
  readonly ready: boolean;
  readonly stopped: boolean;
}

export interface WorkflowRuntimeLifecycleResult {
  readonly passed: boolean;
  readonly evidence: WorkflowRuntimeLifecycleEvidence;
}

const WORKFLOW_RUNTIME_LIFECYCLE_STATES: readonly WorkflowRuntimeLifecycleState[] = Object.freeze([
  "CREATED",
  "INITIALIZING",
  "MISSION_BOUND",
  "RUNTIME_BOUND",
  "READY",
  "STOPPING",
  "STOPPED",
]);

const WORKFLOW_RUNTIME_LIFECYCLE_TRANSITIONS: Readonly<
  Record<WorkflowRuntimeLifecycleState, readonly WorkflowRuntimeLifecycleState[]>
> = Object.freeze({
  CREATED: Object.freeze(["INITIALIZING", "STOPPED"]),
  INITIALIZING: Object.freeze(["MISSION_BOUND", "STOPPING"]),
  MISSION_BOUND: Object.freeze(["RUNTIME_BOUND", "STOPPING"]),
  RUNTIME_BOUND: Object.freeze(["READY", "STOPPING"]),
  READY: Object.freeze(["STOPPING"]),
  STOPPING: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createWorkflowRuntimeLifecycleTransitionEvidence(
  from: WorkflowRuntimeLifecycleState,
  to: WorkflowRuntimeLifecycleState,
): WorkflowRuntimeLifecycleTransitionEvidence {
  assertWorkflowRuntimeLifecycleState(from);
  assertWorkflowRuntimeLifecycleState(to);

  if (!WORKFLOW_RUNTIME_LIFECYCLE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "WLIFE-001: Workflow Runtime Lifecycle rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createWorkflowRuntimeLifecycleEvidence(
  transitions: readonly WorkflowRuntimeLifecycleTransitionEvidence[],
): WorkflowRuntimeLifecycleEvidence {
  assertWorkflowRuntimeLifecycleTransitionSequence(transitions);

  const currentState = transitions.length === 0
    ? "CREATED"
    : transitions[transitions.length - 1].to;

  return Object.freeze({
    currentState,
    transitionCount: transitions.length,
    ready: currentState === "READY",
    stopped: currentState === "STOPPED",
  });
}

export function verifyWorkflowRuntimeLifecycle(
  transitions: readonly WorkflowRuntimeLifecycleTransitionEvidence[] = [
    createWorkflowRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createWorkflowRuntimeLifecycleTransitionEvidence("INITIALIZING", "MISSION_BOUND"),
    createWorkflowRuntimeLifecycleTransitionEvidence("MISSION_BOUND", "RUNTIME_BOUND"),
    createWorkflowRuntimeLifecycleTransitionEvidence("RUNTIME_BOUND", "READY"),
  ],
): WorkflowRuntimeLifecycleResult {
  const evidence = createWorkflowRuntimeLifecycleEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertWorkflowRuntimeLifecycleState(
  value: string,
): asserts value is WorkflowRuntimeLifecycleState {
  if (!WORKFLOW_RUNTIME_LIFECYCLE_STATES.includes(value as WorkflowRuntimeLifecycleState)) {
    throw new Error(
      "WLIFE-002: Workflow Runtime Lifecycle rejects unknown internal states.",
    );
  }
}

function assertWorkflowRuntimeLifecycleTransitionSequence(
  transitions: readonly WorkflowRuntimeLifecycleTransitionEvidence[],
): void {
  let currentState: WorkflowRuntimeLifecycleState = "CREATED";

  for (const transition of transitions) {
    assertWorkflowRuntimeLifecycleState(transition.from);
    assertWorkflowRuntimeLifecycleState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "WLIFE-003: Workflow Runtime Lifecycle rejects non-contiguous internal transitions.",
      );
    }

    if (!WORKFLOW_RUNTIME_LIFECYCLE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "WLIFE-001: Workflow Runtime Lifecycle rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

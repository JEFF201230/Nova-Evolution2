export type ExecutionEngineLifecycleState =
  | "CREATED"
  | "INITIALIZING"
  | "RUNTIME_CORE_BOUND"
  | "MISSION_BOUND"
  | "WORKFLOW_BOUND"
  | "AGENT_BOUND"
  | "SYNCHRONIZING"
  | "READY"
  | "STOPPING"
  | "STOPPED";

export interface ExecutionEngineLifecycleTransitionEvidence {
  readonly from: ExecutionEngineLifecycleState;
  readonly to: ExecutionEngineLifecycleState;
  readonly allowed: true;
}

export interface ExecutionEngineLifecycleEvidence {
  readonly currentState: ExecutionEngineLifecycleState;
  readonly transitionCount: number;
  readonly ready: boolean;
  readonly stopped: boolean;
}

export interface ExecutionEngineLifecycleResult {
  readonly passed: boolean;
  readonly evidence: ExecutionEngineLifecycleEvidence;
}

const EXECUTION_ENGINE_LIFECYCLE_STATES: readonly ExecutionEngineLifecycleState[] = Object.freeze([
  "CREATED",
  "INITIALIZING",
  "RUNTIME_CORE_BOUND",
  "MISSION_BOUND",
  "WORKFLOW_BOUND",
  "AGENT_BOUND",
  "SYNCHRONIZING",
  "READY",
  "STOPPING",
  "STOPPED",
]);

const EXECUTION_ENGINE_LIFECYCLE_TRANSITIONS: Readonly<
  Record<ExecutionEngineLifecycleState, readonly ExecutionEngineLifecycleState[]>
> = Object.freeze({
  CREATED: Object.freeze(["INITIALIZING", "STOPPED"]),
  INITIALIZING: Object.freeze(["RUNTIME_CORE_BOUND", "STOPPING"]),
  RUNTIME_CORE_BOUND: Object.freeze(["MISSION_BOUND", "STOPPING"]),
  MISSION_BOUND: Object.freeze(["WORKFLOW_BOUND", "STOPPING"]),
  WORKFLOW_BOUND: Object.freeze(["AGENT_BOUND", "STOPPING"]),
  AGENT_BOUND: Object.freeze(["SYNCHRONIZING", "STOPPING"]),
  SYNCHRONIZING: Object.freeze(["READY", "STOPPING"]),
  READY: Object.freeze(["STOPPING"]),
  STOPPING: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createExecutionEngineLifecycleTransitionEvidence(
  from: ExecutionEngineLifecycleState,
  to: ExecutionEngineLifecycleState,
): ExecutionEngineLifecycleTransitionEvidence {
  assertExecutionEngineLifecycleState(from);
  assertExecutionEngineLifecycleState(to);

  if (!EXECUTION_ENGINE_LIFECYCLE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "ELIFE-001: Execution Engine Lifecycle rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createExecutionEngineLifecycleEvidence(
  transitions: readonly ExecutionEngineLifecycleTransitionEvidence[],
): ExecutionEngineLifecycleEvidence {
  assertExecutionEngineLifecycleTransitionSequence(transitions);

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

export function verifyExecutionEngineLifecycle(
  transitions: readonly ExecutionEngineLifecycleTransitionEvidence[] = [
    createExecutionEngineLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createExecutionEngineLifecycleTransitionEvidence("INITIALIZING", "RUNTIME_CORE_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("RUNTIME_CORE_BOUND", "MISSION_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("WORKFLOW_BOUND", "AGENT_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("AGENT_BOUND", "SYNCHRONIZING"),
    createExecutionEngineLifecycleTransitionEvidence("SYNCHRONIZING", "READY"),
  ],
): ExecutionEngineLifecycleResult {
  const evidence = createExecutionEngineLifecycleEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertExecutionEngineLifecycleState(
  value: string,
): asserts value is ExecutionEngineLifecycleState {
  if (!EXECUTION_ENGINE_LIFECYCLE_STATES.includes(value as ExecutionEngineLifecycleState)) {
    throw new Error(
      "ELIFE-002: Execution Engine Lifecycle rejects unknown internal states.",
    );
  }
}

function assertExecutionEngineLifecycleTransitionSequence(
  transitions: readonly ExecutionEngineLifecycleTransitionEvidence[],
): void {
  let currentState: ExecutionEngineLifecycleState = "CREATED";

  for (const transition of transitions) {
    assertExecutionEngineLifecycleState(transition.from);
    assertExecutionEngineLifecycleState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "ELIFE-003: Execution Engine Lifecycle rejects non-contiguous internal transitions.",
      );
    }

    if (!EXECUTION_ENGINE_LIFECYCLE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "ELIFE-001: Execution Engine Lifecycle rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

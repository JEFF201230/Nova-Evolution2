export type ExecutionEngineInternalState =
  | "CREATED"
  | "CONTEXT_READY"
  | "RUNTIME_CORE_BOUND"
  | "MISSION_BOUND"
  | "WORKFLOW_BOUND"
  | "AGENT_BOUND"
  | "SYNCHRONIZED"
  | "READY"
  | "STOPPED";

export interface ExecutionEngineStateTransitionEvidence {
  readonly from: ExecutionEngineInternalState;
  readonly to: ExecutionEngineInternalState;
  readonly allowed: true;
}

export interface ExecutionEngineStateEvidence {
  readonly currentState: ExecutionEngineInternalState;
  readonly transitionCount: number;
  readonly ready: boolean;
}

export interface ExecutionEngineStateResult {
  readonly passed: boolean;
  readonly evidence: ExecutionEngineStateEvidence;
}

const EXECUTION_ENGINE_INTERNAL_STATES: readonly ExecutionEngineInternalState[] = Object.freeze([
  "CREATED",
  "CONTEXT_READY",
  "RUNTIME_CORE_BOUND",
  "MISSION_BOUND",
  "WORKFLOW_BOUND",
  "AGENT_BOUND",
  "SYNCHRONIZED",
  "READY",
  "STOPPED",
]);

const EXECUTION_ENGINE_STATE_TRANSITIONS: Readonly<
  Record<ExecutionEngineInternalState, readonly ExecutionEngineInternalState[]>
> = Object.freeze({
  CREATED: Object.freeze(["CONTEXT_READY"]),
  CONTEXT_READY: Object.freeze(["RUNTIME_CORE_BOUND", "STOPPED"]),
  RUNTIME_CORE_BOUND: Object.freeze(["MISSION_BOUND", "STOPPED"]),
  MISSION_BOUND: Object.freeze(["WORKFLOW_BOUND", "STOPPED"]),
  WORKFLOW_BOUND: Object.freeze(["AGENT_BOUND", "STOPPED"]),
  AGENT_BOUND: Object.freeze(["SYNCHRONIZED", "STOPPED"]),
  SYNCHRONIZED: Object.freeze(["READY", "STOPPED"]),
  READY: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createExecutionEngineStateTransitionEvidence(
  from: ExecutionEngineInternalState,
  to: ExecutionEngineInternalState,
): ExecutionEngineStateTransitionEvidence {
  assertExecutionEngineInternalState(from);
  assertExecutionEngineInternalState(to);

  if (!EXECUTION_ENGINE_STATE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "ESTATE-001: Execution Engine State rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createExecutionEngineStateEvidence(
  transitions: readonly ExecutionEngineStateTransitionEvidence[],
): ExecutionEngineStateEvidence {
  assertExecutionEngineStateTransitionSequence(transitions);

  const currentState = transitions.length === 0
    ? "CREATED"
    : transitions[transitions.length - 1].to;

  return Object.freeze({
    currentState,
    transitionCount: transitions.length,
    ready: currentState === "READY",
  });
}

export function verifyExecutionEngineState(
  transitions: readonly ExecutionEngineStateTransitionEvidence[] = [
    createExecutionEngineStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createExecutionEngineStateTransitionEvidence("CONTEXT_READY", "RUNTIME_CORE_BOUND"),
    createExecutionEngineStateTransitionEvidence("RUNTIME_CORE_BOUND", "MISSION_BOUND"),
    createExecutionEngineStateTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createExecutionEngineStateTransitionEvidence("WORKFLOW_BOUND", "AGENT_BOUND"),
    createExecutionEngineStateTransitionEvidence("AGENT_BOUND", "SYNCHRONIZED"),
    createExecutionEngineStateTransitionEvidence("SYNCHRONIZED", "READY"),
  ],
): ExecutionEngineStateResult {
  const evidence = createExecutionEngineStateEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertExecutionEngineInternalState(
  value: string,
): asserts value is ExecutionEngineInternalState {
  if (!EXECUTION_ENGINE_INTERNAL_STATES.includes(value as ExecutionEngineInternalState)) {
    throw new Error(
      "ESTATE-002: Execution Engine State rejects unknown internal states.",
    );
  }
}

function assertExecutionEngineStateTransitionSequence(
  transitions: readonly ExecutionEngineStateTransitionEvidence[],
): void {
  let currentState: ExecutionEngineInternalState = "CREATED";

  for (const transition of transitions) {
    assertExecutionEngineInternalState(transition.from);
    assertExecutionEngineInternalState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "ESTATE-003: Execution Engine State rejects non-contiguous internal transitions.",
      );
    }

    if (!EXECUTION_ENGINE_STATE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "ESTATE-001: Execution Engine State rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

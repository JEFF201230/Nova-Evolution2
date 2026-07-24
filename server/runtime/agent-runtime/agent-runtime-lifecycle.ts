export type AgentRuntimeLifecycleState =
  | "CREATED"
  | "INITIALIZING"
  | "RUNTIME_BOUND"
  | "MISSION_BOUND"
  | "WORKFLOW_BOUND"
  | "READY"
  | "STOPPING"
  | "STOPPED";

export interface AgentRuntimeLifecycleTransitionEvidence {
  readonly from: AgentRuntimeLifecycleState;
  readonly to: AgentRuntimeLifecycleState;
  readonly allowed: true;
}

export interface AgentRuntimeLifecycleEvidence {
  readonly currentState: AgentRuntimeLifecycleState;
  readonly transitionCount: number;
  readonly ready: boolean;
  readonly stopped: boolean;
}

export interface AgentRuntimeLifecycleResult {
  readonly passed: boolean;
  readonly evidence: AgentRuntimeLifecycleEvidence;
}

const AGENT_RUNTIME_LIFECYCLE_STATES: readonly AgentRuntimeLifecycleState[] = Object.freeze([
  "CREATED",
  "INITIALIZING",
  "RUNTIME_BOUND",
  "MISSION_BOUND",
  "WORKFLOW_BOUND",
  "READY",
  "STOPPING",
  "STOPPED",
]);

const AGENT_RUNTIME_LIFECYCLE_TRANSITIONS: Readonly<
  Record<AgentRuntimeLifecycleState, readonly AgentRuntimeLifecycleState[]>
> = Object.freeze({
  CREATED: Object.freeze(["INITIALIZING", "STOPPED"]),
  INITIALIZING: Object.freeze(["RUNTIME_BOUND", "STOPPING"]),
  RUNTIME_BOUND: Object.freeze(["MISSION_BOUND", "STOPPING"]),
  MISSION_BOUND: Object.freeze(["WORKFLOW_BOUND", "STOPPING"]),
  WORKFLOW_BOUND: Object.freeze(["READY", "STOPPING"]),
  READY: Object.freeze(["STOPPING"]),
  STOPPING: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createAgentRuntimeLifecycleTransitionEvidence(
  from: AgentRuntimeLifecycleState,
  to: AgentRuntimeLifecycleState,
): AgentRuntimeLifecycleTransitionEvidence {
  assertAgentRuntimeLifecycleState(from);
  assertAgentRuntimeLifecycleState(to);

  if (!AGENT_RUNTIME_LIFECYCLE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "ALIFE-001: Agent Runtime Lifecycle rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createAgentRuntimeLifecycleEvidence(
  transitions: readonly AgentRuntimeLifecycleTransitionEvidence[],
): AgentRuntimeLifecycleEvidence {
  assertAgentRuntimeLifecycleTransitionSequence(transitions);

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

export function verifyAgentRuntimeLifecycle(
  transitions: readonly AgentRuntimeLifecycleTransitionEvidence[] = [
    createAgentRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createAgentRuntimeLifecycleTransitionEvidence("INITIALIZING", "RUNTIME_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("RUNTIME_BOUND", "MISSION_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("WORKFLOW_BOUND", "READY"),
  ],
): AgentRuntimeLifecycleResult {
  const evidence = createAgentRuntimeLifecycleEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertAgentRuntimeLifecycleState(
  value: string,
): asserts value is AgentRuntimeLifecycleState {
  if (!AGENT_RUNTIME_LIFECYCLE_STATES.includes(value as AgentRuntimeLifecycleState)) {
    throw new Error(
      "ALIFE-002: Agent Runtime Lifecycle rejects unknown internal states.",
    );
  }
}

function assertAgentRuntimeLifecycleTransitionSequence(
  transitions: readonly AgentRuntimeLifecycleTransitionEvidence[],
): void {
  let currentState: AgentRuntimeLifecycleState = "CREATED";

  for (const transition of transitions) {
    assertAgentRuntimeLifecycleState(transition.from);
    assertAgentRuntimeLifecycleState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "ALIFE-003: Agent Runtime Lifecycle rejects non-contiguous internal transitions.",
      );
    }

    if (!AGENT_RUNTIME_LIFECYCLE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "ALIFE-001: Agent Runtime Lifecycle rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

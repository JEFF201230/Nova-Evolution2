export type AgentRuntimeInternalState =
  | "CREATED"
  | "CONTEXT_READY"
  | "RUNTIME_BOUND"
  | "MISSION_BOUND"
  | "WORKFLOW_BOUND"
  | "READY"
  | "STOPPED";

export interface AgentRuntimeStateTransitionEvidence {
  readonly from: AgentRuntimeInternalState;
  readonly to: AgentRuntimeInternalState;
  readonly allowed: true;
}

export interface AgentRuntimeStateEvidence {
  readonly currentState: AgentRuntimeInternalState;
  readonly transitionCount: number;
  readonly ready: boolean;
}

export interface AgentRuntimeStateResult {
  readonly passed: boolean;
  readonly evidence: AgentRuntimeStateEvidence;
}

const AGENT_RUNTIME_INTERNAL_STATES: readonly AgentRuntimeInternalState[] = Object.freeze([
  "CREATED",
  "CONTEXT_READY",
  "RUNTIME_BOUND",
  "MISSION_BOUND",
  "WORKFLOW_BOUND",
  "READY",
  "STOPPED",
]);

const AGENT_RUNTIME_STATE_TRANSITIONS: Readonly<
  Record<AgentRuntimeInternalState, readonly AgentRuntimeInternalState[]>
> = Object.freeze({
  CREATED: Object.freeze(["CONTEXT_READY"]),
  CONTEXT_READY: Object.freeze(["RUNTIME_BOUND", "STOPPED"]),
  RUNTIME_BOUND: Object.freeze(["MISSION_BOUND", "STOPPED"]),
  MISSION_BOUND: Object.freeze(["WORKFLOW_BOUND", "STOPPED"]),
  WORKFLOW_BOUND: Object.freeze(["READY", "STOPPED"]),
  READY: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createAgentRuntimeStateTransitionEvidence(
  from: AgentRuntimeInternalState,
  to: AgentRuntimeInternalState,
): AgentRuntimeStateTransitionEvidence {
  assertAgentRuntimeInternalState(from);
  assertAgentRuntimeInternalState(to);

  if (!AGENT_RUNTIME_STATE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "ASTATE-001: Agent Runtime State rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createAgentRuntimeStateEvidence(
  transitions: readonly AgentRuntimeStateTransitionEvidence[],
): AgentRuntimeStateEvidence {
  assertAgentRuntimeStateTransitionSequence(transitions);

  const currentState = transitions.length === 0
    ? "CREATED"
    : transitions[transitions.length - 1].to;

  return Object.freeze({
    currentState,
    transitionCount: transitions.length,
    ready: currentState === "READY",
  });
}

export function verifyAgentRuntimeState(
  transitions: readonly AgentRuntimeStateTransitionEvidence[] = [
    createAgentRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createAgentRuntimeStateTransitionEvidence("CONTEXT_READY", "RUNTIME_BOUND"),
    createAgentRuntimeStateTransitionEvidence("RUNTIME_BOUND", "MISSION_BOUND"),
    createAgentRuntimeStateTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createAgentRuntimeStateTransitionEvidence("WORKFLOW_BOUND", "READY"),
  ],
): AgentRuntimeStateResult {
  const evidence = createAgentRuntimeStateEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertAgentRuntimeInternalState(
  value: string,
): asserts value is AgentRuntimeInternalState {
  if (!AGENT_RUNTIME_INTERNAL_STATES.includes(value as AgentRuntimeInternalState)) {
    throw new Error(
      "ASTATE-002: Agent Runtime State rejects unknown internal states.",
    );
  }
}

function assertAgentRuntimeStateTransitionSequence(
  transitions: readonly AgentRuntimeStateTransitionEvidence[],
): void {
  let currentState: AgentRuntimeInternalState = "CREATED";

  for (const transition of transitions) {
    assertAgentRuntimeInternalState(transition.from);
    assertAgentRuntimeInternalState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "ASTATE-003: Agent Runtime State rejects non-contiguous internal transitions.",
      );
    }

    if (!AGENT_RUNTIME_STATE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "ASTATE-001: Agent Runtime State rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

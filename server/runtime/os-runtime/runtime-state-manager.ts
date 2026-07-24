export type RuntimeInternalState =
  | "CREATED"
  | "READY"
  | "RUNNING"
  | "STOPPING"
  | "STOPPED";

export interface RuntimeStateTransitionEvidence {
  readonly from: RuntimeInternalState;
  readonly to: RuntimeInternalState;
  readonly allowed: true;
}

export interface RuntimeStateManagerEvidence {
  readonly currentState: RuntimeInternalState;
  readonly transitionCount: number;
  readonly ready: boolean;
}

export interface RuntimeStateManagerResult {
  readonly passed: boolean;
  readonly evidence: RuntimeStateManagerEvidence;
}

const RUNTIME_INTERNAL_STATES: readonly RuntimeInternalState[] = Object.freeze([
  "CREATED",
  "READY",
  "RUNNING",
  "STOPPING",
  "STOPPED",
]);

const RUNTIME_STATE_TRANSITIONS: Readonly<Record<RuntimeInternalState, readonly RuntimeInternalState[]>> = Object.freeze({
  CREATED: Object.freeze(["READY"]),
  READY: Object.freeze(["RUNNING", "STOPPED"]),
  RUNNING: Object.freeze(["STOPPING"]),
  STOPPING: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createRuntimeStateTransitionEvidence(
  from: RuntimeInternalState,
  to: RuntimeInternalState,
): RuntimeStateTransitionEvidence {
  assertRuntimeInternalState(from);
  assertRuntimeInternalState(to);

  if (!RUNTIME_STATE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "RSTATE-001: Runtime State Manager rejects unauthorized internal Runtime transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createRuntimeStateManagerEvidence(
  transitions: readonly RuntimeStateTransitionEvidence[],
): RuntimeStateManagerEvidence {
  assertRuntimeStateTransitionSequence(transitions);

  const currentState = transitions.length === 0
    ? "CREATED"
    : transitions[transitions.length - 1].to;

  return Object.freeze({
    currentState,
    transitionCount: transitions.length,
    ready: currentState === "READY" || currentState === "RUNNING",
  });
}

export function verifyRuntimeStateManager(
  transitions: readonly RuntimeStateTransitionEvidence[] = [
    createRuntimeStateTransitionEvidence("CREATED", "READY"),
  ],
): RuntimeStateManagerResult {
  const evidence = createRuntimeStateManagerEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertRuntimeInternalState(value: string): asserts value is RuntimeInternalState {
  if (!RUNTIME_INTERNAL_STATES.includes(value as RuntimeInternalState)) {
    throw new Error(
      "RSTATE-002: Runtime State Manager rejects unknown internal Runtime states.",
    );
  }
}

function assertRuntimeStateTransitionSequence(
  transitions: readonly RuntimeStateTransitionEvidence[],
): void {
  let currentState: RuntimeInternalState = "CREATED";

  for (const transition of transitions) {
    assertRuntimeInternalState(transition.from);
    assertRuntimeInternalState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "RSTATE-003: Runtime State Manager rejects non-contiguous internal Runtime transitions.",
      );
    }

    if (!RUNTIME_STATE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "RSTATE-001: Runtime State Manager rejects unauthorized internal Runtime transitions.",
      );
    }

    currentState = transition.to;
  }
}

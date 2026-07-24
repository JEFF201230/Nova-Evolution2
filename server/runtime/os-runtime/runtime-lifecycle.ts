export type RuntimeComponentLifecycleState =
  | "CREATED"
  | "STARTING"
  | "STARTED"
  | "STOPPING"
  | "STOPPED";

export interface RuntimeLifecycleTransitionEvidence {
  readonly from: RuntimeComponentLifecycleState;
  readonly to: RuntimeComponentLifecycleState;
  readonly allowed: true;
}

export interface RuntimeLifecycleEvidence {
  readonly currentState: RuntimeComponentLifecycleState;
  readonly transitionCount: number;
  readonly started: boolean;
  readonly stopped: boolean;
}

export interface RuntimeLifecycleResult {
  readonly passed: boolean;
  readonly evidence: RuntimeLifecycleEvidence;
}

const RUNTIME_LIFECYCLE_STATES: readonly RuntimeComponentLifecycleState[] = Object.freeze([
  "CREATED",
  "STARTING",
  "STARTED",
  "STOPPING",
  "STOPPED",
]);

const RUNTIME_LIFECYCLE_TRANSITIONS: Readonly<
  Record<RuntimeComponentLifecycleState, readonly RuntimeComponentLifecycleState[]>
> = Object.freeze({
  CREATED: Object.freeze(["STARTING", "STOPPED"]),
  STARTING: Object.freeze(["STARTED", "STOPPING"]),
  STARTED: Object.freeze(["STOPPING"]),
  STOPPING: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createRuntimeLifecycleTransitionEvidence(
  from: RuntimeComponentLifecycleState,
  to: RuntimeComponentLifecycleState,
): RuntimeLifecycleTransitionEvidence {
  assertRuntimeLifecycleState(from);
  assertRuntimeLifecycleState(to);

  if (!RUNTIME_LIFECYCLE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "RLIFE-001: Runtime Lifecycle rejects unauthorized component lifecycle transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createRuntimeLifecycleEvidence(
  transitions: readonly RuntimeLifecycleTransitionEvidence[],
): RuntimeLifecycleEvidence {
  assertRuntimeLifecycleTransitionSequence(transitions);

  const currentState = transitions.length === 0
    ? "CREATED"
    : transitions[transitions.length - 1].to;

  return Object.freeze({
    currentState,
    transitionCount: transitions.length,
    started: currentState === "STARTED",
    stopped: currentState === "STOPPED",
  });
}

export function verifyRuntimeLifecycle(
  transitions: readonly RuntimeLifecycleTransitionEvidence[] = [
    createRuntimeLifecycleTransitionEvidence("CREATED", "STARTING"),
    createRuntimeLifecycleTransitionEvidence("STARTING", "STARTED"),
  ],
): RuntimeLifecycleResult {
  const evidence = createRuntimeLifecycleEvidence(transitions);

  return Object.freeze({
    passed: evidence.started,
    evidence,
  });
}

function assertRuntimeLifecycleState(
  value: string,
): asserts value is RuntimeComponentLifecycleState {
  if (!RUNTIME_LIFECYCLE_STATES.includes(value as RuntimeComponentLifecycleState)) {
    throw new Error(
      "RLIFE-002: Runtime Lifecycle rejects unknown component lifecycle states.",
    );
  }
}

function assertRuntimeLifecycleTransitionSequence(
  transitions: readonly RuntimeLifecycleTransitionEvidence[],
): void {
  let currentState: RuntimeComponentLifecycleState = "CREATED";

  for (const transition of transitions) {
    assertRuntimeLifecycleState(transition.from);
    assertRuntimeLifecycleState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "RLIFE-003: Runtime Lifecycle rejects non-contiguous component lifecycle transitions.",
      );
    }

    if (!RUNTIME_LIFECYCLE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "RLIFE-001: Runtime Lifecycle rejects unauthorized component lifecycle transitions.",
      );
    }

    currentState = transition.to;
  }
}

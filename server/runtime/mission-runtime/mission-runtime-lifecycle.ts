export type MissionRuntimeLifecycleState =
  | "CREATED"
  | "INITIALIZING"
  | "BOUND"
  | "READY"
  | "STOPPING"
  | "STOPPED";

export interface MissionRuntimeLifecycleTransitionEvidence {
  readonly from: MissionRuntimeLifecycleState;
  readonly to: MissionRuntimeLifecycleState;
  readonly allowed: true;
}

export interface MissionRuntimeLifecycleEvidence {
  readonly currentState: MissionRuntimeLifecycleState;
  readonly transitionCount: number;
  readonly ready: boolean;
  readonly stopped: boolean;
}

export interface MissionRuntimeLifecycleResult {
  readonly passed: boolean;
  readonly evidence: MissionRuntimeLifecycleEvidence;
}

const MISSION_RUNTIME_LIFECYCLE_STATES: readonly MissionRuntimeLifecycleState[] = Object.freeze([
  "CREATED",
  "INITIALIZING",
  "BOUND",
  "READY",
  "STOPPING",
  "STOPPED",
]);

const MISSION_RUNTIME_LIFECYCLE_TRANSITIONS: Readonly<
  Record<MissionRuntimeLifecycleState, readonly MissionRuntimeLifecycleState[]>
> = Object.freeze({
  CREATED: Object.freeze(["INITIALIZING", "STOPPED"]),
  INITIALIZING: Object.freeze(["BOUND", "STOPPING"]),
  BOUND: Object.freeze(["READY", "STOPPING"]),
  READY: Object.freeze(["STOPPING"]),
  STOPPING: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createMissionRuntimeLifecycleTransitionEvidence(
  from: MissionRuntimeLifecycleState,
  to: MissionRuntimeLifecycleState,
): MissionRuntimeLifecycleTransitionEvidence {
  assertMissionRuntimeLifecycleState(from);
  assertMissionRuntimeLifecycleState(to);

  if (!MISSION_RUNTIME_LIFECYCLE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "MLIFE-001: Mission Runtime Lifecycle rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createMissionRuntimeLifecycleEvidence(
  transitions: readonly MissionRuntimeLifecycleTransitionEvidence[],
): MissionRuntimeLifecycleEvidence {
  assertMissionRuntimeLifecycleTransitionSequence(transitions);

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

export function verifyMissionRuntimeLifecycle(
  transitions: readonly MissionRuntimeLifecycleTransitionEvidence[] = [
    createMissionRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createMissionRuntimeLifecycleTransitionEvidence("INITIALIZING", "BOUND"),
    createMissionRuntimeLifecycleTransitionEvidence("BOUND", "READY"),
  ],
): MissionRuntimeLifecycleResult {
  const evidence = createMissionRuntimeLifecycleEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertMissionRuntimeLifecycleState(
  value: string,
): asserts value is MissionRuntimeLifecycleState {
  if (!MISSION_RUNTIME_LIFECYCLE_STATES.includes(value as MissionRuntimeLifecycleState)) {
    throw new Error(
      "MLIFE-002: Mission Runtime Lifecycle rejects unknown internal states.",
    );
  }
}

function assertMissionRuntimeLifecycleTransitionSequence(
  transitions: readonly MissionRuntimeLifecycleTransitionEvidence[],
): void {
  let currentState: MissionRuntimeLifecycleState = "CREATED";

  for (const transition of transitions) {
    assertMissionRuntimeLifecycleState(transition.from);
    assertMissionRuntimeLifecycleState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "MLIFE-003: Mission Runtime Lifecycle rejects non-contiguous internal transitions.",
      );
    }

    if (!MISSION_RUNTIME_LIFECYCLE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "MLIFE-001: Mission Runtime Lifecycle rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

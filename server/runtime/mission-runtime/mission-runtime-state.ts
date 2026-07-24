export type MissionRuntimeInternalState =
  | "CREATED"
  | "CONTEXT_READY"
  | "RUNTIME_BOUND"
  | "READY"
  | "STOPPED";

export interface MissionRuntimeStateTransitionEvidence {
  readonly from: MissionRuntimeInternalState;
  readonly to: MissionRuntimeInternalState;
  readonly allowed: true;
}

export interface MissionRuntimeStateEvidence {
  readonly currentState: MissionRuntimeInternalState;
  readonly transitionCount: number;
  readonly ready: boolean;
}

export interface MissionRuntimeStateResult {
  readonly passed: boolean;
  readonly evidence: MissionRuntimeStateEvidence;
}

const MISSION_RUNTIME_INTERNAL_STATES: readonly MissionRuntimeInternalState[] = Object.freeze([
  "CREATED",
  "CONTEXT_READY",
  "RUNTIME_BOUND",
  "READY",
  "STOPPED",
]);

const MISSION_RUNTIME_STATE_TRANSITIONS: Readonly<
  Record<MissionRuntimeInternalState, readonly MissionRuntimeInternalState[]>
> = Object.freeze({
  CREATED: Object.freeze(["CONTEXT_READY"]),
  CONTEXT_READY: Object.freeze(["RUNTIME_BOUND", "STOPPED"]),
  RUNTIME_BOUND: Object.freeze(["READY", "STOPPED"]),
  READY: Object.freeze(["STOPPED"]),
  STOPPED: Object.freeze([]),
});

export function createMissionRuntimeStateTransitionEvidence(
  from: MissionRuntimeInternalState,
  to: MissionRuntimeInternalState,
): MissionRuntimeStateTransitionEvidence {
  assertMissionRuntimeInternalState(from);
  assertMissionRuntimeInternalState(to);

  if (!MISSION_RUNTIME_STATE_TRANSITIONS[from].includes(to)) {
    throw new Error(
      "MSTATE-001: Mission Runtime State rejects unauthorized internal transitions.",
    );
  }

  return Object.freeze({
    from,
    to,
    allowed: true as const,
  });
}

export function createMissionRuntimeStateEvidence(
  transitions: readonly MissionRuntimeStateTransitionEvidence[],
): MissionRuntimeStateEvidence {
  assertMissionRuntimeStateTransitionSequence(transitions);

  const currentState = transitions.length === 0
    ? "CREATED"
    : transitions[transitions.length - 1].to;

  return Object.freeze({
    currentState,
    transitionCount: transitions.length,
    ready: currentState === "READY",
  });
}

export function verifyMissionRuntimeState(
  transitions: readonly MissionRuntimeStateTransitionEvidence[] = [
    createMissionRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createMissionRuntimeStateTransitionEvidence("CONTEXT_READY", "RUNTIME_BOUND"),
    createMissionRuntimeStateTransitionEvidence("RUNTIME_BOUND", "READY"),
  ],
): MissionRuntimeStateResult {
  const evidence = createMissionRuntimeStateEvidence(transitions);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

function assertMissionRuntimeInternalState(
  value: string,
): asserts value is MissionRuntimeInternalState {
  if (!MISSION_RUNTIME_INTERNAL_STATES.includes(value as MissionRuntimeInternalState)) {
    throw new Error(
      "MSTATE-002: Mission Runtime State rejects unknown internal states.",
    );
  }
}

function assertMissionRuntimeStateTransitionSequence(
  transitions: readonly MissionRuntimeStateTransitionEvidence[],
): void {
  let currentState: MissionRuntimeInternalState = "CREATED";

  for (const transition of transitions) {
    assertMissionRuntimeInternalState(transition.from);
    assertMissionRuntimeInternalState(transition.to);

    if (transition.from !== currentState) {
      throw new Error(
        "MSTATE-003: Mission Runtime State rejects non-contiguous internal transitions.",
      );
    }

    if (!MISSION_RUNTIME_STATE_TRANSITIONS[transition.from].includes(transition.to)) {
      throw new Error(
        "MSTATE-001: Mission Runtime State rejects unauthorized internal transitions.",
      );
    }

    currentState = transition.to;
  }
}

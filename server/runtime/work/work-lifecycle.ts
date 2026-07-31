import type { MissionState, RuntimeMission } from "../orchestrator/orchestrator-runtime.types.js";
import type { WorkLifecycle, WorkLifecycleState } from "./work-core.types.js";

export const WORK_LIFECYCLE_DECISION = "WCF-001-LIFECYCLE-001" as const;

/**
 * Canonical Work lifecycle vocabulary owned by WCF-001.
 *
 * These states are intentionally distinct from MissionState. Mission facts
 * are qualified through the exhaustive mapping below and are never exposed as
 * Work states implicitly.
 */
export const WORK_LIFECYCLE_STATES: readonly WorkLifecycleState[] = Object.freeze([
  "CREATED",
  "READY",
  "ACTIVE",
  "WAITING",
  "VALIDATING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export const WORK_LIFECYCLE_TRANSITIONS: Readonly<
  Record<WorkLifecycleState, readonly WorkLifecycleState[]>
> = Object.freeze({
  CREATED: workStates("READY", "CANCELLED"),
  READY: workStates("ACTIVE", "CANCELLED"),
  ACTIVE: workStates("WAITING", "VALIDATING", "COMPLETED", "FAILED", "CANCELLED"),
  WAITING: workStates("ACTIVE", "FAILED", "CANCELLED"),
  VALIDATING: workStates("ACTIVE", "COMPLETED", "FAILED", "CANCELLED"),
  COMPLETED: workStates(),
  FAILED: workStates("READY", "CANCELLED"),
  CANCELLED: workStates(),
});

export class WorkLifecycleProducer {
  produce(mission: RuntimeMission): WorkLifecycle {
    const current = workLifecycleStateOf(mission.state);
    const provenance = Object.freeze({
      sourceDomain: "WORK" as const,
      producer: WORK_LIFECYCLE_DECISION,
      sourceId: `${mission.projectId}/${mission.missionId}/${current}`,
      observedAt: mission.updatedAt,
    });

    return Object.freeze({
      current,
      observedAt: mission.updatedAt,
      provenance,
    });
  }
}

export function canTransitionWork(
  from: WorkLifecycleState,
  to: WorkLifecycleState,
): boolean {
  return from === to || WORK_LIFECYCLE_TRANSITIONS[from].includes(to);
}

export function isActiveWorkLifecycle(
  state: WorkLifecycleState,
): state is Exclude<WorkLifecycleState, "COMPLETED" | "CANCELLED"> {
  return state !== "COMPLETED" && state !== "CANCELLED";
}

export function workLifecycleStateOf(state: MissionState): WorkLifecycleState {
  switch (state) {
    case "DRAFT":
      return "CREATED";
    case "READY":
    case "ASSIGNED":
      return "READY";
    case "LOCKED":
    case "RUNNING":
    case "NEEDS_REVISION":
      return "ACTIVE";
    case "WAITING_INPUT":
    case "WAITING_DEPENDENCY":
    case "ESCALATED":
      return "WAITING";
    case "SUBMITTED":
    case "TECHNICAL_VALIDATION":
    case "DOCUMENTARY_VALIDATION":
    case "HUMAN_VALIDATION":
      return "VALIDATING";
    case "ACCEPTED":
    case "CERTIFIED":
      return "COMPLETED";
    case "REJECTED":
    case "FAILED":
    case "TIMEOUT":
      return "FAILED";
    case "CANCELLED":
      return "CANCELLED";
  }
}

function workStates(
  ...states: WorkLifecycleState[]
): readonly WorkLifecycleState[] {
  return Object.freeze(states);
}

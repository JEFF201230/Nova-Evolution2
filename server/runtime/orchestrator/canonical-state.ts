import type { MissionState } from "./orchestrator-runtime.types.js";

export const CANONICAL_STATE_SCHEMA_VERSION = "1.0.0" as const;

export type CanonicalMissionState =
  | "CREATED" | "ASSIGNED" | "STARTED" | "RUNNING" | "VALIDATING"
  | "COMPLETED" | "FAILED" | "TIMEOUT" | "CANCELLED" | "CERTIFIED" | "REJECTED";

export const CANONICAL_STATE_TRANSITIONS: Readonly<Record<CanonicalMissionState, readonly CanonicalMissionState[]>> = Object.freeze({
  CREATED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["STARTED", "CANCELLED"],
  STARTED: ["RUNNING", "FAILED", "TIMEOUT", "CANCELLED"],
  RUNNING: ["VALIDATING", "COMPLETED", "FAILED", "TIMEOUT", "CANCELLED"],
  VALIDATING: ["RUNNING", "COMPLETED", "FAILED", "TIMEOUT", "REJECTED", "CANCELLED"],
  COMPLETED: ["CERTIFIED", "REJECTED"],
  FAILED: ["ASSIGNED", "CANCELLED"],
  TIMEOUT: ["ASSIGNED", "CANCELLED"],
  CANCELLED: [],
  CERTIFIED: [],
  REJECTED: [],
});

export function mapPowerShellStatus(status: string | undefined): CanonicalMissionState {
  switch ((status ?? "").toUpperCase()) {
    case "SUCCESS": case "READY_FOR_REVIEW": case "COMPLETED": return "COMPLETED";
    case "CANCELLED": case "CANCELED": return "CANCELLED";
    case "TIMEOUT": case "TIMED_OUT": return "TIMEOUT";
    case "FAILED": case "FAILURE": case "BLOCKED": case "PARTIAL": return "FAILED";
    case "REJECTED": return "REJECTED";
    case "RUNNING": case "STARTED": return "RUNNING";
    case "VALIDATING": case "VALIDATION": return "VALIDATING";
    default: return "FAILED";
  }
}

export function canTransition(from: CanonicalMissionState, to: CanonicalMissionState): boolean {
  return CANONICAL_STATE_TRANSITIONS[from].includes(to);
}

/**
 * Detailed workflow states are projections of one canonical lifecycle.
 * The orchestrator event bus calls this function for every active transition.
 */
export function canonicalStateOf(state: MissionState): CanonicalMissionState {
  switch (state) {
    case "DRAFT":
      return "CREATED";
    case "READY":
    case "ASSIGNED":
      return "ASSIGNED";
    case "LOCKED":
      return "STARTED";
    case "RUNNING":
    case "WAITING_INPUT":
    case "WAITING_DEPENDENCY":
    case "ESCALATED":
    case "NEEDS_REVISION":
      return "RUNNING";
    case "SUBMITTED":
    case "TECHNICAL_VALIDATION":
    case "DOCUMENTARY_VALIDATION":
    case "HUMAN_VALIDATION":
      return "VALIDATING";
    case "ACCEPTED":
      return "COMPLETED";
    case "FAILED":
      return "FAILED";
    case "TIMEOUT":
      return "TIMEOUT";
    case "CANCELLED":
      return "CANCELLED";
    case "CERTIFIED":
      return "CERTIFIED";
    case "REJECTED":
      return "REJECTED";
  }
}

export function isCanonicalTransitionAllowed(from: MissionState, to: MissionState): boolean {
  const canonicalFrom = canonicalStateOf(from);
  const canonicalTo = canonicalStateOf(to);
  return canonicalFrom === canonicalTo || canTransition(canonicalFrom, canonicalTo);
}

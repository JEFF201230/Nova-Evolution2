import { ActionDomainError } from "./action.errors.js";

export const ACTION_STATUSES = Object.freeze([
  "PROPOSED",
  "READY",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const);

export type ActionStatus = (typeof ACTION_STATUSES)[number];

const TRANSITIONS: Readonly<Record<ActionStatus, readonly ActionStatus[]>> = Object.freeze({
  PROPOSED: Object.freeze(["READY", "CANCELLED"] as const),
  READY: Object.freeze(["IN_PROGRESS", "CANCELLED"] as const),
  IN_PROGRESS: Object.freeze(["BLOCKED", "COMPLETED", "FAILED", "CANCELLED"] as const),
  BLOCKED: Object.freeze(["READY", "IN_PROGRESS", "FAILED", "CANCELLED"] as const),
  FAILED: Object.freeze(["READY", "CANCELLED"] as const),
  COMPLETED: Object.freeze([] as const),
  CANCELLED: Object.freeze([] as const),
});

export function assertActionStatus(value: unknown): asserts value is ActionStatus {
  if (typeof value !== "string" || !(ACTION_STATUSES as readonly string[]).includes(value)) {
    throw new ActionDomainError(
      "ACTION_STATUS_TRANSITION_INVALID",
      "An Action must have exactly one status from the Actions vocabulary.",
    );
  }
}

export function canTransitionActionStatus(from: ActionStatus, to: ActionStatus): boolean {
  assertActionStatus(from);
  assertActionStatus(to);
  return TRANSITIONS[from].includes(to);
}

export function assertActionStatusTransition(from: ActionStatus, to: ActionStatus): void {
  if (from === "COMPLETED" || from === "CANCELLED") {
    throw new ActionDomainError("ACTION_TERMINAL", `${from} is a terminal Action status.`);
  }
  if (!canTransitionActionStatus(from, to)) {
    throw new ActionDomainError(
      "ACTION_STATUS_TRANSITION_INVALID",
      `Action status transition ${from} -> ${to} is not allowed.`,
    );
  }
}

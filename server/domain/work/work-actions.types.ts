import type { ActionStatus } from "../actions/index.js";

export const WORK_ACTIONS_SOURCE_DOMAIN = "ACTIONS" as const;

export interface WorkActionsReference {
  readonly projectId: string;
  readonly workId: string;
}

/** A transient, non-authoritative Work view derived from ACTIONS canonical state. */
export type WorkActionReadItem = Readonly<{
  actionId: string;
  status: ActionStatus;
  revision: number;
  graphRevision: number;
}>;

export type WorkActionsUnavailableReason =
  | "ACTIONS_READ_UNAVAILABLE"
  | "ACTIONS_READ_INCONSISTENT";

export type WorkActionsUnavailable = WorkActionsReference & Readonly<{
  status: "ACTIONS_UNAVAILABLE";
  sourceDomain: typeof WORK_ACTIONS_SOURCE_DOMAIN;
  reason: WorkActionsUnavailableReason;
}>;

export type WorkActionsAvailableEmpty = WorkActionsReference & Readonly<{
  status: "ACTIONS_AVAILABLE_EMPTY";
  sourceDomain: typeof WORK_ACTIONS_SOURCE_DOMAIN;
  actions: readonly [];
}>;

export type WorkActionsAvailable = WorkActionsReference & Readonly<{
  status: "ACTIONS_AVAILABLE";
  sourceDomain: typeof WORK_ACTIONS_SOURCE_DOMAIN;
  actions: readonly [WorkActionReadItem, ...WorkActionReadItem[]];
}>;

/** Exactly the three Work-visible states required by the ACTIONS contract. */
export type WorkActionsReadResult =
  | WorkActionsUnavailable
  | WorkActionsAvailableEmpty
  | WorkActionsAvailable;

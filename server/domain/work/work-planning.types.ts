import type {
  BusinessPeriod,
  PlanningProvenance,
} from "../planning/index.js";

export const WORK_PLANNING_SOURCE_DOMAIN = "PLANNING" as const;

export interface WorkPlanningReference {
  readonly projectId: string;
  readonly workId: string;
}

export type WorkPlanningUnavailableReason =
  | "PLANNING_READ_UNAVAILABLE"
  | "PLANNING_READ_INCONSISTENT";

export type WorkPlanningUnavailable = WorkPlanningReference & Readonly<{
  status: "PLANNING_UNAVAILABLE";
  sourceDomain: typeof WORK_PLANNING_SOURCE_DOMAIN;
  reason: WorkPlanningUnavailableReason;
}>;

export type WorkPlanningAbsent = WorkPlanningReference & Readonly<{
  status: "PLANNING_ABSENT";
  sourceDomain: typeof WORK_PLANNING_SOURCE_DOMAIN;
}>;

export type WorkPlanningWithdrawn = WorkPlanningReference & Readonly<{
  status: "PLANNING_WITHDRAWN";
  sourceDomain: typeof WORK_PLANNING_SOURCE_DOMAIN;
  latestVersion: number;
  revision: number;
  provenance: PlanningProvenance;
}>;

export type WorkPlanningAvailable = WorkPlanningReference & Readonly<{
  status: "PLANNING_AVAILABLE";
  sourceDomain: typeof WORK_PLANNING_SOURCE_DOMAIN;
  planningVersion: number;
  revision: number;
  applicability: BusinessPeriod;
  provenance: PlanningProvenance;
}>;

/** Exactly the four Work-visible states required by the Planning contract. */
export type WorkPlanningReadResult =
  | WorkPlanningUnavailable
  | WorkPlanningAbsent
  | WorkPlanningWithdrawn
  | WorkPlanningAvailable;

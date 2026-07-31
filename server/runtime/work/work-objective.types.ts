import type { WorkProvenance } from "./work-core.types.js";

export interface WorkObjectiveProvenance extends WorkProvenance {
  readonly sourceDomain: "MISSIONS";
}

/**
 * Internal Work Objective domain model.
 *
 * Null values are explicit source absences. They must never be replaced by
 * defaults, projections or inferred business values.
 */
export interface WorkObjective {
  readonly objectiveId: null;
  readonly work: {
    readonly projectId: string;
    readonly workId: string;
  };
  readonly label: string;
  readonly description: null;
  readonly status: null;
  readonly createdAt: string | null;
  readonly updatedAt: null;
  readonly provenance: WorkObjectiveProvenance;
}

export type WorkObjectiveFailureCode =
  | "WOBJ-ERR-001"
  | "WOBJ-ERR-002";

export class WorkObjectiveFailure extends Error {
  constructor(
    readonly code: WorkObjectiveFailureCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "WorkObjectiveFailure";
  }
}

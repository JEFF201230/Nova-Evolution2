import type { WorkProvenance } from "./work-core.types.js";

export const WORK_DELIVERABLES_EVIDENCE_SOURCE =
  "MissionReport.deliverableEvidence" as const;

export interface WorkDeliverable {
  readonly path: string;
  readonly size: number;
  readonly sha256: string;
  readonly modifiedAt: string;
  readonly runId: string;
}

export interface WorkDeliverablesProvenance extends WorkProvenance {
  readonly sourceDomain: "MISSIONS";
  readonly missionId: string;
  readonly reportId: string | null;
  readonly runId: string | null;
  readonly evidenceSource: typeof WORK_DELIVERABLES_EVIDENCE_SOURCE;
}

/**
 * Internal read-only Work Deliverables contract.
 *
 * The collection is a normalized view of the authoritative
 * MissionReport.deliverableEvidence entries. It owns no persistence and
 * introduces no Deliverable identity or business state.
 */
export interface WorkDeliverables {
  readonly projectId: string;
  readonly workId: string;
  readonly missionId: string;
  readonly deliverables: readonly WorkDeliverable[];
  readonly provenance: WorkDeliverablesProvenance;
}

export type WorkDeliverablesFailureCode =
  | "WDEL-ERR-001"
  | "WDEL-ERR-002";

export class WorkDeliverablesFailure extends Error {
  constructor(
    readonly code: WorkDeliverablesFailureCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "WorkDeliverablesFailure";
  }
}

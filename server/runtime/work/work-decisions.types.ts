import type {
  HumanApprovalDecision,
} from "../../nova-core/human-approval-workflow.js";
import type { WorkProvenance } from "./work-core.types.js";

export const WORK_DECISIONS_HISTORY_SOURCE =
  "HumanApprovalWorkflow.history" as const;
export const WORK_DECISIONS_PERSISTENCE_SOURCE =
  "IntegrationPersistedRecord" as const;
export const WORK_DECISIONS_RECORD_KIND = "HUMAN_APPROVAL" as const;
export const WORK_DECISIONS_BINDING_SOURCE = "WCF-001" as const;

export interface WorkDecisionsProvenance extends WorkProvenance {
  readonly sourceDomain: "MISSIONS";
  readonly producer: "HUMAN_APPROVAL_WORKFLOW";
  readonly missionId: string;
  readonly runId: string | null;
  readonly historySource: typeof WORK_DECISIONS_HISTORY_SOURCE;
  readonly persistenceSource: typeof WORK_DECISIONS_PERSISTENCE_SOURCE;
  readonly recordKind: typeof WORK_DECISIONS_RECORD_KIND;
  readonly workBindingSource: typeof WORK_DECISIONS_BINDING_SOURCE;
}

/**
 * Internal read-only Work Decisions contract.
 *
 * Decisions are exact immutable views of HumanApprovalDecision records. This
 * contract owns no producer, workflow, persistence or "current decision" rule.
 */
export interface WorkDecisions {
  readonly projectId: string;
  readonly workId: string;
  readonly decisions: readonly HumanApprovalDecision[];
  readonly provenance: WorkDecisionsProvenance;
}

export type WorkDecisionsFailureCode =
  | "WDEC-ERR-001"
  | "WDEC-ERR-002";

export class WorkDecisionsFailure extends Error {
  constructor(
    readonly code: WorkDecisionsFailureCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "WorkDecisionsFailure";
  }
}

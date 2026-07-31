import type { WorkProvenance } from "./work-core.types.js";

export const WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE =
  "RuntimeMission.assignedAgentId" as const;
export const WORK_TECHNICAL_AGENT_REGISTRY_SOURCE =
  "RuntimeAgent" as const;

export interface WorkTechnicalAgentDetails {
  readonly agentId: string;
  readonly missionTypes: readonly string[];
  readonly authorizedScopes: readonly string[];
}

export interface WorkTechnicalAgentProvenance extends WorkProvenance {
  readonly sourceDomain: "MISSIONS";
  readonly producer: "ORCHESTRATOR_RUNTIME";
  readonly missionId: string;
  readonly assignmentSource:
    typeof WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE;
  readonly agentSource:
    typeof WORK_TECHNICAL_AGENT_REGISTRY_SOURCE;
}

/**
 * Internal read-only Work Technical Agent contract.
 *
 * The agent fields are exact immutable views of RuntimeAgent. This contract
 * owns no identity, assignment, producer, persistence or People semantics.
 */
export interface WorkTechnicalAgent {
  readonly projectId: string;
  readonly workId: string;
  readonly missionId: string;
  readonly agent: WorkTechnicalAgentDetails | null;
  readonly provenance: WorkTechnicalAgentProvenance;
}

export type WorkTechnicalAgentFailureCode =
  | "WTA-ERR-001"
  | "WTA-ERR-002";

export class WorkTechnicalAgentFailure extends Error {
  constructor(
    readonly code: WorkTechnicalAgentFailureCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "WorkTechnicalAgentFailure";
  }
}

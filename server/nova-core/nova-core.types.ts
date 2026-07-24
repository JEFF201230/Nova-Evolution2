import type { MissionDefinition } from "../runtime/orchestrator/orchestrator-runtime.js";

export interface EvidenceSubmission {
  reportId?: string;
  reportType?: string;
  deliverables: string[];
  filesChanged: string[];
  checks: string[];
  blockers?: string[];
  errors?: string[];
  scopeConfirmed: boolean;
}

export interface NovaCoreContract {
  createMission(definition: MissionDefinition): Promise<{
    created: boolean;
    mission: import("../runtime/orchestrator/orchestrator-runtime.js").RuntimeMission;
  }>;
}

export class NovaCoreError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "NovaCoreError";
  }
}

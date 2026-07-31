import type {
  RuntimeAgent,
  RuntimeSnapshot,
} from "../orchestrator/orchestrator-runtime.types.js";
import {
  WorkCoreFoundation,
  type WorkCoreSource,
} from "./work-core-foundation.js";
import { WorkTechnicalAgentService } from "./work-technical-agent.service.js";
import {
  WorkTechnicalAgentFailure,
  type WorkTechnicalAgent,
} from "./work-technical-agent.types.js";

export interface WorkTechnicalAgentSource extends WorkCoreSource {
  exportSnapshot(): Pick<RuntimeSnapshot, "agents">;
}

/**
 * Internal read-only Work Technical Agent query.
 *
 * RuntimeMission.assignedAgentId owns the assignment and RuntimeAgent owns the
 * exposed agent fields. This query has no HTTP, BFF, Frontend, fixture,
 * persistence, producer or human identity dependency.
 */
export class WorkTechnicalAgentQuery {
  private readonly workCore: WorkCoreFoundation;

  constructor(
    private readonly source: WorkTechnicalAgentSource,
    private readonly technicalAgentService =
      new WorkTechnicalAgentService(),
  ) {
    this.workCore = new WorkCoreFoundation(source);
  }

  get(projectId: string, workId: string): WorkTechnicalAgent {
    const work = this.workCore.load(projectId, workId);
    const mission = this.source.getMission(
      work.identity.mission.projectId,
      work.identity.mission.missionId,
    );
    if (mission === null || mission === undefined) {
      throw new WorkTechnicalAgentFailure(
        "WTA-ERR-002",
        "The authoritative RuntimeMission changed during Work Technical Agent resolution.",
      );
    }

    const assignedAgentId = mission.assignedAgentId;
    const agent =
      assignedAgentId === null
        ? null
        : resolveAgent(
            this.source.exportSnapshot().agents,
            assignedAgentId,
          );

    return this.technicalAgentService.create(work, mission, agent);
  }
}

function resolveAgent(
  agents: readonly RuntimeAgent[],
  assignedAgentId: string,
): RuntimeAgent {
  const agent = agents.find(
    (candidate) => candidate.agentId === assignedAgentId,
  );
  if (agent === undefined) {
    throw new WorkTechnicalAgentFailure(
      "WTA-ERR-002",
      "RuntimeMission.assignedAgentId does not resolve in the RuntimeAgent registry.",
    );
  }
  return agent;
}

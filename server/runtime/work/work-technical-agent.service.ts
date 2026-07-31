import type {
  RuntimeAgent,
  RuntimeMission,
} from "../orchestrator/orchestrator-runtime.types.js";
import type { WorkCoreAggregate } from "./work-core.types.js";
import { createWorkTechnicalAgent } from "./work-technical-agent.model.js";
import {
  WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE,
  WORK_TECHNICAL_AGENT_REGISTRY_SOURCE,
  WorkTechnicalAgentFailure,
  type WorkTechnicalAgent,
} from "./work-technical-agent.types.js";

/**
 * Reads the RuntimeAgent selected by RuntimeMission.assignedAgentId.
 *
 * It performs no assignment, write, inference, sorting, caching or People
 * identity mapping.
 */
export class WorkTechnicalAgentService {
  create(
    work: WorkCoreAggregate,
    mission: RuntimeMission,
    agent: RuntimeAgent | null,
  ): WorkTechnicalAgent {
    if (
      work.identity.provenance.sourceDomain !== "MISSIONS"
      || work.identity.projectId !== mission.projectId
      || work.identity.workId !== mission.missionId
      || work.identity.mission.projectId !== mission.projectId
      || work.identity.mission.missionId !== mission.missionId
    ) {
      throw new WorkTechnicalAgentFailure(
        "WTA-ERR-002",
        "Work identity is not bound to the authoritative RuntimeMission.",
      );
    }

    if (
      (mission.assignedAgentId === null && agent !== null)
      || (
        mission.assignedAgentId !== null
        && (agent === null || agent.agentId !== mission.assignedAgentId)
      )
    ) {
      throw new WorkTechnicalAgentFailure(
        "WTA-ERR-002",
        "RuntimeMission.assignedAgentId does not resolve to the supplied RuntimeAgent.",
      );
    }

    return createWorkTechnicalAgent({
      projectId: work.identity.projectId,
      workId: work.identity.workId,
      missionId: mission.missionId,
      agent:
        agent === null
          ? null
          : {
              agentId: agent.agentId,
              missionTypes: agent.missionTypes,
              authorizedScopes: agent.authorizedScopes,
            },
      provenance: {
        sourceDomain: "MISSIONS",
        producer: "ORCHESTRATOR_RUNTIME",
        sourceId:
          mission.assignedAgentId === null
            ? `${mission.projectId}/${mission.missionId}`
            : `${mission.projectId}/${mission.missionId}/${mission.assignedAgentId}`,
        observedAt: mission.updatedAt,
        missionId: mission.missionId,
        assignmentSource: WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE,
        agentSource: WORK_TECHNICAL_AGENT_REGISTRY_SOURCE,
      },
    });
  }
}

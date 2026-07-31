import {
  parseHomeActiveWorkResponse,
  type HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import type { RuntimeMission } from "../runtime/orchestrator/orchestrator-runtime.types.js";
import {
  WorkCoreFoundation,
  isActiveWorkLifecycle,
  type WorkCoreSource,
} from "../runtime/work/work-core.js";

export interface HomeActiveWorkRuntimeSource extends WorkCoreSource {
  listMissions(projectId?: string): RuntimeMission[];
}

/**
 * Minimal read-only query for HOME Active Work.
 *
 * Selection is performed in the Runtime boundary so React never derives
 * business activity from lifecycle values.
 */
export class HomeActiveWorkQuery {
  private readonly workCore: WorkCoreFoundation;

  constructor(private readonly source: HomeActiveWorkRuntimeSource) {
    this.workCore = new WorkCoreFoundation(source);
  }

  list(): HomeActiveWorkResponse {
    const works = this.source
      .listMissions()
      .map((mission) =>
        this.workCore.load(mission.projectId, mission.missionId),
      )
      .filter((work) => isActiveWorkLifecycle(work.lifecycle.current))
      .map((work) => ({
        workIdentity: {
          workId: work.identity.workId,
          projectId: work.identity.projectId,
        },
        mission: {
          projectId: work.identity.mission.projectId,
          missionId: work.identity.mission.missionId,
        },
        goal: work.identity.objective,
        lifecycle: work.lifecycle.current,
        progress: work.progression.percentage,
        updatedAt: work.timestamps.updatedAt,
        provenance: {
          identity: work.identity.provenance,
          lifecycle: work.lifecycle.provenance,
          progress: work.progression.provenance,
        },
      }));

    return parseHomeActiveWorkResponse({ works });
  }
}

import type { MissionReport } from "../orchestrator/orchestrator-runtime.types.js";
import {
  WorkCoreFoundation,
  type WorkCoreSource,
} from "./work-core-foundation.js";
import { WorkDeliverablesService } from "./work-deliverables.service.js";
import type { WorkDeliverables } from "./work-deliverables.types.js";

export interface WorkDeliverablesSource extends WorkCoreSource {
  getReport(
    projectId: string,
    missionId: string,
  ): MissionReport | null | undefined;
}

/**
 * Internal read-only Work Deliverables query.
 *
 * Report selection is delegated to the canonical Runtime getReport rule,
 * which follows RuntimeMission.reportId. This query has no HTTP, BFF,
 * Frontend, fixture, persistence or producer dependency.
 */
export class WorkDeliverablesQuery {
  private readonly workCore: WorkCoreFoundation;

  constructor(
    private readonly source: WorkDeliverablesSource,
    private readonly deliverablesService = new WorkDeliverablesService(),
  ) {
    this.workCore = new WorkCoreFoundation(source);
  }

  get(projectId: string, workId: string): WorkDeliverables {
    const work = this.workCore.load(projectId, workId);
    const report = this.source.getReport(
      work.identity.mission.projectId,
      work.identity.mission.missionId,
    );

    return this.deliverablesService.create(work, report);
  }
}

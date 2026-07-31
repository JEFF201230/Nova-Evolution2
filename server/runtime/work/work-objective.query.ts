import {
  WorkCoreFoundation,
  type WorkCoreSource,
} from "./work-core-foundation.js";
import { WorkObjectiveService } from "./work-objective.service.js";
import type { WorkObjective } from "./work-objective.types.js";

/**
 * Internal read-only Work Objective query.
 *
 * This query has no HTTP, BFF, Frontend, DTO or projection dependency.
 */
export class WorkObjectiveQuery {
  private readonly workCore: WorkCoreFoundation;

  constructor(
    source: WorkCoreSource,
    private readonly objectiveService = new WorkObjectiveService(),
  ) {
    this.workCore = new WorkCoreFoundation(source);
  }

  get(projectId: string, workId: string): WorkObjective {
    return this.objectiveService.create(
      this.workCore.load(projectId, workId),
    );
  }
}

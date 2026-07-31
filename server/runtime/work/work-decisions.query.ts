import type {
  HumanApprovalWorkflow,
} from "../../nova-core/human-approval-workflow.js";
import {
  WorkCoreFoundation,
  type WorkCoreSource,
} from "./work-core-foundation.js";
import { WorkDecisionsService } from "./work-decisions.service.js";
import type { WorkDecisions } from "./work-decisions.types.js";

export type WorkDecisionsHistorySource =
  Pick<HumanApprovalWorkflow, "history">;

/**
 * Internal read-only Work Decisions query.
 *
 * HumanApprovalWorkflow.history owns HUMAN_APPROVAL filtering and persistent
 * order. This query owns no HTTP, BFF, Frontend, fixture, persistence,
 * workflow or decision producer.
 */
export class WorkDecisionsQuery {
  private readonly workCore: WorkCoreFoundation;

  constructor(
    source: WorkCoreSource,
    private readonly historySource: WorkDecisionsHistorySource,
    private readonly decisionsService = new WorkDecisionsService(),
  ) {
    this.workCore = new WorkCoreFoundation(source);
  }

  async get(
    projectId: string,
    workId: string,
  ): Promise<WorkDecisions> {
    const work = this.workCore.load(projectId, workId);
    const runId = work.progression.provenance.runId;
    const decisions =
      runId === null
        ? Object.freeze([])
        : await this.historySource.history(
            work.identity.mission.missionId,
            runId,
          );

    return this.decisionsService.create(work, decisions);
  }
}

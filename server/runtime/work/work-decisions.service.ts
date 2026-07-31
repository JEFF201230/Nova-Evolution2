import type {
  HumanApprovalDecision,
} from "../../nova-core/human-approval-workflow.js";
import type { WorkCoreAggregate } from "./work-core.types.js";
import { createWorkDecisions } from "./work-decisions.model.js";
import {
  WORK_DECISIONS_BINDING_SOURCE,
  WORK_DECISIONS_HISTORY_SOURCE,
  WORK_DECISIONS_PERSISTENCE_SOURCE,
  WORK_DECISIONS_RECORD_KIND,
  WorkDecisionsFailure,
  type WorkDecisions,
} from "./work-decisions.types.js";

/**
 * Builds an immutable Work view from HumanApprovalWorkflow.history output.
 *
 * It performs no write, filtering, inference, sorting or current-decision
 * selection. Source filtering and persistent order remain owned by history.
 */
export class WorkDecisionsService {
  create(
    work: WorkCoreAggregate,
    decisions: readonly HumanApprovalDecision[],
  ): WorkDecisions {
    const mission = work.identity.mission;
    if (
      work.identity.provenance.sourceDomain !== "MISSIONS"
      || work.identity.workId !== mission.missionId
      || work.identity.projectId !== mission.projectId
    ) {
      throw new WorkDecisionsFailure(
        "WDEC-ERR-002",
        "Work identity is not bound to the authoritative Mission producer.",
      );
    }

    const runId = work.progression.provenance.runId;
    return createWorkDecisions({
      projectId: work.identity.projectId,
      workId: work.identity.workId,
      decisions,
      provenance: {
        sourceDomain: "MISSIONS",
        producer: "HUMAN_APPROVAL_WORKFLOW",
        sourceId:
          runId === null
            ? `${mission.projectId}/${mission.missionId}`
            : `${mission.projectId}/${mission.missionId}/${runId}`,
        observedAt: work.progression.provenance.observedAt,
        missionId: mission.missionId,
        runId,
        historySource: WORK_DECISIONS_HISTORY_SOURCE,
        persistenceSource: WORK_DECISIONS_PERSISTENCE_SOURCE,
        recordKind: WORK_DECISIONS_RECORD_KIND,
        workBindingSource: WORK_DECISIONS_BINDING_SOURCE,
      },
    });
  }
}

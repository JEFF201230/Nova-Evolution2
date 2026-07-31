import type { MissionReport } from "../orchestrator/orchestrator-runtime.types.js";
import type { WorkCoreAggregate } from "./work-core.types.js";
import { createWorkDeliverables } from "./work-deliverables.model.js";
import {
  WORK_DELIVERABLES_EVIDENCE_SOURCE,
  WorkDeliverablesFailure,
  type WorkDeliverables,
  type WorkDeliverablesProvenance,
} from "./work-deliverables.types.js";

/**
 * Derives Work Deliverables from the MissionReport selected by the
 * Orchestrator Runtime. It performs no write, inference, sorting or caching.
 */
export class WorkDeliverablesService {
  create(
    work: WorkCoreAggregate,
    report: MissionReport | null | undefined,
  ): WorkDeliverables {
    const mission = work.identity.mission;
    if (
      work.identity.provenance.sourceDomain !== "MISSIONS"
      || work.identity.workId !== mission.missionId
      || work.identity.projectId !== mission.projectId
    ) {
      throw new WorkDeliverablesFailure(
        "WDEL-ERR-002",
        "Work identity is not bound to the authoritative Mission producer.",
      );
    }

    if (report === null || report === undefined) {
      return createWorkDeliverables({
        projectId: work.identity.projectId,
        workId: work.identity.workId,
        missionId: mission.missionId,
        deliverables: [],
        provenance: emptyProvenance(work),
      });
    }

    if (
      report.projectId !== mission.projectId
      || report.missionId !== mission.missionId
    ) {
      throw new WorkDeliverablesFailure(
        "WDEL-ERR-002",
        "The selected MissionReport does not belong to the Work Mission.",
      );
    }

    return createWorkDeliverables({
      projectId: work.identity.projectId,
      workId: work.identity.workId,
      missionId: mission.missionId,
      deliverables: (report.deliverableEvidence ?? []).map((evidence) => ({
        path: evidence.path,
        size: evidence.size,
        sha256: evidence.sha256,
        modifiedAt: evidence.modifiedAt,
        runId: evidence.runId,
      })),
      provenance: {
        sourceDomain: "MISSIONS",
        producer: "ORCHESTRATOR_RUNTIME",
        sourceId: `${report.projectId}/${report.missionId}/${report.reportId}`,
        observedAt: report.submittedAt,
        missionId: report.missionId,
        reportId: report.reportId,
        runId: report.runId ?? null,
        evidenceSource: WORK_DELIVERABLES_EVIDENCE_SOURCE,
      },
    });
  }
}

function emptyProvenance(
  work: WorkCoreAggregate,
): WorkDeliverablesProvenance {
  return {
    sourceDomain: "MISSIONS",
    producer: "ORCHESTRATOR_RUNTIME",
    sourceId: work.identity.provenance.sourceId,
    observedAt: work.identity.provenance.observedAt,
    missionId: work.identity.mission.missionId,
    reportId: null,
    runId: null,
    evidenceSource: WORK_DELIVERABLES_EVIDENCE_SOURCE,
  };
}

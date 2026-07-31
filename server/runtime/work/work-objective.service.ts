import type { WorkCoreAggregate } from "./work-core.types.js";
import { createWorkObjective } from "./work-objective.model.js";
import {
  WorkObjectiveFailure,
  type WorkObjective,
  type WorkObjectiveProvenance,
} from "./work-objective.types.js";

/**
 * Produces the Objective sub-domain exclusively from authoritative Work Core
 * identity data. It performs no inference from lifecycle or progression.
 */
export class WorkObjectiveService {
  create(work: WorkCoreAggregate): WorkObjective {
    if (work.identity.provenance.sourceDomain !== "MISSIONS") {
      throw new WorkObjectiveFailure(
        "WOBJ-ERR-002",
        "Work identity is not backed by the authoritative Mission producer.",
      );
    }

    const provenance: WorkObjectiveProvenance = {
      sourceDomain: "MISSIONS",
      producer: work.identity.provenance.producer,
      sourceId: work.identity.provenance.sourceId,
      observedAt: work.identity.provenance.observedAt,
    };

    return createWorkObjective({
      objectiveId: null,
      work: {
        projectId: work.identity.projectId,
        workId: work.identity.workId,
      },
      label: work.identity.objective,
      description: null,
      status: null,
      createdAt: work.timestamps.createdAt,
      updatedAt: null,
      provenance,
    });
  }
}

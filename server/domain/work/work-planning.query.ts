import {
  PlanningProvenance,
  PlanningRevision,
  PlanningVersion,
  WorkReference,
  type GetCurrentPlanningResult,
} from "../planning/index.js";
import {
  WORK_PLANNING_SOURCE_DOMAIN,
  type WorkPlanningReadResult,
  type WorkPlanningReference,
} from "./work-planning.types.js";

export interface WorkPlanningReadSource {
  getCurrentPlanning(workReference: WorkReference): GetCurrentPlanningResult;
}

/**
 * Internal, read-only Work -> Planning boundary.
 *
 * Planning remains the sole owner and source of every returned Planning value.
 * This adapter owns no Planning aggregate, command, event, cache or persistence.
 */
export class WorkPlanningQuery {
  constructor(private readonly planning: WorkPlanningReadSource) {}

  get(work: WorkPlanningReference): WorkPlanningReadResult {
    const workReference = WorkReference.of(work.projectId, work.workId);
    const reference = Object.freeze({
      projectId: workReference.projectIdentity,
      workId: workReference.workIdentity,
    });

    let result: unknown;
    try {
      result = this.planning.getCurrentPlanning(workReference);
    } catch {
      return unavailable(reference, "PLANNING_READ_UNAVAILABLE");
    }

    if (!isRecord(result) || typeof result.status !== "string") {
      return unavailable(reference, "PLANNING_READ_INCONSISTENT");
    }
    if (result.status === "UNAVAILABLE") {
      return unavailable(reference, "PLANNING_READ_UNAVAILABLE");
    }
    if (result.status === "ABSENT") {
      return Object.freeze({
        ...reference,
        status: "PLANNING_ABSENT",
        sourceDomain: WORK_PLANNING_SOURCE_DOMAIN,
      });
    }
    if (!isConsistent(result, workReference)) {
      return unavailable(reference, "PLANNING_READ_INCONSISTENT");
    }
    if (result.status === "WITHDRAWN") {
      return Object.freeze({
        ...reference,
        status: "PLANNING_WITHDRAWN",
        sourceDomain: WORK_PLANNING_SOURCE_DOMAIN,
        latestVersion: result.latestVersion.value,
        revision: result.revision,
        provenance: result.provenance,
      });
    }
    return Object.freeze({
      ...reference,
      status: "PLANNING_AVAILABLE",
      sourceDomain: WORK_PLANNING_SOURCE_DOMAIN,
      planningVersion: result.planning.version.value,
      revision: result.revision,
      applicability: result.planning.applicability,
      provenance: result.provenance,
    });
  }
}

function unavailable(
  reference: Readonly<{ projectId: string; workId: string }>,
  reason: "PLANNING_READ_UNAVAILABLE" | "PLANNING_READ_INCONSISTENT",
): WorkPlanningReadResult {
  return Object.freeze({
    ...reference,
    status: "PLANNING_UNAVAILABLE",
    sourceDomain: WORK_PLANNING_SOURCE_DOMAIN,
    reason,
  });
}

function isConsistent(
  result: Readonly<Record<string, unknown>>,
  requested: WorkReference,
): result is Extract<GetCurrentPlanningResult, { status: "WITHDRAWN" | "CURRENT" }> {
  if (!(result.workReference instanceof WorkReference)
    || !result.workReference.equals(requested)
    || !Number.isSafeInteger(result.revision)
    || (result.revision as number) < 1
    || !(result.provenance instanceof PlanningProvenance)) {
    return false;
  }
  if (result.status === "WITHDRAWN") {
    return result.latestVersion instanceof PlanningVersion;
  }
  return result.status === "CURRENT"
    && result.planning instanceof PlanningRevision
    && result.planning.version instanceof PlanningVersion
    && result.planning.provenance === result.provenance
    && result.planning.applicability.provenance instanceof PlanningProvenance;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

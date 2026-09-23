import {
  BusinessInstant,
  BusinessPeriod,
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

export interface WorkPlanningClock { now(): Date; }
const SYSTEM_CLOCK: WorkPlanningClock = Object.freeze({ now: () => new Date() });

/**
 * Internal, read-only Work -> Planning boundary.
 *
 * Planning remains the sole owner and source of every returned Planning value.
 * This adapter owns no Planning aggregate, command, event, cache or persistence.
 */
export class WorkPlanningQuery {
  constructor(
    private readonly planning: WorkPlanningReadSource,
    private readonly clock: WorkPlanningClock = SYSTEM_CLOCK,
  ) {}

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
    const projection = projectOverviewPlanning(result.planning, this.clock.now());
    if (projection === null) {
      return unavailable(reference, "PLANNING_READ_INCONSISTENT");
    }
    return Object.freeze({
      ...reference,
      status: "PLANNING_AVAILABLE",
      sourceDomain: WORK_PLANNING_SOURCE_DOMAIN,
      planningVersion: result.planning.version.value,
      revision: result.revision,
      applicability: result.planning.applicability,
      phase: projection.phase,
      dueAt: projection.dueAt,
      dependencies: projection.dependencies,
      provenance: result.provenance,
    });
  }
}

function projectOverviewPlanning(
  planning: PlanningRevision,
  observedAt: Date,
): Readonly<{
  phase: Readonly<{ current: number; total: number; phaseId: string }>;
  dueAt: string | null;
  dependencies: readonly Readonly<{ prerequisite: string; dependent: string }>[];
}> | null {
  if (!Number.isFinite(observedAt.getTime()) || planning.phases.length === 0) return null;
  const scheduled = planning.phases.map((phase, index) => ({
    phase,
    index,
    times: planning.schedule.entries
      .filter((entry) => entry.element.equals(phase.reference))
      .map((entry) => entry.time),
  }));
  const current = scheduled.find((entry) => entry.times.some((time) => contains(time, observedAt)))
    ?? [...scheduled]
      .filter((entry) => entry.times.some((time) => startEpoch(time) <= observedAt.getTime()))
      .sort((left, right) => latestStart(right.times) - latestStart(left.times) || right.index - left.index)[0];
  if (current === undefined) return null;
  const endpoints = planning.schedule.entries.flatMap((entry) => endEpoch(entry.time));
  const dueEpoch = endpoints.length === 0 ? null : Math.max(...endpoints);
  return Object.freeze({
    phase: Object.freeze({
      current: current.index + 1,
      total: planning.phases.length,
      phaseId: current.phase.id.value,
    }),
    dueAt: dueEpoch === null ? null : new Date(dueEpoch).toISOString(),
    dependencies: Object.freeze(planning.dependencies.map((dependency) => Object.freeze({
      prerequisite: dependency.prerequisite.key,
      dependent: dependency.dependent.key,
    }))),
  });
}

function contains(time: BusinessInstant | BusinessPeriod, observedAt: Date): boolean {
  const instant = observedAt.getTime();
  if (time instanceof BusinessInstant) return time.value.getTime() === instant;
  const start = time.start?.value.getTime() ?? Number.NEGATIVE_INFINITY;
  const end = time.end?.value.getTime() ?? Number.POSITIVE_INFINITY;
  return (time.startBoundary === "INCLUSIVE" ? instant >= start : instant > start)
    && (time.endBoundary === "INCLUSIVE" ? instant <= end : instant < end);
}

function endEpoch(time: BusinessInstant | BusinessPeriod): readonly number[] {
  // An isolated business instant can be a start, checkpoint, or target. Planning
  // does not qualify it as a Work due date, so promoting it to dueAt would invent
  // semantics. Only an explicit period end is an admissible schedule deadline.
  if (time instanceof BusinessInstant) return [];
  return time.end === null ? [] : [time.end.value.getTime()];
}

function startEpoch(time: BusinessInstant | BusinessPeriod): number {
  if (time instanceof BusinessInstant) return time.value.getTime();
  return time.start?.value.getTime() ?? Number.NEGATIVE_INFINITY;
}

function latestStart(times: readonly (BusinessInstant | BusinessPeriod)[]): number {
  return Math.max(...times.map(startEpoch));
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

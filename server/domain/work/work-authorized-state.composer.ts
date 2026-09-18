import {
  WorkCoreFailure,
  type WorkCoreAggregate,
  type WorkCoreFoundation,
  type WorkDecisions,
  type WorkDecisionsQuery,
  type WorkDeliverables,
  type WorkDeliverablesQuery,
} from "../../runtime/work/work-core.js";
import type { WorkPeopleQuery } from "../../runtime/work/work-people.query.js";
import type { WorkPeopleReadResult } from "../../runtime/work/work-people.types.js";
import type { WorkActionsQuery } from "./work-actions.query.js";
import type { WorkActionsReadResult } from "./work-actions.types.js";
import type { WorkEvidenceQuery } from "./work-evidence.query.js";
import type {
  WorkEvidenceReadResult,
  WorkEvidenceReference,
} from "./work-evidence.types.js";
import type { WorkPlanningQuery } from "./work-planning.query.js";
import type { WorkPlanningReadResult } from "./work-planning.types.js";
import type {
  WorkAuthorizedContribution,
  WorkAuthorizedState,
  WorkAuthorizedStateNotFoundReason,
  WorkAuthorizedStateUnavailableReason,
} from "./work-authorized-state.types.js";

export type WorkAuthorizedCoreReadSource = Pick<WorkCoreFoundation, "load">;
export type WorkAuthorizedDeliverablesReadSource = Pick<WorkDeliverablesQuery, "get">;
export type WorkAuthorizedDecisionsReadSource = Pick<WorkDecisionsQuery, "get">;
export type WorkAuthorizedPeopleReadSource = Pick<WorkPeopleQuery, "get">;
export type WorkAuthorizedPlanningReadSource = Pick<WorkPlanningQuery, "get">;
export type WorkAuthorizedActionsReadSource = Pick<WorkActionsQuery, "get">;
export type WorkAuthorizedEvidenceReadSource<TCertification> =
  Pick<WorkEvidenceQuery<TCertification>, "get">;

export type WorkAuthorizedStateReadSources<TCertification = unknown> = Readonly<{
  workCore: WorkAuthorizedCoreReadSource;
  deliverables: WorkAuthorizedDeliverablesReadSource;
  decisions: WorkAuthorizedDecisionsReadSource;
  people: WorkAuthorizedPeopleReadSource;
  planning: WorkAuthorizedPlanningReadSource;
  actions: WorkAuthorizedActionsReadSource;
  evidence: WorkAuthorizedEvidenceReadSource<TCertification>;
}>;

export interface WorkAuthorizedStateClock {
  now(): Date;
}

const SYSTEM_CLOCK: WorkAuthorizedStateClock = Object.freeze({
  now: (): Date => new Date(),
});

/**
 * Internal, read-only Work state composition boundary for Intelligence.
 *
 * The composer accepts only certified read capabilities. It has no repository,
 * command, event, cache or persistence port and never adjudicates contributions.
 */
export class WorkAuthorizedStateComposer<TCertification = unknown> {
  constructor(
    private readonly sources: WorkAuthorizedStateReadSources<TCertification>,
    private readonly clock: WorkAuthorizedStateClock = SYSTEM_CLOCK,
  ) {}

  async compose(work: WorkEvidenceReference): Promise<WorkAuthorizedState<TCertification>> {
    const reference = canonicalReference(work);
    const observedAt = observationTime(this.clock.now());

    const workCore = readWorkCore(this.sources.workCore, reference);
    const deliverables = readDeliverables(this.sources.deliverables, reference);
    const decisionsPromise = readDecisions(this.sources.decisions, reference);
    const people = readPeople(this.sources.people, reference, observedAt);
    const planning = readPlanning(this.sources.planning, reference);
    const actions = readActions(this.sources.actions, reference);
    const evidence = readEvidence(this.sources.evidence, reference);
    const decisions = await decisionsPromise;

    return Object.freeze({
      workReference: reference,
      compositionObservedAt: observedAt.toISOString(),
      workCore,
      deliverables,
      decisions,
      people,
      planning,
      actions,
      evidence,
    });
  }
}

function readWorkCore(
  source: WorkAuthorizedCoreReadSource,
  work: WorkEvidenceReference,
): WorkAuthorizedContribution<WorkCoreAggregate> {
  try {
    const value = source.load(work.projectId, work.workId);
    if (value.identity.projectId !== work.projectId || value.identity.workId !== work.workId) {
      return unavailable("WORK_CORE_READ_UNAVAILABLE");
    }
    return available(value);
  } catch (error) {
    return isMissingWork(error)
      ? notFound("WORK_NOT_FOUND")
      : unavailable("WORK_CORE_READ_UNAVAILABLE");
  }
}

function readDeliverables(
  source: WorkAuthorizedDeliverablesReadSource,
  work: WorkEvidenceReference,
): WorkAuthorizedContribution<WorkDeliverables> {
  try {
    const value = source.get(work.projectId, work.workId);
    if (value.projectId !== work.projectId || value.workId !== work.workId) {
      return unavailable("WORK_DELIVERABLES_READ_UNAVAILABLE");
    }
    const ordered = Object.freeze([...value.deliverables].sort(compareDeliverables));
    const normalized = Object.freeze({ ...value, deliverables: ordered });
    return ordered.length === 0 ? availableEmpty(normalized) : available(normalized);
  } catch (error) {
    return isMissingWork(error)
      ? notFound("WORK_DELIVERABLES_NOT_FOUND")
      : unavailable("WORK_DELIVERABLES_READ_UNAVAILABLE");
  }
}

async function readDecisions(
  source: WorkAuthorizedDecisionsReadSource,
  work: WorkEvidenceReference,
): Promise<WorkAuthorizedContribution<WorkDecisions>> {
  try {
    const value = await source.get(work.projectId, work.workId);
    if (value.projectId !== work.projectId || value.workId !== work.workId) {
      return unavailable("WORK_DECISIONS_READ_UNAVAILABLE");
    }
    const ordered = Object.freeze([...value.decisions].sort((left, right) =>
      compareText(left.decisionId, right.decisionId)
      || compareText(left.decidedAt, right.decidedAt)
      || compareText(left.request.requestId, right.request.requestId)));
    const normalized = Object.freeze({ ...value, decisions: ordered });
    return ordered.length === 0 ? availableEmpty(normalized) : available(normalized);
  } catch (error) {
    return isMissingWork(error)
      ? notFound("WORK_DECISIONS_NOT_FOUND")
      : unavailable("WORK_DECISIONS_READ_UNAVAILABLE");
  }
}

function readPeople(
  source: WorkAuthorizedPeopleReadSource,
  work: WorkEvidenceReference,
  observedAt: Date,
): WorkAuthorizedContribution<WorkPeopleReadResult> {
  try {
    const value = source.get(work, new Date(observedAt.getTime()));
    if (!matches(value, work)) return unavailable("PEOPLE_READ_UNAVAILABLE");
    if (value.status === "PEOPLE_UNAVAILABLE") {
      return unavailable("PEOPLE_READ_UNAVAILABLE", value);
    }
    if (value.status === "PARTICIPANTS_AVAILABLE") {
      const participants = Object.freeze([...value.participants].sort((left, right) =>
        compareText(left.businessPersonId, right.businessPersonId)
        || compareText(left.workAssignmentId, right.workAssignmentId)));
      return available(Object.freeze({ ...value, participants }));
    }
    return availableEmpty(value);
  } catch {
    return unavailable("PEOPLE_READ_UNAVAILABLE");
  }
}

function readPlanning(
  source: WorkAuthorizedPlanningReadSource,
  work: WorkEvidenceReference,
): WorkAuthorizedContribution<WorkPlanningReadResult> {
  try {
    const value = source.get(work);
    if (!matches(value, work)) return unavailable("PLANNING_READ_UNAVAILABLE");
    if (value.status === "PLANNING_UNAVAILABLE") {
      return unavailable("PLANNING_READ_UNAVAILABLE", value);
    }
    return value.status === "PLANNING_ABSENT" ? availableEmpty(value) : available(value);
  } catch {
    return unavailable("PLANNING_READ_UNAVAILABLE");
  }
}

function readActions(
  source: WorkAuthorizedActionsReadSource,
  work: WorkEvidenceReference,
): WorkAuthorizedContribution<WorkActionsReadResult> {
  try {
    const value = source.get(work);
    if (!matches(value, work)) return unavailable("ACTIONS_READ_UNAVAILABLE");
    if (value.status === "ACTIONS_UNAVAILABLE") {
      return unavailable("ACTIONS_READ_UNAVAILABLE", value);
    }
    if (value.status === "ACTIONS_AVAILABLE_EMPTY") return availableEmpty(value);
    const actions = Object.freeze([...value.actions].sort((left, right) =>
      compareText(left.actionId, right.actionId)));
    return available(Object.freeze({ ...value, actions }) as WorkActionsReadResult);
  } catch {
    return unavailable("ACTIONS_READ_UNAVAILABLE");
  }
}

function readEvidence<TCertification>(
  source: WorkAuthorizedEvidenceReadSource<TCertification>,
  work: WorkEvidenceReference,
): WorkAuthorizedContribution<WorkEvidenceReadResult<TCertification>> {
  try {
    const value = source.get(work, { includeCertification: true });
    if (!matches(value, work)) return unavailable("EVIDENCE_READ_UNAVAILABLE");
    if (value.status === "UNAVAILABLE") {
      return unavailable("EVIDENCE_READ_UNAVAILABLE", value);
    }
    if (value.status === "AVAILABLE_EMPTY") return availableEmpty(value);
    const evidences = Object.freeze([...value.evidences].sort((left, right) =>
      compareText(left.evidenceId, right.evidenceId)));
    return available(Object.freeze({ ...value, evidences }) as WorkEvidenceReadResult<TCertification>);
  } catch {
    return unavailable("EVIDENCE_READ_UNAVAILABLE");
  }
}

function available<T>(value: T): WorkAuthorizedContribution<T> {
  return Object.freeze({ availability: "AVAILABLE", value });
}

function availableEmpty<T>(value: T): WorkAuthorizedContribution<T> {
  return Object.freeze({ availability: "AVAILABLE_EMPTY", value });
}

function unavailable<T>(
  reason: WorkAuthorizedStateUnavailableReason,
  value?: T,
): WorkAuthorizedContribution<T> {
  return Object.freeze({
    availability: "UNAVAILABLE",
    reason,
    ...(value === undefined ? {} : { value }),
  });
}

function notFound(reason: WorkAuthorizedStateNotFoundReason): WorkAuthorizedContribution<never> {
  return Object.freeze({ availability: "NOT_FOUND", reason });
}

function canonicalReference(work: WorkEvidenceReference): WorkEvidenceReference {
  if (typeof work?.projectId !== "string" || work.projectId.length === 0
    || work.projectId !== work.projectId.trim()
    || typeof work.workId !== "string" || work.workId.length === 0
    || work.workId !== work.workId.trim()) {
    throw new TypeError("WorkReference must carry canonical projectId and workId values.");
  }
  return Object.freeze({ projectId: work.projectId, workId: work.workId });
}

function observationTime(value: Date): Date {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new RangeError("Work authorized-state observation time must be valid.");
  }
  return new Date(value.getTime());
}

function isMissingWork(error: unknown): boolean {
  return error instanceof WorkCoreFailure && error.code === "WCF-ERR-001";
}

function matches(
  value: Readonly<{ projectId: string; workId: string }>,
  work: WorkEvidenceReference,
): boolean {
  return value.projectId === work.projectId && value.workId === work.workId;
}

function compareDeliverables(
  left: WorkDeliverables["deliverables"][number],
  right: WorkDeliverables["deliverables"][number],
): number {
  return compareText(left.path, right.path)
    || compareText(left.runId, right.runId)
    || compareText(left.sha256, right.sha256)
    || compareText(left.modifiedAt, right.modifiedAt)
    || left.size - right.size;
}

/** Locale-independent UTF-16 code-unit ordering for reproducible read models. */
function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

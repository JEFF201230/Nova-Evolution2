import type {
  WorkCoreAggregate,
  WorkDecisions,
  WorkDeliverables,
} from "../../runtime/work/work-core.js";
import type { WorkPeopleReadResult } from "../../runtime/work/work-people.types.js";
import type { WorkActionsReadResult } from "./work-actions.types.js";
import type {
  WorkEvidenceReadResult,
  WorkEvidenceReference,
} from "./work-evidence.types.js";
import type { WorkPlanningReadResult } from "./work-planning.types.js";

export type WorkAuthorizedStateAvailability =
  | "AVAILABLE"
  | "AVAILABLE_EMPTY"
  | "NOT_FOUND"
  | "UNAVAILABLE";

export type WorkAuthorizedStateUnavailableReason =
  | "WORK_CORE_READ_UNAVAILABLE"
  | "WORK_DELIVERABLES_READ_UNAVAILABLE"
  | "WORK_DECISIONS_READ_UNAVAILABLE"
  | "PEOPLE_READ_UNAVAILABLE"
  | "PLANNING_READ_UNAVAILABLE"
  | "ACTIONS_READ_UNAVAILABLE"
  | "EVIDENCE_READ_UNAVAILABLE";

export type WorkAuthorizedStateNotFoundReason =
  | "WORK_NOT_FOUND"
  | "WORK_DELIVERABLES_NOT_FOUND"
  | "WORK_DECISIONS_NOT_FOUND";

export type WorkAuthorizedAvailableContribution<T> = Readonly<{
  availability: "AVAILABLE";
  value: T;
}>;

export type WorkAuthorizedAvailableEmptyContribution<T> = Readonly<{
  availability: "AVAILABLE_EMPTY";
  value: T;
}>;

export type WorkAuthorizedUnavailableContribution<T = never> = Readonly<{
  availability: "UNAVAILABLE";
  reason: WorkAuthorizedStateUnavailableReason;
  value?: T;
}>;

export type WorkAuthorizedNotFoundContribution = Readonly<{
  availability: "NOT_FOUND";
  reason: WorkAuthorizedStateNotFoundReason;
}>;

export type WorkAuthorizedContribution<T> =
  | WorkAuthorizedAvailableContribution<T>
  | WorkAuthorizedAvailableEmptyContribution<T>
  | WorkAuthorizedUnavailableContribution<T>
  | WorkAuthorizedNotFoundContribution;

/**
 * A dated read composition. Each value remains a view supplied by its
 * authoritative owner; this contract introduces no aggregate or persistence.
 */
export type WorkAuthorizedState<TCertification = unknown> = Readonly<{
  workReference: WorkEvidenceReference;
  compositionObservedAt: string;
  workCore: WorkAuthorizedContribution<WorkCoreAggregate>;
  deliverables: WorkAuthorizedContribution<WorkDeliverables>;
  decisions: WorkAuthorizedContribution<WorkDecisions>;
  people: WorkAuthorizedContribution<WorkPeopleReadResult>;
  planning: WorkAuthorizedContribution<WorkPlanningReadResult>;
  actions: WorkAuthorizedContribution<WorkActionsReadResult>;
  evidence: WorkAuthorizedContribution<WorkEvidenceReadResult<TCertification>>;
}>;

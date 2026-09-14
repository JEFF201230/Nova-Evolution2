import type { ActionStatus } from "./action-status.js";
import type {
  ActionCommand,
  ActionDependency,
  ActionResult,
  Activity,
  Execution,
  Task,
} from "./action.entities.js";
import type {
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActivityId,
  WorkReference,
} from "./action.value-objects.js";

export const ACTION_EVENT_TYPES = Object.freeze([
  "ActionProposed",
  "ActionAccepted",
  "ActionStarted",
  "ActionBlocked",
  "ActionResumed",
  "ActionCompleted",
  "ActionFailed",
  "ActionCancelled",
  "TaskAdded",
  "TaskRemoved",
  "CommandIssued",
  "ActivityObserved",
  "ExecutionStarted",
  "ExecutionEnded",
  "ResultRecorded",
  "ActionDependencyDeclared",
  "ActionDependencyRemoved",
] as const);

export type ActionsEventType = (typeof ACTION_EVENT_TYPES)[number];

export type ActionsEventProvenance = Readonly<{
  authoritativeBoundary: "ACTIONS_AUTHORITY";
  sourceCommandId: string;
  commandProvenance: ActionProvenance;
}>;

export type ActionsEventPayloadByType = Readonly<{
  ActionProposed: Readonly<{ purpose: ActionPurpose; status: "PROPOSED" }>;
  ActionAccepted: Readonly<{ from: "PROPOSED"; to: "READY" }>;
  ActionStarted: Readonly<{ from: "READY"; to: "IN_PROGRESS" }>;
  ActionBlocked: Readonly<{ from: "IN_PROGRESS"; to: "BLOCKED"; condition: string }>;
  ActionResumed: Readonly<{
    from: "BLOCKED";
    to: Extract<ActionStatus, "READY" | "IN_PROGRESS">;
  }>;
  ActionCompleted: Readonly<{
    from: "IN_PROGRESS";
    to: "COMPLETED";
    completionObservationId?: ActivityId;
  }>;
  ActionFailed: Readonly<{
    from: Extract<ActionStatus, "IN_PROGRESS" | "BLOCKED">;
    to: "FAILED";
    outcome: string;
  }>;
  ActionCancelled: Readonly<{
    from: Exclude<ActionStatus, "COMPLETED" | "CANCELLED">;
    to: "CANCELLED";
    reason: string;
  }>;
  TaskAdded: Readonly<{ task: Task }>;
  TaskRemoved: Readonly<{ taskId: string }>;
  CommandIssued: Readonly<{ command: ActionCommand }>;
  ActivityObserved: Readonly<{ activity: Activity }>;
  ExecutionStarted: Readonly<{ execution: Execution }>;
  ExecutionEnded: Readonly<{ executionId: string; outcome: string }>;
  ResultRecorded: Readonly<{ result: ActionResult }>;
  ActionDependencyDeclared: Readonly<{ dependency: ActionDependency }>;
  ActionDependencyRemoved: Readonly<{ target: ActionReference }>;
}>;

export type ActionsDomainEvent<T extends ActionsEventType = ActionsEventType> =
  T extends ActionsEventType
    ? Readonly<{
        type: T;
        workReference: WorkReference;
        actionId: ActionId;
        causalityId: string;
        revision: number;
        ordinal: number;
        provenance: ActionsEventProvenance;
        payload: ActionsEventPayloadByType[T];
      }>
    : never;

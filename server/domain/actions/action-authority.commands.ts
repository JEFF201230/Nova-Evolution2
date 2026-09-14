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
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  CommandId,
} from "./action.value-objects.js";

export const ACTION_COMMAND_TYPES = Object.freeze([
  "ProposeAction",
  "AcceptAction",
  "StartAction",
  "BlockAction",
  "ResumeAction",
  "CompleteAction",
  "FailAction",
  "CancelAction",
  "RetryAction",
  "AddTask",
  "RemoveTask",
  "IssueActionCommand",
  "ObserveActivity",
  "StartExecution",
  "EndExecution",
  "RecordResult",
  "DeclareActionDependency",
  "RemoveActionDependency",
] as const);

type CommandContext = Readonly<{
  commandId: CommandId;
  causalityId: string;
  expectedRevision: number;
  provenance: ActionProvenance;
}>;

type ExistingActionCommand = CommandContext & Readonly<{
  actionReference: ActionReference;
}>;

export type ProposeAction = CommandContext & Readonly<{
  type: "ProposeAction";
  actionReference: ActionReference;
  purpose: ActionPurpose;
}>;

export type AcceptAction = ExistingActionCommand & Readonly<{ type: "AcceptAction" }>;
export type StartAction = ExistingActionCommand & Readonly<{ type: "StartAction" }>;
export type BlockAction = ExistingActionCommand & Readonly<{
  type: "BlockAction";
  condition: string;
}>;
export type ResumeAction = ExistingActionCommand & Readonly<{
  type: "ResumeAction";
  destination: Extract<ActionStatus, "READY" | "IN_PROGRESS">;
}>;
export type CompleteAction = ExistingActionCommand
  & Readonly<{ type: "CompleteAction" }>
  & (
    | Readonly<{ result: ActionResult; completionObservation?: never }>
    | Readonly<{ result?: never; completionObservation: Activity }>
  );
export type FailAction = ExistingActionCommand & Readonly<{
  type: "FailAction";
  outcome: string;
}>;
export type CancelAction = ExistingActionCommand & Readonly<{
  type: "CancelAction";
  reason: string;
}>;
export type RetryAction = ExistingActionCommand & Readonly<{ type: "RetryAction" }>;
export type AddTask = ExistingActionCommand & Readonly<{
  type: "AddTask";
  task: Task;
}>;
export type RemoveTask = ExistingActionCommand & Readonly<{
  type: "RemoveTask";
  taskId: string;
}>;
export type IssueActionCommand = ExistingActionCommand & Readonly<{
  type: "IssueActionCommand";
  issuedCommand: ActionCommand;
}>;
export type ObserveActivity = ExistingActionCommand & Readonly<{
  type: "ObserveActivity";
  activity: Activity;
}>;
export type StartExecution = ExistingActionCommand & Readonly<{
  type: "StartExecution";
  execution: Execution;
}>;
export type EndExecution = ExistingActionCommand & Readonly<{
  type: "EndExecution";
  executionId: string;
  outcome: string;
}>;
export type RecordResult = ExistingActionCommand & Readonly<{
  type: "RecordResult";
  result: ActionResult;
}>;
export type DeclareActionDependency = ExistingActionCommand & Readonly<{
  type: "DeclareActionDependency";
  dependency: ActionDependency;
  expectedGraphRevision: number;
}>;
export type RemoveActionDependency = ExistingActionCommand & Readonly<{
  type: "RemoveActionDependency";
  target: ActionReference;
  expectedGraphRevision: number;
}>;

export type ActionsCommand =
  | ProposeAction
  | AcceptAction
  | StartAction
  | BlockAction
  | ResumeAction
  | CompleteAction
  | FailAction
  | CancelAction
  | RetryAction
  | AddTask
  | RemoveTask
  | IssueActionCommand
  | ObserveActivity
  | StartExecution
  | EndExecution
  | RecordResult
  | DeclareActionDependency
  | RemoveActionDependency;

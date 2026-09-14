import { ActionDomainError } from "./action.errors.js";
import {
  ActionCommand,
  ActionDependency,
  ActionResult,
  Activity,
  Execution,
  Task,
  assertAcyclicActionDependencies,
} from "./action.entities.js";
import { assertActionStatus, type ActionStatus } from "./action-status.js";
import {
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActivityId,
  assertActionProvenance,
  assertActionPurpose,
  assertActionReference,
} from "./action.value-objects.js";

export type ActionDefinition = Readonly<{
  reference: ActionReference;
  purpose: ActionPurpose;
  status: ActionStatus;
  tasks: readonly Task[];
  commands: readonly ActionCommand[];
  activities: readonly Activity[];
  completionObservationId?: ActivityId;
  executions: readonly Execution[];
  resultHistory: readonly ActionResult[];
  dependencies: readonly ActionDependency[];
  provenance: ActionProvenance;
}>;

export class Action {
  readonly reference: ActionReference;
  readonly purpose: ActionPurpose;
  readonly status: ActionStatus;
  readonly tasks: readonly Task[];
  readonly commands: readonly ActionCommand[];
  readonly activities: readonly Activity[];
  readonly completionObservationId?: ActivityId;
  readonly executions: readonly Execution[];
  readonly resultHistory: readonly ActionResult[];
  readonly dependencies: readonly ActionDependency[];
  readonly provenance: ActionProvenance;

  private constructor(definition: ActionDefinition) {
    this.reference = definition.reference;
    this.purpose = definition.purpose;
    this.status = definition.status;
    this.tasks = Object.freeze([...definition.tasks]);
    this.commands = Object.freeze([...definition.commands]);
    this.activities = Object.freeze([...definition.activities]);
    if (definition.completionObservationId !== undefined) {
      this.completionObservationId = definition.completionObservationId;
    }
    this.executions = Object.freeze([...definition.executions]);
    this.resultHistory = Object.freeze([...definition.resultHistory]);
    this.dependencies = Object.freeze([...definition.dependencies]);
    this.provenance = definition.provenance;
    Object.freeze(this);
  }

  static of(definition: ActionDefinition): Action {
    validateAction(definition);
    return new Action(definition);
  }

  get currentResult(): ActionResult | null {
    return this.resultHistory.at(-1) ?? null;
  }

  hasSameIdentity(other: Action): boolean {
    return this.reference.equals(other.reference);
  }
}

function validateAction(definition: ActionDefinition): void {
  if (typeof definition !== "object" || definition === null) {
    throw new ActionDomainError("ACTION_NOT_FOUND", "Action definition must be explicit.");
  }
  assertActionReference(definition.reference);
  assertActionPurpose(definition.purpose);
  assertActionStatus(definition.status);
  assertActionProvenance(definition.provenance);
  assertCollection(definition.tasks, (item): item is Task => item instanceof Task, "Task");
  assertCollection(
    definition.commands,
    (item): item is ActionCommand => item instanceof ActionCommand,
    "Command",
  );
  assertCollection(
    definition.activities,
    (item): item is Activity => item instanceof Activity,
    "Activity",
  );
  assertCollection(
    definition.executions,
    (item): item is Execution => item instanceof Execution,
    "Execution",
  );
  assertCollection(
    definition.resultHistory,
    (item): item is ActionResult => item instanceof ActionResult,
    "Result",
  );
  assertCollection(
    definition.dependencies,
    (item): item is ActionDependency => item instanceof ActionDependency,
    "Dependency",
  );

  assertUnique(definition.tasks, (item) => item.id.value, "TASK_DUPLICATE", "Task");
  assertUnique(definition.commands, (item) => item.id.value, "ACTION_ALREADY_EXISTS", "Command");
  assertUnique(definition.activities, (item) => item.id.value, "ACTION_ALREADY_EXISTS", "Activity");
  assertUnique(definition.executions, (item) => item.id.value, "ACTION_ALREADY_EXISTS", "Execution");
  assertUnique(
    definition.resultHistory,
    (item) => item.id.value,
    "ACTION_RESULT_CONFLICT",
    "Result",
  );
  assertChronologicalResults(definition.resultHistory);

  if (definition.completionObservationId !== undefined) {
    if (!(definition.completionObservationId instanceof ActivityId)
      || !definition.activities.some((activity) =>
        activity.id.equals(definition.completionObservationId as ActivityId))) {
      throw new ActionDomainError(
        "ACTION_RESULT_REQUIRED",
        "A completion observation must identify an explicit Activity owned by the Action.",
      );
    }
    if (definition.status !== "COMPLETED") {
      throw new ActionDomainError(
        "ACTION_STATUS_TRANSITION_INVALID",
        "A completion observation can only attest a completed Action.",
      );
    }
  }

  const taskIds = new Set(definition.tasks.map((task) => task.id.value));
  for (const execution of definition.executions) {
    if (execution.target.kind === "TASK" && !taskIds.has(execution.target.taskId.value)) {
      throw new ActionDomainError(
        "EXECUTION_STATE_INVALID",
        "A Task-targeted Execution must reference a Task owned by its Action.",
      );
    }
  }

  for (const dependency of definition.dependencies) {
    if (!dependency.source.equals(definition.reference)) {
      throw new ActionDomainError(
        "INVALID_ACTION_DEPENDENCY",
        "Dependency belongs to its source Action and cannot be stored by another Action.",
      );
    }
  }
  assertAcyclicActionDependencies(definition.dependencies);

  if (definition.status === "COMPLETED"
    && definition.resultHistory.length === 0
    && definition.completionObservationId === undefined) {
    throw new ActionDomainError(
      "ACTION_RESULT_REQUIRED",
      "A completed Action must have an explicit authoritative Result or completion observation.",
    );
  }
}

function assertCollection<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
  label: string,
): asserts value is readonly T[] {
  if (!Array.isArray(value) || value.some((item) => !guard(item))) {
    throw new ActionDomainError("ACTION_NOT_FOUND", `${label} collection must be explicit.`);
  }
}

function assertUnique<T>(
  values: readonly T[],
  keyOf: (value: T) => string,
  code: "ACTION_ALREADY_EXISTS" | "ACTION_RESULT_CONFLICT" | "TASK_DUPLICATE",
  label: string,
): void {
  const keys = new Set<string>();
  for (const value of values) {
    const key = keyOf(value);
    if (keys.has(key)) {
      throw new ActionDomainError(code, `${label} identity must be unique inside its Action.`);
    }
    keys.add(key);
  }
}

function assertChronologicalResults(results: readonly ActionResult[]): void {
  let previous = Number.NEGATIVE_INFINITY;
  for (const result of results) {
    const effectiveAt = result.provenance.effectiveAt.getTime();
    if (effectiveAt <= previous) {
      throw new ActionDomainError(
        "ACTION_RESULT_CONFLICT",
        "Result history must be strictly chronological and append-only.",
      );
    }
    previous = effectiveAt;
  }
}

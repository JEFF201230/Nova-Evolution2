import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import {
  Action,
  ActionCommand,
  ActionDependency,
  ActionDomainError,
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActionResult,
  Activity,
  ActivityId,
  CommandId,
  Execution,
  ExecutionId,
  ResultId,
  Task,
  TaskId,
  WorkReference,
  assertActionStatusTransition,
  assertAcyclicActionDependencies,
  canTransitionActionStatus,
  type ActionDefinition,
  type ActionFoundationErrorCode,
  type ActionStatus,
} from "./index.js";

const at = (day: number): Date => new Date(`2026-09-${String(day).padStart(2, "0")}T09:00:00.000Z`);

function provenance(day = 1): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS",
    "BUSINESS_INTENTION",
    `action-cause-${day}`,
    at(day),
    "AUTHORITATIVE_BUSINESS_SOURCE",
  );
}

function observationProvenance(day: number): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS",
    "EXPLICIT_BUSINESS_OBSERVATION",
    `observed-completion-cause-${day}`,
    at(day),
    "BUSINESS_OBSERVATION",
  );
}

function reference(work = "work-alpha", action = "action-alpha"): ActionReference {
  return ActionReference.of(WorkReference.of("project-alpha", work), ActionId.of(action));
}

function result(id: string, day: number): ActionResult {
  return ActionResult.record(ResultId.of(id), `Outcome ${id}`, null, provenance(day));
}

function definition(overrides: Partial<ActionDefinition> = {}): ActionDefinition {
  const actionReference = overrides.reference ?? reference();
  return {
    reference: actionReference,
    purpose: ActionPurpose.of(
      "Produce the business outcome assigned to this Action.",
      "CONTRIBUTES_TO_WORK_OBJECTIVE",
    ),
    status: "PROPOSED",
    tasks: [],
    commands: [],
    activities: [],
    executions: [],
    resultHistory: [],
    dependencies: [],
    provenance: provenance(),
    ...overrides,
  };
}

function expectCode(code: ActionFoundationErrorCode, operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof ActionDomainError);
    assert.equal(error.code, code);
    return true;
  });
}

test("Action identity composes exactly one WorkReference and one local ActionId", () => {
  const first = Action.of(definition());
  const same = Action.of(definition({ reference: reference() }));
  const anotherWork = Action.of(definition({ reference: reference("work-beta") }));

  assert.equal(first.reference.key, "project-alpha/work-alpha::action-alpha");
  assert.ok(first.hasSameIdentity(same));
  assert.equal(first.hasSameIdentity(anotherWork), false);
  assert.equal("workId" in first, false);
  assert.equal("projectId" in first, false);
  expectCode("WORK_REFERENCE_NOT_FOUND", () => WorkReference.of("project-alpha", ""));
});

test("Action purpose is explicit compatibility evidence and never a copied Work Objective", () => {
  const action = Action.of(definition());
  assert.equal(action.purpose.compatibility, "CONTRIBUTES_TO_WORK_OBJECTIVE");
  assert.equal("objective" in action, false);
  assert.deepEqual(Object.keys(action.purpose).sort(), ["compatibility", "statement"]);
  expectCode("ACTION_PURPOSE_REQUIRED", () => ActionPurpose.of("", "CONTRIBUTES_TO_WORK_OBJECTIVE"));
  expectCode("ACTION_PURPOSE_REQUIRED", () =>
    ActionPurpose.of("Purpose", "COPIES_WORK_OBJECTIVE" as "CONTRIBUTES_TO_WORK_OBJECTIVE"));
});

test("Action status uses the exact independent vocabulary and transition graph", () => {
  const allowed: Readonly<Record<ActionStatus, readonly ActionStatus[]>> = {
    PROPOSED: ["READY", "CANCELLED"],
    READY: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["BLOCKED", "COMPLETED", "FAILED", "CANCELLED"],
    BLOCKED: ["READY", "IN_PROGRESS", "FAILED", "CANCELLED"],
    FAILED: ["READY", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };
  for (const [from, targets] of Object.entries(allowed) as [ActionStatus, ActionStatus[]][]) {
    for (const target of targets) assert.equal(canTransitionActionStatus(from, target), true);
  }
  expectCode("ACTION_STATUS_TRANSITION_INVALID", () =>
    assertActionStatusTransition("READY", "COMPLETED"));
  expectCode("ACTION_TERMINAL", () => assertActionStatusTransition("COMPLETED", "READY"));
});

test("Task, Command, Activity, Execution and Result are immutable distinct concepts", () => {
  const source = provenance();
  const task = Task.of(TaskId.of("task-1"), "Perform the bounded business work.", source);
  const command = ActionCommand.record(CommandId.of("command-1"), "Begin the work.", source);
  const activity = Activity.observe(ActivityId.of("activity-1"), "Work was observed.", source);
  const execution = Execution.occur(
    ExecutionId.of("execution-1"),
    { kind: "TASK", taskId: task.id },
    "The Task was performed in its business context.",
    source,
  );
  const actionResult = result("result-1", 2);
  const action = Action.of(definition({
    tasks: [task],
    commands: [command],
    activities: [activity],
    executions: [execution],
    resultHistory: [actionResult],
  }));

  assert.ok(task instanceof Task);
  assert.ok(command instanceof ActionCommand);
  assert.ok(activity instanceof Activity);
  assert.ok(execution instanceof Execution);
  assert.ok(actionResult instanceof ActionResult);
  assert.notEqual(command, activity as unknown);
  assert.equal("status" in task, false);
  assert.equal("accepted" in command, false);
  assert.equal("runtimeExecutionId" in execution, false);
  assert.equal(action.status, "PROPOSED");
  assert.ok(Object.isFrozen(action));
  assert.ok(Object.isFrozen(action.tasks));
});

test("a Task-targeted Execution must use a Task subordinate to the same Action", () => {
  const missing = TaskId.of("missing-task");
  const execution = Execution.occur(
    ExecutionId.of("execution-missing"),
    { kind: "TASK", taskId: missing },
    "Attempted business occurrence.",
    provenance(),
  );
  expectCode("EXECUTION_STATE_INVALID", () => Action.of(definition({ executions: [execution] })));
  const duplicate = Task.of(TaskId.of("duplicate"), "Bounded task.", provenance());
  expectCode("TASK_DUPLICATE", () => Action.of(definition({ tasks: [duplicate, duplicate] })));
});

test("Result has zero-or-one derived current value and a single append-only history", () => {
  const absent = Action.of(definition());
  const first = result("result-1", 2);
  const second = ActionResult.record(
    ResultId.of("result-2"),
    "Superseding business outcome.",
    Object.freeze({ kind: "DELIVERABLE", identity: "deliverable-9" }),
    provenance(3),
  );
  const action = Action.of(definition({ resultHistory: [first, second] }));

  assert.equal(absent.currentResult, null);
  assert.equal(action.currentResult, second);
  assert.equal(Object.prototype.hasOwnProperty.call(action, "currentResult"), false);
  assert.equal(action.currentResult?.externalReference?.identity, "deliverable-9");
  assert.equal("deliverable" in second, false);
  expectCode("ACTION_RESULT_CONFLICT", () =>
    Action.of(definition({ resultHistory: [second, first] })));
  expectCode("ACTION_RESULT_CONFLICT", () =>
    Action.of(definition({ resultHistory: [first, first] })));
  expectCode("ACTION_RESULT_REQUIRED", () => Action.of(definition({ status: "COMPLETED" })));
  assert.equal(Action.of(definition({ status: "COMPLETED", resultHistory: [first] })).status, "COMPLETED");

  const completionObservation = Activity.observe(
    ActivityId.of("completion-observation"),
    "The expected business accomplishment was explicitly observed.",
    observationProvenance(4),
  );
  const observedCompletion = Action.of(definition({
    status: "COMPLETED",
    activities: [completionObservation],
    completionObservationId: completionObservation.id,
  }));
  assert.equal(observedCompletion.currentResult, null);
  assert.equal(observedCompletion.completionObservationId, completionObservation.id);
});

test("Dependency is oriented, source-owned, same-Work and acyclic", () => {
  const source = reference("work-alpha", "source");
  const middle = reference("work-alpha", "middle");
  const target = reference("work-alpha", "target");
  const first = ActionDependency.from(source, middle, "Middle must be satisfied.", provenance());
  const second = ActionDependency.from(middle, target, "Target must be satisfied.", provenance(2));

  assert.equal(first.source, source);
  assert.equal(first.target, middle);
  assert.doesNotThrow(() => assertAcyclicActionDependencies([first, second]));
  assert.equal(Action.of(definition({ reference: source, dependencies: [first] })).dependencies[0], first);
  expectCode("INVALID_ACTION_DEPENDENCY", () =>
    Action.of(definition({ reference: middle, dependencies: [first] })));
  expectCode("INVALID_ACTION_DEPENDENCY", () =>
    ActionDependency.from(source, source, "Self.", provenance()));
  expectCode("INVALID_ACTION_DEPENDENCY", () =>
    ActionDependency.from(source, reference("other-work", "target"), "Cross Work.", provenance()));
  const closesCycle = ActionDependency.from(target, source, "Source must be satisfied.", provenance(3));
  expectCode("ACTION_DEPENDENCY_CYCLE", () =>
    assertAcyclicActionDependencies([first, second, closesCycle]));
});

test("technical origins cannot be promoted to Action provenance", () => {
  expectCode("TECHNICAL_ACTION_SOURCE_FORBIDDEN", () =>
    ActionProvenance.of(
      "runtime",
      "queue",
      "technical-transition",
      at(1),
      "RUNTIME_TRACE" as "AUTHORITATIVE_BUSINESS_SOURCE",
    ));
});

test("Foundation owns no Planning, PEOPLE, Decisions, Work state or Runtime primitive", async () => {
  const directory = new URL("./", import.meta.url);
  const foundationFiles = [
    "action.aggregate.ts",
    "action-status.ts",
    "action.value-objects.ts",
    "action.entities.ts",
    "action.errors.ts",
  ];
  const directoryFiles = await readdir(directory);
  assert.ok(foundationFiles.every((file) => directoryFiles.includes(file)));
  const source = (await Promise.all(
    foundationFiles.map((file) => readFile(new URL(file, directory), "utf8")),
  )).join("\n");

  for (const forbidden of [
    /from\s+["'][^"']*(planning|people|decisions|runtime|nova-core)/iu,
    /\b(class|interface|type)\s+(Phase|Milestone|Schedule|Priority|Assignment|Role|Lifecycle|Progress)\b/u,
    /\b(plannedAt|dueDate|assignee|roleId|decisionAuthority|runtimeExecutionId)\b/u,
    /Repository|Persistence|Migration|Sqlite|Database|Queue|Scheduler|Transport|Controller|Api\b/u,
    /ActionsAuthority|AuthoritativeProducer|DomainEvent/u,
  ]) {
    assert.doesNotMatch(source, forbidden);
  }

  const action = Action.of(definition());
  for (const externalTruth of [
    "objective",
    "lifecycle",
    "progress",
    "phase",
    "milestone",
    "plannedPriority",
    "assignment",
    "role",
    "authorization",
  ]) {
    assert.equal(externalTruth in action, false);
  }
});

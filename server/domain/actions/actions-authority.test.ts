import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ACTION_COMMAND_TYPES,
  ACTION_EVENT_TYPES,
  ActionCommand,
  ActionDependency,
  ActionDomainError,
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActionResult,
  ActionsAuthority,
  Activity,
  ActivityId,
  CommandId,
  Execution,
  ExecutionId,
  ResultId,
  Task,
  TaskId,
  WorkReference,
  type ActionFoundationErrorCode,
  type ActionsAuthorityReceipt,
  type ActionsCommand,
} from "./index.js";

const instant = (minute: number): Date =>
  new Date(`2026-09-10T10:${String(minute).padStart(2, "0")}:00.000Z`);

function provenance(minute: number): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS",
    "EXPLICIT_BUSINESS_INTENT",
    `business-cause-${minute}`,
    instant(minute),
    "AUTHORITATIVE_BUSINESS_SOURCE",
  );
}

function observationProvenance(minute: number): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS",
    "EXPLICIT_BUSINESS_OBSERVATION",
    `observed-business-cause-${minute}`,
    instant(minute),
    "BUSINESS_OBSERVATION",
  );
}

function reference(action: string, work = "work-authority"): ActionReference {
  return ActionReference.of(WorkReference.of("project-authority", work), ActionId.of(action));
}

function context(id: string, expectedRevision: number, minute: number) {
  return {
    commandId: CommandId.of(id),
    causalityId: `causality-${id}`,
    expectedRevision,
    provenance: provenance(minute),
  } as const;
}

function propose(
  authority: ActionsAuthority,
  actionReference: ActionReference,
  id = `propose-${actionReference.actionId.value}`,
): ActionsAuthorityReceipt {
  return authority.accept({
    type: "ProposeAction",
    ...context(id, 0, 1),
    actionReference,
    purpose: ActionPurpose.of(
      `Produce the bounded outcome for ${actionReference.actionId.value}.`,
      "CONTRIBUTES_TO_WORK_OBJECTIVE",
    ),
  });
}

function expectCode(code: ActionFoundationErrorCode, operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof ActionDomainError);
    assert.equal(error.code, code);
    return true;
  });
}

const ADMIT_ALL_WORKS = Object.freeze({
  workExists: (_workReference: WorkReference): boolean => true,
});

test("ProposeAction admits only Actions whose WorkReference identifies an authoritative Work", () => {
  const authoritativeWork = WorkReference.of("project-authority", "work-authoritative");
  const authority = new ActionsAuthority({
    workExists: (workReference) => workReference.equals(authoritativeWork),
  });
  const admittedReference = ActionReference.of(authoritativeWork, ActionId.of("admitted"));
  const admitted = propose(authority, admittedReference, "admitted-work");

  assert.equal(admitted.action.reference, admittedReference);
  assert.equal(authority.readCanonicalState().actions.length, 1);

  const absentReference = reference("rejected", "work-absent");
  const beforeRejection = authority.readCanonicalState();
  expectCode("WORK_REFERENCE_NOT_FOUND", () => propose(authority, absentReference, "absent-work"));
  assert.deepEqual(authority.readCanonicalState(), beforeRejection);
});

test("valid lifecycle Commands are accepted only through ActionsAuthority", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("lifecycle");
  let receipt = propose(authority, actionReference);
  assert.equal(receipt.action.status, "PROPOSED");
  assert.deepEqual(receipt.events.map((event) => event.type), ["ActionProposed"]);

  receipt = authority.accept({ type: "AcceptAction", ...context("accept", 1, 2), actionReference });
  receipt = authority.accept({ type: "StartAction", ...context("start", 2, 3), actionReference });
  receipt = authority.accept({
    type: "BlockAction",
    ...context("block", 3, 4),
    actionReference,
    condition: "A stated business prerequisite is absent.",
  });
  receipt = authority.accept({
    type: "ResumeAction",
    ...context("resume", 4, 5),
    actionReference,
    destination: "IN_PROGRESS",
  });
  receipt = authority.accept({
    type: "FailAction",
    ...context("fail", 5, 6),
    actionReference,
    outcome: "The expected business issue was not produced.",
  });
  receipt = authority.accept({ type: "RetryAction", ...context("retry", 6, 7), actionReference });
  receipt = authority.accept({ type: "StartAction", ...context("restart", 7, 8), actionReference });
  receipt = authority.accept({
    type: "CancelAction",
    ...context("cancel", 8, 9),
    actionReference,
    reason: "The business intention is definitively stopped.",
  });

  assert.equal(receipt.action.status, "CANCELLED");
  assert.equal(receipt.revision, 9);
  assert.equal("lifecycle" in receipt.action, false);
  assert.equal("progress" in receipt.action, false);
});

test("command-specific transition preconditions reject before any evolution", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("invalid-transition");
  propose(authority, actionReference);
  expectCode("ACTION_STATUS_TRANSITION_INVALID", () => authority.accept({
    type: "StartAction",
    ...context("invalid-start", 1, 2),
    actionReference,
  }));
  const accepted = authority.accept({
    type: "AcceptAction",
    ...context("valid-after-rejection", 1, 3),
    actionReference,
  });
  assert.equal(accepted.previousRevision, 1);
  assert.equal(accepted.revision, 2);
  assert.equal(accepted.action.status, "READY");
});

test("event provenance and causality identify the source Command and boundary", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("provenance");
  const receipt = propose(authority, actionReference, "source-command");
  const [event] = receipt.events;
  assert.equal(event?.causalityId, "causality-source-command");
  assert.equal(event?.provenance.authoritativeBoundary, "ACTIONS_AUTHORITY");
  assert.equal(event?.provenance.sourceCommandId, "source-command");
  assert.equal(event?.provenance.commandProvenance.businessCause, "business-cause-1");
  assert.equal(event?.provenance.commandProvenance.origin, "AUTHORITATIVE_BUSINESS_SOURCE");
  assert.equal("personId" in (event?.provenance ?? {}), false);
  assert.ok(Object.isFrozen(event));
  assert.ok(Object.isFrozen(event?.payload));
});

test("exact causality retries return the initial receipt and divergent reuse is rejected", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("idempotence");
  const command = {
    type: "ProposeAction",
    ...context("same", 0, 1),
    actionReference,
    purpose: ActionPurpose.of("Produce an idempotent outcome.", "CONTRIBUTES_TO_WORK_OBJECTIVE"),
  } as const;
  const first = authority.accept(command);
  assert.equal(authority.accept(command), first);
  expectCode("ACTION_CAUSALITY_CONFLICT", () => authority.accept({
    ...command,
    purpose: ActionPurpose.of("Different content.", "CONTRIBUTES_TO_WORK_OBJECTIVE"),
  }));
});

test("Result remains one derived current value and completion records it before completion", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("result");
  propose(authority, actionReference);
  authority.accept({ type: "AcceptAction", ...context("result-accept", 1, 2), actionReference });
  authority.accept({ type: "StartAction", ...context("result-start", 2, 3), actionReference });
  const result = ActionResult.record(
    ResultId.of("result-1"),
    "The explicit business outcome.",
    Object.freeze({ kind: "DELIVERABLE", identity: "deliverable-reference" }),
    provenance(4),
  );
  const receipt = authority.accept({
    type: "CompleteAction",
    ...context("result-complete", 3, 4),
    actionReference,
    result,
  });
  assert.deepEqual(receipt.events.map((event) => event.type), ["ResultRecorded", "ActionCompleted"]);
  assert.deepEqual(receipt.events.map((event) => event.ordinal), [0, 1]);
  assert.equal(receipt.events[0]?.revision, receipt.events[1]?.revision);
  assert.equal(receipt.action.currentResult, result);
  assert.equal(receipt.action.resultHistory.length, 1);
  assert.equal(receipt.action.activities.length, 0);
  assert.equal(receipt.action.completionObservationId, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(receipt.action, "currentResult"), false);
});

test("completion without Result records one explicit business observation before completion", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("observed-completion");
  propose(authority, actionReference);
  authority.accept({ type: "AcceptAction", ...context("observed-accept", 1, 2), actionReference });
  authority.accept({ type: "StartAction", ...context("observed-start", 2, 3), actionReference });
  const completionObservation = Activity.observe(
    ActivityId.of("observed-accomplishment"),
    "The expected business accomplishment was explicitly observed.",
    observationProvenance(4),
  );
  const receipt = authority.accept({
    type: "CompleteAction",
    ...context("observed-complete", 3, 4),
    actionReference,
    completionObservation,
  });

  assert.equal(receipt.action.status, "COMPLETED");
  assert.equal(receipt.action.currentResult, null);
  assert.equal(receipt.action.resultHistory.length, 0);
  assert.deepEqual(receipt.action.activities, [completionObservation]);
  assert.equal(receipt.action.completionObservationId, completionObservation.id);
  assert.deepEqual(receipt.events.map((event) => event.type), ["ActivityObserved", "ActionCompleted"]);
  assert.deepEqual(receipt.events.map((event) => event.ordinal), [0, 1]);
  assert.equal(receipt.events[0]?.revision, receipt.events[1]?.revision);
  assert.equal(receipt.events[0]?.provenance.commandProvenance.businessCause, "business-cause-4");
  assert.equal(completionObservation.provenance.origin, "BUSINESS_OBSERVATION");
  assert.deepEqual(receipt.events[1]?.payload, {
    from: "IN_PROGRESS",
    to: "COMPLETED",
    completionObservationId: completionObservation.id,
  });

  const result = ActionResult.record(
    ResultId.of("observed-later-result"),
    "The later authoritative business outcome.",
    null,
    provenance(5),
  );
  const withResult = authority.accept({
    type: "RecordResult",
    ...context("observed-result", receipt.revision, 5),
    actionReference,
    result,
  });
  assert.equal(withResult.action.currentResult, result);
  assert.deepEqual(withResult.action.resultHistory, [result]);
  assert.equal(withResult.action.completionObservationId, completionObservation.id);
});

test("completion without Result and without explicit observation is rejected atomically", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("unproven-completion");
  propose(authority, actionReference);
  authority.accept({ type: "AcceptAction", ...context("unproven-accept", 1, 2), actionReference });
  authority.accept({ type: "StartAction", ...context("unproven-start", 2, 3), actionReference });
  const before = authority.readCanonicalState();

  expectCode("ACTION_RESULT_REQUIRED", () => authority.accept({
    type: "CompleteAction",
    ...context("unproven-complete", 3, 4),
    actionReference,
  } as unknown as ActionsCommand));

  assert.deepEqual(authority.readCanonicalState(), before);

  const result = ActionResult.record(
    ResultId.of("ambiguous-completion-result"),
    "An authoritative outcome cannot be combined with another completion proof.",
    null,
    provenance(4),
  );
  const completionObservation = Activity.observe(
    ActivityId.of("ambiguous-completion-observation"),
    "An observation cannot accompany a Result in the same completion command.",
    observationProvenance(4),
  );
  expectCode("ACTION_RESULT_CONFLICT", () => authority.accept({
    type: "CompleteAction",
    ...context("ambiguous-complete", 3, 4),
    actionReference,
    result,
    completionObservation,
  } as unknown as ActionsCommand));
  assert.deepEqual(authority.readCanonicalState(), before);
});

test("an observation cannot replace an authoritative Result already owned by the Action", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("result-precedes-completion");
  propose(authority, actionReference);
  authority.accept({ type: "AcceptAction", ...context("existing-result-accept", 1, 2), actionReference });
  authority.accept({ type: "StartAction", ...context("existing-result-start", 2, 3), actionReference });
  const result = ActionResult.record(
    ResultId.of("existing-authoritative-result"),
    "The existing authoritative outcome.",
    null,
    provenance(4),
  );
  authority.accept({
    type: "RecordResult",
    ...context("existing-result-record", 3, 4),
    actionReference,
    result,
  });
  const observation = Activity.observe(
    ActivityId.of("conflicting-completion-observation"),
    "This observation cannot replace the Result.",
    observationProvenance(5),
  );
  const before = authority.readCanonicalState();

  expectCode("ACTION_RESULT_CONFLICT", () => authority.accept({
    type: "CompleteAction",
    ...context("existing-result-observed-complete", 4, 5),
    actionReference,
    completionObservation: observation,
  }));

  assert.deepEqual(authority.readCanonicalState(), before);
  assert.equal(before.actions[0]?.action.currentResult, result);
});

test("RecordResult appends authoritative history and a stale competing Result loses", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("record-result");
  propose(authority, actionReference);
  const first = ActionResult.record(
    ResultId.of("recorded-1"), "First authoritative outcome.", null, provenance(2),
  );
  const firstReceipt = authority.accept({
    type: "RecordResult",
    ...context("record-first", 1, 2),
    actionReference,
    result: first,
  });
  assert.equal(firstReceipt.events[0]?.type, "ResultRecorded");
  assert.equal(firstReceipt.action.currentResult, first);
  const competing = ActionResult.record(
    ResultId.of("recorded-2"), "Stale competing outcome.", null, provenance(3),
  );
  expectCode("ACTION_REVISION_CONFLICT", () => authority.accept({
    type: "RecordResult",
    ...context("record-stale", 1, 3),
    actionReference,
    result: competing,
  }));
  const evolved = ActionResult.record(
    ResultId.of("recorded-3"), "Later authoritative outcome.", null, provenance(4),
  );
  const evolvedReceipt = authority.accept({
    type: "RecordResult",
    ...context("record-later", 2, 4),
    actionReference,
    result: evolved,
  });
  assert.equal(evolvedReceipt.action.resultHistory.length, 2);
  assert.equal(evolvedReceipt.action.currentResult, evolved);
  assert.equal(Object.prototype.hasOwnProperty.call(evolvedReceipt.action, "currentResult"), false);
});

test("Tasks, Commands, Activities and Executions remain distinct authoritative evolutions", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("concepts");
  let revision = propose(authority, actionReference).revision;
  const task = Task.of(TaskId.of("task-1"), "Perform a bounded part.", provenance(2));
  let receipt = authority.accept({
    type: "AddTask", ...context("add-task", revision++, 2), actionReference, task,
  });
  const issuedCommand = ActionCommand.record(
    CommandId.of("business-instruction"), "Perform the business work.", provenance(3),
  );
  receipt = authority.accept({
    type: "IssueActionCommand", ...context("issue", revision++, 3), actionReference, issuedCommand,
  });
  const activity = Activity.observe(
    ActivityId.of("activity-1"), "A business fact was observed.", provenance(4),
  );
  receipt = authority.accept({
    type: "ObserveActivity", ...context("observe", revision++, 4), actionReference, activity,
  });
  const execution = Execution.occur(
    ExecutionId.of("execution-1"), { kind: "ACTION" }, "Business execution occurred.", provenance(5),
  );
  receipt = authority.accept({
    type: "StartExecution", ...context("execution-start", revision++, 5), actionReference, execution,
  });
  receipt = authority.accept({
    type: "EndExecution",
    ...context("execution-end", revision++, 6),
    actionReference,
    executionId: execution.id.value,
    outcome: "Business execution ended explicitly.",
  });
  receipt = authority.accept({
    type: "RemoveTask", ...context("remove-task", revision, 7), actionReference, taskId: task.id.value,
  });

  assert.deepEqual(
    ["TaskAdded", "CommandIssued", "ActivityObserved", "ExecutionStarted", "ExecutionEnded", "TaskRemoved"],
    [
      "TaskAdded",
      receipt.action.commands.length === 1 ? "CommandIssued" : "missing",
      receipt.action.activities.length === 1 ? "ActivityObserved" : "missing",
      receipt.action.executions.length === 1 ? "ExecutionStarted" : "missing",
      "ExecutionEnded",
      receipt.events[0]?.type,
    ],
  );
  assert.equal(receipt.action.tasks.length, 0);
  assert.equal(receipt.action.status, "PROPOSED");
});

test("Dependency mutations enforce source ownership, target existence, removal and acyclicity", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const first = reference("dependency-a");
  const second = reference("dependency-b");
  const third = reference("dependency-c");
  propose(authority, first);
  propose(authority, second);
  propose(authority, third);
  const aToB = ActionDependency.from(first, second, "B must be satisfied.", provenance(2));
  let receipt = authority.accept({
    type: "DeclareActionDependency",
    ...context("a-b", 1, 2),
    actionReference: first,
    dependency: aToB,
    expectedGraphRevision: 0,
  });
  assert.equal(receipt.graphRevision, 1);
  const bToC = ActionDependency.from(second, third, "C must be satisfied.", provenance(3));
  authority.accept({
    type: "DeclareActionDependency",
    ...context("b-c", 1, 3),
    actionReference: second,
    dependency: bToC,
    expectedGraphRevision: 1,
  });
  const cToA = ActionDependency.from(third, first, "A would close a cycle.", provenance(4));
  expectCode("ACTION_DEPENDENCY_CYCLE", () => authority.accept({
    type: "DeclareActionDependency",
    ...context("c-a", 1, 4),
    actionReference: third,
    dependency: cToA,
    expectedGraphRevision: 2,
  }));
  receipt = authority.accept({
    type: "RemoveActionDependency",
    ...context("remove-a-b", 2, 5),
    actionReference: first,
    target: second,
    expectedGraphRevision: 2,
  });
  assert.equal(receipt.action.dependencies.length, 0);
  assert.equal(receipt.events[0]?.type, "ActionDependencyRemoved");
});

test("stale Action and graph mutations fail deterministically without last-write-wins", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const first = reference("concurrency-a");
  const second = reference("concurrency-b");
  propose(authority, first);
  propose(authority, second);
  authority.accept({ type: "AcceptAction", ...context("winner", 1, 2), actionReference: first });
  expectCode("ACTION_REVISION_CONFLICT", () => authority.accept({
    type: "CancelAction",
    ...context("stale", 1, 3),
    actionReference: first,
    reason: "A stale writer must not win.",
  }));
  const dependency = ActionDependency.from(second, first, "First must be satisfied.", provenance(4));
  authority.accept({
    type: "DeclareActionDependency",
    ...context("graph-winner", 1, 4),
    actionReference: second,
    dependency,
    expectedGraphRevision: 0,
  });
  expectCode("ACTION_REVISION_CONFLICT", () => authority.accept({
    type: "RemoveActionDependency",
    ...context("graph-stale", 2, 5),
    actionReference: second,
    target: first,
    expectedGraphRevision: 0,
  }));
});

test("all supported Command and Event names are explicit and no technical event is admitted", () => {
  assert.equal(ACTION_COMMAND_TYPES.length, 18);
  assert.equal(new Set(ACTION_COMMAND_TYPES).size, 18);
  assert.equal(ACTION_EVENT_TYPES.length, 17);
  assert.equal(new Set(ACTION_EVENT_TYPES).size, 17);
  assert.deepEqual(ACTION_EVENT_TYPES, [
    "ActionProposed", "ActionAccepted", "ActionStarted", "ActionBlocked", "ActionResumed",
    "ActionCompleted", "ActionFailed", "ActionCancelled", "TaskAdded", "TaskRemoved",
    "CommandIssued", "ActivityObserved", "ExecutionStarted", "ExecutionEnded", "ResultRecorded",
    "ActionDependencyDeclared", "ActionDependencyRemoved",
  ]);
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  expectCode("ACTION_NOT_FOUND", () => authority.accept({
    type: "RuntimeTransition",
    ...context("runtime", 0, 1),
    actionReference: reference("runtime"),
  } as unknown as ActionsCommand));
});

test("the implementation introduces one producer and no direct mutation or forbidden integration", async () => {
  const authoritySource = await readFile(new URL("./actions-authority.ts", import.meta.url), "utf8");
  const commandSource = await readFile(new URL("./action-authority.commands.ts", import.meta.url), "utf8");
  const eventSource = await readFile(new URL("./action-authority.events.ts", import.meta.url), "utf8");
  const source = `${authoritySource}\n${commandSource}\n${eventSource}`;
  assert.equal((source.match(/export class ActionsAuthority\b/gu) ?? []).length, 1);
  assert.equal((source.match(/\baccept\(command: ActionsCommand\)/gu) ?? []).length, 1);
  assert.doesNotMatch(source, /from\s+["'][^"']*(work|planning|people|decisions|runtime|nova-core)[^"']*["']/iu);
  assert.doesNotMatch(source, /Repository|Persistence|Database|Migration|Replay|Recovery|Queue|Scheduler|Controller|Transport|BFF|API\b/u);
  assert.doesNotMatch(source, /\b(Phase|Milestone|Schedule|Assignment|Role|Lifecycle|Progress)\b/u);
  assert.doesNotMatch(source, /runtimeExecutionId|decisionAuthority|assignee|plannedAt|dueDate/u);
});

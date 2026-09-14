import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ActionDependency,
  ActionDomainError,
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActionResult,
  ActionsAuthority,
  ActionsInternalAccess,
  ActionsJournal,
  Activity,
  ActivityId,
  CommandId,
  Execution,
  ExecutionId,
  ResultId,
  WorkReference,
  type ActionsCommand,
} from "./index.js";

const instant = (minute: number): Date =>
  new Date(`2026-09-10T14:${String(minute).padStart(2, "0")}:00.000Z`);

function provenance(minute: number): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS",
    "INTERNAL_APPLICATION_ACCESS",
    `internal-access-cause-${minute}`,
    instant(minute),
    "AUTHORITATIVE_BUSINESS_SOURCE",
  );
}

function reference(actionId: string, workId = "work-internal"): ActionReference {
  return ActionReference.of(
    WorkReference.of("project-internal", workId),
    ActionId.of(actionId),
  );
}

const ADMIT_ALL_WORKS = Object.freeze({
  workExists: (_workReference: WorkReference): boolean => true,
});

function proposal(actionReference: ActionReference, causalityId: string): ActionsCommand {
  return {
    type: "ProposeAction",
    commandId: CommandId.of(`${causalityId}-command`),
    causalityId,
    expectedRevision: 0,
    provenance: provenance(0),
    actionReference,
    purpose: ActionPurpose.of(
      `Produce the outcome for ${actionReference.actionId.value}.`,
      "CONTRIBUTES_TO_WORK_OBJECTIVE",
    ),
  };
}

function mutationContext(causalityId: string, expectedRevision: number, minute: number) {
  return {
    commandId: CommandId.of(`${causalityId}-command`),
    causalityId,
    expectedRevision,
    provenance: provenance(minute),
  } as const;
}

async function durableFixture(
  operation: (journalPath: string) => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "nova-actions-internal-"));
  try {
    await operation(join(directory, "actions.journal.json"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("internal Commands delegate unchanged to ActionsAuthority and preserve authoritative receipts", () => {
  const actionReference = reference("delegated");
  const command = proposal(actionReference, "delegated-proposal");
  class RecordingAuthority extends ActionsAuthority {
    accepted: ActionsCommand | undefined;
    override accept(candidate: ActionsCommand) {
      this.accepted = candidate;
      return super.accept(candidate);
    }
  }
  const authority = new RecordingAuthority(ADMIT_ALL_WORKS);
  const access = ActionsInternalAccess.fromAuthority(authority);

  const receipt = access.commands.execute(command);

  assert.equal(authority.accepted, command);
  assert.equal(receipt.commandType, command.type);
  assert.equal(receipt.causalityId, command.causalityId);
  assert.equal(receipt.previousRevision, 0);
  assert.equal(receipt.revision, 1);
  assert.equal(receipt.events[0]?.provenance.sourceCommandId, command.commandId.value);
  assert.equal(access.queries.getAction(actionReference)?.revision, receipt.revision);
});

test("internal Queries expose qualified canonical state and every contracted read", () => {
  const access = ActionsInternalAccess.inMemory(ADMIT_ALL_WORKS);
  const source = reference("source");
  const target = reference("target");
  access.commands.execute(proposal(source, "propose-source"));
  access.commands.execute(proposal(target, "propose-target"));
  access.commands.execute({
    type: "ObserveActivity",
    ...mutationContext("observe-source", 1, 1),
    actionReference: source,
    activity: Activity.observe(ActivityId.of("activity-source"), "Work was observed.", provenance(1)),
  });
  access.commands.execute({
    type: "StartExecution",
    ...mutationContext("execute-source", 2, 2),
    actionReference: source,
    execution: Execution.occur(
      ExecutionId.of("execution-source"),
      { kind: "ACTION" },
      "The Action was performed in its business context.",
      provenance(2),
    ),
  });
  const result = ActionResult.record(ResultId.of("result-source"), "Qualified result.", null, provenance(3));
  access.commands.execute({
    type: "RecordResult",
    ...mutationContext("result-source", 3, 3),
    actionReference: source,
    result,
  });
  const dependency = ActionDependency.from(source, target, "Target must be satisfied.", provenance(4));
  access.commands.execute({
    type: "DeclareActionDependency",
    ...mutationContext("dependency-source", 4, 4),
    actionReference: source,
    dependency,
    expectedGraphRevision: 0,
  });

  const current = access.queries.getAction(source);
  assert.equal(current?.action.reference, source);
  assert.equal(current?.revision, 5);
  assert.equal(current?.graphRevision, 1);
  assert.deepEqual(
    access.queries.listActionsByWork(source.workReference).map((item) => item.action.reference.actionId.value),
    ["source", "target"],
  );
  assert.deepEqual(access.queries.listActionsByWork(WorkReference.of("project-internal", "empty-work")), []);
  const history = access.queries.getActionHistory(source);
  assert.deepEqual(
    history?.value.map((event) => event.type),
    ["ActionProposed", "ActivityObserved", "ExecutionStarted", "ResultRecorded", "ActionDependencyDeclared"],
  );
  assert.equal(history?.value[0]?.causalityId, "propose-source");
  assert.equal(history?.value[0]?.provenance.authoritativeBoundary, "ACTIONS_AUTHORITY");
  assert.deepEqual(history?.value[0]?.provenance.commandProvenance, provenance(0));
  assert.equal(Object.isFrozen(history?.value), true);
  assert.equal(access.queries.getActionActivities(source)?.value[0]?.id.value, "activity-source");
  assert.equal(access.queries.getActionExecutions(source)?.value[0]?.id.value, "execution-source");
  assert.equal(access.queries.getActionResult(source)?.value, result);
  assert.equal(access.queries.getActionDependencies(source)?.value[0], dependency);
  assert.equal(access.queries.getAction(reference("absent")), null);
  assert.equal(access.queries.getActionResult(target)?.value, null);
});

test("repeated internal Queries are read-only and preserve revisions, events and causality receipts", () => {
  const access = ActionsInternalAccess.inMemory(ADMIT_ALL_WORKS);
  const actionReference = reference("read-only");
  const command = proposal(actionReference, "read-only-proposal");
  const initial = access.commands.execute(command);

  for (let index = 0; index < 3; index += 1) {
    assert.equal(access.queries.getAction(actionReference)?.revision, 1);
    assert.equal(access.queries.getActionHistory(actionReference)?.value.length, 1);
    assert.equal(access.queries.getActionResult(actionReference)?.value, null);
    assert.equal(access.queries.getActionDependencies(actionReference)?.value.length, 0);
  }

  assert.deepEqual(access.commands.execute(command), initial);
  assert.equal(access.queries.getAction(actionReference)?.revision, 1);
  assert.equal(access.queries.getActionHistory(actionReference)?.value.length, 1);
});

test("internal access preserves exact idempotence and rejects divergent causality", () => {
  const access = ActionsInternalAccess.inMemory(ADMIT_ALL_WORKS);
  const actionReference = reference("idempotent");
  const command = proposal(actionReference, "same-causality");
  const first = access.commands.execute(command);
  const replay = access.commands.execute(command);
  assert.equal(replay, first);
  assert.equal(access.queries.getActionHistory(actionReference)?.value.length, 1);

  assert.throws(
    () => access.commands.execute({
      ...command,
      purpose: ActionPurpose.of("Divergent intent.", "CONTRIBUTES_TO_WORK_OBJECTIVE"),
    }),
    (error: unknown) => error instanceof ActionDomainError && error.code === "ACTION_CAUSALITY_CONFLICT",
  );
  assert.equal(access.queries.getAction(actionReference)?.revision, 1);
  assert.equal(access.queries.getActionHistory(actionReference)?.value.length, 1);
});

test("durable internal access replays one canonical source after restart without query writes", async () => {
  await durableFixture(async (journalPath) => {
    const actionReference = reference("durable");
    const command = proposal(actionReference, "durable-proposal");
    const first = ActionsInternalAccess.durable(ADMIT_ALL_WORKS, new ActionsJournal(journalPath));
    const receipt = first.commands.execute(command);
    const beforeQueries = await readFile(journalPath, "utf8");

    assert.equal(first.queries.getAction(actionReference)?.action.status, "PROPOSED");
    assert.equal(first.queries.getActionHistory(actionReference)?.value.length, 1);
    assert.equal(await readFile(journalPath, "utf8"), beforeQueries);

    const restarted = ActionsInternalAccess.durable(ADMIT_ALL_WORKS, new ActionsJournal(journalPath));
    assert.deepEqual(restarted.queries.getAction(actionReference)?.action, receipt.action);
    assert.deepEqual(restarted.queries.getActionHistory(actionReference)?.value, receipt.events);
    assert.deepEqual(restarted.commands.execute(command), receipt);
    assert.equal(await readFile(journalPath, "utf8"), beforeQueries);
    assert.throws(
      () => restarted.commands.execute({
        ...command,
        purpose: ActionPurpose.of("Divergent durable intent.", "CONTRIBUTES_TO_WORK_OBJECTIVE"),
      }),
      (error: unknown) => error instanceof ActionDomainError && error.code === "ACTION_CAUSALITY_CONFLICT",
    );
    assert.equal(await readFile(journalPath, "utf8"), beforeQueries);
  });
});

test("001E source introduces no direct mutation, second store, public transport or 001F integration", async () => {
  const source = await readFile(new URL("./actions-internal-access.ts", import.meta.url), "utf8");
  assert.match(source, /authority\.accept\(command\)/u);
  assert.doesNotMatch(source, /Action\.of|\.transact\(|\.append\(|writeFile|Map<|Repository|Projection|Cache/u);
  assert.doesNotMatch(source, /Http|Controller|Router|Endpoint|Bff|Frontend|Scheduler|Queue/u);
  assert.doesNotMatch(source, /WorkProgress|WorkLifecycle|WorkActionsPort|three.state|Planning|People|Decisions|Deliverables|Runtime/u);
});

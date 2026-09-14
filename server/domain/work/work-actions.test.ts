import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActionsInternalAccess,
  ActionsJournal,
  CommandId,
  WorkReference,
  type CurrentAction,
} from "../actions/index.js";
import {
  WorkActionsQuery,
  type WorkActionsReadSource,
} from "./index.js";

const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-ACTIONS-001" });
const ACTIONS_WORK = WorkReference.of(WORK.projectId, WORK.workId);
const ACTIONS_ADMISSION = Object.freeze({
  workExists: (workReference: WorkReference): boolean => workReference.equals(ACTIONS_WORK),
});

function provenance(actionId: string): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS",
    "WORK_ACTIONS_TEST_SOURCE",
    `establish-${actionId}`,
    new Date("2026-09-10T09:00:00.000Z"),
    "AUTHORITATIVE_BUSINESS_SOURCE",
  );
}

function propose(access: ActionsInternalAccess, actionId: string): void {
  const source = provenance(actionId);
  const reference = ActionReference.of(ACTIONS_WORK, ActionId.of(actionId));
  access.commands.execute({
    type: "ProposeAction",
    commandId: CommandId.of(`command-${actionId}`),
    causalityId: `cause-${actionId}`,
    expectedRevision: 0,
    provenance: source,
    actionReference: reference,
    purpose: ActionPurpose.of(
      `Produce the business outcome for ${actionId}.`,
      "CONTRIBUTES_TO_WORK_OBJECTIVE",
    ),
  });
}

test("Work integration exposes exactly the three contractual Actions states", () => {
  const unavailable = new WorkActionsQuery({
    listActionsByWork: () => { throw new Error("canonical read unavailable"); },
  }).get(WORK);
  const empty = new WorkActionsQuery({ listActionsByWork: () => [] }).get(WORK);
  const access = ActionsInternalAccess.inMemory(ACTIONS_ADMISSION);
  propose(access, "available");
  const available = new WorkActionsQuery(access.queries).get(WORK);

  assert.deepEqual(
    [unavailable.status, empty.status, available.status],
    ["ACTIONS_UNAVAILABLE", "ACTIONS_AVAILABLE_EMPTY", "ACTIONS_AVAILABLE"],
  );
});

test("zero Actions is a successful canonical read with an explicit empty collection", () => {
  const result = new WorkActionsQuery({ listActionsByWork: () => [] }).get(WORK);

  assert.deepEqual(result, {
    ...WORK,
    status: "ACTIONS_AVAILABLE_EMPTY",
    sourceDomain: "ACTIONS",
    actions: [],
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.actions), true);
});

test("one Action is looked up with the sole canonical WorkReference", () => {
  const access = ActionsInternalAccess.inMemory(ACTIONS_ADMISSION);
  propose(access, "one");
  let received: WorkReference | undefined;
  const source: WorkActionsReadSource = {
    listActionsByWork: (reference) => {
      received = reference;
      return access.queries.listActionsByWork(reference);
    },
  };

  const result = new WorkActionsQuery(source).get(WORK);

  assert.equal(received?.equals(ACTIONS_WORK), true);
  assert.equal(result.status, "ACTIONS_AVAILABLE");
  assert.deepEqual(result.actions, [{
    actionId: "one",
    status: "PROPOSED",
    revision: 1,
    graphRevision: 0,
  }]);
});

test("multiple Actions preserve deterministic canonical cardinality without an aggregate mirror", () => {
  const access = ActionsInternalAccess.inMemory(ACTIONS_ADMISSION);
  propose(access, "zeta");
  propose(access, "alpha");

  const result = new WorkActionsQuery(access.queries).get(WORK);

  assert.equal(result.status, "ACTIONS_AVAILABLE");
  assert.deepEqual(result.actions.map((action) => action.actionId), ["alpha", "zeta"]);
  assert.equal(result.actions.length, 2);
  for (const action of result.actions) {
    assert.deepEqual(Object.keys(action), ["actionId", "status", "revision", "graphRevision"]);
    assert.equal(Object.isFrozen(action), true);
    for (const forbidden of [
      "purpose", "tasks", "commands", "activities", "executions", "resultHistory",
      "currentResult", "dependencies", "provenance", "events", "history", "repository", "store",
    ]) assert.equal(forbidden in action, false);
  }
});

test("the Work boundary is read-only over durable ACTIONS canonical rebuilt state", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-work-actions-"));
  const journalPath = join(directory, "actions.journal.json");
  try {
    const writer = ActionsInternalAccess.durable(ACTIONS_ADMISSION, new ActionsJournal(journalPath));
    propose(writer, "durable");
    const before = await readFile(journalPath, "utf8");
    const rebuilt = ActionsInternalAccess.durable(ACTIONS_ADMISSION, new ActionsJournal(journalPath));

    const query = new WorkActionsQuery(rebuilt.queries);
    const first = query.get(WORK);
    const second = query.get(WORK);

    assert.deepEqual(second, first);
    assert.equal(first.status, "ACTIONS_AVAILABLE");
    assert.equal(first.actions[0]?.actionId, "durable");
    assert.equal(await readFile(journalPath, "utf8"), before);
    assert.deepEqual(Object.keys(query), ["actions"]);
    assert.equal("commands" in query, false);
    assert.equal("authority" in query, false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("Action availability never changes Work Lifecycle, Objective or Progress", () => {
  const workTruths = Object.freeze({
    objective: Object.freeze({ label: "Canonical objective", source: "WORK" }),
    lifecycle: Object.freeze({ current: "ACTIVE", source: "WORK" }),
    progression: Object.freeze({ percentage: 40, source: "MONITORING" }),
  });
  const before = JSON.stringify(workTruths);
  const access = ActionsInternalAccess.inMemory(ACTIONS_ADMISSION);
  propose(access, "separated");

  const result = new WorkActionsQuery(access.queries).get(WORK);

  assert.equal(result.status, "ACTIONS_AVAILABLE");
  assert.equal(JSON.stringify(workTruths), before);
  for (const forbidden of ["objective", "lifecycle", "progress", "progression", "completion"]) {
    assert.equal(forbidden in result, false);
  }
});

test("the integration exposes no Planning, PEOPLE or Runtime ownership", () => {
  const access = ActionsInternalAccess.inMemory(ACTIONS_ADMISSION);
  propose(access, "ownership");
  const result = new WorkActionsQuery(access.queries).get(WORK);

  for (const forbidden of [
    "phase", "milestone", "deadline", "priority", "schedule",
    "person", "people", "assignee", "assignment", "role",
    "mission", "agent", "run", "runtime", "technicalStatus",
  ]) {
    assert.equal(forbidden in result, false);
    assert.equal(result.actions.every((action) => !(forbidden in action)), true);
  }
});

test("unavailable and inconsistent ACTIONS reads fail closed without synthetic Actions", () => {
  const access = ActionsInternalAccess.inMemory(ACTIONS_ADMISSION);
  propose(access, "other-work");
  const canonical = access.queries.listActionsByWork(ACTIONS_WORK)[0];
  assert.ok(canonical);
  const mismatched = {
    action: canonical.action,
    revision: canonical.revision,
    graphRevision: canonical.graphRevision,
  } satisfies CurrentAction;
  const otherWork = Object.freeze({ projectId: "NOVA", workId: "OTHER-WORK" });
  const malformed = new WorkActionsQuery({
    listActionsByWork: () => null as unknown as readonly CurrentAction[],
  }).get(WORK);
  const mismatch = new WorkActionsQuery({
    listActionsByWork: () => [mismatched],
  }).get(otherWork);
  const duplicate = new WorkActionsQuery({
    listActionsByWork: () => [canonical, canonical],
  }).get(WORK);

  for (const result of [malformed, mismatch, duplicate]) {
    assert.equal(result.status, "ACTIONS_UNAVAILABLE");
    if (result.status === "ACTIONS_UNAVAILABLE") {
      assert.equal(result.reason, "ACTIONS_READ_INCONSISTENT");
    }
    assert.equal("actions" in result, false);
  }
});

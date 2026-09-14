import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ActionDomainError,
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActionsAuthority,
  ActionsJournal,
  CommandId,
  WorkReference,
} from "./index.js";

const ADMIT_ALL_WORKS = Object.freeze({
  workExists: (_workReference: WorkReference): boolean => true,
});

function context(id: string, expectedRevision: number, minute: number) {
  return {
    commandId: CommandId.of(id),
    causalityId: `retry-${id}`,
    expectedRevision,
    provenance: ActionProvenance.of(
      "NOVA_ACTIONS_BUSINESS",
      "EXPLICIT_BUSINESS_INTENT",
      `retry-cause-${minute}`,
      new Date(`2026-09-11T14:${String(minute).padStart(2, "0")}:00.000Z`),
      "AUTHORITATIVE_BUSINESS_SOURCE",
    ),
  } as const;
}

function reference(id: string): ActionReference {
  return ActionReference.of(
    WorkReference.of("project-retry", "work-retry"),
    ActionId.of(id),
  );
}

function advanceToInProgress(authority: ActionsAuthority, actionReference: ActionReference): void {
  authority.accept({
    type: "ProposeAction",
    ...context(`${actionReference.actionId.value}-propose`, 0, 1),
    actionReference,
    purpose: ActionPurpose.of("Prove explicit retry semantics.", "CONTRIBUTES_TO_WORK_OBJECTIVE"),
  });
  authority.accept({
    type: "AcceptAction",
    ...context(`${actionReference.actionId.value}-accept`, 1, 2),
    actionReference,
  });
  authority.accept({
    type: "StartAction",
    ...context(`${actionReference.actionId.value}-start`, 2, 3),
    actionReference,
  });
}

function advanceToFailed(authority: ActionsAuthority, actionReference: ActionReference): void {
  advanceToInProgress(authority, actionReference);
  authority.accept({
    type: "FailAction",
    ...context(`${actionReference.actionId.value}-fail`, 3, 4),
    actionReference,
    outcome: "The intended business outcome was not obtained.",
  });
}

test("RetryAction preserves FAILED to READY without inventing an eighteenth Event", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("explicit-retry");
  advanceToFailed(authority, actionReference);

  const receipt = authority.accept({
    type: "RetryAction",
    ...context("explicit-retry-command", 4, 5),
    actionReference,
  });

  assert.equal(receipt.action.status, "READY");
  assert.equal(receipt.previousRevision, 4);
  assert.equal(receipt.revision, 5);
  assert.deepEqual(receipt.events, []);
});

test("ResumeAction keeps ActionResumed reserved to a BLOCKED origin", () => {
  const authority = new ActionsAuthority(ADMIT_ALL_WORKS);
  const actionReference = reference("blocked-resume");
  advanceToInProgress(authority, actionReference);
  authority.accept({
    type: "BlockAction",
    ...context("blocked-resume-block", 3, 4),
    actionReference,
    condition: "A business prerequisite is temporarily absent.",
  });

  const resumed = authority.accept({
    type: "ResumeAction",
    ...context("blocked-resume-command", 4, 5),
    actionReference,
    destination: "IN_PROGRESS",
  });

  assert.equal(resumed.action.status, "IN_PROGRESS");
  assert.deepEqual(resumed.events.map((event) => event.type), ["ActionResumed"]);
  assert.deepEqual(resumed.events[0]?.payload, { from: "BLOCKED", to: "IN_PROGRESS" });

  assert.throws(
    () => authority.accept({
      type: "ResumeAction",
      ...context("invalid-ready-resume", 5, 6),
      actionReference,
      destination: "READY",
    }),
    (error: unknown) => error instanceof ActionDomainError
      && error.code === "ACTION_STATUS_TRANSITION_INVALID",
  );
  assert.equal(authority.readCanonicalState().actions[0]?.revision, 5);

  const failedReference = reference("failed-cannot-resume");
  advanceToFailed(authority, failedReference);
  assert.throws(
    () => authority.accept({
      type: "ResumeAction",
      ...context("invalid-failed-resume", 4, 6),
      actionReference: failedReference,
      destination: "READY",
    }),
    (error: unknown) => error instanceof ActionDomainError
      && error.code === "ACTION_STATUS_TRANSITION_INVALID",
  );
  assert.equal(authority.readCanonicalState().actions[1]?.revision, 4);
});

test("RetryAction persistence and deterministic replay preserve the authorized transition", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-actions-retry-"));
  const journalPath = join(directory, "canonical-actions.json");
  try {
    const actionReference = reference("durable-retry");
    let authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(journalPath));
    advanceToFailed(authority, actionReference);
    const retryCommand = {
      type: "RetryAction",
      ...context("durable-retry-command", 4, 5),
      actionReference,
    } as const;
    const retried = authority.accept(retryCommand);
    const beforeReplay = await readFile(journalPath, "utf8");

    authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(journalPath));
    const canonical = authority.readCanonicalState();
    const replayed = authority.accept(retryCommand);

    assert.equal(canonical.actions[0]?.action.status, "READY");
    assert.equal(canonical.actions[0]?.events.at(-1)?.type, "ActionFailed");
    assert.deepEqual(replayed, retried);
    assert.deepEqual(replayed.events, []);
    assert.equal(await readFile(journalPath, "utf8"), beforeReplay);

    const document = JSON.parse(beforeReplay) as {
      entries: Array<{
        command: { type: string };
        receipt: { action: { status: string }; events: Array<{ type: string; payload: unknown }> };
      }>;
    };
    const durableRetry = document.entries.at(-1)!;
    assert.equal(durableRetry.command.type, "RetryAction");
    assert.equal(durableRetry.receipt.action.status, "READY");
    assert.deepEqual(durableRetry.receipt.events, []);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

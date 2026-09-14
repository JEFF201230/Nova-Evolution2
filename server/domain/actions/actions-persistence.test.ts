import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  ActionCommand,
  ActionDependency,
  ActionDomainError,
  ActionId,
  ActionProvenance,
  ActionPurpose,
  ActionReference,
  ActionResult,
  ActionsAuthority,
  ActionsJournal,
  ActionsJournalError,
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

const instant = (minute: number): Date => new Date(`2026-09-10T12:${String(minute).padStart(2, "0")}:00.000Z`);

function provenance(minute: number): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS", "EXPLICIT_BUSINESS_INTENT", `durable-cause-${minute}`,
    instant(minute), "AUTHORITATIVE_BUSINESS_SOURCE",
  );
}

function observationProvenance(minute: number): ActionProvenance {
  return ActionProvenance.of(
    "NOVA_ACTIONS_BUSINESS", "EXPLICIT_BUSINESS_OBSERVATION", `durable-observation-${minute}`,
    instant(minute), "BUSINESS_OBSERVATION",
  );
}

function reference(action: string, work = "work-durable"): ActionReference {
  return ActionReference.of(WorkReference.of("project-durable", work), ActionId.of(action));
}

const ADMIT_ALL_WORKS = Object.freeze({
  workExists: (_workReference: WorkReference): boolean => true,
});

function context(id: string, expectedRevision: number, minute: number) {
  return {
    commandId: CommandId.of(id), causalityId: `durable-${id}`, expectedRevision, provenance: provenance(minute),
  } as const;
}

function proposal(actionReference: ActionReference, id: string): ActionsCommand {
  return {
    type: "ProposeAction", ...context(id, 0, 1), actionReference,
    purpose: ActionPurpose.of(`Produce durable outcome ${actionReference.actionId.value}.`, "CONTRIBUTES_TO_WORK_OBJECTIVE"),
  };
}

function expectDomainCode(code: ActionFoundationErrorCode, operation: () => unknown): void {
  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof ActionDomainError);
    assert.equal(error.code, code);
    return true;
  });
}

async function fixture(run: (path: string) => void | Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "nova-actions-"));
  try { await run(join(directory, "canonical-actions.json")); } finally { await rm(directory, { recursive: true, force: true }); }
}

test("rejected ProposeAction for an absent authoritative Work mutates and persists nothing", async () => {
  await fixture(async (path) => {
    const authoritativeWork = WorkReference.of("project-durable", "work-authoritative");
    const authority = new ActionsAuthority({
      workExists: (workReference) => workReference.equals(authoritativeWork),
    }, new ActionsJournal(path));
    authority.accept(proposal(
      ActionReference.of(authoritativeWork, ActionId.of("admitted")),
      "admitted-work",
    ));
    const beforeState = authority.readCanonicalState();
    const beforeJournal = await readFile(path, "utf8");

    expectDomainCode("WORK_REFERENCE_NOT_FOUND", () => authority.accept(
      proposal(reference("rejected", "work-absent"), "absent-work"),
    ));

    assert.deepEqual(authority.readCanonicalState(), beforeState);
    assert.equal(await readFile(path, "utf8"), beforeJournal);
  });
});

test("historical replay and exact idempotence do not re-evaluate current Work admission", async () => {
  await fixture((path) => {
    const actionReference = reference("historical-work-admission");
    const proposed = proposal(actionReference, "historical-work-admission");
    const accepted = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(proposed);
    let admissionCalls = 0;
    const unavailableCurrentWorkSource = Object.freeze({
      workExists: (_workReference: WorkReference): boolean => {
        admissionCalls += 1;
        throw new Error("CURRENT_WORK_SOURCE_UNAVAILABLE");
      },
    });

    const recovered = new ActionsAuthority(unavailableCurrentWorkSource, new ActionsJournal(path));
    assert.equal(recovered.readCanonicalState().actions[0]?.action.reference.key, actionReference.key);
    assert.deepEqual(recovered.accept(proposed), accepted);
    assert.equal(admissionCalls, 0);

    assert.throws(
      () => recovered.accept(proposal(reference("new-proposal"), "new-proposal")),
      /CURRENT_WORK_SOURCE_UNAVAILABLE/,
    );
    assert.equal(admissionCalls, 1);
  });
});

test("one canonical journal durably preserves state, ordered histories, events, receipts and provenance", async () => {
  await fixture(async (path) => {
    const actionReference = reference("complete-history");
    let authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    let receipt = authority.accept(proposal(actionReference, "propose-history"));
    const task = Task.of(TaskId.of("task-history"), "Perform durable bounded work.", provenance(2));
    receipt = authority.accept({ type: "AddTask", ...context("task-history", receipt.revision, 2), actionReference, task });
    const issuedCommand = ActionCommand.record(CommandId.of("instruction-history"), "Perform the durable work.", provenance(3));
    receipt = authority.accept({ type: "IssueActionCommand", ...context("command-history", receipt.revision, 3), actionReference, issuedCommand });
    const activity = Activity.observe(ActivityId.of("activity-history"), "Durable work was observed.", provenance(4));
    receipt = authority.accept({ type: "ObserveActivity", ...context("activity-history", receipt.revision, 4), actionReference, activity });
    const secondActivity = Activity.observe(ActivityId.of("activity-history-2"), "A second durable fact was observed.", provenance(5));
    receipt = authority.accept({ type: "ObserveActivity", ...context("activity-history-2", receipt.revision, 5), actionReference, activity: secondActivity });
    const execution = Execution.occur(ExecutionId.of("execution-history"), { kind: "TASK", taskId: task.id }, "Durable execution occurred.", provenance(5));
    receipt = authority.accept({ type: "StartExecution", ...context("execution-history", receipt.revision, 6), actionReference, execution });
    receipt = authority.accept({
      type: "EndExecution", ...context("execution-ended", receipt.revision, 7), actionReference,
      executionId: execution.id.value, outcome: "Execution ended durably.",
    });
    const secondExecution = Execution.occur(ExecutionId.of("execution-history-2"), { kind: "ACTION" }, "Second durable execution occurred.", provenance(8));
    receipt = authority.accept({ type: "StartExecution", ...context("execution-history-2", receipt.revision, 8), actionReference, execution: secondExecution });
    receipt = authority.accept({
      type: "EndExecution", ...context("execution-ended-2", receipt.revision, 9), actionReference,
      executionId: secondExecution.id.value, outcome: "Second execution ended durably.",
    });
    const firstResult = ActionResult.record(ResultId.of("result-first"), "First durable result.", null, provenance(10));
    receipt = authority.accept({ type: "RecordResult", ...context("result-first", receipt.revision, 10), actionReference, result: firstResult });
    const prefixDocument = JSON.parse(await readFile(path, "utf8")) as { entries: unknown[] };
    const secondResult = ActionResult.record(
      ResultId.of("result-second"), "Current durable result.",
      Object.freeze({ kind: "DELIVERABLE", identity: "external-deliverable-reference" }), provenance(11),
    );
    const finalCommand = {
      type: "RecordResult", ...context("result-second", receipt.revision, 11), actionReference, result: secondResult,
    } as const;
    receipt = authority.accept(finalCommand);
    const beforeRetry = await readFile(path, "utf8");

    authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    const recovered = authority.accept(finalCommand);
    assert.equal(await readFile(path, "utf8"), beforeRetry);
    assert.equal(recovered.revision, 11);
    assert.equal(recovered.action.tasks.length, 1);
    assert.equal(recovered.action.commands.length, 1);
    assert.deepEqual(recovered.action.activities.map((item) => item.id.value), ["activity-history", "activity-history-2"]);
    assert.deepEqual(recovered.action.executions.map((item) => item.id.value), ["execution-history", "execution-history-2"]);
    assert.deepEqual(recovered.action.resultHistory.map((result) => result.id.value), ["result-first", "result-second"]);
    assert.equal(recovered.action.currentResult?.id.value, "result-second");
    assert.equal(recovered.action.currentResult?.externalReference?.identity, "external-deliverable-reference");
    assert.equal(recovered.action.currentResult?.provenance.businessCause, "durable-cause-11");

    const document = JSON.parse(beforeRetry) as { entries: Array<{ sequence: number; receipt: { events: Array<{ type: string; ordinal: number }> } }> };
    assert.equal(document.entries.length, 11);
    assert.deepEqual(document.entries.slice(0, -1), prefixDocument.entries);
    assert.deepEqual(document.entries.map((entry) => entry.sequence), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    assert.deepEqual(document.entries.flatMap((entry) => entry.receipt.events.map((event) => event.type)), [
      "ActionProposed", "TaskAdded", "CommandIssued", "ActivityObserved", "ActivityObserved",
      "ExecutionStarted", "ExecutionEnded", "ExecutionStarted", "ExecutionEnded", "ResultRecorded", "ResultRecorded",
    ]);
  });
});

test("the explicit completion observation is persisted and deterministically replayed", async () => {
  await fixture(async (path) => {
    const actionReference = reference("durable-observed-completion");
    let authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    authority.accept(proposal(actionReference, "observed-propose"));
    authority.accept({
      type: "AcceptAction", ...context("observed-accept", 1, 2), actionReference,
    });
    authority.accept({
      type: "StartAction", ...context("observed-start", 2, 3), actionReference,
    });
    const completionObservation = Activity.observe(
      ActivityId.of("durable-completion-observation"),
      "The expected durable business accomplishment was explicitly observed.",
      observationProvenance(4),
    );
    const completionCommand = {
      type: "CompleteAction",
      ...context("observed-complete", 3, 4),
      actionReference,
      completionObservation,
    } as const;
    const completed = authority.accept(completionCommand);
    const beforeReplay = await readFile(path, "utf8");

    authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    const replayed = authority.accept(completionCommand);

    assert.deepEqual(replayed, completed);
    assert.equal(await readFile(path, "utf8"), beforeReplay);
    assert.equal(replayed.action.status, "COMPLETED");
    assert.equal(replayed.action.currentResult, null);
    assert.equal(replayed.action.resultHistory.length, 0);
    assert.equal(replayed.action.completionObservationId?.value, "durable-completion-observation");
    assert.equal(replayed.action.activities[0]?.observedFact,
      "The expected durable business accomplishment was explicitly observed.");
    assert.equal(replayed.action.activities[0]?.provenance.origin, "BUSINESS_OBSERVATION");
    assert.deepEqual(replayed.events.map((event) => event.type), ["ActivityObserved", "ActionCompleted"]);

    const document = JSON.parse(beforeReplay) as {
      entries: Array<{
        command: { completionObservation?: { observedFact?: string }; result?: unknown };
        receipt: { action: { resultHistory: unknown[] }; events: Array<{ type: string }> };
      }>;
    };
    const durableCompletion = document.entries.at(-1)!;
    assert.equal(durableCompletion.command.completionObservation?.observedFact,
      "The expected durable business accomplishment was explicitly observed.");
    assert.equal("result" in durableCompletion.command, false);
    assert.equal(durableCompletion.receipt.action.resultHistory.length, 0);
    assert.deepEqual(durableCompletion.receipt.events.map((event) => event.type),
      ["ActivityObserved", "ActionCompleted"]);
  });
});

test("Result-backed completion keeps its existing durable shape and replay semantics", async () => {
  await fixture(async (path) => {
    const actionReference = reference("durable-result-completion");
    let authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    authority.accept(proposal(actionReference, "result-complete-propose"));
    authority.accept({
      type: "AcceptAction", ...context("result-complete-accept", 1, 2), actionReference,
    });
    authority.accept({
      type: "StartAction", ...context("result-complete-start", 2, 3), actionReference,
    });
    const result = ActionResult.record(
      ResultId.of("durable-completion-result"),
      "The explicit durable authoritative Result.",
      null,
      provenance(4),
    );
    const completionCommand = {
      type: "CompleteAction",
      ...context("result-complete", 3, 4),
      actionReference,
      result,
    } as const;
    const completed = authority.accept(completionCommand);
    const beforeReplay = await readFile(path, "utf8");

    authority = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    const replayed = authority.accept(completionCommand);

    assert.deepEqual(replayed, completed);
    assert.equal(await readFile(path, "utf8"), beforeReplay);
    assert.equal(replayed.action.currentResult?.id.value, "durable-completion-result");
    assert.equal(replayed.action.completionObservationId, undefined);
    assert.deepEqual(replayed.events.map((event) => event.type), ["ResultRecorded", "ActionCompleted"]);

    const document = JSON.parse(beforeReplay) as {
      entries: Array<{
        command: { result?: unknown; completionObservation?: unknown };
        receipt: { action: Record<string, unknown>; events: Array<{ payload: Record<string, unknown> }> };
      }>;
    };
    const durableCompletion = document.entries.at(-1)!;
    assert.equal("result" in durableCompletion.command, true);
    assert.equal("completionObservation" in durableCompletion.command, false);
    assert.equal("completionObservationId" in durableCompletion.receipt.action, false);
    assert.deepEqual(durableCompletion.receipt.events[1]?.payload, {
      from: "IN_PROGRESS",
      to: "COMPLETED",
    });
  });
});

test("durable CAS rereads canonical Action state and rejects stale competing writers without last-write-wins", async () => {
  await fixture(async (path) => {
    const actionReference = reference("action-cas");
    const first = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    const second = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    first.accept(proposal(actionReference, "cas-propose"));
    const winner = first.accept({ type: "AcceptAction", ...context("cas-winner", 1, 2), actionReference });
    expectDomainCode("ACTION_REVISION_CONFLICT", () => second.accept({
      type: "CancelAction", ...context("cas-stale", 1, 3), actionReference, reason: "Stale content must lose.",
    }));
    const recovered = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept({
      type: "AcceptAction", ...context("cas-winner", 1, 2), actionReference,
    });
    assert.equal(recovered.action.status, "READY");
    assert.equal(recovered.revision, winner.revision);
    assert.equal((JSON.parse(await readFile(path, "utf8")) as { entries: unknown[] }).entries.length, 2);
  });
});

test("two concurrent processes cannot both commit conflicting Action mutations", async () => {
  await fixture(async (path) => {
    const actionReference = reference("process-cas");
    new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(proposal(actionReference, "process-propose"));
    const moduleUrl = new URL("./index.ts", import.meta.url).href;
    const worker = `
      import { ActionId, ActionProvenance, ActionReference, ActionsAuthority, ActionsJournal, CommandId, WorkReference } from ${JSON.stringify(moduleUrl)};
      const [path, mode] = process.argv.slice(1);
      const actionReference = ActionReference.of(WorkReference.of("project-durable", "work-durable"), ActionId.of("process-cas"));
      const command = mode === "accept"
        ? { type: "AcceptAction", commandId: CommandId.of("process-accept"), causalityId: "durable-process-accept", expectedRevision: 1, provenance: ActionProvenance.of("NOVA_ACTIONS_BUSINESS", "EXPLICIT_BUSINESS_INTENT", "process-accept", new Date("2026-09-10T12:02:00.000Z"), "AUTHORITATIVE_BUSINESS_SOURCE"), actionReference }
        : { type: "CancelAction", commandId: CommandId.of("process-cancel"), causalityId: "durable-process-cancel", expectedRevision: 1, provenance: ActionProvenance.of("NOVA_ACTIONS_BUSINESS", "EXPLICIT_BUSINESS_INTENT", "process-cancel", new Date("2026-09-10T12:02:00.000Z"), "AUTHORITATIVE_BUSINESS_SOURCE"), actionReference, reason: "Conflicting process mutation." };
      try { new ActionsAuthority({ workExists: () => true }, new ActionsJournal(path)).accept(command); process.exit(0); }
      catch (error) { if (error?.code === "ACTION_REVISION_CONFLICT") process.exit(2); throw error; }
    `;
    const run = (mode: "accept" | "cancel"): Promise<number> => new Promise((resolve, reject) => {
      execFile(
        process.execPath,
        ["--import", "tsx", "--input-type=module", "--eval", worker, path, mode],
        { cwd: process.cwd() },
        (error) => {
          if (error === null) resolve(0);
          else if (typeof error.code === "number") resolve(error.code);
          else reject(error);
        },
      );
    });
    assert.deepEqual((await Promise.all([run("accept"), run("cancel")])).sort(), [0, 2]);
    const document = JSON.parse(await readFile(path, "utf8")) as { entries: Array<{ command: { type: string } }> };
    assert.equal(document.entries.length, 2);
    assert.ok(["AcceptAction", "CancelAction"].includes(document.entries[1]!.command.type));
  });
});

test("durable graph CAS preserves source ownership, same-Work acyclicity and graph revision", async () => {
  await fixture(async (path) => {
    const a = reference("graph-a");
    const b = reference("graph-b");
    const first = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    const stale = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    first.accept(proposal(a, "graph-propose-a"));
    first.accept(proposal(b, "graph-propose-b"));
    const aToB = ActionDependency.from(a, b, "B must be satisfied first.", provenance(2));
    const winningCommand = {
      type: "DeclareActionDependency", ...context("graph-a-b", 1, 2), actionReference: a,
      dependency: aToB, expectedGraphRevision: 0,
    } as const;
    const winner = first.accept(winningCommand);
    assert.equal(winner.graphRevision, 1);
    const committed = (JSON.parse(await readFile(path, "utf8")) as {
      entries: Array<{ receipt: { graphRevision: number; action: { dependencies: unknown[] }; events: Array<{ type: string }> } }>;
    }).entries.at(-1)!.receipt;
    assert.equal(committed.graphRevision, 1);
    assert.equal(committed.action.dependencies.length, 1);
    assert.deepEqual(committed.events.map((event) => event.type), ["ActionDependencyDeclared"]);
    const bToA = ActionDependency.from(b, a, "A would close the cycle.", provenance(3));
    expectDomainCode("ACTION_REVISION_CONFLICT", () => stale.accept({
      type: "DeclareActionDependency", ...context("graph-stale", 1, 3), actionReference: b,
      dependency: bToA, expectedGraphRevision: 0,
    }));
    expectDomainCode("ACTION_DEPENDENCY_CYCLE", () => stale.accept({
      type: "DeclareActionDependency", ...context("graph-cycle", 1, 3), actionReference: b,
      dependency: bToA, expectedGraphRevision: 1,
    }));
    const recovered = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(winningCommand);
    assert.equal(recovered.action.dependencies[0]?.source.key, a.key);
    assert.equal(recovered.action.dependencies[0]?.target.key, b.key);
    assert.equal(recovered.graphRevision, 1);
  });
});

test("Result, event and receipt share the atomic replacement boundary and a failed write exposes nothing", async () => {
  await fixture(async (path) => {
    const actionReference = reference("atomic-result");
    const initial = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path));
    initial.accept(proposal(actionReference, "atomic-propose"));
    const before = await readFile(path, "utf8");
    class FailingJournal extends ActionsJournal {
      #fail = true;
      protected override replaceCanonical(temporaryPath: string): void {
        if (this.#fail) {
          this.#fail = false;
          throw new Error("injected replacement failure");
        }
        super.replaceCanonical(temporaryPath);
      }
    }
    const result = ActionResult.record(ResultId.of("atomic-result"), "Atomic result.", null, provenance(2));
    const failed = new ActionsAuthority(ADMIT_ALL_WORKS, new FailingJournal(path));
    assert.throws(() => failed.accept({
      type: "RecordResult", ...context("atomic-failed", 1, 2), actionReference, result,
    }), (error: unknown) => error instanceof ActionsJournalError && error.code === "ACTIONS_JOURNAL_WRITE_FAILED");
    assert.equal(await readFile(path, "utf8"), before);

    const accepted = failed.accept({
      type: "AcceptAction", ...context("atomic-after-failure", 1, 3), actionReference,
    });
    assert.equal(accepted.action.status, "READY");
    assert.equal(accepted.action.resultHistory.length, 0);
    assert.equal(accepted.events[0]?.type, "ActionAccepted");
  });
});

test("restart replay is deterministic and malformed or incoherent canonical data fails closed", async () => {
  await fixture(async (path) => {
    const actionReference = reference("replay");
    const command = proposal(actionReference, "replay-propose");
    const first = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(command);
    const second = new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(command);
    assert.deepEqual(second, first);
    await writeFile(`${path}.next-interrupted`, "partial technical candidate", "utf8");
    assert.deepEqual(new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(command), first);

    const incoherent = JSON.parse(await readFile(path, "utf8")) as {
      entries: Array<{ sequence: number; previousHash: string; command: unknown; receipt: { revision: number }; hash: string }>;
    };
    const entry = incoherent.entries[0]!;
    entry.receipt.revision = 999;
    const canonicalize = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(canonicalize);
      if (typeof value === "object" && value !== null) {
        return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
      }
      return value;
    };
    entry.hash = createHash("sha256").update(JSON.stringify(canonicalize({
      sequence: entry.sequence, previousHash: entry.previousHash, command: entry.command, receipt: entry.receipt,
    }))).digest("hex");
    await writeFile(path, JSON.stringify(incoherent), "utf8");
    assert.throws(
      () => new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)),
      (error: unknown) => error instanceof ActionsJournalError && error.code === "ACTIONS_JOURNAL_CORRUPT",
    );
  });
});

test("divergent durable causality reuse fails closed and cannot append facts or receipts", async () => {
  await fixture(async (path) => {
    const actionReference = reference("causality");
    const command = proposal(actionReference, "causality-propose");
    new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(command);
    const before = await readFile(path, "utf8");
    const divergent = {
      ...command,
      purpose: ActionPurpose.of("Divergent durable command content.", "CONTRIBUTES_TO_WORK_OBJECTIVE"),
    };
    expectDomainCode("ACTION_CAUSALITY_CONFLICT", () => new ActionsAuthority(ADMIT_ALL_WORKS, new ActionsJournal(path)).accept(divergent));
    assert.equal(await readFile(path, "utf8"), before);
  });
});

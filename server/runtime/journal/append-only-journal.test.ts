import assert from "node:assert/strict";
import test from "node:test";
import { AppendOnlyJournal, classifyRunRecovery } from "./append-only-journal.js";

const event = (eventType: string, payload: unknown = {}) => ({
  eventId: `evt-${eventType.toLowerCase()}`,
  projectId: "project-a",
  missionId: "mission-a",
  runId: "run-a",
  correlationId: "corr-a",
  eventType,
  payload,
});
const recoveryEvidence = {
  processAlive: false,
  processTreeAlive: false,
  reportPresent: false,
  worktreeModified: false,
  lockPresent: false,
  journalValid: true,
  snapshotValid: true,
  artifactsValid: true,
} as const;

test("append builds a deterministic hash chain and replays in sequence", () => {
  const journal = new AppendOnlyJournal();
  journal.append({ ...event("CREATED", { b: 2, a: 1 }), timestamp: "2026-07-24T00:00:00.000Z" });
  journal.append({ ...event("RUNNING"), timestamp: "2026-07-24T00:01:00.000Z" });

  assert.equal(journal.size, 2);
  assert.equal(journal.verifyIntegrity().valid, true);
  const replayed = journal.replay<string[]>([], (state, item) => [...state, item.eventType]);
  assert.deepEqual(replayed, ["CREATED", "RUNNING"]);
  assert.equal(journal.snapshot()[1].previousHash, journal.snapshot()[0].eventHash);
});

test("integrity verification detects tampering and replay refuses a broken chain", () => {
  const journal = new AppendOnlyJournal();
  journal.append({ ...event("CREATED"), timestamp: "2026-07-24T00:00:00.000Z" });
  journal.append({ ...event("FAILED"), timestamp: "2026-07-24T00:01:00.000Z" });
  (journal as unknown as { events: Array<{ payload: unknown }> }).events[1].payload = { reason: "changed" };
  assert.equal(journal.verifyIntegrity().valid, false);
  assert.throws(() => journal.replay([], (state) => state));
});

test("recovery classification distinguishes interrupted runs, drift and orphan locks", () => {
  assert.equal(
    classifyRunRecovery({ runId: "r1", status: "RUNNING", ...recoveryEvidence }).classification,
    "INTERRUPTED_REPORT_ABSENT",
  );
  assert.equal(
    classifyRunRecovery({ runId: "r2", status: "RUNNING", ...recoveryEvidence, reportPresent: true }).classification,
    "INTERRUPTED_REPORT_PRESENT",
  );
  assert.equal(
    classifyRunRecovery({ runId: "r3", status: "RUNNING", ...recoveryEvidence, worktreeModified: true, lockPresent: true }).classification,
    "WORKTREE_DRIFT",
  );
  assert.equal(
    classifyRunRecovery({ runId: "r4", status: "RUNNING", ...recoveryEvidence, lockPresent: true }).classification,
    "ORPHAN_LOCK",
  );
  assert.equal(
    classifyRunRecovery({ runId: "r5", status: "RUNNING", ...recoveryEvidence, processAlive: "UNKNOWN" }).classification,
    "INSPECTION_UNKNOWN",
  );
  assert.equal(
    classifyRunRecovery({ runId: "r6", status: "RUNNING", ...recoveryEvidence, journalValid: false }).classification,
    "JOURNAL_INVALID",
  );
});

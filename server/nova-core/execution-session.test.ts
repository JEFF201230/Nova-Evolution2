import assert from "node:assert/strict";
import test from "node:test";
import {
  ExecutionSession,
  type ExecutionSessionInput,
  type ExecutionSessionStatus,
} from "./execution-session.js";

function createInput(
  overrides: Partial<ExecutionSessionInput> = {},
): ExecutionSessionInput {
  return {
    executionSessionId: "EXECUTION-SESSION-001",
    missionId: "CEREBRAU-REAL-EXECUTION-C",
    promptPackageId: "PROMPT-PACKAGE-001",
    runtimeMissionId: "CEREBRAU-REAL-EXECUTION-C",
    startedAt: "2026-07-28T14:00:00.000Z",
    completedAt: "2026-07-28T14:00:01.250Z",
    durationMs: 1250,
    status: "COMPLETED",
    rawCodexResult: {
      stdout: "{\"type\":\"turn.completed\"}\n",
      stderr: "",
      exitCode: 0,
    },
    ...overrides,
  };
}

test("ExecutionSession preserves complete execution traceability", () => {
  const input = createInput();
  const session = new ExecutionSession(input);

  assert.equal(session.executionSessionId, input.executionSessionId);
  assert.equal(session.missionId, input.missionId);
  assert.equal(session.promptPackageId, input.promptPackageId);
  assert.equal(session.runtimeMissionId, input.runtimeMissionId);
  assert.equal(session.startedAt, input.startedAt);
  assert.equal(session.completedAt, input.completedAt);
  assert.equal(session.durationMs, input.durationMs);
  assert.equal(session.status, "COMPLETED");
  assert.equal(session.rawCodexResult, input.rawCodexResult);
  assert.equal(Object.isFrozen(session), true);
});

test("ExecutionSession supports every required terminal status", () => {
  const statuses: readonly ExecutionSessionStatus[] = [
    "COMPLETED",
    "TIMEOUT",
    "CANCELLED",
    "INTERRUPTED",
    "CONNECTION_ERROR",
    "AUTHENTICATION_ERROR",
    "RUNTIME_ERROR",
  ];

  for (const status of statuses) {
    assert.equal(
      new ExecutionSession(createInput({ status })).status,
      status,
    );
  }
});

test("ExecutionSession rejects missing traceability", () => {
  assert.throws(
    () =>
      new ExecutionSession(
        createInput({ promptPackageId: "" }),
      ),
    /ES-001/,
  );
});

test("ExecutionSession rejects reversed or non-canonical timestamps", () => {
  assert.throws(
    () =>
      new ExecutionSession(
        createInput({
          startedAt: "2026-07-28T14:00:02.000Z",
          completedAt: "2026-07-28T14:00:01.000Z",
        }),
      ),
    /ES-002/,
  );
  assert.throws(
    () =>
      new ExecutionSession(
        createInput({ completedAt: "2026-07-28" }),
      ),
    /ES-002/,
  );
});

test("ExecutionSession rejects an invalid duration or status", () => {
  assert.throws(
    () => new ExecutionSession(createInput({ durationMs: -1 })),
    /ES-003/,
  );
  assert.throws(
    () =>
      new ExecutionSession(
        createInput({
          status: "UNKNOWN" as ExecutionSessionStatus,
        }),
      ),
    /ES-004/,
  );
});

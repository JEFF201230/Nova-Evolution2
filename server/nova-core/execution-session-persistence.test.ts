import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  rm,
} from "node:fs/promises";
import {
  tmpdir,
} from "node:os";
import {
  join,
} from "node:path";
import {
  ExecutionSession,
  type ExecutionSessionStatus,
} from "./execution-session.js";
import {
  ExecutionSessionPersistence,
} from "./execution-session-persistence.js";
import {
  IntegrationRuntimeRepository,
} from "./integration-runtime-repository.js";

const directories: string[] = [];
const KEY = "production-hardening-test-key-32-characters";

test.after(async () => {
  await Promise.all(
    directories.map((directory) =>
      rm(directory, { recursive: true, force: true })),
  );
});

async function persistence(): Promise<ExecutionSessionPersistence> {
  const directory = await mkdtemp(
    join(tmpdir(), "nova-session-persistence-"),
  );
  directories.push(directory);
  return new ExecutionSessionPersistence(
    new IntegrationRuntimeRepository(
      join(directory, "runtime.json"),
      {
        attestationKey: KEY,
        featureFlag: { enabled: true },
      },
    ),
    { enabled: true },
  );
}

function session(
  status: ExecutionSessionStatus,
  completedAt: string,
): ExecutionSession {
  return new ExecutionSession({
    executionSessionId: "SESSION-P1-005",
    missionId: "MISSION-P1-005",
    promptPackageId: "PACKAGE-P1-005",
    runtimeMissionId: "MISSION-P1-005",
    startedAt: "2026-07-28T22:00:00.000Z",
    completedAt,
    durationMs:
      Date.parse(completedAt) -
      Date.parse("2026-07-28T22:00:00.000Z"),
    status,
    rawCodexResult: { stdout: "raw", stderr: "" },
  });
}

test("P1-005 persists SUCCESS, FAILED, CANCELLED and TIMEOUT append-only", async () => {
  const store = await persistence();
  await store.persist(
    session("COMPLETED", "2026-07-28T22:00:01.000Z"),
    "SUCCESS",
  );
  await store.persist(
    session("RUNTIME_ERROR", "2026-07-28T22:00:02.000Z"),
    "FAILED",
    Object.assign(new Error("runtime failed"), {
      code: "RUNTIME_ERROR",
    }),
  );
  await store.persist(
    session("CANCELLED", "2026-07-28T22:00:03.000Z"),
    "CANCELLED",
    Object.assign(new Error("cancelled"), {
      code: "CODEX_CANCELLED",
    }),
  );
  await store.persist(
    session("TIMEOUT", "2026-07-28T22:00:04.000Z"),
    "TIMEOUT",
    Object.assign(new Error("timeout"), {
      code: "CODEX_TIMEOUT",
    }),
  );

  const history = await store.history(
    "MISSION-P1-005",
    "SESSION-P1-005",
  );
  assert.deepEqual(
    history.map((entry) => entry.outcome),
    ["SUCCESS", "FAILED", "CANCELLED", "TIMEOUT"],
  );
  assert.deepEqual(await store.replay(
    "MISSION-P1-005",
    "SESSION-P1-005",
  ), history);
  assert.equal(
    (await store.reconstruct(
      "MISSION-P1-005",
      "SESSION-P1-005",
    ))?.outcome,
    "TIMEOUT",
  );
  assert.equal(history[1]?.failure?.message, "runtime failed");
  assert.equal(history[1]?.failure?.code, "RUNTIME_ERROR");
});

test("P1-005 makes identical terminal writes idempotent", async () => {
  const store = await persistence();
  const terminal = session(
    "COMPLETED",
    "2026-07-28T22:00:01.000Z",
  );
  await store.persist(terminal, "SUCCESS");
  await store.persist(terminal, "SUCCESS");

  assert.equal(
    (await store.history(
      "MISSION-P1-005",
      "SESSION-P1-005",
    )).length,
    1,
  );
});

test("P1-005 Feature Flag OFF does not inspect or persist a session", async () => {
  const store = new ExecutionSessionPersistence();
  assert.equal(
    await store.persist(
      {} as ExecutionSession,
      "SUCCESS",
    ),
    null,
  );
  assert.deepEqual(await store.replay("", ""), []);
  assert.equal(await store.reconstruct("", ""), null);
});

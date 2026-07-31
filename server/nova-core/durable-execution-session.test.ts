import assert from "node:assert/strict";
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
import test from "node:test";
import {
  DurableExecutionSessionStore,
  type DurableExecutionCheckpoint,
  type DurableExecutionPrepareInput,
} from "./durable-execution-session.js";
import {
  IntegrationRuntimeRepository,
} from "./integration-runtime-repository.js";

const KEY =
  "durable-session-test-attestation-key-with-adequate-entropy";
const directories: string[] = [];

test.after(async () => {
  await Promise.all(
    directories.map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function repository(): Promise<{
  readonly repository: IntegrationRuntimeRepository;
  readonly input: DurableExecutionPrepareInput;
}> {
  const directory = await mkdtemp(
    join(tmpdir(), "nova-durable-session-"),
  );
  directories.push(directory);
  return {
    repository: new IntegrationRuntimeRepository(
      join(directory, "runtime.json"),
      {
        attestationKey: KEY,
        featureFlag: { enabled: true },
      },
    ),
    input: {
      missionId: "MISSION-CRASH-SAFE",
      executionSessionId: "SESSION-CRASH-SAFE",
      promptPackageId: "PACKAGE-CRASH-SAFE",
      runtimeMissionId: "MISSION-CRASH-SAFE",
      operatorIdentity: {
        operatorId: "OPERATOR-001",
        environmentId: "PRODUCTION",
        runtimeId: "RUNTIME-001",
        codexTransportId: "CODEX-001",
        authorization: "EXECUTE",
      },
      workspaceIdentity: {
        workspaceId: "WORKSPACE-001",
        repositoryId: "REPOSITORY-001",
        canonicalRoot: process.cwd(),
        sandboxRoot: process.cwd(),
      },
      gitProvenance: {
        schemaVersion: 1,
        workspaceId: "WORKSPACE-001",
        repositoryId: "REPOSITORY-001",
        workspaceRoot: process.cwd(),
        branch: "feature/test",
        commitSha: "1".repeat(40),
        headSha: "1".repeat(40),
        worktreeFingerprint: "2".repeat(64),
        indexFingerprint: "3".repeat(64),
        trackedContentFingerprint: "4".repeat(64),
        untrackedContentFingerprint: "5".repeat(64),
        submoduleFingerprint: "6".repeat(64),
        exclusionFingerprint: "7".repeat(64),
        repositoryFingerprint: "8".repeat(64),
        provenanceSha256: "9".repeat(64),
        allowedUntrackedPaths: [],
        excludedPaths: [],
        trackedFileCount: 1,
        untrackedFileCount: 0,
        dirty: false,
        gitVersion: "git version 2.50.1",
        certifiedAt: "2026-07-28T12:00:00.000Z",
      },
      requestFingerprint: "a".repeat(64),
      occurredAt: "2026-07-28T12:00:00.000Z",
    },
  };
}

function restarted(
  repository: IntegrationRuntimeRepository,
): DurableExecutionSessionStore {
  return new DurableExecutionSessionStore(
    repository,
    { enabled: true },
  );
}

test("crash recovery reconstructs every production checkpoint after process restart", async () => {
  const setup = await repository();
  let store = restarted(setup.repository);
  await store.prepare(setup.input);

  const expected: readonly DurableExecutionCheckpoint[] = [
    "PREPARED",
    "TRANSPORT_STARTED",
    "RESULT_RECEIVED",
    "RUNTIME_STARTED",
    "RUNTIME_COMPLETED",
    "CERTIFIED",
  ];
  for (const [index, checkpoint] of expected.entries()) {
    store = restarted(setup.repository);
    const reconstructed = await store.reconstruct(
      setup.input.missionId,
      setup.input.executionSessionId,
    );
    assert.equal(reconstructed?.status, checkpoint);
    assert.equal(reconstructed?.revision, index + 1);
    assert.equal(
      reconstructed?.requestFingerprint,
      setup.input.requestFingerprint,
    );
    assert.equal(
      reconstructed?.gitProvenance.provenanceSha256,
      setup.input.gitProvenance.provenanceSha256,
    );
    if (index < expected.length - 1) {
      await store.checkpoint(
        setup.input.executionSessionId,
        expected[index + 1]!,
        new Date(
          Date.parse(setup.input.occurredAt) + index + 1,
        ).toISOString(),
        { crashBoundary: expected[index + 1] },
      );
    }
  }
});

for (const terminal of [
  "FAILED",
  "CANCELLED",
  "TIMEOUT",
  "INTERRUPTED",
] as const) {
  test(`restart reconstructs ${terminal} without an orphaned active checkpoint`, async () => {
    const setup = await repository();
    let store = restarted(setup.repository);
    await store.prepare(setup.input);
    await store.checkpoint(
      setup.input.executionSessionId,
      "TRANSPORT_STARTED",
      "2026-07-28T12:00:00.001Z",
    );
    await store.checkpoint(
      setup.input.executionSessionId,
      terminal,
      "2026-07-28T12:00:00.002Z",
      { failure: terminal },
    );

    store = restarted(setup.repository);
    const reconstructed = await store.reconstruct(
      setup.input.missionId,
      setup.input.executionSessionId,
    );
    assert.equal(reconstructed?.status, terminal);
    assert.equal(
      reconstructed?.recovery.transportMayHaveExecuted,
      true,
    );
    assert.equal(reconstructed?.recovery.certified, false);
  });
}

test("Feature Flag OFF creates no durable record and reads no input", async () => {
  const store = new DurableExecutionSessionStore(
    null,
    { enabled: false },
  );
  assert.equal(
    await store.prepare({} as DurableExecutionPrepareInput),
    null,
  );
  assert.equal(
    await store.reconstruct("INVALID", "INVALID"),
    null,
  );
});

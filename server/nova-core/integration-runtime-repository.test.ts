import assert from "node:assert/strict";
import test from "node:test";
import {
  access,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";

const TEST_ATTESTATION_KEY =
  "local-test-attestation-key-32-characters-minimum";
const temporaryDirectories: string[] = [];

test.after(async () => {
  await Promise.all(
    temporaryDirectories.map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function createRepository(): Promise<{
  readonly directory: string;
  readonly filePath: string;
  readonly repository: IntegrationRuntimeRepository;
}> {
  const directory = await mkdtemp(join(tmpdir(), "nova-lot-f-"));
  temporaryDirectories.push(directory);
  const filePath = join(directory, "runtime.json");
  return {
    directory,
    filePath,
    repository: new IntegrationRuntimeRepository(filePath, {
      attestationKey: TEST_ATTESTATION_KEY,
      featureFlag: { enabled: true },
    }),
  };
}

function record(
  recordId: string,
  overrides: Partial<IntegrationPersistedRecord> = {},
): IntegrationPersistedRecord {
  return {
    schemaVersion: 1,
    recordId,
    kind: "SESSION",
    missionId: "SUPER_WAVE_LOT_F",
    runId: "RUN-F-001",
    source: "PROGRAM_TEST",
    occurredAt: "2026-07-28T21:00:00.000Z",
    payload: { state: "RUNNING" },
    ...overrides,
  };
}

test("LOT F creates and reads an integration record", async () => {
  const { repository } = await createRepository();
  await repository.append(record("RECORD-1"));

  assert.deepEqual(await repository.readAll(), [record("RECORD-1")]);
});

test("LOT F returns the latest record by kind and run", async () => {
  const { repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  await repository.append(
    record("RECORD-2", {
      occurredAt: "2026-07-28T21:00:01.000Z",
      payload: { state: "COMPLETED" },
    }),
  );

  assert.equal(
    (await repository.readLatest(
      "SESSION",
      "SUPER_WAVE_LOT_F",
      "RUN-F-001",
    ))?.recordId,
    "RECORD-2",
  );
});

test("LOT F treats an identical write as idempotent", async () => {
  const { repository } = await createRepository();
  const input = record("RECORD-1");
  await repository.append(input);
  await repository.append(input);

  assert.equal((await repository.readAll()).length, 1);
});

test("LOT F rejects a conflicting record identifier", async () => {
  const { repository } = await createRepository();
  await repository.append(record("RECORD-1"));

  await assert.rejects(
    () =>
      repository.append(
        record("RECORD-1", {
          payload: { state: "FAILED" },
        }),
      ),
    /IPR-003/,
  );
});

test("LOT F uses atomic replacement without residual temp files", async () => {
  const { directory, repository } = await createRepository();
  await repository.append(record("RECORD-1"));

  assert.equal(
    (await readdir(directory)).some((entry) => entry.endsWith(".tmp")),
    false,
  );
});

test("LOT F ignores an interrupted non-authoritative temp write", async () => {
  const { directory, repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  await writeFile(
    join(directory, "runtime.json.interrupted.tmp"),
    "{\"partial\":",
    "utf8",
  );

  assert.equal((await repository.readAll()).length, 1);
});

test("LOT F signals partial authoritative JSON", async () => {
  const { filePath, repository } = await createRepository();
  await writeFile(filePath, "{\"partial\":", "utf8");

  await assert.rejects(() => repository.readAll(), SyntaxError);
});

test("LOT F signals a corrupted journal", async () => {
  const { filePath, repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  const envelope = JSON.parse(await readFile(filePath, "utf8"));
  envelope.journal.events[0].payload.integrationRecord.payload.state =
    "ALTERED";
  await writeFile(
    filePath,
    `${JSON.stringify(envelope, null, 2)}\n`,
    "utf8",
  );

  await assert.rejects(() => repository.readAll());
});

test("LOT F maintains an append-only journal", async () => {
  const { filePath, repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  await repository.append(
    record("RECORD-2", {
      occurredAt: "2026-07-28T21:00:01.000Z",
    }),
  );
  const envelope = JSON.parse(await readFile(filePath, "utf8"));

  assert.equal(envelope.journal.events.length, 2);
  assert.equal(envelope.journal.events[1].previousHash, envelope.journal.events[0].eventHash);
});

test("LOT F refuses duplicate events with altered content", async () => {
  const { repository } = await createRepository();
  await repository.append(record("RECORD-1"));

  await assert.rejects(
    () =>
      repository.append(
        record("RECORD-1", {
          occurredAt: "2026-07-28T21:00:02.000Z",
        }),
      ),
    /IPR-003/,
  );
});

test("LOT F recovers all records from the journal", async () => {
  const { filePath, repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  const reopened = new IntegrationRuntimeRepository(filePath, {
    attestationKey: TEST_ATTESTATION_KEY,
    featureFlag: { enabled: true },
  });
  const recovered = await reopened.recover();

  assert.equal(recovered.recovered, true);
  assert.equal(recovered.journalValid, true);
  assert.equal(recovered.snapshotValid, true);
  assert.equal(recovered.records.length, 1);
});

test("LOT F accepts the known data version", async () => {
  const { filePath, repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  const envelope = JSON.parse(await readFile(filePath, "utf8"));

  assert.equal(envelope.dataSchemaVersion, 3);
});

test("LOT F rejects an unknown data version", async () => {
  const { filePath, repository } = await createRepository();
  await writeFile(
    filePath,
    JSON.stringify({ dataSchemaVersion: 999 }),
    "utf8",
  );

  await assert.rejects(() => repository.readAll(), /IPR-005/);
});

test("LOT F survives a simulated restart without data loss", async () => {
  const { filePath, repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  const restarted = new IntegrationRuntimeRepository(filePath, {
    attestationKey: TEST_ATTESTATION_KEY,
    featureFlag: { enabled: true },
  });

  assert.deepEqual(await restarted.readAll(), [record("RECORD-1")]);
});

test("LOT F preserves valid data across a simulated crash artifact", async () => {
  const { filePath, repository } = await createRepository();
  await repository.append(record("RECORD-1"));
  await writeFile(`${filePath}.crash.tmp`, "{\"incomplete\":", "utf8");
  const restarted = new IntegrationRuntimeRepository(filePath, {
    attestationKey: TEST_ATTESTATION_KEY,
    featureFlag: { enabled: true },
  });

  assert.equal((await restarted.readAll()).length, 1);
});

test("LOT F serializes two concurrent writes without data loss", async () => {
  const { repository } = await createRepository();
  await Promise.all([
    repository.append(record("RECORD-1")),
    repository.append(
      record("RECORD-2", {
        occurredAt: "2026-07-28T21:00:01.000Z",
      }),
    ),
  ]);

  assert.equal((await repository.readAll()).length, 2);
});

test("LOT F persists future evidence, decisions, logs and sessions", async () => {
  const { repository } = await createRepository();
  const kinds = [
    "SESSION",
    "EVIDENCE",
    "CERTIFICATION",
    "HUMAN_APPROVAL",
    "LOG",
  ] as const;
  for (const [index, kind] of kinds.entries()) {
    await repository.append(
      record(`RECORD-${index + 1}`, {
        kind,
        occurredAt: `2026-07-28T21:00:0${index}.000Z`,
      }),
    );
  }

  assert.deepEqual(
    (await repository.readAll()).map((entry) => entry.kind),
    kinds,
  );
});

test("LOT F validates external records before persistence", async () => {
  const { repository } = await createRepository();
  await assert.rejects(
    () =>
      repository.append({
        ...record("RECORD-1"),
        occurredAt: "not-a-date",
      }),
    /IPR-001/,
  );
});

test("LOT F remains inactive while its Feature Flag is OFF", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-lot-f-off-"));
  temporaryDirectories.push(directory);
  const filePath = join(directory, "runtime.json");
  const repository = new IntegrationRuntimeRepository(filePath, {
    attestationKey: TEST_ATTESTATION_KEY,
  });

  assert.equal(await repository.append(record("RECORD-1")), null);
  assert.deepEqual(await repository.readAll(), []);
  await assert.rejects(() => access(filePath));
});

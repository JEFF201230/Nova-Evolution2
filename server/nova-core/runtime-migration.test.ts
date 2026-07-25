import assert from "node:assert/strict";
import { access, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { RuntimeEvent, RuntimeSnapshot } from "../runtime/orchestrator/orchestrator-runtime.js";
import { NovaCoreService } from "./nova-core.service.js";
import { JsonRuntimeSnapshotStore } from "./nova-core.store.js";
import { migrateRuntimeData, verifyRuntimeEnvelope, type RuntimeDataEnvelope } from "./runtime-migration.js";
import { canonicalJson, sha256 } from "./run-binding.js";
import { sealRuntimeEventJournal } from "../runtime/journal/append-only-journal.js";

const TEST_ATTESTATION_KEY = "nova-migration-journal-attestation-key-003";

test("runtime automatically migrates a v0 snapshot and legacy journal without data loss", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-migration-v0-"));
  const file = join(directory, "runtime.json");
  const legacy = {
    version: 0,
    missions: [{ ...sampleSnapshot().missions[0], state: "DRAFT" }],
    events: [],
    audits: [{ auditId: "LEGACY-AUDIT", projectId: "P", missionId: "M" }],
    locks: [],
    contexts: [],
    reports: [],
    queues: [],
    agents: [],
    eventLog: [
      { type: "MissionCreated", project: "P", mission: "M", state: "DRAFT", timestamp: "2026-01-01T00:00:00.000Z" },
      { type: "MissionAccepted", project: "P", mission: "M", sourceState: "DRAFT", state: "READY", timestamp: "2026-01-01T00:00:01.000Z" },
    ],
    legacyTenantMetadata: { retained: true },
  };
  await writeFile(file, JSON.stringify(legacy), "utf8");

  const core = await NovaCoreService.open(file, undefined, { journalAttestationKey: TEST_ATTESTATION_KEY });
  assert.equal(core.getMission("P", "M")?.state, "READY");
  const envelope = JSON.parse(await readFile(file, "utf8")) as RuntimeDataEnvelope;
  assert.equal(envelope.dataSchemaVersion, 3);
  assert.equal(envelope.projection.audits[0]?.auditId, "LEGACY-AUDIT");
  assert.deepEqual(envelope.extensions?.legacyTenantMetadata, { retained: true });
  assert.deepEqual(verifyRuntimeEnvelope(envelope), { journalValid: true, projectionValid: true });
  assert.equal((await readdir(directory)).some((name) => name.includes(".rollback-v0-to-v3-")), true);
});

test("v1 snapshots and legacy journal containers migrate idempotently", () => {
  const snapshot = sampleSnapshot();
  const legacyV1 = { ...snapshot, journal: { events: snapshot.events }, legacyField: "preserved" };
  const first = migrateRuntimeData(legacyV1, "2026-07-25T00:00:00.000Z");
  assert.equal(first.sourceVersion, 1);
  assert.equal(first.snapshot.missions[0]?.state, "READY");
  assert.equal(first.envelope.extensions?.legacyField, "preserved");
  const second = migrateRuntimeData(first.envelope, "2026-07-25T00:01:00.000Z");
  assert.equal(second.changed, false);
  assert.deepEqual(second.snapshot, first.snapshot);
  const legacyV2 = {
    ...structuredClone(first.envelope),
    dataSchemaVersion: 2,
    extensions: { v2Metadata: "preserved" },
  };
  const fromV2 = migrateRuntimeData(legacyV2, "2026-07-25T00:02:00.000Z");
  assert.equal(fromV2.sourceVersion, 2);
  assert.equal(fromV2.changed, true);
  assert.equal(fromV2.envelope.extensions?.v2Metadata, "preserved");
  assert.equal(migrateRuntimeData(fromV2.envelope).changed, false);
});

test("a corrupted projection is rebuilt from an intact journal with rollback backup", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-migration-rebuild-"));
  const file = join(directory, "runtime.json");
  const store = new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY });
  await store.save(sampleSnapshot());
  const envelope = JSON.parse(await readFile(file, "utf8")) as RuntimeDataEnvelope;
  envelope.projection.missions[0]!.state = "FAILED";
  await writeFile(file, JSON.stringify(envelope), "utf8");

  const reopened = new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY });
  const rebuilt = await reopened.load();
  assert.equal(rebuilt?.missions[0]?.state, "READY");
  assert.ok(reopened.lastMigration?.actions.includes("mission-projection-rebuilt-from-journal"));
  assert.ok(reopened.lastMigration?.backupPath);
  await access(reopened.lastMigration!.backupPath);
});

test("journal corruption is rejected without rewriting the source file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-migration-corrupt-"));
  const file = join(directory, "runtime.json");
  const store = new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY });
  await store.save(sampleSnapshot());
  const envelope = JSON.parse(await readFile(file, "utf8")) as RuntimeDataEnvelope;
  envelope.journal.events[0]!.payload = { tampered: true };
  const corrupted = JSON.stringify(envelope);
  await writeFile(file, corrupted, "utf8");

  await assert.rejects(() => new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY }).load(), /JOURNAL_CORRUPTED/);
  assert.equal(await readFile(file, "utf8"), corrupted);
  assert.equal((await readdir(directory)).some((name) => name.endsWith(".bak")), false);
});

test("sequence gaps, duplicates and interrupted migrations are controlled with rollback", async () => {
  const snapshot = sampleSnapshot();
  const gap = structuredClone(snapshot);
  gap.events[1]!.sequence = 3;
  assert.throws(() => migrateRuntimeData(gap), /JOURNAL_SEQUENCE_INVALID:SEQUENCE_GAP/);
  const duplicate = structuredClone(snapshot);
  duplicate.events[1]!.sequence = 1;
  assert.throws(() => migrateRuntimeData(duplicate), /JOURNAL_SEQUENCE_INVALID:SEQUENCE_GAP/);

  const directory = await mkdtemp(join(tmpdir(), "nova-migration-interrupted-"));
  const file = join(directory, "runtime.json");
  const legacy = { ...snapshot, version: 0 };
  await writeFile(file, JSON.stringify(legacy), "utf8");
  await writeFile(`${file}.interrupted.tmp`, "{\"partial\":", "utf8");
  const store = new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY });
  const migrated = await store.load();
  assert.equal(migrated?.missions[0]?.state, "READY");
  await store.rollbackLastMigration();
  const restored = JSON.parse(await readFile(file, "utf8")) as { version: number };
  assert.equal(restored.version, 0);
});

test("external anchor rejects a re-signed truncation and projection cannot contradict replay", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-journal-anchor-"));
  const file = join(directory, "runtime.json");
  const store = new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY });
  await store.save(sampleSnapshot());
  const original = JSON.parse(await readFile(file, "utf8")) as RuntimeDataEnvelope;

  const contradictory = structuredClone(original);
  contradictory.projection.missions[0]!.state = "CERTIFIED";
  contradictory.projectionChecksum = sha256(canonicalJson(contradictory.projection));
  await writeFile(file, JSON.stringify(contradictory), "utf8");
  await assert.rejects(
    () => new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY }).load(),
    /PROJECTION_JOURNAL_MISMATCH/,
  );

  const truncated = structuredClone(original);
  truncated.journal.events.pop();
  truncated.journal.events = sealRuntimeEventJournal(truncated.journal.events);
  truncated.projection.events = structuredClone(truncated.journal.events);
  truncated.projection.missions[0]!.state = "DRAFT";
  truncated.projection.missions[0]!.updatedAt = truncated.journal.events.at(-1)!.publishedAt;
  truncated.journal.checksum = sha256(canonicalJson(truncated.journal.events));
  truncated.projectionChecksum = sha256(canonicalJson(truncated.projection));
  await writeFile(file, JSON.stringify(truncated), "utf8");
  await assert.rejects(
    () => new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY }).load(),
    /JOURNAL_ANCHOR_INVALID/,
  );
});

test("external anchor rejects a fully recalculated event chain", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-journal-resigned-"));
  const file = join(directory, "runtime.json");
  const store = new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY });
  await store.save(sampleSnapshot());
  const altered = JSON.parse(await readFile(file, "utf8")) as RuntimeDataEnvelope;
  altered.journal.events[0]!.payload = { forged: true };
  altered.journal.events = sealRuntimeEventJournal(altered.journal.events);
  altered.projection.events = structuredClone(altered.journal.events);
  altered.journal.checksum = sha256(canonicalJson(altered.journal.events));
  altered.projectionChecksum = sha256(canonicalJson(altered.projection));
  await writeFile(file, JSON.stringify(altered), "utf8");
  await assert.rejects(
    () => new JsonRuntimeSnapshotStore(file, { attestationKey: TEST_ATTESTATION_KEY }).load(),
    /JOURNAL_ANCHOR_INVALID/,
  );
});

function sampleSnapshot(): RuntimeSnapshot {
  const events: RuntimeEvent[] = [
    {
      eventId: "E-1",
      eventName: "MissionCreated",
      projectId: "P",
      missionId: "M",
      correlationId: "C-1",
      sequence: 1,
      sourceState: null,
      targetState: "DRAFT",
      producer: "test",
      occurredAt: "2026-01-01T00:00:00.000Z",
      publishedAt: "2026-01-01T00:00:00.000Z",
      payload: {},
      metadata: {},
    },
    {
      eventId: "E-2",
      eventName: "MissionAccepted",
      projectId: "P",
      missionId: "M",
      correlationId: "C-1",
      sequence: 2,
      sourceState: "DRAFT",
      targetState: "READY",
      producer: "test",
      occurredAt: "2026-01-01T00:00:01.000Z",
      publishedAt: "2026-01-01T00:00:01.000Z",
      payload: {},
      metadata: {},
    },
  ];
  return {
    version: 1,
    missions: [{
      projectId: "P",
      missionId: "M",
      missionType: "RUNTIME",
      objective: "Open legacy data.",
      authority: "HUMAN",
      scope: { allowed: ["server/nova-core"], forbidden: [] },
      deliverables: ["migration"],
      stopCriteria: ["data retained"],
      authorizedReferences: [],
      priority: 1,
      state: "READY",
      assignedAgentId: null,
      lockId: null,
      runId: null,
      contextId: null,
      reportId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:01.000Z",
    }],
    events,
    audits: [],
    locks: [],
    contexts: [],
    reports: [],
    queues: [{ projectId: "P", items: [] }],
    agents: [],
    observabilityEvents: [],
    runs: [],
  };
}

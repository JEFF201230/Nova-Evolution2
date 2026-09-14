import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  BusinessInstant,
  BusinessPeriod,
  CausalityId,
  Milestone,
  MilestoneId,
  Phase,
  PhaseId,
  PlanningAuthority,
  PlanningIdempotencyConflictError,
  PlanningPersistenceConflictError,
  PlanningPersistenceSchema,
  PlanningProvenance,
  PlanningRevision,
  PlanningSQLiteRepository,
  PlanningVersion,
  Schedule,
  WorkReference,
  backupPlanningDatabase,
  canonicalPlanningJson,
  createPlanningRequestFingerprint,
  rebuildPlanningDatabaseFromHistory,
  restorePlanningDatabase,
  serializePlanningRevision,
  verifyPlanningSQLiteIntegrity,
  type PlanningAuthorityResult,
  type PlanningCommandEnvelope,
  type PlanningMigrationStage,
} from "./index.js";

const WORK = WorkReference.of("planning-project", "planning-work");
const authority = PlanningAuthority.create("PLANNING_TEST_AUTHORITY", {
  workExists: () => true,
  objectiveAvailable: () => true,
});

function at(day: number): Date {
  return new Date(`2026-11-${String(day).padStart(2, "0")}T10:00:00.000Z`);
}

function provenance(cause: string, day: number): PlanningProvenance {
  return PlanningProvenance.of(
    "PLANNING_TEST_AUTHORITY", "SIGNED_PLANNING_DECISION", cause, at(day),
  );
}

function instant(day: number, meaning: string, source: PlanningProvenance): BusinessInstant {
  return BusinessInstant.of(at(day), meaning, source, "BUSINESS_DECISION");
}

function period(start: number, end: number, meaning: string, source: PlanningProvenance): BusinessPeriod {
  return BusinessPeriod.of({
    start: instant(start, `${meaning} start`, source),
    end: instant(end, `${meaning} end`, source),
    startBoundary: "INCLUSIVE", endBoundary: "EXCLUSIVE", meaning, provenance: source,
  });
}

function proposal(version: number, cause: string, changed = false): PlanningRevision {
  const source = provenance(cause, version);
  const phase = Phase.of(PhaseId.of("delivery"), changed ? "Deliver revised scope." : "Deliver scope.");
  const milestone = Milestone.of(MilestoneId.of("accepted"), "Accepted outcome.");
  return PlanningRevision.of({
    version: PlanningVersion.of(version),
    applicability: period(version, version + 10, `version ${version}`, source),
    phases: [phase],
    milestones: [milestone],
    dependencies: [],
    schedule: Schedule.of([
      { element: phase.reference, time: instant(version + 1, "delivery target", source) },
      { element: milestone.reference, time: instant(version + 2, "acceptance target", source) },
    ]),
    priorities: [], constraints: [], provenance: source,
  });
}

function establish(cause = "establish-1"): PlanningAuthorityResult {
  const accepted = proposal(1, cause);
  return authority.establishPlanning(null, {
    kind: "ESTABLISH_PLANNING", workReference: WORK,
    causality: CausalityId.of(cause), provenance: accepted.provenance,
    expectedVersion: null, proposal: accepted,
  });
}

function revise(current: PlanningAuthorityResult["aggregate"], cause: string): PlanningAuthorityResult {
  const accepted = proposal(2, cause, true);
  return authority.revisePlanning(current, {
    kind: "REVISE_PLANNING", workReference: WORK,
    causality: CausalityId.of(cause), provenance: accepted.provenance,
    expectedVersion: PlanningVersion.of(1), proposal: accepted,
    reason: `Accepted revision ${cause}.`,
  });
}

function withdraw(current: PlanningAuthorityResult["aggregate"]): PlanningAuthorityResult {
  const source = provenance("withdraw-3", 3);
  return authority.withdrawPlanning(current, {
    kind: "WITHDRAW_PLANNING", workReference: WORK,
    causality: CausalityId.of("withdraw-3"), provenance: source,
    expectedVersion: PlanningVersion.of(2), reason: "Planning explicitly withdrawn.",
  });
}

function envelope(
  commandType: PlanningCommandEnvelope["commandType"],
  source: PlanningProvenance,
  body: unknown = { commandType, cause: source.businessCause },
): PlanningCommandEnvelope {
  return {
    commandType,
    causationId: source.businessCause,
    correlationId: "planning-test-correlation",
    requestFingerprint: createPlanningRequestFingerprint(body),
    fingerprintVersion: 1,
    provenance: source,
  };
}

test("persists one canonical current head, immutable versions, events and receipt atomically", () => {
  const database = new DatabaseSync(":memory:");
  const committedAt = new Date("2026-11-20T12:00:00.000Z");
  const store = new PlanningSQLiteRepository(database, { now: () => committedAt });
  const first = establish();
  const committed = store.commit(0, first, envelope("ESTABLISH_PLANNING", first.events[0]!.provenance));
  const second = revise(committed.aggregate, "revise-2");
  const revised = store.commit(1, second, envelope("REVISE_PLANNING", second.events[0]!.provenance));

  assert.equal(revised.revision, 2);
  assert.equal(revised.aggregate.currentVersion?.version.value, 2);
  assert.deepEqual(store.readVersions(WORK).map((item) => item.version.value), [1, 2]);
  assert.equal(store.load(WORK)?.lastEventSequence, first.events.length + second.events.length);
  assert.deepEqual(
    store.readHistory(WORK).events.map((event) => event.aggregateRevision),
    [...first.events.map(() => 1), ...second.events.map(() => 2)],
  );
  assert.equal((database.prepare("SELECT COUNT(*) count FROM planning_root").get() as { count: number }).count, 1);
  assert.equal((database.prepare("SELECT COUNT(*) count FROM planning_version").get() as { count: number }).count, 2);
  assert.equal((database.prepare("SELECT COUNT(*) count FROM planning_command_receipt").get() as { count: number }).count, 2);
  assert.throws(() => database.prepare("DELETE FROM planning_version").run(), /APPEND_ONLY/);
  const columns = (database.prepare("PRAGMA table_info(planning_root)").all() as Array<{ name: string }>).map((row) => row.name);
  assert.equal(columns.some((name) => /objective|progress|timeline|runtime|people|action/iu.test(name)), false);
  database.close();
});

test("replays the same receipt, rejects changed intent, and fails closed on stale CAS", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PlanningSQLiteRepository(database);
  const first = establish();
  const firstEnvelope = envelope("ESTABLISH_PLANNING", first.events[0]!.provenance);
  const applied = store.commit(0, first, firstEnvelope);
  const replayed = store.commit(999, first, firstEnvelope);
  assert.equal(replayed.status, "REPLAYED");
  assert.equal(replayed.revision, applied.revision);
  assert.deepEqual(replayed.eventIds, applied.eventIds);
  assert.throws(
    () => store.commit(1, first, { ...firstEnvelope, requestFingerprint: "f".repeat(64) }),
    PlanningIdempotencyConflictError,
  );

  const winner = revise(applied.aggregate, "winner-2");
  const loser = revise(applied.aggregate, "loser-2");
  store.commit(1, winner, envelope("REVISE_PLANNING", winner.events[0]!.provenance));
  assert.throws(
    () => store.commit(1, loser, envelope("REVISE_PLANNING", loser.events[0]!.provenance)),
    PlanningPersistenceConflictError,
  );
  assert.equal(store.load(WORK)?.aggregate.versions[1]?.provenance.businessCause, "winner-2");
  database.close();
});

test("rolls back current state, version, events and receipt together after interruption", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PlanningSQLiteRepository(database, {
    beforeReceipt: () => { throw new Error("INTERRUPTED_BEFORE_RECEIPT"); },
  });
  const first = establish("interrupted-establish");
  assert.throws(
    () => store.commit(0, first, envelope("ESTABLISH_PLANNING", first.events[0]!.provenance)),
    /INTERRUPTED_BEFORE_RECEIPT/,
  );
  for (const table of ["planning_root", "planning_version", "planning_event", "planning_command_receipt"]) {
    assert.equal((database.prepare(`SELECT COUNT(*) count FROM ${table}`).get() as { count: number }).count, 0);
  }
  database.close();
});

test("withdrawal is a durable fact, not deletion, and restart rehydrates provenance and causality", () => {
  const directory = mkdtempSync(join(tmpdir(), "planning-persistence-restart-"));
  const path = join(directory, "planning.sqlite");
  try {
    const database = new DatabaseSync(path);
    const store = new PlanningSQLiteRepository(database);
    const first = establish();
    const one = store.commit(0, first, envelope("ESTABLISH_PLANNING", first.events[0]!.provenance));
    const second = revise(one.aggregate, "revise-2");
    const two = store.commit(1, second, envelope("REVISE_PLANNING", second.events[0]!.provenance));
    const removed = withdraw(two.aggregate);
    store.commit(2, removed, envelope("WITHDRAW_PLANNING", removed.events[0]!.provenance));
    database.close();

    const restarted = new DatabaseSync(path);
    const loaded = new PlanningSQLiteRepository(restarted).load(WORK)!;
    assert.equal(loaded.revision, 3);
    assert.equal(loaded.aggregate.currentVersion, null);
    assert.deepEqual(loaded.aggregate.versions.map((item) => item.version.value), [1, 2]);
    assert.deepEqual(loaded.aggregate.withdrawalCausalities.map((item) => item.value), ["withdraw-3"]);
    assert.equal(loaded.aggregate.versions[1]?.provenance.source, "SIGNED_PLANNING_DECISION");
    assert.equal((restarted.prepare("SELECT COUNT(*) count FROM planning_version").get() as { count: number }).count, 2);
    restarted.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("migration is checksummed, deterministic, idempotent and fail-closed after every interruption", () => {
  const stages: readonly PlanningMigrationStage[] = [
    "before-sql", "after-sql", "after-verification", "after-record",
  ];
  for (const stage of stages) {
    const database = new DatabaseSync(":memory:");
    const schema = new PlanningPersistenceSchema(database, {
      faultInjector: (current) => { if (current === stage) throw new Error(`INTERRUPTED:${stage}`); },
    });
    assert.throws(() => schema.migrate(), new RegExp(`INTERRUPTED:${stage}`));
    assert.equal(schema.version(), 0);
    assert.equal((database.prepare(
      "SELECT COUNT(*) count FROM sqlite_master WHERE name LIKE 'planning_%'",
    ).get() as { count: number }).count, 0);
    assert.equal(new PlanningPersistenceSchema(database).migrate(), 1);
    assert.equal(new PlanningPersistenceSchema(database).migrate(), 1);
    assert.deepEqual(verifyPlanningSQLiteIntegrity(database), {
      schemaVersion: 1, quickCheck: "ok", foreignKeyViolations: 0,
    });
    database.close();
  }

  const ambiguous = new DatabaseSync(":memory:");
  ambiguous.exec("CREATE TABLE planning_legacy(value TEXT) STRICT;");
  assert.throws(() => new PlanningPersistenceSchema(ambiguous).migrate(), /Untracked Planning/);
  ambiguous.close();
});

test("backup, restore and history rebuild recover truth without using a corrupted mutable head", async () => {
  const directory = mkdtempSync(join(tmpdir(), "planning-recovery-"));
  const sourcePath = join(directory, "source.sqlite");
  const backupPath = join(directory, "backup.sqlite");
  const restoredPath = join(directory, "restored.sqlite");
  const rebuiltPath = join(directory, "rebuilt.sqlite");
  try {
    const source = new DatabaseSync(sourcePath);
    const store = new PlanningSQLiteRepository(source);
    const first = establish();
    const one = store.commit(0, first, envelope("ESTABLISH_PLANNING", first.events[0]!.provenance));
    const second = revise(one.aggregate, "recovery-revise");
    store.commit(1, second, envelope("REVISE_PLANNING", second.events[0]!.provenance));
    const expected = canonicalPlanningJson(serializePlanningRevision(store.load(WORK)!.aggregate.currentVersion!));

    assert.ok(await backupPlanningDatabase(source, backupPath) > 0);
    assert.ok(await restorePlanningDatabase(backupPath, restoredPath) > 0);
    const restored = new DatabaseSync(restoredPath);
    assert.equal(
      canonicalPlanningJson(serializePlanningRevision(new PlanningSQLiteRepository(restored).load(WORK)!.aggregate.currentVersion!)),
      expected,
    );
    restored.close();

    source.prepare(
      "UPDATE planning_root SET revision = revision + 1, updated_at_epoch_ms = updated_at_epoch_ms + 1",
    ).run();
    assert.throws(() => new PlanningSQLiteRepository(source), /PLANNING_HISTORY_CORRUPTED/);
    rebuildPlanningDatabaseFromHistory(source, rebuiltPath);
    const rebuilt = new DatabaseSync(rebuiltPath);
    const recovered = new PlanningSQLiteRepository(rebuilt).load(WORK)!;
    assert.equal(recovered.revision, 2);
    assert.equal(canonicalPlanningJson(serializePlanningRevision(recovered.aggregate.currentVersion!)), expected);
    assert.equal((rebuilt.prepare("SELECT COUNT(*) count FROM planning_command_receipt").get() as { count: number }).count, 2);
    rebuilt.close();
    source.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});


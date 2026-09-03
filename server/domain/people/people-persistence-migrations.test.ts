import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleAggregatePersistenceStore, createPeopleRequestFingerprint } from "./people-persistence-aggregate-store.js";
import { canonicalJson, serializeWorkPeople } from "./people-persistence-history.js";
import {
  PeopleSchemaMigrationError,
  verifyPeopleSQLiteIntegrity,
  type PeopleMigrationStage,
} from "./people-persistence-migrations.js";
import {
  backupPeopleDatabase,
  rebuildPeopleDatabaseFromHistory,
  restorePeopleDatabase,
} from "./people-persistence-recovery.js";
import {
  PEOPLE_PERSISTENCE_MIGRATIONS,
  PEOPLE_PERSISTENCE_SCHEMA_VERSION,
  PeoplePersistenceSchema,
} from "./people-persistence-schema.js";
import type { CommandEnvelope } from "./people-persistence-ports.js";
import {
  AssignmentPeriod,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";

const authority = PeopleAuthority.establish("M02-TEST");
const sourceAt = (cause: string, day: number) => PeopleProvenance.of(
  "M02-TEST",
  cause,
  new Date(Date.UTC(2026, 7, day)),
);
const envelope = (kind: string, source: PeopleProvenance): CommandEnvelope => ({
  commandType: kind,
  causationId: source.businessCause,
  correlationId: "m02-correlation",
  requestFingerprint: createPeopleRequestFingerprint({ kind, cause: source.businessCause }),
  fingerprintVersion: 1,
  provenance: source,
  occurredAt: source.effectiveAt,
});

test("initial migration is versioned, checksummed, idempotent and passes SQLite checks", () => {
  const database = new DatabaseSync(":memory:");
  const appliedAt = new Date("2026-08-07T10:00:00.000Z");
  const schema = new PeoplePersistenceSchema(database, { now: () => appliedAt, applicationVersion: "m02-test" });
  assert.equal(schema.version(), 0);
  assert.equal(schema.migrate(), PEOPLE_PERSISTENCE_SCHEMA_VERSION);
  const first = database.prepare(
    "SELECT version, name, checksum_sha256, applied_at_epoch_ms, application_version FROM people_schema_migration",
  ).get() as Record<string, unknown>;
  assert.equal(first.version, 1);
  assert.equal(first.name, PEOPLE_PERSISTENCE_MIGRATIONS[0]!.name);
  assert.equal(first.checksum_sha256, PEOPLE_PERSISTENCE_MIGRATIONS[0]!.checksumSha256);
  assert.match(String(first.checksum_sha256), /^[0-9a-f]{64}$/);
  assert.equal(first.applied_at_epoch_ms, appliedAt.getTime());
  assert.equal(first.application_version, "m02-test");
  assert.equal(schema.migrate(), 1);
  assert.deepEqual(
    database.prepare("SELECT * FROM people_schema_migration").get(),
    first,
  );
  assert.deepEqual(verifyPeopleSQLiteIntegrity(database, PEOPLE_PERSISTENCE_MIGRATIONS), {
    schemaVersion: 1,
    quickCheck: "ok",
    integrityCheck: "ok",
    foreignKeyViolations: 0,
  });
  assert.throws(() => database.prepare("UPDATE people_schema_migration SET name = 'changed'").run());
  assert.throws(() => database.prepare("DELETE FROM people_schema_migration").run());
  database.close();
});

test("divergent checksum and unknown version are rejected without applying anything", () => {
  for (const corruption of ["checksum", "unknown-version"] as const) {
    const database = new DatabaseSync(":memory:");
    const schema = new PeoplePersistenceSchema(database);
    schema.migrate();
    if (corruption === "checksum") {
      database.exec("DROP TRIGGER people_schema_migration_no_update;");
      database.prepare("UPDATE people_schema_migration SET checksum_sha256 = ? WHERE version = 1").run("0".repeat(64));
    } else {
      database.prepare(
        `INSERT INTO people_schema_migration(
           version, name, checksum_sha256, applied_at_epoch_ms, application_version
         ) VALUES (2, 'future', ?, 0, 'future')`,
      ).run("f".repeat(64));
    }
    assert.throws(() => schema.migrate(), PeopleSchemaMigrationError);
    assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_schema_migration").get() as { count: number }).count, corruption === "checksum" ? 1 : 2);
    database.close();
  }
});

test("an interruption at every migration stage rolls back DDL and ledger atomically", () => {
  const stages: readonly PeopleMigrationStage[] = ["before-sql", "after-sql", "after-verification", "after-record"];
  for (const interruptedStage of stages) {
    const database = new DatabaseSync(":memory:");
    const interrupted = new PeoplePersistenceSchema(database, {
      faultInjector: (stage) => {
        if (stage === interruptedStage) throw new Error(`INTERRUPTED:${stage}`);
      },
    });
    assert.throws(() => interrupted.migrate(), new RegExp(`INTERRUPTED:${interruptedStage}`));
    assert.equal(interrupted.version(), 0);
    assert.equal((database.prepare(
      "SELECT COUNT(*) AS count FROM sqlite_master WHERE name LIKE 'people_%'",
    ).get() as { count: number }).count, 0);
    assert.equal(new PeoplePersistenceSchema(database).migrate(), 1);
    database.close();
  }
});

test("foreign_key_check fails closed on an orphaned durable row", () => {
  const database = new DatabaseSync(":memory:");
  new PeoplePersistenceSchema(database).migrate();
  database.exec("PRAGMA foreign_keys = OFF;");
  database.prepare(
    `INSERT INTO people_work_assignment(
       work_assignment_id, project_identity, work_identity, business_person_id, status,
       effective_from_epoch_ms, effective_to_epoch_ms, provenance_trail_json
     ) VALUES ('orphan', 'project', 'work', 'missing-person', 'ENDED', 1, 2, '[{"authority":"M02","businessCause":"orphan","effectiveAtEpochMs":1}]')`,
  ).run();
  assert.throws(
    () => verifyPeopleSQLiteIntegrity(database, PEOPLE_PERSISTENCE_MIGRATIONS),
    /foreign_key_check/,
  );
  database.close();
});

test("restart rejects corrupted head, event history and receipt", () => {
  const directory = mkdtempSync(join(tmpdir(), "people-m02-corruption-"));
  try {
    for (const corruption of ["head", "event", "receipt"] as const) {
      const path = join(directory, `${corruption}.sqlite`);
      const database = new DatabaseSync(path);
      seedPeople(database, corruption);
      if (corruption === "head") {
        database.prepare(
          "UPDATE people_work_people SET revision = revision + 1, updated_at_epoch_ms = updated_at_epoch_ms + 1",
        ).run();
      } else if (corruption === "event") {
        tamperProtectedRow(
          database,
          "people_event_no_update",
          "UPDATE people_event SET event_type = 'ALTERED' WHERE aggregate_type = 'WORK_PEOPLE' AND stream_sequence = 1",
        );
      } else {
        tamperProtectedRow(
          database,
          "people_receipt_no_update",
          "UPDATE people_command_receipt SET event_count = event_count + 1 WHERE target_type = 'WORK_PEOPLE'",
        );
      }
      database.close();
      const restarted = new DatabaseSync(path);
      try {
        assert.throws(() => new PeopleAggregatePersistenceStore(restarted), /HISTORY_CORRUPTED/);
      } finally {
        restarted.close();
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("backup, restore and history rebuild preserve identity, state, receipts and history", async () => {
  const directory = mkdtempSync(join(tmpdir(), "people-m02-recovery-"));
  const sourcePath = join(directory, "source.sqlite");
  const backupPath = join(directory, "backup.sqlite");
  const restoredPath = join(directory, "restored.sqlite");
  const rebuiltPath = join(directory, "rebuilt.sqlite");
  try {
    const source = new DatabaseSync(sourcePath);
    const seeded = seedPeople(source, "recovery");
    const expectedState = canonicalJson(serializeWorkPeople(seeded.store.workPeople.load(seeded.reference)!.aggregate));
    const expected = durableIdentity(source);

    assert.ok(await backupPeopleDatabase(source, backupPath) > 0);
    assert.ok(await restorePeopleDatabase(backupPath, restoredPath) > 0);
    assertEquivalentDatabase(restoredPath, expectedState, expected, seeded.reference);

    source.prepare(
      "UPDATE people_work_people SET revision = revision + 1, updated_at_epoch_ms = updated_at_epoch_ms + 1",
    ).run();
    assert.throws(() => new PeopleAggregatePersistenceStore(source), /HISTORY_CORRUPTED/);
    rebuildPeopleDatabaseFromHistory(source, rebuiltPath);
    assertEquivalentDatabase(rebuiltPath, expectedState, expected, seeded.reference);
    source.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function tamperProtectedRow(database: DatabaseSync, triggerName: string, updateSql: string): void {
  const row = database.prepare(
    "SELECT sql FROM sqlite_master WHERE type = 'trigger' AND name = ?",
  ).get(triggerName) as { sql: string } | undefined;
  assert.ok(row?.sql);
  database.exec(`DROP TRIGGER ${triggerName};`);
  database.exec(updateSql);
  database.exec(row.sql);
}

function seedPeople(database: DatabaseSync, suffix: string): {
  store: PeopleAggregatePersistenceStore;
  reference: WorkReference;
} {
  const store = new PeopleAggregatePersistenceStore(database, { now: () => new Date("2026-08-07T12:00:00.000Z") });
  const personAt = sourceAt(`recognize-${suffix}`, 1);
  const personChange = authority.createBusinessPerson(null, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of(`person-${suffix}`),
    provenance: personAt,
  });
  const person = store.businessPersons.commit(0, personChange, envelope("CREATE_BUSINESS_PERSON", personAt)).aggregate;
  const reference = WorkReference.of(`project-${suffix}`, `work-${suffix}`);
  const assignmentAt = sourceAt(`assign-${suffix}`, 2);
  const assignment = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference: reference,
    assignmentId: WorkAssignmentId.of(`assignment-${suffix}`),
    roles: [BusinessRole.of("OWNER"), BusinessRole.of("REVIEWER")],
    period: AssignmentPeriod.startingAt(assignmentAt.effectiveAt),
    provenance: assignmentAt,
  });
  const committed = store.workPeople.commit(0, assignment, envelope("ASSIGN_PERSON_TO_WORK", assignmentAt));
  const suspendedAt = sourceAt(`suspend-${suffix}`, 3);
  const suspended = authority.suspendWorkAssignment(committed.aggregate, {
    kind: "SUSPEND_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of(`assignment-${suffix}`),
    provenance: suspendedAt,
  });
  store.workPeople.commit(1, suspended, envelope("SUSPEND_WORK_ASSIGNMENT", suspendedAt));
  return { store, reference };
}

function durableIdentity(database: DatabaseSync): {
  people: string[];
  events: string[];
  receipts: string[];
} {
  return {
    people: (database.prepare("SELECT business_person_id FROM people_business_person ORDER BY business_person_id").all() as Array<{ business_person_id: string }>).map((row) => row.business_person_id),
    events: (database.prepare("SELECT event_id FROM people_event ORDER BY event_id").all() as Array<{ event_id: string }>).map((row) => row.event_id),
    receipts: (database.prepare("SELECT causation_id FROM people_command_receipt ORDER BY causation_id").all() as Array<{ causation_id: string }>).map((row) => row.causation_id),
  };
}

function assertEquivalentDatabase(
  path: string,
  expectedState: string,
  expectedIdentity: ReturnType<typeof durableIdentity>,
  reference: WorkReference,
): void {
  const database = new DatabaseSync(path);
  try {
    const store = new PeopleAggregatePersistenceStore(database);
    assert.equal(canonicalJson(serializeWorkPeople(store.workPeople.load(reference)!.aggregate)), expectedState);
    assert.deepEqual(durableIdentity(database), expectedIdentity);
    assert.equal(store.workPeople.rehydrate(reference)!.revision, store.workPeople.load(reference)!.revision);
  } finally {
    database.close();
  }
}

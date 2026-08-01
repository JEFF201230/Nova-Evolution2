import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  PEOPLE_PERSISTENCE_SCHEMA_VERSION,
  PeoplePersistenceSchema,
} from "./people-persistence-schema.js";

function schema(): { database: DatabaseSync; persistence: PeoplePersistenceSchema } {
  const database = new DatabaseSync(":memory:");
  return {
    database,
    persistence: new PeoplePersistenceSchema(database, {
      now: () => "2026-07-31T00:00:00.000Z",
    }),
  };
}

test("D1 creates the canonical PEOPLE schema and indexes", () => {
  const { database, persistence } = schema();
  assert.equal(persistence.migrate(), PEOPLE_PERSISTENCE_SCHEMA_VERSION);
  assert.equal(persistence.version(), PEOPLE_PERSISTENCE_SCHEMA_VERSION);
  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'people_%' ORDER BY name")
    .all()
    .map((row) => (row as { name: string }).name);
  assert.deepEqual(tables, [
    "people_aggregate_snapshot",
    "people_business_person",
    "people_event_history",
    "people_idempotency_key",
    "people_role_assignment",
    "people_schema_migrations",
    "people_work_assignment",
    "people_work_people",
  ]);
  const indexes = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_people_%' ORDER BY name")
    .all();
  assert.equal(indexes.length, 5);
  database.close();
});

test("D1 migration is repeatable and does not duplicate its version", () => {
  const { database, persistence } = schema();
  persistence.migrate();
  persistence.migrate();
  assert.equal(
    (database.prepare("SELECT COUNT(*) AS count FROM people_schema_migrations").get() as { count: number }).count,
    1,
  );
  database.close();
});

test("D1 enforces foreign keys and the active Owner uniqueness constraint", () => {
  const { database, persistence } = schema();
  persistence.migrate();
  assert.throws(() => database.prepare(
    "INSERT INTO people_work_assignment(work_assignment_id, work_reference, business_person_id, status, effective_from, provenance_json) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("A-1", "WORK-1", "PERSON-1", "ACTIVE", "2026-01-01", "{}"));
  database.prepare(
    "INSERT INTO people_business_person(business_person_id, status, recognized_at, provenance_json, revision, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run("PERSON-1", "ACTIVE", "2026-01-01", "{}", 0, "2026-01-01", "2026-01-01");
  database.prepare(
    "INSERT INTO people_work_people(work_reference, revision, lifecycle_status, provenance_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("WORK-1", 0, "ACTIVE", "{}", "2026-01-01", "2026-01-01");
  database.prepare(
    "INSERT INTO people_work_assignment(work_assignment_id, work_reference, business_person_id, status, effective_from, provenance_json) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("A-1", "WORK-1", "PERSON-1", "ACTIVE", "2026-01-01", "{}");
  database.prepare(
    "INSERT INTO people_role_assignment(role_assignment_id, work_assignment_id, business_role, status, effective_from, provenance_json) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("R-1", "A-1", "OWNER", "ACTIVE", "2026-01-01", "{}");
  assert.throws(() => database.prepare(
    "INSERT INTO people_role_assignment(role_assignment_id, work_assignment_id, business_role, status, effective_from, provenance_json) VALUES (?, ?, ?, ?, ?, ?)",
  ).run("R-2", "A-1", "OWNER", "ACTIVE", "2026-02-01", "{}"));
  database.close();
});

test("D1 rollback removes the schema and its migration marker", () => {
  const { database, persistence } = schema();
  persistence.migrate();
  persistence.rollback();
  assert.equal(persistence.version(), 0);
  assert.equal(
    (database.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name LIKE 'people_%'").get() as { count: number }).count,
    0,
  );
  database.close();
});

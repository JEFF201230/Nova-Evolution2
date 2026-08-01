import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  createPeopleSQLitePersistence,
  PeoplePersistenceConflictError,
} from "./people-persistence-sqlite-adapter.js";

function persistence(): { database: DatabaseSync; people: ReturnType<typeof createPeopleSQLitePersistence> } {
  const database = new DatabaseSync(":memory:");
  return {
    database,
    people: createPeopleSQLitePersistence(database, () => "2026-07-31T00:00:00.000Z"),
  };
}

test("D2 maps a serializable aggregate snapshot to SQLite and back", () => {
  const { database, people } = persistence();
  const saved = people.transaction.run(() => people.aggregates.save(0, {
    aggregateType: "BUSINESS_PERSON",
    aggregateId: "PERSON-1",
    revision: 0,
    payload: { status: "ACTIVE", recognizedAt: "2026-01-01", provenance: { authority: "PEOPLE" } },
  }, {
    causationId: "CAUSE-1",
    correlationId: "CORR-1",
    requestHash: "HASH-1",
    occurredAt: "2026-01-01",
  }));
  assert.equal(saved.snapshot.revision, 1);
  assert.deepEqual(people.aggregates.load("BUSINESS_PERSON", "PERSON-1")?.snapshot.payload, {
    status: "ACTIVE",
    recognizedAt: "2026-01-01",
    provenance: { authority: "PEOPLE" },
  });
  database.close();
});

test("D2 detects an optimistic revision conflict and rolls back", () => {
  const { database, people } = persistence();
  const snapshot = {
    aggregateType: "WORK_PEOPLE" as const,
    aggregateId: "WORK-1",
    revision: 0,
    payload: { lifecycleStatus: "ACTIVE", provenance: {} },
  };
  const context = { causationId: "CAUSE-1", correlationId: "CORR-1", requestHash: "HASH-1", occurredAt: "2026-01-01" };
  people.transaction.run(() => people.aggregates.save(0, snapshot, context));
  assert.throws(
    () => people.transaction.run(() => people.aggregates.save(0, snapshot, {
      ...context,
      causationId: "CAUSE-2",
      requestHash: "HASH-2",
    })),
    PeoplePersistenceConflictError,
  );
  assert.equal(people.aggregates.load("WORK_PEOPLE", "WORK-1")?.snapshot.revision, 1);
  database.close();
});

test("D2 has no Runtime dependency in its public ports", () => {
  const { people, database } = persistence();
  assert.ok(people.transaction);
  assert.ok(people.aggregates);
  database.close();
});


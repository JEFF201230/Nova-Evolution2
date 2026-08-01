import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleIdempotencyConflictError, createPeopleSQLitePersistence } from "./people-persistence-sqlite-adapter.js";
import { PeoplePersistenceSchema } from "./people-persistence-schema.js";
import { PeopleEventHistoryStore } from "./people-persistence-history.js";

test("D5 returns the original aggregate result for an exact causal retry", () => {
  const database = new DatabaseSync(":memory:");
  const people = createPeopleSQLitePersistence(database, () => "2026-07-31T00:00:00.000Z");
  const snapshot = { aggregateType: "BUSINESS_PERSON" as const, aggregateId: "PERSON-D5", revision: 0, payload: { status: "ACTIVE", recognizedAt: "2026-01-01", provenance: {} } };
  const context = { causationId: "CAUSE-D5", correlationId: "CORR-D5", requestHash: "HASH-D5", occurredAt: "2026-01-01" };
  const first = people.transaction.run(() => people.aggregates.save(0, snapshot, context));
  const retry = people.transaction.run(() => people.aggregates.save(99, snapshot, context));
  assert.deepEqual(retry.snapshot, first.snapshot);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_idempotency_key").get() as { count: number }).count, 1);
  database.close();
});

test("D5 rejects a causal retry with a different request hash", () => {
  const database = new DatabaseSync(":memory:");
  const people = createPeopleSQLitePersistence(database);
  const snapshot = { aggregateType: "WORK_PEOPLE" as const, aggregateId: "WORK-D5", revision: 0, payload: { lifecycleStatus: "ACTIVE", provenance: {} } };
  const context = { causationId: "CAUSE-D5-2", correlationId: "CORR-D5", requestHash: "HASH-A", occurredAt: "2026-01-01" };
  people.transaction.run(() => people.aggregates.save(0, snapshot, context));
  assert.throws(() => people.transaction.run(() => people.aggregates.save(0, snapshot, { ...context, requestHash: "HASH-B" })), PeopleIdempotencyConflictError);
  database.close();
});

test("D5 accepts an exact history retry and rejects a divergent duplicate", () => {
  const database = new DatabaseSync(":memory:");
  new PeoplePersistenceSchema(database).migrate();
  const history = new PeopleEventHistoryStore(database);
  const event = { eventId: "E-D5", aggregateType: "WORK_PEOPLE" as const, aggregateId: "WORK-D5", sequence: 1, eventType: "PEOPLE_ASSIGNED", payload: { value: 1 }, causationId: "CAUSE-E-D5", correlationId: "CORR-D5", revision: 1, occurredAt: "2026-01-01" };
  history.append(event);
  history.append(event);
  assert.throws(() => history.append({ ...event, payload: { value: 2 } }), /PEOPLE_HISTORY_CAUSATION_CONFLICT/);
  database.close();
});


import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeoplePersistenceSchema } from "./people-persistence-schema.js";
import { PeopleEventHistoryStore } from "./people-persistence-history.js";

function history(): { database: DatabaseSync; store: PeopleEventHistoryStore } {
  const database = new DatabaseSync(":memory:");
  new PeoplePersistenceSchema(database).migrate();
  return { database, store: new PeopleEventHistoryStore(database, () => "2026-07-31T00:00:00.000Z") };
}

test("D4 appends and reads ordered immutable history", () => {
  const { database, store } = history();
  store.append({ eventId: "E-1", aggregateType: "WORK_PEOPLE", aggregateId: "WORK-1", sequence: 1, eventType: "PEOPLE_ASSIGNED", payload: { value: 1 }, causationId: "C-1", correlationId: "CORR-1", revision: 1, occurredAt: "2026-01-01" });
  store.append({ eventId: "E-2", aggregateType: "WORK_PEOPLE", aggregateId: "WORK-1", sequence: 2, eventType: "OWNER_CHANGED", payload: { value: 2 }, causationId: "C-2", correlationId: "CORR-1", revision: 2, occurredAt: "2026-01-02" });
  assert.deepEqual(store.read("WORK_PEOPLE", "WORK-1").map((event) => event.sequence), [1, 2]);
  assert.throws(() => store.append({ eventId: "E-4", aggregateType: "WORK_PEOPLE", aggregateId: "WORK-1", sequence: 4, eventType: "BAD", payload: {}, causationId: "C-4", correlationId: "CORR-1", revision: 4, occurredAt: "2026-01-04" }));
  database.close();
});

test("D4 snapshots and recovery replay only events after the snapshot", () => {
  const { database, store } = history();
  store.append({ eventId: "E-1", aggregateType: "BUSINESS_PERSON", aggregateId: "PERSON-1", sequence: 1, eventType: "BUSINESS_IDENTITY_RECOGNIZED", payload: { count: 1 }, causationId: "C-1", correlationId: "CORR-1", revision: 1, occurredAt: "2026-01-01" });
  store.saveSnapshot({ aggregateType: "BUSINESS_PERSON", aggregateId: "PERSON-1", revision: 1, payload: { count: 1 }, capturedAt: "2026-01-01" });
  store.append({ eventId: "E-2", aggregateType: "BUSINESS_PERSON", aggregateId: "PERSON-1", sequence: 2, eventType: "BUSINESS_IDENTITY_UPDATED", payload: { count: 2 }, causationId: "C-2", correlationId: "CORR-1", revision: 2, occurredAt: "2026-01-02" });
  assert.deepEqual(store.recover("BUSINESS_PERSON", "PERSON-1", { count: 0 }, (state, event) => ({ count: Number((event.payload as { count: number }).count) })), { count: 2 });
  database.close();
});


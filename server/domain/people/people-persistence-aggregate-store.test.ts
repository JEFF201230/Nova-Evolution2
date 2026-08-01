import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleAuthority } from "./people-authority.js";
import { BusinessPersonId, AssignmentPeriod, BusinessRole, PeopleProvenance, WorkAssignmentId, WorkReference } from "./people.value-objects.js";
import { PeopleAggregatePersistenceStore } from "./people-persistence-aggregate-store.js";

const authority = PeopleAuthority.establish("PERSISTENCE-TEST-AUTHORITY");
const provenance = (cause: string, at: string) => PeopleProvenance.of("PERSISTENCE-TEST-AUTHORITY", cause, new Date(at));

test("D3 persists Business Person atomically with a revision", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database, () => "2026-07-31T00:00:00.000Z");
  const person = authority.createBusinessPerson(null, {
    personId: BusinessPersonId.of("person-d3"),
    provenance: provenance("recognize", "2026-01-01T00:00:00.000Z"),
  }).aggregate;
  assert.equal(store.persistBusinessPerson(person, 0, {
    causationId: "d3-person-1", correlationId: "d3-corr-1", requestHash: "d3-hash-1", occurredAt: "2026-01-01T00:00:00.000Z",
  }), 1);
  assert.equal((database.prepare("SELECT revision FROM people_business_person WHERE business_person_id = ?").get("person-d3") as { revision: number }).revision, 1);
  database.close();
});

test("D3 persists Work People assignments and roles in one transaction", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database, () => "2026-07-31T00:00:00.000Z");
  const person = authority.createBusinessPerson(null, {
    personId: BusinessPersonId.of("person-work-d3"),
    provenance: provenance("recognize-work", "2026-01-01T00:00:00.000Z"),
  }).aggregate;
  const work = authority.assignPersonToWork(null, {
    workReference: WorkReference.of("project-d3", "work-d3"),
    assignmentId: WorkAssignmentId.of("assignment-d3"),
    person,
    roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(new Date("2026-01-02T00:00:00.000Z")),
    provenance: provenance("assign-work", "2026-01-02T00:00:00.000Z"),
  }).aggregate;
  assert.equal(store.persistBusinessPerson(person, 0, {
    causationId: "d3-person-2", correlationId: "d3-corr-2", requestHash: "d3-hash-2", occurredAt: "2026-01-01T00:00:00.000Z",
  }), 1);
  assert.equal(store.persistWorkPeople(work, 0, {
    causationId: "d3-work-1", correlationId: "d3-corr-3", requestHash: "d3-hash-3", occurredAt: "2026-01-02T00:00:00.000Z",
  }), 1);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_work_assignment").get() as { count: number }).count, 1);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_role_assignment WHERE business_role = 'OWNER'").get() as { count: number }).count, 1);
  database.close();
});

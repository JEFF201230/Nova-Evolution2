import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleAggregatePersistenceStore, createPeopleRequestFingerprint } from "./people-persistence-aggregate-store.js";
import { PEOPLE_PERSISTENCE_SCHEMA_VERSION, PeoplePersistenceSchema } from "./people-persistence-schema.js";
import type { CommandEnvelope } from "./people-persistence-ports.js";
import { AssignmentPeriod, BusinessPersonId, BusinessRole, PeopleProvenance, WorkAssignmentId, WorkReference } from "./people.value-objects.js";

const authority = PeopleAuthority.establish("SCHEMA-TEST");
const provenance = (cause: string, day: number) => PeopleProvenance.of("SCHEMA-TEST", cause, new Date(Date.UTC(2026, 0, day)));
const envelope = (kind: string, value: PeopleProvenance): CommandEnvelope => ({
  commandType: kind,
  causationId: value.businessCause,
  correlationId: "schema-correlation",
  requestFingerprint: createPeopleRequestFingerprint({ kind, cause: value.businessCause }),
  fingerprintVersion: 1,
  provenance: value,
  occurredAt: value.effectiveAt,
});

test("creates the canonical V1 schema exactly once", () => {
  const database = new DatabaseSync(":memory:");
  const schema = new PeoplePersistenceSchema(database, { now: () => new Date("2026-08-01T00:00:00.000Z") });
  assert.equal(schema.migrate(), PEOPLE_PERSISTENCE_SCHEMA_VERSION);
  assert.equal(schema.migrate(), PEOPLE_PERSISTENCE_SCHEMA_VERSION);
  assert.equal(schema.version(), 1);
  const tables = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'people_%' ORDER BY name",
  ).all().map((row) => String((row as { name: string }).name));
  assert.deepEqual(tables, [
    "people_business_person",
    "people_command_receipt",
    "people_event",
    "people_role_assignment",
    "people_role_period",
    "people_schema_migration",
    "people_work_assignment",
    "people_work_people",
  ]);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_schema_migration").get() as { count: number }).count, 1);
  database.close();
});

test("direct SQL constraints reject duplicate Owner, overlaps, invalid periods and physical deletion", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database);
  const people = ["owner", "contributor"].map((id, index) => {
    const source = provenance(`recognize-${id}`, index + 1);
    const change = authority.createBusinessPerson(null, {
      kind: "CREATE_BUSINESS_PERSON",
      personId: BusinessPersonId.of(id),
      provenance: source,
    });
    return store.businessPersons.commit(0, change, envelope("CREATE_BUSINESS_PERSON", source)).aggregate;
  });
  const reference = WorkReference.of("schema-project", "schema-work");
  const ownerAt = provenance("assign-owner", 3);
  const owner = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK", person: people[0]!, workReference: reference,
    assignmentId: WorkAssignmentId.of("owner-assignment"), roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(ownerAt.effectiveAt), provenance: ownerAt,
  });
  const first = store.workPeople.commit(0, owner, envelope("ASSIGN_PERSON_TO_WORK", ownerAt));
  const contributorAt = provenance("assign-contributor", 4);
  const contributor = authority.assignPersonToWork(first.aggregate, {
    kind: "ASSIGN_PERSON_TO_WORK", person: people[1]!, workReference: reference,
    assignmentId: WorkAssignmentId.of("contributor-assignment"), roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(contributorAt.effectiveAt), provenance: contributorAt,
  });
  store.workPeople.commit(1, contributor, envelope("ASSIGN_PERSON_TO_WORK", contributorAt));

  database.prepare(
    "INSERT INTO people_role_assignment(work_assignment_id, business_role, provenance_trail_json) VALUES (?, 'OWNER', ?)",
  ).run("contributor-assignment", JSON.stringify([{ authority: "SCHEMA-TEST", businessCause: "assign-contributor", effectiveAtEpochMs: contributorAt.effectiveAt.getTime() }]));
  assert.throws(() => database.prepare(
    `INSERT INTO people_role_period(work_assignment_id, business_role, period_ordinal,
       project_identity, work_identity, effective_from_epoch_ms, effective_to_epoch_ms,
       opened_by_causation_id, closed_by_causation_id)
     VALUES (?, 'OWNER', 1, ?, ?, ?, NULL, ?, NULL)`,
  ).run("contributor-assignment", "schema-project", "schema-work", contributorAt.effectiveAt.getTime(), "assign-contributor"));

  assert.throws(() => database.prepare(
    `INSERT INTO people_work_assignment(work_assignment_id, project_identity, work_identity,
       business_person_id, status, effective_from_epoch_ms, effective_to_epoch_ms, provenance_trail_json)
     VALUES (?, ?, ?, ?, 'ENDED', ?, ?, ?)`,
  ).run(
    "overlap",
    "schema-project",
    "schema-work",
    "contributor",
    contributorAt.effectiveAt.getTime() + 1,
    contributorAt.effectiveAt.getTime() + 2,
    JSON.stringify([{ authority: "SCHEMA-TEST", businessCause: "overlap", effectiveAtEpochMs: contributorAt.effectiveAt.getTime() + 1 }]),
  ));

  database.prepare(
    "INSERT INTO people_role_assignment(work_assignment_id, business_role, provenance_trail_json) VALUES (?, 'REVIEWER', ?)",
  ).run("contributor-assignment", JSON.stringify([{ authority: "SCHEMA-TEST", businessCause: "assign-contributor", effectiveAtEpochMs: contributorAt.effectiveAt.getTime() }]));
  assert.throws(() => database.prepare(
    `INSERT INTO people_role_period(work_assignment_id, business_role, period_ordinal,
       project_identity, work_identity, effective_from_epoch_ms, effective_to_epoch_ms,
       opened_by_causation_id, closed_by_causation_id)
     VALUES (?, 'REVIEWER', 1, ?, ?, ?, NULL, ?, NULL)`,
  ).run("contributor-assignment", "schema-project", "schema-work", contributorAt.effectiveAt.getTime() - 1, "assign-contributor"));

  assert.throws(() => database.prepare("UPDATE people_event SET event_type = 'ALTERED' WHERE event_id = (SELECT event_id FROM people_event LIMIT 1)").run());
  assert.throws(() => database.prepare("DELETE FROM people_event").run());
  assert.throws(() => database.prepare("DELETE FROM people_command_receipt").run());
  assert.throws(() => database.prepare("DELETE FROM people_work_assignment WHERE work_assignment_id = 'owner-assignment'").run());
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_event").get() as { count: number }).count, 7);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_work_assignment").get() as { count: number }).count, 2);
  database.close();
});

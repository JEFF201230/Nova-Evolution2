import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleAggregatePersistenceStore, createPeopleRequestFingerprint } from "./people-persistence-aggregate-store.js";
import type { CommandEnvelope } from "./people-persistence-ports.js";
import { PeopleIdempotencyConflictError } from "./people-persistence-sqlite-adapter.js";
import { AssignmentPeriod, BusinessPersonId, BusinessRole, PeopleProvenance, WorkAssignmentId, WorkReference } from "./people.value-objects.js";

const authority = PeopleAuthority.establish("IDEMPOTENCE-TEST");
const provenance = (cause: string, day: number) => PeopleProvenance.of("IDEMPOTENCE-TEST", cause, new Date(Date.UTC(2026, 1, day)));
const envelope = (kind: string, value: PeopleProvenance, request: unknown): CommandEnvelope => ({
  commandType: kind,
  causationId: value.businessCause,
  correlationId: "idempotence-correlation",
  requestFingerprint: createPeopleRequestFingerprint(request),
  fingerprintVersion: 1,
  provenance: value,
  occurredAt: value.effectiveAt,
});

test("exact replay returns the original receipt before CAS and divergent replay is rejected", () => {
  const database = new DatabaseSync(":memory:");
  let commitClock = 0;
  const store = new PeopleAggregatePersistenceStore(database, {
    now: () => new Date(Date.UTC(2026, 7, 1, 0, 0, commitClock++)),
  });
  const personAt = provenance("idempotent-person", 1);
  const personChange = authority.createBusinessPerson(null, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of("idempotent-person"),
    provenance: personAt,
  });
  const person = store.businessPersons.commit(
    0,
    personChange,
    envelope("CREATE_BUSINESS_PERSON", personAt, { person: "idempotent-person" }),
  ).aggregate;
  const reference = WorkReference.of("idempotence-project", "idempotence-work");
  const assignedAt = provenance("idempotent-assign", 2);
  const initial = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("idempotent-assignment"),
    roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });
  const initialEnvelope = envelope("ASSIGN_PERSON_TO_WORK", assignedAt, { assignment: "idempotent-assignment" });
  const first = store.workPeople.commit(0, initial, initialEnvelope);

  const secondPersonAt = provenance("second-person", 3);
  const secondPersonChange = authority.createBusinessPerson(null, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of("second-person"),
    provenance: secondPersonAt,
  });
  const secondPerson = store.businessPersons.commit(0, secondPersonChange, envelope("CREATE_BUSINESS_PERSON", secondPersonAt, "second-person")).aggregate;
  const modifiedAt = provenance("second-assignment", 4);
  const modified = authority.assignPersonToWork(first.aggregate, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: secondPerson,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("second-assignment"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(modifiedAt.effectiveAt),
    provenance: modifiedAt,
  });
  store.workPeople.commit(1, modified, envelope("ASSIGN_PERSON_TO_WORK", modifiedAt, "second-assignment"));

  const replayed = store.workPeople.commit(99, { aggregate: first.aggregate, events: [] }, initialEnvelope);
  assert.equal(replayed.status, "REPLAYED");
  assert.equal(replayed.revision, 1);
  assert.equal(replayed.aggregate.assignments.length, 1);
  assert.deepEqual(replayed.eventIds, first.eventIds);
  assert.equal(replayed.committedAt.getTime(), first.committedAt.getTime());
  assert.equal(store.workPeople.load(reference)?.revision, 2);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_command_receipt WHERE causation_id = ?").get("idempotent-assign") as { count: number }).count, 1);

  assert.throws(
    () => store.workPeople.commit(0, initial, { ...initialEnvelope, requestFingerprint: createPeopleRequestFingerprint("divergent") }),
    PeopleIdempotencyConflictError,
  );
  assert.equal(store.workPeople.load(reference)?.revision, 2);
  database.close();
});

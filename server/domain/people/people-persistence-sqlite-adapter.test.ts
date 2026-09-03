import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleAggregatePersistenceStore, createPeopleRequestFingerprint } from "./people-persistence-aggregate-store.js";
import type { CommandEnvelope } from "./people-persistence-ports.js";
import { PeoplePersistenceConflictError } from "./people-persistence-sqlite-adapter.js";
import { AssignmentPeriod, BusinessPersonId, BusinessRole, PeopleProvenance, WorkAssignmentId, WorkReference } from "./people.value-objects.js";

const authority = PeopleAuthority.establish("ATOMIC-TEST");
const provenance = (cause: string, minute: number) => PeopleProvenance.of("ATOMIC-TEST", cause, new Date(Date.UTC(2026, 2, 1, 0, minute)));
const envelope = (kind: string, source: PeopleProvenance): CommandEnvelope => ({
  commandType: kind,
  causationId: source.businessCause,
  correlationId: "atomic-correlation",
  requestFingerprint: createPeopleRequestFingerprint({ kind, cause: source.businessCause }),
  fingerprintVersion: 1,
  provenance: source,
  occurredAt: source.effectiveAt,
});

function recognize(store: PeopleAggregatePersistenceStore, id: string, minute: number) {
  const source = provenance(`recognize-${id}`, minute);
  const change = authority.createBusinessPerson(null, {
    kind: "CREATE_BUSINESS_PERSON", personId: BusinessPersonId.of(id), provenance: source,
  });
  return store.businessPersons.commit(0, change, envelope("CREATE_BUSINESS_PERSON", source)).aggregate;
}

test("an injected failure rolls back state, events, causality and receipt", () => {
  const database = new DatabaseSync(":memory:");
  const setup = new PeopleAggregatePersistenceStore(database);
  const person = recognize(setup, "rollback-person", 1);
  const failing = new PeopleAggregatePersistenceStore(database, {
    beforeReceipt: () => { throw new Error("INJECTED_ROLLBACK"); },
  });
  const source = provenance("rollback-work", 2);
  const change = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference: WorkReference.of("rollback-project", "rollback-work"),
    assignmentId: WorkAssignmentId.of("rollback-assignment"),
    roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(source.effectiveAt),
    provenance: source,
  });
  assert.throws(() => failing.workPeople.commit(0, change, envelope("ASSIGN_PERSON_TO_WORK", source)), /INJECTED_ROLLBACK/);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_work_people").get() as { count: number }).count, 0);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_work_assignment").get() as { count: number }).count, 0);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_event WHERE causation_id = ?").get("rollback-work") as { count: number }).count, 0);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_command_receipt WHERE causation_id = ?").get("rollback-work") as { count: number }).count, 0);
  database.close();
});

test("two SQLite connections serialize writers and reject a stale revision without partial state", () => {
  const directory = mkdtempSync(join(tmpdir(), "people-concurrency-"));
  const path = join(directory, "people.sqlite");
  try {
    const databaseA = new DatabaseSync(path);
    const storeA = new PeopleAggregatePersistenceStore(databaseA);
    const databaseB = new DatabaseSync(path);
    const storeB = new PeopleAggregatePersistenceStore(databaseB);
    const owner = recognize(storeA, "concurrent-owner", 1);
    const firstCandidate = recognize(storeA, "concurrent-a", 2);
    const secondCandidate = recognize(storeA, "concurrent-b", 3);
    const reference = WorkReference.of("concurrent-project", "concurrent-work");
    const initialAt = provenance("concurrent-initial", 4);
    const initial = authority.assignPersonToWork(null, {
      kind: "ASSIGN_PERSON_TO_WORK", person: owner, workReference: reference,
      assignmentId: WorkAssignmentId.of("concurrent-owner-assignment"), roles: [BusinessRole.of("OWNER")],
      period: AssignmentPeriod.startingAt(initialAt.effectiveAt), provenance: initialAt,
    });
    storeA.workPeople.commit(0, initial, envelope("ASSIGN_PERSON_TO_WORK", initialAt));
    const viewA = storeA.workPeople.load(reference)!;
    const viewB = storeB.workPeople.load(reference)!;
    assert.equal(viewA.revision, 1);
    assert.equal(viewB.revision, 1);

    const changeAAt = provenance("concurrent-change-a", 5);
    const changeA = authority.assignPersonToWork(viewA.aggregate, {
      kind: "ASSIGN_PERSON_TO_WORK", person: firstCandidate, workReference: reference,
      assignmentId: WorkAssignmentId.of("concurrent-assignment-a"), roles: [BusinessRole.of("CONTRIBUTOR")],
      period: AssignmentPeriod.startingAt(changeAAt.effectiveAt), provenance: changeAAt,
    });
    const changeBAt = provenance("concurrent-change-b", 6);
    const changeB = authority.assignPersonToWork(viewB.aggregate, {
      kind: "ASSIGN_PERSON_TO_WORK", person: secondCandidate, workReference: reference,
      assignmentId: WorkAssignmentId.of("concurrent-assignment-b"), roles: [BusinessRole.of("REVIEWER")],
      period: AssignmentPeriod.startingAt(changeBAt.effectiveAt), provenance: changeBAt,
    });
    storeA.workPeople.commit(1, changeA, envelope("ASSIGN_PERSON_TO_WORK", changeAAt));
    assert.throws(
      () => storeB.workPeople.commit(1, changeB, envelope("ASSIGN_PERSON_TO_WORK", changeBAt)),
      PeoplePersistenceConflictError,
    );
    const durable = storeB.workPeople.load(reference)!;
    assert.equal(durable.revision, 2);
    assert.deepEqual(durable.aggregate.assignments.map((item) => item.id.value).sort(), ["concurrent-assignment-a", "concurrent-owner-assignment"]);
    assert.equal((databaseB.prepare("SELECT COUNT(*) AS count FROM people_command_receipt WHERE causation_id = ?").get("concurrent-change-b") as { count: number }).count, 0);
    assert.equal((databaseB.prepare("SELECT COUNT(*) AS count FROM people_event WHERE causation_id = ?").get("concurrent-change-b") as { count: number }).count, 0);
    databaseB.close();
    databaseA.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

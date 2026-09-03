import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleAggregatePersistenceStore, createPeopleRequestFingerprint } from "./people-persistence-aggregate-store.js";
import { canonicalJson, serializeWorkPeople } from "./people-persistence-history.js";
import type { CommandEnvelope } from "./people-persistence-ports.js";
import {
  AssignmentPeriod,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";

const authority = PeopleAuthority.establish("PEOPLE-PERSISTENCE-TEST");
const at = (cause: string, instant: string) => PeopleProvenance.of("PEOPLE-PERSISTENCE-TEST", cause, new Date(instant));
const envelope = (commandType: string, provenance: PeopleProvenance, payload: unknown = commandType): CommandEnvelope => ({
  commandType,
  causationId: provenance.businessCause,
  correlationId: `correlation-${provenance.businessCause}`,
  requestFingerprint: createPeopleRequestFingerprint(payload),
  fingerprintVersion: 1,
  provenance,
  occurredAt: provenance.effectiveAt,
});

function recognize(store: PeopleAggregatePersistenceStore, id: string, instant: string) {
  const provenance = at(`recognize-${id}`, instant);
  const change = authority.createBusinessPerson(null, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of(id),
    provenance,
  });
  const committed = store.businessPersons.commit(0, change, envelope("CREATE_BUSINESS_PERSON", provenance, { id }));
  return { person: committed.aggregate, committed };
}

test("creates and fully loads distinct BusinessPerson and WorkPeople aggregates", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database, { now: () => new Date("2026-08-01T00:00:00.000Z") });
  const first = recognize(store, "person-1", "2026-01-01T00:00:00.000Z");
  const second = recognize(store, "person-2", "2026-01-01T00:01:00.000Z");
  assert.equal(first.committed.revision, 1);
  assert.equal(store.businessPersons.load("person-1")?.aggregate.id.value, "person-1");

  const reference = WorkReference.of("project-1", "work-1");
  const assignedAt = at("assign-owner", "2026-01-02T00:00:00.000Z");
  const initial = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: first.person,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("assignment-1"),
    roles: [BusinessRole.of("OWNER"), BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });
  const created = store.workPeople.commit(0, initial, envelope("ASSIGN_PERSON_TO_WORK", assignedAt, { assignment: 1 }));
  assert.equal(created.revision, 1);
  assert.equal(created.eventIds.length, 3);

  const contributorAt = at("assign-contributor", "2026-01-03T00:00:00.000Z");
  const modified = authority.assignPersonToWork(created.aggregate, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: second.person,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("assignment-2"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(contributorAt.effectiveAt),
    provenance: contributorAt,
  });
  const updated = store.workPeople.commit(1, modified, envelope("ASSIGN_PERSON_TO_WORK", contributorAt, { assignment: 2 }));
  const ownerChangedAt = at("change-owner", "2026-01-04T00:00:00.000Z");
  const ownerChanged = authority.changeWorkOwner(updated.aggregate, {
    kind: "CHANGE_WORK_OWNER",
    nextOwner: second.person,
    nextOwnerAssignmentId: WorkAssignmentId.of("assignment-2"),
    provenance: ownerChangedAt,
  });
  const ownerCommit = store.workPeople.commit(2, ownerChanged, envelope("CHANGE_WORK_OWNER", ownerChangedAt, { owner: "person-2" }));
  const loaded = store.workPeople.load(reference);
  assert.equal(ownerCommit.revision, 3);
  assert.equal(loaded?.aggregate.assignments.length, 2);
  assert.equal(loaded?.aggregate.assignments.find((item) => item.id.value === "assignment-1")?.roleAssignments.some((role) => role.role.name === "OWNER"), true);
  assert.equal(loaded?.aggregate.assignments.find((item) => item.id.value === "assignment-2")?.roleAssignments[0]?.role.name, "CONTRIBUTOR");
  assert.equal(loaded?.aggregate.assignments.find((item) => item.id.value === "assignment-2")?.roleAssignments.some((role) => role.role.name === "OWNER" && role.periods.some((period) => period.isOpen)), true);
  assert.equal(loaded?.lastEventSequence, 6);

  const replayed = store.workPeople.rehydrate(reference);
  assert.equal(replayed?.revision, loaded?.revision);
  assert.equal(canonicalJson(serializeWorkPeople(replayed!.aggregate)), canonicalJson(serializeWorkPeople(loaded!.aggregate)));
  const history = store.workPeople.readHistory(reference);
  assert.deepEqual(history.events.map((event) => event.streamSequence), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(history.events.map((event) => event.aggregateRevision), [1, 1, 1, 2, 2, 3]);
  assert.ok(history.events.every((event, index) => index < 3
    ? event.causationId === "assign-owner"
    : index < 5 ? event.causationId === "assign-contributor" : event.causationId === "change-owner"));
  database.close();
});

test("rehydrates complete durable state after a database restart", () => {
  const directory = mkdtempSync(join(tmpdir(), "people-m01-"));
  const path = join(directory, "people.sqlite");
  const reference = WorkReference.of("restart-project", "restart-work");
  try {
    const firstDatabase = new DatabaseSync(path);
    const firstStore = new PeopleAggregatePersistenceStore(firstDatabase);
    const recognized = recognize(firstStore, "restart-person", "2026-02-01T00:00:00.000Z");
    const provenance = at("restart-assign", "2026-02-02T00:00:00.000Z");
    const change = authority.assignPersonToWork(null, {
      kind: "ASSIGN_PERSON_TO_WORK",
      person: recognized.person,
      workReference: reference,
      assignmentId: WorkAssignmentId.of("restart-assignment"),
      roles: [BusinessRole.of("OWNER"), BusinessRole.of("APPROVER")],
      period: AssignmentPeriod.startingAt(provenance.effectiveAt),
      provenance,
    });
    firstStore.workPeople.commit(0, change, envelope("ASSIGN_PERSON_TO_WORK", provenance));
    firstDatabase.close();

    const restartedDatabase = new DatabaseSync(path);
    const restartedStore = new PeopleAggregatePersistenceStore(restartedDatabase);
    const loaded = restartedStore.workPeople.load(reference);
    const rehydrated = restartedStore.workPeople.rehydrate(reference);
    assert.equal(loaded?.aggregate.assignments[0]?.roleAssignments.length, 2);
    assert.equal(canonicalJson(serializeWorkPeople(loaded!.aggregate)), canonicalJson(serializeWorkPeople(rehydrated!.aggregate)));
    assert.equal(restartedStore.businessPersons.rehydrate("restart-person")?.aggregate.id.value, "restart-person");
    restartedDatabase.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("suspension and resume close and reopen role periods without losing history", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database);
  const recognized = recognize(store, "lifecycle-person", "2026-03-01T00:00:00.000Z");
  const reference = WorkReference.of("lifecycle-project", "lifecycle-work");
  const assignedAt = at("lifecycle-assign", "2026-03-02T00:00:00.000Z");
  const initial = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: recognized.person,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("lifecycle-assignment"),
    roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });
  const created = store.workPeople.commit(0, initial, envelope("ASSIGN_PERSON_TO_WORK", assignedAt));
  const suspendedAt = at("lifecycle-suspend", "2026-03-03T00:00:00.000Z");
  const suspended = authority.suspendWorkAssignment(created.aggregate, {
    kind: "SUSPEND_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("lifecycle-assignment"),
    provenance: suspendedAt,
  });
  const suspendedCommit = store.workPeople.commit(1, suspended, envelope("SUSPEND_WORK_ASSIGNMENT", suspendedAt));
  assert.equal(suspendedCommit.aggregate.assignments[0]?.roleAssignments[0]?.periods[0]?.effectiveUntil?.getTime(), suspendedAt.effectiveAt.getTime());
  const resumedAt = at("lifecycle-resume", "2026-03-04T00:00:00.000Z");
  const resumed = authority.resumeWorkAssignment(suspendedCommit.aggregate, {
    kind: "RESUME_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("lifecycle-assignment"),
    provenance: resumedAt,
  });
  const resumedCommit = store.workPeople.commit(2, resumed, envelope("RESUME_WORK_ASSIGNMENT", resumedAt));
  assert.equal(resumedCommit.revision, 3);
  assert.equal(resumedCommit.aggregate.assignments[0]?.roleAssignments[0]?.periods.length, 2);
  assert.equal((database.prepare("SELECT COUNT(*) AS count FROM people_role_period").get() as { count: number }).count, 2);
  assert.equal(store.workPeople.rehydrate(reference)?.aggregate.assignments[0]?.status.name, "ACTIVE");
  database.close();
});

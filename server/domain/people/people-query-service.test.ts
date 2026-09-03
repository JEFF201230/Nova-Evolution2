import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import type { BusinessPerson } from "./business-person.aggregate.js";
import type { PeopleAuthorityCommand } from "./people-authority.commands.js";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleCommandService } from "./people-command-service.js";
import { PeopleAggregatePersistenceStore } from "./people-persistence-aggregate-store.js";
import {
  canonicalJson,
  serializeBusinessPerson,
  serializeWorkPeople,
} from "./people-persistence-history.js";
import type { PeoplePersistencePorts } from "./people-persistence-ports.js";
import { PeoplePersistenceError } from "./people-persistence-sqlite-adapter.js";
import { PeopleQueryService } from "./people-query-service.js";
import {
  AssignmentPeriod,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";
import type { WorkPeople } from "./work-people.aggregate.js";

const AUTHORITY = "PEOPLE-QUERIES-TEST";
const authority = PeopleAuthority.establish(AUTHORITY);
const instant = (day: number, hour = 9): Date =>
  new Date(`2026-08-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`);
const provenance = (cause: string, day: number): PeopleProvenance =>
  PeopleProvenance.of(AUTHORITY, cause, instant(day));

type Fixture = Readonly<{
  database: DatabaseSync;
  store: PeopleAggregatePersistenceStore;
  query: PeopleQueryService;
  command: PeopleCommandService;
  workA: WorkReference;
  workB: WorkReference;
  workC: WorkReference;
}>;

function execute(
  service: PeopleCommandService,
  command: PeopleAuthorityCommand,
  expectedRevision: number,
  workReference?: WorkReference,
) {
  return service.execute(command, {
    expectedRevision,
    correlationId: `correlation-${command.provenance.businessCause}`,
    workReference,
  });
}

function recognize(service: PeopleCommandService, id: string, day = 1): BusinessPerson {
  const result = execute(service, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of(id),
    provenance: provenance(`recognize-${id}`, day),
  }, 0);
  return result.aggregate as BusinessPerson;
}

function assign(
  service: PeopleCommandService,
  person: BusinessPerson,
  workReference: WorkReference,
  assignmentId: string,
  roles: readonly BusinessRole[],
  day: number,
  expectedRevision: number,
): WorkPeople {
  return execute(service, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference,
    assignmentId: WorkAssignmentId.of(assignmentId),
    roles,
    period: AssignmentPeriod.startingAt(instant(day)),
    provenance: provenance(`assign-${assignmentId}`, day),
  }, expectedRevision).aggregate as WorkPeople;
}

function createFixture(database = new DatabaseSync(":memory:")): Fixture {
  const store = new PeopleAggregatePersistenceStore(database, {
    now: () => new Date("2026-08-31T12:00:00.000Z"),
  });
  const command = new PeopleCommandService(authority, store);
  const query = new PeopleQueryService(store);
  const workA = WorkReference.of("query-project", "query-work-a");
  const workB = WorkReference.of("query-project", "query-work-b");
  const workC = WorkReference.of("query-project", "query-work-c");

  const alice = recognize(command, "query-alice");
  const bob = recognize(command, "query-bob");
  const carol = recognize(command, "query-carol");
  const dana = recognize(command, "query-dana");
  recognize(command, "query-without-assignment");

  assign(
    command,
    alice,
    workA,
    "query-assignment-alice-a",
    [BusinessRole.of("OWNER"), BusinessRole.of("CONTRIBUTOR")],
    2,
    0,
  );
  assign(
    command,
    bob,
    workA,
    "query-assignment-bob-a",
    [BusinessRole.of("REVIEWER")],
    3,
    1,
  );
  execute(command, {
    kind: "ASSIGN_APPROVER",
    assignmentId: WorkAssignmentId.of("query-assignment-bob-a"),
    period: AssignmentPeriod.startingAt(instant(4)),
    provenance: provenance("approve-query-bob", 4),
  }, 2, workA);
  assign(
    command,
    carol,
    workA,
    "query-assignment-carol-a",
    [BusinessRole.of("CONTRIBUTOR")],
    5,
    3,
  );
  execute(command, {
    kind: "SUSPEND_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("query-assignment-carol-a"),
    provenance: provenance("suspend-query-carol", 6),
  }, 4, workA);

  assign(
    command,
    alice,
    workB,
    "query-assignment-alice-b",
    [BusinessRole.of("OBSERVER")],
    2,
    0,
  );

  assign(
    command,
    dana,
    workC,
    "query-assignment-dana-c",
    [BusinessRole.of("CONTRIBUTOR")],
    2,
    0,
  );
  execute(command, {
    kind: "REMOVE_PERSON_FROM_WORK",
    assignmentId: WorkAssignmentId.of("query-assignment-dana-c"),
    provenance: provenance("remove-query-dana", 3),
  }, 1, workC);

  return { database, store, query, command, workA, workB, workC };
}

test("PeopleQueryService exposes exactly the nine canonical internal queries", () => {
  assert.deepEqual(
    Object.getOwnPropertyNames(PeopleQueryService.prototype)
      .filter((name) => name !== "constructor")
      .sort(),
    [
      "GetAssignmentHistory",
      "GetBusinessPerson",
      "GetPersonAssignments",
      "GetWorkApprovers",
      "GetWorkContributors",
      "GetWorkOwner",
      "GetWorkParticipants",
      "GetWorkPeople",
      "GetWorkReviewers",
    ],
  );
});

test("GetBusinessPerson and GetWorkPeople preserve authoritative state and distinguish absence", () => {
  const fixture = createFixture();
  const personBefore = canonicalJson(serializeBusinessPerson(
    fixture.store.businessPersons.load("query-alice")!.aggregate,
  ));
  const workBefore = canonicalJson(serializeWorkPeople(
    fixture.store.workPeople.load(fixture.workA)!.aggregate,
  ));

  const person = fixture.query.GetBusinessPerson(BusinessPersonId.of("query-alice"));
  assert.equal(person.status, "PRESENT");
  if (person.status === "PRESENT") {
    assert.equal(person.aggregate.id.value, "query-alice");
    assert.equal(person.qualification.aggregateRevision, 1);
    assert.equal(person.qualification.provenance.businessCause, "recognize-query-alice");
  }
  assert.deepEqual(
    fixture.query.GetBusinessPerson(BusinessPersonId.of("query-absent")),
    { status: "AGGREGATE_ABSENT" },
  );

  const work = fixture.query.GetWorkPeople(fixture.workA);
  assert.equal(work.status, "PRESENT");
  if (work.status === "PRESENT") {
    assert.equal(work.aggregate.assignments.length, 3);
    assert.equal(work.qualification.aggregateRevision, 5);
    assert.equal(work.qualification.lastEventSequence > 0, true);
    assert.equal(work.qualification.provenance.businessCause, "suspend-query-carol");
  }
  assert.deepEqual(
    fixture.query.GetWorkPeople(WorkReference.of("query-project", "missing-work")),
    { status: "AGGREGATE_ABSENT" },
  );

  assert.equal(canonicalJson(serializeBusinessPerson(
    fixture.store.businessPersons.load("query-alice")!.aggregate,
  )), personBefore);
  assert.equal(canonicalJson(serializeWorkPeople(
    fixture.store.workPeople.load(fixture.workA)!.aggregate,
  )), workBefore);
  fixture.database.close();
});

test("owner, participant and role queries delegate exact temporal qualification to domain primitives", () => {
  const fixture = createFixture();
  const ownerBeforeStart = fixture.query.GetWorkOwner(fixture.workA, instant(1));
  assert.equal(ownerBeforeStart.status, "QUALIFIED");
  if (ownerBeforeStart.status === "QUALIFIED") assert.equal(ownerBeforeStart.assignment, null);

  const owner = fixture.query.GetWorkOwner(fixture.workA, instant(2));
  assert.equal(owner.status, "QUALIFIED");
  if (owner.status === "QUALIFIED") {
    assert.equal(owner.assignment?.personId.value, "query-alice");
    assert.equal(owner.qualification.qualifiedAt.getTime(), instant(2).getTime());
  }
  const noOwner = fixture.query.GetWorkOwner(fixture.workB, instant(8));
  assert.equal(noOwner.status, "QUALIFIED");
  if (noOwner.status === "QUALIFIED") assert.equal(noOwner.assignment, null);

  const emptyParticipants = fixture.query.GetWorkParticipants(fixture.workA, instant(1));
  assert.equal(emptyParticipants.status, "QUALIFIED");
  if (emptyParticipants.status === "QUALIFIED") assert.deepEqual(emptyParticipants.assignments, []);
  const participants = fixture.query.GetWorkParticipants(fixture.workA, instant(5));
  assert.equal(participants.status, "QUALIFIED");
  if (participants.status === "QUALIFIED") {
    assert.deepEqual(
      participants.assignments.map((item) => item.personId.value),
      ["query-alice", "query-bob"],
    );
    assert.equal(participants.assignments.some((item) => item.personId.value === "query-carol"), false);
  }
  const ended = fixture.query.GetWorkParticipants(fixture.workC, instant(8));
  assert.equal(ended.status, "QUALIFIED");
  if (ended.status === "QUALIFIED") assert.deepEqual(ended.assignments, []);

  const contributors = fixture.query.GetWorkContributors(fixture.workA, instant(5));
  assert.equal(contributors.status, "QUALIFIED");
  if (contributors.status === "QUALIFIED") {
    assert.deepEqual(contributors.assignments.map((item) => item.personId.value), ["query-alice"]);
  }
  const reviewersBefore = fixture.query.GetWorkReviewers(fixture.workA, instant(2, 12));
  assert.equal(reviewersBefore.status, "QUALIFIED");
  if (reviewersBefore.status === "QUALIFIED") assert.deepEqual(reviewersBefore.assignments, []);
  const reviewers = fixture.query.GetWorkReviewers(fixture.workA, instant(3));
  assert.equal(reviewers.status, "QUALIFIED");
  if (reviewers.status === "QUALIFIED") {
    assert.deepEqual(reviewers.assignments.map((item) => item.personId.value), ["query-bob"]);
  }
  const approversBefore = fixture.query.GetWorkApprovers(fixture.workA, instant(3, 12));
  assert.equal(approversBefore.status, "QUALIFIED");
  if (approversBefore.status === "QUALIFIED") assert.deepEqual(approversBefore.assignments, []);
  const approvers = fixture.query.GetWorkApprovers(fixture.workA, instant(4));
  assert.equal(approvers.status, "QUALIFIED");
  if (approvers.status === "QUALIFIED") {
    assert.deepEqual(approvers.assignments.map((item) => item.personId.value), ["query-bob"]);
  }
  assert.throws(
    () => fixture.query.GetWorkParticipants(fixture.workA, new Date(Number.NaN)),
    /qualifiedAt must be a valid Date/,
  );
  fixture.database.close();
});

test("GetPersonAssignments navigates multiple authoritative heads and remains coherent after writes", () => {
  const fixture = createFixture();
  const alice = fixture.query.GetPersonAssignments(BusinessPersonId.of("query-alice"));
  assert.equal(alice.status, "QUALIFIED");
  if (alice.status === "QUALIFIED") {
    assert.deepEqual(
      alice.assignments.map((item) => item.workReference.workIdentity),
      ["query-work-a", "query-work-b"],
    );
    assert.ok(alice.assignments.every((item) => item.assignment.personId.value === "query-alice"));
    assert.deepEqual(alice.assignments.map((item) => item.qualification.aggregateRevision), [5, 1]);
  }

  const empty = fixture.query.GetPersonAssignments(
    BusinessPersonId.of("query-without-assignment"),
  );
  assert.equal(empty.status, "QUALIFIED");
  if (empty.status === "QUALIFIED") assert.deepEqual(empty.assignments, []);
  assert.deepEqual(
    fixture.query.GetPersonAssignments(BusinessPersonId.of("query-person-absent")),
    { status: "AGGREGATE_ABSENT" },
  );

  const bob = fixture.store.businessPersons.load("query-bob")!.aggregate;
  const workD = WorkReference.of("query-project", "query-work-d");
  assign(
    fixture.command,
    bob,
    workD,
    "query-assignment-bob-d",
    [BusinessRole.of("CONTRIBUTOR")],
    7,
    0,
  );
  const afterWrite = fixture.query.GetPersonAssignments(BusinessPersonId.of("query-bob"));
  assert.equal(afterWrite.status, "QUALIFIED");
  if (afterWrite.status === "QUALIFIED") {
    assert.deepEqual(
      afterWrite.assignments.map((item) => item.workReference.workIdentity),
      ["query-work-a", "query-work-d"],
    );
  }
  fixture.database.close();
});

test("GetPersonAssignments is restart-safe without a secondary index or source of truth", () => {
  const directory = mkdtempSync(join(tmpdir(), "people-query-restart-"));
  const path = join(directory, "people.sqlite");
  try {
    const firstDatabase = new DatabaseSync(path);
    const fixture = createFixture(firstDatabase);
    firstDatabase.close();

    const restartedDatabase = new DatabaseSync(path);
    const restartedStore = new PeopleAggregatePersistenceStore(restartedDatabase);
    const restarted = new PeopleQueryService(restartedStore).GetPersonAssignments(
      BusinessPersonId.of("query-alice"),
    );
    assert.equal(restarted.status, "QUALIFIED");
    if (restarted.status === "QUALIFIED") {
      assert.deepEqual(
        restarted.assignments.map((item) => item.workReference.workIdentity),
        ["query-work-a", "query-work-b"],
      );
      assert.ok(restarted.assignments.every((item) =>
        restartedStore.workPeople.load(item.workReference)?.aggregate.assignments
          .some((candidate) => candidate.id.equals(item.assignment.id))
      ));
    }
    restartedDatabase.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("GetAssignmentHistory returns real causal events in stream order with pagination", () => {
  const fixture = createFixture();
  const assignmentId = WorkAssignmentId.of("query-assignment-bob-a");
  const persistedHistory = fixture.store.workPeople.readHistory(fixture.workA).events;
  const first = fixture.query.GetAssignmentHistory(assignmentId, 0, 2);
  assert.equal(first.status, "QUALIFIED");
  if (first.status === "QUALIFIED") {
    assert.deepEqual(first.events.map((event) => event.eventType), ["PEOPLE_ASSIGNED", "PARTICIPANT_ADDED"]);
    assert.deepEqual(first.events.map((event) => event.streamSequence), [4, 5]);
    const persistedEventIds = new Set(persistedHistory.map((event) => event.eventId));
    assert.ok(first.events.every((event) => persistedEventIds.has(event.eventId)));
    assert.ok(first.events.every((event) => event.causationId === "assign-query-assignment-bob-a"));
    assert.equal(first.hasMore, true);

    const second = fixture.query.GetAssignmentHistory(assignmentId, first.toSequence, 2);
    assert.equal(second.status, "QUALIFIED");
    if (second.status === "QUALIFIED") {
      assert.deepEqual(second.events.map((event) => event.eventType), ["APPROVER_ASSIGNED"]);
      assert.deepEqual(second.events.map((event) => event.streamSequence), [6]);
      assert.deepEqual(second.events.map((event) => event.causationId), ["approve-query-bob"]);
      assert.equal(second.hasMore, false);
      assert.equal(second.qualification.aggregateRevision, 5);
      assert.equal(second.qualification.lastEventSequence, persistedHistory.at(-1)!.streamSequence);
    }
  }
  assert.deepEqual(
    fixture.query.GetAssignmentHistory(WorkAssignmentId.of("query-assignment-absent")),
    { status: "AGGREGATE_ABSENT" },
  );
  fixture.database.close();
});

test("all queries are read-only and persistence unavailability remains distinct from absence", () => {
  const fixture = createFixture();
  const before = fixture.database.prepare(
    `SELECT
       (SELECT COUNT(*) FROM people_event) AS events,
       (SELECT COUNT(*) FROM people_command_receipt) AS receipts,
       total_changes() AS changes`,
  ).get() as { events: number; receipts: number; changes: number };

  fixture.query.GetBusinessPerson(BusinessPersonId.of("query-alice"));
  fixture.query.GetWorkPeople(fixture.workA);
  fixture.query.GetWorkOwner(fixture.workA, instant(8));
  fixture.query.GetWorkParticipants(fixture.workA, instant(8));
  fixture.query.GetWorkContributors(fixture.workA, instant(8));
  fixture.query.GetWorkReviewers(fixture.workA, instant(8));
  fixture.query.GetWorkApprovers(fixture.workA, instant(8));
  fixture.query.GetPersonAssignments(BusinessPersonId.of("query-alice"));
  fixture.query.GetAssignmentHistory(WorkAssignmentId.of("query-assignment-bob-a"));

  const after = fixture.database.prepare(
    `SELECT
       (SELECT COUNT(*) FROM people_event) AS events,
       (SELECT COUNT(*) FROM people_command_receipt) AS receipts,
       total_changes() AS changes`,
  ).get() as { events: number; receipts: number; changes: number };
  assert.deepEqual(after, before);

  const unavailable = new PeoplePersistenceError(
    "PERSISTENCE_UNAVAILABLE",
    "The PEOPLE source is unavailable for this test.",
  );
  const unavailablePorts: PeoplePersistencePorts = {
    businessPersons: {
      ...fixture.store.businessPersons,
      load: () => { throw unavailable; },
    },
    workPeople: fixture.store.workPeople,
  };
  assert.throws(
    () => new PeopleQueryService(unavailablePorts)
      .GetBusinessPerson(BusinessPersonId.of("query-alice")),
    (error) => error === unavailable
      && error instanceof PeoplePersistenceError
      && error.code === "PERSISTENCE_UNAVAILABLE",
  );
  fixture.database.close();
});

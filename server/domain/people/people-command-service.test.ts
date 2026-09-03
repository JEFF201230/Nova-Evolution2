import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { BusinessPerson } from "./business-person.aggregate.js";
import type {
  AssignApproverCommand,
  AssignBusinessRoleCommand,
  AssignPersonToWorkCommand,
  ChangeWorkOwnerCommand,
  CreateBusinessPersonCommand,
  PeopleAuthorityCommand,
  RemovePersonFromWorkCommand,
  ReplaceAssignedPersonCommand,
  ResumeWorkAssignmentCommand,
  RevokeBusinessRoleCommand,
  SuspendWorkAssignmentCommand,
} from "./people-authority.commands.js";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleCommandService } from "./people-command-service.js";
import { PeopleDomainError } from "./people.errors.js";
import { PeopleAggregatePersistenceStore } from "./people-persistence-aggregate-store.js";
import type { CommitResult } from "./people-persistence-ports.js";
import {
  PeopleIdempotencyConflictError,
  PeoplePersistenceConflictError,
} from "./people-persistence-sqlite-adapter.js";
import {
  AssignmentPeriod,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";
import { WorkPeople } from "./work-people.aggregate.js";

const AUTHORITY = "PEOPLE-COMMANDS-TEST";
const authority = PeopleAuthority.establish(AUTHORITY);
const instant = (day: number): Date => new Date(`2026-08-${String(day).padStart(2, "0")}T09:00:00.000Z`);
const provenance = (cause: string, day: number): PeopleProvenance =>
  PeopleProvenance.of(AUTHORITY, cause, instant(day));

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

function createPerson(
  service: PeopleCommandService,
  personId: string,
  day: number,
  cause = `create-${personId}`,
): BusinessPerson {
  const command: CreateBusinessPersonCommand = {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of(personId),
    provenance: provenance(cause, day),
  };
  const result = execute(service, command, 0);
  assert.ok(result.aggregate instanceof BusinessPerson);
  return result.aggregate;
}

function executeWork(
  service: PeopleCommandService,
  command: Exclude<PeopleAuthorityCommand, CreateBusinessPersonCommand>,
  expectedRevision: number,
  workReference?: WorkReference,
): CommitResult<WorkPeople> {
  const result = execute(service, command, expectedRevision, workReference);
  assert.ok(result.aggregate instanceof WorkPeople);
  return result as CommitResult<WorkPeople>;
}

function activeOwnerCount(aggregate: WorkPeople): number {
  const at = aggregate.provenance.effectiveAt;
  const owner = BusinessRole.of("OWNER");
  return aggregate.assignments.filter((assignment) => assignment.hasRoleAt(owner, at)).length;
}

test("the real command path durably executes the required PEOPLE command lifecycle", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database, {
    now: () => new Date("2026-08-31T12:00:00.000Z"),
  });
  const service = new PeopleCommandService(authority, store);
  const reference = WorkReference.of("project-command-path", "work-command-path");
  const first = createPerson(service, "person-first", 1);
  const second = createPerson(service, "person-second", 2);
  const third = createPerson(service, "person-third", 3);
  assert.deepEqual(
    store.businessPersons.readHistory("person-first").events.map((event) => [
      event.eventType,
      event.causationId,
    ]),
    [["BUSINESS_IDENTITY_RECOGNIZED", "create-person-first"]],
  );

  const assignFirst: AssignPersonToWorkCommand = {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: first,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("assignment-first"),
    roles: [BusinessRole.of("OWNER"), BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(instant(4)),
    provenance: provenance("assign-first", 4),
  };
  const firstCommit = executeWork(service, assignFirst, 0);
  assert.equal(firstCommit.status, "APPLIED");
  assert.equal(firstCommit.revision, 1);
  assert.equal(activeOwnerCount(firstCommit.aggregate), 1);

  const assignSecond: AssignPersonToWorkCommand = {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: second,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("assignment-second"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(instant(5)),
    provenance: provenance("assign-second", 5),
  };
  executeWork(service, assignSecond, 1);

  const roleCommand: AssignBusinessRoleCommand = {
    kind: "ASSIGN_BUSINESS_ROLE",
    assignmentId: WorkAssignmentId.of("assignment-second"),
    role: BusinessRole.of("REVIEWER"),
    period: AssignmentPeriod.startingAt(instant(6)),
    provenance: provenance("grant-reviewer", 6),
  };
  executeWork(service, roleCommand, 2, reference);

  const revokeRoleCommand: RevokeBusinessRoleCommand = {
    kind: "REVOKE_BUSINESS_ROLE",
    assignmentId: WorkAssignmentId.of("assignment-second"),
    role: BusinessRole.of("REVIEWER"),
    provenance: provenance("revoke-reviewer", 7),
  };
  executeWork(service, revokeRoleCommand, 3, reference);

  const ownerCommand: ChangeWorkOwnerCommand = {
    kind: "CHANGE_WORK_OWNER",
    nextOwner: second,
    nextOwnerAssignmentId: WorkAssignmentId.of("assignment-second"),
    provenance: provenance("change-owner", 8),
  };
  const ownerCommit = executeWork(service, ownerCommand, 4, reference);
  assert.equal(activeOwnerCount(ownerCommit.aggregate), 1);
  assert.equal(
    ownerCommit.aggregate.assignments.find((item) => item.id.value === "assignment-second")
      ?.hasRoleAt(BusinessRole.of("OWNER"), instant(8)),
    true,
  );

  const approverCommand: AssignApproverCommand = {
    kind: "ASSIGN_APPROVER",
    assignmentId: WorkAssignmentId.of("assignment-second"),
    period: AssignmentPeriod.startingAt(instant(9)),
    provenance: provenance("assign-approver", 9),
  };
  executeWork(service, approverCommand, 5, reference);

  const replaceCommand: ReplaceAssignedPersonCommand = {
    kind: "REPLACE_ASSIGNED_PERSON",
    replacedAssignmentId: WorkAssignmentId.of("assignment-second"),
    replacementPerson: third,
    replacementAssignmentId: WorkAssignmentId.of("assignment-third"),
    replacementRoles: [BusinessRole.of("OWNER"), BusinessRole.of("CONTRIBUTOR")],
    replacementPeriod: AssignmentPeriod.startingAt(instant(10)),
    provenance: provenance("replace-second", 10),
  };
  const replacement = executeWork(service, replaceCommand, 6, reference);
  assert.equal(activeOwnerCount(replacement.aggregate), 1);

  const suspendCommand: SuspendWorkAssignmentCommand = {
    kind: "SUSPEND_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("assignment-third"),
    provenance: provenance("suspend-third", 11),
  };
  const suspended = executeWork(service, suspendCommand, 7, reference);
  assert.equal(activeOwnerCount(suspended.aggregate), 0);

  const resumeCommand: ResumeWorkAssignmentCommand = {
    kind: "RESUME_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("assignment-third"),
    provenance: provenance("resume-third", 12),
  };
  const resumed = executeWork(service, resumeCommand, 8, reference);
  assert.equal(activeOwnerCount(resumed.aggregate), 1);

  const removeCommand: RemovePersonFromWorkCommand = {
    kind: "REMOVE_PERSON_FROM_WORK",
    assignmentId: WorkAssignmentId.of("assignment-first"),
    provenance: provenance("remove-first", 13),
  };
  const removed = executeWork(service, removeCommand, 9, reference);
  assert.equal(removed.revision, 10);
  assert.equal(activeOwnerCount(removed.aggregate), 1);
  assert.equal(
    removed.aggregate.assignments.find((item) => item.id.value === "assignment-first")?.status.name,
    "ENDED",
  );

  const history = store.workPeople.readHistory(reference);
  assert.deepEqual(
    history.events.map((event) => event.streamSequence),
    history.events.map((_, index) => index + 1),
  );
  const causesByRevision = new Map<number, string>([
    [1, "assign-first"],
    [2, "assign-second"],
    [3, "grant-reviewer"],
    [4, "revoke-reviewer"],
    [5, "change-owner"],
    [6, "assign-approver"],
    [7, "replace-second"],
    [8, "suspend-third"],
    [9, "resume-third"],
    [10, "remove-first"],
  ]);
  assert.ok(history.events.every((event) =>
    event.causationId === causesByRevision.get(event.aggregateRevision)
  ));
  assert.deepEqual(
    history.events.filter((event) => event.aggregateRevision === 1).map((event) => event.eventType),
    ["PEOPLE_ASSIGNED", "OWNER_CHANGED", "PARTICIPANT_ADDED"],
  );
  assert.deepEqual(
    history.events.filter((event) => event.aggregateRevision === 8).map((event) => event.eventType),
    ["OWNER_CHANGED", "ASSIGNMENT_SUSPENDED", "PARTICIPANT_REMOVED"],
  );
  assert.deepEqual(
    history.events.filter((event) => event.aggregateRevision === 9).map((event) => event.eventType),
    ["ASSIGNMENT_RESUMED", "OWNER_CHANGED", "PARTICIPANT_ADDED"],
  );
  assert.equal(history.events.some((event) => event.eventType === "APPROVER_ASSIGNED"), true);
  assert.equal(history.lastRevision, 10);
  database.close();
});

test("persistent replay is deterministic and divergent command ids are rejected", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database, {
    now: () => new Date("2026-08-31T13:00:00.000Z"),
  });
  const service = new PeopleCommandService(authority, store);
  const person = createPerson(service, "person-replay", 1);
  const reference = WorkReference.of("project-replay", "work-replay");
  const command: AssignPersonToWorkCommand = {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("assignment-replay"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(instant(2)),
    provenance: provenance("assign-replay", 2),
  };
  const applied = executeWork(service, command, 0);
  const laterCommand: AssignBusinessRoleCommand = {
    kind: "ASSIGN_BUSINESS_ROLE",
    assignmentId: WorkAssignmentId.of("assignment-replay"),
    role: BusinessRole.of("REVIEWER"),
    period: AssignmentPeriod.startingAt(instant(3)),
    provenance: provenance("later-role", 3),
  };
  executeWork(service, laterCommand, 1, reference);
  const replayed = executeWork(service, command, 0);
  assert.equal(replayed.status, "REPLAYED");
  assert.equal(replayed.revision, applied.revision);
  assert.deepEqual(replayed.eventIds, applied.eventIds);
  assert.equal(replayed.committedAt.getTime(), applied.committedAt.getTime());
  assert.equal(replayed.aggregate.assignments.length, applied.aggregate.assignments.length);
  assert.equal(replayed.aggregate.assignments[0]?.roleAssignments.length, 1);
  assert.equal(store.workPeople.load(reference)?.revision, 2);
  assert.equal(store.workPeople.readHistory(reference).events.length, 3);

  const divergentPayload: AssignPersonToWorkCommand = {
    ...command,
    roles: [BusinessRole.of("OWNER")],
  };
  assert.throws(
    () => executeWork(service, divergentPayload, 0),
    (error: unknown) => error instanceof PeopleIdempotencyConflictError,
  );
  assert.equal(store.workPeople.load(reference)?.revision, 2);

  const divergentCreate: CreateBusinessPersonCommand = {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of("person-divergent"),
    provenance: provenance("create-person-replay", 1),
  };
  assert.throws(
    () => execute(service, divergentCreate, 0),
    (error: unknown) => error instanceof PeopleIdempotencyConflictError,
  );
  assert.equal(store.businessPersons.load("person-divergent"), null);
  database.close();
});

test("stale revisions and Authority failures leave durable state unchanged", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database);
  const service = new PeopleCommandService(authority, store);
  const first = createPerson(service, "person-guard-owner", 1);
  const second = createPerson(service, "person-guard-second", 2);
  const reference = WorkReference.of("project-guard", "work-guard");
  const initial: AssignPersonToWorkCommand = {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: first,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("assignment-guard-owner"),
    roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(instant(3)),
    provenance: provenance("assign-guard-owner", 3),
  };
  executeWork(service, initial, 0);

  const stale: AssignBusinessRoleCommand = {
    kind: "ASSIGN_BUSINESS_ROLE",
    assignmentId: WorkAssignmentId.of("assignment-guard-owner"),
    role: BusinessRole.of("REVIEWER"),
    period: AssignmentPeriod.startingAt(instant(4)),
    provenance: provenance("stale-role", 4),
  };
  assert.throws(
    () => executeWork(service, stale, 0, reference),
    (error: unknown) => error instanceof PeoplePersistenceConflictError
      && error.expectedRevision === 0
      && error.actualRevision === 1,
  );

  const conflictingOwner: AssignPersonToWorkCommand = {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: second,
    workReference: reference,
    assignmentId: WorkAssignmentId.of("assignment-guard-second"),
    roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(instant(5)),
    provenance: provenance("second-owner", 5),
  };
  assert.throws(
    () => executeWork(service, conflictingOwner, 1),
    (error: unknown) => error instanceof PeopleDomainError && error.code === "OWNER_ALREADY_DEFINED",
  );
  assert.equal(store.workPeople.load(reference)?.revision, 1);
  assert.equal(store.workPeople.readHistory(reference).events.length, 3);
  assert.equal(
    Number((database.prepare("SELECT COUNT(*) AS count FROM people_command_receipt WHERE causation_id IN ('stale-role', 'second-owner')").get() as { count: number }).count),
    0,
  );
  database.close();
});

test("a persistence failure rolls back state, events and receipt atomically", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database, {
    beforeReceipt: () => {
      throw new Error("FORCED_PERSISTENCE_FAILURE");
    },
  });
  const service = new PeopleCommandService(authority, store);
  const command: CreateBusinessPersonCommand = {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of("person-rollback"),
    provenance: provenance("create-rollback", 1),
  };
  assert.throws(() => execute(service, command, 0), /FORCED_PERSISTENCE_FAILURE/u);
  assert.equal(store.businessPersons.load("person-rollback"), null);
  for (const table of ["people_business_person", "people_event", "people_command_receipt"]) {
    assert.equal(
      Number((database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number }).count),
      0,
    );
  }
  database.close();
});

test("a restart recovers the durable command result", () => {
  const directory = mkdtempSync(join(tmpdir(), "people-command-path-"));
  const path = join(directory, "people.sqlite");
  const reference = WorkReference.of("project-restart-command", "work-restart-command");
  try {
    const firstDatabase = new DatabaseSync(path);
    const firstStore = new PeopleAggregatePersistenceStore(firstDatabase);
    const firstService = new PeopleCommandService(authority, firstStore);
    const person = createPerson(firstService, "person-restart-command", 1);
    const command: AssignPersonToWorkCommand = {
      kind: "ASSIGN_PERSON_TO_WORK",
      person,
      workReference: reference,
      assignmentId: WorkAssignmentId.of("assignment-restart-command"),
      roles: [BusinessRole.of("OWNER")],
      period: AssignmentPeriod.startingAt(instant(2)),
      provenance: provenance("assign-restart-command", 2),
    };
    executeWork(firstService, command, 0);
    firstDatabase.close();

    const restartedDatabase = new DatabaseSync(path);
    const restartedStore = new PeopleAggregatePersistenceStore(restartedDatabase);
    const loaded = restartedStore.workPeople.load(reference);
    assert.equal(loaded?.revision, 1);
    assert.equal(loaded?.aggregate.assignments[0]?.personId.value, "person-restart-command");
    assert.equal(activeOwnerCount(loaded!.aggregate), 1);
    assert.deepEqual(
      restartedStore.workPeople.readHistory(reference).events.map((event) => event.eventType),
      ["PEOPLE_ASSIGNED", "OWNER_CHANGED", "PARTICIPANT_ADDED"],
    );
    restartedDatabase.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

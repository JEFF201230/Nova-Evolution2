import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import type { BusinessPerson } from "../../domain/people/business-person.aggregate.js";
import { PeopleAuthority } from "../../domain/people/people-authority.js";
import { PeopleCommandService } from "../../domain/people/people-command-service.js";
import {
  canonicalJson,
  serializeBusinessPerson,
  serializeWorkPeople,
} from "../../domain/people/people-persistence-history.js";
import { PeopleAggregatePersistenceStore } from "../../domain/people/people-persistence-aggregate-store.js";
import { PeopleQueryService } from "../../domain/people/people-query-service.js";
import {
  AssignmentPeriod,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "../../domain/people/people.value-objects.js";
import {
  WorkPeopleQuery,
  type WorkPeopleReadSource,
} from "./work-people.query.js";

const AUTHORITY = "WORK-PEOPLE-INTEGRATION-TEST";
const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-PEOPLE-001" });
const instant = (day: number): Date =>
  new Date(`2026-08-${String(day).padStart(2, "0")}T09:00:00.000Z`);
const provenance = (cause: string, day: number): PeopleProvenance =>
  PeopleProvenance.of(AUTHORITY, cause, instant(day));

type Fixture = Readonly<{
  database: DatabaseSync;
  store: PeopleAggregatePersistenceStore;
  query: WorkPeopleQuery;
  workReference: WorkReference;
  person: BusinessPerson;
}>;

function fixture(withAssignment: boolean): Fixture {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database, {
    now: () => instant(31),
  });
  const commands = new PeopleCommandService(
    PeopleAuthority.establish(AUTHORITY),
    store,
  );
  const personResult = commands.execute({
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of("business-person-001"),
    provenance: provenance("recognize-person", 1),
  }, {
    expectedRevision: 0,
    correlationId: "correlation-recognize-person",
  });
  const person = personResult.aggregate as BusinessPerson;
  const workReference = WorkReference.of(WORK.projectId, WORK.workId);

  if (withAssignment) {
    commands.execute({
      kind: "ASSIGN_PERSON_TO_WORK",
      person,
      workReference,
      assignmentId: WorkAssignmentId.of("work-assignment-001"),
      roles: [BusinessRole.of("CONTRIBUTOR")],
      period: AssignmentPeriod.startingAt(instant(2)),
      provenance: provenance("assign-person", 2),
    }, {
      expectedRevision: 0,
      correlationId: "correlation-assign-person",
      workReference,
    });
  }

  return Object.freeze({
    database,
    store,
    query: new WorkPeopleQuery(new PeopleQueryService(store)),
    workReference,
    person,
  });
}

test("T1 qualifies PEOPLE unavailability without fabricating an absence or participants", () => {
  const unavailable: WorkPeopleReadSource = {
    GetWorkParticipants: () => {
      throw new Error("PEOPLE persistence is unavailable");
    },
  };

  const result = new WorkPeopleQuery(unavailable).get(WORK, instant(3));

  assert.deepEqual(result, {
    ...WORK,
    status: "PEOPLE_UNAVAILABLE",
    sourceDomain: "PEOPLE",
    reason: "PEOPLE_READ_UNAVAILABLE",
  });
  assert.equal("participants" in result, false);
});

test("T2 distinguishes an absent WorkPeople while PEOPLE is available", () => {
  const current = fixture(false);
  try {
    const result = current.query.get(WORK, instant(3));
    assert.deepEqual(result, {
      ...WORK,
      status: "WORK_PEOPLE_ABSENT",
      sourceDomain: "PEOPLE",
    });
  } finally {
    current.database.close();
  }
});

test("T3 represents an existing WorkPeople with zero active Participant as valid empty data", () => {
  const current = fixture(true);
  try {
    const result = current.query.get(WORK, instant(1));
    assert.equal(result.status, "NO_ACTIVE_PARTICIPANTS");
    if (result.status === "NO_ACTIVE_PARTICIPANTS") {
      assert.deepEqual(result.participants, []);
      assert.equal(result.qualification.sourceDomain, "PEOPLE");
      assert.equal(result.qualification.qualifiedAt, instant(1).toISOString());
    }
  } finally {
    current.database.close();
  }
});

test("T4 returns only identifiers qualified as active Participants by PEOPLE", () => {
  const current = fixture(true);
  try {
    const result = current.query.get(WORK, instant(3));
    assert.equal(result.status, "PARTICIPANTS_AVAILABLE");
    if (result.status === "PARTICIPANTS_AVAILABLE") {
      assert.deepEqual(result.participants, [{
        businessPersonId: "business-person-001",
        workAssignmentId: "work-assignment-001",
      }]);
      assert.equal(result.qualification.sourceDomain, "PEOPLE");
      assert.equal(result.qualification.provenance.authority, AUTHORITY);
      assert.equal(result.qualification.provenance.businessCause, "assign-person");
      assert.deepEqual(Object.keys(result.participants[0]!).sort(), [
        "businessPersonId",
        "workAssignmentId",
      ]);
    }
  } finally {
    current.database.close();
  }
});

test("T6 delegates temporal qualification to the certified PEOPLE query", () => {
  const current = fixture(true);
  try {
    const before = current.query.get(WORK, instant(1));
    const during = current.query.get(WORK, instant(3));

    assert.equal(before.status, "NO_ACTIVE_PARTICIPANTS");
    assert.equal(during.status, "PARTICIPANTS_AVAILABLE");
    if (
      before.status === "NO_ACTIVE_PARTICIPANTS"
      && during.status === "PARTICIPANTS_AVAILABLE"
    ) {
      assert.equal(before.qualification.qualifiedAt, instant(1).toISOString());
      assert.equal(during.qualification.qualifiedAt, instant(3).toISOString());
    }
  } finally {
    current.database.close();
  }
});

test("T7 reads without commands, events or a Work-owned PEOPLE copy", () => {
  const current = fixture(true);
  try {
    const personBefore = canonicalJson(serializeBusinessPerson(
      current.store.businessPersons.load(current.person.id.value)!.aggregate,
    ));
    const workBefore = canonicalJson(serializeWorkPeople(
      current.store.workPeople.load(current.workReference)!.aggregate,
    ));
    const historyBefore = current.store.workPeople.readHistory(
      current.workReference,
    );

    const result = current.query.get(WORK, instant(3));

    assert.equal(result.status, "PARTICIPANTS_AVAILABLE");
    assert.equal(canonicalJson(serializeBusinessPerson(
      current.store.businessPersons.load(current.person.id.value)!.aggregate,
    )), personBefore);
    assert.equal(canonicalJson(serializeWorkPeople(
      current.store.workPeople.load(current.workReference)!.aggregate,
    )), workBefore);
    assert.deepEqual(
      current.store.workPeople.readHistory(current.workReference),
      historyBefore,
    );
    assert.deepEqual(Object.keys(current.query), ["people"]);
  } finally {
    current.database.close();
  }
});

test("T8 never substitutes a Technical Agent for a Business Person", () => {
  const technicalAgent = Object.freeze({
    agentId: "business-person-001",
    missionTypes: Object.freeze(["WORK"]),
    authorizedScopes: Object.freeze(["server/runtime/work"]),
  });
  const unavailable: WorkPeopleReadSource = {
    GetWorkParticipants: () => {
      throw new Error("PEOPLE is unavailable");
    },
  };

  const result = new WorkPeopleQuery(unavailable).get(WORK, instant(3));

  assert.equal(technicalAgent.agentId, "business-person-001");
  assert.equal(result.status, "PEOPLE_UNAVAILABLE");
  assert.equal(JSON.stringify(result).includes(technicalAgent.agentId), false);
  assert.equal("agent" in result, false);
  assert.equal("businessPersonId" in result, false);
});

test("invalid temporal input is rejected before consulting PEOPLE", () => {
  let reads = 0;
  const source: WorkPeopleReadSource = {
    GetWorkParticipants: () => {
      reads += 1;
      throw new Error("must not be reached");
    },
  };

  assert.throws(
    () => new WorkPeopleQuery(source).get(WORK, new Date(Number.NaN)),
    RangeError,
  );
  assert.equal(reads, 0);
});

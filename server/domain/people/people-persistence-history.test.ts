import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { PeopleAuthority } from "./people-authority.js";
import { PeopleAggregatePersistenceStore, createPeopleRequestFingerprint } from "./people-persistence-aggregate-store.js";
import { PeopleHistoryCorruptedError } from "./people-persistence-history.js";
import type { CommandEnvelope } from "./people-persistence-ports.js";
import { AssignmentPeriod, BusinessPersonId, BusinessRole, PeopleProvenance, WorkAssignmentId, WorkReference } from "./people.value-objects.js";

const authority = PeopleAuthority.establish("HISTORY-TEST");
const provenance = (cause: string, day: number) => PeopleProvenance.of("HISTORY-TEST", cause, new Date(Date.UTC(2026, 3, day)));
const envelope = (kind: string, source: PeopleProvenance): CommandEnvelope => ({
  commandType: kind, causationId: source.businessCause, correlationId: "history-correlation",
  requestFingerprint: createPeopleRequestFingerprint({ kind, cause: source.businessCause }),
  fingerprintVersion: 1, provenance: source, occurredAt: source.effectiveAt,
});

test("append-only history supports bounded reads and rehydration at an exact revision", () => {
  const database = new DatabaseSync(":memory:");
  const store = new PeopleAggregatePersistenceStore(database);
  const people = ["history-owner", "history-reviewer"].map((id, index) => {
    const source = provenance(`recognize-${id}`, index + 1);
    const change = authority.createBusinessPerson(null, {
      kind: "CREATE_BUSINESS_PERSON", personId: BusinessPersonId.of(id), provenance: source,
    });
    return store.businessPersons.commit(0, change, envelope("CREATE_BUSINESS_PERSON", source)).aggregate;
  });
  const reference = WorkReference.of("history-project", "history-work");
  const firstAt = provenance("history-first", 3);
  const first = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK", person: people[0]!, workReference: reference,
    assignmentId: WorkAssignmentId.of("history-assignment-1"), roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(firstAt.effectiveAt), provenance: firstAt,
  });
  const revisionOne = store.workPeople.commit(0, first, envelope("ASSIGN_PERSON_TO_WORK", firstAt));
  const secondAt = provenance("history-second", 4);
  const second = authority.assignPersonToWork(revisionOne.aggregate, {
    kind: "ASSIGN_PERSON_TO_WORK", person: people[1]!, workReference: reference,
    assignmentId: WorkAssignmentId.of("history-assignment-2"), roles: [BusinessRole.of("REVIEWER")],
    period: AssignmentPeriod.startingAt(secondAt.effectiveAt), provenance: secondAt,
  });
  const revisionTwo = store.workPeople.commit(1, second, envelope("ASSIGN_PERSON_TO_WORK", secondAt));
  assert.equal(store.workPeople.rehydrate(reference, 1)?.aggregate.assignments.length, 1);
  assert.equal(store.workPeople.rehydrate(reference, 2)?.aggregate.assignments.length, 2);
  const firstPage = store.workPeople.readHistory(reference, 0, 2);
  const secondPage = store.workPeople.readHistory(reference, firstPage.toSequence, 10);
  assert.equal(firstPage.hasMore, true);
  assert.deepEqual([...firstPage.events, ...secondPage.events].map((event) => event.streamSequence), [1, 2, 3, 4, 5]);

  assert.throws(() => database.prepare("DELETE FROM people_event WHERE stream_sequence = 1").run());
  assert.throws(() => database.prepare("UPDATE people_event SET stream_sequence = 99 WHERE stream_sequence = 1").run());
  const corruptionAt = provenance("history-after-corruption", 5);
  const blockedChange = authority.suspendWorkAssignment(revisionTwo.aggregate, {
    kind: "SUSPEND_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("history-assignment-2"),
    provenance: corruptionAt,
  });
  database.prepare(
    `UPDATE people_work_people SET revision = revision + 1, updated_at_epoch_ms = updated_at_epoch_ms + 1
      WHERE project_identity = ? AND work_identity = ?`,
  ).run(reference.projectIdentity, reference.workIdentity);
  assert.throws(() => store.workPeople.load(reference), PeopleHistoryCorruptedError);
  assert.throws(() => store.workPeople.commit(3, blockedChange, envelope("SUSPEND_WORK_ASSIGNMENT", corruptionAt)), PeopleHistoryCorruptedError);
  database.close();
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  AssignmentPeriod,
  BusinessPerson,
  BusinessPersonId,
  BusinessRole,
  PeopleDomainError,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./index.js";
import { PeopleAuthority } from "./people-authority.js";

const authority = PeopleAuthority.establish("NOVA_PEOPLE_AUTHORITY");
const workReference = WorkReference.of("project-1", "work-1");

test("Foundation index excludes Authority artifacts", async () => {
  const source = await readFile(new URL("./index.ts", import.meta.url), "utf8");
  const forbidden = [
    /\bPeopleAuthority\b/u,
    /\bPeopleAuthorityResult\b/u,
    /people-authority\.commands/u,
    /people-authority\.events/u,
    /people-authority\.guard/u,
  ];
  if (forbidden.some((pattern) => pattern.test(source))) {
    throw new Error("FOUNDATION_INDEX_CONTAMINATED");
  }
});

function provenance(cause: string, instant: string): PeopleProvenance {
  return PeopleProvenance.of(
    authority.authority,
    cause,
    new Date(instant),
  );
}

function recognize(
  personId: string,
  cause: string,
  instant = "2026-07-30T08:00:00.000Z",
) {
  return authority.createBusinessPerson(null, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of(personId),
    provenance: provenance(cause, instant),
  });
}

test("PeopleAuthority is the only aggregate construction path", () => {
  const source = provenance(
    "recognize-person-guard",
    "2026-07-30T08:00:00.000Z",
  );

  assert.throws(
    () =>
      BusinessPerson.recognize(
        { scope: "PEOPLE_AUTHORITY" } as never,
        BusinessPersonId.of("person-guard"),
        source,
      ),
    (error: unknown) =>
      error instanceof PeopleDomainError
      && error.code === "ASSIGNMENT_CONFLICT",
  );

  const produced = authority.createBusinessPerson(null, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of("person-guard"),
    provenance: source,
  });
  assert.equal(produced.aggregate.id.value, "person-guard");
  assert.deepEqual(
    produced.events.map((event) => event.name),
    ["BUSINESS_IDENTITY_RECOGNIZED"],
  );
});

test("recognition is idempotent for identical identity and causality", () => {
  const first = recognize("person-idempotent", "recognize-idempotent");
  const replay = authority.createBusinessPerson(first.aggregate, {
    kind: "CREATE_BUSINESS_PERSON",
    personId: BusinessPersonId.of("person-idempotent"),
    provenance: first.aggregate.recognitionProvenance,
  });

  assert.equal(replay.aggregate, first.aggregate);
  assert.deepEqual(replay.events, []);
  assert.throws(
    () =>
      authority.createBusinessPerson(first.aggregate, {
        kind: "CREATE_BUSINESS_PERSON",
        personId: BusinessPersonId.of("person-idempotent"),
        provenance: provenance(
          "different-cause",
          "2026-07-30T08:01:00.000Z",
        ),
      }),
    (error: unknown) =>
      error instanceof PeopleDomainError
      && error.code === "BUSINESS_PERSON_ALREADY_EXISTS",
  );
});

test("assignment applies aggregate invariants and emits ordered facts", () => {
  const person = recognize("person-owner", "recognize-owner").aggregate;
  const assignedAt = provenance(
    "assign-owner",
    "2026-07-30T09:00:00.000Z",
  );
  const assignment = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference,
    assignmentId: WorkAssignmentId.of("assignment-owner"),
    roles: [BusinessRole.of("OWNER")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });

  assert.equal(assignment.aggregate.assignments.length, 1);
  assert.equal(assignment.aggregate.activeAssignments.length, 1);
  assert.deepEqual(
    assignment.events.map((event) => event.name),
    ["PEOPLE_ASSIGNED", "OWNER_CHANGED", "PARTICIPANT_ADDED"],
  );
  assert.ok(Object.isFrozen(assignment.aggregate));
  assert.ok(Object.isFrozen(assignment.events));

  const secondPerson = recognize(
    "person-second-owner",
    "recognize-second-owner",
  ).aggregate;
  const conflictingAt = provenance(
    "assign-second-owner",
    "2026-07-30T09:10:00.000Z",
  );
  assert.throws(
    () =>
      authority.assignPersonToWork(assignment.aggregate, {
        kind: "ASSIGN_PERSON_TO_WORK",
        person: secondPerson,
        workReference,
        assignmentId: WorkAssignmentId.of("assignment-second-owner"),
        roles: [BusinessRole.of("OWNER")],
        period: AssignmentPeriod.startingAt(conflictingAt.effectiveAt),
        provenance: conflictingAt,
      }),
    (error: unknown) =>
      error instanceof PeopleDomainError
      && error.code === "OWNER_ALREADY_DEFINED",
  );
});

test("specialized role events are emitted without generic duplicates", () => {
  const person = recognize(
    "person-roles",
    "recognize-roles",
  ).aggregate;
  const assignedAt = provenance(
    "assign-contributor",
    "2026-07-30T10:00:00.000Z",
  );
  const assigned = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference,
    assignmentId: WorkAssignmentId.of("assignment-roles"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });
  const approverAt = provenance(
    "grant-approver",
    "2026-07-30T10:05:00.000Z",
  );
  const approver = authority.assignApprover(assigned.aggregate, {
    kind: "ASSIGN_APPROVER",
    assignmentId: WorkAssignmentId.of("assignment-roles"),
    period: AssignmentPeriod.startingAt(approverAt.effectiveAt),
    provenance: approverAt,
  });

  assert.deepEqual(
    approver.events.map((event) => event.name),
    ["APPROVER_ASSIGNED"],
  );
  assert.equal(
    approver.events.some((event) => event.name === "ROLE_GRANTED"),
    false,
  );
});

test("suspension, resumption and removal remain producer-only transitions", () => {
  const person = recognize(
    "person-lifecycle",
    "recognize-lifecycle",
  ).aggregate;
  const assignedAt = provenance(
    "assign-lifecycle",
    "2026-07-30T11:00:00.000Z",
  );
  const assigned = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference,
    assignmentId: WorkAssignmentId.of("assignment-lifecycle"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });
  const suspended = authority.suspendWorkAssignment(assigned.aggregate, {
    kind: "SUSPEND_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("assignment-lifecycle"),
    provenance: provenance(
      "suspend-lifecycle",
      "2026-07-30T11:10:00.000Z",
    ),
  });
  assert.equal(suspended.aggregate.assignments[0]?.status.name, "SUSPENDED");
  assert.deepEqual(
    suspended.events.map((event) => event.name),
    ["ASSIGNMENT_SUSPENDED", "PARTICIPANT_REMOVED"],
  );

  const resumed = authority.resumeWorkAssignment(suspended.aggregate, {
    kind: "RESUME_WORK_ASSIGNMENT",
    assignmentId: WorkAssignmentId.of("assignment-lifecycle"),
    provenance: provenance(
      "resume-lifecycle",
      "2026-07-30T11:20:00.000Z",
    ),
  });
  assert.equal(resumed.aggregate.assignments[0]?.status.name, "ACTIVE");
  assert.deepEqual(
    resumed.events.map((event) => event.name),
    ["ASSIGNMENT_RESUMED", "PARTICIPANT_ADDED"],
  );

  const removed = authority.removePersonFromWork(resumed.aggregate, {
    kind: "REMOVE_PERSON_FROM_WORK",
    assignmentId: WorkAssignmentId.of("assignment-lifecycle"),
    provenance: provenance(
      "remove-lifecycle",
      "2026-07-30T11:30:00.000Z",
    ),
  });
  assert.equal(removed.aggregate.assignments[0]?.status.name, "ENDED");
  assert.deepEqual(
    removed.events.map((event) => event.name),
    ["ROLE_REVOKED", "PARTICIPANT_REMOVED", "PEOPLE_REMOVED"],
  );
});

test("foreign authority provenance is rejected and emits no fact", () => {
  assert.throws(
    () =>
      authority.createBusinessPerson(null, {
        kind: "CREATE_BUSINESS_PERSON",
        personId: BusinessPersonId.of("person-foreign"),
        provenance: PeopleProvenance.of(
          "RUNTIME_AGENT",
          "technical-source",
          new Date("2026-07-30T12:00:00.000Z"),
        ),
      }),
    (error: unknown) =>
      error instanceof PeopleDomainError
      && error.code === "TECHNICAL_IDENTITY_SOURCE_FORBIDDEN",
  );
});

test("role revocation and owner change remain atomic producer operations", () => {
  const first = recognize("person-first", "recognize-first").aggregate;
  const second = recognize("person-second", "recognize-second").aggregate;
  const firstAt = provenance(
    "assign-first",
    "2026-07-30T13:00:00.000Z",
  );
  const firstAssigned = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: first,
    workReference,
    assignmentId: WorkAssignmentId.of("assignment-first"),
    roles: [
      BusinessRole.of("CONTRIBUTOR"),
      BusinessRole.of("REVIEWER"),
    ],
    period: AssignmentPeriod.startingAt(firstAt.effectiveAt),
    provenance: firstAt,
  });
  const secondAt = provenance(
    "assign-second",
    "2026-07-30T13:01:00.000Z",
  );
  const secondAssigned = authority.assignPersonToWork(
    firstAssigned.aggregate,
    {
      kind: "ASSIGN_PERSON_TO_WORK",
      person: second,
      workReference,
      assignmentId: WorkAssignmentId.of("assignment-second"),
      roles: [BusinessRole.of("CONTRIBUTOR")],
      period: AssignmentPeriod.startingAt(secondAt.effectiveAt),
      provenance: secondAt,
    },
  );
  const revoked = authority.revokeBusinessRole(secondAssigned.aggregate, {
    kind: "REVOKE_BUSINESS_ROLE",
    assignmentId: WorkAssignmentId.of("assignment-first"),
    role: BusinessRole.of("REVIEWER"),
    provenance: provenance(
      "revoke-reviewer",
      "2026-07-30T13:05:00.000Z",
    ),
  });
  assert.deepEqual(
    revoked.events.map((event) => event.name),
    ["ROLE_REVOKED"],
  );

  const owner = authority.changeWorkOwner(revoked.aggregate, {
    kind: "CHANGE_WORK_OWNER",
    nextOwner: second,
    nextOwnerAssignmentId: WorkAssignmentId.of("assignment-second"),
    provenance: provenance(
      "change-owner",
      "2026-07-30T13:10:00.000Z",
    ),
  });
  assert.deepEqual(
    owner.events.map((event) => event.name),
    ["OWNER_CHANGED"],
  );
  assert.equal(
    owner.aggregate.assignments.filter((assignment) =>
      assignment.hasRoleAt(
        BusinessRole.of("OWNER"),
        new Date("2026-07-30T13:10:00.000Z"),
      )
    ).length,
    1,
  );
});

test("replacement is atomic and preserves separate assignment histories", () => {
  const source = recognize(
    "person-replaced",
    "recognize-replaced",
  ).aggregate;
  const replacement = recognize(
    "person-replacement",
    "recognize-replacement",
  ).aggregate;
  const assignedAt = provenance(
    "assign-replaced",
    "2026-07-30T14:00:00.000Z",
  );
  const assigned = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person: source,
    workReference,
    assignmentId: WorkAssignmentId.of("assignment-replaced"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });
  const replacedAt = provenance(
    "replace-person",
    "2026-07-30T14:10:00.000Z",
  );
  const replaced = authority.replaceAssignedPerson(assigned.aggregate, {
    kind: "REPLACE_ASSIGNED_PERSON",
    replacedAssignmentId: WorkAssignmentId.of("assignment-replaced"),
    replacementPerson: replacement,
    replacementAssignmentId: WorkAssignmentId.of("assignment-replacement"),
    replacementRoles: [BusinessRole.of("CONTRIBUTOR")],
    replacementPeriod: AssignmentPeriod.startingAt(replacedAt.effectiveAt),
    provenance: replacedAt,
  });

  assert.equal(replaced.aggregate.assignments.length, 2);
  assert.equal(replaced.aggregate.assignments[0]?.status.name, "ENDED");
  assert.equal(replaced.aggregate.assignments[1]?.status.name, "ACTIVE");
  assert.deepEqual(
    replaced.events.map((event) => event.name),
    [
      "ROLE_REVOKED",
      "PARTICIPANT_REMOVED",
      "PEOPLE_REMOVED",
      "PEOPLE_ASSIGNED",
      "PARTICIPANT_ADDED",
    ],
  );
});

test("reused causality with different command content is rejected", () => {
  const person = recognize(
    "person-causality",
    "recognize-causality",
  ).aggregate;
  const assignedAt = provenance(
    "stable-cause",
    "2026-07-30T15:00:00.000Z",
  );
  const assigned = authority.assignPersonToWork(null, {
    kind: "ASSIGN_PERSON_TO_WORK",
    person,
    workReference,
    assignmentId: WorkAssignmentId.of("assignment-causality"),
    roles: [BusinessRole.of("CONTRIBUTOR")],
    period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
    provenance: assignedAt,
  });

  assert.throws(
    () =>
      authority.assignPersonToWork(assigned.aggregate, {
        kind: "ASSIGN_PERSON_TO_WORK",
        person,
        workReference,
        assignmentId: WorkAssignmentId.of("different-assignment"),
        roles: [BusinessRole.of("CONTRIBUTOR")],
        period: AssignmentPeriod.startingAt(assignedAt.effectiveAt),
        provenance: assignedAt,
      }),
    (error: unknown) =>
      error instanceof PeopleDomainError
      && error.code === "ASSIGNMENT_CONFLICT",
  );
});

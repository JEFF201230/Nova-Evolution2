import { PeopleDomainError } from "./people.errors.js";
import {
  assertPeopleAuthorityAccess,
  type PeopleAuthorityAccess,
} from "./people-foundation-access.js";
import { WorkAssignment } from "./work-assignment.entity.js";
import {
  BusinessRole,
  PeopleProvenance,
  WorkReference,
} from "./people.value-objects.js";

const OWNER_ROLE = BusinessRole.of("OWNER");

export class WorkPeople {
  private readonly canonicalAssignments: readonly WorkAssignment[];

  private constructor(
    readonly workReference: WorkReference,
    assignments: readonly WorkAssignment[],
    readonly provenance: PeopleProvenance,
  ) {
    this.canonicalAssignments = Object.freeze([...assignments]);
    Object.freeze(this);
  }

  static establish(
    access: PeopleAuthorityAccess,
    workReference: WorkReference,
    assignments: readonly WorkAssignment[],
    provenance: PeopleProvenance,
  ): WorkPeople {
    assertPeopleAuthorityAccess(access);
    if (assignments.length === 0) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "WorkPeople is established only by its first WorkAssignment.",
      );
    }

    assertUniqueAssignmentIds(assignments);
    assertNoConcurrentAssignmentsForPerson(assignments);
    assertAssignmentsObserved(assignments, provenance);
    assertUniqueCurrentOwner(assignments, provenance.effectiveAt);

    return new WorkPeople(workReference, assignments, provenance);
  }

  get assignments(): readonly WorkAssignment[] {
    return this.canonicalAssignments;
  }

  get activeAssignments(): readonly WorkAssignment[] {
    const observedAt = this.provenance.effectiveAt;
    return Object.freeze(
      this.canonicalAssignments.filter((assignment) =>
        assignment.isParticipantAt(observedAt)
      ),
    );
  }
}

function assertUniqueAssignmentIds(
  assignments: readonly WorkAssignment[],
): void {
  const identifiers = new Set<string>();
  for (const assignment of assignments) {
    if (identifiers.has(assignment.id.value)) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        `${assignment.id.value} is a duplicated WorkAssignmentId.`,
      );
    }
    identifiers.add(assignment.id.value);
  }
}

function assertNoConcurrentAssignmentsForPerson(
  assignments: readonly WorkAssignment[],
): void {
  const currentPeople = new Set<string>();
  for (const assignment of assignments) {
    if (!assignment.isCurrent) {
      continue;
    }
    if (currentPeople.has(assignment.personId.value)) {
      throw new PeopleDomainError(
        "PERSON_ALREADY_ASSIGNED",
        "A Business Person can have only one current Assignment per Work.",
      );
    }
    currentPeople.add(assignment.personId.value);
  }
}

function assertAssignmentsObserved(
  assignments: readonly WorkAssignment[],
  provenance: PeopleProvenance,
): void {
  const aggregateObservedAt = provenance.effectiveAt;
  const observedAt = aggregateObservedAt.getTime();
  for (const assignment of assignments) {
    if (assignment.observedAt.getTime() > observedAt) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "WorkPeople cannot precede the state of one of its Assignments.",
      );
    }
    if (assignment.isCurrent && !assignment.period.contains(aggregateObservedAt)) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "A current WorkAssignment must cover the WorkPeople observation date.",
      );
    }
    if (
      assignment.status.name === "ACTIVE"
      && !assignment.roleAssignments.some((role) =>
        role.isEffectiveAt(aggregateObservedAt)
      )
    ) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "An ACTIVE WorkAssignment requires an effective role at observation.",
      );
    }
  }
}

function assertUniqueCurrentOwner(
  assignments: readonly WorkAssignment[],
  observedAt: Date,
): void {
  const owners = assignments.filter((assignment) =>
    assignment.hasRoleAt(OWNER_ROLE, observedAt)
  );
  if (owners.length > 1) {
    throw new PeopleDomainError(
      "OWNER_ALREADY_DEFINED",
      "A Work can have at most one active Owner.",
    );
  }
}

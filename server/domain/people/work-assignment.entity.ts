import { PeopleDomainError } from "./people.errors.js";
import {
  assertPeopleAuthorityAccess,
  type PeopleAuthorityAccess,
} from "./people-foundation-access.js";
import { RoleAssignment } from "./role-assignment.entity.js";
import {
  AssignmentPeriod,
  AssignmentStatus,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
} from "./people.value-objects.js";

export class WorkAssignment {
  private readonly canonicalRoleAssignments: readonly RoleAssignment[];
  private readonly canonicalProvenanceTrail: readonly PeopleProvenance[];

  private constructor(
    readonly id: WorkAssignmentId,
    readonly personId: BusinessPersonId,
    readonly period: AssignmentPeriod,
    readonly status: AssignmentStatus,
    roleAssignments: readonly RoleAssignment[],
    provenanceTrail: readonly PeopleProvenance[],
  ) {
    this.canonicalRoleAssignments = Object.freeze([...roleAssignments]);
    this.canonicalProvenanceTrail = Object.freeze([...provenanceTrail]);
    Object.freeze(this);
  }

  static create(
    access: PeopleAuthorityAccess,
    id: WorkAssignmentId,
    personId: BusinessPersonId,
    period: AssignmentPeriod,
    status: AssignmentStatus,
    roleAssignments: readonly RoleAssignment[],
    provenanceTrail: readonly PeopleProvenance[],
  ): WorkAssignment {
    assertPeopleAuthorityAccess(access);
    if (roleAssignments.length === 0) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "WorkAssignment requires at least one historical BusinessRole.",
      );
    }
    if (provenanceTrail.length === 0) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "WorkAssignment requires authoritative provenance.",
      );
    }

    assertCanonicalProvenance(provenanceTrail);
    assertRoleAssignments(id, period, roleAssignments);
    assertStatusCoherence(
      period,
      status,
      roleAssignments,
      lastProvenance(provenanceTrail).effectiveAt,
    );

    return new WorkAssignment(
      id,
      personId,
      period,
      status,
      roleAssignments,
      provenanceTrail,
    );
  }

  get roleAssignments(): readonly RoleAssignment[] {
    return this.canonicalRoleAssignments;
  }

  get provenanceTrail(): readonly PeopleProvenance[] {
    return this.canonicalProvenanceTrail;
  }

  get observedAt(): Date {
    return lastProvenance(this.canonicalProvenanceTrail).effectiveAt;
  }

  get isCurrent(): boolean {
    return this.status.name !== "ENDED";
  }

  isParticipantAt(instant: Date): boolean {
    return this.status.name === "ACTIVE" && this.period.contains(instant);
  }

  hasRoleAt(role: BusinessRole, instant: Date): boolean {
    return (
      this.isParticipantAt(instant)
      && this.canonicalRoleAssignments.some(
        (assignment) =>
          assignment.role.equals(role)
          && assignment.isEffectiveAt(instant),
      )
    );
  }
}

function assertCanonicalProvenance(
  provenanceTrail: readonly PeopleProvenance[],
): void {
  for (let index = 1; index < provenanceTrail.length; index += 1) {
    const previous = provenanceTrail[index - 1];
    const current = provenanceTrail[index];
    if (
      previous === undefined
      || current === undefined
      || previous.effectiveAt.getTime() > current.effectiveAt.getTime()
    ) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "WorkAssignment provenance must remain in causal order.",
      );
    }
  }
}

function assertRoleAssignments(
  assignmentId: WorkAssignmentId,
  assignmentPeriod: AssignmentPeriod,
  roleAssignments: readonly RoleAssignment[],
): void {
  const roles = new Set<string>();
  for (const roleAssignment of roleAssignments) {
    if (!roleAssignment.assignmentId.equals(assignmentId)) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "RoleAssignment belongs to a different WorkAssignment.",
      );
    }
    if (roles.has(roleAssignment.role.name)) {
      throw new PeopleDomainError(
        "ROLE_ALREADY_ASSIGNED",
        `${roleAssignment.role.name} is duplicated in the WorkAssignment.`,
      );
    }
    roles.add(roleAssignment.role.name);
    for (const rolePeriod of roleAssignment.periods) {
      if (!assignmentPeriod.encloses(rolePeriod)) {
        throw new PeopleDomainError(
          "INVALID_ASSIGNMENT_PERIOD",
          "RoleAssignment periods must remain inside their WorkAssignment.",
        );
      }
    }
  }
}

function assertStatusCoherence(
  period: AssignmentPeriod,
  status: AssignmentStatus,
  roleAssignments: readonly RoleAssignment[],
  observedAt: Date,
): void {
  const assignmentContainsObservation = period.contains(observedAt);
  const assignmentEndedBeforeObservation =
    period.effectiveUntil !== null
    && period.effectiveUntil.getTime() <= observedAt.getTime();

  if (status.name === "ACTIVE") {
    if (
      !assignmentContainsObservation
      || !roleAssignments.some((role) => role.isEffectiveAt(observedAt))
    ) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "An ACTIVE WorkAssignment requires an effective period and role.",
      );
    }
    return;
  }

  if (status.name === "SUSPENDED") {
    if (!assignmentContainsObservation) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "A SUSPENDED WorkAssignment must remain inside its effective period.",
      );
    }
    return;
  }

  if (!assignmentEndedBeforeObservation) {
    throw new PeopleDomainError(
      "ASSIGNMENT_CONFLICT",
      "An ENDED WorkAssignment requires a completed effective period.",
    );
  }
}

function lastProvenance(
  provenanceTrail: readonly PeopleProvenance[],
): PeopleProvenance {
  const provenance = provenanceTrail[provenanceTrail.length - 1];
  if (provenance === undefined) {
    throw new PeopleDomainError(
      "ASSIGNMENT_CONFLICT",
      "WorkAssignment provenance is required.",
    );
  }
  return provenance;
}

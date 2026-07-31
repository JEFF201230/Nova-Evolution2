import { PeopleDomainError } from "./people.errors.js";
import {
  assertPeopleAuthorityAccess,
  type PeopleAuthorityAccess,
} from "./people-foundation-access.js";
import {
  AssignmentPeriod,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
} from "./people.value-objects.js";

export class RoleAssignment {
  private readonly canonicalPeriods: readonly AssignmentPeriod[];
  private readonly canonicalProvenanceTrail: readonly PeopleProvenance[];

  private constructor(
    readonly assignmentId: WorkAssignmentId,
    readonly role: BusinessRole,
    periods: readonly AssignmentPeriod[],
    provenanceTrail: readonly PeopleProvenance[],
  ) {
    this.canonicalPeriods = Object.freeze([...periods]);
    this.canonicalProvenanceTrail = Object.freeze([...provenanceTrail]);
    Object.freeze(this);
  }

  static create(
    access: PeopleAuthorityAccess,
    assignmentId: WorkAssignmentId,
    role: BusinessRole,
    periods: readonly AssignmentPeriod[],
    provenanceTrail: readonly PeopleProvenance[],
  ): RoleAssignment {
    assertPeopleAuthorityAccess(access);
    if (periods.length === 0) {
      throw new PeopleDomainError(
        "ROLE_NOT_ASSIGNED",
        "RoleAssignment requires at least one effective period.",
      );
    }
    if (provenanceTrail.length === 0) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "RoleAssignment requires authoritative provenance.",
      );
    }

    assertCanonicalPeriods(periods);
    assertCanonicalProvenance(provenanceTrail);
    assertBoundariesHaveProvenance(periods, provenanceTrail);

    return new RoleAssignment(
      assignmentId,
      role,
      periods,
      provenanceTrail,
    );
  }

  get periods(): readonly AssignmentPeriod[] {
    return this.canonicalPeriods;
  }

  get provenanceTrail(): readonly PeopleProvenance[] {
    return this.canonicalProvenanceTrail;
  }

  isEffectiveAt(instant: Date): boolean {
    return this.canonicalPeriods.some((period) => period.contains(instant));
  }

  hasSameIdentity(other: RoleAssignment): boolean {
    return (
      this.assignmentId.equals(other.assignmentId)
      && this.role.equals(other.role)
    );
  }
}

function assertCanonicalPeriods(
  periods: readonly AssignmentPeriod[],
): void {
  for (let index = 1; index < periods.length; index += 1) {
    const previous = periods[index - 1];
    const current = periods[index];
    if (
      previous === undefined
      || current === undefined
      || previous.overlaps(current)
      || previous.effectiveFrom.getTime() >= current.effectiveFrom.getTime()
    ) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "RoleAssignment periods must be ordered and non-overlapping.",
      );
    }
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
        "RoleAssignment provenance must remain in causal order.",
      );
    }
  }
}

function assertBoundariesHaveProvenance(
  periods: readonly AssignmentPeriod[],
  provenanceTrail: readonly PeopleProvenance[],
): void {
  const provenanceTimes = new Set(
    provenanceTrail.map((provenance) => provenance.effectiveAt.getTime()),
  );
  for (const period of periods) {
    if (!provenanceTimes.has(period.effectiveFrom.getTime())) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "Every RoleAssignment grant must have matching provenance.",
      );
    }
    const effectiveUntil = period.effectiveUntil;
    if (
      effectiveUntil !== null
      && !provenanceTimes.has(effectiveUntil.getTime())
    ) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "Every RoleAssignment revocation must have matching provenance.",
      );
    }
  }
}

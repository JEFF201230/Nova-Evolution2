import { BusinessPerson } from "./business-person.aggregate.js";
import {
  type AssignApproverCommand,
  type AssignBusinessRoleCommand,
  type AssignPersonToWorkCommand,
  type ChangeWorkOwnerCommand,
  type CreateBusinessPersonCommand,
  type RemovePersonFromWorkCommand,
  type ReplaceAssignedPersonCommand,
  type ResumeWorkAssignmentCommand,
  type RevokeBusinessRoleCommand,
  type SuspendWorkAssignmentCommand,
} from "./people-authority.commands.js";
import type { PeopleDomainEvent } from "./people-authority.events.js";
import { peopleAuthorityAccess } from "./people-authority.guard.js";
import { PeopleDomainError } from "./people.errors.js";
import {
  AssignmentPeriod,
  AssignmentStatus,
  BusinessRole,
  type BusinessPersonId,
  type PeopleProvenance,
  type WorkAssignmentId,
} from "./people.value-objects.js";
import { RoleAssignment } from "./role-assignment.entity.js";
import { WorkAssignment } from "./work-assignment.entity.js";
import { WorkPeople } from "./work-people.aggregate.js";

const AUTHORITY_ACCESS = peopleAuthorityAccess();
const OWNER = BusinessRole.of("OWNER");
const APPROVER = BusinessRole.of("APPROVER");
const OBSERVER = BusinessRole.of("OBSERVER");

export type PeopleAuthorityResult<Aggregate> = Readonly<{
  aggregate: Aggregate;
  events: readonly PeopleDomainEvent[];
}>;

/**
 * The single domain write boundary for People.
 *
 * It is deliberately pure: callers provide the current immutable aggregate and
 * receive a new immutable aggregate plus its facts. Persistence, queries,
 * transport and Work integration belong to later lots.
 */
export class PeopleAuthority {
  private constructor(readonly authority: string) {
    if (authority.length === 0 || authority !== authority.trim()) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "PeopleAuthority requires a canonical business authority.",
      );
    }
    Object.freeze(this);
  }

  static establish(authority: string): PeopleAuthority {
    return new PeopleAuthority(authority);
  }

  createBusinessPerson(
    current: BusinessPerson | null,
    command: CreateBusinessPersonCommand,
  ): PeopleAuthorityResult<BusinessPerson> {
    this.assertProvenance(command.provenance);
    if (current !== null) {
      if (
        current.hasIdentity(command.personId)
        && current.recognitionProvenance.equals(command.provenance)
      ) {
        return result(current, []);
      }
      throw new PeopleDomainError(
        "BUSINESS_PERSON_ALREADY_EXISTS",
        `${command.personId.value} is already recognized.`,
      );
    }

    const aggregate = BusinessPerson.recognize(
      AUTHORITY_ACCESS,
      command.personId,
      command.provenance,
    );
    return result(aggregate, [
      event(command.provenance, {
        name: "BUSINESS_IDENTITY_RECOGNIZED",
        aggregate: "BUSINESS_PERSON",
        personId: command.personId,
        effectiveAt: command.provenance.effectiveAt,
      }),
    ]);
  }

  assignPersonToWork(
    current: WorkPeople | null,
    command: AssignPersonToWorkCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    const replay = current === null
      ? false
      : this.assertFreshCausality(current, command.provenance);
    if (replay) {
      const assignment = current?.assignments.find((candidate) =>
        candidate.id.equals(command.assignmentId)
      );
      if (
        assignment !== undefined
        && assignment.personId.equals(command.person.id)
        && assignment.period.equals(command.period)
        && sameRoles(assignment, command.roles)
      ) {
        return result(current as WorkPeople, []);
      }
      throw replayConflict();
    }
    if (
      current !== null
      && !current.workReference.equals(command.workReference)
    ) {
      throw new PeopleDomainError(
        "WORK_REFERENCE_NOT_FOUND",
        "The command targets a different Work.",
      );
    }

    return buildAssignment(current, command);
  }

  removePersonFromWork(
    current: WorkPeople,
    command: RemovePersonFromWorkCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    if (this.assertFreshCausality(current, command.provenance)) {
      const assignment = current.assignments.find((candidate) =>
        candidate.id.equals(command.assignmentId)
      );
      if (
        assignment?.status.name === "ENDED"
        && assignment.period.effectiveUntil?.getTime()
          === command.provenance.effectiveAt.getTime()
      ) {
        return result(current, []);
      }
      throw replayConflict();
    }
    return removeAssignment(
      current,
      command.assignmentId,
      command.provenance,
      "REMOVED",
    );
  }

  assignBusinessRole(
    current: WorkPeople,
    command: AssignBusinessRoleCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    if (this.assertFreshCausality(current, command.provenance)) {
      const assignment = current.assignments.find((candidate) =>
        candidate.id.equals(command.assignmentId)
      );
      const role = assignment?.roleAssignments.find((candidate) =>
        candidate.role.equals(command.role)
      );
      if (
        role !== undefined
        && role.periods.some((period) => period.equals(command.period))
        && hasProvenance(role.provenanceTrail, command.provenance)
      ) {
        return result(current, []);
      }
      throw replayConflict();
    }
    return grantRole(
      current,
      command.assignmentId,
      command.role,
      command.period,
      command.provenance,
    );
  }

  revokeBusinessRole(
    current: WorkPeople,
    command: RevokeBusinessRoleCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    if (this.assertFreshCausality(current, command.provenance)) {
      const assignment = current.assignments.find((candidate) =>
        candidate.id.equals(command.assignmentId)
      );
      const role = assignment?.roleAssignments.find((candidate) =>
        candidate.role.equals(command.role)
      );
      if (
        role !== undefined
        && hasProvenance(role.provenanceTrail, command.provenance)
        && !role.isEffectiveAt(command.provenance.effectiveAt)
      ) {
        return result(current, []);
      }
      throw replayConflict();
    }

    const assignment = requireAssignment(current, command.assignmentId);
    if (assignment.status.name === "ENDED") {
      throw new PeopleDomainError(
        "ASSIGNMENT_ENDED",
        "An ended WorkAssignment cannot lose a role.",
      );
    }
    const at = command.provenance.effectiveAt;
    const role = assignment.roleAssignments.find(
      (candidate) =>
        candidate.role.equals(command.role) && candidate.isEffectiveAt(at),
    );
    if (role === undefined) {
      throw new PeopleDomainError(
        "ROLE_NOT_ASSIGNED",
        `${command.role.name} is not active on the WorkAssignment.`,
      );
    }
    const remainingRoles = assignment.roleAssignments.filter(
      (candidate) =>
        !candidate.role.equals(command.role) && candidate.isEffectiveAt(at),
    );
    if (remainingRoles.length === 0) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "The final active role must be removed through RemovePersonFromWork.",
      );
    }

    const nextRole = closeRole(role, command.provenance);
    const nextAssignment = rebuildAssignment(
      assignment,
      assignment.period,
      assignment.status,
      assignment.roleAssignments.map((candidate) =>
        candidate === role ? nextRole : candidate
      ),
      command.provenance,
    );
    const aggregate = replaceAssignment(
      current,
      nextAssignment,
      command.provenance,
    );
    const domainEvent = command.role.equals(OWNER)
      ? event(command.provenance, {
        name: "OWNER_CHANGED",
        aggregate: "WORK_PEOPLE",
        workReference: current.workReference,
        previousOwnerId: assignment.personId,
        nextOwnerId: null,
        effectiveAt: at,
      })
      : event(command.provenance, {
        name: "ROLE_REVOKED",
        aggregate: "WORK_PEOPLE",
        assignmentId: assignment.id,
        personId: assignment.personId,
        role: command.role,
        effectiveAt: at,
      });
    return result(aggregate, [domainEvent]);
  }

  changeWorkOwner(
    current: WorkPeople,
    command: ChangeWorkOwnerCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    if (this.assertFreshCausality(current, command.provenance)) {
      const owner = current.assignments.find((assignment) =>
        assignment.hasRoleAt(OWNER, command.provenance.effectiveAt)
      );
      const requestedOwnerId = command.nextOwner?.id ?? null;
      if (
        current.provenance.equals(command.provenance)
        && (
          (owner === undefined && requestedOwnerId === null)
          || (
            owner !== undefined
            && requestedOwnerId !== null
            && owner.personId.equals(requestedOwnerId)
          )
        )
      ) {
        return result(current, []);
      }
      throw replayConflict();
    }
    if (
      (command.nextOwner === null)
      !== (command.nextOwnerAssignmentId === null)
    ) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        "Owner identity and Assignment must both be present or absent.",
      );
    }

    const at = command.provenance.effectiveAt;
    const previousOwner = current.assignments.find((assignment) =>
      assignment.hasRoleAt(OWNER, at)
    );
    const nextOwnerAssignment = command.nextOwnerAssignmentId === null
      ? undefined
      : requireAssignment(current, command.nextOwnerAssignmentId);

    if (
      nextOwnerAssignment !== undefined
      && (
        command.nextOwner === null
        || !nextOwnerAssignment.personId.equals(command.nextOwner.id)
        || !nextOwnerAssignment.isParticipantAt(at)
      )
    ) {
      throw new PeopleDomainError(
        "PERSON_NOT_ASSIGNED",
        "The next Owner must be an active Participant of this Work.",
      );
    }
    if (
      previousOwner !== undefined
      && nextOwnerAssignment !== undefined
      && previousOwner.id.equals(nextOwnerAssignment.id)
    ) {
      throw new PeopleDomainError(
        "OWNER_ALREADY_DEFINED",
        "The requested Owner is already active.",
      );
    }

    let assignments = [...current.assignments];
    if (previousOwner !== undefined) {
      assignments = assignments.map((assignment) =>
        assignment === previousOwner
          ? rebuildAssignment(
            previousOwner,
            previousOwner.period,
            previousOwner.status,
            previousOwner.roleAssignments.map((role) =>
              role.role.equals(OWNER)
                ? closeRole(role, command.provenance)
                : role
            ),
            command.provenance,
          )
          : assignment
      );
    }
    if (nextOwnerAssignment !== undefined) {
      const currentTarget = assignments.find((assignment) =>
        assignment.id.equals(nextOwnerAssignment.id)
      );
      if (currentTarget === undefined) {
        throw new PeopleDomainError(
          "WORK_ASSIGNMENT_NOT_FOUND",
          "The next Owner Assignment is unavailable.",
        );
      }
      assignments = assignments.map((assignment) =>
        assignment === currentTarget
          ? rebuildAssignment(
            currentTarget,
            currentTarget.period,
            currentTarget.status,
            upsertRole(
              currentTarget,
              OWNER,
              boundedPeriod(currentTarget, at),
              command.provenance,
            ),
            command.provenance,
          )
          : assignment
      );
    }

    const aggregate = WorkPeople.establish(
      AUTHORITY_ACCESS,
      current.workReference,
      assignments,
      command.provenance,
    );
    return result(aggregate, [
      event(command.provenance, {
        name: "OWNER_CHANGED",
        aggregate: "WORK_PEOPLE",
        workReference: current.workReference,
        previousOwnerId: previousOwner?.personId ?? null,
        nextOwnerId: nextOwnerAssignment?.personId ?? null,
        effectiveAt: at,
      }),
    ]);
  }

  assignApprover(
    current: WorkPeople,
    command: AssignApproverCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    return this.assignBusinessRole(current, {
      kind: "ASSIGN_BUSINESS_ROLE",
      assignmentId: command.assignmentId,
      role: APPROVER,
      period: command.period,
      provenance: command.provenance,
    });
  }

  replaceAssignedPerson(
    current: WorkPeople,
    command: ReplaceAssignedPersonCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    if (this.assertFreshCausality(current, command.provenance)) {
      const source = current.assignments.find((assignment) =>
        assignment.id.equals(command.replacedAssignmentId)
      );
      const replacement = current.assignments.find((assignment) =>
        assignment.id.equals(command.replacementAssignmentId)
      );
      if (
        source?.status.name === "ENDED"
        && replacement !== undefined
        && replacement.personId.equals(command.replacementPerson.id)
        && replacement.period.equals(command.replacementPeriod)
        && sameRoles(replacement, command.replacementRoles)
      ) {
        return result(current, []);
      }
      throw replayConflict();
    }

    const replaced = requireAssignment(
      current,
      command.replacedAssignmentId,
    );
    const at = command.provenance.effectiveAt;
    const previousOwner = replaced.hasRoleAt(OWNER, at)
      ? replaced.personId
      : null;
    const removed = removeAssignment(
      current,
      replaced.id,
      command.provenance,
      "REPLACED",
    );
    const assigned = buildAssignment(removed.aggregate, {
      kind: "ASSIGN_PERSON_TO_WORK",
      person: command.replacementPerson,
      workReference: current.workReference,
      assignmentId: command.replacementAssignmentId,
      roles: command.replacementRoles,
      period: command.replacementPeriod,
      provenance: command.provenance,
    });
    const nextOwner = command.replacementRoles.some((role) =>
      role.equals(OWNER)
    )
      ? command.replacementPerson.id
      : null;
    const events: PeopleDomainEvent[] = [
      ...removed.events.filter((item) => item.name !== "OWNER_CHANGED"),
      ...assigned.events.filter((item) => item.name !== "OWNER_CHANGED"),
    ];
    if (previousOwner !== null || nextOwner !== null) {
      events.unshift(
        event(command.provenance, {
          name: "OWNER_CHANGED",
          aggregate: "WORK_PEOPLE",
          workReference: current.workReference,
          previousOwnerId: previousOwner,
          nextOwnerId: nextOwner,
          effectiveAt: at,
        }),
      );
    }
    return result(assigned.aggregate, events);
  }

  suspendWorkAssignment(
    current: WorkPeople,
    command: SuspendWorkAssignmentCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    if (this.assertFreshCausality(current, command.provenance)) {
      const assignment = current.assignments.find((candidate) =>
        candidate.id.equals(command.assignmentId)
      );
      if (
        assignment?.status.name === "SUSPENDED"
        && hasProvenance(
          assignment.provenanceTrail,
          command.provenance,
        )
      ) {
        return result(current, []);
      }
      throw replayConflict();
    }
    const assignment = requireAssignment(current, command.assignmentId);
    if (assignment.status.name !== "ACTIVE") {
      throw new PeopleDomainError(
        assignment.status.name === "ENDED"
          ? "ASSIGNMENT_ENDED"
          : "ASSIGNMENT_CONFLICT",
        "Only an ACTIVE WorkAssignment can be suspended.",
      );
    }
    const at = command.provenance.effectiveAt;
    const wasOwner = assignment.hasRoleAt(OWNER, at);
    const nextAssignment = rebuildAssignment(
      assignment,
      assignment.period,
      AssignmentStatus.of("SUSPENDED"),
      assignment.roleAssignments,
      command.provenance,
    );
    const aggregate = replaceAssignment(
      current,
      nextAssignment,
      command.provenance,
    );
    const events: PeopleDomainEvent[] = [];
    if (wasOwner) {
      events.push(
        event(command.provenance, {
          name: "OWNER_CHANGED",
          aggregate: "WORK_PEOPLE",
          workReference: current.workReference,
          previousOwnerId: assignment.personId,
          nextOwnerId: null,
          effectiveAt: at,
        }),
      );
    }
    events.push(
      event(command.provenance, {
        name: "ASSIGNMENT_SUSPENDED",
        aggregate: "WORK_PEOPLE",
        assignmentId: assignment.id,
        personId: assignment.personId,
        effectiveAt: at,
      }),
      event(command.provenance, {
        name: "PARTICIPANT_REMOVED",
        aggregate: "WORK_PEOPLE",
        workReference: current.workReference,
        assignmentId: assignment.id,
        personId: assignment.personId,
        effectiveAt: at,
        reason: "SUSPENDED",
      }),
    );
    return result(aggregate, events);
  }

  resumeWorkAssignment(
    current: WorkPeople,
    command: ResumeWorkAssignmentCommand,
  ): PeopleAuthorityResult<WorkPeople> {
    this.assertProvenance(command.provenance);
    if (this.assertFreshCausality(current, command.provenance)) {
      const assignment = current.assignments.find((candidate) =>
        candidate.id.equals(command.assignmentId)
      );
      if (
        assignment?.status.name === "ACTIVE"
        && hasProvenance(
          assignment.provenanceTrail,
          command.provenance,
        )
      ) {
        return result(current, []);
      }
      throw replayConflict();
    }
    const assignment = requireAssignment(current, command.assignmentId);
    if (assignment.status.name !== "SUSPENDED") {
      throw new PeopleDomainError(
        assignment.status.name === "ENDED"
          ? "ASSIGNMENT_ENDED"
          : "ASSIGNMENT_CONFLICT",
        "Only a SUSPENDED WorkAssignment can be resumed.",
      );
    }
    const at = command.provenance.effectiveAt;
    const nextAssignment = rebuildAssignment(
      assignment,
      assignment.period,
      AssignmentStatus.of("ACTIVE"),
      assignment.roleAssignments,
      command.provenance,
    );
    const aggregate = replaceAssignment(
      current,
      nextAssignment,
      command.provenance,
    );
    const events: PeopleDomainEvent[] = [
      event(command.provenance, {
        name: "ASSIGNMENT_RESUMED",
        aggregate: "WORK_PEOPLE",
        assignmentId: assignment.id,
        personId: assignment.personId,
        effectiveAt: at,
      }),
    ];
    if (nextAssignment.hasRoleAt(OWNER, at)) {
      events.push(
        event(command.provenance, {
          name: "OWNER_CHANGED",
          aggregate: "WORK_PEOPLE",
          workReference: current.workReference,
          previousOwnerId: null,
          nextOwnerId: assignment.personId,
          effectiveAt: at,
        }),
      );
    }
    events.push(
      event(command.provenance, {
        name: "PARTICIPANT_ADDED",
        aggregate: "WORK_PEOPLE",
        workReference: current.workReference,
        assignmentId: assignment.id,
        personId: assignment.personId,
        effectiveAt: at,
      }),
    );
    return result(aggregate, events);
  }

  private assertProvenance(provenance: PeopleProvenance): void {
    if (provenance.authority !== this.authority) {
      throw new PeopleDomainError(
        "TECHNICAL_IDENTITY_SOURCE_FORBIDDEN",
        "Only this PeopleAuthority can accept the business provenance.",
      );
    }
  }

  private assertFreshCausality(
    current: WorkPeople,
    provenance: PeopleProvenance,
  ): boolean {
    const matching = current.assignments
      .flatMap((assignment) => [
        ...assignment.provenanceTrail,
        ...assignment.roleAssignments.flatMap((role) =>
          role.provenanceTrail
        ),
      ])
      .find((candidate) =>
        candidate.businessCause === provenance.businessCause
      );
    if (matching === undefined) {
      return false;
    }
    if (matching.equals(provenance)) {
      return true;
    }
    throw new PeopleDomainError(
      "ASSIGNMENT_CONFLICT",
      "A business causality cannot be reused with different provenance.",
    );
  }
}

function buildAssignment(
  current: WorkPeople | null,
  command: AssignPersonToWorkCommand,
): PeopleAuthorityResult<WorkPeople> {
  if (
    current?.assignments.some(
      (assignment) =>
        assignment.isCurrent
        && assignment.personId.equals(command.person.id),
    )
  ) {
    throw new PeopleDomainError(
      "PERSON_ALREADY_ASSIGNED",
      `${command.person.id.value} already has a current WorkAssignment.`,
    );
  }
  const roles = command.roles.map((role) =>
    RoleAssignment.create(
      AUTHORITY_ACCESS,
      command.assignmentId,
      role,
      [command.period],
      [command.provenance],
    )
  );
  const assignment = WorkAssignment.create(
    AUTHORITY_ACCESS,
    command.assignmentId,
    command.person.id,
    command.period,
    AssignmentStatus.of("ACTIVE"),
    roles,
    [command.provenance],
  );
  const aggregate = WorkPeople.establish(
    AUTHORITY_ACCESS,
    command.workReference,
    [...(current?.assignments ?? []), assignment],
    command.provenance,
  );
  const events: PeopleDomainEvent[] = [
    event(command.provenance, {
      name: "PEOPLE_ASSIGNED",
      aggregate: "WORK_PEOPLE",
      workReference: command.workReference,
      assignmentId: command.assignmentId,
      personId: command.person.id,
      roles: Object.freeze([...command.roles]),
      period: command.period,
    }),
  ];
  if (command.roles.some((role) => role.equals(OWNER))) {
    events.push(
      event(command.provenance, {
        name: "OWNER_CHANGED",
        aggregate: "WORK_PEOPLE",
        workReference: command.workReference,
        previousOwnerId: null,
        nextOwnerId: command.person.id,
        effectiveAt: command.provenance.effectiveAt,
      }),
    );
  }
  if (assignment.isParticipantAt(command.provenance.effectiveAt)) {
    events.push(
      event(command.provenance, {
        name: "PARTICIPANT_ADDED",
        aggregate: "WORK_PEOPLE",
        workReference: command.workReference,
        assignmentId: command.assignmentId,
        personId: command.person.id,
        effectiveAt: command.provenance.effectiveAt,
      }),
    );
  }
  return result(aggregate, events);
}

function removeAssignment(
  current: WorkPeople,
  assignmentId: WorkAssignmentId,
  provenance: PeopleProvenance,
  reason: "REMOVED" | "REPLACED",
): PeopleAuthorityResult<WorkPeople> {
  const assignment = requireAssignment(current, assignmentId);
  if (!assignment.isCurrent) {
    throw new PeopleDomainError(
      "PERSON_NOT_ASSIGNED",
      "The WorkAssignment is already ended.",
    );
  }
  const at = provenance.effectiveAt;
  const wasParticipant = assignment.isParticipantAt(at);
  const wasOwner = assignment.hasRoleAt(OWNER, at);
  const nextRoles = assignment.roleAssignments.map((role) =>
    role.isEffectiveAt(at) ? closeRole(role, provenance) : role
  );
  const nextAssignment = rebuildAssignment(
    assignment,
    AssignmentPeriod.between(assignment.period.effectiveFrom, at),
    AssignmentStatus.of("ENDED"),
    nextRoles,
    provenance,
  );
  const aggregate = replaceAssignment(current, nextAssignment, provenance);
  const events: PeopleDomainEvent[] = [];
  if (wasOwner) {
    events.push(
      event(provenance, {
        name: "OWNER_CHANGED",
        aggregate: "WORK_PEOPLE",
        workReference: current.workReference,
        previousOwnerId: assignment.personId,
        nextOwnerId: null,
        effectiveAt: at,
      }),
    );
  }
  for (const role of assignment.roleAssignments) {
    if (role.isEffectiveAt(at) && !role.role.equals(OWNER)) {
      events.push(
        event(provenance, {
          name: "ROLE_REVOKED",
          aggregate: "WORK_PEOPLE",
          assignmentId: assignment.id,
          personId: assignment.personId,
          role: role.role,
          effectiveAt: at,
        }),
      );
    }
  }
  if (wasParticipant) {
    events.push(
      event(provenance, {
        name: "PARTICIPANT_REMOVED",
        aggregate: "WORK_PEOPLE",
        workReference: current.workReference,
        assignmentId: assignment.id,
        personId: assignment.personId,
        effectiveAt: at,
        reason,
      }),
    );
  }
  events.push(
    event(provenance, {
      name: "PEOPLE_REMOVED",
      aggregate: "WORK_PEOPLE",
      workReference: current.workReference,
      assignmentId: assignment.id,
      personId: assignment.personId,
      effectiveAt: at,
    }),
  );
  return result(aggregate, events);
}

function grantRole(
  current: WorkPeople,
  assignmentId: WorkAssignmentId,
  role: BusinessRole,
  period: AssignmentPeriod,
  provenance: PeopleProvenance,
): PeopleAuthorityResult<WorkPeople> {
  const assignment = requireAssignment(current, assignmentId);
  if (assignment.status.name === "ENDED") {
    throw new PeopleDomainError(
      "ASSIGNMENT_ENDED",
      "An ended WorkAssignment cannot receive a role.",
    );
  }
  if (
    assignment.roleAssignments.some(
      (candidate) =>
        candidate.role.equals(role)
        && candidate.isEffectiveAt(provenance.effectiveAt),
    )
  ) {
    throw new PeopleDomainError(
      "ROLE_ALREADY_ASSIGNED",
      `${role.name} is already active on the WorkAssignment.`,
    );
  }
  const nextAssignment = rebuildAssignment(
    assignment,
    assignment.period,
    assignment.status,
    upsertRole(assignment, role, period, provenance),
    provenance,
  );
  const aggregate = replaceAssignment(current, nextAssignment, provenance);
  const domainEvent = role.equals(APPROVER)
    ? event(provenance, {
      name: "APPROVER_ASSIGNED",
      aggregate: "WORK_PEOPLE",
      assignmentId: assignment.id,
      personId: assignment.personId,
      period,
    })
    : role.equals(OBSERVER)
    ? event(provenance, {
      name: "OBSERVER_ADDED",
      aggregate: "WORK_PEOPLE",
      assignmentId: assignment.id,
      personId: assignment.personId,
      period,
    })
    : role.equals(OWNER)
    ? event(provenance, {
      name: "OWNER_CHANGED",
      aggregate: "WORK_PEOPLE",
      workReference: current.workReference,
      previousOwnerId: null,
      nextOwnerId: assignment.personId,
      effectiveAt: provenance.effectiveAt,
    })
    : event(provenance, {
      name: "ROLE_GRANTED",
      aggregate: "WORK_PEOPLE",
      assignmentId: assignment.id,
      personId: assignment.personId,
      role,
      period,
    });
  return result(aggregate, [domainEvent]);
}

function requireAssignment(
  current: WorkPeople,
  assignmentId: WorkAssignmentId,
): WorkAssignment {
  const assignment = current.assignments.find((candidate) =>
    candidate.id.equals(assignmentId)
  );
  if (assignment === undefined) {
    throw new PeopleDomainError(
      "WORK_ASSIGNMENT_NOT_FOUND",
      `${assignmentId.value} does not belong to this Work.`,
    );
  }
  return assignment;
}

function rebuildAssignment(
  current: WorkAssignment,
  period: AssignmentPeriod,
  status: AssignmentStatus,
  roles: readonly RoleAssignment[],
  provenance: PeopleProvenance,
): WorkAssignment {
  return WorkAssignment.create(
    AUTHORITY_ACCESS,
    current.id,
    current.personId,
    period,
    status,
    roles,
    [...current.provenanceTrail, provenance],
  );
}

function replaceAssignment(
  current: WorkPeople,
  next: WorkAssignment,
  provenance: PeopleProvenance,
): WorkPeople {
  return WorkPeople.establish(
    AUTHORITY_ACCESS,
    current.workReference,
    current.assignments.map((assignment) =>
      assignment.id.equals(next.id) ? next : assignment
    ),
    provenance,
  );
}

function upsertRole(
  assignment: WorkAssignment,
  role: BusinessRole,
  period: AssignmentPeriod,
  provenance: PeopleProvenance,
): readonly RoleAssignment[] {
  const existing = assignment.roleAssignments.find((candidate) =>
    candidate.role.equals(role)
  );
  if (existing === undefined) {
    return Object.freeze([
      ...assignment.roleAssignments,
      RoleAssignment.create(
        AUTHORITY_ACCESS,
        assignment.id,
        role,
        [period],
        [provenance],
      ),
    ]);
  }
  const next = RoleAssignment.create(
    AUTHORITY_ACCESS,
    assignment.id,
    role,
    [...existing.periods, period],
    [...existing.provenanceTrail, provenance],
  );
  return Object.freeze(
    assignment.roleAssignments.map((candidate) =>
      candidate === existing ? next : candidate
    ),
  );
}

function closeRole(
  role: RoleAssignment,
  provenance: PeopleProvenance,
): RoleAssignment {
  const at = provenance.effectiveAt;
  const currentPeriodIndex = role.periods.findIndex((period) =>
    period.contains(at)
  );
  if (currentPeriodIndex < 0) {
    throw new PeopleDomainError(
      "ROLE_NOT_ASSIGNED",
      `${role.role.name} is not active at the requested effective date.`,
    );
  }
  const periods = role.periods.map((period, index) =>
    index === currentPeriodIndex
      ? AssignmentPeriod.between(period.effectiveFrom, at)
      : period
  );
  return RoleAssignment.create(
    AUTHORITY_ACCESS,
    role.assignmentId,
    role.role,
    periods,
    [...role.provenanceTrail, provenance],
  );
}

function boundedPeriod(
  assignment: WorkAssignment,
  effectiveFrom: Date,
): AssignmentPeriod {
  return assignment.period.effectiveUntil === null
    ? AssignmentPeriod.startingAt(effectiveFrom)
    : AssignmentPeriod.between(
      effectiveFrom,
      assignment.period.effectiveUntil,
    );
}

function sameRoles(
  assignment: WorkAssignment,
  roles: readonly BusinessRole[],
): boolean {
  const current = assignment.roleAssignments
    .filter((role) => role.isEffectiveAt(assignment.observedAt))
    .map((role) => role.role.name)
    .sort();
  const requested = roles.map((role) => role.name).sort();
  return (
    current.length === requested.length
    && current.every((role, index) => role === requested[index])
  );
}

function hasProvenance(
  trail: readonly PeopleProvenance[],
  provenance: PeopleProvenance,
): boolean {
  return trail.some((candidate) => candidate.equals(provenance));
}

function replayConflict(): PeopleDomainError {
  return new PeopleDomainError(
    "ASSIGNMENT_CONFLICT",
    "A business causality cannot be replayed with different content.",
  );
}

function event<T extends Omit<PeopleDomainEvent, "causality" | "provenance">>(
  provenance: PeopleProvenance,
  value: T,
): PeopleDomainEvent {
  return Object.freeze({
    ...value,
    causality: provenance.businessCause,
    provenance,
  }) as unknown as PeopleDomainEvent;
}

function result<Aggregate>(
  aggregate: Aggregate,
  events: readonly PeopleDomainEvent[],
): PeopleAuthorityResult<Aggregate> {
  return Object.freeze({
    aggregate,
    events: Object.freeze([...events]),
  });
}

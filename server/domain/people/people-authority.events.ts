import type {
  AssignmentPeriod,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";

type PeopleDomainEventBase<Name extends string, Aggregate extends string> =
  Readonly<{
    name: Name;
    aggregate: Aggregate;
    causality: string;
    provenance: PeopleProvenance;
  }>;

export type BusinessIdentityRecognized =
  PeopleDomainEventBase<
    "BUSINESS_IDENTITY_RECOGNIZED",
    "BUSINESS_PERSON"
  > & Readonly<{
    personId: BusinessPersonId;
    effectiveAt: Date;
  }>;

export type PeopleAssigned =
  PeopleDomainEventBase<"PEOPLE_ASSIGNED", "WORK_PEOPLE"> & Readonly<{
    workReference: WorkReference;
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    roles: readonly BusinessRole[];
    period: AssignmentPeriod;
  }>;

export type ParticipantAdded =
  PeopleDomainEventBase<"PARTICIPANT_ADDED", "WORK_PEOPLE"> & Readonly<{
    workReference: WorkReference;
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    effectiveAt: Date;
  }>;

export type RoleGranted =
  PeopleDomainEventBase<"ROLE_GRANTED", "WORK_PEOPLE"> & Readonly<{
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    role: BusinessRole;
    period: AssignmentPeriod;
  }>;

export type RoleRevoked =
  PeopleDomainEventBase<"ROLE_REVOKED", "WORK_PEOPLE"> & Readonly<{
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    role: BusinessRole;
    effectiveAt: Date;
  }>;

export type RoleChanged =
  PeopleDomainEventBase<"ROLE_CHANGED", "WORK_PEOPLE"> & Readonly<{
    assignmentId: WorkAssignmentId;
    previousRoles: readonly BusinessRole[];
    nextRoles: readonly BusinessRole[];
    effectiveAt: Date;
  }>;

export type OwnerChanged =
  PeopleDomainEventBase<"OWNER_CHANGED", "WORK_PEOPLE"> & Readonly<{
    workReference: WorkReference;
    previousOwnerId: BusinessPersonId | null;
    nextOwnerId: BusinessPersonId | null;
    effectiveAt: Date;
  }>;

export type ApproverAssigned =
  PeopleDomainEventBase<"APPROVER_ASSIGNED", "WORK_PEOPLE"> & Readonly<{
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    period: AssignmentPeriod;
  }>;

export type ObserverAdded =
  PeopleDomainEventBase<"OBSERVER_ADDED", "WORK_PEOPLE"> & Readonly<{
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    period: AssignmentPeriod;
  }>;

export type AssignmentSuspended =
  PeopleDomainEventBase<"ASSIGNMENT_SUSPENDED", "WORK_PEOPLE"> & Readonly<{
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    effectiveAt: Date;
  }>;

export type AssignmentResumed =
  PeopleDomainEventBase<"ASSIGNMENT_RESUMED", "WORK_PEOPLE"> & Readonly<{
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    effectiveAt: Date;
  }>;

export type ParticipantRemoved =
  PeopleDomainEventBase<"PARTICIPANT_REMOVED", "WORK_PEOPLE"> & Readonly<{
    workReference: WorkReference;
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    effectiveAt: Date;
    reason: "SUSPENDED" | "REMOVED" | "REPLACED";
  }>;

export type PeopleRemoved =
  PeopleDomainEventBase<"PEOPLE_REMOVED", "WORK_PEOPLE"> & Readonly<{
    workReference: WorkReference;
    assignmentId: WorkAssignmentId;
    personId: BusinessPersonId;
    effectiveAt: Date;
  }>;

export type PeopleDomainEvent =
  | BusinessIdentityRecognized
  | PeopleAssigned
  | ParticipantAdded
  | RoleGranted
  | RoleRevoked
  | RoleChanged
  | OwnerChanged
  | ApproverAssigned
  | ObserverAdded
  | AssignmentSuspended
  | AssignmentResumed
  | ParticipantRemoved
  | PeopleRemoved;


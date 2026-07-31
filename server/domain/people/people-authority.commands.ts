import type { BusinessPerson } from "./business-person.aggregate.js";
import type {
  AssignmentPeriod,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  WorkAssignmentId,
  WorkReference,
} from "./people.value-objects.js";

export type CreateBusinessPersonCommand = Readonly<{
  kind: "CREATE_BUSINESS_PERSON";
  personId: BusinessPersonId;
  provenance: PeopleProvenance;
}>;

export type AssignPersonToWorkCommand = Readonly<{
  kind: "ASSIGN_PERSON_TO_WORK";
  person: BusinessPerson;
  workReference: WorkReference;
  assignmentId: WorkAssignmentId;
  roles: readonly BusinessRole[];
  period: AssignmentPeriod;
  provenance: PeopleProvenance;
}>;

export type RemovePersonFromWorkCommand = Readonly<{
  kind: "REMOVE_PERSON_FROM_WORK";
  assignmentId: WorkAssignmentId;
  provenance: PeopleProvenance;
}>;

export type AssignBusinessRoleCommand = Readonly<{
  kind: "ASSIGN_BUSINESS_ROLE";
  assignmentId: WorkAssignmentId;
  role: BusinessRole;
  period: AssignmentPeriod;
  provenance: PeopleProvenance;
}>;

export type RevokeBusinessRoleCommand = Readonly<{
  kind: "REVOKE_BUSINESS_ROLE";
  assignmentId: WorkAssignmentId;
  role: BusinessRole;
  provenance: PeopleProvenance;
}>;

export type ChangeWorkOwnerCommand = Readonly<{
  kind: "CHANGE_WORK_OWNER";
  nextOwner: BusinessPerson | null;
  nextOwnerAssignmentId: WorkAssignmentId | null;
  provenance: PeopleProvenance;
}>;

export type AssignApproverCommand = Readonly<{
  kind: "ASSIGN_APPROVER";
  assignmentId: WorkAssignmentId;
  period: AssignmentPeriod;
  provenance: PeopleProvenance;
}>;

export type ReplaceAssignedPersonCommand = Readonly<{
  kind: "REPLACE_ASSIGNED_PERSON";
  replacedAssignmentId: WorkAssignmentId;
  replacementPerson: BusinessPerson;
  replacementAssignmentId: WorkAssignmentId;
  replacementRoles: readonly BusinessRole[];
  replacementPeriod: AssignmentPeriod;
  provenance: PeopleProvenance;
}>;

export type SuspendWorkAssignmentCommand = Readonly<{
  kind: "SUSPEND_WORK_ASSIGNMENT";
  assignmentId: WorkAssignmentId;
  provenance: PeopleProvenance;
}>;

export type ResumeWorkAssignmentCommand = Readonly<{
  kind: "RESUME_WORK_ASSIGNMENT";
  assignmentId: WorkAssignmentId;
  provenance: PeopleProvenance;
}>;

export type PeopleAuthorityCommand =
  | CreateBusinessPersonCommand
  | AssignPersonToWorkCommand
  | RemovePersonFromWorkCommand
  | AssignBusinessRoleCommand
  | RevokeBusinessRoleCommand
  | ChangeWorkOwnerCommand
  | AssignApproverCommand
  | ReplaceAssignedPersonCommand
  | SuspendWorkAssignmentCommand
  | ResumeWorkAssignmentCommand;


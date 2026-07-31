export {
  ACTIVE_PEOPLE_DOMAIN_ERROR_CODES,
  INACTIVE_OWNER_ERROR_CODES,
  PeopleDomainError,
  type InactiveOwnerErrorCode,
  type PeopleDomainErrorCode,
} from "./people.errors.js";

export {
  ASSIGNMENT_STATUS_NAMES,
  AssignmentPeriod,
  AssignmentStatus,
  BUSINESS_ROLE_NAMES,
  BusinessPersonId,
  BusinessRole,
  PeopleProvenance,
  Responsibility,
  WorkAssignmentId,
  WorkReference,
  type AssignmentStatusName,
  type BusinessRoleName,
} from "./people.value-objects.js";

export { BusinessPerson } from "./business-person.aggregate.js";
export { RoleAssignment } from "./role-assignment.entity.js";
export { WorkAssignment } from "./work-assignment.entity.js";
export { WorkPeople } from "./work-people.aggregate.js";

export {
  assertPeopleAuthorityAccess,
  type PeopleAuthorityAccess,
} from "./people-foundation-access.js";

export const ACTIVE_PEOPLE_DOMAIN_ERROR_CODES = Object.freeze([
  "BUSINESS_PERSON_NOT_FOUND",
  "BUSINESS_PERSON_ALREADY_EXISTS",
  "WORK_REFERENCE_NOT_FOUND",
  "WORK_ASSIGNMENT_NOT_FOUND",
  "PERSON_ALREADY_ASSIGNED",
  "PERSON_NOT_ASSIGNED",
  "OWNER_ALREADY_DEFINED",
  "ROLE_NOT_ALLOWED",
  "ROLE_ALREADY_ASSIGNED",
  "ROLE_NOT_ASSIGNED",
  "INVALID_ASSIGNMENT_PERIOD",
  "ASSIGNMENT_CONFLICT",
  "TECHNICAL_IDENTITY_SOURCE_FORBIDDEN",
  "ASSIGNMENT_ENDED",
  "CONCURRENT_PEOPLE_CHANGE",
] as const);

export type PeopleDomainErrorCode =
  (typeof ACTIVE_PEOPLE_DOMAIN_ERROR_CODES)[number];

/**
 * WP-001 makes a Work with no Owner valid. These codes are intentionally
 * unavailable to PeopleDomainError and cannot become active by accident.
 */
export const INACTIVE_OWNER_ERROR_CODES = Object.freeze([
  "OWNER_REQUIRED",
  "LAST_OWNER_REMOVAL_FORBIDDEN",
] as const);

export type InactiveOwnerErrorCode =
  (typeof INACTIVE_OWNER_ERROR_CODES)[number];

export class PeopleDomainError extends Error {
  constructor(
    readonly code: PeopleDomainErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "PeopleDomainError";
  }
}

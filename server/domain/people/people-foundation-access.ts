import { PeopleDomainError } from "./people.errors.js";

const PEOPLE_AUTHORITY_ACCESS = Object.freeze({
  scope: "PEOPLE_AUTHORITY",
});

export type PeopleAuthorityAccess = typeof PEOPLE_AUTHORITY_ACCESS;

export function peopleFoundationAccess(): PeopleAuthorityAccess {
  return PEOPLE_AUTHORITY_ACCESS;
}

export function assertPeopleAuthorityAccess(
  access: PeopleAuthorityAccess,
): void {
  if (access !== PEOPLE_AUTHORITY_ACCESS) {
    throw new PeopleDomainError(
      "ASSIGNMENT_CONFLICT",
      "People aggregates can only be produced by PeopleAuthority.",
    );
  }
}

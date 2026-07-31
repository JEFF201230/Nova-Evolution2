import {
  peopleFoundationAccess,
  type PeopleAuthorityAccess,
} from "./people-foundation-access.js";

export function peopleAuthorityAccess(): PeopleAuthorityAccess {
  return peopleFoundationAccess();
}

export {
  assertPeopleAuthorityAccess,
  type PeopleAuthorityAccess,
} from "./people-foundation-access.js";

import {
  BusinessPersonId,
  PeopleProvenance,
} from "./people.value-objects.js";
import {
  assertPeopleAuthorityAccess,
  type PeopleAuthorityAccess,
} from "./people-foundation-access.js";

export class BusinessPerson {
  private constructor(
    readonly id: BusinessPersonId,
    readonly recognitionProvenance: PeopleProvenance,
  ) {
    Object.freeze(this);
  }

  static recognize(
    access: PeopleAuthorityAccess,
    id: BusinessPersonId,
    provenance: PeopleProvenance,
  ): BusinessPerson {
    assertPeopleAuthorityAccess(access);
    return new BusinessPerson(id, provenance);
  }

  hasIdentity(id: BusinessPersonId): boolean {
    return this.id.equals(id);
  }
}

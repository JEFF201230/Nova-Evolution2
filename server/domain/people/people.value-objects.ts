import { PeopleDomainError } from "./people.errors.js";

export const BUSINESS_ROLE_NAMES = Object.freeze([
  "OWNER",
  "CONTRIBUTOR",
  "REVIEWER",
  "APPROVER",
  "OBSERVER",
  "REQUESTER",
  "SPONSOR",
] as const);

export type BusinessRoleName = (typeof BUSINESS_ROLE_NAMES)[number];

export const ASSIGNMENT_STATUS_NAMES = Object.freeze([
  "ACTIVE",
  "SUSPENDED",
  "ENDED",
] as const);

export type AssignmentStatusName =
  (typeof ASSIGNMENT_STATUS_NAMES)[number];

type ResponsibilityDefinition = Readonly<{
  key: string;
  description: string;
}>;

const RESPONSIBILITIES_BY_ROLE:
  Readonly<Record<BusinessRoleName, readonly ResponsibilityDefinition[]>> =
  Object.freeze({
    OWNER: Object.freeze([
      Object.freeze({
        key: "WORK_CONTINUITY",
        description:
          "Assume the business responsibility for Work continuity.",
      }),
      Object.freeze({
        key: "PEOPLE_ASSIGNMENT_COHERENCE",
        description:
          "Ensures that business responsibilities are explicitly assigned.",
      }),
      Object.freeze({
        key: "BUSINESS_ESCALATION",
        description: "Acts as the business escalation point for the Work.",
      }),
    ]),
    CONTRIBUTOR: Object.freeze([
      Object.freeze({
        key: "BUSINESS_CONTRIBUTION",
        description: "Provides an assigned business contribution to the Work.",
      }),
    ]),
    REVIEWER: Object.freeze([
      Object.freeze({
        key: "BUSINESS_REVIEW",
        description:
          "Reviews an authorized Work object against applicable business criteria.",
      }),
    ]),
    APPROVER: Object.freeze([
      Object.freeze({
        key: "BUSINESS_APPROVAL_PARTICIPATION",
        description:
          "Participates as the assigned business actor in an approval act.",
      }),
    ]),
    OBSERVER: Object.freeze([
      Object.freeze({
        key: "WORK_OBSERVATION",
        description:
          "Follows the Work without implicit change or decision authority.",
      }),
    ]),
    REQUESTER: Object.freeze([
      Object.freeze({
        key: "BUSINESS_NEED_REPRESENTATION",
        description:
          "Expresses or represents the business need at the origin of the Work.",
      }),
    ]),
    SPONSOR: Object.freeze([
      Object.freeze({
        key: "BUSINESS_MANDATE_SUPPORT",
        description: "Carries or supports the business mandate of the Work.",
      }),
    ]),
  });

export class BusinessPersonId {
  private constructor(private readonly canonicalValue: string) {
    Object.freeze(this);
  }

  static of(value: string): BusinessPersonId {
    assertCanonicalIdentifier(
      value,
      "BUSINESS_PERSON_NOT_FOUND",
      "BusinessPersonId",
    );
    return new BusinessPersonId(value);
  }

  get value(): string {
    return this.canonicalValue;
  }

  equals(other: BusinessPersonId): boolean {
    return this.canonicalValue === other.canonicalValue;
  }
}

export class WorkAssignmentId {
  private constructor(private readonly canonicalValue: string) {
    Object.freeze(this);
  }

  static of(value: string): WorkAssignmentId {
    assertCanonicalIdentifier(
      value,
      "WORK_ASSIGNMENT_NOT_FOUND",
      "WorkAssignmentId",
    );
    return new WorkAssignmentId(value);
  }

  get value(): string {
    return this.canonicalValue;
  }

  equals(other: WorkAssignmentId): boolean {
    return this.canonicalValue === other.canonicalValue;
  }
}

export class WorkReference {
  private constructor(
    private readonly canonicalProjectIdentity: string,
    private readonly canonicalWorkIdentity: string,
  ) {
    Object.freeze(this);
  }

  static of(projectIdentity: string, workIdentity: string): WorkReference {
    assertCanonicalIdentifier(
      projectIdentity,
      "WORK_REFERENCE_NOT_FOUND",
      "Project Identity",
    );
    assertCanonicalIdentifier(
      workIdentity,
      "WORK_REFERENCE_NOT_FOUND",
      "Work Identity",
    );
    return new WorkReference(projectIdentity, workIdentity);
  }

  get projectIdentity(): string {
    return this.canonicalProjectIdentity;
  }

  get workIdentity(): string {
    return this.canonicalWorkIdentity;
  }

  equals(other: WorkReference): boolean {
    return (
      this.canonicalProjectIdentity === other.canonicalProjectIdentity
      && this.canonicalWorkIdentity === other.canonicalWorkIdentity
    );
  }
}

export class Responsibility {
  private constructor(
    readonly role: BusinessRoleName,
    readonly key: string,
    readonly description: string,
  ) {
    Object.freeze(this);
  }

  static forRole(role: BusinessRoleName): readonly Responsibility[] {
    return Object.freeze(
      RESPONSIBILITIES_BY_ROLE[role].map(
        (definition) =>
          new Responsibility(role, definition.key, definition.description),
      ),
    );
  }

  equals(other: Responsibility): boolean {
    return this.role === other.role && this.key === other.key;
  }
}

export class BusinessRole {
  private constructor(private readonly canonicalName: BusinessRoleName) {
    Object.freeze(this);
  }

  static of(value: string): BusinessRole {
    if (!isBusinessRoleName(value)) {
      throw new PeopleDomainError(
        "ROLE_NOT_ALLOWED",
        `${value || "<empty>"} is not a canonical BusinessRole.`,
      );
    }
    return new BusinessRole(value);
  }

  get name(): BusinessRoleName {
    return this.canonicalName;
  }

  get responsibilities(): readonly Responsibility[] {
    return Responsibility.forRole(this.canonicalName);
  }

  equals(other: BusinessRole): boolean {
    return this.canonicalName === other.canonicalName;
  }
}

export class AssignmentStatus {
  private constructor(private readonly canonicalName: AssignmentStatusName) {
    Object.freeze(this);
  }

  static of(value: string): AssignmentStatus {
    if (!isAssignmentStatusName(value)) {
      throw new PeopleDomainError(
        "ASSIGNMENT_CONFLICT",
        `${value || "<empty>"} is not a canonical AssignmentStatus.`,
      );
    }
    return new AssignmentStatus(value);
  }

  get name(): AssignmentStatusName {
    return this.canonicalName;
  }

  equals(other: AssignmentStatus): boolean {
    return this.canonicalName === other.canonicalName;
  }

  canTransitionTo(next: AssignmentStatus): boolean {
    if (this.equals(next)) {
      return true;
    }
    if (this.canonicalName === "ACTIVE") {
      return next.canonicalName === "SUSPENDED"
        || next.canonicalName === "ENDED";
    }
    if (this.canonicalName === "SUSPENDED") {
      return next.canonicalName === "ACTIVE"
        || next.canonicalName === "ENDED";
    }
    return false;
  }
}

export class AssignmentPeriod {
  private constructor(
    private readonly effectiveFromEpochMs: number,
    private readonly effectiveUntilEpochMs: number | null,
  ) {
    Object.freeze(this);
  }

  static startingAt(effectiveFrom: Date): AssignmentPeriod {
    return AssignmentPeriod.between(effectiveFrom, null);
  }

  static between(
    effectiveFrom: Date,
    effectiveUntil: Date | null,
  ): AssignmentPeriod {
    const from = assertDate(effectiveFrom, "effectiveFrom");
    const until = effectiveUntil === null
      ? null
      : assertDate(effectiveUntil, "effectiveUntil");
    if (until !== null && until <= from) {
      throw new PeopleDomainError(
        "INVALID_ASSIGNMENT_PERIOD",
        "AssignmentPeriod must end strictly after it starts.",
      );
    }
    return new AssignmentPeriod(from, until);
  }

  get effectiveFrom(): Date {
    return new Date(this.effectiveFromEpochMs);
  }

  get effectiveUntil(): Date | null {
    return this.effectiveUntilEpochMs === null
      ? null
      : new Date(this.effectiveUntilEpochMs);
  }

  get isOpen(): boolean {
    return this.effectiveUntilEpochMs === null;
  }

  contains(instant: Date): boolean {
    const at = assertDate(instant, "instant");
    return (
      at >= this.effectiveFromEpochMs
      && (
        this.effectiveUntilEpochMs === null
        || at < this.effectiveUntilEpochMs
      )
    );
  }

  encloses(other: AssignmentPeriod): boolean {
    const startsBeforeOrWith =
      this.effectiveFromEpochMs <= other.effectiveFromEpochMs;
    const endsAfterOrWith =
      this.effectiveUntilEpochMs === null
      || (
        other.effectiveUntilEpochMs !== null
        && this.effectiveUntilEpochMs >= other.effectiveUntilEpochMs
      );
    return startsBeforeOrWith && endsAfterOrWith;
  }

  overlaps(other: AssignmentPeriod): boolean {
    const thisEnd = this.effectiveUntilEpochMs ?? Number.POSITIVE_INFINITY;
    const otherEnd =
      other.effectiveUntilEpochMs ?? Number.POSITIVE_INFINITY;
    return (
      this.effectiveFromEpochMs < otherEnd
      && other.effectiveFromEpochMs < thisEnd
    );
  }

  equals(other: AssignmentPeriod): boolean {
    return (
      this.effectiveFromEpochMs === other.effectiveFromEpochMs
      && this.effectiveUntilEpochMs === other.effectiveUntilEpochMs
    );
  }
}

export class PeopleProvenance {
  private constructor(
    readonly authority: string,
    readonly businessCause: string,
    private readonly effectiveAtEpochMs: number,
  ) {
    Object.freeze(this);
  }

  static of(
    authority: string,
    businessCause: string,
    effectiveAt: Date,
  ): PeopleProvenance {
    assertCanonicalText(authority, "People provenance authority");
    assertCanonicalText(businessCause, "People provenance business cause");
    return new PeopleProvenance(
      authority,
      businessCause,
      assertDate(effectiveAt, "People provenance effectiveAt"),
    );
  }

  get effectiveAt(): Date {
    return new Date(this.effectiveAtEpochMs);
  }

  equals(other: PeopleProvenance): boolean {
    return (
      this.authority === other.authority
      && this.businessCause === other.businessCause
      && this.effectiveAtEpochMs === other.effectiveAtEpochMs
    );
  }
}

function isBusinessRoleName(value: string): value is BusinessRoleName {
  return (BUSINESS_ROLE_NAMES as readonly string[]).includes(value);
}

function isAssignmentStatusName(
  value: string,
): value is AssignmentStatusName {
  return (ASSIGNMENT_STATUS_NAMES as readonly string[]).includes(value);
}

function assertCanonicalIdentifier(
  value: string,
  code:
    | "BUSINESS_PERSON_NOT_FOUND"
    | "WORK_ASSIGNMENT_NOT_FOUND"
    | "WORK_REFERENCE_NOT_FOUND",
  field: string,
): void {
  if (value.length === 0 || value !== value.trim()) {
    throw new PeopleDomainError(
      code,
      `${field} must be a non-empty canonical identifier.`,
    );
  }
}

function assertCanonicalText(value: string, field: string): void {
  if (value.length === 0 || value !== value.trim()) {
    throw new PeopleDomainError(
      "ASSIGNMENT_CONFLICT",
      `${field} must be a non-empty canonical value.`,
    );
  }
}

function assertDate(value: Date, field: string): number {
  const epochMs = value.getTime();
  if (!Number.isFinite(epochMs)) {
    throw new PeopleDomainError(
      "INVALID_ASSIGNMENT_PERIOD",
      `${field} must be a valid business date.`,
    );
  }
  return epochMs;
}

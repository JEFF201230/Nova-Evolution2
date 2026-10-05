export const WORK_PEOPLE_PATH_PREFIX = "/api/work" as const;
export const RUNTIME_WORK_PEOPLE_PATH_PREFIX = "/api/v1/missions" as const;

export interface WorkPeopleIdentity {
  readonly projectId: string;
  readonly workId: string;
}

export interface WorkPeopleParticipant {
  readonly businessPersonId: string;
  readonly workAssignmentId: string;
}

export interface WorkPeopleQualification {
  readonly sourceDomain: "PEOPLE";
  readonly aggregateRevision: number;
  readonly lastEventSequence: number;
  readonly qualifiedAt: string;
  readonly provenance: Readonly<{
    authority: string;
    businessCause: string;
    effectiveAt: string;
  }>;
}

export type WorkPeopleReadModel =
  | Readonly<{
    workIdentity: WorkPeopleIdentity;
    state: "AVAILABLE";
    participants: readonly WorkPeopleParticipant[];
    qualification: WorkPeopleQualification;
  }>
  | Readonly<{
    workIdentity: WorkPeopleIdentity;
    state: "EMPTY";
    participants: readonly WorkPeopleParticipant[];
    qualification: WorkPeopleQualification;
  }>
  | Readonly<{ workIdentity: WorkPeopleIdentity; state: "ABSENT" | "UNAVAILABLE" }>;

export type WorkPeopleAvailable = Extract<WorkPeopleReadModel, { state: "AVAILABLE" }>;

export interface WorkPeopleResponse {
  readonly people: WorkPeopleReadModel;
}

export function workPeoplePath(workId: string): string {
  return `${WORK_PEOPLE_PATH_PREFIX}/${encodeIdentity(workId)}/people`;
}

export function runtimeWorkPeoplePath(projectId: string, workId: string): string {
  return `${RUNTIME_WORK_PEOPLE_PATH_PREFIX}/${encodeIdentity(projectId)}/${encodeIdentity(workId)}/people`;
}

export function parseWorkPeopleResponse(value: unknown): WorkPeopleResponse {
  assertRecord(value);
  assertExactKeys(value, ["people"]);
  assertRecord(value.people);
  const people = value.people;
  assertIdentity(people.workIdentity);

  if (people.state === "AVAILABLE" || people.state === "EMPTY") {
    assertExactKeys(people, ["participants", "qualification", "state", "workIdentity"]);
    if (!Array.isArray(people.participants)) throw invalidContract();
    if (people.state === "AVAILABLE" && people.participants.length === 0) throw invalidContract();
    if (people.state === "EMPTY" && people.participants.length !== 0) throw invalidContract();
    for (const participant of people.participants) {
      assertRecord(participant);
      assertExactKeys(participant, ["businessPersonId", "workAssignmentId"]);
      assertNonEmptyString(participant.businessPersonId);
      assertNonEmptyString(participant.workAssignmentId);
    }
    assertQualification(people.qualification);
  } else if (people.state === "ABSENT" || people.state === "UNAVAILABLE") {
    assertExactKeys(people, ["state", "workIdentity"]);
  } else {
    throw invalidContract();
  }

  return immutableJsonCopy(value as unknown as WorkPeopleResponse);
}

function assertIdentity(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, ["projectId", "workId"]);
  assertNonEmptyString(value.projectId);
  assertNonEmptyString(value.workId);
}

function assertQualification(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, ["aggregateRevision", "lastEventSequence", "provenance", "qualifiedAt", "sourceDomain"]);
  if (value.sourceDomain !== "PEOPLE") throw invalidContract();
  if (!Number.isSafeInteger(value.aggregateRevision) || (value.aggregateRevision as number) < 0) throw invalidContract();
  if (!Number.isSafeInteger(value.lastEventSequence) || (value.lastEventSequence as number) < 0) throw invalidContract();
  assertTimestamp(value.qualifiedAt);
  assertRecord(value.provenance);
  assertExactKeys(value.provenance, ["authority", "businessCause", "effectiveAt"]);
  assertNonEmptyString(value.provenance.authority);
  assertNonEmptyString(value.provenance.businessCause);
  assertTimestamp(value.provenance.effectiveAt);
}

function encodeIdentity(value: string): string {
  assertNonEmptyString(value);
  return encodeURIComponent(value);
}

function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw invalidContract();
}

function assertExactKeys(value: Record<string, unknown>, expected: readonly string[]): void {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (actual.length !== sortedExpected.length || actual.some((key, index) => key !== sortedExpected[index])) {
    throw invalidContract();
  }
}

function assertNonEmptyString(value: unknown): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) throw invalidContract();
}

function assertTimestamp(value: unknown): asserts value is string {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw invalidContract();
}

function immutableJsonCopy<T>(value: T): T {
  return deepFreeze(JSON.parse(JSON.stringify(value)) as T);
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function invalidContract(): Error {
  return new Error("WORK_PEOPLE_CONTRACT_INVALID");
}

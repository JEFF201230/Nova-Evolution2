export const WORK_ACTIVITY_PATH_PREFIX = "/api/work" as const;

export interface WorkActivityRuntimeEvent {
  readonly eventId: string;
  readonly eventName: string;
  readonly projectId: string;
  readonly missionId: string;
  readonly runId?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly sequence: number;
  readonly sourceState: string | null;
  readonly targetState: string | null;
  readonly producer: string;
  readonly occurredAt: string;
  readonly publishedAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly previousHash?: string | null;
  readonly eventHash?: string;
  readonly schemaVersion?: number;
}

export interface WorkActivityResponse {
  readonly workIdentity: {
    readonly workId: string;
    readonly projectId: string;
  };
  readonly mission: {
    readonly projectId: string;
    readonly missionId: string;
  };
  readonly events: readonly WorkActivityRuntimeEvent[];
}

export function workActivityPath(workId: string): string {
  if (
    typeof workId !== "string"
    || workId.length === 0
    || workId !== workId.trim()
  ) {
    throw invalidContract();
  }

  return `${WORK_ACTIVITY_PATH_PREFIX}/${encodeURIComponent(workId)}/activity`;
}

export function runtimeMissionEventsPath(
  projectId: string,
  missionId: string,
): string {
  assertNonEmptyString(projectId);
  assertNonEmptyString(missionId);

  return `/api/v1/missions/${encodeURIComponent(projectId)}/${encodeURIComponent(missionId)}/events`;
}

export function parseWorkActivityResponse(
  value: unknown,
): WorkActivityResponse {
  assertRecord(value);
  assertExactKeys(value, [
    "events",
    "mission",
    "workIdentity",
  ]);

  assertIdentity(value.workIdentity);
  assertMission(value.mission);

  if (!Array.isArray(value.events)) {
    throw invalidContract();
  }

  for (const event of value.events) {
    assertRuntimeEvent(event);
  }

  const identity = value.workIdentity as Record<string, unknown>;
  const mission = value.mission as Record<string, unknown>;

  if (
    identity.workId !== mission.missionId
    || identity.projectId !== mission.projectId
  ) {
    throw invalidContract();
  }

  let previousSequence = -1;
  for (const event of value.events) {
    const runtimeEvent = event as Record<string, unknown>;
    if (
      runtimeEvent.projectId !== mission.projectId
      || runtimeEvent.missionId !== mission.missionId
      || (runtimeEvent.sequence as number) <= previousSequence
    ) {
      throw invalidContract();
    }
    previousSequence = runtimeEvent.sequence as number;
  }

  return immutableJsonCopy(value as unknown as WorkActivityResponse);
}

function assertIdentity(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, ["projectId", "workId"]);
  assertNonEmptyString(value.projectId);
  assertNonEmptyString(value.workId);
}

function assertMission(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, ["missionId", "projectId"]);
  assertNonEmptyString(value.projectId);
  assertNonEmptyString(value.missionId);
}

function assertRuntimeEvent(value: unknown): void {
  assertRecord(value);

  const requiredKeys = [
    "correlationId",
    "eventId",
    "eventName",
    "metadata",
    "missionId",
    "occurredAt",
    "payload",
    "producer",
    "projectId",
    "publishedAt",
    "sequence",
    "sourceState",
    "targetState",
  ];

  const optionalKeys = [
    "causationId",
    "eventHash",
    "previousHash",
    "runId",
    "schemaVersion",
  ];

  assertAllowedKeys(value, requiredKeys, optionalKeys);

  for (const key of requiredKeys) {
    if (!(key in value)) {
      throw invalidContract();
    }
  }

  assertNonEmptyString(value.eventId);
  assertNonEmptyString(value.eventName);
  assertNonEmptyString(value.projectId);
  assertNonEmptyString(value.missionId);
  assertNonEmptyString(value.correlationId);
  assertNonEmptyString(value.producer);
  assertTimestamp(value.occurredAt);
  assertTimestamp(value.publishedAt);

  if (
    !Number.isSafeInteger(value.sequence)
    || (value.sequence as number) < 0
  ) {
    throw invalidContract();
  }

  assertNullableString(value.sourceState);
  assertNullableString(value.targetState);
  assertRecord(value.payload);
  assertRecord(value.metadata);

  if ("runId" in value) {
    assertOptionalNonEmptyString(value.runId);
  }
  if ("causationId" in value) {
    assertOptionalNonEmptyString(value.causationId);
  }
  if ("previousHash" in value) {
    if (
      value.previousHash !== null
      && typeof value.previousHash !== "string"
    ) {
      throw invalidContract();
    }
  }
  if ("eventHash" in value) {
    assertOptionalNonEmptyString(value.eventHash);
  }
  if (
    "schemaVersion" in value
    && (
      !Number.isSafeInteger(value.schemaVersion)
      || (value.schemaVersion as number) < 0
    )
  ) {
    throw invalidContract();
  }
}

function assertRecord(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (
    typeof value !== "object"
    || value === null
    || Array.isArray(value)
  ) {
    throw invalidContract();
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): void {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();

  if (
    actual.length !== sortedExpected.length
    || actual.some((key, index) => key !== sortedExpected[index])
  ) {
    throw invalidContract();
  }
}

function assertAllowedKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
): void {
  const allowed = new Set([...required, ...optional]);

  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw invalidContract();
  }
}

function assertNonEmptyString(
  value: unknown,
): asserts value is string {
  if (
    typeof value !== "string"
    || value.length === 0
    || value !== value.trim()
  ) {
    throw invalidContract();
  }
}

function assertOptionalNonEmptyString(value: unknown): void {
  assertNonEmptyString(value);
}

function assertNullableString(value: unknown): void {
  if (value !== null) {
    assertNonEmptyString(value);
  }
}

function assertTimestamp(value: unknown): asserts value is string {
  if (
    typeof value !== "string"
    || !Number.isFinite(Date.parse(value))
  ) {
    throw invalidContract();
  }
}

function immutableJsonCopy<T>(value: T): T {
  return deepFreeze(JSON.parse(JSON.stringify(value)) as T);
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

function invalidContract(): Error {
  return new Error("WORK_ACTIVITY_CONTRACT_INVALID");
}

export const HOME_ACTIVE_WORK_PATH = "/api/home/active-work" as const;
export const RUNTIME_ACTIVE_WORK_PATH = "/api/v1/work/active" as const;

export const HOME_ACTIVE_WORK_LIFECYCLES = [
  "CREATED",
  "READY",
  "ACTIVE",
  "WAITING",
  "VALIDATING",
  "FAILED",
] as const;

export type HomeActiveWorkLifecycle =
  (typeof HOME_ACTIVE_WORK_LIFECYCLES)[number];

export interface HomeActiveWorkProvenance {
  readonly sourceDomain: "MISSIONS" | "MONITORING" | "WORK";
  readonly producer: string;
  readonly sourceId: string;
  readonly observedAt: string;
}

export interface HomeActiveWorkProgressProvenance
  extends HomeActiveWorkProvenance {
  readonly sequence: number;
  readonly correlationId: string;
  readonly runId: string | null;
}

export interface HomeActiveWorkItem {
  readonly workIdentity: {
    readonly workId: string;
    readonly projectId: string;
  };
  readonly mission: {
    readonly projectId: string;
    readonly missionId: string;
  };
  readonly goal: string;
  readonly lifecycle: HomeActiveWorkLifecycle;
  readonly progress: number;
  readonly updatedAt: string;
  readonly provenance: {
    readonly identity: HomeActiveWorkProvenance;
    readonly lifecycle: HomeActiveWorkProvenance;
    readonly progress: HomeActiveWorkProgressProvenance;
  };
}

export interface HomeActiveWorkResponse {
  readonly works: readonly HomeActiveWorkItem[];
}

export function parseHomeActiveWorkResponse(
  value: unknown,
): HomeActiveWorkResponse {
  assertRecord(value);
  assertExactKeys(value, ["works"]);
  if (!Array.isArray(value.works)) {
    throw invalidContract();
  }
  for (const work of value.works) {
    assertWork(work);
  }
  return immutableJsonCopy(value as unknown as HomeActiveWorkResponse);
}

function assertWork(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, [
    "goal",
    "lifecycle",
    "mission",
    "progress",
    "provenance",
    "updatedAt",
    "workIdentity",
  ]);
  assertIdentity(value.workIdentity);
  assertMission(value.mission);
  assertNonEmptyString(value.goal);
  if (
    typeof value.lifecycle !== "string"
    || !HOME_ACTIVE_WORK_LIFECYCLES.includes(
      value.lifecycle as HomeActiveWorkLifecycle,
    )
  ) {
    throw invalidContract();
  }
  if (
    typeof value.progress !== "number"
    || !Number.isFinite(value.progress)
    || value.progress < 0
    || value.progress > 100
  ) {
    throw invalidContract();
  }
  assertTimestamp(value.updatedAt);
  assertRecord(value.provenance);
  assertExactKeys(value.provenance, [
    "identity",
    "lifecycle",
    "progress",
  ]);
  assertProvenance(value.provenance.identity);
  assertProvenance(value.provenance.lifecycle);
  assertProgressProvenance(value.provenance.progress);
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

function assertProvenance(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, [
    "observedAt",
    "producer",
    "sourceDomain",
    "sourceId",
  ]);
  if (
    value.sourceDomain !== "MISSIONS"
    && value.sourceDomain !== "MONITORING"
    && value.sourceDomain !== "WORK"
  ) {
    throw invalidContract();
  }
  assertNonEmptyString(value.producer);
  assertNonEmptyString(value.sourceId);
  assertTimestamp(value.observedAt);
}

function assertProgressProvenance(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, [
    "correlationId",
    "observedAt",
    "producer",
    "runId",
    "sequence",
    "sourceDomain",
    "sourceId",
  ]);
  if (
    value.sourceDomain !== "MONITORING"
    || !Number.isSafeInteger(value.sequence)
    || (value.sequence as number) < 0
    || (value.runId !== null && typeof value.runId !== "string")
  ) {
    throw invalidContract();
  }
  assertNonEmptyString(value.producer);
  assertNonEmptyString(value.sourceId);
  assertNonEmptyString(value.correlationId);
  assertTimestamp(value.observedAt);
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
  if (
    actual.length !== expected.length
    || actual.some((key, index) => key !== expected[index])
  ) {
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
  return new Error("HOME_ACTIVE_WORK_CONTRACT_INVALID");
}

export const WORK_PLAN_PATH_PREFIX = "/api/work" as const;
export const RUNTIME_WORK_PLAN_PATH_PREFIX = "/api/v1/missions" as const;

export interface WorkPlanIdentity {
  readonly projectId: string;
  readonly workId: string;
}

export type WorkPlanReadModel =
  | Readonly<{
    workIdentity: WorkPlanIdentity;
    state: "AVAILABLE";
    phase: Readonly<{ current: number; total: number; phaseId: string }>;
    dueAt: string | null;
    dependencies: readonly Readonly<{ prerequisite: string; dependent: string }>[];
  }>
  | Readonly<{ workIdentity: WorkPlanIdentity; state: "ABSENT" }>
  | Readonly<{ workIdentity: WorkPlanIdentity; state: "WITHDRAWN" }>
  | Readonly<{ workIdentity: WorkPlanIdentity; state: "UNAVAILABLE" }>;

export type WorkPlanAvailable = Extract<WorkPlanReadModel, { state: "AVAILABLE" }>;

export interface WorkPlanResponse {
  readonly plan: WorkPlanReadModel;
}

export function workPlanPath(workId: string): string {
  return `${WORK_PLAN_PATH_PREFIX}/${encodeIdentity(workId)}/plan`;
}

export function runtimeWorkPlanPath(projectId: string, workId: string): string {
  return `${RUNTIME_WORK_PLAN_PATH_PREFIX}/${encodeIdentity(projectId)}/${encodeIdentity(workId)}/plan`;
}

export function parseWorkPlanResponse(value: unknown): WorkPlanResponse {
  assertRecord(value);
  assertExactKeys(value, ["plan"]);
  assertRecord(value.plan);
  const plan = value.plan;
  assertIdentity(plan.workIdentity);

  if (plan.state === "AVAILABLE") {
    assertExactKeys(plan, ["dependencies", "dueAt", "phase", "state", "workIdentity"]);
    assertRecord(plan.phase);
    assertExactKeys(plan.phase, ["current", "phaseId", "total"]);
    if (
      !Number.isSafeInteger(plan.phase.current)
      || !Number.isSafeInteger(plan.phase.total)
      || (plan.phase.current as number) < 1
      || (plan.phase.total as number) < (plan.phase.current as number)
    ) {
      throw invalidContract();
    }
    assertNonEmptyString(plan.phase.phaseId);
    if (plan.dueAt !== null) assertTimestamp(plan.dueAt);
    if (!Array.isArray(plan.dependencies)) throw invalidContract();
    for (const dependency of plan.dependencies) {
      assertRecord(dependency);
      assertExactKeys(dependency, ["dependent", "prerequisite"]);
      assertNonEmptyString(dependency.prerequisite);
      assertNonEmptyString(dependency.dependent);
    }
  } else if (
    plan.state === "ABSENT"
    || plan.state === "WITHDRAWN"
    || plan.state === "UNAVAILABLE"
  ) {
    assertExactKeys(plan, ["state", "workIdentity"]);
  } else {
    throw invalidContract();
  }

  return immutableJsonCopy(value as unknown as WorkPlanResponse);
}

function assertIdentity(value: unknown): void {
  assertRecord(value);
  assertExactKeys(value, ["projectId", "workId"]);
  assertNonEmptyString(value.projectId);
  assertNonEmptyString(value.workId);
}

function encodeIdentity(value: string): string {
  assertNonEmptyString(value);
  return encodeURIComponent(value);
}

function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw invalidContract();
  }
}

function assertExactKeys(value: Record<string, unknown>, expected: readonly string[]): void {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (
    actual.length !== sortedExpected.length
    || actual.some((key, index) => key !== sortedExpected[index])
  ) {
    throw invalidContract();
  }
}

function assertNonEmptyString(value: unknown): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw invalidContract();
  }
}

function assertTimestamp(value: unknown): asserts value is string {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    throw invalidContract();
  }
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
  return new Error("WORK_PLAN_CONTRACT_INVALID");
}

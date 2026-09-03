export const GLOBAL_DELIVERABLES_PATH = "/api/global/deliverables" as const;

export interface GlobalDeliverableEvidence {
  readonly projectId: string;
  readonly missionId: string;
  readonly reportId: string;
  readonly path: string;
  readonly size: number;
  readonly sha256: string;
  readonly modifiedAt: string;
  readonly runId: string;
}

export interface GlobalDeliverablesResponse {
  readonly deliverables: readonly GlobalDeliverableEvidence[];
}

export function parseGlobalDeliverablesResponse(
  value: unknown,
): GlobalDeliverablesResponse {
  assertRecord(value);
  assertExactKeys(value, ["deliverables"]);
  if (!Array.isArray(value.deliverables)) {
    throw invalidContract();
  }
  for (const deliverable of value.deliverables) {
    assertRecord(deliverable);
    assertExactKeys(deliverable, [
      "missionId",
      "modifiedAt",
      "path",
      "projectId",
      "reportId",
      "runId",
      "sha256",
      "size",
    ]);
    assertNonEmptyString(deliverable.projectId);
    assertNonEmptyString(deliverable.missionId);
    assertNonEmptyString(deliverable.reportId);
    assertNonEmptyString(deliverable.path);
    if (!Number.isSafeInteger(deliverable.size) || (deliverable.size as number) < 0) {
      throw invalidContract();
    }
    if (typeof deliverable.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(deliverable.sha256)) {
      throw invalidContract();
    }
    assertTimestamp(deliverable.modifiedAt);
    assertNonEmptyString(deliverable.runId);
  }
  return deepFreeze(JSON.parse(JSON.stringify(value)) as GlobalDeliverablesResponse);
}

function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw invalidContract();
  }
}

function assertExactKeys(value: Record<string, unknown>, expected: readonly string[]): void {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (actual.length !== sortedExpected.length
    || actual.some((key, index) => key !== sortedExpected[index])) {
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
  return new Error("GLOBAL_DELIVERABLES_CONTRACT_INVALID");
}

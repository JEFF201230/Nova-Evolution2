import { BffError } from "./bff.errors.js";

export const MISSION_RUNTIME_MISSIONS_PATH = "/api/mission-runtime/missions";
export const MISSION_RUNTIME_PROJECTS_PATH = "/api/mission-runtime/projects";

export interface MissionRuntimeProjectTargetView {
  readonly projectId: string;
}

export interface MissionRuntimeProjectsResponseDto {
  readonly projects: readonly MissionRuntimeProjectTargetView[];
}

export interface MissionCreateRequestDto {
  readonly projectId: string;
  readonly missionId: string;
  readonly missionType: string;
  readonly objective: string;
  readonly authority: string;
  readonly scope: {
    readonly allowed: readonly string[];
    readonly forbidden: readonly string[];
  };
  readonly deliverables: readonly string[];
  readonly stopCriteria: readonly string[];
  readonly authorizedReferences: readonly string[];
  readonly requestedAgentId?: string;
  readonly priority?: number;
  readonly createdAt?: string;
}

export type MissionExecutionProfile = "FAST" | "BUILD" | "ARCHITECTURE" | "READ_ONLY";

export interface MissionExecuteRequestDto {
  readonly profile?: MissionExecutionProfile;
  readonly prompt?: string;
  readonly expectedBranch?: string;
  readonly changesExpected?: boolean;
  readonly humanReviewRequired?: boolean;
  readonly timeoutMs?: number;
}

export interface MissionRuntimeMissionView {
  readonly projectId: string;
  readonly missionId: string;
  readonly missionType: string;
  readonly state: string;
  readonly canonicalState: string;
  readonly assignedAgentId: string | null;
  readonly runId: string | null;
  readonly reportId: string | null;
  readonly updatedAt: string;
}

export interface MissionCreateResponseDto {
  readonly created: boolean;
  readonly mission: MissionRuntimeMissionView;
}

export interface MissionRuntimeReportView {
  readonly projectId: string;
  readonly missionId: string;
  readonly reportId: string;
  readonly reportType: string;
  readonly runId: string;
  readonly reportFingerprint: string;
  readonly scopeConfirmed: boolean;
  readonly submittedAt: string;
}

export interface MissionExecuteResponseDto {
  readonly mission: MissionRuntimeMissionView;
  readonly report: MissionRuntimeReportView;
}

export function missionRuntimeExecutePath(projectId: string, missionId: string): string {
  return `${MISSION_RUNTIME_MISSIONS_PATH}/${encodeURIComponent(projectId)}/${encodeURIComponent(missionId)}/execute`;
}

export function missionIdentityFromExecutePath(
  pathname: string,
): { projectId: string; missionId: string } | null {
  const escapedPrefix = MISSION_RUNTIME_MISSIONS_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escapedPrefix}/([^/]+)/([^/]+)/execute$`).exec(pathname);
  if (!match?.[1] || !match[2]) {
    return null;
  }
  try {
    const projectId = decodeURIComponent(match[1]);
    const missionId = decodeURIComponent(match[2]);
    if (!isNonEmptyString(projectId) || !isNonEmptyString(missionId)) {
      return null;
    }
    return { projectId, missionId };
  } catch {
    return null;
  }
}

export function parseMissionCreateRequest(
  body: Record<string, unknown> | null,
): MissionCreateRequestDto {
  const value = requireRecord(body);
  assertExactKeys(
    value,
    [
      "projectId", "missionId", "missionType", "objective", "authority", "scope",
      "deliverables", "stopCriteria", "authorizedReferences", "requestedAgentId",
      "priority", "createdAt",
    ],
    [
      "projectId", "missionId", "missionType", "objective", "authority", "scope",
      "deliverables", "stopCriteria", "authorizedReferences",
    ],
  );
  const scope = requireRecord(value.scope);
  assertExactKeys(scope, ["allowed", "forbidden"], ["allowed", "forbidden"]);
  return {
    projectId: requiredString(value.projectId, 4_096),
    missionId: requiredString(value.missionId, 4_096),
    missionType: requiredString(value.missionType, 4_096),
    objective: requiredString(value.objective, 20_000),
    authority: requiredString(value.authority, 4_096),
    scope: {
      allowed: stringArray(scope.allowed),
      forbidden: stringArray(scope.forbidden),
    },
    deliverables: stringArray(value.deliverables),
    stopCriteria: stringArray(value.stopCriteria),
    authorizedReferences: stringArray(value.authorizedReferences),
    ...(value.requestedAgentId === undefined
      ? {}
      : { requestedAgentId: requiredString(value.requestedAgentId, 4_096) }),
    ...(value.priority === undefined ? {} : { priority: finiteNumber(value.priority) }),
    ...(value.createdAt === undefined
      ? {}
      : { createdAt: requiredString(value.createdAt, 4_096) }),
  };
}

export function parseMissionExecuteRequest(
  body: Record<string, unknown> | null,
): MissionExecuteRequestDto {
  const value = body ?? {};
  assertExactKeys(
    value,
    ["profile", "prompt", "expectedBranch", "changesExpected", "humanReviewRequired", "timeoutMs"],
    [],
  );
  const profiles = new Set<MissionExecutionProfile>(["FAST", "BUILD", "ARCHITECTURE", "READ_ONLY"]);
  if (value.profile !== undefined && (typeof value.profile !== "string" || !profiles.has(value.profile as MissionExecutionProfile))) {
    throw invalidRequest();
  }
  return {
    ...(value.profile === undefined ? {} : { profile: value.profile as MissionExecutionProfile }),
    ...(value.prompt === undefined ? {} : { prompt: requiredString(value.prompt, 100_000) }),
    ...(value.expectedBranch === undefined
      ? {}
      : { expectedBranch: requiredString(value.expectedBranch, 4_096) }),
    ...(value.changesExpected === undefined
      ? {}
      : { changesExpected: requiredBoolean(value.changesExpected) }),
    ...(value.humanReviewRequired === undefined
      ? {}
      : { humanReviewRequired: requiredBoolean(value.humanReviewRequired) }),
    ...(value.timeoutMs === undefined ? {} : { timeoutMs: executionTimeout(value.timeoutMs) }),
  };
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw invalidRequest();
  }
  return value;
}

function assertExactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[],
): void {
  const keys = Object.keys(value);
  if (keys.some((key) => !allowed.includes(key)) || required.some((key) => !keys.includes(key))) {
    throw invalidRequest();
  }
}

function requiredString(value: unknown, maximumLength: number): string {
  if (!isNonEmptyString(value) || value.length > maximumLength) {
    throw invalidRequest();
  }
  return value;
}

function stringArray(value: unknown): readonly string[] {
  if (
    !Array.isArray(value)
    || value.length > 1_000
    || value.some((entry) => !isNonEmptyString(entry) || entry.length > 4_096)
  ) {
    throw invalidRequest();
  }
  return value as string[];
}

function finiteNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw invalidRequest();
  }
  return value;
}

function requiredBoolean(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw invalidRequest();
  }
  return value;
}

function executionTimeout(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 24 * 60 * 60_000) {
    throw invalidRequest();
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value === value.trim();
}

function invalidRequest(): BffError {
  return new BffError(
    400,
    "MISSION_RUNTIME_REQUEST_INVALID",
    "The Mission Runtime request is invalid.",
  );
}

import type {
  DurableExecutionSecurityIdentity,
  DurableExecutionWorkspaceIdentity,
} from "./durable-execution-session.js";
import type {
  GitProvenance,
} from "./git-provenance.js";

export interface ExecutionSessionSecurityContext {
  readonly operatorIdentity: DurableExecutionSecurityIdentity;
  readonly workspaceIdentity: DurableExecutionWorkspaceIdentity;
  readonly requestFingerprint: string;
}

export type ExecutionSessionStatus =
  | "COMPLETED"
  | "FAILED"
  | "TIMEOUT"
  | "CANCELLED"
  | "INTERRUPTED"
  | "CONNECTION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "RUNTIME_ERROR";

export interface ExecutionSessionInput {
  readonly executionSessionId: string;
  readonly missionId: string;
  readonly promptPackageId: string;
  readonly runtimeMissionId: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly status: ExecutionSessionStatus;
  readonly rawCodexResult: unknown;
  readonly gitProvenance?: GitProvenance | null;
  readonly securityContext?: ExecutionSessionSecurityContext | null;
}

export class ExecutionSession {
  readonly executionSessionId: string;
  readonly missionId: string;
  readonly promptPackageId: string;
  readonly runtimeMissionId: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly status: ExecutionSessionStatus;
  readonly rawCodexResult: unknown;
  readonly gitProvenance: GitProvenance | null;
  readonly securityContext: ExecutionSessionSecurityContext | null;

  constructor(input: ExecutionSessionInput) {
    assertInput(input);

    this.executionSessionId = input.executionSessionId;
    this.missionId = input.missionId;
    this.promptPackageId = input.promptPackageId;
    this.runtimeMissionId = input.runtimeMissionId;
    this.startedAt = input.startedAt;
    this.completedAt = input.completedAt;
    this.durationMs = input.durationMs;
    this.status = input.status;
    this.rawCodexResult = input.rawCodexResult;
    this.gitProvenance = input.gitProvenance ?? null;
    this.securityContext = input.securityContext ?? null;

    Object.freeze(this);
  }
}

function assertInput(input: ExecutionSessionInput): void {
  if (
    !isRecord(input) ||
    !isToken(input.executionSessionId) ||
    !isToken(input.missionId) ||
    !isToken(input.promptPackageId) ||
    !isToken(input.runtimeMissionId)
  ) {
    throw new Error(
      "ES-001: ExecutionSession requires complete traceability identifiers.",
    );
  }

  const startedAt = timestamp(input.startedAt);
  const completedAt = timestamp(input.completedAt);
  if (
    startedAt === null ||
    completedAt === null ||
    completedAt < startedAt
  ) {
    throw new Error(
      "ES-002: ExecutionSession requires ordered canonical timestamps.",
    );
  }

  if (
    !Number.isSafeInteger(input.durationMs) ||
    input.durationMs < 0
  ) {
    throw new Error(
      "ES-003: ExecutionSession requires a non-negative duration.",
    );
  }

  if (!isStatus(input.status)) {
    throw new Error(
      "ES-004: ExecutionSession requires a known terminal status.",
    );
  }
  if (
    input.securityContext !== undefined &&
    input.securityContext !== null &&
    (
      !isRecord(input.securityContext) ||
      !isRecord(input.securityContext.operatorIdentity) ||
      input.securityContext.operatorIdentity.authorization !== "EXECUTE" ||
      !isRecord(input.securityContext.workspaceIdentity) ||
      typeof input.securityContext.requestFingerprint !== "string" ||
      !/^[0-9a-f]{64}$/.test(input.securityContext.requestFingerprint)
    )
  ) {
    throw new Error(
      "ES-005: ExecutionSession security context is invalid.",
    );
  }
}

function isStatus(value: unknown): value is ExecutionSessionStatus {
  return (
    value === "COMPLETED" ||
    value === "FAILED" ||
    value === "TIMEOUT" ||
    value === "CANCELLED" ||
    value === "INTERRUPTED" ||
    value === "CONNECTION_ERROR" ||
    value === "AUTHENTICATION_ERROR" ||
    value === "RUNTIME_ERROR"
  );
}

function timestamp(value: unknown): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const milliseconds = Date.parse(value);
  return (
    Number.isFinite(milliseconds) &&
    new Date(milliseconds).toISOString() === value
      ? milliseconds
      : null
  );
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";
import {
  ExecutionSession,
  type ExecutionSessionInput,
} from "./execution-session.js";
import {
  canonicalJson,
  sha256,
} from "./run-binding.js";

export type PersistedExecutionOutcome =
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "TIMEOUT";

export interface ExecutionFailureSnapshot {
  readonly name: string;
  readonly message: string;
  readonly code: string | null;
  readonly rawResult: unknown;
}

export interface PersistedExecutionSession {
  readonly schemaVersion: 1;
  readonly outcome: PersistedExecutionOutcome;
  readonly session: ExecutionSessionInput;
  readonly failure: ExecutionFailureSnapshot | null;
  readonly fingerprint: string;
}

export interface ExecutionSessionPersistencePort {
  isReady?(): boolean;
  persist(
    session: ExecutionSession,
    outcome: PersistedExecutionOutcome,
    failure?: unknown,
  ): Promise<PersistedExecutionSession | null>;
}

export interface ExecutionSessionPersistenceFeatureFlag {
  readonly enabled: boolean;
}

export class ExecutionSessionPersistenceError extends Error {
  readonly code = "EXECUTION_SESSION_PERSISTENCE_ERROR";

  constructor(readonly reason: string) {
    super(`ExecutionSession persistence failed: ${reason}.`);
    this.name = "ExecutionSessionPersistenceError";
  }
}

export class ExecutionSessionPersistence
implements ExecutionSessionPersistencePort {
  readonly enabled: boolean;

  constructor(
    private readonly repository: IntegrationRuntimeRepository | null = null,
    featureFlag: ExecutionSessionPersistenceFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  isReady(): boolean {
    return this.enabled && this.repository !== null;
  }

  async persist(
    session: ExecutionSession,
    outcome: PersistedExecutionOutcome,
    failure?: unknown,
  ): Promise<PersistedExecutionSession | null> {
    if (!this.enabled) {
      return null;
    }
    if (
      this.repository === null ||
      !isOutcome(outcome) ||
      !(session instanceof ExecutionSession)
    ) {
      throw new ExecutionSessionPersistenceError(
        "REPOSITORY_OR_INPUT_INVALID",
      );
    }

    const failureSnapshot =
      outcome === "SUCCESS" ? null : snapshotFailure(failure);
    const unsigned = {
      schemaVersion: 1 as const,
      outcome,
      session: toSerializableSession(session),
      failure: failureSnapshot,
    };
    const payload: PersistedExecutionSession = Object.freeze({
      ...unsigned,
      fingerprint: sha256(canonicalJson(unsigned)),
    });
    const record: IntegrationPersistedRecord<PersistedExecutionSession> = {
      schemaVersion: 1,
      recordId: [
        "SESSION",
        session.executionSessionId,
        outcome,
        payload.fingerprint,
      ].join(":"),
      kind: "SESSION",
      missionId: session.missionId,
      runId: session.executionSessionId,
      source: "NOVA_PROGRAM_INTEGRATION",
      occurredAt: session.completedAt,
      payload,
    };
    const persisted = await this.repository.append(record);
    if (persisted === null) {
      throw new ExecutionSessionPersistenceError(
        "REPOSITORY_INACTIVE",
      );
    }
    return payload;
  }

  async history(
    missionId: string,
    executionSessionId: string,
  ): Promise<readonly PersistedExecutionSession[]> {
    if (!this.enabled) {
      return Object.freeze([]);
    }
    if (this.repository === null) {
      throw new ExecutionSessionPersistenceError("REPOSITORY_MISSING");
    }
    const records = await this.repository.readAll();
    return Object.freeze(
      records
        .filter(
          (record) =>
            record.kind === "SESSION" &&
            record.missionId === missionId &&
            record.runId === executionSessionId,
        )
        .map((record) => assertPersistedPayload(record.payload)),
    );
  }

  async reconstruct(
    missionId: string,
    executionSessionId: string,
  ): Promise<PersistedExecutionSession | null> {
    if (!this.enabled) {
      return null;
    }
    const history = await this.history(missionId, executionSessionId);
    return history.at(-1) ?? null;
  }

  async replay(
    missionId: string,
    executionSessionId: string,
  ): Promise<readonly PersistedExecutionSession[]> {
    if (!this.enabled) {
      return Object.freeze([]);
    }
    return this.history(missionId, executionSessionId);
  }
}

export function snapshotFailure(
  failure: unknown,
): ExecutionFailureSnapshot {
  if (!(failure instanceof Error)) {
    return Object.freeze({
      name: "NonErrorFailure",
      message: String(failure),
      code: null,
      rawResult: null,
    });
  }
  const code =
    "code" in failure && typeof failure.code === "string"
      ? failure.code
      : null;
  const rawResult =
    "rawResult" in failure ? failure.rawResult : null;
  return Object.freeze({
    name: failure.name,
    message: failure.message,
    code,
    rawResult,
  });
}

export function toSerializableSession(
  session: ExecutionSession,
): ExecutionSessionInput {
  return Object.freeze({
    executionSessionId: session.executionSessionId,
    missionId: session.missionId,
    promptPackageId: session.promptPackageId,
    runtimeMissionId: session.runtimeMissionId,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationMs: session.durationMs,
    status: session.status,
    rawCodexResult: structuredClone(session.rawCodexResult),
    gitProvenance: structuredClone(session.gitProvenance),
    securityContext: structuredClone(session.securityContext),
  });
}

function assertPersistedPayload(
  value: unknown,
): PersistedExecutionSession {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isOutcome(value.outcome) ||
    !isRecord(value.session) ||
    typeof value.fingerprint !== "string"
  ) {
    throw new ExecutionSessionPersistenceError(
      "PERSISTED_RECORD_INVALID",
    );
  }
  const unsigned = {
    schemaVersion: value.schemaVersion,
    outcome: value.outcome,
    session: value.session,
    failure: value.failure,
  };
  if (sha256(canonicalJson(unsigned)) !== value.fingerprint) {
    throw new ExecutionSessionPersistenceError(
      "PERSISTED_RECORD_TAMPERED",
    );
  }
  return value as unknown as PersistedExecutionSession;
}

function isOutcome(value: unknown): value is PersistedExecutionOutcome {
  return (
    value === "SUCCESS" ||
    value === "FAILED" ||
    value === "CANCELLED" ||
    value === "TIMEOUT"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

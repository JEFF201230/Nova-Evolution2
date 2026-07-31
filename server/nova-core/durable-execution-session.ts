import type {
  GitProvenance,
} from "./git-provenance.js";
import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";
import {
  canonicalJson,
  sha256,
} from "./run-binding.js";

export type DurableExecutionCheckpoint =
  | "PREPARED"
  | "TRANSPORT_STARTED"
  | "RESULT_RECEIVED"
  | "RUNTIME_STARTED"
  | "RUNTIME_COMPLETED"
  | "CERTIFIED"
  | "FAILED"
  | "CANCELLED"
  | "TIMEOUT"
  | "INTERRUPTED";

export interface DurableExecutionSecurityIdentity {
  readonly operatorId: string;
  readonly environmentId: string;
  readonly runtimeId: string;
  readonly codexTransportId: string;
  readonly authorization: "EXECUTE";
}

export interface DurableExecutionWorkspaceIdentity {
  readonly workspaceId: string;
  readonly repositoryId: string;
  readonly canonicalRoot: string;
  readonly sandboxRoot: string;
}

export interface DurableExecutionRecoveryMetadata {
  readonly checkpoint: DurableExecutionCheckpoint;
  readonly attempt: number;
  readonly transportMayHaveExecuted: boolean;
  readonly runtimeMayHaveExecuted: boolean;
  readonly certified: boolean;
}

export interface DurableExecutionSession {
  readonly schemaVersion: 1;
  readonly kind: "DURABLE_EXECUTION_CHECKPOINT";
  readonly missionId: string;
  readonly executionSessionId: string;
  readonly promptPackageId: string;
  readonly runtimeMissionId: string;
  readonly operatorIdentity: DurableExecutionSecurityIdentity;
  readonly workspaceIdentity: DurableExecutionWorkspaceIdentity;
  readonly gitProvenance: GitProvenance;
  readonly requestFingerprint: string;
  readonly status: DurableExecutionCheckpoint;
  readonly createdAt: string;
  readonly lastCheckpoint: string;
  readonly revision: number;
  readonly recovery: DurableExecutionRecoveryMetadata;
  readonly checkpointData: unknown;
  readonly fingerprint: string;
}

export interface DurableExecutionPrepareInput {
  readonly missionId: string;
  readonly executionSessionId: string;
  readonly promptPackageId: string;
  readonly runtimeMissionId: string;
  readonly operatorIdentity: DurableExecutionSecurityIdentity;
  readonly workspaceIdentity: DurableExecutionWorkspaceIdentity;
  readonly gitProvenance: GitProvenance;
  readonly requestFingerprint: string;
  readonly occurredAt: string;
}

export interface DurableExecutionSessionPort {
  isReady?(): boolean;
  prepare(
    input: DurableExecutionPrepareInput,
  ): Promise<DurableExecutionSession | null>;
  checkpoint(
    executionSessionId: string,
    status: DurableExecutionCheckpoint,
    occurredAt: string,
    checkpointData?: unknown,
  ): Promise<DurableExecutionSession | null>;
  reconstruct(
    missionId: string,
    executionSessionId: string,
  ): Promise<DurableExecutionSession | null>;
}

export interface DurableExecutionSessionFeatureFlag {
  readonly enabled: boolean;
}

export class DurableExecutionSessionError extends Error {
  readonly code = "DURABLE_SESSION_ERROR";

  constructor(readonly reason: string) {
    super(`Durable execution session failed: ${reason}.`);
    this.name = "DurableExecutionSessionError";
  }
}

export class DurableExecutionSessionStore
implements DurableExecutionSessionPort {
  readonly enabled: boolean;

  constructor(
    private readonly repository: IntegrationRuntimeRepository | null = null,
    featureFlag: DurableExecutionSessionFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  isReady(): boolean {
    return this.enabled && this.repository !== null;
  }

  async prepare(
    input: DurableExecutionPrepareInput,
  ): Promise<DurableExecutionSession | null> {
    if (!this.enabled) {
      return null;
    }
    this.assertReady();
    assertPrepareInput(input);
    const history = await this.history(
      input.missionId,
      input.executionSessionId,
    );
    if (history.length > 0) {
      const latest = history.at(-1)!;
      if (
        latest.status === "PREPARED" &&
        samePreparedIdentity(latest, input)
      ) {
        return latest;
      }
      throw new DurableExecutionSessionError(
        "SESSION_ALREADY_EXISTS",
      );
    }

    return this.persist(createCheckpoint({
      ...input,
      kind: "DURABLE_EXECUTION_CHECKPOINT",
      schemaVersion: 1,
      status: "PREPARED",
      createdAt: input.occurredAt,
      lastCheckpoint: input.occurredAt,
      revision: 1,
      checkpointData: null,
    }));
  }

  async checkpoint(
    executionSessionId: string,
    status: DurableExecutionCheckpoint,
    occurredAt: string,
    checkpointData: unknown = null,
  ): Promise<DurableExecutionSession | null> {
    if (!this.enabled) {
      return null;
    }
    this.assertReady();
    if (
      !isToken(executionSessionId) ||
      !isCheckpoint(status) ||
      !isCanonicalTimestamp(occurredAt)
    ) {
      throw new DurableExecutionSessionError(
        "CHECKPOINT_INVALID",
      );
    }
    const all = await this.repository!.readAll();
    const history = all
      .filter(
        (record) =>
          record.kind === "SESSION" &&
          record.runId === executionSessionId &&
          isDurableSession(record.payload),
      )
      .map((record) => verifyDurableSession(record.payload));
    const previous = history.at(-1);
    if (previous === undefined) {
      throw new DurableExecutionSessionError("SESSION_NOT_FOUND");
    }
    if (!isAllowedTransition(previous.status, status)) {
      throw new DurableExecutionSessionError(
        "CHECKPOINT_TRANSITION_INVALID",
      );
    }
    if (Date.parse(occurredAt) < Date.parse(previous.lastCheckpoint)) {
      throw new DurableExecutionSessionError(
        "CHECKPOINT_TIME_REVERSED",
      );
    }

    return this.persist(createCheckpoint({
      ...previous,
      status,
      lastCheckpoint: occurredAt,
      revision: previous.revision + 1,
      checkpointData: structuredClone(checkpointData),
    }));
  }

  async reconstruct(
    missionId: string,
    executionSessionId: string,
  ): Promise<DurableExecutionSession | null> {
    if (!this.enabled) {
      return null;
    }
    this.assertReady();
    return (
      await this.history(missionId, executionSessionId)
    ).at(-1) ?? null;
  }

  async replay(
    missionId: string,
    executionSessionId: string,
  ): Promise<readonly DurableExecutionSession[]> {
    if (!this.enabled) {
      return Object.freeze([]);
    }
    this.assertReady();
    return this.history(missionId, executionSessionId);
  }

  private async history(
    missionId: string,
    executionSessionId: string,
  ): Promise<readonly DurableExecutionSession[]> {
    if (!isToken(missionId) || !isToken(executionSessionId)) {
      throw new DurableExecutionSessionError("LOOKUP_INVALID");
    }
    const records = await this.repository!.readAll();
    return Object.freeze(
      records
        .filter(
          (record) =>
            record.kind === "SESSION" &&
            record.missionId === missionId &&
            record.runId === executionSessionId &&
            isDurableSession(record.payload),
        )
        .map((record) => verifyDurableSession(record.payload)),
    );
  }

  private async persist(
    session: DurableExecutionSession,
  ): Promise<DurableExecutionSession> {
    const record: IntegrationPersistedRecord<DurableExecutionSession> = {
      schemaVersion: 1,
      recordId: [
        "CHECKPOINT",
        session.executionSessionId,
        session.revision,
        session.status,
        session.fingerprint,
      ].join(":"),
      kind: "SESSION",
      missionId: session.missionId,
      runId: session.executionSessionId,
      source: "NOVA_PROGRAM_INTEGRATION",
      occurredAt: session.lastCheckpoint,
      payload: session,
    };
    const persisted = await this.repository!.append(record);
    if (persisted === null) {
      throw new DurableExecutionSessionError(
        "CHECKPOINT_NOT_PERSISTED",
      );
    }
    return session;
  }

  private assertReady(): void {
    if (!this.isReady()) {
      throw new DurableExecutionSessionError(
        "REPOSITORY_NOT_READY",
      );
    }
  }
}

function createCheckpoint(
  input: Omit<DurableExecutionSession, "fingerprint" | "recovery">,
): DurableExecutionSession {
  const unsigned = {
    schemaVersion: input.schemaVersion,
    kind: input.kind,
    missionId: input.missionId,
    executionSessionId: input.executionSessionId,
    promptPackageId: input.promptPackageId,
    runtimeMissionId: input.runtimeMissionId,
    operatorIdentity: input.operatorIdentity,
    workspaceIdentity: input.workspaceIdentity,
    gitProvenance: input.gitProvenance,
    requestFingerprint: input.requestFingerprint,
    status: input.status,
    createdAt: input.createdAt,
    lastCheckpoint: input.lastCheckpoint,
    revision: input.revision,
    recovery: recoveryFor(input.status, input.revision),
    checkpointData: input.checkpointData,
  };
  return Object.freeze({
    ...unsigned,
    fingerprint: sha256(canonicalJson(unsigned)),
  });
}

function recoveryFor(
  status: DurableExecutionCheckpoint,
  revision: number,
): DurableExecutionRecoveryMetadata {
  const transportMayHaveExecuted = !["PREPARED"].includes(status);
  const runtimeMayHaveExecuted = [
    "RUNTIME_STARTED",
    "RUNTIME_COMPLETED",
    "CERTIFIED",
    "FAILED",
  ].includes(status);
  return Object.freeze({
    checkpoint: status,
    attempt: Math.max(1, revision),
    transportMayHaveExecuted,
    runtimeMayHaveExecuted,
    certified: status === "CERTIFIED",
  });
}

function verifyDurableSession(
  value: unknown,
): DurableExecutionSession {
  if (!isDurableSession(value)) {
    throw new DurableExecutionSessionError(
      "PERSISTED_CHECKPOINT_INVALID",
    );
  }
  const {
    fingerprint,
    ...unsigned
  } = value as DurableExecutionSession;
  if (
    sha256(canonicalJson(unsignedCheckpoint(unsigned))) !==
      fingerprint
  ) {
    throw new DurableExecutionSessionError(
      "PERSISTED_CHECKPOINT_TAMPERED",
    );
  }
  return value as DurableExecutionSession;
}

function unsignedCheckpoint(
  value: Omit<DurableExecutionSession, "fingerprint">,
): Omit<DurableExecutionSession, "fingerprint"> {
  return {
    schemaVersion: value.schemaVersion,
    kind: value.kind,
    missionId: value.missionId,
    executionSessionId: value.executionSessionId,
    promptPackageId: value.promptPackageId,
    runtimeMissionId: value.runtimeMissionId,
    operatorIdentity: value.operatorIdentity,
    workspaceIdentity: value.workspaceIdentity,
    gitProvenance: value.gitProvenance,
    requestFingerprint: value.requestFingerprint,
    status: value.status,
    createdAt: value.createdAt,
    lastCheckpoint: value.lastCheckpoint,
    revision: value.revision,
    recovery: value.recovery,
    checkpointData: value.checkpointData,
  };
}

function isDurableSession(
  value: unknown,
): value is DurableExecutionSession {
  return (
    isRecord(value) &&
    value.schemaVersion === 1 &&
    value.kind === "DURABLE_EXECUTION_CHECKPOINT" &&
    isToken(value.missionId) &&
    isToken(value.executionSessionId) &&
    isToken(value.promptPackageId) &&
    isToken(value.runtimeMissionId) &&
    isRecord(value.operatorIdentity) &&
    value.operatorIdentity.authorization === "EXECUTE" &&
    isRecord(value.workspaceIdentity) &&
    isRecord(value.gitProvenance) &&
    typeof value.requestFingerprint === "string" &&
    /^[0-9a-f]{64}$/.test(value.requestFingerprint) &&
    isCheckpoint(value.status) &&
    isCanonicalTimestamp(value.createdAt) &&
    isCanonicalTimestamp(value.lastCheckpoint) &&
    typeof value.revision === "number" &&
    Number.isSafeInteger(value.revision) &&
    value.revision > 0 &&
    isRecord(value.recovery) &&
    typeof value.fingerprint === "string" &&
    /^[0-9a-f]{64}$/.test(value.fingerprint)
  );
}

function samePreparedIdentity(
  session: DurableExecutionSession,
  input: DurableExecutionPrepareInput,
): boolean {
  return (
    canonicalJson({
      missionId: session.missionId,
      executionSessionId: session.executionSessionId,
      promptPackageId: session.promptPackageId,
      runtimeMissionId: session.runtimeMissionId,
      operatorIdentity: session.operatorIdentity,
      workspaceIdentity: session.workspaceIdentity,
      gitProvenance: session.gitProvenance,
      requestFingerprint: session.requestFingerprint,
    }) === canonicalJson({
      missionId: input.missionId,
      executionSessionId: input.executionSessionId,
      promptPackageId: input.promptPackageId,
      runtimeMissionId: input.runtimeMissionId,
      operatorIdentity: input.operatorIdentity,
      workspaceIdentity: input.workspaceIdentity,
      gitProvenance: input.gitProvenance,
      requestFingerprint: input.requestFingerprint,
    })
  );
}

function isAllowedTransition(
  previous: DurableExecutionCheckpoint,
  next: DurableExecutionCheckpoint,
): boolean {
  if (
    ["CERTIFIED", "CANCELLED", "TIMEOUT", "INTERRUPTED"].includes(
      previous,
    )
  ) {
    return false;
  }
  if (next === previous) {
    return false;
  }
  if (
    ["FAILED", "CANCELLED", "TIMEOUT", "INTERRUPTED"].includes(next)
  ) {
    return true;
  }
  const allowed: Partial<
    Record<DurableExecutionCheckpoint, DurableExecutionCheckpoint>
  > = {
    PREPARED: "TRANSPORT_STARTED",
    TRANSPORT_STARTED: "RESULT_RECEIVED",
    RESULT_RECEIVED: "RUNTIME_STARTED",
    RUNTIME_STARTED: "RUNTIME_COMPLETED",
    RUNTIME_COMPLETED: "CERTIFIED",
    FAILED: "RUNTIME_STARTED",
  };
  return allowed[previous] === next;
}

function assertPrepareInput(
  input: DurableExecutionPrepareInput,
): void {
  if (
    !isToken(input.missionId) ||
    !isToken(input.executionSessionId) ||
    !isToken(input.promptPackageId) ||
    !isToken(input.runtimeMissionId) ||
    !isRecord(input.operatorIdentity) ||
    input.operatorIdentity.authorization !== "EXECUTE" ||
    !isRecord(input.workspaceIdentity) ||
    !isRecord(input.gitProvenance) ||
    !/^[0-9a-f]{64}$/.test(input.requestFingerprint) ||
    !isCanonicalTimestamp(input.occurredAt)
  ) {
    throw new DurableExecutionSessionError(
      "PREPARED_INPUT_INVALID",
    );
  }
}

function isCheckpoint(value: unknown): value is DurableExecutionCheckpoint {
  return [
    "PREPARED",
    "TRANSPORT_STARTED",
    "RESULT_RECEIVED",
    "RUNTIME_STARTED",
    "RUNTIME_COMPLETED",
    "CERTIFIED",
    "FAILED",
    "CANCELLED",
    "TIMEOUT",
    "INTERRUPTED",
  ].includes(String(value));
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const parsed = new Date(value);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString() === value
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

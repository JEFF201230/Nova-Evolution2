import type {
  ExecutionSession,
} from "./execution-session.js";

export type ExecutionIntegrityState =
  | "RESERVED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "RELEASED";

export interface ExecutionIntegrityCorrelation {
  readonly missionId: string;
  readonly executionSessionId: string;
  readonly promptPackageId: string;
  readonly runtimeMissionId: string;
}

export interface ExecutionIntegrityReservationRequest {
  readonly idempotencyKey: string;
  readonly fingerprint: string;
  readonly correlation: ExecutionIntegrityCorrelation;
}

export interface ExecutionIntegrityLease {
  readonly idempotencyKey: string;
  readonly attempt: number;
  readonly correlation: ExecutionIntegrityCorrelation;
}

export type ExecutionIntegrityReservation<TResult> =
  | {
      readonly kind: "RESERVED";
      readonly lease: ExecutionIntegrityLease;
      readonly executionSession: ExecutionSession | null;
    }
  | {
      readonly kind: "COMPLETED";
      readonly result: TResult;
    };

export interface ExecutionIntegritySnapshot {
  readonly idempotencyKey: string;
  readonly correlation: ExecutionIntegrityCorrelation;
  readonly state: ExecutionIntegrityState;
  readonly stateHistory: readonly ExecutionIntegrityState[];
  readonly attempt: number;
  readonly hasExecutionSession: boolean;
  readonly hasCompletedResult: boolean;
}

export type ExecutionIntegrityFailure =
  | "ACTIVE_EXECUTION"
  | "IDENTIFIER_COLLISION"
  | "IDEMPOTENCY_CONFLICT"
  | "INVALID_RESERVATION"
  | "INVALID_TRANSITION";

export class ExecutionIntegrityError extends Error {
  readonly code = "EXECUTION_INTEGRITY_ERROR";

  constructor(readonly reason: ExecutionIntegrityFailure) {
    super(`Execution integrity rejected the operation: ${reason}.`);
    this.name = "ExecutionIntegrityError";
  }
}

export interface ExecutionIntegrityRegistryPort<TResult> {
  completedResult?(idempotencyKey: string): TResult | null;
  reserve(
    request: ExecutionIntegrityReservationRequest,
  ): ExecutionIntegrityReservation<TResult>;
  markRunning(lease: ExecutionIntegrityLease): void;
  attachExecutionSession(
    lease: ExecutionIntegrityLease,
    session: ExecutionSession,
  ): void;
  complete(lease: ExecutionIntegrityLease, result: TResult): void;
  release(
    lease: ExecutionIntegrityLease,
    terminalState: "FAILED" | "CANCELLED",
  ): void;
}

interface ExecutionIntegrityRecord<TResult> {
  readonly idempotencyKey: string;
  readonly fingerprint: string;
  readonly correlation: ExecutionIntegrityCorrelation;
  state: ExecutionIntegrityState;
  readonly stateHistory: ExecutionIntegrityState[];
  attempt: number;
  executionSession?: ExecutionSession;
  result?: TResult;
}

export class ExecutionIntegrityRegistry<TResult = unknown>
implements ExecutionIntegrityRegistryPort<TResult> {
  private readonly records = new Map<
    string,
    ExecutionIntegrityRecord<TResult>
  >();
  private readonly missionIds = new Map<string, string>();
  private readonly executionSessionIds = new Map<string, string>();
  private readonly promptPackageIds = new Map<string, string>();
  private readonly runtimeMissionIds = new Map<string, string>();

  completedResult(idempotencyKey: string): TResult | null {
    if (!isToken(idempotencyKey)) {
      throw new ExecutionIntegrityError("INVALID_RESERVATION");
    }
    const record = this.records.get(idempotencyKey);
    if (
      record === undefined ||
      record.state !== "COMPLETED" ||
      record.result === undefined
    ) {
      return null;
    }
    return record.result;
  }

  reserve(
    request: ExecutionIntegrityReservationRequest,
  ): ExecutionIntegrityReservation<TResult> {
    assertReservationRequest(request);
    const existing = this.records.get(request.idempotencyKey);

    if (existing !== undefined) {
      if (
        existing.fingerprint !== request.fingerprint ||
        !sameCorrelation(existing.correlation, request.correlation)
      ) {
        throw new ExecutionIntegrityError("IDEMPOTENCY_CONFLICT");
      }
      if (existing.state === "COMPLETED") {
        if (existing.result === undefined) {
          throw new ExecutionIntegrityError("INVALID_TRANSITION");
        }
        return Object.freeze({
          kind: "COMPLETED",
          result: existing.result,
        });
      }
      if (
        existing.state === "RESERVED" ||
        existing.state === "RUNNING"
      ) {
        throw new ExecutionIntegrityError("ACTIVE_EXECUTION");
      }
      if (existing.state !== "RELEASED") {
        throw new ExecutionIntegrityError("INVALID_TRANSITION");
      }

      existing.attempt += 1;
      transition(existing, "RESERVED");
      return reserved(existing);
    }

    this.assertIdentifiersAvailable(request);
    const correlation = freezeCorrelation(request.correlation);
    const record: ExecutionIntegrityRecord<TResult> = {
      idempotencyKey: request.idempotencyKey,
      fingerprint: request.fingerprint,
      correlation,
      state: "RESERVED",
      stateHistory: ["RESERVED"],
      attempt: 1,
    };
    this.records.set(request.idempotencyKey, record);
    this.missionIds.set(
      correlation.missionId,
      request.idempotencyKey,
    );
    this.executionSessionIds.set(
      correlation.executionSessionId,
      request.idempotencyKey,
    );
    this.promptPackageIds.set(
      correlation.promptPackageId,
      request.idempotencyKey,
    );
    this.runtimeMissionIds.set(
      correlation.runtimeMissionId,
      request.idempotencyKey,
    );

    return reserved(record);
  }

  markRunning(lease: ExecutionIntegrityLease): void {
    const record = this.activeRecord(lease, "RESERVED");
    transition(record, "RUNNING");
  }

  attachExecutionSession(
    lease: ExecutionIntegrityLease,
    session: ExecutionSession,
  ): void {
    const record = this.activeRecord(lease, "RUNNING");
    if (
      session.executionSessionId !==
        record.correlation.executionSessionId ||
      session.missionId !== record.correlation.missionId ||
      session.promptPackageId !== record.correlation.promptPackageId ||
      session.runtimeMissionId !== record.correlation.runtimeMissionId
    ) {
      throw new ExecutionIntegrityError("IDENTIFIER_COLLISION");
    }
    record.executionSession = session;
  }

  complete(
    lease: ExecutionIntegrityLease,
    result: TResult,
  ): void {
    const record = this.activeRecord(lease, "RUNNING");
    record.result = result;
    transition(record, "COMPLETED");
  }

  release(
    lease: ExecutionIntegrityLease,
    terminalState: "FAILED" | "CANCELLED",
  ): void {
    const record = this.activeRecord(
      lease,
      ["RESERVED", "RUNNING"],
    );
    transition(record, terminalState);
    transition(record, "RELEASED");
  }

  inspect(idempotencyKey: string): ExecutionIntegritySnapshot | null {
    const record = this.records.get(idempotencyKey);
    if (record === undefined) {
      return null;
    }
    return Object.freeze({
      idempotencyKey: record.idempotencyKey,
      correlation: record.correlation,
      state: record.state,
      stateHistory: Object.freeze([...record.stateHistory]),
      attempt: record.attempt,
      hasExecutionSession: record.executionSession !== undefined,
      hasCompletedResult: record.result !== undefined,
    });
  }

  private activeRecord(
    lease: ExecutionIntegrityLease,
    expectedState:
      | ExecutionIntegrityState
      | readonly ExecutionIntegrityState[],
  ): ExecutionIntegrityRecord<TResult> {
    const record = this.records.get(lease.idempotencyKey);
    const states = Array.isArray(expectedState)
      ? expectedState
      : [expectedState];
    if (
      record === undefined ||
      record.attempt !== lease.attempt ||
      !sameCorrelation(record.correlation, lease.correlation)
    ) {
      throw new ExecutionIntegrityError("INVALID_RESERVATION");
    }
    if (!states.includes(record.state)) {
      throw new ExecutionIntegrityError("INVALID_TRANSITION");
    }
    return record;
  }

  private assertIdentifiersAvailable(
    request: ExecutionIntegrityReservationRequest,
  ): void {
    const owners = [
      this.missionIds.get(request.correlation.missionId),
      this.executionSessionIds.get(
        request.correlation.executionSessionId,
      ),
      this.promptPackageIds.get(
        request.correlation.promptPackageId,
      ),
      this.runtimeMissionIds.get(
        request.correlation.runtimeMissionId,
      ),
    ];
    if (owners.some((owner) => owner !== undefined)) {
      throw new ExecutionIntegrityError("IDENTIFIER_COLLISION");
    }
  }
}

function reserved<TResult>(
  record: ExecutionIntegrityRecord<TResult>,
): ExecutionIntegrityReservation<TResult> {
  return Object.freeze({
    kind: "RESERVED",
    lease: Object.freeze({
      idempotencyKey: record.idempotencyKey,
      attempt: record.attempt,
      correlation: record.correlation,
    }),
    executionSession: record.executionSession ?? null,
  });
}

function transition<TResult>(
  record: ExecutionIntegrityRecord<TResult>,
  state: ExecutionIntegrityState,
): void {
  record.state = state;
  record.stateHistory.push(state);
}

function freezeCorrelation(
  correlation: ExecutionIntegrityCorrelation,
): ExecutionIntegrityCorrelation {
  return Object.freeze({
    missionId: correlation.missionId,
    executionSessionId: correlation.executionSessionId,
    promptPackageId: correlation.promptPackageId,
    runtimeMissionId: correlation.runtimeMissionId,
  });
}

function sameCorrelation(
  left: ExecutionIntegrityCorrelation,
  right: ExecutionIntegrityCorrelation,
): boolean {
  return (
    left.missionId === right.missionId &&
    left.executionSessionId === right.executionSessionId &&
    left.promptPackageId === right.promptPackageId &&
    left.runtimeMissionId === right.runtimeMissionId
  );
}

function assertReservationRequest(
  request: ExecutionIntegrityReservationRequest,
): void {
  if (
    !isRecord(request) ||
    !isToken(request.idempotencyKey) ||
    !/^[a-f0-9]{64}$/.test(request.fingerprint) ||
    !isRecord(request.correlation) ||
    !isToken(request.correlation.missionId) ||
    !isToken(request.correlation.executionSessionId) ||
    !isToken(request.correlation.promptPackageId) ||
    !isToken(request.correlation.runtimeMissionId)
  ) {
    throw new ExecutionIntegrityError("INVALID_RESERVATION");
  }
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

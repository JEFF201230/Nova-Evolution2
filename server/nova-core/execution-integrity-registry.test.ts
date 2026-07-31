import assert from "node:assert/strict";
import test from "node:test";
import {
  ExecutionIntegrityError,
  ExecutionIntegrityRegistry,
  type ExecutionIntegrityCorrelation,
  type ExecutionIntegrityReservationRequest,
} from "./execution-integrity-registry.js";
import {
  ExecutionSession,
} from "./execution-session.js";

const CORRELATION: ExecutionIntegrityCorrelation = {
  missionId: "MISSION-001",
  executionSessionId: "SESSION-001",
  promptPackageId: "PACKAGE-001",
  runtimeMissionId: "MISSION-001",
};

function request(
  overrides: Partial<ExecutionIntegrityReservationRequest> = {},
): ExecutionIntegrityReservationRequest {
  return {
    idempotencyKey: "IDEMPOTENCY-001",
    fingerprint: "a".repeat(64),
    correlation: CORRELATION,
    ...overrides,
  };
}

function session(
  correlation: ExecutionIntegrityCorrelation = CORRELATION,
): ExecutionSession {
  return new ExecutionSession({
    executionSessionId: correlation.executionSessionId,
    missionId: correlation.missionId,
    promptPackageId: correlation.promptPackageId,
    runtimeMissionId: correlation.runtimeMissionId,
    startedAt: "2026-07-28T17:00:00.000Z",
    completedAt: "2026-07-28T17:00:01.000Z",
    durationMs: 1000,
    status: "COMPLETED",
    rawCodexResult: { stdout: "complete" },
  });
}

test("ExecutionIntegrityRegistry reserves atomically and refuses an active duplicate", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  const reservation = registry.reserve(request());

  assert.equal(reservation.kind, "RESERVED");
  assert.throws(
    () => registry.reserve(request()),
    (error) =>
      error instanceof ExecutionIntegrityError &&
      error.code === "EXECUTION_INTEGRITY_ERROR" &&
      error.reason === "ACTIVE_EXECUTION",
  );
  assert.deepEqual(registry.inspect("IDEMPOTENCY-001")?.stateHistory, [
    "RESERVED",
  ]);
});

test("ExecutionIntegrityRegistry refuses MissionId, ExecutionSessionId and PromptPackageId collisions", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  registry.reserve(request());
  const collisions: ExecutionIntegrityCorrelation[] = [
    {
      missionId: CORRELATION.missionId,
      executionSessionId: "SESSION-002",
      promptPackageId: "PACKAGE-002",
      runtimeMissionId: "MISSION-002",
    },
    {
      missionId: "MISSION-003",
      executionSessionId: CORRELATION.executionSessionId,
      promptPackageId: "PACKAGE-003",
      runtimeMissionId: "MISSION-003",
    },
    {
      missionId: "MISSION-004",
      executionSessionId: "SESSION-004",
      promptPackageId: CORRELATION.promptPackageId,
      runtimeMissionId: "MISSION-004",
    },
  ];

  collisions.forEach((correlation, index) => {
    assert.throws(
      () =>
        registry.reserve(
          request({
            idempotencyKey: `IDEMPOTENCY-COLLISION-${index}`,
            fingerprint: `${index + 1}`.repeat(64),
            correlation,
          }),
        ),
      (error) =>
        error instanceof ExecutionIntegrityError &&
        error.reason === "IDENTIFIER_COLLISION",
    );
  });
});

test("ExecutionIntegrityRegistry permits independent correlations", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  const first = registry.reserve(request());
  const second = registry.reserve(
    request({
      idempotencyKey: "IDEMPOTENCY-002",
      fingerprint: "b".repeat(64),
      correlation: {
        missionId: "MISSION-002",
        executionSessionId: "SESSION-002",
        promptPackageId: "PACKAGE-002",
        runtimeMissionId: "MISSION-002",
      },
    }),
  );

  assert.equal(first.kind, "RESERVED");
  assert.equal(second.kind, "RESERVED");
});

test("ExecutionIntegrityRegistry returns the exact completed result idempotently", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  const reservation = registry.reserve(request());
  assert.equal(reservation.kind, "RESERVED");
  registry.markRunning(reservation.lease);
  registry.attachExecutionSession(reservation.lease, session());
  const result = Object.freeze({ missionId: "MISSION-001" });
  registry.complete(reservation.lease, result);

  const replay = registry.reserve(request());

  assert.equal(replay.kind, "COMPLETED");
  assert.equal(replay.result, result);
  assert.deepEqual(registry.inspect("IDEMPOTENCY-001")?.stateHistory, [
    "RESERVED",
    "RUNNING",
    "COMPLETED",
  ]);
});

test("ExecutionIntegrityRegistry releases FAILED reservations for an exact controlled retry", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  const first = registry.reserve(request());
  assert.equal(first.kind, "RESERVED");
  registry.markRunning(first.lease);
  const completedSession = session();
  registry.attachExecutionSession(first.lease, completedSession);
  registry.release(first.lease, "FAILED");

  const retry = registry.reserve(request());

  assert.equal(retry.kind, "RESERVED");
  assert.equal(retry.lease.attempt, 2);
  assert.equal(retry.executionSession, completedSession);
  assert.deepEqual(registry.inspect("IDEMPOTENCY-001")?.stateHistory, [
    "RESERVED",
    "RUNNING",
    "FAILED",
    "RELEASED",
    "RESERVED",
  ]);
});

test("ExecutionIntegrityRegistry releases CANCELLED reservations without an orphan lock", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  const reservation = registry.reserve(request());
  assert.equal(reservation.kind, "RESERVED");
  registry.markRunning(reservation.lease);
  registry.release(reservation.lease, "CANCELLED");

  const snapshot = registry.inspect("IDEMPOTENCY-001");

  assert.equal(snapshot?.state, "RELEASED");
  assert.deepEqual(snapshot?.stateHistory, [
    "RESERVED",
    "RUNNING",
    "CANCELLED",
    "RELEASED",
  ]);
  assert.equal(registry.reserve(request()).kind, "RESERVED");
});

test("ExecutionIntegrityRegistry refuses changed data for a reused idempotency key", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  const reservation = registry.reserve(request());
  assert.equal(reservation.kind, "RESERVED");
  registry.markRunning(reservation.lease);
  registry.release(reservation.lease, "FAILED");

  assert.throws(
    () =>
      registry.reserve(
        request({
          fingerprint: "f".repeat(64),
        }),
      ),
    (error) =>
      error instanceof ExecutionIntegrityError &&
      error.reason === "IDEMPOTENCY_CONFLICT",
  );
});

test("ExecutionIntegrityRegistry refuses a session outside the reserved correlation", () => {
  const registry = new ExecutionIntegrityRegistry<object>();
  const reservation = registry.reserve(request());
  assert.equal(reservation.kind, "RESERVED");
  registry.markRunning(reservation.lease);

  assert.throws(
    () =>
      registry.attachExecutionSession(
        reservation.lease,
        session({
          ...CORRELATION,
          executionSessionId: "SESSION-OTHER",
        }),
      ),
    (error) =>
      error instanceof ExecutionIntegrityError &&
      error.reason === "IDENTIFIER_COLLISION",
  );
});

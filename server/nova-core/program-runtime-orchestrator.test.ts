import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import {
  ProgramRuntimeOrchestrator,
  type ProgramRuntimeSession,
} from "./program-runtime-orchestrator.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";

const MISSION_ID = "SUPER_WAVE_LOT_E";
const RUN_ID = "RUN-E-001";
const AUTHORITY: AuthorityResolutionDecision = {
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: [],
  supportingSources: [],
  rejectedSources: [],
  rejectionReasons: [],
  unresolvedAuthorityConflicts: [],
  resolutionStatus: "RESOLVED",
};
const TRACE: NovaOrchestrationPipelineTrace = {
  missionId: MISSION_ID,
  authoritativeSourceIds: [],
  supportingSourceIds: [],
  rejectedSourceIds: [],
  knowledgeSourceIds: [],
  knowledgeSourcePaths: [],
  dependencyIds: [],
  requiredArtifactIds: [],
  missingArtifactIds: [],
};
const GATE: RuntimeExecutionGateDecision = {
  executionAllowed: true,
  validationStatus: "VALID",
  blockingReasons: [],
  authorityDecision: AUTHORITY,
  resolutionStatus: "RESOLVED",
  missingArtifacts: [],
  pipelineTrace: TRACE,
};

function timestamp(sequence: number): string {
  return `2026-07-28T20:00:${String(sequence).padStart(2, "0")}.000Z`;
}

function initialize(maxRetries = 1): {
  readonly coordinator: ProgramRuntimeOrchestrator;
  readonly session: ProgramRuntimeSession;
} {
  const coordinator = new ProgramRuntimeOrchestrator({
    enabled: true,
  });
  const session = coordinator.initialize({
    missionId: MISSION_ID,
    runId: RUN_ID,
    source: "LOT_E_TEST",
    maxRetries,
    gateDecision: GATE,
    eventId: "EVENT-1",
    occurredAt: timestamp(1),
  });
  assert.ok(session);
  return { coordinator, session };
}

function move(
  coordinator: ProgramRuntimeOrchestrator,
  session: ProgramRuntimeSession,
  targetState: Parameters<
    ProgramRuntimeOrchestrator["transition"]
  >[1]["targetState"],
  sequence: number,
  options: {
    readonly gateDecision?: RuntimeExecutionGateDecision;
    readonly recoveryAuthorized?: boolean;
    readonly approvalDecision?:
      | "APPROVED"
      | "REJECTED"
      | "CHANGES_REQUESTED"
      | "BLOCKED";
  } = {},
): ProgramRuntimeSession {
  const next = coordinator.transition(session, {
    targetState,
    source: "LOT_E_TEST",
    eventId: `EVENT-${sequence}`,
    occurredAt: timestamp(sequence),
    message: `Transition to ${targetState}.`,
    ...options,
  });
  assert.ok(next);
  return next;
}

function reachRunning(
  coordinator: ProgramRuntimeOrchestrator,
  initial: ProgramRuntimeSession,
): ProgramRuntimeSession {
  const assigned = move(coordinator, initial, "ASSIGNED", 2);
  const locked = move(coordinator, assigned, "LOCKED", 3);
  return move(coordinator, locked, "RUNNING", 4, {
    gateDecision: GATE,
  });
}

test("LOT E runs a nominal simulated lifecycle", () => {
  const { coordinator, session } = initialize();
  let current = reachRunning(coordinator, session);
  current = move(coordinator, current, "SUBMITTED", 5);
  current = move(coordinator, current, "TECHNICAL_VALIDATION", 6);
  current = move(coordinator, current, "DOCUMENTARY_VALIDATION", 7);
  current = move(coordinator, current, "HUMAN_VALIDATION", 8);
  current = move(coordinator, current, "ACCEPTED", 9, {
    approvalDecision: "APPROVED",
  });

  assert.equal(current.state, "ACCEPTED");
  assert.equal(current.progress.percentage, 100);
  assert.deepEqual(current.startedAttempts, [1]);
});

test("LOT E rejects forbidden transitions", () => {
  const { coordinator, session } = initialize();
  assert.throws(
    () => move(coordinator, session, "RUNNING", 2),
    /PRO-002/,
  );
});

test("LOT E requires an authorized RuntimeExecutionGate", () => {
  const { coordinator, session } = initialize();
  const assigned = move(coordinator, session, "ASSIGNED", 2);
  const locked = move(coordinator, assigned, "LOCKED", 3);
  const denied = {
    ...GATE,
    executionAllowed: false,
    validationStatus: "INVALID" as const,
  };

  assert.throws(
    () =>
      move(coordinator, locked, "RUNNING", 4, {
        gateDecision: denied,
      }),
    /PRO-007/,
  );
});

test("LOT E prevents a run attempt from starting twice", () => {
  const { coordinator, session } = initialize();
  const running = reachRunning(coordinator, session);
  const forgedLocked = {
    ...running,
    state: "LOCKED" as const,
  };

  assert.throws(
    () =>
      move(coordinator, forgedLocked, "RUNNING", 5, {
        gateDecision: GATE,
      }),
    /PRO-003/,
  );
});

test("LOT E permits one explicitly authorized transient retry", () => {
  const { coordinator, session } = initialize(1);
  const running = reachRunning(coordinator, session);
  const failed = move(coordinator, running, "FAILED", 5);
  const retried = move(coordinator, failed, "ASSIGNED", 6, {
    recoveryAuthorized: true,
  });

  assert.equal(retried.attempt, 2);
  assert.equal(retried.recoveryPrepared, true);
});

test("LOT E treats definitive errors as terminal without authorization", () => {
  const { coordinator, session } = initialize();
  const failed = move(
    coordinator,
    reachRunning(coordinator, session),
    "FAILED",
    5,
  );

  assert.throws(
    () => move(coordinator, failed, "ASSIGNED", 6),
    /PRO-004/,
  );
});

test("LOT E enforces the bounded retry limit", () => {
  const { coordinator, session } = initialize(0);
  const failed = move(
    coordinator,
    reachRunning(coordinator, session),
    "FAILED",
    5,
  );

  assert.deepEqual(coordinator.assessRecovery(failed), {
    recoverable: false,
    nextAttempt: null,
    blockingReasons: ["RETRY_LIMIT_REACHED"],
  });
});

test("LOT E cancels before RUNNING", () => {
  const { coordinator, session } = initialize();
  const cancelled = move(coordinator, session, "CANCELLED", 2);

  assert.equal(cancelled.state, "CANCELLED");
  assert.equal(cancelled.cancellationRequested, true);
  assert.throws(
    () => move(coordinator, cancelled, "ASSIGNED", 3),
    /PRO-005|PRO-002/,
  );
});

test("LOT E cancels during simulated RUNNING", () => {
  const { coordinator, session } = initialize();
  const cancelled = move(
    coordinator,
    reachRunning(coordinator, session),
    "CANCELLED",
    5,
  );

  assert.equal(cancelled.state, "CANCELLED");
  assert.equal(cancelled.cancellationRequested, true);
});

test("LOT E records an explicit timeout", () => {
  const { coordinator, session } = initialize();
  const timedOut = move(
    coordinator,
    reachRunning(coordinator, session),
    "TIMEOUT",
    5,
  );

  assert.equal(timedOut.state, "TIMEOUT");
  assert.equal(timedOut.timeoutObserved, true);
});

test("LOT E prepares controlled recovery", () => {
  const { coordinator, session } = initialize(2);
  const failed = move(
    coordinator,
    reachRunning(coordinator, session),
    "FAILED",
    5,
  );

  assert.deepEqual(coordinator.assessRecovery(failed), {
    recoverable: true,
    nextAttempt: 2,
    blockingReasons: [],
  });
});

test("LOT E lets cancellation win over a pending retry", () => {
  const { coordinator, session } = initialize(2);
  const failed = move(
    coordinator,
    reachRunning(coordinator, session),
    "FAILED",
    5,
  );
  const cancelled = move(coordinator, failed, "CANCELLED", 6);

  assert.throws(
    () =>
      move(coordinator, cancelled, "ASSIGNED", 7, {
        recoveryAuthorized: true,
      }),
    /PRO-005|PRO-002/,
  );
});

test("LOT E emits ordered events and monotonic progress", () => {
  const { coordinator, session } = initialize();
  const running = reachRunning(coordinator, session);
  const values = running.events.map(
    (event) => event.progress?.completed ?? -1,
  );

  assert.deepEqual(
    running.events.map((event) => event.sequence),
    [1, 2, 3, 4],
  );
  assert.deepEqual(values, [...values].sort((left, right) => left - right));
});

test("LOT E preserves certified metadata without mutation", () => {
  const { coordinator, session } = initialize();
  const running = reachRunning(coordinator, session);

  assert.equal(running.authorityDecision, AUTHORITY);
  assert.equal(running.pipelineTrace, TRACE);
  assert.equal(running.validationStatus, "VALID");
  assert.deepEqual(running.missingArtifacts, []);
  assert.equal(Object.isFrozen(running), true);
  assert.equal(Object.isFrozen(running.events), true);
});

test("LOT E is deterministic for injected identifiers and clocks", () => {
  const first = initialize().session;
  const second = initialize().session;
  assert.deepEqual(first, second);
});

test("LOT E is inert while its Feature Flag is OFF", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "missionId", {
    get() {
      throw new Error("OFF must not inspect input.");
    },
  });

  const result = new ProgramRuntimeOrchestrator().initialize(
    unreadable as Parameters<
      ProgramRuntimeOrchestrator["initialize"]
    >[0],
  );
  assert.equal(result, null);
});

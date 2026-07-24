import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionRuntimeStateEvidence,
  createMissionRuntimeStateTransitionEvidence,
  verifyMissionRuntimeState,
} from "./mission-runtime-state.js";

test("Mission Runtime State verifies the default READY transition path", () => {
  const result = verifyMissionRuntimeState();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 3);
  assert.equal(result.evidence.ready, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Mission Runtime State creates immutable transition evidence", () => {
  const transition = createMissionRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "CONTEXT_READY",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Mission Runtime State remains deterministic for identical transitions", () => {
  const transitions = [
    createMissionRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createMissionRuntimeStateTransitionEvidence("CONTEXT_READY", "RUNTIME_BOUND"),
    createMissionRuntimeStateTransitionEvidence("RUNTIME_BOUND", "READY"),
  ];
  const first = createMissionRuntimeStateEvidence(transitions);
  const second = createMissionRuntimeStateEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Mission Runtime State reports stopped state as not ready", () => {
  const result = verifyMissionRuntimeState([
    createMissionRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createMissionRuntimeStateTransitionEvidence("CONTEXT_READY", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
});

test("Mission Runtime State rejects unauthorized transitions", () => {
  assert.throws(
    () => createMissionRuntimeStateTransitionEvidence("CREATED", "READY"),
    /^Error: MSTATE-001:/,
  );
});

test("Mission Runtime State rejects unknown internal states", () => {
  assert.throws(
    () => createMissionRuntimeStateTransitionEvidence("BROKEN" as never, "CONTEXT_READY"),
    /^Error: MSTATE-002:/,
  );
});

test("Mission Runtime State rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createMissionRuntimeStateEvidence([
        createMissionRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
        createMissionRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
      ]),
    /^Error: MSTATE-003:/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  createRuntimeStateManagerEvidence,
  createRuntimeStateTransitionEvidence,
  verifyRuntimeStateManager,
} from "./runtime-state-manager.js";

test("Runtime State Manager verifies the default internal READY transition", () => {
  const result = verifyRuntimeStateManager();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 1);
  assert.equal(result.evidence.ready, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Runtime State Manager creates immutable transition evidence", () => {
  const transition = createRuntimeStateTransitionEvidence("CREATED", "READY");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "READY",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Runtime State Manager remains deterministic for identical transitions", () => {
  const transitions = [
    createRuntimeStateTransitionEvidence("CREATED", "READY"),
    createRuntimeStateTransitionEvidence("READY", "RUNNING"),
  ];
  const first = createRuntimeStateManagerEvidence(transitions);
  const second = createRuntimeStateManagerEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Runtime State Manager reports stopped state as not ready", () => {
  const result = verifyRuntimeStateManager([
    createRuntimeStateTransitionEvidence("CREATED", "READY"),
    createRuntimeStateTransitionEvidence("READY", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
});

test("Runtime State Manager rejects unauthorized transitions", () => {
  assert.throws(
    () => createRuntimeStateTransitionEvidence("CREATED", "RUNNING"),
    /^Error: RSTATE-001:/,
  );
});

test("Runtime State Manager rejects unknown internal states", () => {
  assert.throws(
    () => createRuntimeStateTransitionEvidence("BROKEN" as never, "READY"),
    /^Error: RSTATE-002:/,
  );
});

test("Runtime State Manager rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createRuntimeStateManagerEvidence([
        createRuntimeStateTransitionEvidence("CREATED", "READY"),
        createRuntimeStateTransitionEvidence("CREATED", "READY"),
      ]),
    /^Error: RSTATE-003:/,
  );
});

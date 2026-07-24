import assert from "node:assert/strict";
import test from "node:test";
import {
  createRuntimeLifecycleEvidence,
  createRuntimeLifecycleTransitionEvidence,
  verifyRuntimeLifecycle,
} from "./runtime-lifecycle.js";

test("Runtime Lifecycle verifies the default STARTED transition path", () => {
  const result = verifyRuntimeLifecycle();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "STARTED");
  assert.equal(result.evidence.transitionCount, 2);
  assert.equal(result.evidence.started, true);
  assert.equal(result.evidence.stopped, false);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Runtime Lifecycle creates immutable transition evidence", () => {
  const transition = createRuntimeLifecycleTransitionEvidence("CREATED", "STARTING");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "STARTING",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Runtime Lifecycle remains deterministic for identical transitions", () => {
  const transitions = [
    createRuntimeLifecycleTransitionEvidence("CREATED", "STARTING"),
    createRuntimeLifecycleTransitionEvidence("STARTING", "STARTED"),
  ];
  const first = createRuntimeLifecycleEvidence(transitions);
  const second = createRuntimeLifecycleEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Runtime Lifecycle reports stopped state as not started", () => {
  const result = verifyRuntimeLifecycle([
    createRuntimeLifecycleTransitionEvidence("CREATED", "STARTING"),
    createRuntimeLifecycleTransitionEvidence("STARTING", "STARTED"),
    createRuntimeLifecycleTransitionEvidence("STARTED", "STOPPING"),
    createRuntimeLifecycleTransitionEvidence("STOPPING", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
  assert.equal(result.evidence.stopped, true);
});

test("Runtime Lifecycle rejects unauthorized transitions", () => {
  assert.throws(
    () => createRuntimeLifecycleTransitionEvidence("CREATED", "STARTED"),
    /^Error: RLIFE-001:/,
  );
});

test("Runtime Lifecycle rejects unknown lifecycle states", () => {
  assert.throws(
    () => createRuntimeLifecycleTransitionEvidence("BROKEN" as never, "STARTING"),
    /^Error: RLIFE-002:/,
  );
});

test("Runtime Lifecycle rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createRuntimeLifecycleEvidence([
        createRuntimeLifecycleTransitionEvidence("CREATED", "STARTING"),
        createRuntimeLifecycleTransitionEvidence("CREATED", "STOPPED"),
      ]),
    /^Error: RLIFE-003:/,
  );
});

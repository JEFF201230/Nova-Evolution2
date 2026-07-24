import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionRuntimeLifecycleEvidence,
  createMissionRuntimeLifecycleTransitionEvidence,
  verifyMissionRuntimeLifecycle,
} from "./mission-runtime-lifecycle.js";

test("Mission Runtime Lifecycle verifies the default READY transition path", () => {
  const result = verifyMissionRuntimeLifecycle();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 3);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.stopped, false);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Mission Runtime Lifecycle creates immutable transition evidence", () => {
  const transition = createMissionRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "INITIALIZING",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Mission Runtime Lifecycle remains deterministic for identical transitions", () => {
  const transitions = [
    createMissionRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createMissionRuntimeLifecycleTransitionEvidence("INITIALIZING", "BOUND"),
    createMissionRuntimeLifecycleTransitionEvidence("BOUND", "READY"),
  ];
  const first = createMissionRuntimeLifecycleEvidence(transitions);
  const second = createMissionRuntimeLifecycleEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Mission Runtime Lifecycle reports stopped state as not ready", () => {
  const result = verifyMissionRuntimeLifecycle([
    createMissionRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createMissionRuntimeLifecycleTransitionEvidence("INITIALIZING", "BOUND"),
    createMissionRuntimeLifecycleTransitionEvidence("BOUND", "READY"),
    createMissionRuntimeLifecycleTransitionEvidence("READY", "STOPPING"),
    createMissionRuntimeLifecycleTransitionEvidence("STOPPING", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
  assert.equal(result.evidence.stopped, true);
});

test("Mission Runtime Lifecycle rejects unauthorized transitions", () => {
  assert.throws(
    () => createMissionRuntimeLifecycleTransitionEvidence("CREATED", "READY"),
    /^Error: MLIFE-001:/,
  );
});

test("Mission Runtime Lifecycle rejects unknown internal states", () => {
  assert.throws(
    () => createMissionRuntimeLifecycleTransitionEvidence("BROKEN" as never, "INITIALIZING"),
    /^Error: MLIFE-002:/,
  );
});

test("Mission Runtime Lifecycle rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createMissionRuntimeLifecycleEvidence([
        createMissionRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
        createMissionRuntimeLifecycleTransitionEvidence("CREATED", "STOPPED"),
      ]),
    /^Error: MLIFE-003:/,
  );
});

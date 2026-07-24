import assert from "node:assert/strict";
import test from "node:test";
import {
  createAgentRuntimeLifecycleEvidence,
  createAgentRuntimeLifecycleTransitionEvidence,
  verifyAgentRuntimeLifecycle,
} from "./agent-runtime-lifecycle.js";

test("Agent Runtime Lifecycle verifies the default READY transition path", () => {
  const result = verifyAgentRuntimeLifecycle();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 5);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.stopped, false);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Agent Runtime Lifecycle creates immutable transition evidence", () => {
  const transition = createAgentRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "INITIALIZING",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Agent Runtime Lifecycle remains deterministic for identical transitions", () => {
  const transitions = [
    createAgentRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createAgentRuntimeLifecycleTransitionEvidence("INITIALIZING", "RUNTIME_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("RUNTIME_BOUND", "MISSION_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("WORKFLOW_BOUND", "READY"),
  ];
  const first = createAgentRuntimeLifecycleEvidence(transitions);
  const second = createAgentRuntimeLifecycleEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Agent Runtime Lifecycle reports stopped state as not ready", () => {
  const result = verifyAgentRuntimeLifecycle([
    createAgentRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createAgentRuntimeLifecycleTransitionEvidence("INITIALIZING", "RUNTIME_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("RUNTIME_BOUND", "MISSION_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createAgentRuntimeLifecycleTransitionEvidence("WORKFLOW_BOUND", "READY"),
    createAgentRuntimeLifecycleTransitionEvidence("READY", "STOPPING"),
    createAgentRuntimeLifecycleTransitionEvidence("STOPPING", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
  assert.equal(result.evidence.stopped, true);
});

test("Agent Runtime Lifecycle rejects unauthorized transitions", () => {
  assert.throws(
    () => createAgentRuntimeLifecycleTransitionEvidence("CREATED", "READY"),
    /^Error: ALIFE-001:/,
  );
});

test("Agent Runtime Lifecycle rejects unknown internal states", () => {
  assert.throws(
    () => createAgentRuntimeLifecycleTransitionEvidence("BROKEN" as never, "INITIALIZING"),
    /^Error: ALIFE-002:/,
  );
});

test("Agent Runtime Lifecycle rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createAgentRuntimeLifecycleEvidence([
        createAgentRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
        createAgentRuntimeLifecycleTransitionEvidence("CREATED", "STOPPED"),
      ]),
    /^Error: ALIFE-003:/,
  );
});

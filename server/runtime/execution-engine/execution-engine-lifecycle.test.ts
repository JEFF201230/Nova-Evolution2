import assert from "node:assert/strict";
import test from "node:test";
import {
  createExecutionEngineLifecycleEvidence,
  createExecutionEngineLifecycleTransitionEvidence,
  verifyExecutionEngineLifecycle,
} from "./execution-engine-lifecycle.js";

test("Execution Engine Lifecycle verifies the default READY transition path", () => {
  const result = verifyExecutionEngineLifecycle();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 7);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.stopped, false);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Execution Engine Lifecycle creates immutable transition evidence", () => {
  const transition = createExecutionEngineLifecycleTransitionEvidence("CREATED", "INITIALIZING");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "INITIALIZING",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Execution Engine Lifecycle remains deterministic for identical transitions", () => {
  const transitions = [
    createExecutionEngineLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createExecutionEngineLifecycleTransitionEvidence("INITIALIZING", "RUNTIME_CORE_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("RUNTIME_CORE_BOUND", "MISSION_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("WORKFLOW_BOUND", "AGENT_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("AGENT_BOUND", "SYNCHRONIZING"),
    createExecutionEngineLifecycleTransitionEvidence("SYNCHRONIZING", "READY"),
  ];
  const first = createExecutionEngineLifecycleEvidence(transitions);
  const second = createExecutionEngineLifecycleEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Execution Engine Lifecycle reports stopped state as not ready", () => {
  const result = verifyExecutionEngineLifecycle([
    createExecutionEngineLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createExecutionEngineLifecycleTransitionEvidence("INITIALIZING", "RUNTIME_CORE_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("RUNTIME_CORE_BOUND", "MISSION_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("WORKFLOW_BOUND", "AGENT_BOUND"),
    createExecutionEngineLifecycleTransitionEvidence("AGENT_BOUND", "SYNCHRONIZING"),
    createExecutionEngineLifecycleTransitionEvidence("SYNCHRONIZING", "READY"),
    createExecutionEngineLifecycleTransitionEvidence("READY", "STOPPING"),
    createExecutionEngineLifecycleTransitionEvidence("STOPPING", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
  assert.equal(result.evidence.stopped, true);
});

test("Execution Engine Lifecycle rejects unauthorized transitions", () => {
  assert.throws(
    () => createExecutionEngineLifecycleTransitionEvidence("CREATED", "READY"),
    /^Error: ELIFE-001:/,
  );
});

test("Execution Engine Lifecycle rejects unknown internal states", () => {
  assert.throws(
    () => createExecutionEngineLifecycleTransitionEvidence("BROKEN" as never, "INITIALIZING"),
    /^Error: ELIFE-002:/,
  );
});

test("Execution Engine Lifecycle rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createExecutionEngineLifecycleEvidence([
        createExecutionEngineLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
        createExecutionEngineLifecycleTransitionEvidence("CREATED", "STOPPED"),
      ]),
    /^Error: ELIFE-003:/,
  );
});

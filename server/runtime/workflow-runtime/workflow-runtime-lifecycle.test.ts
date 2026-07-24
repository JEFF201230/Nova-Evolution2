import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkflowRuntimeLifecycleEvidence,
  createWorkflowRuntimeLifecycleTransitionEvidence,
  verifyWorkflowRuntimeLifecycle,
} from "./workflow-runtime-lifecycle.js";

test("Workflow Runtime Lifecycle verifies the default READY transition path", () => {
  const result = verifyWorkflowRuntimeLifecycle();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 4);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.stopped, false);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Workflow Runtime Lifecycle creates immutable transition evidence", () => {
  const transition = createWorkflowRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "INITIALIZING",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Workflow Runtime Lifecycle remains deterministic for identical transitions", () => {
  const transitions = [
    createWorkflowRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createWorkflowRuntimeLifecycleTransitionEvidence("INITIALIZING", "MISSION_BOUND"),
    createWorkflowRuntimeLifecycleTransitionEvidence("MISSION_BOUND", "RUNTIME_BOUND"),
    createWorkflowRuntimeLifecycleTransitionEvidence("RUNTIME_BOUND", "READY"),
  ];
  const first = createWorkflowRuntimeLifecycleEvidence(transitions);
  const second = createWorkflowRuntimeLifecycleEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Workflow Runtime Lifecycle reports stopped state as not ready", () => {
  const result = verifyWorkflowRuntimeLifecycle([
    createWorkflowRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
    createWorkflowRuntimeLifecycleTransitionEvidence("INITIALIZING", "MISSION_BOUND"),
    createWorkflowRuntimeLifecycleTransitionEvidence("MISSION_BOUND", "RUNTIME_BOUND"),
    createWorkflowRuntimeLifecycleTransitionEvidence("RUNTIME_BOUND", "READY"),
    createWorkflowRuntimeLifecycleTransitionEvidence("READY", "STOPPING"),
    createWorkflowRuntimeLifecycleTransitionEvidence("STOPPING", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
  assert.equal(result.evidence.stopped, true);
});

test("Workflow Runtime Lifecycle rejects unauthorized transitions", () => {
  assert.throws(
    () => createWorkflowRuntimeLifecycleTransitionEvidence("CREATED", "READY"),
    /^Error: WLIFE-001:/,
  );
});

test("Workflow Runtime Lifecycle rejects unknown internal states", () => {
  assert.throws(
    () => createWorkflowRuntimeLifecycleTransitionEvidence("BROKEN" as never, "INITIALIZING"),
    /^Error: WLIFE-002:/,
  );
});

test("Workflow Runtime Lifecycle rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createWorkflowRuntimeLifecycleEvidence([
        createWorkflowRuntimeLifecycleTransitionEvidence("CREATED", "INITIALIZING"),
        createWorkflowRuntimeLifecycleTransitionEvidence("CREATED", "STOPPED"),
      ]),
    /^Error: WLIFE-003:/,
  );
});

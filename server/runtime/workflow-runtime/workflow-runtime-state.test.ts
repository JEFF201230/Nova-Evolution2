import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkflowRuntimeStateEvidence,
  createWorkflowRuntimeStateTransitionEvidence,
  verifyWorkflowRuntimeState,
} from "./workflow-runtime-state.js";

test("Workflow Runtime State verifies the default READY transition path", () => {
  const result = verifyWorkflowRuntimeState();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 4);
  assert.equal(result.evidence.ready, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Workflow Runtime State creates immutable transition evidence", () => {
  const transition = createWorkflowRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "CONTEXT_READY",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Workflow Runtime State remains deterministic for identical transitions", () => {
  const transitions = [
    createWorkflowRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createWorkflowRuntimeStateTransitionEvidence("CONTEXT_READY", "MISSION_BOUND"),
    createWorkflowRuntimeStateTransitionEvidence("MISSION_BOUND", "RUNTIME_BOUND"),
    createWorkflowRuntimeStateTransitionEvidence("RUNTIME_BOUND", "READY"),
  ];
  const first = createWorkflowRuntimeStateEvidence(transitions);
  const second = createWorkflowRuntimeStateEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Workflow Runtime State reports stopped state as not ready", () => {
  const result = verifyWorkflowRuntimeState([
    createWorkflowRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createWorkflowRuntimeStateTransitionEvidence("CONTEXT_READY", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
});

test("Workflow Runtime State rejects unauthorized transitions", () => {
  assert.throws(
    () => createWorkflowRuntimeStateTransitionEvidence("CREATED", "READY"),
    /^Error: WSTATE-001:/,
  );
});

test("Workflow Runtime State rejects unknown internal states", () => {
  assert.throws(
    () => createWorkflowRuntimeStateTransitionEvidence("BROKEN" as never, "CONTEXT_READY"),
    /^Error: WSTATE-002:/,
  );
});

test("Workflow Runtime State rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createWorkflowRuntimeStateEvidence([
        createWorkflowRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
        createWorkflowRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
      ]),
    /^Error: WSTATE-003:/,
  );
});

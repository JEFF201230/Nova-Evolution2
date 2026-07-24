import assert from "node:assert/strict";
import test from "node:test";
import {
  createExecutionEngineStateEvidence,
  createExecutionEngineStateTransitionEvidence,
  verifyExecutionEngineState,
} from "./execution-engine-state.js";

test("Execution Engine State verifies the default READY transition path", () => {
  const result = verifyExecutionEngineState();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 7);
  assert.equal(result.evidence.ready, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Execution Engine State creates immutable transition evidence", () => {
  const transition = createExecutionEngineStateTransitionEvidence("CREATED", "CONTEXT_READY");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "CONTEXT_READY",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Execution Engine State remains deterministic for identical transitions", () => {
  const transitions = [
    createExecutionEngineStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createExecutionEngineStateTransitionEvidence("CONTEXT_READY", "RUNTIME_CORE_BOUND"),
    createExecutionEngineStateTransitionEvidence("RUNTIME_CORE_BOUND", "MISSION_BOUND"),
    createExecutionEngineStateTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createExecutionEngineStateTransitionEvidence("WORKFLOW_BOUND", "AGENT_BOUND"),
    createExecutionEngineStateTransitionEvidence("AGENT_BOUND", "SYNCHRONIZED"),
    createExecutionEngineStateTransitionEvidence("SYNCHRONIZED", "READY"),
  ];
  const first = createExecutionEngineStateEvidence(transitions);
  const second = createExecutionEngineStateEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Execution Engine State reports stopped state as not ready", () => {
  const result = verifyExecutionEngineState([
    createExecutionEngineStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createExecutionEngineStateTransitionEvidence("CONTEXT_READY", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
});

test("Execution Engine State rejects unauthorized transitions", () => {
  assert.throws(
    () => createExecutionEngineStateTransitionEvidence("CREATED", "READY"),
    /^Error: ESTATE-001:/,
  );
});

test("Execution Engine State rejects unknown internal states", () => {
  assert.throws(
    () => createExecutionEngineStateTransitionEvidence("BROKEN" as never, "CONTEXT_READY"),
    /^Error: ESTATE-002:/,
  );
});

test("Execution Engine State rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createExecutionEngineStateEvidence([
        createExecutionEngineStateTransitionEvidence("CREATED", "CONTEXT_READY"),
        createExecutionEngineStateTransitionEvidence("CREATED", "CONTEXT_READY"),
      ]),
    /^Error: ESTATE-003:/,
  );
});

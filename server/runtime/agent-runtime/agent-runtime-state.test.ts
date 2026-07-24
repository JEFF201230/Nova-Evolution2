import assert from "node:assert/strict";
import test from "node:test";
import {
  createAgentRuntimeStateEvidence,
  createAgentRuntimeStateTransitionEvidence,
  verifyAgentRuntimeState,
} from "./agent-runtime-state.js";

test("Agent Runtime State verifies the default READY transition path", () => {
  const result = verifyAgentRuntimeState();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.currentState, "READY");
  assert.equal(result.evidence.transitionCount, 5);
  assert.equal(result.evidence.ready, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Agent Runtime State creates immutable transition evidence", () => {
  const transition = createAgentRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY");

  assert.deepEqual(transition, {
    from: "CREATED",
    to: "CONTEXT_READY",
    allowed: true,
  });
  assert.equal(Object.isFrozen(transition), true);
});

test("Agent Runtime State remains deterministic for identical transitions", () => {
  const transitions = [
    createAgentRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createAgentRuntimeStateTransitionEvidence("CONTEXT_READY", "RUNTIME_BOUND"),
    createAgentRuntimeStateTransitionEvidence("RUNTIME_BOUND", "MISSION_BOUND"),
    createAgentRuntimeStateTransitionEvidence("MISSION_BOUND", "WORKFLOW_BOUND"),
    createAgentRuntimeStateTransitionEvidence("WORKFLOW_BOUND", "READY"),
  ];
  const first = createAgentRuntimeStateEvidence(transitions);
  const second = createAgentRuntimeStateEvidence(transitions);

  assert.deepEqual(first, second);
});

test("Agent Runtime State reports stopped state as not ready", () => {
  const result = verifyAgentRuntimeState([
    createAgentRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
    createAgentRuntimeStateTransitionEvidence("CONTEXT_READY", "STOPPED"),
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.currentState, "STOPPED");
});

test("Agent Runtime State rejects unauthorized transitions", () => {
  assert.throws(
    () => createAgentRuntimeStateTransitionEvidence("CREATED", "READY"),
    /^Error: ASTATE-001:/,
  );
});

test("Agent Runtime State rejects unknown internal states", () => {
  assert.throws(
    () => createAgentRuntimeStateTransitionEvidence("BROKEN" as never, "CONTEXT_READY"),
    /^Error: ASTATE-002:/,
  );
});

test("Agent Runtime State rejects non-contiguous transition sequences", () => {
  assert.throws(
    () =>
      createAgentRuntimeStateEvidence([
        createAgentRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
        createAgentRuntimeStateTransitionEvidence("CREATED", "CONTEXT_READY"),
      ]),
    /^Error: ASTATE-003:/,
  );
});

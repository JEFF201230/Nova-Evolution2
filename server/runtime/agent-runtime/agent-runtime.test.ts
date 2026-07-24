import assert from "node:assert/strict";
import test from "node:test";
import {
  createAgentRuntimeEvidence,
  verifyAgentRuntimeFoundation,
} from "./agent-runtime.js";
import {
  verifyMissionRuntimeFoundation,
} from "../mission-runtime/mission-runtime.js";
import {
  verifyRuntimeCore,
} from "../os-runtime/runtime-orchestrator.js";
import {
  verifyWorkflowRuntimeFoundation,
} from "../workflow-runtime/workflow-runtime.js";
import {
  verifyAgentRuntimeComposition,
} from "./agent-runtime-composition.js";
import {
  verifyAgentRuntimeContext,
} from "./agent-runtime-context.js";
import {
  verifyAgentRuntimeLifecycle,
} from "./agent-runtime-lifecycle.js";
import {
  verifyAgentRuntimeState,
} from "./agent-runtime-state.js";

test("Agent Runtime Foundation consumes Runtime Core, Mission Runtime, and Workflow Runtime readiness", () => {
  const result = verifyAgentRuntimeFoundation();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.runtimeCore.orchestrator.ready, true);
  assert.equal(result.evidence.missionRuntime.ready, true);
  assert.equal(result.evidence.workflowRuntime.ready, true);
  assert.equal(result.evidence.context.ready, true);
  assert.equal(result.evidence.state.ready, true);
  assert.equal(result.evidence.lifecycle.ready, true);
  assert.equal(result.evidence.composition.ready, true);
  assert.equal(result.evidence.dependencyCount, 3);
  assert.equal(result.evidence.readyDependencyCount, 3);
  assert.equal(result.evidence.componentCount, 4);
  assert.equal(result.evidence.readyComponentCount, 4);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Agent Runtime Foundation remains deterministic", () => {
  const first = verifyAgentRuntimeFoundation();
  const second = verifyAgentRuntimeFoundation();

  assert.deepEqual(first, second);
});

test("Agent Runtime Foundation reports not ready when an internal dependency is not ready", () => {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = verifyMissionRuntimeFoundation();
  const workflowRuntime = verifyWorkflowRuntimeFoundation();
  const context = verifyAgentRuntimeContext([
    {
      kind: "mission-order",
      value: "P4-MO-010-AGENT-RUNTIME-FOUNDATION",
    },
  ]);
  const state = verifyAgentRuntimeState();
  const lifecycle = verifyAgentRuntimeLifecycle();
  const composition = verifyAgentRuntimeComposition([
    {
      id: "agent-runtime-context",
      ready: context.passed,
    },
    {
      id: "agent-runtime-state",
      ready: state.passed,
    },
    {
      id: "agent-runtime-lifecycle",
      ready: lifecycle.passed,
    },
  ]);
  const evidence = createAgentRuntimeEvidence(
    runtimeCore,
    missionRuntime,
    workflowRuntime,
    context,
    state,
    lifecycle,
    composition,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyDependencyCount, 3);
  assert.equal(evidence.readyComponentCount, 2);
  assert.equal(evidence.context.ready, false);
  assert.equal(evidence.composition.ready, false);
  assert.equal(Object.isFrozen(evidence), true);
});

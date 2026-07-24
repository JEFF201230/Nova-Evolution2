import assert from "node:assert/strict";
import test from "node:test";
import {
  createExecutionEngineEvidence,
  verifyExecutionEngineFoundation,
} from "./execution-engine.js";
import {
  verifyExecutionEngineComposition,
} from "./execution-engine-composition.js";
import {
  verifyExecutionEngineContext,
} from "./execution-engine-context.js";
import {
  verifyExecutionEngineLifecycle,
} from "./execution-engine-lifecycle.js";
import {
  verifyExecutionEngineState,
} from "./execution-engine-state.js";
import {
  verifyAgentRuntimeFoundation,
} from "../agent-runtime/agent-runtime.js";
import {
  verifyMissionRuntimeFoundation,
} from "../mission-runtime/mission-runtime.js";
import {
  verifyRuntimeCore,
} from "../os-runtime/runtime-orchestrator.js";
import {
  verifyWorkflowRuntimeFoundation,
} from "../workflow-runtime/workflow-runtime.js";

test("Execution Engine Foundation orchestrates Runtime foundations", () => {
  const result = verifyExecutionEngineFoundation();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.runtimeCore.orchestrator.ready, true);
  assert.equal(result.evidence.missionRuntime.ready, true);
  assert.equal(result.evidence.workflowRuntime.ready, true);
  assert.equal(result.evidence.agentRuntime.ready, true);
  assert.equal(result.evidence.context.ready, true);
  assert.equal(result.evidence.state.ready, true);
  assert.equal(result.evidence.lifecycle.ready, true);
  assert.equal(result.evidence.composition.ready, true);
  assert.equal(result.evidence.dependencyCount, 4);
  assert.equal(result.evidence.readyDependencyCount, 4);
  assert.equal(result.evidence.componentCount, 4);
  assert.equal(result.evidence.readyComponentCount, 4);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Execution Engine Foundation remains deterministic", () => {
  const first = verifyExecutionEngineFoundation();
  const second = verifyExecutionEngineFoundation();

  assert.deepEqual(first, second);
});

test("Execution Engine Foundation reports not ready when a runtime dependency fails", () => {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = Object.freeze({
    ...verifyMissionRuntimeFoundation(),
    passed: false,
  });
  const workflowRuntime = verifyWorkflowRuntimeFoundation();
  const agentRuntime = verifyAgentRuntimeFoundation();
  const context = verifyExecutionEngineContext([
    {
      kind: "mission-order",
      value: "P4-MO-011-EXECUTION-ENGINE-FOUNDATION",
    },
    {
      kind: "runtime-core",
      value: "CAMPAIGN-010-RUNTIME-CORE",
    },
    {
      kind: "mission-runtime",
      value: "CAMPAIGN-011-MISSION-RUNTIME-FOUNDATION",
    },
    {
      kind: "workflow-runtime",
      value: "CAMPAIGN-012-WORKFLOW-RUNTIME-FOUNDATION",
    },
    {
      kind: "agent-runtime",
      value: "CAMPAIGN-013-AGENT-RUNTIME-FOUNDATION",
    },
    {
      kind: "runtime-architecture",
      value: "RUNTIME_ARCHITECTURE.md",
    },
    {
      kind: "kernel-boundary",
      value: "kernel-foundation-v1.0",
    },
  ]);
  const state = verifyExecutionEngineState();
  const lifecycle = verifyExecutionEngineLifecycle();
  const composition = verifyExecutionEngineComposition([
    {
      id: "runtime-core",
      ready: runtimeCore.passed,
    },
    {
      id: "mission-runtime",
      ready: missionRuntime.passed,
    },
    {
      id: "workflow-runtime",
      ready: workflowRuntime.passed,
    },
    {
      id: "agent-runtime",
      ready: agentRuntime.passed,
    },
    {
      id: "execution-engine-context",
      ready: context.passed,
    },
    {
      id: "execution-engine-state",
      ready: state.passed,
    },
    {
      id: "execution-engine-lifecycle",
      ready: lifecycle.passed,
    },
  ]);
  const evidence = createExecutionEngineEvidence(
    runtimeCore,
    missionRuntime,
    workflowRuntime,
    agentRuntime,
    context,
    state,
    lifecycle,
    composition,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyDependencyCount, 3);
  assert.equal(evidence.readyComponentCount, 3);
  assert.equal(evidence.composition.ready, false);
  assert.equal(evidence.composition.readyComponentCount, 6);
  assert.equal(Object.isFrozen(evidence), true);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkflowRuntimeEvidence,
  verifyWorkflowRuntimeFoundation,
} from "./workflow-runtime.js";
import {
  verifyMissionRuntimeFoundation,
} from "../mission-runtime/mission-runtime.js";
import {
  verifyRuntimeCore,
} from "../os-runtime/runtime-orchestrator.js";
import {
  verifyWorkflowRuntimeComposition,
} from "./workflow-runtime-composition.js";
import {
  verifyWorkflowRuntimeContext,
} from "./workflow-runtime-context.js";
import {
  verifyWorkflowRuntimeLifecycle,
} from "./workflow-runtime-lifecycle.js";
import {
  verifyWorkflowRuntimeState,
} from "./workflow-runtime-state.js";

test("Workflow Runtime Foundation consumes Runtime Core and Mission Runtime readiness", () => {
  const result = verifyWorkflowRuntimeFoundation();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.runtimeCore.orchestrator.ready, true);
  assert.equal(result.evidence.missionRuntime.ready, true);
  assert.equal(result.evidence.context.ready, true);
  assert.equal(result.evidence.state.ready, true);
  assert.equal(result.evidence.lifecycle.ready, true);
  assert.equal(result.evidence.composition.ready, true);
  assert.equal(result.evidence.dependencyCount, 2);
  assert.equal(result.evidence.readyDependencyCount, 2);
  assert.equal(result.evidence.componentCount, 4);
  assert.equal(result.evidence.readyComponentCount, 4);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Workflow Runtime Foundation remains deterministic", () => {
  const first = verifyWorkflowRuntimeFoundation();
  const second = verifyWorkflowRuntimeFoundation();

  assert.deepEqual(first, second);
});

test("Workflow Runtime Foundation reports not ready when an internal dependency is not ready", () => {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = verifyMissionRuntimeFoundation();
  const context = verifyWorkflowRuntimeContext([
    {
      kind: "mission-order",
      value: "P4-MO-009-WORKFLOW-RUNTIME-FOUNDATION",
    },
  ]);
  const state = verifyWorkflowRuntimeState();
  const lifecycle = verifyWorkflowRuntimeLifecycle();
  const composition = verifyWorkflowRuntimeComposition([
    {
      id: "workflow-runtime-context",
      ready: context.passed,
    },
    {
      id: "workflow-runtime-state",
      ready: state.passed,
    },
    {
      id: "workflow-runtime-lifecycle",
      ready: lifecycle.passed,
    },
  ]);
  const evidence = createWorkflowRuntimeEvidence(
    runtimeCore,
    missionRuntime,
    context,
    state,
    lifecycle,
    composition,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyDependencyCount, 2);
  assert.equal(evidence.readyComponentCount, 2);
  assert.equal(evidence.context.ready, false);
  assert.equal(evidence.composition.ready, false);
  assert.equal(Object.isFrozen(evidence), true);
});

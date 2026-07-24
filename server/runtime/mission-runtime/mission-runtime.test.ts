import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionRuntimeEvidence,
  verifyMissionRuntimeFoundation,
} from "./mission-runtime.js";
import {
  verifyMissionRuntimeComposition,
} from "./mission-runtime-composition.js";
import {
  verifyMissionRuntimeContext,
} from "./mission-runtime-context.js";
import {
  verifyMissionRuntimeLifecycle,
} from "./mission-runtime-lifecycle.js";
import {
  verifyMissionRuntimeState,
} from "./mission-runtime-state.js";
import {
  verifyRuntimeCore,
} from "../os-runtime/runtime-orchestrator.js";

test("Mission Runtime Foundation consumes Runtime Core readiness", () => {
  const result = verifyMissionRuntimeFoundation();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.runtimeCore.orchestrator.ready, true);
  assert.equal(result.evidence.context.ready, true);
  assert.equal(result.evidence.state.ready, true);
  assert.equal(result.evidence.lifecycle.ready, true);
  assert.equal(result.evidence.composition.ready, true);
  assert.equal(result.evidence.componentCount, 5);
  assert.equal(result.evidence.readyComponentCount, 5);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Mission Runtime Foundation remains deterministic", () => {
  const first = verifyMissionRuntimeFoundation();
  const second = verifyMissionRuntimeFoundation();

  assert.deepEqual(first, second);
});

test("Mission Runtime Foundation reports not ready when an internal dependency is not ready", () => {
  const runtimeCore = verifyRuntimeCore();
  const context = verifyMissionRuntimeContext([
    {
      kind: "mission-order",
      value: "P4-MO-008-MISSION-RUNTIME-FOUNDATION",
    },
  ]);
  const state = verifyMissionRuntimeState();
  const lifecycle = verifyMissionRuntimeLifecycle();
  const composition = verifyMissionRuntimeComposition([
    {
      id: "mission-runtime-context",
      ready: context.passed,
    },
    {
      id: "mission-runtime-state",
      ready: state.passed,
    },
    {
      id: "mission-runtime-lifecycle",
      ready: lifecycle.passed,
    },
  ]);
  const evidence = createMissionRuntimeEvidence(
    runtimeCore,
    context,
    state,
    lifecycle,
    composition,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyComponentCount, 3);
  assert.equal(evidence.context.ready, false);
  assert.equal(evidence.composition.ready, false);
  assert.equal(Object.isFrozen(evidence), true);
});

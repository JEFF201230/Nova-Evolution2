import assert from "node:assert/strict";
import test from "node:test";
import {
  createRuntimeOrchestratorEvidence,
  verifyRuntimeCore,
  verifyRuntimeOrchestrator,
} from "./runtime-orchestrator.js";
import type {
  RuntimeOrchestratorComponentRegistration,
} from "./runtime-orchestrator.js";

const READY_COMPONENTS: readonly RuntimeOrchestratorComponentRegistration[] = Object.freeze([
  Object.freeze({
    id: "runtime-context-manager",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-scheduler",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-state-manager",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-composition",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-lifecycle",
    ready: true,
  }),
]);

test("Runtime Orchestrator starts as an internal deterministic skeleton", () => {
  const evidence = createRuntimeOrchestratorEvidence();

  assert.equal(evidence.state, "CREATED");
  assert.equal(evidence.componentCount, 0);
  assert.equal(evidence.readyComponentCount, 0);
  assert.equal(evidence.ready, false);
  assert.equal(Object.isFrozen(evidence), true);
});

test("Runtime Orchestrator reports READY when every internal component is ready", () => {
  const result = verifyRuntimeOrchestrator(READY_COMPONENTS);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.state, "READY");
  assert.equal(result.evidence.componentCount, 5);
  assert.equal(result.evidence.readyComponentCount, 5);
  assert.equal(result.evidence.ready, true);
});

test("Runtime Orchestrator remains deterministic for identical inputs", () => {
  const first = verifyRuntimeOrchestrator(READY_COMPONENTS);
  const second = verifyRuntimeOrchestrator(READY_COMPONENTS);

  assert.deepEqual(first, second);
});

test("Runtime Orchestrator rejects unknown internal Runtime components", () => {
  assert.throws(
    () =>
      verifyRuntimeOrchestrator([
        {
          id: "product-runtime" as never,
          ready: true,
        },
      ]),
    /^Error: RORCH-001:/,
  );
});

test("Runtime Orchestrator rejects duplicate internal Runtime components", () => {
  assert.throws(
    () =>
      verifyRuntimeOrchestrator([
        {
          id: "runtime-scheduler",
          ready: true,
        },
        {
          id: "runtime-scheduler",
          ready: true,
        },
      ]),
    /^Error: RORCH-002:/,
  );
});

test("Runtime Orchestrator aggregates Runtime Core readiness deterministically", () => {
  const first = verifyRuntimeCore();
  const second = verifyRuntimeCore();

  assert.equal(first.passed, true);
  assert.equal(first.evidence.contextManager.ready, true);
  assert.equal(first.evidence.stateManager.ready, true);
  assert.equal(first.evidence.scheduler.ready, true);
  assert.equal(first.evidence.lifecycle.started, true);
  assert.equal(first.evidence.composition.ready, true);
  assert.equal(first.evidence.orchestrator.ready, true);
  assert.equal(first.evidence.orchestrator.componentCount, 5);
  assert.equal(first.evidence.orchestrator.readyComponentCount, 5);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.evidence), true);
  assert.deepEqual(first, second);
});

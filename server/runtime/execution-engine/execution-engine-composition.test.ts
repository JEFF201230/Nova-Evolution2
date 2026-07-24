import assert from "node:assert/strict";
import test from "node:test";
import {
  createExecutionEngineCompositionEvidence,
  verifyExecutionEngineComposition,
} from "./execution-engine-composition.js";
import type {
  ExecutionEngineCompositionComponent,
} from "./execution-engine-composition.js";

const COMPOSITION_COMPONENTS: readonly ExecutionEngineCompositionComponent[] = Object.freeze([
  Object.freeze({
    id: "execution-engine-lifecycle",
    ready: true,
  }),
  Object.freeze({
    id: "agent-runtime",
    ready: true,
  }),
  Object.freeze({
    id: "workflow-runtime",
    ready: true,
  }),
  Object.freeze({
    id: "mission-runtime",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-core",
    ready: true,
  }),
  Object.freeze({
    id: "execution-engine-state",
    ready: true,
  }),
  Object.freeze({
    id: "execution-engine-context",
    ready: true,
  }),
]);

test("Execution Engine Composition produces immutable readiness evidence", () => {
  const result = verifyExecutionEngineComposition(COMPOSITION_COMPONENTS);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.componentCount, 7);
  assert.equal(result.evidence.readyComponentCount, 7);
  assert.deepEqual(
    result.evidence.componentIds,
    [
      "runtime-core",
      "mission-runtime",
      "workflow-runtime",
      "agent-runtime",
      "execution-engine-context",
      "execution-engine-state",
      "execution-engine-lifecycle",
    ],
  );
  assert.equal(result.evidence.ready, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.componentIds), true);
});

test("Execution Engine Composition remains deterministic for identical components", () => {
  const first = createExecutionEngineCompositionEvidence(COMPOSITION_COMPONENTS);
  const second = createExecutionEngineCompositionEvidence(COMPOSITION_COMPONENTS);

  assert.deepEqual(first, second);
});

test("Execution Engine Composition reports not ready when components are incomplete", () => {
  const result = verifyExecutionEngineComposition([
    {
      id: "runtime-core",
      ready: true,
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.componentCount, 1);
});

test("Execution Engine Composition reports not ready when a runtime dependency is not ready", () => {
  const result = verifyExecutionEngineComposition([
    {
      id: "runtime-core",
      ready: true,
    },
    {
      id: "mission-runtime",
      ready: false,
    },
    {
      id: "workflow-runtime",
      ready: true,
    },
    {
      id: "agent-runtime",
      ready: true,
    },
    {
      id: "execution-engine-context",
      ready: true,
    },
    {
      id: "execution-engine-state",
      ready: true,
    },
    {
      id: "execution-engine-lifecycle",
      ready: true,
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.readyComponentCount, 6);
});

test("Execution Engine Composition rejects unknown components", () => {
  assert.throws(
    () =>
      verifyExecutionEngineComposition([
        {
          id: "unknown-component" as never,
          ready: true,
        },
      ]),
    /^Error: ECOMP-001:/,
  );
});

test("Execution Engine Composition rejects duplicate components", () => {
  assert.throws(
    () =>
      verifyExecutionEngineComposition([
        {
          id: "runtime-core",
          ready: true,
        },
        {
          id: "runtime-core",
          ready: true,
        },
      ]),
    /^Error: ECOMP-002:/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  createRuntimeCompositionEvidence,
  verifyRuntimeComposition,
} from "./runtime-composition.js";
import type {
  RuntimeCompositionComponent,
} from "./runtime-composition.js";

const COMPOSITION_COMPONENTS: readonly RuntimeCompositionComponent[] = Object.freeze([
  Object.freeze({
    id: "runtime-lifecycle",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-state-manager",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-context-manager",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-scheduler",
    ready: true,
  }),
]);

test("Runtime Composition produces immutable readiness evidence", () => {
  const result = verifyRuntimeComposition(COMPOSITION_COMPONENTS);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.componentCount, 4);
  assert.equal(result.evidence.readyComponentCount, 4);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(result.evidence.componentIds, [
    "runtime-context-manager",
    "runtime-scheduler",
    "runtime-state-manager",
    "runtime-lifecycle",
  ]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.componentIds), true);
});

test("Runtime Composition remains deterministic for identical components", () => {
  const first = createRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);
  const second = createRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);

  assert.deepEqual(first, second);
});

test("Runtime Composition reports not ready when a component is missing", () => {
  const result = verifyRuntimeComposition([
    {
      id: "runtime-context-manager",
      ready: true,
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.componentCount, 1);
});

test("Runtime Composition rejects unknown internal components", () => {
  assert.throws(
    () =>
      verifyRuntimeComposition([
        {
          id: "runtime-orchestrator" as never,
          ready: true,
        },
      ]),
    /^Error: RCOMP-001:/,
  );
});

test("Runtime Composition rejects duplicate internal components", () => {
  assert.throws(
    () =>
      verifyRuntimeComposition([
        {
          id: "runtime-context-manager",
          ready: true,
        },
        {
          id: "runtime-context-manager",
          ready: true,
        },
      ]),
    /^Error: RCOMP-002:/,
  );
});

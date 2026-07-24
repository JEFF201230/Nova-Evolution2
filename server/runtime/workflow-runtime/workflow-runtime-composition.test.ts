import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkflowRuntimeCompositionEvidence,
  verifyWorkflowRuntimeComposition,
} from "./workflow-runtime-composition.js";
import type {
  WorkflowRuntimeCompositionComponent,
} from "./workflow-runtime-composition.js";

const COMPOSITION_COMPONENTS: readonly WorkflowRuntimeCompositionComponent[] = Object.freeze([
  Object.freeze({
    id: "workflow-runtime-lifecycle",
    ready: true,
  }),
  Object.freeze({
    id: "workflow-runtime-context",
    ready: true,
  }),
  Object.freeze({
    id: "workflow-runtime-state",
    ready: true,
  }),
]);

test("Workflow Runtime Composition produces immutable readiness evidence", () => {
  const result = verifyWorkflowRuntimeComposition(COMPOSITION_COMPONENTS);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.componentCount, 3);
  assert.equal(result.evidence.readyComponentCount, 3);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(result.evidence.componentIds, [
    "workflow-runtime-context",
    "workflow-runtime-state",
    "workflow-runtime-lifecycle",
  ]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.componentIds), true);
});

test("Workflow Runtime Composition remains deterministic for identical components", () => {
  const first = createWorkflowRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);
  const second = createWorkflowRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);

  assert.deepEqual(first, second);
});

test("Workflow Runtime Composition reports not ready when a component is missing", () => {
  const result = verifyWorkflowRuntimeComposition([
    {
      id: "workflow-runtime-context",
      ready: true,
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.componentCount, 1);
});

test("Workflow Runtime Composition rejects unknown internal components", () => {
  assert.throws(
    () =>
      verifyWorkflowRuntimeComposition([
        {
          id: "unknown-workflow-component" as never,
          ready: true,
        },
      ]),
    /^Error: WCOMP-001:/,
  );
});

test("Workflow Runtime Composition rejects duplicate internal components", () => {
  assert.throws(
    () =>
      verifyWorkflowRuntimeComposition([
        {
          id: "workflow-runtime-context",
          ready: true,
        },
        {
          id: "workflow-runtime-context",
          ready: true,
        },
      ]),
    /^Error: WCOMP-002:/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  createWorkflowRuntimeContextEvidence,
  verifyWorkflowRuntimeContext,
} from "./workflow-runtime-context.js";
import type {
  WorkflowRuntimeContextReference,
} from "./workflow-runtime-context.js";

const CONTEXT_REFERENCES: readonly WorkflowRuntimeContextReference[] = Object.freeze([
  Object.freeze({
    kind: "mission-runtime",
    value: "CAMPAIGN-011-MISSION-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-core",
    value: "CAMPAIGN-010-RUNTIME-CORE",
  }),
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-009-WORKFLOW-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
]);

test("Workflow Runtime Context produces immutable readiness evidence", () => {
  const result = verifyWorkflowRuntimeContext(CONTEXT_REFERENCES);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.referenceCount, 4);
  assert.equal(result.evidence.requiredReferenceCount, 4);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(
    result.evidence.references.map((reference) => reference.kind),
    ["mission-order", "runtime-core", "mission-runtime", "runtime-architecture"],
  );
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.references), true);
});

test("Workflow Runtime Context remains deterministic for identical references", () => {
  const first = createWorkflowRuntimeContextEvidence(CONTEXT_REFERENCES);
  const second = createWorkflowRuntimeContextEvidence(CONTEXT_REFERENCES);

  assert.deepEqual(first, second);
});

test("Workflow Runtime Context reports not ready when references are incomplete", () => {
  const result = verifyWorkflowRuntimeContext([
    {
      kind: "mission-order",
      value: "P4-MO-009-WORKFLOW-RUNTIME-FOUNDATION",
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.referenceCount, 1);
});

test("Workflow Runtime Context rejects unknown reference kinds", () => {
  assert.throws(
    () =>
      verifyWorkflowRuntimeContext([
        {
          kind: "unknown-context" as never,
          value: "forbidden",
        },
      ]),
    /^Error: WCTX-001:/,
  );
});

test("Workflow Runtime Context rejects duplicate reference kinds", () => {
  assert.throws(
    () =>
      verifyWorkflowRuntimeContext([
        {
          kind: "mission-order",
          value: "P4-MO-009-WORKFLOW-RUNTIME-FOUNDATION",
        },
        {
          kind: "mission-order",
          value: "P4-MO-009-WORKFLOW-RUNTIME-FOUNDATION",
        },
      ]),
    /^Error: WCTX-002:/,
  );
});

test("Workflow Runtime Context rejects empty or non-normalized references", () => {
  assert.throws(
    () =>
      verifyWorkflowRuntimeContext([
        {
          kind: "mission-order",
          value: " P4-MO-009-WORKFLOW-RUNTIME-FOUNDATION ",
        },
      ]),
    /^Error: WCTX-003:/,
  );
});

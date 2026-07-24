import assert from "node:assert/strict";
import test from "node:test";
import {
  createExecutionEngineContextEvidence,
  verifyExecutionEngineContext,
} from "./execution-engine-context.js";
import type {
  ExecutionEngineContextReference,
} from "./execution-engine-context.js";

const CONTEXT_REFERENCES: readonly ExecutionEngineContextReference[] = Object.freeze([
  Object.freeze({
    kind: "agent-runtime",
    value: "CAMPAIGN-013-AGENT-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "workflow-runtime",
    value: "CAMPAIGN-012-WORKFLOW-RUNTIME-FOUNDATION",
  }),
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
    value: "P4-MO-011-EXECUTION-ENGINE-FOUNDATION",
  }),
  Object.freeze({
    kind: "kernel-boundary",
    value: "kernel-foundation-v1.0",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
]);

test("Execution Engine Context produces immutable readiness evidence", () => {
  const result = verifyExecutionEngineContext(CONTEXT_REFERENCES);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.referenceCount, 7);
  assert.equal(result.evidence.requiredReferenceCount, 7);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(
    result.evidence.references.map((reference) => reference.kind),
    [
      "mission-order",
      "runtime-core",
      "mission-runtime",
      "workflow-runtime",
      "agent-runtime",
      "runtime-architecture",
      "kernel-boundary",
    ],
  );
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.references), true);
});

test("Execution Engine Context remains deterministic for identical references", () => {
  const first = createExecutionEngineContextEvidence(CONTEXT_REFERENCES);
  const second = createExecutionEngineContextEvidence(CONTEXT_REFERENCES);

  assert.deepEqual(first, second);
});

test("Execution Engine Context reports not ready when references are incomplete", () => {
  const result = verifyExecutionEngineContext([
    {
      kind: "mission-order",
      value: "P4-MO-011-EXECUTION-ENGINE-FOUNDATION",
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.referenceCount, 1);
});

test("Execution Engine Context rejects unknown reference kinds", () => {
  assert.throws(
    () =>
      verifyExecutionEngineContext([
        {
          kind: "unknown-context" as never,
          value: "forbidden",
        },
      ]),
    /^Error: ECTX-001:/,
  );
});

test("Execution Engine Context rejects duplicate reference kinds", () => {
  assert.throws(
    () =>
      verifyExecutionEngineContext([
        {
          kind: "mission-order",
          value: "P4-MO-011-EXECUTION-ENGINE-FOUNDATION",
        },
        {
          kind: "mission-order",
          value: "P4-MO-011-EXECUTION-ENGINE-FOUNDATION",
        },
      ]),
    /^Error: ECTX-002:/,
  );
});

test("Execution Engine Context rejects empty or non-normalized references", () => {
  assert.throws(
    () =>
      verifyExecutionEngineContext([
        {
          kind: "mission-order",
          value: " P4-MO-011-EXECUTION-ENGINE-FOUNDATION ",
        },
      ]),
    /^Error: ECTX-003:/,
  );
});

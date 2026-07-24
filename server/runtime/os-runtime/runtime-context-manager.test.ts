import assert from "node:assert/strict";
import test from "node:test";
import {
  createRuntimeContextManagerEvidence,
  verifyRuntimeContextManager,
} from "./runtime-context-manager.js";
import type {
  RuntimeContextReference,
} from "./runtime-context-manager.js";

const CONTEXT_REFERENCES: readonly RuntimeContextReference[] = Object.freeze([
  Object.freeze({
    kind: "kernel-boundary",
    value: "kernel-foundation-v1.0",
  }),
  Object.freeze({
    kind: "campaign",
    value: "CAMPAIGN-010",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-007-RUNTIME-ORCHESTRATOR-SKELETON",
  }),
]);

test("Runtime Context Manager produces immutable readiness evidence", () => {
  const result = verifyRuntimeContextManager(CONTEXT_REFERENCES);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.referenceCount, 4);
  assert.equal(result.evidence.requiredReferenceCount, 4);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(
    result.evidence.references.map((reference) => reference.kind),
    ["campaign", "mission-order", "runtime-architecture", "kernel-boundary"],
  );
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.references), true);
});

test("Runtime Context Manager remains deterministic for identical references", () => {
  const first = createRuntimeContextManagerEvidence(CONTEXT_REFERENCES);
  const second = createRuntimeContextManagerEvidence(CONTEXT_REFERENCES);

  assert.deepEqual(first, second);
});

test("Runtime Context Manager reports not ready when references are incomplete", () => {
  const result = verifyRuntimeContextManager([
    {
      kind: "campaign",
      value: "CAMPAIGN-010",
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.referenceCount, 1);
});

test("Runtime Context Manager rejects unknown reference kinds", () => {
  assert.throws(
    () =>
      verifyRuntimeContextManager([
        {
          kind: "product-context" as never,
          value: "forbidden",
        },
      ]),
    /^Error: RCTX-001:/,
  );
});

test("Runtime Context Manager rejects duplicate reference kinds", () => {
  assert.throws(
    () =>
      verifyRuntimeContextManager([
        {
          kind: "campaign",
          value: "CAMPAIGN-010",
        },
        {
          kind: "campaign",
          value: "CAMPAIGN-010",
        },
      ]),
    /^Error: RCTX-002:/,
  );
});

test("Runtime Context Manager rejects empty or non-normalized references", () => {
  assert.throws(
    () =>
      verifyRuntimeContextManager([
        {
          kind: "campaign",
          value: " CAMPAIGN-010 ",
        },
      ]),
    /^Error: RCTX-003:/,
  );
});

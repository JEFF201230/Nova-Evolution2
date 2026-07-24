import assert from "node:assert/strict";
import test from "node:test";
import {
  createAgentRuntimeContextEvidence,
  verifyAgentRuntimeContext,
} from "./agent-runtime-context.js";
import type {
  AgentRuntimeContextReference,
} from "./agent-runtime-context.js";

const CONTEXT_REFERENCES: readonly AgentRuntimeContextReference[] = Object.freeze([
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
    value: "P4-MO-010-AGENT-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
]);

test("Agent Runtime Context produces immutable readiness evidence", () => {
  const result = verifyAgentRuntimeContext(CONTEXT_REFERENCES);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.referenceCount, 5);
  assert.equal(result.evidence.requiredReferenceCount, 5);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(
    result.evidence.references.map((reference) => reference.kind),
    ["mission-order", "runtime-core", "mission-runtime", "workflow-runtime", "runtime-architecture"],
  );
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.references), true);
});

test("Agent Runtime Context remains deterministic for identical references", () => {
  const first = createAgentRuntimeContextEvidence(CONTEXT_REFERENCES);
  const second = createAgentRuntimeContextEvidence(CONTEXT_REFERENCES);

  assert.deepEqual(first, second);
});

test("Agent Runtime Context reports not ready when references are incomplete", () => {
  const result = verifyAgentRuntimeContext([
    {
      kind: "mission-order",
      value: "P4-MO-010-AGENT-RUNTIME-FOUNDATION",
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.referenceCount, 1);
});

test("Agent Runtime Context rejects unknown reference kinds", () => {
  assert.throws(
    () =>
      verifyAgentRuntimeContext([
        {
          kind: "unknown-context" as never,
          value: "forbidden",
        },
      ]),
    /^Error: ACTX-001:/,
  );
});

test("Agent Runtime Context rejects duplicate reference kinds", () => {
  assert.throws(
    () =>
      verifyAgentRuntimeContext([
        {
          kind: "mission-order",
          value: "P4-MO-010-AGENT-RUNTIME-FOUNDATION",
        },
        {
          kind: "mission-order",
          value: "P4-MO-010-AGENT-RUNTIME-FOUNDATION",
        },
      ]),
    /^Error: ACTX-002:/,
  );
});

test("Agent Runtime Context rejects empty or non-normalized references", () => {
  assert.throws(
    () =>
      verifyAgentRuntimeContext([
        {
          kind: "mission-order",
          value: " P4-MO-010-AGENT-RUNTIME-FOUNDATION ",
        },
      ]),
    /^Error: ACTX-003:/,
  );
});

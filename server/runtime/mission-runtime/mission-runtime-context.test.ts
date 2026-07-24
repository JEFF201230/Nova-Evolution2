import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionRuntimeContextEvidence,
  verifyMissionRuntimeContext,
} from "./mission-runtime-context.js";
import type {
  MissionRuntimeContextReference,
} from "./mission-runtime-context.js";

const CONTEXT_REFERENCES: readonly MissionRuntimeContextReference[] = Object.freeze([
  Object.freeze({
    kind: "kernel-boundary",
    value: "kernel-foundation-v1.0",
  }),
  Object.freeze({
    kind: "runtime-core",
    value: "CAMPAIGN-010-RUNTIME-CORE",
  }),
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-008-MISSION-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
]);

test("Mission Runtime Context produces immutable readiness evidence", () => {
  const result = verifyMissionRuntimeContext(CONTEXT_REFERENCES);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.referenceCount, 4);
  assert.equal(result.evidence.requiredReferenceCount, 4);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(
    result.evidence.references.map((reference) => reference.kind),
    ["mission-order", "runtime-core", "runtime-architecture", "kernel-boundary"],
  );
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.references), true);
});

test("Mission Runtime Context remains deterministic for identical references", () => {
  const first = createMissionRuntimeContextEvidence(CONTEXT_REFERENCES);
  const second = createMissionRuntimeContextEvidence(CONTEXT_REFERENCES);

  assert.deepEqual(first, second);
});

test("Mission Runtime Context reports not ready when references are incomplete", () => {
  const result = verifyMissionRuntimeContext([
    {
      kind: "mission-order",
      value: "P4-MO-008-MISSION-RUNTIME-FOUNDATION",
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.referenceCount, 1);
});

test("Mission Runtime Context rejects unknown reference kinds", () => {
  assert.throws(
    () =>
      verifyMissionRuntimeContext([
        {
          kind: "unknown-context" as never,
          value: "forbidden",
        },
      ]),
    /^Error: MCTX-001:/,
  );
});

test("Mission Runtime Context rejects duplicate reference kinds", () => {
  assert.throws(
    () =>
      verifyMissionRuntimeContext([
        {
          kind: "mission-order",
          value: "P4-MO-008-MISSION-RUNTIME-FOUNDATION",
        },
        {
          kind: "mission-order",
          value: "P4-MO-008-MISSION-RUNTIME-FOUNDATION",
        },
      ]),
    /^Error: MCTX-002:/,
  );
});

test("Mission Runtime Context rejects empty or non-normalized references", () => {
  assert.throws(
    () =>
      verifyMissionRuntimeContext([
        {
          kind: "mission-order",
          value: " P4-MO-008-MISSION-RUNTIME-FOUNDATION ",
        },
      ]),
    /^Error: MCTX-003:/,
  );
});

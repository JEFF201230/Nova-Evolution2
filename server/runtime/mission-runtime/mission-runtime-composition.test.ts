import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionRuntimeCompositionEvidence,
  verifyMissionRuntimeComposition,
} from "./mission-runtime-composition.js";
import type {
  MissionRuntimeCompositionComponent,
} from "./mission-runtime-composition.js";

const COMPOSITION_COMPONENTS: readonly MissionRuntimeCompositionComponent[] = Object.freeze([
  Object.freeze({
    id: "mission-runtime-lifecycle",
    ready: true,
  }),
  Object.freeze({
    id: "mission-runtime-context",
    ready: true,
  }),
  Object.freeze({
    id: "mission-runtime-state",
    ready: true,
  }),
]);

test("Mission Runtime Composition produces immutable readiness evidence", () => {
  const result = verifyMissionRuntimeComposition(COMPOSITION_COMPONENTS);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.componentCount, 3);
  assert.equal(result.evidence.readyComponentCount, 3);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(result.evidence.componentIds, [
    "mission-runtime-context",
    "mission-runtime-state",
    "mission-runtime-lifecycle",
  ]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.componentIds), true);
});

test("Mission Runtime Composition remains deterministic for identical components", () => {
  const first = createMissionRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);
  const second = createMissionRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);

  assert.deepEqual(first, second);
});

test("Mission Runtime Composition reports not ready when a component is missing", () => {
  const result = verifyMissionRuntimeComposition([
    {
      id: "mission-runtime-context",
      ready: true,
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.componentCount, 1);
});

test("Mission Runtime Composition rejects unknown internal components", () => {
  assert.throws(
    () =>
      verifyMissionRuntimeComposition([
        {
          id: "unknown-mission-component" as never,
          ready: true,
        },
      ]),
    /^Error: MCOMP-001:/,
  );
});

test("Mission Runtime Composition rejects duplicate internal components", () => {
  assert.throws(
    () =>
      verifyMissionRuntimeComposition([
        {
          id: "mission-runtime-context",
          ready: true,
        },
        {
          id: "mission-runtime-context",
          ready: true,
        },
      ]),
    /^Error: MCOMP-002:/,
  );
});

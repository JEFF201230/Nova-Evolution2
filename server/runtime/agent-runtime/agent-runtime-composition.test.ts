import assert from "node:assert/strict";
import test from "node:test";
import {
  createAgentRuntimeCompositionEvidence,
  verifyAgentRuntimeComposition,
} from "./agent-runtime-composition.js";
import type {
  AgentRuntimeCompositionComponent,
} from "./agent-runtime-composition.js";

const COMPOSITION_COMPONENTS: readonly AgentRuntimeCompositionComponent[] = Object.freeze([
  Object.freeze({
    id: "agent-runtime-lifecycle",
    ready: true,
  }),
  Object.freeze({
    id: "agent-runtime-context",
    ready: true,
  }),
  Object.freeze({
    id: "agent-runtime-state",
    ready: true,
  }),
]);

test("Agent Runtime Composition produces immutable readiness evidence", () => {
  const result = verifyAgentRuntimeComposition(COMPOSITION_COMPONENTS);

  assert.equal(result.passed, true);
  assert.equal(result.evidence.componentCount, 3);
  assert.equal(result.evidence.readyComponentCount, 3);
  assert.equal(result.evidence.ready, true);
  assert.deepEqual(result.evidence.componentIds, [
    "agent-runtime-context",
    "agent-runtime-state",
    "agent-runtime-lifecycle",
  ]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.componentIds), true);
});

test("Agent Runtime Composition remains deterministic for identical components", () => {
  const first = createAgentRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);
  const second = createAgentRuntimeCompositionEvidence(COMPOSITION_COMPONENTS);

  assert.deepEqual(first, second);
});

test("Agent Runtime Composition reports not ready when a component is missing", () => {
  const result = verifyAgentRuntimeComposition([
    {
      id: "agent-runtime-context",
      ready: true,
    },
  ]);

  assert.equal(result.passed, false);
  assert.equal(result.evidence.ready, false);
  assert.equal(result.evidence.componentCount, 1);
});

test("Agent Runtime Composition rejects unknown internal components", () => {
  assert.throws(
    () =>
      verifyAgentRuntimeComposition([
        {
          id: "unknown-agent-component" as never,
          ready: true,
        },
      ]),
    /^Error: ACOMP-001:/,
  );
});

test("Agent Runtime Composition rejects duplicate internal components", () => {
  assert.throws(
    () =>
      verifyAgentRuntimeComposition([
        {
          id: "agent-runtime-context",
          ready: true,
        },
        {
          id: "agent-runtime-context",
          ready: true,
        },
      ]),
    /^Error: ACOMP-002:/,
  );
});

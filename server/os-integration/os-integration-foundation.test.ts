import assert from "node:assert/strict";
import test from "node:test";
import {
  createOsIntegrationFoundationEvidence,
  createOsIntegrationSourceReferences,
  verifyOsIntegrationComposition,
  verifyOsIntegrationFoundation,
} from "./os-integration-foundation.js";
import {
  verifyExecutionEngineFoundation,
} from "../runtime/execution-engine/execution-engine.js";
import {
  verifyRuntimeTraceabilityFoundation,
} from "../runtime/runtime-traceability/runtime-traceability.js";
import type {
  OsIntegrationFoundationComponent,
  OsIntegrationSourceReference,
} from "./os-integration-foundation.js";

const SOURCE_REFERENCES: readonly OsIntegrationSourceReference[] = Object.freeze([
  Object.freeze({
    id: "program-005-roadmap",
    value: "PROGRAM_005_ROADMAP.md",
  }),
  Object.freeze({
    id: "program-004-runtime-foundation",
    value: "PROGRAM-004-COMPLETE-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    id: "p5-mo-001-authority",
    value: "P5-MO-001-OS-INTEGRATION-FOUNDATION",
  }),
  Object.freeze({
    id: "program-005-architecture",
    value: "PROGRAM_005_ARCHITECTURE.md",
  }),
  Object.freeze({
    id: "program-003-kernel-boundary",
    value: "PROGRAM-003-COMPLETE-KERNEL-FOUNDATION",
  }),
]);

const COMPOSITION_COMPONENTS: readonly OsIntegrationFoundationComponent[] = Object.freeze([
  Object.freeze({
    id: "execution-engine-dependency",
    ready: true,
  }),
  Object.freeze({
    id: "internal-integration-composition",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-foundation",
    ready: true,
  }),
  Object.freeze({
    id: "kernel-boundary",
    ready: true,
  }),
  Object.freeze({
    id: "program-authority",
    ready: true,
  }),
]);

test("OS Integration Foundation verifies certified Runtime dependencies", () => {
  const result = verifyOsIntegrationFoundation();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.dependencyCount, 2);
  assert.equal(result.evidence.readyDependencyCount, 2);
  assert.equal(result.evidence.composition.ready, true);
  assert.deepEqual(
    result.evidence.composition.componentIds,
    [
      "program-authority",
      "kernel-boundary",
      "runtime-foundation",
      "execution-engine-dependency",
      "internal-integration-composition",
    ],
  );
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.sourceReferences), true);
  assert.equal(Object.isFrozen(result.evidence.composition), true);
});

test("OS Integration Foundation preserves deterministic source ordering", () => {
  const references = createOsIntegrationSourceReferences(SOURCE_REFERENCES);

  assert.deepEqual(
    references.map((reference) => reference.id),
    [
      "p5-mo-001-authority",
      "program-003-kernel-boundary",
      "program-004-runtime-foundation",
      "program-005-architecture",
      "program-005-roadmap",
    ],
  );
  assert.equal(Object.isFrozen(references), true);
  assert.equal(Object.isFrozen(references[0]), true);
});

test("OS Integration Foundation preserves deterministic component ordering", () => {
  const evidence = verifyOsIntegrationComposition(COMPOSITION_COMPONENTS);

  assert.equal(evidence.ready, true);
  assert.equal(evidence.componentCount, 5);
  assert.equal(evidence.requiredComponentCount, 5);
  assert.deepEqual(evidence.componentIds, [
    "program-authority",
    "kernel-boundary",
    "runtime-foundation",
    "execution-engine-dependency",
    "internal-integration-composition",
  ]);
});

test("OS Integration Foundation reports not ready when a component is missing", () => {
  const evidence = verifyOsIntegrationComposition([
    {
      id: "program-authority",
      ready: true,
    },
  ]);

  assert.equal(evidence.ready, false);
  assert.equal(evidence.componentCount, 1);
  assert.equal(evidence.readyComponentCount, 1);
});

test("OS Integration Foundation creates immutable readiness evidence", () => {
  const runtimeTraceability = verifyRuntimeTraceabilityFoundation();
  const executionEngine = verifyExecutionEngineFoundation();
  const composition = verifyOsIntegrationComposition(COMPOSITION_COMPONENTS);
  const evidence = createOsIntegrationFoundationEvidence(
    SOURCE_REFERENCES,
    runtimeTraceability,
    executionEngine,
    composition,
  );

  assert.equal(evidence.ready, true);
  assert.equal(evidence.sourceReferences.length, 5);
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.sourceReferences), true);
});

test("OS Integration Foundation rejects unknown source references", () => {
  assert.throws(
    () =>
      createOsIntegrationSourceReferences([
        {
          id: "unknown-source" as never,
          value: "UNKNOWN",
        },
      ]),
    /^Error: OSINT-001:/,
  );
});

test("OS Integration Foundation rejects duplicate source references", () => {
  assert.throws(
    () =>
      createOsIntegrationSourceReferences([
        {
          id: "p5-mo-001-authority",
          value: "P5-MO-001-OS-INTEGRATION-FOUNDATION",
        },
        {
          id: "p5-mo-001-authority",
          value: "P5-MO-001-OS-INTEGRATION-FOUNDATION",
        },
      ]),
    /^Error: OSINT-002:/,
  );
});

test("OS Integration Foundation rejects unknown internal components", () => {
  assert.throws(
    () =>
      verifyOsIntegrationComposition([
        {
          id: "public-api" as never,
          ready: true,
        },
      ]),
    /^Error: OSINT-003:/,
  );
});

test("OS Integration Foundation rejects duplicate internal components", () => {
  assert.throws(
    () =>
      verifyOsIntegrationComposition([
        {
          id: "program-authority",
          ready: true,
        },
        {
          id: "program-authority",
          ready: true,
        },
      ]),
    /^Error: OSINT-004:/,
  );
});

test("OS Integration Foundation rejects non-normalized source values", () => {
  assert.throws(
    () =>
      createOsIntegrationSourceReferences([
        {
          id: "p5-mo-001-authority",
          value: " P5-MO-001-OS-INTEGRATION-FOUNDATION",
        },
      ]),
    /^Error: OSINT-005:/,
  );
});


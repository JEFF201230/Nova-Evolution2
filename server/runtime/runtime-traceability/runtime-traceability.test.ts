import assert from "node:assert/strict";
import test from "node:test";
import {
  createRuntimeTraceabilityEvidence,
  createRuntimeTraceabilityGraphEvidence,
  createRuntimeTraceabilityLink,
  createRuntimeTraceabilityLinks,
  verifyRuntimeTraceability,
  verifyRuntimeTraceabilityFoundation,
} from "./runtime-traceability.js";
import {
  verifyAgentRuntimeFoundation,
} from "../agent-runtime/agent-runtime.js";
import {
  verifyExecutionEngineFoundation,
} from "../execution-engine/execution-engine.js";
import {
  verifyMissionRuntimeFoundation,
} from "../mission-runtime/mission-runtime.js";
import {
  verifyRuntimeCore,
} from "../os-runtime/runtime-orchestrator.js";
import {
  verifyWorkflowRuntimeFoundation,
} from "../workflow-runtime/workflow-runtime.js";

const READY_LINKS = createRuntimeTraceabilityLinks({
  runtimeCoreReady: true,
  missionRuntimeReady: true,
  workflowRuntimeReady: true,
  agentRuntimeReady: true,
  executionEngineReady: true,
});

test("Runtime Traceability verifies immutable complete evidence links", () => {
  const graph = verifyRuntimeTraceability(READY_LINKS);

  assert.equal(graph.ready, true);
  assert.equal(graph.coverageLevel, "COMPLETE");
  assert.equal(graph.linkCount, 8);
  assert.equal(graph.requiredLinkCount, 8);
  assert.equal(graph.readyLinkCount, 8);
  assert.deepEqual(graph.linkIds, [
    "mission-order-to-runtime-core",
    "runtime-core-to-mission-runtime",
    "mission-runtime-to-workflow-runtime",
    "workflow-runtime-to-agent-runtime",
    "agent-runtime-to-execution-engine",
    "execution-engine-to-execution-evidence",
    "execution-evidence-to-certification-evidence",
    "certification-evidence-to-archive-readiness",
  ]);
  assert.deepEqual(graph.nodeIds, [
    "mission-order-authority",
    "runtime-core",
    "mission-runtime",
    "workflow-runtime",
    "agent-runtime",
    "execution-engine",
    "execution-evidence",
    "certification-evidence",
    "archive-readiness",
  ]);
  assert.equal(Object.isFrozen(graph), true);
  assert.equal(Object.isFrozen(graph.linkIds), true);
  assert.equal(Object.isFrozen(graph.nodeIds), true);
  assert.equal(Object.isFrozen(graph.links), true);
});

test("Runtime Traceability Foundation consumes Runtime evidence chain", () => {
  const result = verifyRuntimeTraceabilityFoundation();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.runtimeCore.orchestrator.ready, true);
  assert.equal(result.evidence.missionRuntime.ready, true);
  assert.equal(result.evidence.workflowRuntime.ready, true);
  assert.equal(result.evidence.agentRuntime.ready, true);
  assert.equal(result.evidence.executionEngine.ready, true);
  assert.equal(result.evidence.graph.ready, true);
  assert.equal(result.evidence.dependencyCount, 5);
  assert.equal(result.evidence.readyDependencyCount, 5);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Runtime Traceability remains deterministic", () => {
  const first = verifyRuntimeTraceabilityFoundation();
  const second = verifyRuntimeTraceabilityFoundation();

  assert.deepEqual(first, second);
});

test("Runtime Traceability creates immutable link evidence", () => {
  const link = createRuntimeTraceabilityLink(
    "mission-order-to-runtime-core",
    "P4-MO-012-RUNTIME-TRACEABILITY",
    true,
  );

  assert.deepEqual(link, {
    id: "mission-order-to-runtime-core",
    from: "mission-order-authority",
    to: "runtime-core",
    sourceReference: "P4-MO-012-RUNTIME-TRACEABILITY",
    evidenceReady: true,
  });
  assert.equal(Object.isFrozen(link), true);
});

test("Runtime Traceability reports partial coverage when links are missing", () => {
  const graph = verifyRuntimeTraceability([
    createRuntimeTraceabilityLink(
      "mission-order-to-runtime-core",
      "P4-MO-012-RUNTIME-TRACEABILITY",
      true,
    ),
  ]);

  assert.equal(graph.ready, false);
  assert.equal(graph.coverageLevel, "PARTIAL");
  assert.equal(graph.linkCount, 1);
  assert.equal(graph.readyLinkCount, 1);
});

test("Runtime Traceability reports partial coverage when evidence is not ready", () => {
  const graph = verifyRuntimeTraceability(
    createRuntimeTraceabilityLinks({
      runtimeCoreReady: true,
      missionRuntimeReady: true,
      workflowRuntimeReady: false,
      agentRuntimeReady: true,
      executionEngineReady: true,
    }),
  );

  assert.equal(graph.ready, false);
  assert.equal(graph.coverageLevel, "PARTIAL");
  assert.equal(graph.linkCount, 8);
  assert.equal(graph.readyLinkCount, 7);
});

test("Runtime Traceability Foundation reports not ready when a dependency fails", () => {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = verifyMissionRuntimeFoundation();
  const workflowRuntime = Object.freeze({
    ...verifyWorkflowRuntimeFoundation(),
    passed: false,
  });
  const agentRuntime = verifyAgentRuntimeFoundation();
  const executionEngine = verifyExecutionEngineFoundation();
  const graph = verifyRuntimeTraceability(
    createRuntimeTraceabilityLinks({
      runtimeCoreReady: runtimeCore.passed,
      missionRuntimeReady: missionRuntime.passed,
      workflowRuntimeReady: workflowRuntime.passed,
      agentRuntimeReady: agentRuntime.passed,
      executionEngineReady: executionEngine.passed,
    }),
  );
  const evidence = createRuntimeTraceabilityEvidence(
    runtimeCore,
    missionRuntime,
    workflowRuntime,
    agentRuntime,
    executionEngine,
    graph,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyDependencyCount, 4);
  assert.equal(evidence.graph.ready, false);
  assert.equal(evidence.graph.readyLinkCount, 7);
  assert.equal(Object.isFrozen(evidence), true);
});

test("Runtime Traceability rejects unknown links", () => {
  assert.throws(
    () =>
      createRuntimeTraceabilityGraphEvidence([
        {
          id: "unknown-link" as never,
          from: "mission-order-authority",
          to: "runtime-core",
          sourceReference: "P4-MO-012-RUNTIME-TRACEABILITY",
          evidenceReady: true,
        },
      ]),
    /^Error: RTRC-001:/,
  );
});

test("Runtime Traceability rejects duplicate links", () => {
  assert.throws(
    () =>
      createRuntimeTraceabilityGraphEvidence([
        createRuntimeTraceabilityLink(
          "mission-order-to-runtime-core",
          "P4-MO-012-RUNTIME-TRACEABILITY",
          true,
        ),
        createRuntimeTraceabilityLink(
          "mission-order-to-runtime-core",
          "P4-MO-012-RUNTIME-TRACEABILITY",
          true,
        ),
      ]),
    /^Error: RTRC-002:/,
  );
});

test("Runtime Traceability rejects unknown nodes", () => {
  assert.throws(
    () =>
      createRuntimeTraceabilityGraphEvidence([
        {
          id: "mission-order-to-runtime-core",
          from: "unknown-node" as never,
          to: "runtime-core",
          sourceReference: "P4-MO-012-RUNTIME-TRACEABILITY",
          evidenceReady: true,
        },
      ]),
    /^Error: RTRC-003:/,
  );
});

test("Runtime Traceability rejects incoherent link topology", () => {
  assert.throws(
    () =>
      createRuntimeTraceabilityGraphEvidence([
        {
          id: "mission-order-to-runtime-core",
          from: "mission-order-authority",
          to: "mission-runtime",
          sourceReference: "P4-MO-012-RUNTIME-TRACEABILITY",
          evidenceReady: true,
        },
      ]),
    /^Error: RTRC-004:/,
  );
});

test("Runtime Traceability rejects empty or non-normalized source references", () => {
  assert.throws(
    () =>
      createRuntimeTraceabilityLink(
        "mission-order-to-runtime-core",
        " P4-MO-012-RUNTIME-TRACEABILITY ",
        true,
      ),
    /^Error: RTRC-006:/,
  );
});

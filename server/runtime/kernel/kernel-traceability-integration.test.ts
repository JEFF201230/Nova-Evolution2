import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-traceability-integration.ts";

test("Kernel Traceability Integration exposes no public API", async () => {
  const module = await import("./kernel-traceability-integration.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Traceability Integration creates immutable runtime evidence integration", () => {
  const { createKernelTraceabilityIntegration } = loadKernelInternals([
    "createKernelTraceabilityIntegration",
  ]);

  const integration = createKernelTraceabilityIntegration(
    createRuntimeContext(),
    createRuntimeExecution(),
    createWorkflowExecution(),
    createDecisionReportingIntegration(),
    createTraceabilityGraph(),
  );

  assert.equal(integration.integrationId, "KERNEL_TRACEABILITY_INTEGRATION");
  assert.equal(integration.readyForRuntimeEvidence, true);
  assert.equal(integration.evidence.valid, true);
  assert.deepEqual(Array.from(integration.componentIds), [
    "KERNEL_RUNTIME_CONTEXT",
    "KERNEL_RUNTIME_EXECUTION",
    "WORKFLOW_EXECUTION_PREPARED",
    "KERNEL_DECISION_REPORTING_INTEGRATION",
    "KERNEL_TRACEABILITY_GRAPH",
  ]);
  assert.equal(Object.isFrozen(integration), true);
  assert.equal(Object.isFrozen(integration.evidence), true);
});

test("Kernel Traceability Integration rejects missing components", () => {
  const { createKernelTraceabilityIntegration } = loadKernelInternals([
    "createKernelTraceabilityIntegration",
  ]);

  assert.throws(
    () => createKernelTraceabilityIntegration(
      createRuntimeContext(),
      createRuntimeExecution(),
      createWorkflowExecution(),
      createDecisionReportingIntegration(),
      null,
    ),
    /KTI-001/,
  );
});

test("Kernel Traceability Integration rejects duplicate components", () => {
  const { createKernelTraceabilityIntegration } = loadKernelInternals([
    "createKernelTraceabilityIntegration",
  ]);

  assert.throws(
    () => createKernelTraceabilityIntegration(
      createRuntimeContext(),
      createRuntimeExecution(),
      createWorkflowExecution(),
      createDecisionReportingIntegration(),
      {
        ...createTraceabilityGraph(),
        contextId: "KERNEL_RUNTIME_CONTEXT",
      },
    ),
    /KTI-003/,
  );
});

function createRuntimeContext(): Record<string, unknown> {
  return Object.freeze({
    contextId: "KERNEL_RUNTIME_CONTEXT",
    readyForRuntimeExecution: true,
    evidence: Object.freeze({ valid: true }),
  });
}

function createRuntimeExecution(): Record<string, unknown> {
  return Object.freeze({
    executionId: "KERNEL_RUNTIME_EXECUTION",
    readyForWorkflowExecution: true,
    evidence: Object.freeze({ valid: true }),
  });
}

function createWorkflowExecution(): Record<string, unknown> {
  return Object.freeze({
    workflowExecutionStateId: "WORKFLOW_EXECUTION_PREPARED",
    readyForDecisionReportingIntegration: true,
    evidence: Object.freeze({ valid: true }),
  });
}

function createDecisionReportingIntegration(): Record<string, unknown> {
  return Object.freeze({
    integrationId: "KERNEL_DECISION_REPORTING_INTEGRATION",
    readyForTraceabilityIntegration: true,
    evidence: Object.freeze({ valid: true }),
  });
}

function createTraceabilityGraph(): Record<string, unknown> {
  return Object.freeze({
    nodes: Object.freeze(["MISSION_ORDER_INTAKE"]),
    links: Object.freeze([]),
    evidence: Object.freeze({ valid: true }),
  });
}

function loadKernelInternals(names: readonly string[]): Record<string, any> {
  const modulePath = join(dirname(fileURLToPath(import.meta.url)), MODULE_FILE);
  const source = readFileSync(modulePath, "utf8");
  const exposedNames = names.map((name) => `${JSON.stringify(name)}: ${name}`).join(",");
  const { code } = transformSync(
    `${source}\nglobalThis.__kernelInternals = { ${exposedNames} };`,
    {
      format: "cjs",
      loader: "ts",
      target: "es2022",
    },
  );
  const sandbox: any = {
    console,
    exports: {},
    module: { exports: {} },
  };

  sandbox.globalThis = sandbox;
  runInNewContext(code, sandbox, { filename: MODULE_FILE });

  return sandbox.__kernelInternals;
}

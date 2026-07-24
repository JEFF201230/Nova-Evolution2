import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-execution-flow-control.ts";

test("Kernel Execution Flow Control exposes no public API", async () => {
  const module = await import("./kernel-execution-flow-control.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Execution Flow Control accepts complete ready components", () => {
  const { createKernelExecutionFlowControl } = loadKernelInternals([
    "createKernelExecutionFlowControl",
  ]);

  const flow = createKernelExecutionFlowControl(createCompleteComponents());

  assert.equal(flow.flowId, "KERNEL_EXECUTION_FLOW_CONTROL");
  assert.equal(flow.evidence.valid, true);
  assert.equal(flow.evidence.componentsReady, true);
  assert.equal(flow.readyForContinuousKernelCampaign, true);
  assert.equal(Object.isFrozen(flow), true);
  assert.equal(Object.isFrozen(flow.evidence), true);
});

test("Kernel Execution Flow Control rejects missing components", () => {
  const { createKernelExecutionFlowControl } = loadKernelInternals([
    "createKernelExecutionFlowControl",
  ]);

  assert.throws(
    () => createKernelExecutionFlowControl(createCompleteComponents().slice(0, -1)),
    /KEFC-001/,
  );
});

test("Kernel Execution Flow Control rejects duplicate components", () => {
  const { createKernelExecutionFlowControl } = loadKernelInternals([
    "createKernelExecutionFlowControl",
  ]);
  const components = createCompleteComponents();

  assert.throws(
    () => createKernelExecutionFlowControl([
      ...components,
      components[0],
    ]),
    /KEFC-002/,
  );
});

function createCompleteComponents(): readonly Record<string, unknown>[] {
  return Object.freeze([
    Object.freeze({
      primitiveControlId: "KERNEL_PRIMITIVE_CONTROL",
      readyForKernelExecutionFoundation: true,
    }),
    Object.freeze({
      cycleId: "KERNEL_MISSION_ORDER_CYCLE",
      readyForWorkflowExecution: true,
    }),
    Object.freeze({
      contextId: "KERNEL_RUNTIME_CONTEXT",
      readyForRuntimeExecution: true,
    }),
    Object.freeze({
      executionId: "KERNEL_RUNTIME_EXECUTION",
      readyForWorkflowExecution: true,
    }),
    Object.freeze({
      workflowExecutionStateId: "WORKFLOW_EXECUTION_PREPARED",
      readyForDecisionReportingIntegration: true,
    }),
    Object.freeze({
      integrationId: "KERNEL_DECISION_REPORTING_INTEGRATION",
      readyForTraceabilityIntegration: true,
    }),
    Object.freeze({
      integrationId: "KERNEL_TRACEABILITY_INTEGRATION",
      readyForRuntimeEvidence: true,
    }),
  ]);
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

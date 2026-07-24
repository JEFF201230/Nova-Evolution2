import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-workflow-execution.ts";

test("Kernel Workflow Execution exposes no public API", async () => {
  const module = await import("./kernel-workflow-execution.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Workflow Execution creates immutable prepared workflow execution", () => {
  const { createKernelWorkflowExecution } = loadKernelInternals([
    "createKernelWorkflowExecution",
  ]);

  const execution = createKernelWorkflowExecution(createRuntimeExecution());

  assert.equal(execution.workflowExecutionStateId, "WORKFLOW_EXECUTION_PREPARED");
  assert.equal(execution.sourceRuntimeExecutionId, "KERNEL_RUNTIME_EXECUTION");
  assert.equal(execution.readyForDecisionReportingIntegration, true);
  assert.equal(execution.evidence.valid, true);
  assert.equal(Object.isFrozen(execution), true);
  assert.equal(Object.isFrozen(execution.evidence), true);
});

test("Kernel Workflow Execution rejects unknown Runtime Execution identifiers", () => {
  const { createKernelWorkflowExecution } = loadKernelInternals([
    "createKernelWorkflowExecution",
  ]);

  assert.throws(
    () => createKernelWorkflowExecution({
      ...createRuntimeExecution(),
      executionId: "UNKNOWN",
    }),
    /KWE-002/,
  );
});

test("Kernel Workflow Execution requires ready Runtime Execution", () => {
  const { createKernelWorkflowExecution } = loadKernelInternals([
    "createKernelWorkflowExecution",
  ]);

  assert.throws(
    () => createKernelWorkflowExecution({
      ...createRuntimeExecution(),
      readyForWorkflowExecution: false,
    }),
    /KWE-003/,
  );
});

function createRuntimeExecution(): Record<string, unknown> {
  return Object.freeze({
    executionId: "KERNEL_RUNTIME_EXECUTION",
    contextId: "KERNEL_RUNTIME_CONTEXT",
    executionState: "READY_TO_EXECUTE",
    acceptedIntake: Object.freeze({ missionOrderId: "P3-WS-003-MO-006" }),
    contextEvidence: Object.freeze({ valid: true }),
    evidence: Object.freeze({ valid: true }),
    readyForWorkflowExecution: true,
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

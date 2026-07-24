import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-workflow-composition.ts";

test("Kernel Workflow Composition exposes no public API", async () => {
  const module = await import("./kernel-workflow-composition.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Workflow Composition composes workflow state and execution", () => {
  const { createKernelWorkflowComposition } = loadKernelInternals([
    "createKernelWorkflowComposition",
  ]);

  const composition = createKernelWorkflowComposition(
    createAcceptedWorkflowState(),
    createWorkflowExecution(),
  );

  assert.equal(composition.compositionId, "KERNEL_WORKFLOW_COMPOSITION");
  assert.deepEqual(Array.from(composition.stepIds), [
    "WORKFLOW_STATE",
    "WORKFLOW_EXECUTION",
  ]);
  assert.equal(composition.evidence.valid, true);
  assert.equal(composition.readyForKernelComposition, true);
  assert.equal(Object.isFrozen(composition), true);
  assert.equal(Object.isFrozen(composition.evidence), true);
});

test("Kernel Workflow Composition rejects unprepared workflow execution", () => {
  const { createKernelWorkflowComposition } = loadKernelInternals([
    "createKernelWorkflowComposition",
  ]);

  assert.throws(
    () => createKernelWorkflowComposition(
      createAcceptedWorkflowState(),
      {
        ...createWorkflowExecution(),
        readyForDecisionReportingIntegration: false,
      },
    ),
    /KWC-003/,
  );
});

function createAcceptedWorkflowState(): Record<string, unknown> {
  return Object.freeze({
    stateId: "MISSION_ORDER_INTAKE_ACCEPTED",
    previousStateId: "WORKFLOW_STATE_CREATED",
    sourceDecision: "ACCEPTED",
    intakeEvidence: Object.freeze({ valid: true }),
    acceptedIntake: Object.freeze({ missionOrderId: "P3-WS-003-MO-006" }),
    evidence: Object.freeze({ valid: true }),
  });
}

function createWorkflowExecution(): Record<string, unknown> {
  return Object.freeze({
    workflowExecutionStateId: "WORKFLOW_EXECUTION_PREPARED",
    sourceRuntimeExecutionId: "KERNEL_RUNTIME_EXECUTION",
    evidence: Object.freeze({ valid: true }),
    readyForDecisionReportingIntegration: true,
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

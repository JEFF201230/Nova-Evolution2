import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-runtime-execution.ts";

test("Kernel Runtime Execution exposes no public API", async () => {
  const module = await import("./kernel-runtime-execution.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Runtime Execution creates immutable prepared execution", () => {
  const { createKernelRuntimeExecution } = loadKernelInternals([
    "createKernelRuntimeExecution",
  ]);

  const execution = createKernelRuntimeExecution(createRuntimeContext());

  assert.equal(execution.executionId, "KERNEL_RUNTIME_EXECUTION");
  assert.equal(execution.contextId, "KERNEL_RUNTIME_CONTEXT");
  assert.equal(execution.executionState, "READY_TO_EXECUTE");
  assert.equal(execution.readyForWorkflowExecution, true);
  assert.equal(execution.evidence.valid, true);
  assert.equal(Object.isFrozen(execution), true);
  assert.equal(Object.isFrozen(execution.evidence), true);
});

test("Kernel Runtime Execution rejects unknown context identifiers", () => {
  const { createKernelRuntimeExecution } = loadKernelInternals([
    "createKernelRuntimeExecution",
  ]);

  assert.throws(
    () => createKernelRuntimeExecution({
      ...createRuntimeContext(),
      contextId: "UNKNOWN",
    }),
    /KRE-002/,
  );
});

test("Kernel Runtime Execution requires ready Runtime Context", () => {
  const { createKernelRuntimeExecution } = loadKernelInternals([
    "createKernelRuntimeExecution",
  ]);

  assert.throws(
    () => createKernelRuntimeExecution({
      ...createRuntimeContext(),
      readyForRuntimeExecution: false,
    }),
    /KRE-003/,
  );
});

function createRuntimeContext(): Record<string, unknown> {
  return Object.freeze({
    contextId: "KERNEL_RUNTIME_CONTEXT",
    sourceStateId: "MISSION_ORDER_INTAKE_ACCEPTED",
    sourceDecision: "ACCEPTED",
    acceptedIntake: Object.freeze({ missionOrderId: "P3-WS-003-MO-006" }),
    workflowEvidence: Object.freeze({ valid: true }),
    evidence: Object.freeze({ valid: true }),
    readyForRuntimeExecution: true,
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

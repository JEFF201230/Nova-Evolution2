import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-runtime-context.ts";

test("Kernel Runtime Context exposes no public API", async () => {
  const module = await import("./kernel-runtime-context.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Runtime Context creates immutable context from accepted workflow state", () => {
  const { createKernelRuntimeContext } = loadKernelInternals([
    "createKernelRuntimeContext",
  ]);

  const context = createKernelRuntimeContext(createAcceptedWorkflowState());

  assert.equal(context.contextId, "KERNEL_RUNTIME_CONTEXT");
  assert.equal(context.sourceStateId, "MISSION_ORDER_INTAKE_ACCEPTED");
  assert.equal(context.sourceDecision, "ACCEPTED");
  assert.equal(context.readyForRuntimeExecution, true);
  assert.equal(context.evidence.valid, true);
  assert.equal(Object.isFrozen(context), true);
  assert.equal(Object.isFrozen(context.evidence), true);
});

test("Kernel Runtime Context rejects unknown workflow states deterministically", () => {
  const { createKernelRuntimeContext } = loadKernelInternals([
    "createKernelRuntimeContext",
  ]);

  assert.throws(
    () => createKernelRuntimeContext({
      ...createAcceptedWorkflowState(),
      stateId: "UNKNOWN",
    }),
    /KRC-002/,
  );
});

test("Kernel Runtime Context rejects missing accepted intake deterministically", () => {
  const { createKernelRuntimeContext } = loadKernelInternals([
    "createKernelRuntimeContext",
  ]);

  assert.throws(
    () => createKernelRuntimeContext({
      ...createAcceptedWorkflowState(),
      acceptedIntake: null,
    }),
    /KRC-003/,
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

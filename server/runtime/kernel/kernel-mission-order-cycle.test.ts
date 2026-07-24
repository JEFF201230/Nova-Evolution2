import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-mission-order-cycle.ts";

test("Kernel Mission Order Cycle exposes no public API", async () => {
  const module = await import("./kernel-mission-order-cycle.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Mission Order Cycle creates immutable execution-ready state", () => {
  const { createKernelMissionOrderCycle } = loadKernelInternals([
    "createKernelMissionOrderCycle",
  ]);

  const cycle = createKernelMissionOrderCycle(createAcceptedIntakeOutput());

  assert.equal(cycle.cycleId, "KERNEL_MISSION_ORDER_CYCLE");
  assert.equal(cycle.initialStateId, "MISSION_ORDER_ACCEPTED");
  assert.equal(cycle.currentStateId, "MISSION_ORDER_EXECUTION_READY");
  assert.equal(cycle.readyForWorkflowExecution, true);
  assert.equal(cycle.evidence.valid, true);
  assert.equal(Object.isFrozen(cycle), true);
  assert.equal(Object.isFrozen(cycle.evidence), true);
});

test("Kernel Mission Order Cycle rejects REJECTED intake outputs", () => {
  const { createKernelMissionOrderCycle } = loadKernelInternals([
    "createKernelMissionOrderCycle",
  ]);

  assert.throws(
    () => createKernelMissionOrderCycle({
      ...createAcceptedIntakeOutput(),
      decision: "REJECTED",
      readyForWorkflowStateHandling: false,
      rejectionCauses: Object.freeze([Object.freeze({ code: "KMOI-002" })]),
    }),
    /KMOC-002/,
  );
});

test("Kernel Mission Order Cycle rejects contradictory accepted outputs", () => {
  const { createKernelMissionOrderCycle } = loadKernelInternals([
    "createKernelMissionOrderCycle",
  ]);

  assert.throws(
    () => createKernelMissionOrderCycle({
      ...createAcceptedIntakeOutput(),
      rejectionCauses: Object.freeze([Object.freeze({ code: "KMOI-002" })]),
    }),
    /KMOC-003/,
  );
});

function createAcceptedIntakeOutput(): Record<string, unknown> {
  return Object.freeze({
    decision: "ACCEPTED",
    evidence: Object.freeze({ valid: true }),
    acceptedIntake: Object.freeze({ missionOrderId: "P3-WS-003-MO-006" }),
    rejectionCauses: Object.freeze([]),
    readyForWorkflowStateHandling: true,
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

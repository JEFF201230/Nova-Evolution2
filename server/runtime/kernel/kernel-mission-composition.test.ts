import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { verifyKernelReadinessGate } from "./kernel-readiness-gate.js";

const MODULE_FILE = "kernel-mission-composition.ts";

test("Kernel Mission Composition exposes no public API", async () => {
  const module = await import("./kernel-mission-composition.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Mission Composition composes readiness, intake, and cycle", () => {
  const { createKernelMissionComposition } = loadKernelInternals([
    "createKernelMissionComposition",
  ]);

  const composition = createKernelMissionComposition(
    verifyKernelReadinessGate(),
    createAcceptedIntakeOutput(),
    createMissionOrderCycle(),
  );

  assert.equal(composition.compositionId, "KERNEL_MISSION_COMPOSITION");
  assert.deepEqual(Array.from(composition.stepIds), [
    "READINESS_GATE",
    "MISSION_ORDER_INTAKE",
    "MISSION_ORDER_CYCLE",
  ]);
  assert.equal(composition.evidence.valid, true);
  assert.equal(composition.readyForKernelComposition, true);
  assert.equal(Object.isFrozen(composition), true);
  assert.equal(Object.isFrozen(composition.evidence), true);
});

test("Kernel Mission Composition rejects incoherent mission ordering", () => {
  const { createKernelMissionComposition } = loadKernelInternals([
    "createKernelMissionComposition",
  ]);

  assert.throws(
    () => createKernelMissionComposition(
      verifyKernelReadinessGate(),
      createMissionOrderCycle(),
      createAcceptedIntakeOutput(),
    ),
    /KMC-004/,
  );
});

function createAcceptedIntakeOutput(): Record<string, unknown> {
  return Object.freeze({
    decision: "ACCEPTED",
    evidence: Object.freeze({ valid: true }),
    acceptedIntake: Object.freeze({
      missionOrderId: "P3-WS-003-MO-006",
      targetIncrement: "P3-WS-003-KERNEL-COMPOSITION-001",
      requestedFilePath: "server/runtime/kernel/kernel-composition-foundation.ts",
      authorizedCodeArea: "server/runtime/kernel",
    }),
    rejectionCauses: Object.freeze([]),
    readyForWorkflowStateHandling: true,
  });
}

function createMissionOrderCycle(): Record<string, unknown> {
  return Object.freeze({
    cycleId: "KERNEL_MISSION_ORDER_CYCLE",
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

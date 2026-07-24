import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-mission-order-intake.ts";

test("Kernel Mission Order Intake exposes no public API", async () => {
  const module = await import("./kernel-mission-order-intake.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Mission Order Intake creates an ACCEPTED workflow-ready output", () => {
  const { createKernelMissionOrderIntakeWorkflowStateHandlingOutput } =
    loadKernelInternals([
      "createKernelMissionOrderIntakeWorkflowStateHandlingOutput",
    ]);

  const output = createKernelMissionOrderIntakeWorkflowStateHandlingOutput({
    missionOrderId: "p3-ws-003-mo-006",
    targetIncrement: "p3-ws-003-kernel-impl-003",
    requestedFilePath: "server\\runtime\\kernel\\kernel-workflow-state-handling.ts",
    authorizedCodeArea: "server/runtime/kernel",
  });

  assert.equal(output.decision, "ACCEPTED");
  assert.equal(output.readyForWorkflowStateHandling, true);
  assert.equal(output.rejectionCauses.length, 0);
  assert.equal(output.acceptedIntake.missionOrderId, "P3-WS-003-MO-006");
  assert.equal(
    output.acceptedIntake.requestedFilePath,
    "server/runtime/kernel/kernel-workflow-state-handling.ts",
  );
  assert.equal(Object.isFrozen(output), true);
  assert.equal(Object.isFrozen(output.evidence), true);
});

test("Kernel Mission Order Intake rejects incomplete records deterministically", () => {
  const { createKernelMissionOrderIntakeWorkflowStateHandlingOutput } =
    loadKernelInternals([
      "createKernelMissionOrderIntakeWorkflowStateHandlingOutput",
    ]);

  const output = createKernelMissionOrderIntakeWorkflowStateHandlingOutput({
    missionOrderId: "P3-WS-003-MO-006",
  });

  assert.equal(output.decision, "REJECTED");
  assert.equal(output.readyForWorkflowStateHandling, false);
  assert.equal(output.acceptedIntake, null);
  assert.equal(output.rejectionCauses.length > 0, true);
  assert.equal(output.rejectionCauses.every((cause: { code: string }) => cause.code.startsWith("KMOI-")), true);
});

test("Kernel Mission Order Intake rejects unknown rejection codes", () => {
  const { createKernelMissionOrderIntakeRejectedDecisionEvidence } =
    loadKernelInternals([
      "createKernelMissionOrderIntakeRejectedDecisionEvidence",
    ]);

  assert.throws(
    () => createKernelMissionOrderIntakeRejectedDecisionEvidence(["UNKNOWN"]),
    /KMOI-009/,
  );
});

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

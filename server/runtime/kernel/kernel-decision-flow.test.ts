import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-decision-flow.ts";

test("Kernel Decision Flow exposes no public API", async () => {
  const module = await import("./kernel-decision-flow.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Decision Flow creates an immutable deterministic decision", () => {
  const { createKernelDecisionFlow } = loadKernelInternals([
    "createKernelDecisionFlow",
  ]);

  const result = createKernelDecisionFlow(createAcceptedWorkflowState());

  assert.equal(result.decision, "DECISION_FLOW_ACCEPTED");
  assert.equal(result.readyForReportingFlow, true);
  assert.equal(result.evidence.valid, true);
  assert.equal(result.aggregation.stateId, "MISSION_ORDER_INTAKE_ACCEPTED");
  assert.equal(result.aggregation.sourceDecision, "ACCEPTED");
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.aggregation), true);
  assert.equal(Object.isFrozen(result.evidence), true);
});

test("Kernel Decision Flow rejects unknown workflow states deterministically", () => {
  const { createKernelDecisionFlow } = loadKernelInternals([
    "createKernelDecisionFlow",
  ]);

  assert.throws(
    () => createKernelDecisionFlow({
      ...createAcceptedWorkflowState(),
      stateId: "UNKNOWN",
    }),
    /KDF-002/,
  );
});

test("Kernel Decision Flow requires ACCEPTED source decision", () => {
  const { createKernelDecisionFlow } = loadKernelInternals([
    "createKernelDecisionFlow",
  ]);

  assert.throws(
    () => createKernelDecisionFlow({
      ...createAcceptedWorkflowState(),
      sourceDecision: "REJECTED",
    }),
    /KDF-003/,
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

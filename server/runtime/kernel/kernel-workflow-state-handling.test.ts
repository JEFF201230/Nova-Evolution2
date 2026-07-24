import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-workflow-state-handling.ts";

test("Kernel Workflow State Handling exposes no public API", async () => {
  const module = await import("./kernel-workflow-state-handling.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Workflow State Handling consumes only an ACCEPTED intake result", () => {
  const {
    createKernelWorkflowStateHandlingState,
    createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake,
  } = loadKernelInternals([
    "createKernelWorkflowStateHandlingState",
    "createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake",
  ]);
  const intakeResult = createAcceptedIntakeResult();

  const state = createKernelWorkflowStateHandlingState(intakeResult);
  const initialState =
    createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake(intakeResult);

  assert.equal(state.stateId, "MISSION_ORDER_INTAKE_ACCEPTED");
  assert.equal(state.intakeDecision, "ACCEPTED");
  assert.equal(state.evidence.valid, true);
  assert.equal(initialState.stateId, "MISSION_ORDER_INTAKE_ACCEPTED");
  assert.equal(initialState.previousStateId, "WORKFLOW_STATE_CREATED");
  assert.equal(initialState.evidence.initialTransitionAuthorized, true);
  assert.equal(Object.isFrozen(state), true);
  assert.equal(Object.isFrozen(initialState), true);
});

test("Kernel Workflow State Handling rejects REJECTED intake results deterministically", () => {
  const {
    createKernelWorkflowStateHandlingState,
    createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake,
  } = loadKernelInternals([
    "createKernelWorkflowStateHandlingState",
    "createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake",
  ]);
  const intakeResult = {
    decision: "REJECTED",
    evidence: {},
    acceptedIntake: null,
    rejectionCauses: Object.freeze([
      Object.freeze({
        code: "KMOI-002",
        fieldName: "targetIncrement",
        message: "missing",
      }),
    ]),
    readyForWorkflowStateHandling: false,
  };

  assert.throws(() => createKernelWorkflowStateHandlingState(intakeResult), /KWSH-003/);
  assert.throws(
    () => createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake(intakeResult),
    /KWSH-I-003/,
  );
});

test("Kernel Workflow State Handling rejects unknown states deterministically", () => {
  const { createKernelWorkflowStateHandlingInitialStateEvidence } =
    loadKernelInternals(["createKernelWorkflowStateHandlingInitialStateEvidence"]);

  const evidence = createKernelWorkflowStateHandlingInitialStateEvidence(
    "UNKNOWN",
    "MISSION_ORDER_INTAKE_ACCEPTED",
    createAcceptedIntakeResult(),
  );

  assert.equal(evidence.initialStateKnown, false);
  assert.equal(evidence.valid, false);
  assert.equal(Object.isFrozen(evidence), true);
});

function createAcceptedIntakeResult(): Record<string, unknown> {
  return Object.freeze({
    decision: "ACCEPTED",
    evidence: Object.freeze({ evidenceComplete: true }),
    acceptedIntake: Object.freeze({
      missionOrderId: "P3-WS-003-MO-006",
      targetIncrement: "P3-WS-003-KERNEL-IMPL-003",
      requestedFilePath: "server/runtime/kernel/kernel-workflow-state-handling.ts",
      authorizedCodeArea: "server/runtime/kernel",
    }),
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

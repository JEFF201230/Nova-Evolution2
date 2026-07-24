import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";
import { verifyKernelReadinessGate } from "./kernel-readiness-gate.js";

const MODULE_FILE = "kernel-composition-foundation.ts";

test("Kernel Composition Foundation exposes no public API", async () => {
  const module = await import("./kernel-composition-foundation.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Composition Foundation composes actual Kernel execution outputs", () => {
  const pipeline = createKernelCompositionPipeline();
  const { createKernelCompositionFoundation } = loadKernelInternals(MODULE_FILE, [
    "createKernelCompositionFoundation",
  ]);

  const foundation = createKernelCompositionFoundation(
    pipeline.missionComposition,
    pipeline.workflowComposition,
    pipeline.runtimeComposition,
    pipeline.decisionReportingComposition,
    pipeline.traceabilityComposition,
    pipeline.executionFlowControl,
  );

  assert.equal(foundation.foundationId, "KERNEL_COMPOSITION_FOUNDATION");
  assert.deepEqual(Array.from(foundation.componentIds), [
    "KERNEL_MISSION_COMPOSITION",
    "KERNEL_WORKFLOW_COMPOSITION",
    "KERNEL_RUNTIME_COMPOSITION",
    "KERNEL_DECISION_REPORTING_COMPOSITION",
    "KERNEL_TRACEABILITY_COMPOSITION",
    "KERNEL_EXECUTION_FLOW_CONTROL",
  ]);
  assert.equal(foundation.evidence.valid, true);
  assert.equal(foundation.evidence.componentsReady, true);
  assert.equal(foundation.readyForKernelExecutionFoundation, true);
  assert.equal(Object.isFrozen(foundation), true);
  assert.equal(Object.isFrozen(foundation.evidence), true);
});

test("Kernel Composition Foundation rejects incomplete component sets", () => {
  const pipeline = createKernelCompositionPipeline();
  const { createKernelCompositionFoundation } = loadKernelInternals(MODULE_FILE, [
    "createKernelCompositionFoundation",
  ]);

  assert.throws(
    () => createKernelCompositionFoundation(
      pipeline.missionComposition,
      pipeline.workflowComposition,
      pipeline.runtimeComposition,
      pipeline.decisionReportingComposition,
      pipeline.traceabilityComposition,
      null,
    ),
    /KCF-001/,
  );
});

function createKernelCompositionPipeline(): Record<string, unknown> {
  const { createKernelMissionOrderIntakeWorkflowStateHandlingOutput } =
    loadKernelInternals("kernel-mission-order-intake.ts", [
      "createKernelMissionOrderIntakeWorkflowStateHandlingOutput",
    ]);
  const { createKernelMissionOrderCycle } = loadKernelInternals(
    "kernel-mission-order-cycle.ts",
    ["createKernelMissionOrderCycle"],
  );
  const {
    createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake,
  } = loadKernelInternals("kernel-workflow-state-handling.ts", [
    "createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake",
  ]);
  const { createKernelRuntimeContext } = loadKernelInternals(
    "kernel-runtime-context.ts",
    ["createKernelRuntimeContext"],
  );
  const { createKernelRuntimeExecution } = loadKernelInternals(
    "kernel-runtime-execution.ts",
    ["createKernelRuntimeExecution"],
  );
  const { createKernelWorkflowExecution } = loadKernelInternals(
    "kernel-workflow-execution.ts",
    ["createKernelWorkflowExecution"],
  );
  const { createKernelDecisionFlow } = loadKernelInternals(
    "kernel-decision-flow.ts",
    ["createKernelDecisionFlow"],
  );
  const { createKernelReportingFlowReport } = loadKernelInternals(
    "kernel-reporting-flow.ts",
    ["createKernelReportingFlowReport"],
  );
  const { createKernelDecisionReportingIntegration } = loadKernelInternals(
    "kernel-decision-reporting-integration.ts",
    ["createKernelDecisionReportingIntegration"],
  );
  const { createKernelTraceabilityGraph } = loadKernelInternals(
    "kernel-traceability.ts",
    ["createKernelTraceabilityGraph"],
  );
  const { createKernelTraceabilityIntegration } = loadKernelInternals(
    "kernel-traceability-integration.ts",
    ["createKernelTraceabilityIntegration"],
  );
  const { createKernelExecutionTraceability } = loadKernelInternals(
    "kernel-execution-traceability.ts",
    ["createKernelExecutionTraceability"],
  );
  const { createKernelPrimitiveControlState } = loadKernelInternals(
    "kernel-primitive-control.ts",
    ["createKernelPrimitiveControlState"],
  );
  const { createKernelExecutionFlowControl } = loadKernelInternals(
    "kernel-execution-flow-control.ts",
    ["createKernelExecutionFlowControl"],
  );
  const { createKernelMissionComposition } = loadKernelInternals(
    "kernel-mission-composition.ts",
    ["createKernelMissionComposition"],
  );
  const { createKernelWorkflowComposition } = loadKernelInternals(
    "kernel-workflow-composition.ts",
    ["createKernelWorkflowComposition"],
  );
  const { createKernelRuntimeComposition } = loadKernelInternals(
    "kernel-runtime-composition.ts",
    ["createKernelRuntimeComposition"],
  );
  const { createKernelDecisionReportingComposition } = loadKernelInternals(
    "kernel-decision-reporting-composition.ts",
    ["createKernelDecisionReportingComposition"],
  );
  const { createKernelTraceabilityComposition } = loadKernelInternals(
    "kernel-traceability-composition.ts",
    ["createKernelTraceabilityComposition"],
  );

  const readinessGate = verifyKernelReadinessGate();
  const missionOrderIntake =
    createKernelMissionOrderIntakeWorkflowStateHandlingOutput({
      missionOrderId: "P3-WS-003-MO-006",
      targetIncrement: "P3-WS-003-KERNEL-COMPOSITION-001",
      requestedFilePath: "server/runtime/kernel/kernel-composition-foundation.ts",
      authorizedCodeArea: "server/runtime/kernel",
    });
  const missionOrderCycle = createKernelMissionOrderCycle(missionOrderIntake);
  const workflowState =
    createKernelWorkflowStateHandlingInitialStateFromMissionOrderIntake(
      missionOrderIntake,
    );
  const runtimeContext = createKernelRuntimeContext(workflowState);
  const runtimeExecution = createKernelRuntimeExecution(runtimeContext);
  const workflowExecution = createKernelWorkflowExecution(runtimeExecution);
  const decisionFlow = createKernelDecisionFlow(workflowState);
  const reportingFlow = createKernelReportingFlowReport(decisionFlow);
  const decisionReportingIntegration =
    createKernelDecisionReportingIntegration(decisionFlow, reportingFlow);
  const traceabilityGraph = createKernelTraceabilityGraph();
  const traceabilityIntegration = createKernelTraceabilityIntegration(
    runtimeContext,
    runtimeExecution,
    workflowExecution,
    decisionReportingIntegration,
    traceabilityGraph,
  );
  const executionTraceability = createKernelExecutionTraceability();
  const executionFlowControl = createKernelExecutionFlowControl([
    createKernelPrimitiveControlState(),
    missionOrderCycle,
    runtimeContext,
    runtimeExecution,
    workflowExecution,
    decisionReportingIntegration,
    traceabilityIntegration,
  ]);

  return Object.freeze({
    missionComposition: createKernelMissionComposition(
      readinessGate,
      missionOrderIntake,
      missionOrderCycle,
    ),
    workflowComposition: createKernelWorkflowComposition(
      workflowState,
      workflowExecution,
    ),
    runtimeComposition: createKernelRuntimeComposition(
      runtimeContext,
      runtimeExecution,
    ),
    decisionReportingComposition: createKernelDecisionReportingComposition(
      decisionFlow,
      reportingFlow,
      decisionReportingIntegration,
    ),
    traceabilityComposition: createKernelTraceabilityComposition(
      traceabilityGraph,
      executionTraceability,
      traceabilityIntegration,
    ),
    executionFlowControl,
  });
}

function loadKernelInternals(
  moduleFile: string,
  names: readonly string[],
): Record<string, any> {
  const modulePath = join(dirname(fileURLToPath(import.meta.url)), moduleFile);
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
  runInNewContext(code, sandbox, { filename: moduleFile });

  return sandbox.__kernelInternals;
}

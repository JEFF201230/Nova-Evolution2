import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-decision-reporting-integration.ts";

test("Kernel Decision Reporting Integration exposes no public API", async () => {
  const module = await import("./kernel-decision-reporting-integration.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Decision Reporting Integration links decision and report deterministically", () => {
  const { createKernelDecisionReportingIntegration } = loadKernelInternals([
    "createKernelDecisionReportingIntegration",
  ]);
  const aggregation = Object.freeze({ stateId: "MISSION_ORDER_INTAKE_ACCEPTED" });

  const integration = createKernelDecisionReportingIntegration(
    createDecisionFlowResult(aggregation),
    createReportingFlowReport(aggregation),
  );

  assert.equal(integration.integrationId, "KERNEL_DECISION_REPORTING_INTEGRATION");
  assert.equal(integration.decision, "DECISION_FLOW_ACCEPTED");
  assert.equal(integration.reportDecision, "REPORTING_FLOW_READY");
  assert.equal(integration.readyForTraceabilityIntegration, true);
  assert.equal(integration.evidence.valid, true);
  assert.equal(Object.isFrozen(integration), true);
  assert.equal(Object.isFrozen(integration.evidence), true);
});

test("Kernel Decision Reporting Integration rejects unknown reports", () => {
  const { createKernelDecisionReportingIntegration } = loadKernelInternals([
    "createKernelDecisionReportingIntegration",
  ]);
  const aggregation = Object.freeze({ stateId: "MISSION_ORDER_INTAKE_ACCEPTED" });

  assert.throws(
    () => createKernelDecisionReportingIntegration(
      createDecisionFlowResult(aggregation),
      {
        ...createReportingFlowReport(aggregation),
        decision: "UNKNOWN",
      },
    ),
    /KDRI-003/,
  );
});

test("Kernel Decision Reporting Integration rejects unlinked aggregation", () => {
  const { createKernelDecisionReportingIntegration } = loadKernelInternals([
    "createKernelDecisionReportingIntegration",
  ]);

  assert.throws(
    () => createKernelDecisionReportingIntegration(
      createDecisionFlowResult(Object.freeze({ id: "A" })),
      createReportingFlowReport(Object.freeze({ id: "B" })),
    ),
    /KDRI-004/,
  );
});

function createDecisionFlowResult(aggregation: unknown): Record<string, unknown> {
  return Object.freeze({
    decision: "DECISION_FLOW_ACCEPTED",
    aggregation,
    evidence: Object.freeze({ valid: true }),
    readyForReportingFlow: true,
  });
}

function createReportingFlowReport(aggregation: unknown): Record<string, unknown> {
  return Object.freeze({
    reportId: "KERNEL_REPORTING_FLOW_INTERNAL_REPORT",
    decision: "REPORTING_FLOW_READY",
    sourceDecision: "DECISION_FLOW_ACCEPTED",
    aggregation,
    evidence: Object.freeze({ valid: true }),
    readyForTraceability: true,
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

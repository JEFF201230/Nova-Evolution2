import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-reporting-flow.ts";

test("Kernel Reporting Flow exposes no public API", async () => {
  const module = await import("./kernel-reporting-flow.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Reporting Flow creates a coherent immutable internal report", () => {
  const { createKernelReportingFlowReport } = loadKernelInternals([
    "createKernelReportingFlowReport",
  ]);

  const report = createKernelReportingFlowReport(createDecisionFlowResult());

  assert.equal(report.reportId, "KERNEL_REPORTING_FLOW_INTERNAL_REPORT");
  assert.equal(report.decision, "REPORTING_FLOW_READY");
  assert.equal(report.sourceDecision, "DECISION_FLOW_ACCEPTED");
  assert.equal(report.readyForTraceability, true);
  assert.equal(report.evidence.valid, true);
  assert.equal(Object.isFrozen(report), true);
  assert.equal(Object.isFrozen(report.evidence), true);
});

test("Kernel Reporting Flow rejects unknown Decision Flow decisions", () => {
  const { createKernelReportingFlowReport } = loadKernelInternals([
    "createKernelReportingFlowReport",
  ]);

  assert.throws(
    () => createKernelReportingFlowReport({
      ...createDecisionFlowResult(),
      decision: "UNKNOWN",
    }),
    /KRF-002/,
  );
});

test("Kernel Reporting Flow rejects incomplete evidence deterministically", () => {
  const { createKernelReportingFlowReport } = loadKernelInternals([
    "createKernelReportingFlowReport",
  ]);

  assert.throws(
    () => createKernelReportingFlowReport({
      decision: "DECISION_FLOW_ACCEPTED",
      readyForReportingFlow: true,
      evidence: Object.freeze({ valid: true }),
    }),
    /KRF-003/,
  );
});

function createDecisionFlowResult(): Record<string, unknown> {
  return Object.freeze({
    decision: "DECISION_FLOW_ACCEPTED",
    aggregation: Object.freeze({
      stateId: "MISSION_ORDER_INTAKE_ACCEPTED",
      sourceDecision: "ACCEPTED",
    }),
    evidence: Object.freeze({ valid: true }),
    readyForReportingFlow: true,
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

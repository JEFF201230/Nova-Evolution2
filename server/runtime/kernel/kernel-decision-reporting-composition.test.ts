import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-decision-reporting-composition.ts";

test("Kernel Decision Reporting Composition exposes no public API", async () => {
  const module = await import("./kernel-decision-reporting-composition.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Decision Reporting Composition composes decision, report, and integration", () => {
  const { createKernelDecisionReportingComposition } = loadKernelInternals([
    "createKernelDecisionReportingComposition",
  ]);

  const composition = createKernelDecisionReportingComposition(
    createDecisionFlow(),
    createReportingFlow(),
    createDecisionReportingIntegration(),
  );

  assert.equal(composition.compositionId, "KERNEL_DECISION_REPORTING_COMPOSITION");
  assert.deepEqual(Array.from(composition.stepIds), [
    "DECISION_FLOW",
    "REPORTING_FLOW",
    "DECISION_REPORTING_INTEGRATION",
  ]);
  assert.equal(composition.evidence.valid, true);
  assert.equal(composition.readyForKernelComposition, true);
  assert.equal(Object.isFrozen(composition), true);
  assert.equal(Object.isFrozen(composition.evidence), true);
});

test("Kernel Decision Reporting Composition rejects unlinked report evidence", () => {
  const { createKernelDecisionReportingComposition } = loadKernelInternals([
    "createKernelDecisionReportingComposition",
  ]);

  assert.throws(
    () => createKernelDecisionReportingComposition(
      createDecisionFlow(),
      {
        ...createReportingFlow(),
        sourceDecision: "UNKNOWN_DECISION",
      },
      createDecisionReportingIntegration(),
    ),
    /KDRC-004/,
  );
});

function createDecisionFlow(): Record<string, unknown> {
  return Object.freeze({
    decision: "DECISION_FLOW_ACCEPTED",
    aggregation: Object.freeze({ stateId: "MISSION_ORDER_INTAKE_ACCEPTED" }),
    evidence: Object.freeze({ valid: true }),
    readyForReportingFlow: true,
  });
}

function createReportingFlow(): Record<string, unknown> {
  return Object.freeze({
    reportId: "KERNEL_REPORTING_FLOW_INTERNAL_REPORT",
    decision: "REPORTING_FLOW_READY",
    sourceDecision: "DECISION_FLOW_ACCEPTED",
    aggregation: Object.freeze({ stateId: "MISSION_ORDER_INTAKE_ACCEPTED" }),
    evidence: Object.freeze({ valid: true }),
    readyForTraceability: true,
  });
}

function createDecisionReportingIntegration(): Record<string, unknown> {
  return Object.freeze({
    integrationId: "KERNEL_DECISION_REPORTING_INTEGRATION",
    decision: "DECISION_FLOW_ACCEPTED",
    reportDecision: "REPORTING_FLOW_READY",
    evidence: Object.freeze({ valid: true }),
    readyForTraceabilityIntegration: true,
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

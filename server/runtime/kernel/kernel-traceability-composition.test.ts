import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-traceability-composition.ts";

test("Kernel Traceability Composition exposes no public API", async () => {
  const module = await import("./kernel-traceability-composition.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Traceability Composition composes traceability layers", () => {
  const { createKernelTraceabilityComposition } = loadKernelInternals([
    "createKernelTraceabilityComposition",
  ]);

  const composition = createKernelTraceabilityComposition(
    createTraceabilityGraph(),
    createExecutionTraceability(),
    createTraceabilityIntegration(),
  );

  assert.equal(composition.compositionId, "KERNEL_TRACEABILITY_COMPOSITION");
  assert.deepEqual(Array.from(composition.stepIds), [
    "TRACEABILITY",
    "EXECUTION_TRACEABILITY",
    "TRACEABILITY_INTEGRATION",
  ]);
  assert.equal(composition.evidence.valid, true);
  assert.equal(composition.readyForKernelComposition, true);
  assert.equal(Object.isFrozen(composition), true);
  assert.equal(Object.isFrozen(composition.evidence), true);
});

test("Kernel Traceability Composition rejects unready execution traceability", () => {
  const { createKernelTraceabilityComposition } = loadKernelInternals([
    "createKernelTraceabilityComposition",
  ]);

  assert.throws(
    () => createKernelTraceabilityComposition(
      createTraceabilityGraph(),
      {
        ...createExecutionTraceability(),
        readyForRuntimeEvidence: false,
      },
      createTraceabilityIntegration(),
    ),
    /KTC-003/,
  );
});

function createTraceabilityGraph(): Record<string, unknown> {
  return Object.freeze({
    nodes: Object.freeze(["MISSION_ORDER_INTAKE"]),
    links: Object.freeze([]),
    evidence: Object.freeze({ valid: true }),
  });
}

function createExecutionTraceability(): Record<string, unknown> {
  return Object.freeze({
    traceabilityId: "KERNEL_EXECUTION_TRACEABILITY",
    links: Object.freeze([]),
    evidence: Object.freeze({ valid: true }),
    readyForRuntimeEvidence: true,
  });
}

function createTraceabilityIntegration(): Record<string, unknown> {
  return Object.freeze({
    integrationId: "KERNEL_TRACEABILITY_INTEGRATION",
    evidence: Object.freeze({ valid: true }),
    readyForRuntimeEvidence: true,
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

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-execution-traceability.ts";

test("Kernel Execution Traceability exposes no public API", async () => {
  const module = await import("./kernel-execution-traceability.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Execution Traceability creates deterministic end-to-end links", () => {
  const { createKernelExecutionTraceability } = loadKernelInternals([
    "createKernelExecutionTraceability",
  ]);

  const graph = createKernelExecutionTraceability();

  assert.equal(graph.traceabilityId, "KERNEL_EXECUTION_TRACEABILITY");
  assert.equal(graph.links.length, 6);
  assert.equal(graph.evidence.valid, true);
  assert.equal(graph.readyForRuntimeEvidence, true);
  assert.deepEqual(
    Array.from(graph.links, (link: { linkId: string }) => link.linkId),
    [
      "PRIMITIVES_TO_MISSION_ORDER_CYCLE",
      "MISSION_ORDER_CYCLE_TO_RUNTIME_CONTEXT",
      "RUNTIME_CONTEXT_TO_RUNTIME_EXECUTION",
      "RUNTIME_EXECUTION_TO_WORKFLOW_EXECUTION",
      "WORKFLOW_EXECUTION_TO_DECISION_REPORTING",
      "DECISION_REPORTING_TO_TRACEABILITY_INTEGRATION",
    ],
  );
  assert.equal(Object.isFrozen(graph), true);
  assert.equal(Object.isFrozen(graph.evidence), true);
});

test("Kernel Execution Traceability rejects unknown links", () => {
  const { createKernelExecutionTraceability } = loadKernelInternals([
    "createKernelExecutionTraceability",
  ]);

  assert.throws(
    () => createKernelExecutionTraceability([
      ...createCompleteLinks(),
      {
        linkId: "UNKNOWN",
        from: "A",
        to: "B",
      },
    ]),
    /KET-002/,
  );
});

test("Kernel Execution Traceability rejects incoherent link endpoints", () => {
  const { createKernelExecutionTraceability } = loadKernelInternals([
    "createKernelExecutionTraceability",
  ]);
  const links = createCompleteLinks();

  links[1] = {
    linkId: "MISSION_ORDER_CYCLE_TO_RUNTIME_CONTEXT",
    from: "KERNEL_MISSION_ORDER_CYCLE",
    to: "KERNEL_RUNTIME_EXECUTION",
  };

  assert.throws(() => createKernelExecutionTraceability(links), /KET-004/);
});

function createCompleteLinks(): Array<Record<string, string>> {
  return [
    {
      linkId: "PRIMITIVES_TO_MISSION_ORDER_CYCLE",
      from: "KERNEL_PRIMITIVE_CONTROL",
      to: "KERNEL_MISSION_ORDER_CYCLE",
    },
    {
      linkId: "MISSION_ORDER_CYCLE_TO_RUNTIME_CONTEXT",
      from: "KERNEL_MISSION_ORDER_CYCLE",
      to: "KERNEL_RUNTIME_CONTEXT",
    },
    {
      linkId: "RUNTIME_CONTEXT_TO_RUNTIME_EXECUTION",
      from: "KERNEL_RUNTIME_CONTEXT",
      to: "KERNEL_RUNTIME_EXECUTION",
    },
    {
      linkId: "RUNTIME_EXECUTION_TO_WORKFLOW_EXECUTION",
      from: "KERNEL_RUNTIME_EXECUTION",
      to: "WORKFLOW_EXECUTION_PREPARED",
    },
    {
      linkId: "WORKFLOW_EXECUTION_TO_DECISION_REPORTING",
      from: "WORKFLOW_EXECUTION_PREPARED",
      to: "KERNEL_DECISION_REPORTING_INTEGRATION",
    },
    {
      linkId: "DECISION_REPORTING_TO_TRACEABILITY_INTEGRATION",
      from: "KERNEL_DECISION_REPORTING_INTEGRATION",
      to: "KERNEL_TRACEABILITY_INTEGRATION",
    },
  ];
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

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-traceability.ts";

test("Kernel Traceability exposes no public API", async () => {
  const module = await import("./kernel-traceability.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Traceability creates immutable deterministic links", () => {
  const { createKernelTraceabilityGraph } = loadKernelInternals([
    "createKernelTraceabilityGraph",
  ]);

  const graph = createKernelTraceabilityGraph();

  assert.deepEqual(Array.from(graph.nodes), [
    "MISSION_ORDER_INTAKE",
    "WORKFLOW_STATE_HANDLING",
    "DECISION_FLOW",
    "REPORTING_FLOW",
  ]);
  assert.deepEqual(
    Array.from(graph.links, (link: { linkId: string }) => link.linkId),
    [
      "MISSION_ORDER_INTAKE_TO_WORKFLOW_STATE_HANDLING",
      "WORKFLOW_STATE_HANDLING_TO_DECISION_FLOW",
      "DECISION_FLOW_TO_REPORTING_FLOW",
    ],
  );
  assert.equal(graph.evidence.valid, true);
  assert.equal(Object.isFrozen(graph), true);
  assert.equal(Object.isFrozen(graph.links), true);
  assert.equal(Object.isFrozen(graph.evidence), true);
});

test("Kernel Traceability rejects unknown links deterministically", () => {
  const { createKernelTraceabilityGraph } = loadKernelInternals([
    "createKernelTraceabilityGraph",
  ]);

  assert.throws(
    () => createKernelTraceabilityGraph([
      ...createCompleteLinks(),
      {
        linkId: "UNKNOWN",
        from: "MISSION_ORDER_INTAKE",
        to: "REPORTING_FLOW",
      },
    ]),
    /KTR-003/,
  );
});

test("Kernel Traceability rejects incomplete links deterministically", () => {
  const { createKernelTraceabilityGraph } = loadKernelInternals([
    "createKernelTraceabilityGraph",
  ]);
  const links = createCompleteLinks();

  links[1] = {
    linkId: "WORKFLOW_STATE_HANDLING_TO_DECISION_FLOW",
    from: "WORKFLOW_STATE_HANDLING",
    to: "REPORTING_FLOW",
  };

  assert.throws(() => createKernelTraceabilityGraph(links), /KTR-004/);
});

test("Kernel Traceability rejects duplicate links deterministically", () => {
  const { createKernelTraceabilityGraph } = loadKernelInternals([
    "createKernelTraceabilityGraph",
  ]);

  assert.throws(
    () => createKernelTraceabilityGraph([
      ...createCompleteLinks(),
      createCompleteLinks()[0],
    ]),
    /KTR-004/,
  );
});

function createCompleteLinks(): Array<Record<string, string>> {
  return [
    {
      linkId: "MISSION_ORDER_INTAKE_TO_WORKFLOW_STATE_HANDLING",
      from: "MISSION_ORDER_INTAKE",
      to: "WORKFLOW_STATE_HANDLING",
    },
    {
      linkId: "WORKFLOW_STATE_HANDLING_TO_DECISION_FLOW",
      from: "WORKFLOW_STATE_HANDLING",
      to: "DECISION_FLOW",
    },
    {
      linkId: "DECISION_FLOW_TO_REPORTING_FLOW",
      from: "DECISION_FLOW",
      to: "REPORTING_FLOW",
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

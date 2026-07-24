import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-primitive-control.ts";

test("Kernel Primitive Control exposes no public API", async () => {
  const module = await import("./kernel-primitive-control.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Primitive Control accepts the closed eleven primitive set", () => {
  const { createKernelPrimitiveControlState } = loadKernelInternals([
    "createKernelPrimitiveControlState",
  ]);

  const state = createKernelPrimitiveControlState();

  assert.equal(state.primitiveControlId, "KERNEL_PRIMITIVE_CONTROL");
  assert.equal(state.primitiveIds.length, 11);
  assert.equal(state.evidence.closed, true);
  assert.equal(state.evidence.valid, true);
  assert.equal(state.readyForKernelExecutionFoundation, true);
  assert.equal(Object.isFrozen(state), true);
  assert.equal(Object.isFrozen(state.evidence), true);
});

test("Kernel Primitive Control rejects unknown primitives", () => {
  const { createKernelPrimitiveControlState } = loadKernelInternals([
    "createKernelPrimitiveControlState",
  ]);

  assert.throws(
    () => createKernelPrimitiveControlState([
      "runtime",
      "scheduler",
      "configuration",
      "dependency-injection",
      "messaging",
      "persistence",
      "storage",
      "logging",
      "resource-management",
      "clock",
      "lifecycle",
      "bootstrap",
    ]),
    /KPC-002/,
  );
});

test("Kernel Primitive Control rejects duplicate primitives", () => {
  const { createKernelPrimitiveControlState } = loadKernelInternals([
    "createKernelPrimitiveControlState",
  ]);

  assert.throws(
    () => createKernelPrimitiveControlState([
      "runtime",
      "runtime",
      "scheduler",
      "configuration",
      "dependency-injection",
      "messaging",
      "persistence",
      "storage",
      "logging",
      "resource-management",
      "clock",
      "lifecycle",
    ]),
    /KPC-003/,
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

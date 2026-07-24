import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

const MODULE_FILE = "kernel-runtime-composition.ts";

test("Kernel Runtime Composition exposes no public API", async () => {
  const module = await import("./kernel-runtime-composition.js");

  assert.deepEqual(Object.keys(module), []);
});

test("Kernel Runtime Composition composes runtime context and execution", () => {
  const { createKernelRuntimeComposition } = loadKernelInternals([
    "createKernelRuntimeComposition",
  ]);

  const composition = createKernelRuntimeComposition(
    createRuntimeContext(),
    createRuntimeExecution(),
  );

  assert.equal(composition.compositionId, "KERNEL_RUNTIME_COMPOSITION");
  assert.deepEqual(Array.from(composition.stepIds), [
    "RUNTIME_CONTEXT",
    "RUNTIME_EXECUTION",
  ]);
  assert.equal(composition.evidence.valid, true);
  assert.equal(composition.readyForKernelComposition, true);
  assert.equal(Object.isFrozen(composition), true);
  assert.equal(Object.isFrozen(composition.evidence), true);
});

test("Kernel Runtime Composition rejects unlinked runtime execution", () => {
  const { createKernelRuntimeComposition } = loadKernelInternals([
    "createKernelRuntimeComposition",
  ]);

  assert.throws(
    () => createKernelRuntimeComposition(
      createRuntimeContext(),
      {
        ...createRuntimeExecution(),
        contextId: "UNKNOWN_RUNTIME_CONTEXT",
      },
    ),
    /KRCOMP-004/,
  );
});

function createRuntimeContext(): Record<string, unknown> {
  return Object.freeze({
    contextId: "KERNEL_RUNTIME_CONTEXT",
    evidence: Object.freeze({ valid: true }),
    readyForRuntimeExecution: true,
  });
}

function createRuntimeExecution(): Record<string, unknown> {
  return Object.freeze({
    executionId: "KERNEL_RUNTIME_EXECUTION",
    contextId: "KERNEL_RUNTIME_CONTEXT",
    evidence: Object.freeze({ valid: true }),
    readyForWorkflowExecution: true,
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

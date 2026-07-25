import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertNovaBootstrap } from "./nova-core.bootstrap.js";
import { validateCodexVersion } from "./nova-core.execution.js";

test("bootstrap refuse une version Node incompatible", () => {
  assert.throws(
    () => assertNovaBootstrap({ repositoryRoot: ".", dataFile: "runtime.json", runtimeDirectory: ".", nodeVersion: "20.1.0" }),
    /NODE_UNSUPPORTED/,
  );
});

test("bootstrap accepte Node 22+ et des chemins existants", () => {
  assert.doesNotThrow(() => assertNovaBootstrap({
    repositoryRoot: ".",
    dataFile: "runtime.json",
    runtimeDirectory: ".",
    nodeVersion: "22.0.0",
    commandProbe: () => true,
  }));
});

test("bootstrap bloque explicitement Git ou Codex absent", async () => {
  assert.throws(
    () => assertNovaBootstrap({
      repositoryRoot: ".",
      dataFile: "runtime.json",
      runtimeDirectory: ".",
      nodeVersion: "22.0.0",
      commandProbe: (command) => command !== "git",
    }),
    /GIT_MISSING/,
  );
  assert.throws(
    () => assertNovaBootstrap({
      repositoryRoot: ".",
      dataFile: "runtime.json",
      runtimeDirectory: ".",
      nodeVersion: "22.0.0",
      commandProbe: (command) => command === "git",
    }),
    /CODEX_MISSING/,
  );
  assert.throws(
    () => validateCodexVersion("codex-cli 0.143.9"),
    (error) => error instanceof Error && "code" in error && error.code === "NOVA_CORE_CODEX_VERSION_NOT_SUPPORTED",
  );
  assert.equal(validateCodexVersion("codex-cli 0.144.1"), "0.144.1");
  const launcher = await readFile(new URL("../../DEMARRER_NOVA.bat", import.meta.url), "utf8");
  const readme = await readFile(new URL("./README.md", import.meta.url), "utf8");
  assert.doesNotMatch(launcher, /\bnpm\s+install\b/i);
  assert.match(launcher, /\bnpm\s+ci\b/i);
  assert.match(launcher, /where git[\s\S]*exit \/b 1/i);
  assert.match(launcher, /where codex[\s\S]*exit \/b 1/i);
  assert.doesNotMatch(readme, /\bnpm\s+install\b/i);
  assert.match(readme, /\bnpm\s+ci\b/i);
});

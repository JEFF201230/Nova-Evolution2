import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import test from "node:test";

const BFF_ROOT = new URL(".", import.meta.url);

test("BFF production modules do not import React, NOVA Core, Runtime or certified domains", async () => {
  const files = await productionTypeScriptFiles(BFF_ROOT);
  const forbiddenImport = /from\s+["'][^"']*(?:apps\/nova-web|nova-core|server\/runtime|human-approval|evidence|certification|program-production-entrypoint)[^"']*["']/i;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      forbiddenImport,
      `Forbidden dependency in ${relative(BFF_ROOT.pathname, file.pathname)}`,
    );
  }
});

test("BFF routing declares the authorized technical, Runtime and HOME read paths", async () => {
  const source = await readFile(
    new URL("nova-bff.app.ts", BFF_ROOT),
    "utf8",
  );
  const declaredPaths = [...source.matchAll(/^\s+"(\/[a-z0-9/-]+)",?$/gm)]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value));
  const runtimeContract = await readFile(
    new URL("runtime-execute.contract.ts", BFF_ROOT),
    "utf8",
  );
  const runtimePath = runtimeContract.match(
    /RUNTIME_EXECUTE_PATH\s*=\s*"([^"]+)"/,
  )?.[1];
  const homeContract = await readFile(
    new URL("../../contracts/home-active-work.contract.ts", BFF_ROOT),
    "utf8",
  );
  const homePath = homeContract.match(
    /HOME_ACTIVE_WORK_PATH\s*=\s*"([^"]+)"/,
  )?.[1];
  assert.ok(runtimePath);
  assert.ok(homePath);
  declaredPaths.push(runtimePath);
  declaredPaths.push(homePath);
  assert.deepEqual(declaredPaths, [
    "/health",
    "/readiness",
    "/version",
    "/session",
    "/session/login",
    "/session/logout",
    "/api/runtime/execute",
    "/api/home/active-work",
  ]);
  assert.doesNotMatch(
    source,
    /fetch\s*\(|request\s*\(\s*context\.config\.runtimeOrigin/,
  );
});

test("only dedicated Gateways access Runtime entrypoints or transport", async () => {
  const files = await productionTypeScriptFiles(BFF_ROOT);
  const invocations: string[] = [];
  const transports: string[] = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const name = relative(BFF_ROOT.pathname, file.pathname);
    if (name.startsWith("runtime-")) {
      assert.doesNotMatch(
        source,
        /\bfetch\s*\(|node:(?:http|https)|from\s+["'][^"']*server\/runtime/i,
        `Network or direct Runtime access in ${name}`,
      );
    }
    if (/\.entrypoint\.execute\s*\(/.test(source)) {
      invocations.push(name);
    }
    if (/\bfetch\s*\(|\.fetcher\s*\(/.test(source)) {
      transports.push(name);
    }
  }

  assert.deepEqual(invocations, ["runtime-gateway.adapter.ts"]);
  assert.deepEqual(transports, ["home-active-work.gateway.ts"]);
  const adapter = await readFile(
    new URL("runtime-gateway.adapter.ts", BFF_ROOT),
    "utf8",
  );
  assert.match(adapter, /ProgramProductionEntrypointPort/);
  assert.match(adapter, /this\.entrypoint\.execute\s*\(/);
});

async function productionTypeScriptFiles(
  directory: URL,
): Promise<URL[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: URL[] = [];
  for (const entry of entries) {
    const target = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) {
      files.push(...await productionTypeScriptFiles(target));
    } else if (
      extname(entry.name) === ".ts"
      && !entry.name.endsWith(".test.ts")
      && entry.name !== "bff.test-support.ts"
    ) {
      files.push(target);
    }
  }
  return files.sort((left, right) => join(left.pathname).localeCompare(join(right.pathname)));
}

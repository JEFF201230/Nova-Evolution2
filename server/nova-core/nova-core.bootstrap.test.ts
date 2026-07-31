import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  assertNovaBootstrap,
  type NovaBootstrapCommandProbeResult,
} from "./nova-core.bootstrap.js";
import { validateCodexVersion } from "./nova-core.execution.js";

test("bootstrap refuse une version Node incompatible", () => {
  assert.throws(
    () => assertNovaBootstrap({ repositoryRoot: ".", dataFile: "runtime.json", runtimeDirectory: ".", nodeVersion: "20.1.0" }),
    /NODE_UNSUPPORTED/,
  );
});

test("bootstrap accepte Node 22+ et des chemins existants", async () => {
  await withIsolatedAttestationEnvironment(async (directory) => {
    assert.doesNotThrow(() => assertNovaBootstrap({
      repositoryRoot: directory,
      dataFile: join(directory, "runtime.json"),
      runtimeDirectory: directory,
      environmentFile: join(directory, ".env.local"),
      nodeVersion: "22.0.0",
      commandProbe: () => true,
    }));
  });
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

test("bootstrap expose tous les diagnostics de la sonde Codex", () => {
  const failedProbe: NovaBootstrapCommandProbeResult = {
    command: 'C:\\Windows\\System32\\cmd.exe /d /s /c "codex.cmd --version"',
    status: null,
    stdout: "",
    stderr: "échec de test",
    error: {
      name: "Error",
      message: "spawnSync codex.cmd EINVAL",
      code: "EINVAL",
      errno: -4071,
      syscall: "spawnSync codex.cmd",
      path: "codex.cmd",
    },
    environmentPath: "C:\\outils;C:\\npm",
  };

  assert.throws(
    () => assertNovaBootstrap({
      repositoryRoot: ".",
      dataFile: "runtime.json",
      runtimeDirectory: ".",
      nodeVersion: "24.16.0",
      commandProbe: (command) => command === "git" ? true : failedProbe,
    }),
    (error) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /NOVA_BOOTSTRAP_CODEX_MISSING/);
      assert.match(error.message, /Commande exécutée: .*codex\.cmd --version/);
      assert.match(error.message, /Code retour: null/);
      assert.match(error.message, /stdout: <vide>/);
      assert.match(error.message, /stderr: échec de test/);
      assert.match(error.message, /Erreur système: .*"code":"EINVAL"/);
      assert.match(error.message, /PATH utilisé: C:\\outils;C:\\npm/);
      return true;
    },
  );
});

test("bootstrap génère la clé au premier démarrage puis réutilise .env.local", async () => {
  await withIsolatedAttestationEnvironment(async (directory) => {
    const environmentFile = join(directory, ".env.local");
    const options = {
      repositoryRoot: directory,
      dataFile: join(directory, "runtime.json"),
      runtimeDirectory: directory,
      environmentFile,
      nodeVersion: "22.0.0",
      commandProbe: () => true,
    };

    assertNovaBootstrap(options);
    const generatedKey = process.env.NOVA_JOURNAL_ATTESTATION_KEY;
    assert.match(generatedKey ?? "", /^[0-9a-f]{64}$/);
    const firstContent = await readFile(environmentFile, "utf8");
    assert.equal(firstContent, `NOVA_JOURNAL_ATTESTATION_KEY=${generatedKey}\n`);

    delete process.env.NOVA_JOURNAL_ATTESTATION_KEY;
    assertNovaBootstrap(options);
    assert.equal(process.env.NOVA_JOURNAL_ATTESTATION_KEY, generatedKey);
    assert.equal(await readFile(environmentFile, "utf8"), firstContent);
  });
});

test("bootstrap réutilise la clé déjà injectée sans créer .env.local", async () => {
  await withIsolatedAttestationEnvironment(async (directory) => {
    const environmentFile = join(directory, ".env.local");
    const existingKey = "existing-journal-attestation-key-001";
    process.env.NOVA_JOURNAL_ATTESTATION_KEY = existingKey;

    assertNovaBootstrap({
      repositoryRoot: directory,
      dataFile: join(directory, "runtime.json"),
      runtimeDirectory: directory,
      environmentFile,
      nodeVersion: "22.0.0",
      commandProbe: () => true,
    });

    assert.equal(process.env.NOVA_JOURNAL_ATTESTATION_KEY, existingKey);
    await assert.rejects(() => readFile(environmentFile, "utf8"), { code: "ENOENT" });
  });
});

test("bootstrap reste fail-closed lorsqu'un journal existe sans clé", async () => {
  await withIsolatedAttestationEnvironment(async (directory) => {
    const dataFile = join(directory, "runtime.json");
    const environmentFile = join(directory, ".env.local");
    await writeFile(dataFile, "{}\n", "utf8");

    assert.throws(
      () => assertNovaBootstrap({
        repositoryRoot: directory,
        dataFile,
        runtimeDirectory: directory,
        environmentFile,
        nodeVersion: "22.0.0",
        commandProbe: () => true,
      }),
      /NOVA_RUNTIME_ATTESTATION_KEY_REQUIRED/,
    );
    assert.equal(process.env.NOVA_JOURNAL_ATTESTATION_KEY, undefined);
    await assert.rejects(() => readFile(environmentFile, "utf8"), { code: "ENOENT" });
  });
});

async function withIsolatedAttestationEnvironment(
  operation: (directory: string) => Promise<void>,
): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "nova-bootstrap-"));
  const previousKey = process.env.NOVA_JOURNAL_ATTESTATION_KEY;
  delete process.env.NOVA_JOURNAL_ATTESTATION_KEY;
  try {
    await operation(directory);
  } finally {
    if (previousKey === undefined) delete process.env.NOVA_JOURNAL_ATTESTATION_KEY;
    else process.env.NOVA_JOURNAL_ATTESTATION_KEY = previousKey;
    await rm(directory, { recursive: true, force: true });
  }
}

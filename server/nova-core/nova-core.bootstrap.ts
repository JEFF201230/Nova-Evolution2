import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

export interface NovaBootstrapOptions {
  repositoryRoot: string;
  dataFile: string;
  runtimeDirectory: string;
  nodeVersion?: string;
  commandProbe?: (command: string) => boolean;
}

export function assertNovaBootstrap(options: NovaBootstrapOptions): void {
  const version = options.nodeVersion ?? process.versions.node;
  const major = Number.parseInt(version.split(".")[0] ?? "0", 10);
  if (!Number.isFinite(major) || major < 22) {
    throw new Error(`NOVA_BOOTSTRAP_NODE_UNSUPPORTED: Node.js >=22 requis (version détectée: ${version}).`);
  }
  if (!existsSync(options.repositoryRoot)) {
    throw new Error(`NOVA_BOOTSTRAP_REPOSITORY_MISSING: dépôt introuvable: ${options.repositoryRoot}`);
  }
  if (!existsSync(options.runtimeDirectory)) {
    throw new Error(`NOVA_BOOTSTRAP_RUNTIME_MISSING: runtime NOVA introuvable: ${options.runtimeDirectory}`);
  }
  if (!options.dataFile || join(options.dataFile).trim().length === 0) {
    throw new Error("NOVA_BOOTSTRAP_DATA_FILE_INVALID: fichier runtime.json absent.");
  }
  const probe = options.commandProbe ?? defaultCommandProbe;
  if (!probe("git")) {
    throw new Error("NOVA_BOOTSTRAP_GIT_MISSING: Git est obligatoire.");
  }
  const codexCommand = process.platform === "win32" ? "codex.cmd" : "codex";
  if (!probe(codexCommand)) {
    throw new Error("NOVA_BOOTSTRAP_CODEX_MISSING: Codex CLI est obligatoire.");
  }
}

function defaultCommandProbe(command: string): boolean {
  const result = spawnSync(command, ["--version"], { windowsHide: true, stdio: "ignore" });
  return !result.error && result.status === 0;
}

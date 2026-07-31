import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const JOURNAL_ATTESTATION_ENV = "NOVA_JOURNAL_ATTESTATION_KEY";

interface NovaBootstrapSystemError {
  name: string;
  message: string;
  code?: string;
  errno?: number;
  syscall?: string;
  path?: string;
}

export interface NovaBootstrapCommandProbeResult {
  command: string;
  status: number | null;
  stdout: string;
  stderr: string;
  error?: NovaBootstrapSystemError;
  environmentPath: string;
}

export interface NovaBootstrapOptions {
  repositoryRoot: string;
  dataFile: string;
  runtimeDirectory: string;
  environmentFile?: string;
  nodeVersion?: string;
  commandProbe?: (command: string) => boolean | NovaBootstrapCommandProbeResult;
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
  const gitProbe = probe("git");
  if (!commandProbeSucceeded(gitProbe)) {
    throw new Error(formatCommandProbeFailure(
      "NOVA_BOOTSTRAP_GIT_MISSING: Git est obligatoire.",
      "git",
      gitProbe,
    ));
  }
  const codexCommand = process.platform === "win32" ? "codex.cmd" : "codex";
  const codexProbe = probe(codexCommand);
  if (!commandProbeSucceeded(codexProbe)) {
    throw new Error(formatCommandProbeFailure(
      "NOVA_BOOTSTRAP_CODEX_MISSING: Codex CLI est obligatoire.",
      codexCommand,
      codexProbe,
    ));
  }
  bootstrapJournalAttestationKey(options);
}

function bootstrapJournalAttestationKey(options: NovaBootstrapOptions): void {
  if (process.env[JOURNAL_ATTESTATION_ENV]) return;

  const environmentFile = resolve(
    options.environmentFile
      ?? join(process.env.NOVA_RUNTIME_ROOT ?? ".", ".env.local"),
  );
  const environmentContent = readOptionalFile(environmentFile);
  const persistedKey = extractJournalAttestationKey(environmentContent ?? "");
  if (persistedKey) {
    process.env[JOURNAL_ATTESTATION_ENV] = persistedKey;
    return;
  }

  if (existsSync(options.dataFile) || existsSync(`${options.dataFile}.journal-anchor.json`)) {
    throw new Error("NOVA_RUNTIME_ATTESTATION_KEY_REQUIRED");
  }

  const generatedKey = randomBytes(32).toString("hex");
  const persistedGeneratedKey = persistGeneratedAttestationKey(
    environmentFile,
    environmentContent,
    generatedKey,
  );
  process.env[JOURNAL_ATTESTATION_ENV] = persistedGeneratedKey;
}

function readOptionalFile(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if (isSystemError(error, "ENOENT")) return null;
    throw error;
  }
}

function extractJournalAttestationKey(content: string): string | undefined {
  let resolved: string | undefined;
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(
      /^\uFEFF?\s*(?:export\s+)?NOVA_JOURNAL_ATTESTATION_KEY\s*=\s*(.*?)\s*$/,
    );
    if (!match) continue;
    const rawValue = match[1] ?? "";
    const quoted = rawValue.match(/^(["'])(.*)\1$/);
    resolved = quoted ? quoted[2] : rawValue;
  }
  return resolved || undefined;
}

function persistGeneratedAttestationKey(
  environmentFile: string,
  existingContent: string | null,
  generatedKey: string,
): string {
  const assignment = `${JOURNAL_ATTESTATION_ENV}=${generatedKey}\n`;
  if (existingContent === null) {
    try {
      writeFileSync(environmentFile, assignment, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      return generatedKey;
    } catch (error) {
      if (!isSystemError(error, "EEXIST")) throw error;
      const concurrentContent = readFileSync(environmentFile, "utf8");
      const concurrentKey = extractJournalAttestationKey(concurrentContent);
      if (concurrentKey) return concurrentKey;
      existingContent = concurrentContent;
    }
  }

  const separator = existingContent.length > 0 && !/[\r\n]$/.test(existingContent)
    ? "\n"
    : "";
  appendFileSync(environmentFile, `${separator}${assignment}`, {
    encoding: "utf8",
    mode: 0o600,
  });
  return generatedKey;
}

function isSystemError(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}

function defaultCommandProbe(command: string): NovaBootstrapCommandProbeResult {
  const environmentPath = process.env.PATH ?? "";
  const isWindowsCommandScript = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command);
  // Node rejects direct .cmd/.bat spawning on Windows; use the command interpreter explicitly.
  const executable = isWindowsCommandScript
    ? process.env.ComSpec?.trim() || "cmd.exe"
    : command;
  const args = isWindowsCommandScript
    ? ["/d", "/s", "/c", `${command} --version`]
    : ["--version"];
  const displayedCommand = isWindowsCommandScript
    ? `${quoteCommand(executable)} /d /s /c "${command} --version"`
    : `${quoteCommand(command)} --version`;
  const result = spawnSync(executable, args, {
    encoding: "utf8",
    windowsHide: true,
  });
  return {
    command: displayedCommand,
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    ...(result.error ? { error: serializeSystemError(result.error) } : {}),
    environmentPath,
  };
}

function commandProbeSucceeded(result: boolean | NovaBootstrapCommandProbeResult): boolean {
  return typeof result === "boolean"
    ? result
    : !result.error && result.status === 0;
}

function formatCommandProbeFailure(
  message: string,
  command: string,
  result: boolean | NovaBootstrapCommandProbeResult,
): string {
  const diagnostics = typeof result === "boolean"
    ? {
        command: `${quoteCommand(command)} --version`,
        status: result ? "0" : "non disponible",
        stdout: "non capturé par la sonde injectée",
        stderr: "non capturé par la sonde injectée",
        systemError: "non capturée par la sonde injectée",
        environmentPath: process.env.PATH ?? "",
      }
    : {
        command: result.command,
        status: result.status === null ? "null" : String(result.status),
        stdout: formatCapturedOutput(result.stdout),
        stderr: formatCapturedOutput(result.stderr),
        systemError: result.error ? JSON.stringify(result.error) : "aucune",
        environmentPath: result.environmentPath,
      };
  return [
    message,
    `Commande exécutée: ${diagnostics.command}`,
    `Code retour: ${diagnostics.status}`,
    `stdout: ${diagnostics.stdout}`,
    `stderr: ${diagnostics.stderr}`,
    `Erreur système: ${diagnostics.systemError}`,
    `PATH utilisé: ${diagnostics.environmentPath || "<vide>"}`,
  ].join("\n");
}

function formatCapturedOutput(output: string): string {
  const normalized = output.trim();
  return normalized.length > 0 ? normalized : "<vide>";
}

function quoteCommand(command: string): string {
  return /\s/.test(command) ? `"${command}"` : command;
}

function serializeSystemError(error: Error): NovaBootstrapSystemError {
  const systemError = error as NodeJS.ErrnoException & { path?: string };
  return {
    name: error.name,
    message: error.message,
    ...(systemError.code ? { code: systemError.code } : {}),
    ...(typeof systemError.errno === "number" ? { errno: systemError.errno } : {}),
    ...(systemError.syscall ? { syscall: systemError.syscall } : {}),
    ...(systemError.path ? { path: systemError.path } : {}),
  };
}

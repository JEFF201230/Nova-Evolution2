import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type {
  MissionReport,
  RuntimeDiagnostic,
  RuntimeContext,
  RuntimeMission,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import { assertStableGitPreflight, GitPreflightError, inspectGitPreflight } from "./git-preflight.js";
import {
  createRunIdentity,
  fingerprintReport,
  reportBindingMismatches,
  runDirectory,
  sha256,
  type ReportBinding,
  type RunBinding,
} from "./run-binding.js";
import { isCanonicalPathWithin, normalizeScopeEntries } from "./scope-validation.js";
import { missingDynamicValidations } from "./validation-matrix.js";
import {
  compactProcessDetails,
  NovaCoreExecutionError,
  NovaCoreMissionFileProducer,
  unique,
  type NovaCoreMissionFileProducerContract,
} from "./nova-core.mission-file-producer.js";

export {
  buildPrompt,
  NovaCoreExecutionError,
  selectProfile,
} from "./nova-core.mission-file-producer.js";

export type NovaCoreExecutionProfile = "FAST" | "BUILD" | "ARCHITECTURE" | "READ_ONLY";
export type NovaCoreValidationTarget = "NOVA_CORE" | "VEEDDA";

export interface NovaCoreExecutionRequest {
  profile?: NovaCoreExecutionProfile;
  prompt?: string;
  expectedBranch?: string;
  changesExpected?: boolean;
  humanReviewRequired?: boolean;
  timeoutMs?: number;
}

export interface NovaCoreCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  command?: string;
  args?: string[];
  cwd?: string;
  terminationReason?: "CANCELLED" | "TIMEOUT";
  outputTruncated?: boolean;
}

export interface NovaCoreCommandRunnerOptions {
  signal?: AbortSignal;
  maxOutputBytes?: number;
  maxStdoutBytes?: number;
  maxStderrBytes?: number;
  onOutput?: (stream: "stdout" | "stderr", chunk: string) => void;
  onSpawn?: (processId: number) => void;
}

export interface NovaCoreCommandRunner {
  (
    command: string,
    args: readonly string[],
    workingDirectory: string,
    options?: NovaCoreCommandRunnerOptions,
  ): Promise<NovaCoreCommandResult>;
}

export interface NovaCoreExecutionEngineOptions {
  repositoryRoot: string;
  dataRoot: string;
  runtimeDirectory?: string;
  powershellCommand?: string;
  commandRunner?: NovaCoreCommandRunner;
  defaultTimeoutMs?: number;
  maxOutputBytes?: number;
  maxStdoutBytes?: number;
  maxStderrBytes?: number;
  outputObserver?: NovaCoreExecutionOutputObserver;
  codexInspector?: NovaCoreCodexInspector;
  readOnlyAllowedPaths?: readonly string[];
  protectedPaths?: readonly string[];
  validationTarget?: NovaCoreValidationTarget;
  contextAssemblyEnabled?: boolean;
  protectRepositoryFromRuntimeArtifacts?: boolean;
  recoveryInspector?: (runId: string) => Promise<NovaCoreRecoveryInspection>;
  missionFileProducer?: NovaCoreMissionFileProducerContract;
}

export interface NovaCoreCodexIdentity {
  version: string;
  path: string;
  binaryHash: string;
  configPolicy: "EXPLICIT_RUNTIME_PROFILE";
}

export type NovaCoreCodexInspector = (repositoryRoot: string) => Promise<NovaCoreCodexIdentity>;

export interface NovaCoreExecutionOutput {
  projectId: string;
  missionId: string;
  runId: string;
  correlationId: string;
  stream: "stdout" | "stderr";
  chunk: string;
}

export type NovaCoreExecutionOutputObserver = (output: NovaCoreExecutionOutput) => void;

export type NovaCoreRecoverySignal = boolean | "UNKNOWN";

export interface NovaCoreRecoveryInspection {
  processAlive: NovaCoreRecoverySignal;
  processTreeAlive: NovaCoreRecoverySignal;
  worktreeModified: NovaCoreRecoverySignal;
  reportPresent: NovaCoreRecoverySignal;
  artifactsValid: NovaCoreRecoverySignal;
}

interface NovaCoreOfficialReport {
  Status?: string;
  Codex?: {
    Status?: string;
    ExitCode?: number;
    Version?: string;
  };
  Git?: {
    Created?: string[];
    Modified?: string[];
    Deleted?: string[];
    Renamed?: Array<{ From?: string; To?: string }>;
    BranchChanged?: boolean;
    HeadChanged?: boolean;
  };
  Validations?: Array<{
    Type?: string;
    Name?: string;
    Passed?: boolean;
    Required?: boolean;
    Message?: string | null;
  }>;
  Errors?: unknown[];
  Binding?: ReportBinding;
  ReportFingerprint?: string;
  OutputEvidence?: {
    entries?: Array<{
      path?: string | null;
      sha256?: string | null;
      kind?: string;
      status?: string;
    }>;
  };
}

export class NovaCoreExecutionEngine {
  private readonly repositoryRoot: string;
  private readonly dataRoot: string;
  private readonly runtimeDirectory: string;
  private readonly powershellCommand: string;
  private readonly commandRunner: NovaCoreCommandRunner;
  private readonly defaultTimeoutMs: number;
  private readonly maxOutputBytes: number;
  private readonly maxStdoutBytes: number;
  private readonly maxStderrBytes: number;
  private readonly readOnlyAllowedPaths: readonly string[];
  private readonly protectedPaths: readonly string[];
  private readonly validationTarget: NovaCoreValidationTarget;
  private readonly contextAssemblyEnabled: boolean;
  private readonly recoveryInspector?: (runId: string) => Promise<NovaCoreRecoveryInspection>;
  private outputObserver?: NovaCoreExecutionOutputObserver;
  private readonly codexInspector: NovaCoreCodexInspector;
  private readonly missionFileProducer: NovaCoreMissionFileProducerContract;
  private readonly activeRuns = new Map<string, AbortController>();

  constructor(options: NovaCoreExecutionEngineOptions) {
    this.repositoryRoot = resolve(options.repositoryRoot);
    this.dataRoot = resolve(options.dataRoot);
    this.runtimeDirectory = resolve(
      options.runtimeDirectory ?? join(process.cwd(), "tools", "nova-core-runtime"),
    );
    if (
      options.protectRepositoryFromRuntimeArtifacts &&
      isCanonicalPathWithin(this.repositoryRoot, this.dataRoot)
    ) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_RUNTIME_ARTIFACT_ROOT_INSIDE_TARGET",
        `Les artefacts NOVA doivent rester hors du dépôt cible : ${this.dataRoot}.`,
      );
    }
    this.powershellCommand =
      options.powershellCommand ??
      process.env.NOVA_POWERSHELL ??
      (process.platform === "win32" ? "powershell.exe" : "pwsh");
    this.commandRunner = options.commandRunner ?? runCommand;
    this.defaultTimeoutMs = validateTimeout(options.defaultTimeoutMs ?? 30 * 60_000);
    this.maxOutputBytes = validateOutputLimit(options.maxOutputBytes ?? 1_000_000);
    this.maxStdoutBytes = validateOutputLimit(options.maxStdoutBytes ?? this.maxOutputBytes);
    this.maxStderrBytes = validateOutputLimit(options.maxStderrBytes ?? this.maxOutputBytes);
    this.readOnlyAllowedPaths = [...(options.readOnlyAllowedPaths ?? [])].map((allowed) => {
      const canonical = resolve(this.repositoryRoot, allowed);
      if (!isCanonicalPathWithin(this.repositoryRoot, canonical)) {
        throw new NovaCoreExecutionError(
          "NOVA_CORE_READ_ONLY_ALLOWED_PATH_INVALID",
          `Le chemin READ_ONLY autorise sort du depot : ${allowed}.`,
        );
      }
      return canonical;
    });
    this.protectedPaths = normalizeScopeEntries(options.protectedPaths ?? []);
    this.validationTarget = options.validationTarget ?? "NOVA_CORE";
    this.contextAssemblyEnabled = options.contextAssemblyEnabled ?? true;
    this.recoveryInspector = options.recoveryInspector;
    this.outputObserver = options.outputObserver;
    this.codexInspector = options.codexInspector ?? inspectCodexIdentity;
    this.missionFileProducer = options.missionFileProducer ?? new NovaCoreMissionFileProducer({
      repositoryRoot: this.repositoryRoot,
      dataRoot: this.dataRoot,
      commandRunner: this.commandRunner,
      readOnlyAllowedPaths: this.readOnlyAllowedPaths,
      protectedPaths: this.protectedPaths,
      validationTarget: this.validationTarget,
    });
  }

  setOutputObserver(observer: NovaCoreExecutionOutputObserver): void {
    this.outputObserver = observer;
  }

  cancel(runId: string): boolean {
    const controller = this.activeRuns.get(runId);
    if (!controller || controller.signal.aborted) return false;
    controller.abort("CANCELLED");
    return true;
  }

  inspectRepository(): Promise<import("./git-preflight.js").GitPreflight> {
    return inspectGitPreflight(this.repositoryRoot, this.commandRunner);
  }

  async inspectRecovery(runId: string): Promise<NovaCoreRecoveryInspection> {
    if (this.recoveryInspector) return this.recoveryInspector(runId);
    const currentRunDirectory = runDirectory(this.dataRoot, runId);
    let processAlive: NovaCoreRecoverySignal = "UNKNOWN";
    let processTreeAlive: NovaCoreRecoverySignal = "UNKNOWN";
    try {
      const metadata = JSON.parse(
        await readFile(join(currentRunDirectory, "process.json"), "utf8"),
      ) as { processId?: number };
      if (!Number.isInteger(metadata.processId) || Number(metadata.processId) <= 0) {
        throw new Error("INVALID_PROCESS_METADATA");
      }
      processAlive = inspectProcessAlive(Number(metadata.processId));
      processTreeAlive = await inspectDescendantProcesses(
        Number(metadata.processId),
        this.repositoryRoot,
        this.powershellCommand,
      );
    } catch (error) {
      if (!isMissingFileError(error)) {
        processAlive = "UNKNOWN";
        processTreeAlive = "UNKNOWN";
      }
    }

    let worktreeModified: NovaCoreRecoverySignal = "UNKNOWN";
    try {
      const git = await this.commandRunner(
        "git",
        ["status", "--porcelain=v1", "--untracked-files=all"],
        this.repositoryRoot,
      );
      worktreeModified = git.exitCode === 0 ? Boolean(git.stdout.trim()) : "UNKNOWN";
    } catch {
      worktreeModified = "UNKNOWN";
    }

    let reportPresent: NovaCoreRecoverySignal = false;
    try {
      reportPresent = Boolean(await findOfficialReport(currentRunDirectory));
    } catch {
      reportPresent = "UNKNOWN";
    }
    let artifactsValid: NovaCoreRecoverySignal;
    try {
      const [prompt, manifestText, executionRequestText, bindingText] = await Promise.all([
        readFile(join(currentRunDirectory, "prompt.md"), "utf8"),
        readFile(join(currentRunDirectory, "manifest.json"), "utf8"),
        readFile(join(currentRunDirectory, "execution-request.json"), "utf8"),
        readFile(join(currentRunDirectory, "run-binding.json"), "utf8"),
      ]);
      JSON.parse(manifestText);
      JSON.parse(executionRequestText);
      const persistedBinding = JSON.parse(bindingText) as Partial<RunBinding>;
      artifactsValid =
        persistedBinding.promptHash === sha256(prompt) &&
        persistedBinding.manifestHash === sha256(manifestText) &&
        persistedBinding.executionRequestHash === sha256(executionRequestText);
    } catch (error) {
      artifactsValid = isMissingFileError(error) ? false : "UNKNOWN";
    }
    return { processAlive, processTreeAlive, worktreeModified, reportPresent, artifactsValid };
  }

  async execute(
    context: RuntimeContext,
    mission: RuntimeMission,
    request: NovaCoreExecutionRequest = {},
  ): Promise<Omit<MissionReport, "submittedAt">> {
    const identity = createRunIdentity({ projectId: context.projectId, missionId: context.missionId, runId: mission.runId ?? undefined });
    mission.runId = identity.runId;
    const runId = identity.runId;
    const correlationId = `CORR-${mission.projectId}-${mission.missionId}`;
    const timeoutMs = validateTimeout(request.timeoutMs ?? this.defaultTimeoutMs);
    const initialGit = await this.gitPreflight(runId, correlationId);
    const codexIdentity = await this.codexInspector(this.repositoryRoot);
    const {
      currentRunDirectory,
      missionFile,
      profile,
      executionRequest,
      binding,
    } = await this.missionFileProducer.produce({
      context,
      mission,
      request,
      initialGit,
      codexIdentity,
      runId,
      correlationId,
    });

    const invocationArgs = [
      "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
      join(this.runtimeDirectory, "Invoke-NovaCoreMission.ps1"),
      "-MissionFile", missionFile,
    ];
    if (this.contextAssemblyEnabled) invocationArgs.push("-ContextAssemblyEnabled");
    const finalGit = await this.gitPreflight(runId, correlationId);
    try {
      assertStableGitPreflight(initialGit, finalGit);
    } catch (error) {
      throw this.translateGitPreflightError(error, runId, correlationId);
    }

    const controller = new AbortController();
    this.activeRuns.set(runId, controller);
    const timeout = setTimeout(() => controller.abort("TIMEOUT"), timeoutMs);
    let invocation: NovaCoreCommandResult;
    try {
      invocation = await this.commandRunner(
        this.powershellCommand,
        invocationArgs,
        this.repositoryRoot,
        {
          signal: controller.signal,
          maxStdoutBytes: this.maxStdoutBytes,
          maxStderrBytes: this.maxStderrBytes,
          onSpawn: (processId) => {
            writeFileSync(
              join(currentRunDirectory, "process.json"),
              `${JSON.stringify({ processId, runId, repositoryRoot: this.repositoryRoot, startedAt: new Date().toISOString() }, null, 2)}\n`,
              "utf8",
            );
          },
          onOutput: (stream, chunk) => this.outputObserver?.({
            projectId: context.projectId,
            missionId: context.missionId,
            runId,
            correlationId,
            stream,
            chunk: redactProcessOutput(chunk).slice(0, 4_096),
          }),
        },
      );
    } finally {
      clearTimeout(timeout);
      this.activeRuns.delete(runId);
    }
    const executionDiagnostics = [createCommandDiagnostic({
      result: invocation,
      command: this.powershellCommand,
      args: invocationArgs,
      cwd: this.repositoryRoot,
      runId,
      correlationId,
      phase: "POWERSHELL_EXECUTION",
      exitCode: officialCodexExitCode(invocation),
    })];

    if (invocation.terminationReason) {
      const timedOut = invocation.terminationReason === "TIMEOUT";
      throw new NovaCoreExecutionError(
        timedOut ? "NOVA_CORE_EXECUTION_TIMEOUT" : "NOVA_CORE_EXECUTION_CANCELLED",
        timedOut
          ? `L'exécution NOVA Core a dépassé le délai de ${timeoutMs} ms.`
          : "L'exécution NOVA Core a été annulée de manière contrôlée.",
        compactProcessDetails(invocation),
        executionDiagnostics,
      );
    }

    const reportJson = await findOfficialReport(currentRunDirectory);
    if (!reportJson) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_REPORT_NOT_FOUND",
        "Le moteur NOVA Core n’a produit aucun rapport officiel.",
        compactProcessDetails(invocation),
        executionDiagnostics,
      );
    }

    const officialReport = JSON.parse(
      await readFile(reportJson, "utf8"),
    ) as NovaCoreOfficialReport;
    const computedReportFingerprint = fingerprintReport(officialReport);
    if (
      !officialReport.ReportFingerprint ||
      officialReport.ReportFingerprint.toLowerCase() !== computedReportFingerprint
    ) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_REPORT_FINGERPRINT_MISMATCH",
        "Le ReportFingerprint PowerShell ne correspond pas au rapport officiel canonique.",
        undefined,
        executionDiagnostics,
      );
    }
    const bindingMismatches = reportBindingMismatches(officialReport.Binding ?? {}, binding);
    if (bindingMismatches.length > 0) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_REPORT_BINDING_MISMATCH",
        `Le rapport officiel n'est pas lié au run courant : ${bindingMismatches.join(", ")}.`,
        undefined,
        executionDiagnostics,
      );
    }
    if (profile === "READ_ONLY") {
      const postExecutionGit = await this.gitPreflight(runId, correlationId);
      try {
        assertStableGitPreflight(
          {
            ...initialGit,
            worktreeStatus: postExecutionGit.worktreeStatus,
            worktreeFingerprint: postExecutionGit.worktreeFingerprint,
          },
          postExecutionGit,
        );
      } catch (error) {
        throw this.translateGitPreflightError(error, runId, correlationId);
      }
      const observedUnauthorized = changedPorcelainPaths(
        initialGit.worktreeStatus,
        postExecutionGit.worktreeStatus,
      ).filter(
        (file) => !this.isReadOnlyWriteAllowed(file),
      );
      if (observedUnauthorized.length > 0) {
        throw new NovaCoreExecutionError(
          "NOVA_CORE_READ_ONLY_VIOLATION",
          `Une mission READ_ONLY a modifie le worktree : ${observedUnauthorized.join(", ")}.`,
          undefined,
          executionDiagnostics,
        );
      }
    }

    const missionReport = await mapOfficialReportToMissionReport(
      mission,
      officialReport,
      reportJson,
      this.repositoryRoot,
      invocation,
      executionRequest.changesExpected,
      executionDiagnostics,
      runId,
      correlationId,
      binding,
      this.validationTarget,
    );
    missionReport.promptPath = join(currentRunDirectory, "prompt.md");
    missionReport.manifestPath = join(currentRunDirectory, "manifest.json");
    missionReport.executionRequestPath = join(currentRunDirectory, "execution-request.json");
    missionReport.runBindingPath = join(currentRunDirectory, "run-binding.json");
    if (profile === "READ_ONLY") {
      const unauthorized = missionReport.filesChanged.filter(
        (file) => !this.isReadOnlyWriteAllowed(file),
      );
      if (unauthorized.length > 0) {
        throw new NovaCoreExecutionError(
          "NOVA_CORE_READ_ONLY_VIOLATION",
          `Une mission READ_ONLY a modifie le worktree : ${unauthorized.join(", ")}.`,
          undefined,
          executionDiagnostics,
        );
      }
    }
    return missionReport;
  }

  private isReadOnlyWriteAllowed(file: string): boolean {
    const candidate = resolve(this.repositoryRoot, file);
    if (!isCanonicalPathWithin(this.repositoryRoot, candidate)) return false;
    return this.readOnlyAllowedPaths.some((expected) => {
      return process.platform === "win32"
        ? candidate.toLowerCase() === expected.toLowerCase()
        : candidate === expected;
    });
  }

  private async gitPreflight(runId: string, correlationId: string) {
    try {
      return await inspectGitPreflight(this.repositoryRoot, this.commandRunner);
    } catch (error) {
      throw this.translateGitPreflightError(error, runId, correlationId);
    }
  }

  private translateGitPreflightError(error: unknown, runId: string, correlationId: string): NovaCoreExecutionError {
    if (!(error instanceof GitPreflightError)) throw error;
    const result = error.result ?? { exitCode: -1, stdout: "", stderr: error.message };
    return new NovaCoreExecutionError(
      error.code,
      error.message,
      compactProcessDetails(result),
      [createCommandDiagnostic({
        result,
        command: "git",
        args: result.args ?? [],
        cwd: this.repositoryRoot,
        runId,
        correlationId,
        phase: "GIT_PREFLIGHT",
      })],
    );
  }
}

async function mapOfficialReportToMissionReport(
  mission: RuntimeMission,
  report: NovaCoreOfficialReport,
  reportJson: string,
  repositoryRoot: string,
  invocation: NovaCoreCommandResult,
  changesExpected: boolean,
  executionDiagnostics: RuntimeDiagnostic[],
  runId: string,
  correlationId: string,
  binding: RunBinding,
  validationTarget: NovaCoreValidationTarget,
): Promise<Omit<MissionReport, "submittedAt">> {
  const git = report.Git ?? {};
  const renamed = (git.Renamed ?? []).flatMap((item) => [item.From, item.To]).filter(isString);
  const filesChanged = unique([
    ...(git.Created ?? []),
    ...(git.Modified ?? []),
    ...(git.Deleted ?? []),
    ...renamed,
  ]);
  const validations = report.Validations ?? [];
  const failedRequired = validations.filter(
    (validation) => validation.Required !== false && validation.Passed !== true,
  );
  const missingDynamic = missingDynamicValidations(filesChanged, validations, validationTarget);
  const pathScopeValid = validations
    .filter((validation) => validation.Type === "pathScope")
    .every((validation) => validation.Passed === true);
  const checks = validations
    .filter((validation) => validation.Passed === true)
    .map((validation) => validation.Name ?? validation.Type ?? "validation")
    .concat(`Rapport officiel : ${relative(repositoryRoot, reportJson).replaceAll("\\", "/")}`);
  const blockers = failedRequired.map(
    (validation) => validation.Message ?? `Échec du contrôle ${validation.Name ?? validation.Type ?? "inconnu"}`,
  );
  blockers.push(
    ...missingDynamic.map((validation) =>
      `La validation dynamique requise ${validation.name} (${validation.command}) est absente ou en échec pour le delta Git réel.`,
    ),
  );
  const errors = (report.Errors ?? []).map(stringifyValue);
  const deliverableEvidence = await collectDeliverableEvidence(report, repositoryRoot, runId, git);
  const diagnostics = executionDiagnostics.map((diagnostic) => ({
    ...diagnostic,
    phase: "CODEX_EXECUTION",
    runId,
    correlationId,
    processExitCode: invocation.exitCode,
    exitCode: report.Codex?.ExitCode ?? invocation.exitCode,
  }));

  if ((report.Codex?.ExitCode ?? invocation.exitCode) !== 0) {
    errors.push(
      `Codex a terminé avec le code ${String(report.Codex?.ExitCode ?? invocation.exitCode)}.`,
    );
  }
  if (["FAILED", "PARTIAL", "BLOCKED", "CANCELLED"].includes(report.Status ?? "")) {
    blockers.push(`Le moteur NOVA Core a classé l’exécution : ${report.Status}.`);
  }
  if (!changesExpected && filesChanged.length > 0) {
    blockers.push("Une mission READ_ONLY a produit des modifications de fichiers.");
  }
  if (changesExpected && report.Status === "NO_CHANGE") {
    blockers.push("La mission attendait une modification, mais aucun changement n’a été détecté.");
  }
  if (git.BranchChanged) {
    blockers.push("Codex a changé de branche Git.");
  }
  if (git.HeadChanged) {
    blockers.push("Codex a modifié le HEAD Git.");
  }

  return {
    projectId: mission.projectId,
    missionId: mission.missionId,
    reportId: `NOVA-EXEC-${mission.missionId}-${Date.now()}`,
    agentId: mission.assignedAgentId ?? "NOVA-DEVELOPER",
    reportType: `NOVA_CORE_CODEX_${report.Status ?? report.Codex?.Status ?? "UNKNOWN"}`,
    deliverables: mission.deliverables,
    filesChanged,
    checks,
    blockers,
    errors,
    diagnostics,
    runId,
    promptHash: binding.promptHash,
    executionRequestHash: binding.executionRequestHash,
    manifestHash: binding.manifestHash,
    reportFingerprint: fingerprintReport(report),
    reportPath: reportJson,
    repositoryRoot,
    codexVersion: binding.codexVersion,
    codexPath: binding.codexPath,
    codexBinaryHash: binding.codexBinaryHash,
    codexConfigPolicy: binding.codexConfigPolicy,
    branch: binding.branch,
    head: binding.head,
    deliverableEvidence,
    scopeConfirmed: pathScopeValid && missingDynamic.length === 0 && !git.BranchChanged && !git.HeadChanged,
  };
}

async function collectDeliverableEvidence(
  report: NovaCoreOfficialReport,
  repositoryRoot: string,
  runId: string,
  git: NonNullable<NovaCoreOfficialReport["Git"]>,
): Promise<NonNullable<MissionReport["deliverableEvidence"]>> {
  const requiredPaths = unique([
    ...(git.Created ?? []),
    ...(git.Modified ?? []),
    ...(git.Renamed ?? []).map((entry) => entry.To).filter(isString),
  ]);
  const entries = report.OutputEvidence?.entries ?? [];
  const evidence: NonNullable<MissionReport["deliverableEvidence"]> = [];
  for (const file of requiredPaths) {
    const normalized = file.replaceAll("\\", "/");
    const declared = entries.find((entry) => entry.path?.replaceAll("\\", "/") === normalized);
    if (!declared?.sha256 || declared.status !== "VALID") {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_DELIVERABLE_EVIDENCE_MISSING",
        `La preuve matérielle du fichier ${normalized} est absente ou invalide.`,
      );
    }
    const absolute = resolve(repositoryRoot, normalized);
    const relativePath = relative(repositoryRoot, absolute).replaceAll("\\", "/");
    if (relativePath.startsWith("../") || relativePath === "..") {
      throw new NovaCoreExecutionError("NOVA_CORE_DELIVERABLE_OUTSIDE_REPOSITORY", `Le livrable ${normalized} sort du dépôt.`);
    }
    const fileStat = await stat(absolute);
    const observedHash = sha256(await readFile(absolute));
    if (observedHash.toLowerCase() !== declared.sha256.toLowerCase()) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_DELIVERABLE_HASH_MISMATCH",
        `Le hash du livrable ${normalized} ne correspond pas au registre de preuves.`,
      );
    }
    evidence.push({
      path: normalized,
      size: fileStat.size,
      sha256: observedHash,
      modifiedAt: fileStat.mtime.toISOString(),
      runId,
    });
  }
  return evidence;
}

async function findOfficialReport(runDirectoryPath: string): Promise<string | null> {
  try {
    const reportPath = join(runDirectoryPath, "official-report.json");
    await stat(reportPath);
    return reportPath;
  } catch {
    try {
      const entries = await readdir(runDirectoryPath, { withFileTypes: true });
      const candidates = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(runDirectoryPath, entry.name, "official-report.json"));
      const existing: string[] = [];
      for (const candidate of candidates) {
        try { await stat(candidate); existing.push(candidate); } catch { /* ignore absent candidate */ }
      }
      return existing.length === 1 ? existing[0] : null;
    } catch {
      return null;
    }
  }
}

export async function inspectCodexIdentity(repositoryRoot: string): Promise<NovaCoreCodexIdentity> {
  const locator = process.platform === "win32" ? "where.exe" : "which";
  const candidates = process.platform === "win32" ? ["codex.cmd", "codex"] : ["codex"];
  let codexPath = "";
  for (const candidate of candidates) {
    const located = await runCommand(locator, [candidate], repositoryRoot, { maxOutputBytes: 16_384 });
    if (located.exitCode === 0) {
      codexPath = located.stdout.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "";
      if (codexPath) break;
    }
  }
  if (!codexPath) {
    throw new NovaCoreExecutionError("NOVA_CORE_CODEX_NOT_FOUND", "Le binaire Codex est introuvable.");
  }
  const versionResult = await runCommand(codexPath, ["--version"], repositoryRoot, { maxOutputBytes: 16_384 });
  const version = versionResult.exitCode === 0 ? validateCodexVersion(versionResult.stdout) : null;
  if (!version) {
    throw new NovaCoreExecutionError(
      "NOVA_CORE_CODEX_VERSION_NOT_SUPPORTED",
      `Codex >=0.144.1 est requis; version observée : ${versionResult.stdout.trim() || "<inconnue>"}.`,
    );
  }
  const binary = await readFile(codexPath);
  return {
    version,
    path: resolve(codexPath),
    binaryHash: sha256(binary),
    configPolicy: "EXPLICIT_RUNTIME_PROFILE",
  };
}

export function validateCodexVersion(versionOutput: string): string {
  const match = /(\d+\.\d+\.\d+)/.exec(versionOutput);
  if (!match || compareVersions(match[1], "0.144.1") < 0) {
    throw new NovaCoreExecutionError(
      "NOVA_CORE_CODEX_VERSION_NOT_SUPPORTED",
      `Codex >=0.144.1 est requis; version observee : ${versionOutput.trim() || "<inconnue>"}.`,
    );
  }
  return match[1];
}

function compareVersions(left: string, right: string): number {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export async function runCommand(
  command: string,
  args: readonly string[],
  workingDirectory: string,
  options: NovaCoreCommandRunnerOptions = {},
): Promise<NovaCoreCommandResult> {
  return new Promise((resolvePromise, reject) => {
    if (options.signal?.aborted) {
      resolvePromise({
        exitCode: -1,
        stdout: "",
        stderr: "",
        command,
        args: [...args],
        cwd: workingDirectory,
        terminationReason: abortReason(options.signal),
      });
      return;
    }
    const invocation = commandInvocation(command, args);
    const child = spawn(invocation.command, invocation.args, {
      cwd: workingDirectory,
      env: isGitCommand(command)
        ? { ...process.env, GIT_OPTIONAL_LOCKS: "0" }
        : process.env,
      windowsHide: true,
      windowsVerbatimArguments: invocation.windowsVerbatimArguments,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    options.onSpawn?.(child.pid!);
    let stdout = "";
    let stderr = "";
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let outputTruncated = false;
    let terminationReason: "CANCELLED" | "TIMEOUT" | undefined;
    const maxStdoutBytes = options.maxStdoutBytes ?? options.maxOutputBytes ?? 1_000_000;
    const maxStderrBytes = options.maxStderrBytes ?? options.maxOutputBytes ?? 1_000_000;
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      options.onOutput?.("stdout", chunk);
      const appended = appendBounded(stdout, chunk, stdoutBytes, maxStdoutBytes);
      stdout = appended.value;
      stdoutBytes = appended.totalBytes;
      outputTruncated ||= appended.truncated;
    });
    child.stderr.on("data", (chunk: string) => {
      options.onOutput?.("stderr", chunk);
      const appended = appendBounded(stderr, chunk, stderrBytes, maxStderrBytes);
      stderr = appended.value;
      stderrBytes = appended.totalBytes;
      outputTruncated ||= appended.truncated;
    });
    const abort = () => {
      terminationReason = abortReason(options.signal);
      void killProcessTree(child.pid);
    };
    options.signal?.addEventListener("abort", abort, { once: true });
    child.on("error", (error) => {
      options.signal?.removeEventListener("abort", abort);
      reject(
        new NovaCoreExecutionError(
          "NOVA_CORE_PROCESS_START_FAILED",
          `Impossible de lancer ${command}.`,
          error.message,
          [createCommandDiagnostic({
            result: { exitCode: -1, stdout, stderr, command, args: [...args], cwd: workingDirectory },
            command,
            args,
            cwd: workingDirectory,
            phase: "PROCESS_START",
            exitCode: -1,
          })],
        ),
      );
    });
    child.on("close", (code) => {
      options.signal?.removeEventListener("abort", abort);
      resolvePromise({
        exitCode: code ?? -1,
        stdout,
        stderr,
        command,
        args: [...args],
        cwd: workingDirectory,
        terminationReason,
        outputTruncated,
      });
    });
  });
}

function commandInvocation(
  command: string,
  args: readonly string[],
): { command: string; args: string[]; windowsVerbatimArguments?: boolean } {
  if (process.platform !== "win32" || !/\.(?:cmd|bat)$/i.test(command)) {
    return { command, args: [...args] };
  }
  const commandLine = [
    quoteWindowsCommandPath(command),
    ...args.map(validateWindowsCommandArgument),
  ].join(" ");
  return {
    command: process.env.ComSpec?.trim() || "cmd.exe",
    args: ["/d", "/s", "/c", commandLine],
    windowsVerbatimArguments: true,
  };
}

function quoteWindowsCommandPath(value: string): string {
  if (/[\r\n\0"%!^&|<>]/.test(value)) {
    throw new NovaCoreExecutionError(
      "NOVA_CORE_WINDOWS_COMMAND_ARGUMENT_INVALID",
      "Un argument de commande Windows contient un caractère interdit.",
    );
  }
  return /\s/.test(value) ? `"${value}"` : value;
}

function validateWindowsCommandArgument(value: string): string {
  if (!/^[A-Za-z0-9_.,:=@+\\/.-]+$/.test(value)) {
    throw new NovaCoreExecutionError(
      "NOVA_CORE_WINDOWS_COMMAND_ARGUMENT_INVALID",
      "Un argument de commande Windows contient un caractère interdit.",
    );
  }
  return value;
}

function redactProcessOutput(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\b(?:sk|gh[pousr])-[A-Za-z0-9_-]{12,}\b/g, "[REDACTED_TOKEN]")
    .replace(/((?:token|secret|password|api[_-]?key)\s*[=:]\s*)\S+/gi, "$1[REDACTED]");
}

function createCommandDiagnostic(input: {
  result: NovaCoreCommandResult;
  command: string;
  args: readonly string[];
  cwd: string;
  phase: string;
  runId?: string | null;
  correlationId?: string;
  exitCode?: number;
}): RuntimeDiagnostic {
  return {
    code: input.result.exitCode === 0 ? "NOVA_CORE_COMMAND_COMPLETED" : "NOVA_CORE_COMMAND_FAILED",
    phase: input.phase,
    message: redactProcessOutput(compactProcessDetails(input.result)) || `Commande ${input.command} terminée avec le code ${input.result.exitCode}.`,
    exitCode: input.exitCode ?? input.result.exitCode,
    processExitCode: input.result.exitCode,
    stdout: redactProcessOutput(input.result.stdout),
    stderr: redactProcessOutput(input.result.stderr),
    command: input.command,
    args: [...input.args],
    cwd: input.cwd,
    runId: input.runId,
    correlationId: input.correlationId,
  };
}

function officialCodexExitCode(result: NovaCoreCommandResult): number {
  return result.exitCode;
}

function isString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function inspectProcessAlive(processId: number): NovaCoreRecoverySignal {
  try {
    process.kill(processId, 0);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ESRCH") return false;
    return "UNKNOWN";
  }
}

async function inspectDescendantProcesses(
  processId: number,
  repositoryRoot: string,
  powershellCommand: string,
): Promise<NovaCoreRecoverySignal> {
  if (process.platform === "win32") {
    const script = [
      `$root=${processId}`,
      "$rows=@(Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId)",
      "$pending=@($root)",
      "$found=$false",
      "while($pending.Count -gt 0){$parent=$pending[0];$pending=@($pending | Select-Object -Skip 1);$children=@($rows | Where-Object ParentProcessId -eq $parent);if($children.Count -gt 0){$found=$true;$pending+=@($children.ProcessId)}}",
      "if($found){exit 10}else{exit 0}",
    ].join(";");
    try {
      const result = await runCommand(
        powershellCommand,
        ["-NoProfile", "-Command", script],
        repositoryRoot,
        { maxStdoutBytes: 16_384, maxStderrBytes: 16_384 },
      );
      if (result.exitCode === 10) return true;
      if (result.exitCode === 0) return false;
      return "UNKNOWN";
    } catch {
      return "UNKNOWN";
    }
  }
  try {
    const result = await runCommand(
      "ps",
      ["-eo", "pid=,ppid="],
      repositoryRoot,
      { maxStdoutBytes: 1_000_000, maxStderrBytes: 16_384 },
    );
    if (result.exitCode !== 0) return "UNKNOWN";
    const pairs = result.stdout.split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number))
      .filter((pair) => pair.length === 2 && pair.every(Number.isInteger));
    const pending = [processId];
    for (let index = 0; index < pending.length; index += 1) {
      const children = pairs.filter(([, parent]) => parent === pending[index]).map(([pid]) => pid!);
      if (children.length > 0) return true;
    }
    return false;
  } catch {
    return "UNKNOWN";
  }
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function changedPorcelainPaths(initial: string, current: string): string[] {
  const initialEntries = porcelainEntries(initial);
  const currentEntries = porcelainEntries(current);
  const changedLines = unique([...initialEntries.keys(), ...currentEntries.keys()])
    .filter((line) => !initialEntries.has(line) || !currentEntries.has(line));
  return unique(changedLines.flatMap((line) => currentEntries.get(line)?.paths ?? initialEntries.get(line)?.paths ?? []));
}

function porcelainEntries(status: string): Map<string, { paths: string[] }> {
  const entries = new Map<string, { paths: string[] }>();
  for (const line of status.split(/\r?\n/)) {
    if (line.length < 4) continue;
    const value = line.slice(3).trim();
    const candidates = value.includes(" -> ") ? value.split(" -> ") : [value];
    entries.set(line, {
      paths: candidates.filter(Boolean).map((candidate) => candidate.replace(/^"|"$/g, "")),
    });
  }
  return entries;
}

function isGitCommand(command: string): boolean {
  return /(?:^|[\\/])git(?:\.exe)?$/i.test(command);
}

function validateTimeout(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 24 * 60 * 60_000) {
    throw new NovaCoreExecutionError(
      "NOVA_CORE_INVALID_TIMEOUT",
      "Le timeout doit être un nombre entier compris entre 1 ms et 24 heures.",
    );
  }
  return value;
}

function validateOutputLimit(value: number): number {
  if (!Number.isInteger(value) || value < 1_024 || value > 100_000_000) {
    throw new NovaCoreExecutionError(
      "NOVA_CORE_INVALID_OUTPUT_LIMIT",
      "La limite de sortie doit être comprise entre 1024 et 100000000 octets.",
    );
  }
  return value;
}

function abortReason(signal?: AbortSignal): "CANCELLED" | "TIMEOUT" {
  return signal?.reason === "TIMEOUT" ? "TIMEOUT" : "CANCELLED";
}

function appendBounded(
  current: string,
  chunk: string,
  totalBytes: number,
  maxBytes: number,
): { value: string; totalBytes: number; truncated: boolean } {
  const buffer = Buffer.from(chunk);
  const remaining = Math.max(0, maxBytes - totalBytes);
  return {
    value: remaining > 0 ? current + buffer.subarray(0, remaining).toString("utf8") : current,
    totalBytes: totalBytes + buffer.length,
    truncated: buffer.length > remaining,
  };
}

async function killProcessTree(pid: number | undefined): Promise<void> {
  if (!pid) return;
  if (process.platform === "win32") {
    const killed = await new Promise<boolean>((resolvePromise) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
      const deadline = setTimeout(() => {
        try { killer.kill(); } catch { /* taskkill already stopped */ }
        resolvePromise(false);
      }, 2_000);
      killer.once("error", () => {
        clearTimeout(deadline);
        resolvePromise(false);
      });
      killer.once("close", (code) => {
        clearTimeout(deadline);
        resolvePromise(code === 0);
      });
    });
    if (!killed) {
      try { process.kill(pid, "SIGKILL"); } catch { /* process already exited */ }
    }
    return;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try { process.kill(pid, "SIGTERM"); } catch { return; }
  }
  const forceKill = setTimeout(() => {
    try { process.kill(-pid, "SIGKILL"); } catch {
      try { process.kill(pid, "SIGKILL"); } catch { /* process already exited */ }
    }
  }, 2_000);
  forceKill.unref();
}

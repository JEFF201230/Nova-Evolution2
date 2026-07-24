import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type {
  MissionReport,
  RuntimeContext,
  RuntimeMission,
} from "../runtime/orchestrator/orchestrator-runtime.js";

export type NovaCoreExecutionProfile = "FAST" | "BUILD" | "ARCHITECTURE" | "READ_ONLY";

export interface NovaCoreExecutionRequest {
  profile?: NovaCoreExecutionProfile;
  prompt?: string;
  expectedBranch?: string;
  changesExpected?: boolean;
  humanReviewRequired?: boolean;
}

export interface NovaCoreCommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface NovaCoreCommandRunner {
  (
    command: string,
    args: readonly string[],
    workingDirectory: string,
  ): Promise<NovaCoreCommandResult>;
}

export interface NovaCoreExecutionEngineOptions {
  repositoryRoot: string;
  dataRoot: string;
  runtimeDirectory?: string;
  powershellCommand?: string;
  commandRunner?: NovaCoreCommandRunner;
}

interface NovaCoreValidation {
  name: string;
  type: "gitDiffCheck" | "namedCommand";
  command?: string;
  required: boolean;
}

interface NovaCoreOfficialReport {
  Status?: string;
  Codex?: {
    Status?: string;
    ExitCode?: number;
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
}

export class NovaCoreExecutionError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: string,
  ) {
    super(message);
    this.name = "NovaCoreExecutionError";
  }
}

export class NovaCoreExecutionEngine {
  private readonly repositoryRoot: string;
  private readonly dataRoot: string;
  private readonly runtimeDirectory: string;
  private readonly powershellCommand: string;
  private readonly commandRunner: NovaCoreCommandRunner;

  constructor(options: NovaCoreExecutionEngineOptions) {
    this.repositoryRoot = resolve(options.repositoryRoot);
    this.dataRoot = resolve(options.dataRoot);
    this.runtimeDirectory = resolve(
      options.runtimeDirectory ?? join(this.repositoryRoot, "tools", "nova-core-runtime"),
    );
    this.powershellCommand =
      options.powershellCommand ??
      process.env.NOVA_POWERSHELL ??
      (process.platform === "win32" ? "powershell.exe" : "pwsh");
    this.commandRunner = options.commandRunner ?? runCommand;
  }

  async execute(
    context: RuntimeContext,
    mission: RuntimeMission,
    request: NovaCoreExecutionRequest = {},
  ): Promise<Omit<MissionReport, "submittedAt">> {
    const projectName = safeName(context.projectId);
    const missionName = safeName(context.missionId);
    const missionDirectory = join(this.dataRoot, "missions", projectName, missionName);
    const reportDirectory = join(this.dataRoot, "reports", projectName, missionName);
    const promptFile = join(missionDirectory, "prompt.md");
    const missionFile = join(missionDirectory, "mission.json");
    const expectedBranch = request.expectedBranch ?? await this.resolveCurrentBranch();
    const profile = request.profile ?? selectProfile(mission);
    const validations = selectValidations(mission);

    await mkdir(missionDirectory, { recursive: true });
    await mkdir(reportDirectory, { recursive: true });
    await writeFile(promptFile, request.prompt ?? buildPrompt(context, mission), "utf8");
    await writeFile(
      missionFile,
      `${JSON.stringify({
        schemaVersion: "1.0.0",
        missionId: mission.missionId,
        program: mission.projectId,
        lot: "NOVA-CORE-MVP",
        title: mission.objective,
        missionType: mission.missionType,
        profile,
        repository: this.repositoryRoot,
        expectedBranch,
        promptFile,
        workingDirectory: this.repositoryRoot,
        reportDirectory,
        allowedPaths: mission.scope.allowed,
        forbiddenPaths: unique([
          ...mission.scope.forbidden,
          ".git/**",
          ".nova-data/**",
          "node_modules/**",
          ".env",
          ".env.*",
          "*.pem",
          "*.key",
          "*.pfx",
          "*.p12",
          "*credentials*",
          "*secret*",
        ]),
        deliverables: mission.deliverables,
        stopCriteria: mission.stopCriteria,
        authorizedReferences: mission.authorizedReferences,
        validations,
        changesExpected: request.changesExpected ?? profile !== "READ_ONLY",
        humanReviewRequired: request.humanReviewRequired ?? true,
        enabled: true,
      }, null, 2)}\n`,
      "utf8",
    );

    const invocation = await this.commandRunner(
      this.powershellCommand,
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        join(this.runtimeDirectory, "Invoke-NovaCoreMission.ps1"),
        "-MissionFile",
        missionFile,
        "-ContextAssemblyEnabled",
      ],
      this.repositoryRoot,
    );

    const reportJson = await findNewestOfficialReport(reportDirectory);
    if (!reportJson) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_REPORT_NOT_FOUND",
        "Le moteur NOVA Core n’a produit aucun rapport officiel.",
        compactProcessDetails(invocation),
      );
    }

    const officialReport = JSON.parse(
      await readFile(reportJson, "utf8"),
    ) as NovaCoreOfficialReport;

    return mapOfficialReportToMissionReport(
      mission,
      officialReport,
      reportJson,
      this.repositoryRoot,
      invocation,
      request.changesExpected ?? profile !== "READ_ONLY",
    );
  }

  private async resolveCurrentBranch(): Promise<string> {
    const branchResult = await this.commandRunner(
      "git",
      ["branch", "--show-current"],
      this.repositoryRoot,
    );
    const branch = branchResult.stdout.trim();
    if (branchResult.exitCode !== 0 || !branch) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_GIT_BRANCH_UNRESOLVED",
        "NOVA Core doit être placé dans un dépôt Git avec une branche active avant de lancer Codex.",
        compactProcessDetails(branchResult),
      );
    }
    return branch;
  }
}

export function buildPrompt(context: RuntimeContext, mission: RuntimeMission): string {
  return [
    "# Mission d’exécution NOVA Core",
    "",
    `Projet : ${context.projectId}`,
    `Mission : ${context.missionId}`,
    `Objectif : ${context.objective}`,
    "",
    "## Périmètre autorisé",
    ...context.scope.allowed.map((path) => `- ${path}`),
    "",
    "## Périmètre interdit",
    ...context.scope.forbidden.map((path) => `- ${path}`),
    "",
    "## Livrables attendus",
    ...context.deliverables.map((deliverable) => `- ${deliverable}`),
    "",
    "## Conditions d’arrêt",
    ...context.stopCriteria.map((criterion) => `- ${criterion}`),
    "",
    "## Références autorisées",
    ...(context.authorizedReferences.length > 0
      ? context.authorizedReferences.map((reference) => `- ${reference}`)
      : ["- Aucune référence supplémentaire"]),
    "",
    "## Règles obligatoires",
    "- Modifier uniquement les chemins autorisés.",
    "- Ne supprimer, déplacer ou renommer aucun fichier hors périmètre.",
    "- Préserver les changements préexistants.",
    "- Exécuter les tests adaptés au périmètre.",
    "- Ne créer aucun commit et ne pousser aucune branche.",
    "- Produire un résultat factuel ; ne pas déclarer un succès sans preuve.",
    "",
  ].join("\n");
}

export function selectProfile(mission: RuntimeMission): NovaCoreExecutionProfile {
  const classification = `${mission.missionType} ${mission.objective}`.toUpperCase();
  if (/(ARCHITECTURE|SECURITY|SÉCURITÉ|DATABASE|DATA|MIGRATION)/.test(classification)) {
    return "ARCHITECTURE";
  }
  if (/(UX|UI|CSS|DOCUMENTATION|AUDIT|INSPECTION)/.test(classification)) {
    return "FAST";
  }
  return "BUILD";
}

function selectValidations(mission: RuntimeMission): NovaCoreValidation[] {
  const validations: NovaCoreValidation[] = [
    { name: "git-diff-check", type: "gitDiffCheck", required: true },
  ];
  const allowed = mission.scope.allowed.map((path) => path.replaceAll("\\", "/"));

  if (allowed.some((path) => path.startsWith("apps/nova-web"))) {
    validations.push(
      { name: "nova-web-tests", type: "namedCommand", command: "novaWebTests", required: true },
      { name: "nova-web-typecheck", type: "namedCommand", command: "novaWebTypecheck", required: true },
      { name: "nova-web-build", type: "namedCommand", command: "novaWebBuild", required: true },
    );
  }
  if (allowed.some((path) => path.startsWith("server/"))) {
    validations.push(
      { name: "nova-core-tests", type: "namedCommand", command: "novaCoreTests", required: true },
      { name: "nova-core-typecheck", type: "namedCommand", command: "novaCoreTypecheck", required: true },
    );
  }
  return validations;
}

function mapOfficialReportToMissionReport(
  mission: RuntimeMission,
  report: NovaCoreOfficialReport,
  reportJson: string,
  repositoryRoot: string,
  invocation: NovaCoreCommandResult,
  changesExpected: boolean,
): Omit<MissionReport, "submittedAt"> {
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
  const errors = (report.Errors ?? []).map(stringifyValue);

  if ((report.Codex?.ExitCode ?? invocation.exitCode) !== 0) {
    errors.push(
      `Codex a terminé avec le code ${String(report.Codex?.ExitCode ?? invocation.exitCode)}.`,
    );
  }
  if (["FAILED", "PARTIAL", "BLOCKED", "CANCELLED"].includes(report.Status ?? "")) {
    blockers.push(`Le moteur NOVA Core a classé l’exécution : ${report.Status}.`);
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
    scopeConfirmed: pathScopeValid && !git.BranchChanged && !git.HeadChanged,
  };
}

async function findNewestOfficialReport(reportDirectory: string): Promise<string | null> {
  let entries;
  try {
    entries = await readdir(reportDirectory, { withFileTypes: true });
  } catch {
    return null;
  }
  const candidates = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const path = join(reportDirectory, entry.name, "official-report.json");
        try {
          return { path, modifiedAt: (await stat(path)).mtimeMs };
        } catch {
          return null;
        }
      }),
  );
  return candidates
    .filter((candidate): candidate is { path: string; modifiedAt: number } => candidate !== null)
    .sort((left, right) => right.modifiedAt - left.modifiedAt)[0]?.path ?? null;
}

async function runCommand(
  command: string,
  args: readonly string[],
  workingDirectory: string,
): Promise<NovaCoreCommandResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, [...args], {
      cwd: workingDirectory,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      reject(
        new NovaCoreExecutionError(
          "NOVA_CORE_PROCESS_START_FAILED",
          `Impossible de lancer ${command}.`,
          error.message,
        ),
      );
    });
    child.on("close", (code) => {
      resolvePromise({ exitCode: code ?? -1, stdout, stderr });
    });
  });
}

function compactProcessDetails(result: NovaCoreCommandResult): string {
  return [result.stderr.trim(), result.stdout.trim()]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4_000);
}

function safeName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, "_");
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
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

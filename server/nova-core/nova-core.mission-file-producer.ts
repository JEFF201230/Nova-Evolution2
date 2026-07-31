import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  RuntimeContext,
  RuntimeDiagnostic,
  RuntimeMission,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import type { GitPreflight } from "./git-preflight.js";
import {
  buildRunBinding,
  identitySlug,
  runDirectory,
  type RunBinding,
} from "./run-binding.js";
import { normalizeScopeEntries } from "./scope-validation.js";
import type {
  NovaCoreCodexIdentity,
  NovaCoreCommandResult,
  NovaCoreCommandRunner,
  NovaCoreExecutionProfile,
  NovaCoreExecutionRequest,
  NovaCoreValidationTarget,
} from "./nova-core.execution.js";

interface NovaCoreValidation {
  name: string;
  type: "gitDiffCheck" | "namedCommand";
  command?: string;
  required: boolean;
}

export interface NovaCoreMissionFileProducerOptions {
  repositoryRoot: string;
  dataRoot: string;
  commandRunner: NovaCoreCommandRunner;
  readOnlyAllowedPaths: readonly string[];
  protectedPaths: readonly string[];
  validationTarget: NovaCoreValidationTarget;
}

export interface NovaCoreMissionFileProducerInput {
  context: RuntimeContext;
  mission: RuntimeMission;
  request: NovaCoreExecutionRequest;
  initialGit: GitPreflight;
  codexIdentity: NovaCoreCodexIdentity;
  runId: string;
  correlationId: string;
}

export interface NovaCoreMissionFilePreparation {
  currentRunDirectory: string;
  reportDirectory: string;
  promptFile: string;
  missionFile: string;
  runId: string;
  correlationId: string;
  profile: NovaCoreExecutionProfile;
  executionRequest: NovaCoreExecutionRequest & {
    profile: NovaCoreExecutionProfile;
    changesExpected: boolean;
    humanReviewRequired: boolean;
  };
  binding: RunBinding;
}

export interface NovaCoreMissionFileProducerContract {
  produce(input: NovaCoreMissionFileProducerInput): Promise<NovaCoreMissionFilePreparation>;
}

export class NovaCoreExecutionError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: string,
    readonly diagnostics: RuntimeDiagnostic[] = [],
  ) {
    super(message);
    this.name = "NovaCoreExecutionError";
  }
}

export class NovaCoreMissionFileProducer implements NovaCoreMissionFileProducerContract {
  private readonly repositoryRoot: string;
  private readonly dataRoot: string;
  private readonly commandRunner: NovaCoreCommandRunner;
  private readonly readOnlyAllowedPaths: readonly string[];
  private readonly protectedPaths: readonly string[];
  private readonly validationTarget: NovaCoreValidationTarget;

  constructor(options: NovaCoreMissionFileProducerOptions) {
    this.repositoryRoot = options.repositoryRoot;
    this.dataRoot = options.dataRoot;
    this.commandRunner = options.commandRunner;
    this.readOnlyAllowedPaths = options.readOnlyAllowedPaths;
    this.protectedPaths = options.protectedPaths;
    this.validationTarget = options.validationTarget;
  }

  async produce(
    input: NovaCoreMissionFileProducerInput,
  ): Promise<NovaCoreMissionFilePreparation> {
    const { context, mission, request, initialGit, codexIdentity, runId, correlationId } = input;
    const projectName = identitySlug(context.projectId);
    const missionName = identitySlug(context.missionId);
    const missionDirectory = join(this.dataRoot, "missions", projectName, missionName);
    const currentRunDirectory = runDirectory(this.dataRoot, runId);
    const reportDirectory = currentRunDirectory;
    const promptFile = join(missionDirectory, "prompt.md");
    const missionFile = join(missionDirectory, "mission.json");
    const expectedBranch = request.expectedBranch ?? initialGit.branch;
    if (expectedBranch !== initialGit.branch) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_GIT_BRANCH_MISMATCH",
        `La branche active ${initialGit.branch} ne correspond pas à la branche attendue ${expectedBranch}.`,
      );
    }
    const automaticProfile = selectProfile(mission);
    if (automaticProfile === "READ_ONLY" && request.profile && request.profile !== "READ_ONLY") {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_READ_ONLY_PROFILE_REQUIRED",
        "Une mission AUDIT, INSPECTION, REVIEW ou ANALYSIS impose le profil READ_ONLY.",
      );
    }
    const profile = request.profile ?? automaticProfile;
    const validations = selectValidations();
    const missionPrompt = buildPrompt(context, mission);
    if (request.prompt && !request.prompt.includes(missionPrompt)) {
      throw new NovaCoreExecutionError(
        "NOVA_CORE_PROMPT_CONTRACT_MISSING",
        "Un prompt personnalisé doit conserver intégralement le contrat de mission généré par NOVA.",
      );
    }
    const effectivePrompt = request.prompt ?? missionPrompt;
    const executionRequest = {
      ...request,
      profile,
      changesExpected: profile === "READ_ONLY" ? false : (request.changesExpected ?? true),
      humanReviewRequired: request.humanReviewRequired ?? true,
    };

    await mkdir(missionDirectory, { recursive: true });
    await mkdir(reportDirectory, { recursive: true });
    await mkdir(currentRunDirectory, { recursive: true });
    if (profile === "READ_ONLY") {
      const trackedIndex = await this.commandRunner(
        "git",
        ["ls-files", "--stage", "-z"],
        this.repositoryRoot,
      );
      if (trackedIndex.exitCode !== 0) {
        throw new NovaCoreExecutionError(
          "NOVA_CORE_READ_ONLY_BASELINE_UNAVAILABLE",
          "Le snapshot initial des fichiers suivis READ_ONLY n'a pas pu etre collecte.",
          compactProcessDetails(trackedIndex),
        );
      }
      await writeFile(
        join(currentRunDirectory, "read-only-baseline.json"),
        `${JSON.stringify({
          schemaVersion: "1.0.0",
          capturedAt: new Date().toISOString(),
          repositoryRoot: this.repositoryRoot,
          branch: initialGit.branch,
          head: initialGit.head,
          worktreeStatus: initialGit.worktreeStatus,
          trackedIndex: trackedIndex.stdout,
          allowedPaths: [...this.readOnlyAllowedPaths],
        }, null, 2)}\n`,
        "utf8",
      );
    }
    await writeFile(promptFile, effectivePrompt, "utf8");
    await writeFile(join(currentRunDirectory, "prompt.md"), effectivePrompt, "utf8");
    const manifest = {
      schemaVersion: "1.0.0",
      missionId: mission.missionId,
      program: mission.projectId,
      lot: "NOVA-CORE-MVP",
      title: mission.objective,
      missionType: mission.missionType,
      profile,
      repository: this.repositoryRoot,
      expectedBranch,
      gitPreflight: initialGit,
      promptFile,
      workingDirectory: this.repositoryRoot,
      reportDirectory,
      artifactRoot: this.dataRoot,
      runDirectory: currentRunDirectory,
      allowedPaths: normalizeScopeEntries(mission.scope.allowed),
      forbiddenPaths: unique([
        ...normalizeScopeEntries(mission.scope.forbidden),
        ...this.protectedPaths,
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
      validationPolicy: {
        version: 1,
        source: "actual-git-delta",
        matrix: "server/nova-core/validation-matrix.ts",
        target: this.validationTarget,
      },
      changesExpected: executionRequest.changesExpected,
      humanReviewRequired: executionRequest.humanReviewRequired,
      enabled: true,
      runId,
      correlationId,
    };
    const manifestArtifactText = `${JSON.stringify(manifest, null, 2)}\n`;
    const executionRequestText = `${JSON.stringify(executionRequest, null, 2)}\n`;
    const binding = buildRunBinding({
      projectId: context.projectId,
      missionId: context.missionId,
      runId,
      prompt: effectivePrompt,
      executionRequest,
      manifest,
      executionRequestBytes: executionRequestText,
      manifestBytes: manifestArtifactText,
      branch: expectedBranch,
      head: initialGit.head,
      codexVersion: codexIdentity.version,
      codexPath: codexIdentity.path,
      codexBinaryHash: codexIdentity.binaryHash,
      codexConfigPolicy: codexIdentity.configPolicy,
    });
    const boundManifest = { ...manifest, binding };
    const manifestText = `${JSON.stringify(boundManifest, null, 2)}\n`;
    await writeFile(missionFile, manifestText, "utf8");
    await writeFile(join(currentRunDirectory, "manifest.json"), manifestArtifactText, "utf8");
    await writeFile(
      join(currentRunDirectory, "execution-request.json"),
      executionRequestText,
      "utf8",
    );
    await writeFile(
      join(currentRunDirectory, "run-binding.json"),
      `${JSON.stringify(binding, null, 2)}\n`,
      "utf8",
    );

    return {
      currentRunDirectory,
      reportDirectory,
      promptFile,
      missionFile,
      runId,
      correlationId,
      profile,
      executionRequest,
      binding,
    };
  }
}

export function buildPrompt(context: RuntimeContext, _mission: RuntimeMission): string {
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
  if (/(AUDIT|INSPECTION|REVIEW|ANALYSIS)/.test(classification)) {
    return "READ_ONLY";
  }
  if (/(ARCHITECTURE|SECURITY|SÉCURITÉ|DATABASE|DATA|MIGRATION)/.test(classification)) {
    return "ARCHITECTURE";
  }
  if (/(UX|UI|CSS|DOCUMENTATION)/.test(classification)) {
    return "FAST";
  }
  return "BUILD";
}

export function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function selectValidations(): NovaCoreValidation[] {
  return [
    { name: "git-diff-check", type: "gitDiffCheck", required: true },
  ];
}

export function compactProcessDetails(result: NovaCoreCommandResult): string {
  return [result.stderr.trim(), result.stdout.trim()]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4_000);
}

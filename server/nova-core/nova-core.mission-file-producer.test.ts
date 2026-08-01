import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type {
  RuntimeContext,
  RuntimeMission,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import type { GitPreflight } from "./git-preflight.js";
import {
  NovaCoreExecutionError,
  NovaCoreMissionFileProducer,
} from "./nova-core.mission-file-producer.js";
import {
  PEOPLE_LOT_MACHINE_CONTRACT,
} from "./people-lot-machine-contract.js";
import {
  buildRunBinding,
  identitySlug,
  runDirectory,
  sha256,
} from "./run-binding.js";

const TEST_CODEX = {
  version: "0.144.1",
  path: "C:/tools/codex.cmd",
  binaryHash: "c".repeat(64),
  configPolicy: "EXPLICIT_RUNTIME_PROFILE" as const,
};

const INITIAL_GIT: GitPreflight = {
  gitVersion: "git version 2.50.1",
  topLevel: "C:/repository",
  branch: "develop",
  head: "a".repeat(40),
  worktreeStatus: "",
  worktreeFingerprint: "f".repeat(64),
  conflicts: [],
  gitLockPath: "C:/repository/.git/index.lock",
  submodules: [],
};

test("le producteur préserve exactement le manifeste, les hashes, le binding, les chemins et les artefacts", async () => {
  const repositoryRoot = await mkdtemp(join(tmpdir(), "nova-mission-file-producer-"));
  const dataRoot = join(repositoryRoot, "runtime-data");
  let commandCalls = 0;
  const producer = new NovaCoreMissionFileProducer({
    repositoryRoot,
    dataRoot,
    commandRunner: async () => {
      commandCalls += 1;
      throw new Error("Le producteur BUILD ne doit exécuter aucune commande.");
    },
    readOnlyAllowedPaths: [],
    protectedPaths: ["server/protected/**"],
    validationTarget: "VEEDDA",
  });
  const context = createContext();
  const mission = createMission();
  const request = { timeoutMs: 456 };
  const runId = "RUN-MISSION-FILE-PRODUCER-001";
  const correlationId = "CORR-NOVA-CORE-MISSION-FILE-PRODUCER-001";

  const preparation = await producer.produce({
    context,
    mission,
    request,
    initialGit: INITIAL_GIT,
    codexIdentity: TEST_CODEX,
    runId,
    correlationId,
  });

  const missionDirectory = join(
    dataRoot,
    "missions",
    identitySlug(context.projectId),
    identitySlug(context.missionId),
  );
  const currentRunDirectory = runDirectory(dataRoot, runId);
  const promptFile = join(missionDirectory, "prompt.md");
  const missionFile = join(missionDirectory, "mission.json");
  const expectedPrompt = [
    "# Mission d’exécution NOVA Core",
    "",
    "Projet : NOVA-CORE",
    "Mission : MISSION-FILE-PRODUCER-001",
    "Objectif : Extraire la préparation canonique.",
    "",
    "## Périmètre autorisé",
    "- server/nova-core/**",
    "",
    "## Périmètre interdit",
    "- server/runtime/**",
    "",
    "## Livrables attendus",
    "- MissionFile canonique",
    "",
    "## Conditions d’arrêt",
    "- Aucun changement fonctionnel.",
    "",
    "## Références autorisées",
    "- nova-core.execution.ts",
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
  const expectedExecutionRequest = {
    timeoutMs: 456,
    profile: "BUILD",
    changesExpected: true,
    humanReviewRequired: true,
  };
  const expectedManifest = {
    schemaVersion: "1.0.0",
    missionId: mission.missionId,
    program: mission.projectId,
    lot: "P3-PEOPLE-001D",
    domainLotContract: PEOPLE_LOT_MACHINE_CONTRACT,
    title: mission.objective,
    missionType: mission.missionType,
    profile: "BUILD",
    repository: repositoryRoot,
    expectedBranch: "develop",
    gitPreflight: INITIAL_GIT,
    promptFile,
    workingDirectory: repositoryRoot,
    reportDirectory: currentRunDirectory,
    artifactRoot: dataRoot,
    runDirectory: currentRunDirectory,
    allowedPaths: ["server/nova-core/**"],
    forbiddenPaths: [
      "server/runtime/**",
      "server/protected/**",
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
    ],
    deliverables: mission.deliverables,
    stopCriteria: mission.stopCriteria,
    authorizedReferences: mission.authorizedReferences,
    validations: [{ name: "git-diff-check", type: "gitDiffCheck", required: true }],
    validationPolicy: {
      version: 1,
      source: "actual-git-delta",
      matrix: "server/nova-core/validation-matrix.ts",
      target: "VEEDDA",
    },
    changesExpected: true,
    humanReviewRequired: true,
    enabled: true,
    runId,
    correlationId,
  };
  const expectedManifestText = `${JSON.stringify(expectedManifest, null, 2)}\n`;
  const expectedExecutionRequestText = `${JSON.stringify(expectedExecutionRequest, null, 2)}\n`;
  const expectedBinding = buildRunBinding({
    projectId: context.projectId,
    missionId: context.missionId,
    runId,
    prompt: expectedPrompt,
    executionRequest: expectedExecutionRequest,
    manifest: expectedManifest,
    executionRequestBytes: expectedExecutionRequestText,
    manifestBytes: expectedManifestText,
    branch: "develop",
    head: INITIAL_GIT.head,
    codexVersion: TEST_CODEX.version,
    codexPath: TEST_CODEX.path,
    codexBinaryHash: TEST_CODEX.binaryHash,
    codexConfigPolicy: TEST_CODEX.configPolicy,
  });

  assert.deepEqual(preparation, {
    currentRunDirectory,
    reportDirectory: currentRunDirectory,
    promptFile,
    missionFile,
    runId,
    correlationId,
    profile: "BUILD",
    executionRequest: expectedExecutionRequest,
    binding: expectedBinding,
  });
  assert.equal(commandCalls, 0);
  assert.equal(await readFile(promptFile, "utf8"), expectedPrompt);
  assert.equal(await readFile(join(currentRunDirectory, "prompt.md"), "utf8"), expectedPrompt);
  assert.equal(
    await readFile(join(currentRunDirectory, "manifest.json"), "utf8"),
    expectedManifestText,
  );
  assert.equal(
    await readFile(join(currentRunDirectory, "execution-request.json"), "utf8"),
    expectedExecutionRequestText,
  );
  assert.equal(
    await readFile(join(currentRunDirectory, "run-binding.json"), "utf8"),
    `${JSON.stringify(expectedBinding, null, 2)}\n`,
  );
  assert.equal(
    await readFile(missionFile, "utf8"),
    `${JSON.stringify({ ...expectedManifest, binding: expectedBinding }, null, 2)}\n`,
  );
  assert.equal(expectedBinding.promptHash, sha256(expectedPrompt));
  assert.equal(expectedBinding.manifestHash, sha256(expectedManifestText));
  assert.equal(
    expectedBinding.executionRequestHash,
    sha256(expectedExecutionRequestText),
  );
  assert.deepEqual((await readdir(missionDirectory)).sort(), ["mission.json", "prompt.md"]);
  assert.deepEqual(
    (await readdir(currentRunDirectory)).sort(),
    ["execution-request.json", "manifest.json", "prompt.md", "run-binding.json"],
  );
});

test("le producteur READ_ONLY conserve le baseline et les erreurs de préparation canoniques", async () => {
  const repositoryRoot = await mkdtemp(join(tmpdir(), "nova-mission-file-read-only-"));
  const dataRoot = join(repositoryRoot, "runtime-data");
  const allowedPath = join(repositoryRoot, "authorized-output.txt");
  const calls: Array<{ command: string; args: readonly string[]; cwd: string }> = [];
  const producer = new NovaCoreMissionFileProducer({
    repositoryRoot,
    dataRoot,
    commandRunner: async (command, args, cwd) => {
      calls.push({ command, args, cwd });
      return {
        exitCode: 0,
        stdout: "100644 abcdef 0\ttracked.txt\u0000",
        stderr: "",
      };
    },
    readOnlyAllowedPaths: [allowedPath],
    protectedPaths: [],
    validationTarget: "NOVA_CORE",
  });
  const context = createContext();
  const mission = createMission();
  mission.missionType = "AUDIT";
  const runId = "RUN-MISSION-FILE-READ-ONLY-001";

  const preparation = await producer.produce({
    context,
    mission,
    request: {},
    initialGit: INITIAL_GIT,
    codexIdentity: TEST_CODEX,
    runId,
    correlationId: "CORR-NOVA-CORE-MISSION-FILE-READ-ONLY-001",
  });

  assert.equal(preparation.profile, "READ_ONLY");
  assert.equal(preparation.executionRequest.changesExpected, false);
  assert.deepEqual(calls, [{
    command: "git",
    args: ["ls-files", "--stage", "-z"],
    cwd: repositoryRoot,
  }]);
  const baseline = JSON.parse(
    await readFile(join(preparation.currentRunDirectory, "read-only-baseline.json"), "utf8"),
  ) as Record<string, unknown>;
  assert.match(String(baseline.capturedAt), /^\d{4}-\d{2}-\d{2}T/);
  delete baseline.capturedAt;
  assert.deepEqual(baseline, {
    schemaVersion: "1.0.0",
    repositoryRoot,
    branch: INITIAL_GIT.branch,
    head: INITIAL_GIT.head,
    worktreeStatus: INITIAL_GIT.worktreeStatus,
    trackedIndex: "100644 abcdef 0\ttracked.txt\u0000",
    allowedPaths: [allowedPath],
  });

  await assert.rejects(
    () => producer.produce({
      context,
      mission,
      request: { profile: "BUILD" },
      initialGit: INITIAL_GIT,
      codexIdentity: TEST_CODEX,
      runId: "RUN-INVALID-READ-ONLY",
      correlationId: "CORR-INVALID-READ-ONLY",
    }),
    (error) => error instanceof NovaCoreExecutionError &&
      error.code === "NOVA_CORE_READ_ONLY_PROFILE_REQUIRED",
  );

  await assert.rejects(
    () => producer.produce({
      context,
      mission,
      request: { expectedBranch: "main" },
      initialGit: INITIAL_GIT,
      codexIdentity: TEST_CODEX,
      runId: "RUN-INVALID-BRANCH",
      correlationId: "CORR-INVALID-BRANCH",
    }),
    (error) => error instanceof NovaCoreExecutionError &&
      error.code === "NOVA_CORE_GIT_BRANCH_MISMATCH" &&
      error.message ===
        "La branche active develop ne correspond pas à la branche attendue main.",
  );

  const failingBaselineProducer = new NovaCoreMissionFileProducer({
    repositoryRoot,
    dataRoot,
    commandRunner: async () => ({
      exitCode: 1,
      stdout: "baseline stdout",
      stderr: "baseline stderr",
    }),
    readOnlyAllowedPaths: [allowedPath],
    protectedPaths: [],
    validationTarget: "NOVA_CORE",
  });
  await assert.rejects(
    () => failingBaselineProducer.produce({
      context,
      mission,
      request: {},
      initialGit: INITIAL_GIT,
      codexIdentity: TEST_CODEX,
      runId: "RUN-BASELINE-UNAVAILABLE",
      correlationId: "CORR-BASELINE-UNAVAILABLE",
    }),
    (error) => error instanceof NovaCoreExecutionError &&
      error.code === "NOVA_CORE_READ_ONLY_BASELINE_UNAVAILABLE" &&
      error.details === "baseline stderr\nbaseline stdout",
  );
});

function createContext(): RuntimeContext {
  return {
    projectId: "NOVA-CORE",
    missionId: "MISSION-FILE-PRODUCER-001",
    contextId: "CTX-MISSION-FILE-PRODUCER-001",
    objective: "Extraire la préparation canonique.",
    scope: {
      allowed: ["server/nova-core/**"],
      forbidden: ["server/runtime/**"],
    },
    deliverables: ["MissionFile canonique"],
    stopCriteria: ["Aucun changement fonctionnel."],
    authorizedReferences: ["nova-core.execution.ts"],
    state: "LOCKED",
  };
}

function createMission(): RuntimeMission {
  return {
    ...createContext(),
    missionType: "IMPLEMENTATION",
    authority: "HUMAN_OWNER",
    assignedAgentId: "NOVA-DEVELOPER",
    lockId: "LOCK-MISSION-FILE-PRODUCER-001",
    runId: "RUN-MISSION-FILE-PRODUCER-001",
    contextId: "CTX-MISSION-FILE-PRODUCER-001",
    reportId: null,
    updatedAt: new Date(0).toISOString(),
  };
}

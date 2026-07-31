import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import type {
  RuntimeContext,
  RuntimeMission,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import {
  NovaCoreExecutionEngine,
  NovaCoreExecutionError,
  runCommand,
  type NovaCoreCommandRunner,
} from "./nova-core.execution.js";
import {
  NovaCoreMissionFileProducer,
  type NovaCoreMissionFileProducerContract,
} from "./nova-core.mission-file-producer.js";
import { fingerprintReport, identitySlug, runDirectory, sha256 } from "./run-binding.js";

const TEST_CODEX = {
  version: "0.144.1",
  path: "C:/tools/codex.cmd",
  binaryHash: "c".repeat(64),
  configPolicy: "EXPLICIT_RUNTIME_PROFILE" as const,
};

test("le moteur copié prépare une mission NOVA autonome et récupère le rapport officiel", async () => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-execution-"));
  const dataRoot = join(repository, ".nova-data", "execution");
  const runtimeDirectory = join(repository, "tools", "nova-core-runtime");
  const calls: Array<{ command: string; args: readonly string[]; workingDirectory: string }> = [];

  const commandRunner: NovaCoreCommandRunner = async (command, args, workingDirectory) => {
    calls.push({ command, args, workingDirectory });
    if (command === "git") {
      return gitPreflightResult(args, repository, "develop");
    }

    const missionFile = args[args.indexOf("-MissionFile") + 1];
    const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
      reportDirectory: string;
      binding: Record<string, string>;
    };
    const runDirectory = join(manifest.reportDirectory, "bootstrap-test");
    await mkdir(runDirectory, { recursive: true });
    const changedPath = "apps/nova-web/src/features/work/WorkOverviewPage.tsx";
    const changedContent = "export const workOverview = true;\n";
    await mkdir(dirname(join(repository, changedPath)), { recursive: true });
    await writeFile(join(repository, changedPath), changedContent, "utf8");
    const officialReport = {
        ReportFingerprint: null as string | null,
        Status: "READY_FOR_REVIEW",
        Binding: manifest.binding,
        Codex: { Status: "SUCCESS", ExitCode: 0, Version: TEST_CODEX.version },
        Git: {
          Created: [],
          Modified: ["apps/nova-web/src/features/work/WorkOverviewPage.tsx"],
          Deleted: [],
          Renamed: [],
          BranchChanged: false,
          HeadChanged: false,
        },
        OutputEvidence: {
          entries: [{ path: changedPath, sha256: sha256(changedContent), kind: "file", status: "VALID" }],
        },
        Validations: [
          { Type: "pathScope", Name: "scope:work-page", Passed: true, Required: true },
          { Type: "namedCommand", Name: "nova-web-tests", Passed: true, Required: true },
          { Type: "namedCommand", Name: "nova-web-typecheck", Passed: true, Required: true },
          { Type: "namedCommand", Name: "nova-web-build", Passed: true, Required: true },
        ],
        Errors: [],
      };
    officialReport.ReportFingerprint = fingerprintReport(officialReport).toUpperCase();
    await writeFile(join(runDirectory, "official-report.json"), JSON.stringify(officialReport), "utf8");
    return { exitCode: 0, stdout: "NOVA Core runtime completed", stderr: "" };
  };

  const canonicalProducer = new NovaCoreMissionFileProducer({
    repositoryRoot: repository,
    dataRoot,
    commandRunner,
    readOnlyAllowedPaths: [],
    protectedPaths: [],
    validationTarget: "NOVA_CORE",
  });
  let producerCalls = 0;
  const delegatedProducer: NovaCoreMissionFileProducerContract = {
    async produce(input) {
      producerCalls += 1;
      return canonicalProducer.produce(input);
    },
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot,
    runtimeDirectory,
    powershellCommand: "powershell.exe",
    commandRunner,
    codexInspector: async () => TEST_CODEX,
    missionFileProducer: delegatedProducer,
  });
  const mission = createMission();
  const report = await engine.execute(createContext(), mission);

  assert.equal(calls[0]?.command, "git");
  assert.equal(producerCalls, 1);
  const invocationCall = calls.find((call) => call.command === "powershell.exe");
  assert.ok(invocationCall);
  assert.ok(invocationCall.args.includes(join(runtimeDirectory, "Invoke-NovaCoreMission.ps1")));
  assert.deepEqual(report.filesChanged, [
    "apps/nova-web/src/features/work/WorkOverviewPage.tsx",
  ]);
  assert.equal(report.scopeConfirmed, true);
  assert.equal(report.errors.length, 0);

  const missionFile = join(
    dataRoot,
    "missions",
    identitySlug("NOVA-CORE"),
    identitySlug("UX-WORK-HEADER-001"),
    "mission.json",
  );
  const manifestText = await readFile(missionFile, "utf8");
  const manifest = JSON.parse(manifestText) as {
    program: string;
    profile: string;
    repository: string;
    expectedBranch: string;
    allowedPaths: string[];
    validations: Array<{ command?: string }>;
  };
  assert.equal(manifest.program, "NOVA-CORE");
  assert.equal(manifest.profile, "FAST");
  assert.equal(manifest.repository, repository);
  assert.equal(manifest.expectedBranch, "develop");
  assert.deepEqual(manifest.allowedPaths, ["apps/nova-web/src/features/work/**"]);
  assert.deepEqual(manifest.validations.map((validation) => validation.command).filter(Boolean), []);
  assert.doesNotMatch(manifestText, /CEREBRAU|VEEDDA/);
});

test("configurable timeout terminates execution with TIMEOUT", async () => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-timeout-"));
  const runner: NovaCoreCommandRunner = async (command, args, _cwd, options) => {
    if (command === "git") return gitPreflightResult(args, repository);
    return waitForAbort(options?.signal);
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot: join(repository, ".nova-data"),
    commandRunner: runner,
    defaultTimeoutMs: 20,
    codexInspector: async () => TEST_CODEX,
  });

  await assert.rejects(
    () => engine.execute(createContext(), createMission()),
    (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_EXECUTION_TIMEOUT",
  );
});

test("controlled cancellation terminates execution with CANCELLED", async () => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-cancel-"));
  let started!: () => void;
  const processStarted = new Promise<void>((resolvePromise) => { started = resolvePromise; });
  const runner: NovaCoreCommandRunner = async (command, args, _cwd, options) => {
    if (command === "git") return gitPreflightResult(args, repository);
    started();
    return waitForAbort(options?.signal);
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot: join(repository, ".nova-data"),
    commandRunner: runner,
    codexInspector: async () => TEST_CODEX,
  });
  const mission = createMission();
  const execution = engine.execute(createContext(), mission);
  await processStarted;
  assert.ok(mission.runId);
  assert.equal(engine.cancel(mission.runId), true);
  await assert.rejects(
    () => execution,
    (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_EXECUTION_CANCELLED",
  );
});

test("official report with a stale run binding is rejected", async () => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-stale-binding-"));
  const dataRoot = join(repository, ".nova-data");
  const runner: NovaCoreCommandRunner = async (command, args) => {
    if (command === "git") return gitPreflightResult(args, repository);
    const missionFile = args[args.indexOf("-MissionFile") + 1];
    const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
      reportDirectory: string;
      binding: Record<string, string>;
    };
    const officialReport = {
        ReportFingerprint: null as string | null,
        Status: "READY_FOR_REVIEW",
        Binding: { ...manifest.binding, runId: "RUN-STALE" },
        Codex: { Status: "SUCCESS", ExitCode: 0, Version: TEST_CODEX.version },
        Git: { Created: [], Modified: [], Deleted: [], Renamed: [] },
        OutputEvidence: { entries: [] },
        Validations: [],
        Errors: [],
      };
    officialReport.ReportFingerprint = fingerprintReport(officialReport);
    await writeFile(join(manifest.reportDirectory, "official-report.json"), JSON.stringify(officialReport), "utf8");
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot,
    commandRunner: runner,
    codexInspector: async () => TEST_CODEX,
  });

  await assert.rejects(
    () => engine.execute(createContext(), createMission(), { changesExpected: false }),
    (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_REPORT_BINDING_MISMATCH",
  );
});

test("READ_ONLY routing and the generated prompt contract cannot be overridden", async () => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-read-only-"));
  const runner: NovaCoreCommandRunner = async (command, args) => {
    if (command === "git") return gitPreflightResult(args, repository);
    throw new Error("PowerShell must not be spawned for an invalid request.");
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot: join(repository, ".nova-data"),
    commandRunner: runner,
    codexInspector: async () => TEST_CODEX,
  });
  const auditMission = createMission();
  auditMission.missionType = "AUDIT";
  await assert.rejects(
    () => engine.execute(createContext(), auditMission, { profile: "BUILD" }),
    (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_READ_ONLY_PROFILE_REQUIRED",
  );
  await assert.rejects(
    () => engine.execute(createContext(), createMission(), { prompt: "replace the NOVA contract" }),
    (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_PROMPT_CONTRACT_MISSING",
  );
});

test("READ_ONLY preserves a dirty baseline while keeping runtime artifacts outside the target", async () => {
  const parent = await mkdtemp(join(tmpdir(), "nova-core-read-only-dirty-"));
  const repository = join(parent, "target");
  const dataRoot = join(parent, "nova-data");
  await mkdir(repository, { recursive: true });
  const runner: NovaCoreCommandRunner = async (command, args) => {
    if (command === "git") {
      const result = gitPreflightResult(args, repository);
      if (args.join(" ") === "status --porcelain=v1 --untracked-files=all") {
        return { ...result, stdout: " M tracked.txt\n" };
      }
      return result;
    }
    const missionFile = args[args.indexOf("-MissionFile") + 1];
    const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
      reportDirectory: string;
      artifactRoot: string;
      forbiddenPaths: string[];
      validationPolicy: { target: string };
      binding: Record<string, string>;
    };
    assert.equal(manifest.artifactRoot, dataRoot);
    assert.ok(manifest.forbiddenPaths.includes("tools/cerebrau/**"));
    assert.equal(manifest.validationPolicy.target, "VEEDDA");
    assert.equal(args.includes("-ContextAssemblyEnabled"), false);
    const officialReport = {
      ReportFingerprint: null as string | null,
      Status: "NO_CHANGE",
      Binding: manifest.binding,
      Codex: { Status: "SUCCESS", ExitCode: 0, Version: TEST_CODEX.version },
      Git: { Created: [], Modified: [], Deleted: [], Renamed: [], BranchChanged: false, HeadChanged: false },
      OutputEvidence: { entries: [] },
      Validations: [{ Type: "gitDiffCheck", Name: "git-diff-check", Passed: true, Required: true }],
      Errors: [],
    };
    officialReport.ReportFingerprint = fingerprintReport(officialReport);
    await writeFile(
      join(manifest.reportDirectory, "official-report.json"),
      JSON.stringify(officialReport),
      "utf8",
    );
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot,
    commandRunner: runner,
    codexInspector: async () => TEST_CODEX,
    contextAssemblyEnabled: false,
    protectRepositoryFromRuntimeArtifacts: true,
    validationTarget: "VEEDDA",
    protectedPaths: ["tools/cerebrau/**"],
  });
  const auditMission = createMission();
  auditMission.missionType = "AUDIT";
  const report = await engine.execute(createContext(), auditMission, {});
  assert.deepEqual(report.filesChanged, []);
  assert.equal(report.repositoryRoot, repository);
  assert.throws(
    () => new NovaCoreExecutionEngine({
      repositoryRoot: repository,
      dataRoot: join(repository, ".nova-data"),
      protectRepositoryFromRuntimeArtifacts: true,
    }),
    (error) => error instanceof NovaCoreExecutionError &&
      error.code === "NOVA_CORE_RUNTIME_ARTIFACT_ROOT_INSIDE_TARGET",
  );
});

test("READ_ONLY turns every unauthorized write into a terminal execution error", async () => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-read-only-write-"));
  const runner: NovaCoreCommandRunner = async (command, args) => {
    if (command === "git") return gitPreflightResult(args, repository);
    const missionFile = args[args.indexOf("-MissionFile") + 1];
    const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
      reportDirectory: string;
      binding: Record<string, string>;
    };
    const changedPath = "audit.txt";
    const changedContent = "unauthorized write\n";
    await writeFile(join(repository, changedPath), changedContent, "utf8");
    const officialReport = {
      ReportFingerprint: null as string | null,
      Status: "READY_FOR_REVIEW",
      Binding: manifest.binding,
      Codex: { Status: "SUCCESS", ExitCode: 0, Version: TEST_CODEX.version },
      Git: {
        Created: [changedPath],
        Modified: [],
        Deleted: [],
        Renamed: [],
        BranchChanged: false,
        HeadChanged: false,
      },
      OutputEvidence: {
        entries: [{ path: changedPath, sha256: sha256(changedContent), kind: "file", status: "VALID" }],
      },
      Validations: [{ Type: "pathScope", Name: "scope:audit", Passed: true, Required: true }],
      Errors: [],
    };
    officialReport.ReportFingerprint = fingerprintReport(officialReport);
    await mkdir(join(manifest.reportDirectory, "result"), { recursive: true });
    await writeFile(join(manifest.reportDirectory, "result", "official-report.json"), JSON.stringify(officialReport), "utf8");
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot: join(repository, ".nova-data"),
    commandRunner: runner,
    codexInspector: async () => TEST_CODEX,
  });
  const auditMission = createMission();
  auditMission.missionType = "AUDIT";
  auditMission.scope.allowed = ["audit.txt"];
  const auditContext = createContext();
  auditContext.scope.allowed = ["audit.txt"];
  await assert.rejects(
    () => engine.execute(auditContext, auditMission, { changesExpected: true }),
    (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_READ_ONLY_VIOLATION",
  );
  const allowedEngine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot: join(repository, ".nova-data-allowed"),
    commandRunner: runner,
    codexInspector: async () => TEST_CODEX,
    readOnlyAllowedPaths: ["audit.txt"],
  });
  const allowedMission = createMission();
  allowedMission.missionType = "AUDIT";
  allowedMission.scope.allowed = ["audit.txt"];
  const allowedContext = createContext();
  allowedContext.scope.allowed = ["audit.txt"];
  const allowedReport = await allowedEngine.execute(allowedContext, allowedMission, { changesExpected: true });
  assert.deepEqual(allowedReport.filesChanged, ["audit.txt"]);
  const executionRequest = JSON.parse(
    await readFile(allowedReport.executionRequestPath!, "utf8"),
  ) as { profile: string; changesExpected: boolean };
  assert.deepEqual(executionRequest, {
    changesExpected: false,
    profile: "READ_ONLY",
    humanReviewRequired: true,
  });
  const readOnlyBaseline = JSON.parse(
    await readFile(join(dirname(allowedReport.executionRequestPath!), "read-only-baseline.json"), "utf8"),
  ) as { head: string; worktreeStatus: string; allowedPaths: string[] };
  assert.equal(readOnlyBaseline.head, "a".repeat(40));
  assert.equal(readOnlyBaseline.worktreeStatus, "");
  assert.deepEqual(readOnlyBaseline.allowedPaths, [resolve(repository, "audit.txt")]);
  assert.throws(
    () => new NovaCoreExecutionEngine({
      repositoryRoot: repository,
      dataRoot: join(repository, ".nova-data-invalid"),
      commandRunner: runner,
      codexInspector: async () => TEST_CODEX,
      readOnlyAllowedPaths: ["../outside.txt"],
    }),
    (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_READ_ONLY_ALLOWED_PATH_INVALID",
  );
});

test("READ_ONLY observes real deletions and renames independently of the submitted report", async () => {
  for (const scenario of ["delete", "rename"] as const) {
    const parent = await mkdtemp(join(tmpdir(), `nova-read-only-${scenario}-`));
    const repository = join(parent, "repository");
    const dataRoot = join(parent, "data");
    await mkdir(repository, { recursive: true });
    for (const args of [
      ["init"],
      ["config", "user.email", "nova@example.invalid"],
      ["config", "user.name", "NOVA Test"],
    ]) {
      assert.equal((await runCommand("git", args, repository)).exitCode, 0);
    }
    await writeFile(join(repository, "tracked.txt"), "baseline\n", "utf8");
    assert.equal((await runCommand("git", ["add", "tracked.txt"], repository)).exitCode, 0);
    assert.equal((await runCommand("git", ["commit", "-m", "baseline"], repository)).exitCode, 0);

    const runner: NovaCoreCommandRunner = async (command, args, workingDirectory, options) => {
      if (command === "git") return runCommand(command, args, workingDirectory, options);
      const missionFile = args[args.indexOf("-MissionFile") + 1];
      const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
        reportDirectory: string;
        binding: Record<string, string>;
      };
      if (scenario === "delete") await unlink(join(repository, "tracked.txt"));
      else await rename(join(repository, "tracked.txt"), join(repository, "renamed.txt"));
      const officialReport = {
        ReportFingerprint: null as string | null,
        Status: "READY_FOR_REVIEW",
        Binding: manifest.binding,
        Codex: { Status: "SUCCESS", ExitCode: 0, Version: TEST_CODEX.version },
        Git: { Created: [], Modified: [], Deleted: [], Renamed: [], BranchChanged: false, HeadChanged: false },
        OutputEvidence: { entries: [] },
        Validations: [],
        Errors: [],
      };
      officialReport.ReportFingerprint = fingerprintReport(officialReport);
      await mkdir(join(manifest.reportDirectory, "result"), { recursive: true });
      await writeFile(
        join(manifest.reportDirectory, "result", "official-report.json"),
        JSON.stringify(officialReport),
        "utf8",
      );
      return { exitCode: 0, stdout: "", stderr: "" };
    };
    const engine = new NovaCoreExecutionEngine({
      repositoryRoot: repository,
      dataRoot,
      commandRunner: runner,
      codexInspector: async () => TEST_CODEX,
    });
    const auditMission = createMission();
    auditMission.missionType = "AUDIT";
    auditMission.scope.allowed = ["tracked.txt", "renamed.txt"];
    const auditContext = createContext();
    auditContext.scope.allowed = ["tracked.txt", "renamed.txt"];
    await assert.rejects(
      () => engine.execute(auditContext, auditMission),
      (error) => error instanceof NovaCoreExecutionError && error.code === "NOVA_CORE_READ_ONLY_VIOLATION",
    );
  }
});

test("recovery inspection observes a real process, Git worktree and run artifacts", async (context) => {
  const parent = await mkdtemp(join(tmpdir(), "nova-recovery-real-"));
  const repository = join(parent, "repository");
  const dataRoot = join(parent, "data");
  await mkdir(repository, { recursive: true });
  for (const args of [
    ["init"],
    ["config", "user.email", "nova@example.invalid"],
    ["config", "user.name", "NOVA Test"],
  ]) {
    const result = await runCommand("git", args, repository);
    assert.equal(result.exitCode, 0);
  }
  await writeFile(join(repository, "tracked.txt"), "baseline\n", "utf8");
  assert.equal((await runCommand("git", ["add", "tracked.txt"], repository)).exitCode, 0);
  assert.equal((await runCommand("git", ["commit", "-m", "baseline"], repository)).exitCode, 0);

  const runId = "RUN-RECOVERY-REAL";
  const currentRunDirectory = runDirectory(dataRoot, runId);
  await mkdir(currentRunDirectory, { recursive: true });
  const promptArtifact = "prompt";
  const manifestArtifact = "{}\n";
  const executionRequestArtifact = "{}\n";
  await writeFile(join(currentRunDirectory, "prompt.md"), promptArtifact, "utf8");
  await writeFile(join(currentRunDirectory, "manifest.json"), manifestArtifact, "utf8");
  await writeFile(join(currentRunDirectory, "execution-request.json"), executionRequestArtifact, "utf8");
  await writeFile(
    join(currentRunDirectory, "run-binding.json"),
    JSON.stringify({
      promptHash: sha256(promptArtifact),
      manifestHash: sha256(manifestArtifact),
      executionRequestHash: sha256(executionRequestArtifact),
    }),
    "utf8",
  );
  const child = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"], {
    cwd: repository,
    windowsHide: true,
    stdio: "ignore",
  });
  context.after(() => {
    try { child.kill("SIGKILL"); } catch { /* process already stopped */ }
  });
  await writeFile(
    join(currentRunDirectory, "process.json"),
    JSON.stringify({ processId: child.pid, runId, repositoryRoot: repository }),
    "utf8",
  );
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot,
    codexInspector: async () => TEST_CODEX,
  });
  const active = await engine.inspectRecovery(runId);
  assert.equal(active.processAlive, true);
  assert.equal(active.worktreeModified, false);
  assert.equal(active.reportPresent, false);
  assert.equal(active.artifactsValid, true);

  await writeFile(join(repository, "tracked.txt"), "modified\n", "utf8");
  assert.equal((await engine.inspectRecovery(runId)).worktreeModified, true);
  await writeFile(join(currentRunDirectory, "official-report.json"), "{}\n", "utf8");
  assert.equal((await engine.inspectRecovery(runId)).reportPresent, true);

  child.kill("SIGKILL");
  await once(child, "close");
  assert.equal((await engine.inspectRecovery(runId)).processAlive, false);

  await writeFile(join(currentRunDirectory, "process.json"), "{\"processId\":\"invalid\"}", "utf8");
  assert.equal((await engine.inspectRecovery(runId)).processAlive, "UNKNOWN");

  const gitDirectory = join(repository, ".git");
  const hiddenGitDirectory = join(repository, ".git-unavailable");
  await rename(gitDirectory, hiddenGitDirectory);
  assert.equal((await engine.inspectRecovery(runId)).worktreeModified, "UNKNOWN");
  await rename(hiddenGitDirectory, gitDirectory);
});

function createMission(): RuntimeMission {
  return {
    projectId: "NOVA-CORE",
    missionId: "UX-WORK-HEADER-001",
    missionType: "UX",
    objective: "Corriger le header de la page Work sans régression.",
    authority: "HUMAN_OWNER",
    scope: {
      allowed: ["apps/nova-web/src/features/work/**"],
      forbidden: ["apps/nova-web/src/features/home/**"],
    },
    deliverables: ["Header conforme à la référence"],
    stopCriteria: ["Tests, typecheck et build réussis."],
    authorizedReferences: ["WORK-PAGE 1.png"],
    priority: 10,
    state: "LOCKED",
    assignedAgentId: "NOVA-DEVELOPER",
    lockId: "LOCK-NOVA-CORE-UX-WORK-HEADER-001",
    runId: null,
    contextId: null,
    reportId: null,
    updatedAt: new Date(0).toISOString(),
  };
}

function gitPreflightResult(
  args: readonly string[],
  repository: string,
  branch = "main",
): { exitCode: number; stdout: string; stderr: string } {
  const key = args.join(" ");
  if (key === "--version") return { exitCode: 0, stdout: "git version 2.50.1\n", stderr: "" };
  if (key === "rev-parse --is-inside-work-tree") return { exitCode: 0, stdout: "true\n", stderr: "" };
  if (key === "rev-parse --show-toplevel") return { exitCode: 0, stdout: `${repository}\n`, stderr: "" };
  if (key === "rev-parse --git-path index.lock") return { exitCode: 0, stdout: ".git/index.lock\n", stderr: "" };
  if (key === "rev-parse --verify HEAD") return { exitCode: 0, stdout: `${"a".repeat(40)}\n`, stderr: "" };
  if (key === "symbolic-ref --quiet --short HEAD") return { exitCode: 0, stdout: `${branch}\n`, stderr: "" };
  if (key === "status --porcelain=v1 --untracked-files=all") return { exitCode: 0, stdout: "", stderr: "" };
  if (key === "diff --name-only --diff-filter=U") return { exitCode: 0, stdout: "", stderr: "" };
  if (key === "ls-files --stage -z") return { exitCode: 0, stdout: "", stderr: "" };
  if (key === "submodule status --recursive") return { exitCode: 0, stdout: "", stderr: "" };
  return { exitCode: 1, stdout: "", stderr: `unexpected git command: ${key}` };
}

function createContext(): RuntimeContext {
  return {
    projectId: "NOVA-CORE",
    missionId: "UX-WORK-HEADER-001",
    contextId: "CTX-NOVA-CORE-UX-WORK-HEADER-001",
    objective: "Corriger le header de la page Work sans régression.",
    scope: {
      allowed: ["apps/nova-web/src/features/work/**"],
      forbidden: ["apps/nova-web/src/features/home/**"],
    },
    deliverables: ["Header conforme à la référence"],
    stopCriteria: ["Tests, typecheck et build réussis."],
    authorizedReferences: ["WORK-PAGE 1.png"],
    state: "LOCKED",
    lockScope: ["apps/nova-web/src/features/work/**"],
  };
}

function waitForAbort(signal?: AbortSignal): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
  terminationReason: "CANCELLED" | "TIMEOUT";
}> {
  return new Promise((resolvePromise) => {
    const complete = () => resolvePromise({
      exitCode: -1,
      stdout: "",
      stderr: "",
      terminationReason: signal?.reason === "TIMEOUT" ? "TIMEOUT" : "CANCELLED",
    });
    if (signal?.aborted) complete();
    else signal?.addEventListener("abort", complete, { once: true });
  });
}

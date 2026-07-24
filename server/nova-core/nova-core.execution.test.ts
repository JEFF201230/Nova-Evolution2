import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type {
  RuntimeContext,
  RuntimeMission,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import {
  NovaCoreExecutionEngine,
  type NovaCoreCommandRunner,
} from "./nova-core.execution.js";

test("le moteur copié prépare une mission NOVA autonome et récupère le rapport officiel", async () => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-execution-"));
  const dataRoot = join(repository, ".nova-data", "execution");
  const runtimeDirectory = join(repository, "tools", "nova-core-runtime");
  const calls: Array<{ command: string; args: readonly string[]; workingDirectory: string }> = [];

  const commandRunner: NovaCoreCommandRunner = async (command, args, workingDirectory) => {
    calls.push({ command, args, workingDirectory });
    if (command === "git") {
      return { exitCode: 0, stdout: "develop\n", stderr: "" };
    }

    const missionFile = args[args.indexOf("-MissionFile") + 1];
    const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
      reportDirectory: string;
    };
    const runDirectory = join(manifest.reportDirectory, "bootstrap-test");
    await mkdir(runDirectory, { recursive: true });
    await writeFile(
      join(runDirectory, "official-report.json"),
      JSON.stringify({
        Status: "READY_FOR_REVIEW",
        Codex: { Status: "SUCCESS", ExitCode: 0 },
        Git: {
          Created: [],
          Modified: ["apps/nova-web/src/features/work/WorkOverviewPage.tsx"],
          Deleted: [],
          Renamed: [],
          BranchChanged: false,
          HeadChanged: false,
        },
        Validations: [
          { Type: "pathScope", Name: "scope:work-page", Passed: true, Required: true },
          { Type: "namedCommand", Name: "nova-web-tests", Passed: true, Required: true },
        ],
        Errors: [],
      }),
      "utf8",
    );
    return { exitCode: 0, stdout: "NOVA Core runtime completed", stderr: "" };
  };

  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot,
    runtimeDirectory,
    powershellCommand: "powershell.exe",
    commandRunner,
  });
  const mission = createMission();
  const report = await engine.execute(createContext(), mission);

  assert.equal(calls[0]?.command, "git");
  assert.equal(calls[1]?.command, "powershell.exe");
  assert.ok(calls[1]?.args.includes(join(runtimeDirectory, "Invoke-NovaCoreMission.ps1")));
  assert.deepEqual(report.filesChanged, [
    "apps/nova-web/src/features/work/WorkOverviewPage.tsx",
  ]);
  assert.equal(report.scopeConfirmed, true);
  assert.equal(report.errors.length, 0);

  const missionFile = join(
    dataRoot,
    "missions",
    "NOVA-CORE",
    "UX-WORK-HEADER-001",
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
  assert.deepEqual(
    manifest.validations.map((validation) => validation.command).filter(Boolean),
    ["novaWebTests", "novaWebTypecheck", "novaWebBuild"],
  );
  assert.doesNotMatch(manifestText, /CEREBRAU|VEEDDA/);
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

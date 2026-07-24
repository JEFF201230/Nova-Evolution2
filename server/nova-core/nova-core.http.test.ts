import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  NovaCoreExecutionEngine,
  type NovaCoreCommandRunner,
} from "./nova-core.execution.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";

test("l’API NOVA expose le parcours complet d’une mission", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "nova-core-http-"));
  const core = await NovaCoreService.open(join(directory, "runtime.json"));
  const server = createNovaCoreHttpServer(core);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => server.close());

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json() as { status: string }).status, "ok");

  const interfaceResponse = await fetch(`${baseUrl}/`);
  assert.equal(interfaceResponse.status, 200);
  assert.match(await interfaceResponse.text(), /NOVA Core/);

  const createResponse = await post(`${baseUrl}/api/v1/missions`, {
    projectId: "CEREBRAU",
    missionId: "HTTP-001",
    missionType: "DEVELOPMENT",
    objective: "Tester le parcours HTTP.",
    authority: "HUMAN_OWNER",
    scope: { allowed: ["server/nova-core"], forbidden: ["secrets"] },
    deliverables: ["API testée"],
    stopCriteria: ["Le parcours arrive à la validation humaine."],
    authorizedReferences: [],
  });
  assert.equal(createResponse.status, 201);

  const assignResponse = await post(`${baseUrl}/api/v1/missions/CEREBRAU/HTTP-001/assign`, {});
  assert.equal(assignResponse.status, 200);

  const evidenceResponse = await post(`${baseUrl}/api/v1/missions/CEREBRAU/HTTP-001/evidence`, {
    deliverables: ["API testée"],
    filesChanged: ["server/nova-core/nova-core.http.ts"],
    checks: ["test HTTP"],
    blockers: [],
    errors: [],
    scopeConfirmed: true,
  });
  assert.equal(evidenceResponse.status, 200);

  const technicalResponse = await post(
    `${baseUrl}/api/v1/missions/CEREBRAU/HTTP-001/technical-accept`,
    {},
  );
  assert.equal(technicalResponse.status, 200);

  const approvalResponse = await post(`${baseUrl}/api/v1/missions/CEREBRAU/HTTP-001/approve`, {});
  assert.equal(approvalResponse.status, 200);

  const missionResponse = await fetch(`${baseUrl}/api/v1/missions/CEREBRAU/HTTP-001`);
  assert.equal(missionResponse.status, 200);
  const missionBody = await missionResponse.json() as {
    mission: { state: string };
    events: Array<{ eventName: string }>;
  };
  assert.equal(missionBody.mission.state, "ACCEPTED");
  assert.equal(missionBody.events.at(-1)?.eventName, "LockReleased");
});

test("l’API lance le moteur NOVA Core autonome et enregistre ses preuves", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-http-execution-"));
  const dataRoot = join(repository, ".nova-data", "execution");
  const commandRunner: NovaCoreCommandRunner = async (command, args) => {
    if (command === "git") {
      return { exitCode: 0, stdout: "develop\n", stderr: "" };
    }
    const missionFile = args[args.indexOf("-MissionFile") + 1];
    const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
      reportDirectory: string;
    };
    const runDirectory = join(manifest.reportDirectory, "bootstrap-http-test");
    await mkdir(runDirectory, { recursive: true });
    await writeFile(
      join(runDirectory, "official-report.json"),
      JSON.stringify({
        Status: "READY_FOR_REVIEW",
        Codex: { Status: "SUCCESS", ExitCode: 0 },
        Git: {
          Created: [],
          Modified: ["server/nova-core/nova-core.http.ts"],
          Deleted: [],
          Renamed: [],
          BranchChanged: false,
          HeadChanged: false,
        },
        Validations: [
          { Type: "pathScope", Name: "scope:http", Passed: true, Required: true },
          { Type: "namedCommand", Name: "nova-core-tests", Passed: true, Required: true },
        ],
        Errors: [],
      }),
      "utf8",
    );
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot,
    runtimeDirectory: join(repository, "tools", "nova-core-runtime"),
    powershellCommand: "powershell.exe",
    commandRunner,
  });
  const core = await NovaCoreService.open(join(repository, "runtime.json"), engine);
  const server = createNovaCoreHttpServer(core);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => server.close());

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  await post(`${baseUrl}/api/v1/missions`, {
    projectId: "NOVA-CORE",
    missionId: "EXEC-001",
    missionType: "DEVELOPMENT",
    objective: "Exécuter une mission avec le moteur NOVA Core autonome.",
    authority: "HUMAN_OWNER",
    scope: { allowed: ["server/nova-core/**"], forbidden: ["secrets/**"] },
    deliverables: ["Moteur exécuté"],
    stopCriteria: ["Le rapport officiel est enregistré."],
    authorizedReferences: [],
  });

  const executeResponse = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/execute`,
    {},
  );
  assert.equal(executeResponse.status, 200);
  const executeBody = await executeResponse.json() as {
    mission: { state: string };
    report: { filesChanged: string[]; scopeConfirmed: boolean };
  };
  assert.equal(executeBody.mission.state, "SUBMITTED");
  assert.deepEqual(executeBody.report.filesChanged, ["server/nova-core/nova-core.http.ts"]);
  assert.equal(executeBody.report.scopeConfirmed, true);
});

async function post(url: string, body: object): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

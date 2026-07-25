import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  NovaCoreExecutionEngine,
  type NovaCoreCommandRunner,
} from "./nova-core.execution.js";
import { createNovaCoreHttpServer } from "./nova-core.http.js";
import { NovaCoreService } from "./nova-core.service.js";
import {
  createCertificationAttestation,
  verifyMissionCertificate,
  type CertificationAuthority,
  type MissionCertificate,
} from "./mission-certification.js";
import { fingerprintReport, sha256 } from "./run-binding.js";

const TEST_CODEX = {
  version: "0.144.1",
  path: "C:/tools/codex.cmd",
  binaryHash: "c".repeat(64),
  configPolicy: "EXPLICIT_RUNTIME_PROFILE" as const,
};
const TEST_ATTESTATION_KEY = "nova-http-journal-attestation-key-003";

test("l’API NOVA expose le parcours complet d’une mission", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "nova-core-http-"));
  const core = await NovaCoreService.open(join(directory, "runtime.json"), undefined, { journalAttestationKey: TEST_ATTESTATION_KEY });
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
  assert.equal(approvalResponse.status, 410);

  const missionResponse = await fetch(`${baseUrl}/api/v1/missions/CEREBRAU/HTTP-001`);
  assert.equal(missionResponse.status, 200);
  const missionBody = await missionResponse.json() as {
    mission: { state: string };
    events: Array<{ eventName: string }>;
  };
  assert.equal(missionBody.mission.state, "HUMAN_VALIDATION");
  assert.equal(missionBody.events.at(-1)?.eventName, "TechnicalValidationAccepted");
});

test("l’API lance le moteur NOVA Core autonome et enregistre ses preuves", async (context) => {
  const repository = await mkdtemp(join(tmpdir(), "nova-core-http-execution-"));
  const dataRoot = join(repository, ".nova-data", "execution");
  let failureMode = false;
  const commandRunner: NovaCoreCommandRunner = async (command, args, _workingDirectory, runnerOptions) => {
    if (command === "git") {
      return gitPreflightResult(args, repository, "develop");
    }
    runnerOptions?.onOutput?.("stdout", "live stdout");
    runnerOptions?.onOutput?.("stderr", "live stderr");
    if (failureMode) {
      return { exitCode: 9, stdout: "captured stdout", stderr: "captured stderr" };
    }
    const missionFile = args[args.indexOf("-MissionFile") + 1];
    const manifest = JSON.parse(await readFile(missionFile, "utf8")) as {
      reportDirectory: string;
      binding: Record<string, string>;
    };
    const runDirectory = join(manifest.reportDirectory, "bootstrap-http-test");
    await mkdir(runDirectory, { recursive: true });
    const changedPath = "server/nova-core/nova-core.http.ts";
    const changedContent = "export const httpRuntime = true;\n";
    await mkdir(dirname(join(repository, changedPath)), { recursive: true });
    await writeFile(join(repository, changedPath), changedContent, "utf8");
    const officialReport = {
        ReportFingerprint: null as string | null,
        Status: "READY_FOR_REVIEW",
        Binding: manifest.binding,
        Codex: { Status: "SUCCESS", ExitCode: 0, Version: TEST_CODEX.version },
        Git: {
          Created: [],
          Modified: ["server/nova-core/nova-core.http.ts"],
          Deleted: [],
          Renamed: [],
          BranchChanged: false,
          HeadChanged: false,
        },
        OutputEvidence: {
          entries: [{ path: changedPath, sha256: sha256(changedContent), kind: "file", status: "VALID" }],
        },
        Validations: [
          { Type: "pathScope", Name: "scope:http", Passed: true, Required: true },
          { Type: "namedCommand", Name: "nova-core-tests", Passed: true, Required: true },
          { Type: "namedCommand", Name: "nova-core-typecheck", Passed: true, Required: true },
        ],
        Errors: [],
      };
    officialReport.ReportFingerprint = fingerprintReport(officialReport);
    await writeFile(join(runDirectory, "official-report.json"), JSON.stringify(officialReport), "utf8");
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  const engine = new NovaCoreExecutionEngine({
    repositoryRoot: repository,
    dataRoot,
    runtimeDirectory: join(repository, "tools", "nova-core-runtime"),
    powershellCommand: "powershell.exe",
    commandRunner,
    codexInspector: async () => TEST_CODEX,
    recoveryInspector: async () => ({
      processAlive: false,
      processTreeAlive: false,
      worktreeModified: false,
      reportPresent: false,
      artifactsValid: true,
    }),
  });
  const dataFile = join(repository, "runtime.json");
  const authority: CertificationAuthority = {
    authorityId: "release-authority",
    authenticatedSubjectId: "release-authority",
    authorityType: "HUMAN",
    keyId: "release-key-1",
    bearerToken: "release-authority-token-2026",
    signingKey: "release-authority-signing-key-2026",
    enabled: true,
    roles: ["CERTIFY"],
  };
  const forbiddenAuthorities: CertificationAuthority[] = [
    { ...authority, authorityId: "no-role", authenticatedSubjectId: "no-role", bearerToken: "no-role-token-000000000", roles: [] },
    { ...authority, authorityId: "read-only", authenticatedSubjectId: "read-only", bearerToken: "read-only-token-000000", roles: ["READ_ONLY"] },
    { ...authority, authorityId: "disabled", authenticatedSubjectId: "disabled", bearerToken: "disabled-token-0000000", enabled: false },
    { ...authority, authorityId: "identity-a", authenticatedSubjectId: "identity-b", bearerToken: "identity-mismatch-token-0000" },
    { ...authority, authorityId: "automation", authenticatedSubjectId: "automation", bearerToken: "automation-token-000000", authorityType: "AUTOMATION" },
  ];
  const core = await NovaCoreService.open(dataFile, engine, { journalAttestationKey: TEST_ATTESTATION_KEY });
  const server = createNovaCoreHttpServer(core, {
    certificationAuthorities: [authority, ...forbiddenAuthorities],
    certificationPolicy: { allowedAuthorityTypes: ["HUMAN"], requiredRole: "CERTIFY" },
  });
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

  const streamController = new AbortController();
  const streamResponse = await fetch(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/monitor/stream`,
    { signal: streamController.signal },
  );
  assert.equal(streamResponse.status, 200);
  const streamReader = streamResponse.body!.getReader();
  const executePromise = post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/execute`,
    {},
  );
  let streamText = "";
  while (!streamText.includes('"phase":"OUTPUT"')) {
    const chunk = await streamReader.read();
    if (chunk.done) break;
    streamText += new TextDecoder().decode(chunk.value);
  }
  streamController.abort();
  assert.match(streamText, /live stdout/);
  assert.match(streamText, /live stderr/);
  const executeResponse = await executePromise;
  assert.equal(executeResponse.status, 200);
  const executeBody = await executeResponse.json() as {
    mission: { state: string };
    report: { filesChanged: string[]; scopeConfirmed: boolean; reportFingerprint: string; runId: string };
  };
  assert.equal(executeBody.mission.state, "SUBMITTED");
  assert.deepEqual(executeBody.report.filesChanged, ["server/nova-core/nova-core.http.ts"]);
  assert.equal(executeBody.report.scopeConfirmed, true);
  const attest = (
    actor: CertificationAuthority,
    runId = executeBody.report.runId,
    reportFingerprint = executeBody.report.reportFingerprint,
  ) => createCertificationAttestation(actor.signingKey, {
    projectId: "NOVA-CORE",
    authorityId: actor.authorityId,
    missionId: "EXEC-001",
    runId,
    reportFingerprint,
  });

  const technical = await post(`${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/technical-accept`, {});
  assert.equal(technical.status, 200);
  const unauthenticated = await post(`${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`, {
    reportFingerprint: executeBody.report.reportFingerprint,
  });
  assert.equal(unauthenticated.status, 401);
  const unknownAuthority = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: "0".repeat(64) },
    "Bearer unknown-authority-token-000000",
  );
  assert.equal(unknownAuthority.status, 401);
  const missingAttestation = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(missingAttestation.status, 400);
  for (const forbidden of forbiddenAuthorities) {
    const response = await post(
      `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
      { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(forbidden) },
      `Bearer ${forbidden.bearerToken}`,
    );
    assert.equal(response.status, 403, forbidden.authorityId);
    assert.equal(core.getMission("NOVA-CORE", "EXEC-001")?.state, "HUMAN_VALIDATION");
  }
  const invalidAttestation = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: "f".repeat(64) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(invalidAttestation.status, 403);
  assert.equal(core.getMission("NOVA-CORE", "EXEC-001")?.state, "HUMAN_VALIDATION");
  const stale = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: "0".repeat(64), attestation: attest(authority, executeBody.report.runId, "0".repeat(64)) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(stale.status, 422);
  const wrongRun = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: "RUN-WRONG", reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority, "RUN-WRONG") },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(wrongRun.status, 422);
  const reportPath = core.getReport("NOVA-CORE", "EXEC-001")?.reportPath;
  assert.ok(reportPath);
  const originalReport = await readFile(reportPath, "utf8");
  await writeFile(reportPath, originalReport.replace("READY_FOR_REVIEW", "ALTERED"), "utf8");
  const alteredReport = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(alteredReport.status, 422);
  await writeFile(reportPath, originalReport, "utf8");
  const deliverablePath = join(repository, "server/nova-core/nova-core.http.ts");
  await writeFile(deliverablePath, "altered deliverable\n", "utf8");
  const alteredDeliverable = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(alteredDeliverable.status, 422);
  await writeFile(deliverablePath, "export const httpRuntime = true;\n", "utf8");
  const boundReport = core.getReport("NOVA-CORE", "EXEC-001");
  assert.ok(
    boundReport?.promptPath &&
    boundReport.manifestPath &&
    boundReport.executionRequestPath &&
    boundReport.runBindingPath,
  );
  for (const artifactPath of [
    boundReport.promptPath,
    boundReport.manifestPath,
    boundReport.executionRequestPath,
  ]) {
    const originalArtifact = await readFile(artifactPath, "utf8");
    await writeFile(artifactPath, `${originalArtifact}\n`, "utf8");
    const alteredArtifact = await post(
      `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
      { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority) },
      `Bearer ${authority.bearerToken}`,
    );
    assert.equal(alteredArtifact.status, 422, artifactPath);
    await writeFile(artifactPath, originalArtifact, "utf8");
  }
  const originalPrompt = await readFile(boundReport.promptPath, "utf8");
  const originalRunBinding = await readFile(boundReport.runBindingPath, "utf8");
  const forgedPrompt = `${originalPrompt}\nforged`;
  const forgedRunBinding = {
    ...(JSON.parse(originalRunBinding) as Record<string, unknown>),
    promptHash: sha256(forgedPrompt),
  };
  await writeFile(boundReport.promptPath, forgedPrompt, "utf8");
  await writeFile(boundReport.runBindingPath, JSON.stringify(forgedRunBinding), "utf8");
  const locallyResignedArtifact = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(locallyResignedArtifact.status, 422);
  await writeFile(boundReport.promptPath, originalPrompt, "utf8");
  await writeFile(boundReport.runBindingPath, originalRunBinding, "utf8");
  const missingPrompt = `${boundReport.promptPath}.missing`;
  await rename(boundReport.promptPath, missingPrompt);
  const missingArtifact = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(missingArtifact.status, 422);
  await rename(missingPrompt, boundReport.promptPath);
  const certified = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(certified.status, 201);
  const certifiedBody = await certified.json() as {
    mission: { state: string };
    certificate: MissionCertificate;
  };
  assert.equal(certifiedBody.mission.state, "CERTIFIED");
  assert.equal(verifyMissionCertificate(certifiedBody.certificate, authority.signingKey), true);
  const duplicate = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-001/certify`,
    { runId: executeBody.report.runId, reportFingerprint: executeBody.report.reportFingerprint, attestation: attest(authority) },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(duplicate.status, 409);

  const malformed = await post(`${baseUrl}/api/v1/missions`, {
    projectId: "NOVA-CORE",
    missionId: "UNKNOWN-FIELD",
    missionType: "DEVELOPMENT",
    objective: "Reject an unknown payload field.",
    authority: "HUMAN_OWNER",
    scope: { allowed: ["server/nova-core/**"], forbidden: [] },
    deliverables: [],
    stopCriteria: [],
    authorizedReferences: [],
    unexpected: true,
  });
  assert.equal(malformed.status, 400);

  await post(`${baseUrl}/api/v1/missions`, {
    projectId: "NOVA-CORE",
    missionId: "EXEC-FAIL",
    missionType: "DEVELOPMENT",
    objective: "Verifier la propagation HTTP des diagnostics.",
    authority: "HUMAN_OWNER",
    scope: { allowed: ["server/nova-core/**"], forbidden: [] },
    deliverables: ["diagnostic"],
    stopCriteria: ["erreur exposee"],
    authorizedReferences: [],
  });
  failureMode = true;
  const failedExecution = await post(`${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-FAIL/execute`, {});
  assert.equal(failedExecution.status, 500);
  const failedBody = await failedExecution.json() as {
    error: { diagnostics: Array<{ stdout: string; stderr: string; cwd: string; runId: string; correlationId: string }> };
  };
  assert.equal(failedBody.error.diagnostics[0]?.stdout, "captured stdout");
  assert.equal(failedBody.error.diagnostics[0]?.stderr, "captured stderr");
  assert.equal(failedBody.error.diagnostics[0]?.cwd, repository);
  assert.ok(failedBody.error.diagnostics[0]?.runId);
  assert.ok(failedBody.error.diagnostics[0]?.correlationId);
  const unauthenticatedRecovery = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-FAIL/recovery/recover`,
    { runId: failedBody.error.diagnostics[0]!.runId },
  );
  assert.equal(unauthenticatedRecovery.status, 401);
  const recovery = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/EXEC-FAIL/recovery/recover`,
    { runId: failedBody.error.diagnostics[0]!.runId },
    `Bearer ${authority.bearerToken}`,
  );
  assert.equal(recovery.status, 200);
  assert.equal((await recovery.json() as { mission: { state: string; canonicalState: string } }).mission.canonicalState, "ASSIGNED");

  failureMode = false;
  await post(`${baseUrl}/api/v1/missions`, {
    projectId: "NOVA-CORE",
    missionId: "AUDIT-READ-ONLY",
    missionType: "AUDIT",
    objective: "Verifier que le profil READ_ONLY reste non contournable via HTTP.",
    authority: "HUMAN_OWNER",
    scope: { allowed: ["server/nova-core/**"], forbidden: [] },
    deliverables: ["audit"],
    stopCriteria: ["aucune ecriture"],
    authorizedReferences: [],
  });
  const profileBypass = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/AUDIT-READ-ONLY/execute`,
    { profile: "BUILD" },
  );
  assert.equal(profileBypass.status, 500);
  assert.equal((await profileBypass.json() as { error: { code: string } }).error.code, "NOVA_CORE_READ_ONLY_PROFILE_REQUIRED");
  await post(`${baseUrl}/api/v1/missions`, {
    projectId: "NOVA-CORE",
    missionId: "AUDIT-READ-ONLY-WRITE",
    missionType: "AUDIT",
    objective: "Verifier qu'une ecriture READ_ONLY devient un echec terminal.",
    authority: "HUMAN_OWNER",
    scope: { allowed: ["server/nova-core/**"], forbidden: [] },
    deliverables: ["audit"],
    stopCriteria: ["aucune ecriture"],
    authorizedReferences: [],
  });
  const changesBypass = await post(
    `${baseUrl}/api/v1/missions/NOVA-CORE/AUDIT-READ-ONLY-WRITE/execute`,
    { changesExpected: true },
  );
  assert.equal(changesBypass.status, 500);
  assert.equal((await changesBypass.json() as { error: { code: string } }).error.code, "NOVA_CORE_READ_ONLY_VIOLATION");

  const reopened = await NovaCoreService.open(dataFile, engine, { journalAttestationKey: TEST_ATTESTATION_KEY });
  assert.equal(reopened.getMission("NOVA-CORE", "EXEC-001")?.state, "CERTIFIED");
  assert.equal(reopened.getCertificate("NOVA-CORE", "EXEC-001")?.certificateId, certifiedBody.certificate.certificateId);
});

async function post(url: string, body: object, authorization?: string): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify(body),
  });
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
  if (key === "rev-parse --verify HEAD") return { exitCode: 0, stdout: `${"a".repeat(40)}\n`, stderr: "" };
  if (key === "symbolic-ref --quiet --short HEAD") return { exitCode: 0, stdout: `${branch}\n`, stderr: "" };
  if (key === "status --porcelain=v1 --untracked-files=all") return { exitCode: 0, stdout: "", stderr: "" };
  if (key === "ls-files --stage -z") return { exitCode: 0, stdout: "", stderr: "" };
  if (key === "submodule status --recursive") return { exitCode: 0, stdout: "", stderr: "" };
  return { exitCode: 1, stdout: "", stderr: `unexpected git command: ${key}` };
}

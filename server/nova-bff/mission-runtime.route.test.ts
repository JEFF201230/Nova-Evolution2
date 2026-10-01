import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { BffError } from "./bff.errors.js";
import {
  MISSION_RUNTIME_MISSIONS_PATH,
  MISSION_RUNTIME_PROJECTS_PATH,
  missionRuntimeExecutePath,
  type MissionCreateRequestDto,
  type MissionCreateResponseDto,
  type MissionExecuteResponseDto,
} from "./mission-runtime.contract.js";
import { HttpMissionRuntimeGateway } from "./mission-runtime.gateway.js";
import type { MissionRuntimeGatewayPort } from "./mission-runtime.gateway.port.js";
import {
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
  testIdentityProvider,
} from "./bff.test-support.js";
import { createNovaBffServer } from "./nova-bff.server.js";

const CORRELATION_ID = "corr-mission-runtime-001";
const PROJECT_ID = "NOVA-R02";
const MISSION_ID = "HTTP-BRIDGE-001";

test("Mission Runtime routes validate requests and propagate the correlation ID", async (context) => {
  const observed: Array<{ operation: string; correlationId: string; value: unknown }> = [];
  const gateway: MissionRuntimeGatewayPort = {
    async listProjectTargets(correlationId) {
      observed.push({ operation: "projects", correlationId, value: null });
      return { projects: [{ projectId: PROJECT_ID }] };
    },
    async createMission(request, correlationId) {
      observed.push({ operation: "create", correlationId, value: request });
      return createResult(true);
    },
    async executeMission(projectId, missionId, request, correlationId) {
      observed.push({ operation: "execute", correlationId, value: { projectId, missionId, request } });
      return executeResult();
    },
  };
  const bff = await startTestBff(testBffConfig(), { missionRuntimeGateway: gateway });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const projectsResponse = await fetch(
    `${bff.baseUrl}${MISSION_RUNTIME_PROJECTS_PATH}`,
    { headers: { Cookie: proof.cookie, "X-Correlation-ID": CORRELATION_ID } },
  );
  assert.equal(projectsResponse.status, 200);
  assert.deepEqual(await projectsResponse.json(), { projects: [{ projectId: PROJECT_ID }] });

  const createResponse = await postJson(
    `${bff.baseUrl}${MISSION_RUNTIME_MISSIONS_PATH}`,
    proof,
    missionDefinition(),
    CORRELATION_ID,
  );
  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.headers.get("x-correlation-id"), CORRELATION_ID);
  assert.deepEqual(await createResponse.json(), createResult(true));

  const executeResponse = await postJson(
    `${bff.baseUrl}${missionRuntimeExecutePath(PROJECT_ID, MISSION_ID)}`,
    proof,
    { profile: "ARCHITECTURE", changesExpected: true, timeoutMs: 60_000 },
    CORRELATION_ID,
  );
  assert.equal(executeResponse.status, 200);
  assert.equal(executeResponse.headers.get("x-correlation-id"), CORRELATION_ID);
  assert.deepEqual(await executeResponse.json(), executeResult());
  assert.deepEqual(observed, [
    { operation: "projects", correlationId: CORRELATION_ID, value: null },
    { operation: "create", correlationId: CORRELATION_ID, value: missionDefinition() },
    {
      operation: "execute",
      correlationId: CORRELATION_ID,
      value: {
        projectId: PROJECT_ID,
        missionId: MISSION_ID,
        request: { profile: "ARCHITECTURE", changesExpected: true, timeoutMs: 60_000 },
      },
    },
  ]);
});

test("Mission Runtime routes reject unauthenticated and invalid contracts before the Gateway", async (context) => {
  let calls = 0;
  const gateway: MissionRuntimeGatewayPort = {
    async listProjectTargets() {
      calls += 1;
      return { projects: [{ projectId: PROJECT_ID }] };
    },
    async createMission() {
      calls += 1;
      return createResult(true);
    },
    async executeMission() {
      calls += 1;
      return executeResult();
    },
  };
  const bff = await startTestBff(testBffConfig(), { missionRuntimeGateway: gateway });
  context.after(() => bff.close());

  const unauthenticated = await fetch(`${bff.baseUrl}${MISSION_RUNTIME_MISSIONS_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(missionDefinition()),
  });
  assert.equal(unauthenticated.status, 401);
  assert.equal((await errorBody(unauthenticated)).error.code, "AUTHENTICATION_REQUIRED");
  const unauthenticatedProjects = await fetch(`${bff.baseUrl}${MISSION_RUNTIME_PROJECTS_PATH}`);
  assert.equal(unauthenticatedProjects.status, 401);
  assert.equal((await errorBody(unauthenticatedProjects)).error.code, "AUTHENTICATION_REQUIRED");

  const proof = await authenticatedProof(bff.baseUrl);
  for (const body of [
    { ...missionDefinition(), unexpected: "rejected" },
    { ...missionDefinition(), scope: { allowed: "server/nova-bff", forbidden: [] } },
    { ...missionDefinition(), objective: "" },
  ]) {
    const response = await postJson(`${bff.baseUrl}${MISSION_RUNTIME_MISSIONS_PATH}`, proof, body);
    assert.equal(response.status, 400);
    assert.equal((await errorBody(response)).error.code, "MISSION_RUNTIME_REQUEST_INVALID");
  }
  for (const body of [
    { profile: "UNSAFE" },
    { changesExpected: "yes" },
    { timeoutMs: 24 * 60 * 60_000 + 1 },
    { unexpected: true },
  ]) {
    const response = await postJson(
      `${bff.baseUrl}${missionRuntimeExecutePath(PROJECT_ID, MISSION_ID)}`,
      proof,
      body,
    );
    assert.equal(response.status, 400);
    assert.equal((await errorBody(response)).error.code, "MISSION_RUNTIME_REQUEST_INVALID");
  }
  assert.equal(calls, 0);
});

test("HTTP Mission Runtime Gateway creates idempotently and exposes only the reduced Mission view", async () => {
  const requests: Array<{ url: string; correlationId: string | null; body: unknown }> = [];
  let call = 0;
  const gateway = new HttpMissionRuntimeGateway(
    "http://127.0.0.1:4100",
    async (input, init) => {
      requests.push({
        url: String(input),
        correlationId: new Headers(init?.headers).get("x-correlation-id"),
        body: JSON.parse(String(init?.body)) as unknown,
      });
      const created = call++ === 0;
      return jsonResponse({
        created,
        mission: coreMission(null, null),
        internalOnly: "must-not-cross-bff",
      }, created ? 201 : 200);
    },
  );

  assert.deepEqual(await gateway.createMission(missionDefinition(), CORRELATION_ID), createResult(true));
  assert.deepEqual(await gateway.createMission(missionDefinition(), CORRELATION_ID), createResult(false));
  assert.deepEqual(requests, [0, 1].map(() => ({
    url: "http://127.0.0.1:4100/api/v1/missions",
    correlationId: CORRELATION_ID,
    body: missionDefinition(),
  })));
  assert.doesNotMatch(JSON.stringify(createResult(true)), /internalOnly|objective|scope|authority/);
});

test("HTTP Mission Runtime Gateway reduces project discovery to project identifiers", async () => {
  const gateway = new HttpMissionRuntimeGateway(
    "http://127.0.0.1:4100",
    async (input, init) => {
      assert.equal(String(input), "http://127.0.0.1:4100/api/v1/projects");
      assert.equal(init?.method, "GET");
      assert.equal(new Headers(init?.headers).get("x-correlation-id"), CORRELATION_ID);
      return jsonResponse({
        projects: [{ projectId: PROJECT_ID, repositoryRoot: "C:/private/repository" }],
      });
    },
  );

  const result = await gateway.listProjectTargets(CORRELATION_ID);

  assert.deepEqual(result, { projects: [{ projectId: PROJECT_ID }] });
  assert.doesNotMatch(JSON.stringify(result), /repositoryRoot|private\/repository/);
});

test("HTTP Mission Runtime Gateway executes through NOVA Core and minimizes its report", async () => {
  const requests: Array<{ url: string; method: string | undefined; correlationId: string | null; body: unknown }> = [];
  const gateway = new HttpMissionRuntimeGateway(
    "http://127.0.0.1:4100",
    async (input, init) => {
      requests.push({
        url: String(input),
        method: init?.method,
        correlationId: new Headers(init?.headers).get("x-correlation-id"),
        body: JSON.parse(String(init?.body)) as unknown,
      });
      return jsonResponse({
        mission: coreMission("RUN-001", "REPORT-001"),
        report: coreReport(),
        diagnostics: [{ stdout: "secret output", cwd: "C:/secret" }],
      });
    },
  );

  const result = await gateway.executeMission(
    PROJECT_ID,
    MISSION_ID,
    { profile: "BUILD", changesExpected: true },
    CORRELATION_ID,
  );
  assert.deepEqual(result, executeResult());
  assert.deepEqual(requests, [{
    url: "http://127.0.0.1:4100/api/v1/missions/NOVA-R02/HTTP-BRIDGE-001/execute",
    method: "POST",
    correlationId: CORRELATION_ID,
    body: { profile: "BUILD", changesExpected: true },
  }]);
  assert.doesNotMatch(JSON.stringify(result), /stdout|cwd|secret output|repositoryRoot|diagnostics/);
});

test("HTTP Mission Runtime Gateway rejects invalid NOVA Core responses", async () => {
  const cases: Array<() => Promise<Response>> = [
    async () => new Response("not-json", { status: 200, headers: { "content-type": "text/plain" } }),
    async () => jsonResponse({ created: true, mission: { projectId: PROJECT_ID } }, 201),
    async () => jsonResponse({ created: false, mission: coreMission(null, null) }, 201),
    async () => jsonResponse({
      mission: coreMission("RUN-OTHER", "REPORT-001"),
      report: coreReport(),
    }),
  ];

  for (const [index, fetcher] of cases.entries()) {
    const gateway = new HttpMissionRuntimeGateway("http://127.0.0.1:4100", fetcher);
    await assert.rejects(
      index < 3
        ? () => gateway.createMission(missionDefinition(), CORRELATION_ID)
        : () => gateway.executeMission(PROJECT_ID, MISSION_ID, {}, CORRELATION_ID),
      isBffError(502, "NOVA_CORE_RESPONSE_INVALID"),
    );
  }
});

test("HTTP Mission Runtime Gateway normalizes NOVA Core errors without leaking its body", async () => {
  for (const [upstreamStatus, status, code] of [
    [400, 400, "NOVA_CORE_REQUEST_INVALID"],
    [404, 404, "MISSION_NOT_FOUND"],
    [409, 409, "MISSION_CONFLICT"],
    [422, 422, "MISSION_EXECUTION_REJECTED"],
    [500, 503, "NOVA_CORE_UNAVAILABLE"],
  ] as const) {
    const gateway = new HttpMissionRuntimeGateway(
      "http://127.0.0.1:4100",
      async () => jsonResponse({ error: { message: "sensitive NOVA Core detail", stack: "secret stack" } }, upstreamStatus),
    );
    await assert.rejects(
      () => gateway.createMission(missionDefinition(), CORRELATION_ID),
      (error: unknown) => {
        assert.ok(error instanceof BffError);
        assert.equal(error.status, status);
        assert.equal(error.code, code);
        assert.doesNotMatch(JSON.stringify(error), /sensitive|secret stack/);
        return true;
      },
    );
  }
});

test("HTTP Mission Runtime Gateway handles unavailability and timeout", async () => {
  const unavailable = new HttpMissionRuntimeGateway(
    "http://127.0.0.1:4100",
    async () => { throw new TypeError("private connection detail"); },
  );
  await assert.rejects(
    () => unavailable.createMission(missionDefinition(), CORRELATION_ID),
    isBffError(503, "NOVA_CORE_UNAVAILABLE"),
  );

  const timedOut = new HttpMissionRuntimeGateway(
    "http://127.0.0.1:4100",
    async (_input, init) => await new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    }),
    10,
  );
  await assert.rejects(
    () => timedOut.executeMission(PROJECT_ID, MISSION_ID, {}, CORRELATION_ID),
    isBffError(504, "NOVA_CORE_TIMEOUT"),
  );
});

test("the real BFF server factory injects the HTTP Mission Runtime Gateway", async (context) => {
  const upstreamRequests: Array<{ path: string; correlationId: string | undefined }> = [];
  const novaCore = createServer(async (request, response) => {
    upstreamRequests.push({
      path: request.url ?? "",
      correlationId: request.headers["x-correlation-id"] as string | undefined,
    });
    for await (const _chunk of request) {
      // Drain the request body before responding, as the real NOVA Core server does.
    }
    if (request.url === "/api/v1/missions") {
      sendJson(response, 201, { created: true, mission: coreMission(null, null) });
      return;
    }
    sendJson(response, 200, { mission: coreMission("RUN-001", "REPORT-001"), report: coreReport() });
  });
  novaCore.listen(0, "127.0.0.1");
  await once(novaCore, "listening");
  context.after(() => closeServer(novaCore));
  const novaCoreAddress = novaCore.address() as AddressInfo;

  const bff = await createNovaBffServer(
    testBffConfig({ runtimeOrigin: `http://127.0.0.1:${novaCoreAddress.port}` }),
    { identityProvider: await testIdentityProvider() },
  );
  bff.listen(0, "127.0.0.1");
  await once(bff, "listening");
  context.after(() => closeServer(bff));
  const bffAddress = bff.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${bffAddress.port}`;
  const proof = await authenticatedProof(baseUrl);

  const created = await postJson(
    `${baseUrl}${MISSION_RUNTIME_MISSIONS_PATH}`,
    proof,
    missionDefinition(),
    CORRELATION_ID,
  );
  assert.equal(created.status, 201);
  const executed = await postJson(
    `${baseUrl}${missionRuntimeExecutePath(PROJECT_ID, MISSION_ID)}`,
    proof,
    {},
    CORRELATION_ID,
  );
  assert.equal(executed.status, 200);
  assert.deepEqual(upstreamRequests, [
    { path: "/api/v1/missions", correlationId: CORRELATION_ID },
    { path: "/api/v1/missions/NOVA-R02/HTTP-BRIDGE-001/execute", correlationId: CORRELATION_ID },
  ]);
});

interface SessionProof {
  readonly cookie: string;
  readonly csrf: string;
}

function missionDefinition(): MissionCreateRequestDto {
  return {
    projectId: PROJECT_ID,
    missionId: MISSION_ID,
    missionType: "IMPLEMENTATION",
    objective: "Connect the BFF to the existing Mission Runtime authority.",
    authority: "WAVE",
    scope: { allowed: ["server/nova-bff/**"], forbidden: ["server/nova-core/**"] },
    deliverables: ["HTTP bridge"],
    stopCriteria: ["BFF tests pass"],
    authorizedReferences: [],
    priority: 2,
  };
}

function createResult(created: boolean): MissionCreateResponseDto {
  return { created, mission: missionView(null, null) };
}

function executeResult(): MissionExecuteResponseDto {
  return {
    mission: missionView("RUN-001", "REPORT-001"),
    report: {
      projectId: PROJECT_ID,
      missionId: MISSION_ID,
      reportId: "REPORT-001",
      reportType: "NOVA_CORE_CODEX_SUCCESS",
      runId: "RUN-001",
      reportFingerprint: "a".repeat(64),
      scopeConfirmed: true,
      submittedAt: "2026-09-29T12:00:00.000Z",
    },
  };
}

function missionView(runId: string | null, reportId: string | null) {
  return {
    projectId: PROJECT_ID,
    missionId: MISSION_ID,
    missionType: "IMPLEMENTATION",
    state: runId ? "SUBMITTED" : "ACCEPTED",
    canonicalState: runId ? "SUBMITTED" : "READY",
    assignedAgentId: runId ? "NOVA-DEVELOPER" : null,
    runId,
    reportId,
    updatedAt: "2026-09-29T12:00:00.000Z",
  };
}

function coreMission(runId: string | null, reportId: string | null) {
  return {
    ...missionDefinition(),
    ...missionView(runId, reportId),
    lockId: runId ? "LOCK-001" : null,
    contextId: runId ? "CONTEXT-001" : null,
    internalExecutionData: "must-not-cross-bff",
  };
}

function coreReport() {
  return {
    ...executeResult().report,
    agentId: "NOVA-DEVELOPER",
    deliverables: ["HTTP bridge"],
    filesChanged: ["server/nova-bff/mission-runtime.gateway.ts"],
    checks: ["test:bff"],
    blockers: [],
    errors: [],
    diagnostics: [{ stdout: "secret output", cwd: "C:/private/repository" }],
    repositoryRoot: "C:/private/repository",
    reportPath: "C:/private/report.json",
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function authenticatedProof(baseUrl: string): Promise<SessionProof> {
  const anonymous = await fetch(`${baseUrl}/session`);
  const anonymousProof = proofFromResponse(anonymous);
  const login = await postJson(
    `${baseUrl}/session/login`,
    anonymousProof,
    { username: "active.operator", password: TEST_PASSWORD },
  );
  assert.equal(login.status, 200);
  return proofFromResponse(login);
}

function proofFromResponse(response: Response): SessionProof {
  return {
    cookie: sessionCookiePair(response.headers.get("set-cookie") ?? ""),
    csrf: response.headers.get("x-csrf-token") ?? "",
  };
}

function postJson(
  url: string,
  proof: SessionProof,
  body: unknown,
  correlationId?: string,
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: proof.cookie,
      Origin: "https://bff.test",
      "X-CSRF-Token": proof.csrf,
      ...(correlationId ? { "X-Correlation-ID": correlationId } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function errorBody(response: Response): Promise<{ error: { code: string } }> {
  return await response.json() as { error: { code: string } };
}

function isBffError(status: number, code: string): (error: unknown) => boolean {
  return (error: unknown) => error instanceof BffError
    && error.status === status
    && error.code === code;
}

function sendJson(response: import("node:http").ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function closeServer(server: import("node:net").Server): Promise<void> {
  server.close();
  await once(server, "close");
}

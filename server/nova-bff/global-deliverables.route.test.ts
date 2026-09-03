import assert from "node:assert/strict";
import test from "node:test";
import { GLOBAL_DELIVERABLES_PATH, type GlobalDeliverablesResponse } from "../../contracts/global-deliverables.contract.js";
import { BffError } from "./bff.errors.js";
import { sessionCookiePair, startTestBff, TEST_PASSWORD, testBffConfig } from "./bff.test-support.js";
import { HttpGlobalDeliverablesGateway } from "./global-deliverables.gateway.js";

const CORRELATION_ID = "corr-global-deliverables-001";
const SHA = "a".repeat(64);
const EVIDENCE = { path: "Docs/report.md", size: 42, sha256: SHA, modifiedAt: "2026-07-30T12:00:00.000Z", runId: "run-001" };
const RESPONSE: GlobalDeliverablesResponse = {
  deliverables: [{ projectId: "PROJECT-A", missionId: "MISSION-1", reportId: "REPORT-1", ...EVIDENCE }],
};

test("Global Deliverables route requires authentication before its Gateway", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), { globalDeliverablesGateway: { async list() { calls += 1; return RESPONSE; } } });
  context.after(() => bff.close());
  const response = await fetch(`${bff.baseUrl}${GLOBAL_DELIVERABLES_PATH}`);
  assert.equal(response.status, 401);
  assert.equal((await response.json() as { error: { code: string } }).error.code, "AUTHENTICATION_REQUIRED");
  assert.equal(calls, 0);
});

test("Global Deliverables route returns its authenticated capability contract and correlation id", async (context) => {
  const calls: string[] = [];
  const bff = await startTestBff(testBffConfig(), { globalDeliverablesGateway: { async list(correlationId) { calls.push(correlationId); return RESPONSE; } } });
  context.after(() => bff.close());
  const cookie = await authenticatedCookie(bff.baseUrl);
  const response = await fetch(`${bff.baseUrl}${GLOBAL_DELIVERABLES_PATH}`, { headers: { Cookie: cookie, "X-Correlation-ID": CORRELATION_ID } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), RESPONSE);
  assert.deepEqual(calls, [CORRELATION_ID]);
});

test("the BFF does not expose a generic Core proxy", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const response = await fetch(`${bff.baseUrl}/api/v1/missions`);
  assert.equal(response.status, 404);
  assert.equal((await response.json() as { error: { code: string } }).error.code, "ROUTE_NOT_FOUND");
});

test("Gateway returns empty for no missions, missions without reports, and reports without evidence", async () => {
  const noMissions = gatewayFor({ missions: [] }, new Map());
  assert.deepEqual(await noMissions.list(CORRELATION_ID), { deliverables: [] });

  let detailCalls = 0;
  const withoutReport = new HttpGlobalDeliverablesGateway("http://runtime", async () => { detailCalls += 1; return json({ missions: [mission("PROJECT-A", "MISSION-1", null)] }); });
  assert.deepEqual(await withoutReport.list(CORRELATION_ID), { deliverables: [] });
  assert.equal(detailCalls, 1);

  const withoutEvidence = gatewayFor(
    { missions: [mission("PROJECT-A", "MISSION-1", "REPORT-1")] },
    new Map([["PROJECT-A/MISSION-1", detail("PROJECT-A", "MISSION-1", "REPORT-1", undefined)]]),
  );
  assert.deepEqual(await withoutEvidence.list(CORRELATION_ID), { deliverables: [] });
});

test("Gateway exposes multiple real evidence entries in Runtime order using GET only", async () => {
  const requests: Array<{ url: string; method?: string; correlationId: string | null }> = [];
  const missions = [mission("PROJECT-A", "MISSION-1", "REPORT-1"), mission("PROJECT-B", "MISSION-2", "REPORT-2")];
  const details = new Map([
    ["PROJECT-A/MISSION-1", detail("PROJECT-A", "MISSION-1", "REPORT-1", [EVIDENCE])],
    ["PROJECT-B/MISSION-2", detail("PROJECT-B", "MISSION-2", "REPORT-2", [{ ...EVIDENCE, path: "z.txt", runId: "run-002" }])],
  ]);
  const gateway = new HttpGlobalDeliverablesGateway("http://runtime", async (input, init) => {
    requests.push({ url: String(input), method: init?.method, correlationId: new Headers(init?.headers).get("x-correlation-id") });
    const path = new URL(String(input)).pathname;
    if (path === "/api/v1/missions") return json({ missions });
    return json(details.get(decodeURIComponent(path.replace("/api/v1/missions/", ""))));
  });
  assert.deepEqual(await gateway.list(CORRELATION_ID), {
    deliverables: [
      { projectId: "PROJECT-A", missionId: "MISSION-1", reportId: "REPORT-1", ...EVIDENCE },
      { projectId: "PROJECT-B", missionId: "MISSION-2", reportId: "REPORT-2", ...EVIDENCE, path: "z.txt", runId: "run-002" },
    ],
  });
  assert.equal(requests.every((request) => request.method === "GET"), true);
  assert.equal(requests.every((request) => request.correlationId === CORRELATION_ID), true);
});

for (const [label, mutate] of [
  ["projectId", (value: ReturnType<typeof detail>) => { value.report.projectId = "OTHER"; }],
  ["missionId", (value: ReturnType<typeof detail>) => { value.report.missionId = "OTHER"; }],
  ["reportId", (value: ReturnType<typeof detail>) => { value.report.reportId = "OTHER"; }],
] as const) {
  test(`Gateway rejects an inconsistent ${label}`, async () => {
    const value = detail("PROJECT-A", "MISSION-1", "REPORT-1", [EVIDENCE]);
    mutate(value);
    await rejectsInvalid(gatewayFor({ missions: [mission("PROJECT-A", "MISSION-1", "REPORT-1")] }, new Map([["PROJECT-A/MISSION-1", value]])));
  });
}

test("Gateway rejects duplicate reportId declarations inside one project", async () => {
  await rejectsInvalid(gatewayFor({ missions: [
    mission("PROJECT-A", "MISSION-1", "REPORT-1"),
    mission("PROJECT-A", "MISSION-2", "REPORT-1"),
  ] }, new Map()));
});

test("Gateway rejects structurally invalid Runtime responses", async () => {
  await rejectsInvalid(gatewayFor({ missions: [{ ...mission("PROJECT-A", "MISSION-1", null), invented: true }] }, new Map()));
});

test("Gateway maps unavailable, rejected, and timed-out Runtime reads", async () => {
  await assert.rejects(() => new HttpGlobalDeliverablesGateway("http://runtime", async () => { throw new TypeError("offline"); }).list(CORRELATION_ID), hasBffError(503, "RUNTIME_UNAVAILABLE"));
  await assert.rejects(() => new HttpGlobalDeliverablesGateway("http://runtime", async () => json({}, 400)).list(CORRELATION_ID), hasBffError(502, "RUNTIME_REQUEST_REJECTED"));
  const timeoutGateway = new HttpGlobalDeliverablesGateway("http://runtime", async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  }), 1);
  await assert.rejects(() => timeoutGateway.list(CORRELATION_ID), hasBffError(504, "RUNTIME_TIMEOUT"));
});

function mission(projectId: string, missionId: string, reportId: string | null) {
  return { projectId, missionId, reportId, assignedAgentId: null, authority: "HUMAN", canonicalState: "ACTIVE", contextId: null, deliverables: [], lockId: null, missionType: "BUILD", objective: "objective", runId: null, scope: { allowed: [], forbidden: [] }, state: "RUNNING", stopCriteria: [], authorizedReferences: [], updatedAt: "2026-07-30T12:00:00.000Z" };
}

function detail(projectId: string, missionId: string, reportId: string, deliverableEvidence: unknown) {
  return {
    mission: mission(projectId, missionId, reportId),
    report: { projectId, missionId, reportId, agentId: "agent", reportType: "BUILD", deliverables: [], filesChanged: [], checks: [], blockers: [], errors: [], scopeConfirmed: true, submittedAt: "2026-07-30T12:00:00.000Z", ...(deliverableEvidence === undefined ? {} : { deliverableEvidence }) },
    events: [], observabilityEvents: [], incompleteRuns: [],
  };
}

function gatewayFor(list: unknown, details: Map<string, unknown>): HttpGlobalDeliverablesGateway {
  return new HttpGlobalDeliverablesGateway("http://runtime", async (input) => {
    const path = new URL(String(input)).pathname;
    if (path === "/api/v1/missions") return json(list);
    return json(details.get(decodeURIComponent(path.replace("/api/v1/missions/", ""))));
  });
}
function json(body: unknown, status = 200): Response { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }); }
function hasBffError(status: number, code: string) { return (error: unknown) => error instanceof BffError && error.status === status && error.code === code; }
async function rejectsInvalid(gateway: HttpGlobalDeliverablesGateway): Promise<void> { await assert.rejects(() => gateway.list(CORRELATION_ID), hasBffError(502, "RUNTIME_RESPONSE_INVALID")); }

async function authenticatedCookie(baseUrl: string): Promise<string> {
  const anonymous = await fetch(`${baseUrl}/session`);
  const anonymousCookie = sessionCookiePair(anonymous.headers.get("set-cookie") ?? "");
  const login = await fetch(`${baseUrl}/session/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: anonymousCookie, Origin: "https://bff.test", "X-CSRF-Token": anonymous.headers.get("x-csrf-token") ?? "" },
    body: JSON.stringify({ username: "active.operator", password: TEST_PASSWORD }),
  });
  assert.equal(login.status, 200);
  return sessionCookiePair(login.headers.get("set-cookie") ?? "");
}

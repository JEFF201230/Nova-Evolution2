import assert from "node:assert/strict";
import test from "node:test";
import {
  RUNTIME_ACTIVE_WORK_PATH,
  type HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import {
  runtimeWorkOverviewPath,
  workOverviewPath,
  type WorkOverviewResponse,
} from "../../contracts/work-overview.contract.js";
import { BffError } from "./bff.errors.js";
import { HttpWorkOverviewGateway } from "./work-overview.gateway.js";
import {
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "./bff.test-support.js";

const CORRELATION_ID = "corr-work-overview-001";
const WORK_ID = "WORK-OVERVIEW-001";
const ACTIVE_WORK: HomeActiveWorkResponse = {
  works: [{
    workIdentity: { projectId: "NOVA", workId: WORK_ID },
    mission: { projectId: "NOVA", missionId: WORK_ID },
    goal: "Expose an authoritative Work Overview.",
    lifecycle: "ACTIVE",
    progress: 40,
    updatedAt: "2026-09-21T10:00:00.000Z",
    provenance: {
      identity: { sourceDomain: "MISSIONS", producer: "ORCHESTRATOR_RUNTIME", sourceId: `NOVA/${WORK_ID}`, observedAt: "2026-09-21T09:00:00.000Z" },
      lifecycle: { sourceDomain: "WORK", producer: "WCF-001-LIFECYCLE-001", sourceId: `NOVA/${WORK_ID}/ACTIVE`, observedAt: "2026-09-21T10:00:00.000Z" },
      progress: { sourceDomain: "MONITORING", producer: "ORCHESTRATOR_OBSERVABILITY", sourceId: `OBS-${WORK_ID}`, observedAt: "2026-09-21T10:00:00.000Z", sequence: 1, correlationId: CORRELATION_ID, runId: `RUN-${WORK_ID}` },
    },
  }],
};
const OVERVIEW: WorkOverviewResponse = {
  overview: {
    projectId: "NOVA", workId: WORK_ID, title: "Expose an authoritative Work Overview.", confidence: 75,
    phase: { current: 1, total: 2 }, dueAt: "2026-10-31T17:00:00.000Z", insight: null, nextAction: null,
    deferredActionCount: 0, pendingDecision: null,
    progress: { percentage: 40, owner: null, updatedAt: "2026-09-21T10:00:00.000Z" },
    deliverables: [], people: [], novaUpdate: null,
  },
};

test("GET Work Overview returns the authenticated capability-specific contract", async (context) => {
  const calls: Array<{ workId: string; correlationId: string }> = [];
  const bff = await startTestBff(testBffConfig(), {
    workOverviewGateway: { async get(workId, correlationId) { calls.push({ workId, correlationId }); return OVERVIEW; } },
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);
  const response = await fetch(`${bff.baseUrl}${workOverviewPath(WORK_ID)}`, { headers: { Cookie: proof.cookie, "X-Correlation-ID": CORRELATION_ID } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), OVERVIEW);
  assert.deepEqual(calls, [{ workId: WORK_ID, correlationId: CORRELATION_ID }]);
});

test("GET Work Overview requires authentication", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), { workOverviewGateway: { async get() { calls += 1; return OVERVIEW; } } });
  context.after(() => bff.close());
  const response = await fetch(`${bff.baseUrl}${workOverviewPath(WORK_ID)}`);
  assert.equal(response.status, 401);
  assert.equal((await response.json() as { error: { code: string } }).error.code, "AUTHENTICATION_REQUIRED");
  assert.equal(calls, 0);
});

test("GET Work Overview returns the canonical NOT_READY groups", async (context) => {
  const bff = await startTestBff(testBffConfig(), { workOverviewGateway: { async get() { throw new BffError(409, "WORK_OVERVIEW_NOT_READY", "Not ready.", { missingGroups: ["WORK_PHASE", "WORK_CONFIDENCE"] }); } } });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);
  const response = await fetch(`${bff.baseUrl}${workOverviewPath(WORK_ID)}`, { headers: { Cookie: proof.cookie } });
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { error: { code: "WORK_OVERVIEW_NOT_READY", missingGroups: ["WORK_PHASE", "WORK_CONFIDENCE"] } });
});

test("HTTP Work Overview Gateway resolves Work identity then calls only the specific Runtime Overview endpoint", async () => {
  const requests: string[] = [];
  const gateway = new HttpWorkOverviewGateway("http://127.0.0.1:4100", async (input) => {
    const url = String(input); requests.push(url);
    return new Response(JSON.stringify(url.endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : OVERVIEW), { status: 200, headers: { "content-type": "application/json" } });
  });
  assert.deepEqual(await gateway.get(WORK_ID, CORRELATION_ID), OVERVIEW);
  assert.deepEqual(requests, [
    `http://127.0.0.1:4100${RUNTIME_ACTIVE_WORK_PATH}`,
    `http://127.0.0.1:4100${runtimeWorkOverviewPath("NOVA", WORK_ID)}`,
  ]);
});

test("HTTP Work Overview Gateway preserves explicit NOT_READY without a fallback", async () => {
  const gateway = new HttpWorkOverviewGateway("http://127.0.0.1:4100", async (input) => {
    if (String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH)) return new Response(JSON.stringify(ACTIVE_WORK), { status: 200 });
    return new Response(JSON.stringify({ error: { code: "WORK_OVERVIEW_NOT_READY", missingGroups: ["WORK_PHASE", "WORK_CONFIDENCE"] } }), { status: 409 });
  });
  await assert.rejects(() => gateway.get(WORK_ID, CORRELATION_ID), (error: unknown) =>
    error instanceof BffError && error.status === 409 && error.code === "WORK_OVERVIEW_NOT_READY"
    && JSON.stringify(error.details?.missingGroups) === JSON.stringify(["WORK_PHASE", "WORK_CONFIDENCE"]));
});

test("HTTP Work Overview Gateway rejects malformed nested Runtime data", async () => {
  const malformed = {
    ...OVERVIEW,
    overview: {
      ...OVERVIEW.overview,
      progress: { ...OVERVIEW.overview.progress, percentage: "40" },
    },
  };
  const gateway = new HttpWorkOverviewGateway("http://127.0.0.1:4100", async (input) =>
    new Response(JSON.stringify(String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : malformed), { status: 200 }));
  await assert.rejects(() => gateway.get(WORK_ID, CORRELATION_ID), (error: unknown) =>
    error instanceof BffError && error.status === 502 && error.code === "RUNTIME_RESPONSE_INVALID");
});

test("HTTP Work Overview Gateway rejects additional Runtime contract fields", async () => {
  const additional = { ...OVERVIEW, overview: { ...OVERVIEW.overview, fixtureFallback: true } };
  const gateway = new HttpWorkOverviewGateway("http://127.0.0.1:4100", async (input) =>
    new Response(JSON.stringify(String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : additional), { status: 200 }));
  await assert.rejects(() => gateway.get(WORK_ID, CORRELATION_ID), (error: unknown) =>
    error instanceof BffError && error.status === 502 && error.code === "RUNTIME_RESPONSE_INVALID");
});

interface SessionProof { readonly cookie: string; readonly csrf: string }
async function authenticatedProof(baseUrl: string): Promise<SessionProof> {
  const anonymous = await fetch(`${baseUrl}/session`); const anonymousProof = proofFromResponse(anonymous);
  const login = await fetch(`${baseUrl}/session/login`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: anonymousProof.cookie, Origin: "https://bff.test", "X-CSRF-Token": anonymousProof.csrf }, body: JSON.stringify({ username: "active.operator", password: TEST_PASSWORD }) });
  assert.equal(login.status, 200); return proofFromResponse(login);
}
function proofFromResponse(response: Response): SessionProof { return { cookie: sessionCookiePair(response.headers.get("set-cookie") ?? ""), csrf: response.headers.get("x-csrf-token") ?? "" }; }

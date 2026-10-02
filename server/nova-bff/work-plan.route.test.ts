import assert from "node:assert/strict";
import test from "node:test";
import {
  RUNTIME_ACTIVE_WORK_PATH,
  type HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import {
  runtimeWorkPlanPath,
  workPlanPath,
  type WorkPlanResponse,
} from "../../contracts/work-plan.contract.js";
import { BffError } from "./bff.errors.js";
import {
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "./bff.test-support.js";
import { HttpWorkPlanGateway } from "./work-plan.gateway.js";

const CORRELATION_ID = "corr-work-plan-001";
const PROJECT_ID = "NOVA";
const WORK_ID = "MISSION-PLAN-001";
const ACTIVE_WORK: HomeActiveWorkResponse = {
  works: [{
    workIdentity: { projectId: PROJECT_ID, workId: WORK_ID },
    mission: { projectId: PROJECT_ID, missionId: WORK_ID },
    goal: "Expose the authoritative Work Plan.",
    lifecycle: "ACTIVE",
    progress: 40,
    updatedAt: "2026-09-21T10:00:00.000Z",
    provenance: {
      identity: { sourceDomain: "MISSIONS", producer: "ORCHESTRATOR_RUNTIME", sourceId: `${PROJECT_ID}/${WORK_ID}`, observedAt: "2026-09-21T09:00:00.000Z" },
      lifecycle: { sourceDomain: "WORK", producer: "WCF-001-LIFECYCLE-001", sourceId: `${PROJECT_ID}/${WORK_ID}/ACTIVE`, observedAt: "2026-09-21T10:00:00.000Z" },
      progress: { sourceDomain: "MONITORING", producer: "ORCHESTRATOR_OBSERVABILITY", sourceId: `OBS-${WORK_ID}`, observedAt: "2026-09-21T10:00:00.000Z", sequence: 1, correlationId: CORRELATION_ID, runId: `RUN-${WORK_ID}` },
    },
  }],
};
const AVAILABLE: WorkPlanResponse = {
  plan: {
    workIdentity: { projectId: PROJECT_ID, workId: WORK_ID },
    state: "AVAILABLE",
    phase: { current: 2, total: 3, phaseId: "review" },
    dueAt: "2026-10-31T17:00:00.000Z",
    dependencies: [{ prerequisite: "draft", dependent: "review" }],
  },
};

test("GET Work Plan requires authentication before calling its Gateway", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), {
    workPlanGateway: { async read() { calls += 1; return AVAILABLE; } },
  });
  context.after(() => bff.close());
  const response = await fetch(`${bff.baseUrl}${workPlanPath(WORK_ID)}`);
  assert.equal(response.status, 401);
  assert.equal((await response.json() as { error: { code: string } }).error.code, "AUTHENTICATION_REQUIRED");
  assert.equal(calls, 0);
});

test("GET Work Plan validates the path and forwards workId plus correlation ID", async (context) => {
  const calls: Array<{ workId: string; correlationId: string }> = [];
  const bff = await startTestBff(testBffConfig(), {
    workPlanGateway: {
      async read(workId, correlationId) {
        calls.push({ workId, correlationId });
        return AVAILABLE;
      },
    },
  });
  context.after(() => bff.close());
  const cookie = await authenticatedCookie(bff.baseUrl);
  const response = await fetch(`${bff.baseUrl}${workPlanPath(WORK_ID)}`, {
    headers: { Cookie: cookie, "X-Correlation-ID": CORRELATION_ID },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), AVAILABLE);
  assert.deepEqual(calls, [{ workId: WORK_ID, correlationId: CORRELATION_ID }]);

  const invalid = await fetch(`${bff.baseUrl}/api/work/%20/plan`, { headers: { Cookie: cookie } });
  assert.equal(invalid.status, 404);
});

test("GET Work Plan never discloses unexpected internal diagnostics", async (context) => {
  const bff = await startTestBff(testBffConfig(), {
    workPlanGateway: {
      async read() {
        throw new Error("C:/private/runtime.log stderr=secret");
      },
    },
  });
  context.after(() => bff.close());
  const cookie = await authenticatedCookie(bff.baseUrl);
  const response = await fetch(`${bff.baseUrl}${workPlanPath(WORK_ID)}`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 500);
  const raw = await response.text();
  assert.match(raw, /INTERNAL_ERROR/u);
  assert.doesNotMatch(raw, /private|runtime\.log|stderr|secret/u);
});

test("HTTP Work Plan Gateway resolves canonical Work identity and propagates correlation ID", async () => {
  const requests: Array<{ url: string; correlationId: string | null }> = [];
  const gateway = new HttpWorkPlanGateway("http://127.0.0.1:4100", async (input, init) => {
    const url = String(input);
    requests.push({ url, correlationId: new Headers(init?.headers).get("x-correlation-id") });
    return jsonResponse(url.endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : AVAILABLE);
  });
  assert.deepEqual(await gateway.read(WORK_ID, CORRELATION_ID), AVAILABLE);
  assert.deepEqual(requests, [
    { url: `http://127.0.0.1:4100${RUNTIME_ACTIVE_WORK_PATH}`, correlationId: CORRELATION_ID },
    { url: `http://127.0.0.1:4100${runtimeWorkPlanPath(PROJECT_ID, WORK_ID)}`, correlationId: CORRELATION_ID },
  ]);
});

test("HTTP Work Plan Gateway preserves absent, withdrawn and producer-unavailable states", async () => {
  for (const state of ["ABSENT", "WITHDRAWN", "UNAVAILABLE"] as const) {
    const expected: WorkPlanResponse = {
      plan: { workIdentity: { projectId: PROJECT_ID, workId: WORK_ID }, state },
    };
    const gateway = new HttpWorkPlanGateway("http://127.0.0.1:4100", async (input) =>
      jsonResponse(String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : expected));
    assert.deepEqual(await gateway.read(WORK_ID, CORRELATION_ID), expected);
  }
});

test("HTTP Work Plan Gateway translates missing Work, invalid contracts and Runtime failure safely", async () => {
  const missing = new HttpWorkPlanGateway("http://127.0.0.1:4100", async () => jsonResponse({ works: [] }));
  await assert.rejects(() => missing.read(WORK_ID, CORRELATION_ID), (error: unknown) =>
    error instanceof BffError && error.status === 404 && error.code === "WORK_NOT_FOUND");

  const invalid = new HttpWorkPlanGateway("http://127.0.0.1:4100", async (input) =>
    jsonResponse(String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH)
      ? ACTIVE_WORK
      : { plan: { ...AVAILABLE.plan, localPath: "C:/secret/runtime.log" } }));
  await assert.rejects(() => invalid.read(WORK_ID, CORRELATION_ID), (error: unknown) =>
    error instanceof BffError
    && error.status === 502
    && error.code === "RUNTIME_RESPONSE_INVALID"
    && !error.message.includes("C:/secret"));

  const unavailable = new HttpWorkPlanGateway("http://127.0.0.1:4100", async (input) =>
    String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH)
      ? jsonResponse(ACTIVE_WORK)
      : jsonResponse({ stderr: "sensitive" }, 500));
  await assert.rejects(() => unavailable.read(WORK_ID, CORRELATION_ID), (error: unknown) =>
    error instanceof BffError
    && error.status === 503
    && error.code === "RUNTIME_UNAVAILABLE"
    && !error.message.includes("sensitive"));
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function authenticatedCookie(baseUrl: string): Promise<string> {
  const anonymous = await fetch(`${baseUrl}/session`);
  const anonymousCookie = sessionCookiePair(anonymous.headers.get("set-cookie") ?? "");
  const csrf = anonymous.headers.get("x-csrf-token") ?? "";
  const login = await fetch(`${baseUrl}/session/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: anonymousCookie,
      Origin: "https://bff.test",
      "X-CSRF-Token": csrf,
    },
    body: JSON.stringify({ username: "active.operator", password: TEST_PASSWORD }),
  });
  assert.equal(login.status, 200);
  return sessionCookiePair(login.headers.get("set-cookie") ?? "");
}

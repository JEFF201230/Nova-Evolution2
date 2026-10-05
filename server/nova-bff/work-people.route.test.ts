import assert from "node:assert/strict";
import test from "node:test";
import { RUNTIME_ACTIVE_WORK_PATH, type HomeActiveWorkResponse } from "../../contracts/home-active-work.contract.js";
import { runtimeWorkPeoplePath, workPeoplePath, type WorkPeopleResponse } from "../../contracts/work-people.contract.js";
import { BffError } from "./bff.errors.js";
import { sessionCookiePair, startTestBff, TEST_PASSWORD, testBffConfig } from "./bff.test-support.js";
import { HttpWorkPeopleGateway } from "./work-people.gateway.js";

const CORRELATION_ID = "corr-work-people-001";
const PROJECT_ID = "NOVA";
const WORK_ID = "WORK-PEOPLE-001";
const ACTIVE_WORK: HomeActiveWorkResponse = { works: [{
  workIdentity: { projectId: PROJECT_ID, workId: WORK_ID }, mission: { projectId: PROJECT_ID, missionId: WORK_ID },
  goal: "Read People", lifecycle: "ACTIVE", progress: 10, updatedAt: "2026-10-03T10:00:00.000Z",
  provenance: {
    identity: { sourceDomain: "MISSIONS", producer: "ORCHESTRATOR_RUNTIME", sourceId: `${PROJECT_ID}/${WORK_ID}`, observedAt: "2026-10-03T10:00:00.000Z" },
    lifecycle: { sourceDomain: "WORK", producer: "WCF-001-LIFECYCLE-001", sourceId: `${PROJECT_ID}/${WORK_ID}/ACTIVE`, observedAt: "2026-10-03T10:00:00.000Z" },
    progress: { sourceDomain: "MONITORING", producer: "ORCHESTRATOR_OBSERVABILITY", sourceId: "obs", observedAt: "2026-10-03T10:00:00.000Z", sequence: 1, correlationId: CORRELATION_ID, runId: "run" },
  },
}] };
const AVAILABLE: WorkPeopleResponse = { people: {
  workIdentity: { projectId: PROJECT_ID, workId: WORK_ID }, state: "AVAILABLE",
  participants: [{ businessPersonId: "person-1", workAssignmentId: "assignment-1" }],
  qualification: { sourceDomain: "PEOPLE", aggregateRevision: 2, lastEventSequence: 3, qualifiedAt: "2026-10-03T10:00:00.000Z", provenance: { authority: "PEOPLE", businessCause: "assignment", effectiveAt: "2026-10-02T10:00:00.000Z" } },
} };
const EMPTY: WorkPeopleResponse = { people: {
  workIdentity: { projectId: PROJECT_ID, workId: WORK_ID }, state: "EMPTY", participants: [],
  qualification: { sourceDomain: "PEOPLE", aggregateRevision: 2, lastEventSequence: 3, qualifiedAt: "2026-10-03T10:00:00.000Z", provenance: { authority: "PEOPLE", businessCause: "assignment", effectiveAt: "2026-10-02T10:00:00.000Z" } },
} };

test("GET Work People requires authentication", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), { workPeopleGateway: { async read() { calls += 1; return AVAILABLE; } } });
  context.after(() => bff.close());
  const response = await fetch(`${bff.baseUrl}${workPeoplePath(WORK_ID)}`);
  assert.equal(response.status, 401);
  assert.equal(calls, 0);
});

test("GET Work People forwards workId and correlation ID", async (context) => {
  const calls: Array<{ workId: string; correlationId: string }> = [];
  const bff = await startTestBff(testBffConfig(), { workPeopleGateway: { async read(workId, correlationId) { calls.push({ workId, correlationId }); return AVAILABLE; } } });
  context.after(() => bff.close());
  const cookie = await authenticatedCookie(bff.baseUrl);
  const response = await fetch(`${bff.baseUrl}${workPeoplePath(WORK_ID)}`, { headers: { Cookie: cookie, "X-Correlation-ID": CORRELATION_ID } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), AVAILABLE);
  assert.deepEqual(calls, [{ workId: WORK_ID, correlationId: CORRELATION_ID }]);
});

test("HTTP Work People Gateway resolves canonical identity and preserves source absence states", async () => {
  for (const state of ["ABSENT", "EMPTY", "UNAVAILABLE"] as const) {
    const expected: WorkPeopleResponse = state === "EMPTY"
      ? EMPTY
      : { people: { workIdentity: { projectId: PROJECT_ID, workId: WORK_ID }, state } };
    const requests: string[] = [];
    const gateway = new HttpWorkPeopleGateway("http://127.0.0.1:4100", async (input) => {
      requests.push(String(input));
      return jsonResponse(String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : expected);
    });
    assert.deepEqual(await gateway.read(WORK_ID, CORRELATION_ID), expected);
    assert.equal(requests[1], `http://127.0.0.1:4100${runtimeWorkPeoplePath(PROJECT_ID, WORK_ID)}`);
  }
});

test("HTTP Work People Gateway rejects missing, invalid and inconsistent Runtime responses", async () => {
  const missing = new HttpWorkPeopleGateway("http://127.0.0.1:4100", async () => jsonResponse({ works: [] }));
  await assert.rejects(() => missing.read(WORK_ID, CORRELATION_ID), isBff(404, "WORK_NOT_FOUND"));
  const invalid = new HttpWorkPeopleGateway("http://127.0.0.1:4100", async (input) => jsonResponse(String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : { people: { ...AVAILABLE.people, secret: "C:/private" } }));
  await assert.rejects(() => invalid.read(WORK_ID, CORRELATION_ID), isBff(502, "RUNTIME_RESPONSE_INVALID"));
  const inconsistent = new HttpWorkPeopleGateway("http://127.0.0.1:4100", async (input) => jsonResponse(String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH) ? ACTIVE_WORK : { people: { ...AVAILABLE.people, workIdentity: { projectId: "OTHER", workId: WORK_ID } } }));
  await assert.rejects(() => inconsistent.read(WORK_ID, CORRELATION_ID), isBff(502, "RUNTIME_RESPONSE_INVALID"));
});

test("HTTP Work People Gateway normalizes Runtime failure and timeout", async () => {
  const unavailable = new HttpWorkPeopleGateway("http://127.0.0.1:4100", async (input) => String(input).endsWith(RUNTIME_ACTIVE_WORK_PATH) ? jsonResponse(ACTIVE_WORK) : jsonResponse({ diagnostic: "secret" }, 500));
  await assert.rejects(() => unavailable.read(WORK_ID, CORRELATION_ID), isBff(503, "RUNTIME_UNAVAILABLE"));
  const timeout = new HttpWorkPeopleGateway("http://127.0.0.1:4100", (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  }), 1);
  await assert.rejects(() => timeout.read(WORK_ID, CORRELATION_ID), isBff(504, "RUNTIME_TIMEOUT"));
});

function isBff(status: number, code: string) { return (error: unknown) => error instanceof BffError && error.status === status && error.code === code; }
function jsonResponse(body: unknown, status = 200): Response { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }); }
async function authenticatedCookie(baseUrl: string): Promise<string> {
  const anonymous = await fetch(`${baseUrl}/session`);
  const anonymousCookie = sessionCookiePair(anonymous.headers.get("set-cookie") ?? "");
  const login = await fetch(`${baseUrl}/session/login`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: anonymousCookie, Origin: "https://bff.test", "X-CSRF-Token": anonymous.headers.get("x-csrf-token") ?? "" }, body: JSON.stringify({ username: "active.operator", password: TEST_PASSWORD }) });
  assert.equal(login.status, 200);
  return sessionCookiePair(login.headers.get("set-cookie") ?? "");
}

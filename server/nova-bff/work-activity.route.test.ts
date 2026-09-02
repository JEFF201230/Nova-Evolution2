import assert from "node:assert/strict";
import test from "node:test";
import {
  runtimeMissionEventsPath,
  workActivityPath,
  type WorkActivityResponse,
  type WorkActivityRuntimeEvent,
} from "../../contracts/work-activity.contract.js";
import { BffError } from "./bff.errors.js";
import {
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "./bff.test-support.js";
import type { WorkActivityGatewayPort } from "./work-activity.gateway.port.js";
import { HttpWorkActivityGateway } from "./work-activity.gateway.js";

const CORRELATION_ID = "corr-work-activity-001";
const EVENT: WorkActivityRuntimeEvent = {
  eventId: "event-001",
  eventName: "AgentStarted",
  projectId: "NOVA-CORE",
  missionId: "work-001",
  runId: "run-001",
  correlationId: "runtime-correlation-001",
  sequence: 1,
  sourceState: "LOCKED",
  targetState: "RUNNING",
  producer: "orchestrator-runtime",
  occurredAt: "2026-07-30T10:00:00.000Z",
  publishedAt: "2026-07-30T10:00:00.001Z",
  payload: {},
  metadata: {},
};
const RESPONSE: WorkActivityResponse = {
  workIdentity: { workId: "work-001", projectId: "NOVA-CORE" },
  mission: { missionId: "work-001", projectId: "NOVA-CORE" },
  events: [EVENT],
};

test("GET Work Activity returns the authenticated capability contract", async (context) => {
  const calls: Array<{ workId: string; correlationId: string }> = [];
  const gateway: WorkActivityGatewayPort = {
    async read(workId, correlationId) {
      calls.push({ workId, correlationId });
      return RESPONSE;
    },
  };
  const bff = await startTestBff(testBffConfig(), { workActivityGateway: gateway });
  context.after(() => bff.close());
  const cookie = await authenticatedCookie(bff.baseUrl);

  const response = await fetch(`${bff.baseUrl}${workActivityPath("work-001")}`, {
    headers: { Cookie: cookie, "X-Correlation-ID": CORRELATION_ID },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), RESPONSE);
  assert.deepEqual(calls, [{ workId: "work-001", correlationId: CORRELATION_ID }]);
});

test("GET Work Activity returns 401 before calling its Gateway", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), {
    workActivityGateway: {
      async read() {
        calls += 1;
        return RESPONSE;
      },
    },
  });
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}${workActivityPath("work-001")}`);

  assert.equal(response.status, 401);
  assert.equal(
    (await response.json() as { error: { code: string } }).error.code,
    "AUTHENTICATION_REQUIRED",
  );
  assert.equal(calls, 0);
});

test("HTTP Work Activity Gateway resolves a real mission then calls only its GET events endpoint", async () => {
  const requests: Array<{
    url: string;
    method: string | undefined;
    correlationId: string | null;
  }> = [];
  const gateway = new HttpWorkActivityGateway(
    "http://127.0.0.1:4100",
    async (input, init) => {
      requests.push({
        url: String(input),
        method: init?.method,
        correlationId: new Headers(init?.headers).get("x-correlation-id"),
      });
      if (String(input).endsWith("/api/v1/missions")) {
        return jsonResponse({
          missions: [{ projectId: "NOVA-CORE", missionId: "work-001" }],
        });
      }
      return jsonResponse({ events: [EVENT] });
    },
  );

  assert.deepEqual(await gateway.read("work-001", CORRELATION_ID), RESPONSE);
  assert.deepEqual(requests, [
    {
      url: "http://127.0.0.1:4100/api/v1/missions",
      method: "GET",
      correlationId: CORRELATION_ID,
    },
    {
      url: `http://127.0.0.1:4100${runtimeMissionEventsPath("NOVA-CORE", "work-001")}`,
      method: "GET",
      correlationId: CORRELATION_ID,
    },
  ]);
});

test("HTTP Work Activity Gateway rejects invalid Runtime event contracts", async () => {
  const gateway = new HttpWorkActivityGateway(
    "http://127.0.0.1:4100",
    async (input) => String(input).endsWith("/api/v1/missions")
      ? jsonResponse({ missions: [{ projectId: "NOVA-CORE", missionId: "work-001" }] })
      : jsonResponse({ events: [{ ...EVENT, syntheticBusinessOwner: "forbidden" }] }),
  );

  await assert.rejects(
    () => gateway.read("work-001", CORRELATION_ID),
    (error: unknown) => error instanceof BffError
      && error.status === 502
      && error.code === "RUNTIME_RESPONSE_INVALID",
  );
});

test("HTTP Work Activity Gateway never guesses projectId for an ambiguous missionId", async () => {
  const gateway = new HttpWorkActivityGateway(
    "http://127.0.0.1:4100",
    async () => jsonResponse({
      missions: [
        { projectId: "PROJECT-A", missionId: "work-001" },
        { projectId: "PROJECT-B", missionId: "work-001" },
      ],
    }),
  );

  await assert.rejects(
    () => gateway.read("work-001", CORRELATION_ID),
    (error: unknown) => error instanceof BffError
      && error.status === 409
      && error.code === "WORK_ID_AMBIGUOUS",
  );
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
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

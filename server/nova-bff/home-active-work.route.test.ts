import assert from "node:assert/strict";
import test from "node:test";
import {
  HOME_ACTIVE_WORK_PATH,
  RUNTIME_ACTIVE_WORK_PATH,
  type HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import { BffError } from "./bff.errors.js";
import type {
  HomeActiveWorkGatewayPort,
} from "./home-active-work.gateway.port.js";
import { HttpHomeActiveWorkGateway } from "./home-active-work.gateway.js";
import {
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "./bff.test-support.js";

const CORRELATION_ID = "corr-home-active-work-001";
const RESPONSE: HomeActiveWorkResponse = {
  works: [{
    workIdentity: {
      workId: "HOME-001",
      projectId: "NOVA",
    },
    mission: {
      projectId: "NOVA",
      missionId: "HOME-001",
    },
    goal: "Connect HOME Active Work.",
    lifecycle: "ACTIVE",
    progress: 50,
    updatedAt: "2026-07-30T12:00:00.000Z",
    provenance: {
      identity: {
        sourceDomain: "MISSIONS",
        producer: "ORCHESTRATOR_RUNTIME",
        sourceId: "NOVA/HOME-001",
        observedAt: "2026-07-30T11:00:00.000Z",
      },
      lifecycle: {
        sourceDomain: "WORK",
        producer: "WCF-001-LIFECYCLE-001",
        sourceId: "NOVA/HOME-001/ACTIVE",
        observedAt: "2026-07-30T12:00:00.000Z",
      },
      progress: {
        sourceDomain: "MONITORING",
        producer: "ORCHESTRATOR_OBSERVABILITY",
        sourceId: "OBS-HOME-001",
        observedAt: "2026-07-30T12:00:00.000Z",
        sequence: 4,
        correlationId: CORRELATION_ID,
        runId: "RUN-HOME-001",
      },
    },
  }],
};

test("GET HOME Active Work returns the exact authenticated read contract", async (context) => {
  const correlations: string[] = [];
  const gateway: HomeActiveWorkGatewayPort = {
    async list(correlationId) {
      correlations.push(correlationId);
      return RESPONSE;
    },
  };
  const bff = await startTestBff(testBffConfig(), {
    homeActiveWorkGateway: gateway,
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const response = await fetch(
    `${bff.baseUrl}${HOME_ACTIVE_WORK_PATH}`,
    {
      headers: {
        Cookie: proof.cookie,
        "X-Correlation-ID": CORRELATION_ID,
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), RESPONSE);
  assert.deepEqual(correlations, [CORRELATION_ID]);
});

test("GET HOME Active Work requires an authenticated session", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), {
    homeActiveWorkGateway: {
      async list() {
        calls += 1;
        return RESPONSE;
      },
    },
  });
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}${HOME_ACTIVE_WORK_PATH}`);

  assert.equal(response.status, 401);
  assert.equal(
    (await response.json() as { error: { code: string } }).error.code,
    "AUTHENTICATION_REQUIRED",
  );
  assert.equal(calls, 0);
});

test("HTTP HOME Gateway calls only the Runtime read endpoint and validates it", async () => {
  const requests: Array<{ url: string; method: string | undefined }> = [];
  const gateway = new HttpHomeActiveWorkGateway(
    "http://127.0.0.1:4100",
    async (input, init) => {
      requests.push({
        url: String(input),
        method: init?.method,
      });
      return new Response(JSON.stringify(RESPONSE), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  );

  const response = await gateway.list(CORRELATION_ID);

  assert.deepEqual(response, RESPONSE);
  assert.deepEqual(requests, [{
    url: `http://127.0.0.1:4100${RUNTIME_ACTIVE_WORK_PATH}`,
    method: "GET",
  }]);
});

test("HTTP HOME Gateway rejects additional contract fields", async () => {
  const gateway = new HttpHomeActiveWorkGateway(
    "http://127.0.0.1:4100",
    async () => new Response(JSON.stringify({
      ...RESPONSE,
      intelligence: "forbidden",
    }), { status: 200 }),
  );

  await assert.rejects(
    () => gateway.list(CORRELATION_ID),
    (error: unknown) =>
      error instanceof BffError
      && error.status === 502
      && error.code === "RUNTIME_RESPONSE_INVALID",
  );
});

interface SessionProof {
  readonly cookie: string;
  readonly csrf: string;
}

async function authenticatedProof(baseUrl: string): Promise<SessionProof> {
  const anonymous = await fetch(`${baseUrl}/session`);
  const anonymousProof = proofFromResponse(anonymous);
  const login = await fetch(`${baseUrl}/session/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: anonymousProof.cookie,
      Origin: "https://bff.test",
      "X-CSRF-Token": anonymousProof.csrf,
    },
    body: JSON.stringify({
      username: "active.operator",
      password: TEST_PASSWORD,
    }),
  });
  assert.equal(login.status, 200);
  return proofFromResponse(login);
}

function proofFromResponse(response: Response): SessionProof {
  return {
    cookie: sessionCookiePair(response.headers.get("set-cookie") ?? ""),
    csrf: response.headers.get("x-csrf-token") ?? "",
  };
}

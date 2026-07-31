import assert from "node:assert/strict";
import test from "node:test";
import { BffError } from "./bff.errors.js";
import type {
  RuntimeGatewayPort,
  RuntimeGatewayRequestDto,
  RuntimeGatewayResponseDto,
} from "./runtime-gateway.port.js";
import {
  CapturingLogger,
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "./bff.test-support.js";

const ROUTE = "/api/runtime/execute";
const PROVIDED_CORRELATION_ID = "corr-bff-lot-004";

test("POST execute succeeds for an authenticated session and propagates the supplied correlation ID", async (context) => {
  const observed: RuntimeGatewayRequestDto[] = [];
  const gateway = gatewayExecuting((request) => {
    observed.push(request);
    return gatewayResponse(request.correlationId);
  });
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gateway,
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const response = await postExecute(
    bff.baseUrl,
    proof,
    validBody(PROVIDED_CORRELATION_ID),
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("x-correlation-id"),
    PROVIDED_CORRELATION_ID,
  );
  assert.deepEqual(await response.json(), {
    success: true,
    correlationId: PROVIDED_CORRELATION_ID,
    data: {
      missionId: "MISSION-BFF-LOT-004",
      executionSessionId: "SESSION-BFF-LOT-004",
      status: "CERTIFIED",
      runtime: {
        status: "SUCCESS",
        completedAt: "2026-07-28T18:00:00.000Z",
      },
      certification: {
        decision: "GO",
        bundleFingerprint: "a".repeat(64),
      },
    },
  });
  assert.deepEqual(observed, [{
    correlationId: PROVIDED_CORRELATION_ID,
    promptPackage: { missionId: "MISSION-BFF-LOT-004" },
    executionOptions: { executionSessionId: "SESSION-BFF-LOT-004" },
  }]);
  assert.equal("operation" in observed[0]!, false);
  assert.equal("unexpected" in observed[0]!, false);
});

test("POST execute rejects an absent session with 401 before CSRF", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gatewayExecuting((request) => {
      calls += 1;
      return gatewayResponse(request.correlationId);
    }),
  });
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}${ROUTE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://bff.test",
      "X-CSRF-Token": "invalid-without-session",
    },
    body: JSON.stringify(validBody()),
  });
  assert.equal(response.status, 401);
  assertRuntimeError(response, await response.json(), "AUTHENTICATION_REQUIRED");
  assert.equal(calls, 0);
});

test("POST execute rejects an invalid CSRF proof with 403", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gatewayExecuting((request) => {
      calls += 1;
      return gatewayResponse(request.correlationId);
    }),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const response = await postExecute(
    bff.baseUrl,
    { ...proof, csrf: "invalid-csrf-token" },
    validBody(),
  );
  assert.equal(response.status, 403);
  assertRuntimeError(response, await response.json(), "CSRF_TOKEN_INVALID");
  assert.equal(calls, 0);
});

test("POST execute rejects missing, empty, non-object and unknown request fields with 400", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gatewayExecuting((request) => {
      calls += 1;
      return gatewayResponse(request.correlationId);
    }),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);
  const cases: unknown[] = [
    { payload: validPayload() },
    { operation: "", payload: validPayload() },
    { operation: "execute" },
    { operation: "execute", payload: [] },
    { operation: "execute", payload: null },
    { ...validBody(), correlationId: "invalid correlation value" },
    { ...validBody(), unexpected: "must-not-pass" },
    {
      operation: "execute",
      payload: {
        ...validPayload(),
        unexpected: "must-not-pass",
      },
    },
  ];

  for (const body of cases) {
    const response = await postExecute(bff.baseUrl, proof, body);
    assert.equal(response.status, 400, JSON.stringify(body));
    assertRuntimeError(
      response,
      await response.json(),
      "RUNTIME_EXECUTE_REQUEST_INVALID",
    );
  }
  assert.equal(calls, 0);
});

test("POST execute rejects invalid JSON with 400", async (context) => {
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gatewayExecuting((request) =>
      gatewayResponse(request.correlationId)),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);
  const response = await fetch(`${bff.baseUrl}${ROUTE}`, {
    method: "POST",
    headers: mutationHeaders(proof),
    body: "{invalid-json",
  });
  assert.equal(response.status, 400);
  assertRuntimeError(response, await response.json(), "JSON_BODY_INVALID");
});

test("POST execute returns 422 for an unknown operation", async (context) => {
  let calls = 0;
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gatewayExecuting((request) => {
      calls += 1;
      return gatewayResponse(request.correlationId);
    }),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const response = await postExecute(bff.baseUrl, proof, {
    operation: "unknown-operation",
    payload: validPayload(),
  });
  assert.equal(response.status, 422);
  assertRuntimeError(response, await response.json(), "OPERATION_NOT_ALLOWED");
  assert.equal(calls, 0);
});

test("POST execute generates and propagates a correlation ID when absent", async (context) => {
  let observedCorrelationId = "";
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gatewayExecuting((request) => {
      observedCorrelationId = request.correlationId;
      return gatewayResponse(request.correlationId);
    }),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const response = await postExecute(bff.baseUrl, proof, validBody());
  const body = await response.json() as {
    success: true;
    correlationId: string;
  };
  assert.equal(response.status, 200);
  assert.match(body.correlationId, /^[0-9a-f-]{36}$/);
  assert.equal(observedCorrelationId, body.correlationId);
  assert.equal(response.headers.get("x-correlation-id"), body.correlationId);
});

test("POST execute preserves safe Gateway timeout and controlled Runtime errors", async (context) => {
  for (
    const [error, status, code] of [
      [
        new BffError(
          504,
          "RUNTIME_TIMEOUT",
          "The Runtime did not respond before the deadline.",
        ),
        504,
        "RUNTIME_TIMEOUT",
      ],
      [
        new BffError(
          502,
          "RUNTIME_ERROR",
          "The Runtime could not complete the request.",
        ),
        502,
        "RUNTIME_ERROR",
      ],
    ] as const
  ) {
    const bff = await startTestBff(testBffConfig(), {
      runtimeGateway: gatewayExecuting(() => {
        throw error;
      }),
    });
    context.after(() => bff.close());
    const proof = await authenticatedProof(bff.baseUrl);
    const response = await postExecute(bff.baseUrl, proof, validBody());
    assert.equal(response.status, status);
    assertRuntimeError(response, await response.json(), code);
  }
});

test("POST execute converts unexpected errors to a redacted 500 without leaking request, Runtime or logs", async (context) => {
  const logger = new CapturingLogger();
  const bff = await startTestBff(testBffConfig(), {
    logger,
    runtimeGateway: gatewayExecuting(() => {
      throw new Error("runtime-secret-stack-value-004");
    }),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);
  const body = validBody(PROVIDED_CORRELATION_ID);
  (body.payload.promptPackage as Record<string, unknown>).secret =
    "request-secret-value-004";

  const response = await postExecute(bff.baseUrl, proof, body);
  assert.equal(response.status, 500);
  const responseText = JSON.stringify(await response.json());
  assertRuntimeError(
    response,
    JSON.parse(responseText),
    "INTERNAL_ERROR",
  );
  const observable = `${responseText}\n${JSON.stringify(logger.records)}`;
  assert.doesNotMatch(observable, /runtime-secret-stack-value-004/);
  assert.doesNotMatch(observable, /request-secret-value-004/);
  assert.doesNotMatch(observable, /promptPackage|executionOptions/);
});

test("LOT 004 exposes no additional Runtime route", async (context) => {
  const bff = await startTestBff(testBffConfig(), {
    runtimeGateway: gatewayExecuting((request) =>
      gatewayResponse(request.correlationId)),
  });
  context.after(() => bff.close());
  const proof = await authenticatedProof(bff.baseUrl);

  const wrongMethod = await fetch(`${bff.baseUrl}${ROUTE}`);
  assert.equal(wrongMethod.status, 405);

  const unknownRoute = await fetch(`${bff.baseUrl}/api/runtime/unknown`, {
    method: "POST",
    headers: mutationHeaders(proof),
    body: JSON.stringify(validBody()),
  });
  assert.equal(unknownRoute.status, 404);
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
    headers: mutationHeaders(anonymousProof),
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

function mutationHeaders(proof: SessionProof): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Cookie: proof.cookie,
    Origin: "https://bff.test",
    "X-CSRF-Token": proof.csrf,
  };
}

function postExecute(
  baseUrl: string,
  proof: SessionProof,
  body: unknown,
): Promise<Response> {
  return fetch(`${baseUrl}${ROUTE}`, {
    method: "POST",
    headers: mutationHeaders(proof),
    body: JSON.stringify(body),
  });
}

function validBody(correlationId?: string): {
  operation: string;
  payload: {
    promptPackage: Record<string, unknown>;
    executionOptions: Record<string, unknown>;
  };
  correlationId?: string;
} {
  return {
    operation: "execute",
    payload: validPayload(),
    ...(correlationId ? { correlationId } : {}),
  };
}

function validPayload(): {
  promptPackage: Record<string, unknown>;
  executionOptions: Record<string, unknown>;
} {
  return {
    promptPackage: { missionId: "MISSION-BFF-LOT-004" },
    executionOptions: {
      executionSessionId: "SESSION-BFF-LOT-004",
    },
  };
}

function gatewayExecuting(
  execute: (
    request: RuntimeGatewayRequestDto,
  ) => RuntimeGatewayResponseDto | Promise<RuntimeGatewayResponseDto>,
): RuntimeGatewayPort {
  return {
    async execute(request): Promise<RuntimeGatewayResponseDto> {
      return await execute(request);
    },
  };
}

function gatewayResponse(
  correlationId: string,
): RuntimeGatewayResponseDto {
  return {
    correlationId,
    missionId: "MISSION-BFF-LOT-004",
    executionSessionId: "SESSION-BFF-LOT-004",
    status: "CERTIFIED",
    runtime: {
      status: "SUCCESS",
      completedAt: "2026-07-28T18:00:00.000Z",
    },
    certification: {
      decision: "GO",
      bundleFingerprint: "a".repeat(64),
    },
  };
}

function assertRuntimeError(
  response: Response,
  body: unknown,
  expectedCode: string,
): void {
  assert.deepEqual(body, {
    success: false,
    correlationId: response.headers.get("x-correlation-id"),
    error: {
      code: expectedCode,
      message: (body as {
        error: { message: string };
      }).error.message,
    },
  });
  const serialized = JSON.stringify(body);
  assert.doesNotMatch(serialized, /stack|details|evidenceBundle|persistedRecords/i);
}

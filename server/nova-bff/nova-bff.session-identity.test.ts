import assert from "node:assert/strict";
import type { ServerResponse } from "node:http";
import test from "node:test";
import type { IdentityProvider } from "./bff.identity.js";
import { readCookie } from "./bff.session.js";
import {
  CapturingLogger,
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "./bff.test-support.js";

interface SessionProof {
  readonly cookie: string;
  readonly csrf: string;
  readonly sessionId: string;
}

test("valid login rotates the anonymous session and exposes only the public contract", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const anonymous = await sessionProof(bff.baseUrl);
  const response = await login(bff.baseUrl, anonymous, {
    username: "active.operator",
    password: TEST_PASSWORD,
  });

  assert.equal(response.status, 200);
  const rotatedCookie = sessionCookiePair(response.headers.get("set-cookie") ?? "");
  const rotatedId = cookieId(rotatedCookie);
  assert.notEqual(rotatedId, anonymous.sessionId);
  assert.equal(await bff.application.sessionManager.store.read(anonymous.sessionId), null);
  const body = await response.json();
  assert.deepEqual(body, {
    authenticated: true,
    user: {
      userId: "user-active-001",
      username: "active.operator",
      displayName: "Active Operator",
      roles: ["OPERATOR"],
    },
    session: {
      authenticatedAt: (body as LoginView).session.authenticatedAt,
      expiresAt: (body as LoginView).session.expiresAt,
    },
  });
  assertNoInternalSessionFields(body);
  assert.match(response.headers.get("x-correlation-id") ?? "", /^[0-9a-f-]{36}$/);
  assert.match(response.headers.get("x-csrf-token") ?? "", /^[A-Za-z0-9_-]+$/);
});

test("wrong password and unknown user return the same generic response", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const correlationId = "same-auth-failure-002";
  const wrong = await login(
    bff.baseUrl,
    await sessionProof(bff.baseUrl),
    { username: "active.operator", password: "wrong-password" },
    correlationId,
  );
  const unknown = await login(
    bff.baseUrl,
    await sessionProof(bff.baseUrl),
    { username: "unknown.operator", password: "wrong-password" },
    correlationId,
  );
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual(await wrong.json(), await unknown.json());
});

test("disabled and locked users are refused with a generic forbidden response", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  for (const username of ["disabled.viewer", "locked.approver"]) {
    const response = await login(
      bff.baseUrl,
      await sessionProof(bff.baseUrl),
      { username, password: TEST_PASSWORD },
    );
    assert.equal(response.status, 403);
    const body = await response.json() as ErrorView;
    assert.equal(body.error.code, "AUTHENTICATION_FORBIDDEN");
    assert.equal(body.error.message, "Authentication failed.");
  }
});

test("login strictly rejects malformed JSON, missing credentials and unexpected fields", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const cases: Array<{ body: string; expectedCode: string }> = [
    { body: "{invalid", expectedCode: "JSON_BODY_INVALID" },
    {
      body: JSON.stringify({ username: "active.operator" }),
      expectedCode: "LOGIN_REQUEST_INVALID",
    },
    {
      body: JSON.stringify({
        username: "active.operator",
        password: TEST_PASSWORD,
        unexpected: true,
      }),
      expectedCode: "LOGIN_REQUEST_INVALID",
    },
  ];
  for (const item of cases) {
    const proof = await sessionProof(bff.baseUrl);
    const response = await fetch(`${bff.baseUrl}/session/login`, {
      method: "POST",
      headers: mutationHeaders(proof),
      body: item.body,
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json() as ErrorView).error.code, item.expectedCode);
  }
});

test("authenticated and anonymous session reads follow the exact response contracts", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const anonymousResponse = await fetch(`${bff.baseUrl}/session`);
  assert.deepEqual(await anonymousResponse.json(), { authenticated: false });
  const proof = proofFromResponse(anonymousResponse);
  const loginResponse = await login(bff.baseUrl, proof, {
    username: "active.operator",
    password: TEST_PASSWORD,
  });
  const authenticatedCookie = sessionCookiePair(loginResponse.headers.get("set-cookie") ?? "");
  const read = await fetch(`${bff.baseUrl}/session`, {
    headers: { Cookie: authenticatedCookie },
  });
  assert.equal(read.status, 200);
  const body = await read.json() as LoginView;
  assert.equal(body.authenticated, true);
  assert.equal(body.user.userId, "user-active-001");
  assertNoInternalSessionFields(body);
});

test("logout revokes, deletes, clears the cookie and is idempotent for an identical replay", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const anonymous = await sessionProof(bff.baseUrl);
  const loginResponse = await login(bff.baseUrl, anonymous, {
    username: "active.operator",
    password: TEST_PASSWORD,
  });
  const authenticated = proofFromResponse(loginResponse);

  const first = await logout(bff.baseUrl, authenticated);
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { authenticated: false });
  assert.match(first.headers.get("set-cookie") ?? "", /Max-Age=0/);
  assert.equal(await bff.application.sessionManager.store.read(authenticated.sessionId), null);
  assert.ok(await bff.application.sessionManager.store.readRevocation(authenticated.sessionId));

  const second = await logout(bff.baseUrl, authenticated);
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { authenticated: false });

  const staleRead = await fetch(`${bff.baseUrl}/session`, {
    headers: { Cookie: authenticated.cookie },
  });
  assert.deepEqual(await staleRead.json(), { authenticated: false });
  assert.notEqual(cookieId(sessionCookiePair(staleRead.headers.get("set-cookie") ?? "")), authenticated.sessionId);
});

test("expired sessions and pre-rotation cookies cannot be reused", async (context) => {
  let now = Date.parse("2026-07-28T00:00:00.000Z");
  const config = testBffConfig({
    sessionIdleTimeoutMs: 60_000,
    sessionAbsoluteTimeoutMs: 120_000,
    sessionRotationMs: 60_000,
  });
  const bff = await startTestBff(config, { clock: () => now });
  context.after(() => bff.close());
  const original = await sessionProof(bff.baseUrl);
  now += 60_001;
  const rotated = await fetch(`${bff.baseUrl}/session`, {
    headers: { Cookie: original.cookie },
  });
  const rotatedProof = proofFromResponse(rotated);
  assert.notEqual(rotatedProof.sessionId, original.sessionId);
  assert.equal(await bff.application.sessionManager.store.read(original.sessionId), null);

  const stale = await fetch(`${bff.baseUrl}/session`, {
    headers: { Cookie: original.cookie },
  });
  assert.deepEqual(await stale.json(), { authenticated: false });

  now += 120_001;
  const expired = await fetch(`${bff.baseUrl}/session`, {
    headers: { Cookie: rotatedProof.cookie },
  });
  assert.deepEqual(await expired.json(), { authenticated: false });
  assert.notEqual(cookieId(sessionCookiePair(expired.headers.get("set-cookie") ?? "")), rotatedProof.sessionId);
});

test("an authorization-level change rotates the session and CSRF binding", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const loginResponse = await login(
    bff.baseUrl,
    await sessionProof(bff.baseUrl),
    { username: "active.operator", password: TEST_PASSWORD },
  );
  const authenticated = proofFromResponse(loginResponse);
  const stored = await bff.application.sessionManager.store.read(authenticated.sessionId);
  assert.ok(stored);
  const headers = new Map<string, string | string[]>();
  const response = {
    getHeader(name: string) {
      return headers.get(name);
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name, value);
    },
  } as unknown as ServerResponse;
  const elevated = await bff.application.sessionManager.rotateAfterAuthorizationChange(
    response,
    stored,
    ["ADMIN"],
  );
  assert.notEqual(elevated.sessionId, stored.sessionId);
  assert.notEqual(elevated.csrfBinding, stored.csrfBinding);
  assert.deepEqual(elevated.roles, ["ADMIN"]);
  assert.equal(await bff.application.sessionManager.store.read(stored.sessionId), null);
});

test("CSRF is mandatory and a valid same-origin token permits login and logout", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const proof = await sessionProof(bff.baseUrl);
  const refused = await fetch(`${bff.baseUrl}/session/login`, {
    method: "POST",
    headers: {
      Cookie: proof.cookie,
      Origin: "https://bff.test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "active.operator",
      password: TEST_PASSWORD,
    }),
  });
  assert.equal(refused.status, 403);
  const accepted = await login(bff.baseUrl, proof, {
    username: "active.operator",
    password: TEST_PASSWORD,
  });
  assert.equal(accepted.status, 200);
  assert.equal((await logout(bff.baseUrl, proofFromResponse(accepted))).status, 200);
});

test("login limits oversized JSON and repeated failed attempts", async (context) => {
  const bff = await startTestBff(testBffConfig({
    maxJsonBodyBytes: 1_024,
    loginMaximumAttempts: 2,
  }));
  context.after(() => bff.close());
  const oversizedProof = await sessionProof(bff.baseUrl);
  const oversized = await fetch(`${bff.baseUrl}/session/login`, {
    method: "POST",
    headers: mutationHeaders(oversizedProof),
    body: JSON.stringify({
      username: "active.operator",
      password: "x".repeat(2_000),
    }),
  });
  assert.equal(oversized.status, 400);
  assert.equal((await oversized.json() as ErrorView).error.code, "JSON_BODY_TOO_LARGE");

  for (const expected of [401, 401, 429]) {
    const response = await login(
      bff.baseUrl,
      await sessionProof(bff.baseUrl),
      { username: "limited.user", password: "invalid" },
    );
    assert.equal(response.status, expected);
  }
});

test("authentication logs redact password, cookie and CSRF token", async (context) => {
  const logger = new CapturingLogger();
  const bff = await startTestBff(testBffConfig(), { logger });
  context.after(() => bff.close());
  const proof = await sessionProof(bff.baseUrl);
  await login(bff.baseUrl, proof, {
    username: "active.operator",
    password: TEST_PASSWORD,
  });
  const serialized = JSON.stringify(logger.records);
  assert.doesNotMatch(serialized, new RegExp(TEST_PASSWORD));
  assert.doesNotMatch(serialized, new RegExp(proof.sessionId));
  assert.doesNotMatch(serialized, new RegExp(proof.csrf));
});

test("unexpected identity provider errors return a redacted 500 response", async (context) => {
  const failingProvider: IdentityProvider = {
    async authenticate() {
      throw new Error("internal-sensitive-identity-detail");
    },
    async isReady() {
      return true;
    },
    async setStatus() {
      return false;
    },
  };
  const bff = await startTestBff(testBffConfig(), {
    identityProvider: failingProvider,
  });
  context.after(() => bff.close());
  const response = await login(
    bff.baseUrl,
    await sessionProof(bff.baseUrl),
    { username: "active.operator", password: TEST_PASSWORD },
  );
  assert.equal(response.status, 500);
  const serialized = JSON.stringify(await response.json());
  assert.match(serialized, /INTERNAL_ERROR/);
  assert.doesNotMatch(serialized, /internal-sensitive|stack|password/i);
});

test("readiness fails closed when no server identity is configured", async (context) => {
  const emptyProvider: IdentityProvider = {
    async authenticate() {
      return { outcome: "INVALID" };
    },
    async isReady() {
      return false;
    },
    async setStatus() {
      return false;
    },
  };
  const bff = await startTestBff(testBffConfig(), {
    identityProvider: emptyProvider,
  });
  context.after(() => bff.close());
  const response = await fetch(`${bff.baseUrl}/readiness`);
  assert.equal(response.status, 503);
  assert.equal(
    (await response.json() as { checks: { identityProvider: string } })
      .checks.identityProvider,
    "not_ready",
  );
});

async function sessionProof(baseUrl: string): Promise<SessionProof> {
  return proofFromResponse(await fetch(`${baseUrl}/session`));
}

function proofFromResponse(response: Response): SessionProof {
  const cookie = sessionCookiePair(response.headers.get("set-cookie") ?? "");
  return {
    cookie,
    csrf: response.headers.get("x-csrf-token") ?? "",
    sessionId: cookieId(cookie),
  };
}

async function login(
  baseUrl: string,
  proof: SessionProof,
  body: Readonly<Record<string, unknown>>,
  correlationId?: string,
): Promise<Response> {
  return fetch(`${baseUrl}/session/login`, {
    method: "POST",
    headers: {
      ...mutationHeaders(proof),
      ...(correlationId ? { "X-Correlation-ID": correlationId } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function logout(baseUrl: string, proof: SessionProof): Promise<Response> {
  return fetch(`${baseUrl}/session/logout`, {
    method: "POST",
    headers: {
      Cookie: proof.cookie,
      Origin: "https://bff.test",
      "X-CSRF-Token": proof.csrf,
    },
  });
}

function mutationHeaders(proof: SessionProof): Record<string, string> {
  return {
    Cookie: proof.cookie,
    Origin: "https://bff.test",
    "Content-Type": "application/json",
    "X-CSRF-Token": proof.csrf,
  };
}

function cookieId(cookie: string): string {
  const value = readCookie(cookie, "__Host-nova_session");
  assert.ok(value);
  return value;
}

function assertNoInternalSessionFields(body: unknown): void {
  const serialized = JSON.stringify(body);
  for (const forbidden of [
    "sessionId",
    "password",
    "passwordHash",
    "salt",
    "csrfBinding",
    "secret",
    "attestationKey",
  ]) {
    assert.doesNotMatch(serialized, new RegExp(forbidden, "i"));
  }
}

interface LoginView {
  readonly authenticated: true;
  readonly user: {
    readonly userId: string;
    readonly username: string;
    readonly displayName: string;
    readonly roles: readonly string[];
  };
  readonly session: {
    readonly authenticatedAt: string;
    readonly expiresAt: string;
  };
}

interface ErrorView {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly correlationId: string;
  };
}

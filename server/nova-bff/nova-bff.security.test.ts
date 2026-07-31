import assert from "node:assert/strict";
import test from "node:test";
import { loadBffConfig } from "./bff.config.js";
import { BffError } from "./bff.errors.js";
import {
  publicSessionView,
  readCookie,
} from "./bff.session.js";
import {
  sessionCookiePair,
  startTestBff,
  TEST_PASSWORD,
  testBffConfig,
} from "./bff.test-support.js";

test("production configuration fails closed without TLS or a trusted proxy", () => {
  assert.throws(
    () => loadBffConfig({
      BFF_ENV: "production",
      BFF_PUBLIC_ORIGIN: "https://nova.example",
      BFF_RUNTIME_ORIGIN: "http://127.0.0.1:4100",
    }),
    (error: unknown) => error instanceof BffError
      && error.code === "HTTPS_TERMINATION_REQUIRED",
  );
});

test("production accepts an explicit local trusted HTTPS proxy", () => {
  const config = loadBffConfig({
    BFF_ENV: "production",
    BFF_PUBLIC_ORIGIN: "https://nova.example",
    BFF_RUNTIME_ORIGIN: "http://127.0.0.1:4100",
    BFF_TRUST_PROXY: "true",
    BFF_TRUSTED_PROXY_ADDRESSES: "127.0.0.1,::ffff:127.0.0.1",
  });
  assert.equal(config.requireHttps, true);
  assert.equal(config.trustProxy, true);
  assert.equal(config.runtimeOrigin, "http://127.0.0.1:4100");
});

test("an insecure non-loopback Runtime proxy origin is rejected", () => {
  assert.throws(
    () => loadBffConfig({
      BFF_ENV: "test",
      BFF_RUNTIME_ORIGIN: "http://runtime.internal:4100",
    }),
    (error: unknown) => error instanceof BffError
      && error.code === "RUNTIME_ORIGIN_INSECURE",
  );
});

test("HTTPS enforcement rejects clear text and accepts a trusted proxy assertion", async (context) => {
  const rejected = await startTestBff(testBffConfig({
    requireHttps: true,
  }));
  context.after(() => rejected.close());
  const rejectedResponse = await fetch(`${rejected.baseUrl}/health`);
  assert.equal(rejectedResponse.status, 400);
  assert.equal(
    (await rejectedResponse.json() as { error: { code: string } }).error.code,
    "HTTPS_REQUIRED",
  );

  const accepted = await startTestBff(testBffConfig({
    requireHttps: true,
    trustProxy: true,
  }));
  context.after(() => accepted.close());
  const acceptedResponse = await fetch(`${accepted.baseUrl}/health`, {
    headers: { "X-Forwarded-Proto": "https" },
  });
  assert.equal(acceptedResponse.status, 200);
  assert.match(
    acceptedResponse.headers.get("strict-transport-security") ?? "",
    /max-age=31536000/,
  );
});

test("CSRF rejects missing tokens, wrong origins and cross-site requests", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const sessionResponse = await fetch(`${bff.baseUrl}/session`);
  const csrfToken = sessionResponse.headers.get("x-csrf-token") ?? "";
  const cookie = sessionCookiePair(sessionResponse.headers.get("set-cookie") ?? "");

  const missingToken = await fetch(`${bff.baseUrl}/not-a-route`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  assert.equal(missingToken.status, 403);
  assert.equal(
    (await missingToken.json() as { error: { code: string } }).error.code,
    "CSRF_TOKEN_INVALID",
  );

  const wrongOrigin = await fetch(`${bff.baseUrl}/not-a-route`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: "https://attacker.example",
      "X-CSRF-Token": csrfToken,
    },
  });
  assert.equal(wrongOrigin.status, 403);
  assert.equal(
    (await wrongOrigin.json() as { error: { code: string } }).error.code,
    "CSRF_ORIGIN_REJECTED",
  );

  const crossSite = await fetch(`${bff.baseUrl}/not-a-route`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: "https://bff.test",
      "Sec-Fetch-Site": "cross-site",
      "X-CSRF-Token": csrfToken,
    },
  });
  assert.equal(crossSite.status, 403);
  assert.equal(
    (await crossSite.json() as { error: { code: string } }).error.code,
    "CSRF_CROSS_SITE_REJECTED",
  );
});

test("a valid same-origin CSRF proof reaches routing but cannot reach business logic", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const sessionResponse = await fetch(`${bff.baseUrl}/session`);
  const csrfToken = sessionResponse.headers.get("x-csrf-token") ?? "";
  const cookie = sessionCookiePair(sessionResponse.headers.get("set-cookie") ?? "");

  const response = await fetch(`${bff.baseUrl}/api/v2/missions`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: "https://bff.test",
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ objective: "must not execute" }),
  });
  assert.equal(response.status, 404);
  assert.equal(
    (await response.json() as { error: { code: string } }).error.code,
    "ROUTE_NOT_FOUND",
  );
});

test("login rotates the session identifier and preserves hardened cookie flags", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const response = await fetch(`${bff.baseUrl}/session`);
  const cookieHeader = response.headers.get("set-cookie") ?? "";
  const anonymousId = readCookie(
    sessionCookiePair(cookieHeader),
    "__Host-nova_session",
  );
  assert.ok(anonymousId);
  const anonymous = await bff.application.sessionManager.store.read(anonymousId);
  assert.ok(anonymous);
  const csrfToken = response.headers.get("x-csrf-token") ?? "";
  const login = await fetch(`${bff.baseUrl}/session/login`, {
    method: "POST",
    headers: {
      Cookie: sessionCookiePair(cookieHeader),
      Origin: "https://bff.test",
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      username: "active.operator",
      password: TEST_PASSWORD,
    }),
  });
  assert.equal(login.status, 200);
  const rotatedCookieHeader = login.headers.get("set-cookie") ?? "";
  const authenticatedId = readCookie(
    sessionCookiePair(rotatedCookieHeader),
    "__Host-nova_session",
  );
  assert.ok(authenticatedId);
  assert.notEqual(authenticatedId, anonymous.sessionId);
  assert.equal(
    await bff.application.sessionManager.store.read(anonymous.sessionId),
    null,
  );
  const authenticated = await bff.application.sessionManager.store.read(authenticatedId);
  assert.ok(authenticated);
  assert.deepEqual(publicSessionView(authenticated).authenticated, true);
  assert.deepEqual(publicSessionView(authenticated), {
    authenticated: true,
    user: {
      userId: "user-active-001",
      username: "active.operator",
      displayName: "Active Operator",
      roles: ["OPERATOR"],
    },
    session: {
      authenticatedAt: authenticated.authenticatedAt,
      expiresAt: authenticated.expiresAt,
    },
  });
  assert.equal("sessionId" in publicSessionView(authenticated), false);
  assert.match(rotatedCookieHeader, /HttpOnly; Secure; SameSite=Strict/);
});

test("invalid correlation identifiers are replaced", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const injected = "invalid value with spaces";
  const response = await fetch(`${bff.baseUrl}/health`, {
    headers: { "X-Correlation-ID": injected },
  });
  assert.equal(response.status, 200);
  const actual = response.headers.get("x-correlation-id");
  assert.ok(actual);
  assert.notEqual(actual, injected);
  assert.match(actual, /^[0-9a-f-]{36}$/);
});

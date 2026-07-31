import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import type {
  ServerSession,
  SessionStore,
} from "./bff.session.js";
import {
  CapturingLogger,
  sessionCookiePair,
  startTestBff,
  testBffConfig,
} from "./bff.test-support.js";
import { startNovaBff } from "./nova-bff.server.js";

test("the BFF production entry module starts and serves health", async (context) => {
  const logger = new CapturingLogger();
  const server = await startNovaBff(testBffConfig(), logger);
  context.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const address = server.address() as AddressInfo;
  const response = await fetch(`http://127.0.0.1:${address.port}/health`);
  assert.equal(response.status, 200);
  assert.equal(
    logger.records.some((record) => record.event === "server.started"),
    true,
  );
});

test("GET /health exposes only liveness and security headers", async (context) => {
  const logger = new CapturingLogger();
  const bff = await startTestBff(testBffConfig(), { logger });
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}/health`, {
    headers: {
      Authorization: "Bearer log-secret-auth-001",
      Cookie: "__Host-nova_session=log-secret-cookie-value-1234567890abcdef",
      "X-Correlation-ID": "corr-health-001",
      "X-CSRF-Token": "log-secret-csrf-001",
    },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "nova-secure-bff",
  });
  assert.equal(response.headers.get("x-correlation-id"), "corr-health-001");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("cache-control"), "no-store");

  const completed = logger.records.find(
    (record) => record.event === "request.completed",
  );
  assert.equal(completed?.fields.correlationId, "corr-health-001");
  assert.equal(completed?.fields.path, "/health");
  assert.equal(completed?.fields.status, 200);
  const serializedLogs = JSON.stringify(logger.records);
  assert.doesNotMatch(serializedLogs, /log-secret-auth-001/);
  assert.doesNotMatch(serializedLogs, /log-secret-cookie-value/);
  assert.doesNotMatch(serializedLogs, /log-secret-csrf-001/);
});

test("GET /readiness validates local security dependencies without contacting Runtime", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}/readiness`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ready",
    checks: {
      identityProvider: "ready",
      sessionStore: "ready_non_durable",
      sessionRoundTrip: "ready",
      securityConfiguration: "ready",
      productionDurability: "ready",
      runtimeProxyConfiguration: "configured_not_connected",
    },
  });
});

test("GET /readiness fails closed when the session store is unavailable", async (context) => {
  const unavailableStore: SessionStore = {
    durability: "non_durable",
    async create(_session: ServerSession): Promise<void> {},
    async read(_sessionId: string): Promise<ServerSession | null> {
      return null;
    },
    async renew(_id, _version, _session): Promise<void> {},
    async rotate(_id, _version, _session): Promise<void> {},
    async revoke(_id, _version): Promise<void> {},
    async delete(_sessionId: string): Promise<void> {},
    async readRevocation() {
      return null;
    },
    async isReady(): Promise<boolean> {
      return false;
    },
    async probe(): Promise<boolean> {
      return false;
    },
  };
  const bff = await startTestBff(testBffConfig(), {
    sessionStore: unavailableStore,
  });
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}/readiness`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    status: "not_ready",
    checks: {
      identityProvider: "ready",
      sessionStore: "not_ready",
      sessionRoundTrip: "not_ready",
      securityConfiguration: "ready",
      productionDurability: "ready",
      runtimeProxyConfiguration: "configured_not_connected",
    },
  });
});

test("GET /version returns only public build metadata", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}/version`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    service: "nova-secure-bff",
    component: "nova-bff",
    version: "0.1.0-test",
    commit: "test-commit",
    buildTime: "2026-07-28T00:00:00.000Z",
    capabilities: [
      "security-foundation",
      "session-identity",
    ],
  });
});

test("GET /session creates an anonymous server session and a hardened cookie", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());

  const response = await fetch(`${bff.baseUrl}/session`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { authenticated: false });
  const csrfToken = response.headers.get("x-csrf-token");
  assert.match(csrfToken ?? "", /^[A-Za-z0-9_-]{32,128}$/);

  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie);
  assert.match(setCookie, /^__Host-nova_session=[A-Za-z0-9_-]+;/);
  assert.match(setCookie, /; Path=\//);
  assert.match(setCookie, /; HttpOnly/);
  assert.match(setCookie, /; Secure/);
  assert.match(setCookie, /; SameSite=Strict/);
  assert.doesNotMatch(setCookie, /Domain=/i);

  const continued = await fetch(`${bff.baseUrl}/session`, {
    headers: { Cookie: sessionCookiePair(setCookie) },
  });
  assert.equal(continued.headers.get("x-csrf-token"), csrfToken);
});

test("unknown business and proxy routes remain closed", async (context) => {
  const logger = new CapturingLogger();
  const bff = await startTestBff(testBffConfig(), { logger });
  context.after(() => bff.close());

  for (const path of [
    "/",
    "/api/v1/missions",
    "/api/v2/missions",
    "/runtime",
    "/execute",
  ]) {
    const response = await fetch(`${bff.baseUrl}${path}`);
    assert.equal(response.status, 404, path);
    const body = await response.json() as { error: { code: string } };
    assert.equal(body.error.code, "ROUTE_NOT_FOUND", path);
    assert.doesNotMatch(JSON.stringify(body), /stack|server[\\/]nova-bff/i);
  }
  const completed404 = logger.records.find(
    (record) => record.event === "request.completed"
      && record.fields.path === "/api/v2/missions",
  );
  assert.equal(completed404?.fields.status, 404);
});

test("technical endpoints reject non-GET methods", async (context) => {
  const bff = await startTestBff();
  context.after(() => bff.close());
  const sessionResponse = await fetch(`${bff.baseUrl}/session`);
  const csrfToken = sessionResponse.headers.get("x-csrf-token") ?? "";
  const cookie = sessionCookiePair(sessionResponse.headers.get("set-cookie") ?? "");

  const response = await fetch(`${bff.baseUrl}/health`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      Origin: "https://bff.test",
      "X-CSRF-Token": csrfToken,
    },
  });
  assert.equal(response.status, 405);
  assert.equal(
    (await response.json() as { error: { code: string } }).error.code,
    "METHOD_NOT_ALLOWED",
  );
});

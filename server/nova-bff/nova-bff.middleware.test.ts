import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import type { IncomingMessage, ServerResponse } from "node:http";
import { BffError } from "./bff.errors.js";
import { LoginAttemptLimiter, type IdentityProvider } from "./bff.identity.js";
import {
  type BffRole,
  InMemorySessionStore,
  SessionManager,
  type ServerSession,
} from "./bff.session.js";
import type { BffRequestContext } from "./bff.types.js";
import { CapturingLogger, testBffConfig } from "./bff.test-support.js";
import { requireAuthentication } from "./middleware/authentication.js";
import { jsonBodyMiddleware } from "./middleware/json-body.js";
import { requireAnyRole } from "./middleware/rbac.js";

test("authentication middleware rejects anonymous sessions and accepts authenticated sessions", async () => {
  const anonymous = testContext(null);
  await assert.rejects(
    requireAuthentication(anonymous, async () => undefined),
    hasCode("AUTHENTICATION_REQUIRED"),
  );

  const authenticated = testContext(session(["OPERATOR"]));
  let reached = false;
  await requireAuthentication(authenticated, async () => {
    reached = true;
  });
  assert.equal(reached, true);
});

test("RBAC middleware enforces the configured role set", async () => {
  const operator = testContext(session(["OPERATOR"]));
  await assert.rejects(
    requireAnyRole(["APPROVER"])(operator, async () => undefined),
    hasCode("ROLE_FORBIDDEN"),
  );

  const approver = testContext(session(["VIEWER", "APPROVER"]));
  let reached = false;
  await requireAnyRole(["APPROVER", "ADMIN"])(approver, async () => {
    reached = true;
  });
  assert.equal(reached, true);
});

test("JSON middleware parses objects and rejects arrays or invalid content types", async () => {
  const valid = testContext(null, requestWithBody(
    JSON.stringify({ safe: true }),
    "application/json; charset=utf-8",
  ));
  await jsonBodyMiddleware(valid, async () => undefined);
  assert.deepEqual(valid.jsonBody, { safe: true });

  const array = testContext(null, requestWithBody(
    JSON.stringify(["not", "an", "object"]),
    "application/json",
  ));
  await assert.rejects(
    jsonBodyMiddleware(array, async () => undefined),
    hasCode("JSON_OBJECT_REQUIRED"),
  );

  const text = testContext(null, requestWithBody("plain text", "text/plain"));
  await assert.rejects(
    jsonBodyMiddleware(text, async () => undefined),
    hasCode("JSON_CONTENT_TYPE_REQUIRED"),
  );
});

test("JSON middleware enforces the configured byte limit", async () => {
  const request = requestWithBody(
    JSON.stringify({ value: "x".repeat(2_000) }),
    "application/json",
  );
  const context = testContext(null, request);
  const config = testBffConfig({ maxJsonBodyBytes: 1_024 });
  Object.assign(context, { config });
  await assert.rejects(
    jsonBodyMiddleware(context, async () => undefined),
    hasCode("JSON_BODY_TOO_LARGE"),
  );
});

function testContext(
  currentSession: ServerSession | null,
  request: IncomingMessage = requestWithBody("", "application/json", "GET"),
): BffRequestContext {
  const config = testBffConfig();
  return {
    request,
    response: {} as ServerResponse,
    config,
    logger: new CapturingLogger(),
    sessionManager: new SessionManager(
      new InMemorySessionStore(10),
      config.sessionCookieName,
      {
        idleTimeoutMs: config.sessionIdleTimeoutMs,
        absoluteTimeoutMs: config.sessionAbsoluteTimeoutMs,
        rotationMs: config.sessionRotationMs,
      },
    ),
    identityProvider: unavailableIdentityProvider,
    loginAttemptLimiter: new LoginAttemptLimiter(5, 60_000),
    startedAt: Date.now(),
    correlationId: "corr-middleware-001",
    pathname: "/test",
    isSecure: true,
    session: currentSession,
    jsonBody: null,
  };
}

function requestWithBody(
  body: string,
  contentType: string,
  method = "POST",
): IncomingMessage {
  const stream = Readable.from(body ? [Buffer.from(body)] : []);
  return Object.assign(stream, {
    method,
    headers: {
      "content-length": String(Buffer.byteLength(body)),
      "content-type": contentType,
    },
  }) as unknown as IncomingMessage;
}

function session(
  roles: BffRole[],
): ServerSession {
  return {
    sessionId: "s".repeat(43),
    userId: "operator-001",
    username: "operator",
    displayName: "Operator",
    roles,
    authenticatedAt: "2026-07-28T00:00:00.000Z",
    lastActivityAt: "2026-07-28T00:00:00.000Z",
    expiresAt: "2026-07-28T01:00:00.000Z",
    csrfBinding: "c".repeat(43),
    sessionVersion: 1,
    createdAt: "2026-07-28T00:00:00.000Z",
    absoluteExpiresAt: "2026-07-28T08:00:00.000Z",
    rotatedAt: "2026-07-28T00:00:00.000Z",
    revokedAt: null,
  };
}

const unavailableIdentityProvider: IdentityProvider = {
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

function hasCode(code: string): (error: unknown) => boolean {
  return (error: unknown) => error instanceof BffError && error.code === code;
}

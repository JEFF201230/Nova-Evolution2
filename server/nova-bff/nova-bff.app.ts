import type { IncomingMessage, RequestListener, ServerResponse } from "node:http";
import { BffError, asBffError } from "./bff.errors.js";
import type { BffConfig } from "./bff.config.js";
import { sendJson } from "./bff.http.js";
import {
  LocalIdentityProvider,
  LoginAttemptLimiter,
  isUsername,
  type IdentityProvider,
} from "./bff.identity.js";
import { JsonConsoleLogger, type BffLogger } from "./bff.logger.js";
import {
  RUNTIME_EXECUTE_PATH,
} from "./runtime-execute.contract.js";
import {
  HOME_ACTIVE_WORK_PATH,
  handleHomeActiveWork,
} from "./home-active-work.route.js";
import type {
  HomeActiveWorkGatewayPort,
} from "./home-active-work.gateway.port.js";
import {
  handleRuntimeExecute,
  runtimeExecuteAuthenticationMiddleware,
} from "./runtime-execute.route.js";
import type { RuntimeGatewayPort } from "./runtime-gateway.port.js";
import {
  handleWorkActivity,
  workIdFromActivityPath,
} from "./work-activity.route.js";
import type { WorkActivityGatewayPort } from "./work-activity.gateway.port.js";
import {
  InMemorySessionStore,
  SessionManager,
  publicSessionView,
  type SessionStore,
} from "./bff.session.js";
import { composeMiddleware, type BffRequestContext } from "./bff.types.js";
import { correlationIdMiddleware } from "./middleware/correlation-id.js";
import { csrfMiddleware } from "./middleware/csrf.js";
import { errorHandlerMiddleware } from "./middleware/error-handler.js";
import { jsonBodyMiddleware } from "./middleware/json-body.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.js";
import { requireCapability } from "./middleware/rbac.js";
import { securityHeadersMiddleware } from "./middleware/security.js";
import { sessionMiddleware } from "./middleware/session.js";

export interface NovaBffDependencies {
  readonly logger?: BffLogger;
  readonly sessionStore?: SessionStore;
  readonly identityProvider?: IdentityProvider;
  readonly runtimeGateway?: RuntimeGatewayPort;
  readonly homeActiveWorkGateway?: HomeActiveWorkGatewayPort;
  readonly workActivityGateway?: WorkActivityGatewayPort;
  readonly clock?: () => number;
}

export interface NovaBffApplication {
  readonly handler: RequestListener;
  readonly sessionManager: SessionManager;
  readonly identityProvider: IdentityProvider;
}

export function createNovaBffApplication(
  config: BffConfig,
  dependencies: NovaBffDependencies = {},
): NovaBffApplication {
  const logger = dependencies.logger ?? new JsonConsoleLogger();
  const clock = dependencies.clock ?? Date.now;
  const sessionStore = dependencies.sessionStore
    ?? new InMemorySessionStore(config.maxSessions, clock);
  const sessionManager = new SessionManager(
    sessionStore,
    config.sessionCookieName,
    {
      idleTimeoutMs: config.sessionIdleTimeoutMs,
      absoluteTimeoutMs: config.sessionAbsoluteTimeoutMs,
      rotationMs: config.sessionRotationMs,
    },
    clock,
  );
  const identityProvider = dependencies.identityProvider
    ?? new LocalIdentityProvider(config.localIdentityRecords);
  const loginAttemptLimiter = new LoginAttemptLimiter(
    config.loginMaximumAttempts,
    config.loginAttemptWindowMs,
    clock,
  );

  const pipeline = composeMiddleware([
    correlationIdMiddleware,
    requestLoggerMiddleware,
    errorHandlerMiddleware,
    securityHeadersMiddleware,
    sessionMiddleware,
    runtimeExecuteAuthenticationMiddleware,
    csrfMiddleware,
    jsonBodyMiddleware,
    createBffRouter(
      dependencies.runtimeGateway,
      dependencies.homeActiveWorkGateway,
      dependencies.workActivityGateway,
    ),
  ]);

  const handler: RequestListener = (request, response) => {
    const context = createContext(
      request,
      response,
      config,
      logger,
      sessionManager,
      identityProvider,
      loginAttemptLimiter,
      clock(),
    );
    void pipeline(context, async () => undefined).catch((error: unknown) => {
      const safeError = asBffError(error);
      logger.error("request.unhandled_error", {
        correlationId: context.correlationId || "unavailable",
        code: safeError.code,
        status: safeError.status,
      });
      sendJson(response, safeError.status, {
        error: {
          code: safeError.code,
          message: safeError.message,
          correlationId: context.correlationId || "unavailable",
        },
      });
    });
  };

  return { handler, sessionManager, identityProvider };
}

function createBffRouter(
  runtimeGateway: RuntimeGatewayPort | undefined,
  homeActiveWorkGateway: HomeActiveWorkGatewayPort | undefined,
  workActivityGateway: WorkActivityGatewayPort | undefined,
) {
  return async (
    context: BffRequestContext,
    _next: () => Promise<void>,
  ): Promise<void> => {
    const workId = workIdFromActivityPath(context.pathname);
    const publicPaths = new Set([
      "/health",
      "/readiness",
      "/version",
      "/session",
      "/session/login",
      "/session/logout",
      RUNTIME_EXECUTE_PATH,
      HOME_ACTIVE_WORK_PATH,
    ]);
    if (publicPaths.has(context.pathname) && !isAllowedMethod(context)) {
      throw new BffError(
        405,
        "METHOD_NOT_ALLOWED",
        "This endpoint does not accept the requested method.",
      );
    }
    if (workId && context.request.method !== "GET") {
      throw new BffError(
        405,
        "METHOD_NOT_ALLOWED",
        "This endpoint does not accept the requested method.",
      );
    }

    if (context.request.method === "GET" && context.pathname === "/health") {
      sendJson(context.response, 200, {
        status: "ok",
        service: "nova-secure-bff",
      });
      return;
    }

    if (context.request.method === "GET" && context.pathname === "/readiness") {
      await handleReadiness(context);
      return;
    }

    if (context.request.method === "GET" && context.pathname === "/version") {
      sendJson(context.response, 200, {
        service: "nova-secure-bff",
        component: "nova-bff",
        version: context.config.version,
        commit: context.config.commit,
        buildTime: context.config.buildTime,
        capabilities: [
          "security-foundation",
          "session-identity",
        ],
      });
      return;
    }

    if (context.request.method === "GET" && context.pathname === "/session") {
      await handleSessionRead(context);
      return;
    }

    if (context.request.method === "POST" && context.pathname === "/session/login") {
      await handleLogin(context);
      return;
    }

    if (context.request.method === "POST" && context.pathname === "/session/logout") {
      await handleLogout(context);
      return;
    }

    if (
      context.request.method === "POST"
      && context.pathname === RUNTIME_EXECUTE_PATH
    ) {
      await handleRuntimeExecute(context, runtimeGateway);
      return;
    }

    if (
      context.request.method === "GET"
      && context.pathname === HOME_ACTIVE_WORK_PATH
    ) {
      await handleHomeActiveWork(context, homeActiveWorkGateway);
      return;
    }

    if (context.request.method === "GET" && workId) {
      await handleWorkActivity(context, workActivityGateway, workId);
      return;
    }

    throw new BffError(404, "ROUTE_NOT_FOUND", "No BFF route matches this request.");
  };
}

async function handleSessionRead(context: BffRequestContext): Promise<void> {
  const session = context.session
    ?? await context.sessionManager.resolve(
      context.request,
      context.response,
      true,
    );
  if (!session) {
    throw new BffError(
      500,
      "SESSION_CREATION_FAILED",
      "The server session could not be created.",
    );
  }
  context.session = session;
  context.response.setHeader("X-CSRF-Token", session.csrfBinding);
  if (session.userId) {
    await requireCapability("SESSION_READ_SELF")(context, async () => undefined);
  }
  sendJson(context.response, 200, publicSessionView(session));
}

async function handleLogin(context: BffRequestContext): Promise<void> {
  const credentials = parseLoginBody(context.jsonBody);
  const previousSession = context.session;
  if (!previousSession) {
    throw new BffError(403, "CSRF_SESSION_REQUIRED", "A server session is required.");
  }
  const clientAddress = context.request.socket.remoteAddress ?? "unknown";
  if (!context.loginAttemptLimiter.consume(clientAddress, credentials.username)) {
    context.logger.warn("authentication.rate_limited", {
      correlationId: context.correlationId,
    });
    throw new BffError(429, "AUTHENTICATION_RATE_LIMITED", "Authentication failed.");
  }

  const result = await context.identityProvider.authenticate(
    credentials.username,
    credentials.password,
  );
  if (result.outcome === "INVALID") {
    context.logger.warn("authentication.failed", {
      correlationId: context.correlationId,
    });
    throw new BffError(401, "AUTHENTICATION_FAILED", "Authentication failed.");
  }
  if (result.outcome === "DISABLED" || result.outcome === "LOCKED") {
    context.logger.warn("authentication.forbidden", {
      correlationId: context.correlationId,
    });
    throw new BffError(403, "AUTHENTICATION_FORBIDDEN", "Authentication failed.");
  }
  if (result.outcome !== "AUTHENTICATED") {
    throw new BffError(401, "AUTHENTICATION_FAILED", "Authentication failed.");
  }

  const authenticated = await context.sessionManager.createAuthenticated(
    context.response,
    result.identity,
    previousSession,
  );
  context.loginAttemptLimiter.clear(clientAddress, credentials.username);
  context.session = authenticated;
  context.response.setHeader("X-CSRF-Token", authenticated.csrfBinding);
  context.logger.info("authentication.succeeded", {
    correlationId: context.correlationId,
    userId: result.identity.userId,
  });
  sendJson(context.response, 200, publicSessionView(authenticated));
}

async function handleLogout(context: BffRequestContext): Promise<void> {
  if (context.jsonBody !== null) {
    throw new BffError(400, "LOGOUT_BODY_NOT_ALLOWED", "The request is invalid.");
  }
  if (context.session?.userId) {
    await requireCapability("SESSION_LOGOUT")(context, async () => undefined);
  }
  const userId = context.session?.userId;
  await context.sessionManager.destroy(context.response, context.session);
  context.session = null;
  context.logger.info("authentication.logged_out", {
    correlationId: context.correlationId,
    authenticatedSession: userId !== null && userId !== undefined,
  });
  sendJson(context.response, 200, { authenticated: false });
}

async function handleReadiness(context: BffRequestContext): Promise<void> {
  const [identityReady, storeReady] = await Promise.all([
    context.identityProvider.isReady(),
    context.sessionManager.store.isReady(),
  ]);
  let roundTripReady = false;
  if (storeReady) {
    try {
      roundTripReady = await context.sessionManager.store.probe();
    } catch {
      roundTripReady = false;
    }
  }
  const transportReady = !context.config.requireHttps
    || context.config.tls !== null
    || context.config.trustProxy;
  const productionDurabilityReady = context.config.environment !== "production"
    || context.sessionManager.store.durability === "durable";
  const ready = identityReady
    && storeReady
    && roundTripReady
    && transportReady
    && productionDurabilityReady;
  sendJson(context.response, ready ? 200 : 503, {
    status: ready ? "ready" : "not_ready",
    checks: {
      identityProvider: identityReady ? "ready" : "not_ready",
      sessionStore: storeReady && roundTripReady
        ? context.sessionManager.store.durability === "durable"
          ? "ready_durable"
          : "ready_non_durable"
        : "not_ready",
      sessionRoundTrip: roundTripReady ? "ready" : "not_ready",
      securityConfiguration: transportReady ? "ready" : "not_ready",
      productionDurability: productionDurabilityReady ? "ready" : "not_ready",
      runtimeProxyConfiguration: "configured_not_connected",
    },
  });
}

function parseLoginBody(
  body: Record<string, unknown> | null,
): { username: string; password: string } {
  if (!body) {
    throw new BffError(400, "LOGIN_REQUEST_INVALID", "The request is invalid.");
  }
  const keys = Object.keys(body).sort();
  if (
    keys.length !== 2
    || keys[0] !== "password"
    || keys[1] !== "username"
    || !isUsername(body.username)
    || typeof body.password !== "string"
    || body.password.length < 1
    || body.password.length > 1_024
  ) {
    throw new BffError(400, "LOGIN_REQUEST_INVALID", "The request is invalid.");
  }
  return { username: body.username, password: body.password };
}

function isAllowedMethod(context: BffRequestContext): boolean {
  if (
    context.pathname === "/session/login"
    || context.pathname === "/session/logout"
    || context.pathname === RUNTIME_EXECUTE_PATH
  ) {
    return context.request.method === "POST";
  }
  return context.request.method === "GET";
}

function createContext(
  request: IncomingMessage,
  response: ServerResponse,
  config: BffConfig,
  logger: BffLogger,
  sessionManager: SessionManager,
  identityProvider: IdentityProvider,
  loginAttemptLimiter: LoginAttemptLimiter,
  startedAt: number,
): BffRequestContext {
  let pathname = "/";
  try {
    pathname = new URL(request.url ?? "/", config.publicOrigin).pathname;
  } catch {
    pathname = "/__invalid_url__";
  }
  return {
    request,
    response,
    config,
    logger,
    sessionManager,
    identityProvider,
    loginAttemptLimiter,
    startedAt,
    correlationId: "",
    pathname,
    isSecure: false,
    session: null,
    jsonBody: null,
  };
}

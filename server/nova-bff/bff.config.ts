import { resolve } from "node:path";
import { BffError } from "./bff.errors.js";
import {
  parseLocalIdentityRecords,
  type LocalIdentityRecord,
} from "./bff.identity.js";

export type BffEnvironment = "development" | "test" | "production";

export interface BffTlsConfiguration {
  readonly keyFile: string;
  readonly certificateFile: string;
}

export interface BffConfig {
  readonly environment: BffEnvironment;
  readonly host: string;
  readonly port: number;
  readonly publicOrigin: string;
  readonly runtimeOrigin: string;
  readonly trustProxy: boolean;
  readonly trustedProxyAddresses: ReadonlySet<string>;
  readonly requireHttps: boolean;
  readonly tls: BffTlsConfiguration | null;
  readonly sessionCookieName: "__Host-nova_session";
  readonly sessionIdleTimeoutMs: number;
  readonly sessionAbsoluteTimeoutMs: number;
  readonly sessionRotationMs: number;
  readonly maxSessions: number;
  readonly loginMaximumAttempts: number;
  readonly loginAttemptWindowMs: number;
  readonly maxJsonBodyBytes: number;
  readonly localIdentityRecords: readonly LocalIdentityRecord[];
  readonly version: string;
  readonly commit: string;
  readonly buildTime: string | null;
}

export function loadBffConfig(
  environment: NodeJS.ProcessEnv = process.env,
): BffConfig {
  const mode = parseEnvironment(environment.BFF_ENV ?? environment.NODE_ENV);
  const host = environment.BFF_HOST?.trim() || "127.0.0.1";
  const port = parseInteger(environment.BFF_PORT, 4200, "BFF_PORT", 0, 65_535);
  const trustProxy = parseBoolean(environment.BFF_TRUST_PROXY, false, "BFF_TRUST_PROXY");
  const requireHttps = parseBoolean(
    environment.BFF_REQUIRE_HTTPS,
    mode === "production",
    "BFF_REQUIRE_HTTPS",
  );
  const trustedProxyAddresses = new Set(
    (environment.BFF_TRUSTED_PROXY_ADDRESSES ?? "127.0.0.1,::1,::ffff:127.0.0.1")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const publicOrigin = validateOrigin(
    environment.BFF_PUBLIC_ORIGIN ?? "https://localhost:4200",
    "BFF_PUBLIC_ORIGIN",
    mode === "production",
  );
  const runtimeOrigin = validateRuntimeOrigin(
    environment.BFF_RUNTIME_ORIGIN ?? "http://127.0.0.1:4100",
  );
  const keyFile = environment.BFF_TLS_KEY_FILE?.trim();
  const certificateFile = environment.BFF_TLS_CERT_FILE?.trim();
  if (Boolean(keyFile) !== Boolean(certificateFile)) {
    throw new BffError(
      500,
      "TLS_CONFIGURATION_INCOMPLETE",
      "BFF_TLS_KEY_FILE and BFF_TLS_CERT_FILE must be configured together.",
    );
  }
  const tls = keyFile && certificateFile
    ? {
        keyFile: resolve(keyFile),
        certificateFile: resolve(certificateFile),
      }
    : null;

  if (mode === "production" && requireHttps && !tls && !trustProxy) {
    throw new BffError(
      500,
      "HTTPS_TERMINATION_REQUIRED",
      "Production requires direct TLS or an explicitly trusted HTTPS reverse proxy.",
    );
  }
  if (trustProxy && trustedProxyAddresses.size === 0) {
    throw new BffError(
      500,
      "TRUSTED_PROXY_LIST_EMPTY",
      "BFF_TRUST_PROXY requires at least one trusted proxy address.",
    );
  }

  return {
    environment: mode,
    host,
    port,
    publicOrigin,
    runtimeOrigin,
    trustProxy,
    trustedProxyAddresses,
    requireHttps,
    tls,
    sessionCookieName: "__Host-nova_session",
    sessionIdleTimeoutMs: parseInteger(
      environment.BFF_SESSION_IDLE_TIMEOUT_MS ?? environment.BFF_SESSION_TTL_MS,
      30 * 60 * 1_000,
      "BFF_SESSION_IDLE_TIMEOUT_MS",
      60_000,
      24 * 60 * 60 * 1_000,
    ),
    sessionAbsoluteTimeoutMs: parseInteger(
      environment.BFF_SESSION_ABSOLUTE_TIMEOUT_MS,
      8 * 60 * 60 * 1_000,
      "BFF_SESSION_ABSOLUTE_TIMEOUT_MS",
      60_000,
      7 * 24 * 60 * 60 * 1_000,
    ),
    sessionRotationMs: parseInteger(
      environment.BFF_SESSION_ROTATION_MS,
      15 * 60 * 1_000,
      "BFF_SESSION_ROTATION_MS",
      60_000,
      24 * 60 * 60 * 1_000,
    ),
    maxSessions: parseInteger(
      environment.BFF_MAX_SESSIONS,
      10_000,
      "BFF_MAX_SESSIONS",
      1,
      1_000_000,
    ),
    loginMaximumAttempts: parseInteger(
      environment.BFF_LOGIN_MAXIMUM_ATTEMPTS,
      5,
      "BFF_LOGIN_MAXIMUM_ATTEMPTS",
      1,
      100,
    ),
    loginAttemptWindowMs: parseInteger(
      environment.BFF_LOGIN_ATTEMPT_WINDOW_MS,
      60_000,
      "BFF_LOGIN_ATTEMPT_WINDOW_MS",
      1_000,
      60 * 60 * 1_000,
    ),
    maxJsonBodyBytes: parseInteger(
      environment.BFF_MAX_JSON_BODY_BYTES,
      64 * 1_024,
      "BFF_MAX_JSON_BODY_BYTES",
      1_024,
      1_000_000,
    ),
    localIdentityRecords: parseLocalIdentityRecords(
      environment.BFF_LOCAL_IDENTITIES_JSON,
    ),
    version: validatePublicValue(environment.BFF_VERSION ?? "0.1.0", "BFF_VERSION"),
    commit: validatePublicValue(environment.BFF_COMMIT ?? "development", "BFF_COMMIT"),
    buildTime: environment.BFF_BUILD_TIME
      ? validateIsoDate(environment.BFF_BUILD_TIME)
      : null,
  };
}

function parseEnvironment(value: string | undefined): BffEnvironment {
  const normalized = value?.trim() || "development";
  if (
    normalized !== "development"
    && normalized !== "test"
    && normalized !== "production"
  ) {
    throw new BffError(
      500,
      "BFF_ENV_INVALID",
      "BFF_ENV must be development, test or production.",
    );
  }
  return normalized;
}

function parseBoolean(
  value: string | undefined,
  fallback: boolean,
  name: string,
): boolean {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new BffError(500, "BOOLEAN_CONFIGURATION_INVALID", `${name} must be true or false.`);
}

function parseInteger(
  value: string | undefined,
  fallback: number,
  name: string,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new BffError(
      500,
      "INTEGER_CONFIGURATION_INVALID",
      `${name} must be an integer between ${minimum} and ${maximum}.`,
    );
  }
  return parsed;
}

function validateOrigin(
  value: string,
  name: string,
  requireTls: boolean,
): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new BffError(500, "ORIGIN_CONFIGURATION_INVALID", `${name} must be a valid origin.`);
  }
  if (
    !["http:", "https:"].includes(parsed.protocol)
    || parsed.username
    || parsed.password
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  ) {
    throw new BffError(500, "ORIGIN_CONFIGURATION_INVALID", `${name} must contain only an HTTP(S) origin.`);
  }
  if (requireTls && parsed.protocol !== "https:") {
    throw new BffError(500, "PUBLIC_ORIGIN_HTTPS_REQUIRED", `${name} must use HTTPS in production.`);
  }
  return parsed.origin;
}

function validateRuntimeOrigin(value: string): string {
  const origin = validateOrigin(value, "BFF_RUNTIME_ORIGIN", false);
  const parsed = new URL(origin);
  if (parsed.protocol === "http:" && !isLoopbackHostname(parsed.hostname)) {
    throw new BffError(
      500,
      "RUNTIME_ORIGIN_INSECURE",
      "An HTTP Runtime origin is permitted only on loopback.",
    );
  }
  return origin;
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "[::1]"
    || hostname === "::1";
}

function validatePublicValue(value: string, name: string): string {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9._+-]{1,128}$/.test(normalized)) {
    throw new BffError(
      500,
      "PUBLIC_BUILD_VALUE_INVALID",
      `${name} contains unsupported characters.`,
    );
  }
  return normalized;
}

function validateIsoDate(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new BffError(
      500,
      "BUILD_TIME_INVALID",
      "BFF_BUILD_TIME must be an ISO-8601 timestamp.",
    );
  }
  return new Date(timestamp).toISOString();
}

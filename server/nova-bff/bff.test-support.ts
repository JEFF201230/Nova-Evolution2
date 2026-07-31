import { once } from "node:events";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { BffConfig } from "./bff.config.js";
import {
  LocalIdentityProvider,
  hashPasswordForFixture,
  type IdentityProvider,
  type LocalIdentityRecord,
} from "./bff.identity.js";
import type {
  BffLogFields,
  BffLogger,
} from "./bff.logger.js";
import {
  createNovaBffApplication,
  type NovaBffApplication,
  type NovaBffDependencies,
} from "./nova-bff.app.js";

export interface CapturedLog {
  readonly level: "INFO" | "WARN" | "ERROR";
  readonly event: string;
  readonly fields: BffLogFields;
}

export class CapturingLogger implements BffLogger {
  readonly records: CapturedLog[] = [];

  info(event: string, fields: BffLogFields = {}): void {
    this.records.push({ level: "INFO", event, fields });
  }

  warn(event: string, fields: BffLogFields = {}): void {
    this.records.push({ level: "WARN", event, fields });
  }

  error(event: string, fields: BffLogFields = {}): void {
    this.records.push({ level: "ERROR", event, fields });
  }
}

export function testBffConfig(
  overrides: Partial<BffConfig> = {},
): BffConfig {
  return {
    environment: "test",
    host: "127.0.0.1",
    port: 0,
    publicOrigin: "https://bff.test",
    runtimeOrigin: "http://127.0.0.1:4100",
    trustProxy: false,
    trustedProxyAddresses: new Set([
      "127.0.0.1",
      "::1",
      "::ffff:127.0.0.1",
    ]),
    requireHttps: false,
    tls: null,
    sessionCookieName: "__Host-nova_session",
    sessionIdleTimeoutMs: 30 * 60 * 1_000,
    sessionAbsoluteTimeoutMs: 8 * 60 * 60 * 1_000,
    sessionRotationMs: 15 * 60 * 1_000,
    maxSessions: 100,
    loginMaximumAttempts: 5,
    loginAttemptWindowMs: 60_000,
    maxJsonBodyBytes: 64 * 1_024,
    localIdentityRecords: [],
    version: "0.1.0-test",
    commit: "test-commit",
    buildTime: "2026-07-28T00:00:00.000Z",
    ...overrides,
  };
}

export async function startTestBff(
  config: BffConfig = testBffConfig(),
  dependencies: NovaBffDependencies = {},
): Promise<{
  readonly application: NovaBffApplication;
  readonly server: Server;
  readonly baseUrl: string;
  close(): Promise<void>;
}> {
  const application = createNovaBffApplication(config, {
    ...dependencies,
    logger: dependencies.logger ?? new CapturingLogger(),
    identityProvider: dependencies.identityProvider ?? await testIdentityProvider(),
  });
  const server = createServer(application.handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  return {
    application,
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close(): Promise<void> {
      server.close();
      await once(server, "close");
    },
  };
}

export const TEST_PASSWORD = "fixture-password-002";

let fixtureRecordsPromise: Promise<readonly LocalIdentityRecord[]> | null = null;

export async function testIdentityProvider(): Promise<IdentityProvider> {
  fixtureRecordsPromise ??= createFixtureRecords();
  return new LocalIdentityProvider(await fixtureRecordsPromise);
}

async function createFixtureRecords(): Promise<readonly LocalIdentityRecord[]> {
  const credentials = await hashPasswordForFixture(
    TEST_PASSWORD,
    Buffer.from("00112233445566778899aabbccddeeff", "hex"),
  );
  const timestamp = "2026-07-28T00:00:00.000Z";
  return [
    {
      userId: "user-active-001",
      username: "active.operator",
      displayName: "Active Operator",
      roles: ["OPERATOR"],
      status: "ACTIVE",
      createdAt: timestamp,
      updatedAt: timestamp,
      ...credentials,
    },
    {
      userId: "user-disabled-001",
      username: "disabled.viewer",
      displayName: "Disabled Viewer",
      roles: ["VIEWER"],
      status: "DISABLED",
      createdAt: timestamp,
      updatedAt: timestamp,
      ...credentials,
    },
    {
      userId: "user-locked-001",
      username: "locked.approver",
      displayName: "Locked Approver",
      roles: ["APPROVER"],
      status: "LOCKED",
      createdAt: timestamp,
      updatedAt: timestamp,
      ...credentials,
    },
  ];
}

export function sessionCookiePair(setCookie: string): string {
  const pair = setCookie.split(";")[0];
  if (!pair) {
    throw new Error("TEST_SESSION_COOKIE_MISSING");
  }
  return pair;
}

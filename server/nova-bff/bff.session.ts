import { randomBytes, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { BffError } from "./bff.errors.js";
import {
  BFF_ROLES,
  type BffRole,
  type UserIdentity,
} from "./bff.identity.js";

export { BFF_ROLES, type BffRole } from "./bff.identity.js";

export interface BffPrincipal {
  readonly userId: string;
  readonly username: string;
  readonly displayName: string;
  readonly roles: readonly BffRole[];
}

export interface ServerSession {
  readonly sessionId: string;
  readonly userId: string | null;
  readonly username: string | null;
  readonly displayName: string | null;
  readonly roles: readonly BffRole[];
  readonly authenticatedAt: string | null;
  readonly lastActivityAt: string;
  readonly expiresAt: string;
  readonly csrfBinding: string;
  readonly sessionVersion: number;
  readonly createdAt: string;
  readonly absoluteExpiresAt: string;
  readonly rotatedAt: string;
  readonly revokedAt: string | null;
}

export interface RevokedSession {
  readonly sessionId: string;
  readonly csrfBinding: string;
  readonly revokedAt: string;
  readonly purgeAt: string;
}

export interface SessionStore {
  readonly durability: "durable" | "non_durable";
  create(session: ServerSession): Promise<void>;
  read(sessionId: string): Promise<ServerSession | null>;
  renew(
    sessionId: string,
    expectedVersion: number,
    session: ServerSession,
  ): Promise<void>;
  rotate(
    previousSessionId: string,
    expectedVersion: number,
    session: ServerSession,
  ): Promise<void>;
  revoke(sessionId: string, expectedVersion: number): Promise<void>;
  delete(sessionId: string): Promise<void>;
  readRevocation(sessionId: string): Promise<RevokedSession | null>;
  isReady(): Promise<boolean>;
  probe(): Promise<boolean>;
}

export class InMemorySessionStore implements SessionStore {
  readonly durability = "non_durable" as const;
  private readonly sessions = new Map<string, ServerSession>();
  private readonly revocations = new Map<string, RevokedSession>();

  constructor(
    private readonly maxSessions: number,
    private readonly clock: () => number = Date.now,
  ) {}

  async create(session: ServerSession): Promise<void> {
    this.prune();
    if (this.sessions.has(session.sessionId) || this.revocations.has(session.sessionId)) {
      throw sessionConflict();
    }
    if (this.sessions.size >= this.maxSessions) {
      throw sessionStoreFailure();
    }
    this.sessions.set(session.sessionId, freezeSession(session));
  }

  async read(sessionId: string): Promise<ServerSession | null> {
    this.prune();
    const session = this.sessions.get(sessionId);
    return session?.revokedAt ? null : session ?? null;
  }

  async renew(
    sessionId: string,
    expectedVersion: number,
    session: ServerSession,
  ): Promise<void> {
    const current = this.sessions.get(sessionId);
    if (
      !current
      || current.revokedAt
      || current.sessionVersion !== expectedVersion
      || session.sessionId !== sessionId
    ) {
      throw sessionConflict();
    }
    this.sessions.set(sessionId, freezeSession(session));
  }

  async rotate(
    previousSessionId: string,
    expectedVersion: number,
    session: ServerSession,
  ): Promise<void> {
    const previous = this.sessions.get(previousSessionId);
    if (
      !previous
      || previous.revokedAt
      || previous.sessionVersion !== expectedVersion
      || this.sessions.has(session.sessionId)
      || this.revocations.has(session.sessionId)
    ) {
      throw sessionConflict();
    }
    this.sessions.delete(previousSessionId);
    this.sessions.set(session.sessionId, freezeSession(session));
  }

  async revoke(sessionId: string, expectedVersion: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }
    if (session.sessionVersion !== expectedVersion) {
      throw sessionConflict();
    }
    const now = new Date(this.clock()).toISOString();
    this.sessions.delete(sessionId);
    this.revocations.set(sessionId, Object.freeze({
      sessionId,
      csrfBinding: session.csrfBinding,
      revokedAt: now,
      purgeAt: session.absoluteExpiresAt,
    }));
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async readRevocation(sessionId: string): Promise<RevokedSession | null> {
    this.prune();
    return this.revocations.get(sessionId) ?? null;
  }

  async isReady(): Promise<boolean> {
    return true;
  }

  async probe(): Promise<boolean> {
    const now = this.clock();
    const probeId = randomBytes(32).toString("base64url");
    const probe = Object.freeze({
      sessionId: probeId,
      userId: null,
      username: null,
      displayName: null,
      roles: Object.freeze([]),
      authenticatedAt: null,
      lastActivityAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 60_000).toISOString(),
      csrfBinding: randomBytes(32).toString("base64url"),
      sessionVersion: 1,
      createdAt: new Date(now).toISOString(),
      absoluteExpiresAt: new Date(now + 60_000).toISOString(),
      rotatedAt: new Date(now).toISOString(),
      revokedAt: null,
    }) satisfies ServerSession;
    try {
      await this.create(probe);
      return (await this.read(probeId))?.sessionVersion === 1;
    } finally {
      await this.delete(probeId);
    }
  }

  private prune(): void {
    const now = this.clock();
    for (const [sessionId, session] of this.sessions) {
      if (
        session.revokedAt
        || Date.parse(session.expiresAt) <= now
        || Date.parse(session.absoluteExpiresAt) <= now
      ) {
        this.sessions.delete(sessionId);
      }
    }
    for (const [sessionId, revocation] of this.revocations) {
      if (Date.parse(revocation.purgeAt) <= now) {
        this.revocations.delete(sessionId);
      }
    }
  }
}

export interface SessionPolicy {
  readonly idleTimeoutMs: number;
  readonly absoluteTimeoutMs: number;
  readonly rotationMs: number;
}

export class SessionManager {
  constructor(
    readonly store: SessionStore,
    private readonly cookieName: "__Host-nova_session",
    private readonly policy: SessionPolicy,
    private readonly clock: () => number = Date.now,
    private readonly randomToken: () => string = () => randomBytes(32).toString("base64url"),
  ) {}

  async resolve(
    request: IncomingMessage,
    response: ServerResponse,
    createIfMissing: boolean,
  ): Promise<ServerSession | null> {
    const presentedId = this.presentedSessionId(request);
    let session = presentedId ? await this.store.read(presentedId) : null;

    if (!session && presentedId) {
      expireSessionCookie(response, this.cookieName);
    }
    if (!session && createIfMissing) {
      session = await this.createAnonymous();
      setSessionCookie(response, this.cookieName, session.sessionId, session.expiresAt, this.clock());
      return session;
    }
    if (!session) {
      return null;
    }

    const now = this.clock();
    if (now - Date.parse(session.rotatedAt) >= this.policy.rotationMs) {
      const rotated = this.rotatedSession(session, now);
      await this.store.rotate(session.sessionId, session.sessionVersion, rotated);
      setSessionCookie(response, this.cookieName, rotated.sessionId, rotated.expiresAt, now);
      return rotated;
    }

    const renewed = this.renewedSession(session, now);
    await this.store.renew(session.sessionId, session.sessionVersion, renewed);
    setSessionCookie(response, this.cookieName, renewed.sessionId, renewed.expiresAt, now);
    return renewed;
  }

  async createAuthenticated(
    response: ServerResponse,
    identity: UserIdentity,
    previousSession: ServerSession,
  ): Promise<ServerSession> {
    validateIdentity(identity);
    const now = this.clock();
    const session = this.newSession(identity, now, previousSession.sessionVersion + 1);
    await this.store.rotate(
      previousSession.sessionId,
      previousSession.sessionVersion,
      session,
    );
    setSessionCookie(response, this.cookieName, session.sessionId, session.expiresAt, now);
    return session;
  }

  async rotateAfterAuthorizationChange(
    response: ServerResponse,
    session: ServerSession,
    roles: readonly BffRole[],
  ): Promise<ServerSession> {
    if (!session.userId || !session.username || !session.displayName || !session.authenticatedAt) {
      throw new BffError(409, "SESSION_CONFLICT", "The session state changed.");
    }
    const now = this.clock();
    const rotated = Object.freeze({
      ...this.rotatedSession(session, now),
      roles: Object.freeze([...new Set(roles)]),
    });
    validateRoles(rotated.roles);
    await this.store.rotate(session.sessionId, session.sessionVersion, rotated);
    setSessionCookie(response, this.cookieName, rotated.sessionId, rotated.expiresAt, now);
    return rotated;
  }

  async destroy(
    response: ServerResponse,
    session: ServerSession | null,
  ): Promise<void> {
    if (session) {
      await this.store.revoke(session.sessionId, session.sessionVersion);
      await this.store.delete(session.sessionId);
    }
    expireSessionCookie(response, this.cookieName);
  }

  verifyCsrfToken(session: ServerSession, suppliedToken: string): boolean {
    return safeTokenEqual(session.csrfBinding, suppliedToken);
  }

  async verifyLogoutCsrf(
    request: IncomingMessage,
    session: ServerSession | null,
    suppliedToken: string,
  ): Promise<boolean> {
    if (session) {
      return this.verifyCsrfToken(session, suppliedToken);
    }
    const presentedId = this.presentedSessionId(request);
    if (!presentedId) {
      return false;
    }
    const revoked = await this.store.readRevocation(presentedId);
    return Boolean(revoked && safeTokenEqual(revoked.csrfBinding, suppliedToken));
  }

  presentedSessionId(request: IncomingMessage): string | null {
    const value = readCookie(request.headers.cookie, this.cookieName);
    return value && isValidToken(value) ? value : null;
  }

  private async createAnonymous(): Promise<ServerSession> {
    const session = this.newSession(null, this.clock(), 1);
    await this.store.create(session);
    return session;
  }

  private newSession(
    identity: UserIdentity | null,
    now: number,
    sessionVersion: number,
  ): ServerSession {
    const absoluteExpiresAt = now + this.policy.absoluteTimeoutMs;
    return Object.freeze({
      sessionId: this.randomToken(),
      userId: identity?.userId ?? null,
      username: identity?.username ?? null,
      displayName: identity?.displayName ?? null,
      roles: Object.freeze(identity ? [...new Set(identity.roles)] : []),
      authenticatedAt: identity ? new Date(now).toISOString() : null,
      lastActivityAt: new Date(now).toISOString(),
      expiresAt: new Date(Math.min(now + this.policy.idleTimeoutMs, absoluteExpiresAt)).toISOString(),
      csrfBinding: this.randomToken(),
      sessionVersion,
      createdAt: new Date(now).toISOString(),
      absoluteExpiresAt: new Date(absoluteExpiresAt).toISOString(),
      rotatedAt: new Date(now).toISOString(),
      revokedAt: null,
    });
  }

  private renewedSession(session: ServerSession, now: number): ServerSession {
    return Object.freeze({
      ...session,
      lastActivityAt: new Date(now).toISOString(),
      expiresAt: new Date(Math.min(
        now + this.policy.idleTimeoutMs,
        Date.parse(session.absoluteExpiresAt),
      )).toISOString(),
      sessionVersion: session.sessionVersion + 1,
    });
  }

  private rotatedSession(session: ServerSession, now: number): ServerSession {
    return Object.freeze({
      ...this.renewedSession(session, now),
      sessionId: this.randomToken(),
      csrfBinding: this.randomToken(),
      rotatedAt: new Date(now).toISOString(),
    });
  }
}

export function publicSessionView(session: ServerSession):
  | { readonly authenticated: false }
  | {
      readonly authenticated: true;
      readonly user: BffPrincipal;
      readonly session: {
        readonly authenticatedAt: string;
        readonly expiresAt: string;
      };
    } {
  if (
    !session.userId
    || !session.username
    || !session.displayName
    || !session.authenticatedAt
  ) {
    return { authenticated: false };
  }
  return {
    authenticated: true,
    user: {
      userId: session.userId,
      username: session.username,
      displayName: session.displayName,
      roles: session.roles,
    },
    session: {
      authenticatedAt: session.authenticatedAt,
      expiresAt: session.expiresAt,
    },
  };
}

export function readCookie(
  cookieHeader: string | undefined,
  cookieName: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }
  for (const segment of cookieHeader.split(";")) {
    const separator = segment.indexOf("=");
    if (separator < 0) {
      continue;
    }
    if (segment.slice(0, separator).trim() === cookieName) {
      return segment.slice(separator + 1).trim();
    }
  }
  return null;
}

function setSessionCookie(
  response: ServerResponse,
  cookieName: "__Host-nova_session",
  sessionId: string,
  expiresAt: string,
  now: number,
): void {
  const maxAge = Math.max(0, Math.floor((Date.parse(expiresAt) - now) / 1_000));
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`,
  );
}

function expireSessionCookie(
  response: ServerResponse,
  cookieName: "__Host-nova_session",
): void {
  response.setHeader(
    "Set-Cookie",
    `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
  );
}

function safeTokenEqual(expectedValue: string, suppliedValue: string): boolean {
  const expected = Buffer.from(expectedValue);
  const supplied = Buffer.from(suppliedValue);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function isValidToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(value);
}

function validateIdentity(identity: UserIdentity): void {
  if (
    !identity.userId
    || !identity.username
    || !identity.displayName
    || identity.status !== "ACTIVE"
  ) {
    throw new BffError(403, "AUTHENTICATION_FORBIDDEN", "Authentication failed.");
  }
  validateRoles(identity.roles);
}

function validateRoles(roles: readonly BffRole[]): void {
  if (roles.length === 0 || roles.some((role) => !BFF_ROLES.includes(role))) {
    throw new BffError(400, "PRINCIPAL_ROLES_INVALID", "The principal roles are invalid.");
  }
}

function freezeSession(session: ServerSession): ServerSession {
  return Object.freeze({
    ...session,
    roles: Object.freeze([...session.roles]),
  });
}

function sessionConflict(): BffError {
  return new BffError(409, "SESSION_CONFLICT", "The session state changed.");
}

function sessionStoreFailure(): BffError {
  return new BffError(500, "SESSION_STORE_FAILURE", "The session service failed.");
}

import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { BffError } from "./bff.errors.js";

export const BFF_ROLES = [
  "ADMIN",
  "OPERATOR",
  "APPROVER",
  "VIEWER",
] as const;

export type BffRole = (typeof BFF_ROLES)[number];
export type UserStatus = "ACTIVE" | "DISABLED" | "LOCKED";

export interface UserIdentity {
  readonly userId: string;
  readonly username: string;
  readonly displayName: string;
  readonly roles: readonly BffRole[];
  readonly status: UserStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LocalIdentityRecord extends UserIdentity {
  readonly passwordSalt: string;
  readonly passwordHash: string;
}

export type AuthenticationResult =
  | { readonly outcome: "AUTHENTICATED"; readonly identity: UserIdentity }
  | { readonly outcome: "INVALID" | "DISABLED" | "LOCKED" };

export interface IdentityProvider {
  authenticate(username: string, password: string): Promise<AuthenticationResult>;
  isReady(): Promise<boolean>;
  setStatus(userId: string, status: UserStatus): Promise<boolean>;
}

export class LocalIdentityProvider implements IdentityProvider {
  private readonly recordsByUsername = new Map<string, LocalIdentityRecord>();
  private readonly dummySalt = randomBytes(16);
  private readonly dummyHash = randomBytes(32);

  constructor(records: readonly LocalIdentityRecord[]) {
    for (const record of records) {
      validateRecord(record);
      const key = normalizeUsername(record.username);
      if (this.recordsByUsername.has(key)) {
        throw new BffError(
          500,
          "IDENTITY_CONFIGURATION_INVALID",
          "The local identity configuration contains duplicate usernames.",
        );
      }
      this.recordsByUsername.set(key, freezeRecord(record));
    }
  }

  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthenticationResult> {
    const record = this.recordsByUsername.get(normalizeUsername(username));
    const salt = record
      ? decodeCredential(record.passwordSalt)
      : this.dummySalt;
    const expected = record
      ? decodeCredential(record.passwordHash)
      : this.dummyHash;
    const derived = await derivePassword(password, salt, expected.length);
    const matches = derived.length === expected.length
      && timingSafeEqual(derived, expected);

    if (!record || !matches) {
      return { outcome: "INVALID" };
    }
    if (record.status === "DISABLED") {
      return { outcome: "DISABLED" };
    }
    if (record.status === "LOCKED") {
      return { outcome: "LOCKED" };
    }
    return { outcome: "AUTHENTICATED", identity: publicIdentity(record) };
  }

  async isReady(): Promise<boolean> {
    return this.recordsByUsername.size > 0;
  }

  async setStatus(userId: string, status: UserStatus): Promise<boolean> {
    if (!isUserStatus(status)) {
      throw new BffError(400, "USER_STATUS_INVALID", "The user status is invalid.");
    }
    for (const [key, record] of this.recordsByUsername) {
      if (record.userId === userId) {
        this.recordsByUsername.set(key, freezeRecord({
          ...record,
          status,
          updatedAt: new Date().toISOString(),
        }));
        return true;
      }
    }
    return false;
  }
}

export class LoginAttemptLimiter {
  private readonly attempts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maximumAttempts: number,
    private readonly windowMs: number,
    private readonly clock: () => number = Date.now,
  ) {}

  consume(clientAddress: string, username: string): boolean {
    const now = this.clock();
    const key = createHash("sha256")
      .update(`${clientAddress}\0${normalizeUsername(username)}`)
      .digest("base64url");
    const current = this.attempts.get(key);
    if (!current || current.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (current.count >= this.maximumAttempts) {
      return false;
    }
    current.count += 1;
    return true;
  }

  clear(clientAddress: string, username: string): void {
    const key = createHash("sha256")
      .update(`${clientAddress}\0${normalizeUsername(username)}`)
      .digest("base64url");
    this.attempts.delete(key);
  }
}

export async function hashPasswordForFixture(
  password: string,
  salt: Buffer = randomBytes(16),
): Promise<{ passwordSalt: string; passwordHash: string }> {
  const hash = await derivePassword(password, salt, 32);
  return {
    passwordSalt: salt.toString("base64url"),
    passwordHash: hash.toString("base64url"),
  };
}

export function parseLocalIdentityRecords(
  serialized: string | undefined,
): readonly LocalIdentityRecord[] {
  if (!serialized?.trim()) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw identityConfigurationError();
  }
  if (!Array.isArray(parsed)) {
    throw identityConfigurationError();
  }
  for (const value of parsed) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw identityConfigurationError();
    }
    validateRecord(value as LocalIdentityRecord);
  }
  return parsed.map((value) => freezeRecord(value as LocalIdentityRecord));
}

function derivePassword(
  password: string,
  salt: Buffer,
  length: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, length, {
      N: 16_384,
      r: 8,
      p: 1,
      maxmem: 64 * 1_024 * 1_024,
    }, (error, derived) => {
      if (error) {
        reject(error);
      } else {
        resolve(derived);
      }
    });
  });
}

function validateRecord(record: LocalIdentityRecord): void {
  const keys = Object.keys(record).sort();
  const expected = [
    "createdAt",
    "displayName",
    "passwordHash",
    "passwordSalt",
    "roles",
    "status",
    "updatedAt",
    "userId",
    "username",
  ];
  if (
    keys.length !== expected.length
    || keys.some((key, index) => key !== expected[index])
    || !isIdentifier(record.userId)
    || !isUsername(record.username)
    || typeof record.displayName !== "string"
    || record.displayName.length < 1
    || record.displayName.length > 128
    || !Array.isArray(record.roles)
    || record.roles.length === 0
    || record.roles.some((role) => !BFF_ROLES.includes(role))
    || !isUserStatus(record.status)
    || !isIsoDate(record.createdAt)
    || !isIsoDate(record.updatedAt)
    || !isCredential(record.passwordSalt, 16)
    || !isCredential(record.passwordHash, 32)
  ) {
    throw identityConfigurationError();
  }
}

function publicIdentity(record: LocalIdentityRecord): UserIdentity {
  return Object.freeze({
    userId: record.userId,
    username: record.username,
    displayName: record.displayName,
    roles: Object.freeze([...new Set(record.roles)]),
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function freezeRecord(record: LocalIdentityRecord): LocalIdentityRecord {
  return Object.freeze({
    ...record,
    roles: Object.freeze([...new Set(record.roles)]),
  });
}

function normalizeUsername(username: string): string {
  return username.normalize("NFKC").toLocaleLowerCase("en-US");
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string"
    && /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,127}$/.test(value);
}

export function isUsername(value: unknown): value is string {
  return typeof value === "string"
    && value === value.trim()
    && /^[A-Za-z0-9][A-Za-z0-9._@-]{0,127}$/.test(value);
}

function isUserStatus(value: unknown): value is UserStatus {
  return value === "ACTIVE" || value === "DISABLED" || value === "LOCKED";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string"
    && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString() === value;
}

function isCredential(value: unknown, decodedLength: number): value is string {
  return typeof value === "string"
    && /^[A-Za-z0-9_-]+$/.test(value)
    && decodeCredential(value).length === decodedLength;
}

function decodeCredential(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function identityConfigurationError(): BffError {
  return new BffError(
    500,
    "IDENTITY_CONFIGURATION_INVALID",
    "The local identity configuration is invalid.",
  );
}

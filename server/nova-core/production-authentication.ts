import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export const PRODUCTION_AUTH_ENVIRONMENT_KEYS = Object.freeze({
  operatorId: "NOVA_PRODUCTION_AUTH_OPERATOR_ID",
  environmentId: "NOVA_PRODUCTION_AUTH_ENVIRONMENT_ID",
  runtimeId: "NOVA_PRODUCTION_AUTH_RUNTIME_ID",
  codexTransportId: "NOVA_PRODUCTION_AUTH_CODEX_TRANSPORT_ID",
  sharedSecret: "NOVA_PRODUCTION_AUTH_SHARED_SECRET",
});

export interface ProductionAuthenticationAssertion {
  readonly operatorId: string;
  readonly environmentId: string;
  readonly runtimeId: string;
  readonly codexTransportId: string;
  readonly authorization: "EXECUTE";
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly signature: string;
}

export interface ProductionAuthenticationDecision {
  readonly operatorId: string;
  readonly environmentId: string;
  readonly runtimeId: string;
  readonly codexTransportId: string;
  readonly authorization: "EXECUTE";
  readonly authenticatedAt: string;
}

export interface ProductionAuthenticationPort {
  authenticate(
    assertion: ProductionAuthenticationAssertion,
  ):
    | ProductionAuthenticationDecision
    | Promise<ProductionAuthenticationDecision>;
}

export interface ProductionAuthenticationClock {
  now(): Date;
}

export interface ProductionAuthenticationDependencies {
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly clock?: ProductionAuthenticationClock;
}

export type ProductionAuthenticationFailure =
  | "CONFIGURATION_MISSING"
  | "MALFORMED_ASSERTION"
  | "IDENTITY_MISMATCH"
  | "AUTHORIZATION_DENIED"
  | "ASSERTION_EXPIRED"
  | "SIGNATURE_INVALID";

export class ProductionAuthenticationError extends Error {
  readonly code = "PRODUCTION_AUTHENTICATION_ERROR";

  constructor(readonly reason: ProductionAuthenticationFailure) {
    super(`Production authentication failed: ${reason}.`);
    this.name = "ProductionAuthenticationError";
  }
}

export class ProductionAuthenticator
implements ProductionAuthenticationPort {
  private readonly environment:
    Readonly<Record<string, string | undefined>>;
  private readonly clock: ProductionAuthenticationClock;

  constructor(
    dependencies: ProductionAuthenticationDependencies = {},
  ) {
    this.environment = dependencies.environment ?? process.env;
    this.clock = dependencies.clock ?? SYSTEM_CLOCK;
  }

  authenticate(
    assertion: ProductionAuthenticationAssertion,
  ): ProductionAuthenticationDecision {
    const configuration = readConfiguration(this.environment);
    assertAssertion(assertion);

    if (
      assertion.operatorId !== configuration.operatorId ||
      assertion.environmentId !== configuration.environmentId ||
      assertion.runtimeId !== configuration.runtimeId ||
      assertion.codexTransportId !== configuration.codexTransportId
    ) {
      throw new ProductionAuthenticationError("IDENTITY_MISMATCH");
    }

    if (assertion.authorization !== "EXECUTE") {
      throw new ProductionAuthenticationError("AUTHORIZATION_DENIED");
    }

    const issuedAt = Date.parse(assertion.issuedAt);
    const expiresAt = Date.parse(assertion.expiresAt);
    const authenticatedAt = this.clock.now();
    const authenticatedAtMs = authenticatedAt.getTime();
    if (
      issuedAt > authenticatedAtMs + MAXIMUM_CLOCK_SKEW_MS ||
      expiresAt < authenticatedAtMs ||
      expiresAt - issuedAt > MAXIMUM_ASSERTION_LIFETIME_MS
    ) {
      throw new ProductionAuthenticationError("ASSERTION_EXPIRED");
    }

    const expectedSignature = createHmac(
      "sha256",
      configuration.sharedSecret,
    )
      .update(productionAuthenticationPayload(assertion), "utf8")
      .digest();
    const suppliedSignature = Buffer.from(assertion.signature, "hex");
    if (
      suppliedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(suppliedSignature, expectedSignature)
    ) {
      throw new ProductionAuthenticationError("SIGNATURE_INVALID");
    }

    return Object.freeze({
      operatorId: assertion.operatorId,
      environmentId: assertion.environmentId,
      runtimeId: assertion.runtimeId,
      codexTransportId: assertion.codexTransportId,
      authorization: assertion.authorization,
      authenticatedAt: authenticatedAt.toISOString(),
    });
  }
}

export function productionAuthenticationPayload(
  assertion: Omit<ProductionAuthenticationAssertion, "signature">,
): string {
  return JSON.stringify({
    operatorId: assertion.operatorId,
    environmentId: assertion.environmentId,
    runtimeId: assertion.runtimeId,
    codexTransportId: assertion.codexTransportId,
    authorization: assertion.authorization,
    issuedAt: assertion.issuedAt,
    expiresAt: assertion.expiresAt,
  });
}

const SYSTEM_CLOCK: ProductionAuthenticationClock = Object.freeze({
  now: () => new Date(),
});

const MAXIMUM_CLOCK_SKEW_MS = 30_000;
const MAXIMUM_ASSERTION_LIFETIME_MS = 5 * 60_000;

interface ProductionAuthenticationConfiguration {
  readonly operatorId: string;
  readonly environmentId: string;
  readonly runtimeId: string;
  readonly codexTransportId: string;
  readonly sharedSecret: string;
}

function readConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): ProductionAuthenticationConfiguration {
  const operatorId = environment[
    PRODUCTION_AUTH_ENVIRONMENT_KEYS.operatorId
  ];
  const environmentId = environment[
    PRODUCTION_AUTH_ENVIRONMENT_KEYS.environmentId
  ];
  const runtimeId = environment[
    PRODUCTION_AUTH_ENVIRONMENT_KEYS.runtimeId
  ];
  const codexTransportId = environment[
    PRODUCTION_AUTH_ENVIRONMENT_KEYS.codexTransportId
  ];
  const sharedSecret = environment[
    PRODUCTION_AUTH_ENVIRONMENT_KEYS.sharedSecret
  ];

  if (
    !isIdentity(operatorId) ||
    !isIdentity(environmentId) ||
    !isIdentity(runtimeId) ||
    !isIdentity(codexTransportId) ||
    typeof sharedSecret !== "string" ||
    sharedSecret.length < 32
  ) {
    throw new ProductionAuthenticationError("CONFIGURATION_MISSING");
  }

  return {
    operatorId,
    environmentId,
    runtimeId,
    codexTransportId,
    sharedSecret,
  };
}

function assertAssertion(
  assertion: ProductionAuthenticationAssertion,
): void {
  if (
    !isRecord(assertion) ||
    !isIdentity(assertion.operatorId) ||
    !isIdentity(assertion.environmentId) ||
    !isIdentity(assertion.runtimeId) ||
    !isIdentity(assertion.codexTransportId) ||
    typeof assertion.authorization !== "string" ||
    !isCanonicalTimestamp(assertion.issuedAt) ||
    !isCanonicalTimestamp(assertion.expiresAt) ||
    Date.parse(assertion.expiresAt) <= Date.parse(assertion.issuedAt) ||
    typeof assertion.signature !== "string" ||
    !/^[A-Fa-f0-9]{64}$/.test(assertion.signature)
  ) {
    throw new ProductionAuthenticationError("MALFORMED_ASSERTION");
  }
}

function isIdentity(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const timestamp = Date.parse(value);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString() === value
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

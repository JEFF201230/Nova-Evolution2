import assert from "node:assert/strict";
import {
  createHmac,
} from "node:crypto";
import test from "node:test";
import {
  PRODUCTION_AUTH_ENVIRONMENT_KEYS,
  ProductionAuthenticationError,
  type ProductionAuthenticationAssertion,
  ProductionAuthenticator,
  productionAuthenticationPayload,
} from "./production-authentication.js";

const SHARED_SECRET = Buffer.alloc(32, 0x41).toString("base64");
const NOW = new Date("2026-07-28T16:00:00.000Z");
const ENVIRONMENT = Object.freeze({
  [PRODUCTION_AUTH_ENVIRONMENT_KEYS.operatorId]: "OPERATOR-001",
  [PRODUCTION_AUTH_ENVIRONMENT_KEYS.environmentId]: "PRODUCTION",
  [PRODUCTION_AUTH_ENVIRONMENT_KEYS.runtimeId]: "NOVA-RUNTIME-001",
  [PRODUCTION_AUTH_ENVIRONMENT_KEYS.codexTransportId]:
    "CODEX-CLI-TRANSPORT-001",
  [PRODUCTION_AUTH_ENVIRONMENT_KEYS.sharedSecret]: SHARED_SECRET,
});

function createAssertion(
  overrides: Partial<ProductionAuthenticationAssertion> = {},
): ProductionAuthenticationAssertion {
  const unsigned = {
    operatorId: "OPERATOR-001",
    environmentId: "PRODUCTION",
    runtimeId: "NOVA-RUNTIME-001",
    codexTransportId: "CODEX-CLI-TRANSPORT-001",
    authorization: "EXECUTE" as const,
    issuedAt: "2026-07-28T15:59:30.000Z",
    expiresAt: "2026-07-28T16:01:00.000Z",
    ...overrides,
  };
  const signature = createHmac("sha256", SHARED_SECRET)
    .update(productionAuthenticationPayload(unsigned), "utf8")
    .digest("hex");

  return {
    ...unsigned,
    signature,
    ...overrides,
  };
}

function createAuthenticator(
  environment: Readonly<Record<string, string | undefined>> = ENVIRONMENT,
): ProductionAuthenticator {
  return new ProductionAuthenticator({
    environment,
    clock: {
      now: () => NOW,
    },
  });
}

test("ProductionAuthenticator verifies every production identity and EXECUTE authorization", () => {
  const assertion = createAssertion();
  const decision = createAuthenticator().authenticate(assertion);

  assert.deepEqual(decision, {
    operatorId: assertion.operatorId,
    environmentId: assertion.environmentId,
    runtimeId: assertion.runtimeId,
    codexTransportId: assertion.codexTransportId,
    authorization: "EXECUTE",
    authenticatedAt: NOW.toISOString(),
  });
  assert.equal(Object.isFrozen(decision), true);
  assert.equal("signature" in decision, false);
});

test("ProductionAuthenticator rejects absent production authentication configuration", () => {
  assert.throws(
    () => createAuthenticator({}).authenticate(createAssertion()),
    (error) =>
      error instanceof ProductionAuthenticationError &&
      error.code === "PRODUCTION_AUTHENTICATION_ERROR" &&
      error.reason === "CONFIGURATION_MISSING",
  );
});

test("ProductionAuthenticator rejects each mismatched identity", () => {
  const mismatches = [
    { operatorId: "OPERATOR-OTHER" },
    { environmentId: "STAGING" },
    { runtimeId: "NOVA-RUNTIME-OTHER" },
    { codexTransportId: "CODEX-TRANSPORT-OTHER" },
  ];

  for (const mismatch of mismatches) {
    assert.throws(
      () => createAuthenticator().authenticate(createAssertion(mismatch)),
      (error) =>
        error instanceof ProductionAuthenticationError &&
        error.reason === "IDENTITY_MISMATCH",
    );
  }
});

test("ProductionAuthenticator rejects absent execution authorization", () => {
  const assertion = createAssertion({
    authorization: "READ" as "EXECUTE",
  });

  assert.throws(
    () => createAuthenticator().authenticate(assertion),
    (error) =>
      error instanceof ProductionAuthenticationError &&
      error.reason === "AUTHORIZATION_DENIED",
  );
});

test("ProductionAuthenticator rejects expired and overlong assertions", () => {
  const expired = createAssertion({
    issuedAt: "2026-07-28T15:58:00.000Z",
    expiresAt: "2026-07-28T15:59:59.999Z",
  });
  const overlong = createAssertion({
    issuedAt: "2026-07-28T15:59:00.000Z",
    expiresAt: "2026-07-28T16:10:00.000Z",
  });

  for (const assertion of [expired, overlong]) {
    assert.throws(
      () => createAuthenticator().authenticate(assertion),
      (error) =>
        error instanceof ProductionAuthenticationError &&
        error.reason === "ASSERTION_EXPIRED",
    );
  }
});

test("ProductionAuthenticator rejects a tampered assertion", () => {
  const assertion = {
    ...createAssertion(),
    signature: "0".repeat(64),
  };

  assert.throws(
    () => createAuthenticator().authenticate(assertion),
    (error) =>
      error instanceof ProductionAuthenticationError &&
      error.reason === "SIGNATURE_INVALID",
  );
});

test("ProductionAuthenticator never exposes authentication secret or signature", () => {
  const assertion = {
    ...createAssertion(),
    signature: "f".repeat(64),
  };

  assert.throws(
    () => createAuthenticator().authenticate(assertion),
    (error) => {
      assert.ok(error instanceof ProductionAuthenticationError);
      const exposed = JSON.stringify({
        name: error.name,
        code: error.code,
        reason: error.reason,
        message: error.message,
      });
      assert.equal(exposed.includes(SHARED_SECRET), false);
      assert.equal(exposed.includes(assertion.signature), false);
      return true;
    },
  );
});

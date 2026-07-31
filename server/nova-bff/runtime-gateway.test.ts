import assert from "node:assert/strict";
import test from "node:test";
import { BffError } from "./bff.errors.js";
import {
  currentRuntimeGatewayCorrelationId,
  RuntimeGatewayAdapter,
  type ProgramProductionEntrypointPort,
} from "./runtime-gateway.adapter.js";
import type {
  RuntimeGatewayRequestDto,
} from "./runtime-gateway.port.js";
import { RuntimeGateway } from "./runtime-gateway.js";
import {
  RuntimeRequestMapper,
  type RuntimeEntrypointExecutionOptions,
  type RuntimeEntrypointPromptPackage,
} from "./runtime-request.mapper.js";
import { RuntimeResponseMapper } from "./runtime-response.mapper.js";

const MISSION_ID = "MISSION-BFF-GATEWAY-003";
const CORRELATION_ID = "corr-bff-lot-003";
const EXECUTION_SESSION_ID = "SESSION-BFF-GATEWAY-003";
const FINGERPRINT = "a".repeat(64);

test("a valid internal Gateway call maps, invokes and minimizes the certified response", async () => {
  const observed: {
    prompt?: RuntimeEntrypointPromptPackage;
    options?: RuntimeEntrypointExecutionOptions & {
      readonly signal?: AbortSignal;
    };
    correlationId?: string | null;
  } = {};
  const entrypoint: ProgramProductionEntrypointPort = {
    execute(promptPackage: never, executionOptions: never) {
      observed.prompt =
        promptPackage as RuntimeEntrypointPromptPackage;
      observed.options = executionOptions as
        RuntimeEntrypointExecutionOptions & {
          readonly signal?: AbortSignal;
        };
      observed.correlationId = currentRuntimeGatewayCorrelationId();
      return validRuntimeResult();
    },
  };
  const gateway = new RuntimeGateway(
    new RuntimeGatewayAdapter(entrypoint, 1_000),
  );

  const response = await gateway.execute(validRequest());

  assert.equal(observed.prompt?.missionId, MISSION_ID);
  assert.equal(
    observed.options?.executionSessionId,
    EXECUTION_SESSION_ID,
  );
  assert.ok(observed.options?.signal instanceof AbortSignal);
  assert.equal(observed.correlationId, CORRELATION_ID);
  assert.equal(currentRuntimeGatewayCorrelationId(), null);
  assert.deepEqual(response, {
    correlationId: CORRELATION_ID,
    missionId: MISSION_ID,
    executionSessionId: EXECUTION_SESSION_ID,
    status: "CERTIFIED",
    runtime: {
      status: "SUCCESS",
      completedAt: "2026-07-28T12:00:02.000Z",
    },
    certification: {
      decision: "GO",
      bundleFingerprint: FINGERPRINT,
    },
  });
  assert.equal("evidenceBundle" in response, false);
  assert.equal("executionSession" in response, false);
});

test("RuntimeRequestMapper performs an immutable BFF to Runtime mapping", () => {
  const request = validRequest();
  const mapped = new RuntimeRequestMapper().map(request);

  assert.notEqual(mapped.promptPackage, request.promptPackage);
  assert.notEqual(mapped.executionOptions, request.executionOptions);
  assert.equal(mapped.correlationId, CORRELATION_ID);
  assert.equal(mapped.promptPackage.missionId, MISSION_ID);
  assert.equal(
    mapped.executionOptions.idempotencyKey,
    "IDEMPOTENCY-BFF-GATEWAY-003",
  );
  assert.ok(Object.isFrozen(mapped));
  assert.ok(Object.isFrozen(mapped.promptPackage));
  assert.ok(Object.isFrozen(mapped.executionOptions));
});

test("RuntimeResponseMapper preserves traceability and rejects uncertified output", () => {
  const invocation = new RuntimeRequestMapper().map(validRequest());
  const mapper = new RuntimeResponseMapper();
  assert.equal(
    mapper.map(invocation, validRuntimeResult()).status,
    "CERTIFIED",
  );

  const invalid = validRuntimeResult();
  invalid.integrationResult.certification.decision = "NO_GO";
  assert.throws(
    () => mapper.map(invocation, invalid),
    isGatewayError(502, "RUNTIME_RESPONSE_INVALID"),
  );
});

test("invalid BFF DTOs are rejected before ProgramProductionEntrypoint", async () => {
  let calls = 0;
  const gateway = new RuntimeGateway(
    new RuntimeGatewayAdapter({
      execute() {
        calls += 1;
        return validRuntimeResult();
      },
    }),
  );
  const cases: RuntimeGatewayRequestDto[] = [
    {
      ...validRequest(),
      correlationId: "bad id",
    },
    {
      ...validRequest(),
      unexpected: true,
    } as RuntimeGatewayRequestDto,
    {
      ...validRequest(),
      promptPackage: {
        ...(validRequest().promptPackage as Record<string, unknown>),
        validationStatus: "INVALID",
      },
    },
    {
      ...validRequest(),
      executionOptions: {
        ...(validRequest().executionOptions as Record<string, unknown>),
        timeoutMs: 0,
      },
    },
  ];

  for (const request of cases) {
    await assert.rejects(
      () => gateway.execute(request),
      isGatewayError(400, "RUNTIME_REQUEST_INVALID"),
    );
  }
  assert.equal(calls, 0);
});

test("Gateway timeout aborts the entrypoint signal and returns a safe 504", async () => {
  const observed: { signal?: AbortSignal } = {};
  const gateway = new RuntimeGateway(
    new RuntimeGatewayAdapter({
      execute(_promptPackage: never, executionOptions: never) {
        observed.signal = (
          executionOptions as { readonly signal: AbortSignal }
        ).signal;
        return new Promise(() => undefined);
      },
    }, 10),
  );

  await assert.rejects(
    () => gateway.execute(validRequest()),
    isGatewayError(504, "RUNTIME_TIMEOUT"),
  );
  assert.equal(observed.signal?.aborted, true);
});

test("Runtime unavailability and Runtime failures are normalized", async () => {
  const unavailable = gatewayThrowing(
    Object.assign(new Error("private network detail"), {
      code: "ECONNREFUSED",
    }),
  );
  await assert.rejects(
    () => unavailable.execute(validRequest()),
    isGatewayError(503, "RUNTIME_UNAVAILABLE"),
  );

  const failed = gatewayThrowing(
    new Error("sensitive Runtime implementation detail"),
  );
  await assert.rejects(
    () => failed.execute(validRequest()),
    (error: unknown) =>
      isGatewayError(502, "RUNTIME_ERROR")(error) &&
      error instanceof BffError &&
      !error.message.includes("sensitive"),
  );
});

test("HTTP-shaped Runtime errors are transformed without leaking bodies", async () => {
  for (
    const [upstream, expectedStatus, expectedCode] of [
      [400, 502, "RUNTIME_REQUEST_REJECTED"],
      [403, 502, "RUNTIME_REQUEST_REJECTED"],
      [503, 503, "RUNTIME_UNAVAILABLE"],
      [504, 504, "RUNTIME_TIMEOUT"],
    ] as const
  ) {
    const gateway = gatewayThrowing({
      response: {
        status: upstream,
        body: "sensitive upstream response",
      },
    });
    await assert.rejects(
      () => gateway.execute(validRequest()),
      (error: unknown) =>
        isGatewayError(expectedStatus, expectedCode)(error) &&
        error instanceof BffError &&
        !error.message.includes("sensitive"),
    );
  }
});

test("a disabled ProgramProductionEntrypoint is treated as unavailable", async () => {
  const gateway = new RuntimeGateway(
    new RuntimeGatewayAdapter({
      execute() {
        return null;
      },
    }),
  );
  await assert.rejects(
    () => gateway.execute(validRequest()),
    isGatewayError(503, "RUNTIME_UNAVAILABLE"),
  );
});

function gatewayThrowing(error: unknown): RuntimeGateway {
  return new RuntimeGateway(
    new RuntimeGatewayAdapter({
      execute() {
        throw error;
      },
    }),
  );
}

function validRequest(): RuntimeGatewayRequestDto {
  const prompt = "Execute the certified mission.\n";
  const optimization = {
    originalCharacters: prompt.length,
    optimizedCharacters: prompt.length,
    estimatedTokens: Math.ceil(prompt.length / 4),
  };
  return {
    correlationId: CORRELATION_ID,
    promptPackage: {
      missionId: MISSION_ID,
      prompt,
      validationStatus: "VALID",
      optimization,
      isolatedPrompt: {
        schemaVersion: 1,
        missionId: MISSION_ID,
        systemInstructions: [
          "Execute only certified system instructions.",
        ],
        userData: {
          mission: { id: MISSION_ID, title: null },
          objective: "Validate the BFF Runtime Gateway",
        },
        projectContext: {},
        runtimeMetadata: {
          validationStatus: "VALID",
          resolutionStatus: "RESOLVED",
          optimization,
        },
        evidence: {},
        promptPackage: {
          format: "NOVA_PROMPT_ISOLATION_V1",
          sourcePromptSha256: "b".repeat(64),
        },
      },
      certificationContext: {
        authorityDecision: {
          missionId: MISSION_ID,
          resolutionStatus: "RESOLVED",
        },
        validationStatus: "VALID",
        pipelineTrace: { missionId: MISSION_ID },
        missingArtifacts: [],
      },
    },
    executionOptions: {
      executionSessionId: EXECUTION_SESSION_ID,
      promptPackageId: "PACKAGE-BFF-GATEWAY-003",
      idempotencyKey: "IDEMPOTENCY-BFF-GATEWAY-003",
      workingDirectory: "C:\\workspace\\nova",
      workspaceSecurity: {
        workspaceId: "WORKSPACE-001",
        repositoryId: "REPOSITORY-001",
        workspaceRoot: "C:\\workspace\\nova",
        sandboxRoot: "C:\\workspace\\nova",
      },
      timeoutMs: 30_000,
      authentication: {
        operatorId: "OPERATOR-001",
        environmentId: "PRODUCTION",
        runtimeId: "RUNTIME-001",
        codexTransportId: "CODEX-001",
        authorization: "EXECUTE",
        issuedAt: "2026-07-28T11:59:30.000Z",
        expiresAt: "2026-07-28T12:01:00.000Z",
        signature: "c".repeat(64),
      },
    },
  };
}

function validRuntimeResult() {
  const certification = {
    decision: "GO",
    justification: ["All certified controls passed."],
    bundleFingerprint: FINGERPRINT,
  };
  return {
    promptPackage: { missionId: MISSION_ID },
    runtimeMission: { missionId: MISSION_ID },
    executionSession: {
      missionId: MISSION_ID,
      executionSessionId: EXECUTION_SESSION_ID,
      status: "COMPLETED",
    },
    integrationResult: {
      missionId: MISSION_ID,
      runtimeResult: {
        missionId: MISSION_ID,
        status: "SUCCESS",
        completedAt: "2026-07-28T12:00:02.000Z",
        result: { privateRuntimeData: true },
      },
      evidenceBundle: {
        schemaVersion: 1,
        missionId: MISSION_ID,
        runId: EXECUTION_SESSION_ID,
        source: "NOVA_PROGRAM_INTEGRATION",
        authorityDecision: {},
        validationStatus: "VALID",
        pipelineTrace: {},
        missingArtifacts: [],
        requiredEvidenceTypes: [],
        evidence: [],
        bundleFingerprint: FINGERPRINT,
        certification,
        report: {},
      },
      certification,
      persistedRecords: [],
    },
  };
}

function isGatewayError(
  status: number,
  code: string,
): (error: unknown) => boolean {
  return (error: unknown) =>
    error instanceof BffError &&
    error.status === status &&
    error.code === code;
}

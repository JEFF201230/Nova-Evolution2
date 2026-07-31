import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
} from "./runtime-execution-request.js";
import type {
  RuntimeExecutorPayload,
} from "./runtime-executor-adapter.js";
import type {
  AdaptedRuntimeResponse,
  RuntimeResponseInput,
} from "./runtime-response-adapter.js";
import {
  RuntimeResultNormalizer,
} from "./runtime-result-normalizer.js";

const MISSION_ID = "NOVA_CORE_RUNTIME_RESULT_NORMALIZER_LOT_A";
const REQUEST_ID = "LOT-A-REQUEST";

const AUTHORITY: AuthorityResolutionDecision = {
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: [],
  supportingSources: [],
  rejectedSources: [],
  rejectionReasons: [],
  unresolvedAuthorityConflicts: [],
  resolutionStatus: "RESOLVED",
};

const TRACE: NovaOrchestrationPipelineTrace = {
  missionId: MISSION_ID,
  authoritativeSourceIds: [],
  supportingSourceIds: [],
  rejectedSourceIds: [],
  knowledgeSourceIds: [],
  knowledgeSourcePaths: [],
  dependencyIds: ["RuntimeResponseAdapter"],
  requiredArtifactIds: [],
  missingArtifactIds: [],
};

function createExecutorPayload(): RuntimeExecutorPayload {
  return {
    runtimeExecutionContract: {} as RuntimeExecutionContract,
    requestId: REQUEST_ID,
    requestedAt: "2026-07-28T12:00:00.000Z",
    missionId: MISSION_ID,
    missionBrief: {
      missingArtifacts: [],
    } as unknown as MissionBrief,
    executionContext: {} as RuntimeExecutionContext,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace: TRACE,
    missingArtifacts: [],
    requestMetadata: {
      requestId: REQUEST_ID,
      requestedAt: "2026-07-28T12:00:00.000Z",
    },
  };
}

function createAdaptedResponse(
  overrides: Partial<AdaptedRuntimeResponse> = {},
): AdaptedRuntimeResponse {
  const executorPayload = createExecutorPayload();
  const runtimeResponse: RuntimeResponseInput = {
    responseId: "RESPONSE-001",
    requestId: REQUEST_ID,
    receivedAt: "2026-07-28T12:30:00.000Z",
    status: "COMPLETED",
    data: {
      result: "PASS",
    },
    error: null,
    runtimeMetadata: {
      runtimeVersion: "NOVA",
    },
  };

  return {
    executorPayload,
    runtimeResponse,
    responseId: runtimeResponse.responseId,
    requestId: runtimeResponse.requestId,
    receivedAt: runtimeResponse.receivedAt,
    status: runtimeResponse.status,
    data: runtimeResponse.data,
    error: runtimeResponse.error,
    runtimeMetadata: runtimeResponse.runtimeMetadata,
    authorityDecision: executorPayload.authorityDecision,
    pipelineTrace: executorPayload.pipelineTrace,
    validationStatus: executorPayload.validationStatus,
    missingArtifacts: executorPayload.missingArtifacts,
    ...overrides,
  };
}

test("RuntimeResultNormalizer builds the stable result model", () => {
  const response = createAdaptedResponse();
  const result = new RuntimeResultNormalizer({ enabled: true }).normalize(
    response,
  );

  assert.ok(result);
  assert.equal(result.responseId, "RESPONSE-001");
  assert.equal(result.requestId, REQUEST_ID);
  assert.equal(result.runtimeStatus, "COMPLETED");
  assert.equal(result.receivedAt, "2026-07-28T12:30:00.000Z");
});

test("RuntimeResultNormalizer preserves response values without mutation", () => {
  const response = createAdaptedResponse();
  const result = new RuntimeResultNormalizer({ enabled: true }).normalize(
    response,
  );

  assert.ok(result);
  assert.equal(result.sourceResponse, response);
  assert.equal(result.runtimeResponse, response.runtimeResponse);
  assert.equal(result.result, response.data);
  assert.equal(result.error, response.error);
  assert.equal(result.runtimeMetadata, response.runtimeMetadata);
});

test("RuntimeResultNormalizer propagates certified metadata", () => {
  const response = createAdaptedResponse();
  const result = new RuntimeResultNormalizer({ enabled: true }).normalize(
    response,
  );

  assert.ok(result);
  assert.equal(result.authorityDecision, response.authorityDecision);
  assert.equal(result.pipelineTrace, response.pipelineTrace);
  assert.equal(result.validationStatus, response.validationStatus);
  assert.equal(result.missingArtifacts, response.missingArtifacts);
});

test("RuntimeResultNormalizer preserves explicit null edge values", () => {
  const response = createAdaptedResponse();
  const runtimeResponse = {
    ...response.runtimeResponse,
    data: null,
    error: null,
  };
  const result = new RuntimeResultNormalizer({ enabled: true }).normalize({
    ...response,
    runtimeResponse,
    data: null,
    error: null,
  });

  assert.ok(result);
  assert.equal(result.result, null);
  assert.equal(result.error, null);
});

test("RuntimeResultNormalizer returns deterministic immutable output", () => {
  const normalizer = new RuntimeResultNormalizer({ enabled: true });
  const response = createAdaptedResponse();
  const first = normalizer.normalize(response);
  const second = normalizer.normalize(response);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("RuntimeResultNormalizer rejects inconsistent adapted metadata", () => {
  assert.throws(
    () =>
      new RuntimeResultNormalizer({ enabled: true }).normalize(
        createAdaptedResponse({
          requestId: "OTHER-REQUEST",
        }),
      ),
    /RRN-002/,
  );
});

test("RuntimeResultNormalizer rejects non-serializable result data", () => {
  const response = createAdaptedResponse();
  const cyclicData: Record<string, unknown> = {};
  cyclicData.self = cyclicData;
  const runtimeResponse = {
    ...response.runtimeResponse,
    data: cyclicData,
  };

  assert.throws(
    () =>
      new RuntimeResultNormalizer({ enabled: true }).normalize({
        ...response,
        runtimeResponse,
        data: cyclicData,
      }),
    /RRA-004/,
  );
});

test("RuntimeResultNormalizer is inert when Feature Flag is OFF", () => {
  const unreadableResponse = {};
  Object.defineProperty(unreadableResponse, "runtimeResponse", {
    get() {
      throw new Error("Feature Flag OFF must not inspect response.");
    },
  });

  const result = new RuntimeResultNormalizer().normalize(
    unreadableResponse as AdaptedRuntimeResponse,
  );

  assert.equal(result, null);
});

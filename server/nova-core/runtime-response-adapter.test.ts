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
import {
  RuntimeResponseAdapter,
  type RuntimeResponseAdaptationInput,
  type RuntimeResponseInput,
} from "./runtime-response-adapter.js";

const MISSION_ID = "NOVA_CORE_RUNTIME_RESPONSE_ADAPTER_LOT_A";
const REQUEST_ID = "LOT-A-REQUEST";
const RECEIVED_AT = "2026-07-28T12:30:00.000Z";

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
  dependencyIds: ["RuntimeExecutorAdapter"],
  requiredArtifactIds: [],
  missingArtifactIds: [],
};

function createPayload(): RuntimeExecutorPayload {
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

function createResponse(
  overrides: Partial<RuntimeResponseInput> = {},
): RuntimeResponseInput {
  return {
    responseId: "RESPONSE-001",
    requestId: REQUEST_ID,
    receivedAt: RECEIVED_AT,
    status: "COMPLETED",
    data: {
      result: "PASS",
    },
    error: null,
    runtimeMetadata: {
      runtimeVersion: "NOVA",
    },
    ...overrides,
  };
}

function createInput(
  overrides: Partial<RuntimeResponseAdaptationInput> = {},
): RuntimeResponseAdaptationInput {
  return {
    executorPayload: createPayload(),
    runtimeResponse: createResponse(),
    ...overrides,
  };
}

test("RuntimeResponseAdapter adapts a Runtime response", () => {
  const input = createInput();
  const response = new RuntimeResponseAdapter({ enabled: true }).adapt(
    input,
  );

  assert.ok(response);
  assert.equal(response.responseId, "RESPONSE-001");
  assert.equal(response.requestId, REQUEST_ID);
  assert.equal(response.status, "COMPLETED");
  assert.equal(response.receivedAt, RECEIVED_AT);
});

test("RuntimeResponseAdapter preserves response data without mutation", () => {
  const input = createInput();
  const response = new RuntimeResponseAdapter({ enabled: true }).adapt(
    input,
  );

  assert.ok(response);
  assert.equal(response.executorPayload, input.executorPayload);
  assert.equal(response.runtimeResponse, input.runtimeResponse);
  assert.equal(response.data, input.runtimeResponse.data);
  assert.equal(response.error, input.runtimeResponse.error);
  assert.equal(
    response.runtimeMetadata,
    input.runtimeResponse.runtimeMetadata,
  );
});

test("RuntimeResponseAdapter propagates certified metadata", () => {
  const input = createInput();
  const response = new RuntimeResponseAdapter({ enabled: true }).adapt(
    input,
  );

  assert.ok(response);
  assert.equal(
    response.authorityDecision,
    input.executorPayload.authorityDecision,
  );
  assert.equal(response.pipelineTrace, input.executorPayload.pipelineTrace);
  assert.equal(
    response.validationStatus,
    input.executorPayload.validationStatus,
  );
  assert.equal(
    response.missingArtifacts,
    input.executorPayload.missingArtifacts,
  );
});

test("RuntimeResponseAdapter accepts explicit null result and error values", () => {
  const response = new RuntimeResponseAdapter({ enabled: true }).adapt(
    createInput({
      runtimeResponse: createResponse({
        data: null,
        error: null,
      }),
    }),
  );

  assert.ok(response);
  assert.equal(response.data, null);
  assert.equal(response.error, null);
});

test("RuntimeResponseAdapter rejects a mismatched requestId", () => {
  assert.throws(
    () =>
      new RuntimeResponseAdapter({ enabled: true }).adapt(
        createInput({
          runtimeResponse: createResponse({
            requestId: "OTHER-REQUEST",
          }),
        }),
      ),
    /RRA-003/,
  );
});

test("RuntimeResponseAdapter rejects non-serializable response data", () => {
  const cyclicData: Record<string, unknown> = {};
  cyclicData.self = cyclicData;

  assert.throws(
    () =>
      new RuntimeResponseAdapter({ enabled: true }).adapt(
        createInput({
          runtimeResponse: createResponse({
            data: cyclicData,
          }),
        }),
      ),
    /RRA-004/,
  );
});

test("RuntimeResponseAdapter rejects invalid response metadata", () => {
  assert.throws(
    () =>
      new RuntimeResponseAdapter({ enabled: true }).adapt(
        createInput({
          runtimeResponse: createResponse({
            receivedAt: "2026-07-28",
          }),
        }),
      ),
    /RRA-002/,
  );
});

test("RuntimeResponseAdapter is inert when Feature Flag is OFF", () => {
  const unreadableInput = {};
  Object.defineProperty(unreadableInput, "runtimeResponse", {
    get() {
      throw new Error("Feature Flag OFF must not inspect response.");
    },
  });

  const response = new RuntimeResponseAdapter().adapt(
    unreadableInput as RuntimeResponseAdaptationInput,
  );

  assert.equal(response, null);
});

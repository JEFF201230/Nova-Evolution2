import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  CodexExecutionPreparation,
} from "./codex-execution-adapter.js";
import type {
  CodexRequest,
} from "./codex-request-builder.js";
import {
  CodexResponseParser,
  type CodexResponseInput,
  type CodexResponseParseInput,
} from "./codex-response-parser.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionContext,
} from "./runtime-execution-request.js";

const MISSION_ID = "NOVA_CORE_CODEX_RESPONSE_PARSER_LOT_B";
const REQUEST_ID = "CODEX-REQUEST-001";

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
  dependencyIds: [],
  requiredArtifactIds: [],
  missingArtifactIds: [],
};

function createPreparation(): CodexExecutionPreparation {
  return {
    codexRequest: {} as CodexRequest,
    requestId: REQUEST_ID,
    requestedAt: "2026-07-28T13:30:00.000Z",
    promptContent: JSON.stringify({ missionId: MISSION_ID }),
    executionContext: {
      missionId: MISSION_ID,
    } as RuntimeExecutionContext,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace: TRACE,
    missingArtifacts: [],
  };
}

function createResponse(
  overrides: Partial<CodexResponseInput> = {},
): CodexResponseInput {
  return {
    responseId: "CODEX-RESPONSE-001",
    requestId: REQUEST_ID,
    receivedAt: "2026-07-28T14:00:00.000Z",
    status: "COMPLETED",
    content: {
      result: "PASS",
    },
    error: null,
    codexMetadata: {
      simulation: true,
    },
    ...overrides,
  };
}

function createInput(
  overrides: Partial<CodexResponseParseInput> = {},
): CodexResponseParseInput {
  return {
    executionPreparation: createPreparation(),
    codexResponse: createResponse(),
    ...overrides,
  };
}

test("CodexResponseParser parses a simulated response", () => {
  const response = new CodexResponseParser({ enabled: true }).parse(
    createInput(),
  );

  assert.ok(response);
  assert.equal(response.responseId, "CODEX-RESPONSE-001");
  assert.equal(response.requestId, REQUEST_ID);
  assert.equal(response.codexStatus, "COMPLETED");
  assert.equal(response.receivedAt, "2026-07-28T14:00:00.000Z");
});

test("CodexResponseParser preserves business content without mutation", () => {
  const input = createInput();
  const response = new CodexResponseParser({ enabled: true }).parse(input);

  assert.ok(response);
  assert.equal(response.executionPreparation, input.executionPreparation);
  assert.equal(response.codexResponse, input.codexResponse);
  assert.equal(response.content, input.codexResponse.content);
  assert.equal(response.error, input.codexResponse.error);
  assert.equal(
    response.codexMetadata,
    input.codexResponse.codexMetadata,
  );
});

test("CodexResponseParser propagates certified metadata", () => {
  const input = createInput();
  const response = new CodexResponseParser({ enabled: true }).parse(input);

  assert.ok(response);
  assert.equal(
    response.authorityDecision,
    input.executionPreparation.authorityDecision,
  );
  assert.equal(
    response.pipelineTrace,
    input.executionPreparation.pipelineTrace,
  );
  assert.equal(
    response.validationStatus,
    input.executionPreparation.validationStatus,
  );
  assert.equal(
    response.missingArtifacts,
    input.executionPreparation.missingArtifacts,
  );
});

test("CodexResponseParser preserves explicit null edge values", () => {
  const response = new CodexResponseParser({ enabled: true }).parse(
    createInput({
      codexResponse: createResponse({
        content: null,
        error: null,
      }),
    }),
  );

  assert.ok(response);
  assert.equal(response.content, null);
  assert.equal(response.error, null);
});

test("CodexResponseParser returns deterministic immutable output", () => {
  const parser = new CodexResponseParser({ enabled: true });
  const input = createInput();
  const first = parser.parse(input);
  const second = parser.parse(input);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("CodexResponseParser rejects mismatched request metadata", () => {
  assert.throws(
    () =>
      new CodexResponseParser({ enabled: true }).parse(
        createInput({
          codexResponse: createResponse({
            requestId: "OTHER-REQUEST",
          }),
        }),
      ),
    /CRP-003/,
  );
});

test("CodexResponseParser rejects non-serializable simulated content", () => {
  const cyclicContent: Record<string, unknown> = {};
  cyclicContent.self = cyclicContent;

  assert.throws(
    () =>
      new CodexResponseParser({ enabled: true }).parse(
        createInput({
          codexResponse: createResponse({
            content: cyclicContent,
          }),
        }),
      ),
    /CRP-004/,
  );
});

test("CodexResponseParser rejects invalid response metadata", () => {
  assert.throws(
    () =>
      new CodexResponseParser({ enabled: true }).parse(
        createInput({
          codexResponse: createResponse({
            receivedAt: "2026-07-28",
          }),
        }),
      ),
    /CRP-002/,
  );
});

test("CodexResponseParser is inert when Feature Flag is OFF", () => {
  const unreadableInput = {};
  Object.defineProperty(unreadableInput, "codexResponse", {
    get() {
      throw new Error("Feature Flag OFF must not inspect response.");
    },
  });

  const response = new CodexResponseParser().parse(
    unreadableInput as CodexResponseParseInput,
  );

  assert.equal(response, null);
});

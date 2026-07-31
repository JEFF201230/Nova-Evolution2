import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import {
  CodexRequestBuilder,
  type CodexRequestBuildInput,
} from "./codex-request-builder.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import type {
  AssembledCodexPrompt,
} from "./prompt-assembler.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
  RuntimeExecutionRequest,
} from "./runtime-execution-request.js";

const MISSION_ID = "NOVA_CORE_CODEX_REQUEST_LOT_B";

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

function createInput(): CodexRequestBuildInput {
  const missionBrief = {
    missionId: MISSION_ID,
    authorityDecision: AUTHORITY,
    missingArtifacts: [],
  } as unknown as MissionBrief;
  const executionContext = {
    missionId: MISSION_ID,
  } as RuntimeExecutionContext;
  const request = {
    requestId: "CODEX-REQUEST-001",
    missionBrief,
    executionContext,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace: TRACE,
    requestedAt: "2026-07-28T13:15:00.000Z",
  } as RuntimeExecutionRequest;
  const contract: RuntimeExecutionContract = {
    runtimeExecutionRequest: request,
    missionBrief,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    executionContext,
    pipelineTrace: TRACE,
    requestMetadata: {
      requestId: request.requestId,
      requestedAt: request.requestedAt,
    },
  };
  const prompt: AssembledCodexPrompt = {
    content: JSON.stringify({
      missionId: MISSION_ID,
    }),
    missionId: MISSION_ID,
    missionBrief,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace: TRACE,
    missingArtifacts: missionBrief.missingArtifacts,
  };

  return {
    contract,
    prompt,
  };
}

test("CodexRequestBuilder constructs a deterministic request", () => {
  const input = createInput();
  const request = new CodexRequestBuilder({ enabled: true }).build(input);

  assert.ok(request);
  assert.equal(request.codexRequestId, "CODEX-REQUEST-001");
  assert.equal(request.requestedAt, "2026-07-28T13:15:00.000Z");
  assert.equal(request.promptContent, input.prompt.content);
});

test("CodexRequestBuilder propagates certified execution data", () => {
  const input = createInput();
  const request = new CodexRequestBuilder({ enabled: true }).build(input);

  assert.ok(request);
  assert.equal(request.prompt, input.prompt);
  assert.equal(request.missionBrief, input.contract.missionBrief);
  assert.equal(request.executionContext, input.contract.executionContext);
  assert.equal(
    request.requestMetadata,
    input.contract.requestMetadata,
  );
});

test("CodexRequestBuilder preserves authority and traceability", () => {
  const input = createInput();
  const request = new CodexRequestBuilder({ enabled: true }).build(input);

  assert.ok(request);
  assert.equal(
    request.authorityDecision,
    input.contract.authorityDecision,
  );
  assert.equal(request.pipelineTrace, input.contract.pipelineTrace);
  assert.equal(request.validationStatus, "VALID");
});

test("CodexRequestBuilder preserves missing artifacts", () => {
  const input = createInput();
  const missingArtifacts = ["LATEST-GATE"];
  const missionBrief = {
    ...input.contract.missionBrief,
    missingArtifacts,
  };
  const contract = {
    ...input.contract,
    missionBrief,
    runtimeExecutionRequest: {
      ...input.contract.runtimeExecutionRequest,
      missionBrief,
    },
  };
  const prompt = {
    ...input.prompt,
    missionBrief,
    missingArtifacts,
  };
  const request = new CodexRequestBuilder({ enabled: true }).build({
    contract,
    prompt,
  });

  assert.ok(request);
  assert.equal(request.missingArtifacts, missingArtifacts);
});

test("CodexRequestBuilder returns immutable stable output", () => {
  const builder = new CodexRequestBuilder({ enabled: true });
  const input = createInput();
  const first = builder.build(input);
  const second = builder.build(input);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("CodexRequestBuilder rejects a mismatched prompt", () => {
  const input = createInput();

  assert.throws(
    () =>
      new CodexRequestBuilder({ enabled: true }).build({
        ...input,
        prompt: {
          ...input.prompt,
          missionId: "OTHER-MISSION",
        },
      }),
    /CRB-002/,
  );
});

test("CodexRequestBuilder is inert when Feature Flag is OFF", () => {
  const unreadableInput = {};
  Object.defineProperty(unreadableInput, "contract", {
    get() {
      throw new Error("Feature Flag OFF must not inspect input.");
    },
  });

  const request = new CodexRequestBuilder().build(
    unreadableInput as CodexRequestBuildInput,
  );

  assert.equal(request, null);
});

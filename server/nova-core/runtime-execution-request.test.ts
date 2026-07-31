import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
  ResolvedAuthoritySource,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationPreparation,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";
import {
  RuntimeExecutionRequestBuilder,
  type RuntimeExecutionRequestBuildInput,
} from "./runtime-execution-request.js";

const MISSION_ID = "NOVA_CORE_RUNTIME_EXECUTION_REQUEST_MVP_012";
const REQUEST_ID = "REQUEST-012";
const REQUESTED_AT = "2026-07-28T10:15:30.000Z";

const KNOWLEDGE_SOURCE: ResolvedAuthoritySource = {
  id: "DOC-PROGRAM",
  domain: "PROGRAM_GOVERNANCE",
  authority: "MISSION_CURRENT",
  type: "PROGRAM",
  sourceRoot: "CEREBRAU",
  path: "PROGRAM_REGISTER.md",
  origin: "CEREBRAU",
};

const AUTHORITY_DECISION: AuthorityResolutionDecision = {
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: [KNOWLEDGE_SOURCE],
  supportingSources: [],
  rejectedSources: [],
  rejectionReasons: [],
  unresolvedAuthorityConflicts: [],
  resolutionStatus: "RESOLVED",
};

function createBrief(
  overrides: Partial<MissionBrief> = {},
): MissionBrief {
  return {
    missionId: MISSION_ID,
    title: "Runtime Execution Request",
    objective: "Préparer une requête sans contacter le Runtime.",
    program: {
      kind: "PROGRAM",
      id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
      name: "NOVA CORE KNOWLEDGE EVOLUTION",
    },
    capability: "MISSION PREPARATION ENGINE",
    epic: "NOVA KNOWLEDGE RUNTIME",
    feature: "FEATURE-001",
    lot: "LOT-05",
    wave: {
      id: "WAVE-12",
      lot: "LOT-05",
      name: "Runtime Execution Request",
      status: "ACTIVE",
    },
    authorityDecision: AUTHORITY_DECISION,
    constraints: ["Aucune exécution Runtime"],
    dependencies: ["RuntimeExecutionGate"],
    requiredKnowledge: [KNOWLEDGE_SOURCE],
    requiredArtifacts: ["DOC-PROGRAM"],
    acceptanceCriteria: ["Requête déterministe"],
    missingArtifacts: [],
    resolutionStatus: "RESOLVED",
    ...overrides,
  };
}

function createTrace(): NovaOrchestrationPipelineTrace {
  return {
    missionId: MISSION_ID,
    authoritativeSourceIds: ["DOC-PROGRAM"],
    supportingSourceIds: [],
    rejectedSourceIds: [],
    knowledgeSourceIds: ["DOC-PROGRAM"],
    knowledgeSourcePaths: ["PROGRAM_REGISTER.md"],
    dependencyIds: ["RuntimeExecutionGate"],
    requiredArtifactIds: ["DOC-PROGRAM"],
    missingArtifactIds: [],
  };
}

function createInput(
  overrides: Partial<RuntimeExecutionRequestBuildInput> = {},
): RuntimeExecutionRequestBuildInput {
  const missionBrief = createBrief();
  const pipelineTrace = createTrace();
  const preparation: NovaOrchestrationPreparation = {
    missionBrief,
    executionReady: true,
    validationStatus: "VALID",
    authorityDecision: AUTHORITY_DECISION,
    resolutionStatus: "RESOLVED",
    missingArtifacts: [],
    pipelineTrace,
  };
  const gateDecision: RuntimeExecutionGateDecision = {
    executionAllowed: true,
    validationStatus: "VALID",
    blockingReasons: [],
    authorityDecision: AUTHORITY_DECISION,
    resolutionStatus: "RESOLVED",
    missingArtifacts: [],
    pipelineTrace,
  };

  return {
    requestId: REQUEST_ID,
    requestedAt: REQUESTED_AT,
    gateDecision,
    preparation,
    ...overrides,
  };
}

test("RuntimeExecutionRequestBuilder generates a normalized request", () => {
  const input = createInput();
  const request = new RuntimeExecutionRequestBuilder({
    enabled: true,
  }).build(input);

  assert.ok(request);
  assert.equal(request.requestId, REQUEST_ID);
  assert.equal(request.requestedAt, REQUESTED_AT);
  assert.equal(request.missionBrief, input.preparation.missionBrief);
  assert.equal(request.validationStatus, "VALID");
});

test("RuntimeExecutionRequestBuilder projects execution metadata", () => {
  const request = new RuntimeExecutionRequestBuilder({
    enabled: true,
  }).build(createInput());

  assert.ok(request);
  assert.deepEqual(request.executionContext, {
    missionId: MISSION_ID,
    objective: "Préparer une requête sans contacter le Runtime.",
    programId: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
    capability: "MISSION PREPARATION ENGINE",
    epic: "NOVA KNOWLEDGE RUNTIME",
    feature: "FEATURE-001",
    lot: "LOT-05",
    waveId: "WAVE-12",
    constraints: ["Aucune exécution Runtime"],
    dependencies: ["RuntimeExecutionGate"],
    requiredKnowledge: [KNOWLEDGE_SOURCE],
    requiredArtifacts: ["DOC-PROGRAM"],
    acceptanceCriteria: ["Requête déterministe"],
  });
});

test("RuntimeExecutionRequestBuilder preserves authorityDecision", () => {
  const input = createInput();
  const request = new RuntimeExecutionRequestBuilder({
    enabled: true,
  }).build(input);

  assert.ok(request);
  assert.equal(
    request.authorityDecision,
    input.gateDecision.authorityDecision,
  );
});

test("RuntimeExecutionRequestBuilder preserves pipelineTrace", () => {
  const input = createInput();
  const request = new RuntimeExecutionRequestBuilder({
    enabled: true,
  }).build(input);

  assert.ok(request);
  assert.equal(request.pipelineTrace, input.gateDecision.pipelineTrace);
});

test("RuntimeExecutionRequestBuilder refuses a negative gate decision without reading preparation", () => {
  const input = createInput({
    gateDecision: {
      ...createInput().gateDecision,
      executionAllowed: false,
      validationStatus: "INVALID",
      blockingReasons: ["BRIDGE_VALIDATION_INVALID"],
    },
  });
  const unreadableInput = {
    ...input,
  };
  Object.defineProperty(unreadableInput, "preparation", {
    get() {
      throw new Error("A refused decision must stop before preparation.");
    },
  });

  const request = new RuntimeExecutionRequestBuilder({
    enabled: true,
  }).build(unreadableInput);

  assert.equal(request, null);
});

test("RuntimeExecutionRequestBuilder rejects an inconsistent positive decision", () => {
  const input = createInput({
    gateDecision: {
      ...createInput().gateDecision,
      authorityDecision: null,
    },
  });

  assert.throws(
    () =>
      new RuntimeExecutionRequestBuilder({ enabled: true }).build(input),
    /RER-005/,
  );
});

test("RuntimeExecutionRequestBuilder rejects a mismatched preparation", () => {
  const input = createInput();
  const mismatchedTrace = {
    ...input.preparation.pipelineTrace,
  };

  assert.throws(
    () =>
      new RuntimeExecutionRequestBuilder({ enabled: true }).build({
        ...input,
        preparation: {
          ...input.preparation,
          pipelineTrace: mismatchedTrace,
        },
      }),
    /RER-006/,
  );
});

test("RuntimeExecutionRequestBuilder requires caller-provided normalized metadata", () => {
  assert.throws(
    () =>
      new RuntimeExecutionRequestBuilder({ enabled: true }).build({
        ...createInput(),
        requestId: " invalid ",
      }),
    /RER-002/,
  );
  assert.throws(
    () =>
      new RuntimeExecutionRequestBuilder({ enabled: true }).build({
        ...createInput(),
        requestedAt: "2026-07-28",
      }),
    /RER-003/,
  );
});

test("RuntimeExecutionRequestBuilder returns deterministic immutable data without mutation", () => {
  const builder = new RuntimeExecutionRequestBuilder({ enabled: true });
  const input = createInput();
  const before = structuredClone(input);
  const first = builder.build(input);
  const second = builder.build(input);

  assert.deepEqual(first, second);
  assert.deepEqual(input, before);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.executionContext), true);
  assert.equal(Object.isFrozen(first.executionContext.constraints), true);
  assert.equal(Object.isFrozen(first.executionContext.dependencies), true);
  assert.equal(
    Object.isFrozen(first.executionContext.requiredKnowledge),
    true,
  );
});

test("RuntimeExecutionRequestBuilder is inert and does not inspect input when Feature Flag is OFF", () => {
  const unreadableInput = {};
  Object.defineProperty(unreadableInput, "requestId", {
    get() {
      throw new Error("Feature Flag OFF must not inspect input.");
    },
  });

  const request = new RuntimeExecutionRequestBuilder().build(
    unreadableInput as RuntimeExecutionRequestBuildInput,
  );

  assert.equal(request, null);
});

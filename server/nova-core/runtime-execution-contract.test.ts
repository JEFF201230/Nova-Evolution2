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
} from "./nova-orchestration-bridge.js";
import {
  RuntimeExecutionContractBuilder,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
  RuntimeExecutionRequest,
} from "./runtime-execution-request.js";

const MISSION_ID = "NOVA_CORE_RUNTIME_EXECUTION_CONTRACT_MVP_013";
const REQUEST_ID = "REQUEST-013";
const REQUESTED_AT = "2026-07-28T11:30:00.000Z";

const KNOWLEDGE_SOURCE: ResolvedAuthoritySource = Object.freeze({
  id: "DOC-PROGRAM",
  domain: "PROGRAM_GOVERNANCE",
  authority: "MISSION_CURRENT",
  type: "PROGRAM",
  sourceRoot: "CEREBRAU",
  path: "PROGRAM_REGISTER.md",
  origin: "CEREBRAU",
});

const AUTHORITY_DECISION: AuthorityResolutionDecision = Object.freeze({
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: Object.freeze([KNOWLEDGE_SOURCE]),
  supportingSources: Object.freeze([]),
  rejectedSources: Object.freeze([]),
  rejectionReasons: Object.freeze([]),
  unresolvedAuthorityConflicts: Object.freeze([]),
  resolutionStatus: "RESOLVED",
});

function createMissionBrief(): MissionBrief {
  return Object.freeze({
    missionId: MISSION_ID,
    title: "Runtime Execution Contract",
    objective: "Définir un contrat de données sans exécution.",
    program: Object.freeze({
      kind: "PROGRAM",
      id: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
      name: "NOVA CORE KNOWLEDGE EVOLUTION",
    }),
    capability: "MISSION PREPARATION ENGINE",
    epic: "NOVA KNOWLEDGE RUNTIME",
    feature: "FEATURE-001",
    lot: "LOT-06",
    wave: Object.freeze({
      id: "WAVE-13",
      lot: "LOT-06",
      name: "Runtime Execution Contract",
      status: "ACTIVE",
    }),
    authorityDecision: AUTHORITY_DECISION,
    constraints: Object.freeze(["Aucune exécution Runtime"]),
    dependencies: Object.freeze(["RuntimeExecutionRequestBuilder"]),
    requiredKnowledge: Object.freeze([KNOWLEDGE_SOURCE]),
    requiredArtifacts: Object.freeze(["DOC-PROGRAM"]),
    acceptanceCriteria: Object.freeze(["Contrat sérialisable"]),
    missingArtifacts: Object.freeze([]),
    resolutionStatus: "RESOLVED",
  });
}

function createPipelineTrace(): NovaOrchestrationPipelineTrace {
  return Object.freeze({
    missionId: MISSION_ID,
    authoritativeSourceIds: Object.freeze(["DOC-PROGRAM"]),
    supportingSourceIds: Object.freeze([]),
    rejectedSourceIds: Object.freeze([]),
    knowledgeSourceIds: Object.freeze(["DOC-PROGRAM"]),
    knowledgeSourcePaths: Object.freeze(["PROGRAM_REGISTER.md"]),
    dependencyIds: Object.freeze(["RuntimeExecutionRequestBuilder"]),
    requiredArtifactIds: Object.freeze(["DOC-PROGRAM"]),
    missingArtifactIds: Object.freeze([]),
  });
}

function createExecutionContext(): RuntimeExecutionContext {
  return Object.freeze({
    missionId: MISSION_ID,
    objective: "Définir un contrat de données sans exécution.",
    programId: "NOVA-CORE-KNOWLEDGE-EVOLUTION",
    capability: "MISSION PREPARATION ENGINE",
    epic: "NOVA KNOWLEDGE RUNTIME",
    feature: "FEATURE-001",
    lot: "LOT-06",
    waveId: "WAVE-13",
    constraints: Object.freeze(["Aucune exécution Runtime"]),
    dependencies: Object.freeze(["RuntimeExecutionRequestBuilder"]),
    requiredKnowledge: Object.freeze([KNOWLEDGE_SOURCE]),
    requiredArtifacts: Object.freeze(["DOC-PROGRAM"]),
    acceptanceCriteria: Object.freeze(["Contrat sérialisable"]),
  });
}

function createRequest(
  overrides: Partial<RuntimeExecutionRequest> = {},
): RuntimeExecutionRequest {
  return Object.freeze({
    requestId: REQUEST_ID,
    missionBrief: createMissionBrief(),
    executionContext: createExecutionContext(),
    authorityDecision: AUTHORITY_DECISION,
    validationStatus: "VALID",
    pipelineTrace: createPipelineTrace(),
    requestedAt: REQUESTED_AT,
    ...overrides,
  });
}

test("RuntimeExecutionContractBuilder constructs the official contract", () => {
  const request = createRequest();
  const contract = new RuntimeExecutionContractBuilder({
    enabled: true,
  }).build(request);

  assert.ok(contract);
  assert.equal(contract.runtimeExecutionRequest, request);
  assert.equal(contract.missionBrief, request.missionBrief);
  assert.equal(contract.executionContext, request.executionContext);
  assert.equal(contract.validationStatus, "VALID");
});

test("RuntimeExecutionContractBuilder propagates request metadata", () => {
  const contract = new RuntimeExecutionContractBuilder({
    enabled: true,
  }).build(createRequest());

  assert.ok(contract);
  assert.deepEqual(contract.requestMetadata, {
    requestId: REQUEST_ID,
    requestedAt: REQUESTED_AT,
  });
});

test("RuntimeExecutionContractBuilder preserves authorityDecision", () => {
  const request = createRequest();
  const contract = new RuntimeExecutionContractBuilder({
    enabled: true,
  }).build(request);

  assert.ok(contract);
  assert.equal(contract.authorityDecision, request.authorityDecision);
});

test("RuntimeExecutionContractBuilder preserves pipelineTrace", () => {
  const request = createRequest();
  const contract = new RuntimeExecutionContractBuilder({
    enabled: true,
  }).build(request);

  assert.ok(contract);
  assert.equal(contract.pipelineTrace, request.pipelineTrace);
});

test("RuntimeExecutionContractBuilder creates an immutable envelope", () => {
  const contract = new RuntimeExecutionContractBuilder({
    enabled: true,
  }).build(createRequest());

  assert.ok(contract);
  assert.equal(Object.isFrozen(contract), true);
  assert.equal(Object.isFrozen(contract.requestMetadata), true);
  assert.equal(Object.isFrozen(contract.runtimeExecutionRequest), true);
  assert.equal(Object.isFrozen(contract.missionBrief), true);
  assert.equal(Object.isFrozen(contract.executionContext), true);
  assert.equal(Object.isFrozen(contract.pipelineTrace), true);
});

test("RuntimeExecutionContract is JSON serializable", () => {
  const contract = new RuntimeExecutionContractBuilder({
    enabled: true,
  }).build(createRequest());

  assert.ok(contract);
  const serialized = JSON.stringify(contract);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.requestMetadata.requestId, REQUEST_ID);
  assert.equal(parsed.missionBrief.missionId, MISSION_ID);
  assert.equal(
    parsed.authorityDecision.resolutionStatus,
    "RESOLVED",
  );
});

test("RuntimeExecutionContract serialization is deterministic", () => {
  const builder = new RuntimeExecutionContractBuilder({ enabled: true });
  const request = createRequest();
  const first = builder.build(request);
  const second = builder.build(request);

  assert.ok(first);
  assert.ok(second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("RuntimeExecutionContractBuilder rejects inconsistent metadata", () => {
  assert.throws(
    () =>
      new RuntimeExecutionContractBuilder({ enabled: true }).build(
        createRequest({
          executionContext: {
            ...createExecutionContext(),
            missionId: "OTHER-MISSION",
          },
        }),
      ),
    /REC-004/,
  );
});

test("RuntimeExecutionContractBuilder rejects non-serializable certified data", () => {
  const request = createRequest();
  const cyclicTrace = {
    ...request.pipelineTrace,
  } as NovaOrchestrationPipelineTrace & {
    cycle?: unknown;
  };
  cyclicTrace.cycle = cyclicTrace;

  assert.throws(
    () =>
      new RuntimeExecutionContractBuilder({ enabled: true }).build({
        ...request,
        pipelineTrace: cyclicTrace,
      }),
    /REC-005/,
  );
});

test("RuntimeExecutionContractBuilder is inert and does not inspect input when Feature Flag is OFF", () => {
  const unreadableRequest = {};
  Object.defineProperty(unreadableRequest, "requestId", {
    get() {
      throw new Error("Feature Flag OFF must not inspect request.");
    },
  });

  const contract = new RuntimeExecutionContractBuilder().build(
    unreadableRequest as RuntimeExecutionRequest,
  );

  assert.equal(contract, null);
});

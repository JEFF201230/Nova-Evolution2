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
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
  RuntimeExecutionRequest,
} from "./runtime-execution-request.js";
import {
  RuntimeExecutorAdapter,
} from "./runtime-executor-adapter.js";

const MISSION_ID = "NOVA_CORE_RUNTIME_EXECUTOR_ADAPTER_LOT_A";
const REQUEST_ID = "LOT-A-REQUEST";
const REQUESTED_AT = "2026-07-28T12:00:00.000Z";

const SOURCE: ResolvedAuthoritySource = {
  id: "DOC-PROGRAM",
  domain: "PROGRAM_GOVERNANCE",
  authority: "MISSION_CURRENT",
  type: "PROGRAM",
  sourceRoot: "CEREBRAU",
  path: "PROGRAM_REGISTER.md",
  origin: "CEREBRAU",
};

const AUTHORITY: AuthorityResolutionDecision = {
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: [SOURCE],
  supportingSources: [],
  rejectedSources: [],
  rejectionReasons: [],
  unresolvedAuthorityConflicts: [],
  resolutionStatus: "RESOLVED",
};

function createContract(
  overrides: Partial<RuntimeExecutionContract> = {},
): RuntimeExecutionContract {
  const missionBrief: MissionBrief = {
    missionId: MISSION_ID,
    title: "Runtime Executor Adapter",
    objective: "Préparer un payload sans exécution.",
    program: null,
    capability: null,
    epic: null,
    feature: null,
    lot: null,
    wave: null,
    authorityDecision: AUTHORITY,
    constraints: ["Aucune exécution Runtime"],
    dependencies: ["RuntimeExecutionContract"],
    requiredKnowledge: [SOURCE],
    requiredArtifacts: ["DOC-PROGRAM"],
    acceptanceCriteria: ["Payload traçable"],
    missingArtifacts: [],
    resolutionStatus: "RESOLVED",
  };
  const pipelineTrace: NovaOrchestrationPipelineTrace = {
    missionId: MISSION_ID,
    authoritativeSourceIds: ["DOC-PROGRAM"],
    supportingSourceIds: [],
    rejectedSourceIds: [],
    knowledgeSourceIds: ["DOC-PROGRAM"],
    knowledgeSourcePaths: ["PROGRAM_REGISTER.md"],
    dependencyIds: ["RuntimeExecutionContract"],
    requiredArtifactIds: ["DOC-PROGRAM"],
    missingArtifactIds: [],
  };
  const executionContext: RuntimeExecutionContext = {
    missionId: MISSION_ID,
    objective: missionBrief.objective,
    programId: null,
    capability: null,
    epic: null,
    feature: null,
    lot: null,
    waveId: null,
    constraints: missionBrief.constraints,
    dependencies: missionBrief.dependencies,
    requiredKnowledge: missionBrief.requiredKnowledge,
    requiredArtifacts: missionBrief.requiredArtifacts,
    acceptanceCriteria: missionBrief.acceptanceCriteria,
  };
  const request: RuntimeExecutionRequest = {
    requestId: REQUEST_ID,
    missionBrief,
    executionContext,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace,
    requestedAt: REQUESTED_AT,
  };

  return {
    runtimeExecutionRequest: request,
    missionBrief,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    executionContext,
    pipelineTrace,
    requestMetadata: {
      requestId: REQUEST_ID,
      requestedAt: REQUESTED_AT,
    },
    ...overrides,
  };
}

test("RuntimeExecutorAdapter prepares a Runtime payload", () => {
  const contract = createContract();
  const payload = new RuntimeExecutorAdapter({ enabled: true }).adapt(
    contract,
  );

  assert.ok(payload);
  assert.equal(payload.runtimeExecutionContract, contract);
  assert.equal(payload.requestId, REQUEST_ID);
  assert.equal(payload.missionId, MISSION_ID);
  assert.equal(payload.requestedAt, REQUESTED_AT);
});

test("RuntimeExecutorAdapter preserves certified metadata", () => {
  const contract = createContract();
  const payload = new RuntimeExecutorAdapter({ enabled: true }).adapt(
    contract,
  );

  assert.ok(payload);
  assert.equal(payload.missionBrief, contract.missionBrief);
  assert.equal(payload.executionContext, contract.executionContext);
  assert.equal(payload.authorityDecision, contract.authorityDecision);
  assert.equal(payload.pipelineTrace, contract.pipelineTrace);
  assert.equal(payload.requestMetadata, contract.requestMetadata);
  assert.equal(payload.validationStatus, contract.validationStatus);
});

test("RuntimeExecutorAdapter conserves missing artifacts", () => {
  const missingArtifacts = ["LATEST-GATE"];
  const contract = createContract();
  const missionBrief = {
    ...contract.missionBrief,
    missingArtifacts,
  };
  const request = {
    ...contract.runtimeExecutionRequest,
    missionBrief,
  };
  const payload = new RuntimeExecutorAdapter({ enabled: true }).adapt({
    ...contract,
    runtimeExecutionRequest: request,
    missionBrief,
  });

  assert.ok(payload);
  assert.equal(payload.missingArtifacts, missingArtifacts);
});

test("RuntimeExecutorAdapter returns a stable immutable payload", () => {
  const adapter = new RuntimeExecutorAdapter({ enabled: true });
  const contract = createContract();
  const first = adapter.adapt(contract);
  const second = adapter.adapt(contract);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("RuntimeExecutorAdapter rejects a non-ready contract", () => {
  assert.throws(
    () =>
      new RuntimeExecutorAdapter({ enabled: true }).adapt(
        createContract({
          validationStatus: "INVALID",
        }),
      ),
    /REA-002/,
  );
});

test("RuntimeExecutorAdapter rejects inconsistent certified references", () => {
  const contract = createContract();

  assert.throws(
    () =>
      new RuntimeExecutorAdapter({ enabled: true }).adapt({
        ...contract,
        requestMetadata: {
          ...contract.requestMetadata,
          requestId: "OTHER-REQUEST",
        },
      }),
    /REA-003/,
  );
});

test("RuntimeExecutorAdapter is inert when Feature Flag is OFF", () => {
  const unreadableContract = {};
  Object.defineProperty(unreadableContract, "missionBrief", {
    get() {
      throw new Error("Feature Flag OFF must not inspect contract.");
    },
  });

  const payload = new RuntimeExecutorAdapter().adapt(
    unreadableContract as RuntimeExecutionContract,
  );

  assert.equal(payload, null);
});

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
  MissionPipelineRequest,
} from "./mission-pipeline.js";
import {
  NovaOrchestrationBridge,
} from "./nova-orchestration-bridge.js";

const MISSION_ID = "NOVA_CORE_ORCHESTRATION_BRIDGE_MVP_010";

const KNOWLEDGE_SOURCE: ResolvedAuthoritySource = {
  id: "DOC-PROGRAM",
  domain: "PROGRAM_GOVERNANCE",
  authority: "MISSION_CURRENT",
  type: "PROGRAM",
  sourceRoot: "CEREBRAU",
  path: "PROGRAM_REGISTER.md",
  origin: "CEREBRAU",
};

const SUPPORTING_SOURCE: ResolvedAuthoritySource = {
  id: "DOC-SUPPORT",
  domain: "KNOWLEDGE",
  authority: "CEREBRAU_KNOWLEDGE_GOVERNANCE",
  type: "REFERENCE",
  sourceRoot: "CEREBRAU",
  path: "KNOWLEDGE_REFERENCE.md",
  origin: "CEREBRAU",
};

const AUTHORITY_DECISION: AuthorityResolutionDecision = {
  missionId: MISSION_ID,
  authorityDomain: "PROGRAM_GOVERNANCE",
  authoritativeSources: [KNOWLEDGE_SOURCE],
  supportingSources: [SUPPORTING_SOURCE],
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
    title: "NOVA Orchestration Bridge",
    objective: "Préparer une entrée sans exécuter la mission.",
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
      id: "WAVE-10",
      lot: "LOT-05",
      name: "NOVA Orchestration Bridge",
      status: "ACTIVE",
    },
    authorityDecision: AUTHORITY_DECISION,
    constraints: ["Aucun appel Codex", "Aucune exécution Runtime"],
    dependencies: ["MissionPipeline", "MissionBriefBuilder"],
    requiredKnowledge: [KNOWLEDGE_SOURCE, SUPPORTING_SOURCE],
    requiredArtifacts: ["DOC-PROGRAM", "ProgramProvider"],
    acceptanceCriteria: ["Préparation validée", "Tous les tests PASS"],
    missingArtifacts: [],
    resolutionStatus: "RESOLVED",
    ...overrides,
  };
}

function createRequest(): MissionPipelineRequest {
  return {
    mission: {
      id: MISSION_ID,
      title: "NOVA Orchestration Bridge",
      objective: "Préparer une entrée sans exécuter la mission.",
    },
    knowledgeIndex: {},
    authorityDomain: "PROGRAM_GOVERNANCE",
    authorityDeclarations: [],
  };
}

test("NovaOrchestrationBridge calls MissionPipeline exactly once", () => {
  const request = createRequest();
  const brief = createBrief();
  const calls: MissionPipelineRequest[] = [];
  const bridge = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare(received) {
          calls.push(received);
          return brief;
        },
      },
    },
  );

  const result = bridge.prepare(request);

  assert.ok(result);
  assert.equal(calls.length, 1);
  assert.equal(calls[0], request);
  assert.equal(result.missionBrief, brief);
});

test("NovaOrchestrationBridge validates an execution-ready brief", () => {
  const result = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare: () => createBrief(),
      },
    },
  ).prepare(createRequest());

  assert.ok(result);
  assert.equal(result.executionReady, true);
  assert.equal(result.validationStatus, "VALID");
});

test("NovaOrchestrationBridge blocks a brief with missing artifacts", () => {
  const result = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare: () =>
          createBrief({
            missingArtifacts: ["LATEST-GATE"],
            resolutionStatus: "PARTIAL",
          }),
      },
    },
  ).prepare(createRequest());

  assert.ok(result);
  assert.equal(result.executionReady, false);
  assert.equal(result.validationStatus, "INVALID");
});

test("NovaOrchestrationBridge blocks incoherent authority readiness", () => {
  const result = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare: () =>
          createBrief({
            authorityDecision: {
              ...AUTHORITY_DECISION,
              resolutionStatus: "UNRESOLVED",
            },
            resolutionStatus: "UNRESOLVED",
          }),
      },
    },
  ).prepare(createRequest());

  assert.ok(result);
  assert.equal(result.executionReady, false);
  assert.equal(result.validationStatus, "INVALID");
});

test("NovaOrchestrationBridge propagates MissionPipeline errors", () => {
  const expectedError = new Error("Pipeline failure");
  const bridge = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare() {
          throw expectedError;
        },
      },
    },
  );

  assert.throws(() => bridge.prepare(createRequest()), expectedError);
});

test("NovaOrchestrationBridge preserves authority, status and missing artifacts", () => {
  const brief = createBrief({
    missingArtifacts: ["LATEST-GATE", "LATEST-LOT"],
    resolutionStatus: "PARTIAL",
  });
  const result = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare: () => brief,
      },
    },
  ).prepare(createRequest());

  assert.ok(result);
  assert.equal(result.authorityDecision, AUTHORITY_DECISION);
  assert.equal(result.resolutionStatus, brief.resolutionStatus);
  assert.deepEqual(result.missingArtifacts, brief.missingArtifacts);
});

test("NovaOrchestrationBridge produces a complete trace from MissionBrief data", () => {
  const result = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare: () => createBrief(),
      },
    },
  ).prepare(createRequest());

  assert.ok(result);
  assert.deepEqual(result.pipelineTrace, {
    missionId: MISSION_ID,
    authoritativeSourceIds: ["DOC-PROGRAM"],
    supportingSourceIds: ["DOC-SUPPORT"],
    rejectedSourceIds: [],
    knowledgeSourceIds: ["DOC-PROGRAM", "DOC-SUPPORT"],
    knowledgeSourcePaths: [
      "PROGRAM_REGISTER.md",
      "KNOWLEDGE_REFERENCE.md",
    ],
    dependencyIds: ["MissionPipeline", "MissionBriefBuilder"],
    requiredArtifactIds: ["DOC-PROGRAM", "ProgramProvider"],
    missingArtifactIds: [],
  });
});

test("NovaOrchestrationBridge does not duplicate trace data", () => {
  const result = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare: () => createBrief(),
      },
    },
  ).prepare(createRequest());

  assert.ok(result);

  for (const values of [
    result.pipelineTrace.authoritativeSourceIds,
    result.pipelineTrace.supportingSourceIds,
    result.pipelineTrace.knowledgeSourceIds,
    result.pipelineTrace.knowledgeSourcePaths,
    result.pipelineTrace.dependencyIds,
    result.pipelineTrace.requiredArtifactIds,
  ]) {
    assert.equal(new Set(values).size, values.length);
  }
});

test("NovaOrchestrationBridge reports an unexpectedly inactive pipeline", () => {
  const bridge = new NovaOrchestrationBridge(
    { enabled: true },
    {
      missionPipeline: {
        prepare: () => null,
      },
    },
  );

  assert.throws(() => bridge.prepare(createRequest()), /NOB-001/);
});

test("NovaOrchestrationBridge is inert and does not inspect input when Feature Flag is OFF", () => {
  let pipelineCalls = 0;
  const unreadableRequest = {};
  Object.defineProperty(unreadableRequest, "mission", {
    get() {
      throw new Error("Feature Flag OFF must not inspect bridge input.");
    },
  });
  const bridge = new NovaOrchestrationBridge(
    { enabled: false },
    {
      missionPipeline: {
        prepare() {
          pipelineCalls += 1;
          return createBrief();
        },
      },
    },
  );

  const result = bridge.prepare(
    unreadableRequest as MissionPipelineRequest,
  );

  assert.equal(result, null);
  assert.equal(pipelineCalls, 0);
});

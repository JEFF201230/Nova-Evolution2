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
import {
  RuntimeExecutionGate,
} from "./runtime-execution-gate.js";

const MISSION_ID = "NOVA_CORE_RUNTIME_EXECUTION_GATE_MVP_011";

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
    title: "Runtime Execution Gate",
    objective: "Décider sans lancer le Runtime.",
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
      id: "WAVE-11",
      lot: "LOT-05",
      name: "Runtime Execution Gate",
      status: "ACTIVE",
    },
    authorityDecision: AUTHORITY_DECISION,
    constraints: ["Aucune exécution Runtime"],
    dependencies: ["NovaOrchestrationBridge", "MissionPipeline"],
    requiredKnowledge: [KNOWLEDGE_SOURCE],
    requiredArtifacts: ["DOC-PROGRAM"],
    acceptanceCriteria: ["Décision déterministe"],
    missingArtifacts: [],
    resolutionStatus: "RESOLVED",
    ...overrides,
  };
}

function createTrace(
  overrides: Partial<NovaOrchestrationPipelineTrace> = {},
): NovaOrchestrationPipelineTrace {
  return {
    missionId: MISSION_ID,
    authoritativeSourceIds: ["DOC-PROGRAM"],
    supportingSourceIds: [],
    rejectedSourceIds: [],
    knowledgeSourceIds: ["DOC-PROGRAM"],
    knowledgeSourcePaths: ["PROGRAM_REGISTER.md"],
    dependencyIds: ["NovaOrchestrationBridge", "MissionPipeline"],
    requiredArtifactIds: ["DOC-PROGRAM"],
    missingArtifactIds: [],
    ...overrides,
  };
}

function createPreparation(
  overrides: Partial<NovaOrchestrationPreparation> = {},
): NovaOrchestrationPreparation {
  return {
    missionBrief: createBrief(),
    executionReady: true,
    validationStatus: "VALID",
    authorityDecision: AUTHORITY_DECISION,
    resolutionStatus: "RESOLVED",
    missingArtifacts: [],
    pipelineTrace: createTrace(),
    ...overrides,
  };
}

test("RuntimeExecutionGate authorizes a certified preparation", () => {
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    createPreparation(),
  );

  assert.ok(decision);
  assert.equal(decision.executionAllowed, true);
  assert.equal(decision.validationStatus, "VALID");
  assert.deepEqual(decision.blockingReasons, []);
});

test("RuntimeExecutionGate refuses a preparation rejected by the bridge", () => {
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    createPreparation({
      executionReady: false,
      validationStatus: "INVALID",
    }),
  );

  assert.ok(decision);
  assert.equal(decision.executionAllowed, false);
  assert.equal(decision.validationStatus, "INVALID");
  assert.ok(
    decision.blockingReasons.includes("BRIDGE_NOT_EXECUTION_READY"),
  );
  assert.ok(
    decision.blockingReasons.includes("BRIDGE_VALIDATION_INVALID"),
  );
});

test("RuntimeExecutionGate blocks unresolved authority", () => {
  const authorityDecision: AuthorityResolutionDecision = {
    ...AUTHORITY_DECISION,
    resolutionStatus: "UNRESOLVED",
  };
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    createPreparation({
      missionBrief: createBrief({
        authorityDecision,
        resolutionStatus: "UNRESOLVED",
      }),
      executionReady: false,
      validationStatus: "INVALID",
      authorityDecision,
      resolutionStatus: "UNRESOLVED",
    }),
  );

  assert.ok(decision);
  assert.equal(decision.executionAllowed, false);
  assert.ok(
    decision.blockingReasons.includes(
      "AUTHORITY_DECISION_UNRESOLVED",
    ),
  );
  assert.ok(
    decision.blockingReasons.includes(
      "RESOLUTION_STATUS_INCOMPATIBLE",
    ),
  );
});

test("RuntimeExecutionGate blocks every critical missing artifact", () => {
  const missingArtifacts = ["LATEST-GATE", "LATEST-LOT"];
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    createPreparation({
      missionBrief: createBrief({
        missingArtifacts,
        resolutionStatus: "PARTIAL",
      }),
      executionReady: false,
      validationStatus: "INVALID",
      resolutionStatus: "PARTIAL",
      missingArtifacts,
      pipelineTrace: createTrace({
        missingArtifactIds: missingArtifacts,
      }),
    }),
  );

  assert.ok(decision);
  assert.equal(decision.executionAllowed, false);
  assert.ok(
    decision.blockingReasons.includes(
      "MISSING_ARTIFACT:LATEST-GATE",
    ),
  );
  assert.ok(
    decision.blockingReasons.includes(
      "MISSING_ARTIFACT:LATEST-LOT",
    ),
  );
});

test("RuntimeExecutionGate validates normalized constraints", () => {
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    createPreparation({
      missionBrief: createBrief({
        constraints: [""] as readonly string[],
      }),
    }),
  );

  assert.ok(decision);
  assert.equal(decision.executionAllowed, false);
  assert.ok(decision.blockingReasons.includes("CONSTRAINTS_INVALID"));
});

test("RuntimeExecutionGate blocks an incomplete dependency trace", () => {
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    createPreparation({
      pipelineTrace: createTrace({
        dependencyIds: ["MissionPipeline"],
      }),
    }),
  );

  assert.ok(decision);
  assert.equal(decision.executionAllowed, false);
  assert.ok(
    decision.blockingReasons.includes("DEPENDENCY_TRACE_INCOMPLETE"),
  );
});

test("RuntimeExecutionGate propagates input access errors", () => {
  const expectedError = new Error("Preparation read failure");
  const unreadablePreparation = {};
  Object.defineProperty(unreadablePreparation, "missionBrief", {
    get() {
      throw expectedError;
    },
  });

  assert.throws(
    () =>
      new RuntimeExecutionGate({ enabled: true }).evaluate(
        unreadablePreparation as NovaOrchestrationPreparation,
      ),
    expectedError,
  );
});

test("RuntimeExecutionGate preserves authority, missing artifacts and pipeline trace", () => {
  const preparation = createPreparation();
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    preparation,
  );

  assert.ok(decision);
  assert.equal(decision.authorityDecision, preparation.authorityDecision);
  assert.equal(decision.resolutionStatus, preparation.resolutionStatus);
  assert.equal(decision.missingArtifacts, preparation.missingArtifacts);
  assert.equal(decision.pipelineTrace, preparation.pipelineTrace);
});

test("RuntimeExecutionGate deduplicates blocking reasons without altering missing artifacts", () => {
  const missingArtifacts = ["LATEST-GATE", "LATEST-GATE"];
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    createPreparation({
      missionBrief: createBrief({
        missingArtifacts,
        resolutionStatus: "PARTIAL",
      }),
      executionReady: false,
      validationStatus: "INVALID",
      resolutionStatus: "PARTIAL",
      missingArtifacts,
      pipelineTrace: createTrace({
        missingArtifactIds: missingArtifacts,
      }),
    }),
  );

  assert.ok(decision);
  assert.equal(
    decision.blockingReasons.filter(
      (reason) => reason === "MISSING_ARTIFACT:LATEST-GATE",
    ).length,
    1,
  );
  assert.equal(decision.missingArtifacts, missingArtifacts);
});

test("RuntimeExecutionGate returns a blocked decision when preparation is absent", () => {
  const decision = new RuntimeExecutionGate({ enabled: true }).evaluate(
    null,
  );

  assert.ok(decision);
  assert.equal(decision.executionAllowed, false);
  assert.deepEqual(decision.blockingReasons, ["MISSION_BRIEF_ABSENT"]);
  assert.equal(decision.pipelineTrace, null);
});

test("RuntimeExecutionGate is inert and does not inspect input when Feature Flag is OFF", () => {
  const unreadablePreparation = {};
  Object.defineProperty(unreadablePreparation, "missionBrief", {
    get() {
      throw new Error("Feature Flag OFF must not inspect preparation.");
    },
  });

  const decision = new RuntimeExecutionGate().evaluate(
    unreadablePreparation as NovaOrchestrationPreparation,
  );

  assert.equal(decision, null);
});

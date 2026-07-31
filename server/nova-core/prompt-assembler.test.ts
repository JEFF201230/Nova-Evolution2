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
  PromptAssembler,
} from "./prompt-assembler.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
  RuntimeExecutionRequest,
} from "./runtime-execution-request.js";

const MISSION_ID = "NOVA_CORE_CODEX_PROMPT_LOT_B";

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
    title: "Codex Integration",
    objective: "Préparer une requête Codex sans exécution.",
    program: null,
    capability: "MISSION PREPARATION ENGINE",
    epic: "NOVA KNOWLEDGE RUNTIME",
    feature: "FEATURE-001",
    lot: "LOT-B",
    wave: null,
    authorityDecision: AUTHORITY,
    constraints: ["Aucun appel réseau"],
    dependencies: ["RuntimeExecutionContract"],
    requiredKnowledge: [SOURCE],
    requiredArtifacts: ["DOC-PROGRAM"],
    acceptanceCriteria: ["Prompt déterministe"],
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
  const executionContext = {
    missionId: MISSION_ID,
  } as RuntimeExecutionContext;
  const request = {
    requestId: "CODEX-REQUEST",
    missionBrief,
    executionContext,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace,
    requestedAt: "2026-07-28T13:00:00.000Z",
  } as RuntimeExecutionRequest;

  return {
    runtimeExecutionRequest: request,
    missionBrief,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    executionContext,
    pipelineTrace,
    requestMetadata: {
      requestId: request.requestId,
      requestedAt: request.requestedAt,
    },
    ...overrides,
  };
}

test("PromptAssembler assembles a structured prompt from MissionBrief", () => {
  const prompt = new PromptAssembler({ enabled: true }).assemble(
    createContract(),
  );

  assert.ok(prompt);
  const content = JSON.parse(prompt.content);
  assert.equal(content.missionId, MISSION_ID);
  assert.equal(content.title, "Codex Integration");
  assert.equal(
    content.objective,
    "Préparer une requête Codex sans exécution.",
  );
});

test("PromptAssembler propagates MissionBrief sections", () => {
  const prompt = new PromptAssembler({ enabled: true }).assemble(
    createContract(),
  );

  assert.ok(prompt);
  const content = JSON.parse(prompt.content);
  assert.deepEqual(content.constraints, ["Aucun appel réseau"]);
  assert.deepEqual(content.dependencies, ["RuntimeExecutionContract"]);
  assert.deepEqual(content.requiredArtifacts, ["DOC-PROGRAM"]);
  assert.deepEqual(content.acceptanceCriteria, ["Prompt déterministe"]);
});

test("PromptAssembler preserves certified traceability", () => {
  const contract = createContract();
  const prompt = new PromptAssembler({ enabled: true }).assemble(contract);

  assert.ok(prompt);
  assert.equal(prompt.missionBrief, contract.missionBrief);
  assert.equal(prompt.authorityDecision, contract.authorityDecision);
  assert.equal(prompt.pipelineTrace, contract.pipelineTrace);
  assert.equal(prompt.validationStatus, contract.validationStatus);
  assert.equal(
    prompt.missingArtifacts,
    contract.missionBrief.missingArtifacts,
  );
});

test("PromptAssembler preserves missing artifacts in prompt content", () => {
  const contract = createContract();
  const missionBrief = {
    ...contract.missionBrief,
    missingArtifacts: ["LATEST-GATE"],
  };
  const prompt = new PromptAssembler({ enabled: true }).assemble({
    ...contract,
    missionBrief,
    runtimeExecutionRequest: {
      ...contract.runtimeExecutionRequest,
      missionBrief,
    },
  });

  assert.ok(prompt);
  assert.deepEqual(JSON.parse(prompt.content).missingArtifacts, [
    "LATEST-GATE",
  ]);
});

test("PromptAssembler is deterministic and immutable", () => {
  const assembler = new PromptAssembler({ enabled: true });
  const contract = createContract();
  const first = assembler.assemble(contract);
  const second = assembler.assemble(contract);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.equal(first.content, second?.content);
  assert.equal(Object.isFrozen(first), true);
});

test("PromptAssembler rejects inconsistent certified metadata", () => {
  assert.throws(
    () =>
      new PromptAssembler({ enabled: true }).assemble(
        createContract({
          validationStatus: "INVALID",
        }),
      ),
    /PA-002/,
  );
});

test("PromptAssembler is inert when Feature Flag is OFF", () => {
  const unreadableContract = {};
  Object.defineProperty(unreadableContract, "missionBrief", {
    get() {
      throw new Error("Feature Flag OFF must not inspect contract.");
    },
  });

  const prompt = new PromptAssembler().assemble(
    unreadableContract as RuntimeExecutionContract,
  );

  assert.equal(prompt, null);
});

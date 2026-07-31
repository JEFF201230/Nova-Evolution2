import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import {
  HumanApprovalWorkflow,
  type HumanApprovalDecisionValue,
  type LocalIdentityContext,
} from "./human-approval-workflow.js";
import {
  IntegrationRuntimeRepository,
} from "./integration-runtime-repository.js";
import {
  MissionEvidenceCertifier,
} from "./mission-evidence-certifier.js";
import {
  NovaIntegrationService,
  type NovaIntegrationInput,
} from "./nova-integration-service.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import {
  ProgramRuntimeOrchestrator,
} from "./program-runtime-orchestrator.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";

const MISSION_ID = "SUPER_WAVE_LOT_H";
const RUN_ID = "RUN-H-001";
const REQUEST_ID = "REQUEST-H-001";
const TEST_ATTESTATION_KEY =
  "local-test-attestation-key-32-characters-minimum";
const temporaryDirectories: string[] = [];

test.after(async () => {
  await Promise.all(
    temporaryDirectories.map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

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
const GATE: RuntimeExecutionGateDecision = {
  executionAllowed: true,
  validationStatus: "VALID",
  blockingReasons: [],
  authorityDecision: AUTHORITY,
  resolutionStatus: "RESOLVED",
  missingArtifacts: [],
  pipelineTrace: TRACE,
};
const IDENTITY: LocalIdentityContext = {
  subjectId: "LOCAL-APPROVER-H",
  roles: ["PROGRAM_DIRECTOR"],
  identityContextStatus: "IDENTITY_CONTEXT_VALIDATED",
  productionAuthenticationStatus:
    "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH",
};

function timestamps(): readonly string[] {
  return Object.freeze(
    Array.from({ length: 30 }, (_, index) =>
      new Date(
        Date.UTC(2026, 6, 29, 0, 0, index),
      ).toISOString(),
    ),
  );
}

function contract(): RuntimeExecutionContract {
  const missionBrief = {
    missionId: MISSION_ID,
    title: "Super Wave integration",
    objective: "Validate local integration.",
    program: null,
    capability: null,
    epic: null,
    feature: null,
    lot: "LOT_H",
    wave: null,
    authorityDecision: AUTHORITY,
    constraints: [],
    dependencies: [],
    requiredKnowledge: [],
    requiredArtifacts: [],
    acceptanceCriteria: ["All local gates pass."],
    missingArtifacts: [],
    resolutionStatus: "RESOLVED" as const,
  };
  const executionContext = {
    missionId: MISSION_ID,
    objective: missionBrief.objective,
    programId: null,
    capability: null,
    epic: null,
    feature: null,
    lot: "LOT_H",
    waveId: null,
    constraints: [],
    dependencies: [],
    requiredKnowledge: [],
    requiredArtifacts: [],
    acceptanceCriteria: missionBrief.acceptanceCriteria,
  };
  const request = {
    requestId: REQUEST_ID,
    missionBrief,
    executionContext,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID" as const,
    pipelineTrace: TRACE,
    requestedAt: "2026-07-29T00:00:00.000Z",
  };
  return {
    runtimeExecutionRequest: request,
    missionBrief,
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    executionContext,
    pipelineTrace: TRACE,
    requestMetadata: {
      requestId: REQUEST_ID,
      requestedAt: request.requestedAt,
    },
  };
}

async function harness(runId = RUN_ID): Promise<{
  readonly service: NovaIntegrationService;
  readonly repository: IntegrationRuntimeRepository;
  readonly filePath: string;
  readonly input: NovaIntegrationInput;
}> {
  const directory = await mkdtemp(join(tmpdir(), "nova-lot-h-"));
  temporaryDirectories.push(directory);
  const filePath = join(directory, "runtime.json");
  const repository = new IntegrationRuntimeRepository(filePath, {
    attestationKey: TEST_ATTESTATION_KEY,
    featureFlag: { enabled: true },
  });
  const orchestrator = new ProgramRuntimeOrchestrator({
    enabled: true,
  });
  const certifier = new MissionEvidenceCertifier(repository, {
    enabled: true,
  });
  const workflow = new HumanApprovalWorkflow(
    repository,
    certifier,
    orchestrator,
    { enabled: true },
  );
  const service = new NovaIntegrationService(
    repository,
    orchestrator,
    certifier,
    workflow,
    { enabled: true },
  );
  return {
    service,
    repository,
    filePath,
    input: {
      missionId: MISSION_ID,
      runId,
      source: "PROGRAM_TEST",
      maxRetries: 1,
      gateDecision: GATE,
      contract: contract(),
      simulation: "SUCCESS",
      timestamps: timestamps(),
      codexResponse: {
        responseId: "CODEX-RESPONSE-H-001",
        requestId: REQUEST_ID,
        receivedAt: "2026-07-29T00:00:10.000Z",
        status: "COMPLETED",
        content: { result: "PASS" },
        error: null,
        codexMetadata: { simulation: true },
      },
      approval: {
        requestId: "APPROVAL-REQUEST-H-001",
        decisionId: "APPROVAL-DECISION-H-001",
        requestedBy: "LOCAL-REQUESTER-H",
        requiredRole: "PROGRAM_DIRECTOR",
        identity: IDENTITY,
        decision: "APPROVED",
      },
    },
  };
}

async function runWith(
  overrides: Partial<NovaIntegrationInput> = {},
) {
  const values = await harness();
  const result = await values.service.run({
    ...values.input,
    ...overrides,
  });
  assert.ok(result);
  return { ...values, result };
}

test("LOT H completes a valid GO mission after local approval", async () => {
  const { result } = await runWith();
  assert.equal(result.canonicalFinalState, "COMPLETED");
  assert.equal(result.evidenceBundle.certification.decision, "GO");
  assert.equal(result.humanDecision?.decision, "APPROVED");
});

test("LOT H blocks insufficient authority before execution", async () => {
  const denied: RuntimeExecutionGateDecision = {
    ...GATE,
    executionAllowed: false,
    validationStatus: "INVALID",
    blockingReasons: ["AUTHORITY_DECISION_UNRESOLVED"],
    authorityDecision: null,
    resolutionStatus: "UNRESOLVED",
  };
  const { result } = await runWith({
    gateDecision: denied,
    contract: null,
    approval: null,
  });
  assert.equal(result.blocked, true);
  assert.equal(result.evidenceBundle.certification.decision, "BLOCKED");
  assert.equal(result.runtimePayload, null);
});

test("LOT H blocks a required missing artifact", async () => {
  const denied: RuntimeExecutionGateDecision = {
    ...GATE,
    executionAllowed: false,
    validationStatus: "INVALID",
    blockingReasons: ["MISSING_ARTIFACT:REPORT"],
    missingArtifacts: ["REPORT"],
  };
  const { result } = await runWith({
    gateDecision: denied,
    contract: null,
    approval: null,
  });
  assert.equal(result.blocked, true);
  assert.equal(result.evidenceBundle.certification.decision, "NO_GO");
});

test("LOT H fails an invalid simulated Codex response", async () => {
  const values = await harness();
  const result = await values.service.run({
    ...values.input,
    simulation: "INVALID_CODEX",
    approval: null,
    codexResponse: {
      ...values.input.codexResponse!,
      status: "FAILED",
      content: null,
      error: { code: "SIMULATED_INVALID_RESPONSE" },
    },
  });
  assert.ok(result);
  assert.equal(result.finalState, "FAILED");
  assert.equal(result.evidenceBundle.certification.decision, "NO_GO");
});

test("LOT H terminates a simulated cancellation", async () => {
  const { result } = await runWith({
    simulation: "CANCELLED",
    approval: null,
  });
  assert.equal(result.finalState, "CANCELLED");
});

test("LOT H terminates a simulated timeout explicitly", async () => {
  const { result } = await runWith({
    simulation: "TIMEOUT",
    approval: null,
  });
  assert.equal(result.finalState, "TIMEOUT");
});

test("LOT H resumes once after interruption without double execution", async () => {
  const { result } = await runWith({ simulation: "RECOVERY" });
  assert.deepEqual(result.session.startedAttempts, [1, 2]);
  assert.equal(new Set(result.session.startedAttempts).size, 2);
  assert.equal(result.canonicalFinalState, "COMPLETED");
});

test("LOT H never completes after approval rejection", async () => {
  const values = await harness();
  const result = await values.service.run({
    ...values.input,
    approval: {
      ...values.input.approval!,
      decision: "REJECTED",
      justification: "Program review rejected.",
    },
  });
  assert.ok(result);
  assert.equal(result.finalState, "REJECTED");
  assert.notEqual(result.canonicalFinalState, "COMPLETED");
});

test("LOT H traces requested corrections", async () => {
  const values = await harness();
  const decision: HumanApprovalDecisionValue = "CHANGES_REQUESTED";
  const result = await values.service.run({
    ...values.input,
    approval: {
      ...values.input.approval!,
      decision,
      justification: "Correct the submitted evidence.",
    },
  });
  assert.ok(result);
  assert.equal(result.finalState, "NEEDS_REVISION");
  assert.equal(result.humanDecision?.decision, decision);
});

test("LOT H refuses GO for tampered proof simulation", async () => {
  const { result } = await runWith({
    simulation: "PROOF_TAMPERED",
    approval: null,
  });
  assert.equal(result.finalState, "FAILED");
  assert.equal(result.evidenceBundle.certification.decision, "NO_GO");
});

test("LOT H reconstructs persisted state after restart", async () => {
  const { result, filePath } = await runWith();
  const restarted = new IntegrationRuntimeRepository(filePath, {
    attestationKey: TEST_ATTESTATION_KEY,
    featureFlag: { enabled: true },
  });
  const recovery = await restarted.recover();
  assert.equal(recovery.recovered, true);
  assert.ok(recovery.records.length >= result.persistedRecordCount);
});

test("LOT H handles an identical double call idempotently", async () => {
  const values = await harness();
  const [first, second] = await Promise.all([
    values.service.run(values.input),
    values.service.run(values.input),
  ]);
  assert.equal(first, second);
  assert.equal(first?.processingCount, 1);
});

test("LOT H exposes complete observability and persistence", async () => {
  const { result } = await runWith();
  assert.equal(result.timeline.events.length, result.log.entries.length);
  assert.equal(result.metrics.eventCount, result.timeline.events.length);
  assert.equal(result.metrics.percentage, 100);
  assert.ok(result.persistedRecordCount >= 5);
});

test("LOT H never claims production-authenticated identity", async () => {
  const { result } = await runWith();
  assert.equal(
    result.humanDecision?.identity.productionAuthenticationStatus,
    "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH",
  );
});

test("LOT H remains inactive while its Feature Flag is OFF", async () => {
  const values = await harness();
  const disabled = new NovaIntegrationService(
    values.repository,
    new ProgramRuntimeOrchestrator({ enabled: true }),
    new MissionEvidenceCertifier(values.repository, { enabled: true }),
    {} as HumanApprovalWorkflow,
  );
  assert.equal(await disabled.run(values.input), null);
});

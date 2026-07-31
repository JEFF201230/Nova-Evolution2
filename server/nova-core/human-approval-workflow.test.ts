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
  type HumanApprovalDecision,
  type HumanApprovalRequest,
  type LocalIdentityContext,
} from "./human-approval-workflow.js";
import {
  IntegrationRuntimeRepository,
} from "./integration-runtime-repository.js";
import {
  MissionEvidenceCertifier,
  type MissionEvidenceBundle,
} from "./mission-evidence-certifier.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import {
  ProgramRuntimeOrchestrator,
  type ProgramRuntimeSession,
} from "./program-runtime-orchestrator.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";

const MISSION_ID = "SUPER_WAVE_LOT_G";
const RUN_ID = "RUN-G-001";
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
const APPROVER: LocalIdentityContext = {
  subjectId: "LOCAL-APPROVER-1",
  roles: ["PROGRAM_DIRECTOR"],
  identityContextStatus: "IDENTITY_CONTEXT_VALIDATED",
  productionAuthenticationStatus:
    "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH",
};

async function setup(): Promise<{
  readonly workflow: HumanApprovalWorkflow;
  readonly repository: IntegrationRuntimeRepository;
  readonly certifier: MissionEvidenceCertifier;
  readonly orchestrator: ProgramRuntimeOrchestrator;
  readonly bundle: MissionEvidenceBundle;
  readonly request: HumanApprovalRequest;
}> {
  const directory = await mkdtemp(join(tmpdir(), "nova-lot-g-"));
  temporaryDirectories.push(directory);
  const repository = new IntegrationRuntimeRepository(
    join(directory, "runtime.json"),
    {
      attestationKey: TEST_ATTESTATION_KEY,
      featureFlag: { enabled: true },
    },
  );
  const certifier = new MissionEvidenceCertifier(repository, {
    enabled: true,
  });
  const orchestrator = new ProgramRuntimeOrchestrator({
    enabled: true,
  });
  const workflow = new HumanApprovalWorkflow(
    repository,
    certifier,
    orchestrator,
    { enabled: true },
  );
  const bundle = certifier.build({
    missionId: MISSION_ID,
    runId: RUN_ID,
    source: "PROGRAM_TEST",
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace: TRACE,
    missingArtifacts: [],
    requiredEvidenceTypes: ["TESTS"],
    evidence: [
      {
        evidenceId: "EVIDENCE-1",
        evidenceType: "TESTS",
        source: "NODE_TEST",
        occurredAt: "2026-07-28T23:00:00.000Z",
        status: "PASS",
        payload: { passed: true },
      },
    ],
  });
  assert.ok(bundle);
  const request = workflow.createRequest({
    requestId: "APPROVAL-REQUEST-1",
    requestedBy: "LOCAL-REQUESTER-1",
    requiredRole: "PROGRAM_DIRECTOR",
    requestedAt: "2026-07-28T23:00:01.000Z",
    evidenceBundle: bundle,
  });
  assert.ok(request);
  return {
    workflow,
    repository,
    certifier,
    orchestrator,
    bundle,
    request,
  };
}

function decisionInput(
  values: Awaited<ReturnType<typeof setup>>,
  overrides: Partial<
    Parameters<HumanApprovalWorkflow["decide"]>[0]
  > = {},
): Parameters<HumanApprovalWorkflow["decide"]>[0] {
  return {
    decisionId: "DECISION-1",
    request: values.request,
    identity: APPROVER,
    decision: "APPROVED",
    decidedAt: "2026-07-28T23:00:02.000Z",
    evidenceBundle: values.bundle,
    ...overrides,
  };
}

function waitingSession(
  orchestrator: ProgramRuntimeOrchestrator,
): ProgramRuntimeSession {
  let session = orchestrator.initialize({
    missionId: MISSION_ID,
    runId: RUN_ID,
    source: "PROGRAM_TEST",
    maxRetries: 1,
    gateDecision: GATE,
    eventId: "STATE-EVENT-1",
    occurredAt: "2026-07-28T23:01:01.000Z",
  });
  assert.ok(session);
  const states = [
    "ASSIGNED",
    "LOCKED",
    "RUNNING",
    "SUBMITTED",
    "TECHNICAL_VALIDATION",
    "DOCUMENTARY_VALIDATION",
    "HUMAN_VALIDATION",
  ] as const;
  for (const [index, targetState] of states.entries()) {
    session = orchestrator.transition(session, {
      targetState,
      source: "PROGRAM_TEST",
      eventId: `STATE-EVENT-${index + 2}`,
      occurredAt: `2026-07-28T23:01:0${index + 2}.000Z`,
      message: `Transition to ${targetState}.`,
      ...(targetState === "RUNNING" ? { gateDecision: GATE } : {}),
    });
    assert.ok(session);
  }
  return session;
}

test("LOT G creates a valid approval request", async () => {
  const values = await setup();
  assert.equal(values.request.technicalDecision, "GO");
  assert.equal(
    values.request.bundleFingerprint,
    values.bundle.bundleFingerprint,
  );
});

test("LOT G rejects an absent identity", async () => {
  const values = await setup();
  await assert.rejects(
    () => values.workflow.decide(decisionInput(values, { identity: null })),
    /HAW-002/,
  );
});

test("LOT G rejects a structurally invalid identity", async () => {
  const values = await setup();
  const invalid = {
    ...APPROVER,
    productionAuthenticationStatus:
      "IDENTITY_AUTHENTICATED_BY_PRODUCTION_AUTH",
  } as unknown as LocalIdentityContext;
  await assert.rejects(
    () =>
      values.workflow.decide(
        decisionInput(values, { identity: invalid }),
      ),
    /HAW-003/,
  );
});

test("LOT G rejects an insufficient role", async () => {
  const values = await setup();
  await assert.rejects(
    () =>
      values.workflow.decide(
        decisionInput(values, {
          identity: { ...APPROVER, roles: ["OBSERVER"] },
        }),
      ),
    /HAW-004/,
  );
});

test("LOT G records a valid local approval", async () => {
  const values = await setup();
  const decision = await values.workflow.decide(decisionInput(values));
  assert.equal(decision?.decision, "APPROVED");
  assert.equal(decision?.identity, APPROVER);
});

test("LOT G records a justified rejection", async () => {
  const values = await setup();
  const decision = await values.workflow.decide(
    decisionInput(values, {
      decision: "REJECTED",
      justification: "Evidence requires correction.",
    }),
  );
  assert.equal(decision?.decision, "REJECTED");
});

test("LOT G rejects a non-approval without justification", async () => {
  const values = await setup();
  await assert.rejects(
    () =>
      values.workflow.decide(
        decisionInput(values, { decision: "REJECTED" }),
      ),
    /HAW-006/,
  );
});

test("LOT G records requested changes", async () => {
  const values = await setup();
  const decision = await values.workflow.decide(
    decisionInput(values, {
      decision: "CHANGES_REQUESTED",
      justification: "Update the evidence bundle.",
    }),
  );
  assert.equal(decision?.decision, "CHANGES_REQUESTED");
});

test("LOT G records a justified block", async () => {
  const values = await setup();
  const decision = await values.workflow.decide(
    decisionInput(values, {
      decision: "BLOCKED",
      justification: "External prerequisite unavailable.",
    }),
  );
  assert.equal(decision?.decision, "BLOCKED");
});

test("LOT G handles an identical duplicate idempotently", async () => {
  const values = await setup();
  await values.workflow.decide(decisionInput(values));
  await values.workflow.decide(decisionInput(values));
  assert.equal(
    (await values.workflow.history(MISSION_ID, RUN_ID)).length,
    1,
  );
});

test("LOT G rejects evidence altered after request", async () => {
  const values = await setup();
  const altered = {
    ...values.bundle,
    missingArtifacts: ["ALTERED"],
  };
  await assert.rejects(
    () =>
      values.workflow.decide(
        decisionInput(values, { evidenceBundle: altered }),
      ),
    /HAW-009/,
  );
});

test("LOT G keeps append-only decision history", async () => {
  const values = await setup();
  await values.workflow.decide(decisionInput(values));
  await values.workflow.decide(
    decisionInput(values, {
      decisionId: "DECISION-2",
      decision: "REJECTED",
      justification: "Separate review outcome.",
      decidedAt: "2026-07-28T23:00:03.000Z",
    }),
  );
  assert.deepEqual(
    (await values.workflow.history(MISSION_ID, RUN_ID)).map(
      (decision) => decision.decisionId,
    ),
    ["DECISION-1", "DECISION-2"],
  );
});

test("LOT G persists decisions through LOT F", async () => {
  const values = await setup();
  await values.workflow.decide(decisionInput(values));
  assert.equal(
    (
      await values.repository.readLatest(
        "HUMAN_APPROVAL",
        MISSION_ID,
        RUN_ID,
      )
    )?.recordId,
    "DECISION-1",
  );
});

test("LOT G forbids local self-approval", async () => {
  const values = await setup();
  await assert.rejects(
    () =>
      values.workflow.decide(
        decisionInput(values, {
          identity: {
            ...APPROVER,
            subjectId: values.request.requestedBy,
          },
        }),
      ),
    /HAW-005/,
  );
});

test("LOT G represents WAITING_APPROVAL with HUMAN_VALIDATION", async () => {
  const values = await setup();
  assert.equal(waitingSession(values.orchestrator).state, "HUMAN_VALIDATION");
});

test("LOT G reaches COMPLETED projection only after APPROVED", async () => {
  const values = await setup();
  const decision = await values.workflow.decide(decisionInput(values));
  assert.ok(decision);
  const completed = values.workflow.applyDecision(
    waitingSession(values.orchestrator),
    decision,
    {
      eventId: "STATE-EVENT-9",
      occurredAt: "2026-07-28T23:01:09.000Z",
      source: "LOCAL-APPROVER-1",
    },
  );
  assert.equal(completed?.state, "ACCEPTED");
});

test("LOT G never completes after rejection", async () => {
  const values = await setup();
  const decision = await values.workflow.decide(
    decisionInput(values, {
      decision: "REJECTED",
      justification: "Rejected after review.",
    }),
  );
  assert.ok(decision);
  const rejected = values.workflow.applyDecision(
    waitingSession(values.orchestrator),
    decision,
    {
      eventId: "STATE-EVENT-9",
      occurredAt: "2026-07-28T23:01:09.000Z",
      source: "LOCAL-APPROVER-1",
    },
  );
  assert.equal(rejected?.state, "REJECTED");
});

test("LOT G never claims production authentication", async () => {
  const values = await setup();
  const decision = await values.workflow.decide(decisionInput(values));
  assert.equal(
    decision?.identity.productionAuthenticationStatus,
    "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH",
  );
});

test("LOT G refuses a request for a technical non-GO bundle", async () => {
  const values = await setup();
  const blocked = values.certifier.build({
    missionId: MISSION_ID,
    runId: RUN_ID,
    source: "PROGRAM_TEST",
    authorityDecision: AUTHORITY,
    validationStatus: "VALID",
    pipelineTrace: TRACE,
    missingArtifacts: [],
    requiredEvidenceTypes: ["MISSING"],
    evidence: [],
  });
  assert.ok(blocked);
  assert.throws(
    () =>
      values.workflow.createRequest({
        requestId: "APPROVAL-REQUEST-2",
        requestedBy: "LOCAL-REQUESTER-1",
        requiredRole: "PROGRAM_DIRECTOR",
        requestedAt: "2026-07-28T23:00:01.000Z",
        evidenceBundle: blocked,
      }),
    /HAW-001/,
  );
});

test("LOT G remains inactive while its Feature Flag is OFF", async () => {
  const values = await setup();
  const workflow = new HumanApprovalWorkflow(
    values.repository,
    values.certifier,
    values.orchestrator,
  );
  assert.equal(
    workflow.createRequest({
      requestId: "",
      requestedBy: "",
      requiredRole: "",
      requestedAt: "",
      evidenceBundle: values.bundle,
    }),
    null,
  );
  assert.deepEqual(await workflow.history(MISSION_ID, RUN_ID), []);
});

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type {
  HumanApprovalDecision,
} from "../../nova-core/human-approval-workflow.js";
import {
  HumanApprovalWorkflow,
} from "../../nova-core/human-approval-workflow.js";
import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "../../nova-core/integration-runtime-repository.js";
import { MissionEvidenceCertifier } from "../../nova-core/mission-evidence-certifier.js";
import { ProgramRuntimeOrchestrator } from "../../nova-core/program-runtime-orchestrator.js";
import type {
  RuntimeMission,
  RuntimeObservabilityEvent,
} from "../orchestrator/orchestrator-runtime.types.js";
import {
  WORK_DECISIONS_BINDING_SOURCE,
  WORK_DECISIONS_HISTORY_SOURCE,
  WORK_DECISIONS_PERSISTENCE_SOURCE,
  WORK_DECISIONS_RECORD_KIND,
  WorkCoreFailure,
  WorkDecisionsFailure,
  WorkDecisionsQuery,
  type WorkCoreSource,
  type WorkDecisionsHistorySource,
} from "./work-core.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "DDEC-001";
const RUN_ID = "RUN-DDEC-001";
const CREATED_AT = "2026-07-30T14:00:00.000Z";
const UPDATED_AT = "2026-07-30T14:05:00.000Z";
const OBSERVED_AT = "2026-07-30T14:06:00.000Z";
const BUNDLE_FINGERPRINT = "a".repeat(64);
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

function mission(
  overrides: Partial<RuntimeMission> = {},
): RuntimeMission {
  return {
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    missionType: "WORK",
    objective: "Read canonical human approval decisions.",
    authority: "PROGRAM_DIRECTOR",
    scope: {
      allowed: ["server/runtime/work"],
      forbidden: ["apps/nova-web", "server/nova-bff"],
    },
    deliverables: ["Work Decisions internal read integration"],
    stopCriteria: ["Human approval history is readable without writes."],
    authorizedReferences: ["DDEC_000_DECISIONS_DECISION.md"],
    createdAt: CREATED_AT,
    state: "HUMAN_VALIDATION",
    assignedAgentId: "AGENT-DDEC-001",
    lockId: null,
    runId: RUN_ID,
    contextId: null,
    reportId: null,
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}

function observation(
  overrides: Partial<RuntimeObservabilityEvent> = {},
): RuntimeObservabilityEvent {
  return {
    observabilityEventId: "OBS-DDEC-001",
    runtimeEventId: "EVENT-DDEC-001",
    sequence: 1,
    timestamp: OBSERVED_AT,
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    runId: RUN_ID,
    correlationId: "CORR-DDEC-001",
    phase: "VALIDATING",
    progression: 90,
    durationMs: 1_000,
    message: "Mission awaits human validation.",
    level: "INFO",
    ...overrides,
  };
}

function source(
  currentMission: RuntimeMission | null | undefined = mission(),
  currentObservation: RuntimeObservabilityEvent = observation(),
): WorkCoreSource {
  return {
    getMission: () =>
      currentMission === null || currentMission === undefined
        ? currentMission
        : structuredClone(currentMission),
    getObservabilityEvents: () => [structuredClone(currentObservation)],
  };
}

function decision(
  overrides: Partial<HumanApprovalDecision> = {},
): HumanApprovalDecision {
  return {
    decisionId: "DECISION-1",
    request: {
      requestId: "REQUEST-1",
      missionId: WORK_ID,
      runId: RUN_ID,
      requestedBy: "REQUESTER-1",
      requiredRole: "PROGRAM_DIRECTOR",
      requestedAt: "2026-07-30T14:07:00.000Z",
      bundleFingerprint: BUNDLE_FINGERPRINT,
      technicalDecision: "GO",
    },
    identity: {
      subjectId: "APPROVER-1",
      roles: ["PROGRAM_DIRECTOR"],
      identityContextStatus: "IDENTITY_CONTEXT_VALIDATED",
      productionAuthenticationStatus:
        "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH",
    },
    decision: "APPROVED",
    justification: null,
    decidedAt: "2026-07-30T14:08:00.000Z",
    bundleFingerprint: BUNDLE_FINGERPRINT,
    ...overrides,
  };
}

function historySource(
  decisions: readonly HumanApprovalDecision[] = [],
): WorkDecisionsHistorySource & {
  readonly calls: readonly {
    readonly missionId: string;
    readonly runId: string;
  }[];
} {
  const calls: Array<{ missionId: string; runId: string }> = [];
  return {
    calls,
    history: async (missionId, runId) => {
      calls.push({ missionId, runId });
      return structuredClone(decisions);
    },
  };
}

test("DDEC-001 preserves the canonical Work error for an unknown Work", async () => {
  const missing: WorkCoreSource = {
    getMission: () => undefined,
    getObservabilityEvents: () => [],
  };

  await assert.rejects(
    () =>
      new WorkDecisionsQuery(missing, historySource()).get(
        PROJECT_ID,
        WORK_ID,
      ),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-001",
  );
});

test("DDEC-001 cannot constitute a detached Work without its Mission", async () => {
  await assert.rejects(
    () =>
      new WorkDecisionsQuery(
        source(null),
        historySource(),
      ).get(PROJECT_ID, WORK_ID),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-001",
  );
});

test("DDEC-001 returns an empty collection without an authoritative run", async () => {
  const history = historySource([decision()]);
  const result = await new WorkDecisionsQuery(
    source(mission({ runId: null }), observation({ runId: null })),
    history,
  ).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(result.decisions, []);
  assert.equal(result.provenance.runId, null);
  assert.deepEqual(history.calls, []);
});

test("DDEC-001 returns an empty collection when history has no decision", async () => {
  const history = historySource();
  const result = await new WorkDecisionsQuery(
    source(),
    history,
  ).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(result.decisions, []);
  assert.deepEqual(history.calls, [
    { missionId: WORK_ID, runId: RUN_ID },
  ]);
});

test("DDEC-001 exposes exactly the authoritative HumanApprovalDecision fields", async () => {
  const authoritative = decision();
  const result = await new WorkDecisionsQuery(
    source(),
    historySource([authoritative]),
  ).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(result.decisions, [authoritative]);
  assert.deepEqual(Object.keys(result.decisions[0]).sort(), [
    "bundleFingerprint",
    "decidedAt",
    "decision",
    "decisionId",
    "identity",
    "justification",
    "request",
  ]);
  assert.equal("title" in result.decisions[0], false);
  assert.equal("dueDate" in result.decisions[0], false);
  assert.equal("priority" in result.decisions[0], false);
  assert.equal("confidence" in result.decisions[0], false);
  assert.equal("businessImpact" in result.decisions[0], false);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.decisions), true);
  assert.equal(Object.isFrozen(result.decisions[0]), true);
  assert.equal(Object.isFrozen(result.decisions[0].request), true);
  assert.equal(Object.isFrozen(result.decisions[0].identity), true);
  assert.equal(Object.isFrozen(result.decisions[0].identity.roles), true);
});

test("DDEC-001 preserves HumanApprovalWorkflow.history order", async () => {
  const first = decision({
    decisionId: "DECISION-Z",
    decidedAt: "2026-07-30T14:10:00.000Z",
  });
  const second = decision({
    decisionId: "DECISION-A",
    decision: "REJECTED",
    justification: "The evidence requires another review.",
    decidedAt: "2026-07-30T14:09:00.000Z",
  });
  const result = await new WorkDecisionsQuery(
    source(),
    historySource([first, second]),
  ).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(
    result.decisions.map((item) => item.decisionId),
    ["DECISION-Z", "DECISION-A"],
  );
});

test("DDEC-001 rejects decisions not bound to the selected Mission and run", async () => {
  await assert.rejects(
    () =>
      new WorkDecisionsQuery(
        source(),
        historySource([
          decision({
            request: {
              ...decision().request,
              missionId: "OTHER-MISSION",
            },
          }),
        ]),
      ).get(PROJECT_ID, WORK_ID),
    (error: unknown) =>
      error instanceof WorkDecisionsFailure
      && error.code === "WDEC-ERR-002",
  );
});

test("DDEC-001 does not fabricate a missing authoritative field", async () => {
  await assert.rejects(
    () =>
      new WorkDecisionsQuery(
        source(),
        historySource([
          decision({ decisionId: undefined as never }),
        ]),
      ).get(PROJECT_ID, WORK_ID),
    (error: unknown) =>
      error instanceof WorkDecisionsFailure
      && error.code === "WDEC-ERR-001",
  );
});

test("DDEC-001 records exact Work, Mission, history and persistence provenance", async () => {
  const result = await new WorkDecisionsQuery(
    source(),
    historySource([decision()]),
  ).get(PROJECT_ID, WORK_ID);

  assert.equal(result.projectId, PROJECT_ID);
  assert.equal(result.workId, WORK_ID);
  assert.deepEqual(result.provenance, {
    sourceDomain: "MISSIONS",
    producer: "HUMAN_APPROVAL_WORKFLOW",
    sourceId: `${PROJECT_ID}/${WORK_ID}/${RUN_ID}`,
    observedAt: OBSERVED_AT,
    missionId: WORK_ID,
    runId: RUN_ID,
    historySource: WORK_DECISIONS_HISTORY_SOURCE,
    persistenceSource: WORK_DECISIONS_PERSISTENCE_SOURCE,
    recordKind: WORK_DECISIONS_RECORD_KIND,
    workBindingSource: WORK_DECISIONS_BINDING_SOURCE,
  });
  assert.equal(Object.isFrozen(result.provenance), true);
});

test("DDEC-001 uses real history filtering and performs no persistent write", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-ddec-001-"));
  temporaryDirectories.push(directory);
  const repository = new IntegrationRuntimeRepository(
    join(directory, "runtime.json"),
    {
      attestationKey: TEST_ATTESTATION_KEY,
      featureFlag: { enabled: true },
    },
  );
  const workflow = new HumanApprovalWorkflow(
    repository,
    new MissionEvidenceCertifier(repository, { enabled: true }),
    new ProgramRuntimeOrchestrator({ enabled: true }),
    { enabled: true },
  );
  const otherRecord: IntegrationPersistedRecord = {
    schemaVersion: 1,
    recordId: "SESSION-1",
    kind: "SESSION",
    missionId: WORK_ID,
    runId: RUN_ID,
    source: "PROGRAM_TEST",
    occurredAt: "2026-07-30T14:07:00.000Z",
    payload: { status: "COMPLETED" },
  };
  const approvalRecord: IntegrationPersistedRecord<HumanApprovalDecision> = {
    schemaVersion: 1,
    recordId: "DECISION-1",
    kind: "HUMAN_APPROVAL",
    missionId: WORK_ID,
    runId: RUN_ID,
    source: "APPROVER-1",
    occurredAt: "2026-07-30T14:08:00.000Z",
    payload: decision(),
  };
  await repository.append(otherRecord);
  await repository.append(approvalRecord);
  const before = await repository.readAll();

  const result = await new WorkDecisionsQuery(
    source(),
    workflow,
  ).get(PROJECT_ID, WORK_ID);
  const after = await repository.readAll();

  assert.deepEqual(
    result.decisions.map((item) => item.decisionId),
    ["DECISION-1"],
  );
  assert.deepEqual(after, before);
  assert.equal(after.length, 2);
  assert.deepEqual(
    after.map((record) => record.kind),
    ["SESSION", "HUMAN_APPROVAL"],
  );
});

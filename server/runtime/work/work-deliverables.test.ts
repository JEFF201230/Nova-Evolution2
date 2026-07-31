import assert from "node:assert/strict";
import test from "node:test";
import {
  OrchestratorRuntimeService,
  RuntimeFailure,
} from "../orchestrator/orchestrator-runtime.service.js";
import {
  type MissionDefinition,
  type MissionReport,
  type RuntimeAgent,
  type RuntimeMission,
  type RuntimeObservabilityEvent,
} from "../orchestrator/orchestrator-runtime.types.js";
import {
  WORK_DELIVERABLES_EVIDENCE_SOURCE,
  WorkCoreFailure,
  WorkDeliverablesQuery,
  type WorkDeliverablesSource,
} from "./work-core.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "DINT-001";
const CREATED_AT = "2026-07-30T12:00:00.000Z";
const UPDATED_AT = "2026-07-30T12:05:00.000Z";
const SUBMITTED_AT = "2026-07-30T12:10:00.000Z";
const RUN_ID = "RUN-DINT-001";

function definition(): MissionDefinition {
  return {
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    missionType: "WORK",
    objective: "Read canonical Work Deliverables.",
    authority: "PROGRAM_DIRECTOR",
    scope: {
      allowed: ["server/runtime/work"],
      forbidden: ["apps/nova-web", "server/nova-bff"],
    },
    deliverables: ["Work Deliverables internal read integration"],
    stopCriteria: ["Canonical deliverable evidence is readable without writes."],
    authorizedReferences: ["DINT_000_DELIVERABLES_DECISION.md"],
    createdAt: CREATED_AT,
  };
}

function mission(
  overrides: Partial<RuntimeMission> = {},
): RuntimeMission {
  return {
    ...definition(),
    state: "SUBMITTED",
    assignedAgentId: "AGENT-DINT-001",
    lockId: null,
    runId: RUN_ID,
    contextId: null,
    reportId: "REPORT-DINT-001",
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}

function observation(): RuntimeObservabilityEvent {
  return {
    observabilityEventId: "OBS-DINT-001",
    runtimeEventId: "EVENT-DINT-001",
    sequence: 1,
    timestamp: UPDATED_AT,
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    runId: RUN_ID,
    correlationId: "CORR-DINT-001",
    phase: "COMPLETED",
    progression: 100,
    durationMs: 1_000,
    message: "Mission report submitted.",
    level: "INFO",
  };
}

function report(
  overrides: Partial<MissionReport> = {},
): MissionReport {
  return {
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    reportId: "REPORT-DINT-001",
    agentId: "AGENT-DINT-001",
    reportType: "RUNTIME_DELIVERY",
    deliverables: ["Work Deliverables internal read integration"],
    filesChanged: ["server/runtime/work/work-deliverables.query.ts"],
    checks: ["node:test"],
    blockers: [],
    errors: [],
    scopeConfirmed: true,
    submittedAt: SUBMITTED_AT,
    runId: RUN_ID,
    deliverableEvidence: [
      {
        path: "server/runtime/work/work-deliverables.query.ts",
        size: 1_024,
        sha256: "a".repeat(64),
        modifiedAt: "2026-07-30T12:09:00.000Z",
        runId: RUN_ID,
      },
    ],
    ...overrides,
  };
}

function source(
  currentMission: RuntimeMission | null | undefined = mission(),
  currentReport: MissionReport | null | undefined = report(),
): WorkDeliverablesSource {
  return {
    getMission: () =>
      currentMission === null || currentMission === undefined
        ? currentMission
        : structuredClone(currentMission),
    getObservabilityEvents: () => [observation()],
    getReport: () =>
      currentReport === null || currentReport === undefined
        ? currentReport
        : structuredClone(currentReport),
  };
}

test("DINT-001 preserves the canonical Work error for an unknown Work", () => {
  const unknownSource: WorkDeliverablesSource = {
    getMission: () => undefined,
    getObservabilityEvents: () => [],
    getReport: () => undefined,
  };

  assert.throws(
    () =>
      new WorkDeliverablesQuery(unknownSource).get(
        PROJECT_ID,
        WORK_ID,
      ),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-001",
  );
});

test("DINT-001 cannot constitute a detached Work without its Mission", () => {
  assert.throws(
    () =>
      new WorkDeliverablesQuery(source(null, null)).get(
        PROJECT_ID,
        WORK_ID,
      ),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-001",
  );
});

test("DINT-001 returns an empty collection when the Mission has no report", () => {
  const result = new WorkDeliverablesQuery(source(mission({
    reportId: null,
    state: "RUNNING",
  }), null)).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(result.deliverables, []);
  assert.deepEqual(result.provenance, {
    sourceDomain: "MISSIONS",
    producer: "ORCHESTRATOR_RUNTIME",
    sourceId: `${PROJECT_ID}/${WORK_ID}`,
    observedAt: CREATED_AT,
    missionId: WORK_ID,
    reportId: null,
    runId: null,
    evidenceSource: WORK_DELIVERABLES_EVIDENCE_SOURCE,
  });
});

test("DINT-001 returns an empty collection when the report has no deliverableEvidence", () => {
  const result = new WorkDeliverablesQuery(
    source(mission(), report({ deliverableEvidence: undefined })),
  ).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(result.deliverables, []);
  assert.equal(result.provenance.reportId, "REPORT-DINT-001");
  assert.equal(result.provenance.runId, RUN_ID);
});

test("DINT-001 exposes only fields present in canonical deliverable evidence", () => {
  const result = new WorkDeliverablesQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.deepEqual(result.deliverables, [
    {
      path: "server/runtime/work/work-deliverables.query.ts",
      size: 1_024,
      sha256: "a".repeat(64),
      modifiedAt: "2026-07-30T12:09:00.000Z",
      runId: RUN_ID,
    },
  ]);
  assert.deepEqual(Object.keys(result.deliverables[0]).sort(), [
    "modifiedAt",
    "path",
    "runId",
    "sha256",
    "size",
  ]);
  assert.equal("title" in result.deliverables[0], false);
  assert.equal("status" in result.deliverables[0], false);
  assert.equal("downloadUrl" in result.deliverables[0], false);
});

test("DINT-001 preserves the persistent order of multiple evidence entries", () => {
  const first = {
    path: "z-last-by-name.md",
    size: 10,
    sha256: "b".repeat(64),
    modifiedAt: "2026-07-30T12:08:00.000Z",
    runId: RUN_ID,
  };
  const second = {
    path: "a-first-by-name.md",
    size: 20,
    sha256: "c".repeat(64),
    modifiedAt: "2026-07-30T12:09:00.000Z",
    runId: RUN_ID,
  };
  const result = new WorkDeliverablesQuery(
    source(mission(), report({ deliverableEvidence: [first, second] })),
  ).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(result.deliverables, [first, second]);
});

test("DINT-001 preserves project, Work, Mission and report provenance", () => {
  const result = new WorkDeliverablesQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.equal(result.projectId, PROJECT_ID);
  assert.equal(result.workId, WORK_ID);
  assert.equal(result.missionId, WORK_ID);
  assert.deepEqual(result.provenance, {
    sourceDomain: "MISSIONS",
    producer: "ORCHESTRATOR_RUNTIME",
    sourceId: `${PROJECT_ID}/${WORK_ID}/REPORT-DINT-001`,
    observedAt: SUBMITTED_AT,
    missionId: WORK_ID,
    reportId: "REPORT-DINT-001",
    runId: RUN_ID,
    evidenceSource: WORK_DELIVERABLES_EVIDENCE_SOURCE,
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.deliverables), true);
  assert.equal(Object.isFrozen(result.deliverables[0]), true);
  assert.equal(Object.isFrozen(result.provenance), true);
});

test("DINT-001 follows RuntimeMission.reportId and performs no persistent write", async () => {
  const agent: RuntimeAgent = {
    agentId: "AGENT-DINT-001",
    missionTypes: ["WORK"],
    authorizedScopes: ["server/runtime/work"],
  };
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(definition());
  runtime.acceptMission(PROJECT_ID, WORK_ID);
  runtime.assignMission(PROJECT_ID, WORK_ID);
  runtime.acquireLock(PROJECT_ID, WORK_ID);
  await runtime.executeMission(PROJECT_ID, WORK_ID, async () => ({
    ...report(),
    submittedAt: undefined as never,
  }));

  assert.throws(
    () =>
      runtime.submitReport(report({
        reportId: "REPORT-NON-CANONICAL",
        submittedAt: "2026-07-30T12:11:00.000Z",
      })),
    RuntimeFailure,
  );

  const before = runtime.exportSnapshot();
  const result = new WorkDeliverablesQuery(runtime).get(
    PROJECT_ID,
    WORK_ID,
  );
  const after = runtime.exportSnapshot();

  assert.equal(
    runtime.getMission(PROJECT_ID, WORK_ID)?.reportId,
    "REPORT-DINT-001",
  );
  assert.equal(result.provenance.reportId, "REPORT-DINT-001");
  assert.deepEqual(after, before);
});

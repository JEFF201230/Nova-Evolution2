import assert from "node:assert/strict";
import test from "node:test";
import type {
  RuntimeMission,
  RuntimeObservabilityEvent,
} from "../orchestrator/orchestrator-runtime.types.js";
import {
  WorkObjectiveFailure,
  WorkObjectiveQuery,
  WorkObjectiveService,
  createWorkObjective,
  type WorkCoreAggregate,
} from "./work-core.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "WCF-002";
const CREATED_AT = "2026-07-30T10:00:00.000Z";
const UPDATED_AT = "2026-07-30T10:05:00.000Z";
const LABEL = "Establish the authoritative Work Objective.";

function mission(
  overrides: Partial<RuntimeMission> = {},
): RuntimeMission {
  return {
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    missionType: "WORK",
    objective: LABEL,
    authority: "PROGRAM_DIRECTOR",
    scope: {
      allowed: ["server/runtime/work"],
      forbidden: ["apps/nova-web", "server/nova-bff"],
    },
    deliverables: ["Work Objective"],
    stopCriteria: ["Work Objective is authoritative and read-only."],
    authorizedReferences: ["NOVA_WORK_CAPABILITY_ARCHITECTURE.md"],
    createdAt: CREATED_AT,
    state: "RUNNING",
    assignedAgentId: null,
    lockId: null,
    runId: "RUN-WCF-002",
    contextId: null,
    reportId: null,
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}

function observation(): RuntimeObservabilityEvent {
  return {
    observabilityEventId: "OBS-WCF-002",
    runtimeEventId: "EVENT-WCF-002",
    sequence: 1,
    timestamp: "2026-07-30T10:06:00.000Z",
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    runId: "RUN-WCF-002",
    correlationId: "CORR-WCF-002",
    phase: "RUNNING",
    progression: 25,
    durationMs: 1_000,
    message: "Mission running.",
    level: "INFO",
  };
}

function source(
  currentMission: RuntimeMission = mission(),
) {
  return {
    getMission: () => structuredClone(currentMission),
    getObservabilityEvents: () => [observation()],
  };
}

test("WCF-002 creates the minimal authoritative Work Objective model", () => {
  const objective = new WorkObjectiveQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.deepEqual(objective, {
    objectiveId: null,
    work: {
      projectId: PROJECT_ID,
      workId: WORK_ID,
    },
    label: LABEL,
    description: null,
    status: null,
    createdAt: CREATED_AT,
    updatedAt: null,
    provenance: {
      sourceDomain: "MISSIONS",
      producer: "ORCHESTRATOR_RUNTIME",
      sourceId: `${PROJECT_ID}/${WORK_ID}`,
      observedAt: CREATED_AT,
    },
  });
});

test("WCF-002 retrieves Objective through the internal Work query", () => {
  const query = new WorkObjectiveQuery(source());

  assert.equal(query.get(PROJECT_ID, WORK_ID).label, LABEL);
  assert.equal(query.get(PROJECT_ID, WORK_ID).work.workId, WORK_ID);
});

test("WCF-002 preserves the exact Work association", () => {
  const objective = new WorkObjectiveQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.deepEqual(objective.work, {
    projectId: PROJECT_ID,
    workId: WORK_ID,
  });
});

test("WCF-002 preserves authoritative Mission provenance", () => {
  const objective = new WorkObjectiveQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.deepEqual(objective.provenance, {
    sourceDomain: "MISSIONS",
    producer: "ORCHESTRATOR_RUNTIME",
    sourceId: `${PROJECT_ID}/${WORK_ID}`,
    observedAt: CREATED_AT,
  });
  assert.equal(Object.isFrozen(objective), true);
  assert.equal(Object.isFrozen(objective.work), true);
  assert.equal(Object.isFrozen(objective.provenance), true);
});

test("WCF-002 reports unavailable Objective state explicitly", () => {
  const objective = new WorkObjectiveQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.equal(objective.status, null);
});

test("WCF-002 keeps every unavailable source field explicitly absent", () => {
  const objective = new WorkObjectiveQuery(
    source(mission({ createdAt: undefined })),
  ).get(PROJECT_ID, WORK_ID);

  assert.equal(objective.objectiveId, null);
  assert.equal(objective.description, null);
  assert.equal(objective.status, null);
  assert.equal(objective.createdAt, null);
  assert.equal(objective.updatedAt, null);
});

test("WCF-002 rejects a non-Mission Objective provenance", () => {
  const work = {
    identity: {
      workId: WORK_ID,
      projectId: PROJECT_ID,
      objective: LABEL,
      mission: {
        projectId: PROJECT_ID,
        missionId: WORK_ID,
      },
      provenance: {
        sourceDomain: "WORK",
        producer: "UNAUTHORIZED",
        sourceId: `${PROJECT_ID}/${WORK_ID}`,
        observedAt: CREATED_AT,
      },
    },
    timestamps: {
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    },
  } as WorkCoreAggregate;

  assert.throws(
    () => new WorkObjectiveService().create(work),
    (error: unknown) =>
      error instanceof WorkObjectiveFailure
      && error.code === "WOBJ-ERR-002",
  );
});

test("WCF-002 model refuses invented Objective values", () => {
  assert.throws(
    () =>
      createWorkObjective({
        objectiveId: "OBJECTIVE-001" as never,
        work: {
          projectId: PROJECT_ID,
          workId: WORK_ID,
        },
        label: LABEL,
        description: null,
        status: null,
        createdAt: CREATED_AT,
        updatedAt: null,
        provenance: {
          sourceDomain: "MISSIONS",
          producer: "ORCHESTRATOR_RUNTIME",
          sourceId: `${PROJECT_ID}/${WORK_ID}`,
          observedAt: CREATED_AT,
        },
      }),
    (error: unknown) =>
      error instanceof WorkObjectiveFailure
      && error.code === "WOBJ-ERR-001",
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { OrchestratorRuntimeService } from "../orchestrator/orchestrator-runtime.service.js";
import type {
  MissionDefinition,
  MissionState,
  RuntimeMission,
  RuntimeObservabilityEvent,
} from "../orchestrator/orchestrator-runtime.types.js";
import { WorkCoreFoundation } from "./work-core-foundation.js";
import { WorkCoreFailure } from "./work-core.types.js";
import {
  WORK_LIFECYCLE_STATES,
  canTransitionWork,
  isActiveWorkLifecycle,
  workLifecycleStateOf,
} from "./work-lifecycle.js";

const PROJECT_ID = "NOVA";
const MISSION_ID = "WCF-001";
const CREATED_AT = "2026-07-30T08:00:00.000Z";
const UPDATED_AT = "2026-07-30T08:05:00.000Z";

function definition(): MissionDefinition {
  return {
    projectId: PROJECT_ID,
    missionId: MISSION_ID,
    missionType: "WORK",
    objective: "Establish the Work Core Foundation.",
    authority: "PROGRAM_DIRECTOR",
    scope: {
      allowed: ["server/runtime/work"],
      forbidden: ["apps/nova-web", "server/nova-bff"],
    },
    deliverables: ["Work Core Foundation"],
    stopCriteria: ["Work identity, lifecycle, progression and provenance are available."],
    authorizedReferences: ["NOVA_WORK_CAPABILITY_ARCHITECTURE.md"],
    createdAt: CREATED_AT,
  };
}

function runtimeMission(overrides: Partial<RuntimeMission> = {}): RuntimeMission {
  return {
    ...definition(),
    state: "RUNNING",
    assignedAgentId: null,
    lockId: null,
    runId: "RUN-WCF-001",
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
    observabilityEventId: "OBS-WCF-001-2",
    runtimeEventId: "EVENT-WCF-001-2",
    sequence: 2,
    timestamp: "2026-07-30T08:06:00.000Z",
    projectId: PROJECT_ID,
    missionId: MISSION_ID,
    runId: "RUN-WCF-001",
    correlationId: "CORR-WCF-001",
    phase: "RUNNING",
    progression: 50,
    durationMs: 1_000,
    message: "Mission running.",
    level: "INFO",
    ...overrides,
  };
}

function source(
  mission: RuntimeMission | undefined = runtimeMission(),
  events: RuntimeObservabilityEvent[] = [observation()],
) {
  return {
    getMission: () => mission,
    getObservabilityEvents: () => structuredClone(events),
  };
}

test("WCF-001 establishes the minimal Work aggregate from authoritative producers", () => {
  const work = new WorkCoreFoundation(source()).load(PROJECT_ID, MISSION_ID);

  assert.deepEqual(work, {
    schemaVersion: "1.0.0",
    identity: {
      workId: MISSION_ID,
      projectId: PROJECT_ID,
      objective: "Establish the Work Core Foundation.",
      mission: {
        projectId: PROJECT_ID,
        missionId: MISSION_ID,
      },
      provenance: {
        sourceDomain: "MISSIONS",
        producer: "ORCHESTRATOR_RUNTIME",
        sourceId: `${PROJECT_ID}/${MISSION_ID}`,
        observedAt: CREATED_AT,
      },
    },
    lifecycle: {
      current: "ACTIVE",
      observedAt: UPDATED_AT,
      provenance: {
        sourceDomain: "WORK",
        producer: "WCF-001-LIFECYCLE-001",
        sourceId: `${PROJECT_ID}/${MISSION_ID}/ACTIVE`,
        observedAt: UPDATED_AT,
      },
    },
    progression: {
      percentage: 50,
      observedAt: "2026-07-30T08:06:00.000Z",
      provenance: {
        sourceDomain: "MONITORING",
        producer: "ORCHESTRATOR_OBSERVABILITY",
        sourceId: "OBS-WCF-001-2",
        observedAt: "2026-07-30T08:06:00.000Z",
        sequence: 2,
        correlationId: "CORR-WCF-001",
        runId: "RUN-WCF-001",
      },
    },
    timestamps: {
      createdAt: CREATED_AT,
      updatedAt: "2026-07-30T08:06:00.000Z",
    },
  });
});

test("WCF-001 qualifies every technical Mission state explicitly", () => {
  const expected: Readonly<Record<MissionState, string>> = {
    DRAFT: "CREATED",
    READY: "READY",
    ASSIGNED: "READY",
    LOCKED: "ACTIVE",
    RUNNING: "ACTIVE",
    WAITING_INPUT: "WAITING",
    WAITING_DEPENDENCY: "WAITING",
    ESCALATED: "WAITING",
    SUBMITTED: "VALIDATING",
    TECHNICAL_VALIDATION: "VALIDATING",
    DOCUMENTARY_VALIDATION: "VALIDATING",
    HUMAN_VALIDATION: "VALIDATING",
    NEEDS_REVISION: "ACTIVE",
    ACCEPTED: "COMPLETED",
    REJECTED: "FAILED",
    FAILED: "FAILED",
    TIMEOUT: "FAILED",
    CANCELLED: "CANCELLED",
    CERTIFIED: "COMPLETED",
  };

  for (const [missionState, workState] of Object.entries(expected)) {
    assert.equal(workLifecycleStateOf(missionState as MissionState), workState);
  }
  assert.deepEqual(WORK_LIFECYCLE_STATES, [
    "CREATED",
    "READY",
    "ACTIVE",
    "WAITING",
    "VALIDATING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
  ]);
});

test("WCF-001 exposes explicit Work transition rules", () => {
  assert.equal(canTransitionWork("CREATED", "READY"), true);
  assert.equal(canTransitionWork("ACTIVE", "WAITING"), true);
  assert.equal(canTransitionWork("WAITING", "ACTIVE"), true);
  assert.equal(canTransitionWork("COMPLETED", "ACTIVE"), false);
  assert.equal(canTransitionWork("ACTIVE", "ACTIVE"), true);
  assert.equal(isActiveWorkLifecycle("CREATED"), true);
  assert.equal(isActiveWorkLifecycle("FAILED"), true);
  assert.equal(isActiveWorkLifecycle("COMPLETED"), false);
  assert.equal(isActiveWorkLifecycle("CANCELLED"), false);
});

test("WCF-001 selects progression deterministically and ignores other Missions", () => {
  const older = observation({
    observabilityEventId: "OBS-WCF-001-1",
    sequence: 1,
    timestamp: "2026-07-30T08:04:00.000Z",
    progression: 20,
  });
  const latest = observation({
    observabilityEventId: "OBS-WCF-001-3",
    sequence: 3,
    progression: 75,
  });
  const unrelated = observation({
    observabilityEventId: "OBS-OTHER-99",
    missionId: "OTHER",
    sequence: 99,
    progression: 100,
  });

  const first = new WorkCoreFoundation(
    source(runtimeMission(), [latest, unrelated, older]),
  ).load(PROJECT_ID, MISSION_ID);
  const second = new WorkCoreFoundation(
    source(runtimeMission(), [older, latest, unrelated]),
  ).load(PROJECT_ID, MISSION_ID);

  assert.deepEqual(first, second);
  assert.equal(first.progression.percentage, 75);
  assert.equal(first.progression.provenance.sourceId, "OBS-WCF-001-3");
});

test("WCF-001 is read-only against the active Orchestrator Runtime", () => {
  const runtime = new OrchestratorRuntimeService();
  runtime.createMission(definition());
  const missionBefore = runtime.getMission(PROJECT_ID, MISSION_ID);
  const eventsBefore = runtime.getEvents(PROJECT_ID, MISSION_ID);
  const observationsBefore = runtime.getObservabilityEvents(PROJECT_ID, MISSION_ID);

  const work = new WorkCoreFoundation(runtime).load(PROJECT_ID, MISSION_ID);

  assert.equal(work.lifecycle.current, "CREATED");
  assert.equal(work.progression.percentage, 0);
  assert.deepEqual(runtime.getMission(PROJECT_ID, MISSION_ID), missionBefore);
  assert.deepEqual(runtime.getEvents(PROJECT_ID, MISSION_ID), eventsBefore);
  assert.deepEqual(
    runtime.getObservabilityEvents(PROJECT_ID, MISSION_ID),
    observationsBefore,
  );
});

test("WCF-001 returns deeply immutable domain data without UI projection fields", () => {
  const work = new WorkCoreFoundation(source()).load(PROJECT_ID, MISSION_ID);

  assert.equal(Object.isFrozen(work), true);
  assert.equal(Object.isFrozen(work.identity), true);
  assert.equal(Object.isFrozen(work.identity.mission), true);
  assert.equal(Object.isFrozen(work.lifecycle), true);
  assert.equal(Object.isFrozen(work.progression), true);
  assert.equal(Object.isFrozen(work.progression.provenance), true);
  assert.equal(Object.isFrozen(work.timestamps), true);
  assert.deepEqual(Object.keys(work).sort(), [
    "identity",
    "lifecycle",
    "progression",
    "schemaVersion",
    "timestamps",
  ]);
});

test("WCF-001 refuses to constitute Work without its mandatory producers", () => {
  const missingMissionSource = {
    getMission: () => undefined,
    getObservabilityEvents: () => [observation()],
  };

  assert.throws(
    () =>
      new WorkCoreFoundation(missingMissionSource).load(
        PROJECT_ID,
        MISSION_ID,
      ),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-001",
  );
  assert.throws(
    () =>
      new WorkCoreFoundation(source(runtimeMission(), [])).load(
        PROJECT_ID,
        MISSION_ID,
      ),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-003",
  );
});

test("WCF-001 rejects invalid progression instead of inventing a replacement", () => {
  assert.throws(
    () =>
      new WorkCoreFoundation(
        source(runtimeMission(), [observation({ progression: 101 })]),
      ).load(PROJECT_ID, MISSION_ID),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-004",
  );
});

test("WCF-001 rejects ambiguous bindings and invalid timestamps", () => {
  assert.throws(
    () =>
      new WorkCoreFoundation(
        source(runtimeMission({ missionId: "OTHER" })),
      ).load(PROJECT_ID, MISSION_ID),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-002",
  );
  assert.throws(
    () =>
      new WorkCoreFoundation(
        source(runtimeMission({ updatedAt: "not-a-date" })),
      ).load(PROJECT_ID, MISSION_ID),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-005",
  );
});

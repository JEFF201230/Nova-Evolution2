import assert from "node:assert/strict";
import test from "node:test";
import {
  OrchestratorRuntimeService,
} from "../orchestrator/orchestrator-runtime.service.js";
import type {
  MissionDefinition,
  RuntimeAgent,
  RuntimeMission,
  RuntimeObservabilityEvent,
} from "../orchestrator/orchestrator-runtime.types.js";
import {
  WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE,
  WORK_TECHNICAL_AGENT_REGISTRY_SOURCE,
  WorkCoreFailure,
  WorkTechnicalAgentFailure,
  WorkTechnicalAgentQuery,
  type WorkTechnicalAgentSource,
} from "./work-core.js";

const PROJECT_ID = "NOVA";
const WORK_ID = "MWA-001";
const AGENT_ID = "AGENT-MWA-001";
const CREATED_AT = "2026-07-30T16:00:00.000Z";
const UPDATED_AT = "2026-07-30T16:05:00.000Z";

function definition(): MissionDefinition {
  return {
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    missionType: "WORK",
    objective: "Read the canonical Work technical agent.",
    authority: "PROGRAM_DIRECTOR",
    scope: {
      allowed: ["server/runtime/work"],
      forbidden: ["apps/nova-web", "server/nova-bff"],
    },
    deliverables: ["Work Technical Agent internal read integration"],
    stopCriteria: ["The RuntimeAgent is readable without writes."],
    authorizedReferences: ["MWA_000_ASSIGNMENT_DECISION.md"],
    requestedAgentId: AGENT_ID,
    createdAt: CREATED_AT,
  };
}

function mission(
  overrides: Partial<RuntimeMission> = {},
): RuntimeMission {
  return {
    ...definition(),
    state: "ASSIGNED",
    assignedAgentId: AGENT_ID,
    lockId: null,
    runId: null,
    contextId: null,
    reportId: null,
    updatedAt: UPDATED_AT,
    ...overrides,
  };
}

function observation(): RuntimeObservabilityEvent {
  return {
    observabilityEventId: "OBS-MWA-001",
    runtimeEventId: "EVENT-MWA-001",
    sequence: 1,
    timestamp: UPDATED_AT,
    projectId: PROJECT_ID,
    missionId: WORK_ID,
    runId: null,
    correlationId: "CORR-MWA-001",
    phase: "ASSIGNED",
    progression: 20,
    durationMs: 0,
    message: "Technical agent assigned.",
    level: "INFO",
  };
}

function runtimeAgent(
  overrides: Partial<RuntimeAgent> = {},
): RuntimeAgent {
  return {
    agentId: AGENT_ID,
    missionTypes: ["WORK", "ANALYSIS"],
    authorizedScopes: ["server/runtime/work", "server/runtime/orchestrator"],
    ...overrides,
  };
}

function source(
  currentMission: RuntimeMission | null | undefined = mission(),
  agents: RuntimeAgent[] = [runtimeAgent()],
): WorkTechnicalAgentSource {
  return {
    getMission: () =>
      currentMission === null || currentMission === undefined
        ? currentMission
        : structuredClone(currentMission),
    getObservabilityEvents: () => [observation()],
    exportSnapshot: () => ({ agents: structuredClone(agents) }),
  };
}

test("MWA-001 preserves the canonical Work error for an unknown Work", () => {
  const missingSource: WorkTechnicalAgentSource = {
    getMission: () => undefined,
    getObservabilityEvents: () => [],
    exportSnapshot: () => ({ agents: [] }),
  };

  assert.throws(
    () =>
      new WorkTechnicalAgentQuery(missingSource).get(
        PROJECT_ID,
        WORK_ID,
      ),
    (error: unknown) =>
      error instanceof WorkCoreFailure && error.code === "WCF-ERR-001",
  );
});

test("MWA-001 returns an explicit absence for an unassigned Mission", () => {
  const result = new WorkTechnicalAgentQuery(
    source(mission({ assignedAgentId: null, state: "READY" }), []),
  ).get(PROJECT_ID, WORK_ID);

  assert.equal(result.agent, null);
  assert.deepEqual(result.provenance, {
    sourceDomain: "MISSIONS",
    producer: "ORCHESTRATOR_RUNTIME",
    sourceId: `${PROJECT_ID}/${WORK_ID}`,
    observedAt: UPDATED_AT,
    missionId: WORK_ID,
    assignmentSource: WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE,
    agentSource: WORK_TECHNICAL_AGENT_REGISTRY_SOURCE,
  });
});

test("MWA-001 exposes only the existing RuntimeAgent fields", () => {
  const result = new WorkTechnicalAgentQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.deepEqual(result.agent, {
    agentId: AGENT_ID,
    missionTypes: ["WORK", "ANALYSIS"],
    authorizedScopes: [
      "server/runtime/work",
      "server/runtime/orchestrator",
    ],
  });
  assert.deepEqual(Object.keys(result.agent!).sort(), [
    "agentId",
    "authorizedScopes",
    "missionTypes",
  ]);
  assert.equal("owner" in result.agent!, false);
  assert.equal("participant" in result.agent!, false);
  assert.equal("userId" in result.agent!, false);
  assert.equal("displayName" in result.agent!, false);
  assert.equal("status" in result.agent!, false);
});

test("MWA-001 preserves RuntimeAgent arrays and selects only the assigned agent", () => {
  const agent = runtimeAgent({
    missionTypes: ["ZETA", "ALPHA", "ZETA"],
    authorizedScopes: ["scope-b", "scope-a", "scope-b"],
  });
  const result = new WorkTechnicalAgentQuery(
    source(mission(), [
      runtimeAgent({ agentId: "UNASSIGNED-AGENT" }),
      agent,
    ]),
  ).get(PROJECT_ID, WORK_ID);

  assert.deepEqual(result.agent?.missionTypes, [
    "ZETA",
    "ALPHA",
    "ZETA",
  ]);
  assert.deepEqual(result.agent?.authorizedScopes, [
    "scope-b",
    "scope-a",
    "scope-b",
  ]);
  assert.equal(result.agent?.agentId, AGENT_ID);
});

test("MWA-001 preserves Work, Mission and technical assignment provenance", () => {
  const result = new WorkTechnicalAgentQuery(source()).get(
    PROJECT_ID,
    WORK_ID,
  );

  assert.equal(result.projectId, PROJECT_ID);
  assert.equal(result.workId, WORK_ID);
  assert.equal(result.missionId, WORK_ID);
  assert.deepEqual(result.provenance, {
    sourceDomain: "MISSIONS",
    producer: "ORCHESTRATOR_RUNTIME",
    sourceId: `${PROJECT_ID}/${WORK_ID}/${AGENT_ID}`,
    observedAt: UPDATED_AT,
    missionId: WORK_ID,
    assignmentSource: WORK_TECHNICAL_AGENT_ASSIGNMENT_SOURCE,
    agentSource: WORK_TECHNICAL_AGENT_REGISTRY_SOURCE,
  });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.agent), true);
  assert.equal(Object.isFrozen(result.agent?.missionTypes), true);
  assert.equal(Object.isFrozen(result.agent?.authorizedScopes), true);
  assert.equal(Object.isFrozen(result.provenance), true);
});

test("MWA-001 rejects an assigned agent missing from the RuntimeAgent registry", () => {
  assert.throws(
    () =>
      new WorkTechnicalAgentQuery(source(mission(), [])).get(
        PROJECT_ID,
        WORK_ID,
      ),
    (error: unknown) =>
      error instanceof WorkTechnicalAgentFailure
      && error.code === "WTA-ERR-002",
  );
});

test("MWA-001 rejects a detached RuntimeMission binding", () => {
  assert.throws(
    () =>
      new WorkTechnicalAgentQuery(
        source(mission({ projectId: "OTHER" })),
      ).get(PROJECT_ID, WORK_ID),
    (error: unknown) =>
      error instanceof WorkCoreFailure
      && error.code === "WCF-ERR-002",
  );
});

test("MWA-001 reads the live Orchestrator without persistent mutation", () => {
  const agent = runtimeAgent({
    missionTypes: ["WORK"],
    authorizedScopes: ["server/runtime/work"],
  });
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(definition());
  runtime.acceptMission(PROJECT_ID, WORK_ID);
  runtime.assignMission(PROJECT_ID, WORK_ID);

  const before = runtime.exportSnapshot();
  const result = new WorkTechnicalAgentQuery(runtime).get(
    PROJECT_ID,
    WORK_ID,
  );
  const after = runtime.exportSnapshot();

  assert.equal(result.agent?.agentId, AGENT_ID);
  assert.deepEqual(after, before);
});

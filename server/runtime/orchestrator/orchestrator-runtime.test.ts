import assert from "node:assert/strict";
import test from "node:test";
import { OrchestratorRuntimeService, RuntimeFailure } from "./orchestrator-runtime.service.js";
import type { MissionDefinition, RuntimeAgent } from "./orchestrator-runtime.types.js";

const agent: RuntimeAgent = {
  agentId: "AGENT-04-RUNTIME",
  missionTypes: ["RUNTIME"],
  authorizedScopes: ["server/cerebrau-runtime"],
};

function mission(overrides: Partial<MissionDefinition> = {}): MissionDefinition {
  return {
    projectId: "VEEDDA",
    missionId: "NOVA-004",
    missionType: "RUNTIME",
    objective: "Build mission runtime workflow runtime scheduler queue execution event bus.",
    authority: "ORCHESTRATOR",
    scope: {
      allowed: ["server/cerebrau-runtime"],
      forbidden: ["secrets"],
    },
    deliverables: ["Mission Runtime", "Workflow Runtime", "Scheduler", "Queue", "Execution", "Event Bus"],
    stopCriteria: ["Runtime can create, schedule, execute and validate missions."],
    authorizedReferences: ["ORCHESTRATOR_RUNTIME_CONTRACT_V1.md", "ORCHESTRATOR_STATE_MODEL_V1.md"],
    priority: 10,
    ...overrides,
  };
}

test("Orchestrator Runtime creates and accepts a mission into the project queue", () => {
  const runtime = new OrchestratorRuntimeService([agent]);

  const created = runtime.createMission(mission());
  assert.equal(created.state, "DRAFT");

  const accepted = runtime.acceptMission("VEEDDA", "NOVA-004");
  assert.equal(accepted.state, "READY");
  assert.deepEqual(
    runtime.getQueue("VEEDDA").items.map((item) => item.missionId),
    ["NOVA-004"],
  );

  assert.deepEqual(
    runtime.getEvents("VEEDDA", "NOVA-004").map((event) => event.eventName),
    ["MissionCreated", "MissionAccepted"],
  );
});

test("Scheduler selects a compatible agent and preserves project isolation", () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission());
  runtime.createMission(mission({ projectId: "OTHER", missionId: "NOVA-004-OTHER" }));
  runtime.acceptMission("VEEDDA", "NOVA-004");
  runtime.acceptMission("OTHER", "NOVA-004-OTHER");

  const scheduled = runtime.scheduleNext("VEEDDA");

  assert.equal(scheduled?.assignedAgentId, "AGENT-04-RUNTIME");
  assert.equal(scheduled?.state, "ASSIGNED");
  assert.equal(runtime.getQueue("VEEDDA").items.length, 0);
  assert.equal(runtime.getQueue("OTHER").items.length, 1);
});

test("Runtime acquires a lock, builds context, executes and submits a report", async () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission());
  runtime.acceptMission("VEEDDA", "NOVA-004");
  runtime.assignMission("VEEDDA", "NOVA-004");
  const lock = runtime.acquireLock("VEEDDA", "NOVA-004");

  const result = await runtime.executeMission("VEEDDA", "NOVA-004", async (context, activeMission) => ({
    projectId: context.projectId,
    missionId: context.missionId,
    reportId: "REPORT-NOVA-004",
    agentId: activeMission.assignedAgentId ?? "",
    reportType: "RUNTIME_DELIVERY",
    deliverables: context.deliverables,
    filesChanged: ["server/cerebrau-runtime/orchestrator-runtime"],
    checks: ["node:test"],
    blockers: [],
    errors: [],
    scopeConfirmed: true,
  }));

  assert.equal(lock.status, "ACTIVE");
  assert.equal(result.mission.state, "SUBMITTED");
  assert.equal(result.report.reportId, "REPORT-NOVA-004");
  assert.deepEqual(
    runtime.getEvents("VEEDDA", "NOVA-004").map((event) => event.eventName),
    ["MissionCreated", "MissionAccepted", "AgentAssigned", "LockGranted", "AgentStarted", "ReportSubmitted"],
  );
});

test("Workflow validation can close a submitted mission and release the lock", async () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission());
  runtime.acceptMission("VEEDDA", "NOVA-004");
  runtime.assignMission("VEEDDA", "NOVA-004");
  runtime.acquireLock("VEEDDA", "NOVA-004");
  await runtime.executeMission("VEEDDA", "NOVA-004", async (context, activeMission) => ({
    projectId: context.projectId,
    missionId: context.missionId,
    reportId: "REPORT-NOVA-004",
    agentId: activeMission.assignedAgentId ?? "",
    reportType: "RUNTIME_DELIVERY",
    deliverables: context.deliverables,
    filesChanged: [],
    checks: [],
    blockers: [],
    errors: [],
    scopeConfirmed: true,
  }));

  runtime.startTechnicalValidation("VEEDDA", "NOVA-004");
  runtime.acceptTechnicalValidation("VEEDDA", "NOVA-004", "HUMAN_VALIDATION");
  runtime.approveMission("VEEDDA", "NOVA-004");

  assert.equal(runtime.getMission("VEEDDA", "NOVA-004")?.state, "ACCEPTED");
  assert.equal(runtime.eventBus.replay("VEEDDA", "NOVA-004"), "ACCEPTED");
  assert.equal(runtime.getEvents("VEEDDA", "NOVA-004").at(-1)?.eventName, "LockReleased");
});

test("Runtime rejects invalid transitions and audits the rejection", () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission());

  assert.throws(() => runtime.assignMission("VEEDDA", "NOVA-004"), RuntimeFailure);
  assert.equal(runtime.getAudits().some((entry) => entry.result === "rejected"), false);

  assert.throws(
    () =>
      runtime.eventBus.publish({
        eventName: "AgentStarted",
        projectId: "VEEDDA",
        missionId: "NOVA-004",
        sourceState: "DRAFT",
        targetState: "RUNNING",
        producer: "Agent Executor",
        correlationId: "CORR-VEEDDA-NOVA-004",
      }),
    RuntimeFailure,
  );
  assert.equal(runtime.getAudits().some((entry) => entry.result === "rejected"), true);
});

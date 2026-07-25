import assert from "node:assert/strict";
import test from "node:test";
import { OrchestratorRuntimeService, RuntimeFailure } from "./orchestrator-runtime.service.js";
import type { MissionDefinition, RuntimeAgent, RuntimeMissionCertificate } from "./orchestrator-runtime.types.js";

const agent: RuntimeAgent = {
  agentId: "AGENT-04-RUNTIME",
  missionTypes: ["RUNTIME"],
  authorizedScopes: ["server/cerebrau-runtime"],
};

const testCertificate: RuntimeMissionCertificate = {
  schemaVersion: "1.0.0",
  certificateId: "CERT-TEST",
  algorithm: "HMAC-SHA256",
  binding: {
    projectId: "VEEDDA",
    missionId: "NOVA-004",
    reportId: "REPORT-NOVA-004",
    runId: "RUN-TEST",
    promptHash: "a".repeat(64),
    executionRequestHash: "b".repeat(64),
    manifestHash: "c".repeat(64),
    reportFingerprint: "d".repeat(64),
    codexVersion: "0.144.1",
    codexPath: "C:/tools/codex.cmd",
    codexBinaryHash: "e".repeat(64),
  },
  decision: {
    authorityId: "AUTH-1",
    authorityType: "HUMAN",
    keyId: "KEY-1",
    decision: "CERTIFIED",
    missionId: "NOVA-004",
    runId: "RUN-TEST",
    reportFingerprint: "d".repeat(64),
    decidedAt: "2026-07-25T00:00:00.000Z",
    correlationId: "CORR-TEST",
  },
  certificateFingerprint: "f".repeat(64),
  signature: "0".repeat(64),
};
const safeRecoveryEvidence = {
  processAlive: false,
  processTreeAlive: false,
  reportPresent: false,
  worktreeModified: false,
  journalValid: true,
  snapshotValid: true,
  artifactsValid: true,
} as const;

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
  runtime.certifyMission("VEEDDA", "NOVA-004", testCertificate);

  assert.equal(runtime.getMission("VEEDDA", "NOVA-004")?.state, "CERTIFIED");
  assert.equal(runtime.eventBus.replay("VEEDDA", "NOVA-004"), "CERTIFIED");
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

test("Failed execution releases the active lock and leaves a coherent FAILED mission", async () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission({ missionId: "NOVA-FAILED" }));
  runtime.acceptMission("VEEDDA", "NOVA-FAILED");
  runtime.assignMission("VEEDDA", "NOVA-FAILED");
  runtime.acquireLock("VEEDDA", "NOVA-FAILED");
  await assert.rejects(
    () => runtime.executeMission("VEEDDA", "NOVA-FAILED", async () => { throw new Error("handler failed"); }),
    /handler failed/,
  );
  assert.equal(runtime.getMission("VEEDDA", "NOVA-FAILED")?.state, "FAILED");
  assert.equal(runtime.exportSnapshot().locks[0]?.status, "RELEASED");
  assert.equal(runtime.getEvents("VEEDDA", "NOVA-FAILED").at(-1)?.eventName, "LockReleased");
});

test("Assign failure leaves the mission READY and without a lock", () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission({ missionId: "NOVA-ASSIGN-FAIL" }));
  runtime.acceptMission("VEEDDA", "NOVA-ASSIGN-FAIL");
  assert.throws(() => runtime.assignMission("VEEDDA", "NOVA-ASSIGN-FAIL", "UNKNOWN"), RuntimeFailure);
  assert.equal(runtime.getMission("VEEDDA", "NOVA-ASSIGN-FAIL")?.state, "READY");
  assert.equal(runtime.getMission("VEEDDA", "NOVA-ASSIGN-FAIL")?.lockId, null);
});

test("Concurrent execution cannot create a second active run", async () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission({ missionId: "NOVA-CONCURRENT" }));
  runtime.acceptMission("VEEDDA", "NOVA-CONCURRENT");
  runtime.assignMission("VEEDDA", "NOVA-CONCURRENT");
  runtime.acquireLock("VEEDDA", "NOVA-CONCURRENT");
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const first = runtime.executeMission("VEEDDA", "NOVA-CONCURRENT", async (context, activeMission) => {
    await gate;
    return { projectId: context.projectId, missionId: context.missionId, reportId: "REPORT-CONCURRENT", agentId: activeMission.assignedAgentId ?? "", reportType: "TEST", deliverables: ["x"], filesChanged: [], checks: ["x"], blockers: [], errors: [], scopeConfirmed: true };
  });
  await assert.rejects(() => runtime.executeMission("VEEDDA", "NOVA-CONCURRENT", async () => { throw new Error("must not run"); }), RuntimeFailure);
  release();
  await first;
  assert.equal(runtime.getMission("VEEDDA", "NOVA-CONCURRENT")?.state, "SUBMITTED");
});

test("parent and child scopes cannot hold concurrent locks", () => {
  const wildcardAgent: RuntimeAgent = { agentId: "AGENT-SCOPE", missionTypes: ["*"], authorizedScopes: ["*"] };
  const runtime = new OrchestratorRuntimeService([wildcardAgent]);
  runtime.createMission(mission({ missionId: "NOVA-PARENT", scope: { allowed: ["server/nova-core/**"], forbidden: [] } }));
  runtime.createMission(mission({ missionId: "NOVA-CHILD", scope: { allowed: ["server/nova-core/http/**"], forbidden: [] } }));
  runtime.acceptMission("VEEDDA", "NOVA-PARENT");
  runtime.acceptMission("VEEDDA", "NOVA-CHILD");
  runtime.assignMission("VEEDDA", "NOVA-PARENT", wildcardAgent.agentId);
  runtime.assignMission("VEEDDA", "NOVA-CHILD", wildcardAgent.agentId);
  runtime.acquireLock("VEEDDA", "NOVA-PARENT");

  assert.throws(() => runtime.acquireLock("VEEDDA", "NOVA-CHILD"), /conflicts/i);
  assert.equal(runtime.getMission("VEEDDA", "NOVA-CHILD")?.state, "ASSIGNED");
});

test("Windows case variants cannot bypass an active scope lock", () => {
  const wildcardAgent: RuntimeAgent = { agentId: "AGENT-WINDOWS-SCOPE", missionTypes: ["*"], authorizedScopes: ["*"] };
  const runtime = new OrchestratorRuntimeService([wildcardAgent]);
  runtime.createMission(mission({ missionId: "NOVA-UPPER", scope: { allowed: ["Server/Nova-Core/**"], forbidden: [] } }));
  runtime.createMission(mission({ missionId: "NOVA-LOWER", scope: { allowed: ["server/nova-core/http/**"], forbidden: [] } }));
  for (const missionId of ["NOVA-UPPER", "NOVA-LOWER"]) {
    runtime.acceptMission("VEEDDA", missionId);
    runtime.assignMission("VEEDDA", missionId, wildcardAgent.agentId);
  }
  runtime.acquireLock("VEEDDA", "NOVA-UPPER");
  if (process.platform === "win32") {
    assert.throws(() => runtime.acquireLock("VEEDDA", "NOVA-LOWER"), /conflicts/i);
  }
});

test("an interrupted RUNNING snapshot is explicitly abandoned and remains replayable", async () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission({ missionId: "NOVA-RECOVERY" }));
  runtime.acceptMission("VEEDDA", "NOVA-RECOVERY");
  runtime.assignMission("VEEDDA", "NOVA-RECOVERY");
  runtime.acquireLock("VEEDDA", "NOVA-RECOVERY");
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => { finish = resolve; });
  const active = runtime.executeMission("VEEDDA", "NOVA-RECOVERY", async (context, activeMission) => {
    await gate;
    return {
      projectId: context.projectId,
      missionId: context.missionId,
      reportId: "REPORT-RECOVERY",
      agentId: activeMission.assignedAgentId ?? "",
      reportType: "TEST",
      deliverables: ["recovery"],
      filesChanged: [],
      checks: ["recovery"],
      blockers: [],
      errors: [],
      scopeConfirmed: true,
    };
  });
  const interrupted = runtime.exportSnapshot();
  const runId = interrupted.missions.find((entry) => entry.missionId === "NOVA-RECOVERY")?.runId;
  assert.ok(runId);
  assert.equal(interrupted.runs?.find((run) => run.runId === runId)?.status, "RUNNING");
  finish();
  await active;

  const orphan = new OrchestratorRuntimeService([agent], interrupted);
  assert.equal(orphan.recoverMission("VEEDDA", "NOVA-RECOVERY", runId, "reconcile", safeRecoveryEvidence).classification, "ORPHAN_LOCK");

  const withoutLock = structuredClone(interrupted);
  withoutLock.locks.forEach((lock) => { lock.status = "RELEASED"; });
  const absent = new OrchestratorRuntimeService([agent], withoutLock);
  assert.equal(absent.recoverMission("VEEDDA", "NOVA-RECOVERY", runId, "reconcile", safeRecoveryEvidence).classification, "INTERRUPTED_REPORT_ABSENT");

  const withReport = structuredClone(withoutLock);
  withReport.missions[0]!.reportId = "REPORT-CRASH";
  withReport.reports.push({
    projectId: "VEEDDA",
    missionId: "NOVA-RECOVERY",
    reportId: "REPORT-CRASH",
    agentId: agent.agentId,
    reportType: "RECOVERED",
    deliverables: ["recovery"],
    filesChanged: [],
    checks: ["recovery"],
    blockers: [],
    errors: [],
    scopeConfirmed: true,
    submittedAt: "2026-07-25T00:00:00.000Z",
  });
  const present = new OrchestratorRuntimeService([agent], withReport);
  assert.equal(present.recoverMission("VEEDDA", "NOVA-RECOVERY", runId, "reconcile", { ...safeRecoveryEvidence, reportPresent: true }).classification, "INTERRUPTED_REPORT_PRESENT");

  const restored = new OrchestratorRuntimeService([agent], interrupted);
  const recovery = restored.recoverMission("VEEDDA", "NOVA-RECOVERY", runId, "abandon", safeRecoveryEvidence);
  assert.equal(recovery.state, "CANCELLED");
  assert.equal(restored.exportSnapshot().locks.find((lock) => lock.missionId === "NOVA-RECOVERY")?.status, "RELEASED");
  assert.equal(restored.eventBus.replay("VEEDDA", "NOVA-RECOVERY"), "CANCELLED");
  assert.ok(restored.getEvents("VEEDDA", "NOVA-RECOVERY").every((event) => event.eventHash && event.schemaVersion === 1));
});

for (const scenario of [
  { code: "NOVA_CORE_EXECUTION_CANCELLED", state: "CANCELLED", event: "MissionCancelled" },
  { code: "NOVA_CORE_EXECUTION_TIMEOUT", state: "TIMEOUT", event: "ExecutionTimedOut" },
] as const) {
  test(`execution ${scenario.code} persists ${scenario.state} and releases the lock`, async () => {
    const runtime = new OrchestratorRuntimeService([agent]);
    const missionId = `NOVA-${scenario.state}`;
    runtime.createMission(mission({ missionId }));
    runtime.acceptMission("VEEDDA", missionId);
    runtime.assignMission("VEEDDA", missionId);
    runtime.acquireLock("VEEDDA", missionId);
    const failure = Object.assign(new Error(scenario.code), { code: scenario.code });

    await assert.rejects(() => runtime.executeMission("VEEDDA", missionId, async () => { throw failure; }));

    assert.equal(runtime.getMission("VEEDDA", missionId)?.state, scenario.state);
    assert.equal(runtime.exportSnapshot().runs?.[0]?.status, scenario.state);
    assert.ok(runtime.getEvents("VEEDDA", missionId).some((event) => event.eventName === scenario.event));
    assert.equal(runtime.exportSnapshot().locks[0]?.status, "RELEASED");
  });
}

test("recovery refuses resume when any critical inspection signal is UNKNOWN", async () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission({ missionId: "NOVA-RECOVERY-UNKNOWN" }));
  runtime.acceptMission("VEEDDA", "NOVA-RECOVERY-UNKNOWN");
  runtime.assignMission("VEEDDA", "NOVA-RECOVERY-UNKNOWN");
  runtime.acquireLock("VEEDDA", "NOVA-RECOVERY-UNKNOWN");
  await assert.rejects(
    () => runtime.executeMission("VEEDDA", "NOVA-RECOVERY-UNKNOWN", async () => {
      throw new Error("crash");
    }),
  );
  const runId = runtime.getMission("VEEDDA", "NOVA-RECOVERY-UNKNOWN")!.runId!;
  assert.throws(
    () => runtime.recoverMission(
      "VEEDDA",
      "NOVA-RECOVERY-UNKNOWN",
      runId,
      "recover",
      { ...safeRecoveryEvidence, processAlive: "UNKNOWN" },
    ),
    /unsafe/i,
  );
});

test("journal is the state authority and terminal missions reject later runtime events", async () => {
  const runtime = new OrchestratorRuntimeService([agent]);
  runtime.createMission(mission({ missionId: "NOVA-STATE-AUTHORITY" }));
  runtime.acceptMission("VEEDDA", "NOVA-STATE-AUTHORITY");
  const forged = runtime.exportSnapshot();
  forged.missions[0]!.state = "CERTIFIED";
  assert.throws(() => new OrchestratorRuntimeService([agent], forged), /contradicts authoritative journal/i);

  runtime.assignMission("VEEDDA", "NOVA-STATE-AUTHORITY");
  runtime.acquireLock("VEEDDA", "NOVA-STATE-AUTHORITY");
  const cancelled = Object.assign(new Error("cancelled"), { code: "NOVA_CORE_EXECUTION_CANCELLED" });
  await assert.rejects(
    () => runtime.executeMission("VEEDDA", "NOVA-STATE-AUTHORITY", async () => { throw cancelled; }),
  );
  assert.equal(runtime.getMission("VEEDDA", "NOVA-STATE-AUTHORITY")?.state, "CANCELLED");
  assert.throws(
    () => runtime.publishExecutionOutput("VEEDDA", "NOVA-STATE-AUTHORITY", {
      phase: "OUTPUT",
      message: "late output",
    }),
    /No event ProcessOutput is allowed after terminal state CANCELLED/,
  );
  assert.throws(
    () => runtime.submitReport({
      projectId: "VEEDDA",
      missionId: "NOVA-STATE-AUTHORITY",
      reportId: "REPORT-LATE-CANCELLED",
      agentId: agent.agentId,
      reportType: "RUNTIME_DELIVERY",
      deliverables: ["late"],
      filesChanged: [],
      checks: ["none"],
      blockers: [],
      errors: [],
      scopeConfirmed: true,
      submittedAt: "2026-07-25T00:00:00.000Z",
    }),
    /must be RUNNING, received CANCELLED/,
  );

  const rejectedRuntime = new OrchestratorRuntimeService([agent]);
  rejectedRuntime.createMission(mission({ missionId: "NOVA-STATE-REJECTED" }));
  rejectedRuntime.acceptMission("VEEDDA", "NOVA-STATE-REJECTED");
  rejectedRuntime.assignMission("VEEDDA", "NOVA-STATE-REJECTED");
  rejectedRuntime.acquireLock("VEEDDA", "NOVA-STATE-REJECTED");
  await rejectedRuntime.executeMission("VEEDDA", "NOVA-STATE-REJECTED", async () => ({
    projectId: "VEEDDA",
    missionId: "NOVA-STATE-REJECTED",
    reportId: "REPORT-BEFORE-REJECTION",
    agentId: agent.agentId,
    reportType: "RUNTIME_DELIVERY",
    deliverables: ["proof"],
    filesChanged: [],
    checks: ["test"],
    blockers: [],
    errors: [],
    scopeConfirmed: true,
  }));
  rejectedRuntime.startTechnicalValidation("VEEDDA", "NOVA-STATE-REJECTED");
  rejectedRuntime.acceptTechnicalValidation("VEEDDA", "NOVA-STATE-REJECTED", "HUMAN_VALIDATION");
  rejectedRuntime.rejectMission("VEEDDA", "NOVA-STATE-REJECTED");
  assert.throws(
    () => rejectedRuntime.submitReport({
      projectId: "VEEDDA",
      missionId: "NOVA-STATE-REJECTED",
      reportId: "REPORT-LATE-REJECTED",
      agentId: agent.agentId,
      reportType: "RUNTIME_DELIVERY",
      deliverables: ["late"],
      filesChanged: [],
      checks: ["none"],
      blockers: [],
      errors: [],
      scopeConfirmed: true,
      submittedAt: "2026-07-25T00:00:00.000Z",
    }),
    /must be RUNNING, received REJECTED/,
  );
});

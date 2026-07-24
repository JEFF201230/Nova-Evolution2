import type {
  AuditEntry,
  MissionDefinition,
  MissionEventName,
  MissionReport,
  MissionState,
  RuntimeAgent,
  RuntimeContext,
  RuntimeError,
  RuntimeEvent,
  RuntimeExecutionHandler,
  RuntimeExecutionResult,
  RuntimeLock,
  RuntimeMission,
  RuntimeQueueItem,
  RuntimeQueueSnapshot,
  RuntimeSnapshot,
} from "./orchestrator-runtime.types.js";

const TERMINAL_STATES = new Set<MissionState>(["ACCEPTED", "REJECTED", "CANCELLED"]);

const TRANSITIONS: Partial<Record<MissionEventName, Partial<Record<MissionState, MissionState>>>> = {
  MissionAccepted: { DRAFT: "READY" },
  MissionCancelled: {
    DRAFT: "CANCELLED",
    READY: "CANCELLED",
    ASSIGNED: "CANCELLED",
    LOCKED: "CANCELLED",
    RUNNING: "CANCELLED",
    WAITING_INPUT: "CANCELLED",
    WAITING_DEPENDENCY: "CANCELLED",
    ESCALATED: "CANCELLED",
    NEEDS_REVISION: "CANCELLED",
    FAILED: "CANCELLED",
  },
  AgentAssigned: { READY: "ASSIGNED" },
  LockGranted: { ASSIGNED: "LOCKED" },
  LockConflictDetected: { LOCKED: "ESCALATED" },
  AgentStarted: { LOCKED: "RUNNING" },
  InputRequired: {
    ASSIGNED: "WAITING_INPUT",
    RUNNING: "WAITING_INPUT",
    TECHNICAL_VALIDATION: "WAITING_INPUT",
    DOCUMENTARY_VALIDATION: "WAITING_INPUT",
    HUMAN_VALIDATION: "WAITING_INPUT",
  },
  InputProvided: { WAITING_INPUT: "RUNNING" },
  DependencyRequired: {
    ASSIGNED: "WAITING_DEPENDENCY",
    LOCKED: "WAITING_DEPENDENCY",
    RUNNING: "WAITING_DEPENDENCY",
    TECHNICAL_VALIDATION: "WAITING_DEPENDENCY",
    DOCUMENTARY_VALIDATION: "WAITING_DEPENDENCY",
    HUMAN_VALIDATION: "WAITING_DEPENDENCY",
  },
  DependencyAvailable: { WAITING_DEPENDENCY: "RUNNING" },
  DependencyUnavailable: { WAITING_DEPENDENCY: "FAILED" },
  EscalationRequested: {
    ASSIGNED: "ESCALATED",
    LOCKED: "ESCALATED",
    RUNNING: "ESCALATED",
    WAITING_INPUT: "ESCALATED",
    WAITING_DEPENDENCY: "ESCALATED",
    TECHNICAL_VALIDATION: "ESCALATED",
    DOCUMENTARY_VALIDATION: "ESCALATED",
    HUMAN_VALIDATION: "ESCALATED",
    NEEDS_REVISION: "ESCALATED",
  },
  EscalationResolved: { ESCALATED: "RUNNING" },
  EscalationFailed: { ESCALATED: "FAILED" },
  ExecutionFailed: { RUNNING: "FAILED" },
  BlockingUnresolved: { WAITING_INPUT: "FAILED" },
  ReportSubmitted: { RUNNING: "SUBMITTED" },
  TechnicalValidationStarted: { SUBMITTED: "TECHNICAL_VALIDATION" },
  TechnicalValidationAccepted: {
    TECHNICAL_VALIDATION: "DOCUMENTARY_VALIDATION",
  },
  TechnicalValidationRejectedRecoverable: { TECHNICAL_VALIDATION: "NEEDS_REVISION" },
  TechnicalValidationRejectedFinal: { TECHNICAL_VALIDATION: "REJECTED" },
  DocumentaryValidationStarted: { SUBMITTED: "DOCUMENTARY_VALIDATION" },
  DocumentaryValidationAccepted: { DOCUMENTARY_VALIDATION: "HUMAN_VALIDATION" },
  DocumentaryValidationRejectedRecoverable: { DOCUMENTARY_VALIDATION: "NEEDS_REVISION" },
  DocumentaryValidationRejectedFinal: { DOCUMENTARY_VALIDATION: "REJECTED" },
  HumanValidationStarted: {
    SUBMITTED: "HUMAN_VALIDATION",
    TECHNICAL_VALIDATION: "HUMAN_VALIDATION",
    DOCUMENTARY_VALIDATION: "HUMAN_VALIDATION",
  },
  FinalValidationAccepted: { HUMAN_VALIDATION: "ACCEPTED" },
  FinalValidationRejected: { HUMAN_VALIDATION: "REJECTED" },
  ValidationRejected: {
    SUBMITTED: "REJECTED",
    ESCALATED: "REJECTED",
  },
  RevisionRequested: {
    SUBMITTED: "NEEDS_REVISION",
    HUMAN_VALIDATION: "NEEDS_REVISION",
  },
  RevisionStarted: { NEEDS_REVISION: "RUNNING" },
  RevisionRejected: { NEEDS_REVISION: "REJECTED" },
  MissionRequalified: {
    FAILED: "READY",
    ESCALATED: "READY",
  },
};

interface PublishInput {
  eventName: MissionEventName;
  projectId: string;
  missionId: string;
  sourceState: MissionState | null;
  targetState?: MissionState | null;
  producer: string;
  correlationId: string;
  runId?: string;
  causationId?: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface RuntimeStores {
  missions: Map<string, RuntimeMission>;
  events: RuntimeEvent[];
  audits: AuditEntry[];
  locks: Map<string, RuntimeLock>;
  contexts: Map<string, RuntimeContext>;
  reports: Map<string, MissionReport>;
  queues: Map<string, RuntimeQueueItem[]>;
  agents: Map<string, RuntimeAgent>;
}

export class RuntimeFailure extends Error {
  constructor(readonly runtimeError: RuntimeError) {
    super(runtimeError.message);
  }
}

export class OrchestratorEventBus {
  constructor(private readonly stores: RuntimeStores) {}

  publish(input: PublishInput): RuntimeEvent {
    const missionKey = key(input.projectId, input.missionId);
    const sequence = this.nextSequence(input.projectId, input.missionId);
    const now = new Date().toISOString();
    const event: RuntimeEvent = {
      eventId: `EVT-${input.projectId}-${input.missionId}-${sequence}`,
      eventName: input.eventName,
      projectId: input.projectId,
      missionId: input.missionId,
      runId: input.runId,
      correlationId: input.correlationId,
      causationId: input.causationId,
      sequence,
      sourceState: input.sourceState,
      targetState: input.targetState ?? null,
      producer: input.producer,
      occurredAt: now,
      publishedAt: now,
      payload: input.payload ?? {},
      metadata: input.metadata ?? {},
    };

    const validationError = this.validate(event);
    if (validationError) {
      this.audit(event, "rejected", validationError.message);
      throw new RuntimeFailure(validationError);
    }

    this.stores.events.push(event);
    const mission = this.stores.missions.get(missionKey);
    if (mission && event.targetState) {
      mission.state = event.targetState;
      mission.updatedAt = now;
    }
    this.audit(event, "accepted", "Canonical event accepted.");
    return event;
  }

  replay(projectId: string, missionId: string): MissionState | null {
    let state: MissionState | null = null;
    for (const event of this.eventsFor(projectId, missionId)) {
      if (event.targetState) {
        state = event.targetState;
      }
    }
    this.stores.audits.push({
      auditId: `AUD-${this.stores.audits.length + 1}`,
      projectId,
      missionId,
      correlationId: `REPLAY-${projectId}-${missionId}`,
      action: "Replay",
      result: "replayed",
      cause: "Mission state reconstructed from accepted events.",
      actor: "Replay Engine",
      createdAt: new Date().toISOString(),
    });
    return state;
  }

  eventsFor(projectId: string, missionId: string): RuntimeEvent[] {
    return this.stores.events
      .filter((event) => event.projectId === projectId && event.missionId === missionId)
      .sort((left, right) => left.sequence - right.sequence);
  }

  private validate(event: RuntimeEvent): RuntimeError | null {
    if (!event.correlationId) {
      return { code: "ORCH-ERR-005", message: "Event correlation_id is required." };
    }

    if (event.eventName === "MissionCreated") {
      return event.sourceState === null && event.targetState === "DRAFT"
        ? null
        : { code: "ORCH-ERR-004", message: "MissionCreated must create DRAFT from no state." };
    }

    if (event.eventName === "LockRenewed" || event.eventName === "LockReleased" || event.eventName === "LockExpired") {
      return null;
    }

    if (!event.sourceState || !event.targetState) {
      return { code: "ORCH-ERR-004", message: "Transition event requires source and target states." };
    }

    const expectedTarget = TRANSITIONS[event.eventName]?.[event.sourceState];
    if (!expectedTarget) {
      return {
        code: "ORCH-ERR-004",
        message: `Transition ${event.eventName} from ${event.sourceState} is not allowed.`,
      };
    }

    if (
      event.eventName === "TechnicalValidationAccepted" &&
      event.sourceState === "TECHNICAL_VALIDATION" &&
      (event.targetState === "DOCUMENTARY_VALIDATION" || event.targetState === "HUMAN_VALIDATION")
    ) {
      return null;
    }

    if (expectedTarget !== event.targetState) {
      return {
        code: "ORCH-ERR-004",
        message: `Transition ${event.eventName} must target ${expectedTarget}, received ${event.targetState}.`,
      };
    }

    return null;
  }

  private nextSequence(projectId: string, missionId: string): number {
    return this.eventsFor(projectId, missionId).length + 1;
  }

  private audit(event: RuntimeEvent, result: AuditEntry["result"], cause: string): void {
    this.stores.audits.push({
      auditId: `AUD-${this.stores.audits.length + 1}`,
      eventId: event.eventId,
      projectId: event.projectId,
      missionId: event.missionId,
      correlationId: event.correlationId,
      sequence: event.sequence,
      action: event.eventName,
      result,
      cause,
      actor: event.producer,
      createdAt: new Date().toISOString(),
    });
  }
}

export class OrchestratorQueue {
  constructor(private readonly stores: RuntimeStores) {}

  enqueue(mission: RuntimeMission): RuntimeQueueItem {
    if (mission.state !== "READY") {
      throw new RuntimeFailure({
        code: "ORCH-ERR-003",
        message: "Only READY missions can enter the runtime queue.",
      });
    }

    const queue = this.stores.queues.get(mission.projectId) ?? [];
    const existing = queue.find((item) => item.missionId === mission.missionId);
    if (existing) {
      return existing;
    }

    const item: RuntimeQueueItem = {
      projectId: mission.projectId,
      missionId: mission.missionId,
      priority: mission.priority ?? 100,
      enqueuedAt: new Date().toISOString(),
    };
    queue.push(item);
    queue.sort((left, right) => left.priority - right.priority || left.enqueuedAt.localeCompare(right.enqueuedAt));
    this.stores.queues.set(mission.projectId, queue);
    return item;
  }

  dequeue(projectId: string): RuntimeQueueItem | null {
    const queue = this.stores.queues.get(projectId) ?? [];
    const item = queue.shift() ?? null;
    this.stores.queues.set(projectId, queue);
    return item;
  }

  remove(projectId: string, missionId: string): void {
    const queue = this.stores.queues.get(projectId) ?? [];
    this.stores.queues.set(
      projectId,
      queue.filter((item) => item.missionId !== missionId),
    );
  }

  snapshot(projectId: string): RuntimeQueueSnapshot {
    return {
      projectId,
      items: [...(this.stores.queues.get(projectId) ?? [])],
    };
  }
}

export class OrchestratorRuntimeService {
  readonly eventBus: OrchestratorEventBus;
  readonly queue: OrchestratorQueue;

  private readonly stores: RuntimeStores;

  constructor(agents: RuntimeAgent[] = [], snapshot?: RuntimeSnapshot) {
    this.stores = snapshot ? storesFromSnapshot(snapshot) : emptyStores();
    for (const agent of agents) {
      this.stores.agents.set(agent.agentId, agent);
    }
    this.eventBus = new OrchestratorEventBus(this.stores);
    this.queue = new OrchestratorQueue(this.stores);
  }

  registerAgent(agent: RuntimeAgent): void {
    this.stores.agents.set(agent.agentId, agent);
  }

  createMission(definition: MissionDefinition): RuntimeMission {
    this.assertMissionDefinition(definition);
    const missionKey = key(definition.projectId, definition.missionId);
    if (this.stores.missions.has(missionKey)) {
      throw new RuntimeFailure({ code: "ORCH-ERR-002", message: "Mission already exists." });
    }

    const now = new Date().toISOString();
    const mission: RuntimeMission = {
      ...definition,
      priority: definition.priority ?? 100,
      createdAt: definition.createdAt ?? now,
      state: "DRAFT",
      assignedAgentId: null,
      lockId: null,
      runId: null,
      contextId: null,
      reportId: null,
      updatedAt: now,
    };
    this.stores.missions.set(missionKey, mission);
    this.eventBus.publish({
      eventName: "MissionCreated",
      projectId: mission.projectId,
      missionId: mission.missionId,
      sourceState: null,
      targetState: "DRAFT",
      producer: "Mission Intake",
      correlationId: this.correlationId(mission),
      payload: { missionType: mission.missionType, objective: mission.objective },
    });
    return mission;
  }

  acceptMission(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.assertState(mission, "DRAFT");
    this.transition(mission, "MissionAccepted", "Mission Intake");
    this.queue.enqueue(mission);
    return mission;
  }

  assignMission(projectId: string, missionId: string, agentId?: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.assertState(mission, "READY");
    const agent = this.selectAgent(mission, agentId ?? mission.requestedAgentId);
    mission.assignedAgentId = agent.agentId;
    this.queue.remove(projectId, missionId);
    this.transition(mission, "AgentAssigned", "Agent Registry", { agentId: agent.agentId });
    return mission;
  }

  acquireLock(projectId: string, missionId: string, scope?: string[]): RuntimeLock {
    const mission = this.requireMission(projectId, missionId);
    this.assertState(mission, "ASSIGNED");
    if (!mission.assignedAgentId) {
      throw new RuntimeFailure({ code: "ORCH-ERR-006", message: "Mission has no assigned agent." });
    }

    const lockScope = scope?.length ? scope : mission.scope.allowed;
    const conflict = [...this.stores.locks.values()].find(
      (lock) =>
        lock.projectId === projectId &&
        lock.status === "ACTIVE" &&
        lock.scope.some((entry) => lockScope.includes(entry)),
    );
    if (conflict) {
      throw new RuntimeFailure({ code: "ORCH-ERR-013", message: "Active lock conflicts with requested scope." });
    }

    const now = new Date().toISOString();
    const lock: RuntimeLock = {
      lockId: `LOCK-${projectId}-${missionId}`,
      projectId,
      missionId,
      agentId: mission.assignedAgentId,
      scope: lockScope,
      status: "ACTIVE",
      releaseCondition: "Release when mission reaches ACCEPTED, REJECTED or CANCELLED.",
      grantedAt: now,
      updatedAt: now,
    };
    this.stores.locks.set(lock.lockId, lock);
    mission.lockId = lock.lockId;
    this.transition(mission, "LockGranted", "Lock Manager", { lockId: lock.lockId, scope: lock.scope });
    return lock;
  }

  buildContext(projectId: string, missionId: string): RuntimeContext {
    const mission = this.requireMission(projectId, missionId);
    const lock = mission.lockId ? this.stores.locks.get(mission.lockId) : undefined;
    const context: RuntimeContext = {
      projectId,
      missionId,
      contextId: `CTX-${projectId}-${missionId}`,
      objective: mission.objective,
      scope: mission.scope,
      deliverables: mission.deliverables,
      stopCriteria: mission.stopCriteria,
      authorizedReferences: mission.authorizedReferences,
      state: mission.state,
      lockScope: lock?.scope,
    };
    mission.contextId = context.contextId;
    this.stores.contexts.set(context.contextId, context);
    return context;
  }

  startMission(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.assertState(mission, "LOCKED");
    if (!mission.lockId || this.stores.locks.get(mission.lockId)?.status !== "ACTIVE") {
      throw new RuntimeFailure({ code: "ORCH-ERR-012", message: "Mission requires an active lock before execution." });
    }
    mission.runId = `RUN-${projectId}-${missionId}-${Date.now()}`;
    this.buildContext(projectId, missionId);
    this.transition(mission, "AgentStarted", "Agent Executor", { contextId: mission.contextId }, mission.runId);
    return mission;
  }

  async executeMission(
    projectId: string,
    missionId: string,
    handler: RuntimeExecutionHandler,
  ): Promise<RuntimeExecutionResult> {
    const mission = this.startMission(projectId, missionId);
    const context = this.stores.contexts.get(mission.contextId ?? "");
    if (!context) {
      throw new RuntimeFailure({ code: "ORCH-ERR-008", message: "Runtime context was not created." });
    }

    try {
      const report = await handler(context, mission);
      const submittedReport = this.submitReport({
        ...report,
        submittedAt: new Date().toISOString(),
      });
      return {
        mission,
        report: submittedReport,
        events: this.eventBus.eventsFor(projectId, missionId),
      };
    } catch (error) {
      this.transition(mission, "ExecutionFailed", "Agent Executor", {
        message: error instanceof Error ? error.message : "Execution failed.",
      });
      throw error;
    }
  }

  submitReport(report: MissionReport): MissionReport {
    const mission = this.requireMission(report.projectId, report.missionId);
    this.assertState(mission, "RUNNING");
    if (!report.scopeConfirmed || report.deliverables.length === 0) {
      throw new RuntimeFailure({ code: "ORCH-ERR-018", message: "Report must confirm scope and deliverables." });
    }

    this.stores.reports.set(key(report.projectId, report.reportId), report);
    mission.reportId = report.reportId;
    this.transition(mission, "ReportSubmitted", "Agent Executor", { reportId: report.reportId }, mission.runId ?? undefined);
    return report;
  }

  startTechnicalValidation(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.transition(mission, "TechnicalValidationStarted", "Validator");
    return mission;
  }

  acceptTechnicalValidation(projectId: string, missionId: string, target: "DOCUMENTARY_VALIDATION" | "HUMAN_VALIDATION"): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.transition(mission, "TechnicalValidationAccepted", "Validator", {}, undefined, target);
    return mission;
  }

  startDocumentaryValidation(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.transition(mission, "DocumentaryValidationStarted", "Validator");
    return mission;
  }

  acceptDocumentaryValidation(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.transition(mission, "DocumentaryValidationAccepted", "Validator");
    return mission;
  }

  startHumanValidation(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.transition(mission, "HumanValidationStarted", "Authority");
    return mission;
  }

  approveMission(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.transition(mission, "FinalValidationAccepted", "Authority");
    this.releaseLockIfTerminal(mission);
    return mission;
  }

  rejectMission(projectId: string, missionId: string): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.transition(mission, "FinalValidationRejected", "Authority");
    this.releaseLockIfTerminal(mission);
    return mission;
  }

  scheduleNext(projectId: string): RuntimeMission | null {
    const item = this.queue.dequeue(projectId);
    if (!item) {
      return null;
    }
    return this.assignMission(item.projectId, item.missionId);
  }

  getMission(projectId: string, missionId: string): RuntimeMission | null {
    return this.stores.missions.get(key(projectId, missionId)) ?? null;
  }

  listMissions(projectId?: string): RuntimeMission[] {
    return [...this.stores.missions.values()]
      .filter((mission) => !projectId || mission.projectId === projectId)
      .sort(
        (left, right) =>
          (left.createdAt ?? "").localeCompare(right.createdAt ?? "") ||
          left.missionId.localeCompare(right.missionId),
      );
  }

  getReport(projectId: string, missionId: string): MissionReport | null {
    const mission = this.getMission(projectId, missionId);
    if (!mission?.reportId) {
      return null;
    }
    return this.stores.reports.get(key(projectId, mission.reportId)) ?? null;
  }

  getEvents(projectId: string, missionId: string): RuntimeEvent[] {
    return this.eventBus.eventsFor(projectId, missionId);
  }

  getAudits(): AuditEntry[] {
    return [...this.stores.audits];
  }

  getQueue(projectId: string): RuntimeQueueSnapshot {
    return this.queue.snapshot(projectId);
  }

  exportSnapshot(): RuntimeSnapshot {
    return structuredClone({
      version: 1,
      missions: [...this.stores.missions.values()],
      events: this.stores.events,
      audits: this.stores.audits,
      locks: [...this.stores.locks.values()],
      contexts: [...this.stores.contexts.values()],
      reports: [...this.stores.reports.values()],
      queues: [...this.stores.queues.entries()].map(([projectId, items]) => ({ projectId, items })),
      agents: [...this.stores.agents.values()],
    });
  }

  private transition(
    mission: RuntimeMission,
    eventName: MissionEventName,
    producer: string,
    payload: Record<string, unknown> = {},
    runId?: string,
    targetOverride?: MissionState,
  ): RuntimeEvent {
    const targetState = targetOverride ?? TRANSITIONS[eventName]?.[mission.state] ?? null;
    return this.eventBus.publish({
      eventName,
      projectId: mission.projectId,
      missionId: mission.missionId,
      sourceState: mission.state,
      targetState,
      producer,
      correlationId: this.correlationId(mission),
      runId,
      payload,
    });
  }

  private releaseLockIfTerminal(mission: RuntimeMission): void {
    if (!mission.lockId || !TERMINAL_STATES.has(mission.state)) {
      return;
    }

    const lock = this.stores.locks.get(mission.lockId);
    if (!lock || lock.status !== "ACTIVE") {
      return;
    }

    lock.status = "RELEASED";
    lock.updatedAt = new Date().toISOString();
    this.eventBus.publish({
      eventName: "LockReleased",
      projectId: mission.projectId,
      missionId: mission.missionId,
      sourceState: mission.state,
      targetState: mission.state,
      producer: "Lock Manager",
      correlationId: this.correlationId(mission),
      payload: { lockId: lock.lockId },
    });
  }

  private selectAgent(mission: RuntimeMission, requestedAgentId?: string): RuntimeAgent {
    if (requestedAgentId) {
      const requested = this.stores.agents.get(requestedAgentId);
      if (!requested) {
        throw new RuntimeFailure({ code: "ORCH-ERR-006", message: "Requested agent is unknown." });
      }
      if (!this.agentSupportsMission(requested, mission)) {
        throw new RuntimeFailure({ code: "ORCH-ERR-006", message: "Requested agent does not cover mission scope." });
      }
      return requested;
    }

    const agent = [...this.stores.agents.values()].find((candidate) => this.agentSupportsMission(candidate, mission));
    if (!agent) {
      throw new RuntimeFailure({ code: "ORCH-ERR-006", message: "No compatible agent found for mission." });
    }
    return agent;
  }

  private agentSupportsMission(agent: RuntimeAgent, mission: RuntimeMission): boolean {
    const typeSupported = agent.missionTypes.includes(mission.missionType) || agent.missionTypes.includes("*");
    const scopeSupported =
      agent.authorizedScopes.includes("*") ||
      mission.scope.allowed.every((scopeEntry) => agent.authorizedScopes.includes(scopeEntry));
    return typeSupported && scopeSupported;
  }

  private assertMissionDefinition(definition: MissionDefinition): void {
    if (!definition.projectId || !definition.missionId || !definition.missionType || !definition.objective) {
      throw new RuntimeFailure({ code: "ORCH-ERR-008", message: "Mission identity, type and objective are required." });
    }
    if (!definition.authority) {
      throw new RuntimeFailure({ code: "ORCH-ERR-015", message: "Mission authority is required." });
    }
    if (!definition.scope?.allowed?.length) {
      throw new RuntimeFailure({ code: "ORCH-ERR-008", message: "Mission allowed scope is required." });
    }
    if (!definition.deliverables?.length || !definition.stopCriteria?.length) {
      throw new RuntimeFailure({ code: "ORCH-ERR-009", message: "Mission deliverables and stop criteria are required." });
    }
  }

  private requireMission(projectId: string, missionId: string): RuntimeMission {
    const mission = this.stores.missions.get(key(projectId, missionId));
    if (!mission) {
      throw new RuntimeFailure({ code: "ORCH-ERR-003", message: "Mission does not exist." });
    }
    return mission;
  }

  private assertState(mission: RuntimeMission, expectedState: MissionState): void {
    if (mission.state !== expectedState) {
      throw new RuntimeFailure({
        code: "ORCH-ERR-003",
        message: `Mission must be ${expectedState}, received ${mission.state}.`,
      });
    }
  }

  private correlationId(mission: RuntimeMission): string {
    return `CORR-${mission.projectId}-${mission.missionId}`;
  }
}

function key(projectId: string, id: string): string {
  return `${projectId}:${id}`;
}

function emptyStores(): RuntimeStores {
  return {
    missions: new Map(),
    events: [],
    audits: [],
    locks: new Map(),
    contexts: new Map(),
    reports: new Map(),
    queues: new Map(),
    agents: new Map(),
  };
}

function storesFromSnapshot(snapshot: RuntimeSnapshot): RuntimeStores {
  if (snapshot.version !== 1) {
    throw new Error(`Unsupported runtime snapshot version: ${String(snapshot.version)}`);
  }

  const data = structuredClone(snapshot);
  return {
    missions: new Map(data.missions.map((mission) => [key(mission.projectId, mission.missionId), mission])),
    events: data.events,
    audits: data.audits,
    locks: new Map(data.locks.map((lock) => [lock.lockId, lock])),
    contexts: new Map(data.contexts.map((context) => [context.contextId, context])),
    reports: new Map(data.reports.map((report) => [key(report.projectId, report.reportId), report])),
    queues: new Map(data.queues.map((queue) => [queue.projectId, queue.items])),
    agents: new Map(data.agents.map((agent) => [agent.agentId, agent])),
  };
}

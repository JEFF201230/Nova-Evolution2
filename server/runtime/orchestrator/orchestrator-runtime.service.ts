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
  RuntimeDiagnostic,
  RuntimeLock,
  RuntimeMission,
  RuntimeMissionCertificate,
  RuntimeObservabilityEvent,
  RuntimeRecoveryAction,
  RuntimeRecoveryEvidence,
  RuntimeRecoveryResult,
  RuntimeRunRecord,
  RuntimeQueueItem,
  RuntimeQueueSnapshot,
  RuntimeSnapshot,
} from "./orchestrator-runtime.types.js";
import { scopesOverlap } from "../../nova-core/scope-validation.js";
import { isCanonicalTransitionAllowed } from "./canonical-state.js";
import {
  classifyRunRecovery,
  sealRuntimeEvent,
  verifyRuntimeEventJournal,
} from "../journal/append-only-journal.js";

const TERMINAL_STATES = new Set<MissionState>(["ACCEPTED", "REJECTED", "CANCELLED", "TIMEOUT", "CERTIFIED"]);
const IMMUTABLE_TERMINAL_STATES = new Set<MissionState>(["REJECTED", "CANCELLED", "CERTIFIED"]);
const TERMINAL_AUDIT_EVENTS = new Set<MissionEventName>([
  "LockReleased",
  "RunReconciled",
  "RunAbandoned",
  "RunQuarantined",
]);

// Event-specific detailed projections; canonical-state.ts is the authoritative transition gate.
const EVENT_STATE_PROJECTIONS: Partial<Record<MissionEventName, Partial<Record<MissionState, MissionState>>>> = {
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
    TIMEOUT: "CANCELLED",
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
  ExecutionTimedOut: { RUNNING: "TIMEOUT" },
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
  MissionCertified: { ACCEPTED: "CERTIFIED" },
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
    TIMEOUT: "READY",
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
  observabilityEvents: RuntimeObservabilityEvent[];
  runs: Map<string, RuntimeRunRecord>;
}

export type RuntimeObservabilityListener = (event: RuntimeObservabilityEvent) => void;

export class RuntimeFailure extends Error {
  constructor(readonly runtimeError: RuntimeError) {
    super(runtimeError.message);
  }
}

export class OrchestratorEventBus {
  constructor(
    private readonly stores: RuntimeStores,
    private readonly observabilityListeners: Set<RuntimeObservabilityListener>,
  ) {}

  publish(input: PublishInput): RuntimeEvent {
    const missionKey = key(input.projectId, input.missionId);
    const sequence = this.nextSequence(input.projectId, input.missionId);
    const now = new Date().toISOString();
    const previousHash = this.eventsFor(input.projectId, input.missionId).at(-1)?.eventHash ?? null;
    const event = sealRuntimeEvent({
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
    }, previousHash);

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
    this.publishObservability(event, mission);
    return event;
  }

  replay(projectId: string, missionId: string): MissionState | null {
    const integrity = verifyRuntimeEventJournal(this.stores.events);
    if (!integrity.valid) {
      throw new RuntimeFailure({
        code: "ORCH-ERR-017",
        message: `Journal integrity failure: ${integrity.firstError?.code ?? "UNKNOWN"}.`,
      });
    }
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

    if (
      event.sourceState &&
      IMMUTABLE_TERMINAL_STATES.has(event.sourceState) &&
      !TERMINAL_AUDIT_EVENTS.has(event.eventName)
    ) {
      return {
        code: "ORCH-ERR-004",
        message: `No event ${event.eventName} is allowed after terminal state ${event.sourceState}.`,
      };
    }

    if (
      event.eventName === "LockRenewed" ||
      event.eventName === "LockReleased" ||
      event.eventName === "LockExpired" ||
      event.eventName === "RunReconciled" ||
      event.eventName === "RunAbandoned" ||
      event.eventName === "RunQuarantined" ||
      event.eventName === "RunRecoveryAuthorized" ||
      event.eventName === "ProcessOutput"
    ) {
      return null;
    }

    if (!event.sourceState || !event.targetState) {
      return { code: "ORCH-ERR-004", message: "Transition event requires source and target states." };
    }

    const expectedTarget = EVENT_STATE_PROJECTIONS[event.eventName]?.[event.sourceState];
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

    if (!isCanonicalTransitionAllowed(event.sourceState, event.targetState)) {
      return {
        code: "ORCH-ERR-004",
        message: `Canonical transition ${event.sourceState} -> ${event.targetState} is not allowed.`,
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

  private publishObservability(event: RuntimeEvent, mission: RuntimeMission | undefined): void {
    const phases = observabilityPhases(event.eventName);
    if (phases.length === 0) return;
    const runId = event.runId ?? mission?.runId ?? null;
    const run = runId ? this.stores.runs.get(runId) : undefined;
    const startedAt = run?.startedAt ? Date.parse(run.startedAt) : NaN;
    const durationMs = Number.isFinite(startedAt) ? Math.max(0, Date.now() - startedAt) : 0;
    const diagnostics = readDiagnostics(event.payload.diagnostics);
    const baseSequence = this.stores.observabilityEvents.length;

    phases.forEach((phase, index) => {
      const timestamp = new Date().toISOString();
      const observabilityEvent: RuntimeObservabilityEvent = {
        observabilityEventId: `${event.eventId}-${phase}-${baseSequence + index + 1}`,
        runtimeEventId: event.eventId,
        sequence: baseSequence + index + 1,
        timestamp,
        projectId: event.projectId,
        missionId: event.missionId,
        runId,
        correlationId: event.correlationId,
        phase,
        progression: observabilityProgression(phase),
        durationMs,
        message: observabilityMessage(phase, event.payload),
        level: phase === "FAILED" ? "ERROR" : phase === "VALIDATING" ? "WARN" : "INFO",
        ...(diagnostics.length > 0 ? { diagnostics } : {}),
      };
      this.stores.observabilityEvents.push(observabilityEvent);
      if (run) {
        run.lastPhase = phase;
        run.updatedAt = timestamp;
        if (phase === "FAILED") {
          run.status = "FAILED";
          run.finishedAt = timestamp;
          if (diagnostics.length > 0) run.diagnostics = diagnostics;
        }
      }
      for (const listener of this.observabilityListeners) {
        try {
          listener(structuredClone(observabilityEvent));
        } catch {
          // Observability subscribers must never alter runtime behavior.
        }
      }
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
  private readonly observabilityListeners = new Set<RuntimeObservabilityListener>();

  constructor(agents: RuntimeAgent[] = [], snapshot?: RuntimeSnapshot) {
    this.stores = snapshot ? storesFromSnapshot(snapshot) : emptyStores();
    for (const agent of agents) {
      this.stores.agents.set(agent.agentId, agent);
    }
    this.eventBus = new OrchestratorEventBus(this.stores, this.observabilityListeners);
    this.queue = new OrchestratorQueue(this.stores);
    this.assertProjectionMatchesJournal();
  }

  registerAgent(agent: RuntimeAgent): void {
    this.stores.agents.set(agent.agentId, agent);
  }

  subscribeObservability(listener: RuntimeObservabilityListener): () => void {
    this.observabilityListeners.add(listener);
    return () => this.observabilityListeners.delete(listener);
  }

  publishExecutionOutput(
    projectId: string,
    missionId: string,
    diagnostic: RuntimeDiagnostic,
  ): RuntimeEvent {
    const mission = this.requireMission(projectId, missionId);
    return this.eventBus.publish({
      eventName: "ProcessOutput",
      projectId,
      missionId,
      sourceState: mission.state,
      targetState: mission.state,
      producer: "Execution Engine",
      correlationId: this.correlationId(mission),
      runId: mission.runId ?? undefined,
      payload: { message: diagnostic.message ?? "Process output", diagnostics: [diagnostic] },
    });
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
        lock.scope.some((entry) => lockScope.some((candidate) => scopesOverlap(entry, candidate))),
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
      releaseCondition: "Release when mission reaches ACCEPTED, REJECTED, CANCELLED, TIMEOUT or FAILED.",
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
    const now = new Date().toISOString();
    this.stores.runs.set(mission.runId, {
      runId: mission.runId,
      projectId,
      missionId,
      correlationId: this.correlationId(mission),
      startedAt: now,
      updatedAt: now,
      status: "RUNNING",
      lastPhase: "STARTED",
      attempt: 1 + [...this.stores.runs.values()].filter(
        (run) => run.projectId === projectId && run.missionId === missionId,
      ).length,
    });
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
      const diagnostics = diagnosticsFromError(error);
      const termination = executionTermination(error);
      this.markRunTerminated(mission, termination, diagnostics);
      const eventName: MissionEventName =
        termination === "CANCELLED" ? "MissionCancelled" :
        termination === "TIMEOUT" ? "ExecutionTimedOut" :
        "ExecutionFailed";
      this.transition(mission, eventName, "Agent Executor", {
        message: error instanceof Error ? error.message : "Execution failed.",
        termination,
        ...(diagnostics.length > 0 ? { diagnostics } : {}),
      });
      this.releaseLockIfTerminal(mission);
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
    this.markRunCompleted(mission);
    this.transition(
      mission,
      "ReportSubmitted",
      "Agent Executor",
      {
        reportId: report.reportId,
        ...(report.reportFingerprint ? { reportFingerprint: report.reportFingerprint } : {}),
        ...(report.diagnostics && report.diagnostics.length > 0 ? { diagnostics: report.diagnostics } : {}),
      },
      mission.runId ?? undefined,
    );
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

  certifyMission(
    projectId: string,
    missionId: string,
    certificate: RuntimeMissionCertificate,
  ): RuntimeMission {
    const mission = this.requireMission(projectId, missionId);
    this.assertState(mission, "HUMAN_VALIDATION");
    const report = this.getReport(projectId, missionId);
    if (!report) {
      throw new RuntimeFailure({ code: "ORCH-ERR-018", message: "Certification requires an existing report." });
    }
    report.certificate = structuredClone(certificate);
    this.transition(mission, "FinalValidationAccepted", "Certification Authority", {
      authorityId: certificate.decision.authorityId,
      decision: certificate.decision.decision,
    });
    this.transition(mission, "MissionCertified", "Certification Authority", {
      certificateId: certificate.certificateId,
      reportFingerprint: certificate.binding.reportFingerprint,
      authorityId: certificate.decision.authorityId,
    });
    this.releaseLockIfTerminal(mission);
    return mission;
  }

  recoverMission(
    projectId: string,
    missionId: string,
    runId: string,
    action: RuntimeRecoveryAction,
    evidence: RuntimeRecoveryEvidence,
  ): RuntimeRecoveryResult {
    const mission = this.requireMission(projectId, missionId);
    if (mission.runId !== runId) {
      throw new RuntimeFailure({ code: "ORCH-ERR-017", message: "Recovery runId does not match the mission current run." });
    }
    const run = this.stores.runs.get(runId);
    if (!run) {
      throw new RuntimeFailure({ code: "ORCH-ERR-017", message: "Recovery run does not exist." });
    }
    const previousState = mission.state;
    const activeLock = mission.lockId ? this.stores.locks.get(mission.lockId)?.status === "ACTIVE" : false;
    const recoveryEvidence = {
      ...evidence,
      lockPresent: activeLock,
    };
    const recovery = classifyRunRecovery({
      runId,
      status: run.status,
      ...recoveryEvidence,
    });

    if (action === "reconcile") {
      run.recoveryStatus = recovery.requiresReconciliation ? "INTERRUPTED" : "RECONCILED";
      run.recoveryClassification = recovery.classification;
      this.publishRecoveryEvent(mission, "RunReconciled", action, recovery.classification);
    } else if (action === "abandon") {
      this.assertState(mission, "RUNNING");
      this.markRunTerminated(mission, "CANCELLED", []);
      run.recoveryStatus = "ABANDONED";
      run.recoveryClassification = recovery.classification;
      this.transition(mission, "MissionCancelled", "Recovery Authority", { action, classification: recovery.classification });
      this.releaseLockIfTerminal(mission);
      this.publishRecoveryEvent(mission, "RunAbandoned", action, recovery.classification);
    } else if (action === "quarantine") {
      this.assertState(mission, "RUNNING");
      this.markRunTerminated(mission, "FAILED", []);
      run.recoveryStatus = "QUARANTINED";
      run.recoveryClassification = recovery.classification;
      this.transition(mission, "ExecutionFailed", "Recovery Authority", { action, classification: recovery.classification });
      this.releaseLockIfTerminal(mission);
      this.publishRecoveryEvent(mission, "RunQuarantined", action, recovery.classification);
    } else {
      if (
        recovery.classification === "INSPECTION_UNKNOWN" ||
        recovery.classification === "JOURNAL_INVALID" ||
        recovery.classification === "SNAPSHOT_INVALID" ||
        recovery.classification === "ARTIFACTS_INVALID" ||
        recovery.classification === "INTERRUPTED_PROCESS_ACTIVE" ||
        recovery.classification === "WORKTREE_DRIFT"
      ) {
        throw new RuntimeFailure({
          code: "ORCH-ERR-017",
          message: `Recovery is unsafe while classification is ${recovery.classification}.`,
        });
      }
      if (!["FAILED", "TIMEOUT"].includes(mission.state)) {
        throw new RuntimeFailure({ code: "ORCH-ERR-017", message: "Only FAILED or TIMEOUT missions can be recovered." });
      }
      run.recoveryStatus = action === "resume" ? "RECONCILED" : "RECOVERABLE";
      run.recoveryClassification = recovery.classification;
      this.transition(mission, "MissionRequalified", "Recovery Authority", { action, classification: recovery.classification });
      this.queue.enqueue(mission);
      this.publishRecoveryEvent(mission, "RunRecoveryAuthorized", action, recovery.classification);
    }

    return {
      action,
      runId,
      missionId,
      previousState,
      state: mission.state,
      classification: recovery.classification,
      attempt: run.attempt ?? 1,
      evidence: recoveryEvidence,
    };
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

  getObservabilityEvents(projectId: string, missionId: string): RuntimeObservabilityEvent[] {
    return structuredClone(
      this.stores.observabilityEvents.filter(
        (event) => event.projectId === projectId && event.missionId === missionId,
      ),
    );
  }

  getIncompleteRuns(projectId?: string, missionId?: string): RuntimeRunRecord[] {
    return structuredClone(
      [...this.stores.runs.values()].filter(
        (run) =>
          run.status === "RUNNING" &&
          (!projectId || run.projectId === projectId) &&
          (!missionId || run.missionId === missionId),
      ),
    );
  }

  getAudits(): AuditEntry[] {
    return [...this.stores.audits];
  }

  getQueue(projectId: string): RuntimeQueueSnapshot {
    return this.queue.snapshot(projectId);
  }

  exportSnapshot(): RuntimeSnapshot {
    this.assertProjectionMatchesJournal();
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
      observabilityEvents: this.stores.observabilityEvents,
      runs: [...this.stores.runs.values()],
    });
  }

  private assertProjectionMatchesJournal(): void {
    const integrity = verifyRuntimeEventJournal(this.stores.events);
    if (!integrity.valid) {
      throw new RuntimeFailure({
        code: "ORCH-ERR-017",
        message: `Journal integrity failure: ${integrity.firstError?.code ?? "UNKNOWN"}.`,
      });
    }
    for (const mission of this.stores.missions.values()) {
      const lastState = this.stores.events
        .filter((event) => event.projectId === mission.projectId && event.missionId === mission.missionId)
        .map((event) => event.targetState)
        .filter((state): state is MissionState => Boolean(state))
        .at(-1);
      if (lastState && lastState !== mission.state) {
        throw new RuntimeFailure({
          code: "ORCH-ERR-017",
          message: `Mission projection ${mission.state} contradicts authoritative journal state ${lastState}.`,
        });
      }
    }
  }

  private transition(
    mission: RuntimeMission,
    eventName: MissionEventName,
    producer: string,
    payload: Record<string, unknown> = {},
    runId?: string,
    targetOverride?: MissionState,
  ): RuntimeEvent {
    const targetState = targetOverride ?? EVENT_STATE_PROJECTIONS[eventName]?.[mission.state] ?? null;
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
    if (!mission.lockId || (!TERMINAL_STATES.has(mission.state) && mission.state !== "FAILED")) {
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

  private publishRecoveryEvent(
    mission: RuntimeMission,
    eventName: "RunReconciled" | "RunAbandoned" | "RunQuarantined" | "RunRecoveryAuthorized",
    action: RuntimeRecoveryAction,
    classification: string,
  ): void {
    this.eventBus.publish({
      eventName,
      projectId: mission.projectId,
      missionId: mission.missionId,
      sourceState: mission.state,
      targetState: mission.state,
      producer: "Recovery Authority",
      correlationId: this.correlationId(mission),
      runId: mission.runId ?? undefined,
      payload: { action, classification },
    });
  }

  restoreSnapshot(snapshot: RuntimeSnapshot): void {
    const restored = storesFromSnapshot(snapshot);
    this.stores.missions.clear();
    for (const [entryKey, mission] of restored.missions) this.stores.missions.set(entryKey, mission);
    this.stores.events.splice(0, this.stores.events.length, ...restored.events);
    this.stores.audits.splice(0, this.stores.audits.length, ...restored.audits);
    this.stores.locks.clear();
    for (const [entryKey, lock] of restored.locks) this.stores.locks.set(entryKey, lock);
    this.stores.contexts.clear();
    for (const [entryKey, context] of restored.contexts) this.stores.contexts.set(entryKey, context);
    this.stores.reports.clear();
    for (const [entryKey, report] of restored.reports) this.stores.reports.set(entryKey, report);
    this.stores.queues.clear();
    for (const [entryKey, queue] of restored.queues) this.stores.queues.set(entryKey, queue);
    this.stores.agents.clear();
    for (const [entryKey, agent] of restored.agents) this.stores.agents.set(entryKey, agent);
    this.stores.observabilityEvents.splice(0, this.stores.observabilityEvents.length, ...restored.observabilityEvents);
    this.stores.runs.clear();
    for (const [entryKey, run] of restored.runs) this.stores.runs.set(entryKey, run);
  }

  private markRunCompleted(mission: RuntimeMission): void {
    if (!mission.runId) return;
    const run = this.stores.runs.get(mission.runId);
    if (!run) return;
    run.status = "COMPLETED";
    run.finishedAt = new Date().toISOString();
    run.updatedAt = run.finishedAt;
  }

  private markRunTerminated(
    mission: RuntimeMission,
    status: "FAILED" | "CANCELLED" | "TIMEOUT",
    diagnostics: RuntimeDiagnostic[],
  ): void {
    if (!mission.runId) return;
    const run = this.stores.runs.get(mission.runId);
    if (!run) return;
    run.status = status;
    run.finishedAt = new Date().toISOString();
    run.updatedAt = run.finishedAt;
    if (diagnostics.length > 0) run.diagnostics = diagnostics;
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
    observabilityEvents: [],
    runs: new Map(),
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
    observabilityEvents: data.observabilityEvents ?? [],
    runs: new Map((data.runs ?? []).map((run) => [run.runId, run])),
  };
}

function observabilityPhases(eventName: MissionEventName): RuntimeObservabilityEvent["phase"][] {
  switch (eventName) {
    case "MissionCreated": return ["CREATED"];
    case "AgentAssigned": return ["ASSIGNED"];
    case "AgentStarted": return ["STARTED", "RUNNING"];
    case "TechnicalValidationStarted":
    case "DocumentaryValidationStarted":
    case "HumanValidationStarted": return ["VALIDATING"];
    case "ReportSubmitted": return ["COMPLETED"];
    case "MissionCertified": return ["COMPLETED"];
    case "ExecutionFailed": return ["FAILED"];
    case "MissionCancelled": return ["CANCELLED"];
    case "ExecutionTimedOut": return ["TIMEOUT"];
    case "RunReconciled":
    case "RunAbandoned":
    case "RunQuarantined":
    case "RunRecoveryAuthorized": return ["RECOVERY"];
    case "ProcessOutput": return ["OUTPUT"];
    default: return [];
  }
}

function observabilityProgression(phase: RuntimeObservabilityEvent["phase"]): number {
  return {
    CREATED: 0,
    ASSIGNED: 20,
    STARTED: 35,
    RUNNING: 50,
    VALIDATING: 75,
    COMPLETED: 90,
    FAILED: 100,
    CANCELLED: 100,
    TIMEOUT: 100,
    OUTPUT: 55,
    RECOVERY: 100,
  }[phase];
}

function observabilityMessage(phase: RuntimeObservabilityEvent["phase"], payload: Record<string, unknown>): string {
  if (typeof payload.message === "string" && payload.message.length > 0) return payload.message;
  if (phase === "OUTPUT") return "Sortie de processus disponible.";
  if (phase === "RECOVERY") return "Action de recovery enregistrée.";
  if (phase === "CANCELLED") return "Exécution annulée.";
  if (phase === "TIMEOUT") return "Exécution interrompue après expiration du délai.";
  return {
    CREATED: "Mission créée.",
    ASSIGNED: "Mission assignée.",
    STARTED: "Exécution démarrée.",
    RUNNING: "Exécution en cours.",
    VALIDATING: "Validation en cours.",
    COMPLETED: "Exécution terminée, rapport disponible.",
    FAILED: "Exécution échouée.",
  }[phase];
}

function executionTermination(error: unknown): "FAILED" | "CANCELLED" | "TIMEOUT" {
  if (typeof error !== "object" || error === null) return "FAILED";
  const code = (error as { code?: unknown }).code;
  if (code === "NOVA_CORE_EXECUTION_CANCELLED") return "CANCELLED";
  if (code === "NOVA_CORE_EXECUTION_TIMEOUT") return "TIMEOUT";
  return "FAILED";
}

function readDiagnostics(value: unknown): RuntimeDiagnostic[] {
  return Array.isArray(value) ? value.filter(isRuntimeDiagnostic) : [];
}

function isRuntimeDiagnostic(value: unknown): value is RuntimeDiagnostic {
  return typeof value === "object" && value !== null && typeof (value as { phase?: unknown }).phase === "string";
}

function diagnosticsFromError(error: unknown): RuntimeDiagnostic[] {
  if (error instanceof RuntimeFailure && error.runtimeError.diagnostics) return error.runtimeError.diagnostics;
  if (typeof error === "object" && error !== null) {
    const diagnostics = (error as { diagnostics?: unknown }).diagnostics;
    return readDiagnostics(diagnostics);
  }
  return [];
}

import type {
  MissionState,
} from "../runtime/orchestrator/orchestrator-runtime.js";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import {
  MissionEventPublisher,
  type MissionEvent,
  type MissionEventInput,
} from "./mission-event-publisher.js";
import {
  MissionProgress,
  type MissionProgressModel,
} from "./mission-progress.js";
import {
  MissionTimeline,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";

export interface ProgramRuntimeSession {
  readonly missionId: string;
  readonly runId: string;
  readonly source: string;
  readonly state: MissionState;
  readonly attempt: number;
  readonly maxRetries: number;
  readonly startedAttempts: readonly number[];
  readonly cancellationRequested: boolean;
  readonly timeoutObserved: boolean;
  readonly recoveryPrepared: boolean;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly resolutionStatus: MissionBrief["resolutionStatus"];
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
  readonly events: readonly MissionEvent[];
  readonly progress: MissionProgressModel;
}

export interface ProgramRuntimeInitializeInput {
  readonly missionId: string;
  readonly runId: string;
  readonly source: string;
  readonly maxRetries: number;
  readonly gateDecision: RuntimeExecutionGateDecision;
  readonly eventId: string;
  readonly occurredAt: string;
}

export interface ProgramRuntimeTransitionInput {
  readonly targetState: MissionState;
  readonly source: string;
  readonly eventId: string;
  readonly occurredAt: string;
  readonly message: string;
  readonly gateDecision?: RuntimeExecutionGateDecision;
  readonly recoveryAuthorized?: boolean;
  readonly approvalDecision?:
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED"
    | "BLOCKED";
}

export interface ProgramRuntimeRecoveryAssessment {
  readonly recoverable: boolean;
  readonly nextAttempt: number | null;
  readonly blockingReasons: readonly string[];
}

export interface ProgramRuntimeOrchestratorFeatureFlag {
  readonly enabled: boolean;
}

export class ProgramRuntimeOrchestrationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "ProgramRuntimeOrchestrationError";
  }
}

export class ProgramRuntimeOrchestrator {
  readonly enabled: boolean;
  private readonly eventPublisher: MissionEventPublisher;
  private readonly timelineBuilder: MissionTimeline;
  private readonly progressCalculator: MissionProgress;

  constructor(
    featureFlag: ProgramRuntimeOrchestratorFeatureFlag = {
      enabled: false,
    },
    components: {
      readonly eventPublisher?: MissionEventPublisher;
      readonly timelineBuilder?: MissionTimeline;
      readonly progressCalculator?: MissionProgress;
    } = {},
  ) {
    this.enabled = featureFlag.enabled === true;
    this.eventPublisher =
      components.eventPublisher ??
      new MissionEventPublisher({ enabled: true });
    this.timelineBuilder =
      components.timelineBuilder ??
      new MissionTimeline({ enabled: true });
    this.progressCalculator =
      components.progressCalculator ??
      new MissionProgress({ enabled: true });
  }

  initialize(
    input: ProgramRuntimeInitializeInput,
  ): ProgramRuntimeSession | null {
    if (!this.enabled) {
      return null;
    }

    assertInitializeInput(input);

    const event = createEventInput({
      eventId: input.eventId,
      missionId: input.missionId,
      sequence: 1,
      occurredAt: input.occurredAt,
      type: "MISSION_READY",
      message: "Mission ready for assignment.",
      source: input.source,
      runId: input.runId,
      attempt: 1,
      targetState: "READY",
      gateDecision: input.gateDecision,
      completed: 0,
    });

    return this.createSession({
      missionId: input.missionId,
      runId: input.runId,
      source: input.source,
      state: "READY",
      attempt: 1,
      maxRetries: input.maxRetries,
      startedAttempts: [],
      cancellationRequested: false,
      timeoutObserved: false,
      recoveryPrepared: false,
      gateDecision: input.gateDecision,
      previousEvents: [],
      event,
    });
  }

  transition(
    session: ProgramRuntimeSession,
    input: ProgramRuntimeTransitionInput,
  ): ProgramRuntimeSession | null {
    if (!this.enabled) {
      return null;
    }

    assertSession(session);
    assertTransitionInput(input);

    if (session.cancellationRequested && input.targetState !== "CANCELLED") {
      throw new ProgramRuntimeOrchestrationError(
        "PRO-005",
        "Cancellation takes precedence over a pending transition.",
      );
    }

    if (!isAllowedTransition(session.state, input.targetState)) {
      throw new ProgramRuntimeOrchestrationError(
        "PRO-002",
        `Transition ${session.state} -> ${input.targetState} is forbidden.`,
      );
    }

    assertHumanApprovalTransition(session.state, input);

    let attempt = session.attempt;
    let recoveryPrepared = session.recoveryPrepared;
    let gateDecision = input.gateDecision ?? decisionFromSession(session);

    if (input.targetState === "RUNNING") {
      assertExecutionGate(session, gateDecision);
      if (session.startedAttempts.includes(session.attempt)) {
        throw new ProgramRuntimeOrchestrationError(
          "PRO-003",
          `Run attempt ${session.attempt} has already started.`,
        );
      }
    }

    if (
      (session.state === "FAILED" || session.state === "TIMEOUT") &&
      input.targetState === "ASSIGNED"
    ) {
      const assessment = this.assessRecovery(session);
      if (!input.recoveryAuthorized || !assessment.recoverable) {
        throw new ProgramRuntimeOrchestrationError(
          "PRO-004",
          assessment.blockingReasons.join(",") ||
            "Recovery requires explicit authorization.",
        );
      }
      attempt = assessment.nextAttempt!;
      recoveryPrepared = true;
    }

    const cancellationRequested =
      input.targetState === "CANCELLED" ||
      session.cancellationRequested;
    const timeoutObserved =
      input.targetState === "TIMEOUT" || session.timeoutObserved;
    const completed = monotonicProgress(
      session.progress.completed ?? 0,
      progressForState(input.targetState),
    );
    const event = createEventInput({
      eventId: input.eventId,
      missionId: session.missionId,
      sequence: session.events.length + 1,
      occurredAt: input.occurredAt,
      type: `STATE:${input.targetState}`,
      message: input.message,
      source: input.source,
      runId: session.runId,
      attempt,
      targetState: input.targetState,
      gateDecision,
      completed,
      recoveryAuthorized: input.recoveryAuthorized,
      approvalDecision: input.approvalDecision,
    });

    return this.createSession({
      missionId: session.missionId,
      runId: session.runId,
      source: session.source,
      state: input.targetState,
      attempt,
      maxRetries: session.maxRetries,
      startedAttempts:
        input.targetState === "RUNNING"
          ? [...session.startedAttempts, attempt]
          : session.startedAttempts,
      cancellationRequested,
      timeoutObserved,
      recoveryPrepared,
      gateDecision,
      previousEvents: session.events,
      event,
    });
  }

  assessRecovery(
    session: ProgramRuntimeSession,
  ): ProgramRuntimeRecoveryAssessment {
    assertSession(session);

    const reasons: string[] = [];
    if (session.state !== "FAILED" && session.state !== "TIMEOUT") {
      reasons.push("STATE_NOT_RECOVERABLE");
    }
    if (session.cancellationRequested) {
      reasons.push("CANCELLATION_REQUESTED");
    }
    if (session.attempt > session.maxRetries) {
      reasons.push("RETRY_LIMIT_REACHED");
    }

    return Object.freeze({
      recoverable: reasons.length === 0,
      nextAttempt:
        reasons.length === 0 ? session.attempt + 1 : null,
      blockingReasons: Object.freeze(reasons),
    });
  }

  private createSession(input: {
    readonly missionId: string;
    readonly runId: string;
    readonly source: string;
    readonly state: MissionState;
    readonly attempt: number;
    readonly maxRetries: number;
    readonly startedAttempts: readonly number[];
    readonly cancellationRequested: boolean;
    readonly timeoutObserved: boolean;
    readonly recoveryPrepared: boolean;
    readonly gateDecision: RuntimeExecutionGateDecision;
    readonly previousEvents: readonly MissionEvent[];
    readonly event: MissionEventInput;
  }): ProgramRuntimeSession {
    const events = this.eventPublisher.publish([
      ...input.previousEvents,
      input.event,
    ]);
    if (events === null) {
      throw new ProgramRuntimeOrchestrationError(
        "PRO-006",
        "MissionEventPublisher is inactive.",
      );
    }

    const timeline = this.timelineBuilder.build({
      missionId: input.missionId,
      events,
    });
    if (timeline === null) {
      throw new ProgramRuntimeOrchestrationError(
        "PRO-006",
        "MissionTimeline is inactive.",
      );
    }

    const progress = this.progressCalculator.calculate(timeline);
    if (progress === null) {
      throw new ProgramRuntimeOrchestrationError(
        "PRO-006",
        "MissionProgress is inactive.",
      );
    }

    return Object.freeze({
      missionId: input.missionId,
      runId: input.runId,
      source: input.source,
      state: input.state,
      attempt: input.attempt,
      maxRetries: input.maxRetries,
      startedAttempts: Object.freeze([...input.startedAttempts]),
      cancellationRequested: input.cancellationRequested,
      timeoutObserved: input.timeoutObserved,
      recoveryPrepared: input.recoveryPrepared,
      authorityDecision: input.gateDecision.authorityDecision,
      validationStatus: input.gateDecision.validationStatus,
      resolutionStatus: input.gateDecision.resolutionStatus!,
      pipelineTrace: input.gateDecision.pipelineTrace!,
      missingArtifacts: input.gateDecision.missingArtifacts,
      events,
      progress,
    });
  }
}

const ALLOWED_TRANSITIONS = Object.freeze({
  READY: ["ASSIGNED", "CANCELLED", "WAITING_INPUT"],
  ASSIGNED: ["LOCKED", "CANCELLED", "WAITING_INPUT"],
  LOCKED: ["RUNNING", "CANCELLED", "FAILED", "TIMEOUT"],
  RUNNING: [
    "SUBMITTED",
    "FAILED",
    "TIMEOUT",
    "CANCELLED",
  ],
  SUBMITTED: [
    "TECHNICAL_VALIDATION",
    "FAILED",
    "CANCELLED",
  ],
  TECHNICAL_VALIDATION: [
    "DOCUMENTARY_VALIDATION",
    "FAILED",
    "NEEDS_REVISION",
    "CANCELLED",
  ],
  DOCUMENTARY_VALIDATION: [
    "HUMAN_VALIDATION",
    "FAILED",
    "NEEDS_REVISION",
    "CANCELLED",
  ],
  HUMAN_VALIDATION: [
    "ACCEPTED",
    "REJECTED",
    "NEEDS_REVISION",
    "CANCELLED",
  ],
  NEEDS_REVISION: ["ASSIGNED", "CANCELLED"],
  FAILED: ["ASSIGNED", "CANCELLED"],
  TIMEOUT: ["ASSIGNED", "CANCELLED"],
  WAITING_INPUT: ["ASSIGNED", "CANCELLED"],
  ACCEPTED: ["CERTIFIED"],
  CANCELLED: [],
  CERTIFIED: [],
  REJECTED: [],
} as const) satisfies Readonly<
  Partial<Record<MissionState, readonly MissionState[]>>
>;

function isAllowedTransition(
  source: MissionState,
  target: MissionState,
): boolean {
  const transitions: Readonly<
    Partial<Record<MissionState, readonly MissionState[]>>
  > = ALLOWED_TRANSITIONS;
  return transitions[source]?.includes(target) ?? false;
}

function progressForState(state: MissionState): number {
  const progress: Partial<Record<MissionState, number>> = {
    READY: 0,
    ASSIGNED: 10,
    LOCKED: 25,
    RUNNING: 50,
    SUBMITTED: 70,
    TECHNICAL_VALIDATION: 80,
    DOCUMENTARY_VALIDATION: 85,
    HUMAN_VALIDATION: 90,
    NEEDS_REVISION: 90,
    WAITING_INPUT: 90,
    ACCEPTED: 100,
    CERTIFIED: 100,
    REJECTED: 100,
    FAILED: 100,
    TIMEOUT: 100,
    CANCELLED: 100,
  };
  return progress[state] ?? 0;
}

function monotonicProgress(previous: number, next: number): number {
  return Math.max(previous, next);
}

function createEventInput(input: {
  readonly eventId: string;
  readonly missionId: string;
  readonly sequence: number;
  readonly occurredAt: string;
  readonly type: string;
  readonly message: string;
  readonly source: string;
  readonly runId: string;
  readonly attempt: number;
  readonly targetState: MissionState;
  readonly gateDecision: RuntimeExecutionGateDecision;
  readonly completed: number;
  readonly recoveryAuthorized?: boolean;
  readonly approvalDecision?:
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED"
    | "BLOCKED";
}): MissionEventInput {
  return {
    eventId: input.eventId,
    missionId: input.missionId,
    sequence: input.sequence,
    occurredAt: input.occurredAt,
    type: input.type,
    level:
      input.targetState === "FAILED" ||
      input.targetState === "TIMEOUT"
        ? "ERROR"
        : "INFO",
    message: input.message,
    payload: Object.freeze({
      source: input.source,
      runId: input.runId,
      attempt: input.attempt,
      targetState: input.targetState,
      recoveryAuthorized: input.recoveryAuthorized ?? false,
      approvalDecision: input.approvalDecision ?? null,
    }),
    progress: Object.freeze({
      completed: input.completed,
      total: 100,
    }),
    authorityDecision: input.gateDecision.authorityDecision,
    validationStatus: input.gateDecision.validationStatus,
    resolutionStatus: input.gateDecision.resolutionStatus!,
    pipelineTrace: input.gateDecision.pipelineTrace!,
    missingArtifacts: input.gateDecision.missingArtifacts,
  };
}

function decisionFromSession(
  session: ProgramRuntimeSession,
): RuntimeExecutionGateDecision {
  return {
    executionAllowed:
      session.validationStatus === "VALID" &&
      session.resolutionStatus === "RESOLVED" &&
      session.missingArtifacts.length === 0,
    validationStatus: session.validationStatus,
    blockingReasons: [],
    authorityDecision: session.authorityDecision,
    resolutionStatus: session.resolutionStatus,
    missingArtifacts: session.missingArtifacts,
    pipelineTrace: session.pipelineTrace,
  };
}

function assertExecutionGate(
  session: ProgramRuntimeSession,
  decision: RuntimeExecutionGateDecision,
): void {
  if (
    !decision.executionAllowed ||
    decision.validationStatus !== "VALID" ||
    decision.resolutionStatus !== "RESOLVED" ||
    decision.missingArtifacts.length > 0 ||
    decision.authorityDecision !== session.authorityDecision ||
    decision.pipelineTrace !== session.pipelineTrace
  ) {
    throw new ProgramRuntimeOrchestrationError(
      "PRO-007",
      "RUNNING requires a consistent authorized RuntimeExecutionGate decision.",
    );
  }
}

function assertInitializeInput(
  input: ProgramRuntimeInitializeInput,
): void {
  if (
    !isToken(input.missionId) ||
    !isToken(input.runId) ||
    !isToken(input.source) ||
    !Number.isInteger(input.maxRetries) ||
    input.maxRetries < 0 ||
    !isToken(input.eventId) ||
    !isCanonicalTimestamp(input.occurredAt) ||
    input.gateDecision.resolutionStatus === null ||
    input.gateDecision.pipelineTrace === null ||
    input.gateDecision.pipelineTrace.missionId !== input.missionId
  ) {
    throw new ProgramRuntimeOrchestrationError(
      "PRO-001",
      "Invalid orchestration initialization input.",
    );
  }
}

function assertTransitionInput(
  input: ProgramRuntimeTransitionInput,
): void {
  if (
    !isToken(input.targetState) ||
    !isToken(input.source) ||
    !isToken(input.eventId) ||
    !isCanonicalTimestamp(input.occurredAt) ||
    typeof input.message !== "string" ||
    input.message.trim() !== input.message ||
    input.message.length === 0
  ) {
    throw new ProgramRuntimeOrchestrationError(
      "PRO-001",
      "Invalid orchestration transition input.",
    );
  }
  if (containsSensitiveValue(input.message)) {
    throw new ProgramRuntimeOrchestrationError(
      "PRO-009",
      "Sensitive values are forbidden in observable transition messages.",
    );
  }
}

function assertHumanApprovalTransition(
  sourceState: MissionState,
  input: ProgramRuntimeTransitionInput,
): void {
  if (sourceState !== "HUMAN_VALIDATION") {
    return;
  }
  const expected = {
    ACCEPTED: "APPROVED",
    REJECTED: "REJECTED",
    NEEDS_REVISION: "CHANGES_REQUESTED",
    WAITING_INPUT: "BLOCKED",
  } as const;
  const required =
    expected[input.targetState as keyof typeof expected];
  if (required === undefined || input.approvalDecision !== required) {
    throw new ProgramRuntimeOrchestrationError(
      "PRO-008",
      "A matching explicit human decision is required.",
    );
  }
}

function containsSensitiveValue(value: string): boolean {
  return /(?:password|secret|token|api[_-]?key|private[_-]?key)\s*[:=]/i.test(
    value,
  );
}

function assertSession(session: ProgramRuntimeSession): void {
  if (
    !isToken(session.missionId) ||
    !isToken(session.runId) ||
    !Number.isInteger(session.attempt) ||
    session.attempt < 1 ||
    !Array.isArray(session.events) ||
    !Array.isArray(session.startedAttempts)
  ) {
    throw new ProgramRuntimeOrchestrationError(
      "PRO-001",
      "Invalid orchestration session.",
    );
  }
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

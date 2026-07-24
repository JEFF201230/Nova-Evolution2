export type MissionState =
  | "DRAFT"
  | "READY"
  | "ASSIGNED"
  | "LOCKED"
  | "RUNNING"
  | "WAITING_INPUT"
  | "WAITING_DEPENDENCY"
  | "ESCALATED"
  | "SUBMITTED"
  | "TECHNICAL_VALIDATION"
  | "DOCUMENTARY_VALIDATION"
  | "HUMAN_VALIDATION"
  | "NEEDS_REVISION"
  | "ACCEPTED"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED";

export type MissionEventName =
  | "MissionCreated"
  | "MissionAccepted"
  | "MissionCancelled"
  | "AgentAssigned"
  | "LockGranted"
  | "LockRenewed"
  | "LockReleased"
  | "LockExpired"
  | "LockConflictDetected"
  | "AgentStarted"
  | "InputRequired"
  | "InputProvided"
  | "DependencyRequired"
  | "DependencyAvailable"
  | "DependencyUnavailable"
  | "EscalationRequested"
  | "EscalationResolved"
  | "EscalationFailed"
  | "ExecutionFailed"
  | "BlockingUnresolved"
  | "ReportSubmitted"
  | "TechnicalValidationStarted"
  | "TechnicalValidationAccepted"
  | "TechnicalValidationRejectedRecoverable"
  | "TechnicalValidationRejectedFinal"
  | "DocumentaryValidationStarted"
  | "DocumentaryValidationAccepted"
  | "DocumentaryValidationRejectedRecoverable"
  | "DocumentaryValidationRejectedFinal"
  | "HumanValidationStarted"
  | "FinalValidationAccepted"
  | "FinalValidationRejected"
  | "ValidationRejected"
  | "RevisionRequested"
  | "RevisionStarted"
  | "RevisionRejected"
  | "MissionRequalified";

export type RuntimeErrorCode =
  | "ORCH-ERR-002"
  | "ORCH-ERR-003"
  | "ORCH-ERR-004"
  | "ORCH-ERR-005"
  | "ORCH-ERR-006"
  | "ORCH-ERR-008"
  | "ORCH-ERR-009"
  | "ORCH-ERR-011"
  | "ORCH-ERR-012"
  | "ORCH-ERR-013"
  | "ORCH-ERR-015"
  | "ORCH-ERR-017"
  | "ORCH-ERR-018";

export interface MissionScope {
  allowed: string[];
  forbidden: string[];
}

export interface MissionDefinition {
  projectId: string;
  missionId: string;
  missionType: string;
  objective: string;
  authority: string;
  scope: MissionScope;
  deliverables: string[];
  stopCriteria: string[];
  authorizedReferences: string[];
  requestedAgentId?: string;
  priority?: number;
  createdAt?: string;
}

export interface RuntimeMission extends MissionDefinition {
  state: MissionState;
  assignedAgentId: string | null;
  lockId: string | null;
  runId: string | null;
  contextId: string | null;
  reportId: string | null;
  updatedAt: string;
}

export interface RuntimeContext {
  projectId: string;
  missionId: string;
  contextId: string;
  objective: string;
  scope: MissionScope;
  deliverables: string[];
  stopCriteria: string[];
  authorizedReferences: string[];
  state: MissionState;
  lockScope?: string[];
}

export type RuntimeLockStatus = "ACTIVE" | "RELEASED" | "EXPIRED";

export interface RuntimeLock {
  lockId: string;
  projectId: string;
  missionId: string;
  agentId: string;
  scope: string[];
  status: RuntimeLockStatus;
  releaseCondition: string;
  grantedAt: string;
  updatedAt: string;
}

export interface MissionReport {
  projectId: string;
  missionId: string;
  reportId: string;
  agentId: string;
  reportType: string;
  deliverables: string[];
  filesChanged: string[];
  checks: string[];
  blockers: string[];
  errors: string[];
  scopeConfirmed: boolean;
  submittedAt: string;
}

export interface RuntimeEvent {
  eventId: string;
  eventName: MissionEventName;
  projectId: string;
  missionId: string;
  runId?: string;
  correlationId: string;
  causationId?: string;
  sequence: number;
  sourceState: MissionState | null;
  targetState: MissionState | null;
  producer: string;
  occurredAt: string;
  publishedAt: string;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface AuditEntry {
  auditId: string;
  eventId?: string;
  projectId: string;
  missionId: string;
  correlationId: string;
  sequence?: number;
  action: string;
  result: "accepted" | "rejected" | "ignored" | "replayed";
  cause: string;
  actor: string;
  createdAt: string;
}

export interface RuntimeQueueItem {
  projectId: string;
  missionId: string;
  priority: number;
  enqueuedAt: string;
}

export interface RuntimeQueueSnapshot {
  projectId: string;
  items: RuntimeQueueItem[];
}

export interface RuntimeSnapshot {
  version: 1;
  missions: RuntimeMission[];
  events: RuntimeEvent[];
  audits: AuditEntry[];
  locks: RuntimeLock[];
  contexts: RuntimeContext[];
  reports: MissionReport[];
  queues: RuntimeQueueSnapshot[];
  agents: RuntimeAgent[];
}

export interface RuntimeAgent {
  agentId: string;
  missionTypes: string[];
  authorizedScopes: string[];
}

export interface RuntimeExecutionHandler {
  (context: RuntimeContext, mission: RuntimeMission): Promise<Omit<MissionReport, "submittedAt">>;
}

export interface RuntimeExecutionResult {
  mission: RuntimeMission;
  report: MissionReport;
  events: RuntimeEvent[];
}

export interface RuntimeError {
  code: RuntimeErrorCode;
  message: string;
}

import {
  IntegrationRuntimeRepository,
  type IntegrationPersistedRecord,
} from "./integration-runtime-repository.js";
import {
  MissionEvidenceCertifier,
  type MissionEvidenceBundle,
} from "./mission-evidence-certifier.js";
import {
  ProgramRuntimeOrchestrator,
  type ProgramRuntimeSession,
} from "./program-runtime-orchestrator.js";

export type HumanApprovalDecisionValue =
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "BLOCKED";

export interface LocalIdentityContext {
  readonly subjectId: string;
  readonly roles: readonly string[];
  readonly identityContextStatus: "IDENTITY_CONTEXT_VALIDATED";
  readonly productionAuthenticationStatus:
    "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH";
}

export interface HumanApprovalRequest {
  readonly requestId: string;
  readonly missionId: string;
  readonly runId: string;
  readonly requestedBy: string;
  readonly requiredRole: string;
  readonly requestedAt: string;
  readonly bundleFingerprint: string;
  readonly technicalDecision: "GO";
}

export interface HumanApprovalRequestInput {
  readonly requestId: string;
  readonly requestedBy: string;
  readonly requiredRole: string;
  readonly requestedAt: string;
  readonly evidenceBundle: MissionEvidenceBundle;
}

export interface HumanApprovalDecision {
  readonly decisionId: string;
  readonly request: HumanApprovalRequest;
  readonly identity: LocalIdentityContext;
  readonly decision: HumanApprovalDecisionValue;
  readonly justification: string | null;
  readonly decidedAt: string;
  readonly bundleFingerprint: string;
}

export interface HumanApprovalDecisionInput {
  readonly decisionId: string;
  readonly request: HumanApprovalRequest;
  readonly identity: LocalIdentityContext | null;
  readonly decision: HumanApprovalDecisionValue;
  readonly justification?: string | null;
  readonly decidedAt: string;
  readonly evidenceBundle: MissionEvidenceBundle;
}

export interface HumanApprovalWorkflowFeatureFlag {
  readonly enabled: boolean;
}

export class HumanApprovalWorkflowError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "HumanApprovalWorkflowError";
  }
}

export class HumanApprovalWorkflow {
  readonly enabled: boolean;

  constructor(
    private readonly repository: IntegrationRuntimeRepository,
    private readonly certifier: MissionEvidenceCertifier,
    private readonly orchestrator: ProgramRuntimeOrchestrator,
    featureFlag: HumanApprovalWorkflowFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  createRequest(
    input: HumanApprovalRequestInput,
  ): HumanApprovalRequest | null {
    if (!this.enabled) {
      return null;
    }
    if (
      !isToken(input.requestId) ||
      !isToken(input.requestedBy) ||
      !isToken(input.requiredRole) ||
      !isCanonicalTimestamp(input.requestedAt) ||
      !this.certifier.verify(input.evidenceBundle) ||
      input.evidenceBundle.certification.decision !== "GO"
    ) {
      throw new HumanApprovalWorkflowError(
        "HAW-001",
        "Approval request requires an intact technical GO bundle.",
      );
    }

    return Object.freeze({
      requestId: input.requestId,
      missionId: input.evidenceBundle.missionId,
      runId: input.evidenceBundle.runId,
      requestedBy: input.requestedBy,
      requiredRole: input.requiredRole,
      requestedAt: input.requestedAt,
      bundleFingerprint: input.evidenceBundle.bundleFingerprint,
      technicalDecision: "GO",
    });
  }

  async decide(
    input: HumanApprovalDecisionInput,
  ): Promise<HumanApprovalDecision | null> {
    if (!this.enabled) {
      return null;
    }
    assertDecisionInput(input, this.certifier);

    const identity = input.identity!;
    if (!identity.roles.includes(input.request.requiredRole)) {
      throw new HumanApprovalWorkflowError(
        "HAW-004",
        "Identity does not hold the required approval role.",
      );
    }
    if (identity.subjectId === input.request.requestedBy) {
      throw new HumanApprovalWorkflowError(
        "HAW-005",
        "Self-approval is forbidden by local policy.",
      );
    }
    if (
      input.decision !== "APPROVED" &&
      !isNormalizedJustification(input.justification)
    ) {
      throw new HumanApprovalWorkflowError(
        "HAW-006",
        "A justification is required for non-approval decisions.",
      );
    }

    const decision = Object.freeze({
      decisionId: input.decisionId,
      request: input.request,
      identity,
      decision: input.decision,
      justification:
        input.decision === "APPROVED"
          ? input.justification?.trim() || null
          : input.justification!,
      decidedAt: input.decidedAt,
      bundleFingerprint: input.evidenceBundle.bundleFingerprint,
    });
    const record: IntegrationPersistedRecord = {
      schemaVersion: 1,
      recordId: input.decisionId,
      kind: "HUMAN_APPROVAL",
      missionId: input.request.missionId,
      runId: input.request.runId,
      source: identity.subjectId,
      occurredAt: input.decidedAt,
      payload: decision,
    };
    const persisted = await this.repository.append(record);
    if (persisted === null) {
      throw new HumanApprovalWorkflowError(
        "HAW-007",
        "Human approval persistence is inactive.",
      );
    }
    return decision;
  }

  async history(
    missionId: string,
    runId: string,
  ): Promise<readonly HumanApprovalDecision[]> {
    if (!this.enabled) {
      return Object.freeze([]);
    }
    if (!isToken(missionId) || !isToken(runId)) {
      throw new HumanApprovalWorkflowError(
        "HAW-002",
        "Invalid approval history identity.",
      );
    }
    const records = await this.repository.readAll();
    return Object.freeze(
      records
        .filter(
          (record) =>
            record.kind === "HUMAN_APPROVAL" &&
            record.missionId === missionId &&
            record.runId === runId,
        )
        .map((record) => record.payload as HumanApprovalDecision),
    );
  }

  applyDecision(
    session: ProgramRuntimeSession,
    decision: HumanApprovalDecision,
    event: {
      readonly eventId: string;
      readonly occurredAt: string;
      readonly source: string;
    },
  ): ProgramRuntimeSession | null {
    if (!this.enabled) {
      return null;
    }
    if (
      session.state !== "HUMAN_VALIDATION" ||
      session.missionId !== decision.request.missionId ||
      session.runId !== decision.request.runId
    ) {
      throw new HumanApprovalWorkflowError(
        "HAW-008",
        "Approval decision does not match a waiting mission.",
      );
    }
    const target = {
      APPROVED: "ACCEPTED",
      REJECTED: "REJECTED",
      CHANGES_REQUESTED: "NEEDS_REVISION",
      BLOCKED: "WAITING_INPUT",
    } as const;
    return this.orchestrator.transition(session, {
      targetState: target[decision.decision],
      source: event.source,
      eventId: event.eventId,
      occurredAt: event.occurredAt,
      message: `Human decision ${decision.decision}.`,
      approvalDecision: decision.decision,
    });
  }
}

function assertDecisionInput(
  input: HumanApprovalDecisionInput,
  certifier: MissionEvidenceCertifier,
): void {
  if (
    !isToken(input.decisionId) ||
    !isCanonicalTimestamp(input.decidedAt) ||
    !isDecision(input.decision) ||
    input.identity === null
  ) {
    throw new HumanApprovalWorkflowError(
      "HAW-002",
      "Anonymous or malformed approval decision.",
    );
  }
  if (
    !isToken(input.identity.subjectId) ||
    !Array.isArray(input.identity.roles) ||
    !input.identity.roles.every(isToken) ||
    input.identity.identityContextStatus !==
      "IDENTITY_CONTEXT_VALIDATED" ||
    input.identity.productionAuthenticationStatus !==
      "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH"
  ) {
    throw new HumanApprovalWorkflowError(
      "HAW-003",
      "Identity context is structurally invalid.",
    );
  }
  if (
    !certifier.verify(input.evidenceBundle) ||
    input.evidenceBundle.certification.decision !== "GO" ||
    input.request.technicalDecision !== "GO" ||
    input.request.missionId !== input.evidenceBundle.missionId ||
    input.request.runId !== input.evidenceBundle.runId ||
    input.request.bundleFingerprint !==
      input.evidenceBundle.bundleFingerprint
  ) {
    throw new HumanApprovalWorkflowError(
      "HAW-009",
      "Approval evidence is altered or inconsistent.",
    );
  }
}

function isDecision(value: unknown): value is HumanApprovalDecisionValue {
  return (
    value === "APPROVED" ||
    value === "REJECTED" ||
    value === "CHANGES_REQUESTED" ||
    value === "BLOCKED"
  );
}

function isNormalizedJustification(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
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

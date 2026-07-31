import type {
  HumanApprovalDecision,
  HumanApprovalDecisionValue,
} from "../../nova-core/human-approval-workflow.js";
import {
  WORK_DECISIONS_BINDING_SOURCE,
  WORK_DECISIONS_HISTORY_SOURCE,
  WORK_DECISIONS_PERSISTENCE_SOURCE,
  WORK_DECISIONS_RECORD_KIND,
  WorkDecisionsFailure,
  type WorkDecisions,
} from "./work-decisions.types.js";

export function createWorkDecisions(input: WorkDecisions): WorkDecisions {
  assertIdentifier(input.projectId, "projectId");
  assertIdentifier(input.workId, "workId");
  assertIdentifier(input.provenance.missionId, "provenance.missionId");
  if (input.workId !== input.provenance.missionId) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-002",
      "Work Decisions requires the canonical Work-to-Mission identity binding.",
    );
  }
  if (
    input.provenance.sourceDomain !== "MISSIONS"
    || input.provenance.producer !== "HUMAN_APPROVAL_WORKFLOW"
    || input.provenance.historySource !== WORK_DECISIONS_HISTORY_SOURCE
    || input.provenance.persistenceSource !==
      WORK_DECISIONS_PERSISTENCE_SOURCE
    || input.provenance.recordKind !== WORK_DECISIONS_RECORD_KIND
    || input.provenance.workBindingSource !==
      WORK_DECISIONS_BINDING_SOURCE
  ) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-002",
      "Work Decisions accepts only canonical Human Approval provenance.",
    );
  }
  assertIdentifier(input.provenance.sourceId, "provenance.sourceId");
  assertTimestamp(input.provenance.observedAt, "provenance.observedAt");
  if (input.provenance.runId === null) {
    if (input.decisions.length > 0) {
      throw new WorkDecisionsFailure(
        "WDEC-ERR-002",
        "Human approval decisions require an authoritative Work run.",
      );
    }
  } else {
    assertIdentifier(input.provenance.runId, "provenance.runId");
  }

  const decisions = input.decisions.map((decision, index) =>
    createDecision(
      decision,
      index,
      input.provenance.missionId,
      input.provenance.runId,
    ),
  );

  return Object.freeze({
    projectId: input.projectId,
    workId: input.workId,
    decisions: Object.freeze(decisions),
    provenance: Object.freeze({
      sourceDomain: "MISSIONS",
      producer: "HUMAN_APPROVAL_WORKFLOW",
      sourceId: input.provenance.sourceId,
      observedAt: input.provenance.observedAt,
      missionId: input.provenance.missionId,
      runId: input.provenance.runId,
      historySource: WORK_DECISIONS_HISTORY_SOURCE,
      persistenceSource: WORK_DECISIONS_PERSISTENCE_SOURCE,
      recordKind: WORK_DECISIONS_RECORD_KIND,
      workBindingSource: WORK_DECISIONS_BINDING_SOURCE,
    }),
  });
}

function createDecision(
  input: HumanApprovalDecision,
  index: number,
  missionId: string,
  runId: string | null,
): HumanApprovalDecision {
  const field = `decisions[${index}]`;
  assertIdentifier(input.decisionId, `${field}.decisionId`);
  assertIdentifier(input.request.requestId, `${field}.request.requestId`);
  assertIdentifier(input.request.missionId, `${field}.request.missionId`);
  assertIdentifier(input.request.runId, `${field}.request.runId`);
  assertIdentifier(input.request.requestedBy, `${field}.request.requestedBy`);
  assertIdentifier(input.request.requiredRole, `${field}.request.requiredRole`);
  assertTimestamp(input.request.requestedAt, `${field}.request.requestedAt`);
  assertIdentifier(
    input.request.bundleFingerprint,
    `${field}.request.bundleFingerprint`,
  );
  if (
    input.request.technicalDecision !== "GO"
    || input.request.missionId !== missionId
    || runId === null
    || input.request.runId !== runId
  ) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-002",
      `${field} is not bound to the selected Work Mission and run.`,
    );
  }

  assertIdentifier(input.identity.subjectId, `${field}.identity.subjectId`);
  if (
    !Array.isArray(input.identity.roles)
    || !input.identity.roles.every(
      (role) => typeof role === "string" && isIdentifier(role),
    )
    || input.identity.identityContextStatus !==
      "IDENTITY_CONTEXT_VALIDATED"
    || input.identity.productionAuthenticationStatus !==
      "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH"
  ) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-001",
      `${field}.identity is not a canonical Human Approval identity.`,
    );
  }
  assertDecision(input.decision, `${field}.decision`);
  if (
    input.justification !== null
    && (
      input.justification.length === 0
      || input.justification !== input.justification.trim()
    )
  ) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-001",
      `${field}.justification must remain null or authoritative text.`,
    );
  }
  if (input.decision !== "APPROVED" && input.justification === null) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-001",
      `${field}.justification is required for a non-approval decision.`,
    );
  }
  assertTimestamp(input.decidedAt, `${field}.decidedAt`);
  assertIdentifier(input.bundleFingerprint, `${field}.bundleFingerprint`);
  if (input.bundleFingerprint !== input.request.bundleFingerprint) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-002",
      `${field} does not preserve its authoritative evidence binding.`,
    );
  }

  return Object.freeze({
    decisionId: input.decisionId,
    request: Object.freeze({
      requestId: input.request.requestId,
      missionId: input.request.missionId,
      runId: input.request.runId,
      requestedBy: input.request.requestedBy,
      requiredRole: input.request.requiredRole,
      requestedAt: input.request.requestedAt,
      bundleFingerprint: input.request.bundleFingerprint,
      technicalDecision: "GO",
    }),
    identity: Object.freeze({
      subjectId: input.identity.subjectId,
      roles: Object.freeze([...input.identity.roles]),
      identityContextStatus: "IDENTITY_CONTEXT_VALIDATED",
      productionAuthenticationStatus:
        "NOT_AUTHENTICATED_BY_PRODUCTION_AUTH",
    }),
    decision: input.decision,
    justification: input.justification,
    decidedAt: input.decidedAt,
    bundleFingerprint: input.bundleFingerprint,
  });
}

function assertDecision(
  value: HumanApprovalDecisionValue,
  field: string,
): void {
  if (
    value !== "APPROVED"
    && value !== "REJECTED"
    && value !== "CHANGES_REQUESTED"
    && value !== "BLOCKED"
  ) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-001",
      `${field} is not a Human Approval decision.`,
    );
  }
}

function assertIdentifier(value: unknown, field: string): asserts value is string {
  if (!isIdentifier(value)) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-001",
      `${field} must be a non-empty canonical identifier.`,
    );
  }
}

function isIdentifier(value: unknown): value is string {
  return (
    typeof value === "string"
    && value.length > 0
    && value === value.trim()
  );
}

function assertTimestamp(value: unknown, field: string): asserts value is string {
  if (
    typeof value !== "string"
    || !Number.isFinite(Date.parse(value))
  ) {
    throw new WorkDecisionsFailure(
      "WDEC-ERR-001",
      `${field} must contain a valid timestamp.`,
    );
  }
}

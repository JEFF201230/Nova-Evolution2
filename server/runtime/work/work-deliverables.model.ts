import {
  WORK_DELIVERABLES_EVIDENCE_SOURCE,
  WorkDeliverablesFailure,
  type WorkDeliverable,
  type WorkDeliverables,
} from "./work-deliverables.types.js";

export function createWorkDeliverables(
  input: WorkDeliverables,
): WorkDeliverables {
  assertIdentifier(input.projectId, "projectId");
  assertIdentifier(input.workId, "workId");
  assertIdentifier(input.missionId, "missionId");
  if (input.workId !== input.missionId) {
    throw new WorkDeliverablesFailure(
      "WDEL-ERR-002",
      "Work Deliverables requires the canonical Work-to-Mission identity binding.",
    );
  }
  if (
    input.provenance.sourceDomain !== "MISSIONS"
    || input.provenance.producer !== "ORCHESTRATOR_RUNTIME"
    || input.provenance.evidenceSource !== WORK_DELIVERABLES_EVIDENCE_SOURCE
    || input.provenance.missionId !== input.missionId
  ) {
    throw new WorkDeliverablesFailure(
      "WDEL-ERR-002",
      "Work Deliverables accepts only authoritative Orchestrator MissionReport provenance.",
    );
  }
  assertIdentifier(input.provenance.sourceId, "provenance.sourceId");
  assertTimestamp(input.provenance.observedAt, "provenance.observedAt");
  if (input.provenance.reportId !== null) {
    assertIdentifier(input.provenance.reportId, "provenance.reportId");
  }
  if (input.provenance.runId !== null) {
    assertIdentifier(input.provenance.runId, "provenance.runId");
  }

  const deliverables = input.deliverables.map((deliverable, index) =>
    createWorkDeliverable(
      deliverable,
      index,
      input.provenance.runId,
    ),
  );

  return Object.freeze({
    projectId: input.projectId,
    workId: input.workId,
    missionId: input.missionId,
    deliverables: Object.freeze(deliverables),
    provenance: Object.freeze({
      sourceDomain: "MISSIONS",
      producer: "ORCHESTRATOR_RUNTIME",
      sourceId: input.provenance.sourceId,
      observedAt: input.provenance.observedAt,
      missionId: input.provenance.missionId,
      reportId: input.provenance.reportId,
      runId: input.provenance.runId,
      evidenceSource: WORK_DELIVERABLES_EVIDENCE_SOURCE,
    }),
  });
}

function createWorkDeliverable(
  input: WorkDeliverable,
  index: number,
  reportRunId: string | null,
): WorkDeliverable {
  const field = `deliverables[${index}]`;
  assertIdentifier(input.path, `${field}.path`);
  if (!Number.isSafeInteger(input.size) || input.size < 0) {
    throw new WorkDeliverablesFailure(
      "WDEL-ERR-001",
      `${field}.size must contain the authoritative non-negative file size.`,
    );
  }
  if (!/^[a-f0-9]{64}$/i.test(input.sha256)) {
    throw new WorkDeliverablesFailure(
      "WDEL-ERR-001",
      `${field}.sha256 must contain the authoritative SHA-256.`,
    );
  }
  assertTimestamp(input.modifiedAt, `${field}.modifiedAt`);
  assertIdentifier(input.runId, `${field}.runId`);
  if (reportRunId !== null && input.runId !== reportRunId) {
    throw new WorkDeliverablesFailure(
      "WDEL-ERR-002",
      `${field} is not bound to the selected MissionReport run.`,
    );
  }

  return Object.freeze({
    path: input.path,
    size: input.size,
    sha256: input.sha256,
    modifiedAt: input.modifiedAt,
    runId: input.runId,
  });
}

function assertIdentifier(value: string, field: string): void {
  if (value.length === 0 || value !== value.trim()) {
    throw new WorkDeliverablesFailure(
      "WDEL-ERR-001",
      `${field} must be a non-empty canonical identifier.`,
    );
  }
}

function assertTimestamp(value: string, field: string): void {
  if (!Number.isFinite(Date.parse(value))) {
    throw new WorkDeliverablesFailure(
      "WDEL-ERR-001",
      `${field} must contain a valid timestamp.`,
    );
  }
}

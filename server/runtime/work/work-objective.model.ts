import {
  WorkObjectiveFailure,
  type WorkObjective,
} from "./work-objective.types.js";

export function createWorkObjective(
  input: WorkObjective,
): WorkObjective {
  assertIdentifier(input.work.projectId, "work.projectId");
  assertIdentifier(input.work.workId, "work.workId");
  assertNonEmpty(input.label, "label");
  if (
    input.objectiveId !== null
    || input.description !== null
    || input.status !== null
    || input.updatedAt !== null
  ) {
    throw new WorkObjectiveFailure(
      "WOBJ-ERR-001",
      "Unavailable Objective fields must remain explicitly null.",
    );
  }
  if (input.createdAt !== null) {
    assertTimestamp(input.createdAt, "createdAt");
  }
  if (
    input.provenance.sourceDomain !== "MISSIONS"
    || input.provenance.producer !== "ORCHESTRATOR_RUNTIME"
  ) {
    throw new WorkObjectiveFailure(
      "WOBJ-ERR-002",
      "Work Objective accepts only the authoritative Mission producer.",
    );
  }
  assertNonEmpty(input.provenance.sourceId, "provenance.sourceId");
  assertTimestamp(input.provenance.observedAt, "provenance.observedAt");

  return Object.freeze({
    objectiveId: null,
    work: Object.freeze({
      projectId: input.work.projectId,
      workId: input.work.workId,
    }),
    label: input.label,
    description: null,
    status: null,
    createdAt: input.createdAt,
    updatedAt: null,
    provenance: Object.freeze({
      sourceDomain: "MISSIONS",
      producer: input.provenance.producer,
      sourceId: input.provenance.sourceId,
      observedAt: input.provenance.observedAt,
    }),
  });
}

function assertIdentifier(value: string, field: string): void {
  if (
    value.length === 0
    || value !== value.trim()
  ) {
    throw new WorkObjectiveFailure(
      "WOBJ-ERR-001",
      `${field} must be a non-empty canonical identifier.`,
    );
  }
}

function assertNonEmpty(value: string, field: string): void {
  if (
    value.length === 0
    || value !== value.trim()
  ) {
    throw new WorkObjectiveFailure(
      "WOBJ-ERR-001",
      `${field} must be a non-empty authoritative value.`,
    );
  }
}

function assertTimestamp(value: string, field: string): void {
  if (!Number.isFinite(Date.parse(value))) {
    throw new WorkObjectiveFailure(
      "WOBJ-ERR-001",
      `${field} must contain a valid timestamp.`,
    );
  }
}

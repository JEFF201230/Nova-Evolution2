import type {
  RuntimeMission,
  RuntimeObservabilityEvent,
} from "../orchestrator/orchestrator-runtime.types.js";
import {
  WORK_CORE_SCHEMA_VERSION,
  WorkCoreFailure,
  type WorkCoreAggregate,
  type WorkProgression,
} from "./work-core.types.js";
import { WorkLifecycleProducer } from "./work-lifecycle.js";

export interface WorkCoreSource {
  getMission(
    projectId: string,
    missionId: string,
  ): RuntimeMission | null | undefined;
  getObservabilityEvents(
    projectId: string,
    missionId: string,
  ): RuntimeObservabilityEvent[];
}

/**
 * Internal Runtime foundation for the Work aggregate.
 *
 * It consumes the existing Mission and Monitoring producers directly. It has
 * no dependency on Frontend, BFF, HTTP, read models or UX projections.
 */
export class WorkCoreFoundation {
  constructor(
    private readonly source: WorkCoreSource,
    private readonly lifecycleProducer = new WorkLifecycleProducer(),
  ) {}

  load(projectId: string, missionId: string): WorkCoreAggregate {
    assertIdentifier(projectId, "projectId");
    assertIdentifier(missionId, "missionId");

    const mission = this.source.getMission(projectId, missionId);
    if (mission === undefined || mission === null) {
      throw new WorkCoreFailure(
        "WCF-ERR-001",
        `Mission ${projectId}/${missionId} is unavailable.`,
      );
    }

    assertMissionBinding(mission, projectId, missionId);
    assertTimestamp(mission.updatedAt, "mission.updatedAt");
    if (mission.createdAt !== undefined) {
      assertTimestamp(mission.createdAt, "mission.createdAt");
    }

    const progression = selectCurrentProgression(
      this.source.getObservabilityEvents(projectId, missionId),
      projectId,
      missionId,
    );
    const lifecycle = this.lifecycleProducer.produce(mission);
    const identityObservedAt = mission.createdAt ?? mission.updatedAt;
    const identityProvenance = Object.freeze({
      sourceDomain: "MISSIONS" as const,
      producer: "ORCHESTRATOR_RUNTIME",
      sourceId: `${projectId}/${missionId}`,
      observedAt: identityObservedAt,
    });
    const identity = Object.freeze({
      workId: mission.missionId,
      projectId: mission.projectId,
      objective: mission.objective,
      mission: Object.freeze({
        projectId: mission.projectId,
        missionId: mission.missionId,
      }),
      provenance: identityProvenance,
    });
    const timestamps = Object.freeze({
      createdAt: mission.createdAt ?? null,
      updatedAt: latestTimestamp(mission.updatedAt, progression.observedAt),
    });

    return Object.freeze({
      schemaVersion: WORK_CORE_SCHEMA_VERSION,
      identity,
      lifecycle,
      progression,
      timestamps,
    });
  }
}

function selectCurrentProgression(
  events: readonly RuntimeObservabilityEvent[],
  projectId: string,
  missionId: string,
): WorkProgression {
  const matching = events.filter(
    (event) => event.projectId === projectId && event.missionId === missionId,
  );

  if (matching.length === 0) {
    throw new WorkCoreFailure(
      "WCF-ERR-003",
      `Authoritative progression for ${projectId}/${missionId} is unavailable.`,
    );
  }

  for (const event of matching) {
    assertProgressionEvent(event);
  }

  const current = matching.reduce((latest, candidate) =>
    compareProgressionEvents(candidate, latest) > 0 ? candidate : latest,
  );
  const provenance = Object.freeze({
    sourceDomain: "MONITORING" as const,
    producer: "ORCHESTRATOR_OBSERVABILITY",
    sourceId: current.observabilityEventId,
    observedAt: current.timestamp,
    sequence: current.sequence,
    correlationId: current.correlationId,
    runId: current.runId,
  });

  return Object.freeze({
    percentage: current.progression,
    observedAt: current.timestamp,
    provenance,
  });
}

function assertMissionBinding(
  mission: RuntimeMission,
  projectId: string,
  missionId: string,
): void {
  if (
    mission.projectId !== projectId ||
    mission.missionId !== missionId ||
    mission.objective.trim().length === 0
  ) {
    throw new WorkCoreFailure(
      "WCF-ERR-002",
      "Mission identity cannot establish the requested Work binding.",
    );
  }
}

function assertProgressionEvent(event: RuntimeObservabilityEvent): void {
  if (
    !Number.isInteger(event.sequence) ||
    event.sequence < 0 ||
    !Number.isFinite(event.progression) ||
    event.progression < 0 ||
    event.progression > 100
  ) {
    throw new WorkCoreFailure(
      "WCF-ERR-004",
      `Invalid authoritative progression event ${event.observabilityEventId}.`,
    );
  }
  assertTimestamp(event.timestamp, `event ${event.observabilityEventId}`);
}

function compareProgressionEvents(
  left: RuntimeObservabilityEvent,
  right: RuntimeObservabilityEvent,
): number {
  if (left.sequence !== right.sequence) {
    return left.sequence - right.sequence;
  }
  const timestampDifference = Date.parse(left.timestamp) - Date.parse(right.timestamp);
  if (timestampDifference !== 0) {
    return timestampDifference;
  }
  return left.observabilityEventId.localeCompare(right.observabilityEventId);
}

function assertIdentifier(value: string, field: string): void {
  if (value.length === 0 || value !== value.trim()) {
    throw new WorkCoreFailure(
      "WCF-ERR-002",
      `${field} must be a non-empty canonical identifier.`,
    );
  }
}

function assertTimestamp(value: string, field: string): void {
  if (!Number.isFinite(Date.parse(value))) {
    throw new WorkCoreFailure(
      "WCF-ERR-005",
      `${field} must contain a valid timestamp.`,
    );
  }
}

function latestTimestamp(left: string, right: string): string {
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

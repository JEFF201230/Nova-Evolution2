import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  MissionEventProgressSnapshot,
} from "./mission-event-publisher.js";
import type {
  MissionTimelineModel,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";

export type MissionProgressStatus =
  | "UNAVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETE";

export interface MissionProgressModel {
  readonly missionId: string;
  readonly completed: number | null;
  readonly total: number | null;
  readonly percentage: number | null;
  readonly progressStatus: MissionProgressStatus;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus | null;
  readonly resolutionStatus: MissionBrief["resolutionStatus"] | null;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace | null;
  readonly missingArtifacts: readonly string[];
}

export interface MissionProgressFeatureFlag {
  readonly enabled: boolean;
}

export class MissionProgress {
  readonly enabled: boolean;

  constructor(
    featureFlag: MissionProgressFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  calculate(
    timeline: MissionTimelineModel,
  ): MissionProgressModel | null {
    if (!this.enabled) {
      return null;
    }

    assertTimeline(timeline);

    const snapshot = findLatestSnapshot(timeline);
    const completed = snapshot?.completed ?? null;
    const total = snapshot?.total ?? null;
    const percentage =
      snapshot === null
        ? null
        : Math.round((snapshot.completed / snapshot.total) * 10_000) /
          100;
    const progressStatus: MissionProgressStatus =
      snapshot === null
        ? "UNAVAILABLE"
        : snapshot.completed === snapshot.total
          ? "COMPLETE"
          : "IN_PROGRESS";

    return Object.freeze({
      missionId: timeline.missionId,
      completed,
      total,
      percentage,
      progressStatus,
      authorityDecision: timeline.authorityDecision,
      validationStatus: timeline.validationStatus,
      resolutionStatus: timeline.resolutionStatus,
      pipelineTrace: timeline.pipelineTrace,
      missingArtifacts: timeline.missingArtifacts,
    });
  }
}

function findLatestSnapshot(
  timeline: MissionTimelineModel,
): MissionEventProgressSnapshot | null {
  for (let index = timeline.events.length - 1; index >= 0; index -= 1) {
    const progress = timeline.events[index]?.progress;

    if (progress !== undefined) {
      assertProgressSnapshot(progress, index);
      return progress;
    }
  }

  return null;
}

function assertTimeline(timeline: MissionTimelineModel): void {
  if (
    !isRecord(timeline) ||
    !isMetadataToken(timeline.missionId) ||
    !Array.isArray(timeline.events) ||
    !Array.isArray(timeline.missingArtifacts)
  ) {
    throw new Error(
      "MPRO-001: MissionProgress requires a valid mission timeline.",
    );
  }
}

function assertProgressSnapshot(
  progress: MissionEventProgressSnapshot,
  eventIndex: number,
): void {
  if (
    !isRecord(progress) ||
    typeof progress.completed !== "number" ||
    !Number.isFinite(progress.completed) ||
    progress.completed < 0 ||
    typeof progress.total !== "number" ||
    !Number.isFinite(progress.total) ||
    progress.total <= 0 ||
    progress.completed > progress.total
  ) {
    throw new Error(
      `MPRO-002: Invalid progress snapshot at event index ${eventIndex}.`,
    );
  }
}

function isMetadataToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

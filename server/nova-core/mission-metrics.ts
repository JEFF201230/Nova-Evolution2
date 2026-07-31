import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  MissionProgressModel,
  MissionProgressStatus,
} from "./mission-progress.js";
import type {
  MissionTimelineModel,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";

export interface MissionMetricsInput {
  readonly timeline: MissionTimelineModel;
  readonly progress: MissionProgressModel;
}

export interface MissionMetricsModel {
  readonly missionId: string;
  readonly eventCount: number;
  readonly eventTypeCounts: Readonly<Record<string, number>>;
  readonly firstOccurredAt: string | null;
  readonly lastOccurredAt: string | null;
  readonly durationMs: number | null;
  readonly completed: number | null;
  readonly total: number | null;
  readonly percentage: number | null;
  readonly progressStatus: MissionProgressStatus;
  readonly missingArtifactCount: number;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus | null;
  readonly resolutionStatus: MissionBrief["resolutionStatus"] | null;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace | null;
  readonly missingArtifacts: readonly string[];
}

export interface MissionMetricsFeatureFlag {
  readonly enabled: boolean;
}

export class MissionMetrics {
  readonly enabled: boolean;

  constructor(
    featureFlag: MissionMetricsFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  produce(input: MissionMetricsInput): MissionMetricsModel | null {
    if (!this.enabled) {
      return null;
    }

    assertMetricsInput(input);

    const typeCounts = new Map<string, number>();
    for (const event of input.timeline.events) {
      typeCounts.set(
        event.type,
        (typeCounts.get(event.type) ?? 0) + 1,
      );
    }

    const eventTypeCounts = Object.freeze(
      Object.fromEntries(
        [...typeCounts.entries()].sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    );

    return Object.freeze({
      missionId: input.timeline.missionId,
      eventCount: input.timeline.events.length,
      eventTypeCounts,
      firstOccurredAt: input.timeline.firstOccurredAt,
      lastOccurredAt: input.timeline.lastOccurredAt,
      durationMs: calculateDuration(input.timeline),
      completed: input.progress.completed,
      total: input.progress.total,
      percentage: input.progress.percentage,
      progressStatus: input.progress.progressStatus,
      missingArtifactCount: input.timeline.missingArtifacts.length,
      authorityDecision: input.timeline.authorityDecision,
      validationStatus: input.timeline.validationStatus,
      resolutionStatus: input.timeline.resolutionStatus,
      pipelineTrace: input.timeline.pipelineTrace,
      missingArtifacts: input.timeline.missingArtifacts,
    });
  }
}

function calculateDuration(timeline: MissionTimelineModel): number | null {
  if (
    timeline.firstOccurredAt === null &&
    timeline.lastOccurredAt === null
  ) {
    return null;
  }

  if (
    timeline.firstOccurredAt === null ||
    timeline.lastOccurredAt === null
  ) {
    throw new Error(
      "MMET-003: Mission timeline boundaries must be both present or absent.",
    );
  }

  const first = Date.parse(timeline.firstOccurredAt);
  const last = Date.parse(timeline.lastOccurredAt);

  if (
    !Number.isFinite(first) ||
    !Number.isFinite(last) ||
    last < first
  ) {
    throw new Error(
      "MMET-003: Mission timeline boundaries are invalid.",
    );
  }

  return last - first;
}

function assertMetricsInput(input: MissionMetricsInput): void {
  if (
    !isRecord(input) ||
    !isRecord(input.timeline) ||
    !isRecord(input.progress) ||
    !Array.isArray(input.timeline.events) ||
    !Array.isArray(input.timeline.missingArtifacts)
  ) {
    throw new Error(
      "MMET-001: MissionMetrics requires timeline and progress models.",
    );
  }

  if (
    input.timeline.missionId !== input.progress.missionId ||
    input.timeline.authorityDecision !==
      input.progress.authorityDecision ||
    input.timeline.validationStatus !==
      input.progress.validationStatus ||
    input.timeline.resolutionStatus !==
      input.progress.resolutionStatus ||
    input.timeline.pipelineTrace !== input.progress.pipelineTrace ||
    input.timeline.missingArtifacts !== input.progress.missingArtifacts
  ) {
    throw new Error(
      "MMET-002: Mission metrics traceability inputs are inconsistent.",
    );
  }
}

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

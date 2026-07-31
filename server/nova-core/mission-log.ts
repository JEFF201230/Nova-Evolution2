import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  MissionEvent,
} from "./mission-event-publisher.js";
import type {
  MissionTimelineModel,
} from "./mission-timeline.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";

export type MissionLogEntry = MissionEvent;

export interface MissionLogModel {
  readonly missionId: string;
  readonly entries: readonly MissionLogEntry[];
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus | null;
  readonly resolutionStatus: MissionBrief["resolutionStatus"] | null;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace | null;
  readonly missingArtifacts: readonly string[];
}

export interface MissionLogFeatureFlag {
  readonly enabled: boolean;
}

export class MissionLog {
  readonly enabled: boolean;

  constructor(
    featureFlag: MissionLogFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  normalize(timeline: MissionTimelineModel): MissionLogModel | null {
    if (!this.enabled) {
      return null;
    }

    assertTimeline(timeline);

    return Object.freeze({
      missionId: timeline.missionId,
      entries: Object.freeze([...timeline.events]),
      authorityDecision: timeline.authorityDecision,
      validationStatus: timeline.validationStatus,
      resolutionStatus: timeline.resolutionStatus,
      pipelineTrace: timeline.pipelineTrace,
      missingArtifacts: timeline.missingArtifacts,
    });
  }
}

function assertTimeline(timeline: MissionTimelineModel): void {
  if (
    !isRecord(timeline) ||
    typeof timeline.missionId !== "string" ||
    timeline.missionId.length === 0 ||
    !Array.isArray(timeline.events) ||
    !Array.isArray(timeline.missingArtifacts)
  ) {
    throw new Error(
      "MLOG-001: MissionLog requires a valid mission timeline.",
    );
  }

  timeline.events.forEach((event, index) => {
    if (!isRecord(event) || event.missionId !== timeline.missionId) {
      throw new Error(
        `MLOG-002: Mission log event mismatch at index ${index}.`,
      );
    }
  });
}

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

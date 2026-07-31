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
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";

export interface MissionTimelineBuildInput {
  readonly missionId: string;
  readonly events: readonly MissionEvent[];
}

export interface MissionTimelineModel {
  readonly missionId: string;
  readonly events: readonly MissionEvent[];
  readonly firstOccurredAt: string | null;
  readonly lastOccurredAt: string | null;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus | null;
  readonly resolutionStatus: MissionBrief["resolutionStatus"] | null;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace | null;
  readonly missingArtifacts: readonly string[];
}

export interface MissionTimelineFeatureFlag {
  readonly enabled: boolean;
}

export class MissionTimeline {
  readonly enabled: boolean;

  constructor(
    featureFlag: MissionTimelineFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  build(input: MissionTimelineBuildInput): MissionTimelineModel | null {
    if (!this.enabled) {
      return null;
    }

    assertTimelineInput(input);

    const events = Object.freeze([...input.events]);
    const first = events[0] ?? null;
    const latest = events[events.length - 1] ?? null;

    return Object.freeze({
      missionId: input.missionId,
      events,
      firstOccurredAt: first?.occurredAt ?? null,
      lastOccurredAt: latest?.occurredAt ?? null,
      authorityDecision: latest?.authorityDecision ?? null,
      validationStatus: latest?.validationStatus ?? null,
      resolutionStatus: latest?.resolutionStatus ?? null,
      pipelineTrace: latest?.pipelineTrace ?? null,
      missingArtifacts:
        latest?.missingArtifacts ?? Object.freeze([]),
    });
  }
}

function assertTimelineInput(input: MissionTimelineBuildInput): void {
  if (
    !isRecord(input) ||
    !isMetadataToken(input.missionId) ||
    !Array.isArray(input.events)
  ) {
    throw new Error(
      "MTL-001: MissionTimeline requires a missionId and event array.",
    );
  }

  let previous: MissionEvent | undefined;
  let authorityDecision:
    | AuthorityResolutionDecision
    | null
    | undefined;
  let pipelineTrace: NovaOrchestrationPipelineTrace | undefined;

  input.events.forEach((event, index) => {
    if (
      !isRecord(event) ||
      event.missionId !== input.missionId ||
      (
        previous !== undefined &&
        (
          event.sequence <= previous.sequence ||
          event.occurredAt < previous.occurredAt
        )
      )
    ) {
      throw new Error(
        `MTL-002: Mission timeline event order is invalid at index ${index}.`,
      );
    }

    if (index === 0) {
      authorityDecision = event.authorityDecision;
      pipelineTrace = event.pipelineTrace;
    } else if (
      event.authorityDecision !== authorityDecision ||
      event.pipelineTrace !== pipelineTrace
    ) {
      throw new Error(
        "MTL-003: Mission timeline traceability references must remain stable.",
      );
    }

    previous = event;
  });
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

import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import {
  assertRuntimeResponseSerializable,
} from "./runtime-response-adapter.js";

export interface MissionEventProgressSnapshot {
  readonly completed: number;
  readonly total: number;
}

export interface MissionEventInput {
  readonly eventId: string;
  readonly missionId: string;
  readonly sequence: number;
  readonly occurredAt: string;
  readonly type: string;
  readonly level: string;
  readonly message: string;
  readonly payload: unknown;
  readonly progress?: MissionEventProgressSnapshot;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly resolutionStatus: MissionBrief["resolutionStatus"];
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
}

export interface MissionEvent extends MissionEventInput {
  readonly progress?: MissionEventProgressSnapshot;
}

export interface MissionEventPublisherFeatureFlag {
  readonly enabled: boolean;
}

export class MissionEventPublisher {
  readonly enabled: boolean;

  constructor(
    featureFlag: MissionEventPublisherFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  publish(
    inputs: readonly MissionEventInput[],
  ): readonly MissionEvent[] | null {
    if (!this.enabled) {
      return null;
    }

    assertInputs(inputs);

    return Object.freeze(
      [...inputs]
        .sort((left, right) => left.sequence - right.sequence)
        .map((input) =>
          Object.freeze({
            ...input,
            progress:
              input.progress === undefined
                ? undefined
                : Object.freeze({ ...input.progress }),
            missingArtifacts: Object.freeze([
              ...input.missingArtifacts,
            ]),
          }),
        ),
    );
  }
}

function assertInputs(inputs: readonly MissionEventInput[]): void {
  if (!Array.isArray(inputs)) {
    throw new Error(
      "MEP-001: MissionEventPublisher requires an event array.",
    );
  }

  const eventIds = new Set<string>();
  const sequences = new Set<number>();

  inputs.forEach((input, index) => {
    if (
      !isRecord(input) ||
      !isMetadataToken(input.eventId) ||
      !isMetadataToken(input.missionId) ||
      !Number.isInteger(input.sequence) ||
      input.sequence < 0 ||
      !isCanonicalTimestamp(input.occurredAt) ||
      !isMetadataToken(input.type) ||
      !isMetadataToken(input.level) ||
      !isNormalizedText(input.message) ||
      !isRecord(input.pipelineTrace) ||
      input.pipelineTrace.missionId !== input.missionId ||
      !isValidationStatus(input.validationStatus) ||
      !isResolutionStatus(input.resolutionStatus) ||
      !Array.isArray(input.missingArtifacts) ||
      !input.missingArtifacts.every(isMetadataToken) ||
      !isValidProgress(input.progress)
    ) {
      throw new Error(
        `MEP-002: Invalid mission event metadata at index ${index}.`,
      );
    }

    if (eventIds.has(input.eventId) || sequences.has(input.sequence)) {
      throw new Error(
        "MEP-003: Mission event identifiers and sequences must be unique.",
      );
    }

    eventIds.add(input.eventId);
    sequences.add(input.sequence);
    assertRuntimeResponseSerializable(input.payload);
  });
}

function isValidProgress(
  progress: MissionEventProgressSnapshot | undefined,
): boolean {
  return (
    progress === undefined ||
    (
      isRecord(progress) &&
      typeof progress.completed === "number" &&
      Number.isFinite(progress.completed) &&
      progress.completed >= 0 &&
      typeof progress.total === "number" &&
      Number.isFinite(progress.total) &&
      progress.total > 0 &&
      progress.completed <= progress.total
    )
  );
}

function isValidationStatus(
  value: unknown,
): value is NovaOrchestrationValidationStatus {
  return value === "VALID" || value === "INVALID";
}

function isResolutionStatus(
  value: unknown,
): value is MissionBrief["resolutionStatus"] {
  return (
    value === "RESOLVED" ||
    value === "PARTIAL" ||
    value === "UNRESOLVED"
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

function isMetadataToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isNormalizedText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

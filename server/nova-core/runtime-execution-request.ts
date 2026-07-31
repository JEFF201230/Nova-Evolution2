import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationPreparation,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionGateDecision,
} from "./runtime-execution-gate.js";

export interface RuntimeExecutionContext {
  readonly missionId: string;
  readonly objective: string | null;
  readonly programId: string | null;
  readonly capability: string | null;
  readonly epic: string | null;
  readonly feature: string | null;
  readonly lot: string | null;
  readonly waveId: string | null;
  readonly constraints: readonly string[];
  readonly dependencies: readonly string[];
  readonly requiredKnowledge: MissionBrief["requiredKnowledge"];
  readonly requiredArtifacts: readonly string[];
  readonly acceptanceCriteria: readonly string[];
}

export interface RuntimeExecutionRequest {
  readonly requestId: string;
  readonly missionBrief: MissionBrief;
  readonly executionContext: RuntimeExecutionContext;
  readonly authorityDecision: NonNullable<
    RuntimeExecutionGateDecision["authorityDecision"]
  >;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly requestedAt: string;
}

export interface RuntimeExecutionRequestBuildInput {
  readonly requestId: string;
  readonly requestedAt: string;
  readonly gateDecision: RuntimeExecutionGateDecision;
  readonly preparation: NovaOrchestrationPreparation;
}

export interface RuntimeExecutionRequestFeatureFlag {
  readonly enabled: boolean;
}

export class RuntimeExecutionRequestBuilder {
  readonly enabled: boolean;

  constructor(
    featureFlag: RuntimeExecutionRequestFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  build(
    input: RuntimeExecutionRequestBuildInput,
  ): RuntimeExecutionRequest | null {
    if (!this.enabled) {
      return null;
    }

    assertBuildMetadata(input);

    if (
      !input.gateDecision.executionAllowed ||
      input.gateDecision.validationStatus !== "VALID"
    ) {
      return null;
    }

    assertAuthorizedDecision(input.gateDecision);
    assertMatchingPreparation(
      input.gateDecision,
      input.preparation,
    );

    const missionBrief = input.preparation.missionBrief;

    return Object.freeze({
      requestId: input.requestId,
      missionBrief,
      executionContext: createExecutionContext(missionBrief),
      authorityDecision: input.gateDecision.authorityDecision,
      validationStatus: input.gateDecision.validationStatus,
      pipelineTrace: input.gateDecision.pipelineTrace,
      requestedAt: input.requestedAt,
    });
  }
}

function createExecutionContext(
  missionBrief: MissionBrief,
): RuntimeExecutionContext {
  return Object.freeze({
    missionId: missionBrief.missionId,
    objective: missionBrief.objective,
    programId: missionBrief.program?.id ?? null,
    capability: missionBrief.capability,
    epic: missionBrief.epic,
    feature: missionBrief.feature,
    lot: missionBrief.lot,
    waveId: missionBrief.wave?.id ?? null,
    constraints: copy(missionBrief.constraints),
    dependencies: copy(missionBrief.dependencies),
    requiredKnowledge: Object.freeze([
      ...missionBrief.requiredKnowledge,
    ]),
    requiredArtifacts: copy(missionBrief.requiredArtifacts),
    acceptanceCriteria: copy(missionBrief.acceptanceCriteria),
  });
}

function assertBuildMetadata(
  input: RuntimeExecutionRequestBuildInput,
): void {
  if (!isRecord(input)) {
    throw new Error(
      "RER-001: RuntimeExecutionRequestBuilder requires structured input.",
    );
  }

  if (!isMetadataToken(input.requestId)) {
    throw new Error(
      "RER-002: RuntimeExecutionRequestBuilder requires a normalized requestId.",
    );
  }

  if (!isCanonicalTimestamp(input.requestedAt)) {
    throw new Error(
      "RER-003: RuntimeExecutionRequestBuilder requires a canonical requestedAt timestamp.",
    );
  }

  if (!isRecord(input.gateDecision)) {
    throw new Error(
      "RER-004: RuntimeExecutionRequestBuilder requires a gate decision.",
    );
  }
}

function assertAuthorizedDecision(
  decision: RuntimeExecutionGateDecision,
): asserts decision is RuntimeExecutionGateDecision & {
  readonly authorityDecision: NonNullable<
    RuntimeExecutionGateDecision["authorityDecision"]
  >;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly resolutionStatus: "RESOLVED";
} {
  if (
    decision.authorityDecision === null ||
    decision.pipelineTrace === null ||
    decision.resolutionStatus !== "RESOLVED" ||
    decision.missingArtifacts.length > 0 ||
    decision.blockingReasons.length > 0
  ) {
    throw new Error(
      "RER-005: The positive gate decision is internally inconsistent.",
    );
  }
}

function assertMatchingPreparation(
  decision: RuntimeExecutionGateDecision & {
    readonly authorityDecision: NonNullable<
      RuntimeExecutionGateDecision["authorityDecision"]
    >;
    readonly pipelineTrace: NovaOrchestrationPipelineTrace;
    readonly resolutionStatus: "RESOLVED";
  },
  preparation: NovaOrchestrationPreparation,
): void {
  if (
    !isRecord(preparation) ||
    preparation.authorityDecision !== decision.authorityDecision ||
    preparation.pipelineTrace !== decision.pipelineTrace ||
    preparation.validationStatus !== decision.validationStatus ||
    preparation.resolutionStatus !== decision.resolutionStatus ||
    !sameValues(
      preparation.missingArtifacts,
      decision.missingArtifacts,
    ) ||
    preparation.missionBrief.authorityDecision !==
      decision.authorityDecision ||
    preparation.missionBrief.resolutionStatus !==
      decision.resolutionStatus
  ) {
    throw new Error(
      "RER-006: Gate decision and bridge preparation do not match.",
    );
  }
}

function sameValues(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function copy(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

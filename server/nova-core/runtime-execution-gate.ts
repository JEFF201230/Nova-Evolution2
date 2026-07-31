import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationPreparation,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";

export interface RuntimeExecutionGateDecision {
  readonly executionAllowed: boolean;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly blockingReasons: readonly string[];
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly resolutionStatus: MissionBrief["resolutionStatus"] | null;
  readonly missingArtifacts: readonly string[];
  readonly pipelineTrace: NovaOrchestrationPipelineTrace | null;
}

export interface RuntimeExecutionGateFeatureFlag {
  readonly enabled: boolean;
}

export class RuntimeExecutionGate {
  readonly enabled: boolean;

  constructor(
    featureFlag: RuntimeExecutionGateFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  evaluate(
    preparation: NovaOrchestrationPreparation | null | undefined,
  ): RuntimeExecutionGateDecision | null {
    if (!this.enabled) {
      return null;
    }

    if (preparation === null || preparation === undefined) {
      return createDecision({
        blockingReasons: ["MISSION_BRIEF_ABSENT"],
        authorityDecision: null,
        resolutionStatus: null,
        missingArtifacts: Object.freeze([]),
        pipelineTrace: null,
      });
    }

    const blockingReasons = new Set<string>();
    const missionBrief = preparation.missionBrief;

    if (!isRecord(missionBrief)) {
      blockingReasons.add("MISSION_BRIEF_ABSENT");
    } else {
      validateBriefCollections(missionBrief, blockingReasons);
      validatePreparationConsistency(
        preparation,
        missionBrief,
        blockingReasons,
      );
    }

    if (!preparation.executionReady) {
      blockingReasons.add("BRIDGE_NOT_EXECUTION_READY");
    }

    if (preparation.validationStatus !== "VALID") {
      blockingReasons.add("BRIDGE_VALIDATION_INVALID");
    }

    if (preparation.authorityDecision === null) {
      blockingReasons.add("AUTHORITY_DECISION_ABSENT");
    } else if (
      preparation.authorityDecision.resolutionStatus !== "RESOLVED"
    ) {
      blockingReasons.add("AUTHORITY_DECISION_UNRESOLVED");
    }

    if (preparation.resolutionStatus !== "RESOLVED") {
      blockingReasons.add("RESOLUTION_STATUS_INCOMPATIBLE");
    }

    for (const artifact of preparation.missingArtifacts) {
      blockingReasons.add(`MISSING_ARTIFACT:${artifact}`);
    }

    return createDecision({
      blockingReasons: [...blockingReasons],
      authorityDecision: preparation.authorityDecision,
      resolutionStatus: preparation.resolutionStatus,
      missingArtifacts: preparation.missingArtifacts,
      pipelineTrace: preparation.pipelineTrace,
    });
  }
}

function validateBriefCollections(
  missionBrief: MissionBrief,
  blockingReasons: Set<string>,
): void {
  if (
    !Array.isArray(missionBrief.constraints) ||
    !missionBrief.constraints.every(isNormalizedText)
  ) {
    blockingReasons.add("CONSTRAINTS_INVALID");
  }

  if (
    !Array.isArray(missionBrief.dependencies) ||
    !missionBrief.dependencies.every(isMetadataToken)
  ) {
    blockingReasons.add("DEPENDENCIES_INVALID");
  }
}

function validatePreparationConsistency(
  preparation: NovaOrchestrationPreparation,
  missionBrief: MissionBrief,
  blockingReasons: Set<string>,
): void {
  if (preparation.authorityDecision !== missionBrief.authorityDecision) {
    blockingReasons.add("AUTHORITY_DECISION_MISMATCH");
  }

  if (preparation.resolutionStatus !== missionBrief.resolutionStatus) {
    blockingReasons.add("RESOLUTION_STATUS_MISMATCH");
  }

  if (
    !sameValues(
      preparation.missingArtifacts,
      missionBrief.missingArtifacts,
    )
  ) {
    blockingReasons.add("MISSING_ARTIFACTS_MISMATCH");
  }

  if (
    preparation.pipelineTrace.missionId !== missionBrief.missionId
  ) {
    blockingReasons.add("PIPELINE_TRACE_MISSION_MISMATCH");
  }

  if (
    !sameValues(
      preparation.pipelineTrace.dependencyIds,
      missionBrief.dependencies,
    )
  ) {
    blockingReasons.add("DEPENDENCY_TRACE_INCOMPLETE");
  }

  if (
    !sameValues(
      preparation.pipelineTrace.requiredArtifactIds,
      missionBrief.requiredArtifacts,
    ) ||
    !sameValues(
      preparation.pipelineTrace.missingArtifactIds,
      missionBrief.missingArtifacts,
    )
  ) {
    blockingReasons.add("ARTIFACT_TRACE_INCOMPLETE");
  }
}

function createDecision(fields: {
  readonly blockingReasons: readonly string[];
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly resolutionStatus: MissionBrief["resolutionStatus"] | null;
  readonly missingArtifacts: readonly string[];
  readonly pipelineTrace: NovaOrchestrationPipelineTrace | null;
}): RuntimeExecutionGateDecision {
  const blockingReasons = Object.freeze(
    [...new Set(fields.blockingReasons)].sort(),
  );
  const executionAllowed = blockingReasons.length === 0;

  return Object.freeze({
    executionAllowed,
    validationStatus: executionAllowed ? "VALID" : "INVALID",
    blockingReasons,
    authorityDecision: fields.authorityDecision,
    resolutionStatus: fields.resolutionStatus,
    missingArtifacts: fields.missingArtifacts,
    pipelineTrace: fields.pipelineTrace,
  });
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

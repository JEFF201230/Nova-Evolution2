import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import {
  MissionPipeline,
  type MissionPipelineRequest,
} from "./mission-pipeline.js";

export type NovaOrchestrationValidationStatus = "VALID" | "INVALID";

export interface NovaOrchestrationPipelineTrace {
  readonly missionId: string;
  readonly authoritativeSourceIds: readonly string[];
  readonly supportingSourceIds: readonly string[];
  readonly rejectedSourceIds: readonly string[];
  readonly knowledgeSourceIds: readonly string[];
  readonly knowledgeSourcePaths: readonly string[];
  readonly dependencyIds: readonly string[];
  readonly requiredArtifactIds: readonly string[];
  readonly missingArtifactIds: readonly string[];
}

export interface NovaOrchestrationPreparation {
  readonly missionBrief: MissionBrief;
  readonly executionReady: boolean;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly resolutionStatus: MissionBrief["resolutionStatus"];
  readonly missingArtifacts: readonly string[];
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
}

export interface NovaOrchestrationBridgeFeatureFlag {
  readonly enabled: boolean;
}

export interface NovaOrchestrationBridgeComponents {
  readonly missionPipeline: Pick<MissionPipeline, "prepare">;
}

export class NovaOrchestrationBridge {
  readonly enabled: boolean;
  private readonly components: NovaOrchestrationBridgeComponents;

  constructor(
    featureFlag: NovaOrchestrationBridgeFeatureFlag = {
      enabled: false,
    },
    components?: NovaOrchestrationBridgeComponents,
  ) {
    this.enabled = featureFlag.enabled === true;
    this.components =
      components ?? {
        missionPipeline: new MissionPipeline({
          enabled: this.enabled,
        }),
      };
  }

  prepare(
    request: MissionPipelineRequest,
  ): NovaOrchestrationPreparation | null {
    if (!this.enabled) {
      return null;
    }

    const missionBrief =
      this.components.missionPipeline.prepare(request);

    if (missionBrief === null) {
      throw new Error(
        "NOB-001: MissionPipeline returned no brief in an enabled NovaOrchestrationBridge.",
      );
    }

    const executionReady = isExecutionReady(
      request,
      missionBrief,
    );

    return Object.freeze({
      missionBrief,
      executionReady,
      validationStatus: executionReady ? "VALID" : "INVALID",
      authorityDecision: missionBrief.authorityDecision,
      resolutionStatus: missionBrief.resolutionStatus,
      missingArtifacts: copy(missionBrief.missingArtifacts),
      pipelineTrace: createPipelineTrace(missionBrief),
    });
  }
}

function isExecutionReady(
  request: MissionPipelineRequest,
  missionBrief: MissionBrief,
): boolean {
  return (
    missionBrief.missionId === request.mission.id &&
    missionBrief.objective !== null &&
    missionBrief.acceptanceCriteria.length > 0 &&
    missionBrief.missingArtifacts.length === 0 &&
    missionBrief.resolutionStatus === "RESOLVED" &&
    missionBrief.authorityDecision !== null &&
    missionBrief.authorityDecision.missionId ===
      missionBrief.missionId &&
    missionBrief.authorityDecision.resolutionStatus === "RESOLVED"
  );
}

function createPipelineTrace(
  missionBrief: MissionBrief,
): NovaOrchestrationPipelineTrace {
  const authorityDecision = missionBrief.authorityDecision;

  return Object.freeze({
    missionId: missionBrief.missionId,
    authoritativeSourceIds: copy(
      authorityDecision?.authoritativeSources.map(
        (source) => source.id,
      ) ?? [],
    ),
    supportingSourceIds: copy(
      authorityDecision?.supportingSources.map(
        (source) => source.id,
      ) ?? [],
    ),
    rejectedSourceIds: copy(
      authorityDecision?.rejectedSources.map(
        (source) => source.id,
      ) ?? [],
    ),
    knowledgeSourceIds: copy(
      missionBrief.requiredKnowledge.map((source) => source.id),
    ),
    knowledgeSourcePaths: copy(
      missionBrief.requiredKnowledge.map((source) => source.path),
    ),
    dependencyIds: copy(missionBrief.dependencies),
    requiredArtifactIds: copy(missionBrief.requiredArtifacts),
    missingArtifactIds: copy(missionBrief.missingArtifacts),
  });
}

function copy(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

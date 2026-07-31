import {
  AuthorityResolver,
  type AuthorityResolutionRequest,
  type AuthoritySourceDeclaration,
} from "./authority-resolver.js";
import {
  CerebrauKnowledgeAdapter,
  type CerebrauKnowledgeIndexInput,
} from "./cerebrau-knowledge-adapter.js";
import {
  MissionBriefBuilder,
  type MissionBrief,
  type MissionBriefSourceContext,
} from "./mission-brief-builder.js";
import {
  MissionContextBuilder,
  type MissionContextBuildRequest,
  type MissionContextMissionInput,
} from "./mission-context-builder.js";
import {
  NovaUxKnowledgeAdapter,
  type NovaUxKnowledgeIndexInput,
} from "./nova-ux-knowledge-adapter.js";
import {
  ProgramKnowledgeResolver,
  type ProgramKnowledgeIndexMetadata,
  type ProgramKnowledgeResolutionRequest,
} from "./program-knowledge-resolver.js";

export type MissionPipelineKnowledgeIndex =
  CerebrauKnowledgeIndexInput &
  NovaUxKnowledgeIndexInput &
  ProgramKnowledgeIndexMetadata;

export interface MissionPipelineMissionInput
  extends MissionContextMissionInput {
  readonly title?: string;
}

export interface MissionPipelineRequest {
  readonly mission: MissionPipelineMissionInput;
  readonly knowledgeIndex: MissionPipelineKnowledgeIndex;
  readonly authorityDomain: string;
  readonly authorityDeclarations: readonly AuthoritySourceDeclaration[];
  readonly programId?: string;
  readonly lotId?: string;
  readonly waveId?: string;
  readonly requiredArtifacts?: readonly string[];
}

export interface MissionPipelineFeatureFlag {
  readonly enabled: boolean;
}

export interface MissionPipelineComponents {
  readonly cerebrauKnowledgeAdapter: Pick<
    CerebrauKnowledgeAdapter,
    "adapt"
  >;
  readonly novaUxKnowledgeAdapter: Pick<
    NovaUxKnowledgeAdapter,
    "adapt"
  >;
  readonly authorityResolver: Pick<AuthorityResolver, "resolve">;
  readonly programKnowledgeResolver: Pick<
    ProgramKnowledgeResolver,
    "resolve"
  >;
  readonly missionContextBuilder: Pick<MissionContextBuilder, "build">;
  readonly missionBriefBuilder: Pick<MissionBriefBuilder, "build">;
}

export class MissionPipeline {
  readonly enabled: boolean;
  private readonly components: MissionPipelineComponents;

  constructor(
    featureFlag: MissionPipelineFeatureFlag = { enabled: false },
    components?: MissionPipelineComponents,
  ) {
    this.enabled = featureFlag.enabled === true;
    this.components =
      components ?? createDefaultComponents(this.enabled);
  }

  prepare(request: MissionPipelineRequest): MissionBrief | null {
    if (!this.enabled) {
      return null;
    }

    const cerebrauKnowledge =
      this.components.cerebrauKnowledgeAdapter.adapt(
        request.knowledgeIndex,
      );
    const novaUxKnowledge =
      this.components.novaUxKnowledgeAdapter.adapt(
        request.knowledgeIndex,
      );
    const authorityRequest: AuthorityResolutionRequest = {
      missionId: request.mission.id,
      authorityDomain: request.authorityDomain,
      cerebrauKnowledge,
      novaUxKnowledge,
      authorityDeclarations: request.authorityDeclarations,
    };
    const authorityDecision =
      this.components.authorityResolver.resolve(authorityRequest);

    if (authorityDecision === null) {
      throw new Error(
        "MP-001: AuthorityResolver returned no decision in an enabled MissionPipeline.",
      );
    }

    const programRequest: ProgramKnowledgeResolutionRequest = {
      missionId: request.mission.id,
      programId: request.programId,
      lotId: request.lotId,
      waveId: request.waveId,
      requiredArtifacts: request.requiredArtifacts,
      missingArtifacts: request.mission.missingArtifacts,
      knowledgeIndex: request.knowledgeIndex,
      cerebrauKnowledge,
      novaUxKnowledge,
      authorityDecision,
    };
    const programKnowledge =
      this.components.programKnowledgeResolver.resolve(programRequest);

    if (programKnowledge === null) {
      throw new Error(
        "MP-002: ProgramKnowledgeResolver returned no result in an enabled MissionPipeline.",
      );
    }

    const contextRequest: MissionContextBuildRequest = {
      mission: request.mission,
      cerebrauKnowledge,
      novaUxKnowledge,
      authorityDecision,
      programKnowledge,
    };
    const missionContext =
      this.components.missionContextBuilder.build(contextRequest);

    if (missionContext === null) {
      throw new Error(
        "MP-003: MissionContextBuilder returned no context in an enabled MissionPipeline.",
      );
    }

    const briefContext: MissionBriefSourceContext =
      request.mission.title === undefined
        ? missionContext
        : {
            ...missionContext,
            mission: {
              ...missionContext.mission,
              title: request.mission.title,
            },
          };
    const missionBrief =
      this.components.missionBriefBuilder.build(briefContext);

    if (missionBrief === null) {
      throw new Error(
        "MP-004: MissionBriefBuilder returned no brief in an enabled MissionPipeline.",
      );
    }

    return missionBrief;
  }
}

function createDefaultComponents(
  enabled: boolean,
): MissionPipelineComponents {
  return Object.freeze({
    cerebrauKnowledgeAdapter: new CerebrauKnowledgeAdapter(),
    novaUxKnowledgeAdapter: new NovaUxKnowledgeAdapter({ enabled }),
    authorityResolver: new AuthorityResolver({ enabled }),
    programKnowledgeResolver: new ProgramKnowledgeResolver({ enabled }),
    missionContextBuilder: new MissionContextBuilder({ enabled }),
    missionBriefBuilder: new MissionBriefBuilder({ enabled }),
  });
}

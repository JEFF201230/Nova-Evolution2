import {
  ProgramKnowledgeResolver,
  ProgramKnowledgeResolution,
  ProgramKnowledgeResolutionStatus,
  type ProgramKnowledgeResolutionRequest,
} from "./program-knowledge-resolver.js";
import {
  UxKnowledgeResolver,
  type MissionRequest as UxKnowledgeMissionRequest,
  type UxKnowledgeResolution,
} from "./ux-knowledge-resolver.js";

type MissionContextAuthorityDecision =
  ProgramKnowledgeResolution["authorityDecision"];
type MissionContextKnowledgeSource =
  UxKnowledgeResolution["authoritativeSources"][number];

export interface MissionContextMissionInput {
  readonly id: string;
  readonly objective?: string;
  readonly constraints?: readonly string[];
  readonly acceptanceCriteria?: readonly string[];
  readonly reusedArtifacts?: readonly string[];
  readonly missingArtifacts?: readonly string[];
}

export interface MissionContextMission {
  readonly id: string;
  readonly objective: string | null;
}

export interface MissionContextBuildRequest {
  readonly mission: MissionContextMissionInput;
  readonly programKnowledge:
    | ProgramKnowledgeResolutionRequest
    | ProgramKnowledgeResolution;
  readonly uxKnowledge?:
    | UxKnowledgeMissionRequest
    | UxKnowledgeResolution;
  /**
   * Compatibility-only fields accepted from the certified MissionPipeline.
   * MissionContextBuilder never reads adapter output or direct authority data.
   */
  readonly cerebrauKnowledge?: ProgramKnowledgeResolutionRequest["cerebrauKnowledge"];
  readonly novaUxKnowledge?: ProgramKnowledgeResolutionRequest["novaUxKnowledge"];
  readonly authorityDecision?: MissionContextAuthorityDecision;
}

export interface MissionContext {
  readonly mission: MissionContextMission;
  readonly program: ProgramKnowledgeResolution["program"];
  readonly capability: string | null;
  readonly epic: string | null;
  readonly feature: string | null;
  readonly lot: string | null;
  readonly wave: ProgramKnowledgeResolution["wave"];
  readonly authority: string | null;
  readonly authorityDecision: MissionContextAuthorityDecision;
  readonly gates: readonly string[];
  readonly prerequisites: readonly string[];
  readonly dependencies: readonly string[];
  readonly knowledgeSources: readonly MissionContextKnowledgeSource[];
  readonly reusedArtifacts: readonly string[];
  readonly missingArtifacts: readonly string[];
  readonly constraints: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly resolutionStatus: ProgramKnowledgeResolutionStatus;
}

export interface MissionContextBuilderFeatureFlag {
  readonly enabled: boolean;
}

interface ProgramKnowledgeResolverPort {
  resolve(
    request: ProgramKnowledgeResolutionRequest,
  ): ProgramKnowledgeResolution | null;
}

interface UxKnowledgeResolverPort {
  resolve(
    request: UxKnowledgeMissionRequest,
  ): UxKnowledgeResolution | null;
}

export interface MissionContextBuilderDependencies {
  readonly programKnowledgeResolver: ProgramKnowledgeResolverPort;
  readonly uxKnowledgeResolver: UxKnowledgeResolverPort;
}

export class MissionContextBuilder {
  readonly enabled: boolean;

  private readonly programKnowledgeResolver: ProgramKnowledgeResolverPort;
  private readonly uxKnowledgeResolver: UxKnowledgeResolverPort;

  constructor(
    featureFlag: MissionContextBuilderFeatureFlag = { enabled: false },
    dependencies?: MissionContextBuilderDependencies,
  ) {
    this.enabled = featureFlag.enabled === true;
    this.programKnowledgeResolver =
      dependencies?.programKnowledgeResolver ??
      new ProgramKnowledgeResolver({ enabled: this.enabled });
    this.uxKnowledgeResolver =
      dependencies?.uxKnowledgeResolver ??
      new UxKnowledgeResolver({ enabled: this.enabled });
  }

  build(request: MissionContextBuildRequest): MissionContext | null {
    if (!this.enabled) {
      return null;
    }

    assertBuildRequest(request);

    const programKnowledge = resolveProgramKnowledge(
      this.programKnowledgeResolver,
      request.programKnowledge,
    );
    const uxKnowledge = resolveUxKnowledge(
      this.uxKnowledgeResolver,
      request.uxKnowledge,
    );
    const knowledgeSources = resolveKnowledgeSources(
      programKnowledge.authorityDecision,
      uxKnowledge,
    );
    const acceptedSourceIds = new Set(
      knowledgeSources.map((source) => source.id),
    );
    const rejectedSourceIds = new Set(
      [
        ...(programKnowledge.authorityDecision?.rejectedSources ?? []),
        ...(uxKnowledge?.rejectedSources ?? []),
      ].map((source) => source.id),
    );
    const dependencies = resolveDependencies(
      programKnowledge,
      uxKnowledge,
      acceptedSourceIds,
      rejectedSourceIds,
    );
    const reusedArtifacts = uniqueMetadata([
      ...(request.mission.reusedArtifacts ?? []),
      ...programKnowledge.requiredDocumentIds,
      ...programKnowledge.serviceIds,
      ...programKnowledge.pdsIds,
    ]);
    const missingArtifacts = uniqueMetadata([
      ...(request.mission.missingArtifacts ?? []),
      ...programKnowledge.missingArtifacts,
      ...(uxKnowledge?.missingArtifacts ?? []),
    ]);

    return Object.freeze({
      mission: Object.freeze({
        id: request.mission.id,
        objective: request.mission.objective ?? null,
      }),
      program: programKnowledge.program,
      capability: programKnowledge.capability,
      epic: programKnowledge.epic,
      feature: programKnowledge.feature,
      lot: programKnowledge.lot,
      wave: programKnowledge.wave,
      authority:
        programKnowledge.authorityDecision?.authorityDomain ?? null,
      authorityDecision: programKnowledge.authorityDecision,
      gates: uniqueMetadata(programKnowledge.gates),
      prerequisites: uniqueMetadata(programKnowledge.prerequisites),
      dependencies,
      knowledgeSources,
      reusedArtifacts,
      missingArtifacts,
      constraints: uniqueText(request.mission.constraints),
      acceptanceCriteria: uniqueText(
        request.mission.acceptanceCriteria,
      ),
      resolutionStatus: programKnowledge.resolutionStatus,
    });
  }
}

function resolveProgramKnowledge(
  resolver: ProgramKnowledgeResolverPort,
  input: ProgramKnowledgeResolutionRequest | ProgramKnowledgeResolution,
): ProgramKnowledgeResolution {
  if (isProgramKnowledgeResolution(input)) {
    return input;
  }

  const resolution = resolver.resolve(input);

  if (resolution === null) {
    throw new Error(
      "MCB-006: ProgramKnowledgeResolver returned no result while MissionContextBuilder is enabled.",
    );
  }

  return resolution;
}

function resolveUxKnowledge(
  resolver: UxKnowledgeResolverPort,
  input: UxKnowledgeMissionRequest | UxKnowledgeResolution | undefined,
): UxKnowledgeResolution | null {
  if (input === undefined) {
    return null;
  }

  if (isUxKnowledgeResolution(input)) {
    return input;
  }

  const resolution = resolver.resolve(input);

  if (resolution === null) {
    throw new Error(
      "MCB-007: UxKnowledgeResolver returned no result while MissionContextBuilder is enabled.",
    );
  }

  return resolution;
}

function resolveKnowledgeSources(
  authorityDecision: MissionContextAuthorityDecision,
  uxKnowledge: UxKnowledgeResolution | null,
): readonly MissionContextKnowledgeSource[] {
  const rejectedSourceIds = new Set(
    [
      ...(authorityDecision?.rejectedSources ?? []),
      ...(uxKnowledge?.rejectedSources ?? []),
    ].map((source) => source.id),
  );
  const sources = new Map<string, MissionContextKnowledgeSource>();

  for (const source of [
    ...(authorityDecision?.authoritativeSources ?? []),
    ...(authorityDecision?.supportingSources ?? []),
    ...(uxKnowledge?.authoritativeSources ?? []),
    ...(uxKnowledge?.supportingSources ?? []),
  ]) {
    if (!rejectedSourceIds.has(source.id) && !sources.has(source.id)) {
      sources.set(source.id, source);
    }
  }

  return Object.freeze(
    [...sources.values()].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
  );
}

function resolveDependencies(
  programKnowledge: ProgramKnowledgeResolution,
  uxKnowledge: UxKnowledgeResolution | null,
  acceptedSourceIds: ReadonlySet<string>,
  rejectedSourceIds: ReadonlySet<string>,
): readonly string[] {
  const uxDependencies = (uxKnowledge?.dependencies ?? [])
    .filter((dependency) =>
      acceptedSourceIds.has(dependency.documentId),
    )
    .map((dependency) => dependency.dependsOn);

  return Object.freeze(
    uniqueMetadata([
      ...programKnowledge.dependencies,
      ...uxDependencies,
    ]).filter((dependency) => !rejectedSourceIds.has(dependency)),
  );
}

function uniqueMetadata(
  values: readonly string[] | undefined,
): readonly string[] {
  return Object.freeze(
    [...new Set((values ?? []).filter(isMetadataToken))].sort(),
  );
}

function uniqueText(
  values: readonly string[] | undefined,
): readonly string[] {
  return Object.freeze(
    [...new Set((values ?? []).filter(isNormalizedText))],
  );
}

function assertBuildRequest(request: MissionContextBuildRequest): void {
  if (!isRecord(request)) {
    throw new Error(
      "MCB-001: MissionContextBuilder requires a structured build request.",
    );
  }

  if (!isRecord(request.mission) || !isMetadataToken(request.mission.id)) {
    throw new Error(
      "MCB-002: MissionContextBuilder requires a normalized mission.",
    );
  }

  if (
    request.mission.objective !== undefined &&
    !isNormalizedText(request.mission.objective)
  ) {
    throw new Error(
      "MCB-003: MissionContextBuilder requires a normalized objective.",
    );
  }

  for (const [field, values] of [
    ["constraints", request.mission.constraints],
    ["acceptanceCriteria", request.mission.acceptanceCriteria],
  ] as const) {
    if (
      values !== undefined &&
      (!Array.isArray(values) || !values.every(isNormalizedText))
    ) {
      throw new Error(
        `MCB-004: MissionContextBuilder requires normalized ${field}.`,
      );
    }
  }

  for (const [field, values] of [
    ["reusedArtifacts", request.mission.reusedArtifacts],
    ["missingArtifacts", request.mission.missingArtifacts],
  ] as const) {
    if (
      values !== undefined &&
      (!Array.isArray(values) || !values.every(isMetadataToken))
    ) {
      throw new Error(
        `MCB-005: MissionContextBuilder requires normalized ${field}.`,
      );
    }
  }

  if (!isRecord(request.programKnowledge)) {
    throw new Error(
      "MCB-006: MissionContextBuilder requires ProgramKnowledgeResolver input.",
    );
  }

  if (
    request.programKnowledge.missionId !== request.mission.id
  ) {
    throw new Error(
      "MCB-006: MissionContextBuilder requires matching ProgramKnowledgeResolver input.",
    );
  }

  if (
    request.uxKnowledge !== undefined &&
    !isRecord(request.uxKnowledge)
  ) {
    throw new Error(
      "MCB-007: MissionContextBuilder requires UxKnowledgeResolver input.",
    );
  }

  if (
    request.uxKnowledge !== undefined &&
    "missionId" in request.uxKnowledge &&
    request.uxKnowledge.missionId !== request.mission.id
  ) {
    throw new Error(
      "MCB-007: MissionContextBuilder requires matching UxKnowledgeResolver input.",
    );
  }
}

function isProgramKnowledgeResolution(
  value: ProgramKnowledgeResolutionRequest | ProgramKnowledgeResolution,
): value is ProgramKnowledgeResolution {
  return (
    isRecord(value) &&
    typeof value.resolutionStatus === "string" &&
    Array.isArray(value.dependencies) &&
    Array.isArray(value.missingArtifacts)
  );
}

function isUxKnowledgeResolution(
  value: UxKnowledgeMissionRequest | UxKnowledgeResolution,
): value is UxKnowledgeResolution {
  return (
    isRecord(value) &&
    typeof value.resolutionStatus === "string" &&
    Array.isArray(value.authoritativeSources) &&
    Array.isArray(value.dependencies) &&
    Array.isArray(value.missingArtifacts)
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

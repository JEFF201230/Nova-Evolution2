import type {
  MissionContext,
} from "./mission-context-builder.js";

type MissionAuthorityDecision = MissionContext["authorityDecision"];
type MissionKnowledgeSource = MissionContext["knowledgeSources"][number];

export interface MissionPackagingMetadata {
  readonly scope?: readonly string[];
  readonly allowedFiles?: readonly string[];
  readonly forbiddenFiles?: readonly string[];
  readonly expectedArtifacts?: readonly string[];
  readonly risks?: readonly string[];
}

export type MissionBriefSourceContext = Omit<MissionContext, "mission"> & {
  readonly mission: MissionContext["mission"] & {
    readonly title?: string;
  };
  readonly packaging?: MissionPackagingMetadata;
};

export interface MissionBriefMission {
  readonly id: string;
  readonly title: string | null;
}

export interface MissionBriefAuthoritySummary {
  readonly domain: string | null;
  readonly resolutionStatus:
    | MissionContext["resolutionStatus"]
    | "UNRESOLVED";
  readonly authoritativeSourceIds: readonly string[];
  readonly supportingSourceIds: readonly string[];
  readonly rejectedSourceIds: readonly string[];
  readonly conflicts: readonly string[];
}

export interface MissionBriefUxSummary {
  readonly sourceIds: readonly string[];
  readonly domains: readonly string[];
}

/**
 * Backward-compatible MissionBrief contract.
 *
 * Packaging fields are optional here because earlier certified consumers build
 * this contract directly. MissionBriefBuilder always returns the stricter
 * MissionPackageBrief below.
 */
export interface MissionBrief {
  readonly missionId: string;
  readonly title: string | null;
  readonly objective: string | null;
  readonly program: MissionContext["program"];
  readonly capability: string | null;
  readonly epic: string | null;
  readonly feature: string | null;
  readonly lot: string | null;
  readonly wave: MissionContext["wave"];
  readonly authorityDecision: MissionAuthorityDecision;
  readonly constraints: readonly string[];
  readonly dependencies: readonly string[];
  readonly requiredKnowledge: readonly MissionKnowledgeSource[];
  readonly requiredArtifacts: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly missingArtifacts: readonly string[];
  readonly resolutionStatus: MissionContext["resolutionStatus"];
  readonly mission?: MissionBriefMission;
  readonly scope?: readonly string[];
  readonly allowedFiles?: readonly string[];
  readonly forbiddenFiles?: readonly string[];
  readonly expectedArtifacts?: readonly string[];
  readonly risks?: readonly string[];
  readonly authoritySummary?: MissionBriefAuthoritySummary;
  readonly uxSummary?: MissionBriefUxSummary;
}

export interface MissionPackageBrief extends MissionBrief {
  readonly mission: MissionBriefMission;
  readonly scope: readonly string[];
  readonly allowedFiles: readonly string[];
  readonly forbiddenFiles: readonly string[];
  readonly expectedArtifacts: readonly string[];
  readonly risks: readonly string[];
  readonly authoritySummary: MissionBriefAuthoritySummary;
  readonly uxSummary: MissionBriefUxSummary;
}

export interface MissionBriefBuilderFeatureFlag {
  readonly enabled: boolean;
}

export class MissionBriefBuilder {
  readonly enabled: boolean;

  constructor(
    featureFlag: MissionBriefBuilderFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  build(context: MissionBriefSourceContext): MissionPackageBrief | null {
    if (!this.enabled) {
      return null;
    }

    assertMissionContext(context);

    const title = context.mission.title ?? null;
    const requiredKnowledge = Object.freeze([...context.knowledgeSources]);
    const authoritySummary = buildAuthoritySummary(context);
    const uxSummary = buildUxSummary(requiredKnowledge);

    return Object.freeze({
      missionId: context.mission.id,
      title,
      objective: context.mission.objective,
      program: context.program,
      capability: context.capability,
      epic: context.epic,
      feature: context.feature,
      lot: context.lot,
      wave: context.wave,
      authorityDecision: context.authorityDecision,
      constraints: unique(context.constraints),
      dependencies: unique(context.dependencies),
      requiredKnowledge,
      requiredArtifacts: unique(context.reusedArtifacts),
      acceptanceCriteria: unique(context.acceptanceCriteria),
      missingArtifacts: unique(context.missingArtifacts),
      resolutionStatus: context.resolutionStatus,
      mission: Object.freeze({
        id: context.mission.id,
        title,
      }),
      scope: unique(context.packaging?.scope ?? deriveScope(context)),
      allowedFiles: unique(context.packaging?.allowedFiles),
      forbiddenFiles: unique(context.packaging?.forbiddenFiles),
      expectedArtifacts: unique(context.packaging?.expectedArtifacts),
      risks: unique(context.packaging?.risks),
      authoritySummary,
      uxSummary,
    });
  }
}

function deriveScope(context: MissionBriefSourceContext): readonly string[] {
  return [
    context.program === null ? null : `PROGRAM:${context.program.id}`,
    context.capability === null
      ? null
      : `CAPABILITY:${context.capability}`,
    context.epic === null ? null : `EPIC:${context.epic}`,
    context.feature === null ? null : `FEATURE:${context.feature}`,
    context.lot === null ? null : `LOT:${context.lot}`,
    context.wave === null ? null : `WAVE:${context.wave.id}`,
  ].filter((value): value is string => value !== null);
}

function buildAuthoritySummary(
  context: MissionBriefSourceContext,
): MissionBriefAuthoritySummary {
  const decision = context.authorityDecision;

  return Object.freeze({
    domain: context.authority,
    resolutionStatus: decision?.resolutionStatus ?? "UNRESOLVED",
    authoritativeSourceIds: unique(
      decision?.authoritativeSources.map((source) => source.id),
    ),
    supportingSourceIds: unique(
      decision?.supportingSources.map((source) => source.id),
    ),
    rejectedSourceIds: unique(
      decision?.rejectedSources.map((source) => source.id),
    ),
    conflicts: unique(
      decision?.unresolvedAuthorityConflicts.map(
        (conflict) => `${conflict.code}: ${conflict.message}`,
      ),
    ),
  });
}

function buildUxSummary(
  sources: readonly MissionKnowledgeSource[],
): MissionBriefUxSummary {
  const uxSources = sources.filter(
    (source) =>
      source.origin === "NOVA_UX" ||
      source.origin === "BOTH" ||
      source.domain.startsWith("UX_"),
  );

  return Object.freeze({
    sourceIds: unique(uxSources.map((source) => source.id)),
    domains: unique(uxSources.map((source) => source.domain)),
  });
}

function unique(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...new Set(values ?? [])]);
}

function assertMissionContext(context: MissionBriefSourceContext): void {
  if (!isRecord(context)) {
    throw new Error(
      "MBB-001: MissionBriefBuilder requires a structured MissionContext.",
    );
  }

  if (
    !isRecord(context.mission) ||
    !isMetadataToken(context.mission.id) ||
    (
      context.mission.title !== undefined &&
      !isNormalizedText(context.mission.title)
    ) ||
    (
      context.mission.objective !== null &&
      !isNormalizedText(context.mission.objective)
    )
  ) {
    throw new Error(
      "MBB-002: MissionBriefBuilder requires normalized mission metadata.",
    );
  }

  for (const [field, values] of [
    ["constraints", context.constraints],
    ["acceptanceCriteria", context.acceptanceCriteria],
    ["dependencies", context.dependencies],
    ["reusedArtifacts", context.reusedArtifacts],
    ["missingArtifacts", context.missingArtifacts],
  ] as const) {
    if (!Array.isArray(values) || !values.every(isNormalizedText)) {
      throw new Error(
        `MBB-003: MissionBriefBuilder requires normalized ${field}.`,
      );
    }
  }

  if (
    context.packaging !== undefined &&
    (
      !isRecord(context.packaging) ||
      [
        context.packaging.scope,
        context.packaging.allowedFiles,
        context.packaging.forbiddenFiles,
        context.packaging.expectedArtifacts,
        context.packaging.risks,
      ].some(
        (values) =>
          values !== undefined &&
          (!Array.isArray(values) || !values.every(isNormalizedText)),
      )
    )
  ) {
    throw new Error(
      "MBB-004: MissionBriefBuilder requires normalized packaging metadata.",
    );
  }

  if (
    !Array.isArray(context.knowledgeSources) ||
    context.knowledgeSources.some(
      (source) =>
        !isRecord(source) ||
        !isMetadataToken(source.id) ||
        !isNormalizedText(source.domain) ||
        !isNormalizedText(source.path),
    )
  ) {
    throw new Error(
      "MBB-005: MissionBriefBuilder requires normalized knowledge sources.",
    );
  }

  if (
    !isResolutionStatus(context.resolutionStatus) ||
    (
      context.authorityDecision !== null &&
      (
        !isRecord(context.authorityDecision) ||
        context.authorityDecision.missionId !== context.mission.id ||
        !isResolutionStatus(context.authorityDecision.resolutionStatus)
      )
    )
  ) {
    throw new Error(
      "MBB-006: MissionBriefBuilder requires coherent resolution metadata.",
    );
  }

  if (
    context.resolutionStatus === "RESOLVED" &&
    context.authorityDecision?.resolutionStatus !== "RESOLVED"
  ) {
    throw new Error(
      "MBB-007: A resolved MissionBrief requires resolved authority.",
    );
  }
}

function isResolutionStatus(
  value: unknown,
): value is MissionContext["resolutionStatus"] {
  return (
    value === "RESOLVED" ||
    value === "PARTIAL" ||
    value === "UNRESOLVED"
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

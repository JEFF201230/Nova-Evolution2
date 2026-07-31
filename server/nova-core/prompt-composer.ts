import type {
  MissionPackageBrief,
} from "./mission-brief-builder.js";

export interface PromptComposerFeatureFlag {
  readonly enabled: boolean;
}

export class PromptComposer {
  readonly enabled: boolean;

  constructor(
    featureFlag: PromptComposerFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  compose(brief: MissionPackageBrief): string | null {
    if (!this.enabled) {
      return null;
    }

    assertBrief(brief);

    return renderPrompt(brief);
  }
}

export function renderPrompt(brief: MissionPackageBrief): string {
  const sections = [
    section("MISSION", [
      `id: ${brief.mission.id}`,
      ...(brief.mission.title === null
        ? []
        : [`title: ${brief.mission.title}`]),
    ]),
    section("OBJECTIVE", scalar(brief.objective)),
    section("SCOPE", brief.scope),
    section("CONSTRAINTS", brief.constraints),
    section("ALLOWED FILES", brief.allowedFiles),
    section("FORBIDDEN FILES", brief.forbiddenFiles),
    section("DEPENDENCIES", brief.dependencies),
    section("EXPECTED ARTIFACTS", brief.expectedArtifacts),
    section("ACCEPTANCE CRITERIA", brief.acceptanceCriteria),
    section("RISKS", brief.risks),
    section("AUTHORITY", [
      `domain: ${brief.authoritySummary.domain ?? "(none)"}`,
      `status: ${brief.authoritySummary.resolutionStatus}`,
      ...labeled(
        "authoritative-source",
        brief.authoritySummary.authoritativeSourceIds,
      ),
      ...labeled(
        "supporting-source",
        brief.authoritySummary.supportingSourceIds,
      ),
      ...labeled(
        "rejected-source",
        brief.authoritySummary.rejectedSourceIds,
      ),
      ...labeled("conflict", brief.authoritySummary.conflicts),
    ]),
    section("UX", [
      ...labeled("source", brief.uxSummary.sourceIds),
      ...labeled("domain", brief.uxSummary.domains),
    ]),
  ];

  return `${sections.join("\n\n")}\n`;
}

function section(name: string, values: readonly string[]): string {
  const content =
    values.length === 0
      ? "- (none)"
      : values.map((value) => `- ${value}`).join("\n");

  return `## ${name}\n${content}`;
}

function scalar(value: string | null): readonly string[] {
  return value === null ? [] : [value];
}

function labeled(
  label: string,
  values: readonly string[],
): readonly string[] {
  return values.map((value) => `${label}: ${value}`);
}

function assertBrief(
  brief: MissionPackageBrief,
): asserts brief is MissionPackageBrief {
  if (
    !isRecord(brief) ||
    !isRecord(brief.mission) ||
    typeof brief.mission.id !== "string" ||
    !isRecord(brief.authoritySummary) ||
    !isRecord(brief.uxSummary)
  ) {
    throw new Error(
      "PC-001: PromptComposer requires a MissionPackageBrief.",
    );
  }

  const arrays = [
    brief.scope,
    brief.constraints,
    brief.allowedFiles,
    brief.forbiddenFiles,
    brief.dependencies,
    brief.expectedArtifacts,
    brief.acceptanceCriteria,
    brief.risks,
    brief.authoritySummary.authoritativeSourceIds,
    brief.authoritySummary.supportingSourceIds,
    brief.authoritySummary.rejectedSourceIds,
    brief.authoritySummary.conflicts,
    brief.uxSummary.sourceIds,
    brief.uxSummary.domains,
  ];

  if (
    arrays.some(
      (values) =>
        !Array.isArray(values) ||
        !values.every(
          (value) =>
            typeof value === "string" &&
            value.length > 0 &&
            value === value.trim(),
        ),
    )
  ) {
    throw new Error(
      "PC-002: PromptComposer requires normalized prompt sections.",
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

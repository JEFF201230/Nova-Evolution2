import type {
  MissionPackageBrief,
} from "./mission-brief-builder.js";
import {
  renderPrompt,
} from "./prompt-composer.js";

export type PromptValidationStatus = "VALID" | "INVALID";

export interface PromptValidationIssue {
  readonly code: string;
  readonly message: string;
}

export interface PromptValidationResult {
  readonly status: PromptValidationStatus;
  readonly issues: readonly PromptValidationIssue[];
}

export interface PromptValidatorFeatureFlag {
  readonly enabled: boolean;
}

export class PromptValidator {
  readonly enabled: boolean;

  constructor(
    featureFlag: PromptValidatorFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  validate(
    brief: MissionPackageBrief,
    prompt: string,
  ): PromptValidationResult | null {
    if (!this.enabled) {
      return null;
    }

    const issues: PromptValidationIssue[] = [];

    if (
      !isRecord(brief) ||
      !isRecord(brief.mission) ||
      !isNormalizedText(brief.mission.id)
    ) {
      return invalid([
        issue("PV-001", "Mission information is missing."),
      ]);
    }

    if (!isNormalizedText(brief.objective)) {
      issues.push(issue("PV-002", "Mission objective is missing."));
    }

    const completeStructure = hasCompleteStructure(brief);
    if (!completeStructure) {
      issues.push(
        issue(
          "PV-013",
          "MissionBrief packaging information is missing or malformed.",
        ),
      );
    }

    requireNonEmpty(issues, "PV-003", "scope", brief.scope);
    requireNonEmpty(
      issues,
      "PV-004",
      "dependencies",
      brief.dependencies,
    );
    requireNonEmpty(
      issues,
      "PV-005",
      "expected artifacts",
      brief.expectedArtifacts,
    );
    requireNonEmpty(
      issues,
      "PV-006",
      "acceptance criteria",
      brief.acceptanceCriteria,
    );

    if (
      brief.missionId !== brief.mission.id ||
      brief.title !== brief.mission.title
    ) {
      issues.push(
        issue("PV-007", "Mission metadata is contradictory."),
      );
    }

    const fileConflicts = intersection(
      brief.allowedFiles,
      brief.forbiddenFiles,
    );
    if (fileConflicts.length > 0) {
      issues.push(
        issue(
          "PV-008",
          `Files are both allowed and forbidden: ${fileConflicts.join(", ")}.`,
        ),
      );
    }

    const missingDependencies = intersection(
      brief.dependencies,
      brief.missingArtifacts,
    );
    if (missingDependencies.length > 0) {
      issues.push(
        issue(
          "PV-009",
          `Dependencies are absent: ${missingDependencies.join(", ")}.`,
        ),
      );
    }

    if (
      Array.isArray(brief.missingArtifacts) &&
      brief.missingArtifacts.length > 0
    ) {
      issues.push(
        issue(
          "PV-010",
          `Artifacts are missing: ${brief.missingArtifacts.join(", ")}.`,
        ),
      );
    }

    if (
      brief.resolutionStatus !== "RESOLVED" ||
      !isRecord(brief.authoritySummary) ||
      brief.authoritySummary.resolutionStatus !== "RESOLVED" ||
      !Array.isArray(brief.authoritySummary.conflicts) ||
      brief.authoritySummary.conflicts.length > 0
    ) {
      issues.push(
        issue("PV-011", "Authority resolution has unresolved conflicts."),
      );
    }

    if (
      typeof prompt !== "string" ||
      prompt.trim().length === 0 ||
      !completeStructure ||
      prompt !== renderPrompt(brief)
    ) {
      issues.push(
        issue(
          "PV-012",
          "Prompt is incomplete or differs from the certified MissionBrief.",
        ),
      );
    }

    const frozenIssues = Object.freeze([...issues]);
    return Object.freeze({
      status: frozenIssues.length === 0 ? "VALID" : "INVALID",
      issues: frozenIssues,
    });
  }
}

function hasCompleteStructure(
  brief: MissionPackageBrief,
): boolean {
  const authoritySummary = brief.authoritySummary;
  const uxSummary = brief.uxSummary;
  const arrays = [
    brief.scope,
    brief.constraints,
    brief.allowedFiles,
    brief.forbiddenFiles,
    brief.dependencies,
    brief.expectedArtifacts,
    brief.acceptanceCriteria,
    brief.risks,
    brief.missingArtifacts,
    isRecord(authoritySummary)
      ? authoritySummary.authoritativeSourceIds
      : undefined,
    isRecord(authoritySummary)
      ? authoritySummary.supportingSourceIds
      : undefined,
    isRecord(authoritySummary)
      ? authoritySummary.rejectedSourceIds
      : undefined,
    isRecord(authoritySummary)
      ? authoritySummary.conflicts
      : undefined,
    isRecord(uxSummary) ? uxSummary.sourceIds : undefined,
    isRecord(uxSummary) ? uxSummary.domains : undefined,
  ];

  return (
    isRecord(authoritySummary) &&
    isRecord(uxSummary) &&
    arrays.every(
      (value) => Array.isArray(value) && value.every(isNormalizedText),
    )
  );
}

function requireNonEmpty(
  issues: PromptValidationIssue[],
  code: string,
  name: string,
  value: unknown,
): void {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every(isNormalizedText)
  ) {
    issues.push(issue(code, `Mission ${name} are missing.`));
  }
}

function intersection(
  left: readonly string[] | undefined,
  right: readonly string[] | undefined,
): readonly string[] {
  const rightValues = new Set(
    (right ?? []).map(normalizeComparison),
  );

  return Object.freeze(
    (left ?? []).filter((value) =>
      rightValues.has(normalizeComparison(value)),
    ),
  );
}

function normalizeComparison(value: string): string {
  return value.replaceAll("\\", "/").toLocaleLowerCase("en");
}

function invalid(
  issues: readonly PromptValidationIssue[],
): PromptValidationResult {
  return Object.freeze({
    status: "INVALID",
    issues: Object.freeze([...issues]),
  });
}

function issue(code: string, message: string): PromptValidationIssue {
  return Object.freeze({ code, message });
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

import type {
  MissionPackageBrief,
} from "./mission-brief-builder.js";
import type {
  PromptValidationResult,
} from "./prompt-validator.js";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import {
  PromptIsolationBuilder,
  type PromptIsolationEnvelope,
} from "./prompt-isolation.js";

export interface PromptOptimizationMetrics {
  readonly originalCharacters: number;
  readonly optimizedCharacters: number;
  readonly estimatedTokens: number;
}

export interface PromptPackage {
  readonly missionId: string;
  readonly prompt: string;
  readonly validationStatus: "VALID";
  readonly optimization: PromptOptimizationMetrics;
  readonly isolatedPrompt: PromptIsolationEnvelope;
  readonly certificationContext: PromptCertificationContext;
}

export interface PromptCertificationContext {
  readonly authorityDecision: AuthorityResolutionDecision | null;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
}

export interface PromptOptimizerFeatureFlag {
  readonly enabled: boolean;
}

export class PromptOptimizer {
  readonly enabled: boolean;

  constructor(
    featureFlag: PromptOptimizerFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  optimize(
    brief: MissionPackageBrief,
    prompt: string,
    validation: PromptValidationResult,
  ): PromptPackage | null {
    if (!this.enabled) {
      return null;
    }

    if (
      validation.status !== "VALID" ||
      validation.issues.length > 0
    ) {
      return null;
    }

    if (
      brief.mission.id !== brief.missionId ||
      typeof prompt !== "string" ||
      prompt.length === 0
    ) {
      throw new Error(
        "PO-001: PromptOptimizer requires a coherent validated prompt.",
      );
    }

    const optimizedPrompt = optimizeLayout(prompt);
    const optimization = Object.freeze({
      originalCharacters: prompt.length,
      optimizedCharacters: optimizedPrompt.length,
      estimatedTokens: Math.ceil(optimizedPrompt.length / 4),
    });
    const isolatedPrompt = new PromptIsolationBuilder({
      enabled: true,
    }).build(brief, optimizedPrompt, optimization);
    if (isolatedPrompt === null) {
      throw new Error(
        "PO-002: PromptOptimizer requires an isolated prompt envelope.",
      );
    }

    return Object.freeze({
      missionId: brief.mission.id,
      prompt: optimizedPrompt,
      validationStatus: "VALID",
      optimization,
      isolatedPrompt,
      certificationContext: Object.freeze({
        authorityDecision: brief.authorityDecision,
        validationStatus: "VALID",
        pipelineTrace: createPipelineTrace(brief),
        missingArtifacts: Object.freeze([...brief.missingArtifacts]),
      }),
    });
  }
}

function optimizeLayout(prompt: string): string {
  return `${prompt
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim()}\n`;
}

function createPipelineTrace(
  brief: MissionPackageBrief,
): NovaOrchestrationPipelineTrace {
  const authority = brief.authorityDecision;
  return Object.freeze({
    missionId: brief.missionId,
    authoritativeSourceIds: copy(
      authority?.authoritativeSources.map((source) => source.id) ?? [],
    ),
    supportingSourceIds: copy(
      authority?.supportingSources.map((source) => source.id) ?? [],
    ),
    rejectedSourceIds: copy(
      authority?.rejectedSources.map((source) => source.id) ?? [],
    ),
    knowledgeSourceIds: copy(
      brief.requiredKnowledge.map((source) => source.id),
    ),
    knowledgeSourcePaths: copy(
      brief.requiredKnowledge.map((source) => source.path),
    ),
    dependencyIds: copy(brief.dependencies),
    requiredArtifactIds: copy(brief.requiredArtifacts),
    missingArtifactIds: copy(brief.missingArtifacts),
  });
}

function copy(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

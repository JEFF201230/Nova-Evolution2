import type {
  PromptPackage,
  PromptCertificationContext,
  PromptOptimizationMetrics,
} from "./prompt-optimizer.js";
import {
  isPromptIsolationEnvelope,
  type PromptIsolationEnvelope,
} from "./prompt-isolation.js";

export interface RuntimeMission {
  readonly missionId: string;
  readonly prompt: string;
  readonly validationStatus: "VALID";
  readonly optimization: PromptOptimizationMetrics;
  readonly isolatedPrompt: PromptIsolationEnvelope;
  readonly certificationContext: PromptCertificationContext;
}

export interface MissionPackageRuntimeMapperFeatureFlag {
  readonly enabled: boolean;
}

export class MissionPackageRuntimeMappingError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "MissionPackageRuntimeMappingError";
  }
}

export class MissionPackageRuntimeMapper {
  readonly enabled: boolean;

  constructor(
    featureFlag: MissionPackageRuntimeMapperFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  map(promptPackage: PromptPackage): RuntimeMission | null {
    if (!this.enabled) {
      return null;
    }

    if (!isValidPromptPackage(promptPackage)) {
      throw new MissionPackageRuntimeMappingError(
        "MPRM-001",
        "A VALID and internally coherent PromptPackage is required.",
      );
    }

    return Object.freeze({
      missionId: promptPackage.missionId,
      prompt: promptPackage.prompt,
      validationStatus: promptPackage.validationStatus,
      optimization: promptPackage.optimization,
      isolatedPrompt: promptPackage.isolatedPrompt,
      certificationContext: promptPackage.certificationContext,
    });
  }
}

export function isValidPromptPackage(
  value: unknown,
): value is PromptPackage {
  if (
    !isRecord(value) ||
    !isMetadataToken(value.missionId) ||
    typeof value.prompt !== "string" ||
    value.prompt.trim().length === 0 ||
    value.validationStatus !== "VALID" ||
    !isRecord(value.optimization) ||
    !isPromptIsolationEnvelope(value.isolatedPrompt, value.prompt) ||
    value.isolatedPrompt.missionId !== value.missionId ||
    !isRecord(value.certificationContext) ||
    value.certificationContext.validationStatus !== "VALID" ||
    !isRecord(value.certificationContext.pipelineTrace) ||
    value.certificationContext.pipelineTrace.missionId !==
      value.missionId ||
    !Array.isArray(value.certificationContext.missingArtifacts)
  ) {
    return false;
  }

  const {
    originalCharacters,
    optimizedCharacters,
    estimatedTokens,
  } = value.optimization;

  return (
    typeof originalCharacters === "number" &&
    typeof optimizedCharacters === "number" &&
    typeof estimatedTokens === "number" &&
    Number.isSafeInteger(originalCharacters) &&
    Number.isSafeInteger(optimizedCharacters) &&
    Number.isSafeInteger(estimatedTokens) &&
    originalCharacters >= optimizedCharacters &&
    optimizedCharacters === value.prompt.length &&
    estimatedTokens === Math.ceil(value.prompt.length / 4)
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

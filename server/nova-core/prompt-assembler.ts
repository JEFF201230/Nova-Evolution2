import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";

export interface AssembledCodexPrompt {
  readonly content: string;
  readonly missionId: string;
  readonly missionBrief: MissionBrief;
  readonly authorityDecision: RuntimeExecutionContract["authorityDecision"];
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
}

export interface PromptAssemblerFeatureFlag {
  readonly enabled: boolean;
}

export class PromptAssembler {
  readonly enabled: boolean;

  constructor(
    featureFlag: PromptAssemblerFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  assemble(
    contract: RuntimeExecutionContract,
  ): AssembledCodexPrompt | null {
    if (!this.enabled) {
      return null;
    }

    assertContract(contract);

    const promptData = {
      missionId: contract.missionBrief.missionId,
      title: contract.missionBrief.title,
      objective: contract.missionBrief.objective,
      program: contract.missionBrief.program,
      capability: contract.missionBrief.capability,
      epic: contract.missionBrief.epic,
      feature: contract.missionBrief.feature,
      lot: contract.missionBrief.lot,
      wave: contract.missionBrief.wave,
      constraints: contract.missionBrief.constraints,
      dependencies: contract.missionBrief.dependencies,
      requiredKnowledge: contract.missionBrief.requiredKnowledge,
      requiredArtifacts: contract.missionBrief.requiredArtifacts,
      acceptanceCriteria: contract.missionBrief.acceptanceCriteria,
      authorityDecision: contract.authorityDecision,
      missingArtifacts: contract.missionBrief.missingArtifacts,
      resolutionStatus: contract.missionBrief.resolutionStatus,
      pipelineTrace: contract.pipelineTrace,
    };

    return Object.freeze({
      content: JSON.stringify(promptData, null, 2),
      missionId: contract.missionBrief.missionId,
      missionBrief: contract.missionBrief,
      authorityDecision: contract.authorityDecision,
      validationStatus: contract.validationStatus,
      pipelineTrace: contract.pipelineTrace,
      missingArtifacts: contract.missionBrief.missingArtifacts,
    });
  }
}

function assertContract(contract: RuntimeExecutionContract): void {
  if (
    !isRecord(contract) ||
    !isRecord(contract.missionBrief) ||
    !isRecord(contract.authorityDecision) ||
    !isRecord(contract.pipelineTrace)
  ) {
    throw new Error(
      "PA-001: PromptAssembler requires a RuntimeExecutionContract.",
    );
  }

  if (
    contract.validationStatus !== "VALID" ||
    contract.missionBrief.authorityDecision !==
      contract.authorityDecision ||
    contract.missionBrief.missionId !== contract.pipelineTrace.missionId
  ) {
    throw new Error(
      "PA-002: RuntimeExecutionContract is inconsistent.",
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

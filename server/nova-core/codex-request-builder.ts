import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  AssembledCodexPrompt,
} from "./prompt-assembler.js";
import type {
  RuntimeExecutionContract,
  RuntimeExecutionRequestMetadata,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
} from "./runtime-execution-request.js";

export interface CodexRequest {
  readonly codexRequestId: string;
  readonly requestedAt: string;
  readonly prompt: AssembledCodexPrompt;
  readonly promptContent: string;
  readonly missionBrief: MissionBrief;
  readonly executionContext: RuntimeExecutionContext;
  readonly authorityDecision: RuntimeExecutionContract["authorityDecision"];
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
  readonly requestMetadata: RuntimeExecutionRequestMetadata;
}

export interface CodexRequestBuildInput {
  readonly contract: RuntimeExecutionContract;
  readonly prompt: AssembledCodexPrompt;
}

export interface CodexRequestBuilderFeatureFlag {
  readonly enabled: boolean;
}

export class CodexRequestBuilder {
  readonly enabled: boolean;

  constructor(
    featureFlag: CodexRequestBuilderFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  build(input: CodexRequestBuildInput): CodexRequest | null {
    if (!this.enabled) {
      return null;
    }

    assertBuildInput(input);

    return Object.freeze({
      codexRequestId: input.contract.requestMetadata.requestId,
      requestedAt: input.contract.requestMetadata.requestedAt,
      prompt: input.prompt,
      promptContent: input.prompt.content,
      missionBrief: input.contract.missionBrief,
      executionContext: input.contract.executionContext,
      authorityDecision: input.contract.authorityDecision,
      validationStatus: input.contract.validationStatus,
      pipelineTrace: input.contract.pipelineTrace,
      missingArtifacts: input.contract.missionBrief.missingArtifacts,
      requestMetadata: input.contract.requestMetadata,
    });
  }
}

function assertBuildInput(input: CodexRequestBuildInput): void {
  if (
    !isRecord(input) ||
    !isRecord(input.contract) ||
    !isRecord(input.prompt)
  ) {
    throw new Error(
      "CRB-001: CodexRequestBuilder requires a contract and assembled prompt.",
    );
  }

  if (
    input.contract.validationStatus !== "VALID" ||
    input.prompt.validationStatus !== input.contract.validationStatus ||
    input.prompt.missionBrief !== input.contract.missionBrief ||
    input.prompt.authorityDecision !== input.contract.authorityDecision ||
    input.prompt.pipelineTrace !== input.contract.pipelineTrace ||
    input.prompt.missionId !== input.contract.missionBrief.missionId ||
    typeof input.prompt.content !== "string" ||
    input.prompt.content.length === 0
  ) {
    throw new Error(
      "CRB-002: Contract and assembled prompt metadata do not match.",
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

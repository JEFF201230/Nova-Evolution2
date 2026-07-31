import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionContract,
  RuntimeExecutionRequestMetadata,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
} from "./runtime-execution-request.js";

export interface RuntimeExecutorPayload {
  readonly runtimeExecutionContract: RuntimeExecutionContract;
  readonly requestId: string;
  readonly requestedAt: string;
  readonly missionId: string;
  readonly missionBrief: MissionBrief;
  readonly executionContext: RuntimeExecutionContext;
  readonly authorityDecision: RuntimeExecutionContract["authorityDecision"];
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
  readonly requestMetadata: RuntimeExecutionRequestMetadata;
}

export interface RuntimeExecutorAdapterFeatureFlag {
  readonly enabled: boolean;
}

export class RuntimeExecutorAdapter {
  readonly enabled: boolean;

  constructor(
    featureFlag: RuntimeExecutorAdapterFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  adapt(
    contract: RuntimeExecutionContract,
  ): RuntimeExecutorPayload | null {
    if (!this.enabled) {
      return null;
    }

    assertContract(contract);

    return Object.freeze({
      runtimeExecutionContract: contract,
      requestId: contract.requestMetadata.requestId,
      requestedAt: contract.requestMetadata.requestedAt,
      missionId: contract.missionBrief.missionId,
      missionBrief: contract.missionBrief,
      executionContext: contract.executionContext,
      authorityDecision: contract.authorityDecision,
      validationStatus: contract.validationStatus,
      pipelineTrace: contract.pipelineTrace,
      missingArtifacts: contract.missionBrief.missingArtifacts,
      requestMetadata: contract.requestMetadata,
    });
  }
}

function assertContract(contract: RuntimeExecutionContract): void {
  if (!isRecord(contract)) {
    throw new Error(
      "REA-001: RuntimeExecutorAdapter requires a RuntimeExecutionContract.",
    );
  }

  if (
    contract.validationStatus !== "VALID" ||
    !isRecord(contract.runtimeExecutionRequest) ||
    !isRecord(contract.missionBrief) ||
    !isRecord(contract.executionContext) ||
    !isRecord(contract.authorityDecision) ||
    !isRecord(contract.pipelineTrace) ||
    !isRecord(contract.requestMetadata)
  ) {
    throw new Error(
      "REA-002: RuntimeExecutionContract is not ready for payload adaptation.",
    );
  }

  if (
    contract.runtimeExecutionRequest.missionBrief !==
      contract.missionBrief ||
    contract.runtimeExecutionRequest.executionContext !==
      contract.executionContext ||
    contract.runtimeExecutionRequest.authorityDecision !==
      contract.authorityDecision ||
    contract.runtimeExecutionRequest.pipelineTrace !==
      contract.pipelineTrace ||
    contract.missionBrief.missionId !==
      contract.executionContext.missionId ||
    contract.missionBrief.missionId !== contract.pipelineTrace.missionId ||
    contract.requestMetadata.requestId !==
      contract.runtimeExecutionRequest.requestId ||
    contract.requestMetadata.requestedAt !==
      contract.runtimeExecutionRequest.requestedAt
  ) {
    throw new Error(
      "REA-003: RuntimeExecutionContract contains inconsistent references.",
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

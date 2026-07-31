import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutionContext,
  RuntimeExecutionRequest,
} from "./runtime-execution-request.js";

export interface RuntimeExecutionRequestMetadata {
  readonly requestId: string;
  readonly requestedAt: string;
}

export interface RuntimeExecutionContract {
  readonly runtimeExecutionRequest: RuntimeExecutionRequest;
  readonly missionBrief: MissionBrief;
  readonly authorityDecision: RuntimeExecutionRequest["authorityDecision"];
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly executionContext: RuntimeExecutionContext;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly requestMetadata: RuntimeExecutionRequestMetadata;
}

export interface RuntimeExecutionContractFeatureFlag {
  readonly enabled: boolean;
}

export class RuntimeExecutionContractBuilder {
  readonly enabled: boolean;

  constructor(
    featureFlag: RuntimeExecutionContractFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  build(
    runtimeExecutionRequest: RuntimeExecutionRequest,
  ): RuntimeExecutionContract | null {
    if (!this.enabled) {
      return null;
    }

    assertRuntimeExecutionRequest(runtimeExecutionRequest);

    const contract = Object.freeze({
      runtimeExecutionRequest,
      missionBrief: runtimeExecutionRequest.missionBrief,
      authorityDecision: runtimeExecutionRequest.authorityDecision,
      validationStatus: runtimeExecutionRequest.validationStatus,
      executionContext: runtimeExecutionRequest.executionContext,
      pipelineTrace: runtimeExecutionRequest.pipelineTrace,
      requestMetadata: Object.freeze({
        requestId: runtimeExecutionRequest.requestId,
        requestedAt: runtimeExecutionRequest.requestedAt,
      }),
    });

    assertSerializable(contract);
    return contract;
  }
}

function assertRuntimeExecutionRequest(
  request: RuntimeExecutionRequest,
): void {
  if (!isRecord(request)) {
    throw new Error(
      "REC-001: RuntimeExecutionContractBuilder requires a structured RuntimeExecutionRequest.",
    );
  }

  if (
    !isMetadataToken(request.requestId) ||
    typeof request.requestedAt !== "string"
  ) {
    throw new Error(
      "REC-002: RuntimeExecutionContractBuilder requires request metadata.",
    );
  }

  if (
    !isRecord(request.missionBrief) ||
    !isRecord(request.executionContext) ||
    !isRecord(request.authorityDecision) ||
    !isRecord(request.pipelineTrace)
  ) {
    throw new Error(
      "REC-003: RuntimeExecutionContractBuilder requires certified request components.",
    );
  }

  if (
    request.validationStatus !== "VALID" ||
    request.missionBrief.missionId !==
      request.executionContext.missionId ||
    request.missionBrief.missionId !==
      request.pipelineTrace.missionId ||
    request.missionBrief.authorityDecision !==
      request.authorityDecision
  ) {
    throw new Error(
      "REC-004: RuntimeExecutionRequest metadata is inconsistent.",
    );
  }
}

function assertSerializable(contract: RuntimeExecutionContract): void {
  try {
    const serialized = JSON.stringify(contract);

    if (serialized === undefined) {
      throw new Error("Contract serialization returned undefined.");
    }

    JSON.parse(serialized);
  } catch {
    throw new Error(
      "REC-005: RuntimeExecutionContract must be JSON serializable.",
    );
  }
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

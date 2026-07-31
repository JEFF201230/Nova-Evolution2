import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import {
  assertRuntimeResponseSerializable,
  type AdaptedRuntimeResponse,
  type RuntimeResponseInput,
} from "./runtime-response-adapter.js";

export interface NormalizedRuntimeResult {
  readonly sourceResponse: AdaptedRuntimeResponse;
  readonly runtimeResponse: RuntimeResponseInput;
  readonly responseId: string;
  readonly requestId: string;
  readonly receivedAt: string;
  readonly runtimeStatus: string;
  readonly result: unknown;
  readonly error: unknown;
  readonly runtimeMetadata: Readonly<Record<string, unknown>>;
  readonly authorityDecision: AdaptedRuntimeResponse["authorityDecision"];
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly missingArtifacts: readonly string[];
}

export interface RuntimeResultNormalizerFeatureFlag {
  readonly enabled: boolean;
}

export class RuntimeResultNormalizer {
  readonly enabled: boolean;

  constructor(
    featureFlag: RuntimeResultNormalizerFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  normalize(
    response: AdaptedRuntimeResponse,
  ): NormalizedRuntimeResult | null {
    if (!this.enabled) {
      return null;
    }

    assertAdaptedResponse(response);

    const normalized = Object.freeze({
      sourceResponse: response,
      runtimeResponse: response.runtimeResponse,
      responseId: response.responseId,
      requestId: response.requestId,
      receivedAt: response.receivedAt,
      runtimeStatus: response.status,
      result: response.data,
      error: response.error,
      runtimeMetadata: response.runtimeMetadata,
      authorityDecision: response.authorityDecision,
      pipelineTrace: response.pipelineTrace,
      validationStatus: response.validationStatus,
      missingArtifacts: response.missingArtifacts,
    });

    assertRuntimeResponseSerializable(normalized.runtimeResponse);
    return normalized;
  }
}

function assertAdaptedResponse(
  response: AdaptedRuntimeResponse,
): void {
  if (
    !isRecord(response) ||
    !isRecord(response.runtimeResponse) ||
    !isRecord(response.executorPayload) ||
    !isRecord(response.authorityDecision) ||
    !isRecord(response.pipelineTrace) ||
    !isRecord(response.runtimeMetadata) ||
    !Array.isArray(response.missingArtifacts)
  ) {
    throw new Error(
      "RRN-001: RuntimeResultNormalizer requires an adapted Runtime response.",
    );
  }

  if (
    response.responseId !== response.runtimeResponse.responseId ||
    response.requestId !== response.runtimeResponse.requestId ||
    response.receivedAt !== response.runtimeResponse.receivedAt ||
    response.status !== response.runtimeResponse.status ||
    response.data !== response.runtimeResponse.data ||
    response.error !== response.runtimeResponse.error ||
    response.runtimeMetadata !==
      response.runtimeResponse.runtimeMetadata ||
    response.authorityDecision !==
      response.executorPayload.authorityDecision ||
    response.pipelineTrace !== response.executorPayload.pipelineTrace ||
    response.validationStatus !==
      response.executorPayload.validationStatus ||
    response.missingArtifacts !==
      response.executorPayload.missingArtifacts
  ) {
    throw new Error(
      "RRN-002: Adapted Runtime response metadata is inconsistent.",
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

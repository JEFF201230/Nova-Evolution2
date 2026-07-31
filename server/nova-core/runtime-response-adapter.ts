import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import type {
  RuntimeExecutorPayload,
} from "./runtime-executor-adapter.js";

export interface RuntimeResponseInput {
  readonly responseId: string;
  readonly requestId: string;
  readonly receivedAt: string;
  readonly status: string;
  readonly data: unknown;
  readonly error: unknown;
  readonly runtimeMetadata: Readonly<Record<string, unknown>>;
}

export interface RuntimeResponseAdaptationInput {
  readonly executorPayload: RuntimeExecutorPayload;
  readonly runtimeResponse: RuntimeResponseInput;
}

export interface AdaptedRuntimeResponse {
  readonly executorPayload: RuntimeExecutorPayload;
  readonly runtimeResponse: RuntimeResponseInput;
  readonly responseId: string;
  readonly requestId: string;
  readonly receivedAt: string;
  readonly status: string;
  readonly data: unknown;
  readonly error: unknown;
  readonly runtimeMetadata: Readonly<Record<string, unknown>>;
  readonly authorityDecision: RuntimeExecutorPayload["authorityDecision"];
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly missingArtifacts: readonly string[];
}

export interface RuntimeResponseAdapterFeatureFlag {
  readonly enabled: boolean;
}

export class RuntimeResponseAdapter {
  readonly enabled: boolean;

  constructor(
    featureFlag: RuntimeResponseAdapterFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  adapt(
    input: RuntimeResponseAdaptationInput,
  ): AdaptedRuntimeResponse | null {
    if (!this.enabled) {
      return null;
    }

    assertAdaptationInput(input);

    return Object.freeze({
      executorPayload: input.executorPayload,
      runtimeResponse: input.runtimeResponse,
      responseId: input.runtimeResponse.responseId,
      requestId: input.runtimeResponse.requestId,
      receivedAt: input.runtimeResponse.receivedAt,
      status: input.runtimeResponse.status,
      data: input.runtimeResponse.data,
      error: input.runtimeResponse.error,
      runtimeMetadata: input.runtimeResponse.runtimeMetadata,
      authorityDecision: input.executorPayload.authorityDecision,
      pipelineTrace: input.executorPayload.pipelineTrace,
      validationStatus: input.executorPayload.validationStatus,
      missingArtifacts: input.executorPayload.missingArtifacts,
    });
  }
}

export function assertRuntimeResponseSerializable(value: unknown): void {
  if (!isJsonValue(value, new Set<object>())) {
    throw new Error(
      "RRA-004: Runtime response data must be JSON serializable.",
    );
  }
}

function assertAdaptationInput(
  input: RuntimeResponseAdaptationInput,
): void {
  if (
    !isRecord(input) ||
    !isRecord(input.executorPayload) ||
    !isRecord(input.runtimeResponse)
  ) {
    throw new Error(
      "RRA-001: RuntimeResponseAdapter requires structured payload and response data.",
    );
  }

  if (
    !isMetadataToken(input.runtimeResponse.responseId) ||
    !isMetadataToken(input.runtimeResponse.requestId) ||
    !isMetadataToken(input.runtimeResponse.status) ||
    !isCanonicalTimestamp(input.runtimeResponse.receivedAt) ||
    !isRecord(input.runtimeResponse.runtimeMetadata)
  ) {
    throw new Error(
      "RRA-002: Runtime response metadata is invalid.",
    );
  }

  if (
    input.runtimeResponse.requestId !== input.executorPayload.requestId
  ) {
    throw new Error(
      "RRA-003: Runtime response requestId does not match the executor payload.",
    );
  }

  assertRuntimeResponseSerializable(input.runtimeResponse);
}

function isJsonValue(
  value: unknown,
  ancestors: Set<object>,
): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "object") {
    return false;
  }

  if (ancestors.has(value)) {
    return false;
  }

  ancestors.add(value);
  const valid = Array.isArray(value)
    ? value.every((entry) => isJsonValue(entry, ancestors))
    : Object.getPrototypeOf(value) === Object.prototype &&
      Object.values(value).every((entry) =>
        isJsonValue(entry, ancestors),
      );
  ancestors.delete(value);
  return valid;
}

function isCanonicalTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  ) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
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

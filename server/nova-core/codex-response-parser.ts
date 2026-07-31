import type {
  CodexExecutionPreparation,
} from "./codex-execution-adapter.js";
import type {
  NovaOrchestrationPipelineTrace,
  NovaOrchestrationValidationStatus,
} from "./nova-orchestration-bridge.js";
import {
  assertRuntimeResponseSerializable,
} from "./runtime-response-adapter.js";

export interface CodexResponseInput {
  readonly responseId: string;
  readonly requestId: string;
  readonly receivedAt: string;
  readonly status: string;
  readonly content: unknown;
  readonly error: unknown;
  readonly codexMetadata: Readonly<Record<string, unknown>>;
}

export interface CodexResponseParseInput {
  readonly executionPreparation: CodexExecutionPreparation;
  readonly codexResponse: CodexResponseInput;
}

export interface ParsedCodexResponse {
  readonly executionPreparation: CodexExecutionPreparation;
  readonly codexResponse: CodexResponseInput;
  readonly responseId: string;
  readonly requestId: string;
  readonly receivedAt: string;
  readonly codexStatus: string;
  readonly content: unknown;
  readonly error: unknown;
  readonly codexMetadata: Readonly<Record<string, unknown>>;
  readonly authorityDecision: CodexExecutionPreparation["authorityDecision"];
  readonly validationStatus: NovaOrchestrationValidationStatus;
  readonly pipelineTrace: NovaOrchestrationPipelineTrace;
  readonly missingArtifacts: readonly string[];
}

export interface CodexResponseParserFeatureFlag {
  readonly enabled: boolean;
}

export class CodexResponseParser {
  readonly enabled: boolean;

  constructor(
    featureFlag: CodexResponseParserFeatureFlag = { enabled: false },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  parse(
    input: CodexResponseParseInput,
  ): ParsedCodexResponse | null {
    if (!this.enabled) {
      return null;
    }

    assertParseInput(input);

    return Object.freeze({
      executionPreparation: input.executionPreparation,
      codexResponse: input.codexResponse,
      responseId: input.codexResponse.responseId,
      requestId: input.codexResponse.requestId,
      receivedAt: input.codexResponse.receivedAt,
      codexStatus: input.codexResponse.status,
      content: input.codexResponse.content,
      error: input.codexResponse.error,
      codexMetadata: input.codexResponse.codexMetadata,
      authorityDecision: input.executionPreparation.authorityDecision,
      validationStatus: input.executionPreparation.validationStatus,
      pipelineTrace: input.executionPreparation.pipelineTrace,
      missingArtifacts: input.executionPreparation.missingArtifacts,
    });
  }
}

function assertParseInput(input: CodexResponseParseInput): void {
  if (
    !isRecord(input) ||
    !isRecord(input.executionPreparation) ||
    !isRecord(input.codexResponse)
  ) {
    throw new Error(
      "CRP-001: CodexResponseParser requires preparation and simulated response data.",
    );
  }

  if (
    !isMetadataToken(input.codexResponse.responseId) ||
    !isMetadataToken(input.codexResponse.requestId) ||
    !isMetadataToken(input.codexResponse.status) ||
    !isCanonicalTimestamp(input.codexResponse.receivedAt) ||
    !isRecord(input.codexResponse.codexMetadata)
  ) {
    throw new Error(
      "CRP-002: Simulated Codex response metadata is invalid.",
    );
  }

  if (
    input.codexResponse.requestId !==
      input.executionPreparation.requestId
  ) {
    throw new Error(
      "CRP-003: Codex response requestId does not match preparation.",
    );
  }

  try {
    assertRuntimeResponseSerializable(input.codexResponse);
  } catch {
    throw new Error(
      "CRP-004: Simulated Codex response must be JSON serializable.",
    );
  }
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

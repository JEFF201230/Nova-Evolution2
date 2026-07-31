import { BffError } from "./bff.errors.js";
import type {
  RuntimeGatewayRequestDto,
} from "./runtime-gateway.port.js";

export interface RuntimeEntrypointPromptPackage {
  readonly missionId: string;
  readonly [key: string]: unknown;
}

export interface RuntimeEntrypointExecutionOptions {
  readonly executionSessionId: string;
  readonly promptPackageId: string;
  readonly idempotencyKey: string;
  readonly workingDirectory: string;
  readonly workspaceSecurity: Readonly<Record<string, unknown>>;
  readonly timeoutMs: number;
  readonly authentication: Readonly<Record<string, unknown>>;
}

export type RuntimeEntrypointResult = unknown;

export interface RuntimeEntrypointInvocation {
  readonly correlationId: string;
  readonly promptPackage: RuntimeEntrypointPromptPackage;
  readonly executionOptions: RuntimeEntrypointExecutionOptions;
}

const CORRELATION_ID_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const MAX_SERIALIZED_REQUEST_BYTES = 2 * 1_024 * 1_024;

export class RuntimeRequestMapper {
  map(request: RuntimeGatewayRequestDto): RuntimeEntrypointInvocation {
    try {
      assertRecord(request, "request");
      assertExactKeys(
        request,
        ["correlationId", "executionOptions", "promptPackage"],
        "request",
      );
      assertPattern(
        request.correlationId,
        CORRELATION_ID_PATTERN,
        "correlationId",
      );
      assertPromptPackage(request.promptPackage);
      assertExecutionOptions(request.executionOptions);
      assertSerializable(request, MAX_SERIALIZED_REQUEST_BYTES);

      const copy = immutableJsonCopy(request);
      return Object.freeze({
        correlationId: copy.correlationId,
        promptPackage:
          copy.promptPackage as RuntimeEntrypointPromptPackage,
        executionOptions:
          copy.executionOptions as RuntimeEntrypointExecutionOptions,
      });
    } catch (error) {
      if (
        error instanceof BffError &&
        error.code === "RUNTIME_REQUEST_INVALID"
      ) {
        throw error;
      }
      throw invalidRequest();
    }
  }
}

function assertPromptPackage(value: unknown): void {
  assertRecord(value, "promptPackage");
  assertExactKeys(
    value,
    [
      "certificationContext",
      "isolatedPrompt",
      "missionId",
      "optimization",
      "prompt",
      "validationStatus",
    ],
    "promptPackage",
  );
  assertToken(value.missionId, "promptPackage.missionId");
  if (
    typeof value.prompt !== "string" ||
    value.prompt.length < 1 ||
    value.prompt.length > 1_000_000 ||
    value.validationStatus !== "VALID"
  ) {
    throw invalidRequest();
  }

  const optimization = value.optimization;
  assertOptimization(optimization, value.prompt.length);
  assertIsolation(value.isolatedPrompt, value.missionId, optimization);
  assertCertificationContext(value.certificationContext, value.missionId);
}

function assertOptimization(
  value: unknown,
  promptLength: number,
): asserts value is Record<string, unknown> {
  assertRecord(value, "optimization");
  assertExactKeys(
    value,
    [
      "estimatedTokens",
      "optimizedCharacters",
      "originalCharacters",
    ],
    "optimization",
  );
  if (
    !isNonNegativeInteger(value.originalCharacters) ||
    !isNonNegativeInteger(value.optimizedCharacters) ||
    !isNonNegativeInteger(value.estimatedTokens) ||
    value.optimizedCharacters !== promptLength ||
    value.originalCharacters < value.optimizedCharacters ||
    value.estimatedTokens !== Math.ceil(value.optimizedCharacters / 4)
  ) {
    throw invalidRequest();
  }
}

function assertIsolation(
  value: unknown,
  missionId: string,
  optimization: Record<string, unknown>,
): void {
  assertRecord(value, "isolatedPrompt");
  assertExactKeys(
    value,
    [
      "evidence",
      "missionId",
      "projectContext",
      "promptPackage",
      "runtimeMetadata",
      "schemaVersion",
      "systemInstructions",
      "userData",
    ],
    "isolatedPrompt",
  );
  if (
    value.schemaVersion !== 1 ||
    value.missionId !== missionId ||
    !isNonEmptyStringArray(value.systemInstructions)
  ) {
    throw invalidRequest();
  }
  assertRecord(value.userData, "isolatedPrompt.userData");
  assertRecord(value.projectContext, "isolatedPrompt.projectContext");
  assertRecord(value.runtimeMetadata, "isolatedPrompt.runtimeMetadata");
  assertRecord(value.evidence, "isolatedPrompt.evidence");
  assertRecord(value.promptPackage, "isolatedPrompt.promptPackage");
  if (
    value.runtimeMetadata.validationStatus !== "VALID" ||
    !sameJson(value.runtimeMetadata.optimization, optimization) ||
    value.promptPackage.format !== "NOVA_PROMPT_ISOLATION_V1" ||
    !isPattern(value.promptPackage.sourcePromptSha256, SHA256_PATTERN)
  ) {
    throw invalidRequest();
  }
}

function assertCertificationContext(
  value: unknown,
  missionId: string,
): void {
  assertRecord(value, "certificationContext");
  assertExactKeys(
    value,
    [
      "authorityDecision",
      "missingArtifacts",
      "pipelineTrace",
      "validationStatus",
    ],
    "certificationContext",
  );
  assertRecord(
    value.authorityDecision,
    "certificationContext.authorityDecision",
  );
  assertRecord(value.pipelineTrace, "certificationContext.pipelineTrace");
  if (
    value.validationStatus !== "VALID" ||
    value.authorityDecision.missionId !== missionId ||
    value.authorityDecision.resolutionStatus !== "RESOLVED" ||
    value.pipelineTrace.missionId !== missionId ||
    !Array.isArray(value.missingArtifacts) ||
    value.missingArtifacts.length !== 0
  ) {
    throw invalidRequest();
  }
}

function assertExecutionOptions(value: unknown): void {
  assertRecord(value, "executionOptions");
  assertExactKeys(
    value,
    [
      "authentication",
      "executionSessionId",
      "idempotencyKey",
      "promptPackageId",
      "timeoutMs",
      "workingDirectory",
      "workspaceSecurity",
    ],
    "executionOptions",
  );
  assertToken(value.executionSessionId, "executionSessionId");
  assertToken(value.promptPackageId, "promptPackageId");
  assertToken(value.idempotencyKey, "idempotencyKey");
  assertBoundedString(value.workingDirectory, 1, 4_096);
  if (
    !Number.isSafeInteger(value.timeoutMs) ||
    (value.timeoutMs as number) < 1 ||
    (value.timeoutMs as number) > 24 * 60 * 60 * 1_000
  ) {
    throw invalidRequest();
  }
  assertWorkspaceSecurity(value.workspaceSecurity);
  assertAuthentication(value.authentication);
}

function assertWorkspaceSecurity(value: unknown): void {
  assertRecord(value, "workspaceSecurity");
  assertExactKeys(
    value,
    [
      "repositoryId",
      "sandboxRoot",
      "workspaceId",
      "workspaceRoot",
    ],
    "workspaceSecurity",
  );
  assertToken(value.workspaceId, "workspaceId");
  assertToken(value.repositoryId, "repositoryId");
  assertBoundedString(value.workspaceRoot, 1, 4_096);
  assertBoundedString(value.sandboxRoot, 1, 4_096);
}

function assertAuthentication(value: unknown): void {
  assertRecord(value, "authentication");
  assertExactKeys(
    value,
    [
      "authorization",
      "codexTransportId",
      "environmentId",
      "expiresAt",
      "issuedAt",
      "operatorId",
      "runtimeId",
      "signature",
    ],
    "authentication",
  );
  for (
    const key of [
      "codexTransportId",
      "environmentId",
      "operatorId",
      "runtimeId",
    ] as const
  ) {
    assertToken(value[key], key);
  }
  if (
    value.authorization !== "EXECUTE" ||
    !isCanonicalTimestamp(value.issuedAt) ||
    !isCanonicalTimestamp(value.expiresAt) ||
    value.issuedAt >= value.expiresAt ||
    !isPattern(value.signature, SHA256_PATTERN)
  ) {
    throw invalidRequest();
  }
}

function assertSerializable(
  value: unknown,
  maximumBytes: number,
): void {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw invalidRequest();
  }
  if (
    serialized === undefined ||
    Buffer.byteLength(serialized, "utf8") > maximumBytes
  ) {
    throw invalidRequest();
  }
}

function immutableJsonCopy<T>(value: T): T {
  const copy = JSON.parse(JSON.stringify(value)) as T;
  return deepFreeze(copy, 0);
}

function deepFreeze<T>(value: T, depth: number): T {
  if (depth > 64) {
    throw invalidRequest();
  }
  if (typeof value === "object" && value !== null) {
    for (const child of Object.values(value)) {
      deepFreeze(child, depth + 1);
    }
    Object.freeze(value);
  }
  return value;
}

function assertRecord(
  value: unknown,
  _name: string,
): asserts value is Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw invalidRequest();
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  _name: string,
): void {
  const actual = Object.keys(value).sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw invalidRequest();
  }
}

function assertToken(value: unknown, _name: string): asserts value is string {
  assertPattern(value, TOKEN_PATTERN, _name);
}

function assertPattern(
  value: unknown,
  pattern: RegExp,
  _name: string,
): asserts value is string {
  if (!isPattern(value, pattern)) {
    throw invalidRequest();
  }
}

function isPattern(value: unknown, pattern: RegExp): value is string {
  return typeof value === "string" && pattern.test(value);
}

function assertBoundedString(
  value: unknown,
  minimum: number,
  maximum: number,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length < minimum ||
    value.length > maximum ||
    value !== value.trim()
  ) {
    throw invalidRequest();
  }
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isNonEmptyStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 100 &&
    value.every(
      (item) =>
        typeof item === "string" &&
        item.length > 0 &&
        item.length <= 10_000,
    )
  );
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

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function invalidRequest(): BffError {
  return new BffError(
    400,
    "RUNTIME_REQUEST_INVALID",
    "The Runtime request contract is invalid.",
  );
}

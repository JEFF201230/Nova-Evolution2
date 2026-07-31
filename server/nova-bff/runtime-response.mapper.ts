import { BffError } from "./bff.errors.js";
import type {
  RuntimeGatewayResponseDto,
} from "./runtime-gateway.port.js";
import type {
  RuntimeEntrypointInvocation,
  RuntimeEntrypointResult,
} from "./runtime-request.mapper.js";

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

export class RuntimeResponseMapper {
  map(
    invocation: RuntimeEntrypointInvocation,
    result: RuntimeEntrypointResult,
  ): RuntimeGatewayResponseDto {
    if (result === null) {
      throw new BffError(
        503,
        "RUNTIME_UNAVAILABLE",
        "The Runtime is unavailable.",
        { correlationId: invocation.correlationId },
      );
    }

    try {
      assertRecord(result);
      assertExactKeys(result, [
        "executionSession",
        "integrationResult",
        "promptPackage",
        "runtimeMission",
      ]);
      assertRecord(result.promptPackage);
      assertRecord(result.runtimeMission);
      assertRecord(result.executionSession);
      assertRecord(result.integrationResult);
      assertExactKeys(result.integrationResult, [
        "certification",
        "evidenceBundle",
        "missionId",
        "persistedRecords",
        "runtimeResult",
      ]);
      assertRecord(result.integrationResult.runtimeResult);
      assertExactKeys(result.integrationResult.runtimeResult, [
        "completedAt",
        "missionId",
        "result",
        "status",
      ]);
      assertRecord(result.integrationResult.evidenceBundle);
      assertExactKeys(result.integrationResult.evidenceBundle, [
        "authorityDecision",
        "bundleFingerprint",
        "certification",
        "evidence",
        "missingArtifacts",
        "missionId",
        "pipelineTrace",
        "report",
        "requiredEvidenceTypes",
        "runId",
        "schemaVersion",
        "source",
        "validationStatus",
      ]);
      assertRecord(result.integrationResult.certification);
      assertExactKeys(result.integrationResult.certification, [
        "bundleFingerprint",
        "decision",
        "justification",
      ]);

      const missionId = invocation.promptPackage.missionId;
      const runtimeResult = result.integrationResult.runtimeResult;
      const certification = result.integrationResult.certification;
      const evidenceBundle = result.integrationResult.evidenceBundle;
      if (
        result.promptPackage.missionId !== missionId ||
        result.runtimeMission.missionId !== missionId ||
        result.executionSession.missionId !== missionId ||
        result.executionSession.status !== "COMPLETED" ||
        result.integrationResult.missionId !== missionId ||
        runtimeResult.missionId !== missionId ||
        runtimeResult.status !== "SUCCESS" ||
        !isCanonicalTimestamp(runtimeResult.completedAt) ||
        certification.decision !== "GO" ||
        !isSha256(certification.bundleFingerprint) ||
        evidenceBundle.missionId !== missionId ||
        evidenceBundle.validationStatus !== "VALID" ||
        evidenceBundle.schemaVersion !== 1 ||
        !Array.isArray(evidenceBundle.evidence) ||
        !Array.isArray(evidenceBundle.requiredEvidenceTypes) ||
        !Array.isArray(evidenceBundle.missingArtifacts) ||
        evidenceBundle.missingArtifacts.length !== 0 ||
        evidenceBundle.bundleFingerprint !==
          certification.bundleFingerprint ||
        evidenceBundle.certification !== certification ||
        !Array.isArray(certification.justification) ||
        !Array.isArray(result.integrationResult.persistedRecords) ||
        !isToken(result.executionSession.executionSessionId) ||
        result.executionSession.executionSessionId !==
          invocation.executionOptions.executionSessionId
      ) {
        throw invalidResponse();
      }

      return Object.freeze({
        correlationId: invocation.correlationId,
        missionId,
        executionSessionId:
          result.executionSession.executionSessionId,
        status: "CERTIFIED",
        runtime: Object.freeze({
          status: "SUCCESS",
          completedAt: runtimeResult.completedAt,
        }),
        certification: Object.freeze({
          decision: "GO",
          bundleFingerprint: certification.bundleFingerprint,
        }),
      });
    } catch (error) {
      if (
        error instanceof BffError &&
        error.code === "RUNTIME_RESPONSE_INVALID"
      ) {
        throw error;
      }
      throw invalidResponse();
    }
  }
}

function assertRecord(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw invalidResponse();
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): void {
  const actual = Object.keys(value).sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw invalidResponse();
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

function isSha256(value: unknown): value is string {
  return typeof value === "string" && SHA256_PATTERN.test(value);
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
  );
}

function invalidResponse(): BffError {
  return new BffError(
    502,
    "RUNTIME_RESPONSE_INVALID",
    "The Runtime returned an invalid contract.",
  );
}

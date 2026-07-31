import { BffError } from "./bff.errors.js";
import type {
  RuntimeGatewayRequestDto,
  RuntimeGatewayResponseDto,
} from "./runtime-gateway.port.js";

export const RUNTIME_EXECUTE_PATH = "/api/runtime/execute";
export const RUNTIME_EXECUTE_OPERATION = "execute";

export interface RuntimeExecuteCommand {
  readonly operation: typeof RUNTIME_EXECUTE_OPERATION;
  readonly correlationId: string;
  readonly gatewayRequest: RuntimeGatewayRequestDto;
}

export interface RuntimeExecuteSuccessView {
  readonly success: true;
  readonly correlationId: string;
  readonly data: Omit<RuntimeGatewayResponseDto, "correlationId">;
}

export function parseRuntimeExecuteCommand(
  body: Record<string, unknown> | null,
  generatedCorrelationId: string,
): RuntimeExecuteCommand {
  if (!body) {
    throw invalidRequest();
  }
  assertExactKeys(
    body,
    ["correlationId", "operation", "payload"],
    ["operation", "payload"],
  );

  if (
    typeof body.operation !== "string"
    || body.operation.trim().length === 0
  ) {
    throw invalidRequest();
  }
  if (body.operation !== RUNTIME_EXECUTE_OPERATION) {
    throw new BffError(
      422,
      "OPERATION_NOT_ALLOWED",
      "The requested operation is not allowed.",
    );
  }
  assertRecord(body.payload);
  assertExactKeys(
    body.payload,
    ["executionOptions", "promptPackage"],
    ["executionOptions", "promptPackage"],
  );

  const correlationId = body.correlationId === undefined
    ? generatedCorrelationId
    : validateCorrelationId(body.correlationId);

  return Object.freeze({
    operation: RUNTIME_EXECUTE_OPERATION,
    correlationId,
    gatewayRequest: Object.freeze({
      correlationId,
      promptPackage: body.payload.promptPackage,
      executionOptions: body.payload.executionOptions,
    }),
  });
}

export function runtimeExecuteSuccessView(
  response: RuntimeGatewayResponseDto,
): RuntimeExecuteSuccessView {
  const {
    correlationId,
    missionId,
    executionSessionId,
    status,
    runtime,
    certification,
  } = response;
  return {
    success: true,
    correlationId,
    data: {
      missionId,
      executionSessionId,
      status,
      runtime,
      certification,
    },
  };
}

function assertRecord(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (
    typeof value !== "object"
    || value === null
    || Array.isArray(value)
  ) {
    throw invalidRequest();
  }
}

function assertExactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  required: readonly string[],
): void {
  const keys = Object.keys(value);
  if (
    keys.some((key) => !allowed.includes(key))
    || required.some((key) => !keys.includes(key))
  ) {
    throw invalidRequest();
  }
}

function validateCorrelationId(value: unknown): string {
  if (
    typeof value !== "string"
    || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
  ) {
    throw invalidRequest();
  }
  return value;
}

function invalidRequest(): BffError {
  return new BffError(
    400,
    "RUNTIME_EXECUTE_REQUEST_INVALID",
    "The Runtime execute request is invalid.",
  );
}

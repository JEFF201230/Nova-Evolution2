import { AsyncLocalStorage } from "node:async_hooks";
import { BffError } from "./bff.errors.js";
import type {
  RuntimeEntrypointInvocation,
  RuntimeEntrypointResult,
} from "./runtime-request.mapper.js";

export interface ProgramProductionEntrypointPort {
  execute(
    promptPackage: never,
    executionOptions: never,
  ): unknown;
}

interface RuntimeCorrelationContext {
  readonly correlationId: string;
}

const correlationContext =
  new AsyncLocalStorage<RuntimeCorrelationContext>();

export function currentRuntimeGatewayCorrelationId(): string | null {
  return correlationContext.getStore()?.correlationId ?? null;
}

export class RuntimeGatewayAdapter {
  constructor(
    private readonly entrypoint: ProgramProductionEntrypointPort,
    private readonly timeoutMs = 30_000,
  ) {
    if (
      !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 ||
      timeoutMs > 300_000
    ) {
      throw new BffError(
        500,
        "RUNTIME_GATEWAY_CONFIGURATION_INVALID",
        "The Runtime Gateway timeout is invalid.",
      );
    }
  }

  execute(
    invocation: RuntimeEntrypointInvocation,
  ): Promise<RuntimeEntrypointResult> {
    return correlationContext.run(
      { correlationId: invocation.correlationId },
      () => this.executeWithTimeout(invocation),
    );
  }

  private async executeWithTimeout(
    invocation: RuntimeEntrypointInvocation,
  ): Promise<RuntimeEntrypointResult> {
    const controller = new AbortController();
    let timeout: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new RuntimeGatewayTimeoutError());
      }, this.timeoutMs);
      timeout.unref();
    });

    try {
      const runtimePromise = Promise.resolve(
        this.entrypoint.execute(
          invocation.promptPackage as never,
          {
            ...invocation.executionOptions,
            signal: controller.signal,
          } as never,
        ),
      );
      return await Promise.race([runtimePromise, timeoutPromise]);
    } catch (error) {
      throw transformRuntimeError(error, invocation.correlationId);
    } finally {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    }
  }
}

class RuntimeGatewayTimeoutError extends Error {
  constructor() {
    super("RUNTIME_GATEWAY_TIMEOUT");
    this.name = "RuntimeGatewayTimeoutError";
  }
}

function transformRuntimeError(
  error: unknown,
  correlationId: string,
): BffError {
  if (error instanceof RuntimeGatewayTimeoutError) {
    return gatewayError(
      504,
      "RUNTIME_TIMEOUT",
      "The Runtime did not respond before the deadline.",
      correlationId,
    );
  }
  if (
    error instanceof BffError &&
    error.code.startsWith("RUNTIME_")
  ) {
    return error;
  }

  const code = errorCode(error);
  if (
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH" ||
    code === "ENOTFOUND"
  ) {
    return gatewayError(
      503,
      "RUNTIME_UNAVAILABLE",
      "The Runtime is unavailable.",
      correlationId,
    );
  }

  const httpStatus = errorHttpStatus(error);
  if (httpStatus === 408 || httpStatus === 504) {
    return gatewayError(
      504,
      "RUNTIME_TIMEOUT",
      "The Runtime did not respond before the deadline.",
      correlationId,
    );
  }
  if (httpStatus !== null && httpStatus >= 500) {
    return gatewayError(
      503,
      "RUNTIME_UNAVAILABLE",
      "The Runtime is unavailable.",
      correlationId,
    );
  }
  if (httpStatus !== null && httpStatus >= 400) {
    return gatewayError(
      502,
      "RUNTIME_REQUEST_REJECTED",
      "The Runtime rejected the request.",
      correlationId,
    );
  }
  return gatewayError(
    502,
    "RUNTIME_ERROR",
    "The Runtime could not complete the request.",
    correlationId,
  );
}

function gatewayError(
  status: number,
  code: string,
  message: string,
  correlationId: string,
): BffError {
  return new BffError(status, code, message, { correlationId });
}

function errorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return null;
}

function errorHttpStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }
  for (const candidate of [
    "status" in error ? error.status : null,
    "statusCode" in error ? error.statusCode : null,
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response
      ? error.response.status
      : null,
  ]) {
    if (
      typeof candidate === "number" &&
      Number.isInteger(candidate) &&
      candidate >= 400 &&
      candidate <= 599
    ) {
      return candidate;
    }
  }
  return null;
}

import {
  RUNTIME_ACTIVE_WORK_PATH,
  parseHomeActiveWorkResponse,
  type HomeActiveWorkResponse,
} from "../../contracts/home-active-work.contract.js";
import { BffError } from "./bff.errors.js";
import type {
  HomeActiveWorkGatewayPort,
} from "./home-active-work.gateway.port.js";

export class HttpHomeActiveWorkGateway
implements HomeActiveWorkGatewayPort {
  constructor(
    private readonly runtimeOrigin: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly timeoutMs = 5_000,
  ) {
    if (
      !Number.isSafeInteger(timeoutMs)
      || timeoutMs < 1
      || timeoutMs > 30_000
    ) {
      throw new BffError(
        500,
        "HOME_ACTIVE_WORK_GATEWAY_CONFIGURATION_INVALID",
        "The HOME Active Work Gateway timeout is invalid.",
      );
    }
  }

  async list(correlationId: string): Promise<HomeActiveWorkResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    timeout.unref();

    try {
      const response = await this.fetcher(
        new URL(RUNTIME_ACTIVE_WORK_PATH, this.runtimeOrigin),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Correlation-ID": correlationId,
          },
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        throw new BffError(
          response.status >= 500 ? 503 : 502,
          response.status >= 500
            ? "RUNTIME_UNAVAILABLE"
            : "RUNTIME_REQUEST_REJECTED",
          response.status >= 500
            ? "The Runtime is unavailable."
            : "The Runtime rejected the HOME Active Work request.",
          { correlationId },
        );
      }

      try {
        return parseHomeActiveWorkResponse(await response.json());
      } catch {
        throw new BffError(
          502,
          "RUNTIME_RESPONSE_INVALID",
          "The Runtime returned an invalid HOME Active Work contract.",
          { correlationId },
        );
      }
    } catch (error) {
      if (error instanceof BffError) {
        throw error;
      }
      if (
        error instanceof DOMException
        && error.name === "AbortError"
      ) {
        throw new BffError(
          504,
          "RUNTIME_TIMEOUT",
          "The Runtime did not respond before the deadline.",
          { correlationId },
        );
      }
      throw new BffError(
        503,
        "RUNTIME_UNAVAILABLE",
        "The Runtime is unavailable.",
        { correlationId },
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

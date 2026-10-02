import {
  parseHomeActiveWorkResponse,
  RUNTIME_ACTIVE_WORK_PATH,
} from "../../contracts/home-active-work.contract.js";
import {
  parseWorkPlanResponse,
  runtimeWorkPlanPath,
  type WorkPlanResponse,
} from "../../contracts/work-plan.contract.js";
import { BffError } from "./bff.errors.js";
import type { WorkPlanGatewayPort } from "./work-plan.gateway.port.js";

export class HttpWorkPlanGateway implements WorkPlanGatewayPort {
  constructor(
    private readonly runtimeOrigin: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly timeoutMs = 5_000,
  ) {}

  async read(workId: string, correlationId: string): Promise<WorkPlanResponse> {
    const activeResponse = await this.get(RUNTIME_ACTIVE_WORK_PATH, correlationId);
    let works;
    try {
      works = parseHomeActiveWorkResponse(await activeResponse.json()).works
        .filter((item) => item.workIdentity.workId === workId);
    } catch {
      throw invalidRuntimeResponse(correlationId);
    }
    if (works.length === 0) {
      throw new BffError(404, "WORK_NOT_FOUND", "The requested Work does not exist.", { correlationId });
    }
    if (works.length !== 1) {
      throw new BffError(409, "WORK_ID_AMBIGUOUS", "The Work identity is ambiguous across projects.", { correlationId });
    }

    const identity = works[0]!.workIdentity;
    const response = await this.get(
      runtimeWorkPlanPath(identity.projectId, identity.workId),
      correlationId,
    );
    if (response.status === 404) {
      throw new BffError(404, "WORK_NOT_FOUND", "The requested Work does not exist.", { correlationId });
    }
    if (!response.ok) {
      throw response.status >= 500
        ? runtimeUnavailable(correlationId)
        : new BffError(502, "RUNTIME_REQUEST_REJECTED", "The Runtime rejected the Work Plan request.", { correlationId });
    }

    let result;
    try {
      result = parseWorkPlanResponse(await response.json());
    } catch {
      throw invalidRuntimeResponse(correlationId);
    }
    if (
      result.plan.workIdentity.projectId !== identity.projectId
      || result.plan.workIdentity.workId !== identity.workId
    ) {
      throw invalidRuntimeResponse(correlationId);
    }
    return result;
  }

  private async get(path: string, correlationId: string): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    timeout.unref();
    try {
      const response = await this.fetcher(new URL(path, this.runtimeOrigin), {
        method: "GET",
        headers: { Accept: "application/json", "X-Correlation-ID": correlationId },
        signal: controller.signal,
      });
      if (!response.ok && path === RUNTIME_ACTIVE_WORK_PATH) {
        throw runtimeUnavailable(correlationId);
      }
      return response;
    } catch (error) {
      if (error instanceof BffError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new BffError(504, "RUNTIME_TIMEOUT", "The Runtime did not respond before the deadline.", { correlationId });
      }
      throw runtimeUnavailable(correlationId);
    } finally {
      clearTimeout(timeout);
    }
  }
}

function runtimeUnavailable(correlationId: string): BffError {
  return new BffError(503, "RUNTIME_UNAVAILABLE", "The Runtime is unavailable.", { correlationId });
}

function invalidRuntimeResponse(correlationId: string): BffError {
  return new BffError(502, "RUNTIME_RESPONSE_INVALID", "The Runtime returned an invalid Work Plan contract.", { correlationId });
}

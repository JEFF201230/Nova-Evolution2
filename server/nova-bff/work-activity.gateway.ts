import {
  parseWorkActivityResponse,
  runtimeMissionEventsPath,
  type WorkActivityResponse,
  type WorkActivityRuntimeEvent,
} from "../../contracts/work-activity.contract.js";
import { BffError } from "./bff.errors.js";
import type {
  WorkActivityGatewayPort,
} from "./work-activity.gateway.port.js";

interface RuntimeMissionIdentity {
  readonly projectId: string;
  readonly missionId: string;
}

export class HttpWorkActivityGateway implements WorkActivityGatewayPort {
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
        "WORK_ACTIVITY_GATEWAY_CONFIGURATION_INVALID",
        "The Work Activity Gateway timeout is invalid.",
      );
    }
  }

  async read(
    workId: string,
    correlationId: string,
  ): Promise<WorkActivityResponse> {
    const missions = parseMissionListResponse(
      await this.getJson("/api/v1/missions", correlationId),
      correlationId,
    );
    const matches = missions.filter((mission) => mission.missionId === workId);
    if (matches.length === 0) {
      throw new BffError(
        404,
        "WORK_NOT_FOUND",
        "No Runtime mission matches the requested Work.",
        { correlationId },
      );
    }
    if (matches.length !== 1) {
      throw new BffError(
        409,
        "WORK_ID_AMBIGUOUS",
        "The Work identifier does not resolve to one Runtime mission.",
        { correlationId },
      );
    }

    const mission = matches[0];
    if (!mission) {
      throw new BffError(500, "WORK_ID_RESOLUTION_FAILED", "The Work could not be resolved.");
    }
    const events = parseMissionEventsResponse(
      await this.getJson(
        runtimeMissionEventsPath(mission.projectId, mission.missionId),
        correlationId,
      ),
      correlationId,
    );

    try {
      return parseWorkActivityResponse({
        workIdentity: {
          workId: mission.missionId,
          projectId: mission.projectId,
        },
        mission,
        events,
      });
    } catch {
      throw invalidRuntimeResponse(correlationId);
    }
  }

  private async getJson(path: string, correlationId: string): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    timeout.unref();

    try {
      const response = await this.fetcher(new URL(path, this.runtimeOrigin), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-Correlation-ID": correlationId,
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new BffError(
          response.status >= 500 ? 503 : 502,
          response.status >= 500
            ? "RUNTIME_UNAVAILABLE"
            : "RUNTIME_REQUEST_REJECTED",
          response.status >= 500
            ? "The Runtime is unavailable."
            : "The Runtime rejected the Work Activity request.",
          { correlationId },
        );
      }
      try {
        return await response.json();
      } catch {
        throw invalidRuntimeResponse(correlationId);
      }
    } catch (error) {
      if (error instanceof BffError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "AbortError") {
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

function parseMissionListResponse(value: unknown, correlationId: string): RuntimeMissionIdentity[] {
  if (!isRecord(value) || !hasExactKeys(value, ["missions"]) || !Array.isArray(value.missions)) {
    throw invalidRuntimeResponse(correlationId);
  }
  return value.missions.map((mission) => {
    if (
      !isRecord(mission)
      || !isNonEmptyString(mission.projectId)
      || !isNonEmptyString(mission.missionId)
    ) {
      throw invalidRuntimeResponse(correlationId);
    }
    return { projectId: mission.projectId, missionId: mission.missionId };
  });
}

function parseMissionEventsResponse(
  value: unknown,
  correlationId: string,
): readonly WorkActivityRuntimeEvent[] {
  if (!isRecord(value) || !hasExactKeys(value, ["events"]) || !Array.isArray(value.events)) {
    throw invalidRuntimeResponse(correlationId);
  }
  return value.events as WorkActivityRuntimeEvent[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value === value.trim();
}

function invalidRuntimeResponse(correlationId: string): BffError {
  return new BffError(
    502,
    "RUNTIME_RESPONSE_INVALID",
    "The Runtime returned an invalid Work Activity contract.",
    { correlationId },
  );
}

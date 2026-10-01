import { BffError } from "./bff.errors.js";
import type {
  MissionCreateRequestDto,
  MissionCreateResponseDto,
  MissionExecuteRequestDto,
  MissionExecuteResponseDto,
  MissionRuntimeMissionView,
  MissionRuntimeProjectsResponseDto,
  MissionRuntimeReportView,
} from "./mission-runtime.contract.js";
import type { MissionRuntimeGatewayPort } from "./mission-runtime.gateway.port.js";

const NOVA_CORE_MISSIONS_PATH = "/api/v1/missions";
const NOVA_CORE_PROJECTS_PATH = "/api/v1/projects";
const DEFAULT_CREATE_TIMEOUT_MS = 5_000;
const DEFAULT_EXECUTION_TIMEOUT_MS = 30 * 60_000;
const EXECUTION_TRANSPORT_MARGIN_MS = 30_000;
const MAX_TIMEOUT_MS = 24 * 60 * 60_000 + 60_000;
const MAX_RESPONSE_BYTES = 256 * 1_024;

export class HttpMissionRuntimeGateway implements MissionRuntimeGatewayPort {
  constructor(
    private readonly runtimeOrigin: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly timeoutMs?: number,
  ) {
    if (
      timeoutMs !== undefined
      && (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT_MS)
    ) {
      throw new BffError(
        500,
        "MISSION_RUNTIME_GATEWAY_CONFIGURATION_INVALID",
        "The Mission Runtime Gateway timeout is invalid.",
      );
    }
  }

  async listProjectTargets(correlationId: string): Promise<MissionRuntimeProjectsResponseDto> {
    const response = await this.requestJson(
      "GET",
      NOVA_CORE_PROJECTS_PATH,
      undefined,
      correlationId,
      this.timeoutMs ?? DEFAULT_CREATE_TIMEOUT_MS,
    );
    if (response.status !== 200 || !isRecord(response.value) || !Array.isArray(response.value.projects)) {
      throw invalidResponse(correlationId);
    }
    const projects = response.value.projects.map((project) => {
      if (!isRecord(project)) {
        throw invalidResponse(correlationId);
      }
      return { projectId: requiredString(project.projectId, correlationId) };
    });
    if (new Set(projects.map(({ projectId }) => projectId)).size !== projects.length) {
      throw invalidResponse(correlationId);
    }
    return { projects };
  }

  async createMission(
    request: MissionCreateRequestDto,
    correlationId: string,
  ): Promise<MissionCreateResponseDto> {
    const response = await this.postJson(
      NOVA_CORE_MISSIONS_PATH,
      request,
      correlationId,
      this.timeoutMs ?? DEFAULT_CREATE_TIMEOUT_MS,
    );
    if (response.status !== 200 && response.status !== 201) {
      throw invalidResponse(correlationId);
    }
    const value = response.value;
    if (!isRecord(value) || typeof value.created !== "boolean" || !isRecord(value.mission)) {
      throw invalidResponse(correlationId);
    }
    if ((response.status === 201) !== value.created) {
      throw invalidResponse(correlationId);
    }
    const mission = missionView(value.mission, correlationId);
    if (mission.projectId !== request.projectId || mission.missionId !== request.missionId) {
      throw invalidResponse(correlationId);
    }
    return { created: value.created, mission };
  }

  async executeMission(
    projectId: string,
    missionId: string,
    request: MissionExecuteRequestDto,
    correlationId: string,
  ): Promise<MissionExecuteResponseDto> {
    const path = `${NOVA_CORE_MISSIONS_PATH}/${encodeURIComponent(projectId)}/${encodeURIComponent(missionId)}/execute`;
    const executionTimeoutMs = Math.min(
      (request.timeoutMs ?? DEFAULT_EXECUTION_TIMEOUT_MS) + EXECUTION_TRANSPORT_MARGIN_MS,
      MAX_TIMEOUT_MS,
    );
    const response = await this.postJson(
      path,
      request,
      correlationId,
      this.timeoutMs ?? executionTimeoutMs,
    );
    if (response.status !== 200) {
      throw invalidResponse(correlationId);
    }
    const value = response.value;
    if (!isRecord(value) || !isRecord(value.mission) || !isRecord(value.report)) {
      throw invalidResponse(correlationId);
    }
    const mission = missionView(value.mission, correlationId);
    const report = reportView(value.report, correlationId);
    if (
      mission.projectId !== projectId
      || mission.missionId !== missionId
      || report.projectId !== projectId
      || report.missionId !== missionId
      || mission.runId !== report.runId
      || mission.reportId !== report.reportId
    ) {
      throw invalidResponse(correlationId);
    }
    return { mission, report };
  }

  private async postJson(
    path: string,
    body: MissionCreateRequestDto | MissionExecuteRequestDto,
    correlationId: string,
    timeoutMs: number,
  ): Promise<{ status: number; value: unknown }> {
    return await this.requestJson("POST", path, body, correlationId, timeoutMs);
  }

  private async requestJson(
    method: "GET" | "POST",
    path: string,
    body: MissionCreateRequestDto | MissionExecuteRequestDto | undefined,
    correlationId: string,
    timeoutMs: number,
  ): Promise<{ status: number; value: unknown }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    timeout.unref();
    try {
      const response = await this.fetcher(new URL(path, this.runtimeOrigin), {
        method,
        headers: {
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          "X-Correlation-ID": correlationId,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw normalizeNovaCoreError(response.status, correlationId);
      }
      return {
        status: response.status,
        value: await readJson(response, correlationId),
      };
    } catch (error) {
      if (error instanceof BffError) {
        throw error;
      }
      if (isAbortError(error)) {
        throw new BffError(
          504,
          "NOVA_CORE_TIMEOUT",
          "NOVA Core did not respond before the deadline.",
          { correlationId },
        );
      }
      throw new BffError(
        503,
        "NOVA_CORE_UNAVAILABLE",
        "NOVA Core is unavailable.",
        { correlationId },
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function readJson(response: Response, correlationId: string): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  const declaredLength = Number(response.headers.get("content-length"));
  if (
    contentType !== "application/json"
    || (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES)
  ) {
    throw invalidResponse(correlationId);
  }
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) {
    throw invalidResponse(correlationId);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw invalidResponse(correlationId);
  }
}

function missionView(
  value: Record<string, unknown>,
  correlationId: string,
): MissionRuntimeMissionView {
  const projectId = requiredString(value.projectId, correlationId);
  const missionId = requiredString(value.missionId, correlationId);
  const missionType = requiredString(value.missionType, correlationId);
  const state = requiredString(value.state, correlationId);
  const canonicalState = requiredString(value.canonicalState, correlationId);
  const assignedAgentId = nullableString(value.assignedAgentId, correlationId);
  const runId = nullableString(value.runId, correlationId);
  const reportId = nullableString(value.reportId, correlationId);
  const updatedAt = requiredString(value.updatedAt, correlationId);
  return {
    projectId,
    missionId,
    missionType,
    state,
    canonicalState,
    assignedAgentId,
    runId,
    reportId,
    updatedAt,
  };
}

function reportView(
  value: Record<string, unknown>,
  correlationId: string,
): MissionRuntimeReportView {
  const reportFingerprint = requiredString(value.reportFingerprint, correlationId);
  if (!/^[a-f0-9]{64}$/i.test(reportFingerprint)) {
    throw invalidResponse(correlationId);
  }
  if (typeof value.scopeConfirmed !== "boolean") {
    throw invalidResponse(correlationId);
  }
  return {
    projectId: requiredString(value.projectId, correlationId),
    missionId: requiredString(value.missionId, correlationId),
    reportId: requiredString(value.reportId, correlationId),
    reportType: requiredString(value.reportType, correlationId),
    runId: requiredString(value.runId, correlationId),
    reportFingerprint: reportFingerprint.toLowerCase(),
    scopeConfirmed: value.scopeConfirmed,
    submittedAt: requiredString(value.submittedAt, correlationId),
  };
}

function requiredString(value: unknown, correlationId: string): string {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw invalidResponse(correlationId);
  }
  return value;
}

function nullableString(value: unknown, correlationId: string): string | null {
  if (value === null) {
    return null;
  }
  return requiredString(value, correlationId);
}

function normalizeNovaCoreError(status: number, correlationId: string): BffError {
  if (status === 400) {
    return new BffError(400, "NOVA_CORE_REQUEST_INVALID", "NOVA Core rejected the request contract.", { correlationId });
  }
  if (status === 404) {
    return new BffError(404, "MISSION_NOT_FOUND", "The requested Mission was not found.", { correlationId });
  }
  if (status === 409) {
    return new BffError(409, "MISSION_CONFLICT", "The Mission request conflicts with its current state.", { correlationId });
  }
  if (status === 422) {
    return new BffError(422, "MISSION_EXECUTION_REJECTED", "NOVA Core rejected the Mission execution.", { correlationId });
  }
  if (status >= 500) {
    return new BffError(503, "NOVA_CORE_UNAVAILABLE", "NOVA Core is unavailable.", { correlationId });
  }
  return new BffError(502, "NOVA_CORE_REQUEST_REJECTED", "NOVA Core rejected the Mission Runtime request.", { correlationId });
}

function invalidResponse(correlationId: string): BffError {
  return new BffError(
    502,
    "NOVA_CORE_RESPONSE_INVALID",
    "NOVA Core returned an invalid Mission Runtime contract.",
    { correlationId },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

import {
  parseGlobalDeliverablesResponse,
  type GlobalDeliverableEvidence,
  type GlobalDeliverablesResponse,
} from "../../contracts/global-deliverables.contract.js";
import { BffError } from "./bff.errors.js";
import type { GlobalDeliverablesGatewayPort } from "./global-deliverables.gateway.port.js";

interface RuntimeMission {
  readonly projectId: string;
  readonly missionId: string;
  readonly reportId: string | null;
}

interface RuntimeReport {
  readonly projectId: string;
  readonly missionId: string;
  readonly reportId: string;
  readonly deliverableEvidence: readonly RuntimeEvidence[];
}

interface RuntimeEvidence {
  readonly path: string;
  readonly size: number;
  readonly sha256: string;
  readonly modifiedAt: string;
  readonly runId: string;
}

export class HttpGlobalDeliverablesGateway implements GlobalDeliverablesGatewayPort {
  constructor(
    private readonly runtimeOrigin: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly timeoutMs = 5_000,
  ) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) {
      throw new BffError(500, "GLOBAL_DELIVERABLES_GATEWAY_CONFIGURATION_INVALID", "The Global Deliverables Gateway timeout is invalid.");
    }
  }

  async list(correlationId: string): Promise<GlobalDeliverablesResponse> {
    const missions = parseMissionList(await this.getJson("/api/v1/missions", correlationId), correlationId);
    rejectReportIdCollisions(missions, correlationId);

    const deliverables: GlobalDeliverableEvidence[] = [];
    for (const listedMission of missions) {
      if (listedMission.reportId === null) {
        continue;
      }
      const detail = parseMissionDetail(
        await this.getJson(runtimeMissionPath(listedMission.projectId, listedMission.missionId), correlationId),
        correlationId,
      );
      if (
        detail.mission.projectId !== detail.report.projectId
        || detail.mission.missionId !== detail.report.missionId
        || detail.mission.reportId !== detail.report.reportId
        || detail.mission.projectId !== listedMission.projectId
        || detail.mission.missionId !== listedMission.missionId
        || detail.mission.reportId !== listedMission.reportId
      ) {
        throw invalidRuntimeResponse(correlationId);
      }
      for (const evidence of detail.report.deliverableEvidence) {
        deliverables.push({
          projectId: detail.report.projectId,
          missionId: detail.report.missionId,
          reportId: detail.report.reportId,
          ...evidence,
        });
      }
    }

    try {
      return parseGlobalDeliverablesResponse({ deliverables });
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
        headers: { Accept: "application/json", "X-Correlation-ID": correlationId },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new BffError(
          response.status >= 500 ? 503 : 502,
          response.status >= 500 ? "RUNTIME_UNAVAILABLE" : "RUNTIME_REQUEST_REJECTED",
          response.status >= 500 ? "The Runtime is unavailable." : "The Runtime rejected the Global Deliverables request.",
          { correlationId },
        );
      }
      try {
        return await response.json();
      } catch {
        throw invalidRuntimeResponse(correlationId);
      }
    } catch (error) {
      if (error instanceof BffError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new BffError(504, "RUNTIME_TIMEOUT", "The Runtime did not respond before the deadline.", { correlationId });
      }
      throw new BffError(503, "RUNTIME_UNAVAILABLE", "The Runtime is unavailable.", { correlationId });
    } finally {
      clearTimeout(timeout);
    }
  }
}

function runtimeMissionPath(projectId: string, missionId: string): string {
  return `/api/v1/missions/${encodeURIComponent(projectId)}/${encodeURIComponent(missionId)}`;
}

function parseMissionList(value: unknown, correlationId: string): readonly RuntimeMission[] {
  if (!isRecord(value) || !hasExactKeys(value, ["missions"]) || !Array.isArray(value.missions)) {
    throw invalidRuntimeResponse(correlationId);
  }
  return value.missions.map((mission) => parseRuntimeMission(mission, correlationId));
}

function parseMissionDetail(value: unknown, correlationId: string): { mission: RuntimeMission; report: RuntimeReport } {
  if (!isRecord(value)
    || !hasExactKeys(value, ["events", "incompleteRuns", "mission", "observabilityEvents", "report"])
    || !Array.isArray(value.events)
    || !Array.isArray(value.observabilityEvents)
    || !Array.isArray(value.incompleteRuns)) {
    throw invalidRuntimeResponse(correlationId);
  }
  const mission = parseRuntimeMission(value.mission, correlationId);
  const report = parseRuntimeReport(value.report, correlationId);
  return { mission, report };
}

const MISSION_REQUIRED_KEYS = [
  "assignedAgentId", "authority", "canonicalState", "contextId", "deliverables", "lockId",
  "missionId", "missionType", "objective", "projectId", "reportId", "runId", "scope",
  "state", "stopCriteria", "authorizedReferences", "updatedAt",
] as const;
const MISSION_OPTIONAL_KEYS = ["createdAt", "priority", "requestedAgentId"] as const;

function parseRuntimeMission(value: unknown, correlationId: string): RuntimeMission {
  if (!isRecord(value) || !hasAllowedKeys(value, MISSION_REQUIRED_KEYS, MISSION_OPTIONAL_KEYS)) {
    throw invalidRuntimeResponse(correlationId);
  }
  for (const key of MISSION_REQUIRED_KEYS) if (!(key in value)) throw invalidRuntimeResponse(correlationId);
  if (!isNonEmptyString(value.projectId) || !isNonEmptyString(value.missionId)
    || !(value.reportId === null || isNonEmptyString(value.reportId))) {
    throw invalidRuntimeResponse(correlationId);
  }
  return { projectId: value.projectId, missionId: value.missionId, reportId: value.reportId };
}

const REPORT_REQUIRED_KEYS = [
  "agentId", "blockers", "checks", "deliverables", "errors", "filesChanged", "missionId",
  "projectId", "reportId", "reportType", "scopeConfirmed", "submittedAt",
] as const;
const REPORT_OPTIONAL_KEYS = [
  "branch", "certificate", "codexBinaryHash", "codexConfigPolicy", "codexPath", "codexVersion",
  "deliverableEvidence", "diagnostics", "executionRequestHash", "executionRequestPath", "head",
  "manifestHash", "manifestPath", "promptHash", "promptPath", "reportFingerprint", "reportPath",
  "repositoryRoot", "runBindingPath", "runId",
] as const;

function parseRuntimeReport(value: unknown, correlationId: string): RuntimeReport {
  if (!isRecord(value) || !hasAllowedKeys(value, REPORT_REQUIRED_KEYS, REPORT_OPTIONAL_KEYS)) {
    throw invalidRuntimeResponse(correlationId);
  }
  for (const key of REPORT_REQUIRED_KEYS) if (!(key in value)) throw invalidRuntimeResponse(correlationId);
  if (!isNonEmptyString(value.projectId) || !isNonEmptyString(value.missionId) || !isNonEmptyString(value.reportId)) {
    throw invalidRuntimeResponse(correlationId);
  }
  const evidenceValue = value.deliverableEvidence;
  if (evidenceValue !== undefined && !Array.isArray(evidenceValue)) throw invalidRuntimeResponse(correlationId);
  const deliverableEvidence = (evidenceValue ?? []).map((evidence) => parseEvidence(evidence, correlationId));
  return { projectId: value.projectId, missionId: value.missionId, reportId: value.reportId, deliverableEvidence };
}

function parseEvidence(value: unknown, correlationId: string): RuntimeEvidence {
  if (!isRecord(value) || !hasExactKeys(value, ["modifiedAt", "path", "runId", "sha256", "size"])
    || !isNonEmptyString(value.path) || !Number.isSafeInteger(value.size) || (value.size as number) < 0
    || typeof value.sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(value.sha256)
    || !isTimestamp(value.modifiedAt) || !isNonEmptyString(value.runId)) {
    throw invalidRuntimeResponse(correlationId);
  }
  return { path: value.path, size: value.size as number, sha256: value.sha256, modifiedAt: value.modifiedAt, runId: value.runId };
}

function rejectReportIdCollisions(missions: readonly RuntimeMission[], correlationId: string): void {
  const seen = new Set<string>();
  for (const mission of missions) {
    if (mission.reportId === null) continue;
    const identity = `${mission.projectId}\u0000${mission.reportId}`;
    if (seen.has(identity)) throw invalidRuntimeResponse(correlationId);
    seen.add(identity);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value === value.trim();
}
function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort(); const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}
function hasAllowedKeys(value: Record<string, unknown>, required: readonly string[], optional: readonly string[]): boolean {
  const allowed = new Set([...required, ...optional]);
  return Object.keys(value).every((key) => allowed.has(key));
}
function invalidRuntimeResponse(correlationId: string): BffError {
  return new BffError(502, "RUNTIME_RESPONSE_INVALID", "The Runtime returned an invalid Global Deliverables contract.", { correlationId });
}

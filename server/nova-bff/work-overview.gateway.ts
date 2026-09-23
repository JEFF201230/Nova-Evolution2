import { parseHomeActiveWorkResponse, RUNTIME_ACTIVE_WORK_PATH } from "../../contracts/home-active-work.contract.js";
import { parseWorkOverviewNotReady, parseWorkOverviewResponse, runtimeWorkOverviewPath, type WorkOverviewResponse } from "../../contracts/work-overview.contract.js";
import { BffError } from "./bff.errors.js";
import type { WorkOverviewGatewayPort } from "./work-overview.gateway.port.js";

export class HttpWorkOverviewGateway implements WorkOverviewGatewayPort {
  constructor(private readonly runtimeOrigin: string, private readonly fetcher: typeof fetch = fetch) {}
  async get(workId: string, correlationId: string): Promise<WorkOverviewResponse> {
    const activeResponse = await this.fetcher(new URL(RUNTIME_ACTIVE_WORK_PATH, this.runtimeOrigin), { headers: { Accept: "application/json", "X-Correlation-ID": correlationId } });
    if (!activeResponse.ok) throw unavailable(correlationId);
    let works;
    try { works = parseHomeActiveWorkResponse(await activeResponse.json()).works.filter((item) => item.workIdentity.workId === workId); }
    catch { throw invalid(correlationId); }
    if (works.length === 0) throw new BffError(404, "WORK_NOT_FOUND", "The requested Work does not exist.", { correlationId });
    if (works.length !== 1) throw new BffError(409, "WORK_ID_AMBIGUOUS", "The Work identity is ambiguous across projects.", { correlationId });
    const response = await this.fetcher(new URL(runtimeWorkOverviewPath(works[0]!.workIdentity.projectId, workId), this.runtimeOrigin), { headers: { Accept: "application/json", "X-Correlation-ID": correlationId } });
    if (response.status === 409) {
      let missingGroups;
      try { missingGroups = parseWorkOverviewNotReady(await response.json()).error.missingGroups; }
      catch { throw invalid(correlationId); }
      throw new BffError(409, "WORK_OVERVIEW_NOT_READY", "The Work Overview authoritative producers are not ready.", { correlationId, missingGroups });
    }
    if (response.status === 404) throw new BffError(404, "WORK_NOT_FOUND", "The requested Work does not exist.", { correlationId });
    if (!response.ok) throw unavailable(correlationId);
    try { return parseWorkOverviewResponse(await response.json()); } catch { throw invalid(correlationId); }
  }
}
function unavailable(correlationId: string): BffError { return new BffError(503, "RUNTIME_UNAVAILABLE", "The Runtime is unavailable.", { correlationId }); }
function invalid(correlationId: string): BffError { return new BffError(502, "RUNTIME_RESPONSE_INVALID", "The Runtime returned an invalid Work Overview contract.", { correlationId }); }

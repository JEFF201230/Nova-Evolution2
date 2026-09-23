import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import type { BffRequestContext } from "./bff.types.js";
import { requireAuthentication } from "./middleware/authentication.js";
import type { WorkOverviewGatewayPort } from "./work-overview.gateway.port.js";

export function workIdFromOverviewPath(pathname: string): string | null {
  const match = /^\/api\/work\/([^/]+)\/overview$/u.exec(pathname);
  if (!match) return null;
  try { const value = decodeURIComponent(match[1]!); return value.length > 0 && value.trim() === value ? value : null; } catch { return null; }
}
export async function handleWorkOverview(context: BffRequestContext, gateway: WorkOverviewGatewayPort | undefined, workId: string): Promise<void> {
  await requireAuthentication(context, async () => undefined);
  if (!gateway) throw new BffError(500, "WORK_OVERVIEW_GATEWAY_NOT_CONFIGURED", "The Work Overview Gateway is not configured.");
  try { sendJson(context.response, 200, await gateway.get(workId, context.correlationId)); }
  catch (error) {
    if (error instanceof BffError && error.status === 409 && error.code === "WORK_OVERVIEW_NOT_READY" && Array.isArray(error.details?.missingGroups)) {
      sendJson(context.response, 409, { error: { code: "WORK_OVERVIEW_NOT_READY", missingGroups: error.details.missingGroups } });
      return;
    }
    throw error;
  }
}

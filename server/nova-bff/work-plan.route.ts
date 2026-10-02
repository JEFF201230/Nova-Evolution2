import { WORK_PLAN_PATH_PREFIX } from "../../contracts/work-plan.contract.js";
import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import type { BffRequestContext } from "./bff.types.js";
import { requireAuthentication } from "./middleware/authentication.js";
import type { WorkPlanGatewayPort } from "./work-plan.gateway.port.js";

export function workIdFromPlanPath(pathname: string): string | null {
  const match = new RegExp(`^${WORK_PLAN_PATH_PREFIX}/([^/]+)/plan$`, "u").exec(pathname);
  if (!match?.[1]) return null;
  try {
    const workId = decodeURIComponent(match[1]);
    return workId.length > 0 && workId === workId.trim() ? workId : null;
  } catch {
    return null;
  }
}

export async function handleWorkPlan(
  context: BffRequestContext,
  gateway: WorkPlanGatewayPort | undefined,
  workId: string,
): Promise<void> {
  await requireAuthentication(context, async () => undefined);
  if (!gateway) {
    throw new BffError(500, "WORK_PLAN_GATEWAY_NOT_CONFIGURED", "The Work Plan Gateway is not configured.");
  }
  sendJson(context.response, 200, await gateway.read(workId, context.correlationId));
}

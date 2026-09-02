import {
  WORK_ACTIVITY_PATH_PREFIX,
} from "../../contracts/work-activity.contract.js";
import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import type { BffRequestContext } from "./bff.types.js";
import { requireAuthentication } from "./middleware/authentication.js";
import type {
  WorkActivityGatewayPort,
} from "./work-activity.gateway.port.js";

export function workIdFromActivityPath(pathname: string): string | null {
  const match = new RegExp(`^${WORK_ACTIVITY_PATH_PREFIX}/([^/]+)/activity$`).exec(pathname);
  if (!match?.[1]) {
    return null;
  }
  try {
    const workId = decodeURIComponent(match[1]);
    return workId.length > 0 && workId === workId.trim() ? workId : null;
  } catch {
    return null;
  }
}

export async function handleWorkActivity(
  context: BffRequestContext,
  gateway: WorkActivityGatewayPort | undefined,
  workId: string,
): Promise<void> {
  await requireAuthentication(context, async () => undefined);
  if (!gateway) {
    throw new BffError(
      500,
      "WORK_ACTIVITY_GATEWAY_NOT_CONFIGURED",
      "The Work Activity Gateway is not configured.",
    );
  }
  sendJson(
    context.response,
    200,
    await gateway.read(workId, context.correlationId),
  );
}

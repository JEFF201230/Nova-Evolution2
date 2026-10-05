import { WORK_PEOPLE_PATH_PREFIX } from "../../contracts/work-people.contract.js";
import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import type { BffRequestContext } from "./bff.types.js";
import { requireAuthentication } from "./middleware/authentication.js";
import type { WorkPeopleGatewayPort } from "./work-people.gateway.port.js";

export function workIdFromPeoplePath(pathname: string): string | null {
  const match = new RegExp(`^${WORK_PEOPLE_PATH_PREFIX}/([^/]+)/people$`, "u").exec(pathname);
  if (!match?.[1]) return null;
  try {
    const workId = decodeURIComponent(match[1]);
    return workId.length > 0 && workId === workId.trim() ? workId : null;
  } catch {
    return null;
  }
}

export async function handleWorkPeople(
  context: BffRequestContext,
  gateway: WorkPeopleGatewayPort | undefined,
  workId: string,
): Promise<void> {
  await requireAuthentication(context, async () => undefined);
  if (!gateway) throw new BffError(500, "WORK_PEOPLE_GATEWAY_NOT_CONFIGURED", "The Work People Gateway is not configured.");
  sendJson(context.response, 200, await gateway.read(workId, context.correlationId));
}

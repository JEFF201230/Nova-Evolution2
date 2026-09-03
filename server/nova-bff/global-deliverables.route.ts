import { GLOBAL_DELIVERABLES_PATH } from "../../contracts/global-deliverables.contract.js";
import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import type { BffRequestContext } from "./bff.types.js";
import type { GlobalDeliverablesGatewayPort } from "./global-deliverables.gateway.port.js";
import { requireAuthentication } from "./middleware/authentication.js";

export { GLOBAL_DELIVERABLES_PATH };

export async function handleGlobalDeliverables(
  context: BffRequestContext,
  gateway: GlobalDeliverablesGatewayPort | undefined,
): Promise<void> {
  await requireAuthentication(context, async () => undefined);
  if (!gateway) {
    throw new BffError(500, "GLOBAL_DELIVERABLES_GATEWAY_NOT_CONFIGURED", "The Global Deliverables Gateway is not configured.");
  }
  sendJson(context.response, 200, await gateway.list(context.correlationId));
}

import {
  HOME_ACTIVE_WORK_PATH,
} from "../../contracts/home-active-work.contract.js";
import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import type {
  HomeActiveWorkGatewayPort,
} from "./home-active-work.gateway.port.js";
import type { BffRequestContext } from "./bff.types.js";
import { requireAuthentication } from "./middleware/authentication.js";

export async function handleHomeActiveWork(
  context: BffRequestContext,
  gateway: HomeActiveWorkGatewayPort | undefined,
): Promise<void> {
  await requireAuthentication(context, async () => undefined);
  if (!gateway) {
    throw new BffError(
      500,
      "HOME_ACTIVE_WORK_GATEWAY_NOT_CONFIGURED",
      "The HOME Active Work Gateway is not configured.",
    );
  }

  const response = await gateway.list(context.correlationId);
  sendJson(context.response, 200, response);
}

export { HOME_ACTIVE_WORK_PATH };

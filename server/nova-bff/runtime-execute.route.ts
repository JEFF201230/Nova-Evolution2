import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import {
  RUNTIME_EXECUTE_PATH,
  parseRuntimeExecuteCommand,
  runtimeExecuteSuccessView,
} from "./runtime-execute.contract.js";
import type { RuntimeGatewayPort } from "./runtime-gateway.port.js";
import type {
  BffMiddleware,
  BffRequestContext,
} from "./bff.types.js";
import { requireAuthentication } from "./middleware/authentication.js";

export const runtimeExecuteAuthenticationMiddleware: BffMiddleware = async (
  context,
  next,
) => {
  if (
    context.request.method === "POST"
    && context.pathname === RUNTIME_EXECUTE_PATH
  ) {
    await requireAuthentication(context, next);
    return;
  }
  await next();
};

export async function handleRuntimeExecute(
  context: BffRequestContext,
  runtimeGateway: RuntimeGatewayPort | undefined,
): Promise<void> {
  if (!runtimeGateway) {
    throw new BffError(
      500,
      "RUNTIME_GATEWAY_NOT_CONFIGURED",
      "The Runtime Gateway is not configured.",
    );
  }
  const command = parseRuntimeExecuteCommand(
    context.jsonBody,
    context.correlationId,
  );
  context.correlationId = command.correlationId;
  context.response.setHeader("X-Correlation-ID", command.correlationId);

  const runtimeResponse = await runtimeGateway.execute(
    command.gatewayRequest,
  );
  if (runtimeResponse.correlationId !== command.correlationId) {
    throw new BffError(
      502,
      "RUNTIME_RESPONSE_INVALID",
      "The Runtime returned an invalid contract.",
    );
  }
  sendJson(
    context.response,
    200,
    runtimeExecuteSuccessView(runtimeResponse),
  );
}

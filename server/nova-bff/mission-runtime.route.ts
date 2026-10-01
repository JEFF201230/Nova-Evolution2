import { BffError } from "./bff.errors.js";
import { sendJson } from "./bff.http.js";
import {
  MISSION_RUNTIME_MISSIONS_PATH,
  MISSION_RUNTIME_PROJECTS_PATH,
  missionIdentityFromExecutePath,
  parseMissionCreateRequest,
  parseMissionExecuteRequest,
} from "./mission-runtime.contract.js";
import type { MissionRuntimeGatewayPort } from "./mission-runtime.gateway.port.js";
import type { BffMiddleware, BffRequestContext } from "./bff.types.js";
import { requireAuthentication } from "./middleware/authentication.js";

export const missionRuntimeAuthenticationMiddleware: BffMiddleware = async (
  context,
  next,
) => {
  if (isMissionRuntimeRequest(context)) {
    await requireAuthentication(context, next);
    return;
  }
  await next();
};

export async function handleMissionRuntimeProjects(
  context: BffRequestContext,
  gateway: MissionRuntimeGatewayPort | undefined,
): Promise<void> {
  sendJson(
    context.response,
    200,
    await requireGateway(gateway).listProjectTargets(context.correlationId),
  );
}

export async function handleMissionCreate(
  context: BffRequestContext,
  gateway: MissionRuntimeGatewayPort | undefined,
): Promise<void> {
  const connected = requireGateway(gateway);
  const result = await connected.createMission(
    parseMissionCreateRequest(context.jsonBody),
    context.correlationId,
  );
  sendJson(context.response, result.created ? 201 : 200, result);
}

export async function handleMissionExecute(
  context: BffRequestContext,
  gateway: MissionRuntimeGatewayPort | undefined,
  projectId: string,
  missionId: string,
): Promise<void> {
  const connected = requireGateway(gateway);
  sendJson(
    context.response,
    200,
    await connected.executeMission(
      projectId,
      missionId,
      parseMissionExecuteRequest(context.jsonBody),
      context.correlationId,
    ),
  );
}

function isMissionRuntimeRequest(context: BffRequestContext): boolean {
  return (
    context.request.method === "GET"
    && context.pathname === MISSION_RUNTIME_PROJECTS_PATH
  ) || (
    context.request.method === "POST"
    && (
      context.pathname === MISSION_RUNTIME_MISSIONS_PATH
      || missionIdentityFromExecutePath(context.pathname) !== null
    )
  );
}

function requireGateway(
  gateway: MissionRuntimeGatewayPort | undefined,
): MissionRuntimeGatewayPort {
  if (!gateway) {
    throw new BffError(
      500,
      "MISSION_RUNTIME_GATEWAY_NOT_CONFIGURED",
      "The Mission Runtime Gateway is not configured.",
    );
  }
  return gateway;
}

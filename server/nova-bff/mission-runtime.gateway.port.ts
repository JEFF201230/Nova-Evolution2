import type {
  MissionCreateRequestDto,
  MissionCreateResponseDto,
  MissionExecuteRequestDto,
  MissionExecuteResponseDto,
} from "./mission-runtime.contract.js";

export interface MissionRuntimeGatewayPort {
  createMission(
    request: MissionCreateRequestDto,
    correlationId: string,
  ): Promise<MissionCreateResponseDto>;
  executeMission(
    projectId: string,
    missionId: string,
    request: MissionExecuteRequestDto,
    correlationId: string,
  ): Promise<MissionExecuteResponseDto>;
}

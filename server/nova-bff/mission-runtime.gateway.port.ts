import type {
  MissionCreateRequestDto,
  MissionCreateResponseDto,
  MissionExecuteRequestDto,
  MissionExecuteResponseDto,
  MissionRuntimeProjectsResponseDto,
} from "./mission-runtime.contract.js";

export interface MissionRuntimeGatewayPort {
  listProjectTargets(correlationId: string): Promise<MissionRuntimeProjectsResponseDto>;
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

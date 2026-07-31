export interface RuntimeGatewayRequestDto {
  readonly correlationId: string;
  readonly promptPackage: unknown;
  readonly executionOptions: unknown;
}

export interface RuntimeGatewayResponseDto {
  readonly correlationId: string;
  readonly missionId: string;
  readonly executionSessionId: string;
  readonly status: "CERTIFIED";
  readonly runtime: {
    readonly status: "SUCCESS";
    readonly completedAt: string;
  };
  readonly certification: {
    readonly decision: "GO";
    readonly bundleFingerprint: string;
  };
}

export interface RuntimeGatewayPort {
  execute(
    request: RuntimeGatewayRequestDto,
  ): Promise<RuntimeGatewayResponseDto>;
}

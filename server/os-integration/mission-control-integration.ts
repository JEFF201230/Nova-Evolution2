export interface MissionControlIntegration {
  readonly missionOrderId: string;
  readonly authority: string;
  readonly decision: string;
  readonly dependencyStatus: string;
}

export function createMissionControlIntegration(
  missionOrderId: string,
  authority: string,
  decision: string,
  dependencyStatus: string,
): MissionControlIntegration {
  return {
    missionOrderId,
    authority,
    decision,
    dependencyStatus,
  };
}

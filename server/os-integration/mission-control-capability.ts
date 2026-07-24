export interface MissionControlCapability {
  readonly missionOrderStatus: string;
  readonly campaignStatus: string;
  readonly certificationStatus: string;
  readonly dependencyStatus: string;
  readonly runtimeEvidenceStatus: string;
  readonly traceabilityStatus: string;
}

export function createMissionControlCapability(
  missionOrderStatus: string,
  campaignStatus: string,
  certificationStatus: string,
  dependencyStatus: string,
  runtimeEvidenceStatus: string,
  traceabilityStatus: string,
): MissionControlCapability {
  return {
    missionOrderStatus,
    campaignStatus,
    certificationStatus,
    dependencyStatus,
    runtimeEvidenceStatus,
    traceabilityStatus,
  };
}

import {
  PEOPLE_LOT_RUNTIME_EXECUTION_CONTRACT_ADAPTER,
  type PeopleLotRuntimeExecutionContract,
} from "./people-lot-runtime-execution-contract.adapter.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";

export type DomainV2MissionIntakeBridgeErrorCode =
  | "DV2MIB-001"
  | "DV2MIB-002"
  | "DV2MIB-003"
  | "DV2MIB-004"
  | "DV2MIB-005"
  | "DV2MIB-006"
  | "DV2MIB-007"
  | "DV2MIB-008";

export interface DomainV2MissionIntake {
  readonly schemaVersion: "1.0.0";
  readonly kind: "DOMAIN_V2_MISSION_INTAKE";
  readonly domainId: "PEOPLE";
  readonly lotId: "P3-PEOPLE-001D";
  readonly missionId: string;
  readonly requestId: string;
  readonly authorityDomain: "PEOPLE";
  readonly acceptanceCriteria: readonly string[];
  readonly peopleLotRuntimeExecutionContract: PeopleLotRuntimeExecutionContract;
  readonly runtimeExecutionContract: RuntimeExecutionContract;
}

export interface DomainV2MissionIntakeBridgeFeatureFlag {
  readonly enabled: boolean;
}

export interface DomainV2MissionIntakeBridgeComponents {
  readonly peopleLotAdapter: Readonly<{
    adapt(
      runtimeExecutionContract: RuntimeExecutionContract,
    ): PeopleLotRuntimeExecutionContract;
  }>;
}

export class DomainV2MissionIntakeBridgeError extends Error {
  constructor(
    readonly code: DomainV2MissionIntakeBridgeErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "DomainV2MissionIntakeBridgeError";
  }
}

export class DomainV2MissionIntakeBridge {
  readonly enabled: boolean;
  private readonly components: DomainV2MissionIntakeBridgeComponents;

  constructor(
    featureFlag: DomainV2MissionIntakeBridgeFeatureFlag = {
      enabled: false,
    },
    components: DomainV2MissionIntakeBridgeComponents = {
      peopleLotAdapter: PEOPLE_LOT_RUNTIME_EXECUTION_CONTRACT_ADAPTER,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
    this.components = components;
  }

  accept(
    runtimeExecutionContract: RuntimeExecutionContract,
  ): DomainV2MissionIntake | null {
    if (!this.enabled) {
      return null;
    }

    const identity = validateRuntimeExecutionContract(
      runtimeExecutionContract,
    );
    const peopleContract = this.components.peopleLotAdapter.adapt(
      runtimeExecutionContract,
    );

    validateAdaptedContract(peopleContract, runtimeExecutionContract);

    const intake = Object.freeze({
      schemaVersion: "1.0.0" as const,
      kind: "DOMAIN_V2_MISSION_INTAKE" as const,
      domainId: "PEOPLE" as const,
      lotId: "P3-PEOPLE-001D" as const,
      missionId: identity.missionId,
      requestId: identity.requestId,
      authorityDomain: "PEOPLE" as const,
      acceptanceCriteria: Object.freeze([
        ...runtimeExecutionContract.missionBrief.acceptanceCriteria,
      ]),
      peopleLotRuntimeExecutionContract: peopleContract,
      runtimeExecutionContract,
    });

    assertSerializable(intake);
    return intake;
  }
}

function validateRuntimeExecutionContract(
  contract: RuntimeExecutionContract,
): Readonly<{ missionId: string; requestId: string }> {
  if (
    !isRecord(contract) ||
    !isRecord(contract.runtimeExecutionRequest) ||
    !isRecord(contract.missionBrief) ||
    !isRecord(contract.executionContext) ||
    !isRecord(contract.pipelineTrace) ||
    !isRecord(contract.authorityDecision) ||
    !isRecord(contract.requestMetadata)
  ) {
    fail("DV2MIB-001", "A structured RuntimeExecutionContract is required.");
  }

  if (
    contract.validationStatus !== "VALID" ||
    contract.runtimeExecutionRequest.validationStatus !== "VALID"
  ) {
    fail("DV2MIB-002", "Runtime execution must be validated before intake.");
  }

  if (
    contract.missionBrief.lot !== "P3-PEOPLE-001D" ||
    contract.executionContext.lot !== "P3-PEOPLE-001D"
  ) {
    fail("DV2MIB-003", "Domain V2 intake requires lot P3-PEOPLE-001D.");
  }

  const missionId = contract.missionBrief.missionId;
  if (
    !isMetadataToken(missionId) ||
    contract.executionContext.missionId !== missionId ||
    contract.pipelineTrace.missionId !== missionId ||
    contract.runtimeExecutionRequest.missionBrief !== contract.missionBrief ||
    contract.runtimeExecutionRequest.executionContext !==
      contract.executionContext ||
    contract.runtimeExecutionRequest.pipelineTrace !== contract.pipelineTrace
  ) {
    fail("DV2MIB-004", "Mission identity or references are inconsistent.");
  }

  const requestId = contract.requestMetadata.requestId;
  if (
    !isMetadataToken(requestId) ||
    contract.runtimeExecutionRequest.requestId !== requestId ||
    contract.runtimeExecutionRequest.requestedAt !==
      contract.requestMetadata.requestedAt
  ) {
    fail("DV2MIB-005", "Request identity or metadata are inconsistent.");
  }

  if (
    contract.authorityDecision.authorityDomain !== "PEOPLE" ||
    contract.runtimeExecutionRequest.authorityDecision !==
      contract.authorityDecision
  ) {
    fail("DV2MIB-006", "Resolved authority must be coherent and belong to PEOPLE.");
  }

  if (
    !Array.isArray(contract.missionBrief.acceptanceCriteria) ||
    contract.missionBrief.acceptanceCriteria.length === 0 ||
    !contract.missionBrief.acceptanceCriteria.every(isNormalizedText)
  ) {
    fail("DV2MIB-007", "At least one normalized acceptance criterion is required.");
  }

  return Object.freeze({ missionId, requestId });
}

function validateAdaptedContract(
  adapted: PeopleLotRuntimeExecutionContract,
  source: RuntimeExecutionContract,
): void {
  if (
    !isRecord(adapted) ||
    adapted.domainId !== "PEOPLE" ||
    adapted.lotId !== "P3-PEOPLE-001D" ||
    adapted.machineContract.domainId !== "PEOPLE" ||
    adapted.machineContract.lotId !== "P3-PEOPLE-001D" ||
    adapted.runtimeExecutionContract !== source
  ) {
    fail("DV2MIB-002", "The PEOPLE adapter returned an incoherent intake contract.");
  }
}

function assertSerializable(intake: DomainV2MissionIntake): void {
  try {
    const serialized = JSON.stringify(intake);
    if (serialized === undefined) {
      fail("DV2MIB-008", "Mission intake serialization returned undefined.");
    }
    JSON.parse(serialized);
  } catch (error) {
    if (error instanceof DomainV2MissionIntakeBridgeError) {
      throw error;
    }
    fail("DV2MIB-008", "Mission intake must be JSON serializable.");
  }
}

function fail(
  code: DomainV2MissionIntakeBridgeErrorCode,
  message: string,
): never {
  throw new DomainV2MissionIntakeBridgeError(code, message);
}

function isMetadataToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isNormalizedText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

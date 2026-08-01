import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import {
  PEOPLE_LOT_MACHINE_CONTRACT,
  type PeopleLotMachineContract,
} from "./people-lot-machine-contract.js";

export type PeopleLotRuntimeContractAdapterErrorCode =
  | "PLRCA-001"
  | "PLRCA-002"
  | "PLRCA-003"
  | "PLRCA-004"
  | "PLRCA-005"
  | "PLRCA-006";

export interface PeopleLotRuntimeExecutionContract {
  readonly domainId: "PEOPLE";
  readonly lotId: "P3-PEOPLE-001D";
  readonly machineContract: PeopleLotMachineContract;
  readonly runtimeExecutionContract: RuntimeExecutionContract;
}

export class PeopleLotRuntimeContractAdapterError extends Error {
  constructor(
    readonly code: PeopleLotRuntimeContractAdapterErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "PeopleLotRuntimeContractAdapterError";
  }
}

export class PeopleLotRuntimeExecutionContractAdapter {
  readonly machineContract = PEOPLE_LOT_MACHINE_CONTRACT;

  forMissionManifest(): PeopleLotMachineContract {
    return this.machineContract;
  }

  adapt(
    runtimeExecutionContract: RuntimeExecutionContract,
  ): PeopleLotRuntimeExecutionContract {
    assertRuntimeExecutionContract(runtimeExecutionContract);

    const adapted = Object.freeze({
      domainId: this.machineContract.domainId,
      lotId: this.machineContract.lotId,
      machineContract: this.machineContract,
      runtimeExecutionContract,
    });

    assertSerializable(adapted);
    return adapted;
  }
}

export const PEOPLE_LOT_RUNTIME_EXECUTION_CONTRACT_ADAPTER =
  new PeopleLotRuntimeExecutionContractAdapter();

function assertRuntimeExecutionContract(
  contract: RuntimeExecutionContract,
): void {
  if (
    !isRecord(contract) ||
    !isRecord(contract.runtimeExecutionRequest) ||
    !isRecord(contract.missionBrief) ||
    !isRecord(contract.executionContext) ||
    !isRecord(contract.authorityDecision) ||
    !isRecord(contract.pipelineTrace) ||
    !isRecord(contract.requestMetadata)
  ) {
    fail("PLRCA-001", "A structured RuntimeExecutionContract is required.");
  }

  if (contract.validationStatus !== "VALID") {
    fail("PLRCA-002", "RuntimeExecutionContract must be validated.");
  }

  const missionId = contract.missionBrief.missionId;
  if (
    missionId !== contract.executionContext.missionId ||
    missionId !== contract.pipelineTrace.missionId ||
    contract.runtimeExecutionRequest.missionBrief !== contract.missionBrief ||
    contract.runtimeExecutionRequest.executionContext !==
      contract.executionContext ||
    contract.runtimeExecutionRequest.authorityDecision !==
      contract.authorityDecision ||
    contract.runtimeExecutionRequest.pipelineTrace !== contract.pipelineTrace ||
    contract.requestMetadata.requestId !==
      contract.runtimeExecutionRequest.requestId ||
    contract.requestMetadata.requestedAt !==
      contract.runtimeExecutionRequest.requestedAt
  ) {
    fail("PLRCA-003", "Runtime mission references must remain consistent.");
  }

  if (contract.authorityDecision.authorityDomain !== "PEOPLE") {
    fail("PLRCA-004", "Resolved authority domain must be PEOPLE.");
  }

  if (
    contract.missionBrief.lot !== PEOPLE_LOT_MACHINE_CONTRACT.lotId ||
    contract.executionContext.lot !== PEOPLE_LOT_MACHINE_CONTRACT.lotId
  ) {
    fail(
      "PLRCA-005",
      `Runtime lot must be ${PEOPLE_LOT_MACHINE_CONTRACT.lotId}.`,
    );
  }
}

function assertSerializable(value: PeopleLotRuntimeExecutionContract): void {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      fail("PLRCA-006", "Adapted contract serialization returned undefined.");
    }
    JSON.parse(serialized);
  } catch (error) {
    if (error instanceof PeopleLotRuntimeContractAdapterError) {
      throw error;
    }
    fail("PLRCA-006", "Adapted contract must be JSON serializable.");
  }
}

function fail(
  code: PeopleLotRuntimeContractAdapterErrorCode,
  message: string,
): never {
  throw new PeopleLotRuntimeContractAdapterError(code, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

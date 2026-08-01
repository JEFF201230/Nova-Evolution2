import assert from "node:assert/strict";
import test from "node:test";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import {
  PEOPLE_LOT_MACHINE_CONTRACT,
} from "./people-lot-machine-contract.js";
import {
  PeopleLotRuntimeContractAdapterError,
  PeopleLotRuntimeExecutionContractAdapter,
} from "./people-lot-runtime-execution-contract.adapter.js";

test("the PEOPLE lot machine contract is immutable and JSON serializable", () => {
  const serialized = JSON.stringify(PEOPLE_LOT_MACHINE_CONTRACT);
  const parsed = JSON.parse(serialized) as Record<string, unknown>;

  assert.equal(parsed.domainId, "PEOPLE");
  assert.equal(parsed.lotId, "P3-PEOPLE-001D");
  assert.equal(parsed.certificationStatus, "PENDING_EVIDENCE");
  assert.equal(Object.isFrozen(PEOPLE_LOT_MACHINE_CONTRACT), true);
  assert.equal(Object.isFrozen(PEOPLE_LOT_MACHINE_CONTRACT.preconditions), true);
  assert.equal(Object.isFrozen(PEOPLE_LOT_MACHINE_CONTRACT.postconditions), true);
});

test("the PEOPLE adapter preserves a valid RuntimeExecutionContract", () => {
  const runtimeExecutionContract = createRuntimeExecutionContract();
  const adapter = new PeopleLotRuntimeExecutionContractAdapter();
  const adapted = adapter.adapt(runtimeExecutionContract);

  assert.equal(adapted.domainId, "PEOPLE");
  assert.equal(adapted.lotId, "P3-PEOPLE-001D");
  assert.equal(adapted.machineContract, PEOPLE_LOT_MACHINE_CONTRACT);
  assert.equal(adapted.runtimeExecutionContract, runtimeExecutionContract);
  assert.equal(Object.isFrozen(adapted), true);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(adapted)));
});

test("the PEOPLE adapter rejects another authority domain or lot", () => {
  const adapter = new PeopleLotRuntimeExecutionContractAdapter();

  assert.throws(
    () => adapter.adapt(createRuntimeExecutionContract("WORK")),
    (error) =>
      error instanceof PeopleLotRuntimeContractAdapterError &&
      error.code === "PLRCA-004",
  );
  assert.throws(
    () => adapter.adapt(
      createRuntimeExecutionContract("PEOPLE", "P3-PEOPLE-001E"),
    ),
    (error) =>
      error instanceof PeopleLotRuntimeContractAdapterError &&
      error.code === "PLRCA-005",
  );
});

function createRuntimeExecutionContract(
  authorityDomain = "PEOPLE",
  lot = "P3-PEOPLE-001D",
): RuntimeExecutionContract {
  const missionId = "PEOPLE-LOT-MACHINE-CONTRACT-ADAPTER-001";
  const authorityDecision = Object.freeze({ authorityDomain });
  const missionBrief = Object.freeze({
    missionId,
    lot,
    authorityDecision,
  });
  const executionContext = Object.freeze({ missionId, lot });
  const pipelineTrace = Object.freeze({ missionId });
  const requestMetadata = Object.freeze({
    requestId: "REQUEST-PEOPLE-LOT-001",
    requestedAt: "2026-07-31T00:00:00.000Z",
  });
  const runtimeExecutionRequest = Object.freeze({
    requestId: requestMetadata.requestId,
    requestedAt: requestMetadata.requestedAt,
    missionBrief,
    executionContext,
    authorityDecision,
    validationStatus: "VALID",
    pipelineTrace,
  });

  return Object.freeze({
    runtimeExecutionRequest,
    missionBrief,
    authorityDecision,
    validationStatus: "VALID",
    executionContext,
    pipelineTrace,
    requestMetadata,
  }) as unknown as RuntimeExecutionContract;
}

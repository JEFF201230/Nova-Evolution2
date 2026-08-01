import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthorityResolutionDecision,
} from "./authority-resolver.js";
import {
  DomainV2MissionIntakeBridge,
  DomainV2MissionIntakeBridgeError,
} from "./domain-v2-mission-intake-bridge.js";
import type {
  MissionBrief,
} from "./mission-brief-builder.js";
import type {
  NovaOrchestrationPipelineTrace,
} from "./nova-orchestration-bridge.js";
import {
  PEOPLE_LOT_RUNTIME_EXECUTION_CONTRACT_ADAPTER,
} from "./people-lot-runtime-execution-contract.adapter.js";
import type {
  RuntimeExecutionContract,
} from "./runtime-execution-contract.js";
import type {
  RuntimeExecutionContext,
  RuntimeExecutionRequest,
} from "./runtime-execution-request.js";

const MISSION_ID = "DOMAIN-V2-PEOPLE-INTAKE-001";
const REQUEST_ID = "REQUEST-DOMAIN-V2-PEOPLE-001";
const REQUESTED_AT = "2026-07-31T09:00:00.000Z";

test("Domain V2 intake preserves the certified PEOPLE contract by reference", () => {
  const contract = createContract();
  const intake = new DomainV2MissionIntakeBridge({ enabled: true }).accept(
    contract,
  );

  assert.ok(intake);
  assert.equal(intake.domainId, "PEOPLE");
  assert.equal(intake.lotId, "P3-PEOPLE-001D");
  assert.equal(intake.missionId, MISSION_ID);
  assert.equal(intake.requestId, REQUEST_ID);
  assert.equal(intake.authorityDomain, "PEOPLE");
  assert.equal(intake.runtimeExecutionContract, contract);
  assert.equal(
    intake.peopleLotRuntimeExecutionContract.runtimeExecutionContract,
    contract,
  );
});

test("Domain V2 intake exposes immutable acceptance criteria and is serializable", () => {
  const contract = createContract();
  const intake = new DomainV2MissionIntakeBridge({ enabled: true }).accept(
    contract,
  );

  assert.ok(intake);
  assert.deepEqual(intake.acceptanceCriteria, [
    "Persistence PEOPLE durable",
    "Tests du lot PASS",
  ]);
  assert.notEqual(
    intake.acceptanceCriteria,
    contract.missionBrief.acceptanceCriteria,
  );
  assert.equal(Object.isFrozen(intake), true);
  assert.equal(Object.isFrozen(intake.acceptanceCriteria), true);
  assert.deepEqual(JSON.parse(JSON.stringify(intake)), intake);
});

test("Domain V2 intake is inert and does not inspect input while disabled", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "missionBrief", {
    get() {
      throw new Error("Disabled bridge must not inspect intake.");
    },
  });

  const result = new DomainV2MissionIntakeBridge().accept(
    unreadable as RuntimeExecutionContract,
  );

  assert.equal(result, null);
});

test("Domain V2 intake rejects a mission identity mismatch", () => {
  const contract = createContract();
  const invalid = {
    ...contract,
    pipelineTrace: {
      ...contract.pipelineTrace,
      missionId: "OTHER-MISSION",
    },
  } as RuntimeExecutionContract;

  assertBridgeError(
    () => new DomainV2MissionIntakeBridge({ enabled: true }).accept(invalid),
    "DV2MIB-004",
  );
});

test("Domain V2 intake rejects an incoherent request identity", () => {
  const contract = createContract();
  const invalid = {
    ...contract,
    requestMetadata: {
      ...contract.requestMetadata,
      requestId: "OTHER-REQUEST",
    },
  } as RuntimeExecutionContract;

  assertBridgeError(
    () => new DomainV2MissionIntakeBridge({ enabled: true }).accept(invalid),
    "DV2MIB-005",
  );
});

test("Domain V2 intake rejects a non-PEOPLE authority", () => {
  const contract = createContract();
  const authorityDecision = {
    ...contract.authorityDecision,
    authorityDomain: "WORK",
  };
  const runtimeExecutionRequest = {
    ...contract.runtimeExecutionRequest,
    authorityDecision,
  };
  const invalid = {
    ...contract,
    runtimeExecutionRequest,
    authorityDecision,
  } as RuntimeExecutionContract;

  assertBridgeError(
    () => new DomainV2MissionIntakeBridge({ enabled: true }).accept(invalid),
    "DV2MIB-006",
  );
});

test("Domain V2 intake rejects a lot other than P3-PEOPLE-001D", () => {
  const contract = createContract();
  const missionBrief = {
    ...contract.missionBrief,
    lot: "P3-PEOPLE-001E",
  };
  const executionContext = {
    ...contract.executionContext,
    lot: "P3-PEOPLE-001E",
  };
  const runtimeExecutionRequest = {
    ...contract.runtimeExecutionRequest,
    missionBrief,
    executionContext,
  };
  const invalid = {
    ...contract,
    runtimeExecutionRequest,
    missionBrief,
    executionContext,
  } as RuntimeExecutionContract;

  assertBridgeError(
    () => new DomainV2MissionIntakeBridge({ enabled: true }).accept(invalid),
    "DV2MIB-003",
  );
});

test("Domain V2 intake rejects absent acceptance criteria", () => {
  const contract = createContract();
  const missionBrief = {
    ...contract.missionBrief,
    acceptanceCriteria: [],
  };
  const runtimeExecutionRequest = {
    ...contract.runtimeExecutionRequest,
    missionBrief,
  };
  const invalid = {
    ...contract,
    runtimeExecutionRequest,
    missionBrief,
  } as RuntimeExecutionContract;

  assertBridgeError(
    () => new DomainV2MissionIntakeBridge({ enabled: true }).accept(invalid),
    "DV2MIB-007",
  );
});

test("Domain V2 intake rejects an incoherent PEOPLE adapter result", () => {
  const contract = createContract();
  const bridge = new DomainV2MissionIntakeBridge(
    { enabled: true },
    {
      peopleLotAdapter: {
        adapt() {
          return {
            ...PEOPLE_LOT_RUNTIME_EXECUTION_CONTRACT_ADAPTER.adapt(contract),
            runtimeExecutionContract: createContract(),
          };
        },
      },
    },
  );

  assertBridgeError(() => bridge.accept(contract), "DV2MIB-002");
});

function createContract(): RuntimeExecutionContract {
  const authorityDecision: AuthorityResolutionDecision = Object.freeze({
    missionId: MISSION_ID,
    authorityDomain: "PEOPLE",
    authoritativeSources: Object.freeze([]),
    supportingSources: Object.freeze([]),
    rejectedSources: Object.freeze([]),
    rejectionReasons: Object.freeze([]),
    unresolvedAuthorityConflicts: Object.freeze([]),
    resolutionStatus: "RESOLVED",
  });
  const missionBrief: MissionBrief = Object.freeze({
    missionId: MISSION_ID,
    title: "PEOPLE Domain V2 intake",
    objective: "Execute the current PEOPLE lot.",
    program: null,
    capability: null,
    epic: null,
    feature: null,
    lot: "P3-PEOPLE-001D",
    wave: null,
    authorityDecision,
    constraints: Object.freeze([]),
    dependencies: Object.freeze([]),
    requiredKnowledge: Object.freeze([]),
    requiredArtifacts: Object.freeze([]),
    acceptanceCriteria: Object.freeze([
      "Persistence PEOPLE durable",
      "Tests du lot PASS",
    ]),
    missingArtifacts: Object.freeze([]),
    resolutionStatus: "RESOLVED",
  });
  const executionContext: RuntimeExecutionContext = Object.freeze({
    missionId: MISSION_ID,
    objective: missionBrief.objective,
    programId: null,
    capability: null,
    epic: null,
    feature: null,
    lot: "P3-PEOPLE-001D",
    waveId: null,
    constraints: missionBrief.constraints,
    dependencies: missionBrief.dependencies,
    requiredKnowledge: missionBrief.requiredKnowledge,
    requiredArtifacts: missionBrief.requiredArtifacts,
    acceptanceCriteria: missionBrief.acceptanceCriteria,
  });
  const pipelineTrace: NovaOrchestrationPipelineTrace = Object.freeze({
    missionId: MISSION_ID,
    authoritativeSourceIds: Object.freeze([]),
    supportingSourceIds: Object.freeze([]),
    rejectedSourceIds: Object.freeze([]),
    knowledgeSourceIds: Object.freeze([]),
    knowledgeSourcePaths: Object.freeze([]),
    dependencyIds: Object.freeze([]),
    requiredArtifactIds: Object.freeze([]),
    missingArtifactIds: Object.freeze([]),
  });
  const runtimeExecutionRequest: RuntimeExecutionRequest = Object.freeze({
    requestId: REQUEST_ID,
    requestedAt: REQUESTED_AT,
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
    requestMetadata: Object.freeze({
      requestId: REQUEST_ID,
      requestedAt: REQUESTED_AT,
    }),
  });
}

function assertBridgeError(
  action: () => unknown,
  code: DomainV2MissionIntakeBridgeError["code"],
): void {
  assert.throws(
    action,
    (error) =>
      error instanceof DomainV2MissionIntakeBridgeError &&
      error.code === code,
  );
}

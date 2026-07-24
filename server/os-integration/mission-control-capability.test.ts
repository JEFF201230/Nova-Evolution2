import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionControlCapability,
} from "./mission-control-capability.js";

test("MissionControlCapability creates a capability with the provided values", () => {
  const capability = createMissionControlCapability(
    "COMPLETE",
    "OPEN",
    "PENDING",
    "COMPLETE",
    "AVAILABLE",
    "READY",
  );

  assert.deepEqual(capability, {
    missionOrderStatus: "COMPLETE",
    campaignStatus: "OPEN",
    certificationStatus: "PENDING",
    dependencyStatus: "COMPLETE",
    runtimeEvidenceStatus: "AVAILABLE",
    traceabilityStatus: "READY",
  });
});

test("MissionControlCapability remains deterministic for identical inputs", () => {
  const first = createMissionControlCapability(
    "COMPLETE",
    "OPEN",
    "PENDING",
    "COMPLETE",
    "AVAILABLE",
    "READY",
  );
  const second = createMissionControlCapability(
    "COMPLETE",
    "OPEN",
    "PENDING",
    "COMPLETE",
    "AVAILABLE",
    "READY",
  );

  assert.deepEqual(first, second);
});

test("MissionControlCapability preserves every public status field", () => {
  const capability = createMissionControlCapability(
    "MISSION",
    "CAMPAIGN",
    "CERTIFICATION",
    "DEPENDENCY",
    "RUNTIME",
    "TRACEABILITY",
  );

  assert.equal(capability.missionOrderStatus, "MISSION");
  assert.equal(capability.campaignStatus, "CAMPAIGN");
  assert.equal(capability.certificationStatus, "CERTIFICATION");
  assert.equal(capability.dependencyStatus, "DEPENDENCY");
  assert.equal(capability.runtimeEvidenceStatus, "RUNTIME");
  assert.equal(capability.traceabilityStatus, "TRACEABILITY");
});

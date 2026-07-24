import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionControlCapability,
} from "./mission-control-capability.js";
import {
  getMissionControlCapability,
  listMissionControlCapabilities,
  registerMissionControlCapability,
} from "./mission-control-capability-registry.js";

test("Mission Control Capability Registry registers and retrieves a capability", () => {
  const capability = createMissionControlCapability(
    "COMPLETE",
    "OPEN",
    "PENDING",
    "COMPLETE",
    "AVAILABLE",
    "READY",
  );

  registerMissionControlCapability("mission-control-capability", capability);

  assert.deepEqual(
    getMissionControlCapability("mission-control-capability"),
    capability,
  );
});

test("Mission Control Capability Registry lists registered capability identifiers", () => {
  const capability = createMissionControlCapability(
    "COMPLETE",
    "OPEN",
    "GO",
    "COMPLETE",
    "AVAILABLE",
    "READY",
  );

  registerMissionControlCapability("mission-control-capability-list", capability);

  assert.equal(
    listMissionControlCapabilities().includes("mission-control-capability-list"),
    true,
  );
});

test("Mission Control Capability Registry returns undefined for missing capabilities", () => {
  assert.equal(
    getMissionControlCapability("missing-mission-control-capability"),
    undefined,
  );
});

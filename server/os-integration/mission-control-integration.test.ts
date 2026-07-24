import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionControlIntegration,
} from "./mission-control-integration.js";

test("Mission Control Integration creates the expected mission control record", () => {
  const integration = createMissionControlIntegration(
    "P5-MO-003-MISSION-CONTROL-INTEGRATION",
    "Program Authority",
    "GO",
    "P5-MO-002-RUNTIME-EVIDENCE-CONSUMPTION: COMPLETE",
  );

  assert.deepEqual(integration, {
    missionOrderId: "P5-MO-003-MISSION-CONTROL-INTEGRATION",
    authority: "Program Authority",
    decision: "GO",
    dependencyStatus: "P5-MO-002-RUNTIME-EVIDENCE-CONSUMPTION: COMPLETE",
  });
});

test("Mission Control Integration remains deterministic for identical inputs", () => {
  const first = createMissionControlIntegration(
    "P5-MO-003-MISSION-CONTROL-INTEGRATION",
    "Program Authority",
    "GO",
    "P5-MO-002-RUNTIME-EVIDENCE-CONSUMPTION: COMPLETE",
  );
  const second = createMissionControlIntegration(
    "P5-MO-003-MISSION-CONTROL-INTEGRATION",
    "Program Authority",
    "GO",
    "P5-MO-002-RUNTIME-EVIDENCE-CONSUMPTION: COMPLETE",
  );

  assert.deepEqual(first, second);
});

test("Mission Control Integration preserves provided values without side effects", () => {
  const integration = createMissionControlIntegration(
    "MO",
    "AUTHORITY",
    "DECISION",
    "DEPENDENCY",
  );

  assert.equal(integration.missionOrderId, "MO");
  assert.equal(integration.authority, "AUTHORITY");
  assert.equal(integration.decision, "DECISION");
  assert.equal(integration.dependencyStatus, "DEPENDENCY");
});

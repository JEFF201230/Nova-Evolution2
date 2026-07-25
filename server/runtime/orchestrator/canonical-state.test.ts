import assert from "node:assert/strict";
import test from "node:test";
import { canTransition, mapPowerShellStatus } from "./canonical-state.js";

test("PowerShell status mapping is deterministic", () => {
  assert.equal(mapPowerShellStatus("FAILURE"), "FAILED");
  assert.equal(mapPowerShellStatus("CANCELLED"), "CANCELLED");
  assert.equal(mapPowerShellStatus("TIMEOUT"), "TIMEOUT");
  assert.equal(mapPowerShellStatus("READY_FOR_REVIEW"), "COMPLETED");
});

test("canonical transitions reject certification bypass", () => {
  assert.equal(canTransition("COMPLETED", "CERTIFIED"), true);
  assert.equal(canTransition("RUNNING", "CERTIFIED"), false);
});

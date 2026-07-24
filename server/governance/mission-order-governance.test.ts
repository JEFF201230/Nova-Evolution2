import assert from "node:assert/strict";
import test from "node:test";
import {
  createMissionOrderGovernanceGate,
  createMissionOrderGovernanceGates,
  verifyMissionOrderGovernance,
} from "./mission-order-governance.js";

const MISSION_ORDER_GATES = Object.freeze([
  createMissionOrderGovernanceGate("result-produced", true, "P6-MO-001_RESULT.md"),
  createMissionOrderGovernanceGate("certification-go", true, "P6-MO-001_CERTIFICATION_REPORT.md"),
  createMissionOrderGovernanceGate("verification-go", true, "P6-MO-001_VERIFICATION_REPORT.md"),
  createMissionOrderGovernanceGate("execution-evidence", true, "CAMPAIGN_001_EXECUTION_REPORT.md"),
  createMissionOrderGovernanceGate("campaigns-closed", true, "CAMPAIGN_001_RESULT.md"),
  createMissionOrderGovernanceGate("scope-bounded", true, "P6-MO-001-GOVERNANCE-CORE.md"),
  createMissionOrderGovernanceGate("program-board-approval", true, "P6-MO-001-GOVERNANCE-CORE.md"),
  createMissionOrderGovernanceGate("program-active", true, "PROGRAM_006_CHARTER.md"),
]);

test("Mission Order Governance closes an issued mission order with complete evidence", () => {
  const evidence = verifyMissionOrderGovernance(
    "P6-MO-001",
    "COMPLETE",
    MISSION_ORDER_GATES,
  );

  assert.equal(evidence.ready, true);
  assert.equal(evidence.gateCount, 8);
  assert.equal(evidence.readyGateCount, 8);
  assert.deepEqual(
    evidence.gates.map((gate) => gate.id),
    [
      "program-active",
      "program-board-approval",
      "scope-bounded",
      "campaigns-closed",
      "execution-evidence",
      "verification-go",
      "certification-go",
      "result-produced",
    ],
  );
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.gates), true);
});

test("Mission Order Governance permits issue gates separately from closure gates", () => {
  const evidence = verifyMissionOrderGovernance(
    "P6-MO-001",
    "ISSUED",
    [
      createMissionOrderGovernanceGate("program-active", true, "PROGRAM_006_CHARTER.md"),
      createMissionOrderGovernanceGate("program-board-approval", true, "P6-MO-001-GOVERNANCE-CORE.md"),
      createMissionOrderGovernanceGate("scope-bounded", true, "P6-MO-001-GOVERNANCE-CORE.md"),
    ],
  );

  assert.equal(evidence.ready, true);
  assert.equal(evidence.requiredGateCount, 3);
});

test("Mission Order Governance reports incomplete mission order evidence", () => {
  const evidence = verifyMissionOrderGovernance(
    "P6-MO-001",
    "COMPLETE",
    [
      createMissionOrderGovernanceGate("program-active", true, "PROGRAM_006_CHARTER.md"),
    ],
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyGateCount, 1);
});

test("Mission Order Governance validates gate inputs", () => {
  assert.equal(createMissionOrderGovernanceGates(MISSION_ORDER_GATES)[0].id, "program-active");
  assert.throws(
    () =>
      createMissionOrderGovernanceGates([
        createMissionOrderGovernanceGate("program-active", true, "PROGRAM_006_CHARTER.md"),
        createMissionOrderGovernanceGate("program-active", true, "PROGRAM_006_CHARTER.md"),
      ]),
    /^Error: PGOV-MO-003:/,
  );
  assert.throws(
    () =>
      createMissionOrderGovernanceGate(
        "unknown-gate" as never,
        true,
        "PROGRAM_006_CHARTER.md",
      ),
    /^Error: PGOV-MO-002:/,
  );
  assert.throws(
    () =>
      verifyMissionOrderGovernance(
        " P6-MO-001",
        "COMPLETE",
        MISSION_ORDER_GATES,
      ),
    /^Error: PGOV-MO-004:/,
  );
});

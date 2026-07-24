import assert from "node:assert/strict";
import test from "node:test";
import {
  createProgramLifecycleGate,
  createProgramLifecycleGates,
  verifyProgramLifecycleTransition,
} from "./program-lifecycle.js";

const LIFECYCLE_GATES = Object.freeze([
  createProgramLifecycleGate("closure-approved", true, "PROGRAM_006_CLOSURE_REPORT.md"),
  createProgramLifecycleGate("certification-go", true, "PROGRAM_006_CERTIFICATION_REPORT.md"),
  createProgramLifecycleGate("tests-pass", true, "CAMPAIGN_001_TEST_REPORT.md"),
  createProgramLifecycleGate("campaigns-closed", true, "CAMPAIGN_001_RESULT.md"),
  createProgramLifecycleGate("mission-orders-complete", true, "P6-MO-001_RESULT.md"),
  createProgramLifecycleGate("dependencies-complete", true, "PROGRAM_005_ROADMAP.md"),
  createProgramLifecycleGate("charter-active", true, "PROGRAM_006_CHARTER.md"),
  createProgramLifecycleGate("program-board-approval", true, "PROGRAM_006_CHARTER.md"),
]);

test("Program Lifecycle allows ACTIVE to COMPLETE when every gate is ready", () => {
  const evidence = verifyProgramLifecycleTransition(
    "ACTIVE",
    "COMPLETE",
    LIFECYCLE_GATES,
  );

  assert.equal(evidence.ready, true);
  assert.equal(evidence.transitionAllowed, true);
  assert.equal(evidence.readyGateCount, 8);
  assert.deepEqual(
    evidence.gates.map((gate) => gate.id),
    [
      "program-board-approval",
      "charter-active",
      "dependencies-complete",
      "mission-orders-complete",
      "campaigns-closed",
      "tests-pass",
      "certification-go",
      "closure-approved",
    ],
  );
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.gates), true);
});

test("Program Lifecycle rejects unsupported transitions", () => {
  const evidence = verifyProgramLifecycleTransition(
    "COMPLETE",
    "ACTIVE",
    LIFECYCLE_GATES,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.transitionAllowed, false);
});

test("Program Lifecycle reports not ready when a required gate is missing or false", () => {
  const evidence = verifyProgramLifecycleTransition(
    "ACTIVE",
    "COMPLETE",
    [
      createProgramLifecycleGate(
        "program-board-approval",
        false,
        "PROGRAM_006_CHARTER.md",
      ),
    ],
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyGateCount, 0);
});

test("Program Lifecycle validates deterministic gates", () => {
  const gates = createProgramLifecycleGates(LIFECYCLE_GATES);

  assert.equal(gates.length, 8);
  assert.equal(gates[0].id, "program-board-approval");
});

test("Program Lifecycle rejects duplicate, unknown, and non-normalized gates", () => {
  assert.throws(
    () =>
      createProgramLifecycleGates([
        createProgramLifecycleGate(
          "program-board-approval",
          true,
          "PROGRAM_006_CHARTER.md",
        ),
        createProgramLifecycleGate(
          "program-board-approval",
          true,
          "PROGRAM_006_CHARTER.md",
        ),
      ]),
    /^Error: PGOV-LIFE-003:/,
  );
  assert.throws(
    () =>
      createProgramLifecycleGate(
        "unknown-gate" as never,
        true,
        "PROGRAM_006_CHARTER.md",
      ),
    /^Error: PGOV-LIFE-002:/,
  );
  assert.throws(
    () =>
      createProgramLifecycleGate(
        "program-board-approval",
        true,
        "",
      ),
    /^Error: PGOV-LIFE-005:/,
  );
});

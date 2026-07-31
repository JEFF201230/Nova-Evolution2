import assert from "node:assert/strict";
import test from "node:test";
import {
  ProductionReadinessEvaluator,
  type ProductionReadinessInput,
} from "./production-readiness-evaluator.js";

function readyInput(
  overrides: Partial<ProductionReadinessInput> = {},
): ProductionReadinessInput {
  return {
    verifiable: true,
    lotVerdicts: {
      E: "PASS",
      F: "PASS",
      D: "PASS",
      G: "PASS",
      H: "PASS",
      I: "PASS",
    },
    allTestsPass: true,
    typecheckPass: true,
    diffCheckPass: true,
    p0Anomalies: 0,
    criticalSecurityAnomalies: 0,
    doubleTruthDetected: false,
    dataLossDetected: false,
    recoveryVerified: true,
    humanApprovalStructurallyRequired: true,
    productionIdentityAuthenticated: false,
    runtimeRealActivation: false,
    codexRealActivation: false,
    ...overrides,
  };
}

test("LOT I evaluates a fully integrated local state as ready", () => {
  const evaluation = new ProductionReadinessEvaluator({
    enabled: true,
  }).evaluate(readyInput());
  assert.equal(evaluation?.verdict, "INTEGRATION_READY");
  assert.equal(evaluation?.productionActivationAllowed, false);
});

test("LOT I blocks an unverifiable state", () => {
  const evaluation = new ProductionReadinessEvaluator({
    enabled: true,
  }).evaluate(readyInput({ verifiable: false }));
  assert.equal(evaluation?.verdict, "BLOCKED");
});

test("LOT I rejects a failed LOT", () => {
  const evaluation = new ProductionReadinessEvaluator({
    enabled: true,
  }).evaluate(
    readyInput({
      lotVerdicts: {
        ...readyInput().lotVerdicts,
        H: "FAIL",
      },
    }),
  );
  assert.equal(evaluation?.verdict, "NOT_READY");
  assert.deepEqual(evaluation?.reasons, ["LOT_H_FAIL"]);
});

test("LOT I rejects test, typecheck or diff failure", () => {
  const evaluation = new ProductionReadinessEvaluator({
    enabled: true,
  }).evaluate(
    readyInput({
      allTestsPass: false,
      typecheckPass: false,
      diffCheckPass: false,
    }),
  );
  assert.equal(evaluation?.verdict, "NOT_READY");
  assert.deepEqual(evaluation?.reasons, [
    "DIFF_CHECK_NOT_PASS",
    "TESTS_NOT_PASS",
    "TYPECHECK_NOT_PASS",
  ]);
});

test("LOT I rejects integrity and security anomalies", () => {
  const evaluation = new ProductionReadinessEvaluator({
    enabled: true,
  }).evaluate(
    readyInput({
      p0Anomalies: 1,
      criticalSecurityAnomalies: 1,
      doubleTruthDetected: true,
      dataLossDetected: true,
    }),
  );
  assert.equal(evaluation?.verdict, "NOT_READY");
  assert.ok(evaluation?.reasons.includes("P0_ANOMALY"));
  assert.ok(evaluation?.reasons.includes("DATA_LOSS_DETECTED"));
});

test("LOT I requires recovery and human approval", () => {
  const evaluation = new ProductionReadinessEvaluator({
    enabled: true,
  }).evaluate(
    readyInput({
      recoveryVerified: false,
      humanApprovalStructurallyRequired: false,
    }),
  );
  assert.equal(evaluation?.verdict, "NOT_READY");
  assert.ok(evaluation?.reasons.includes("RECOVERY_NOT_VERIFIED"));
});

test("LOT I refuses real activation and production identity claims", () => {
  const evaluation = new ProductionReadinessEvaluator({
    enabled: true,
  }).evaluate(
    readyInput({
      productionIdentityAuthenticated: true,
      runtimeRealActivation: true,
      codexRealActivation: true,
    }),
  );
  assert.equal(evaluation?.verdict, "NOT_READY");
  assert.equal(evaluation?.productionActivationAllowed, false);
});

test("LOT I validates readiness input", () => {
  assert.throws(
    () =>
      new ProductionReadinessEvaluator({ enabled: true }).evaluate(
        readyInput({ p0Anomalies: -1 }),
      ),
    /PRE-001/,
  );
});

test("LOT I readiness evaluation is deterministic and immutable", () => {
  const evaluator = new ProductionReadinessEvaluator({
    enabled: true,
  });
  const first = evaluator.evaluate(readyInput());
  const second = evaluator.evaluate(readyInput());
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first?.reasons), true);
});

test("LOT I readiness evaluator is OFF by default", () => {
  assert.equal(
    new ProductionReadinessEvaluator().evaluate(readyInput()),
    null,
  );
});

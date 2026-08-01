import assert from "node:assert/strict";
import test from "node:test";
import {
  DomainLotCriteriaEvaluator,
  DomainLotCriteriaEvaluatorError,
  type DomainLotCriterionResultInput,
  type DomainLotCriterionStatus,
} from "./domain-lot-criteria-evaluator.js";
import {
  PEOPLE_LOT_MACHINE_CONTRACT,
} from "./people-lot-machine-contract.js";

function results(
  overrides: Readonly<Record<string, DomainLotCriterionStatus>> = {},
): readonly DomainLotCriterionResultInput[] {
  return [
    ...PEOPLE_LOT_MACHINE_CONTRACT.preconditions,
    ...PEOPLE_LOT_MACHINE_CONTRACT.postconditions,
    ...PEOPLE_LOT_MACHINE_CONTRACT.invariants,
  ].map((criterion) => ({
    code: criterion.code,
    status: overrides[criterion.code] ?? "SATISFIED",
    evidenceIds: [`EVIDENCE:${criterion.code}`],
  }));
}

function evaluator(): DomainLotCriteriaEvaluator {
  return new DomainLotCriteriaEvaluator({ enabled: true });
}

test("evaluates every PEOPLE lot criterion as satisfied", () => {
  const evaluation = evaluator().evaluate({
    contract: PEOPLE_LOT_MACHINE_CONTRACT,
    criteria: results(),
  });

  assert.ok(evaluation);
  assert.equal(evaluation.domainId, "PEOPLE");
  assert.equal(evaluation.lotId, "P3-PEOPLE-001D");
  assert.equal(evaluation.decision, "SATISFIED");
  assert.equal(evaluation.contractCriteriaSatisfied, true);
  assert.deepEqual(evaluation.blockingCriteriaCodes, []);
  assert.deepEqual(evaluation.unsatisfiedCriteriaCodes, []);
});

test("returns NOT_SATISFIED when an explicit criterion fails", () => {
  const code = PEOPLE_LOT_MACHINE_CONTRACT.postconditions[0].code;
  const evaluation = evaluator().evaluate({
    contract: PEOPLE_LOT_MACHINE_CONTRACT,
    criteria: results({ [code]: "NOT_SATISFIED" }),
  });

  assert.ok(evaluation);
  assert.equal(evaluation.decision, "NOT_SATISFIED");
  assert.equal(evaluation.contractCriteriaSatisfied, false);
  assert.deepEqual(evaluation.unsatisfiedCriteriaCodes, [code]);
});

test("returns BLOCKED when evidence for a criterion is unavailable", () => {
  const unavailable = PEOPLE_LOT_MACHINE_CONTRACT.invariants[0].code;
  const failed = PEOPLE_LOT_MACHINE_CONTRACT.postconditions[0].code;
  const evaluation = evaluator().evaluate({
    contract: PEOPLE_LOT_MACHINE_CONTRACT,
    criteria: results({
      [unavailable]: "UNAVAILABLE",
      [failed]: "NOT_SATISFIED",
    }),
  });

  assert.ok(evaluation);
  assert.equal(evaluation.decision, "BLOCKED");
  assert.equal(evaluation.contractCriteriaSatisfied, false);
  assert.deepEqual(evaluation.blockingCriteriaCodes, [unavailable]);
  assert.deepEqual(evaluation.unsatisfiedCriteriaCodes, [failed]);
});

test("refuses an absent criterion result", () => {
  assert.throws(
    () =>
      evaluator().evaluate({
        contract: PEOPLE_LOT_MACHINE_CONTRACT,
        criteria: results().slice(1),
      }),
    (error) =>
      error instanceof DomainLotCriteriaEvaluatorError &&
      error.code === "DLCE-005",
  );
});

test("refuses an unknown criterion code", () => {
  assert.throws(
    () =>
      evaluator().evaluate({
        contract: PEOPLE_LOT_MACHINE_CONTRACT,
        criteria: [
          ...results(),
          {
            code: "PEOPLE-LOT-UNKNOWN-001",
            status: "SATISFIED",
            evidenceIds: ["EVIDENCE:UNKNOWN"],
          },
        ],
      }),
    (error) =>
      error instanceof DomainLotCriteriaEvaluatorError &&
      error.code === "DLCE-004",
  );
});

test("refuses duplicated criterion results and evidence identifiers", () => {
  const valid = results();
  assert.throws(
    () =>
      evaluator().evaluate({
        contract: PEOPLE_LOT_MACHINE_CONTRACT,
        criteria: [...valid, valid[0]],
      }),
    (error) =>
      error instanceof DomainLotCriteriaEvaluatorError &&
      error.code === "DLCE-003",
  );
  assert.throws(
    () =>
      evaluator().evaluate({
        contract: PEOPLE_LOT_MACHINE_CONTRACT,
        criteria: valid.map((criterion, index) =>
          index === 0
            ? { ...criterion, evidenceIds: ["EVIDENCE:1", "EVIDENCE:1"] }
            : criterion,
        ),
      }),
    (error) =>
      error instanceof DomainLotCriteriaEvaluatorError &&
      error.code === "DLCE-003",
  );
});

test("requires evidence for conclusive statuses but not for UNAVAILABLE", () => {
  for (const status of ["SATISFIED", "NOT_SATISFIED"] as const) {
    const criteria = results().map((criterion, index) =>
      index === 0 ? { ...criterion, status, evidenceIds: [] } : criterion,
    );
    assert.throws(
      () =>
        evaluator().evaluate({
          contract: PEOPLE_LOT_MACHINE_CONTRACT,
          criteria,
        }),
      (error) =>
        error instanceof DomainLotCriteriaEvaluatorError &&
        error.code === "DLCE-003",
    );
  }

  const unavailableCode = PEOPLE_LOT_MACHINE_CONTRACT.preconditions[0].code;
  const evaluation = evaluator().evaluate({
    contract: PEOPLE_LOT_MACHINE_CONTRACT,
    criteria: results({ [unavailableCode]: "UNAVAILABLE" }).map(
      (criterion) =>
        criterion.code === unavailableCode
          ? { ...criterion, evidenceIds: [] }
          : criterion,
    ),
  });
  assert.equal(evaluation?.decision, "BLOCKED");
});

test("returns a deterministic, immutable and serializable evaluation", () => {
  const input = {
    contract: PEOPLE_LOT_MACHINE_CONTRACT,
    criteria: [...results()].reverse(),
  };
  const first = evaluator().evaluate(input);
  const second = evaluator().evaluate(input);

  assert.deepEqual(first, second);
  assert.ok(first);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(first)));
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.criteria), true);
  assert.equal(Object.isFrozen(first.criteria[0]), true);
  assert.equal(Object.isFrozen(first.criteria[0].evidenceIds), true);
  assert.equal(
    first.criteria[0].code,
    PEOPLE_LOT_MACHINE_CONTRACT.preconditions[0].code,
  );
});

test("is OFF by default and does not inspect its input", () => {
  const unreadable = {};
  Object.defineProperty(unreadable, "contract", {
    get() {
      throw new Error("Feature Flag OFF must not inspect input.");
    },
  });

  assert.equal(
    new DomainLotCriteriaEvaluator().evaluate(
      unreadable as Parameters<DomainLotCriteriaEvaluator["evaluate"]>[0],
    ),
    null,
  );
});

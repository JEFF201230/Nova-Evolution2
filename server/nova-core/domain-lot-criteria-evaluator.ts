import type {
  PeopleLotMachineCondition,
  PeopleLotMachineContract,
} from "./people-lot-machine-contract.js";

export type DomainLotCriterionStatus =
  | "SATISFIED"
  | "NOT_SATISFIED"
  | "UNAVAILABLE";

export type DomainLotCriteriaDecision =
  | "SATISFIED"
  | "NOT_SATISFIED"
  | "BLOCKED";

export type DomainLotCriterionCategory =
  | "PRECONDITION"
  | "POSTCONDITION"
  | "INVARIANT";

export interface DomainLotCriterionResultInput {
  readonly code: string;
  readonly status: DomainLotCriterionStatus;
  readonly evidenceIds: readonly string[];
}

export interface DomainLotCriteriaEvaluationInput {
  readonly contract: PeopleLotMachineContract;
  readonly criteria: readonly DomainLotCriterionResultInput[];
}

export interface EvaluatedDomainLotCriterion
  extends DomainLotCriterionResultInput {
  readonly category: DomainLotCriterionCategory;
  readonly statement: string;
}

export interface DomainLotCriteriaEvaluation {
  readonly schemaVersion: "1.0.0";
  readonly kind: "DOMAIN_LOT_CRITERIA_EVALUATION";
  readonly domainId: PeopleLotMachineContract["domainId"];
  readonly lotId: PeopleLotMachineContract["lotId"];
  readonly decision: DomainLotCriteriaDecision;
  readonly contractCriteriaSatisfied: boolean;
  readonly criteria: readonly EvaluatedDomainLotCriterion[];
  readonly blockingCriteriaCodes: readonly string[];
  readonly unsatisfiedCriteriaCodes: readonly string[];
}

export interface DomainLotCriteriaEvaluatorFeatureFlag {
  readonly enabled: boolean;
}

export type DomainLotCriteriaEvaluatorErrorCode =
  | "DLCE-001"
  | "DLCE-002"
  | "DLCE-003"
  | "DLCE-004"
  | "DLCE-005"
  | "DLCE-006";

export class DomainLotCriteriaEvaluatorError extends Error {
  constructor(
    readonly code: DomainLotCriteriaEvaluatorErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "DomainLotCriteriaEvaluatorError";
  }
}

export class DomainLotCriteriaEvaluator {
  readonly enabled: boolean;

  constructor(
    featureFlag: DomainLotCriteriaEvaluatorFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  evaluate(
    input: DomainLotCriteriaEvaluationInput,
  ): DomainLotCriteriaEvaluation | null {
    if (!this.enabled) {
      return null;
    }

    assertInput(input);
    const expected = contractCriteria(input.contract);
    const results = indexResults(input.criteria);
    assertExactCriteria(expected, results);

    const criteria = Object.freeze(
      expected.map(({ category, condition }) => {
        const result = results.get(condition.code);
        if (result === undefined) {
          fail("DLCE-005", `Criterion result is missing: ${condition.code}.`);
        }
        return Object.freeze({
          code: condition.code,
          category,
          statement: condition.statement,
          status: result.status,
          evidenceIds: Object.freeze([...result.evidenceIds]),
        });
      }),
    );
    const blockingCriteriaCodes = Object.freeze(
      criteria
        .filter((criterion) => criterion.status === "UNAVAILABLE")
        .map((criterion) => criterion.code),
    );
    const unsatisfiedCriteriaCodes = Object.freeze(
      criteria
        .filter((criterion) => criterion.status === "NOT_SATISFIED")
        .map((criterion) => criterion.code),
    );
    const decision: DomainLotCriteriaDecision =
      blockingCriteriaCodes.length > 0
        ? "BLOCKED"
        : unsatisfiedCriteriaCodes.length > 0
          ? "NOT_SATISFIED"
          : "SATISFIED";
    const evaluation = Object.freeze({
      schemaVersion: "1.0.0" as const,
      kind: "DOMAIN_LOT_CRITERIA_EVALUATION" as const,
      domainId: input.contract.domainId,
      lotId: input.contract.lotId,
      decision,
      contractCriteriaSatisfied: decision === "SATISFIED",
      criteria,
      blockingCriteriaCodes,
      unsatisfiedCriteriaCodes,
    });

    assertSerializable(evaluation);
    return evaluation;
  }
}

function contractCriteria(
  contract: PeopleLotMachineContract,
): readonly {
  readonly category: DomainLotCriterionCategory;
  readonly condition: PeopleLotMachineCondition;
}[] {
  if (
    !isRecord(contract) ||
    !isToken(contract.domainId) ||
    !isToken(contract.lotId) ||
    !Array.isArray(contract.preconditions) ||
    !Array.isArray(contract.postconditions) ||
    !Array.isArray(contract.invariants)
  ) {
    fail("DLCE-002", "A valid domain lot machine contract is required.");
  }

  const values = [
    ...categorized("PRECONDITION", contract.preconditions),
    ...categorized("POSTCONDITION", contract.postconditions),
    ...categorized("INVARIANT", contract.invariants),
  ];
  const seen = new Set<string>();
  for (const { condition } of values) {
    if (
      !isRecord(condition) ||
      !isToken(condition.code) ||
      !isNormalizedText(condition.statement) ||
      seen.has(condition.code)
    ) {
      fail("DLCE-002", "Contract criteria must be valid and uniquely coded.");
    }
    seen.add(condition.code);
  }
  return values;
}

function categorized(
  category: DomainLotCriterionCategory,
  conditions: readonly PeopleLotMachineCondition[],
): readonly {
  readonly category: DomainLotCriterionCategory;
  readonly condition: PeopleLotMachineCondition;
}[] {
  return conditions.map((condition) => ({ category, condition }));
}

function indexResults(
  criteria: readonly DomainLotCriterionResultInput[],
): ReadonlyMap<string, DomainLotCriterionResultInput> {
  const results = new Map<string, DomainLotCriterionResultInput>();
  for (const criterion of criteria) {
    if (
      !isRecord(criterion) ||
      !isToken(criterion.code) ||
      !isCriterionStatus(criterion.status) ||
      !Array.isArray(criterion.evidenceIds) ||
      !criterion.evidenceIds.every(isToken) ||
      new Set(criterion.evidenceIds).size !== criterion.evidenceIds.length ||
      (criterion.status !== "UNAVAILABLE" &&
        criterion.evidenceIds.length === 0)
    ) {
      fail("DLCE-003", "Criterion results and evidence identifiers must be valid.");
    }
    if (results.has(criterion.code)) {
      fail("DLCE-003", `Criterion result is duplicated: ${criterion.code}.`);
    }
    results.set(criterion.code, criterion);
  }
  return results;
}

function assertExactCriteria(
  expected: readonly {
    readonly condition: PeopleLotMachineCondition;
  }[],
  results: ReadonlyMap<string, DomainLotCriterionResultInput>,
): void {
  const expectedCodes = new Set(
    expected.map(({ condition }) => condition.code),
  );
  const unknown = [...results.keys()].find((code) => !expectedCodes.has(code));
  if (unknown !== undefined) {
    fail("DLCE-004", `Criterion code is unknown: ${unknown}.`);
  }
  const missing = expected.find(
    ({ condition }) => !results.has(condition.code),
  );
  if (missing !== undefined) {
    fail("DLCE-005", `Criterion result is missing: ${missing.condition.code}.`);
  }
}

function assertInput(input: DomainLotCriteriaEvaluationInput): void {
  if (
    !isRecord(input) ||
    !isRecord(input.contract) ||
    !Array.isArray(input.criteria)
  ) {
    fail("DLCE-001", "A structured criteria evaluation input is required.");
  }
}

function assertSerializable(evaluation: DomainLotCriteriaEvaluation): void {
  try {
    const serialized = JSON.stringify(evaluation);
    if (serialized === undefined) {
      fail("DLCE-006", "Criteria evaluation serialization returned undefined.");
    }
    JSON.parse(serialized);
  } catch (error) {
    if (error instanceof DomainLotCriteriaEvaluatorError) {
      throw error;
    }
    fail("DLCE-006", "Criteria evaluation must be JSON serializable.");
  }
}

function isCriterionStatus(value: unknown): value is DomainLotCriterionStatus {
  return (
    value === "SATISFIED" ||
    value === "NOT_SATISFIED" ||
    value === "UNAVAILABLE"
  );
}

function isToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isNormalizedText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(
  code: DomainLotCriteriaEvaluatorErrorCode,
  message: string,
): never {
  throw new DomainLotCriteriaEvaluatorError(code, message);
}

export type ProductionReadinessVerdict =
  | "INTEGRATION_READY"
  | "NOT_READY"
  | "BLOCKED";

export interface ProductionReadinessInput {
  readonly verifiable: boolean;
  readonly lotVerdicts: Readonly<
    Record<"E" | "F" | "D" | "G" | "H" | "I", "PASS" | "FAIL" | "BLOCKED">
  >;
  readonly allTestsPass: boolean;
  readonly typecheckPass: boolean;
  readonly diffCheckPass: boolean;
  readonly p0Anomalies: number;
  readonly criticalSecurityAnomalies: number;
  readonly doubleTruthDetected: boolean;
  readonly dataLossDetected: boolean;
  readonly recoveryVerified: boolean;
  readonly humanApprovalStructurallyRequired: boolean;
  readonly productionIdentityAuthenticated: boolean;
  readonly runtimeRealActivation: boolean;
  readonly codexRealActivation: boolean;
}

export interface ProductionReadinessEvaluation {
  readonly verdict: ProductionReadinessVerdict;
  readonly reasons: readonly string[];
  readonly productionActivationAllowed: false;
}

export interface ProductionReadinessEvaluatorFeatureFlag {
  readonly enabled: boolean;
}

export class ProductionReadinessEvaluator {
  readonly enabled: boolean;

  constructor(
    featureFlag: ProductionReadinessEvaluatorFeatureFlag = {
      enabled: false,
    },
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  evaluate(
    input: ProductionReadinessInput,
  ): ProductionReadinessEvaluation | null {
    if (!this.enabled) {
      return null;
    }
    assertInput(input);

    if (!input.verifiable) {
      return result("BLOCKED", ["STATE_NOT_VERIFIABLE"]);
    }

    const reasons: string[] = [];
    for (const [lot, verdict] of Object.entries(input.lotVerdicts)) {
      if (verdict !== "PASS") {
        reasons.push(`LOT_${lot}_${verdict}`);
      }
    }
    if (!input.allTestsPass) reasons.push("TESTS_NOT_PASS");
    if (!input.typecheckPass) reasons.push("TYPECHECK_NOT_PASS");
    if (!input.diffCheckPass) reasons.push("DIFF_CHECK_NOT_PASS");
    if (input.p0Anomalies > 0) reasons.push("P0_ANOMALY");
    if (input.criticalSecurityAnomalies > 0) {
      reasons.push("CRITICAL_SECURITY_ANOMALY");
    }
    if (input.doubleTruthDetected) reasons.push("DOUBLE_TRUTH_DETECTED");
    if (input.dataLossDetected) reasons.push("DATA_LOSS_DETECTED");
    if (!input.recoveryVerified) reasons.push("RECOVERY_NOT_VERIFIED");
    if (!input.humanApprovalStructurallyRequired) {
      reasons.push("HUMAN_APPROVAL_NOT_REQUIRED");
    }
    if (input.productionIdentityAuthenticated) {
      reasons.push("PRODUCTION_IDENTITY_CLAIM_PRESENT");
    }
    if (input.runtimeRealActivation) {
      reasons.push("RUNTIME_REAL_ACTIVATION_PRESENT");
    }
    if (input.codexRealActivation) {
      reasons.push("CODEX_REAL_ACTIVATION_PRESENT");
    }

    return reasons.length === 0
      ? result("INTEGRATION_READY", ["ALL_INTEGRATION_GATES_PASS"])
      : result("NOT_READY", reasons.sort());
  }
}

function result(
  verdict: ProductionReadinessVerdict,
  reasons: readonly string[],
): ProductionReadinessEvaluation {
  return Object.freeze({
    verdict,
    reasons: Object.freeze([...reasons]),
    productionActivationAllowed: false,
  });
}

function assertInput(input: ProductionReadinessInput): void {
  if (
    typeof input !== "object" ||
    input === null ||
    !Number.isInteger(input.p0Anomalies) ||
    input.p0Anomalies < 0 ||
    !Number.isInteger(input.criticalSecurityAnomalies) ||
    input.criticalSecurityAnomalies < 0 ||
    !isLotVerdicts(input.lotVerdicts)
  ) {
    throw new Error("PRE-001: Invalid production readiness input.");
  }
}

function isLotVerdicts(
  value: unknown,
): value is ProductionReadinessInput["lotVerdicts"] {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const verdicts = value as Record<string, unknown>;
  return ["E", "F", "D", "G", "H", "I"].every(
    (lot) =>
      verdicts[lot] === "PASS" ||
      verdicts[lot] === "FAIL" ||
      verdicts[lot] === "BLOCKED",
  );
}

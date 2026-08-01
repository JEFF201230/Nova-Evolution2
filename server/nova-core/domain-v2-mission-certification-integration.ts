import type {
  CerebrauMissionCertificationPolicyDecision,
  CerebrauMissionCertificationPolicyInput,
  CerebrauMissionCertificationPolicyPort,
} from "./cerebrau-mission-certification-policy.adapter.js";
import type {
  DomainLotCriteriaEvaluation,
} from "./domain-lot-criteria-evaluator.js";
import type {
  DomainV2MissionIntake,
} from "./domain-v2-mission-intake-bridge.js";

export interface DomainV2MissionCertificationOutcome {
  readonly missionId: string;
  readonly executionMode: unknown;
  readonly officialStatus: unknown;
  readonly authorityDecision: unknown;
  readonly finalMissionState: unknown;
  readonly exitCode: unknown;
  readonly officialReport: unknown;
  readonly evidence: unknown;
  readonly tests: unknown;
  readonly regressions: unknown;
}

export interface DomainV2MissionCertificationIntegrationInput {
  readonly intake: DomainV2MissionIntake;
  readonly criteriaEvaluation: DomainLotCriteriaEvaluation;
  readonly outcome: DomainV2MissionCertificationOutcome;
}

export interface DomainV2MissionCertificationIntegrationResult {
  readonly schemaVersion: "1.0.0";
  readonly kind: "DOMAIN_V2_MISSION_CERTIFICATION_INTEGRATION";
  readonly domainId: "PEOPLE";
  readonly lotId: "P3-PEOPLE-001D";
  readonly missionId: string;
  readonly policyInput: CerebrauMissionCertificationPolicyInput;
  readonly decision: CerebrauMissionCertificationPolicyDecision;
}

export interface DomainV2MissionCertificationIntegrationFeatureFlag {
  readonly enabled: boolean;
}

export interface DomainV2MissionCertificationIntegrationComponents {
  readonly policy: CerebrauMissionCertificationPolicyPort;
}

export type DomainV2MissionCertificationIntegrationErrorCode =
  | "DV2MCI-001"
  | "DV2MCI-002"
  | "DV2MCI-003"
  | "DV2MCI-004"
  | "DV2MCI-005";

export class DomainV2MissionCertificationIntegrationError extends Error {
  constructor(
    readonly code: DomainV2MissionCertificationIntegrationErrorCode,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "DomainV2MissionCertificationIntegrationError";
  }
}

export class DomainV2MissionCertificationIntegration {
  readonly enabled: boolean;

  constructor(
    featureFlag: DomainV2MissionCertificationIntegrationFeatureFlag = {
      enabled: false,
    },
    private readonly components?: DomainV2MissionCertificationIntegrationComponents,
  ) {
    this.enabled = featureFlag.enabled === true;
  }

  async integrate(
    input: DomainV2MissionCertificationIntegrationInput,
  ): Promise<DomainV2MissionCertificationIntegrationResult | null> {
    if (!this.enabled) {
      return null;
    }

    if (this.components === undefined) {
      fail("DV2MCI-001", "The CEREBRAU certification policy port is required.");
    }
    assertIdentity(input);

    const policyInput = Object.freeze({
      ExecutionMode: input.outcome.executionMode,
      OfficialStatus: input.outcome.officialStatus,
      AuthorityDecision: input.outcome.authorityDecision,
      FinalMissionState: input.outcome.finalMissionState,
      ExitCode: input.outcome.exitCode,
      OfficialReport: input.outcome.officialReport,
      Evidence: input.outcome.evidence,
      Tests: input.outcome.tests,
      Regressions: input.outcome.regressions,
      ContractCriteriaSatisfied:
        input.criteriaEvaluation.contractCriteriaSatisfied,
    });
    assertSerializable(policyInput, "DV2MCI-003", "Policy input");

    const policyDecision = await this.components.policy.resolve(policyInput);
    assertPolicyDecision(policyDecision);
    const decision = Object.freeze({ ...policyDecision });
    const result = Object.freeze({
      schemaVersion: "1.0.0" as const,
      kind: "DOMAIN_V2_MISSION_CERTIFICATION_INTEGRATION" as const,
      domainId: "PEOPLE" as const,
      lotId: "P3-PEOPLE-001D" as const,
      missionId: input.intake.missionId,
      policyInput,
      decision,
    });
    assertSerializable(result, "DV2MCI-004", "Integration result");
    return result;
  }
}

function assertIdentity(
  input: DomainV2MissionCertificationIntegrationInput,
): void {
  if (
    !isRecord(input) ||
    !isRecord(input.intake) ||
    !isRecord(input.criteriaEvaluation) ||
    !isRecord(input.outcome)
  ) {
    fail("DV2MCI-001", "Structured intake, criteria and outcome are required.");
  }

  if (
    input.intake.domainId !== "PEOPLE" ||
    input.intake.lotId !== "P3-PEOPLE-001D" ||
    input.criteriaEvaluation.domainId !== input.intake.domainId ||
    input.criteriaEvaluation.lotId !== input.intake.lotId
  ) {
    fail("DV2MCI-002", "Domain or lot identity is inconsistent.");
  }

  if (
    !isMetadataToken(input.intake.missionId) ||
    input.outcome.missionId !== input.intake.missionId
  ) {
    fail("DV2MCI-002", "Mission identity is inconsistent.");
  }

  if (
    typeof input.criteriaEvaluation.contractCriteriaSatisfied !== "boolean" ||
    !CRITERIA_DECISIONS.has(input.criteriaEvaluation.decision)
  ) {
    fail("DV2MCI-001", "Criteria evaluation must expose a boolean result.");
  }
  if (
    (input.criteriaEvaluation.decision === "SATISFIED") !==
    input.criteriaEvaluation.contractCriteriaSatisfied
  ) {
    fail("DV2MCI-001", "Criteria decision and boolean result are inconsistent.");
  }
}

function assertPolicyDecision(
  decision: CerebrauMissionCertificationPolicyDecision,
): void {
  if (!isRecord(decision)) {
    fail("DV2MCI-005", "The policy port returned no structured decision.");
  }
  const keys = Object.keys(decision).sort();
  if (
    keys.length !== POLICY_DECISION_PROPERTIES.length ||
    !POLICY_DECISION_PROPERTIES.every(
      (property, index) => property === keys[index],
    )
  ) {
    fail("DV2MCI-005", "The policy port returned an inexact decision contract.");
  }

  const invokesCompletion =
    decision.Decision === "CERTIFIED" || decision.Decision === "REJECTED";
  if (
    !POLICY_DECISIONS.has(decision.Decision) ||
    typeof decision.ReasonCode !== "string" ||
    decision.ReasonCode.length === 0 ||
    typeof decision.RetryAllowed !== "boolean" ||
    !REGISTRY_TRANSITIONS.has(decision.RegistryTransition) ||
    typeof decision.InvokeCompleteDomainLot !== "boolean" ||
    decision.InvokeCompleteDomainLot !== invokesCompletion ||
    decision.PreserveEvidence !== true
  ) {
    fail("DV2MCI-005", "The policy port returned an incoherent decision.");
  }
}

function assertSerializable(
  value: unknown,
  code: "DV2MCI-003" | "DV2MCI-004",
  label: string,
): void {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      throw new Error("Serialization returned undefined.");
    }
    JSON.parse(serialized);
  } catch {
    fail(code, `${label} must be JSON serializable.`);
  }
}

function isMetadataToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim() &&
    /^[A-Za-z0-9._:-]+$/.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(
  code: DomainV2MissionCertificationIntegrationErrorCode,
  message: string,
): never {
  throw new DomainV2MissionCertificationIntegrationError(code, message);
}

const CRITERIA_DECISIONS = new Set<unknown>([
  "SATISFIED",
  "NOT_SATISFIED",
  "BLOCKED",
]);

const POLICY_DECISION_PROPERTIES = Object.freeze([
  "Decision",
  "InvokeCompleteDomainLot",
  "PreserveEvidence",
  "ReasonCode",
  "RegistryTransition",
  "RetryAllowed",
] as const);

const POLICY_DECISIONS = new Set<unknown>([
  "CERTIFIED",
  "PENDING_REVIEW",
  "REJECTED",
  "EXECUTION_FAILED",
  "CANCELLED",
]);

const REGISTRY_TRANSITIONS = new Set<unknown>([
  "CERTIFIED",
  "REJECTED",
  "KEEP_CURRENT",
  "KEEP_PENDING_EVIDENCE",
]);

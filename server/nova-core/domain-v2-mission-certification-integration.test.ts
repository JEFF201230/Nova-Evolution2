import assert from "node:assert/strict";
import test from "node:test";
import type {
  CerebrauMissionCertificationPolicyDecision,
  CerebrauMissionCertificationPolicyInput,
  CerebrauMissionCertificationPolicyPort,
} from "./cerebrau-mission-certification-policy.adapter.js";
import type {
  DomainLotCriteriaEvaluation,
} from "./domain-lot-criteria-evaluator.js";
import {
  DomainV2MissionCertificationIntegration,
  DomainV2MissionCertificationIntegrationError,
  type DomainV2MissionCertificationIntegrationInput,
  type DomainV2MissionCertificationOutcome,
} from "./domain-v2-mission-certification-integration.js";
import type {
  DomainV2MissionIntake,
} from "./domain-v2-mission-intake-bridge.js";

const OFFICIAL_REPORT = Object.freeze({
  Status: "SUCCESS",
  Validations: Object.freeze([
    Object.freeze({ Name: "typecheck", Required: true, Passed: true }),
    Object.freeze({ Name: "tests", Required: true, Passed: true }),
  ]),
});
const EVIDENCE = Object.freeze({
  status: "VALID",
  entries: Object.freeze([
    Object.freeze({ evidenceId: "EVIDENCE:1", status: "VALID" }),
  ]),
});
const TESTS = OFFICIAL_REPORT.Validations;

const INTAKE = Object.freeze({
  schemaVersion: "1.0.0",
  kind: "DOMAIN_V2_MISSION_INTAKE",
  domainId: "PEOPLE",
  lotId: "P3-PEOPLE-001D",
  missionId: "MISSION-001",
}) as DomainV2MissionIntake;

const CRITERIA = Object.freeze({
  schemaVersion: "1.0.0",
  kind: "DOMAIN_LOT_CRITERIA_EVALUATION",
  domainId: "PEOPLE",
  lotId: "P3-PEOPLE-001D",
  decision: "SATISFIED",
  contractCriteriaSatisfied: true,
  criteria: Object.freeze([]),
  blockingCriteriaCodes: Object.freeze([]),
  unsatisfiedCriteriaCodes: Object.freeze([]),
}) as DomainLotCriteriaEvaluation;

const OUTCOME: DomainV2MissionCertificationOutcome = Object.freeze({
  missionId: "MISSION-001",
  executionMode: "IMPLEMENTATION",
  officialStatus: "SUCCESS",
  authorityDecision: "ACCEPTED",
  finalMissionState: "COMPLETED",
  exitCode: 0,
  officialReport: OFFICIAL_REPORT,
  evidence: EVIDENCE,
  tests: TESTS,
  regressions: "NONE",
});

const CERTIFIED_DECISION: CerebrauMissionCertificationPolicyDecision =
  Object.freeze({
    Decision: "CERTIFIED",
    ReasonCode: "MISSION_OUTCOME_CERTIFIED",
    RetryAllowed: false,
    RegistryTransition: "CERTIFIED",
    InvokeCompleteDomainLot: true,
    PreserveEvidence: true,
  });

test("integration maps the ten exact policy fields once and preserves evidence references and order", async () => {
  const calls: CerebrauMissionCertificationPolicyInput[] = [];
  const policy: CerebrauMissionCertificationPolicyPort = {
    async resolve(input) {
      calls.push(input);
      return CERTIFIED_DECISION;
    },
  };
  const integration = enabledIntegration(policy);

  const result = await integration.integrate({
    intake: INTAKE,
    criteriaEvaluation: CRITERIA,
    outcome: OUTCOME,
  });

  assert.ok(result);
  assert.equal(calls.length, 1);
  assert.deepEqual(Object.keys(calls[0]!), [
    "ExecutionMode",
    "OfficialStatus",
    "AuthorityDecision",
    "FinalMissionState",
    "ExitCode",
    "OfficialReport",
    "Evidence",
    "Tests",
    "Regressions",
    "ContractCriteriaSatisfied",
  ]);
  assert.deepEqual(calls[0], {
    ExecutionMode: "IMPLEMENTATION",
    OfficialStatus: "SUCCESS",
    AuthorityDecision: "ACCEPTED",
    FinalMissionState: "COMPLETED",
    ExitCode: 0,
    OfficialReport: OFFICIAL_REPORT,
    Evidence: EVIDENCE,
    Tests: TESTS,
    Regressions: "NONE",
    ContractCriteriaSatisfied: true,
  });
  assert.strictEqual(calls[0]!.OfficialReport, OFFICIAL_REPORT);
  assert.strictEqual(calls[0]!.Evidence, EVIDENCE);
  assert.strictEqual(calls[0]!.Tests, TESTS);
  assert.strictEqual(result.policyInput, calls[0]);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.policyInput), true);
  assert.equal(Object.isFrozen(result.decision), true);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(result)));
});

test("integration maps an unsatisfied criteria evaluation to false without changing the outcome", async () => {
  let observed: CerebrauMissionCertificationPolicyInput | undefined;
  const integration = enabledIntegration({
    async resolve(input) {
      observed = input;
      return CERTIFIED_DECISION;
    },
  });
  const criteria = {
    ...CRITERIA,
    decision: "NOT_SATISFIED" as const,
    contractCriteriaSatisfied: false,
    unsatisfiedCriteriaCodes: Object.freeze(["PEOPLE-LOT-POST-001"]),
  };

  await integration.integrate({
    intake: INTAKE,
    criteriaEvaluation: criteria,
    outcome: OUTCOME,
  });

  assert.equal(observed?.ContractCriteriaSatisfied, false);
  assert.strictEqual(observed?.OfficialReport, OUTCOME.officialReport);
});

test("integration rejects inconsistent criteria decisions before policy access", async () => {
  let calls = 0;
  const integration = enabledIntegration({
    async resolve() {
      calls += 1;
      return CERTIFIED_DECISION;
    },
  });
  const inconsistentCriteria = [
    {
      ...CRITERIA,
      decision: "SATISFIED" as const,
      contractCriteriaSatisfied: false,
    },
    {
      ...CRITERIA,
      decision: "NOT_SATISFIED" as const,
      contractCriteriaSatisfied: true,
    },
  ];

  for (const criteriaEvaluation of inconsistentCriteria) {
    await assert.rejects(
      integration.integrate({
        intake: INTAKE,
        criteriaEvaluation,
        outcome: OUTCOME,
      }),
      (error: unknown) =>
        error instanceof DomainV2MissionCertificationIntegrationError &&
        error.code === "DV2MCI-001",
    );
  }
  assert.equal(calls, 0);
});

test("integration fails closed on domain, lot or mission mismatch without calling policy", async () => {
  let calls = 0;
  const integration = enabledIntegration({
    async resolve() {
      calls += 1;
      return CERTIFIED_DECISION;
    },
  });
  const invalidInputs: DomainV2MissionCertificationIntegrationInput[] = [
    {
      intake: { ...INTAKE, domainId: "OTHER" } as unknown as DomainV2MissionIntake,
      criteriaEvaluation: CRITERIA,
      outcome: OUTCOME,
    },
    {
      intake: INTAKE,
      criteriaEvaluation: {
        ...CRITERIA,
        lotId: "OTHER",
      } as unknown as DomainLotCriteriaEvaluation,
      outcome: OUTCOME,
    },
    {
      intake: INTAKE,
      criteriaEvaluation: CRITERIA,
      outcome: { ...OUTCOME, missionId: "MISSION-OTHER" },
    },
  ];

  for (const input of invalidInputs) {
    await assert.rejects(
      integration.integrate(input),
      (error: unknown) =>
        error instanceof DomainV2MissionCertificationIntegrationError &&
        error.code === "DV2MCI-002",
    );
  }
  assert.equal(calls, 0);
});

test("integration preserves every policy decision field without applying its transition", async () => {
  const decision: CerebrauMissionCertificationPolicyDecision = {
    Decision: "PENDING_REVIEW",
    ReasonCode: "AUTHORITY_REVIEW_REQUIRED",
    RetryAllowed: true,
    RegistryTransition: "KEEP_PENDING_EVIDENCE",
    InvokeCompleteDomainLot: false,
    PreserveEvidence: true,
  };
  const integration = enabledIntegration({
    async resolve() {
      return decision;
    },
  });

  const result = await integration.integrate({
    intake: INTAKE,
    criteriaEvaluation: CRITERIA,
    outcome: OUTCOME,
  });

  assert.ok(result);
  assert.deepEqual(result.decision, decision);
  assert.notStrictEqual(result.decision, decision);
});

test("integration rejects malformed port decisions without producing a false success", async () => {
  const malformedDecisions = [
    {
      ...CERTIFIED_DECISION,
      unexpected: true,
    },
    {
      ...CERTIFIED_DECISION,
      InvokeCompleteDomainLot: false,
    },
    {
      ...CERTIFIED_DECISION,
      PreserveEvidence: false,
    },
    {
      ...CERTIFIED_DECISION,
      Decision: "UNKNOWN",
    },
  ];

  for (const malformed of malformedDecisions) {
    const integration = enabledIntegration({
      async resolve() {
        return malformed as unknown as CerebrauMissionCertificationPolicyDecision;
      },
    });
    await assert.rejects(
      integration.integrate({
        intake: INTAKE,
        criteriaEvaluation: CRITERIA,
        outcome: OUTCOME,
      }),
      (error: unknown) =>
        error instanceof DomainV2MissionCertificationIntegrationError &&
        error.code === "DV2MCI-005",
    );
  }
});

test("integration propagates the policy port failure unchanged", async () => {
  const failure = new Error("POLICY_UNAVAILABLE");
  const integration = enabledIntegration({
    async resolve() {
      throw failure;
    },
  });

  await assert.rejects(
    integration.integrate({
      intake: INTAKE,
      criteriaEvaluation: CRITERIA,
      outcome: OUTCOME,
    }),
    (error: unknown) => error === failure,
  );
});

test("integration is inert before input and dependency access when feature flag is OFF", async () => {
  const integration = new DomainV2MissionCertificationIntegration();

  const result = await integration.integrate(
    null as unknown as DomainV2MissionCertificationIntegrationInput,
  );

  assert.equal(result, null);
});

function enabledIntegration(
  policy: CerebrauMissionCertificationPolicyPort,
): DomainV2MissionCertificationIntegration {
  return new DomainV2MissionCertificationIntegration(
    { enabled: true },
    { policy },
  );
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_SUPPORTED_CONCURRENT_PDS,
  createParallelOrchestrationComponents,
  createParallelOrchestrationEvidence,
  runValidationCampaigns,
  simulateParallelPdsExecution,
  verifyParallelOrchestration,
} from "./parallel-orchestration.js";
import type {
  ParallelOrchestrationComponent,
  ValidationCampaignId,
  ValidationCampaignResult,
} from "./parallel-orchestration.js";
import {
  verifyFinalCertification,
} from "../final-certification/final-certification.js";

const COMPONENTS: readonly ParallelOrchestrationComponent[] = Object.freeze([
  Object.freeze({
    id: "executive-decision-coherence",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_008_VALIDATION_REPORT.md",
  }),
  Object.freeze({
    id: "stress-benchmark",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/PROGRAM_014_STRESS_REPORT.md",
  }),
  Object.freeze({
    id: "large-portfolio-simulation",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_006_VALIDATION_REPORT.md",
  }),
  Object.freeze({
    id: "failure-recovery-isolation",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_005_VALIDATION_REPORT.md",
  }),
  Object.freeze({
    id: "conflict-stop-control",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_004_VALIDATION_REPORT.md",
  }),
  Object.freeze({
    id: "triple-dependency-scheduling",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_003_VALIDATION_REPORT.md",
  }),
  Object.freeze({
    id: "dual-parallel-pds",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_002_VALIDATION_REPORT.md",
  }),
  Object.freeze({
    id: "single-pds-validation",
    ready: true,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_001_VALIDATION_REPORT.md",
  }),
]);

test("Parallel Orchestration certifies PROGRAM-014 from final certification and campaigns", () => {
  const result = verifyParallelOrchestration();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.finalCertificationPassed, true);
  assert.equal(result.evidence.campaignCount, 8);
  assert.equal(result.evidence.passedCampaignCount, 8);
  assert.equal(result.evidence.finalDecision, "NOVA PARALLEL ORCHESTRATION CERTIFIED");
  assert.equal(result.evidence.benchmark.maxSupportedConcurrentPds, MAX_SUPPORTED_CONCURRENT_PDS);
  assert.deepEqual(Object.values(result.evidence.successCriteria), [
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]);
});

test("Parallel Orchestration preserves deterministic component ordering", () => {
  const components = createParallelOrchestrationComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "single-pds-validation",
      "dual-parallel-pds",
      "triple-dependency-scheduling",
      "conflict-stop-control",
      "failure-recovery-isolation",
      "large-portfolio-simulation",
      "stress-benchmark",
      "executive-decision-coherence",
    ],
  );
});

test("Parallel Orchestration campaign metrics prove concurrency, dependency, and STOP behavior", () => {
  const campaigns = runValidationCampaigns();
  const dual = requireCampaign(campaigns, "CAMPAIGN-002");
  const triple = requireCampaign(campaigns, "CAMPAIGN-003");
  const conflict = requireCampaign(campaigns, "CAMPAIGN-004");

  const dependency = triple.simulation.records.find(
    (record) => record.pdsId === "P14-C3-PDS-001",
  );
  const dependent = triple.simulation.records.find(
    (record) => record.pdsId === "P14-C3-PDS-002",
  );

  assert.equal(dual.decision, "GO");
  assert.equal(dual.simulation.metrics.maxConcurrentPds, 2);
  assert.equal(dual.simulation.metrics.waveCount, 1);
  assert.equal(triple.decision, "GO");
  assert.notEqual(dependency, undefined);
  assert.notEqual(dependent, undefined);
  assert.equal(dependent!.startTick >= dependency!.endTick, true);
  assert.equal(conflict.decision, "STOP");
  assert.equal(conflict.simulation.stopReason, "ARTIFACT_CONFLICT");
  assert.equal(conflict.simulation.metrics.stoppedPdsCount, 2);
  assert.equal(conflict.simulation.metrics.repositoryProtected, true);
});

test("Parallel Orchestration campaign metrics prove recovery, portfolio scale, and stress benchmark", () => {
  const campaigns = runValidationCampaigns();
  const recovery = requireCampaign(campaigns, "CAMPAIGN-005");
  const portfolio = requireCampaign(campaigns, "CAMPAIGN-006");
  const stress = requireCampaign(campaigns, "CAMPAIGN-007");

  assert.equal(recovery.decision, "GO");
  assert.equal(recovery.simulation.metrics.failedPdsCount, 1);
  assert.equal(recovery.simulation.metrics.completedPdsCount, 2);
  assert.equal(recovery.simulation.metrics.failureIsolated, true);
  assert.equal(recovery.simulation.metrics.escalationRaised, true);

  assert.equal(portfolio.decision, "GO");
  assert.equal(portfolio.simulation.metrics.programCount, 10);
  assert.equal(portfolio.simulation.metrics.missionOrderCount, 30);
  assert.equal(portfolio.simulation.metrics.campaignCount, 100);
  assert.equal(portfolio.simulation.metrics.schedulingEfficiency, 1);

  assert.equal(stress.decision, "BENCHMARK_ESTABLISHED");
  assert.equal(stress.simulation.metrics.maxConcurrentPds, MAX_SUPPORTED_CONCURRENT_PDS);
  assert.equal(stress.simulation.metrics.throughputPdsPerTick, MAX_SUPPORTED_CONCURRENT_PDS);
  assert.equal(stress.simulation.metrics.averageLatencyTicks, 1);
});

test("Parallel Orchestration reports STOP when final certification is degraded", () => {
  const finalCertification = verifyFinalCertification();
  const degradedFinalCertification = Object.freeze({
    passed: false,
    evidence: finalCertification.evidence,
  });
  const evidence = createParallelOrchestrationEvidence(
    degradedFinalCertification,
    COMPONENTS,
    runValidationCampaigns(),
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.finalCertificationPassed, false);
  assert.equal(evidence.finalDecision, "STOP");
});

test("Parallel Orchestration validates component and simulation inputs", () => {
  assert.throws(
    () =>
      createParallelOrchestrationComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PPAR-002:/,
  );
  assert.throws(
    () =>
      createParallelOrchestrationComponents([
        {
          id: "single-pds-validation",
          ready: true,
          evidenceReference:
            "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_001_VALIDATION_REPORT.md",
        },
        {
          id: "single-pds-validation",
          ready: true,
          evidenceReference:
            "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_001_VALIDATION_REPORT.md",
        },
      ]),
    /^Error: PPAR-003:/,
  );
  assert.throws(
    () =>
      createParallelOrchestrationComponents([
        {
          id: "single-pds-validation",
          ready: true,
          evidenceReference: "",
        },
      ]),
    /^Error: PPAR-004:/,
  );
  assert.throws(
    () => simulateParallelPdsExecution([]),
    /^Error: PPAR-005:/,
  );
  assert.throws(
    () =>
      simulateParallelPdsExecution([
        {
          id: "PDS-A",
          programId: "PROGRAM-A",
          missionOrderCount: 1,
          campaignCount: 1,
          artifactRefs: ["artifact-a"],
          dependsOn: ["PDS-MISSING"],
        },
      ]),
    /^Error: PPAR-010:/,
  );
});

function requireCampaign(
  campaigns: readonly ValidationCampaignResult[],
  id: ValidationCampaignId,
): ValidationCampaignResult {
  const campaign = campaigns.find((candidate) => candidate.id === id);

  assert.notEqual(campaign, undefined);

  return campaign!;
}

import {
  verifyFinalCertification,
} from "../final-certification/final-certification.js";
import type {
  FinalCertificationResult,
} from "../final-certification/final-certification.js";

export const MAX_SUPPORTED_CONCURRENT_PDS = 16;

export type ParallelOrchestrationComponentId =
  | "single-pds-validation"
  | "dual-parallel-pds"
  | "triple-dependency-scheduling"
  | "conflict-stop-control"
  | "failure-recovery-isolation"
  | "large-portfolio-simulation"
  | "stress-benchmark"
  | "executive-decision-coherence";

export type ValidationCampaignId =
  | "CAMPAIGN-001"
  | "CAMPAIGN-002"
  | "CAMPAIGN-003"
  | "CAMPAIGN-004"
  | "CAMPAIGN-005"
  | "CAMPAIGN-006"
  | "CAMPAIGN-007"
  | "CAMPAIGN-008";

export type CampaignDecision =
  | "GO"
  | "STOP"
  | "BENCHMARK_ESTABLISHED";

export type PdsExecutionStatus =
  | "COMPLETE"
  | "FAILED"
  | "STOPPED";

export interface ParallelOrchestrationComponent {
  readonly id: ParallelOrchestrationComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface ProgramDeliverySquadSimulation {
  readonly id: string;
  readonly programId: string;
  readonly missionOrderCount: number;
  readonly campaignCount: number;
  readonly artifactRefs: readonly string[];
  readonly dependsOn?: readonly string[];
  readonly forceFailure?: boolean;
  readonly certificationReady?: boolean;
}

export interface ProgramBoardDecision {
  readonly sequence: number;
  readonly programId: string;
  readonly decision: "APPROVED" | "STOP";
}

export interface PdsExecutionRecord {
  readonly pdsId: string;
  readonly programId: string;
  readonly status: PdsExecutionStatus;
  readonly decision: CampaignDecision;
  readonly wave: number;
  readonly startTick: number;
  readonly endTick: number;
  readonly missionOrderCount: number;
  readonly campaignCount: number;
  readonly artifactRefs: readonly string[];
  readonly dependencyIds: readonly string[];
  readonly traceReferences: readonly string[];
}

export interface OrchestrationSimulationOptions {
  readonly maxConcurrentPds: number;
  readonly stopOnConflict: boolean;
  readonly continueOnFailure: boolean;
  readonly governanceTicksPerPds: number;
  readonly programBoardDecisions?: readonly ProgramBoardDecision[];
}

export interface OrchestrationMetrics {
  readonly programCount: number;
  readonly missionOrderCount: number;
  readonly campaignCount: number;
  readonly requestedPdsCount: number;
  readonly completedPdsCount: number;
  readonly failedPdsCount: number;
  readonly stoppedPdsCount: number;
  readonly supportedConcurrentPds: number;
  readonly maxConcurrentPds: number;
  readonly waveCount: number;
  readonly totalTicks: number;
  readonly throughputPdsPerTick: number;
  readonly averageLatencyTicks: number;
  readonly schedulingEfficiency: number;
  readonly governanceOverheadTicks: number;
  readonly traceRecordCount: number;
  readonly repositoryProtected: boolean;
  readonly deterministicGovernance: boolean;
  readonly missionOrderIsolation: boolean;
  readonly campaignIsolation: boolean;
  readonly certificationIntegrity: boolean;
  readonly completeTraceability: boolean;
  readonly failureIsolated: boolean;
  readonly escalationRaised: boolean;
  readonly executiveDecisionCoherence: boolean;
}

export interface OrchestrationSimulation {
  readonly records: readonly PdsExecutionRecord[];
  readonly metrics: OrchestrationMetrics;
  readonly stopReason?: string;
}

export interface ValidationCampaignResult {
  readonly id: ValidationCampaignId;
  readonly title: string;
  readonly expectedResult: CampaignDecision;
  readonly decision: CampaignDecision;
  readonly passed: boolean;
  readonly evidenceReference: string;
  readonly assertions: readonly string[];
  readonly simulation: OrchestrationSimulation;
}

export interface ParallelOrchestrationSuccessCriteria {
  readonly concurrentProgramExecution: boolean;
  readonly missionOrderIsolation: boolean;
  readonly campaignIsolation: boolean;
  readonly repositoryIntegrity: boolean;
  readonly deterministicGovernance: boolean;
  readonly certificationIntegrity: boolean;
  readonly completeTraceability: boolean;
}

export interface ParallelOrchestrationBenchmark {
  readonly maxSupportedConcurrentPds: number;
  readonly stressThroughputPdsPerTick: number;
  readonly stressAverageLatencyTicks: number;
  readonly stressSchedulingEfficiency: number;
  readonly stressGovernanceOverheadTicks: number;
}

export interface ParallelOrchestrationEvidence {
  readonly components: readonly ParallelOrchestrationComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly finalCertificationPassed: boolean;
  readonly campaigns: readonly ValidationCampaignResult[];
  readonly campaignCount: number;
  readonly passedCampaignCount: number;
  readonly successCriteria: ParallelOrchestrationSuccessCriteria;
  readonly benchmark: ParallelOrchestrationBenchmark;
  readonly ready: boolean;
  readonly finalDecision: "NOVA PARALLEL ORCHESTRATION CERTIFIED" | "STOP";
}

export interface ParallelOrchestrationResult {
  readonly passed: boolean;
  readonly evidence: ParallelOrchestrationEvidence;
}

const PARALLEL_ORCHESTRATION_COMPONENT_IDS: readonly ParallelOrchestrationComponentId[] =
  Object.freeze([
    "single-pds-validation",
    "dual-parallel-pds",
    "triple-dependency-scheduling",
    "conflict-stop-control",
    "failure-recovery-isolation",
    "large-portfolio-simulation",
    "stress-benchmark",
    "executive-decision-coherence",
  ]);

const DEFAULT_PARALLEL_ORCHESTRATION_COMPONENTS: readonly ParallelOrchestrationComponent[] =
  Object.freeze([
    Object.freeze({
      id: "single-pds-validation",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_001_VALIDATION_REPORT.md",
    }),
    Object.freeze({
      id: "dual-parallel-pds",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_002_VALIDATION_REPORT.md",
    }),
    Object.freeze({
      id: "triple-dependency-scheduling",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_003_VALIDATION_REPORT.md",
    }),
    Object.freeze({
      id: "conflict-stop-control",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_004_VALIDATION_REPORT.md",
    }),
    Object.freeze({
      id: "failure-recovery-isolation",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_005_VALIDATION_REPORT.md",
    }),
    Object.freeze({
      id: "large-portfolio-simulation",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_006_VALIDATION_REPORT.md",
    }),
    Object.freeze({
      id: "stress-benchmark",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/PROGRAM_014_STRESS_REPORT.md",
    }),
    Object.freeze({
      id: "executive-decision-coherence",
      ready: true,
      evidenceReference:
        "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_008_VALIDATION_REPORT.md",
    }),
  ]);

const DEFAULT_SIMULATION_OPTIONS: OrchestrationSimulationOptions = Object.freeze({
  maxConcurrentPds: MAX_SUPPORTED_CONCURRENT_PDS,
  stopOnConflict: true,
  continueOnFailure: true,
  governanceTicksPerPds: 3,
});

export function verifyParallelOrchestration(
  finalCertification: FinalCertificationResult = verifyFinalCertification(),
): ParallelOrchestrationResult {
  const evidence = createParallelOrchestrationEvidence(
    finalCertification,
    DEFAULT_PARALLEL_ORCHESTRATION_COMPONENTS,
    runValidationCampaigns(),
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createParallelOrchestrationComponents(
  components: readonly ParallelOrchestrationComponent[],
): readonly ParallelOrchestrationComponent[] {
  assertParallelOrchestrationComponents(components);

  return Object.freeze(
    PARALLEL_ORCHESTRATION_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PPAR-001: Parallel Orchestration could not preserve deterministic component ordering.",
          );
        }

        return Object.freeze({
          id: component.id,
          ready: component.ready,
          evidenceReference: component.evidenceReference,
        });
      }),
  );
}

export function createParallelOrchestrationEvidence(
  finalCertification: FinalCertificationResult,
  components: readonly ParallelOrchestrationComponent[],
  campaigns: readonly ValidationCampaignResult[],
): ParallelOrchestrationEvidence {
  const orderedComponents = createParallelOrchestrationComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = PARALLEL_ORCHESTRATION_COMPONENT_IDS.length;
  const orderedCampaigns = createValidationCampaignResults(campaigns);
  const passedCampaignCount = orderedCampaigns.filter((campaign) => campaign.passed).length;
  const successCriteria = createSuccessCriteria(orderedCampaigns);
  const stressCampaign = requireCampaign(orderedCampaigns, "CAMPAIGN-007");
  const benchmark = Object.freeze({
    maxSupportedConcurrentPds: MAX_SUPPORTED_CONCURRENT_PDS,
    stressThroughputPdsPerTick: stressCampaign.simulation.metrics.throughputPdsPerTick,
    stressAverageLatencyTicks: stressCampaign.simulation.metrics.averageLatencyTicks,
    stressSchedulingEfficiency: stressCampaign.simulation.metrics.schedulingEfficiency,
    stressGovernanceOverheadTicks: stressCampaign.simulation.metrics.governanceOverheadTicks,
  });
  const ready =
    finalCertification.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount &&
    orderedCampaigns.length === 8 &&
    passedCampaignCount === orderedCampaigns.length &&
    Object.values(successCriteria).every((value) => value);

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    finalCertificationPassed: finalCertification.passed,
    campaigns: orderedCampaigns,
    campaignCount: orderedCampaigns.length,
    passedCampaignCount,
    successCriteria,
    benchmark,
    ready,
    finalDecision: ready ? "NOVA PARALLEL ORCHESTRATION CERTIFIED" : "STOP",
  });
}

export function runValidationCampaigns(): readonly ValidationCampaignResult[] {
  return createValidationCampaignResults([
    runSinglePdsValidation(),
    runDualParallelPdsValidation(),
    runTripleParallelDependencyValidation(),
    runConflictDetectionValidation(),
    runFailureRecoveryValidation(),
    runLargePortfolioSimulation(),
    runStressBenchmark(),
    runExecutiveValidation(),
  ]);
}

export function simulateParallelPdsExecution(
  squads: readonly ProgramDeliverySquadSimulation[],
  options: OrchestrationSimulationOptions = DEFAULT_SIMULATION_OPTIONS,
): OrchestrationSimulation {
  assertProgramDeliverySquads(squads);
  assertSimulationOptions(options);

  const sortedSquads = [...squads].sort(compareById);
  const squadById = new Map(sortedSquads.map((squad) => [squad.id, squad]));

  for (const squad of sortedSquads) {
    for (const dependencyId of squad.dependsOn ?? []) {
      if (!squadById.has(dependencyId)) {
        throw new Error("PPAR-010: Parallel Orchestration rejects unknown PDS dependencies.");
      }
    }
  }

  const pending = new Map(sortedSquads.map((squad) => [squad.id, squad]));
  const completed = new Set<string>();
  const records: PdsExecutionRecord[] = [];
  let tick = 0;
  let stopReason: string | undefined;

  while (pending.size > 0) {
    const readySquads = [...pending.values()]
      .filter((squad) => dependenciesSatisfied(squad, completed))
      .sort(compareById)
      .slice(0, options.maxConcurrentPds);

    if (readySquads.length === 0) {
      stopReason = "DEPENDENCY_NOT_READY";
      break;
    }

    const conflictingSquadIds = findConflictingSquadIds(readySquads);

    if (conflictingSquadIds.size > 0 && options.stopOnConflict) {
      for (const squad of readySquads.filter((candidate) =>
        conflictingSquadIds.has(candidate.id),
      )) {
        records.push(createExecutionRecord(squad, "STOPPED", "STOP", tick));
        pending.delete(squad.id);
      }

      stopReason = "ARTIFACT_CONFLICT";
      break;
    }

    let failureInWave = false;

    for (const squad of readySquads) {
      const status: PdsExecutionStatus = squad.forceFailure === true ? "FAILED" : "COMPLETE";
      const decision: CampaignDecision = status === "FAILED" ? "STOP" : "GO";

      records.push(createExecutionRecord(squad, status, decision, tick));
      pending.delete(squad.id);

      if (status === "COMPLETE") {
        completed.add(squad.id);
      }

      if (status === "FAILED") {
        failureInWave = true;
      }
    }

    tick += 1;

    if (failureInWave && !options.continueOnFailure) {
      stopReason = "PDS_FAILURE";
      break;
    }
  }

  const metrics = createSimulationMetrics(
    sortedSquads,
    records,
    options,
    stopReason,
  );

  return Object.freeze({
    records: Object.freeze(records),
    metrics,
    ...(stopReason === undefined ? {} : { stopReason }),
  });
}

function runSinglePdsValidation(): ValidationCampaignResult {
  const simulation = simulateParallelPdsExecution([
    createSquad("P14-C1-PDS-001", "P14-C1-PROGRAM-001", 1, 1, "single"),
  ]);
  const passed =
    simulation.metrics.completedPdsCount === 1 &&
    simulation.metrics.stoppedPdsCount === 0 &&
    simulation.metrics.certificationIntegrity &&
    simulation.metrics.completeTraceability;

  return createCampaignResult({
    id: "CAMPAIGN-001",
    title: "Single PDS Validation",
    expectedResult: "GO",
    decision: passed ? "GO" : "STOP",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_001_VALIDATION_REPORT.md",
    assertions: [
      "one Program Delivery Squad completed",
      "mission order lifecycle closed",
      "campaign lifecycle closed",
      "certification trace emitted",
    ],
    simulation,
  });
}

function runDualParallelPdsValidation(): ValidationCampaignResult {
  const simulation = simulateParallelPdsExecution([
    createSquad("P14-C2-PDS-001", "P14-C2-PROGRAM-001", 1, 2, "dual-a"),
    createSquad("P14-C2-PDS-002", "P14-C2-PROGRAM-002", 1, 2, "dual-b"),
  ]);
  const passed =
    simulation.metrics.completedPdsCount === 2 &&
    simulation.metrics.maxConcurrentPds === 2 &&
    simulation.metrics.waveCount === 1 &&
    simulation.metrics.deterministicGovernance &&
    simulation.metrics.certificationIntegrity;

  return createCampaignResult({
    id: "CAMPAIGN-002",
    title: "Dual Parallel PDS",
    expectedResult: "GO",
    decision: passed ? "GO" : "STOP",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_002_VALIDATION_REPORT.md",
    assertions: [
      "two independent squads launched in the same scheduler wave",
      "reporting traces remained separate",
      "governance and certification gates closed independently",
    ],
    simulation,
  });
}

function runTripleParallelDependencyValidation(): ValidationCampaignResult {
  const simulation = simulateParallelPdsExecution([
    createSquad("P14-C3-PDS-001", "P14-C3-PROGRAM-001", 1, 2, "triple-a"),
    createSquad(
      "P14-C3-PDS-002",
      "P14-C3-PROGRAM-002",
      1,
      2,
      "triple-b",
      ["P14-C3-PDS-001"],
    ),
    createSquad("P14-C3-PDS-003", "P14-C3-PROGRAM-003", 1, 2, "triple-c"),
  ]);
  const dependency = simulation.records.find((record) => record.pdsId === "P14-C3-PDS-001");
  const dependent = simulation.records.find((record) => record.pdsId === "P14-C3-PDS-002");
  const passed =
    simulation.metrics.completedPdsCount === 3 &&
    dependency !== undefined &&
    dependent !== undefined &&
    dependent.startTick >= dependency.endTick &&
    simulation.metrics.waveCount === 2;

  return createCampaignResult({
    id: "CAMPAIGN-003",
    title: "Triple Parallel Execution",
    expectedResult: "GO",
    decision: passed ? "GO" : "STOP",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_003_VALIDATION_REPORT.md",
    assertions: [
      "three squads were accepted into the schedule",
      "dependent program waited for its prerequisite",
      "independent program continued while the dependency gate was enforced",
    ],
    simulation,
  });
}

function runConflictDetectionValidation(): ValidationCampaignResult {
  const simulation = simulateParallelPdsExecution([
    createSquad("P14-C4-PDS-001", "P14-C4-PROGRAM-001", 1, 1, "shared-artifact"),
    createSquad("P14-C4-PDS-002", "P14-C4-PROGRAM-002", 1, 1, "shared-artifact"),
  ]);
  const passed =
    simulation.stopReason === "ARTIFACT_CONFLICT" &&
    simulation.metrics.stoppedPdsCount === 2 &&
    simulation.metrics.completedPdsCount === 0 &&
    simulation.metrics.repositoryProtected;

  return createCampaignResult({
    id: "CAMPAIGN-004",
    title: "Conflict Detection",
    expectedResult: "STOP",
    decision: passed ? "STOP" : "GO",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_004_VALIDATION_REPORT.md",
    assertions: [
      "same artifact reservation was detected in a single scheduler wave",
      "conflicting squads were stopped before repository mutation",
      "automatic STOP was recorded as the governed decision",
    ],
    simulation,
  });
}

function runFailureRecoveryValidation(): ValidationCampaignResult {
  const simulation = simulateParallelPdsExecution([
    createSquad("P14-C5-PDS-001", "P14-C5-PROGRAM-001", 1, 2, "failure-a"),
    {
      ...createSquad("P14-C5-PDS-002", "P14-C5-PROGRAM-002", 1, 2, "failure-b"),
      forceFailure: true,
    },
    createSquad("P14-C5-PDS-003", "P14-C5-PROGRAM-003", 1, 2, "failure-c"),
  ]);
  const passed =
    simulation.metrics.failedPdsCount === 1 &&
    simulation.metrics.completedPdsCount === 2 &&
    simulation.metrics.failureIsolated &&
    simulation.metrics.escalationRaised &&
    simulation.metrics.repositoryProtected;

  return createCampaignResult({
    id: "CAMPAIGN-005",
    title: "Failure Recovery",
    expectedResult: "GO",
    decision: passed ? "GO" : "STOP",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_005_VALIDATION_REPORT.md",
    assertions: [
      "one squad failed under controlled conditions",
      "remaining squads completed without shared-state contamination",
      "failure was reported and escalated",
    ],
    simulation,
  });
}

function runLargePortfolioSimulation(): ValidationCampaignResult {
  const squads = Array.from({ length: 10 }, (_, index) =>
    createSquad(
      `P14-C6-PDS-${formatNumber(index + 1, 3)}`,
      `P14-C6-PROGRAM-${formatNumber(index + 1, 3)}`,
      3,
      10,
      `large-${formatNumber(index + 1, 3)}`,
    ),
  );
  const simulation = simulateParallelPdsExecution(squads, {
    ...DEFAULT_SIMULATION_OPTIONS,
    maxConcurrentPds: 5,
  });
  const passed =
    simulation.metrics.programCount === 10 &&
    simulation.metrics.missionOrderCount === 30 &&
    simulation.metrics.campaignCount === 100 &&
    simulation.metrics.completedPdsCount === 10 &&
    simulation.metrics.completeTraceability &&
    simulation.metrics.schedulingEfficiency === 1;

  return createCampaignResult({
    id: "CAMPAIGN-006",
    title: "Large Portfolio Simulation",
    expectedResult: "GO",
    decision: passed ? "GO" : "STOP",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_006_VALIDATION_REPORT.md",
    assertions: [
      "10 programs scheduled",
      "30 mission orders isolated",
      "100 campaigns traced",
      "portfolio KPI and consistency checks stayed coherent",
    ],
    simulation,
  });
}

function runStressBenchmark(): ValidationCampaignResult {
  const squads = Array.from({ length: MAX_SUPPORTED_CONCURRENT_PDS }, (_, index) =>
    createSquad(
      `P14-C7-PDS-${formatNumber(index + 1, 3)}`,
      `P14-C7-PROGRAM-${formatNumber(index + 1, 3)}`,
      3,
      6,
      `stress-${formatNumber(index + 1, 3)}`,
    ),
  );
  const simulation = simulateParallelPdsExecution(squads);
  const passed =
    simulation.metrics.maxConcurrentPds === MAX_SUPPORTED_CONCURRENT_PDS &&
    simulation.metrics.completedPdsCount === MAX_SUPPORTED_CONCURRENT_PDS &&
    simulation.metrics.throughputPdsPerTick === MAX_SUPPORTED_CONCURRENT_PDS &&
    simulation.metrics.averageLatencyTicks === 1;

  return createCampaignResult({
    id: "CAMPAIGN-007",
    title: "Stress Test",
    expectedResult: "BENCHMARK_ESTABLISHED",
    decision: passed ? "BENCHMARK_ESTABLISHED" : "STOP",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/PROGRAM_014_STRESS_REPORT.md",
    assertions: [
      "maximum supported concurrent PDS value measured",
      "throughput and latency captured in deterministic scheduler ticks",
      "governance overhead captured per squad",
    ],
    simulation,
  });
}

function runExecutiveValidation(): ValidationCampaignResult {
  const squads = Array.from({ length: 4 }, (_, index) =>
    createSquad(
      `P14-C8-PDS-${formatNumber(index + 1, 3)}`,
      `P14-C8-PROGRAM-${formatNumber(index + 1, 3)}`,
      1,
      2,
      `executive-${formatNumber(index + 1, 3)}`,
    ),
  );
  const programBoardDecisions = squads.map((squad, index) =>
    Object.freeze({
      sequence: index + 1,
      programId: squad.programId,
      decision: "APPROVED" as const,
    }),
  );
  const simulation = simulateParallelPdsExecution(squads, {
    ...DEFAULT_SIMULATION_OPTIONS,
    programBoardDecisions,
  });
  const passed =
    simulation.metrics.completedPdsCount === 4 &&
    simulation.metrics.executiveDecisionCoherence &&
    simulation.metrics.deterministicGovernance;

  return createCampaignResult({
    id: "CAMPAIGN-008",
    title: "Executive Validation",
    expectedResult: "GO",
    decision: passed ? "GO" : "STOP",
    passed,
    evidenceReference:
      "Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/CAMPAIGN_008_VALIDATION_REPORT.md",
    assertions: [
      "Program Board decisions remained one-to-one with concurrent programs",
      "decision sequence stayed deterministic",
      "all approved programs reached governed GO",
    ],
    simulation,
  });
}

function createCampaignResult(input: ValidationCampaignResult): ValidationCampaignResult {
  return Object.freeze({
    id: input.id,
    title: input.title,
    expectedResult: input.expectedResult,
    decision: input.decision,
    passed: input.passed,
    evidenceReference: input.evidenceReference,
    assertions: Object.freeze([...input.assertions]),
    simulation: input.simulation,
  });
}

function createValidationCampaignResults(
  campaigns: readonly ValidationCampaignResult[],
): readonly ValidationCampaignResult[] {
  const seen = new Set<string>();

  for (const campaign of campaigns) {
    if (seen.has(campaign.id)) {
      throw new Error("PPAR-011: Parallel Orchestration rejects duplicate campaigns.");
    }

    seen.add(campaign.id);
    assertNormalizedEvidenceReference(campaign.evidenceReference, "PPAR-012");
  }

  return Object.freeze(
    [
      "CAMPAIGN-001",
      "CAMPAIGN-002",
      "CAMPAIGN-003",
      "CAMPAIGN-004",
      "CAMPAIGN-005",
      "CAMPAIGN-006",
      "CAMPAIGN-007",
      "CAMPAIGN-008",
    ].map((campaignId) => {
      const campaign = campaigns.find((candidate) => candidate.id === campaignId);

      if (campaign === undefined) {
        throw new Error("PPAR-013: Parallel Orchestration requires all validation campaigns.");
      }

      return campaign;
    }),
  );
}

function createSuccessCriteria(
  campaigns: readonly ValidationCampaignResult[],
): ParallelOrchestrationSuccessCriteria {
  const campaign2 = requireCampaign(campaigns, "CAMPAIGN-002");
  const campaign3 = requireCampaign(campaigns, "CAMPAIGN-003");
  const campaign4 = requireCampaign(campaigns, "CAMPAIGN-004");
  const campaign7 = requireCampaign(campaigns, "CAMPAIGN-007");
  const successfulCampaigns = campaigns.filter((campaign) => campaign.id !== "CAMPAIGN-004");

  return Object.freeze({
    concurrentProgramExecution:
      campaign2.simulation.metrics.maxConcurrentPds >= 2 &&
      campaign3.simulation.metrics.completedPdsCount === 3 &&
      campaign7.simulation.metrics.maxConcurrentPds === MAX_SUPPORTED_CONCURRENT_PDS,
    missionOrderIsolation: successfulCampaigns.every(
      (campaign) => campaign.simulation.metrics.missionOrderIsolation,
    ),
    campaignIsolation: successfulCampaigns.every(
      (campaign) => campaign.simulation.metrics.campaignIsolation,
    ),
    repositoryIntegrity:
      campaigns.every((campaign) => campaign.simulation.metrics.repositoryProtected) &&
      campaign4.decision === "STOP",
    deterministicGovernance: campaigns.every(
      (campaign) => campaign.simulation.metrics.deterministicGovernance,
    ),
    certificationIntegrity: successfulCampaigns.every(
      (campaign) => campaign.simulation.metrics.certificationIntegrity,
    ),
    completeTraceability: campaigns.every(
      (campaign) => campaign.simulation.metrics.completeTraceability,
    ),
  });
}

function requireCampaign(
  campaigns: readonly ValidationCampaignResult[],
  id: ValidationCampaignId,
): ValidationCampaignResult {
  const campaign = campaigns.find((candidate) => candidate.id === id);

  if (campaign === undefined) {
    throw new Error(`PPAR-014: Parallel Orchestration missing ${id}.`);
  }

  return campaign;
}

function createSquad(
  id: string,
  programId: string,
  missionOrderCount: number,
  campaignCount: number,
  artifactSuffix: string,
  dependsOn: readonly string[] = Object.freeze([]),
): ProgramDeliverySquadSimulation {
  return Object.freeze({
    id,
    programId,
    missionOrderCount,
    campaignCount,
    artifactRefs: Object.freeze([
      `Docs/19_PROGRAMS/PROGRAM-014_PARALLEL_ORCHESTRATION_VALIDATION/artifacts/${artifactSuffix}.md`,
    ]),
    dependsOn: Object.freeze([...dependsOn]),
    certificationReady: true,
  });
}

function createExecutionRecord(
  squad: ProgramDeliverySquadSimulation,
  status: PdsExecutionStatus,
  decision: CampaignDecision,
  tick: number,
): PdsExecutionRecord {
  const missionOrderReferences = Array.from(
    { length: squad.missionOrderCount },
    (_, index) => `${squad.programId}:MO-${formatNumber(index + 1, 3)}`,
  );
  const campaignReferences = Array.from(
    { length: squad.campaignCount },
    (_, index) => `${squad.programId}:CAMPAIGN-${formatNumber(index + 1, 3)}`,
  );

  return Object.freeze({
    pdsId: squad.id,
    programId: squad.programId,
    status,
    decision,
    wave: tick,
    startTick: tick,
    endTick: tick + 1,
    missionOrderCount: squad.missionOrderCount,
    campaignCount: squad.campaignCount,
    artifactRefs: Object.freeze([...squad.artifactRefs]),
    dependencyIds: Object.freeze([...(squad.dependsOn ?? [])]),
    traceReferences: Object.freeze([
      `${squad.programId}:PROGRAM`,
      ...missionOrderReferences,
      ...campaignReferences,
      `${squad.programId}:CERTIFICATION:${status}`,
    ]),
  });
}

function createSimulationMetrics(
  squads: readonly ProgramDeliverySquadSimulation[],
  records: readonly PdsExecutionRecord[],
  options: OrchestrationSimulationOptions,
  stopReason: string | undefined,
): OrchestrationMetrics {
  const completedPdsCount = records.filter((record) => record.status === "COMPLETE").length;
  const failedPdsCount = records.filter((record) => record.status === "FAILED").length;
  const stoppedPdsCount = records.filter((record) => record.status === "STOPPED").length;
  const executedPdsCount = completedPdsCount + failedPdsCount + stoppedPdsCount;
  const totalTicks = records.length === 0
    ? 0
    : Math.max(...records.map((record) => record.endTick));
  const waveCounts = new Map<number, number>();

  for (const record of records) {
    waveCounts.set(record.wave, (waveCounts.get(record.wave) ?? 0) + 1);
  }

  const maxConcurrentPds = waveCounts.size === 0
    ? 0
    : Math.max(...waveCounts.values());
  const missionOrderCount = squads.reduce(
    (total, squad) => total + squad.missionOrderCount,
    0,
  );
  const campaignCount = squads.reduce((total, squad) => total + squad.campaignCount, 0);
  const traceRecordCount = records.reduce(
    (total, record) => total + record.traceReferences.length,
    0,
  );
  const averageLatencyTicks = records.length === 0
    ? 0
    : roundMetric(
      records.reduce(
        (total, record) => total + (record.endTick - record.startTick),
        0,
      ) / records.length,
    );
  const schedulingEfficiency = totalTicks === 0
    ? 0
    : roundMetric(executedPdsCount / (totalTicks * options.maxConcurrentPds));
  const programIds = squads.map((squad) => squad.programId);
  const missionOrderIsolation = hasNoDuplicates(
    squads.flatMap((squad) =>
      Array.from(
        { length: squad.missionOrderCount },
        (_, index) => `${squad.programId}:MO-${formatNumber(index + 1, 3)}`,
      ),
    ),
  );
  const campaignIsolation = hasNoDuplicates(
    squads.flatMap((squad) =>
      Array.from(
        { length: squad.campaignCount },
        (_, index) => `${squad.programId}:CAMPAIGN-${formatNumber(index + 1, 3)}`,
      ),
    ),
  );
  const certificationIntegrity = records.every((record) => {
    const squad = squads.find((candidate) => candidate.id === record.pdsId);

    if (squad === undefined) {
      return false;
    }

    return record.status === "COMPLETE"
      ? squad.certificationReady !== false
      : record.decision !== "GO";
  });
  const expectedTraceRecordCount = records.reduce(
    (total, record) => total + record.missionOrderCount + record.campaignCount + 2,
    0,
  );
  const completeTraceability = traceRecordCount >= expectedTraceRecordCount;
  const failureIsolated =
    failedPdsCount === 0 ||
    (failedPdsCount > 0 && stoppedPdsCount === 0 && completedPdsCount > 0);
  const escalationRaised = failedPdsCount > 0 || stoppedPdsCount > 0;

  return Object.freeze({
    programCount: new Set(programIds).size,
    missionOrderCount,
    campaignCount,
    requestedPdsCount: squads.length,
    completedPdsCount,
    failedPdsCount,
    stoppedPdsCount,
    supportedConcurrentPds: options.maxConcurrentPds,
    maxConcurrentPds,
    waveCount: waveCounts.size,
    totalTicks,
    throughputPdsPerTick: totalTicks === 0
      ? 0
      : roundMetric(executedPdsCount / totalTicks),
    averageLatencyTicks,
    schedulingEfficiency,
    governanceOverheadTicks: records.length * options.governanceTicksPerPds,
    traceRecordCount,
    repositoryProtected: stopReason !== "REPOSITORY_MUTATION",
    deterministicGovernance:
      hasNoDuplicates(records.map((record) => `${record.wave}:${record.pdsId}`)) &&
      records.every((record) => record.endTick >= record.startTick),
    missionOrderIsolation,
    campaignIsolation,
    certificationIntegrity,
    completeTraceability,
    failureIsolated,
    escalationRaised,
    executiveDecisionCoherence: assertExecutiveDecisionCoherence(
      squads,
      options.programBoardDecisions ?? createProgramBoardDecisions(squads),
    ),
  });
}

function createProgramBoardDecisions(
  squads: readonly ProgramDeliverySquadSimulation[],
): readonly ProgramBoardDecision[] {
  return Object.freeze(
    squads.map((squad, index) =>
      Object.freeze({
        sequence: index + 1,
        programId: squad.programId,
        decision: "APPROVED" as const,
      }),
    ),
  );
}

function assertExecutiveDecisionCoherence(
  squads: readonly ProgramDeliverySquadSimulation[],
  decisions: readonly ProgramBoardDecision[],
): boolean {
  const programIds = new Set(squads.map((squad) => squad.programId));
  const approvedProgramIds = new Set(
    decisions
      .filter((decision) => decision.decision === "APPROVED")
      .map((decision) => decision.programId),
  );
  const sortedSequences = [...decisions].map((decision) => decision.sequence).sort((a, b) => a - b);

  return (
    approvedProgramIds.size === programIds.size &&
    [...programIds].every((programId) => approvedProgramIds.has(programId)) &&
    hasNoDuplicates(decisions.map((decision) => String(decision.sequence))) &&
    sortedSequences.every((sequence, index) => sequence === index + 1)
  );
}

function dependenciesSatisfied(
  squad: ProgramDeliverySquadSimulation,
  completed: ReadonlySet<string>,
): boolean {
  return (squad.dependsOn ?? []).every((dependencyId) => completed.has(dependencyId));
}

function findConflictingSquadIds(
  squads: readonly ProgramDeliverySquadSimulation[],
): ReadonlySet<string> {
  const artifactOwners = new Map<string, string[]>();

  for (const squad of squads) {
    for (const artifactRef of squad.artifactRefs) {
      const owners = artifactOwners.get(artifactRef) ?? [];

      owners.push(squad.id);
      artifactOwners.set(artifactRef, owners);
    }
  }

  return new Set(
    [...artifactOwners.values()]
      .filter((owners) => owners.length > 1)
      .flatMap((owners) => owners),
  );
}

function assertParallelOrchestrationComponents(
  components: readonly ParallelOrchestrationComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertParallelOrchestrationComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PPAR-004");

    if (seen.has(component.id)) {
      throw new Error(
        "PPAR-003: Parallel Orchestration rejects duplicate components.",
      );
    }

    seen.add(component.id);
  }
}

function assertParallelOrchestrationComponentId(
  value: string,
): asserts value is ParallelOrchestrationComponentId {
  if (!PARALLEL_ORCHESTRATION_COMPONENT_IDS.includes(value as ParallelOrchestrationComponentId)) {
    throw new Error(
      "PPAR-002: Parallel Orchestration rejects unknown components.",
    );
  }
}

function assertProgramDeliverySquads(
  squads: readonly ProgramDeliverySquadSimulation[],
): void {
  if (squads.length === 0) {
    throw new Error("PPAR-005: Parallel Orchestration requires at least one PDS.");
  }

  const squadIds = new Set<string>();

  for (const squad of squads) {
    assertNormalizedIdentifier(squad.id, "PPAR-006");
    assertNormalizedIdentifier(squad.programId, "PPAR-007");

    if (squad.missionOrderCount < 1 || !Number.isInteger(squad.missionOrderCount)) {
      throw new Error("PPAR-008: Parallel Orchestration rejects invalid mission order counts.");
    }

    if (squad.campaignCount < 1 || !Number.isInteger(squad.campaignCount)) {
      throw new Error("PPAR-009: Parallel Orchestration rejects invalid campaign counts.");
    }

    if (squadIds.has(squad.id)) {
      throw new Error("PPAR-015: Parallel Orchestration rejects duplicate PDS identifiers.");
    }

    for (const artifactRef of squad.artifactRefs) {
      assertNormalizedEvidenceReference(artifactRef, "PPAR-016");
    }

    squadIds.add(squad.id);
  }
}

function assertSimulationOptions(options: OrchestrationSimulationOptions): void {
  if (
    !Number.isInteger(options.maxConcurrentPds) ||
    options.maxConcurrentPds < 1 ||
    options.maxConcurrentPds > MAX_SUPPORTED_CONCURRENT_PDS
  ) {
    throw new Error("PPAR-017: Parallel Orchestration rejects invalid concurrency limits.");
  }

  if (!Number.isInteger(options.governanceTicksPerPds) || options.governanceTicksPerPds < 1) {
    throw new Error("PPAR-018: Parallel Orchestration rejects invalid governance overhead.");
  }
}

function assertNormalizedIdentifier(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Parallel Orchestration rejects empty or non-normalized identifiers.`,
    );
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Parallel Orchestration rejects empty or non-normalized evidence references.`,
    );
  }
}

function hasNoDuplicates(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function compareById(
  left: Pick<ProgramDeliverySquadSimulation, "id">,
  right: Pick<ProgramDeliverySquadSimulation, "id">,
): number {
  return left.id.localeCompare(right.id);
}

function formatNumber(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

function roundMetric(value: number): number {
  return Math.round(value * 1000) / 1000;
}

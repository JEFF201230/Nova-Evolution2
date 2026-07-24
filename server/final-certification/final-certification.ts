import {
  verifyDashboard,
} from "../dashboard/dashboard.js";
import type {
  DashboardResult,
} from "../dashboard/dashboard.js";
import {
  verifyGovernanceCore,
} from "../governance/governance-core.js";
import type {
  GovernanceCoreResult,
} from "../governance/governance-core.js";
import {
  verifyKpiEngine,
} from "../kpi-engine/kpi-engine.js";
import type {
  KpiEngineResult,
} from "../kpi-engine/kpi-engine.js";
import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";
import type {
  PortfolioManagementResult,
} from "../portfolio/portfolio-management.js";
import {
  verifyResourceManager,
} from "../resource-manager/resource-manager.js";
import type {
  ResourceManagerResult,
} from "../resource-manager/resource-manager.js";
import {
  verifyRiskEngine,
} from "../risk-engine/risk-engine.js";
import type {
  RiskEngineResult,
} from "../risk-engine/risk-engine.js";
import {
  verifyScheduler,
} from "../scheduler/scheduler.js";
import type {
  SchedulerResult,
} from "../scheduler/scheduler.js";

export type FinalCertificationComponentId =
  | "master-plan-completion"
  | "portfolio-completion"
  | "governance-gate-closure"
  | "service-certification-chain"
  | "regression-test-evidence"
  | "final-risk-acceptance"
  | "release-readiness";

export interface FinalCertificationComponent {
  readonly id: FinalCertificationComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface FinalCertificationEvidence {
  readonly components: readonly FinalCertificationComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly governanceCorePassed: boolean;
  readonly portfolioManagementPassed: boolean;
  readonly schedulerPassed: boolean;
  readonly resourceManagerPassed: boolean;
  readonly riskEnginePassed: boolean;
  readonly kpiEnginePassed: boolean;
  readonly dashboardPassed: boolean;
  readonly ready: boolean;
}

export interface FinalCertificationResult {
  readonly passed: boolean;
  readonly evidence: FinalCertificationEvidence;
}

const FINAL_CERTIFICATION_COMPONENT_IDS: readonly FinalCertificationComponentId[] =
  Object.freeze([
    "master-plan-completion",
    "portfolio-completion",
    "governance-gate-closure",
    "service-certification-chain",
    "regression-test-evidence",
    "final-risk-acceptance",
    "release-readiness",
  ]);

const DEFAULT_FINAL_CERTIFICATION_COMPONENTS: readonly FinalCertificationComponent[] =
  Object.freeze([
    Object.freeze({
      id: "master-plan-completion",
      ready: true,
      evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
    }),
    Object.freeze({
      id: "portfolio-completion",
      ready: true,
      evidenceReference: "Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md",
    }),
    Object.freeze({
      id: "governance-gate-closure",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_GOVERNANCE.md",
    }),
    Object.freeze({
      id: "service-certification-chain",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_CERTIFICATION_REPORT.md",
    }),
    Object.freeze({
      id: "regression-test-evidence",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/CAMPAIGN_001_TEST_REPORT.md",
    }),
    Object.freeze({
      id: "final-risk-acceptance",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_VERIFICATION_REPORT.md",
    }),
    Object.freeze({
      id: "release-readiness",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_CLOSURE_REPORT.md",
    }),
  ]);

export function verifyFinalCertification(
  governanceCore: GovernanceCoreResult = verifyGovernanceCore(),
  portfolioManagement: PortfolioManagementResult = verifyPortfolioManagement(),
  scheduler: SchedulerResult = verifyScheduler(),
  resourceManager: ResourceManagerResult = verifyResourceManager(),
  riskEngine: RiskEngineResult = verifyRiskEngine(),
  kpiEngine: KpiEngineResult = verifyKpiEngine(),
  dashboard: DashboardResult = verifyDashboard(),
): FinalCertificationResult {
  const evidence = createFinalCertificationEvidence(
    governanceCore,
    portfolioManagement,
    scheduler,
    resourceManager,
    riskEngine,
    kpiEngine,
    dashboard,
    DEFAULT_FINAL_CERTIFICATION_COMPONENTS,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createFinalCertificationComponents(
  components: readonly FinalCertificationComponent[],
): readonly FinalCertificationComponent[] {
  assertFinalCertificationComponents(components);

  return Object.freeze(
    FINAL_CERTIFICATION_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PFINAL-001: Final Certification could not preserve deterministic component ordering.",
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

export function createFinalCertificationEvidence(
  governanceCore: GovernanceCoreResult,
  portfolioManagement: PortfolioManagementResult,
  scheduler: SchedulerResult,
  resourceManager: ResourceManagerResult,
  riskEngine: RiskEngineResult,
  kpiEngine: KpiEngineResult,
  dashboard: DashboardResult,
  components: readonly FinalCertificationComponent[],
): FinalCertificationEvidence {
  const orderedComponents = createFinalCertificationComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = FINAL_CERTIFICATION_COMPONENT_IDS.length;
  const ready =
    governanceCore.passed &&
    portfolioManagement.passed &&
    scheduler.passed &&
    resourceManager.passed &&
    riskEngine.passed &&
    kpiEngine.passed &&
    dashboard.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    governanceCorePassed: governanceCore.passed,
    portfolioManagementPassed: portfolioManagement.passed,
    schedulerPassed: scheduler.passed,
    resourceManagerPassed: resourceManager.passed,
    riskEnginePassed: riskEngine.passed,
    kpiEnginePassed: kpiEngine.passed,
    dashboardPassed: dashboard.passed,
    ready,
  });
}

function assertFinalCertificationComponents(
  components: readonly FinalCertificationComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertFinalCertificationComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PFINAL-004");

    if (seen.has(component.id)) {
      throw new Error("PFINAL-003: Final Certification rejects duplicate components.");
    }

    seen.add(component.id);
  }
}

function assertFinalCertificationComponentId(
  value: string,
): asserts value is FinalCertificationComponentId {
  if (!FINAL_CERTIFICATION_COMPONENT_IDS.includes(value as FinalCertificationComponentId)) {
    throw new Error("PFINAL-002: Final Certification rejects unknown components.");
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Final Certification rejects empty or non-normalized evidence references.`,
    );
  }
}

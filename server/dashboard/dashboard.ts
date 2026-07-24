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

export type DashboardComponentId =
  | "portfolio-status-panel"
  | "roadmap-sequence-panel"
  | "program-health-panel"
  | "risk-status-panel"
  | "kpi-status-panel"
  | "certification-status-panel";

export interface DashboardComponent {
  readonly id: DashboardComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface DashboardEvidence {
  readonly components: readonly DashboardComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly portfolioManagementPassed: boolean;
  readonly schedulerPassed: boolean;
  readonly resourceManagerPassed: boolean;
  readonly riskEnginePassed: boolean;
  readonly kpiEnginePassed: boolean;
  readonly ready: boolean;
}

export interface DashboardResult {
  readonly passed: boolean;
  readonly evidence: DashboardEvidence;
}

const DASHBOARD_COMPONENT_IDS: readonly DashboardComponentId[] = Object.freeze([
  "portfolio-status-panel",
  "roadmap-sequence-panel",
  "program-health-panel",
  "risk-status-panel",
  "kpi-status-panel",
  "certification-status-panel",
]);

const DEFAULT_DASHBOARD_COMPONENTS: readonly DashboardComponent[] = Object.freeze([
  Object.freeze({
    id: "portfolio-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_EVIDENCE_REPORT.md",
  }),
  Object.freeze({
    id: "roadmap-sequence-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_ROADMAP.md",
  }),
  Object.freeze({
    id: "program-health-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/P12-MO-001_RESULT.md",
  }),
  Object.freeze({
    id: "risk-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/CAMPAIGN_001_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "kpi-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/CAMPAIGN_001_TEST_REPORT.md",
  }),
  Object.freeze({
    id: "certification-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_CERTIFICATION_REPORT.md",
  }),
]);

export function verifyDashboard(
  portfolioManagement: PortfolioManagementResult = verifyPortfolioManagement(),
  scheduler: SchedulerResult = verifyScheduler(),
  resourceManager: ResourceManagerResult = verifyResourceManager(),
  riskEngine: RiskEngineResult = verifyRiskEngine(),
  kpiEngine: KpiEngineResult = verifyKpiEngine(),
): DashboardResult {
  const evidence = createDashboardEvidence(
    portfolioManagement,
    scheduler,
    resourceManager,
    riskEngine,
    kpiEngine,
    DEFAULT_DASHBOARD_COMPONENTS,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createDashboardComponents(
  components: readonly DashboardComponent[],
): readonly DashboardComponent[] {
  assertDashboardComponents(components);

  return Object.freeze(
    DASHBOARD_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PDASH-001: Dashboard could not preserve deterministic component ordering.",
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

export function createDashboardEvidence(
  portfolioManagement: PortfolioManagementResult,
  scheduler: SchedulerResult,
  resourceManager: ResourceManagerResult,
  riskEngine: RiskEngineResult,
  kpiEngine: KpiEngineResult,
  components: readonly DashboardComponent[],
): DashboardEvidence {
  const orderedComponents = createDashboardComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = DASHBOARD_COMPONENT_IDS.length;
  const ready =
    portfolioManagement.passed &&
    scheduler.passed &&
    resourceManager.passed &&
    riskEngine.passed &&
    kpiEngine.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    portfolioManagementPassed: portfolioManagement.passed,
    schedulerPassed: scheduler.passed,
    resourceManagerPassed: resourceManager.passed,
    riskEnginePassed: riskEngine.passed,
    kpiEnginePassed: kpiEngine.passed,
    ready,
  });
}

function assertDashboardComponents(components: readonly DashboardComponent[]): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertDashboardComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PDASH-004");

    if (seen.has(component.id)) {
      throw new Error("PDASH-003: Dashboard rejects duplicate components.");
    }

    seen.add(component.id);
  }
}

function assertDashboardComponentId(value: string): asserts value is DashboardComponentId {
  if (!DASHBOARD_COMPONENT_IDS.includes(value as DashboardComponentId)) {
    throw new Error("PDASH-002: Dashboard rejects unknown components.");
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Dashboard rejects empty or non-normalized evidence references.`,
    );
  }
}

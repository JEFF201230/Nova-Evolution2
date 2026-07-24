import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";
import type {
  PortfolioManagementResult,
} from "../portfolio/portfolio-management.js";
import {
  verifyRiskEngine,
} from "../risk-engine/risk-engine.js";
import type {
  RiskEngineResult,
} from "../risk-engine/risk-engine.js";

export type KpiEngineComponentId =
  | "program-completion-kpi"
  | "mission-closure-kpi"
  | "campaign-closure-kpi"
  | "test-stability-kpi"
  | "certification-kpi"
  | "residual-risk-kpi";

export interface KpiEngineComponent {
  readonly id: KpiEngineComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface KpiEngineEvidence {
  readonly components: readonly KpiEngineComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly portfolioManagementPassed: boolean;
  readonly riskEnginePassed: boolean;
  readonly ready: boolean;
}

export interface KpiEngineResult {
  readonly passed: boolean;
  readonly evidence: KpiEngineEvidence;
}

const KPI_ENGINE_COMPONENT_IDS: readonly KpiEngineComponentId[] = Object.freeze([
  "program-completion-kpi",
  "mission-closure-kpi",
  "campaign-closure-kpi",
  "test-stability-kpi",
  "certification-kpi",
  "residual-risk-kpi",
]);

const DEFAULT_KPI_ENGINE_COMPONENTS: readonly KpiEngineComponent[] = Object.freeze([
  Object.freeze({
    id: "program-completion-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_EVIDENCE_REPORT.md",
  }),
  Object.freeze({
    id: "mission-closure-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/P11-MO-001_RESULT.md",
  }),
  Object.freeze({
    id: "campaign-closure-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/CAMPAIGN_001_RESULT.md",
  }),
  Object.freeze({
    id: "test-stability-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/CAMPAIGN_001_TEST_REPORT.md",
  }),
  Object.freeze({
    id: "certification-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_CERTIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "residual-risk-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_CLOSURE_REPORT.md",
  }),
]);

export function verifyKpiEngine(
  portfolioManagement: PortfolioManagementResult = verifyPortfolioManagement(),
  riskEngine: RiskEngineResult = verifyRiskEngine(),
): KpiEngineResult {
  const evidence = createKpiEngineEvidence(
    portfolioManagement,
    riskEngine,
    DEFAULT_KPI_ENGINE_COMPONENTS,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createKpiEngineComponents(
  components: readonly KpiEngineComponent[],
): readonly KpiEngineComponent[] {
  assertKpiEngineComponents(components);

  return Object.freeze(
    KPI_ENGINE_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PKPI-001: KPI Engine could not preserve deterministic component ordering.",
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

export function createKpiEngineEvidence(
  portfolioManagement: PortfolioManagementResult,
  riskEngine: RiskEngineResult,
  components: readonly KpiEngineComponent[],
): KpiEngineEvidence {
  const orderedComponents = createKpiEngineComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = KPI_ENGINE_COMPONENT_IDS.length;
  const ready =
    portfolioManagement.passed &&
    riskEngine.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    portfolioManagementPassed: portfolioManagement.passed,
    riskEnginePassed: riskEngine.passed,
    ready,
  });
}

function assertKpiEngineComponents(components: readonly KpiEngineComponent[]): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertKpiEngineComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PKPI-004");

    if (seen.has(component.id)) {
      throw new Error("PKPI-003: KPI Engine rejects duplicate components.");
    }

    seen.add(component.id);
  }
}

function assertKpiEngineComponentId(value: string): asserts value is KpiEngineComponentId {
  if (!KPI_ENGINE_COMPONENT_IDS.includes(value as KpiEngineComponentId)) {
    throw new Error("PKPI-002: KPI Engine rejects unknown components.");
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: KPI Engine rejects empty or non-normalized evidence references.`,
    );
  }
}

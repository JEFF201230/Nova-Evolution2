import {
  verifyGovernanceCore,
} from "../governance/governance-core.js";
import type {
  GovernanceCoreResult,
} from "../governance/governance-core.js";
import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";
import type {
  PortfolioManagementResult,
} from "../portfolio/portfolio-management.js";

export type RiskEngineComponentId =
  | "risk-register"
  | "stop-condition-evaluation"
  | "architecture-conflict-control"
  | "scope-extension-control"
  | "dependency-impossibility-control";

export interface RiskEngineComponent {
  readonly id: RiskEngineComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface RiskEngineEvidence {
  readonly components: readonly RiskEngineComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly governanceCorePassed: boolean;
  readonly portfolioManagementPassed: boolean;
  readonly ready: boolean;
}

export interface RiskEngineResult {
  readonly passed: boolean;
  readonly evidence: RiskEngineEvidence;
}

const RISK_ENGINE_COMPONENT_IDS: readonly RiskEngineComponentId[] = Object.freeze([
  "risk-register",
  "stop-condition-evaluation",
  "architecture-conflict-control",
  "scope-extension-control",
  "dependency-impossibility-control",
]);

const DEFAULT_RISK_ENGINE_COMPONENTS: readonly RiskEngineComponent[] = Object.freeze([
  Object.freeze({
    id: "risk-register",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_EVIDENCE_REPORT.md",
  }),
  Object.freeze({
    id: "stop-condition-evaluation",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_GOVERNANCE.md",
  }),
  Object.freeze({
    id: "architecture-conflict-control",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "scope-extension-control",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/CAMPAIGN_001_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "dependency-impossibility-control",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_CLOSURE_REPORT.md",
  }),
]);

export function verifyRiskEngine(
  governanceCore: GovernanceCoreResult = verifyGovernanceCore(),
  portfolioManagement: PortfolioManagementResult = verifyPortfolioManagement(),
): RiskEngineResult {
  const evidence = createRiskEngineEvidence(
    governanceCore,
    portfolioManagement,
    DEFAULT_RISK_ENGINE_COMPONENTS,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createRiskEngineComponents(
  components: readonly RiskEngineComponent[],
): readonly RiskEngineComponent[] {
  assertRiskEngineComponents(components);

  return Object.freeze(
    RISK_ENGINE_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PRISK-001: Risk Engine could not preserve deterministic component ordering.",
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

export function createRiskEngineEvidence(
  governanceCore: GovernanceCoreResult,
  portfolioManagement: PortfolioManagementResult,
  components: readonly RiskEngineComponent[],
): RiskEngineEvidence {
  const orderedComponents = createRiskEngineComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = RISK_ENGINE_COMPONENT_IDS.length;
  const ready =
    governanceCore.passed &&
    portfolioManagement.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    governanceCorePassed: governanceCore.passed,
    portfolioManagementPassed: portfolioManagement.passed,
    ready,
  });
}

function assertRiskEngineComponents(components: readonly RiskEngineComponent[]): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertRiskEngineComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PRISK-004");

    if (seen.has(component.id)) {
      throw new Error("PRISK-003: Risk Engine rejects duplicate components.");
    }

    seen.add(component.id);
  }
}

function assertRiskEngineComponentId(value: string): asserts value is RiskEngineComponentId {
  if (!RISK_ENGINE_COMPONENT_IDS.includes(value as RiskEngineComponentId)) {
    throw new Error("PRISK-002: Risk Engine rejects unknown components.");
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Risk Engine rejects empty or non-normalized evidence references.`,
    );
  }
}

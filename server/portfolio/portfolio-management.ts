import {
  verifyGovernanceCore,
} from "../governance/governance-core.js";
import type {
  GovernanceCoreResult,
} from "../governance/governance-core.js";

export type PortfolioManagementComponentId =
  | "program-state-ledger"
  | "portfolio-roadmap"
  | "dependency-sequencing"
  | "board-decision-record"
  | "program-index-synchronization"
  | "governance-evidence-consumption";

export interface PortfolioManagementComponent {
  readonly id: PortfolioManagementComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface PortfolioManagementEvidence {
  readonly components: readonly PortfolioManagementComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly governanceCorePassed: boolean;
  readonly ready: boolean;
}

export interface PortfolioManagementResult {
  readonly passed: boolean;
  readonly evidence: PortfolioManagementEvidence;
}

const PORTFOLIO_MANAGEMENT_COMPONENT_IDS: readonly PortfolioManagementComponentId[] =
  Object.freeze([
    "program-state-ledger",
    "portfolio-roadmap",
    "dependency-sequencing",
    "board-decision-record",
    "program-index-synchronization",
    "governance-evidence-consumption",
  ]);

const DEFAULT_PORTFOLIO_MANAGEMENT_COMPONENTS: readonly PortfolioManagementComponent[] =
  Object.freeze([
    Object.freeze({
      id: "program-state-ledger",
      ready: true,
      evidenceReference: "Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md",
    }),
    Object.freeze({
      id: "portfolio-roadmap",
      ready: true,
      evidenceReference: "Docs/20_NOVA_PORTFOLIO/PORTFOLIO_ROADMAP.md",
    }),
    Object.freeze({
      id: "dependency-sequencing",
      ready: true,
      evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
    }),
    Object.freeze({
      id: "board-decision-record",
      ready: true,
      evidenceReference: "Docs/20_NOVA_PORTFOLIO/PROGRAM_BOARD.md",
    }),
    Object.freeze({
      id: "program-index-synchronization",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-007_PORTFOLIO/PROGRAM_007_PROGRAM_INDEX.md",
    }),
    Object.freeze({
      id: "governance-evidence-consumption",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-006_GOVERNANCE/PROGRAM_006_CERTIFICATION_REPORT.md",
    }),
  ]);

export function verifyPortfolioManagement(
  governanceCore: GovernanceCoreResult = verifyGovernanceCore(),
): PortfolioManagementResult {
  const evidence = createPortfolioManagementEvidence(
    governanceCore,
    DEFAULT_PORTFOLIO_MANAGEMENT_COMPONENTS,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createPortfolioManagementComponents(
  components: readonly PortfolioManagementComponent[],
): readonly PortfolioManagementComponent[] {
  assertPortfolioManagementComponents(components);

  return Object.freeze(
    PORTFOLIO_MANAGEMENT_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PPORT-001: Portfolio Management could not preserve deterministic component ordering.",
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

export function createPortfolioManagementEvidence(
  governanceCore: GovernanceCoreResult,
  components: readonly PortfolioManagementComponent[],
): PortfolioManagementEvidence {
  const orderedComponents = createPortfolioManagementComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = PORTFOLIO_MANAGEMENT_COMPONENT_IDS.length;
  const ready =
    governanceCore.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    governanceCorePassed: governanceCore.passed,
    ready,
  });
}

function assertPortfolioManagementComponents(
  components: readonly PortfolioManagementComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertPortfolioManagementComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PPORT-004");

    if (seen.has(component.id)) {
      throw new Error(
        "PPORT-003: Portfolio Management rejects duplicate components.",
      );
    }

    seen.add(component.id);
  }
}

function assertPortfolioManagementComponentId(
  value: string,
): asserts value is PortfolioManagementComponentId {
  if (!PORTFOLIO_MANAGEMENT_COMPONENT_IDS.includes(value as PortfolioManagementComponentId)) {
    throw new Error(
      "PPORT-002: Portfolio Management rejects unknown components.",
    );
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Portfolio Management rejects empty or non-normalized evidence references.`,
    );
  }
}

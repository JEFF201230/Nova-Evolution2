import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";
import type {
  PortfolioManagementResult,
} from "../portfolio/portfolio-management.js";

export type SchedulerComponentId =
  | "program-sequence-queue"
  | "dependency-ready-selector"
  | "next-program-dispatch"
  | "scheduler-stop-condition"
  | "master-plan-synchronization";

export interface SchedulerComponent {
  readonly id: SchedulerComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface SchedulerEvidence {
  readonly components: readonly SchedulerComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly portfolioManagementPassed: boolean;
  readonly ready: boolean;
}

export interface SchedulerResult {
  readonly passed: boolean;
  readonly evidence: SchedulerEvidence;
}

const SCHEDULER_COMPONENT_IDS: readonly SchedulerComponentId[] = Object.freeze([
  "program-sequence-queue",
  "dependency-ready-selector",
  "next-program-dispatch",
  "scheduler-stop-condition",
  "master-plan-synchronization",
]);

const DEFAULT_SCHEDULER_COMPONENTS: readonly SchedulerComponent[] = Object.freeze([
  Object.freeze({
    id: "program-sequence-queue",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_ROADMAP.md",
  }),
  Object.freeze({
    id: "dependency-ready-selector",
    ready: true,
    evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
  }),
  Object.freeze({
    id: "next-program-dispatch",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/P8-MO-001-SCHEDULER.md",
  }),
  Object.freeze({
    id: "scheduler-stop-condition",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_GOVERNANCE.md",
  }),
  Object.freeze({
    id: "master-plan-synchronization",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-008_SCHEDULER/PROGRAM_008_CLOSURE_REPORT.md",
  }),
]);

export function verifyScheduler(
  portfolioManagement: PortfolioManagementResult = verifyPortfolioManagement(),
): SchedulerResult {
  const evidence = createSchedulerEvidence(
    portfolioManagement,
    DEFAULT_SCHEDULER_COMPONENTS,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createSchedulerComponents(
  components: readonly SchedulerComponent[],
): readonly SchedulerComponent[] {
  assertSchedulerComponents(components);

  return Object.freeze(
    SCHEDULER_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PSCH-001: Scheduler could not preserve deterministic component ordering.",
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

export function createSchedulerEvidence(
  portfolioManagement: PortfolioManagementResult,
  components: readonly SchedulerComponent[],
): SchedulerEvidence {
  const orderedComponents = createSchedulerComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = SCHEDULER_COMPONENT_IDS.length;
  const ready =
    portfolioManagement.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    portfolioManagementPassed: portfolioManagement.passed,
    ready,
  });
}

function assertSchedulerComponents(components: readonly SchedulerComponent[]): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertSchedulerComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PSCH-004");

    if (seen.has(component.id)) {
      throw new Error("PSCH-003: Scheduler rejects duplicate components.");
    }

    seen.add(component.id);
  }
}

function assertSchedulerComponentId(value: string): asserts value is SchedulerComponentId {
  if (!SCHEDULER_COMPONENT_IDS.includes(value as SchedulerComponentId)) {
    throw new Error("PSCH-002: Scheduler rejects unknown components.");
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Scheduler rejects empty or non-normalized evidence references.`,
    );
  }
}

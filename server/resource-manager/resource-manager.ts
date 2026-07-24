import {
  verifyScheduler,
} from "../scheduler/scheduler.js";
import type {
  SchedulerResult,
} from "../scheduler/scheduler.js";

export type ResourceManagerComponentId =
  | "program-capacity-ledger"
  | "mission-squad-assignment"
  | "certified-component-reuse"
  | "scope-boundary-reservation"
  | "allocation-closure-ledger";

export interface ResourceManagerComponent {
  readonly id: ResourceManagerComponentId;
  readonly ready: boolean;
  readonly evidenceReference: string;
}

export interface ResourceManagerEvidence {
  readonly components: readonly ResourceManagerComponent[];
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly schedulerPassed: boolean;
  readonly ready: boolean;
}

export interface ResourceManagerResult {
  readonly passed: boolean;
  readonly evidence: ResourceManagerEvidence;
}

const RESOURCE_MANAGER_COMPONENT_IDS: readonly ResourceManagerComponentId[] =
  Object.freeze([
    "program-capacity-ledger",
    "mission-squad-assignment",
    "certified-component-reuse",
    "scope-boundary-reservation",
    "allocation-closure-ledger",
  ]);

const DEFAULT_RESOURCE_MANAGER_COMPONENTS: readonly ResourceManagerComponent[] =
  Object.freeze([
    Object.freeze({
      id: "program-capacity-ledger",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_ROADMAP.md",
    }),
    Object.freeze({
      id: "mission-squad-assignment",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/P9-MO-001-RESOURCE-MANAGER.md",
    }),
    Object.freeze({
      id: "certified-component-reuse",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_GOVERNANCE.md",
    }),
    Object.freeze({
      id: "scope-boundary-reservation",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_VERIFICATION_REPORT.md",
    }),
    Object.freeze({
      id: "allocation-closure-ledger",
      ready: true,
      evidenceReference: "Docs/19_PROGRAMS/PROGRAM-009_RESOURCE_MANAGER/PROGRAM_009_CLOSURE_REPORT.md",
    }),
  ]);

export function verifyResourceManager(
  scheduler: SchedulerResult = verifyScheduler(),
): ResourceManagerResult {
  const evidence = createResourceManagerEvidence(
    scheduler,
    DEFAULT_RESOURCE_MANAGER_COMPONENTS,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createResourceManagerComponents(
  components: readonly ResourceManagerComponent[],
): readonly ResourceManagerComponent[] {
  assertResourceManagerComponents(components);

  return Object.freeze(
    RESOURCE_MANAGER_COMPONENT_IDS
      .filter((componentId) => components.some((component) => component.id === componentId))
      .map((componentId) => {
        const component = components.find((candidate) => candidate.id === componentId);

        if (component === undefined) {
          throw new Error(
            "PRES-001: Resource Manager could not preserve deterministic component ordering.",
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

export function createResourceManagerEvidence(
  scheduler: SchedulerResult,
  components: readonly ResourceManagerComponent[],
): ResourceManagerEvidence {
  const orderedComponents = createResourceManagerComponents(components);
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = RESOURCE_MANAGER_COMPONENT_IDS.length;
  const ready =
    scheduler.passed &&
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    components: orderedComponents,
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    schedulerPassed: scheduler.passed,
    ready,
  });
}

function assertResourceManagerComponents(
  components: readonly ResourceManagerComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertResourceManagerComponentId(component.id);
    assertNormalizedEvidenceReference(component.evidenceReference, "PRES-004");

    if (seen.has(component.id)) {
      throw new Error("PRES-003: Resource Manager rejects duplicate components.");
    }

    seen.add(component.id);
  }
}

function assertResourceManagerComponentId(
  value: string,
): asserts value is ResourceManagerComponentId {
  if (!RESOURCE_MANAGER_COMPONENT_IDS.includes(value as ResourceManagerComponentId)) {
    throw new Error("PRES-002: Resource Manager rejects unknown components.");
  }
}

function assertNormalizedEvidenceReference(value: string, errorCode: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      `${errorCode}: Resource Manager rejects empty or non-normalized evidence references.`,
    );
  }
}

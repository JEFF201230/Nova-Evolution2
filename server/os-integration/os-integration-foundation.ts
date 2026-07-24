import {
  verifyExecutionEngineFoundation,
} from "../runtime/execution-engine/execution-engine.js";
import type {
  ExecutionEngineEvidence,
  ExecutionEngineResult,
} from "../runtime/execution-engine/execution-engine.js";
import {
  verifyRuntimeTraceabilityFoundation,
} from "../runtime/runtime-traceability/runtime-traceability.js";
import type {
  RuntimeTraceabilityEvidence,
  RuntimeTraceabilityResult,
} from "../runtime/runtime-traceability/runtime-traceability.js";

export type OsIntegrationSourceReferenceId =
  | "p5-mo-001-authority"
  | "program-003-kernel-boundary"
  | "program-004-runtime-foundation"
  | "program-005-architecture"
  | "program-005-roadmap";

export type OsIntegrationFoundationComponentId =
  | "program-authority"
  | "kernel-boundary"
  | "runtime-foundation"
  | "execution-engine-dependency"
  | "internal-integration-composition";

export interface OsIntegrationSourceReference {
  readonly id: OsIntegrationSourceReferenceId;
  readonly value: string;
}

export interface OsIntegrationFoundationComponent {
  readonly id: OsIntegrationFoundationComponentId;
  readonly ready: boolean;
}

export interface OsIntegrationCompositionEvidence {
  readonly componentCount: number;
  readonly requiredComponentCount: number;
  readonly readyComponentCount: number;
  readonly componentIds: readonly OsIntegrationFoundationComponentId[];
  readonly ready: boolean;
}

export interface OsIntegrationFoundationEvidence {
  readonly sourceReferences: readonly OsIntegrationSourceReference[];
  readonly runtimeTraceability: RuntimeTraceabilityEvidence;
  readonly executionEngine: ExecutionEngineEvidence;
  readonly composition: OsIntegrationCompositionEvidence;
  readonly dependencyCount: number;
  readonly readyDependencyCount: number;
  readonly ready: boolean;
}

export interface OsIntegrationFoundationResult {
  readonly passed: boolean;
  readonly evidence: OsIntegrationFoundationEvidence;
}

const OS_INTEGRATION_SOURCE_REFERENCE_IDS: readonly OsIntegrationSourceReferenceId[] =
  Object.freeze([
    "p5-mo-001-authority",
    "program-003-kernel-boundary",
    "program-004-runtime-foundation",
    "program-005-architecture",
    "program-005-roadmap",
  ]);

const OS_INTEGRATION_COMPONENT_IDS: readonly OsIntegrationFoundationComponentId[] =
  Object.freeze([
    "program-authority",
    "kernel-boundary",
    "runtime-foundation",
    "execution-engine-dependency",
    "internal-integration-composition",
  ]);

const OS_INTEGRATION_SOURCE_REFERENCES: readonly OsIntegrationSourceReference[] =
  Object.freeze([
    Object.freeze({
      id: "p5-mo-001-authority",
      value: "P5-MO-001-OS-INTEGRATION-FOUNDATION",
    }),
    Object.freeze({
      id: "program-003-kernel-boundary",
      value: "PROGRAM-003-COMPLETE-KERNEL-FOUNDATION",
    }),
    Object.freeze({
      id: "program-004-runtime-foundation",
      value: "PROGRAM-004-COMPLETE-RUNTIME-FOUNDATION",
    }),
    Object.freeze({
      id: "program-005-architecture",
      value: "PROGRAM_005_ARCHITECTURE.md",
    }),
    Object.freeze({
      id: "program-005-roadmap",
      value: "PROGRAM_005_ROADMAP.md",
    }),
  ]);

export function verifyOsIntegrationFoundation(): OsIntegrationFoundationResult {
  const runtimeTraceability = verifyRuntimeTraceabilityFoundation();
  const executionEngine = verifyExecutionEngineFoundation();
  const sourceReferences = createOsIntegrationSourceReferences(
    OS_INTEGRATION_SOURCE_REFERENCES,
  );
  const composition = verifyOsIntegrationComposition(
    createOsIntegrationFoundationComponents(
      sourceReferences,
      runtimeTraceability,
      executionEngine,
    ),
  );
  const evidence = createOsIntegrationFoundationEvidence(
    sourceReferences,
    runtimeTraceability,
    executionEngine,
    composition,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createOsIntegrationSourceReferences(
  references: readonly OsIntegrationSourceReference[],
): readonly OsIntegrationSourceReference[] {
  assertOsIntegrationSourceReferences(references);

  return Object.freeze(
    OS_INTEGRATION_SOURCE_REFERENCE_IDS
      .filter((referenceId) => references.some((reference) => reference.id === referenceId))
      .map((referenceId) => {
        const reference = references.find((candidate) => candidate.id === referenceId);

        if (reference === undefined) {
          throw new Error(
            "OSINT-006: OS Integration Foundation could not preserve deterministic source ordering.",
          );
        }

        return Object.freeze({
          id: reference.id,
          value: reference.value,
        });
      }),
  );
}

export function verifyOsIntegrationComposition(
  components: readonly OsIntegrationFoundationComponent[],
): OsIntegrationCompositionEvidence {
  assertOsIntegrationFoundationComponents(components);

  const orderedComponents = OS_INTEGRATION_COMPONENT_IDS
    .filter((componentId) => components.some((component) => component.id === componentId))
    .map((componentId) => {
      const component = components.find((candidate) => candidate.id === componentId);

      if (component === undefined) {
        throw new Error(
          "OSINT-007: OS Integration Foundation could not preserve deterministic component ordering.",
        );
      }

      return component;
    });
  const readyComponentCount = orderedComponents.filter((component) => component.ready).length;
  const requiredComponentCount = OS_INTEGRATION_COMPONENT_IDS.length;
  const ready =
    orderedComponents.length === requiredComponentCount &&
    readyComponentCount === requiredComponentCount;

  return Object.freeze({
    componentCount: orderedComponents.length,
    requiredComponentCount,
    readyComponentCount,
    componentIds: Object.freeze(orderedComponents.map((component) => component.id)),
    ready,
  });
}

export function createOsIntegrationFoundationEvidence(
  sourceReferences: readonly OsIntegrationSourceReference[],
  runtimeTraceability: RuntimeTraceabilityResult,
  executionEngine: ExecutionEngineResult,
  composition: OsIntegrationCompositionEvidence,
): OsIntegrationFoundationEvidence {
  const normalizedSourceReferences = createOsIntegrationSourceReferences(sourceReferences);
  const dependencyReadiness = Object.freeze([
    runtimeTraceability.passed,
    executionEngine.passed,
  ]);
  const readyDependencyCount = dependencyReadiness.filter((ready) => ready).length;
  const ready =
    normalizedSourceReferences.length === OS_INTEGRATION_SOURCE_REFERENCE_IDS.length &&
    readyDependencyCount === dependencyReadiness.length &&
    composition.ready;

  return Object.freeze({
    sourceReferences: normalizedSourceReferences,
    runtimeTraceability: runtimeTraceability.evidence,
    executionEngine: executionEngine.evidence,
    composition,
    dependencyCount: dependencyReadiness.length,
    readyDependencyCount,
    ready,
  });
}

function createOsIntegrationFoundationComponents(
  sourceReferences: readonly OsIntegrationSourceReference[],
  runtimeTraceability: RuntimeTraceabilityResult,
  executionEngine: ExecutionEngineResult,
): readonly OsIntegrationFoundationComponent[] {
  const sourceReferenceIds = new Set(sourceReferences.map((reference) => reference.id));
  const hasProgramAuthority = sourceReferenceIds.has("p5-mo-001-authority");
  const hasKernelBoundary = sourceReferenceIds.has("program-003-kernel-boundary");
  const hasRuntimeFoundation = sourceReferenceIds.has("program-004-runtime-foundation");

  return Object.freeze([
    Object.freeze({
      id: "program-authority",
      ready: hasProgramAuthority,
    }),
    Object.freeze({
      id: "kernel-boundary",
      ready: hasKernelBoundary,
    }),
    Object.freeze({
      id: "runtime-foundation",
      ready: hasRuntimeFoundation && runtimeTraceability.passed,
    }),
    Object.freeze({
      id: "execution-engine-dependency",
      ready: executionEngine.passed,
    }),
    Object.freeze({
      id: "internal-integration-composition",
      ready: runtimeTraceability.passed && executionEngine.passed,
    }),
  ]);
}

function assertOsIntegrationSourceReferences(
  references: readonly OsIntegrationSourceReference[],
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    assertOsIntegrationSourceReferenceId(reference.id);
    assertNormalizedReferenceValue(reference.value);

    if (seen.has(reference.id)) {
      throw new Error(
        "OSINT-002: OS Integration Foundation rejects duplicate source references.",
      );
    }

    seen.add(reference.id);
  }
}

function assertOsIntegrationFoundationComponents(
  components: readonly OsIntegrationFoundationComponent[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    assertOsIntegrationFoundationComponentId(component.id);

    if (seen.has(component.id)) {
      throw new Error(
        "OSINT-004: OS Integration Foundation rejects duplicate internal components.",
      );
    }

    seen.add(component.id);
  }
}

function assertOsIntegrationSourceReferenceId(
  value: string,
): asserts value is OsIntegrationSourceReferenceId {
  if (!OS_INTEGRATION_SOURCE_REFERENCE_IDS.includes(value as OsIntegrationSourceReferenceId)) {
    throw new Error(
      "OSINT-001: OS Integration Foundation rejects unknown source references.",
    );
  }
}

function assertOsIntegrationFoundationComponentId(
  value: string,
): asserts value is OsIntegrationFoundationComponentId {
  if (!OS_INTEGRATION_COMPONENT_IDS.includes(value as OsIntegrationFoundationComponentId)) {
    throw new Error(
      "OSINT-003: OS Integration Foundation rejects unknown internal components.",
    );
  }
}

function assertNormalizedReferenceValue(value: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      "OSINT-005: OS Integration Foundation rejects empty or non-normalized reference values.",
    );
  }
}


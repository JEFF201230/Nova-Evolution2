import {
  verifyRuntimeComposition,
} from "./runtime-composition.js";
import type {
  RuntimeCompositionComponent,
  RuntimeCompositionEvidence,
  RuntimeCompositionResult,
} from "./runtime-composition.js";
import {
  verifyRuntimeContextManager,
} from "./runtime-context-manager.js";
import type {
  RuntimeContextManagerEvidence,
  RuntimeContextManagerResult,
  RuntimeContextReference,
} from "./runtime-context-manager.js";
import {
  verifyRuntimeLifecycle,
} from "./runtime-lifecycle.js";
import type {
  RuntimeLifecycleEvidence,
  RuntimeLifecycleResult,
} from "./runtime-lifecycle.js";
import {
  verifyRuntimeScheduler,
} from "./runtime-scheduler.js";
import type {
  RuntimeScheduleItem,
  RuntimeScheduleEvidence,
  RuntimeSchedulerResult,
} from "./runtime-scheduler.js";
import {
  verifyRuntimeStateManager,
} from "./runtime-state-manager.js";
import type {
  RuntimeStateManagerEvidence,
  RuntimeStateManagerResult,
} from "./runtime-state-manager.js";

export type RuntimeOrchestratorState =
  | "CREATED"
  | "READY"
  | "STOPPED";

export type RuntimeOrchestratorComponentId =
  | "runtime-context-manager"
  | "runtime-scheduler"
  | "runtime-state-manager"
  | "runtime-composition"
  | "runtime-lifecycle";

export interface RuntimeOrchestratorComponentRegistration {
  readonly id: RuntimeOrchestratorComponentId;
  readonly ready: boolean;
}

export interface RuntimeOrchestratorEvidence {
  readonly state: RuntimeOrchestratorState;
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly ready: boolean;
}

export interface RuntimeOrchestratorResult {
  readonly passed: boolean;
  readonly evidence: RuntimeOrchestratorEvidence;
}

export interface RuntimeCoreEvidence {
  readonly contextManager: RuntimeContextManagerEvidence;
  readonly stateManager: RuntimeStateManagerEvidence;
  readonly scheduler: RuntimeScheduleEvidence;
  readonly lifecycle: RuntimeLifecycleEvidence;
  readonly composition: RuntimeCompositionEvidence;
  readonly orchestrator: RuntimeOrchestratorEvidence;
}

export interface RuntimeCoreResult {
  readonly passed: boolean;
  readonly evidence: RuntimeCoreEvidence;
}

const RUNTIME_ORCHESTRATOR_COMPONENT_IDS: readonly RuntimeOrchestratorComponentId[] = Object.freeze([
  "runtime-context-manager",
  "runtime-scheduler",
  "runtime-state-manager",
  "runtime-composition",
  "runtime-lifecycle",
]);

const RUNTIME_CORE_CONTEXT_REFERENCES: readonly RuntimeContextReference[] = Object.freeze([
  Object.freeze({
    kind: "campaign",
    value: "CAMPAIGN-010",
  }),
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-007-RUNTIME-ORCHESTRATOR-SKELETON",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
  Object.freeze({
    kind: "kernel-boundary",
    value: "kernel-foundation-v1.0",
  }),
]);

const RUNTIME_CORE_SCHEDULE_ITEMS: readonly RuntimeScheduleItem[] = Object.freeze([
  Object.freeze({
    id: "runtime-context-manager",
    order: 0,
    ready: true,
  }),
  Object.freeze({
    id: "runtime-state-manager",
    order: 1,
    ready: true,
  }),
  Object.freeze({
    id: "runtime-scheduler",
    order: 2,
    ready: true,
  }),
  Object.freeze({
    id: "runtime-lifecycle",
    order: 3,
    ready: true,
  }),
  Object.freeze({
    id: "runtime-composition",
    order: 4,
    ready: true,
  }),
]);

export function createRuntimeOrchestratorEvidence(
  components: readonly RuntimeOrchestratorComponentRegistration[] = [],
): RuntimeOrchestratorEvidence {
  assertRuntimeOrchestratorComponents(components);

  const readyComponentCount = components.filter((component) => component.ready).length;
  const ready =
    components.length === RUNTIME_ORCHESTRATOR_COMPONENT_IDS.length &&
    readyComponentCount === RUNTIME_ORCHESTRATOR_COMPONENT_IDS.length;

  return Object.freeze({
    state: ready ? "READY" as const : "CREATED" as const,
    componentCount: components.length,
    readyComponentCount,
    ready,
  });
}

export function verifyRuntimeOrchestrator(
  components: readonly RuntimeOrchestratorComponentRegistration[] = [],
): RuntimeOrchestratorResult {
  const evidence = createRuntimeOrchestratorEvidence(components);

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function verifyRuntimeCore(): RuntimeCoreResult {
  const contextManager = verifyRuntimeContextManager(RUNTIME_CORE_CONTEXT_REFERENCES);
  const stateManager = verifyRuntimeStateManager();
  const scheduler = verifyRuntimeScheduler(RUNTIME_CORE_SCHEDULE_ITEMS);
  const lifecycle = verifyRuntimeLifecycle();
  const composition = verifyRuntimeComposition(
    createRuntimeCompositionComponents(
      contextManager,
      scheduler,
      stateManager,
      lifecycle,
    ),
  );
  const orchestrator = verifyRuntimeOrchestrator(
    createRuntimeOrchestratorComponentRegistrations(
      contextManager,
      scheduler,
      stateManager,
      composition,
      lifecycle,
    ),
  );
  const evidence = Object.freeze({
    contextManager: contextManager.evidence,
    stateManager: stateManager.evidence,
    scheduler: scheduler.evidence,
    lifecycle: lifecycle.evidence,
    composition: composition.evidence,
    orchestrator: orchestrator.evidence,
  });

  return Object.freeze({
    passed:
      contextManager.passed &&
      stateManager.passed &&
      scheduler.passed &&
      lifecycle.passed &&
      composition.passed &&
      orchestrator.passed,
    evidence,
  });
}

function assertRuntimeOrchestratorComponents(
  components: readonly RuntimeOrchestratorComponentRegistration[],
): void {
  const seen = new Set<string>();

  for (const component of components) {
    if (!isRuntimeOrchestratorComponentId(component.id)) {
      throw new Error(
        "RORCH-001: Runtime Orchestrator rejects unknown internal Runtime components.",
      );
    }

    if (seen.has(component.id)) {
      throw new Error(
        "RORCH-002: Runtime Orchestrator rejects duplicate internal Runtime components.",
      );
    }

    seen.add(component.id);
  }
}

function isRuntimeOrchestratorComponentId(
  value: string,
): value is RuntimeOrchestratorComponentId {
  return RUNTIME_ORCHESTRATOR_COMPONENT_IDS.some((componentId) => componentId === value);
}

function createRuntimeCompositionComponents(
  contextManager: RuntimeContextManagerResult,
  scheduler: RuntimeSchedulerResult,
  stateManager: RuntimeStateManagerResult,
  lifecycle: RuntimeLifecycleResult,
): readonly RuntimeCompositionComponent[] {
  return Object.freeze([
    Object.freeze({
      id: "runtime-context-manager",
      ready: contextManager.passed,
    }),
    Object.freeze({
      id: "runtime-scheduler",
      ready: scheduler.passed,
    }),
    Object.freeze({
      id: "runtime-state-manager",
      ready: stateManager.passed,
    }),
    Object.freeze({
      id: "runtime-lifecycle",
      ready: lifecycle.passed,
    }),
  ]);
}

function createRuntimeOrchestratorComponentRegistrations(
  contextManager: RuntimeContextManagerResult,
  scheduler: RuntimeSchedulerResult,
  stateManager: RuntimeStateManagerResult,
  composition: RuntimeCompositionResult,
  lifecycle: RuntimeLifecycleResult,
): readonly RuntimeOrchestratorComponentRegistration[] {
  return Object.freeze([
    Object.freeze({
      id: "runtime-context-manager",
      ready: contextManager.passed,
    }),
    Object.freeze({
      id: "runtime-scheduler",
      ready: scheduler.passed,
    }),
    Object.freeze({
      id: "runtime-state-manager",
      ready: stateManager.passed,
    }),
    Object.freeze({
      id: "runtime-composition",
      ready: composition.passed,
    }),
    Object.freeze({
      id: "runtime-lifecycle",
      ready: lifecycle.passed,
    }),
  ]);
}

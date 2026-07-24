import {
  verifyMissionRuntimeFoundation,
} from "../mission-runtime/mission-runtime.js";
import type {
  MissionRuntimeEvidence,
  MissionRuntimeResult,
} from "../mission-runtime/mission-runtime.js";
import {
  verifyRuntimeCore,
} from "../os-runtime/runtime-orchestrator.js";
import type {
  RuntimeCoreEvidence,
  RuntimeCoreResult,
} from "../os-runtime/runtime-orchestrator.js";
import {
  verifyWorkflowRuntimeComposition,
} from "./workflow-runtime-composition.js";
import type {
  WorkflowRuntimeCompositionComponent,
  WorkflowRuntimeCompositionEvidence,
  WorkflowRuntimeCompositionResult,
} from "./workflow-runtime-composition.js";
import {
  verifyWorkflowRuntimeContext,
} from "./workflow-runtime-context.js";
import type {
  WorkflowRuntimeContextEvidence,
  WorkflowRuntimeContextReference,
  WorkflowRuntimeContextResult,
} from "./workflow-runtime-context.js";
import {
  verifyWorkflowRuntimeLifecycle,
} from "./workflow-runtime-lifecycle.js";
import type {
  WorkflowRuntimeLifecycleEvidence,
  WorkflowRuntimeLifecycleResult,
} from "./workflow-runtime-lifecycle.js";
import {
  verifyWorkflowRuntimeState,
} from "./workflow-runtime-state.js";
import type {
  WorkflowRuntimeStateEvidence,
  WorkflowRuntimeStateResult,
} from "./workflow-runtime-state.js";

export interface WorkflowRuntimeEvidence {
  readonly runtimeCore: RuntimeCoreEvidence;
  readonly missionRuntime: MissionRuntimeEvidence;
  readonly context: WorkflowRuntimeContextEvidence;
  readonly state: WorkflowRuntimeStateEvidence;
  readonly lifecycle: WorkflowRuntimeLifecycleEvidence;
  readonly composition: WorkflowRuntimeCompositionEvidence;
  readonly dependencyCount: number;
  readonly readyDependencyCount: number;
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly ready: boolean;
}

export interface WorkflowRuntimeResult {
  readonly passed: boolean;
  readonly evidence: WorkflowRuntimeEvidence;
}

const WORKFLOW_RUNTIME_CONTEXT_REFERENCES: readonly WorkflowRuntimeContextReference[] = Object.freeze([
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-009-WORKFLOW-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-core",
    value: "CAMPAIGN-010-RUNTIME-CORE",
  }),
  Object.freeze({
    kind: "mission-runtime",
    value: "CAMPAIGN-011-MISSION-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
]);

export function verifyWorkflowRuntimeFoundation(): WorkflowRuntimeResult {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = verifyMissionRuntimeFoundation();
  const context = verifyWorkflowRuntimeContext(WORKFLOW_RUNTIME_CONTEXT_REFERENCES);
  const state = verifyWorkflowRuntimeState();
  const lifecycle = verifyWorkflowRuntimeLifecycle();
  const composition = verifyWorkflowRuntimeComposition(
    createWorkflowRuntimeCompositionComponents(context, state, lifecycle),
  );
  const evidence = createWorkflowRuntimeEvidence(
    runtimeCore,
    missionRuntime,
    context,
    state,
    lifecycle,
    composition,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createWorkflowRuntimeEvidence(
  runtimeCore: RuntimeCoreResult,
  missionRuntime: MissionRuntimeResult,
  context: WorkflowRuntimeContextResult,
  state: WorkflowRuntimeStateResult,
  lifecycle: WorkflowRuntimeLifecycleResult,
  composition: WorkflowRuntimeCompositionResult,
): WorkflowRuntimeEvidence {
  const dependencyReadiness = Object.freeze([
    runtimeCore.passed,
    missionRuntime.passed,
  ]);
  const componentReadiness = Object.freeze([
    context.passed,
    state.passed,
    lifecycle.passed,
    composition.passed,
  ]);
  const readyDependencyCount = dependencyReadiness.filter((ready) => ready).length;
  const readyComponentCount = componentReadiness.filter((ready) => ready).length;
  const ready =
    readyDependencyCount === dependencyReadiness.length &&
    readyComponentCount === componentReadiness.length;

  return Object.freeze({
    runtimeCore: runtimeCore.evidence,
    missionRuntime: missionRuntime.evidence,
    context: context.evidence,
    state: state.evidence,
    lifecycle: lifecycle.evidence,
    composition: composition.evidence,
    dependencyCount: dependencyReadiness.length,
    readyDependencyCount,
    componentCount: componentReadiness.length,
    readyComponentCount,
    ready,
  });
}

function createWorkflowRuntimeCompositionComponents(
  context: WorkflowRuntimeContextResult,
  state: WorkflowRuntimeStateResult,
  lifecycle: WorkflowRuntimeLifecycleResult,
): readonly WorkflowRuntimeCompositionComponent[] {
  return Object.freeze([
    Object.freeze({
      id: "workflow-runtime-context",
      ready: context.passed,
    }),
    Object.freeze({
      id: "workflow-runtime-state",
      ready: state.passed,
    }),
    Object.freeze({
      id: "workflow-runtime-lifecycle",
      ready: lifecycle.passed,
    }),
  ]);
}

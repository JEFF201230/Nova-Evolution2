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
  verifyWorkflowRuntimeFoundation,
} from "../workflow-runtime/workflow-runtime.js";
import type {
  WorkflowRuntimeEvidence,
  WorkflowRuntimeResult,
} from "../workflow-runtime/workflow-runtime.js";
import {
  verifyAgentRuntimeComposition,
} from "./agent-runtime-composition.js";
import type {
  AgentRuntimeCompositionComponent,
  AgentRuntimeCompositionEvidence,
  AgentRuntimeCompositionResult,
} from "./agent-runtime-composition.js";
import {
  verifyAgentRuntimeContext,
} from "./agent-runtime-context.js";
import type {
  AgentRuntimeContextEvidence,
  AgentRuntimeContextReference,
  AgentRuntimeContextResult,
} from "./agent-runtime-context.js";
import {
  verifyAgentRuntimeLifecycle,
} from "./agent-runtime-lifecycle.js";
import type {
  AgentRuntimeLifecycleEvidence,
  AgentRuntimeLifecycleResult,
} from "./agent-runtime-lifecycle.js";
import {
  verifyAgentRuntimeState,
} from "./agent-runtime-state.js";
import type {
  AgentRuntimeStateEvidence,
  AgentRuntimeStateResult,
} from "./agent-runtime-state.js";

export interface AgentRuntimeEvidence {
  readonly runtimeCore: RuntimeCoreEvidence;
  readonly missionRuntime: MissionRuntimeEvidence;
  readonly workflowRuntime: WorkflowRuntimeEvidence;
  readonly context: AgentRuntimeContextEvidence;
  readonly state: AgentRuntimeStateEvidence;
  readonly lifecycle: AgentRuntimeLifecycleEvidence;
  readonly composition: AgentRuntimeCompositionEvidence;
  readonly dependencyCount: number;
  readonly readyDependencyCount: number;
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly ready: boolean;
}

export interface AgentRuntimeResult {
  readonly passed: boolean;
  readonly evidence: AgentRuntimeEvidence;
}

const AGENT_RUNTIME_CONTEXT_REFERENCES: readonly AgentRuntimeContextReference[] = Object.freeze([
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-010-AGENT-RUNTIME-FOUNDATION",
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
    kind: "workflow-runtime",
    value: "CAMPAIGN-012-WORKFLOW-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-architecture",
    value: "RUNTIME_ARCHITECTURE.md",
  }),
]);

export function verifyAgentRuntimeFoundation(): AgentRuntimeResult {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = verifyMissionRuntimeFoundation();
  const workflowRuntime = verifyWorkflowRuntimeFoundation();
  const context = verifyAgentRuntimeContext(AGENT_RUNTIME_CONTEXT_REFERENCES);
  const state = verifyAgentRuntimeState();
  const lifecycle = verifyAgentRuntimeLifecycle();
  const composition = verifyAgentRuntimeComposition(
    createAgentRuntimeCompositionComponents(context, state, lifecycle),
  );
  const evidence = createAgentRuntimeEvidence(
    runtimeCore,
    missionRuntime,
    workflowRuntime,
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

export function createAgentRuntimeEvidence(
  runtimeCore: RuntimeCoreResult,
  missionRuntime: MissionRuntimeResult,
  workflowRuntime: WorkflowRuntimeResult,
  context: AgentRuntimeContextResult,
  state: AgentRuntimeStateResult,
  lifecycle: AgentRuntimeLifecycleResult,
  composition: AgentRuntimeCompositionResult,
): AgentRuntimeEvidence {
  const dependencyReadiness = Object.freeze([
    runtimeCore.passed,
    missionRuntime.passed,
    workflowRuntime.passed,
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
    workflowRuntime: workflowRuntime.evidence,
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

function createAgentRuntimeCompositionComponents(
  context: AgentRuntimeContextResult,
  state: AgentRuntimeStateResult,
  lifecycle: AgentRuntimeLifecycleResult,
): readonly AgentRuntimeCompositionComponent[] {
  return Object.freeze([
    Object.freeze({
      id: "agent-runtime-context",
      ready: context.passed,
    }),
    Object.freeze({
      id: "agent-runtime-state",
      ready: state.passed,
    }),
    Object.freeze({
      id: "agent-runtime-lifecycle",
      ready: lifecycle.passed,
    }),
  ]);
}

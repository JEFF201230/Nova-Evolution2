import {
  verifyAgentRuntimeFoundation,
} from "../agent-runtime/agent-runtime.js";
import type {
  AgentRuntimeEvidence,
  AgentRuntimeResult,
} from "../agent-runtime/agent-runtime.js";
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
  verifyExecutionEngineComposition,
} from "./execution-engine-composition.js";
import type {
  ExecutionEngineCompositionComponent,
  ExecutionEngineCompositionEvidence,
  ExecutionEngineCompositionResult,
} from "./execution-engine-composition.js";
import {
  verifyExecutionEngineContext,
} from "./execution-engine-context.js";
import type {
  ExecutionEngineContextEvidence,
  ExecutionEngineContextReference,
  ExecutionEngineContextResult,
} from "./execution-engine-context.js";
import {
  verifyExecutionEngineLifecycle,
} from "./execution-engine-lifecycle.js";
import type {
  ExecutionEngineLifecycleEvidence,
  ExecutionEngineLifecycleResult,
} from "./execution-engine-lifecycle.js";
import {
  verifyExecutionEngineState,
} from "./execution-engine-state.js";
import type {
  ExecutionEngineStateEvidence,
  ExecutionEngineStateResult,
} from "./execution-engine-state.js";

export interface ExecutionEngineEvidence {
  readonly runtimeCore: RuntimeCoreEvidence;
  readonly missionRuntime: MissionRuntimeEvidence;
  readonly workflowRuntime: WorkflowRuntimeEvidence;
  readonly agentRuntime: AgentRuntimeEvidence;
  readonly context: ExecutionEngineContextEvidence;
  readonly state: ExecutionEngineStateEvidence;
  readonly lifecycle: ExecutionEngineLifecycleEvidence;
  readonly composition: ExecutionEngineCompositionEvidence;
  readonly dependencyCount: number;
  readonly readyDependencyCount: number;
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly ready: boolean;
}

export interface ExecutionEngineResult {
  readonly passed: boolean;
  readonly evidence: ExecutionEngineEvidence;
}

const EXECUTION_ENGINE_CONTEXT_REFERENCES: readonly ExecutionEngineContextReference[] = Object.freeze([
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-011-EXECUTION-ENGINE-FOUNDATION",
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
    kind: "agent-runtime",
    value: "CAMPAIGN-013-AGENT-RUNTIME-FOUNDATION",
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

export function verifyExecutionEngineFoundation(): ExecutionEngineResult {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = verifyMissionRuntimeFoundation();
  const workflowRuntime = verifyWorkflowRuntimeFoundation();
  const agentRuntime = verifyAgentRuntimeFoundation();
  const context = verifyExecutionEngineContext(EXECUTION_ENGINE_CONTEXT_REFERENCES);
  const state = verifyExecutionEngineState();
  const lifecycle = verifyExecutionEngineLifecycle();
  const composition = verifyExecutionEngineComposition(
    createExecutionEngineCompositionComponents(
      runtimeCore,
      missionRuntime,
      workflowRuntime,
      agentRuntime,
      context,
      state,
      lifecycle,
    ),
  );
  const evidence = createExecutionEngineEvidence(
    runtimeCore,
    missionRuntime,
    workflowRuntime,
    agentRuntime,
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

export function createExecutionEngineEvidence(
  runtimeCore: RuntimeCoreResult,
  missionRuntime: MissionRuntimeResult,
  workflowRuntime: WorkflowRuntimeResult,
  agentRuntime: AgentRuntimeResult,
  context: ExecutionEngineContextResult,
  state: ExecutionEngineStateResult,
  lifecycle: ExecutionEngineLifecycleResult,
  composition: ExecutionEngineCompositionResult,
): ExecutionEngineEvidence {
  const dependencyReadiness = Object.freeze([
    runtimeCore.passed,
    missionRuntime.passed,
    workflowRuntime.passed,
    agentRuntime.passed,
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
    agentRuntime: agentRuntime.evidence,
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

function createExecutionEngineCompositionComponents(
  runtimeCore: RuntimeCoreResult,
  missionRuntime: MissionRuntimeResult,
  workflowRuntime: WorkflowRuntimeResult,
  agentRuntime: AgentRuntimeResult,
  context: ExecutionEngineContextResult,
  state: ExecutionEngineStateResult,
  lifecycle: ExecutionEngineLifecycleResult,
): readonly ExecutionEngineCompositionComponent[] {
  return Object.freeze([
    Object.freeze({
      id: "runtime-core",
      ready: runtimeCore.passed,
    }),
    Object.freeze({
      id: "mission-runtime",
      ready: missionRuntime.passed,
    }),
    Object.freeze({
      id: "workflow-runtime",
      ready: workflowRuntime.passed,
    }),
    Object.freeze({
      id: "agent-runtime",
      ready: agentRuntime.passed,
    }),
    Object.freeze({
      id: "execution-engine-context",
      ready: context.passed,
    }),
    Object.freeze({
      id: "execution-engine-state",
      ready: state.passed,
    }),
    Object.freeze({
      id: "execution-engine-lifecycle",
      ready: lifecycle.passed,
    }),
  ]);
}

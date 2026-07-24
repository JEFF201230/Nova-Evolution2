import {
  verifyRuntimeCore,
} from "../os-runtime/runtime-orchestrator.js";
import type {
  RuntimeCoreEvidence,
  RuntimeCoreResult,
} from "../os-runtime/runtime-orchestrator.js";
import {
  verifyMissionRuntimeComposition,
} from "./mission-runtime-composition.js";
import type {
  MissionRuntimeCompositionComponent,
  MissionRuntimeCompositionEvidence,
  MissionRuntimeCompositionResult,
} from "./mission-runtime-composition.js";
import {
  verifyMissionRuntimeContext,
} from "./mission-runtime-context.js";
import type {
  MissionRuntimeContextEvidence,
  MissionRuntimeContextReference,
  MissionRuntimeContextResult,
} from "./mission-runtime-context.js";
import {
  verifyMissionRuntimeLifecycle,
} from "./mission-runtime-lifecycle.js";
import type {
  MissionRuntimeLifecycleEvidence,
  MissionRuntimeLifecycleResult,
} from "./mission-runtime-lifecycle.js";
import {
  verifyMissionRuntimeState,
} from "./mission-runtime-state.js";
import type {
  MissionRuntimeStateEvidence,
  MissionRuntimeStateResult,
} from "./mission-runtime-state.js";

export interface MissionRuntimeEvidence {
  readonly runtimeCore: RuntimeCoreEvidence;
  readonly context: MissionRuntimeContextEvidence;
  readonly state: MissionRuntimeStateEvidence;
  readonly lifecycle: MissionRuntimeLifecycleEvidence;
  readonly composition: MissionRuntimeCompositionEvidence;
  readonly componentCount: number;
  readonly readyComponentCount: number;
  readonly ready: boolean;
}

export interface MissionRuntimeResult {
  readonly passed: boolean;
  readonly evidence: MissionRuntimeEvidence;
}

const MISSION_RUNTIME_CONTEXT_REFERENCES: readonly MissionRuntimeContextReference[] = Object.freeze([
  Object.freeze({
    kind: "mission-order",
    value: "P4-MO-008-MISSION-RUNTIME-FOUNDATION",
  }),
  Object.freeze({
    kind: "runtime-core",
    value: "CAMPAIGN-010-RUNTIME-CORE",
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

export function verifyMissionRuntimeFoundation(): MissionRuntimeResult {
  const runtimeCore = verifyRuntimeCore();
  const context = verifyMissionRuntimeContext(MISSION_RUNTIME_CONTEXT_REFERENCES);
  const state = verifyMissionRuntimeState();
  const lifecycle = verifyMissionRuntimeLifecycle();
  const composition = verifyMissionRuntimeComposition(
    createMissionRuntimeCompositionComponents(context, state, lifecycle),
  );
  const evidence = createMissionRuntimeEvidence(
    runtimeCore,
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

export function createMissionRuntimeEvidence(
  runtimeCore: RuntimeCoreResult,
  context: MissionRuntimeContextResult,
  state: MissionRuntimeStateResult,
  lifecycle: MissionRuntimeLifecycleResult,
  composition: MissionRuntimeCompositionResult,
): MissionRuntimeEvidence {
  const readyInputs = Object.freeze([
    runtimeCore.passed,
    context.passed,
    state.passed,
    lifecycle.passed,
    composition.passed,
  ]);
  const readyComponentCount = readyInputs.filter((ready) => ready).length;
  const ready = readyComponentCount === readyInputs.length;

  return Object.freeze({
    runtimeCore: runtimeCore.evidence,
    context: context.evidence,
    state: state.evidence,
    lifecycle: lifecycle.evidence,
    composition: composition.evidence,
    componentCount: readyInputs.length,
    readyComponentCount,
    ready,
  });
}

function createMissionRuntimeCompositionComponents(
  context: MissionRuntimeContextResult,
  state: MissionRuntimeStateResult,
  lifecycle: MissionRuntimeLifecycleResult,
): readonly MissionRuntimeCompositionComponent[] {
  return Object.freeze([
    Object.freeze({
      id: "mission-runtime-context",
      ready: context.passed,
    }),
    Object.freeze({
      id: "mission-runtime-state",
      ready: state.passed,
    }),
    Object.freeze({
      id: "mission-runtime-lifecycle",
      ready: lifecycle.passed,
    }),
  ]);
}

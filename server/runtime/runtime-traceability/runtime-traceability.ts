import {
  verifyAgentRuntimeFoundation,
} from "../agent-runtime/agent-runtime.js";
import type {
  AgentRuntimeEvidence,
  AgentRuntimeResult,
} from "../agent-runtime/agent-runtime.js";
import {
  verifyExecutionEngineFoundation,
} from "../execution-engine/execution-engine.js";
import type {
  ExecutionEngineEvidence,
  ExecutionEngineResult,
} from "../execution-engine/execution-engine.js";
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

export type RuntimeTraceabilityNodeId =
  | "mission-order-authority"
  | "runtime-core"
  | "mission-runtime"
  | "workflow-runtime"
  | "agent-runtime"
  | "execution-engine"
  | "execution-evidence"
  | "certification-evidence"
  | "archive-readiness";

export type RuntimeTraceabilityLinkId =
  | "mission-order-to-runtime-core"
  | "runtime-core-to-mission-runtime"
  | "mission-runtime-to-workflow-runtime"
  | "workflow-runtime-to-agent-runtime"
  | "agent-runtime-to-execution-engine"
  | "execution-engine-to-execution-evidence"
  | "execution-evidence-to-certification-evidence"
  | "certification-evidence-to-archive-readiness";

export type RuntimeTraceabilityCoverageLevel =
  | "COMPLETE"
  | "PARTIAL";

export interface RuntimeTraceabilityLink {
  readonly id: RuntimeTraceabilityLinkId;
  readonly from: RuntimeTraceabilityNodeId;
  readonly to: RuntimeTraceabilityNodeId;
  readonly sourceReference: string;
  readonly evidenceReady: boolean;
}

export interface RuntimeTraceabilityGraphEvidence {
  readonly linkCount: number;
  readonly requiredLinkCount: number;
  readonly readyLinkCount: number;
  readonly nodeIds: readonly RuntimeTraceabilityNodeId[];
  readonly linkIds: readonly RuntimeTraceabilityLinkId[];
  readonly links: readonly RuntimeTraceabilityLink[];
  readonly coverageLevel: RuntimeTraceabilityCoverageLevel;
  readonly ready: boolean;
}

export interface RuntimeTraceabilityResult {
  readonly passed: boolean;
  readonly evidence: RuntimeTraceabilityEvidence;
}

export interface RuntimeTraceabilityEvidence {
  readonly runtimeCore: RuntimeCoreEvidence;
  readonly missionRuntime: MissionRuntimeEvidence;
  readonly workflowRuntime: WorkflowRuntimeEvidence;
  readonly agentRuntime: AgentRuntimeEvidence;
  readonly executionEngine: ExecutionEngineEvidence;
  readonly graph: RuntimeTraceabilityGraphEvidence;
  readonly dependencyCount: number;
  readonly readyDependencyCount: number;
  readonly ready: boolean;
}

export interface RuntimeTraceabilityReadiness {
  readonly runtimeCoreReady: boolean;
  readonly missionRuntimeReady: boolean;
  readonly workflowRuntimeReady: boolean;
  readonly agentRuntimeReady: boolean;
  readonly executionEngineReady: boolean;
}

const RUNTIME_TRACEABILITY_NODE_IDS: readonly RuntimeTraceabilityNodeId[] = Object.freeze([
  "mission-order-authority",
  "runtime-core",
  "mission-runtime",
  "workflow-runtime",
  "agent-runtime",
  "execution-engine",
  "execution-evidence",
  "certification-evidence",
  "archive-readiness",
]);

const RUNTIME_TRACEABILITY_LINK_TOPOLOGY: Readonly<
  Record<
    RuntimeTraceabilityLinkId,
    Readonly<{
      from: RuntimeTraceabilityNodeId;
      to: RuntimeTraceabilityNodeId;
    }>
  >
> = Object.freeze({
  "mission-order-to-runtime-core": Object.freeze({
    from: "mission-order-authority",
    to: "runtime-core",
  }),
  "runtime-core-to-mission-runtime": Object.freeze({
    from: "runtime-core",
    to: "mission-runtime",
  }),
  "mission-runtime-to-workflow-runtime": Object.freeze({
    from: "mission-runtime",
    to: "workflow-runtime",
  }),
  "workflow-runtime-to-agent-runtime": Object.freeze({
    from: "workflow-runtime",
    to: "agent-runtime",
  }),
  "agent-runtime-to-execution-engine": Object.freeze({
    from: "agent-runtime",
    to: "execution-engine",
  }),
  "execution-engine-to-execution-evidence": Object.freeze({
    from: "execution-engine",
    to: "execution-evidence",
  }),
  "execution-evidence-to-certification-evidence": Object.freeze({
    from: "execution-evidence",
    to: "certification-evidence",
  }),
  "certification-evidence-to-archive-readiness": Object.freeze({
    from: "certification-evidence",
    to: "archive-readiness",
  }),
});

const RUNTIME_TRACEABILITY_LINK_IDS = Object.freeze(
  Object.keys(RUNTIME_TRACEABILITY_LINK_TOPOLOGY) as readonly RuntimeTraceabilityLinkId[],
);

export function createRuntimeTraceabilityLink(
  id: RuntimeTraceabilityLinkId,
  sourceReference: string,
  evidenceReady: boolean,
): RuntimeTraceabilityLink {
  assertRuntimeTraceabilityLinkId(id);
  assertRuntimeTraceabilitySourceReference(sourceReference);

  const topology = RUNTIME_TRACEABILITY_LINK_TOPOLOGY[id];

  return Object.freeze({
    id,
    from: topology.from,
    to: topology.to,
    sourceReference,
    evidenceReady,
  });
}

export function createRuntimeTraceabilityLinks(
  readiness: RuntimeTraceabilityReadiness,
): readonly RuntimeTraceabilityLink[] {
  return Object.freeze([
    createRuntimeTraceabilityLink(
      "mission-order-to-runtime-core",
      "P4-MO-012-RUNTIME-TRACEABILITY",
      readiness.runtimeCoreReady,
    ),
    createRuntimeTraceabilityLink(
      "runtime-core-to-mission-runtime",
      "CAMPAIGN-010-RUNTIME-CORE",
      readiness.missionRuntimeReady,
    ),
    createRuntimeTraceabilityLink(
      "mission-runtime-to-workflow-runtime",
      "CAMPAIGN-011-MISSION-RUNTIME-FOUNDATION",
      readiness.workflowRuntimeReady,
    ),
    createRuntimeTraceabilityLink(
      "workflow-runtime-to-agent-runtime",
      "CAMPAIGN-012-WORKFLOW-RUNTIME-FOUNDATION",
      readiness.agentRuntimeReady,
    ),
    createRuntimeTraceabilityLink(
      "agent-runtime-to-execution-engine",
      "CAMPAIGN-013-AGENT-RUNTIME-FOUNDATION",
      readiness.executionEngineReady,
    ),
    createRuntimeTraceabilityLink(
      "execution-engine-to-execution-evidence",
      "CAMPAIGN-014-EXECUTION-ENGINE-FOUNDATION",
      readiness.executionEngineReady,
    ),
    createRuntimeTraceabilityLink(
      "execution-evidence-to-certification-evidence",
      "TRACEABILITY_MODEL_SPECIFICATION.md",
      readiness.executionEngineReady,
    ),
    createRuntimeTraceabilityLink(
      "certification-evidence-to-archive-readiness",
      "RUNTIME_ARCHITECTURE.md",
      readiness.executionEngineReady,
    ),
  ]);
}

export function createRuntimeTraceabilityGraphEvidence(
  links: readonly RuntimeTraceabilityLink[],
): RuntimeTraceabilityGraphEvidence {
  assertRuntimeTraceabilityLinks(links);

  const orderedLinks = RUNTIME_TRACEABILITY_LINK_IDS
    .filter((linkId) => links.some((link) => link.id === linkId))
    .map((linkId) => {
      const link = links.find((candidate) => candidate.id === linkId);

      if (link === undefined) {
        throw new Error(
          "RTRC-005: Runtime Traceability could not preserve deterministic link ordering.",
        );
      }

      return Object.freeze({
        id: link.id,
        from: link.from,
        to: link.to,
        sourceReference: link.sourceReference,
        evidenceReady: link.evidenceReady,
      });
    });
  const readyLinkCount = orderedLinks.filter((link) => link.evidenceReady).length;
  const requiredLinkCount = RUNTIME_TRACEABILITY_LINK_IDS.length;
  const ready =
    orderedLinks.length === requiredLinkCount &&
    readyLinkCount === requiredLinkCount;

  return Object.freeze({
    linkCount: orderedLinks.length,
    requiredLinkCount,
    readyLinkCount,
    nodeIds: Object.freeze(createRuntimeTraceabilityNodeIds(orderedLinks)),
    linkIds: Object.freeze(orderedLinks.map((link) => link.id)),
    links: Object.freeze(orderedLinks),
    coverageLevel: ready ? "COMPLETE" as const : "PARTIAL" as const,
    ready,
  });
}

export function verifyRuntimeTraceability(
  links: readonly RuntimeTraceabilityLink[],
): RuntimeTraceabilityGraphEvidence {
  return createRuntimeTraceabilityGraphEvidence(links);
}

export function verifyRuntimeTraceabilityFoundation(): RuntimeTraceabilityResult {
  const runtimeCore = verifyRuntimeCore();
  const missionRuntime = verifyMissionRuntimeFoundation();
  const workflowRuntime = verifyWorkflowRuntimeFoundation();
  const agentRuntime = verifyAgentRuntimeFoundation();
  const executionEngine = verifyExecutionEngineFoundation();
  const graph = verifyRuntimeTraceability(
    createRuntimeTraceabilityLinks({
      runtimeCoreReady: runtimeCore.passed,
      missionRuntimeReady: missionRuntime.passed,
      workflowRuntimeReady: workflowRuntime.passed,
      agentRuntimeReady: agentRuntime.passed,
      executionEngineReady: executionEngine.passed,
    }),
  );
  const evidence = createRuntimeTraceabilityEvidence(
    runtimeCore,
    missionRuntime,
    workflowRuntime,
    agentRuntime,
    executionEngine,
    graph,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function createRuntimeTraceabilityEvidence(
  runtimeCore: RuntimeCoreResult,
  missionRuntime: MissionRuntimeResult,
  workflowRuntime: WorkflowRuntimeResult,
  agentRuntime: AgentRuntimeResult,
  executionEngine: ExecutionEngineResult,
  graph: RuntimeTraceabilityGraphEvidence,
): RuntimeTraceabilityEvidence {
  const dependencyReadiness = Object.freeze([
    runtimeCore.passed,
    missionRuntime.passed,
    workflowRuntime.passed,
    agentRuntime.passed,
    executionEngine.passed,
  ]);
  const readyDependencyCount = dependencyReadiness.filter((ready) => ready).length;
  const ready =
    readyDependencyCount === dependencyReadiness.length &&
    graph.ready;

  return Object.freeze({
    runtimeCore: runtimeCore.evidence,
    missionRuntime: missionRuntime.evidence,
    workflowRuntime: workflowRuntime.evidence,
    agentRuntime: agentRuntime.evidence,
    executionEngine: executionEngine.evidence,
    graph,
    dependencyCount: dependencyReadiness.length,
    readyDependencyCount,
    ready,
  });
}

function assertRuntimeTraceabilityLinks(
  links: readonly RuntimeTraceabilityLink[],
): void {
  const seen = new Set<string>();

  for (const link of links) {
    assertRuntimeTraceabilityLinkId(link.id);
    assertRuntimeTraceabilityNodeId(link.from);
    assertRuntimeTraceabilityNodeId(link.to);
    assertRuntimeTraceabilitySourceReference(link.sourceReference);

    if (seen.has(link.id)) {
      throw new Error(
        "RTRC-002: Runtime Traceability rejects duplicate evidence links.",
      );
    }

    const topology = RUNTIME_TRACEABILITY_LINK_TOPOLOGY[link.id];

    if (link.from !== topology.from || link.to !== topology.to) {
      throw new Error(
        "RTRC-004: Runtime Traceability rejects incoherent evidence link topology.",
      );
    }

    seen.add(link.id);
  }
}

function createRuntimeTraceabilityNodeIds(
  links: readonly RuntimeTraceabilityLink[],
): readonly RuntimeTraceabilityNodeId[] {
  const linkedNodes = new Set<RuntimeTraceabilityNodeId>();

  for (const link of links) {
    linkedNodes.add(link.from);
    linkedNodes.add(link.to);
  }

  return RUNTIME_TRACEABILITY_NODE_IDS.filter((nodeId) => linkedNodes.has(nodeId));
}

function assertRuntimeTraceabilityLinkId(
  value: string,
): asserts value is RuntimeTraceabilityLinkId {
  if (!RUNTIME_TRACEABILITY_LINK_IDS.includes(value as RuntimeTraceabilityLinkId)) {
    throw new Error(
      "RTRC-001: Runtime Traceability rejects unknown evidence links.",
    );
  }
}

function assertRuntimeTraceabilityNodeId(
  value: string,
): asserts value is RuntimeTraceabilityNodeId {
  if (!RUNTIME_TRACEABILITY_NODE_IDS.includes(value as RuntimeTraceabilityNodeId)) {
    throw new Error(
      "RTRC-003: Runtime Traceability rejects unknown evidence nodes.",
    );
  }
}

function assertRuntimeTraceabilitySourceReference(
  value: string,
): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      "RTRC-006: Runtime Traceability rejects empty or non-normalized source references.",
    );
  }
}

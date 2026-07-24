import {
  verifyRuntimeTraceabilityFoundation,
} from "../runtime/runtime-traceability/runtime-traceability.js";
import type {
  RuntimeTraceabilityEvidence,
  RuntimeTraceabilityGraphEvidence,
  RuntimeTraceabilityLink,
  RuntimeTraceabilityLinkId,
  RuntimeTraceabilityNodeId,
  RuntimeTraceabilityResult,
} from "../runtime/runtime-traceability/runtime-traceability.js";
import {
  verifyOsIntegrationFoundation,
} from "./os-integration-foundation.js";
import type {
  OsIntegrationFoundationEvidence,
  OsIntegrationFoundationResult,
} from "./os-integration-foundation.js";

export type RuntimeEvidenceConsumptionFactId =
  | "runtime-core"
  | "mission-runtime"
  | "workflow-runtime"
  | "agent-runtime"
  | "execution-engine"
  | "runtime-traceability";

export type OsGovernanceEvidenceId =
  | "runtime-foundation-readiness"
  | "traceability-coverage"
  | "execution-evidence-readiness"
  | "certification-evidence-readiness"
  | "archive-readiness";

export interface RuntimeEvidenceConsumptionFact {
  readonly id: RuntimeEvidenceConsumptionFactId;
  readonly sourceReference: string;
  readonly ready: boolean;
}

export interface RuntimeEvidenceConsumptionLink {
  readonly id: RuntimeTraceabilityLinkId;
  readonly from: RuntimeTraceabilityNodeId;
  readonly to: RuntimeTraceabilityNodeId;
  readonly sourceReference: string;
  readonly ready: boolean;
}

export interface OsGovernanceEvidenceItem {
  readonly id: OsGovernanceEvidenceId;
  readonly sourceFactIds: readonly RuntimeEvidenceConsumptionFactId[];
  readonly sourceLinkIds: readonly RuntimeTraceabilityLinkId[];
  readonly ready: boolean;
}

export interface RuntimeEvidenceConsumptionEvidence {
  readonly osIntegrationFoundation: OsIntegrationFoundationEvidence;
  readonly runtimeTraceability: RuntimeTraceabilityEvidence;
  readonly facts: readonly RuntimeEvidenceConsumptionFact[];
  readonly links: readonly RuntimeEvidenceConsumptionLink[];
  readonly osGovernanceEvidence: readonly OsGovernanceEvidenceItem[];
  readonly dependencyCount: number;
  readonly readyDependencyCount: number;
  readonly factCount: number;
  readonly readyFactCount: number;
  readonly linkCount: number;
  readonly readyLinkCount: number;
  readonly governanceEvidenceCount: number;
  readonly readyGovernanceEvidenceCount: number;
  readonly ready: boolean;
}

export interface RuntimeEvidenceConsumptionResult {
  readonly passed: boolean;
  readonly evidence: RuntimeEvidenceConsumptionEvidence;
}

const RUNTIME_EVIDENCE_FACT_IDS: readonly RuntimeEvidenceConsumptionFactId[] = Object.freeze([
  "runtime-core",
  "mission-runtime",
  "workflow-runtime",
  "agent-runtime",
  "execution-engine",
  "runtime-traceability",
]);

const RUNTIME_TRACEABILITY_LINK_IDS: readonly RuntimeTraceabilityLinkId[] = Object.freeze([
  "mission-order-to-runtime-core",
  "runtime-core-to-mission-runtime",
  "mission-runtime-to-workflow-runtime",
  "workflow-runtime-to-agent-runtime",
  "agent-runtime-to-execution-engine",
  "execution-engine-to-execution-evidence",
  "execution-evidence-to-certification-evidence",
  "certification-evidence-to-archive-readiness",
]);

const OS_GOVERNANCE_EVIDENCE_IDS: readonly OsGovernanceEvidenceId[] = Object.freeze([
  "runtime-foundation-readiness",
  "traceability-coverage",
  "execution-evidence-readiness",
  "certification-evidence-readiness",
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

export function verifyRuntimeEvidenceConsumption(): RuntimeEvidenceConsumptionResult {
  const osIntegrationFoundation = verifyOsIntegrationFoundation();
  const runtimeTraceability = verifyRuntimeTraceabilityFoundation();
  const facts = deriveRuntimeEvidenceConsumptionFacts(runtimeTraceability.evidence);
  const links = consumeRuntimeTraceabilityLinks(runtimeTraceability.evidence.graph);
  const osGovernanceEvidence = createOsGovernanceEvidenceFromRuntimeEvidence(facts, links);
  const evidence = createRuntimeEvidenceConsumptionEvidence(
    osIntegrationFoundation,
    runtimeTraceability,
    facts,
    links,
    osGovernanceEvidence,
  );

  return Object.freeze({
    passed: evidence.ready,
    evidence,
  });
}

export function deriveRuntimeEvidenceConsumptionFacts(
  runtimeTraceability: RuntimeTraceabilityEvidence,
): readonly RuntimeEvidenceConsumptionFact[] {
  return createRuntimeEvidenceConsumptionFacts([
    {
      id: "runtime-core",
      sourceReference: "PROGRAM-004-RUNTIME-CORE",
      ready: runtimeTraceability.runtimeCore.orchestrator.ready,
    },
    {
      id: "mission-runtime",
      sourceReference: "PROGRAM-004-MISSION-RUNTIME",
      ready: runtimeTraceability.missionRuntime.ready,
    },
    {
      id: "workflow-runtime",
      sourceReference: "PROGRAM-004-WORKFLOW-RUNTIME",
      ready: runtimeTraceability.workflowRuntime.ready,
    },
    {
      id: "agent-runtime",
      sourceReference: "PROGRAM-004-AGENT-RUNTIME",
      ready: runtimeTraceability.agentRuntime.ready,
    },
    {
      id: "execution-engine",
      sourceReference: "PROGRAM-004-EXECUTION-ENGINE",
      ready: runtimeTraceability.executionEngine.ready,
    },
    {
      id: "runtime-traceability",
      sourceReference: "PROGRAM-004-RUNTIME-TRACEABILITY",
      ready: runtimeTraceability.ready,
    },
  ]);
}

export function consumeRuntimeTraceabilityLinks(
  graph: RuntimeTraceabilityGraphEvidence,
): readonly RuntimeEvidenceConsumptionLink[] {
  return createRuntimeEvidenceConsumptionLinks(
    graph.links.map((link) => ({
      id: link.id,
      from: link.from,
      to: link.to,
      sourceReference: link.sourceReference,
      ready: link.evidenceReady,
    })),
  );
}

export function createOsGovernanceEvidenceFromRuntimeEvidence(
  facts: readonly RuntimeEvidenceConsumptionFact[],
  links: readonly RuntimeEvidenceConsumptionLink[],
): readonly OsGovernanceEvidenceItem[] {
  const normalizedFacts = createRuntimeEvidenceConsumptionFacts(facts);
  const normalizedLinks = createRuntimeEvidenceConsumptionLinks(links);

  return createOsGovernanceEvidence([
    {
      id: "runtime-foundation-readiness",
      sourceFactIds: [
        "runtime-core",
        "mission-runtime",
        "workflow-runtime",
        "agent-runtime",
        "execution-engine",
      ],
      sourceLinkIds: [
        "mission-order-to-runtime-core",
        "runtime-core-to-mission-runtime",
        "mission-runtime-to-workflow-runtime",
        "workflow-runtime-to-agent-runtime",
        "agent-runtime-to-execution-engine",
      ],
      ready:
        everyFactReady(normalizedFacts, [
          "runtime-core",
          "mission-runtime",
          "workflow-runtime",
          "agent-runtime",
          "execution-engine",
        ]) &&
        everyLinkReady(normalizedLinks, [
          "mission-order-to-runtime-core",
          "runtime-core-to-mission-runtime",
          "mission-runtime-to-workflow-runtime",
          "workflow-runtime-to-agent-runtime",
          "agent-runtime-to-execution-engine",
        ]),
    },
    {
      id: "traceability-coverage",
      sourceFactIds: ["runtime-traceability"],
      sourceLinkIds: RUNTIME_TRACEABILITY_LINK_IDS,
      ready:
        everyFactReady(normalizedFacts, ["runtime-traceability"]) &&
        everyLinkReady(normalizedLinks, RUNTIME_TRACEABILITY_LINK_IDS),
    },
    {
      id: "execution-evidence-readiness",
      sourceFactIds: ["execution-engine"],
      sourceLinkIds: ["execution-engine-to-execution-evidence"],
      ready:
        everyFactReady(normalizedFacts, ["execution-engine"]) &&
        everyLinkReady(normalizedLinks, ["execution-engine-to-execution-evidence"]),
    },
    {
      id: "certification-evidence-readiness",
      sourceFactIds: ["runtime-traceability"],
      sourceLinkIds: ["execution-evidence-to-certification-evidence"],
      ready:
        everyFactReady(normalizedFacts, ["runtime-traceability"]) &&
        everyLinkReady(normalizedLinks, ["execution-evidence-to-certification-evidence"]),
    },
    {
      id: "archive-readiness",
      sourceFactIds: ["runtime-traceability"],
      sourceLinkIds: ["certification-evidence-to-archive-readiness"],
      ready:
        everyFactReady(normalizedFacts, ["runtime-traceability"]) &&
        everyLinkReady(normalizedLinks, ["certification-evidence-to-archive-readiness"]),
    },
  ]);
}

export function createRuntimeEvidenceConsumptionEvidence(
  osIntegrationFoundation: OsIntegrationFoundationResult,
  runtimeTraceability: RuntimeTraceabilityResult,
  facts: readonly RuntimeEvidenceConsumptionFact[],
  links: readonly RuntimeEvidenceConsumptionLink[],
  osGovernanceEvidence: readonly OsGovernanceEvidenceItem[],
): RuntimeEvidenceConsumptionEvidence {
  const normalizedFacts = createRuntimeEvidenceConsumptionFacts(facts);
  const normalizedLinks = createRuntimeEvidenceConsumptionLinks(links);
  const normalizedGovernanceEvidence = createOsGovernanceEvidence(osGovernanceEvidence);
  const dependencyReadiness = Object.freeze([
    osIntegrationFoundation.passed,
    runtimeTraceability.passed,
  ]);
  const readyDependencyCount = dependencyReadiness.filter((ready) => ready).length;
  const readyFactCount = normalizedFacts.filter((fact) => fact.ready).length;
  const readyLinkCount = normalizedLinks.filter((link) => link.ready).length;
  const readyGovernanceEvidenceCount = normalizedGovernanceEvidence
    .filter((item) => item.ready)
    .length;
  const ready =
    readyDependencyCount === dependencyReadiness.length &&
    normalizedFacts.length === RUNTIME_EVIDENCE_FACT_IDS.length &&
    readyFactCount === RUNTIME_EVIDENCE_FACT_IDS.length &&
    normalizedLinks.length === RUNTIME_TRACEABILITY_LINK_IDS.length &&
    readyLinkCount === RUNTIME_TRACEABILITY_LINK_IDS.length &&
    normalizedGovernanceEvidence.length === OS_GOVERNANCE_EVIDENCE_IDS.length &&
    readyGovernanceEvidenceCount === OS_GOVERNANCE_EVIDENCE_IDS.length;

  return Object.freeze({
    osIntegrationFoundation: osIntegrationFoundation.evidence,
    runtimeTraceability: runtimeTraceability.evidence,
    facts: normalizedFacts,
    links: normalizedLinks,
    osGovernanceEvidence: normalizedGovernanceEvidence,
    dependencyCount: dependencyReadiness.length,
    readyDependencyCount,
    factCount: normalizedFacts.length,
    readyFactCount,
    linkCount: normalizedLinks.length,
    readyLinkCount,
    governanceEvidenceCount: normalizedGovernanceEvidence.length,
    readyGovernanceEvidenceCount,
    ready,
  });
}

export function createRuntimeEvidenceConsumptionFacts(
  facts: readonly RuntimeEvidenceConsumptionFact[],
): readonly RuntimeEvidenceConsumptionFact[] {
  assertRuntimeEvidenceConsumptionFacts(facts);

  return Object.freeze(
    RUNTIME_EVIDENCE_FACT_IDS
      .filter((factId) => facts.some((fact) => fact.id === factId))
      .map((factId) => {
        const fact = facts.find((candidate) => candidate.id === factId);

        if (fact === undefined) {
          throw new Error(
            "REVC-008: Runtime Evidence Consumption could not preserve deterministic fact ordering.",
          );
        }

        return Object.freeze({
          id: fact.id,
          sourceReference: fact.sourceReference,
          ready: fact.ready,
        });
      }),
  );
}

export function createRuntimeEvidenceConsumptionLinks(
  links: readonly RuntimeEvidenceConsumptionLink[],
): readonly RuntimeEvidenceConsumptionLink[] {
  assertRuntimeEvidenceConsumptionLinks(links);

  return Object.freeze(
    RUNTIME_TRACEABILITY_LINK_IDS
      .filter((linkId) => links.some((link) => link.id === linkId))
      .map((linkId) => {
        const link = links.find((candidate) => candidate.id === linkId);

        if (link === undefined) {
          throw new Error(
            "REVC-009: Runtime Evidence Consumption could not preserve deterministic link ordering.",
          );
        }

        return Object.freeze({
          id: link.id,
          from: link.from,
          to: link.to,
          sourceReference: link.sourceReference,
          ready: link.ready,
        });
      }),
  );
}

export function createOsGovernanceEvidence(
  evidence: readonly OsGovernanceEvidenceItem[],
): readonly OsGovernanceEvidenceItem[] {
  assertOsGovernanceEvidence(evidence);

  return Object.freeze(
    OS_GOVERNANCE_EVIDENCE_IDS
      .filter((evidenceId) => evidence.some((item) => item.id === evidenceId))
      .map((evidenceId) => {
        const item = evidence.find((candidate) => candidate.id === evidenceId);

        if (item === undefined) {
          throw new Error(
            "REVC-010: Runtime Evidence Consumption could not preserve deterministic governance evidence ordering.",
          );
        }

        return Object.freeze({
          id: item.id,
          sourceFactIds: Object.freeze([...item.sourceFactIds]),
          sourceLinkIds: Object.freeze([...item.sourceLinkIds]),
          ready: item.ready,
        });
      }),
  );
}

function assertRuntimeEvidenceConsumptionFacts(
  facts: readonly RuntimeEvidenceConsumptionFact[],
): void {
  const seen = new Set<string>();

  for (const fact of facts) {
    assertRuntimeEvidenceConsumptionFactId(fact.id);
    assertNormalizedReferenceValue(fact.sourceReference);

    if (seen.has(fact.id)) {
      throw new Error(
        "REVC-002: Runtime Evidence Consumption rejects duplicate Runtime facts.",
      );
    }

    seen.add(fact.id);
  }
}

function assertRuntimeEvidenceConsumptionLinks(
  links: readonly RuntimeEvidenceConsumptionLink[],
): void {
  const seen = new Set<string>();

  for (const link of links) {
    assertRuntimeTraceabilityLinkId(link.id);
    assertNormalizedReferenceValue(link.sourceReference);

    const topology = RUNTIME_TRACEABILITY_LINK_TOPOLOGY[link.id];

    if (link.from !== topology.from || link.to !== topology.to) {
      throw new Error(
        "REVC-005: Runtime Evidence Consumption rejects incoherent Runtime Traceability links.",
      );
    }

    if (seen.has(link.id)) {
      throw new Error(
        "REVC-004: Runtime Evidence Consumption rejects duplicate Runtime Traceability links.",
      );
    }

    seen.add(link.id);
  }
}

function assertOsGovernanceEvidence(
  evidence: readonly OsGovernanceEvidenceItem[],
): void {
  const seen = new Set<string>();

  for (const item of evidence) {
    assertOsGovernanceEvidenceId(item.id);

    for (const factId of item.sourceFactIds) {
      assertRuntimeEvidenceConsumptionFactId(factId);
    }

    for (const linkId of item.sourceLinkIds) {
      assertRuntimeTraceabilityLinkId(linkId);
    }

    if (seen.has(item.id)) {
      throw new Error(
        "REVC-007: Runtime Evidence Consumption rejects duplicate OS governance evidence.",
      );
    }

    seen.add(item.id);
  }
}

function everyFactReady(
  facts: readonly RuntimeEvidenceConsumptionFact[],
  factIds: readonly RuntimeEvidenceConsumptionFactId[],
): boolean {
  return factIds.every((factId) => facts.some((fact) => fact.id === factId && fact.ready));
}

function everyLinkReady(
  links: readonly RuntimeEvidenceConsumptionLink[],
  linkIds: readonly RuntimeTraceabilityLinkId[],
): boolean {
  return linkIds.every((linkId) => links.some((link) => link.id === linkId && link.ready));
}

function assertRuntimeEvidenceConsumptionFactId(
  value: string,
): asserts value is RuntimeEvidenceConsumptionFactId {
  if (!RUNTIME_EVIDENCE_FACT_IDS.includes(value as RuntimeEvidenceConsumptionFactId)) {
    throw new Error(
      "REVC-001: Runtime Evidence Consumption rejects unknown Runtime facts.",
    );
  }
}

function assertRuntimeTraceabilityLinkId(
  value: string,
): asserts value is RuntimeTraceabilityLinkId {
  if (!RUNTIME_TRACEABILITY_LINK_IDS.includes(value as RuntimeTraceabilityLinkId)) {
    throw new Error(
      "REVC-003: Runtime Evidence Consumption rejects unknown Runtime Traceability links.",
    );
  }
}

function assertOsGovernanceEvidenceId(
  value: string,
): asserts value is OsGovernanceEvidenceId {
  if (!OS_GOVERNANCE_EVIDENCE_IDS.includes(value as OsGovernanceEvidenceId)) {
    throw new Error(
      "REVC-006: Runtime Evidence Consumption rejects unknown OS governance evidence.",
    );
  }
}

function assertNormalizedReferenceValue(value: string): void {
  if (value.trim().length === 0 || value !== value.trim()) {
    throw new Error(
      "REVC-011: Runtime Evidence Consumption rejects empty or non-normalized references.",
    );
  }
}


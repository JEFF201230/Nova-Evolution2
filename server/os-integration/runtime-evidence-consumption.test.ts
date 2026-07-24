import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeRuntimeTraceabilityLinks,
  createOsGovernanceEvidence,
  createOsGovernanceEvidenceFromRuntimeEvidence,
  createRuntimeEvidenceConsumptionEvidence,
  createRuntimeEvidenceConsumptionFacts,
  createRuntimeEvidenceConsumptionLinks,
  deriveRuntimeEvidenceConsumptionFacts,
  verifyRuntimeEvidenceConsumption,
} from "./runtime-evidence-consumption.js";
import {
  verifyOsIntegrationFoundation,
} from "./os-integration-foundation.js";
import {
  verifyRuntimeTraceabilityFoundation,
} from "../runtime/runtime-traceability/runtime-traceability.js";
import type {
  OsGovernanceEvidenceItem,
  RuntimeEvidenceConsumptionFact,
  RuntimeEvidenceConsumptionLink,
} from "./runtime-evidence-consumption.js";

const FACTS: readonly RuntimeEvidenceConsumptionFact[] = Object.freeze([
  Object.freeze({
    id: "runtime-traceability",
    sourceReference: "PROGRAM-004-RUNTIME-TRACEABILITY",
    ready: true,
  }),
  Object.freeze({
    id: "execution-engine",
    sourceReference: "PROGRAM-004-EXECUTION-ENGINE",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-core",
    sourceReference: "PROGRAM-004-RUNTIME-CORE",
    ready: true,
  }),
  Object.freeze({
    id: "agent-runtime",
    sourceReference: "PROGRAM-004-AGENT-RUNTIME",
    ready: true,
  }),
  Object.freeze({
    id: "workflow-runtime",
    sourceReference: "PROGRAM-004-WORKFLOW-RUNTIME",
    ready: true,
  }),
  Object.freeze({
    id: "mission-runtime",
    sourceReference: "PROGRAM-004-MISSION-RUNTIME",
    ready: true,
  }),
]);

const LINKS: readonly RuntimeEvidenceConsumptionLink[] = Object.freeze([
  Object.freeze({
    id: "certification-evidence-to-archive-readiness",
    from: "certification-evidence",
    to: "archive-readiness",
    sourceReference: "RUNTIME_ARCHITECTURE.md",
    ready: true,
  }),
  Object.freeze({
    id: "execution-evidence-to-certification-evidence",
    from: "execution-evidence",
    to: "certification-evidence",
    sourceReference: "TRACEABILITY_MODEL_SPECIFICATION.md",
    ready: true,
  }),
  Object.freeze({
    id: "execution-engine-to-execution-evidence",
    from: "execution-engine",
    to: "execution-evidence",
    sourceReference: "CAMPAIGN-014-EXECUTION-ENGINE-FOUNDATION",
    ready: true,
  }),
  Object.freeze({
    id: "agent-runtime-to-execution-engine",
    from: "agent-runtime",
    to: "execution-engine",
    sourceReference: "CAMPAIGN-013-AGENT-RUNTIME-FOUNDATION",
    ready: true,
  }),
  Object.freeze({
    id: "workflow-runtime-to-agent-runtime",
    from: "workflow-runtime",
    to: "agent-runtime",
    sourceReference: "CAMPAIGN-012-WORKFLOW-RUNTIME-FOUNDATION",
    ready: true,
  }),
  Object.freeze({
    id: "mission-runtime-to-workflow-runtime",
    from: "mission-runtime",
    to: "workflow-runtime",
    sourceReference: "CAMPAIGN-011-MISSION-RUNTIME-FOUNDATION",
    ready: true,
  }),
  Object.freeze({
    id: "runtime-core-to-mission-runtime",
    from: "runtime-core",
    to: "mission-runtime",
    sourceReference: "CAMPAIGN-010-RUNTIME-CORE",
    ready: true,
  }),
  Object.freeze({
    id: "mission-order-to-runtime-core",
    from: "mission-order-authority",
    to: "runtime-core",
    sourceReference: "P4-MO-012-RUNTIME-TRACEABILITY",
    ready: true,
  }),
]);

test("Runtime Evidence Consumption produces immutable OS governance evidence", () => {
  const result = verifyRuntimeEvidenceConsumption();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.dependencyCount, 2);
  assert.equal(result.evidence.readyDependencyCount, 2);
  assert.equal(result.evidence.factCount, 6);
  assert.equal(result.evidence.readyFactCount, 6);
  assert.equal(result.evidence.linkCount, 8);
  assert.equal(result.evidence.readyLinkCount, 8);
  assert.equal(result.evidence.governanceEvidenceCount, 5);
  assert.equal(result.evidence.readyGovernanceEvidenceCount, 5);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.facts), true);
  assert.equal(Object.isFrozen(result.evidence.links), true);
  assert.equal(Object.isFrozen(result.evidence.osGovernanceEvidence), true);
});

test("Runtime Evidence Consumption derives deterministic Runtime facts", () => {
  const runtimeTraceability = verifyRuntimeTraceabilityFoundation();
  const facts = deriveRuntimeEvidenceConsumptionFacts(runtimeTraceability.evidence);

  assert.deepEqual(facts.map((fact) => fact.id), [
    "runtime-core",
    "mission-runtime",
    "workflow-runtime",
    "agent-runtime",
    "execution-engine",
    "runtime-traceability",
  ]);
  assert.equal(facts.every((fact) => fact.ready), true);
});

test("Runtime Evidence Consumption preserves deterministic fact ordering", () => {
  const facts = createRuntimeEvidenceConsumptionFacts(FACTS);

  assert.deepEqual(facts.map((fact) => fact.id), [
    "runtime-core",
    "mission-runtime",
    "workflow-runtime",
    "agent-runtime",
    "execution-engine",
    "runtime-traceability",
  ]);
  assert.equal(Object.isFrozen(facts), true);
  assert.equal(Object.isFrozen(facts[0]), true);
});

test("Runtime Evidence Consumption preserves deterministic link ordering", () => {
  const links = createRuntimeEvidenceConsumptionLinks(LINKS);

  assert.deepEqual(links.map((link) => link.id), [
    "mission-order-to-runtime-core",
    "runtime-core-to-mission-runtime",
    "mission-runtime-to-workflow-runtime",
    "workflow-runtime-to-agent-runtime",
    "agent-runtime-to-execution-engine",
    "execution-engine-to-execution-evidence",
    "execution-evidence-to-certification-evidence",
    "certification-evidence-to-archive-readiness",
  ]);
});

test("Runtime Evidence Consumption consumes Runtime Traceability links", () => {
  const runtimeTraceability = verifyRuntimeTraceabilityFoundation();
  const links = consumeRuntimeTraceabilityLinks(runtimeTraceability.evidence.graph);

  assert.equal(links.length, 8);
  assert.equal(links.every((link) => link.ready), true);
  assert.equal(Object.isFrozen(links), true);
});

test("Runtime Evidence Consumption creates governance evidence from facts and links", () => {
  const governanceEvidence = createOsGovernanceEvidenceFromRuntimeEvidence(FACTS, LINKS);

  assert.deepEqual(governanceEvidence.map((item) => item.id), [
    "runtime-foundation-readiness",
    "traceability-coverage",
    "execution-evidence-readiness",
    "certification-evidence-readiness",
    "archive-readiness",
  ]);
  assert.equal(governanceEvidence.every((item) => item.ready), true);
});

test("Runtime Evidence Consumption reports not ready when Runtime facts are incomplete", () => {
  const osIntegrationFoundation = verifyOsIntegrationFoundation();
  const runtimeTraceability = verifyRuntimeTraceabilityFoundation();
  const links = consumeRuntimeTraceabilityLinks(runtimeTraceability.evidence.graph);
  const facts = createRuntimeEvidenceConsumptionFacts([
    {
      id: "runtime-core",
      sourceReference: "PROGRAM-004-RUNTIME-CORE",
      ready: true,
    },
  ]);
  const governanceEvidence = createOsGovernanceEvidenceFromRuntimeEvidence(facts, links);
  const evidence = createRuntimeEvidenceConsumptionEvidence(
    osIntegrationFoundation,
    runtimeTraceability,
    facts,
    links,
    governanceEvidence,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.factCount, 1);
  assert.equal(evidence.readyFactCount, 1);
  assert.equal(evidence.readyGovernanceEvidenceCount < evidence.governanceEvidenceCount, true);
});

test("Runtime Evidence Consumption rejects unknown Runtime facts", () => {
  assert.throws(
    () =>
      createRuntimeEvidenceConsumptionFacts([
        {
          id: "unknown-runtime-fact" as never,
          sourceReference: "UNKNOWN",
          ready: true,
        },
      ]),
    /^Error: REVC-001:/,
  );
});

test("Runtime Evidence Consumption rejects duplicate Runtime facts", () => {
  assert.throws(
    () =>
      createRuntimeEvidenceConsumptionFacts([
        {
          id: "runtime-core",
          sourceReference: "PROGRAM-004-RUNTIME-CORE",
          ready: true,
        },
        {
          id: "runtime-core",
          sourceReference: "PROGRAM-004-RUNTIME-CORE",
          ready: true,
        },
      ]),
    /^Error: REVC-002:/,
  );
});

test("Runtime Evidence Consumption rejects unknown Runtime Traceability links", () => {
  assert.throws(
    () =>
      createRuntimeEvidenceConsumptionLinks([
        {
          id: "unknown-link" as never,
          from: "runtime-core",
          to: "mission-runtime",
          sourceReference: "UNKNOWN",
          ready: true,
        },
      ]),
    /^Error: REVC-003:/,
  );
});

test("Runtime Evidence Consumption rejects duplicate Runtime Traceability links", () => {
  assert.throws(
    () =>
      createRuntimeEvidenceConsumptionLinks([
        {
          id: "runtime-core-to-mission-runtime",
          from: "runtime-core",
          to: "mission-runtime",
          sourceReference: "CAMPAIGN-010-RUNTIME-CORE",
          ready: true,
        },
        {
          id: "runtime-core-to-mission-runtime",
          from: "runtime-core",
          to: "mission-runtime",
          sourceReference: "CAMPAIGN-010-RUNTIME-CORE",
          ready: true,
        },
      ]),
    /^Error: REVC-004:/,
  );
});

test("Runtime Evidence Consumption rejects incoherent Runtime Traceability topology", () => {
  assert.throws(
    () =>
      createRuntimeEvidenceConsumptionLinks([
        {
          id: "runtime-core-to-mission-runtime",
          from: "mission-runtime",
          to: "runtime-core",
          sourceReference: "CAMPAIGN-010-RUNTIME-CORE",
          ready: true,
        },
      ]),
    /^Error: REVC-005:/,
  );
});

test("Runtime Evidence Consumption rejects unknown OS governance evidence", () => {
  assert.throws(
    () =>
      createOsGovernanceEvidence([
        {
          id: "unknown-governance-evidence" as never,
          sourceFactIds: ["runtime-core"],
          sourceLinkIds: ["mission-order-to-runtime-core"],
          ready: true,
        },
      ]),
    /^Error: REVC-006:/,
  );
});

test("Runtime Evidence Consumption rejects duplicate OS governance evidence", () => {
  const item: OsGovernanceEvidenceItem = {
    id: "runtime-foundation-readiness",
    sourceFactIds: ["runtime-core"],
    sourceLinkIds: ["mission-order-to-runtime-core"],
    ready: true,
  };

  assert.throws(
    () => createOsGovernanceEvidence([item, item]),
    /^Error: REVC-007:/,
  );
});

test("Runtime Evidence Consumption rejects non-normalized references", () => {
  assert.throws(
    () =>
      createRuntimeEvidenceConsumptionFacts([
        {
          id: "runtime-core",
          sourceReference: " PROGRAM-004-RUNTIME-CORE",
          ready: true,
        },
      ]),
    /^Error: REVC-011:/,
  );
});


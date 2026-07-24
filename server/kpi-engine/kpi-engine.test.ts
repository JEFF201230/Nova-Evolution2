import assert from "node:assert/strict";
import test from "node:test";
import {
  createKpiEngineComponents,
  createKpiEngineEvidence,
  verifyKpiEngine,
} from "./kpi-engine.js";
import type {
  KpiEngineComponent,
} from "./kpi-engine.js";
import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";
import {
  verifyRiskEngine,
} from "../risk-engine/risk-engine.js";

const COMPONENTS: readonly KpiEngineComponent[] = Object.freeze([
  Object.freeze({
    id: "residual-risk-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_CLOSURE_REPORT.md",
  }),
  Object.freeze({
    id: "certification-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_CERTIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "test-stability-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/CAMPAIGN_001_TEST_REPORT.md",
  }),
  Object.freeze({
    id: "campaign-closure-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/CAMPAIGN_001_RESULT.md",
  }),
  Object.freeze({
    id: "mission-closure-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/P11-MO-001_RESULT.md",
  }),
  Object.freeze({
    id: "program-completion-kpi",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_EVIDENCE_REPORT.md",
  }),
]);

test("KPI Engine verifies PROGRAM-011 readiness from Portfolio and Risk evidence", () => {
  const result = verifyKpiEngine();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.portfolioManagementPassed, true);
  assert.equal(result.evidence.riskEnginePassed, true);
  assert.equal(result.evidence.readyComponentCount, 6);
});

test("KPI Engine preserves deterministic component ordering", () => {
  const components = createKpiEngineComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "program-completion-kpi",
      "mission-closure-kpi",
      "campaign-closure-kpi",
      "test-stability-kpi",
      "certification-kpi",
      "residual-risk-kpi",
    ],
  );
});

test("KPI Engine reports not ready when Risk Engine is degraded", () => {
  const portfolioManagement = verifyPortfolioManagement();
  const riskEngine = verifyRiskEngine();
  const degradedRiskEngine = Object.freeze({
    passed: false,
    evidence: riskEngine.evidence,
  });
  const evidence = createKpiEngineEvidence(
    portfolioManagement,
    degradedRiskEngine,
    COMPONENTS,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.riskEnginePassed, false);
});

test("KPI Engine validates component inputs", () => {
  assert.throws(
    () =>
      createKpiEngineComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PKPI-002:/,
  );
  assert.throws(
    () =>
      createKpiEngineComponents([
        {
          id: "program-completion-kpi",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_EVIDENCE_REPORT.md",
        },
        {
          id: "program-completion-kpi",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-011_KPI_ENGINE/PROGRAM_011_EVIDENCE_REPORT.md",
        },
      ]),
    /^Error: PKPI-003:/,
  );
  assert.throws(
    () =>
      createKpiEngineComponents([
        {
          id: "program-completion-kpi",
          ready: true,
          evidenceReference: "",
        },
      ]),
    /^Error: PKPI-004:/,
  );
});

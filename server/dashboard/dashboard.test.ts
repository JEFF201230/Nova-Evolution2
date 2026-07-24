import assert from "node:assert/strict";
import test from "node:test";
import {
  createDashboardComponents,
  createDashboardEvidence,
  verifyDashboard,
} from "./dashboard.js";
import type {
  DashboardComponent,
} from "./dashboard.js";
import {
  verifyKpiEngine,
} from "../kpi-engine/kpi-engine.js";
import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";
import {
  verifyResourceManager,
} from "../resource-manager/resource-manager.js";
import {
  verifyRiskEngine,
} from "../risk-engine/risk-engine.js";
import {
  verifyScheduler,
} from "../scheduler/scheduler.js";

const COMPONENTS: readonly DashboardComponent[] = Object.freeze([
  Object.freeze({
    id: "certification-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_CERTIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "kpi-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/CAMPAIGN_001_TEST_REPORT.md",
  }),
  Object.freeze({
    id: "risk-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/CAMPAIGN_001_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "program-health-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/P12-MO-001_RESULT.md",
  }),
  Object.freeze({
    id: "roadmap-sequence-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_ROADMAP.md",
  }),
  Object.freeze({
    id: "portfolio-status-panel",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_EVIDENCE_REPORT.md",
  }),
]);

test("Dashboard verifies PROGRAM-012 readiness from operating governance services", () => {
  const result = verifyDashboard();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.portfolioManagementPassed, true);
  assert.equal(result.evidence.schedulerPassed, true);
  assert.equal(result.evidence.resourceManagerPassed, true);
  assert.equal(result.evidence.riskEnginePassed, true);
  assert.equal(result.evidence.kpiEnginePassed, true);
  assert.equal(result.evidence.readyComponentCount, 6);
});

test("Dashboard preserves deterministic component ordering", () => {
  const components = createDashboardComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "portfolio-status-panel",
      "roadmap-sequence-panel",
      "program-health-panel",
      "risk-status-panel",
      "kpi-status-panel",
      "certification-status-panel",
    ],
  );
});

test("Dashboard reports not ready when Resource Manager is degraded", () => {
  const portfolioManagement = verifyPortfolioManagement();
  const scheduler = verifyScheduler();
  const resourceManager = verifyResourceManager();
  const riskEngine = verifyRiskEngine();
  const kpiEngine = verifyKpiEngine();
  const degradedResourceManager = Object.freeze({
    passed: false,
    evidence: resourceManager.evidence,
  });
  const evidence = createDashboardEvidence(
    portfolioManagement,
    scheduler,
    degradedResourceManager,
    riskEngine,
    kpiEngine,
    COMPONENTS,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.resourceManagerPassed, false);
});

test("Dashboard validates component inputs", () => {
  assert.throws(
    () =>
      createDashboardComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PDASH-002:/,
  );
  assert.throws(
    () =>
      createDashboardComponents([
        {
          id: "portfolio-status-panel",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_EVIDENCE_REPORT.md",
        },
        {
          id: "portfolio-status-panel",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-012_DASHBOARD/PROGRAM_012_EVIDENCE_REPORT.md",
        },
      ]),
    /^Error: PDASH-003:/,
  );
  assert.throws(
    () =>
      createDashboardComponents([
        {
          id: "portfolio-status-panel",
          ready: true,
          evidenceReference: " ",
        },
      ]),
    /^Error: PDASH-004:/,
  );
});

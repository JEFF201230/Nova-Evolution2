import assert from "node:assert/strict";
import test from "node:test";
import {
  createFinalCertificationComponents,
  createFinalCertificationEvidence,
  verifyFinalCertification,
} from "./final-certification.js";
import type {
  FinalCertificationComponent,
} from "./final-certification.js";
import {
  verifyDashboard,
} from "../dashboard/dashboard.js";
import {
  verifyGovernanceCore,
} from "../governance/governance-core.js";
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

const COMPONENTS: readonly FinalCertificationComponent[] = Object.freeze([
  Object.freeze({
    id: "release-readiness",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_CLOSURE_REPORT.md",
  }),
  Object.freeze({
    id: "final-risk-acceptance",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "regression-test-evidence",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/CAMPAIGN_001_TEST_REPORT.md",
  }),
  Object.freeze({
    id: "service-certification-chain",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_CERTIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "governance-gate-closure",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-013_FINAL_CERTIFICATION/PROGRAM_013_GOVERNANCE.md",
  }),
  Object.freeze({
    id: "portfolio-completion",
    ready: true,
    evidenceReference: "Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md",
  }),
  Object.freeze({
    id: "master-plan-completion",
    ready: true,
    evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
  }),
]);

test("Final Certification verifies PROGRAM-013 readiness from certified governance services", () => {
  const result = verifyFinalCertification();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.governanceCorePassed, true);
  assert.equal(result.evidence.portfolioManagementPassed, true);
  assert.equal(result.evidence.schedulerPassed, true);
  assert.equal(result.evidence.resourceManagerPassed, true);
  assert.equal(result.evidence.riskEnginePassed, true);
  assert.equal(result.evidence.kpiEnginePassed, true);
  assert.equal(result.evidence.dashboardPassed, true);
  assert.equal(result.evidence.readyComponentCount, 7);
});

test("Final Certification preserves deterministic component ordering", () => {
  const components = createFinalCertificationComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "master-plan-completion",
      "portfolio-completion",
      "governance-gate-closure",
      "service-certification-chain",
      "regression-test-evidence",
      "final-risk-acceptance",
      "release-readiness",
    ],
  );
});

test("Final Certification reports not ready when Dashboard is degraded", () => {
  const governanceCore = verifyGovernanceCore();
  const portfolioManagement = verifyPortfolioManagement();
  const scheduler = verifyScheduler();
  const resourceManager = verifyResourceManager();
  const riskEngine = verifyRiskEngine();
  const kpiEngine = verifyKpiEngine();
  const dashboard = verifyDashboard();
  const degradedDashboard = Object.freeze({
    passed: false,
    evidence: dashboard.evidence,
  });
  const evidence = createFinalCertificationEvidence(
    governanceCore,
    portfolioManagement,
    scheduler,
    resourceManager,
    riskEngine,
    kpiEngine,
    degradedDashboard,
    COMPONENTS,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.dashboardPassed, false);
});

test("Final Certification validates component inputs", () => {
  assert.throws(
    () =>
      createFinalCertificationComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PFINAL-002:/,
  );
  assert.throws(
    () =>
      createFinalCertificationComponents([
        {
          id: "master-plan-completion",
          ready: true,
          evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
        },
        {
          id: "master-plan-completion",
          ready: true,
          evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
        },
      ]),
    /^Error: PFINAL-003:/,
  );
  assert.throws(
    () =>
      createFinalCertificationComponents([
        {
          id: "master-plan-completion",
          ready: true,
          evidenceReference: "",
        },
      ]),
    /^Error: PFINAL-004:/,
  );
});

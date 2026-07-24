import assert from "node:assert/strict";
import test from "node:test";
import {
  createRiskEngineComponents,
  createRiskEngineEvidence,
  verifyRiskEngine,
} from "./risk-engine.js";
import type {
  RiskEngineComponent,
} from "./risk-engine.js";
import {
  verifyGovernanceCore,
} from "../governance/governance-core.js";
import {
  verifyPortfolioManagement,
} from "../portfolio/portfolio-management.js";

const COMPONENTS: readonly RiskEngineComponent[] = Object.freeze([
  Object.freeze({
    id: "dependency-impossibility-control",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_CLOSURE_REPORT.md",
  }),
  Object.freeze({
    id: "scope-extension-control",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/CAMPAIGN_001_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "architecture-conflict-control",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_VERIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "stop-condition-evaluation",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_GOVERNANCE.md",
  }),
  Object.freeze({
    id: "risk-register",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_EVIDENCE_REPORT.md",
  }),
]);

test("Risk Engine verifies PROGRAM-010 readiness from Governance and Portfolio evidence", () => {
  const result = verifyRiskEngine();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.governanceCorePassed, true);
  assert.equal(result.evidence.portfolioManagementPassed, true);
  assert.equal(result.evidence.readyComponentCount, 5);
});

test("Risk Engine preserves deterministic component ordering", () => {
  const components = createRiskEngineComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "risk-register",
      "stop-condition-evaluation",
      "architecture-conflict-control",
      "scope-extension-control",
      "dependency-impossibility-control",
    ],
  );
});

test("Risk Engine reports not ready when a dependency is degraded", () => {
  const governanceCore = verifyGovernanceCore();
  const portfolioManagement = verifyPortfolioManagement();
  const degradedPortfolioManagement = Object.freeze({
    passed: false,
    evidence: portfolioManagement.evidence,
  });
  const evidence = createRiskEngineEvidence(
    governanceCore,
    degradedPortfolioManagement,
    COMPONENTS,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.portfolioManagementPassed, false);
});

test("Risk Engine validates component inputs", () => {
  assert.throws(
    () =>
      createRiskEngineComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PRISK-002:/,
  );
  assert.throws(
    () =>
      createRiskEngineComponents([
        {
          id: "risk-register",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_EVIDENCE_REPORT.md",
        },
        {
          id: "risk-register",
          ready: true,
          evidenceReference: "Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_EVIDENCE_REPORT.md",
        },
      ]),
    /^Error: PRISK-003:/,
  );
  assert.throws(
    () =>
      createRiskEngineComponents([
        {
          id: "risk-register",
          ready: true,
          evidenceReference: " Docs/19_PROGRAMS/PROGRAM-010_RISK_ENGINE/PROGRAM_010_EVIDENCE_REPORT.md",
        },
      ]),
    /^Error: PRISK-004:/,
  );
});

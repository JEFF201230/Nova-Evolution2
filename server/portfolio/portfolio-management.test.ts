import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createPortfolioManagementComponents,
  createPortfolioManagementEvidence,
  verifyPortfolioManagement,
} from "./portfolio-management.js";
import type {
  PortfolioManagementComponent,
} from "./portfolio-management.js";
import {
  verifyGovernanceCore,
} from "../governance/governance-core.js";

const COMPONENTS: readonly PortfolioManagementComponent[] = Object.freeze([
  Object.freeze({
    id: "governance-evidence-consumption",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-006_GOVERNANCE/PROGRAM_006_CERTIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "program-index-synchronization",
    ready: true,
    evidenceReference: "Docs/19_PROGRAMS/PROGRAM-007_PORTFOLIO/PROGRAM_007_PROGRAM_INDEX.md",
  }),
  Object.freeze({
    id: "board-decision-record",
    ready: true,
    evidenceReference: "Docs/20_NOVA_PORTFOLIO/PROGRAM_BOARD.md",
  }),
  Object.freeze({
    id: "dependency-sequencing",
    ready: true,
    evidenceReference: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
  }),
  Object.freeze({
    id: "portfolio-roadmap",
    ready: true,
    evidenceReference: "Docs/20_NOVA_PORTFOLIO/PORTFOLIO_ROADMAP.md",
  }),
  Object.freeze({
    id: "program-state-ledger",
    ready: true,
    evidenceReference: "Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md",
  }),
]);

test("Portfolio Management verifies PROGRAM-007 readiness from Governance Core", () => {
  const result = verifyPortfolioManagement();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.governanceCorePassed, true);
  assert.equal(result.evidence.readyComponentCount, 6);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.components), true);
});

test("Portfolio Management preserves deterministic component ordering", () => {
  const components = createPortfolioManagementComponents(COMPONENTS);

  assert.deepEqual(
    components.map((component) => component.id),
    [
      "program-state-ledger",
      "portfolio-roadmap",
      "dependency-sequencing",
      "board-decision-record",
      "program-index-synchronization",
      "governance-evidence-consumption",
    ],
  );
});

test("Portfolio Management reports not ready when Governance Core is degraded", () => {
  const governanceCore = verifyGovernanceCore();
  const degradedGovernanceCore = Object.freeze({
    passed: false,
    evidence: governanceCore.evidence,
  });
  const evidence = createPortfolioManagementEvidence(
    degradedGovernanceCore,
    COMPONENTS,
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.governanceCorePassed, false);
  assert.equal(evidence.readyComponentCount, 6);
});

test("Portfolio Management validates component inputs", () => {
  assert.throws(
    () =>
      createPortfolioManagementComponents([
        {
          id: "unknown" as never,
          ready: true,
          evidenceReference: "UNKNOWN",
        },
      ]),
    /^Error: PPORT-002:/,
  );
  assert.throws(
    () =>
      createPortfolioManagementComponents([
        {
          id: "program-state-ledger",
          ready: true,
          evidenceReference: "Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md",
        },
        {
          id: "program-state-ledger",
          ready: true,
          evidenceReference: "Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md",
        },
      ]),
    /^Error: PPORT-003:/,
  );
  assert.throws(
    () =>
      createPortfolioManagementComponents([
        {
          id: "program-state-ledger",
          ready: true,
          evidenceReference: " Docs/20_NOVA_PORTFOLIO/NOVA_PORTFOLIO_INDEX.md",
        },
      ]),
    /^Error: PPORT-004:/,
  );
});

test("Portfolio Management source does not import Runtime, Kernel, API, database, or UI paths", () => {
  const sourceDirectory = fileURLToPath(new URL(".", import.meta.url));
  const sourceFiles = readdirSync(sourceDirectory)
    .filter((fileName) => fileName.endsWith(".ts") && !fileName.endsWith(".test.ts"));

  assert.equal(sourceFiles.length > 0, true);

  for (const fileName of sourceFiles) {
    const source = readFileSync(join(sourceDirectory, fileName), "utf8");

    assert.equal(/from\s+["']\.\.\/runtime\//.test(source), false, `${basename(fileName)} must not import certified Runtime directly`);
    assert.equal(/from\s+["']\.\.\/runtime\/kernel\//.test(source), false, `${basename(fileName)} must not import Kernel paths`);
    assert.equal(/from\s+["'].*(?:api|database|db|ui|client)/i.test(source), false, `${basename(fileName)} must not introduce forbidden public surface dependencies`);
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  createCampaignGovernanceGate,
  createCampaignGovernanceGates,
  verifyCampaignGovernance,
} from "./campaign-governance.js";

const CAMPAIGN_GATES = Object.freeze([
  createCampaignGovernanceGate("result-recorded", true, "CAMPAIGN_001_RESULT.md"),
  createCampaignGovernanceGate("certification-go", true, "CAMPAIGN_001_CERTIFICATION_REPORT.md"),
  createCampaignGovernanceGate("verification-go", true, "CAMPAIGN_001_VERIFICATION_REPORT.md"),
  createCampaignGovernanceGate("tests-pass", true, "CAMPAIGN_001_TEST_REPORT.md"),
  createCampaignGovernanceGate("implementation-complete", true, "server/governance/governance-core.ts"),
  createCampaignGovernanceGate("forbidden-scope-absent", true, "CAMPAIGN_001_VERIFICATION_REPORT.md"),
  createCampaignGovernanceGate("scope-authorized", true, "CAMPAIGN_001_EXECUTION_REPORT.md"),
  createCampaignGovernanceGate("mission-order-issued", true, "P6-MO-001-GOVERNANCE-CORE.md"),
]);

test("Campaign Governance closes a campaign with complete gate evidence", () => {
  const evidence = verifyCampaignGovernance(
    "CAMPAIGN-001",
    "CLOSED",
    CAMPAIGN_GATES,
  );

  assert.equal(evidence.ready, true);
  assert.equal(evidence.gateCount, 8);
  assert.equal(evidence.readyGateCount, 8);
  assert.deepEqual(
    evidence.gates.map((gate) => gate.id),
    [
      "mission-order-issued",
      "scope-authorized",
      "forbidden-scope-absent",
      "implementation-complete",
      "tests-pass",
      "verification-go",
      "certification-go",
      "result-recorded",
    ],
  );
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.gates), true);
});

test("Campaign Governance permits campaign opening gates", () => {
  const evidence = verifyCampaignGovernance(
    "CAMPAIGN-001",
    "OPEN",
    [
      createCampaignGovernanceGate("mission-order-issued", true, "P6-MO-001-GOVERNANCE-CORE.md"),
      createCampaignGovernanceGate("scope-authorized", true, "CAMPAIGN_001_EXECUTION_REPORT.md"),
      createCampaignGovernanceGate("forbidden-scope-absent", true, "CAMPAIGN_001_VERIFICATION_REPORT.md"),
    ],
  );

  assert.equal(evidence.ready, true);
  assert.equal(evidence.requiredGateCount, 3);
});

test("Campaign Governance reports not ready when closed evidence is incomplete", () => {
  const evidence = verifyCampaignGovernance(
    "CAMPAIGN-001",
    "CLOSED",
    [
      createCampaignGovernanceGate("mission-order-issued", true, "P6-MO-001-GOVERNANCE-CORE.md"),
    ],
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.readyGateCount, 1);
});

test("Campaign Governance validates gate inputs", () => {
  assert.equal(createCampaignGovernanceGates(CAMPAIGN_GATES)[0].id, "mission-order-issued");
  assert.throws(
    () =>
      createCampaignGovernanceGates([
        createCampaignGovernanceGate("mission-order-issued", true, "P6-MO-001-GOVERNANCE-CORE.md"),
        createCampaignGovernanceGate("mission-order-issued", true, "P6-MO-001-GOVERNANCE-CORE.md"),
      ]),
    /^Error: PGOV-CAMP-003:/,
  );
  assert.throws(
    () =>
      createCampaignGovernanceGate(
        "unknown-gate" as never,
        true,
        "P6-MO-001-GOVERNANCE-CORE.md",
      ),
    /^Error: PGOV-CAMP-002:/,
  );
  assert.throws(
    () =>
      verifyCampaignGovernance(
        "",
        "CLOSED",
        CAMPAIGN_GATES,
      ),
    /^Error: PGOV-CAMP-004:/,
  );
});

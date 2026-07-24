import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createGovernanceApprovalRecord,
  verifyGovernanceApprovalWorkflow,
} from "./approval-workflow.js";
import {
  createCampaignGovernanceGate,
  verifyCampaignGovernance,
} from "./campaign-governance.js";
import {
  createGovernanceDecisionRecord,
  verifyGovernanceDecisionWorkflow,
} from "./decision-workflow.js";
import {
  createGovernanceCoreEvidence,
  createGovernanceCoreSourceReferences,
  verifyGovernanceCore,
  verifyGovernanceCoreComposition,
} from "./governance-core.js";
import {
  createMissionOrderGovernanceGate,
  verifyMissionOrderGovernance,
} from "./mission-order-governance.js";
import {
  createProgramLifecycleGate,
  verifyProgramLifecycleTransition,
} from "./program-lifecycle.js";
import {
  createMissionControlCapability,
} from "../os-integration/mission-control-capability.js";
import {
  verifyRuntimeEvidenceConsumption,
} from "../os-integration/runtime-evidence-consumption.js";
import type {
  GovernanceCoreComponent,
  GovernanceCoreSourceReference,
} from "./governance-core.js";

const SOURCE_REFERENCES: readonly GovernanceCoreSourceReference[] = Object.freeze([
  Object.freeze({
    id: "program-006-program-index",
    value: "Docs/19_PROGRAMS/PROGRAM-006_GOVERNANCE/PROGRAM_006_PROGRAM_INDEX.md",
  }),
  Object.freeze({
    id: "program-006-charter",
    value: "Docs/19_PROGRAMS/PROGRAM-006_GOVERNANCE/PROGRAM_006_CHARTER.md",
  }),
  Object.freeze({
    id: "program-005-certified-capability",
    value: "Docs/19_PROGRAMS/PROGRAM-005_OPERATING_SYSTEM_CAPABILITY_INTEGRATION/CAMPAIGN_005_CERTIFICATION_REPORT.md",
  }),
  Object.freeze({
    id: "nova-delivery-squad-standard",
    value: "Docs/00_GOVERNANCE/NOVA_DELIVERY_SQUAD_STANDARD.md",
  }),
  Object.freeze({
    id: "program-delivery-squad-standard",
    value: "Docs/00_GOVERNANCE/PROGRAM_DELIVERY_SQUAD_STANDARD.md",
  }),
  Object.freeze({
    id: "program-board",
    value: "Docs/20_NOVA_PORTFOLIO/PROGRAM_BOARD.md",
  }),
  Object.freeze({
    id: "nova-master-plan",
    value: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
  }),
]);

const COMPONENTS: readonly GovernanceCoreComponent[] = Object.freeze([
  Object.freeze({
    id: "mission-control-capability",
    ready: true,
  }),
  Object.freeze({
    id: "program-005-evidence-consumption",
    ready: true,
  }),
  Object.freeze({
    id: "campaign-governance",
    ready: true,
  }),
  Object.freeze({
    id: "mission-order-governance",
    ready: true,
  }),
  Object.freeze({
    id: "program-lifecycle",
    ready: true,
  }),
  Object.freeze({
    id: "decision-workflow",
    ready: true,
  }),
  Object.freeze({
    id: "approval-workflow",
    ready: true,
  }),
  Object.freeze({
    id: "source-authority",
    ready: true,
  }),
]);

test("Governance Core verifies PROGRAM-006 readiness from certified PROGRAM-005 evidence", () => {
  const result = verifyGovernanceCore();

  assert.equal(result.passed, true);
  assert.equal(result.evidence.ready, true);
  assert.equal(result.evidence.approvals.ready, true);
  assert.equal(result.evidence.decisions.ready, true);
  assert.equal(result.evidence.programLifecycle.ready, true);
  assert.equal(result.evidence.missionOrderGovernance.ready, true);
  assert.equal(result.evidence.campaignGovernance.ready, true);
  assert.equal(result.evidence.runtimeEvidenceConsumption.ready, true);
  assert.deepEqual(result.evidence.missionControlCapability, {
    missionOrderStatus: "COMPLETE",
    campaignStatus: "CLOSED",
    certificationStatus: "GO",
    dependencyStatus: "PROGRAM-005: COMPLETE",
    runtimeEvidenceStatus: "AVAILABLE",
    traceabilityStatus: "READY",
  });
  assert.equal(result.evidence.composition.ready, true);
  assert.equal(result.evidence.composition.readyComponentCount, 8);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.evidence), true);
  assert.equal(Object.isFrozen(result.evidence.sourceReferences), true);
  assert.equal(Object.isFrozen(result.evidence.composition.components), true);
});

test("Governance Core preserves deterministic source and component ordering", () => {
  const references = createGovernanceCoreSourceReferences(SOURCE_REFERENCES);
  const composition = verifyGovernanceCoreComposition(COMPONENTS);

  assert.deepEqual(
    references.map((reference) => reference.id),
    [
      "nova-master-plan",
      "program-board",
      "program-delivery-squad-standard",
      "nova-delivery-squad-standard",
      "program-005-certified-capability",
      "program-006-charter",
      "program-006-program-index",
    ],
  );
  assert.deepEqual(
    composition.components.map((component) => component.id),
    [
      "source-authority",
      "approval-workflow",
      "decision-workflow",
      "program-lifecycle",
      "mission-order-governance",
      "campaign-governance",
      "program-005-evidence-consumption",
      "mission-control-capability",
    ],
  );
});

test("Governance Core reports not ready when PROGRAM-005 evidence is degraded", () => {
  const approvals = verifyGovernanceApprovalWorkflow([
    createGovernanceApprovalRecord("A", "program-board", "program-activation", "APPROVED", "PROGRAM_006_CHARTER.md"),
    createGovernanceApprovalRecord("B", "program-board", "mission-order-issue", "APPROVED", "P6-MO-001-GOVERNANCE-CORE.md"),
    createGovernanceApprovalRecord("C", "program-delivery-squad", "campaign-open", "APPROVED", "CAMPAIGN_001_EXECUTION_REPORT.md"),
    createGovernanceApprovalRecord("D", "program-board", "program-closure", "APPROVED", "PROGRAM_006_CLOSURE_REPORT.md"),
  ]);
  const decisions = verifyGovernanceDecisionWorkflow([
    createGovernanceDecisionRecord("A", "program-lifecycle", "GO", "PROGRAM_006_VERIFICATION_REPORT.md"),
    createGovernanceDecisionRecord("B", "mission-order-governance", "GO", "P6-MO-001_VERIFICATION_REPORT.md"),
    createGovernanceDecisionRecord("C", "campaign-governance", "GO", "CAMPAIGN_001_VERIFICATION_REPORT.md"),
    createGovernanceDecisionRecord("D", "approval-workflow", "GO", "PROGRAM_006_CERTIFICATION_REPORT.md"),
    createGovernanceDecisionRecord("E", "closure-certification", "GO", "PROGRAM_006_CERTIFICATION_REPORT.md"),
  ]);
  const lifecycle = verifyProgramLifecycleTransition("ACTIVE", "COMPLETE", [
    createProgramLifecycleGate("program-board-approval", true, "PROGRAM_006_CHARTER.md"),
    createProgramLifecycleGate("charter-active", true, "PROGRAM_006_CHARTER.md"),
    createProgramLifecycleGate("dependencies-complete", true, "PROGRAM_005_ROADMAP.md"),
    createProgramLifecycleGate("mission-orders-complete", true, "P6-MO-001_RESULT.md"),
    createProgramLifecycleGate("campaigns-closed", true, "CAMPAIGN_001_RESULT.md"),
    createProgramLifecycleGate("tests-pass", true, "CAMPAIGN_001_TEST_REPORT.md"),
    createProgramLifecycleGate("certification-go", true, "PROGRAM_006_CERTIFICATION_REPORT.md"),
    createProgramLifecycleGate("closure-approved", true, "PROGRAM_006_CLOSURE_REPORT.md"),
  ]);
  const mission = verifyMissionOrderGovernance("P6-MO-001", "COMPLETE", [
    createMissionOrderGovernanceGate("program-active", true, "PROGRAM_006_CHARTER.md"),
    createMissionOrderGovernanceGate("program-board-approval", true, "P6-MO-001-GOVERNANCE-CORE.md"),
    createMissionOrderGovernanceGate("scope-bounded", true, "P6-MO-001-GOVERNANCE-CORE.md"),
    createMissionOrderGovernanceGate("campaigns-closed", true, "CAMPAIGN_001_RESULT.md"),
    createMissionOrderGovernanceGate("execution-evidence", true, "CAMPAIGN_001_EXECUTION_REPORT.md"),
    createMissionOrderGovernanceGate("verification-go", true, "P6-MO-001_VERIFICATION_REPORT.md"),
    createMissionOrderGovernanceGate("certification-go", true, "P6-MO-001_CERTIFICATION_REPORT.md"),
    createMissionOrderGovernanceGate("result-produced", true, "P6-MO-001_RESULT.md"),
  ]);
  const campaign = verifyCampaignGovernance("CAMPAIGN-001", "CLOSED", [
    createCampaignGovernanceGate("mission-order-issued", true, "P6-MO-001-GOVERNANCE-CORE.md"),
    createCampaignGovernanceGate("scope-authorized", true, "CAMPAIGN_001_EXECUTION_REPORT.md"),
    createCampaignGovernanceGate("forbidden-scope-absent", true, "CAMPAIGN_001_VERIFICATION_REPORT.md"),
    createCampaignGovernanceGate("implementation-complete", true, "server/governance/governance-core.ts"),
    createCampaignGovernanceGate("tests-pass", true, "CAMPAIGN_001_TEST_REPORT.md"),
    createCampaignGovernanceGate("verification-go", true, "CAMPAIGN_001_VERIFICATION_REPORT.md"),
    createCampaignGovernanceGate("certification-go", true, "CAMPAIGN_001_CERTIFICATION_REPORT.md"),
    createCampaignGovernanceGate("result-recorded", true, "CAMPAIGN_001_RESULT.md"),
  ]);
  const runtimeEvidence = verifyRuntimeEvidenceConsumption();
  const degradedRuntimeEvidence = Object.freeze({
    passed: false,
    evidence: runtimeEvidence.evidence,
  });
  const evidence = createGovernanceCoreEvidence(
    SOURCE_REFERENCES,
    approvals,
    decisions,
    lifecycle,
    mission,
    campaign,
    degradedRuntimeEvidence,
    createMissionControlCapability(
      "COMPLETE",
      "CLOSED",
      "GO",
      "PROGRAM-005: COMPLETE",
      "AVAILABLE",
      "READY",
    ),
    verifyGovernanceCoreComposition(COMPONENTS),
  );

  assert.equal(evidence.ready, false);
  assert.equal(evidence.runtimeEvidenceConsumption.ready, true);
});

test("Governance Core validates source and component inputs", () => {
  assert.throws(
    () =>
      createGovernanceCoreSourceReferences([
        {
          id: "unknown-source" as never,
          value: "UNKNOWN",
        },
      ]),
    /^Error: PGOV-CORE-001:/,
  );
  assert.throws(
    () =>
      createGovernanceCoreSourceReferences([
        {
          id: "nova-master-plan",
          value: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
        },
        {
          id: "nova-master-plan",
          value: "Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
        },
      ]),
    /^Error: PGOV-CORE-002:/,
  );
  assert.throws(
    () =>
      verifyGovernanceCoreComposition([
        {
          id: "public-api" as never,
          ready: true,
        },
      ]),
    /^Error: PGOV-CORE-003:/,
  );
  assert.throws(
    () =>
      createGovernanceCoreSourceReferences([
        {
          id: "nova-master-plan",
          value: " Docs/00_NOVA_FOUNDATION/NOVA_MASTER_PLAN.md",
        },
      ]),
    /^Error: PGOV-CORE-005:/,
  );
});

test("Governance Core source does not import Runtime, Kernel, API, database, or UI paths", () => {
  const governanceDirectory = fileURLToPath(new URL(".", import.meta.url));
  const sourceFiles = readdirSync(governanceDirectory)
    .filter((fileName) => fileName.endsWith(".ts") && !fileName.endsWith(".test.ts"));

  assert.equal(sourceFiles.length > 0, true);

  for (const fileName of sourceFiles) {
    const source = readFileSync(join(governanceDirectory, fileName), "utf8");

    assert.equal(
      /from\s+["']\.\.\/runtime\//.test(source),
      false,
      `${basename(fileName)} must not import certified Runtime directly`,
    );
    assert.equal(
      /from\s+["']\.\.\/runtime\/kernel\//.test(source),
      false,
      `${basename(fileName)} must not import Kernel paths`,
    );
    assert.equal(
      /from\s+["'].*(?:api|database|db|ui|client)/i.test(source),
      false,
      `${basename(fileName)} must not introduce forbidden public surface dependencies`,
    );
  }
});

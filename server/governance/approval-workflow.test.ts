import assert from "node:assert/strict";
import test from "node:test";
import {
  createGovernanceApprovalRecord,
  verifyGovernanceApprovalWorkflow,
} from "./approval-workflow.js";

const APPROVALS = Object.freeze([
  createGovernanceApprovalRecord(
    "CLOSURE",
    "program-board",
    "program-closure",
    "APPROVED",
    "PROGRAM_006_CLOSURE_REPORT.md",
  ),
  createGovernanceApprovalRecord(
    "CAMPAIGN",
    "program-delivery-squad",
    "campaign-open",
    "APPROVED",
    "CAMPAIGN_001_EXECUTION_REPORT.md",
  ),
  createGovernanceApprovalRecord(
    "MISSION",
    "program-board",
    "mission-order-issue",
    "APPROVED",
    "P6-MO-001-GOVERNANCE-CORE.md",
  ),
  createGovernanceApprovalRecord(
    "ACTIVATION",
    "program-board",
    "program-activation",
    "APPROVED",
    "PROGRAM_006_CHARTER.md",
  ),
]);

test("Approval Workflow verifies all required approvals", () => {
  const evidence = verifyGovernanceApprovalWorkflow(APPROVALS);

  assert.equal(evidence.ready, true);
  assert.equal(evidence.subjectCount, 4);
  assert.equal(evidence.requiredSubjectCount, 4);
  assert.equal(evidence.approvedSubjectCount, 4);
  assert.deepEqual(
    evidence.records.map((record) => record.subject),
    [
      "program-activation",
      "mission-order-issue",
      "campaign-open",
      "program-closure",
    ],
  );
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.records), true);
  assert.equal(Object.isFrozen(evidence.records[0]), true);
});

test("Approval Workflow reports not ready when a decision is not approved", () => {
  const evidence = verifyGovernanceApprovalWorkflow([
    createGovernanceApprovalRecord(
      "ACTIVATION",
      "program-board",
      "program-activation",
      "DEFERRED",
      "PROGRAM_006_CHARTER.md",
    ),
  ]);

  assert.equal(evidence.ready, false);
  assert.equal(evidence.approvedSubjectCount, 0);
});

test("Approval Workflow rejects duplicate subjects", () => {
  assert.throws(
    () =>
      verifyGovernanceApprovalWorkflow([
        createGovernanceApprovalRecord(
          "A",
          "program-board",
          "program-activation",
          "APPROVED",
          "PROGRAM_006_CHARTER.md",
        ),
        createGovernanceApprovalRecord(
          "B",
          "program-board",
          "program-activation",
          "APPROVED",
          "PROGRAM_006_CHARTER.md",
        ),
      ]),
    /^Error: PGOV-APPR-003:/,
  );
});

test("Approval Workflow rejects unauthorized authorities", () => {
  assert.throws(
    () =>
      verifyGovernanceApprovalWorkflow([
        createGovernanceApprovalRecord(
          "CAMPAIGN",
          "program-board",
          "campaign-open",
          "APPROVED",
          "CAMPAIGN_001_EXECUTION_REPORT.md",
        ),
      ]),
    /^Error: PGOV-APPR-004:/,
  );
});

test("Approval Workflow rejects unknown subjects and non-normalized values", () => {
  assert.throws(
    () =>
      createGovernanceApprovalRecord(
        "UNKNOWN",
        "program-board",
        "unknown-subject" as never,
        "APPROVED",
        "PROGRAM_006_CHARTER.md",
      ),
    /^Error: PGOV-APPR-002:/,
  );
  assert.throws(
    () =>
      createGovernanceApprovalRecord(
        " BAD",
        "program-board",
        "program-activation",
        "APPROVED",
        "PROGRAM_006_CHARTER.md",
      ),
    /^Error: PGOV-APPR-006:/,
  );
});
